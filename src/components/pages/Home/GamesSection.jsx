import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from '@/components/ui/BrandIcons';
import { createPageUrl } from '@/utils/index';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

export function GamesSection({ title, games = [], isLive = false, viewAllLink = '/casino' }) {
  const { t } = useI18n();
  const { isDark } = useTheme();
  
  return (
    <section className="mt-10 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className={cn(
          "text-xl md:text-2xl font-bold flex items-center gap-2",
          isDark ? "text-white" : "text-slate-900"
        )}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          {title}
        </h2>
        <Link
          to={createPageUrl(viewAllLink.slice(1))}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
        >
          {t('home_games_viewAll')}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative -mx-4">
        <div className="flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700/70 scrollbar-track-transparent">
          {(games || []).map((game) => (
            <div
              key={game.id}
              className="snap-start shrink-0 w-[140px] md:w-[180px] relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95"
            >
              <div className={cn(
                "aspect-[3/4] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(15,23,42,0.5)] border",
                isDark ? "bg-slate-900 border-slate-700/50" : "bg-white border-slate-200"
              )}>
                <img
                  src={game.image}
                  alt={game.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {isLive && (
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      {t('liveSports_liveLabel')}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs font-semibold truncate">{game.name}</p>
                  <p className="text-cyan-400 text-[10px]">{game.provider}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
