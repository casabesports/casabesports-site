/*!
 * Casa Besports — la rubrique « Jeux » de l'application (#/jeux)
 *
 *  1. Le Quiz foot : culture générale du football international (Coupe du monde, Euro, Ligue des champions,
 *     championnats et pays), tiré au hasard. Seul, ou à plusieurs en se passant le téléphone (trajets en bus) :
 *     chacun son tour, chrono de 20 s facultatif, points (10 par bonne réponse + bonus de rapidité), classement final.
 *     Questions : contenus/quiz-foot.js, plus celles ajoutées dans Admin › Contenus › « Jeux : questions du quiz ».
 *     Tout est dans l'appli : le quiz marche aussi sans réseau.
 *  2. Devine le joueur : un joueur du site par jour, 6 essais, un indice de plus à chaque erreur.
 *
 * Réglages, prénoms des joueurs et parties gardés sur l'appareil (localStorage « cb-jeux-v1 »). Rien n'est envoyé.
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

  /* ================= 1. Le Quiz foot : culture foot internationale, seul ou à plusieurs ================= */
  var CHRONO = 20, MAX_JOUEURS = 10;
  var reglages = (function () { var r = mem.quizReg || {}; return { themes: Array.isArray(r.themes) ? r.themes : [], joueurs: Array.isArray(r.joueurs) ? r.joueurs.slice(0, MAX_JOUEURS) : [], parJoueur: [3, 5, 10].indexOf(r.parJoueur) >= 0 ? r.parJoueur : 5, chrono: r.chrono !== false }; })();
  function garderReglages() { mem.quizReg = reglages; save(); }
  if (!Array.isArray(mem.vus)) mem.vus = [];
  var partie = null, minuteur = null;
  function themes() { var t = Array.isArray(window.CASA_QUIZ_FOOT_THEMES) ? window.CASA_QUIZ_FOOT_THEMES.slice() : []; if (questionsRedaction().length) t.push({ id: 'redaction', label: 'Questions de la rédaction' }); return t; }
  function questionsRedaction() {
    return (Array.isArray(window.CASA_QUIZ) ? window.CASA_QUIZ : []).filter(function (q) { return q && q.actif !== false && q.question && q.bonne && (q.faux1 || q.faux2 || q.faux3); })
      .map(function (q, i) { return { id: 'r-' + (q.id || i), theme: 'redaction', q: q.question, bonne: q.bonne, faux: [q.faux1, q.faux2, q.faux3].filter(Boolean), why: q.explication || '' }; });
  }
  function banque() {
    return (Array.isArray(window.CASA_QUIZ_FOOT) ? window.CASA_QUIZ_FOOT : []).filter(function (x) { return Array.isArray(x) && x[1] && x[2]; })
      .map(function (x) { return { id: 'f-' + hash(x[1]).toString(36), theme: x[0], q: x[1], bonne: x[2], faux: [x[3], x[4], x[5]].filter(Boolean), why: x[6] || '' }; })
      .concat(questionsRedaction());
  }
  function arreterMinuteur() { if (minuteur) { clearInterval(minuteur); minuteur = null; } }
  function lancerMinuteur() {
    arreterMinuteur(); if (!reglages.chrono) return;
    minuteur = setInterval(function () {
      if (!partie || partie.fini || partie.reponse != null) return;
      if (!app || app.state.view !== 'jeux') return;
      if (Date.now() - partie.debut >= CHRONO * 1000) repondre('__temps'); else rafraichir();
    }, 1000);
  }
  function demarrer() {
    var r = Math.random, choix = reglages.themes, vus = {};
    mem.vus.forEach(function (id) { vus[id] = 1; });
    var pool = banque().filter(function (q) { return !choix.length || choix.indexOf(q.theme) >= 0; });
    if (!pool.length) { dire('Aucune question dans ces thèmes.'); return; }
    // d'abord les questions pas encore vues sur cet appareil, puis les autres
    var neuves = melange(pool.filter(function (q) { return !vus[q.id]; }), r), deja = melange(pool.filter(function (q) { return vus[q.id]; }), r);
    var joueurs = reglages.joueurs.length ? reglages.joueurs : ['Vous'];
    var n = Math.min(pool.length, joueurs.length * reglages.parJoueur);
    var qs = neuves.concat(deja).slice(0, n).map(function (q) { return Object.assign({}, q, { options: melange([q.bonne].concat(q.faux), r) }); });
    partie = { qs: qs, tour: 0, reponse: null, debut: Date.now(), fini: false, solo: !reglages.joueurs.length, joueurs: joueurs.map(function (nom) { return { nom: nom, pts: 0, bonnes: 0, rep: 0 }; }) };
    lancerMinuteur(); rafraichir();
    try { var el = document.querySelector('.jx-tabs'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
  }
  function joueurCourant() { return partie.joueurs[partie.tour % partie.joueurs.length]; }
  function repondre(o) {
    if (!partie || partie.fini || partie.reponse != null) return;
    var q = partie.qs[partie.tour], j = joueurCourant();
    partie.reponse = o; j.rep++;
    if (o === q.bonne) { j.bonnes++; var reste = Math.max(0, CHRONO - Math.floor((Date.now() - partie.debut) / 1000)); j.pts += reglages.chrono ? 10 + Math.round(reste / 2) : 10; }
    mem.vus = mem.vus.filter(function (id) { return id !== q.id; }).concat([q.id]).slice(-400); save();
    rafraichir();
  }
  function suivant() {
    if (!partie) return;
    partie.tour++; partie.reponse = null; partie.debut = Date.now();
    if (partie.tour >= partie.qs.length) { partie.fini = true; arreterMinuteur(); }
    rafraichir();
    try { var el = document.querySelector('.jx-tabs'); if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' }); } catch (e) {}
  }
  function quitter() { partie = null; arreterMinuteur(); rafraichir(); }
  function ajouterJoueur(nom) {
    nom = String(nom || '').trim().replace(/\s+/g, ' ').slice(0, 20); if (!nom) return;
    if (reglages.joueurs.length >= MAX_JOUEURS) { dire(MAX_JOUEURS + ' joueurs au maximum.'); return; }
    if (reglages.joueurs.some(function (x) { return norm(x) === norm(nom); })) { dire(nom + ' est déjà dans la partie.'); return; }
    reglages.joueurs.push(nom); garderReglages(); app.setState({ jxNom: '' });
  }
  var MEDAILLES = ['🥇', '🥈', '🥉'];
  function valsQuiz(s) {
    var th = themes(), tout = banque();
    var compte = {}; tout.forEach(function (q) { compte[q.theme] = (compte[q.theme] || 0) + 1; });
    if (!partie) {
      var nbJ = reglages.joueurs.length;
      return {
        reglage: true, enJeu: false, fini: false, total: String(tout.length),
        themes: [{ id: '', label: 'Tout mélanger', n: tout.length }].concat(th.map(function (t) { return { id: t.id, label: t.label, n: compte[t.id] || 0 }; })).filter(function (t) { return t.n > 0; }).map(function (t) {
          var on = t.id ? reglages.themes.indexOf(t.id) >= 0 : !reglages.themes.length;
          return { label: t.label, n: String(t.n), cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () {
            if (!t.id) reglages.themes = []; else if (on) reglages.themes = reglages.themes.filter(function (x) { return x !== t.id; }); else reglages.themes = reglages.themes.concat([t.id]);
            garderReglages(); rafraichir(); } };
        }),
        joueurs: reglages.joueurs.map(function (nom, i) { return { nom: nom, retirer: function () { reglages.joueurs.splice(i, 1); garderReglages(); rafraichir(); }, aria: 'Retirer ' + nom }; }),
        hasJoueurs: nbJ > 0, solo: nbJ === 0,
        nom: s.jxNom || '', onNom: function (e) { app.setState({ jxNom: e.target.value }); },
        onTouche: function (e) { if (e && e.key === 'Enter') { e.preventDefault(); ajouterJoueur(e.target.value); } },
        ajouter: function () { ajouterJoueur(s.jxNom); },
        nbs: [3, 5, 10].map(function (n) { var on = reglages.parJoueur === n; return { label: String(n), cls: on ? 'is-on' : '', sel: on ? 'true' : 'false', pick: function () { reglages.parJoueur = n; garderReglages(); rafraichir(); } }; }),
        nbLabel: nbJ > 1 ? 'Questions par joueur' : 'Nombre de questions',
        chrono: reglages.chrono, chronoLabel: reglages.chrono ? 'Chrono ' + CHRONO + ' s : activé' : 'Chrono : désactivé', chronoPressed: reglages.chrono ? 'true' : 'false',
        basculerChrono: function () { reglages.chrono = !reglages.chrono; garderReglages(); rafraichir(); },
        resume: (nbJ > 1 ? nbJ + ' joueurs · ' + nbJ * reglages.parJoueur + ' questions, chacun son tour' : nbJ === 1 ? reglages.joueurs[0] + ' · ' + reglages.parJoueur + ' questions' : 'En solo · ' + reglages.parJoueur + ' questions'),
        lancer: demarrer
      };
    }
    var classement = partie.joueurs.slice().sort(function (a, b) { return b.pts - a.pts || b.bonnes - a.bonnes; });
    if (partie.fini) {
      var meilleur = classement[0];
      return {
        reglage: false, enJeu: false, fini: true, solo: partie.solo, multi: !partie.solo,
        titre: partie.solo ? meilleur.bonnes + ' bonne' + (meilleur.bonnes > 1 ? 's' : '') + ' réponse' + (meilleur.bonnes > 1 ? 's' : '') + ' sur ' + meilleur.rep : meilleur.nom + ' gagne !',
        sous: partie.solo ? meilleur.pts + ' points' : 'avec ' + meilleur.pts + ' points',
        podium: classement.map(function (j, i) { return { rang: MEDAILLES[i] || String(i + 1), nom: j.nom, pts: String(j.pts), detail: j.bonnes + '/' + j.rep, cls: i === 0 ? 'is-top' : '' }; }),
        rejouer: demarrer, reglages: quitter,
        partager: function () { partager('Quiz foot BE+ ⚽\n' + classement.map(function (j, i) { return (MEDAILLES[i] || (i + 1) + '.') + ' ' + j.nom + ' : ' + j.pts + ' pts (' + j.bonnes + '/' + j.rep + ')'; }).join('\n') + '\n' + adresse()); }
      };
    }
    var q = partie.qs[partie.tour], j = joueurCourant(), rep = partie.reponse, repondu = rep != null;
    var ecoule = Math.min(CHRONO, (Date.now() - partie.debut) / 1000), reste = Math.max(0, Math.ceil(CHRONO - ecoule));
    var thLab = (th.find(function (t) { return t.id === q.theme; }) || {}).label || '';
    var prochain = partie.joueurs[(partie.tour + 1) % partie.joueurs.length];
    var dernier = partie.tour >= partie.qs.length - 1;
    return {
      reglage: false, enJeu: true, fini: false, solo: partie.solo, multi: !partie.solo,
      tourDe: j.nom, num: 'Question ' + (partie.tour + 1) + ' / ' + partie.qs.length, theme: thLab, q: q.q,
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
      if (norm(g) === norm(p.name)) { etat.fini = true; etat.gagne = true; etat.pts = ESSAIS + 1 - etat.e.length; }
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
      serie: String(serie(mem.devine, function (x) { return x.gagne; })),
      partager: function () { partager('Devine le joueur · ' + d.split('-').reverse().slice(0, 2).join('/') + '\n' + (etat.gagne ? grille + ' trouvé en ' + etat.e.length + '/' + ESSAIS : grille + ' raté') + '\n' + adresse()); }
    };
  }

  /* ================= la page ================= */
  function vals(a, ctx) {
    app = a;
    var s = a.state, tab = s.jxTab === 'devine' ? 'devine' : 'quiz';
    var ongl = [['quiz', 'Quiz foot', 'Seul ou à plusieurs'], ['devine', 'Devine le joueur', '6 essais, 1 joueur par jour']];
    var dv = mem.devine[jour()];
    return {
      tabs: ongl.map(function (o) {
        var badge = o[0] === 'devine' && dv && dv.fini ? '✓' : '';
        return { label: o[1], sub: o[2], badge: badge, hasBadge: !!badge, cls: tab === o[0] ? 'is-on' : '', sel: tab === o[0] ? 'true' : 'false', go: function () { a.setState({ jxTab: o[0] }); } };
      }),
      isQuiz: tab === 'quiz', isDevine: tab === 'devine',
      quiz: tab === 'quiz' ? valsQuiz(s) : {}, devine: tab === 'devine' ? valsDevine(s, ctx) : {}
    };
  }
  return { vals: vals, _banque: banque, _indices: indices };
})();
