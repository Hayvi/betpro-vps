import { Router } from 'express';
import { query, pool } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { broadcast } from '../services/websocket.js';

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
  
  const isUnlimitedSender = ['super_admin', 'admin'].includes(req.user.role);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Get receiver
    const recvRes = await client.query('SELECT id FROM profiles WHERE username = $1 AND is_active = true', [receiverUsername]);
    if (!recvRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    const receiverId = recvRes.rows[0].id;
    
    // Cannot transfer to self
    if (receiverId === req.user.userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'invalid_target' });
    }
    
    // Check sender balance (skip for super_admin/admin)
    if (!isUnlimitedSender) {
      const senderRes = await client.query('SELECT balance FROM profiles WHERE id = $1 FOR UPDATE', [req.user.userId]);
      if (Number(senderRes.rows[0].balance) < parsedAmount) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'insufficient_balance' });
      }
      // Deduct from sender
      await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [parsedAmount, req.user.userId]);
    }
    
    // Add to receiver
    await client.query('UPDATE profiles SET balance = balance + $1 WHERE id = $2', [parsedAmount, receiverId]);
    const txRes = await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, receiverId, parsedAmount, 'transfer']
    );
    
    await client.query('COMMIT');
    
    // Get updated balances and broadcast
    const receiverBal = await client.query('SELECT balance FROM profiles WHERE id = $1', [receiverId]);
    broadcast(receiverId, { type: 'balance_update', balance: receiverBal.rows[0].balance });
    
    if (!isUnlimitedSender) {
      const senderBal = await client.query('SELECT balance FROM profiles WHERE id = $1', [req.user.userId]);
      broadcast(req.user.userId, { type: 'balance_update', balance: senderBal.rows[0].balance });
    }
    
    // Broadcast transaction to both parties
    const tx = txRes.rows[0];
    broadcast(req.user.userId, { type: 'transaction', data: tx });
    broadcast(req.user.userId, { type: 'users_update' });
    broadcast(receiverId, { type: 'transaction', data: tx });
    
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Credit user balance (admin) - creates money, no balance check for admin
router.post('/credit', requireRole('super_admin', 'admin'), async (req, res) => {
  const { targetUsername, amount } = req.body;
  const parsedAmount = Number(amount);
  
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const targetRes = await client.query('SELECT id FROM profiles WHERE username = $1 AND is_active = true', [targetUsername]);
    if (!targetRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    const targetId = targetRes.rows[0].id;
    
    // Credit target user (admin creates money - no deduction from admin)
    await client.query('UPDATE profiles SET balance = balance + $1 WHERE id = $2', [parsedAmount, targetId]);
    const txRes = await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.userId, targetId, parsedAmount, 'credit']
    );
    
    await client.query('COMMIT');
    
    // Get updated balance and broadcast
    const targetBal = await client.query('SELECT balance FROM profiles WHERE id = $1', [targetId]);
    broadcast(targetId, { type: 'balance_update', balance: targetBal.rows[0].balance });
    
    // Broadcast transaction
    const tx = txRes.rows[0];
    broadcast(req.user.userId, { type: 'transaction', data: tx });
    broadcast(req.user.userId, { type: 'users_update' });
    broadcast(targetId, { type: 'transaction', data: tx });
    
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Debit user balance (admin) - takes money from user, destroys it (no add to admin)
router.post('/debit', requireRole('super_admin', 'admin'), async (req, res) => {
  const { targetUsername, amount } = req.body;
  const parsedAmount = Number(amount);
  
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const targetRes = await client.query('SELECT id, balance FROM profiles WHERE username = $1 AND is_active = true FOR UPDATE', [targetUsername]);
    if (!targetRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    
    const targetId = targetRes.rows[0].id;
    
    // Cannot debit yourself
    if (targetId === req.user.userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'invalid_target' });
    }
    
    if (Number(targetRes.rows[0].balance) < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    // Debit from user (admin destroys money - no addition to admin)
    await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [parsedAmount, targetId]);
    const txRes = await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [targetId, req.user.userId, parsedAmount, 'debit']
    );
    
    await client.query('COMMIT');
    
    // Get updated balance and broadcast
    const targetBal = await client.query('SELECT balance FROM profiles WHERE id = $1', [targetId]);
    broadcast(targetId, { type: 'balance_update', balance: targetBal.rows[0].balance });
    
    // Broadcast transaction
    const tx = txRes.rows[0];
    broadcast(req.user.userId, { type: 'transaction', data: tx });
    broadcast(req.user.userId, { type: 'users_update' });
    broadcast(targetId, { type: 'transaction', data: tx });
    
    res.json({ success: true });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

export default router;
