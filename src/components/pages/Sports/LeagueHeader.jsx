import { Star } from '@/components/ui/BrandIcons';
import { cn } from '@/lib/utils';

/**
 * LeagueHeader Component
 * Displays league name and date header
 * 
 * @param {Object} props
 * @param {string} props.leagueName - Name of the league
 * @param {boolean} props.isDark - Whether dark theme is active
 */
export function LeagueHeader({ leagueName = '', isDark = true }) {
  if (!leagueName) return null;

  return (
    <div className={cn(
      "relative flex items-center gap-4 mb-6 pb-5 border-b transition-all duration-500 animate-premium-slide-in",
      "backdrop-blur-xl overflow-hidden rounded-xl p-4 -mx-4",
      "shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]",
      "ring-1 ring-white/10",
      isDark 
        ? "border-slate-800/80 bg-slate-950/40" 
        : "border-slate-300/80 bg-white/40"
    )}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/[0.15] opacity-100"
      />
      <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center overflow-hidden ring-2 ring-cyan-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
        <Star className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
      </div>
      <div className="relative flex-1 min-w-0">
        <h2 className={cn(
          "text-lg font-bold tracking-tight truncate mb-1",
          isDark ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" : "text-slate-900"
        )}>
          {leagueName}
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse"></div>
          <p className={cn(
            "text-sm font-medium",
            isDark ? "text-slate-300" : "text-slate-600"
          )}>
            {new Date().toLocaleDateString('ar-TN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
