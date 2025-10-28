import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get all stop reasons for a company
export const getAllStopReasons = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId, role } = req.user!;

    console.log('📋 Fetching stop reasons for user:', { userId, role, companyId });

    // Se for OPERADOR, filtrar apenas motivos vinculados às suas células
    if (role === 'OPERATOR') {
      // 1. Buscar grupos do operador
      const { data: operatorGroups, error: groupsError } = await supabase
        .from('operator_groups')
        .select('groupId')
        .eq('userId', userId);

      if (groupsError) {
        console.error('❌ Error fetching operator groups:', groupsError);
        return res.status(500).json({
          success: false,
          error: groupsError.message,
        });
      }

      const groupIds = operatorGroups?.map((og: any) => og.groupId) || [];
      console.log('📍 Operator groups:', groupIds);

      if (groupIds.length === 0) {
        // Operador não vinculado a nenhum grupo - retorna vazio
        console.log('⚠️ Operator has no groups assigned');
        return res.json({
          success: true,
          data: [],
        });
      }

      // 2. Buscar stop reasons vinculados aos grupos do operador
      const { data: groupStopReasons, error: grsError } = await supabase
        .from('group_stop_reasons')
        .select('stopReasonId')
        .in('groupId', groupIds);

      if (grsError) {
        console.error('❌ Error fetching group stop reasons:', grsError);
        return res.status(500).json({
          success: false,
          error: grsError.message,
        });
      }

      const stopReasonIds = [...new Set(groupStopReasons?.map((gsr: any) => gsr.stopReasonId) || [])];
      console.log('📋 Stop reasons IDs for operator groups:', stopReasonIds);

      if (stopReasonIds.length === 0) {
        // Nenhum motivo vinculado aos grupos - retorna todos os motivos da empresa
        console.log('⚠️ No stop reasons linked to operator groups - returning all company stop reasons');
        const { data: allStopReasons, error: allError } = await supabase
          .from('stop_reasons')
          .select('*')
          .eq('companyId', companyId)
          .order('createdAt', { ascending: false });

        if (allError) {
          return res.status(500).json({
            success: false,
            error: allError.message,
          });
        }

        const mapped = allStopReasons?.map(reason => ({
          ...reason,
          ignoreInPareto: reason.excludeFromPareto,
        }));

        return res.json({
          success: true,
          data: mapped,
        });
      }

      // 3. Buscar detalhes dos stop reasons
      const { data: stopReasons, error } = await supabase
        .from('stop_reasons')
        .select('*')
        .in('id', stopReasonIds)
        .order('createdAt', { ascending: false });

      if (error) {
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }

      const mappedStopReasons = stopReasons?.map(reason => ({
        ...reason,
        ignoreInPareto: reason.excludeFromPareto,
      }));

      console.log(`✅ Returning ${mappedStopReasons?.length || 0} stop reasons for operator`);

      return res.json({
        success: true,
        data: mappedStopReasons,
      });
    }

    // Para ADMIN e SUPERVISOR - retornar todos os motivos da empresa
    const { data: stopReasons, error } = await supabase
      .from('stop_reasons')
      .select('*')
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    // Mapear excludeFromPareto (DB) para ignoreInPareto (frontend)
    const mappedStopReasons = stopReasons?.map(reason => ({
      ...reason,
      ignoreInPareto: reason.excludeFromPareto,
    }));

    console.log(`✅ Returning ${mappedStopReasons?.length || 0} stop reasons for ${role}`);

    res.json({
      success: true,
      data: mappedStopReasons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stop reasons',
    });
  }
};

// Get single stop reason by ID
export const getStopReasonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { data: stopReason, error } = await supabase
      .from('stop_reasons')
      .select('*')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Stop reason not found',
      });
    }

    // Mapear excludeFromPareto (DB) para ignoreInPareto (frontend)
    const mappedStopReason = {
      ...stopReason,
      ignoreInPareto: stopReason.excludeFromPareto,
    };

    res.json({
      success: true,
      data: mappedStopReason,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stop reason',
    });
  }
};

// Create new stop reason
export const createStopReason = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { name, description, category, ignoreInPareto } = req.body;

    console.log('📝 Creating stop reason:', { companyId, name, description, category, ignoreInPareto });

    if (!name) {
      console.log('❌ Validation failed: missing name');
      return res.status(400).json({
        success: false,
        error: 'Stop reason name is required',
      });
    }

    const stopReasonData = {
      companyId,
      name,
      description: description || null,
      category: category || null,
      excludeFromPareto: ignoreInPareto || false, // Mapeamento: frontend usa ignoreInPareto, DB usa excludeFromPareto
    };

    console.log('📦 Stop reason data to insert:', stopReasonData);

    const { data: stopReason, error } = await supabase
      .from('stop_reasons')
      .insert(stopReasonData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Stop reason created successfully:', stopReason);

    // Mapear excludeFromPareto (DB) para ignoreInPareto (frontend)
    const mappedStopReason = {
      ...stopReason,
      ignoreInPareto: stopReason.excludeFromPareto,
    };

    res.status(201).json({
      success: true,
      data: mappedStopReason,
      message: 'Stop reason created successfully',
    });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create stop reason',
    });
  }
};

// Update stop reason
export const updateStopReason = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;
    const { name, description, category, ignoreInPareto } = req.body;

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (ignoreInPareto !== undefined) updateData.excludeFromPareto = ignoreInPareto; // Mapeamento: frontend usa ignoreInPareto, DB usa excludeFromPareto

    const { data: stopReason, error } = await supabase
      .from('stop_reasons')
      .update(updateData)
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Mapear excludeFromPareto (DB) para ignoreInPareto (frontend)
    const mappedStopReason = {
      ...stopReason,
      ignoreInPareto: stopReason.excludeFromPareto,
    };

    res.json({
      success: true,
      data: mappedStopReason,
      message: 'Stop reason updated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update stop reason',
    });
  }
};

// Delete stop reason
export const deleteStopReason = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { error } = await supabase
      .from('stop_reasons')
      .delete()
      .eq('id', id)
      .eq('companyId', companyId);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Stop reason deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete stop reason',
    });
  }
};
