import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBet } from '@/contexts/BetContext';
import { fetchMyBalance } from '@/services/rbacWalletService';
import { fetchMyTransactions } from '@/services/rbacAdminService';
import { onWsMessage } from '@/services/wsClient';

const PAGE_SIZE = 4;
const MAX_TRANSACTIONS = 50;

export function useUserWallet() {
  const { userId } = useAuth();
  const { updateUserBalance } = useBet();

  const [balance, setBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [username, setUsername] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txPage, setTxPage] = useState(1);

  const refreshTransactions = async () => {
    setLoadingTx(true);
    const { transactions: tx, error: txError } = await fetchMyTransactions(MAX_TRANSACTIONS);
    if (!txError) setTransactions(tx || []);
    setLoadingTx(false);
  };

  const txTotalPages = Math.ceil(transactions.length / PAGE_SIZE) || 1;
  const currentTxPage = Math.min(txPage, txTotalPages || 1) || 1;
  const txPageStart = (currentTxPage - 1) * PAGE_SIZE;
  const txPageRows = transactions.slice(txPageStart, txPageStart + PAGE_SIZE);
  const showTxPagination = transactions.length > PAGE_SIZE;

  useEffect(() => {
    const load = async () => {
      setLoadingBalance(true);
      const { balance: b, username: name, error } = await fetchMyBalance();
      if (!error) {
        const safeBalance = b || 0;
        setBalance(safeBalance);
        setUsername(name || '');
        updateUserBalance(safeBalance);
      }
      setLoadingBalance(false);

      await refreshTransactions();
    };
    load();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsub = onWsMessage('balance_update', (msg) => {
      if (msg.balance !== undefined) {
        setBalance(Number(msg.balance) || 0);
        updateUserBalance(Number(msg.balance) || 0);
      }
    });

    return unsub;
  }, [userId, updateUserBalance]);

  return {
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
  };
}
