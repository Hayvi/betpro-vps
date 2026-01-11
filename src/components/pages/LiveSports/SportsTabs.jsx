import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';


export function SportsTabs({ sports = [], selectedSport = 'all', onSportChange, totalMatches = 0 }) {
  const { t } = useI18n();
  return (
    <div className="px-4 py-3 border-b border-slate-800 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {/* All Sports Button */}
        <Button
          variant={selectedSport === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSportChange('all')}
          className={selectedSport === 'all' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 border-slate-700 text-gray-300'}
        >
          {t('liveSports_allSportsLabel')} ({totalMatches})
        </Button>

        {/* Individual Sport Buttons */}
        {sports.map((sport) => (
          <Button
            key={sport.id}
            variant={selectedSport === sport.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSportChange(sport.id)}
            className={selectedSport === sport.id ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-800 border-slate-700 text-gray-300'}
          >
            <span className="ml-1">{sport.icon}</span>
            {sport.name} ({sport.count})
          </Button>
        ))}
      </div>
    </div>
  );
}
