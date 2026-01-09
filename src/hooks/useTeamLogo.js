import { useState, useEffect } from 'react';
import { getTeamLogo, getCachedLogo } from '@/services/teamLogoService';

export function useTeamLogo(teamName, options = {}) {
  const enabled = options?.enabled !== false;
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLogo(null);
      setLoading(false);
      return;
    }

    if (!teamName) {
      setLoading(false);
      return;
    }

    // Check cache first (sync)
    const cached = getCachedLogo(teamName);
    if (cached) {
      setLogo(cached);
      setLoading(false);
      return;
    }

    // Fetch from API
    setLoading(true);
    let mounted = true;

    getTeamLogo(teamName).then((url) => {
      if (mounted) {
        setLogo(url);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [enabled, teamName]);

  return { logo, loading };
}

export function useMatchLogos(homeTeam, awayTeam, options = {}) {
  const home = useTeamLogo(homeTeam, options);
  const away = useTeamLogo(awayTeam, options);

  return {
    homeLogo: home.logo,
    awayLogo: away.logo,
    loading: home.loading || away.loading,
  };
}
