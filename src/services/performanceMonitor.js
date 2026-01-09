/**
 * PERFORMANCE FIX #14: Performance Monitoring for Memory Usage
 * Monitors memory usage, performance metrics, and provides alerts
 */

// Performance monitoring state
let isMonitoring = false;
let monitoringInterval = null;
let performanceHistory = [];
let memoryAlerts = [];

// Configuration
const MONITORING_INTERVAL = 30000; // 30 seconds
const HISTORY_RETENTION = 100; // Keep last 100 measurements
const MEMORY_WARNING_THRESHOLD = 50 * 1024 * 1024; // 50MB
const MEMORY_CRITICAL_THRESHOLD = 100 * 1024 * 1024; // 100MB
const PERFORMANCE_DEGRADATION_THRESHOLD = 0.3; // 30% degradation

/**
 * Get current memory usage information
 */
function getMemoryInfo() {
  const info = {
    timestamp: Date.now(),
    supported: false,
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
    usedPercent: 0
  };

  // Check if performance.memory is available (Chrome/Edge)
  if (performance.memory) {
    info.supported = true;
    info.usedJSHeapSize = performance.memory.usedJSHeapSize;
    info.totalJSHeapSize = performance.memory.totalJSHeapSize;
    info.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
    info.usedPercent = (info.usedJSHeapSize / info.jsHeapSizeLimit) * 100;
  }

  return info;
}

/**
 * Get performance timing information
 */
function getPerformanceInfo() {
  const info = {
    timestamp: Date.now(),
    navigation: null,
    paint: null,
    resources: []
  };

  // Navigation timing
  if (performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      const nav = navEntries[0];
      info.navigation = {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        loadComplete: nav.loadEventEnd - nav.loadEventStart,
        domInteractive: nav.domInteractive - nav.navigationStart,
        firstByte: nav.responseStart - nav.requestStart
      };
    }

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    info.paint = {};
    paintEntries.forEach(entry => {
      info.paint[entry.name] = entry.startTime;
    });

    // Resource timing (last 10 resources)
    const resourceEntries = performance.getEntriesByType('resource').slice(-10);
    info.resources = resourceEntries.map(entry => ({
      name: entry.name.split('/').pop() || entry.name,
      duration: entry.duration,
      size: entry.transferSize || 0,
      type: entry.initiatorType
    }));
  }

  return info;
}

/**
 * Get localStorage usage information
 */
function getStorageInfo() {
  const info = {
    timestamp: Date.now(),
    localStorage: {
      used: 0,
      keys: 0,
      quota: 0,
      usedPercent: 0
    },
    sessionStorage: {
      used: 0,
      keys: 0
    }
  };

  try {
    // Calculate localStorage usage
    let localStorageSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        localStorageSize += localStorage[key].length + key.length;
      }
    }
    info.localStorage.used = localStorageSize;
    info.localStorage.keys = Object.keys(localStorage).length;

    // Estimate quota (usually 5-10MB)
    const estimatedQuota = 5 * 1024 * 1024; // 5MB conservative estimate
    info.localStorage.quota = estimatedQuota;
    info.localStorage.usedPercent = (localStorageSize / estimatedQuota) * 100;

    // Calculate sessionStorage usage
    let sessionStorageSize = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        sessionStorageSize += sessionStorage[key].length + key.length;
      }
    }
    info.sessionStorage.used = sessionStorageSize;
    info.sessionStorage.keys = Object.keys(sessionStorage).length;

  } catch (error) {
    console.warn('Failed to get storage info:', error);
  }

  return info;
}

/**
 * Get request limiter statistics
 */
function getRequestLimiterInfo() {
  try {
    // Import dynamically to avoid circular dependencies
    const { getRequestStats } = require('./requestLimiter');
    return {
      timestamp: Date.now(),
      ...getRequestStats()
    };
  } catch (error) {
    return {
      timestamp: Date.now(),
      error: 'Request limiter not available'
    };
  }
}

/**
 * Collect comprehensive performance snapshot
 */
function collectPerformanceSnapshot() {
  const snapshot = {
    timestamp: Date.now(),
    memory: getMemoryInfo(),
    performance: getPerformanceInfo(),
    storage: getStorageInfo(),
    requests: getRequestLimiterInfo()
  };

  // Add to history
  performanceHistory.push(snapshot);

  // Trim history to retention limit
  if (performanceHistory.length > HISTORY_RETENTION) {
    performanceHistory = performanceHistory.slice(-HISTORY_RETENTION);
  }

  // Check for alerts
  checkPerformanceAlerts(snapshot);

  return snapshot;
}

/**
 * Check for performance issues and generate alerts
 */
function checkPerformanceAlerts(snapshot) {
  const alerts = [];

  // Memory usage alerts
  if (snapshot.memory.supported) {
    if (snapshot.memory.usedJSHeapSize > MEMORY_CRITICAL_THRESHOLD) {
      alerts.push({
        type: 'memory',
        level: 'critical',
        message: `Memory usage critical: ${formatBytes(snapshot.memory.usedJSHeapSize)}`,
        value: snapshot.memory.usedJSHeapSize,
        threshold: MEMORY_CRITICAL_THRESHOLD
      });
    } else if (snapshot.memory.usedJSHeapSize > MEMORY_WARNING_THRESHOLD) {
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `Memory usage high: ${formatBytes(snapshot.memory.usedJSHeapSize)}`,
        value: snapshot.memory.usedJSHeapSize,
        threshold: MEMORY_WARNING_THRESHOLD
      });
    }
  }

  // Storage usage alerts
  if (snapshot.storage.localStorage.usedPercent > 80) {
    alerts.push({
      type: 'storage',
      level: 'warning',
      message: `localStorage usage high: ${snapshot.storage.localStorage.usedPercent.toFixed(1)}%`,
      value: snapshot.storage.localStorage.used,
      threshold: snapshot.storage.localStorage.quota * 0.8
    });
  }

  // Request queue alerts
  if (snapshot.requests.queueLength > 10) {
    alerts.push({
      type: 'requests',
      level: 'warning',
      message: `Request queue backed up: ${snapshot.requests.queueLength} pending`,
      value: snapshot.requests.queueLength,
      threshold: 10
    });
  }

  // Performance degradation alerts
  if (performanceHistory.length >= 2) {
    const current = snapshot;
    const previous = performanceHistory[performanceHistory.length - 2];
    
    if (current.memory.supported && previous.memory.supported) {
      const memoryGrowth = current.memory.usedJSHeapSize - previous.memory.usedJSHeapSize;
      const growthRate = memoryGrowth / (current.timestamp - previous.timestamp); // bytes per ms
      
      if (growthRate > 1000) { // More than 1KB per second growth
        alerts.push({
          type: 'memory_growth',
          level: 'warning',
          message: `Rapid memory growth detected: ${formatBytes(growthRate * 1000)}/sec`,
          value: growthRate,
          threshold: 1000
        });
      }
    }
  }

  // Add alerts to history
  if (alerts.length > 0) {
    memoryAlerts.push({
      timestamp: Date.now(),
      alerts
    });

    // Trim alert history
    if (memoryAlerts.length > 50) {
      memoryAlerts = memoryAlerts.slice(-50);
    }

    // Log critical alerts
    alerts.forEach(alert => {
      if (alert.level === 'critical') {
        console.error('Performance Alert:', alert.message);
      } else {
        console.warn('Performance Alert:', alert.message);
      }
    });
  }
}

/**
 * Format bytes for human readable display
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Start performance monitoring
 */
export function startMonitoring() {
  if (isMonitoring) return;

  isMonitoring = true;
  
  // Initial snapshot
  collectPerformanceSnapshot();

  // Set up periodic monitoring
  monitoringInterval = setInterval(() => {
    collectPerformanceSnapshot();
  }, MONITORING_INTERVAL);

  console.log('Performance monitoring started');
}

/**
 * Stop performance monitoring
 */
export function stopMonitoring() {
  if (!isMonitoring) return;

  isMonitoring = false;
  
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }

  console.log('Performance monitoring stopped');
}

/**
 * Get current performance status
 */
export function getPerformanceStatus() {
  const latest = performanceHistory[performanceHistory.length - 1];
  const recentAlerts = memoryAlerts.slice(-5);

  return {
    isMonitoring,
    latest,
    recentAlerts,
    historyCount: performanceHistory.length,
    alertCount: memoryAlerts.length
  };
}

/**
 * Get performance history
 */
export function getPerformanceHistory(limit = 20) {
  return performanceHistory.slice(-limit);
}

/**
 * Get performance alerts
 */
export function getPerformanceAlerts(limit = 10) {
  return memoryAlerts.slice(-limit);
}

/**
 * Clear performance history and alerts
 */
export function clearPerformanceData() {
  performanceHistory = [];
  memoryAlerts = [];
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  if (performanceHistory.length === 0) {
    return { error: 'No performance data available' };
  }

  const latest = performanceHistory[performanceHistory.length - 1];
  const oldest = performanceHistory[0];
  
  const summary = {
    monitoring: {
      isActive: isMonitoring,
      duration: latest.timestamp - oldest.timestamp,
      samples: performanceHistory.length
    },
    memory: {
      current: latest.memory.supported ? formatBytes(latest.memory.usedJSHeapSize) : 'Not supported',
      currentRaw: latest.memory.usedJSHeapSize,
      limit: latest.memory.supported ? formatBytes(latest.memory.jsHeapSizeLimit) : 'Not supported',
      usedPercent: latest.memory.usedPercent
    },
    storage: {
      localStorage: formatBytes(latest.storage.localStorage.used),
      localStoragePercent: latest.storage.localStorage.usedPercent,
      sessionStorage: formatBytes(latest.storage.sessionStorage.used)
    },
    requests: {
      active: latest.requests.totalActive,
      queued: latest.requests.queueLength,
      cached: latest.requests.cacheSize
    },
    alerts: {
      total: memoryAlerts.length,
      recent: memoryAlerts.slice(-5).length
    }
  };

  return summary;
}

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  // Start monitoring after a short delay to avoid interfering with initial load
  setTimeout(() => {
    startMonitoring();
  }, 5000);
}

export default {
  startMonitoring,
  stopMonitoring,
  getPerformanceStatus,
  getPerformanceHistory,
  getPerformanceAlerts,
  getPerformanceSummary,
  clearPerformanceData,
  collectPerformanceSnapshot
};