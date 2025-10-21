import supabase from '../config/supabase';

/**
 * Garante que os motivos de parada do sistema existam para uma empresa
 * Motivos do sistema são criados automaticamente e não aparecem no Pareto
 */
export async function ensureSystemStopReasons(companyId: string): Promise<void> {
  try {
    console.log(`🔍 Checking system stop reasons for company ${companyId}...`);

    // Verificar se "Turno Encerrado" já existe
    const { data: existingReasons, error: findError } = await supabase
      .from('stop_reasons')
      .select('*')
      .eq('companyId', companyId)
      .eq('name', 'Turno Encerrado')
      .maybeSingle();

    if (findError) {
      console.error(`❌ Error checking for existing reason:`, findError);
      throw findError;
    }

    if (!existingReasons) {
      console.log(`➕ Creating 'Turno Encerrado' stop reason for company ${companyId}...`);

      const { error: createError } = await supabase
        .from('stop_reasons')
        .insert({
          companyId,
          name: 'Turno Encerrado',
          category: 'OTHER',
          description: 'Parada automática ao encerrar turno do operador',
          excludeFromPareto: true, // NÃO aparece no Pareto
        });

      if (createError) {
        console.error(`❌ Error creating reason:`, createError);
        throw createError;
      }

      console.log(`✅ 'Turno Encerrado' stop reason created successfully`);
    } else {
      console.log(`✅ 'Turno Encerrado' stop reason already exists`);

      // Garantir que está marcado como excludeFromPareto
      if (!existingReasons.excludeFromPareto) {
        console.log(`🔧 Updating 'Turno Encerrado' to exclude from Pareto...`);

        const { error: updateError } = await supabase
          .from('stop_reasons')
          .update({ excludeFromPareto: true })
          .eq('id', existingReasons.id);

        if (updateError) {
          console.error(`❌ Error updating reason:`, updateError);
          throw updateError;
        }

        console.log(`✅ Updated successfully`);
      }
    }
  } catch (error) {
    console.error(`❌ Error ensuring system stop reasons:`, error);
    throw error;
  }
}

/**
 * Busca ou cria o motivo "Turno Encerrado" para uma empresa
 * Retorna o ID do motivo
 */
export async function getOrCreateShiftEndReason(companyId: string): Promise<string> {
  try {
    // Garantir que existe
    await ensureSystemStopReasons(companyId);

    // Buscar o motivo
    const { data: reason, error } = await supabase
      .from('stop_reasons')
      .select('id')
      .eq('companyId', companyId)
      .eq('name', 'Turno Encerrado')
      .single();

    if (error || !reason) {
      console.error(`❌ Error finding reason after creation:`, error);
      throw new Error('Failed to create or find "Turno Encerrado" stop reason');
    }

    return reason.id;
  } catch (error) {
    console.error(`❌ Error getting shift end reason:`, error);
    throw error;
  }
}
