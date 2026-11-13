/*!
 * Casa Besports — bascule français / anglais.
 * Le site est écrit en français ; en anglais, chaque texte affiché est remplacé à la volée
 * par sa traduction trouvée dans contenus/anglais.js (window.CASA_EN).
 * Un texte absent du dictionnaire reste en français.
 * Langue choisie : ?lang=en dans l'adresse, sinon le choix du visiteur (bouton FR / EN), sinon le français.
 */
(function () {
  var KEY = 'cb-lang';
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function pick() {
    try { var q = new URLSearchParams(location.search).get('lang'); if (q === 'en' || q === 'fr') return q; } catch (e) {}
    var s = read(); if (s === 'en' || s === 'fr') return s;
    // Français par défaut pour tout le monde (et pour les moteurs de recherche) ; l'anglais se choisit avec le bouton EN ou ?lang=en
    return 'fr';
  }
  var lang = pick();
  var L = window.CasaLang = {
    lang: lang,
    set: function (l) {
      try { localStorage.setItem(KEY, l); } catch (e) {}
      try {
        var u = new URL(location.href); u.searchParams.delete('lang');
        if (l === 'en') u.searchParams.set('lang', 'en');
        location.replace(u.toString());
      } catch (e) { location.reload(); }
    },
    toggle: function () { L.set(lang === 'en' ? 'fr' : 'en'); },
    t: function (s) { return s; }
  };
  document.documentElement.setAttribute('lang', lang);
  if (lang !== 'en') return;

  var DICT = window.CASA_EN || {};
  var exact = Object.create(null), pats = [];
  var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
  var esc = function (s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); };
  Object.keys(DICT).forEach(function (fr) {
    var en = DICT[fr], k = norm(fr);
    if (k.indexOf('{{') < 0) { exact[k] = en; return; }
    var names = [], re = '';
    k.split(/(\{\{[^}]+\}\})/).forEach(function (part) {
      if (/^\{\{[^}]+\}\}$/.test(part)) { names.push(part); re += '(.+?)'; } else re += esc(part);
    });
    pats.push({ re: new RegExp('^' + re + '$'), names: names, en: en, lit: k.replace(/\{\{[^}]+\}\}/g, '').length });
  });
  // Le modèle le plus précis passe en premier (« Voir l’œuvre : {{x}} » avant « Voir {{x}} »)
  pats.sort(function (a, b) { return b.lit - a.lit; });
  // Dates : jours et mois français vers l'anglais (ex. « mercredi 11 novembre », « ven. 13 »)
  var DAYS = { lundi: 'Monday', mardi: 'Tuesday', mercredi: 'Wednesday', jeudi: 'Thursday', vendredi: 'Friday', samedi: 'Saturday', dimanche: 'Sunday' };
  var DAB = { 'lun.': 'Mon', 'mar.': 'Tue', 'mer.': 'Wed', 'jeu.': 'Thu', 'ven.': 'Fri', 'sam.': 'Sat', 'dim.': 'Sun' };
  var MONTHS = { janvier: 'January', 'février': 'February', mars: 'March', avril: 'April', mai: 'May', juin: 'June', juillet: 'July', 'août': 'August', septembre: 'September', octobre: 'October', novembre: 'November', 'décembre': 'December',
    'janv.': 'Jan', 'févr.': 'Feb', 'avr.': 'Apr', 'juil.': 'Jul', 'sept.': 'Sep', 'oct.': 'Oct', 'nov.': 'Nov', 'déc.': 'Dec' };
  function cap(w, src) { return src[0] === src[0].toUpperCase() ? w : w.toLowerCase(); }
  function dates(k) {
    var o = k.replace(/\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?= \d)/gi, function (w) { return DAYS[w.toLowerCase()]; })
      .replace(/(^|[\s·])(lun\.|mar\.|mer\.|jeu\.|ven\.|sam\.|dim\.)(?= \d)/gi, function (all, a, w) { return a + DAB[w.toLowerCase()]; })
      .replace(/(\d{1,2}) (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|janv\.|févr\.|avr\.|juil\.|sept\.|oct\.|nov\.|déc\.)/gi, function (all, d, m) { return d + ' ' + MONTHS[m.toLowerCase()]; });
    return o === k ? null : o;
  }
  function match(k, depth) {
    if (exact[k] != null) return exact[k];
    for (var i = 0; i < pats.length; i++) {
      var m = pats[i].re.exec(k); if (!m) continue;
      var out = pats[i].en;
      // les valeurs variables sont traduites elles aussi (ex. « À la une · Bientôt »)
      pats[i].names.forEach(function (n, j) { var v = m[j + 1], t = depth < 2 ? tr(v, depth + 1) : null; out = out.split(n).join(t == null ? v : t); });
      return out;
    }
    return null;
  }
  function tr(raw, depth) {
    var k = norm(raw); if (!k) return null;
    depth = depth || 0;
    var r = match(k, depth); if (r != null) return r;
    if (/\d/.test(k)) {
      var dd = dates(k); if (!dd) return null;
      // une phrase qui contient une date : on traduit la phrase, puis la date
      var rd = match(dd, depth); return rd != null ? rd : dd;
    }
    return null;
  }
  L.t = function (s) { var r = tr(s); return r == null ? s : r; };

  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  var busy = false;
  function doText(n) {
    var v = n.nodeValue; if (!v || !/[A-Za-zÀ-ÿ]/.test(v)) return;
    if (n.__en === v) return;
    var r = tr(v); if (r == null) return;
    var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0];
    var nv = lead + r + trail; n.__en = nv; if (nv !== v) n.nodeValue = nv;
  }
  function doEl(el) {
    if (el.nodeType !== 1) return;
    var tag = el.tagName; if (tag === 'SCRIPT' || tag === 'STYLE') return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute(ATTRS[i]); if (!a) continue;
      var r = tr(a); if (r != null && r !== a) el.setAttribute(ATTRS[i], r);
    }
  }
  // Les zones marquées translate="no" (espace administrateur) restent telles quelles
  function skip(n) { var e = n.nodeType === 1 ? n : n.parentNode; return !!(e && e.closest && e.closest('[translate="no"]')); }
  function walk(root) {
    if (skip(root)) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    doEl(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { var p = n.nodeType === 1 ? n : n.parentNode; if (n.nodeType === 1 && p.tagName === 'TEXTAREA') return NodeFilter.FILTER_ACCEPT; return p && /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var n; while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
  }
  function run(muts) {
    if (busy) return; busy = true;
    try {
      if (!muts) walk(document.body);
      else for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (skip(m.target)) continue;
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doEl(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    } finally { busy = false; }
  }
  function start() {
    run(null);
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    try { document.title = document.title.replace('le média sport du Cotentin', 'sports media of the Cotentin'); } catch (e) {}
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
