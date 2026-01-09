import { useCallback } from 'react';
import { useBet } from '@/contexts/BetContext';
import { useToast } from '@/contexts/ToastContext';
import { useI18n } from '@/contexts/I18nContext';


export function useBetActions() {
  const { addBet } = useBet();
  const { showError } = useToast();
  const { t } = useI18n();

  const placePrematchBet = useCallback(
    (match, odds, betLabel, marketKey) => {
      try {
        addBet({
          matchId: match.id,
          matchType: 'prematch',
          marketKey,
          league: match.league,
          homeTeam: match.home.name,
          awayTeam: match.away.name,
          score:
            match.home.score !== null
              ? `${match.home.score}-${match.away.score}`
              : null,
          betType: betLabel,
          odds: odds.toString(),
          date: match.date,
          time: match.time,
        });
      } catch (error) {
        showError(error.message || t('betActions_addBetError'));
      }
    },
    [addBet, showError, t]
  );

  const placeLiveBet = useCallback(
    (match, odds, betLabel, marketKey) => {
      try {
        addBet({
          matchId: match.id,
          matchType: 'live',
          marketKey,
          league: match.league,
          homeTeam: match.home.name,
          awayTeam: match.away.name,
          score: `${match.home.score}-${match.away.score}`,
          betType: betLabel,
          odds: odds.toString(),
          minute:
            typeof match.minute === 'number' ? `${match.minute}'` : match.minute,
        });
      } catch (error) {
        showError(error.message || t('betActions_addBetError'));
      }
    },
    [addBet, showError, t]
  );

  return {
    placePrematchBet,
    placeLiveBet,
  };
}
