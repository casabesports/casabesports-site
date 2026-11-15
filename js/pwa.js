/*
 * Casa Besports — installation de l'application (PWA).
 * - inscrit le service worker (sw.js) : appli installable + lecture hors ligne ;
 * - garde la proposition d'installation d'Android / Chrome / Edge pour le bouton « Installer l'application » ;
 * - sur iPhone (Safari ne propose pas de bouton), CasaPWA.install() renvoie 'ios' : on affiche alors les étapes.
 */
(function () {
  var differe = null;
  var ua = navigator.userAgent || '';
  var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function installee() {
    return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  }
  window.CasaPWA = {
    ios: ios,
    installee: installee,
    peutProposer: function () { return !!differe; },
    install: function () {
      if (installee()) return Promise.resolve('deja');
      if (differe) {
        var p = differe; differe = null;
        p.prompt();
        return p.userChoice.then(function (c) { return c && c.outcome === 'accepted' ? 'ok' : 'refus'; }, function () { return 'refus'; });
      }
      return Promise.resolve(ios ? 'ios' : 'manuel');
    }
  };
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); differe = e;
    try { window.dispatchEvent(new Event('casa-pwa')); } catch (er) {}
  });
  window.addEventListener('appinstalled', function () {
    differe = null;
    try { window.dispatchEvent(new Event('casa-pwa')); } catch (er) {}
  });
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function () { return navigator.serviceWorker.ready; }).then(function (reg) {
        // Première visite : les scripts étaient déjà chargés avant le service worker, on lui demande d'en garder une copie
        var urls = [location.pathname + location.search].concat((performance.getEntriesByType ? performance.getEntriesByType('resource') : [])
          .map(function (r) { return r.name; })
          .filter(function (u) { return u.indexOf(location.origin + '/') === 0 && !/\.(mp4|webm|mov|m4v|mp3)(\?|$)/i.test(u); }));
        if (reg.active) reg.active.postMessage({ type: 'garder', urls: urls.slice(0, 200) });
      }).catch(function () {});
    });
  }
})();
