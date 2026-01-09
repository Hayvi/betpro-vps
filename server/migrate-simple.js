import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import bcrypt from 'bcrypt';

const supabaseUrl = 'https://guqgaukyxnnfohzbpcce.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1cWdhdWt5eG5uZm9oemJwY2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTQ4NjgsImV4cCI6MjA4MDEzMDg2OH0.wIhM7NIosDkW5cGPGuuYs5YfSUdC49TP3z01nfdQDtQ';

const supabase = createClient(supabaseUrl, supabaseKey);

const pool = new pg.Pool({
  host: '/var/run/postgresql',
  port: 5432,
  database: 'betpro',
  user: 'postgres',
});

async function migrateData() {
  console.log('🚀 Starting Supabase to PostgreSQL migration...');

  try {
    // 1. Export profiles from Supabase
    console.log('📥 Exporting profiles from Supabase...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`✅ Found ${profiles.length} profiles`);

    // 2. Export transactions
    console.log('📥 Exporting transactions from Supabase...');
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at');

    if (txError) {
      console.error('❌ Error fetching transactions:', txError);
      return;
    }

    console.log(`✅ Found ${transactions.length} transactions`);

    // 3. Export presence sessions (if any)
    console.log('📥 Exporting presence sessions from Supabase...');
    const { data: presenceSessions, error: presenceError } = await supabase
      .from('presence_sessions')
      .select('*')
      .order('started_at');

    if (presenceError) {
      console.error('❌ Error fetching presence sessions:', presenceError);
    } else {
      console.log(`✅ Found ${presenceSessions.length} presence sessions`);
    }

    if (profiles.length === 0 && transactions.length === 0) {
      console.log('ℹ️  No data found in Supabase. Database appears to be empty.');
      console.log('✅ Migration completed - nothing to migrate.');
      return;
    }

    // 4. Clear existing data (except root_admin)
    console.log('🧹 Clearing existing local data...');
    await pool.query("DELETE FROM profiles WHERE username != 'root_admin'");
    await pool.query('DELETE FROM transactions');

    // 5. Import profiles
    if (profiles.length > 0) {
      console.log('📤 Importing profiles to PostgreSQL...');
      for (const profile of profiles) {
        // Skip if username already exists (like root_admin)
        const existing = await pool.query('SELECT id FROM profiles WHERE username = $1', [profile.username]);
        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipping existing user: ${profile.username}`);
          continue;
        }

        // Hash password if plain_pw exists, otherwise use existing hash
        let passwordHash = profile.password_hash;
        if (profile.plain_pw) {
          passwordHash = await bcrypt.hash(profile.plain_pw, 10);
        }

        await pool.query(
          `INSERT INTO profiles (id, username, password_hash, plain_pw, role, created_by, balance, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            profile.id,
            profile.username,
            passwordHash,
            profile.plain_pw,
            profile.role,
            profile.created_by,
            profile.balance || 0,
            profile.is_active !== false,
            profile.created_at,
            profile.updated_at || profile.created_at
          ]
        );
        console.log(`✅ Migrated user: ${profile.username} (${profile.role})`);
      }
    }

    // 6. Import transactions
    if (transactions.length > 0) {
      console.log('📤 Importing transactions to PostgreSQL...');
      for (const tx of transactions) {
        await pool.query(
          `INSERT INTO transactions (id, sender_id, receiver_id, amount, type, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            tx.id,
            tx.sender_id,
            tx.receiver_id,
            tx.amount,
            tx.type,
            tx.created_at
          ]
        );
      }
      console.log(`✅ Migrated ${transactions.length} transactions`);
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${profiles.length} profiles migrated`);
    console.log(`   - ${transactions.length} transactions migrated`);
    console.log(`   - Betting tables: Not present in Supabase (will be created fresh)`);
    console.log(`   - Withdrawal tables: Not present in Supabase (will be created fresh)`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateData();
