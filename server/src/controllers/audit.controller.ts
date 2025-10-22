import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get cycle logs (registros de giros)
export const getCycleLogs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, machineId, operatorId } = req.query;

    console.log('🔍 Fetching cycle logs for company:', companyId);

    // Buscar machine_activities com filtros
    let query = supabase
      .from('machine_activities')
      .select('*')
      .gt('cyclesCount', 0) // Apenas atividades com giros registrados
      .order('createdAt', { ascending: false });

    // Aplicar filtros
    if (startDate) {
      query = query.gte('startTime', startDate as string);
    }
    if (endDate) {
      query = query.lte('startTime', endDate as string);
    }
    if (machineId) {
      query = query.eq('machineId', machineId as string);
    }
    if (operatorId) {
      query = query.eq('operatorId', operatorId as string);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('❌ Error fetching cycle logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Buscar informações adicionais (máquinas e operadores)
    const machineIds = [...new Set(activities?.map((a: any) => a.machineId) || [])];
    const operatorIds = [...new Set(activities?.map((a: any) => a.operatorId) || [])];

    // Buscar máquinas da mesma empresa
    const { data: machines } = await supabase
      .from('machines')
      .select('id, name')
      .eq('companyId', companyId)
      .in('id', machineIds);

    // Buscar operadores
    const { data: operators } = await supabase
      .from('users')
      .select('id, name')
      .in('id', operatorIds);

    // Criar mapas para lookup rápido
    const machinesMap = new Map(machines?.map((m: any) => [m.id, m]) || []);
    const operatorsMap = new Map(operators?.map((o: any) => [o.id, o]) || []);

    // Transformar dados para o formato esperado pelo frontend
    const cycleLogs = activities
      ?.filter((activity: any) => {
        // Filtrar apenas atividades de máquinas da empresa
        return machinesMap.has(activity.machineId);
      })
      .map((activity: any) => {
        const machine = machinesMap.get(activity.machineId);
        const operator = operatorsMap.get(activity.operatorId);

        return {
          id: activity.id,
          companyId,
          sessionId: activity.id,
          machineId: activity.machineId,
          operatorId: activity.operatorId,
          cycleCompletedAt: activity.endTime || activity.startTime,
          cyclesCount: activity.cyclesCount,
          machineName: machine?.name || 'Desconhecida',
          operatorName: operator?.name || 'Desconhecido',
          createdAt: activity.createdAt,
          updatedAt: activity.createdAt,
        };
      }) || [];

    console.log(`✅ Found ${cycleLogs.length} cycle logs`);

    res.json({
      success: true,
      data: cycleLogs,
    });
  } catch (error: any) {
    console.error('❌ Exception in getCycleLogs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cycle logs',
    });
  }
};

// Get time logs (registros de paradas)
export const getTimeLogs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, machineId, operatorId } = req.query;

    console.log('🔍 Fetching time logs for company:', companyId);

    // Buscar matrix_activities
    let query = supabase
      .from('matrix_activities')
      .select('*')
      .eq('status', 'STOPPED') // Apenas paradas
      .not('stopReasonId', 'is', null) // Apenas com motivo de parada
      .order('createdAt', { ascending: false });

    // Aplicar filtros de data
    if (startDate) {
      query = query.gte('startTime', startDate as string);
    }
    if (endDate) {
      query = query.lte('startTime', endDate as string);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('❌ Error fetching time logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Buscar informações adicionais
    const matrixIds = [...new Set(activities?.map((a: any) => a.matrixId) || [])];
    const stopReasonIds = [...new Set(activities?.map((a: any) => a.stopReasonId).filter(Boolean) || [])];

    // Buscar matrizes e suas máquinas
    const { data: matrices } = await supabase
      .from('matrices')
      .select('id, matrixNumber, machineId')
      .in('id', matrixIds);

    const machineIds = [...new Set(matrices?.map((m: any) => m.machineId) || [])];

    // Buscar máquinas da mesma empresa
    const { data: machines } = await supabase
      .from('machines')
      .select('id, name, currentOperatorId, companyId')
      .eq('companyId', companyId)
      .in('id', machineIds);

    // Buscar operadores
    const operatorIds = [...new Set(machines?.map((m: any) => m.currentOperatorId).filter(Boolean) || [])];
    const { data: operators } = await supabase
      .from('users')
      .select('id, name')
      .in('id', operatorIds);

    // Buscar motivos de parada
    const { data: stopReasons } = await supabase
      .from('stop_reasons')
      .select('id, name')
      .in('id', stopReasonIds);

    // Criar mapas para lookup rápido
    const matricesMap = new Map(matrices?.map((m: any) => [m.id, m]) || []);
    const machinesMap = new Map(machines?.map((m: any) => [m.id, m]) || []);
    const operatorsMap = new Map(operators?.map((o: any) => [o.id, o]) || []);
    const stopReasonsMap = new Map(stopReasons?.map((r: any) => [r.id, r]) || []);

    // Transformar dados e aplicar filtros adicionais
    let timeLogs = activities
      ?.map((activity: any) => {
        const matrix = matricesMap.get(activity.matrixId);
        if (!matrix) return null;

        const machine = machinesMap.get(matrix.machineId);
        if (!machine) return null; // Apenas atividades de máquinas da empresa

        const operator = operatorsMap.get(machine.currentOperatorId);
        const stopReason = stopReasonsMap.get(activity.stopReasonId);

        return {
          id: activity.id,
          companyId,
          sessionId: activity.id,
          machineId: machine.id,
          matrixId: activity.matrixId,
          matrixNumber: matrix.matrixNumber,
          status: activity.status,
          stopReasonId: activity.stopReasonId,
          stopReasonName: stopReason?.name || 'Desconhecido',
          startedAt: activity.startTime,
          endedAt: activity.endTime,
          durationSeconds: activity.duration,
          machineName: machine.name || 'Desconhecida',
          operatorId: machine.currentOperatorId || '',
          operatorName: operator?.name || 'Desconhecido',
          createdAt: activity.createdAt,
          updatedAt: activity.createdAt,
        };
      })
      .filter(Boolean) || []; // Remove nulls

    // Filtros adicionais
    if (machineId) {
      timeLogs = timeLogs.filter((log: any) => log.machineId === machineId);
    }
    if (operatorId) {
      timeLogs = timeLogs.filter((log: any) => log.operatorId === operatorId);
    }

    console.log(`✅ Found ${timeLogs.length} time logs`);

    res.json({
      success: true,
      data: timeLogs,
    });
  } catch (error: any) {
    console.error('❌ Exception in getTimeLogs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch time logs',
    });
  }
};

// Delete cycle log
export const deleteCycleLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    console.log('🗑️ Deleting cycle log:', id);

    // Verificar se pertence à empresa através da máquina
    const { data: activity } = await supabase
      .from('machine_activities')
      .select('id, machineId')
      .eq('id', id)
      .single();

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Cycle log not found',
      });
    }

    // Verificar se a máquina pertence à empresa
    const { data: machine } = await supabase
      .from('machines')
      .select('companyId')
      .eq('id', activity.machineId)
      .single();

    if (!machine || machine.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        error: 'Cycle log not found',
      });
    }

    const { error } = await supabase
      .from('machine_activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting cycle log:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Cycle log deleted');

    res.json({
      success: true,
      message: 'Cycle log deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in deleteCycleLog:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete cycle log',
    });
  }
};

// Delete time log
export const deleteTimeLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    console.log('🗑️ Deleting time log:', id);

    // Verificar se pertence à empresa através da matriz e máquina
    const { data: activity } = await supabase
      .from('matrix_activities')
      .select('id, matrixId')
      .eq('id', id)
      .single();

    if (!activity) {
      return res.status(404).json({
        success: false,
        error: 'Time log not found',
      });
    }

    // Buscar matriz e máquina
    const { data: matrix } = await supabase
      .from('matrices')
      .select('machineId')
      .eq('id', activity.matrixId)
      .single();

    if (!matrix) {
      return res.status(404).json({
        success: false,
        error: 'Time log not found',
      });
    }

    // Verificar se a máquina pertence à empresa
    const { data: machine } = await supabase
      .from('machines')
      .select('companyId')
      .eq('id', matrix.machineId)
      .single();

    if (!machine || machine.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        error: 'Time log not found',
      });
    }

    const { error } = await supabase
      .from('matrix_activities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting time log:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Time log deleted');

    res.json({
      success: true,
      message: 'Time log deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Exception in deleteTimeLog:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete time log',
    });
  }
};
