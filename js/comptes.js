/*!
 * Casa Besports — comptes abonnés (Supabase Auth).
 * Inscription et connexion sans mot de passe :
 *   - par e-mail : un lien de connexion est envoyé à l'adresse ;
 *   - par téléphone mobile : un code à 6 chiffres est envoyé par SMS.
 * Le compte est créé automatiquement à la première connexion.
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
    signOut: function () { return use(function (c) { return c.auth.signOut(); }); }
  };
  if (!A.on) return;

  function emit(u) { A.user = u; listeners.forEach(function (cb) { try { cb(u); } catch (e) {} }); }
  function toUser(session) {
    var u = session && session.user; if (!u) return null;
    var m = u.user_metadata || {};
    return { id: u.id, email: u.email || '', phone: u.phone ? '+' + String(u.phone).replace(/^\+/, '') : '', name: m.name || '' };
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
          throw new Error(msg);
        }
        return r && r.data;
      });
    });
  }
  ready = new Promise(function (res, rej) {
    var s = document.createElement('script');
    s.src = 'js/vendor/supabase-2.45.4.js'; // bibliothèque officielle Supabase, copiée localement
    s.onload = function () {
      client = window.supabase.createClient(cfg.url, cfg.anonKey, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'implicit' } });
      client.auth.onAuthStateChange(function (_e, session) { emit(toUser(session)); });
      client.auth.getSession().then(function (r) { emit(toUser(r.data && r.data.session)); });
      res(client);
    };
    s.onerror = function () { rej(new Error('Service de comptes injoignable. Vérifiez votre connexion.')); };
    document.head.appendChild(s);
  });
  ready.catch(function () {});
})();
