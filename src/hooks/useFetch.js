import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '@/services/logger';
import { handleError } from '@/services/errorHandler';
import { retryFetch, RETRY_CONFIG } from '@/services/retryFetch';
import { deduplicatedFetch } from '@/services/deduplicateFetch';
import { API_CONFIG } from '@/constants/api';
import LRUCache from '@/utils/LRUCache';

// STABILITY FIX: Replace unbounded Map with LRU cache
const cache = new LRUCache(100); // Max 100 entries


const getCachedData = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > API_CONFIG.CACHE_DURATION;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  logger.debug(`Cache hit: ${key}`);
  return cached.data;
};

const setCacheData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  logger.debug(`Cache set: ${key}`, { cacheStats: cache.getStats() });
};



export const useFetch = (fetchFn, options = {}) => {
  const {
    cacheKey = null,
    transform = null,
    skip = false,
    onSuccess = null,
    onError = null,
    context = 'useFetch',
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: !skip,
    error: null,
  });

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  
  const fetchData = useCallback(async () => {
    if (skip) {
      logger.debug(`Skipping fetch: ${context}`);
      return;
    }

    // Check cache first
    if (cacheKey) {
      const cached = getCachedData(cacheKey);
      if (cached) {
        if (isMountedRef.current) {
          setState({ data: cached, loading: false, error: null });
          if (onSuccess) onSuccess(cached);
        }
        return;
      }
    }

    setState({ data: null, loading: true, error: null });
    logger.debug(`Fetching data: ${context}`, { cacheKey });

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      const startTime = performance.now();
      
      // Use deduplication and retry logic
      const response = await deduplicatedFetch(
        cacheKey || context,
        () => retryFetch(fetchFn, context)
      );
      
      const duration = performance.now() - startTime;

      logger.performance(`Fetch: ${context}`, duration);

      // Transform data if transformer provided
      let transformedData = response;
      if (transform && typeof transform === 'function') {
        try {
          transformedData = transform(response || []);
          logger.debug(`Data transformed: ${context}`, { 
            originalLength: response?.length,
            transformedLength: transformedData?.length,
          });
        } catch (transformError) {
          logger.error(`Transform failed: ${context}`, transformError);
          transformedData = response || [];
        }
      }

      // Cache data if cache key provided
      if (cacheKey) {
        setCacheData(cacheKey, transformedData);
      }

      if (isMountedRef.current) {
        setState({ data: transformedData, loading: false, error: null });
        logger.debug(`Fetch succeeded: ${context}`);

        if (onSuccess) {
          onSuccess(transformedData);
        }
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        logger.debug(`Fetch aborted: ${context}`);
        return;
      }

      const normalized = handleError(error, context);

      if (isMountedRef.current) {
        setState({ data: null, loading: false, error: normalized });
        logger.error(`Fetch failed: ${context}`, error);

        if (onError) {
          onError(normalized);
        }
      }
    }
  }, [fetchFn, transform, cacheKey, skip, context, onSuccess, onError]);

  
  const refetch = useCallback(async () => {
    if (cacheKey) {
      cache.delete(cacheKey);
      logger.debug(`Cache cleared: ${cacheKey}`);
    }
    return fetchData();
  }, [fetchData, cacheKey]);

  
  useEffect(() => {
    fetchData();

    return () => {
      isMountedRef.current = false;
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    ...state,
    refetch,
  };
};


export const clearAllCache = () => {
  cache.clear();
  logger.info('All cache cleared');
};

export const clearCache = (key) => {
  cache.delete(key);
  logger.debug(`Cache cleared: ${key}`);
};

// STABILITY FIX: Add cache monitoring
export const getCacheStats = () => {
  return cache.getStats();
};


export const getRetryConfig = () => ({ ...RETRY_CONFIG });

export default useFetch;
