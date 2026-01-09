import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft } from '@/components/ui/BrandIcons';
import { cn } from '@/lib/utils';
import { useLeagueLogo } from '@/hooks/useLeagueLogo';
import { Badge } from '@/components/ui/badge';
import { OddsHeader } from './OddsHeader';
import { MatchesList } from './MatchesList';
import { LoadingState, ErrorState, EmptyState, EventMarketsViewCompact } from '@/components/common';
import { useI18n } from '@/contexts/I18nContext';

function LeagueRow({ league, isDark, onSelect }) {
  const logo = useLeagueLogo(league?.id);

  return (
    <button
      type="button"
      onClick={() => onSelect && onSelect(league)}
      className={cn(
        'group relative w-full flex items-center justify-between rounded-xl px-3 py-3 text-sm border transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)',
        'backdrop-blur-2xl overflow-hidden',
        'hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.6),0_4px_16px_rgba(16,185,129,0.1),0_0_0_1px_rgba(255,255,255,0.05)]',
        'active:translate-y-0 active:scale-[0.98]',
        'ring-1 ring-white/10 hover:ring-white/20 hover:ring-emerald-400/20',
        'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
        isDark
          ? 'bg-slate-950/70 border-slate-800/80 text-slate-100 hover:bg-slate-900/80'
          : 'bg-white/90 border-slate-200/80 text-slate-900 hover:bg-slate-50/90'
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/[0.2] opacity-100"
      />
      <div className="relative flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center overflow-hidden ring-1 ring-cyan-500/20">
          {logo ? (
            <img src={logo} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <span className="text-sm">🏆</span>
          )}
        </div>
        <span className={cn('font-semibold truncate tracking-tight', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
          {league?.name}
        </span>
      </div>
      <Badge 
        variant="secondary" 
        className={cn(
          'relative shrink-0 font-bold tabular-nums backdrop-blur-xl border',
          'shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]',
          isDark 
            ? 'bg-slate-950/60 border-white/15 text-slate-200' 
            : 'bg-white/90 border-slate-200/80 text-slate-700'
        )}
      >
        {league?.count ?? 0}
      </Badge>
    </button>
  );
}

export function MobilePrematchBrowser({
  mobileSports = [],
  selectedMobileSport = null,
  onMobileSportSelect,
  mobileCountries = [],
  selectedMobileCountry = null,
  onMobileCountrySelect,
  selectedLeague = null,
  selectedLeagueName = '',
  onLeagueSelect,
  matches = [],
  filteredMatches = [],
  isLoading = false,
  fetchError = null,
  showLoading = false,
  showError = false,
  showEmpty = false,
  showContent = false,
  isDark = true,
  isLive = false,
  historyStateKey = 'prematchStep',
  rootTitleKey = 'nav_sports',
  showRootLiveDot = false,
  onOddsClick,
  selectedMatchForMarkets,
  onShowAllMarkets,
  onCloseMarkets,
}) {
  const { t } = useI18n();
  const [step, setStep] = useState('sports');
  const popStateInProgressRef = useRef(false);
  const prevStepRef = useRef('sports');
  const openingMarketsRef = useRef(false);

  const isValidStep = (value) => {
    return (
      value === 'sports' ||
      value === 'countries' ||
      value === 'competitions' ||
      value === 'games' ||
      value === 'markets'
    );
  };

  const syncHistoryReplace = (nextStep) => {
    if (typeof window === 'undefined') return;
    const safeStep = isValidStep(nextStep) ? nextStep : 'sports';
    const stateKey = typeof historyStateKey === 'string' && historyStateKey.length ? historyStateKey : 'prematchStep';
    try {
      const url = window.location.pathname + window.location.search + window.location.hash;
      window.history.replaceState({ ...(window.history.state || {}), [stateKey]: safeStep }, '', url);
    } catch {
      return;
    }
  };

  const syncHistoryPush = (nextStep) => {
    if (typeof window === 'undefined') return;
    const safeStep = isValidStep(nextStep) ? nextStep : 'sports';
    const stateKey = typeof historyStateKey === 'string' && historyStateKey.length ? historyStateKey : 'prematchStep';
    try {
      const url = window.location.pathname + window.location.search + window.location.hash;
      window.history.pushState({ ...(window.history.state || {}), [stateKey]: safeStep }, '', url);
    } catch {
      return;
    }
  };

  const goToStep = (nextStep) => {
    syncHistoryPush(nextStep);
    setStep(nextStep);
  };

  const selectedSportItem = useMemo(() => {
    if (!mobileSports || mobileSports.length === 0) return null;
    return mobileSports.find((s) => s.id === selectedMobileSport) || null;
  }, [mobileSports, selectedMobileSport]);

  const selectedCountryItem = useMemo(() => {
    if (!mobileCountries || mobileCountries.length === 0) return null;
    return mobileCountries.find((c) => c.id === selectedMobileCountry) || null;
  }, [mobileCountries, selectedMobileCountry]);

  const leaguesForSelectedCountry = useMemo(() => {
    return selectedCountryItem?.leagues || [];
  }, [selectedCountryItem]);

  useEffect(() => {
    if (step === 'countries' && (!selectedMobileSport || mobileSports.length === 0)) {
      setStep('sports');
      return;
    }

    if (step === 'competitions' && (!selectedCountryItem || mobileCountries.length === 0)) {
      setStep('countries');
      return;
    }

    if (step === 'games' && !selectedLeague) {
      setStep('competitions');
    }

    if (step === 'markets' && !selectedMatchForMarkets) {
      if (!openingMarketsRef.current) {
        setStep('games');
      }
    }
  }, [mobileCountries.length, mobileSports.length, selectedCountryItem, selectedLeague, selectedMobileSport, selectedMatchForMarkets, step]);

  useEffect(() => {
    if (step === 'markets' && selectedMatchForMarkets) {
      openingMarketsRef.current = false;
    }
  }, [selectedMatchForMarkets, step]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    syncHistoryReplace(step);

    const stateKey = typeof historyStateKey === 'string' && historyStateKey.length ? historyStateKey : 'prematchStep';

    const onPopState = (event) => {
      const next = event?.state?.[stateKey];
      if (!isValidStep(next)) return;
      popStateInProgressRef.current = true;
      setStep(next);
      setTimeout(() => {
        popStateInProgressRef.current = false;
      }, 0);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [historyStateKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (popStateInProgressRef.current) return;
    syncHistoryReplace(step);
  }, [step]);

  useEffect(() => {
    const prevStep = prevStepRef.current;
    if (prevStep === 'markets' && step !== 'markets' && onCloseMarkets) {
      onCloseMarkets();
    }
    prevStepRef.current = step;
  }, [onCloseMarkets, step]);

  const handleBack = () => {
    if (step === 'markets' && onCloseMarkets) {
      onCloseMarkets();
    }

    if (typeof window !== 'undefined' && step !== 'sports') {
      window.history.back();
      return;
    }

    if (step === 'markets') setStep('games');
    else if (step === 'games') setStep('competitions');
    else if (step === 'competitions') setStep('countries');
    else if (step === 'countries') setStep('sports');
  };

  const title = useMemo(() => {
    const fallbackRoot = t(rootTitleKey);
    if (step === 'sports') return fallbackRoot;
    if (step === 'countries') return selectedSportItem?.name || fallbackRoot;
    if (step === 'competitions') return selectedCountryItem?.name || t('sports_filterByCountryLeague');
    if (step === 'games') return t('sports_matchesLabel');
    if (step === 'markets') return t('sports_marketsLabel');
    return fallbackRoot;
  }, [rootTitleKey, selectedCountryItem?.name, selectedSportItem?.name, step, t]);

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-3 mb-4">
        {step !== 'sports' && (
          <button
            type="button"
            onClick={handleBack}
            className={cn(
              'group relative h-10 w-10 flex items-center justify-center rounded-xl border transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
              'backdrop-blur-2xl overflow-hidden',
              'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.6),0_0_0_1px_rgba(255,255,255,0.1)]',
              'active:translate-y-0 active:scale-[0.95]',
              'ring-1 ring-white/10 hover:ring-white/20',
              'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100',
              isDark 
                ? 'bg-slate-950/70 border-slate-800/80 text-slate-200 hover:text-white' 
                : 'bg-white/90 border-slate-200/80 text-slate-700 hover:text-slate-900'
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/[0.15] opacity-100"
            />
            <ChevronLeft className="relative w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              'text-lg font-bold truncate tracking-tight',
              step === 'sports' && showRootLiveDot && 'flex items-center gap-2',
              isDark ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]' : 'text-slate-900'
            )}
          >
            {step === 'sports' && showRootLiveDot && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            <span className="truncate">{title}</span>
          </h1>
          {step !== 'sports' && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1 h-1 rounded-full bg-emerald-400/60"></div>
              <span className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-slate-600')}>
                {step === 'countries' && t('sports_step_countriesHint')}
                {step === 'competitions' && t('sports_step_competitionsHint')}
                {step === 'games' && t('sports_step_gamesHint')}
                {step === 'markets' && t('sports_step_marketsHint')}
              </span>
            </div>
          )}
        </div>
      </div>

      {step === 'sports' && (
        <div className="space-y-3">
          {(mobileSports || []).map((sport, index) => {
            const isActive = selectedMobileSport === sport.id;
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => {
                  onMobileSportSelect && onMobileSportSelect(sport.id);
                  goToStep('countries');
                }}
                className={cn(
                  'group relative w-full flex items-center justify-between rounded-xl px-4 py-4 border text-sm font-semibold transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)',
                  'backdrop-blur-2xl overflow-hidden animate-premium-slide-in',
                  'hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.7),0_8px_32px_rgba(16,185,129,0.15),0_0_0_1px_rgba(255,255,255,0.05)]',
                  'active:translate-y-0 active:scale-[0.98]',
                  'ring-1 ring-white/10 hover:ring-white/20',
                  'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
                  isActive
                    ? 'bg-gradient-to-br from-emerald-600/30 via-emerald-500/20 to-emerald-700/30 border-emerald-400/50 text-emerald-200 ring-emerald-400/30 shadow-[0_8px_32px_rgba(16,185,129,0.3),0_0_0_1px_rgba(16,185,129,0.2)]'
                    : isDark
                      ? 'bg-slate-950/70 border-slate-800/80 text-slate-100 hover:bg-slate-900/80 hover:ring-emerald-400/20'
                      : 'bg-white/90 border-slate-200/80 text-slate-900 hover:bg-slate-50/90 hover:ring-emerald-400/20'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/[0.2] opacity-100"
                />
                <div className="relative flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center ring-1 ring-cyan-500/20">
                    <span className="text-xl">{sport.icon}</span>
                  </div>
                  <span className={cn('font-bold truncate tracking-tight', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
                    {sport.name}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    'relative shrink-0 font-bold tabular-nums backdrop-blur-xl border',
                    'shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]',
                    isActive
                      ? 'bg-emerald-950/60 border-emerald-300/30 text-emerald-200'
                      : isDark 
                        ? 'bg-slate-950/60 border-white/15 text-slate-200' 
                        : 'bg-white/90 border-slate-200/80 text-slate-700'
                  )}
                >
                  {sport.count}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {step === 'countries' && (
        <div className="space-y-3">
          {(mobileCountries || []).map((country, index) => {
            const isActive = selectedMobileCountry === country.id;
            return (
              <button
                key={country.id}
                type="button"
                onClick={() => {
                  onMobileCountrySelect && onMobileCountrySelect(country.id);
                  goToStep('competitions');
                }}
                className={cn(
                  'group relative w-full flex items-center justify-between rounded-xl px-4 py-4 border text-sm transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)',
                  'backdrop-blur-2xl overflow-hidden animate-premium-slide-in',
                  'hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.7),0_8px_32px_rgba(16,185,129,0.15),0_0_0_1px_rgba(255,255,255,0.05)]',
                  'active:translate-y-0 active:scale-[0.98]',
                  'ring-1 ring-white/10 hover:ring-white/20',
                  'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/[0.08] before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
                  isActive
                    ? 'bg-gradient-to-br from-emerald-600/30 via-emerald-500/20 to-emerald-700/30 border-emerald-400/50 text-emerald-200 ring-emerald-400/30 shadow-[0_8px_32px_rgba(16,185,129,0.3),0_0_0_1px_rgba(16,185,129,0.2)]'
                    : isDark
                      ? 'bg-slate-950/70 border-slate-800/80 text-slate-100 hover:bg-slate-900/80 hover:ring-emerald-400/20'
                      : 'bg-white/90 border-slate-200/80 text-slate-900 hover:bg-slate-50/90 hover:ring-emerald-400/20'
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/[0.2] opacity-100"
                />
                <div className="relative flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center ring-1 ring-cyan-500/30">
                    <span className="text-xl">{country.flag}</span>
                  </div>
                  <span className={cn('font-semibold truncate tracking-tight', isDark ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]' : 'text-slate-900')}>
                    {country.name}
                  </span>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'relative shrink-0 font-bold tabular-nums backdrop-blur-xl border',
                    'shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]',
                    isActive
                      ? 'bg-emerald-950/60 border-emerald-300/30 text-emerald-200'
                      : isDark 
                        ? 'bg-slate-950/60 border-white/15 text-slate-200' 
                        : 'bg-white/90 border-slate-200/80 text-slate-700'
                  )}
                >
                  {country.leagues?.length ?? 0}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {step === 'competitions' && (
        <div className="space-y-3">
          {(leaguesForSelectedCountry || []).map((league, index) => (
            <div
              key={league.id}
              className="animate-premium-slide-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <LeagueRow
                league={league}
                isDark={isDark}
                onSelect={(value) => {
                  onLeagueSelect && onLeagueSelect(value);
                  goToStep('games');
                }}
              />
            </div>
          ))}
        </div>
      )}

      {step === 'games' && (
        <div className="pt-1">
          <OddsHeader isDark={isDark} />

          {showLoading ? (
            <div className="px-2 py-8">
              <LoadingState type="skeleton" count={3} />
            </div>
          ) : showError ? (
            <div className="px-2 py-8">
              <ErrorState message={t(isLive ? 'liveSports_loadError' : 'sports_loadError')} />
            </div>
          ) : showEmpty ? (
            <div className="px-2 py-8">
              <EmptyState
                icon="sports"
                title={t(isLive ? 'liveSports_noMatchesTitle' : 'sports_noMatchesTitle')}
                description={t(isLive ? 'liveSports_noMatchesDescription' : 'sports_noMatchesDescription')}
              />
            </div>
          ) : showContent ? (
            <>
              <MatchesList
                matches={filteredMatches}
                onOddsClick={onOddsClick}
                onShowAllMarkets={(match) => {
                  if (onShowAllMarkets) {
                    onShowAllMarkets(match);
                  }
                  openingMarketsRef.current = true;
                  goToStep('markets');
                }}
                isDark={isDark}
              />
            </>
          ) : null}
        </div>
      )}

      {step === 'markets' && (
        <div className="pt-1">
          <EventMarketsViewCompact
            match={selectedMatchForMarkets}
            isLive={isLive}
            onPlaceBet={onOddsClick}
          />
        </div>
      )}
    </div>
  );
}
