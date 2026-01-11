import { useUserDashboard } from '@/hooks/useUserDashboard';
import { cn } from '@/lib/utils';
import { PasswordChangeSection } from '@/components/PasswordChangeSection';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WalletSummaryCard } from '@/components/dashboard/WalletSummaryCard';
import { TransactionsHistoryCard } from '@/components/dashboard/TransactionsHistoryCard';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { useI18n } from '@/contexts/I18nContext';
import { useRef } from 'react';
import { ArrowDownCircle } from '@/components/ui/BrandIcons';

export default function UserDashboard() {
  const {
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
  } = useUserDashboard();

  const { t, isRtl } = useI18n();

  const txSectionRef = useRef(null);

  return (
    <div className="dash-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <DashboardHeader title={t('dash_user_title')} username={username} role={role} />

      <WalletSummaryCard
        title={t('dash_user_walletTitle')}
        loading={loadingBalance}
        balance={balance}
        collapseKey="dash:collapsed:user:wallet"
      />

      {/* Password Change Section */}
      <PasswordChangeSection collapseKey="dash:collapsed:user:password_change" />

      <div ref={txSectionRef}>
        <TransactionsHistoryCard
          loading={loadingTx}
          hasTransactions={txPageRows.length > 0}
          emptyState={
            <DashboardEmptyState icon={ArrowDownCircle} title={t('dash_noTransactions')} />
          }
          mobileRows={txPageRows.map((tx) => {
            const isSender = tx.sender_id === userId;
            const directionLabel = isSender ? t('dash_txDirection_sent') : t('dash_txDirection_received');
            return (
              <div
                key={tx.id}
                className="dash-mobile-card ui-trans-fast hover:border-amber-500/20 dark:hover:border-amber-500/20"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                      tx.type === 'deposit'
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    )}
                  >
                    {formatTransactionType(tx.type)}
                  </span>
                  <span className="font-black tabular-nums text-slate-900 dark:text-white">
                    {Number(tx.amount || 0).toFixed(2)} <span className="text-[10px] opacity-50">TND</span>
                  </span>
                </div>
                <div className="flex justify-between items-end text-[10px]">
                  <div className="text-slate-500 dark:text-slate-400 font-medium">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-md font-black tracking-tighter text-[8px]",
                        isSender ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                      )}
                    >
                      {directionLabel}
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 opacity-80">
                    {tx.created_at ? new Date(tx.created_at).toLocaleString('en-GB') : '-'}
                  </div>
                </div>
              </div>
            );
          })}
          desktopRows={txPageRows.map((tx) => {
            const isSender = tx.sender_id === userId;
            const directionLabel = isSender ? t('dash_txDirection_sent') : t('dash_txDirection_received');
            return (
              <tr
                key={tx.id}
                className="border-b border-slate-800/30 hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                    tx.type === 'deposit' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  )}>
                    {formatTransactionType(tx.type)}
                  </span>
                </td>
                <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap font-black tabular-nums text-slate-900 dark:text-white">
                  {Number(tx.amount || 0).toFixed(2)}
                </td>
                <td className="py-3 px-4 border-r border-slate-800/60 text-[9px] font-black tracking-widest text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  <span className={cn(
                    "px-2 py-1 rounded-md",
                    isSender ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {directionLabel}
                  </span>
                </td>
                <td className="py-3 px-4 text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap tracking-wider">
                  {tx.created_at ? new Date(tx.created_at).toLocaleString('en-GB') : '-'}
                </td>
              </tr>
            );
          })}
          showPagination={showTxPagination}
          currentPage={currentTxPage}
          totalPages={txTotalPages}
          onPageChange={setTxPage}
        />
      </div>
    </div>
  );
}
