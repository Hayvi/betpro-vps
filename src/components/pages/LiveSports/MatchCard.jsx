import { Zap, Clock } from '@/components/ui/BrandIcons';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { OddsSection } from './OddsSection';
import { useTeamLogo } from '@/hooks/useTeamLogo';
import { useI18n } from '@/contexts/I18nContext';

export function MatchCard({ match, animatedOdds = {}, onOddsClick, getSportIcon, onShowAllMarkets }) {
  const { logo: homeLogo } = useTeamLogo(match?.home?.name);
  const { logo: awayLogo } = useTeamLogo(match?.away?.name);
  const { t } = useI18n();

  if (!match) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onShowAllMarkets && onShowAllMarkets(match)}
      className="cursor-pointer bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden"
    >
      {/* Match Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getSportIcon(match.sport)}</span>
          <span className="text-gray-400 text-sm">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          {match.isHot && (
            <Badge className="bg-orange-600/20 text-orange-400 border-orange-600/50">
              <Zap className="w-3 h-3 ml-1" />
              {t('liveSports_hotBadge')}
            </Badge>
          )}
          <Badge className="bg-red-600 text-white animate-pulse">
            <Clock className="w-3 h-3 ml-1" />
            {typeof match.minute === 'number' ? `${match.minute}'` : match.minute}
          </Badge>
        </div>
      </div>

      {/* Match Content */}
      <div className="p-4">
        {/* Teams & Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {homeLogo ? (
                <img 
                  src={homeLogo} 
                  alt="" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div 
                className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs text-slate-400"
                style={{ display: homeLogo ? 'none' : 'flex' }}
              >
                {match.home.name?.charAt(0)}
              </div>
              <span className="text-white font-bold text-lg">{match.home.name}</span>
              {match.home.redCards > 0 && (
                <span className="w-4 h-5 bg-red-600 rounded-sm text-white text-xs flex items-center justify-center">
                  {match.home.redCards}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {awayLogo ? (
                <img 
                  src={awayLogo} 
                  alt="" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div 
                className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs text-slate-400"
                style={{ display: awayLogo ? 'none' : 'flex' }}
              >
                {match.away.name?.charAt(0)}
              </div>
              <span className="text-white font-bold text-lg">{match.away.name}</span>
              {match.away.redCards > 0 && (
                <span className="w-4 h-5 bg-red-600 rounded-sm text-white text-xs flex items-center justify-center">
                  {match.away.redCards}
                </span>
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="bg-slate-800 rounded-xl px-6 py-3">
              <div className="text-3xl font-bold text-white">
                {match.home.score} - {match.away.score}
              </div>
            </div>
          </div>
        </div>

        {/* Stats (for football) */}
        {match.stats?.possession && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{match.stats.possession}%</span>
              <span>{t('liveSports_possessionLabel')}</span>
              <span>{100 - match.stats.possession}%</span>
            </div>
            <Progress value={match.stats.possession} className="h-1 bg-slate-700" />
          </div>
        )}

        {/* Odds */}
        <OddsSection
          odds={match.odds}
          animatedOdds={animatedOdds}
          onOddsClick={(betType, odds, betLabel) => onOddsClick(match, betType, odds, betLabel)}
        />
      </div>
    </div>
  );
}
