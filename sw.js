// Minimal Service Worker for PWA
const CACHE = 'startuphub-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['index.html', 'css/style.css', 'js/app.js', 'js/storage.js', 'js/i18n.js'])));
  self.skipWaiting();
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
