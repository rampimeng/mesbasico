import { Request, Response } from 'express';
import supabase from '../config/supabase';

// Get all machines for a company
export const getAllMachines = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    const { data: machines, error } = await supabase
      .from('machines')
      .select(`
        *,
        matrices (
          id,
          matrixNumber,
          status,
          createdAt,
          updatedAt
        )
      `)
      .eq('companyId', companyId)
      .order('createdAt', { ascending: false});

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      data: machines,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch machines',
    });
  }
};

// Get machines for a specific operator (via their cells)
export const getOperatorMachines = async (req: Request, res: Response) => {
  try {
    const { companyId, id: userId } = req.user!;

    console.log('🔍 Fetching machines for operator:', { userId, companyId });

    // First, get the groups (cells) this operator is linked to
    const { data: operatorGroups, error: groupError } = await supabase
      .from('operator_groups')
      .select('groupId')
      .eq('userId', userId);

    if (groupError) {
      console.error('❌ Error fetching operator groups:', groupError);
      return res.status(500).json({
        success: false,
        error: groupError.message,
      });
    }

    const groupIds = operatorGroups?.map((og: any) => og.groupId) || [];
    console.log('📋 Operator is linked to groups:', groupIds);

    if (groupIds.length === 0) {
      console.log('⚠️ Operator has no cells linked');
      return res.json({
        success: true,
        data: [],
      });
    }

    // Get machines that belong to those groups (including matrices)
    const { data: machines, error } = await supabase
      .from('machines')
      .select(`
        *,
        matrices (
          id,
          matrixNumber,
          status,
          createdAt,
          updatedAt
        )
      `)
      .eq('companyId', companyId)
      .in('groupId', groupIds)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ Error fetching operator machines:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Found machines for operator:', machines?.length || 0);

    res.json({
      success: true,
      data: machines || [],
    });
  } catch (error: any) {
    console.error('❌ Exception in getOperatorMachines:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch operator machines',
    });
  }
};

// Get single machine by ID
export const getMachineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { data: machine, error } = await supabase
      .from('machines')
      .select(`
        *,
        matrices (
          id,
          matrixNumber,
          status,
          createdAt,
          updatedAt
        )
      `)
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Machine not found',
      });
    }

    res.json({
      success: true,
      data: machine,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch machine',
    });
  }
};

// Create new machine
export const createMachine = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;
    const { name, code, groupId, numberOfMatrices, standardCycleTime } = req.body;

    console.log('📝 Creating machine:', { companyId, name, code, groupId, numberOfMatrices, standardCycleTime });

    if (!name || !code) {
      console.log('❌ Validation failed: missing name or code');
      return res.status(400).json({
        success: false,
        error: 'Machine name and code are required',
      });
    }

    const machineData = {
      companyId,
      name,
      code,
      groupId: groupId || null,
      numberOfMatrices: numberOfMatrices || 0,
      standardCycleTime: standardCycleTime || 0,
      status: 'IDLE',
    };

    console.log('📦 Machine data to insert:', machineData);

    const { data: machine, error } = await supabase
      .from('machines')
      .insert(machineData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Machine created successfully:', machine);

    // Create matrices if numberOfMatrices > 0
    if (numberOfMatrices && numberOfMatrices > 0) {
      console.log(`🔢 Creating ${numberOfMatrices} matrices for machine ${machine.id}`);

      const matricesToCreate = [];
      for (let i = 1; i <= numberOfMatrices; i++) {
        matricesToCreate.push({
          machineId: machine.id,
          matrixNumber: i,
          status: 'STOPPED',
        });
      }

      const { data: matrices, error: matricesError } = await supabase
        .from('matrices')
        .insert(matricesToCreate)
        .select();

      if (matricesError) {
        console.error('❌ Error creating matrices:', matricesError);
        // Don't fail the request, just log the error
      } else {
        console.log(`✅ Created ${matrices?.length || 0} matrices`);
      }
    }

    res.status(201).json({
      success: true,
      data: machine,
      message: 'Machine created successfully',
    });
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create machine',
    });
  }
};

// Update machine
export const updateMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;
    const { name, code, groupId, numberOfMatrices, standardCycleTime, status } = req.body;

    console.log('🔄 Updating machine:', { id, companyId, numberOfMatrices });

    // Get current machine state to compare numberOfMatrices
    const { data: currentMachine, error: fetchError } = await supabase
      .from('machines')
      .select('id, numberOfMatrices')
      .eq('id', id)
      .eq('companyId', companyId)
      .single();

    if (fetchError || !currentMachine) {
      console.error('❌ Machine not found:', fetchError);
      return res.status(404).json({
        success: false,
        error: 'Machine not found',
      });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (groupId !== undefined) updateData.groupId = groupId;
    if (numberOfMatrices !== undefined) updateData.numberOfMatrices = numberOfMatrices;
    if (standardCycleTime !== undefined) updateData.standardCycleTime = standardCycleTime;
    if (status !== undefined) updateData.status = status;

    const { data: machine, error } = await supabase
      .from('machines')
      .update(updateData)
      .eq('id', id)
      .eq('companyId', companyId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating machine:', error);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log('✅ Machine updated successfully');

    // If numberOfMatrices changed, adjust matrices in database
    if (numberOfMatrices !== undefined && numberOfMatrices !== currentMachine.numberOfMatrices) {
      console.log(`🔢 Number of matrices changed from ${currentMachine.numberOfMatrices} to ${numberOfMatrices}`);

      // Get existing matrices
      const { data: existingMatrices, error: matricesError } = await supabase
        .from('matrices')
        .select('id, matrixNumber')
        .eq('machineId', id)
        .order('matrixNumber', { ascending: true });

      if (matricesError) {
        console.error('❌ Error fetching existing matrices:', matricesError);
      } else {
        const existingCount = existingMatrices?.length || 0;
        console.log(`📊 Current matrices in DB: ${existingCount}, Target: ${numberOfMatrices}`);

        if (numberOfMatrices > existingCount) {
          // Create new matrices
          const matricesToCreate = [];
          for (let i = existingCount + 1; i <= numberOfMatrices; i++) {
            matricesToCreate.push({
              machineId: id,
              matrixNumber: i,
              status: 'STOPPED',
            });
          }

          console.log(`➕ Creating ${matricesToCreate.length} new matrices`);
          const { data: newMatrices, error: createError } = await supabase
            .from('matrices')
            .insert(matricesToCreate)
            .select();

          if (createError) {
            console.error('❌ Error creating new matrices:', createError);
          } else {
            console.log(`✅ Created ${newMatrices?.length || 0} new matrices`);
          }
        } else if (numberOfMatrices < existingCount) {
          // Delete excess matrices (highest numbers first)
          const matricesToDelete = existingMatrices
            .filter((m: any) => m.matrixNumber > numberOfMatrices)
            .map((m: any) => m.id);

          if (matricesToDelete.length > 0) {
            console.log(`➖ Deleting ${matricesToDelete.length} excess matrices`);
            const { error: deleteError } = await supabase
              .from('matrices')
              .delete()
              .in('id', matricesToDelete);

            if (deleteError) {
              console.error('❌ Error deleting excess matrices:', deleteError);
            } else {
              console.log(`✅ Deleted ${matricesToDelete.length} excess matrices`);
            }
          }
        }
      }
    }

    res.json({
      success: true,
      data: machine,
      message: 'Machine updated successfully',
    });
  } catch (error: any) {
    console.error('❌ Unexpected error in updateMachine:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update machine',
    });
  }
};

// Delete machine
export const deleteMachine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const { error } = await supabase
      .from('machines')
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
      message: 'Machine deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete machine',
    });
  }
};
