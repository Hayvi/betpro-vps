/**
 * Reload Manager - Prevents Infinite Reload Loops
 * Tracks reload attempts and implements exponential backoff
 */

const RELOAD_HISTORY_KEY = 'betpro_reload_history';
const MAX_RELOADS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const BACKOFF_DELAYS = [10000, 30000, 60000, 120000, 300000]; // 10s, 30s, 1m, 2m, 5m

/**
 * Check if reload is allowed based on recent history
 */
export function canReload() {
  try {
    const history = JSON.parse(localStorage.getItem(RELOAD_HISTORY_KEY) || '[]');
    const now = Date.now();
    const recent = history.filter(time => now - time < WINDOW_MS);
    return recent.length < MAX_RELOADS;
  } catch (e) {
    console.warn('Failed to check reload history:', e);
    return true; // Allow reload if we can't check history
  }
}

/**
 * Record a reload attempt and get the delay before next reload
 */
export function recordReload() {
  try {
    const history = JSON.parse(localStorage.getItem(RELOAD_HISTORY_KEY) || '[]');
    const now = Date.now();
    
    // Clean old entries
    const recent = history.filter(time => now - time < WINDOW_MS);
    recent.push(now);
    
    localStorage.setItem(RELOAD_HISTORY_KEY, JSON.stringify(recent));
    
    // Return delay for next reload (exponential backoff)
    const reloadCount = recent.length;
    const delayIndex = Math.min(reloadCount - 1, BACKOFF_DELAYS.length - 1);
    return BACKOFF_DELAYS[delayIndex];
  } catch (e) {
    console.warn('Failed to record reload:', e);
    return BACKOFF_DELAYS[0]; // Default to first delay
  }
}

/**
 * Get reload statistics for monitoring
 */
export function getReloadStats() {
  try {
    const history = JSON.parse(localStorage.getItem(RELOAD_HISTORY_KEY) || '[]');
    const now = Date.now();
    const recent = history.filter(time => now - time < WINDOW_MS);
    
    return {
      recentReloads: recent.length,
      maxReloads: MAX_RELOADS,
      canReload: recent.length < MAX_RELOADS,
      nextDelay: recent.length > 0 ? BACKOFF_DELAYS[Math.min(recent.length - 1, BACKOFF_DELAYS.length - 1)] : BACKOFF_DELAYS[0],
      windowMs: WINDOW_MS
    };
  } catch (e) {
    console.warn('Failed to get reload stats:', e);
    return {
      recentReloads: 0,
      maxReloads: MAX_RELOADS,
      canReload: true,
      nextDelay: BACKOFF_DELAYS[0],
      windowMs: WINDOW_MS
    };
  }
}

/**
 * Clear reload history (for testing or manual reset)
 */
export function clearReloadHistory() {
  try {
    localStorage.removeItem(RELOAD_HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear reload history:', e);
  }
}

/**
 * Show error page instead of reloading
 */
export function showReloadLimitError() {
  const errorHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>BetPro - Loading Error</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
        .error-container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .error-title { color: #e74c3c; font-size: 24px; margin-bottom: 20px; }
        .error-message { color: #666; line-height: 1.6; margin-bottom: 30px; }
        .retry-button { background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .retry-button:hover { background: #2980b9; }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-title">Loading Error</div>
        <div class="error-message">
          BetPro encountered repeated loading errors and has stopped automatic retries to prevent an infinite loop.
          This usually happens after a new version is deployed while you have an old version cached.
        </div>
        <button class="retry-button" onclick="clearCacheAndReload()">Clear Cache & Retry</button>
      </div>
      <script>
        function clearCacheAndReload() {
          // Clear all caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }
          
          // Clear reload history
          localStorage.removeItem('${RELOAD_HISTORY_KEY}');
          
          // Clear other caches
          localStorage.clear();
          sessionStorage.clear();
          
          // Reload from server
          window.location.reload(true);
        }
      </script>
    </body>
    </html>
  `;
  
  document.open();
  document.write(errorHtml);
  document.close();
}

export default {
  canReload,
  recordReload,
  getReloadStats,
  clearReloadHistory,
  showReloadLimitError
};