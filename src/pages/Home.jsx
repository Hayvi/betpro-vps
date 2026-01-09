import { useTheme } from '@/contexts/ThemeContext';
import { useCarousel } from '@/hooks/useCarousel';
import { heroSlides, categories } from '@/constants/homeDefaults';
import { HeroCarousel, CategoryCards, GamesSection, TopWinsTable, JackpotSection } from '@/components/pages/Home';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { cn } from '@/lib/utils';
import { useHomePage } from '@/hooks/useHomePage';
import { useI18n } from '@/contexts/I18nContext';

export default function Home() {
  const { isDark } = useTheme();
  const { isRtl, t } = useI18n();
  const {
    popularGames,
    topWins,
    isLoading,
    hasError,
  } = useHomePage();
  const { currentSlide, nextSlide, prevSlide, goToSlide } = useCarousel(heroSlides.length);

  return (
    <div className={cn("min-h-screen transition-colors duration-500", isDark ? "bg-slate-950" : "bg-slate-50")} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Carousel */}
      <HeroCarousel
        slides={heroSlides}
        currentSlide={currentSlide}
        onPrevSlide={prevSlide}
        onNextSlide={nextSlide}
        onGoToSlide={goToSlide}
      />

      {/* Category Cards */}
      <CategoryCards categories={categories} />

      {/* Popular Slots Section */}
      {isLoading && (!popularGames || popularGames.length === 0) ? (
        <div className="px-4 py-12">
          <LoadingState type="skeleton" count={3} />
        </div>
      ) : hasError && (!popularGames || popularGames.length === 0) ? (
        <div className="px-4 py-12">
          <ErrorState message={t('home_popularLoadError')} />
        </div>
      ) : !popularGames || popularGames.length === 0 ? (
        <div className="px-4 py-12">
          <EmptyState icon="games" title={t('home_noGamesTitle')} description={t('home_noGamesDescription')} />
        </div>
      ) : (
        <GamesSection
          title={t('home_popularSlotsTitle')}
          games={popularGames}
          viewAllLink="/casino"
        />
      )}

      {/* Top Wins Table */}
      {isLoading && (!topWins || topWins.length === 0) ? (
        <div className="px-4 py-12">
          <LoadingState type="skeleton" count={3} />
        </div>
      ) : hasError && (!topWins || topWins.length === 0) ? (
        <div className="px-4 py-12">
          <ErrorState message={t('home_topWinsLoadError')} />
        </div>
      ) : !topWins || topWins.length === 0 ? (
        <div className="px-4 py-12">
          <EmptyState icon="wins" title={t('home_noTopWinsTitle')} description={t('home_noTopWinsDescription')} />
        </div>
      ) : (
        <>
          <TopWinsTable wins={topWins} />
          {/* Jackpot Section */}
          <JackpotSection winners={topWins} />
        </>
      )}
    </div>
  );
}
