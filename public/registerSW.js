if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Force update by version bump and file name change
    navigator.serviceWorker.register('/sw-v2.js?v=2.0.1', { scope: '/' });
  });
}
