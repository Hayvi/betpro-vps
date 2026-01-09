import { api } from '@/services/apiClient';

export async function fetchManagedUsers(page = 1, pageSize = 50) {
  try {
    const data = await api.rbac.getUsers(page, pageSize);
    return { users: data.users || [], totalCount: data.totalCount || 0, error: null };
  } catch {
    return { users: [], totalCount: 0, error: 'unexpected_error' };
  }
}

export async function fetchInactiveManagedUsers() {
  try {
    const data = await api.rbac.getInactiveUsers();
    return { users: data.users || [], error: null };
  } catch {
    return { users: [], error: 'unexpected_error' };
  }
}

export async function fetchMyTransactions(page = 1, pageSize = 50) {
  try {
    const data = await api.rbac.getTransactions(page, pageSize);
    return { transactions: data.transactions || [], totalCount: data.totalCount || 0, error: null };
  } catch {
    return { transactions: [], totalCount: 0, error: 'unexpected_error' };
  }
}

export async function createUserAccount(targetRole) {
  try {
    const data = await api.rbac.createUser(targetRole);
    return { credentials: data, error: null };
  } catch (err) {
    return { credentials: null, error: err.error || 'unexpected_error' };
  }
}

export async function resetSubUserPassword(targetUserId, newPassword) {
  try {
    await api.rbac.resetPassword(targetUserId, newPassword);
    return { result: { success: true }, error: null };
  } catch (err) {
    return { result: null, error: err.error || 'unexpected_error' };
  }
}

export async function restoreUserAccount(targetUserId) {
  try {
    await api.rbac.restoreUser(targetUserId);
    return { result: { success: true }, error: null };
  } catch (err) {
    return { result: null, error: err.error || 'unexpected_error' };
  }
}

export async function deleteUserAccount(targetUserId) {
  try {
    await api.rbac.deleteUser(targetUserId);
    return { result: { success: true }, error: null };
  } catch (err) {
    return { result: null, error: err.error || 'unexpected_error' };
  }
}

export async function changeOwnPassword(newPassword) {
  try {
    await api.rbac.changeOwnPassword(newPassword);
    return { result: { success: true }, error: null };
  } catch (err) {
    return { result: null, error: err.error || 'unexpected_error' };
  }
}
