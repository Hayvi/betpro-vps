import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { CasinoHeroBanner, CasinoSearchFilters, GamesGrid } from '@/components/pages/Casino';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { useCasinoPage } from '@/hooks/useCasinoPage';
import { usePageSectionState } from '@/hooks/usePageSectionState';
import { useI18n } from '@/contexts/I18nContext';

export default function Casino() {
  const { isDark } = useTheme();
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    gridSize,
    setGridSize,
    games,
    categories,
    filteredGames,
    isLoading,
    hasError,
    handleGamePlay,
  } = useCasinoPage();

  const { t, isRtl } = useI18n();

  const { showLoading, showError, showEmpty, showContent } = usePageSectionState({
    isLoading,
    error: hasError,
    hasBaseItems: !!(games && games.length),
    hasFilteredItems: !!(filteredGames && filteredGames.length),
  });

  return (
    <div className={cn("min-h-screen pb-24 transition-colors duration-500", isDark ? "bg-slate-950" : "bg-slate-50")} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Banner */}
      <CasinoHeroBanner />

      {/* Search & Filters */}
      <CasinoSearchFilters
        searchQuery={searchQuery}
        gridSize={gridSize}
        categories={categories}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onGridSizeChange={setGridSize}
        onCategoryChange={setSelectedCategory}
        isDark={isDark}
      />

      {/* Games Grid with State Handling */}
      {showLoading ? (
        <div className="px-4 py-12">
          <LoadingState type="skeleton" count={6} />
        </div>
      ) : showError ? (
        <div className="px-4 py-12">
          <ErrorState message={t('casino_loadError')} />
        </div>
      ) : showEmpty ? (
        <div className="px-4 py-12">
          <EmptyState icon="casino" title={t('casino_noGamesTitle')} description={t('casino_noGamesDescription')} />
        </div>
      ) : showContent ? (
        <GamesGrid games={filteredGames} gridSize={gridSize} onGamePlay={handleGamePlay} />
      ) : null}
    </div>
  );
}
