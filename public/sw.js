// Service Worker per Low District - Versione v11 (FCM Integrated)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// CONFIGURAZIONE FIREBASE (Sostituisci con i tuoi dati dalla console Firebase)
const firebaseConfig = {
  apiKey: "INSERISCI_API_KEY",
  authDomain: "IL_TUO_PROGETTO.firebaseapp.com",
  projectId: "IL_TUO_PROGETTO",
  storageBucket: "IL_TUO_PROGETTO.appspot.com",
  messagingSenderId: "IL_TUO_SENDER_ID",
  appId: "IL_TUO_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Gestione notifiche in background
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notifica ricevuta in background:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-only.png',
    badge: '/icon-only.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- LOGICA CACHING ESISTENTE ---
const CACHE_NAME = 'low-district-v11';
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
  if (
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('supabase.net') ||
    url.hostname.includes('lowdistrict.it') ||
    url.pathname.includes('/wp-json/') ||
    url.pathname.includes('/functions/v1/') ||
    event.request.method !== 'GET'
  ) {
    return; 
  }
  // ... resto della logica di caching ...
});