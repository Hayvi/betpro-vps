import { useState, useEffect, useRef, memo, startTransition } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { BPCoinIcon, BPLoginIcon, BPLogoutIcon, BPUserIcon } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useScroll } from '@/hooks/useScroll';
import { useAuth } from '@/contexts/AuthContext';
import { useBet } from '@/contexts/BetContext';
import { useI18n } from '@/contexts/I18nContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';


const BalanceChip = memo(function BalanceChip({ isDark, userBalance }) {
  const animatedBalance = useAnimatedNumber(userBalance);

  return (
    <div className={cn(
      "flex items-center gap-1 px-1.5 py-1 rounded-full border mr-0.5 backdrop-blur-md",
      isDark
        ? "bg-slate-900/40 border-slate-700/50 text-slate-100 shadow-sm"
        : "bg-white/50 border-slate-200/60 text-slate-800 shadow-sm"
    )}>
      <BPCoinIcon className="w-3.5 h-3.5 text-amber-500 drop-shadow-sm" />
      <span className="text-[11px] font-black tracking-tight leading-none bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent transform translate-y-[0.5px]">
        {Number(animatedBalance || 0).toFixed(2)}
      </span>
    </div>
  );
});

BalanceChip.displayName = 'BalanceChip';


export function HeaderMobile({
  sideMenuItems = [],
  onLoginClick,
  isAuthenticated = false,
  dashboardPath = '/dashboard/user',
  onLogout,
}) {
  const { isDark, toggleTheme } = useTheme();
  const isScrolled = useScroll();
  const { user } = useAuth();
  const { userBalance } = useBet();
  const location = useLocation();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountButtonRef = useRef(null);
  const accountMenuRef = useRef(null);
  const ignoreNextAccountClickRef = useRef(false);
  const { t, language, setLanguage, isRtl } = useI18n();

  const closeMenuThen = (fn) => {
    setIsAccountMenuOpen(false);
    window.requestAnimationFrame(() => {
      startTransition(() => {
        fn();
      });
    });
  };

  useEffect(() => {
    if (!isAccountMenuOpen) return;

    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, [isAccountMenuOpen]);

  useEffect(() => {
    return;
  }, [isAccountMenuOpen]);


  return (
    <header dir={isRtl ? 'rtl' : 'ltr'} className={cn(
      'md:hidden fixed top-0 left-0 right-0 z-50 h-14 ui-blur-lite',
      isDark
        ? 'bg-slate-950/90 border-b border-slate-800/80'
        : 'bg-white/90 border-b border-slate-200',
      isScrolled && (
        isDark
          ? 'shadow-[0_8px_32px_rgba(15,23,42,0.9)]'
          : 'shadow-[0_8px_32px_rgba(15,23,42,0.15)]'
      ),
      isDark ? 'text-white' : 'text-slate-900'
    )}>
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left: Logo - Pass 3 Upgrade */}
        <div className="flex items-center gap-2">
          {(() => {
            const isHome = location.pathname === '/home';
            return (
              <Link
                to={createPageUrl('home')}
                onClick={(e) => {
                  if (isHome) {
                    e.preventDefault();
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-transform duration-500 group-hover:scale-110">
                    <defs>
                      <linearGradient id="logoGradMob" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#d946ef" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M25,20 H55 C75,20 75,45 55,45 H25 V20 M25,45 H60 C80,45 80,80 60,80 H25 V45"
                      fill="none"
                      stroke="url(#logoGradMob)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-20 animate-spin-slow" />
                  </svg>
                </div>
                <span className={cn(
                  'text-lg font-black tracking-tighter pt-1',
                  isDark
                    ? 'bg-gradient-to-br from-violet-300 via-indigo-200 to-fuchsia-300 text-transparent bg-clip-text'
                    : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-transparent bg-clip-text'
                )}>
                  BET<span className="text-accent">.</span>PRO
                </span>
              </Link>
            );
          })()}
        </div>

        {/* Right: Controls + account */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3">
          {isAuthenticated && (
            <BalanceChip isDark={isDark} userBalance={userBalance} />
          )}

          {isAuthenticated && <NotificationBell />}

          {/* Login (guest) or account chip (logged in) */}
          {isAuthenticated ? (
            <div className="relative" ref={accountMenuRef}>
              {/* Avatar Chip - opens account menu */}
              <button
                ref={accountButtonRef}
                type="button"
                onPointerDown={() => {
                  ignoreNextAccountClickRef.current = true;
                  setIsAccountMenuOpen((prev) => !prev);
                }}
                onClick={(e) => {
                  if (ignoreNextAccountClickRef.current && e.detail !== 0) {
                    ignoreNextAccountClickRef.current = false;
                    return;
                  }

                  ignoreNextAccountClickRef.current = false;
                  setIsAccountMenuOpen((prev) => !prev);
                }}
                className={cn(
                  "relative flex items-center justify-center w-9 h-9 rounded-full border transition-transform duration-200 hover:scale-110 active:scale-95 shadow-[0_10px_30px_rgba(15,23,42,0.7)]",
                  isDark
                    ? "bg-slate-900/60 border-slate-700/50 text-slate-100 shadow-sm"
                    : "bg-white/70 border-slate-200 text-slate-700 shadow-sm"
                )}
              >
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center border border-amber-300/30">
                  <BPUserIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-black tracking-tight text-slate-100 hidden sm:block">
                  {user?.name || t('header_userFallback')}
                </span>
              </button>

              <div
                className={cn(
                  'fixed top-16 left-1/2 -translate-x-1/2 w-[min(92vw,340px)] z-50 rounded-2xl border shadow-lg p-4 space-y-3 overflow-hidden',
                  'transform-gpu will-change-transform ui-fade ui-trans-fast origin-top',
                  isAccountMenuOpen
                    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                    : 'opacity-0 -translate-y-1 scale-[0.98] pointer-events-none',
                  isDark
                    ? 'bg-slate-950/95 border-slate-700/50 text-slate-100 shadow-violet-500/10'
                    : 'bg-white/95 border-slate-200 text-slate-900'
                )}
                dir={isRtl ? 'rtl' : 'ltr'}
                aria-hidden={!isAccountMenuOpen}
              >
                {/* Subtle Brand Halo inside dropdown */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-violet-600/10 blur-lg rounded-full -mr-8 -mt-8 pointer-events-none" />

                <div className={cn(
                  "text-[9px] font-black tracking-[0.2em] mb-1 relative z-10",
                  isDark ? "text-violet-400/80 text-right" : "text-indigo-600/70"
                )}>
                  {t('header_account')}
                </div>

                {/* Dashboard link */}
                <Link
                  to={createPageUrl(dashboardPath.slice(1))}
                  onClick={() => setIsAccountMenuOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl ui-trans-fast relative group/dash h-10',
                    isDark
                      ? 'bg-white/5 border border-white/5 hover:bg-violet-500/10 hover:border-violet-500/20'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span className="text-xs font-black tracking-wider">{t('header_dashboard')}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 opacity-0 group-hover/dash:opacity-100 transition-opacity" />
                </Link>


                  {/* Language row */}
                  <div className={cn(
                    'flex items-center justify-between px-4 py-2 rounded-xl h-10 border',
                    isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                  )}
                  >
                    <span className="text-xs font-black tracking-wider opacity-60">{t('header_language')}</span>
                    <div className="flex items-center gap-1 border border-slate-500/20 rounded-full px-1.5 py-0.5 text-[9px]">
                      <button
                        type="button"
                        onClick={() => closeMenuThen(() => setLanguage('ar'))}
                        className={cn(
                          'px-1.5 py-0.5 rounded-full font-black ui-trans-fast',
                          language === 'ar'
                            ? (isDark ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-200 text-slate-900')
                            : 'opacity-40 hover:opacity-100'
                        )}
                      >
                        AR
                      </button>
                      <button
                        type="button"
                        onClick={() => closeMenuThen(() => setLanguage('fr'))}
                        className={cn(
                          'px-1.5 py-0.5 rounded-full font-black ui-trans-fast',
                          language === 'fr'
                            ? (isDark ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' : 'bg-slate-200 text-slate-900')
                            : 'opacity-40 hover:opacity-100'
                        )}
                      >
                        FR
                      </button>
                    </div>
                  </div>

                  {/* Theme row */}
                  <div className={cn(
                    'flex items-center justify-between px-4 py-2 rounded-xl h-10 border',
                    isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                  )}
                  >
                    <span className="text-xs font-black tracking-wider opacity-60">{t('header_theme')}</span>
                    <ThemeToggle onToggle={() => closeMenuThen(toggleTheme)} />
                  </div>

                  {/* Logout button */}
                <Button
                  variant="danger"
                  className="w-full h-10 rounded-xl font-black tracking-widest text-[9px]"
                  onClick={() => {
                    setIsAccountMenuOpen(false);
                    onLogout && onLogout();
                  }}
                >
                  <BPLogoutIcon className="w-3.5 h-3.5 ml-1.5" />
                  {t('header_logout')}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="cta"
              onClick={onLoginClick}
              className="transition-transform duration-200 hover:scale-105 active:scale-95 rounded-xl font-bold shadow-[0_4px_20px_rgba(59,130,246,0.5)]"
            >
              <BPLoginIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
