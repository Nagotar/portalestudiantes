// Service Worker básico para evitar errores 404
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // No hacer nada, solo evitar el error 404
  event.respondWith(fetch(event.request));
});
