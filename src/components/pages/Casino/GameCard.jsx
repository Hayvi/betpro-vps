import { Play, Clock } from '@/components/ui/BrandIcons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';


export function GameCard({ game, onPlay }) {
  if (!game) return null;

  const isBuiltIn = game.isBuiltIn;
  const isComingSoon = game.isComingSoon;
  const { t } = useI18n();

  return (
    <div className="group relative">
      <div 
        className={`relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 cursor-pointer shadow-[0_18px_45px_rgba(15,23,42,0.85)] border border-slate-800/80 backdrop-blur-2xl ${isComingSoon ? 'opacity-70' : ''}`}
        onClick={() => onPlay?.(game)}
      >
        {/* Game Image/Emoji */}
        {isBuiltIn ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
            <span className="text-6xl group-hover:scale-125 transition-transform duration-300">
              {game.image}
            </span>
          </div>
        ) : (
          <img
            src={game.image}
            alt={game.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Coming Soon Badge */}
        {isComingSoon && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-slate-600 text-white text-[10px] px-2 py-0.5">
              <Clock className="w-3 h-3 ml-1" />
              {t('casino_badge_comingSoon')}
            </Badge>
          </div>
        )}

        {/* Live Badge */}
        {game.isLive && !isComingSoon && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-600 text-white text-[10px] px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-1" />
              {t('casino_badge_live')}
            </Badge>
          </div>
        )}

        {/* Hot Badge */}
        {game.isHot && !isComingSoon && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-orange-600 text-white text-[10px] px-2 py-0.5">
              🔥
            </Badge>
          </div>
        )}

        {/* BetPro Badge for built-in games */}
        {isBuiltIn && !isComingSoon && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5">
              {t('casino_badge_original')}
            </Badge>
          </div>
        )}

        {/* Players Count - hide for built-in */}
        {!isBuiltIn && (
          <div className="absolute bottom-12 right-2">
            <Badge variant="secondary" className="bg-black/50 text-white text-[10px]">
              👥 {game.players || 0}
            </Badge>
          </div>
        )}

        {/* Play Button - Shows on Hover */}
        {!isComingSoon && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.(game);
              }}
              variant="primary"
              size="icon"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 transform transition-transform hover:scale-110 active:scale-95"
              aria-label={`${t('casino_playButton_ariaLabelPrefix')} ${game.name}`}
            >
              <Play className="w-6 h-6 text-white fill-white mr-[-2px]" />
            </Button>
          </div>
        )}

        {/* Game Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-medium text-sm truncate">{game.name}</p>
          <p className="text-cyan-400 text-xs">{game.provider}</p>
          {game.description && (
            <p className="text-slate-400 text-[10px] mt-0.5 truncate">{game.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
