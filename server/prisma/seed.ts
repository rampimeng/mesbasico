import { PrismaClient, UserRole, MachineStatus, MatrixStatus, StopReasonCategory } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Limpar dados existentes (cuidado em produção!)
  console.log('🧹 Limpando dados existentes...');
  await prisma.auditLog.deleteMany();
  await prisma.matrixActivity.deleteMany();
  await prisma.machineActivity.deleteMany();
  await prisma.matrix.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.stopReason.deleteMany();
  await prisma.operatorGroup.deleteMany();
  await prisma.group.deleteMany();
  await prisma.pdcaAction.deleteMany();
  await prisma.pdcaPlan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log('✅ Dados limpos\n');

  // 1. Criar Usuário Master
  console.log('👑 Criando usuário Master...');
  const masterUser = await prisma.user.create({
    data: {
      name: 'Master User',
      email: 'master@mes.com',
      password: await bcrypt.hash('master123', 10),
      role: UserRole.MASTER,
      active: true,
      mfaEnabled: true,
      mfaSecret: 'MASTER_MFA_SECRET', // Em produção, use um secret TOTP real
    },
  });
  console.log(`✅ Master criado: ${masterUser.email}`);
  console.log(`   Senha: master123`);
  console.log(`   MFA: 123456 (desenvolvimento)\n`);

  // 2. Criar Empresa Demo
  console.log('🏢 Criando empresa de demonstração...');
  const company = await prisma.company.create({
    data: {
      name: 'Empresa Demo LTDA',
      cnpj: '12.345.678/0001-90',
      email: 'contato@empresademo.com',
      contactName: 'João Silva',
      contactPhone: '(11) 98765-4321',
      logoUrl: 'https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=DEMO',
      dashboardToken: 'dash_demo_' + Date.now(),
      active: true,
    },
  });
  console.log(`✅ Empresa criada: ${company.name}`);
  console.log(`   Dashboard Token: ${company.dashboardToken}\n`);

  // 3. Criar Usuário Admin
  console.log('👤 Criando usuário Admin...');
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Admin User',
      email: 'admin@empresa.com',
      password: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN,
      active: true,
      mfaEnabled: false,
    },
  });
  console.log(`✅ Admin criado: ${adminUser.email}`);
  console.log(`   Senha: admin123\n`);

  // 4. Criar Usuário Supervisor
  console.log('👨‍💼 Criando usuário Supervisor...');
  const supervisorUser = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Supervisor User',
      email: 'supervisor@empresa.com',
      password: await bcrypt.hash('super123', 10),
      role: UserRole.SUPERVISOR,
      active: true,
      mfaEnabled: false,
    },
  });
  console.log(`✅ Supervisor criado: ${supervisorUser.email}`);
  console.log(`   Senha: super123\n`);

  // 5. Criar Usuário Operador
  console.log('👷 Criando usuário Operador...');
  const operatorUser = await prisma.user.create({
    data: {
      companyId: company.id,
      name: 'Operador User',
      email: 'operador@empresa.com',
      password: await bcrypt.hash('oper123', 10),
      role: UserRole.OPERATOR,
      active: true,
      mfaEnabled: false,
    },
  });
  console.log(`✅ Operador criado: ${operatorUser.email}`);
  console.log(`   Senha: oper123\n`);

  // 6. Criar Grupos/Células
  console.log('📦 Criando grupos/células...');
  const grupoInjecao = await prisma.group.create({
    data: {
      companyId: company.id,
      name: 'Célula Injeção',
      description: 'Célula de injeção de plásticos',
      expectedCyclesPerShift: 480,
    },
  });

  const grupoMontagem = await prisma.group.create({
    data: {
      companyId: company.id,
      name: 'Célula Montagem',
      description: 'Célula de montagem final',
      expectedCyclesPerShift: 600,
    },
  });
  console.log(`✅ Grupos criados: ${grupoInjecao.name}, ${grupoMontagem.name}\n`);

  // 7. Vincular Operador ao Grupo
  await prisma.operatorGroup.create({
    data: {
      userId: operatorUser.id,
      groupId: grupoInjecao.id,
    },
  });

  // 8. Criar Motivos de Parada
  console.log('🛑 Criando motivos de parada...');
  const stopReasons = await prisma.stopReason.createMany({
    data: [
      {
        companyId: company.id,
        name: 'Falta de Material',
        category: StopReasonCategory.MATERIAL,
        description: 'Falta de matéria-prima',
      },
      {
        companyId: company.id,
        name: 'Manutenção Preventiva',
        category: StopReasonCategory.MAINTENANCE,
        description: 'Manutenção programada',
      },
      {
        companyId: company.id,
        name: 'Quebra de Ferramenta',
        category: StopReasonCategory.MAINTENANCE,
        description: 'Quebra ou desgaste de ferramenta',
      },
      {
        companyId: company.id,
        name: 'Problema de Qualidade',
        category: StopReasonCategory.QUALITY,
        description: 'Peças fora do padrão',
      },
      {
        companyId: company.id,
        name: 'Setup de Máquina',
        category: StopReasonCategory.SETUP,
        description: 'Troca de produto/ferramenta',
      },
      {
        companyId: company.id,
        name: 'Falta de Operador',
        category: StopReasonCategory.OPERATOR,
        description: 'Operador ausente',
      },
      {
        companyId: company.id,
        name: 'Emergência',
        category: StopReasonCategory.EMERGENCY,
        description: 'Parada de emergência',
      },
    ],
  });
  console.log(`✅ Motivos de parada criados: ${stopReasons.count} itens\n`);

  // 9. Criar Máquinas
  console.log('🏭 Criando máquinas...');
  const maquina1 = await prisma.machine.create({
    data: {
      companyId: company.id,
      groupId: grupoInjecao.id,
      name: 'Injetora 01',
      code: 'INJ-001',
      numberOfMatrices: 4,
      standardCycleTime: 45, // 45 segundos
      status: MachineStatus.IDLE,
    },
  });

  const maquina2 = await prisma.machine.create({
    data: {
      companyId: company.id,
      groupId: grupoInjecao.id,
      name: 'Injetora 02',
      code: 'INJ-002',
      numberOfMatrices: 4,
      standardCycleTime: 50,
      status: MachineStatus.IDLE,
    },
  });

  const maquina3 = await prisma.machine.create({
    data: {
      companyId: company.id,
      groupId: grupoMontagem.id,
      name: 'Montadora 01',
      code: 'MON-001',
      numberOfMatrices: 0, // Sem matrizes
      standardCycleTime: 30,
      status: MachineStatus.IDLE,
    },
  });
  console.log(`✅ Máquinas criadas: ${maquina1.name}, ${maquina2.name}, ${maquina3.name}\n`);

  // 10. Criar Matrizes para as Injetoras
  console.log('🔧 Criando matrizes...');
  for (let i = 1; i <= 4; i++) {
    await prisma.matrix.create({
      data: {
        machineId: maquina1.id,
        matrixNumber: i,
        status: MatrixStatus.IDLE,
      },
    });

    await prisma.matrix.create({
      data: {
        machineId: maquina2.id,
        matrixNumber: i,
        status: MatrixStatus.IDLE,
      },
    });
  }
  console.log(`✅ Matrizes criadas: 8 matrizes (4 por injetora)\n`);

  console.log('🎉 Seed concluído com sucesso!\n');
  console.log('📋 Resumo:');
  console.log('   - 1 Usuário Master');
  console.log('   - 1 Empresa');
  console.log('   - 3 Usuários (Admin, Supervisor, Operador)');
  console.log('   - 2 Grupos/Células');
  console.log('   - 7 Motivos de Parada');
  console.log('   - 3 Máquinas');
  console.log('   - 8 Matrizes');
  console.log('\n📧 Credenciais de Login:');
  console.log('   Master:     master@mes.com / master123 (MFA: 123456)');
  console.log('   Admin:      admin@empresa.com / admin123');
  console.log('   Supervisor: supervisor@empresa.com / super123');
  console.log('   Operador:   operador@empresa.com / oper123');
  console.log('\n🔗 Dashboard Token:', company.dashboardToken);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
