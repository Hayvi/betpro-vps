import { useState, useEffect } from 'react';
import { getLeagueLogo, getCachedLeagueLogo } from '@/services/teamLogoService';

export function useLeagueLogo(leagueKey) {
  const [logo, setLogo] = useState(() => getCachedLeagueLogo(leagueKey));

  useEffect(() => {
    if (!leagueKey) return;

    // Check cache first
    const cached = getCachedLeagueLogo(leagueKey);
    if (cached) {
      setLogo(cached);
      return;
    }

    // Fetch if not cached
    getLeagueLogo(leagueKey).then((url) => {
      if (url) setLogo(url);
    });
  }, [leagueKey]);

  return logo;
}
