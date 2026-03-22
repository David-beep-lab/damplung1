// Service Worker disabled temporarily
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker disabled');
});
