// Service Worker per Low District - Versione v10 (Ultra-Bypass API)
const CACHE_NAME = 'low-district-v10';
const MEDIA_CACHE = 'low-district-media-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== MEDIA_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // BYPASS TOTALE PER API E SUPABASE
  // Impedisce al Service Worker di toccare qualsiasi richiesta verso i database o le funzioni
  if (
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('supabase.net') ||
    url.hostname.includes('lowdistrict.it') ||
    url.pathname.includes('/wp-json/') ||
    url.pathname.includes('/functions/v1/') ||
    event.request.method !== 'GET' // Non cachare mai POST, PUT, DELETE
  ) {
    return; 
  }

  // Strategia Stale-While-Revalidate per Cloudinary (Media)
  if (url.host === 'res.cloudinary.com') {
    event.respondWith(
      caches.open(MEDIA_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {});
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Per le navigazioni, usa Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Cache First per asset statici locali
  const isStaticAsset = /\.(js|css|png|jpg|jpeg|svg|woff2|json)$/.test(url.pathname);
  if (isStaticAsset && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});