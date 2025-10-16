import 'dotenv/config';
import supabase from '../config/supabase';
import { hashPassword } from '../utils/password';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function changeMasterPassword() {
  try {
    console.log('\n🔐 Trocar Senha do Usuário Master\n');
    console.log('='.repeat(50));

    // Solicitar a nova senha
    const newPassword = await question('\nDigite a NOVA senha para o Master: ');

    if (!newPassword || newPassword.length < 6) {
      console.error('\n❌ Erro: A senha deve ter pelo menos 6 caracteres');
      rl.close();
      process.exit(1);
    }

    // Confirmar a senha
    const confirmPassword = await question('Confirme a NOVA senha: ');

    if (newPassword !== confirmPassword) {
      console.error('\n❌ Erro: As senhas não coincidem');
      rl.close();
      process.exit(1);
    }

    // Hash da nova senha
    console.log('\n🔄 Gerando hash da senha...');
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar a senha no banco
    console.log('🔄 Atualizando senha no banco de dados...');
    const { data, error } = await supabase
      .from('users')
      .update({
        password: hashedPassword,
        updatedAt: new Date().toISOString(),
      })
      .eq('email', 'master@mes.com')
      .eq('role', 'MASTER')
      .select();

    if (error) {
      console.error('\n❌ Erro ao atualizar senha:', error);
      rl.close();
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.error('\n❌ Erro: Usuário Master não encontrado');
      rl.close();
      process.exit(1);
    }

    console.log('\n✅ Senha do Master alterada com sucesso!');
    console.log('📧 Email: master@mes.com');
    console.log('🔑 Nova senha: ' + '*'.repeat(newPassword.length));
    console.log('\n' + '='.repeat(50));

  } catch (error) {
    console.error('\n❌ Erro ao trocar senha:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar
changeMasterPassword().then(() => {
  console.log('\n✅ Script finalizado');
  process.exit(0);
});
