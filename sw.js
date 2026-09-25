// V2 HR Service Worker for PWA Offline Caching
const CACHE_NAME = 'v2-hr-cache-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './V2 Logo.jpg',
  './v2b.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './favicon.png',
  './favicon.ico',
  './1.jpg',
  './2.jpg',
  './3.jpg',
  './4.jpg',
  './5.jpg',
  './6.jpg',
  './7.jpg',
  './8.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use map with catch to ensure install succeeds even if one non-critical asset fails
      return Promise.all(
        STATIC_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn('V2 HR cache item skip:', asset, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
