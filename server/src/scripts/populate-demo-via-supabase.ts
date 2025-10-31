import 'dotenv/config';
import supabase from '../config/supabase';

async function populateDemoData() {
  try {
    console.log('🚀 Iniciando população de dados da Empresa Demo...\n');

    // ============================================
    // 1. BUSCAR IDs NECESSÁRIOS
    // ============================================
    console.log('🔍 Buscando dados da Empresa Demo...');

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'Empresa Demo')
      .single();

    if (!company) {
      throw new Error('❌ Empresa Demo não encontrada! Execute o seed primeiro.');
    }

    console.log(`✅ Empresa Demo encontrada: ${company.id}`);

    const { data: group } = await supabase
      .from('groups')
      .select('id')
      .eq('companyId', company.id)
      .limit(1)
      .single();

    console.log(`✅ Grupo encontrado: ${group?.id}`);

    const { data: operator } = await supabase
      .from('users')
      .select('id')
      .eq('companyId', company.id)
      .eq('role', 'OPERATOR')
      .limit(1)
      .single();

    console.log(`✅ Operador encontrado: ${operator?.id}`);

    // ============================================
    // 2. LIMPAR DADOS ANTIGOS
    // ============================================
    console.log('\n🧹 Limpando dados antigos...');

    // Buscar máquinas existentes
    const { data: existingMachines } = await supabase
      .from('machines')
      .select('id')
      .eq('companyId', company.id);

    const machineIds = existingMachines?.map((m) => m.id) || [];

    if (machineIds.length > 0) {
      // Deletar atividades antigas
      await supabase.from('audit_logs').delete().eq('companyId', company.id);

      for (const machineId of machineIds) {
        await supabase.from('machine_activities').delete().eq('machineId', machineId);
      }

      // Deletar matrizes
      const { data: existingMatrices } = await supabase
        .from('matrices')
        .select('id')
        .in('machineId', machineIds);

      if (existingMatrices && existingMatrices.length > 0) {
        const matrixIds = existingMatrices.map((m) => m.id);
        await supabase.from('matrix_activities').delete().in('matrixId', matrixIds);
        await supabase.from('matrices').delete().in('machineId', machineIds);
      }

      // Deletar máquinas
      await supabase.from('machines').delete().in('id', machineIds);
    }

    console.log('✅ Dados antigos removidos');

    // ============================================
    // 3. CRIAR MÁQUINAS
    // ============================================
    console.log('\n⚙️  Criando 5 máquinas...');

    const newMachines = [];
    for (let i = 1; i <= 5; i++) {
      newMachines.push({
        companyId: company.id,
        groupId: group?.id || null,
        name: `Máquina ${String(i).padStart(2, '0')}`,
        code: `MAQ-${String(i).padStart(3, '0')}`,
        numberOfMatrices: 4,
        standardCycleTime: 30 + i * 5,
        status: 'IDLE',
        active: true,
      });
    }

    const { data: createdMachines, error: machinesError } = await supabase
      .from('machines')
      .insert(newMachines)
      .select('id');

    if (machinesError) {
      console.error('❌ Erro ao criar máquinas:', machinesError);
      throw machinesError;
    }

    console.log(`✅ ${createdMachines.length} máquinas criadas`);

    // Criar matrizes para cada máquina
    const newMatrices = [];
    for (const machine of createdMachines) {
      for (let i = 1; i <= 4; i++) {
        newMatrices.push({
          machineId: machine.id,
          matrixNumber: i,
          status: 'IDLE',
        });
      }
    }

    await supabase.from('matrices').insert(newMatrices);
    console.log(`✅ ${newMatrices.length} matrizes criadas`);

    // ============================================
    // 4. BUSCAR MOTIVOS DE PARADA
    // ============================================
    const { data: stopReasons } = await supabase
      .from('stop_reasons')
      .select('id, category, name')
      .eq('companyId', company.id);

    console.log(`✅ ${stopReasons?.length || 0} motivos de parada encontrados`);

    // ============================================
    // 5. GERAR DADOS HISTÓRICOS
    // ============================================
    console.log('\n📊 Gerando dados históricos...');

    const startDate = new Date('2025-10-01');
    const endDate = new Date(); // Hoje

    let currentDate = new Date(startDate);
    let totalActivities = 0;
    let totalCycles = 0;

    const activities = [];
    const auditLogs = [];

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Pular finais de semana (0 = domingo, 6 = sábado)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        console.log(`📅 Processando: ${currentDate.toISOString().split('T')[0]}`);

        // Para cada máquina
        for (const machine of createdMachines) {
          let currentTime = new Date(currentDate);
          currentTime.setHours(8, 0, 0, 0); // Início do turno: 8:00

          const endTime = new Date(currentDate);
          endTime.setHours(17, 0, 0, 0); // Fim do turno: 17:00

          // Simular turno de 8 horas
          while (currentTime < endTime) {
            const isRunning = Math.random() < 0.7; // 70% giro, 30% parada

            let status, stopReasonId, durationMinutes, cycles;

            if (isRunning) {
              status = 'NORMAL_RUNNING';
              stopReasonId = null;
              durationMinutes = 30 + Math.floor(Math.random() * 90); // 30-120 min
              cycles = Math.floor(durationMinutes / 2); // ~1 ciclo a cada 2 min
            } else {
              status = 'STOPPED';
              const randomReason = stopReasons![Math.floor(Math.random() * stopReasons!.length)];
              stopReasonId = randomReason.id;
              durationMinutes = 5 + Math.floor(Math.random() * 25); // 5-30 min
              cycles = 0;
            }

            const activityEndTime = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);

            // Adicionar atividade
            activities.push({
              machineId: machine.id,
              operatorId: operator?.id,
              status,
              stopReasonId,
              startTime: currentTime.toISOString(),
              endTime: activityEndTime.toISOString(),
              duration: durationMinutes * 60,
              cyclesCount: cycles,
            });

            totalActivities++;

            // Adicionar logs de ciclos
            if (cycles > 0) {
              for (let j = 0; j < cycles; j++) {
                const cycleTime = new Date(
                  currentTime.getTime() + ((j * durationMinutes) / cycles) * 60 * 1000
                );

                auditLogs.push({
                  companyId: company.id,
                  userId: operator?.id,
                  action: 'CYCLE_COMPLETE',
                  entityType: 'Machine',
                  entityId: machine.id,
                  details: { machineId: machine.id, cycleNumber: j + 1 },
                  createdAt: cycleTime.toISOString(),
                });

                totalCycles++;
              }
            }

            currentTime = activityEndTime;

            // Pausa para almoço (12:00-13:00)
            if (currentTime.getHours() >= 12 && currentTime.getHours() < 13) {
              currentTime.setHours(13, 0, 0, 0);
            }
          }
        }
      }

      // Próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // ============================================
    // 6. INSERIR DADOS EM LOTE
    // ============================================
    console.log('\n💾 Inserindo dados no banco...');
    console.log(`  - Atividades a inserir: ${activities.length}`);
    console.log(`  - Ciclos a inserir: ${auditLogs.length}`);

    // Inserir atividades em lotes de 100
    for (let i = 0; i < activities.length; i += 100) {
      const batch = activities.slice(i, i + 100);
      const { error } = await supabase.from('machine_activities').insert(batch);
      if (error) {
        console.error(`❌ Erro ao inserir lote ${i / 100 + 1}:`, error);
      } else {
        console.log(`  ✅ Lote ${i / 100 + 1} inserido (${batch.length} registros)`);
      }
    }

    // Inserir audit logs em lotes de 100
    for (let i = 0; i < auditLogs.length; i += 100) {
      const batch = auditLogs.slice(i, i + 100);
      const { error } = await supabase.from('audit_logs').insert(batch);
      if (error) {
        console.error(`❌ Erro ao inserir lote de audit logs ${i / 100 + 1}:`, error);
      }
    }

    // ============================================
    // 7. ESTATÍSTICAS FINAIS
    // ============================================
    const { count: activitiesCount } = await supabase
      .from('machine_activities')
      .select('*', { count: 'exact', head: true })
      .in('machineId', createdMachines.map((m) => m.id));

    const { count: cyclesCount } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('companyId', company.id)
      .eq('action', 'CYCLE_COMPLETE');

    console.log('\n================================================');
    console.log('✅ DADOS POPULADOS COM SUCESSO!');
    console.log('================================================');
    console.log('');
    console.log('📊 Estatísticas:');
    console.log(`  - Período: 01/10/2025 até ${endDate.toISOString().split('T')[0]}`);
    console.log(`  - Máquinas criadas: ${createdMachines.length}`);
    console.log(`  - Total de atividades: ${activitiesCount}`);
    console.log(`  - Total de ciclos: ${cyclesCount}`);
    console.log('================================================');

  } catch (error) {
    console.error('\n❌ Erro:', error);
    throw error;
  }
}

// Executar
populateDemoData()
  .then(() => {
    console.log('\n✅ Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Processo falhou:', error);
    process.exit(1);
  });
