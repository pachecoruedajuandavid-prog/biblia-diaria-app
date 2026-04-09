const CACHE_NAME = 'bible-app-v4.1';
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
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap',
  'https://actions.google.com/sounds/v1/alarms/bugle_tune.ogg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Prevent complete installation failure if a single file (like an icon) is missing
        return Promise.all(
          CACHE_ASSETS.map(url => {
            return cache.add(url).catch(err => console.warn('PWA Asset missing (safe to ignore if icon):', url, err));
          })
        );
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
