import { Request, Response } from 'express';
import supabase from '../config/supabase';

/**
 * Migration: Create missing matrices for existing machines
 * This fixes machines that were created before automatic matrix creation was implemented
 */
export const createMissingMatrices = async (req: Request, res: Response) => {
  try {
    const { companyId } = req.user!;

    console.log('🔧 [MIGRATION] Creating missing matrices for company:', companyId);

    // Get all machines for this company
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('id, name, numberOfMatrices')
      .eq('companyId', companyId);

    if (machinesError) {
      console.error('❌ Error fetching machines:', machinesError);
      return res.status(500).json({
        success: false,
        error: machinesError.message,
      });
    }

    if (!machines || machines.length === 0) {
      console.log('⚠️ No machines found for company');
      return res.json({
        success: true,
        message: 'No machines found',
        created: 0,
      });
    }

    console.log(`📋 Found ${machines.length} machines to check`);

    let totalCreated = 0;
    let machinesFixed = 0;

    for (const machine of machines) {
      if (!machine.numberOfMatrices || machine.numberOfMatrices === 0) {
        console.log(`⏭️ Skipping machine ${machine.name} (numberOfMatrices = ${machine.numberOfMatrices})`);
        continue;
      }

      // Check if matrices already exist for this machine
      const { data: existingMatrices, error: checkError } = await supabase
        .from('matrices')
        .select('id')
        .eq('machineId', machine.id);

      if (checkError) {
        console.error(`❌ Error checking matrices for machine ${machine.id}:`, checkError);
        continue;
      }

      const existingCount = existingMatrices?.length || 0;

      if (existingCount >= machine.numberOfMatrices) {
        console.log(`✅ Machine ${machine.name} already has ${existingCount} matrices`);
        continue;
      }

      // Create missing matrices
      const missingCount = machine.numberOfMatrices - existingCount;
      console.log(`🔧 Creating ${missingCount} missing matrices for machine ${machine.name}`);

      const matricesToCreate = [];
      for (let i = existingCount + 1; i <= machine.numberOfMatrices; i++) {
        matricesToCreate.push({
          companyId,
          machineId: machine.id,
          matrixNumber: i,
          status: 'STOPPED',
        });
      }

      const { data: createdMatrices, error: createError } = await supabase
        .from('matrices')
        .insert(matricesToCreate)
        .select();

      if (createError) {
        console.error(`❌ Error creating matrices for machine ${machine.id}:`, createError);
        continue;
      }

      const created = createdMatrices?.length || 0;
      totalCreated += created;
      machinesFixed++;

      console.log(`✅ Created ${created} matrices for machine ${machine.name}`);
    }

    console.log(`🎉 Migration complete: ${totalCreated} matrices created for ${machinesFixed} machines`);

    res.json({
      success: true,
      message: `Created ${totalCreated} matrices for ${machinesFixed} machines`,
      totalCreated,
      machinesFixed,
      machinesChecked: machines.length,
    });
  } catch (error: any) {
    console.error('❌ Exception in createMissingMatrices:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create missing matrices',
    });
  }
};
