// Garde l’appli sur l’appareil pour qu’elle marche sans internet.
// Pour publier une nouvelle version : changer le numéro ci-dessous.
const CACHE = 'espanol5e-v1.2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// D’abord la copie gardée (rapide, hors ligne) ; en arrière-plan, on récupère la dernière version.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const kept = await c.match(e.request, {ignoreSearch: true});
    const fresh = fetch(e.request).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (kept) { e.waitUntil(fresh); return kept; }
    return (await fresh) || (await c.match('./index.html'));
  }));
});
