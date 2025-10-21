import { PrismaClient, StopReasonCategory } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Garante que os motivos de parada do sistema existam para uma empresa
 * Motivos do sistema são criados automaticamente e não aparecem no Pareto
 */
export async function ensureSystemStopReasons(companyId: string): Promise<void> {
  try {
    console.log(`🔍 Checking system stop reasons for company ${companyId}...`);

    // Verificar se "Turno Encerrado" já existe
    const existingShiftEndReason = await prisma.stopReason.findFirst({
      where: {
        companyId,
        name: 'Turno Encerrado',
      },
    });

    if (!existingShiftEndReason) {
      console.log(`➕ Creating 'Turno Encerrado' stop reason for company ${companyId}...`);

      await prisma.stopReason.create({
        data: {
          companyId,
          name: 'Turno Encerrado',
          category: StopReasonCategory.OTHER,
          description: 'Parada automática ao encerrar turno do operador',
          excludeFromPareto: true, // NÃO aparece no Pareto
        },
      });

      console.log(`✅ 'Turno Encerrado' stop reason created successfully`);
    } else {
      console.log(`✅ 'Turno Encerrado' stop reason already exists`);

      // Garantir que está marcado como excludeFromPareto
      if (!existingShiftEndReason.excludeFromPareto) {
        console.log(`🔧 Updating 'Turno Encerrado' to exclude from Pareto...`);
        await prisma.stopReason.update({
          where: { id: existingShiftEndReason.id },
          data: { excludeFromPareto: true },
        });
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
    const reason = await prisma.stopReason.findFirst({
      where: {
        companyId,
        name: 'Turno Encerrado',
      },
    });

    if (!reason) {
      throw new Error('Failed to create or find "Turno Encerrado" stop reason');
    }

    return reason.id;
  } catch (error) {
    console.error(`❌ Error getting shift end reason:`, error);
    throw error;
  }
}
