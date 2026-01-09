import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, MoreHorizontal, Clock } from '@/components/ui/BrandIcons';
import { StyledButton } from '@/components/ui/StyledButton';
import { StyledCard } from '@/components/ui/StyledCard';
import { cn } from '@/lib/utils';
import { useMatchLogos } from '@/hooks/useTeamLogo';
import { invalidateCachedLogo } from '@/services/teamLogoService';
import { useBet } from '@/contexts/BetContext';

function buildCountdownParts(commenceTime, nowTs) {
  if (!commenceTime) return null;
  const commenceTs = new Date(commenceTime).getTime();
  if (!Number.isFinite(commenceTs)) return null;
  const diff = commenceTs - nowTs;
  const clamped = Math.max(0, diff);

  const totalSeconds = Math.floor(clamped / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return {
    isStarted: diff <= 0,
    days,
    hours,
    minutes,
  };
}

function formatCountdown(countdownParts) {
  if (!countdownParts || countdownParts.isStarted) return null;
  
  if (countdownParts.days > 0) {
    return `${countdownParts.days}d ${countdownParts.hours}h`;
  } else if (countdownParts.hours > 0) {
    return `${countdownParts.hours}h ${countdownParts.minutes}m`;
  } else if (countdownParts.minutes > 0) {
    return `${countdownParts.minutes}m`;
  }
  return null;
}

function TeamLogo({ logo, teamName, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [logo, teamName]);

  if (!logo || failed) {
    return (
      <div
        className={cn(
          sizeClass,
          'rounded-full bg-slate-800/60 ring-1 ring-white/10 flex items-center justify-center text-xs font-semibold text-slate-300'
        )}
      >
        {teamName?.charAt(0) || '?'}
      </div>
    );
  }

  return (
    <img
      src={logo}
      alt={teamName}
      className={cn(sizeClass, 'rounded-full object-contain bg-white/10')}
      onError={(e) => {
        invalidateCachedLogo(teamName);
        setFailed(true);
      }}
    />
  );
}

export function MatchCard({ match, onOddsClick, onShowAllMarkets, isDark = true }) {
  const { bets } = useBet();
  const sportKey = match?.sportKey;
  const logosEnabled =
    typeof sportKey !== 'string'
      ? true
      : sportKey === 'soccer'
      || sportKey.startsWith('soccer_')
      || sportKey === 'basketball_nba';
  const { homeLogo, awayLogo } = useMatchLogos(match?.home?.name, match?.away?.name, { enabled: logosEnabled });

  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    if (!match?.commenceTime) return;
    const id = setInterval(() => setNowTs(Date.now()), 60000); // Update every minute
    return () => clearInterval(id);
  }, [match?.commenceTime]);

  const countdownParts = useMemo(() => buildCountdownParts(match?.commenceTime, nowTs), [match?.commenceTime, nowTs]);
  const countdownText = useMemo(() => formatCountdown(countdownParts), [countdownParts]);

  if (!match) return null;

  const isValidOdd = (value) => {
    if (value === null || value === undefined) return false;
    const str = String(value).trim();
    if (!str || str === '-') return false;
    const num = Number(str);
    return Number.isFinite(num) && num > 0;
  };

  const toOddNumber = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const str = String(value).trim().replace(',', '.');
    const parsed = Number(str);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const selectedBetType = useMemo(() => {
    if (!match?.id) return null;
    if (!Array.isArray(bets) || bets.length === 0) return null;

    const mainMarketKey =
      match?.odds?.draw && String(match.odds.draw).trim() !== '-' ? 'h2h_3_way' : 'h2h';

    const matchTypeFilter = match?.isLive ? 'live' : 'prematch';

    const exact = bets.find(
      (b) =>
        String(b?.matchType) === matchTypeFilter &&
        String(b?.matchId) === String(match.id) &&
        String(b?.marketKey || '') === String(mainMarketKey)
    );

    if (exact?.betType) return exact.betType;

    const legacy = bets.find(
      (b) =>
        String(b?.matchType) === matchTypeFilter &&
        String(b?.matchId) === String(match.id) &&
        !b?.marketKey
    );

    return legacy?.betType || null;
  }, [bets, match?.id, match?.odds?.draw]);

  const baseOddsButtonClass = cn(
    'min-w-[64px] h-9 md:h-10 px-3 rounded-xl',
    'font-bold tabular-nums tracking-tighter text-sm',
    'ui-trans-pop',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'hover:scale-105 active:scale-[0.98]',
    'drop-shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]',
    'ui-blur-lite'
  );

  return (
    <StyledCard
      role="button"
      tabIndex={0}
      onClick={() => {
        if (onShowAllMarkets) {
          onShowAllMarkets(match);
        }
      }}
      className={cn(
        'group relative overflow-hidden cursor-pointer',
        'ui-trans-pop',
        'ui-blur-surface',
        'hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(15,23,42,0.85),0_8px_32px_rgba(16,185,129,0.15),0_0_0_1px_rgba(255,255,255,0.05),inset_0_1px_0_0_rgba(255,255,255,0.1)]',
        'active:translate-y-0 active:shadow-[0_15px_35px_rgba(15,23,42,0.7)] active:scale-[0.98]',
        'ring-1 ring-white/10 hover:ring-white/20 hover:ring-amber-400/20',
        'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
        'after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-t after:from-black/20 after:via-transparent after:to-transparent after:pointer-events-none'
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-black/[0.3] opacity-100"
      />

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3 relative">
          <div className="flex items-center gap-2">
            {match.isLive && match.minute ? (
              <span
                className={cn(
                  'text-[11px] font-bold px-2 py-1 rounded-lg border backdrop-blur-xl animate-pulse',
                  'shadow-[0_2px_12px_rgba(244,63,94,0.3),0_0_0_1px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
                  'bg-gradient-to-r from-red-600/30 via-red-500/25 to-red-700/30',
                  'border-red-400/50 text-red-200 flex items-center gap-1'
                )}
              >
                <Clock className="w-3 h-3" />
                {typeof match.minute === 'number' ? `${match.minute}'` : match.minute}
              </span>
            ) : (
              <span
                className={cn(
                  'text-[11px] font-semibold px-2 py-1 rounded-lg border backdrop-blur-xl',
                  'shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]',
                  isDark
                    ? 'text-slate-200 bg-slate-950/60 border-white/15'
                    : 'text-slate-700 bg-white/80 border-slate-200/80'
                )}
              >
                {match.time}
              </span>
            )}
            {!match.isLive && countdownText && (
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xl',
                  'shadow-[0_2px_12px_rgba(217,119,6,0.3),0_0_0_1px_rgba(217,119,6,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
                  'bg-gradient-to-br from-amber-500/20 via-amber-400/15 to-amber-600/20',
                  isDark
                    ? 'text-amber-300 border border-amber-400/40'
                    : 'text-amber-700 border border-amber-500/50'
                )}
              >
                {countdownText}
              </span>
            )}
            {match.isLive && (
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-xl animate-pulse',
                  'bg-red-600/90 text-white border border-red-400/50',
                  'shadow-[0_2px_8px_rgba(220,38,38,0.4)]'
                )}
              >
                LIVE
              </span>
            )}
          </div>
          {onShowAllMarkets && (
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
              <span className={cn('text-[10px] font-medium', isDark ? 'text-amber-400/80 group-hover:text-amber-300' : 'text-amber-600/80 group-hover:text-amber-700')}>
                View
              </span>
              <ChevronRight className={cn('w-3 h-3 transition-colors', isDark ? 'text-amber-400/80 group-hover:text-amber-300' : 'text-amber-600/80 group-hover:text-amber-700')} />
            </div>
          )}
        </div>
        {match.league && (
          <div className="mb-2 relative">
            <span
              className={cn(
                'text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xl',
                'shadow-[0_2px_8px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]',
                'bg-gradient-to-br from-slate-800/70 via-slate-900/60 to-slate-800/70',
                isDark
                  ? 'text-slate-200 border border-white/10'
                  : 'text-slate-800 bg-slate-100/95 border border-slate-300/60'
              )}
            >
              {match.league}
            </span>
          </div>
        )}
        <div className="space-y-2.5 relative">
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo logo={homeLogo} teamName={match.home.name} />
              <span className={cn('font-bold text-sm truncate tracking-tight', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
                {match.home.name}
              </span>
              {match.isLive && match.home.score !== null && match.home.score !== undefined && (
                <span className={cn('text-lg font-bold tabular-nums', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                  {match.home.score}
                </span>
              )}
            </div>
            <StyledButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOddsClick(match, 'home', match.odds.home, '1');
              }}
              disabled={!isValidOdd(match.odds.home)}
              aria-pressed={selectedBetType === '1'}
              className={cn(
                baseOddsButtonClass,
                selectedBetType === '1'
                  ? '!bg-gradient-to-br !from-rose-500/80 !via-rose-400/75 !to-rose-600/85 !border-rose-300/60 !text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4),0_0_0_1px_rgba(251,113,133,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : '!bg-slate-950/60 !border-white/20 text-emerald-200 hover:!bg-slate-900/70 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:border-emerald-400/30',
                selectedBetType === '1'
                  ? 'hover:!bg-gradient-to-br hover:!from-rose-500/85 hover:!via-rose-400/80 hover:!to-rose-600/90 hover:shadow-[0_6px_24px_rgba(251,113,133,0.5)]'
                  : 'hover:!bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30'
              )}
            >
              {match.odds.home}
            </StyledButton>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <TeamLogo logo={awayLogo} teamName={match.away.name} />
              <span className={cn('font-bold text-sm truncate tracking-tight', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
                {match.away.name}
              </span>
              {match.isLive && match.away.score !== null && match.away.score !== undefined && (
                <span className={cn('text-lg font-bold tabular-nums', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                  {match.away.score}
                </span>
              )}
            </div>
            <StyledButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOddsClick(match, 'away', match.odds.away, '2');
              }}
              disabled={!isValidOdd(match.odds.away)}
              aria-pressed={selectedBetType === '2'}
              className={cn(
                baseOddsButtonClass,
                selectedBetType === '2'
                  ? '!bg-gradient-to-br !from-rose-500/80 !via-rose-400/75 !to-rose-600/85 !border-rose-300/60 !text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4),0_0_0_1px_rgba(251,113,133,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : '!bg-slate-950/60 !border-white/20 text-emerald-200 hover:!bg-slate-900/70 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:border-emerald-400/30',
                selectedBetType === '2'
                  ? 'hover:!bg-gradient-to-br hover:!from-rose-500/85 hover:!via-rose-400/80 hover:!to-rose-600/90 hover:shadow-[0_6px_24px_rgba(251,113,133,0.5)]'
                  : 'hover:!bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30'
              )}
            >
              {match.odds.away}
            </StyledButton>
          </div>
        </div>

        {/* Draw Button */}
        {isValidOdd(match.odds.draw) && (
          <div className="flex justify-center mt-3 relative">
            <StyledButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOddsClick(match, 'draw', match.odds.draw, 'X');
              }}
              disabled={!isValidOdd(match.odds.draw)}
              aria-pressed={selectedBetType === 'X'}
              className={cn(
                baseOddsButtonClass,
                selectedBetType === 'X'
                  ? '!bg-gradient-to-br !from-rose-500/80 !via-rose-400/75 !to-rose-600/85 !border-rose-300/60 !text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4),0_0_0_1px_rgba(251,113,133,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : '!bg-slate-950/60 !border-white/20 text-slate-200 hover:!bg-slate-900/70 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:border-emerald-400/30',
                selectedBetType === 'X'
                  ? 'hover:!bg-gradient-to-br hover:!from-rose-500/85 hover:!via-rose-400/80 hover:!to-rose-600/90 hover:shadow-[0_6px_24px_rgba(251,113,133,0.5)]'
                  : 'hover:!bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30'
              )}
            >
              X {match.odds.draw}
            </StyledButton>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="grid grid-cols-12 gap-3 items-center relative">
          {/* Match Info */}
          <div className="col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                {match.isLive && match.minute ? (
                  <span
                    className={cn(
                      'text-xs font-bold px-2 py-1 rounded-lg border backdrop-blur-xl animate-pulse',
                      'shadow-[0_2px_12px_rgba(244,63,94,0.3),0_0_0_1px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
                      'bg-gradient-to-r from-red-600/30 via-red-500/25 to-red-700/30',
                      'border-red-400/50 text-red-200 flex items-center gap-1.5'
                    )}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {typeof match.minute === 'number' ? `${match.minute}'` : match.minute}
                  </span>
                ) : (
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-1 rounded-lg border backdrop-blur-xl',
                      'shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]',
                      isDark
                        ? 'text-slate-200 bg-slate-950/60 border-white/15'
                        : 'text-slate-700 bg-white/80 border-slate-200/80'
                    )}
                  >
                    {match.time}
                  </span>
                )}
                {!match.isLive && countdownText && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-md text-center backdrop-blur-xl',
                      'shadow-[0_2px_12px_rgba(217,119,6,0.3),0_0_0_1px_rgba(217,119,6,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]',
                      'bg-gradient-to-br from-amber-500/20 via-amber-400/15 to-amber-600/20',
                      isDark
                        ? 'text-amber-300 border border-amber-400/40'
                        : 'text-amber-700 border border-amber-500/50'
                    )}
                  >
                    {countdownText}
                  </span>
                )}
                {match.isLive && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xl animate-pulse text-center',
                      'bg-red-600/90 text-white border border-red-400/50',
                      'shadow-[0_2px_8px_rgba(220,38,38,0.4)]'
                    )}
                  >
                    LIVE
                  </span>
                )}
              </div>
              {onShowAllMarkets && (
                <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className={cn('text-[10px] font-medium', isDark ? 'text-amber-400/80 group-hover:text-amber-300' : 'text-amber-600/80 group-hover:text-amber-700')}>
                    Markets
                  </span>
                  <ChevronRight className={cn('w-3 h-3 transition-colors', isDark ? 'text-amber-400/80 group-hover:text-amber-300' : 'text-amber-600/80 group-hover:text-amber-700')} />
                </div>
              )}
              <div className="space-y-1 flex-1 min-w-0">
                {match.league && (
                  <div className="mb-1">
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xl',
                        'shadow-[0_2px_8px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]',
                        'bg-gradient-to-br from-slate-800/70 via-slate-900/60 to-slate-800/70',
                        isDark
                          ? 'text-slate-200 border border-white/10'
                          : 'text-slate-800 bg-slate-100/95 border border-slate-300/60'
                      )}
                    >
                      {match.league}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <TeamLogo logo={homeLogo} teamName={match.home.name} />
                  <p className={cn('font-bold text-sm tracking-tight truncate', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
                    {match.home.name}
                  </p>
                  {match.isLive && match.home.score !== null && match.home.score !== undefined && (
                    <span className={cn('text-base font-bold ml-auto tabular-nums', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                      {match.home.score}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <TeamLogo logo={awayLogo} teamName={match.away.name} />
                  <p className={cn('font-bold text-sm tracking-tight truncate', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
                    {match.away.name}
                  </p>
                  {match.isLive && match.away.score !== null && match.away.score !== undefined && (
                    <span className={cn('text-base font-bold ml-auto tabular-nums', isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                      {match.away.score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Odds Buttons */}
          <div className="col-span-7 grid grid-cols-3 gap-2">
            <StyledButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOddsClick(match, 'home', match.odds.home, '1');
              }}
              disabled={!isValidOdd(match.odds.home)}
              aria-pressed={selectedBetType === '1'}
              className={cn(
                baseOddsButtonClass,
                selectedBetType === '1'
                  ? '!bg-gradient-to-br !from-rose-500/80 !via-rose-400/75 !to-rose-600/85 !border-rose-300/60 !text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4),0_0_0_1px_rgba(251,113,133,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : '!bg-slate-950/60 !border-white/20 text-emerald-200 hover:!bg-slate-900/70 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:border-emerald-400/30',
                selectedBetType === '1'
                  ? 'hover:!bg-gradient-to-br hover:!from-rose-500/85 hover:!via-rose-400/80 hover:!to-rose-600/90 hover:shadow-[0_6px_24px_rgba(251,113,133,0.5)]'
                  : 'hover:!bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30'
              )}
            >
              {match.odds.home}
            </StyledButton>
            <StyledButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOddsClick(match, 'draw', match.odds.draw, 'X');
              }}
              disabled={!isValidOdd(match.odds.draw)}
              aria-pressed={selectedBetType === 'X'}
              className={cn(
                baseOddsButtonClass,
                selectedBetType === 'X'
                  ? '!bg-gradient-to-br !from-rose-500/80 !via-rose-400/75 !to-rose-600/85 !border-rose-300/60 !text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4),0_0_0_1px_rgba(251,113,133,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : '!bg-slate-950/60 !border-white/20 text-slate-200 hover:!bg-slate-900/70 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:border-emerald-400/30',
                selectedBetType === 'X'
                  ? 'hover:!bg-gradient-to-br hover:!from-rose-500/85 hover:!via-rose-400/80 hover:!to-rose-600/90 hover:shadow-[0_6px_24px_rgba(251,113,133,0.5)]'
                  : 'hover:!bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30'
              )}
            >
              {match.odds.draw}
            </StyledButton>
            <StyledButton
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onOddsClick(match, 'away', match.odds.away, '2');
              }}
              disabled={!isValidOdd(match.odds.away)}
              aria-pressed={selectedBetType === '2'}
              className={cn(
                baseOddsButtonClass,
                selectedBetType === '2'
                  ? '!bg-gradient-to-br !from-rose-500/80 !via-rose-400/75 !to-rose-600/85 !border-rose-300/60 !text-white ring-2 ring-rose-300/50 shadow-[0_4px_20px_rgba(251,113,133,0.4),0_0_0_1px_rgba(251,113,133,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : '!bg-slate-950/60 !border-white/20 text-emerald-200 hover:!bg-slate-900/70 hover:shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:border-emerald-400/30',
                selectedBetType === '2'
                  ? 'hover:!bg-gradient-to-br hover:!from-rose-500/85 hover:!via-rose-400/80 hover:!to-rose-600/90 hover:shadow-[0_6px_24px_rgba(251,113,133,0.5)]'
                  : 'hover:!bg-rose-500/15 hover:text-rose-200 hover:border-rose-400/30'
              )}
            >
              {match.odds.away}
            </StyledButton>
          </div>
        </div>
      </div>
    </StyledCard>
  );
}
