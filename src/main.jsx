import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { BetProvider } from './contexts/BetContext'
import { ToastProvider } from './contexts/ToastContext'
import { I18nProvider } from './contexts/I18nContext'
import { Toaster } from 'sonner'
import App from './App.jsx'
import 'leaflet/dist/leaflet.css'
import './index.css'

// PERFORMANCE FIX #2: Initialize localStorage maintenance
import { performMaintenanceCleanup } from './services/localStorageService'
// STABILITY FIX: Import reload protection
import { canReload, recordReload, showReloadLimitError } from './utils/reloadManager'

// Perform localStorage cleanup on app startup
try {
  performMaintenanceCleanup();
} catch (e) {
  console.warn('Failed to perform localStorage maintenance:', e);
}

// PERFORMANCE FIX #5: Suppress noisy CLOSED channel status logs
// These are normal during channel cleanup and create console noise
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('channel error: CLOSED')) {
    return; // Suppress CLOSED channel errors - they're normal during cleanup
  }
  originalConsoleError.apply(console, args);
};

// STABILITY FIX: Store event listeners for cleanup
const eventListeners = [];

const addManagedListener = (target, event, handler) => {
  target.addEventListener(event, handler);
  eventListeners.push({ target, event, handler });
};

// Cleanup listeners on HMR
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    eventListeners.forEach(({ target, event, handler }) => {
      try {
        target.removeEventListener(event, handler);
      } catch (e) {
        console.warn('Failed to remove event listener:', e);
      }
    });
    eventListeners.length = 0;
  });
}

// STABILITY FIX: Handle chunk loading errors with reload protection
const handleChunkError = (errorMessage) => {
  if (
    errorMessage?.includes('Loading chunk') ||
    errorMessage?.includes('Unexpected token') ||
    errorMessage?.includes('Failed to fetch dynamically imported module')
  ) {
    // Clear caches
    if ('caches' in window) {
      window.caches.keys().then((names) => {
        names.forEach((name) => window.caches.delete(name));
      });
    }

    // Check if reload is allowed
    if (canReload()) {
      const delay = recordReload();
      console.log(`Chunk error detected, reloading in ${delay}ms...`);
      setTimeout(() => {
        window.location.reload();
      }, delay);
    } else {
      console.warn('Reload limit reached, showing error page');
      showReloadLimitError();
    }
    return true;
  }
  return false;
};

// Handle chunk loading errors
addManagedListener(window, 'error', (event) => {
  handleChunkError(event.message);
});

// Also handle unhandled promise rejections for dynamic imports
addManagedListener(window, 'unhandledrejection', (event) => {
  handleChunkError(event.reason?.message);
});

// PERFORMANCE FIX #6: Optimized version checking using HEAD requests and ETags
// Instead of downloading entire HTML, use HTTP headers for efficient change detection
const checkForUpdates = async () => {
  try {
    // Prevent checking too frequently (minimum 30 seconds between checks)
    const lastCheck = window.sessionStorage.getItem('app_version_check');
    const now = Date.now();
    if (lastCheck && now - parseInt(lastCheck, 10) < 30000) {
      return;
    }
    window.sessionStorage.setItem('app_version_check', now.toString());

    // Try optimized HEAD request first
    let versionIdentifier = null;
    let needsFallback = false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for HEAD

      const headResponse = await fetch('/', { 
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (headResponse.ok) {
        // Use ETag or Last-Modified for change detection
        const etag = headResponse.headers.get('etag');
        const lastModified = headResponse.headers.get('last-modified');
        versionIdentifier = etag || lastModified;
        
        if (!versionIdentifier) {
          needsFallback = true;
        }
      } else {
        needsFallback = true;
      }
    } catch (headError) {
      needsFallback = true;
    }

    // Fallback to GET request if HEAD didn't work or no version headers
    if (needsFallback) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for GET

      const response = await fetch('/', { 
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        return;
      }

      const html = await response.text();
      
      // Extract script src from HTML as version identifier
      const scriptMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
      versionIdentifier = scriptMatch?.[1];
    }
    
    if (versionIdentifier) {
      const storedVersion = window.sessionStorage.getItem('app_version_identifier');
      
      // First visit - just store the version
      if (!storedVersion) {
        window.sessionStorage.setItem('app_version_identifier', versionIdentifier);
        return;
      }
      
      // Check if version changed
      if (storedVersion !== versionIdentifier) {
        // Prevent infinite reload - check if we already reloaded recently
        const lastReload = window.sessionStorage.getItem('app_version_reload');
        if (lastReload && now - parseInt(lastReload, 10) < 60000) {
          // Already reloaded in last minute, just update stored version
          window.sessionStorage.setItem('app_version_identifier', versionIdentifier);
          return;
        }
        
        console.log('New version detected, refreshing...');
        window.sessionStorage.setItem('app_version_reload', now.toString());
        window.sessionStorage.setItem('app_version_identifier', versionIdentifier);
        
        // Clear caches before reload
        if ('caches' in window) {
          try {
            const names = await window.caches.keys();
            await Promise.all(names.map(name => window.caches.delete(name)));
          } catch (cacheError) {
            console.warn('Failed to clear caches:', cacheError);
          }
        }
        
        window.location.reload();
      }
    }
  } catch (error) {
    // Only log non-abort errors
    if (error.name !== 'AbortError') {
      console.warn('Version check failed:', error);
    }
  }
};

// Check for updates every 5 minutes (not on initial load to avoid issues)
setTimeout(() => {
  checkForUpdates();
  setInterval(checkForUpdates, 5 * 60 * 1000);
}, 10000);

// Also check when tab becomes visible again (with delay)
addManagedListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setTimeout(checkForUpdates, 2000);
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <BetProvider>
              <I18nProvider>
                <App />
                <Toaster position="bottom-center" richColors closeButton />
              </I18nProvider>
            </BetProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
