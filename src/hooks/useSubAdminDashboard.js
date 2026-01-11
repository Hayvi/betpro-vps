import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useBet } from '@/contexts/BetContext';
import { useManagedUsers } from '@/hooks/useManagedUsers';
import {
  fetchMyBalance,
  transferToUsername,
} from '@/services/rbacWalletService';
import { createWithdrawalRequest } from '@/services/withdrawalService';
import {
  fetchMyTransactions,
  createUserAccount,
  resetSubUserPassword,
} from '@/services/rbacAdminService';
import { onWsMessage } from '@/services/wsClient';
import { useI18n } from '@/contexts/I18nContext';


export function useSubAdminDashboard() {
  const { userId, role } = useAuth();
  const { showError, showSuccess } = useToast();
  const { updateUserBalance } = useBet();
  const { managedUsers, loadingUsers, refreshManagedUsers } = useManagedUsers();
  const { t } = useI18n();

  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [username, setUsername] = useState('');

  const [targetUsername, setTargetUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [debitUsername, setDebitUsername] = useState('');
  const [debitAmount, setDebitAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);

  // Managed users state
  const [userSearch, setUserSearch] = useState('');

  // User creation state
  const [creatingUser, setCreatingUser] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Password reset state
  const [resetUserId, setResetUserId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetUserSearch, setResetUserSearch] = useState('');

  const PAGE_SIZE = 4;

  const [txPage, setTxPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const formatTransactionType = (type) => {
    if (!type) return '-';
    if (type.includes('credit') || type.includes('deposit')) return 'deposit';
    if (type.includes('debit') || type.includes('withdraw')) return 'withdraw';
    return type;
  };

  const refreshTransactions = async () => {
    setLoadingTx(true);
    const { transactions: tx, error: txError } = await fetchMyTransactions(50);
    if (!txError) setTransactions(tx || []);
    setLoadingTx(false);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoadingBalance(true);
      setLoadingTx(true);

      const [balanceRes, txRes] = await Promise.allSettled([
        fetchMyBalance(),
        fetchMyTransactions(50),
      ]);

      if (cancelled) return;

      if (balanceRes.status === 'fulfilled') {
        const { balance: b, username: userName, error } = balanceRes.value || {};
        if (!error) {
          const safeBalance = b || 0;
          setBalance(safeBalance);
          updateUserBalance(safeBalance);
          setUsername(userName || '');
        }
      }
      setLoadingBalance(false);

      if (txRes.status === 'fulfilled') {
        const { transactions: tx, error } = txRes.value || {};
        if (!error) setTransactions(tx || []);
      }
      setLoadingTx(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [updateUserBalance]);

  // WebSocket subscription for balance updates
  useEffect(() => {
    if (!userId) return;

    const unsub1 = onWsMessage('balance_update', (msg) => {
      if (msg.balance !== undefined) {
        setBalance(Number(msg.balance) || 0);
        updateUserBalance(Number(msg.balance) || 0);
      }
      refreshManagedUsers();
    });

    const unsub2 = onWsMessage('transaction', () => {
      refreshTransactions();
    });

    const unsub3 = onWsMessage('withdrawal_approved', () => {
      refreshManagedUsers();
      refreshTransactions();
    });

    const unsub4 = onWsMessage('withdrawal_rejected', () => {
      refreshTransactions();
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [userId, updateUserBalance, refreshManagedUsers, refreshTransactions]);

  // Managed users realtime updates and loading are handled by useManagedUsers

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!targetUsername || !amount) {
      showError(t('dash_validation_usernameAndAmountRequired'));
      return;
    }

    // Check if target user is managed by this sub-admin
    const targetUser = managedUsers.find(
      (u) => u.username.toLowerCase() === targetUsername.trim().toLowerCase()
    );

    if (!targetUser) {
      showError(t('dash_sub_transferOnlyManaged'));
      return;
    }

    if (!window.confirm(t('dash_confirm_transfer'))) {
      return;
    }

    setSubmitting(true);
    const { data, error } = await transferToUsername(targetUsername.trim(), amount);
    setSubmitting(false);

    if (error) {
      const message =
        error === 'user_not_found'
          ? t('dash_error_userNotFound')
          : error === 'insufficient_balance'
            ? t('dash_error_insufficientBalance')
            : t('dash_error_operationFailed');
      showError(message);
      return;
    }

    showSuccess(t('dash_success_transfer'));
    setAmount('');

    if (data?.sender_new_balance !== undefined && data.sender_new_balance !== null) {
      const newBalance = Number(data.sender_new_balance);
      setBalance(newBalance);
      updateUserBalance(newBalance);
    } else {
      const refreshed = await fetchMyBalance();
      if (!refreshed.error) {
        const safeBalance = refreshed.balance || 0;
        setBalance(safeBalance);
        updateUserBalance(safeBalance);
      }
    }

    await refreshTransactions();
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    if (!debitUsername || !debitAmount) {
      showError(t('dash_validation_usernameAndAmountRequired'));
      return;
    }

    // Check if target user is managed by this sub-admin
    const targetUser = managedUsers.find(
      (u) => u.username.toLowerCase() === debitUsername.trim().toLowerCase()
    );

    if (!targetUser) {
      showError(t('dash_sub_debitOnlyManaged'));
      return;
    }

    const normalizedDebit = debitUsername.trim().toLowerCase();
    const currentUsername = (username || '').toLowerCase();
    if (normalizedDebit === currentUsername) {
      showError(t('dash_error_cannotDebitSelf'));
      return;
    }

    if (!window.confirm(t('dash_confirm_withdrawRequest'))) {
      return;
    }

    setSubmitting(true);
    const { error } = await createWithdrawalRequest(
      debitUsername.trim(),
      debitAmount
    );
    setSubmitting(false);

    if (error) {
      const message =
        error === 'user_not_found'
          ? t('dash_error_userNotFound')
          : error === 'not_authorized'
            ? t('dash_error_notAuthorizedForUser')
            : t('dash_error_operationFailed');
      showError(message);
      return;
    }

    showSuccess(t('dash_success_withdrawRequest'));
    setDebitUsername('');
    setDebitAmount('');

    await refreshTransactions();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreatedCredentials(null);
    const { credentials, error } = await createUserAccount('user');
    setCreatingUser(false);
    if (error) {
      const message =
        error === 'invalid_role'
          ? t('dash_error_notAuthorizedCreateRole')
          : t('dash_error_createUserFailed');
      showError(message);
      return;
    }
    setCreatedCredentials(credentials);
    showSuccess(t('dash_success_userCreated'));
    refreshManagedUsers();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetUserId || !resetPassword) {
      showError(t('dash_validation_selectUserAndNewPassword'));
      return;
    }
    setResetting(true);
    const { result, error } = await resetSubUserPassword(resetUserId, resetPassword);
    setResetting(false);
    if (error) {
      const message =
        error === 'invalid_password'
          ? t('dash_error_passwordTooShort')
          : error === 'not_authorized'
            ? t('dash_error_notAuthorizedChangePassword')
            : error === 'user_not_found'
              ? t('dash_error_userNotFound')
              : t('dash_error_resetPasswordFailed');
      showError(message);
      return;
    }
    if (result?.status === 'success') {
      showSuccess(t('dash_success_passwordReset'));
      setResetPassword('');
    }
  };

  const txTotalPages = Math.ceil(transactions.length / PAGE_SIZE) || 1;
  const currentTxPage = Math.min(txPage, txTotalPages || 1) || 1;
  const txPageStart = (currentTxPage - 1) * PAGE_SIZE;
  const txPageRows = transactions.slice(txPageStart, txPageStart + PAGE_SIZE);
  const showTxPagination = transactions.length > PAGE_SIZE;

  const filteredUsers = managedUsers.filter((u) =>
    !userSearch || u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const userTotalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const currentUserPage = Math.min(userPage, userTotalPages || 1) || 1;
  const userPageStart = (currentUserPage - 1) * PAGE_SIZE;
  const userPageRows = filteredUsers.slice(userPageStart, userPageStart + PAGE_SIZE);
  const showUserPagination = filteredUsers.length > PAGE_SIZE;

  const filteredResetUsers = managedUsers.filter((u) =>
    u.username.toLowerCase().includes((resetUserSearch || '').toLowerCase())
  );

  return {
    userId,
    role,
    balance,
    loadingBalance,
    username,
    targetUsername,
    setTargetUsername,
    amount,
    setAmount,
    debitUsername,
    setDebitUsername,
    debitAmount,
    setDebitAmount,
    submitting,
    transactions,
    loadingTx,
    managedUsers,
    loadingUsers,
    userSearch,
    setUserSearch,
    creatingUser,
    createdCredentials,
    resetUserId,
    setResetUserId,
    resetPassword,
    setResetPassword,
    resetting,
    resetUserSearch,
    setResetUserSearch,
    PAGE_SIZE,
    txPage,
    setTxPage,
    userPage,
    setUserPage,
    txTotalPages,
    currentTxPage,
    txPageRows,
    showTxPagination,
    userTotalPages,
    currentUserPage,
    userPageRows,
    showUserPagination,
    filteredResetUsers,
    formatTransactionType,
    handleTransfer,
    handleDebit,
    handleCreateUser,
    handleResetPassword,
  };
}
