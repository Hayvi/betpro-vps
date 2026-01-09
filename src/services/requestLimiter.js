/**
 * PERFORMANCE FIX #11 & #13: Global Request Limiter with Deduplication
 * Prevents burst traffic from overwhelming browser/server with concurrent requests
 * Includes request deduplication to prevent duplicate operations
 */

// Global request tracking
const activeRequests = new Map();
const requestQueue = [];
const deduplicationCache = new Map(); // PERFORMANCE FIX #13: Request deduplication

// Configuration
const MAX_CONCURRENT_REQUESTS = 20; // Global limit across all request types
const MAX_CONCURRENT_PER_TYPE = {
  'database': 10,     // Supabase database operations
  'api': 8,          // External API calls (TheSportsDB, etc.)
  'auth': 5,         // Authentication operations
  'upload': 3,       // File uploads
  'admin': 5,        // Admin operations
  'default': 6       // Default for unspecified types
};

const REQUEST_TIMEOUT = 30000; // 30 seconds default timeout
const QUEUE_TIMEOUT = 60000;   // 1 minute max queue wait time
const DEDUP_CACHE_TTL = 5000;  // 5 seconds deduplication cache TTL

/**
 * Execute a request with concurrency limiting and deduplication
 * @param {Function} requestFn - The async function to execute
 * @param {Object} options - Configuration options
 * @param {string} options.type - Request type for specific limits
 * @param {number} options.timeout - Request timeout in ms
 * @param {string} options.id - Unique identifier for deduplication
 * @param {boolean} options.deduplicate - Enable request deduplication (default: true)
 * @returns {Promise} - The request result
 */
export async function limitedRequest(requestFn, options = {}) {
  const {
    type = 'default',
    timeout = REQUEST_TIMEOUT,
    id = null,
    deduplicate = true
  } = options;

  // PERFORMANCE FIX #13: Request deduplication
  if (deduplicate && id) {
    // Check if same request is already in flight
    if (activeRequests.has(id)) {
      return activeRequests.get(id).promise;
    }

    // Check deduplication cache for recent results
    const cacheKey = `${type}:${id}`;
    const cached = deduplicationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < DEDUP_CACHE_TTL) {
      if (cached.error) {
        throw cached.error;
      }
      return cached.result;
    }
  }

  const maxForType = MAX_CONCURRENT_PER_TYPE[type] || MAX_CONCURRENT_PER_TYPE.default;
  const currentTypeCount = Array.from(activeRequests.values())
    .filter(req => req.type === type).length;

  // Check if we need to queue the request
  const needsQueuing = 
    activeRequests.size >= MAX_CONCURRENT_REQUESTS ||
    currentTypeCount >= maxForType;

  if (needsQueuing) {
    return new Promise((resolve, reject) => {
      const queueEntry = {
        requestFn,
        options,
        resolve,
        reject,
        queuedAt: Date.now()
      };

      // STABILITY FIX: Add queue timeout enforcement
      const queueTimeout = setTimeout(() => {
        // Remove from queue if still there
        const index = requestQueue.indexOf(queueEntry);
        if (index !== -1) {
          requestQueue.splice(index, 1);
        }
        reject(new Error(`Request queued too long: ${QUEUE_TIMEOUT}ms`));
      }, QUEUE_TIMEOUT);

      queueEntry.queueTimeout = queueTimeout;
      requestQueue.push(queueEntry);

      // Queue timeout
      setTimeout(() => {
        const index = requestQueue.indexOf(queueEntry);
        if (index !== -1) {
          requestQueue.splice(index, 1);
          reject(new Error('Request queue timeout'));
        }
      }, QUEUE_TIMEOUT);
    });
  }

  // Execute the request immediately
  return executeRequest(requestFn, { ...options, type, timeout, id, deduplicate });
}

/**
 * Execute a request with timeout and cleanup
 */
async function executeRequest(requestFn, options) {
  const { type, timeout, id, deduplicate } = options;
  const requestId = id || `${type}_${Date.now()}_${Math.random()}`;

  // Create request tracking entry with promise for deduplication
  const requestPromise = (async () => {
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      // Execute with timeout
      const result = await Promise.race([
        requestFn(controller.signal),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
      ]);

      clearTimeout(timeoutId);

      // PERFORMANCE FIX #13: Cache successful results for deduplication
      if (deduplicate && id) {
        const cacheKey = `${type}:${id}`;
        deduplicationCache.set(cacheKey, {
          result,
          error: null,
          timestamp: Date.now()
        });

        // Clean up old cache entries
        cleanupDeduplicationCache();
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      // PERFORMANCE FIX #13: Cache errors for deduplication (shorter TTL)
      if (deduplicate && id && error.name !== 'AbortError') {
        const cacheKey = `${type}:${id}`;
        deduplicationCache.set(cacheKey, {
          result: null,
          error,
          timestamp: Date.now()
        });
      }

      throw error;
    }
  })();

  const requestEntry = {
    type,
    startedAt: Date.now(),
    id: requestId,
    promise: requestPromise
  };

  try {
    // Track the request
    activeRequests.set(requestId, requestEntry);
    
    return await requestPromise;

  } finally {
    // Cleanup
    activeRequests.delete(requestId);
    
    // Process queue
    processQueue();
  }
}

/**
 * Clean up old deduplication cache entries
 */
function cleanupDeduplicationCache() {
  const now = Date.now();
  for (const [key, entry] of deduplicationCache.entries()) {
    if (now - entry.timestamp > DEDUP_CACHE_TTL) {
      deduplicationCache.delete(key);
    }
  }
}

/**
 * Process queued requests when slots become available
 */
function processQueue() {
  while (requestQueue.length > 0) {
    const totalActive = activeRequests.size;
    if (totalActive >= MAX_CONCURRENT_REQUESTS) {
      break;
    }

    // Find a request that can be executed based on type limits
    let queueIndex = -1;
    for (let i = 0; i < requestQueue.length; i++) {
      const entry = requestQueue[i];
      const type = entry.options.type || 'default';
      const maxForType = MAX_CONCURRENT_PER_TYPE[type] || MAX_CONCURRENT_PER_TYPE.default;
      const currentTypeCount = Array.from(activeRequests.values())
        .filter(req => req.type === type).length;

      if (currentTypeCount < maxForType) {
        queueIndex = i;
        break;
      }
    }

    if (queueIndex === -1) {
      break; // No requests can be executed right now
    }

    // Execute the queued request
    const entry = requestQueue.splice(queueIndex, 1)[0];
    
    // STABILITY FIX: Clear queue timeout when processing
    if (entry.queueTimeout) {
      clearTimeout(entry.queueTimeout);
    }
    
    // Check if request has timed out in queue
    if (Date.now() - entry.queuedAt > QUEUE_TIMEOUT) {
      entry.reject(new Error('Request queue timeout'));
      continue;
    }

    // Execute the request
    executeRequest(entry.requestFn, entry.options)
      .then(entry.resolve)
      .catch(entry.reject);
  }
}

/**
 * Get current request statistics
 */
export function getRequestStats() {
  const byType = {};
  for (const req of activeRequests.values()) {
    byType[req.type] = (byType[req.type] || 0) + 1;
  }

  return {
    totalActive: activeRequests.size,
    queueLength: requestQueue.length,
    cacheSize: deduplicationCache.size, // PERFORMANCE FIX #13: Include cache stats
    byType,
    limits: {
      global: MAX_CONCURRENT_REQUESTS,
      perType: MAX_CONCURRENT_PER_TYPE
    }
  };
}

/**
 * Clear all active requests (emergency cleanup)
 */
export function clearAllRequests() {
  const count = activeRequests.size + requestQueue.length;
  
  // Reject all queued requests
  for (const entry of requestQueue) {
    entry.reject(new Error('Request limiter cleared'));
  }
  
  activeRequests.clear();
  requestQueue.length = 0;
  deduplicationCache.clear(); // PERFORMANCE FIX #13: Clear deduplication cache
  
  return count;
}

/**
 * Wrapper for Supabase database operations
 */
export function limitedDatabaseRequest(requestFn, options = {}) {
  return limitedRequest(requestFn, { ...options, type: 'database' });
}

/**
 * Wrapper for external API calls
 */
export function limitedApiRequest(requestFn, options = {}) {
  return limitedRequest(requestFn, { ...options, type: 'api' });
}

/**
 * Wrapper for authentication operations
 */
export function limitedAuthRequest(requestFn, options = {}) {
  return limitedRequest(requestFn, { ...options, type: 'auth' });
}

/**
 * Wrapper for admin operations
 */
export function limitedAdminRequest(requestFn, options = {}) {
  return limitedRequest(requestFn, { ...options, type: 'admin' });
}

export default {
  limitedRequest,
  limitedDatabaseRequest,
  limitedApiRequest,
  limitedAuthRequest,
  limitedAdminRequest,
  getRequestStats,
  clearAllRequests
};