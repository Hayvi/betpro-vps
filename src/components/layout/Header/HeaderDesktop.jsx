import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { BPCoinIcon, BPLoginIcon, BPLogoutIcon } from '@/components/ui/BrandIcons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useScroll } from '@/hooks/useScroll';
import { useI18n } from '@/contexts/I18nContext';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';


export function HeaderDesktop({
  userBalance = 0,
  onLoginClick,
  isAuthenticated = false,
  dashboardPath = '/dashboard/user',
  onLogout,
}) {
  const { isDark } = useTheme();
  const isScrolled = useScroll();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const { t, language, setLanguage, isRtl } = useI18n();
  const animatedBalance = useAnimatedNumber(userBalance);

  return (
    <header dir={isRtl ? 'rtl' : 'ltr'} className={cn(
      'hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 ui-trans-slow ui-blur-surface',
      isDark
        ? 'bg-slate-950/90 border-b border-slate-800/80'
        : 'bg-white/90 border-b border-slate-200',
      isScrolled && (
        isDark
          ? 'shadow-[0_10px_40px_rgba(15,23,42,0.9)]'
          : 'shadow-[0_10px_40px_rgba(15,23,42,0.15)]'
      ),
      isDark ? 'text-white' : 'text-slate-900'
    )}>
      <div className={cn(
        'flex items-center justify-between w-full',
        isRtl ? 'pr-0 pl-4 lg:pl-6' : 'pl-0 pr-4 lg:pr-6'
      )}>
        {/* Left: Logo + Wallet */}
        <div className="flex items-center gap-3">
          {/* Logo - Pass 3 Upgrade */}
          <Link to={createPageUrl('home')} className="flex items-center gap-4 group">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {/* Outer Glow/Halo */}
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Custom SVG Brand Mark */}
              <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-transform duration-500 group-hover:scale-110">
                <defs>
                  <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
                  <filter id="innerGlow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset dx="0" dy="0" result="offset" />
                    <feComposite in="SourceGraphic" in2="offset" operator="over" />
                  </filter>
                </defs>
                {/* Stylized 'B' shape with depth */}
                <path
                  d="M25,20 H55 C75,20 75,45 55,45 H25 V20 M25,45 H60 C80,45 80,80 60,80 H25 V45"
                  fill="none"
                  stroke="url(#logoGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-20 animate-spin-slow" />
              </svg>
            </div>

            <div className="flex flex-col leading-tight pt-1">
              <span className={cn(
                'text-2xl font-black tracking-tighter uppercase',
                isDark
                  ? 'bg-gradient-to-br from-violet-300 via-indigo-200 to-fuchsia-300 text-transparent bg-clip-text'
                  : 'bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-transparent bg-clip-text'
              )}>
                BET<span className="text-accent underline decoration-accent/40 decoration-4 underline-offset-4">.</span>PRO
              </span>
              <span className={cn(
                'text-[9px] font-black tracking-[0.2em] opacity-60',
                isDark ? 'text-violet-400' : 'text-indigo-600'
              )}>{t('header_tagline')}</span>
            </div>
          </Link>

          {isAuthenticated && (
            <>
              <div className={cn('h-7 w-px mx-1', isDark ? 'bg-slate-700/60' : 'bg-slate-200')} />
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full border ui-trans-fast animate-slide-in select-none',
                  isDark
                    ? 'bg-slate-900/40 border-slate-700/60 text-slate-100'
                    : 'bg-white/70 border-slate-200 text-slate-900'
                )}
              >
                <span className={cn(
                  'text-xs font-bold opacity-90',
                  isDark ? 'text-slate-200' : 'text-slate-700'
                )}>
                  {t('header_wallet')}
                </span>
                <span className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black',
                  isDark
                    ? 'bg-amber-400/10 text-amber-100 border border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                )}>
                  <BPCoinIcon className="w-3 h-3 text-amber-500" />
                  <span>{Number(animatedBalance || 0).toFixed(2)} {t('wallet_currencyCode')}</span>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <div className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-full border backdrop-blur-xl',
                isDark
                  ? 'bg-slate-900/50 border-slate-700/60'
                  : 'bg-white/70 border-slate-200/80'
              )}>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Theme Toggle */}
                <ThemeToggle />

                <div className="flex items-center gap-1 rounded-full px-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={cn(
                      'px-1.5 py-0.5 rounded-full transition-colors',
                      language === 'ar'
                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                    )}
                  >
                    AR
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={cn(
                      'px-1.5 py-0.5 rounded-full transition-colors',
                      language === 'fr'
                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                    )}
                  >
                    FR
                  </button>
                </div>
              </div>

              {/* Go to Dashboard */}
              <Button
                asChild={!isDashboard}
                onClick={isDashboard ? (e) => e.preventDefault() : undefined}
                variant="primary"
                size="md"
                className={cn(
                  'transition-all duration-500 rounded-xl font-black tracking-widest text-[10px]',
                  isDashboard
                    ? 'bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-default'
                    : 'hover:scale-105 shadow-lg'
                )}
              >
                {isDashboard ? (
                  <span>{t('header_dashboard')}</span>
                ) : (
                  <Link to={dashboardPath}>{t('header_dashboard')}</Link>
                )}
              </Button>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="md"
                onClick={onLogout}
                className={cn(
                  'transition-all duration-500 hover:scale-105 rounded-xl font-bold border',
                  isDark
                    ? 'bg-transparent border-slate-600 text-slate-100 hover:bg-white/10'
                    : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                )}
              >
                <BPLogoutIcon className="w-4 h-4 ml-2" />
                {t('header_logout')}
              </Button>

            </>
          ) : (
            <>
              {/* Login Button */}
              <Button
                onClick={onLoginClick}
                variant="cta"
                size="md"
                className="transition-all duration-500 hover:scale-105 rounded-xl font-bold shadow-lg"
              >
                <BPLoginIcon className="w-4 h-4 ml-2" />
                {t('header_login')}
              </Button>

              <div className={cn(
                'flex items-center gap-2 px-2 py-1 rounded-full border backdrop-blur-xl',
                isDark
                  ? 'bg-slate-900/50 border-slate-700/60'
                  : 'bg-white/70 border-slate-200/80'
              )}>
                {/* Theme Toggle */}
                <ThemeToggle />
                <div className="flex items-center gap-1 rounded-full px-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLanguage('ar')}
                    className={cn(
                      'px-1.5 py-0.5 rounded-full transition-colors',
                      language === 'ar'
                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                    )}
                  >
                    AR
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('fr')}
                    className={cn(
                      'px-1.5 py-0.5 rounded-full transition-colors',
                      language === 'fr'
                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900')
                        : (isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                    )}
                  >
                    FR
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
