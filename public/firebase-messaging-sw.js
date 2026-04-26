// Service Worker per Low District - Versione v13
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

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

messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notifica ricevuta:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-only.png',
    badge: '/icon-only.png',
    data: payload.data
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));