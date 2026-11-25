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
    // Accueil personnalisé de l'abonné (sports, clubs, rubriques, couleurs) : gardé dans son profil, retrouvé sur tous ses appareils
    savePrefs: function (prefs) {
      return use(function (c) { return c.auth.updateUser({ data: { accueil: prefs } }); });
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
    // Créer ou changer son mot de passe (une fois connecté), puis VÉRIFIER la connexion :
    // on se reconnecte aussitôt avec l'identifiant du compte + ce mot de passe, et on contrôle que c'est bien
    // le même compte (même id). Renvoie { verifie: true|false, identifiant, raison }.
    setPassword: function (password) {
      var avant = A.user;
      return use(function (c) { return c.auth.updateUser({ password: password, data: { has_password: true } }); }).then(function () {
        if (A.user) A.user.hasPassword = true;
        var ident = A.identifiant(avant);
        if (!ident) return { verifie: false, identifiant: '', raison: 'Aucun identifiant confirmé sur ce compte.' };
        var cred = ident.email ? { email: ident.email, password: password } : { phone: ident.phone, password: password };
        A.verifPw = true; A.viaPassword = true;
        return use(function (c) { return c.auth.signInWithPassword(cred); }).then(function (d) {
          A.verifPw = false;
          var memeCompte = !!(d && d.user && avant && d.user.id === avant.id);
          return { verifie: memeCompte, identifiant: ident.label, raison: memeCompte ? '' : 'La connexion a ouvert un autre compte.' };
        }, function (e) { A.verifPw = false; return { verifie: false, identifiant: ident.label, raison: e.message }; });
      });
    },
    // Identifiant de connexion du compte : e-mail confirmé en priorité, sinon numéro de mobile
    identifiant: function (u) {
      u = u || A.user; if (!u) return null;
      if (u.email && u.emailOk) return { email: u.email.toLowerCase(), label: u.email.toLowerCase() };
      if (u.phone) return { phone: u.phone, label: u.phone };
      if (u.email) return { email: u.email.toLowerCase(), label: u.email.toLowerCase() };
      return null;
    },
    // Ajouter son e-mail à un compte créé par SMS. Supabase refuse une adresse déjà utilisée par un autre compte :
    // l'erreur porte alors code = 'existe' (le site propose de supprimer ce compte en double).
    linkEmail: function (email) {
      email = String(email || '').trim().toLowerCase();
      return use(function (c) { return c.auth.updateUser({ email: email }, { emailRedirectTo: location.origin + location.pathname }); });
    },
    // Supprimer le compte tout juste créé quand la personne en avait déjà un (voir supabase/comptes.sql) puis se déconnecter
    deleteDuplicate: function () {
      return use(function (c) { return c.rpc('supprimer_compte_doublon'); }).then(function () {
        return use(function (c) { return c.auth.signOut(); }).catch(function () {});
      });
    },
    // Dernier compte utilisé sur cet appareil (e-mail / mobile) : sert à prévenir avant d'en créer un deuxième
    lastAccount: function () { try { var v = JSON.parse(localStorage.getItem('cb-compte-appareil') || 'null'); return v && (v.email || v.phone) ? v : null; } catch (e) { return null; } },
    // Mot de passe oublié : lien de réinitialisation par e-mail
    resetPassword: function (email) {
      return use(function (c) { return c.auth.resetPasswordForEmail(String(email).trim().toLowerCase(), { redirectTo: location.origin + location.pathname }); });
    },
    recovery: false,
    // Demandes du formulaire de contact, newsletter, commandes : table « messages » (voir supabase/messages.sql)
    // d.pieces (facultatif) : pièces jointes déjà déposées avec uploadPiece('contact', fichier)
    saveLead: function (d) {
      var ligne = { source: d.source, nom: d.nom, email: d.email, telephone: d.telephone, ville: d.ville, profil: d.profil, sujet: d.sujet, message: d.message, consentement: d.consentement, page: d.page };
      if (d.pieces && d.pieces.length) ligne.pieces = d.pieces.slice(0, 5);
      return use(function (c) { return c.from('messages').insert(ligne); });
    },
    // ---------- Pièces jointes (espace privé « pieces-jointes », voir supabase/discussions-plus.sql) ----------
    // Formats acceptés et taille maximale (10 Mo par fichier)
    PIECES_MAX: 10485760,
    PIECES_ACCEPT: 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.txt,.csv',
    pieceOk: function (f) {
      if (!f) return 'Fichier introuvable';
      if (f.size > A.PIECES_MAX) return '« ' + f.name + ' » dépasse 10 Mo';
      var ok = /^image\//.test(f.type) || /\.(pdf|docx?|xlsx?|pptx?|odt|ods|txt|csv|jpe?g|png|webp|gif|heic|heif)$/i.test(f.name || '');
      return ok ? '' : '« ' + f.name + ' » : format non accepté (photos, PDF, Word, Excel, PowerPoint, texte)';
    },
    // Dépose un fichier dans un dossier (« contact », « admin » ou « discussions/<id du groupe> ») : renvoie { chemin, nom, type, taille }
    uploadPiece: function (dossier, f) {
      var err = A.pieceOk(f); if (err) return Promise.reject(new Error(err));
      var nom = String(f.name || 'fichier').slice(0, 120);
      var propre = nom.normalize ? nom.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : nom;
      propre = propre.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-80) || 'fichier';
      var d = new Date(), alea = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      var chemin = dossier + '/' + d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + alea + '-' + propre;
      var type = f.type || ({ pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', txt: 'text/plain', csv: 'text/csv', heic: 'image/heic' })[String(nom.split('.').pop()).toLowerCase()] || 'application/octet-stream';
      return use(function (c) { return c.storage.from('pieces-jointes').upload(chemin, f, { upsert: false, contentType: type }); }).then(function () {
        return { chemin: chemin, nom: nom, type: type, taille: f.size || 0 };
      }, function (e) {
        var m = String(e && e.message || e);
        if (/bucket not found|not found/i.test(m)) throw Object.assign(new Error('Les pièces jointes ne sont pas encore activées (supabase/discussions-plus.sql)'), { pasActive: true });
        if (/mime|type/i.test(m)) throw new Error('« ' + nom + ' » : format non accepté');
        if (/size|large|exceed/i.test(m)) throw new Error('« ' + nom + ' » dépasse 10 Mo');
        throw e;
      });
    },
    // Lien temporaire (1 heure) pour afficher ou télécharger une pièce jointe que l'on a le droit de voir
    pieceUrl: (function () {
      var cache = {};
      return function (chemin, telecharger) {
        var k = chemin + (telecharger ? '#dl' : ''), c0 = cache[k];
        if (c0 && c0.t > Date.now() - 50 * 60000) return c0.p;
        var p = use(function (c) { return c.storage.from('pieces-jointes').createSignedUrl(chemin, 3600, telecharger ? { download: telecharger === true ? true : String(telecharger) } : undefined); }).then(function (d) { return d && d.signedUrl; });
        cache[k] = { t: Date.now(), p: p };
        p.catch(function () { delete cache[k]; });
        return p;
      };
    })(),
    removePieces: function (chemins) {
      chemins = (chemins || []).filter(Boolean); if (!chemins.length) return Promise.resolve();
      return use(function (c) { return c.storage.from('pieces-jointes').remove(chemins); });
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
    // Étiquette et club (supabase/abonnes.sql) : { role: 'admin' | 'collaborateur' | 'redacteur' | 'correspondant', club } ou null.
    // Si abonnes.sql n'est pas encore lancé, se rabat sur mon_role().
    myAccess: function () {
      return use(function (c) { return c.rpc('mon_acces'); }).then(function (d) { var r = Array.isArray(d) ? d[0] : d; return r && r.role ? { role: r.role, club: r.club || null } : null; },
        function () { return A.myRole().then(function (r) { return r ? { role: r, club: null } : null; }); });
    },
    // Demande d'accès à l'espace rédaction (abonné connecté)
    requestAccess: function (nom, motif) {
      return use(function (c) { return c.from('demandes_acces').insert({ nom: nom || null, email: A.user && A.user.email ? A.user.email.toLowerCase() : null, motif: motif }).select().single(); });
    },
    myAccessRequest: function () {
      return use(function (c) { return c.from('demandes_acces').select('statut, cree_le').order('cree_le', { ascending: false }).limit(1); }).then(function (d) { return d && d[0] || null; });
    },
    // ---------- Espace rédaction : articles enregistrés en ligne (voir supabase/redaction.sql) ----------
    // Supabase ne renvoie à un membre de la rédaction QUE ses propres articles ; l'administrateur les reçoit tous.
    redacListe: function () {
      return use(function (c) { return c.from('redaction_articles').select('id, auteur_id, auteur_nom, statut, contenu, en_ligne, publier_le, modifie_le').order('modifie_le', { ascending: false }).limit(1000); });
    },
    redacEnregistrer: function (row) {
      return use(function (c) { return c.from('redaction_articles').upsert(row, { onConflict: 'id' }); });
    },
    // Renvoie true si l'article a bien été supprimé, false si Supabase a refusé (article d'un autre, déjà publié…)
    redacSupprimer: function (id) {
      return use(function (c) { return c.from('redaction_articles').delete().eq('id', id).select('id'); }).then(function (d) { return !!(d && d.length); });
    },
    // Articles publiés depuis l'espace rédaction, pour tous les visiteurs (version en ligne seulement)
    articlesEnLigne: function () {
      return use(function (c) { return c.rpc('articles_en_ligne'); }).then(function (d) { return d || []; });
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
      // Résultats : on note les matchs et compétitions du fichier contenus/sport.js vus au moment de publier, pour que
      // ceux que la tâche « Résultats et classements » ajoute ensuite s'affichent quand même (voir sportFusion).
      if (key === 'CASA_SPORT' && value && ORIG[key]) value = Object.assign({}, value, { __fichier: sportIds(ORIG[key]) });
      return use(function (c) { return c.from('site_contenu').upsert({ cle: key, valeur: value, modifie_le: new Date().toISOString() }, { onConflict: 'cle' }); }).then(function () { applyContent(withKey(key, value)); });
    },
    resetContent: function (key) {
      return use(function (c) { return c.from('site_contenu').delete().eq('cle', key); }).then(function () { var cur = readCache(); delete cur[key]; applyContent(cur); });
    },
    originalContent: function (key) { return key in ORIG ? ORIG[key] : window[key]; },
    contentKeys: function () { return CONTENT_KEYS.slice(); },
    editedKeys: function () { return Object.keys(readCache()); },
    // Envoi d'un e-mail depuis la messagerie (fonction serveur « envoyer-email », voir docs/ESPACE-ADMIN.md)
    // pieces (facultatif) : fichiers déposés avec uploadPiece('admin', fichier), envoyés en pièces jointes de l'e-mail
    sendMail: function (to, subject, text, replyTo, pieces) {
      return A.appel('envoyer-email', { to: to, subject: subject, text: text, reponse_a: replyTo || null, pieces: pieces && pieces.length ? pieces : undefined });
    },
    // Appel d'une fonction serveur Supabase (Edge Function). En cas d'échec, on remonte la vraie raison
    // (fonction absente, clé manquante, refus…) ; e.pasActive = la fonction n'est pas encore déployée ou configurée.
    appel: function (nom, body) {
      if (!ready) return Promise.reject(Object.assign(new Error('Comptes non configurés'), { pasActive: true }));
      return ready.then(function (c) {
        return c.functions.invoke(nom, { body: body || {} }).then(function (r) {
          if (!r.error) return r.data;
          var ctx = r.error.context, status = ctx && ctx.status;
          var lire = ctx && typeof ctx.json === 'function' ? ctx.json().catch(function () { return {}; }) : Promise.resolve({});
          return lire.then(function (b) {
            var e = new Error((b && b.error) || r.error.message || 'Erreur');
            e.pasActive = !status || status === 404 || status === 501;
            throw e;
          });
        });
      });
    }
  };

  // ---------- Contenus en ligne : appliqués avant l'affichage (copie locale), puis mis à jour ----------
  var CONTENT_KEYS = ['CASA_ARTICLES', 'CASA_LIEUX', 'CASA_BOUTIQUE', 'CASA_PRODUITS', 'CASA_VIDEOS', 'CASA_CULTURE', 'CASA_FONDS', 'CASA_APROPOS', 'CASA_LEGAL', 'CASA_LEGAL_MAJ', 'CASA_GAZETTE', 'CASA_GAZETTE_NUMERO', 'CASA_SPORT', 'CASA_CLUBS', 'CASA_JOUEURS', 'CASA_PARTENAIRES', 'CASA_ABONNEMENTS', 'CASA_OFFRES_PRO', 'CASA_TARIFS', 'CASA_CLUBHOUSE', 'CASA_REGLEMENTS', 'CASA_STADES', 'CASA_RETOUCHES', 'CASA_RESEAUX', 'CASA_ENCARTS', 'CASA_PODCAST', 'CASA_QUIZ', 'CASA_HANDISPORT'];
  var CKEY = 'cb-contenu';
  var ORIG = {};
  CONTENT_KEYS.forEach(function (k) { try { ORIG[k] = JSON.parse(JSON.stringify(window[k] === undefined ? null : window[k])); } catch (e) { ORIG[k] = window[k]; } });
  function readCache() { try { var v = JSON.parse(localStorage.getItem(CKEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  function withKey(k, v) { var cur = readCache(); cur[k] = v; return cur; }
  function sportIds(sp) {
    var comps = []; Object.keys((sp && sp.comps) || {}).forEach(function (d) { (sp.comps[d] || []).forEach(function (c) { if (c && c.id) comps.push(c.id); }); });
    return { matches: ((sp && sp.matches) || []).map(function (m) { return m && m.id; }).filter(Boolean), comps: comps };
  }
  // Version publiée depuis l'admin + nouveautés du fichier contenus/sport.js (mis à jour automatiquement) :
  // - un match ou une compétition ajouté au fichier après la publication s'affiche ;
  // - un match laissé « à venir » dans l'admin prend le score que le fichier connaît maintenant ;
  // - ce que l'admin a supprimé ne revient pas, ce que l'admin a saisi reste prioritaire.
  function sportFusion(adm, fic) {
    if (!adm || !fic || typeof adm !== 'object') return adm;
    var out = JSON.parse(JSON.stringify(adm)), vu = adm.__fichier || null, depuis = String(adm.maj || '').slice(0, 10);
    var nouveau = function (id, liste, m) { return vu ? liste.indexOf(id) < 0 : !!(m && m.date && depuis && m.date >= depuis); };
    out.comps = out.comps || {}; out.tables = out.tables || {}; out.matches = out.matches || []; out.teamClub = out.teamClub || {};
    var aComp = {}; Object.keys(out.comps).forEach(function (d) { (out.comps[d] || []).forEach(function (c) { aComp[c.id] = 1; }); });
    Object.keys(fic.comps || {}).forEach(function (d) {
      (fic.comps[d] || []).forEach(function (c) {
        if (!c || !c.id || aComp[c.id] || (vu && vu.comps.indexOf(c.id) >= 0)) return;
        (out.comps[d] = out.comps[d] || []).push(c); aComp[c.id] = 1;
        if (fic.tables && fic.tables[c.id] && !out.tables[c.id]) out.tables[c.id] = fic.tables[c.id];
      });
    });
    var aM = {}; out.matches.forEach(function (m) { if (m && m.id) aM[m.id] = m; });
    (fic.matches || []).forEach(function (m) {
      if (!m || !m.id) return;
      var a = aM[m.id];
      if (a) { if ((a.hs == null || a.hs === '') && m.hs != null && m.as != null) { a.hs = m.hs; a.as = m.as; a.status = 'done'; } return; }
      if (!aComp[m.comp] || !nouveau(m.id, vu ? vu.matches : [], m)) return;
      out.matches.push(m); aM[m.id] = m;
    });
    Object.keys(fic.teamClub || {}).forEach(function (t) { if (!out.teamClub[t]) out.teamClub[t] = fic.teamClub[t]; });
    if (fic.maj && (!out.maj || fic.maj > out.maj)) out.majFichier = fic.maj;
    delete out.__fichier;
    return out;
  }
  function applyContent(map, quiet) {
    CONTENT_KEYS.forEach(function (k) {
      var v = Object.prototype.hasOwnProperty.call(map, k) ? map[k] : ORIG[k];
      if (k === 'CASA_SPORT' && v !== ORIG[k]) v = sportFusion(v, ORIG[k]);
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
  // Client Supabase brut (canaux temps réel du quiz en réseau, js/jeux.js)
  A.client = function () { return ready; };

  function emit(u) {
    A.user = u;
    if (u && (u.email || u.phone)) { try { localStorage.setItem('cb-compte-appareil', JSON.stringify({ email: u.email ? u.email.toLowerCase() : '', phone: u.phone || '' })); } catch (e) {} }
    listeners.forEach(function (cb) { try { cb(u); } catch (e) {} }); }
  function toUser(session) {
    var u = session && session.user; if (!u) return null;
    var m = u.user_metadata || {};
    return { id: u.id, email: u.email || '', phone: u.phone ? '+' + String(u.phone).replace(/^\+/, '') : '', emailOk: !!u.email_confirmed_at, emailPending: u.new_email || '', name: m.name || '', hasPassword: !!m.has_password || !!A.viaPassword, created: u.created_at || '', prefs: m.accueil && typeof m.accueil === 'object' ? m.accueil : null };
  }
  function use(fn) {
    return ready.then(function (c) {
      return fn(c).then(function (r) {
        if (r && r.error) {
          var msg = r.error.message || 'Erreur', code = r.error.code || '';
          if (code === 'email_exists' || /already (been )?registered|email.*already.*(exists|use)/i.test(msg)) { var ex = new Error('Cette adresse e-mail a déjà un compte Casa Besports.'); ex.code = 'existe'; throw ex; }
          if (code === 'phone_exists' || /phone.*already.*(registered|exists|use)/i.test(msg)) { var ex2 = new Error('Ce numéro de mobile a déjà un compte Casa Besports.'); ex2.code = 'existe'; throw ex2; }
          if (/rate limit|seconds/i.test(msg)) msg = 'Trop de demandes : patientez une minute puis réessayez.';
          else if (/invalid|expired/i.test(msg) && /token|otp/i.test(msg)) msg = 'Code incorrect ou expiré.';
          else if (/phone.*(provider|disabled)|unsupported phone/i.test(msg)) msg = 'La connexion par SMS n’est pas encore activée.';
          else if (/supprimer_compte_doublon/i.test(msg)) msg = 'Suppression impossible pour l’instant (réglage Supabase à faire : supabase/comptes.sql).';
          else if (/signups not allowed/i.test(msg)) msg = 'Les inscriptions sont fermées pour le moment.';
          else if (/invalid login credentials/i.test(msg)) msg = 'Identifiant ou mot de passe incorrect. Pas encore de mot de passe ? Choisissez « Connexion par lien ou SMS » avec l’e-mail ou le mobile utilisé la première fois : vous retrouverez votre compte, sans en créer un deuxième.';
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
