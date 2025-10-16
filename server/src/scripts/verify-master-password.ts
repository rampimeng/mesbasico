import 'dotenv/config';
import supabase from '../config/supabase';
import { comparePassword, hashPassword } from '../utils/password';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function verifyMasterPassword() {
  try {
    console.log('\n🔍 Verificador de Senha do Master\n');
    console.log('='.repeat(50));

    // Buscar usuário Master
    console.log('\n🔄 Buscando usuário Master...');
    const { data: masterUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'master@mes.com')
      .eq('role', 'MASTER')
      .single();

    if (error || !masterUser) {
      console.error('\n❌ Usuário Master não encontrado!');
      console.error('Erro:', error);
      rl.close();
      process.exit(1);
    }

    console.log('✅ Usuário Master encontrado:');
    console.log('   ID:', masterUser.id);
    console.log('   Email:', masterUser.email);
    console.log('   Role:', masterUser.role);
    console.log('   Active:', masterUser.active);
    console.log('   Password Hash (primeiros 20 chars):', masterUser.password.substring(0, 20) + '...');
    console.log('   Hash completo:', masterUser.password);

    // Pedir senha para testar
    const testPassword = await question('\n🔑 Digite a senha para testar: ');

    console.log('\n🔄 Testando senha...');
    const isMatch = await comparePassword(testPassword, masterUser.password);

    if (isMatch) {
      console.log('✅ SENHA CORRETA! A senha funciona.');
    } else {
      console.log('❌ SENHA INCORRETA! A senha não confere com o hash armazenado.');

      console.log('\n💡 Gerando novo hash para comparação...');
      const newHash = await hashPassword(testPassword);
      console.log('Hash da senha digitada:', newHash);
      console.log('Hash armazenado no banco:', masterUser.password);

      console.log('\n🔧 Deseja atualizar o hash no banco com a senha digitada? (s/n)');
      const update = await question('Resposta: ');

      if (update.toLowerCase() === 's') {
        console.log('\n🔄 Atualizando senha no banco...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            password: newHash,
            updatedAt: new Date().toISOString(),
          })
          .eq('id', masterUser.id);

        if (updateError) {
          console.error('❌ Erro ao atualizar:', updateError);
        } else {
          console.log('✅ Senha atualizada com sucesso!');
          console.log('📧 Email: master@mes.com');
          console.log('🔑 Senha:', testPassword);
        }
      }
    }

    // Testar também a senha padrão
    console.log('\n🔄 Testando senha padrão "master123"...');
    const isDefaultMatch = await comparePassword('master123', masterUser.password);

    if (isDefaultMatch) {
      console.log('✅ A senha padrão "master123" ainda funciona.');
    } else {
      console.log('❌ A senha padrão "master123" NÃO funciona.');
    }

    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar
verifyMasterPassword().then(() => {
  console.log('\n✅ Script finalizado');
  process.exit(0);
});
