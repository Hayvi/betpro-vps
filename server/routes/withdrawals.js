import { Router } from 'express';
import { query, pool } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Create withdrawal request
router.post('/', async (req, res) => {
  const { targetUsername, amount } = req.body;
  const parsedAmount = Number(amount);
  
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: 'invalid_amount' });
  }
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Find target user
    const targetRes = await client.query(
      'SELECT id, balance FROM profiles WHERE username = $1',
      [targetUsername]
    );
    if (!targetRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    
    const target = targetRes.rows[0];
    if (target.balance < parsedAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    // Create request
    const result = await client.query(
      `INSERT INTO withdrawal_requests (requester_id, target_user_id, amount, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [req.user.userId, target.id, parsedAmount]
    );
    
    await client.query('COMMIT');
    res.json({ data: result.rows[0] });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Approve withdrawal
router.post('/:id/approve', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const reqRes = await client.query(
      'SELECT * FROM withdrawal_requests WHERE id = $1 AND status = $2 FOR UPDATE',
      [req.params.id, 'pending']
    );
    if (!reqRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'request_not_found' });
    }
    
    const wr = reqRes.rows[0];
    
    // Check balance
    const balRes = await client.query(
      'SELECT balance FROM profiles WHERE id = $1 FOR UPDATE',
      [wr.target_user_id]
    );
    if (balRes.rows[0].balance < wr.amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'insufficient_balance' });
    }
    
    // Deduct from target, add to requester
    await client.query('UPDATE profiles SET balance = balance - $1 WHERE id = $2', [wr.amount, wr.target_user_id]);
    await client.query('UPDATE profiles SET balance = balance + $1 WHERE id = $2', [wr.amount, wr.requester_id]);
    await client.query(
      'UPDATE withdrawal_requests SET status = $1, approved_by = $2, approved_at = NOW() WHERE id = $3',
      ['approved', req.user.userId, req.params.id]
    );
    
    await client.query('COMMIT');
    res.json({ data: { success: true } });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Reject withdrawal
router.post('/:id/reject', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  try {
    const result = await query(
      `UPDATE withdrawal_requests SET status = 'rejected', approved_by = $1, approved_at = NOW()
       WHERE id = $2 AND status = 'pending' RETURNING *`,
      [req.user.userId, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'request_not_found' });
    res.json({ data: { success: true } });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Get pending requests (for approvers)
router.get('/pending', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT wr.*, p.username as target_username 
       FROM withdrawal_requests wr
       JOIN profiles p ON p.id = wr.target_user_id
       WHERE wr.status = 'pending' ORDER BY wr.created_at DESC`
    );
    res.json({ requests: result.rows });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Get sent requests (by current user)
router.get('/sent', async (req, res) => {
  try {
    const result = await query(
      `SELECT wr.*, p.username as target_username
       FROM withdrawal_requests wr
       JOIN profiles p ON p.id = wr.target_user_id
       WHERE wr.requester_id = $1 ORDER BY wr.created_at DESC`,
      [req.user.userId]
    );
    res.json({ requests: result.rows });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

export default router;
