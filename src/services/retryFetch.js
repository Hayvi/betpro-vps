import { logger } from './logger';

export const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};


const getBackoffDelay = (attempt) => {
  const delay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelay
  );
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay;
  return delay + jitter;
};


export const retryFetch = async (fetchFn, context = 'retryFetch') => {
  let lastError;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      const isRetryable = RETRY_CONFIG.retryableStatusCodes.includes(error.status) ||
                         error.name === 'NetworkError' ||
                         error.message === 'Failed to fetch';
      
      if (attempt < RETRY_CONFIG.maxRetries && isRetryable) {
        const delay = getBackoffDelay(attempt);
        logger.warn(`Retry attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries} for ${context} after ${delay}ms`, { error: error.message });
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }
  
  throw lastError;
};

export default retryFetch;
