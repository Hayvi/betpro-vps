/**
 * PERFORMANCE FIX #12: Retry Limits with Exponential Backoff
 * Prevents infinite retry loops and implements smart retry strategies
 */

// Default retry configuration
const DEFAULT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,      // 1 second base delay
  maxDelay: 30000,      // 30 seconds max delay
  backoffFactor: 2,     // Exponential backoff multiplier
  jitter: true,         // Add randomization to prevent thundering herd
  retryCondition: (error) => {
    // Default: retry on network errors, timeouts, and 5xx server errors
    if (error.name === 'AbortError') return false; // Don't retry aborted requests
    if (error.message?.includes('timeout')) return true;
    if (error.message?.includes('network')) return true;
    if (error.status >= 500) return true;
    if (error.status === 429) return true; // Rate limit
    return false;
  }
};

/**
 * Execute a function with retry logic and exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {Object} config - Retry configuration
 * @returns {Promise} - The result of the function or final error
 */
export async function withRetry(fn, config = {}) {
  const {
    maxRetries,
    baseDelay,
    maxDelay,
    backoffFactor,
    jitter,
    retryCondition
  } = { ...DEFAULT_CONFIG, ...config };

  let lastError;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const result = await fn(attempt);
      return result;
    } catch (error) {
      lastError = error;
      attempt++;

      // Don't retry if we've exceeded max attempts
      if (attempt > maxRetries) {
        break;
      }

      // Check if we should retry this error
      if (!retryCondition(error)) {
        break;
      }

      // Calculate delay with exponential backoff
      let delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );

      // Add jitter to prevent thundering herd
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted, throw the last error
  throw lastError;
}

/**
 * Retry configuration for different types of operations
 */
export const RETRY_CONFIGS = {
  // Database operations - more aggressive retries
  database: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 10000,
    retryCondition: (error) => {
      if (error.name === 'AbortError') return false;
      if (error.message?.includes('timeout')) return true;
      if (error.message?.includes('connection')) return true;
      if (error.code === 'PGRST301') return true; // PostgREST connection error
      return false;
    }
  },

  // External API calls - conservative retries
  api: {
    maxRetries: 3,
    baseDelay: 2000,
    maxDelay: 30000,
    retryCondition: (error) => {
      if (error.name === 'AbortError') return false;
      if (error.status === 429) return true; // Rate limit
      if (error.status >= 500) return true;  // Server errors
      if (error.message?.includes('timeout')) return true;
      return false;
    }
  },

  // Authentication operations - minimal retries
  auth: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 5000,
    retryCondition: (error) => {
      if (error.name === 'AbortError') return false;
      if (error.status === 401 || error.status === 403) return false; // Don't retry auth failures
      if (error.status >= 500) return true;
      if (error.message?.includes('timeout')) return true;
      return false;
    }
  },

  // Critical operations - no retries (fail fast)
  critical: {
    maxRetries: 0,
    retryCondition: () => false
  },

  // Background operations - patient retries
  background: {
    maxRetries: 10,
    baseDelay: 5000,
    maxDelay: 60000,
    backoffFactor: 1.5,
    retryCondition: (error) => {
      if (error.name === 'AbortError') return false;
      return true; // Retry most errors for background tasks
    }
  }
};

/**
 * Convenience functions for common retry patterns
 */
export function retryDatabaseOperation(fn, customConfig = {}) {
  return withRetry(fn, { ...RETRY_CONFIGS.database, ...customConfig });
}

export function retryApiCall(fn, customConfig = {}) {
  return withRetry(fn, { ...RETRY_CONFIGS.api, ...customConfig });
}

export function retryAuthOperation(fn, customConfig = {}) {
  return withRetry(fn, { ...RETRY_CONFIGS.auth, ...customConfig });
}

export function retryBackgroundTask(fn, customConfig = {}) {
  return withRetry(fn, { ...RETRY_CONFIGS.background, ...customConfig });
}

/**
 * Circuit breaker pattern for failing services
 */
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000; // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 seconds
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= 3) {
          this.state = 'CLOSED';
          this.failureCount = 0;
        }
      } else {
        this.failureCount = Math.max(0, this.failureCount - 1);
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }
      
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Global circuit breakers for different services
export const circuitBreakers = {
  database: new CircuitBreaker({ failureThreshold: 10, resetTimeout: 30000 }),
  api: new CircuitBreaker({ failureThreshold: 5, resetTimeout: 60000 }),
  auth: new CircuitBreaker({ failureThreshold: 3, resetTimeout: 120000 })
};

/**
 * Combine retry logic with circuit breaker
 */
export async function withRetryAndCircuitBreaker(fn, type = 'api', retryConfig = {}) {
  const breaker = circuitBreakers[type];
  const config = { ...RETRY_CONFIGS[type], ...retryConfig };
  
  return breaker.execute(() => withRetry(fn, config));
}

export default {
  withRetry,
  retryDatabaseOperation,
  retryApiCall,
  retryAuthOperation,
  retryBackgroundTask,
  withRetryAndCircuitBreaker,
  circuitBreakers,
  RETRY_CONFIGS
};