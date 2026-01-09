import { TrendingUp } from '@/components/ui/BrandIcons';
import { StyledButton } from '@/components/ui/StyledButton';


export function OddsSection({ odds = {}, animatedOdds = {}, onOddsClick }) {
  const isValidOdd = (value) => {
    if (value === null || value === undefined) return false;
    const str = String(value).trim();
    if (!str || str === '-') return false;
    const num = Number(str);
    return Number.isFinite(num) && num > 0;
  };

  const getOddsButtonClass = (oddsType) => {
    const isAnimated = animatedOdds.oddsType === oddsType;
    const isUp = animatedOdds.direction === 'up';
    
    return `w-full h-14 bg-slate-800 border-slate-700 hover:bg-emerald-600/20 hover:border-emerald-600/50 flex flex-col transition-all ${
      isAnimated ? (isUp ? 'bg-emerald-900/30' : 'bg-red-900/30') : ''
    }`;
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Home Odds */}
      <div className="relative">
        <StyledButton
          variant="secondary"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            onOddsClick('home', odds.home, '1');
          }}
          disabled={!isValidOdd(odds.home)}
          className={getOddsButtonClass('home')}
        >
          <span className="text-gray-400 text-xs">1</span>
          <span className="text-emerald-400 font-bold">{odds.home}</span>
        </StyledButton>
        {animatedOdds.oddsType === 'home' && (
          <TrendingUp
            className={`absolute top-1 left-1 w-3 h-3 ${
              animatedOdds.direction === 'up' ? 'text-emerald-500' : 'text-red-500 rotate-180'
            }`}
          />
        )}
      </div>

      {/* Draw Odds (if available) */}
      {isValidOdd(odds.draw) && (
        <div>
          <StyledButton
            variant="secondary"
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              onOddsClick('draw', odds.draw, 'X');
            }}
            disabled={!isValidOdd(odds.draw)}
            className="w-full h-14 bg-slate-800 border-slate-700 hover:bg-slate-700 flex flex-col"
          >
            <span className="text-gray-400 text-xs">X</span>
            <span className="text-gray-300 font-bold">{odds.draw}</span>
          </StyledButton>
        </div>
      )}

      {/* Away Odds */}
      <div className={isValidOdd(odds.draw) ? '' : 'col-span-2'}>
        <StyledButton
          variant="secondary"
          size="md"
          onClick={(e) => {
            e.stopPropagation();
            onOddsClick('away', odds.away, '2');
          }}
          disabled={!isValidOdd(odds.away)}
          className={getOddsButtonClass('away')}
        >
          <span className="text-gray-400 text-xs">2</span>
          <span className="text-emerald-400 font-bold">{odds.away}</span>
        </StyledButton>
      </div>
    </div>
  );
}
