const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('betpro_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('betpro_token', token);
  else localStorage.removeItem('betpro_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

export const api = {
  auth: {
    login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    refresh: (token) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ token }) }),
  },
  users: {
    me: () => request('/users/me'),
    balance: () => request('/users/balance'),
  },
  bets: {
    place: (data) => request('/bets/place', { method: 'POST', body: JSON.stringify(data) }),
    history: () => request('/bets/history'),
  },
  admin: {
    getUsers: () => request('/admin/users'),
    createUser: (data) => request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    disableUser: (id) => request(`/admin/users/${id}/disable`, { method: 'PATCH' }),
    changePassword: (id, password) => request(`/admin/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  },
  withdrawals: {
    create: (targetUsername, amount) => request('/withdrawals', { method: 'POST', body: JSON.stringify({ targetUsername, amount }) }),
    approve: (id) => request(`/withdrawals/${id}/approve`, { method: 'POST' }),
    reject: (id) => request(`/withdrawals/${id}/reject`, { method: 'POST' }),
    pending: () => request('/withdrawals/pending'),
    sent: () => request('/withdrawals/sent'),
  },
  presence: {
    heartbeat: (data) => request('/presence/heartbeat', { method: 'POST', body: JSON.stringify(data) }),
    end: (sessionId, reason) => request('/presence/end', { method: 'POST', body: JSON.stringify({ sessionId, reason }) }),
    active: () => request('/presence/active'),
    userSessions: (userId) => request(`/presence/user/${userId}`),
  },
  rbac: {
    getUsers: (page, pageSize) => request(`/rbac/users?page=${page}&pageSize=${pageSize}`),
    getInactiveUsers: () => request('/rbac/users/inactive'),
    createUser: (targetRole) => request('/rbac/users', { method: 'POST', body: JSON.stringify({ targetRole }) }),
    resetPassword: (id, newPassword) => request(`/rbac/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
    restoreUser: (id) => request(`/rbac/users/${id}/restore`, { method: 'PATCH' }),
    deleteUser: (id) => request(`/rbac/users/${id}`, { method: 'DELETE' }),
    getTransactions: (page, pageSize) => request(`/rbac/transactions?page=${page}&pageSize=${pageSize}`),
    changeOwnPassword: (newPassword) => request('/rbac/password', { method: 'PATCH', body: JSON.stringify({ newPassword }) }),
  },
  wallet: {
    balance: () => request('/wallet/balance'),
    transfer: (receiverUsername, amount) => request('/wallet/transfer', { method: 'POST', body: JSON.stringify({ receiverUsername, amount }) }),
    credit: (targetUsername, amount) => request('/wallet/credit', { method: 'POST', body: JSON.stringify({ targetUsername, amount }) }),
    debit: (targetUsername, amount) => request('/wallet/debit', { method: 'POST', body: JSON.stringify({ targetUsername, amount }) }),
  },
  geoip: {
    get: () => request('/geoip'),
  },
};

// Legacy apiService for compatibility with existing hooks
export const apiService = {
  home: {
    getGames: () => Promise.resolve([]),
    getPromotions: () => Promise.resolve([]),
    getTopWins: () => Promise.resolve([]),
  },
  sports: {
    getMatches: () => Promise.resolve([]),
    getSports: () => Promise.resolve([]),
  },
  bets: {
    place: (data) => api.bets.place(data),
  },
};
