import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { useBetActions } from '@/hooks/useBetActions';
import { apiService } from '@/services/apiClient';
import { useI18n } from '@/contexts/I18nContext';

export function useSportsPage() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('prematch');
  const [selectedSport, setSelectedSport] = useState(null);
  const [selectedSportGroup, setSelectedSportGroup] = useState(null);
  const [expandedCountry, setExpandedCountry] = useState(null);
  const [selectedMobileSport, setSelectedMobileSport] = useState(null);
  const [selectedMobileCountry, setSelectedMobileCountry] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const { showError } = useToast();
  const { placePrematchBet } = useBetActions();

  // Placeholder: no sports data source configured
  const sportsConfig = [];
  const allMatches = {};

  const sportGroups = useMemo(() => {
    return [];
  }, []);

  const mobileSports = useMemo(() => {
    return [];
  }, []);

  const countries = useMemo(() => {
    return [];
  }, []);

  const mobileCountries = useMemo(() => {
    return [];
  }, []);

  const selectedLeague = selectedSport;
  const selectedLeagueName = '';

  const filteredMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return [];
    return matches;
  }, [matches]);

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

    placePrematchBet(match, odds, betLabel, marketKey);
  };

  const handleLeagueSelect = (league) => {
    if (!league?.id) return;
    if (league.id === selectedSport) return;
    setMatches([]);
    setFetchError(null);
    setIsLoading(true);
    setSelectedSport(league.id);
  };

  const handleSportGroupSelect = (groupName) => {
    setSelectedSportGroup(groupName);
  };

  const handleMobileSportSelect = (sportKey) => {
    setSelectedMobileSport(sportKey);
  };

  const handleCountryToggle = (countryId) => {
    setExpandedCountry(expandedCountry === countryId ? null : countryId);
  };

  const handleCountrySelect = (countryId) => {
    setExpandedCountry(countryId);
  };

  const handleMobileCountrySelect = (countryId) => {
    setSelectedMobileCountry(countryId);
  };

  return {
    activeTab,
    setActiveTab,
    mobileSports,
    selectedMobileSport,
    handleMobileSportSelect,
    mobileCountries,
    selectedMobileCountry,
    handleMobileCountrySelect,
    sportGroups,
    selectedSportGroup,
    handleSportGroupSelect,
    expandedCountry,
    selectedLeague,
    selectedLeagueName,
    countries,
    liveCount: 0,
    prematchCount: 0,
    matches,
    filteredMatches,
    isLoading,
    fetchError,
    handleBetClick,
    handleLeagueSelect,
    handleCountryToggle,
    handleCountrySelect,
  };
}
