import { api } from '@/services/apiClient';

const DEVICE_ID_KEY = 'betpro_device_id';
const SESSION_ID_KEY = 'betpro_session_id';

export function getDeviceId() {
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || String(Date.now());
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getSessionId() {
  return sessionStorage.getItem(SESSION_ID_KEY);
}

export function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_ID_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || String(Date.now());
    sessionStorage.setItem(SESSION_ID_KEY, id);
  }
  return id;
}

export function clearSessionId() {
  sessionStorage.removeItem(SESSION_ID_KEY);
}

export async function fetchGeoIp() {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return { data: { ip: data.ip, country: data.country_name, city: data.city }, error: null };
  } catch {
    return { data: null, error: 'geoip_failed' };
  }
}

export async function getGpsLocation() {
  if (!navigator.geolocation) return { data: null, error: 'not_supported' };

  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, maximumAge: 10000 });
    });
    return { data: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }, error: null };
  } catch {
    return { data: null, error: 'gps_denied' };
  }
}

export async function upsertPresenceSession({ sessionId, deviceId, ipData, gpsData }) {
  try {
    await api.presence.heartbeat({ sessionId, deviceId, ipData, gpsData });
    return { error: null };
  } catch {
    return { error: 'presence_failed' };
  }
}

export async function endPresenceSession({ sessionId, reason }) {
  try {
    await api.presence.end(sessionId, reason);
    return { error: null };
  } catch {
    return { error: 'presence_end_failed' };
  }
}
