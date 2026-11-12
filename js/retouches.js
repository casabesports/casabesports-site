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
  var blank = function () { return { textes: [], images: [] }; };
  var fix = function (R) { R = R && typeof R === 'object' ? R : {}; return { textes: Array.isArray(R.textes) ? R.textes : [], images: Array.isArray(R.images) ? R.images : [] }; };
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
      var p = pg(r.page); TX[p] = TX[p] || {};
      TX[p][a] = String(to);
      if (EN) { var ta = norm(window.CasaLang.t(a)); if (ta && ta !== a) TX[p][ta] = String(to); }
    });
    R.images.forEach(function (r) {
      if (!r || !normSrc(r.avant) || !normSrc(r.apres)) return;
      var p = pg(r.page); IM[p] = IM[p] || {}; IM[p][normSrc(r.avant)] = String(r.apres).trim();
    });
  }
  function look(M, k) { var v = view(); var a = M[v] && M[v][k]; if (a != null) return a; return M['*'] ? M['*'][k] : undefined; }
  function inUi(n) { var e = n.nodeType === 1 ? n : n.parentNode; return !!(e && e.closest && e.closest('#cba, .rt-ui')); }
  function doText(n) {
    var v = n.nodeValue; if (!v || !/[A-Za-zÀ-ÿ0-9]/.test(v)) return;
    if (n.__rtSet != null && v === n.__rtSet) return;
    var r = look(TX, norm(v)); if (r == null) return;
    var lead = v.match(/^\s*/)[0], trail = v.match(/\s*$/)[0], nv = lead + r + trail;
    if (nv === v) return;
    n.__rtOrig = v; n.__rtSet = nv; n.nodeValue = nv; touched.push(n);
  }
  function doImg(el) {
    if (el.tagName !== 'IMG') return;
    var s = el.getAttribute('src'); if (!s) return;
    if (el.__rtSet != null && s === el.__rtSet) return;
    var r = look(IM, normSrc(s)); if (r == null || r === s) return;
    el.__rtOrig = s; el.__rtSet = r; el.setAttribute('src', r); touched.push(el);
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
      else if (n.getAttribute('src') === n.__rtSet) n.setAttribute('src', n.__rtOrig);
      n.__rtSet = null; n.__rtOrig = null;
    });
    touched = [];
  }
  function refresh() { busy = true; try { restore(); compile(); walk(document.body); } finally { busy = false; } }
  var lastView = null;
  function onMut(muts) {
    if (busy) return; busy = true;
    try {
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i]; if (inUi(m.target)) continue;
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doImg(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    } finally { busy = false; }
  }
  function start() {
    src = window.CASA_RETOUCHES; refresh();
    new MutationObserver(onMut).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src'] });
    // contenus publiés en ligne (chargés après coup) ou changement de page : on réapplique
    setInterval(function () {
      var v = view();
      if (window.CASA_RETOUCHES !== src || v !== lastView) { src = window.CASA_RETOUCHES; lastView = v; refresh(); }
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
      '.rt-hl{outline:2px dashed #e0a100 !important;outline-offset:2px}' +
      '.rt-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:2147482991;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center;background:#0b0b0b;color:#fff;border:2px solid #fff;padding:.55rem .75rem;max-width:calc(100vw - 24px);width:max-content}' +
      '.rt-b{border:1.5px solid #111;background:#fff;color:#111;font-weight:800;padding:.45rem .8rem;min-height:38px;cursor:pointer;font-size:13.5px}.rt-b.pri{background:#111;color:#fff}.rt-bar .rt-b{border-color:#fff;background:transparent;color:#fff}.rt-bar .rt-b.pri{background:#fff;color:#111}.rt-b.dan{color:#b3261e;border-color:#b3261e}' +
      '.rt-panel{position:fixed;top:0;right:0;bottom:0;width:min(440px,100vw);z-index:2147482995;background:#fff;border-left:2px solid #111;overflow:auto;padding:1rem;box-shadow:-20px 0 50px -20px rgba(0,0,0,.5)}' +
      '.rt-h{display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.6rem}.rt-h strong{font-size:1.1rem;text-transform:uppercase}' +
      '.rt-card{border:1.5px solid #ddd;padding:.8rem;margin:.6rem 0}.rt-lbl{display:block;font-size:11.5px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:#666;margin:.55rem 0 .2rem}' +
      '.rt-in{width:100%;border:1.5px solid #ccc;padding:.5rem .6rem;font:inherit;min-height:38px;background:#fff;color:#111}textarea.rt-in{min-height:70px;resize:vertical;line-height:1.4}' +
      '.rt-orig{font-size:13px;color:#555;background:#f4f4f4;padding:.35rem .5rem;overflow-wrap:anywhere}.rt-row{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.6rem;align-items:center}' +
      '.rt-img{width:100%;max-height:180px;object-fit:contain;background:#eee;display:block}.rt-note{font-size:13px;color:#555;line-height:1.45;margin:.2rem 0 .6rem}' +
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
  function stop() { on = false; document.body.classList.remove('rt-on'); unhl(); closePanel(); renderBar(); }
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
  function count() { var a = fix(W), b = fix(PUB), n = 0; ['textes', 'images'].forEach(function (k) { var s = {}; b[k].forEach(function (r) { s[JSON.stringify(r)] = 1; }); a[k].forEach(function (r) { if (!s[JSON.stringify(r)]) n++; }); n += Math.max(0, b[k].length - a[k].length); }); return n; }
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
  function cand(el) { while (el && el !== document.body) { if (el.tagName === 'IMG' || ownText(el)) return el; el = el.parentElement; } return null; }
  function skipEl(el) { return !el || !el.closest || !!el.closest('.rt-ui, #cba, .cba-modal, .cba-toast, .cba-pvbar'); }
  document.addEventListener('mouseover', function (e) {
    if (!on || skipEl(e.target)) return; var c = cand(e.target); if (c === hoverEl) return; unhl(); if (c) { hoverEl = c; c.classList.add('rt-hl'); }
  }, true);
  ['click', 'mousedown', 'submit'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      if (!on || skipEl(e.target)) return;
      e.preventDefault(); e.stopPropagation(); if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      if (t === 'click') openPanel(e);
    }, { capture: true, passive: false });
  });

  function findT(list, avant, page) { for (var i = 0; i < list.length; i++) if (norm(list[i].avant) === avant && pg(list[i].page) === pg(page)) return i; return -1; }
  function anyT(list, avant) { var v = view(); var i = findT(list, avant, v); return i >= 0 ? i : findT(list, avant, '*'); }
  function closePanel() { if (panel) { panel.remove(); panel = null; } }
  function openPanel(e) {
    var target = cand(e.target);
    var texts = [], imgs = [];
    if (target && target.tagName !== 'IMG') {
      var w = document.createTreeWalker(target, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode()) && texts.length < 8) { if (!norm(n.nodeValue) || (n.parentElement && /^(SCRIPT|STYLE)$/.test(n.parentElement.tagName))) continue; texts.push(n); }
    }
    try { (document.elementsFromPoint(e.clientX, e.clientY) || []).forEach(function (el) { if (el.tagName === 'IMG' && !skipEl(el) && imgs.indexOf(el) < 0 && imgs.length < 2) imgs.push(el); }); } catch (x) {}
    if (target && target.tagName === 'IMG' && imgs.indexOf(target) < 0) imgs.unshift(target);
    if (!texts.length && !imgs.length) { say('Rien de modifiable ici : cliquez sur un texte ou une image.'); return; }
    closePanel(); addCss();
    var v = view();
    var kids = [E('div', { class: 'rt-h' }, [E('strong', { text: 'Retoucher' }), E('button', { type: 'button', class: 'rt-b', onclick: closePanel }, ['Fermer ✕'])]),
      E('p', { class: 'rt-note', text: 'Le changement s’affiche tout de suite sur le site (aperçu). Rien n’est visible des visiteurs avant « Publier » dans la barre noire.' })];
    texts.forEach(function (n) {
      var orig = norm(n.__rtOrig != null && n.nodeValue === n.__rtSet ? n.__rtOrig : n.nodeValue);
      var i = anyT(W.textes, orig), r = i >= 0 ? W.textes[i] : null;
      var ta = E('textarea', { class: 'rt-in', value: r ? r.apres : orig });
      var en = E('input', { class: 'rt-in', value: r ? (r.apresEn || '') : '', placeholder: 'Facultatif' });
      var scope = E('select', { class: 'rt-in' }, [E('option', { value: v, text: 'Cette page seulement (' + v + ')' }), E('option', { value: '*', text: 'Partout sur le site' })]);
      scope.value = r ? pg(r.page) : v;
      kids.push(E('div', { class: 'rt-card' }, [
        E('span', { class: 'rt-lbl', text: 'Texte d’origine' }), E('div', { class: 'rt-orig', text: orig }),
        E('span', { class: 'rt-lbl', text: 'Nouveau texte' }), ta,
        E('span', { class: 'rt-lbl', text: 'En anglais' }), en,
        E('span', { class: 'rt-lbl', text: 'Où' }), scope,
        E('div', { class: 'rt-row' }, [
          E('button', { type: 'button', class: 'rt-b pri', onclick: function () {
            var j = anyT(W.textes, orig); if (j >= 0) W.textes.splice(j, 1);
            if (norm(ta.value) !== orig || norm(en.value)) W.textes.push({ avant: orig, apres: ta.value.trim(), apresEn: en.value.trim(), page: scope.value === '*' ? '' : scope.value });
            live(); say('Aperçu mis à jour');
          } }, ['Appliquer']),
          r ? E('button', { type: 'button', class: 'rt-b dan', onclick: function () { var j = anyT(W.textes, orig); if (j >= 0) W.textes.splice(j, 1); live(); closePanel(); } }, ['Rétablir l’original']) : null
        ])
      ]));
    });
    imgs.forEach(function (im) {
      var orig = normSrc(im.__rtOrig != null && im.getAttribute('src') === im.__rtSet ? im.__rtOrig : im.getAttribute('src'));
      var i = (function () { var k = findT(W.images, orig, v); return k >= 0 ? k : findT(W.images, orig, '*'); })(), r = i >= 0 ? W.images[i] : null;
      var prev = E('img', { class: 'rt-img', src: r ? r.apres : orig, alt: '' });
      var url = E('input', { class: 'rt-in', value: r ? r.apres : '', placeholder: 'assets/… ou adresse d’une image' });
      var scope = E('select', { class: 'rt-in' }, [E('option', { value: v, text: 'Cette page seulement (' + v + ')' }), E('option', { value: '*', text: 'Partout où cette image apparaît' })]);
      scope.value = r ? pg(r.page) : v;
      var apply = function () {
        var k = findT(W.images, orig, scope.value); if (k < 0) k = findT(W.images, orig, scope.value === '*' ? v : '*'); if (k >= 0) W.images.splice(k, 1);
        if (normSrc(url.value) && normSrc(url.value) !== orig) W.images.push({ avant: orig, apres: url.value.trim(), page: scope.value === '*' ? '' : scope.value });
        prev.src = url.value.trim() || orig; live(); say('Aperçu mis à jour');
      };
      var file = E('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: function (ev) {
        var f = ev.target.files && ev.target.files[0]; ev.target.value = ''; if (!f) return;
        var CA = window.CasaAdmin || {};
        if (!CA.uploadFile) { say('Envoi indisponible'); return; }
        if (CA.ensureCss) CA.ensureCss();
        var crop = CA.cropImage ? CA.cropImage(f, { file: f }) : Promise.resolve(f);
        crop.then(function (x) { if (!x) return; up.disabled = true; up.textContent = 'Envoi…'; return CA.uploadFile(x).then(function (u) { url.value = u; up.disabled = false; up.textContent = 'Envoyer une photo'; apply(); }); })
          .catch(function (er) { up.disabled = false; up.textContent = 'Envoyer une photo'; say('Envoi impossible : ' + ((er && er.message) || 'erreur')); });
      } });
      var up = E('button', { type: 'button', class: 'rt-b pri', onclick: function () { file.click(); } }, ['Envoyer une photo']);
      var grid = E('div', { class: 'rt-grid' });
      var lib = E('button', { type: 'button', class: 'rt-b', onclick: function () {
        var A = window.CasaAuth || {}; if (!A.listImages) { say('Bibliothèque indisponible'); return; }
        lib.textContent = 'Chargement…';
        A.listImages('images').then(function (list) {
          lib.textContent = 'Bibliothèque'; grid.textContent = '';
          (list || []).slice(0, 60).forEach(function (x) { grid.appendChild(E('button', { type: 'button', title: x.name, onclick: function () { url.value = x.url; apply(); } }, [E('img', { src: x.url, alt: x.name, loading: 'lazy' })])); });
          if (!(list || []).length) grid.appendChild(E('p', { class: 'rt-note', text: 'Aucune image envoyée pour l’instant.' }));
        }, function () { lib.textContent = 'Bibliothèque'; say('Bibliothèque indisponible'); });
      } }, ['Bibliothèque']);
      kids.push(E('div', { class: 'rt-card' }, [
        E('span', { class: 'rt-lbl', text: 'Image' }), prev,
        E('div', { class: 'rt-orig', text: 'Origine : ' + orig }),
        E('span', { class: 'rt-lbl', text: 'Nouvelle image' }), url,
        E('span', { class: 'rt-lbl', text: 'Où' }), scope,
        E('div', { class: 'rt-row' }, [up, lib, E('button', { type: 'button', class: 'rt-b', onclick: apply }, ['Appliquer l’adresse']), file,
          r ? E('button', { type: 'button', class: 'rt-b dan', onclick: function () { var k = findT(W.images, orig, pg(r.page)); if (k >= 0) W.images.splice(k, 1); live(); closePanel(); } }, ['Rétablir l’original']) : null]),
        grid
      ]));
    });
    panel = E('div', { class: 'rt-ui rt-panel', translate: 'no', role: 'dialog', 'aria-label': 'Retoucher' }, kids);
    document.body.appendChild(panel);
  }

  window.CasaRetouches = { refresh: refresh, start: function () { if (!EN) begin(); }, stop: stop };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
