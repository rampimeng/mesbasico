import 'dotenv/config';
import supabase from '../config/supabase';
import { hashPassword } from '../utils/password';

async function cleanDatabase() {
  console.log('🧹 Cleaning database...\n');

  const tables = [
    'audit_logs',
    'pdca_actions',
    'pdca_plans',
    'cycles',
    'stop_events',
    'machine_status',
    'operators',
    'stop_reasons',
    'machines',
    'groups',
    'users',
    'companies'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.log(`  ⚠️  Warning cleaning ${table}:`, error.message);
    } else {
      console.log(`  ✓ Cleaned ${table}`);
    }
  }

  console.log('\n');
}

async function seed() {
  try {
    await cleanDatabase();

    console.log('🌱 Starting Supabase seed...\n');

    // 1. Criar Empresa de Teste
    console.log('📦 Creating test company...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Empresa Demo',
        cnpj: '12.345.678/0001-90',
        email: 'contato@demo.com',
        contactName: 'João Silva',
        contactPhone: '(11) 98765-4321',
        dashboardToken: 'demo-' + Date.now(),
        active: true,
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Error creating company:', companyError);
      throw companyError;
    }

    console.log('✅ Company created:', company.name, `(ID: ${company.id})`);

    // 2. Criar Usuário Master (Desenvolvedor)
    console.log('\n👑 Creating MASTER user...');
    const masterPassword = await hashPassword('master123');

    const { data: masterUser, error: masterError } = await supabase
      .from('users')
      .insert({
        name: 'Master Admin',
        email: 'master@mes.com',
        password: masterPassword,
        role: 'MASTER',
        active: true,
        mfaEnabled: false,
        companyId: null, // Master não pertence a nenhuma empresa específica
      })
      .select()
      .single();

    if (masterError) {
      console.error('❌ Error creating master user:', masterError);
      throw masterError;
    }

    console.log('✅ Master user created:', masterUser.email);

    // 3. Criar Usuário Admin para a Empresa
    console.log('\n🔑 Creating ADMIN user for company...');
    const adminPassword = await hashPassword('admin123');

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .insert({
        name: 'Admin Demo',
        email: 'admin@demo.com',
        password: adminPassword,
        role: 'ADMIN',
        active: true,
        mfaEnabled: false,
        companyId: company.id,
      })
      .select()
      .single();

    if (adminError) {
      console.error('❌ Error creating admin user:', adminError);
      throw adminError;
    }

    console.log('✅ Admin user created:', adminUser.email);

    // 4. Criar Usuário Supervisor
    console.log('\n👨‍💼 Creating SUPERVISOR user...');
    const supervisorPassword = await hashPassword('supervisor123');

    const { data: supervisorUser, error: supervisorError } = await supabase
      .from('users')
      .insert({
        name: 'Supervisor Demo',
        email: 'supervisor@demo.com',
        password: supervisorPassword,
        role: 'SUPERVISOR',
        active: true,
        mfaEnabled: false,
        companyId: company.id,
      })
      .select()
      .single();

    if (supervisorError) {
      console.error('❌ Error creating supervisor user:', supervisorError);
      throw supervisorError;
    }

    console.log('✅ Supervisor user created:', supervisorUser.email);

    // 5. Criar Grupo/Célula de Produção
    console.log('\n🏭 Creating production group...');
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: 'Célula 1',
        description: 'Célula de produção 1',
        companyId: company.id,
      })
      .select()
      .single();

    if (groupError) {
      console.error('❌ Error creating group:', groupError);
      throw groupError;
    }

    console.log('✅ Group created:', group.name);

    // 6. Criar Motivos de Parada
    console.log('\n🛑 Creating stop reasons...');
    const stopReasons = [
      { name: 'Manutenção', description: 'Manutenção preventiva ou corretiva', category: 'MAINTENANCE' },
      { name: 'Setup', description: 'Setup/Preparação de máquina', category: 'SETUP' },
      { name: 'Falta de Material', description: 'Falta de Material', category: 'MATERIAL' },
      { name: 'Qualidade', description: 'Problema de Qualidade', category: 'QUALITY' },
      { name: 'Falta de Energia', description: 'Falta de Energia elétrica', category: 'OTHER' },
    ];

    for (const reason of stopReasons) {
      const { error } = await supabase
        .from('stop_reasons')
        .insert({
          ...reason,
          companyId: company.id,
        });

      if (error) {
        console.error(`❌ Error creating stop reason ${reason.name}:`, error);
      } else {
        console.log(`  ✓ Stop reason created: ${reason.name}`);
      }
    }

    // 7. Criar Máquina
    console.log('\n⚙️  Creating machine...');
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .insert({
        name: 'Máquina 01',
        code: 'MAQ-001',
        standardCycleTime: 30, // 30 segundos
        groupId: group.id,
        companyId: company.id,
      })
      .select()
      .single();

    if (machineError) {
      console.error('❌ Error creating machine:', machineError);
      throw machineError;
    }

    console.log('✅ Machine created:', machine.name);

    // 8. Criar Operador
    console.log('\n👷 Creating OPERATOR user...');
    const operatorPassword = await hashPassword('operator123');

    const { data: operatorUser, error: operatorError } = await supabase
      .from('users')
      .insert({
        name: 'Operador Demo',
        email: 'operator@demo.com',
        password: operatorPassword,
        role: 'OPERATOR',
        active: true,
        mfaEnabled: false,
        companyId: company.id,
      })
      .select()
      .single();

    if (operatorError) {
      console.error('❌ Error creating operator user:', operatorError);
      throw operatorError;
    }

    console.log('✅ Operator user created:', operatorUser.email);

    // 9. Vincular Operador ao Grupo (não há tabela de vínculo direto com máquina)
    console.log('\n🔗 Linking operator to group...');
    const { error: operatorGroupError } = await supabase
      .from('operator_groups')
      .insert({
        userId: operatorUser.id,
        groupId: group.id,
      });

    if (operatorGroupError) {
      console.error('❌ Error linking operator:', operatorGroupError);
      throw operatorGroupError;
    }

    console.log('✅ Operator linked to group');

    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seed completed successfully!\n');
    console.log('📋 Created accounts:');
    console.log('  👑 Master:     master@mes.com / master123');
    console.log('  🔑 Admin:      admin@demo.com / admin123');
    console.log('  👨‍💼 Supervisor: supervisor@demo.com / supervisor123');
    console.log('  👷 Operator:   operator@demo.com / operator123');
    console.log('\n🏢 Company: Empresa Demo');
    console.log('🏭 Group: Célula 1');
    console.log('⚙️  Machine: Máquina 01 (30s cycle time)');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

// Executar seed
seed().then(() => {
  console.log('\n✅ Seed script finished');
  process.exit(0);
});
