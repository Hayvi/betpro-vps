import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BPCasinoIcon, BPChevronRightIcon, BPLiveIcon, BPSportsIcon } from '@/components/ui/BrandIcons';

// Direct mapping by category id for reliability
const categoryIcons = {
  sport: BPSportsIcon,
  live: BPLiveIcon,
  casino: BPCasinoIcon,
};

export function CategoryCards({ categories = [] }) {
  const location = useLocation();
  const { t } = useI18n();
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-5 px-4 mt-6">
      {categories.map((cat) => {
        const targetPath = createPageUrl(cat.link.slice(1));
        const isActive = location.pathname === targetPath || location.pathname.startsWith(targetPath);
        const IconComponent = categoryIcons[cat.id] || BPSportsIcon;

        return (
          <Link
            key={cat.id}
            to={targetPath}
            className="group focus:outline-none"
          >
            <div
              className={cn(
                "relative h-32 md:h-44 rounded-2xl overflow-hidden transition-all duration-300",
                "group-hover:-translate-y-1 group-hover:scale-[1.02] active:scale-95",
                isDark
                  ? "bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-950 border border-slate-700/50"
                  : "bg-gradient-to-br from-white via-slate-50 to-slate-100 border border-slate-200/80",
                isActive && "ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-950"
              )}
            >
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                "bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10"
              )} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
                <div className={cn(
                  "relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl mb-2 md:mb-3 transition-all duration-300",
                  "bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30",
                  "group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]",
                  isActive && "shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                )}>
                  {cat.isLive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  )}
                  <IconComponent className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 transition-all duration-300",
                    isDark ? "text-cyan-400" : "text-cyan-600",
                    "group-hover:text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                  )} />
                </div>
                <span className={cn(
                  "font-bold text-xs md:text-base tracking-wide transition-colors",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  {cat.titleKey ? t(cat.titleKey) : ''}
                </span>
                <span className={cn(
                  "text-[9px] md:text-xs mt-0.5 uppercase tracking-wider",
                  isDark ? "text-cyan-400/70" : "text-cyan-600/70"
                )}>
                  {cat.subtitleKey ? t(cat.subtitleKey) : ''}
                </span>
                <div className="mt-2 md:mt-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span className={cn(
                    "text-[9px] md:text-[10px] font-medium",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}>
                    {t('home_category_explore')}
                  </span>
                  <BPChevronRightIcon className="w-3 h-3 text-cyan-400" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
