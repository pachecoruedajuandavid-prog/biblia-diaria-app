const CACHE_NAME = 'bible-app-v4.2';
const CACHE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './styles.css?v=2',
  './app.js',
  './app.js?v=2',
  './plan-data.js',
  './plan-data.js?v=2',
  './quiz-data.js',
  './quiz-data.js?v=2',
  './RVR60.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap',
  'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        CACHE_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('PWA cache miss (safe):', url))
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// ── Background Periodic Sync (Chrome Android / Edge) ───────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-bible-reminder') {
    event.waitUntil(checkAndNotifyBackground());
  }
});

// ── Push notification handler ──────────────────────────────
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '📖 Lectura Bíblica', {
      body: data.body || 'No olvides tu lectura de hoy.',
      icon: './logo.png',
      badge: './icon-192.png',
      tag: 'bible-reminder',
      renotify: true,
      vibrate: [400, 150, 400, 150, 400],
      actions: [
        { action: 'open', title: '📖 Abrir App' },
        { action: 'dismiss', title: '✕ Cerrar' }
      ]
    })
  );
});

// ── Notification click → open app ──────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

// ── Show notification from background ─────────────────────
async function checkAndNotifyBackground() {
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  if (allClients.some(c => c.visibilityState === 'visible')) return;

  await self.registration.showNotification('📖 ¡Es hora de leer la Biblia!', {
    body: 'No olvides completar tu lectura bíblica de hoy. 🙏',
    icon: './logo.png',
    badge: './icon-192.png',
    tag: 'bible-reminder',
    renotify: true,
    vibrate: [400, 150, 400, 150, 400],
    actions: [
      { action: 'open', title: '📖 Leer ahora' },
      { action: 'dismiss', title: '✕ Después' }
    ]
  });
}

// ── Message handler: app → SW ──────────────────────────────
self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_REMINDER') {
    const { title, body } = event.data;
    self.registration.showNotification(title || '📖 Lectura Bíblica', {
      body: body || 'No olvides tu lectura diaria.',
      icon: './logo.png',
      badge: './icon-192.png',
      tag: 'bible-reminder',
      renotify: true,
      vibrate: [400, 150, 400, 150, 400],
      silent: true
    });
  }

  if (event.data.type === 'REGISTER_PERIODIC_SYNC') {
    // Triggered from app after permission granted
    if ('periodicSync' in self.registration) {
      self.registration.periodicSync.register('daily-bible-reminder', {
        minInterval: 60 * 60 * 1000 // mínimo 1 hora
      }).catch(() => {});
    }
  }
});
