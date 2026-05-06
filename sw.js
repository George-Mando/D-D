const CACHE = 'xenclipse-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for API calls and live data
  if (
    e.request.url.includes('api.groq.com') ||
    e.request.url.includes('api.github.com') ||
    e.request.url.includes('github-readme') ||
    e.request.url.includes('streak-stats') ||
    e.request.url.includes('komarev') ||
    e.request.url.includes('capsule-render') ||
    e.request.url.includes('readme-typing-svg') ||
    e.request.url.includes('github-readme-activity-graph') ||
    e.request.url.includes('github-profile-trophy')
  ) {
    e.respondWith(fetch(e.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // Cache first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    })).catch(() => caches.match('./index.html'))
  );
});
