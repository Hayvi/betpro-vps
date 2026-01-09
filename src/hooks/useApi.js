import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { logger } from '@/services/logger';
import { handleApiError } from '@/services/errorHandler';


export const useApi = (apiFunction, options = {}) => {
  const {
    immediate = true,
    endpoint = 'unknown',
    method = 'GET',
    context = 'useApi',
    onSuccess = null,
    onError = null,
    onFinally = null,
  } = options;

  // Wrap the API function with error handling
  const wrappedFunction = useCallback(async (...args) => {
    logger.apiRequest(method, endpoint, { args });

    try {
      const startTime = performance.now();
      const response = await apiFunction(...args);
      const duration = performance.now() - startTime;

      logger.apiResponse(method, endpoint, 200, { duration });
      logger.performance(`API: ${method} ${endpoint}`, duration);

      return response;
    } catch (error) {
      const normalized = handleApiError(error, endpoint, method);
      throw normalized;
    }
  }, [apiFunction, endpoint, method]);

  // Use useAsync for state management
  const asyncState = useAsync(wrappedFunction, immediate, {
    context,
    onSuccess,
    onError,
    onFinally,
  });

  return asyncState;
};

export default useApi;
