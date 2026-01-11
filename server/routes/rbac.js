import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query, pool } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { broadcast } from '../services/websocket.js';
import { nanoid } from 'nanoid';

// Role hierarchy helper
function canCreateRole(creatorRole, targetRole) {
  if (creatorRole === 'super_admin' && ['admin', 'sub_admin', 'user'].includes(targetRole)) return true;
  if (creatorRole === 'admin' && ['sub_admin', 'user'].includes(targetRole)) return true;
  if (creatorRole === 'sub_admin' && targetRole === 'user') return true;
  return false;
}

// Check if caller can manage target user
async function canManageUser(callerId, callerRole, targetUserId) {
  if (callerRole === 'super_admin') return true;
  const res = await query('SELECT created_by FROM profiles WHERE id = $1', [targetUserId]);
  return res.rows[0]?.created_by === callerId;
}

const router = Router();
router.use(authMiddleware);

// Get managed users (paginated)
router.get('/users', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  const offset = (page - 1) * pageSize;
  
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const cols = isSuperAdmin 
      ? 'id, username, role, balance, created_at, created_by, plain_pw'
      : 'id, username, role, balance, created_at, created_by';
    
    let countQ, dataQ;
    if (isSuperAdmin) {
      countQ = await query('SELECT COUNT(*) FROM profiles WHERE is_active = true');
      dataQ = await query(
        `SELECT ${cols} FROM profiles WHERE is_active = true ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
    } else {
      countQ = await query('SELECT COUNT(*) FROM profiles WHERE is_active = true AND created_by = $1', [req.user.userId]);
      dataQ = await query(
        `SELECT ${cols} FROM profiles WHERE is_active = true AND created_by = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.user.userId, pageSize, offset]
      );
    }
    
    res.json({ users: dataQ.rows, totalCount: parseInt(countQ.rows[0].count) });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Get inactive users
router.get('/users/inactive', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    const cols = isSuperAdmin 
      ? 'id, username, role, balance, created_at, created_by, plain_pw'
      : 'id, username, role, balance, created_at, created_by';
    
    let result;
    if (isSuperAdmin) {
      result = await query(`SELECT ${cols} FROM profiles WHERE is_active = false ORDER BY created_at DESC LIMIT 100`);
    } else {
      result = await query(
        `SELECT ${cols} FROM profiles WHERE is_active = false AND created_by = $1 ORDER BY created_at DESC LIMIT 100`,
        [req.user.userId]
      );
    }
    res.json({ users: result.rows });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Create user account
router.post('/users', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  const { targetRole } = req.body;
  
  // Validate role hierarchy
  if (!canCreateRole(req.user.role, targetRole)) {
    return res.status(403).json({ error: 'invalid_role' });
  }
  
  const username = nanoid(8);
  const password = nanoid(12);
  
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO profiles (username, password_hash, plain_pw, role, created_by, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id, username, role`,
      [username, hash, password, targetRole, req.user.userId]
    );
    
    // Broadcast users update to creator
    broadcast(req.user.userId, { type: 'users_update' });
    
    res.json({ username, password, ...result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'username_exists' });
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Reset user password
router.patch('/users/:id/password', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  const { newPassword } = req.body;
  
  // Validate password
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'invalid_password' });
  }
  
  // Check ownership
  if (!await canManageUser(req.user.userId, req.user.role, req.params.id)) {
    return res.status(403).json({ error: 'not_authorized' });
  }
  
  try {
    // Check target exists and is active
    const targetRes = await query('SELECT is_active FROM profiles WHERE id = $1', [req.params.id]);
    if (!targetRes.rows[0]) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    if (!targetRes.rows[0].is_active) {
      return res.status(400).json({ error: 'user_inactive' });
    }
    
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE profiles SET password_hash = $1, plain_pw = $2 WHERE id = $3', [hash, newPassword, req.params.id]);
    broadcast(req.params.id, { type: 'password_changed' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Restore user account - only super_admin can restore
router.patch('/users/:id/restore', requireRole('super_admin'), async (req, res) => {
  // Cannot restore yourself
  if (req.params.id === req.user.userId) {
    return res.status(400).json({ error: 'invalid_target' });
  }
  
  try {
    // Check target exists and is not super_admin
    const targetRes = await query('SELECT role, is_active FROM profiles WHERE id = $1', [req.params.id]);
    if (!targetRes.rows[0]) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    if (targetRes.rows[0].role === 'super_admin') {
      return res.status(403).json({ error: 'not_authorized' });
    }
    if (targetRes.rows[0].is_active) {
      return res.status(400).json({ error: 'already_active' });
    }
    
    await query('UPDATE profiles SET is_active = true WHERE id = $1', [req.params.id]);
    broadcast(req.user.userId, { type: 'users_update' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Delete (soft) user account - only super_admin can delete
router.delete('/users/:id', requireRole('super_admin'), async (req, res) => {
  // Cannot delete yourself
  if (req.params.id === req.user.userId) {
    return res.status(400).json({ error: 'invalid_target' });
  }
  
  try {
    // Check target is not super_admin
    const targetRes = await query('SELECT role FROM profiles WHERE id = $1', [req.params.id]);
    if (!targetRes.rows[0]) {
      return res.status(404).json({ error: 'user_not_found' });
    }
    if (targetRes.rows[0].role === 'super_admin') {
      return res.status(403).json({ error: 'not_authorized' });
    }
    
    await query('UPDATE profiles SET is_active = false WHERE id = $1', [req.params.id]);
    broadcast(req.params.id, { type: 'account_disabled' });
    broadcast(req.user.userId, { type: 'users_update' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Get my transactions (super_admin sees all)
router.get('/transactions', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  const offset = (page - 1) * pageSize;
  
  try {
    const isSuperAdmin = req.user.role === 'super_admin';
    
    let countQ, dataQ;
    if (isSuperAdmin) {
      countQ = await query('SELECT COUNT(*) FROM transactions');
      dataQ = await query(
        `SELECT id, sender_id, receiver_id, amount, type, created_at FROM transactions 
         ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
    } else {
      countQ = await query(
        'SELECT COUNT(*) FROM transactions WHERE sender_id = $1 OR receiver_id = $1',
        [req.user.userId]
      );
      dataQ = await query(
        `SELECT id, sender_id, receiver_id, amount, type, created_at FROM transactions 
         WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [req.user.userId, pageSize, offset]
      );
    }
    res.json({ transactions: dataQ.rows, totalCount: parseInt(countQ.rows[0].count) });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

// Change own password
router.patch('/password', async (req, res) => {
  const { newPassword } = req.body;
  
  // Validate password length
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'invalid_password' });
  }
  
  try {
    const hash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE profiles SET password_hash = $1, plain_pw = $2 WHERE id = $3', [hash, newPassword, req.user.userId]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

export default router;
