import { useMemo } from 'react';
import { ChevronLeft } from '@/components/ui/BrandIcons';
import { useI18n } from '@/contexts/I18nContext';
import { useBet } from '@/contexts/BetContext';
import { cn } from '@/lib/utils';

export function EventMarketsView({ match, isLive = false, onPlaceBet, onBack }) {
  const { t, isRtl } = useI18n();
  const { bets } = useBet();

  const inferredMainMarketKey =
    match?.odds?.draw && String(match.odds.draw).trim() !== '-' ? 'h2h_3_way' : 'h2h';

  const selectedOutcomeByMarketKey = useMemo(() => {
    if (!match?.id) return {};
    if (!Array.isArray(bets) || bets.length === 0) return {};

    const matchType = isLive ? 'live' : 'prematch';
    const selected = {};
    bets.forEach((b) => {
      if (String(b?.matchType) !== matchType) return;
      if (String(b?.matchId) !== String(match.id)) return;
      if (!b?.marketKey) {
        if (!selected[inferredMainMarketKey]) {
          selected[inferredMainMarketKey] = b?.betType || null;
        }
        return;
      }
      selected[String(b.marketKey)] = b?.betType || null;
    });
    return selected;
  }, [bets, inferredMainMarketKey, isLive, match?.id]);

  const handleBetClick = (marketKey, betLabel, odds) => {
    if (!onPlaceBet || !match || !odds) return;
    onPlaceBet(match, marketKey, odds, betLabel);
  };

  if (!match) return null;

  return (
    <div className="flex flex-col gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 mb-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'group relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all duration-300',
              'backdrop-blur-2xl overflow-hidden',
              'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.6)]',
              'active:translate-y-0 active:scale-[0.95]',
              'bg-slate-950/70 border-slate-800/80 text-slate-200 hover:text-white'
            )}
          >
            <ChevronLeft className="relative w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-slate-400 truncate mb-1">{match?.league}</div>
          <div className="text-lg font-bold text-white truncate tracking-tight">
            {match?.home?.name} <span className="text-slate-500 font-normal">vs</span> {match?.away?.name}
          </div>
        </div>
      </div>

      <div className={cn(
        'relative rounded-xl border overflow-y-auto backdrop-blur-2xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        'p-3 space-y-3',
        'bg-slate-950/80 border-slate-800/80'
      )}>
        {/* 1X2 Market */}
        <div className={cn(
          'relative rounded-xl border overflow-hidden backdrop-blur-xl',
          'bg-slate-900/60 border-slate-800/60'
        )}>
          <div className="px-4 py-3 border-b border-slate-800/50">
            <div className="text-sm font-bold text-slate-100">1X2</div>
          </div>
          <div className="flex divide-x divide-slate-800">
            {['home', 'draw', 'away'].map((type) => {
              const odds = match?.odds?.[type];
              if (type === 'draw' && (!odds || odds === '-')) return null;
              
              const label = type === 'home' ? '1' : type === 'away' ? '2' : 'X';
              const isSelected = selectedOutcomeByMarketKey?.[inferredMainMarketKey] === label;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => odds && odds !== '-' && handleBetClick(inferredMainMarketKey, label, odds)}
                  disabled={!odds || odds === '-'}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 px-3 transition-all duration-300',
                    'hover:bg-slate-800/70',
                    isSelected && 'bg-gradient-to-br from-rose-500/80 via-rose-400/75 to-rose-600/85 text-white',
                    (!odds || odds === '-') && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-slate-400')}>
                    {label}
                  </span>
                  <span className={cn(
                    'text-sm font-bold tabular-nums',
                    isSelected ? 'text-white' : 'text-emerald-400'
                  )}>
                    {odds || '-'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Over/Under if available */}
        {match?.total && (
          <div className={cn(
            'relative rounded-xl border overflow-hidden backdrop-blur-xl',
            'bg-slate-900/60 border-slate-800/60'
          )}>
            <div className="px-4 py-3 border-b border-slate-800/50">
              <div className="text-sm font-bold text-slate-100">{t('sports_totalGoalsFixedLabel')}</div>
            </div>
            <div className="flex divide-x divide-slate-800">
              <button
                type="button"
                onClick={() => handleBetClick('totals', t('sports_over25Label'), match.total.over)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-3 transition-all duration-300 hover:bg-slate-800/70"
              >
                <span className="text-xs font-medium text-slate-400">{t('sports_overLabel')}</span>
                <span className="text-sm font-bold tabular-nums text-emerald-400">{match.total.over}</span>
              </button>
              <button
                type="button"
                onClick={() => handleBetClick('totals', t('sports_under25Label'), match.total.under)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-3 transition-all duration-300 hover:bg-slate-800/70"
              >
                <span className="text-xs font-medium text-slate-400">{t('sports_underLabel')}</span>
                <span className="text-sm font-bold tabular-nums text-emerald-400">{match.total.under}</span>
              </button>
            </div>
          </div>
        )}

        {/* No additional markets message */}
        <div className="relative flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">{t('sports_noExtraMarkets')}</p>
        </div>
      </div>
    </div>
  );
}
