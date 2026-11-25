/*!
 * Casa Besports — Les causeries d'avant-match, dans le Vestiaire.
 *  - Le coach (le club) prépare sa causerie : PDF déposé (affiché tout seul, page par page), photos de son travail
 *    (tableau blanc, feuille, carnet : recadrées et rendues lisibles), et/ou le modèle Casa en ligne
 *    (mot du coach, dernier match, plan de jeu, compo, schémas tactiques, tireurs et marquages, 3 clés, phrase du jour).
 *  - Il choisit qui l'ouvre (convoqués du match, toute l'équipe, ou sa liste + personnes ajoutées) et quand.
 *  - Les joueurs la lisent dans l'appli et appuient sur « J'ai lu » ; le coach voit qui l'a lue.
 *  - Export PDF complet (A4 ou format téléphone), nom du lecteur en bas de chaque page.
 * Données : supabase/causeries.sql (droits vérifiés par Supabase). Tableau tactique : js/causeries-tableau.js.
 * Chargé à la demande depuis le Vestiaire (app.openCauseries).
 */
var CasaCauseries = (function () {
  'use strict';
  var T = window.CasaTableau;
  var PDFJS = 'js/vendor/pdfjs-3.11.174/pdf.min.js', PDFJS_W = 'js/vendor/pdfjs-3.11.174/pdf.worker.min.js';
  var GENRES = { pdf: ['PDF déposé', 'Votre document, tel quel. Il s’affiche tout seul dans le Vestiaire, page par page.'], photo: ['Photo de mon travail', 'Votre tableau blanc, votre feuille ou votre carnet : une photo et c’est dans la causerie.'], modele: ['Modèle Casa', 'Mot du coach, compo, schémas, coups de pied arrêtés, tireurs, 3 clés, phrase du jour. Exportable en PDF.'] };
  var ACCES = { convoques: ['Les convoqués du match', 'Les joueurs de l’équipe, sauf ceux qui ont répondu « Absent ». Suit la convocation toute seule.'], equipe: ['Toute l’équipe', 'Tous les joueurs validés de l’équipe, même absents.'], liste: ['Seulement ma liste', 'Uniquement les personnes cochées ou ajoutées ci-dessous.'] };
  var SECTIONS = { seniors: 'Seniors', jeunes: 'Jeunes', club: 'Tout le club' };
  var PARTIES = ['Plan de jeu', 'Attaque', 'Défense', 'Coups de pied arrêtés', 'Autre'];
  var JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'], MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var st = null;

  // ---------------------------------------------------------------- outils
  function el(tag, attrs) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else if (k === 'style') e.style.cssText = v;
      else if (k === 'value') e.value = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v); else e.setAttribute(k, v === true ? '' : v); });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; } e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
  function A() { return window.CasaAuth && window.CasaAuth.on ? window.CasaAuth : null; }
  function moi() { var a = A(); return a && a.user ? a.user.id : null; }
  function db(fn) { return A().db(fn); }
  function sto(fn) { return A().client().then(function (c) { return fn(c.storage.from('causeries')); }).then(function (r) { if (r && r.error) throw r.error; return r ? r.data : null; }); }
  function missing(e) { return /does not exist|schema cache|PGRST20|42P01|42883|Could not find|Bucket not found/i.test(String(e && e.message || e)); }
  function msg(e) { return String((e && e.message) || e || 'Erreur'); }
  function say(t) { if (st && st.ctx.say) st.ctx.say(t); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function quand(iso, court) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return ''; return JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()] + (court ? '' : ', ' + d.getHours() + ' h' + (d.getMinutes() ? ' ' + pad(d.getMinutes()) : '')); }
  function localInput(iso) { if (!iso) return ''; var d = new Date(iso); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function fromLocal(v) { if (!v) return null; var d = new Date(v); return isNaN(d) ? null : d.toISOString(); }
  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'causerie'; }
  function telecharger(blob, name) { var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 2000); }
  function charge(src) { return window.CasaCharge ? window.CasaCharge([src]) : Promise.reject(new Error('Chargement impossible')); }
  function vide(v) { return v == null || String(v).trim() === ''; }
  function sportCle(z) { return z && T.SPORTS[z.sport] ? z.sport : null; }

  // ---------------------------------------------------------------- données
  var COLS = 'id, club, evenement_id, section, equipe, sport, titre, genre, fichier, fichier_nom, acces, ouvre_le, ferme_le, telechargement, notifier, notifie, statut, auteur_nom, cree_le, maj_le';
  var Store = {
    liste: function (club) { return db(function (c) { return c.from('causeries').select(COLS).eq('club', club).order('cree_le', { ascending: false }).limit(80); }); },
    un: function (id) { return db(function (c) { return c.from('causeries').select('*').eq('id', id).maybeSingle(); }); },
    staff: function (club) { return db(function (c) { return c.rpc('vs_staff', { c: club }); }).then(function (r) { return r === true; }, function () { return false; }); },
    mesMembres: function (club) { return db(function (c) { return c.from('vestiaire_membres').select('*').eq('club', club).eq('user_id', moi()); }); },
    membres: function (club) { return db(function (c) { return c.from('vestiaire_membres').select('id, user_id, nom, section, equipe, qualite, statut, staff').eq('club', club).eq('statut', 'valide').order('nom'); }); },
    events: function (club) { var since = new Date(Date.now() - 3 * 86400000).toISOString(); return db(function (c) { return c.from('vestiaire_evenements').select('*').eq('club', club).gte('debut', since).order('debut').limit(60); }); },
    presences: function (eid) { return eid ? db(function (c) { return c.from('vestiaire_presences').select('membre_id, reponse').eq('evenement_id', eid); }) : Promise.resolve([]); },
    acces: function (cid) { return db(function (c) { return c.from('causerie_acces').select('membre_id, autorise').eq('causerie_id', cid); }); },
    lus: function (ids) { return ids.length ? db(function (c) { return c.rpc('cz_lectures', { ids: ids }); }) : Promise.resolve([]); },
    mesLus: function (ids) { return ids.length ? db(function (c) { return c.from('causerie_lectures').select('causerie_id, user_id').in('causerie_id', ids).eq('user_id', moi()); }) : Promise.resolve([]); },
    lecteurs: function (cid) { return db(function (c) { return c.from('causerie_lectures').select('user_id, nom, lu_le').eq('causerie_id', cid).order('lu_le'); }); },
    notes: function (cid) { return db(function (c) { return c.from('causerie_notes').select('texte').eq('causerie_id', cid).maybeSingle(); }).then(function (r) { return r ? r.texte : ''; }, function () { return ''; }); }
  };

  // Même règle que Supabase (cz_membre_autorise) : sert à afficher la liste et le compte des personnes
  function autorise(z, m, acces, pres) {
    if (!m || m.statut !== 'valide') return false;
    var a = (acces || []).find(function (x) { return x.membre_id === m.id; });
    if (a) return !!a.autorise;
    if (z.acces === 'liste') return false;
    if (!(z.section === 'club' || m.section === z.section)) return false;
    if (z.equipe && m.equipe && z.equipe.toLowerCase() !== m.equipe.toLowerCase()) return false;
    if (z.acces === 'equipe' || !z.evenement_id) return true;
    return !(pres || []).some(function (p) { return p.membre_id === m.id && p.reponse === 'absent'; });
  }
  function dansEquipe(z, m) { return (z.section === 'club' || m.section === z.section) && !(z.equipe && m.equipe && z.equipe.toLowerCase() !== m.equipe.toLowerCase()); }
  function etat(z) {
    var now = Date.now();
    if (z.statut !== 'publie') return ['Brouillon', 'cz-t-brouillon'];
    if (z.ouvre_le && new Date(z.ouvre_le) > now) return ['Programmée', 'cz-t-prog'];
    if (z.ferme_le && new Date(z.ferme_le) <= now) return ['Fermée', 'cz-t-fermee'];
    return ['Ouverte', 'cz-t-ouverte'];
  }
  function fenetre(z) {
    var e = etat(z)[0];
    if (e === 'Brouillon') return 'Brouillon : visible par le staff seulement';
    if (e === 'Programmée') return 'S’ouvrira ' + quand(z.ouvre_le) + (z.ferme_le ? ' · se ferme ' + quand(z.ferme_le) : '');
    if (e === 'Fermée') return 'Fermée depuis ' + quand(z.ferme_le) + ' · gardée pour le staff';
    return (z.ouvre_le ? 'Ouverte depuis ' + quand(z.ouvre_le) : 'Ouverte') + (z.ferme_le ? ' · se ferme ' + quand(z.ferme_le) : '');
  }
  function evDe(id) { return (st.events || []).find(function (e) { return e.id === id; }) || null; }
  function evLabel(e) { if (!e) return ''; var t = e.type === 'match' ? (e.adversaire ? (e.domicile === false ? e.adversaire + ' – ' + (st.clubNom || 'Nous') : (st.clubNom || 'Nous') + ' – ' + e.adversaire) : (e.titre || 'Match')) : (e.titre || (e.type === 'entrainement' ? 'Entraînement' : 'Rendez-vous')); return quand(e.debut, true) + ' · ' + t + (e.equipe ? ' (' + e.equipe + ')' : ''); }
  function pourQui(z) { return [SECTIONS[z.section] || '', z.equipe || ''].filter(Boolean).join(' · '); }

  // ---------------------------------------------------------------- ouverture
  function open(ctx, opts) {
    opts = opts || {}; css();
    if (st) fermer();
    var root = el('div', { id: 'cz', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Les causeries d’avant-match' });
    var club = (ctx.clubs || []).find(function (c) { return c.id === ctx.club; }) || {};
    st = { root: root, ctx: ctx, club: ctx.club, clubNom: club.name || '', clubLogo: club.logo || '', sport: T.sportDe(club.sport || ''), vue: 'liste', items: [], lus: {}, mesLus: {},
      staff: false, monNom: '', back: document.activeElement, ovf: document.body.style.overflow, loading: true };
    st.onKey = function (e) { if (e.key === 'Escape' && !root.querySelector('.cz-modal')) { if (st.vue === 'liste') fermer(); else retour(); } };
    document.addEventListener('keydown', st.onKey); document.body.style.overflow = 'hidden';
    document.body.appendChild(root);
    draw();
    if (!A() || !moi()) { st.loading = false; draw(); return; }
    Promise.all([Store.staff(st.club), Store.mesMembres(st.club).catch(function () { return []; }), Store.events(st.club).catch(function () { return []; })]).then(function (r) {
      st.staff = r[0]; var mm = (r[1] || []).filter(function (m) { return m.statut === 'valide'; }); st.mesMembres = mm; st.monNom = mm[0] ? mm[0].nom : ((A().user && A().user.email) || '').split('@')[0]; st.events = r[2] || [];
      return charger();
    }).then(function () {
      if (opts.id) return ouvrirId(opts.id);
      if (opts.nouvelle && st.staff) nouvelle();
    });
  }
  function charger() {
    st.loading = true;
    return Store.liste(st.club).then(function (rows) {
      st.items = rows || []; st.sqlMissing = false; var ids = st.items.map(function (z) { return z.id; });
      return Promise.all([st.staff ? Store.lus(ids).catch(function () { return []; }) : Promise.resolve([]), Store.mesLus(ids).catch(function () { return []; })]).then(function (r) {
        st.lus = {}; (r[0] || []).forEach(function (x) { st.lus[x.causerie_id] = x; });
        st.mesLus = {}; (r[1] || []).forEach(function (x) { st.mesLus[x.causerie_id] = true; });
      });
    }, function (e) { st.items = []; if (missing(e)) st.sqlMissing = true; else st.err = msg(e); })
      .then(function () { st.loading = false; if (st.vue === 'liste') draw(); });
  }
  function ouvrirId(id) { var z = st.items.find(function (x) { return x.id === id; }); if (z) voir(z); else say('Cette causerie n’est pas (ou plus) ouverte pour vous.'); }
  function fermer() {
    if (!st) return; if (st.stopAnim) st.stopAnim(); if (st.urls) st.urls.forEach(function (u) { URL.revokeObjectURL(u); });
    document.removeEventListener('keydown', st.onKey); document.body.style.overflow = st.ovf || ''; st.root.remove();
    var b = st.back; st = null; if (b && b.focus) try { b.focus(); } catch (e) {}
  }
  function retour() { if (st.stopAnim) { st.stopAnim(); st.stopAnim = null; } if (st.vue === 'tableau') { st.vue = 'edit'; draw(); return; } st.vue = 'liste'; st.z = null; charger(); draw(); }

  function draw() {
    if (!st) return; var r = st.root; r.innerHTML = '';
    var back = st.vue !== 'liste' ? el('button', { type: 'button', class: 'cz-x cz-back', onclick: retour }, st.vue === 'tableau' ? '← Retour à la causerie' : '← Les causeries') : null;
    r.appendChild(el('div', { class: 'cz-top' }, el('div', { class: 'cz-brand' }, el('span', { class: 'cz-k' }, 'Le Vestiaire · ' + (st.clubNom || '')), el('b', {}, 'Les causeries')), back, el('button', { type: 'button', class: 'cz-x', onclick: fermer, 'aria-label': 'Fermer les causeries' }, 'Fermer')));
    var main = el('div', { class: 'cz-main' }); r.appendChild(main);
    if (st.vue === 'liste') liste(main); else if (st.vue === 'edit') edition(main); else if (st.vue === 'voir') lecture(main, st.z, false); else if (st.vue === 'tableau') tableau(main);
    main.scrollTop = 0;
  }

  // ---------------------------------------------------------------- liste
  function liste(main) {
    var w = el('div', { class: 'cz-wrap' });
    if (!A()) { w.appendChild(el('p', { class: 'cz-info is-warn' }, 'Les causeries ont besoin des comptes abonnés.')); main.appendChild(w); return; }
    if (!moi()) { w.appendChild(el('div', { class: 'cz-box' }, el('p', {}, 'Les causeries sont réservées à l’équipe : connectez-vous avec le compte inscrit dans le Vestiaire du club.'), el('button', { type: 'button', class: 'cz-btn', onclick: function () { fermer(); if (st == null && window.CasaApp) {} } }, 'Fermer'), ' ', el('button', { type: 'button', class: 'cz-btn cz-dark', onclick: function () { var c = st.ctx.connect; fermer(); if (c) c(); } }, 'Me connecter'))); main.appendChild(w); return; }
    if (st.sqlMissing) w.appendChild(el('p', { class: 'cz-info is-warn' }, st.ctx.isAdmin ? 'À faire une seule fois : lancer le fichier supabase/causeries.sql dans Supabase (SQL Editor › New query › coller › Run). Les causeries s’activent aussitôt.' : 'Les causeries ouvrent très bientôt.'));
    if (st.err) w.appendChild(el('p', { class: 'cz-info is-warn' }, st.err));
    var head = el('div', { class: 'cz-box-h' }, el('div', {}, el('span', { class: 'cz-k cz-k-ink' }, 'Avant-match · réservé à l’équipe'), el('h2', { class: 'cz-h2' }, 'Les causeries')),
      st.staff ? el('button', { type: 'button', class: 'cz-btn', onclick: nouvelle }, '+ Nouvelle causerie') : null);
    var box = el('section', { class: 'cz-box' }, head);
    if (st.loading) box.appendChild(el('p', { class: 'cz-vide' }, 'Chargement…'));
    else if (!st.items.length) box.appendChild(el('p', { class: 'cz-vide' }, st.staff ? 'Aucune causerie pour l’instant. Créez la première : un PDF, une photo de votre tableau ou le modèle Casa.' : 'Aucune causerie ouverte pour vous en ce moment. Le coach choisit quand elle s’ouvre et à qui.'));
    st.items.forEach(function (z) { box.appendChild(carte(z)); });
    var side = el('div', { class: 'cz-side' },
      !st.staff ? null : el('div', { class: 'cz-box' }, el('span', { class: 'cz-k cz-k-ink' }, 'Pour le coach'), el('h3', { class: 'cz-h3' }, 'Trois façons de faire'),
        el('ul', { class: 'cz-ul' }, el('li', {}, el('b', {}, 'Déposer son PDF'), ' : il s’affiche tout seul, page par page.'), el('li', {}, el('b', {}, 'Prendre une photo'), ' de son tableau ou de sa feuille.'), el('li', {}, el('b', {}, 'Remplir le modèle Casa'), ' : tableau tactique, tireurs, export PDF.'))),
      el('div', { class: 'cz-box' }, el('span', { class: 'cz-k cz-k-ink' }, 'Qui la voit ?'), el('h3', { class: 'cz-h3' }, 'Seulement les personnes choisies'),
        el('ul', { class: 'cz-ul' }, el('li', {}, 'Les convoqués du match, le staff, et les personnes que le coach ajoute.'), el('li', {}, 'Jamais le public, ni les autres équipes, ni l’adversaire.'), el('li', {}, 'Le coach choisit l’heure d’ouverture et de fermeture.'))));
    w.appendChild(el('div', { class: 'cz-grid' }, box, side));
    main.appendChild(w);
  }
  function carte(z) {
    var ev = evDe(z.evenement_id), d = new Date(ev ? ev.debut : (z.ouvre_le || z.cree_le)), e = etat(z), lu = st.lus[z.id];
    var tags = el('div', { class: 'cz-row' }, el('span', { class: 'cz-tag cz-t-' + z.genre }, GENRES[z.genre][0]), st.staff || e[0] !== 'Ouverte' ? el('span', { class: 'cz-tag ' + e[1] }, e[0]) : null, el('span', { class: 'cz-meta' }, [pourQui(z), z.auteur_nom].filter(Boolean).join(' · ')));
    var acts = el('div', { class: 'cz-row cz-acts' }, el('button', { type: 'button', class: 'cz-lnk', onclick: function () { voir(z); } }, 'Ouvrir'));
    if (st.staff) {
      acts.appendChild(el('button', { type: 'button', class: 'cz-lnk', onclick: function () { modifier(z); } }, 'Modifier'));
      if (z.statut === 'publie') acts.appendChild(el('button', { type: 'button', class: 'cz-lnk', onclick: function () { quiALu(z); } }, 'Qui l’a lue ?'));
      acts.appendChild(el('button', { type: 'button', class: 'cz-lnk', onclick: function () { reutiliser(z); } }, 'Réutiliser'));
      acts.appendChild(el('button', { type: 'button', class: 'cz-lnk is-danger', onclick: function () { supprimer(z); } }, 'Supprimer'));
    }
    var lus = st.staff && z.statut === 'publie' && lu ? el('div', {}, el('div', { class: 'cz-lue' }, 'Lue par ' + lu.lus + ' personne' + (lu.lus > 1 ? 's' : '') + ' sur ' + lu.total), el('div', { class: 'cz-bar' }, el('span', { style: 'width:' + (lu.total ? Math.round(100 * lu.lus / lu.total) : 0) + '%' }))) : null;
    var moiLu = !st.staff && st.mesLus[z.id] ? el('div', { class: 'cz-lue' }, '✓ Vous l’avez lue') : null;
    return el('article', { class: 'cz-card' }, el('div', { class: 'cz-d' }, el('i', {}, JOURS[d.getDay()].toUpperCase()), el('b', {}, String(d.getDate())), el('i', {}, MOIS[d.getMonth()].toUpperCase())),
      el('div', { class: 'cz-card-b' }, tags, el('h3', { class: 'cz-card-t' }, z.titre), el('div', { class: 'cz-meta' }, ev ? evLabel(ev) + ' · ' : '', fenetre(z)), lus, moiLu, acts));
  }
  function supprimer(z) {
    modal('Supprimer la causerie ?', el('p', {}, '« ' + z.titre + ' » et ses fichiers seront effacés pour tout le monde. C’est définitif.'), [['Annuler', null], ['Supprimer', function () {
      sto(function (b) { return b.list(z.id, { limit: 100 }); }).then(function (files) { var p = (files || []).map(function (f) { return z.id + '/' + f.name; }); return p.length ? sto(function (b) { return b.remove(p); }) : null; }).catch(function () {})
        .then(function () { return db(function (c) { return c.from('causeries').delete().eq('id', z.id); }); })
        .then(function () { say('Causerie supprimée.'); charger(); }, function (e) { say(msg(e)); });
    }, 'cz-danger-b']]);
  }
  function reutiliser(z) {
    Store.un(z.id).then(function (full) {
      var c = clone(full.contenu || {}); delete c.photos;
      st.z = { club: st.club, section: full.section, equipe: full.equipe, sport: full.sport, titre: full.titre + ' (copie)', genre: full.genre === 'pdf' ? 'modele' : full.genre, contenu: c, acces: full.acces, telechargement: full.telechargement, notifier: full.notifier, statut: 'brouillon', evenement_id: null, ouvre_le: null, ferme_le: null };
      st.etape = 'reglages'; st.vue = 'edit'; st.acces = []; draw(); say('Copie prête : choisissez le match, puis enregistrez.');
    }, function (e) { say(msg(e)); });
  }

  // ---------------------------------------------------------------- création et modification
  function base() {
    var ev = (st.events || []).find(function (e) { return e.type === 'match' && !e.annule && new Date(e.debut) > Date.now(); });
    var z = { club: st.club, sport: st.sport || 'autre', genre: 'modele', acces: 'convoques', telechargement: false, notifier: true, statut: 'brouillon', section: 'seniors', equipe: null, contenu: { v: 1, cles: ['', '', ''], schemas: [], tireurs: {}, photos: [] } };
    lierMatch(z, ev); return z;
  }
  function lierMatch(z, ev) {
    z.evenement_id = ev ? ev.id : null;
    if (ev) { z.section = ev.section === 'jeunes' ? 'jeunes' : ev.section === 'club' ? 'club' : 'seniors'; z.equipe = ev.equipe || null;
      var d = new Date(ev.debut); z.ouvre_le = new Date(d.getTime() - 24 * 3600000).toISOString(); var f = new Date(d); f.setDate(f.getDate() + 1); f.setHours(12, 0, 0, 0); z.ferme_le = f.toISOString();
      if (!z.id || /^Causerie/.test(z.titre || '')) z.titre = 'Causerie · ' + (ev.adversaire ? (ev.domicile === false ? ev.adversaire + ' – ' + (st.clubNom || 'Nous') : (st.clubNom || 'Nous') + ' – ' + ev.adversaire) : (ev.titre || 'Avant-match'));
    } else if (!z.titre) z.titre = 'Causerie · ' + (st.clubNom || '');
  }
  function nouvelle() { st.z = base(); st.etape = 'reglages'; st.vue = 'edit'; st.acces = []; st.notes = ''; draw(); }
  function modifier(z) {
    Promise.all([Store.un(z.id), Store.acces(z.id).catch(function () { return []; }), Store.notes(z.id)]).then(function (r) {
      if (!r[0]) { say('Causerie introuvable.'); return; }
      st.z = r[0]; st.z.contenu = Object.assign({ v: 1, cles: ['', '', ''], schemas: [], tireurs: {}, photos: [] }, st.z.contenu || {}); st.acces = r[1] || []; st.notes = r[2] || '';
      st.etape = 'contenu'; st.vue = 'edit'; draw();
    }, function (e) { say(msg(e)); });
  }
  function enregistrer(quiet) {
    var z = st.z; var row = { club: st.club, evenement_id: z.evenement_id || null, section: z.section, equipe: z.equipe || null, sport: z.sport || 'autre', titre: String(z.titre || 'Causerie').trim().slice(0, 120) || 'Causerie', genre: z.genre, contenu: z.contenu, fichier: z.fichier || null, fichier_nom: z.fichier_nom || null,
      acces: z.acces, ouvre_le: z.ouvre_le || null, ferme_le: z.ferme_le || null, telechargement: !!z.telechargement, notifier: !!z.notifier, statut: z.statut || 'brouillon' };
    st.saving = true; majSave();
    var p = z.id ? db(function (c) { return c.from('causeries').update(row).eq('id', z.id).select('id, statut, notifie').single(); }) : db(function (c) { return c.from('causeries').insert(row).select('id, statut, notifie').single(); });
    return p.then(function (r) { if (st && st.z === z) { z.id = r.id; z.notifie = r.notifie; } st.saving = false; st.savedAt = Date.now(); majSave(); if (!quiet) say('Causerie enregistrée.'); return r; },
      function (e) { st.saving = false; majSave(missing(e) ? (st.ctx.isAdmin ? 'Lancez d’abord supabase/causeries.sql dans Supabase.' : 'Les causeries ne sont pas encore ouvertes : réessayez un peu plus tard.') : msg(e)); throw e; });
  }
  var saveT = null;
  function plusTard() { if (!st || !st.z) return; st.dirty = true; majSave(); clearTimeout(saveT); saveT = setTimeout(function () { if (st && st.z && st.z.id) enregistrer(true).then(function () { st.dirty = false; majSave(); }, function () {}); }, 1200); }
  function majSave(err) { var b = st && st.root.querySelector('.cz-save'); if (!b) return; b.textContent = err ? err : st.saving ? 'Enregistrement…' : st.dirty ? 'Modifications en cours…' : st.savedAt ? 'Enregistré · brouillon visible par le staff seulement' : ''; if (st.z && st.z.statut === 'publie' && !err && !st.saving && !st.dirty) b.textContent = 'Enregistré · publiée'; b.classList.toggle('is-err', !!err); }

  function edition(main) {
    var z = st.z, w = el('div', { class: 'cz-wrap' });
    var etapes = [['reglages', '1 · Réglages'], ['acces', '2 · Qui la voit'], ['contenu', '3 · Contenu'], ['publier', '4 · Aperçu et publication']];
    w.appendChild(el('div', { class: 'cz-box-h' }, el('div', {}, el('span', { class: 'cz-k cz-k-ink' }, z.id ? 'Modifier la causerie' : 'Nouvelle causerie'), el('h2', { class: 'cz-h2' }, z.titre || 'Causerie')), el('span', { class: 'cz-save', role: 'status' })));
    w.appendChild(el('div', { class: 'cz-steps', role: 'tablist' }, etapes.map(function (t) { return el('button', { type: 'button', role: 'tab', 'aria-selected': st.etape === t[0] ? 'true' : 'false', disabled: !z.id && t[0] !== 'reglages' ? true : null, onclick: function () { aller(t[0]); } }, t[1]); })));
    var body = el('div', {}); w.appendChild(body); main.appendChild(w);
    if (st.etape === 'reglages') reglages(body); else if (st.etape === 'acces') accesVue(body); else if (st.etape === 'contenu') contenuVue(body); else publierVue(body);
    majSave();
  }
  function aller(k) { if (!st.z.id && k !== 'reglages') return; var go = function () { st.etape = k; draw(); }; if (st.dirty && st.z.id) enregistrer(true).then(go, go); else go(); }

  function reglages(body) {
    var z = st.z;
    var choix = el('div', { class: 'cz-choix' }, Object.keys(GENRES).map(function (k) {
      return el('button', { type: 'button', class: 'cz-opt', 'aria-pressed': z.genre === k ? 'true' : 'false', onclick: function () { z.genre = k; plusTard(); draw(); } },
        el('span', { class: 'cz-ico cz-ico-' + k, html: { pdf: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M12 18v-6M9 15l3-3 3 3"/></svg>', photo: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>', modele: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>' }[k] }),
        el('b', {}, GENRES[k][0]), el('span', {}, GENRES[k][1]));
    }));
    body.appendChild(el('p', { class: 'cz-aide' }, 'Choisissez la façon principale de faire. Vous pourrez toujours ajouter une photo, un PDF ou des schémas ensuite.'));
    body.appendChild(choix);
    var f = el('div', { class: 'cz-form' });
    var evSel = el('select', { class: 'cz-in', id: 'cz-ev' }); evSel.appendChild(el('option', { value: '' }, 'Aucun match (causerie libre)'));
    (st.events || []).filter(function (e) { return !e.annule; }).forEach(function (e) { evSel.appendChild(el('option', { value: e.id, selected: z.evenement_id === e.id ? true : null }, evLabel(e))); });
    evSel.addEventListener('change', function () { lierMatch(z, evDe(evSel.value)); plusTard(); draw(); });
    var titre = el('input', { class: 'cz-in', id: 'cz-titre', value: z.titre || '', maxlength: '120' }); titre.addEventListener('input', function () { z.titre = titre.value; plusTard(); });
    var sec = el('select', { class: 'cz-in', id: 'cz-sec' }); Object.keys(SECTIONS).forEach(function (k) { sec.appendChild(el('option', { value: k, selected: z.section === k ? true : null }, SECTIONS[k])); }); sec.addEventListener('change', function () { z.section = sec.value; plusTard(); });
    var eq = el('input', { class: 'cz-in', id: 'cz-eq', value: z.equipe || '', maxlength: '30', placeholder: 'ex. Seniors A, U17 (facultatif)' }); eq.addEventListener('input', function () { z.equipe = eq.value.trim() || null; plusTard(); });
    var ouv = el('input', { class: 'cz-in', id: 'cz-ouv', type: 'datetime-local', value: localInput(z.ouvre_le) }); ouv.addEventListener('change', function () { z.ouvre_le = fromLocal(ouv.value); plusTard(); });
    var fer = el('input', { class: 'cz-in', id: 'cz-fer', type: 'datetime-local', value: localInput(z.ferme_le) }); fer.addEventListener('change', function () { z.ferme_le = fromLocal(fer.value); plusTard(); });
    var notif = chk('cz-notif', z.notifier, 'Prévenir les personnes concernées par notification à la publication', function (v) { z.notifier = v; plusTard(); });
    var tel = chk('cz-tel', z.telechargement, 'Autoriser les joueurs à télécharger (PDF et export). Sinon, on la lit seulement dans l’appli.', function (v) { z.telechargement = v; plusTard(); });
    f.appendChild(lab('Match lié', evSel, 'is-wide')); f.appendChild(lab('Titre', titre, 'is-wide'));
    f.appendChild(lab('Pour quelle section ?', sec)); f.appendChild(lab('Équipe', eq));
    f.appendChild(lab('Visible à partir de', ouv)); f.appendChild(lab('Se ferme', fer));
    f.appendChild(el('p', { class: 'cz-aide is-wide' }, 'Laissez vide pour qu’elle soit visible dès la publication, et sans fermeture. Après la fermeture, elle reste visible du staff.'));
    f.appendChild(notif); f.appendChild(tel);
    body.appendChild(f);
    body.appendChild(el('div', { class: 'cz-row cz-foot' }, el('button', { type: 'button', class: 'cz-btn', onclick: function () { enregistrer(true).then(function () { st.dirty = false; st.etape = 'acces'; draw(); }, function () {}); } }, z.id ? 'Continuer' : 'Créer et continuer'), z.id ? null : el('span', { class: 'cz-aide' }, 'La causerie reste un brouillon, visible du staff seulement, jusqu’à la publication.')));
  }
  function lab(t, input, cls) { return el('label', { class: 'cz-l ' + (cls || '') }, el('span', {}, t), input); }
  function chk(id, v, t, on) { var i = el('input', { type: 'checkbox', id: id }); i.checked = !!v; i.addEventListener('change', function () { on(i.checked); }); return el('label', { class: 'cz-check is-wide', for: id }, i, el('span', {}, t)); }

  // ---------- qui la voit ----------
  function accesVue(body) {
    var z = st.z; body.appendChild(el('p', { class: 'cz-vide' }, 'Chargement des membres…'));
    Promise.all([Store.membres(st.club), Store.presences(z.evenement_id), Store.acces(z.id)]).then(function (r) {
      st.membres = r[0] || []; st.pres = r[1] || []; st.acces = r[2] || []; body.innerHTML = ''; accesDessin(body);
    }, function (e) { body.innerHTML = ''; body.appendChild(el('p', { class: 'cz-info is-warn' }, msg(e))); });
  }
  function accesDessin(body) {
    var z = st.z, mem = st.membres || [];
    var setA = function (m, val) { // val : true / false / null (suivre la règle)
      st.acces = st.acces.filter(function (a) { return a.membre_id !== m.id; });
      var p = val == null ? db(function (c) { return c.from('causerie_acces').delete().eq('causerie_id', z.id).eq('membre_id', m.id); }) : db(function (c) { return c.from('causerie_acces').upsert({ causerie_id: z.id, membre_id: m.id, autorise: val }, { onConflict: 'causerie_id,membre_id' }); });
      if (val != null) st.acces.push({ membre_id: m.id, autorise: val });
      p.then(null, function (e) { say(msg(e)); }); body.innerHTML = ''; accesDessin(body);
    };
    var defaut = function (m) { var a = st.acces; st.acces = []; var v = autorise(z, m, [], st.pres); st.acces = a; return v; };
    var basculer = function (m) { var now = autorise(z, m, st.acces, st.pres), want = !now; setA(m, want === defaut(m) ? null : want); };
    body.appendChild(el('div', { class: 'cz-chips', role: 'radiogroup', 'aria-label': 'Règle d’accès' }, Object.keys(ACCES).map(function (k) { return el('button', { type: 'button', role: 'radio', class: 'cz-chip', 'aria-checked': z.acces === k ? 'true' : 'false', onclick: function () { z.acces = k; enregistrer(true).then(function () { body.innerHTML = ''; accesDessin(body); }, function () {}); } }, ACCES[k][0]); })));
    body.appendChild(el('p', { class: 'cz-aide' }, ACCES[z.acces][1]));
    var equipe = mem.filter(function (m) { return dansEquipe(z, m) && !m.staff; });
    var autres = mem.filter(function (m) { return !dansEquipe(z, m) && !m.staff; });
    var staff = mem.filter(function (m) { return m.staff; });
    var rep = {}; (st.pres || []).forEach(function (p) { rep[p.membre_id] = p.reponse; });
    var ligne = function (m) {
      var on = autorise(z, m, st.acces, st.pres), r = rep[m.id];
      var i = el('input', { type: 'checkbox', id: 'cz-m-' + m.id }); i.checked = on; i.addEventListener('change', function () { basculer(m); });
      return el('label', { class: 'cz-p', for: 'cz-m-' + m.id }, i, el('span', { class: on ? '' : 'cz-off' }, m.nom, m.qualite === 'parent' ? el('small', {}, ' (parent)') : null), r ? el('span', { class: 'cz-rep cz-rep-' + r }, { present: 'Présent', incertain: 'Peut-être', absent: 'Absent' }[r]) : (z.evenement_id ? el('span', { class: 'cz-rep' }, 'Sans réponse') : null));
    };
    var titreEq = z.evenement_id ? 'Convoqués · ' + evLabel(evDe(z.evenement_id)) : 'L’équipe · ' + pourQui(z);
    body.appendChild(el('h3', { class: 'cz-h3s' }, titreEq, el('small', {}, ' ' + equipe.length + ' membre' + (equipe.length > 1 ? 's' : '') + (z.evenement_id ? ', réponses reprises du planning' : ''))));
    body.appendChild(equipe.length ? el('div', { class: 'cz-pers' }, equipe.map(ligne)) : el('p', { class: 'cz-vide' }, 'Aucun membre validé dans cette équipe pour l’instant. Les joueurs rejoignent le Vestiaire depuis la page du club.'));
    body.appendChild(el('h3', { class: 'cz-h3s' }, 'Le staff', el('small', {}, ' toujours inclus')));
    body.appendChild(el('p', { class: 'cz-aide' }, (staff.map(function (m) { return m.nom; }).join(', ') || 'Les encadrants nommés dans le Vestiaire') + ', le correspondant du club et l’administrateur voient toutes les causeries.'));
    body.appendChild(el('h3', { class: 'cz-h3s' }, 'Personnes choisies', el('small', {}, ' d’autres membres du club')));
    var ajoutes = autres.filter(function (m) { return autorise(z, m, st.acces, st.pres); });
    if (ajoutes.length) body.appendChild(el('div', { class: 'cz-pers' }, ajoutes.map(ligne)));
    var q = el('input', { class: 'cz-in', id: 'cz-q', placeholder: 'Ajouter un membre du club (nom)…', 'aria-label': 'Rechercher un membre' }), res = el('div', { class: 'cz-pers' });
    q.addEventListener('input', function () { var t = q.value.trim().toLowerCase(); res.innerHTML = ''; if (t.length < 2) return; autres.filter(function (m) { return m.nom.toLowerCase().indexOf(t) >= 0 && !autorise(z, m, st.acces, st.pres); }).slice(0, 8).forEach(function (m) { res.appendChild(el('button', { type: 'button', class: 'cz-chip', onclick: function () { setA(m, true); } }, '+ ' + m.nom + ' · ' + (SECTIONS[m.section] || '') + (m.equipe ? ' ' + m.equipe : ''))); }); if (!res.children.length) res.appendChild(el('span', { class: 'cz-aide' }, 'Personne d’autre à ce nom dans le Vestiaire du club.')); });
    body.appendChild(q); body.appendChild(res);
    var users = {}; mem.forEach(function (m) { if (!m.staff && autorise(z, m, st.acces, st.pres)) users[m.user_id] = 1; });
    var n = Object.keys(users).length;
    body.appendChild(el('div', { class: 'cz-sum' }, el('span', {}, el('b', {}, n + ' personne' + (n > 1 ? 's' : '')), ' pourront l’ouvrir, plus le staff. Chacun avec son compte.'), el('button', { type: 'button', class: 'cz-btn', onclick: function () { aller('contenu'); } }, 'Continuer')));
  }

  // ---------- contenu ----------
  function onglets(z) {
    var sp = sportCle(z), o = [];
    var pdf = ['pdf', 'Document PDF'], ph = ['photos', 'Photos'], mot = ['mot', 'Le mot et le plan'];
    if (z.genre === 'pdf') o.push(pdf, ph, mot); else if (z.genre === 'photo') o.push(ph, pdf, mot); else o.push(mot);
    if (sp) o.push(['compo', 'La compo'], ['schemas', 'Schémas tactiques'], ['tireurs', 'Tireurs et marquages']);
    o.push(['cles', 'Les 3 clés et la phrase']);
    if (z.genre === 'modele') o.push(ph, pdf);
    o.push(['notes', 'Notes du staff']);
    return o;
  }
  function contenuVue(body) {
    var z = st.z, ong = onglets(z); if (!st.sous || !ong.some(function (x) { return x[0] === st.sous; })) st.sous = ong[0][0];
    body.appendChild(el('div', { class: 'cz-sub', role: 'tablist' }, ong.map(function (t) { return el('button', { type: 'button', role: 'tab', 'aria-selected': st.sous === t[0] ? 'true' : 'false', onclick: function () { st.sous = t[0]; draw(); } }, t[1]); })));
    var b = el('div', { class: 'cz-box' }); body.appendChild(b);
    ({ pdf: pdfVue, photos: photosVue, mot: motVue, compo: compoVue, schemas: schemasVue, tireurs: tireursVue, cles: clesVue, notes: notesVue })[st.sous](b);
    body.appendChild(el('div', { class: 'cz-row cz-foot' }, el('button', { type: 'button', class: 'cz-btn', onclick: function () { aller('publier'); } }, 'Voir l’aperçu')));
  }
  function champ(obj, key, label, o) {
    o = o || {}; var i = el(o.long ? 'textarea' : 'input', { class: 'cz-in', id: 'cz-f-' + key + (o.i || ''), maxlength: String(o.max || (o.long ? 1500 : 160)), rows: o.long ? String(o.rows || 4) : null, placeholder: o.ph || null });
    i.value = obj[key] || ''; i.addEventListener('input', function () { obj[key] = i.value; plusTard(); });
    return lab(label, i, o.cls || 'is-wide');
  }
  function motVue(b) {
    var c = st.z.contenu;
    b.appendChild(el('div', { class: 'cz-form cz-form-plain' }, champ(c, 'mot', 'Le mot du coach', { long: true, ph: 'Ce que vous voulez dire à votre équipe avant le match.' }), champ(c, 'dernier', 'Ce qu’on retient du dernier match', { long: true, rows: 3 }), champ(c, 'plan', 'Notre plan de jeu', { long: true, ph: 'Comment on veut jouer : avec et sans ballon.' }), champ(c, 'adversaire', 'L’adversaire', { long: true, rows: 3, ph: 'Leurs points forts, leurs habitudes.' })));
  }
  function clesVue(b) {
    var c = st.z.contenu; c.cles = c.cles || ['', '', ''];
    b.appendChild(el('div', { class: 'cz-form cz-form-plain' }, [0, 1, 2].map(function (i) { var x = el('input', { class: 'cz-in', id: 'cz-cle' + i, maxlength: '120', placeholder: ['ex. On sort vite côté opposé', 'ex. Zone + 2 sur coups de pied', 'ex. On parle tout le match'][i] }); x.value = c.cles[i] || ''; x.addEventListener('input', function () { c.cles[i] = x.value; plusTard(); }); return lab('Clé ' + (i + 1), x, 'is-wide'); }), champ(c, 'phrase', 'La phrase du jour', { max: 140, ph: '« Ensemble, du premier au dernier ballon. »' })));
  }
  function notesVue(b) {
    b.appendChild(el('p', { class: 'cz-aide' }, 'Visibles du staff seulement (jamais des joueurs) : notes sur l’adversaire, consignes pour le gardien…'));
    var t = el('textarea', { class: 'cz-in', id: 'cz-notes', rows: '6', maxlength: '4000' }); t.value = st.notes || '';
    var tm = null; t.addEventListener('input', function () { st.notes = t.value; clearTimeout(tm); tm = setTimeout(function () { db(function (c) { return c.from('causerie_notes').upsert({ causerie_id: st.z.id, texte: st.notes, maj_le: new Date().toISOString() }, { onConflict: 'causerie_id' }); }).then(null, function (e) { say(msg(e)); }); }, 900); });
    b.appendChild(lab('Notes du staff', t, 'is-wide'));
  }
  function noms() { var z = st.z; return (st.membres || []).filter(function (m) { return dansEquipe(z, m); }).map(function (m) { return m.nom; }); }
  function datalist() { var d = el('datalist', { id: 'cz-noms' }); noms().forEach(function (n) { d.appendChild(el('option', { value: n })); }); return d; }
  function assureMembres() { return st.membres ? Promise.resolve() : Store.membres(st.club).then(function (r) { st.membres = r || []; }, function () { st.membres = []; }); }

  // ---------- compo et schémas ----------
  function compoVue(b) {
    var c = st.z.contenu, sp = sportCle(st.z);
    if (!c.compo) { c.compo = T.nouveau(sp, 'Compo'); var sys = Object.keys(T.SPORTS[sp].systemes)[0]; T.avecSysteme(c.compo, sys); c.compo.titre = 'La compo'; }
    b.appendChild(el('p', { class: 'cz-aide' }, 'Placez vos joueurs : choisissez un système, puis touchez un joueur pour lui donner son nom (les noms des convoqués sont proposés).'));
    var mini = el('div', { class: 'cz-mini-l', html: T.svg(c.compo, 0, { label: 'La compo' }) });
    b.appendChild(mini);
    b.appendChild(el('div', { class: 'cz-row' }, el('button', { type: 'button', class: 'cz-btn', onclick: function () { st.schemaEdit = c.compo; st.vue = 'tableau'; draw(); } }, 'Modifier la compo sur le tableau')));
    b.appendChild(el('h3', { class: 'cz-h4' }, 'Le onze de départ'));
    b.appendChild(feuille(c, true));
    b.appendChild(el('h3', { class: 'cz-h4' }, 'Les remplaçants'));
    b.appendChild(el('p', { class: 'cz-aide' }, 'Numéro et nom de chaque remplaçant. Le brassard © peut aussi aller à un remplaçant (un seul capitaine).'));
    var box = el('div', { class: 'cz-remps' }); b.appendChild(box); b.appendChild(datalist());
    assureMembres().then(function () { var d = b.querySelector('#cz-noms'); if (d) d.replaceWith(datalist()); });
    function lignes() {
      box.innerHTML = ''; var R = remplacants(c);
      R.forEach(function (r, i) {
        var n = el('input', { class: 'cz-in cz-in-s', maxlength: '3', inputmode: 'numeric', 'aria-label': 'Numéro du remplaçant ' + (i + 1), placeholder: 'N°' }); n.value = r.n || '';
        var nm = el('input', { class: 'cz-in', maxlength: '24', list: 'cz-noms', 'aria-label': 'Nom du remplaçant ' + (i + 1), placeholder: 'Nom' }); nm.value = r.nom || '';
        n.addEventListener('input', function () { r.n = n.value.trim(); plusTard(); }); nm.addEventListener('input', function () { r.nom = nm.value; plusTard(); });
        box.appendChild(el('div', { class: 'cz-remp' }, n, nm,
          el('button', { type: 'button', class: 'cz-btn cz-ghost cz-btn-s', 'aria-pressed': r.cap ? 'true' : 'false', title: 'Capitaine', onclick: function () { var v = !r.cap; plusCapitaine(c); r.cap = v; plusTard(); draw(); } }, '©'),
          el('button', { type: 'button', class: 'cz-lnk is-danger', onclick: function () { R.splice(i, 1); plusTard(); lignes(); } }, 'Retirer')));
      });
      box.appendChild(el('div', { class: 'cz-row' }, el('button', { type: 'button', class: 'cz-btn cz-ghost', onclick: function () { R.push({ n: '', nom: '', cap: false }); plusTard(); lignes(); var ins = box.querySelectorAll('input'); if (ins.length) ins[ins.length - 2].focus(); } }, '+ Ajouter un remplaçant')));
    }
    lignes();
  }
  // Remplaçants : liste [{ n, nom, cap }] (l'ancien texte libre est converti)
  function remplacants(c) {
    if (typeof c.remplacants === 'string') c.remplacants = c.remplacants.split(/[,;\n]+/).map(function (x) { x = x.trim(); var m = x.match(/^(\d{1,3})[\s.\-]+(.*)$/); return x ? { n: m ? m[1] : '', nom: m ? m[2] : x, cap: false } : null; }).filter(Boolean);
    if (!Array.isArray(c.remplacants)) c.remplacants = [];
    return c.remplacants;
  }
  function plusCapitaine(c) {
    remplacants(c).forEach(function (r) { r.cap = false; });
    if (c.compo) c.compo.etapes.forEach(function (e) { e.objets.forEach(function (o) { if (o.t === 'j') o.cap = false; }); });
  }
  // Feuille de match : titulaires (depuis le tableau) et remplaçants, avec numéro, nom et brassard ©
  function feuille(c, edition) {
    var tit = T.titulaires(c.compo), rem = remplacants(c).filter(function (r) { return !vide(r.nom) || !vide(r.n); });
    var li = function (j) { return el('li', { class: j.cap ? 'is-cap' : null }, el('b', { class: 'cz-num' }, j.n || '–'), el('span', {}, j.nom || (edition ? 'Sans nom' : '')), j.g ? el('em', { class: 'cz-gk' }, 'Gardien') : null, j.cap ? el('i', { class: 'cz-cap', title: 'Capitaine', 'aria-label': 'Capitaine' }, 'C') : null); };
    if (edition) return tit.length ? el('ul', { class: 'cz-xi' }, tit.map(li)) : el('p', { class: 'cz-vide' }, 'Placez vos joueurs sur le tableau : ils apparaissent ici.');
    if (!tit.length && !rem.length) return null;
    return el('div', { class: 'cz-feuille' },
      tit.length ? el('div', {}, el('span', { class: 'cz-k cz-k-ink' }, 'Le onze de départ'), el('ul', { class: 'cz-xi' }, tit.map(li))) : null,
      rem.length ? el('div', {}, el('span', { class: 'cz-k cz-k-ink' }, 'Remplaçants'), el('ul', { class: 'cz-xi cz-xi-rem' }, rem.map(li))) : null);
  }
  function schemasVue(b) {
    var c = st.z.contenu, sp = sportCle(st.z), S = T.SPORTS[sp]; c.schemas = c.schemas || [];
    b.appendChild(el('p', { class: 'cz-aide' }, 'Un schéma par situation : attaque, défense, coups de pied arrêtés, combinaisons… Plusieurs étapes possibles, animées pour les joueurs.'));
    var grid = el('div', { class: 'cz-schemas' });
    c.schemas.forEach(function (s, i) {
      grid.appendChild(el('div', { class: 'cz-sch' }, el('div', { class: 'cz-sch-v', html: T.svg(s, s.etapes.length - 1, { label: s.titre || s.situation }) }),
        el('div', { class: 'cz-sch-b' }, el('span', { class: 'cz-tag' + (S.cpa.indexOf(s.situation) >= 0 ? ' cz-t-modele' : '') }, s.situation), el('b', {}, s.titre || 'Sans nom'), el('small', {}, s.etapes.length + ' étape' + (s.etapes.length > 1 ? 's' : '')),
          el('div', { class: 'cz-row' }, el('button', { type: 'button', class: 'cz-lnk', onclick: function () { st.schemaEdit = s; st.vue = 'tableau'; draw(); } }, 'Modifier'),
            el('button', { type: 'button', class: 'cz-lnk', disabled: i ? null : true, onclick: function () { c.schemas.splice(i - 1, 0, c.schemas.splice(i, 1)[0]); plusTard(); draw(); }, 'aria-label': 'Monter' }, '↑'),
            el('button', { type: 'button', class: 'cz-lnk', onclick: function () { var cp = clone(s); cp.id = Math.random().toString(36).slice(2, 9); cp.titre = (s.titre || s.situation) + ' (copie)'; c.schemas.splice(i + 1, 0, cp); plusTard(); draw(); } }, 'Dupliquer'),
            el('button', { type: 'button', class: 'cz-lnk is-danger', onclick: function () { c.schemas.splice(i, 1); plusTard(); draw(); } }, 'Retirer')))));
    });
    var sit = el('select', { class: 'cz-in', id: 'cz-newsit' }); S.situations.filter(function (x) { return x !== 'Compo'; }).forEach(function (x) { sit.appendChild(el('option', { value: x }, x)); });
    grid.appendChild(el('div', { class: 'cz-sch cz-sch-new' }, el('b', {}, 'Nouveau schéma'), lab('Situation', sit), el('button', { type: 'button', class: 'cz-btn', onclick: function () { var s = T.nouveau(sp, sit.value); if (c.compo && sit.value !== 'Penalty') s.etapes[0].objets = clone(c.compo.etapes[0].objets); c.schemas.push(s); plusTard(); st.schemaEdit = s; st.vue = 'tableau'; draw(); } }, 'Créer sur le tableau'),
      el('button', { type: 'button', class: 'cz-lnk', onclick: reprendre }, 'Reprendre d’une autre causerie')));
    b.appendChild(grid);
  }
  function reprendre() {
    var ids = st.items.filter(function (x) { return x.id !== st.z.id && x.sport === st.z.sport; }).map(function (x) { return x.id; });
    if (!ids.length) { say('Aucune autre causerie de ce sport pour l’instant.'); return; }
    db(function (c) { return c.from('causeries').select('id, titre, contenu').in('id', ids.slice(0, 30)); }).then(function (rows) {
      var list = []; (rows || []).forEach(function (r) { ((r.contenu || {}).schemas || []).forEach(function (s) { list.push({ s: s, de: r.titre }); }); });
      if (!list.length) { say('Les autres causeries n’ont pas encore de schéma.'); return; }
      var box = el('div', { class: 'cz-schemas' }, list.map(function (x) { return el('button', { type: 'button', class: 'cz-sch cz-sch-pick', onclick: function () { var cp = clone(x.s); cp.id = Math.random().toString(36).slice(2, 9); st.z.contenu.schemas.push(cp); plusTard(); fermerModal(); draw(); say('Schéma ajouté.'); } }, el('div', { class: 'cz-sch-v', html: T.svg(x.s, x.s.etapes.length - 1) }), el('div', { class: 'cz-sch-b' }, el('b', {}, x.s.titre || x.s.situation), el('small', {}, x.de))); }));
      modal('Reprendre un schéma', box, [['Fermer', null]]);
    }, function (e) { say(msg(e)); });
  }
  function tableau(main) {
    var s = st.schemaEdit, w = el('div', { class: 'cz-wrap cz-wrap-wide' });
    w.appendChild(el('div', { class: 'cz-box-h' }, el('div', {}, el('span', { class: 'cz-k cz-k-ink' }, 'Tableau tactique · ' + (T.SPORTS[s.sport] || {}).nom), el('h2', { class: 'cz-h2' }, s.situation === 'Compo' ? 'La compo' : (s.titre || s.situation))), el('div', { class: 'cz-row' }, el('span', { class: 'cz-save', role: 'status' }), el('button', { type: 'button', class: 'cz-btn', onclick: function () { if (st.board) st.board.arret(); enregistrer(true).then(null, function () {}); st.vue = 'edit'; draw(); } }, 'Terminé'))));
    var host = el('div', {}); w.appendChild(host); w.appendChild(datalist()); main.appendChild(w);
    assureMembres().then(function () { var d = w.querySelector('#cz-noms'); if (d) d.replaceWith(datalist()); });
    st.board = T.editeur(host, s, { listId: 'cz-noms', change: function (sc) { if (sc === st.z.contenu.compo && T.titulaires(sc).some(function (j) { return j.cap; })) remplacants(st.z.contenu).forEach(function (r) { r.cap = false; }); plusTard(); } });
  }

  // ---------- tireurs ----------
  function tireursVue(b) {
    var c = st.z.contenu, sp = sportCle(st.z); c.tireurs = c.tireurs || {};
    b.appendChild(el('p', { class: 'cz-aide' }, 'Les noms se choisissent parmi les membres de l’équipe (ou s’écrivent à la main). Ajoutez une précision si besoin : pied, côté, annonce…'));
    b.appendChild(datalist());
    var grid = el('div', { class: 'cz-tir' });
    (T.TIREURS[sp] || []).forEach(function (card) {
      var data = c.tireurs[card.k] = c.tireurs[card.k] || { lignes: {} };
      var box = el('div', { class: 'cz-tc' }, el('h4', {}, el('em', { class: card.camp === 'def' ? 'is-def' : '' }, card.camp === 'def' ? 'Défensif' : 'Offensif'), card.titre), el('div', { class: 'cz-meta' }, card.aide));
      if (card.choix) box.appendChild(el('div', { class: 'cz-chips' }, card.choix.map(function (ch) { return el('button', { type: 'button', class: 'cz-chip', 'aria-pressed': data.choix === ch ? 'true' : 'false', onclick: function () { data.choix = data.choix === ch ? null : ch; plusTard(); draw(); } }, ch); })));
      card.lignes.forEach(function (l) {
        var v = data.lignes[l[0]] = data.lignes[l[0]] || { nom: '', note: '' };
        var n = el('input', { class: 'cz-in', id: 'cz-t-' + card.k + '-' + l[0], list: 'cz-noms', maxlength: '60', value: v.nom, 'aria-label': card.titre + ' : ' + l[1] }); n.addEventListener('input', function () { v.nom = n.value; plusTard(); });
        var no = el('input', { class: 'cz-in cz-in-note', id: 'cz-tn-' + card.k + '-' + l[0], maxlength: '80', value: v.note, placeholder: 'Précision', 'aria-label': 'Précision : ' + l[1] }); no.addEventListener('input', function () { v.note = no.value; plusTard(); });
        box.appendChild(el('div', { class: 'cz-ord' }, el('span', { class: 'cz-ord-l' }, l[1]), n, no));
      });
      grid.appendChild(box);
    });
    b.appendChild(grid);
    assureMembres().then(function () { var d = b.querySelector('#cz-noms'); if (d) d.replaceWith(datalist()); });
  }

  // ---------- PDF ----------
  function pdfVue(b) {
    var z = st.z;
    if (z.fichier) {
      b.appendChild(el('div', { class: 'cz-file' }, el('span', { class: 'cz-tag cz-t-pdf' }, 'PDF'), el('b', {}, z.fichier_nom || 'Document'), el('button', { type: 'button', class: 'cz-lnk', onclick: function () { voirPdf(b.querySelector('.cz-pdfv'), z); } }, 'Afficher'), el('button', { type: 'button', class: 'cz-lnk is-danger', onclick: function () { sto(function (bk) { return bk.remove([z.fichier]); }).catch(function () {}).then(function () { z.fichier = null; z.fichier_nom = null; return enregistrer(true); }).then(function () { draw(); }, function () {}); } }, 'Retirer')));
      b.appendChild(el('div', { class: 'cz-pdfv' }));
    }
    var inp = el('input', { type: 'file', accept: 'application/pdf,.pdf', id: 'cz-pdf', class: 'cz-hide' });
    inp.addEventListener('change', function () { var f = inp.files && inp.files[0]; inp.value = ''; if (f) envoyerPdf(f); });
    var drop = el('label', { class: 'cz-drop', for: 'cz-pdf' }, el('b', {}, z.fichier ? 'Remplacer le PDF' : 'Choisir un fichier PDF'), el('span', {}, ' ou le glisser ici · 15 Mo maximum'));
    drop.addEventListener('dragover', function (e) { e.preventDefault(); drop.classList.add('is-on'); }); drop.addEventListener('dragleave', function () { drop.classList.remove('is-on'); });
    drop.addEventListener('drop', function (e) { e.preventDefault(); drop.classList.remove('is-on'); var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) envoyerPdf(f); });
    b.appendChild(drop); b.appendChild(inp);
    b.appendChild(el('p', { class: 'cz-aide' }, 'Fait sur Word, Canva, Pages… : enregistrez-le en PDF. Les joueurs le voient page par page dans l’appli, sans rien installer.'));
  }
  function envoyerPdf(f) {
    var z = st.z;
    if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { say('Choisissez un fichier PDF.'); return; }
    if (f.size > 15 * 1048576) { say('Ce PDF dépasse 15 Mo. Enregistrez-le en « taille réduite » puis réessayez.'); return; }
    var path = z.id + '/document-' + Date.now().toString(36) + '.pdf', old = z.fichier;
    say('Envoi du PDF…');
    sto(function (b) { return b.upload(path, f, { contentType: 'application/pdf', upsert: true }); }).then(function () {
      z.fichier = path; z.fichier_nom = String(f.name || 'document.pdf').slice(0, 160); if (z.genre !== 'pdf' && !z.contenu.mot && !(z.contenu.schemas || []).length) z.genre = 'pdf';
      return enregistrer(true);
    }).then(function () { if (old && old !== path) sto(function (b) { return b.remove([old]); }).catch(function () {}); say('PDF ajouté.'); draw(); }, function (e) { say(missing(e) ? (st.ctx.isAdmin ? 'Lancez d’abord supabase/causeries.sql dans Supabase.' : 'Les causeries ne sont pas encore ouvertes : réessayez un peu plus tard.') : 'PDF non envoyé : ' + msg(e)); });
  }
  function pdfjs() { return window.pdfjsLib ? Promise.resolve(window.pdfjsLib) : charge(PDFJS).then(function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_W; return window.pdfjsLib; }); }
  function blobDe(path) { return sto(function (b) { return b.download(path); }); }
  function voirPdf(host, z) {
    if (!host) return; host.innerHTML = ''; host.appendChild(el('p', { class: 'cz-vide' }, 'Ouverture du PDF…'));
    Promise.all([pdfjs(), blobDe(z.fichier).then(function (bl) { return bl.arrayBuffer(); })]).then(function (r) { return r[0].getDocument({ data: new Uint8Array(r[1]) }).promise; }).then(function (doc) {
      host.innerHTML = ''; var n = doc.numPages, cur = el('span', {}, 'Page 1 / ' + n), pages = el('div', { class: 'cz-pages' });
      var vbar = el('div', { class: 'cz-vbar' }, el('button', { type: 'button', class: 'cz-vb', 'aria-label': 'Page précédente', onclick: function () { aller2(-1); } }, '‹'), cur, el('button', { type: 'button', class: 'cz-vb', 'aria-label': 'Page suivante', onclick: function () { aller2(1); } }, '›'),
        el('button', { type: 'button', class: 'cz-vb', onclick: function () { pleinEcran(host); } }, '⤢ Plein écran'));
      host.appendChild(vbar); host.appendChild(pages);
      var cvs = [];
      function aller2(d) { var i = idx() + d; if (i < 0 || i >= n) return; cvs[i].scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      function idx() { var best = 0, bd = 1e9; cvs.forEach(function (c, i) { var t = Math.abs(c.getBoundingClientRect().top - pages.getBoundingClientRect().top); if (t < bd) { bd = t; best = i; } }); return best; }
      pages.addEventListener('scroll', function () { cur.textContent = 'Page ' + (idx() + 1) + ' / ' + n; }, { passive: true });
      var w = Math.min(900, pages.clientWidth || host.clientWidth || 600) - 4, dpr = Math.min(2, window.devicePixelRatio || 1);
      var chain = Promise.resolve();
      for (var i = 1; i <= n; i++) (function (k) { var c = el('canvas', { class: 'cz-page', role: 'img', 'aria-label': 'Page ' + k + ' sur ' + n }); cvs.push(c); pages.appendChild(c);
        chain = chain.then(function () { return doc.getPage(k); }).then(function (p) { var v0 = p.getViewport({ scale: 1 }), sc = w / v0.width, v = p.getViewport({ scale: sc * dpr }); c.width = v.width; c.height = v.height; c.style.width = w + 'px'; return p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise; }); })(i);
      return chain;
    }).catch(function (e) { host.innerHTML = ''; host.appendChild(el('p', { class: 'cz-info is-warn' }, 'Le PDF ne s’affiche pas : ' + msg(e))); });
  }
  function pleinEcran(node) { try { if (document.fullscreenElement) document.exitFullscreen(); else if (node.requestFullscreen) node.requestFullscreen().catch(function () { node.classList.toggle('cz-fs'); }); else node.classList.toggle('cz-fs'); } catch (e) { node.classList.toggle('cz-fs'); } }

  // ---------- photos ----------
  function photosVue(b) {
    var z = st.z, c = z.contenu; c.photos = c.photos || [];
    var cam = el('input', { type: 'file', accept: 'image/*', capture: 'environment', id: 'cz-cam', class: 'cz-hide' }), gal = el('input', { type: 'file', accept: 'image/*', id: 'cz-gal', class: 'cz-hide', multiple: true });
    [cam, gal].forEach(function (i) { i.addEventListener('change', function () { var fs = Array.prototype.slice.call(i.files || []); i.value = ''; if (fs[0]) photoEditeur(fs[0], fs.slice(1)); }); });
    b.appendChild(el('div', { class: 'cz-camzone' }, el('div', { class: 'cz-row cz-center' }, el('label', { class: 'cz-btn', for: 'cz-cam' }, '📷 Prendre une photo'), el('label', { class: 'cz-btn cz-ghost-w', for: 'cz-gal' }, 'Choisir dans la galerie')), cam, gal,
      el('p', { class: 'cz-aide cz-aide-w' }, 'Sur ordinateur : choisissez une image, glissez-la ici ou collez-la (Ctrl + V). Seuls les documents de travail : pas de photo de jeunes joueurs.')));
    var zone = b.querySelector('.cz-camzone');
    zone.addEventListener('dragover', function (e) { e.preventDefault(); }); zone.addEventListener('drop', function (e) { e.preventDefault(); var f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) photoEditeur(f, []); });
    st.onPaste = function (e) { var it = Array.prototype.slice.call((e.clipboardData && e.clipboardData.items) || []).find(function (x) { return /^image\//.test(x.type); }); if (it && st && st.sous === 'photos') photoEditeur(it.getAsFile(), []); };
    document.removeEventListener('paste', st.onPasteBound || function () {}); st.onPasteBound = st.onPaste; document.addEventListener('paste', st.onPasteBound);
    if (!c.photos.length) { b.appendChild(el('p', { class: 'cz-vide' }, 'Aucune photo pour l’instant.')); return; }
    var list = el('div', { class: 'cz-photos' }); b.appendChild(list);
    c.photos.forEach(function (p, i) {
      var img = el('img', { alt: p.legende || 'Photo ' + (i + 1), class: 'cz-ph-img' }); urlDe(p.chemin).then(function (u) { img.src = u; }, function () {});
      var leg = el('input', { class: 'cz-in', id: 'cz-pl-' + i, value: p.legende || '', maxlength: '120', 'aria-label': 'Légende' }); leg.addEventListener('input', function () { p.legende = leg.value; plusTard(); });
      var part = el('select', { class: 'cz-in', id: 'cz-pp-' + i, 'aria-label': 'Partie de la causerie' }); PARTIES.forEach(function (x) { part.appendChild(el('option', { value: x, selected: p.partie === x ? true : null }, x)); }); part.addEventListener('change', function () { p.partie = part.value; plusTard(); });
      list.appendChild(el('div', { class: 'cz-ph' }, img, el('div', { class: 'cz-ph-b' }, lab('Légende', leg), lab('Placer dans', part), el('div', { class: 'cz-row' },
        el('button', { type: 'button', class: 'cz-lnk', disabled: i ? null : true, onclick: function () { c.photos.splice(i - 1, 0, c.photos.splice(i, 1)[0]); plusTard(); draw(); } }, '↑ Monter'),
        el('button', { type: 'button', class: 'cz-lnk is-danger', onclick: function () { var x = c.photos.splice(i, 1)[0]; sto(function (bk) { return bk.remove([x.chemin]); }).catch(function () {}); enregistrer(true).then(function () { draw(); }, function () {}); } }, 'Retirer')))));
    });
  }
  var urlCache = {};
  function urlDe(path) { if (urlCache[path]) return Promise.resolve(urlCache[path]); return blobDe(path).then(function (bl) { var u = URL.createObjectURL(bl); urlCache[path] = u; (st.urls = st.urls || []).push(u); return u; }); }

  // Éditeur de photo : 4 coins (détectés automatiquement), redressement, lisibilité
  function photoEditeur(file, reste) {
    lireImage(file).then(function (img) {
      var MAX = 1800, k = Math.min(1, MAX / Math.max(img.width, img.height)), src = el('canvas'); src.width = Math.round(img.width * k); src.height = Math.round(img.height * k); src.getContext('2d').drawImage(img, 0, 0, src.width, src.height);
      var coins = detecterCoins(src), opt = { redresser: true, lisible: true }, legende = { v: '' }, partie = { v: 'Plan de jeu' };
      var view = el('canvas', { class: 'cz-crop', role: 'img', 'aria-label': 'Photo à recadrer : déplacez les 4 coins jaunes' }); view.width = src.width; view.height = src.height;
      function rend() { var x = view.getContext('2d'); x.drawImage(src, 0, 0); if (!opt.redresser) return; x.save(); x.strokeStyle = '#f2b33d'; x.lineWidth = Math.max(3, src.width / 300); x.setLineDash([x.lineWidth * 3, x.lineWidth * 2]); x.beginPath(); coins.forEach(function (p, i) { if (i) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.closePath(); x.stroke(); x.setLineDash([]); coins.forEach(function (p) { x.beginPath(); x.arc(p[0], p[1], src.width / 45, 0, 7); x.fillStyle = '#f2b33d'; x.fill(); x.lineWidth = src.width / 300; x.strokeStyle = '#10283a'; x.stroke(); }); x.restore(); }
      var drag = -1;
      function pos(e) { var r = view.getBoundingClientRect(); return [(e.clientX - r.left) * view.width / r.width, (e.clientY - r.top) * view.height / r.height]; }
      view.addEventListener('pointerdown', function (e) { if (!opt.redresser) return; var p = pos(e), best = -1, bd = view.width / 10; coins.forEach(function (c, i) { var d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < bd) { bd = d; best = i; } }); drag = best; if (best >= 0) try { view.setPointerCapture(e.pointerId); } catch (x) {} });
      view.addEventListener('pointermove', function (e) { if (drag < 0) return; var p = pos(e); coins[drag] = [Math.max(0, Math.min(view.width, p[0])), Math.max(0, Math.min(view.height, p[1]))]; rend(); });
      view.addEventListener('pointerup', function () { drag = -1; }); view.style.touchAction = 'none';
      rend();
      var leg = el('input', { class: 'cz-in', id: 'cz-ph-leg', maxlength: '120', placeholder: 'ex. Le pressing sur leur côté gauche' }); leg.addEventListener('input', function () { legende.v = leg.value; });
      var part = el('select', { class: 'cz-in', id: 'cz-ph-part' }); PARTIES.forEach(function (x) { part.appendChild(el('option', { value: x }, x)); }); part.addEventListener('change', function () { partie.v = part.value; });
      var body = el('div', { class: 'cz-phed' }, el('div', { class: 'cz-phed-v' }, view),
        el('div', { class: 'cz-phed-o' }, chk('cz-ph-r', true, 'Recadrer et redresser (déplacez les 4 coins jaunes)', function (v) { opt.redresser = v; rend(); }), chk('cz-ph-l', true, 'Rendre lisible : fond blanc, traits plus nets', function (v) { opt.lisible = v; }), lab('Légende', leg), lab('Placer dans la causerie', part)));
      modal('Photo de mon travail', body, [['Annuler', null], ['Ajouter à ma causerie', function () {
        var out = opt.redresser ? redresser(src, coins) : src; if (opt.lisible) lisible(out);
        out.toBlob(function (bl) {
          if (!bl) { say('Photo non préparée.'); return; }
          var path = st.z.id + '/photo-' + Date.now().toString(36) + '.jpg'; say('Envoi de la photo…');
          sto(function (b) { return b.upload(path, bl, { contentType: 'image/jpeg', upsert: true }); }).then(function () {
            st.z.contenu.photos = st.z.contenu.photos || []; st.z.contenu.photos.push({ chemin: path, legende: legende.v.trim(), partie: partie.v }); if (st.z.genre !== 'photo' && !st.z.fichier && !st.z.contenu.mot && st.z.contenu.photos.length === 1 && !(st.z.contenu.schemas || []).length) st.z.genre = 'photo';
            return enregistrer(true);
          }).then(function () { say('Photo ajoutée à la causerie.'); st.sous = 'photos'; draw(); if (reste.length) photoEditeur(reste[0], reste.slice(1)); }, function (e) { say(missing(e) ? (st.ctx.isAdmin ? 'Lancez d’abord supabase/causeries.sql dans Supabase.' : 'Les causeries ne sont pas encore ouvertes : réessayez un peu plus tard.') : 'Photo non envoyée : ' + msg(e)); });
        }, 'image/jpeg', .86);
      }]], 'cz-modal-wide');
    }, function () { say('Cette image ne s’ouvre pas. Essayez une photo JPEG ou PNG.'); });
  }
  function lireImage(f) { return new Promise(function (ok, ko) { var u = URL.createObjectURL(f), im = new Image(); im.onload = function () { ok(im); setTimeout(function () { URL.revokeObjectURL(u); }, 1000); }; im.onerror = ko; im.src = u; }); }
  // Repère la feuille ou le tableau (zone claire) : les 4 points extrêmes de la plus grande zone claire
  function detecterCoins(c) {
    var W = c.width, H = c.height, s = Math.min(1, 240 / Math.max(W, H)), w = Math.max(8, Math.round(W * s)), h = Math.max(8, Math.round(H * s));
    var t = el('canvas'); t.width = w; t.height = h; var x = t.getContext('2d'); x.drawImage(c, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, lum = new Float32Array(w * h), sum = 0;
    for (var i = 0; i < w * h; i++) { lum[i] = .299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2]; sum += lum[i]; }
    var hist = new Array(256).fill(0); for (i = 0; i < w * h; i++) hist[Math.min(255, lum[i] | 0)]++;
    // seuil d'Otsu
    var tot = w * h, sB = 0, wB = 0, best = 0, th = 128, sAll = 0; for (i = 0; i < 256; i++) sAll += i * hist[i];
    for (i = 0; i < 256; i++) { wB += hist[i]; if (!wB) continue; var wF = tot - wB; if (!wF) break; sB += i * hist[i]; var mB = sB / wB, mF = (sAll - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; th = i; } }
    var tl = null, tr = null, br = null, bl = null, n = 0;
    for (var y = 0; y < h; y++) for (var xx = 0; xx < w; xx++) { if (lum[y * w + xx] <= th) continue; n++;
      if (!tl || xx + y < tl[0] + tl[1]) tl = [xx, y]; if (!br || xx + y > br[0] + br[1]) br = [xx, y];
      if (!tr || xx - y > tr[0] - tr[1]) tr = [xx, y]; if (!bl || y - xx > bl[1] - bl[0]) bl = [xx, y]; }
    var area = n / tot;
    if (!tl || area < .15 || area > .97) { var m = .04; return [[W * m, H * m], [W * (1 - m), H * m], [W * (1 - m), H * (1 - m)], [W * m, H * (1 - m)]]; }
    return [tl, tr, br, bl].map(function (p) { return [p[0] / s, p[1] / s]; });
  }
  // Redresse le quadrilatère en rectangle (transformation projective)
  function redresser(src, q) {
    var dist = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); };
    var Wo = Math.round(Math.max(dist(q[0], q[1]), dist(q[3], q[2]))), Ho = Math.round(Math.max(dist(q[0], q[3]), dist(q[1], q[2])));
    var k = Math.min(1, 1800 / Math.max(Wo, Ho)); Wo = Math.max(50, Math.round(Wo * k)); Ho = Math.max(50, Math.round(Ho * k));
    // carré unité -> quadrilatère (Heckbert)
    var x0 = q[0][0], y0 = q[0][1], x1 = q[1][0], y1 = q[1][1], x2 = q[2][0], y2 = q[2][1], x3 = q[3][0], y3 = q[3][1];
    var sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3, a, b, c, d, e, f, g, h;
    if (Math.abs(sx) < 1e-9 && Math.abs(sy) < 1e-9) { a = x1 - x0; b = x2 - x1; c = x0; d = y1 - y0; e = y2 - y1; f = y0; g = 0; h = 0; }
    else { var dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, den = dx1 * dy2 - dx2 * dy1; g = (sx * dy2 - dx2 * sy) / den; h = (dx1 * sy - sx * dy1) / den; a = x1 - x0 + g * x1; b = x3 - x0 + h * x3; c = x0; d = y1 - y0 + g * y1; e = y3 - y0 + h * y3; f = y0; }
    var sd = src.getContext('2d').getImageData(0, 0, src.width, src.height), S = sd.data, SW = src.width, SH = src.height;
    var out = el('canvas'); out.width = Wo; out.height = Ho; var ox = out.getContext('2d'), od = ox.createImageData(Wo, Ho), O = od.data;
    for (var yy = 0; yy < Ho; yy++) { var v = yy / (Ho - 1); for (var xx = 0; xx < Wo; xx++) { var u = xx / (Wo - 1), w = g * u + h * v + 1, X = (a * u + b * v + c) / w, Y = (d * u + e * v + f) / w;
      var ix = Math.max(0, Math.min(SW - 1, X | 0)), iy = Math.max(0, Math.min(SH - 1, Y | 0)), si = (iy * SW + ix) * 4, oi = (yy * Wo + xx) * 4; O[oi] = S[si]; O[oi + 1] = S[si + 1]; O[oi + 2] = S[si + 2]; O[oi + 3] = 255; } }
    ox.putImageData(od, 0, 0); return out;
  }
  // Fond blanc et traits plus nets (étirement des niveaux, sans toucher aux couleurs des feutres)
  function lisible(c) {
    var x = c.getContext('2d'), id = x.getImageData(0, 0, c.width, c.height), d = id.data, hist = new Array(256).fill(0), n = c.width * c.height;
    for (var i = 0; i < n; i++) hist[(.299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2]) | 0]++;
    var acc = 0, lo = 0, hi = 255; for (i = 0; i < 256; i++) { acc += hist[i]; if (acc > n * .02) { lo = i; break; } } acc = 0; for (i = 255; i >= 0; i--) { acc += hist[i]; if (acc > n * .25) { hi = i; break; } }
    var r = Math.max(30, hi - lo);
    for (i = 0; i < n; i++) for (var k = 0; k < 3; k++) { var v = (d[i * 4 + k] - lo) * 255 / r; d[i * 4 + k] = v > 235 ? 255 : v < 0 ? 0 : v; }
    x.putImageData(id, 0, 0); return c;
  }

  // ---------------------------------------------------------------- publication
  function publierVue(body) {
    var z = st.z;
    var e = etat(z), pub = z.statut === 'publie';
    body.appendChild(el('div', { class: 'cz-sum cz-sum-top' }, el('span', {}, el('b', {}, pub ? 'Publiée' : 'Brouillon'), ' · ', fenetre(z)),
      el('div', { class: 'cz-row' }, el('button', { type: 'button', class: 'cz-btn cz-ghost-w', onclick: function () { exporter(z, true); } }, 'Exporter en PDF'),
        pub ? el('button', { type: 'button', class: 'cz-btn cz-ghost-w', onclick: function () { z.statut = 'brouillon'; enregistrer(true).then(function () { say('Repassée en brouillon : plus visible des joueurs.'); draw(); }, function () {}); } }, 'Repasser en brouillon')
          : el('button', { type: 'button', class: 'cz-btn', onclick: publier }, z.ouvre_le && new Date(z.ouvre_le) > Date.now() ? 'Publier pour ' + quand(z.ouvre_le) : 'Publier maintenant'))));
    body.appendChild(el('p', { class: 'cz-aide' }, 'Aperçu : c’est ce que verront les personnes autorisées.'));
    var pv = el('div', { class: 'cz-apercu' }); body.appendChild(pv);
    Store.notes(z.id).then(function (n) { st.notes = n; lecture(pv, z, true); });
  }
  function publier() {
    var z = st.z; z.statut = 'publie';
    enregistrer(true).then(function () {
      say(z.ouvre_le && new Date(z.ouvre_le) > Date.now() ? 'Publiée : elle s’ouvrira ' + quand(z.ouvre_le) + '.' : 'Publiée : les personnes choisies peuvent l’ouvrir.');
      if (z.notifier && !z.notifie && A().appel) A().appel('notifications', { action: 'causerie', causerie: z.id }).then(function (r) { if (r && r.envoyees) say(r.envoyees + ' appareil' + (r.envoyees > 1 ? 's' : '') + ' prévenu' + (r.envoyees > 1 ? 's' : '') + '.'); }, function () {});
      draw();
    }, function () { z.statut = 'brouillon'; });
  }

  // ---------------------------------------------------------------- lecture (joueurs) et aperçu
  function voir(z) {
    Promise.all([Store.un(z.id), st.staff ? Store.notes(z.id) : Promise.resolve('')]).then(function (r) {
      if (!r[0]) { say('Cette causerie n’est pas (ou plus) ouverte pour vous.'); return; }
      st.z = r[0]; st.notes = r[1]; st.vue = 'voir'; draw();
    }, function (e) { say(msg(e)); });
  }
  function lecture(main, z, apercu) {
    var c = z.contenu || {}, ev = evDe(z.evenement_id), w = el('div', { class: 'cz-wrap cz-wrap-read' }), sp = sportCle(z);
    var card = el('article', { class: 'cz-read' });
    card.appendChild(el('header', { class: 'cz-rh' }, el('span', { class: 'cz-k' }, 'Causerie d’avant-match' + (pourQui(z) ? ' · ' + pourQui(z) : '')), el('h2', {}, z.titre), el('small', {}, [ev ? evLabel(ev) : '', ev && ev.lieu, z.auteur_nom ? 'Coach ' + z.auteur_nom : ''].filter(Boolean).join(' · '))));
    var sec = function (t, body, cls) { if (!body) return; card.appendChild(el('section', { class: 'cz-rs ' + (cls || '') }, el('h3', {}, t), body)); };
    var para = function (v) { return vide(v) ? null : el('p', {}, v); };
    if (z.fichier) { var pv = el('div', { class: 'cz-pdfv' }); sec('Le document du coach', pv); setTimeout(function () { voirPdf(pv, z); }, 0); }
    sec('Le mot du coach', para(c.mot));
    sec('Ce qu’on retient du dernier match', para(c.dernier));
    var photosDe = function (partie) { var ps = (c.photos || []).filter(function (p) { return (p.partie || 'Autre') === partie; }); if (!ps.length) return null; return el('div', { class: 'cz-rphotos' }, ps.map(function (p) { var im = el('img', { alt: p.legende || 'Photo du coach', loading: 'lazy' }); urlDe(p.chemin).then(function (u) { im.src = u; }, function () {}); return el('figure', {}, im, p.legende ? el('figcaption', {}, p.legende) : null); })); };
    sec('Plan de jeu', (para(c.plan) || photosDe('Plan de jeu')) ? el('div', {}, para(c.plan), photosDe('Plan de jeu')) : null);
    sec('L’adversaire', para(c.adversaire));
    if (sp && c.compo && c.compo.etapes[0].objets.length) sec('La compo', el('div', { class: 'cz-rcompo' }, el('div', { class: 'cz-rschema', html: T.svg(c.compo, 0, { label: 'La compo' }) }), feuille(c)));
    else if (feuille(c)) sec('La compo', feuille(c));
    ['Attaque', 'Défense'].forEach(function (p) { sec(p, photosDe(p)); });
    (c.schemas || []).forEach(function (s) {
      var v = el('div', { class: 'cz-rschema', html: T.svg(s, s.etapes.length - 1, { label: s.titre || s.situation }) });
      var anim = s.etapes.length > 1 ? el('button', { type: 'button', class: 'cz-btn cz-dark cz-btn-s', onclick: function () { if (st.stopAnim) { st.stopAnim(); st.stopAnim = null; anim.textContent = '▶ Voir l’animation'; v.innerHTML = T.svg(s, s.etapes.length - 1); return; } st.stopAnim = T.animer(v, s); anim.textContent = '■ Arrêter'; } }, '▶ Voir l’animation') : null;
      sec(s.situation + (s.titre ? ' · ' + s.titre : ''), el('div', {}, v, el('div', { class: 'cz-row' }, anim, s.etapes.length > 1 ? el('span', { class: 'cz-meta' }, s.etapes.length + ' étapes') : null), para(s.consigne)));
    });
    sec('Coups de pied arrêtés', photosDe('Coups de pied arrêtés'));
    if (sp) { var tir = tireursBloc(z); if (tir) sec('Tireurs et marquages', tir); }
    var cles = (c.cles || []).filter(function (x) { return !vide(x); });
    sec('Les 3 clés', cles.length ? el('ol', {}, cles.map(function (x) { return el('li', {}, x); })) : null);
    sec('Autres documents', photosDe('Autre'));
    if (!vide(c.phrase)) card.appendChild(el('div', { class: 'cz-rq' }, c.phrase));
    if (st.staff && !vide(st.notes)) sec('Notes du staff (jamais visibles des joueurs)', para(st.notes), 'cz-rs-staff');
    if (card.children.length === 1) card.appendChild(el('p', { class: 'cz-vide cz-pad' }, 'La causerie est encore vide : ajoutez un PDF, une photo ou remplissez le modèle.'));
    card.appendChild(el('footer', { class: 'cz-rf' }, el('span', {}, 'Le Vestiaire · Casa Besports'), el('span', {}, 'Confidentiel · ' + (st.monNom || 'document interne à l’équipe'))));
    w.appendChild(card);
    if (!apercu) {
      var bar = el('div', { class: 'cz-vu' });
      if (!st.staff) {
        var lu = !!st.mesLus[z.id];
        bar.appendChild(el('span', {}, lu ? 'Merci, le coach sait que vous l’avez lue.' : 'Le coach saura que vous l’avez lue.'));
        bar.appendChild(el('button', { type: 'button', class: 'cz-btn', disabled: lu ? true : null, onclick: function () { db(function (cl) { return cl.from('causerie_lectures').insert({ causerie_id: z.id }); }).then(function () { st.mesLus[z.id] = true; say('C’est noté : vous l’avez lue.'); draw(); }, function (e) { if (/duplicate|unique/i.test(msg(e))) { st.mesLus[z.id] = true; draw(); } else say(msg(e)); }); } }, lu ? '✓ Lue' : '✓ J’ai lu'));
      } else {
        bar.appendChild(el('span', {}, fenetre(z)));
        bar.appendChild(el('div', { class: 'cz-row' }, el('button', { type: 'button', class: 'cz-btn cz-ghost-w', onclick: function () { quiALu(z); } }, 'Qui l’a lue ?'), el('button', { type: 'button', class: 'cz-btn', onclick: function () { modifier(z); } }, 'Modifier')));
      }
      if (st.staff || z.telechargement) bar.appendChild(el('div', { class: 'cz-row' }, el('button', { type: 'button', class: 'cz-btn cz-ghost-w', onclick: function () { exporter(z, st.staff); } }, 'Exporter en PDF'),
        z.fichier ? el('button', { type: 'button', class: 'cz-btn cz-ghost-w', onclick: function () { blobDe(z.fichier).then(function (b) { telecharger(b, z.fichier_nom || 'causerie.pdf'); }, function (e) { say(msg(e)); }); } }, 'Télécharger le PDF du coach') : null));
      w.appendChild(bar);
    }
    main.appendChild(w);
  }
  function tireursBloc(z) {
    var sp = sportCle(z), t = (z.contenu || {}).tireurs || {}, cards = [];
    (T.TIREURS[sp] || []).forEach(function (card) {
      var d = t[card.k]; if (!d) return; var rows = card.lignes.map(function (l) { var v = (d.lignes || {})[l[0]]; return v && (!vide(v.nom) || !vide(v.note)) ? [l[1], v.nom, v.note] : null; }).filter(Boolean);
      if (!rows.length && !d.choix) return;
      cards.push(el('div', { class: 'cz-tc cz-tc-r' }, el('h4', {}, el('em', { class: card.camp === 'def' ? 'is-def' : '' }, card.camp === 'def' ? 'Défensif' : 'Offensif'), card.titre), d.choix ? el('div', { class: 'cz-meta' }, 'Système : ', el('b', {}, d.choix)) : null,
        rows.map(function (r) { return el('div', { class: 'cz-ord cz-ord-r' }, el('span', { class: 'cz-ord-l' }, r[0]), el('b', {}, r[1] || '—'), r[2] ? el('small', {}, r[2]) : null); })));
    });
    return cards.length ? el('div', { class: 'cz-tir' }, cards) : null;
  }
  function quiALu(z) {
    Promise.all([Store.lecteurs(z.id), Store.membres(st.club), Store.presences(z.evenement_id), Store.acces(z.id)]).then(function (r) {
      var lus = r[0] || [], vus = {}; lus.forEach(function (l) { vus[l.user_id] = l; });
      var pas = []; var dejaU = {}; (r[1] || []).forEach(function (m) { if (m.staff || dejaU[m.user_id] || vus[m.user_id]) return; if (autorise(z, m, r[3], r[2])) { dejaU[m.user_id] = 1; pas.push(m.nom); } });
      modal('Qui l’a lue ?', el('div', {}, el('h4', { class: 'cz-h3s' }, 'Lue · ' + lus.length), lus.length ? el('ul', { class: 'cz-ul' }, lus.map(function (l) { return el('li', {}, el('b', {}, l.nom || 'Membre'), ' · ' + quand(l.lu_le)); })) : el('p', { class: 'cz-vide' }, 'Personne pour l’instant.'),
        el('h4', { class: 'cz-h3s' }, 'Pas encore lue · ' + pas.length), pas.length ? el('p', {}, pas.join(', ')) : el('p', { class: 'cz-vide' }, 'Tout le monde l’a lue.')), [['Fermer', null]]);
    }, function (e) { say(msg(e)); });
  }

  // ---------------------------------------------------------------- export PDF
  function exporter(z, staff) {
    var opt = { format: 'a4', schemas: true, tireurs: true, photos: true, notes: false, nom: true };
    var corps = el('div', { class: 'cz-form cz-form-plain' });
    var fmt = el('div', { class: 'cz-chips', role: 'radiogroup', 'aria-label': 'Format' }); [['a4', 'A4 (à imprimer)'], ['tel', 'Format téléphone']].forEach(function (f) { fmt.appendChild(el('button', { type: 'button', role: 'radio', class: 'cz-chip', 'aria-checked': opt.format === f[0] ? 'true' : 'false', onclick: function () { opt.format = f[0]; Array.prototype.forEach.call(fmt.children, function (b) { b.setAttribute('aria-checked', b === this ? 'true' : 'false'); }, this); } }, f[1])); });
    corps.appendChild(lab('Format', fmt, 'is-wide'));
    corps.appendChild(chk('cz-x-s', true, 'Schémas tactiques et compo', function (v) { opt.schemas = v; }));
    corps.appendChild(chk('cz-x-t', true, 'Tireurs et marquages', function (v) { opt.tireurs = v; }));
    corps.appendChild(chk('cz-x-p', true, 'Photos du coach', function (v) { opt.photos = v; }));
    if (staff) { corps.appendChild(chk('cz-x-n', false, 'Notes réservées au staff', function (v) { opt.notes = v; })); corps.appendChild(chk('cz-x-w', true, 'Nom du lecteur en bas de chaque page', function (v) { opt.nom = v; })); }
    else corps.appendChild(el('p', { class: 'cz-aide is-wide' }, 'Votre nom est écrit en bas de chaque page : ce document est réservé à l’équipe.'));
    if (z.fichier) corps.appendChild(el('p', { class: 'cz-aide is-wide' }, 'Le PDF déposé par le coach se télécharge à part (bouton « Télécharger le PDF du coach »).'));
    var schemas = [].concat(z.contenu && z.contenu.compo && z.contenu.compo.etapes[0].objets.length ? [z.contenu.compo] : [], (z.contenu && z.contenu.schemas) || []);
    modal('Exporter la causerie', corps, [['Fermer', null], schemas.length ? ['Images des schémas', function () { imagesSchemas(z, schemas); }, 'cz-ghost-b'] : null, ['Télécharger le PDF', function () {
      say('Préparation du PDF…');
      (opt.notes ? Store.notes(z.id) : Promise.resolve('')).then(function (n) { return construirePDF(z, opt, n); }).then(function (b) { telecharger(b, slug(z.titre) + '.pdf'); say('PDF prêt.'); }, function (e) { say('Export impossible : ' + msg(e)); });
    }]].filter(Boolean));
  }
  function svgImage(s, idx, wpx) {
    var code = T.svg(s, idx); var c = T.cadre(s); var hpx = Math.round(wpx * c[3] / c[2]);
    code = code.replace('<svg ', '<svg width="' + wpx + '" height="' + hpx + '" ');
    return new Promise(function (ok, ko) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ko(new Error('Schéma illisible')); }; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(code); });
  }
  function imagesSchemas(z, list) {
    var i = 0; (function next() { if (i >= list.length) { say(list.length + ' image' + (list.length > 1 ? 's' : '') + ' téléchargée' + (list.length > 1 ? 's' : '') + '.'); return; } var s = list[i++];
      svgImage(s, s.etapes.length - 1, 1600).then(function (im) { var c = el('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); c.toBlob(function (b) { telecharger(b, slug((s.situation === 'Compo' ? 'compo' : s.situation) + ' ' + (s.titre || '')) + '.png'); setTimeout(next, 400); }, 'image/png'); }, function () { next(); }); })();
  }
  function wrap(ctx, text, maxW) {
    var out = []; String(text || '').split(/\n/).forEach(function (para) { var words = para.split(/\s+/), line = ''; words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }); out.push(line); }); return out;
  }
  function construirePDF(z, opt, notes) {
    var c = z.contenu || {}, sp = sportCle(z), tel = opt.format === 'tel';
    var PW = tel ? 1080 : 1240, PH = tel ? 1920 : 1754, M = tel ? 64 : 90, CW = PW - 2 * M, FOOT = 70;
    var F = { k: '700 ' + (tel ? 24 : 22) + 'px "Barlow Condensed", "Arial Narrow", sans-serif', h1: '800 ' + (tel ? 58 : 54) + 'px "League Spartan", "Arial Black", sans-serif', h2: '800 ' + (tel ? 30 : 28) + 'px "League Spartan", "Arial Black", sans-serif', p: '400 ' + (tel ? 30 : 26) + 'px Inter, Arial, sans-serif', pb: '700 ' + (tel ? 30 : 26) + 'px Inter, Arial, sans-serif', s: '400 ' + (tel ? 24 : 21) + 'px Inter, Arial, sans-serif', q: '800 ' + (tel ? 40 : 36) + 'px "League Spartan", "Arial Black", sans-serif' };
    var LH = tel ? 44 : 38;
    var meas = el('canvas').getContext('2d');
    var pages = [[]], y = 0, ev = evDe(z.evenement_id);
    function page() { pages.push([]); y = M + 50; }
    function need(h) { if (y + h > PH - M - FOOT) page(); }
    function op(f) { pages[pages.length - 1].push(f); }
    // en-tête
    var headH = tel ? 330 : 300; y = headH + 40;
    var sous = [ev ? evLabel(ev) : '', ev && ev.lieu, z.auteur_nom ? 'Coach ' + z.auteur_nom : ''].filter(Boolean).join(' · ');
    meas.font = F.h1; var tl = wrap(meas, z.titre, CW - 120).slice(0, 2);
    op(function (x) { x.fillStyle = '#10283a'; x.fillRect(0, 0, PW, headH); x.fillStyle = '#f2b33d'; x.fillRect(0, headH - 12, PW, 12); x.font = F.k; x.fillText(('Causerie d’avant-match' + (pourQui(z) ? ' · ' + pourQui(z) : '')).toUpperCase(), M, M + 10); x.fillStyle = '#fff'; x.font = F.h1; tl.forEach(function (t, i) { x.fillText(t.toUpperCase(), M, M + 80 + i * (tel ? 62 : 58)); }); x.font = F.s; x.fillStyle = 'rgba(255,255,255,.82)'; x.fillText(sous, M, headH - 44); x.font = '900 34px "League Spartan", Arial, sans-serif'; x.fillStyle = '#fff'; x.textAlign = 'right'; x.fillText('BE', PW - M - 22, M + 22); x.fillStyle = '#f2b33d'; x.fillText('+', PW - M, M + 22); x.textAlign = 'left'; });
    function titre(t) { need(LH * 3); var yy = y; op(function (x) { x.fillStyle = '#f2b33d'; x.fillRect(M, yy - 20, 18, 18); x.fillStyle = '#10283a'; x.font = F.h2; x.fillText(t.toUpperCase(), M + 30, yy); }); y += LH + 4; }
    function texte(t, font, col) { if (vide(t)) return; meas.font = font || F.p; wrap(meas, t, CW).forEach(function (l) { need(LH); var yy = y; op(function (x) { x.fillStyle = col || '#222'; x.font = font || F.p; x.fillText(l, M, yy); }); y += LH; }); y += LH * .4; }
    function image(im, legende, maxH) {
      var w = CW, h = im.height * w / im.width, mh = maxH || (PH - 2 * M - FOOT - 160); if (h > mh) { h = mh; w = im.width * h / im.height; }
      need(h + (legende ? LH : 0) + 10); var yy = y; op(function (x) { x.drawImage(im, M + (CW - w) / 2, yy - LH + 10, w, h); }); y += h + 10;
      if (legende) texte(legende, F.s, '#555');
      y += 10;
    }
    var jobs = [];
    function section(t, fn) { jobs.push(function () { titre(t); return fn(); }); }
    function sec(t, v) { if (!vide(v)) section(t, function () { texte(v); }); }
    var photos = function (p) { return opt.photos ? (c.photos || []).filter(function (x) { return (x.partie || 'Autre') === p; }) : []; };
    function phJob(t, p) { var ps = photos(p); if (!ps.length) return; jobs.push(function () { titre(t); return ps.reduce(function (pr, ph) { return pr.then(function () { return urlDe(ph.chemin).then(function (u) { return new Promise(function (ok) { var im = new Image(); im.onload = function () { image(im, ph.legende, (PH - 2 * M) * .55); ok(); }; im.onerror = ok; im.src = u; }); }, function () {}); }); }, Promise.resolve()); }); }
    sec('Le mot du coach', c.mot); sec('Ce qu’on retient du dernier match', c.dernier); sec('Plan de jeu', c.plan); phJob('Plan de jeu · photos', 'Plan de jeu'); sec('L’adversaire', c.adversaire);
    if (opt.schemas && sp && c.compo && c.compo.etapes[0].objets.length) jobs.push(function () { titre('La compo'); return svgImage(c.compo, 0, 1400).then(function (im) { image(im, '', (PH - 2 * M) * .5); listePDF(); }); });
    else if (T.titulaires(c.compo).length || remplacants(c).length) jobs.push(function () { titre('La compo'); listePDF(); });
    function listePDF() {
      var tit = T.titulaires(c.compo), rem = remplacants(c).filter(function (r) { return !vide(r.nom) || !vide(r.n); });
      var bloc = function (t, L) { if (!L.length) return; texte(t.toUpperCase(), F.k, '#5e5b53'); y -= LH * .3; L.forEach(function (j) { need(LH); var yy = y; op(function (x) {
        x.fillStyle = '#10283a'; x.fillRect(M, yy - LH + 12, 56, LH - 6); x.fillStyle = '#fff'; x.font = F.pb; x.textAlign = 'center'; x.fillText(j.n || '–', M + 28, yy); x.textAlign = 'left';
        x.fillStyle = '#222'; x.font = F.p; x.fillText(j.nom || '', M + 72, yy); var w = x.measureText(j.nom || '').width;
        if (j.g) { x.font = F.s; x.fillStyle = '#5e5b53'; x.fillText('Gardien', M + 84 + w, yy); w += x.measureText('Gardien').width + 12; }
        if (j.cap) { var cx = M + 96 + w, r = LH * .36; x.fillStyle = '#f2b33d'; x.beginPath(); x.arc(cx, yy - r * .75, r, 0, 7); x.fill(); x.strokeStyle = '#10283a'; x.lineWidth = 2; x.stroke(); x.fillStyle = '#10283a'; x.font = '900 ' + Math.round(r * 1.2) + 'px "League Spartan", Arial, sans-serif'; x.textAlign = 'center'; x.fillText('C', cx, yy - r * .32); x.textAlign = 'left'; }
      }); y += LH + 8; }); y += LH * .4; };
      bloc('Le onze de départ', tit); bloc('Remplaçants', rem);
    }
    phJob('Attaque', 'Attaque'); phJob('Défense', 'Défense');
    if (opt.schemas && sp) (c.schemas || []).forEach(function (s) { jobs.push(function () { titre(s.situation + (s.titre ? ' · ' + s.titre : '')); var idxs = s.etapes.length > 1 ? s.etapes.map(function (x, i) { return i; }) : [0];
      return idxs.reduce(function (p, i) { return p.then(function () { return svgImage(s, i, 1400).then(function (im) { image(im, s.etapes.length > 1 ? 'Étape ' + (i + 1) + ' sur ' + s.etapes.length : '', (PH - 2 * M) * (s.etapes.length > 1 ? .36 : .45)); }); }); }, Promise.resolve()).then(function () { texte(s.consigne); }); }); });
    phJob('Coups de pied arrêtés · photos', 'Coups de pied arrêtés');
    if (opt.tireurs && sp) { var t = c.tireurs || {}; (T.TIREURS[sp] || []).forEach(function (card) { var d = t[card.k]; if (!d) return; var rows = card.lignes.map(function (l) { var v = (d.lignes || {})[l[0]]; return v && (!vide(v.nom) || !vide(v.note)) ? l[1] + ' : ' + (v.nom || '—') + (v.note ? ' (' + v.note + ')' : '') : null; }).filter(Boolean); if (!rows.length && !d.choix) return;
      jobs.push(function () { titre((card.camp === 'def' ? 'Défensif · ' : '') + card.titre); if (d.choix) texte('Système : ' + d.choix, F.pb); rows.forEach(function (r) { texte(r); }); }); }); }
    var cles = (c.cles || []).filter(function (x) { return !vide(x); }); if (cles.length) jobs.push(function () { titre('Les 3 clés'); cles.forEach(function (k, i) { texte((i + 1) + '. ' + k, F.pb, '#10283a'); }); });
    phJob('Autres documents', 'Autre');
    if (!vide(c.phrase)) jobs.push(function () { meas.font = F.q; var ls = wrap(meas, c.phrase, CW - 60); var h = ls.length * (tel ? 50 : 46) + 50; need(h); var yy = y; op(function (x) { x.fillStyle = '#efebe3'; x.fillRect(M, yy - 30, CW, h); x.fillStyle = '#f2b33d'; x.fillRect(M, yy - 30, 8, h); x.fillStyle = '#10283a'; x.font = F.q; ls.forEach(function (l, i) { x.fillText(l.toUpperCase(), M + 34, yy + 22 + i * (tel ? 50 : 46)); }); }); y += h + 20; });
    if (opt.notes && !vide(notes)) sec('Notes du staff', notes);
    return document.fonts && document.fonts.ready ? document.fonts.ready.then(run) : run();
    function run() {
      return jobs.reduce(function (p, j) { return p.then(function () { return j(); }); }, Promise.resolve()).then(function () {
        var N = pages.length, nom = opt.nom ? 'Confidentiel · ' + (st.monNom || 'document interne') : 'Document interne à l’équipe';
        var jp = pages.map(function (ops, i) {
          var cv = el('canvas'); cv.width = PW; cv.height = PH; var x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, PW, PH); x.textBaseline = 'alphabetic';
          if (i > 0) { x.fillStyle = '#10283a'; x.font = F.k; x.fillText((z.titre || '').toUpperCase(), M, M); x.fillStyle = '#e3ded3'; x.fillRect(M, M + 14, CW, 2); }
          ops.forEach(function (f) { x.save(); f(x); x.restore(); });
          x.fillStyle = '#e3ded3'; x.fillRect(M, PH - M - 30, CW, 2); x.fillStyle = '#6b6860'; x.font = F.k; x.fillText('LE VESTIAIRE · CASA BESPORTS', M, PH - M + 6); x.textAlign = 'right'; x.fillText((nom + '   ' + (i + 1) + '/' + N).toUpperCase(), PW - M, PH - M + 6);
          return new Promise(function (ok, ko) { cv.toBlob(function (b) { if (!b) return ko(new Error('Page vide')); b.arrayBuffer().then(function (buf) { ok({ jpg: new Uint8Array(buf), w: PW, h: PH }); }); }, 'image/jpeg', .9); });
        });
        return Promise.all(jp).then(function (imgs) { return pdfDe(imgs, z.titre); });
      });
    }
  }
  // PDF de plusieurs pages, une image JPEG par page (écrit à la main : aucune bibliothèque)
  function pdfDe(imgs, titre) {
    var enc = function (t) { var a = new Uint8Array(t.length); for (var i = 0; i < t.length; i++) a[i] = t.charCodeAt(i) & 255; return a; };
    var parts = [], off = 0, xref = [], n = imgs.length;
    function put(x) { var a = typeof x === 'string' ? enc(x) : x; parts.push(a); off += a.length; }
    function obj(k, body) { xref[k] = off; put(k + ' 0 obj\n'); body.forEach(put); put('\nendobj\n'); }
    put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    var kids = []; for (var i = 0; i < n; i++) kids.push((3 + i * 3) + ' 0 R');
    obj(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
    obj(2, ['<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>']);
    imgs.forEach(function (im, i) {
      var p = 3 + i * 3, pw = 595.28, ph = (pw * im.h / im.w).toFixed(2), cs = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im' + i + ' Do Q';
      obj(p, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pw + ' ' + ph + '] /Resources << /XObject << /Im' + i + ' ' + (p + 1) + ' 0 R >> >> /Contents ' + (p + 2) + ' 0 R >>']);
      obj(p + 1, ['<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.jpg.length + ' >>\nstream\n', im.jpg, '\nendstream']);
      obj(p + 2, ['<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream']);
    });
    var info = 3 + n * 3; obj(info, ['<< /Title (' + String(titre || 'Causerie').replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '?') + ') /Producer (Le Vestiaire - Casa Besports) >>']);
    var xo = off; put('xref\n0 ' + (info + 1) + '\n0000000000 65535 f \n'); for (var k = 1; k <= info; k++) put(('0000000000' + xref[k]).slice(-10) + ' 00000 n \n');
    put('trailer\n<< /Size ' + (info + 1) + ' /Root 1 0 R /Info ' + info + ' 0 R >>\nstartxref\n' + xo + '\n%%EOF');
    return new Blob(parts, { type: 'application/pdf' });
  }

  // ---------------------------------------------------------------- fenêtre de dialogue
  function modal(titre, body, boutons, cls) {
    fermerModal();
    var m = el('div', { class: 'cz-modal ' + (cls || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': titre });
    var box = el('div', { class: 'cz-mbox' }, el('h3', { class: 'cz-h3' }, titre), body, el('div', { class: 'cz-row cz-mfoot' }, boutons.map(function (b) { return el('button', { type: 'button', class: 'cz-btn ' + (b[2] || (b[1] ? '' : 'cz-ghost-b')), onclick: function () { fermerModal(); if (b[1]) b[1](); } }, b[0]); })));
    m.appendChild(box); m.addEventListener('click', function (e) { if (e.target === m) fermerModal(); });
    st.root.appendChild(m); var f = box.querySelector('input, select, button'); if (f) try { f.focus(); } catch (e) {}
  }
  function fermerModal() { if (!st) return; var m = st.root.querySelector('.cz-modal'); if (m) m.remove(); }

  // ---------------------------------------------------------------- styles
  function css() {
    if (document.getElementById('cz-css')) return;
    var s = document.createElement('style'); s.id = 'cz-css';
    s.textContent = [
      '#cz{--cz-rade:var(--rade,#10283a);--cz-sun:var(--sun,#f2b33d);--cz-herbe:var(--herbe,#2f6b4f);position:fixed;inset:0;z-index:9000;background:var(--bg,#f1eee7);color:var(--text,#1c1c1a);display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif;font-size:15px;line-height:1.5}',
      '#cz *{box-sizing:border-box}',
      '.cz-top{display:flex;align-items:center;gap:.8rem;background:var(--cz-rade);color:#fff;padding:calc(.6rem + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) .6rem max(16px,env(safe-area-inset-left,0px));border-bottom:3px solid var(--cz-sun)}',
      '.cz-brand{display:flex;flex-direction:column;flex:1;min-width:0}.cz-brand b{font:800 20px/1.1 "League Spartan",sans-serif;text-transform:uppercase}',
      '.cz-k{display:block;font:700 11.5px/1.2 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.1em;color:var(--cz-sun)}.cz-k-ink{color:var(--muted,#5e5b53)}',
      '.cz-x{min-height:40px;padding:.4rem .8rem;border:1.5px solid rgba(255,255,255,.6);background:transparent;color:#fff;font:800 12.5px/1 "League Spartan",sans-serif;text-transform:uppercase;cursor:pointer;border-radius:0}.cz-x:hover,.cz-x:focus-visible{background:#fff;color:var(--cz-rade)}',
      '.cz-main{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}',
      '.cz-wrap{max-width:1180px;margin:0 auto;padding:1.2rem max(16px,env(safe-area-inset-right,0px)) calc(3rem + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px))}.cz-wrap-wide{max-width:1360px}.cz-wrap-read{max-width:860px}',
      '.cz-grid{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,4fr);gap:1.2rem;align-items:start}@media(max-width:900px){.cz-grid{grid-template-columns:1fr}}',
      '.cz-side{display:flex;flex-direction:column;gap:1.2rem}',
      '.cz-box{background:var(--surface,#fff);border:1px solid var(--line,#d6d0c4);padding:1rem 1.1rem 1.1rem;min-width:0}',
      '.cz-box-h{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between;margin:0 0 .8rem}',
      '.cz-h2{font:800 clamp(1.3rem,3vw,1.7rem)/1.05 "League Spartan",sans-serif;text-transform:uppercase;margin:.1rem 0 0;color:var(--ink,#111);text-wrap:balance}',
      '.cz-h3{font:800 18px/1.1 "League Spartan",sans-serif;text-transform:uppercase;margin:.2rem 0 .5rem;color:var(--ink,#111)}',
      '.cz-h3s{font:800 15px/1.2 "League Spartan",sans-serif;text-transform:uppercase;margin:1.1rem 0 .4rem;color:var(--ink,#111)}.cz-h3s small{font:600 12.5px Inter,sans-serif;text-transform:none;color:var(--muted,#5e5b53)}',
      '.cz-ul{margin:.2rem 0 0;padding-left:1.1rem;font-size:14px}.cz-ul li{margin:.25rem 0}',
      '.cz-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;min-height:44px;padding:.55rem 1rem .45rem;border:0;background:var(--cz-sun);color:#10283a;font:800 13px/1.1 "League Spartan",sans-serif;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;border-radius:0;text-align:center}',
      '.cz-btn:hover,.cz-btn:focus-visible{background:var(--ink,#111);color:var(--bg,#fff)}.cz-btn[disabled]{opacity:.55;cursor:default}',
      '.cz-dark{background:var(--cz-rade);color:#fff}.cz-ghost,.cz-ghost-b,.cz-ghost-w{background:transparent;border:1.5px solid var(--cz-rade);color:var(--ink,#10283a)}.cz-ghost[aria-pressed=true]{background:var(--cz-rade);color:#fff}.cz-danger,.cz-danger-b{background:#b3261e;color:#fff}.cz-btn-s{min-height:36px;padding:.35rem .7rem}',
      '.cz-lnk{background:none;border:0;padding:.2rem 0;min-height:34px;color:var(--ink,#111);font:700 13px/1.2 Inter,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.cz-lnk.is-danger{color:#b3261e}.cz-lnk[disabled]{opacity:.4}',
      '.cz-row{display:flex;flex-wrap:wrap;gap:.4rem .7rem;align-items:center}.cz-center{justify-content:center}.cz-foot{margin-top:1rem}',
      '.cz-info{margin:0 0 1rem;padding:.7rem .9rem;background:var(--note-bg,#e6efe9);border-left:3px solid var(--cz-herbe);font-size:13.5px;color:var(--note-fg,inherit)}.cz-info.is-warn{border-left-color:var(--cz-sun)}',
      '.cz-vide{margin:.5rem 0;font-size:14px;color:var(--muted,#5e5b53)}.cz-aide{margin:.3rem 0 .6rem;font-size:13px;color:var(--muted,#5e5b53);line-height:1.45}.cz-pad{padding:1rem 1.3rem}',
      '.cz-card{display:grid;grid-template-columns:58px minmax(0,1fr);gap:.8rem;padding:.85rem 0;border-bottom:1px solid var(--line,#d6d0c4)}.cz-card:last-child{border-bottom:0}',
      '.cz-d{align-self:start;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:58px;background:var(--surface-2,#efebe3);border-top:3px solid var(--cz-sun);line-height:1;color:var(--ink,#111)}.cz-d i{font:normal 700 10.5px/1 "Barlow Condensed",sans-serif;letter-spacing:.1em}.cz-d b{font:800 22px/1.05 "League Spartan",sans-serif}',
      '.cz-card-b{min-width:0;display:flex;flex-direction:column;gap:.2rem}.cz-card-t{font:800 16.5px/1.2 "League Spartan",sans-serif;margin:.2rem 0 0;color:var(--ink,#111);overflow-wrap:anywhere}',
      '.cz-tag{display:inline-block;font:800 10.5px/1 "League Spartan",sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:.3rem .4rem .22rem;background:var(--surface-2,#efebe3);color:var(--ink,#111)}',
      '.cz-t-pdf{background:var(--cz-rade);color:#fff}.cz-t-modele{background:var(--cz-sun);color:#10283a}.cz-t-photo{background:var(--cz-herbe);color:#fff}.cz-t-brouillon{background:transparent;border:1px solid var(--line-2,#bdb6a7);color:var(--muted,#5e5b53)}.cz-t-prog{background:#fdf0d2;color:#6b4a00}.cz-t-ouverte{background:#dcefe3;color:#1f5c3d}.cz-t-fermee{background:var(--surface-2,#efebe3);color:var(--muted,#5e5b53)}',
      '.cz-meta{font-size:13px;color:var(--muted,#5e5b53)}.cz-lue{font-size:12.5px;font-weight:700;color:var(--success,#22704a);margin-top:.2rem}.cz-bar{height:6px;background:var(--surface-2,#efebe3);max-width:220px;margin-top:.3rem}.cz-bar span{display:block;height:100%;background:var(--cz-herbe)}',
      '.cz-steps,.cz-sub{display:flex;flex-wrap:wrap;gap:.3rem;margin:0 0 1rem}.cz-steps button,.cz-sub button{min-height:40px;padding:.45rem .7rem .38rem;border:1.5px solid var(--cz-rade);background:var(--surface,#fff);color:var(--ink,#111);font:800 12px/1.1 "League Spartan",sans-serif;text-transform:uppercase;cursor:pointer;border-radius:0}',
      '.cz-steps button[aria-selected=true],.cz-sub button[aria-selected=true]{background:var(--cz-rade);color:#fff}.cz-steps button[disabled]{opacity:.45;cursor:default}.cz-sub button{border-width:1px;background:var(--surface-2,#efebe3);border-color:transparent}',
      '.cz-save{font-size:12.5px;color:var(--muted,#5e5b53)}.cz-save.is-err{color:#b3261e;font-weight:700}',
      '.cz-choix{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem}@media(max-width:760px){.cz-choix{grid-template-columns:1fr}}',
      '.cz-opt{display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;text-align:left;padding:1rem;background:var(--surface,#fff);border:2px solid var(--line,#d6d0c4);color:var(--text,#1c1c1a);cursor:pointer;border-radius:0;font:inherit}',
      '.cz-opt b{font:800 17px/1.1 "League Spartan",sans-serif;text-transform:uppercase;color:var(--ink,#111)}.cz-opt span:last-child{font-size:13.5px;color:var(--muted,#5e5b53)}.cz-opt[aria-pressed=true]{border-color:var(--cz-rade);box-shadow:inset 0 0 0 1px var(--cz-rade)}',
      '.cz-ico{width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:var(--cz-rade);color:var(--cz-sun)}.cz-ico-modele{background:var(--cz-sun);color:#10283a}.cz-ico-photo{background:var(--cz-herbe);color:#fff}',
      '.cz-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:.8rem;margin-top:1rem;padding:1rem;background:var(--surface,#fff);border:1px solid var(--line,#d6d0c4)}.cz-form-plain{border:0;padding:0;margin:0;background:transparent}',
      '.is-wide{grid-column:1/-1}',
      '.cz-l{display:flex;flex-direction:column;gap:.3rem;font-size:13px;font-weight:700;color:var(--ink,#111);min-width:0}.cz-grow{flex:1 1 200px}',
      '.cz-in{width:100%;min-height:44px;border:1.5px solid var(--line,#d6d0c4);background:var(--surface,#fff);color:var(--text,#1c1c1a);padding:.5rem .7rem;font:500 15px/1.35 Inter,sans-serif;border-radius:0}textarea.cz-in{resize:vertical}.cz-in:focus{outline:2px solid var(--cz-sun);outline-offset:1px}.cz-in-s{width:4.5rem}',
      '.cz-check{display:flex;gap:.55rem;align-items:flex-start;font-size:13.5px;line-height:1.45;color:var(--text-2,#45433d);font-weight:500}.cz-check input{width:20px;height:20px;flex:none;margin-top:1px;accent-color:var(--cz-rade)}',
      '.cz-chips{display:flex;flex-wrap:wrap;gap:.4rem;margin:.2rem 0 .4rem}.cz-chip{min-height:40px;padding:.35rem .75rem;border:1.5px solid var(--cz-rade);background:var(--surface,#fff);color:var(--ink,#111);font:700 13px/1.2 Inter,sans-serif;cursor:pointer;border-radius:0}.cz-chip[aria-checked=true],.cz-chip[aria-pressed=true]{background:var(--cz-rade);color:#fff}',
      '.cz-pers{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.2rem .9rem;margin:.3rem 0 .6rem}',
      '.cz-p{display:flex;align-items:center;gap:.5rem;font-size:14px;padding:.4rem 0;border-bottom:1px solid var(--surface-2,#efebe3);cursor:pointer;min-height:42px}.cz-p input{width:20px;height:20px;accent-color:var(--cz-rade);flex:none}.cz-off{color:var(--muted,#5e5b53);text-decoration:line-through}',
      '.cz-rep{margin-left:auto;font:800 10px/1 "League Spartan",sans-serif;text-transform:uppercase;padding:.25rem .35rem .18rem;color:var(--muted,#5e5b53)}.cz-rep-present{background:#dcefe3;color:#1f5c3d}.cz-rep-absent{background:#f7dcda;color:#8f1d16}.cz-rep-incertain{background:#fdf0d2;color:#6b4a00}',
      '.cz-sum{display:flex;flex-wrap:wrap;gap:.6rem 1rem;align-items:center;justify-content:space-between;background:var(--cz-rade);color:#fff;padding:.8rem 1rem;margin-top:1rem}.cz-sum b{font:800 19px/1 "League Spartan",sans-serif}.cz-sum-top{margin:0 0 .8rem}.cz-sum .cz-ghost-w{color:#fff;border-color:rgba(255,255,255,.7)}',
      '.cz-schemas{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:.8rem}',
      '.cz-sch{display:flex;flex-direction:column;border:1px solid var(--line,#d6d0c4);background:var(--surface,#fff);min-width:0;text-align:left;font:inherit;color:inherit;padding:0}.cz-sch-v svg,.cz-mini-l svg,.cz-rschema svg{display:block;width:100%;height:auto}',
      '.cz-sch-b{padding:.6rem .7rem;display:flex;flex-direction:column;gap:.2rem}.cz-sch-b b{font:800 14px/1.15 "League Spartan",sans-serif;text-transform:uppercase}.cz-sch-b small{color:var(--muted,#5e5b53);font-size:12px}',
      '.cz-sch-new{padding:.8rem;gap:.6rem;justify-content:center;border-style:dashed;background:var(--surface-2,#efebe3)}.cz-sch-pick{cursor:pointer}.cz-sch-pick:hover{outline:2px solid var(--cz-sun)}',
      '.cz-mini-l{max-width:720px;margin:.4rem 0 .8rem}',
      '.cz-tir{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:.9rem}',
      '.cz-tc{background:var(--surface,#fff);border:1px solid var(--line,#d6d0c4);padding:.8rem .9rem;min-width:0}.cz-tc h4{font:800 15px/1.1 "League Spartan",sans-serif;text-transform:uppercase;margin:0 0 .15rem;display:flex;gap:.45rem;align-items:center;color:var(--ink,#111)}',
      '.cz-tc h4 em{font-style:normal;font-size:9.5px;padding:.22rem .35rem .15rem;background:var(--cz-sun);color:#10283a}.cz-tc h4 em.is-def{background:var(--cz-rade);color:#fff}',
      '.cz-ord{display:grid;grid-template-columns:minmax(90px,.9fr) minmax(0,1.2fr) minmax(0,1fr);gap:.4rem;align-items:center;padding:.3rem 0;border-bottom:1px solid var(--surface-2,#efebe3)}.cz-ord:last-child{border:0}.cz-ord-l{font-size:12.5px;font-weight:700;color:var(--muted,#5e5b53)}',
      '@media(max-width:560px){.cz-ord{grid-template-columns:1fr 1fr}.cz-ord-l{grid-column:1/-1}}',
      '.cz-ord-r{grid-template-columns:minmax(110px,.9fr) minmax(0,1.6fr)}.cz-ord-r small{grid-column:2;color:var(--muted,#5e5b53);font-size:12.5px;margin-top:-.2rem}.cz-ord-r b{font-weight:700}',
      '.cz-drop{display:block;border:2px dashed var(--line-2,#bdb6a7);background:var(--surface-2,#efebe3);padding:1.2rem;text-align:center;cursor:pointer;margin:.6rem 0 .3rem}.cz-drop.is-on{border-color:var(--cz-sun)}.cz-drop b{color:var(--ink,#111)}',
      '.cz-hide{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}',
      '.cz-file{display:flex;flex-wrap:wrap;gap:.5rem .8rem;align-items:center;padding:.5rem 0}',
      '.cz-camzone{background:#1b1d20;padding:1.2rem 1rem;color:#fff}.cz-aide-w{color:#c9ccd1;text-align:center}.cz-camzone .cz-ghost-w{color:#fff;border-color:rgba(255,255,255,.7)}',
      '.cz-photos{display:flex;flex-direction:column;gap:.8rem;margin-top:1rem}.cz-ph{display:grid;grid-template-columns:minmax(0,220px) minmax(0,1fr);gap:.9rem;border:1px solid var(--line,#d6d0c4);padding:.6rem;background:var(--surface,#fff)}@media(max-width:560px){.cz-ph{grid-template-columns:1fr}}',
      '.cz-ph-img{width:100%;height:auto;display:block;background:var(--surface-2,#efebe3);min-height:80px}.cz-ph-b{display:flex;flex-direction:column;gap:.5rem;min-width:0}',
      '.cz-phed{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:1rem}@media(max-width:760px){.cz-phed{grid-template-columns:1fr}}.cz-phed-v{background:#1b1d20;padding:.5rem}.cz-crop{display:block;width:100%;height:auto;max-height:62vh;object-fit:contain}.cz-phed-o{display:flex;flex-direction:column;gap:.7rem}',
      '.cz-pdfv{background:#2a2c30;padding:.6rem;color:#fff}.cz-pdfv .cz-vide{color:#cfd3d8}.cz-vbar{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;justify-content:center;margin-bottom:.6rem;font:800 13px/1 "League Spartan",sans-serif}',
      '.cz-vb{min-height:40px;min-width:44px;padding:.4rem .7rem;border:1px solid rgba(255,255,255,.45);background:transparent;color:#fff;font:800 14px/1 "League Spartan",sans-serif;cursor:pointer;border-radius:0}.cz-vb:hover,.cz-vb:focus-visible{background:#fff;color:#10283a}',
      '.cz-pages{max-height:78vh;overflow:auto;display:flex;flex-direction:column;align-items:center;gap:.8rem;-webkit-overflow-scrolling:touch}.cz-page{display:block;max-width:100%;height:auto;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.4)}',
      '.cz-fs{position:fixed!important;inset:0;z-index:9500;overflow:auto}.cz-fs .cz-pages,.cz-pdfv:fullscreen .cz-pages{max-height:none;height:calc(100vh - 70px)}',
      '.cz-read{background:var(--surface,#fff);border:1px solid var(--line,#d6d0c4)}.cz-rh{background:var(--cz-rade);color:#fff;padding:1.1rem 1.2rem;border-bottom:5px solid var(--cz-sun)}.cz-rh h2{font:900 clamp(1.4rem,4vw,2rem)/1.05 "League Spartan",sans-serif;text-transform:uppercase;margin:.3rem 0 .3rem;text-wrap:balance}.cz-rh small{color:rgba(255,255,255,.82);font-size:13px}',
      '.cz-rs{padding:.9rem 1.2rem;border-bottom:1px solid var(--line,#d6d0c4)}.cz-rs h3{font:800 13.5px/1.1 "League Spartan",sans-serif;text-transform:uppercase;margin:0 0 .5rem;color:var(--ink,#10283a);display:flex;gap:.45rem;align-items:center}.cz-rs h3:before{content:"";width:10px;height:10px;background:var(--cz-sun);flex:none}',
      '.cz-rs p{margin:.2rem 0;font-size:15px;white-space:pre-wrap}.cz-rs ol{margin:0;padding-left:1.2rem;font-size:15px}.cz-rs-staff{background:#fff7e4;color:#3a2a00}.cz-rs-staff h3{color:#6b4a00}',
      '.cz-rschema{margin:.2rem 0 .5rem;border:1px solid var(--line,#d6d0c4)}',
      '.cz-rphotos{display:flex;flex-direction:column;gap:.7rem;margin-top:.4rem}.cz-rphotos figure{margin:0}.cz-rphotos img{display:block;width:100%;height:auto;background:var(--surface-2,#efebe3);min-height:60px}.cz-rphotos figcaption{font-size:13px;color:var(--muted,#5e5b53);margin-top:.3rem}',
      '.cz-h4{font:800 14px/1.1 "League Spartan",sans-serif;text-transform:uppercase;margin:1.2rem 0 .4rem;color:var(--ink,#10283a)}',
      '.cz-xi{list-style:none;margin:.3rem 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:0 1rem}.cz-xi li{display:flex;align-items:center;gap:.55rem;min-height:40px;border-bottom:1px solid var(--surface-2,#efebe3);font-size:15px;font-weight:600}',
      '.cz-num{flex:none;min-width:2.1rem;text-align:center;padding:.3rem .25rem .2rem;background:var(--cz-rade);color:#fff;font:800 14px/1 "League Spartan",sans-serif}.cz-xi-rem .cz-num{background:var(--surface-2,#efebe3);color:var(--ink,#10283a)}',
      '.cz-gk{font-style:normal;font:700 10.5px/1 "Barlow Condensed",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#5e5b53)}',
      '.cz-cap{flex:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:var(--cz-sun);color:#10283a;border:2px solid #10283a;font:900 12px/1 "League Spartan",sans-serif;font-style:normal}',
      '.cz-feuille{display:grid;gap:1rem;margin-top:.8rem}.cz-feuille .cz-k{margin-bottom:.2rem}',
      '.cz-remps{display:flex;flex-direction:column;gap:.45rem}.cz-remp{display:grid;grid-template-columns:4.5rem minmax(0,1fr) auto auto;gap:.45rem;align-items:center}',
      '.cz-rq{padding:1rem 1.2rem;background:var(--surface-2,#efebe3);border-left:5px solid var(--cz-sun);font:800 18px/1.2 "League Spartan",sans-serif;text-transform:uppercase;color:var(--ink,#10283a)}',
      '.cz-rf{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:space-between;padding:.6rem 1.2rem;font:700 10.5px/1.2 "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#5e5b53)}',
      '.cz-vu{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:.6rem;align-items:center;justify-content:space-between;background:var(--cz-rade);color:#fff;padding:.8rem 1rem calc(.8rem + env(safe-area-inset-bottom,0px));margin-top:1rem}.cz-vu .cz-ghost-w{color:#fff;border-color:rgba(255,255,255,.7)}',
      '.cz-apercu{border:2px dashed var(--line-2,#bdb6a7);padding:.6rem}',
      '.cz-modal{position:fixed;inset:0;z-index:9600;background:rgba(10,20,30,.6);display:flex;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top,0px)) 16px}',
      '.cz-mbox{background:var(--surface,#fff);color:var(--text,#1c1c1a);max-width:560px;width:100%;max-height:90vh;overflow:auto;padding:1.1rem 1.2rem;border-top:4px solid var(--cz-sun)}.cz-modal-wide .cz-mbox{max-width:1000px}.cz-mfoot{justify-content:flex-end;margin-top:1rem}',
      /* tableau */
      '.cz-board{display:grid;grid-template-columns:72px minmax(0,1fr);border:1px solid var(--line,#d6d0c4);background:var(--surface,#fff)}@media(max-width:900px){.cz-board{grid-template-columns:1fr}}',
      '.cz-tools{background:var(--cz-rade);display:flex;flex-direction:column;gap:2px;padding:5px}@media(max-width:900px){.cz-tools{flex-direction:row;flex-wrap:wrap}}',
      '.cz-tool{width:62px;min-height:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border:0;background:transparent;color:#cfd8df;font:700 9px/1 "Barlow Condensed",sans-serif;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;border-radius:0}',
      '@media(max-width:900px){.cz-tool{width:calc((100% - 26px)/7);min-width:44px}}.cz-tool[aria-pressed=true]{background:var(--cz-sun);color:#10283a}.cz-tool:focus-visible{outline:2px solid #fff}.cz-tool[disabled]{opacity:.4}',
      '.cz-bmain{padding:.7rem;display:flex;flex-direction:column;gap:.6rem;min-width:0}.cz-bhead{display:flex;flex-direction:column;gap:.5rem}.cz-brow{display:flex;flex-wrap:wrap;gap:.5rem .8rem;align-items:flex-end;justify-content:space-between}',
      '.cz-seg{display:inline-flex;flex-wrap:wrap;border:1.5px solid var(--cz-rade)}.cz-seg button{min-height:36px;padding:.35rem .6rem .28rem;border:0;background:var(--surface,#fff);color:var(--ink,#111);font:800 11px/1 "League Spartan",sans-serif;text-transform:uppercase;cursor:pointer;border-radius:0}.cz-seg button[aria-pressed=true]{background:var(--cz-rade);color:#fff}',
      '.cz-stage{background:#1e3d2e;user-select:none;-webkit-user-select:none}.cz-stage svg{display:block;width:100%;height:auto;max-height:70vh}',
      '.cz-leg{display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-size:12px;color:var(--muted,#5e5b53);align-items:center}.cz-leg i{display:inline-block;width:24px;border-top:3px solid #888;vertical-align:middle;margin-right:4px}.cz-lg-p{border-top-style:dashed!important;border-color:var(--cz-sun)!important}.cz-lg-t{border-top-width:6px!important;border-color:var(--cz-sun)!important}.cz-lg-r{border-color:#ff8a7a!important}',
      '.cz-dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:#fff;border:2px solid #10283a;vertical-align:middle;margin:0 3px}.cz-dot-a{background:#c0281e;border-color:#fff}',
      '.cz-selp{min-height:44px}.cz-selrow{display:flex;flex-wrap:wrap;gap:.5rem;align-items:flex-end}'
    ].join('\n');
    document.head.appendChild(s);
  }

  return { open: open, fermer: fermer, _st: function () { return st; }, _pdf: pdfDe, _autorise: autorise };
})();
