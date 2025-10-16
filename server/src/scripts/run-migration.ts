import 'dotenv/config';
import supabase from '../config/supabase';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  try {
    console.log('🔄 Running migration: add_operatorIds_to_machines.sql\n');

    const migrationPath = path.join(__dirname, '../../migrations/add_operatorIds_to_machines.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolon to execute each statement separately
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('COMMENT ON')) {
        console.log('  ⏭️  Skipping COMMENT statement (not supported via REST API)');
        continue;
      }

      console.log('  📝 Executing statement...');
      const { error } = await supabase.rpc('exec_sql', { sql: statement });

      if (error) {
        // Try alternative approach: direct ALTER TABLE via rpc
        console.log('  ⚠️  RPC method failed, trying direct execution...');

        // For this specific case, we'll use the Supabase client library
        // which doesn't support raw SQL via REST API
        // We need to execute this manually in Supabase dashboard
        console.log('\n❌ Migration must be executed manually in Supabase SQL Editor:');
        console.log('1. Go to Supabase Dashboard > SQL Editor');
        console.log('2. Run this SQL:\n');
        console.log('─'.repeat(60));
        console.log(migrationSQL);
        console.log('─'.repeat(60));
        return;
      }

      console.log('  ✅ Statement executed successfully');
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\nPlease execute this SQL manually in Supabase Dashboard:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Run the migration from: server/migrations/add_operatorIds_to_machines.sql');
    process.exit(1);
  }
}

runMigration().then(() => {
  console.log('\n✅ Migration script finished');
  process.exit(0);
});
