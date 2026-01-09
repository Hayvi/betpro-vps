import { useAuth } from '@/contexts/AuthContext';
import { useUserWallet } from '@/hooks/useUserWallet';

export function useUserDashboard() {
  const { role } = useAuth();

  const {
    userId,
    balance,
    loadingBalance,
    username,
    transactions,
    loadingTx,
    txPageRows,
    showTxPagination,
    currentTxPage,
    txTotalPages,
    setTxPage,
  } = useUserWallet();

  const formatTransactionType = (type) => {
    if (!type) return '-';
    if (type.includes('credit') || type.includes('deposit')) return 'deposit';
    if (type.includes('debit') || type.includes('withdraw')) return 'withdraw';
    return type;
  };

  return {
    role,
    userId,
    balance,
    loadingBalance,
    username,
    transactions,
    loadingTx,
    txPageRows,
    showTxPagination,
    currentTxPage,
    txTotalPages,
    setTxPage,
    formatTransactionType,
  };
}
