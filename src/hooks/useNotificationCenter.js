import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchMyTransactions } from '@/services/rbacAdminService';
import { onWsMessage } from '@/services/wsClient';
import { useI18n } from '@/contexts/I18nContext';
import {
  fetchPendingWithdrawalRequests,
  fetchSentWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
} from '@/services/withdrawalService';

export function useNotificationCenter() {
  const { isAuthenticated, userId } = useAuth();
  const { t } = useI18n();

  const [notifications, setNotifications] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const loadWithdrawalRequests = async () => {
    const { requests } = await fetchPendingWithdrawalRequests();
    setWithdrawalRequests(requests || []);
  };

  const loadSentRequests = async () => {
    const { requests } = await fetchSentWithdrawalRequests();
    setSentRequests(requests || []);
  };

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    let cancelled = false;

    async function loadInitial() {
      const { transactions, error } = await fetchMyTransactions(50);
      if (error || cancelled || !transactions) return;

      const incoming = transactions
        .filter(
          (t) =>
            t.receiver_id === userId &&
            (t.type === 'transfer' || t.type === 'admin_credit')
        )
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (cancelled) return;
      setNotifications(incoming);
    }

    loadInitial();
    loadWithdrawalRequests();
    loadSentRequests();

    // Listen for transaction updates via WebSocket
    const unsubTransaction = onWsMessage('transaction', (tx) => {
      if (cancelled) return;
      if (tx.receiver_id === userId && ['transfer', 'admin_credit'].includes(tx.type)) {
        setNotifications((prev) => {
          const existing = prev.find((p) => p.id === tx.id);
          if (existing) return prev;
          return [tx, ...prev].slice(0, 50);
        });
      }
      if (tx.type === 'admin_debit') {
        loadWithdrawalRequests();
        loadSentRequests();
      }
    });

    return () => {
      cancelled = true;
      unsubTransaction();
    };
  }, [isAuthenticated, userId]);

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    const { error } = await approveWithdrawalRequest(requestId);
    setProcessingId(null);

    if (error) {
      const message =
        error === 'insufficient_balance'
          ? t('notifications_withdraw_insufficientBalance')
          : error === 'request_expired'
            ? t('notifications_withdraw_requestExpired')
            : error === 'already_processed'
              ? t('notifications_withdraw_alreadyProcessed')
              : t('notifications_genericError');
      if (typeof window !== 'undefined') window.alert(message);
      return;
    }
    loadWithdrawalRequests();
    loadSentRequests();
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    const { error } = await rejectWithdrawalRequest(requestId);
    setProcessingId(null);

    if (error) {
      const message =
        error === 'already_processed'
          ? t('notifications_withdraw_alreadyProcessed')
          : t('notifications_genericError');
      if (typeof window !== 'undefined') window.alert(message);
      return;
    }
    loadWithdrawalRequests();
    loadSentRequests();
  };

  return {
    isAuthenticated,
    notifications,
    withdrawalRequests,
    sentRequests,
    senderNames,
    processingId,
    handleApprove,
    handleReject,
  };
}
