/* ================================================================
   Lyngbygaard Erhvervsklub — Service Worker v8.6

   VERSIONSSTYRING:
   Skift CACHE_VERSION ved hver GitHub-upload.
   Installerede apps (iPhone, iPad, Android) opdaterer automatisk.

   Strategi:
   · Network-first  → index.html, app.js, style.css, manifest.json
   · Cache-first    → icons, billeder, golfer-frames (statiske)
   · Offline fallback → cached index.html
   ================================================================ */

const CACHE_VERSION = 'lyg-erhverv-v8.6';
const BASE          = self.registration.scope;

const PRECACHE_URLS = [
  BASE + 'index.html',
  BASE + 'style.css?v=8.6',
  BASE + 'app.js?v=8.6',
  BASE + 'manifest.json?v=8.6',
  BASE + 'icons/icon-192.png',
  BASE + 'icons/icon-512.png',
  BASE + 'images/golfer-1-address.png',
  BASE + 'images/golfer-2-backswing.png',
  BASE + 'images/golfer-3-impact.png',
  BASE + 'images/golfer-4-finish.png',
  BASE + 'images/ek-klubhus.jpg',
  BASE + 'images/klubhus-hero.jpg',
  BASE + 'images/lyg-logo-transparent.png',
];

/* Cache-first: statiske assets (Unsplash fjernet i v6.2 — ikke i brug) */
const CACHE_FIRST_RE = /\/icons\/|\/images\/|\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?)$/;

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
          .filter(k => k.startsWith('lyg-erhverv-') && k !== CACHE_VERSION)
          .map(k => { console.log('[SW] Slet gammel LYG-cache:', k); return caches.delete(k); })
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

/* ── PUSH EVENT — modtag og vis notifikation (v8.5) ── */
self.addEventListener('push', event => {
  let data = { title: 'LYG Erhvervsklub', body: 'Nyt fra Erhvervsklubben', icon: null, badge: null, url: null };
  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      // Prøv som plain text
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
      // Forsøg at fokusere eksisterende vindue
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

/* ── PUSH SUBSCRIPTION CHANGE — opdater subscription automatisk ── */
self.addEventListener('pushsubscriptionchange', event => {
  // Subscription er udløbet eller ændret — forsøg at genabonnere
  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then(sub => {
        if (sub) return sub; // Stadig aktiv
        // Genabonnér (kræver applicationServerKey — gemmes i klienten)
        return self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          // applicationServerKey sættes af klienten, ikke SW — udsend besked
        }).catch(() => null);
      })
      .then(newSub => {
        if (!newSub) return;
        // Underret app.js om subscription change via clients.matchAll
        return clients.matchAll().then(cs => {
          cs.forEach(c => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED', subscription: newSub.toJSON() }));
        });
      })
  );
});
