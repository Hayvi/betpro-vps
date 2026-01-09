// Killer Service Worker v2: clears caches and unregisters, then claims clients
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const names = await caches.keys();
      await Promise.all(names.map((n) => caches.delete(n)));
    } catch {}
    try {
      await self.registration.unregister();
    } catch {}
    try {
      await self.clients.claim();
    } catch {}
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      client.navigate(client.url);
    }
  })());
});

// network-only
self.addEventListener('fetch', () => {});
