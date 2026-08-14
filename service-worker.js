/* ================================================================
   Lyngbygaard Erhvervsklub — Service Worker v4.4

   VERSIONSSTYRING:
   Skift CACHE_VERSION ved hver GitHub-upload.
   Installerede apps (iPhone, iPad, Android) opdaterer automatisk.

   Strategi:
   · Network-first  → index.html, app.js, style.css, manifest.json
   · Cache-first    → icons, billeder, golfer-frames (statiske)
   · Offline fallback → cached index.html
   ================================================================ */

const CACHE_VERSION = 'lyg-erhverv-v1.0';
const BASE          = self.registration.scope;

const PRECACHE_URLS = [
  BASE + 'index.html',
  BASE + 'style.css?v=1.0',
  BASE + 'app.js?v=1.0',
  BASE + 'manifest.json?v=1.0',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'images/golfer-1-address.png',
  BASE + 'images/golfer-2-backswing.png',
  BASE + 'images/golfer-3-impact.png',
  BASE + 'images/golfer-4-finish.png',
];

/* Cache-first: statiske assets */
const CACHE_FIRST_RE = /\/icons\/|\/images\/|unsplash\.com|\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?)$/;

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(PRECACHE_URLS))
      .catch(err => console.warn('[SW] Precache fejl:', err))
  );
  self.skipWaiting();
});

/* ── ACTIVATE: slet alle gamle caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => { console.log('[SW] Slet gammel cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const sameOrigin = url.startsWith(self.location.origin);
  const unsplash   = url.includes('unsplash.com');
  if (!sameOrigin && !unsplash) return;

  /* Cache-first: statiske filer */
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

  /* Network-first: app-filer */
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          caches.open(CACHE_VERSION).then(c => c.put(event.request, res.clone()));
        }
        /* FJERNET i v4.4: SW_UPDATED-besked sendes IKKE her længere.
           updatefound-eventet i app.js håndterer opdateringsbannet korrekt. */
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

/* ── SKIP_WAITING besked fra app ── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/* ── PUSH EVENT — modtag og vis notifikation ── */
self.addEventListener('push', event => {
  let data = { title: 'LYG Erhvervsklub', body: 'Nyt fra Erhvervsklubben', data: {} };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:  data.body,
      icon:  BASE + 'icons/icon-192.png',
      badge: BASE + 'icons/icon-192.png',
      data:  data.data || {},
      vibrate: [100, 50, 100]
    })
  );
});

/* ── NOTIFICATION CLICK ── */
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
