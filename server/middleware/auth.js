import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is still active
    const result = await query('SELECT is_active, role FROM profiles WHERE id = $1', [decoded.userId]);
    if (!result.rows[0] || !result.rows[0].is_active) {
      return res.status(401).json({ error: 'Account disabled' });
    }
    
    // Update role in case it changed
    req.user = { ...decoded, role: result.rows[0].role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
