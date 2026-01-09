import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { SportsHeader, CountryFilter, LeagueHeader, OddsHeader, MatchesList, MobilePrematchBrowser } from '@/components/pages/Sports';
import { LoadingState, ErrorState, EmptyState, EventMarketsViewCompact } from '@/components/common';
import { useSportsPage } from '@/hooks/useSportsPage';
import { usePageSectionState } from '@/hooks/usePageSectionState';
import { useI18n } from '@/contexts/I18nContext';

export default function Sports() {
  const { isDark } = useTheme();
  const [selectedMatchForMarkets, setSelectedMatchForMarkets] = useState(null);
  const {
    mobileSports,
    selectedMobileSport,
    handleMobileSportSelect,
    mobileCountries,
    selectedMobileCountry,
    handleMobileCountrySelect,
    sportGroups,
    selectedSportGroup,
    handleSportGroupSelect,
    expandedCountry,
    selectedLeague,
    selectedLeagueName,
    countries,
    matches,
    filteredMatches,
    isLoading,
    fetchError,
    handleBetClick,
    handleLeagueSelect,
    handleCountryToggle,
    handleCountrySelect,
  } = useSportsPage();

  const { t, isRtl } = useI18n();

  const { showLoading, showError, showEmpty, showContent } = usePageSectionState({
    isLoading,
    error: fetchError,
    hasBaseItems: !!(matches && matches.length),
    hasFilteredItems: !!(filteredMatches && filteredMatches.length),
  });

  const handleShowAllMarkets = (match) => {
    setSelectedMatchForMarkets(match);
  };

  const handleCloseMarkets = () => {
    setSelectedMatchForMarkets(null);
  };

  return (
    <div className={cn("min-h-screen pb-24 transition-colors duration-500", isDark ? "bg-slate-950" : "bg-slate-50")} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <SportsHeader
        sportGroups={sportGroups}
        selectedSportGroup={selectedSportGroup}
        onSportGroupSelect={handleSportGroupSelect}
        isDark={isDark}
      />

      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        <MobilePrematchBrowser
          mobileSports={mobileSports}
          selectedMobileSport={selectedMobileSport}
          onMobileSportSelect={handleMobileSportSelect}
          mobileCountries={mobileCountries}
          selectedMobileCountry={selectedMobileCountry}
          onMobileCountrySelect={handleMobileCountrySelect}
          selectedLeague={selectedLeague}
          selectedLeagueName={selectedLeagueName}
          onLeagueSelect={handleLeagueSelect}
          matches={matches}
          filteredMatches={filteredMatches}
          isLoading={isLoading}
          fetchError={fetchError}
          showLoading={showLoading}
          showError={showError}
          showEmpty={showEmpty}
          showContent={showContent}
          isDark={isDark}
          rootTitleKey="nav_prematch"
          onOddsClick={handleBetClick}
          selectedMatchForMarkets={selectedMatchForMarkets}
          onShowAllMarkets={handleShowAllMarkets}
          onCloseMarkets={handleCloseMarkets}
        />

        <div className="hidden md:flex md:flex-row gap-4 md:gap-6">
          {/* Sidebar - Countries & Leagues */}
          <CountryFilter
            countries={countries}
            expandedCountry={expandedCountry}
            onCountryToggle={handleCountryToggle}
            selectedLeague={selectedLeague}
            onLeagueSelect={handleLeagueSelect}
            isDark={isDark}
          />

          {/* Main Content - Matches */}
          <div className="flex-1 p-3 sm:p-4 md:p-6">
            {!selectedMatchForMarkets && (
              <>
                <LeagueHeader leagueName={selectedLeagueName} leagueKey={selectedLeague} isDark={isDark} />
                <OddsHeader isDark={isDark} />
              </>
            )}

            {/* Matches List with State Handling */}
            {showLoading ? (
              <div className="px-4 py-12">
                <LoadingState type="skeleton" count={3} />
              </div>
            ) : showError ? (
              <div className="px-4 py-12">
                <ErrorState message={t('sports_loadError')} />
              </div>
            ) : showEmpty ? (
              <div className="px-4 py-12">
                <EmptyState icon="sports" title={t('sports_noMatchesTitle')} description={t('sports_noMatchesDescription')} />
              </div>
            ) : showContent ? (
              selectedMatchForMarkets ? (
                <EventMarketsViewCompact
                  match={selectedMatchForMarkets}
                  isLive={false}
                  onPlaceBet={handleBetClick}
                  onBack={handleCloseMarkets}
                />
              ) : (
                <MatchesList
                  matches={filteredMatches}
                  onOddsClick={handleBetClick}
                  onShowAllMarkets={handleShowAllMarkets}
                  isDark={isDark}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
