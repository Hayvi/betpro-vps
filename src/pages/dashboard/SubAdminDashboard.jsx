import { CopyIconButton } from '@/components/CopyIconButton';
import { InputWithPaste } from '@/components/ui/InputWithPaste';
import { StyledButton } from '@/components/ui/StyledButton';
import { StyledCard } from '@/components/ui/StyledCard';
import { PasswordChangeSection } from '@/components/PasswordChangeSection';
import { useSubAdminDashboard } from '@/hooks/useSubAdminDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WalletSummaryCard } from '@/components/dashboard/WalletSummaryCard';
import { TransactionsHistoryCard } from '@/components/dashboard/TransactionsHistoryCard';
import { ManagedUsersCard } from '@/components/dashboard/ManagedUsersCard';
import { DashboardMetricsStrip } from '@/components/dashboard/DashboardMetricsStrip';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FilterX, Users, ArrowDownCircle, ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function SubAdminDashboard() {
  const {
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
    userId,
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
  } = useSubAdminDashboard();

  const { t, isRtl } = useI18n();

  const [debitCollapsed, setDebitCollapsed] = useLocalStorage('dash:collapsed:sub_admin:debit', true, {
    context: 'SubAdminDashboard:Debit',
  });

  const [createUserCollapsed, setCreateUserCollapsed] = useLocalStorage('dash:collapsed:sub_admin:create_user', true, {
    context: 'SubAdminDashboard:CreateUser',
  });

  const usersSectionRef = useRef(null);
  const txSectionRef = useRef(null);
  const createUserSectionRef = useRef(null);
  const userSearchRef = useRef(null);

  const [transferUsernameError, setTransferUsernameError] = useState('');
  const [transferAmountError, setTransferAmountError] = useState('');
  const [debitUsernameError, setDebitUsernameError] = useState('');
  const [debitAmountError, setDebitAmountError] = useState('');

  const scrollTo = useCallback((ref) => {
    const el = ref?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const clearUserFilters = useCallback(() => {
    setUserSearch('');
  }, [setUserSearch]);

  useDashboardShortcuts({
    onFocusSearch: () => {
      userSearchRef.current?.focus();
    },
    onClear: () => {
      const active = document.activeElement;
      if (active === userSearchRef.current) return clearUserFilters();
      if (userSearch) return clearUserFilters();
    },
  });

  const validateUsername = useCallback((value) => {
    return value && String(value).trim() ? '' : t('dash_validation_usernameRequired');
  }, [t]);

  const validateAmount = useCallback((value) => {
    if (!value && value !== 0) return t('dash_validation_amountRequired');
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return t('dash_validation_amountPositive');
    return '';
  }, [t]);

  const onTransferSubmit = useCallback((e) => {
    const uErr = validateUsername(targetUsername);
    const aErr = validateAmount(amount);
    setTransferUsernameError(uErr);
    setTransferAmountError(aErr);
    if (uErr || aErr) {
      e.preventDefault();
      return;
    }
    handleTransfer(e);
  }, [amount, handleTransfer, targetUsername, validateAmount, validateUsername]);

  const onDebitSubmit = useCallback((e) => {
    const uErr = validateUsername(debitUsername);
    const aErr = validateAmount(debitAmount);
    setDebitUsernameError(uErr);
    setDebitAmountError(aErr);
    if (uErr || aErr) {
      e.preventDefault();
      return;
    }
    handleDebit(e);
  }, [debitAmount, debitUsername, handleDebit, validateAmount, validateUsername]);

  const { txVolume, depositsCount, withdrawalsCount } = useMemo(() => {
    let volume = 0;
    let deposits = 0;
    let withdrawals = 0;
    for (const tx of transactions) {
      volume += Number(tx.amount || 0);
      const type = formatTransactionType(tx.type);
      if (type === 'deposit') deposits += 1;
      if (type === 'withdraw') withdrawals += 1;
    }
    return { txVolume: volume, depositsCount: deposits, withdrawalsCount: withdrawals };
  }, [formatTransactionType, transactions]);

  const onUsersMetricClick = useCallback(() => {
    scrollTo(usersSectionRef);
    window.requestAnimationFrame(() => userSearchRef.current?.focus());
  }, [scrollTo]);

  const onTxMetricClick = useCallback(() => {
    scrollTo(txSectionRef);
  }, [scrollTo]);

  const metrics = useMemo(() => {
    return [
      {
        key: 'users',
        label: t('dash_metric_users'),
        value: managedUsers.length,
        loading: loadingUsers,
        onClick: onUsersMetricClick,
      },
      {
        key: 'deposits',
        label: t('dash_metric_deposits'),
        value: depositsCount,
        loading: loadingTx,
        onClick: onTxMetricClick,
      },
      {
        key: 'withdrawals',
        label: t('dash_metric_withdrawals'),
        value: withdrawalsCount,
        loading: loadingTx,
        onClick: onTxMetricClick,
      },
      {
        key: 'volume',
        label: t('dash_metric_volume'),
        value: `${txVolume.toFixed(2)} TND`,
        loading: loadingTx,
        onClick: onTxMetricClick,
      },
    ];
  }, [depositsCount, loadingTx, loadingUsers, managedUsers.length, onTxMetricClick, onUsersMetricClick, t, txVolume, withdrawalsCount]);

  return (
    <div className="dash-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <DashboardHeader title={t('dash_sub_title')} username={username} role={role} />

      <DashboardMetricsStrip items={metrics} />

      <WalletSummaryCard
        title={t('dash_sub_walletTitle')}
        loading={loadingBalance}
        balance={balance}
        collapseKey="dash:collapsed:sub_admin:wallet"
      >
        <form onSubmit={onTransferSubmit} className="space-y-4 mt-4">
          <div>
            <label className="dash-label">{t('dash_transfer_recipientLabel')}</label>
            <InputWithPaste
              variant="dashboard"
              value={targetUsername}
              onChange={(e) => {
                const next = e.target.value;
                setTargetUsername(next);
                if (transferUsernameError) setTransferUsernameError(validateUsername(next));
              }}
              placeholder="user_ABC123"
            />
            {transferUsernameError ? (
              <p className="mt-1 text-xs font-bold text-red-500/90">{transferUsernameError}</p>
            ) : null}
          </div>

          <div>
            <label className="dash-label">{t('dash_amountLabel')}</label>
            <InputWithPaste
              variant="dashboard"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => {
                const next = e.target.value;
                setAmount(next);
                if (transferAmountError) setTransferAmountError(validateAmount(next));
              }}
              placeholder="100"
            />
            {transferAmountError ? (
              <p className="mt-1 text-xs font-bold text-red-500/90">{transferAmountError}</p>
            ) : null}
          </div>

          <StyledButton type="submit" disabled={submitting} className="w-full h-11">
            {submitting ? t('common_transferring') : t('dash_sub_transferTitle')}
          </StyledButton>
        </form>
      </WalletSummaryCard>

      <StyledCard>
        <div className="dash-section-header">
          <h2 className="dash-section-title">{t('dash_debitUserTitle')}</h2>
          <div className="dash-section-rule" />
          <div className="flex items-center gap-2 relative z-20">
            <div className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => setDebitCollapsed((v) => !v)}
              aria-expanded={!debitCollapsed}
              className="dash-collapse-btn"
            >
              {debitCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {debitCollapsed ? null : (
        <form onSubmit={onDebitSubmit} className="space-y-5">
          <div>
            <label className="dash-label">{t('dash_usernameLabel')}</label>
            <InputWithPaste
              variant="dashboard"
              value={debitUsername}
              onChange={(e) => {
                const next = e.target.value;
                setDebitUsername(next);
                if (debitUsernameError) setDebitUsernameError(validateUsername(next));
              }}
              placeholder="user_ABC123"
            />
            {debitUsernameError ? (
              <p className="mt-1 text-xs font-bold text-red-500/90">{debitUsernameError}</p>
            ) : null}
          </div>
          <div>
            <label className="dash-label">{t('dash_amountLabel')}</label>
            <InputWithPaste
              variant="dashboard"
              type="number"
              min="0"
              step="0.01"
              value={debitAmount}
              onChange={(e) => {
                const next = e.target.value;
                setDebitAmount(next);
                if (debitAmountError) setDebitAmountError(validateAmount(next));
              }}
              placeholder="100"
            />
            {debitAmountError ? (
              <p className="mt-1 text-xs font-bold text-red-500/90">{debitAmountError}</p>
            ) : null}
          </div>
          <StyledButton variant="danger" type="submit" disabled={submitting} className="w-full h-11">
            {submitting ? t('common_submitting') : t('dash_debitUserSubmit')}
          </StyledButton>
        </form>
        )}
      </StyledCard>

      {/* Managed Users Table */}
      <div ref={usersSectionRef}>
        <ManagedUsersCard
        loading={loadingUsers}
        hasUsers={userPageRows.length > 0}
        emptyState={
          <DashboardEmptyState
            icon={userSearch ? FilterX : Users}
            title={t('dash_noUsers')}
            action={
              userSearch ? (
                <StyledButton variant="secondary" size="sm" onClick={clearUserFilters}>
                  {t('dash_action_clearFilters')}
                </StyledButton>
              ) : (
                <StyledButton variant="secondary" size="sm" onClick={() => scrollTo(createUserSectionRef)}>
                  {t('dash_action_createUser')}
                </StyledButton>
              )
            }
          />
        }
        filters={
          <div className="mb-3">
            <InputWithPaste
              variant="dashboard"
              placeholder={t('dash_userSearchSimplePlaceholder')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              showSearch
              ref={userSearchRef}
              data-dashboard-search="true"
            />
          </div>
        }
        mobileRows={userPageRows.map((u) => (
          <div
            key={u.id}
            className="dash-mobile-card ui-trans-fast hover:border-amber-500/20 dark:hover:border-amber-500/20 group"
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 relative z-20">
                <span className="font-black tracking-tight text-slate-900 dark:text-white">{u.username}</span>
                <CopyIconButton value={u.username} />
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                {u.role}
              </span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-slate-200/70 dark:border-slate-800/40">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-500 font-black tracking-widest">{t('dash_balanceLabel')}</p>
                <p className="font-black tabular-nums text-slate-900 dark:text-white">{Number(u.balance || 0).toFixed(2)} <span className="text-[10px] opacity-50">TND</span></p>
              </div>
            </div>
          </div>
        ))}
        desktopHead={
          <tr className="dash-table-head-row">
            <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_usernameLabel')}</th>
            <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_roleLabel')}</th>
            <th className="py-3 px-4 text-right whitespace-nowrap">{t('dash_balanceLabel')}</th>
          </tr>
        }
        desktopRows={userPageRows.map((u) => (
          <tr
            key={u.id}
            className="border-b border-slate-800/30 hover:bg-white/[0.02] transition-colors group"
          >
            <td className="py-3 px-3 border-r border-slate-200/70 dark:border-slate-800/60 whitespace-nowrap">
              <div className="flex items-center gap-2 relative z-20">
                <span className="font-black tracking-tight text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{u.username}</span>
                <CopyIconButton value={u.username} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </td>
            <td className="py-3 px-3 border-r border-slate-200/70 dark:border-slate-800/60 whitespace-nowrap">
              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                {u.role}
              </span>
            </td>
            <td className="py-3 px-3 whitespace-nowrap font-black tabular-nums text-slate-900 dark:text-white">
              {Number(u.balance || 0).toFixed(2)}
            </td>
          </tr>
        ))}
        showPagination={showUserPagination}
        currentPage={currentUserPage}
        totalPages={userTotalPages}
        onPageChange={setUserPage}
        />
      </div>

      {/* Password Change Section */}
      <PasswordChangeSection collapseKey="dash:collapsed:sub_admin:password_change" />

      <div className="dash-grid-1">
        {/* Create User Form */}
        <div ref={createUserSectionRef}>
          <StyledCard>
            <div className="dash-section-header">
              <h2 className="dash-section-title">{t('dash_createUserTitle')}</h2>
              <div className="dash-section-rule" />
              <div className="flex items-center gap-2 relative z-20">
                <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateUserCollapsed((v) => !v)}
                  aria-expanded={!createUserCollapsed}
                  className="dash-collapse-btn"
                >
                  {createUserCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {createUserCollapsed ? null : (
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div>
                <label className="dash-label">{t('dash_roleLabel')}</label>
                <input
                  type="text"
                  value={t('dash_role_userWithCode')}
                  disabled
                  className="dash-control"
                />
              </div>

              <StyledButton variant="cta" type="submit" disabled={creatingUser} className="w-full h-11">
                {creatingUser ? t('common_creatingUser') : t('dash_createUserButton')}
              </StyledButton>

              {createdCredentials && (
                <div className="mt-4 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                  <p className="font-semibold mb-1">{t('dash_newCredentialsTitle')}</p>
                  <p className="flex items-center gap-2">
                    <span>
                      {t('dash_newCredentials_username')}: {' '}
                      <span className="font-mono">{createdCredentials.username}</span>
                    </span>
                    <CopyIconButton value={createdCredentials.username} className="md:hidden" />
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <span>
                      {t('dash_newCredentials_password')}: {' '}
                      <span className="font-mono">{createdCredentials.password}</span>
                    </span>
                    <CopyIconButton value={createdCredentials.password} className="md:hidden" />
                  </p>
                </div>
              )}
            </form>
            )}
          </StyledCard>
        </div>
      </div>

      <div ref={txSectionRef}>
        <TransactionsHistoryCard
          loading={loadingTx}
          hasTransactions={transactions.length > 0}
          emptyState={
            <DashboardEmptyState
              icon={ArrowDownCircle}
              title={t('dash_noTransactions')}
            />
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
