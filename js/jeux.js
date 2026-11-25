/*!
 * Casa Besports — la rubrique « Jeux » de l'application (#/jeux)
 *
 *  1. Le quiz du bus : culture générale du sport international (football, basket, handball, volley, hockey),
 *     tiré au hasard par sport et par thème. Deux façons de jouer :
 *       - un seul téléphone qui tourne, chacun son tour (marche sans réseau) ;
 *       - chacun son téléphone, en réseau : mêmes questions en même temps, salle à code (Supabase Realtime).
 *     Chrono de 20 s facultatif, 10 points par bonne réponse + bonus de rapidité, podium final.
 *     Questions : contenus/quiz-sports.js, plus celles ajoutées dans Admin › Contenus › « Jeux : questions du quiz ».
 *  2. Devine le joueur : un joueur du site par jour, 6 essais, un indice de plus à chaque erreur.
 *  3. Mes cartes : les points gagnés aux jeux débloquent les cartes des joueurs des clubs (albums des clubs).
 *     100 points = 1 carte, 500 points au plus par jour. Chaque question affiche sa discipline en grand.
 *
 * Réglages, prénoms et parties gardés sur l'appareil (localStorage « cb-jeux-v1 »). En réseau, seuls le prénom,
 * les questions et les réponses de la partie passent par le canal, rien n'est enregistré en ligne.
 * Guide : docs/JEUX.md
 */
var CasaJeux = (function () {
  'use strict';
  var KEY = 'cb-jeux-v1';
  var mem = (function () { try { var v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } })();
  ['devine'].forEach(function (k) { if (!mem[k] || typeof mem[k] !== 'object') mem[k] = {}; });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }

  var norm = function (t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var isoDay = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var jour = function () { return isoDay(new Date()); };
  var veille = function (iso) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - 1); return isoDay(d); };
  // Tirage identique pour tout le monde le même jour (Devine le joueur)
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function melange(arr, r) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function uniques(arr) { var seen = {}, out = []; arr.forEach(function (x) { var k = norm(x); if (x && k && !seen[k]) { seen[k] = 1; out.push(x); } }); return out; }

  var app = null;
  function rafraichir() { if (app) app.setState({ jxT: Date.now() }); }
  function dire(t) { if (app && app.say) app.say(t); }
  function partager(texte) {
    try { if (navigator.share) { navigator.share({ text: texte }).catch(function () {}); return; } } catch (e) {}
    try { navigator.clipboard.writeText(texte).then(function () { dire('Résultat copié : collez-le où vous voulez'); }, function () { dire(texte); }); } catch (e) { dire(texte); }
  }
  function adresse() { try { var u = window.CASA_SITE_URL; return (u && /^https?:/.test(u) ? u.replace(/\/$/, '') : location.origin) + '/#/jeux'; } catch (e) { return ''; } }

  /* ================= 1. Le quiz du bus : culture sport internationale ================= */
  // Deux façons de jouer : un seul téléphone qui tourne (chacun son tour), ou chacun son téléphone en réseau
  // (mêmes questions en même temps, salle à code, via Supabase Realtime ; voir « 3. En réseau »).
  var CHRONO = 20, MAX_JOUEURS = 10, NB_RESEAU = [5, 10, 15];
  var SPORTS = ['Football', 'Basket', 'Handball', 'Volley-ball', 'Hockey'];
  // La discipline de chaque question, bien visible pendant le jeu : pictogramme, nom, couleur
  var SPORT_INFO = { 'Football': ['⚽', 'is-foot'], 'Basket': ['🏀', 'is-basket'], 'Handball': ['🤾', 'is-hand'], 'Volley-ball': ['🏐', 'is-volley'], 'Hockey': ['🏒', 'is-hockey'] };
  function sportNorm(x) {
    var n = norm(x); if (!n) return '';
    if (/foot/.test(n)) return 'Football'; if (/basket/.test(n)) return 'Basket'; if (/hand/.test(n)) return 'Handball'; if (/volley/.test(n)) return 'Volley-ball'; if (/hockey/.test(n)) return 'Hockey';
    return String(x).trim().slice(0, 30);
  }
  function badgeSport(sport) {
    var inf = SPORT_INFO[sport] || ['🏟️', 'is-autre'];
    return { sport: sport || 'Culture sport', sportIc: inf[0], sportCls: inf[1], hasSport: true };
  }
  var reglages = (function () {
    var r = mem.quizReg || {};
    return { mode: r.mode === 'reseau' ? 'reseau' : 'tour', sport: SPORTS.indexOf(r.sport) >= 0 ? r.sport : '', themes: Array.isArray(r.themes) ? r.themes : [],
      joueurs: Array.isArray(r.joueurs) ? r.joueurs.slice(0, MAX_JOUEURS) : [], parJoueur: [3, 5, 10].indexOf(r.parJoueur) >= 0 ? r.parJoueur : 5,
      nbReseau: NB_RESEAU.indexOf(r.nbReseau) >= 0 ? r.nbReseau : 10, chrono: r.chrono !== false, prenom: String(r.prenom || '').slice(0, 20) };
  })();
  function garderReglages() { mem.quizReg = reglages; save(); }
  if (!Array.isArray(mem.vus)) mem.vus = [];
  var partie = null, minuteur = null;
  function themes() { var t = Array.isArray(window.CASA_QUIZ_FOOT_THEMES) ? window.CASA_QUIZ_FOOT_THEMES.slice() : []; if (questionsRedaction().length) t.push({ id: 'redaction', sport: '', label: 'Questions de la rédaction' }); return t; }
  function sportDe(themeId) { return (themes().find(function (t) { return t.id === themeId; }) || {}).sport || ''; }
  function questionsRedaction() {
    return (Array.isArray(window.CASA_QUIZ) ? window.CASA_QUIZ : []).filter(function (q) { return q && q.actif !== false && q.question && q.bonne && (q.faux1 || q.faux2 || q.faux3); })
      .map(function (q, i) { return { id: 'r-' + (q.id || i), theme: 'redaction', sport: sportNorm(q.sport), q: q.question, bonne: q.bonne, faux: [q.faux1, q.faux2, q.faux3].filter(Boolean), why: q.explication || '' }; });
  }
  function banque() {
    return (Array.isArray(window.CASA_QUIZ_FOOT) ? window.CASA_QUIZ_FOOT : []).filter(function (x) { return Array.isArray(x) && x[1] && x[2]; })
      .map(function (x) { return { id: 'f-' + hash(x[1]).toString(36), theme: x[0], q: x[1], bonne: x[2], faux: [x[3], x[4], x[5]].filter(Boolean), why: x[6] || '' }; })
      .concat(questionsRedaction());
  }
  // Les questions retenues par les réglages (sport, thèmes)
  function selection() {
    var sp = reglages.sport, choix = reglages.themes;
    return banque().filter(function (q) {
      if (choix.length) return choix.indexOf(q.theme) >= 0;
      return !sp || sportDe(q.theme) === sp || (q.theme === 'redaction');
    });
  }
  // Tirage : d'abord les questions pas encore vues sur cet appareil, puis les autres
  function tirer(n) {
    var r = Math.random, vus = {}; mem.vus.forEach(function (id) { vus[id] = 1; });
    var pool = selection();
    var neuves = melange(pool.filter(function (q) { return !vus[q.id]; }), r), deja = melange(pool.filter(function (q) { return vus[q.id]; }), r);
    return neuves.concat(deja).slice(0, Math.min(n, pool.length)).map(function (q) { return Object.assign({}, q, { options: melange([q.bonne].concat(q.faux), r) }); });
  }
  function marquerVue(id) { mem.vus = mem.vus.filter(function (x) { return x !== id; }).concat([id]).slice(-600); save(); }
  function sportQ(q) { return (q && (q.sport || sportDe(q.theme))) || ''; }
  function themeLabel(id) { var t = themes().find(function (x) { return x.id === id; }); return t ? t.label : ''; }
  function pointsPour(ms) { var reste = Math.max(0, CHRONO - Math.floor(ms / 1000)); return reglages.chrono ? 10 + Math.round(reste / 2) : 10; }

  function arreterMinuteur() { if (minuteur) { clearInterval(minuteur); minuteur = null; } }
  function lancerMinuteur() {
    arreterMinuteur(); if (!reglages.chrono) return;
    minuteur = setInterval(function () {
      if (!partie || partie.fini || partie.reponse != null) return;
      if (!app || app.state.view !== 'jeux') return;
      if (Date.now() - partie.debut >= CHRONO * 1000) repondre('__temps'); else rafraichir();
    }, 1000);
  }
  function versLeJeu() { try { var el = document.querySelector('.jx-tabs'); if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' }); } catch (e) {} }
  function demarrer() {
    var joueurs = reglages.joueurs.length ? reglages.joueurs : ['Vous'];
    var qs = tirer(joueurs.length * reglages.parJoueur);
    if (!qs.length) { dire('Aucune question avec ces réglages.'); return; }
    partie = { id: 'q' + Date.now().toString(36), credit: null, qs: qs, tour: 0, reponse: null, debut: Date.now(), fini: false, solo: !reglages.joueurs.length, joueurs: joueurs.map(function (nom) { return { nom: nom, pts: 0, bonnes: 0, rep: 0 }; }) };
    lancerMinuteur(); rafraichir();
    try { var el = document.querySelector('.jx-tabs'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
  function joueurCourant() { return partie.joueurs[partie.tour % partie.joueurs.length]; }
  function repondre(o) {
    if (!partie || partie.fini || partie.reponse != null) return;
    var q = partie.qs[partie.tour], j = joueurCourant();
    partie.reponse = o; j.rep++;
    if (o === q.bonne) { j.bonnes++; j.pts += pointsPour(Date.now() - partie.debut); }
    marquerVue(q.id); rafraichir();
  }
  function suivant() {
    if (!partie) return;
    partie.tour++; partie.reponse = null; partie.debut = Date.now();
    if (partie.tour >= partie.qs.length) { partie.fini = true; arreterMinuteur(); if (partie.solo) recupererTour(partie.joueurs[0]); }
    rafraichir(); versLeJeu();
  }
  function quitter() { partie = null; arreterMinuteur(); rafraichir(); }
  function ajouterJoueur(nom) {
    nom = String(nom || '').trim().replace(/\s+/g, ' ').slice(0, 20); if (!nom) return;
    if (reglages.joueurs.length >= MAX_JOUEURS) { dire(MAX_JOUEURS + ' joueurs au maximum.'); return; }
    if (reglages.joueurs.some(function (x) { return norm(x) === norm(nom); })) { dire(nom + ' est déjà dans la partie.'); return; }
    reglages.joueurs.push(nom); garderReglages(); app.setState({ jxNom: '' });
  }
  // Fin de partie sur un téléphone : les points du propriétaire du téléphone vont à ses cartes joueurs (une fois par partie)
  function recupererTour(j) {
    if (!partie || !partie.fini || partie.credit) return;
    var g = crediter(j.pts, partie.id);
    partie.credit = { nom: j.nom, pts: g.pts, plafond: g.plafond };
    rafraichir();
  }
  var MEDAILLES = ['🥇', '🥈', '🥉'];
  function podium(joueurs) {
    return joueurs.slice().sort(function (a, b) { return b.pts - a.pts || b.bonnes - a.bonnes; });
  }
  function textePartage(cl) { return 'Quiz du bus BE+\n' + cl.map(function (j, i) { return (MEDAILLES[i] || (i + 1) + '.') + ' ' + j.nom + ' : ' + j.pts + ' pts (' + j.bonnes + '/' + j.rep + ')'; }).join('\n') + '\n' + adresse(); }

  // Réglages communs aux deux modes : sport, thèmes, chrono
  function valsReglages(s) {
    var th = themes(), tout = banque(), compte = {};
    tout.forEach(function (q) { compte[q.theme] = (compte[q.theme] || 0) + 1; });
    var parSport = {}; tout.forEach(function (q) { var sp = sportDe(q.theme); if (sp) parSport[sp] = (parSport[sp] || 0) + 1; });
    var sp = reglages.sport;
    var thVisibles = th.filter(function (t) { return compte[t.id] && (sp ? t.sport === sp : false); });
    if (!sp && compte.redaction) thVisibles = th.filter(function (t) { return t.id === 'redaction'; });
    return {
      sports: [{ id: '', label: 'Tous les sports', n: tout.length }].concat(SPORTS.map(function (x) { return { id: x, label: x, n: parSport[x] || 0 }; })).filter(function (x) { return x.n > 0; }).map(function (x) {
        var on = reglages.sport === x.id;
        return { label: (SPORT_INFO[x.id] ? SPORT_INFO[x.id][0] + ' ' : '') + x.label, n: String(x.n), cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () { reglages.sport = x.id; reglages.themes = []; garderReglages(); rafraichir(); } };
      }),
      hasThemes: thVisibles.length > 0,
      themes: (sp && thVisibles.length > 1 ? [{ id: '', label: 'Tout ' + (sp === 'Football' ? 'le foot' : sp === 'Hockey' ? 'le hockey' : sp === 'Handball' ? 'le hand' : sp === 'Basket' ? 'le basket' : 'le volley'), n: thVisibles.reduce(function (a, t) { return a + compte[t.id]; }, 0) }] : []).concat(thVisibles.map(function (t) { return { id: t.id, label: t.label, n: compte[t.id] }; })).map(function (t) {
        var on = t.id ? reglages.themes.indexOf(t.id) >= 0 : !reglages.themes.length;
        return { label: t.label, n: String(t.n), cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () {
          if (!t.id) reglages.themes = []; else if (on) reglages.themes = reglages.themes.filter(function (x) { return x !== t.id; }); else reglages.themes = reglages.themes.concat([t.id]);
          garderReglages(); rafraichir(); } };
      }),
      dispo: String(selection().length),
      chrono: reglages.chrono, chronoLabel: reglages.chrono ? 'Chrono ' + CHRONO + ' s : activé' : 'Chrono : désactivé', chronoPressed: reglages.chrono ? 'true' : 'false',
      basculerChrono: function () { reglages.chrono = !reglages.chrono; garderReglages(); rafraichir(); },
      modes: [['tour', 'Un téléphone', 'On se le passe, chacun son tour'], ['reseau', 'Chacun son téléphone', 'Tous en même temps, mêmes questions']].map(function (m) {
        var on = reglages.mode === m[0];
        return { label: m[1], sub: m[2], cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () { reglages.mode = m[0]; garderReglages(); rafraichir(); } };
      }),
      modeTour: reglages.mode === 'tour', modeReseau: reglages.mode === 'reseau'
    };
  }

  function valsQuiz(s) {
    if (!partie) {
      var nbJ = reglages.joueurs.length, R = valsReglages(s);
      return Object.assign(R, {
        reglage: true, enJeu: false, fini: false,
        joueurs: reglages.joueurs.map(function (nom, i) { return { nom: nom, retirer: function () { reglages.joueurs.splice(i, 1); garderReglages(); rafraichir(); }, aria: 'Retirer ' + nom }; }),
        hasJoueurs: nbJ > 0,
        nom: s.jxNom || '', onNom: function (e) { app.setState({ jxNom: e.target.value }); },
        onTouche: function (e) { if (e && e.key === 'Enter') { e.preventDefault(); ajouterJoueur(e.target.value); } },
        ajouter: function () { ajouterJoueur(s.jxNom); },
        nbs: [3, 5, 10].map(function (n) { var on = reglages.parJoueur === n; return { label: String(n), cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () { reglages.parJoueur = n; garderReglages(); rafraichir(); } }; }),
        nbLabel: nbJ > 1 ? 'Questions par joueur' : 'Nombre de questions',
        resume: (nbJ > 1 ? nbJ + ' joueurs · ' + nbJ * reglages.parJoueur + ' questions, chacun son tour' : nbJ === 1 ? reglages.joueurs[0] + ' · ' + reglages.parJoueur + ' questions' : 'En solo · ' + reglages.parJoueur + ' questions'),
        lancer: demarrer
      });
    }
    var classement = podium(partie.joueurs);
    if (partie.fini) {
      var meilleur = classement[0];
      return {
        reglage: false, enJeu: false, fini: true, solo: partie.solo, multi: !partie.solo,
        titre: partie.solo ? meilleur.bonnes + ' bonne' + (meilleur.bonnes > 1 ? 's' : '') + ' réponse' + (meilleur.bonnes > 1 ? 's' : '') + ' sur ' + meilleur.rep : meilleur.nom + ' gagne !',
        sous: partie.solo ? meilleur.pts + ' points' : 'avec ' + meilleur.pts + ' points',
        podium: classement.map(function (j, i) { return { rang: MEDAILLES[i] || String(i + 1), nom: j.nom, pts: String(j.pts), detail: j.bonnes + '/' + j.rep, cls: i === 0 ? 'is-top' : '',
          cMoi: !partie.solo && !partie.credit, cMoiCls: !partie.solo && !partie.credit ? 'has-moi' : '', moi: function () { recupererTour(j); }, moiAria: 'C’est moi, ' + j.nom + ' : récupérer mes points' }; }),
        demandeMoi: !partie.solo && !partie.credit,
        gain: partie.credit ? texteGain(partie.credit.pts, partie.credit.plafond, partie.solo ? '' : partie.credit.nom) : '', hasGain: !!partie.credit, voirCartes: voirCartes,
        rejouer: demarrer, reglages: quitter, partager: function () { partager(textePartage(classement)); }
      };
    }
    var q = partie.qs[partie.tour], j = joueurCourant(), rep = partie.reponse, repondu = rep != null;
    var ecoule = Math.min(CHRONO, (Date.now() - partie.debut) / 1000), reste = Math.max(0, Math.ceil(CHRONO - ecoule));
    var prochain = partie.joueurs[(partie.tour + 1) % partie.joueurs.length];
    var dernier = partie.tour >= partie.qs.length - 1;
    return {
      reglage: false, enJeu: true, fini: false, solo: partie.solo, multi: !partie.solo,
      tourDe: j.nom, num: 'Question ' + (partie.tour + 1) + ' / ' + partie.qs.length, theme: themeLabel(q.theme), q: q.q,
      sport: badgeSport(sportQ(q)),
      chrono: reglages.chrono && !repondu, reste: String(reste), chronoPct: Math.round((CHRONO - ecoule) / CHRONO * 100) + '%', urgent: reste <= 5 ? 'is-urgent' : '',
      options: q.options.map(function (o) {
        var juste = o === q.bonne, choisi = rep === o;
        return { label: o, cls: repondu ? (juste ? 'is-juste' : choisi ? 'is-faux' : 'is-off') : '', dis: repondu ? 'true' : 'false', pick: function () { repondre(o); } };
      }),
      repondu: repondu, verdict: !repondu ? '' : rep === q.bonne ? 'Bonne réponse' + (partie.solo ? '' : ', ' + j.nom) + ' !' : rep === '__temps' ? 'Temps écoulé : c’était « ' + q.bonne + ' »' : 'Raté : c’était « ' + q.bonne + ' »',
      verdictCls: repondu && rep === q.bonne ? 'is-juste' : 'is-faux', why: repondu ? q.why : '', hasWhy: repondu && !!q.why,
      suivant: suivant, suivantLabel: dernier ? 'Voir le classement' : partie.solo ? 'Question suivante' : 'Au tour de ' + prochain.nom,
      scores: classement.map(function (x) { return { nom: x.nom, pts: String(x.pts), cls: x === j ? 'is-on' : '' }; }),
      quitter: quitter
    };
  }

  /* ================= 3. En réseau : chacun son téléphone, mêmes questions en même temps ================= */
  // L'organisateur crée une salle (code de 4 caractères) ; les autres la rejoignent avec le code.
  // Le téléphone de l'organisateur fait l'arbitre : il envoie les questions, reçoit les réponses, compte les points
  // et renvoie l'état de la partie à tous. Transport : Supabase Realtime (canal « broadcast », sans table ni SQL).
  // Sans Supabase (ou avec ?jeux=local), les onglets d'un même navigateur se parlent (BroadcastChannel) : utile pour tester.
  // Identifiant de joueur propre à l'onglet (sessionStorage) : survit à un rechargement, distinct entre deux onglets
  var MOI = (function () {
    var id = ''; try { id = sessionStorage.getItem('cb-jeux-id') || ''; } catch (e) {}
    if (!id) { id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); try { sessionStorage.setItem('cb-jeux-id', id); } catch (e) {} }
    return id;
  })(), CODE_CAR = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var net = null;
  function nouveauCode() { var c = ''; for (var i = 0; i < 4; i++) c += CODE_CAR.charAt(Math.floor(Math.random() * CODE_CAR.length)); return c; }
  function ouvrirCanal(code, recevoir, statut) {
    var nom = 'casa-quiz-' + code.toLowerCase(), A = window.CasaAuth;
    var local = !(A && A.on && A.client) || /jeux=local/.test(String(location.search) + String(location.hash));
    if (local) {
      if (typeof BroadcastChannel === 'undefined') { setTimeout(function () { statut('err'); }, 0); return { envoyer: function () {}, fermer: function () {} }; }
      var bc = new BroadcastChannel(nom); bc.onmessage = function (e) { recevoir(e.data); }; setTimeout(function () { statut('ok'); }, 0);
      return { envoyer: function (m) { try { bc.postMessage(m); } catch (e) {} }, fermer: function () { try { bc.close(); } catch (e) {} } };
    }
    var ch = null, pret = false, file = [], ferme = false;
    function envoyer(m) { if (!pret) { file.push(m); return; } try { ch.send({ type: 'broadcast', event: 'm', payload: m }); } catch (e) {} }
    Promise.resolve(A.client()).then(function (c) {
      if (ferme) return;
      ch = c.channel(nom, { config: { broadcast: { self: false, ack: false } } });
      ch.on('broadcast', { event: 'm' }, function (x) { recevoir(x && x.payload); });
      ch.subscribe(function (st) {
        if (st === 'SUBSCRIBED') { pret = true; file.splice(0).forEach(envoyer); statut('ok'); }
        else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') statut('err');
      });
    }).catch(function () { statut('err'); });
    return { envoyer: envoyer, fermer: function () { ferme = true; try { if (ch) ch.unsubscribe(); } catch (e) {} } };
  }
  function prenomReseau() { return String(reglages.prenom || '').trim().replace(/\s+/g, ' ').slice(0, 20); }
  function fermerNet(silencieux) {
    if (!net) return;
    clearInterval(net.battement); clearInterval(net.tic); clearTimeout(net.attente);
    if (net.role === 'hote' && !silencieux) net.canal.envoyer({ t: 'fin-hote' });
    if (net.role === 'invite' && !silencieux) net.canal.envoyer({ t: 'part', id: MOI });
    setTimeout(function (c) { c.fermer(); }.bind(null, net.canal), 300);
    net = null; rafraichir();
  }
  function statutNet(st) { if (!net) return; net.statut = st; rafraichir(); }

  // ----- côté organisateur -----
  function etatPublic() {
    var e = net.etat, q = e.i >= 0 && e.i < net.qs.length ? net.qs[e.i] : null;
    var m = { t: 'etat', phase: e.phase, joueurs: e.joueurs, i: e.i, total: net.qs.length, chrono: net.chrono, repondus: Object.keys(net.reponses) };
    m.pid = net.pid;
    if (q && (e.phase === 'q' || e.phase === 'rev')) m.q = { q: q.q, options: q.options, theme: themeLabel(q.theme), sport: sportQ(q) };
    if (e.phase === 'q' && net.chrono) m.restant = Math.max(0, CHRONO * 1000 - (Date.now() - net.debut));
    if (e.phase === 'rev') { m.rev = { bonne: q.bonne, why: q.why, choix: {} }; Object.keys(net.reponses).forEach(function (id) { m.rev.choix[id] = net.reponses[id].o; }); }
    return m;
  }
  function diffuser() { if (!net || net.role !== 'hote') return; net.canal.envoyer(etatPublic()); rafraichir(); }
  function creerSalle() {
    var nom = prenomReseau(); if (!nom) { dire('Écrivez d’abord votre prénom.'); return; }
    var qs = tirer(reglages.nbReseau); if (!qs.length) { dire('Aucune question avec ces réglages.'); return; }
    net = { role: 'hote', code: nouveauCode(), pid: Date.now().toString(36), statut: 'connexion', qs: qs, chrono: reglages.chrono, reponses: {}, debut: 0,
      etat: { phase: 'salle', i: -1, joueurs: [{ id: MOI, nom: nom, pts: 0, bonnes: 0, rep: 0 }] } };
    net.canal = ouvrirCanal(net.code, recuHote, statutNet);
    net.battement = setInterval(diffuser, 2500);
    net.tic = setInterval(function () {
      if (!net || net.etat.phase !== 'q') return;
      if (net.chrono && Date.now() - net.debut >= CHRONO * 1000) reveler(); else if (app && app.state.view === 'jeux') rafraichir();
    }, 1000);
    rafraichir(); versLeJeu();
  }
  function recuHote(m) {
    if (!net || !m || !m.t) return;
    var e = net.etat;
    if (m.t === 'rejoint' && m.id && m.nom) {
      var j = e.joueurs.find(function (x) { return x.id === m.id; });
      if (j) j.nom = String(m.nom).slice(0, 20);
      else if (e.joueurs.length < 30) e.joueurs.push({ id: m.id, nom: String(m.nom).slice(0, 20), pts: 0, bonnes: 0, rep: 0 });
      diffuser();
    } else if (m.t === 'part' && m.id && m.id !== MOI) {
      e.joueurs = e.joueurs.filter(function (x) { return x.id !== m.id; }); delete net.reponses[m.id]; diffuser(); verifierTous();
    } else if (m.t === 'reponse' && e.phase === 'q' && m.i === e.i) enregistrer(m.id, m.o);
  }
  function enregistrer(id, o) {
    if (!net || net.etat.phase !== 'q' || net.reponses[id] || !net.etat.joueurs.some(function (x) { return x.id === id; })) return;
    net.reponses[id] = { o: o, ms: Date.now() - net.debut };
    diffuser(); verifierTous();
  }
  function verifierTous() { if (net && net.etat.phase === 'q' && net.etat.joueurs.every(function (x) { return net.reponses[x.id]; })) reveler(); }
  function reveler() {
    var e = net.etat, q = net.qs[e.i]; if (e.phase !== 'q') return;
    e.joueurs.forEach(function (j) { var r = net.reponses[j.id]; if (!r) return; j.rep++; if (r.o === q.bonne) { j.bonnes++; j.pts += pointsPour(r.ms); } });
    marquerVue(q.id); e.phase = 'rev'; diffuser();
  }
  function questionSuivante() {
    var e = net.etat; e.i++; net.reponses = {}; net.debut = Date.now();
    e.phase = e.i >= net.qs.length ? 'fin' : 'q';
    if (e.phase === 'fin') { var moi = e.joueurs.find(function (x) { return x.id === MOI; }); if (moi) net.credit = crediter(moi.pts, net.code + ':' + net.pid + ':' + MOI); }
    diffuser(); versLeJeu();
  }
  function rejouerSalle() {
    var qs = tirer(reglages.nbReseau); if (!qs.length) return;
    net.qs = qs; net.reponses = {}; net.etat.i = -1; net.etat.phase = 'salle'; net.pid = Date.now().toString(36); net.credit = null;
    net.etat.joueurs.forEach(function (j) { j.pts = 0; j.bonnes = 0; j.rep = 0; });
    diffuser();
  }

  // ----- côté invité -----
  function rejoindreSalle(code) {
    var nom = prenomReseau(); if (!nom) { dire('Écrivez d’abord votre prénom.'); return; }
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    if (code.length !== 4) { dire('Le code de la partie a 4 caractères.'); return; }
    net = { role: 'invite', code: code, statut: 'connexion', etat: null, fin: 0, maRep: null, introuvable: false };
    net.canal = ouvrirCanal(code, recuInvite, statutNet);
    var dire_bonjour = function () { if (net && net.role === 'invite' && (!net.etat || !net.etat.joueurs.some(function (x) { return x.id === MOI; }))) net.canal.envoyer({ t: 'rejoint', id: MOI, nom: nom }); };
    dire_bonjour(); net.battement = setInterval(dire_bonjour, 2500);
    net.attente = setTimeout(function () { if (net && net.role === 'invite' && !net.etat) { net.introuvable = true; rafraichir(); } }, 9000);
    net.tic = setInterval(function () { if (net && net.etat && net.etat.phase === 'q' && net.etat.chrono && app && app.state.view === 'jeux') rafraichir(); }, 1000);
    rafraichir(); versLeJeu();
  }
  function recuInvite(m) {
    if (!net || !m) return;
    if (m.t === 'fin-hote') { net.ferme = true; rafraichir(); return; }
    if (m.t !== 'etat') return;
    var avant = net.etat;
    if (!avant || avant.i !== m.i || avant.phase !== m.phase) { if (!avant || avant.i !== m.i) net.maRep = null; if (m.phase === 'q') versLeJeu(); }
    if (m.phase === 'q' && m.restant != null && (!avant || avant.i !== m.i || avant.phase !== 'q')) net.fin = Date.now() + m.restant;
    if (m.phase === 'fin' && m.pid && (!avant || avant.phase !== 'fin')) {
      var moi = (m.joueurs || []).find(function (x) { return x.id === MOI; });
      if (moi) net.credit = crediter(moi.pts, net.code + ':' + m.pid + ':' + MOI);
    }
    if (m.phase !== 'fin') net.credit = null;
    net.etat = m; net.introuvable = false; rafraichir();
  }
  function repondreReseau(o) {
    if (!net || !net.etat || net.etat.phase !== 'q') return;
    if (net.role === 'hote') { enregistrer(MOI, o); return; }
    if (net.maRep) return;
    net.maRep = { i: net.etat.i, o: o }; net.canal.envoyer({ t: 'reponse', id: MOI, i: net.etat.i, o: o }); rafraichir();
  }

  function valsReseau(s) {
    if (!net) {
      return {
        actif: false, prenom: reglages.prenom, onPrenom: function (e) { reglages.prenom = String(e.target.value || '').slice(0, 20); garderReglages(); rafraichir(); },
        nbs: NB_RESEAU.map(function (n) { var on = reglages.nbReseau === n; return { label: String(n), cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () { reglages.nbReseau = n; garderReglages(); rafraichir(); } }; }),
        creer: creerSalle,
        code: s.jxCode || '', onCode: function (e) { app.setState({ jxCode: String(e.target.value || '').toUpperCase().slice(0, 4) }); },
        onToucheCode: function (e) { if (e && e.key === 'Enter') { e.preventDefault(); rejoindreSalle(e.target.value); } },
        rejoindre: function () { rejoindreSalle(s.jxCode); }
      };
    }
    var hote = net.role === 'hote', e = hote ? etatPublic() : net.etat;
    var base = { actif: true, hote: hote, invite: !hote, code: net.code, quitter: function () { fermerNet(false); },
      connexion: net.statut === 'connexion' || (!hote && !e && !net.introuvable), erreur: net.statut === 'err', introuvable: !hote && net.introuvable && !e, ferme: !!net.ferme,
      salle: false, question: false, revele: false, fin: false };
    if (base.erreur || base.ferme || !e) return base;
    var joueurs = e.joueurs || [], cl = podium(joueurs), monRep = hote ? (net.reponses[MOI] && net.reponses[MOI].o) : (net.maRep && net.maRep.i === e.i ? net.maRep.o : null);
    var dejaLa = joueurs.some(function (x) { return x.id === MOI; });
    base.connexion = false;
    base.joueurs = joueurs.map(function (j) { var a = (e.repondus || []).indexOf(j.id) >= 0; return { nom: j.nom + (j.id === MOI ? ' (vous)' : ''), pts: String(j.pts), cls: (j.id === MOI ? 'is-moi ' : '') + (e.phase === 'q' && a ? 'is-ok' : ''), etat: e.phase === 'q' ? (a ? '✓' : '…') : '' }; });
    base.nbJoueurs = joueurs.length + ' joueur' + (joueurs.length > 1 ? 's' : '');
    if (e.phase === 'salle') {
      base.salle = true; base.attente = !dejaLa ? 'Connexion à la partie…' : 'En attente du lancement par l’organisateur…';
      base.lancer = function () { if (net.etat.joueurs.length < 1) return; questionSuivante(); };
      base.lancerLabel = joueurs.length > 1 ? 'Lancer la partie (' + joueurs.length + ' joueurs)' : 'Lancer quand tout le monde est là';
      base.total = String(e.total) + ' questions';
      return base;
    }
    if (e.phase === 'fin') {
      var best = cl[0] || { nom: '', pts: 0 };
      base.fin = true; base.titre = best.nom + (best.id === MOI ? ' (vous)' : '') + ' gagne !'; base.sous = 'avec ' + best.pts + ' points';
      base.podium = cl.map(function (j, i) { return { rang: MEDAILLES[i] || String(i + 1), nom: j.nom + (j.id === MOI ? ' (vous)' : ''), pts: String(j.pts), detail: j.bonnes + '/' + j.rep, cls: i === 0 ? 'is-top' : '' }; });
      base.rejouer = rejouerSalle; base.partager = function () { partager(textePartage(cl)); };
      base.gain = net.credit ? texteGain(net.credit.pts, net.credit.plafond, '') : ''; base.hasGain = !!net.credit; base.voirCartes = voirCartes;
      return base;
    }
    var q = e.q || { q: '', options: [] };
    var restantMs = hote ? (e.restant || 0) : Math.max(0, net.fin - Date.now()), reste = Math.ceil(restantMs / 1000);
    var rev = e.phase === 'rev' ? e.rev : null, nbRep = (e.repondus || []).length;
    base.question = e.phase === 'q'; base.revele = !!rev;
    base.num = 'Question ' + (e.i + 1) + ' / ' + e.total; base.theme = q.theme; base.q = q.q; base.sport = badgeSport(q.sport || '');
    base.chrono = e.chrono && e.phase === 'q'; base.reste = String(reste); base.chronoPct = Math.round(restantMs / (CHRONO * 10)) + '%'; base.urgent = reste <= 5 ? 'is-urgent' : '';
    base.options = (q.options || []).map(function (o) {
      var cls = rev ? (o === rev.bonne ? 'is-juste' : o === monRep ? 'is-faux' : 'is-off') : (monRep ? (o === monRep ? 'is-choisi' : 'is-off') : '');
      return { label: o, cls: cls, dis: rev || monRep ? 'true' : 'false', pick: function () { repondreReseau(o); } };
    });
    base.aRepondu = !!monRep && !rev; base.attenteRep = 'Réponse envoyée · ' + nbRep + ' sur ' + joueurs.length + ' ont répondu';
    if (rev) {
      var trouve = joueurs.filter(function (j) { return rev.choix[j.id] === rev.bonne; }).map(function (j) { return j.nom; });
      base.verdict = monRep === rev.bonne ? 'Bonne réponse !' : monRep ? 'Raté : c’était « ' + rev.bonne + ' »' : 'Pas de réponse : c’était « ' + rev.bonne + ' »';
      base.verdictCls = monRep === rev.bonne ? 'is-juste' : 'is-faux';
      base.why = rev.why || ''; base.hasWhy = !!rev.why;
      base.trouve = trouve.length ? 'Trouvé par ' + trouve.join(', ') : 'Personne n’a trouvé';
      base.suivant = questionSuivante; base.suivantLabel = e.i >= e.total - 1 ? 'Voir le classement' : 'Question suivante';
      base.attenteSuite = 'L’organisateur lance la question suivante…';
    }
    base.scores = cl.map(function (j) { return { nom: j.nom, pts: String(j.pts), cls: j.id === MOI ? 'is-on' : '' }; });
    return base;
  }

  /* ================= 2. Devine le joueur ================= */
  function serie(obj, gagne) {
    var n = 0, d = jour(); if (!obj[d] || !obj[d].fini) d = veille(d);
    while (obj[d] && obj[d].fini && (!gagne || gagne(obj[d]))) { n++; d = veille(d); }
    return n;
  }
  var ESSAIS = 6;
  function joueursJouables(D) {
    return (D.players || []).filter(function (p) { return p && p.name && p.name.split(' ').length >= 2 && (p.clubLabel || p.club) && p.role; });
  }
  function indices(p, D) {
    var club = (D.clubs || []).find(function (c) { return c.id === p.club; }) || {};
    var sport = p.sport || club.sport || '';
    var ville = p.ville || club.city || '';
    var noms = p.name.split(' ');
    var l = [];
    if (sport) l.push(['Discipline', sport]);
    l.push(['Rôle', p.role]);
    if (ville) l.push(['Ville du club', ville]);
    if (p.num && p.num !== '0') l.push(['Numéro', p.num]);
    if (p.clubLabel) l.push(['Club', p.clubLabel]);
    l.push(['Initiales', noms.map(function (x) { return x.charAt(0).toUpperCase() + '.'; }).join(' ')]);
    if (l.length < ESSAIS) l.push(['Prénom', noms[0]]);
    return l.slice(0, ESSAIS);
  }
  function valsDevine(s, ctx) {
    var d = jour(), pool = joueursJouables(ctx.D);
    if (!pool.length) return { has: false, vide: true };
    var p = pool[hash('devine:' + d) % pool.length];
    var etat = mem.devine[d] || (mem.devine[d] = { e: [], fini: false, gagne: false });
    if (etat.id && etat.id !== p.id) { etat.e = []; etat.fini = false; etat.gagne = false; }
    etat.id = p.id;
    var ind = indices(p, ctx.D);
    var nbVus = Math.min(ind.length, etat.fini ? ind.length : etat.e.length + 1);
    var saisie = s.jxDev || '';
    var noms = uniques(pool.map(function (x) { return x.name; })).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
    var tenter = function (essai) {
      if (etat.fini) return;
      var g = String(essai == null ? saisie : essai).trim(); if (!g) { dire('Écrivez un nom, ou touchez « Indice suivant ».'); return; }
      etat.e.push(g);
      if (norm(g) === norm(p.name)) { etat.fini = true; etat.gagne = true; etat.pts = ESSAIS + 1 - etat.e.length; etat.credit = crediter(etat.pts * POINTS_DEVINE, 'devine:' + d); }
      else if (etat.e.length >= ESSAIS) { etat.fini = true; etat.pts = 0; }
      save(); app.setState({ jxDev: '' });
    };
    var grille = etat.e.map(function (g) { return norm(g) === norm(p.name) ? '🟨' : '⬛'; }).join('');
    var reste = ESSAIS - etat.e.length;
    return {
      has: true, vide: false, fini: etat.fini, joue: !etat.fini, gagne: etat.gagne, perdu: etat.fini && !etat.gagne,
      indices: ind.slice(0, nbVus).map(function (x, k) { return { n: String(k + 1), k: x[0], v: x[1] }; }),
      caches: ind.slice(nbVus).map(function (x, k) { return { n: String(nbVus + k + 1) }; }),
      essais: etat.e.filter(function (g) { return g !== '—' && norm(g) !== norm(p.name); }).map(function (g) { return { nom: g }; }), hasEssais: etat.e.some(function (g) { return g !== '—' && norm(g) !== norm(p.name); }),
      reste: reste + ' essai' + (reste > 1 ? 's' : '') + ' restant' + (reste > 1 ? 's' : ''),
      saisie: saisie, onSaisie: function (e) { app.setState({ jxDev: e.target.value }); },
      onTouche: function (e) { if (e && e.key === 'Enter') { e.preventDefault(); tenter(e.target.value); } },
      valider: function () { tenter(); }, passer: function () { tenter('—'); },
      noms: noms.map(function (n) { return { n: n }; }),
      nom: p.name, role: p.role, club: p.clubLabel || '', img: p.img || '', hasImg: !!p.img,
      fiche: function () { app.go('player', { playerId: p.id }); },
      pts: String(etat.pts || 0), resultat: etat.gagne ? 'Trouvé en ' + etat.e.length + ' essai' + (etat.e.length > 1 ? 's' : '') + ' : ' + (etat.pts || 0) + ' point' + ((etat.pts || 0) > 1 ? 's' : '') + '.' : 'Pas cette fois. Un nouveau joueur demain.',
      gain: etat.credit ? texteGain(etat.credit.pts, etat.credit.plafond, '') : '', hasGain: !!(etat.credit), voirCartes: voirCartes,
      serie: String(serie(mem.devine, function (x) { return x.gagne; })),
      partager: function () { partager('Devine le joueur · ' + d.split('-').reverse().slice(0, 2).join('/') + '\n' + (etat.gagne ? grille + ' trouvé en ' + etat.e.length + '/' + ESSAIS : grille + ' raté') + '\n' + adresse()); }
    };
  }

  /* ================= 3. Mes cartes : les points des jeux débloquent les cartes des joueurs des clubs ================= */
  // Les points gagnés au quiz et à Devine le joueur s'additionnent dans une cagnotte (sur l'appareil, par compte).
  // 100 points = 1 carte, au choix du club ; la carte rejoint l'album du club (même album que la pochette du jour).
  var PRIX_CARTE = 100, MAX_JOUR = 500, POINTS_DEVINE = 20;
  function clePts() { return 'cb-jeux-points:' + (app && app.profileKey ? app.profileKey() : 'compte'); }
  function cleAlbum() { return 'cb-album:' + (app && app.profileKey ? app.profileKey() : 'compte'); }
  function lireLS(k, d) { try { var v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
  function ecrireLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function cagnotte() {
    var v = lireLS(clePts(), {}) || {};
    return { solde: Math.max(0, +v.solde || 0), total: Math.max(0, +v.total || 0), cartes: Math.max(0, +v.cartes || 0), jour: v.jour || '', duJour: +v.duJour || 0,
      parties: Array.isArray(v.parties) ? v.parties : [], derniere: v.derniere || null };
  }
  // Ajoute des points (une seule fois par partie), dans la limite de MAX_JOUR par jour
  function crediter(pts, idPartie) {
    pts = Math.max(0, Math.round(+pts || 0));
    var c = cagnotte(), d = jour();
    if (idPartie && c.parties.indexOf(idPartie) >= 0) return { pts: 0, plafond: false, deja: true };
    if (c.jour !== d) { c.jour = d; c.duJour = 0; }
    var gain = Math.min(pts, Math.max(0, MAX_JOUR - c.duJour));
    c.solde += gain; c.total += gain; c.duJour += gain;
    if (idPartie) c.parties = c.parties.concat([idPartie]).slice(-80);
    ecrireLS(clePts(), c);
    if (gain > 0) dire('+' + gain + ' points pour vos cartes joueurs');
    return { pts: gain, plafond: gain < pts };
  }
  function texteGain(pts, plafond, nom) {
    var c = cagnotte(), n = Math.floor(c.solde / PRIX_CARTE);
    var t = (nom ? nom + ' : ' : '') + (pts > 0 ? '+' + pts + ' points pour vos cartes joueurs' : 'Pas de points cette fois');
    if (plafond) t += ' (limite de ' + MAX_JOUR + ' points par jour atteinte)';
    return t + ' · ' + (n > 0 ? n + ' carte' + (n > 1 ? 's' : '') + ' à débloquer' : 'encore ' + (PRIX_CARTE - c.solde % PRIX_CARTE) + ' points pour la prochaine carte');
  }
  function voirCartes() { if (app) { app.setState({ jxTab: 'cartes' }); try { var el = document.querySelector('.jx-tabs'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} } }
  function initiales(n) { return String(n || '').split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase(); }
  function debloquer(club, manquants) {
    var c = cagnotte();
    if (c.solde < PRIX_CARTE) { dire('Il faut ' + PRIX_CARTE + ' points pour débloquer une carte. Jouez au quiz ou à Devine le joueur.'); return; }
    if (!manquants.length) { dire('Vous avez déjà toutes les cartes de ' + club.name + '.'); return; }
    var p = manquants[Math.floor(Math.random() * manquants.length)];
    var alb = lireLS(cleAlbum(), {}) || {}, m = alb[club.id] && Array.isArray(alb[club.id].cartes) ? alb[club.id] : { cartes: [], jour: '' };
    if (m.cartes.indexOf(p.id) < 0) m.cartes = m.cartes.concat([p.id]);
    alb[club.id] = m; ecrireLS(cleAlbum(), alb);
    c.solde -= PRIX_CARTE; c.cartes += 1; c.derniere = { id: p.id, club: club.id, jour: jour() };
    ecrireLS(clePts(), c);
    dire('Nouvelle carte : ' + p.name);
    app.setState({ jxClub: club.id, albTick: (app.state.albTick || 0) + 1 }); rafraichir();
  }
  function valsCartes(s, ctx) {
    var D = ctx.D || {}, c = cagnotte(), follows = s.follows || [], suivis = s.followPlayers || [];
    var alb = lireLS(cleAlbum(), {}) || {};
    var aCarte = function (clubId, p) { var m = alb[clubId]; return (m && Array.isArray(m.cartes) && m.cartes.indexOf(p.id) >= 0) || suivis.indexOf(p.id) >= 0; };
    var clubs = (D.clubs || []).map(function (cl) {
      var joueurs = (D.players || []).filter(function (p) { return p.club === cl.id; });
      return { c: cl, joueurs: joueurs, manquants: joueurs.filter(function (p) { return !aCarte(cl.id, p); }), suivi: follows.indexOf(cl.id) >= 0 };
    }).filter(function (x) { return x.joueurs.length > 0; });
    clubs.sort(function (a, b) { return (b.suivi - a.suivi) || a.c.name.localeCompare(b.c.name, 'fr'); });
    var peut = c.solde >= PRIX_CARTE;
    var ligne = function (x) {
      var n = x.joueurs.length - x.manquants.length, complet = !x.manquants.length;
      return { name: x.c.name, how: [x.c.sport, x.c.city].filter(Boolean).join(' · '), logo: x.c.logo || '', hasLogo: !!x.c.logo, noLogo: !x.c.logo, ini: initiales(x.c.name),
        n: String(n), total: String(x.joueurs.length), pct: Math.round(n / x.joueurs.length * 100) + '%', suivi: x.suivi,
        complet: complet, peut: peut && !complet, bloque: !peut && !complet, cls: x.c.id === s.jxClub ? 'is-on' : '',
        btn: complet ? 'Album complet' : 'Débloquer · ' + PRIX_CARTE + ' pts', dis: complet || !peut ? 'true' : 'false',
        debloquer: function () { debloquer(x.c, x.manquants); },
        album: function () { app.go('club', { clubId: x.c.id, clubTab: 'album' }); } };
    };
    var vos = clubs.filter(function (x) { return x.suivi; }).map(ligne), autres = clubs.filter(function (x) { return !x.suivi; }).map(ligne);
    var der = null;
    if (c.derniere) {
      var p = (D.players || []).find(function (x) { return x.id === c.derniere.id; }), cl = (D.clubs || []).find(function (x) { return x.id === c.derniere.club; });
      if (p && cl) der = { name: p.name, role: p.role || '', club: cl.name, num: p.num || '', hasNum: !!p.num, img: p.img || '', hasImg: !!p.img, noImg: !p.img, ini: initiales(p.name),
        neuve: c.derniere.jour === jour(), neuveCls: c.derniere.jour === jour() ? 'is-neuve' : '', pasSuivi: follows.indexOf(cl.id) < 0,
        fiche: function () { app.go('player', { playerId: p.id }); }, album: function () { app.go('club', { clubId: cl.id, clubTab: 'album' }); },
        suivre: function () { app.toggleIn('follows', cl.id, 'Vous suivez ' + cl.name + ' : son album est ouvert', 'Vous ne suivez plus ' + cl.name); } };
    }
    var dj = c.jour === jour() ? c.duJour : 0;
    return {
      solde: String(c.solde), dispo: String(Math.floor(c.solde / PRIX_CARTE)), prix: String(PRIX_CARTE), max: String(MAX_JOUR), devine: String(POINTS_DEVINE),
      prochaine: c.solde >= PRIX_CARTE ? 'Vous pouvez débloquer ' + Math.floor(c.solde / PRIX_CARTE) + ' carte' + (Math.floor(c.solde / PRIX_CARTE) > 1 ? 's' : '') + ' : choisissez le club ci-dessous.' : 'Encore ' + (PRIX_CARTE - c.solde) + ' points pour débloquer une carte.',
      pct: (c.solde >= PRIX_CARTE ? 100 : Math.round(c.solde / PRIX_CARTE * 100)) + '%',
      total: String(c.total), cartes: String(c.cartes), aujourdhui: dj + ' / ' + MAX_JOUR + ' points gagnés aujourd’hui',
      der: der, hasDer: !!der,
      vos: vos, hasVos: vos.length > 0, pasVos: !vos.length, autres: autres, hasAutres: autres.length > 0, rien: !clubs.length,
      jouer: function () { app.setState({ jxTab: 'quiz' }); }
    };
  }

  /* ================= la page ================= */
  function vals(a, ctx) {
    app = a;
    var s = a.state, tab = s.jxTab === 'devine' || s.jxTab === 'cartes' ? s.jxTab : 'quiz';
    var cg = cagnotte();
    var ongl = [['quiz', 'Le quiz du bus', 'Foot, basket, hand, volley, hockey'], ['devine', 'Devine le joueur', '6 essais, 1 joueur par jour'], ['cartes', 'Mes cartes', cg.solde + ' points']];
    var dv = mem.devine[jour()];
    var Q = tab === 'quiz' ? valsQuiz(s) : {}, N = tab === 'quiz' ? valsReseau(s) : {};
    if (N.actif) { Q.reglage = false; Q.enJeu = false; Q.fini = false; }
    Q.reglageTour = !!(Q.reglage && Q.modeTour); Q.reglageReseau = !!(Q.reglage && Q.modeReseau);
    return {
      tabs: ongl.map(function (o) {
        var badge = o[0] === 'devine' && dv && dv.fini ? '✓' : o[0] === 'cartes' && cg.solde >= PRIX_CARTE ? String(Math.floor(cg.solde / PRIX_CARTE)) : '';
        return { label: o[1], sub: o[2], badge: badge, hasBadge: !!badge, cls: tab === o[0] ? 'is-on' : '', sel: tab === o[0] ? 'true' : 'false', go: function () { a.setState({ jxTab: o[0] }); } };
      }),
      isQuiz: tab === 'quiz', isDevine: tab === 'devine', isCartes: tab === 'cartes',
      pts: { solde: String(cg.solde), dispo: Math.floor(cg.solde / PRIX_CARTE), msg: cg.solde >= PRIX_CARTE ? Math.floor(cg.solde / PRIX_CARTE) + ' carte' + (cg.solde >= 2 * PRIX_CARTE ? 's' : '') + ' joueur à débloquer' : 'Encore ' + (PRIX_CARTE - cg.solde) + ' points pour une carte joueur', voir: voirCartes, show: tab !== 'cartes' },
      quiz: Q, net: N, devine: tab === 'devine' ? valsDevine(s, ctx) : {}, cartes: tab === 'cartes' ? valsCartes(s, ctx) : {}
    };
  }
  return { vals: vals, _banque: banque, _indices: indices, _selection: selection, _crediter: crediter, _cagnotte: cagnotte, PRIX_CARTE: PRIX_CARTE };
})();
