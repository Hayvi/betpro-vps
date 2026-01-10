import { CopyIconButton } from '@/components/CopyIconButton';
import { InputWithPaste } from '@/components/ui/InputWithPaste';
import { StyledButton } from '@/components/ui/StyledButton';
import { StyledCard } from '@/components/ui/StyledCard';
import { PasswordChangeSection } from '@/components/PasswordChangeSection';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { WalletSummaryCard } from '@/components/dashboard/WalletSummaryCard';
import { ManagedUsersCard } from '@/components/dashboard/ManagedUsersCard';
import { AdvancedTransactionsCard } from '@/components/dashboard/AdvancedTransactionsCard';
import { DashboardMetricsStrip } from '@/components/dashboard/DashboardMetricsStrip';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FilterX, Users, ArrowDownCircle, ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { useDashboardShortcuts } from '@/hooks/useDashboardShortcuts';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function AdminDashboard() {
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
  } = useAdminDashboard();

  const { t, isRtl } = useI18n();

  const [debitCollapsed, setDebitCollapsed] = useLocalStorage('dash:collapsed:admin:debit', true, {
    context: 'AdminDashboard:Debit',
  });

  const [createUserCollapsed, setCreateUserCollapsed] = useLocalStorage('dash:collapsed:admin:create_user', true, {
    context: 'AdminDashboard:CreateUser',
  });

  const usersSectionRef = useRef(null);
  const txSectionRef = useRef(null);
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

  const { playersCount, subAdminsCount } = useMemo(() => {
    let players = 0;
    let subAdmins = 0;
    for (const u of managedUsers) {
      if (u.role === 'user') players += 1;
      if (u.role === 'sub_admin') subAdmins += 1;
    }
    return { playersCount: players, subAdminsCount: subAdmins };
  }, [managedUsers]);

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

  const onSubAdminsMetricClick = useCallback(() => {
    setUserSearch('');
    setUserRoleFilter(userRoleFilter === 'sub_admin' ? 'all' : 'sub_admin');
    scrollTo(usersSectionRef);
    window.requestAnimationFrame(() => userSearchRef.current?.focus());
  }, [scrollTo, setUserRoleFilter, setUserSearch, userRoleFilter]);

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
        key: 'subAdmins',
        label: t('dash_metric_subAdmins'),
        value: subAdminsCount,
        loading: loadingUsers,
        active: userRoleFilter === 'sub_admin',
        onClick: onSubAdminsMetricClick,
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
    depositsCount,
    loadingTx,
    loadingUsers,
    onDepositsMetricClick,
    onPlayersMetricClick,
    onSubAdminsMetricClick,
    onWithdrawalsMetricClick,
    playersCount,
    subAdminsCount,
    t,
    txTypeFilter,
    userRoleFilter,
    withdrawalsCount,
  ]);

  return (
    <div className="dash-page" dir={isRtl ? 'rtl' : 'ltr'}>
      <DashboardHeader title={t('dash_admin_title')} username={username} role={role} />

      <DashboardMetricsStrip items={metrics} />

      <div className="dash-grid-2">
        <WalletSummaryCard
          title={t('dash_admin_walletTitle')}
          loading={loadingBalance}
          balance={balance}
          collapseKey="dash:collapsed:admin:wallet"
        >
          <form onSubmit={onTransferSubmit} className="space-y-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 bg-primary/40 rounded-full" />
              <h3 className="dash-subtitle">{t('dash_admin_transferTitle')}</h3>
            </div>
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
              {submitting ? t('common_submitting') : t('dash_admin_transferTitle')}
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
        </div>
      </div>

      <div className="grid gap-6">
        <div ref={usersSectionRef}>
          <ManagedUsersCard
            loading={loadingUsers}
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
            <div className="flex flex-col md:flex-row gap-3 mb-3">
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
                className="w-full md:w-40 dash-select"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">{t('dash_allRolesOption')}</option>
                <option value="admin">admin</option>
                <option value="sub_admin">sub_admin</option>
                <option value="user">user</option>
              </select>
            </div>
          }
          mobileRows={userPageRows.map((u) => (
            <div
              key={u.id}
              className="bg-slate-900/40 rounded-xl p-4 space-y-3 text-sm border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full -mr-8 -mt-8" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2 relative z-20">
                  <span className="font-black tracking-tight text-white">{u.username}</span>
                  <CopyIconButton value={u.username} />
                </div>
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                  u.role === 'admin' ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                    u.role === 'sub_admin' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                )}>
                  {u.role}
                </span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-slate-800/30">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate-500 font-black tracking-widest">{t('dash_balanceLabel')}</p>
                  <p className="font-black text-primary">{Number(u.balance || 0).toFixed(2)} TND</p>
                </div>
                <p className="text-[10px] text-slate-500 opacity-60">
                  {t('dash_byLabel')}: <span className="text-white">{resolveUsernameById(u.created_by)}</span>
                </p>
              </div>
            </div>
          ))}
          desktopHead={
            <tr className="dash-table-head-row">
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_usernameLabel')}</th>
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_roleLabel')}</th>
              <th className="py-3 px-4 text-right border-r border-slate-800/60 whitespace-nowrap">{t('dash_balanceLabel')}</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">{t('dash_createdByLabel')}</th>
            </tr>
          }
          desktopRows={userPageRows.map((u) => (
            <tr
              key={u.id}
              className="border-b border-slate-800/30 hover:bg-white/[0.02] transition-colors group"
            >
              <td className="py-3 px-3 border-r border-slate-800/60 whitespace-nowrap">
                <div className="flex items-center gap-2 relative z-20">
                  <span className="font-black tracking-tight text-white/80 group-hover:text-white transition-colors">{u.username}</span>
                  <CopyIconButton value={u.username} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </td>
              <td className="py-3 px-3 border-r border-slate-800/60 whitespace-nowrap">
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                  u.role === 'admin' ? "bg-violet-500/10 text-violet-400 border-violet-500/20" :
                    u.role === 'sub_admin' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      "bg-slate-500/10 text-slate-400 border-slate-500/20"
                )}>
                  {u.role}
                </span>
              </td>
              <td className="py-3 px-3 border-r border-slate-800/60 whitespace-nowrap font-black text-primary">
                {Number(u.balance || 0).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-[10px] text-slate-500 whitespace-nowrap tracking-wider">
                <span className="opacity-60">{t('dash_byLabel')}:</span> {resolveUsernameById(u.created_by)}
              </td>
            </tr>
          ))}
            showPagination={showUserPagination}
            currentPage={currentUserPage}
            totalPages={userTotalPages}
            onPageChange={setUserPage}
          />
        </div>

        <div ref={txSectionRef}>
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
            <div className="flex flex-col md:flex-row gap-3 mb-3">
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
                className="w-full md:w-40 dash-select"
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
              className="bg-slate-900/40 rounded-xl p-4 space-y-3 text-sm border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                  t.type === 'deposit' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}>
                  {formatTransactionType(t.type)}
                </span>
                <span className="font-black text-white">{Number(t.amount || 0).toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between items-end text-[10px]">
                <div className="text-slate-400 font-medium">
                  <span className="text-white opacity-80">{resolveUsernameById(t.sender_id)}</span>
                  <span className="mx-1 text-primary">→</span>
                  <span className="text-white opacity-80">{resolveUsernameById(t.receiver_id)}</span>
                </div>
                <div className="text-slate-500 opacity-60">
                  {t.created_at ? new Date(t.created_at).toLocaleString('en-GB') : '-'}
                </div>
              </div>
            </div>
          ))}
          desktopRows={txPageRows.map((t) => (
            <tr
              key={t.id}
              className="border-b border-slate-800/30 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-3 border-r border-slate-800/60 whitespace-nowrap">
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
                  t.type === 'deposit' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                )}>
                  {formatTransactionType(t.type)}
                </span>
              </td>
              <td className="py-3 px-4 border-r border-slate-800/60 whitespace-nowrap font-black text-white">
                {Number(t.amount || 0).toFixed(2)}
              </td>
              <td className="py-3 px-4 border-r border-slate-800/60 text-[10px] text-slate-400 whitespace-nowrap">
                <span className="text-white opacity-80">{resolveUsernameById(t.sender_id)}</span>
                <span className="mx-2 text-primary font-black">→</span>
                <span className="text-white opacity-80">{resolveUsernameById(t.receiver_id)}</span>
              </td>
              <td className="py-3 px-4 text-[10px] text-slate-500 whitespace-nowrap tracking-wider">
                {t.created_at ? new Date(t.created_at).toLocaleString('en-GB') : '-'}
              </td>
            </tr>
          ))}
            showPagination={showTxPagination}
            currentPage={currentTxPage}
            totalPages={txTotalPages}
            onPageChange={setTxPage}
          />
        </div>
      </div>

      {/* Password Change Section */}
      <PasswordChangeSection collapseKey="dash:collapsed:admin:password_change" />

      <div className="dash-grid-2">
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
                <select
                  className="dash-select"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="sub_admin">{t('dash_role_subAdmin')}</option>
                  <option value="user">{t('dash_role_user')}</option>
                </select>
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
    </div>
  );
}
