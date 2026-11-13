/* Casa Besports · module immersif : compo en réalité augmentée, tableau d'affichage, phare 3D, photo supporter.
   Dépend de THREE (r128). Modes : WebXR immersive-ar (Android/Chrome) → caméra + 3D (iOS/Android) → 3D seule (ordinateur).
   La compo est posée à son VRAI emplacement : photos aériennes IGN autour du stade, bâtiments réels (OpenStreetMap),
   terrain réel le plus proche retrouvé automatiquement, soleil à sa vraie position selon l'heure.
   Lieux modifiables dans contenus/stades.js, règlements dans contenus/reglements.js. */
(function () {
  'use strict';
  var NAVY = '#0f2236', GOLD = '#e8a830', IVORY = '#f6f0e1';
  var FORMATIONS = {
    '4-4-2': [[50, 92], [15, 72], [38, 75], [62, 75], [85, 72], [15, 48], [38, 52], [62, 52], [85, 48], [38, 24], [62, 24]],
    '4-3-3': [[50, 92], [15, 72], [38, 75], [62, 75], [85, 72], [30, 52], [50, 56], [70, 52], [18, 26], [50, 20], [82, 26]],
    '3-5-2': [[50, 92], [28, 75], [50, 77], [72, 75], [10, 50], [32, 54], [50, 58], [68, 54], [90, 50], [38, 24], [62, 24]],
    '4-2-3-1': [[50, 92], [15, 72], [38, 75], [62, 75], [85, 72], [38, 58], [62, 58], [18, 38], [50, 40], [82, 38], [50, 18]]
  };
  var POSTES = { '4-4-2': ['G', 'DG', 'DC', 'DC', 'DD', 'MG', 'MC', 'MC', 'MD', 'BU', 'BU'], '4-3-3': ['G', 'DG', 'DC', 'DC', 'DD', 'MC', 'MDC', 'MC', 'AG', 'BU', 'AD'], '3-5-2': ['G', 'DC', 'DC', 'DC', 'PG', 'MC', 'MDC', 'MC', 'PD', 'BU', 'BU'], '4-2-3-1': ['G', 'DG', 'DC', 'DC', 'DD', 'MDC', 'MDC', 'AG', 'MOC', 'AD', 'BU'] };
  var TEAMS = ['ES Pointe-Hague', 'AS Cherbourg', 'FCEH', 'AS Tourlaville', 'CS Carentan', 'US Côte des Isles', 'Mon équipe'];
  var KITS = [['Marine', '#0f2236', '#e8a830'], ['Vert', '#1f5f3a', '#f6f0e1'], ['Bleu', '#1f4fa0', '#ffffff'], ['Rouge', '#b0202e', '#ffffff'], ['Jaune', '#e8c22a', '#0f2236']];
  var LS = { get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  var st = null; // état de la session en cours

  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'style') e.style.cssText = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
  function btn(label, fn, primary, extra) { return el('button', { type: 'button', class: 'cbar-btn' + (primary ? ' cbar-primary' : ''), onclick: fn, style: extra || '' }, label); }
  function toast(msg) { if (!st) return; var t = el('div', { class: 'cbar-toast', role: 'status' }, msg); st.root.appendChild(t); setTimeout(function () { t.remove(); }, 2400); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // nombre pseudo-aléatoire reproductible (le même stade donne le même public)
  function rng(seed) { var s = seed >>> 0 || 1; return function () { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }

  function injectCss() {
    if (document.getElementById('cbar-css')) return;
    var css = '#cbar{position:fixed;inset:0;z-index:9999;background:#05090f;color:#f6f0e1;font-family:Mulish,system-ui,sans-serif;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}' +
      '#cbar .cbar-top{display:flex;align-items:center;gap:.6rem;padding:.6rem .8rem;background:rgba(5,9,15,.75);backdrop-filter:blur(8px);position:relative;z-index:3}' +
      '#cbar .cbar-title{font-family:"Cormorant Garamond",Georgia,serif;font-weight:700;font-size:22px;flex:1;line-height:1.1}' +
      '#cbar .cbar-stage{position:relative;flex:1;overflow:hidden;touch-action:none;background:linear-gradient(#7fa7cf,#d7e4ee)}' +
      '#cbar video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
      '#cbar canvas.cbar-gl{position:absolute;inset:0;width:100%!important;height:100%!important}' +
      '#cbar .cbar-panel{position:relative;z-index:3;background:rgba(5,9,15,.9);backdrop-filter:blur(10px);padding:.7rem .8rem;max-height:46vh;overflow-y:auto;border-top:1px solid rgba(255,255,255,.12)}' +
      '#cbar .cbar-row{display:flex;gap:.4rem;flex-wrap:wrap;align-items:center;margin-bottom:.5rem}' +
      '#cbar .cbar-btn{min-height:42px;padding:0 .9rem;border-radius:999px;border:1.5px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);color:#f6f0e1;font:700 14px/1 Mulish,sans-serif;cursor:pointer}' +
      '#cbar .cbar-btn[aria-pressed=true],#cbar .cbar-primary{background:#e8a830;border-color:#e8a830;color:#0f2236}' +
      '#cbar .cbar-close{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;font-size:22px;cursor:pointer}' +
      '#cbar select,#cbar input{min-height:40px;border-radius:8px;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#f6f0e1;padding:0 .6rem;font:600 14px Mulish,sans-serif;max-width:100%}' +
      '#cbar select option{color:#0f2236}' +
      '#cbar .cbar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.35rem}' +
      '#cbar .cbar-grid label{display:flex;gap:.35rem;align-items:center;font-size:12px;color:#c9bea7}' +
      '#cbar .cbar-grid input{flex:1;min-width:0;min-height:36px}' +
      '#cbar .cbar-lbl{font:700 11px "Barlow Condensed",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#e8a830;width:100%;margin:.2rem 0 -.1rem}' +
      '#cbar .cbar-hint{position:absolute;left:50%;top:12px;transform:translateX(-50%);background:rgba(5,9,15,.7);padding:.45rem .8rem;border-radius:999px;font-size:13px;z-index:2;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}' +
      '#cbar .cbar-toast{position:absolute;left:50%;bottom:22%;transform:translateX(-50%);background:#e8a830;color:#0f2236;font-weight:800;padding:.6rem 1rem;border-radius:999px;z-index:5}' +
      '#cbar .cbar-place{position:absolute;left:10px;bottom:10px;z-index:2;background:rgba(5,9,15,.74);padding:.4rem .7rem;border-radius:10px;font-size:12.5px;line-height:1.35;max-width:min(70%,420px)}' +
      '#cbar .cbar-place b{color:#e8a830;font-weight:800}' +
      '#cbar .cbar-attr{position:absolute;right:6px;bottom:4px;font-size:10px;color:rgba(255,255,255,.85);text-shadow:0 1px 2px #000;z-index:2;pointer-events:none;max-width:45%;text-align:right;line-height:1.3}' +
      '#cbar .cbar-hub{flex:1;overflow-y:auto;padding:1rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:.8rem;align-content:start}' +
      '#cbar .cbar-card{text-align:left;border:1px solid rgba(255,255,255,.15);background:linear-gradient(140deg,#0f2236,#14304d);border-radius:16px;padding:1.1rem;cursor:pointer;color:#f6f0e1;min-height:150px;display:flex;flex-direction:column;gap:.4rem}' +
      '#cbar .cbar-card b{font-family:"Cormorant Garamond",Georgia,serif;font-size:24px}' +
      '#cbar .cbar-card span{font-size:13.5px;color:#c9d6e3;line-height:1.45}' +
      '#cbar .cbar-card i{font-style:normal;font:700 11px "Barlow Condensed",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#e8a830}' +
      '#cbar .cbar-shot{position:absolute;inset:0;background:rgba(0,0,0,.85);z-index:6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8rem;padding:1rem}' +
      '#cbar .cbar-shot img{max-width:100%;max-height:70vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.6)}' +
      '#cbar .cbar-sheet{position:absolute;inset:0;z-index:6;background:rgba(5,9,15,.94);overflow-y:auto;padding:1rem 1rem 2rem}' +
      '#cbar .cbar-sheet>div{max-width:720px;margin:0 auto}' +
      '#cbar .cbar-sheet h3{font-family:"Cormorant Garamond",Georgia,serif;font-size:30px;margin:.2rem 0 .6rem;line-height:1.1}' +
      '#cbar .cbar-sheet h4{font:700 12px "Barlow Condensed",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#e8a830;margin:1.1rem 0 .4rem}' +
      '#cbar .cbar-sheet ul{margin:0;padding-left:1.1rem;line-height:1.55;font-size:14.5px;color:#dfe7ee}' +
      '#cbar .cbar-sheet li{margin-bottom:.3rem}' +
      '#cbar .cbar-keys{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.4rem}' +
      '#cbar .cbar-keys div{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.5rem .6rem;font-size:13.5px;line-height:1.35}' +
      '#cbar .cbar-keys b{display:block;font:700 11px "Barlow Condensed",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#9fb3c8;margin-bottom:.15rem}' +
      '#cbar .cbar-sheet a{color:#e8a830}' +
      '@media (prefers-reduced-motion:reduce){#cbar *{animation:none!important;transition:none!important}}';
    document.head.appendChild(el('style', { id: 'cbar-css' }, css));
  }

  /* ---------- Scène 3D commune ---------- */
  function setupScene(stage, opts) {
    var THREE = window.THREE;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(stage.clientWidth, stage.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = 'cbar-gl';
    stage.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(opts.real ? 45 : 50, stage.clientWidth / stage.clientHeight, opts.real ? 0.004 : 0.01, opts.real ? 900 : 100);
    if (opts.real) {
      // rendu photo-réaliste : couleurs sRGB, tonalité « cinéma », ombres douces
      renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    } else {
      scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.0));
      var sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(2, 4, 3); scene.add(sun);
    }
    var root = new THREE.Group(); scene.add(root);
    var view = { yaw: opts.yaw || 0, pitch: opts.pitch || 0.9, dist: opts.dist || 1.6 };
    var limits = opts.limits || { dmin: 0.6, dmax: 4, pmin: 0.15, pmax: 1.45 };
    var target = new THREE.Vector3();
    function placeCam() { camera.position.set(target.x + Math.sin(view.yaw) * Math.cos(view.pitch) * view.dist, target.y + Math.sin(view.pitch) * view.dist, target.z + Math.cos(view.yaw) * Math.cos(view.pitch) * view.dist); camera.lookAt(target); }
    placeCam();
    function resize() { var w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    window.addEventListener('resize', resize);
    return { THREE: THREE, renderer: renderer, scene: scene, camera: camera, root: root, view: view, limits: limits, target: target, placeCam: placeCam, resize: resize, real: !!opts.real };
  }
  // rotation par glisser / pincer (hors objets déplaçables) + gyroscope en mode caméra
  function orbitControls(S, stage, isBlocked) {
    var p = {}, pinch = null, Lm = S.limits;
    function clampD(d) { return Math.max(Lm.dmin, Math.min(Lm.dmax, d)); }
    stage.addEventListener('pointerdown', function (e) { if (isBlocked && isBlocked(e)) return; p[e.pointerId] = { x: e.clientX, y: e.clientY }; });
    stage.addEventListener('pointermove', function (e) {
      if (!p[e.pointerId]) return; var ids = Object.keys(p);
      if (ids.length === 2) { var a = p[ids[0]], b = p[ids[1]]; p[e.pointerId] = { x: e.clientX, y: e.clientY }; var d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) S.view.dist = clampD(S.view.dist * pinch / d); pinch = d; S.placeCam(); return; }
      var dx = e.clientX - p[e.pointerId].x, dy = e.clientY - p[e.pointerId].y; p[e.pointerId] = { x: e.clientX, y: e.clientY };
      S.view.yaw -= dx * 0.006; S.view.pitch = Math.max(Lm.pmin, Math.min(Lm.pmax, S.view.pitch + dy * 0.004)); S.placeCam();
    });
    function up(e) { delete p[e.pointerId]; pinch = null; }
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    stage.addEventListener('wheel', function (e) { e.preventDefault(); S.view.dist = clampD(S.view.dist * (e.deltaY > 0 ? 1.08 : 0.92)); S.placeCam(); }, { passive: false });
  }
  function gyro(S) {
    var base = null, Lm = S.limits;
    function on(e) { if (e.beta == null) return; if (!base) base = { b: e.beta, g: e.gamma }; S.view.pitch = Math.max(Lm.pmin, Math.min(Lm.pmax, 0.9 + (e.beta - base.b) * -0.012)); S.view.yaw = (e.gamma - base.g) * 0.012; S.placeCam(); }
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') DeviceOrientationEvent.requestPermission().then(function (r) { if (r === 'granted') window.addEventListener('deviceorientation', on); }).catch(function () {});
      else window.addEventListener('deviceorientation', on);
    } catch (e) {}
    return function () { window.removeEventListener('deviceorientation', on); };
  }
  function startCamera(stage, facing) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('Caméra indisponible'));
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: facing || 'environment' }, audio: false }).then(function (stream) {
      var v = el('video', { playsinline: '', muted: '', autoplay: '' }); v.muted = true; v.srcObject = stream; if (facing === 'user') v.style.transform = 'scaleX(-1)'; stage.insertBefore(v, stage.firstChild);
      st.stream = stream; st.video = v; return v.play().catch(function () {}).then(function () { return v; });
    });
  }
  function texFromCanvas(THREE, c, srgb) { var t = new THREE.CanvasTexture(c); t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
  function labelCanvas(num, name, kit) {
    var c = document.createElement('canvas'); c.width = 256; c.height = 128; var g = c.getContext('2d');
    g.fillStyle = 'rgba(5,9,15,.82)'; roundRect(g, 8, 70, 240, 50, 14); g.fill();
    g.fillStyle = '#f6f0e1'; g.font = '700 28px Mulish, sans-serif'; g.textAlign = 'center'; g.fillText((name || '').slice(0, 14), 128, 106);
    g.fillStyle = kit[1]; g.beginPath(); g.arc(128, 36, 30, 0, Math.PI * 2); g.fill(); g.strokeStyle = kit[2]; g.lineWidth = 5; g.stroke();
    g.fillStyle = kit[2]; g.font = '900 30px Mulish, sans-serif'; g.fillText(String(num), 128, 47);
    return c;
  }
  function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function lerpCol(a, b, t) { var A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); var r = Math.round(((A >> 16) & 255) * (1 - t) + ((B >> 16) & 255) * t), g = Math.round(((A >> 8) & 255) * (1 - t) + ((B >> 8) & 255) * t), bl = Math.round((A & 255) * (1 - t) + (B & 255) * t); return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1); }

  /* ---------- Les disciplines (dimensions réelles en mètres) ---------- */
  // Positions en % : x = largeur, y = longueur (100 = notre but, en bas). Les joueurs se déplacent au doigt.
  // Piste d'athlétisme normalisée : lignes droites 84,39 m, rayon intérieur 36,50 m, 8 couloirs de 1,22 m.
  var TR = { S: 84.39, R: 36.5, LW: 1.22, N: 8 };
  var ATH_LEN = TR.S + 2 * (TR.R + TR.N * TR.LW), ATH_WID = 2 * (TR.R + TR.N * TR.LW);
  function trackXZ(lane, s) {
    var r = TR.R + TR.LW * (lane - 0.5), S = TR.S, L = 2 * S + 2 * Math.PI * r, a; s = ((s % L) + L) % L;
    if (s < Math.PI * r) { a = -s / r; return [r * Math.cos(a), -S / 2 + r * Math.sin(a)]; }
    s -= Math.PI * r; if (s < S) return [-r, -S / 2 + s];
    s -= S; if (s < Math.PI * r) { a = Math.PI - s / r; return [r * Math.cos(a), S / 2 + r * Math.sin(a)]; }
    s -= Math.PI * r; return [r, S / 2 - s];
  }
  function athPct(xz) { return [Math.round((xz[0] / ATH_WID + 0.5) * 1000) / 10, Math.round((xz[1] / ATH_LEN + 0.5) * 1000) / 10]; }
  var ATH_100 = [], ATH_RELAIS = [];
  for (var li = 1; li <= 8; li++) ATH_100.push(athPct([TR.R + TR.LW * (li - 0.5), -TR.S / 2 + 100]));
  for (var ri = 0; ri < 4; ri++) ATH_RELAIS.push(athPct(trackXZ(4, ri * 100)));

  var SPORTS = {
    football: { label: 'Football', len: 105, wid: 68, mg: 4, h: 0.05, kind: 'stade', gk: 0, forms: FORMATIONS, postes: POSTES, def: '4-3-3', ball: 'foot', osm: 'soccer', adapt: true },
    rugby: { label: 'Rugby à XV', len: 120, wid: 70, mg: 3, h: 0.05, kind: 'stade', gk: -1, def: 'XV', ball: 'rugby', osm: 'rugby_union|rugby|rugby_league',
      forms: { 'XV': [[40, 57], [50, 57], [60, 57], [45, 61], [55, 61], [33, 60], [67, 60], [50, 65], [57, 68], [66, 71], [12, 78], [73, 73], [81, 75], [90, 78], [50, 88]] },
      postes: { 'XV': ['Pilier', 'Talonneur', 'Pilier', '2e ligne', '2e ligne', '3e ligne', '3e ligne', 'N° 8', 'Demi de mêlée', 'Ouvreur', 'Ailier', 'Centre', 'Centre', 'Ailier', 'Arrière'] } },
    basket: { label: 'Basketball', len: 28, wid: 15, mg: 2, h: 0.13, kind: 'salle', gk: -1, def: 'Défense', ball: 'basket', osm: 'basketball',
      forms: { 'Défense': [[50, 62], [24, 70], [76, 70], [35, 84], [62, 86]] }, postes: { 'Défense': ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'] } },
    hand: { label: 'Handball', len: 40, wid: 20, mg: 2, h: 0.1, kind: 'salle', gk: 0, def: '6-0', ball: 'hand', osm: 'handball',
      forms: { '6-0': [[50, 96], [10, 84], [28, 79], [43, 77], [57, 77], [72, 79], [90, 84]], '5-1': [[50, 96], [10, 84], [30, 80], [50, 70], [50, 81], [70, 80], [90, 84]] },
      postes: { '6-0': ['Gardien', 'Ailier G', 'Arrière G', 'Demi-centre', 'Pivot', 'Arrière D', 'Ailier D'], '5-1': ['Gardien', 'Ailier G', 'Arrière G', 'Avancé', 'Pivot', 'Arrière D', 'Ailier D'] } },
    volley: { label: 'Volley-ball', len: 18, wid: 9, mg: 3, h: 0.11, kind: 'salle', gk: -1, libero: 5, def: '5-1', ball: 'volley', osm: 'volleyball',
      forms: { '5-1': [[80, 88], [80, 60], [50, 60], [20, 60], [20, 88], [50, 86]] }, postes: { '5-1': ['Passeur', 'Pointu', 'Central', 'Réceptionneur', 'Réceptionneur', 'Libéro'] } },
    waterpolo: { label: 'Water-polo', len: 30, wid: 20, mg: 1.5, h: 0.1, kind: 'piscine', pool: true, gk: 0, def: '3-3', ball: 'wp', osm: 'swimming|water_polo',
      forms: { '3-3': [[50, 95], [15, 76], [35, 72], [50, 66], [65, 72], [85, 76], [50, 84]] }, postes: { '3-3': ['Gardien', 'Ailier G', 'Arrière', 'Pointe', 'Arrière', 'Ailier D', 'Défenseur'] } },
    tennis: { label: 'Tennis', len: 36.57, wid: 18.29, mg: 1.2, h: 0.12, kind: 'tennis', gk: -1, def: 'Simple', ball: 'tennis', osm: 'tennis', fit: 1, ballAt: [60, 83],
      forms: { 'Simple': [[56, 85]], 'Double': [[33, 85], [64, 64]] }, postes: { 'Simple': ['Joueur'], 'Double': ['Fond de court', 'Au filet'] } },
    roller: { label: 'Roller hockey', len: 40, wid: 20, mg: 1.5, h: 0.1, kind: 'salle', rink: true, gk: 0, def: 'Carré', ball: 'palet', osm: 'roller_hockey|inline_hockey|hockey|roller_skating',
      forms: { 'Carré': [[50, 86], [30, 74], [70, 74], [30, 56], [70, 56]], 'Losange': [[50, 86], [50, 76], [22, 64], [78, 64], [50, 54]] },
      postes: { 'Carré': ['Gardien', 'Défenseur G', 'Défenseur D', 'Attaquant G', 'Attaquant D'], 'Losange': ['Gardien', 'Défenseur', 'Ailier G', 'Ailier D', 'Pointe'] } },
    athle: { label: 'Athlétisme', len: ATH_LEN, wid: ATH_WID, mg: 3, h: 0.032, kind: 'stade', track: true, gk: -1, def: '100 m', ball: 'poids', osm: 'athletics', fit: 1, ballAt: athPct([2.5, -TR.S / 2 - TR.R * 0.55]),
      forms: { '100 m': ATH_100, 'Relais 4×100': ATH_RELAIS }, postes: { '100 m': ['Couloir 1', 'Couloir 2', 'Couloir 3', 'Couloir 4', 'Couloir 5', 'Couloir 6', 'Couloir 7', 'Couloir 8'], 'Relais 4×100': ['1er relayeur', '2e relayeur', '3e relayeur', '4e relayeur'] } }
  };
  var SPORT_OF = { 'Football': 'football', 'Rugby': 'rugby', 'Basket': 'basket', 'Basketball': 'basket', 'Handball': 'hand', 'Volley-ball': 'volley', 'Volley': 'volley', 'Water-polo': 'waterpolo',
    'Tennis': 'tennis', 'Roller hockey': 'roller', 'Roller': 'roller', 'Rink hockey': 'roller', 'Athlétisme': 'athle', 'Course à pied': 'athle', 'Fractionné': 'athle' };
  var SKINS = ['#f1c7a5', '#c98f68', '#8d5a3b', '#e5b48c', '#5e3b26', '#f3d2b8', '#b07650'];
  var HAIRS = ['#2b1d14', '#5a3a22', '#111111', '#c49a5a', '#3b2a1e', '#8a5a2b', '#1c1c1c'];
  var TENNIS_SURF = { terre: 'Terre battue', dur: 'Surface dure', gazon: 'Gazon' };

  /* ---------- Textures réalistes des surfaces (dessinées en mètres) ---------- */
  function noise(g, w, h, amp, seed) {
    var R = rng(seed || 7), d = g.getImageData(0, 0, w, h), a = d.data;
    for (var i = 0; i < a.length; i += 4) { var n = (R() - 0.5) * amp; a[i] = Math.max(0, Math.min(255, a[i] + n)); a[i + 1] = Math.max(0, Math.min(255, a[i + 1] + n)); a[i + 2] = Math.max(0, Math.min(255, a[i + 2] + n * 0.8)); }
    g.putImageData(d, 0, 0);
  }
  function blotches(g, w, h, n, cols, seed, size) {
    var R = rng(seed || 3);
    for (var i = 0; i < n; i++) { var x = R() * w, y = R() * h, r = (size || 40) * (0.4 + R()); var gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cols[i % cols.length]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  }
  function grass(g, w, h, k, stripeM, seed) {
    g.fillStyle = '#3d7f35'; g.fillRect(0, 0, w, h);
    var n = Math.max(6, Math.round(h / (stripeM * k)));
    for (var i = 0; i < n; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,240,.07)' : 'rgba(0,30,0,.08)'; g.fillRect(0, i * h / n, w, h / n + 1); }
    blotches(g, w, h, 70, ['rgba(110,140,40,.10)', 'rgba(20,60,20,.12)', 'rgba(150,150,70,.07)'], seed, k * 6);
  }
  // usure de l'herbe : zones de but et rond central plus clairs
  function wear(g, pts, k) { pts.forEach(function (p) { var gr = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], p[2]); gr.addColorStop(0, 'rgba(160,140,80,.28)'); gr.addColorStop(1, 'rgba(160,140,80,0)'); g.fillStyle = gr; g.fillRect(p[0] - p[2], p[1] - p[2], p[2] * 2, p[2] * 2); }); }

  function surfaceCanvas(sp, opt) {
    var Wm = sp.wid + 2 * sp.mg, Hm = sp.len + 2 * sp.mg, k = Math.min(1800 / Hm, 1200 / Wm, 60);
    var c = document.createElement('canvas'); c.width = Math.round(Wm * k); c.height = Math.round(Hm * k); var g = c.getContext('2d'); var w = c.width, h = c.height;
    var W = sp.wid, L = sp.len, id = sp.id;
    function M() { g.setTransform(k, 0, 0, k, sp.mg * k, sp.mg * k); }
    function P() { g.setTransform(1, 0, 0, 1, 0, 0); }
    function line(lw, col) { g.strokeStyle = col || 'rgba(250,250,245,.93)'; g.lineWidth = lw || 0.12; g.setLineDash([]); }
    function hl(y, x0, x1) { g.beginPath(); g.moveTo(x0 == null ? 0 : x0, y); g.lineTo(x1 == null ? W : x1, y); g.stroke(); }
    function vl(x, y0, y1) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
    function circ(x, y, r, a0, a1, fill) { g.beginPath(); g.arc(x, y, r, a0 || 0, a1 == null ? Math.PI * 2 : a1); if (fill) g.fill(); else g.stroke(); }
    if (id === 'athle') {
      var cx = W / 2, cy = L / 2, S = TR.S, R0 = TR.R, R8 = TR.R + TR.N * TR.LW;
      var stadium = function (r) { g.beginPath(); g.moveTo(cx + r, cy - S / 2); g.lineTo(cx + r, cy + S / 2); g.arc(cx, cy + S / 2, r, 0, Math.PI); g.lineTo(cx - r, cy - S / 2); g.arc(cx, cy - S / 2, r, Math.PI, 2 * Math.PI); g.closePath(); };
      g.fillStyle = '#8f9196'; g.fillRect(0, 0, w, h);
      M(); g.fillStyle = '#a8442f'; stadium(R8); g.fill(); g.fillRect(cx + R0, cy + S / 2 - 1, R8 - R0, 20); // ligne droite prolongée pour le 100 m
      P(); noise(g, w, h, 30, 5);
      var gc = document.createElement('canvas'); gc.width = w; gc.height = h; var gg = gc.getContext('2d'); grass(gg, w, h, k, 6, 4); noise(gg, w, h, 16, 9);
      g.save(); M(); stadium(R0); g.clip(); P(); g.drawImage(gc, 0, 0); g.restore();
      M(); line(0.05);
      for (var j = 0; j <= TR.N; j++) { stadium(R0 + j * TR.LW); g.stroke(); }
      for (j = 0; j <= TR.N; j++) vl(cx + R0 + j * TR.LW, cy + S / 2, cy + S / 2 + 19);
      line(0.08); hl(cy - S / 2, cx + R0, cx + R8); hl(cy - S / 2 + 100, cx + R0, cx + R8); // arrivée et départ du 100 m
      g.fillStyle = 'rgba(255,255,255,.9)'; g.font = 'bold 0.9px Arial'; g.textAlign = 'center';
      for (j = 1; j <= TR.N; j++) g.fillText(String(j), cx + R0 + (j - 0.5) * TR.LW, cy - S / 2 + 101.2);
      line(0.1, 'rgba(250,250,245,.8)'); var fw = 64, fl = 100, fx = cx - fw / 2, fy = cy - fl / 2; // terrain de football intérieur
      g.strokeRect(fx, fy, fw, fl); hl(cy, fx, fx + fw); circ(cx, cy, 9.15); g.strokeRect(cx - 20.16, fy, 40.32, 16.5); g.strokeRect(cx - 20.16, fy + fl - 16.5, 40.32, 16.5);
      var tc = [cx, cy - S / 2 - R0 * 0.55]; g.fillStyle = '#b9b2a6'; circ(tc[0], tc[1], 1.07, 0, null, true); line(0.06); circ(tc[0], tc[1], 1.07); // aire de lancer
      g.beginPath(); g.moveTo(tc[0], tc[1]); g.lineTo(tc[0] + Math.sin(0.305) * 20, tc[1] + Math.cos(0.305) * 20); g.moveTo(tc[0], tc[1]); g.lineTo(tc[0] - Math.sin(0.305) * 20, tc[1] + Math.cos(0.305) * 20); g.stroke();
      g.fillStyle = '#d8c79a'; g.fillRect(cx - R0 + 4, cy + S / 2 - 4, 3, 9); g.fillStyle = '#a8442f'; g.fillRect(cx - R0 + 4.9, cy - S / 2 + 6, 1.22, S - 10); // sautoir et piste d'élan
      P();
    } else if (id === 'football' || id === 'rugby') {
      grass(g, w, h, k, 5.25, id.length);
      if (id === 'football') wear(g, [[w / 2, sp.mg * k + 5 * k, 9 * k], [w / 2, h - sp.mg * k - 5 * k, 9 * k], [w / 2, h / 2, 7 * k]], k);
      noise(g, w, h, 9, 11);
      M(); line();
      if (id === 'football') {
        g.strokeRect(0, 0, W, L); hl(L / 2); circ(W / 2, L / 2, 9.15); g.fillStyle = '#fff'; circ(W / 2, L / 2, 0.15, 0, null, true);
        [0, 1].forEach(function (e) {
          var y0 = e ? L : 0, s = e ? -1 : 1;
          g.strokeRect(W / 2 - 20.16, e ? L - 16.5 : 0, 40.32, 16.5); g.strokeRect(W / 2 - 9.16, e ? L - 5.5 : 0, 18.32, 5.5);
          var a = Math.asin(5.5 / 9.15); if (e) circ(W / 2, y0 + s * 11, 9.15, Math.PI + a, 2 * Math.PI - a); else circ(W / 2, y0 + s * 11, 9.15, a, Math.PI - a);
          g.fillStyle = '#fff'; circ(W / 2, y0 + s * 11, 0.15, 0, null, true);
        });
        [[0, 0, 0, Math.PI / 2], [W, 0, Math.PI / 2, Math.PI], [0, L, -Math.PI / 2, 0], [W, L, Math.PI, Math.PI * 1.5]].forEach(function (q) { circ(q[0], q[1], 1, q[2], q[3]); });
      } else if (id === 'rugby') {
        P(); g.fillStyle = 'rgba(0,40,0,.18)'; g.fillRect(0, 0, w, (sp.mg + 10) * k); g.fillRect(0, h - (sp.mg + 10) * k, w, (sp.mg + 10) * k); M(); line();
        g.strokeRect(0, 0, W, L); hl(10); hl(L - 10); hl(32); hl(L - 32); hl(L / 2);
        g.setLineDash([2, 2]); hl(L / 2 - 10); hl(L / 2 + 10); g.setLineDash([1, 2]); hl(15); hl(L - 15); g.setLineDash([]);
        [5, 15, W - 15, W - 5].forEach(function (x) { for (var y = 15; y < L - 15; y += 10) vl(x, y - 0.5, y + 0.5); });
      }
      P();
    } else if (id === 'basket') {
      g.fillStyle = '#17324f'; g.fillRect(0, 0, w, h);
      M(); var R2 = rng(9);
      for (var px = 0; px < W; px += 0.22) for (var py = -R2() * 2; py < L; py += 2.4) { g.fillStyle = lerpCol('#c08a52', '#d8a874', R2()); g.fillRect(px, py, 0.215, 2.38); }
      g.fillStyle = 'rgba(17,40,70,.9)'; g.fillRect(W / 2 - 2.45, 0, 4.9, 5.8); g.fillRect(W / 2 - 2.45, L - 5.8, 4.9, 5.8);
      line(0.05); g.strokeRect(0, 0, W, L); hl(L / 2); circ(W / 2, L / 2, 1.8);
      [0, 1].forEach(function (e) {
        var yb = e ? L - 1.575 : 1.575, a = Math.acos((W / 2 - 0.9) / 6.75);
        g.beginPath(); g.moveTo(0.9, e ? L : 0); g.lineTo(0.9, yb + (e ? -1 : 1) * 6.75 * Math.sin(a));
        if (e) g.arc(W / 2, yb, 6.75, Math.PI + a, 2 * Math.PI - a); else g.arc(W / 2, yb, 6.75, Math.PI - a, a, true);
        g.lineTo(W - 0.9, e ? L : 0); g.stroke();
        g.strokeRect(W / 2 - 2.45, e ? L - 5.8 : 0, 4.9, 5.8); circ(W / 2, e ? L - 5.8 : 5.8, 1.8);
        if (e) circ(W / 2, yb, 1.25, Math.PI, 2 * Math.PI); else circ(W / 2, yb, 1.25, 0, Math.PI);
      });
      P(); noise(g, w, h, 10, 4);
    } else if (id === 'hand') {
      g.fillStyle = '#e57c25'; g.fillRect(0, 0, w, h); M(); g.fillStyle = '#2a68ad'; g.fillRect(0, 0, W, L);
      g.fillStyle = '#e57c25';
      [0, 1].forEach(function (e) { var yb = e ? L : 0, s = e ? -1 : 1; g.beginPath(); g.moveTo(W / 2 - 7.5, yb); g.arc(W / 2 - 1.5, yb, 6, Math.PI, Math.PI / 2 * (e ? 3 : 1), !e); g.lineTo(W / 2 + 1.5, yb + s * 6); g.arc(W / 2 + 1.5, yb, 6, Math.PI / 2 * (e ? 3 : 1), 0, !e); g.closePath(); g.fill(); });
      line(0.05); g.strokeRect(0, 0, W, L); hl(L / 2);
      [0, 1].forEach(function (e) { var yb = e ? L : 0, s = e ? -1 : 1;
        g.beginPath(); g.moveTo(W / 2 - 7.5, yb); g.arc(W / 2 - 1.5, yb, 6, Math.PI, Math.PI / 2 * (e ? 3 : 1), !e); g.lineTo(W / 2 + 1.5, yb + s * 6); g.arc(W / 2 + 1.5, yb, 6, Math.PI / 2 * (e ? 3 : 1), 0, !e); g.stroke();
        g.setLineDash([0.15, 0.15]); g.beginPath(); var a = Math.acos(8.5 / 9); g.arc(W / 2 - 1.5, yb, 9, e ? Math.PI + a : Math.PI - a, Math.PI / 2 * (e ? 3 : 1), !e); g.lineTo(W / 2 + 1.5, yb + s * 9); g.arc(W / 2 + 1.5, yb, 9, Math.PI / 2 * (e ? 3 : 1), e ? 2 * Math.PI - a : a, !e); g.stroke(); g.setLineDash([]);
        hl(yb + s * 7, W / 2 - 0.5, W / 2 + 0.5); hl(yb + s * 4, W / 2 - 0.075, W / 2 + 0.075); });
      P(); noise(g, w, h, 8, 6);
    } else if (id === 'volley') {
      g.fillStyle = '#2f7d5b'; g.fillRect(0, 0, w, h); M(); g.fillStyle = '#e2742c'; g.fillRect(0, 0, W, L);
      line(0.05); g.strokeRect(0, 0, W, L); hl(L / 2); hl(L / 2 - 3); hl(L / 2 + 3);
      [L / 2 - 3, L / 2 + 3].forEach(function (y) { for (var i = 0; i < 5; i++) { hl(y, -0.15 - 0.35 - i * 0.35, -0.15 - i * 0.35 - 0.2); hl(y, W + 0.2 + i * 0.35, W + 0.35 + i * 0.35); } });
      P(); noise(g, w, h, 8, 8);
    } else if (id === 'waterpolo') { // fond du bassin, vu à travers l'eau
      g.fillStyle = '#7cc4e4'; g.fillRect(0, 0, w, h); M();
      g.strokeStyle = 'rgba(40,90,120,.35)'; g.lineWidth = 0.02; for (var tx = -sp.mg; tx < W + sp.mg; tx += 0.25) vl(tx, -sp.mg, L + sp.mg); for (var ty = -sp.mg; ty < L + sp.mg; ty += 0.25) hl(ty, -sp.mg, W + sp.mg);
      g.fillStyle = '#163a66'; [2.5, 7.5, 12.5, 17.5].forEach(function (x) { g.fillRect(x - 0.12, 2, 0.25, L - 4); g.fillRect(x - 0.5, 2, 1, 0.25); g.fillRect(x - 0.5, L - 2.25, 1, 0.25); });
      P(); noise(g, w, h, 8, 12);
    } else if (id === 'tennis') {
      var sf = opt && opt.surface || 'terre';
      var cw = 10.97, cl = 23.77, ox = (W - cw) / 2, oy = (L - cl) / 2;
      if (sf === 'terre') { g.fillStyle = '#c1663e'; g.fillRect(0, 0, w, h); blotches(g, w, h, 90, ['rgba(220,140,90,.18)', 'rgba(120,50,30,.12)'], 21, k * 2); noise(g, w, h, 22, 21); }
      else if (sf === 'gazon') { grass(g, w, h, k, 1.8, 5); wear(g, [[w / 2, (sp.mg + oy) * k, 3 * k], [w / 2, (sp.mg + oy + cl) * k, 3 * k]], k); noise(g, w, h, 14, 5); }
      else { g.fillStyle = '#3c7a5a'; g.fillRect(0, 0, w, h); M(); g.fillStyle = '#2d5f9a'; g.fillRect(ox, oy, cw, cl); P(); noise(g, w, h, 8, 3); }
      M(); line(0.05, sf === 'terre' ? 'rgba(250,248,240,.95)' : 'rgba(255,255,255,.95)');
      g.strokeRect(ox, oy, cw, cl); vl(ox + 1.37, oy, oy + cl); vl(ox + cw - 1.37, oy, oy + cl);
      hl(oy + cl / 2 - 6.4, ox + 1.37, ox + cw - 1.37); hl(oy + cl / 2 + 6.4, ox + 1.37, ox + cw - 1.37); vl(W / 2, oy + cl / 2 - 6.4, oy + cl / 2 + 6.4);
      line(0.1); hl(oy, ox, ox + cw); hl(oy + cl, ox, ox + cw); vl(W / 2, oy, oy + 0.1); vl(W / 2, oy + cl - 0.1, oy + cl);
      P();
    } else if (id === 'roller') {
      g.fillStyle = '#23272e'; g.fillRect(0, 0, w, h); M();
      g.fillStyle = '#3d6f9e'; roundRect(g, 0, 0, W, L, 4); g.fill(); g.save(); roundRect(g, 0, 0, W, L, 4); g.clip();
      g.strokeStyle = 'rgba(10,30,50,.25)'; g.lineWidth = 0.02; for (var gx = 0; gx < W; gx += 0.305) vl(gx, 0, L); for (var gy = 0; gy < L; gy += 0.305) hl(gy, 0, W);
      g.fillStyle = '#c8282e'; g.fillRect(0, L / 2 - 0.15, W, 0.3); g.fillRect(0, 4, W, 0.05); g.fillRect(0, L - 4.05, W, 0.05);
      line(0.06, '#1d3fa0'); circ(W / 2, L / 2, 3); g.fillStyle = '#1d3fa0'; circ(W / 2, L / 2, 0.15, 0, null, true);
      [[W / 2 - 5.5, 9], [W / 2 + 5.5, 9], [W / 2 - 5.5, L - 9], [W / 2 + 5.5, L - 9]].forEach(function (p) { line(0.06, '#c8282e'); circ(p[0], p[1], 3); g.fillStyle = '#c8282e'; circ(p[0], p[1], 0.3, 0, null, true); });
      g.fillStyle = 'rgba(120,180,230,.85)'; circ(W / 2, 4, 1.8, 0, Math.PI, true); circ(W / 2, L - 4, 1.8, Math.PI, 2 * Math.PI, true);
      line(0.05, '#c8282e'); circ(W / 2, 4, 1.8, 0, Math.PI); circ(W / 2, L - 4, 1.8, Math.PI, 2 * Math.PI);
      g.restore(); P(); noise(g, w, h, 8, 14);
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return { canvas: c, Wm: Wm, Hm: Hm };
  }
  // petite texture de relief (grain de l'herbe, du parquet…) répétée sur la surface
  function bumpCanvas(seed) { var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 256, 256); noise(g, 256, 256, 120, seed); return c; }
  function groundCanvas(col, amp, seed) { var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.fillStyle = col; g.fillRect(0, 0, 256, 256); blotches(g, 256, 256, 30, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.05)'], seed, 30); noise(g, 256, 256, amp, seed); return c; }

  /* ---------- Carte réelle : photos aériennes, plans, bâtiments, terrain retrouvé ---------- */
  function IGN(layer, fmt) { return 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=' + layer + '&STYLE=normal&FORMAT=' + fmt + '&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'; }
  var MAPS = {
    photo: { label: 'Vue satellite (photos IGN)', url: IGN('ORTHOIMAGERY.ORTHOPHOTOS', 'image/jpeg'), attr: 'Photos aériennes © IGN – Géoplateforme', alt: 'esri' },
    plan: { label: 'Plan IGN', url: IGN('GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2', 'image/png'), attr: 'Plan IGN v2 © IGN – Géoplateforme', alt: 'osm' },
    osm: { label: 'Plan OpenStreetMap', url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© contributeurs OpenStreetMap' },
    esri: { label: 'Vue satellite (Esri)', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Imagerie © Esri, Maxar, Earthstar Geographics', hidden: true },
    aucune: { label: 'Sans carte (pelouse)' }
  };
  var Z20 = Math.pow(2, 28); // pixels du monde au niveau de zoom 20
  function merc(lat, lon) { var s = Math.sin(lat * Math.PI / 180); return [(lon + 180) / 360 * Z20, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Z20]; }
  function unmerc(X, Y) { var lon = X / Z20 * 360 - 180, n = Math.PI - 2 * Math.PI * Y / Z20; return [180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))), lon]; }
  function m20(lat) { return 156543.03392 * Math.cos(lat * Math.PI / 180) / Math.pow(2, 20); } // mètres par pixel z20

  // OpenStreetMap (Overpass) : deux serveurs publics, résultats gardés en mémoire et sur l'appareil
  var OSM_MEM = {};
  function overpass(q) {
    if (OSM_MEM[q]) return Promise.resolve(OSM_MEM[q]);
    var key = 'cbar-osm-' + hash(q); var cached = null; try { cached = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    if (cached && cached.t > Date.now() - 30 * 864e5) { OSM_MEM[q] = cached.d; return Promise.resolve(cached.d); }
    var urls = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
    function tryAt(i) {
      if (i >= urls.length) return Promise.reject(new Error('osm'));
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 22000);
      return fetch(urls[i], { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctl ? ctl.signal : undefined })
        .then(function (r) { clearTimeout(tm); if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
        .catch(function () { clearTimeout(tm); return tryAt(i + 1); });
    }
    return tryAt(0).then(function (d) { OSM_MEM[q] = d; try { var s = JSON.stringify({ t: Date.now(), d: d }); if (s.length < 900000) localStorage.setItem(key, s); } catch (e) {} return d; });
  }
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
  function wayPoints(el) {
    if (el.geometry) return el.geometry.map(function (p) { return [p.lat, p.lon]; });
    if (el.members) { var best = null; el.members.forEach(function (m) { if (m.geometry && m.role !== 'inner' && (!best || m.geometry.length > best.length)) best = m.geometry; }); return best ? best.map(function (p) { return [p.lat, p.lon]; }) : null; }
    if (el.lat != null) return [[el.lat, el.lon]];
    return null;
  }
  // plus petit rectangle englobant (axe long, dimensions) d'un contour en mètres
  function minRect(pts) {
    if (pts.length < 3) return null;
    var best = null;
    for (var d = 0; d < 180; d += 1) {
      var a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      pts.forEach(function (p) { var u = p[0] * c + p[1] * s, v = -p[0] * s + p[1] * c; if (u < x0) x0 = u; if (u > x1) x1 = u; if (v < y0) y0 = v; if (v > y1) y1 = v; });
      var A = (x1 - x0) * (y1 - y0);
      if (!best || A < best.A) { var cu = (x0 + x1) / 2, cv = (y0 + y1) / 2; best = { A: A, a: a, du: x1 - x0, dv: y1 - y0, cx: cu * c - cv * s, cz: cu * s + cv * c }; }
    }
    // axe long : direction (dx, dz) dans le repère est / sud
    var along = best.du >= best.dv ? best.a : best.a + Math.PI / 2;
    var dx = Math.cos(along), dz = Math.sin(along);
    var bearing = Math.atan2(dx, -dz); if (bearing < 0) bearing += Math.PI; if (bearing >= Math.PI) bearing -= Math.PI;
    return { cx: best.cx, cz: best.cz, len: Math.max(best.du, best.dv), wid: Math.min(best.du, best.dv), bearing: bearing };
  }
  // retrouve le terrain (ou la salle, la piscine, la piste) réel le plus proche du lieu choisi
  function findVenue(sp, place) {
    var lat = place.lat, lon = place.lon, R = place.rayon || 6000;
    var tags = sp.osm, kind = sp.kind;
    var q = '[out:json][timeout:20];(' +
      'nwr["sport"~"(^|;)(' + tags + ')($|;)"](around:' + R + ',' + lat + ',' + lon + ');' +
      (kind === 'piscine' ? 'nwr["leisure"="sports_centre"]["sport"~"swimming"](around:' + R + ',' + lat + ',' + lon + ');way["leisure"="swimming_pool"]["indoor"="yes"](around:' + R + ',' + lat + ',' + lon + ');' : '') +
      (kind === 'salle' ? 'way["building"="sports_hall"](around:' + R + ',' + lat + ',' + lon + ');way["leisure"="sports_hall"](around:' + R + ',' + lat + ',' + lon + ');way["leisure"="sports_centre"]["building"](around:' + R + ',' + lat + ',' + lon + ');' : '') +
      (kind === 'stade' && sp.track ? 'way["leisure"="track"](around:' + R + ',' + lat + ',' + lon + ');' : '') +
      ');out geom tags;';
    var X0 = merc(lat, lon), m = m20(lat), re = place.cherche ? new RegExp(place.cherche, 'i') : null;
    return overpass(q).then(function (d) {
      var best = null;
      (d.elements || []).forEach(function (el) {
        var t = el.tags || {}, pts = wayPoints(el); if (!pts || pts.length < 4) return;
        var P = pts.map(function (p) { var X = merc(p[0], p[1]); return [(X[0] - X0[0]) * m, (X[1] - X0[1]) * m]; });
        var r = minRect(P); if (!r) return;
        var sportOk = new RegExp('(^|;)(' + tags + ')($|;)').test(t.sport || ''), indoor = !!t.building || t.indoor === 'yes' || t.covered === 'yes' || t.leisure === 'sports_hall' || t.leisure === 'sports_centre';
        var score = Math.hypot(r.cx, r.cz);
        if (kind === 'stade' || kind === 'tennis') {
          if (t.building) return;
          if (kind === 'tennis' && (r.len < 18 || r.len > 45)) return;
          if (sp.id === 'football' && (r.len < 75 || r.len > 140 || r.wid < 40)) return;
          if (sp.id === 'rugby' && (r.len < 80 || r.len > 160)) return;
          if (sp.track && (r.len < 130 || r.len > 210)) return;
          if (!sportOk) score += 2500;
          if (t.leisure !== 'pitch' && t.leisure !== 'track') score += 400;
        } else {
          if (r.len < 14 || r.len > 140) return;
          if (!indoor) score += 3000; if (!sportOk) score += 900;
          if (kind === 'piscine' && !/swimming|water_polo/.test(t.sport || '') && t.leisure !== 'swimming_pool') return;
        }
        if (re && re.test(t.name || '')) score -= 50000;
        if (!best || score < best.score) best = { score: score, r: r, tags: t, id: el.type + '/' + el.id };
      });
      if (!best) return null;
      var c = unmerc(X0[0] + best.r.cx / m, X0[1] + best.r.cz / m);
      return { lat: c[0], lon: c[1], bearing: best.r.bearing, len: best.r.len, wid: best.r.wid, name: best.tags.name || '', osm: best.id, tags: best.tags };
    });
  }
  // bâtiments réels autour du stade (OpenStreetMap), extrudés à leur hauteur
  function fetchBuildings(lat, lon, R) {
    var q = '[out:json][timeout:25];(way["building"](around:' + Math.round(R) + ',' + lat.toFixed(5) + ',' + lon.toFixed(5) + '););out geom tags;';
    return overpass(q).then(function (d) { return d.elements || []; });
  }
  function buildingHeight(t, R) {
    if (t.height && parseFloat(t.height)) return parseFloat(t.height);
    if (t['building:levels'] && parseFloat(t['building:levels'])) return parseFloat(t['building:levels']) * 3 + 1.2;
    var b = t.building;
    return { garage: 2.8, garages: 2.8, shed: 2.6, roof: 4, hut: 2.6, house: 6.5 + R() * 2, detached: 7, semidetached_house: 7, terrace: 8, apartments: 15 + R() * 6, residential: 9 + R() * 4, commercial: 10, retail: 7, industrial: 9, warehouse: 9, church: 16, school: 10, sports_hall: 10, grandstand: 7, stadium: 12, hangar: 10, farm_auxiliary: 6, barn: 7, service: 4 }[b] || 7 + R() * 2;
  }

  /* ---------- Position réelle du soleil (heure, latitude, longitude) ---------- */
  function sunPosition(date, lat, lon) {
    var rad = Math.PI / 180, d = (date.getTime() - 946728000000) / 864e5;
    var g = (357.529 + 0.98560028 * d) * rad, q = 280.459 + 0.98564736 * d;
    var L = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad, e = (23.439 - 0.00000036 * d) * rad;
    var ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)), dec = Math.asin(Math.sin(e) * Math.sin(L));
    var gmst = (18.697374558 + 24.06570982441908 * d) % 24, H = ((gmst * 15 + lon) * rad) - ra, phi = lat * rad;
    var alt = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
    var az = Math.atan2(-Math.sin(H) * Math.cos(dec), Math.sin(dec) * Math.cos(phi) - Math.cos(dec) * Math.sin(phi) * Math.cos(H));
    return { alt: alt, az: (az + 2 * Math.PI) % (2 * Math.PI) };
  }

  /* ---------- Mosaïque de tuiles cartographiques ---------- */
  function tileUrl(tpl, z, x, y) { return tpl.replace('{z}', z).replace('{x}', x).replace('{y}', y); }
  function mosaic(mapId, z, Xc, Yc, N, lat, onTile) {
    var def = MAPS[mapId], alt = def.alt && MAPS[def.alt], sc = Math.pow(2, 20 - z), px = Xc / sc, py = Yc / sc;
    var tx0 = Math.floor(px / 256) - (N - 1) / 2, ty0 = Math.floor(py / 256) - (N - 1) / 2;
    var c = document.createElement('canvas'); c.width = c.height = N * 256; var g = c.getContext('2d');
    g.fillStyle = '#6f7d60'; g.fillRect(0, 0, c.width, c.height); noise(g, c.width, c.height, 10, z);
    var mpp = m20(lat) * sc, info = { canvas: c, size: N * 256 * mpp, ox: ((tx0 * 256 + N * 128) - px) * mpp, oz: ((ty0 * 256 + N * 128) - py) * mpp, usedAlt: false, ok: 0, ko: 0 };
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) (function (i, j) {
      var img = new Image(); img.crossOrigin = 'anonymous'; var triedAlt = false;
      img.onload = function () { g.drawImage(img, i * 256, j * 256, 256, 256); info.ok++; onTile && onTile(info); };
      img.onerror = function () { if (alt && !triedAlt) { triedAlt = true; info.usedAlt = true; img.src = tileUrl(alt.url, z, tx0 + i, ty0 + j); } else { info.ko++; onTile && onTile(info); } };
      img.src = tileUrl(def.url, z, tx0 + i, ty0 + j);
    })(i, j);
    return info;
  }
  function fadeCanvas(inner) { var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); var gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, '#fff'); gr.addColorStop(inner, '#fff'); gr.addColorStop(1, '#000'); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return c; }

  /* ---------- Briques 3D (en mètres réels) ---------- */
  function Kit(THREE) {
    function col(c) { return new THREE.Color(c).convertSRGBToLinear(); }
    function M(c, o) { return new THREE.MeshStandardMaterial(Object.assign({ color: col(c), roughness: 0.82, metalness: 0 }, o || {})); }
    function sh(m) { m.castShadow = true; m.receiveShadow = true; return m; }
    function box(p, w, h, d, mat, x, y, z) { var m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x || 0, y || 0, z || 0); if (p) p.add(m); return m; }
    function cyl(p, rt, rb, h, mat, x, y, z, seg) { var m = sh(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), mat)); m.position.set(x || 0, y || 0, z || 0); if (p) p.add(m); return m; }
    // tube entre deux points
    function bar(p, a, b, r, mat) { var A = new THREE.Vector3().fromArray(a), B = new THREE.Vector3().fromArray(b), d = B.clone().sub(A); var m = cyl(p, r, r, d.length(), mat, 0, 0, 0, 8); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; }
    var netTex = null;
    function netMat(rep, colr) {
      if (!netTex) { var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'); g.strokeStyle = '#fff'; g.lineWidth = 3; g.strokeRect(0, 0, 64, 64); netTex = c; }
      var t = new THREE.CanvasTexture(netTex); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
      return new THREE.MeshStandardMaterial({ color: col(colr || '#f2f2f2'), map: t, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.9 });
    }
    function plane(p, w, h, mat, x, y, z, rx, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x || 0, y || 0, z || 0); if (rx) m.rotation.x = rx; if (ry) m.rotation.y = ry; m.receiveShadow = true; if (p) p.add(m); return m; }
    function textCanvas(txt, bg, fg, w, h, font) { var c = document.createElement('canvas'); c.width = w || 1024; c.height = h || 128; var g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.fillStyle = fg; g.font = font || ('900 ' + Math.round(c.height * 0.62) + 'px Mulish, Arial, sans-serif'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, c.width / 2, c.height / 2 + 2); return c; }
    function tex(c, rep) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
    // public et sièges en « instances » (des milliers d'objets pour le prix d'un)
    function people(p, list, seed, noShadow) {
      if (!list.length) return;
      var R = rng(seed || 1), dummy = new THREE.Object3D(), n = list.length;
      var torsoG = new THREE.BoxGeometry(0.44, 0.56, 0.28), headG = new THREE.SphereGeometry(0.115, 10, 8), legG = new THREE.BoxGeometry(0.34, 0.85, 0.22);
      var torso = new THREE.InstancedMesh(torsoG, M('#ffffff', { roughness: 0.9 }), n), head = new THREE.InstancedMesh(headG, M('#ffffff', { roughness: 0.7 }), n);
      var standing = list.filter(function (q) { return q.stand; }), legs = standing.length ? new THREE.InstancedMesh(legG, M('#ffffff', { roughness: 0.9 }), standing.length) : null;
      var cloth = ['#0f2236', '#e8a830', '#f6f0e1', '#b0202e', '#1f5f3a', '#1f4fa0', '#ffffff', '#333a44', '#d9d2c3', '#5b6b7c', '#8a2a3a', '#2a2a2a', '#c9c9c9'], skins = SKINS, li = 0, c = new THREE.Color();
      list.forEach(function (q, i) {
        var y0 = q.stand ? q.y + 0.85 : q.y + 0.08;
        dummy.position.set(q.x, y0 + 0.28, q.z); dummy.rotation.set(0, q.ry || 0, 0); dummy.scale.setScalar(0.9 + R() * 0.2); dummy.updateMatrix(); torso.setMatrixAt(i, dummy.matrix);
        c.set(cloth[Math.floor(R() * cloth.length)]).convertSRGBToLinear(); torso.setColorAt(i, c);
        dummy.position.set(q.x + (R() - 0.5) * 0.04, y0 + 0.68, q.z); dummy.updateMatrix(); head.setMatrixAt(i, dummy.matrix);
        c.set(skins[Math.floor(R() * skins.length)]).convertSRGBToLinear(); head.setColorAt(i, c);
        if (q.stand) { dummy.position.set(q.x, q.y + 0.43, q.z); dummy.updateMatrix(); legs.setMatrixAt(li, dummy.matrix); c.set(R() < 0.6 ? '#2b3240' : '#5a5a5a').convertSRGBToLinear(); legs.setColorAt(li, c); li++; }
      });
      [torso, head, legs].forEach(function (m) { if (m) { m.castShadow = !noShadow; m.receiveShadow = !noShadow; p.add(m); } });
    }
    function seats(p, list, colA, colB) {
      if (!list.length) return;
      var dummy = new THREE.Object3D(), seat = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.1, 0.4), M('#ffffff', { roughness: 0.55 }), list.length), back = new THREE.InstancedMesh(new THREE.BoxGeometry(0.44, 0.38, 0.06), M('#ffffff', { roughness: 0.55 }), list.length), c = new THREE.Color();
      list.forEach(function (q, i) {
        var s = Math.sin(q.ry || 0), co = Math.cos(q.ry || 0);
        dummy.rotation.set(0, q.ry || 0, 0);
        dummy.position.set(q.x, q.y + 0.42, q.z); dummy.updateMatrix(); seat.setMatrixAt(i, dummy.matrix);
        dummy.position.set(q.x + s * 0.2, q.y + 0.66, q.z + co * 0.2); dummy.updateMatrix(); back.setMatrixAt(i, dummy.matrix);
        c.set(q.alt ? colB : colA).convertSRGBToLinear(); seat.setColorAt(i, c); back.setColorAt(i, c);
      });
      seat.receiveShadow = back.receiveShadow = true; seat.castShadow = back.castShadow = true; p.add(seat); p.add(back);
    }
    return { THREE: THREE, col: col, M: M, sh: sh, box: box, cyl: cyl, bar: bar, netMat: netMat, plane: plane, textCanvas: textCanvas, tex: tex, people: people, seats: seats };
  }

  /* ----- une tribune : avant à z = 0, gradins vers +z, public tourné vers -z ----- */
  function stand(K, parent, o) {
    var THREE = K.THREE, g = new THREE.Group(); parent.add(g);
    var len = o.len, rows = o.rows, dz = o.depth || 0.8, rise = o.rise || 0.4, base = o.base == null ? 1.1 : o.base, R = rng(o.seed || 5);
    var concrete = K.M('#b3b1aa', { roughness: 0.95, map: K.tex(groundCanvas('#b3b1aa', 26, 3), [len / 4, 1]) });
    K.box(g, len, base, 0.3, concrete, 0, base / 2, 0.15);
    var seatL = [], ppl = [], lite = len * rows > 520, maxP = lite ? 650 : 1e9, pf = o.fill == null ? 0.35 : o.fill;
    if (lite) pf = Math.min(pf, maxP / (len / 0.52 * rows));
    var seatTex = null;
    if (lite) { // grandes tribunes : rangées de sièges dessinées (beaucoup plus léger pour le téléphone)
      var scv = document.createElement('canvas'); scv.width = 64; scv.height = 32; var sg = scv.getContext('2d'); sg.fillStyle = '#9d9b95'; sg.fillRect(0, 0, 64, 32); sg.fillStyle = o.seatA || NAVY; roundRect(sg, 4, 2, 56, 26, 6); sg.fill(); sg.fillStyle = 'rgba(255,255,255,.12)'; sg.fillRect(8, 4, 48, 5);
      seatTex = K.tex(scv, [len / 0.52, 1]);
    }
    for (var i = 0; i < rows; i++) {
      var top = base + rise * (i + 1), zc = 0.3 + dz * (i + 0.5);
      K.box(g, len, top, dz, concrete, 0, top / 2, zc);
      if (lite) { var strip = K.box(g, len - 0.6, 0.42, 0.42, new THREE.MeshStandardMaterial({ map: seatTex, roughness: 0.6 }), 0, top + 0.21, zc + 0.12); strip.castShadow = false; }
      for (var x = -len / 2 + 0.6; x < len / 2 - 0.4; x += 0.52) {
        if (o.aisle && Math.abs(((x + len / 2) % o.aisle) - o.aisle / 2) < 0.6) continue;
        if (!lite) seatL.push({ x: x, y: top, z: zc - 0.05, ry: 0, alt: o.pattern ? o.pattern(x, i) : false });
        if (R() < pf) ppl.push({ x: x, y: top + 0.32, z: zc - 0.02, ry: 0 });
      }
    }
    var D = 0.3 + dz * rows, H = base + rise * rows;
    K.seats(g, seatL, o.seatA || NAVY, o.seatB || GOLD); K.people(g, ppl, o.seed, lite);
    // murs de fond et joues latérales
    var wall = K.M(o.wall || '#d9d7d0', { roughness: 0.9 });
    K.box(g, len + 0.6, H + 2.6, 0.3, wall, 0, (H + 2.6) / 2, D + 0.15);
    var prof = new THREE.Shape(); prof.moveTo(0, 0); prof.lineTo(D + 0.3, 0); prof.lineTo(D + 0.3, H + 2.6); prof.lineTo(0, base + 0.9); prof.closePath();
    [-1, 1].forEach(function (s) { var cheek = K.sh(new THREE.Mesh(new THREE.ExtrudeGeometry(prof, { depth: 0.3, bevelEnabled: false }), wall)); cheek.rotation.y = -Math.PI / 2; cheek.position.set(s * (len / 2 + 0.15) + (s > 0 ? 0.15 : 0.15), 0, 0); g.add(cheek); });
    if (o.roof) {
      var rh = H + 3.4, steel = K.M('#e4e6e8', { roughness: 0.45, metalness: 0.35 }), dark = K.M('#3a4048', { roughness: 0.6, metalness: 0.3 });
      for (var cx = -len / 2 + 0.4; cx <= len / 2 - 0.3; cx += Math.max(6, len / Math.round(len / 9))) { K.cyl(g, 0.16, 0.18, rh, steel, cx, rh / 2, D + 0.05); K.bar(g, [cx, rh - 0.2, D + 0.05], [cx, rh + 0.35, 0.6], 0.09, steel); }
      var roof = K.box(g, len + 1, 0.22, D + 1.6, steel, 0, rh + 0.2, D / 2 - 0.4); roof.rotation.x = 0.06;
      K.box(g, len + 1, 0.05, D + 1.5, dark, 0, rh + 0.06, D / 2 - 0.4).rotation.x = 0.06;
      var fascia = K.box(g, len + 1, 0.8, 0.12, [steel, steel, steel, steel, new THREE.MeshStandardMaterial({ map: K.tex(K.textCanvas(o.title || 'CASA BESPORTS', NAVY, GOLD, 2048, 128)), roughness: 0.6 }), steel], 0, rh + 0.1, -1.25);
      fascia.rotation.y = Math.PI;
    }
    g.userData.depth = D + 0.3; g.userData.height = H;
    return g;
  }
  function mast(K, parent, x, z, h, tx, tz, lamps) {
    var THREE = K.THREE, steel = K.M('#aeb4ba', { roughness: 0.5, metalness: 0.55 });
    K.cyl(parent, 0.22, 0.42, h, steel, x, h / 2, z, 10);
    var head = new THREE.Group(); head.position.set(x, h + 0.9, z); parent.add(head);
    var frame = K.box(head, 4.2, 2.4, 0.25, steel, 0, 0, 0);
    var lampM = new THREE.MeshStandardMaterial({ color: K.col('#fffbe8'), emissive: K.col('#fff3cf'), emissiveIntensity: 0.15, roughness: 0.3 }); lamps.push(lampM);
    for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) K.box(head, 0.8, 0.6, 0.18, lampM, -1.5 + i, -0.75 + j * 0.75, 0.2);
    head.lookAt(tx, 0, tz);
    return head;
  }
  function railing(K, parent, hw, hl, h) {
    var THREE = K.THREE, mat = K.M('#d7dce0', { roughness: 0.4, metalness: 0.6 }), pts = [], dummy = new THREE.Object3D();
    for (var x = -hw; x <= hw + 0.01; x += 2.5) { pts.push([x, -hl]); pts.push([x, hl]); }
    for (var z = -hl + 2.5; z < hl - 0.01; z += 2.5) { pts.push([-hw, z]); pts.push([hw, z]); }
    var posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, h, 6), mat, pts.length);
    pts.forEach(function (p, i) { dummy.position.set(p[0], h / 2, p[1]); dummy.updateMatrix(); posts.setMatrixAt(i, dummy.matrix); }); posts.castShadow = true; parent.add(posts);
    [[0, -hl, hw * 2, 0], [0, hl, hw * 2, 0], [-hw, 0, hl * 2, 1], [hw, 0, hl * 2, 1]].forEach(function (r) { var b = K.box(parent, r[3] ? 0.06 : r[2], 0.06, r[3] ? r[2] : 0.06, mat, r[0], h, r[1]); b.receiveShadow = false; });
  }
  function adBoards(K, parent, hw, hl, h, sides) {
    var THREE = K.THREE, c = document.createElement('canvas'); c.width = 1024; c.height = 64; var g = c.getContext('2d');
    for (var i = 0; i < 4; i++) { g.fillStyle = i % 2 ? NAVY : '#000000'; g.fillRect(i * 256, 0, 256, 64); g.fillStyle = i % 2 ? GOLD : '#ffffff'; g.font = '900 34px Mulish, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(i % 2 ? 'OlistO' : 'CASA BESPORTS +', i * 256 + 128, 44); }
    var dark = K.M('#16191d');
    (sides || [[0, -hl, hw * 2, 0], [0, hl, hw * 2, Math.PI], [-hw, 0, hl * 2, Math.PI / 2], [hw, 0, hl * 2, -Math.PI / 2]]).forEach(function (b) {
      var t = K.tex(c, [Math.max(1, Math.round(b[2] / 12)), 1]); t.wrapT = THREE.ClampToEdgeWrapping;
      var face = new THREE.MeshStandardMaterial({ map: t, emissive: K.col('#ffffff'), emissiveMap: t, emissiveIntensity: 0.35, roughness: 0.5 });
      var m = K.box(parent, b[2], h, 0.12, [dark, dark, dark, dark, face, dark], b[0], h / 2, b[1]); m.rotation.y = b[3];
    });
  }
  function dugout(K, parent, x, z, ry) {
    var THREE = K.THREE, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    var glass = new THREE.MeshStandardMaterial({ color: K.col('#cfe3ee'), transparent: true, opacity: 0.32, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide });
    var frame = K.M('#2b3036', { metalness: 0.4, roughness: 0.5 });
    var shell = K.box(g, 6, 2.1, 1.5, glass, 0, 1.05, 0); shell.castShadow = false;
    K.box(g, 6.1, 0.08, 1.6, frame, 0, 2.12, 0); K.box(g, 5.6, 0.45, 0.45, K.M(NAVY), 0, 0.45, 0.45);
    for (var i = 0; i < 9; i++) K.box(g, 0.45, 0.12, 0.45, K.M(GOLD, { roughness: 0.5 }), -2.4 + i * 0.6, 0.72, 0.45);
  }
  // un but (football, hand, roller, water-polo) : ligne de but en z, filet vers l'extérieur (dir = ±1)
  function goal(K, parent, o) {
    var THREE = K.THREE, g = new THREE.Group(); g.position.set(0, o.y || 0, o.z); parent.add(g);
    var w = o.w, h = o.h, r = o.r || 0.06, d0 = o.d0 || 1.0, d1 = o.d1 || 2.0, s = o.dir;
    var mat = o.stripe ? new THREE.MeshStandardMaterial({ map: K.tex(stripeCanvas(o.col || '#ffffff', o.stripe), [1, 1]), roughness: 0.4 }) : K.M(o.col || '#ffffff', { roughness: 0.35, metalness: o.metal ? 0.3 : 0 });
    var post = o.square ? function (x) { var m = K.box(g, r * 2, h + r, r * 2, mat, x, (h + r) / 2, 0); if (o.stripe) { m.material = mat.clone(); m.material.map = mat.map.clone(); m.material.map.repeat.set(1, (h + r) / 0.2 / 2); m.material.map.needsUpdate = true; } } : function (x) { K.cyl(g, r, r, h + r, mat, x, (h + r) / 2, 0, 12); };
    post(-w / 2 - r); post(w / 2 + r);
    if (o.square) { var cb = K.box(g, w + 4 * r, r * 2, r * 2, mat, 0, h + r, 0); if (o.stripe) { cb.material = mat.clone(); cb.material.map = mat.map.clone(); cb.material.map.rotation = Math.PI / 2; cb.material.map.repeat.set(1, (w + 4 * r) / 0.2 / 2); cb.material.map.needsUpdate = true; } }
    else { var bar = K.cyl(g, r, r, w + 4 * r, mat, 0, h + r, 0, 12); bar.rotation.z = Math.PI / 2; }
    var net = K.netMat([w / 0.12, h / 0.12], o.netCol), nets = new THREE.Group(); g.add(nets);
    var back = new THREE.Mesh(new THREE.PlaneGeometry(w, Math.hypot(h, d1 - d0)), net); back.position.set(0, h / 2, s * (d0 + d1) / 2); back.rotation.x = -s * Math.atan2(d1 - d0, h); nets.add(back);
    var top = new THREE.Mesh(new THREE.PlaneGeometry(w, d0), K.netMat([w / 0.12, d0 / 0.12], o.netCol)); top.rotation.x = -Math.PI / 2; top.position.set(0, h, s * d0 / 2); nets.add(top);
    var side = new THREE.Shape(); side.moveTo(0, 0); side.lineTo(d1, 0); side.lineTo(d0, h); side.lineTo(0, h); side.closePath();
    [-1, 1].forEach(function (k) { var m = new THREE.Mesh(new THREE.ShapeGeometry(side), K.netMat([d1 / 0.12, h / 0.12], o.netCol)); m.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; m.position.set(k * w / 2, 0, 0); nets.add(m); });
    // support arrière
    var sup = K.M('#d0d4d8', { metalness: 0.5, roughness: 0.4 }); K.bar(g, [-w / 2, 0.02, s * d1], [w / 2, 0.02, s * d1], 0.025, sup);
    return g;
  }
  function stripeCanvas(c1, c2) { var c = document.createElement('canvas'); c.width = 8; c.height = 64; var g = c.getContext('2d'); g.fillStyle = c1; g.fillRect(0, 0, 8, 32); g.fillStyle = c2; g.fillRect(0, 32, 8, 32); return c; }
  function rugbyPosts(K, parent, z, padCol) {
    var white = K.M('#ffffff', { roughness: 0.35 }), pad = K.M(padCol, { roughness: 0.8 });
    [-2.8, 2.8].forEach(function (x) { K.cyl(parent, 0.08, 0.1, 13, white, x, 6.5, z); K.box(parent, 0.65, 2, 0.65, pad, x, 1, z); });
    var cb = K.cyl(parent, 0.07, 0.07, 5.6, white, 0, 3, z); cb.rotation.z = Math.PI / 2;
  }
  function basketHoop(K, parent, s, L) {
    var THREE = K.THREE, g = new THREE.Group(); parent.add(g);
    var zb = s * (L / 2 - 1.2), zr = s * (L / 2 - 1.575), pad = K.M(NAVY), steel = K.M('#2a2f35', { metalness: 0.5, roughness: 0.4 });
    K.box(g, 1.3, 1.1, 2.2, pad, 0, 0.55, s * (L / 2 + 2.6));
    K.bar(g, [0, 1.1, s * (L / 2 + 2.2)], [0, 3.9, s * (L / 2 + 0.6)], 0.09, steel); K.bar(g, [0, 3.9, s * (L / 2 + 0.6)], [0, 3.45, zb + s * 0.1], 0.07, steel);
    var bc = document.createElement('canvas'); bc.width = 360; bc.height = 210; var bg = bc.getContext('2d'); bg.strokeStyle = '#fff'; bg.lineWidth = 10; bg.strokeRect(5, 5, 350, 200); bg.strokeRect(120, 90, 120, 90);
    var glass = new THREE.MeshStandardMaterial({ color: K.col('#dbe8ef'), map: K.tex(bc), transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1 });
    var board = K.box(g, 1.8, 1.05, 0.03, glass, 0, 2.9 + 0.525, zb); board.castShadow = false;
    var ring = K.sh(new THREE.Mesh(new THREE.TorusGeometry(0.225, 0.01, 8, 28), K.M('#e0601a', { metalness: 0.4, roughness: 0.4 }))); ring.rotation.x = Math.PI / 2; ring.position.set(0, 3.05, zr); g.add(ring);
    var net = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.15, 0.42, 16, 3, true), K.netMat([12, 4])); net.position.set(0, 3.05 - 0.21, zr); g.add(net);
  }
  function netLine(K, parent, width, top, height, postX, postH, opt) {
    var THREE = K.THREE, white = K.M('#ffffff', { roughness: 0.6 });
    var net = new THREE.Mesh(new THREE.PlaneGeometry(width, height), K.netMat([width / 0.1, height / 0.1], '#202428')); net.position.set(0, top - height / 2, 0); parent.add(net);
    K.box(parent, width, 0.07, 0.02, white, 0, top - 0.035, 0);
    [-1, 1].forEach(function (s) { K.cyl(parent, 0.04, 0.04, postH, K.M(opt && opt.postCol || '#d9dde1', { metalness: 0.5, roughness: 0.35 }), s * postX, postH / 2, 0); });
  }
  function hallShell(K, parent, o) {
    var THREE = K.THREE, g = new THREE.Group(); g.position.set(o.cx || 0, 0, 0); parent.add(g);
    var Lh = o.len, Wh = o.wid, H = o.h, t = 0.35;
    var cc = document.createElement('canvas'); cc.width = 64; cc.height = 64; var cg = cc.getContext('2d'); cg.fillStyle = o.clad || '#cfd6dc'; cg.fillRect(0, 0, 64, 64); cg.fillStyle = 'rgba(0,0,0,.12)'; for (var i = 0; i < 64; i += 8) cg.fillRect(i, 0, 2, 64);
    var clad = new THREE.MeshStandardMaterial({ map: K.tex(cc, [Lh / 2, H / 2]), roughness: 0.6, metalness: 0.2 }), cladZ = new THREE.MeshStandardMaterial({ map: K.tex(cc, [Wh / 2, H / 2]), roughness: 0.6, metalness: 0.2 });
    var inner = K.M(o.inner || '#f1f2ee', { roughness: 0.9 }), cap = K.M('#30353b', { roughness: 0.7 }), padM = K.M(o.pad || '#1f4fa0', { roughness: 0.8 });
    [[0, -Wh / 2, Lh + t, 1], [0, Wh / 2, Lh + t, 1], [-Lh / 2, 0, Wh, 0], [Lh / 2, 0, Wh, 0]].forEach(function (w) {
      var along = w[3]; var mats = along ? [w[1] > 0 ? clad : inner, w[1] > 0 ? inner : clad, cap, inner, inner, inner] : [inner, inner, cap, inner, w[0] > 0 ? cladZ : inner, w[0] > 0 ? inner : cladZ];
      // les murs suivent le grand côté de la salle (axe z du terrain)
      K.box(g, along ? t : w[2], H, along ? w[2] : t, mats, w[1], H / 2, w[0]);
      var inset = w[1] > 0 || w[0] > 0 ? -1 : 1; K.box(g, along ? 0.05 : w[2] - 0.8, 2, along ? w[2] - 0.8 : 0.05, padM, along ? w[1] + inset * (t / 2 + 0.03) : 0, (o.floorY || 0) + 1, along ? 0 : w[0] + inset * (t / 2 + 0.03));
    });
    if (!o.noFloor) K.plane(g, Wh, Lh, K.M(o.floor || '#2c3138', { roughness: 0.75 }), 0, (o.floorY || 0) + 0.015, 0, -Math.PI / 2);
    return g;
  }

  /* ----- un joueur ou une joueuse (taille 1, mise à l'échelle ensuite) ----- */
  function buildPlayer(K, opts) {
    var THREE = K.THREE, g = new THREE.Group(), fem = opts.gender === 'f';
    var M = function (c) { return K.M(c, { roughness: 0.72 }); };
    var skin = K.M(opts.skin, { roughness: 0.6 }), shirt = M(opts.shirt), shorts = M(opts.shorts), sock = M(opts.sock || opts.shirt), boot = K.M('#111111', { roughness: 0.5 }), hair = M(opts.hair);
    function cyl(rt, rb, h, mat, x, y, z, rz) { var m = K.sh(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 14), mat)); m.position.set(x, y, z || 0); if (rz) m.rotation.z = rz; g.add(m); return m; }
    var hip = fem ? 0.125 : 0.115, sh = fem ? 0.135 : 0.16, gear = opts.gear;
    if (!opts.swim) {
      [-1, 1].forEach(function (s) {
        if (gear === 'roller') { // patin à roues alignées
          var bt = K.box(g, 0.085, 0.09, 0.16, boot, s * 0.06, 0.075, 0.02);
          for (var w = 0; w < 4; w++) { var wh = K.cyl(g, 0.024, 0.024, 0.02, K.M('#e8a830', { roughness: 0.5 }), s * 0.06, 0.024, -0.04 + w * 0.042, 10); wh.rotation.z = Math.PI / 2; }
        } else K.box(g, 0.075, 0.04, 0.13, boot, s * 0.06, 0.02, 0.02);
        cyl(0.04, 0.035, 0.24, gear === 'athle' ? skin : sock, s * 0.06, 0.16);
        cyl(0.055, 0.043, 0.2, skin, s * 0.062, 0.37);
      });
      cyl(hip, hip + 0.01, 0.14, shorts, 0, 0.47);
    }
    var y0 = opts.swim ? -0.42 : 0;
    cyl(sh, hip - 0.005, 0.32, shirt, 0, y0 + 0.69);
    if (fem) { var b = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), shirt)); b.scale.set(1.15, 0.5, 0.75); b.position.set(0, y0 + 0.75, 0.035); g.add(b); }
    if (gear === 'athle') { var bib = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.11), K.M('#ffffff')); bib.position.set(0, y0 + 0.7, (fem ? 0.135 : 0.12)); g.add(bib); }
    var rightHand = null;
    [-1, 1].forEach(function (s) {
      if (opts.swim && s > 0) { // bras levé, comme pour appeler le ballon
        cyl(0.048, 0.044, 0.18, skin, sh + 0.02, y0 + 0.92, 0, -0.12);
        cyl(0.04, 0.034, 0.2, skin, sh + 0.045, y0 + 1.1, 0, -0.05);
        var hd = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), skin)); hd.position.set(sh + 0.05, y0 + 1.23, 0); g.add(hd); return;
      }
      cyl(0.05, 0.045, 0.14, opts.swim || gear === 'athle' ? skin : shirt, s * (sh + 0.035), y0 + 0.79, 0, s * 0.12);
      var low = cyl(0.04, 0.034, 0.2, skin, s * (sh + 0.06), y0 + 0.62, 0, s * 0.08);
      var hand = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), skin)); hand.position.set(low.position.x + s * 0.012, low.position.y - 0.12, 0); g.add(hand);
      if (s > 0) rightHand = hand.position.clone();
    });
    cyl(0.04, 0.045, 0.06, skin, 0, y0 + 0.88);
    var head = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), skin)); head.scale.set(0.95, 1.08, 1); head.position.y = y0 + 0.97; g.add(head);
    if (opts.cap) {
      var capm = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), M(opts.cap))); capm.position.y = y0 + 0.975; g.add(capm);
      [-1, 1].forEach(function (s) { var e = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M('#ffffff')); e.scale.set(0.5, 1, 1); e.position.set(s * 0.085, y0 + 0.96, 0); g.add(e); });
    } else if (gear === 'roller') {
      var helm = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.097, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.56), K.M(opts.trim, { roughness: 0.35 }))); helm.position.y = y0 + 0.98; g.add(helm);
      var visor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16, 1, true, -0.9, 1.8), new THREE.MeshStandardMaterial({ color: K.col('#cfe6f5'), transparent: true, opacity: 0.4, side: THREE.DoubleSide })); visor.position.set(0, y0 + 0.95, 0); g.add(visor);
    } else {
      var hc = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.091, 16, 10, 0, Math.PI * 2, 0, Math.PI * (fem ? 0.58 : 0.45)), hair)); hc.position.y = y0 + 0.985; hc.rotation.x = -0.15; g.add(hc);
      if (fem) {
        if (opts.style % 2) { var pt = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), hair)); pt.scale.set(0.8, 1.9, 0.8); pt.position.set(0, y0 + 0.93, -0.1); pt.rotation.x = 0.4; g.add(pt); }
        else { var bun = K.sh(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), hair)); bun.position.set(0, y0 + 1.04, -0.075); g.add(bun); }
        var band = new THREE.Mesh(new THREE.TorusGeometry(0.087, 0.008, 6, 20), M(opts.trim)); band.rotation.x = Math.PI / 2 - 0.25; band.position.y = y0 + 1.0; g.add(band);
      }
    }
    if (rightHand && gear === 'roller') { var stick = K.M('#1b1b1b', { roughness: 0.5 }); K.bar(g, [rightHand.x, rightHand.y, 0.02], [0.28, 0.03, 0.36], 0.012, stick); K.box(g, 0.05, 0.05, 0.2, stick, 0.3, 0.03, 0.45); }
    if (rightHand && gear === 'tennis') {
      var frameM = K.M('#e8e8e8', { roughness: 0.35, metalness: 0.3 }); K.bar(g, [rightHand.x, rightHand.y, 0.02], [rightHand.x + 0.05, rightHand.y + 0.17, 0.08], 0.014, K.M('#222222'));
      var rk = new THREE.Group(); rk.position.set(rightHand.x + 0.09, rightHand.y + 0.32, 0.11); rk.rotation.set(-0.3, 0, -0.25); g.add(rk);
      var fr = K.sh(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 24), frameM)); fr.scale.set(0.8, 1.15, 1); rk.add(fr);
      var str = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), new THREE.MeshStandardMaterial({ color: K.col('#f4f4ea'), transparent: true, opacity: 0.35, side: THREE.DoubleSide })); str.scale.set(0.8, 1.15, 1); rk.add(str);
    }
    if (opts.captain) { var cb = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 6, 16), K.M('#e8a830')); cb.rotation.y = Math.PI / 2; cb.position.set(-(sh + 0.035), y0 + 0.8, 0); g.add(cb); }
    return g;
  }

  /* ----- le ballon (ou la balle, le palet, le poids) : origine au point de contact avec le sol, rayon en mètres ----- */
  var BALLS = { foot: { r: 0.11, label: 'Ballon de football (taille 5)' }, rugby: { r: 0.095, label: 'Ballon ovale (taille 5)' }, basket: { r: 0.12, label: 'Ballon de basket (taille 7)' }, hand: { r: 0.095, label: 'Ballon de handball (taille 3)' },
    volley: { r: 0.105, label: 'Ballon de volley' }, wp: { r: 0.11, label: 'Ballon de water-polo' }, tennis: { r: 0.0335, label: 'Balle de tennis' }, palet: { r: 0.038, label: 'Palet de roller hockey' }, poids: { r: 0.062, label: 'Poids (7,26 kg chez les hommes)' } };
  function ballTexture(type) {
    var c = document.createElement('canvas'); c.width = 512; c.height = 256; var g = c.getContext('2d');
    function wave(col, lw, y0, amp, per, ph) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (var x = 0; x <= 512; x += 4) { var y = y0 + amp * Math.sin((x / 512) * Math.PI * 2 * per + (ph || 0)); if (x) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
    if (type === 'basket') { g.fillStyle = '#d4651f'; g.fillRect(0, 0, 512, 256); noise(g, 512, 256, 40, 2); g.strokeStyle = '#1a1a1a'; g.lineWidth = 5; [0, 256].forEach(function (x) { g.beginPath(); g.moveTo(x + 2, 0); g.lineTo(x + 2, 256); g.stroke(); }); wave('#1a1a1a', 5, 128, 0, 1); wave('#1a1a1a', 5, 128, 80, 2, Math.PI / 2); }
    else if (type === 'volley') { var cols = ['#f4c430', '#1f4fa0', '#ffffff']; for (var i = 0; i < 9; i++) { g.fillStyle = cols[i % 3]; g.beginPath(); for (var x = 0; x <= 512; x += 8) { var y = i * 28.4 + 14 * Math.sin(x / 512 * Math.PI * 4); if (x) g.lineTo(x, y); else g.moveTo(x, y); } for (x = 512; x >= 0; x -= 8) g.lineTo(x, (i + 1) * 28.4 + 14 * Math.sin(x / 512 * Math.PI * 4)); g.closePath(); g.fill(); } noise(g, 512, 256, 10, 4); }
    else if (type === 'hand') { g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, 512, 256); wave('#1f4fa0', 26, 90, 40, 2); wave('#f2c230', 18, 170, 36, 2, 1.4); wave('#c81e3a', 8, 128, 60, 1, 0.6); noise(g, 512, 256, 16, 6); }
    else if (type === 'wp') { g.fillStyle = '#f2cf2a'; g.fillRect(0, 0, 512, 256); wave('#1f4fa0', 14, 80, 40, 2); wave('#1f4fa0', 14, 176, 40, 2, Math.PI); noise(g, 512, 256, 30, 8); }
    else if (type === 'tennis') { g.fillStyle = '#cfe03a'; g.fillRect(0, 0, 512, 256); noise(g, 512, 256, 60, 9); wave('#f6f6ea', 8, 128, 70, 2); }
    else if (type === 'rugby') { g.fillStyle = '#f1efe8'; g.fillRect(0, 0, 512, 256); g.fillStyle = NAVY; g.fillRect(0, 40, 512, 18); g.fillRect(0, 198, 512, 18); g.fillStyle = GOLD; g.fillRect(0, 62, 512, 8); g.fillRect(0, 186, 512, 8); g.fillStyle = '#b8b2a4'; for (var s = 0; s < 4; s++) g.fillRect(s * 128, 0, 3, 256); noise(g, 512, 256, 24, 10); }
    return c;
  }
  function buildBall(K, type) {
    var THREE = K.THREE, def = BALLS[type] || BALLS.foot, r = def.r, g = new THREE.Group(), m;
    if (type === 'foot') {
      var geo = new THREE.IcosahedronGeometry(1, 2), pos = geo.attributes.position, phi = (1 + Math.sqrt(5)) / 2, V = [];
      [[-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0], [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi], [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]].forEach(function (v) { V.push(new THREE.Vector3().fromArray(v).normalize()); });
      var colors = new Float32Array(pos.count * 3), tmp = new THREE.Vector3(), white = K.col('#f4f4f2'), black = K.col('#141414');
      for (var t = 0; t < pos.count; t += 3) {
        var corner = false; for (var k = 0; k < 3 && !corner; k++) { tmp.fromBufferAttribute(pos, t + k); for (var q = 0; q < 12; q++) if (tmp.distanceTo(V[q]) < 0.01) { corner = true; break; } }
        for (k = 0; k < 3; k++) { var cc = corner ? black : white; colors.set([cc.r, cc.g, cc.b], (t + k) * 3); }
      }
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3)); geo.setAttribute('normal', pos.clone());
      m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42 })); m.scale.setScalar(r); m.position.y = r;
    } else if (type === 'rugby') {
      var pts = []; for (var i = 0; i <= 24; i++) { var yy = -1 + i / 12; pts.push(new THREE.Vector2(Math.max(0.001, Math.pow(1 - yy * yy, 0.62)), yy * 1.5)); }
      m = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), new THREE.MeshStandardMaterial({ map: K.tex(ballTexture('rugby')), roughness: 0.6 })); m.scale.setScalar(r); m.rotation.z = Math.PI / 2; m.position.y = r;
    } else if (type === 'palet') {
      m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.025, 24), K.M('#d23a1e', { roughness: 0.55 })); m.position.y = 0.0125;
    } else if (type === 'poids') {
      m = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), K.M('#8b8f94', { roughness: 0.32, metalness: 0.92 })); m.position.y = r;
    } else {
      m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 22), new THREE.MeshStandardMaterial({ map: K.tex(ballTexture(type)), roughness: type === 'tennis' ? 0.95 : 0.55 })); m.position.y = r;
    }
    K.sh(m); m.receiveShadow = false; g.add(m); g.userData.r = r;
    return g;
  }

  /* ----- le stade, la salle, la piscine ou le court autour du terrain (en mètres) ----- */
  function buildStadium(K, sp, o) {
    var THREE = K.THREE, V = new THREE.Group(), W = sp.wid, L = sp.len, mg = sp.mg, res = { group: V, lamps: [], masts: [], y0: 0, ticks: [] };
    var sc = surfaceCanvas(sp, { surface: o.surface });
    var bump = new THREE.CanvasTexture(bumpCanvas(3)); bump.wrapS = bump.wrapT = THREE.RepeatWrapping; bump.repeat.set(sc.Wm / 1.5, sc.Hm / 1.5);
    var grassy = sp.kind === 'stade' || (sp.id === 'tennis' && o.surface === 'gazon'), clay = sp.id === 'tennis' && o.surface === 'terre';
    var surfMat = new THREE.MeshStandardMaterial({ map: K.tex(sc.canvas), bumpMap: bump, bumpScale: grassy || clay ? 0.008 : 0.002, roughness: grassy || clay ? 0.96 : sp.id === 'basket' ? 0.38 : 0.6, metalness: 0 });
    var path = 3, kitA = o.kit[1], kitB = o.kit[2];
    function surface(y) { var m = K.plane(V, sc.Wm, sc.Hm, surfMat, 0, y, 0, -Math.PI / 2); m.receiveShadow = true; return m; }
    if (sp.kind === 'stade') {
      surface(0.04);
      var padW = W + 2 * mg + 2 * path, padL = L + 2 * mg + 2 * path;
      var pad = K.plane(V, padW, padL, K.M('#9a9a96', { map: K.tex(groundCanvas('#9a9a96', 26, 2), [padW / 6, padL / 6]), roughness: 0.95 }), 0, 0.025, 0, -Math.PI / 2);
      var grand = o.style === 'grand', hw = W / 2 + mg, hl = L / 2 + mg, rows = grand ? 14 : sp.track ? 10 : 7;
      if (!grand) {
        railing(K, V, hw - 0.4, hl - 0.4, 1.1);
        var st1 = stand(K, V, { len: Math.min(L * (sp.track ? 0.55 : 0.5), sp.track ? 90 : 60), rows: rows, roof: true, fill: 0.32, seed: 3, title: o.title });
        st1.rotation.y = Math.PI / 2; st1.position.set(hw + path, 0, 0);
        adBoards(K, V, hw, hl, 0.8, [[hw - 0.75, 0, L * 0.7, -Math.PI / 2], [-(hw - 0.75), 0, L * 0.7, Math.PI / 2]]);
        var spect = [], R = rng(17); for (var z = -hl + 3; z < hl - 3; z += 0.9) if (R() < 0.35) spect.push({ x: -(hw + 0.4 + R() * 0.8), y: 0.03, z: z + R() * 0.4, ry: 0, stand: true });
        for (var x = -hw + 4; x < hw - 4; x += 1.1) if (R() < 0.15) spect.push({ x: x, y: 0.03, z: -(hl + 0.5 + R()), ry: 0, stand: true });
        K.people(V, spect, 21);
        if (sp.id === 'football' || sp.id === 'rugby') { dugout(K, V, hw - mg * 0.45, -6.5, Math.PI / 2); dugout(K, V, hw - mg * 0.45, 6.5, Math.PI / 2); }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { var mx = q[0] * (hw + path + (q[0] > 0 ? (st1.userData.depth + 2) : 1.5)), mz = q[1] * L * 0.3; res.masts.push(mast(K, V, mx, mz, sp.track ? 26 : 19, 0, 0, res.lamps)); });
      } else {
        var depth = 0;
        [[hw + path, 0, L + 2 * mg, Math.PI / 2], [-(hw + path), 0, L + 2 * mg, -Math.PI / 2], [0, hl + path, W + 2 * mg, 0], [0, -(hl + path), W + 2 * mg, Math.PI]].forEach(function (s, i) {
          var g = stand(K, V, { len: s[2], rows: rows, roof: true, fill: 0.78, seed: 7 + i, aisle: 12, title: o.title, pattern: function (x, r) { return (r + Math.floor((x + 200) / 6)) % 5 === 0; } });
          g.rotation.y = s[3]; g.position.set(s[0], 0, s[1]); depth = g.userData.depth;
        });
        var bigPad = K.plane(V, padW + 2 * depth + 6, padL + 2 * depth + 6, K.M('#8c8d8a', { roughness: 0.95 }), 0, 0.02, 0, -Math.PI / 2);
        adBoards(K, V, hw - 1, hl - 1, 0.9);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { res.masts.push(mast(K, V, q[0] * (hw + path + depth + 2), q[1] * (hl + path + depth + 2), 36, 0, 0, res.lamps)); });
      }
      if (sp.id === 'football') { goal(K, V, { z: -L / 2, dir: -1, w: 7.32, h: 2.44 }); goal(K, V, { z: L / 2, dir: 1, w: 7.32, h: 2.44 }); }
      if (sp.track) { goal(K, V, { z: -50, dir: -1, w: 7.32, h: 2.44 }); goal(K, V, { z: 50, dir: 1, w: 7.32, h: 2.44 });
        var cage = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 7, 20, 1, true, Math.PI * 0.2, Math.PI * 1.6), K.netMat([30, 30], '#d8d8d8')); cage.position.set(0, 3.5, -(TR.S / 2 + TR.R * 0.55)); V.add(cage);
        K.cyl(V, 0.06, 0.06, 7, K.M('#c0c4c8'), 3.6 * Math.sin(Math.PI * 0.2), 3.5, -(TR.S / 2 + TR.R * 0.55) + 3.6 * Math.cos(Math.PI * 0.2)); K.cyl(V, 0.06, 0.06, 7, K.M('#c0c4c8'), -3.6 * Math.sin(Math.PI * 0.2), 3.5, -(TR.S / 2 + TR.R * 0.55) + 3.6 * Math.cos(Math.PI * 0.2));
      }
      if (sp.id === 'rugby') { rugbyPosts(K, V, -(L / 2 - 10), kitA); rugbyPosts(K, V, L / 2 - 10, kitA); }
      res.foot = { hw: hw + path + (grand ? depth : 8) + 2, hl: hl + path + (grand ? depth : 2) + 2 };
      res.extent = Math.max(hw, hl) + path + (grand ? 30 : 16);
      res.spots = true;
    } else if (sp.kind === 'tennis') {
      surface(0.04);
      var fw = W / 2 + mg, fl = L / 2 + mg;
      K.plane(V, fw * 2 + 3, fl * 2 + 3, K.M('#8f8f8a', { roughness: 0.95 }), 0, 0.02, 0, -Math.PI / 2);
      var fc = document.createElement('canvas'); fc.width = fc.height = 64; var fg = fc.getContext('2d'); fg.strokeStyle = '#3a4a3a'; fg.lineWidth = 3; fg.beginPath(); fg.moveTo(0, 32); fg.lineTo(32, 0); fg.lineTo(64, 32); fg.lineTo(32, 64); fg.closePath(); fg.stroke();
      var fenceM = function (len) { var t = new THREE.CanvasTexture(fc); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(len / 0.12, 3.6 / 0.12); return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, color: K.col('#556655') }); };
      var wind = K.M('#1f4a33', { roughness: 0.9, side: THREE.DoubleSide });
      [[0, -fl, fw * 2, 0], [0, fl, fw * 2, 0], [-fw, 0, fl * 2, Math.PI / 2], [fw, 0, fl * 2, Math.PI / 2]].forEach(function (f) {
        var p = K.plane(V, f[2], 3.6, fenceM(f[2]), f[0], 1.8, f[1], 0, f[3]); var wsc = K.plane(V, f[2], 2, wind, f[0] * 0.999, 1.05, f[1] * 0.999, 0, f[3]); wsc.castShadow = true;
        for (var t = -f[2] / 2; t <= f[2] / 2 + 0.01; t += 3) K.cyl(V, 0.035, 0.035, 3.7, K.M('#3a4a3a', { metalness: 0.4 }), f[3] ? f[0] : f[0] + t, 1.85, f[3] ? f[1] + t : f[1], 6);
      });
      netLine(K, V, 10.97 + 1.83, 1.0, 0.95, 6.4, 1.07, { postCol: '#2e5d3e' });
      var chair = new THREE.Group(); chair.position.set(7.3, 0, 0); V.add(chair); var cm = K.M('#2e5d3e', { roughness: 0.6 });
      [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(function (q) { K.cyl(chair, 0.03, 0.03, 1.9, cm, q[0], 0.95, q[1], 6); });
      K.box(chair, 0.7, 0.08, 0.7, cm, 0, 1.9, 0); K.box(chair, 0.7, 0.6, 0.06, cm, 0.32, 2.2, 0).rotation.y = Math.PI / 2; K.box(chair, 0.06, 0.6, 0.7, cm, 0.34, 2.2, 0);
      [-2.5, 2.5].forEach(function (z) { K.box(V, 0.45, 0.45, 1.6, K.M(NAVY), 7.6, 0.25, z); });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { res.masts.push(mast(K, V, q[0] * (fw + 1.2), q[1] * (fl - 4), 10, 0, 0, res.lamps)); res.masts[res.masts.length - 1].scale.setScalar(0.5); });
      res.foot = { hw: fw + 2, hl: fl + 2 }; res.extent = Math.max(fw, fl) + 8; res.spots = true;
    } else { // salle couverte ou piscine (vue en coupe, comme une maquette d'architecte)
      var pool = sp.kind === 'piscine', FY = pool ? 2 : 0, osm = o.osm || {};
      var Lh = Math.max(osm.len || 0, L + 2 * mg + (pool ? 10 : 8)), Wh = Math.max(osm.wid || 0, W + 2 * mg + (pool ? 13 : 10));
      Lh = Math.min(Lh, L + 2 * mg + 40); Wh = Math.min(Wh, W + 2 * mg + 30);
      var cx = -(W / 2 + mg + 1.5) + Wh / 2;
      hallShell(K, V, { len: Lh, wid: Wh, h: FY + 5.5, cx: cx, floor: pool ? '#d8d2c4' : '#3a3f47', floorY: FY, pad: sp.id === 'hand' ? '#e57c25' : '#1f4fa0', noFloor: pool });
      var bl = stand(K, V, { len: Math.min(L + 2 * mg, Lh - 4), rows: 6, roof: false, base: 0.45, rise: 0.36, depth: 0.78, fill: 0.45, seed: 9, seatA: sp.id === 'hand' ? '#e57c25' : '#1f4fa0', seatB: GOLD });
      bl.rotation.y = Math.PI / 2; bl.position.set(W / 2 + mg + 1.2, FY, 0);
      if (!pool) surface(0.035);
      if (sp.id === 'basket') { basketHoop(K, V, -1, L); basketHoop(K, V, 1, L); }
      if (sp.id === 'hand') { goal(K, V, { z: -L / 2, dir: -1, w: 3, h: 2, r: 0.04, square: true, stripe: '#d0202e', d0: 0.8, d1: 1.0 }); goal(K, V, { z: L / 2, dir: 1, w: 3, h: 2, r: 0.04, square: true, stripe: '#d0202e', d0: 0.8, d1: 1.0 }); }
      if (sp.id === 'volley') {
        var net = new THREE.Group(); V.add(net);
        netLine(K, net, W + 1.0, 2.43, 1.0, W / 2 + 1, 2.55, { postCol: '#d9dde1' });
        [-1, 1].forEach(function (s) { var a = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.8, 6), new THREE.MeshStandardMaterial({ map: K.tex(stripeCanvas('#ffffff', '#d0202e'), [1, 9]) })); a.position.set(s * W / 2, 2.43 - 0.1, 0); net.add(a); });
        var ref = new THREE.Group(); ref.position.set(-(W / 2 + 1.4), 0, 0); V.add(ref); K.box(ref, 0.7, 1.5, 0.7, K.M('#d9dde1', { metalness: 0.4 }), 0, 0.75, 0); K.box(ref, 0.8, 0.06, 0.8, K.M('#2b3036'), 0, 1.53, 0);
      }
      if (sp.rink) {
        var ring = function (wx, lz, r, hole) { var s = new THREE.Shape(); var x0 = -wx / 2, z0 = -lz / 2; s.moveTo(x0 + r, z0); s.lineTo(x0 + wx - r, z0); s.absarc(x0 + wx - r, z0 + r, r, -Math.PI / 2, 0, false); s.lineTo(x0 + wx, z0 + lz - r); s.absarc(x0 + wx - r, z0 + lz - r, r, 0, Math.PI / 2, false); s.lineTo(x0 + r, z0 + lz); s.absarc(x0 + r, z0 + lz - r, r, Math.PI / 2, Math.PI, false); s.lineTo(x0, z0 + r); s.absarc(x0 + r, z0 + r, r, Math.PI, Math.PI * 1.5, false); return s; };
        var outer = ring(W + 0.3, L + 0.3, 4.15), inner = ring(W, L, 4); outer.holes.push(inner);
        var boards = K.sh(new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: 1.0, bevelEnabled: false, curveSegments: 16 }), K.M('#f4f4f2', { roughness: 0.45 }))); boards.rotation.x = -Math.PI / 2; V.add(boards);
        var kick = K.sh(new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.2, bevelEnabled: false, curveSegments: 16 }), K.M(GOLD, { roughness: 0.45 }))); kick.rotation.x = -Math.PI / 2; kick.scale.set(1.002, 1.002, 1); kick.position.y = 0.001; V.add(kick);
        var plexi = new THREE.MeshStandardMaterial({ color: K.col('#dfeef7'), transparent: true, opacity: 0.22, roughness: 0.05, side: THREE.DoubleSide });
        [-1, 1].forEach(function (s) { var pm = K.box(V, W - 8, 1.2, 0.03, plexi, 0, 1.6, s * (L / 2 + 0.15)); pm.castShadow = false; });
        goal(K, V, { z: -(L / 2 - 4), dir: -1, w: 1.83, h: 1.22, r: 0.03, col: '#c8282e', d0: 0.45, d1: 1.0, metal: true });
        goal(K, V, { z: L / 2 - 4, dir: 1, w: 1.83, h: 1.22, r: 0.03, col: '#c8282e', d0: 0.45, d1: 1.0, metal: true });
      }
      if (pool) {
        var Wp = W + 2 * mg, Lp = L + 2 * mg;
        var deck = new THREE.Shape(); deck.moveTo(cx - Wh / 2, -Lh / 2); deck.lineTo(cx + Wh / 2, -Lh / 2); deck.lineTo(cx + Wh / 2, Lh / 2); deck.lineTo(cx - Wh / 2, Lh / 2); deck.closePath();
        var hole = new THREE.Path(); hole.moveTo(-Wp / 2, -Lp / 2); hole.lineTo(-Wp / 2, Lp / 2); hole.lineTo(Wp / 2, Lp / 2); hole.lineTo(Wp / 2, -Lp / 2); hole.closePath(); deck.holes.push(hole);
        var tc = document.createElement('canvas'); tc.width = tc.height = 64; var tg = tc.getContext('2d'); tg.fillStyle = '#ddd6c8'; tg.fillRect(0, 0, 64, 64); tg.strokeStyle = 'rgba(0,0,0,.15)'; tg.lineWidth = 2; tg.strokeRect(0, 0, 64, 64); noise(tg, 64, 64, 14, 2);
        var deckM = new THREE.MeshStandardMaterial({ map: K.tex(tc, [1, 1]), roughness: 0.5 }); deckM.map.repeat.set(2, 2);
        var dm = new THREE.Mesh(new THREE.ShapeGeometry(deck), deckM); dm.rotation.x = -Math.PI / 2; dm.position.y = FY; dm.receiveShadow = true; V.add(dm);
        surface(0.1);
        var tiles = document.createElement('canvas'); tiles.width = tiles.height = 64; var tl = tiles.getContext('2d'); tl.fillStyle = '#6fbfe0'; tl.fillRect(0, 0, 64, 64); tl.strokeStyle = 'rgba(30,70,100,.35)'; tl.lineWidth = 2; tl.strokeRect(0, 0, 64, 64);
        [[0, -Lp / 2, Wp, 0], [0, Lp / 2, Wp, Math.PI], [-Wp / 2, 0, Lp, Math.PI / 2], [Wp / 2, 0, Lp, -Math.PI / 2]].forEach(function (w) { var t = K.tex(tiles, [w[2] / 0.25, FY / 0.25]); K.plane(V, w[2], FY - 0.1, new THREE.MeshStandardMaterial({ map: t, roughness: 0.3 }), w[0], (FY + 0.1) / 2, w[1], 0, w[3]); });
        var wc = document.createElement('canvas'); wc.width = wc.height = 256; var wg = wc.getContext('2d'); wg.fillStyle = '#2f93c8'; wg.fillRect(0, 0, 256, 256); var WR = rng(4);
        for (var k = 0; k < 160; k++) { wg.strokeStyle = 'rgba(255,255,255,' + (0.06 + WR() * 0.12) + ')'; wg.lineWidth = 1 + WR() * 2; wg.beginPath(); var x0 = WR() * 256, y0 = WR() * 256; wg.moveTo(x0, y0); wg.bezierCurveTo(x0 + 10, y0 - 8, x0 + 22, y0 + 8, x0 + 34, y0); wg.stroke(); }
        var wt = K.tex(wc, [Wp / 4, Lp / 4]);
        var water = new THREE.Mesh(new THREE.PlaneGeometry(Wp, Lp), new THREE.MeshStandardMaterial({ map: wt, transparent: true, opacity: 0.55, roughness: 0.04, metalness: 0.15 })); water.rotation.x = -Math.PI / 2; water.position.y = FY - 0.15; water.receiveShadow = true; V.add(water);
        res.ticks.push(function (t) { wt.offset.set(Math.sin(t / 4000) * 0.05, t / 30000); });
        goal(K, V, { z: -L / 2, dir: -1, w: 3, h: 0.9, r: 0.04, y: FY - 0.15, d0: 0.3, d1: 0.55 }); goal(K, V, { z: L / 2, dir: 1, w: 3, h: 0.9, r: 0.04, y: FY - 0.15, d0: 0.3, d1: 0.55 });
        var buoys = []; [-W / 2, W / 2].forEach(function (x) { for (var bz = -L / 2; bz <= L / 2 + 0.01; bz += 0.5) { var dd = L / 2 - Math.abs(bz); buoys.push([x, bz, dd <= 2 ? '#d0202e' : dd <= 5 ? '#f2c230' : Math.abs(bz) < 0.3 ? '#ffffff' : '#2a6fd0']); } });
        var bm = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), K.M('#ffffff', { roughness: 0.4 }), buoys.length), du = new THREE.Object3D(), bc = new THREE.Color();
        buoys.forEach(function (b, i) { du.position.set(b[0], FY - 0.15, b[1]); du.updateMatrix(); bm.setMatrixAt(i, du.matrix); bc.set(b[2]).convertSRGBToLinear(); bm.setColorAt(i, bc); }); V.add(bm);
        res.y0 = FY - 0.15;
      }
      res.foot = { hw: Wh / 2 + Math.abs(cx) + 1, hl: Lh / 2 + 1 }; res.extent = Math.max(Wh / 2 + Math.abs(cx), Lh / 2) + 8; res.indoor = true; res.hallAxis = { len: Lh, wid: Wh };
    }
    return res;
  }

  function dispose(o) { if (!o) return; o.traverse(function (n) { if (n.geometry) n.geometry.dispose(); var m = n.material; if (m) (Array.isArray(m) ? m : [m]).forEach(function (x) { ['map', 'alphaMap', 'bumpMap', 'emissiveMap'].forEach(function (k) { if (x[k]) x[k].dispose(); }); x.dispose(); }); }); }

  /* ---------- Ciel, soleil, projecteurs ---------- */
  function Env(S, K) {
    var THREE = S.THREE, scene = S.scene;
    var hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8); scene.add(hemi);
    var sun = new THREE.DirectionalLight(0xffffff, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.015; scene.add(sun); scene.add(sun.target);
    var skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, bot: { value: new THREE.Color() } };
    var sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 top; uniform vec3 hor; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(hor, top, pow(min(1.0, h * 1.8), 0.6)) : mix(hor, bot, min(1.0, -h * 5.0)); gl_FragColor = vec4(c, 1.0); }' }));
    sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
    scene.fog = new THREE.Fog(0xcfe0ee, 8, 40);
    var spots = [], ext = 1, state = { dio: false, phase: 'jour', label: '' }, hallLight = null;
    function setExtent(e) { ext = e; var c = sun.shadow.camera; c.left = c.bottom = -e; c.right = c.top = e; c.near = 0.05; c.far = e * 6 + 10; c.updateProjectionMatrix(); }
    function setFog(n, f) { scene.fog.near = n; scene.fog.far = f; state.fog = [n, f]; }
    var PH = {
      jour: { sun: ['#fff1dc', 2.5], hemi: ['#bcd5ee', '#5d5a48', 0.75], sky: ['#3a74bf', '#d3e3ef', '#9aa58f'], lamp: 0.1, spot: 0, exp: 1.0 },
      dore: { sun: ['#ffb46e', 2.1], hemi: ['#f0c9a6', '#4a3f35', 0.62], sky: ['#4565a0', '#f4b27c', '#7a6a58'], lamp: 0.8, spot: 0, exp: 1.05 },
      crepuscule: { sun: ['#ff8a5c', 0.55], hemi: ['#6a7fa8', '#2a2a33', 0.5], sky: ['#1b2a4b', '#d9875a', '#3a3438'], lamp: 2.2, spot: 1.0, exp: 1.12 },
      nuit: { sun: ['#93a8da', 0.22], hemi: ['#3a4a72', '#16171b', 0.34], sky: ['#040914', '#1c2b47', '#0b0e14'], lamp: 3, spot: 1.5, exp: 1.2 }
    };
    function apply(o) {
      // o : { mode, lat, lon, bearing, lamps, masts, indoor }
      var alt, az, now = new Date();
      if (o.mode === 'jour') { alt = 0.85; az = 3.6; }
      else if (o.mode === 'couchant') { alt = 0.07; az = 4.35; }
      else if (o.mode === 'nuit') { alt = -0.6; az = 3.3; }
      else { var p = sunPosition(now, o.lat || 49.64, o.lon || -1.62); alt = p.alt; az = p.az; }
      var phase = alt > 0.14 ? 'jour' : alt > 0 ? 'dore' : alt > -0.1 ? 'crepuscule' : 'nuit', P = PH[phase]; state.phase = phase;
      var la = phase === 'nuit' ? 0.9 : Math.max(alt, 0.05), aa = phase === 'nuit' ? az + 0.6 : az;
      var e = [Math.sin(aa) * Math.cos(la), Math.sin(la), -Math.cos(aa) * Math.cos(la)], b = o.bearing || 0;
      var d = new THREE.Vector3(e[0] * Math.cos(b) + e[2] * Math.sin(b), e[1], -e[0] * Math.sin(b) + e[2] * Math.cos(b)).normalize();
      sun.position.copy(d.multiplyScalar(ext * 3)); sun.target.position.set(0, 0, 0);
      sun.color.set(P.sun[0]).convertSRGBToLinear(); sun.intensity = P.sun[1];
      hemi.color.set(P.hemi[0]).convertSRGBToLinear(); hemi.groundColor.set(P.hemi[1]).convertSRGBToLinear(); hemi.intensity = P.hemi[2];
      skyU.top.value.set(P.sky[0]); skyU.hor.value.set(P.sky[1]); skyU.bot.value.set(P.sky[2]);
      scene.fog.color.set(P.sky[1]).convertSRGBToLinear();
      S.renderer.toneMappingExposure = P.exp;
      (o.lamps || []).forEach(function (m) { m.emissiveIntensity = P.lamp; });
      spots.forEach(function (s) { scene.remove(s); scene.remove(s.target); }); spots = [];
      if (hallLight) { scene.remove(hallLight); hallLight = null; }
      if (P.spot && !o.indoor) (o.masts || []).forEach(function (h) {
        var wp = new THREE.Vector3(); h.getWorldPosition(wp);
        var s = new THREE.SpotLight(0xfff2d6, P.spot, 0, 0.62, 0.55, 1); s.position.copy(wp); s.target.position.set(-wp.x * 0.15, 0, -wp.z * 0.15); scene.add(s); scene.add(s.target); spots.push(s);
      });
      if (o.indoor && phase !== 'jour') { hallLight = new THREE.PointLight(0xfff6e6, 1.1, 0, 1); hallLight.position.set(0, ext * 0.6, 0); scene.add(hallLight); }
      var hh = Math.round((now.getHours() + now.getMinutes() / 60) * 100) / 100;
      state.label = o.mode === 'reel' ? (phase === 'nuit' ? 'Il fait nuit : projecteurs allumés' : 'Soleil à sa vraie place (' + now.getHours() + ' h ' + String(now.getMinutes()).padStart(2, '0') + ')') : '';
      return state;
    }
    function setDiorama(on) { state.dio = on; sky.visible = !on; scene.fog.near = on ? 1e4 : (state.fog ? state.fog[0] : 8); scene.fog.far = on ? 2e4 : (state.fog ? state.fog[1] : 40); }
    function tick() { sky.position.copy(S.camera.position); }
    return { apply: apply, setExtent: setExtent, setFog: setFog, setDiorama: setDiorama, tick: tick, state: state, sun: sun };
  }

  /* ---------- Carte autour du stade + bâtiments réels ---------- */
  function Geo(S, K, world) {
    var THREE = S.THREE, geo = new THREE.Group(); world.add(geo);
    var near = null, far = null, dio = null, bIn = null, bOut = null, info = null, ver = 0, dioOn = false, Rd = 100, attrCb = null, sp = null;
    function rm(o) { if (o) { geo.remove(o); dispose(o); } }
    function mapPlane(nm, inner, y, order) {
      var t = new THREE.CanvasTexture(nm.canvas); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; nm.tex = t;
      var mat = new THREE.MeshLambertMaterial({ map: t, alphaMap: new THREE.CanvasTexture(fadeCanvas(inner)), transparent: true, depthWrite: false });
      var m = new THREE.Mesh(new THREE.PlaneGeometry(nm.size, nm.size), mat); m.rotation.x = -Math.PI / 2; m.position.set(nm.ox, y, nm.oz); m.renderOrder = order; m.receiveShadow = true; geo.add(m); return m;
    }
    function lawn(size) { // pas de carte : une campagne normande stylisée plutôt que du noir
      var c = groundCanvas('#5f7d45', 30, 8); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(size / 40, size / 40);
      var m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshLambertMaterial({ map: t, alphaMap: new THREE.CanvasTexture(fadeCanvas(0.55)), transparent: true, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.position.y = -0.05; m.renderOrder = -1; m.receiveShadow = true; geo.add(m); return m;
    }
    function buildDiorama() {
      rm(dio); dio = new THREE.Group(); geo.add(dio);
      var mat;
      if (info) { var t = info.tex.clone(); t.needsUpdate = true; info.dioTex = t; var P = info.size; t.repeat.set(2 * Rd / P, 2 * Rd / P); t.offset.set((-Rd - info.ox + P / 2) / P, (-Rd + info.oz + P / 2) / P); mat = new THREE.MeshLambertMaterial({ map: t }); }
      else mat = new THREE.MeshLambertMaterial({ color: K.col('#5f7d45') });
      var disc = new THREE.Mesh(new THREE.CircleGeometry(Rd, 96), mat); disc.rotation.x = -Math.PI / 2; disc.position.y = -0.05; disc.receiveShadow = true; dio.add(disc);
      var soil = K.M('#5a4632', { roughness: 1 }), th = Math.max(3, Rd * 0.07);
      var rim = new THREE.Mesh(new THREE.CylinderGeometry(Rd, Rd * 0.96, th, 96, 1, true), soil); rim.position.y = -0.05 - th / 2; dio.add(rim);
      var base = new THREE.Mesh(new THREE.CircleGeometry(Rd * 0.96, 64), soil); base.rotation.x = Math.PI / 2; base.position.y = -0.05 - th; dio.add(base);
      dio.visible = dioOn;
    }
    function buildBuildings(els, P, foot) {
      rm(bIn); rm(bOut); bIn = bOut = null;
      var X0 = merc(P.lat, P.lon), m = m20(P.lat), R = rng(9), cb = Math.cos(P.bearing), sb = Math.sin(P.bearing);
      var A = { i: { p: [], n: [], c: [] }, o: { p: [], n: [], c: [] } }, wallC = ['#ddd8cc', '#cfc9bb', '#e8e4da', '#bdb7aa', '#a99e8c', '#c8c2b4'], tmp = new THREE.Color(), tmp2 = new THREE.Color();
      els.slice(0, 3000).forEach(function (el) {
        if (P.osm && (el.type + '/' + el.id) === P.osm) return; // la salle réelle est remplacée par la maquette
        var pts = wayPoints(el); if (!pts || pts.length < 4) return;
        var loc = pts.map(function (p) { var X = merc(p[0], p[1]); return [(X[0] - X0[0]) * m, (X[1] - X0[1]) * m]; });
        if (loc.length > 1 && Math.abs(loc[0][0] - loc[loc.length - 1][0]) < 0.01 && Math.abs(loc[0][1] - loc[loc.length - 1][1]) < 0.01) loc.pop();
        if (loc.length < 3) return;
        if (foot && loc.some(function (q) { var x = q[0] * cb + q[1] * sb, z = -q[0] * sb + q[1] * cb; return Math.abs(x) < foot.hw && Math.abs(z) < foot.hl; })) return;
        var t = el.tags || {}, h = buildingHeight(t, R), gg;
        try { gg = new THREE.ExtrudeGeometry(new THREE.Shape(loc.map(function (q) { return new THREE.Vector2(q[0], -q[1]); })), { depth: h, bevelEnabled: false }); } catch (e) { return; }
        gg.rotateX(-Math.PI / 2); if (gg.index) gg = gg.toNonIndexed();
        var cx = 0, cz = 0; loc.forEach(function (q) { cx += q[0]; cz += q[1]; }); cx /= loc.length; cz /= loc.length;
        var T = Math.hypot(cx, cz) < Rd - 4 ? A.i : A.o;
        tmp.set(wallC[Math.floor(R() * wallC.length)]).convertSRGBToLinear();
        tmp2.set(/industrial|warehouse|retail|commercial|sports_hall|hangar/.test(t.building || '') ? '#9ca2a8' : R() < 0.78 ? '#4b5058' : '#8e5b45').convertSRGBToLinear();
        var pa = gg.attributes.position.array, na = gg.attributes.normal.array;
        for (var i = 0; i < pa.length; i += 3) { T.p.push(pa[i], pa[i + 1], pa[i + 2]); T.n.push(na[i], na[i + 1], na[i + 2]); var c = na[i + 1] > 0.7 ? tmp2 : tmp; T.c.push(c.r, c.g, c.b); }
        gg.dispose();
      });
      function mk(a) { if (!a.p.length) return null; var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(a.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(a.n, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(a.c, 3)); var me = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 })); me.castShadow = me.receiveShadow = true; geo.add(me); return me; }
      bIn = mk(A.i); bOut = mk(A.o); if (bOut) bOut.visible = !dioOn;
    }
    function load(P, spo, mapId, foot, onAttr) {
      var my = ++ver; sp = spo; attrCb = onAttr;
      geo.rotation.y = P.bearing || 0; rm(near); rm(far); rm(dio); rm(bIn); rm(bOut); near = far = dio = bIn = bOut = null; info = null;
      Rd = Math.max(sp.len, sp.wid) * 0.62 + (sp.kind === 'stade' ? 45 : 25);
      var s = world.scale.x, attr = [];
      if (mapId === 'aucune' || !MAPS[mapId]) { near = lawn(4000); onAttr && onAttr(''); if (S.env) S.env.setFog(Rd * 2 * s, 1900 * s); buildDiorama(); }
      else {
        var z = Math.max(15, Math.min(19, Math.round(Math.log(156543.03 * Math.cos(P.lat * Math.PI / 180) / (sp.len / 300)) / Math.LN2)));
        var XY = merc(P.lat, P.lon), pend = false;
        var upd = function (i) { if (my !== ver || pend) return; pend = true; requestAnimationFrame(function () { pend = false; if (i.tex) i.tex.needsUpdate = true; if (i.dioTex) i.dioTex.needsUpdate = true; }); var a = MAPS[mapId].attr + ((nm.usedAlt || fm.usedAlt) && MAPS[mapId].alt ? ' · ' + MAPS[MAPS[mapId].alt].attr : ''); onAttr && onAttr(a + ' · Bâtiments © contributeurs OpenStreetMap'); };
        var nm = mosaic(mapId, z, XY[0], XY[1], 7, P.lat, function (i) { upd(i); });
        var fm = mosaic(mapId, z - 3, XY[0], XY[1], 7, P.lat, function (i) { upd(i); });
        far = mapPlane(fm, 0.45, -0.6, -2); near = mapPlane(nm, 0.6, -0.05, -1); info = nm;
        if (S.env) S.env.setFog(nm.size * 0.42 * s, fm.size * 0.5 * s);
        onAttr && onAttr(MAPS[mapId].attr);
        buildDiorama();
      }
      if (far) far.visible = !dioOn; if (near) near.visible = !dioOn;
      fetchBuildings(P.lat, P.lon, Math.min(info ? info.size * 0.42 : 400, 450)).then(function (els) { if (my === ver) buildBuildings(els, P, foot); }).catch(function () {});
    }
    function setDiorama(on) { dioOn = on; if (near) near.visible = !on; if (far) far.visible = !on; if (dio) dio.visible = on; if (bOut) bOut.visible = !on; }
    function clear() { ver++; rm(near); rm(far); rm(dio); rm(bIn); rm(bOut); near = far = dio = bIn = bOut = null; }
    return { load: load, setDiorama: setDiorama, clear: clear, group: geo, radius: function () { return Rd; } };
  }

  /* ---------- Les lieux (contenus/stades.js) ---------- */
  function cfg() { return window.CASA_STADES || { lieux: [{ id: 'cherbourg', nom: 'Cherbourg-en-Cotentin', lat: 49.6386, lon: -1.6164 }], equipes: {}, exacts: [] }; }
  function lieux() { var c = cfg(), perso = LS.get('cbar-lieux-perso', []); return (c.lieux || []).concat(perso); }
  function lieuById(id) { var all = lieux(); for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i]; return all[0]; }
  function resolvePlace(spec, sp) {
    var ex = (cfg().exacts || []).filter(function (e) { return e.sport === sp.id && Math.hypot((e.lat - spec.lat) * 111, (e.lon - spec.lon) * 72) < (spec.rayon || 6000) / 1000; })[0];
    var fb = { lat: spec.lat, lon: spec.lon, bearing: 0, found: false, name: '', commune: spec.nom };
    if (ex) return Promise.resolve({ lat: ex.lat, lon: ex.lon, bearing: ((ex.angle || 0) % 180) * Math.PI / 180, found: true, name: ex.nom, commune: spec.nom, len: ex.longueur, wid: ex.largeur, exact: true });
    return findVenue(sp, spec).then(function (r) { if (!r) return fb; r.found = true; r.commune = spec.nom; return r; }).catch(function () { fb.offline = true; return fb; });
  }

  /* ---------- Fiche règlement ---------- */
  function rulesHtml(id) {
    var R = (window.CASA_REGLEMENTS || {})[id], sp = SPORTS[id];
    if (!R) return '<h3>' + esc(sp ? sp.label : 'Règlement') + '</h3><p>Règlement à venir.</p>';
    var h = '<div class="cbar-lbl">Règlement · l’essentiel</div><h3>' + esc(R.titre || sp.label) + '</h3>';
    if (R.intro) h += '<p style="color:#c9d6e3;line-height:1.55;margin:0 0 .6rem">' + esc(R.intro) + '</p>';
    if (R.cles && R.cles.length) h += '<div class="cbar-keys">' + R.cles.map(function (c) { return '<div><b>' + esc(c[0]) + '</b>' + esc(c[1]) + '</div>'; }).join('') + '</div>';
    (R.sections || []).forEach(function (s) { h += '<h4>' + esc(s.titre) + '</h4><ul>' + s.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>'; });
    if (R.source) h += '<p style="font-size:12.5px;color:#9aa6b4;margin-top:1.2rem;line-height:1.5">' + esc(R.source.texte || '') + (R.source.url ? ' <a href="' + esc(R.source.url) + '" target="_blank" rel="noopener">' + esc(R.source.lien || 'Site officiel') + '</a>' : '') + '</p>';
    return h;
  }
  function showRules(id, onPick, onClose) {
    var o = el('div', { class: 'cbar-sheet', role: 'dialog', 'aria-label': 'Règlement' }), box = el('div');
    var row = el('div', { class: 'cbar-row', style: 'justify-content:space-between' });
    var pick = el('select', { 'aria-label': 'Discipline' }); Object.keys(SPORTS).forEach(function (k) { var op = el('option', { value: k }, SPORTS[k].label); if (k === id) op.selected = true; pick.appendChild(op); });
    var body = el('div');
    pick.onchange = function () { body.innerHTML = rulesHtml(pick.value); if (onPick) onPick(pick.value); };
    row.appendChild(pick); row.appendChild(btn('Fermer', function () { o.remove(); if (onClose) onClose(); }, true));
    box.appendChild(row); body.innerHTML = rulesHtml(id); box.appendChild(body); o.appendChild(box); st.root.appendChild(o);
  }

  /* ---------- Compo en AR : vrais joueurs, vrai stade, vrai lieu ---------- */
  function lineup(stage, panel, setHint, data) {
    var S = setupScene(stage, { real: true, pitch: 0.95, dist: 1.6, limits: { dmin: 0.12, dmax: 9, pmin: 0.06, pmax: 1.53 } }); var THREE = S.THREE, K = Kit(THREE);
    var saved = LS.get('cb-lineup-draft', null);
    var L = saved && saved.v === 2 ? saved : { v: 2, sport: 'football', gender: 'h', team: (saved && saved.team) || TEAMS[0], kit: saved && saved.kit != null ? saved.kit : 1, forms: {}, names: {}, pos: {}, captain: {} };
    ['map', 'amb', 'style', 'surface', 'scale'].forEach(function (k, i) { if (!L[k]) L[k] = ['photo', 'reel', 'reel', 'terre', 'agrandie'][i]; }); if (!L.ball) L.ball = {}; if (!(L.sport in SPORTS)) L.sport = 'football';
    if (data && data.sport && SPORTS[SPORT_OF[data.sport] || data.sport]) L.sport = SPORT_OF[data.sport] || data.sport;
    function save() { LS.set('cb-lineup-draft', L); }
    function base() { var x = SPORTS[L.sport] || SPORTS.football; x.id = L.sport in SPORTS ? L.sport : 'football'; return x; }
    var cur = null; // discipline + dimensions réelles du terrain retrouvé
    function sp() { return cur || base(); }
    function form() { var x = sp(); var f = L.forms[x.id]; return x.forms[f] ? f : x.def; }
    function names() { var x = sp(), F = x.forms[form()], arr = (L.names[x.id] || []).slice(0, F.length); while (arr.length < F.length) arr.push(arr.length === x.gk ? 'Gardien' : (x.id === 'athle' ? 'Athlète ' : 'Joueur ') + (arr.length + 1)); L.names[x.id] = arr; return arr; }
    function cap() { var x = sp(); return L.captain[x.id] != null ? L.captain[x.id] : Math.min(9, x.forms[form()].length - 1); }
    function teamLieu() { var e = (cfg().equipes || {})[L.team] || {}; var id = (L.lieux && L.lieux[L.team]) || e.lieu; var l = lieuById(id) || lieux()[0]; return Object.assign({}, l, e.cherche && !(L.lieux && L.lieux[L.team]) ? { cherche: e.cherche } : {}); }

    var world = new THREE.Group(); S.root.add(world);
    var env = Env(S, K); S.env = env; var geo = Geo(S, K, world);
    var W, H, u = 100, catcher = null, stad = null, tokens = [], ball = null, place = null, token = 0, dioOn = false, y0u = 0;
    var placeChip = el('div', { class: 'cbar-place' }, ''), attr = el('div', { class: 'cbar-attr' }, ''); stage.appendChild(placeChip); stage.appendChild(attr);
    function fitOf() { return sp().fit || 0.94; }
    function toPos(pct) { var f = fitOf(); return new THREE.Vector3((pct[0] / 100 - 0.5) * W * f, y0u, (pct[1] / 100 - 0.5) * H * f); }
    function fromPos(p) { var f = fitOf(); return [Math.round((p.x / (W * f) + 0.5) * 1000) / 10, Math.round((p.z / (H * f) + 0.5) * 1000) / 10]; }
    function hScale() { return L.scale === 'reelle' ? 1.75 / u : sp().h; }
    function ambience() { if (!stad) return; var s = env.apply({ mode: L.amb, lat: place ? place.lat : 49.64, lon: place ? place.lon : -1.62, bearing: place ? place.bearing : 0, lamps: stad.lamps, masts: stad.masts, indoor: stad.indoor }); renderChip(s.label); }
    function renderChip(extra) {
      var x = sp(), t;
      if (!place) t = 'Recherche du terrain réel autour de <b>' + esc(teamLieu().nom) + '</b>…';
      else if (place.found) t = '📍 <b>' + esc(place.name || (x.kind === 'salle' ? 'Salle de sport' : x.kind === 'piscine' ? 'Piscine' : 'Terrain')) + '</b> · ' + esc(place.commune || '') + '<br><span style="color:#9fb3c8">' + (place.exact ? 'Emplacement exact' : 'Terrain réel le plus proche, retrouvé sur la carte') + '</span>';
      else t = '📍 <b>' + esc(place.commune || '') + '</b><br><span style="color:#9fb3c8">' + (place.offline ? 'Carte des terrains injoignable : stade posé au centre de la commune' : 'Aucun terrain de ' + esc(x.label.toLowerCase()) + ' trouvé tout près : stade posé au centre de la commune') + '</span>';
      if (extra) t += '<br><span style="color:#c9bea7">' + esc(extra) + '</span>';
      placeChip.innerHTML = t;
    }
    function buildField() {
      var b = base(); cur = Object.assign({}, b);
      if (place && place.found && b.adapt && place.len && place.wid) { cur.len = Math.max(90, Math.min(110, Math.round(place.len - 2 * b.mg))); cur.wid = Math.max(50, Math.min(75, Math.round(place.wid - 2 * b.mg))); }
      if (stad) { world.remove(stad.group); dispose(stad.group); }
      u = cur.len / 1.05; H = 1.05; W = H * cur.wid / cur.len; world.scale.setScalar(1 / u);
      stad = buildStadium(K, cur, { style: L.style, surface: L.surface, kit: KITS[L.kit], title: (L.team || 'CASA BESPORTS').toUpperCase(), osm: place && place.found && (cur.kind === 'salle' || cur.kind === 'piscine') ? { len: place.len, wid: place.wid } : null });
      world.add(stad.group); y0u = stad.y0 / u;
      // en mode caméra, l'image réelle (table, sol) devient la plateforme : une ombre douce y pose le terrain
      if (catcher) { world.remove(catcher); dispose(catcher); }
      catcher = new THREE.Mesh(new THREE.PlaneGeometry(stad.extent * 2.4, stad.extent * 2.4), new THREE.ShadowMaterial({ opacity: 0.4, depthWrite: false }));
      catcher.rotation.x = -Math.PI / 2; catcher.position.y = 0.005; catcher.receiveShadow = true; catcher.visible = dioOn; world.add(catcher);
      env.setExtent(stad.extent / u);
      S.view.dist = cur.kind === 'stade' ? 1.55 : cur.kind === 'tennis' ? 1.6 : 1.85; S.placeCam();
      ambience();
    }
    function loadMap() { if (!place) return; geo.load(place, sp(), L.map, stad.foot, function (a) { attr.textContent = a; }); geo.group.visible = !dioOn; }
    function locate() {
      var my = ++token, b = base(), spec = teamLieu(); place = null; renderChip(); geo.clear(); attr.textContent = '';
      resolvePlace(spec, b).then(function (P) { if (my !== token) return; place = P; buildField(); build(); loadMap(); });
    }
    function build() {
      tokens.forEach(function (t) { S.root.remove(t.g); dispose(t.g); }); tokens = [];
      var x = sp(), kit = KITS[L.kit], F = (L.pos[x.id] && L.pos[x.id].length === x.forms[form()].length) ? L.pos[x.id] : x.forms[form()], N = names(), C = cap(), hs = hScale();
      F.forEach(function (pct, i) {
        var gk = i === x.gk, lib = i === x.libero;
        var gender = L.gender === 'mixte' ? (i % 2 ? 'f' : 'h') : L.gender;
        var fig = buildPlayer(K, { gender: gender, skin: SKINS[(i * 3 + 1) % SKINS.length], hair: HAIRS[(i * 5 + 2) % HAIRS.length], style: i,
          shirt: gk ? (x.pool ? kit[1] : '#c6e03a') : lib ? kit[2] : kit[1], shorts: x.id === 'basket' ? kit[1] : (gk ? '#222222' : lerpCol(kit[1], '#000000', 0.35)), sock: gk ? '#222222' : kit[1], trim: kit[2],
          captain: i === C, swim: !!x.pool, cap: x.pool ? (gk ? '#d0473e' : kit[1]) : null, gear: x.id === 'roller' ? 'roller' : x.id === 'tennis' ? 'tennis' : x.id === 'athle' ? 'athle' : null });
        fig.scale.setScalar(hs); fig.rotation.y = Math.PI;
        var grp = new THREE.Group(); grp.add(fig); grp.position.copy(toPos(pct));
        var ring = new THREE.Mesh(new THREE.RingGeometry(hs * 0.22, hs * 0.3, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(kit[2]).convertSRGBToLinear(), transparent: true, opacity: 0.85, depthWrite: false })); ring.position.y = 0.0015; grp.add(ring);
        var spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFromCanvas(THREE, labelCanvas(i + 1, N[i] + (i === C ? ' (C)' : ''), kit), true), depthTest: false }));
        spr.scale.set(0.12, 0.06, 1); spr.position.y = hs * (x.pool ? 0.85 : 1.1) + 0.03; grp.add(spr);
        grp.userData.index = i; S.root.add(grp); tokens.push({ g: grp });
      });
      ball = buildBall(K, x.ball); var bs = Math.max(1, hs * u / 1.75) * 1.25 / u; ball.scale.setScalar(bs);
      var bp = L.ball[x.id] || x.ballAt || [50, 50]; ball.position.copy(toPos(bp)); ball.userData.index = 'ball'; S.root.add(ball); tokens.push({ g: ball });
    }
    buildField(); build(); locate();
    var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), drag = null;
    function ndc(e) { var r = stage.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
    function pick(e) { ray.setFromCamera(ndc(e), S.camera); var hits = ray.intersectObjects(tokens.map(function (t) { return t.g; }), true); if (!hits.length) return null; var o = hits[0].object; while (o && o.userData.index == null) o = o.parent; return o; }
    stage.addEventListener('pointerdown', function (e) { var o = pick(e); if (o) { drag = o; stage.setPointerCapture(e.pointerId); setHint(o.userData.index === 'ball' ? 'Déplacez ' + (BALLS[sp().ball] || {}).label.toLowerCase() : 'Déplacez ' + names()[o.userData.index]); } });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return; plane.constant = -y0u * S.root.scale.y - S.root.position.y; ray.setFromCamera(ndc(e), S.camera); var p = new THREE.Vector3(); if (!ray.ray.intersectPlane(plane, p)) return; S.root.worldToLocal(p);
      var mx = W / 2 + (drag.userData.index === 'ball' ? sp().mg / u : 0), mz = H / 2 + (drag.userData.index === 'ball' ? sp().mg / u : 0);
      p.x = Math.max(-mx, Math.min(mx, p.x)); p.z = Math.max(-mz, Math.min(mz, p.z)); drag.position.set(p.x, y0u, p.z);
    });
    stage.addEventListener('pointerup', function () {
      if (!drag) return; var x = sp();
      if (drag.userData.index === 'ball') { L.ball[x.id] = fromPos(drag.position); bounce(drag); }
      else { var F = ((L.pos[x.id] && L.pos[x.id].length === x.forms[form()].length) ? L.pos[x.id] : x.forms[form()]).slice(); F[drag.userData.index] = fromPos(drag.position); L.pos[x.id] = F; }
      save(); drag = null; setHint('Faites glisser un joueur ou le ballon · deux doigts pour zoomer');
    });
    var bounceT = null; function bounce(g) { bounceT = { g: g, t0: performance.now() }; }
    orbitControls(S, stage, function (e) { return !!pick(e); });
    S.tick = function (t) {
      env.tick(); if (stad) stad.ticks.forEach(function (f) { f(t); });
      if (bounceT) { var k = (performance.now() - bounceT.t0) / 700; if (k > 1) { bounceT.g.position.y = y0u; bounceT = null; } else bounceT.g.position.y = y0u + Math.abs(Math.sin(k * Math.PI * 2.5)) * (1 - k) * 0.03; }
    };
    S.onCamera = function (on) { dioOn = on; geo.group.visible = !on; env.setDiorama(on); if (catcher) catcher.visible = on; setHint(on ? 'Le terrain est posé sur ce que filme votre caméra' : 'Faites glisser un joueur ou le ballon · deux doigts pour zoomer'); };
    function sel(label, opts, cur0, fn) { var s = el('select', { 'aria-label': label, title: label }); opts.forEach(function (o) { var op = el('option', { value: o[0] }, o[1]); if (String(o[0]) === String(cur0)) op.selected = true; s.appendChild(op); }); s.onchange = function () { fn(s.value); }; return s; }
    function compoText(sep) { var x = sp(), N = names(), C = cap(); return L.team + ' · ' + x.label + ' (' + form() + ')' + sep + N.map(function (n, i) { return (sep === '\n' ? (i + 1) + '. ' : '') + n + (i === C ? ' (C)' : ''); }).join(sep === '\n' ? '\n' : ', '); }
    function setView(p, d, y) { S.view.pitch = p; S.view.dist = d; if (y != null) S.view.yaw = y; S.placeCam(); }
    function addPlace() {
      var q = window.prompt('Nom de la commune (en France) :'); if (!q) return;
      fetch('https://geo.api.gouv.fr/communes?nom=' + encodeURIComponent(q) + '&fields=nom,centre,codeDepartement&boost=population&limit=1').then(function (r) { return r.json(); }).then(function (a) {
        if (!a || !a[0] || !a[0].centre) { toast('Commune introuvable'); return; }
        var c = a[0], id = 'perso-' + hash(c.nom + c.codeDepartement), all = LS.get('cbar-lieux-perso', []).filter(function (l) { return l.id !== id; });
        all.unshift({ id: id, nom: c.nom + ' (' + c.codeDepartement + ')', lat: c.centre.coordinates[1], lon: c.centre.coordinates[0] }); LS.set('cbar-lieux-perso', all.slice(0, 12));
        L.lieux = L.lieux || {}; L.lieux[L.team] = id; save(); renderPanel(); locate();
      }).catch(function () { toast('Recherche indisponible hors connexion'); });
    }
    function myPosition() {
      if (!navigator.geolocation) { toast('Position indisponible'); return; }
      navigator.geolocation.getCurrentPosition(function (p) { var all = LS.get('cbar-lieux-perso', []).filter(function (l) { return l.id !== 'ma-position'; }); all.unshift({ id: 'ma-position', nom: 'Autour de moi', lat: p.coords.latitude, lon: p.coords.longitude, rayon: 4000 }); LS.set('cbar-lieux-perso', all); L.lieux = L.lieux || {}; L.lieux[L.team] = 'ma-position'; save(); renderPanel(); locate(); }, function () { toast('Position refusée'); }, { enableHighAccuracy: false, timeout: 10000 });
    }
    function renderPanel() {
      panel.innerHTML = '';
      var x = sp();
      var r1 = el('div', { class: 'cbar-row' });
      r1.appendChild(sel('Discipline', Object.keys(SPORTS).map(function (k) { return [k, SPORTS[k].label]; }), L.sport, function (v) { L.sport = v; save(); cur = null; place = null; buildField(); build(); renderPanel(); locate(); }));
      r1.appendChild(sel('Joueurs', [['h', 'Joueurs'], ['f', 'Joueuses'], ['mixte', 'Mixte']], L.gender, function (v) { L.gender = v; save(); build(); }));
      r1.appendChild(sel('Équipe', TEAMS.map(function (t) { return [t, t]; }), L.team, function (v) { L.team = v; save(); buildField(); renderPanel(); locate(); }));
      if (Object.keys(x.forms).length > 1) r1.appendChild(sel('Système de jeu', Object.keys(x.forms).map(function (f) { return [f, f]; }), form(), function (v) { L.forms[x.id] = v; L.pos[x.id] = null; save(); build(); renderPanel(); }));
      r1.appendChild(sel('Maillot', KITS.map(function (k, i) { return [i, 'Maillot ' + k[0]]; }), L.kit, function (v) { L.kit = +v; save(); build(); if (x.kind === 'stade') buildField(); }));
      panel.appendChild(r1);
      var r3 = el('div', { class: 'cbar-row' }); r3.appendChild(el('div', { class: 'cbar-lbl' }, 'Le lieu et le décor'));
      var cl = teamLieu(), lopts = lieux().map(function (l) { return [l.id, l.nom]; }).concat([['+pos', '📍 Autour de moi…'], ['+cherche', '🔎 Autre commune…']]);
      r3.appendChild(sel('Lieu', lopts, cl.id, function (v) { if (v === '+pos') return myPosition(); if (v === '+cherche') return addPlace(); L.lieux = L.lieux || {}; L.lieux[L.team] = v; save(); locate(); }));
      r3.appendChild(sel('Carte', Object.keys(MAPS).filter(function (k) { return !MAPS[k].hidden; }).map(function (k) { return [k, MAPS[k].label]; }), L.map, function (v) { L.map = v; save(); loadMap(); }));
      r3.appendChild(sel('Ambiance', [['reel', 'Heure réelle'], ['jour', 'Plein jour'], ['couchant', 'Coucher de soleil'], ['nuit', 'Nocturne']], L.amb, function (v) { L.amb = v; save(); ambience(); }));
      if (x.kind === 'stade') r3.appendChild(sel('Stade', [['reel', 'Stade de club (comme en vrai)'], ['grand', 'Grand stade 4 tribunes']], L.style, function (v) { L.style = v; save(); buildField(); loadMap(); }));
      if (x.id === 'tennis') r3.appendChild(sel('Surface', Object.keys(TENNIS_SURF).map(function (k) { return [k, TENNIS_SURF[k]]; }), L.surface, function (v) { L.surface = v; save(); buildField(); }));
      r3.appendChild(sel('Taille des joueurs', [['agrandie', 'Joueurs agrandis (lisibles)'], ['reelle', 'Taille réelle']], L.scale, function (v) { L.scale = v; save(); build(); }));
      panel.appendChild(r3);
      var r4 = el('div', { class: 'cbar-row' });
      r4.appendChild(btn('📖 Règlement', function () { showRules(x.id); }, true));
      r4.appendChild(btn('Vue tribune', function () { setView(0.26, x.kind === 'stade' ? (L.style === 'grand' ? 0.62 : 0.9) : 1.1); }));
      r4.appendChild(btn('Vue d’ensemble', function () { setView(0.95, 1.6); }));
      r4.appendChild(btn('Vue d’oiseau', function () { setView(1.5, x.kind === 'stade' ? 4.2 : 3.4, 0); }));
      r4.appendChild(btn((x.ball === 'palet' ? 'Palet' : x.ball === 'poids' ? 'Poids' : x.ball === 'tennis' ? 'Balle' : 'Ballon') + ' au centre', function () { L.ball[x.id] = null; save(); ball.position.copy(toPos(x.ballAt || [50, 50])); bounce(ball); }));
      panel.appendChild(r4);
      var grid = el('div', { class: 'cbar-grid' }), P = x.postes[form()], N = names(), C = cap();
      N.forEach(function (n, i) {
        var lab = el('label', null, '<span style="min-width:2.6em">' + (i + 1) + ' · ' + esc(P[i]) + '</span>');
        var inp = el('input', { value: n, 'aria-label': 'Joueur ' + (i + 1) }); inp.onchange = function () { names()[i] = inp.value.slice(0, 18) || ('Joueur ' + (i + 1)); save(); build(); };
        var cb = el('button', { type: 'button', title: 'Capitaine', 'aria-label': 'Nommer capitaine', class: 'cbar-btn', style: 'min-height:36px;padding:0 .5rem', 'aria-pressed': String(i === C), onclick: function () { L.captain[x.id] = i; save(); build(); renderPanel(); } }, 'C');
        lab.appendChild(inp); lab.appendChild(cb); grid.appendChild(lab);
      });
      panel.appendChild(grid);
      var r2 = el('div', { class: 'cbar-row', style: 'margin-top:.6rem' });
      r2.appendChild(btn('Enregistrer', function () { var all = LS.get('cb-lineups', []); all.unshift({ at: new Date().toISOString(), sport: x.id, team: L.team, formation: form(), names: names().slice(), captain: cap() }); LS.set('cb-lineups', all.slice(0, 20)); toast('Compo enregistrée'); }, true));
      r2.appendChild(btn('Proposer au Club House', function () {
        var ch = LS.get('cb-clubhouse', null); var txt = 'Ma compo : ' + compoText(' : ') + '. Vous validez ?';
        if (ch && ch.posts) { ch.posts.unshift({ id: 'ar' + Date.now(), author: 'Vous', room: x.label, time: 'à l’instant', text: txt, likes: 0, liked: false, comments: [], mine: true }); LS.set('cb-clubhouse', ch); toast('Compo publiée au Club House'); }
        else { LS.set('cb-lineup-pending', txt); toast('Compo prête : ouvrez le Club House pour la publier'); }
      }));
      r2.appendChild(btn('Photo', function () { snapshot(S); }));
      r2.appendChild(btn('Partager', function () { var txt = compoText('\n') + '\n#CasaBesports'; if (navigator.share) navigator.share({ title: 'Ma compo Casa Besports', text: txt }).catch(function () {}); else { try { navigator.clipboard.writeText(txt); toast('Compo copiée'); } catch (e) {} } }));
      r2.appendChild(btn('Réinitialiser', function () { L.pos[x.id] = null; L.ball[x.id] = null; save(); build(); }));
      panel.appendChild(r2);
    }
    renderPanel();
    return S;
  }
  /* ---------- Tableau d'affichage AR ---------- */
  function scoreboard(stage, panel, setHint, data) {
    var S = setupScene(stage, { pitch: 0.25, dist: 2.1 }); var THREE = S.THREE; S.root.position.y = -0.25;
    var m = (data && data.score) || { home: 'Domicile', away: 'Extérieur', hs: '0', as: '0', minute: '' };
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512; var tex = texFromCanvas(THREE, c);
    function draw() {
      var g = c.getContext('2d'); g.clearRect(0, 0, 1024, 512);
      g.fillStyle = '#0b1520'; roundRect(g, 10, 10, 1004, 492, 40); g.fill(); g.strokeStyle = '#e8a830'; g.lineWidth = 8; g.stroke();
      g.fillStyle = '#e8a830'; g.font = '700 40px "Barlow Condensed", sans-serif'; g.textAlign = 'center'; g.fillText((m.label || 'LE DIRECT') + (m.minute ? ' · ' + m.minute : ''), 512, 80);
      g.fillStyle = '#f6f0e1'; g.font = '700 46px Mulish, sans-serif'; g.fillText(m.home.slice(0, 18), 256, 200); g.fillText(m.away.slice(0, 18), 768, 200);
      g.font = '900 170px Mulish, sans-serif'; g.fillText(String(m.hs), 256, 390); g.fillText(String(m.as), 768, 390);
      g.fillStyle = '#e8a830'; g.fillRect(500, 300, 24, 12);
      g.fillStyle = '#9aa6b4'; g.font = '600 30px Mulish, sans-serif'; g.fillText('casabesports.fr', 512, 470);
      tex.needsUpdate = true;
    }
    draw();
    var board = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })); board.position.y = 0.3; S.root.add(board);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x9aa6b4 })); pole.position.y = 0.05; S.root.add(pole);
    S.tick = function (t) { board.rotation.y = Math.sin(t / 2400) * 0.15; };
    orbitControls(S, stage);
    panel.innerHTML = '';
    var r = el('div', { class: 'cbar-row' });
    r.appendChild(btn('But ' + m.home.split(' ').slice(-1)[0], function () { m.hs = +m.hs + 1; draw(); toast('BUUUT !'); }, true));
    r.appendChild(btn('But ' + m.away.split(' ').slice(-1)[0], function () { m.as = +m.as + 1; draw(); toast('BUUUT !'); }, true));
    r.appendChild(btn('Photo', function () { snapshot(S); }));
    panel.appendChild(r);
    panel.appendChild(el('div', { style: 'font-size:12.5px;color:#9aa6b4' }, 'Score issu du Terrain au moment de l’ouverture. Les boutons « But » servent à rejouer le match avec vos amis.'));
    return S;
  }

  /* ---------- Phare de Gatteville 3D ---------- */
  function lighthouse(stage, panel) {
    var S = setupScene(stage, { pitch: 0.4, dist: 2.4 }); var THREE = S.THREE; S.root.position.y = -0.45;
    var rock = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.08, 9), new THREE.MeshStandardMaterial({ color: 0x5b6470, flatShading: true })); rock.position.y = 0.04; S.root.add(rock);
    var sea = new THREE.Mesh(new THREE.CircleGeometry(0.7, 48), new THREE.MeshStandardMaterial({ color: 0x1f4f6e, transparent: true, opacity: 0.85 })); sea.rotation.x = -Math.PI / 2; sea.position.y = 0.01; S.root.add(sea);
    var tower = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, 0.75, 32), new THREE.MeshStandardMaterial({ color: 0x9a9ea3, roughness: 0.95 })); tower.position.y = 0.455; S.root.add(tower);
    for (var i = 1; i < 6; i++) { var ring = new THREE.Mesh(new THREE.TorusGeometry(0.1 - i * 0.008, 0.004, 6, 32), new THREE.MeshStandardMaterial({ color: 0x7d8288 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.08 + i * 0.125; S.root.add(ring); }
    var gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.025, 24), new THREE.MeshStandardMaterial({ color: 0x2b2f33 })); gallery.position.y = 0.84; S.root.add(gallery);
    var lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 16), new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffd36b, emissiveIntensity: 1 })); lantern.position.y = 0.885; S.root.add(lantern);
    var dome = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x0f2236 })); dome.position.y = 0.92; S.root.add(dome);
    var beams = new THREE.Group(); beams.position.y = 0.885; S.root.add(beams);
    [0, Math.PI].forEach(function (a) { var b = new THREE.Mesh(new THREE.ConeGeometry(0.09, 1.2, 24, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false })); b.rotation.z = Math.PI / 2; b.position.x = 0.6; var h = new THREE.Group(); h.rotation.y = a; h.add(b); beams.add(h); });
    S.tick = function (t) { beams.rotation.y = t / 900; };
    orbitControls(S, stage);
    panel.innerHTML = '<div style="font-family:Cormorant Garamond,Georgia,serif;font-size:22px;font-weight:700">Phare de Gatteville · 75 m</div><div style="font-size:13.5px;color:#c9d6e3;line-height:1.5;margin-top:.3rem">Allumé en 1835 à la pointe de Barfleur, deuxième plus haut phare de France. Au large, la Blanche-Nef sombra en 1120. Maquette 3D stylisée.</div>';
    return S;
  }

  /* ---------- Photo supporter (cadre) ---------- */
  function photo(stage, panel) {
    var frame = el('div', { style: 'position:absolute;inset:0;pointer-events:none;z-index:1' });
    frame.innerHTML = '<div style="position:absolute;left:0;right:0;bottom:0;height:22%;background:repeating-linear-gradient(90deg,#0f2236 0 60px,#e8a830 60px 120px);opacity:.92;display:flex;align-items:center;justify-content:center"><span style="background:#0f2236;color:#f6f0e1;padding:.4rem 1rem;font:700 20px Barlow Condensed,sans-serif;letter-spacing:.2em">CASA BESPORTS · COTENTIN</span></div><div style="position:absolute;top:12px;right:12px;background:#e8a830;color:#0f2236;border-radius:999px;padding:.4rem .8rem;font:900 16px Mulish,sans-serif">SUPPORTER</div>';
    stage.appendChild(frame);
    var facing = 'user';
    function go() { if (st.stream) { st.stream.getTracks().forEach(function (t) { t.stop(); }); if (st.video) st.video.remove(); } startCamera(stage, facing).catch(function () { stage.insertBefore(el('div', { style: 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem;color:#c9d6e3' }, 'Caméra indisponible : autorisez l’accès à la caméra ou ouvrez l’application sur votre téléphone.'), stage.firstChild); }); }
    go();
    panel.innerHTML = '';
    var r = el('div', { class: 'cbar-row' });
    r.appendChild(btn('Prendre la photo', function () {
      var v = st.video; if (!v) { toast('Caméra indisponible'); return; }
      var c = document.createElement('canvas'); c.width = v.videoWidth || 720; c.height = v.videoHeight || 960; var g = c.getContext('2d');
      if (facing === 'user') { g.translate(c.width, 0); g.scale(-1, 1); } g.drawImage(v, 0, 0, c.width, c.height); g.setTransform(1, 0, 0, 1, 0, 0);
      var bh = c.height * 0.22; for (var x = 0; x < c.width; x += 120) { g.fillStyle = '#0f2236'; g.fillRect(x, c.height - bh, 60, bh); g.fillStyle = '#e8a830'; g.fillRect(x + 60, c.height - bh, 60, bh); }
      g.fillStyle = '#0f2236'; g.fillRect(c.width * 0.15, c.height - bh * 0.68, c.width * 0.7, bh * 0.36); g.fillStyle = '#f6f0e1'; g.font = '700 ' + Math.round(bh * 0.2) + 'px Barlow Condensed, sans-serif'; g.textAlign = 'center'; g.fillText('CASA BESPORTS · COTENTIN', c.width / 2, c.height - bh * 0.43);
      showShot(c.toDataURL('image/jpeg', 0.9));
    }, true));
    r.appendChild(btn('Changer de caméra', function () { facing = facing === 'user' ? 'environment' : 'user'; go(); }));
    panel.appendChild(r);
    return null;
  }

  function snapshot(S) {
    var c = document.createElement('canvas'); var gl = S.renderer.domElement; c.width = gl.width; c.height = gl.height; var g = c.getContext('2d');
    if (st.video && st.video.videoWidth) { var v = st.video, r = Math.max(c.width / v.videoWidth, c.height / v.videoHeight); var w = v.videoWidth * r, h = v.videoHeight * r; g.drawImage(v, (c.width - w) / 2, (c.height - h) / 2, w, h); }
    else { var grd = g.createLinearGradient(0, 0, 0, c.height); grd.addColorStop(0, '#0b1520'); grd.addColorStop(1, '#1b2a3c'); g.fillStyle = grd; g.fillRect(0, 0, c.width, c.height); }
    S.renderer.render(S.scene, S.camera); g.drawImage(gl, 0, 0);
    g.fillStyle = 'rgba(5,9,15,.75)'; g.fillRect(0, c.height - 70, c.width, 70); g.fillStyle = '#e8a830'; g.font = '700 30px Barlow Condensed, sans-serif'; g.textAlign = 'center'; g.fillText('CASA BESPORTS', c.width / 2, c.height - 25);
    showShot(c.toDataURL('image/jpeg', 0.9));
  }
  function showShot(url) {
    var o = el('div', { class: 'cbar-shot', role: 'dialog', 'aria-label': 'Photo' });
    o.appendChild(el('img', { src: url, alt: 'Votre photo Casa Besports' }));
    o.appendChild(el('div', { style: 'font-size:13px;color:#c9d6e3;text-align:center' }, 'Appui long sur l’image pour l’enregistrer.'));
    var row = el('div', { class: 'cbar-row' });
    row.appendChild(btn('Partager', function () {
      fetch(url).then(function (r) { return r.blob(); }).then(function (b) { var f = new File([b], 'casabesports.jpg', { type: 'image/jpeg' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: 'Casa Besports' }).catch(function () {}); else { var a = el('a', { href: url, download: 'casabesports.jpg' }); document.body.appendChild(a); a.click(); a.remove(); } });
    }, true));
    row.appendChild(btn('Fermer', function () { o.remove(); }));
    o.appendChild(row); st.root.appendChild(o);
  }

  /* ---------- WebXR (Android) ---------- */
  function tryWebXR(S, stage, setHint) {
    if (!navigator.xr || !navigator.xr.isSessionSupported) return Promise.resolve(false);
    return navigator.xr.isSessionSupported('immersive-ar').then(function (ok) {
      if (!ok) return false;
      var b = btn('Placer sur une surface (AR)', function () {
        navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'], optionalFeatures: ['dom-overlay'], domOverlay: { root: st.root } }).then(function (session) {
          var THREE = S.THREE; S.renderer.xr.enabled = true; S.renderer.xr.setReferenceSpaceType('local'); S.renderer.xr.setSession(session); st.xr = session;
          S.root.visible = false; S.root.scale.setScalar(0.6); if (S.onCamera) S.onCamera(true);
          var reticle = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.08, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xe8a830, fog: false })); reticle.matrixAutoUpdate = false; reticle.visible = false; S.scene.add(reticle);
          var hitSource = null;
          session.requestReferenceSpace('viewer').then(function (vs) { return session.requestHitTestSource({ space: vs }); }).then(function (src) { hitSource = src; });
          session.addEventListener('select', function () { if (reticle.visible) { S.root.position.setFromMatrixPosition(reticle.matrix); S.root.visible = true; setHint('Compo posée ! Touchez ailleurs pour la déplacer'); } });
          session.addEventListener('end', function () { S.renderer.setAnimationLoop(null); st.xr = null; S.root.visible = true; S.root.scale.setScalar(1); S.root.position.set(0, 0, 0); reticle.visible = false; if (S.onCamera) S.onCamera(!!st.video); loop(S); });
          setHint('Visez une table ou le sol, puis touchez l’écran');
          S.renderer.setAnimationLoop(function (t, frame) {
            if (frame && hitSource) { var ref = S.renderer.xr.getReferenceSpace(); var hits = frame.getHitTestResults(hitSource); if (hits.length) { var pose = hits[0].getPose(ref); reticle.visible = true; reticle.matrix.fromArray(pose.transform.matrix); } else reticle.visible = false; }
            if (S.tick) S.tick(t); S.renderer.render(S.scene, S.camera);
          });
        }).catch(function () { toast('Réalité augmentée indisponible sur cet appareil'); });
      }, true, 'position:absolute;right:12px;top:56px;z-index:3');
      stage.appendChild(b); return true;
    }).catch(function () { return false; });
  }

  function loop(S) { (function f(t) { if (!st || st.S !== S || st.xr) return; if (S.tick) S.tick(t || 0); S.renderer.render(S.scene, S.camera); st.raf = requestAnimationFrame(f); })(); }

  /* ---------- Ouverture / fermeture ---------- */
  var TITLES = { hub: 'Expériences immersives', lineup: 'Ma compo en réalité augmentée', regles: 'Règlements des disciplines', score: 'Tableau d’affichage AR', phare: 'Le phare de Gatteville en 3D', photo: 'Photo supporter' };
  function close() {
    if (!st) return; try { if (st.xr) st.xr.end(); } catch (e) {} cancelAnimationFrame(st.raf);
    if (st.stream) st.stream.getTracks().forEach(function (t) { t.stop(); });
    if (st.stopGyro) st.stopGyro(); if (st.S) { window.removeEventListener('resize', st.S.resize); st.S.renderer.dispose(); }
    st.root.remove(); document.documentElement.style.overflow = ''; st = null;
  }
  function open(mode, data) {
    injectCss(); if (st) close();
    mode = TITLES[mode] ? mode : 'hub';
    var root = el('div', { id: 'cbar', role: 'dialog', 'aria-label': TITLES[mode] });
    st = { root: root, mode: mode };
    document.documentElement.style.overflow = 'hidden';
    var top = el('div', { class: 'cbar-top' });
    if (mode !== 'hub') top.appendChild(el('button', { type: 'button', class: 'cbar-close', 'aria-label': 'Retour', onclick: function () { open('hub', data); } }, '‹'));
    top.appendChild(el('div', { class: 'cbar-title' }, TITLES[mode]));
    top.appendChild(el('button', { type: 'button', class: 'cbar-close', 'aria-label': 'Fermer', onclick: close }, '×'));
    root.appendChild(top); document.body.appendChild(root);
    if (mode === 'hub') {
      var hub = el('div', { class: 'cbar-hub' });
      [['lineup', 'Réalité augmentée', 'Ma compo en AR', 'Football, rugby, basket, hand, volley, water-polo, tennis, roller hockey ou athlétisme : votre équipe sur le vrai terrain, à son vrai emplacement, au milieu des photos aériennes et des bâtiments du quartier. Avec le ballon et le règlement.'],
       ['regles', 'Règlements', 'Les règles de chaque sport', 'L’essentiel du règlement de nos neuf disciplines : effectifs, durée, dimensions, points, fautes.'],
       ['score', 'Réalité augmentée', 'Tableau d’affichage', 'Le score du direct flotte dans votre salon. Photo à partager avec la tribune.'],
       ['phare', '3D', 'Phare de Gatteville', 'Le géant de granit de la pointe de Barfleur, et son faisceau qui balaie la mer.'],
       ['photo', 'Caméra', 'Photo supporter', 'Selfie avec écharpe Casa Besports, prêt pour vos réseaux.']].forEach(function (x) {
        hub.appendChild(el('button', { type: 'button', class: 'cbar-card', onclick: function () { open(x[0], data); } }, '<i>' + x[1] + '</i><b>' + x[2] + '</b><span>' + x[3] + '</span>'));
      });
      root.appendChild(hub);
      root.appendChild(el('div', { style: 'padding:0 1rem 1rem;font-size:12.5px;color:#9aa6b4' }, 'Réalité augmentée complète (pose sur une surface) : Chrome sur Android compatible ARCore. Sur iPhone et ailleurs : caméra + 3D, ou 3D seule. Cartes : photos aériennes et plan IGN (Géoplateforme), bâtiments et terrains OpenStreetMap.'));
      return;
    }
    if (mode === 'regles') { var pageR = el('div', { class: 'cbar-hub', style: 'display:block' }); root.appendChild(pageR); var sid = (data && SPORT_OF[data.sport]) || 'football'; showRules(sid, null, function () { open('hub', data); }); return; }
    var stage = el('div', { class: 'cbar-stage' }); root.appendChild(stage);
    var hint = el('div', { class: 'cbar-hint' }, ''); stage.appendChild(hint);
    function setHint(t) { hint.textContent = t; hint.style.display = t ? '' : 'none'; }
    var panel = el('div', { class: 'cbar-panel' }); root.appendChild(panel);
    if (mode === 'photo') { photo(stage, panel); setHint('Cadrez-vous, puis « Prendre la photo »'); return; }
    if (!window.THREE) { setHint('Moteur 3D indisponible'); return; }
    var S = mode === 'lineup' ? lineup(stage, panel, setHint, data) : mode === 'score' ? scoreboard(stage, panel, setHint, data) : lighthouse(stage, panel);
    st.S = S; loop(S);
    setHint(mode === 'lineup' ? 'Faites glisser un joueur ou le ballon · deux doigts pour zoomer' : 'Faites glisser pour tourner autour');
    // barre de modes : caméra / 3D / AR
    var modes = el('div', { class: 'cbar-row', style: 'position:absolute;left:12px;top:56px;z-index:3' });
    var bCam = btn('Caméra', function () {
      if (st.video) { st.stream.getTracks().forEach(function (t) { t.stop(); }); st.video.remove(); st.video = null; st.stream = null; if (st.stopGyro) st.stopGyro(); st.stopGyro = null; bCam.setAttribute('aria-pressed', 'false'); if (S.onCamera) S.onCamera(false); return; }
      startCamera(stage, 'environment').then(function () { bCam.setAttribute('aria-pressed', 'true'); if (S.onCamera) S.onCamera(true); st.stopGyro = gyro(S); setHint('Inclinez le téléphone pour regarder autour'); }).catch(function () { toast('Caméra indisponible ici : mode 3D'); });
    });
    bCam.setAttribute('aria-pressed', 'false'); modes.appendChild(bCam); stage.appendChild(modes);
    tryWebXR(S, stage, setHint);
  }
  window.CasaAR = { open: open, close: close, available: function () { return !!window.THREE; }, diorama: function (on) { if (st && st.S && st.S.onCamera) st.S.onCamera(!!on); } };
})();
