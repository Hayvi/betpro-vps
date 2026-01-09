// Killer Service Worker: clears caches and unregisters itself
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    } catch (e) {
      // ignore
    }
    try {
      await self.registration.unregister();
    } catch (e) {
      // ignore
    }
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.navigate(client.url);
    }
  })());
});

// Fallback: network only, no caching
self.addEventListener('fetch', () => {});
