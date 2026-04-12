// Service Worker minimo per abilitare l'installazione PWA
const CACHE_NAME = 'low-district-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Strategia network-first per garantire che l'app sia sempre aggiornata
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});