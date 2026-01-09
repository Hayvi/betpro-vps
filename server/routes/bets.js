import { Router } from 'express';
import { query, pool } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/place', authMiddleware, async (req, res) => {
  const { stake, bets, accumulatorOdds, potentialWin, promoCode } = req.body;
  const userId = req.user.userId;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get balance
    const balRes = await client.query('SELECT balance FROM profiles WHERE id = $1 FOR UPDATE', [userId]);
    const balance = balRes.rows[0]?.balance || 0;
    
    if (balance < stake) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    // Deduct balance
    await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [stake, userId]);
    
    // Create bet slip
    const slipRes = await client.query(
      `INSERT INTO bet_slips (user_id, total_stake, accumulator_odds, potential_win, promo_code, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [userId, stake, accumulatorOdds, potentialWin, promoCode || null]
    );
    
    // Create individual bets
    for (const bet of bets) {
      await client.query(
        `INSERT INTO bets (user_id, match_id, bet_type, odds, stake, potential_win, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
        [userId, bet.matchId, bet.betType, bet.odds, stake / bets.length, (stake / bets.length) * bet.odds]
      );
    }
    
    await client.query('COMMIT');
    res.json({ ...slipRes.rows[0], newBalance: balance - stake });
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
