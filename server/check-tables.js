import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://guqgaukyxnnfohzbpcce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cWdhdWt5eG5uZm9oemJwY2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTQ4NjgsImV4cCI6MjA4MDEzMDg2OH0.wIhM7NIosDkW5cGPGuuYs5YfSUdC49TP3z01nfdQDtQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('🔍 Checking what tables exist in Supabase...');

  const tables = ['profiles', 'transactions', 'bets', 'bet_slips', 'withdrawal_requests', 'presence_sessions', 'presence_history'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: exists (${data.length} sample records)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

checkTables();
