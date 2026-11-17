/* Casa Besports · Analyse vidéo Pro (clubs, coachs, éducateurs).
   On dépose une vidéo de match ou d'entraînement : lecture image par image, ralenti, dessins sur l'image
   (flèches, cercles, zones, trait libre), marquage des actions (but, tir, perte de balle…), rapport,
   montage des temps forts et questions posées en français sur les actions marquées.
   Tout se passe dans le navigateur : la vidéo n'est envoyée nulle part.
   Sans abonnement « Analyse vidéo Pro » : essai gratuit sur les 5 premières minutes de la vidéo.
   Ouvert depuis js/realite-augmentee.js (mode « analyse »). */
(function () {
  'use strict';
  var ESSAI = 300; // secondes analysables sans abonnement
  var COLORS = [['Jaune', '#f2b33d'], ['Rouge', '#e03040'], ['Bleu', '#3aa0ff'], ['Blanc', '#ffffff']];
  var TOOLS = [['main', '✋ Aucun'], ['fleche', '➜ Flèche'], ['cercle', '◯ Cercle'], ['zone', '▭ Zone'], ['trait', '✎ Trait libre']];
  // Actions marquables : [id, libellé, mots reconnus dans les questions]
  var ACTIONS = [
    ['but', 'But', /\bbut|\bbuts|marque|essai|panier|point/],
    ['tir', 'Tir', /\btir|frappe|shoot/],
    ['occasion', 'Occasion', /occasion|danger/],
    ['recup', 'Récupération', /recup|recuper|interception|gagn/],
    ['perte', 'Perte de balle', /perte|perdu|perd|ballon perdu|deposs/],
    ['faute', 'Faute', /faute|carton|sanction/],
    ['cpa', 'Coup de pied arrêté', /corner|coup franc|coup de pied|arrete|touche|penalty|cpa/],
    ['fort', 'Temps fort', /temps fort|bonne sequence|belle action/],
    ['note', 'Note', /\bnote|remarque|commentaire/]
  ];
  var NAME = {}; ACTIONS.forEach(function (a) { NAME[a[0]] = a[1]; });

  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) for (var k in attrs) { if (k === 'style') e.style.cssText = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); } if (html != null) e.innerHTML = html; return e; }
  function btn(label, fn, primary, title) { var b = el('button', { type: 'button', class: 'cbar-btn' + (primary ? ' cbar-primary' : ''), onclick: fn }, label); if (title) b.title = title; return b; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); var h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s; }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' '); }
  var LS = { get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

  function css() {
    if (document.getElementById('cbav-css')) return;
    var c = '#cbar .av-wrap{flex:1;min-height:0;overflow-y:auto;padding:.8rem;display:flex;flex-direction:column;gap:.7rem;max-width:1100px;width:100%;margin:0 auto;box-sizing:border-box}' +
      '#cbar .av-drop{border:2px dashed rgba(255,255,255,.3);border-radius:16px;padding:2rem 1rem;text-align:center;display:flex;flex-direction:column;gap:.7rem;align-items:center}' +
      '#cbar .av-drop.on{border-color:#f2b33d;background:rgba(242,179,61,.08)}' +
      '#cbar .av-drop b{font-family:"Cormorant Garamond",Georgia,serif;font-size:26px}' +
      '#cbar .av-drop p,#cbar .av-small{margin:0;font-size:13.5px;color:#c9d6e3;line-height:1.5;max-width:560px}' +
      '#cbar .av-player{flex:none;position:relative;background:#000;border-radius:12px;overflow:hidden;align-self:center;max-width:100%}' +
      '#cbar .av-player video{position:static;display:block;width:100%;height:100%;object-fit:contain}' +
      '#cbar .av-player canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}' +
      '#cbar .av-player.draw canvas{cursor:crosshair}' +
      '#cbar .av-lock{position:absolute;inset:0;background:rgba(5,9,15,.88);display:flex;flex-direction:column;gap:.6rem;align-items:center;justify-content:center;text-align:center;padding:1rem;z-index:2}' +
      '#cbar .av-tl{position:relative;height:30px}' +
      '#cbar .av-tl input{position:absolute;left:0;right:0;bottom:0;width:100%;margin:0;min-height:18px;padding:0;accent-color:#f2b33d}' +
      '#cbar .av-mk{position:absolute;top:0;width:3px;height:14px;border-radius:2px;transform:translateX(-1px);cursor:pointer;border:0;padding:0}' +
      '#cbar .av-essai{position:absolute;top:16px;height:4px;background:rgba(224,48,64,.6);right:0}' +
      '#cbar .av-time{font:700 14px Mulish,sans-serif;min-width:96px;text-align:center}' +
      '#cbar .av-tabs{display:flex;gap:.3rem;flex-wrap:wrap;border-bottom:1px solid rgba(255,255,255,.14);padding-bottom:.4rem}' +
      '#cbar .av-sec{display:flex;flex-direction:column;gap:.5rem}' +
      '#cbar .av-ev{display:flex;gap:.5rem;align-items:center;padding:.35rem .5rem;border-radius:8px;background:rgba(255,255,255,.05);font-size:13.5px}' +
      '#cbar .av-ev button.t{border:0;background:#f2b33d;color:#0f2236;font:800 12px Mulish,sans-serif;border-radius:999px;padding:.25rem .55rem;cursor:pointer}' +
      '#cbar .av-ev .x{margin-left:auto;border:0;background:none;color:#c9d6e3;font-size:18px;cursor:pointer;min-width:32px;min-height:32px}' +
      '#cbar .av-dot{width:10px;height:10px;border-radius:50%;flex:none}' +
      '#cbar .av-tbl{width:100%;border-collapse:collapse;font-size:13.5px}' +
      '#cbar .av-tbl th,#cbar .av-tbl td{padding:.35rem .4rem;border-bottom:1px solid rgba(255,255,255,.1);text-align:center}' +
      '#cbar .av-tbl th:first-child,#cbar .av-tbl td:first-child{text-align:left}' +
      '#cbar .av-tbl th{font:700 11px "Barlow Condensed",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#f2b33d}' +
      '#cbar .av-ans{background:rgba(255,255,255,.06);border-radius:12px;padding:.7rem .8rem;font-size:14.5px;line-height:1.55}' +
      '#cbar .av-ans .q{font-size:12.5px;color:#9aa6b4;margin-bottom:.2rem}' +
      '#cbar .av-ans button{border:0;background:#f2b33d;color:#0f2236;font:800 12px Mulish,sans-serif;border-radius:999px;padding:.15rem .5rem;margin:0 .15rem;cursor:pointer}' +
      '#cbar .av-ia{border:1px solid rgba(242,179,61,.5);border-radius:12px;padding:.8rem;font-size:13.5px;line-height:1.5;color:#c9d6e3}' +
      '#cbar .av-ia b{color:#f6f0e1}' +
      '#cbar .av-pro{display:inline-flex;align-items:center;gap:.3rem;font:800 11px "Barlow Condensed",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#0f2236;background:#f2b33d;border-radius:999px;padding:.2rem .55rem}' +
      '#cbar .av-pro.off{background:rgba(255,255,255,.12);color:#f6f0e1}';
    document.head.appendChild(el('style', { id: 'cbav-css' }, c));
  }

  /* data : { pro: bool, offre: fn (ouvre l'offre Pro), sport } */
  function mount(root, data) {
    css(); data = data || {};
    var pro = !!data.pro;
    var wrap = el('div', { class: 'av-wrap' }); root.appendChild(wrap);
    var S = { file: null, key: '', events: [], drawings: [], team: 'nous', tool: 'main', color: COLORS[0][1], tab: 'actions', play: null, url: '' };
    var badge = function () { return '<span class="av-pro' + (pro ? '' : ' off') + '">' + (pro ? '★ Pro actif' : 'Essai gratuit · 5 min') + '</span>'; };

    // ---------- 1. Dépôt de la vidéo ----------
    var input = el('input', { type: 'file', accept: 'video/*', style: 'display:none' });
    var drop = el('div', { class: 'av-drop' });
    drop.innerHTML = badge() + '<b>Déposez une vidéo de match ou d’entraînement</b>' +
      '<p>Filmée au téléphone, avec une caméra de club ou récupérée sur votre ordinateur (MP4, MOV, WebM). Ralenti, image par image, dessins tactiques, marquage des actions, rapport et questions sur le match.</p>' +
      '<p><b style="font-family:inherit;font-size:inherit">La vidéo reste sur votre appareil</b> : rien n’est envoyé sur internet.</p>';
    drop.appendChild(btn('Choisir une vidéo', function () { input.click(); }, true));
    if (!pro) drop.appendChild(el('p', {}, 'Sans abonnement, l’analyse porte sur les 5 premières minutes de la vidéo.'));
    if (!pro && data.offre) drop.appendChild(btn('Voir l’offre Analyse vidéo Pro', data.offre));
    wrap.appendChild(drop); wrap.appendChild(input);
    ['dragenter', 'dragover'].forEach(function (n) { drop.addEventListener(n, function (e) { e.preventDefault(); drop.classList.add('on'); }); });
    ['dragleave', 'drop'].forEach(function (n) { drop.addEventListener(n, function (e) { e.preventDefault(); drop.classList.remove('on'); }); });
    drop.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) load(f); });
    input.addEventListener('change', function () { if (input.files && input.files[0]) load(input.files[0]); });

    var video, canvas, g, player, range, marks, timeLbl, playBtn, lock, panel;

    function save() { if (S.key) LS.set(S.key, { events: S.events, drawings: S.drawings }); }
    function limit() { return pro ? Infinity : ESSAI; }
    function dur() { return video && isFinite(video.duration) ? video.duration : 0; }

    function load(f) {
      if (!/^video\//.test(f.type || '') && !/\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(f.name)) { alert('Ce fichier n’est pas une vidéo.'); return; }
      S.file = f; S.key = 'cb-analyse:' + f.name + ':' + f.size;
      var old = LS.get(S.key, null); S.events = (old && old.events) || []; S.drawings = (old && old.drawings) || [];
      if (S.url) URL.revokeObjectURL(S.url);
      S.url = URL.createObjectURL(f);
      build();
      video.src = S.url;
    }

    // ---------- 2. Lecteur + dessins ----------
    function build() {
      wrap.innerHTML = '';
      var head = el('div', { class: 'cbar-row', style: 'justify-content:space-between;margin:0' });
      head.appendChild(el('div', { class: 'av-small', style: 'max-width:none' }, badge() + ' &nbsp;' + esc(S.file.name)));
      head.appendChild(btn('Changer de vidéo', function () { input.value = ''; input.click(); }));
      wrap.appendChild(head); wrap.appendChild(input);

      player = el('div', { class: 'av-player' });
      video = el('video', { playsinline: '', 'webkit-playsinline': '', preload: 'auto' });
      video.muted = false;
      canvas = el('canvas');
      player.appendChild(video); player.appendChild(canvas);
      lock = el('div', { class: 'av-lock', style: 'display:none' });
      lock.innerHTML = '<b style="font-family:Cormorant Garamond,Georgia,serif;font-size:24px">Fin de l’essai gratuit</b><p class="av-small">L’essai couvre les 5 premières minutes. Avec Analyse vidéo Pro, toute la vidéo, le rapport, les captures et le montage des temps forts.</p>';
      if (data.offre) lock.appendChild(btn('Découvrir l’offre Pro', data.offre, true));
      lock.appendChild(btn('Revenir au début', function () { lock.style.display = 'none'; video.currentTime = 0; }));
      player.appendChild(lock);
      wrap.appendChild(player);
      g = canvas.getContext('2d');

      var tl = el('div', { class: 'av-tl' });
      marks = el('div', { style: 'position:absolute;left:0;right:0;top:0;height:14px' });
      range = el('input', { type: 'range', min: '0', max: '1000', value: '0', 'aria-label': 'Position dans la vidéo' });
      tl.appendChild(marks); tl.appendChild(range); wrap.appendChild(tl);
      range.addEventListener('input', function () { seek(range.value / 1000 * dur()); });

      // commandes de lecture
      var ctr = el('div', { class: 'cbar-row', style: 'justify-content:center;margin:0' });
      ctr.appendChild(btn('−5 s', function () { seek(video.currentTime - 5); }, false, 'Reculer de 5 secondes'));
      ctr.appendChild(btn('◀ image', function () { video.pause(); seek(video.currentTime - 1 / 25); }, false, 'Image précédente'));
      playBtn = btn('▶ Lecture', toggle, true); ctr.appendChild(playBtn);
      ctr.appendChild(btn('image ▶', function () { video.pause(); seek(video.currentTime + 1 / 25); }, false, 'Image suivante'));
      ctr.appendChild(btn('+5 s', function () { seek(video.currentTime + 5); }, false, 'Avancer de 5 secondes'));
      var sp = el('select', { 'aria-label': 'Vitesse' }, ['0.25', '0.5', '1', '1.5', '2'].map(function (v) { return '<option value="' + v + '"' + (v === '1' ? ' selected' : '') + '>×' + v.replace('.', ',') + '</option>'; }).join(''));
      sp.addEventListener('change', function () { video.playbackRate = Number(sp.value); });
      ctr.appendChild(sp);
      timeLbl = el('span', { class: 'av-time' }, '0:00 / 0:00'); ctr.appendChild(timeLbl);
      wrap.appendChild(ctr);

      panel = el('div', { class: 'av-sec' }); wrap.appendChild(panel);

      video.addEventListener('error', function () {
        lock.innerHTML = '<b style="font-family:Cormorant Garamond,Georgia,serif;font-size:24px">Cette vidéo ne se lit pas ici</b><p class="av-small">Son format n’est pas reconnu par ce navigateur. Les vidéos d’iPhone (HEVC) se lisent dans Safari ; sur ordinateur Windows, exportez-la d’abord en MP4 (H.264), par exemple avec l’application Photos ou Clipchamp.</p>';
        lock.appendChild(btn('Choisir une autre vidéo', function () { input.value = ''; input.click(); }, true));
        lock.style.display = 'flex';
      });
      video.addEventListener('loadedmetadata', function () { fit(); renderMarks(); renderPanel(); });
      video.addEventListener('timeupdate', onTime);
      video.addEventListener('seeked', function () { redraw(); onTime(); });
      video.addEventListener('play', function () { playBtn.textContent = '⏸ Pause'; tick(); });
      video.addEventListener('pause', function () { playBtn.textContent = '▶ Lecture'; redraw(); });
      window.addEventListener('resize', fit);
      setupDraw();
      renderPanel();
    }
    function fit() {
      if (!video || !video.videoWidth) return;
      var maxW = wrap.clientWidth - 2, maxH = Math.max(200, window.innerHeight * 0.48);
      var r = video.videoWidth / video.videoHeight, w = Math.min(maxW, maxH * r), h = w / r;
      player.style.width = Math.round(w) + 'px'; player.style.height = Math.round(h) + 'px';
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      redraw();
    }
    function seek(t) {
      if (!video) return;
      var lim = Math.min(dur() || 0, limit());
      t = Math.max(0, Math.min(t, lim - 0.05 > 0 ? lim - 0.05 : lim));
      video.currentTime = t;
    }
    function toggle() { if (video.paused) { if (video.currentTime >= limit() - 0.1) { lock.style.display = 'flex'; return; } video.play().catch(function () {}); } else video.pause(); }
    function tick() { if (!video || video.paused) return; redraw(); requestAnimationFrame(tick); }
    function onTime() {
      var t = video.currentTime, d = dur();
      if (t >= limit()) { video.pause(); video.currentTime = limit() - 0.05; lock.style.display = 'flex'; S.play = null; }
      if (S.play) { var c = S.play.list[S.play.i]; if (c && t >= c[1]) { S.play.i++; var n = S.play.list[S.play.i]; if (n) video.currentTime = n[0]; else { video.pause(); S.play = null; renderPanel(); } } }
      if (d) range.value = String(Math.round(t / d * 1000));
      timeLbl.textContent = fmt(t) + ' / ' + fmt(d);
    }

    // dessins : coordonnées de 0 à 1, visibles 4 secondes à partir du moment dessiné
    function visibleDrawings() { var t = video.currentTime; return S.drawings.filter(function (d) { return t >= d.t - 0.05 && t <= d.t + 4; }); }
    function paint(ctx, W, H, list) {
      list.forEach(function (d) {
        var p = d.pts.map(function (q) { return [q[0] * W, q[1] * H]; }), lw = Math.max(3, W / 220);
        ctx.save(); ctx.strokeStyle = d.color; ctx.fillStyle = d.color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = lw;
        if (!p.length) { ctx.restore(); return; }
        var a = p[0], b = p[p.length - 1];
        if (d.kind === 'fleche') {
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = lw * 5;
          ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - L * Math.cos(ang - 0.45), b[1] - L * Math.sin(ang - 0.45)); ctx.lineTo(b[0] - L * Math.cos(ang + 0.45), b[1] - L * Math.sin(ang + 0.45)); ctx.closePath(); ctx.fill();
        } else if (d.kind === 'cercle') {
          ctx.beginPath(); ctx.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2 + 1, Math.abs(b[1] - a[1]) / 2 + 1, 0, 0, Math.PI * 2); ctx.stroke();
        } else if (d.kind === 'zone') {
          ctx.globalAlpha = 0.22; ctx.fillRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])); ctx.globalAlpha = 1;
          ctx.setLineDash([lw * 3, lw * 2]); ctx.strokeRect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
        } else {
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); p.forEach(function (q) { ctx.lineTo(q[0], q[1]); }); ctx.stroke();
        }
        ctx.restore();
      });
    }
    var cur = null;
    function redraw() { if (!g) return; g.clearRect(0, 0, canvas.width, canvas.height); paint(g, canvas.width, canvas.height, visibleDrawings().concat(cur ? [cur] : [])); }
    function setupDraw() {
      function pos(e) { var r = canvas.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; }
      canvas.addEventListener('pointerdown', function (e) {
        if (S.tool === 'main') { toggle(); return; }
        video.pause(); canvas.setPointerCapture(e.pointerId);
        cur = { t: video.currentTime, kind: S.tool, color: S.color, pts: [pos(e)] }; redraw();
      });
      canvas.addEventListener('pointermove', function (e) { if (!cur) return; var p = pos(e); if (cur.kind === 'trait') cur.pts.push(p); else cur.pts[1] = p; redraw(); });
      function end() { if (!cur) return; if (cur.pts.length > 1) { S.drawings.push(cur); save(); } cur = null; redraw(); }
      canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    }

    // ---------- 3. Actions marquées ----------
    function teamCol(t) { return t === 'adv' ? '#e03040' : t === 'nous' ? '#f2b33d' : '#9aa6b4'; }
    function addEvent(type) {
      if (!video) return;
      var t = video.currentTime;
      if (t > limit()) return;
      var note = '';
      if (type === 'note') { note = prompt('Votre note à ' + fmt(t) + ' :', '') || ''; if (!note.trim()) return; }
      S.events.push({ t: t, type: type, team: type === 'mi' ? '' : S.team, note: note.trim().slice(0, 200) });
      S.events.sort(function (a, b) { return a.t - b.t; }); save(); renderMarks(); renderPanel();
    }
    function renderMarks() {
      if (!marks) return; marks.innerHTML = ''; var d = dur(); if (!d) return;
      if (!pro && d > ESSAI) marks.appendChild(el('div', { class: 'av-essai', style: 'left:' + (ESSAI / d * 100) + '%', title: 'Au-delà : réservé à l’offre Pro' }));
      S.events.forEach(function (ev) { marks.appendChild(el('button', { type: 'button', class: 'av-mk', style: 'left:' + (ev.t / d * 100) + '%;background:' + teamCol(ev.team), title: fmt(ev.t) + ' · ' + (ev.type === 'mi' ? 'Mi-temps' : NAME[ev.type]), 'aria-label': fmt(ev.t) + ' ' + (NAME[ev.type] || 'Mi-temps'), onclick: function () { seek(ev.t - 3); } })); });
    }
    function half() { var m = S.events.find(function (e) { return e.type === 'mi'; }); return m ? m.t : dur() / 2; }
    function label(ev) { return (ev.type === 'mi' ? 'Mi-temps' : NAME[ev.type]) + (ev.team ? ' · ' + (ev.team === 'nous' ? 'Nous' : 'Adversaire') : '') + (ev.note ? ' — ' + esc(ev.note) : ''); }

    function proOnly(label2, fn) { return pro ? btn(label2, fn) : btn('🔒 ' + label2, function () { if (data.offre) data.offre(); }, false, 'Réservé à l’offre Analyse vidéo Pro'); }

    function renderPanel() {
      if (!panel) return; panel.innerHTML = '';
      var tabs = el('div', { class: 'av-tabs', role: 'tablist' });
      [['actions', 'Marquer les actions'], ['dessin', 'Dessiner'], ['questions', 'Poser une question'], ['rapport', 'Rapport']].forEach(function (x) {
        var b = btn(x[1], function () { S.tab = x[0]; renderPanel(); }); b.setAttribute('aria-pressed', String(S.tab === x[0])); b.setAttribute('role', 'tab'); tabs.appendChild(b);
      });
      panel.appendChild(tabs);
      if (S.tab === 'dessin') return renderDraw();
      if (S.tab === 'questions') return renderAsk();
      if (S.tab === 'rapport') return renderReport();
      // actions
      var tr = el('div', { class: 'cbar-row', style: 'margin:0' });
      tr.appendChild(el('span', { class: 'cbar-lbl', style: 'width:auto;margin:0 .3rem 0 0' }, 'Équipe'));
      [['nous', 'Nous'], ['adv', 'Adversaire']].forEach(function (x) { var b = btn(x[1], function () { S.team = x[0]; renderPanel(); }); b.setAttribute('aria-pressed', String(S.team === x[0])); tr.appendChild(b); });
      panel.appendChild(tr);
      var ar = el('div', { class: 'cbar-row', style: 'margin:0' });
      ACTIONS.forEach(function (a) { ar.appendChild(btn(a[1], function () { addEvent(a[0]); })); });
      ar.appendChild(btn('⏱ Mi-temps', function () { S.events = S.events.filter(function (e) { return e.type !== 'mi'; }); addEvent('mi'); }, false, 'Marque le début de la 2e période'));
      panel.appendChild(ar);
      panel.appendChild(el('p', { class: 'av-small' }, 'Touchez une action au moment où elle se passe : elle est placée sur la ligne du temps. Touchez l’heure d’une action pour la revoir.'));
      if (!S.events.length) { panel.appendChild(el('p', { class: 'av-small' }, 'Aucune action marquée pour l’instant.')); return; }
      S.events.slice().reverse().forEach(function (ev) {
        var row = el('div', { class: 'av-ev' });
        row.appendChild(el('span', { class: 'av-dot', style: 'background:' + teamCol(ev.team) }));
        row.appendChild(el('button', { type: 'button', class: 't', onclick: function () { seek(ev.t - 3); } }, fmt(ev.t)));
        row.appendChild(el('span', {}, label(ev)));
        row.appendChild(el('button', { type: 'button', class: 'x', 'aria-label': 'Supprimer', onclick: function () { S.events.splice(S.events.indexOf(ev), 1); save(); renderMarks(); renderPanel(); } }, '×'));
        panel.appendChild(row);
      });
    }
    function renderDraw() {
      var r1 = el('div', { class: 'cbar-row', style: 'margin:0' });
      TOOLS.forEach(function (x) { var b = btn(x[1], function () { S.tool = x[0]; player.classList.toggle('draw', x[0] !== 'main'); renderPanel(); }); b.setAttribute('aria-pressed', String(S.tool === x[0])); r1.appendChild(b); });
      panel.appendChild(r1);
      var r2 = el('div', { class: 'cbar-row', style: 'margin:0' });
      COLORS.forEach(function (c) { var b = el('button', { type: 'button', class: 'cbar-btn', 'aria-label': c[0], 'aria-pressed': String(S.color === c[1]), style: 'min-width:42px;padding:0;background:' + c[1] + ';border-color:' + (S.color === c[1] ? '#fff' : 'transparent'), onclick: function () { S.color = c[1]; renderPanel(); } }); r2.appendChild(b); });
      r2.appendChild(btn('Effacer les dessins de ce moment', function () { var v = visibleDrawings(); S.drawings = S.drawings.filter(function (d) { return v.indexOf(d) < 0; }); save(); redraw(); }));
      r2.appendChild(proOnly('📷 Capture', capture));
      panel.appendChild(r2);
      panel.appendChild(el('p', { class: 'av-small' }, 'Choisissez un outil puis dessinez sur l’image : la vidéo se met en pause. Le dessin reste affiché 4 secondes à cet endroit de la vidéo, à chaque lecture. Idéal pour montrer un placement, une course ou un espace libre.'));
    }
    // Téléphone : feuille de partage (enregistrer dans Photos, WhatsApp…) ; sinon (ou si refusé) : téléchargement
    function download(b, nom) { var u = URL.createObjectURL(b); var a = el('a', { href: u, download: nom }); document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 60000); }
    function give(b, nom) {
      var f = null; try { f = new File([b], nom, { type: b.type }); } catch (e) {}
      var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      if (touch && f && navigator.canShare && navigator.canShare({ files: [f] })) {
        navigator.share({ files: [f], title: nom }).catch(function (e) { if (!e || e.name !== 'AbortError') download(b, nom); });
      } else download(b, nom);
    }
    function capture() {
      var c = document.createElement('canvas'); c.width = video.videoWidth; c.height = video.videoHeight;
      var x = c.getContext('2d'); x.drawImage(video, 0, 0, c.width, c.height); paint(x, c.width, c.height, visibleDrawings());
      var nom = 'analyse-' + fmt(video.currentTime).replace(/^(\d+):(\d+)$/, '$1min$2').replace(/^(\d+):(\d+):(\d+)$/, '$1h$2min$3') + '.png';
      c.toBlob(function (b) { if (b) give(b, nom); }, 'image/png');
    }

    // ---------- 4. Rapport ----------
    function counts(filter) { var o = {}; S.events.filter(filter || function () { return true; }).forEach(function (e) { if (e.type === 'mi' || e.type === 'note') return; var k = e.type + ':' + e.team; o[k] = (o[k] || 0) + 1; }); return o; }
    function renderReport() {
      var m = half(), all = counts(), p1 = counts(function (e) { return e.t < m; }), p2 = counts(function (e) { return e.t >= m; });
      var types = ACTIONS.filter(function (a) { return a[0] !== 'note'; });
      var rows = types.map(function (a) { var k = a[0]; return '<tr><td>' + a[1] + '</td><td>' + (all[k + ':nous'] || 0) + '</td><td>' + (all[k + ':adv'] || 0) + '</td><td>' + (p1[k + ':nous'] || 0) + ' – ' + (p1[k + ':adv'] || 0) + '</td><td>' + (p2[k + ':nous'] || 0) + ' – ' + (p2[k + ':adv'] || 0) + '</td></tr>'; }).join('');
      panel.appendChild(el('div', { style: 'overflow-x:auto' }, '<table class="av-tbl"><thead><tr><th>Action</th><th>Nous</th><th>Adv.</th><th>1re période</th><th>2e période</th></tr></thead><tbody>' + rows + '</tbody></table>'));
      panel.appendChild(el('p', { class: 'av-small' }, S.events.some(function (e) { return e.type === 'mi'; }) ? 'Périodes séparées par votre repère « Mi-temps » (' + fmt(m) + ').' : 'Sans repère « Mi-temps », la vidéo est coupée en deux moitiés égales.'));
      var r = el('div', { class: 'cbar-row', style: 'margin:0' });
      [['but', 'Montage des buts'], ['occasion', 'Montage des occasions'], ['perte', 'Montage des pertes de balle'], ['', 'Montage de toutes les actions']].forEach(function (x) { r.appendChild(proOnly('▶ ' + x[1], function () { montage(function (e) { return e.type !== 'mi' && (!x[0] || e.type === x[0] || (x[0] === 'occasion' && e.type === 'tir')); }); })); });
      r.appendChild(proOnly('⬇ Télécharger le rapport (tableur)', csv));
      panel.appendChild(r);
    }
    function montage(filter) {
      var list = S.events.filter(filter).map(function (e) { return [Math.max(0, e.t - 5), e.t + 3]; });
      if (!list.length) { alert('Aucune action de ce type n’est marquée.'); return; }
      // fusionne les extraits qui se chevauchent
      var merged = [list[0]]; list.slice(1).forEach(function (c) { var l = merged[merged.length - 1]; if (c[0] <= l[1]) l[1] = Math.max(l[1], c[1]); else merged.push(c); });
      S.play = { list: merged, i: 0 }; video.currentTime = merged[0][0]; video.play().catch(function () {});
    }
    function csv() {
      var lines = [['Temps', 'Secondes', 'Action', 'Équipe', 'Note']].concat(S.events.map(function (e) { return [fmt(e.t), Math.round(e.t), e.type === 'mi' ? 'Mi-temps' : NAME[e.type], e.team === 'nous' ? 'Nous' : e.team === 'adv' ? 'Adversaire' : '', e.note || '']; }));
      var txt = '﻿' + lines.map(function (l) { return l.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
      download(new Blob([txt], { type: 'text/csv;charset=utf-8' }), 'rapport-' + S.file.name.replace(/\.[^.]+$/, '') + '.csv');
    }

    // ---------- 5. Questions (réponses calculées à partir des actions marquées) ----------
    var history = [];
    function answer(q) {
      var n = norm(q), m = half();
      var ev = S.events.filter(function (e) { return e.type !== 'mi'; });
      if (!ev.length) return { text: 'Je réponds à partir des actions que vous marquez. Ouvrez « Marquer les actions » et touchez un bouton (But, Tir, Perte de balle…) au bon moment : je pourrai ensuite tout vous dire sur votre match.' };
      if (/(quel|notre|leur|son|mon).{0,20}temps (fort|faible)|meilleur moment|moins bon moment|quand .{0,30}(mieux|domin)/.test(n)) {
        var tm = /advers|adverse|\beux\b|\bleur\b/.test(n) ? 'adv' : null;
        return { text: densest(ev, /faible|moins bon/.test(n), tm) };
      }
      var type = null; ACTIONS.forEach(function (a) { if (!type && a[2].test(n)) type = a[0]; });
      var team = /advers|adverse|\beux\b|\bils\b|en face|l autre equipe|visiteur/.test(n) ? 'adv' : /\bnous\b|\bon\b|\bnos\b|\bnotre\b|mon equipe|mes joueurs/.test(n) ? 'nous' : null;
      var per = /(1re|1ere|premiere|1er)\s*(mi|periode|partie)|avant la pause/.test(n) ? 1 : /(2e|2eme|deuxieme|seconde)\s*(mi|periode|partie)|apres la pause/.test(n) ? 2 : 0;
      var list = ev.filter(function (e) { return (!type || e.type === type) && (!team || e.team === team) && (!per || (per === 1 ? e.t < m : e.t >= m)); });
      var what = type ? NAME[type].toLowerCase() : 'action';
      var who = team === 'adv' ? ' pour l’adversaire' : team === 'nous' ? ' pour nous' : '';
      var when = per ? (per === 1 ? ' en 1re période' : ' en 2e période') : '';
      var plural = function (k, w) { return k + ' ' + (k > 1 ? w.replace(/(^|\s)(\S+)/, function (x, sp, wd) { return sp + wd + 's'; }).replace(/ss\b/, 's') : w); };
      if (/montre|voir|revoir|video|montage|rejoue|regarder/.test(n)) {
        if (!list.length) return { text: 'Rien de marqué pour cette question (' + what + who + when + ').' };
        if (!pro) return { text: 'Le montage automatique fait partie de l’offre Analyse vidéo Pro. Voici les moments à revoir :', times: list };
        montage(function (e) { return list.indexOf(e) >= 0; });
        return { text: 'Je lance le montage : ' + plural(list.length, 'extrait') + ' (' + what + who + when + ').', times: list };
      }
      if (/resume|bilan|synthese|rapport|comment s est passe|analyse/.test(n) && !type) {
        var c = counts(), tot = function (k) { return (c[k + ':nous'] || 0) + ' pour nous, ' + (c[k + ':adv'] || 0) + ' pour l’adversaire'; };
        var parts = ['but', 'tir', 'occasion', 'recup', 'perte', 'faute'].filter(function (k) { return c[k + ':nous'] || c[k + ':adv']; }).map(function (k) { return NAME[k] + ' : ' + tot(k); });
        return { text: 'Bilan des ' + ev.length + ' actions marquées. ' + (parts.join('. ') || 'Seulement des notes pour l’instant') + '. ' + densest(ev) };
      }
      if (/compar|difference|plus que|moins que|qui a/.test(n) && type) {
        var a1 = ev.filter(function (e) { return e.type === type && e.team === 'nous' && (!per || (per === 1 ? e.t < m : e.t >= m)); }).length;
        var a2 = ev.filter(function (e) { return e.type === type && e.team === 'adv' && (!per || (per === 1 ? e.t < m : e.t >= m)); }).length;
        return { text: NAME[type] + when + ' : ' + a1 + ' pour nous, ' + a2 + ' pour l’adversaire. ' + (a1 === a2 ? 'Égalité.' : (a1 > a2 ? 'Avantage pour nous.' : 'Avantage pour l’adversaire.')) };
      }
      if (/quand|a quel moment|minute|ou |liste/.test(n) || !/combien|nombre/.test(n)) {
        if (!list.length) return { text: 'Rien de marqué pour cette question (' + what + who + when + ').' };
        return { text: plural(list.length, type ? NAME[type].toLowerCase() : 'action') + who + when + ', aux moments suivants (touchez pour revoir) :', times: list.slice(0, 30) };
      }
      return { text: plural(list.length, type ? NAME[type].toLowerCase() : 'action') + who + when + '.', times: list.slice(0, 30) };
    }
    // la période de 5 minutes la plus (ou la moins) riche en actions positives pour nous
    // (tm = 'adv' : du point de vue de l'adversaire). Fenêtre = un neuvième de la vidéo (10 min pour un match de 90 min)
    function densest(ev, faible, tm) {
      var d = Math.min(dur() || 0, limit()) || (ev.length ? ev[ev.length - 1].t + 1 : 0); if (!ev.length || !d) return '';
      var good = { but: 3, tir: 1, occasion: 2, recup: 1, fort: 2, cpa: 0.5 }, bad = { perte: -1, faute: -0.5 };
      var W = Math.max(60, Math.min(600, Math.round(d / 9))), step = Math.max(10, Math.round(W / 6)), best = null;
      for (var s = 0; s < Math.max(1, d - W + 1); s += step) {
        var sc = 0; ev.forEach(function (e) { if (e.t >= s && e.t < s + W) { var v = (good[e.type] || bad[e.type] || 0); sc += (e.team === 'adv') !== (tm === 'adv') ? -v : v; } });
        if (!best || (faible ? sc < best.sc : sc > best.sc)) best = { s: s, sc: sc };
      }
      return (tm === 'adv' ? (faible ? 'Le temps faible de l’adversaire : ' : 'Le temps fort de l’adversaire : ') : (faible ? 'Votre temps faible : ' : 'Votre temps fort : ')) + 'entre ' + fmt(best.s) + ' et ' + fmt(Math.min(d, best.s + W)) + '.';
    }
    function renderAsk() {
      var form = el('form', { class: 'cbar-row', style: 'margin:0' });
      var q = el('input', { type: 'text', placeholder: 'Ex. : combien de pertes de balle en 2e période ?', 'aria-label': 'Votre question', style: 'flex:1;min-width:200px' });
      form.appendChild(q); form.appendChild(el('button', { type: 'submit', class: 'cbar-btn cbar-primary' }, 'Demander'));
      form.addEventListener('submit', function (e) { e.preventDefault(); var v = q.value.trim(); if (!v) return; history.unshift({ q: v, a: answer(v) }); history = history.slice(0, 8); renderPanel(); });
      panel.appendChild(form);
      var sug = el('div', { class: 'cbar-row', style: 'margin:0' });
      ['Fais-moi le bilan', 'Combien de tirs pour nous ?', 'Quand avons-nous perdu le ballon en 2e période ?', 'Quel a été notre temps fort ?', 'Qui a eu le plus d’occasions ?', 'Montre-moi les buts'].forEach(function (s) { sug.appendChild(btn(s, function () { history.unshift({ q: s, a: answer(s) }); history = history.slice(0, 8); renderPanel(); })); });
      panel.appendChild(sug);
      history.forEach(function (h) {
        var box = el('div', { class: 'av-ans' }); box.appendChild(el('div', { class: 'q' }, esc(h.q)));
        var p = el('div', {}, esc(h.a.text)); (h.a.times || []).forEach(function (e) { p.appendChild(el('button', { type: 'button', title: label(e).replace(/<[^>]+>/g, ''), onclick: function () { seek(e.t - 3); } }, fmt(e.t))); });
        box.appendChild(p); panel.appendChild(box);
      });
      panel.appendChild(el('div', { class: 'av-ia' }, '<b>Bientôt, en option : l’analyse par intelligence artificielle.</b> Aujourd’hui, les réponses sont calculées à partir des actions que vous marquez, gratuitement et sans que la vidéo quitte votre appareil. Une IA pourrait regarder la vidéo elle-même et répondre à des questions libres (placement, pressing, transitions). Elle demande d’envoyer des images de la vidéo à un service payant : cette option n’est pas encore activée.'));
    }

    return { close: function () { try { if (video) video.pause(); } catch (e) {} if (S.url) URL.revokeObjectURL(S.url); window.removeEventListener('resize', fit); } };
  }

  window.CasaAnalyse = { mount: mount, ESSAI: ESSAI };
})();
