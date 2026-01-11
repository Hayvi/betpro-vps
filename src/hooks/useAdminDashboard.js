import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useBet } from '@/contexts/BetContext';
import { useManagedUsers } from '@/hooks/useManagedUsers';
import { useBoundedArray } from '@/hooks/useBoundedArray';
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


export function useAdminDashboard() {
  const { userId, role } = useAuth();
  const { showError, showSuccess } = useToast();
  const { updateUserBalance } = useBet();
  const { managedUsers, loadingUsers, refreshManagedUsers } = useManagedUsers();
  const { t } = useI18n();

  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [username, setUsername] = useState('');

  const [transferUsername, setTransferUsername] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [debitUsername, setDebitUsername] = useState('');
  const [debitAmount, setDebitAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const { items: transactions, addItem: addTransaction, setItems: setTransactions } = useBoundedArray(50);
  const [loadingTx, setLoadingTx] = useState(true);

  const PAGE_SIZE = 4;

  const [userPage, setUserPage] = useState(1);
  const [txPage, setTxPage] = useState(1);

  const [newUserRole, setNewUserRole] = useState('sub_admin');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const [resetUserId, setResetUserId] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const normalize = useCallback((v) => (v || '').toString().toLowerCase(), []);

  const usernameById = useMemo(() => {
    const map = new Map();
    if (userId) map.set(userId, username || '');
    for (const u of managedUsers) {
      if (u?.id) map.set(u.id, u.username || '');
    }
    return map;
  }, [managedUsers, userId, username]);

  const resolveUsernameById = useCallback((id) => {
    if (!id) return '-';
    const name = usernameById.get(id);
    return name ? name : '-';
  }, [usernameById]);

  const formatTransactionType = useCallback((type) => {
    if (!type) return '-';
    if (type.includes('credit') || type.includes('deposit')) return 'deposit';
    if (type.includes('debit') || type.includes('withdraw')) return 'withdraw';
    return type;
  }, []);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [resetUserSearch, setResetUserSearch] = useState('');

  const filteredUsers = useMemo(() => {
    const search = normalize(userSearch);
    return managedUsers.filter((u) => {
      const creatorName = resolveUsernameById(u.created_by);

      const matchesSearch =
        !search ||
        normalize(u.username).includes(search) ||
        normalize(u.role).includes(search) ||
        normalize(creatorName).includes(search);

      const matchesRole =
        userRoleFilter === 'all' || !userRoleFilter || u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [managedUsers, normalize, resolveUsernameById, userRoleFilter, userSearch]);

  const filteredTransactions = useMemo(() => {
    const search = normalize(txSearch);
    return transactions.filter((t) => {
      const typeLabel = formatTransactionType(t.type);
      const senderName = resolveUsernameById(t.sender_id);
      const receiverName = resolveUsernameById(t.receiver_id);

      const matchesSearch =
        !search ||
        normalize(senderName).includes(search) ||
        normalize(receiverName).includes(search) ||
        normalize(typeLabel).includes(search);

      const matchesType =
        txTypeFilter === 'all' || !txTypeFilter || typeLabel === txTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [formatTransactionType, normalize, resolveUsernameById, transactions, txSearch, txTypeFilter]);

  const filteredResetUsers = useMemo(() => {
    const search = normalize(resetUserSearch);
    return managedUsers.filter((u) => normalize(u.username).includes(search));
  }, [managedUsers, normalize, resetUserSearch]);

  const userTotalPages = Math.ceil(filteredUsers.length / PAGE_SIZE) || 1;
  const currentUserPage = Math.min(userPage, userTotalPages || 1) || 1;
  const userPageStart = (currentUserPage - 1) * PAGE_SIZE;
  const userPageRows = filteredUsers.slice(userPageStart, userPageStart + PAGE_SIZE);
  const showUserPagination = filteredUsers.length > PAGE_SIZE;

  const txTotalPages = Math.ceil(filteredTransactions.length / PAGE_SIZE) || 1;
  const currentTxPage = Math.min(txPage, txTotalPages || 1) || 1;
  const txPageStart = (currentTxPage - 1) * PAGE_SIZE;
  const txPageRows = filteredTransactions.slice(txPageStart, txPageStart + PAGE_SIZE);
  const showTxPagination = filteredTransactions.length > PAGE_SIZE;

  const refreshTransactions = async () => {
    setLoadingTx(true);
    const { transactions: tx, error: txError } = await fetchMyTransactions(1, 50);
    if (!txError && tx) {
      // Sort transactions by created_at before setting
      const sortedTx = [...tx].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(sortedTx);
    }
    setLoadingTx(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoadingBalance(true);
      setLoadingTx(true);

      const [balanceRes, txRes] = await Promise.allSettled([
        fetchMyBalance(),
        fetchMyTransactions(1, 50),
      ]);

      if (cancelled) return;

      if (balanceRes.status === 'fulfilled') {
        const { balance: b, username: userName, error } = balanceRes.value || {};
        if (!error) {
          const safeBalance = b || 0;
          setBalance(safeBalance);
          setUsername(userName || '');
          updateUserBalance(safeBalance);
        }
      }
      setLoadingBalance(false);

      if (txRes.status === 'fulfilled') {
        const { transactions: tx, error } = txRes.value || {};
        if (!error && tx) {
          // Sort transactions by created_at before setting
          const sortedTx = [...tx].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTransactions(sortedTx);
        }
      }
      setLoadingTx(false);
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [userId, updateUserBalance]);

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

  const handleError = (error) => {
    const message =
      error === 'user_not_found'
        ? t('dash_error_userNotFound')
        : error === 'insufficient_balance'
          ? t('dash_error_insufficientBalance')
          : t('dash_error_operationFailed');
    showError(message);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferUsername || !transferAmount) {
      showError(t('dash_validation_usernameAndAmountRequired'));
      return;
    }
    if (!window.confirm(t('dash_confirm_transfer'))) {
      return;
    }
    setSubmitting(true);
    const { data, error } = await transferToUsername(
      transferUsername.trim(),
      transferAmount
    );
    setSubmitting(false);
    if (error) return handleError(error);
    showSuccess(t('dash_success_transfer'));
    setTransferAmount('');
    if (data?.sender_new_balance !== undefined && data.sender_new_balance !== null) {
      const newBalance = Number(data.sender_new_balance);
      setBalance(newBalance);
      updateUserBalance(newBalance);
    }

    await refreshTransactions();
    await refreshManagedUsers();
  };

  const handleDebit = async (e) => {
    e.preventDefault();
    if (!debitUsername || !debitAmount) {
      showError(t('dash_validation_usernameAndAmountRequired'));
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
    if (error) return handleError(error);
    showSuccess(t('dash_success_withdrawRequest'));
    setDebitUsername('');
    setDebitAmount('');

    await refreshTransactions();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setCreatedCredentials(null);
    const { credentials, error } = await createUserAccount(newUserRole);
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

  return {
    role,
    balance,
    loadingBalance,
    username,
    transferUsername,
    setTransferUsername,
    transferAmount,
    setTransferAmount,
    debitUsername,
    setDebitUsername,
    debitAmount,
    setDebitAmount,
    submitting,
    managedUsers,
    loadingUsers,
    transactions,
    loadingTx,
    userSearch,
    setUserSearch,
    userRoleFilter,
    setUserRoleFilter,
    txSearch,
    setTxSearch,
    txTypeFilter,
    setTxTypeFilter,
    resetUserSearch,
    setResetUserSearch,
    resetUserId,
    setResetUserId,
    resetPassword,
    setResetPassword,
    resetting,
    filteredResetUsers,
    userPageRows,
    showUserPagination,
    currentUserPage,
    userTotalPages,
    setUserPage,
    txPageRows,
    showTxPagination,
    currentTxPage,
    txTotalPages,
    setTxPage,
    newUserRole,
    setNewUserRole,
    creatingUser,
    createdCredentials,
    handleTransfer,
    handleDebit,
    handleCreateUser,
    handleResetPassword,
    resolveUsernameById,
    formatTransactionType,
  };
}
