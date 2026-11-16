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
  /* ---------- Mise à jour automatique de l'appli installée (téléphone, tablette, ordinateur) ----------
   * À chaque mise en ligne, outils/build.sh change le numéro de version (sw.js, version.json, ?v= des scripts).
   * L'appli vérifie s'il existe une version plus récente : à l'ouverture, quand on revient dessus
   * (retour au premier plan, très important sur iPhone où l'appli reste en veille) et toutes les 30 minutes.
   * - Nouvelle version trouvée juste à l'ouverture ou au retour, et personne n'est en train d'écrire :
   *   l'appli se recharge toute seule (on ne voit presque rien).
   * - Sinon : petit bandeau « Nouvelle version disponible » avec le bouton « Mettre à jour ».
   */
  var MAJ = (function () {
    var src = (document.currentScript && document.currentScript.src) || '';
    var m = /[?&]v=([^&#]+)/.exec(src);
    var actuelle = m ? decodeURIComponent(m[1]) : '';
    if (actuelle === '__VERSION__') actuelle = '';            // site lancé sans build (essai en local) : pas de vérification
    var CLE = 'casa-maj-recharge';
    var reveil = Date.now();                                     // dernier moment où l'appli a été ouverte ou remise au premier plan
    var enAttente = false, bandeau = null, enCours = false, dernier = 0;

    function occupe() {
      var a = document.activeElement;
      if (a && (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)) return true;
      var b = document.body;
      return !!(b && (b.classList.contains('rt-on') || b.classList.contains('rt-drag')));   // mode « Retoucher » de l'admin
    }
    function recharger() {
      try { sessionStorage.setItem(CLE, String(Date.now())); } catch (er) {}
      location.reload();
    }
    // Garde-fou : au plus une recharge automatique toutes les 2 minutes (évite de tourner en boucle
    // si le serveur met un peu de temps à servir partout la nouvelle version)
    function dejaRecharge() {
      try { return Date.now() - Number(sessionStorage.getItem(CLE) || 0) < 120000; } catch (er) { return true; }
    }
    function afficherBandeau() {
      if (bandeau || !document.body) return;
      bandeau = document.createElement('div');
      bandeau.setAttribute('role', 'status');
      bandeau.style.cssText = 'position:fixed;left:50%;top:calc(72px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:2147483000;'
        + 'display:flex;align-items:center;gap:.6rem;max-width:calc(100vw - 32px);box-sizing:border-box;padding:.7rem .8rem .7rem 1.1rem;'
        + 'background:#0b0b0b;color:#fff;font:600 13px/1.3 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35)';
      var t = document.createElement('span'); t.textContent = 'Nouvelle version disponible'; t.style.whiteSpace = 'nowrap';
      var ok = document.createElement('button'); ok.type = 'button'; ok.textContent = 'Mettre à jour';
      ok.style.cssText = 'border:0;background:#fff;color:#0b0b0b;font:700 13px/1 inherit;padding:.6rem .85rem;cursor:pointer;white-space:nowrap';
      var non = document.createElement('button'); non.type = 'button'; non.textContent = '×'; non.setAttribute('aria-label', 'Plus tard');
      non.style.cssText = 'border:0;background:transparent;color:#fff;font:400 22px/1 inherit;padding:0 .3rem;cursor:pointer';
      ok.onclick = function () { recharger(); };
      non.onclick = function () { if (bandeau) bandeau.remove(); bandeau = null; };
      bandeau.appendChild(t); bandeau.appendChild(ok); bandeau.appendChild(non);
      document.body.appendChild(bandeau);
    }
    // Une nouvelle version est prête : recharge discrète si l'on vient d'ouvrir l'appli, sinon bandeau
    function prete() {
      if (enAttente) return; enAttente = true;
      var recent = Date.now() - reveil < 15000;
      if (recent && !occupe() && !dejaRecharge()) recharger();
      else afficherBandeau();
    }
    // Vérifie version.json (fonctionne même là où le service worker est absent ou capricieux, ex. certains iPhone)
    function verifier(force) {
      if (!actuelle || enCours || enAttente || !navigator.onLine) return;
      if (force !== true && Date.now() - dernier < 20000) return;
      enCours = true; dernier = Date.now();
      if (reg) reg.update().catch(function () {});
      fetch('/version.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
        enCours = false;
        if (d && d.version && String(d.version) !== actuelle) {
          // On laisse quelques secondes au nouveau service worker pour s'installer, puis on recharge
          setTimeout(function () { prete(); }, reg ? 3000 : 0);
        }
      }, function () { enCours = false; });
    }
    var reg = null;
    function surveiller(r) {
      reg = r;
      if (!navigator.serviceWorker.controller) return;           // toute première visite : rien à mettre à jour
      navigator.serviceWorker.addEventListener('controllerchange', function () { prete(); });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') { reveil = Date.now(); verifier(); }
    });
    window.addEventListener('focus', function () { reveil = Date.now(); verifier(); });
    window.addEventListener('online', function () { verifier(); });
    window.addEventListener('pageshow', function (e) { if (e.persisted) { reveil = Date.now(); verifier(); } });
    setInterval(function () { verifier(); }, 30 * 60 * 1000);
    window.addEventListener('load', function () { setTimeout(verifier, 2000); });
    return { surveiller: surveiller, verifier: verifier, version: actuelle };
  })();
  window.CasaPWA.version = MAJ.version;
  window.CasaPWA.verifierMiseAJour = function () { MAJ.verifier(true); };

  if ('serviceWorker' in navigator && window.isSecureContext) {
    // Clic sur une notification alors que le site est déjà ouvert : on va à la page annoncée
    navigator.serviceWorker.addEventListener('message', function (e) {
      var d = e.data || {};
      if (d.type !== 'ouvrir' || typeof d.url !== 'string') return;
      try { var u = new URL(d.url, location.href); if (u.origin === location.origin) location.href = u.href; } catch (er) {}
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(function (r) { MAJ.surveiller(r); return navigator.serviceWorker.ready; }).then(function (reg) {
        // Première visite : les scripts étaient déjà chargés avant le service worker, on lui demande d'en garder une copie
        var urls = [location.pathname + location.search].concat((performance.getEntriesByType ? performance.getEntriesByType('resource') : [])
          .map(function (r) { return r.name; })
          .filter(function (u) { return u.indexOf(location.origin + '/') === 0 && !/\.(mp4|webm|mov|m4v|mp3)(\?|$)/i.test(u); }));
        if (reg.active) reg.active.postMessage({ type: 'garder', urls: urls.slice(0, 200) });
      }).catch(function () {});
    });
  }
})();
