import { ChevronLeft, ChevronRight, Play } from '@/components/ui/BrandIcons';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

export function HeroCarousel({
  slides = [],
  currentSlide = 0,
  onPrevSlide,
  onNextSlide,
  onGoToSlide,
}) {
  const { t } = useI18n();

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];

  return (
    <div className="relative h-[280px] md:h-[400px] overflow-hidden rounded-2xl mx-4 mt-4 shadow-[0_22px_55px_rgba(15,23,42,0.9)] border border-slate-700/50 bg-slate-950/40 backdrop-blur-2xl">
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          {/* Gradient overlay - consistent cyan/emerald theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <div className="max-w-md space-y-3">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-1 transition-all duration-500 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                {slide.titleKey ? t(slide.titleKey) : ''}
              </h1>
              <p className="text-base md:text-lg text-slate-300 transition-all duration-500">
                {slide.subtitleKey ? t(slide.subtitleKey) : ''}
              </p>
              <div className="mt-4 flex items-center gap-3 pt-2">
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm md:text-base font-bold",
                    "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white",
                    "hover:from-emerald-400 hover:to-cyan-400",
                    "shadow-[0_4px_20px_rgba(16,185,129,0.4)]",
                    "hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)]",
                    "transform transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95"
                  )}
                >
                  <Play className="w-4 h-4 fill-current" />
                  {t('home_hero_cta')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Modern style */}
      <button
        onClick={onPrevSlide}
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl",
          "bg-slate-900/60 backdrop-blur-sm border border-slate-700/50",
          "flex items-center justify-center text-slate-300",
          "hover:bg-slate-800/80 hover:text-white hover:border-cyan-500/30",
          "transition-all duration-300 hover:scale-110 active:scale-95"
        )}
        aria-label={t('home_hero_prevSlideAria')}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={onNextSlide}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl",
          "bg-slate-900/60 backdrop-blur-sm border border-slate-700/50",
          "flex items-center justify-center text-slate-300",
          "hover:bg-slate-800/80 hover:text-white hover:border-cyan-500/30",
          "transition-all duration-300 hover:scale-110 active:scale-95"
        )}
        aria-label={t('home_hero_nextSlideAria')}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots - Modern pill style */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/60 backdrop-blur-sm border border-slate-700/50">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onGoToSlide(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentSlide
                  ? "w-6 bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                  : "w-2 bg-slate-500 hover:bg-slate-400"
              )}
              aria-label={`${t('home_hero_goToSlideAria')} ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
