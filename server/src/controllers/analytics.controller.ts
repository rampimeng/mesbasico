import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get Pareto data - stop reasons by duration
export const getParetoData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('📊 Fetching Pareto data:', { companyId, startDate, endDate, groupIds, machineIds, operatorIds });

    // Build query
    let query = supabase
      .from('time_logs')
      .select('*, stop_reasons(name, ignoreInPareto)')
      .eq('companyId', companyId)
      .in('status', ['STOPPED', 'EMERGENCY'])
      .not('stopReasonId', 'is', null);

    // Apply filters
    if (startDate) {
      query = query.gte('startedAt', startDate as string);
    }
    if (endDate) {
      query = query.lte('startedAt', endDate as string);
    }
    if (groupIds && (groupIds as string).length > 0) {
      const groupIdArray = (groupIds as string).split(',');
      // Need to join with machines to filter by groupId
      // For now, we'll filter on frontend or use a different approach
    }
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      query = query.in('machineId', machineIdArray);
    }
    if (operatorIds && (operatorIds as string).length > 0) {
      const operatorIdArray = (operatorIds as string).split(',');
      query = query.in('operatorId', operatorIdArray);
    }

    const { data: timeLogs, error } = await query;

    if (error) {
      console.error('❌ Error fetching time logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log(`📋 Found ${timeLogs?.length || 0} time logs with STOPPED/EMERGENCY status`);

    // Debug: show first few logs
    if (timeLogs && timeLogs.length > 0) {
      console.log('🔍 Sample logs:', timeLogs.slice(0, 3).map(log => ({
        status: log.status,
        stopReasonId: log.stopReasonId,
        stopReasonName: log.stopReasonName,
        durationSeconds: log.durationSeconds,
        startedAt: log.startedAt,
        endedAt: log.endedAt,
      })));
    }

    // Aggregate by stop reason
    const reasonMap = new Map<string, { reasonId: string; reasonName: string; duration: number }>();

    for (const log of timeLogs || []) {
      const reasonId = log.stopReasonId;
      const reasonName = log.stop_reasons?.name || log.stopReasonName || 'Desconhecido';
      const ignoreInPareto = log.stop_reasons?.ignoreInPareto || false;
      const duration = log.durationSeconds || 0;

      // Skip reasons that should be ignored in Pareto
      if (ignoreInPareto) {
        console.log(`⏭️ Skipping reason (ignoreInPareto=true):`, { reasonId, reasonName });
        continue;
      }

      if (duration > 0) {
        if (reasonMap.has(reasonId)) {
          const existing = reasonMap.get(reasonId)!;
          existing.duration += duration;
        } else {
          reasonMap.set(reasonId, {
            reasonId,
            reasonName,
            duration,
          });
        }
      } else {
        console.log(`⚠️ Skipping log with 0 duration:`, { reasonId, reasonName, status: log.status });
      }
    }

    // Convert to array and sort by duration (descending)
    const paretoData = Array.from(reasonMap.values())
      .sort((a, b) => b.duration - a.duration);

    // Calculate percentages and cumulative
    const totalDuration = paretoData.reduce((sum, item) => sum + item.duration, 0);
    let cumulative = 0;

    const result = paretoData.map((item) => {
      const percentage = totalDuration > 0 ? (item.duration / totalDuration) * 100 : 0;
      cumulative += percentage;
      return {
        reasonId: item.reasonId,
        reasonName: item.reasonName,
        duration: item.duration,
        percentage: Math.round(percentage * 100) / 100,
        cumulativePercentage: Math.round(cumulative * 100) / 100,
      };
    });

    console.log('✅ Pareto data calculated:', result.length, 'reasons');

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('❌ Exception in getParetoData:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Pareto data',
    });
  }
};

// Get time metrics - production time, stop time, etc.
export const getTimeMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('⏱️ Fetching time metrics:', { companyId, startDate, endDate });

    // Build query
    let query = supabase
      .from('time_logs')
      .select('*')
      .eq('companyId', companyId);

    // Apply filters
    if (startDate) {
      query = query.gte('startedAt', startDate as string);
    }
    if (endDate) {
      query = query.lte('startedAt', endDate as string);
    }
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      query = query.in('machineId', machineIdArray);
    }
    if (operatorIds && (operatorIds as string).length > 0) {
      const operatorIdArray = (operatorIds as string).split(',');
      query = query.in('operatorId', operatorIdArray);
    }

    const { data: timeLogs, error } = await query;

    if (error) {
      console.error('❌ Error fetching time logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Calculate metrics
    let totalProductionTime = 0;
    let totalStopTime = 0;
    const stopTimeByReason: Record<string, { reasonId: string; reasonName: string; duration: number }> = {};

    for (const log of timeLogs || []) {
      const duration = log.durationSeconds || 0;

      if (log.status === 'NORMAL_RUNNING') {
        totalProductionTime += duration;
      } else if (log.status === 'STOPPED' || log.status === 'EMERGENCY') {
        totalStopTime += duration;

        if (log.stopReasonId) {
          const reasonId = log.stopReasonId;
          const reasonName = log.stopReasonName || 'Desconhecido';

          if (stopTimeByReason[reasonId]) {
            stopTimeByReason[reasonId].duration += duration;
          } else {
            stopTimeByReason[reasonId] = {
              reasonId,
              reasonName,
              duration,
            };
          }
        }
      }
    }

    const totalTime = totalProductionTime + totalStopTime;
    const efficiency = totalTime > 0 ? (totalProductionTime / totalTime) * 100 : 0;

    console.log('✅ Time metrics calculated');

    res.json({
      success: true,
      data: {
        totalProductionTime,
        totalStopTime,
        totalTime,
        efficiency: Math.round(efficiency * 100) / 100,
        stopTimeByReason: Object.values(stopTimeByReason),
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getTimeMetrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch time metrics',
    });
  }
};

// Get cycle metrics - completed vs target
export const getCycleMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('🔄 Fetching cycle metrics:', { companyId, startDate, endDate });

    // Build query for cycle logs
    let query = supabase
      .from('cycle_logs')
      .select('*')
      .eq('companyId', companyId);

    // Apply filters
    if (startDate) {
      query = query.gte('cycleCompletedAt', startDate as string);
    }
    if (endDate) {
      query = query.lte('cycleCompletedAt', endDate as string);
    }
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      query = query.in('machineId', machineIdArray);
    }
    if (operatorIds && (operatorIds as string).length > 0) {
      const operatorIdArray = (operatorIds as string).split(',');
      query = query.in('operatorId', operatorIdArray);
    }

    const { data: cycleLogs, error } = await query;

    if (error) {
      console.error('❌ Error fetching cycle logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    const completedCycles = cycleLogs?.length || 0;

    // For now, we'll set target as 0 (should be calculated based on standard cycle time and available time)
    // TODO: Implement target calculation based on machine standard cycle time
    const targetCycles = 0;

    const percentage = targetCycles > 0 ? (completedCycles / targetCycles) * 100 : 0;

    console.log('✅ Cycle metrics calculated:', completedCycles, 'cycles');

    res.json({
      success: true,
      data: {
        completedCycles,
        targetCycles,
        percentage: Math.round(percentage * 100) / 100,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getCycleMetrics:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cycle metrics',
    });
  }
};
