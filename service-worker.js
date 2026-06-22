/* ================================================================
   Lyngbygaard Erhvervsklub — Service Worker v3
   
   VIGTIGT: Bruger self.registration.scope som base.
   Dette sikrer korrekt opførsel uanset om appen ligger på:
     https://johnfinmann-ctrl.github.io/erhvervsklub-lyg/
   eller et eget domæne, f.eks. https://erhverv.lyg.dk/
   ================================================================ */

const CACHE_NAME = 'lyg-ek-v3';

// self.registration.scope = den fulde URL til service workerens scope
// f.eks. https://johnfinmann-ctrl.github.io/erhvervsklub-lyg/
const BASE = self.registration.scope;

const ASSETS = [
  BASE + 'index.html',   // start_url i manifest peger her
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'manifest.json',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

/* ── Install: cache alle app-filer ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(err => console.warn('[SW] Cache addAll fejlede (offline install):', err))
  );
  self.skipWaiting();
});

/* ── Activate: ryd gamle caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Fetch: cache-first med netværks-fallback ── */
self.addEventListener('fetch', event => {
  // Kun GET, kun same-origin
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            // Kun cache succesfulde responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const toCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
            return response;
          })
          .catch(() => {
            // Offline fallback: returner index.html for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(BASE + 'index.html');
            }
          });
      })
  );
});

/* ── Notification click ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(BASE) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(BASE + 'index.html');
    })
  );
});
