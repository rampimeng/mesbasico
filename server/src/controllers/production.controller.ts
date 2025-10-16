import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Start a production session
export const startSession = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { machineId } = req.body;

    console.log('🎬 Starting production session:', { companyId, userId, machineId });

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
        operatorId: userId,
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
        currentOperatorId: userId,
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
        operatorId: userId,
        status: 'NORMAL_RUNNING',
        startedAt: new Date().toISOString(),
      });

    if (logError) {
      console.error('❌ Error creating time log:', logError);
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
    const { machineId, status, stopReasonId } = req.body;

    console.log('🔄 Updating machine status:', { machineId, status, stopReasonId });

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
      .eq('operatorId', userId)
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

    // End previous time log
    const { data: openLogs } = await supabase
      .from('time_logs')
      .select('*')
      .eq('sessionId', activeSession.id)
      .is('endedAt', null);

    if (openLogs && openLogs.length > 0) {
      for (const log of openLogs) {
        const endedAt = new Date();
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('time_logs')
          .update({
            endedAt: endedAt.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);
      }
    }

    // Create new time log
    const { error: logError } = await supabase
      .from('time_logs')
      .insert({
        companyId,
        sessionId: activeSession.id,
        machineId,
        operatorId: userId,
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
    const { matrixId, machineId, matrixNumber, status, stopReasonId } = req.body;

    console.log('🔄 Updating matrix status:', { matrixId, machineId, matrixNumber, status, stopReasonId });

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
      .eq('operatorId', userId)
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

    // End previous time log for this matrix
    const { data: openLogs } = await supabase
      .from('time_logs')
      .select('*')
      .eq('sessionId', activeSession.id)
      .eq('matrixId', matrixId)
      .is('endedAt', null);

    if (openLogs && openLogs.length > 0) {
      for (const log of openLogs) {
        const endedAt = new Date();
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('time_logs')
          .update({
            endedAt: endedAt.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);
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
        operatorId: userId,
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
    const { machineId, matrixId } = req.body;

    console.log('🔄 Recording cycle:', { machineId, matrixId });

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
      .eq('operatorId', userId)
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
        operatorId: userId,
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

// End production session
export const endSession = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;
    const { machineId } = req.body;

    console.log('🛑 Ending production session:', { machineId });

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
      .eq('operatorId', userId)
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

    // End all open time logs
    const { data: openLogs } = await supabase
      .from('time_logs')
      .select('*')
      .eq('sessionId', activeSession.id)
      .is('endedAt', null);

    if (openLogs && openLogs.length > 0) {
      for (const log of openLogs) {
        const endedAt = new Date();
        const startedAt = new Date(log.startedAt);
        const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);

        await supabase
          .from('time_logs')
          .update({
            endedAt: endedAt.toISOString(),
            durationSeconds,
          })
          .eq('id', log.id);
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
