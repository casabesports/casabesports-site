
/*!
 * Casa Besports — rédaction avancée
 * Versions d’articles, recherche et articles similaires, collage avec mise en forme, gestion de la une,
 * production de la Gazette (titres, éditions, chemin de fer, héritage des pages, reprise entre titres,
 * cartons et titres par défaut, organisation et ajustement automatiques, éléments fixes réservés),
 * fil d’échange entre rédactions, contenus d’agence, IA (prompts par rôle, fournisseurs, suivi), exports.
 * Fonctions pures + construction des valeurs du gabarit (CasaRedac.vals). Aucune dépendance.
 */
var CasaRedac = (function () {
  'use strict';

  /* ================= utilitaires ================= */
  var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var clone = function (o) { return o == null ? o : JSON.parse(JSON.stringify(o)); };
  var nid = function (p) { return (p || 'x') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var fmtDate = function (iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); };
  var fmtDateTime = function (iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.getDate() + ' ' + MOIS[d.getMonth()] + ' · ' + pad(d.getHours()) + ' h ' + pad(d.getMinutes()); };
  var signes = function (t) { return String(t || '').replace(/\s+/g, ' ').trim().length; };
  var plain = function (body) { return String(body || '').replace(/^##\s+|^>\s*|^[-•]\s+/gm, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1'); };
  var STOP = {}; ('les des une pour dans avec sur par aux que qui est son ses leur leurs plus mais nous vous elle elles ils cette ces entre comme tout tous sans sont ont fait faire avant apres depuis encore deja aussi bien tres the and pas peu sous lors dont quand chez etait sera etre avoir leur cela ceux celle celles mon ton notre votre').split(' ').forEach(function (w) { STOP[w] = 1; });
  var words = function (t) { return norm(t).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 3 && !STOP[w]; }); };
  var serverOn = function () { return typeof window !== 'undefined' && !!(window.CB && window.CB.user && window.CB.call); };
  var call = function (method, path, body) { return window.CB.call(method, path, body); };

  /* ================= règles de publication (contraintes bloquantes ou non) ================= */
  var CONTRAINTES = [
    { id: 'relecture', label: 'Publication web sans passer par la relecture', actions: ['publier'] },
    { id: 'qualite', label: 'Score qualité d’au moins 50/100', actions: ['soumettre', 'publier'] },
    { id: 'alt', label: 'Texte alternatif de l’image renseigné', actions: ['soumettre', 'publier'] },
    { id: 'droits', label: 'Photo autorisée sur le site (droits par canal)', actions: ['soumettre', 'publier'], tous: true },
    { id: 'club', label: 'Au moins un club lié', actions: ['soumettre', 'publier'] },
    { id: 'titre', label: 'Titre de 80 caractères maximum', actions: ['soumettre', 'publier'] }
  ];
  var ROLES_REGLES = [['redacteur', 'Rédacteur'], ['collaborateur', 'Chef d’édition']];
  var MODES = [['bloquant', 'Bloquante'], ['alerte', 'Non bloquante (alerte)'], ['off', 'Désactivée']];
  function defaultWf() {
    return { relecture: { redacteur: 'bloquant', collaborateur: 'alerte' }, qualite: { redacteur: 'bloquant', collaborateur: 'alerte' }, alt: { redacteur: 'alerte', collaborateur: 'alerte' },
      droits: { redacteur: 'bloquant', collaborateur: 'bloquant' }, club: { redacteur: 'alerte', collaborateur: 'alerte' }, titre: { redacteur: 'alerte', collaborateur: 'alerte' } };
  }

  /* ================= droits des photos, canal par canal ================= */
  var CANAUX = [['site', 'Site'], ['appli', 'Application'], ['gazette', 'Gazette papier'], ['reseaux', 'Réseaux sociaux'], ['partenaires', 'Partenaires (Fil)']];
  var DROITS = [['libre', 'Libre de droit'], ['credit', 'Autorisé avec crédit'], ['non', 'Non autorisé'], ['?', 'À vérifier']];
  var droitOk = function (m, canal) { var d = m && m.rights ? m.rights[canal] : '?'; return d === 'libre' || d === 'credit'; };
  var allRights = function (v) { var r = {}; CANAUX.forEach(function (c) { r[c[0]] = v; }); return r; };

  /* ================= types d’articles et mises en forme compatibles ================= */
  var TYPES = [
    ['article', 'Article', { h: 1, q: 1, l: 1, b: 1, i: 1 }],
    ['breve', 'Brève', { b: 1, i: 1 }],
    ['tribune', 'Tribune', { h: 1, q: 1, b: 1, i: 1 }],
    ['portrait', 'Portrait', { h: 1, q: 1, l: 1, b: 1, i: 1 }],
    ['compte-rendu', 'Compte rendu de match', { h: 1, l: 1, b: 1 }]
  ];
  var typeOf = function (id) { return TYPES.find(function (t) { return t[0] === (id || 'article'); }) || TYPES[0]; };

  /* Collage : HTML (autre article, traitement de texte, page web) → balisage de l’éditeur.
     Les mises en forme compatibles avec le type de l’article sont conservées ; sinon le paragraphe passe en « Texte ». */
  function htmlToMarkup(html, typeId) {
    var ok = typeOf(typeId)[2];
    var dropped = 0;
    if (typeof DOMParser === 'undefined') return { text: String(html || '').replace(/<[^>]+>/g, ''), dropped: 0 };
    var doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
    var out = [];
    var inline = function (node) {
      var s = '';
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) { s += n.nodeValue.replace(/\s+/g, ' '); return; }
        if (n.nodeType !== 1) return;
        var tg = n.tagName.toLowerCase(); var inner = inline(n);
        if (tg === 'br') { s += ' '; return; }
        var w = n.getAttribute('style') || '';
        if ((tg === 'strong' || tg === 'b' || /font-weight:\s*(bold|[6-9]00)/.test(w)) && inner.trim()) { if (ok.b) s += '**' + inner.trim() + '**'; else { s += inner; dropped++; } return; }
        if ((tg === 'em' || tg === 'i' || /font-style:\s*italic/.test(w)) && inner.trim()) { if (ok.i) s += '*' + inner.trim() + '*'; else { s += inner; dropped++; } return; }
        s += inner;
      });
      return s;
    };
    var block = function (node) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) { var t = n.nodeValue.trim(); if (t) out.push(t); return; }
        if (n.nodeType !== 1) return;
        var tg = n.tagName.toLowerCase();
        if (/^h[1-6]$/.test(tg) || (n.classList && n.classList.contains('ttl'))) { var t1 = inline(n).trim(); if (!t1) return; if (ok.h) out.push('## ' + t1.replace(/\*\*/g, '')); else { out.push(t1); dropped++; } return; }
        if (tg === 'blockquote') { var t2 = inline(n).trim(); if (!t2) return; if (ok.q) out.push('> ' + t2); else { out.push(t2); dropped++; } return; }
        if (tg === 'ul' || tg === 'ol') { var items = []; n.querySelectorAll('li').forEach(function (li) { var t3 = inline(li).trim(); if (t3) items.push(t3); }); if (!items.length) return; if (ok.l) out.push(items.map(function (x) { return '- ' + x; }).join('\n')); else { out.push(items.join(' ')); dropped++; } return; }
        if (tg === 'p' || tg === 'div' && !n.querySelector('p,div,h1,h2,h3,h4,ul,ol,blockquote')) { var t4 = inline(n).trim(); if (t4) out.push(t4); return; }
        if (tg === 'script' || tg === 'style') return;
        block(n);
      });
    };
    block(doc.body);
    return { text: out.join('\n\n'), dropped: dropped };
  }

  /* ================= versions et comparaison ================= */
  var SNAP_KEYS = ['title', 'dek', 'body', 'img', 'alt', 'tag', 'sport', 'clubs', 'premium', 'type', 'printTitle', 'video'];
  var snapOf = function (p) { var o = {}; SNAP_KEYS.forEach(function (k) { if (p[k] !== undefined) o[k] = clone(p[k]); }); return o; };
  var sameSnap = function (a, b) { return JSON.stringify(a) === JSON.stringify(b); };
  function addVersion(p, who, label, force) {
    var vs = (p.versions || []).slice();
    var snap = snapOf(p);
    if (!force && vs.length && sameSnap(vs[vs.length - 1].snap, snap)) return vs;
    var n = vs.length ? vs[vs.length - 1].n + 1 : 1;
    vs.push({ n: n, at: new Date().toISOString(), who: who, label: label || 'Enregistrement', snap: snap });
    return vs.slice(-40);
  }
  // Comparaison mot à mot (plus longue sous-séquence commune), par paragraphe pour rester rapide
  function diffWords(a, b) {
    var A = String(a || '').split(/(\s+)/).filter(function (x) { return x !== ''; }), B = String(b || '').split(/(\s+)/).filter(function (x) { return x !== ''; });
    var n = A.length, m = B.length;
    if (n * m > 1800000) return [{ t: a, del: true }, { t: b, ins: true }];
    var dp = new Array(n + 1); for (var i = 0; i <= n; i++) dp[i] = new Uint16Array(m + 1);
    for (var x = n - 1; x >= 0; x--) for (var y = m - 1; y >= 0; y--) dp[x][y] = A[x] === B[y] ? dp[x + 1][y + 1] + 1 : Math.max(dp[x + 1][y], dp[x][y + 1]);
    var out = [], push = function (t, k) { var l = out[out.length - 1]; if (l && !!l.ins === (k === 'ins') && !!l.del === (k === 'del')) l.t += t; else out.push({ t: t, ins: k === 'ins', del: k === 'del' }); };
    var p = 0, q = 0;
    while (p < n && q < m) { if (A[p] === B[q]) { push(A[p], ''); p++; q++; } else if (dp[p + 1][q] >= dp[p][q + 1]) { push(A[p], 'del'); p++; } else { push(B[q], 'ins'); q++; } }
    while (p < n) push(A[p++], 'del'); while (q < m) push(B[q++], 'ins');
    return out;
  }
  function diffBody(a, b) {
    var PA = String(a || '').split(/\n\s*\n/), PB = String(b || '').split(/\n\s*\n/);
    var segs = diffWords(PA.join(' ¶ '), PB.join(' ¶ '));
    // découpage en paragraphes d’affichage
    var paras = [[]];
    segs.forEach(function (s) {
      var parts = s.t.split(' ¶ ');
      parts.forEach(function (part, i) { if (i > 0) paras.push([]); if (part) paras[paras.length - 1].push({ t: part, ins: s.ins, del: s.del }); });
    });
    return paras.filter(function (p) { return p.length; }).map(function (p) { return { segs: p.map(function (s) { return { t: s.t, plain: !s.ins && !s.del, ins: !!s.ins, del: !!s.del }; }) }; });
  }
  var diffStats = function (paras) { var ins = 0, del = 0; paras.forEach(function (p) { p.segs.forEach(function (s) { if (s.ins) ins += signes(s.t); if (s.del) del += signes(s.t); }); }); return { ins: ins, del: del }; };

  /* ================= similarité (articles similaires) et recherche ================= */
  function similar(target, pool, limit) {
    var docs = pool.filter(function (d) { return d.id !== target.id; });
    var df = {}, N = docs.length + 1;
    var bag = function (d) { var f = {}; words(d.title + ' ' + d.title + ' ' + (d.dek || '') + ' ' + plain(d.body || '') + ' ' + (d.tag || '')).forEach(function (w) { f[w] = (f[w] || 0) + 1; }); return f; };
    var bags = docs.map(bag); var tb = bag(target);
    bags.concat([tb]).forEach(function (b) { Object.keys(b).forEach(function (w) { df[w] = (df[w] || 0) + 1; }); });
    var vec = function (b) { var v = {}, nn = 0; Object.keys(b).forEach(function (w) { var x = (1 + Math.log(b[w])) * Math.log(1 + N / df[w]); v[w] = x; nn += x * x; }); return { v: v, n: Math.sqrt(nn) || 1 }; };
    var tv = vec(tb);
    return docs.map(function (d, i) {
      var dv = vec(bags[i]); var dot = 0; Object.keys(tv.v).forEach(function (w) { if (dv.v[w]) dot += tv.v[w] * dv.v[w]; });
      var sc = dot / (tv.n * dv.n);
      if (d.sport && d.sport === target.sport) sc += 0.08;
      if ((d.clubs || []).some(function (c) { return (target.clubs || []).indexOf(c) >= 0; })) sc += 0.12;
      if (d.tag && target.tag && norm(d.tag) === norm(target.tag)) sc += 0.05;
      return { d: d, sc: sc };
    }).filter(function (x) { return x.sc > 0.02; }).sort(function (a, b) { return b.sc - a.sc; }).slice(0, limit || 10);
  }
  // Recherche plein texte : chaque mot doit apparaître ; extrait avec mise en évidence
  function search(items, q, fields) {
    var terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return items.map(function (it) { return { it: it, sc: 0, snip: [] }; });
    return items.map(function (it) {
      var hay = fields.map(function (f) { return typeof f === 'function' ? f(it) : it[f]; }).join(' \n ');
      var nh = norm(hay);
      if (!terms.every(function (t) { return nh.indexOf(t) >= 0; })) return null;
      var sc = 0; terms.forEach(function (t) { var i = -1, c = 0; while ((i = nh.indexOf(t, i + 1)) >= 0 && c < 20) c++; sc += c; if (norm(it.title || '').indexOf(t) >= 0) sc += 6; });
      return { it: it, sc: sc, snip: snippet(hay, terms) };
    }).filter(Boolean);
  }
  function snippet(text, terms) {
    var t = String(text || '').replace(/\s+/g, ' '); var nt = norm(t);
    var pos = -1; terms.forEach(function (x) { var i = nt.indexOf(x); if (i >= 0 && (pos < 0 || i < pos)) pos = i; });
    if (pos < 0) return [];
    var a = Math.max(0, pos - 60), b = Math.min(t.length, pos + 110);
    var part = (a > 0 ? '…' : '') + t.slice(a, b) + (b < t.length ? '…' : ''); var np = norm(part);
    var marks = new Array(part.length).fill(false);
    terms.forEach(function (x) { var i = -1; while ((i = np.indexOf(x, i + 1)) >= 0) for (var k = i; k < i + x.length; k++) marks[k] = true; });
    var segs = []; for (var i = 0; i < part.length; i++) { var l = segs[segs.length - 1]; if (l && l.hit === marks[i]) l.t += part[i]; else segs.push({ t: part[i], hit: marks[i], plain: !marks[i] }); }
    return segs;
  }

  /* ================= une du site ================= */
  var UNE_MAX = 6;
  function uneAdd(slots, id, pos) {
    var s = (slots || []).slice(0, UNE_MAX);
    if (s[pos] && s[pos].pinned && s[pos].id !== id) return { err: 'La position ' + (pos + 1) + ' est occupée par un article épinglé. Choisissez une autre position ou désépinglez-le.' };
    var cur = s.findIndex(function (x) { return x && x.id === id; });
    if (cur >= 0 && s[cur].pinned) return { err: 'Cet article est épinglé en position ' + (cur + 1) + ' : désépinglez-le avant de le déplacer.' };
    var pinned = {}; s.forEach(function (x, i) { if (x && x.pinned) pinned[i] = x; });
    var free = s.filter(function (x, i) { return x && !x.pinned && x.id !== id; });
    var before = 0; for (var i = 0; i < pos; i++) if (!pinned[i]) before++;
    free.splice(before, 0, { id: id, pinned: false });
    var out = []; for (var k = 0; k < UNE_MAX; k++) { if (pinned[k]) out.push(pinned[k]); else if (free.length) out.push(free.shift()); }
    return { slots: out.filter(Boolean), dropped: free.length };
  }
  function uneReplace(slots, id, pos) {
    var s = (slots || []).slice(0, UNE_MAX);
    if (s[pos] && s[pos].pinned) return { err: 'La position ' + (pos + 1) + ' est occupée par un article épinglé : impossible de le remplacer.' };
    var cur = s.findIndex(function (x) { return x && x.id === id; });
    if (cur >= 0 && s[cur].pinned) return { err: 'Cet article est épinglé en position ' + (cur + 1) + ' : désépinglez-le avant de le déplacer.' };
    var replaced = s[pos] ? s[pos].id : null;
    if (pos >= s.length) { s = s.filter(function (x) { return x.id !== id; }); s.push({ id: id, pinned: false }); return { slots: s, replaced: null }; }
    s[pos] = { id: id, pinned: false };
    if (cur >= 0 && cur !== pos) { s.splice(cur, 1); }
    return { slots: s, replaced: replaced };
  }
  function uneMove(slots, i, d) {
    var s = slots.slice(); var j = i + d;
    if (j < 0 || j >= s.length || s[i].pinned || s[j].pinned) return { err: 'Un article épinglé ne se déplace pas.' };
    var t = s[i]; s[i] = s[j]; s[j] = t; return { slots: s };
  }

  /* ================= production : titres, éditions, pages ================= */
  var KIND_LABEL = { article: 'Article', photo: 'Photo', pub: 'Publicité', fixe: 'Élément fixe' };
  var PAGE_ST = { afaire: ['À faire', '#ebe6db', '#3f4f61'], encours: ['En cours', '#fff1d6', '#7a5208'], prete: ['Prête', '#dfe8f5', '#20406e'], validee: ['Validée', '#d8efe6', '#11583f'] };
  function defaultTitles() {
    var M = function (id, name, kind, w, h, titre) { return { id: id, name: name, kind: kind, w: w, h: h, titre: titre || '' }; };
    return [
      { id: 't-gazette', name: 'La Gazette du Cotentin', short: 'La Gazette', rythme: 'Mensuel', format: 'Tabloïd · 6 colonnes', cols: 6, rows: 8, ratio: '29 / 40', cap: 400,
        charte: { paper: '#ffffff', ink: '#0a0a0a', accent: '#0a0a0a', font: "'League Spartan', 'Arial Black', sans-serif", label: 'Le bandeau : noir et blanc, comme le logo' },
        rubriques: ['Couverture', 'Sommaire', 'Édito', 'Le week-end', 'Le dossier', 'Le détail choc 🔥', 'Dans le vestiaire', 'Le chiffre', 'Football', 'Football féminin', 'Regard terrain', 'Basket', 'Water-polo', 'Arbitrage', 'Le tableau noir', 'La question qui divise', 'L’histoire', 'Portrait', 'Rétro', 'Lieux de légende', 'En forme', 'Le lexique', 'Agenda', 'Boutique', 'L’humeur', 'Jeux', 'Partenaires', 'Dernière page'],
        cahiers: ['À la une', 'Le terrain', 'Les gens', 'Le territoire', 'La pause'],
        modeles: [M('g-ouv', 'Ouverture pleine largeur', 'article', 6, 4), M('g-art3', 'Article 3 colonnes', 'article', 3, 4), M('g-art2', 'Article 2 colonnes', 'article', 2, 4), M('g-breve', 'Brève', 'article', 2, 2, 'En bref'), M('g-chiffre', 'Le chiffre', 'article', 2, 2, 'Le chiffre'), M('g-tribune', 'Tribune', 'article', 2, 5, 'Tribune'),
          M('g-choc', 'Le détail choc 🔥 (encadré)', 'article', 2, 2, 'Le détail choc 🔥'), M('g-choc-p', 'Le détail choc 🔥 (pleine page noire)', 'article', 6, 8, 'Le détail choc 🔥'), M('g-debat', 'La question qui divise (pour / contre)', 'article', 6, 6, 'La question qui divise'), M('g-retro', 'Rétro (frise)', 'article', 4, 8, 'Rétro'), M('g-humeur', 'L’humeur (baromètre, classement)', 'article', 3, 8, 'L’humeur'),
          M('g-photo', 'Photo', 'photo', 3, 3), M('g-photo-l', 'Photo pleine largeur', 'photo', 6, 4), M('g-pub2', 'Publicité ½ page', 'pub', 6, 4), M('g-pub4', 'Publicité ¼ page', 'pub', 3, 4), M('g-fixe', 'Module fixe', 'fixe', 2, 3)] },
      { id: 't-programme', name: 'Programme de match (exemple)', short: 'Programme', rythme: 'À chaque match à domicile', format: 'A5 · 4 colonnes', cols: 4, rows: 6, ratio: '148 / 210', cap: 230,
        charte: { paper: '#ffffff', ink: '#0b1522', accent: '#e03040', font: "'Barlow Condensed', 'Archivo Black', sans-serif", label: 'Blanc, nuit et rouge' },
        rubriques: ['Couverture', 'Le mot du club', 'L’adversaire', 'Effectif', 'Classement', 'Agenda', 'Partenaires'],
        modeles: [M('p-ouv', 'Ouverture', 'article', 4, 3), M('p-art', 'Article demi-page', 'article', 2, 3), M('p-breve', 'Brève', 'article', 2, 2, 'En bref'), M('p-mot', 'Le mot du club', 'article', 4, 3, 'Le mot du club'), M('p-photo', 'Photo', 'photo', 2, 2), M('p-photo-l', 'Photo pleine largeur', 'photo', 4, 3), M('p-pub', 'Publicité ½ page', 'pub', 4, 3), M('p-fixe', 'Module fixe', 'fixe', 2, 3)] },
      { id: 't-hs', name: 'Hors-série Coupe de France (exemple)', short: 'Hors-série', rythme: 'Ponctuel', format: 'Magazine A4 · 4 colonnes', cols: 4, rows: 6, ratio: '210 / 297', cap: 330,
        charte: { paper: '#0f2236', ink: '#f6f0e1', accent: '#e8a830', font: "'Cinzel', 'Cormorant Garamond', Georgia, serif", label: 'Nuit et or' },
        rubriques: ['Couverture', 'Le parcours', 'Les héros', 'L’adversaire', 'Le match', 'Partenaires'],
        modeles: [M('h-ouv', 'Ouverture', 'article', 4, 3), M('h-art', 'Article demi-page', 'article', 2, 4), M('h-breve', 'Brève', 'article', 2, 2, 'Le saviez-vous ?'), M('h-photo', 'Photo', 'photo', 2, 3), M('h-photo-l', 'Photo pleine page', 'photo', 4, 6), M('h-pub', 'Publicité ½ page', 'pub', 4, 3), M('h-fixe', 'Module fixe', 'fixe', 2, 2)] }
    ];
  }
  function defaultFixes() {
    var F = function (key, name, tags, titre, source, w, h) { return { key: key, name: name, tags: tags, titre: titre, source: source, w: w, h: h, livre: null }; };
    return [
      F('meteo', 'Météo du week-end', ['météo', 'prévisions', 'temps', 'vent'], 'La météo du week-end', 'donnees', 2, 2),
      F('classement-r2', 'Classement Régional 2', ['classement', 'football', 'R2', 'tableau'], 'Le classement', 'donnees', 2, 3),
      F('agenda', 'Agenda du week-end', ['agenda', 'matchs', 'programme', 'sorties'], 'Agenda', 'donnees', 2, 4),
      F('resultats', 'Résultats du week-end', ['résultats', 'scores', 'football', 'basket'], 'Les résultats', 'donnees', 2, 3),
      F('sommaire', 'Sommaire', ['sommaire', 'pages', 'numéro'], 'Dans ce numéro', 'donnees', 2, 4),
      F('marees', 'Horaires des marées', ['marées', 'mer', 'voile', 'Cherbourg'], 'Les marées', 'visuel', 2, 2),
      F('jeux', 'Mots fléchés du sport', ['jeux', 'mots fléchés', 'détente'], 'Jeux', 'visuel', 3, 4),
      F('quiz', 'Quiz du Cotentin', ['quiz', 'jeux', 'questions'], 'Le quiz du Cotentin', 'visuel', 3, 4),
      F('abonnement', 'Bulletin d’abonnement', ['abonnement', 'bulletin', 'promotion'], 'Abonnez-vous', 'visuel', 3, 2),
      F('ours', 'Ours (mentions légales)', ['ours', 'mentions', 'rédaction', 'directeur de la publication'], 'La Gazette du Cotentin', 'texte', 2, 2)
    ];
  }
  // Chemin de fer du numéro d’essai, construit à partir des pages de la liseuse (trente pages, cinq cahiers)
  function gazettePages(G) {
    var pages = [];
    var el = function (kind, ref, x, y, w, h, tpl, extra) { return Object.assign({ id: nid('el'), kind: kind, ref: ref, x: x, y: y, w: w, h: h, tpl: tpl, title: '', corps: 9.5 }, extra || {}); };
    (G && G.pages || []).forEach(function (p, i) {
      var els = []; var ref = 'gz:' + i;
      if (p.kind === 'cover') els = [el('photo', p.img ? 'img:' + p.img : 'img:assets/hero.jpg', 0, 0, 6, 6, 'g-photo-l'), el('article', ref, 0, 6, 6, 2, 'g-ouv', { title: 'Pointe-Hague face à Goliath' })];
      else if (p.kind === 'toc') els = [el('fixe', 'sommaire', 0, 0, 3, 8, 'g-fixe'), el('photo', 'img:assets/img_51314cdd.jpg', 3, 0, 3, 4, 'g-photo'), el('fixe', 'ours', 3, 6, 3, 2, 'g-fixe')];
      else if (p.kind === 'agenda') els = [el('fixe', 'agenda', 0, 0, 4, 8, 'g-fixe'), el('fixe', 'meteo', 4, 0, 2, 3, 'g-fixe'), el('fixe', 'classement-r2', 4, 3, 2, 5, 'g-fixe')];
      else if (p.kind === 'quiz') els = [el('fixe', 'quiz', 0, 0, 6, 5, 'g-fixe'), el('fixe', 'abonnement', 0, 5, 6, 3, 'g-fixe')];
      else if (p.kind === 'ads') els = [el('pub', 'Partenaire [à confirmer]', 0, 0, 6, 4, 'g-pub2'), el('pub', 'Partenaire [à confirmer]', 0, 4, 3, 4, 'g-pub4'), el('pub', 'Partenaire [à confirmer]', 3, 4, 3, 4, 'g-pub4')];
      else if (p.kind === 'number') els = [el('article', ref, 0, 0, 2, 4, 'g-chiffre'), el('photo', p.img ? 'img:' + p.img : '', 2, 0, 4, 4, 'g-photo'), el('article', ref + ':b', 0, 4, 6, 4, 'g-art3')];
      else if (p.kind === 'brief') els = [el('article', ref, 0, 0, 2, 4, 'g-breve'), el('article', ref + ':2', 2, 0, 2, 4, 'g-breve'), el('article', ref + ':3', 4, 0, 2, 4, 'g-breve'), el('fixe', 'resultats', 0, 4, 6, 4, 'g-fixe')];
      else if (p.kind === 'back') els = [el('photo', p.img ? 'img:' + p.img : '', 0, 0, 6, 6, 'g-photo-l'), el('article', ref, 0, 6, 6, 2, 'g-ouv')];
      else if (p.kind === 'choc') els = [el('article', ref, 0, 0, 6, 8, 'g-choc-p', { title: 'Le détail choc 🔥' })];
      else if (p.kind === 'debat') els = [el('article', ref, 0, 0, 6, 6, 'g-debat'), el('fixe', 'abonnement', 0, 6, 6, 2, 'g-fixe')];
      else if (p.kind === 'retro') els = [el('article', ref, 0, 0, 4, 8, 'g-retro'), el('article', ref + ':b', 4, 0, 2, 4, 'g-chiffre'), el('article', ref + ':choc', 4, 4, 2, 4, 'g-choc')];
      else if (p.kind === 'lexique') els = [el('article', ref, 0, 0, 3, 8, 'g-art3'), el('article', ref + ':b', 3, 0, 3, 8, 'g-art3')];
      else if (p.kind === 'humeur') els = [el('article', ref, 0, 0, 3, 8, 'g-humeur', { title: 'Le baromètre' }), el('article', ref + ':b', 3, 0, 3, 8, 'g-humeur', { title: 'Le classement qui ne sert à rien' })];
      else {
        els = [el('article', ref, 0, 0, 4, 8, 'g-art3'), el('photo', p.img ? 'img:' + p.img : '', 4, 0, 2, 4, 'g-photo')];
        if (p.cols3 && p.cols3.length) els.push(el('article', ref + ':b', 4, 4, 2, p.choc ? 2 : 4, 'g-breve'));
        if (p.choc) els.push(el('article', ref + ':choc', 4, p.cols3 && p.cols3.length ? 6 : 4, 2, 2, 'g-choc'));
      }
      pages.push({ id: 'pg-n0-' + (i + 1), n: i + 1, rubric: p.rubric, status: 'validee', els: els, inherit: null, locked: false });
    });
    return pages;
  }
  function defaultProd(G) {
    var titles = defaultTitles(); var fixes = defaultFixes();
    // éléments permanents (livrés une fois pour toutes) ; les autres se livrent à chaque édition
    fixes.forEach(function (f) {
      if (f.key === 'ours') { f.permanent = true; f.livre = { at: '2026-10-01T09:00:00.000Z', by: 'Rédaction', kind: 'texte', text: 'Directeur de la publication : [à compléter] · Rédaction : Casa Besports · Impression : [à compléter] · Dépôt légal : [à compléter]' }; }
      if (f.key === 'abonnement') { f.permanent = true; f.livre = { at: '2026-10-01T09:00:00.000Z', by: 'Rédaction', kind: 'texte', text: 'Abonnez-vous : numérique, papier ou les deux, sur casabesports.fr.' }; }
    });
    var livre = function (keys, at) { var o = {}; keys.forEach(function (k) { o[k] = { at: at, by: 'Rédaction', kind: 'donnees', text: '' }; }); return o; };
    var n0 = { id: 'e-gz-0', title: 't-gazette', num: 0, label: 'N°0 · numéro d’essai', date: '2026-10-01', status: 'bouclee', pages: gazettePages(G), livraisons: livre(['meteo', 'classement-r2', 'agenda', 'resultats', 'quiz'], '2026-09-30T17:00:00.000Z'), closedAt: '2026-09-30T18:00:00.000Z' };
    // N°1 : pages associées au N°0 bouclé (héritage actif), la une et le dossier déjà dissociés
    var n1pages = n0.pages.map(function (p) { return { id: p.id.replace('n0', 'n1'), n: p.n, rubric: p.rubric, status: 'afaire', els: [], inherit: { ed: n0.id, page: p.id }, locked: true }; });
    var kOf = function (kind, rub) { var gp = (G && G.pages) || []; for (var i = 0; i < gp.length; i++) { if (gp[i].kind === kind && (!rub || gp[i].rubric === rub)) return i; } return -1; };
    var kCover = kOf('cover'), kEdito = kOf('article', 'Édito'), kDossier = kOf('article', 'Le dossier'), kAgenda = kOf('agenda'), kChoc = kOf('choc');
    [kCover, kEdito, kDossier, kChoc].filter(function (k) { return k >= 0; }).forEach(function (k) { var p = n1pages[k]; p.locked = false; p.status = 'encours'; p.els = clone(n0.pages[k].els).map(function (e) { e.id = nid('el'); e.inh = true; return e; }); });
    if (kCover >= 0) n1pages[kCover].els[1] = Object.assign(n1pages[kCover].els[1], { ref: 'post:p5', title: 'Trente ans de passion haguaise', inh: false });
    if (kDossier >= 0) n1pages[kDossier].els[0] = Object.assign(n1pages[kDossier].els[0], { ref: 'post:p1', inh: false });
    // le détail choc du N°1 reste à trouver : le bloc est posé, son contenu sera un article vérifié (avec sa source)
    if (kChoc >= 0) { n1pages[kChoc].status = 'afaire'; n1pages[kChoc].els = [Object.assign(n1pages[kChoc].els[0], { ref: '', title: 'Le détail choc 🔥 · à trouver et à sourcer', inh: false })]; }
    if (kAgenda >= 0) {
      var pa = n1pages[kAgenda];
      pa.locked = false; pa.status = 'encours'; pa.els = clone(n0.pages[kAgenda].els).map(function (e) { e.id = nid('el'); e.inh = true; return e; });
      pa.els.push({ id: nid('el'), kind: 'fixe', ref: 'marees', x: 4, y: 0, w: 2, h: 3, tpl: 'g-fixe', title: '', corps: 9.5 });
      pa.els = pa.els.filter(function (e) { return e.ref !== 'meteo'; }).concat([{ id: nid('el'), kind: 'fixe', ref: 'meteo', x: 4, y: 3, w: 2, h: 2, tpl: 'g-fixe', title: '', corps: 9.5, inh: false }]);
      pa.els.forEach(function (e) { if (e.ref === 'classement-r2') { e.y = 5; e.h = 3; } });
    }
    var n1 = { id: 'e-gz-1', title: 't-gazette', num: 1, label: 'N°1', date: '2026-11-05', status: 'prep', pages: n1pages, from: n0.id };
    var pg = { id: 'e-pg-1', title: 't-programme', num: 1, label: 'ES Pointe-Hague – US Avranches', date: '2026-10-18', status: 'prep', livraisons: livre(['classement-r2'], '2026-10-12T10:00:00.000Z'), pages: [
      { id: 'pg-pg1-1', n: 1, rubric: 'Couverture', status: 'prete', locked: false, inherit: null, els: [{ id: nid('el'), kind: 'photo', ref: 'img:assets/img_51314cdd.jpg', x: 0, y: 0, w: 4, h: 4, tpl: 'p-photo-l', title: '', corps: 9.5 }, { id: nid('el'), kind: 'article', ref: 'post:p5', x: 0, y: 4, w: 4, h: 2, tpl: 'p-ouv', title: 'Coupe de France · 4e tour', corps: 9.5 }] },
      { id: 'pg-pg1-2', n: 2, rubric: 'Le mot du club', status: 'afaire', locked: false, inherit: null, els: [{ id: nid('el'), kind: 'article', ref: 'post:p4', x: 0, y: 0, w: 4, h: 3, tpl: 'p-mot', title: '', corps: 9.5 }, { id: nid('el'), kind: 'pub', ref: 'Partenaire [à confirmer]', x: 0, y: 3, w: 4, h: 3, tpl: 'p-pub', title: '', corps: 9.5 }] },
      { id: 'pg-pg1-3', n: 3, rubric: 'Classement', status: 'afaire', locked: false, inherit: null, els: [{ id: nid('el'), kind: 'fixe', ref: 'classement-r2', x: 0, y: 0, w: 2, h: 4, tpl: 'p-fixe', title: '', corps: 9.5 }, { id: nid('el'), kind: 'fixe', ref: 'agenda', x: 2, y: 0, w: 2, h: 4, tpl: 'p-fixe', title: '', corps: 9.5 }, { id: nid('el'), kind: 'fixe', ref: 'meteo', x: 0, y: 4, w: 2, h: 2, tpl: 'p-fixe', title: '', corps: 9.5 }] }
    ] };
    return { titles: titles, fixes: fixes, editions: [n0, n1, pg], gz: 2 }; // gz 2 : Gazette en trente pages, édition « Le bandeau »
  }
  var titleOf = function (prod, id) { return prod.titles.find(function (t) { return t.id === id; }) || prod.titles[0]; };
  var edOf = function (prod, id) { return prod.editions.find(function (e) { return e.id === id; }); };
  var pageOf = function (ed, id) { return ed && ed.pages.find(function (p) { return p.id === id; }); };
  var fixeOf = function (prod, key) { return prod.fixes.find(function (f) { return f.key === key; }); };
  var tplOf = function (title, id) { return title.modeles.find(function (m) { return m.id === id; }); };
  // Héritage actif : une page héritée et verrouillée affiche toujours le contenu de sa page source
  function resolveEls(prod, page, depth) {
    if (!page) return [];
    if (page.inherit && page.locked && (depth || 0) < 8) { var src = pageOf(edOf(prod, page.inherit.ed), page.inherit.page); return resolveEls(prod, src, (depth || 0) + 1).map(function (e) { return Object.assign({}, e, { inh: true }); }); }
    return page.els || [];
  }
  function sourceLabel(prod, page) {
    if (!page.inherit) return '';
    var ed = edOf(prod, page.inherit.ed); var sp = pageOf(ed, page.inherit.page);
    return (ed ? ed.label : 'édition supprimée') + (sp ? ' · page ' + sp.n : '');
  }
  function newEditionFrom(prod, src, opts) {
    var t = titleOf(prod, src.title);
    var nums = prod.editions.filter(function (e) { return e.title === t.id; }).map(function (e) { return e.num; });
    var num = (nums.length ? Math.max.apply(null, nums) : 0) + 1;
    var id = nid('e');
    var pages = src.pages.map(function (p) {
      var keep = !opts || !opts.blank || opts.blank.indexOf(p.id) < 0;
      return { id: nid('pg'), n: p.n, rubric: p.rubric, status: keep ? 'afaire' : 'afaire', els: [], inherit: keep ? { ed: src.id, page: p.id } : null, locked: keep };
    });
    return { id: id, title: t.id, num: num, label: (t.id === 't-gazette' ? 'N°' + num : t.short + ' n°' + num), date: (opts && opts.date) || '', status: 'prep', pages: pages, from: src.id };
  }
  function dissociate(prod, page) {
    var els = resolveEls(prod, page).map(function (e) { return Object.assign(clone(e), { id: nid('el'), inh: true }); });
    return Object.assign({}, page, { locked: false, els: els, status: page.status === 'afaire' ? 'encours' : page.status });
  }
  // Reprise d’une page d’un autre titre : nouvelle page, en attente de « nos modèles » si la charte diffère
  function reusePage(prod, targetEd, srcEdId, srcPageId) {
    var sEd = edOf(prod, srcEdId); var sp = pageOf(sEd, srcPageId); if (!sp) return null;
    var els = resolveEls(prod, sp).map(function (e) { return Object.assign(clone(e), { id: nid('el'), inh: false }); });
    return { id: nid('pg'), n: targetEd.pages.length + 1, rubric: sp.rubric, status: 'encours', els: els, inherit: null, locked: false,
      reused: { title: sEd.title, ed: sEd.id, page: sp.id, label: titleOf(prod, sEd.title).name + ' · ' + sEd.label + ' · page ' + sp.n }, chartePending: sEd.title !== targetEd.title };
  }
  function applyOurTemplates(prod, targetEd, page) {
    var tt = titleOf(prod, targetEd.title); var st = titleOf(prod, page.reused ? page.reused.title : targetEd.title);
    var sx = tt.cols / st.cols, sy = tt.rows / st.rows;
    var els = page.els.map(function (e) {
      var x = Math.min(tt.cols - 1, Math.round(e.x * sx)), y = Math.min(tt.rows - 1, Math.round(e.y * sy));
      var w = Math.max(1, Math.min(tt.cols - x, Math.round(e.w * sx))), h = Math.max(1, Math.min(tt.rows - y, Math.round(e.h * sy)));
      var cands = tt.modeles.filter(function (m) { return m.kind === e.kind; });
      var best = cands.sort(function (a, b) { return Math.abs(a.w * a.h - w * h) - Math.abs(b.w * b.h - w * h); })[0];
      return Object.assign({}, e, { x: x, y: y, w: w, h: h, tpl: best ? best.id : e.tpl });
    });
    var rub = tt.rubriques.indexOf(page.rubric) >= 0 ? page.rubric : (tt.rubriques.find(function (r) { return norm(r).indexOf(norm(page.rubric).split(' ')[0]) >= 0; }) || page.rubric);
    return Object.assign({}, page, { els: els, rubric: rub, chartePending: false });
  }

  /* ---------- ajustement : capacité d’un bloc et longueur de l’article ---------- */
  function capacity(title, e) {
    var cells = e.w * e.h - (e.kind === 'article' ? e.w * (e.h >= 3 ? 0.8 : 0.55) : 0);
    var corps = e.corps || 9.5;
    return Math.max(0, Math.round(cells * (title.cap || 400) * Math.pow(9.5 / corps, 2)));
  }
  function fit(title, e, len) {
    if (e.kind !== 'article') return null;
    var cap = capacity(title, e); var d = len - cap; var tol = Math.max(40, cap * 0.05);
    if (Math.abs(d) <= tol) return { ok: true, label: 'Ajusté', color: '#11583f', bg: '#d8efe6', d: d, cap: cap };
    if (d > 0) return { ok: false, label: 'Trop long de ' + d + ' signes', color: '#9b1c2b', bg: '#fde2e4', d: d, cap: cap };
    return { ok: false, label: 'Manque ' + (-d) + ' signes', color: '#7a5208', bg: '#fff1d6', d: d, cap: cap };
  }
  // Ajustement automatique : corps du texte entre 8,5 et 10,5 pt, puis hauteur du bloc si la place le permet
  function autoFit(title, els, lenOf) {
    var report = { fixed: 0, cut: [] };
    var occ = occupancy(title, els);
    var out = els.map(function (e0) {
      if (e0.kind !== 'article') return e0;
      var e = Object.assign({}, e0); var len = lenOf(e); var f = fit(title, e, len);
      if (!f || f.ok) return e;
      var best = e.corps || 9.5, bestD = Math.abs(f.d);
      for (var c = 8.5; c <= 10.5; c += 0.5) { var ff = fit(title, Object.assign({}, e, { corps: c }), len); if (Math.abs(ff.d) < bestD) { bestD = Math.abs(ff.d); best = c; } }
      e.corps = best; var f2 = fit(title, e, len);
      if (!f2.ok && f2.d > 0) { // grandir vers le bas si les cases sont libres
        while (!f2.ok && f2.d > 0 && e.y + e.h < title.rows && freeRow(occ, e, e.y + e.h)) { markRow(occ, e, e.y + e.h); e.h++; f2 = fit(title, e, len); }
      }
      if (f2.ok) report.fixed++; else if (f2.d > 0) report.cut.push(f2.d);
      if (e.corps !== e0.corps || e.h !== e0.h) e.inh = false;
      return e;
    });
    return { els: out, report: report };
  }
  function occupancy(title, els, skip) {
    var g = []; for (var y = 0; y < title.rows; y++) { g.push(new Array(title.cols).fill(null)); }
    els.forEach(function (e) { if (e === skip || e.out) return; for (var y = e.y; y < Math.min(title.rows, e.y + e.h); y++) for (var x = e.x; x < Math.min(title.cols, e.x + e.w); x++) if (y >= 0 && x >= 0) g[y][x] = e.id; });
    return g;
  }
  var freeRow = function (g, e, y) { for (var x = e.x; x < e.x + e.w; x++) if (g[y][x] && g[y][x] !== e.id) return false; return true; };
  var markRow = function (g, e, y) { for (var x = e.x; x < e.x + e.w; x++) g[y][x] = e.id; };
  // Organisation automatique : publicités et éléments épinglés restent en place, le reste est rangé par importance
  function autoArrange(title, els, lenOf) {
    var g = []; for (var y = 0; y < title.rows; y++) g.push(new Array(title.cols).fill(false));
    var fixed = els.filter(function (e) { return e.kind === 'pub' || e.pin; });
    fixed.forEach(function (e) { for (var y = e.y; y < e.y + e.h && y < title.rows; y++) for (var x = e.x; x < e.x + e.w && x < title.cols; x++) g[y][x] = true; });
    var rank = function (e) { return e.kind === 'article' ? 0 : e.kind === 'photo' ? 1 : 2; };
    var movable = els.filter(function (e) { return fixed.indexOf(e) < 0; }).sort(function (a, b) { return rank(a) - rank(b) || (b.kind === 'article' ? lenOf(b) - lenOf(a) : b.w * b.h - a.w * a.h); });
    var fits = function (x, y, w, h) { if (x + w > title.cols || y + h > title.rows) return false; for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) if (g[yy][xx]) return false; return true; };
    var place = function (w, h) { for (var y = 0; y < title.rows; y++) for (var x = 0; x < title.cols; x++) if (fits(x, y, w, h)) return [x, y]; return null; };
    var out = {}; var lead = true;
    movable.forEach(function (e0) {
      var e = Object.assign({}, e0, { out: false });
      var w = Math.min(title.cols, e.w), h = Math.min(title.rows, e.h);
      if (e.kind === 'article') {
        if (lead) { w = Math.max(w, Math.min(title.cols, Math.ceil(title.cols * 2 / 3))); lead = false; }
        var need = lenOf(e) / ((title.cap || 400) * Math.pow(9.5 / (e.corps || 9.5), 2)) + w * 0.8;
        h = Math.max(2, Math.min(title.rows, Math.ceil(need / w)));
      }
      var pos = null, ww = w, hh = h;
      while (!pos && hh >= 1) { pos = place(ww, hh); if (!pos) hh--; }
      hh = pos ? hh : h; ww = w;
      while (!pos && ww >= 1) { ww--; if (ww < 1) break; pos = place(ww, Math.min(hh, title.rows)); }
      if (pos) { e.x = pos[0]; e.y = pos[1]; e.w = ww; e.h = Math.max(1, hh); for (var y = e.y; y < e.y + e.h; y++) for (var x = e.x; x < e.x + e.w; x++) g[y][x] = true; }
      else e.out = true;
      if (e.x !== e0.x || e.y !== e0.y || e.w !== e0.w || e.h !== e0.h) e.inh = false;
      out[e.id] = e;
    });
    return els.map(function (e) { return out[e.id] || e; });
  }
  function freeSlot(title, els, w, h) {
    var g = occupancy(title, els);
    for (var y = 0; y <= title.rows - h; y++) for (var x = 0; x <= title.cols - w; x++) { var ok = true; for (var yy = y; yy < y + h && ok; yy++) for (var xx = x; xx < x + w; xx++) if (g[yy][xx]) { ok = false; break; } if (ok) return [x, y]; }
    return null;
  }

  /* ================= assistant IA intégré (sans clé) ================= */
  var PROMPTS = [
    { id: 'titres', label: 'Proposer 3 titres', champ: 'titre', roles: ['tous'], texte: 'Propose trois titres informatifs de moins de 80 caractères pour cet article de sport local, un par ligne, sans point d’exclamation.\n\nTitre actuel : {{titre}}\nChapeau : {{chapo}}\nTexte : {{texte}}' },
    { id: 'chapo', label: 'Rédiger le chapeau', champ: 'chapo', roles: ['tous'], texte: 'Rédige un chapeau de deux phrases (60 à 220 caractères) qui donne envie de lire, sans répéter le titre.\n\nTitre : {{titre}}\nTexte : {{texte}}' },
    { id: 'relecture', label: 'Relecture', champ: 'corps', roles: ['tous'], texte: 'Relis ce texte : signale les fautes, les répétitions et les phrases trop longues, une remarque par ligne, sans réécrire le style.\n\n{{texte}}' },
    { id: 'resume', label: 'Résumé en 3 points', champ: 'resume', roles: ['tous'], texte: 'Résume cet article en trois points courts, un par ligne.\n\n{{titre}}\n{{texte}}' },
    { id: 'print', label: 'Titre court pour la Gazette', champ: 'print', roles: ['admin', 'collaborateur'], texte: 'Propose trois titres de 45 caractères maximum pour la version imprimée, un par ligne.\n\nTitre web : {{titre}}\nChapeau : {{chapo}}' },
    { id: 'seo', label: 'Référencement', champ: 'seo', roles: ['admin', 'collaborateur'], texte: 'Propose une adresse courte, une méta-description de 155 caractères et cinq mots-clés, une information par ligne.\n\nTitre : {{titre}}\nChapeau : {{chapo}}' },
    { id: 'reseaux', label: 'Message pour les réseaux', champ: 'reseaux', roles: ['admin', 'collaborateur'], texte: 'Rédige un message de 280 caractères maximum pour annoncer cet article sur les réseaux sociaux, avec trois mots-dièse.\n\nTitre : {{titre}}\nChapeau : {{chapo}}' },
    { id: 'legende', label: 'Texte alternatif de la photo', champ: 'legende', roles: ['tous'], texte: 'Propose un texte alternatif d’une phrase (moins de 125 caractères) pour la photo de cet article.\n\nTitre : {{titre}}\nDescription actuelle : {{alt}}' }
  ];
  function localAI(id, p) {
    var t = plain(p.body || ''); var sents = String(t).replace(/\n+/g, ' ').split(/(?<=[.!?…])\s+/).map(function (x) { return x.trim(); }).filter(function (x) { return x.length > 1; });
    var f = {}; words((p.title || '') + ' ' + (p.dek || '') + ' ' + t).forEach(function (w) { f[w] = (f[w] || 0) + 1; });
    var kw = Object.keys(f).sort(function (a, b) { return f[b] - f[a]; }).slice(0, 6);
    var cap = function (w) { return w ? w[0].toUpperCase() + w.slice(1) : w; };
    var core = String(p.title || '').split(/[:—–-]/)[0].trim() || cap(kw[0] || 'Le sport local');
    if (id === 'titres') return [core + ' : ' + (p.tag ? p.tag.toLowerCase() : 'le récit'), cap(kw[0] || 'Cotentin') + ', ' + (kw[1] || 'la saison') + ' et ' + (kw[2] || 'les ambitions'), (p.sport || 'Sport') + ' · ' + core];
    if (id === 'chapo') { var d = sents.slice(0, 2).join(' ').slice(0, 220); return [d || 'Ajoutez du texte pour générer un chapeau.']; }
    if (id === 'relecture') { var issues = []; sents.filter(function (x) { return x.split(/\s+/).length > 35; }).forEach(function (x) { issues.push('Phrase longue : « ' + x.slice(0, 60) + '… »'); }); var dbl = t.match(/\b(\w+)\s+\1\b/i); if (dbl) issues.push('Mot répété : « ' + dbl[0] + ' »'); if (/  /.test(p.body || '')) issues.push('Double espace détecté'); if (((p.body || '').match(/!/g) || []).length > 2) issues.push('Beaucoup de points d’exclamation'); if (!String(p.alt || '').trim()) issues.push('Image sans texte alternatif'); return issues.length ? issues : ['Aucun problème détecté.']; }
    if (id === 'resume') return sents.slice(0, 3).map(function (x) { return x.length > 120 ? x.slice(0, 117) + '…' : x; });
    if (id === 'print') { var c45 = core.length <= 45 ? core : core.slice(0, 44).replace(/\s+\S*$/, '') + '…'; return [c45, cap(kw[0] || 'Cotentin') + ' : ' + (kw[1] || 'le récit'), (p.tag || p.sport || 'Sport').slice(0, 20) + ' · ' + (kw[0] || 'local')]; }
    if (id === 'seo') { var slug = norm(p.title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70); return ['Adresse : /actualites/' + slug, 'Méta : ' + (p.dek || sents[0] || '').slice(0, 155), 'Mots-clés : ' + kw.slice(0, 5).join(', ')]; }
    if (id === 'reseaux') return [(String(p.title || '') + ' — ' + String(p.dek || sents[0] || '')).slice(0, 230) + ' #CasaBesports #Cotentin #' + String(p.sport || 'SportLocal').replace(/[^A-Za-zÀ-ÿ]/g, '')];
    if (id === 'legende') return [(p.alt && p.alt.trim()) ? p.alt.trim() : ('Photo : ' + String(p.title || 'article').slice(0, 100))];
    return ['Assistant intégré : ce prompt personnalisé nécessite un fournisseur d’IA configuré sur le serveur.'];
  }
  var fillPrompt = function (txt, p) { return String(txt || '').replace(/\{\{\s*titre\s*\}\}/g, p.title || '').replace(/\{\{\s*chapo\s*\}\}/g, p.dek || '').replace(/\{\{\s*texte\s*\}\}/g, plain(p.body || '').slice(0, 6000)).replace(/\{\{\s*alt\s*\}\}/g, p.alt || ''); };

  /* ================= CSV ================= */
  function csv(cols, rows) {
    var q = function (v) { v = v == null ? '' : String(v); return /[";\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return '﻿' + [cols.map(function (c) { return q(c[1]); }).join(';')].concat(rows.map(function (r) { return cols.map(function (c) { return q(r[c[0]]); }).join(';'); })).join('\r\n');
  }

  return {
    norm: norm, clone: clone, nid: nid, fmtDate: fmtDate, fmtDateTime: fmtDateTime, signes: signes, plain: plain, words: words, serverOn: serverOn, call: call,
    CONTRAINTES: CONTRAINTES, ROLES_REGLES: ROLES_REGLES, MODES: MODES, defaultWf: defaultWf,
    CANAUX: CANAUX, DROITS: DROITS, droitOk: droitOk, allRights: allRights, TYPES: TYPES, typeOf: typeOf, htmlToMarkup: htmlToMarkup,
    SNAP_KEYS: SNAP_KEYS, snapOf: snapOf, addVersion: addVersion, diffWords: diffWords, diffBody: diffBody, diffStats: diffStats,
    similar: similar, search: search, snippet: snippet,
    UNE_MAX: UNE_MAX, uneAdd: uneAdd, uneReplace: uneReplace, uneMove: uneMove,
    KIND_LABEL: KIND_LABEL, PAGE_ST: PAGE_ST, defaultTitles: defaultTitles, defaultFixes: defaultFixes, defaultProd: defaultProd, gazettePages: gazettePages,
    titleOf: titleOf, edOf: edOf, pageOf: pageOf, fixeOf: fixeOf, tplOf: tplOf, resolveEls: resolveEls, sourceLabel: sourceLabel,
    newEditionFrom: newEditionFrom, dissociate: dissociate, reusePage: reusePage, applyOurTemplates: applyOurTemplates,
    capacity: capacity, fit: fit, autoFit: autoFit, autoArrange: autoArrange, freeSlot: freeSlot, occupancy: occupancy,
    PROMPTS: PROMPTS, localAI: localAI, fillPrompt: fillPrompt, csv: csv
  };
})();
/* ================= interface : valeurs du gabarit de l’espace rédaction ================= */
(function (R) {
  'use strict';
  var norm = R.norm, clone = R.clone, nid = R.nid;
  var pct = function (v) { return (Math.round(v * 10000) / 100) + '%'; };
  var pill = function (on) { return { bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pressed: on ? 'true' : 'false' }; };
  var opt = function (v, l) { return { v: v, l: l }; };
  var mergeById = function (base, extra) { var o = {}; base.concat(extra || []).forEach(function (m) { o[m.id] = Object.assign({}, o[m.id] || {}, m); }); return Object.keys(o).map(function (k) { return o[k]; }); };
  var today = function () { return new Date().toISOString().slice(0, 10); };

  /* ---------- données : chargement, enregistrement local ou serveur ---------- */
  function defaultMedia(c) {
    var lib = (c.libImgs || []).map(function (m) { return { id: m.id ? 'lib:' + m.id : m.src, src: m.src, kind: 'photo', caption: m.label, credit: 'Casa Besports', tags: [], rights: R.allRights('libre'), duree: '', source: 'casa', at: '2026-10-01T09:00:00.000Z' }; });
    var vids = (c.videos || []).map(function (v) { return { id: 'video:' + v.id, src: v.img, url: v.url || '', kind: 'video', caption: v.title, credit: 'Casa Besports', tags: [v.tag || ''], rights: R.allRights('libre'), duree: v.duree || '', source: 'casa', at: '2026-10-01T09:00:00.000Z' }; });
    return lib.concat(vids);
  }
  function defaultFil() {
    return { active: false, demo: true, partners: [{ id: 'demo', name: 'Rédaction partenaire (démo)', url: 'https://partenaire.exemple', etat: 'Démonstration' }],
      inbox: [{ id: 'fil-demo-1', from: 'Rédaction partenaire (démo)', at: '2026-10-12T16:40:00.000Z', kind: 'article', title: '[Exemple] Article brut reçu par le Fil', dek: 'Démonstration : un article arrive avec son titre, son chapeau, son texte, son crédit et les droits de sa photo. Rien n’est publié sans votre relecture.', body: 'Ce texte de démonstration montre le format d’échange du Fil entre rédactions.\n\n## Ce qui arrive\n\n- le titre et le chapeau\n- le texte brut, avec ses intertitres\n- le crédit et les droits de la photo\n\nReprenez-le en brouillon : il suit ensuite le circuit normal de relecture.', credit: 'Rédaction partenaire (démo)', photo: null, status: 'nouveau' }],
      outbox: [] };
  }
  R.data = function (self, c) {
    var s = self.state;
    if (s.rx) return s.rx;
    c = c || {};
    var rx = { v: 1, une: (self.allArticles ? self.allArticles() : []).slice(0, 5).map(function (a) { return { id: a.id, pinned: false }; }), wf: R.defaultWf(), prompts: clone(R.PROMPTS),
      prod: R.defaultProd(self.gazette ? self.gazette() : null), aiLog: [], media: defaultMedia(c), fil: defaultFil(), providers: [{ id: 'local', label: 'Assistant intégré (sans clé)' }],
      agence: { configured: false, demo: true }, iaProv: {}, srv: false };
    var saved = !R.serverOn() && self.readLS ? self.readLS('cb-redac-v1', null) : null;
    // une production enregistrée avant la nouvelle Gazette (25 pages, charte ivoire) est remplacée par la nouvelle
    if (saved && saved.v === 1) { ['une', 'wf', 'prompts', 'prod', 'aiLog', 'fil', 'iaProv'].forEach(function (k) { if (saved[k] && (k !== 'prod' || saved.prod.gz === 2)) rx[k] = saved[k]; }); if (saved.media) rx.media = mergeById(rx.media, saved.media); }
    var srv = s.rxServer;
    if (srv) {
      rx.srv = true;
      ['une', 'wf', 'providers', 'agence'].forEach(function (k) { if (srv[k] != null) rx[k] = srv[k]; });
      if (srv.prompts && srv.prompts.length) rx.prompts = srv.prompts;
      if (srv.prod) {
        // titre et numéros de la Gazette enregistrés avant la nouvelle maquette : on garde la nouvelle version
        var n0d = (rx.prod.editions || []).filter(function (e) { return e.id === 'e-gz-0'; })[0];
        var gzOld = (srv.prod.editions || []).some(function (e) { return e.id === 'e-gz-0' && n0d && (e.pages || []).length !== n0d.pages.length; });
        var srvTitles = (srv.prod.titles || []).filter(function (t) { return !(t.id === 't-gazette' && t.charte && t.charte.paper === '#f6f0e1'); });
        var srvEds = (srv.prod.editions || []).filter(function (e) { return !(gzOld && (e.id === 'e-gz-0' || e.id === 'e-gz-1')); });
        if (srvTitles.length) rx.prod.titles = mergeById(rx.prod.titles, srvTitles);
        if (srvEds.length) rx.prod.editions = mergeById(rx.prod.editions, srvEds);
        if (srv.prod.fixes && srv.prod.fixes.length) { var fx = {}; rx.prod.fixes.concat(srv.prod.fixes).forEach(function (f) { var k = f.key || f.id; fx[k] = Object.assign({}, fx[k] || {}, f, { key: k }); }); rx.prod.fixes = Object.keys(fx).map(function (k) { return fx[k]; }); }
      }
      if (srv.media) { rx.media = mergeById(rx.media, srv.media); rx.media.sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); }); }
      if (srv.fil) rx.fil = srv.fil;
      if (srv.aiLog) rx.aiLog = srv.aiLog;
    }
    s.rx = rx;
    return rx;
  };
  R.put = function (self, patch) {
    var rx = Object.assign({}, R.data(self), patch);
    self.setState({ rx: rx });
    if (!R.serverOn() && self.writeLS) {
      var keep = { v: 1 }; ['une', 'wf', 'prompts', 'prod', 'aiLog', 'fil', 'iaProv'].forEach(function (k) { keep[k] = rx[k]; });
      keep.media = rx.media.filter(function (m) { return m.edited && !/^blob:/.test(m.src || ''); });
      try { self.writeLS('cb-redac-v1', keep); } catch (e) {}
    }
    return rx;
  };
  R.ui = function (self, patch) { self.setState({ rxu: Object.assign({}, self.state.rxu || {}, patch) }); };
  var sync = function (self, method, path, body) { if (!R.serverOn()) return Promise.resolve(null); return R.call(method, '/redac' + path, body).catch(function (e) { self.say(e.message || 'Enregistrement impossible sur le serveur'); return null; }); };
  R.sync = sync;

  /* ---------- contexte d’un élément de page : titre, texte, image, réserve ---------- */
  function gzText(gp) {
    var out = [];
    var walk = function (v, k) { if (v == null) return; if (typeof v === 'string') { if (!/^(img|kind|rubric|n|script|dir|go)$/.test(k || '') && !/^(assets\/|data:|\/_blob\/|#)/.test(v)) out.push(v); return; } if (Array.isArray(v)) { v.forEach(function (x) { walk(x, k); }); return; } if (typeof v === 'object') Object.keys(v).forEach(function (kk) { if (kk !== 'img' && kk !== 'imgCap') walk(v[kk], kk); }); };
    ['bigA', 'bigB', 'kicker', 'lead', 'text', 'paras', 'stats', 'why', 'cols3', 'items', 'scores', 'rows', 'steps', 'pour', 'contre', 'timeline', 'num', 'entries', 'baro', 'classement', 'aside', 'quote', 'choc'].forEach(function (k) { walk(gp[k], k); });
    return out.join(' ');
  }
  function liv(ed, f) { if (!f) return null; if (f.permanent || f.key === 'sommaire') return f.livre || { at: '', by: 'automatique', text: '' }; return (ed && ed.livraisons && ed.livraisons[f.key]) || null; }
  function contentOf(c, rx, ed, e) {
    var ref = String(e.ref || '');
    if (e.kind === 'article') {
      if (ref.indexOf('post:') === 0) { var p = c.posts.find(function (x) { return x.id === ref.slice(5); }); if (p) return { title: p.printTitle || p.title, text: (p.dek ? p.dek + ' ' : '') + R.plain(p.body), img: p.img, src: 'Article de ' + p.author, postId: p.id }; }
      if (ref.indexOf('art:') === 0) { var a = c.ARTS.find(function (x) { return x.id === ref.slice(4); }); if (a) return { title: a.title, text: (a.dek || '') + ' ' + (a.points || []).join(' ') + ' ' + R.plain(a.body || ''), img: a.img, src: 'Article du site · ' + a.tag, artId: a.id }; }
      if (ref.indexOf('gz:') === 0) {
        var parts = ref.split(':'); var gp = c.G && c.G.pages[+parts[1]];
        if (gp && parts[2] === 'choc') return { title: 'Le détail choc 🔥', text: gp.choc ? gp.choc.t + (gp.choc.src ? ' · ' + gp.choc.src : '') : 'Détail choc à trouver : un fait vérifié, avec sa source.', img: null, src: 'Gazette N°0 · page ' + (+parts[1] + 1) };
        if (gp) { var txt = gzText(gp); if (parts[2] === 'b') txt = txt.slice(Math.floor(txt.length / 2)); else if (parts[2] === '2' || parts[2] === '3') { var k = +parts[2] - 1; txt = txt.slice(Math.floor(txt.length * k / 3), Math.floor(txt.length * (k + 1) / 3)); } else if (gp.cols3 && gp.cols3.length) txt = txt.slice(0, Math.floor(txt.length / 2)); return { title: gp.title, text: txt, img: gp.img, src: 'Gazette N°0 · page ' + (+parts[1] + 1) }; }
      }
      if (ref.indexOf('fil:') === 0) { var fi = (rx.fil.inbox || []).find(function (x) { return x.id === ref.slice(4); }); if (fi) return { title: fi.title, text: (fi.dek || '') + ' ' + R.plain(fi.body), src: 'Fil · ' + fi.from }; }
      return { title: 'Article à choisir', text: '', src: '' };
    }
    if (e.kind === 'photo') { var srcI = ref.indexOf('img:') === 0 ? ref.slice(4) : ref; var m = rx.media.find(function (x) { return x.id === srcI || x.src === srcI; }); return { title: m ? m.caption : 'Photo à choisir', img: m ? m.src : srcI, text: m && m.credit ? '© ' + m.credit : '', media: m, okGazette: !m || R.droitOk(m, 'gazette') }; }
    if (e.kind === 'pub') return { title: 'Publicité', text: ref || 'Annonceur à confirmer' };
    if (e.kind === 'fixe') { var f = R.fixeOf(rx.prod, ref); var l = liv(ed, f); return { title: f ? f.titre : ref, text: l ? (l.text || (l.img ? '' : 'Livré · ' + R.fmtDate(l.at))) : '', img: l && l.img, reserved: !l, fixe: f }; }
    return { title: '', text: '' };
  }
  R.contentOf = contentOf;

  /* ---------- règles de publication : contrôle avant soumission ou publication ---------- */
  R.guardCheck = function (c, rx, action, p, staffRole) {
    var chk = c.checksOf(p); var m = rx.media.find(function (x) { return x.src === p.img || x.id === p.img; });
    var fails = { relecture: action === 'publier' && !c.isAdmin, qualite: chk.score < 50, alt: !String(p.alt || '').trim(), droits: !!p.img && !(m ? R.droitOk(m, 'site') : false), club: !(p.clubs || []).length, titre: String(p.title || '').length > 80 };
    var out = { block: [], warn: [] };
    R.CONTRAINTES.forEach(function (k) {
      if (k.actions.indexOf(action) < 0 || !fails[k.id]) return;
      if (c.isAdmin && !k.tous) return;
      var mode = c.isAdmin ? 'bloquant' : ((rx.wf[k.id] || {})[staffRole] || 'bloquant');
      if (mode === 'off') return;
      (mode === 'alerte' ? out.warn : out.block).push(k.id === 'droits' ? 'Photo non autorisée sur le site : vérifiez ses droits dans la médiathèque' : k.id === 'qualite' ? 'Score qualité ' + chk.score + '/100 (minimum 50)' : k.label);
    });
    return out;
  };
  R.guard = function (self, c, rx, action, p, proceed) {
    var g = R.guardCheck(c, rx, action, p, c.staffRole);
    if (g.block.length) { R.ui(self, { wfAlert: { action: action, block: g.block, warn: g.warn } }); self.say('Action impossible : ' + g.block[0]); return; }
    if (g.warn.length) { R.ui(self, { wfAlert: { action: action, block: [], warn: g.warn, go: true } }); self._rxProceed = proceed; return; }
    R.ui(self, { wfAlert: null }); proceed('');
  };

  /* ================= valeurs ================= */
  R.vals = function (self, c) {
    var s = self.state; var u = s.rxu || {}; var rx = R.data(self, c);
    var isAdmin = c.isAdmin, isChef = c.staffRole === 'collaborateur' || isAdmin;
    var V = {};
    var tab = s.studioTab;
    V.isUne = tab === 'une'; V.isProd = tab === 'prod'; V.isFil = tab === 'fil'; V.isIa = tab === 'ia'; V.isExports = tab === 'exports';

    /* ----- aide en ligne ----- */
    // fiches de la rédaction pour tous ; fiches d’administration (comptes, CRM, santé…) pour l’administrateur et les chefs d’édition
    var AIDE = (typeof CASA_AIDE !== 'undefined' ? CASA_AIDE : (typeof window !== 'undefined' && window.CASA_AIDE) || []).filter(function (f) { return c.clubRole ? f.espaces.indexOf('club') >= 0 : f.espaces.indexOf('redaction') >= 0 || (isChef && f.espaces.indexOf('admin') >= 0); });
    var ecran = { dash: 'redaction', list: 'articles', queue: 'workflow', edit: 'articles', une: 'une', prod: 'editions', media: 'medias', fil: 'fil', ia: 'ia', team: 'roles', exports: 'exports', crm: 'crm', reseau: 'reseau', club: 'club', clist: 'club', cedit: 'club', fiche: 'club', charte: 'club' }[tab] || 'redaction';
    var aq = norm(u.aideQ || '');
    var ficheV = function (f) { return { id: f.id, titre: f.titre, resume: f.resume, open: function () { R.ui(self, { aideId: f.id }); } }; };
    var aideF = AIDE.find(function (f) { return f.id === u.aideId; });
    V.aide = {
      isOpen: !!u.aideOpen, open: function () { R.ui(self, { aideOpen: true, aideId: null, aideQ: '' }); if (R.serverOn() && isAdmin) loadSante(self); }, close: function () { R.ui(self, { aideOpen: false }); },
      q: u.aideQ || '', onQ: function (e) { R.ui(self, { aideQ: e.target.value, aideId: null }); },
      isList: !aideF, isFiche: !!aideF,
      related: AIDE.filter(function (f) { return f.ecrans.indexOf(ecran) >= 0; }).map(ficheV),
      all: AIDE.filter(function (f) { return !aq || norm(f.titre + ' ' + f.resume + ' ' + f.motscles + ' ' + f.sections.map(function (x) { return x.h + ' ' + (x.p || []).join(' ') + ' ' + (x.l || []).join(' '); }).join(' ')).indexOf(aq) >= 0; }).map(ficheV),
      back: function () { R.ui(self, { aideId: null }); },
      fiche: aideF ? { titre: aideF.titre, resume: aideF.resume, sections: aideF.sections.map(function (x) { return { h: x.h, p: (x.p || []).map(function (t) { return { t: t }; }), l: (x.l || []).map(function (t) { return { t: t }; }), hasL: !!(x.l && x.l.length), code: x.code || '', hasCode: !!x.code }; }), isSante: aideF.id === 'sante' } : null
    };
    V.aide.hasRelated = V.aide.related.length > 0 && !aq;
    var sante = u.sante;
    V.aide.sante = sante ? sante.items.map(function (i) { return { label: i.label, value: i.value, ok: i.ok, color: i.ok ? 'var(--success)' : i.warn ? 'var(--gold-text)' : 'var(--danger)', dot: i.ok ? '●' : '○' }; }) : [{ label: 'Mode', value: R.serverOn() ? 'Chargement de l’état du serveur…' : 'Démonstration dans le navigateur : pas de serveur. Les données restent sur cet appareil.', ok: !R.serverOn(), color: 'var(--muted)', dot: '●' }];
    V.aide.santeAt = sante ? 'Relevé le ' + R.fmtDateTime(sante.at) : '';

    /* ----- badges de la navigation ----- */
    var nouveauxFil = (rx.fil.inbox || []).filter(function (x) { return x.status === 'nouveau'; }).length;
    var reserves = reservations(c, rx).length;
    V.badges = { fil: nouveauxFil, prod: reserves };

    /* ----- éditeur : type, version imprimée, vidéo, droits, collage, versions, similaires, IA, règles ----- */
    V.ed = tab === 'edit' ? edVals(self, c, rx, u, isAdmin, isChef) : {};
    /* ----- recherche avancée des articles ----- */
    V.list = tab === 'list' ? listVals(self, c, rx, u) : { rows: [] };
    /* ----- une ----- */
    if (V.isUne || tab === 'dash') V.une = uneVals(self, c, rx, u, isChef);
    /* ----- production ----- */
    if (V.isProd || u.globalOpen) V.prod = prodVals(self, c, rx, u, isAdmin, isChef);
    /* ----- médiathèque ----- */
    if (tab === 'media') V.media = mediaVals(self, c, rx, u, isAdmin);
    /* ----- fil ----- */
    if (V.isFil) V.fil = filVals(self, c, rx, u);
    /* ----- IA ----- */
    if (V.isIa) V.ia = iaVals(self, c, rx, u, isAdmin);
    /* ----- règles ----- */
    if (tab === 'team') V.regles = reglesVals(self, c, rx, isAdmin);
    /* ----- exports ----- */
    if (V.isExports) V.exp = expVals(self, c, rx, u);
    /* ----- dialogue commun ----- */
    V.dlg = dlgVals(self, c, rx, u, isAdmin, isChef);
    V.wf = wfAlertVals(self, c, rx, u);
    return V;
  };

  function loadSante(self) {
    R.call('GET', '/redac/sante').then(function (r) { R.ui(self, { sante: r }); }).catch(function () {});
  }

  /* ================= éditeur ================= */
  function edVals(self, c, rx, u, isAdmin, isChef) {
    var p = c.edRaw; if (!p || !p.id) return { versions: [], sim: [], simRes: [], prompts: [], rights: [], typeOpts: [] };
    var upd = c.upd; var locked = c.edLocked;
    var E = {};
    E.typeOpts = R.TYPES.map(function (t) { return opt(t[0], t[1]); }); E.type = p.type || 'article'; E.onType = function (e) { upd({ type: e.target.value }); };
    E.typeHint = (function () { var ok = R.typeOf(p.type)[2]; var l = []; if (ok.h) l.push('intertitres'); if (ok.q) l.push('citations'); if (ok.l) l.push('listes'); if (ok.b) l.push('gras'); if (ok.i) l.push('italique'); return 'Mises en forme conservées au collage : ' + l.join(', ') + '.'; })();
    E.printTitle = p.printTitle || ''; E.onPrintTitle = function (e) { upd({ printTitle: e.target.value }); };
    var used = placements(c, rx, p.id);
    E.printPh = used.length && used[0].dflt ? 'Titre par défaut du carton : « ' + used[0].dflt + ' »' : 'Par défaut : le titre web';
    E.placements = used.map(function (x) { return { label: x.label, open: function () { R.ui(self, { prodEd: x.ed, prodPage: x.page, prodView: 'page', elSel: x.el }); c.go('studio', { studioTab: 'prod' }); } }; });
    E.hasPlacements = E.placements.length > 0;
    var v = p.video || {}; E.videoUrl = v.url || ''; E.videoDur = v.duree || '';
    E.onVideoUrl = function (e) { upd({ video: Object.assign({}, p.video || {}, { url: e.target.value }) }); };
    E.onVideoDur = function (e) { upd({ video: Object.assign({}, p.video || {}, { duree: e.target.value.replace(/[^0-9:]/g, '').slice(0, 8) }) }); };
    E.videoDurOk = !E.videoDur || /^\d{1,3}:[0-5]\d$/.test(E.videoDur);
    var m = rx.media.find(function (x) { return x.src === p.img || x.id === p.img; });
    E.rights = R.CANAUX.map(function (k) { var d = m && m.rights ? m.rights[k[0]] : '?'; var ok = d === 'libre' || d === 'credit'; return { l: k[1], icon: ok ? '✓' : d === '?' ? '?' : '✕', color: ok ? 'var(--success)' : d === '?' ? 'var(--gold-text)' : 'var(--danger)', title: k[1] + ' : ' + (R.DROITS.find(function (x) { return x[0] === d; }) || ['', 'À vérifier'])[1] }; });
    E.credit = m && m.credit ? '© ' + m.credit : 'Crédit non renseigné';
    // collage
    E.onPaste = function (e) {
      if (locked) return;
      var cd = e.clipboardData; if (!cd) return;
      var html = cd.getData('text/html'); var txt = cd.getData('text/plain');
      var t = e.target; var a = t.selectionStart || 0, b = t.selectionEnd || 0; var body = p.body || '';
      var ins, msg;
      if (html) { var r = R.htmlToMarkup(html, p.type); ins = r.text; msg = r.dropped ? r.dropped + ' mise(s) en forme non compatible(s) avec le type « ' + R.typeOf(p.type)[1] + ' » : passée(s) en texte.' : 'Collage : mises en forme conservées.'; }
      else { ins = txt; msg = ''; }
      if (ins == null) return;
      e.preventDefault();
      var nb = body.slice(0, a) + ins + body.slice(b);
      upd({ body: nb }); if (msg) R.ui(self, { pasteMsg: msg });
      setTimeout(function () { try { t.selectionStart = t.selectionEnd = a + ins.length; } catch (er) {} }, 0);
    };
    E.pasteMsg = u.pasteMsg || ''; E.hasPasteMsg = !!u.pasteMsg;
    // versions
    var vs = (p.versions || []).slice().reverse();
    E.versions = vs.map(function (x) {
      var sel = u.verN === x.n && u.verPost === p.id;
      return { n: 'v' + x.n, label: x.label, who: x.who, when: R.fmtDateTime(x.at), size: R.signes(R.plain(x.snap.body)) + ' signes', sel: sel ? 'true' : 'false', bg: sel ? 'var(--surface-2)' : 'transparent',
        view: function () { R.ui(self, { verN: x.n, verPost: p.id }); self.setState({ edMode: 'version' }); },
        compare: function () { R.ui(self, { verN: x.n, verPost: p.id }); self.setState({ edMode: 'compare' }); },
        restore: function () { if (locked) { self.say('Article verrouillé : restauration impossible'); return; } self.setPost(p.id, Object.assign({}, clone(x.snap)), 'Version v' + x.n + ' restaurée (« ' + x.label + ' »).'); R.ui(self, { verN: null }); self.setState({ edMode: 'write' }); self.say('Version v' + x.n + ' restaurée'); } };
    });
    E.hasVersions = E.versions.length > 0; E.versionsCount = String(vs.length);
    E.verName = u.verName || ''; E.onVerName = function (e) { R.ui(self, { verName: e.target.value }); };
    E.makeVersion = function () { var nm = String(u.verName || '').trim() || 'Version nommée'; var who = self.me().name; var posts = self.posts().map(function (x) { return x.id === p.id ? Object.assign({}, x, { versions: R.addVersion(x, who, nm, true) }) : x; }); self.setState({ posts: posts }); if (self.setPost) self.setPost(p.id, {}, 'Version nommée : « ' + nm + ' ».'); R.ui(self, { verName: '' }); self.say('Version « ' + nm + ' » créée'); };
    var ver = (p.versions || []).find(function (x) { return x.n === u.verN && u.verPost === p.id; });
    E.ver = ver ? { n: 'v' + ver.n, label: ver.label, who: ver.who, when: R.fmtDateTime(ver.at), title: ver.snap.title, dek: ver.snap.dek, blocks: c.blocksOf(ver.snap.body || ''), img: ver.snap.img || p.img } : null;
    if (ver) {
      var tD = R.diffWords(ver.snap.title, p.title).map(function (x) { return { t: x.t, ins: !!x.ins, del: !!x.del, plain: !x.ins && !x.del }; });
      var dD = R.diffWords(ver.snap.dek, p.dek).map(function (x) { return { t: x.t, ins: !!x.ins, del: !!x.del, plain: !x.ins && !x.del }; });
      var bD = R.diffBody(ver.snap.body, p.body); var st = R.diffStats(bD);
      var other = [];
      ['img', 'alt', 'tag', 'sport', 'type', 'printTitle', 'premium'].forEach(function (k) { if (JSON.stringify(ver.snap[k] == null ? '' : ver.snap[k]) !== JSON.stringify(p[k] == null ? '' : p[k])) other.push({ k: { img: 'Image de une', alt: 'Texte alternatif', tag: 'Rubrique', sport: 'Discipline', type: 'Type', printTitle: 'Titre imprimé', premium: 'Premium' }[k], a: String(ver.snap[k] == null ? '—' : ver.snap[k]).slice(0, 80), b: String(p[k] == null ? '—' : p[k]).slice(0, 80) }); });
      E.cmp = { title: tD, dek: dD, body: bD, stats: '+' + st.ins + ' signes ajoutés · −' + st.del + ' signes supprimés depuis v' + ver.n, other: other, hasOther: other.length > 0, label: 'v' + ver.n + ' (' + ver.label + ', ' + R.fmtDateTime(ver.at) + ') → version actuelle' };
    }
    E.isVersion = self.state.edMode === 'version' && !!ver; E.isCompare = self.state.edMode === 'compare' && !!ver;
    E.closeVersion = function () { R.ui(self, { verN: null }); self.setState({ edMode: 'write' }); };
    E.cmpFromVer = function () { self.setState({ edMode: 'compare' }); };
    E.restoreVer = function () { var x = E.versions.find(function (vv) { return vv.sel === 'true'; }); if (x) x.restore(); };
    E.videoDurBad = !E.videoDurOk;
    // articles similaires (10 plus pertinents) + recherche classique
    var pool = c.ARTS.map(function (a) { return { id: a.id, title: a.title, dek: a.dek, body: a.body || (a.points || []).join(' '), tag: a.tag, sport: a.sport, clubs: a.clubs || [], kind: 'site' }; })
      .concat(c.posts.filter(function (x) { return x.status !== 'published' && !x.online; }).map(function (x) { return { id: x.id, title: x.title, dek: x.dek, body: x.body, tag: x.tag, sport: x.sport, clubs: x.clubs || [], kind: 'post', status: x.status }; }));
    var rel = p.related || [];
    var simView = function (d, sc) { var linked = rel.indexOf(d.id) >= 0; return { title: d.title, sub: (d.kind === 'post' ? 'Brouillon de la rédaction' : (d.tag || d.sport)) + (sc != null ? ' · pertinence ' + Math.min(99, Math.round(sc * 100)) + ' %' : ''), linkLabel: linked ? 'Lié ✓' : 'Lier', linked: linked ? 'true' : 'false',
      link: function () { if (locked) return; upd({ related: linked ? rel.filter(function (x) { return x !== d.id; }) : rel.concat([d.id]).slice(0, 6) }); },
      open: function () { if (d.kind === 'post') c.openEditById(d.id); else c.go('article', { articleId: d.id }); } }; };
    E.sim = R.similar({ id: p.id, title: p.title, dek: p.dek, body: p.body, tag: p.tag, sport: p.sport, clubs: p.clubs }, pool, 10).map(function (x) { return simView(x.d, x.sc); });
    E.hasSim = E.sim.length > 0;
    E.simQ = u.simQ || ''; E.onSimQ = function (e) { R.ui(self, { simQ: e.target.value }); };
    E.simRes = u.simQ ? R.search(pool, u.simQ, ['title', 'dek', 'tag', 'sport', function (d) { return R.plain(d.body); }]).sort(function (a, b) { return b.sc - a.sc; }).slice(0, 8).map(function (x) { return simView(x.it, null); }) : [];
    E.hasSimRes = E.simRes.length > 0; E.simResNone = !!u.simQ && !E.simRes.length;
    E.relatedCount = String(rel.length);
    // assistant IA : prompts selon le rôle, choix du fournisseur par champ
    var role = isAdmin ? 'admin' : c.staffRole;
    var prompts = rx.prompts.filter(function (x) { return x.roles.indexOf('tous') >= 0 || x.roles.indexOf(role) >= 0; });
    var provs = rx.providers && rx.providers.length ? rx.providers : [{ id: 'local', label: 'Assistant intégré' }];
    E.prompts = prompts.map(function (x) { var on = u.aiPrompt === x.id; return Object.assign(pill(on), { label: x.label, run: function () { runPrompt(self, c, rx, x, p, (rx.iaProv || {})[x.champ] || provs[0].id); } }); });
    E.multiProv = provs.length > 1;
    var cur = prompts.find(function (x) { return x.id === u.aiPrompt; });
    E.provOpts = provs.map(function (x) { return opt(x.id, x.label); });
    E.prov = cur ? ((rx.iaProv || {})[cur.champ] || provs[0].id) : provs[0].id;
    E.provField = cur ? 'pour le champ « ' + cur.champ + ' »' : '';
    E.onProv = function (e) { var champ = cur ? cur.champ : 'defaut'; var ip = Object.assign({}, rx.iaProv || {}); ip[champ] = e.target.value; R.put(self, { iaProv: ip }); };
    E.aiBusy = !!u.aiBusy;
    var out = u.aiOut && u.aiOut.post === p.id ? u.aiOut : null;
    E.aiTitle = out ? out.title + ' · ' + out.provLabel : '';
    E.aiOut = out ? out.lines.map(function (t) { var canApply = !locked && ['titre', 'chapo', 'print', 'legende'].indexOf(out.champ) >= 0; return { t: t, canApply: canApply, apply: function () { var v2 = t.replace(/^\s*(\d+[.)]|[-•])\s*/, '').replace(/^«\s*|\s*»$/g, ''); var patch = out.champ === 'titre' ? { title: v2.slice(0, 90) } : out.champ === 'chapo' ? { dek: v2 } : out.champ === 'print' ? { printTitle: v2.slice(0, 60) } : { alt: v2.slice(0, 160) }; upd(patch); self.say('Proposition appliquée'); } }; }) : [];
    E.hasAiOut = E.aiOut.length > 0;
    // actions de diffusion
    var g = (rx.wf.relecture || {})[c.staffRole];
    E.canPublishNoReview = !isAdmin && !locked && g === 'alerte' && ['draft', 'corrections'].indexOf(p.status) >= 0;
    E.publishNoReview = function () { R.guard(self, c, rx, 'publier', p, function (lev) { self.setPost(p.id, { status: 'published', override: true }, 'Publié sans relecture par ' + self.me().name + (lev ? ' · contraintes levées : ' + lev : '') + '.'); self.say('Article publié (sans relecture)'); }); };
    E.isOnline = !!p.online; E.onlineLabel = p.online ? 'En ligne depuis le ' + R.fmtDateTime(p.online.at) + (p.status !== 'published' ? ' · la version en ligne reste publiée pendant la modification' : '') : '';
    E.canReopen = isAdmin && p.status === 'published';
    E.reopen = function () { self.setPost(p.id, { status: 'draft' }, 'Remis en rédaction : la version en ligne reste publiée.'); self.say('Article remis en rédaction (toujours en ligne)'); };
    E.canUnpublish = isAdmin && !!p.online;
    E.unpublish = function () { self.setPost(p.id, { online: null, status: p.status === 'published' ? 'draft' : p.status }, 'Retiré du site.'); self.say('Article retiré du site'); };
    E.canUne = isChef && !!p.online;
    E.toUne = function () { var r = R.uneAdd(rx.une, p.id, 0); if (r.err) { self.say(r.err); return; } R.put(self, { une: r.slots }); sync(self, 'PUT', '/une', { slots: r.slots }); self.say('Article placé en ouverture de la une'); };
    E.filSend = function () { R.ui(self, { dlg: { kind: 'fil', post: p.id } }); };
    E.placeInPage = function () { R.ui(self, { dlg: { kind: 'add', addKind: 'article', presetRef: 'post:' + p.id } }); c.go('studio', { studioTab: 'prod' }); };
    E.canPlace = isChef;
    return E;
  }
  function runPrompt(self, c, rx, pr, p, provId) {
    var prov = (rx.providers || []).find(function (x) { return x.id === provId; }) || { id: 'local', label: 'Assistant intégré' };
    var who = self.me().name; var role = c.isAdmin ? 'admin' : c.staffRole;
    var logIt = function (ok) { var l = (rx.aiLog || []).concat([{ at: new Date().toISOString(), who: who, role: role, prompt: pr.label, promptId: pr.id, provider: prov.label, post: p.id, title: p.title, ok: ok }]).slice(-5000); R.put(self, { aiLog: l }); };
    var show = function (lines) { R.ui(self, { aiPrompt: pr.id, aiBusy: false, aiOut: { post: p.id, title: pr.label, champ: pr.champ, provLabel: prov.label, lines: lines.filter(function (x) { return String(x).trim(); }) } }); };
    if (prov.id === 'local' || !R.serverOn()) { show(R.localAI(pr.id, p)); if (!R.serverOn()) logIt(true); else R.call('POST', '/redac/ia/log', { promptId: pr.id, prompt: pr.label, provider: prov.label, post: p.id, title: p.title }).catch(function () {}); return; }
    R.ui(self, { aiPrompt: pr.id, aiBusy: true });
    R.call('POST', '/ai/run', { prompt: pr.id, provider: prov.id, post: { id: p.id, title: p.title }, vars: { titre: p.title, chapo: p.dek, texte: R.plain(p.body).slice(0, 6000), alt: p.alt || '' } })
      .then(function (r) { show(String(r.text || '').split('\n').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12)); })
      .catch(function (e) { R.ui(self, { aiBusy: false }); self.say((e && e.message) || 'IA indisponible : assistant intégré utilisé'); show(R.localAI(pr.id, p)); });
  }
  function placements(c, rx, postId) {
    var out = [];
    rx.prod.editions.forEach(function (ed) {
      var t = R.titleOf(rx.prod, ed.title);
      ed.pages.forEach(function (pg) { R.resolveEls(rx.prod, pg).forEach(function (e) { if (e.kind === 'article' && e.ref === 'post:' + postId) { var tp = R.tplOf(t, e.tpl); out.push({ ed: ed.id, page: pg.id, el: e.id, label: t.short + ' · ' + ed.label + ' · page ' + pg.n, dflt: tp && tp.titre && !e.title ? tp.titre : '' }); } }); });
    });
    return out;
  }

  /* ================= alerte des règles de publication ================= */
  function wfAlertVals(self, c, rx, u) {
    var a = u.wfAlert; if (!a) return { show: false };
    return { show: true, cls: a.block.length ? 'rx-alert-err' : 'rx-alert-warn', isBlock: a.block.length > 0, canGo: !!a.go, block: a.block.map(function (t) { return { t: t }; }), warn: a.warn.map(function (t) { return { t: t }; }),
      title: a.block.length ? 'Action bloquée par les règles de publication' : 'Contraintes non respectées',
      go: function () { var f = self._rxProceed; self._rxProceed = null; R.ui(self, { wfAlert: null }); if (f) f(a.warn.join(' ; ')); },
      cancel: function () { self._rxProceed = null; R.ui(self, { wfAlert: null }); } };
  }

  /* ================= articles : recherche avancée ================= */
  function listVals(self, c, rx, u) {
    var L = {};
    var authors = []; c.posts.forEach(function (p) { if (authors.indexOf(p.author) < 0) authors.push(p.author); });
    L.typeOpts = [opt('', 'Tous les types')].concat(R.TYPES.map(function (t) { return opt(t[0], t[1]); }));
    L.sportOpts = [opt('', 'Toutes les disciplines')].concat(['Football', 'Basketball', 'Rugby', 'Water-polo', 'Trail', 'Handball', 'Natation', 'Tennis', 'Judo', 'Autre'].map(function (x) { return opt(x, x); }));
    L.authorOpts = [opt('', 'Tous les auteurs')].concat(authors.map(function (a) { return opt(a, a); }));
    L.periodOpts = [opt('', 'Toute période'), opt('1', 'Aujourd’hui'), opt('7', '7 derniers jours'), opt('30', '30 derniers jours'), opt('365', 'Cette année')];
    L.sortOpts = [opt('recent', 'Plus récents'), opt('pert', 'Pertinence'), opt('titre', 'Titre (A → Z)')];
    var f = u.lf || {};
    var set = function (k) { return function (e) { var nf = Object.assign({}, f); nf[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; R.ui(self, { lf: nf }); }; };
    L.type = f.type || ''; L.sport = f.sport || ''; L.author = f.author || ''; L.period = f.period || ''; L.sort = f.sort || 'recent'; L.online = !!f.online;
    L.onType = set('type'); L.onSport = set('sport'); L.onAuthor = set('author'); L.onPeriod = set('period'); L.onSort = set('sort'); L.onOnline = set('online');
    L.reset = function () { R.ui(self, { lf: {} }); self.setState({ stQ: '', stFilter: 'all' }); };
    var now = Date.now();
    var base = c.posts.filter(function (p) {
      if (self.state.stFilter !== 'all' && p.status !== self.state.stFilter) return false;
      if (f.type && (p.type || 'article') !== f.type) return false; if (f.sport && p.sport !== f.sport) return false; if (f.author && p.author !== f.author) return false;
      if (f.online && !p.online) return false;
      if (f.period) { var t = Date.parse(p.updatedAt || '') || 0; if (!t || now - t > (+f.period) * 864e5) return false; }
      return true;
    });
    var clubName = function (id) { var cl = c.clubById(id); return cl ? cl.name : ''; };
    var res = R.search(base, self.state.stQ || '', ['title', 'dek', 'tag', 'author', 'sport', function (p) { return R.plain(p.body); }, function (p) { return (p.clubs || []).map(clubName).join(' '); }, function (p) { return p.printTitle || ''; }]);
    if (L.sort === 'pert' && self.state.stQ) res.sort(function (a, b) { return b.sc - a.sc; });
    else if (L.sort === 'titre') res.sort(function (a, b) { return a.it.title.localeCompare(b.it.title, 'fr'); });
    else res.sort(function (a, b) { return (Date.parse(b.it.updatedAt || '') || 0) - (Date.parse(a.it.updatedAt || '') || 0); });
    L.rows = res.map(function (x) {
      var p = x.it;
      return { id: p.id, title: p.title, author: p.author, sport: p.sport, updated: p.updatedAt ? R.fmtDateTime(p.updatedAt) : p.updated, type: R.typeOf(p.type)[1], online: !!p.online, versions: String((p.versions || []).length), snip: x.snip, hasSnip: x.snip.length > 0 };
    });
    L.count = String(res.length) + ' article' + (res.length > 1 ? 's' : '');
    return L;
  }

  /* ================= une ================= */
  function uneVals(self, c, rx, u, isChef) {
    var U = {};
    var arts = c.ARTS; var findA = function (id) { return arts.find(function (a) { return a.id === id; }); };
    var postOf = function (id) { return c.posts.find(function (p) { return p.id === id; }); };
    var stateOf = function (id) { var p = postOf(id); if (!p) return ['En ligne', '#d8efe6', '#11583f']; if (p.status === 'published') return ['Publié', '#d8efe6', '#11583f']; if (p.online) return ['En ligne · en modification', '#fff1d6', '#7a5208']; return ['Hors ligne', '#e6e6e6', '#555']; };
    var slots = (rx.une || []).filter(function (x) { return findA(x.id); });
    var save = function (ns, msg) { R.put(self, { une: ns }); sync(self, 'PUT', '/une', { slots: ns }); R.ui(self, { uneErr: '', uneMsg: msg || '' }); };
    U.slots = slots.map(function (x, i) {
      var a = findA(x.id); var st = stateOf(x.id);
      return { n: String(i + 1), title: a.title, img: a.img, sub: (a.tag || a.sport) + (i === 0 ? ' · ouverture' : ''), state: st[0], stBg: st[1], stFg: st[2], pinned: !!x.pinned, pinnedStr: x.pinned ? 'true' : 'false', pinLabel: x.pinned ? 'Désépingler' : 'Épingler à cette position', pinColor: x.pinned ? 'var(--gold-text)' : 'var(--muted)',
        canEdit: isChef, noPin: !isChef, noUp: !isChef || i === 0 || x.pinned || (slots[i - 1] && slots[i - 1].pinned), noDown: !isChef || i === slots.length - 1 || x.pinned || (slots[i + 1] && slots[i + 1].pinned), noRemove: !isChef || !!x.pinned,
        pin: function () { if (!isChef) return; var ns = slots.map(function (y, k) { return k === i ? { id: y.id, pinned: !y.pinned } : y; }); save(ns, x.pinned ? 'Article désépinglé' : 'Article épinglé en position ' + (i + 1)); },
        up: function () { var r = R.uneMove(slots, i, -1); if (r.err) R.ui(self, { uneErr: r.err }); else save(r.slots); },
        down: function () { var r = R.uneMove(slots, i, 1); if (r.err) R.ui(self, { uneErr: r.err }); else save(r.slots); },
        remove: function () { if (x.pinned) { R.ui(self, { uneErr: 'Désépinglez l’article avant de le retirer.' }); return; } save(slots.filter(function (y, k) { return k !== i; }), 'Article retiré de la une'); } };
    });
    U.err = u.uneErr || ''; U.msg = u.uneMsg || '';
    U.q = u.uneQ || ''; U.onQ = function (e) { R.ui(self, { uneQ: e.target.value }); };
    U.pos = String(u.unePos || 1); U.onPos = function (e) { R.ui(self, { unePos: +e.target.value }); };
    U.posOpts = []; for (var k = 1; k <= R.UNE_MAX; k++) U.posOpts.push(opt(String(k), 'Position ' + k + (k === 1 ? ' (ouverture)' : '')));
    var pos = (u.unePos || 1) - 1;
    var found = R.search(arts, u.uneQ || '', ['title', 'dek', 'tag', 'sport']).slice(0, u.uneQ ? 12 : 8);
    U.results = found.map(function (x) {
      var a = x.it; var st = stateOf(a.id); var at = slots.findIndex(function (y) { return y.id === a.id; });
      return { title: a.title, sub: st[0] + ' · ' + (a.tag || a.sport) + (at >= 0 ? ' · déjà en position ' + (at + 1) : ''), canEdit: isChef,
        add: function () { var r = R.uneAdd(slots, a.id, pos); if (r.err) { R.ui(self, { uneErr: r.err, uneMsg: '' }); return; } save(r.slots, '« ' + a.title + ' » ajouté en position ' + (pos + 1) + (r.dropped ? ' · ' + r.dropped + ' article(s) sorti(s) de la une' : '')); },
        replace: function () { var r = R.uneReplace(slots, a.id, pos); if (r.err) { R.ui(self, { uneErr: r.err, uneMsg: '' }); return; } var old = r.replaced && findA(r.replaced); save(r.slots, '« ' + a.title + ' » remplace ' + (old ? '« ' + old.title + ' »' : 'la position ' + (pos + 1))); } };
    });
    U.readOnly = !isChef;
    return U;
  }

  /* ================= production (éditions, pages, éléments fixes) ================= */
  function reservations(c, rx) {
    var out = [];
    rx.prod.editions.filter(function (e) { return e.status !== 'bouclee'; }).forEach(function (ed) {
      ed.pages.forEach(function (pg) { R.resolveEls(rx.prod, pg).forEach(function (e) { if (e.kind !== 'fixe') return; var f = R.fixeOf(rx.prod, e.ref); if (f && !liv(ed, f)) out.push({ ed: ed, page: pg, el: e, f: f }); }); });
    });
    return out;
  }
  function prodVals(self, c, rx, u, isAdmin, isChef) {
    var prod = rx.prod; var P = {};
    var title = R.titleOf(prod, u.prodTitle || (prod.titles[0] && prod.titles[0].id));
    var eds = prod.editions.filter(function (e) { return e.title === title.id; }).sort(function (a, b) { return a.num - b.num; });
    var ed = R.edOf(prod, u.prodEd) && R.edOf(prod, u.prodEd).title === title.id ? R.edOf(prod, u.prodEd) : (eds.filter(function (e) { return e.status !== 'bouclee'; })[0] || eds[eds.length - 1]);
    var view = u.prodView || 'plan';
    var lenOf = function (e) { return R.signes(contentOf(c, rx, ed, e).text); };
    P.titleName = title.name; P.titleSub = title.format + ' · ' + title.rythme + ' · charte « ' + title.charte.label + ' »';
    P.ratio = title.ratio; P.paper = title.charte.paper; P.ink = title.charte.ink; P.accent = title.charte.accent; P.font = title.charte.font;
    P.titles = prod.titles.map(function (t) { return Object.assign(pill(t.id === title.id), { name: t.name, pick: function () { R.ui(self, { prodTitle: t.id, prodEd: null, prodPage: null, prodView: 'plan', elSel: null }); } }); });
    var stEd = function (e) { return e.status === 'bouclee' ? 'Bouclée' : 'En préparation'; };
    var progress = function (e) { var n = e.pages.length || 1; return e.pages.filter(function (p) { return p.status === 'validee' || p.status === 'prete'; }).length / n; };
    P.eds = eds.map(function (e) { var on = ed && e.id === ed.id; return { label: e.label, date: e.date ? R.fmtDate(e.date) : 'date à fixer', stLabel: stEd(e), progW: pct(progress(e)), pressed: on ? 'true' : 'false', bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pick: function () { R.ui(self, { prodEd: e.id, prodPage: null, prodView: 'plan', elSel: null }); } }; });
    P.hasEd = !!ed;
    var resv = reservations(c, rx).filter(function (r) { return r.ed.title === title.id; });
    P.views = [['plan', 'Chemin de fer', 0], ['page', 'Page', 0], ['suivi', 'Suivi de production', resv.length], ['titres', 'Titres et modèles', 0]].map(function (v) { return Object.assign(pill(view === v[0]), { label: v[1], badge: v[2] ? String(v[2]) : '', hasBadge: v[2] > 0, pick: function () { R.ui(self, { prodView: v[0] }); } }); });
    P.isPlan = view === 'plan' && !!ed; P.isPage = view === 'page' && !!ed; P.isSuivi = view === 'suivi'; P.isTitres = view === 'titres';
    P.msg = u.prodMsg || ''; P.hasMsg = !!u.prodMsg; P.err = u.prodErr || ''; P.hasErr = !!u.prodErr;
    var edEditable = !!ed && ed.status !== 'bouclee' && isChef || (!!ed && ed.status !== 'bouclee' && !isChef);
    P.edLabel = ed ? ed.label : ''; P.edStatus = ed ? stEd(ed) : ''; P.edDate = ed && ed.date ? R.fmtDate(ed.date) : '';
    P.edFrom = ed && ed.from ? 'Pages associées à ' + (R.edOf(prod, ed.from) || { label: 'une édition supprimée' }).label + ' (héritage actif)' : ''; P.hasEdFrom = !!P.edFrom;
    P.canClose = !!ed && ed.status !== 'bouclee' && isChef; P.canReopen = !!ed && ed.status === 'bouclee' && isAdmin;
    P.closeEd = function () { R.ui(self, { dlg: { kind: 'close', ed: ed.id } }); };
    P.reopenEd = function () { saveEd(self, rx, ed.id, function (e) { e.status = 'prep'; return e; }); R.ui(self, { prodMsg: ed.label + ' rouverte : les pages héritées des éditions suivantes suivront vos corrections.' }); };
    P.openNewEd = function () { R.ui(self, { dlg: { kind: 'newEd', title: title.id, src: (eds.filter(function (e) { return e.status === 'bouclee'; }).slice(-1)[0] || {}).id || '', date: '', blank: [] } }); };
    P.openReuse = function () { if (!ed) return; R.ui(self, { dlg: { kind: 'reuse', title: (prod.titles.find(function (t) { return t.id !== title.id; }) || title).id, ed: '', page: '' } }); };
    P.openGlobal = function () { R.ui(self, { globalOpen: true }); };
    P.canNew = isChef; P.canReuse = !!ed && ed.status !== 'bouclee' && isChef;
    // vignettes
    var KC = { article: 'rgba(15,34,54,.78)', photo: 'rgba(200,136,26,.85)', pub: 'rgba(120,120,120,.5)', fixe: 'rgba(32,64,110,.72)' };
    var thumb = function (edx, pg) {
      var els = R.resolveEls(prod, pg); var tt = R.titleOf(prod, edx.title);
      var nres = els.filter(function (e) { if (e.kind !== 'fixe') return false; var f = R.fixeOf(prod, e.ref); return f && !liv(edx, f); }).length;
      var st = R.PAGE_ST[pg.status] || R.PAGE_ST.afaire;
      var tags = []; if (pg.locked) tags.push('Héritée · verrouillée'); else if (pg.inherit) tags.push('Héritée · dissociée'); if (pg.reused) tags.push(pg.chartePending ? 'Reprise · charte à appliquer' : 'Reprise d’un autre titre'); if (nres) tags.push(nres + ' réserve' + (nres > 1 ? 's' : ''));
      return { n: String(pg.n), rubric: pg.rubric, stLabel: st[0], stBg: st[1], stFg: st[2], locked: !!pg.locked, tag: tags.join(' · '), hasTag: tags.length > 0, paper: tt.charte.paper, ratio: tt.ratio,
        aria: 'Page ' + pg.n + ' · ' + pg.rubric + ' · ' + st[0] + (tags.length ? ' · ' + tags.join(', ') : ''),
        blocks: els.filter(function (e) { return !e.out; }).map(function (e) { var res = e.kind === 'fixe' && (function () { var f = R.fixeOf(prod, e.ref); return f && !liv(edx, f); })(); return { l: pct(e.x / tt.cols), t: pct(e.y / tt.rows), w: pct(e.w / tt.cols), h: pct(e.h / tt.rows), bg: res ? 'repeating-linear-gradient(45deg, rgba(155,28,43,.6) 0 3px, rgba(255,255,255,.4) 3px 6px)' : KC[e.kind] }; }),
        open: function () { R.ui(self, { prodTitle: edx.title, prodEd: edx.id, prodPage: pg.id, prodView: 'page', elSel: null, globalOpen: false }); } };
    };
    P.pages = ed ? ed.pages.map(function (pg) { return thumb(ed, pg); }) : [];
    P.addPage = function () { if (!ed || ed.status === 'bouclee') return; var id = nid('pg'); saveEd(self, rx, ed.id, function (e) { e.pages.push({ id: id, n: e.pages.length + 1, rubric: title.rubriques[0], status: 'afaire', els: [], inherit: null, locked: false }); return e; }); R.ui(self, { prodPage: id, prodView: 'page' }); };
    P.canAddPage = !!ed && ed.status !== 'bouclee';
    // plan plein écran : toutes les éditions du titre, les unes sous les autres
    P.globalOpen = !!u.globalOpen; P.closeGlobal = function () { R.ui(self, { globalOpen: false }); };
    P.global = eds.map(function (e) { return { label: e.label, date: e.date ? R.fmtDate(e.date) : '', stLabel: stEd(e), pages: e.pages.map(function (pg) { return thumb(e, pg); }) }; });
    // page ouverte
    if (ed) {
      var pg = R.pageOf(ed, u.prodPage) || ed.pages[0];
      if (pg) P.pg = pageVals(self, c, rx, u, title, ed, pg, isAdmin, isChef, lenOf);
    }
    P.hasPg = !!P.pg;
    // suivi de production
    P.suivi = suiviVals(self, c, rx, u, title, eds, ed, resv);
    // titres et modèles
    P.tm = titresVals(self, c, rx, u, title, isAdmin);
    return P;
  }
  function saveEd(self, rx, edId, fn) {
    var prod = Object.assign({}, rx.prod); var changed = null;
    prod.editions = prod.editions.map(function (e) { if (e.id !== edId) return e; changed = fn(clone(e)); return changed; });
    R.put(self, { prod: prod }); if (changed) sync(self, 'PUT', '/prod/editions/' + encodeURIComponent(changed.id), changed);
    return changed;
  }
  R.saveEd = saveEd;
  function savePage(self, rx, edId, pageId, fn) { return saveEd(self, rx, edId, function (e) { e.pages = e.pages.map(function (p) { return p.id === pageId ? fn(p) : p; }); return e; }); }
  function pageVals(self, c, rx, u, title, ed, pg, isAdmin, isChef, lenOf) {
    var prod = rx.prod; var G = {};
    var els = R.resolveEls(prod, pg);
    var editable = ed.status !== 'bouclee' && !pg.locked;
    var idx = ed.pages.indexOf(pg);
    G.n = String(pg.n); G.total = String(ed.pages.length); G.rubric = pg.rubric; G.status = pg.status;
    G.prev = function () { var p2 = ed.pages[idx - 1]; if (p2) R.ui(self, { prodPage: p2.id, elSel: null }); }; G.next = function () { var p2 = ed.pages[idx + 1]; if (p2) R.ui(self, { prodPage: p2.id, elSel: null }); };
    G.noPrev = idx <= 0; G.noNext = idx >= ed.pages.length - 1;
    G.locked = !!pg.locked; G.editable = editable; G.closed = ed.status === 'bouclee';
    G.source = R.sourceLabel(prod, pg); G.isInherited = !!pg.inherit;
    var modified = pg.inherit && !pg.locked ? els.filter(function (e) { return !e.inh; }).length : 0;
    G.inhInfo = pg.inherit ? (pg.locked ? 'Page héritée de ' + G.source + ' : identique, elle reste verrouillée et suit sa page source.' : 'Page héritée de ' + G.source + ', dissociée : ' + modified + ' élément(s) modifié(s) sur ' + els.length + '.') : '';
    G.dissociate = function () { savePage(self, rx, ed.id, pg.id, function (p) { return R.dissociate(prod, p); }); R.ui(self, { prodMsg: 'Page ' + pg.n + ' dissociée : elle est modifiable, partiellement ou entièrement.' }); };
    G.relock = function () { if (!pg.inherit) return; savePage(self, rx, ed.id, pg.id, function (p) { return Object.assign({}, p, { locked: true, els: [] }); }); R.ui(self, { prodMsg: 'Page ' + pg.n + ' de nouveau liée à sa page source.' }); };
    G.canRelock = !!pg.inherit && !pg.locked && editable;
    G.isReused = !!pg.reused; G.reusedLabel = pg.reused ? pg.reused.label : ''; G.chartePending = !!pg.chartePending;
    G.applyTemplates = function () { savePage(self, rx, ed.id, pg.id, function (p) { return R.applyOurTemplates(prod, ed, p); }); R.ui(self, { prodMsg: 'Modèles de « ' + title.name + ' » appliqués : cartons, rubrique et grille reconstruits à vos couleurs.' }); };
    G.rubricOpts = title.rubriques.concat(title.rubriques.indexOf(pg.rubric) < 0 ? [pg.rubric] : []).map(function (r) { return opt(r, r); });
    G.onRubric = function (e) { savePage(self, rx, ed.id, pg.id, function (p) { return Object.assign({}, p, { rubric: e.target.value }); }); };
    G.statusOpts = Object.keys(R.PAGE_ST).map(function (k) { return opt(k, R.PAGE_ST[k][0]); });
    G.onStatus = function (e) { savePage(self, rx, ed.id, pg.id, function (p) { return Object.assign({}, p, { status: e.target.value }); }); };
    var setEls = function (fn, msg) { if (!editable) { self.say(pg.locked ? 'Page verrouillée : dissociez-la pour la modifier' : 'Édition bouclée : lecture seule'); return; } savePage(self, rx, ed.id, pg.id, function (p) { return Object.assign({}, p, { els: fn(p.els.slice()) }); }); if (msg) R.ui(self, { prodMsg: msg, prodErr: '' }); };
    G.arrange = function () { var ar = R.autoArrange(title, els, lenOf); var fitr = R.autoFit(title, ar, lenOf); var nOut = fitr.els.filter(function (e) { return e.out; }).length; setEls(function () { return fitr.els; }, 'Organisation automatique : ' + els.length + ' élément(s) repositionné(s)' + (nOut ? ', ' + nOut + ' hors page' : '') + (fitr.report.cut.length ? ' · ' + fitr.report.cut.length + ' texte(s) à couper' : '') + '.'); };
    G.adjust = function () { var r = R.autoFit(title, els, lenOf); setEls(function () { return r.els; }, 'Ajustement : ' + r.report.fixed + ' texte(s) ajusté(s)' + (r.report.cut.length ? ', ' + r.report.cut.length + ' trop long(s) : ' + r.report.cut.map(function (d) { return '−' + d + ' signes'; }).join(', ') : '') + '.'); };
    G.moveLeft = function () { if (idx <= 0) return; saveEd(self, rx, ed.id, function (e) { var a = e.pages; var t = a[idx - 1]; a[idx - 1] = a[idx]; a[idx] = t; a.forEach(function (p, i) { p.n = i + 1; }); return e; }); };
    G.moveRight = function () { if (idx >= ed.pages.length - 1) return; saveEd(self, rx, ed.id, function (e) { var a = e.pages; var t = a[idx + 1]; a[idx + 1] = a[idx]; a[idx] = t; a.forEach(function (p, i) { p.n = i + 1; }); return e; }); };
    G.removePage = function () { if (!isChef) return; saveEd(self, rx, ed.id, function (e) { e.pages = e.pages.filter(function (p) { return p.id !== pg.id; }); e.pages.forEach(function (p, i) { p.n = i + 1; }); return e; }); R.ui(self, { prodPage: null, prodView: 'plan', prodMsg: 'Page supprimée.' }); };
    G.canStructure = ed.status !== 'bouclee' && isChef;
    G.add = function (k) { return function () { if (!editable) { self.say('Page verrouillée ou édition bouclée'); return; } R.ui(self, { dlg: { kind: 'add', addKind: k, ed: ed.id, page: pg.id } }); }; };
    G.addArticle = G.add('article'); G.addPhoto = G.add('photo'); G.addPub = G.add('pub'); G.addFixe = G.add('fixe');
    var sel = els.find(function (e) { return e.id === u.elSel; });
    G.els = els.map(function (e) {
      var ct = contentOf(c, rx, ed, e); var tp = R.tplOf(title, e.tpl);
      var shown = e.title || (e.kind === 'article' && tp && tp.titre ? tp.titre : ct.title) || '';
      var f = R.fit(title, e, R.signes(ct.text)); var on = sel && sel.id === e.id;
      var ex = String(ct.text || '').slice(0, Math.max(40, e.w * e.h * 26));
      return { id: e.id, kind: e.kind, kindLabel: (R.KIND_LABEL[e.kind] || '') + (e.inh ? ' · hérité' : ''), title: shown, text: ex, hasText: !!ex && e.kind !== 'photo' && e.h >= 2, img: ct.img || '', hasImg: !!ct.img && (e.kind === 'photo' || e.kind === 'fixe'),
        l: pct(e.x / title.cols), t: pct(e.y / title.rows), w: pct(e.w / title.cols), h: pct(e.h / title.rows), out: !!e.out,
        hasFit: !!f, fitLabel: f ? f.label : '', fitBg: f ? f.bg : '', fitFg: f ? f.color : '', reserved: e.kind === 'fixe' && !!ct.reserved, rights: e.kind === 'photo' && !ct.okGazette,
        sel: on ? 'true' : 'false', ring: on ? 'var(--rx-acc)' : 'transparent', select: function () { R.ui(self, { elSel: e.id }); },
        aria: (R.KIND_LABEL[e.kind] || '') + ' : ' + shown + (f ? ' · ' + f.label : '') + (e.kind === 'fixe' && ct.reserved ? ' · réservé, en attente du visuel' : '') };
    });
    var outs = els.filter(function (e) { return e.out; });
    G.hasOut = outs.length > 0; G.outList = outs.map(function (e) { var ct = contentOf(c, rx, ed, e); return ct.title; }).join(' · ');
    G.hasSel = !!sel;
    if (sel) {
      var ct = contentOf(c, rx, ed, sel); var tp = R.tplOf(title, sel.tpl);
      var mod = function (patch, msg) { setEls(function (list) { return list.map(function (e) { return e.id === sel.id ? Object.assign({}, e, patch, { inh: false }) : e; }); }, msg); };
      var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
      G.s = { kind: R.KIND_LABEL[sel.kind], title: sel.title || '', ph: sel.kind === 'article' && tp && tp.titre ? 'Titre par défaut du carton : « ' + tp.titre + ' »' : (ct.title || ''), defaultInfo: sel.kind === 'article' && tp && tp.titre && !sel.title ? 'Le titre par défaut du carton s’applique automatiquement à la version imprimée.' : '', hasDefaultInfo: sel.kind === 'article' && !!(tp && tp.titre) && !sel.title,
        onTitle: function (e) { mod({ title: e.target.value }); }, resetTitle: function () { mod({ title: '' }, 'Titre par défaut rétabli.'); }, hasManual: !!sel.title,
        tplOpts: title.modeles.filter(function (m) { return m.kind === sel.kind; }).map(function (m) { return opt(m.id, m.name + ' · ' + m.w + '×' + m.h + (m.titre ? ' · « ' + m.titre + ' »' : '')); }), tpl: sel.tpl,
        onTpl: function (e) { var m = R.tplOf(title, e.target.value); if (!m) return; mod({ tpl: m.id, w: Math.min(m.w, title.cols - sel.x), h: Math.min(m.h, title.rows - sel.y) }); },
        pos: 'Colonne ' + (sel.x + 1) + ', ligne ' + (sel.y + 1) + ' · ' + sel.w + ' col. × ' + sel.h + ' lignes',
        left: function () { mod({ x: clamp(sel.x - 1, 0, title.cols - sel.w) }); }, right: function () { mod({ x: clamp(sel.x + 1, 0, title.cols - sel.w) }); },
        up: function () { mod({ y: clamp(sel.y - 1, 0, title.rows - sel.h) }); }, down: function () { mod({ y: clamp(sel.y + 1, 0, title.rows - sel.h) }); },
        wider: function () { mod({ w: clamp(sel.w + 1, 1, title.cols - sel.x) }); }, narrower: function () { mod({ w: clamp(sel.w - 1, 1, title.cols) }); },
        taller: function () { mod({ h: clamp(sel.h + 1, 1, title.rows - sel.y) }); }, shorter: function () { mod({ h: clamp(sel.h - 1, 1, title.rows) }); },
        isArticle: sel.kind === 'article', corpsOpts: ['8.5', '9', '9.5', '10', '10.5'].map(function (v) { return opt(v, v.replace('.', ',') + ' pt'); }), corps: String(sel.corps || 9.5), onCorps: function (e) { mod({ corps: +e.target.value }); },
        fit: (function () { var f = R.fit(title, sel, R.signes(ct.text)); return f ? f.label + ' · capacité ' + f.cap + ' signes · texte ' + R.signes(ct.text) + ' signes' : ''; })(),
        src: ct.src || '', pinLabel: sel.pin ? 'Position épinglée' : 'Épingler la position', pin: function () { mod({ pin: !sel.pin }, sel.pin ? 'Position libérée' : 'Position épinglée : l’organisation automatique la conserve'); },
        remove: function () { setEls(function (list) { return list.filter(function (e) { return e.id !== sel.id; }); }, 'Élément retiré de la page.'); R.ui(self, { elSel: null }); },
        isPost: !!ct.postId, openPost: function () { if (ct.postId) c.openEditById(ct.postId); },
        isFixe: sel.kind === 'fixe', fixeState: sel.kind === 'fixe' ? (ct.reserved ? 'Réservé : en attente du visuel pour ' + ed.label : 'Livré pour ' + ed.label) : '', livrer: function () { R.ui(self, { dlg: { kind: 'livrer', key: sel.ref, ed: ed.id } }); },
        isPhoto: sel.kind === 'photo', rightsWarn: sel.kind === 'photo' && !ct.okGazette ? 'Droits : cette photo n’est pas autorisée en Gazette papier.' : '' };
    }
    return G;
  }
  function genFixe(c, rx, ed, key) {
    var t = '';
    if (key === 'meteo') t = c.wxText || 'Prévisions à compléter';
    else if (key === 'classement-r2') t = (c.table || []).slice(0, 8).map(function (r, i) { return (i + 1) + '. ' + r.team + ' ' + r.pts + ' pts'; }).join(' · ');
    else if (key === 'agenda') t = (c.matches || []).filter(function (m) { return m.status === 'up'; }).slice(0, 8).map(function (m) { return (m.dateLabel || '') + ' ' + m.home + ' – ' + m.away; }).join(' · ');
    else if (key === 'resultats') t = (c.matches || []).filter(function (m) { return m.status === 'done'; }).slice(0, 8).map(function (m) { return m.home + ' ' + m.hs + '-' + m.as + ' ' + m.away; }).join(' · ');
    else if (key === 'sommaire') t = (ed ? ed.pages : []).map(function (p) { return p.n + '. ' + p.rubric; }).join(' · ');
    return t || 'Données indisponibles : livrez un visuel.';
  }
  function suiviVals(self, c, rx, u, title, eds, ed, resv) {
    var S = {}; var prod = rx.prod;
    var all = ed ? ed.pages : [];
    S.kpis = Object.keys(R.PAGE_ST).map(function (k) { return { l: R.PAGE_ST[k][0], v: String(all.filter(function (p) { return p.status === k; }).length), color: R.PAGE_ST[k][2] }; }).concat([{ l: 'Réserves en attente', v: String(resv.length), color: resv.length ? 'var(--danger)' : 'var(--success)' }]);
    S.resv = resv.map(function (r) { return { ed: r.ed.label, page: 'page ' + r.page.n + ' · ' + r.page.rubric, name: r.f.name, auto: r.f.source === 'donnees', livrer: function () { R.ui(self, { dlg: { kind: 'livrer', key: r.f.key, ed: r.ed.id } }); }, gen: function () { deliver(self, c, rx, r.ed.id, r.f.key, { text: genFixe(c, rx, r.ed, r.f.key), kind: 'donnees' }); }, open: function () { R.ui(self, { prodEd: r.ed.id, prodPage: r.page.id, prodView: 'page', elSel: r.el.id }); } }; });
    S.hasResv = S.resv.length > 0; S.noResv = !S.hasResv;
    // catalogue des éléments fixes + raccourci (recherche par nom ou par tag)
    var q = norm(u.fxQ || '');
    S.fxQ = u.fxQ || ''; S.onFxQ = function (e) { R.ui(self, { fxQ: e.target.value, fxSel: null }); };
    var used = function (f) { var n = 0; eds.forEach(function (e) { e.pages.forEach(function (pg) { R.resolveEls(prod, pg).forEach(function (el) { if (el.kind === 'fixe' && el.ref === f.key) n++; }); }); }); return n; };
    S.fixes = prod.fixes.filter(function (f) { return !q || norm(f.name + ' ' + f.tags.join(' ') + ' ' + f.titre).indexOf(q) >= 0; }).map(function (f) {
      var l = liv(ed, f); var on = u.fxSel === f.key;
      return { key: f.key, name: f.name, tags: f.tags.join(', '), titre: f.titre, state: f.permanent || f.key === 'sommaire' ? 'Permanent' : l ? 'Livré le ' + R.fmtDate(l.at) : 'En attente pour ' + (ed ? ed.label : '—'), stColor: l || f.permanent || f.key === 'sommaire' ? 'var(--success)' : 'var(--gold-text)', uses: String(used(f)), size: f.w + '×' + f.h, src: f.source === 'donnees' ? 'Données du site' : f.source === 'texte' ? 'Texte' : 'Visuel', auto: f.source === 'donnees',
        sel: on ? 'true' : 'false', bg: on ? 'var(--surface-2)' : 'transparent', pick: function () { R.ui(self, { fxSel: on ? null : f.key }); },
        livrer: function () { if (!ed) return; R.ui(self, { dlg: { kind: 'livrer', key: f.key, ed: ed.id } }); }, gen: function () { if (!ed) return; deliver(self, c, rx, ed.id, f.key, { text: genFixe(c, rx, ed, f.key), kind: 'donnees' }); } };
    });
    var fsel = R.fixeOf(prod, u.fxSel);
    S.hasFxSel = !!fsel && !!ed && ed.status !== 'bouclee'; S.fxSelName = fsel ? fsel.name : '';
    S.pageOpts = ed ? ed.pages.map(function (p) { return opt(p.id, 'Page ' + p.n + ' · ' + p.rubric + (p.locked ? ' (verrouillée)' : '')); }) : [];
    S.fxPage = u.fxPage || (ed && ed.pages[0] ? ed.pages[0].id : ''); S.onFxPage = function (e) { R.ui(self, { fxPage: e.target.value }); };
    S.place = function () {
      if (!fsel || !ed) return; var pg = R.pageOf(ed, S.fxPage); if (!pg) return;
      if (pg.locked) { R.ui(self, { prodErr: 'Page ' + pg.n + ' verrouillée (héritée) : dissociez-la d’abord.' }); return; }
      var slot = R.freeSlot(title, R.resolveEls(prod, pg), fsel.w, fsel.h);
      if (!slot) { R.ui(self, { prodErr: 'Pas d’emplacement libre de ' + fsel.w + '×' + fsel.h + ' en page ' + pg.n + ' : organisez la page ou réduisez un bloc.' }); return; }
      var tp = title.modeles.find(function (m) { return m.kind === 'fixe'; });
      savePage(self, rx, ed.id, pg.id, function (p) { return Object.assign({}, p, { els: p.els.concat([{ id: nid('el'), kind: 'fixe', ref: fsel.key, x: slot[0], y: slot[1], w: fsel.w, h: fsel.h, tpl: tp ? tp.id : '', title: '', corps: 9.5 }]) }); });
      R.ui(self, { prodMsg: fsel.name + ' placé en page ' + pg.n + (liv(ed, fsel) ? '.' : ' : emplacement réservé, il se remplira à la réception du visuel.'), prodErr: '', fxSel: null });
    };
    S.apiPath = 'POST /api/redac/prod/fixes/<clé>/livrer';
    return S;
  }
  function deliver(self, c, rx, edId, key, payload) {
    var f = R.fixeOf(rx.prod, key); if (!f) return;
    var entry = Object.assign({ at: new Date().toISOString(), by: self.me().name }, payload);
    if (f.permanent) {
      var prod = Object.assign({}, rx.prod); prod.fixes = prod.fixes.map(function (x) { return x.key === key ? Object.assign({}, x, { livre: entry }) : x; }); R.put(self, { prod: prod }); sync(self, 'PUT', '/prod/fixes/' + encodeURIComponent(key), R.fixeOf(prod, key));
    } else saveEd(self, rx, edId, function (e) { e.livraisons = Object.assign({}, e.livraisons || {}); e.livraisons[key] = entry; return e; });
    R.ui(self, { prodMsg: f.name + ' livré : les emplacements réservés de cette édition sont à jour.', prodErr: '', dlg: null });
  }
  R.deliver = deliver;
  function titresVals(self, c, rx, u, title, isAdmin) {
    var T = {}; var prod = rx.prod;
    T.canEdit = isAdmin; T.readOnly = !isAdmin;
    T.swatches = [['Papier', title.charte.paper], ['Encre', title.charte.ink], ['Accent', title.charte.accent]].map(function (x) { return { l: x[0], c: x[1] }; });
    T.font = title.charte.font.split(',')[0].replace(/'/g, ''); T.format = title.format; T.rythme = title.rythme; T.grid = title.cols + ' colonnes × ' + title.rows + ' lignes · environ ' + title.cap + ' signes par case en corps 9,5';
    var saveTitle = function (t2) { var p2 = Object.assign({}, prod); p2.titles = prod.titles.map(function (t) { return t.id === t2.id ? t2 : t; }); R.put(self, { prod: p2 }); sync(self, 'PUT', '/prod/titres/' + encodeURIComponent(t2.id), t2); };
    T.modeles = title.modeles.map(function (m, i) { return { name: m.name, kind: R.KIND_LABEL[m.kind], size: m.w + '×' + m.h, titre: m.titre || '', onTitre: function (e) { if (!isAdmin) return; var t2 = clone(title); t2.modeles[i].titre = e.target.value; saveTitle(t2); } }; });
    T.rubriques = title.rubriques.join(', ');
    T.onRubriques = function (e) { if (!isAdmin) return; var t2 = clone(title); t2.rubriques = e.target.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean); saveTitle(t2); };
    T.nm = u.tmName || ''; T.onNm = function (e) { R.ui(self, { tmName: e.target.value }); };
    T.kindOpts = [opt('article', 'Article'), opt('photo', 'Photo'), opt('pub', 'Publicité'), opt('fixe', 'Élément fixe')]; T.nk = u.tmKind || 'article'; T.onNk = function (e) { R.ui(self, { tmKind: e.target.value }); };
    T.nw = String(u.tmW || 2); T.nh = String(u.tmH || 2); T.onNw = function (e) { R.ui(self, { tmW: Math.max(1, Math.min(title.cols, +e.target.value || 1)) }); }; T.onNh = function (e) { R.ui(self, { tmH: Math.max(1, Math.min(title.rows, +e.target.value || 1)) }); };
    T.nt = u.tmTitre || ''; T.onNt = function (e) { R.ui(self, { tmTitre: e.target.value }); };
    T.addModele = function () { if (!isAdmin) return; var nm = String(u.tmName || '').trim(); if (!nm) { self.say('Nommez le modèle'); return; } var t2 = clone(title); t2.modeles.push({ id: nid('m'), name: nm, kind: u.tmKind || 'article', w: u.tmW || 2, h: u.tmH || 2, titre: String(u.tmTitre || '').trim() }); saveTitle(t2); R.ui(self, { tmName: '', tmTitre: '' }); self.say('Modèle « ' + nm + ' » ajouté'); };
    // nouveau titre
    T.presets = [opt('tabloid', 'Tabloïd · 6 colonnes × 8'), opt('a4', 'Magazine A4 · 4 colonnes × 6'), opt('a5', 'A5 · 4 colonnes × 6')];
    T.tn = u.ttName || ''; T.onTn = function (e) { R.ui(self, { ttName: e.target.value }); }; T.tp = u.ttPreset || 'a4'; T.onTp = function (e) { R.ui(self, { ttPreset: e.target.value }); };
    T.ta = u.ttAcc || '#e8a830'; T.onTa = function (e) { R.ui(self, { ttAcc: e.target.value }); };
    T.addTitle = function () {
      if (!isAdmin) return; var nm = String(u.ttName || '').trim(); if (!nm) { self.say('Nommez le titre'); return; }
      var pr = { tabloid: ['Tabloïd · 6 colonnes', 6, 8, '29 / 40', 400], a4: ['Magazine A4 · 4 colonnes', 4, 6, '210 / 297', 330], a5: ['A5 · 4 colonnes', 4, 6, '148 / 210', 230] }[u.ttPreset || 'a4'];
      var base = clone(prod.titles[0]); var id = nid('t');
      var t = { id: id, name: nm, short: nm.split(' ').slice(0, 2).join(' '), rythme: 'À définir', format: pr[0], cols: pr[1], rows: pr[2], ratio: pr[3], cap: pr[4], charte: { paper: '#ffffff', ink: '#0f2236', accent: u.ttAcc || '#e8a830', font: base.charte.font, label: 'Charte du titre' }, rubriques: ['Couverture', 'Actualité', 'Partenaires'],
        modeles: base.modeles.map(function (m) { return Object.assign({}, m, { id: nid('m'), w: Math.max(1, Math.round(m.w * pr[1] / base.cols)), h: Math.max(1, Math.round(m.h * pr[2] / base.rows)) }); }) };
      var p2 = Object.assign({}, prod); p2.titles = prod.titles.concat([t]); p2.editions = prod.editions.concat([{ id: nid('e'), title: id, num: 1, label: t.short + ' n°1', date: '', status: 'prep', pages: [{ id: nid('pg'), n: 1, rubric: 'Couverture', status: 'afaire', els: [], inherit: null, locked: false }] }]);
      R.put(self, { prod: p2 }); sync(self, 'PUT', '/prod/titres/' + encodeURIComponent(id), t); sync(self, 'PUT', '/prod/editions/' + encodeURIComponent(p2.editions[p2.editions.length - 1].id), p2.editions[p2.editions.length - 1]);
      R.ui(self, { prodTitle: id, prodEd: null, prodView: 'plan', ttName: '' }); self.say('Titre « ' + nm + ' » créé');
    };
    return T;
  }

  /* ================= dialogues (nouvelle édition, reprise, ajout, livraison, bouclage, fil) ================= */
  function dlgVals(self, c, rx, u, isAdmin, isChef) {
    var d = u.dlg; var D = { open: !!d };
    if (!d) return D;
    var prod = rx.prod; var close = function () { R.ui(self, { dlg: null }); };
    var setD = function (patch) { R.ui(self, { dlg: Object.assign({}, d, patch) }); };
    D.close = close; D.kind = d.kind;
    ['newEd', 'reuse', 'add', 'livrer', 'close', 'fil'].forEach(function (k) { D['is' + k[0].toUpperCase() + k.slice(1)] = d.kind === k; });
    if (d.kind === 'newEd') {
      var t = R.titleOf(prod, d.title);
      var srcs = prod.editions.filter(function (e) { return e.title === t.id && e.status === 'bouclee'; });
      D.title = 'Nouvelle édition · ' + t.name;
      D.srcOpts = [opt('', 'Aucune : édition vierge')].concat(srcs.map(function (e) { return opt(e.id, e.label + ' (bouclée)'); })); D.src = d.src || '';
      D.onSrc = function (e) { setD({ src: e.target.value, blank: [] }); };
      D.date = d.date || ''; D.onDate = function (e) { setD({ date: e.target.value }); };
      var src = R.edOf(prod, d.src);
      D.hasSrc = !!src;
      D.srcPages = src ? src.pages.map(function (p) { var keep = (d.blank || []).indexOf(p.id) < 0; return { label: 'Page ' + p.n + ' · ' + p.rubric, checked: keep, toggle: function () { var b = (d.blank || []).slice(); var i = b.indexOf(p.id); if (i >= 0) b.splice(i, 1); else b.push(p.id); setD({ blank: b }); } }; }) : [];
      D.create = function () {
        var ne = src ? R.newEditionFrom(prod, src, { blank: d.blank || [], date: d.date }) : (function () { var nums = prod.editions.filter(function (e) { return e.title === t.id; }).map(function (e) { return e.num; }); var num = (nums.length ? Math.max.apply(null, nums) : 0) + 1; return { id: nid('e'), title: t.id, num: num, label: t.id === 't-gazette' ? 'N°' + num : t.short + ' n°' + num, date: d.date || '', status: 'prep', pages: [{ id: nid('pg'), n: 1, rubric: t.rubriques[0], status: 'afaire', els: [], inherit: null, locked: false }] }; })();
        if (src) ne.pages.forEach(function (p) { if (!p.inherit) { var sp = src.pages.find(function (x) { return x.n === p.n; }); p.rubric = sp ? sp.rubric : p.rubric; } });
        var p2 = Object.assign({}, prod); p2.editions = prod.editions.concat([ne]); R.put(self, { prod: p2 }); sync(self, 'PUT', '/prod/editions/' + encodeURIComponent(ne.id), ne);
        var nInh = ne.pages.filter(function (p) { return p.inherit; }).length;
        R.ui(self, { dlg: null, prodTitle: t.id, prodEd: ne.id, prodView: 'plan', prodMsg: ne.label + ' créée' + (src ? ' : ' + nInh + ' page(s) associée(s) à ' + src.label + ', verrouillées tant qu’elles restent identiques.' : '.') });
      };
    }
    if (d.kind === 'reuse') {
      var cur = R.edOf(prod, u.prodEd) || prod.editions.find(function (e) { return e.title === (u.prodTitle || prod.titles[0].id) && e.status !== 'bouclee'; });
      var st = R.titleOf(prod, d.title);
      D.title = 'Reprendre une page' + (cur ? ' dans ' + R.titleOf(prod, cur.title).short + ' · ' + cur.label : '');
      D.titleOpts = prod.titles.map(function (x) { return opt(x.id, x.name); }); D.rTitle = st.id; D.onRTitle = function (e) { setD({ title: e.target.value, ed: '', page: '' }); };
      var eds = prod.editions.filter(function (e) { return e.title === st.id; });
      D.edOpts = eds.map(function (e) { return opt(e.id, e.label + (e.date ? ' · ' + R.fmtDate(e.date) : '')); }); D.rEd = d.ed || (eds[0] ? eds[0].id : ''); D.onREd = function (e) { setD({ ed: e.target.value, page: '' }); };
      var se = R.edOf(prod, D.rEd);
      D.rPages = se ? se.pages.map(function (p) { var on = d.page === p.id; return { label: 'Page ' + p.n + ' · ' + p.rubric, sel: on ? 'true' : 'false', bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', pick: function () { setD({ page: p.id, ed: se.id }); } }; }) : [];
      D.diffCharte = cur && st.id !== cur.title;
      D.canReuse = !!cur && !!d.page; D.cantReuse = !D.canReuse;
      D.reuse = function () {
        if (!cur || !d.page) return; var np = R.reusePage(prod, cur, D.rEd, d.page); if (!np) return;
        saveEd(self, rx, cur.id, function (e) { np.n = e.pages.length + 1; e.pages.push(np); return e; });
        R.ui(self, { dlg: null, prodEd: cur.id, prodPage: np.id, prodView: 'page', prodMsg: 'Page reprise de « ' + np.reused.label + ' »' + (np.chartePending ? ' : la charte diffère, appliquez vos modèles pour la reconstruire à vos couleurs.' : '.') });
      };
    }
    if (d.kind === 'add') {
      var ed = R.edOf(prod, d.ed || u.prodEd); var pg = ed && R.pageOf(ed, d.page || u.prodPage);
      if (!ed) { ed = prod.editions.find(function (e) { return e.status !== 'bouclee'; }); }
      var title = ed ? R.titleOf(prod, ed.title) : prod.titles[0];
      D.addKinds = [['article', 'Article'], ['photo', 'Photo'], ['pub', 'Publicité'], ['fixe', 'Élément fixe']].map(function (k) { return Object.assign(pill(d.addKind === k[0]), { label: k[1], pick: function () { setD({ addKind: k[0], q: '' }); } }); });
      D.title = 'Ajouter à ' + (pg ? 'la page ' + pg.n : 'une page') + (ed ? ' · ' + ed.label : '');
      D.pageOpts = ed ? ed.pages.filter(function (p) { return !p.locked; }).map(function (p) { return opt(p.id, 'Page ' + p.n + ' · ' + p.rubric); }) : []; D.page = pg ? pg.id : (D.pageOpts[0] || {}).v || '';
      D.onPage = function (e) { setD({ page: e.target.value, ed: ed.id }); };
      D.q = d.q || ''; D.onQ = function (e) { setD({ q: e.target.value }); };
      var tpls = title.modeles.filter(function (m) { return m.kind === d.addKind; });
      D.tplOpts = tpls.map(function (m) { return opt(m.id, m.name + ' · ' + m.w + '×' + m.h + (m.titre ? ' · « ' + m.titre + ' »' : '')); }); D.tpl = d.tpl || (tpls[0] ? tpls[0].id : ''); D.onTpl = function (e) { setD({ tpl: e.target.value }); };
      D.hasTpl = tpls.length > 0 && d.addKind !== 'fixe';
      var place = function (kind, ref, w, h, tplId, msg) {
        var target = ed && R.pageOf(ed, D.page); if (!target) { self.say('Choisissez une page'); return; }
        if (target.locked) { self.say('Page verrouillée : dissociez-la d’abord'); return; }
        var slot = R.freeSlot(title, R.resolveEls(prod, target), w, h);
        if (!slot) { self.say('Pas d’emplacement libre de ' + w + '×' + h + ' : organisez la page ou réduisez un bloc'); return; }
        savePage(self, rx, ed.id, target.id, function (p) { return Object.assign({}, p, { els: p.els.concat([{ id: nid('el'), kind: kind, ref: ref, x: slot[0], y: slot[1], w: w, h: h, tpl: tplId, title: '', corps: 9.5 }]), status: p.status === 'afaire' ? 'encours' : p.status }); });
        R.ui(self, { dlg: null, prodEd: ed.id, prodPage: target.id, prodView: 'page', prodMsg: msg || 'Élément ajouté.' });
      };
      var tsel = R.tplOf(title, D.tpl) || tpls[0] || { w: 2, h: 2, id: '' };
      var q = d.q || '';
      if (d.addKind === 'article') {
        var pool = c.posts.map(function (p) { return { ref: 'post:' + p.id, title: p.title, sub: 'Rédaction · ' + p.author + ' · ' + ({ draft: 'Brouillon', review: 'En relecture', corrections: 'Corrections', scheduled: 'Programmé', published: 'Publié', rejected: 'Refusé' }[p.status] || p.status), body: p.body, dek: p.dek }; })
          .concat(c.ARTS.filter(function (a) { return !c.posts.some(function (p) { return p.id === a.id; }); }).map(function (a) { return { ref: 'art:' + a.id, title: a.title, sub: 'Site · ' + (a.tag || a.sport), body: (a.points || []).join(' '), dek: a.dek }; }))
          .concat((rx.fil.inbox || []).filter(function (x) { return x.status === 'repris' || x.status === 'nouveau'; }).map(function (x) { return { ref: 'fil:' + x.id, title: x.title, sub: 'Fil · ' + x.from, body: x.body, dek: x.dek }; }));
        if (d.presetRef) pool.sort(function (a, b) { return (b.ref === d.presetRef) - (a.ref === d.presetRef); });
        D.results = R.search(pool, q, ['title', 'dek', function (x) { return R.plain(x.body); }]).slice(0, 12).map(function (x) { var it = x.it; return { title: it.title, sub: it.sub + ' · ' + R.signes((it.dek || '') + ' ' + R.plain(it.body)) + ' signes', place: function () { place('article', it.ref, tsel.w, tsel.h, tsel.id, '« ' + it.title + ' » placé' + (tsel.titre ? ' : titre par défaut du carton « ' + tsel.titre + ' » appliqué à la version imprimée.' : '.')); } }; });
      } else if (d.addKind === 'photo') {
        D.results = R.search(rx.media.filter(function (m) { return m.kind === 'photo'; }), q, ['caption', 'credit', function (m) { return (m.tags || []).join(' '); }]).slice(0, 12).map(function (x) { var m = x.it; var ok = R.droitOk(m, 'gazette'); return { title: m.caption, sub: (m.credit ? '© ' + m.credit : 'crédit à renseigner') + (ok ? '' : ' · non autorisée en Gazette papier'), img: m.src, hasImg: true, place: function () { if (!ok) { self.say('Droits : photo non autorisée en Gazette papier'); return; } place('photo', 'img:' + m.src, tsel.w, tsel.h, tsel.id, 'Photo placée.'); } }; });
      } else if (d.addKind === 'pub') {
        D.isPub = true; D.adv = d.adv || ''; D.onAdv = function (e) { setD({ adv: e.target.value }); };
        D.placePub = function () { place('pub', String(d.adv || '').trim() || 'Annonceur à confirmer', tsel.w, tsel.h, tsel.id, 'Emplacement publicitaire réservé.'); };
        D.results = [];
      } else {
        D.results = prod.fixes.filter(function (f) { return R.search([f], q, ['name', 'titre', function (x) { return x.tags.join(' '); }]).length; }).map(function (f) { var l = liv(ed, f); return { title: f.name, sub: 'Tags : ' + f.tags.join(', ') + ' · ' + f.w + '×' + f.h + ' · ' + (l ? 'livré' : 'sera réservé jusqu’à réception du visuel'), place: function () { var tp = title.modeles.find(function (m) { return m.kind === 'fixe'; }); place('fixe', f.key, Math.min(f.w, title.cols), Math.min(f.h, title.rows), tp ? tp.id : '', f.name + (l ? ' placé.' : ' : emplacement réservé, mis à jour automatiquement à la réception du visuel.')); } }; });
      }
      D.hasResults = (D.results || []).length > 0; D.showQ = d.addKind !== 'pub'; D.qPh = { article: 'Rechercher un article (rédaction, site, Fil)…', photo: 'Légende, crédit, mot-clé…', fixe: 'Nom ou tag : météo, jeux, classement…' }[d.addKind] || 'Rechercher…';
    }
    if (d.kind === 'livrer') {
      var f = R.fixeOf(prod, d.key); var ed2 = R.edOf(prod, d.ed);
      D.title = 'Livrer · ' + (f ? f.name : d.key) + (ed2 && !(f && f.permanent) ? ' · ' + ed2.label : '');
      D.auto = !!f && f.source === 'donnees'; D.text = d.text != null ? d.text : ((ed2 && ed2.livraisons && ed2.livraisons[d.key] && ed2.livraisons[d.key].text) || ''); D.onText = function (e) { setD({ text: e.target.value }); };
      D.gen = function () { setD({ text: genFixe(c, rx, ed2, d.key) }); };
      D.onFile = function (e) { var file = e.target.files && e.target.files[0]; if (!file) return; if (file.size > 3e6) { self.say('Visuel trop lourd (3 Mo maximum)'); return; } var r = new FileReader(); r.onload = function () { setD({ img: r.result, fname: file.name }); }; r.readAsDataURL(file); };
      D.img = d.img || ''; D.hasImg = !!d.img; D.fname = d.fname || '';
      D.send = function () {
        if (!d.text && !d.img) { self.say('Ajoutez un texte ou un visuel'); return; }
        if (R.serverOn() && d.img) { R.call('POST', '/redac/prod/fixes/' + encodeURIComponent(d.key) + '/livrer', { edition: d.ed, text: d.text || '', img: d.img }).then(function (r) { deliver(self, c, rx, d.ed, d.key, { text: d.text || '', img: r && r.url ? r.url : d.img, kind: 'visuel' }); }).catch(function (er) { self.say(er.message); }); return; }
        deliver(self, c, rx, d.ed, d.key, { text: d.text || '', img: d.img || '', kind: d.img ? 'visuel' : 'texte' });
      };
    }
    if (d.kind === 'close') {
      var e3 = R.edOf(prod, d.ed); var notOk = e3 ? e3.pages.filter(function (p) { return p.status !== 'validee'; }).length : 0; var resv = e3 ? reservations(c, rx).filter(function (r) { return r.ed.id === e3.id; }).length : 0;
      D.title = 'Boucler ' + (e3 ? e3.label : '');
      D.warn = (notOk ? notOk + ' page(s) ne sont pas validées. ' : '') + (resv ? resv + ' réserve(s) attendent encore leur visuel. ' : '') + 'Une fois bouclée, l’édition passe en lecture seule et ses pages pourront être héritées par l’édition suivante.';
      D.confirm = function () { saveEd(self, rx, d.ed, function (e) { e.status = 'bouclee'; e.closedAt = new Date().toISOString(); e.pages.forEach(function (p) { if (p.status === 'prete') p.status = 'validee'; }); return e; }); R.ui(self, { dlg: null, prodMsg: (e3 ? e3.label : 'Édition') + ' bouclée.' }); };
    }
    if (d.kind === 'fil') {
      var p = c.posts.find(function (x) { return x.id === d.post; });
      var m = p && rx.media.find(function (x) { return x.src === p.img || x.id === p.img; });
      var partners = (rx.fil.partners || []);
      D.title = 'Envoyer sur le Fil' + (p ? ' · ' + p.title : '');
      D.partners = partners.map(function (x) { var on = (d.to || []).indexOf(x.id) >= 0; return { name: x.name, sub: x.etat || x.url || '', checked: on, toggle: function () { var to = (d.to || []).slice(); var i = to.indexOf(x.id); if (i >= 0) to.splice(i, 1); else to.push(x.id); setD({ to: to }); } }; });
      D.hasPartners = partners.length > 0;
      D.photoOk = !!m && R.droitOk(m, 'partenaires');
      D.photoInfo = !p || !p.img ? 'Pas de photo.' : D.photoOk ? 'La photo part avec son crédit (© ' + (m.credit || 'à préciser') + ').' : 'La photo n’est pas autorisée pour les partenaires : l’article part sans elle.';
      D.note = d.note || ''; D.onNote = function (e) { setD({ note: e.target.value }); };
      D.send = function () {
        if (!p) return; var to = d.to || []; if (!to.length) { self.say('Choisissez au moins un partenaire'); return; }
        var item = { kind: 'article', title: p.title, dek: p.dek, body: p.body, sport: p.sport, tag: p.tag, credit: 'Casa Besports · ' + p.author, photo: D.photoOk ? { src: p.img, credit: m.credit, alt: p.alt } : null, note: d.note || '', sourceId: p.id };
        var done = function (sent) { var ob = (rx.fil.outbox || []).concat([{ id: nid('out'), at: new Date().toISOString(), to: to.map(function (id) { return (partners.find(function (x) { return x.id === id; }) || { name: id }).name; }).join(', '), title: p.title, status: sent ? 'envoyé' : 'démonstration' }]); R.put(self, { fil: Object.assign({}, rx.fil, { outbox: ob }) }); self.setPost(p.id, {}, 'Envoyé sur le Fil : ' + to.length + ' partenaire(s).'); R.ui(self, { dlg: null }); self.say(sent ? 'Envoyé sur le Fil' : 'Démonstration : envoi simulé (activez le Fil sur le serveur)'); };
        if (R.serverOn() && rx.fil.active) R.call('POST', '/fil/envoyer', { to: to, item: item }).then(function (r) { if (r && r.fil) R.put(self, { fil: r.fil }); done(true); }).catch(function (e) { self.say(e.message); });
        else done(false);
      };
    }
    return D;
  }

  /* ================= médiathèque : indexation, droits par canal, durée, agence ================= */
  function mediaVals(self, c, rx, u, isAdmin) {
    var M = {}; var tabA = u.mediaTab === 'agence';
    M.tabs = [['lib', 'Photos et vidéos'], ['agence', 'Agence (AFP)']].map(function (t) { return Object.assign(pill((u.mediaTab || 'lib') === t[0]), { label: t[1], pick: function () { R.ui(self, { mediaTab: t[0] }); } }); });
    M.isLib = !tabA; M.isAgence = tabA;
    M.q = u.mediaQ || ''; M.onQ = function (e) { R.ui(self, { mediaQ: e.target.value }); };
    M.kindOpts = [opt('', 'Photos et vidéos'), opt('photo', 'Photos'), opt('video', 'Vidéos')]; M.kind = u.mediaKind || ''; M.onKind = function (e) { R.ui(self, { mediaKind: e.target.value }); };
    M.canalOpts = [opt('', 'Tous les droits')].concat(R.CANAUX.map(function (k) { return opt(k[0], 'Autorisées : ' + k[1]); })); M.canal = u.mediaCanal || ''; M.onCanal = function (e) { R.ui(self, { mediaCanal: e.target.value }); };
    // indexation : légende, crédit, mots-clés + titres et chapeaux des articles qui utilisent la photo
    var usedIn = function (m) { return c.posts.filter(function (p) { return p.img === m.src; }).map(function (p) { return p.title; }).concat(c.ARTS.filter(function (a) { return a.img === m.src; }).map(function (a) { return a.title; })); };
    var list = rx.media.filter(function (m) { return (!u.mediaKind || m.kind === u.mediaKind) && (!u.mediaCanal || R.droitOk(m, u.mediaCanal)); });
    var found = R.search(list, u.mediaQ || '', ['caption', 'credit', function (m) { return (m.tags || []).join(' '); }, function (m) { return usedIn(m).join(' '); }, 'source']);
    M.count = found.length + ' média' + (found.length > 1 ? 's' : '');
    M.items = found.map(function (x) {
      var m = x.it; var on = u.mediaSel === m.id;
      return { id: m.id, src: m.src, caption: m.caption || 'Sans légende', credit: m.credit ? '© ' + m.credit : 'Crédit à renseigner', isVideo: m.kind === 'video', duree: m.duree || '', hasDuree: m.kind === 'video' && !!m.duree, source: m.source === 'agence' ? 'Agence' : m.source === 'fil' ? 'Fil' : m.source === 'import' ? 'Import' : 'Casa',
        rights: R.CANAUX.map(function (k) { var ok = R.droitOk(m, k[0]); var d = (m.rights || {})[k[0]] || '?'; return { l: k[1].slice(0, 1), title: k[1] + ' : ' + (R.DROITS.find(function (z) { return z[0] === d; }) || ['', 'À vérifier'])[1], bg: ok ? '#d8efe6' : d === '?' ? '#fff1d6' : '#fde2e4', fg: ok ? '#11583f' : d === '?' ? '#7a5208' : '#9b1c2b' }; }),
        snip: x.snip, hasSnip: x.snip.length > 0 && !!u.mediaQ, ring: on ? 'var(--acc)' : 'var(--line)', pick: function () { R.ui(self, { mediaSel: on ? null : m.id }); } };
    });
    var sel = rx.media.find(function (m) { return m.id === u.mediaSel; });
    M.hasSel = !!sel;
    if (sel) {
      var save = function (patch) { var media = rx.media.map(function (m) { return m.id === sel.id ? Object.assign({}, m, patch, { edited: true }) : m; }); R.put(self, { media: media }); sync(self, 'PATCH', '/medias/' + encodeURIComponent(sel.id), Object.assign({ id: sel.id, src: sel.src, kind: sel.kind }, sel, patch)); };
      M.s = { src: sel.src, isVideo: sel.kind === 'video', caption: sel.caption || '', credit: sel.credit || '', tags: (sel.tags || []).join(', '), duree: sel.duree || '', url: sel.url || '',
        onCaption: function (e) { save({ caption: e.target.value }); }, onCredit: function (e) { save({ credit: e.target.value }); }, onTags: function (e) { save({ tags: e.target.value.split(',').map(function (t) { return t.trim(); }).filter(Boolean) }); },
        onDuree: function (e) { save({ duree: e.target.value.replace(/[^0-9:]/g, '').slice(0, 8) }); }, dureeOk: !sel.duree || /^\d{1,3}:[0-5]\d$/.test(sel.duree),
        droitOpts: R.DROITS.map(function (d) { return opt(d[0], d[1]); }),
        rights: R.CANAUX.map(function (k) { return { l: k[1], v: (sel.rights || {})[k[0]] || '?', on: function (e) { var r = Object.assign({}, sel.rights || {}); r[k[0]] = e.target.value; save({ rights: r }); } }; }),
        allLibre: function () { save({ rights: R.allRights('libre') }); },
        used: usedIn(sel).map(function (t) { return { t: t }; }), hasUsed: usedIn(sel).length > 0, close: function () { R.ui(self, { mediaSel: null }); },
        canDelete: isAdmin && sel.source !== 'casa', remove: function () { var media = rx.media.filter(function (m) { return m.id !== sel.id; }); R.put(self, { media: media }); sync(self, 'DELETE', '/medias/' + encodeURIComponent(sel.id)); R.ui(self, { mediaSel: null }); self.say('Média supprimé'); } };
    }
    M.onUpload = function (e) {
      var files = Array.prototype.slice.call(e.target.files || []); if (!files.length) return;
      files.forEach(function (file) {
        var kind = /^video\//.test(file.type) ? 'video' : 'photo';
        var base = { id: nid('m'), kind: kind, caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), credit: '', tags: [], rights: R.allRights('?'), duree: '', source: 'import', at: new Date().toISOString(), edited: true };
        var add = function (it) { R.put(self, { media: [it].concat(R.data(self).media) }); R.ui(self, { mediaSel: it.id }); if (R.serverOn() && it.duree) sync(self, 'PATCH', '/medias/' + encodeURIComponent(it.id), { duree: it.duree }); };
        var withDur = function (it, url) { if (kind !== 'video') return add(it); try { var v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = function () { var d = Math.round(v.duration || 0); it.duree = Math.floor(d / 60) + ':' + ('0' + d % 60).slice(-2); it.src = it.src || ''; add(it); }; v.onerror = function () { add(it); }; v.src = url; } catch (er) { add(it); } };
        if (R.serverOn()) {
          fetch('/api/redac/medias?nom=' + encodeURIComponent(file.name), { method: 'POST', headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Requested-With': 'cb' }, body: file, credentials: 'same-origin' })
            .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Envoi refusé'); return j; }); })
            .then(function (j) { withDur(Object.assign(base, j.media || {}), (j.media || {}).url || (j.media || {}).src); }).catch(function (er) { self.say(er.message); });
        } else { var url = URL.createObjectURL(file); base.src = kind === 'photo' ? url : ''; base.url = kind === 'video' ? url : ''; withDur(base, url); }
      });
      e.target.value = '';
      self.say('Média importé : renseignez la légende, le crédit et les droits par canal');
    };
    // agence (AFP) : réservé aux abonnés, via le serveur
    var ag = rx.agence || {};
    M.ag = { configured: !!ag.configured && R.serverOn(), label: ag.label || 'AFP', info: R.serverOn() ? (ag.configured ? 'Compte ' + (ag.label || 'AFP') + ' relié : recherchez puis importez photos et vidéos. Les droits suivent votre contrat (' + ((ag.canaux || []).join(', ') || 'site, application, Gazette') + ').' : 'Réservé aux clients disposant d’un compte AFP : renseignez AFP_CLIENT_ID, AFP_CLIENT_SECRET, AFP_USERNAME et AFP_PASSWORD dans le fichier .env du serveur.') : 'Les contenus d’agence passent par le serveur de la plateforme : disponibles sur casabesports.fr avec vos identifiants AFP, pas dans cette démonstration.',
      q: u.agQ || '', onQ: function (e) { R.ui(self, { agQ: e.target.value }); }, type: u.agType || 'photo', typeOpts: [opt('photo', 'Photos'), opt('video', 'Vidéos')], onType: function (e) { R.ui(self, { agType: e.target.value }); },
      busy: !!u.agBusy, err: u.agErr || '', hasErr: !!u.agErr,
      go: function () { if (!R.serverOn()) return; R.ui(self, { agBusy: true, agErr: '' }); R.call('GET', '/agence/recherche?type=' + encodeURIComponent(u.agType || 'photo') + '&q=' + encodeURIComponent(u.agQ || '')).then(function (r) { R.ui(self, { agBusy: false, agRes: r.items || [] }); }).catch(function (er) { R.ui(self, { agBusy: false, agErr: er.message }); }); },
      results: (u.agRes || []).map(function (it) { return { title: it.title || it.caption || 'Sans titre', caption: it.caption || '', credit: it.credit || 'AFP', date: R.fmtDate(it.date), thumb: it.thumb || '', hasThumb: !!it.thumb, duree: it.duree || '', hasDuree: !!it.duree,
        imp: function () { R.ui(self, { agBusy: true }); R.call('POST', '/agence/importer', it).then(function (r) { R.ui(self, { agBusy: false }); if (r.media) { R.put(self, { media: [r.media].concat(R.data(self).media) }); R.ui(self, { mediaTab: 'lib', mediaSel: r.media.id }); self.say('Importé dans la médiathèque avec son crédit et ses droits'); } }).catch(function (er) { R.ui(self, { agBusy: false, agErr: er.message }); }); } }; }),
      hasResults: (u.agRes || []).length > 0 };
    return M;
  }

  /* ================= fil d’échange entre rédactions ================= */
  function filVals(self, c, rx, u) {
    var F = {}; var fil = rx.fil || {}; var t = u.filTab || 'in';
    var inbox = (fil.inbox || []).slice().sort(function (a, b) { return (b.at || '').localeCompare(a.at || ''); });
    F.tabs = [['in', 'Reçus', inbox.filter(function (x) { return x.status === 'nouveau'; }).length], ['out', 'Envoyés', 0], ['part', 'Partenaires', 0]].map(function (x) { return Object.assign(pill(t === x[0]), { label: x[1], badge: x[2] ? String(x[2]) : '', hasBadge: x[2] > 0, pick: function () { R.ui(self, { filTab: x[0] }); } }); });
    F.isIn = t === 'in'; F.isOut = t === 'out'; F.isPart = t === 'part';
    F.state = fil.active ? 'Activé · ' + (fil.partners || []).length + ' rédaction(s) partenaire(s)' : (R.serverOn() ? 'Non activé sur ce serveur' : 'Démonstration');
    F.stateColor = fil.active ? 'var(--success)' : 'var(--gold-text)';
    F.info = fil.active ? 'Les contenus bruts (titre, chapeau, texte, crédits et droits de la photo) s’échangent entre rédactions, y compris entre plateformes différentes. Rien n’est publié sans relecture.' : 'L’activation se fait par l’administrateur de la plateforme : nom de la rédaction et liste des partenaires (adresse et clé partagée) dans le fichier .env. Voir la fiche d’aide « Le Fil ».';
    var setStatus = function (it, st) { var ib = (fil.inbox || []).map(function (x) { return x.id === it.id ? Object.assign({}, x, { status: st }) : x; }); R.put(self, { fil: Object.assign({}, fil, { inbox: ib }) }); if (R.serverOn()) R.call('POST', '/fil/' + encodeURIComponent(it.id) + '/statut', { status: st }).catch(function () {}); };
    F.inbox = inbox.map(function (it) {
      var open = u.filOpen === it.id; var st = { nouveau: ['Nouveau', '#fff1d6', '#7a5208'], repris: ['Repris en brouillon', '#d8efe6', '#11583f'], ignore: ['Ignoré', '#e6e6e6', '#555'] }[it.status] || ['', '', ''];
      return { from: it.from, when: R.fmtDateTime(it.at), kind: it.kind === 'visuel' ? 'Visuel' : it.kind === 'page' ? 'Page' : 'Article', title: it.title, dek: it.dek || '', body: c.blocksOf(it.body || ''), credit: it.credit ? 'Crédit : ' + it.credit : '', photo: it.photo && it.photo.src ? it.photo.src : '', hasPhoto: !!(it.photo && it.photo.src), photoCredit: it.photo && it.photo.credit ? '© ' + it.photo.credit : '',
        stLabel: st[0], stBg: st[1], stFg: st[2], open: open, toggle: function () { R.ui(self, { filOpen: open ? null : it.id }); }, toggleLabel: open ? 'Masquer le texte' : 'Lire le texte', isNew: it.status === 'nouveau',
        take: function () {
          var id = 'f' + Date.now(); var who = self.me().name;
          var p = { id: id, author: who, status: 'draft', updated: 'à l’instant', updatedAt: new Date().toISOString(), sport: it.sport || 'Autre', tag: it.tag || 'Fil', clubs: [], img: it.photo && it.photo.src ? it.photo.src : 'assets/hero.jpg', alt: it.photo && it.photo.alt ? it.photo.alt : '', premium: false, schedule: '', type: 'article', title: it.title, dek: it.dek || '', body: (it.body || '') + '\n\n*Source : ' + it.from + (it.credit ? ' · ' + it.credit : '') + '*', log: [{ who: who, when: 'à l’instant', at: new Date().toISOString(), what: 'Repris du Fil : ' + it.from + '.' }] };
          if (it.photo && it.photo.src && !rx.media.some(function (m) { return m.src === it.photo.src; })) R.put(self, { media: [{ id: nid('m'), src: it.photo.src, kind: 'photo', caption: it.photo.alt || it.title, credit: it.photo.credit || it.from, tags: ['Fil'], rights: Object.assign(R.allRights('?'), it.photo.rights || {}), duree: '', source: 'fil', at: new Date().toISOString(), edited: true }].concat(R.data(self).media) });
          p.versions = R.addVersion(p, who, 'Repris du Fil');
          self.setState({ posts: [p].concat(self.posts()) }); setStatus(it, 'repris');
          c.openEditById(id); self.say('Repris en brouillon : il suivra la relecture normale');
        },
        ignore: function () { setStatus(it, 'ignore'); } };
    });
    F.hasIn = F.inbox.length > 0; F.noIn = !F.hasIn;
    F.outbox = (fil.outbox || []).slice().reverse().map(function (x) { return { title: x.title, to: x.to, when: R.fmtDateTime(x.at), status: x.status }; }); F.hasOut = F.outbox.length > 0; F.noOut = !F.hasOut;
    F.partners = (fil.partners || []).map(function (x) { return { name: x.name, url: x.url || '', etat: x.etat || (x.last ? 'Dernier échange : ' + R.fmtDateTime(x.last) : 'Configuré') }; }); F.hasPart = F.partners.length > 0;
    F.refresh = function () { if (!R.serverOn()) { self.say('Démonstration : pas de serveur'); return; } R.call('GET', '/fil').then(function (r) { R.put(self, { fil: r }); self.say('Fil à jour'); }).catch(function (e) { self.say(e.message); }); };
    return F;
  }

  /* ================= IA : prompts par rôle, fournisseurs, suivi de l’utilisation ================= */
  function iaVals(self, c, rx, u, isAdmin) {
    var I = {}; var t = u.iaTab || 'prompts';
    I.tabs = [['prompts', 'Prompts'], ['suivi', 'Suivi de l’utilisation'], ['four', 'Fournisseurs']].map(function (x) { return Object.assign(pill(t === x[0]), { label: x[1], pick: function () { R.ui(self, { iaTab: x[0] }); if (x[0] === 'suivi' && R.serverOn() && isAdmin) loadJournal(self, u, 0); } }); });
    I.isPrompts = t === 'prompts'; I.isSuivi = t === 'suivi'; I.isFour = t === 'four';
    I.canEdit = isAdmin; I.readOnly = !isAdmin; I.varsHint = '{{titre}}, {{chapo}}, {{texte}}, {{alt}}'; I.ntPh = 'Rédige… à partir de {{titre}} et de {{texte}}';
    var ROLES = [['tous', 'Tous'], ['admin', 'Administrateur'], ['collaborateur', 'Chef d’édition'], ['redacteur', 'Rédacteur']];
    var savePrompts = function (list) { R.put(self, { prompts: list }); sync(self, 'PUT', '/prompts', { prompts: list }); };
    I.prompts = rx.prompts.map(function (pr, i) {
      return { label: pr.label, champ: pr.champ, texte: pr.texte, roles: ROLES.map(function (r) { var on = pr.roles.indexOf(r[0]) >= 0; return Object.assign(pill(on), { l: r[1], toggle: function () { if (!isAdmin) return; var roles = on ? pr.roles.filter(function (x) { return x !== r[0]; }) : (r[0] === 'tous' ? ['tous'] : pr.roles.filter(function (x) { return x !== 'tous'; }).concat([r[0]])); if (!roles.length) roles = ['tous']; var l = clone(rx.prompts); l[i].roles = roles; savePrompts(l); } }); }),
        onLabel: function (e) { if (!isAdmin) return; var l = clone(rx.prompts); l[i].label = e.target.value; savePrompts(l); }, onTexte: function (e) { if (!isAdmin) return; var l = clone(rx.prompts); l[i].texte = e.target.value; savePrompts(l); },
        canDelete: isAdmin && !R.PROMPTS.some(function (x) { return x.id === pr.id; }), remove: function () { savePrompts(rx.prompts.filter(function (x, k) { return k !== i; })); } };
    });
    I.champOpts = [['titre', 'Titre'], ['chapo', 'Chapeau'], ['corps', 'Corps'], ['resume', 'Résumé'], ['print', 'Titre imprimé'], ['seo', 'Référencement'], ['reseaux', 'Réseaux sociaux'], ['legende', 'Texte alternatif']].map(function (x) { return opt(x[0], x[1]); });
    I.nl = u.npLabel || ''; I.onNl = function (e) { R.ui(self, { npLabel: e.target.value }); }; I.nc = u.npChamp || 'corps'; I.onNc = function (e) { R.ui(self, { npChamp: e.target.value }); };
    I.nt = u.npTexte || ''; I.onNt = function (e) { R.ui(self, { npTexte: e.target.value }); };
    I.addPrompt = function () { var l = String(u.npLabel || '').trim(), tx = String(u.npTexte || '').trim(); if (!l || !tx) { self.say('Nommez le prompt et rédigez sa consigne'); return; } savePrompts(rx.prompts.concat([{ id: nid('pr'), label: l, champ: u.npChamp || 'corps', roles: ['tous'], texte: tx }])); R.ui(self, { npLabel: '', npTexte: '' }); self.say('Prompt ajouté'); };
    I.providers = (rx.providers || []).map(function (p) { return { label: p.label, model: p.model || '', state: p.id === 'local' ? 'Toujours disponible, sans envoi de données' : 'Configuré sur le serveur' }; });
    I.multi = (rx.providers || []).length > 1;
    // suivi
    var log = (u.journal && u.journal.rows) || rx.aiLog || [];
    var yNow = new Date().getFullYear();
    var years = []; log.forEach(function (l) { var y = String(l.at || '').slice(0, 4); if (y && years.indexOf(y) < 0) years.push(y); }); if (years.indexOf(String(yNow)) < 0) years.push(String(yNow)); years.sort().reverse();
    var f = u.iaF || {}; var setF = function (k) { return function (e) { var nf = Object.assign({}, f); nf[k] = e.target.value; R.ui(self, { iaF: nf, iaShown: 50 }); }; };
    I.yearOpts = years.map(function (y) { return opt(y, y); }); I.year = f.year || String(yNow); I.onYear = setF('year');
    var users = []; log.forEach(function (l) { if (users.indexOf(l.who) < 0) users.push(l.who); });
    I.userOpts = [opt('', 'Tous les membres')].concat(users.map(function (x) { return opt(x, x); })); I.user = f.user || ''; I.onUser = setF('user');
    var prs = []; log.forEach(function (l) { if (prs.indexOf(l.prompt) < 0) prs.push(l.prompt); });
    I.promptOpts = [opt('', 'Tous les prompts')].concat(prs.map(function (x) { return opt(x, x); })); I.prompt = f.prompt || ''; I.onPrompt = setF('prompt');
    var rows = log.filter(function (l) { return String(l.at || '').slice(0, 4) === I.year && (!f.user || l.who === f.user) && (!f.prompt || l.prompt === f.prompt); }).slice().reverse();
    var total = u.journal && u.journal.total != null && !f.user && !f.prompt ? u.journal.total : rows.length;
    var arts = {}; rows.forEach(function (l) { if (l.post) arts[l.post] = 1; });
    I.kpis = [{ l: 'Demandes (sélection)', v: String(total) }, { l: 'Articles traités', v: String(u.journal && u.journal.articles != null && !f.user && !f.prompt ? u.journal.articles : Object.keys(arts).length) }, { l: 'Prompts utilisés', v: String(prs.length) }];
    var shown = u.iaShown || 50;
    I.rows = rows.slice(0, shown).map(function (l) { return { when: R.fmtDateTime(l.at), who: l.who, role: { admin: 'Administrateur', collaborateur: 'Chef d’édition', redacteur: 'Rédacteur' }[l.role] || l.role || '', prompt: l.prompt, provider: l.provider, title: l.title || '—', ok: l.ok === false ? 'Échec' : 'OK' }; });
    I.hasRows = I.rows.length > 0; I.noRows = !I.hasRows; I.more = rows.length > shown || (u.journal && u.journal.total > rows.length);
    I.showMore = function () { if (R.serverOn() && u.journal && u.journal.total > rows.length) loadJournal(self, u, rows.length); R.ui(self, { iaShown: shown + 200 }); };
    I.countLabel = 'Affichage de ' + Math.min(shown, rows.length) + ' ligne(s) sur ' + total;
    I.exportYear = function () {
      if (R.serverOn() && isAdmin) { try { var a = document.createElement('a'); a.href = '/api/redac/ia/journal.csv?annee=' + yNow; a.download = 'journal-ia-' + yNow + '.csv'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {} return; }
      var data = (rx.aiLog || []).filter(function (l) { return String(l.at || '').slice(0, 4) === String(yNow); });
      download(R.csv([['at', 'Date'], ['who', 'Membre'], ['role', 'Rôle'], ['prompt', 'Prompt'], ['provider', 'Fournisseur'], ['post', 'Article (identifiant)'], ['title', 'Titre de l’article']], data), 'journal-ia-' + yNow + '.csv', 'text/csv');
      self.say(data.length + ' ligne(s) exportée(s)');
    };
    return I;
  }
  function loadJournal(self, u, offset) {
    var f = u.iaF || {}; var y = f.year || String(new Date().getFullYear());
    R.call('GET', '/redac/ia/journal?annee=' + y + '&offset=' + (offset || 0) + '&limite=500').then(function (r) {
      var prev = offset && u.journal ? u.journal.rows : [];
      R.ui(self, { journal: { rows: prev.concat((r.rows || []).slice().reverse()).sort(function (a, b) { return (a.at || '').localeCompare(b.at || ''); }), total: r.total, articles: r.articles } });
    }).catch(function () {});
  }
  // Sur la plateforme : lien de téléchargement classique. Dans l’application publiée en artefact claude.ai,
  // le fichier passe par la capacité « downloads » (le visiteur confirme l’enregistrement).
  function download(text, name, type, say) {
    var w = typeof window !== 'undefined' ? window : {};
    if (!w.CB_SERVER && w.claude && typeof w.claude.use === 'function') {
      w.claude.use('downloads').then(function (d) {
        if (!d) throw { code: 'unavailable' };
        return d.save({ filename: name, data: text });
      }).then(function () { if (say) say('Fichier enregistré : ' + name); }, function (e) {
        if (!say || (e && e.code === 'declined')) return;
        say(e && e.code === 'rate_limited' ? 'Un enregistrement est déjà en attente de confirmation' : 'Téléchargement indisponible ici : utilisez « Copier »');
      });
      return;
    }
    try { var url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' })); var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500); } catch (e) {}
  }
  R.download = download;

  /* ================= règles de publication (équipe) ================= */
  function reglesVals(self, c, rx, isAdmin) {
    var G = {};
    G.canEdit = isAdmin; G.readOnly = !isAdmin;
    G.modeOpts = R.MODES.map(function (m) { return opt(m[0], m[1]); });
    G.roles = R.ROLES_REGLES.map(function (r) { return { l: r[1] }; });
    G.rows = R.CONTRAINTES.map(function (k) { return { label: k.label, when: k.actions.map(function (a) { return a === 'publier' ? 'publication' : 'soumission'; }).join(' et '), cells: R.ROLES_REGLES.map(function (r) { var v = (rx.wf[k.id] || {})[r[0]] || 'bloquant'; return { v: v, label: (R.MODES.find(function (m) { return m[0] === v; }) || ['', ''])[1], on: function (e) { if (!isAdmin) return; var wf = clone(rx.wf); wf[k.id] = Object.assign({}, wf[k.id] || {}); wf[k.id][r[0]] = e.target.value; R.put(self, { wf: wf }); sync(self, 'PUT', '/wf', { rules: wf }); self.say('Règle mise à jour'); } }; }) }; });
    G.note = 'L’administrateur principal n’est concerné que par la règle des droits photo, toujours bloquante. Une contrainte non bloquante affiche une alerte : le membre décide de passer outre ou non, et son choix est noté dans l’historique de l’article.';
    return G;
  }

  /* ================= exports personnalisés ================= */
  function expVals(self, c, rx, u) {
    var X = {}; var f = u.ex || {};
    var set = function (k) { return function (e) { var nf = Object.assign({}, f); nf[k] = e.target.value; R.ui(self, { ex: nf, exOut: null }); }; };
    X.dataOpts = [opt('articles', 'Articles'), opt('versions', 'Versions d’articles'), opt('pages', 'Pages des éditions'), opt('medias', 'Médiathèque'), opt('ia', 'Journal de l’IA'), opt('fil', 'Le Fil (reçus et envoyés)')];
    X.canalOpts = [opt('', 'Tous les canaux')].concat(R.CANAUX.map(function (k) { return opt(k[0], k[1]); }));
    X.data = f.data || 'articles'; X.canal = f.canal || ''; X.from = f.from || ''; X.to = f.to || ''; X.fmt = f.fmt || 'csv';
    X.fmtOpts = [opt('csv', 'CSV (tableur)'), opt('json', 'JSON')];
    X.onData = set('data'); X.onCanal = set('canal'); X.onFrom = set('from'); X.onTo = set('to'); X.onFmt = set('fmt');
    var inRange = function (iso) { if (!f.from && !f.to) return true; var d = String(iso || '').slice(0, 10); if (!d) return false; return (!f.from || d >= f.from) && (!f.to || d <= f.to); };
    X.build = function () {
      var cols = [], rows = [];
      if (X.data === 'articles') {
        cols = [['id', 'Identifiant'], ['title', 'Titre'], ['author', 'Auteur'], ['type', 'Type'], ['sport', 'Discipline'], ['tag', 'Rubrique'], ['status', 'Statut'], ['enLigne', 'En ligne'], ['canaux', 'Canaux'], ['signes', 'Signes'], ['maj', 'Mis à jour']];
        rows = c.posts.filter(function (p) { return inRange(p.updatedAt); }).map(function (p) {
          var ch = []; if (p.online || p.status === 'published') ch.push('site', 'appli'); if (placements(c, rx, p.id).length) ch.push('gazette'); if ((p.log || []).some(function (l) { return /Fil/.test(l.what); })) ch.push('partenaires');
          return { id: p.id, title: p.title, author: p.author, type: R.typeOf(p.type)[1], sport: p.sport, tag: p.tag, status: p.status, enLigne: p.online ? 'oui' : 'non', canaux: ch.join(', '), _ch: ch, signes: R.signes(R.plain(p.body)), maj: p.updatedAt || '' };
        }).filter(function (r) { return !X.canal || r._ch.indexOf(X.canal) >= 0; });
      } else if (X.data === 'versions') {
        cols = [['post', 'Article'], ['n', 'Version'], ['label', 'Libellé'], ['who', 'Auteur'], ['at', 'Date'], ['signes', 'Signes']];
        c.posts.forEach(function (p) { (p.versions || []).forEach(function (v) { if (inRange(v.at)) rows.push({ post: p.title, n: 'v' + v.n, label: v.label, who: v.who, at: v.at, signes: R.signes(R.plain(v.snap.body)) }); }); });
      } else if (X.data === 'pages') {
        cols = [['titre', 'Titre'], ['edition', 'Édition'], ['date', 'Date'], ['page', 'Page'], ['rubrique', 'Rubrique'], ['statut', 'Statut'], ['heritage', 'Héritage'], ['elements', 'Éléments'], ['reserves', 'Réserves']];
        rx.prod.editions.forEach(function (ed) { if (!inRange(ed.date)) return; var t = R.titleOf(rx.prod, ed.title); ed.pages.forEach(function (pg) { var els = R.resolveEls(rx.prod, pg); rows.push({ titre: t.name, edition: ed.label, date: ed.date, page: pg.n, rubrique: pg.rubric, statut: (R.PAGE_ST[pg.status] || [''])[0], heritage: pg.locked ? 'verrouillée' : pg.inherit ? 'dissociée' : pg.reused ? 'reprise' : '', elements: els.length, reserves: els.filter(function (e) { var fx = e.kind === 'fixe' && R.fixeOf(rx.prod, e.ref); return fx && !liv(ed, fx); }).length }); }); });
        if (X.canal && X.canal !== 'gazette') rows = [];
      } else if (X.data === 'medias') {
        cols = [['caption', 'Légende'], ['kind', 'Type'], ['credit', 'Crédit'], ['source', 'Source'], ['duree', 'Durée']].concat(R.CANAUX.map(function (k) { return [k[0], k[1]]; }));
        rows = rx.media.filter(function (m) { return inRange(m.at) && (!X.canal || R.droitOk(m, X.canal)); }).map(function (m) { var r = { caption: m.caption, kind: m.kind === 'video' ? 'vidéo' : 'photo', credit: m.credit, source: m.source, duree: m.duree || '' }; R.CANAUX.forEach(function (k) { r[k[0]] = (R.DROITS.find(function (d) { return d[0] === ((m.rights || {})[k[0]] || '?'); }) || ['', ''])[1]; }); return r; });
      } else if (X.data === 'ia') {
        cols = [['at', 'Date'], ['who', 'Membre'], ['role', 'Rôle'], ['prompt', 'Prompt'], ['provider', 'Fournisseur'], ['title', 'Article']];
        rows = (rx.aiLog || []).filter(function (l) { return inRange(l.at); });
      } else {
        cols = [['sens', 'Sens'], ['at', 'Date'], ['qui', 'Rédaction'], ['title', 'Titre'], ['status', 'Statut']];
        rows = (rx.fil.inbox || []).map(function (x) { return { sens: 'reçu', at: x.at, qui: x.from, title: x.title, status: x.status }; }).concat((rx.fil.outbox || []).map(function (x) { return { sens: 'envoyé', at: x.at, qui: x.to, title: x.title, status: x.status }; })).filter(function (r) { return inRange(r.at); });
        if (X.canal && X.canal !== 'partenaires') rows = [];
      }
      var name = 'casabesports-' + X.data + (X.canal ? '-' + X.canal : '') + '-' + today() + '.' + X.fmt;
      var text = X.fmt === 'json' ? JSON.stringify(rows.map(function (r) { var o = {}; cols.forEach(function (cc) { o[cc[0]] = r[cc[0]]; }); return o; }), null, 2) : R.csv(cols, rows);
      R.ui(self, { exOut: { name: name, full: text, mime: X.fmt === 'json' ? 'application/json' : 'text/csv', n: rows.length, head: cols.slice(0, 6).map(function (cc) { return { l: cc[1] }; }), rows: rows.slice(0, 6).map(function (r) { return { cells: cols.slice(0, 6).map(function (cc) { return { v: String(r[cc[0]] == null ? '' : r[cc[0]]).slice(0, 60) }; }) }; }), text: text.slice(0, 20000) } });
    };
    var o = u.exOut;
    X.hasOut = !!o; X.outName = o ? o.name : ''; X.outN = o ? o.n + ' ligne(s)' : ''; X.head = o ? o.head : []; X.rows = o ? o.rows : [];
    X.save = function () { if (o) download(o.full || o.text, o.name, o.mime || 'text/csv', function (m) { self.say(m); }); };
    X.copy = function () { if (!o) return; try { navigator.clipboard.writeText(o.text.replace(/^﻿/, '')).then(function () { self.say('Export copié'); }, function () { self.say('Copie impossible ici'); }); } catch (e) { self.say('Copie impossible ici'); } };
    return X;
  }
})(CasaRedac);

if (typeof module !== 'undefined' && module.exports) module.exports = CasaRedac;

