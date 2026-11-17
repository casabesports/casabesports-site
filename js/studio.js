/*!
 * Casa Besports — CASA STUDIO : le lecteur audio et vidéo du podcast BE+ (page « Le podcast »).
 *  - 4 ambiances par défaut dessinées pour Casa Besports (assets/studio/, droits maîtrisés : voir outils/studio-fonds.html)
 *    Gold Edition, Classic Microphone, Studio Session, Warm Studio ; remplaçables par une image ou une vidéo de l'émission
 *  - lecture/pause, barre de progression, durée, retour 15 s / avance 30 s, volume, vitesse, chapitres, transcription,
 *    sous-titres (vidéo), extraits, partage, liste d'écoute, épisodes similaires
 *  - forme d'onde calculée en direct sur le son quand le navigateur le permet (jamais une animation décorative)
 * Une image (micro, platine) n'est jamais présentée comme une vidéo : sans fichier vidéo, on affiche l'illustration.
 * Ouvert par js/app.js (openStudio). Le son passe par le même lecteur que le mini-lecteur du site : il continue après fermeture.
 */
(function () {
  'use strict';
  var FONDS = {
    'gold-edition': ['Gold Edition', 'Noir et or, pour les émissions premium et les masterclass'],
    'classic-microphone': ['Classic Microphone', 'Noir et blanc, sobre et documentaire'],
    'studio-session': ['Studio Session', 'Le studio d’enregistrement, lumières froides'],
    'warm-studio': ['Warm Studio', 'Chaleureux et intimiste, pour les interviews et les récits']
  };
  var LISTE = 'cb-pod-liste';
  function el(tag, attrs) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else if (k === 'style') e.style.cssText = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v); else e.setAttribute(k, v === true ? '' : v); });
    for (var i = 2; i < arguments.length; i++) (function add(c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(add); return; } e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); })(arguments[i]);
    return e;
  }
  function ls(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function sec(t) { // « 1:02:03 », « 12:30 » ou « 90 » → secondes
    if (t == null || t === '') return null; if (typeof t === 'number') return t;
    var p = String(t).trim().split(':').map(Number); if (p.some(isNaN)) return null;
    return p.reduce(function (a, v) { return a * 60 + v; }, 0);
  }
  function hms(s) { s = Math.max(0, Math.floor(s || 0)); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); }
  function corsOk(u) { try { var x = new URL(u, location.href); return x.origin === location.origin || /\.supabase\.co$/.test(x.hostname); } catch (e) { return false; } }
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function fondDe(ep) { var f = ep.fond && FONDS[ep.fond] ? ep.fond : (ep.cat === 'emission' ? 'studio-session' : 'warm-studio'); return f; }
  function fondUrl(f, paysage) { return 'assets/studio/' + f + '-' + (paysage ? 'paysage' : 'portrait') + '.jpg'; }
  function visible(e) { return e && e.title && e.actif !== false && (!e.publierLe || new Date(e.publierLe) <= new Date()); }

  var st = null;
  function css() {
    if (document.getElementById('cbs-css')) return;
    var s = el('style', { id: 'cbs-css' });
    s.textContent = [
      '#cbs{position:fixed;inset:0;z-index:9997;background:#050505;color:#f4f1ea;font:500 14px/1.45 Mulish,system-ui,sans-serif;display:flex;flex-direction:column;overflow:hidden}',
      '#cbs *{box-sizing:border-box}#cbs button,#cbs select,#cbs input{font:inherit;color:inherit}',
      '#cbs .cbs-bg{position:absolute;inset:0;background:#000 center/cover no-repeat;transform:scale(1.03);transition:background-image .4s}',
      '#cbs .cbs-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.15) 35%,rgba(0,0,0,.82) 72%,rgba(0,0,0,.94) 100%)}',
      '#cbs .cbs-bgv{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
      '#cbs .cbs-top{position:relative;z-index:2;display:flex;align-items:center;gap:.6rem;padding:calc(.7rem + env(safe-area-inset-top,0px)) 1rem .7rem}',
      '#cbs .cbs-brand{font:700 15px/1 "Barlow Condensed",sans-serif;letter-spacing:.14em;text-transform:uppercase;flex:1;display:flex;align-items:center;gap:.5rem}',
      '#cbs .cbs-brand img{height:20px}',
      '#cbs .cbs-ic{border:1px solid rgba(255,255,255,.3);background:rgba(0,0,0,.35);backdrop-filter:blur(6px);border-radius:999px;min-width:40px;height:40px;padding:0 .8rem;cursor:pointer;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:.35rem}',
      '#cbs .cbs-body{position:relative;z-index:2;flex:1;min-height:0;display:flex;gap:1.2rem;padding:0 1rem calc(1rem + env(safe-area-inset-bottom,0px))}',
      '#cbs .cbs-main{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;gap:.6rem;max-width:860px}',
      '#cbs .cbs-video{width:100%;max-height:52vh;background:#000;border-radius:6px;align-self:center}',
      '#cbs .cbs-k{font:700 12px/1.2 "Barlow Condensed",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#f2b33d}',
      '#cbs h2{font:700 clamp(26px,4.4vw,46px)/1.05 "Cormorant Garamond",Georgia,serif;margin:0}',
      '#cbs .cbs-meta{color:rgba(244,241,234,.75);font-size:13.5px}',
      '#cbs .cbs-spons{display:inline-block;border:1px solid #f2b33d;color:#f2b33d;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:.15rem .5rem;border-radius:3px}',
      '#cbs canvas.cbs-wave{width:100%;height:56px;display:block}',
      '#cbs .cbs-prog{display:flex;align-items:center;gap:.6rem;font-variant-numeric:tabular-nums;font-size:12.5px;color:rgba(244,241,234,.8)}',
      '#cbs input[type=range]{accent-color:#f2b33d;cursor:pointer}',
      '#cbs .cbs-prog input{flex:1;height:28px}',
      '#cbs .cbs-ctl{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}',
      '#cbs .cbs-play{width:64px;height:64px;border-radius:50%;border:0;background:#f4f1ea;color:#0b0b0b;cursor:pointer;display:flex;align-items:center;justify-content:center}',
      '#cbs .cbs-vol{display:flex;align-items:center;gap:.3rem}#cbs .cbs-vol input{width:90px}',
      '#cbs select.cbs-ic{appearance:none;-webkit-appearance:none;padding:0 .8rem}#cbs select.cbs-ic option{color:#111}',
      '#cbs .cbs-side{width:360px;flex:none;background:rgba(10,10,10,.62);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.12);border-radius:10px;display:flex;flex-direction:column;min-height:0;align-self:flex-end;max-height:100%}',
      '#cbs .cbs-tabs{display:flex;gap:.2rem;padding:.5rem;border-bottom:1px solid rgba(255,255,255,.1);overflow-x:auto}',
      '#cbs .cbs-tab{border:0;background:transparent;padding:.35rem .6rem;border-radius:5px;cursor:pointer;font-weight:700;font-size:12.5px;color:rgba(244,241,234,.65);white-space:nowrap}',
      '#cbs .cbs-tab[aria-selected=true]{background:rgba(242,179,61,.18);color:#f2b33d}',
      '#cbs .cbs-pane{padding:.7rem .8rem;overflow-y:auto;font-size:13.5px}',
      '#cbs .cbs-li{display:flex;gap:.6rem;align-items:center;width:100%;text-align:left;border:0;background:transparent;padding:.45rem .3rem;border-radius:5px;cursor:pointer}',
      '#cbs .cbs-li:hover,#cbs .cbs-li[aria-current=true]{background:rgba(255,255,255,.08)}',
      '#cbs .cbs-li time{color:#f2b33d;font-variant-numeric:tabular-nums;min-width:48px;font-size:12.5px}',
      '#cbs .cbs-thumb{width:48px;height:48px;flex:none;border-radius:4px;background:#222 center/cover}',
      '#cbs .cbs-note{color:rgba(244,241,234,.6);font-size:12.5px}',
      '#cbs :focus-visible{outline:2px solid #f2b33d;outline-offset:2px}',
      '#cbs .cbs-toast{position:absolute;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#f4f1ea;color:#111;padding:.5rem .9rem;border-radius:8px;font-weight:700;z-index:5}',
      '@media (max-width:899px){#cbs .cbs-body{flex-direction:column;overflow-y:auto;justify-content:flex-end}#cbs .cbs-side{width:auto;max-height:none;align-self:stretch}#cbs .cbs-main{flex:none;min-height:calc(100vh - 140px)}#cbs .cbs-vol{display:none}}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function toast(t) { if (!st) return; var x = el('div', { class: 'cbs-toast', role: 'status' }, t); st.root.appendChild(x); setTimeout(function () { x.remove(); }, 2600); }
  function fermer() {
    if (!st) return; var s = st; st = null;
    cancelAnimationFrame(s.raf); document.removeEventListener('keydown', s.onKey);
    (s.offs || []).forEach(function (f) { f(); });
    if (s.video) { try { s.video.pause(); } catch (e) {} }
    s.root.remove(); document.body.style.overflow = s.ovf || '';
    try { if (s.back && s.back.focus) s.back.focus(); } catch (e) {}
  }
  // ctx : { episodes, audio() → l'élément audio partagé, play(ep) → lance l'audio via le site, stopAudio(), siteUrl }
  function open(ep, ctx, opts) {
    css(); if (st) fermer(); opts = opts || {};
    var root = el('div', { id: 'cbs', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Casa Studio : ' + ep.title });
    st = { root: root, ep: ep, ctx: ctx, ovf: document.body.style.overflow, back: document.activeElement, offs: [], tab: 'desc' };
    st.onKey = function (e) {
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName) && e.key !== 'Escape') return;
      if (e.key === 'Escape') fermer(); else if (e.key === ' ' || e.key === 'k') { e.preventDefault(); bascule(); } else if (e.key === 'ArrowLeft') saut(-5); else if (e.key === 'ArrowRight') saut(5);
    };
    document.addEventListener('keydown', st.onKey); document.body.style.overflow = 'hidden';
    document.body.appendChild(root);
    construire(opts);
  }
  function media() { return st.video || (st.ctx.audio && st.ctx.audio()); }
  function bascule() { var m = media(); if (!m) return; if (st.video) { if (m.paused) m.play().catch(function () {}); else m.pause(); return; } if (!m.getAttribute('src') || st.ctx.currentId() !== st.ep.id) { st.ctx.play(st.ep); return; } if (m.paused) m.play().catch(function () {}); else m.pause(); }
  function saut(d) { var m = media(); if (m && isFinite(m.duration)) m.currentTime = Math.max(0, Math.min(m.duration - .5, m.currentTime + d)); }
  function aller(t, fin) { var m = media(); if (!m) return; st.fin = fin || null; var go = function () { m.currentTime = t; if (m.paused) m.play().catch(function () {}); };
    if (!st.video && st.ctx.currentId() !== st.ep.id) { st.ctx.play(st.ep); var once = function () { m.removeEventListener('loadedmetadata', once); go(); }; m.addEventListener('loadedmetadata', once); } else go(); }

  function construire(opts) {
    var ep = st.ep, ctx = st.ctx, root = st.root, paysage = innerWidth > innerHeight;
    var f = fondDe(ep), bgImg = ep.fondPerso || fondUrl(f, paysage);
    var bg = el('div', { class: 'cbs-bg', style: 'background-image:url("' + String(bgImg).replace(/"/g, '%22') + '")' });
    root.appendChild(bg);
    if (ep.fondVideo && !ep.video) { var bv = el('video', { class: 'cbs-bgv', muted: true, loop: true, playsinline: true, autoplay: true, src: ep.fondVideo, 'aria-hidden': 'true' }); bv.muted = true; bg.appendChild(bv); }
    var credit = !ep.fondPerso && !ep.fondVideo ? 'Ambiance ' + FONDS[f][0] + ' · illustration Casa Besports' : '';
    root.appendChild(el('div', { class: 'cbs-top' }, el('div', { class: 'cbs-brand' }, el('img', { src: 'assets/logo-be.svg', alt: 'BE+' }), 'Casa Studio'),
      el('button', { type: 'button', class: 'cbs-ic', onclick: partager, 'aria-label': 'Partager' }, 'Partager'),
      el('button', { type: 'button', class: 'cbs-ic', onclick: fermer, 'aria-label': 'Fermer le lecteur' }, '✕')));
    var body = el('div', { class: 'cbs-body' }), main = el('div', { class: 'cbs-main' });
    body.appendChild(main); root.appendChild(body);
    // vidéo de l'épisode (si elle existe) : jouée ici, avec sous-titres
    if (ep.video) {
      if (ctx.stopAudio) ctx.stopAudio();
      var v = el('video', { class: 'cbs-video', playsinline: true, preload: 'metadata', poster: ep.img || null, 'aria-label': 'Vidéo : ' + ep.title });
      if (corsOk(ep.video)) v.crossOrigin = 'anonymous';
      v.src = ep.video;
      if (ep.sousTitres) v.appendChild(el('track', { kind: 'subtitles', srclang: 'fr', label: 'Français', src: ep.sousTitres, default: true }));
      v.addEventListener('click', bascule);
      st.video = v; main.appendChild(v);
    }
    main.appendChild(el('div', { class: 'cbs-k' }, [ep.emission || (ep.cat === 'emission' ? 'Le podcast BE+' : 'Réaction d’après-match'), ep.kind].filter(Boolean).join(' · ')));
    main.appendChild(el('h2', {}, ep.title));
    var invite = [ep.invite, ep.inviteRole].filter(Boolean).join(', ') || [ep.nom, ep.club].filter(Boolean).join(' · ');
    if (invite) main.appendChild(el('div', { style: 'font-weight:700' }, (ep.invite ? 'Invité : ' : '') + invite));
    var dt = ep.date ? new Date(ep.date + 'T12:00:00') : null;
    main.appendChild(el('div', { class: 'cbs-meta' }, [dt && !isNaN(dt) ? dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '', ep.duree || ''].filter(Boolean).join(' · ')));
    if (ep.sponsor) main.appendChild(el('div', {}, el('span', { class: 'cbs-spons' }, 'Contenu sponsorisé'), ' ', /^https?:\/\//i.test(ep.sponsorLien || '') ? el('a', { href: ep.sponsorLien, target: '_blank', rel: 'noopener sponsored', style: 'color:inherit' }, 'avec ' + ep.sponsor) : 'avec ' + ep.sponsor));
    // forme d'onde (calculée sur le son) — seulement pour l'audio et quand c'est possible
    var wave = el('canvas', { class: 'cbs-wave', 'aria-hidden': 'true' }); main.appendChild(wave);
    var range = el('input', { type: 'range', min: 0, max: 1000, value: 0, step: 1, 'aria-label': 'Position dans l’épisode' });
    var tCur = el('span', {}, '0:00'), tDur = el('span', {}, ep.duree ? '' : '—');
    main.appendChild(el('div', { class: 'cbs-prog' }, tCur, range, tDur));
    var playB = el('button', { type: 'button', class: 'cbs-play', onclick: bascule, 'aria-label': 'Lecture' });
    var vitesse = el('select', { class: 'cbs-ic', 'aria-label': 'Vitesse de lecture' }, [.75, 1, 1.25, 1.5, 1.75, 2].map(function (r) { return el('option', { value: r, selected: r === 1 ? true : null }, r + '×'); }));
    vitesse.addEventListener('change', function () { var m = media(); if (m) m.playbackRate = Number(vitesse.value); });
    var vol = el('input', { type: 'range', min: 0, max: 1, step: .05, value: 1, 'aria-label': 'Volume' });
    vol.addEventListener('input', function () { var m = media(); if (m) { m.volume = Number(vol.value); m.muted = false; } });
    var muet = el('button', { type: 'button', class: 'cbs-ic', 'aria-label': 'Couper le son', onclick: function () { var m = media(); if (m) { m.muted = !m.muted; muet.textContent = m.muted ? '🔇' : '🔊'; } } }, '🔊');
    var dansListe = function () { return ls(LISTE, []).indexOf(ep.id) >= 0; };
    var listeB = el('button', { type: 'button', class: 'cbs-ic', onclick: function () { var l = ls(LISTE, []); if (dansListe()) l = l.filter(function (x) { return x !== ep.id; }); else l.push(ep.id); lsSet(LISTE, l); listeB.textContent = dansListe() ? '✓ Dans ma liste' : '+ Ma liste'; toast(dansListe() ? 'Ajouté à votre liste d’écoute' : 'Retiré de votre liste'); if (st.tab === 'liste') panneau(); } }, dansListe() ? '✓ Dans ma liste' : '+ Ma liste');
    main.appendChild(el('div', { class: 'cbs-ctl' },
      el('button', { type: 'button', class: 'cbs-ic', onclick: function () { saut(-15); }, 'aria-label': 'Reculer de 15 secondes' }, '↺ 15'), playB,
      el('button', { type: 'button', class: 'cbs-ic', onclick: function () { saut(30); }, 'aria-label': 'Avancer de 30 secondes' }, '30 ↻'),
      vitesse, el('span', { class: 'cbs-vol' }, muet, vol), listeB));
    if (credit) main.appendChild(el('div', { class: 'cbs-note' }, credit));
    if (!ep.audio && !ep.video) main.appendChild(el('div', { class: 'cbs-note' }, 'Le fichier de cet épisode n’est pas encore disponible.'));
    // panneau : description, chapitres, transcription, extraits, liste, similaires
    var side = el('aside', { class: 'cbs-side' }), tabs = el('div', { class: 'cbs-tabs', role: 'tablist' }), pane = el('div', { class: 'cbs-pane', role: 'tabpanel' });
    side.appendChild(tabs); side.appendChild(pane); body.appendChild(side);
    var chap = (Array.isArray(ep.chapitres) ? ep.chapitres : []).map(function (c) { return { t: sec(c.debut), titre: c.titre }; }).filter(function (c) { return c.t != null && c.titre; }).sort(function (a, b) { return a.t - b.t; });
    var ext = (Array.isArray(ep.extraits) ? ep.extraits : []).map(function (c) { return { t: sec(c.debut), fin: sec(c.fin), titre: c.titre }; }).filter(function (c) { return c.t != null && c.titre; });
    var T = [['desc', 'À propos']].concat(chap.length ? [['chap', 'Chapitres']] : [], ep.transcription ? [['trans', 'Transcription']] : [], ext.length ? [['ext', 'Extraits']] : [], [['liste', 'Ma liste'], ['reco', 'À écouter aussi']]);
    function panneau() {
      tabs.innerHTML = ''; pane.innerHTML = '';
      T.forEach(function (t) { tabs.appendChild(el('button', { type: 'button', role: 'tab', class: 'cbs-tab', 'aria-selected': st.tab === t[0] ? 'true' : 'false', onclick: function () { st.tab = t[0]; panneau(); } }, t[1])); });
      var all = (ctx.episodes || []).filter(visible);
      var ligneEp = function (e) { return el('button', { type: 'button', class: 'cbs-li', onclick: function () { var c = st.ctx; fermer(); open(e, c); if (e.audio && !e.video) c.play(e); } }, el('span', { class: 'cbs-thumb', style: 'background-image:url("' + (e.img || fondUrl(fondDe(e), false)) + '")' }), el('span', {}, el('strong', { style: 'display:block' }, e.title), el('span', { class: 'cbs-note' }, [e.emission || e.kind, e.duree].filter(Boolean).join(' · ')))); };
      if (st.tab === 'desc') pane.appendChild(el('div', {}, ep.dek ? el('p', { style: 'margin-top:0' }, ep.dek) : null, ep.description ? ep.description.split(/\n+/).map(function (p) { return el('p', {}, p); }) : null, !ep.dek && !ep.description ? el('p', { class: 'cbs-note' }, 'Pas de description pour cet épisode.') : null));
      else if (st.tab === 'chap') chap.forEach(function (c, i) { var b = el('button', { type: 'button', class: 'cbs-li', 'data-chap': i, onclick: function () { aller(c.t); } }, el('time', {}, hms(c.t)), el('span', {}, c.titre)); pane.appendChild(b); });
      else if (st.tab === 'trans') pane.appendChild(el('div', { style: 'white-space:pre-wrap' }, ep.transcription));
      else if (st.tab === 'ext') ext.forEach(function (c) { pane.appendChild(el('div', { style: 'display:flex;align-items:center;gap:.3rem' }, el('button', { type: 'button', class: 'cbs-li', style: 'flex:1', onclick: function () { aller(c.t, c.fin); } }, el('time', {}, hms(c.t)), el('span', {}, c.titre + (c.fin ? ' (' + hms(c.fin - c.t) + ')' : ''))),
        el('button', { type: 'button', class: 'cbs-ic', 'aria-label': 'Partager cet extrait', onclick: function () { partager(c); } }, '↗'))); });
      else if (st.tab === 'liste') { var ids = ls(LISTE, []), l = ids.map(function (id) { return all.find(function (e) { return e.id === id; }); }).filter(Boolean); if (!l.length) pane.appendChild(el('p', { class: 'cbs-note' }, 'Votre liste d’écoute est vide. Ajoutez un épisode avec « + Ma liste » : il sera lu à la suite.')); l.forEach(function (e) { pane.appendChild(ligneEp(e)); }); }
      else if (st.tab === 'reco') {
        var sim = all.filter(function (e) { return e.id !== ep.id; }).map(function (e) { var sc = 0; if (ep.emission && e.emission === ep.emission) sc += 3; if (ep.club && e.club === ep.club) sc += 2; if (ep.invite && e.invite === ep.invite) sc += 2; if (e.cat === ep.cat) sc += 1; return { e: e, sc: sc }; })
          .sort(function (a, b) { return b.sc - a.sc || String(b.e.date || '').localeCompare(String(a.e.date || '')); }).slice(0, 5);
        if (!sim.length) pane.appendChild(el('p', { class: 'cbs-note' }, 'Les prochains épisodes apparaîtront ici.'));
        sim.forEach(function (x) { pane.appendChild(ligneEp(x.e)); });
      }
    }
    panneau();
    // synchronisation avec le son
    function lie(m) {
      var maj = function () {
        var d = m.duration, c = m.currentTime || 0; tCur.textContent = hms(c); if (isFinite(d) && d > 0) { tDur.textContent = '-' + hms(d - c); if (!st.seeking) range.value = String(Math.round(c / d * 1000)); }
        if (st.fin && c >= st.fin) { m.pause(); st.fin = null; }
        if (chap.length) { var cur = -1; chap.forEach(function (x, i) { if (c >= x.t) cur = i; }); pane.querySelectorAll('[data-chap]').forEach(function (b) { b.setAttribute('aria-current', String(Number(b.getAttribute('data-chap')) === cur)); }); }
      };
      var etat = function () { var on = !m.paused && (st.video || st.ctx.currentId() === st.ep.id); playB.innerHTML = on ? '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>' : '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'; playB.setAttribute('aria-label', on ? 'Pause' : 'Lecture'); };
      var fini = function () { // liste d'écoute : épisode suivant
        if (st.video) return; var ids = ls(LISTE, []), i = ids.indexOf(st.ep.id); if (i < 0 || i === ids.length - 1) return;
        var next = (st.ctx.episodes || []).filter(visible).find(function (e) { return e.id === ids[i + 1]; }); if (next && next.audio) { var c = st.ctx; fermer(); open(next, c); c.play(next); }
      };
      ['timeupdate', 'durationchange', 'loadedmetadata'].forEach(function (k) { m.addEventListener(k, maj); st.offs.push(function () { m.removeEventListener(k, maj); }); });
      ['play', 'pause', 'ended', 'emptied'].forEach(function (k) { m.addEventListener(k, etat); st.offs.push(function () { m.removeEventListener(k, etat); }); });
      m.addEventListener('ended', fini); st.offs.push(function () { m.removeEventListener('ended', fini); });
      range.addEventListener('input', function () { st.seeking = true; if (isFinite(m.duration)) tCur.textContent = hms(Number(range.value) / 1000 * m.duration); });
      range.addEventListener('change', function () { st.seeking = false; if (isFinite(m.duration)) m.currentTime = Number(range.value) / 1000 * m.duration; });
      vitesse.value = String(m.playbackRate || 1); vol.value = String(m.volume == null ? 1 : m.volume);
      maj(); etat(); onde(m);
    }
    var m = media(); if (m) lie(m);
    if (st.video && opts.autoplay !== false) st.video.play().catch(function () {});
    if (opts.t != null) aller(opts.t, opts.fin);
    var f0 = root.querySelector('.cbs-play'); if (f0) f0.focus();
    function onde(m) {
      var c2 = wave.getContext('2d'), an = analyseur(m);
      if (!an) { wave.style.display = 'none'; return; }
      var data = new Uint8Array(an.frequencyBinCount), bars = 64;
      (function frame() {
        if (!st) return; st.raf = requestAnimationFrame(frame);
        var W = wave.clientWidth, H = wave.clientHeight, k = window.devicePixelRatio || 1; if (wave.width !== W * k) { wave.width = W * k; wave.height = H * k; }
        an.getByteFrequencyData(data); c2.setTransform(k, 0, 0, k, 0, 0); c2.clearRect(0, 0, W, H);
        var p = isFinite(m.duration) && m.duration ? m.currentTime / m.duration : 0, bw = W / bars;
        for (var i = 0; i < bars; i++) { var v = data[Math.floor(i * data.length * .7 / bars)] / 255, h = Math.max(2, v * H * .95); c2.fillStyle = i / bars <= p ? '#f2b33d' : 'rgba(244,241,234,.75)'; c2.fillRect(i * bw + bw * .2, (H - h) / 2, bw * .6, h); }
      })();
    }
  }
  // Analyse du son en direct (Web Audio). Désactivée sur iPhone/iPad : le son passerait par le moteur audio
  // et s'arrêterait écran verrouillé. Désactivée aussi pour un fichier d'un autre site sans autorisation (il serait muet).
  var AC = null;
  function analyseur(m) {
    try {
      if (IOS || !(window.AudioContext || window.webkitAudioContext)) return null;
      var src = m.currentSrc || m.getAttribute('src') || '';
      if (m.__cbAn) { if (AC && AC.state === 'suspended') AC.resume(); return m.__cbAn; }
      if (!src || m.crossOrigin !== 'anonymous' || !corsOk(src)) return null;
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      var s = AC.createMediaElementSource(m), a = AC.createAnalyser(); a.fftSize = 256; a.smoothingTimeConstant = .78;
      s.connect(a); a.connect(AC.destination); m.__cbAn = a;
      var rep = function () { if (AC.state === 'suspended') AC.resume(); }; m.addEventListener('play', rep); rep();
      return a;
    } catch (e) { return null; }
  }
  function partager(extrait) {
    var ep = st.ep, base = (st.ctx.siteUrl || location.origin + '/').replace(/[?#].*$/, ''), u = base + (base.slice(-1) === '/' ? '' : '/') + '?ecoute=' + encodeURIComponent(ep.id) + (extrait && extrait.t != null ? '&t=' + Math.round(extrait.t) + (extrait.fin ? '-' + Math.round(extrait.fin) : '') : '');
    var titre = (extrait && extrait.titre ? extrait.titre + ' · ' : '') + ep.title;
    if (navigator.share) { navigator.share({ title: titre, text: titre + ' · Casa Studio', url: u }).catch(function () {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('Lien copié'); }, function () { prompt('Lien de l’épisode :', u); });
  }
  window.CasaStudio = { open: open, fermer: fermer, FONDS: FONDS, fondUrl: fondUrl, fondDe: fondDe, visible: visible, sec: sec };
})();
