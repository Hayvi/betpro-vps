import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// Cleanup stale sessions (called periodically or on heartbeat)
async function cleanupStaleSessions() {
  try {
    // Mark sessions as stale if no heartbeat for 2 minutes
    await query(
      `UPDATE presence_sessions 
       SET ended_at = last_seen_at, end_reason = 'stale'
       WHERE ended_at IS NULL AND last_seen_at < NOW() - INTERVAL '2 minutes'`
    );
    
    // Archive old ended sessions to history (older than 1 hour)
    await query(
      `INSERT INTO presence_history (user_id, session_id, device_id, ip_address, country, city, lat, lng, started_at, last_seen_at, ended_at, end_reason)
       SELECT user_id, session_id, device_id, ip_address, country, city, lat, lng, started_at, last_seen_at, ended_at, end_reason
       FROM presence_sessions
       WHERE ended_at IS NOT NULL AND ended_at < NOW() - INTERVAL '1 hour'`
    );
    
    // Delete archived sessions
    await query(
      `DELETE FROM presence_sessions 
       WHERE ended_at IS NOT NULL AND ended_at < NOW() - INTERVAL '1 hour'`
    );
  } catch (err) {
    console.error('Presence cleanup error:', err);
  }
}

// Run cleanup every minute
setInterval(cleanupStaleSessions, 60000);

// Upsert presence session (heartbeat)
router.post('/heartbeat', async (req, res) => {
  const { sessionId, deviceId, ipData, gpsData } = req.body;
  const userId = req.user.userId;
  
  if (!sessionId || !deviceId) {
    return res.status(400).json({ error: 'missing_identity' });
  }
  
  try {
    await query(
      `INSERT INTO presence_sessions (user_id, session_id, device_id, ip_address, country, city, lat, lng, last_seen_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (user_id, session_id) DO UPDATE SET
         last_seen_at = NOW(),
         ip_address = COALESCE($4, presence_sessions.ip_address),
         country = COALESCE($5, presence_sessions.country),
         city = COALESCE($6, presence_sessions.city),
         lat = COALESCE($7, presence_sessions.lat),
         lng = COALESCE($8, presence_sessions.lng)`,
      [
        userId,
        sessionId,
        deviceId,
        ipData?.ip || null,
        ipData?.country || null,
        ipData?.city || null,
        gpsData?.lat || null,
        gpsData?.lng || null,
      ]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'presence_failed' });
  }
});

// End presence session
router.post('/end', async (req, res) => {
  const { sessionId, reason } = req.body;
  
  try {
    await query(
      `UPDATE presence_sessions SET ended_at = NOW(), end_reason = $1
       WHERE user_id = $2 AND session_id = $3`,
      [reason || 'logout', req.user.userId, sessionId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'presence_end_failed' });
  }
});

// Get active sessions for a user (admin)
router.get('/user/:userId', requireRole('super_admin', 'admin', 'sub_admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM presence_sessions 
       WHERE user_id = $1 AND ended_at IS NULL 
       ORDER BY last_seen_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all active sessions (super admin dashboard)
router.get('/active', requireRole('super_admin', 'admin'), async (req, res) => {
  try {
    const result = await query(
      `SELECT ps.*, p.username 
       FROM presence_sessions ps
       JOIN profiles p ON p.id = ps.user_id
       WHERE ps.ended_at IS NULL AND ps.last_seen_at > NOW() - INTERVAL '2 minutes'
       ORDER BY ps.last_seen_at DESC`
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
