export { useAsync } from './useAsync';
export { useFetch, clearCache, clearAllCache, getRetryConfig } from './useFetch';
export { useDebounce } from './useDebounce';
export { useLocalStorage, clearLocalStorage, clearAllLocalStorage } from './useLocalStorage';
export { useApi } from './useApi';
export { usePerformance } from './usePerformance';
export { useErrorRecovery } from './useErrorRecovery';

// Export service utilities
export { clearPendingRequests } from '@/services/deduplicateFetch';

// Re-export existing hooks if they exist
export { useCarousel } from './useCarousel';
export { useScroll } from './useScroll';
