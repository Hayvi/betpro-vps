import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { sideMenuItems } from '@/constants/navigation';
import { useI18n } from '@/contexts/I18nContext';

export default function Sidebar() {
  const { isDark } = useTheme();
  const location = useLocation();
  const { t, language } = useI18n();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const locale = language === 'fr' ? 'fr-FR' : 'ar-TN';
  const formattedTime = currentTime.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getCurrentPage = () => {
    const path = location.pathname.replace('/', '');
    return path || 'home';
  };

  return (
    <aside className={cn(
      "hidden md:flex fixed top-16 start-0 bottom-0 w-64 border-e ui-trans-slow overflow-hidden ui-blur-surface",
      isDark
        ? "bg-slate-950/95 border-slate-800/80"
        : "bg-white/95 border-slate-200"
    )}>
      {/* Structural Textures: Micro-grid and Vertical Gradient */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '16px 16px'
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="flex flex-col w-full">
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {sideMenuItems.map((item) => {
            const isActive = getCurrentPage() === item.path;
            const isLive = item.badge;

            return (
              <Link
                key={item.id}
                to={createPageUrl(item.path)}
                className={cn(
                  "group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl ui-trans-slow",
                  "hover:translate-x-1.5",
                  isActive
                    ? isDark
                      ? 'bg-violet-500/10 text-violet-100 border border-violet-500/30 shadow-[0_4px_15px_rgba(139,92,246,0.15)] shadow-violet-500/20'
                      : 'bg-indigo-500/5 text-indigo-900 border border-indigo-500/20 shadow-lg'
                    : cn(
                      'border border-transparent',
                      isDark
                        ? 'text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 hover:border-slate-200/50'
                    )
                )}
              >
                {/* Active indicator bar - stylized */}
                {isActive && (
                  <div className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-e-full',
                    isDark
                      ? 'bg-gradient-to-b from-violet-400 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.6)]'
                      : 'bg-gradient-to-b from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(79,70,229,0.3)]'
                  )} />
                )}

                {/* Icon with Glass Container */}
                <div className={cn(
                  "p-2 rounded-xl ui-trans-slow relative overflow-hidden",
                  isActive
                    ? isDark ? "bg-violet-500/20 border border-violet-400/30" : "bg-indigo-500/10 border border-indigo-200"
                    : "bg-transparent group-hover:bg-white/5 border border-transparent group-hover:border-white/10"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 ui-trans-slow",
                    isActive ? "text-violet-400 scale-110" : "text-slate-400 group-hover:text-slate-200"
                  )} />
                  {isActive && <div className="absolute inset-0 bg-violet-500/20 blur-xl animate-pulse" />}
                </div>

                {/* Label */}
                <span className={cn(
                  "text-xs font-black tracking-[0.15em] transition-colors duration-300",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"
                )}>
                  {t(`nav_${item.id}`)}
                </span>

                {/* Live badge - Premium Indicator */}
                {isLive && (
                  <span className={cn(
                    "ml-auto flex items-center gap-1.5 text-[9px] px-3 py-1 rounded-full font-black",
                    "ui-trans-slow tracking-tighter",
                    isDark
                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                      : "bg-red-50 text-red-600 border border-red-200 shadow-sm"
                  )}>
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full animate-ping",
                      isDark ? "bg-red-400" : "bg-red-500"
                    )} />
                    {t('nav_liveBadge')}
                  </span>
                )}

                {/* Hover glow effect */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                  isDark
                    ? "shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]"
                    : "shadow-[inset_0_0_20px_rgba(6,182,212,0.03)]"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Time display - Pass 3 Timepiece Upgrade */}
        <div className={cn(
          "p-4 mx-4 mb-6 relative group/time",
          "rounded-2xl border ui-trans-slow",
          isDark
            ? "bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/50"
            : "bg-white/50 border-slate-200 hover:bg-white"
        )}>
          {/* Decorative Halo */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none transition-opacity group-hover/time:opacity-100 opacity-40" />

          <div className={cn(
            "text-[9px] font-black tracking-[0.2em] mb-2 relative z-10",
            isDark ? "text-violet-400/80" : "text-indigo-600/70"
          )}>
            {t('sidebar_currentTimeLabel')}
          </div>

          <div className="flex items-baseline gap-1 relative z-10">
            <div className={cn(
              "text-3xl font-black tracking-tighter tabular-nums",
              isDark
                ? "bg-gradient-to-br from-violet-200 to-indigo-300 text-transparent bg-clip-text"
                : "bg-gradient-to-br from-indigo-700 to-violet-800 text-transparent bg-clip-text"
            )}>
              {formattedTime.split(':')[0]}
              <span className="animate-pulse opacity-50 px-0.5">:</span>
              {formattedTime.split(':')[1]}
            </div>
            <div className={cn(
              "text-[10px] font-bold tracking-tight opacity-40",
              isDark ? "text-slate-400" : "text-slate-500"
            )}>
              GMT+1
            </div>
          </div>

          {/* Progress bar representing seconds (0-60) */}
          <div className="mt-3 h-1 w-full bg-slate-800/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-linear"
              style={{ width: `${(new Date().getSeconds() / 60) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
