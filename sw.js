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
 * js/pwa.js détecte ensuite la nouvelle version (à l'ouverture, au retour sur l'appli, toutes les 30 min)
 * et recharge l'appli ou affiche le bandeau « Nouvelle version disponible ».
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
  if (url.pathname === '/version.json' || url.pathname === '/sw.js') return;   // numéro de version : toujours lu en direct
  if (req.headers.has('range')) return;                           // vidéos lues par morceaux
  if (/\.(mp4|webm|mov|m4v|mp3)$/i.test(url.pathname)) return;     // vidéos et sons : trop lourds pour la copie

  // Pages : d'abord le réseau (contenu frais), sinon la dernière copie, sinon la page « hors ligne »
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-cache' }).catch(() => fetch(req)).then((res) => { garder(req, res); return res; })
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

// ---------- Notifications (envoyées depuis l'espace Admin › Notifications, voir docs/NOTIFICATIONS.md) ----------
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (er) { d = { body: e.data ? e.data.text() : '' }; }
  const titre = d.title || 'Casa Besports';
  e.waitUntil(self.registration.showNotification(titre, {
    body: d.body || '',
    icon: d.icon || '/assets/app/icon-192.png',
    badge: '/assets/app/badge-96.png',
    image: d.image || undefined,
    tag: d.tag || undefined,
    renotify: !!d.tag,
    lang: d.lang || 'fr',
    data: { url: d.url || '/' }
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  let cible;
  try { cible = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin); } catch (er) { cible = new URL('/', self.location.origin); }
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((liste) => {
    // Le site est déjà ouvert : on l'affiche et on va à la bonne page
    for (const c of liste) {
      if (new URL(c.url).origin === self.location.origin && 'focus' in c) {
        if (cible.origin === self.location.origin) c.postMessage({ type: 'ouvrir', url: cible.href });
        else if (self.clients.openWindow) return self.clients.openWindow(cible.href);
        return c.focus();
      }
    }
    return self.clients.openWindow ? self.clients.openWindow(cible.href) : null;
  }));
});
