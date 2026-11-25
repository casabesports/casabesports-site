/* Casa Besports — piloter la 3D avec la main devant la caméra (sans toucher l'écran).
   Suivi de la main : MediaPipe Hand Landmarker (Google, Apache 2.0), hébergé sur le site (js/vendor/mediapipe-0.10.21/).
   Tout est calculé sur l'appareil : aucune image de la caméra ne quitte le téléphone.
   Utilisé par js/realite-augmentee.js (Ma compo AR) :
     CasaMain.start({ stage, video, mirror, onHands, onStatus }) → Promise
     CasaMain.setVideo(video, mirror) · CasaMain.stop() · CasaMain.active() · CasaMain.roomLight(video)
   onHands(hands) reçoit à chaque image : [{ id, pts:[{x,y}] (pixels de la scène), pinch, x, y (bout de l'index ou point de pince), size (taille de la paume en px) }] */
(function () {
  'use strict';
  var BASE = '/js/vendor/mediapipe-0.10.21/';
  var NOSIMD = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm/';
  var BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]];
  var PALM = [0, 1, 2, 5, 9, 13, 17];
  var IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var mp = null, lm = null, cpu = false;
  var S = null; // état de la session en cours

  function dynImport(u) { return (new Function('u', 'return import(u)'))(u); }
  function create(m, files, delegate) {
    return m.HandLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: BASE + 'hand_landmarker.task', delegate: delegate },
      runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: 0.55, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5
    });
  }
  function load() {
    if (mp) return mp;
    mp = dynImport(BASE + 'vision_bundle.mjs').then(function (m) {
      return m.FilesetResolver.isSimdSupported().then(function (simd) {
        var files = simd ? { wasmLoaderPath: BASE + 'vision_wasm_internal.js', wasmBinaryPath: BASE + 'vision_wasm_internal.wasm' }
          : { wasmLoaderPath: NOSIMD + 'vision_wasm_nosimd_internal.js', wasmBinaryPath: NOSIMD + 'vision_wasm_nosimd_internal.wasm' };
        // iPhone : le calcul sur le processeur est le plus fiable ; ailleurs on essaie d'abord la carte graphique
        var first = IOS ? 'CPU' : 'GPU';
        return create(m, files, first).then(function (h) { cpu = first === 'CPU'; return h; }, function () { cpu = true; return create(m, files, 'CPU'); })
          .then(function (h) { lm = h; h._m = m; h._files = files; return h; });
      });
    });
    mp.catch(function () { mp = null; });
    return mp;
  }

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function css() {
    if (document.getElementById('cbmain-css')) return;
    var s = el('style'); s.id = 'cbmain-css';
    s.textContent = '#cbar canvas.cbmain{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1}';
    document.head.appendChild(s);
  }

  // passage des coordonnées de l'image caméra (0..1) aux pixels de la scène (vidéo en « cover », miroir pour la caméra avant)
  function mapper() {
    var v = S.video, w = S.stage.clientWidth, h = S.stage.clientHeight, vw = v.videoWidth || w, vh = v.videoHeight || h;
    var r = Math.max(w / vw, h / vh), ox = (w - vw * r) / 2, oy = (h - vh * r) / 2;
    return { w: w, h: h, r: r, ox: ox, oy: oy, vw: vw, vh: vh, f: function (p) { return { x: ox + (S.mirror ? 1 - p.x : p.x) * vw * r, y: oy + p.y * vh * r }; } };
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function process(res, now) {
    var M = mapper(), out = [], seen = {};
    (res && res.landmarks || []).forEach(function (L, i) {
      var cat = res.handednesses && res.handednesses[i] && res.handednesses[i][0], id = (cat && cat.categoryName) || ('m' + i);
      if (seen[id]) id += i; seen[id] = 1;
      var raw = L.map(M.f), prev = S.prev[id];
      // lissage : la main tremble moins, sans retard visible (plus de lissage quand elle bouge peu)
      var pts = raw.map(function (p, k) {
        if (!prev) return p; var q = prev.pts[k], d = dist(p, q), a = Math.min(1, 0.28 + d / 40);
        return { x: q.x + (p.x - q.x) * a, y: q.y + (p.y - q.y) * a };
      });
      var size = dist(pts[0], pts[9]) || 1, gap = dist(pts[4], pts[8]) / size;
      // pince : pouce et index qui se touchent (seuils différents pour serrer et relâcher : pas de clignotement)
      var was = prev ? prev.pinch : false, pinch = was ? gap < 0.42 : gap < 0.27;
      if (S.forcePinch != null) pinch = S.forcePinch; // essais automatiques uniquement
      // point visé : le bout de l'index (main ouverte) ou le point de pince (pouce + index serrés)
      var hnd = { id: id, pts: pts, pinch: pinch, x: pinch ? (pts[4].x + pts[8].x) / 2 : pts[8].x, y: pinch ? (pts[4].y + pts[8].y) / 2 : pts[8].y, size: size, t: now };
      S.prev[id] = hnd; out.push(hnd);
    });
    Object.keys(S.prev).forEach(function (k) { if (!out.some(function (h) { return h.id === k; }) && now - S.prev[k].t > 250) delete S.prev[k]; });
    // une main perdue un court instant (flou de bouger) garde sa prise pour ne pas lâcher le joueur
    Object.keys(S.prev).forEach(function (k) { if (!out.some(function (h) { return h.id === k; })) out.push(S.prev[k]); });
    S.hands = out;
    if (S.onHands) try { S.onHands(out); } catch (e) { if (window.console) console.warn(e); }
  }

  function draw() {
    var c = S.canvas, g = S.ctx, dpr = Math.min(2, window.devicePixelRatio || 1), w = S.stage.clientWidth, h = S.stage.clientHeight;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); S.mask.width = c.width; S.mask.height = c.height; }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
    if (!S.hands.length) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    var M = mapper(), v = S.video;
    // 1. la vraie main passe DEVANT les joueurs : on recopie les pixels de la main filmée par-dessus la 3D
    if (S.occlude && v.readyState >= 2) {
      var m = S.mask.getContext('2d'); m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, S.mask.width, S.mask.height);
      m.setTransform(dpr, 0, 0, dpr, 0, 0); m.lineCap = 'round'; m.lineJoin = 'round';
      S.hands.forEach(function (H) {
        var p = H.pts, fw = H.size * 0.3;
        [[1.35, 0.35], [1.1, 0.75], [0.92, 1]].forEach(function (pass) {
          m.globalAlpha = pass[1]; m.strokeStyle = m.fillStyle = '#000'; m.lineWidth = fw * pass[0];
          m.beginPath(); PALM.forEach(function (k, i) { if (i) m.lineTo(p[k].x, p[k].y); else m.moveTo(p[k].x, p[k].y); }); m.closePath(); m.fill(); m.stroke();
          m.beginPath(); BONES.forEach(function (b) { m.moveTo(p[b[0]].x, p[b[0]].y); m.lineTo(p[b[1]].x, p[b[1]].y); }); m.stroke();
          // l'avant-bras sort du bas de l'image
          var dx = p[0].x - p[9].x, dy = p[0].y - p[9].y; m.lineWidth = H.size * 0.75 * pass[0]; m.beginPath(); m.moveTo(p[0].x, p[0].y); m.lineTo(p[0].x + dx * 2.5, p[0].y + dy * 2.5); m.stroke();
        });
      });
      m.globalAlpha = 1; m.globalCompositeOperation = 'source-in'; m.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (S.mirror) { m.translate(M.w, 0); m.scale(-1, 1); }
      m.drawImage(v, M.ox, M.oy, M.vw * M.r, M.vh * M.r);
      g.drawImage(S.mask, 0, 0, M.w, M.h);
    }
    // 2. reflets lumineux au bout des doigts et point de prise, façon interface holographique
    S.hands.forEach(function (H) {
      var p = H.pts;
      g.save(); g.lineCap = 'round'; g.shadowColor = 'rgba(90,220,255,.9)'; g.shadowBlur = 10;
      g.strokeStyle = 'rgba(150,235,255,.55)'; g.lineWidth = 1.6; g.beginPath(); [[2, 3], [3, 4], [6, 7], [7, 8]].forEach(function (b) { g.moveTo(p[b[0]].x, p[b[0]].y); g.lineTo(p[b[1]].x, p[b[1]].y); }); g.stroke();
      [4, 8].forEach(function (k) { g.fillStyle = 'rgba(200,245,255,.95)'; g.beginPath(); g.arc(p[k].x, p[k].y, 3.4, 0, Math.PI * 2); g.fill(); });
      var r = Math.max(12, H.size * 0.22);
      g.shadowColor = H.pinch ? 'rgba(242,179,61,.95)' : 'rgba(90,220,255,.9)'; g.shadowBlur = H.pinch ? 18 : 10;
      g.strokeStyle = H.pinch ? '#f2b33d' : 'rgba(200,245,255,.9)'; g.lineWidth = H.pinch ? 3 : 2;
      g.beginPath(); g.arc(H.x, H.y, H.pinch ? r * 0.7 : r, 0, Math.PI * 2); g.stroke();
      if (H.pinch) { g.fillStyle = 'rgba(242,179,61,.35)'; g.fill(); }
      g.restore();
    });
  }

  function loop() {
    if (!S) return; S.raf = requestAnimationFrame(loop);
    var v = S.video, now = performance.now();
    if (S.sim) { process(S.sim, now); draw(); return; }
    if (lm && v && v.readyState >= 2 && v.videoWidth && v.currentTime !== S.lastT && now - S.lastRun >= S.every) {
      S.lastT = v.currentTime; S.lastRun = now;
      var t0 = performance.now(), res = null;
      try { res = lm.detectForVideo(v, now); }
      catch (e) { // carte graphique capricieuse : on bascule une fois sur le processeur
        if (!cpu && lm._m) { cpu = true; var old = lm; lm = null; create(old._m, old._files, 'CPU').then(function (h) { h._m = old._m; h._files = old._files; lm = h; }); try { old.close(); } catch (er) {} }
        return;
      }
      var took = performance.now() - t0; S.cost = S.cost ? S.cost * 0.9 + took * 0.1 : took;
      S.every = S.cost > 45 ? 60 : S.cost > 28 ? 40 : 0; // appareils lents : moins d'analyses, rendu toujours fluide
      process(res, now);
    }
    draw();
  }

  function start(o) {
    stop(); css();
    var canvas = el('canvas', 'cbmain');
    var gl = o.stage.querySelector('canvas.cbar-gl'); if (gl && gl.nextSibling) o.stage.insertBefore(canvas, gl.nextSibling); else o.stage.appendChild(canvas);
    S = { stage: o.stage, video: o.video, mirror: !!o.mirror, onHands: o.onHands, canvas: canvas, ctx: canvas.getContext('2d'), mask: document.createElement('canvas'), prev: {}, hands: [], lastT: -1, lastRun: 0, every: 0, occlude: o.occlude !== false };
    var my = S;
    if (o.onStatus && !lm) o.onStatus('Chargement du suivi de la main…');
    return load().then(function () { if (S !== my) return false; loop(); return true; }, function (e) { if (S === my) stop(); throw e; });
  }
  function setVideo(v, mirror) { if (!S) return; S.video = v; S.mirror = !!mirror; S.prev = {}; S.lastT = -1; }
  function stop() {
    if (!S) return; cancelAnimationFrame(S.raf); if (S.canvas) S.canvas.remove();
    var cb = S.onHands; S = null; if (cb) try { cb([]); } catch (e) {}
  }

  // lumière de la pièce : couleur et luminosité moyennes de l'image caméra (pour éclairer les joueurs comme la pièce)
  var lc = null;
  function roomLight(v) {
    if (!v || v.readyState < 2 || !v.videoWidth) return null;
    if (!lc) { lc = document.createElement('canvas'); lc.width = lc.height = 16; }
    var g = lc.getContext('2d', { willReadFrequently: true });
    try { g.drawImage(v, 0, 0, 16, 16); var d = g.getImageData(0, 0, 16, 16).data; } catch (e) { return null; }
    var r = 0, gg = 0, b = 0, n = d.length / 4;
    for (var i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; }
    r /= n * 255; gg /= n * 255; b /= n * 255;
    return { r: r, g: gg, b: b, lum: 0.2126 * r + 0.7152 * gg + 0.0722 * b };
  }

  window.CasaMain = { start: start, stop: stop, setVideo: setVideo, roomLight: roomLight, active: function () { return !!S; }, hands: function () { return S ? S.hands : []; }, _simulate: function (res) { if (S) S.sim = res; }, _pince: function (v) { if (S) S.forcePinch = v; } };
})();
