import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, role, balance, is_active, created_at FROM profiles WHERE id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0] || null);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT balance FROM profiles WHERE id = $1', [req.user.userId]);
    res.json({ balance: result.rows[0]?.balance || 0 });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
