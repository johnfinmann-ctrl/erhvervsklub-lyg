/* ================================================================
   Lyngbygaard Erhvervsklub — Service Worker v4.3

   VERSIONSSTYRING:
   Skift CACHE_VERSION ved hver GitHub-upload for at tvinge
   opdatering på alle installerede apps (iPhone, iPad, Android).

   Strategi:
   · Network-first  → index.html, app.js, style.css, manifest.json
   · Cache-first    → icons og billeder (statiske assets)
   · Offline fallback → cached index.html
   ================================================================ */

const CACHE_VERSION = 'lyg-erhverv-v4.3';
const BASE          = self.registration.scope;

const PRECACHE_URLS = [
  BASE + 'index.html',
  BASE + 'style.css?v=4.3',
  BASE + 'app.js?v=4.3',
  BASE + 'manifest.json?v=4.3',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
];

const CACHE_FIRST_RE = /\/icons\/|unsplash\.com|\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?)$/;

/* ── INSTALL ─────────────────────────────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(PRECACHE_URLS))
      .catch(err => console.warn('[SW] Precache fejl:', err))
  );
  self.skipWaiting();           // aktivér SW med det samme
});

/* ── ACTIVATE ────────────────────────────────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => { console.log('[SW] Slet gammel cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())   // overtag ALLE åbne faner
  );
});

/* ── FETCH ───────────────────────────────────────────────────── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const sameOrigin = url.startsWith(self.location.origin);
  const unsplash   = url.includes('unsplash.com');
  if (!sameOrigin && !unsplash) return;

  /* Cache-first: icons og billeder */
  if (CACHE_FIRST_RE.test(url)) {
    event.respondWith(
      caches.match(event.request).then(hit => {
        if (hit) return hit;
        return fetch(event.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE_VERSION).then(c => c.put(event.request, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  /* Network-first: alle app-filer */
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(CACHE_VERSION).then(c => c.put(event.request, res.clone()));
        }
        /* Fortæl siden at en ny version er tilgængelig */
        if (event.request.mode === 'navigate') {
          self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
          });
        }
        return res;
      })
      .catch(() =>
        caches.match(event.request).then(hit => {
          if (hit) return hit;
          if (event.request.mode === 'navigate')
            return caches.match(BASE + 'index.html');
        })
      )
  );
});

/* ── SKIP_WAITING besked fra siden ──────────────────────────── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── NOTIFICATION CLICK ─────────────────────────────────────── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) {
        if (c.url.startsWith(BASE) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(BASE + 'index.html');
    })
  );
});
