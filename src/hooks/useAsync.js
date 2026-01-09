import { useState, useCallback, useRef, useEffect } from 'react';
import { logger } from '@/services/logger';
import { handleError } from '@/services/errorHandler';


export const useAsync = (asyncFunction, immediate = true, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    onFinally = null,
    context = 'useAsync',
  } = options;

  const [state, setState] = useState({
    data: null,
    loading: immediate,
    error: null,
  });

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  
  const execute = useCallback(async (...args) => {
    setState({ data: null, loading: true, error: null });
    logger.debug(`Executing async operation: ${context}`);

    try {
      const response = await asyncFunction(...args);

      if (isMountedRef.current) {
        setState({ data: response, loading: false, error: null });
        logger.debug(`Async operation succeeded: ${context}`, { data: response });

        if (onSuccess) {
          onSuccess(response);
        }
      }

      return response;
    } catch (error) {
      const normalized = handleError(error, context);

      if (isMountedRef.current) {
        setState({ data: null, loading: false, error: normalized });
        logger.error(`Async operation failed: ${context}`, error, { context });

        if (onError) {
          onError(normalized);
        }
      }

      throw normalized;
    } finally {
      if (isMountedRef.current && onFinally) {
        onFinally();
      }
    }
  }, [asyncFunction, context, onSuccess, onError, onFinally]);

  
  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    logger.debug(`Reset async state: ${context}`);
  }, [context]);

  
  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
};

export default useAsync;
