import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import supabase from '../config/supabase';

async function runMigration() {
  try {
    console.log('🚀 Running production tables migration...\n');

    // Ler o arquivo SQL
    const sqlPath = join(__dirname, '../../migrations/create_production_tables.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL file loaded');
    console.log('Executing SQL...\n');

    // Executar o SQL usando rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Error executing migration:', error);
      throw error;
    }

    console.log('✅ Migration executed successfully!');
    console.log('\n✅ Production tables created:');
    console.log('  - production_sessions');
    console.log('  - time_logs');
    console.log('  - cycle_logs');
    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n⚠️  Please run the SQL manually in Supabase Dashboard:');
    console.error('   1. Go to https://supabase.com/dashboard');
    console.error('   2. Open SQL Editor');
    console.error('   3. Copy the content from: server/migrations/create_production_tables.sql');
    console.error('   4. Run the SQL');
    process.exit(1);
  }
}

runMigration().then(() => {
  console.log('\n✅ Script finished');
  process.exit(0);
});
