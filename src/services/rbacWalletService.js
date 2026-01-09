import { api } from '@/services/apiClient';

export async function fetchMyBalance() {
  try {
    const data = await api.wallet.balance();
    return { balance: Number(data.balance) || 0, username: data.username || null, error: null };
  } catch {
    return { balance: 0, username: null, error: 'unexpected_error' };
  }
}

export async function transferToUsername(receiverUsername, amount) {
  const parsedAmount = Number(amount);
  if (!receiverUsername || !parsedAmount || parsedAmount <= 0) {
    return { error: 'invalid_amount' };
  }

  try {
    await api.wallet.transfer(receiverUsername, parsedAmount);
    return { data: { success: true } };
  } catch (err) {
    return { error: err.error || 'unexpected_error' };
  }
}

export async function creditUsernameBalance(targetUsername, amount) {
  const parsedAmount = Number(amount);
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return { error: 'invalid_amount' };
  }

  try {
    await api.wallet.credit(targetUsername, parsedAmount);
    return { data: { success: true } };
  } catch (err) {
    return { error: err.error || 'unexpected_error' };
  }
}

export async function adminDebitUsernameBalance(targetUsername, amount) {
  const parsedAmount = Number(amount);
  if (!targetUsername || !parsedAmount || parsedAmount <= 0) {
    return { error: 'invalid_amount' };
  }

  try {
    await api.wallet.debit(targetUsername, parsedAmount);
    return { data: { success: true } };
  } catch (err) {
    return { error: err.error || 'unexpected_error' };
  }
}
