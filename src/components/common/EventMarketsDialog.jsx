import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/contexts/I18nContext';
import { useBet } from '@/contexts/BetContext';
import { cn } from '@/lib/utils';

export function EventMarketsDialog({ open, onOpenChange, match, isLive = false, onPlaceBet }) {
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

  const handleOpenChange = (value) => {
    if (!value && onOpenChange) {
      onOpenChange(false);
    } else if (onOpenChange) {
      onOpenChange(true);
    }
  };

  const handleBetClick = (marketKey, betLabel, odds) => {
    if (!onPlaceBet || !match || !odds) return;
    onPlaceBet(match, marketKey, odds, betLabel);
  };

  // Render basic 1X2 market from match odds
  const render1X2Market = () => {
    const homeOdds = match?.odds?.home;
    const drawOdds = match?.odds?.draw;
    const awayOdds = match?.odds?.away;

    const renderOutcome = (odds, label, betLabel) => {
      if (!odds || odds === '-') return null;
      const isSelected = selectedOutcomeByMarketKey?.[inferredMainMarketKey] === betLabel;

      return (
        <button
          key={betLabel}
          type="button"
          onClick={() => handleBetClick(inferredMainMarketKey, betLabel, odds)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 px-3 ui-trans-fast',
            'hover:bg-slate-800/70',
            isSelected && 'bg-gradient-to-br from-rose-500/80 via-rose-400/75 to-rose-600/85 text-white rounded-lg'
          )}
        >
          <span className={cn('text-xs font-medium', isSelected ? 'text-white' : 'text-slate-400')}>
            {label}
          </span>
          <span className={cn(
            'text-sm font-bold tabular-nums',
            isSelected ? 'text-white' : 'text-emerald-400'
          )}>
            {odds}
          </span>
        </button>
      );
    };

    return (
      <div className="flex divide-x divide-slate-800">
        {renderOutcome(homeOdds, '1', '1')}
        {drawOdds && drawOdds !== '-' && renderOutcome(drawOdds, 'X', 'X')}
        {renderOutcome(awayOdds, '2', '2')}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg w-full overflow-hidden flex flex-col border-0 ui-blur-overlay',
          'bg-slate-900/95 shadow-2xl'
        )}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1 text-left">
            <span className="text-sm text-slate-400">
              {match?.league}
            </span>
            <span className="text-lg font-semibold text-white">
              {match?.home?.name}
              <span className="text-slate-500 mx-2">vs</span>
              {match?.away?.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          {/* 1X2 Market */}
          <div className={cn(
            'relative rounded-xl border overflow-hidden ui-blur-lite',
            'bg-slate-900/60 border-slate-800/60'
          )}>
            <div className="px-4 py-3 border-b border-slate-800/50">
              <div className="text-sm font-bold text-slate-100">1X2</div>
            </div>
            {render1X2Market()}
          </div>

          {/* Over/Under if available */}
          {match?.total && (
            <div className={cn(
              'relative rounded-xl border overflow-hidden ui-blur-lite',
              'bg-slate-900/60 border-slate-800/60'
            )}>
              <div className="px-4 py-3 border-b border-slate-800/50">
                <div className="text-sm font-bold text-slate-100">{t('sports_totalGoalsFixedLabel')}</div>
              </div>
              <div className="flex divide-x divide-slate-800">
                <button
                  type="button"
                  onClick={() => handleBetClick('totals', t('sports_over25Label'), match.total.over)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 ui-trans-fast hover:bg-slate-800/70"
                >
                  <span className="text-xs font-medium text-slate-400">{t('sports_overLabel')}</span>
                  <span className="text-sm font-bold tabular-nums text-emerald-400">{match.total.over}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBetClick('totals', t('sports_under25Label'), match.total.under)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-3 ui-trans-fast hover:bg-slate-800/70"
                >
                  <span className="text-xs font-medium text-slate-400">{t('sports_underLabel')}</span>
                  <span className="text-sm font-bold tabular-nums text-emerald-400">{match.total.under}</span>
                </button>
              </div>
            </div>
          )}

          {/* No additional markets message */}
          <div className="relative flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm text-slate-400 font-medium">{t('sports_noExtraMarkets')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
