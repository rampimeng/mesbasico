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
      .select('*, stop_reasons(name, excludeFromPareto)')
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
      const excludeFromPareto = log.stop_reasons?.excludeFromPareto || false;
      const duration = log.durationSeconds || 0;

      // Skip reasons that should be excluded from Pareto
      if (excludeFromPareto) {
        console.log(`⏭️ Skipping reason (excludeFromPareto=true):`, { reasonId, reasonName });
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

// Get time metrics - production time, stop time, OEE weighted by matrices
export const getTimeMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('⏱️ Fetching time metrics with OEE calculation:', { companyId, startDate, endDate });

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

    // Get unique machine IDs from time logs
    const uniqueMachineIds = [...new Set((timeLogs || []).map(log => log.machineId))];

    // Fetch machine data to get number of matrices
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, numberOfMatrices')
      .eq('companyId', companyId)
      .in('id', uniqueMachineIds);

    if (machinesError) {
      console.error('❌ Error fetching machines:', machinesError);
      return res.status(500).json({
        success: false,
        error: machinesError.message,
      });
    }

    // Create a map of machineId -> effective number of matrices (min 1)
    const machineMatricesMap = new Map<string, number>();
    for (const machine of machines || []) {
      const effectiveMatrices = machine.numberOfMatrices || 1; // If 0, treat as 1
      machineMatricesMap.set(machine.id, effectiveMatrices);
    }

    console.log('🏭 Machine matrices map:', Object.fromEntries(machineMatricesMap));

    // Calculate OEE-weighted metrics
    let weightedProductionTime = 0; // Σ(tempo_ativo_matriz_i)
    let weightedStopTime = 0; // Σ(tempo_parado_matriz_i)
    let totalPossibleMatrixTime = 0; // n_matrizes × tempo_total
    const stopTimeByReason: Record<string, { reasonId: string; reasonName: string; duration: number }> = {};

    // Group logs by machine and calculate total time per machine
    const machineTimeRanges = new Map<string, { earliest: Date; latest: Date }>();

    for (const log of timeLogs || []) {
      if (!log.startedAt) continue;

      const startedAt = new Date(log.startedAt);
      const endedAt = log.endedAt ? new Date(log.endedAt) : new Date();

      const range = machineTimeRanges.get(log.machineId);
      if (!range) {
        machineTimeRanges.set(log.machineId, { earliest: startedAt, latest: endedAt });
      } else {
        if (startedAt < range.earliest) range.earliest = startedAt;
        if (endedAt > range.latest) range.latest = endedAt;
      }
    }

    // Calculate total possible matrix time
    for (const [machineId, range] of machineTimeRanges) {
      const machineMatrices = machineMatricesMap.get(machineId) || 1;
      const machineTotalTime = Math.floor((range.latest.getTime() - range.earliest.getTime()) / 1000);
      totalPossibleMatrixTime += machineMatrices * machineTotalTime;

      console.log(`📊 Machine ${machineId}: ${machineMatrices} matrices × ${machineTotalTime}s = ${machineMatrices * machineTotalTime}s possible`);
    }

    // Calculate weighted times
    for (const log of timeLogs || []) {
      const duration = log.durationSeconds || 0;
      if (duration === 0) continue;

      const machineMatrices = machineMatricesMap.get(log.machineId) || 1;

      // If log has matrixId, it's for a single matrix
      // If no matrixId, it's for the entire machine (all matrices)
      const matricesAffected = log.matrixId ? 1 : machineMatrices;

      if (log.status === 'NORMAL_RUNNING') {
        weightedProductionTime += duration * matricesAffected;
      } else if (log.status === 'STOPPED' || log.status === 'EMERGENCY') {
        weightedStopTime += duration * matricesAffected;

        if (log.stopReasonId) {
          const reasonId = log.stopReasonId;
          const reasonName = log.stopReasonName || 'Desconhecido';

          if (stopTimeByReason[reasonId]) {
            stopTimeByReason[reasonId].duration += duration * matricesAffected;
          } else {
            stopTimeByReason[reasonId] = {
              reasonId,
              reasonName,
              duration: duration * matricesAffected,
            };
          }
        }
      }
    }

    // Calculate OEE (Disponibilidade Efetiva)
    const oeeAvailability = totalPossibleMatrixTime > 0
      ? (weightedProductionTime / totalPossibleMatrixTime) * 100
      : 0;

    // Calculate traditional efficiency for comparison
    const totalWeightedTime = weightedProductionTime + weightedStopTime;
    const traditionalEfficiency = totalWeightedTime > 0
      ? (weightedProductionTime / totalWeightedTime) * 100
      : 0;

    console.log('✅ OEE-weighted metrics calculated:', {
      weightedProductionTime,
      weightedStopTime,
      totalPossibleMatrixTime,
      oeeAvailability: oeeAvailability.toFixed(2) + '%',
      traditionalEfficiency: traditionalEfficiency.toFixed(2) + '%',
    });

    res.json({
      success: true,
      data: {
        totalProductionTime: weightedProductionTime,
        totalStopTime: weightedStopTime,
        totalTime: totalPossibleMatrixTime,
        efficiency: Math.round(oeeAvailability * 100) / 100, // Using OEE as efficiency
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
