// Service Worker per Low District - Versione v12 (FCM Configured)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// CONFIGURAZIONE FIREBASE REALE
const firebaseConfig = {
  apiKey: "AIzaSyAZdHvkdl-RWQzHODT58HG8TK-cZPZyXs8",
  authDomain: "lwdstrct-app.firebaseapp.com",
  projectId: "lwdstrct-app",
  storageBucket: "lwdstrct-app.firebasestorage.app",
  messagingSenderId: "345289653724",
  appId: "1:345289653724:web:0ae739a60a99abba37a319"
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

// --- LOGICA CACHING ---
const CACHE_NAME = 'low-district-v12';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
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
  // Bypass per API e Supabase
  const url = new URL(event.request.url);
  if (
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('lowdistrict.it') ||
    url.pathname.includes('/functions/v1/')
  ) {
    return; 
  }
});