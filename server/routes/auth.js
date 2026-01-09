import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await query(
      'SELECT id, username, password_hash, role, is_active FROM profiles WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, userId: user.id, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  // Client-side token removal; optionally add token blacklist here
  res.json({ success: true });
});

router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Check user still active
    const result = await query('SELECT is_active FROM profiles WHERE id = $1', [decoded.userId]);
    if (!result.rows[0]?.is_active) {
      return res.status(401).json({ error: 'Account disabled' });
    }
    
    const newToken = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token: newToken });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
