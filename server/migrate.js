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

    // 3. Export bets
    console.log('📥 Exporting bets from Supabase...');
    const { data: bets, error: betsError } = await supabase
      .from('bets')
      .select('*')
      .order('created_at');

    if (betsError) {
      console.error('❌ Error fetching bets:', betsError);
      return;
    }

    console.log(`✅ Found ${bets.length} bets`);

    // 4. Export bet_slips
    console.log('📥 Exporting bet slips from Supabase...');
    const { data: betSlips, error: betSlipsError } = await supabase
      .from('bet_slips')
      .select('*')
      .order('created_at');

    if (betSlipsError) {
      console.error('❌ Error fetching bet slips:', betSlipsError);
      return;
    }

    console.log(`✅ Found ${betSlips.length} bet slips`);

    // 5. Export withdrawal_requests
    console.log('📥 Exporting withdrawal requests from Supabase...');
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at');

    if (withdrawalsError) {
      console.error('❌ Error fetching withdrawal requests:', withdrawalsError);
      return;
    }

    console.log(`✅ Found ${withdrawals.length} withdrawal requests`);

    // 6. Clear existing data (except root_admin)
    console.log('🧹 Clearing existing local data...');
    await pool.query('DELETE FROM withdrawal_requests');
    await pool.query('DELETE FROM bets');
    await pool.query('DELETE FROM bet_slips');
    await pool.query('DELETE FROM transactions');
    await pool.query("DELETE FROM profiles WHERE username != 'root_admin'");

    // 7. Import profiles
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
    }

    // 8. Import transactions
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

    // 9. Import bet_slips
    console.log('📤 Importing bet slips to PostgreSQL...');
    for (const slip of betSlips) {
      await pool.query(
        `INSERT INTO bet_slips (id, user_id, total_stake, accumulator_odds, potential_win, promo_code, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          slip.id,
          slip.user_id,
          slip.total_stake,
          slip.accumulator_odds,
          slip.potential_win,
          slip.promo_code,
          slip.status || 'pending',
          slip.created_at
        ]
      );
    }

    // 10. Import bets
    console.log('📤 Importing bets to PostgreSQL...');
    for (const bet of bets) {
      await pool.query(
        `INSERT INTO bets (id, user_id, match_id, bet_type, odds, stake, potential_win, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          bet.id,
          bet.user_id,
          bet.match_id,
          bet.bet_type,
          bet.odds,
          bet.stake,
          bet.potential_win,
          bet.status || 'pending',
          bet.created_at
        ]
      );
    }

    // 11. Import withdrawal_requests
    console.log('📤 Importing withdrawal requests to PostgreSQL...');
    for (const wr of withdrawals) {
      await pool.query(
        `INSERT INTO withdrawal_requests (id, requester_id, target_user_id, amount, status, approved_by, approved_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          wr.id,
          wr.requester_id,
          wr.target_user_id,
          wr.amount,
          wr.status || 'pending',
          wr.approved_by,
          wr.approved_at,
          wr.created_at
        ]
      );
    }

    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Migrated:`);
    console.log(`   - ${profiles.length} profiles`);
    console.log(`   - ${transactions.length} transactions`);
    console.log(`   - ${betSlips.length} bet slips`);
    console.log(`   - ${bets.length} bets`);
    console.log(`   - ${withdrawals.length} withdrawal requests`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateData();
