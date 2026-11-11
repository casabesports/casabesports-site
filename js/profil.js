
/*!
 * Casa Besports — profil membre : photo, CV au style Casa (direction « Le bandeau ») et certification Casa Besports.
 * - La photo est recadrée et réduite dans le navigateur (JPEG 512 × 512).
 * - Le CV est saisi par le membre, rendu dans la charte (aperçu HTML, impression en PDF, image PNG).
 * - La certification est délivrée par l’équipe sur le serveur (server/cv.js) : empreinte SHA-256 du contenu
 *   + signature HMAC. Toute modification du CV après certification est détectée : le sceau devient « à renouveler ».
 * La première partie (modèle, nettoyage, forme canonique, SHA-256) est partagée avec le serveur.
 */
var CasaCV = (function () {
  'use strict';
  var F = function (k, label, ph, extra) { return Object.assign({ k: k, label: label, ph: ph || '', type: 'text' }, extra || {}); };
  var IDENT = [F('prenom', 'Prénom', 'Camille'), F('nom', 'Nom', 'Durand'), F('titre', 'Titre du CV', 'Éducatrice football · BPJEPS en cours', { wide: true }), F('ville', 'Ville', 'Cherbourg-en-Cotentin'),
    F('email', 'E-mail affiché', 'prenom.nom@exemple.fr', { type: 'email' }), F('tel', 'Téléphone affiché', '06 …', { type: 'tel' }), F('mobilite', 'Mobilité, permis', 'Permis B, véhiculée, Manche')];
  var LISTES = [
    { id: 'sport', title: 'Parcours sportif', add: 'Ajouter une saison ou un club', champs: [F('club', 'Club', 'ES Pointe Hague'), F('periode', 'Saisons', '2021 – 2026'), F('role', 'Rôle', 'Joueuse, éducatrice, arbitre, bénévole…'), F('niveau', 'Niveau, catégorie', 'Régional 2, U15…'), F('detail', 'Faits marquants', 'Capitanat, titres, montée…', { type: 'textarea', wide: true })] },
    { id: 'experiences', title: 'Expériences', add: 'Ajouter une expérience', champs: [F('poste', 'Poste', 'Animatrice sportive'), F('structure', 'Structure', 'Ville, association, entreprise'), F('periode', 'Période', 'sept. 2024 – aujourd’hui'), F('lieu', 'Lieu', 'Cherbourg-en-Cotentin'), F('detail', 'Missions', 'Ce que vous faisiez, ce que vous avez appris', { type: 'textarea', wide: true })] },
    { id: 'formations', title: 'Formation et diplômes', add: 'Ajouter un diplôme', champs: [F('diplome', 'Diplôme ou formation', 'BPJEPS Activités sports collectifs'), F('etablissement', 'Établissement', 'CREPS, lycée, université…'), F('annee', 'Année', '2025'), F('detail', 'Précisions', 'Option, mention, en cours…', { wide: true })] },
    { id: 'benevolat', title: 'Engagement associatif', add: 'Ajouter un engagement', champs: [F('mission', 'Mission', 'Trésorière, encadrement des U9…'), F('structure', 'Association', 'Nom de l’association'), F('periode', 'Période', 'Depuis 2022'), F('detail', 'Précisions', '', { wide: true })] },
    { id: 'langues', title: 'Langues', add: 'Ajouter une langue', champs: [F('langue', 'Langue', 'Anglais'), F('niveau', 'Niveau', 'B2, courant, notions…')] }
  ];
  var LIST_KEYS = LISTES.reduce(function (o, l) { o[l.id] = l.champs.map(function (f) { return f.k; }); return o; }, {});
  var vide = function () { return { v: 1, prenom: '', nom: '', titre: '', ville: '', email: '', tel: '', mobilite: '', accroche: '', competences: '', interets: '', sport: [], experiences: [], formations: [], benevolat: [], langues: [], options: { photo: true, contact: true, nb: true } }; };
  var str = function (v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n); };
  function clean(cv) {
    var o = vide(); cv = cv || {};
    IDENT.forEach(function (f) { o[f.k] = str(cv[f.k], f.k === 'titre' ? 140 : 120); });
    o.accroche = str(cv.accroche, 700); o.competences = str(cv.competences, 600); o.interets = str(cv.interets, 300);
    LISTES.forEach(function (l) { o[l.id] = (Array.isArray(cv[l.id]) ? cv[l.id] : []).slice(0, 12).map(function (it) { var r = {}; LIST_KEYS[l.id].forEach(function (k) { r[k] = str(it && it[k], k === 'detail' ? 600 : 140); }); return r; }); });
    var op = cv.options || {}; o.options = { photo: op.photo !== false, contact: op.contact !== false, nb: op.nb !== false };
    return o;
  }
  /* forme canonique : ce que la certification atteste (le contenu, pas l’affichage ni les coordonnées) */
  function canon(cv) {
    var c = clean(cv), o = { v: 1, prenom: c.prenom, nom: c.nom, titre: c.titre, ville: c.ville, accroche: c.accroche, competences: c.competences, interets: c.interets };
    LISTES.forEach(function (l) { o[l.id] = c[l.id].filter(function (it) { return LIST_KEYS[l.id].some(function (k) { return it[k]; }); }).map(function (it) { return LIST_KEYS[l.id].map(function (k) { return it[k]; }); }); });
    return JSON.stringify(o);
  }
  function manque(cv) {
    var c = clean(cv), m = [];
    if (!c.prenom || !c.nom) m.push('vos prénom et nom');
    if (!c.titre) m.push('le titre du CV');
    if (!c.sport.length && !c.experiences.length && !c.benevolat.length) m.push('au moins une ligne de parcours sportif, d’expérience ou d’engagement');
    return m;
  }
  /* SHA-256 (UTF-8) en JavaScript pur : repli quand crypto.subtle n’est pas disponible */
  function sha256(msg) {
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var bytes = unescape(encodeURIComponent(String(msg))), n = bytes.length, words = [], i;
    for (i = 0; i < n; i++) words[i >> 2] |= (bytes.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    words[n >> 2] |= 0x80 << (24 - (n % 4) * 8);
    var len = ((n + 8) >> 6) * 16 + 16; for (i = words.length; i < len; i++) words[i] = words[i] || 0;
    words[len - 1] = n * 8;
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], W = new Array(64);
    var rot = function (x, r) { return (x >>> r) | (x << (32 - r)); };
    for (var b = 0; b < len; b += 16) {
      var a = H[0], bb = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        if (i < 16) W[i] = words[b + i] | 0;
        else { var x = W[i - 15], y = W[i - 2]; W[i] = (((rot(x, 7) ^ rot(x, 18) ^ (x >>> 3)) + W[i - 7]) | 0) + (((rot(y, 17) ^ rot(y, 19) ^ (y >>> 10)) + W[i - 16]) | 0) | 0; }
        var t1 = (h + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        var t2 = ((rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + bb) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
  }
  var ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  var certIdFrom = function (bytes, year) { var s = ''; for (var i = 0; i < 6; i++) s += ALPHA[bytes[i] % 32]; return 'CB-' + year + '-' + s; };
  var CHECKS = [['identite', 'Identité vérifiée (pièce présentée ou personne connue de l’équipe)'], ['sport', 'Parcours sportif confirmé par le ou les clubs'], ['diplomes', 'Diplômes ou attestations vus'], ['photo', 'Photo conforme à la personne']];
  return { IDENT: IDENT, LISTES: LISTES, LIST_KEYS: LIST_KEYS, vide: vide, clean: clean, canon: canon, manque: manque, sha256: sha256, certIdFrom: certIdFrom, CHECKS: CHECKS, ALPHA: ALPHA };
})();

/* ================= interface (navigateur seulement) ================= */
(function (R) {
  'use strict';
  if (typeof window === 'undefined') return;
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var fmtDate = function (iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); };
  var ev = function (e) { return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; };
  var readLS = function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var writeLS = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  var srvPublic = function () { return !!(window.CB && window.CB.call && window.CB_SERVER); };
  var srvStaff = function () { return !!(window.CB && window.CB.user && window.CB.call); };
  var call = function (m, p, b) { return window.CB.call(m, p, b); };
  var U = function (self) { return self.state.cvu || {}; };
  var ui = function (self, p) { self.setState({ cvu: Object.assign({}, self.state.cvu || {}, p) }); };
  var pill = function (on) { return { bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pressed: on ? 'true' : 'false' }; };

  /* empreinte : crypto.subtle si disponible, sinon SHA-256 en JS (même résultat) */
  function hash(txt) {
    try {
      if (window.crypto && window.crypto.subtle && window.TextEncoder) return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }).catch(function () { return R.sha256(txt); });
    } catch (e) { /* repli */ }
    return Promise.resolve(R.sha256(txt));
  }
  R.hash = hash;

  /* ---------- profil (par adresse e-mail, sur cet appareil) ---------- */
  var keyOf = function (self) { return 'cb-profil-v1:' + (String(self.state.email || '').trim().toLowerCase() || 'invite'); };
  function prof(self) {
    var k = keyOf(self);
    if (self.state.cvProf && self.state.cvProf._k === k) return self.state.cvProf;
    var p = Object.assign({ photo: '', cv: R.vide(), cert: null, dem: null, mr: [] }, readLS(k, {}));
    p.cv = R.clean(p.cv); p._k = k;
    self.state.cvProf = p; // première lecture : pas de nouveau rendu
    return p;
  }
  function setProf(self, patch, quiet) {
    var p = Object.assign({}, prof(self), patch); p._k = keyOf(self);
    var keep = Object.assign({}, p); delete keep._k;
    var ok = writeLS(p._k, keep);
    if (!ok && !quiet) self.say('Espace de stockage plein sur cet appareil : la photo n’a pas pu être enregistrée');
    self.setState({ cvProf: p });
    return p;
  }
  R.prof = prof; R.setProf = setProf;

  /* ---------- photo : choix, recadrage carré, enregistrement ---------- */
  var FRAME = 280;
  function openFile(self, file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { self.say('Choisissez une image (JPEG, PNG, WebP…)'); return; }
    if (file.size > 25e6) { self.say('Image trop lourde (25 Mo au plus)'); return; }
    var rd = new FileReader();
    rd.onload = function () { var img = new Image(); img.onload = function () { ui(self, { crop: { src: rd.result, w: img.naturalWidth, h: img.naturalHeight, z: 1, cx: img.naturalWidth / 2, cy: img.naturalHeight / 2 } }); }; img.onerror = function () { self.say('Image illisible'); }; img.src = rd.result; };
    rd.readAsDataURL(file);
  }
  function cropGeom(c) { var s0 = FRAME / Math.min(c.w, c.h), k = s0 * c.z; var half = FRAME / 2 / k; var cx = Math.min(Math.max(c.cx, half), c.w - half), cy = Math.min(Math.max(c.cy, half), c.h - half); return { k: k, cx: cx, cy: cy, half: half, l: FRAME / 2 - cx * k, t: FRAME / 2 - cy * k }; }
  function saveCrop(self) {
    var c = U(self).crop; if (!c) return;
    var g = cropGeom(c), img = new Image();
    img.onload = function () {
      var cv = document.createElement('canvas'); cv.width = 512; cv.height = 512; var x = cv.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, 512, 512);
      x.drawImage(img, g.cx - g.half, g.cy - g.half, g.half * 2, g.half * 2, 0, 0, 512, 512);
      var url = cv.toDataURL('image/jpeg', 0.86);
      setProf(self, { photo: url }); ui(self, { crop: null }); self.say('Photo de profil enregistrée');
    };
    img.src = c.src;
  }

  /* ---------- QR code (chemin SVG des modules noirs) ---------- */
  function qrPath(text) {
    if (!window.qrcode || !text) return null;
    try {
      var q = window.qrcode(0, 'M'); q.addData(text); q.make();
      var n = q.getModuleCount(), d = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
      return { n: n, d: d, vb: '-2 -2 ' + (n + 4) + ' ' + (n + 4), q: q };
    } catch (e) { return null; }
  }

  /* ---------- vérification d’un certificat ---------- */
  function verifUrl(id) { var base = window.CASA_SITE_URL || (window.CB_SERVER && /^https?:/.test(location.protocol) ? location.origin : ''); return base ? base.replace(/\/+$/, '') + '/?verifier=' + encodeURIComponent(id) : ''; }

  /* ---------- enregistrer un fichier ----------
   * Sur le site et dans l’application installée : lien de téléchargement classique.
   * Dans l’aperçu publié sur claude.ai (artefact) : capacité « downloads », le visiteur confirme l’enregistrement ;
   * sa disponibilité est sondée une fois (DL) pour n’afficher que les boutons qui fonctionnent. */
  var DL = null, DLW = [];
  function dlProbe(self) {
    if (!window.CASA_ARTIFACT) return true;
    if (DL === true || DL === false) return DL;
    if (self && DLW.indexOf(self) < 0) DLW.push(self);
    if (DL === null) {
      var w = window;
      if (w.CB_SERVER || !w.claude || typeof w.claude.use !== 'function') { DL = false; return false; }
      DL = 'attente';
      w.claude.use('downloads').then(function (d) { DL = !!d; }, function () { DL = false; }).then(function () {
        DLW.forEach(function (x) { try { x.setState({ cvTick: (x.state.cvTick || 0) + 1 }); } catch (e) { /* vue démontée */ } }); DLW = [];
      });
    }
    return false;
  }
  function saveBlob(self, blob, name, okMsg, repli) {
    var nope = function () { if (repli) repli(); else self.say('Téléchargement indisponible ici : passez par le site ou l’application installée'); };
    if (window.CASA_ARTIFACT) {
      if (dlProbe(self) !== true) { nope(); return; }
      window.claude.use('downloads').then(function (d) { if (!d) throw { code: 'unavailable' }; return d.save({ filename: name, data: blob }); }).then(function (res) { if (!res || res.status !== 'delivered') self.say(okMsg); }, function (e) {
        var code = e && e.code; if (code === 'declined') return;
        if (code === 'rate_limited') { self.say('Un enregistrement attend déjà votre confirmation'); return; }
        nope();
      });
      return;
    }
    try { var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1500); self.say(okMsg); } catch (e) { self.say('Export impossible ici'); }
  }
  R.dlProbe = dlProbe; R.saveBlob = saveBlob;

  /* ---------- rendu PNG (A4, 150 ppp) : même mise en page que l’aperçu ---------- */
  function toPng(self, v) {
    var W = 1240, H = 1754, M = 96;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var g = cv.getContext('2d');
    var SP = "'League Spartan', 'Arial Black', sans-serif", BODY = "'Mulish', system-ui, sans-serif";
    var wrap = function (txt, x, y, maxW, lh, font, color, maxLines) {
      g.font = font; g.fillStyle = color || '#111'; var words = String(txt || '').split(/\s+/), line = '', n = 0;
      for (var i = 0; i < words.length; i++) { var t = line ? line + ' ' + words[i] : words[i]; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, y); y += lh; n++; line = words[i]; if (maxLines && n >= maxLines) return y; } else line = t; }
      if (line) { g.fillText(line, x, y); y += lh; } return y;
    };
    var band = function (txt, x, y, size) { g.font = '800 ' + size + 'px ' + SP; var w = g.measureText(txt).width; g.fillStyle = '#000'; g.fillRect(x, y - size * 0.92, w + size * 0.5, size * 1.12); g.fillStyle = '#fff'; g.fillText(txt, x + size * 0.25, y); return y + size * 1.2; };
    var draw = function (photo, logo) {
      g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#000'; g.fillRect(0, 0, W, 120);
      if (logo) g.drawImage(logo, M, 30, 60 * 1044 / 179, 60); else { g.font = '800 40px ' + SP; g.fillStyle = '#fff'; g.fillText('CASA BESPORTS +', M, 76); }
      g.font = '700 22px ' + SP; g.fillStyle = '#fff'; g.textAlign = 'right'; g.fillText('CURRICULUM VITÆ', W - M, 70); g.textAlign = 'left';
      var y = 210, x0 = M;
      if (photo) { var ps = 250; g.drawImage(photo, M, 170, ps, ps); x0 = M + ps + 44; }
      y = band(String(v.prenom || '').toUpperCase(), x0, y + 30, 64); y = band(String(v.nom || '').toUpperCase(), x0, y + 4, 64);
      y = wrap(v.titre, x0, y + 34, W - x0 - M - (v.certOk ? 220 : 0), 38, '700 30px ' + SP, '#000', 2);
      y = wrap(v.contact, x0, y + 6, W - x0 - M, 28, '600 21px ' + BODY, '#444', 2);
      if (v.certOk) { var sx = W - M - 190, sy = 160; g.fillStyle = '#000'; g.fillRect(sx, sy, 190, 190); g.fillStyle = '#fff'; g.textAlign = 'center'; g.font = '800 26px ' + SP; g.fillText('CERTIFIÉ', sx + 95, sy + 70); g.font = '700 17px ' + SP; g.fillText('CASA BESPORTS +', sx + 95, sy + 100); g.font = '600 15px ' + BODY; g.fillText(v.cert.id, sx + 95, sy + 140); g.textAlign = 'left'; }
      y = Math.max(y, photo ? 460 : y) + 26;
      if (v.accroche) { y = wrap(v.accroche, M, y, W - 2 * M, 32, '600 23px ' + BODY, '#222') + 18; }
      var colW = 720, sideX = M + colW + 50, sideW = W - sideX - M, ys = y;
      v.sections.forEach(function (sec) {
        if (y > H - 300) return;
        g.font = '800 22px ' + SP; var tw = g.measureText(sec.title.toUpperCase()).width; g.fillStyle = '#000'; g.fillRect(M, y, tw + 24, 36); g.fillStyle = '#fff'; g.fillText(sec.title.toUpperCase(), M + 12, y + 26); y += 58;
        sec.items.forEach(function (it) {
          if (y > H - 260) return;
          g.font = '800 22px ' + SP; g.fillStyle = '#000'; g.fillText(it.t, M, y); if (it.per) { g.font = '600 18px ' + BODY; g.fillStyle = '#555'; g.textAlign = 'right'; g.fillText(it.per, M + colW, y); g.textAlign = 'left'; }
          y += 28; if (it.s) y = wrap(it.s, M, y, colW, 26, '700 18px ' + BODY, '#333', 2);
          if (it.d) y = wrap(it.d, M, y, colW, 26, '500 18px ' + BODY, '#333', 4); y += 16;
        });
        y += 10;
      });
      var yy = ys;
      var sideTitle = function (t) { g.font = '800 20px ' + SP; var tw2 = g.measureText(t).width; g.fillStyle = '#000'; g.fillRect(sideX, yy, tw2 + 20, 32); g.fillStyle = '#fff'; g.fillText(t, sideX + 10, yy + 23); yy += 50; };
      if (v.competences.length) { sideTitle('COMPÉTENCES'); v.competences.forEach(function (c) { yy = wrap('— ' + c.t, sideX, yy, sideW, 26, '600 18px ' + BODY, '#222', 2); }); yy += 18; }
      if (v.langues.length) { sideTitle('LANGUES'); v.langues.forEach(function (l) { yy = wrap(l.t + (l.n ? ' · ' + l.n : ''), sideX, yy, sideW, 26, '600 18px ' + BODY, '#222', 2); }); yy += 18; }
      if (v.interets) { sideTitle('CENTRES D’INTÉRÊT'); yy = wrap(v.interets, sideX, yy, sideW, 26, '600 18px ' + BODY, '#222', 5); }
      g.fillStyle = '#000'; g.fillRect(0, H - 150, W, 150);
      if (v.qr && v.qr.q) { var n = v.qr.n, cell = Math.floor(110 / (n + 2)), qx = W - M - cell * (n + 2), qy = H - 135; g.fillStyle = '#fff'; g.fillRect(qx, qy, cell * (n + 2), cell * (n + 2)); g.fillStyle = '#000'; for (var r = 0; r < n; r++) for (var c2 = 0; c2 < n; c2++) if (v.qr.q.isDark(r, c2)) g.fillRect(qx + (c2 + 1) * cell, qy + (r + 1) * cell, cell, cell); }
      wrap(v.pied, M, H - 92, W - 2 * M - 150, 28, '600 19px ' + BODY, '#fff', 3);
      return cv;
    };
    var load = function (src) { return new Promise(function (ok) { if (!src) return ok(null); var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ok(null); }; im.src = src; }); };
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    return ready.then(function () { return Promise.all([load(v.hasPhoto ? v.photo : ''), load(v.logo)]); }).then(function (r) {
      var photo = r[0];
      if (photo && v.nb) { var t = document.createElement('canvas'); t.width = photo.naturalWidth; t.height = photo.naturalHeight; var tg = t.getContext('2d'); tg.filter = 'grayscale(1)'; tg.drawImage(photo, 0, 0); photo = t; }
      return draw(photo, r[1]);
    });
  }

  /* ================= valeurs du gabarit ================= */
  R.vals = function (self, c) {
    var s = self.state, u = U(self), out = { prof: {}, cv: {}, verif: {}, adm: {}, avatar: '' };
    try {
      var P = prof(self), cv = P.cv;
      out.avatar = s.loggedIn ? P.photo || '' : '';
      /* ---------- empreinte du CV courant (asynchrone, mise en cache) ---------- */
      var can = R.canon(cv), cur = self._cvHash || {};
      if (cur.src !== can) { self._cvHash = { src: can, h: '' }; hash(can).then(function (h) { if (self._cvHash && self._cvHash.src === can) { self._cvHash.h = h; self.setState({ cvTick: (self.state.cvTick || 0) + 1 }); } }); }
      var curPh = self._cvPh || {};
      if (curPh.src !== P.photo) { self._cvPh = { src: P.photo, h: '' }; if (P.photo) hash(P.photo).then(function (h) { if (self._cvPh && self._cvPh.src === P.photo) { self._cvPh.h = h; self.setState({ cvTick: (self.state.cvTick || 0) + 1 }); } }); }
      var h = (self._cvHash || {}).h, ph = P.photo ? (self._cvPh || {}).h : '';
      var cert = P.cert;
      var certState = !cert ? 'aucun' : !h || (P.photo && !ph) ? 'calcul' : cert.h === h && (cert.ph || '') === (ph || '') ? 'valide' : 'modifie';
      if (cert && cert.revoque) certState = 'revoque';
      var dem = P.dem;
      /* suivi de la demande de certification (serveur) */
      if (dem && dem.statut === 'en attente' && dem.key && srvPublic() && !self._cvPoll && (c.V === 'account' || c.V === 'cv')) {
        self._cvPoll = true;
        call('GET', '/cv/demandes/' + encodeURIComponent(dem.ref) + '?k=' + encodeURIComponent(dem.key)).then(function (r) {
          var patch = { dem: Object.assign({}, dem, { statut: r.statut, note: r.note || '' }) };
          if (r.certificat) patch.cert = r.certificat;
          setProf(self, patch, true);
        }).catch(function () {}).then(function () { setTimeout(function () { self._cvPoll = false; }, 30000); });
      }
      var statutTxt = certState === 'valide' ? 'Certifié Casa Besports · n° ' + cert.id : certState === 'modifie' ? 'Modifié depuis la certification n° ' + cert.id + ' : à renouveler' : certState === 'revoque' ? 'Certificat révoqué par Casa Besports' :
        dem && dem.statut === 'en attente' ? 'Certification demandée le ' + fmtDate(dem.at) + ' : en cours de vérification' : dem && dem.statut === 'complement' ? 'Complément demandé par l’équipe' + (dem.note ? ' : ' + dem.note : '') : dem && dem.statut === 'refusee' ? 'Certification non accordée' + (dem.note ? ' : ' + dem.note : '') : (cv.prenom || cv.titre ? 'Brouillon : non certifié' : 'À remplir');
      var stCls = certState === 'valide' ? 'cvst-ok' : certState === 'modifie' || certState === 'revoque' || (dem && ['complement', 'refusee'].indexOf(dem.statut) >= 0) ? 'cvst-warn' : dem && dem.statut === 'en attente' ? 'cvst-wait' : 'cvst-draft';

      /* ---------- profil (Mon espace) ---------- */
      var crop = u.crop || null, cg = crop ? cropGeom(crop) : null;
      out.prof = {
        hasPhoto: !!P.photo, photo: P.photo || '', noPhoto: !P.photo, photoLabel: P.photo ? 'Changer la photo' : 'Ajouter une photo',
        onFile: function (e) { var f = e.target.files && e.target.files[0]; openFile(self, f); e.target.value = ''; },
        recadrer: function () { if (P.photo) { var img = new Image(); img.onload = function () { ui(self, { crop: { src: P.photo, w: img.naturalWidth, h: img.naturalHeight, z: 1, cx: img.naturalWidth / 2, cy: img.naturalHeight / 2 } }); }; img.src = P.photo; } },
        askRemove: function () { ui(self, { rmPhoto: true }); }, rmAsk: !!u.rmPhoto, rmCancel: function () { ui(self, { rmPhoto: false }); },
        remove: function () { setProf(self, { photo: '' }); ui(self, { rmPhoto: false }); self.say('Photo retirée'); },
        crop: crop ? { open: true, src: crop.src, w: (crop.w * cg.k).toFixed(1) + 'px', h: (crop.h * cg.k).toFixed(1) + 'px', l: cg.l.toFixed(1) + 'px', t: cg.t.toFixed(1) + 'px', z: String(crop.z),
          onZ: function (e) { var cc = U(self).crop; if (!cc) return; var z = Math.max(1, Math.min(4, +ev(e) || 1)); var gg = cropGeom(Object.assign({}, cc, { z: z })); ui(self, { crop: Object.assign({}, cc, { z: z, cx: gg.cx, cy: gg.cy }) }); },
          down: function (e) {
            var frame = e.currentTarget, img = frame.querySelector('img'), cc = U(self).crop; if (!cc || !img) return;
            var g0 = cropGeom(cc), x0 = e.clientX, y0 = e.clientY, cx0 = g0.cx, cy0 = g0.cy, last = null;
            try { frame.setPointerCapture(e.pointerId); } catch (er) { /* facultatif */ }
            var mv = function (m) { var dx = m.clientX - x0, dy = m.clientY - y0; var t = Object.assign({}, cc, { cx: cx0 - dx / g0.k, cy: cy0 - dy / g0.k }); var gg = cropGeom(t); last = gg; img.style.left = gg.l + 'px'; img.style.top = gg.t + 'px'; };
            var up = function () { frame.removeEventListener('pointermove', mv); frame.removeEventListener('pointerup', up); frame.removeEventListener('pointercancel', up); if (last) ui(self, { crop: Object.assign({}, U(self).crop, { cx: last.cx, cy: last.cy }) }); };
            frame.addEventListener('pointermove', mv); frame.addEventListener('pointerup', up); frame.addEventListener('pointercancel', up);
            if (e.preventDefault) e.preventDefault();
          },
          save: function () { saveCrop(self); }, cancel: function () { ui(self, { crop: null }); },
          other: function (e) { var f = e.target.files && e.target.files[0]; openFile(self, f); e.target.value = ''; } } : { open: false },
        cvStatut: statutTxt, cvCls: stCls, cvVide: !cv.prenom && !cv.titre, cvLabel: !cv.prenom && !cv.titre ? 'Remplir mon CV' : 'Modifier mon CV', goCv: function () { c.go('cv'); },
        email: s.email || '',
        mrs: (P.mr || []).map(function (m) { return { ref: m.ref, commerce: m.commerce, objet: m.objet || '', at: fmtDate(m.at), statut: m.statut || 'Envoyée à Casa Besports' }; }), hasMr: (P.mr || []).length > 0, noMr: !(P.mr || []).length
      };
      /* suivi des mises en relation (statut public) */
      if (srvPublic() && c.V === 'account' && (P.mr || []).length && !self._mrPoll) {
        self._mrPoll = true;
        Promise.all((P.mr || []).map(function (m) { return m.key ? call('GET', '/mises-en-relation/' + encodeURIComponent(m.ref) + '/suivi?k=' + encodeURIComponent(m.key)).then(function (r) { return Object.assign({}, m, { statut: r.statutLabel || m.statut }); }).catch(function () { return m; }) : Promise.resolve(m); }))
          .then(function (l) { setProf(self, { mr: l }, true); }).then(function () { setTimeout(function () { self._mrPoll = false; }, 60000); });
      }

      /* ---------- éditeur de CV ---------- */
      if (c.V === 'cv' || c.V === 'account' || (c.V === 'studio' && self.state.studioTab === 'reseau')) {
        /* pendant la saisie, rien n’est tronqué ni nettoyé (les espaces en fin de mot restent) : le nettoyage se fait à l’envoi */
        var setCv = function (patch) { setProf(self, { cv: Object.assign({}, prof(self).cv, patch) }); };
        var on = function (k) { return function (e) { var o = {}; o[k] = ev(e); setCv(o); }; };
        var lists = R.LISTES.map(function (L) {
          var arr = cv[L.id] || [];
          var upd = function (i, k, val) { var a = (prof(self).cv[L.id] || []).map(function (x) { return Object.assign({}, x); }); a[i] = Object.assign({}, a[i]); a[i][k] = val; var o = {}; o[L.id] = a; setCv(o); };
          return { id: L.id, title: L.title, add: L.add, n: String(arr.length), empty: arr.length === 0,
            items: arr.map(function (it, i) { return { n: String(i + 1),
              fields: L.champs.map(function (f) { return { label: f.label, ph: f.ph, val: it[f.k] || '', isArea: f.type === 'textarea', isText: f.type !== 'textarea', wide: f.wide ? 'is-wide' : '', on: function (e) { upd(i, f.k, ev(e)); } }; }),
              remove: function () { var a = (prof(self).cv[L.id] || []).slice(); a.splice(i, 1); var o = {}; o[L.id] = a; setCv(o); },
              up: function () { if (!i) return; var a = (prof(self).cv[L.id] || []).slice(); var t = a[i - 1]; a[i - 1] = a[i]; a[i] = t; var o = {}; o[L.id] = a; setCv(o); }, canUp: i > 0 }; }),
            addItem: function () { var a = (prof(self).cv[L.id] || []).concat([{}]); var o = {}; o[L.id] = a; setCv(o); }, full: arr.length >= 12, notFull: arr.length < 12 };
        });
        var r = renderModel(self, P, cv, cert, certState);
        var seg = u.seg || 'form';
        out.cv = {
          ident: R.IDENT.map(function (f) { return { label: f.label, ph: f.ph, val: cv[f.k] || '', type: f.type, wide: f.wide ? 'is-wide' : '', on: on(f.k) }; }),
          accroche: cv.accroche, onAccroche: on('accroche'), competences: cv.competences, onCompetences: on('competences'), interets: cv.interets, onInterets: on('interets'),
          lists: lists,
          optPhoto: cv.options.photo, optContact: cv.options.contact, optNb: cv.options.nb,
          onOptPhoto: function (e) { setCv({ options: Object.assign({}, cv.options, { photo: !!ev(e) }) }); }, onOptContact: function (e) { setCv({ options: Object.assign({}, cv.options, { contact: !!ev(e) }) }); }, onOptNb: function (e) { setCv({ options: Object.assign({}, cv.options, { nb: !!ev(e) }) }); },
          r: r, statut: statutTxt, stCls: stCls,
          segs: [['form', 'Formulaire'], ['apercu', 'Aperçu']].map(function (x) { return Object.assign(pill(seg === x[0]), { label: x[1], pick: function () { ui(self, { seg: x[0] }); } }); }),
          segForm: seg === 'form' ? '' : 'is-hidden-m', segApercu: seg === 'apercu' ? '' : 'is-hidden-m',
          canPrint: !window.CASA_ARTIFACT, canPng: dlProbe(self) === true,
          exportNote: !window.CASA_ARTIFACT ? '' : dlProbe(self) === true ? 'L’impression en PDF se fait depuis le site ou l’application installée.' : 'L’impression et le téléchargement sont disponibles sur le site et dans l’application installée.',
          imprimer: function () {
            try {
              var src = document.getElementById('cv-page'); if (!src) return;
              var root = document.createElement('div'); root.id = 'cv-print-root'; var copy = src.cloneNode(true); copy.removeAttribute('id'); root.appendChild(copy); document.body.appendChild(root);
              document.documentElement.classList.add('cv-print');
              var fin = function () { document.documentElement.classList.remove('cv-print'); if (root.parentNode) root.parentNode.removeChild(root); window.removeEventListener('afterprint', fin); };
              window.addEventListener('afterprint', fin);
              setTimeout(function () { window.print(); setTimeout(fin, 1500); }, 80);
            } catch (e) { self.say('Impression indisponible ici'); }
          },
          png: function () {
            var name = 'cv-casa-besports-' + (String(cv.prenom + '-' + cv.nom).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'membre') + '.png';
            toPng(self, r).then(function (canvas) { return new Promise(function (ok, ko) { canvas.toBlob(function (b) { if (b) ok(b); else ko(new Error('png')); }, 'image/png'); }); })
              .then(function (blob) { saveBlob(self, blob, name, 'Image du CV enregistrée'); }).catch(function () { self.say('Export impossible ici'); });
          },
          /* certification */
          canAsk: certState !== 'valide' && !(dem && dem.statut === 'en attente') && s.loggedIn, isPending: !!(dem && dem.statut === 'en attente'), needLogin: !s.loggedIn,
          askLabel: certState === 'modifie' || certState === 'revoque' ? 'Demander une nouvelle certification' : 'Demander la certification Casa Besports',
          manque: R.manque(cv).join(', '), hasManque: R.manque(cv).length > 0,
          ask: function () {
            var m = R.manque(prof(self).cv); if (m.length) { self.say('Complétez d’abord : ' + m.join(', ')); return; }
            if (!/.+@.+\..+/.test(s.email || '')) { self.say('Connectez-vous avec votre e-mail pour demander la certification'); return; }
            var payload = { cv: prof(self).cv, photo: prof(self).photo || '', email: s.email, nom: (cv.prenom + ' ' + cv.nom).trim() };
            if (srvPublic()) {
              call('POST', '/cv/demandes', payload).then(function (res) { setProf(self, { dem: { ref: res.ref, key: res.key, statut: 'en attente', at: new Date().toISOString() } }); self.say('Demande envoyée : l’équipe vérifie votre parcours'); }).catch(function (e) { self.say(e.message || 'Envoi impossible'); });
            } else {
              var l = readLS('cb-cvdem-v1', []); var ref = 'CV-' + Date.now().toString(36).toUpperCase();
              l.unshift({ ref: ref, at: new Date().toISOString(), statut: 'en attente', email: s.email, nom: payload.nom, cv: payload.cv, photo: payload.photo, profKey: keyOf(self), demo: true }); writeLS('cb-cvdem-v1', l);
              setProf(self, { dem: { ref: ref, key: 'demo', statut: 'en attente', at: new Date().toISOString() } }); self.say('Demande enregistrée (démonstration) : l’administrateur la traite dans Espace rédaction › Réseau');
            }
          },
          retirer: function () {
            if (dem && dem.key && srvPublic()) call('DELETE', '/cv/demandes/' + encodeURIComponent(dem.ref) + '?k=' + encodeURIComponent(dem.key)).catch(function () {});
            if (!srvPublic()) writeLS('cb-cvdem-v1', readLS('cb-cvdem-v1', []).filter(function (x) { return !dem || x.ref !== dem.ref; }));
            setProf(self, { dem: null }); self.say('Demande retirée');
          },
          verifier: function () { if (cert) c.go('verifier', { verifId: cert.id }); }
        };
      }

      /* ---------- vérification publique ---------- */
      if (c.V === 'verifier') {
        var vid = String(u.vq != null ? u.vq : (s.verifId || '')).trim().toUpperCase();
        var res = u.vres && u.vres.id === vid ? u.vres : null;
        var lancer = function () {
          var id = String(U(self).vq != null ? U(self).vq : (self.state.verifId || '')).trim().toUpperCase(); if (!id) return;
          if (srvPublic()) call('GET', '/cv/verifier/' + encodeURIComponent(id)).then(function (r2) { ui(self, { vres: Object.assign({ id: id }, r2) }); }).catch(function () { ui(self, { vres: { id: id, introuvable: true } }); });
          else { var l2 = readLS('cb-certs-demo-v1', {}); var x = l2[id]; ui(self, { vres: x ? Object.assign({ id: id, valide: !x.revoque, statut: x.revoque ? 'révoqué' : 'valide', demo: true }, x) : { id: id, introuvable: true } }); }
        };
        if (vid && !res && !self._vAuto) { self._vAuto = vid; setTimeout(lancer, 0); }
        out.verif = { q: vid, onQ: function (e) { ui(self, { vq: ev(e), vres: null }); self._vAuto = null; }, go: lancer, has: !!res, ok: !!(res && res.valide), ko: !!(res && !res.valide && !res.introuvable), absent: !!(res && res.introuvable),
          nom: res ? res.nom || '' : '', titre: res ? res.titre || '' : '', emis: res ? fmtDate(res.emisLe) : '', par: res ? res.par || '' : '', statut: res ? res.statut || '' : '', empreinte: res && res.h ? res.h.slice(0, 16) : '', demo: !!(res && res.demo) };
      }

      /* ---------- administration : certifications ---------- */
      if (c.V === 'studio' && c.canReseau && self.state.studioTab === 'reseau') out.adm = admCv(self, c);
    } catch (e) { if (typeof console !== 'undefined') console.error('[cv]', e); }
    return out;
  };

  function renderModel(self, P, cv, cert, certState) {
    var o = cv.options || {};
    var sections = [];
    var it = function (t, s, per, d) { return { t: t || '', s: s || '', per: per || '', d: d || '', hasS: !!s, hasD: !!d, hasPer: !!per }; };
    if (cv.sport.length) sections.push({ title: 'Parcours sportif', items: cv.sport.map(function (x) { return it(x.club || '[Club]', [x.role, x.niveau].filter(Boolean).join(' · '), x.periode, x.detail); }) });
    if (cv.experiences.length) sections.push({ title: 'Expériences', items: cv.experiences.map(function (x) { return it(x.poste || '[Poste]', [x.structure, x.lieu].filter(Boolean).join(' · '), x.periode, x.detail); }) });
    if (cv.formations.length) sections.push({ title: 'Formation et diplômes', items: cv.formations.map(function (x) { return it(x.diplome || '[Diplôme]', x.etablissement, x.annee, x.detail); }) });
    if (cv.benevolat.length) sections.push({ title: 'Engagement associatif', items: cv.benevolat.map(function (x) { return it(x.mission || '[Mission]', x.structure, x.periode, x.detail); }) });
    var comp = String(cv.competences || '').split(/[,;\n]/).map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 18).map(function (t) { return { t: t }; });
    var lang = (cv.langues || []).filter(function (l) { return l.langue; }).map(function (l) { return { t: l.langue, n: l.niveau || '' }; });
    var ok = certState === 'valide';
    var url = cert ? verifUrl(cert.id) : '';
    var qr = ok && url ? qrPath(url) : null;
    var demo = !!(cert && cert.demo);
    return {
      prenom: cv.prenom || 'Prénom', nom: cv.nom || 'Nom', fullname: ((cv.prenom || '') + ' ' + (cv.nom || '')).trim() || 'Prénom Nom', titre: cv.titre || 'Titre du CV : poste, spécialité, objectif',
      contact: o.contact !== false ? [cv.ville, cv.email, cv.tel, cv.mobilite].filter(Boolean).join(' · ') : [cv.ville, cv.mobilite].filter(Boolean).join(' · '),
      hasPhoto: !!(P.photo && o.photo !== false), photo: P.photo || '', nb: o.nb !== false, photoCls: o.nb !== false ? 'is-nb' : '',
      accroche: cv.accroche || '', hasAccroche: !!cv.accroche, sections: sections, noSections: !sections.length,
      competences: comp, hasComp: comp.length > 0, langues: lang, hasLang: lang.length > 0, interets: cv.interets || '', hasInterets: !!cv.interets, hasSide: comp.length > 0 || lang.length > 0 || !!cv.interets,
      certOk: ok, cert: cert ? { id: cert.id, emis: fmtDate(cert.emisLe), par: cert.par || 'l’équipe Casa Besports' } : {}, hasQr: !!qr, qr: qr || {}, qrD: qr ? qr.d : '', qrVb: qr ? qr.vb : '0 0 1 1',
      demo: demo, sceauSub: demo ? 'Spécimen de démonstration' : 'Parcours vérifié',
      pied: ok ? 'Certifié Casa Besports · n° ' + cert.id + ' · émis le ' + fmtDate(cert.emisLe) + (url ? ' · vérification : ' + url.replace(/^https?:\/\//, '') : ' · vérification sur le site Casa Besports, rubrique « Vérifier un certificat »') + (demo ? ' · spécimen sans valeur' : '')
        : certState === 'modifie' ? 'CV modifié depuis sa certification n° ' + cert.id + ' : la certification doit être renouvelée.' : 'CV établi sur Casa Besports +, le média du sport dans la Manche. Non certifié.',
      logo: (window.ASSET_DATA && window.ASSET_DATA['logo-casabesports.svg']) || 'assets/logo-casabesports.svg'
    };
  }

  function admCv(self, c) {
    var u = U(self), set = function (p) { ui(self, p); };
    var srv = srvStaff();
    var data = self.state.cvAdm;
    if (!data) {
      if (srv) { if (!self._cvAdmL) { self._cvAdmL = true; call('GET', '/cv/demandes').then(function (r) { self.setState({ cvAdm: { list: r.list || [], certs: r.certificats || [], srv: true } }); }).catch(function () { self.setState({ cvAdm: { list: [], certs: [], srv: true } }); }); } data = { list: [], certs: [], srv: true, loading: true }; }
      else data = { list: readLS('cb-cvdem-v1', []), certs: Object.keys(readLS('cb-certs-demo-v1', {})).map(function (k) { return Object.assign({ id: k }, readLS('cb-certs-demo-v1', {})[k]); }), srv: false };
    }
    var reload = function () { self._cvAdmL = false; self.setState({ cvAdm: null }); };
    var pend = data.list.filter(function (d) { return d.statut === 'en attente'; });
    var sel = data.list.find(function (d) { return d.ref === u.cvSel; }) || null;
    var chk = (u.cvChk && sel && u.cvChk.ref === sel.ref) ? u.cvChk : { ref: sel ? sel.ref : '', c: {}, note: '' };
    var detail = null;
    if (sel) {
      var cvx = R.clean(sel.cv);
      var r = renderModel(self, { photo: sel.photo || '' }, cvx, null, 'aucun');
      var decide = function (dec) {
        chk = U(self).cvChk && U(self).cvChk.ref === sel.ref ? U(self).cvChk : chk;
        var all = R.CHECKS.every(function (k) { return k[0] === 'photo' && !sel.photo ? true : !!chk.c[k[0]]; });
        if (dec === 'certifier' && !all) { self.say('Cochez toutes les vérifications avant de certifier'); return; }
        if (dec !== 'certifier' && !String(chk.note || '').trim()) { self.say('Expliquez ce qui manque ou le motif (le membre le verra)'); return; }
        if (data.srv) { call('POST', '/cv/demandes/' + encodeURIComponent(sel.ref) + '/decision', { decision: dec, note: chk.note || '', checks: chk.c }).then(function (res) { reload(); set({ cvSel: '', cvChk: null }); self.say(dec === 'certifier' ? 'CV certifié : n° ' + res.certificat.id : 'Réponse envoyée au membre'); }).catch(function (e) { self.say(e.message); }); return; }
        /* démonstration : certificat spécimen calculé dans le navigateur */
        var at = new Date().toISOString(), list = readLS('cb-cvdem-v1', []);
        var finish = function (certObj) {
          list = list.map(function (d) { return d.ref === sel.ref ? Object.assign({}, d, { statut: dec === 'certifier' ? 'certifie' : dec === 'complement' ? 'complement' : 'refusee', note: chk.note || '', decideLe: at, certificat: certObj || null }) : d; });
          writeLS('cb-cvdem-v1', list);
          var pk = sel.profKey; var pp = readLS(pk, null);
          if (pp) { pp.dem = Object.assign({}, pp.dem || {}, { ref: sel.ref, statut: dec === 'certifier' ? 'certifie' : dec === 'complement' ? 'complement' : 'refusee', note: chk.note || '' }); if (certObj) pp.cert = certObj; writeLS(pk, pp); if (self.state.cvProf && self.state.cvProf._k === pk) self.setState({ cvProf: Object.assign({}, pp, { cv: R.clean(pp.cv), _k: pk }) }); }
          reload(); set({ cvSel: '', cvChk: null }); self.say(certObj ? 'Spécimen de certificat émis (démonstration) : ' + certObj.id : 'Réponse enregistrée (démonstration)');
        };
        if (dec !== 'certifier') { finish(null); return; }
        var bytes = []; for (var i = 0; i < 6; i++) bytes.push(Math.floor(Math.random() * 256));
        var id = R.certIdFrom(bytes, new Date().getFullYear()).replace('CB-', 'DEMO-');
        Promise.all([hash(R.canon(cvx)), sel.photo ? hash(sel.photo) : Promise.resolve('')]).then(function (hs) {
          var certObj = { id: id, h: hs[0], ph: hs[1], nom: (cvx.prenom + ' ' + cvx.nom).trim(), titre: cvx.titre, emisLe: at, par: c.me.name, demo: true };
          var certs = readLS('cb-certs-demo-v1', {}); certs[id] = certObj; writeLS('cb-certs-demo-v1', certs);
          finish(certObj);
        });
      };
      detail = { ref: sel.ref, nom: sel.nom, email: sel.email, at: fmtDate(sel.at), r: r, statut: sel.statut, isPending: sel.statut === 'en attente',
        checks: R.CHECKS.map(function (k) { return { label: k[1], on: !!chk.c[k[0]], toggle: function (e) { var cur = U(self).cvChk && U(self).cvChk.ref === sel.ref ? U(self).cvChk : chk; var cc = Object.assign({}, cur.c); cc[k[0]] = !!ev(e); set({ cvChk: Object.assign({}, cur, { c: cc }) }); } }; }),
        note: chk.note || '', onNote: function (e) { var cur = U(self).cvChk && U(self).cvChk.ref === sel.ref ? U(self).cvChk : chk; set({ cvChk: Object.assign({}, cur, { note: ev(e) }) }); },
        certifier: function () { decide('certifier'); }, complement: function () { decide('complement'); }, refuser: function () { decide('refuser'); }, close: function () { set({ cvSel: '' }); }, demo: !data.srv };
    }
    return {
      loading: !!data.loading, rows: data.list.map(function (d) { var lab = { 'en attente': 'À vérifier', certifie: 'Certifié', complement: 'Complément demandé', refusee: 'Refusé', retiree: 'Retirée' }[d.statut] || d.statut; return { ref: d.ref, nom: d.nom, email: d.email, at: fmtDate(d.at), statut: lab, stCls: d.statut === 'certifie' ? 'cvst-ok' : d.statut === 'en attente' ? 'cvst-wait' : 'cvst-warn', cur: d.ref === u.cvSel ? 'true' : 'false', pick: function () { set({ cvSel: d.ref, cvChk: null }); } }; }),
      noRows: data.list.length === 0, pending: pend.length, hasDetail: !!detail, detail: detail || { r: {}, checks: [] },
      certs: (data.certs || []).map(function (k) { return { id: k.id, nom: k.nom, titre: k.titre || '', emis: fmtDate(k.emisLe), statut: k.revoque ? 'Révoqué' : 'Valide', stCls: k.revoque ? 'cvst-warn' : 'cvst-ok', canRevoke: !k.revoque,
        revoquer: function () {
          if (data.srv) call('POST', '/cv/certificats/' + encodeURIComponent(k.id) + '/revoquer', {}).then(function () { reload(); self.say('Certificat révoqué'); }).catch(function (e) { self.say(e.message); });
          else { var cs = readLS('cb-certs-demo-v1', {}); if (cs[k.id]) { cs[k.id].revoque = true; writeLS('cb-certs-demo-v1', cs); } reload(); self.say('Spécimen révoqué (démonstration)'); }
        } }; }), hasCerts: (data.certs || []).length > 0
    };
  }
  R.pending = function (self) { var d = self.state.cvAdm; if (d) return d.list.filter(function (x) { return x.statut === 'en attente'; }).length; if (!srvStaff()) return readLS('cb-cvdem-v1', []).filter(function (x) { return x.statut === 'en attente'; }).length; return 0; };
})(CasaCV);
if (typeof module !== 'undefined' && module.exports) module.exports = CasaCV;

