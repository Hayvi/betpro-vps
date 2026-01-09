import { Router } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { broadcast } from '../services/websocket.js';

const router = Router();

router.use(authMiddleware);

// Get users managed by current admin
router.get('/users', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT id, username, role, balance, is_active, created_at 
       FROM profiles WHERE created_by = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user
router.post('/users', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  const { username, password, role } = req.body;
  
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO profiles (username, password_hash, role, created_by, is_active)
       VALUES ($1, $2, $3, $4, true) RETURNING id, username, role`,
      [username, hash, role, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Username exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Disable user
router.patch('/users/:id/disable', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  try {
    await query('UPDATE profiles SET is_active = false WHERE id = $1', [req.params.id]);
    broadcast(req.params.id, { type: 'account_disabled' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change user password
router.patch('/users/:id/password', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  const { password } = req.body;
  
  try {
    const hash = await bcrypt.hash(password, 10);
    await query('UPDATE profiles SET password_hash = $1 WHERE id = $2', [hash, req.params.id]);
    broadcast(req.params.id, { type: 'password_changed' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
