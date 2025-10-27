import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { getOrCreateShiftEndReason } from '../utils/ensureSystemStopReasons';

// Start a production session
export const startSession = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { machineId, operatorId } = req.body;

    // Use provided operatorId (for Admin/Supervisor monitoring) or logged-in userId (for Operator)
    const effectiveOperatorId = operatorId || userId;

    console.log('🎬 Starting production session:', { companyId, userId, machineId, effectiveOperatorId });

    if (!machineId) {
      return res.status(400).json({
        success: false,
        error: 'Machine ID is required',
      });
    }

    // Create production session
    const { data: session, error: sessionError } = await supabase
      .from('production_sessions')
      .insert({
        companyId,
        machineId,
        operatorId: effectiveOperatorId,
        active: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('❌ Error creating session:', sessionError);
      return res.status(400).json({
        success: false,
        error: sessionError.message,
      });
    }

    // Update machine status
    const { error: machineError } = await supabase
      .from('machines')
      .update({
        status: 'NORMAL_RUNNING',
        currentOperatorId: effectiveOperatorId,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', machineId)
      .eq('companyId', companyId);

    if (machineError) {
      console.error('❌ Error updating machine:', machineError);
    }

    // Create initial time log
    const { error: logError } = await supabase
      .from('time_logs')
      .insert({
        companyId,
        sessionId: session.id,
        machineId,
        operatorId: effectiveOperatorId,
        status: 'NORMAL_RUNNING',
        startedAt: new Date().toISOString(),
      });

    if (logError) {
      console.error('❌ Error creating time log:', logError);
    }

    // Start all matrices for this machine
    console.log(`🔍 Fetching matrices for machineId=${machineId}`);
    const { data: matrices, error: matricesError } = await supabase
      .from('matrices')
      .select('id')
      .eq('machineId', machineId);

    if (matricesError) {
      console.error('❌ Error fetching matrices:', matricesError);
    }

    console.log(`📊 Query result: Found ${matrices?.length || 0} matrices`);

    if (matrices && matrices.length > 0) {
      console.log(`🔢 Starting ${matrices.length} matrices for machine ${machineId}`);

      for (const matrix of matrices) {
        const { error: matrixError } = await supabase
          .from('matrices')
          .update({
            status: 'RUNNING',
            updatedAt: new Date().toISOString(),
          })
          .eq('id', matrix.id);

        if (matrixError) {
          console.error(`❌ Error starting matrix ${matrix.id}:`, matrixError);
        } else {
          console.log(`✅ Matrix ${matrix.id} started successfully`);
        }
      }

      console.log(`✅ Started ${matrices.length} matrices`);
    } else {
      console.log(`⚠️ No matrices found for machine ${machineId} - skipping matrix initialization`);
    }

    console.log('✅ Session started successfully:', session.id);

    res.status(201).json({
      success: true,
      data: session,
      message: 'Production session started successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in startSession:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start production session',
    });
  }
};

// Update machine status
export const updateMachineStatus = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { machineId, status, stopReasonId, operatorId } = req.body;

    // Use provided operatorId (for Admin/Supervisor monitoring) or logged-in userId (for Operator)
    const effectiveOperatorId = operatorId || userId;

    console.log('🔄 Updating machine status:', { machineId, status, stopReasonId, effectiveOperatorId });

    if (!machineId || !status) {
      return res.status(400).json({
        success: false,
        error: 'Machine ID and status are required',
      });
    }

    // Get active session
    const { data: sessions } = await supabase
      .from('production_sessions')
      .select('*')
      .eq('machineId', machineId)
      .eq('operatorId', effectiveOperatorId)
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(1);

    const activeSession = sessions?.[0];

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        error: 'No active session found for this machine',
      });
    }

    // End previous time logs (including all matrix-specific logs)
    const { data: openLogs } = await supabase
      .from('time_logs')
      .select('*')
      .eq('sessionId', activeSession.id)
      .eq('machineId', machineId)
      .is('endedAt', null);

    if (openLogs && openLogs.length > 0) {
      const now = new Date();
      console.log(`🔄 Closing ${openLogs.length} open time log(s) for machine ${machineId}`);

      for (const log of openLogs) {
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('time_logs')
          .update({
            endedAt: now.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);

        console.log(`✅ Closed time log ${log.id} - Status: ${log.status}, Matrix: ${log.matrixId || 'N/A'}, Duration: ${durationSeconds}s`);
      }
    }

    // Create new time log
    const { error: logError } = await supabase
      .from('time_logs')
      .insert({
        companyId,
        sessionId: activeSession.id,
        machineId,
        operatorId: effectiveOperatorId,
        status,
        stopReasonId: status === 'STOPPED' || status === 'EMERGENCY' ? stopReasonId : null,
        startedAt: new Date().toISOString(),
      });

    if (logError) {
      console.error('❌ Error creating time log:', logError);
    }

    // Update machine status
    const { error: machineError } = await supabase
      .from('machines')
      .update({
        status,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', machineId)
      .eq('companyId', companyId);

    if (machineError) {
      console.error('❌ Error updating machine:', machineError);
    }

    console.log('✅ Machine status updated successfully');

    res.json({
      success: true,
      message: 'Machine status updated successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in updateMachineStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update machine status',
    });
  }
};

// Update matrix status
export const updateMatrixStatus = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { matrixId, machineId, matrixNumber, status, stopReasonId, operatorId } = req.body;

    // Use provided operatorId (for Admin/Supervisor monitoring) or logged-in userId (for Operator)
    const effectiveOperatorId = operatorId || userId;

    console.log('🔄 Updating matrix status:', { matrixId, machineId, matrixNumber, status, stopReasonId, effectiveOperatorId });

    if (!machineId || !matrixNumber || !status) {
      return res.status(400).json({
        success: false,
        error: 'Machine ID, matrix number, and status are required',
      });
    }

    // Get active session
    const { data: sessions } = await supabase
      .from('production_sessions')
      .select('*')
      .eq('machineId', machineId)
      .eq('operatorId', effectiveOperatorId)
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(1);

    const activeSession = sessions?.[0];

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        error: 'No active session found for this machine',
      });
    }

    // End previous time logs for this matrix
    // This includes both matrix-specific logs AND machine-wide logs (when entire machine was stopped)
    const { data: openLogs } = await supabase
      .from('time_logs')
      .select('*')
      .eq('sessionId', activeSession.id)
      .eq('machineId', machineId)
      .is('endedAt', null)
      .or(`matrixId.eq.${matrixId},matrixId.is.null`);

    if (openLogs && openLogs.length > 0) {
      const now = new Date();
      for (const log of openLogs) {
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('time_logs')
          .update({
            endedAt: now.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);

        console.log(`✅ Closed time log ${log.id} for matrix ${matrixId} with duration ${durationSeconds}s`);
      }
    }

    // Create new time log for matrix
    const { error: logError } = await supabase
      .from('time_logs')
      .insert({
        companyId,
        sessionId: activeSession.id,
        machineId,
        matrixId,
        matrixNumber,
        operatorId: effectiveOperatorId,
        status,
        stopReasonId: status === 'STOPPED' ? stopReasonId : null,
        startedAt: new Date().toISOString(),
      });

    if (logError) {
      console.error('❌ Error creating time log:', logError);
    }

    console.log('✅ Matrix status updated successfully');

    res.json({
      success: true,
      message: 'Matrix status updated successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in updateMatrixStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update matrix status',
    });
  }
};

// Record a completed cycle
export const recordCycle = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { machineId, matrixId, operatorId } = req.body;

    // Use provided operatorId (for Admin/Supervisor monitoring) or logged-in userId (for Operator)
    const effectiveOperatorId = operatorId || userId;

    console.log('🔄 Recording cycle:', { machineId, matrixId, effectiveOperatorId });

    if (!machineId) {
      return res.status(400).json({
        success: false,
        error: 'Machine ID is required',
      });
    }

    // Get active session
    const { data: sessions } = await supabase
      .from('production_sessions')
      .select('*')
      .eq('machineId', machineId)
      .eq('operatorId', effectiveOperatorId)
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(1);

    const activeSession = sessions?.[0];

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        error: 'No active session found for this machine',
      });
    }

    // Record cycle
    const { data: cycle, error: cycleError } = await supabase
      .from('cycle_logs')
      .insert({
        companyId,
        sessionId: activeSession.id,
        machineId,
        matrixId: matrixId || null,
        operatorId: effectiveOperatorId,
        cycleCompletedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (cycleError) {
      console.error('❌ Error recording cycle:', cycleError);
      return res.status(400).json({
        success: false,
        error: cycleError.message,
      });
    }

    console.log('✅ Cycle recorded successfully:', cycle.id);

    res.status(201).json({
      success: true,
      data: cycle,
      message: 'Cycle recorded successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in recordCycle:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to record cycle',
    });
  }
};

// Get today's first shift start time for the operator
export const getTodayShiftStart = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;

    // Get today's date range in São Paulo timezone
    const now = new Date();
    const saoPauloOffset = -3 * 60; // UTC-3 in minutes
    const localOffset = now.getTimezoneOffset();
    const saoPauloTime = new Date(now.getTime() + (localOffset + saoPauloOffset) * 60000);

    // Start of today in São Paulo
    const startOfDay = new Date(saoPauloTime);
    startOfDay.setHours(0, 0, 0, 0);

    // End of today in São Paulo
    const endOfDay = new Date(saoPauloTime);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🕐 Fetching today shift start:', {
      userId,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Get first session of the day
    const { data: sessions, error } = await supabase
      .from('production_sessions')
      .select('startedAt')
      .eq('companyId', companyId)
      .eq('operatorId', userId)
      .gte('startedAt', startOfDay.toISOString())
      .lte('startedAt', endOfDay.toISOString())
      .order('startedAt', { ascending: true })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching shift start:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    const firstSession = sessions?.[0];

    res.json({
      success: true,
      data: {
        shiftStartTime: firstSession?.startedAt || null,
        currentTime: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getTodayShiftStart:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch shift start time',
    });
  }
};

// Get today's shift start time for a specific operator (for monitoring)
export const getOperatorShiftStart = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { operatorId } = req.params;

    // Get today's date range in São Paulo timezone
    const now = new Date();
    const saoPauloOffset = -3 * 60; // UTC-3 in minutes
    const localOffset = now.getTimezoneOffset();
    const saoPauloTime = new Date(now.getTime() + (localOffset + saoPauloOffset) * 60000);

    // Start of today in São Paulo
    const startOfDay = new Date(saoPauloTime);
    startOfDay.setHours(0, 0, 0, 0);

    // End of today in São Paulo
    const endOfDay = new Date(saoPauloTime);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('🕐 Fetching operator shift start:', {
      operatorId,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Get first session of the day for this operator
    const { data: sessions, error } = await supabase
      .from('production_sessions')
      .select('startedAt')
      .eq('companyId', companyId)
      .eq('operatorId', operatorId)
      .gte('startedAt', startOfDay.toISOString())
      .lte('startedAt', endOfDay.toISOString())
      .order('startedAt', { ascending: true })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching operator shift start:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    const firstSession = sessions?.[0];

    res.json({
      success: true,
      data: {
        shiftStartTime: firstSession?.startedAt || null,
        currentTime: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getOperatorShiftStart:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch operator shift start time',
    });
  }
};

// End production session
export const endSession = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { machineId, operatorId } = req.body;

    // Use provided operatorId (for Admin/Supervisor monitoring) or logged-in userId (for Operator)
    const effectiveOperatorId = operatorId || userId;

    console.log('🛑 Ending production session:', { machineId, effectiveOperatorId });

    if (!machineId) {
      return res.status(400).json({
        success: false,
        error: 'Machine ID is required',
      });
    }

    // Get active session
    const { data: sessions } = await supabase
      .from('production_sessions')
      .select('*')
      .eq('machineId', machineId)
      .eq('operatorId', effectiveOperatorId)
      .eq('active', true)
      .order('createdAt', { ascending: false })
      .limit(1);

    const activeSession = sessions?.[0];

    if (!activeSession) {
      return res.status(400).json({
        success: false,
        error: 'No active session found for this machine',
      });
    }

    // End all open time logs (closing shift)
    const { data: openLogs } = await supabase
      .from('time_logs')
      .select('*')
      .eq('sessionId', activeSession.id)
      .is('endedAt', null);

    if (openLogs && openLogs.length > 0) {
      const now = new Date();
      console.log(`🔄 Closing ${openLogs.length} open time log(s) for session ${activeSession.id} (shift end)`);

      for (const log of openLogs) {
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('time_logs')
          .update({
            endedAt: now.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);

        console.log(`✅ Closed time log ${log.id} - Status: ${log.status}, Matrix: ${log.matrixId || 'N/A'}, Duration: ${durationSeconds}s`);
      }
    }

    // End session
    const { error: sessionError } = await supabase
      .from('production_sessions')
      .update({
        active: false,
        endedAt: new Date().toISOString(),
      })
      .eq('id', activeSession.id);

    if (sessionError) {
      console.error('❌ Error ending session:', sessionError);
      return res.status(400).json({
        success: false,
        error: sessionError.message,
      });
    }

    // Update machine status to IDLE
    const { error: machineError } = await supabase
      .from('machines')
      .update({
        status: 'IDLE',
        currentOperatorId: null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', machineId)
      .eq('companyId', companyId);

    if (machineError) {
      console.error('❌ Error updating machine:', machineError);
    }

    // Stop all matrices for this machine
    console.log(`🔍 Stopping matrices for machineId=${machineId}`);
    const { data: matrices, error: matricesStopError } = await supabase
      .from('matrices')
      .update({
        status: 'STOPPED',
        updatedAt: new Date().toISOString(),
      })
      .eq('machineId', machineId)
      .select();

    if (matricesStopError) {
      console.error('❌ Error stopping matrices:', matricesStopError);
    } else {
      console.log(`✅ Stopped ${matrices?.length || 0} matrices for machine ${machineId}`);
    }

    console.log('✅ Session ended successfully');

    res.json({
      success: true,
      message: 'Production session ended successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in endSession:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to end production session',
    });
  }
};

// Get shift end stop reason ID (creates if doesn't exist)
export const getShiftEndReasonId = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('🔍 Getting shift end reason for company:', companyId);

    // Get or create the "Turno Encerrado" reason
    const reasonId = await getOrCreateShiftEndReason(companyId);

    console.log('✅ Shift end reason ID:', reasonId);

    res.json({
      success: true,
      data: {
        shiftEndReasonId: reasonId,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getShiftEndReasonId:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get shift end reason',
    });
  }
};

// Get total active time for today (accumulated across all sessions)
// Get machine active time for today
export const getMachineActiveTime = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { machineId } = req.params;

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    console.log('⏱️ Fetching machine active time:', { machineId, startOfDay: startOfDay.toISOString() });

    // Get ONLY time logs that STARTED today (reset daily at midnight)
    const { data: logs, error } = await supabase
      .from('time_logs')
      .select('startedAt, endedAt, durationSeconds')
      .eq('companyId', companyId)
      .eq('machineId', machineId)
      .eq('status', 'NORMAL_RUNNING')
      .gte('startedAt', startOfDay.toISOString())
      .order('startedAt', { ascending: true });

    if (error) {
      console.error('❌ Error fetching machine time logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    let totalActiveSeconds = 0;
    let currentRunStart: Date | null = null;

    if (logs && logs.length > 0) {
      for (const log of logs) {
        if (log.endedAt) {
          // Completed log - use stored duration
          totalActiveSeconds += log.durationSeconds || 0;
          console.log(`📊 Completed log: ${log.durationSeconds}s`);
        } else {
          // Active log - save start time (frontend will calculate current duration)
          currentRunStart = new Date(log.startedAt);
          console.log(`📊 Active log: start=${log.startedAt}`);
        }
      }
    }

    console.log(`✅ Machine ${machineId} active time today: ${totalActiveSeconds}s`);

    res.json({
      success: true,
      data: {
        totalActiveSeconds,
        currentRunStart: currentRunStart?.toISOString() || null,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getMachineActiveTime:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch machine active time',
    });
  }
};

// Get total active time for today (accumulated across all sessions)
// Close all active sessions at end of day (to be called by cron or manually)
export const closeAllActiveSessions = async (req: Request, res: Response) => {
  try {
    console.log('🌙 Closing all active sessions for end of day...');

    // Get all active production sessions
    const { data: activeSessions, error: sessionsError } = await supabase
      .from('production_sessions')
      .select('id, companyId, machineId, operatorId')
      .eq('active', true);

    if (sessionsError) {
      console.error('❌ Error fetching active sessions:', sessionsError);
      return res.status(500).json({
        success: false,
        error: sessionsError.message,
      });
    }

    if (!activeSessions || activeSessions.length === 0) {
      console.log('✅ No active sessions to close');
      return res.json({
        success: true,
        message: 'No active sessions to close',
        closedCount: 0,
      });
    }

    console.log(`📋 Found ${activeSessions.length} active sessions to close`);

    let closedCount = 0;
    let errorCount = 0;

    const now = new Date().toISOString();

    // Get or create "Turno Encerrado" reason
    const shiftEndReason = await getOrCreateShiftEndReason(activeSessions[0].companyId);

    for (const session of activeSessions) {
      try {
        // 1. Close any active time logs for this session
        // First, get active logs to calculate duration
        const { data: activeLogs } = await supabase
          .from('time_logs')
          .select('id, startedAt')
          .eq('sessionId', session.id)
          .is('endedAt', null);

        if (activeLogs && activeLogs.length > 0) {
          for (const log of activeLogs) {
            const start = new Date(log.startedAt);
            const end = new Date(now);
            const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);

            const { error: timeLogError } = await supabase
              .from('time_logs')
              .update({
                endedAt: now,
                durationSeconds,
              })
              .eq('id', log.id);

            if (timeLogError) {
              console.error(`❌ Error closing time log ${log.id}:`, timeLogError);
            }
          }
        }

        // 2. Close the production session
        const { error: sessionError } = await supabase
          .from('production_sessions')
          .update({
            endedAt: now,
            active: false,
          })
          .eq('id', session.id);

        if (sessionError) {
          console.error(`❌ Error closing session ${session.id}:`, sessionError);
          errorCount++;
          continue;
        }

        // 3. Update machine status to IDLE
        const { error: machineError } = await supabase
          .from('machines')
          .update({
            status: 'IDLE',
            currentOperatorId: null,
            updatedAt: now,
          })
          .eq('id', session.machineId);

        if (machineError) {
          console.error(`❌ Error updating machine ${session.machineId}:`, machineError);
        }

        // 4. Stop all matrices for this machine
        const { data: matrices, error: matricesError } = await supabase
          .from('matrices')
          .update({
            status: 'STOPPED',
            updatedAt: now,
          })
          .eq('machineId', session.machineId)
          .select();

        if (matricesError) {
          console.error(`❌ Error stopping matrices for machine ${session.machineId}:`, matricesError);
        } else {
          console.log(`✅ Stopped ${matrices?.length || 0} matrices for machine ${session.machineId}`);
        }

        closedCount++;
        console.log(`✅ Closed session ${session.id} for machine ${session.machineId}`);
      } catch (error: any) {
        console.error(`❌ Exception closing session ${session.id}:`, error);
        errorCount++;
      }
    }

    console.log(`🌙 End of day closure complete: ${closedCount} sessions closed, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Closed ${closedCount} active sessions`,
      closedCount,
      errorCount,
    });
  } catch (error: any) {
    console.error('❌ Exception in closeAllActiveSessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to close active sessions',
    });
  }
};

// Get total active time for today (accumulated across all sessions)
export const getTodayActiveTime = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;

    // Get today's date range - simplified approach
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('⏱️ Fetching total active time for today:', {
      userId,
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    // Get all production sessions of the day for this user
    const { data: sessions, error } = await supabase
      .from('production_sessions')
      .select('startedAt, endedAt')
      .eq('companyId', companyId)
      .eq('operatorId', userId)
      .gte('startedAt', startOfDay.toISOString())
      .lte('startedAt', endOfDay.toISOString())
      .order('startedAt', { ascending: true });

    if (error) {
      console.error('❌ Error fetching sessions:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    let totalActiveSeconds = 0;
    let currentSessionStart: Date | null = null;

    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        const sessionStart = new Date(session.startedAt);
        const sessionEnd = session.endedAt ? new Date(session.endedAt) : now;

        const durationSeconds = Math.floor((sessionEnd.getTime() - sessionStart.getTime()) / 1000);
        totalActiveSeconds += durationSeconds;

        // If session is still active (no endedAt), save the start time
        if (!session.endedAt) {
          currentSessionStart = sessionStart;
        }

        console.log(`📊 Session: ${sessionStart.toISOString()} -> ${session.endedAt || 'active'}, Duration: ${durationSeconds}s`);
      }
    }

    console.log(`✅ Total active time today: ${totalActiveSeconds}s (${Math.floor(totalActiveSeconds / 3600)}h ${Math.floor((totalActiveSeconds % 3600) / 60)}m)`);

    res.json({
      success: true,
      data: {
        totalActiveSeconds,
        currentSessionStart: currentSessionStart?.toISOString() || null,
        sessionsCount: sessions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getTodayActiveTime:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch active time',
    });
  }
};

// Get active operators (operators with active production sessions)
export const getActiveOperators = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('👥 Getting active operators for company:', companyId);

    // Get all active production sessions with operator and user information
    const { data: activeSessions, error } = await supabase
      .from('production_sessions')
      .select(`
        id,
        operatorId,
        machineId,
        startedAt,
        users!production_sessions_operatorId_fkey (
          id,
          name,
          email
        )
      `)
      .eq('companyId', companyId)
      .eq('active', true)
      .is('endedAt', null);

    if (error) {
      console.error('❌ Error fetching active sessions:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Extract unique operator IDs from active sessions
    const activeOperatorIds = [...new Set((activeSessions || []).map(session => session.operatorId))];

    console.log('✅ Active operators:', activeOperatorIds);

    res.json({
      success: true,
      data: {
        activeOperatorIds,
        sessionCount: activeSessions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getActiveOperators:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get active operators',
    });
  }
};
