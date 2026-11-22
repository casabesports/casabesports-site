/*!
 * Casa Besports — Club House › Discussions : le chat entre amis BE+ (site et application).
 *  - Groupes ouverts : tout membre connecté les voit et les rejoint
 *  - Groupes à huis clos : sur invitation (code ou lien), invisibles des autres
 *  - Conversations privées à deux : avec un ami de groupe, ou avec son numéro de membre (carte du Club House)
 * Données chez Supabase (supabase/discussions.sql) : les droits sont vérifiés côté serveur.
 * Réservé aux 15 ans et plus (les jeunes restent dans le Vestiaire de leur club, avec leurs parents).
 * Branché dans js/app.js (CasaDiscussions.vals, onglet « Discussions » du Club House) et index.html.
 */
var CasaDiscussions = (function () {
  'use strict';
  var QUALITES = { supporter: 'Supporter', joueur: 'Joueur·se', coach: 'Coach', dirigeant: 'Dirigeant·e', arbitre: 'Arbitre', benevole: 'Bénévole', parent: 'Parent', media: 'Média' };
  var SPORTS = ['Football', 'Basket', 'Handball', 'Volley', 'Rugby', 'Tennis de table', 'Athlétisme', 'Water-polo', 'Natation', 'Cyclisme', 'Trail & course', 'Handisport', 'Autre'];
  var TYPES = { ouvert: 'Ouvert', huis_clos: 'Huis clos', prive: 'Privé' };
  var COULEURS = ['#10283a', '#2f6b4f', '#b5532f', '#3a5a8c', '#7a4f8f', '#8a6d1f', '#2a7f8f'];
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  // ---------- accès aux données (remplaçable pour les aperçus) ----------
  function C() { return window.CasaAuth && window.CasaAuth.on ? window.CasaAuth : null; }
  function uid() { var A = C(); return A && A.user ? A.user.id : null; }
  function db(fn) { return C().db(fn); }
  function rpc(nom, args) { return db(function (c) { return c.rpc(nom, args || {}); }); }

  var D = { user: null, profil: undefined, groupes: null, ouverts: null, msgs: {}, membres: {}, signal: null, nonLus: 0, sqlMissing: false, err: '' };
  var busy = {}, timer = null, app0 = null, dernierTour = 0;
  function missing(e) { return /does not exist|schema cache|PGRST20|42P01|42883|Could not find/i.test(String(e && e.message || e)); }
  function msgErr(e) { return String(e && e.message || e || 'Erreur').replace(/^.*?ERROR:\s*/, ''); }
  function fail(app, e) { if (missing(e)) D.sqlMissing = true; else D.err = msgErr(e); tick(app); }
  function tick(app) { app.setState({ dcTick: Date.now() }); }
  function ui(app) { return app.state.dc || {}; }
  function set(app, patch) { app.setState({ dc: Object.assign({}, ui(app), patch) }); }
  function setF(app, k, patch) { var o = {}; o[k] = Object.assign({}, ui(app)[k] || {}, patch); set(app, o); }
  function val(e) { return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; }
  function onF(app, k, f) { return function (e) { var o = {}; o[f] = val(e); setF(app, k, o); }; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function heure(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function quand(iso) {
    if (!iso) return ''; var d = new Date(iso), s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return 'à l’instant'; if (s < 3600) return Math.floor(s / 60) + ' min';
    var a = new Date(); a.setHours(0, 0, 0, 0);
    if (d >= a) return heure(d); if (s < 6 * 86400) return JOURS[d.getDay()].slice(0, 3) + '.';
    return d.getDate() + ' ' + MOIS[d.getMonth()];
  }
  function jourDe(iso) { var d = new Date(iso), a = new Date(); a.setHours(0, 0, 0, 0); var j = Math.round((a - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
    return j === 0 ? 'Aujourd’hui' : j === 1 ? 'Hier' : JOURS[d.getDay()].charAt(0).toUpperCase() + JOURS[d.getDay()].slice(1) + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; }
  function initiales(n) { return String(n || '?').split(/[\s’'·-]+/).filter(Boolean).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
  function couleur(n) { var h = 0; String(n || '').split('').forEach(function (c) { h = (h * 31 + c.charCodeAt(0)) >>> 0; }); return COULEURS[h % COULEURS.length]; }
  function lienInvit(code) { var base = typeof cbSiteUrl === 'function' ? cbSiteUrl() : location.origin + '/'; return base + '?groupe=' + encodeURIComponent(code); }

  // ---------- chargements ----------
  function resetIfUserChanged() { var u = uid(); if (u !== D.user) { D.user = u; D.profil = undefined; D.groupes = null; D.ouverts = null; D.msgs = {}; D.membres = {}; D.signal = null; D.nonLus = 0; } }
  function loadProfil(app) {
    if (!uid() || busy.profil) return; busy.profil = 1;
    db(function (c) { return c.from('discussions_profils').select('*').eq('user_id', uid()).limit(1); })
      .then(function (r) { D.profil = r && r[0] || null; D.sqlMissing = false; }, function (e) { D.profil = null; fail(app, e); })
      .then(function () { busy.profil = 0; if (D.profil) { loadGroupes(app); loadOuverts(app); } tick(app); });
  }
  function loadGroupes(app) {
    if (!uid() || busy.groupes) return; busy.groupes = 1; var u = uid();
    rpc('dc_mes_groupes').then(function (r) { if (D.user !== u) return; D.groupes = r || []; D.nonLus = D.groupes.reduce(function (a, g) { return a + (g.non_lus || 0); }, 0); }, function (e) { D.groupes = D.groupes || []; fail(app, e); })
      .then(function () { busy.groupes = 0; tick(app); });
  }
  function loadOuverts(app) {
    if (!uid() || busy.ouverts) return; busy.ouverts = 1;
    rpc('dc_groupes_ouverts').then(function (r) { D.ouverts = r || []; }, function (e) { D.ouverts = []; fail(app, e); }).then(function () { busy.ouverts = 0; tick(app); });
  }
  function loadSignal(app) {
    if (busy.signal) return; busy.signal = 1;
    rpc('dc_signalements').then(function (r) { D.signal = r || []; }, function () { D.signal = []; }).then(function () { busy.signal = 0; tick(app); });
  }
  // Messages d'un groupe : les 80 derniers, puis seulement les nouveaux
  function loadMsgs(app, g, force) {
    if (!g || busy['m' + g]) return; var cur = D.msgs[g]; if (cur && !force) return; busy['m' + g] = 1;
    var last = cur && cur.length ? cur[cur.length - 1].cree_le : null;
    db(function (c) { var q = c.from('discussions_messages').select('*').eq('groupe_id', g); return last ? q.gt('cree_le', last).order('cree_le').limit(200) : q.order('cree_le', { ascending: false }).limit(80); })
      .then(function (r) {
        r = r || []; if (!last) r = r.slice().reverse();
        var avant = (D.msgs[g] || []);
        var ids = {}; avant.forEach(function (m) { ids[m.id] = 1; });
        D.msgs[g] = avant.concat(r.filter(function (m) { return !ids[m.id]; }));
        if (r.length || !last) marquerLu(g);
      }, function (e) { D.msgs[g] = D.msgs[g] || []; fail(app, e); })
      .then(function () { busy['m' + g] = 0; tick(app); });
  }
  function loadMembres(app, g) {
    if (!g || busy['p' + g]) return; busy['p' + g] = 1;
    rpc('dc_membres', { g: g }).then(function (r) { D.membres[g] = r || []; }, function () { D.membres[g] = []; }).then(function () { busy['p' + g] = 0; tick(app); });
  }
  function marquerLu(g) {
    var gr = (D.groupes || []).find(function (x) { return x.id === g; });
    if (!gr) return;
    if (gr.non_lus) { D.nonLus = Math.max(0, D.nonLus - gr.non_lus); gr.non_lus = 0; }
    db(function (c) { return c.from('discussions_membres').update({ lu_le: new Date().toISOString() }).eq('groupe_id', g).eq('user_id', uid()); }).catch(function () {});
  }
  // Rafraîchissement : la conversation ouverte toutes les 5 s, la liste toutes les 30 s (seulement quand la page est visible)
  function tour() {
    var app = app0; if (!app) return;
    var s = app.state, U = ui(app);
    var ici = s.view === 'clubhouse' && s.chTab === 'discussions' && !!uid() && !!D.profil;
    if (!ici) { if (uid() && D.profil && Date.now() - dernierTour > 60000) { dernierTour = Date.now(); loadGroupes(app); } return; }
    if (document.hidden) return;
    if (U.g && D.msgs[U.g]) loadMsgs(app, U.g, true);
    if (Date.now() - dernierTour > 30000) { dernierTour = Date.now(); loadGroupes(app); }
  }
  function demarrer(app) { app0 = app; if (!timer) timer = setInterval(tour, 5000); }

  // ---------- actions ----------
  function ouvrir(app, g) { set(app, { g: g, panel: null, texte: '' }); loadMsgs(app, g, !!D.msgs[g]); loadMembres(app, g); }
  function apres(app, p, ok) {
    return p.then(function (r) { D.err = ''; if (ok) ok(r); }, function (e) { if (missing(e)) D.sqlMissing = true; app.say(msgErr(e)); }).then(function () { tick(app); });
  }
  function creerProfil(app) {
    var f = ui(app).profil || {}, s = app.state;
    var pseudo = String(f.pseudo != null ? f.pseudo : pseudoDefaut(s)).trim().replace(/\s+/g, ' ');
    if (pseudo.length < 2) { app.say('Choisissez un pseudo (2 lettres au moins)'); return; }
    if (!f.age) { app.say('Les discussions sont réservées aux 15 ans et plus'); return; }
    if (!f.charte) { app.say('Merci d’accepter la charte du Club House'); return; }
    apres(app, db(function (c) { return c.from('discussions_profils').upsert({ user_id: uid(), pseudo: pseudo.slice(0, 30), qualite: f.qualite || 'supporter', sport: f.sport || null, plus_de_15_ans: true, charte_acceptee: true }, { onConflict: 'user_id' }).select(); }),
      function (r) { D.profil = r && r[0] || { pseudo: pseudo, qualite: f.qualite || 'supporter' }; set(app, { profil: null, editProfil: false }); loadGroupes(app); loadOuverts(app); app.say('Bienvenue dans les discussions, ' + pseudo); var c = ui(app).code; if (c) rejoindreCode(app, c); });
  }
  function creerGroupe(app) {
    var f = ui(app).creer || {};
    var nom = String(f.nom || '').trim(); if (nom.length < 2) { app.say('Donnez un nom au groupe'); return; }
    apres(app, rpc('dc_creer_groupe', { nom: nom, description: f.desc || null, type: f.type === 'huis_clos' ? 'huis_clos' : 'ouvert', sport: f.sport || null }),
      function (g) { set(app, { creer: { open: false }, g: g, panel: f.type === 'huis_clos' ? 'inviter' : null }); D.msgs[g] = []; loadGroupes(app); loadMembres(app, g); app.say(f.type === 'huis_clos' ? 'Groupe à huis clos créé : invitez vos amis avec le code' : 'Groupe créé'); });
  }
  function rejoindre(app, g) {
    apres(app, rpc('dc_rejoindre', { g: g }), function () { D.ouverts = (D.ouverts || []).filter(function (x) { return x.id !== g; }); loadGroupes(app); ouvrir(app, g); app.say('Vous avez rejoint le groupe'); });
  }
  function rejoindreCode(app, code) {
    code = String(code || '').trim(); if (!code) { app.say('Saisissez le code d’invitation'); return; }
    apres(app, rpc('dc_rejoindre_code', { c: code }), function (g) { set(app, { code: '', joinOpen: false }); loadGroupes(app); ouvrir(app, g); app.say('Bienvenue dans le groupe'); });
  }
  function ecrireNumero(app) {
    var n = String(ui(app).numero || '').trim(); if (!n) { app.say('Saisissez le numéro de membre de votre ami'); return; }
    apres(app, rpc('dc_ecrire_numero', { num: n }), function (g) { set(app, { numero: '', amiOpen: false }); loadGroupes(app); ouvrir(app, g); });
  }
  function ecrireA(app, u) { apres(app, rpc('dc_ecrire_a', { autre: u }), function (g) { loadGroupes(app); ouvrir(app, g); }); }
  function envoyer(app) {
    var U = ui(app), g = U.g, t = String(U.texte || '').trim(); if (!g || !t || busy.envoi) return; busy.envoi = 1;
    set(app, { texte: '' });
    apres(app, db(function (c) { return c.from('discussions_messages').insert({ groupe_id: g, texte: t.slice(0, 1000) }); }), function () { loadMsgs(app, g, true); var gr = (D.groupes || []).find(function (x) { return x.id === g; }); if (gr) { gr.dernier_message = new Date().toISOString(); gr.dernier_texte = (D.profil ? D.profil.pseudo : 'Moi') + ' : ' + t.slice(0, 80); } })
      .then(function () { busy.envoi = 0; });
  }
  function supprimerMsg(app, g, id) {
    apres(app, db(function (c) { return c.from('discussions_messages').delete().eq('id', id); }), function () { Object.keys(D.msgs).forEach(function (k) { D.msgs[k] = D.msgs[k].filter(function (m) { return m.id !== id; }); }); if (D.signal) D.signal = D.signal.filter(function (x) { return x.message_id !== id; }); app.say('Message supprimé'); });
  }
  function signaler(app, id) {
    apres(app, db(function (c) { return c.from('discussions_signalements').insert({ message_id: id, motif: 'Signalé depuis la conversation' }); }), function () { app.say('Merci : le message est signalé à l’équipe Casa Besports'); });
  }
  function classer(app, sig) {
    apres(app, db(function (c) { return c.from('discussions_signalements').update({ traite: true }).eq('message_id', sig.message_id); }), function () { D.signal = (D.signal || []).filter(function (x) { return x.message_id !== sig.message_id; }); app.say('Signalement classé'); });
  }
  function quitter(app, g) {
    apres(app, rpc('dc_quitter', { g: g }), function () { D.groupes = (D.groupes || []).filter(function (x) { return x.id !== g; }); delete D.msgs[g]; set(app, { g: null, panel: null, confirmQuit: false }); loadOuverts(app); app.say('Vous avez quitté la conversation'); });
  }
  function retirer(app, g, u) {
    apres(app, db(function (c) { return c.from('discussions_membres').delete().eq('groupe_id', g).eq('user_id', u); }), function () { loadMembres(app, g); loadGroupes(app); app.say('Membre retiré du groupe'); });
  }
  function nommer(app, g, u) { apres(app, rpc('dc_nommer_animateur', { g: g, u: u }), function () { loadMembres(app, g); app.say('Nouvel animateur nommé'); }); }
  function changerCode(app, g) { apres(app, rpc('dc_changer_code', { g: g }), function () { loadGroupes(app); app.say('Nouveau code créé : l’ancien ne fonctionne plus'); }); }
  function copier(app, txt, ok) {
    var fini = function () { app.say(ok); };
    try { if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) { navigator.share({ title: 'Rejoins-moi sur BE+', text: txt }).catch(function () {}); return; } } catch (e) {}
    try { navigator.clipboard.writeText(txt).then(fini, function () { app.say(txt); }); } catch (e) { app.say(txt); }
  }
  function pseudoDefaut(s) { var n = String(s.name || '').trim(); if (!n && s.email) n = s.email.split('@')[0]; var p = n.split(/\s+/); return p[0] ? p[0].charAt(0).toUpperCase() + p[0].slice(1) + (p[1] ? ' ' + p[1].charAt(0).toUpperCase() + '.' : '') : ''; }

  // ---------- valeurs pour la page ----------
  function vals(app, ctx) {
    var s = app.state, A = C(), on = !!A, U = ui(app);
    if (on) { resetIfUserChanged(); demarrer(app); }
    var logged = !!(s.loggedIn && uid());
    var ici = ctx.V === 'clubhouse' && s.chTab === 'discussions';
    if (on && logged && D.profil === undefined) loadProfil(app);
    if (on && logged && D.profil && ici) { if (D.groupes === null) loadGroupes(app); if (D.ouverts === null) loadOuverts(app); if (s.role === 'admin' && D.signal === null) loadSignal(app); }
    var badge = logged && D.profil ? D.nonLus : 0;
    var out = { badge: badge, badgeTxt: badge > 99 ? '99+' : String(badge), hasBadge: badge > 0 };
    if (!ici) return out;

    var groupes = D.groupes || [];
    var g = U.g && groupes.some(function (x) { return x.id === U.g; }) ? U.g : null;
    if (g && on && !D.msgs[g]) loadMsgs(app, g);
    if (g && on && !D.membres[g]) loadMembres(app, g);
    var cur = g ? groupes.find(function (x) { return x.id === g; }) : null;
    var moi = uid();
    var pf = Object.assign({ pseudo: null, qualite: 'supporter', sport: '', age: false, charte: false }, U.profil || {});
    if (pf.pseudo == null) pf.pseudo = D.profil ? D.profil.pseudo : pseudoDefaut(s);
    var cr = Object.assign({ open: false, nom: '', desc: '', type: 'ouvert', sport: '' }, U.creer || {});
    var filtre = U.sport || 'Tous';
    var q = String(U.q || '').trim().toLowerCase();

    var titreDe = function (x) { return x.type === 'prive' ? (x.autre_pseudo || 'Conversation privée') : x.nom; };
    var liste = groupes.filter(function (x) { return !q || titreDe(x).toLowerCase().indexOf(q) >= 0; }).map(function (x) {
      var t = titreDe(x);
      return { id: x.id, titre: t, ini: initiales(t), color: x.type === 'prive' ? couleur(t) : x.type === 'huis_clos' ? '#10283a' : '#2f6b4f', apercu: x.dernier_texte || (x.type === 'prive' ? 'Dites bonjour 👋' : 'Aucun message pour l’instant'),
        quand: quand(x.dernier_message), type: TYPES[x.type], tcls: 'dc-t-' + x.type, prive: x.type === 'prive', huisClos: x.type === 'huis_clos', ouvert: x.type === 'ouvert',
        sous: x.type === 'prive' ? (QUALITES[x.autre_qualite] || 'Ami') : x.membres + ' membre' + (x.membres > 1 ? 's' : '') + (x.sport ? ' · ' + x.sport : ''),
        nonLus: String(x.non_lus || 0), hasNonLus: (x.non_lus || 0) > 0, cls: (x.id === g ? 'is-on' : '') + ((x.non_lus || 0) > 0 ? ' is-new' : ''), sel: x.id === g ? 'true' : 'false',
        ouvrir: function () { ouvrir(app, x.id); } };
    });
    var ouverts = (D.ouverts || []).filter(function (x) { return (filtre === 'Tous' || x.sport === filtre) && (!q || x.nom.toLowerCase().indexOf(q) >= 0); }).map(function (x) {
      return { titre: x.nom, ini: initiales(x.nom), desc: x.description || '', hasDesc: !!x.description, sport: x.sport || 'Tous sports', membres: x.membres + ' membre' + (x.membres > 1 ? 's' : ''), quand: x.dernier_message ? 'actif ' + quand(x.dernier_message) : '', rejoindre: function () { rejoindre(app, x.id); } };
    });

    // ----- la conversation ouverte -----
    var conv = { has: !!cur };
    if (cur) {
      var msgs = D.msgs[g] || [], prev = null, jour = '';
      var anim = cur.role === 'animateur';
      var membres = D.membres[g] || [];
      conv = { has: true, id: g, titre: titreDe(cur), ini: initiales(titreDe(cur)), color: liste.find(function (x) { return x.id === g; }).color,
        type: TYPES[cur.type], tcls: 'dc-t-' + cur.type, prive: cur.type === 'prive', huisClos: cur.type === 'huis_clos', ouvert: cur.type === 'ouvert', notPrive: cur.type !== 'prive',
        sous: cur.type === 'prive' ? 'Conversation privée · ' + (QUALITES[cur.autre_qualite] || 'Ami') : cur.membres + ' membre' + (cur.membres > 1 ? 's' : '') + (cur.sport ? ' · ' + cur.sport : '') + (cur.type === 'huis_clos' ? ' · visible des membres seulement' : ''),
        desc: cur.description || '', hasDesc: !!cur.description && cur.type !== 'prive', anim: anim,
        chargement: !D.msgs[g], vide: !!D.msgs[g] && !msgs.length,
        videTxt: cur.type === 'prive' ? 'Votre conversation privée commence ici. Seuls vous deux la lisez.' : cur.type === 'huis_clos' ? 'Groupe à huis clos : seuls les membres invités lisent ces messages. Invitez vos amis avec le code.' : 'Lancez la discussion : un avis sur le match, un rendez-vous, une question…',
        msgs: msgs.map(function (m) {
          var mine = m.user_id === moi, j = jourDe(m.cree_le), suite = prev && prev.user_id === m.user_id && j === jour && (new Date(m.cree_le) - new Date(prev.cree_le)) < 5 * 60000;
          var sep = j !== jour; jour = j; prev = m;
          return { id: m.id, texte: m.texte, auteur: m.auteur || 'Membre', qualite: QUALITES[m.qualite] || '', hasQualite: !!QUALITES[m.qualite], ini: initiales(m.auteur), color: couleur(m.auteur),
            heure: heure(new Date(m.cree_le)), mine: mine, other: !mine, cls: (mine ? 'is-mine' : 'is-other') + (suite ? ' is-suite' : ''), showHead: !mine && !suite && cur.type !== 'prive', showAvatar: !mine && !suite,
            sep: sep, jour: j, canDel: mine || anim || s.role === 'admin', canReport: !mine,
            supprimer: function () { supprimerMsg(app, g, m.id); }, signaler: function () { signaler(app, m.id); } };
        }),
        texte: U.texte || '', onTexte: function (e) { set(app, { texte: val(e) }); }, reste: String(1000 - String(U.texte || '').length),
        onTouche: function (e) { if (e && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(app); } },
        envoyer: function () { envoyer(app); }, retour: function () { set(app, { g: null, panel: null }); },
        panelMembres: U.panel === 'membres', panelInviter: U.panel === 'inviter',
        voirMembres: function () { set(app, { panel: U.panel === 'membres' ? null : 'membres' }); loadMembres(app, g); },
        voirInviter: function () { set(app, { panel: U.panel === 'inviter' ? null : 'inviter' }); },
        fermerPanel: function () { set(app, { panel: null }); },
        code: cur.code || '', hasCode: !!cur.code, lien: cur.code ? lienInvit(cur.code) : '',
        copierLien: function () { copier(app, 'Rejoins le groupe « ' + cur.nom + ' » sur BE+ : ' + lienInvit(cur.code) + ' (code ' + cur.code + ')', 'Lien d’invitation copié'); },
        copierCode: function () { copier(app, cur.code, 'Code copié : ' + cur.code); },
        changerCode: function () { changerCode(app, g); },
        membres: membres.map(function (p) { return { pseudo: p.pseudo || 'Membre', ini: initiales(p.pseudo), color: couleur(p.pseudo), qualite: QUALITES[p.qualite] || '', anim: p.role === 'animateur', moi: !!p.moi,
          canDm: !p.moi && cur.type !== 'prive', ecrire: function () { ecrireA(app, p.user_id); },
          canKick: anim && !p.moi && cur.type !== 'prive', retirer: function () { retirer(app, g, p.user_id); },
          canNommer: anim && !p.moi && p.role !== 'animateur' && cur.type !== 'prive', nommer: function () { nommer(app, g, p.user_id); } }; }),
        confirmQuit: !!U.confirmQuit, noConfirm: !U.confirmQuit, demanderQuitter: function () { set(app, { confirmQuit: true }); }, annulerQuitter: function () { set(app, { confirmQuit: false }); },
        quitter: function () { quitter(app, g); }, quitterLabel: cur.type === 'prive' ? 'Fermer la conversation' : 'Quitter le groupe' };
    }

    var sportOpts = [{ v: '', l: 'Tous sports' }].concat(SPORTS.map(function (x) { return { v: x, l: x }; }));
    var page = {
      on: on, off: !on, sqlMissing: D.sqlMissing, isAdmin: s.role === 'admin', err: D.err, hasErr: !!D.err && !D.sqlMissing,
      logged: logged, notLogged: !logged, login: function () { app.setState({ loginOpen: true, linkSent: false }); },
      loading: logged && on && D.profil === undefined,
      needProfil: logged && on && D.profil === null && !D.sqlMissing, ready: logged && on && !!D.profil,
      inConv: !!cur, noConv: !cur, layoutCls: cur ? 'is-conv' : 'is-liste',
      moi: D.profil ? { pseudo: D.profil.pseudo, ini: initiales(D.profil.pseudo), color: couleur(D.profil.pseudo), qualite: QUALITES[D.profil.qualite] || '', sport: D.profil.sport || '' } : {},
      editProfil: function () { set(app, { editProfil: !U.editProfil, profil: { pseudo: D.profil.pseudo, qualite: D.profil.qualite, sport: D.profil.sport || '', age: true, charte: true } }); },
      editingProfil: !!U.editProfil && !!D.profil,
      pf: { pseudo: pf.pseudo, qualite: pf.qualite, sport: pf.sport || '', age: !!pf.age, charte: !!pf.charte, onPseudo: onF(app, 'profil', 'pseudo'), onQualite: onF(app, 'profil', 'qualite'), onSport: onF(app, 'profil', 'sport'), onAge: onF(app, 'profil', 'age'), onCharte: onF(app, 'profil', 'charte'),
        qualites: Object.keys(QUALITES).map(function (k) { return { v: k, l: QUALITES[k] }; }), sports: sportOpts, valider: function () { creerProfil(app); } },
      cr: { open: cr.open, nom: cr.nom, desc: cr.desc, type: cr.type, sport: cr.sport, onNom: onF(app, 'creer', 'nom'), onDesc: onF(app, 'creer', 'desc'), onSport: onF(app, 'creer', 'sport'),
        ouvert: cr.type !== 'huis_clos', huisClos: cr.type === 'huis_clos', clsOuvert: cr.type !== 'huis_clos' ? 'is-on' : '', clsHuis: cr.type === 'huis_clos' ? 'is-on' : '',
        pOuvert: cr.type !== 'huis_clos' ? 'true' : 'false', pHuis: cr.type === 'huis_clos' ? 'true' : 'false',
        choisirOuvert: function () { setF(app, 'creer', { type: 'ouvert' }); }, choisirHuis: function () { setF(app, 'creer', { type: 'huis_clos' }); },
        toggle: function () { setF(app, 'creer', { open: !cr.open }); set(app, { joinOpen: false, amiOpen: false }); }, valider: function () { creerGroupe(app); }, sports: sportOpts },
      joinOpen: !!U.joinOpen, toggleJoin: function () { set(app, { joinOpen: !U.joinOpen, amiOpen: false, creer: { open: false } }); },
      code: U.code || '', onCode: function (e) { set(app, { code: String(val(e) || '').toUpperCase() }); }, rejoindreCode: function () { rejoindreCode(app, U.code); },
      onToucheCode: function (e) { if (e && e.key === 'Enter') rejoindreCode(app, U.code); },
      amiOpen: !!U.amiOpen, toggleAmi: function () { set(app, { amiOpen: !U.amiOpen, joinOpen: false, creer: { open: false } }); },
      numero: U.numero || '', onNumero: function (e) { set(app, { numero: String(val(e) || '').toUpperCase() }); }, ecrireNumero: function () { ecrireNumero(app); },
      monNumero: ctx.memberNo || '', hasNumero: !!ctx.memberNo,
      q: U.q || '', onQ: function (e) { set(app, { q: val(e) }); },
      liste: liste, noListe: D.groupes !== null && !groupes.length, loadingListe: D.groupes === null,
      ouverts: ouverts, noOuverts: D.ouverts !== null && !ouverts.length,
      sports: ['Tous'].concat(SPORTS.slice(0, 8)).map(function (x) { return { label: x, cls: x === filtre ? 'is-on' : '', pressed: x === filtre ? 'true' : 'false', pick: function () { set(app, { sport: x }); } }; }),
      conv: conv,
      signal: (D.signal || []).map(function (x) { return { groupe: x.groupe, type: TYPES[x.type] || '', auteur: x.auteur || 'Membre', texte: x.texte, motif: x.motif || '', nb: x.nb > 1 ? x.nb + ' signalements' : '1 signalement', quand: quand(x.cree_le),
        supprimer: function () { supprimerMsg(app, null, x.message_id); }, classer: function () { classer(app, x); } }; }),
      hasSignal: s.role === 'admin' && (D.signal || []).length > 0, signalN: String((D.signal || []).length)
    };
    out.page = page;
    return out;
  }

  // Lien d'invitation « ?groupe=CODE » : on garde le code, il sert dès que la personne est prête
  function invitation(app, code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); if (!code) return;
    set(app, { code: code, joinOpen: true });
    var essai = 0;
    (function attendre() {
      if (uid() && D.profil) { rejoindreCode(app, code); return; }
      if (++essai < 20) setTimeout(attendre, 1500);
    })();
  }

  return { vals: vals, invitation: invitation, _D: D };
})();
