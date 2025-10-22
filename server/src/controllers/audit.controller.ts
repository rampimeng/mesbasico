import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get cycle logs (registros de giros)
export const getCycleLogs = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { startDate, endDate, machineId, operatorId } = req.query;

    console.log('🔍 Fetching cycle logs for company:', companyId);

    let query = supabase
      .from('machine_activities')
      .select(`
        id,
        machineId,
        operatorId,
        status,
        startTime,
        endTime,
        cyclesCount,
        createdAt,
        machines (
          id,
          name
        ),
        users (
          id,
          name
        )
      `)
      .eq('machines.companyId', companyId)
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

    // Transformar dados para o formato esperado pelo frontend
    const cycleLogs = activities?.map((activity: any) => ({
      id: activity.id,
      companyId,
      sessionId: activity.id, // Usando o ID da atividade como sessionId
      machineId: activity.machineId,
      operatorId: activity.operatorId,
      cycleCompletedAt: activity.endTime || activity.startTime,
      cyclesCount: activity.cyclesCount,
      machineName: activity.machines?.name || 'Desconhecida',
      operatorName: activity.users?.name || 'Desconhecido',
      createdAt: activity.createdAt,
      updatedAt: activity.createdAt,
    })) || [];

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

    let query = supabase
      .from('matrix_activities')
      .select(`
        id,
        matrixId,
        status,
        stopReasonId,
        startTime,
        endTime,
        duration,
        createdAt,
        matrices (
          id,
          matrixNumber,
          machineId,
          machines (
            id,
            name,
            currentOperatorId,
            users (
              id,
              name
            )
          )
        ),
        stop_reasons (
          id,
          name
        )
      `)
      .eq('matrices.machines.companyId', companyId)
      .eq('status', 'STOPPED') // Apenas paradas
      .not('stopReasonId', 'is', null) // Apenas com motivo de parada
      .order('createdAt', { ascending: false });

    // Aplicar filtros
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

    // Transformar dados e aplicar filtros adicionais
    let timeLogs = activities?.map((activity: any) => {
      const machine = activity.matrices?.machines;
      const operator = machine?.users;

      return {
        id: activity.id,
        companyId,
        sessionId: activity.id,
        machineId: machine?.id || '',
        matrixId: activity.matrixId,
        matrixNumber: activity.matrices?.matrixNumber,
        status: activity.status,
        stopReasonId: activity.stopReasonId,
        stopReasonName: activity.stop_reasons?.name || 'Desconhecido',
        startedAt: activity.startTime,
        endedAt: activity.endTime,
        durationSeconds: activity.duration,
        machineName: machine?.name || 'Desconhecida',
        operatorId: machine?.currentOperatorId || '',
        operatorName: operator?.name || 'Desconhecido',
        createdAt: activity.createdAt,
        updatedAt: activity.createdAt,
      };
    }) || [];

    // Filtros adicionais (que não podem ser aplicados diretamente no Supabase devido aos JOINs)
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

    // Verificar se pertence à empresa
    const { data: activity } = await supabase
      .from('machine_activities')
      .select('id, machines!inner(companyId)')
      .eq('id', id)
      .single();

    if (!activity || (activity as any).machines.companyId !== companyId) {
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

    // Verificar se pertence à empresa
    const { data: activity } = await supabase
      .from('matrix_activities')
      .select('id, matrices!inner(machines!inner(companyId))')
      .eq('id', id)
      .single();

    if (!activity || (activity as any).matrices.machines.companyId !== companyId) {
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
