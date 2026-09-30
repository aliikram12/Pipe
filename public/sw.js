// AgriSupply Smart Cold-Chain PWA Service Worker
const CACHE_NAME = 'agrisupply-v1';
const STATIC_ASSETS = [
  '/',
  '/tracking',
  '/batches',
  '/shipments',
  '/inventory',
  '/quality',
  '/orders',
  '/analytics',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let network handle dynamic API requests; fallback gracefully if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
  }
});
