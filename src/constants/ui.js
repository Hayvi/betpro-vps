export const TOAST_STYLES = {
  SUCCESS: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    direction: 'rtl',
  },
  ERROR: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    direction: 'rtl',
  },
  WARNING: {
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    direction: 'rtl',
  },
  INFO: {
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    direction: 'rtl',
  },
};

export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 4000,
  EXTRA_LONG: 5000,
};

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  EXTRA_SLOW: 1000,
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

export const GRID_SIZES = {
  NORMAL: 'normal',
  SMALL: 'small',
  LARGE: 'large',
};

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const SPORTS_ICONS = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  TENNIS: '🎾',
  HOCKEY: '🏒',
  BASEBALL: '⚾',
  VOLLEYBALL: '🏐',
  DEFAULT: '🏆',
};

export const CATEGORY_ICONS = {
  SLOTS: '🎰',
  ROULETTE: '🎡',
  BLACKJACK: '🃏',
  POKER: '♠️',
  BINGO: '🎲',
  DEFAULT: '🎮',
};

export const STATUS_COLORS = {
  SUCCESS: 'bg-green-500/20 text-green-400',
  ERROR: 'bg-red-500/20 text-red-400',
  WARNING: 'bg-yellow-500/20 text-yellow-400',
  INFO: 'bg-blue-500/20 text-blue-400',
  PENDING: 'bg-gray-500/20 text-gray-400',
};

export const ODDS_LIMITS = {
  MIN: 1.01,
  MAX: 1000,
};

export const STAKE_LIMITS = {
  MIN: 1,
  MAX: 100000,
};

export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  FILTER: 500,
  RESIZE: 200,
};

export const Z_INDEX = {
  DROPDOWN: 10,
  STICKY: 20,
  FIXED: 30,
  MODAL_BACKDROP: 40,
  MODAL: 50,
  TOOLTIP: 60,
  NOTIFICATION: 70,
};

export default {
  TOAST_STYLES,
  TOAST_DURATION,
  ANIMATION_DURATION,
  BREAKPOINTS,
  GRID_SIZES,
  LOADING_STATES,
  PAGINATION,
  SPORTS_ICONS,
  CATEGORY_ICONS,
  STATUS_COLORS,
  ODDS_LIMITS,
  STAKE_LIMITS,
  DEBOUNCE_DELAY,
  Z_INDEX,
};
