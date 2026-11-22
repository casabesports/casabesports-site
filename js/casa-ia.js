/*
 * Casa IA — connaissances ajoutées à l'assistant (moteur intégré, gratuit).
 *
 * L'assistant (js/app.js › aiRespond) appelle :
 *   CasaIA.avant(app, question) : en premier, pour Casa Besports, les niveaux de compétition, vos réponses (FAQ),
 *                                 les équipes et les championnats lus sur les sites des fédérations ;
 *   CasaIA.apres(app, question) : quand rien d'autre n'a répondu. Cherche dans Wikipédia (français), ou demande
 *                                 au mode connecté (fonction serveur « casa-ia ») s'il est activé dans js/config.js.
 * Les textes et la pyramide des compétitions se modifient dans contenus/casa-ia.js.
 * Règle : ne rien inventer. Chaque réponse vient du site, de Wikipédia (cité) ou du mode connecté (sources citées).
 */
window.CasaIA = (function () {
  var n = function (x) { return String(x || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' '); };
  var K = function () { return window.CASA_IA || {}; };
  var act = function (label, run) { return { label: label, run: run }; };
  var ouvrir = function (url) { return function () { try { window.open(url, '_blank', 'noopener'); } catch (e) {} }; };
  var dateFr = function (d) { if (!d) return 'date à confirmer'; var p = String(d).split('-'); return p.length === 3 ? p[2] + '/' + p[1] : d; };

  // ---------- Disciplines citées dans la question ----------
  var SPORTS = [
    ['Football', /\bfoot(ball)?\b|\bsoccer\b/], ['Basketball', /\bbasket(ball)?\b/], ['Handball', /\bhand(ball)?\b/],
    ['Volley-ball', /\bvolley/], ['Rugby', /\brugby\b/], ['Water-polo', /water.?polo/]
  ];
  var sportDe = function (q) { var s = SPORTS.find(function (x) { return x[1].test(q); }); return s ? s[0] : null; };
  var ZONES = [['Manche', /\bmanche\b|cotentin|cherbourg|departement/], ['Calvados', /calvados|\bcaen\b/], ['Orne', /\borne\b|alencon/], ['Eure', /\beure\b|evreux/],
    ['Seine-Maritime', /seine.?maritime|rouen|\bhavre\b/], ['Normandie', /normandie|regional|\bligue\b/], ['National', /\bnational/]];
  var zoneDe = function (q) { var z = ZONES.find(function (x) { return x[1].test(q); }); return z ? z[0] : null; };

  // ---------- 1. Casa Besports : qui sommes-nous ----------
  function identite(app, q) {
    var casa = /casa ?b(e|ee)?sports?|casabesport|\bbe ?\+|\bbe plus\b/.test(q);
    var qui = /\bqui\b|c est quoi|qu est.ce|presente|histoire|fondat|fonde|cree|createur|depuis quand|origine|a propos|kader|allou|contact|joindre/.test(q);
    var kader = /kader|allou|fondateur|createur/.test(q);
    if (!(casa && qui) && !kader) return null;
    var A = window.CASA_APROPOS || {}, et = A.etapes || [];
    if (/contact|joindre|ecrire|mail/.test(q)) return { text: 'Pour joindre Casa Besports, le plus simple est le formulaire de la page Contact. Les mentions légales donnent aussi l’adresse e-mail de l’éditeur.', actions: [act('Page Contact', function () { app.go('contact'); })] };
    var lignes = [];
    if (kader) {
      et.forEach(function (e) { (e.paragraphes || []).forEach(function (p) { if (/Kader Allou/.test(p)) lignes.push(p); }); });
      if (!lignes.length) return null;
      return { text: lignes.join('\n\n'), actions: [act('Lire notre histoire', function () { app.go('about'); })] };
    }
    if (/\bbe ?\+|\bbe plus\b/.test(q) && !/casa ?b/.test(q)) {
      var ab = (window.CASA_ABONNEMENTS || []).find(function (f) { return f && f.id === 'casab'; });
      return { text: 'BE+ est la signature de Casa Besports : le logo du site et de l’application, et le nom de l’abonnement' + (ab && ab.mois ? ' (' + String(ab.mois).replace('.', ',') + ' € par mois)' : '') + '.\n' + (A.intro || ''), actions: [act('Voir l’abonnement BE+', function () { app.go('offers'); }), act('Notre histoire', function () { app.go('about'); })] };
    }
    if (A.intro) lignes.push(A.intro);
    if (A.soustitre) lignes.push(A.soustitre);
    var naissance = et.find(function (e) { return /^\s*2024/.test(e.annee || ''); });
    if (naissance && naissance.paragraphes && naissance.paragraphes[0]) lignes.push(naissance.paragraphes[0]);
    if (et.length) lignes.push('Les grandes étapes :\n' + et.map(function (e) { return '• ' + e.annee + ' : ' + e.titre; }).join('\n'));
    if (!lignes.length) return null;
    return { text: lignes.join('\n\n'), actions: [act('Lire notre histoire', function () { app.go('about'); }), act('Nous contacter', function () { app.go('contact'); })] };
  }

  // ---------- 2. Vos réponses (contenus/casa-ia.js › faq) ----------
  function faq(app, q) {
    var f = (K().faq || []).find(function (x) { return x && (x.mots || []).some(function (m) { return m && q.indexOf(n(m)) >= 0; }); });
    if (!f || !f.reponse) return null;
    return { text: f.reponse, actions: f.lien ? [act('Ouvrir la page', function () { app.go(f.lien); })] : [] };
  }

  // ---------- 3. Niveaux de compétition, du département à l'international ----------
  var NIV = [['departemental', /departement|district|\bd[1-4]\b/], ['regional', /regional|\br[1-3]\b|ligue de normandie|pre.?nationale/], ['national', /national|\bn[1-3]\b|ligue 1|ligue 2|pro ?d2|top 14|elite/], ['international', /internation|mondial|coupe du monde|europe|euro\b|olymp|champions league|ligue des champions/]];
  var NOMS = { departemental: 'Départemental', regional: 'Régional', national: 'National', international: 'International' };
  function niveaux(app, q) {
    if (!/niveau|division|pyramide|echelon|hierarchie|comment (marche|fonctionne)|c est quoi (la|le) (r|n|d)[0-9]|categorie|monter|montee|descente/.test(q)) return null;
    var sp = sportDe(q) || 'Football', P = (K().niveaux || {})[sp];
    if (!P) return null;
    var cible = NIV.filter(function (x) { return x[1].test(q); }).map(function (x) { return x[0]; });
    var ordre = ['international', 'national', 'regional', 'departemental'];
    var blocs = ordre.filter(function (k) { return (P[k] || []).length && (!cible.length || cible.indexOf(k) >= 0); }).map(function (k) {
      return NOMS[k] + ' :\n' + P[k].map(function (x) { return '• ' + x; }).join('\n');
    });
    var txt = 'Les niveaux en ' + sp.toLowerCase() + ', du plus haut au plus bas :\n\n' + blocs.join('\n\n');
    if (P.coupes && !cible.length) txt += '\n\n' + P.coupes;
    if (P.feminin && !cible.length) txt += '\n\n' + P.feminin;
    txt += '\n\nChaque saison, les premiers montent et les derniers descendent d’un niveau.';
    var X = app.more(), cs = (X.comps[sp] || []).length;
    var acts = [];
    if (cs) acts.push(act('Championnats ' + sp + ' sur BE+', function () { app.go('live', { dSport: sp, dComp: X.comps[sp][0].id, dTab: 'table' }); }));
    return { text: txt, actions: acts };
  }

  // ---------- 4. Équipes et championnats (contenus/sport.js, sport-federations.js, admin › Résultats) ----------
  var GENERIQUES = ' handball hand ball volley volleyball football foot basket basketball rugby water polo sport sports club union association entente sportive sportif olympique athletic stade racing avenir jeunesse amicale equipe feminin feminine masculin masculine seniors senior jeunes classement prochain match resultat resultats score calendrier contre quand joue manche calvados orne eure normandie national nationale regional departemental championnat poule ';
  var INTENT_EQ = /classement|prochain|resultat|score|match|joue|calendrier|programme|place|position|rang|points|dernier|ce week|derby|equipe/;
  function index(app) {
    if (app._iaIdx && app._iaIdx.m === app.more()) return app._iaIdx;
    var X = app.more(), sportOfComp = {}, compOf = {};
    Object.keys(X.comps || {}).forEach(function (sp) { (X.comps[sp] || []).forEach(function (c) { sportOfComp[c.id] = sp; compOf[c.id] = c; }); });
    var teams = {};
    var add = function (t, comp) { if (!t) return; var k = n(t).replace(/[^a-z0-9]+/g, ' ').trim(); if (k.length < 3) return; (teams[k] = teams[k] || { name: t, comps: {} }).comps[comp] = 1; };
    Object.keys(X.tables || {}).forEach(function (c) { (X.tables[c] || []).forEach(function (r) { add(r.team, c); }); });
    (X.matches || []).forEach(function (m) { add(m.home, m.comp); add(m.away, m.comp); });
    app._iaIdx = { m: X, teams: teams, sportOfComp: sportOfComp, compOf: compOf };
    return app._iaIdx;
  }
  function equipes(app, q) {
    if (!INTENT_EQ.test(q)) return null;
    var I = index(app), X = app.more(), sp = sportDe(q), z = zoneDe(q);
    var mots = q.replace(/[^a-z0-9]+/g, ' ').split(' ').filter(function (w) { return w.length >= 4 && GENERIQUES.indexOf(' ' + w + ' ') < 0; });
    if (!mots.length) return null;
    var hits = Object.keys(I.teams).filter(function (k) {
      var t = I.teams[k];
      if (sp && !Object.keys(t.comps).some(function (c) { return I.sportOfComp[c] === sp; })) return false;
      if (q.indexOf(k.replace(/ \d$/, '')) >= 0) return true;
      var tw = k.split(' ');
      return mots.some(function (w) { return tw.indexOf(w) >= 0; });
    });
    if (!hits.length) return null;
    // les équipes premières (sans numéro) et seniors d'abord
    var senior = function (c) { var co = I.compOf[c] || {}; return co.niveau !== 'Jeunes' && !/^-\d|u\d|moins de/i.test(co.label || ''); };
    hits.sort(function (a, b) { return (/ \d$/.test(a) - / \d$/.test(b)) || a.length - b.length; });
    var lignes = [], acts = [], vus = 0;
    var jeunes = /jeune|-1\d|u1\d|moins de/.test(q);
    for (var i = 0; i < hits.length && vus < 3; i++) {
      var T = I.teams[hits[i]];
      var comps = Object.keys(T.comps).filter(function (c) { return (!sp || I.sportOfComp[c] === sp) && (!z || ((I.compOf[c] || {}).zone || '') === z || !(I.compOf[c] || {}).zone) && (jeunes ? !senior(c) : senior(c)); });
      if (!comps.length) continue;
      vus++;
      // d'abord les championnats avec un match à venir, les coupes et challenges ensuite
      var aVenir = function (c) { return X.matches.some(function (m) { return m.comp === c && m.status !== 'done' && (m.home === T.name || m.away === T.name); }) ? 0 : 1; };
      var coupe = function (c) { return /coupe|challenge|tournoi/i.test((I.compOf[c] || {}).label || '') ? 1 : 0; };
      comps.sort(function (a, b) { return (coupe(a) - coupe(b)) || (aVenir(a) - aVenir(b)); });
      comps.slice(0, 2).forEach(function (c) {
        if (lignes.length >= 3) return;
        var co = I.compOf[c] || { label: c }, spc = I.sportOfComp[c] || '';
        var tb = X.tables[c] || [], pos = tb.findIndex(function (r) { return r.team === T.name; });
        var ms = X.matches.filter(function (m) { return m.comp === c && (m.home === T.name || m.away === T.name); });
        var fait = ms.filter(function (m) { return m.status === 'done' && m.hs != null; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0];
        var avenir = ms.filter(function (m) { return m.status !== 'done'; }).sort(function (a, b) { return (a.date || '9') < (b.date || '9') ? -1 : 1; })[0];
        var l = T.name + ' · ' + spc + ' · ' + co.label + (co.zone ? ' (' + co.zone + ')' : '');
        if (pos >= 0) l += '\n• Classement : ' + (pos + 1) + (pos ? 'e' : 'er') + ' sur ' + tb.length + ', ' + tb[pos].pts + ' pts en ' + tb[pos].j + ' match' + (tb[pos].j > 1 ? 's' : '');
        if (fait) l += '\n• Dernier résultat (' + dateFr(fait.date) + ') : ' + fait.home + ' ' + fait.hs + '-' + fait.as + ' ' + fait.away;
        if (avenir) l += '\n• Prochain match : ' + dateFr(avenir.date) + (avenir.time ? ' à ' + avenir.time : '') + ', ' + avenir.home + ' – ' + avenir.away;
        lignes.push(l);
        if (acts.length < 2) acts.push(act('Ouvrir ' + co.label, function () { app.go('live', { dSport: spc, dComp: c, dTab: 'table' }); }));
      });
    }
    if (!lignes.length) return null;
    var src = hits.length > 1 ? '\n\nD’autres équipes portent un nom proche : précisez la discipline (« en handball ») ou la catégorie (« jeunes »).' : '';
    return { text: lignes.join('\n\n') + src + '\n\nDonnées officielles des fédérations, mises à jour automatiquement.', actions: acts };
  }
  function championnats(app, q) {
    if (!/classement|championnat|poule|calendrier|resultat|leader|en tete/.test(q)) return null;
    var sp = sportDe(q); if (!sp) return null;
    var X = app.more(), z = zoneDe(q), jeunes = /jeune|-1\d|u1\d|moins de/.test(q);
    var cs = (X.comps[sp] || []).filter(function (c) { return (X.tables[c.id] || []).length && (!z || c.zone === z) && (jeunes ? c.niveau === 'Jeunes' : c.niveau !== 'Jeunes'); });
    if (!cs.length) return null;
    var lignes = cs.slice(0, 6).map(function (c) { var t = X.tables[c.id]; return '• ' + c.label + (c.zone ? ' (' + c.zone + ')' : '') + ' : 1er ' + t[0].team + ', ' + t[0].pts + ' pts'; });
    return { text: 'Championnats ' + sp.toLowerCase() + (z ? ' · ' + z : '') + (jeunes ? ' · jeunes' : '') + ' (' + cs.length + ') :\n' + lignes.join('\n') + (cs.length > 6 ? '\n… et ' + (cs.length - 6) + ' autres dans Le Terrain.' : '') + '\n\nDemandez par exemple « classement de Tourlaville » pour une équipe précise.', actions: [act('Tous les classements', function () { app.go('live', { dSport: sp, dComp: cs[0].id, dTab: 'table' }); })] };
  }

  // ---------- 5. Questions générales : Wikipédia, ou le mode connecté ----------
  var VIDES = /^(dis.moi|dites.moi|explique.moi|expliquez.moi|parle.moi de|parlez.moi de|je voudrais savoir|sais.tu|savez.vous|connais.tu|connaissez.vous|est.ce que tu sais|c est quoi|qu est.ce que c est que|qu est.ce que|qu est.ce qu|qui est|qui sont|qui etait|qui a|qui ont|quand a eu lieu|ou a eu lieu|combien de|quel est|quelle est|quels sont|quelles sont|que signifie|definition de|histoire de|histoire du|histoire des)\s+/;
  function requete(raw) {
    var q = String(raw || '').replace(/[?!.]+$/g, '').trim();
    var b = n(q);
    var m = b.match(VIDES);
    if (m) q = q.slice(m[0].length);
    // les verbes de la question gênent la recherche : « qui a gagné la Coupe du monde 2022 » → « Coupe du monde 2022 »
    q = (' ' + q + ' ').replace(/\s(a|ont|gagn[ée]e?s?|remport[ée]e?s?|vainqueurs?|en|au|aux)(?=\s)/gi, ' ').replace(/\s+/g, ' ').trim();
    return q.replace(/^(le|la|les|l’|l'|un|une|des|du|de)\s+/i, '').trim();
  }
  function wikipedia(raw) {
    var q = requete(raw);
    if (q.length < 3) return Promise.resolve(null);
    var url = 'https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&generator=search&gsrlimit=6&gsrsearch=' + encodeURIComponent(q) +
      '&prop=extracts|info&exintro=1&explaintext=1&exsentences=5&inprop=url';
    return fetch(url).then(function (r) { if (!r.ok) throw new Error('wiki ' + r.status); return r.json(); }).then(function (d) {
      var pages = d && d.query && d.query.pages ? Object.keys(d.query.pages).map(function (k) { return d.query.pages[k]; }) : [];
      // mots importants de la question : l'article retenu doit tous les contenir (titre ou début du texte)
      var VIDE = ' les des une dans pour avec sur par qui que quoi est son ses aux the and ';
      var cles = n(q).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(function (w) { return w.length >= 2 && VIDE.indexOf(' ' + w + ' ') < 0 && !/^(le|la|de|du|un|et|en|au|il|on|y)$/.test(w); });
      var dans = function (x, w) { return new RegExp('(^|[^a-z0-9])' + (w.length > 4 ? w.replace(/s$/, '') : w + '([^a-z0-9]|$)')).test(x); };
      pages.forEach(function (x) { var t = n(x.title); x._t = cles.filter(function (w) { return dans(t, w); }).length; var tx = t + ' ' + n((x.extract || '').slice(0, 600)); x._ok = cles.filter(function (w) { return dans(tx, w); }).length >= Math.ceil(cles.length * 0.75) && cles.filter(function (w) { return /^\d{4}$/.test(w); }).every(function (w) { return dans(tx, w); }); });
      // site de sport : à égalité, l'article qui parle de sport passe devant (ex. « hors-jeu » : la règle, pas le film)
      var SPORT = /sport|football|rugby|basket|handball|volley|tennis|cyclis|athl[ée]t|olympi|championnat|comp[ée]tition|club|joueu|[ée]quipe|match|tournoi|f[ée]d[ée]ration|entra[iî]neur|stade/i;
      pages.forEach(function (x) { var d = (x.extract || '').slice(0, 300); x._s = /\b(film|roman|album|chanson|s[ée]rie t[ée]l[ée]vis[ée]e|jeu vid[ée]o|bande dessin[ée]e)\b/i.test(d.split('. ')[0]) ? -1 : SPORT.test(d) ? 1 : 0; });
      pages.sort(function (a, b) { return (b._s - a._s) || (b._t - a._t) || (a.index - b.index); });
      var p = pages.find(function (x) { return x._ok && x.extract && x.extract.length > 60 && !/peut d[ée]signer|peut faire r[ée]f[ée]rence/.test(x.extract); });
      if (!p) return null;
      var ex = p.extract.replace(/\s*\([^()]*\)/g, function (m) { return m.length > 60 ? '' : m; }).replace(/\n+/g, '\n').trim();
      return { text: ex + '\n\nSource : Wikipédia, article « ' + p.title + ' ». Pour les résultats du jour, voyez Le Terrain.', actions: [act('Lire sur Wikipédia', ouvrir(p.fullurl || ('https://fr.wikipedia.org/wiki/' + encodeURIComponent(p.title))))] };
    }).catch(function () { return { indispo: true }; });
  }
  // Résumé du site envoyé au mode connecté, pour qu'il connaisse Casa Besports
  function contexte(app) {
    var A = window.CASA_APROPOS || {};
    var et = (A.etapes || []).map(function (e) { return e.annee + ' : ' + e.titre + '. ' + (e.paragraphes || []).join(' '); }).join('\n');
    var D = app.data(), X = app.more();
    var sports = Object.keys(X.comps || {}).map(function (s) { return s + ' (' + (X.comps[s] || []).length + ' compétitions)'; }).join(', ');
    return ['Casa Besports : ' + (A.intro || '') + ' ' + (A.soustitre || ''), et, 'Disciplines suivies avec classements sur le site : ' + sports, 'Clubs référencés : ' + D.clubs.length + '. Date du jour : ' + new Date().toISOString().slice(0, 10) + '.'].join('\n').slice(0, 6000);
  }
  function connecte(app, raw) {
    if (!window.CASA_IA_CONNECTEE || !app.state.loggedIn || !window.CasaAuth || !CasaAuth.appel) return Promise.resolve(null);
    var hist = (app.state.aiMsgs || []).slice(-8).filter(function (m) { return m.text; }).map(function (m) { return { role: m.role === 'user' ? 'user' : 'assistant', content: m.text }; });
    if (!hist.length || hist[hist.length - 1].content !== raw) hist.push({ role: 'user', content: raw });
    while (hist.length && hist[0].role !== 'user') hist.shift();
    return CasaAuth.appel('casa-ia', { messages: hist, contexte: contexte(app) }).then(function (d) {
      if (!d || !d.reply) return null;
      var acts = (d.sources || []).slice(0, 3).map(function (s) { return act(s.titre ? String(s.titre).slice(0, 40) : 'Source', ouvrir(s.url)); });
      return { text: d.reply, actions: acts };
    }).catch(function () { return null; });
  }
  var MONDE = /coupe du monde|mondial|ligue des champions|champions league|\beuro\b|jeux olympiques|\bjo\b|olympi|tour de france|roland.garros|wimbledon|open d australie|us open|six nations|\bnba\b|\bnfl\b|formule 1|\bf1\b|ballon d or|ligue 1|ligue 2|top 14|pro d2|premier league|liga\b|serie a|bundesliga|palmares|record|\b(18|19|20)\d{2}\b/;
  var AUCUNE = function (app) { return { text: 'Je n’ai pas trouvé de réponse sûre à cette question. Essayez de la formuler autrement, par exemple : « classement handball Manche », « qui est Kylian Mbappé », « les niveaux du basket » ou « qui est Casa Besports ».', actions: [act('Le Terrain', function () { app.go('live'); }), act('Clubs', function () { app.go('clubs'); })] }; };

  return {
    avant: function (app, raw) {
      var q = n(raw);
      var r = identite(app, q) || faq(app, q) || niveaux(app, q) || equipes(app, q) || championnats(app, q);
      if (r) return r;
      // Sport national et international (palmarès, grandes compétitions, années passées) : réponse documentée
      if (MONDE.test(q) && typeof fetch === 'function') return { text: '', pending: this.apres(app, raw) };
      return null;
    },
    // Réponse qui arrive un peu plus tard (Promise) : mode connecté si activé, sinon Wikipédia
    apres: function (app, raw) {
      return connecte(app, raw).then(function (r) { return r || wikipedia(raw); }).then(function (r) {
        if (r && r.indispo) return { text: 'Je n’arrive pas à consulter mes sources pour le moment. Réessayez dans une minute.', actions: [act('Réessayer', function () { app.aiAsk(raw); })] };
        return r || AUCUNE(app);
      });
    },
    accueil: function () { return K().accueil; },
    suggestions: function () { return K().suggestions; },
    _requete: requete, _wikipedia: wikipedia
  };
})();
