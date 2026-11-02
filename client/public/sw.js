// client/public/sw.js
// Lightweight service worker for PWA installability and background execution

const CACHE_NAME = 'musicroom-shell-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let browser handle network requests
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

