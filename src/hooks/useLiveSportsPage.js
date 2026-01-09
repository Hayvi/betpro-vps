import { useState, useMemo } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useBetActions } from '@/hooks/useBetActions';
import { useI18n } from '@/contexts/I18nContext';

export function useLiveSportsPage() {
  const [selectedSport, setSelectedSport] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [animatedOdds, setAnimatedOdds] = useState({});
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedSportGroup, setSelectedSportGroup] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [selectedMobileSport, setSelectedMobileSport] = useState(null);
  const [selectedMobileCountry, setSelectedMobileCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const { showError } = useToast();
  const { placeLiveBet } = useBetActions();
  const { t } = useI18n();

  // Placeholder: no sports data source configured
  const sportGroups = [];
  const countries = [];
  const mobileSports = [];
  const mobileCountries = [];

  const liveSports = useMemo(() => {
    return [
      { key: 'all', name: t('liveSports_allSportsLabel'), icon: '🏆', id: 'all', count: 0 },
    ];
  }, [t]);

  const filteredMatches = useMemo(() => {
    return [];
  }, []);

  const handleBetClick = (match, betTypeOrMarketKey, odds, betLabel) => {
    const inferredMainMarketKey =
      match?.odds?.draw && String(match.odds.draw).trim() !== '-' ? 'h2h_3_way' : 'h2h';

    const isMainSelection =
      typeof betTypeOrMarketKey === 'string' &&
      ['home', 'away', 'draw', '1', '2', 'X'].includes(betTypeOrMarketKey);

    const marketKey = isMainSelection
      ? inferredMainMarketKey
      : typeof betTypeOrMarketKey === 'string'
        ? betTypeOrMarketKey
        : inferredMainMarketKey;

    placeLiveBet(match, odds, betLabel, marketKey);
  };

  const handleSportGroupSelect = (groupName) => {
    setSelectedSportGroup(groupName);
  };

  const handleCountryToggle = (countryId) => {
    setExpandedCountry((prev) => (prev === countryId ? null : countryId));
  };

  const handleLeagueSelect = (league) => {
    if (!league?.id) return;
    if (league.id === selectedSport) return;
    setSelectedSport(league.id);
  };

  const handleMobileSportSelect = (sportKey) => {
    setSelectedMobileSport(sportKey);
  };

  const handleMobileCountrySelect = (countryId) => {
    setSelectedMobileCountry(countryId);
  };

  const selectedLeagueName = '';

  return {
    selectedSport,
    setSelectedSport,
    searchQuery,
    setSearchQuery,
    animatedOdds,
    liveMatches,
    liveSports,
    filteredMatches,
    isLoading,
    fetchError,
    handleBetClick,
    sportGroups,
    selectedSportGroup,
    handleSportGroupSelect,
    countries,
    expandedCountry,
    handleCountryToggle,
    handleLeagueSelect,
    mobileSports,
    selectedMobileSport,
    handleMobileSportSelect,
    mobileCountries,
    selectedMobileCountry,
    handleMobileCountrySelect,
    selectedLeagueName,
  };
}
