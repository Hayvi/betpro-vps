import { useEffect, useState, useRef } from 'react';
import { Bell, Check, X, Clock } from '@/components/ui/BrandIcons';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotificationCenter } from '@/hooks/useNotificationCenter';
import { useI18n } from '@/contexts/I18nContext';
import { safeSetItem, safeGetItem } from '@/services/localStorageService';

const STORAGE_KEY = 'betpro_notifications_last_seen_at';

export function NotificationBell() {
  const { isDark } = useTheme();
  const {
    isAuthenticated,
    notifications,
    withdrawalRequests,
    sentRequests,
    senderNames,
    processingId,
    handleApprove,
    handleReject,
  } = useNotificationCenter();
  const { t, isRtl, language } = useI18n();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const location = useLocation();
  const [lastSeenAt, setLastSeenAt] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return safeGetItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const hasUnreadNotifications = notifications.some((n) => {
    if (!lastSeenAt) return true;
    return new Date(n.created_at).getTime() > new Date(lastSeenAt).getTime();
  });

  const hasUnreadRequests = withdrawalRequests.length > 0;
  const hasUnread = hasUnreadNotifications || hasUnreadRequests;

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside (but not on the bell button)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the bell button (let handleToggleOpen handle it)
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  if (!isAuthenticated) return null;

  const handleToggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      const nowIso = new Date().toISOString();
      setLastSeenAt(nowIso);
      try {
        if (typeof window !== 'undefined') {
          const success = safeSetItem(STORAGE_KEY, nowIso);
          if (!success) {
            console.warn('Failed to save notification timestamp due to storage limits');
          }
        }
      } catch {
        // ignore
      }
    }
  };

  const formatAmount = (value) => Number(value || 0).toFixed(2);

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    if (diff <= 0) return t('notifications_timeExpired');
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('notifications_timeLessThanMinute');
    return t('notifications_timeMinutes').replace('{minutes}', String(minutes));
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return t('notifications_status_pending');
      case 'approved':
        return t('notifications_status_approved');
      case 'rejected':
        return t('notifications_status_rejected');
      case 'expired':
        return t('notifications_status_expired');
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-emerald-500';
      case 'rejected': return 'text-red-500';
      case 'expired': return 'text-orange-500';
      default: return 'text-yellow-500';
    }
  };


  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={t('notifications_bellAria')}
        onClick={handleToggleOpen}
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-110 shadow-[0_10px_30px_rgba(15,23,42,0.7)]',
          isDark
            ? 'bg-slate-900/60 border-slate-700/50 text-slate-100 hover:bg-slate-800/80 shadow-sm'
            : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
        )}
      >
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center border border-violet-500/30">
          <Bell className="w-3 h-3 text-white" />
        </div>
        {hasUnread && (
          <span className="absolute -top-0.5 -left-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className={cn(
            'fixed sm:absolute mt-2 left-2 right-2 sm:left-auto sm:right-0 w-auto sm:w-80 rounded-xl shadow-lg text-sm z-50 max-h-[70vh] overflow-hidden flex flex-col',
            'top-14 sm:top-auto',
            isDark
              ? 'bg-slate-900 border border-slate-700 text-slate-50'
              : 'bg-white border border-slate-200 text-slate-900'
          )}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <PendingWithdrawalSection
            withdrawalRequests={withdrawalRequests}
            isDark={isDark}
            cn={cn}
            getTimeRemaining={getTimeRemaining}
            formatAmount={formatAmount}
            processingId={processingId}
            handleApprove={handleApprove}
            handleReject={handleReject}
          />

          <SentRequestsSection
            sentRequests={sentRequests}
            isDark={isDark}
            cn={cn}
            formatAmount={formatAmount}
            getStatusColor={getStatusColor}
            getStatusLabel={getStatusLabel}
          />

          <NotificationsSection
            notifications={notifications}
            withdrawalRequests={withdrawalRequests}
            isDark={isDark}
            cn={cn}
            formatAmount={formatAmount}
            senderNames={senderNames}
          />
        </div>
      )}
    </div>
  );
}

function PendingWithdrawalSection({
  withdrawalRequests,
  isDark,
  cn,
  getTimeRemaining,
  formatAmount,
  processingId,
  handleApprove,
  handleReject,
}) {
  const { t } = useI18n();
  if (!withdrawalRequests.length) return null;

  return (
    <>
      <div
        className={cn(
          'px-3 py-2 text-xs font-semibold border-b text-right bg-yellow-500/10',
          isDark ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        {t('notifications_pendingWithdrawalsTitle')} ({withdrawalRequests.length})
      </div>
      <div className="max-h-48 overflow-y-auto">
        {withdrawalRequests.map((req) => (
          <div
            key={req.id}
            className={cn(
              'px-3 py-3 border-b',
              isDark ? 'border-slate-800 bg-yellow-500/5' : 'border-slate-100 bg-yellow-50'
            )}
          >
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {t('notifications_withdrawalRequestLabel')}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getTimeRemaining(req.expires_at)}
                </span>
              </div>
              <div className="text-xs">
                {t('notifications_amountLabel')}{' '}
                <span className="font-bold text-red-500">
                  {formatAmount(req.amount)} {t('wallet_currencyCode')}
                </span>
              </div>
              <div className="text-xs">
                {t('notifications_fromLabel')}{' '}
                <span className="font-bold">{req.requester_username}</span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  {t('notifications_approve')}
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={processingId === req.id}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                  {t('notifications_reject')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SentRequestsSection({
  sentRequests,
  isDark,
  cn,
  formatAmount,
  getStatusColor,
  getStatusLabel,
}) {
  const { t } = useI18n();
  if (!sentRequests.length) return null;

  return (
    <>
      <div
        className={cn(
          'px-3 py-2 text-xs font-semibold border-b text-right',
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
        )}
      >
        {t('notifications_sentWithdrawalsTitle')}
      </div>
      <div className="max-h-32 overflow-y-auto">
        {sentRequests.slice(0, 5).map((req) => (
          <div
            key={req.id}
            className={cn(
              'px-3 py-2 border-b text-xs',
              isDark ? 'border-slate-800' : 'border-slate-100'
            )}
          >
            <div className="flex items-center justify-between">
              <span>
                {formatAmount(req.amount)} {t('wallet_currencyCode')} → {req.target_username}
              </span>
              <span className={cn('font-medium', getStatusColor(req.status))}>
                {getStatusLabel(req.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function NotificationsSection({
  notifications,
  withdrawalRequests,
  isDark,
  cn,
  formatAmount,
  senderNames,
}) {
  const { t, language } = useI18n();
  const locale = language === 'fr' ? 'fr-FR' : 'ar-TN';
  return (
    <>
      <div
        className={cn(
          'px-3 py-2 text-xs font-semibold border-b text-right',
          isDark ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        {t('notifications_title')}
      </div>

      {notifications.length === 0 && withdrawalRequests.length === 0 ? (
        <div className="px-3 py-3 text-xs text-slate-500 text-right">
          {t('notifications_empty')}
        </div>
      ) : notifications.length === 0 ? null : (
        <div className="max-h-72 overflow-y-auto">
          {notifications.slice(0, 10).map((n) => {
            const senderName = senderNames[n.sender_id] || t('header_userFallback');
            const createdAt = n.created_at ? new Date(n.created_at) : null;
            const dateStr = createdAt
              ? createdAt.toLocaleDateString(locale)
              : '';
            const timeStr = createdAt
              ? createdAt.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })
              : '';

            return (
              <div
                key={n.id}
                className={cn(
                  'px-3 py-2 border-b last:border-b-0 text-xs',
                  isDark ? 'border-slate-800' : 'border-slate-100'
                )}
              >
                <div className="space-y-1 w-full">
                  <div className="font-semibold text-right">{t('notifications_balanceNotificationTitle')}</div>
                  <div className="text-xs text-right">
                    {t('notifications_amountLabel')}{' '}
                    <span className="font-bold text-emerald-500">
                      +{formatAmount(n.amount)} {t('wallet_currencyCode')}
                    </span>
                  </div>
                  <div className="text-xs text-right overflow-hidden">
                    {t('notifications_fromLabel')}{' '}
                    <span className="font-bold">{senderName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 text-right">
                    {timeStr && dateStr ? `${timeStr} | ${dateStr}` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
