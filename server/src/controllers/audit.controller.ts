import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get cycle logs (registros de giros)
export const getCycleLogs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, machineId, operatorId } = req.query;

    console.log('🔍 Fetching cycle logs for company:', companyId);

    // Buscar cycle_logs com filtros
    let query = supabase
      .from('cycle_logs')
      .select('*')
      .eq('companyId', companyId)
      .order('cycleCompletedAt', { ascending: false });

    // Aplicar filtros
    if (startDate) {
      query = query.gte('cycleCompletedAt', startDate as string);
    }
    if (endDate) {
      query = query.lte('cycleCompletedAt', endDate as string);
    }
    if (machineId) {
      query = query.eq('machineId', machineId as string);
    }
    if (operatorId) {
      query = query.eq('operatorId', operatorId as string);
    }

    const { data: cycleLogs, error } = await query;

    if (error) {
      console.error('❌ Error fetching cycle logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Buscar informações adicionais (máquinas e operadores)
    const machineIds = [...new Set(cycleLogs?.map((c: any) => c.machineId) || [])];
    const operatorIds = [...new Set(cycleLogs?.map((c: any) => c.operatorId) || [])];

    // Buscar máquinas
    const { data: machines } = await supabase
      .from('machines')
      .select('id, name')
      .in('id', machineIds);

    // Buscar operadores
    const { data: operators } = await supabase
      .from('users')
      .select('id, name')
      .in('id', operatorIds);

    // Criar mapas para lookup rápido
    const machinesMap = new Map(machines?.map((m: any) => [m.id, m]) || []);
    const operatorsMap = new Map(operators?.map((o: any) => [o.id, o]) || []);

    // Enriquecer dados com nomes
    const enrichedCycleLogs = cycleLogs?.map((cycle: any) => {
      const machine = machinesMap.get(cycle.machineId);
      const operator = operatorsMap.get(cycle.operatorId);

      return {
        ...cycle,
        cyclesCount: 1, // Cada registro de cycle_log representa 1 ciclo
        machineName: machine?.name || 'Desconhecida',
        operatorName: operator?.name || 'Desconhecido',
      };
    }) || [];

    console.log(`✅ Found ${enrichedCycleLogs.length} cycle logs`);

    res.json({
      success: true,
      data: enrichedCycleLogs,
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

    // Buscar time_logs com filtros
    let query = supabase
      .from('time_logs')
      .select('*')
      .eq('companyId', companyId)
      .in('status', ['STOPPED', 'EMERGENCY']) // Apenas paradas
      .not('stopReasonId', 'is', null) // Apenas com motivo de parada
      .order('startedAt', { ascending: false });

    // Aplicar filtros de data
    if (startDate) {
      query = query.gte('startedAt', startDate as string);
    }
    if (endDate) {
      query = query.lte('startedAt', endDate as string);
    }
    if (machineId) {
      query = query.eq('machineId', machineId as string);
    }
    if (operatorId) {
      query = query.eq('operatorId', operatorId as string);
    }

    const { data: timeLogs, error } = await query;

    if (error) {
      console.error('❌ Error fetching time logs:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Buscar informações adicionais
    const machineIds = [...new Set(timeLogs?.map((t: any) => t.machineId) || [])];
    const operatorIds = [...new Set(timeLogs?.map((t: any) => t.operatorId) || [])];
    const stopReasonIds = [...new Set(timeLogs?.map((t: any) => t.stopReasonId).filter(Boolean) || [])];

    // Buscar máquinas
    const { data: machines } = await supabase
      .from('machines')
      .select('id, name')
      .in('id', machineIds);

    // Buscar operadores
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
    const machinesMap = new Map(machines?.map((m: any) => [m.id, m]) || []);
    const operatorsMap = new Map(operators?.map((o: any) => [o.id, o]) || []);
    const stopReasonsMap = new Map(stopReasons?.map((r: any) => [r.id, r]) || []);

    // Enriquecer dados com nomes
    const enrichedTimeLogs = timeLogs?.map((log: any) => {
      const machine = machinesMap.get(log.machineId);
      const operator = operatorsMap.get(log.operatorId);
      const stopReason = stopReasonsMap.get(log.stopReasonId);

      return {
        ...log,
        machineName: machine?.name || 'Desconhecida',
        operatorName: operator?.name || 'Desconhecido',
        stopReasonName: stopReason?.name || 'Desconhecido',
      };
    }) || [];

    console.log(`✅ Found ${enrichedTimeLogs.length} time logs`);

    res.json({
      success: true,
      data: enrichedTimeLogs,
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

    // Verificar se pertence à empresa
    const { data: cycleLog } = await supabase
      .from('cycle_logs')
      .select('id, companyId')
      .eq('id', id)
      .single();

    if (!cycleLog) {
      return res.status(404).json({
        success: false,
        error: 'Cycle log not found',
      });
    }

    if (cycleLog.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        error: 'Cycle log not found',
      });
    }

    const { error } = await supabase
      .from('cycle_logs')
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

    // Verificar se pertence à empresa
    const { data: timeLog } = await supabase
      .from('time_logs')
      .select('id, companyId')
      .eq('id', id)
      .single();

    if (!timeLog) {
      return res.status(404).json({
        success: false,
        error: 'Time log not found',
      });
    }

    if (timeLog.companyId !== companyId) {
      return res.status(404).json({
        success: false,
        error: 'Time log not found',
      });
    }

    const { error } = await supabase
      .from('time_logs')
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
