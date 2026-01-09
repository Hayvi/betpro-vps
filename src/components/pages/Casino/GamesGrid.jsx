import { Search } from '@/components/ui/BrandIcons';
import { GameCard } from './GameCard';
import { useI18n } from '@/contexts/I18nContext';


export function GamesGrid({ games = [], gridSize = 'normal', onGamePlay }) {
  const { t } = useI18n();
  const gridClass = gridSize === 'normal'
    ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
    : 'grid-cols-3 md:grid-cols-5 lg:grid-cols-6';

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-white font-bold text-lg">{t('casino_noGamesTitle')}</h3>
        <p className="text-gray-500 mt-1">{t('casino_noGamesDescription')}</p>
      </div>
    );
  }

  return (
    <div className={`grid ${gridClass} gap-3 p-4`}>
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          onPlay={onGamePlay}
        />
      ))}
    </div>
  );
}
