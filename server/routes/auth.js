import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const router = Router();

// Simple rate limiting for login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);
  
  if (!attempts) return true;
  
  // Clean up old entries
  if (now - attempts.firstAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(ip);
    return true;
  }
  
  return attempts.count < MAX_ATTEMPTS;
}

function recordAttempt(ip, success) {
  const now = Date.now();
  
  if (success) {
    loginAttempts.delete(ip);
    return;
  }
  
  const attempts = loginAttempts.get(ip);
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    attempts.count++;
  }
}

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'too_many_attempts' });
  }
  
  try {
    const result = await query(
      'SELECT id, username, password_hash, role, is_active FROM profiles WHERE username = $1',
      [username]
    );
    
    const user = result.rows[0];
    if (!user || !user.is_active) {
      recordAttempt(ip, false);
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      recordAttempt(ip, false);
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    
    recordAttempt(ip, true);
    
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
