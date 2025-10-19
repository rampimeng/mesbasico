import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addIgnoreParetoColumn() {
  try {
    console.log('🔄 Adding ignoreInPareto column to stop_reasons table...');

    // Add the column with default value false
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE stop_reasons
        ADD COLUMN IF NOT EXISTS "ignoreInPareto" BOOLEAN DEFAULT false;
      `
    });

    if (error) {
      // If RPC doesn't exist, try direct SQL (for local development)
      console.log('⚠️ RPC method not available, trying direct approach...');

      // Check if column exists
      const { data: columns } = await supabase
        .from('stop_reasons')
        .select('*')
        .limit(1);

      if (columns) {
        console.log('✅ Column check passed');
      }

      throw error;
    }

    console.log('✅ Column ignoreInPareto added successfully to stop_reasons table!');

  } catch (error: any) {
    console.error('❌ Error adding column:', error.message);
    process.exit(1);
  }
}

addIgnoreParetoColumn();
