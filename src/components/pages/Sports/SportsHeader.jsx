import { cn } from '@/lib/utils';


export function SportsHeader({
  sportGroups = [],
  selectedSportGroup = null,
  onSportGroupSelect,
  isDark = true,
}) {
  return (
    <div className={cn(
      'hidden md:block',
      "sticky top-0 z-10 px-4 py-3 transition-all duration-500 border-b backdrop-blur-2xl shadow-[0_18px_45px_rgba(15,23,42,0.75)]",
      isDark ? "bg-slate-950/80 border-slate-800/80" : "bg-white/80 border-slate-200/80"
    )}>
      {/* Sport Groups Filter */}
      {Array.isArray(sportGroups) && sportGroups.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {sportGroups.map((groupName, index) => {
            const isActive = selectedSportGroup === groupName;
            return (
              <button
                key={groupName}
                type="button"
                onClick={() => onSportGroupSelect && onSportGroupSelect(groupName)}
                className={cn(
                  'group relative px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
                  'backdrop-blur-xl overflow-hidden animate-premium-slide-in',
                  'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.5),0_0_0_1px_rgba(255,255,255,0.05)]',
                  'active:translate-y-0 active:scale-[0.98]',
                  'ring-1 ring-white/5 hover:ring-white/15',
                  'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.06] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
                  isActive
                    ? 'bg-gradient-to-br from-emerald-600/30 via-emerald-500/20 to-emerald-700/30 border-emerald-400/50 text-emerald-200 ring-emerald-400/30 shadow-[0_4px_16px_rgba(16,185,129,0.25)]'
                    : isDark
                      ? 'bg-slate-950/70 border-slate-800/70 text-slate-200 hover:bg-slate-900/80 hover:border-slate-700/80 hover:text-white'
                      : 'bg-white/90 border-slate-200/70 text-slate-700 hover:bg-slate-50/90 hover:border-slate-300/80 hover:text-slate-900'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/[0.1] opacity-100"
                />
                <span className="relative tracking-tight">
                  {groupName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
