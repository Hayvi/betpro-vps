import { Router } from 'express';
import { query, pool } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { broadcast } from '../services/websocket.js';

const router = Router();
router.use(authMiddleware);

// Check if caller can manage target user
async function canManageUser(callerId, callerRole, targetUserId) {
  if (callerRole === 'super_admin') return true;
  const res = await query('SELECT created_by FROM profiles WHERE id = $1', [targetUserId]);
  return res.rows[0]?.created_by === callerId;
}

// Create withdrawal request
router.post('/', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
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
      'SELECT id, balance, created_by FROM profiles WHERE username = $1 AND is_active = true',
      [targetUsername]
    );
    if (!targetRes.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'user_not_found' });
    }
    
    const target = targetRes.rows[0];
    
    // Cannot request from self
    if (target.id === req.user.userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'invalid_target' });
    }
    
    // Sub-admin can only request from users they created
    if (req.user.role === 'sub_admin' && target.created_by !== req.user.userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'not_authorized' });
    }
    
    if (Number(target.balance) < parsedAmount) {
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
    
    // Notify target user
    broadcast(target.id, { type: 'withdrawal_request', request: result.rows[0] });
    
    res.json({ data: result.rows[0] });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Approve withdrawal - ONLY target user can approve
router.post('/:id/approve', async (req, res) => {
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
    
    // Only target user can approve
    if (wr.target_user_id !== req.user.userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'not_authorized' });
    }
    
    // Check if expired (1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (new Date(wr.created_at) < oneHourAgo) {
      await client.query(
        "UPDATE withdrawal_requests SET status = 'expired' WHERE id = $1",
        [req.params.id]
      );
      await client.query('COMMIT');
      return res.status(400).json({ error: 'request_expired' });
    }
    
    // Check balance (convert to numbers for proper comparison)
    const balRes = await client.query(
      'SELECT balance FROM profiles WHERE id = $1 FOR UPDATE',
      [wr.target_user_id]
    );
    if (Number(balRes.rows[0].balance) < Number(wr.amount)) {
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
    
    // Record transaction
    await client.query(
      'INSERT INTO transactions (sender_id, receiver_id, amount, type) VALUES ($1, $2, $3, $4)',
      [wr.target_user_id, wr.requester_id, wr.amount, 'debit']
    );
    
    await client.query('COMMIT');
    
    // Broadcast balance updates
    const [targetBal, requesterBal] = await Promise.all([
      client.query('SELECT balance FROM profiles WHERE id = $1', [wr.target_user_id]),
      client.query('SELECT balance FROM profiles WHERE id = $1', [wr.requester_id])
    ]);
    broadcast(wr.target_user_id, { type: 'balance_update', balance: targetBal.rows[0].balance });
    broadcast(wr.requester_id, { type: 'balance_update', balance: requesterBal.rows[0].balance });
    broadcast(wr.requester_id, { type: 'withdrawal_approved', requestId: req.params.id });
    
    res.json({ data: { success: true } });
  } catch {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'unexpected_error' });
  } finally {
    client.release();
  }
});

// Reject withdrawal - ONLY target user can reject
router.post('/:id/reject', async (req, res) => {
  try {
    // Get request first to check ownership
    const reqRes = await query(
      'SELECT * FROM withdrawal_requests WHERE id = $1 AND status = $2',
      [req.params.id, 'pending']
    );
    if (!reqRes.rows[0]) {
      return res.status(404).json({ error: 'request_not_found' });
    }
    
    // Only target user can reject
    if (reqRes.rows[0].target_user_id !== req.user.userId) {
      return res.status(403).json({ error: 'not_authorized' });
    }
    
    const result = await query(
      `UPDATE withdrawal_requests SET status = 'rejected', approved_by = $1, approved_at = NOW()
       WHERE id = $2 RETURNING *`,
      [req.user.userId, req.params.id]
    );
    
    // Notify requester
    broadcast(reqRes.rows[0].requester_id, { type: 'withdrawal_rejected', requestId: req.params.id });
    
    res.json({ data: { success: true } });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Get pending requests FOR ME to approve (I'm the target)
router.get('/pending', async (req, res) => {
  try {
    const result = await query(
      `SELECT wr.*, p.username as requester_username 
       FROM withdrawal_requests wr
       JOIN profiles p ON p.id = wr.requester_id
       WHERE wr.target_user_id = $1 AND wr.status = 'pending' 
       ORDER BY wr.created_at DESC`,
      [req.user.userId]
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
