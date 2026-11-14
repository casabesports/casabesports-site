/*
 * Casa Besports — service worker de l'application (PWA).
 *
 * Rôle :
 *  - rend l'application installable sur Android, ordinateur et iPhone ;
 *  - garde une copie des pages, scripts et images déjà vus, pour que l'appli s'ouvre vite
 *    et reste lisible sans réseau (métro, stade, campagne) ;
 *  - ne touche JAMAIS aux connexions, paiements et données en ligne (Supabase, Stripe, météo…) :
 *    seules les ressources du site lui-même (même adresse) passent par ici.
 *
 * Le numéro __VERSION__ est remplacé à chaque mise en ligne (outils/build.sh) :
 * l'ancienne copie est alors effacée et la nouvelle version s'installe toute seule.
 */
const VERSION = '__VERSION__';
const CACHE = 'casa-' + VERSION;
const PRECACHE = ['/', '/hors-ligne.html', '/manifest.webmanifest', '/assets/app/icon-192.png', '/assets/app/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('casa-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function garder(req, res) {
  if (!res || !res.ok || res.type !== 'basic') return;
  const copie = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copie)).catch(() => {});
}

// Copie des fichiers déjà chargés lors de la toute première visite (envoyés par js/pwa.js)
self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type !== 'garder' || !Array.isArray(d.urls)) return;
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(d.urls.map((u) => {
    try { if (new URL(u, self.location.origin).origin !== self.location.origin) return null; } catch (er) { return null; }
    return c.match(u).then((deja) => deja || fetch(u).then((res) => { if (res.ok) return c.put(u, res); }).catch(() => {}));
  }))));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;               // Supabase, Stripe, météo… : jamais en cache
  if (req.headers.has('range')) return;                           // vidéos lues par morceaux
  if (/\.(mp4|webm|mov|m4v|mp3)$/i.test(url.pathname)) return;     // vidéos et sons : trop lourds pour la copie

  // Pages : d'abord le réseau (contenu frais), sinon la dernière copie, sinon la page « hors ligne »
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => { garder(req, res); return res; })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then((r) => r || caches.match('/'))
        .then((r) => r || caches.match('/hors-ligne.html'))));
    return;
  }

  // Scripts, contenus, images : la copie s'affiche tout de suite et se met à jour en arrière-plan
  e.respondWith(caches.match(req).then((copie) => {
    const reseau = fetch(req).then((res) => { garder(req, res); return res; }).catch(() => copie);
    return copie || reseau;
  }));
});
