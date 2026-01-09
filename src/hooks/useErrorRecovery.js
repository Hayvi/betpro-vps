import { useCallback, useRef } from 'react';
import { logger } from '@/services/logger';


export const useErrorRecovery = () => {
  const recoveryStrategiesRef = useRef(new Map());

  
  const withFallback = useCallback(async (fn, fallbackValue, context = 'withFallback') => {
    try {
      return await fn();
    } catch (error) {
      logger.warn(`Using fallback for ${context}`, { error: error.message });
      return fallbackValue;
    }
  }, []);

  
  const withRetry = useCallback(async (fn, options = {}) => {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 2,
      context = 'withRetry',
    } = options;

    let lastError;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts - 1) {
          const waitTime = delay * Math.pow(backoff, attempt);
          logger.warn(`Retry attempt ${attempt + 1}/${maxAttempts} for ${context} after ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    throw lastError;
  }, []);

  
  const registerStrategy = useCallback((errorType, strategy) => {
    recoveryStrategiesRef.current.set(errorType, strategy);
    logger.debug(`Recovery strategy registered: ${errorType}`);
  }, []);

  
  const executeStrategy = useCallback(async (error, errorType) => {
    const strategy = recoveryStrategiesRef.current.get(errorType);

    if (!strategy) {
      logger.warn(`No recovery strategy found for: ${errorType}`);
      throw error;
    }

    try {
      logger.info(`Executing recovery strategy for: ${errorType}`);
      return await strategy(error);
    } catch (recoveryError) {
      logger.error(`Recovery strategy failed for: ${errorType}`, recoveryError);
      throw recoveryError;
    }
  }, []);

  
  const getStrategies = useCallback(() => {
    return Object.fromEntries(recoveryStrategiesRef.current);
  }, []);

  
  const clearStrategies = useCallback(() => {
    recoveryStrategiesRef.current.clear();
    logger.info('All recovery strategies cleared');
  }, []);

  return {
    withFallback,
    withRetry,
    registerStrategy,
    executeStrategy,
    getStrategies,
    clearStrategies,
  };
};

export default useErrorRecovery;
