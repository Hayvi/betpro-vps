import { useMemo } from 'react';
import { ChevronLeft, Clock } from '@/components/ui/BrandIcons';
import { useI18n } from '@/contexts/I18nContext';
import { useBet } from '@/contexts/BetContext';
import { cn } from '@/lib/utils';

export function EventMarketsViewCompact({ match, isLive = false, onPlaceBet, onBack }) {
    const { t, isRtl } = useI18n();
    const { bets } = useBet();

    const inferredMainMarketKey =
        match?.odds?.draw && String(match.odds.draw).trim() !== '-' ? 'h2h_3_way' : 'h2h';

    // Track selected bets
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

    // Render basic 1X2 market from match odds
    const render1X2Market = () => {
        const homeOdds = match?.odds?.home;
        const drawOdds = match?.odds?.draw;
        const awayOdds = match?.odds?.away;

        const renderOutcome = (odds, label, betLabel) => {
            if (!odds || odds === '-') return <div className="flex-1 text-center text-slate-600 py-3">-</div>;
            const isSelected = selectedOutcomeByMarketKey?.[inferredMainMarketKey] === betLabel;

            return (
                <button
                    type="button"
                    onClick={() => handleBetClick(inferredMainMarketKey, betLabel, odds)}
                    className={cn(
                        'group relative flex-1 flex items-center justify-center gap-2 py-3 px-3 transition-all duration-300',
                        'backdrop-blur-xl overflow-hidden',
                        'hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.4)]',
                        'active:translate-y-0 active:scale-[0.98]',
                        isSelected 
                            ? 'bg-gradient-to-br from-rose-500/80 via-rose-400/75 to-rose-600/85 border border-rose-300/60 text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4)] rounded-lg'
                            : 'hover:bg-slate-800/70 hover:rounded-lg'
                    )}
                >
                    <span className={cn('relative text-xs font-medium', isSelected ? 'text-white' : 'text-slate-400')}>
                        {label}
                    </span>
                    <span className={cn(
                        'relative text-sm font-bold tabular-nums',
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
        <div className="flex flex-col gap-3" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
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
                    <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-medium text-slate-400 truncate">{match?.league}</div>
                        {match?.isLive && match?.minute && (
                            <span
                                className={cn(
                                    'text-[11px] font-bold px-2 py-0.5 rounded-lg border backdrop-blur-xl animate-pulse',
                                    'bg-gradient-to-r from-red-600/30 via-red-500/25 to-red-700/30',
                                    'border-red-400/50 text-red-200 flex items-center gap-1'
                                )}
                            >
                                <Clock className="w-3 h-3" />
                                {typeof match.minute === 'number' ? `${match.minute}'` : match.minute}
                            </span>
                        )}
                        {match?.isLive && (
                            <span
                                className={cn(
                                    'text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xl animate-pulse',
                                    'bg-red-600/90 text-white border border-red-400/50'
                                )}
                            >
                                LIVE
                            </span>
                        )}
                    </div>
                    {match?.isLive && (match?.home?.score !== null && match?.home?.score !== undefined) && (match?.away?.score !== null && match?.away?.score !== undefined) ? (
                        <div className="flex items-center gap-3">
                            <div className="flex-1 flex items-center gap-2 min-w-0">
                                <span className="text-base font-bold text-white truncate tracking-tight">
                                    {match?.home?.name}
                                </span>
                                <span className="text-xl font-bold tabular-nums text-emerald-400">
                                    {match.home.score}
                                </span>
                            </div>
                            <span className="text-slate-500 font-bold text-lg">-</span>
                            <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                                <span className="text-xl font-bold tabular-nums text-emerald-400">
                                    {match.away.score}
                                </span>
                                <span className="text-base font-bold text-white truncate tracking-tight">
                                    {match?.away?.name}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-lg font-bold text-white truncate tracking-tight">
                            {match?.home?.name} <span className="text-slate-500 font-normal">vs</span> {match?.away?.name}
                        </div>
                    )}
                </div>
            </div>

            {/* Match Info Card */}
            <div className={cn(
                'relative rounded-xl border overflow-hidden backdrop-blur-2xl',
                'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
                'bg-slate-950/70 border-slate-800/80'
            )}>
                {/* Date/Time */}
                {!match?.isLive && match?.date && (
                    <div className="px-4 py-2 border-b border-slate-800/50 text-xs text-slate-400">
                        {match.date} {match.time && `• ${match.time}`}
                    </div>
                )}

                {/* 1X2 Market */}
                <div className="p-3">
                    <div className="text-xs font-medium text-slate-400 mb-2">
                        {t('sports_col_marketsHeader')} - 1X2
                    </div>
                    <div className={cn(
                        'rounded-lg border overflow-hidden',
                        'bg-slate-900/60 border-slate-800/60'
                    )}>
                        {render1X2Market()}
                    </div>
                </div>

                {/* Over/Under if available */}
                {match?.total && (
                    <div className="px-3 pb-3">
                        <div className="text-xs font-medium text-slate-400 mb-2">
                            {t('sports_totalGoalsFixedLabel')}
                        </div>
                        <div className={cn(
                            'rounded-lg border overflow-hidden',
                            'bg-slate-900/60 border-slate-800/60'
                        )}>
                            <div className="flex divide-x divide-slate-800">
                                <button
                                    type="button"
                                    onClick={() => handleBetClick('totals', t('sports_over25Label'), match.total.over)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-3 px-3 transition-all duration-300',
                                        'hover:bg-slate-800/70'
                                    )}
                                >
                                    <span className="text-xs font-medium text-slate-400">{t('sports_overLabel')}</span>
                                    <span className="text-sm font-bold tabular-nums text-emerald-400">{match.total.over}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleBetClick('totals', t('sports_under25Label'), match.total.under)}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 py-3 px-3 transition-all duration-300',
                                        'hover:bg-slate-800/70'
                                    )}
                                >
                                    <span className="text-xs font-medium text-slate-400">{t('sports_underLabel')}</span>
                                    <span className="text-sm font-bold tabular-nums text-emerald-400">{match.total.under}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* No markets message */}
                <div className="px-4 py-3 text-center text-sm text-slate-500 border-t border-slate-800/50">
                    {t('sports_noExtraMarkets')}
                </div>
            </div>
        </div>
    );
}
