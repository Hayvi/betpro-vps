import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '@/services/apiClient';
import { connectWs, disconnectWs, onWsMessage } from '@/services/wsClient';
import { useToast } from '@/contexts/ToastContext';
import { useI18n } from '@/contexts/I18nContext';

const AuthContext = createContext(null);

const SESSION_ID_KEY = 'betpro_session_id';
const DEVICE_ID_KEY = 'betpro_device_id';

function getOrCreateId(key, storage = localStorage) {
  let id = storage.getItem(key);
  if (!id) {
    id = crypto.randomUUID?.() || String(Date.now());
    storage.setItem(key, id);
  }
  return id;
}

export function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showError, showWarning } = useToast();
  const { t } = useI18n();
  const presenceRef = useRef(null);

  const clearState = useCallback(() => {
    setUserId(null);
    setRole(null);
    setError(null);
    setToken(null);
    disconnectWs();
    if (presenceRef.current) clearInterval(presenceRef.current);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('betpro_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.users.me()
      .then((user) => {
        if (user?.is_active) {
          setUserId(user.id);
          setRole(user.role);
          connectWs(token);
        } else {
          clearState();
        }
      })
      .catch(() => clearState())
      .finally(() => setLoading(false));
  }, [clearState]);

  // WebSocket listeners for account events
  useEffect(() => {
    if (!userId) return;

    const handleLogout = (reason) => {
      const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
      if (sessionId) api.presence.end(sessionId, reason).catch(() => {});
      clearState();
      navigate('/home', { replace: true });
      if (reason === 'account_disabled') showError(t('auth_account_disabled'));
      else if (reason === 'password_changed') showWarning(t('auth_password_changed'));
    };

    const unsub1 = onWsMessage('account_disabled', () => handleLogout('account_disabled'));
    const unsub2 = onWsMessage('password_changed', () => handleLogout('password_changed'));

    return () => { unsub1(); unsub2(); };
  }, [userId, clearState, navigate, showError, showWarning, t]);

  // Presence heartbeat
  useEffect(() => {
    if (!userId) return;

    const sessionId = getOrCreateId(SESSION_ID_KEY, sessionStorage);
    const deviceId = getOrCreateId(DEVICE_ID_KEY);

    const tick = () => {
      api.presence.heartbeat({ sessionId, deviceId }).catch(() => {});
    };

    tick();
    presenceRef.current = setInterval(tick, 30000); // every 30s

    return () => {
      clearInterval(presenceRef.current);
      api.presence.end(sessionId, 'unmount').catch(() => {});
    };
  }, [userId]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.auth.login(username, password);
      setToken(data.token);
      setUserId(data.userId);
      setRole(data.role);
      connectWs(data.token);

      const target = data.role === 'super_admin' ? '/dashboard/super'
        : data.role === 'admin' ? '/dashboard/admin'
        : data.role === 'sub_admin' ? '/dashboard/sub'
        : '/dashboard/user';

      navigate(target, { replace: true });
      return { user_id: data.userId, role: data.role };
    } catch (err) {
      const errCode = err.error || 'unexpected_error';
      setError(errCode);
      return { error: errCode };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    if (sessionId) await api.presence.end(sessionId, 'logout').catch(() => {});
    await api.auth.logout().catch(() => {});
    clearState();
    navigate('/home', { replace: true });
  }, [clearState, navigate]);

  const value = useMemo(() => ({
    userId,
    role,
    loading,
    error,
    isAuthenticated: !!userId,
    login,
    logout,
  }), [userId, role, loading, error, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
