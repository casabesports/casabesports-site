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
    // Carte membre : enregistre le numéro dans la table « membres » (voir docs/CARTE-MEMBRE.md)
    registerMember: function (numero, prenom) {
      return use(function (c) { return c.from('membres').upsert({ id: A.user.id, numero: numero, prenom: prenom || null }, { onConflict: 'id' }); });
    },
    // Vérification par un partenaire (sans compte) : renvoie { prenom, depuis, statut } ou null
    verifyMember: function (numero) {
      return use(function (c) { return c.rpc('verifier_membre', { num: numero }); }).then(function (d) { return Array.isArray(d) ? (d[0] || null) : (d || null); });
    },
    signOut: function () { return use(function (c) { return c.auth.signOut(); }); }
  };
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
})();
