import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/services/apiClient';

const CONNECTED_WINDOW_MS = 120000; // 2 minutes for REST API polling

export function usePresenceDashboard({ enabled = true } = {}) {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setSessions([]);
      setLoadingSessions(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await api.presence.active();
        if (!cancelled) setSessions(data || []);
      } catch {
        if (!cancelled) setSessions([]);
      } finally {
        if (!cancelled) setLoadingSessions(false);
      }
    };

    load();
    pollRef.current = setInterval(load, 30000); // Poll every 30s

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enabled]);

  const counts = useMemo(() => {
    const byRole = { super_admin: 0, admin: 0, sub_admin: 0, user: 0 };
    for (const s of sessions) {
      if (s?.role && Object.prototype.hasOwnProperty.call(byRole, s.role)) {
        byRole[s.role] += 1;
      }
    }
    return { total: sessions.length, byRole };
  }, [sessions]);

  return {
    sessions,
    loadingSessions,
    history: [],
    loadingHistory: false,
    counts,
    connectedWindowMs: CONNECTED_WINDOW_MS,
  };
}
