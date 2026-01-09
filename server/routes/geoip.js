import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.ip || null;
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const ip = getClientIp(req);
    const target = ip ? `https://ipapi.co/${encodeURIComponent(ip)}/json/` : 'https://ipapi.co/json/';

    const response = await fetch(target, {
      headers: { 'User-Agent': 'betpro-geoip' },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data || data.error) {
      return res.status(502).json({ error: 'geoip_failed' });
    }

    res.json({
      ip: ip || data.ip || null,
      country: data.country_name || data.country || null,
      region: data.region || null,
      city: data.city || null,
      lat: typeof data.latitude === 'number' ? data.latitude : Number(data.latitude) || null,
      lng: typeof data.longitude === 'number' ? data.longitude : Number(data.longitude) || null,
    });
  } catch {
    res.status(500).json({ error: 'unexpected_error' });
  }
});

export default router;
