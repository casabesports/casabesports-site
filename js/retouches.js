/*!
 * Casa Besports — retouches des textes et des images, directement sur le site.
 * 1. Pour tous les visiteurs : applique window.CASA_RETOUCHES (contenus/retouches.js ou version publiée en ligne).
 *    Un texte affiché exactement égal à « avant » est remplacé par « apres » ; une image dont l'adresse est « avant » prend « apres ».
 * 2. Pour l'administrateur : bouton « ✎ Retoucher » ; on clique sur un texte ou une image, on modifie,
 *    on voit le résultat tout de suite (aperçu), puis « Publier ». Les changements non publiés restent en brouillon sur l'appareil.
 */
(function () {
  var EN = !!(window.CasaLang && window.CasaLang.lang === 'en');
  var norm = function (s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); };
  var normSrc = function (s) { return String(s || '').trim().replace(/^\.\//, '').replace(/^\//, ''); };
  var clone = function (v) { return JSON.parse(JSON.stringify(v == null ? null : v)); };
  var blank = function () { return { textes: [], images: [], places: [], polices: [] }; };
  var fix = function (R) { R = R && typeof R === 'object' ? R : {}; return { textes: Array.isArray(R.textes) ? R.textes : [], images: Array.isArray(R.images) ? R.images : [], places: Array.isArray(R.places) ? R.places : [], polices: Array.isArray(R.polices) ? R.polices : [] }; };
  function view() { try { return (window.CasaSite && window.CasaSite.state && window.CasaSite.state.view) || 'home'; } catch (e) { return 'home'; } }
  function pg(p) { p = norm(p); return !p || p === '*' || p === 'toutes' ? '*' : p; }

  // ---------- 1. application ----------
  var TX = {}, IM = {}, touched = [], src = undefined, busy = false;
  function compile() {
    var R = fix(window.CASA_RETOUCHES); TX = {}; IM = {};
    R.textes.forEach(function (r) {
      if (!r || !norm(r.avant)) return;
      var a = norm(r.avant), to;
      if (EN) {
        if (norm(r.apresEn)) to = r.apresEn;
        else { var t = window.CasaLang.t(a); if (t !== a) return; to = r.apres; }
      } else to = r.apres;
      if (to == null || norm(to) === '') return;
      var p = pg(r.page), e = { to: String(to), n: r.n == null || r.n === '' ? null : Number(r.n) }; TX[p] = TX[p] || {};
      (TX[p][a] = TX[p][a] || []).push(e);
      if (EN) { var ta = norm(window.CasaLang.t(a)); if (ta && ta !== a) (TX[p][ta] = TX[p][ta] || []).push(e); }
    });
    R.images.forEach(function (r) {
      if (!r || !normSrc(r.avant)) return;
      // Page Culture : le bandeau du haut a sa propre adresse ; une ancienne retouche du 1er emplacement « hero.jpg » vise le bandeau, pas le tableau de la salle 1
      if (pg(r.page) === 'culture' && normSrc(r.avant) === 'assets/hero.jpg' && (r.n == null || r.n === '' || Number(r.n) === 0)) r = Object.assign({}, r, { avant: 'assets/hero.jpg?bandeau-culture', n: null });
      else if (pg(r.page) === 'culture' && normSrc(r.avant) === 'assets/hero.jpg' && Number(r.n) === 1) r = Object.assign({}, r, { n: 0 });
      var hasFrame = r.x != null || r.y != null || (Number(r.z) || 1) !== 1 || r.taille === 'plein' || r.taille === 'entiere' || r.taille === 'fond';
      var vidUrl = String(r.video || '').trim();
      if (!normSrc(r.apres) && !hasFrame && !vidUrl) return;
      var p = pg(r.page); IM[p] = IM[p] || {};
      var ks = normSrc(r.avant);
      (IM[p][ks] = IM[p][ks] || []).push({ src: normSrc(r.apres) ? String(r.apres).trim() : null, x: r.x == null ? 50 : Number(r.x), y: r.y == null ? 50 : Number(r.y), z: Number(r.z) || 1, taille: r.taille || '', video: vidUrl, frame: hasFrame, n: r.n == null || r.n === '' ? null : Number(r.n) });
    });
  }
  // Une retouche vaut pour un emplacement précis (n = rang de ce texte ou de cette image parmi les identiques de la page),
  // pour toute la page, ou pour tout le site. La plus précise l'emporte.
  function look(M, k, idxFn) {
    var v = view(), L = (M[v] && M[v][k]) || [], G = (M['*'] && M['*'][k]) || [];
    if (!L.length && !G.length) return undefined;
    var hasN = L.some(function (e) { return e.n != null; }) || G.some(function (e) { return e.n != null; });
    var ix = hasN ? idxFn() : -1, i;
    for (i = 0; i < L.length; i++) if (L[i].n != null && L[i].n === ix) return L[i];
    for (i = 0; i < L.length; i++) if (L[i].n == null) return L[i];
    for (i = 0; i < G.length; i++) if (G[i].n == null) return G[i];
    return undefined;
  }
  function origText(n) { return n.__rtSet != null && n.nodeValue === n.__rtSet ? n.__rtOrig : n.nodeValue; }
  function origSrc(el) { return normSrc(el.__rtOrig != null && el.getAttribute('src') === el.__rtSet ? el.__rtOrig : el.getAttribute('src')); }
  function textIdx(node) {
    var key = norm(origText(node)), c = 0, w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { if (n === node) return c; if (!inUi(n) && norm(origText(n)) === key) c++; }
    return c;
  }
  function imgIdx(el) { var key = origSrc(el); return Array.prototype.filter.call(document.querySelectorAll('img'), function (x) { return !inUi(x) && origSrc(x) === key; }).indexOf(el); }
  function inUi(n) { var e = n.nodeType === 1 ? n : n.parentNode; return !!(e && e.closest && e.closest('#cba, .rt-ui')); }
  function doText(n) {
    var v = n.nodeValue; if (!v || !/[A-Za-zÀ-ÿ0-9]/.test(v)) return;
    if (n.__rtSet != null && v === n.__rtSet) return;
    var e = look(TX, norm(v), function () { return textIdx(n); }); if (e == null) return; var r = e.to;
    var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0], nv = lead + r + trail;
    if (nv === v) return;
    n.__rtOrig = v; n.__rtSet = nv; n.nodeValue = nv; touched.push(n);
  }
  // Cadrage sans toucher au fichier : point de cadrage (x, y en %) et zoom, appliqués à l'emplacement de l'image
  function frame(el, f) {
    var par = el.parentElement;
    if (!el.__rtSt) el.__rtSt = { op: el.style.objectPosition, tf: el.style.transform, to: el.style.transformOrigin, po: par ? par.style.overflow : '', of: el.style.objectFit, bg: el.style.background, l: el.style.left, r: el.style.right, w: el.style.width, mw: el.style.maxWidth };
    var O = el.__rtSt, t = f ? f.taille || '' : '';
    var pos = f ? f.x + '% ' + f.y + '%' : O.op, z = f ? f.z : 1;
    var tf = z > 1 ? 'scale(' + z + ')' : O.tf, to = z > 1 ? pos : O.to;
    var set = function (k, v) { if (el.style[k] !== v) el.style[k] = v; };
    set('objectPosition', pos); set('transform', tf); set('transformOrigin', to);
    // Taille : « plein » = toute la largeur de son bloc (ex. la grande image de l'accueil) ; « entiere » = image entière, sans la couper
    var abs = (el.style.position || getComputedStyle(el).position) === 'absolute';
    // « fond » = toute la largeur, image entière (sans la couper), et les côtés remplis par la même photo assombrie
    var wide = t === 'plein' || t === 'fond';
    set('objectFit', t === 'entiere' || t === 'fond' ? 'contain' : O.of);
    set('left', wide && abs ? '0px' : O.l); set('right', wide && abs ? '0px' : O.r);
    set('width', wide ? '100%' : O.w); set('maxWidth', wide ? '100%' : O.mw);
    var src = el.getAttribute('src') || '';
    var bgv = t === 'fond' && src ? 'linear-gradient(rgba(0,0,0,.6), rgba(0,0,0,.6)), url("' + src.replace(/"/g, '%22') + '") center / cover no-repeat' : O.bg;
    if (el.__rtBg !== bgv) { el.__rtBg = bgv; el.style.background = bgv; }
    var po = z > 1 ? 'hidden' : O.po;
    if (par && par.style.overflow !== po) par.style.overflow = po;
  }
  function unframe(el) { if (!el.__rtSt) return; frame(el, null); el.__rtSt = null; }
  // Vidéo en arrière-plan à la place d'une image : muette, en boucle, lecture automatique (iPhone : playsinline).
  // L'image reste en place (cachée) et sert d'affiche pendant le chargement ; « mouvement réduit » garde l'image.
  var calme = false; try { calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (x) {}
  function vid(el, url) {
    var v = el.__rtVid;
    if (!url || calme) { if (v) { v.remove(); el.__rtVid = null; if (el.style.display === 'none') el.style.display = el.__rtDisp || ''; } return; }
    if (!v) {
      v = document.createElement('video'); v.className = 'rt-vid'; v.__rtImg = el;
      v.muted = true; v.defaultMuted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', ''); v.setAttribute('aria-hidden', 'true'); v.setAttribute('preload', 'auto'); v.setAttribute('disablepictureinpicture', '');
      el.__rtVid = v; el.__rtDisp = el.style.display;
    }
    if (v.getAttribute('src') !== url) { v.setAttribute('src', url); v.setAttribute('poster', el.getAttribute('src') || ''); }
    var css = el.style.cssText.replace(/display:\s*none;?/g, '');
    if (v.__css !== css) { v.__css = css; v.style.cssText = css; if (!/object-fit/.test(css)) v.style.objectFit = 'cover'; }
    var cls = String(el.className || '').replace(/\brt-hl\b/g, '').trim() + ' rt-vid'; if (v.className !== cls) v.className = cls;
    if (v.previousSibling !== el && el.parentNode) el.parentNode.insertBefore(v, el.nextSibling);
    if (el.style.display !== 'none') el.style.display = 'none';
    if (v.paused) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
  }
  function doImg(el) {
    if (el.tagName !== 'IMG') return;
    var s = el.getAttribute('src'); if (!s) return;
    if (el.__rtSet != null && s === el.__rtSet) { if (el.__rtR && el.__rtR.frame) frame(el, el.__rtR); if (el.__rtR) vid(el, el.__rtR.video); return; }
    var r = look(IM, normSrc(s), function () { return imgIdx(el); }); if (r == null) return;
    var to = r.src || s;
    el.__rtOrig = s; el.__rtSet = to; el.__rtR = r; if (to !== s) el.setAttribute('src', to);
    if (r.frame) frame(el, r);
    vid(el, r.video);
    touched.push(el);
  }
  function walk(root) {
    if (!root || inUi(root)) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    if (root.tagName === 'IMG') doImg(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (n.nodeType === 1) return /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT)$/.test(n.tagName) || n.id === 'cba' || (n.classList && n.classList.contains('rt-ui')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else if (n.tagName === 'IMG') doImg(n); }
  }
  function restore() {
    touched.forEach(function (n) {
      if (n.nodeType === 3) { if (n.nodeValue === n.__rtSet) n.nodeValue = n.__rtOrig; }
      else { if (n.getAttribute('src') === n.__rtSet && n.__rtOrig !== n.__rtSet) n.setAttribute('src', n.__rtOrig); unframe(n); vid(n, ''); n.__rtR = null; }
      n.__rtSet = null; n.__rtOrig = null;
    });
    touched = [];
  }
  // ---------- Déplacements : un élément (texte, image, cadre) décalé de dx, dy pixels, réglé à part pour ordinateur et téléphone ----------
  function ecran() { return window.innerWidth < 760 ? 'mob' : 'pc'; }
  function chemin(el) {
    var segs = [];
    while (el && el !== document.body && el.nodeType === 1) {
      if (el.id && !/^rt-/.test(el.id)) { segs.unshift('#' + CSS.escape(el.id)); return segs.join('>'); }
      var t = el.tagName.toLowerCase(), k = 1, s = el;
      while ((s = s.previousElementSibling)) if (s.tagName === el.tagName) k++;
      segs.unshift(t + ':nth-of-type(' + k + ')'); el = el.parentElement;
    }
    return 'body>' + segs.join('>');
  }
  function clsOf(el) { return String(el.getAttribute('class') || '').split(/\s+/).filter(function (c) { return c && !/^rt-/.test(c); }).sort().join(' '); }
  var moved = [];
  function placeEl(el, dx, dy) {
    if (!el.__rtPl) el.__rtPl = { tr: el.style.translate, pos: el.style.position, l: el.style.left, t: el.style.top, inl: getComputedStyle(el).display === 'inline' };
    var O = el.__rtPl;
    if (O.inl) {
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.style.left = dx + 'px'; el.style.top = dy + 'px';
    } else el.style.translate = (dx || dy) ? dx + 'px ' + dy + 'px' : O.tr;
    if (moved.indexOf(el) < 0) moved.push(el);
  }
  function unplace(el) { var O = el.__rtPl; if (!O) return; el.style.translate = O.tr; el.style.position = O.pos; el.style.left = O.l; el.style.top = O.t; el.__rtPl = null; }
  function findPlace(r) {
    var el = null; try { el = document.querySelector(r.chemin); } catch (e) { return null; }
    if (!el || inUi(el)) return null;
    if (r.cls != null && clsOf(el) !== r.cls) return null;
    return el;
  }
  function applyPlaces() {
    var R = fix(window.CASA_RETOUCHES), v = view(), sc = ecran(), keep = [];
    R.places.forEach(function (r) {
      if (!r || !r.chemin || (r.ecran || 'pc') !== sc || pg(r.page) !== v && pg(r.page) !== '*') return;
      var el = findPlace(r); if (!el) return;
      placeEl(el, Number(r.dx) || 0, Number(r.dy) || 0); keep.push(el);
    });
    moved = moved.filter(function (el) { if (keep.indexOf(el) >= 0 || el === dragEl) return true; unplace(el); return false; });
  }
  // ---------- Polices : police, graisse, italique, capitales et taille d'un élément (mêmes réglages sur ordinateur et téléphone) ----------
  var POLICES = [['', 'Police d’origine'], ['League Spartan', 'League Spartan (titres de la marque)'], ['Cormorant Garamond', 'Cormorant Garamond (élégante)'], ['Mulish', 'Mulish (texte courant)'], ['Barlow Condensed', 'Barlow Condensed (étroite)'], ['Archivo Black', 'Archivo Black (très grasse)'], ['Source Serif 4', 'Source Serif (journal)'], ['Cinzel', 'Cinzel (capitales classiques)'], ['Caveat', 'Caveat (manuscrite)']];
  var SECOURS = { 'League Spartan': "'Arial Black', sans-serif", 'Cormorant Garamond': 'Georgia, serif', 'Mulish': 'system-ui, sans-serif', 'Barlow Condensed': "'Arial Narrow', sans-serif", 'Archivo Black': "'Arial Black', sans-serif", 'Source Serif 4': 'Georgia, serif', 'Cinzel': 'Georgia, serif', 'Caveat': 'cursive' };
  var styled = [];
  function styleEl(el, f) {
    if (!el.__rtFo) el.__rtFo = { ff: el.style.fontFamily, fw: el.style.fontWeight, fs: el.style.fontStyle, tt: el.style.textTransform, sz: el.style.fontSize, ls: el.style.letterSpacing, base: parseFloat(getComputedStyle(el).fontSize) || 16 };
    var O = el.__rtFo;
    el.style.fontFamily = f.police ? "'" + f.police + "', " + (SECOURS[f.police] || 'sans-serif') : O.ff;
    el.style.fontWeight = f.graisse ? String(f.graisse) : O.fw;
    el.style.fontStyle = f.italique === true ? 'italic' : f.italique === false ? 'normal' : O.fs;
    el.style.textTransform = f.casse === 'maj' ? 'uppercase' : f.casse === 'normal' ? 'none' : O.tt;
    el.style.letterSpacing = f.casse ? (f.casse === 'maj' ? '.01em' : 'normal') : O.ls;
    el.style.fontSize = f.taille && Number(f.taille) !== 100 ? (O.base * Number(f.taille) / 100) + 'px' : O.sz;
    if (styled.indexOf(el) < 0) styled.push(el);
  }
  function unstyle(el) { var O = el.__rtFo; if (!O) return; el.style.fontFamily = O.ff; el.style.fontWeight = O.fw; el.style.fontStyle = O.fs; el.style.textTransform = O.tt; el.style.fontSize = O.sz; el.style.letterSpacing = O.ls; el.__rtFo = null; }
  function applyFonts() {
    var R = fix(window.CASA_RETOUCHES), v = view(), keep = [];
    R.polices.forEach(function (r) {
      if (!r || !r.chemin || pg(r.page) !== v && pg(r.page) !== '*') return;
      var el = findPlace(r); if (!el) return; styleEl(el, r); keep.push(el);
    });
    styled = styled.filter(function (el) { if (keep.indexOf(el) >= 0) return true; unstyle(el); return false; });
  }
  var dragEl = null;
  function refresh() { busy = true; try { restore(); compile(); walk(document.body); applyPlaces(); applyFonts(); } finally { busy = false; } }
  var lastView = null;
  function onMut(muts) {
    if (busy) return; busy = true;
    try {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i]; if (inUi(m.target)) continue;
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') { if (m.target.tagName === 'IMG') doImg(m.target); }
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
      if (muts.some(function (m) { return m.type === 'childList' && !inUi(m.target); })) { applyPlaces(); applyFonts(); }
    } finally { busy = false; }
  }
  function start() {
    src = window.CASA_RETOUCHES; refresh();
    var rz = null; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(applyPlaces, 150); });
    new MutationObserver(onMut).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src', 'style'] });
    // contenus publiés en ligne (chargés après coup) ou changement de page : on réapplique
    setInterval(function () {
      var v = view();
      if (window.CASA_RETOUCHES !== src || v !== lastView) { src = window.CASA_RETOUCHES; lastView = v; refresh(); } else { applyPlaces(); applyFonts(); }
      ui();
    }, 700);
  }

  // ---------- 2. mode retouche (administrateur) ----------
  var DKEY = 'cba-brouillon:CASA_RETOUCHES';
  var on = false, W = null, PUB = null, fab = null, bar = null, panel = null, hoverEl = null, css = false;
  function isAdmin() { try { return window.CasaSite.state.role === 'admin'; } catch (e) { return false; } }
  function adminOpen() { try { return !!(window.CasaAdmin && window.CasaAdmin.isOpen && window.CasaAdmin.isOpen()) || !!window.CASA_APERCU; } catch (e) { return false; } }
  function E(tag, props, kids) {
    var e = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k]; if (v == null || v === false) return;
      if (k === 'text') e.textContent = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v); else if (k === 'value') e.value = v; else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c == null || c === false) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function addCss() {
    if (css) return; css = true;
    document.head.appendChild(E('style', { text: '' +
      '.rt-ui{font-family:var(--font-body,system-ui,sans-serif);font-size:14px;color:#111;box-sizing:border-box}.rt-ui *{box-sizing:border-box}' +
      '.rt-fab{position:fixed;left:16px;bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:2147482990;background:#0b0b0b;color:#fff;border:2px solid #fff;font-weight:800;padding:.6rem .9rem;min-height:44px;cursor:pointer;box-shadow:0 10px 30px -10px rgba(0,0,0,.6)}' +
      '.rt-fab[aria-pressed="true"]{background:#fff;color:#0b0b0b;border-color:#0b0b0b}' +
      'body.rt-on main *:not(.rt-ui):hover{cursor:crosshair}' +
      '.rt-hl{outline:2px dashed #e0a100 !important;outline-offset:2px}.rt-mv{outline:2px dashed #1a73e8 !important;outline-offset:3px}body.rt-drag,body.rt-drag *{cursor:move !important;touch-action:none !important;user-select:none !important}.rt-panel.rt-ghost{opacity:.35}.rt-panel.rt-ghost:hover{opacity:1}.rt-pos{font-size:13px;color:#555;flex:1}' +
      '.rt-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:2147482991;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center;background:#0b0b0b;color:#fff;border:2px solid #fff;padding:.55rem .75rem;max-width:calc(100vw - 24px);width:max-content}' +
      '.rt-b{border:1.5px solid #111;background:#fff;color:#111;font-weight:800;padding:.45rem .8rem;min-height:38px;cursor:pointer;font-size:13.5px}.rt-b.pri{background:#111;color:#fff}.rt-bar .rt-b{border-color:#fff;background:transparent;color:#fff}.rt-bar .rt-b.pri{background:#fff;color:#111}.rt-b.dan{color:#b3261e;border-color:#b3261e}' +
      '.rt-panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:2147482995;background:#fff;border-left:2px solid #111;overflow:auto;padding:1rem;box-shadow:-20px 0 50px -20px rgba(0,0,0,.5)}' +
      '.rt-panel.rt-left{right:auto;left:0;border-left:0;border-right:2px solid #111;box-shadow:20px 0 50px -20px rgba(0,0,0,.5)}' +
      '@media (max-width:759px){.rt-panel,.rt-panel.rt-left{top:auto;left:0;right:0;width:100%;height:56vh;border:0;border-top:2px solid #111;box-shadow:0 -20px 50px -20px rgba(0,0,0,.5)}.rt-fr-img{max-height:150px}}' +
      '.rt-h{display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.6rem}.rt-h strong{font-size:1.1rem;text-transform:uppercase}' +
      '.rt-card{border:1.5px solid #ddd;padding:.8rem;margin:.6rem 0}.rt-lbl{display:block;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#666;margin:.55rem 0 .2rem}' +
      '.rt-in{width:100%;border:1.5px solid #ccc;padding:.5rem .6rem;font:inherit;min-height:38px;background:#fff;color:#111}textarea.rt-in{min-height:70px;resize:vertical;line-height:1.4}' +
      '.rt-orig{font-size:13px;color:#555;background:#f4f4f4;padding:.35rem .5rem;overflow-wrap:anywhere}.rt-row{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem;align-items:center}' +
      '.rt-img{width:100%;max-height:180px;object-fit:contain;background:#eee;display:block}.rt-fr{position:relative;display:block;width:max-content;max-width:100%;margin:0 auto;cursor:crosshair;touch-action:none;user-select:none;background:#eee}.rt-fr-img{display:block;max-width:100%;max-height:260px;width:auto;height:auto;pointer-events:none}.rt-fr-dot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px #111,0 2px 8px rgba(0,0,0,.5);pointer-events:none}.rt-zoom{display:flex;gap:.6rem;align-items:center;font-weight:800;font-size:13px;margin:.6rem 0 0}.rt-zoom input{flex:1}.rt-note{font-size:13px;color:#555;line-height:1.45;margin:.2rem 0 .6rem}' +
      '.rt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem;margin-top:.5rem}.rt-grid button{padding:0;border:1.5px solid #ddd;background:#eee;cursor:pointer;aspect-ratio:1}.rt-grid img{width:100%;height:100%;object-fit:cover;display:block}'
    }));
  }
  function saved() { return JSON.stringify(fix(W)) === JSON.stringify(fix(PUB)); }
  function draftPut() { try { if (saved()) localStorage.removeItem(DKEY); else localStorage.setItem(DKEY, JSON.stringify({ at: new Date().toISOString(), v: W })); } catch (e) {} }
  function draftGet() { try { var d = JSON.parse(localStorage.getItem(DKEY) || 'null'); return d && d.v ? d : null; } catch (e) { return null; } }
  function say(m) { try { window.CasaSite.say(m); } catch (e) {} }
  function live() { window.CASA_RETOUCHES = clone(W); src = window.CASA_RETOUCHES; refresh(); draftPut(); renderBar(); }
  function begin() {
    if (W == null) {
      PUB = fix(clone(window.CASA_RETOUCHES)); W = clone(PUB);
      var d = draftGet();
      if (d && JSON.stringify(fix(d.v)) !== JSON.stringify(PUB)) { W = fix(d.v); window.CASA_RETOUCHES = clone(W); say('Brouillon de retouches repris (non publié)'); }
    }
    on = true; document.body.classList.add('rt-on'); renderBar();
  }
  function stop() { endDrag(); on = false; document.body.classList.remove('rt-on'); unhl(); closePanel(); renderBar(); }
  function cancelAll() {
    if (!confirm('Annuler toutes les retouches non publiées ?')) return;
    W = clone(PUB); window.CASA_RETOUCHES = clone(PUB); try { localStorage.removeItem(DKEY); } catch (e) {} closePanel(); renderBar();
  }
  function publish(btn) {
    var A = window.CasaAuth || {};
    if (!A.saveContent) { say('Comptes non configurés : publication impossible'); return; }
    btn.disabled = true; btn.textContent = 'Publication…';
    A.saveContent('CASA_RETOUCHES', fix(W)).then(function () {
      PUB = clone(fix(W)); window.CASA_RETOUCHES = clone(PUB); try { localStorage.removeItem(DKEY); } catch (e) {} renderBar(); say('Retouches publiées : visibles par tous les visiteurs');
    }, function (e) { btn.disabled = false; btn.textContent = 'Publier'; say('Publication impossible : ' + ((e && e.message) || 'erreur')); });
  }
  function count() { var a = fix(W), b = fix(PUB), n = 0; ['textes', 'images', 'places', 'polices'].forEach(function (k) { var s = {}; b[k].forEach(function (r) { s[JSON.stringify(r)] = 1; }); a[k].forEach(function (r) { if (!s[JSON.stringify(r)]) n++; }); n += Math.max(0, b[k].length - a[k].length); }); return n; }
  function renderBar() {
    if (bar) { bar.remove(); bar = null; }
    if (!W || (!on && saved())) return;
    var n = saved() ? 0 : Math.max(1, count());
    bar = E('div', { class: 'rt-ui rt-bar', translate: 'no', role: 'region', 'aria-label': 'Retouches' }, [
      E('span', {}, [E('strong', { text: 'Retouche' }), n ? ' · ' + n + ' changement' + (n > 1 ? 's' : '') + ' non publié' + (n > 1 ? 's' : '') : ' · cliquez sur un texte ou une image']),
      n ? E('button', { type: 'button', class: 'rt-b pri', onclick: function (e) { publish(e.currentTarget); } }, ['Publier']) : null,
      n ? E('button', { type: 'button', class: 'rt-b', onclick: cancelAll }, ['Tout annuler']) : null,
      E('button', { type: 'button', class: 'rt-b', onclick: function () { if (on) stop(); else begin(); } }, [on ? 'Naviguer' : 'Reprendre la retouche'])
    ]);
    document.body.appendChild(bar);
  }
  function ui() {
    var show = isAdmin() && !adminOpen();
    if (show && !fab) {
      addCss();
      fab = E('button', { type: 'button', class: 'rt-ui rt-fab', translate: 'no', 'aria-pressed': 'false', title: 'Modifier les textes et les images de cette page', onclick: function () { if (EN) { say('Passez le site en français (bouton FR) pour retoucher ; vous pourrez ajouter la version anglaise.'); return; } if (on) stop(); else begin(); } }, ['✎ Retoucher']);
      document.body.appendChild(fab);
    }
    if (!show && fab) { if (on) stop(); fab.remove(); fab = null; if (bar) { bar.remove(); bar = null; } }
    if (show && !bar && W && !saved()) renderBar();
    if (fab) { fab.setAttribute('aria-pressed', on ? 'true' : 'false'); fab.textContent = on ? '✓ Retouche activée' : '✎ Retoucher'; }
  }
  function unhl() { if (hoverEl) { hoverEl.classList.remove('rt-hl'); hoverEl = null; } }
  function ownText(el) { for (var c = el.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && norm(c.nodeValue)) return true; return false; }
  function cand(el) { while (el && el !== document.body) { if (el.__rtImg) return el.__rtImg; if (el.tagName === 'IMG' || ownText(el)) return el; el = el.parentElement; } return null; }
  function skipEl(el) { return !el || !el.closest || !!el.closest('.rt-ui, #cba, .cba-modal, .cba-toast, .cba-pvbar'); }
  document.addEventListener('mouseover', function (e) {
    if (!on || dragEl || skipEl(e.target)) return; var c = cand(e.target); if (c === hoverEl) return; unhl(); if (c) { hoverEl = c; c.classList.add('rt-hl'); }
  }, true);
  ['click', 'mousedown', 'submit'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      if (!on || skipEl(e.target)) return;
      e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      if (t === 'click' && !dragEl) openPanel(e);
    }, { capture: true, passive: false });
  });

  var nOf = function (r) { return r.n == null || r.n === '' ? null : Number(r.n); };
  function findT(list, avant, page, n) { for (var i = 0; i < list.length; i++) if (norm(list[i].avant) === norm(avant) && pg(list[i].page) === pg(page) && nOf(list[i]) === (n == null ? null : n)) return i; return -1; }
  // la retouche qui s'applique à cet emplacement : d'abord « ici », puis « cette page », puis « tout le site »
  function findE(list, avant, idx) { var v = view(), i = findT(list, avant, v, idx); if (i < 0) i = findT(list, avant, v, null); if (i < 0) i = findT(list, avant, '*', null); return i; }
  function scopeSel(r, v, idx, whole) {
    var sel = E('select', { class: 'rt-in' }, [E('option', { value: 'ici', text: 'Seulement cet emplacement' }), E('option', { value: v, text: 'Partout sur cette page (' + v + ')' }), E('option', { value: '*', text: whole })]);
    sel.value = !r ? 'ici' : nOf(r) != null ? 'ici' : pg(r.page) === '*' ? '*' : v;
    return sel;
  }
  function scopeVal(sel, v, idx) { return sel.value === 'ici' ? { page: v, n: idx } : sel.value === '*' ? { page: '', n: null } : { page: v, n: null }; }
  function putE(list, cur, avant, sc, obj) {
    if (cur >= 0) list.splice(cur, 1);
    var d = findT(list, avant, sc.page || '*', sc.n); if (d >= 0) list.splice(d, 1);
    if (obj) { obj.avant = avant; obj.page = sc.page; if (sc.n != null) obj.n = sc.n; list.push(obj); }
  }
  var side = 'right';
  function closePanel() { endDrag(); unmark(); if (panel) { panel.remove(); panel = null; } }
  // ---------- glisser un élément directement sur la page ----------
  var dragSt = null, dragDone = null, markEl = null;
  function unmark() { if (markEl) { markEl.classList.remove('rt-mv'); markEl = null; } }
  function mark(el) { unmark(); if (el) { markEl = el; el.classList.add('rt-mv'); } }
  function startDrag(el, get, set, done) {
    endDrag(); dragEl = el; dragDone = done; mark(el); document.body.classList.add('rt-drag');
    dragSt = { get: get, set: set };
  }
  function endDrag() {
    if (!dragEl) return; var d = dragDone; dragEl = null; dragDone = null; dragSt = null; document.body.classList.remove('rt-drag');
    if (d) d();
  }
  document.addEventListener('pointerdown', function (e) {
    if (!dragEl || skipEl(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    var p = dragSt.get(); dragSt.x0 = e.clientX; dragSt.y0 = e.clientY; dragSt.dx0 = p[0]; dragSt.dy0 = p[1]; dragSt.down = true;
  }, { capture: true, passive: false });
  document.addEventListener('pointermove', function (e) {
    if (!dragEl || !dragSt || !dragSt.down) return; e.preventDefault();
    dragSt.cur = [Math.round(dragSt.dx0 + e.clientX - dragSt.x0), Math.round(dragSt.dy0 + e.clientY - dragSt.y0)];
    dragSt.set(dragSt.cur[0], dragSt.cur[1], false);
  }, { capture: true, passive: false });
  ['pointerup', 'pointercancel'].forEach(function (t) { document.addEventListener(t, function () { if (dragSt && dragSt.down) { dragSt.down = false; if (dragSt.cur) { dragSt.set(dragSt.cur[0], dragSt.cur[1], true); dragSt.cur = null; } } }, true); });
  function moveCard(target) {
    // l'élément cliqué, puis les blocs qui l'entourent (cadres, colonnes, sections)
    var opts = [], el = target, names = ['Cet élément', 'Le cadre autour', 'Le bloc plus grand', 'La section entière'];
    while (el && el !== document.body && opts.length < 4) {
      var b = el.getBoundingClientRect(), prev = opts[opts.length - 1];
      if (b.width && b.height && !/^(MAIN|HTML|BODY)$/.test(el.tagName) && (!prev || Math.abs(prev.b.width - b.width) > 4 || Math.abs(prev.b.height - b.height) > 4)) opts.push({ el: el, b: b });
      el = el.parentElement;
    }
    if (!opts.length) return null;
    var v = view(), sc = ecran(), cur = opts[0];
    var sel = E('select', { class: 'rt-in' }, opts.map(function (o, i) { return E('option', { value: String(i), text: (target.tagName === 'IMG' && i === 0 ? 'Cette image' : names[i]) + ' (' + Math.round(o.b.width) + ' × ' + Math.round(o.b.height) + ')' }); }));
    var info = E('span', { class: 'rt-pos' });
    var keyOf = function () { return { chemin: chemin(cur.el), cls: clsOf(cur.el) }; };
    var idxOf = function () { var k = keyOf(); for (var i = 0; i < W.places.length; i++) { var r = W.places[i]; if (r.chemin === k.chemin && pg(r.page) === v && (r.ecran || 'pc') === sc) return i; } return -1; };
    var get = function () { var i = idxOf(), r = i >= 0 ? W.places[i] : null; return r ? [Number(r.dx) || 0, Number(r.dy) || 0] : [0, 0]; };
    var set = function (dx, dy, commit) {
      placeEl(cur.el, dx, dy); info.textContent = (dx || dy) ? 'Décalé de ' + dx + ' px ' + (dx >= 0 ? '→' : '←') + ', ' + dy + ' px ' + (dy >= 0 ? '↓' : '↑') : 'À sa place d’origine';
      if (!commit) return;
      var i = idxOf(); if (i >= 0) W.places.splice(i, 1);
      if (dx || dy) { var k = keyOf(); W.places.push({ page: v, ecran: sc, chemin: k.chemin, cls: k.cls, dx: dx, dy: dy }); }
      live();
    };
    var pas = E('select', { class: 'rt-in', style: 'width:auto;min-height:38px' }, [['1', '1 px'], ['10', '10 px'], ['40', '40 px']].map(function (o) { return E('option', { value: o[0], text: o[1] }); })); pas.value = '10';
    var nudge = function (ax, ay) { return function () { var p = get(), n = Number(pas.value) || 10; set(p[0] + ax * n, p[1] + ay * n, true); }; };
    var arrow = function (lab, ax, ay, title) { return E('button', { type: 'button', class: 'rt-b', title: title, 'aria-label': title, onclick: nudge(ax, ay) }, [lab]); };
    var dragBtn = E('button', { type: 'button', class: 'rt-b pri' }, ['Glisser sur la page']);
    var stopDrag = function () { dragBtn.textContent = 'Glisser sur la page'; dragBtn.classList.add('pri'); if (panel) panel.classList.remove('rt-ghost'); };
    dragBtn.addEventListener('click', function () {
      if (dragEl) { endDrag(); return; }
      startDrag(cur.el, get, set, stopDrag); dragBtn.textContent = '✓ Terminer le déplacement'; dragBtn.classList.remove('pri');
      if (panel) panel.classList.add('rt-ghost'); say('Faites glisser n’importe où sur la page : l’élément suit. « Terminer » quand c’est bien.');
    });
    // ---- police de l'élément choisi ----
    var fIdx = function () { var k = keyOf(); for (var i = 0; i < W.polices.length; i++) { var r = W.polices[i]; if (r.chemin === k.chemin && pg(r.page) === v) return i; } return -1; };
    var fpol = E('select', { class: 'rt-in' }, POLICES.map(function (o) { return E('option', { value: o[0], text: o[1], style: o[0] ? 'font-family:\'' + o[0] + '\'' : null }); }));
    var fgr = E('select', { class: 'rt-in' }, [['', 'Graisse d’origine'], ['400', 'Normale'], ['500', 'Moyenne'], ['600', 'Demi-grasse'], ['700', 'Grasse'], ['800', 'Très grasse']].map(function (o) { return E('option', { value: o[0], text: o[1] }); }));
    var fit = E('select', { class: 'rt-in' }, [['', 'Style d’origine'], ['oui', 'Italique'], ['non', 'Droit']].map(function (o) { return E('option', { value: o[0], text: o[1] }); }));
    var fca = E('select', { class: 'rt-in' }, [['', 'Casse d’origine'], ['maj', 'TOUT EN CAPITALES'], ['normal', 'Minuscules normales']].map(function (o) { return E('option', { value: o[0], text: o[1] }); }));
    var fsz = E('input', { type: 'range', min: '50', max: '200', step: '5', value: '100', 'aria-label': 'Taille du texte' });
    var fszv = E('span', { text: '100 %' });
    var fread = function () { var i = fIdx(), r = i >= 0 ? W.polices[i] : {}; fpol.value = r.police || ''; fgr.value = r.graisse ? String(r.graisse) : ''; fit.value = r.italique === true ? 'oui' : r.italique === false ? 'non' : ''; fca.value = r.casse || ''; fsz.value = String(r.taille || 100); fszv.textContent = fsz.value + ' %'; };
    var fval = function () { var o = {}; if (fpol.value) o.police = fpol.value; if (fgr.value) o.graisse = Number(fgr.value); if (fit.value) o.italique = fit.value === 'oui'; if (fca.value) o.casse = fca.value; if (Number(fsz.value) !== 100) o.taille = Number(fsz.value); return o; };
    var fsave = function (commit) {
      var o = fval(); fszv.textContent = fsz.value + ' %';
      if (Object.keys(o).length) styleEl(cur.el, o); else unstyle(cur.el);
      if (!commit) return;
      var i = fIdx(); if (i >= 0) W.polices.splice(i, 1);
      if (Object.keys(o).length) { var k = keyOf(); W.polices.push(Object.assign({ page: v, chemin: k.chemin, cls: k.cls }, o)); }
      live();
    };
    [fpol, fgr, fit, fca].forEach(function (x) { x.addEventListener('change', function () { fsave(true); }); });
    fsz.addEventListener('input', function () { fsave(false); }); fsz.addEventListener('change', function () { fsave(true); });
    var fontCard = E('div', { class: 'rt-card' }, [
      E('span', { class: 'rt-lbl', text: 'Police d’écriture' }),
      E('p', { class: 'rt-note', text: 'S’applique à l’élément choisi dans « Déplacer » (encadré bleu) : pour un titre ou un paragraphe, gardez « Cet élément ». Même réglage sur ordinateur et téléphone.' }),
      fpol, E('div', { class: 'rt-row', style: 'display:grid;grid-template-columns:1fr 1fr;gap:.4rem' }, [fgr, fit]), E('div', { class: 'rt-row' }, [fca]),
      E('label', { class: 'rt-zoom' }, ['Taille ', fsz, fszv]),
      E('div', { class: 'rt-row' }, [E('button', { type: 'button', class: 'rt-b dan', onclick: function () { fpol.value = fgr.value = fit.value = fca.value = ''; fsz.value = '100'; fsave(true); } }, ['Police d’origine'])])
    ]);
    var pick = function () { endDrag(); cur = opts[Number(sel.value) || 0]; mark(cur.el); var p = get(); set(p[0], p[1], false); fread(); };
    sel.addEventListener('change', pick);
    setTimeout(pick, 0);
    return [E('div', { class: 'rt-card' }, [
      E('span', { class: 'rt-lbl', text: 'Déplacer' }),
      E('p', { class: 'rt-note', text: 'Choisissez ce qui bouge (encadré en pointillés bleus), puis faites-le glisser sur la page ou avancez-le avec les flèches. Réglé à part ' + (sc === 'mob' ? 'pour le téléphone' : 'pour l’ordinateur') + ' : l’autre écran ne change pas.' }),
      sel,
      E('div', { class: 'rt-row' }, [dragBtn]),
      E('div', { class: 'rt-row' }, [arrow('←', -1, 0, 'Vers la gauche'), arrow('↑', 0, -1, 'Vers le haut'), arrow('↓', 0, 1, 'Vers le bas'), arrow('→', 1, 0, 'Vers la droite'), pas]),
      E('div', { class: 'rt-row' }, [info, E('button', { type: 'button', class: 'rt-b dan', onclick: function () { set(0, 0, true); } }, ['Remettre à sa place'])])
    ]), fontCard];
  }
  function openPanel(e) {
    var target = cand(e.target);
    var texts = [], imgs = [];
    if (target && target.tagName !== 'IMG') {
      var w = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode()) && texts.length < 8) { if (!norm(n.nodeValue) || (n.parentElement && /^(SCRIPT|STYLE)$/.test(n.parentElement.tagName))) continue; texts.push(n); }
    }
    try { (document.elementsFromPoint(e.clientX, e.clientY) || []).forEach(function (el) { if (el.__rtImg) el = el.__rtImg; if (el.tagName === 'IMG' && !skipEl(el) && imgs.indexOf(el) < 0 && imgs.length < 2) imgs.push(el); }); } catch (x) {}
    if (target && target.tagName === 'IMG' && imgs.indexOf(target) < 0) imgs.unshift(target);
    if (!texts.length && !imgs.length) { say('Rien de modifiable ici : cliquez sur un texte ou une image.'); return; }
    closePanel(); addCss();
    var v = view();
    var kids = [E('div', { class: 'rt-h' }, [E('strong', { text: 'Retoucher' }), E('span', { class: 'rt-row', style: 'margin:0' }, [E('button', { type: 'button', class: 'rt-b', title: 'Mettre le volet de l’autre côté pour voir la page', onclick: function () { side = side === 'left' ? 'right' : 'left'; if (panel) panel.className = 'rt-ui rt-panel' + (side === 'left' ? ' rt-left' : ''); } }, ['⇆ Côté']), E('button', { type: 'button', class: 'rt-b', onclick: closePanel }, ['Fermer ✕'])])]),
      E('p', { class: 'rt-note', text: 'Le changement s’affiche tout de suite sur le site (aperçu). Rien n’est visible des visiteurs avant « Publier » dans la barre noire.' })];
    var mv = moveCard(target || imgs[0]); if (mv) { kids.push(mv[0]); if (target && target.tagName !== 'IMG') kids.push(mv[1]); }
    texts.forEach(function (n) {
      var orig = norm(origText(n)), idx = textIdx(n);
      var i = findE(W.textes, orig, idx), r = i >= 0 ? W.textes[i] : null;
      var ta = E('textarea', { class: 'rt-in', value: r ? r.apres : orig });
      var en = E('input', { class: 'rt-in', value: r ? (r.apresEn || '') : '', placeholder: 'Facultatif' });
      var scope = scopeSel(r, v, idx, 'Partout sur le site');
      kids.push(E('div', { class: 'rt-card' }, [
        E('span', { class: 'rt-lbl', text: 'Texte d’origine' }), E('div', { class: 'rt-orig', text: orig }),
        E('span', { class: 'rt-lbl', text: 'Nouveau texte' }), ta,
        E('span', { class: 'rt-lbl', text: 'En anglais' }), en,
        E('span', { class: 'rt-lbl', text: 'Où' }), scope,
        E('div', { class: 'rt-row' }, [
          E('button', { type: 'button', class: 'rt-b pri', onclick: function () {
            var j = findE(W.textes, orig, idx);
            putE(W.textes, j, orig, scopeVal(scope, v, idx), (norm(ta.value) !== orig || norm(en.value)) ? { apres: ta.value.trim(), apresEn: en.value.trim() } : null);
            live(); say('Aperçu mis à jour');
          } }, ['Appliquer']),
          r ? E('button', { type: 'button', class: 'rt-b dan', onclick: function () { var j = findE(W.textes, orig, idx); if (j >= 0) W.textes.splice(j, 1); live(); closePanel(); } }, ['Rétablir l’original']) : null
        ])
      ]));
    });
    imgs.forEach(function (im) {
      var orig = origSrc(im), idx = imgIdx(im);
      var i = findE(W.images, orig, idx), r = i >= 0 ? W.images[i] : null;
      var F = { x: r && r.x != null ? Number(r.x) : 50, y: r && r.y != null ? Number(r.y) : 50, z: r && r.z ? Number(r.z) : 1, taille: (r && r.taille) || '' };
      var source = (r && r.source) || '';
      var vurl = E('input', { class: 'rt-in', value: (r && r.video) || '', placeholder: 'Adresse d’une vidéo .mp4 (facultatif)' });
      // format de l'emplacement sur la page → format de rognage le plus proche
      var bx = im.getBoundingClientRect(), ar = bx.height ? bx.width / bx.height : 16 / 9;
      var RT = [['16:9', 16 / 9], ['4:3', 4 / 3], ['3:2', 1.5], ['1:1', 1], ['4:5', 0.8], ['3:4', 0.75], ['9:16', 9 / 16]];
      var ratio = RT.reduce(function (b, x) { return Math.abs(Math.log(x[1] / ar)) < Math.abs(Math.log(b[1] / ar)) ? x : b; })[0];
      var cur = function () { return url.value.trim() || orig; };
      var thumb = E('img', { class: 'rt-fr-img', src: r && r.apres ? r.apres : orig, alt: '', draggable: 'false' });
      var dot = E('span', { class: 'rt-fr-dot', 'aria-hidden': 'true' });
      var box = E('div', { class: 'rt-fr' }, [thumb, dot]);
      var zoom = E('input', { type: 'range', min: '1', max: '3', step: '0.05', value: String(F.z), 'aria-label': 'Zoom dans l’emplacement' });
      var url = E('input', { class: 'rt-in', value: r ? (r.apres || '') : '', placeholder: 'assets/… ou adresse d’une image' });
      var scope = scopeSel(r, v, idx, 'Partout où cette image apparaît sur le site');
      var same = function () { return Array.prototype.filter.call(document.querySelectorAll('img'), function (x) { return !skipEl(x) && origSrc(x) === orig; }); };
      var paint = function () {
        dot.style.left = F.x + '%'; dot.style.top = F.y + '%';
        same().forEach(function (x) { if (scope.value !== 'ici' || x === im) { frame(x, F); if (x.__rtVid) vid(x, x.__rtVid.getAttribute('src')); } });
      };
      scope.addEventListener('change', function () { save(true); });
      var save = function (quiet) {
        var k = findE(W.images, orig, idx);
        var changed = normSrc(url.value) && normSrc(url.value) !== orig, framed = F.x !== 50 || F.y !== 50 || F.z !== 1 || !!F.taille || !!vurl.value.trim();
        putE(W.images, k, orig, scopeVal(scope, v, idx), (changed || framed) ? Object.assign({ apres: changed ? url.value.trim() : '', x: Math.round(F.x), y: Math.round(F.y), z: Math.round(F.z * 100) / 100 }, F.taille ? { taille: F.taille } : {}, source && changed ? { source: source } : {}, vurl.value.trim() ? { video: vurl.value.trim() } : {}) : null);
        thumb.src = cur(); live(); paint(); srcBtn.style.display = source && normSrc(source) !== normSrc(cur()) ? '' : 'none'; if (!quiet) say('Aperçu mis à jour');
      };
      var apply = function () { save(false); };
      var setFrom = function (ev) { var b = thumb.getBoundingClientRect(); if (!b.width) return; F.x = Math.max(0, Math.min(100, (ev.clientX - b.left) / b.width * 100)); F.y = Math.max(0, Math.min(100, (ev.clientY - b.top) / b.height * 100)); paint(); };
      var dragging = false;
      box.addEventListener('pointerdown', function (ev) { dragging = true; try { box.setPointerCapture(ev.pointerId); } catch (x) {} setFrom(ev); ev.preventDefault(); });
      box.addEventListener('pointermove', function (ev) { if (dragging) setFrom(ev); });
      var end = function () { if (!dragging) return; dragging = false; save(true); };
      box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
      zoom.addEventListener('input', function () { F.z = Number(zoom.value) || 1; paint(); });
      zoom.addEventListener('change', function () { save(true); });
      var CA = function () { var c = window.CasaAdmin || {}; if (c.ensureCss) c.ensureCss(); return c; };
      var upload = function (x, btn, label) {
        var c = CA(); if (!c.uploadFile) { say('Envoi indisponible'); return Promise.resolve(); }
        btn.disabled = true; btn.textContent = 'Envoi…';
        return c.uploadFile(x).then(function (u) { url.value = u; F.x = 50; F.y = 50; F.z = 1; zoom.value = '1'; btn.disabled = false; btn.textContent = label; save(false); },
          function (er) { btn.disabled = false; btn.textContent = label; say('Envoi impossible : ' + ((er && er.message) || 'erreur')); });
      };
      var file = E('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: function (ev) {
        var f = ev.target.files && ev.target.files[0]; ev.target.value = ''; if (!f) return;
        // la photo arrive telle quelle dans son emplacement : on la cadre ensuite en glissant, sans rognage obligatoire
        source = ''; upload(f, up, 'Envoyer une photo');
      } });
      var up = E('button', { type: 'button', class: 'rt-b pri', onclick: function () { file.click(); } }, ['Envoyer une photo']);
      var cropBtn = E('button', { type: 'button', class: 'rt-b', title: 'Recadre le fichier au format de cet emplacement (' + ratio + ')', onclick: function () {
        var c = CA(); if (!c.cropImage) { say('Rognage indisponible'); return; }
        var before = source || cur(); c.cropImage(before, { ratio: ratio }).then(function (x) { if (x) { source = before; return upload(x, cropBtn, 'Rogner le fichier (' + ratio + ')'); } });
      } }, ['Rogner le fichier (' + ratio + ')']);
      var grid = E('div', { class: 'rt-grid' });
      var vfile = E('input', { type: 'file', accept: 'video/mp4,video/webm,video/quicktime', style: 'display:none', onchange: function (ev) {
        var f = ev.target.files && ev.target.files[0]; ev.target.value = ''; if (!f) return;
        var c = CA(); if (!c.uploadVideo) { say('Envoi indisponible'); return; }
        vup.disabled = true; vup.textContent = 'Envoi de la vidéo…';
        c.uploadVideo(f).then(function (u) { vurl.value = u; vup.disabled = false; vup.textContent = 'Envoyer une vidéo'; save(false); },
          function (er) { vup.disabled = false; vup.textContent = 'Envoyer une vidéo'; say('Envoi impossible : ' + ((er && er.message) || 'erreur')); });
      } });
      var vup = E('button', { type: 'button', class: 'rt-b pri', onclick: function () { vfile.click(); } }, ['Envoyer une vidéo']);
      var taille = E('select', { class: 'rt-in', onchange: function () { F.taille = taille.value; save(false); } },
        [['', 'Comme prévu par la page'], ['plein', 'Pleine largeur (sur toute la largeur du bloc)'], ['fond', 'Pleine largeur, image entière (sans la couper)'], ['entiere', 'Image entière, sans la couper']].map(function (o) { return E('option', { value: o[0], selected: o[0] === F.taille ? 'selected' : null }, [o[1]]); }));
      var srcBtn = E('button', { type: 'button', class: 'rt-b', style: source && normSrc(source) !== normSrc(cur()) ? '' : 'display:none', title: 'Remet la photo telle qu’elle était avant le rognage', onclick: function () { url.value = source; source = ''; F.x = 50; F.y = 50; F.z = 1; zoom.value = '1'; save(false); } }, ['Revenir à la photo non rognée']);
      var lib = E('button', { type: 'button', class: 'rt-b', onclick: function () {
        var A = window.CasaAuth || {}; if (!A.listImages) { say('Bibliothèque indisponible'); return; }
        lib.textContent = 'Chargement…';
        A.listImages('images').then(function (list) {
          lib.textContent = 'Bibliothèque'; grid.textContent = '';
          (list || []).slice(0, 60).forEach(function (x) { grid.appendChild(E('button', { type: 'button', title: x.name, onclick: function () { url.value = x.url; source = ''; F.x = 50; F.y = 50; F.z = 1; zoom.value = '1'; apply(); } }, [E('img', { src: x.url, alt: x.name, loading: 'lazy' })])); });
          if (!(list || []).length) grid.appendChild(E('p', { class: 'rt-note', text: 'Aucune image envoyée pour l’instant.' }));
        }, function () { lib.textContent = 'Bibliothèque'; say('Bibliothèque indisponible'); });
      } }, ['Bibliothèque']);
      kids.push(E('div', { class: 'rt-card' }, [
        E('span', { class: 'rt-lbl', text: 'Image · cadrage en direct' }),
        E('p', { class: 'rt-note', text: 'Cliquez ou faites glisser sur la photo pour choisir le point à garder au centre, puis réglez le zoom : l’emplacement sur la page change en même temps.' }),
        box,
        E('label', { class: 'rt-zoom' }, ['Zoom ', zoom]),
        E('div', { class: 'rt-row' }, [E('button', { type: 'button', class: 'rt-b', onclick: function () { F.x = 50; F.y = 50; F.z = 1; zoom.value = '1'; save(false); } }, ['Recentrer']), cropBtn]),
        E('span', { class: 'rt-lbl', text: 'Taille dans la page' }), taille,
        E('span', { class: 'rt-lbl', text: 'Vidéo en arrière-plan (comme sur les sites de mode)' }),
        E('p', { class: 'rt-note', text: 'La vidéo remplace l’image à cet endroit : sans le son, en boucle, lancée toute seule, aussi sur téléphone. L’image reste affichée le temps du chargement. Format .mp4, 50 Mo maximum, idéalement moins de 15 secondes.' }),
        vurl, vfile,
        E('div', { class: 'rt-row' }, [vup, E('button', { type: 'button', class: 'rt-b', onclick: function () { save(false); } }, ['Appliquer la vidéo']),
          E('button', { type: 'button', class: 'rt-b', onclick: function () { vurl.value = ''; save(false); } }, ['Retirer la vidéo'])]),
        E('div', { class: 'rt-row' }, [srcBtn]),
        E('div', { class: 'rt-orig', text: 'Origine : ' + orig }),
        E('span', { class: 'rt-lbl', text: 'Nouvelle image' }), url,
        E('span', { class: 'rt-lbl', text: 'Où' }), scope,
        E('div', { class: 'rt-row' }, [up, lib, E('button', { type: 'button', class: 'rt-b', onclick: apply }, ['Appliquer']), file,
          r ? E('button', { type: 'button', class: 'rt-b dan', onclick: function () { var k = findE(W.images, orig, idx); if (k >= 0) W.images.splice(k, 1); live(); closePanel(); } }, ['Rétablir l’original']) : null]),
        grid
      ]));
      setTimeout(paint, 0);
    });
    // le volet se met du côté opposé à l'image, pour la voir pendant le cadrage ; sur téléphone il passe en bas
    if (imgs.length) {
      var rb = imgs[0].getBoundingClientRect();
      side = (rb.left + rb.width / 2) > window.innerWidth / 2 ? 'left' : 'right';
      if (window.innerWidth < 760) { try { window.scrollBy({ top: rb.top - 70, behavior: 'smooth' }); } catch (x) {} }
    }
    panel = E('div', { class: 'rt-ui rt-panel' + (side === 'left' ? ' rt-left' : ''), translate: 'no', role: 'dialog', 'aria-label': 'Retoucher' }, kids);
    document.body.appendChild(panel);
  }

  window.CasaRetouches = { refresh: refresh, start: function () { if (!EN) begin(); }, stop: stop };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
