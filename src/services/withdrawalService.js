import { api } from '@/services/apiClient';

export async function createWithdrawalRequest(targetUsername, amount) {
  const parsedAmount = Number(amount);
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return { error: 'invalid_amount' };
  }

  try {
    const data = await api.withdrawals.create(targetUsername, parsedAmount);
    return { data };
  } catch (err) {
    return { error: err.error || 'unexpected_error' };
  }
}

export async function approveWithdrawalRequest(requestId) {
  if (!requestId) return { error: 'invalid_request' };
  try {
    const data = await api.withdrawals.approve(requestId);
    return { data };
  } catch (err) {
    return { error: err.error || 'unexpected_error' };
  }
}

export async function rejectWithdrawalRequest(requestId) {
  if (!requestId) return { error: 'invalid_request' };
  try {
    const data = await api.withdrawals.reject(requestId);
    return { data };
  } catch (err) {
    return { error: err.error || 'unexpected_error' };
  }
}

export async function fetchPendingWithdrawalRequests() {
  try {
    const data = await api.withdrawals.pending();
    return { requests: data.requests || [], error: null };
  } catch {
    return { requests: [], error: 'unexpected_error' };
  }
}

export async function fetchSentWithdrawalRequests() {
  try {
    const data = await api.withdrawals.sent();
    return { requests: data.requests || [], error: null };
  } catch {
    return { requests: [], error: 'unexpected_error' };
  }
}
