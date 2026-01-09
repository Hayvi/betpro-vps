import { safeSetItem, safeGetItem } from './localStorageService.js';

const THESPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const CACHE_KEY = 'betpro_team_logos';
const NEGATIVE_CACHE_KEY = 'betpro_team_logo_misses_v3';
const LEAGUE_CACHE_KEY = 'betpro_league_logos';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
const NEGATIVE_CACHE_EXPIRY = 24 * 60 * 60 * 1000;
const MAX_CONCURRENT_TEAM_SEARCHES = 2;
const RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000;

// PERFORMANCE FIX: Add cache size limits to prevent unbounded growth
const MAX_LOGO_CACHE_SIZE = 1000;
const MAX_NEGATIVE_CACHE_SIZE = 500;
const MAX_LEAGUE_CACHE_SIZE = 100;
const MAX_QUEUE_SIZE = 50;
const MAX_IN_FLIGHT_REQUESTS = 100;

// League ID mappings (Odds API key -> TheSportsDB league ID)
const LEAGUE_IDS = {
  soccer_epl: 4328, // English Premier League
  soccer_spain_la_liga: 4335, // La Liga
  soccer_germany_bundesliga: 4331, // Bundesliga
  soccer_italy_serie_a: 4332, // Serie A
  soccer_france_ligue_one: 4334, // Ligue 1
  soccer_uefa_champs_league: 4480, // UEFA Champions League
  basketball_nba: 4387, // NBA
};

// Load cache from localStorage
function loadCache() {
  try {
    const stored = safeGetItem(CACHE_KEY);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return new Map(Object.entries(data));
      }
    }
  } catch (e) {
    console.warn('Failed to load logo cache:', e);
  }
  return new Map();
}

// PERFORMANCE FIX: Enforce cache size limits with LRU eviction
function enforceCacheLimit(cache, maxSize) {
  if (cache.size <= maxSize) return;
  
  // Convert to array to get insertion order (Map maintains insertion order)
  const entries = Array.from(cache.entries());
  
  // Remove oldest entries (first inserted) until we're under the limit
  const toRemove = cache.size - maxSize;
  for (let i = 0; i < toRemove; i++) {
    cache.delete(entries[i][0]);
  }
}

// Save cache to localStorage
function saveCache(cache) {
  try {
    // Enforce size limit before saving
    enforceCacheLimit(cache, MAX_LOGO_CACHE_SIZE);
    
    const data = Object.fromEntries(cache);
    const success = safeSetItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    if (!success) {
      console.warn('Failed to save logo cache due to storage limits');
    }
  } catch (e) {
    console.warn('Failed to save logo cache:', e);
  }
}

function loadNegativeCache() {
  try {
    const stored = safeGetItem(NEGATIVE_CACHE_KEY);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < NEGATIVE_CACHE_EXPIRY) {
        return new Map(Object.entries(data));
      }
    }
  } catch (e) {
    console.warn('Failed to load negative logo cache:', e);
  }
  return new Map();
}

function saveNegativeCache(cache) {
  try {
    // Enforce size limit before saving
    enforceCacheLimit(cache, MAX_NEGATIVE_CACHE_SIZE);
    
    const data = Object.fromEntries(cache);
    const success = safeSetItem(
      NEGATIVE_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
    if (!success) {
      console.warn('Failed to save negative logo cache due to storage limits');
    }
  } catch (e) {
    console.warn('Failed to save negative logo cache:', e);
  }
}

// Persistent cache
const logoCache = loadCache();
const negativeLogoCache = loadNegativeCache();

const inFlightTeamLogoRequests = new Map();
let activeTeamSearches = 0;
const teamSearchQueue = [];
let rateLimitUntil = 0;

function normalizeLogoUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://')) return `https://${trimmed.slice('http://'.length)}`;
  return trimmed;
}

async function withTeamSearchSlot(fn) {
  // PERFORMANCE FIX: Prevent queue overflow
  if (teamSearchQueue.length >= MAX_QUEUE_SIZE) {
    throw new Error('Team search queue is full, please try again later');
  }
  
  while (activeTeamSearches >= MAX_CONCURRENT_TEAM_SEARCHES) {
    await new Promise((resolve) => teamSearchQueue.push(resolve));
  }

  activeTeamSearches += 1;
  try {
    return await fn();
  } finally {
    activeTeamSearches -= 1;
    const next = teamSearchQueue.shift();
    if (next) next();
  }
}

// Common team name mappings (API names -> TheSportsDB names)
const TEAM_NAME_MAPPINGS = {
  // Premier League
  'Manchester United': 'Manchester United',
  'Manchester City': 'Manchester City',
  'Tottenham Hotspur': 'Tottenham Hotspur',
  'West Ham United': 'West Ham United',
  'Wolverhampton Wanderers': 'Wolverhampton Wanderers',
  'Brighton and Hove Albion': 'Brighton',
  'Nottingham Forest': 'Nottingham Forest',
  'Newcastle United': 'Newcastle United',
  'Leicester City': 'Leicester City',
  'AFC Bournemouth': 'Bournemouth',
  'Leeds United': 'Leeds United',
  'Crystal Palace': 'Crystal Palace',
  'Aston Villa': 'Aston Villa',
  'Brentford': 'Brentford',
  'Fulham': 'Fulham',
  'Everton': 'Everton',
  'Ipswich Town': 'Ipswich Town',
  'Southampton': 'Southampton',
  // La Liga
  'Atletico Madrid': 'Atletico Madrid',
  'Athletic Bilbao': 'Athletic Bilbao',
  'Real Betis': 'Real Betis',
  'Real Madrid': 'Real Madrid',
  'Barcelona': 'Barcelona',
  'Sevilla': 'Sevilla',
  'Valencia': 'Valencia',
  'Villarreal': 'Villarreal',
  // Bundesliga
  'Borussia Dortmund': 'Borussia Dortmund',
  'Borussia Monchengladbach': 'Borussia Monchengladbach',
  'RB Leipzig': 'RB Leipzig',
  'Bayern Munich': 'Bayern Munich',
  'Bayer Leverkusen': 'Bayer Leverkusen',
  // Serie A
  'AC Milan': 'AC Milan',
  'Inter Milan': 'Inter Milan',
  'Juventus': 'Juventus',
  'AS Roma': 'AS Roma',
  'Napoli': 'Napoli',
  'Lazio': 'Lazio',
  // Ligue 1
  'Paris Saint Germain': 'Paris Saint-Germain',
  'Paris Saint-Germain': 'Paris Saint-Germain',
  'Olympique Marseille': 'Marseille',
  'Olympique Lyon': 'Lyon',
  'Monaco': 'AS Monaco',
  'Lille': 'Lille',
  'Leuven': 'Oud-Heverlee Leuven',
  'SKN St. Pölten': 'SKN St. Polten',
};

function normalizeTeamName(name) {
  return TEAM_NAME_MAPPINGS[name] || name;
}

function stripDiacritics(value) {
  if (typeof value !== 'string') return '';
  try {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch {
    return value;
  }
}

function normalizeSearchTerm(value) {
  if (typeof value !== 'string') return '';
  return stripDiacritics(value)
    .replace(/['’`]/g, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripCommonPrefix(value) {
  if (typeof value !== 'string') return '';
  const parts = value.trim().split(/\s+/);
  if (parts.length <= 1) return value;
  const first = parts[0].toUpperCase();
  if (
    first === 'FC' ||
    first === 'CF' ||
    first === 'SC' ||
    first === 'AS' ||
    first === 'AC' ||
    first === 'AFC' ||
    first === 'SV' ||
    first === 'TSG' ||
    first === 'VFB' ||
    first === 'VFL' ||
    first === 'FK' ||
    first === 'NK' ||
    first === 'SK'
  ) {
    return parts.slice(1).join(' ');
  }
  return value;
}

function stripLeadingOrdinal(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed
    .replace(/^\d+\.(?=\s)/, '')
    .replace(/^\d+\s+(?=\S)/, '')
    .trim();
}

function stripTrailingYears(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\b(18|19|20)\d{2}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSearchCandidates(teamName) {
  const candidates = [];
  const original = typeof teamName === 'string' ? teamName.trim() : '';
  if (!original) return candidates;

  const mapped = normalizeTeamName(original);

  const add = (val) => {
    if (typeof val !== 'string') return;
    const cleaned = val.trim();
    if (!cleaned) return;
    if (!candidates.includes(cleaned)) candidates.push(cleaned);
  };

  add(mapped);
  add(original);

  const noOrdinalMapped = stripLeadingOrdinal(mapped);
  const noOrdinalOriginal = stripLeadingOrdinal(original);
  add(noOrdinalMapped);
  add(noOrdinalOriginal);

  const noYearsMapped = stripTrailingYears(mapped);
  const noYearsOriginal = stripTrailingYears(original);
  add(noYearsMapped);
  add(noYearsOriginal);

  add(stripTrailingYears(noOrdinalMapped));
  add(stripTrailingYears(noOrdinalOriginal));

  add(normalizeSearchTerm(mapped));
  add(normalizeSearchTerm(original));

  add(stripCommonPrefix(mapped));
  add(stripCommonPrefix(original));
  add(stripCommonPrefix(noOrdinalMapped));
  add(stripCommonPrefix(noOrdinalOriginal));
  add(stripCommonPrefix(noYearsMapped));
  add(stripCommonPrefix(noYearsOriginal));
  add(normalizeSearchTerm(stripCommonPrefix(mapped)));
  add(normalizeSearchTerm(stripCommonPrefix(original)));
  add(normalizeSearchTerm(stripCommonPrefix(noOrdinalMapped)));
  add(normalizeSearchTerm(stripCommonPrefix(noOrdinalOriginal)));
  add(normalizeSearchTerm(stripCommonPrefix(noYearsMapped)));
  add(normalizeSearchTerm(stripCommonPrefix(noYearsOriginal)));

  if (original.includes(' ')) {
    const firstWord = original.split(' ')[0];
    if (firstWord.length > 3) add(firstWord);
  }
  if (mapped.includes(' ')) {
    const firstWord = mapped.split(' ')[0];
    if (firstWord.length > 3) add(firstWord);
  }

  return candidates;
}

function normalizeComparableName(value) {
  const normalized = normalizeSearchTerm(stripCommonPrefix(normalizeTeamName(value || '')));
  return normalized.toLowerCase();
}

async function searchTeamLogo(searchTerm) {
  if (Date.now() < rateLimitUntil) return { logo: null, rateLimited: true };

  const encoded = encodeURIComponent(searchTerm);
  
  // PERFORMANCE FIX #7: Add request timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const response = await withTeamSearchSlot(() =>
      fetch(`${THESPORTSDB_BASE}/searchteams.php?t=${encoded}`, {
        signal: controller.signal
      })
    );

    clearTimeout(timeoutId);

    if (response.status === 429) {
      const retryAfterRaw = response.headers?.get?.('retry-after');
      const retryAfterSeconds = retryAfterRaw ? Number(retryAfterRaw) : NaN;
      const cooldownMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? retryAfterSeconds * 1000
        : RATE_LIMIT_COOLDOWN_MS;

      rateLimitUntil = Date.now() + cooldownMs;
      return { logo: null, rateLimited: true };
    }

    if (!response.ok) return { logo: null, rateLimited: false };

    const data = await response.json().catch(() => null);

    const teams = Array.isArray(data?.teams) ? data.teams : [];
    if (teams.length === 0) return { logo: null, rateLimited: false };

    const queryName = normalizeComparableName(searchTerm);
    let bestLogo = null;
    let bestScore = -1;

    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const rawName = team?.strTeam || team?.strTeamShort || team?.strAlternate || '';
      const candidateLogo = normalizeLogoUrl(team?.strBadge || team?.strTeamBadge || null);
      if (!candidateLogo) continue;

      const candidateName = normalizeComparableName(rawName);
      let score = 0;

      score += 10;

      const sport = String(team?.strSport || '').toLowerCase();
      if (sport === 'soccer' || sport === 'basketball') {
        score += 6;
      } else if (sport) {
        score -= 2;
      }

      if (candidateName === queryName) {
        score += 25;
      } else if (candidateName && queryName && (candidateName.includes(queryName) || queryName.includes(candidateName))) {
        score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestLogo = candidateLogo;
      }
    }

    return { logo: bestLogo, rateLimited: false };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn('Team logo search timeout for:', searchTerm);
      return { logo: null, rateLimited: false };
    }
    
    console.warn('Team logo search error for:', searchTerm, error);
    return { logo: null, rateLimited: false };
  }
}

export async function getTeamLogo(teamName) {
  if (!teamName) return null;

  // Check cache first
  if (logoCache.has(teamName)) {
    const cached = logoCache.get(teamName);
    // Don't return cached null - retry fetching
    if (cached !== null) {
      const normalizedCached = normalizeLogoUrl(cached);
      if (normalizedCached && normalizedCached !== cached) {
        logoCache.set(teamName, normalizedCached);
        saveCache(logoCache);
      }
      return normalizedCached;
    }
  }

  const missAtRaw = negativeLogoCache.get(teamName);
  const missAt = missAtRaw ? Number(missAtRaw) : null;
  if (missAt && Date.now() - missAt < NEGATIVE_CACHE_EXPIRY) {
    return null;
  }

  if (inFlightTeamLogoRequests.has(teamName)) {
    return inFlightTeamLogoRequests.get(teamName);
  }

  // PERFORMANCE FIX: Prevent unbounded in-flight request growth
  if (inFlightTeamLogoRequests.size >= MAX_IN_FLIGHT_REQUESTS) {
    console.warn('Too many in-flight logo requests, rejecting new request for:', teamName);
    return null;
  }

  const requestPromise = (async () => {
    try {
      const attemptLookup = async () => {
        let sawRateLimit = false;
        const candidates = generateSearchCandidates(teamName);
        let logo = null;

        for (let i = 0; i < candidates.length; i++) {
          const candidate = candidates[i];
          const result = await searchTeamLogo(candidate);
          if (result?.rateLimited) {
            sawRateLimit = true;
            break;
          }
          if (result?.logo) {
            logo = result.logo;
            break;
          }
        }

        return { logo, sawRateLimit };
      };

      let { logo, sawRateLimit } = await attemptLookup();

      if (!logo && sawRateLimit) {
        const waitMs = Math.max(0, rateLimitUntil - Date.now()) + 250;
        if (waitMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
        ({ logo, sawRateLimit } = await attemptLookup());
      }

      // Only cache successful results
      if (logo) {
        logoCache.set(teamName, logo);
        saveCache(logoCache);
        return logo;
      }

      if (!sawRateLimit) {
        negativeLogoCache.set(teamName, String(Date.now()));
        saveNegativeCache(negativeLogoCache);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching logo for ${teamName}:`, error);
      negativeLogoCache.set(teamName, String(Date.now()));
      saveNegativeCache(negativeLogoCache);
      return null;
    } finally {
      // PERFORMANCE FIX: Always cleanup in-flight requests, even on errors
      inFlightTeamLogoRequests.delete(teamName);
    }
  })();

  inFlightTeamLogoRequests.set(teamName, requestPromise);

  return requestPromise;
}

export function invalidateCachedLogo(teamName) {
  if (!teamName) return;
  try {
    logoCache.delete(teamName);
    saveCache(logoCache);

    negativeLogoCache.delete(teamName);
    saveNegativeCache(negativeLogoCache);
  } catch {
    return;
  }
}

export async function getMatchLogos(homeTeam, awayTeam) {
  const [homeLogo, awayLogo] = await Promise.all([
    getTeamLogo(homeTeam),
    getTeamLogo(awayTeam),
  ]);

  return { homeLogo, awayLogo };
}

// Prefetch logos for multiple matches
export async function prefetchLogos(matches) {
  if (!matches || !Array.isArray(matches)) return;

  const teamNames = new Set();
  matches.forEach((match) => {
    if (match.home?.name) teamNames.add(match.home.name);
    if (match.away?.name) teamNames.add(match.away.name);
  });

  // Fetch all logos in parallel (with limit to avoid rate limiting)
  const names = Array.from(teamNames);
  const batchSize = 5;

  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    await Promise.all(batch.map(getTeamLogo));
  }
}

// Get cached logo (sync, returns undefined if not cached)
export function getCachedLogo(teamName) {
  return logoCache.get(teamName);
}

// ============ LEAGUE LOGOS ============

// Load league cache from localStorage
function loadLeagueCache() {
  try {
    const stored = safeGetItem(LEAGUE_CACHE_KEY);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return new Map(Object.entries(data));
      }
    }
  } catch (e) {
    console.warn('Failed to load league cache:', e);
  }
  return new Map();
}

// Save league cache to localStorage
function saveLeagueCache(cache) {
  try {
    // Enforce size limit before saving
    enforceCacheLimit(cache, MAX_LEAGUE_CACHE_SIZE);
    
    const data = Object.fromEntries(cache);
    const success = safeSetItem(
      LEAGUE_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
    if (!success) {
      console.warn('Failed to save league cache due to storage limits');
    }
  } catch (e) {
    console.warn('Failed to save league cache:', e);
  }
}

const leagueCache = loadLeagueCache();

export async function getLeagueLogo(leagueKey) {
  if (!leagueKey) return null;

  // Check cache first
  if (leagueCache.has(leagueKey)) {
    const cached = leagueCache.get(leagueKey);
    if (cached !== null) {
      return cached;
    }
  }

  const leagueId = LEAGUE_IDS[leagueKey];
  if (!leagueId) return null;

  try {
    // PERFORMANCE FIX #7: Add request timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`${THESPORTSDB_BASE}/lookupleague.php?id=${leagueId}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    const data = await response.json();
    const league = data?.leagues?.[0];
    const logo = league?.strBadge || league?.strLogo || null;

    if (logo) {
      leagueCache.set(leagueKey, logo);
      saveLeagueCache(leagueCache);
    }

    return logo;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('League logo fetch timeout for:', leagueKey);
      return null;
    }
    console.error(`Error fetching league logo for ${leagueKey}:`, error);
    return null;
  }
}

export function getCachedLeagueLogo(leagueKey) {
  return leagueCache.get(leagueKey);
}

export default {
  getTeamLogo,
  getMatchLogos,
  prefetchLogos,
  getCachedLogo,
  getLeagueLogo,
  getCachedLeagueLogo,
};
