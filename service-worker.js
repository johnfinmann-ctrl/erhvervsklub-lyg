/* ================================================================
   Lyngbygaard Erhvervsklub — Service Worker v4.2

   Strategi:
   - Network-first for app-filer (index.html, app.js, style.css,
     manifest.json) → brugeren får altid den nyeste version.
   - Cache-first for statiske assets (icons, billeder) → hurtig load.
   - Offline fallback til cached index.html ved navigation.
   ================================================================ */

const CACHE_NAME = 'lyg-ek-v4-2';
const BASE       = self.registration.scope;

/* Filer der caches ved install (til offline-support) */
const PRECACHE = [
  BASE + 'index.html',
  BASE + 'style.css?v=4.2',
  BASE + 'app.js?v=4.2',
  BASE + 'manifest.json?v=4.2',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

/* Disse URL-mønstre bruger cache-first (statiske assets) */
const CACHE_FIRST_PATTERNS = [
  /\/icons\//,
  /\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?)$/,
  /unsplash\.com/,
];

function erCacheFirst(url) {
  return CACHE_FIRST_PATTERNS.some(p => p.test(url));
}

/* ── Install: precache + skipWaiting ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .catch(err => console.warn('[SW] Precache fejlede (offline install):', err))
  );
  self.skipWaiting(); // aktivér med det samme
});

/* ── Activate: slet alle gamle caches + claim ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Sletter gammel cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) // overtag åbne faner med det samme
  );
});

/* ── Fetch ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('unsplash.com')) return;

  const url = event.request.url;

  if (erCacheFirst(url)) {
    /* Cache-first: icons og billeder */
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
          }
          return response;
        });
      })
    );
  } else {
    /* Network-first: app-filer (index.html, app.js, style.css, manifest.json) */
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const toCache = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
          }
          return response;
        })
        .catch(() => {
          /* Offline fallback */
          return caches.match(event.request).then(cached => {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return caches.match(BASE + 'index.html');
            }
          });
        })
    );
  }
});

/* ── Notification click ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url.startsWith(BASE) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(BASE + 'index.html');
    })
  );
});
