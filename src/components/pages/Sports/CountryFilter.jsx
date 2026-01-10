import { ChevronDown, ChevronUp } from '@/components/ui/BrandIcons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function LeagueButton({ league, isSelected, isDark, onSelect }) {
  return (
    <button
      onClick={() => onSelect(league)}
      className={cn(
        'group relative w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
        'backdrop-blur-xl overflow-hidden border',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.5),0_0_0_1px_rgba(255,255,255,0.05)]',
        'active:translate-y-0 active:scale-[0.98]',
        'ring-1 ring-white/5 hover:ring-white/15',
        'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.06] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
        isSelected
          ? 'bg-gradient-to-br from-emerald-600/25 via-emerald-500/15 to-emerald-700/25 border-emerald-400/40 text-emerald-300 ring-emerald-400/20 shadow-[0_4px_16px_rgba(16,185,129,0.2)]'
          : isDark
            ? 'bg-slate-950/60 border-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-900/70 hover:border-slate-700/80'
            : 'bg-white/80 border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 hover:border-slate-300/80'
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/[0.1] opacity-100"
      />
      <div className="relative flex items-center gap-3 min-w-0">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 flex items-center justify-center overflow-hidden ring-1 ring-cyan-500/20">
          <span className="text-xs">{league.icon || '🏆'}</span>
        </div>
        <span className={cn('font-medium truncate tracking-tight', isSelected ? 'font-semibold' : '')}>
          {league.name}
        </span>
      </div>
      <Badge 
        variant="secondary" 
        className={cn(
          'relative shrink-0 text-xs font-semibold tabular-nums backdrop-blur-xl border',
          'shadow-[0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]',
          isSelected
            ? 'bg-emerald-950/50 border-emerald-300/25 text-emerald-200'
            : isDark
              ? 'bg-slate-950/50 border-white/10 text-slate-300'
              : 'bg-white/80 border-slate-200/60 text-slate-600'
        )}
      >
        {league.count}
      </Badge>
    </button>
  );
}


export function CountryFilter({
  countries = [],
  expandedCountry = null,
  onCountryToggle,
  selectedLeague = null,
  onLeagueSelect,
  isDark = true,
}) {
  return (
    <div className={cn(
      "hidden md:block w-72 p-5 sticky top-[120px] h-[calc(100vh-120px)] overflow-y-auto transition-colors duration-500 border-l backdrop-blur-2xl shadow-[0_18px_45px_rgba(15,23,42,0.75)]",
      isDark ? "bg-slate-950/80 border-slate-800/80" : "bg-white/80 border-slate-200/80"
    )}>
      <div className="space-y-3">
        {countries.map((country, index) => (
          <div 
            key={country.id}
            className="animate-premium-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Country Button */}
            <button
              onClick={() => onCountryToggle(country.id)}
              className={cn(
                'group relative w-full flex items-center justify-between p-4 rounded-xl transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
                'backdrop-blur-xl overflow-hidden border',
                'hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.6),0_4px_16px_rgba(16,185,129,0.1),0_0_0_1px_rgba(255,255,255,0.05)]',
                'active:translate-y-0 active:scale-[0.98]',
                'ring-1 ring-white/10 hover:ring-white/20',
                'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.06] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
                expandedCountry === country.id
                  ? isDark 
                    ? 'bg-slate-900/80 border-slate-700/80 ring-emerald-400/20 shadow-[0_4px_16px_rgba(16,185,129,0.15)]' 
                    : 'bg-slate-100/90 border-slate-300/80 ring-emerald-400/20 shadow-[0_4px_16px_rgba(16,185,129,0.15)]'
                  : isDark 
                    ? 'bg-slate-950/70 border-slate-800/70 hover:bg-slate-900/80 hover:border-slate-700/80' 
                    : 'bg-white/80 border-slate-200/70 hover:bg-slate-50/90 hover:border-slate-300/80'
              )}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/[0.15] opacity-100"
              />
              <div className="relative flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center ring-1 ring-cyan-500/30">
                  <span className="text-xl">{country.flag}</span>
                </div>
                <span className={cn("font-semibold tracking-tight", isDark ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : "text-slate-900")}>
                  {country.name}
                </span>
              </div>
              <div className="relative flex items-center gap-3">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'font-semibold tabular-nums backdrop-blur-xl border',
                    'shadow-[0_2px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]',
                    isDark 
                      ? 'bg-slate-950/60 border-white/15 text-slate-200' 
                      : 'bg-white/90 border-slate-200/80 text-slate-700'
                  )}
                >
                  {country.count}
                </Badge>
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-300',
                  expandedCountry === country.id ? 'rotate-180' : 'rotate-0',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </button>

            {/* Leagues List */}
            {expandedCountry === country.id && (
              <div className="overflow-hidden transition-all duration-500 ease-out">
                <div className="mt-3 space-y-2 pl-2">
                  {country.leagues.map((league, index) => (
                    <div
                      key={league.id}
                      className="animate-premium-slide-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <LeagueButton
                        league={league}
                        isSelected={selectedLeague === league.id}
                        isDark={isDark}
                        onSelect={onLeagueSelect}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
