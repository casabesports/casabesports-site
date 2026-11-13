/*!
 * Casa Besports — comptes abonnés (Supabase Auth).
 * Création du compte : lien par e-mail ou code par SMS (compte créé à la première connexion).
 * Ensuite l'abonné choisit un mot de passe et se connecte avec e-mail (ou mobile) + mot de passe.
 * Mot de passe oublié : un lien de réinitialisation est envoyé par e-mail (ou nouveau code SMS).
 * Réglages : js/config.js. Sans réglages, window.CasaAuth.on vaut false et le site garde sa connexion de démonstration.
 */
(function () {
  var cfg = window.CASA_SUPABASE || {};
  var listeners = [];
  var client = null;
  var ready = null;
  var A = window.CasaAuth = {
    on: !!(cfg.url && cfg.anonKey),
    user: null,
    onChange: function (cb) { listeners.push(cb); if (A.user) cb(A.user); },
    // Numéro français → format international (+33…)
    phone: function (raw) {
      var p = String(raw || '').replace(/[\s.\-()]/g, '');
      if (/^00/.test(p)) p = '+' + p.slice(2);
      if (/^0[67]\d{8}$/.test(p)) p = '+33' + p.slice(1);
      return /^\+\d{8,15}$/.test(p) ? p : '';
    },
    sendEmail: function (email, name) {
      return use(function (c) {
        return c.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.origin + location.pathname, data: name ? { name: name } : undefined } });
      });
    },
    sendSms: function (phone, name) {
      return use(function (c) { return c.auth.signInWithOtp({ phone: phone, options: { data: name ? { name: name } : undefined } }); });
    },
    verifySms: function (phone, code) {
      return use(function (c) { return c.auth.verifyOtp({ phone: phone, token: String(code).trim(), type: 'sms' }); });
    },
    updateName: function (name) {
      return use(function (c) { return c.auth.updateUser({ data: { name: name } }); });
    },
    // Connexion par mot de passe : identifiant = e-mail ou numéro de mobile
    signInPassword: function (id, password) {
      id = String(id || '').trim();
      var cred = /@/.test(id) ? { email: id.toLowerCase(), password: password } : { phone: A.phone(id), password: password };
      if (!cred.email && !cred.phone) return Promise.reject(new Error('Saisissez votre e-mail ou votre numéro de mobile.'));
      A.viaPassword = true;
      return use(function (c) { return c.auth.signInWithPassword(cred); }).then(function (d) {
        var m = d && d.user && d.user.user_metadata;
        if (m && !m.has_password) use(function (c) { return c.auth.updateUser({ data: { has_password: true } }); }).catch(function () {});
        return d;
      }, function (e) { A.viaPassword = false; throw e; });
    },
    // Créer ou changer son mot de passe (une fois connecté)
    setPassword: function (password) {
      return use(function (c) { return c.auth.updateUser({ password: password, data: { has_password: true } }); }).then(function (d) {
        if (A.user) { A.user.hasPassword = true; emit(A.user); }
        return d;
      });
    },
    // Mot de passe oublié : lien de réinitialisation par e-mail
    resetPassword: function (email) {
      return use(function (c) { return c.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), { redirectTo: location.origin + location.pathname }); });
    },
    recovery: false,
    // Demandes du formulaire de contact, newsletter, commandes : table « messages » (voir supabase/messages.sql)
    saveLead: function (d) {
      return use(function (c) { return c.from('messages').insert({ source: d.source, nom: d.nom, email: d.email, telephone: d.telephone, ville: d.ville, profil: d.profil, sujet: d.sujet, message: d.message, consentement: d.consentement, page: d.page }); });
    },
    // Carte membre : enregistre le numéro dans la table « membres » (voir docs/CARTE-MEMBRE.md)
    registerMember: function (numero, prenom) {
      return use(function (c) { return c.from('membres').upsert({ id: A.user.id, numero: numero, prenom: prenom || null }, { onConflict: 'id' }); });
    },
    // Vérification par un partenaire (sans compte) : renvoie { prenom, depuis, statut } ou null
    verifyMember: function (numero) {
      return use(function (c) { return c.rpc('verifier_membre', { num: numero }); }).then(function (d) { return Array.isArray(d) ? (d[0] || null) : (d || null); });
    },
    signOut: function () { return use(function (c) { return c.auth.signOut(); }); },

    // ---------- Rôles et espace administrateur (voir supabase/administration.sql) ----------
    // Rôle de la personne connectée d'après la table « equipe » : 'admin', 'redacteur' ou null
    myRole: function () { return use(function (c) { return c.rpc('mon_role'); }).then(function (r) { return Array.isArray(r) ? (r[0] || null) : (r || null); }); },
    // Demande d'accès à l'espace rédaction (abonné connecté)
    requestAccess: function (nom, motif) {
      return use(function (c) { return c.from('demandes_acces').insert({ nom: nom || null, email: A.user && A.user.email ? A.user.email.toLowerCase() : null, motif: motif }).select().single(); });
    },
    myAccessRequest: function () {
      return use(function (c) { return c.from('demandes_acces').select('statut, cree_le').order('cree_le', { ascending: false }).limit(1); }).then(function (d) { return d && d[0] || null; });
    },
    // Accès direct à la base pour l'espace administrateur (les droits sont vérifiés par Supabase)
    db: function (fn) { return use(fn); },
    client: function () { return ready; },
    // Image envoyée dans le stockage public « site » : renvoie son adresse publique
    uploadImage: function (blob, path) {
      return use(function (c) { return c.storage.from('site').upload(path, blob, { upsert: true, contentType: blob.type || 'image/jpeg', cacheControl: '31536000' }); }).then(function () {
        return ready.then(function (c) { return c.storage.from('site').getPublicUrl(path).data.publicUrl; });
      });
    },
    listImages: function (folder) {
      return use(function (c) { return c.storage.from('site').list(folder || '', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } }); }).then(function (items) {
        return ready.then(function (c) { return (items || []).filter(function (x) { return x && x.id; }).map(function (x) { var p = (folder ? folder + '/' : '') + x.name; return { name: x.name, path: p, url: c.storage.from('site').getPublicUrl(p).data.publicUrl, size: x.metadata && x.metadata.size || 0 }; }); });
      });
    },
    removeImage: function (path) { return use(function (c) { return c.storage.from('site').remove([path]); }); },
    // Contenus modifiés depuis l'espace administrateur : remplacent ceux des fichiers contenus/*.js
    saveContent: function (key, value) {
      if (CONTENT_KEYS.indexOf(key) < 0) return Promise.reject(new Error('Section inconnue'));
      // Liste à identifiants (articles…) : on garde la trace des éléments du fichier, pour que ceux ajoutés plus tard
      // dans le fichier (par l'automatisation « Rédaction quotidienne ») s'affichent quand même.
      if (Array.isArray(value) && Array.isArray(ORIG[key])) value = { __liste: value, __base: ORIG[key].map(function (x) { return x && x.id; }).filter(Boolean) };
      return use(function (c) { return c.from('site_contenu').upsert({ cle: key, valeur: value, modifie_le: new Date().toISOString() }, { onConflict: 'cle' }); }).then(function () { applyContent(withKey(key, value)); });
    },
    resetContent: function (key) {
      return use(function (c) { return c.from('site_contenu').delete().eq('cle', key); }).then(function () { var cur = readCache(); delete cur[key]; applyContent(cur); });
    },
    originalContent: function (key) { return key in ORIG ? ORIG[key] : window[key]; },
    contentKeys: function () { return CONTENT_KEYS.slice(); },
    editedKeys: function () { return Object.keys(readCache()); },
    // Envoi d'un e-mail depuis la messagerie (fonction serveur « envoyer-email », voir docs/ESPACE-ADMIN.md)
    sendMail: function (to, subject, text, replyTo) {
      return use(function (c) { return c.functions.invoke('envoyer-email', { body: { to: to, subject: subject, text: text, reponse_a: replyTo || null } }); });
    }
  };

  // ---------- Contenus en ligne : appliqués avant l'affichage (copie locale), puis mis à jour ----------
  var CONTENT_KEYS = ['CASA_ARTICLES', 'CASA_LIEUX', 'CASA_BOUTIQUE', 'CASA_PRODUITS', 'CASA_VIDEOS', 'CASA_CULTURE', 'CASA_FONDS', 'CASA_APROPOS', 'CASA_LEGAL', 'CASA_LEGAL_MAJ', 'CASA_GAZETTE', 'CASA_GAZETTE_NUMERO', 'CASA_SPORT', 'CASA_CLUBS', 'CASA_JOUEURS', 'CASA_PARTENAIRES', 'CASA_ABONNEMENTS', 'CASA_CLUBHOUSE', 'CASA_REGLEMENTS', 'CASA_STADES', 'CASA_RETOUCHES', 'CASA_RESEAUX'];
  var CKEY = 'cb-contenu';
  var ORIG = {};
  CONTENT_KEYS.forEach(function (k) { try { ORIG[k] = JSON.parse(JSON.stringify(window[k] === undefined ? null : window[k])); } catch (e) { ORIG[k] = window[k]; } });
  function readCache() { try { var v = JSON.parse(localStorage.getItem(CKEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function withKey(k, v) { var cur = readCache(); cur[k] = v; return cur; }
  function applyContent(map, quiet) {
    CONTENT_KEYS.forEach(function (k) {
      var v = Object.prototype.hasOwnProperty.call(map, k) ? map[k] : ORIG[k];
      if (v && typeof v === 'object' && Array.isArray(v.__liste)) {
        var base = v.__base || [], have = {};
        v.__liste.forEach(function (x) { if (x && x.id) have[x.id] = 1; });
        var nouveaux = (Array.isArray(ORIG[k]) ? ORIG[k] : []).filter(function (x) { return x && x.id && base.indexOf(x.id) < 0 && !have[x.id]; });
        v = nouveaux.concat(v.__liste);
      }
      try { window[k] = v == null ? v : JSON.parse(JSON.stringify(v)); } catch (e) { window[k] = v; }
    });
    try { localStorage.setItem(CKEY, JSON.stringify(map)); } catch (e) {}
    if (!quiet && window.CasaSite && window.CasaSite.refreshContent) window.CasaSite.refreshContent();
  }
  A.applyContent = applyContent;
  (function () { var c = readCache(); if (Object.keys(c).length) applyContent(c, true); })();
  if (!A.on) return;
  A.memberLive = true;

  function emit(u) { A.user = u; listeners.forEach(function (cb) { try { cb(u); } catch (e) {} }); }
  function toUser(session) {
    var u = session && session.user; if (!u) return null;
    var m = u.user_metadata || {};
    return { id: u.id, email: u.email || '', phone: u.phone ? '+' + String(u.phone).replace(/^\+/, '') : '', name: m.name || '', hasPassword: !!m.has_password || !!A.viaPassword, created: u.created_at || '' };
  }
  function use(fn) {
    return ready.then(function (c) {
      return fn(c).then(function (r) {
        if (r && r.error) {
          var msg = r.error.message || 'Erreur';
          if (/rate limit|seconds/i.test(msg)) msg = 'Trop de demandes : patientez une minute puis réessayez.';
          else if (/invalid|expired/i.test(msg) && /token|otp/i.test(msg)) msg = 'Code incorrect ou expiré.';
          else if (/phone.*(provider|disabled)|unsupported phone/i.test(msg)) msg = 'La connexion par SMS n’est pas encore activée.';
          else if (/signups not allowed/i.test(msg)) msg = 'Les inscriptions sont fermées pour le moment.';
          else if (/invalid login credentials/i.test(msg)) msg = 'Identifiant ou mot de passe incorrect. Première visite ? Créez votre compte avec l’onglet « Créer un compte ».';
          else if (/email not confirmed/i.test(msg)) msg = 'Adresse e-mail pas encore confirmée : ouvrez le lien reçu par e-mail.';
          else if (/password.*(at least|characters|short)/i.test(msg)) msg = 'Le mot de passe doit contenir au moins 8 caractères.';
          else if (/password.*(weak|pwned|known)/i.test(msg)) msg = 'Mot de passe trop simple : ajoutez des chiffres et des majuscules.';
          else if (/should be different/i.test(msg)) msg = 'Choisissez un mot de passe différent de l’ancien.';
          throw new Error(msg);
        }
        return r && r.data;
      });
    });
  }
  ready = new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = 'js/vendor/supabase-2.117.3.js'; // bibliothèque officielle Supabase, copiée localement
    s.onload = function () {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'implicit' } });
      client.auth.onAuthStateChange(function (ev, session) { if (ev === 'PASSWORD_RECOVERY') A.recovery = true; emit(toUser(session)); });
      client.auth.getSession().then(function (r) { emit(toUser(r.data && r.data.session)); });
      res(client);
    };
    s.onerror = function () { rej(new Error('Service de comptes injoignable. Vérifiez votre connexion.')); };
    document.head.appendChild(s);
  });
  ready.catch(function () {});
  // Version en ligne des contenus (lecture publique de la table site_contenu)
  ready.then(function (c) {
    return c.from('site_contenu').select('cle, valeur').then(function (r) {
      if (r.error || !Array.isArray(r.data)) return;
      var map = {}; r.data.forEach(function (row) { if (CONTENT_KEYS.indexOf(row.cle) >= 0) map[row.cle] = row.valeur; });
      if (JSON.stringify(map) !== JSON.stringify(readCache())) applyContent(map);
    });
  }).catch(function () {});
})();
