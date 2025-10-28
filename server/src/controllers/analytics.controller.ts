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

    // Handle groupIds filter by fetching machines in those groups first
    let machineIdsToFilter: string[] = [];
    if (groupIds && (groupIds as string).length > 0) {
      const groupIdArray = (groupIds as string).split(',');
      const { data: groupMachines } = await supabase
        .from('machines')
        .select('id')
        .eq('companyId', companyId)
        .eq('active', true)
        .in('groupId', groupIdArray);

      machineIdsToFilter = (groupMachines || []).map(m => m.id);
      console.log(`🔍 Filtering by groups ${groupIdArray}: found ${machineIdsToFilter.length} machines`);
    }

    // Apply machineIds filter (merge with groupIds filter if both exist)
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      if (machineIdsToFilter.length > 0) {
        // Intersect: only machines that are both in the group AND in the machineIds filter
        machineIdsToFilter = machineIdsToFilter.filter(id => machineIdArray.includes(id));
      } else {
        machineIdsToFilter = machineIdArray;
      }
    }

    // Apply the final machine filter if we have any
    if (machineIdsToFilter.length > 0) {
      query = query.in('machineId', machineIdsToFilter);
    } else if (groupIds && (groupIds as string).length > 0) {
      // If groupIds was specified but no machines found, return empty
      query = query.in('machineId', ['00000000-0000-0000-0000-000000000000']); // No matches
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

    // Get unique machine IDs to fetch matrix counts
    const uniqueMachineIds = [...new Set((timeLogs || []).map(log => log.machineId))];

    // Fetch machine data to get number of matrices (only active machines)
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, numberOfMatrices')
      .eq('companyId', companyId)
      .eq('active', true)
      .in('id', uniqueMachineIds);

    if (machinesError) {
      console.error('❌ Error fetching machines:', machinesError);
      return res.status(500).json({
        success: false,
        error: machinesError.message,
      });
    }

    // Create machine map with matrix counts
    const machineMap = new Map<string, { name: string; numberOfMatrices: number }>();
    for (const machine of machines || []) {
      machineMap.set(machine.id, {
        name: machine.name,
        numberOfMatrices: machine.numberOfMatrices || 1,
      });
    }

    console.log('🏭 Machine matrices map for Pareto:', Object.fromEntries(machineMap));

    // Aggregate by stop reason with weighted duration
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
        const machineInfo = machineMap.get(log.machineId);
        if (!machineInfo) {
          console.log(`⚠️ Machine not found for log:`, { machineId: log.machineId });
          continue;
        }

        // Calculate weighted duration (consider if it affects all matrices or just one)
        const matricesAffected = log.matrixId ? 1 : machineInfo.numberOfMatrices;
        const weightedDuration = duration * matricesAffected;

        if (reasonMap.has(reasonId)) {
          const existing = reasonMap.get(reasonId)!;
          existing.duration += weightedDuration;
        } else {
          reasonMap.set(reasonId, {
            reasonId,
            reasonName,
            duration: weightedDuration,
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

    // Handle groupIds filter by fetching machines in those groups first
    let machineIdsToFilter: string[] = [];
    if (groupIds && (groupIds as string).length > 0) {
      const groupIdArray = (groupIds as string).split(',');
      const { data: groupMachines } = await supabase
        .from('machines')
        .select('id')
        .eq('companyId', companyId)
        .eq('active', true)
        .in('groupId', groupIdArray);

      machineIdsToFilter = (groupMachines || []).map(m => m.id);
      console.log(`🔍 [TimeMetrics] Filtering by groups ${groupIdArray}: found ${machineIdsToFilter.length} machines`);
    }

    // Apply machineIds filter (merge with groupIds filter if both exist)
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      if (machineIdsToFilter.length > 0) {
        machineIdsToFilter = machineIdsToFilter.filter(id => machineIdArray.includes(id));
      } else {
        machineIdsToFilter = machineIdArray;
      }
    }

    // Apply the final machine filter if we have any
    if (machineIdsToFilter.length > 0) {
      query = query.in('machineId', machineIdsToFilter);
    } else if (groupIds && (groupIds as string).length > 0) {
      query = query.in('machineId', ['00000000-0000-0000-0000-000000000000']);
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

    // Fetch machine data to get number of matrices (only active machines)
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, numberOfMatrices')
      .eq('companyId', companyId)
      .eq('active', true)
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

// Get OEE detailed data for export
export const getOEEDetailedData = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('📊 Fetching OEE detailed data:', { companyId, startDate, endDate, groupIds, machineIds, operatorIds });

    // Build query for time logs
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

    // Handle groupIds filter by fetching machines in those groups first
    let machineIdsToFilter: string[] = [];
    if (groupIds && (groupIds as string).length > 0) {
      const groupIdArray = (groupIds as string).split(',');
      const { data: groupMachines } = await supabase
        .from('machines')
        .select('id')
        .eq('companyId', companyId)
        .eq('active', true)
        .in('groupId', groupIdArray);

      machineIdsToFilter = (groupMachines || []).map(m => m.id);
      console.log(`🔍 [OEEDetailed] Filtering by groups ${groupIdArray}: found ${machineIdsToFilter.length} machines`);
    }

    // Apply machineIds filter (merge with groupIds filter if both exist)
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      if (machineIdsToFilter.length > 0) {
        machineIdsToFilter = machineIdsToFilter.filter(id => machineIdArray.includes(id));
      } else {
        machineIdsToFilter = machineIdArray;
      }
    }

    // Apply the final machine filter if we have any
    if (machineIdsToFilter.length > 0) {
      query = query.in('machineId', machineIdsToFilter);
    } else if (groupIds && (groupIds as string).length > 0) {
      query = query.in('machineId', ['00000000-0000-0000-0000-000000000000']);
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

    // Get unique machine IDs
    const uniqueMachineIds = [...new Set((timeLogs || []).map(log => log.machineId))];

    // Fetch machine data (only active machines)
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, numberOfMatrices')
      .eq('companyId', companyId)
      .eq('active', true)
      .in('id', uniqueMachineIds);

    if (machinesError) {
      console.error('❌ Error fetching machines:', machinesError);
      return res.status(500).json({
        success: false,
        error: machinesError.message,
      });
    }

    // Create machine map
    const machineMap = new Map<string, { name: string; numberOfMatrices: number }>();
    for (const machine of machines || []) {
      machineMap.set(machine.id, {
        name: machine.name,
        numberOfMatrices: machine.numberOfMatrices || 1,
      });
    }

    // Calculate detailed metrics per machine
    const machineDetails: any[] = [];
    const machineStats = new Map<string, any>();

    // Initialize machine stats
    for (const [machineId, machineInfo] of machineMap) {
      machineStats.set(machineId, {
        machineId,
        machineName: machineInfo.name,
        numberOfMatrices: machineInfo.numberOfMatrices,
        totalTime: 0,
        productionTime: 0,
        stopTime: 0,
        matrixStats: new Map<number, { productionTime: number; stopTime: number }>(),
        earliest: null as Date | null,
        latest: null as Date | null,
      });
    }

    // Process logs
    for (const log of timeLogs || []) {
      if (!log.startedAt) continue;

      const stats = machineStats.get(log.machineId);
      if (!stats) continue;

      const startedAt = new Date(log.startedAt);
      const endedAt = log.endedAt ? new Date(log.endedAt) : new Date();
      const duration = log.durationSeconds || 0;

      // Update time range
      if (!stats.earliest || startedAt < stats.earliest) stats.earliest = startedAt;
      if (!stats.latest || endedAt > stats.latest) stats.latest = endedAt;

      const machineInfo = machineMap.get(log.machineId)!;
      const matricesAffected = log.matrixId ? 1 : machineInfo.numberOfMatrices;

      // Update totals
      if (log.status === 'NORMAL_RUNNING') {
        stats.productionTime += duration * matricesAffected;
      } else if (log.status === 'STOPPED' || log.status === 'EMERGENCY') {
        stats.stopTime += duration * matricesAffected;
      }

      // Update matrix-specific stats
      if (log.matrixNumber) {
        if (!stats.matrixStats.has(log.matrixNumber)) {
          stats.matrixStats.set(log.matrixNumber, { productionTime: 0, stopTime: 0 });
        }
        const matrixStat = stats.matrixStats.get(log.matrixNumber)!;
        if (log.status === 'NORMAL_RUNNING') {
          matrixStat.productionTime += duration;
        } else if (log.status === 'STOPPED' || log.status === 'EMERGENCY') {
          matrixStat.stopTime += duration;
        }
      }
    }

    // Calculate summary and machine details
    let totalProductionTime = 0;
    let totalStopTime = 0;
    let totalPossibleTime = 0;

    for (const [machineId, stats] of machineStats) {
      if (!stats.earliest || !stats.latest) continue;

      const machineTotalTime = Math.floor((stats.latest.getTime() - stats.earliest.getTime()) / 1000);
      const possibleTime = stats.numberOfMatrices * machineTotalTime;

      stats.totalTime = possibleTime;
      totalProductionTime += stats.productionTime;
      totalStopTime += stats.stopTime;
      totalPossibleTime += possibleTime;

      const machineOEE = possibleTime > 0 ? (stats.productionTime / possibleTime) * 100 : 0;

      // Build matrix details
      const matrixDetails: any[] = [];
      for (let i = 1; i <= stats.numberOfMatrices; i++) {
        const matrixStat = stats.matrixStats.get(i) || { productionTime: 0, stopTime: 0 };
        const matrixTotal = matrixStat.productionTime + matrixStat.stopTime;
        const utilization = matrixTotal > 0 ? (matrixStat.productionTime / matrixTotal) * 100 : 0;

        matrixDetails.push({
          matrixNumber: i,
          productionTime: matrixStat.productionTime,
          stopTime: matrixStat.stopTime,
          utilizationPercentage: Math.round(utilization * 100) / 100,
        });
      }

      machineDetails.push({
        machineId: stats.machineId,
        machineName: stats.machineName,
        numberOfMatrices: stats.numberOfMatrices,
        totalTime: stats.totalTime,
        productionTime: stats.productionTime,
        stopTime: stats.stopTime,
        oeePercentage: Math.round(machineOEE * 100) / 100,
        matrixDetails,
      });
    }

    const oeePercentage = totalPossibleTime > 0 ? (totalProductionTime / totalPossibleTime) * 100 : 0;

    // Format time logs for export
    const formattedTimeLogs = (timeLogs || []).map(log => ({
      machineId: log.machineId,
      machineName: machineMap.get(log.machineId)?.name || log.machineId,
      matrixId: log.matrixId,
      matrixNumber: log.matrixNumber,
      status: log.status,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      durationSeconds: log.durationSeconds || 0,
      stopReasonName: log.stopReasonName,
      operatorName: log.operatorName,
    }));

    console.log('✅ OEE detailed data calculated');

    res.json({
      success: true,
      data: {
        summary: {
          oeePercentage: Math.round(oeePercentage * 100) / 100,
          totalProductionTime,
          totalStopTime,
          totalPossibleTime,
          totalMachines: machineDetails.length,
          totalMatrices: Array.from(machineMap.values()).reduce((sum, m) => sum + m.numberOfMatrices, 0),
        },
        machineDetails,
        timeLogs: formattedTimeLogs,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getOEEDetailedData:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch OEE detailed data',
    });
  }
};

// Get stop time by machine - for stacked bar chart
export const getStopTimeByMachine = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('🏭 Fetching stop time by machine:', { companyId, startDate, endDate, groupIds, machineIds, operatorIds });

    // Build query
    let query = supabase
      .from('time_logs')
      .select('*, stop_reasons(name, excludeFromPareto), machines(name)')
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

    // Handle groupIds filter by fetching machines in those groups first
    let machineIdsToFilter: string[] = [];
    if (groupIds && (groupIds as string).length > 0) {
      const groupIdArray = (groupIds as string).split(',');
      const { data: groupMachines } = await supabase
        .from('machines')
        .select('id')
        .eq('companyId', companyId)
        .eq('active', true)
        .in('groupId', groupIdArray);

      machineIdsToFilter = (groupMachines || []).map(m => m.id);
      console.log(`🔍 [StopTimeByMachine] Filtering by groups ${groupIdArray}: found ${machineIdsToFilter.length} machines`);
    }

    // Apply machineIds filter (merge with groupIds filter if both exist)
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      if (machineIdsToFilter.length > 0) {
        machineIdsToFilter = machineIdsToFilter.filter(id => machineIdArray.includes(id));
      } else {
        machineIdsToFilter = machineIdArray;
      }
    }

    // Apply the final machine filter if we have any
    if (machineIdsToFilter.length > 0) {
      query = query.in('machineId', machineIdsToFilter);
    } else if (groupIds && (groupIds as string).length > 0) {
      query = query.in('machineId', ['00000000-0000-0000-0000-000000000000']);
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

    console.log(`📋 Found ${timeLogs?.length || 0} stop time logs`);

    // Get unique machine IDs to fetch matrix counts
    const uniqueMachineIds = [...new Set((timeLogs || []).map(log => log.machineId))];

    // Fetch machine data to get number of matrices (only active machines)
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, numberOfMatrices')
      .eq('companyId', companyId)
      .eq('active', true)
      .in('id', uniqueMachineIds);

    if (machinesError) {
      console.error('❌ Error fetching machines:', machinesError);
      return res.status(500).json({
        success: false,
        error: machinesError.message,
      });
    }

    // Create machine map with matrix counts
    const machineMap = new Map<string, { name: string; numberOfMatrices: number }>();
    for (const machine of machines || []) {
      machineMap.set(machine.id, {
        name: machine.name,
        numberOfMatrices: machine.numberOfMatrices || 1,
      });
    }

    // Aggregate data: Map<machineId, Map<reasonId, { reasonName, duration }>>
    const machineStopData = new Map<string, Map<string, { reasonName: string; duration: number }>>();

    for (const log of timeLogs || []) {
      const reasonId = log.stopReasonId;
      const reasonName = log.stop_reasons?.name || log.stopReasonName || 'Desconhecido';
      const excludeFromPareto = log.stop_reasons?.excludeFromPareto || false;
      const duration = log.durationSeconds || 0;

      // Skip reasons that should be excluded from Pareto
      if (excludeFromPareto || duration === 0) {
        continue;
      }

      const machineInfo = machineMap.get(log.machineId);
      if (!machineInfo) continue;

      // Calculate weighted duration (consider if it affects all matrices or just one)
      const matricesAffected = log.matrixId ? 1 : machineInfo.numberOfMatrices;
      const weightedDuration = duration * matricesAffected;

      if (!machineStopData.has(log.machineId)) {
        machineStopData.set(log.machineId, new Map());
      }

      const reasonMap = machineStopData.get(log.machineId)!;
      if (reasonMap.has(reasonId)) {
        const existing = reasonMap.get(reasonId)!;
        existing.duration += weightedDuration;
      } else {
        reasonMap.set(reasonId, {
          reasonName,
          duration: weightedDuration,
        });
      }
    }

    // Get all unique stop reasons across all machines
    const allReasons = new Set<string>();
    for (const reasonMap of machineStopData.values()) {
      for (const reasonId of reasonMap.keys()) {
        allReasons.add(reasonId);
      }
    }

    // Get reason names
    const reasonNames = new Map<string, string>();
    for (const [machineId, reasonMap] of machineStopData) {
      for (const [reasonId, data] of reasonMap) {
        reasonNames.set(reasonId, data.reasonName);
      }
    }

    // Format data for stacked bar chart
    // Each entry = { machineName, [reasonName1]: duration1, [reasonName2]: duration2, ... }
    const chartData = [];

    for (const [machineId, reasonMap] of machineStopData) {
      const machineInfo = machineMap.get(machineId);
      if (!machineInfo) continue;

      const dataPoint: any = {
        machineId,
        machineName: machineInfo.name,
      };

      // Add each reason's duration to the data point
      for (const [reasonId, data] of reasonMap) {
        dataPoint[reasonId] = Math.round(data.duration / 60); // Convert to minutes
      }

      chartData.push(dataPoint);
    }

    // Sort by total stop time (descending)
    chartData.sort((a, b) => {
      const totalA = Object.keys(a)
        .filter(key => key !== 'machineId' && key !== 'machineName')
        .reduce((sum, key) => sum + (a[key] || 0), 0);
      const totalB = Object.keys(b)
        .filter(key => key !== 'machineId' && key !== 'machineName')
        .reduce((sum, key) => sum + (b[key] || 0), 0);
      return totalB - totalA;
    });

    // Create reason list with IDs and names for legend
    const reasons = Array.from(reasonNames.entries()).map(([id, name]) => ({
      id,
      name,
    }));

    console.log('✅ Stop time by machine calculated:', {
      machines: chartData.length,
      reasons: reasons.length,
    });

    res.json({
      success: true,
      data: {
        chartData,
        reasons,
      },
    });
  } catch (error: any) {
    console.error('❌ Exception in getStopTimeByMachine:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stop time by machine',
    });
  }
};

// Get cycle metrics - completed vs target
export const getCycleMetrics = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, groupIds, machineIds, operatorIds } = req.query;

    console.log('🔄 Fetching cycle metrics:', { companyId, startDate, endDate, groupIds, machineIds });

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

    // Handle groupIds filter by fetching machines in those groups first
    let machineIdsToFilter: string[] = [];
    if (groupIds && (groupIds as string).length > 0) {
      const groupIdArray = (groupIds as string).split(',');
      const { data: groupMachines } = await supabase
        .from('machines')
        .select('id')
        .eq('companyId', companyId)
        .eq('active', true)
        .in('groupId', groupIdArray);

      machineIdsToFilter = (groupMachines || []).map(m => m.id);
      console.log(`🔍 [CycleMetrics] Filtering by groups ${groupIdArray}: found ${machineIdsToFilter.length} machines`);
    }

    // Apply machineIds filter (merge with groupIds filter if both exist)
    if (machineIds && (machineIds as string).length > 0) {
      const machineIdArray = (machineIds as string).split(',');
      if (machineIdsToFilter.length > 0) {
        machineIdsToFilter = machineIdsToFilter.filter(id => machineIdArray.includes(id));
      } else {
        machineIdsToFilter = machineIdArray;
      }
    }

    // Apply the final machine filter if we have any
    if (machineIdsToFilter.length > 0) {
      query = query.in('machineId', machineIdsToFilter);
    } else if (groupIds && (groupIds as string).length > 0) {
      query = query.in('machineId', ['00000000-0000-0000-0000-000000000000']);
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

    // Calculate target cycles based on group's cyclesPerShift
    let targetCycles = 0;

    // Determine which groups to consider
    let relevantGroupIds: string[] = [];

    if (groupIds && (groupIds as string).length > 0) {
      // If groupIds filter is applied, use those groups
      relevantGroupIds = (groupIds as string).split(',');
      console.log('📍 Using filtered groups:', relevantGroupIds);
    } else if (machineIds && (machineIds as string).length > 0) {
      // If machineIds filter is applied, get groups from those machines
      const machineIdArray = (machineIds as string).split(',');
      const { data: machines } = await supabase
        .from('machines')
        .select('groupId')
        .in('id', machineIdArray)
        .eq('companyId', companyId);

      if (machines) {
        relevantGroupIds = [...new Set(machines.map(m => m.groupId).filter(Boolean) as string[])];
        console.log('📍 Using groups from filtered machines:', relevantGroupIds);
      }
    } else {
      // No filter, use all groups from the company
      const { data: allGroups } = await supabase
        .from('groups')
        .select('id')
        .eq('companyId', companyId);

      if (allGroups) {
        relevantGroupIds = allGroups.map(g => g.id);
        console.log('📍 Using all company groups:', relevantGroupIds);
      }
    }

    // Fetch groups and sum expectedCyclesPerShift
    if (relevantGroupIds.length > 0) {
      const { data: groups } = await supabase
        .from('groups')
        .select('id, name, expectedCyclesPerShift')
        .in('id', relevantGroupIds);

      if (groups) {
        targetCycles = groups.reduce((sum, group) => {
          const groupTarget = group.expectedCyclesPerShift || 0;
          console.log(`📊 Group "${group.name}" target: ${groupTarget} cycles per shift`);
          return sum + groupTarget;
        }, 0);
        console.log(`🎯 Total target cycles (sum of filtered groups): ${targetCycles}`);
      }
    }

    const percentage = targetCycles > 0 ? (completedCycles / targetCycles) * 100 : 0;

    console.log('✅ Cycle metrics calculated:', { completedCycles, targetCycles, percentage: percentage.toFixed(2) + '%' });

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
