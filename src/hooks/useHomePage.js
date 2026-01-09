import { useToast } from '@/contexts/ToastContext';
import { useFetch } from '@/hooks';
import { CACHE_KEYS } from '@/constants/api';
import { apiService } from '@/services/apiClient';
import { logger } from '@/services/logger';
import { useI18n } from '@/contexts/I18nContext';


export function useHomePage() {
  const { showError } = useToast();
  const { t } = useI18n();

  // Fetch popular games
  const {
    data: popularGames = [],
    loading: gamesLoading,
    error: gamesError,
  } = useFetch(() => apiService.home.getGames(), {
    cacheKey: CACHE_KEYS.HOME_GAMES,
    transform: (data) => (Array.isArray(data) ? data : []),
    context: 'Home/getGames',
    onError: (error) => {
      logger.error('Failed to fetch popular games', error);
      showError(t('home_popularLoadError'));
    },
  });

  // Fetch top wins and jackpot winners
  const {
    data: topWins = [],
    loading: winsLoading,
    error: winsError,
  } = useFetch(() => apiService.home.getTopWins(), {
    cacheKey: CACHE_KEYS.HOME_TOP_WINS,
    transform: (wins) => {
      if (!wins || !Array.isArray(wins)) return [];
      return wins.slice(0, 5);
    },
    context: 'Home/getTopWins',
    onSuccess: (wins) => {
      logger.debug('Top wins fetched', { count: wins?.length || 0 });
    },
    onError: (error) => {
      logger.error('Failed to fetch top wins', error);
      showError(t('home_topWinsLoadError'));
    },
  });

  const isLoading = gamesLoading || winsLoading;
  const hasError = gamesError || winsError;

  return {
    popularGames,
    topWins,
    isLoading,
    hasError,
  };
}
