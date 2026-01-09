import { useMemo } from 'react';
import { Calendar } from '@/components/ui/BrandIcons';
import { MatchCard } from './MatchCard';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

// Format date for display
function formatDateHeader(dateStr, language, t) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if today
  if (date.toDateString() === today.toDateString()) {
    return t('sports_date_today');
  }
  
  // Check if tomorrow
  if (date.toDateString() === tomorrow.toDateString()) {
    return t('sports_date_tomorrow');
  }
  
  // Format as day name + date
  const locale = language === 'fr' ? 'fr-FR' : 'ar-TN';
  const dayName = date.toLocaleDateString(locale, { weekday: 'long' });
  const dateFormatted = date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  return `${dayName} - ${dateFormatted}`;
}

// Get date key for grouping (YYYY-MM-DD)
function getDateKey(commenceTime) {
  const date = new Date(commenceTime);
  return date.toISOString().split('T')[0];
}


export function MatchesList({ matches = [], onOddsClick, onShowAllMarkets, isDark = true }) {
  const { t, language } = useI18n();

  // Group matches by date
  const groupedMatches = useMemo(() => {
    const groups = {};
    matches.forEach((match) => {
      const dateKey = getDateKey(match.commenceTime);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });
    
    // Sort by date and return as array of [dateKey, matches]
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
          <span className="text-4xl">⚽</span>
        </div>
        <h3 className={`font-bold text-xl tracking-tight ${isDark ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'text-slate-900'}`}>{t('sports_noMatchesTitle')}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('sports_noMatchesDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      {groupedMatches.map(([dateKey, dateMatches]) => (
        <div key={dateKey}>
          {/* Date Header */}
          <div className="sticky top-0 md:top-[120px] z-[5] mb-2">
            <div
              className={cn(
                'relative overflow-hidden rounded-xl border px-3 py-2 backdrop-blur-2xl',
                'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]',
                isDark
                  ? 'bg-slate-950/70 border-white/20 text-slate-50'
                  : 'bg-white/90 border-slate-200/90 text-slate-900'
              )}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/[0.2] opacity-100"
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Calendar className={cn('w-4 h-4 shrink-0', isDark ? 'text-slate-400' : 'text-slate-600')} />
                  <div className="text-sm font-bold tracking-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                    {formatDateHeader(dateKey, language, t)}
                  </div>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-[11px] font-semibold px-2 py-1 rounded-lg border tabular-nums backdrop-blur-xl',
                    'shadow-[0_2px_6px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]',
                    isDark
                      ? 'text-slate-200 bg-slate-950/50 border-white/15'
                      : 'text-slate-700 bg-white/90 border-slate-200/80'
                  )}
                >
                  {dateMatches.length} {t('sports_matchesLabel')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Matches for this date */}
          <div className="space-y-2">
            {dateMatches.map((match, index) => (
              <div
                key={match.id}
                className="animate-premium-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MatchCard
                  match={match}
                  onOddsClick={onOddsClick}
                  onShowAllMarkets={onShowAllMarkets}
                  isDark={isDark}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
