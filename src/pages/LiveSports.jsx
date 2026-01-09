import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { SportsHeader, CountryFilter, MatchesList, MobilePrematchBrowser } from '@/components/pages/Sports';
import { LoadingState, ErrorState, EmptyState, EventMarketsViewCompact } from '@/components/common';
import { useLiveSportsPage } from '@/hooks/useLiveSportsPage';
import { usePageSectionState } from '@/hooks/usePageSectionState';
import { useI18n } from '@/contexts/I18nContext';

export default function LiveSports() {
  const { isDark } = useTheme();
  const [selectedMatchForMarkets, setSelectedMatchForMarkets] = useState(null);
  const {
    selectedSport,
    liveMatches,
    filteredMatches,
    isLoading,
    fetchError,
    handleBetClick,
    sportGroups,
    selectedSportGroup,
    handleSportGroupSelect,
    countries,
    expandedCountry,
    handleCountryToggle,
    handleLeagueSelect,
    mobileSports,
    selectedMobileSport,
    handleMobileSportSelect,
    mobileCountries,
    selectedMobileCountry,
    handleMobileCountrySelect,
    selectedLeagueName,
  } = useLiveSportsPage();

  const { t, isRtl } = useI18n();

  const { showLoading, showError, showEmpty, showContent } = usePageSectionState({
    isLoading,
    error: fetchError,
    hasBaseItems: !!(liveMatches && liveMatches.length),
    hasFilteredItems: !!(filteredMatches && filteredMatches.length),
  });

  const handleShowAllMarkets = (match) => {
    setSelectedMatchForMarkets(match);
  };

  const handleCloseMarkets = () => {
    setSelectedMatchForMarkets(null);
  };

  const renderContent = (paddingClass = '') => {
    if (showLoading) {
      return (
        <div className={paddingClass || 'px-4 py-12'}>
          <LoadingState type="skeleton" count={3} />
        </div>
      );
    }
    if (showError) {
      return (
        <div className={paddingClass || 'px-4 py-12'}>
          <ErrorState message={t('liveSports_loadError')} />
        </div>
      );
    }
    if (showEmpty) {
      return (
        <div className={paddingClass || 'px-4 py-12'}>
          <EmptyState
            icon="live"
            title={t('liveSports_noMatchesTitle')}
            description={t('liveSports_noMatchesDescription')}
          />
        </div>
      );
    }
    if (!showContent) return null;

    if (selectedMatchForMarkets) {
      return (
        <EventMarketsViewCompact
          match={selectedMatchForMarkets}
          isLive={true}
          onPlaceBet={handleBetClick}
          onBack={handleCloseMarkets}
        />
      );
    }

    return (
      <MatchesList
        matches={filteredMatches}
        onOddsClick={handleBetClick}
        onShowAllMarkets={handleShowAllMarkets}
        isDark={isDark}
      />
    );
  };

  return (
    <div
      className={cn(
        'min-h-screen pb-24 transition-colors duration-500',
        isDark ? 'bg-slate-950' : 'bg-slate-50'
      )}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Desktop sports-style header (mirrors prematch Sports page) */}
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
          selectedLeague={selectedSport !== 'all' ? selectedSport : null}
          selectedLeagueName={selectedLeagueName}
          onLeagueSelect={handleLeagueSelect}
          matches={liveMatches}
          filteredMatches={filteredMatches}
          isLoading={isLoading}
          fetchError={fetchError}
          showLoading={showLoading}
          showError={showError}
          showEmpty={showEmpty}
          showContent={showContent}
          isDark={isDark}
          isLive={true}
          rootTitleKey="nav_live"
          showRootLiveDot={true}
          historyStateKey="liveStep"
          onOddsClick={handleBetClick}
          selectedMatchForMarkets={selectedMatchForMarkets}
          onShowAllMarkets={handleShowAllMarkets}
          onCloseMarkets={handleCloseMarkets}
        />

        {/* Desktop layout: regions sidebar + matches list, like prematch */}
        <div className="hidden md:flex md:flex-row gap-4 md:gap-6">
          <CountryFilter
            countries={countries}
            expandedCountry={expandedCountry}
            onCountryToggle={handleCountryToggle}
            selectedLeague={selectedSport}
            onLeagueSelect={handleLeagueSelect}
            isDark={isDark}
          />

          <div className="flex-1 p-3 sm:p-4 md:p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
