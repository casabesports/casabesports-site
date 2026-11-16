/*!
 * Casa Besports — la rubrique « Jeux » de l'application (#/jeux)
 *
 *  1. Le Prono du week-end : le score exact des matchs des clubs suivis, avant le coup d'envoi.
 *     3 points pour le score exact, 1 point pour le bon vainqueur (ou le nul). Classement du mois entre abonnés.
 *  2. Le Quiz de la Marée : 5 questions par jour, les mêmes pour tout le monde, une seule partie par jour.
 *     Les questions viennent des fiches du site (clubs, joueurs, stades) et de celles ajoutées dans
 *     Admin › Contenus › Quiz. Rien n'est inventé : une question n'existe que si la réponse est sur le site.
 *  3. Devine le joueur : un joueur du site à retrouver en 6 essais, un indice de plus à chaque erreur.
 *
 * Les parties sont gardées sur l'appareil (localStorage « cb-jeux-v1 »).
 * Les pronos des abonnés connectés sont aussi envoyés dans Supabase (table jeux_pronos, supabase/jeux.sql),
 * ce qui permet le classement commun. Sans ce réglage, chacun voit ses propres points.
 * Guide : docs/JEUX.md
 */
var CasaJeux = (function () {
  'use strict';
  var KEY = 'cb-jeux-v1';
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var mem = (function () { try { var v = JSON.parse(localStorage.getItem(KEY) || '{}'); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } })();
  ['pronos', 'quiz', 'devine'].forEach(function (k) { if (!mem[k] || typeof mem[k] !== 'object') mem[k] = {}; });
  function save() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }

  var norm = function (t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var isoDay = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var jour = function () { return isoDay(new Date()); };
  var veille = function (iso) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() - 1); return isoDay(d); };
  var jourLabel = function (iso) { var d = new Date(iso + 'T12:00:00'); if (isNaN(d)) return iso; var t = jour(); var dem = new Date(); dem.setDate(dem.getDate() + 1);
    if (iso === t) return 'Aujourd’hui'; if (iso === isoDay(dem)) return 'Demain'; var s = JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()]; return s.charAt(0).toUpperCase() + s.slice(1); };
  // Tirage identique pour tout le monde le même jour
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function melange(arr, r) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function uniques(arr) { var seen = {}, out = []; arr.forEach(function (x) { var k = norm(x); if (x && k && !seen[k]) { seen[k] = 1; out.push(x); } }); return out; }

  var app = null;
  function rafraichir() { if (app) app.setState({ jxT: Date.now() }); }
  function dire(t) { if (app && app.say) app.say(t); }
  function auth() { var A = window.CasaAuth; return A && A.on && A.user && A.db ? A : null; }
  function partager(texte) {
    try { if (navigator.share) { navigator.share({ text: texte }).catch(function () {}); return; } } catch (e) {}
    try { navigator.clipboard.writeText(texte).then(function () { dire('Résultat copié : collez-le où vous voulez'); }, function () { dire(texte); }); } catch (e) { dire(texte); }
  }
  function adresse() { try { var u = window.CASA_SITE_URL; return (u && /^https?:/.test(u) ? u.replace(/\/$/, '') : location.origin) + '/#/jeux'; } catch (e) { return ''; } }

  /* ================= 1. Le Prono du week-end ================= */
  var POINTS_EXACT = 3, POINTS_VAINQUEUR = 1;
  function coupEnvoi(m) { var d = new Date(m.date + 'T' + (/^\d\d:\d\d$/.test(m.time || '') ? m.time : '12:00') + ':00'); return isNaN(d) ? null : d; }
  function sens(a, b) { return a > b ? 1 : a < b ? -1 : 0; }
  function points(p, m) {
    if (!p || p.d === '' || p.e === '' || p.d == null || p.e == null || m.hs == null || m.as == null) return null;
    if (+p.d === +m.hs && +p.e === +m.as) return POINTS_EXACT;
    return sens(+p.d, +p.e) === sens(+m.hs, +m.as) ? POINTS_VAINQUEUR : 0;
  }
  var envois = {};
  function pseudo(A) { var n = String((A.user && A.user.name) || '').trim().split(/\s+/); return n[0] ? (n[0] + (n[1] ? ' ' + n[1].charAt(0).toUpperCase() + '.' : '')).slice(0, 40) : 'Supporter ' + String(A.user.id || '').slice(0, 4).toUpperCase(); }
  function envoyer(mid, m) {
    var A = auth(); if (!A) return;
    clearTimeout(envois[mid]);
    envois[mid] = setTimeout(function () {
      var p = mem.pronos[mid], k = coupEnvoi(m); if (!k || k <= new Date()) return;
      var vide = !p || p.d === '' || p.e === '';
      A.db(function (c) {
        return vide ? c.from('jeux_pronos').delete().eq('user_id', A.user.id).eq('match_id', mid)
          : c.from('jeux_pronos').upsert({ user_id: A.user.id, match_id: mid, dom: +p.d, ext: +p.e, pseudo: pseudo(A), debut: k.toISOString(), maj: new Date().toISOString() }, { onConflict: 'user_id,match_id' });
      }).then(function (r) { if (r && r.error) throw r.error; }).catch(function () { classement.absent = true; });
    }, 900);
  }
  // Classement du mois : les pronos des abonnés sur les matchs du mois déjà joués (lisibles après le coup d'envoi seulement)
  var classement = { cle: '', quand: 0, lignes: null, charge: false, absent: false };
  function chargerClassement(cle, ids, resultats) {
    var A = auth(); if (!A || !ids.length || classement.charge) return;
    if (classement.cle === cle && Date.now() - classement.quand < 120000) return;
    classement.charge = true;
    A.db(function (c) { return c.from('jeux_pronos').select('user_id, pseudo, match_id, dom, ext').in('match_id', ids.slice(0, 300)).limit(20000); }).then(function (r) {
      if (r && r.error) throw r.error;
      var rows = (r && r.data) || r || [], parUser = {};
      rows.forEach(function (x) {
        var m = resultats[x.match_id]; if (!m) return;
        var pts = points({ d: x.dom, e: x.ext }, m); if (pts == null) return;
        var u = parUser[x.user_id] || (parUser[x.user_id] = { id: x.user_id, pseudo: x.pseudo || 'Supporter', pts: 0, exacts: 0, n: 0 });
        u.pts += pts; u.n++; if (pts === POINTS_EXACT) u.exacts++;
      });
      classement.lignes = Object.keys(parUser).map(function (k) { return parUser[k]; }).sort(function (a, b) { return b.pts - a.pts || b.exacts - a.exacts || a.n - b.n; });
      classement.absent = false;
    }).catch(function () { classement.absent = true; classement.lignes = null; }).then(function () { classement.charge = false; classement.cle = cle; classement.quand = Date.now(); rafraichir(); });
  }
  // Une fois connecté : les pronos faits avant la connexion partent aussi dans le classement
  var dejaSynchro = '';
  function synchroLocale(matchsParId) {
    var A = auth(); if (!A || dejaSynchro === A.user.id) return; dejaSynchro = A.user.id;
    Object.keys(mem.pronos).forEach(function (mid) { var m = matchsParId[mid]; if (m) envoyer(mid, m); });
  }

  function valsProno(s, ctx) {
    var X = ctx.X, tc = X.teamClub || {}, maintenant = new Date(), t = jour();
    var nomEq = function (x) { var n = ctx.nomEquipe ? ctx.nomEquipe(x) : x; return String(n || '').replace(/&amp;/g, '&').replace(/&#(\d+);?/g, function (_, c) { return String.fromCharCode(+c); }); };
    // Les matchs « de chez nous » : une équipe reliée à un club de la liste Clubs du site, ou à un club de la Manche
    var proches = {}; (Array.isArray(window.CASA_CLUBS) ? window.CASA_CLUBS : []).forEach(function (c) { if (c && c.id) proches[c.id] = 1; });
    (ctx.D.clubs || []).forEach(function (c) { if (c && c.zone === 'Manche') proches[c.id] = 1; });
    var locaux = (X.matches || []).filter(function (m) { return m && m.id && m.date && (proches[tc[m.home]] || proches[tc[m.away]]); });
    var parId = {}; locaux.forEach(function (m) { parId[m.id] = m; });
    synchroLocale(parId);
    var ouverts = locaux.filter(function (m) { var k = coupEnvoi(m); return m.status === 'up' && k && k > maintenant; }).sort(function (a, b) { return coupEnvoi(a) - coupEnvoi(b); });
    // jusqu'au dimanche qui vient (le week-end en cours le dimanche)
    var dim = new Date(); dim.setDate(dim.getDate() + ((7 - dim.getDay()) % 7)); var lim = isoDay(dim);
    var semaine = ouverts.filter(function (m) { return m.date <= lim; });
    var aJouer = (semaine.length ? semaine : ouverts.slice(0, 16));
    var sports = uniques(aJouer.map(function (m) { return m.sport; }));
    var sp = s.jxSport && sports.indexOf(s.jxSport) >= 0 ? s.jxSport : 'Tous';
    var liste = aJouer.filter(function (m) { return sp === 'Tous' || m.sport === sp; }).slice(0, 40);
    var champ = function (m, cote) { return function (e) {
      var v = String((e && e.target && e.target.value) || '').replace(/[^0-9]/g, '').slice(0, 3);
      var p = mem.pronos[m.id] || { d: '', e: '' }; p[cote] = v; p.k = (coupEnvoi(m) || new Date()).toISOString(); mem.pronos[m.id] = p; save(); envoyer(m.id, m); rafraichir();
    }; };
    var parJour = {}; liste.forEach(function (m) { (parJour[m.date] = parJour[m.date] || []).push(m); });
    var jours = Object.keys(parJour).sort().map(function (d) {
      return { label: jourLabel(d), matchs: parJour[d].map(function (m) {
        var p = mem.pronos[m.id] || {}; var fait = p.d !== undefined && p.d !== '' && p.e !== undefined && p.e !== '';
        return { dom: nomEq(m.home), ext: nomEq(m.away), heure: m.time ? m.time.replace(':', ' h ') : 'Horaire à confirmer', sport: m.sport || '', d: p.d || '', e: p.e || '', fait: fait, cls: fait ? 'is-fait' : '',
          onD: champ(m, 'd'), onE: champ(m, 'e'), aria1: 'Buts ou points de ' + nomEq(m.home), aria2: 'Buts ou points de ' + nomEq(m.away) };
      }) };
    });
    // Mes résultats (matchs joués que j'avais pronostiqués)
    var joues = Object.keys(mem.pronos).map(function (id) { return parId[id]; }).filter(function (m) { return m && m.status === 'done' && m.hs != null; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var moisCle = t.slice(0, 7);
    var total = 0, totalMois = 0, exacts = 0;
    var mesRes = joues.map(function (m) { var pts = points(mem.pronos[m.id], m) || 0; total += pts; if (m.date.slice(0, 7) === moisCle) totalMois += pts; if (pts === POINTS_EXACT) exacts++;
      return { match: nomEq(m.home) + ' – ' + nomEq(m.away), score: m.hs + ' – ' + m.as, prono: mem.pronos[m.id].d + ' – ' + mem.pronos[m.id].e, pts: '+' + pts, cls: pts === POINTS_EXACT ? 'is-exact' : pts ? 'is-bon' : 'is-rate' }; });
    // Classement commun
    var A = auth(), resMois = {}, idsMois = [];
    locaux.forEach(function (m) { if (m.status === 'done' && m.hs != null && m.date.slice(0, 7) === moisCle) { resMois[m.id] = m; idsMois.push(m.id); } });
    if (A && s.jxTab !== 'quiz' && s.jxTab !== 'devine') chargerClassement(moisCle + ':' + idsMois.length, idsMois, resMois);
    var lignes = (classement.lignes || []).slice(0, 10).map(function (u, i) { return { rang: String(i + 1), pseudo: u.pseudo, pts: String(u.pts), exacts: u.exacts ? u.exacts + ' exact' + (u.exacts > 1 ? 's' : '') : '', moi: A && u.id === A.user.id ? 'is-moi' : '' }; });
    var monRang = A && classement.lignes ? classement.lignes.findIndex(function (u) { return u.id === A.user.id; }) : -1;
    return {
      jours: jours, has: jours.length > 0, vide: !jours.length,
      sports: (sports.length > 1 ? ['Tous'].concat(sports) : []).map(function (x) { return { label: x, cls: x === sp ? 'is-on' : '', sel: x === sp ? 'true' : 'false', pick: function () { app.setState({ jxSport: x }); } }; }),
      hasSports: sports.length > 1,
      nbFaits: String(Object.keys(mem.pronos).filter(function (id) { var m = parId[id]; var p = mem.pronos[id]; return m && m.status === 'up' && p.d !== '' && p.e !== ''; }).length),
      totalMois: String(totalMois), total: String(total), exacts: String(exacts), moisLabel: MOIS[new Date().getMonth()],
      mesRes: mesRes.slice(0, 8), hasRes: mesRes.length > 0,
      connecte: !!A, pasConnecte: !A, seConnecter: function () { app.setState({ loginOpen: true, linkSent: false }); },
      lignes: lignes, hasLignes: lignes.length > 0, rangLabel: monRang >= 0 ? 'Vous êtes ' + (monRang === 0 ? '1er' : (monRang + 1) + 'e') + ' sur ' + classement.lignes.length + '.' : '',
      classementVide: !!A && !classement.absent && classement.lignes && !classement.lignes.length,
      classementAbsent: !!A && classement.absent, chargement: !!A && classement.charge && !classement.lignes,
      bareme: 'Score exact : ' + POINTS_EXACT + ' points · Bon vainqueur ou bon nul : ' + POINTS_VAINQUEUR + ' point · Pronos fermés au coup d’envoi.'
    };
  }

  /* ================= 2. Le Quiz de la Marée ================= */
  var NB_Q = 5;
  // Les questions possibles, construites à partir des fiches du site
  function banqueQuestions(D) {
    var out = [], clubs = (D.clubs || []).filter(function (c) { return c && c.name; }), joueurs = (D.players || []).filter(function (p) { return p && p.name; });
    var r0 = rng(hash('banque'));
    var choisir = function (pool, bonne, n) { return melange(uniques(pool).filter(function (x) { return norm(x) !== norm(bonne); }), r0).slice(0, n); };
    // Questions écrites par la rédaction (Admin › Contenus › Quiz)
    (Array.isArray(window.CASA_QUIZ) ? window.CASA_QUIZ : []).forEach(function (q, i) {
      if (!q || q.actif === false || !q.question || !q.bonne) return;
      var faux = [q.faux1, q.faux2, q.faux3].filter(Boolean); if (faux.length < 1) return;
      out.push({ id: 'r-' + (q.id || i), type: 'redaction', q: q.question, bonne: q.bonne, faux: faux.slice(0, 3), why: q.explication || '' });
    });
    var suivis = {}; (Array.isArray(window.CASA_CLUBS) ? window.CASA_CLUBS : []).forEach(function (c) { if (c && c.id) suivis[c.id] = 1; });
    var villes = clubs.map(function (c) { return c.city; }).filter(Boolean);
    clubs.forEach(function (c) {
      if (c.city && norm(c.name).indexOf(norm(c.city)) < 0) { var f = choisir(villes, c.city, 3); if (f.length === 3) out.push({ id: 'cv-' + c.id, type: 'ville', q: 'Dans quelle commune joue ' + c.name + ' ?', bonne: c.city, faux: f, why: c.name + ' est basé à ' + c.city + '.' }); }
      // discipline : seulement les clubs de la liste Clubs du site (un club omnisports lu chez une fédération aurait plusieurs bonnes réponses)
      if (suivis[c.id] && c.sport && c.sport !== 'Multisport' && norm(c.name).indexOf(norm(c.sport).split(' ')[0]) < 0 && !/\b(fc|afc|football|foot|basket|basketball|bc|hand|handball|hb|hbc|rugby|rc|volley|vb|vbc|natation|tennis|tc|judo|hockey|water|polo|cyclisme|athletisme|ac)\b/.test(norm(c.name))) {
        var fs = choisir((D.sports || []).concat(clubs.map(function (x) { return x.sport; })).filter(function (x) { return x !== 'Multisport'; }), c.sport, 3);
        if (fs.length === 3) out.push({ id: 'cs-' + c.id, type: 'sport', q: 'Quel sport pratique-t-on au club ' + c.name + ' ?', bonne: c.sport, faux: fs, why: c.name + ' : ' + c.sport.toLowerCase() + (c.city ? ', à ' + c.city : '') + '.' });
      }
      var an = parseInt(c.fondation, 10);
      if (an > 1800 && an <= new Date().getFullYear()) { var r = rng(hash('an' + c.id)); var fa = uniques([an - 3 - Math.floor(r() * 8), an + 4 + Math.floor(r() * 9), an - 14 - Math.floor(r() * 10), an + 15 + Math.floor(r() * 8)].map(String)).filter(function (x) { return +x <= new Date().getFullYear() && x !== String(an); }).slice(0, 3);
        if (fa.length === 3) out.push({ id: 'cf-' + c.id, type: 'fondation', q: 'En quelle année a été fondé ' + c.name + ' ?', bonne: String(an), faux: fa, why: c.name + ' a été fondé en ' + an + '.' }); }
      if (c.stade) { var fst = choisir(clubs.map(function (x) { return x.stade; }).filter(Boolean), c.stade, 3); if (fst.length === 3) out.push({ id: 'cst-' + c.id, type: 'stade', q: 'Où ' + c.name + ' joue-t-il à domicile ?', bonne: c.stade, faux: fst, why: c.name + ' reçoit à ' + c.stade + '.' }); }
    });
    var labelsClubs = joueurs.map(function (p) { return p.clubLabel; }).filter(function (x) { return x && !/arbitr|district/i.test(x); });
    var POSTES = /^(attaquant|milieu|defenseur|gardien|entraineur|ailier|pivot|meneur|arriere|demi|pilier|talonneur|centre|ailiere|passeur|libero|receptionneur|pointu|central)/;
    joueurs.forEach(function (p) {
      if (p.clubLabel && p.club && !/arbitr|district/i.test(p.clubLabel)) { var f = choisir(labelsClubs, p.clubLabel, 3); if (f.length === 3) out.push({ id: 'pc-' + p.id, type: 'club', q: 'Pour quel club joue ' + p.name + ' ?', bonne: p.clubLabel, faux: f, why: p.name + (p.role ? ' (' + p.role.toLowerCase() + ')' : '') + ' joue à ' + p.clubLabel + '.', joueur: p.id }); }
      if (p.role && POSTES.test(norm(p.role))) { var memeSport = joueurs.filter(function (x) { return (x.sport || '') === (p.sport || '') && x.role && POSTES.test(norm(x.role)); }).map(function (x) { return x.role; });
        var fr = choisir(memeSport, p.role, 3); if (fr.length === 3) out.push({ id: 'pr-' + p.id, type: 'poste', q: 'À quel poste joue ' + p.name + (p.clubLabel ? ' (' + p.clubLabel + ')' : '') + ' ?', bonne: p.role, faux: fr, why: p.name + ' est ' + p.role.toLowerCase() + '.', joueur: p.id }); }
    });
    return out;
  }
  function questionsDuJour(D, d) {
    var banque = banqueQuestions(D); if (!banque.length) return [];
    var r = rng(hash('quiz:' + d));
    var red = melange(banque.filter(function (q) { return q.type === 'redaction'; }), r).slice(0, 2);
    var types = {}; banque.forEach(function (q) { if (q.type !== 'redaction') (types[q.type] = types[q.type] || []).push(q); });
    var ordre = melange(Object.keys(types), r), choix = red.slice(), i = 0;
    while (choix.length < NB_Q && ordre.length && i < 40) { var tl = types[ordre[i % ordre.length]]; var q = tl[Math.floor(r() * tl.length)]; if (choix.indexOf(q) < 0) choix.push(q); i++; }
    return melange(choix, r).slice(0, NB_Q).map(function (q, k) { return Object.assign({}, q, { options: melange([q.bonne].concat(q.faux), rng(hash(d + q.id + k))) }); });
  }
  function serie(obj, gagne) {
    var n = 0, d = jour(); if (!obj[d] || !obj[d].fini) d = veille(d);
    while (obj[d] && obj[d].fini && (!gagne || gagne(obj[d]))) { n++; d = veille(d); }
    return n;
  }
  function valsQuiz(s, ctx) {
    var d = jour(), qs = questionsDuJour(ctx.D, d);
    var etat = mem.quiz[d] || (mem.quiz[d] = { r: [], fini: false });
    var bonnes = etat.r.filter(function (x, k) { return qs[k] && x === qs[k].bonne; }).length;
    // la réponse qui vient d'être donnée reste affichée jusqu'à « Question suivante »
    var enCours = s.jxVu != null && s.jxVu === etat.r.length - 1 ? s.jxVu : (etat.r.length < qs.length ? etat.r.length : -1);
    var q = enCours >= 0 ? qs[enCours] : null;
    var repondu = !!q && enCours < etat.r.length;
    var grille = qs.map(function (x, k) { return k < etat.r.length ? (etat.r[k] === x.bonne ? '🟨' : '⬛') : '·'; }).join('');
    return {
      has: qs.length > 0, vide: !qs.length, fini: qs.length > 0 && !q, joue: !!q,
      num: 'Question ' + (enCours + 1) + ' sur ' + qs.length, q: q ? q.q : '', pct: Math.round(etat.r.length / Math.max(1, qs.length) * 100) + '%',
      options: q ? q.options.map(function (o) {
        var choisi = repondu && etat.r[enCours] === o, juste = o === q.bonne;
        return { label: o, cls: repondu ? (juste ? 'is-juste' : choisi ? 'is-faux' : 'is-off') : '', dis: repondu ? 'true' : 'false',
          pick: function () { if (repondu || etat.fini) return; etat.r.push(o); if (etat.r.length >= qs.length) { etat.fini = true; etat.pts = etat.r.filter(function (x, k) { return x === qs[k].bonne; }).length; } save(); app.setState({ jxVu: enCours }); } };
      }) : [],
      repondu: repondu, verdict: repondu ? (etat.r[enCours] === q.bonne ? 'Bonne réponse' : 'Raté : c’était « ' + q.bonne + ' »') : '', verdictCls: repondu && etat.r[enCours] === q.bonne ? 'is-juste' : 'is-faux',
      why: repondu ? q.why : '', hasWhy: repondu && !!q.why,
      suivant: function () { app.setState({ jxVu: null }); }, suivantLabel: enCours >= qs.length - 1 ? 'Voir mon score' : 'Question suivante',
      score: bonnes + ' / ' + qs.length, grille: grille, serie: String(serie(mem.quiz)),
      message: bonnes === qs.length ? 'Sans faute. Le Cotentin n’a plus de secret pour vous.' : bonnes >= 3 ? 'Belle marée ! Revenez demain pour 5 nouvelles questions.' : 'La mer remonte demain : 5 nouvelles questions vous attendent.',
      corrige: qs.map(function (x, k) { var ok = etat.r[k] === x.bonne; return { q: x.q, rep: x.bonne, cls: ok ? 'is-juste' : 'is-faux', mark: ok ? '✓' : '✗' }; }),
      partager: function () { partager('Quiz de la Marée · ' + d.split('-').reverse().slice(0, 2).join('/') + '\n' + grille + ' ' + bonnes + '/' + qs.length + '\n' + adresse()); }
    };
  }

  /* ================= 3. Devine le joueur ================= */
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
    var s = a.state, tab = s.jxTab === 'quiz' || s.jxTab === 'devine' ? s.jxTab : 'prono';
    var ongl = [['prono', 'Le Prono', 'Les scores du week-end'], ['quiz', 'Le Quiz', '5 questions par jour'], ['devine', 'Devine le joueur', '6 essais, 1 joueur']];
    var aujourdHui = jour(), qz = mem.quiz[aujourdHui], dv = mem.devine[aujourdHui];
    return {
      tabs: ongl.map(function (o) {
        var badge = o[0] === 'quiz' ? (qz && qz.fini ? '✓' : '') : o[0] === 'devine' ? (dv && dv.fini ? '✓' : '') : '';
        return { label: o[1], sub: o[2], badge: badge, hasBadge: !!badge, cls: tab === o[0] ? 'is-on' : '', sel: tab === o[0] ? 'true' : 'false', go: function () { a.setState({ jxTab: o[0], jxVu: null }); try { var el = document.querySelector('.jx-tabs'); if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} } };
      }),
      isProno: tab === 'prono', isQuiz: tab === 'quiz', isDevine: tab === 'devine',
      prono: tab === 'prono' ? valsProno(s, ctx) : {}, quiz: tab === 'quiz' ? valsQuiz(s, ctx) : {}, devine: tab === 'devine' ? valsDevine(s, ctx) : {},
      date: jourLabel(aujourdHui)
    };
  }
  return { vals: vals, _points: points, _questions: questionsDuJour, _indices: indices };
})();
