/*
 * Casa Besports — notifications du site et de l'application (notifications « push » du navigateur).
 *
 * Le visiteur touche « Activer les notifications » : son navigateur lui demande l'autorisation,
 * puis son appareil est inscrit dans Supabase (table push_abonnements, via la fonction « notifications »).
 * L'administrateur envoie ensuite une notification depuis l'espace Admin › Notifications.
 *
 * Où ça marche :
 *  - Android (Chrome, Edge, Samsung, Firefox) et ordinateur (Chrome, Edge, Firefox, Safari) : directement sur le site ;
 *  - iPhone et iPad (iOS 16.4 ou plus récent) : SEULEMENT dans l'application installée sur l'écran d'accueil
 *    (Safari › Partager › « Sur l'écran d'accueil »). Dans Safari « normal », Apple ne le permet pas.
 *
 * Mise en place (une seule fois) : docs/NOTIFICATIONS.md (un fichier SQL à lancer, une fonction à déployer).
 *
 * window.CasaNotif.etat() renvoie l'un de :
 *   'actif'        notifications activées sur cet appareil
 *   'inactif'      pas encore activées (bouton « Activer »)
 *   'bloque'       refusées dans les réglages du navigateur
 *   'installer'    iPhone/iPad : il faut d'abord installer l'application
 *   'non-supporte' navigateur trop ancien, ou comptes Supabase pas configurés
 * Un évènement « casa-notif » est envoyé à chaque changement (le site se met alors à jour).
 */
(function () {
  var CLE_LOCALE = 'cb-push-cle';
  var ua = navigator.userAgent || '';
  var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var courant = null;

  function installee() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function supporte() { return !!(window.isSecureContext && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window); }
  function configure() { var A = window.CasaAuth; return !!(A && A.on && A.appel); }
  function signaler(e) { courant = e; try { window.dispatchEvent(new Event('casa-notif')); } catch (er) {} return e; }
  function enregistrement() { return navigator.serviceWorker.ready; }
  function abonnementActuel() { return enregistrement().then(function (r) { return r.pushManager.getSubscription(); }); }
  function appareil() {
    if (ios) return installee() ? 'iPhone (appli)' : 'iPhone';
    if (/android/i.test(ua)) return installee() ? 'Android (appli)' : 'Android';
    return installee() ? 'Ordinateur (appli)' : 'Ordinateur';
  }
  function langue() { try { return localStorage.getItem('cb-lang') === 'en' ? 'en' : 'fr'; } catch (e) { return 'fr'; } }
  function enOctets(b64) {
    var p = '='.repeat((4 - b64.length % 4) % 4), s = atob((b64 + p).replace(/-/g, '+').replace(/_/g, '/'));
    var out = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out;
  }
  function cleServeur() {
    var c = null; try { c = localStorage.getItem(CLE_LOCALE); } catch (e) {}
    if (c) return Promise.resolve(c);
    return window.CasaAuth.appel('notifications', { action: 'cle' }).then(function (d) {
      if (!d || !d.cle) throw new Error('Clé de notification introuvable.');
      try { localStorage.setItem(CLE_LOCALE, d.cle); } catch (e) {}
      return d.cle;
    });
  }
  function inscrire(sub) {
    var j = sub.toJSON ? sub.toJSON() : sub;
    return window.CasaAuth.appel('notifications', { action: 'inscrire', abonnement: { endpoint: j.endpoint, keys: j.keys }, langue: langue(), appareil: appareil() });
  }
  function messageErreur(e) {
    var m = String((e && e.message) || e || '');
    if (e && e.pasActive) return 'Les notifications ne sont pas encore branchées sur le serveur (voir docs/NOTIFICATIONS.md).';
    if (/denied|permission/i.test(m)) return 'Les notifications sont bloquées dans les réglages de votre navigateur.';
    return m || 'Activation impossible pour le moment.';
  }

  var N = window.CasaNotif = {
    ios: ios,
    supporte: function () { return supporte() && configure(); },
    // État de cet appareil (voir en haut du fichier)
    etat: function () {
      if (ios && !installee() && !('PushManager' in window)) return Promise.resolve(signaler('installer'));
      if (!supporte() || !configure()) return Promise.resolve(signaler('non-supporte'));
      if (Notification.permission === 'denied') return Promise.resolve(signaler('bloque'));
      return abonnementActuel().then(function (s) { return signaler(s && Notification.permission === 'granted' ? 'actif' : 'inactif'); }, function () { return signaler('inactif'); });
    },
    dernier: function () { return courant; },
    // À appeler directement depuis un clic (le navigateur exige un geste de la personne)
    activer: function () {
      if (ios && !installee() && !('PushManager' in window)) return Promise.reject(new Error('Sur iPhone, installez d’abord l’application : Safari › Partager › « Sur l’écran d’accueil », puis ouvrez-la et activez les notifications.'));
      if (!supporte()) return Promise.reject(new Error('Votre navigateur ne permet pas les notifications. Essayez Chrome, Edge, Firefox ou Safari à jour.'));
      if (!configure()) return Promise.reject(new Error('Les comptes du site ne sont pas configurés.'));
      var perm = Notification.permission === 'granted' ? Promise.resolve('granted') : new Promise(function (res) {
        var p = Notification.requestPermission(res); if (p && p.then) p.then(res);
      });
      return perm.then(function (r) {
        if (r !== 'granted') { signaler(r === 'denied' ? 'bloque' : 'inactif'); throw new Error(r === 'denied' ? 'Vous avez refusé les notifications. Pour changer d’avis : réglages du navigateur › Notifications › autoriser casabesports.' : 'Notifications non autorisées.'); }
        return Promise.all([cleServeur(), enregistrement()]);
      }).then(function (x) {
        var cle = x[0], reg = x[1];
        return reg.pushManager.getSubscription().then(function (s) {
          // Abonnement fait avec une ancienne clé : on le refait
          if (s && s.options && s.options.applicationServerKey) {
            var a = new Uint8Array(s.options.applicationServerKey), b = enOctets(cle);
            if (a.length !== b.length || a.some(function (v, i) { return v !== b[i]; })) return s.unsubscribe().then(function () { return null; });
          }
          return s;
        }).then(function (s) { return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: enOctets(cle) }); });
      }).then(function (sub) {
        return inscrire(sub).then(function () { try { localStorage.setItem('cb-push-sync', String(Date.now())); } catch (e) {} return signaler('actif'); });
      }).catch(function (e) { var er = new Error(messageErreur(e)); er.cause = e; N.etat(); throw er; });
    },
    desactiver: function () {
      if (!supporte()) return Promise.resolve(signaler('non-supporte'));
      return abonnementActuel().then(function (s) {
        if (!s) return signaler('inactif');
        var endpoint = s.endpoint;
        return s.unsubscribe().catch(function () {}).then(function () {
          return configure() ? window.CasaAuth.appel('notifications', { action: 'retirer', endpoint: endpoint }).catch(function () {}) : null;
        }).then(function () { return signaler('inactif'); });
      });
    },
    // Adresse technique de cet appareil (sert à l'administrateur pour « m'envoyer un essai »)
    monAppareil: function () { return supporte() ? abonnementActuel().then(function (s) { return s ? s.endpoint : null; }) : Promise.resolve(null); }
  };

  // Tenir l'inscription à jour : une fois par jour, et à chaque connexion / déconnexion (rattache l'appareil au compte)
  function resynchroniser(force) {
    if (!supporte() || !configure() || Notification.permission !== 'granted') return;
    var last = 0; try { last = +localStorage.getItem('cb-push-sync') || 0; } catch (e) {}
    if (!force && Date.now() - last < 86400000) return;
    abonnementActuel().then(function (s) {
      if (!s) return;
      return inscrire(s).then(function () { try { localStorage.setItem('cb-push-sync', String(Date.now())); } catch (e) {} });
    }).catch(function () {});
  }
  window.addEventListener('load', function () {
    setTimeout(function () {
      N.etat();
      resynchroniser(false);
      var A = window.CasaAuth, dernierId = A && A.user ? A.user.id : null;
      if (A && A.onChange) A.onChange(function (u) { var id = u ? u.id : null; if (id !== dernierId) { dernierId = id; resynchroniser(true); } });
    }, 1500);
  });
  // L'application est installée / désinstallée : l'état peut changer (iPhone)
  window.addEventListener('casa-pwa', function () { N.etat(); });
})();
