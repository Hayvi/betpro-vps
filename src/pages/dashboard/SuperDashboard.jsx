import { CopyIconButton } from '@/components/CopyIconButton';
import { InputWithPaste } from '@/components/ui/InputWithPaste';
import { StyledButton } from '@/components/ui/StyledButton';
import { StyledCard } from '@/components/ui/StyledCard';
import { Pagination } from '@/components/ui/Pagination';
import { PasswordChangeSection } from '@/components/PasswordChangeSection';
import { useSuperDashboard } from '@/hooks/useSuperDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WalletSummaryCard } from '@/components/dashboard/WalletSummaryCard';
import { ManagedUsersCard } from '@/components/dashboard/ManagedUsersCard';
import { AdvancedTransactionsCard } from '@/components/dashboard/AdvancedTransactionsCard';
import { DashboardMetricsStrip } from '@/components/dashboard/DashboardMetricsStrip';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { ConnectedUsersCard } from '@/components/dashboard/ConnectedUsersCard';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowDownCircle, ChevronDown, ChevronUp, FilterX, UserX, Users } from '@/components/ui/BrandIcons';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';
import { usePresenceDashboard } from '@/hooks/usePresenceDashboard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebouncedSearch, useRoleFilter } from '@/hooks/useDebouncedSearch';
import { LazySection, DashboardSkeleton } from '@/components/common/LazySection';

export default function SuperDashboard() {
  const {
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
    inactiveUsers,
    loadingInactive,
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
    inactivePageRows,
    showInactivePagination,
    currentInactivePage,
    inactiveTotalPages,
    setInactivePage,
    deletingUserId,
    restoringUserId,
    newUserRole,
    setNewUserRole,
    creatingUser,
    createdCredentials,
    handleTransfer,
    handleDebit,
    handleDeleteUser,
    handleRestoreUser,
    handleCreateUser,
    handleResetPassword,
    resolveUsernameById,
    formatTransactionType,
  } = useSuperDashboard();

  const { t, isRtl } = useI18n();

  // Optimized search and filtering
  const { filteredItems: searchedUsers, isSearching } = useDebouncedSearch(
    managedUsers, 
    userSearch, 
    ['username', 'role']
  );
  
  const roleFilteredUsers = useRoleFilter(searchedUsers, userRoleFilter);
  
  const { filteredItems: searchedTransactions } = useDebouncedSearch(
    transactions,
    txSearch,
    ['sender_id', 'receiver_id', 'type']
  );

  const [deletedUsersCollapsed, setDeletedUsersCollapsed] = useLocalStorage('dash:collapsed:deleted_users', true, {
    context: 'SuperDashboard:DeletedUsers',
  });

  const [debitCollapsed, setDebitCollapsed] = useLocalStorage('dash:collapsed:super:debit', true, {
    context: 'SuperDashboard:Debit',
  });

  const [createUserCollapsed, setCreateUserCollapsed] = useLocalStorage('dash:collapsed:super:create_user', true, {
    context: 'SuperDashboard:CreateUser',
  });

  const [resetPasswordCollapsed, setResetPasswordCollapsed] = useLocalStorage('dash:collapsed:super:reset_password', true, {
    context: 'SuperDashboard:ResetPassword',
  });

  const {
    sessions: presenceSessions,
    loadingSessions: loadingPresenceSessions,
    history: presenceHistory,
    loadingHistory: loadingPresenceHistory,
    counts: presenceCounts,
    connectedWindowMs,
  } = usePresenceDashboard({ enabled: role === 'super_admin' });

  const usersSectionRef = useRef(null);
  const txSectionRef = useRef(null);
  const inactiveSectionRef = useRef(null);
  const createUserSectionRef = useRef(null);
  const userSearchRef = useRef(null);
  const txSearchRef = useRef(null);

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
    setUserRoleFilter('all');
  }, [setUserRoleFilter, setUserSearch]);

  const clearTxFilters = useCallback(() => {
    setTxSearch('');
    setTxTypeFilter('all');
  }, [setTxSearch, setTxTypeFilter]);

  useDashboardShortcuts({
    onFocusSearch: () => {
      userSearchRef.current?.focus();
    },
    onClear: () => {
      const active = document.activeElement;
      if (active === txSearchRef.current) return clearTxFilters();
      if (active === userSearchRef.current) return clearUserFilters();
      if (txSearch || txTypeFilter !== 'all') return clearTxFilters();
      if (userSearch || userRoleFilter !== 'all') return clearUserFilters();
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
    const uErr = validateUsername(transferUsername);
    const aErr = validateAmount(transferAmount);
    setTransferUsernameError(uErr);
    setTransferAmountError(aErr);
    if (uErr || aErr) {
      e.preventDefault();
      return;
    }
    handleTransfer(e);
  }, [handleTransfer, transferAmount, transferUsername, validateAmount, validateUsername]);

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

  const playersCount = useMemo(() => {
    return managedUsers.reduce((sum, u) => sum + (u.role === 'user' ? 1 : 0), 0);
  }, [managedUsers]);

  const deletedCount = useMemo(() => inactiveUsers.length, [inactiveUsers.length]);

  const { depositsCount, withdrawalsCount } = useMemo(() => {
    let deposits = 0;
    let withdrawals = 0;
    for (const tx of transactions) {
      const type = formatTransactionType(tx.type);
      if (type === 'deposit') deposits += 1;
      if (type === 'withdraw') withdrawals += 1;
    }
    return { depositsCount: deposits, withdrawalsCount: withdrawals };
  }, [formatTransactionType, transactions]);

  const onPlayersMetricClick = useCallback(() => {
    setUserSearch('');
    setUserRoleFilter(userRoleFilter === 'user' ? 'all' : 'user');
    scrollTo(usersSectionRef);
    window.requestAnimationFrame(() => userSearchRef.current?.focus());
  }, [scrollTo, setUserRoleFilter, setUserSearch, userRoleFilter]);

  const onDeletedMetricClick = useCallback(() => {
    scrollTo(inactiveSectionRef);
  }, [scrollTo]);

  const onDepositsMetricClick = useCallback(() => {
    setTxSearch('');
    setTxTypeFilter(txTypeFilter === 'deposit' ? 'all' : 'deposit');
    scrollTo(txSectionRef);
    window.requestAnimationFrame(() => txSearchRef.current?.focus());
  }, [scrollTo, setTxSearch, setTxTypeFilter, txTypeFilter]);

  const onWithdrawalsMetricClick = useCallback(() => {
    setTxSearch('');
    setTxTypeFilter(txTypeFilter === 'withdraw' ? 'all' : 'withdraw');
    scrollTo(txSectionRef);
    window.requestAnimationFrame(() => txSearchRef.current?.focus());
  }, [scrollTo, setTxSearch, setTxTypeFilter, txTypeFilter]);

  const metrics = useMemo(() => {
    return [
      {
        key: 'players',
        label: t('dash_metric_players'),
        value: playersCount,
        loading: loadingUsers,
        active: userRoleFilter === 'user',
        onClick: onPlayersMetricClick,
      },
      {
        key: 'deleted',
        label: t('dash_metric_deletedUsers'),
        value: deletedCount,
        loading: loadingInactive,
        onClick: onDeletedMetricClick,
      },
      {
        key: 'deposits',
        label: t('dash_metric_deposits'),
        value: depositsCount,
        loading: loadingTx,
        active: txTypeFilter === 'deposit',
        onClick: onDepositsMetricClick,
      },
      {
        key: 'withdrawals',
        label: t('dash_metric_withdrawals'),
        value: withdrawalsCount,
        loading: loadingTx,
        active: txTypeFilter === 'withdraw',
        onClick: onWithdrawalsMetricClick,
      },
    ];
  }, [
    deletedCount,
    depositsCount,
    loadingInactive,
    loadingTx,
    loadingUsers,
    onDeletedMetricClick,
    onDepositsMetricClick,
    onPlayersMetricClick,
    onWithdrawalsMetricClick,
    playersCount,
    t,
    txTypeFilter,
    userRoleFilter,
    withdrawalsCount,
  ]);



  return (
    <div className="dash-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <DashboardHeader title={t('dash_super_title')} username={username} role={role} />

      <DashboardMetricsStrip
        role={role}
        loadingUsers={loadingUsers}
        loadingTx={loadingTx}
        managedUsers={managedUsers}
        transactions={transactions}
        inactiveUsers={inactiveUsers}
        loadingInactive={loadingInactive}
      />

      {role === 'super_admin' && (
        <ConnectedUsersCard
          sessions={presenceSessions}
          loadingSessions={loadingPresenceSessions}
          history={presenceHistory}
          loadingHistory={loadingPresenceHistory}
          counts={presenceCounts}
          connectedWindowMs={connectedWindowMs}
        />
      )}

      <div className="dash-grid-2">
        <WalletSummaryCard
          title={t('dash_super_walletTitle')}
          loading={loadingBalance}
          balance={balance}
          collapseKey="dash:collapsed:super:wallet"
        >
          <form onSubmit={onTransferSubmit} className="space-y-4 mt-4">
            <h3 className="dash-subtitle">{t('dash_super_transferTitle')}</h3>
            <div>
              <label className="dash-label">{t('dash_transfer_recipientLabel')}</label>
              <InputWithPaste
                variant="dashboard"
                value={transferUsername}
                onChange={(e) => {
                  const next = e.target.value;
                  setTransferUsername(next);
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
                value={transferAmount}
                onChange={(e) => {
                  const next = e.target.value;
                  setTransferAmount(next);
                  if (transferAmountError) setTransferAmountError(validateAmount(next));
                }}
                placeholder="100"
              />
              {transferAmountError ? (
                <p className="mt-1 text-xs font-bold text-red-500/90">{transferAmountError}</p>
              ) : null}
            </div>
            <StyledButton type="submit" disabled={submitting} className="w-full h-11">
              {submitting ? t('common_submitting') : t('dash_super_transferTitle')}
            </StyledButton>
          </form>
        </WalletSummaryCard>

        <div className="space-y-6">
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
            <form onSubmit={onDebitSubmit} className="space-y-4">
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
              <StyledButton type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? t('common_submitting') : t('dash_debitUserSubmit')}
              </StyledButton>
            </form>
            )}
          </StyledCard>
        </div>
      </div>

      <div className="grid gap-8">
        <div ref={usersSectionRef}>
          <LazySection fallback={<DashboardSkeleton rows={6} />}>
            <ManagedUsersCard
              loading={loadingUsers || isSearching}
              hasUsers={userPageRows.length > 0}
            emptyState={
              <DashboardEmptyState
                icon={userSearch || userRoleFilter !== 'all' ? FilterX : Users}
                title={t('dash_noUsers')}
                action={
                  userSearch || userRoleFilter !== 'all' ? (
                    <StyledButton variant="secondary" size="sm" onClick={clearUserFilters}>
                      {t('dash_action_clearFilters')}
                    </StyledButton>
                  ) : (
                    <StyledButton
                      variant="secondary"
                      size="sm"
                      onClick={() => scrollTo(createUserSectionRef)}
                    >
                      {t('dash_action_createUser')}
                    </StyledButton>
                  )
                }
              />
            }
            filters={
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <InputWithPaste
                  variant="dashboard"
                  className="md:flex-1"
                  placeholder={t('dash_userSearchPlaceholder')}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  showSearch
                  ref={userSearchRef}
                  data-dashboard-search="true"
                />
                <select
                  className="w-full md:w-48 dash-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="all">{t('dash_allRolesOption')}</option>
                  <option value="super_admin">super_admin</option>
                  <option value="admin">admin</option>
                  <option value="sub_admin">sub_admin</option>
                  <option value="user">user</option>
                </select>
              </div>
            }
            mobileRows={userPageRows.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900/30 backdrop-blur-md rounded-2xl p-4 space-y-3 text-sm border border-slate-800/80 hover:border-violet-500/30 transition-all group/user"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 relative z-20">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span className="font-bold tracking-tight">{u.username}</span>
                  <CopyIconButton value={u.username} className="w-fit scale-75 opacity-0 group-hover/user:opacity-100 transition-opacity" />
                </div>
                <span className="text-[10px] font-black tracking-widest bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full">{u.role}</span>
              </div>
              {role === 'super_admin' && u.plain_pw && (
                <div className="flex items-center gap-2 text-xs bg-slate-900/50 p-2 rounded-lg" dir="ltr">
                  <span className="text-slate-500">{t('dash_newCredentials_password')}:</span>
                  <span className="font-mono text-violet-300">{u.plain_pw}</span>
                  <CopyIconButton value={u.plain_pw} className="w-fit scale-75" />
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-400">
                <span>{t('dash_balanceLabel')}: <span className="font-bold text-white">{Number(u.balance || 0).toFixed(2)}</span></span>
                <span>{t('dash_byLabel')}: <span className="text-violet-400/80">{resolveUsernameById(u.created_by)}</span></span>
              </div>
              <StyledButton
                size="sm"
                variant="danger"
                className="w-full text-[10px]"
                onClick={() => handleDeleteUser(u.id)}
                disabled={deletingUserId === u.id}
              >
                {deletingUserId === u.id ? t('common_deleting') : t('dash_deleteUser')}
              </StyledButton>
            </div>
          ))}
          desktopHead={
            <tr className="dash-table-head-row">
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_usernameLabel')}</th>
              {role === 'super_admin' && (
                <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_newCredentials_password')}</th>
              )}
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_roleLabel')}</th>
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_balanceLabel')}</th>
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_createdByLabel')}</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">{t('dash_actionsLabel')}</th>
            </tr>
          }
          desktopRows={userPageRows.map((u, idx) => (
            <tr
              key={u.id}
              className={cn(
                "border-b border-slate-800/40 hover:bg-violet-500/5 transition-colors group/row",
                idx % 2 === 0 ? "bg-slate-900/10" : "bg-transparent"
              )}
            >
              <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">
                <div className="flex items-center gap-2 relative z-20">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-[10px] text-violet-400 font-black">
                    {u.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium group-hover/row:text-violet-300 transition-colors">{u.username}</span>
                  <CopyIconButton value={u.username} className="w-fit scale-75 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                </div>
              </td>
              {role === 'super_admin' && (
                <td
                  className="py-3 px-4 border-r border-slate-800/60 font-mono text-xs whitespace-nowrap"
                  dir="ltr"
                >
                  <div className="flex items-center gap-1">
                    <span className="opacity-60 group-hover/row:opacity-100">{u.plain_pw || '-'}</span>
                    {u.plain_pw && <CopyIconButton value={u.plain_pw} className="w-fit scale-75" />}
                  </div>
                </td>
              )}
              <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">
                <span className="text-[10px] font-black tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded-md group-hover/row:bg-violet-500/20 group-hover/row:text-violet-300 transition-all">{u.role}</span>
              </td>
              <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap font-bold tabular-nums">
                {Number(u.balance || 0).toFixed(2)}
              </td>
              <td className="py-3 px-4 border-r border-slate-800/60 text-xs text-slate-500 whitespace-nowrap">
                {resolveUsernameById(u.created_by)}
              </td>
              <td className="py-3 px-4 text-xs whitespace-nowrap">
                <StyledButton
                  size="sm"
                  variant="danger"
                  className="h-8 px-3 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteUser(u.id)}
                  disabled={deletingUserId === u.id}
                >
                  {deletingUserId === u.id ? t('common_deleting') : t('dash_deleteUser')}
                </StyledButton>
              </td>
            </tr>
          ))}
            showPagination={showUserPagination}
            currentPage={currentUserPage}
            totalPages={userTotalPages}
            onPageChange={setUserPage}
          />
          </LazySection>
        </div>

        <div ref={txSectionRef}>
          <LazySection fallback={<DashboardSkeleton rows={4} />}>
            <AdvancedTransactionsCard
            loading={loadingTx}
            hasTransactions={txPageRows.length > 0}
            emptyState={
              <DashboardEmptyState
                icon={txSearch || txTypeFilter !== 'all' ? FilterX : ArrowDownCircle}
                title={t('dash_noTransactions')}
                action={
                  txSearch || txTypeFilter !== 'all' ? (
                    <StyledButton variant="secondary" size="sm" onClick={clearTxFilters}>
                      {t('dash_action_clearFilters')}
                    </StyledButton>
                  ) : null
                }
              />
            }
            filters={
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <InputWithPaste
                  variant="dashboard"
                  className="md:flex-1"
                  placeholder={t('dash_txSearchPlaceholder')}
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  showSearch
                  ref={txSearchRef}
                  data-dashboard-search="true"
                />
                <select
                  className="w-full md:w-48 dash-select"
                  value={txTypeFilter}
                  onChange={(e) => setTxTypeFilter(e.target.value)}
                >
                  <option value="all">{t('dash_allTypesOption')}</option>
                  <option value="deposit">deposit</option>
                  <option value="withdraw">withdraw</option>
                </select>
              </div>
            }
            mobileRows={txPageRows.map((t) => (
            <div
              key={t.id}
              className="bg-slate-900/30 backdrop-blur-md rounded-2xl p-4 space-y-2 text-sm border border-slate-800/80 hover:border-violet-500/30 transition-all group/tx"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded-md group-hover/tx:bg-violet-500/20 group-hover/tx:text-violet-300 transition-all">
                  {formatTransactionType(t.type)}
                </span>
                <span className="font-black text-white">{Number(t.amount || 0).toFixed(2)} <span className="text-[10px] opacity-40">TND</span></span>
              </div>
              <div className="text-xs text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                <span>{resolveUsernameById(t.sender_id)}</span>
                <span className="opacity-20">→</span>
                <span>{resolveUsernameById(t.receiver_id)}</span>
              </div>
              <div className="text-[10px] text-slate-500 pl-1 font-medium">
                {t.created_at ? new Date(t.created_at).toLocaleString('en-GB') : '-'}
              </div>
            </div>
          ))}
          desktopRows={txPageRows.map((t, idx) => (
            <tr
              key={t.id}
              className={cn(
                "border-b border-slate-800/40 hover:bg-violet-500/5 transition-colors group/tx",
                idx % 2 === 0 ? "bg-slate-900/10" : "bg-transparent"
              )}
            >
              <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">
                <span className="text-[10px] font-black tracking-widest bg-slate-800 text-slate-400 px-2 py-1 rounded-md group-hover/tx:bg-violet-500/20 group-hover/tx:text-violet-300 transition-all">
                  {formatTransactionType(t.type)}
                </span>
              </td>
              <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap font-bold tabular-nums">
                {Number(t.amount || 0).toFixed(2)}
              </td>
              <td className="py-3 px-4 border-r border-slate-800/60 text-xs whitespace-nowrap">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-medium text-slate-300">{resolveUsernameById(t.sender_id)}</span>
                  <span className="opacity-20">→</span>
                  <span className="font-medium text-slate-300">{resolveUsernameById(t.receiver_id)}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-[11px] text-slate-500 whitespace-nowrap font-medium">
                {t.created_at ? new Date(t.created_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
              </td>
            </tr>
          ))}
            showPagination={showTxPagination}
            currentPage={currentTxPage}
            totalPages={txTotalPages}
            onPageChange={setTxPage}
          />
          </LazySection>
        </div>
      </div>

      {/* Password Change Section */}
      <LazySection fallback={<DashboardSkeleton rows={2} />}>
        <PasswordChangeSection collapseKey="dash:collapsed:super:password_change" />
      </LazySection>

      <div className="grid gap-8 md:grid-cols-2">
        <StyledCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="dash-section-title">{t('dash_deletedUsersTitle')}</h2>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-violet-500/20 to-transparent ml-4" />
            <div className="flex items-center gap-2 relative z-20">
              <div className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  console.log('Deleted Users button clicked', e.target);
                  setDeletedUsersCollapsed((v) => !v);
                }}
                aria-expanded={!deletedUsersCollapsed}
                className="dash-collapse-btn"
              >
                {deletedUsersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div ref={inactiveSectionRef} />

          {deletedUsersCollapsed ? null : loadingInactive ? (
            <p className="text-sm text-slate-500 italic">{t('loading_defaultMessage')}</p>
          ) : inactiveUsers.length === 0 ? (
            <DashboardEmptyState icon={UserX} title={t('dash_noDeletedUsers')} />
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="md:hidden space-y-4">
                {inactivePageRows.map((u) => (
                  <div key={u.id} className="bg-slate-900/30 rounded-2xl p-4 space-y-3 border border-slate-800/80 group/inactive">
                    <div className="flex items-center justify-between">
                      <span className="font-bold tracking-tight">{u.username}</span>
                      <span className="text-[10px] font-black tracking-widest bg-slate-800 text-slate-500 px-2 py-1 rounded">{u.role}</span>
                    </div>
                    <div className=" text-xs text-slate-500">{t('dash_byLabel')}: {resolveUsernameById(u.created_by)}</div>
                    <StyledButton
                      size="sm"
                      variant="primary"
                      className="w-full text-[10px]"
                      onClick={() => handleRestoreUser(u.id)}
                      disabled={restoringUserId === u.id}
                    >
                      {restoringUserId === u.id ? t('common_restoring') : t('dash_restoreUser')}
                    </StyledButton>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-slate-800/60">
                <table className="w-full table-fixed text-sm">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800">
                      <th className="py-3 px-4 w-[32%] text-right text-[10px] font-black tracking-[0.2em] text-slate-500 border-r border-slate-800/60 whitespace-nowrap">{t('dash_usernameLabel')}</th>
                      <th className="py-3 px-4 w-[18%] text-right text-[10px] font-black tracking-[0.2em] text-slate-500 border-r border-slate-800/60 whitespace-nowrap">{t('dash_roleLabel')}</th>
                      <th className="py-3 px-4 w-[26%] text-right text-[10px] font-black tracking-[0.2em] text-slate-500 border-r border-slate-800/60 whitespace-nowrap">{t('dash_createdByLabel')}</th>
                      <th className="py-3 px-4 w-[24%] text-right text-[10px] font-black tracking-[0.2em] text-slate-500 whitespace-nowrap">{t('dash_actionsLabel')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactivePageRows.map((u, idx) => (
                      <tr
                        key={u.id}
                        className={cn(
                          "border-b border-slate-800/40 hover:bg-emerald-500/5 transition-colors group/row",
                          idx % 2 === 0 ? "bg-slate-900/10" : "bg-transparent"
                        )}
                      >
                        <td className="py-3 px-4 border-r border-slate-800/60 font-medium whitespace-normal break-words">
                          {u.username}
                        </td>
                        <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap">
                          <span className="text-[10px] font-black tracking-widest bg-slate-800 text-slate-500 px-2 py-1 rounded">{u.role}</span>
                        </td>
                        <td className="py-3 px-4 border-r border-slate-800/60 text-xs text-slate-500 whitespace-normal break-words">
                          {resolveUsernameById(u.created_by)}
                        </td>
                        <td className="py-3 px-4 text-xs whitespace-nowrap">
                          <StyledButton
                            size="sm"
                            variant="primary"
                            className="h-8 px-2 text-[10px] opacity-80 hover:opacity-100 transition-opacity"
                            onClick={() => handleRestoreUser(u.id)}
                            disabled={restoringUserId === u.id}
                          >
                            {restoringUserId === u.id ? t('common_restoring') : t('dash_restoreUser')}
                          </StyledButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {showInactivePagination && (
                <Pagination
                  currentPage={currentInactivePage}
                  totalPages={inactiveTotalPages}
                  onPageChange={setInactivePage}
                />
              )}
            </>
          )}
        </StyledCard>

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
                  onClick={(e) => {
                    console.log('Create User button clicked', e.target);
                    setCreateUserCollapsed((v) => !v);
                  }}
                  aria-expanded={!createUserCollapsed}
                  className="dash-collapse-btn"
                >
                  {createUserCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {createUserCollapsed ? null : (
            <form onSubmit={handleCreateUser} className="space-y-6">
            <div>
              <label className="dash-label">{t('dash_roleLabel')}</label>
              <select
                className="dash-select"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="admin">{t('dash_role_admin')}</option>
                <option value="sub_admin">{t('dash_role_subAdmin')}</option>
                <option value="user">{t('dash_role_user')}</option>
              </select>
            </div>

            <StyledButton type="submit" disabled={creatingUser} className="w-full h-11">
              {creatingUser ? t('common_creatingUser') : t('dash_createUserButton')}
            </StyledButton>

            {createdCredentials && (
              <div className="mt-4 text-sm bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4 relative overflow-hidden group">
                {/* Decorative background mark */}
                <div className="absolute -right-4 -bottom-4 text-6xl font-black text-violet-500/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">New</div>

                <p className="font-black tracking-widest text-[10px] text-violet-400 mb-3">{t('dash_newCredentialsTitle')}</p>
                <div className="space-y-3 relative z-10">
                  <p className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-white/5">
                    <span className="text-xs text-slate-400">
                      {t('dash_newCredentials_username')}:{' '}
                      <span className="font-mono text-white font-bold ml-1">{createdCredentials.username}</span>
                    </span>
                    <CopyIconButton value={createdCredentials.username} className="w-fit scale-75" />
                  </p>
                  <p className="flex items-center justify-between bg-slate-950/40 p-2 rounded-lg border border-white/5">
                    <span className="text-xs text-slate-400">
                      {t('dash_newCredentials_password')}: {' '}
                      <span className="font-mono text-violet-300 font-bold ml-1">{createdCredentials.password}</span>
                    </span>
                    <CopyIconButton value={createdCredentials.password} className="w-fit scale-75" />
                  </p>
                </div>
              </div>
            )}
          </form>
          )}
          </StyledCard>
        </div>

        <StyledCard>
          <div className="dash-section-header">
            <h2 className="dash-section-title">{t('dash_resetPasswordTitle')}</h2>
            <div className="dash-section-rule" />
            <div className="flex items-center gap-2 relative z-20">
              <div className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordCollapsed((v) => !v)}
                aria-expanded={!resetPasswordCollapsed}
                className="dash-collapse-btn"
              >
                {resetPasswordCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {resetPasswordCollapsed ? null : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="dash-label">{t('dash_selectUserLabel')}</label>
              <InputWithPaste
                variant="dashboard"
                className="mb-3"
                placeholder={t('dash_userSearchSimplePlaceholder')}
                value={resetUserSearch}
                onChange={(e) => setResetUserSearch(e.target.value)}
                showSearch
              />
              <select
                className="dash-select"
                value={resetUserId}
                onChange={(e) => setResetUserId(e.target.value)}
              >
                <option value="">{t('dash_selectUserPlaceholder')}</option>
                {filteredResetUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="dash-label">{t('password_new_label')}</label>
              <InputWithPaste
                variant="dashboard"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <StyledButton type="submit" disabled={resetting} className="w-full h-11">
              {resetting ? t('common_submitting') : t('dash_resetPasswordButton')}
            </StyledButton>
          </form>
          )}
        </StyledCard>
      </div>
    </div>
  );
}
