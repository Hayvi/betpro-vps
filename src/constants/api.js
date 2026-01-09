export const API_ENDPOINTS = {
  // User endpoints
  USER: {
    BALANCE: 'users/balance',
    PROFILE: 'users/profile',
    UPDATE_BALANCE: 'users/balance/update',
  },

  // Home page endpoints
  HOME: {
    GAMES: 'games/popular',
    LIVE_GAMES: 'games/live',
    TOP_WINS: 'bets/top-wins',
  },

  // Sports endpoints
  SPORTS: {
    UPCOMING: 'matches/upcoming',
    LIVE: 'matches/live',
    BY_LEAGUE: 'matches/league/:leagueId',
  },

  // Casino endpoints
  CASINO: {
    GAMES: 'games/casino',
    BY_CATEGORY: 'games/category/:categoryId',
    BY_PROVIDER: 'games/provider/:providerId',
  },

  // Betting endpoints
  BETS: {
    PLACE: 'bets/place',
    HISTORY: 'bets/history',
    CANCEL: 'bets/:betId/cancel',
  },

  // Authentication endpoints
  AUTH: {
    SIGNUP: 'auth/signup',
    SIGNIN: 'auth/signin',
    SIGNOUT: 'auth/signout',
    CURRENT_USER: 'auth/user',
  },
};

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const QUERY_PARAMS = {
  LIMIT: 'limit',
  OFFSET: 'offset',
  SORT: 'sort',
  FILTER: 'filter',
  SEARCH: 'search',
};

export const CACHE_KEYS = {
  SPORTS_UPCOMING: 'sports:upcoming',
  SPORTS_LIVE: 'sports:live',
  CASINO_GAMES: 'casino:games',
  HOME_GAMES: 'home:games',
  HOME_LIVE_GAMES: 'home:live-games',
  HOME_TOP_WINS: 'home:top-wins',
  USER_BALANCE: 'user:balance',
  USER_PROFILE: 'user:profile',
};

export default {
  API_ENDPOINTS,
  API_CONFIG,
  HTTP_METHODS,
  HTTP_STATUS,
  QUERY_PARAMS,
  CACHE_KEYS,
};
