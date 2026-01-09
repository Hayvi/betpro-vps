import { Router } from 'express';
import { query, pool } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Get my balance
router.get('/balance', async (req, res) => {
  try {
    const result = await query('SELECT balance, username FROM profiles WHERE id = $1', [req.user.userId]);
    const row = result.rows[0];
    res.json({ balance: row?.balance || 0, username: row?.username || null });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Transfer money
router.post('/transfer', async (req, res) => {
  const { receiverUsername, amount } = req.body;
  const parsedAmount = Number(amount);
  
  if (!receiverUsername || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get receiver
    const recvRes = await client.query('SELECT id FROM profiles WHERE username = $1', [receiverUsername]);
    if (!recvRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    const receiverId = recvRes.rows[0].id;
    
    // Check sender balance
    const senderRes = await client.query('SELECT balance FROM profiles WHERE id = $1 FOR UPDATE', [req.user.userId]);
    if (senderRes.rows[0].balance < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    // Transfer
    await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [parsedAmount, req.user.userId]);
    await client.query('UPDATE profiles SET balance = balance + $1 WHERE id = $2', [parsedAmount, receiverId]);
    await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4)',
      [req.user.userId, receiverId, parsedAmount, 'transfer']
    );
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Credit user balance (admin)
router.post('/credit', async (req, res) => {
  const { targetUsername, amount } = req.body;
  const parsedAmount = Number(amount);
  
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const targetRes = await client.query('SELECT id FROM profiles WHERE username = $1', [targetUsername]);
    if (!targetRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    const targetId = targetRes.rows[0].id;
    
    // Deduct from admin
    const adminRes = await client.query('SELECT balance FROM profiles WHERE id = $1 FOR UPDATE', [req.user.userId]);
    if (adminRes.rows[0].balance < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [parsedAmount, req.user.userId]);
    await client.query('UPDATE profiles SET balance = balance + $1 WHERE id = $2', [parsedAmount, targetId]);
    await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4)',
      [req.user.userId, targetId, parsedAmount, 'credit']
    );
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Debit user balance (admin)
router.post('/debit', async (req, res) => {
  const { targetUsername, amount } = req.body;
  const parsedAmount = Number(amount);
  
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const targetRes = await client.query('SELECT id, balance FROM profiles WHERE username = $1 FOR UPDATE', [targetUsername]);
    if (!targetRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    
    if (targetRes.rows[0].balance < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    const targetId = targetRes.rows[0].id;
    await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [parsedAmount, targetId]);
    await client.query('UPDATE profiles SET balance = balance + $1 WHERE id = $2', [parsedAmount, req.user.userId]);
    await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4)',
      [targetId, req.user.userId, parsedAmount, 'debit']
    );
    
    await client.query('COMMIT');
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

export default router;
