/*!
 * Casa Besports — Le Vestiaire : l'espace commun d'un club et de ses joueurs.
 *  - Planning des entraînements et des matchs (public), géré par le club
 *  - Annonce de présence (Présent / Absent / Peut-être) par les joueurs, ou par les parents pour les jeunes
 *  - Fil du club, public, séparé par section : tout le club, seniors, jeunes
 * Données chez Supabase (supabase/vestiaire.sql) : les droits sont vérifiés côté serveur.
 * Protection des jeunes : prénom + initiale seulement, noms et présences visibles du club et du parent uniquement.
 * Branché dans js/app.js (CasaVestiaire.vals) et index.html (page #/vestiaire et bloc de l'accueil).
 */
var CasaVestiaire = (function () {
  'use strict';
  var JOURS = ['DIM.', 'LUN.', 'MAR.', 'MER.', 'JEU.', 'VEN.', 'SAM.'];
  var JOURS_L = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MOIS = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];
  var TYPES = { entrainement: 'Entraînement', match: 'Match', autre: 'Rendez-vous' };
  var SECTIONS = { club: 'Tout le club', seniors: 'Seniors', jeunes: 'Jeunes' };
  var REPS = [['present', 'Présent'], ['incertain', 'Peut-être'], ['absent', 'Absent']];
  var QUAL = { joueur: 'Joueur ou joueuse', parent: 'Parent d’un jeune', encadrant: 'Encadrant (coach, dirigeant)' };

  // ---------- données (cache du module) ----------
  var D = { user: null, mine: null, clubs: {}, home: null, sqlMissing: false, err: '' };
  var busy = {};
  function C() { return window.CasaAuth && window.CasaAuth.on ? window.CasaAuth : null; }
  function uid() { var A = C(); return A && A.user ? A.user.id : null; }
  function missing(e) { return /does not exist|schema cache|PGRST20|42P01|42883|Could not find/i.test(String(e && e.message || e)); }
  function fail(app, e) { if (missing(e)) D.sqlMissing = true; else D.err = String(e && e.message || e || 'Erreur'); tick(app); }
  function tick(app) { app.setState({ vsTick: Date.now() }); }
  function db(fn) { return C().db(fn); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function hhmm(d) { return pad(d.getHours()) + ' h ' + pad(d.getMinutes()); }
  function ilya(iso) {
    var d = new Date(iso), s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return 'à l’instant'; if (s < 3600) return 'il y a ' + Math.floor(s / 60) + ' min';
    if (s < 86400) return 'il y a ' + Math.floor(s / 3600) + ' h';
    if (s < 6 * 86400) return JOURS_L[d.getDay()] + ' ' + hhmm(d);
    return d.getDate() + ' ' + MOIS[d.getMonth()].toLowerCase() + ' · ' + hhmm(d);
  }
  function quandLong(d) { var a = new Date(); a.setHours(0, 0, 0, 0); var j = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - a) / 86400000);
    return (j === 0 ? 'Aujourd’hui' : j === 1 ? 'Demain' : JOURS_L[d.getDay()].charAt(0).toUpperCase() + JOURS_L[d.getDay()].slice(1) + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()].toLowerCase()) + ' · ' + hhmm(d); }
  function clubsList() { return (Array.isArray(window.CASA_CLUBS) ? window.CASA_CLUBS : []).filter(function (c) { return c && c.id && c.name; }); }
  function clubOf(id) { return clubsList().find(function (c) { return c.id === id; }) || null; }
  function initiales(n) { return String(n || '').split(/[\s’'-]+/).filter(Boolean).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
  // Section jeunes : prénom + initiale du nom, rien d'autre
  function nomCourt(prenom, nom) {
    var p = String(prenom || '').trim().replace(/\s+/g, ' ').slice(0, 30); var i = String(nom || '').trim().charAt(0).toUpperCase();
    return p ? (p.charAt(0).toUpperCase() + p.slice(1)) + (i ? ' ' + i + '.' : '') : '';
  }

  // ---------- chargements ----------
  function resetIfUserChanged() { var u = uid(); if (u !== D.user) { D.user = u; D.mine = null; D.clubs = {}; D.home = null; } }
  function loadMine(app) {
    if (!uid() || busy.mine) return; busy.mine = 1;
    db(function (c) { return c.from('vestiaire_membres').select('*').eq('user_id', uid()).order('cree_le'); })
      .then(function (r) { D.mine = r || []; }, function (e) { D.mine = []; fail(app, e); })
      .then(function () { busy.mine = 0; tick(app); });
  }
  function loadClub(app, club, force) {
    if (!club || busy['c' + club] || (!force && D.clubs[club])) return; busy['c' + club] = 1;
    var since = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    var cd = D.clubs[club] || { events: [], posts: [], comptes: {}, presences: [], membres: [], staff: false };
    var A = C(); if (!A) { busy['c' + club] = 0; return; }
    var u = uid(); // si la personne connectée change pendant le chargement, le résultat est ignoré et relu
    var evs = db(function (c) { return c.from('vestiaire_evenements').select('*').eq('club', club).gte('debut', since).order('debut').limit(60); });
    var fil = db(function (c) { return c.from('vestiaire_fil').select('*').eq('club', club).order('epingle', { ascending: false }).order('cree_le', { ascending: false }).limit(60); });
    var staff = uid() ? db(function (c) { return c.rpc('vs_staff', { c: club }); }).catch(function () { return false; }) : Promise.resolve(false);
    Promise.all([evs, fil, staff]).then(function (r) {
      cd = { events: r[0] || [], posts: r[1] || [], staff: r[2] === true, comptes: {}, presences: [], membres: [] };
      var ids = cd.events.map(function (e) { return e.id; });
      var jobs = [];
      if (ids.length) jobs.push(db(function (c) { return c.rpc('vs_comptes', { ids: ids }); }).then(function (rows) { (rows || []).forEach(function (x) { cd.comptes[x.evenement_id] = x; }); }, function () {}));
      if (uid() && ids.length) jobs.push(db(function (c) { return c.from('vestiaire_presences').select('evenement_id, membre_id, reponse, vestiaire_membres(nom, section)').in('evenement_id', ids); }).then(function (rows) { cd.presences = rows || []; }, function () {}));
      if (uid() && ids.length) jobs.push(resume(ids).then(function (m) { cd.covoit = m; }));
      if (uid() && cd.staff) jobs.push(db(function (c) { return c.from('vestiaire_membres').select('*').eq('club', club).order('cree_le'); }).then(function (rows) { cd.membres = rows || []; }, function () {}));
      return Promise.all(jobs);
    }).then(function () { if (D.user === u) { D.clubs[club] = cd; D.sqlMissing = false; } }, function (e) { if (D.user === u) { D.clubs[club] = cd; fail(app, e); } })
      .then(function () { busy['c' + club] = 0; tick(app); });
  }
  // Accueil : les clubs de l'abonné (s'il est membre), sinon les dernières nouvelles de tous les vestiaires
  function loadHome(app, clubs) {
    if (busy.home || (D.home && Date.now() - D.home.at < 120000 && D.home.key === clubs.join(','))) return; busy.home = 1;
    var since = new Date(Date.now() - 2 * 3600 * 1000).toISOString(), u = uid();
    var evs = db(function (c) { var q = c.from('vestiaire_evenements').select('*').gte('debut', since).eq('annule', false).order('debut').limit(clubs.length ? 8 : 4); return clubs.length ? q.in('club', clubs) : q; });
    var fil = db(function (c) { var q = c.from('vestiaire_fil').select('*').order('cree_le', { ascending: false }).limit(3); return clubs.length ? q.in('club', clubs) : q; });
    Promise.all([evs, fil]).then(function (r) {
      var h = { at: Date.now(), key: clubs.join(','), events: r[0] || [], posts: r[1] || [], comptes: {}, presences: [] };
      var ids = h.events.map(function (e) { return e.id; }); var jobs = [];
      if (ids.length) jobs.push(db(function (c) { return c.rpc('vs_comptes', { ids: ids }); }).then(function (rows) { (rows || []).forEach(function (x) { h.comptes[x.evenement_id] = x; }); }, function () {}));
      if (ids.length && clubs.length) jobs.push(resume(ids).then(function (m) { h.covoit = m; }));
      if (ids.length && clubs.length) jobs.push(db(function (c) { return c.from('vestiaire_presences').select('evenement_id, membre_id, reponse').in('evenement_id', ids); }).then(function (rows) { h.presences = rows || []; }, function () {}));
      return Promise.all(jobs).then(function () { if (D.user === u) { D.home = h; D.sqlMissing = false; } });
    }).catch(function (e) { D.home = { at: Date.now(), key: clubs.join(','), events: [], posts: [], comptes: {}, presences: [] }; fail(app, e); })
      .then(function () { busy.home = 0; tick(app); });
  }
  function refresh(app, club) { if (club) loadClub(app, club, true); D.home = null; tick(app); }

  // ---------- actions ----------
  function repondre(app, ev, m, rep) {
    var cur = presenceOf(ev.id, m.id);
    var p = cur === rep
      ? db(function (c) { return c.from('vestiaire_presences').delete().eq('evenement_id', ev.id).eq('membre_id', m.id); })
      : db(function (c) { return c.from('vestiaire_presences').upsert({ evenement_id: ev.id, membre_id: m.id, reponse: rep }, { onConflict: 'evenement_id,membre_id' }); });
    // Réponse affichée tout de suite, puis relue
    [D.clubs[ev.club], D.home].forEach(function (cd) {
      if (!cd) return; cd.presences = (cd.presences || []).filter(function (x) { return !(x.evenement_id === ev.id && x.membre_id === m.id); });
      if (cur !== rep) cd.presences.push({ evenement_id: ev.id, membre_id: m.id, reponse: rep, vestiaire_membres: { nom: m.nom, section: m.section } });
    });
    tick(app);
    p.then(function () { app.say(cur === rep ? 'Réponse retirée.' : 'C’est noté : ' + REPS.find(function (r) { return r[0] === rep; })[1].toLowerCase() + (m.qualite === 'parent' ? ' pour ' + m.nom : '') + '.'); refresh(app, ev.club); },
      function (e) { app.say('Réponse non enregistrée : ' + e.message); refresh(app, ev.club); });
  }
  function presenceOf(eid, mid) {
    var all = [];
    Object.keys(D.clubs).forEach(function (k) { all = all.concat(D.clubs[k].presences || []); });
    if (D.home) all = all.concat(D.home.presences || []);
    var p = all.find(function (x) { return x.evenement_id === eid && x.membre_id === mid; });
    return p ? p.reponse : null;
  }
  // Mes inscriptions validées qui peuvent répondre à cet événement
  function repondants(ev) {
    return (D.mine || []).filter(function (m) { return m.statut === 'valide' && m.club === ev.club && (ev.section === 'club' || ev.section === m.section) && m.qualite !== 'encadrant' && (!ev.equipe || !m.equipe || ev.equipe.toLowerCase() === m.equipe.toLowerCase()); });
  }

  // ---------- vues ----------
  function ui(app) { return app.state.vs || {}; }
  function set(app, patch) { app.setState({ vs: Object.assign({}, ui(app), patch) }); }
  function setForm(app, k, patch) { var o = {}; o[k] = Object.assign({}, ui(app)[k] || {}, patch); set(app, o); }
  function val(e) { return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; }
  function onF(app, k, f) { return function (e) { var o = {}; o[f] = val(e); setForm(app, k, o); }; }
  function opts(map) { return Object.keys(map).map(function (k) { return { v: k, l: map[k] }; }); }

  function eventVals(app, ev, cd, mode) {
    var d = new Date(ev.debut), f = ev.fin ? new Date(ev.fin) : null, U = ui(app);
    var cpt = (cd.comptes || {})[ev.id] || null;
    var nP = cpt ? cpt.presents : 0, nA = cpt ? cpt.absents : 0, nI = cpt ? cpt.incertains : 0;
    var bits = []; if (nP) bits.push(nP + (nP > 1 ? ' présents' : ' présent')); if (nI) bits.push(nI + ' peut-être'); if (nA) bits.push(nA + (nA > 1 ? ' absents' : ' absent'));
    var club = clubOf(ev.club);
    var titre = ev.titre || (ev.type === 'match' ? (ev.adversaire ? (ev.domicile === false ? 'Déplacement à ' : 'Contre ') + ev.adversaire : 'Match') : TYPES[ev.type] || 'Rendez-vous');
    var reps = repondants(ev).map(function (m) {
      var cur = presenceOf(ev.id, m.id);
      return { nom: m.qualite === 'parent' ? 'Pour ' + m.nom : 'Ma réponse', boutons: REPS.map(function (r) { return { label: r[1], pressed: cur === r[0] ? 'true' : 'false', cls: 'vs-r-' + r[0] + (cur === r[0] ? ' is-on' : ''), pick: function () { repondre(app, ev, m, r[0]); } }; }) };
    });
    var open = U.evOpen === ev.id;
    var liste = [];
    if (open) {
      var pres = (cd.presences || []).filter(function (p) { return p.evenement_id === ev.id; });
      liste = REPS.map(function (r) { var noms = pres.filter(function (p) { return p.reponse === r[0]; }).map(function (p) { return (p.vestiaire_membres || {}).nom || 'Membre'; }).sort(); return { label: r[1], n: String(noms.length), noms: noms.join(', ') || '—', cls: 'vs-r-' + r[0] }; });
      if (cd.staff) {
        var deja = {}; pres.forEach(function (p) { deja[p.membre_id] = 1; });
        var sans = (cd.membres || []).filter(function (m) { return m.statut === 'valide' && m.qualite !== 'encadrant' && (ev.section === 'club' || ev.section === m.section) && !deja[m.id]; }).map(function (m) { return m.nom; }).sort();
        liste.push({ label: 'Sans réponse', n: String(sans.length), noms: sans.join(', ') || '—', cls: 'vs-r-sans' });
      }
    }
    var canSee = cd.staff || (ev.section !== 'jeunes' && (D.mine || []).some(function (m) { return m.statut === 'valide' && m.club === ev.club && m.section === 'seniors'; })); // les présences des jeunes : le club seulement
    return {
      id: ev.id, jour: JOURS[d.getDay()], num: String(d.getDate()), mois: MOIS[d.getMonth()], heure: hhmm(d) + (f ? ' – ' + hhmm(f) : ''), quand: quandLong(d),
      type: TYPES[ev.type] || 'Rendez-vous', typeCls: 'vs-t-' + ev.type, titre: titre, lieu: ev.lieu || '', hasLieu: !!ev.lieu,
      section: SECTIONS[ev.section] + (ev.equipe ? ' · ' + ev.equipe : ''), note: ev.note || '', hasNote: !!ev.note,
      annule: !!ev.annule, actif: !ev.annule, cls: ev.annule ? 'is-annule' : '',
      club: club ? club.name : '', hasClub: mode === 'home' && !!club, openClub: function () { app.go('vestiaire', { vsClub: ev.club }); },
      comptes: bits.join(' · '), hasComptes: bits.length > 0 && !ev.annule,
      reps: ev.annule ? [] : reps, canAnswer: !ev.annule && reps.length > 0,
      // Covoiturage : visible des familles concernées et du club, si supabase/vestiaire-covoiturage.sql est lancé
      hasCovoit: !ev.annule && !!uid() && !!(cd.covoit || {})[ev.id] && (mode !== 'home' || ev.type === 'match' || (cd.covoit[ev.id].voitures + cd.covoit[ev.id].besoins) > 0), covoitLabel: covoitLabel((cd.covoit || {})[ev.id]),
      covoitOpen: mode !== 'home' && U.cvOpen === ev.id, covoitPressed: U.cvOpen === ev.id ? 'true' : 'false',
      toggleCovoit: function () { if (mode === 'home') { app.go('vestiaire', { vsClub: ev.club, vs: Object.assign({}, ui(app), { cvOpen: ev.id }) }); return; } set(app, { cvOpen: U.cvOpen === ev.id ? null : ev.id }); },
      cv: mode !== 'home' && U.cvOpen === ev.id ? covoitVals(app, ev, cd) : { ready: false, loading: false },
      canList: mode !== 'home' && canSee && !!uid(), listOpen: open, liste: liste, listLabel: open ? 'Masquer les réponses' : 'Qui vient ?',
      toggleList: function () { set(app, { evOpen: open ? null : ev.id }); },
      isStaff: mode !== 'home' && !!cd.staff,
      edit: function () { var dd = new Date(ev.debut); set(app, { evForm: { open: true, id: ev.id, type: ev.type, section: ev.section, equipe: ev.equipe || '', titre: ev.titre || '', date: dd.getFullYear() + '-' + pad(dd.getMonth() + 1) + '-' + pad(dd.getDate()), heure: pad(dd.getHours()) + ':' + pad(dd.getMinutes()), duree: ev.fin ? String(Math.round((new Date(ev.fin) - dd) / 60000)) : '', lieu: ev.lieu || '', adversaire: ev.adversaire || '', domicile: ev.domicile === false ? 'ext' : 'dom', note: ev.note || '', repeter: '1' } }); try { var el = document.getElementById('vs-ev-form'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} },
      annuler: function () { db(function (c) { return c.from('vestiaire_evenements').update({ annule: !ev.annule }).eq('id', ev.id); }).then(function () { app.say(ev.annule ? 'Événement rétabli.' : 'Événement annulé : il reste affiché, barré.'); refresh(app, ev.club); }, function (e) { app.say(e.message); }); },
      annulerLabel: ev.annule ? 'Rétablir' : 'Annuler',
      suppr: function () { if (!window.confirm('Supprimer définitivement « ' + titre + ' » du planning ?')) return; db(function (c) { return c.from('vestiaire_evenements').delete().eq('id', ev.id); }).then(function () { app.say('Supprimé du planning.'); refresh(app, ev.club); }, function (e) { app.say(e.message); }); }
    };
  }

  // ---------- Covoiturage et messages du déplacement (supabase/vestiaire-covoiturage.sql) ----------
  // Privé : réservé au club et aux familles de la section concernée. Les enfants ne sont nommés que pour leur parent,
  // le conducteur qui les emmène et le club.
  var SENS = { aller_retour: 'Aller et retour', aller: 'Aller seulement', retour: 'Retour seulement' };
  D.cv = {}; D.cvMissing = false;
  function resume(ids) {
    return db(function (c) { return c.rpc('vs_covoit_resume', { ids: ids }); }).then(function (rows) {
      var m = {}; (rows || []).forEach(function (x) { m[x.evenement_id] = x; }); D.cvMissing = false; return m;
    }, function (e) { if (missing(e)) D.cvMissing = true; return {}; });
  }
  function loadCovoit(app, eid) {
    if (busy['cv' + eid]) return; busy['cv' + eid] = 1;
    Promise.all([
      db(function (c) { return c.from('vestiaire_trajets').select('*').eq('evenement_id', eid).order('cree_le'); }),
      db(function (c) { return c.rpc('vs_places_prises', { eid: eid }); }),
      db(function (c) { return c.from('vestiaire_passagers').select('trajet_id, membre_id, user_id, nom'); }),
      db(function (c) { return c.from('vestiaire_besoins').select('*').eq('evenement_id', eid); }),
      db(function (c) { return c.from('vestiaire_messages').select('*').eq('evenement_id', eid).order('cree_le').limit(200); })
    ]).then(function (r) {
      var prises = {}; (r[1] || []).forEach(function (x) { prises[x.trajet_id] = x.prises; });
      var tids = (r[0] || []).map(function (t) { return t.id; });
      D.cv[eid] = { at: Date.now(), trajets: r[0] || [], prises: prises, passagers: (r[2] || []).filter(function (p) { return tids.indexOf(p.trajet_id) >= 0; }), besoins: r[3] || [], messages: r[4] || [] };
    }, function (e) { D.cv[eid] = { at: Date.now(), trajets: [], prises: {}, passagers: [], besoins: [], messages: [], err: e.message }; })
      .then(function () { busy['cv' + eid] = 0; tick(app); });
  }
  function cvAct(app, ev, p, msg) {
    return p.then(function () { if (msg) app.say(msg); delete D.cv[ev.id]; loadCovoit(app, ev.id); if (D.clubs[ev.club]) loadClub(app, ev.club, true); D.home = null; },
      function (e) { app.say(e.message); });
  }
  function covoitLabel(r) {
    if (!r) return 'Covoiturage';
    var libres = Math.max(0, r.places - r.prises), bits = [];
    if (r.voitures) bits.push(libres ? libres + (libres > 1 ? ' places libres' : ' place libre') : 'voitures complètes');
    if (r.besoins) bits.push(r.besoins + ' cherche' + (r.besoins > 1 ? 'nt' : '') + ' une place');
    if (!r.voitures && !r.besoins) bits.push('proposer ou chercher une place');
    if (r.messages) bits.push(r.messages + ' message' + (r.messages > 1 ? 's' : ''));
    return 'Covoiturage · ' + bits.join(' · ');
  }
  function covoitVals(app, ev, cd) {
    var U = ui(app), x = D.cv[ev.id], me = uid();
    if (!x) { loadCovoit(app, ev.id); return { loading: true, ready: false }; }
    var miens = repondants(ev);
    var placeDe = function (mid) { var p = x.passagers.find(function (q) { return q.membre_id === mid; }); return p ? p.trajet_id : null; };
    var cherche = function (mid) { return x.besoins.some(function (b) { return b.membre_id === mid; }); };
    var pourQui = function (m) { return m.qualite === 'parent' ? m.nom : 'moi'; };
    var voitures = x.trajets.map(function (t) {
      var pris = x.prises[t.id] || 0, libres = Math.max(0, t.places - pris), mine = t.user_id === me;
      var noms = x.passagers.filter(function (p) { return p.trajet_id === t.id; }).map(function (p) { return p.nom || 'Passager'; });
      var actions = [];
      miens.forEach(function (m) {
        var ici = placeDe(m.id);
        if (ici === t.id) actions.push({ label: 'Annuler la place (' + pourQui(m) + ')', cls: 'btn-ghost', go: function () { cvAct(app, ev, db(function (c) { return c.from('vestiaire_passagers').delete().eq('trajet_id', t.id).eq('membre_id', m.id); }), 'Place annulée.'); } });
        else if (!ici && libres > 0 && !mine) actions.push({ label: 'Réserver une place (' + pourQui(m) + ')', cls: 'btn-gold', go: function () { cvAct(app, ev, db(function (c) { return c.from('vestiaire_passagers').insert({ trajet_id: t.id, membre_id: m.id }); }), 'Place réservée avec ' + String(t.conducteur || '').split(' · ')[0] + '.'); } });
      });
      return {
        conducteur: t.conducteur || 'Un parent', sens: SENS[t.sens] || '', rdv: [t.rdv_lieu, t.rdv_heure ? t.rdv_heure.replace(/^0/, '').replace(':', ' h ') : ''].filter(Boolean).join(' · '), hasRdv: !!(t.rdv_lieu || t.rdv_heure),
        places: libres ? libres + ' sur ' + t.places + (libres > 1 ? ' places libres' : ' place libre') : 'Complet (' + t.places + ' places)', complet: !libres, cls: libres ? '' : 'is-full',
        tel: t.telephone || '', hasTel: !!t.telephone, telHref: 'tel:' + String(t.telephone || '').replace(/[^+0-9]/g, ''), note: t.note || '', hasNote: !!t.note,
        noms: noms.join(', '), hasNoms: noms.length > 0, mine: mine, actions: actions, hasActions: actions.length > 0,
        canDel: mine || !!cd.staff, del: function () { if (!window.confirm('Retirer cette voiture ? Les familles inscrites devront trouver une autre place.')) return; cvAct(app, ev, db(function (c) { return c.from('vestiaire_trajets').delete().eq('id', t.id); }), 'Voiture retirée.'); }
      };
    });
    var besoinsMiens = miens.filter(function (m) { return !placeDe(m.id); }).map(function (m) {
      var deja = cherche(m.id);
      return { label: deja ? 'Je ne cherche plus de place (' + pourQui(m) + ')' : 'Je cherche une place (' + pourQui(m) + ')', cls: deja ? 'btn-ghost' : 'btn-dark',
        go: function () { cvAct(app, ev, deja ? db(function (c) { return c.from('vestiaire_besoins').delete().eq('evenement_id', ev.id).eq('membre_id', m.id); }) : db(function (c) { return c.from('vestiaire_besoins').insert({ evenement_id: ev.id, membre_id: m.id }); }), deja ? 'Demande retirée.' : 'C’est noté : les familles du déplacement voient qu’une place est cherchée.'); } };
    });
    var r = (cd.covoit || {})[ev.id] || {};
    var nB = r.besoins || x.besoins.length;
    var f = U.cvForm && U.cvForm.eid === ev.id ? U.cvForm : { eid: ev.id };
    var on = function (k) { return function (e) { var o = Object.assign({}, f); o[k] = val(e); set(app, { cvForm: o }); }; };
    var m = U.cvMsg && U.cvMsg.eid === ev.id ? U.cvMsg : { eid: ev.id };
    return {
      ready: true, loading: false, err: x.err || '', hasErr: !!x.err,
      voitures: voitures, hasVoitures: voitures.length > 0, noVoitures: !voitures.length,
      besoins: nB ? nB + (nB > 1 ? ' personnes cherchent une place' : ' personne cherche une place') : '', hasBesoins: nB > 0,
      besoinsNoms: cd.staff ? x.besoins.map(function (b) { var mm = (cd.membres || []).find(function (k) { return k.id === b.membre_id; }); return mm ? mm.nom : ''; }).filter(Boolean).join(', ') : '',
      besoinsMiens: besoinsMiens, hasBesoinsMiens: besoinsMiens.length > 0,
      offre: {
        open: !!f.open, closed: !f.open, toggle: function () { set(app, { cvForm: f.open ? { eid: ev.id } : { eid: ev.id, open: true, places: '3', sens: 'aller_retour' } }); },
        places: f.places || '3', onPlaces: on('places'), placesOpts: [1, 2, 3, 4, 5, 6, 7].map(function (k) { return { v: String(k), l: k + (k > 1 ? ' places' : ' place') }; }),
        sens: f.sens || 'aller_retour', onSens: on('sens'), sensOpts: opts(SENS),
        lieu: f.lieu || '', onLieu: on('lieu'), heure: f.heure || '', onHeure: on('heure'), note: f.note || '', onNote: on('note'),
        partageTel: !!f.partageTel, onPartageTel: on('partageTel'), tel: f.tel || '', onTel: on('tel'),
        err: f.err || '', hasErr: !!f.err, busy: !!f.busy, label: f.busy ? 'Envoi…' : 'Proposer ma voiture',
        send: function () {
          var tel = f.partageTel ? String(f.tel || '').trim() : '';
          if (f.partageTel && !/^\+?[0-9 .]{8,20}$/.test(tel)) return set(app, { cvForm: Object.assign({}, f, { err: 'Numéro de téléphone invalide.' }) });
          set(app, { cvForm: Object.assign({}, f, { busy: true, err: '' }) });
          db(function (c) { return c.from('vestiaire_trajets').insert({ evenement_id: ev.id, places: parseInt(f.places, 10) || 3, sens: f.sens || 'aller_retour', rdv_lieu: String(f.lieu || '').trim().slice(0, 120) || null, rdv_heure: /^\d\d:\d\d$/.test(f.heure || '') ? f.heure : null, telephone: tel || null, note: String(f.note || '').trim().slice(0, 200) || null }); })
            .then(function () { set(app, { cvForm: { eid: ev.id } }); app.say('Merci ! Votre voiture est proposée aux familles du déplacement.'); delete D.cv[ev.id]; loadCovoit(app, ev.id); if (D.clubs[ev.club]) loadClub(app, ev.club, true); },
              function (e) { set(app, { cvForm: Object.assign({}, f, { busy: false, err: e.message }) }); });
        }
      },
      messages: x.messages.map(function (k) { var a = String(k.auteur || 'Membre').split(' · '); return { auteur: a[0], role: a[1] || '', quand: ilya(k.cree_le), texte: k.texte, ini: initiales(a[0]), mine: k.user_id === me,
        canDel: k.user_id === me || !!cd.staff, del: function () { cvAct(app, ev, db(function (c) { return c.from('vestiaire_messages').delete().eq('id', k.id); }), 'Message supprimé.'); } }; }),
      hasMessages: x.messages.length > 0,
      msg: { texte: m.texte || '', onTexte: function (e) { set(app, { cvMsg: { eid: ev.id, texte: val(e) } }); }, busy: !!m.busy,
        send: function () { var t = String(m.texte || '').trim(); if (!t) return; set(app, { cvMsg: { eid: ev.id, texte: t, busy: true } });
          db(function (c) { return c.from('vestiaire_messages').insert({ evenement_id: ev.id, texte: t.slice(0, 500) }); }).then(function () { set(app, { cvMsg: { eid: ev.id } }); delete D.cv[ev.id]; loadCovoit(app, ev.id); }, function (e) { set(app, { cvMsg: { eid: ev.id, texte: t } }); app.say(e.message); }); } },
      refresh: function () { delete D.cv[ev.id]; loadCovoit(app, ev.id); }
    };
  }
  function postVals(app, p, cd, mode) {
    var club = clubOf(p.club); var mine = !!uid() && p.user_id === uid();
    return {
      id: p.id, auteur: p.auteur_nom || 'Le club', ini: initiales(p.auteur_nom || 'Club'), role: p.auteur_role || '', section: SECTIONS[p.section] || '', secCls: 'vs-s-' + p.section,
      quand: ilya(p.cree_le), texte: p.texte, epingle: !!p.epingle, cls: p.epingle ? 'is-pin' : '',
      club: club ? club.name : '', hasClub: mode === 'home' && !!club, openClub: function () { app.go('vestiaire', { vsClub: p.club }); },
      canDel: mode !== 'home' && (mine || !!(cd && cd.staff)), canPin: mode !== 'home' && !!(cd && cd.staff), pinLabel: p.epingle ? 'Désépingler' : 'Épingler',
      pin: function () { db(function (c) { return c.from('vestiaire_fil').update({ epingle: !p.epingle }).eq('id', p.id); }).then(function () { refresh(app, p.club); }, function (e) { app.say(e.message); }); },
      del: function () { if (!window.confirm('Supprimer ce message du fil ?')) return; db(function (c) { return c.from('vestiaire_fil').delete().eq('id', p.id); }).then(function () { app.say('Message supprimé.'); refresh(app, p.club); }, function (e) { app.say(e.message); }); }
    };
  }

  // Formulaire « Rejoindre le vestiaire »
  function joinVals(app, club) {
    var f = ui(app).join || {}, sec = f.section || 'seniors', q = f.qualite || (sec === 'jeunes' ? 'parent' : 'joueur');
    var jeunes = sec === 'jeunes';
    var send = function () {
      var nom = jeunes ? nomCourt(f.prenom, f.nom) : String(f.affiche || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (!club) return setForm(app, 'join', { err: 'Choisissez d’abord votre club.' });
      if (nom.length < 2) return setForm(app, 'join', { err: jeunes ? 'Indiquez le prénom du jeune.' : 'Indiquez le nom à afficher (par exemple « Kader A. »).' });
      if (jeunes && q === 'joueur' && !f.age15) return setForm(app, 'join', { err: 'Moins de 15 ans : c’est un parent qui inscrit le jeune, avec son propre compte.' });
      if (!f.consent) return setForm(app, 'join', { err: 'Cochez la case pour accepter que le club voie votre réponse aux convocations.' });
      setForm(app, 'join', { busy: true, err: '' });
      db(function (c) { return c.from('vestiaire_membres').insert({ club: club, user_id: uid(), nom: nom, section: sec, qualite: jeunes && q === 'encadrant' ? 'encadrant' : q, equipe: String(f.equipe || '').trim().slice(0, 30) || null }); })
        .then(function () { set(app, { join: { open: false } }); app.say('Demande envoyée au club. Vous serez dans le vestiaire dès qu’il l’aura validée.'); D.mine = null; loadMine(app); },
          function (e) { setForm(app, 'join', { busy: false, err: /duplicate|unique/i.test(e.message) ? 'Une demande à ce nom existe déjà pour ce club.' : e.message }); });
    };
    return {
      open: !!f.open, closed: !f.open, toggle: function () { setForm(app, 'join', { open: !f.open, err: '' }); },
      section: sec, onSection: function (e) { setForm(app, 'join', { section: val(e), qualite: val(e) === 'jeunes' ? 'parent' : 'joueur', err: '' }); },
      qualite: q, onQualite: onF(app, 'join', 'qualite'),
      secOpts: [{ v: 'seniors', l: 'Seniors (adultes)' }, { v: 'jeunes', l: 'Jeunes (école de sport, U7 à U18)' }],
      qualOpts: jeunes ? [{ v: 'parent', l: 'Je suis le parent' }, { v: 'joueur', l: 'Je suis le jeune (15 ans ou plus)' }, { v: 'encadrant', l: 'J’encadre une équipe de jeunes' }] : opts(QUAL),
      isJeunes: jeunes, notJeunes: !jeunes, isParent: jeunes && q === 'parent', isJeuneJoueur: jeunes && q === 'joueur',
      prenom: f.prenom || '', onPrenom: onF(app, 'join', 'prenom'), nom: f.nom || '', onNom: onF(app, 'join', 'nom'),
      affiche: f.affiche || '', onAffiche: onF(app, 'join', 'affiche'), equipe: f.equipe || '', onEquipe: onF(app, 'join', 'equipe'),
      age15: !!f.age15, onAge15: onF(app, 'join', 'age15'), consent: !!f.consent, onConsent: onF(app, 'join', 'consent'),
      apercu: jeunes ? (nomCourt(f.prenom, f.nom) || 'Prénom N.') : '', err: f.err || '', hasErr: !!f.err, busy: !!f.busy, send: send,
      sendLabel: f.busy ? 'Envoi…' : 'Envoyer ma demande au club'
    };
  }
  // Formulaire du club : ajouter ou modifier un entraînement, un match, un rendez-vous
  function evFormVals(app, club) {
    var f = ui(app).evForm || {};
    var save = function () {
      if (!f.date || !f.heure) return setForm(app, 'evForm', { err: 'Indiquez la date et l’heure.' });
      var d0 = new Date(f.date + 'T' + f.heure); if (isNaN(d0)) return setForm(app, 'evForm', { err: 'Date ou heure invalide.' });
      var dur = parseInt(f.duree, 10); var n = f.id ? 1 : Math.max(1, Math.min(20, parseInt(f.repeter, 10) || 1));
      var base = { club: club, type: f.type || 'entrainement', section: f.section || 'club', equipe: String(f.equipe || '').trim().slice(0, 30) || null, titre: String(f.titre || '').trim().slice(0, 80) || null,
        lieu: String(f.lieu || '').trim().slice(0, 120) || null, adversaire: (f.type === 'match' ? String(f.adversaire || '').trim().slice(0, 80) : '') || null,
        domicile: f.type === 'match' ? f.domicile !== 'ext' : null, note: String(f.note || '').trim().slice(0, 300) || null };
      var rows = []; for (var i = 0; i < n; i++) { var d = new Date(d0.getTime()); d.setDate(d.getDate() + 7 * i); rows.push(Object.assign({}, base, { debut: d.toISOString(), fin: dur > 0 ? new Date(d.getTime() + dur * 60000).toISOString() : null })); }
      setForm(app, 'evForm', { busy: true, err: '' });
      db(function (c) { return f.id ? c.from('vestiaire_evenements').update(rows[0]).eq('id', f.id) : c.from('vestiaire_evenements').insert(rows); })
        .then(function () { set(app, { evForm: { open: false } }); app.say(f.id ? 'Planning mis à jour.' : n > 1 ? n + ' séances ajoutées au planning.' : 'Ajouté au planning.'); refresh(app, club); },
          function (e) { setForm(app, 'evForm', { busy: false, err: e.message }); });
    };
    var type = f.type || 'entrainement';
    return {
      open: !!f.open, toggle: function () { set(app, { evForm: f.open ? { open: false } : { open: true, type: 'entrainement', section: ui(app).sec && ui(app).sec !== 'club' ? ui(app).sec : 'club', repeter: '1', domicile: 'dom' } }); },
      editing: !!f.id, titreForm: f.id ? 'Modifier' : 'Ajouter au planning',
      type: type, onType: onF(app, 'evForm', 'type'), typeOpts: opts(TYPES), isMatch: type === 'match',
      section: f.section || 'club', onSection: onF(app, 'evForm', 'section'), secOpts: opts(SECTIONS),
      equipe: f.equipe || '', onEquipe: onF(app, 'evForm', 'equipe'), titre: f.titre || '', onTitre: onF(app, 'evForm', 'titre'),
      date: f.date || '', onDate: onF(app, 'evForm', 'date'), heure: f.heure || '', onHeure: onF(app, 'evForm', 'heure'),
      duree: f.duree || '', onDuree: onF(app, 'evForm', 'duree'), lieu: f.lieu || '', onLieu: onF(app, 'evForm', 'lieu'),
      adversaire: f.adversaire || '', onAdversaire: onF(app, 'evForm', 'adversaire'), domicile: f.domicile || 'dom', onDomicile: onF(app, 'evForm', 'domicile'),
      domOpts: [{ v: 'dom', l: 'À domicile' }, { v: 'ext', l: 'À l’extérieur' }],
      note: f.note || '', onNote: onF(app, 'evForm', 'note'), repeter: f.repeter || '1', onRepeter: onF(app, 'evForm', 'repeter'), canRepeat: !f.id,
      repOpts: [1, 2, 4, 6, 8, 12, 16].map(function (k) { return { v: String(k), l: k === 1 ? 'Une seule fois' : 'Chaque semaine, ' + k + ' fois' }; }),
      err: f.err || '', hasErr: !!f.err, busy: !!f.busy, save: save, saveLabel: f.busy ? 'Enregistrement…' : f.id ? 'Enregistrer' : 'Ajouter'
    };
  }
  function composerVals(app, club, cd, sec) {
    var f = ui(app).post || {};
    var secs = ['club', 'seniors', 'jeunes'].filter(function (k) { return cd.staff || (k === 'seniors' && (D.mine || []).some(function (m) { return m.club === club && m.statut === 'valide' && m.section === 'seniors' && m.qualite !== 'parent'; })); });
    var cur = f.section && secs.indexOf(f.section) >= 0 ? f.section : (secs.indexOf(sec) >= 0 ? sec : secs[0]);
    var send = function () {
      var t = String(f.texte || '').trim(); if (!t) return setForm(app, 'post', { err: 'Écrivez votre message.' });
      setForm(app, 'post', { busy: true, err: '' });
      db(function (c) { return c.from('vestiaire_fil').insert({ club: club, section: cur, texte: t.slice(0, 1000) }); })
        .then(function () { set(app, { post: { section: cur } }); app.say('Publié dans le fil ' + (cur === 'club' ? 'du club' : cur) + '.'); refresh(app, club); }, function (e) { setForm(app, 'post', { busy: false, err: e.message }); });
    };
    return { can: secs.length > 0 && !!uid(), texte: f.texte || '', onTexte: onF(app, 'post', 'texte'), section: cur, onSection: onF(app, 'post', 'section'),
      secOpts: secs.map(function (k) { return { v: k, l: 'Fil ' + (k === 'club' ? 'de tout le club' : k) }; }), multi: secs.length > 1,
      reste: String(1000 - String(f.texte || '').length), isJeunes: cur === 'jeunes', send: send, busy: !!f.busy, err: f.err || '', hasErr: !!f.err, sendLabel: f.busy ? 'Publication…' : 'Publier' };
  }
  function staffVals(app, club, cd) {
    var upd = function (m, patch, msg) { db(function (c) { return c.from('vestiaire_membres').update(patch).eq('id', m.id); }).then(function () { app.say(msg); refresh(app, club); }, function (e) { app.say(e.message); }); };
    var info = function (m) { return [SECTIONS[m.section], m.equipe, QUAL[m.qualite]].filter(Boolean).join(' · '); };
    var pend = (cd.membres || []).filter(function (m) { return m.statut === 'en_attente'; });
    var val0 = (cd.membres || []).filter(function (m) { return m.statut === 'valide'; });
    return {
      is: !!cd.staff, hasPending: pend.length > 0, nPending: String(pend.length),
      pending: pend.map(function (m) { return { nom: m.nom, info: info(m), quand: ilya(m.cree_le), ok: function () { upd(m, { statut: 'valide' }, m.nom + ' rejoint le vestiaire.'); }, no: function () { upd(m, { statut: 'refuse' }, 'Demande refusée.'); } }; }),
      hasMembres: val0.length > 0, nMembres: String(val0.length), open: !!ui(app).membresOpen, toggle: function () { set(app, { membresOpen: !ui(app).membresOpen }); },
      membres: val0.map(function (m) { return { nom: m.nom, info: info(m), isStaff: !!m.staff, staffLabel: m.staff ? 'Retirer encadrant' : 'Nommer encadrant',
        toggleStaff: function () { upd(m, { staff: !m.staff }, m.staff ? m.nom + ' n’est plus encadrant.' : m.nom + ' est encadrant : il gère le planning et publie dans le fil.'); },
        remove: function () { if (!window.confirm('Retirer ' + m.nom + ' du vestiaire ?')) return; db(function (c) { return c.from('vestiaire_membres').delete().eq('id', m.id); }).then(function () { app.say(m.nom + ' a été retiré du vestiaire.'); refresh(app, club); }, function (e) { app.say(e.message); }); } }; })
    };
  }

  // ---------- point d'entrée : valeurs pour index.html ----------
  function vals(app, ctx) {
    var s = app.state, A = C(), on = !!A;
    if (on) resetIfUserChanged();
    var logged = !!(s.loggedIn && uid());
    if (on && logged && D.mine === null) loadMine(app);
    var mine = D.mine || [];
    var mesClubIds = []; mine.forEach(function (m) { if (m.statut !== 'refuse' && mesClubIds.indexOf(m.club) < 0) mesClubIds.push(m.club); });
    var valides = []; mine.forEach(function (m) { if (m.statut === 'valide' && valides.indexOf(m.club) < 0) valides.push(m.club); });
    var corresp = s.role === 'club' && s.clubRoleId ? s.clubRoleId : null;
    var favs = Array.isArray(s.favClubs) ? s.favClubs : [];
    var all = clubsList();

    // ----- bloc de l'accueil -----
    var homeClubs = valides.concat(corresp && valides.indexOf(corresp) < 0 ? [corresp] : []);
    var home = { on: on, sqlMissing: D.sqlMissing };
    if (on && ctx.V === 'home' && (!logged || D.mine !== null)) loadHome(app, homeClubs);
    var H = D.home || { events: [], posts: [], comptes: {}, presences: [] };
    var hcd = { comptes: H.comptes, presences: H.presences, covoit: H.covoit || {}, staff: false };
    home.mine = homeClubs.length > 0;
    // Un joueur senior ne voit pas le planning des jeunes (et inversement) ; le club voit tout
    var monPlanning = function (e) { return e.club === corresp || e.section === 'club' || mine.some(function (m) { return m.statut === 'valide' && m.club === e.club && (m.staff || m.section === e.section); }); };
    home.events = H.events.filter(function (e) { return !home.mine || monPlanning(e); }).slice(0, 3).map(function (e) { return eventVals(app, e, hcd, 'home'); });
    home.posts = H.posts.slice(0, home.mine ? 2 : 3).map(function (p) { return postVals(app, p, null, 'home'); });
    home.hasEvents = home.events.length > 0; home.hasPosts = home.posts.length > 0; home.vide = !home.hasEvents && !home.hasPosts;
    home.titre = home.mine ? (homeClubs.length === 1 && clubOf(homeClubs[0]) ? 'Le vestiaire · ' + clubOf(homeClubs[0]).name : 'Mon vestiaire') : 'Le Vestiaire';
    home.sous = home.mine ? 'Vos prochains rendez-vous : dites au coach si vous venez.' : 'L’espace commun des clubs et des joueurs : planning, présences et nouvelles du club.';
    home.ouvrir = function () { app.go('vestiaire', homeClubs[0] ? { vsClub: homeClubs[0] } : {}); };
    home.ouvrirLabel = home.mine ? 'Ouvrir mon vestiaire' : 'Trouver mon club';
    home.pending = mine.some(function (m) { return m.statut === 'en_attente'; }) && !home.mine;
    home.cta = !home.mine;

    // ----- page #/vestiaire -----
    if (ctx.V !== 'vestiaire') return { home: home, page: { club: '' } };
    var club = s.vsClub && clubOf(s.vsClub) ? s.vsClub : (valides[0] || corresp || mesClubIds[0] || favs.find(function (id) { return !!clubOf(id); }) || '');
    var co = clubOf(club);
    if (on && club) loadClub(app, club);
    var cd = D.clubs[club] || { events: [], posts: [], comptes: {}, presences: [], membres: [], staff: false };
    var sec = (s.vs && s.vs.sec) || 'tout';
    var inSec = function (x) { return sec === 'tout' || x.section === sec || x.section === 'club'; };
    var events = cd.events.filter(inSec);
    var posts = cd.posts.filter(inSec);
    var mesClub = mine.filter(function (m) { return m.club === club; });
    var membre = mesClub.some(function (m) { return m.statut === 'valide'; });
    var attente = mesClub.filter(function (m) { return m.statut === 'en_attente'; });
    var refus = mesClub.length > 0 && mesClub.every(function (m) { return m.statut === 'refuse'; });
    var pickClub = function (id) { app.setState({ vsClub: id, vs: Object.assign({}, ui(app), { evOpen: null, evForm: { open: false }, join: { open: false }, post: {} }) }); app.syncRoute(Object.assign({}, app.state, { view: 'vestiaire', vsClub: id }), true); };
    var groupes = {}; events.forEach(function (e) { var d = new Date(e.debut); var k = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); (groupes[k] = groupes[k] || []).push(e); });
    var join = joinVals(app, club);
    var page = {
      on: on, off: !on, sqlMissing: D.sqlMissing, isAdmin: s.role === 'admin', err: D.err, hasErr: !!D.err && !D.sqlMissing,
      club: club, hasClub: !!co, noClub: !co, clubName: co ? co.name : '', clubSport: co ? [co.sport, co.city].filter(Boolean).join(' · ') : '',
      clubLogo: co && co.logo ? co.logo : '', hasLogo: !!(co && co.logo), noLogo: !(co && co.logo), clubIni: co ? initiales(co.name) : '',
      openFiche: function () { app.go('club', { clubId: club, clubTab: 'articles' }); },
      clubOpts: [{ v: '', l: 'Choisir un club…' }].concat(all.map(function (c) { return { v: c.id, l: c.name + (c.sport ? ' · ' + c.sport : '') }; })),
      onClub: function (e) { var v = val(e); if (v) pickClub(v); },
      mesClubs: mesClubIds.concat(corresp && mesClubIds.indexOf(corresp) < 0 ? [corresp] : []).map(function (id) { var c = clubOf(id); return c ? { label: c.name, pressed: id === club ? 'true' : 'false', cls: id === club ? 'is-on' : '', pick: function () { pickClub(id); } } : null; }).filter(Boolean),
      secTabs: [['tout', 'Tout le club'], ['seniors', 'Seniors'], ['jeunes', 'Jeunes']].map(function (t) { return { label: t[1], sel: sec === t[0] ? 'true' : 'false', cls: sec === t[0] ? 'is-on' : '', pick: function () { set(app, { sec: t[0], evOpen: null }); } }; }),
      loading: !!busy['c' + club] && !D.clubs[club],
      jours: Object.keys(groupes).sort().map(function (k) { var d = new Date(k + 'T12:00'); return { label: quandLong(d).split(' · ')[0], events: groupes[k].map(function (e) { return eventVals(app, e, cd, 'page'); }) }; }),
      noEvents: !events.length, posts: posts.map(function (p) { return postVals(app, p, cd, 'page'); }), noPosts: !posts.length,
      logged: logged, notLogged: !logged, login: function () { app.setState({ loginOpen: true, linkSent: false }); },
      membre: membre, staff: !!cd.staff, attente: attente.length > 0, attenteNoms: attente.map(function (m) { return m.nom; }).join(', '), refus: refus,
      canJoin: logged && !!co && !cd.staff, joinLabel: membre || attente.length ? 'Inscrire une autre personne' : 'Rejoindre ce vestiaire',
      monStatut: membre ? 'Vous êtes dans ce vestiaire' + (mesClub.filter(function (m) { return m.statut === 'valide' && m.qualite === 'parent'; }).length ? ' (pour ' + mesClub.filter(function (m) { return m.statut === 'valide' && m.qualite === 'parent'; }).map(function (m) { return m.nom; }).join(', ') + ')' : '') + '.' : '',
      join: join, evForm: evFormVals(app, club), composer: composerVals(app, club, cd, sec === 'tout' ? 'club' : sec), gestion: staffVals(app, club, cd),
      quitter: membre ? function () { if (!window.confirm('Quitter le vestiaire de ' + (co ? co.name : 'ce club') + ' ? Vos réponses aux convocations seront effacées.')) return; Promise.all(mesClub.map(function (m) { return db(function (c) { return c.from('vestiaire_membres').delete().eq('id', m.id); }); })).then(function () { app.say('Vous avez quitté ce vestiaire.'); D.mine = null; loadMine(app); refresh(app, club); }, function (e) { app.say(e.message); }); } : null,
      canQuit: membre && !cd.staff,
      pro: window.CasaOffres && co ? window.CasaOffres.vestiaire(app, club, co.name, !!cd.staff) : { show: false },
      czOn: !!co && (membre || !!cd.staff || s.role === 'admin'), czStaff: !!cd.staff,
      openCauseries: function () { app.openCauseries({ club: club }); }, nouvelleCauserie: function () { app.openCauseries({ club: club, nouvelle: true }); },
      cvMissing: D.cvMissing && s.role === 'admin',
      secNote: sec === 'jeunes' ? 'Section jeunes : les prénoms et les présences des jeunes ne sont visibles que du club et de leurs parents.' : '', hasSecNote: sec === 'jeunes'
    };
    return { home: home, page: page };
  }

  return { vals: vals, nomCourt: nomCourt, _data: D };
})();
