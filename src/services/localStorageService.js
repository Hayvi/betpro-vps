/**
 * PERFORMANCE FIX #2: localStorage Quota Management Service
 * Prevents QuotaExceededError and manages storage limits across the app
 */

// Storage quota limits (conservative estimates)
const STORAGE_QUOTA_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB warning
const STORAGE_QUOTA_CRITICAL_THRESHOLD = 4.5 * 1024 * 1024; // 4.5MB critical
const MAX_STORAGE_USAGE = 5 * 1024 * 1024; // 5MB absolute max

// Known cache keys and their priorities (lower number = higher priority)
const CACHE_PRIORITIES = {
  'betpro_betslip': 1,              // High priority - user data
  'betpro_user_preferences': 2,     // Medium priority - convenience
  'betpro_version_check': 10,       // Lowest priority - can be regenerated
};

/**
 * Calculate approximate size of localStorage usage
 */
function getStorageSize() {
  let total = 0;
  try {
    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        const value = window.localStorage.getItem(key);
        if (value) {
          // Approximate: key length + value length + overhead
          total += key.length + value.length + 50; // 50 bytes overhead per item
        }
      }
    }
  } catch (e) {
    console.warn('Failed to calculate storage size:', e);
  }
  return total;
}

/**
 * Get storage usage by cache key
 */
function getStorageBreakdown() {
  const breakdown = {};
  let total = 0;
  
  try {
    for (let key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        const value = window.localStorage.getItem(key);
        if (value) {
          const size = key.length + value.length + 50;
          breakdown[key] = size;
          total += size;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to get storage breakdown:', e);
  }
  
  return { breakdown, total };
}

/**
 * Clean up localStorage by removing lowest priority items
 */
function cleanupStorage(targetReduction = 1024 * 1024) { // Default: free up 1MB
  const { breakdown } = getStorageBreakdown();
  
  // Sort keys by priority (highest priority number = lowest priority)
  const sortedKeys = Object.keys(breakdown).sort((a, b) => {
    const priorityA = CACHE_PRIORITIES[a] || 999;
    const priorityB = CACHE_PRIORITIES[b] || 999;
    return priorityB - priorityA; // Descending order (lowest priority first)
  });
  
  let freedSpace = 0;
  const removedKeys = [];
  
  for (const key of sortedKeys) {
    if (freedSpace >= targetReduction) break;
    
    try {
      const size = breakdown[key];
      window.localStorage.removeItem(key);
      freedSpace += size;
      removedKeys.push(key);
      console.log(`Cleaned up localStorage key: ${key} (${(size / 1024).toFixed(1)}KB)`);
    } catch (e) {
      console.warn(`Failed to remove localStorage key ${key}:`, e);
    }
  }
  
  if (removedKeys.length > 0) {
    console.log(`localStorage cleanup completed: freed ${(freedSpace / 1024).toFixed(1)}KB by removing ${removedKeys.length} items`);
  }
  
  return { freedSpace, removedKeys };
}

/**
 * Safe localStorage setItem with quota management
 */
function safeSetItem(key, value) {
  try {
    // Check current storage size
    const currentSize = getStorageSize();
    const newItemSize = key.length + value.length + 50;
    
    // If we're approaching the limit, clean up first
    if (currentSize + newItemSize > STORAGE_QUOTA_WARNING_THRESHOLD) {
      console.warn(`localStorage approaching quota limit: ${(currentSize / 1024).toFixed(1)}KB used`);
      
      if (currentSize + newItemSize > STORAGE_QUOTA_CRITICAL_THRESHOLD) {
        console.warn('localStorage critical - performing cleanup');
        cleanupStorage(1024 * 1024); // Free up 1MB
      }
    }
    
    // Attempt to set the item
    window.localStorage.setItem(key, value);
    return true;
    
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.error('localStorage quota exceeded, performing emergency cleanup');
      
      // Emergency cleanup - remove 2MB worth of data
      cleanupStorage(2 * 1024 * 1024);
      
      // Try again after cleanup
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (retryError) {
        console.error('Failed to save to localStorage even after cleanup:', retryError);
        return false;
      }
    } else {
      console.error('Failed to save to localStorage:', e);
      return false;
    }
  }
}

/**
 * Safe localStorage getItem
 */
function safeGetItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    console.warn(`Failed to get localStorage item ${key}:`, e);
    return null;
  }
}

/**
 * Safe localStorage removeItem
 */
function safeRemoveItem(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`Failed to remove localStorage item ${key}:`, e);
    return false;
  }
}

/**
 * Get storage health status
 */
function getStorageHealth() {
  const size = getStorageSize();
  const { breakdown } = getStorageBreakdown();
  
  let status = 'healthy';
  if (size > STORAGE_QUOTA_WARNING_THRESHOLD) {
    status = 'warning';
  }
  if (size > STORAGE_QUOTA_CRITICAL_THRESHOLD) {
    status = 'critical';
  }
  
  return {
    status,
    totalSize: size,
    totalSizeFormatted: `${(size / 1024).toFixed(1)}KB`,
    breakdown,
    warningThreshold: STORAGE_QUOTA_WARNING_THRESHOLD,
    criticalThreshold: STORAGE_QUOTA_CRITICAL_THRESHOLD,
    maxUsage: MAX_STORAGE_USAGE
  };
}

/**
 * Periodic cleanup function - call this on app startup
 */
function performMaintenanceCleanup() {
  const health = getStorageHealth();
  
  if (health.status === 'critical') {
    console.warn('localStorage in critical state, performing maintenance cleanup');
    cleanupStorage(1024 * 1024); // Free up 1MB
  } else if (health.status === 'warning') {
    console.log('localStorage approaching limits, performing light cleanup');
    cleanupStorage(512 * 1024); // Free up 512KB
  }
  
  // Log current status
  console.log(`localStorage health: ${health.status} (${health.totalSizeFormatted} used)`);
}

export {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  getStorageSize,
  getStorageBreakdown,
  getStorageHealth,
  cleanupStorage,
  performMaintenanceCleanup,
  CACHE_PRIORITIES
};

export default {
  safeSetItem,
  safeGetItem,
  safeRemoveItem,
  getStorageSize,
  getStorageBreakdown,
  getStorageHealth,
  cleanupStorage,
  performMaintenanceCleanup
};