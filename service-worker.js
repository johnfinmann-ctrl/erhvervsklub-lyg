/* ================================================================
   Lyngbygaard Erhvervsklub — Service Worker v8.9

   VERSIONSSTYRING:
   Skift CACHE_VERSION ved hver GitHub-upload.
   Installerede apps (iPhone, iPad, Android) opdaterer automatisk.

   Strategi:
   · Network-first  → index.html, app.js, style.css, manifest.json
   · Cache-first    → icons, billeder (statiske assets)
   · Offline fallback → cached index.html
   ================================================================ */

const CACHE_VERSION = 'lyg-erhverv-v8.9';
const BASE          = self.registration.scope;

const PRECACHE_URLS = [
  BASE + 'index.html',
  BASE + 'style.css?v=8.9',
  BASE + 'app.js?v=8.9',
  BASE + 'manifest.json?v=8.9',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'images/lyg-logo-transparent.png',
  BASE + 'images/ek-klubhus.jpg',
  BASE + 'images/klubhus-hero.jpg',
];

/* Cache-first: statiske assets */
const CACHE_FIRST_RE = /\/icons\/|\/images\/|\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?)$/;

/* ── INSTALL ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => c.addAll(PRECACHE_URLS))
      .catch(err => console.warn('[SW v8.9] Precache fejl:', err))
  );
  self.skipWaiting();
});

/* ── ACTIVATE: slet alle gamle caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('lyg-erhverv-') && k !== CACHE_VERSION)
          .map(k => { console.log('[SW v8.9] Slet gammel cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const sameOrigin = url.startsWith(self.location.origin);
  if (!sameOrigin) return;

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

/* ── PUSH EVENT ── */
self.addEventListener('push', event => {
  let data = {
    title: 'LYG Erhvervsklub',
    body:  'Nyt fra Erhvervsklubben',
    icon:  null,
    badge: null,
    url:   null
  };
  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    data.icon  || BASE + 'icons/icon-192.png',
      badge:   data.badge || BASE + 'icons/icon-96.png',
      data:    { url: data.url || BASE + 'index.html' },
      vibrate: [100, 50, 100],
      requireInteraction: false,
    })
  );
});

/* ── NOTIFICATION CLICK ── */
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || BASE + 'index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.startsWith(BASE) && 'focus' in c) {
          c.navigate(targetUrl).catch(() => {});
          return c.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});

/* ── PUSH SUBSCRIPTION CHANGE ── */
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    clients.matchAll().then(cs => {
      cs.forEach(c => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }));
    })
  );
});
