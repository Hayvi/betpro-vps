import { Router } from 'express';
import { query, pool } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { broadcast } from '../services/websocket.js';

const router = Router();

router.post('/place', authMiddleware, async (req, res) => {
  const { stake, bets, accumulatorOdds, potentialWin, promoCode } = req.body;
  const userId = req.user.userId;
  
  // Validate input
  const parsedStake = Number(stake);
  if (!parsedStake || parsedStake < 1) {
    return res.status(400).json({ error: 'invalid_stake' });
  }
  if (!Array.isArray(bets) || bets.length === 0) {
    return res.status(400).json({ error: 'invalid_bets' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get balance and check user is active
    const balRes = await client.query('SELECT balance, is_active FROM profiles WHERE id = $1 FOR UPDATE', [userId]);
    if (!balRes.rows[0] || !balRes.rows[0].is_active) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'account_inactive' });
    }
    
    const balance = balRes.rows[0].balance || 0;
    
    if (balance < parsedStake) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    // Deduct balance
    const newBalance = balance - parsedStake;
    await client.query('UPDATE profiles SET balance = $1 WHERE id = $2', [newBalance, userId]);
    
    // Create bet slip
    const slipRes = await client.query(
      `INSERT INTO bet_slips (user_id, total_stake, accumulator_odds, potential_win, promo_code, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [userId, parsedStake, accumulatorOdds, potentialWin, promoCode || null]
    );
    
    // Create individual bets
    for (const bet of bets) {
      await client.query(
        `INSERT INTO bets (user_id, match_id, bet_type, odds, stake, potential_win, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [userId, bet.matchId, bet.betType, bet.odds, parsedStake / bets.length, (parsedStake / bets.length) * bet.odds]
      );
    }
    
    await client.query('COMMIT');
    
    // Broadcast balance update to user and their admin
    broadcast(userId, { type: 'balance_update', balance: newBalance });
    
    // Notify admin who created this user
    const userRes = await query('SELECT created_by FROM profiles WHERE id = $1', [userId]);
    if (userRes.rows[0]?.created_by) {
      broadcast(userRes.rows[0].created_by, { type: 'users_update' });
    }
    
    res.json({ ...slipRes.rows[0], newBalance });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM bets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1000',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
