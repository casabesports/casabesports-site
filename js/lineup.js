/*!
 * Casa Besports — CASA LINEUP : créer, personnaliser, partager et exporter une composition d'équipe.
 *  - 3 modèles : A Éditorial (portraits verticaux), B Composition officielle (grille), C Terrain tactique (perspective)
 *  - formats 9:16, 1:1, 4:5, 16:9 ; portraits importés (rangés dans la composition, jamais dans un stockage public)
 *  - enregistrement en ligne (supabase/lineups.sql) ou sur l'appareil sans compte
 *  - envoi à un utilisateur, à un club ou à la rédaction, réponse (accepter, refuser, proposer une modification), notification
 *  - confidentialité : privée, staff du club, tout le club, rédaction, publique (avec heure de publication)
 *  - exports PNG, JPG, PDF, SVG (plan tactique), données JSON, vidéo animée (si le navigateur sait l'enregistrer)
 * Ouvert par js/app.js (openLineup) depuis Clubs, Le Terrain, la fiche club, la rédaction ; lien direct ?compo=identifiant.
 * Aucune donnée inventée : un champ vide reste vide (rien n'est affiché à sa place).
 */
(function () {
  'use strict';
  var VERSION = 1;
  var NAVY = '#10283a', SUN = '#f2b33d', MIST = '#e9efee';

  // ---------------------------------------------------------------- disciplines, dispositifs et postes
  // Coordonnées en % du terrain vu du dessus : x de gauche à droite, y de 0 (but adverse, en haut) à 100 (son propre but).
  var SPORTS = {
    football: { label: 'Football à 11', n: 11, subs: 12, field: 'foot', forms: {
      '4-3-3': [[50, 92, 'G'], [14, 72, 'DG'], [37, 76, 'DC'], [63, 76, 'DC'], [86, 72, 'DD'], [30, 52, 'MC'], [50, 58, 'MDC'], [70, 52, 'MC'], [18, 26, 'AG'], [50, 20, 'BU'], [82, 26, 'AD']],
      '4-4-2': [[50, 92, 'G'], [14, 72, 'DG'], [37, 76, 'DC'], [63, 76, 'DC'], [86, 72, 'DD'], [14, 48, 'MG'], [38, 52, 'MC'], [62, 52, 'MC'], [86, 48, 'MD'], [38, 24, 'BU'], [62, 24, 'BU']],
      '3-5-2': [[50, 92, 'G'], [28, 76, 'DC'], [50, 78, 'DC'], [72, 76, 'DC'], [10, 50, 'PG'], [32, 54, 'MC'], [50, 60, 'MDC'], [68, 54, 'MC'], [90, 50, 'PD'], [38, 24, 'BU'], [62, 24, 'BU']],
      '4-2-3-1': [[50, 92, 'G'], [14, 72, 'DG'], [37, 76, 'DC'], [63, 76, 'DC'], [86, 72, 'DD'], [38, 58, 'MDC'], [62, 58, 'MDC'], [18, 38, 'AG'], [50, 40, 'MOC'], [82, 38, 'AD'], [50, 18, 'BU']],
      '5-3-2': [[50, 92, 'G'], [9, 64, 'PG'], [30, 76, 'DC'], [50, 78, 'DC'], [70, 76, 'DC'], [91, 64, 'PD'], [30, 50, 'MC'], [50, 54, 'MDC'], [70, 50, 'MC'], [38, 24, 'BU'], [62, 24, 'BU']],
      '4-1-4-1': [[50, 92, 'G'], [14, 72, 'DG'], [37, 76, 'DC'], [63, 76, 'DC'], [86, 72, 'DD'], [50, 62, 'MDC'], [14, 44, 'MG'], [38, 46, 'MC'], [62, 46, 'MC'], [86, 44, 'MD'], [50, 20, 'BU']],
      '3-4-3': [[50, 92, 'G'], [28, 76, 'DC'], [50, 78, 'DC'], [72, 76, 'DC'], [12, 52, 'MG'], [38, 56, 'MC'], [62, 56, 'MC'], [88, 52, 'MD'], [20, 26, 'AG'], [50, 20, 'BU'], [80, 26, 'AD']],
      '4-3-1-2': [[50, 92, 'G'], [14, 72, 'DG'], [37, 76, 'DC'], [63, 76, 'DC'], [86, 72, 'DD'], [50, 60, 'MDC'], [28, 52, 'MC'], [72, 52, 'MC'], [50, 38, 'MOC'], [36, 20, 'BU'], [64, 20, 'BU']]
    } },
    foot8: { label: 'Football à 8', n: 8, subs: 6, field: 'foot', forms: {
      '3-3-1': [[50, 92, 'G'], [22, 72, 'DG'], [50, 76, 'DC'], [78, 72, 'DD'], [20, 48, 'MG'], [50, 52, 'MC'], [80, 48, 'MD'], [50, 22, 'BU']],
      '2-3-2': [[50, 92, 'G'], [34, 74, 'DC'], [66, 74, 'DC'], [16, 50, 'MG'], [50, 54, 'MC'], [84, 50, 'MD'], [34, 24, 'BU'], [66, 24, 'BU']],
      '3-2-2': [[50, 92, 'G'], [22, 72, 'DG'], [50, 76, 'DC'], [78, 72, 'DD'], [34, 50, 'MC'], [66, 50, 'MC'], [34, 24, 'BU'], [66, 24, 'BU']]
    } },
    futsal: { label: 'Futsal', n: 5, subs: 9, field: 'futsal', forms: {
      '1-2-1': [[50, 92, 'G'], [50, 70, 'DEF'], [18, 48, 'AIL'], [82, 48, 'AIL'], [50, 24, 'PIV']],
      '2-2': [[50, 92, 'G'], [28, 68, 'DEF'], [72, 68, 'DEF'], [28, 32, 'ATT'], [72, 32, 'ATT']],
      '3-1': [[50, 92, 'G'], [18, 62, 'AIL'], [50, 68, 'DEF'], [82, 62, 'AIL'], [50, 26, 'PIV']]
    } },
    handball: { label: 'Handball', n: 7, subs: 9, field: 'hand', forms: {
      'Attaque placée': [[50, 95, 'GB'], [7, 24, 'AIL G'], [24, 36, 'ARR G'], [50, 40, 'DC'], [76, 36, 'ARR D'], [93, 24, 'AIL D'], [50, 20, 'PIV']],
      'Défense 6-0': [[50, 95, 'GB'], [8, 82, 'AIL G'], [24, 76, 'ARR G'], [42, 74, 'DC'], [58, 74, 'PIV'], [76, 76, 'ARR D'], [92, 82, 'AIL D']]
    } },
    basket: { label: 'Basket', n: 5, subs: 7, field: 'basket', forms: {
      'Cinq de départ': [[50, 66, 'MEN'], [16, 50, 'ARR'], [84, 50, 'AIL'], [30, 24, 'AF'], [64, 18, 'PIV']]
    } },
    volley: { label: 'Volley', n: 6, subs: 6, field: 'volley', forms: {
      'Rotation 1 (5-1)': [[80, 88, 'PAS'], [80, 60, 'R4'], [50, 60, 'CEN'], [20, 60, 'POI'], [20, 88, 'R4'], [50, 88, 'CEN']]
    } },
    rugby: { label: 'Rugby à XV', n: 15, subs: 8, field: 'rugby', forms: {
      'Lancement de jeu': [[42, 46, '1'], [50, 46, '2'], [58, 46, '3'], [45, 52, '4'], [55, 52, '5'], [35, 54, '6'], [65, 54, '7'], [50, 58, '8'], [42, 64, '9'], [32, 70, '10'], [10, 78, '11'], [24, 74, '12'], [16, 78, '13'], [90, 78, '14'], [50, 90, '15']]
    } }
  };
  var POSTE_NOM = { G: 'Gardien', GB: 'Gardien de but', DG: 'Latéral gauche', DD: 'Latéral droit', DC: 'Défenseur central', PG: 'Piston gauche', PD: 'Piston droit', MDC: 'Milieu défensif', MC: 'Milieu', MG: 'Milieu gauche', MD: 'Milieu droit', MOC: 'Meneur de jeu', AG: 'Ailier gauche', AD: 'Ailier droit', BU: 'Attaquant',
    DEF: 'Défenseur', AIL: 'Ailier', PIV: 'Pivot', ATT: 'Attaquant', 'AIL G': 'Ailier gauche', 'AIL D': 'Ailier droit', 'ARR G': 'Arrière gauche', 'ARR D': 'Arrière droit', MEN: 'Meneur', ARR: 'Arrière', AF: 'Ailier fort', PAS: 'Passeur', R4: 'Réceptionneur-attaquant', CEN: 'Central', POI: 'Pointu',
    1: 'Pilier gauche', 2: 'Talonneur', 3: 'Pilier droit', 4: 'Deuxième ligne', 5: 'Deuxième ligne', 6: 'Troisième ligne aile', 7: 'Troisième ligne aile', 8: 'Troisième ligne centre', 9: 'Demi de mêlée', 10: 'Demi d’ouverture', 11: 'Ailier', 12: 'Centre', 13: 'Centre', 14: 'Ailier', 15: 'Arrière' };
  var FORMATS = { '9:16': [1080, 1920, 'Story 9:16'], '4:5': [1080, 1350, 'Portrait 4:5'], '1:1': [1080, 1080, 'Carré 1:1'], '16:9': [1920, 1080, 'Paysage 16:9'] };
  // Seul le modèle C (terrain tactique) est proposé ; les fonctions modeleA/modeleB restent pour relire d'anciennes compositions.
  var MODELES = { C: ['Terrain tactique', 'Le terrain en perspective, chacun à son poste : analyses, plateaux, réseaux.'] };
  var FONTS = { auto: ['Selon le modèle', ''], spartan: ['League Spartan', '800'], barlow: ['Barlow Condensed', '700'], cormorant: ['Cormorant Garamond', '700'], archivo: ['Archivo Black', '400'], cinzel: ['Cinzel', '900'] };
  var FONT_MODELE = { A: 'cormorant', B: 'barlow', C: 'spartan' };
  var FONDS = { auto: 'Selon le modèle', papier: 'Papier clair', clair: 'Teinte claire', degrade: 'Dégradé', uni: 'Couleur unie', texture: 'Texture', maree: 'Marée (Casa Besports)', pelouse: 'Pelouse', photo: 'Ma photo' };
  var FOND_MODELE = { A: 'papier', B: 'clair', C: 'degrade' };
  var PALETTES = [['Marée', NAVY, SUN], ['Rouge', '#b3122e', '#ffffff'], ['Bleu roi', '#1f4fa0', '#ffffff'], ['Vert', '#1f5f3a', '#f6f0e1'], ['Noir et or', '#111111', '#d9b45a'], ['Orange', '#d4561c', '#111111'], ['Ciel', '#4fa3d9', '#0b2340'], ['Violet', '#4b2a7a', '#f2b33d']];
  var VIS = { prive: ['Privée', 'Vous seul.'], staff: ['Staff du club', 'Le correspondant et les encadrants du club choisi.'], club: ['Tout le club', 'Le staff et les membres validés du Vestiaire du club.'], redaction: ['Rédaction', 'L’équipe de rédaction Casa Besports.'], public: ['Publique', 'Tout le monde, une fois publiée (et après l’heure choisie).'] };
  var REP = { envoye: 'En attente', accepte: 'Acceptée', refuse: 'Refusée', modification: 'Modification proposée' };

  // ---------------------------------------------------------------- outils
  function el(tag, attrs) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else if (k === 'style') e.style.cssText = v;
      else if (k === 'value') e.value = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v); else e.setAttribute(k, v === true ? '' : v); });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; } e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function nrm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function slug(s) { return nrm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'composition'; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  var LS = { get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } } };
  function hex(c) { var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c || '').trim()); if (!m) return [16, 40, 58]; var h = m[1]; if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function rgb(a, al) { return al == null ? 'rgb(' + a.map(Math.round).join(',') + ')' : 'rgba(' + a.map(Math.round).join(',') + ',' + al + ')'; }
  function mix(c1, c2, t) { var a = hex(c1), b = hex(c2); return '#' + a.map(function (v, i) { return ('0' + Math.round(v + (b[i] - v) * t).toString(16)).slice(-2); }).join(''); }
  function lum(c) { var a = hex(c).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; }
  function onDark(c) { return lum(c) < .42; }
  function nomComplet(p) { return [p.prenom, p.nom].filter(Boolean).join(' ').trim(); }
  function nomCourt(p) { return String(p.nom || p.prenom || '').trim(); }
  function initiales(p) { return (String(p.prenom || '').charAt(0) + String(p.nom || '').charAt(0)).toUpperCase(); }
  function hasPerson(p) { return !!(p && (p.nom || p.prenom || p.num)); }
  function jourFr(iso) { if (!iso) return ''; var d = new Date(iso + 'T12:00:00'); if (isNaN(d)) return ''; return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\.$/, ''); }
  function uidLocal() { return 'loc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function A() { return window.CasaAuth && window.CasaAuth.on ? window.CasaAuth : null; }
  function moi() { var a = A(); return a && a.user ? a.user : null; }
  function missing(e) { return /does not exist|schema cache|PGRST20|42P01|42883|Could not find/i.test(String(e && e.message || e)); }
  function msg(e) { return String((e && e.message) || e || 'Erreur'); }

  // ---------------------------------------------------------------- nouvelle composition
  function sportDe(s) { s = nrm(s); if (/futsal/.test(s)) return 'futsal'; if (/hand/.test(s)) return 'handball'; if (/basket/.test(s)) return 'basket'; if (/volley/.test(s)) return 'volley'; if (/rugby/.test(s)) return 'rugby'; return 'football'; }
  function slotsFor(sport, form) {
    var S = SPORTS[sport] || SPORTS.football; var f = S.forms[form] || S.forms[Object.keys(S.forms)[0]];
    return f.map(function (p) { return { x: p[0], y: p[1], poste: p[2] }; });
  }
  function nouvelle(o) {
    o = o || {};
    var sport = o.sport || 'football', S = SPORTS[sport], form = Object.keys(S.forms)[0];
    return { v: VERSION, sport: sport, club: o.club || '', clubNom: o.clubNom || '', clubLogo: o.clubLogo || '', equipe: o.equipe || '', adversaire: '', advLogo: '', competition: '', date: '', heure: '', lieu: '', domicile: 'dom',
      formation: form, titulaires: slotsFor(sport, form).map(function (s) { return { x: s.x, y: s.y, poste: s.poste, prenom: '', nom: '', num: '', photo: '', credit: '', cap: false }; }),
      remplacants: [], staff: [{ role: 'Entraîneur', nom: '' }], arbitres: [], vedettes: null,
      titre: '', surtitre: '', texte: '', variante: '',
      style: { modele: 'C', format: '4:5', c1: NAVY, c2: SUN, fond: 'auto', fondImg: '', font: 'auto', nom: 1, portrait: 'rect', signature: true, casa: true, gkHaut: true, logo: true } };
  }
  function vedettes(L) {
    if (Array.isArray(L.vedettes) && L.vedettes.length) return L.vedettes.filter(function (i) { return L.titulaires[i]; });
    // par défaut : la ligne la plus offensive (jusqu'à 5 joueurs)
    var idx = L.titulaires.map(function (p, i) { return i; }).sort(function (a, b) { return L.titulaires[a].y - L.titulaires[b].y; });
    var n = Math.min(5, Math.max(1, Math.round(L.titulaires.length / 3)));
    return idx.slice(0, n).sort(function (a, b) { return L.titulaires[a].x - L.titulaires[b].x; });
  }
  function titreDe(L) { return L.titre || (L.style.modele === 'A' ? (L.sport === 'football' ? 'Attaque' : 'Le cinq') : L.style.modele === 'C' ? 'Le onze' : 'Composition'); }
  function matchLigne(L) {
    var bits = [];
    if (L.adversaire) bits.push((L.domicile === 'ext' ? 'à ' : 'contre ') + L.adversaire);
    if (L.competition) bits.push(L.competition);
    var d = jourFr(L.date); if (d) bits.push(d + (L.heure ? ' · ' + L.heure.replace(':', ' h ') : ''));
    if (L.lieu) bits.push(L.lieu);
    return bits.join(' · ');
  }

  // ---------------------------------------------------------------- images (portraits, logos)
  var IMG = {}, redrawLater = null;
  function img(src) {
    if (!src) return null;
    var c = IMG[src];
    if (!c) {
      c = IMG[src] = { ok: false, bad: false, el: new Image() };
      if (!/^data:|^blob:/.test(src)) c.el.crossOrigin = 'anonymous';
      c.el.onload = function () { c.ok = true; if (redrawLater) redrawLater(); };
      c.el.onerror = function () { c.bad = true; if (redrawLater) redrawLater(); };
      c.el.src = src;
    }
    return c.ok ? c.el : null;
  }
  function imagesPretes(L, timeout) {
    var srcs = [L.clubLogo, L.advLogo, L.style.fondImg, 'assets/logo-be.svg'].concat(L.titulaires.map(function (p) { return p.photo; }), L.remplacants.map(function (p) { return p.photo; })).filter(Boolean);
    srcs.forEach(img);
    return new Promise(function (ok) {
      var t0 = Date.now();
      (function wait() { if (srcs.every(function (s) { return IMG[s] && (IMG[s].ok || IMG[s].bad); }) || Date.now() - t0 > (timeout || 6000)) ok(); else setTimeout(wait, 80); })();
    });
  }
  // Import d'un portrait : recadré en 4:5 (le haut de la photo est gardé : le visage), allégé, gardé dans la composition
  function lirePhoto(file, w, h) {
    w = w || 420; h = h || 525;
    return new Promise(function (ok, ko) {
      if (!file || !/^image\//.test(file.type || '')) { ko(new Error('Choisissez une image (JPG, PNG ou WebP)')); return; }
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var sw = im.naturalWidth, sh = im.naturalHeight, r = w / h, cw, ch, sx, sy;
        if (sw / sh > r) { ch = sh; cw = sh * r; sx = (sw - cw) / 2; sy = 0; } else { cw = sw; ch = sw / r; sx = 0; sy = (sh - ch) * .18; }
        var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d');
        x.imageSmoothingQuality = 'high'; x.drawImage(im, sx, sy, cw, ch, 0, 0, w, h); URL.revokeObjectURL(u);
        // photo détourée (fond transparent) : gardée en PNG pour conserver la découpe
        var alpha = false; try { var d = x.getImageData(0, 0, w, h).data; for (var i = 3; i < d.length; i += 4 * 97) if (d[i] < 250) { alpha = true; break; } } catch (e) {}
        ok(alpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', .86));
      };
      im.onerror = function () { URL.revokeObjectURL(u); ko(new Error('Image illisible')); };
      im.src = u;
    });
  }

  // ---------------------------------------------------------------- terrains (géométrie en mètres)
  function arc(cx, cy, r, a0, a1, n) { var p = []; n = n || 40; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; }
  function rect(x, y, w, h) { return { p: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], close: true }; }
  function seg(a, b, dash) { return { p: [a, b], dash: dash }; }
  function geom(kind) {
    var G = { w: 68, l: 105, prims: [], spots: [] }, P = G.prims, i;
    if (kind === 'foot') {
      P.push(rect(0, 0, 68, 105), seg([0, 52.5], [68, 52.5]), { p: arc(34, 52.5, 9.15, 0, Math.PI * 2, 60), close: true }); G.spots.push([34, 52.5]);
      [[0, 1], [105, -1]].forEach(function (e) { var y0 = e[0], d = e[1];
        P.push(rect(13.84, d > 0 ? 0 : 105 - 16.5, 40.32, 16.5), rect(24.84, d > 0 ? 0 : 105 - 5.5, 18.32, 5.5));
        G.spots.push([34, y0 + d * 11]);
        var a = Math.asin(5.5 / 9.15); P.push({ p: d > 0 ? arc(34, 11, 9.15, a, Math.PI - a, 24) : arc(34, 94, 9.15, Math.PI + a, 2 * Math.PI - a, 24) });
        P.push({ p: [[30.34, y0], [30.34, y0 - d * 2], [37.66, y0 - d * 2], [37.66, y0]], goal: true });
      });
      P.push({ p: arc(0, 0, 1, 0, Math.PI / 2, 6) }, { p: arc(68, 0, 1, Math.PI / 2, Math.PI, 6) }, { p: arc(0, 105, 1, -Math.PI / 2, 0, 6) }, { p: arc(68, 105, 1, Math.PI, 1.5 * Math.PI, 6) });
    } else if (kind === 'hand' || kind === 'futsal') {
      G.w = 20; G.l = 40; P.push(rect(0, 0, 20, 40), seg([0, 20], [20, 20]));
      if (kind === 'futsal') { P.push({ p: arc(10, 20, 3, 0, Math.PI * 2, 40), close: true }); G.spots.push([10, 20], [10, 6], [10, 34], [10, 10], [10, 30]); }
      [[0, 1], [40, -1]].forEach(function (e) { var y0 = e[0], d = e[1];
        [[6, false], [kind === 'hand' ? 9 : 0, true]].forEach(function (z) { var r = z[0]; if (!r) return;
          var pts = d > 0 ? arc(8.5, 0, r, Math.PI, Math.PI / 2, 16).concat(arc(11.5, 0, r, Math.PI / 2, 0, 16)) : arc(8.5, 40, r, Math.PI, 1.5 * Math.PI, 16).concat(arc(11.5, 40, r, 1.5 * Math.PI, 2 * Math.PI, 16));
          pts = pts.filter(function (q) { return q[0] >= 0 && q[0] <= 20; });
          P.push({ p: pts, dash: z[1] });
        });
        if (kind === 'hand') P.push(seg([9.5, y0 + d * 7], [10.5, y0 + d * 7]));
        P.push({ p: [[8.5, y0], [8.5, y0 - d * 1], [11.5, y0 - d * 1], [11.5, y0]], goal: true });
      });
    } else if (kind === 'basket') {
      G.w = 15; G.l = 28; P.push(rect(0, 0, 15, 28), seg([0, 14], [15, 14]), { p: arc(7.5, 14, 1.8, 0, Math.PI * 2, 30), close: true });
      [[0, 1], [28, -1]].forEach(function (e) { var y0 = e[0], d = e[1], by = y0 + d * 1.575;
        P.push(rect(5.05, d > 0 ? 0 : 28 - 5.8, 4.9, 5.8), { p: arc(7.5, y0 + d * 5.8, 1.8, 0, Math.PI * 2, 30), close: true });
        var a = Math.acos(6.6 / 6.75), ycut = by + d * 6.75 * Math.sin(a);
        P.push(seg([.9, y0], [.9, ycut]), seg([14.1, y0], [14.1, ycut]));
        P.push({ p: d > 0 ? arc(7.5, by, 6.75, a, Math.PI - a, 40) : arc(7.5, by, 6.75, Math.PI + a, 2 * Math.PI - a, 40) });
        P.push({ p: arc(7.5, by, .23, 0, Math.PI * 2, 12), close: true }, seg([6.6, y0 + d * 1.2], [8.4, y0 + d * 1.2]));
      });
    } else if (kind === 'volley') {
      G.w = 9; G.l = 18; P.push(rect(0, 0, 9, 18), { p: [[-.6, 9], [9.6, 9]], net: true }, seg([0, 6], [9, 6]), seg([0, 12], [9, 12]));
    } else if (kind === 'rugby') {
      G.w = 70; G.l = 100; P.push(rect(0, 0, 70, 100), seg([0, 50], [70, 50]), seg([0, 22], [70, 22]), seg([0, 78], [70, 78]), seg([0, 40], [70, 40], true), seg([0, 60], [70, 60], true), seg([5, 0], [5, 100], true), seg([65, 0], [65, 100], true));
      [[0, 1], [100, -1]].forEach(function (e) { var y0 = e[0], d = e[1]; P.push({ p: [[32.2, y0 - d * 2.5], [32.2, y0], [37.8, y0], [37.8, y0 - d * 2.5]], goal: true }); });
    }
    return G;
  }
  // Projection vue du dessus (rectangle) ou en perspective (caméra de télévision)
  function projDessus(r, G) { return function (x, y) { return [r.x + x / G.w * r.w, r.y + y / G.l * r.h, 1]; }; }
  function projPersp(c, G) {
    var t = c.t || .65, zf = 1 + t, sf = 1 / zf;
    return function (x, y) { var v = y / G.l, s = 1 / (1 + t * (1 - v)), p = (s - sf) / (1 - sf); return [c.cx + (x / G.w - .5) * c.wNear * s, c.yFar + p * (c.yNear - c.yFar), s]; };
  }
  function dessinerTerrain(ctx, G, P, col, lw, herbe) {
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (herbe) { // pelouse à bandes
      var n = 12; for (i = 0; i < n; i++) { var a = P(0, G.l * i / n), b = P(G.w, G.l * i / n), c = P(G.w, G.l * (i + 1) / n), d = P(0, G.l * (i + 1) / n);
        ctx.fillStyle = i % 2 ? '#2f7a3c' : '#357f42'; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); ctx.fill(); }
    }
    var i;
    G.prims.forEach(function (pr) {
      ctx.strokeStyle = col; ctx.lineWidth = pr.net ? lw * 2.4 : lw; ctx.setLineDash(pr.dash ? [lw * 3, lw * 3] : []);
      ctx.beginPath(); pr.p.forEach(function (q, k) { var s = P(q[0], q[1]); if (k) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }); if (pr.close) ctx.closePath(); ctx.stroke();
    });
    ctx.setLineDash([]); ctx.fillStyle = col;
    G.spots.forEach(function (q) { var s = P(q[0], q[1]); ctx.beginPath(); ctx.arc(s[0], s[1], lw * 1.3 * (s[2] || 1), 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
  }

  // ---------------------------------------------------------------- dessin : outils
  function fam(L, role) { var f = L.style.font && L.style.font !== 'auto' ? L.style.font : FONT_MODELE[L.style.modele] || 'spartan'; if (role === 'nom') return L.style.modele === 'A' ? 'spartan' : (f === 'cormorant' || f === 'cinzel') ? 'barlow' : f; return f; }
  function font(ctx, key, px, w) { var F = FONTS[key] || FONTS.spartan; ctx.font = (w || F[1] || '700') + ' ' + Math.round(px) + 'px "' + F[0] + '", "Mulish", sans-serif'; }
  function mulish(ctx, px, w) { ctx.font = (w || 600) + ' ' + Math.round(px) + 'px "Mulish", sans-serif'; }
  function fitFont(ctx, txt, maxW, px, setter, min) { setter(px); var w = ctx.measureText(txt).width; if (w > maxW) { px = Math.max(min || 8, px * maxW / w); setter(px); } return px; }
  function spaced(ctx, txt, x, y, sp, align) {
    txt = String(txt); var w = 0, i, widths = []; for (i = 0; i < txt.length; i++) { widths.push(ctx.measureText(txt[i]).width); w += widths[i] + (i < txt.length - 1 ? sp : 0); }
    var sx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, al = ctx.textAlign; ctx.textAlign = 'left';
    for (i = 0; i < txt.length; i++) { ctx.fillText(txt[i], sx, y); sx += widths[i] + sp; } ctx.textAlign = al; return w;
  }
  function wrap(ctx, txt, maxW) { var words = String(txt || '').split(/\s+/).filter(Boolean), lines = [], cur = ''; words.forEach(function (w) { var t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }); if (cur) lines.push(cur); return lines; }
  function rr(ctx, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function shapePath(ctx, shape, x, y, w, h) { if (shape === 'rond') { ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); } else rr(ctx, x, y, w, h, shape === 'arrondi' ? Math.min(w, h) * .14 : Math.min(w, h) * .02); }
  function cover(ctx, im, x, y, w, h, fy) {
    var iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; if (!iw || !ih) return;
    var s = Math.max(w / iw, h / ih), sw = w / s, sh = h / s, sx = (iw - sw) / 2, sy = (ih - sh) * (fy == null ? .2 : fy);
    ctx.drawImage(im, sx, sy, sw, sh, x, y, w, h);
  }
  function silhouette(ctx, x, y, w, h, col) {
    ctx.save(); ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .4, w * .19, h * .17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w * .12, y + h); ctx.bezierCurveTo(x + w * .14, y + h * .66, x + w * .3, y + h * .6, x + w / 2, y + h * .6); ctx.bezierCurveTo(x + w * .7, y + h * .6, x + w * .86, y + h * .66, x + w * .88, y + h); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function portrait(ctx, p, x, y, w, h, shape, bg) {
    ctx.save(); shapePath(ctx, shape, x, y, w, h); ctx.clip();
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(x, y, w, h); }
    var im = img(p.photo);
    if (im) cover(ctx, im, x, y, w, h, .15); else silhouette(ctx, x, y, w, h, 'rgba(255,255,255,.18)');
    ctx.restore();
  }
  function grain(ctx, W, H, a, seed) { // grain léger, dessiné en petits points (rapide, reproductible)
    var s = seed || 9; function r() { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; }
    ctx.save(); var n = Math.round(W * H / 900);
    for (var i = 0; i < n; i++) { ctx.fillStyle = r() > .5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(0,0,0,' + a + ')'; ctx.fillRect(r() * W, r() * H, 1.6, 1.6); }
    ctx.restore();
  }

  // ---------------------------------------------------------------- fond, en-tête, signature
  function fondDe(L) { var f = L.style.fond; if (!f || f === 'auto') return FOND_MODELE[L.style.modele] || 'degrade'; if (f === 'photo' && !L.style.fondImg) return FOND_MODELE[L.style.modele]; return f; }
  function peindreFond(ctx, W, H, L) {
    var f = fondDe(L), c1 = L.style.c1 || NAVY, base;
    if (f === 'papier') base = '#f2efe7'; else if (f === 'clair') base = mix(c1, '#ffffff', .86); else if (f === 'maree') base = NAVY; else if (f === 'pelouse') base = '#1f5a2c'; else base = c1;
    ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);
    if (f === 'degrade' || f === 'maree') {
      var g = ctx.createRadialGradient(W * .5, H * .18, 0, W * .5, H * .4, Math.hypot(W, H) * .7); g.addColorStop(0, rgb(hex(mix(base, '#ffffff', .16)), 1)); g.addColorStop(1, rgb(hex(mix(base, '#000000', .55)), 1));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (f === 'texture' || f === 'clair') { ctx.save(); ctx.globalAlpha = f === 'clair' ? .06 : .08; ctx.strokeStyle = onDark(base) ? '#ffffff' : '#000000'; ctx.lineWidth = 1.2; for (var x = 0; x < W; x += 5) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (x % 3) * 2, H); ctx.stroke(); } ctx.restore(); }
    if (f === 'maree') { ctx.save(); ctx.strokeStyle = 'rgba(233,239,238,.07)'; ctx.lineWidth = 2; for (var k = 0; k < 9; k++) { ctx.beginPath(); for (var xx = 0; xx <= W; xx += 20) { var yy = H * (.62 + k * .045) + Math.sin(xx / W * 6 + k) * H * .012; if (xx) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); } ctx.stroke(); } ctx.restore();
      ctx.fillStyle = SUN; ctx.fillRect(0, 0, W, Math.max(6, H * .006)); }
    if (f === 'pelouse') { for (var b = 0; b < 14; b++) { ctx.fillStyle = b % 2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.05)'; ctx.fillRect(0, H * b / 14, W, H / 14); } }
    if (f === 'photo') {
      var im = img(L.style.fondImg); if (im) cover(ctx, im, 0, 0, W, H, .4);
      var g2 = ctx.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, rgb(hex(c1), .55)); g2.addColorStop(1, 'rgba(0,0,0,.78)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
      base = '#000000';
    }
    if (f !== 'photo') grain(ctx, W, H, .05, 11);
    var dark = onDark(base);
    return { base: base, ink: dark ? '#ffffff' : (onDark(c1) ? c1 : '#111111'), sub: dark ? 'rgba(255,255,255,.72)' : 'rgba(0,0,0,.6)', dark: dark };
  }
  function logo(ctx, src, cx, cy, size) { var im = img(src); if (!im) return false; var iw = im.naturalWidth || 1, ih = im.naturalHeight || 1, s = size / Math.max(iw, ih); ctx.drawImage(im, cx - iw * s / 2, cy - ih * s / 2, iw * s, ih * s); return true; }
  function signature(ctx, W, H, L, T, u) {
    if (!L.style.signature && !L.style.casa) return;
    var h = 44 * u, x = W - 46 * u, y = H - 40 * u - h;
    if (L.style.signature) { var im = img('assets/logo-be.svg'); if (im) { var w = h * 300 / 179; ctx.drawImage(im, x - w, y, w, h); x -= w + 14 * u; } }
    if (L.style.casa) { mulish(ctx, 17 * u, 800); ctx.fillStyle = T.sub; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; spaced(ctx, 'CASA BESPORTS', x, y + h / 2, 3 * u, 'right'); }
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  }
  // apparition progressive (vidéo animée) : i = rang de l'élément, n = nombre d'éléments
  function anim(o, i, n) { if (!o || o.p == null) return 1; var st = .15 + .7 * (n > 1 ? i / (n - 1) : 0); return clamp((o.p - st) / .18, 0, 1); }
  function enter(ctx, a, dy) { ctx.globalAlpha = a; if (a < 1) ctx.translate(0, (1 - a) * dy); }

  function logosEnTete(ctx, L, cx, cy, size, gap) {
    var a = L.style.logo !== false && L.clubLogo && img(L.clubLogo), b = L.advLogo && img(L.advLogo);
    if (a && b) { logo(ctx, L.clubLogo, cx - size / 2 - gap / 2, cy, size); logo(ctx, L.advLogo, cx + size / 2 + gap / 2, cy, size); return true; }
    if (a) { logo(ctx, L.clubLogo, cx, cy, size); return true; }
    if (b) { logo(ctx, L.advLogo, cx, cy, size); return true; }
    return false;
  }

  // ---------------------------------------------------------------- MODÈLE A : éditorial
  function modeleA(ctx, W, H, L, T, o) {
    var land = W > H, u = (land ? H : W) / 1080, m = 64 * u, c1 = L.style.c1, c2 = L.style.c2, f = fam(L, 'titre');
    var accent = T.dark ? c2 : c1;
    ctx.save(); enter(ctx, anim(o, 0, 8), 20 * u);
    // coins : club à gauche, informations à droite
    font(ctx, 'cormorant', 22 * u, 700); ctx.fillStyle = T.dark ? c2 : mix(c1, '#b3122e', .0); ctx.textBaseline = 'top';
    var cl = String(L.clubNom || '').toUpperCase().split(/\s+/).filter(Boolean).slice(0, 4);
    cl.forEach(function (w, i) { spaced(ctx, w, m, m + i * 24 * u, 2.5 * u, 'left'); });
    var right = [L.equipe, L.competition, jourFr(L.date)].filter(Boolean).map(function (s) { return String(s).toUpperCase(); }).slice(0, 3);
    right.forEach(function (w, i) { spaced(ctx, w, W - m, m + i * 24 * u, 2.5 * u, 'right'); });
    ctx.restore();
    // surtitre et titre
    var top = m + Math.max(cl.length, right.length, 2) * 24 * u + 30 * u;
    ctx.save(); enter(ctx, anim(o, 1, 8), 30 * u); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
    if (L.surtitre) { mulish(ctx, 52 * u, 800); ctx.fillStyle = T.dark ? 'rgba(255,255,255,.28)' : rgb(hex(c1), .22); fitFont(ctx, L.surtitre.toUpperCase(), W - 2 * m, 52 * u, function (p) { mulish(ctx, p, 800); }); spaced(ctx, L.surtitre.toUpperCase(), W / 2, top + 46 * u, 8 * u, 'center'); top += 56 * u; }
    var t = titreDe(L).toUpperCase(), tp = fitFont(ctx, t, W - 2 * m, (land ? 190 : 210) * u, function (p) { font(ctx, f, p); }, 40 * u);
    var tg = ctx.createLinearGradient(0, top, 0, top + tp); tg.addColorStop(0, T.dark ? '#ffffff' : mix(accent, '#ffffff', .25)); tg.addColorStop(1, T.dark ? mix(c2, '#ffffff', .2) : accent);
    ctx.fillStyle = tg; ctx.fillText(t, W / 2, top + tp * .82); ctx.restore();
    top += tp * .95 + 30 * u;
    // portraits verticaux décalés
    var idx = vedettes(L), n = idx.length || 1, foot = (L.texte ? 150 : 90) * u, nameH = 70 * u * L.style.nom * (land ? 1 : 1.3);
    var areaW = W - 2 * m, areaH = H - top - foot - 30 * u, gap = 16 * u;
    var rows = (!land && H / W > 1.6 && n >= 4) ? 2 : 1, cols = Math.ceil(n / rows), rowH = areaH / rows - nameH;
    var cw = Math.min((areaW - gap * (cols - 1)) / cols, rowH / 1.35), ch = Math.min(cw * (land ? 1.9 : 2.3), rowH * .88), off = Math.min(ch * .1, rowH - ch);
    top += Math.max(0, (areaH - rows * (ch + off + nameH)) * .4);
    idx.forEach(function (pi, k) {
      var r0 = Math.floor(k / cols), inRow = Math.min(cols, n - r0 * cols), c0 = k - r0 * cols;
      var x0 = W / 2 - (cw * inRow + gap * (inRow - 1)) / 2;
      var p = L.titulaires[pi], x = x0 + c0 * (cw + gap), y = top + r0 * (ch + off + nameH) + (c0 % 2 ? off : 0);
      ctx.save(); enter(ctx, anim(o, 2 + k, 2 + n + 1), 60 * u);
      var g = ctx.createLinearGradient(0, y, 0, y + ch); g.addColorStop(0, mix(c1, '#ffffff', .12)); g.addColorStop(1, mix(c1, '#000000', .35));
      ctx.save(); shapePath(ctx, L.style.portrait === 'rond' ? 'arrondi' : L.style.portrait, x, y, cw, ch); ctx.clip(); ctx.fillStyle = g; ctx.fillRect(x, y, cw, ch);
      ctx.globalAlpha = .07; ctx.fillStyle = '#ffffff'; for (var s = -ch; s < cw; s += 14 * u) { ctx.beginPath(); ctx.moveTo(x + s, y + ch); ctx.lineTo(x + s + ch, y); ctx.lineTo(x + s + ch + 3 * u, y); ctx.lineTo(x + s + 3 * u, y + ch); ctx.fill(); } ctx.globalAlpha = 1;
      if (p.num) { font(ctx, 'archivo', cw * .7, 400); ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.textAlign = 'right'; ctx.fillText(String(p.num), x + cw - 6 * u, y + ch - 10 * u); }
      var im = img(p.photo); if (im) cover(ctx, im, x, y + ch * .06, cw, ch * .94, .1); else silhouette(ctx, x, y + ch * .25, cw, ch * .75, 'rgba(255,255,255,.2)');
      ctx.restore();
      // nom
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'; var ny = y + ch + 14 * u;
      if (p.prenom) { font(ctx, 'cormorant', Math.max(21 * u, cw * .08) * L.style.nom, 700); ctx.fillStyle = T.dark ? T.sub : mix(c1, '#000000', .1); fitFont(ctx, p.prenom.toUpperCase(), cw + gap, Math.max(21 * u, cw * .08) * L.style.nom, function (q) { font(ctx, 'cormorant', q, 700); }); spaced(ctx, p.prenom.toUpperCase(), x + cw / 2, ny, 2 * u, 'center'); ny += Math.max(24 * u, cw * .095) * L.style.nom; }
      var nm = (nomCourt(p) || (p.num ? 'N° ' + p.num : '')).toUpperCase() + (p.cap ? ' (C)' : '');
      fitFont(ctx, nm, cw + gap, Math.max(20 * u, cw * .085) * L.style.nom, function (q) { font(ctx, 'spartan', q, 800); }); ctx.fillStyle = accent; ctx.fillText(nm, x + cw / 2, ny);
      ctx.restore();
    });
    // texte d'accompagnement
    if (L.texte) {
      ctx.save(); enter(ctx, anim(o, 2 + n, 2 + n + 1), 10 * u); mulish(ctx, 17 * u, 600); ctx.fillStyle = T.sub; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      wrap(ctx, L.texte, W * (land ? .45 : .58)).slice(0, 5).forEach(function (ln, i) { ctx.fillText(ln, m, H - foot + 6 * u + i * 22 * u); }); ctx.restore();
    }
    logosEnTete(ctx, L, W - m - 260 * u, H - 62 * u, 56 * u, 14 * u);
    signature(ctx, W, H, L, T, u);
  }

  // ---------------------------------------------------------------- MODÈLE B : composition officielle
  function ordreLignes(L) { return L.titulaires.map(function (p, i) { return i; }).sort(function (a, b) { var A1 = L.titulaires[a], B1 = L.titulaires[b]; return Math.abs(B1.y - A1.y) > 6 ? B1.y - A1.y : A1.x - B1.x; }); }
  function grille(n, aw, ah, ratio) { // meilleur nombre de colonnes pour n vignettes dans aw × ah
    var best = null; for (var c = 2; c <= Math.min(8, n); c++) { var r = Math.ceil(n / c), tw = Math.min(aw / c, ah / r / ratio); if (!best || tw > best.tw + .5) best = { c: c, r: r, tw: tw }; }
    return best || { c: 1, r: 1, tw: Math.min(aw, ah / ratio) };
  }
  function modeleB(ctx, W, H, L, T, o) {
    var land = W > H, u = (land ? H : W) / 1080, m = 56 * u, c1 = L.style.c1, c2 = L.style.c2, f = fam(L, 'titre'), y = m;
    var accent = T.dark ? c2 : mix(c2, c1, onDark(c2) ? 0 : .55);
    ctx.save(); enter(ctx, anim(o, 0, 6), 20 * u);
    if (logosEnTete(ctx, L, W / 2, y + 40 * u, 80 * u, 26 * u)) y += 96 * u;
    var t = titreDe(L).toUpperCase(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var tp = fitFont(ctx, t, (W - 2 * m) * .92, (land ? 120 : 140) * u, function (p) { font(ctx, f, p); }, 30 * u);
    ctx.save(); ctx.translate(W / 2, y + tp * .85); ctx.transform(1, 0, -.16, 1, 0, 0);
    var tg = ctx.createLinearGradient(0, -tp, 0, 0); tg.addColorStop(0, mix(accent, '#ffffff', .2)); tg.addColorStop(1, accent); ctx.fillStyle = tg; ctx.fillText(t, 0, 0); ctx.restore();
    y += tp + 6 * u;
    var ml = matchLigne(L); if (ml) { mulish(ctx, 20 * u, 700); ctx.fillStyle = T.sub; fitFont(ctx, ml, W - 2 * m, 20 * u, function (p) { mulish(ctx, p, 700); }); ctx.fillText(ml, W / 2, y + 22 * u); y += 40 * u; }
    ctx.restore();
    y += 18 * u;
    // pied : remplaçants, staff
    var subs = L.remplacants.filter(hasPerson), staff = L.staff.concat(L.arbitres).filter(function (s) { return s.nom; });
    mulish(ctx, 19 * u, 800); var subsTxt = subs.map(function (p) { return (p.num ? p.num + ' ' : '') + nomCourt(p).toUpperCase(); }).join('  •  ');
    var subsLines = subs.length ? wrap(ctx, subsTxt, W - 2 * m).slice(0, 3) : [];
    var footH = (subs.length ? 58 * u + subsLines.length * 26 * u : 0) + (staff.length ? 34 * u : 0) + 70 * u;
    // grille des titulaires
    var ord = ordreLignes(L), n = ord.length, ratio = 1.22, g = grille(n, W - 2 * m, H - y - footH, ratio), gap = 14 * u;
    var tw = g.tw - gap, th = tw * ratio, ph = tw, total = g.r * (th + gap) - gap, y0 = y + Math.max(0, (H - y - footH - total) / 2);
    ord.forEach(function (pi, k) {
      var p = L.titulaires[pi], row = Math.floor(k / g.c), inRow = Math.min(g.c, n - row * g.c), col = k - row * g.c;
      var x = W / 2 - (inRow * (tw + gap) - gap) / 2 + col * (tw + gap), yy = y0 + row * (th + gap);
      ctx.save(); enter(ctx, anim(o, 1 + k, n + 2), 40 * u);
      portrait(ctx, p, x, yy, tw, ph, L.style.portrait, mix(c1, '#000000', .1));
      if (p.num) { font(ctx, 'barlow', tw * .2, 700); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = 6 * u; ctx.fillText(String(p.num), x + tw * .08, yy + tw * .06); ctx.shadowBlur = 0; }
      var nm = (nomCourt(p) || '').toUpperCase() + (p.cap ? ' (C)' : '');
      if (nm) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; fitFont(ctx, nm, tw + gap * .8, tw * .16 * L.style.nom, function (q) { font(ctx, fam(L, 'nom'), q); }, 9 * u); ctx.fillStyle = T.ink; ctx.fillText(nm, x + tw / 2, yy + ph + 8 * u); }
      ctx.restore();
    });
    // remplaçants et encadrement
    var fy = H - footH + 10 * u;
    ctx.save(); enter(ctx, anim(o, n + 1, n + 2), 10 * u); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    if (subs.length) {
      ctx.save(); ctx.translate(W / 2, fy); ctx.transform(1, 0, -.16, 1, 0, 0); font(ctx, f, 40 * u); ctx.fillStyle = accent; ctx.fillText(L.sport === 'football' ? 'REMPLAÇANTS' : 'REMPLAÇANTS', 0, 0); ctx.restore();
      mulish(ctx, 19 * u, 800); ctx.fillStyle = T.ink; subsLines.forEach(function (ln, i) { ctx.fillText(ln, W / 2, fy + 50 * u + i * 26 * u); }); fy += 58 * u + subsLines.length * 26 * u;
    }
    if (staff.length) { mulish(ctx, 17 * u, 700); ctx.fillStyle = T.sub; var st = staff.map(function (s) { return s.role + ' : ' + s.nom; }).join('  ·  '); fitFont(ctx, st, W - 2 * m, 17 * u, function (q) { mulish(ctx, q, 700); }); ctx.fillText(st, W / 2, fy); }
    ctx.restore();
    signature(ctx, W, H, L, T, u);
  }

  // ---------------------------------------------------------------- MODÈLE C : terrain tactique
  function modeleC(ctx, W, H, L, T, o) {
    var land = W > H, u = (land ? H : W) / 1080, m = 48 * u, c1 = L.style.c1, c2 = L.style.c2, f = fam(L, 'titre'), S = SPORTS[L.sport] || SPORTS.football;
    var side = land ? W * .3 : 0, y = m;
    // en-tête
    ctx.save(); enter(ctx, anim(o, 0, 6), 20 * u); ctx.textAlign = 'center';
    var hx = land ? W - side / 2 - m / 2 : W / 2;
    if (logosEnTete(ctx, L, hx, y + 44 * u, 88 * u, 26 * u)) y += 104 * u;
    var t = titreDe(L).toUpperCase(), tp = fitFont(ctx, t, (land ? side - m : W - 2 * m) * .95, (land ? 92 : 96) * u, function (p) { font(ctx, f, p); }, 24 * u);
    ctx.fillStyle = T.ink; ctx.textBaseline = 'alphabetic'; ctx.fillText(t, hx, y + tp * .85); y += tp + 4 * u;
    var ml = matchLigne(L); if (ml) { mulish(ctx, 19 * u, 700); ctx.fillStyle = T.sub; var lines = land ? wrap(ctx, ml, side - m) : [ml]; if (!land) fitFont(ctx, ml, W - 2 * m, 19 * u, function (q) { mulish(ctx, q, 700); }); lines.slice(0, 3).forEach(function (ln, i) { ctx.fillText(ln, hx, y + 22 * u + i * 24 * u); }); y += 14 * u + lines.slice(0, 3).length * 24 * u; }
    ctx.restore();
    // remplaçants (bas, ou colonne de droite en 16:9)
    var subs = L.remplacants.filter(hasPerson), staff = L.staff.concat(L.arbitres).filter(function (s) { return s.nom; });
    var subTxt = subs.map(function (p) { return (p.num ? p.num + ' ' : '') + nomCourt(p).toUpperCase(); });
    var bottomH = land ? 70 * u : (subs.length || staff.length ? 130 * u : 70 * u);
    // terrain
    var G = geom(S.field), herbe = fondDe(L) === 'pelouse';
    var fx0 = m, fx1 = land ? W - side - m : W - m, base0 = (fx1 - fx0) * (S.n > 11 ? .1 : S.n > 7 ? .14 : .18);
    var top = (land ? m : y + 10 * u) + base0 * .75, bot = H - bottomH - base0 * .55;
    var wNear = (fx1 - fx0), t2 = .45, hNeed = (bot - top), ratio = G.l / G.w;
    var hNat = Math.min(hNeed, wNear * ratio * .8); // hauteur du terrain vu en biais
    if (hNat < wNear * ratio * .55) { wNear = hNat / (ratio * .55); hNat = wNear * ratio * .55; }
    top += (hNeed - hNat) * .5; bot = top + hNat;
    var P = projPersp({ cx: (fx0 + fx1) / 2, yFar: top, yNear: bot, wNear: wNear, t: t2 }, G);
    ctx.save(); enter(ctx, anim(o, 0, 6), 0); dessinerTerrain(ctx, G, P, T.dark ? 'rgba(255,255,255,.55)' : rgb(hex(c1), .55), 3 * u, herbe); ctx.restore();
    // joueurs : profondeur répartie sur tout le terrain (lisible), du plus loin au plus proche
    var ys = L.titulaires.map(function (p) { return L.style.gkHaut ? 100 - p.y : p.y; }), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), span = Math.max(1, y1 - y0);
    var pts = L.titulaires.map(function (p, i) { var fy = (.06 + .84 * (ys[i] - y0) / span) * G.l; var s = P(p.x / 100 * G.w, fy); return { p: p, i: i, sx: s[0], sy: s[1], k: s[2] }; }).sort(function (a, b) { return a.sy - b.sy; });
    var base = Math.min(base0, (bot - top) / (land || H / W < 1.2 ? 5.4 : 4.2));
    pts.forEach(function (q, k) {
      var p = q.p, cw = base * (.55 + .45 * q.k), ch = cw * 1.05, x = q.sx - cw / 2, yy = q.sy - ch * .92;
      ctx.save(); enter(ctx, anim(o, 1 + k, pts.length + 2), 30 * u);
      // portrait sans cadre, fondu vers le bas
      ctx.save(); shapePath(ctx, L.style.portrait, x, yy, cw, ch); ctx.clip();
      var gg = ctx.createLinearGradient(0, yy, 0, yy + ch); gg.addColorStop(0, rgb(hex(mix(c1, '#000000', .2)), .0)); gg.addColorStop(1, rgb(hex(mix(c1, '#000000', .45)), .85)); ctx.fillStyle = gg; ctx.fillRect(x, yy, cw, ch);
      var im = img(p.photo); if (im) cover(ctx, im, x, yy, cw, ch, .12); else silhouette(ctx, x, yy + ch * .1, cw, ch * .9, 'rgba(255,255,255,.28)');
      ctx.restore();
      // plaque du nom
      var nm = (nomCourt(p) || (p.num ? 'N° ' + p.num : p.poste || '')).toUpperCase();
      var fp = Math.max(10 * u, cw * .17 * L.style.nom); font(ctx, fam(L, 'nom'), fp); var tw = Math.max(cw * 1.1, ctx.measureText(nm).width + fp * 1.2), ph = fp * 1.55;
      ctx.fillStyle = mix(c1, '#000000', .4); ctx.globalAlpha *= .92; rr(ctx, q.sx - tw / 2, q.sy, tw, ph, ph * .12); ctx.fill(); ctx.globalAlpha = Math.min(1, ctx.globalAlpha / .92);
      ctx.fillStyle = c2; ctx.fillRect(q.sx - tw / 2, q.sy, tw, Math.max(2, ph * .08));
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nm, q.sx, q.sy + ph * .55);
      if (p.num) { var r = fp * .78; ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(x + cw * .08, yy + ch * .14, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = onDark(c2) ? '#fff' : '#111'; font(ctx, 'barlow', r * 1.15, 700); ctx.fillText(String(p.num), x + cw * .08, yy + ch * .14 + r * .05); }
      if (p.cap) { var r2 = fp * .62; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + cw * .92, yy + ch * .14, r2, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#111'; font(ctx, 'barlow', r2 * 1.2, 700); ctx.fillText('C', x + cw * .92, yy + ch * .14 + r2 * .05); }
      ctx.restore();
    });
    // remplaçants et staff
    ctx.save(); enter(ctx, anim(o, pts.length + 1, pts.length + 2), 10 * u); ctx.textAlign = land ? 'left' : 'center'; ctx.textBaseline = 'top';
    if (land) {
      var sx = W - side + m * .2, sy = y + 30 * u;
      if (subs.length) { font(ctx, f, 30 * u); ctx.fillStyle = c2; ctx.fillText('REMPLAÇANTS', sx, sy); sy += 44 * u; mulish(ctx, 20 * u, 800); ctx.fillStyle = T.ink; subTxt.slice(0, 12).forEach(function (s, i) { ctx.fillText(s, sx, sy + i * 28 * u); }); sy += Math.min(12, subTxt.length) * 28 * u + 20 * u; }
      if (staff.length) { mulish(ctx, 17 * u, 700); ctx.fillStyle = T.sub; staff.slice(0, 5).forEach(function (s, i) { ctx.fillText(s.role + ' : ' + s.nom, sx, sy + i * 24 * u); }); }
    } else {
      var by = H - bottomH;
      if (subs.length) { font(ctx, f, 26 * u); ctx.fillStyle = c2; ctx.fillText('REMPLAÇANTS', W / 2, by); mulish(ctx, 18 * u, 800); ctx.fillStyle = T.ink; var ln = wrap(ctx, subTxt.join('  •  '), W - 2 * m).slice(0, 2); ln.forEach(function (s, i) { ctx.fillText(s, W / 2, by + 34 * u + i * 24 * u); }); by += 34 * u + ln.length * 24 * u + 6 * u; }
      if (staff.length) { mulish(ctx, 16 * u, 700); ctx.fillStyle = T.sub; var st = staff.map(function (s) { return s.role + ' : ' + s.nom; }).join('  ·  '); fitFont(ctx, st, W - 2 * m - 300 * u, 16 * u, function (q) { mulish(ctx, q, 700); }); ctx.textAlign = 'left'; ctx.fillText(st, m, H - 70 * u); }
    }
    ctx.restore();
    signature(ctx, W, H, L, T, u);
  }

  // ---------------------------------------------------------------- rendu complet
  function render(ctx, W, H, L, o) {
    ctx.save(); ctx.clearRect(0, 0, W, H);
    var T = peindreFond(ctx, W, H, L);
    if (L.style.modele === 'A') modeleA(ctx, W, H, L, T, o); else if (L.style.modele === 'C') modeleC(ctx, W, H, L, T, o); else modeleB(ctx, W, H, L, T, o);
    ctx.restore();
  }
  function taille(L, hd) { var F = FORMATS[L.style.format] || FORMATS['4:5'], k = hd ? 2 : 1; return [F[0] * k, F[1] * k]; }
  function toCanvas(L, hd, o) { var s = taille(L, hd), c = document.createElement('canvas'); c.width = s[0]; c.height = s[1]; var x = c.getContext('2d'); if (hd) x.scale(2, 2); render(x, s[0] / (hd ? 2 : 1), s[1] / (hd ? 2 : 1), L, o); return c; }
  function polices(L) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var fams = ['spartan', 'barlow', 'cormorant', 'archivo', 'cinzel'].map(function (k) { return FONTS[k][1] + ' 40px "' + FONTS[k][0] + '"'; }).concat(['800 20px "Mulish"', '600 20px "Mulish"', '700 20px "Mulish"']);
    return Promise.all(fams.map(function (f) { return document.fonts.load(f).catch(function () {}); }));
  }

  // ---------------------------------------------------------------- exports
  function nomFichier(L, ext) { return 'compo-' + slug([L.clubNom || L.equipe, L.adversaire, L.date].filter(Boolean).join(' ')) + '-' + L.style.modele.toLowerCase() + '.' + ext; }
  function telecharger(blob, name) { var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500); }
  function blobDe(c, type, q) { return new Promise(function (ok, ko) { try { c.toBlob(function (b) { if (b) ok(b); else ko(new Error('Export impossible')); }, type, q); } catch (e) { ko(new Error('Export bloqué : une photo vient d’un site qui interdit sa réutilisation. Importez-la depuis votre appareil.')); } }); }
  function exporterImage(L, type, hd) { return polices(L).then(function () { return imagesPretes(L); }).then(function () { var c = toCanvas(L, hd); return blobDe(c, type, .92); }); }
  // PDF d'une page contenant l'image JPEG (écrit à la main : aucune bibliothèque à télécharger)
  function exporterPDF(L, hd) {
    return exporterImage(L, 'image/jpeg', hd).then(function (b) { return b.arrayBuffer(); }).then(function (buf) {
      var s = taille(L, false), k = 842 / Math.max(s[0], s[1]), pw = (s[0] * k).toFixed(2), ph = (s[1] * k).toFixed(2), px = taille(L, hd);
      var jpg = new Uint8Array(buf), enc = function (t) { var a = new Uint8Array(t.length); for (var i = 0; i < t.length; i++) a[i] = t.charCodeAt(i) & 255; return a; };
      var parts = [], off = 0, xref = [];
      function put(x) { var a = typeof x === 'string' ? enc(x) : x; parts.push(a); off += a.length; }
      function obj(n, body) { xref[n] = off; put(n + ' 0 obj\n'); body.forEach(put); put('\nendobj\n'); }
      put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
      obj(1, ['<< /Type /Catalog /Pages 2 0 R >>']);
      obj(2, ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>']);
      obj(3, ['<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pw + ' ' + ph + '] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>']);
      obj(4, ['<< /Type /XObject /Subtype /Image /Width ' + px[0] + ' /Height ' + px[1] + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpg.length + ' >>\nstream\n', jpg, '\nendstream']);
      var cs = 'q ' + pw + ' 0 0 ' + ph + ' 0 0 cm /Im1 Do Q';
      obj(5, ['<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream']);
      obj(6, ['<< /Title (' + String(titreDe(L) + ' ' + (L.clubNom || '')).replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '?') + ') /Producer (Casa Line Up - Casa Besports) >>']);
      var xo = off; put('xref\n0 7\n0000000000 65535 f \n'); for (var i = 1; i <= 6; i++) put(('0000000000' + xref[i]).slice(-10) + ' 00000 n \n');
      put('trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + xo + '\n%%EOF');
      return new Blob(parts, { type: 'application/pdf' });
    });
  }
  // SVG vectoriel : le plan tactique vu du dessus (lignes, joueurs, noms), portraits intégrés
  function exporterSVG(L) {
    var S = SPORTS[L.sport] || SPORTS.football, G = geom(S.field), W = 1080, pad = 70, fw = W - 2 * pad, fh = fw * G.l / G.w, top = 230, H = Math.round(top + fh + 260);
    var P = projDessus({ x: pad, y: top, w: fw, h: fh }, G), c1 = L.style.c1, c2 = L.style.c2, e = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var out = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" font-family="League Spartan, Mulish, sans-serif">',
      '<title>' + e(titreDe(L) + (L.clubNom ? ' · ' + L.clubNom : '')) + '</title>', '<rect width="100%" height="100%" fill="' + c1 + '"/>',
      '<text x="' + W / 2 + '" y="120" text-anchor="middle" font-size="84" font-weight="800" fill="#ffffff">' + e(titreDe(L).toUpperCase()) + '</text>',
      '<text x="' + W / 2 + '" y="170" text-anchor="middle" font-size="24" font-weight="700" fill="rgba(255,255,255,.75)">' + e([L.clubNom, L.equipe].filter(Boolean).join(' · ')) + '</text>',
      '<text x="' + W / 2 + '" y="204" text-anchor="middle" font-size="20" fill="rgba(255,255,255,.65)">' + e(matchLigne(L)) + '</text>', '<g fill="none" stroke="rgba(255,255,255,.6)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'];
    G.prims.forEach(function (pr) { out.push('<path d="' + pr.p.map(function (q, k) { var s = P(q[0], q[1]); return (k ? 'L' : 'M') + s[0].toFixed(1) + ' ' + s[1].toFixed(1); }).join('') + (pr.close ? 'Z' : '') + '"' + (pr.dash ? ' stroke-dasharray="9 9"' : '') + (pr.net ? ' stroke-width="7"' : '') + '/>'); });
    out.push('</g>');
    L.titulaires.forEach(function (p, i) {
      var fy = L.style.gkHaut ? (1 - p.y / 100) * G.l : p.y / 100 * G.l, s = P(p.x / 100 * G.w, fy), r = 44;
      out.push('<g>');
      if (p.photo) out.push('<clipPath id="cp' + i + '"><circle cx="' + s[0].toFixed(1) + '" cy="' + s[1].toFixed(1) + '" r="' + r + '"/></clipPath><circle cx="' + s[0].toFixed(1) + '" cy="' + s[1].toFixed(1) + '" r="' + (r + 4) + '" fill="' + c2 + '"/><image href="' + e(p.photo) + '" xlink:href="' + e(p.photo) + '" x="' + (s[0] - r).toFixed(1) + '" y="' + (s[1] - r).toFixed(1) + '" width="' + 2 * r + '" height="' + 2 * r * 1.25 + '" preserveAspectRatio="xMidYMin slice" clip-path="url(#cp' + i + ')"/>');
      else out.push('<circle cx="' + s[0].toFixed(1) + '" cy="' + s[1].toFixed(1) + '" r="' + r + '" fill="' + c2 + '"/><text x="' + s[0].toFixed(1) + '" y="' + (s[1] + 13).toFixed(1) + '" text-anchor="middle" font-size="38" font-weight="800" fill="' + (onDark(c2) ? '#fff' : '#111') + '">' + e(p.num || p.poste) + '</text>');
      out.push('<text x="' + s[0].toFixed(1) + '" y="' + (s[1] + r + 30).toFixed(1) + '" text-anchor="middle" font-size="24" font-weight="800" fill="#ffffff">' + e(((p.num && p.photo ? p.num + ' ' : '') + nomCourt(p)).toUpperCase() + (p.cap ? ' (C)' : '')) + '</text></g>');
    });
    var subs = L.remplacants.filter(hasPerson).map(function (p) { return (p.num ? p.num + ' ' : '') + nomCourt(p).toUpperCase(); });
    if (subs.length) out.push('<text x="' + W / 2 + '" y="' + (top + fh + 80) + '" text-anchor="middle" font-size="28" font-weight="800" fill="' + c2 + '">REMPLAÇANTS</text><text x="' + W / 2 + '" y="' + (top + fh + 120) + '" text-anchor="middle" font-size="20" font-weight="700" fill="#ffffff">' + e(subs.join('  •  ')) + '</text>');
    var staff = L.staff.concat(L.arbitres).filter(function (s) { return s.nom; }).map(function (s) { return s.role + ' : ' + s.nom; });
    if (staff.length) out.push('<text x="' + W / 2 + '" y="' + (top + fh + 160) + '" text-anchor="middle" font-size="18" fill="rgba(255,255,255,.7)">' + e(staff.join('  ·  ')) + '</text>');
    if (L.style.casa || L.style.signature) out.push('<text x="' + (W - pad) + '" y="' + (H - 40) + '" text-anchor="end" font-size="22" font-weight="800" fill="#ffffff">' + (L.style.casa ? 'CASA BESPORTS  ' : '') + (L.style.signature ? 'BE<tspan fill="#f2b33d">+</tspan>' : '') + '</text>');
    out.push('</svg>');
    return Promise.resolve(new Blob([out.join('\n')], { type: 'image/svg+xml' }));
  }
  function exporterJSON(L) { var d = clone(L); d.app = 'Casa Line Up · Casa Besports'; d.exporte_le = new Date().toISOString(); return Promise.resolve(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })); }
  function videoType() {
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) return null;
    var c = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (var i = 0; i < c.length; i++) if (MediaRecorder.isTypeSupported(c[i])) return c[i];
    return null;
  }
  // Vidéo animée (6 s) : les éléments apparaissent un à un ; MP4 si le navigateur sait l'écrire (Safari, Chrome récent), sinon WebM
  function exporterVideo(L, onProg) {
    var type = videoType(); if (!type) return Promise.reject(new Error('Ce navigateur ne sait pas enregistrer de vidéo. Essayez Chrome, Edge ou Safari récents.'));
    return polices(L).then(function () { return imagesPretes(L); }).then(function () {
      var s = taille(L, false), k = 720 / Math.min(s[0], s[1]), W = Math.round(s[0] * k / 2) * 2, H = Math.round(s[1] * k / 2) * 2;
      var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
      var st = c.captureStream(30), rec = new MediaRecorder(st, { mimeType: type, videoBitsPerSecond: 5000000 }), parts = [];
      rec.ondataavailable = function (e) { if (e.data && e.data.size) parts.push(e.data); };
      return new Promise(function (ok, ko) {
        rec.onstop = function () { ok({ blob: new Blob(parts, { type: type.split(';')[0] }), ext: /mp4/.test(type) ? 'mp4' : 'webm' }); };
        rec.onerror = function (e) { ko(e.error || new Error('Enregistrement interrompu')); };
        var dur = 6000, t0 = performance.now(); rec.start(250);
        (function frame() {
          var t = performance.now() - t0, p = Math.min(1, t / 4200);
          x.setTransform(k, 0, 0, k, 0, 0); render(x, s[0], s[1], L, { p: p }); if (onProg) onProg(Math.min(1, t / dur));
          if (t < dur) requestAnimationFrame(frame); else setTimeout(function () { rec.stop(); st.getTracks().forEach(function (tr) { tr.stop(); }); }, 120);
        })();
      });
    });
  }

  // ---------------------------------------------------------------- enregistrement (en ligne ou sur l'appareil)
  var D = { sqlMissing: false };
  var LOCAL = 'cb-lineups-v1';
  function enLigne() { return !!(moi() && !D.sqlMissing); }
  function db(fn) { return A().db(fn); }
  function apercu(L) { try { var s = taille(L, false), k = 320 / s[0], c = document.createElement('canvas'); c.width = 320; c.height = Math.round(s[1] * k); var x = c.getContext('2d'); x.scale(k, k); render(x, s[0], s[1], L); return c.toDataURL('image/jpeg', .72); } catch (e) { return null; } }
  var Store = {
    liste: function () {
      if (!enLigne()) return Promise.resolve(LS.get(LOCAL, []).map(function (r) { return Object.assign({ local: true }, r); }));
      return db(function (c) { return c.from('lineups').select('id, titre, variante, variante_de, sport, club, equipe, visibilite, statut, publier_le, apercu, maj_le').eq('owner', moi().id).order('maj_le', { ascending: false }).limit(200); })
        .catch(function (e) { if (missing(e)) { D.sqlMissing = true; return Store.liste(); } throw e; });
    },
    lire: function (id) {
      if (/^loc-/.test(id)) { var r = LS.get(LOCAL, []).find(function (x) { return x.id === id; }); return Promise.resolve(r ? Object.assign({ local: true }, r) : null); }
      if (!A()) return Promise.resolve(null);
      return db(function (c) { return c.from('lineups').select('*').eq('id', id).maybeSingle(); });
    },
    enregistrer: function (L, meta) {
      var row = { titre: (meta.titre || titreDe(L) + (L.clubNom ? ' · ' + L.clubNom : '')).slice(0, 120), variante: meta.variante || null, variante_de: meta.variante_de || null, sport: L.sport, club: L.club || null, equipe: L.equipe || null,
        donnees: L, apercu: apercu(L), visibilite: meta.visibilite || 'prive', statut: meta.statut || 'brouillon', publier_le: meta.publier_le || null };
      if (!enLigne()) {
        var all = LS.get(LOCAL, []), id = meta.id && /^loc-/.test(meta.id) ? meta.id : uidLocal(), i = all.findIndex(function (x) { return x.id === id; });
        var r = Object.assign({ id: id, maj_le: new Date().toISOString() }, row); r.visibilite = 'prive'; r.statut = 'brouillon';
        if (i >= 0) all[i] = r; else all.unshift(r);
        if (!LS.set(LOCAL, all.slice(0, 40))) return Promise.reject(new Error('Mémoire de l’appareil pleine : supprimez d’anciennes compositions ou connectez-vous pour enregistrer en ligne.'));
        return Promise.resolve(Object.assign({ local: true }, r));
      }
      var q = meta.id && !/^loc-/.test(meta.id) ? function (c) { return c.from('lineups').update(row).eq('id', meta.id).select('id, titre, variante, visibilite, statut, publier_le').single(); } : function (c) { return c.from('lineups').insert(row).select('id, titre, variante, visibilite, statut, publier_le').single(); };
      return db(q).catch(function (e) { if (missing(e)) { D.sqlMissing = true; return Store.enregistrer(L, meta); } throw e; });
    },
    supprimer: function (id) {
      if (/^loc-/.test(id)) { LS.set(LOCAL, LS.get(LOCAL, []).filter(function (x) { return x.id !== id; })); return Promise.resolve(); }
      return db(function (c) { return c.from('lineups').delete().eq('id', id); });
    },
    envoyer: function (id, dest, commentaire) { return db(function (c) { return c.rpc('lineup_envoyer', { l: id, email: dest.email || null, club: dest.club || null, redaction: !!dest.redaction, commentaire: commentaire || null }); }); },
    recues: function () { if (!enLigne()) return Promise.resolve([]); return db(function (c) { return c.rpc('lineup_recues'); }).catch(function (e) { if (missing(e)) { D.sqlMissing = true; return []; } throw e; }); },
    envois: function (id) { if (!enLigne() || /^loc-/.test(id)) return Promise.resolve([]); return db(function (c) { return c.from('lineup_envois').select('id, dest_libelle, commentaire, statut, reponse, proposition, repondu_nom, repondu_le, cree_le').eq('lineup_id', id).order('cree_le', { ascending: false }); }); },
    repondre: function (e, statut, reponse, prop) { return db(function (c) { return c.rpc('lineup_repondre', { e: e, statut: statut, reponse: reponse || null, proposition: prop || null }); }); },
    prevenir: function (envoi) { var a = A(); if (!a || !a.appel) return Promise.resolve(); return a.appel('notifications', { action: 'lineup', envoi: envoi }).catch(function () {}); }
  };

  // ---------------------------------------------------------------- interface
  var st = null; // session ouverte
  function css() {
    if (document.getElementById('cbl-css')) return;
    var s = el('style', { id: 'cbl-css' });
    s.textContent = [
      '#cbl{position:fixed;inset:0;z-index:9998;background:#0b1b28;color:#e9efee;font:500 14px/1.45 Mulish,system-ui,sans-serif;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top,0px)}',
      '#cbl *{box-sizing:border-box}#cbl button,#cbl input,#cbl select,#cbl textarea{font:inherit;color:inherit}',
      '#cbl .cbl-top{display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem;border-bottom:1px solid rgba(233,239,238,.12);background:#10283a;flex-wrap:wrap}',
      '#cbl .cbl-brand{display:flex;align-items:center;gap:.5rem;font:700 18px/1 "Barlow Condensed",sans-serif;margin-right:.4rem;white-space:nowrap}',
      '#cbl .cbl-brand img{height:22px;width:auto}',
      '#cbl .cbl-tabs{display:flex;gap:.25rem;flex:1;overflow-x:auto}',
      '#cbl .cbl-tab{border:0;background:transparent;padding:.45rem .7rem;border-radius:6px;cursor:pointer;font-weight:700;font-size:13px;color:#9fb3bf;white-space:nowrap}',
      '#cbl .cbl-tab[aria-selected=true]{background:rgba(242,179,61,.16);color:#f2b33d}',
      '#cbl .cbl-badge{display:inline-block;min-width:18px;padding:0 5px;margin-left:4px;border-radius:9px;background:#f2b33d;color:#10283a;font-size:11px;line-height:18px;text-align:center}',
      '#cbl .cbl-x{border:1px solid rgba(233,239,238,.3);background:transparent;border-radius:6px;padding:.35rem .6rem;cursor:pointer;font-weight:700}',
      '#cbl .cbl-main{flex:1;min-height:0;display:flex}',
      '#cbl .cbl-ed{width:420px;flex:none;overflow-y:auto;border-right:1px solid rgba(233,239,238,.1);padding:.6rem .8rem 6rem}',
      '#cbl .cbl-pv{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;padding:.8rem;gap:.6rem;overflow:auto}',
      '#cbl .cbl-pv canvas{max-width:100%;max-height:calc(100vh - 170px);height:auto;box-shadow:0 10px 40px rgba(0,0,0,.5);background:#000;border-radius:4px}',
      '#cbl .cbl-bar{display:flex;flex-wrap:wrap;gap:.3rem;justify-content:center}',
      '#cbl .cbl-chip{border:1px solid rgba(233,239,238,.25);background:rgba(233,239,238,.04);border-radius:999px;padding:.32rem .7rem;cursor:pointer;font-size:12.5px;font-weight:700}',
      '#cbl .cbl-chip[aria-pressed=true]{background:#f2b33d;border-color:#f2b33d;color:#10283a}',
      '#cbl details{border:1px solid rgba(233,239,238,.12);border-radius:8px;margin:.5rem 0;background:rgba(16,40,58,.55)}',
      '#cbl summary{cursor:pointer;padding:.65rem .8rem;font:700 15px/1.2 "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;list-style:none;display:flex;justify-content:space-between}',
      '#cbl summary::-webkit-details-marker{display:none}#cbl summary::after{content:"+";color:#f2b33d}#cbl details[open]>summary::after{content:"–"}',
      '#cbl .cbl-sec{padding:0 .8rem .8rem}',
      '#cbl label.cbl-l{display:block;font-size:12px;font-weight:700;color:#9fb3bf;margin:.55rem 0 .2rem}',
      '#cbl .cbl-in{width:100%;background:#0b1b28;border:1px solid rgba(233,239,238,.2);border-radius:6px;padding:.45rem .55rem;min-height:36px}',
      '#cbl .cbl-in:focus,#cbl button:focus-visible,#cbl summary:focus-visible,#cbl [tabindex]:focus-visible{outline:2px solid #f2b33d;outline-offset:1px}',
      '#cbl .cbl-row{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}',
      '#cbl .cbl-2{display:grid;grid-template-columns:1fr 1fr;gap:.4rem}',
      '#cbl .cbl-btn{border:1px solid rgba(233,239,238,.3);background:rgba(233,239,238,.06);border-radius:6px;padding:.45rem .75rem;cursor:pointer;font-weight:700;font-size:13px;min-height:36px}',
      '#cbl .cbl-btn.pri{background:#f2b33d;border-color:#f2b33d;color:#10283a}',
      '#cbl .cbl-btn.sm{padding:.25rem .5rem;min-height:30px;font-size:12px}',
      '#cbl .cbl-btn[disabled]{opacity:.45;cursor:not-allowed}',
      '#cbl .cbl-p{display:grid;grid-template-columns:44px 46px 1fr 1fr;gap:.3rem;align-items:center;margin:.25rem 0}',
      '#cbl .cbl-p .cbl-in{min-height:32px;padding:.3rem .4rem;font-size:13px}',
      '#cbl .cbl-ph{width:44px;height:55px;border-radius:5px;border:1px dashed rgba(233,239,238,.35);background:#0b1b28 center/cover no-repeat;cursor:pointer;font-size:10px;color:#9fb3bf;display:flex;align-items:center;justify-content:center;text-align:center;padding:2px}',
      '#cbl .cbl-pa{grid-column:2/-1;display:flex;gap:.3rem;align-items:center;flex-wrap:wrap;font-size:12px;color:#9fb3bf;margin-bottom:.35rem}',
      '#cbl .cbl-note{font-size:12.5px;color:#9fb3bf;margin:.4rem 0}',
      '#cbl .cbl-warn{background:rgba(242,179,61,.12);border:1px solid rgba(242,179,61,.4);color:#f6dca5;border-radius:6px;padding:.5rem .65rem;font-size:13px;margin:.5rem 0}',
      '#cbl .cbl-board{position:relative;width:100%;max-width:360px;margin:.5rem auto;touch-action:none;user-select:none}',
      '#cbl .cbl-board svg{width:100%;height:auto;display:block;background:#1f5a2c;border-radius:6px}',
      '#cbl .cbl-tok{cursor:grab}#cbl .cbl-tok:focus{outline:none}#cbl .cbl-tok:focus circle{stroke:#f2b33d;stroke-width:1.2}',
      '#cbl .cbl-list{padding:.8rem;overflow-y:auto;flex:1;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.7rem;align-content:start}',
      '#cbl .cbl-card{background:#10283a;border:1px solid rgba(233,239,238,.12);border-radius:8px;overflow:hidden;display:flex;flex-direction:column}',
      '#cbl .cbl-card img{width:100%;aspect-ratio:4/5;object-fit:cover;background:#0b1b28;display:block}',
      '#cbl .cbl-card .cbl-cb{padding:.6rem;display:flex;flex-direction:column;gap:.3rem;flex:1}',
      '#cbl .cbl-tag{display:inline-block;font-size:11px;font-weight:800;padding:.1rem .45rem;border-radius:4px;background:rgba(233,239,238,.12);margin-right:.25rem}',
      '#cbl .cbl-tag.ok{background:rgba(74,222,128,.18);color:#9ff0bb}#cbl .cbl-tag.wait{background:rgba(242,179,61,.18);color:#f6dca5}#cbl .cbl-tag.no{background:rgba(255,107,122,.18);color:#ffb3bb}',
      '#cbl .cbl-empty{grid-column:1/-1;text-align:center;color:#9fb3bf;padding:3rem 1rem}',
      '#cbl .cbl-toast{position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:#e9efee;color:#10283a;padding:.6rem 1rem;border-radius:8px;font-weight:700;z-index:10000;max-width:92vw;box-shadow:0 6px 24px rgba(0,0,0,.4)}',
      '#cbl .cbl-modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:9999;padding:1rem}',
      '#cbl .cbl-modal>div{background:#10283a;border-radius:10px;padding:1rem;max-width:420px;width:100%;text-align:center}',
      '#cbl .cbl-modal svg{width:240px;height:240px;background:#fff;padding:10px;border-radius:6px}',
      '#cbl .cbl-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}',
      '@media (max-width:899px){#cbl .cbl-main{flex-direction:column;overflow-y:auto}#cbl .cbl-ed{width:auto;border-right:0;overflow:visible;padding-bottom:5rem}#cbl .cbl-pv{order:-1;flex:none;position:sticky;top:0;z-index:2;background:#0b1b28;padding:.5rem;border-bottom:1px solid rgba(233,239,238,.1)}#cbl .cbl-pv canvas{max-height:38vh}#cbl .cbl-brand{font-size:16px}}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function toast(t) { if (!st) return; var x = el('div', { class: 'cbl-toast', role: 'status' }, t); st.root.appendChild(x); setTimeout(function () { x.remove(); }, 3200); }
  function fermer() {
    if (!st) return; if (st.dirty && !confirm('Fermer Casa Line Up ? Les changements non enregistrés seront perdus.')) return;
    document.removeEventListener('keydown', st.onKey); st.root.remove(); document.body.style.overflow = st.ovf || ''; redrawLater = null;
    try { if (st.back && st.back.focus) st.back.focus(); } catch (e) {} st = null;
  }
  function onglet(t) { st.tab = t; draw(); }

  function open(ctx, opts) {
    opts = opts || {}; css();
    if (st) fermer(); if (st) return;
    var root = el('div', { id: 'cbl', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Casa Line Up : compositions d’équipe' });
    st = { root: root, ctx: ctx || {}, tab: 'creer', L: null, meta: {}, dirty: false, back: document.activeElement, ovf: document.body.style.overflow, recuesN: 0 };
    st.onKey = function (e) { if (e.key === 'Escape' && !root.querySelector('.cbl-modal')) fermer(); };
    document.addEventListener('keydown', st.onKey); document.body.style.overflow = 'hidden';
    document.body.appendChild(root);
    redrawLater = function () { if (st && st.schedule) st.schedule(); };
    if (opts.id) { st.tab = 'voir'; st.voirId = opts.id; st.voirEnvoi = opts.envoi || null; }
    else { st.L = nouvelle(preremplir(opts)); }
    polices().then(function () { if (st && st.schedule) st.schedule(); });
    draw();
    compterRecues();
  }
  function preremplir(o) {
    var x = {}, c = o.club ? (st.ctx.clubs || []).find(function (k) { return k.id === o.club; }) : null;
    if (c) { x.club = c.id; x.clubNom = c.name; x.clubLogo = c.logo || ''; x.sport = sportDe(c.sport); }
    else if (o.sport) x.sport = sportDe(o.sport);
    return x;
  }
  function compterRecues() { if (!enLigne()) return; Store.recues().then(function (r) { if (!st) return; st.recuesN = (r || []).filter(function (x) { return x.statut === 'envoye'; }).length; var b = st.root.querySelector('[data-tab=recues] .cbl-badge'); if (b) { b.textContent = st.recuesN; b.style.display = st.recuesN ? '' : 'none'; } }, function () {}); }

  function draw() {
    var r = st.root; r.innerHTML = '';
    var tabs = [['creer', 'Composer'], ['mes', 'Mes compositions'], ['recues', 'Reçues']];
    if (st.tab === 'voir') tabs.push(['voir', 'Composition partagée']);
    r.appendChild(el('div', { class: 'cbl-top' },
      el('div', { class: 'cbl-brand' }, 'Casa Line Up'),
      el('div', { class: 'cbl-tabs', role: 'tablist' }, tabs.map(function (t) { return el('button', { type: 'button', class: 'cbl-tab', role: 'tab', 'data-tab': t[0], 'aria-selected': st.tab === t[0] ? 'true' : 'false', onclick: function () { onglet(t[0]); } }, t[1], t[0] === 'recues' ? el('span', { class: 'cbl-badge', style: st.recuesN ? '' : 'display:none' }, String(st.recuesN)) : null); })),
      el('button', { type: 'button', class: 'cbl-x', onclick: fermer, 'aria-label': 'Fermer Casa Line Up' }, 'Fermer')));
    var main = el('div', { class: 'cbl-main' }); r.appendChild(main);
    if (st.tab === 'creer') editeur(main); else if (st.tab === 'mes') mesCompos(main); else if (st.tab === 'recues') recues(main); else voir(main);
    var f = r.querySelector('[aria-selected=true]'); if (f && !st.focused) { st.focused = true; f.focus(); }
  }

  // ---------- aperçu ----------
  function apercuBloc(L, readonly) {
    var cv = el('canvas', { role: 'img', 'aria-label': 'Aperçu de la composition' }), pv = el('div', { class: 'cbl-pv' });
    var bar1 = el('div', { class: 'cbl-bar', role: 'group', 'aria-label': 'Modèle' }), bar2 = el('div', { class: 'cbl-bar', role: 'group', 'aria-label': 'Format' });
    function chips() {
      bar1.innerHTML = ''; bar2.innerHTML = '';
      Object.keys(MODELES).forEach(function (k) { bar1.appendChild(el('button', { type: 'button', class: 'cbl-chip', 'aria-pressed': L.style.modele === k ? 'true' : 'false', title: MODELES[k][1], onclick: function () { L.style.modele = k; touche(); chips(); } }, MODELES[k][0])); });
      Object.keys(FORMATS).forEach(function (k) { bar2.appendChild(el('button', { type: 'button', class: 'cbl-chip', 'aria-pressed': L.style.format === k ? 'true' : 'false', onclick: function () { L.style.format = k; touche(); chips(); } }, FORMATS[k][2])); });
    }
    chips();
    var pending = false;
    st.schedule = function () { if (pending) return; pending = true; requestAnimationFrame(function () { pending = false; if (!st) return; var s = taille(L, false); if (cv.width !== s[0] || cv.height !== s[1]) { cv.width = s[0]; cv.height = s[1]; } render(cv.getContext('2d'), s[0], s[1], L); }); };
    st.chips = chips;
    pv.appendChild(bar1); pv.appendChild(bar2); pv.appendChild(cv);
    st.schedule();
    return pv;
  }
  function touche() { if (!st) return; st.dirty = true; if (st.schedule) st.schedule(); if (st.board) st.board(); }

  // ---------- éditeur ----------
  function inp(L, obj, key, label, o) {
    o = o || {};
    var tag = o.long ? 'textarea' : o.options ? 'select' : 'input';
    var e = el(tag, { class: 'cbl-in', type: o.type || (tag === 'input' ? 'text' : null), placeholder: o.ph || null, rows: o.long ? 3 : null, maxlength: o.max || null, list: o.list || null, 'aria-label': label });
    if (o.options) o.options.forEach(function (op) { e.appendChild(el('option', { value: op[0], selected: String(obj[key]) === String(op[0]) ? true : null }, op[1])); });
    else e.value = obj[key] == null ? '' : obj[key];
    e.addEventListener(o.options || o.type === 'color' ? 'change' : 'input', function () { obj[key] = o.type === 'range' ? Number(e.value) : e.value; if (o.after) o.after(e.value); touche(); });
    if (o.type === 'color') e.addEventListener('input', function () { obj[key] = e.value; touche(); });
    return label ? [el('label', { class: 'cbl-l' }, label), e] : e;
  }
  function section(title, open, body) { var d = el('details', open ? { open: true } : {}, el('summary', {}, title), el('div', { class: 'cbl-sec' }, body)); return d; }
  function editeur(main) {
    var L = st.L; if (!L) { st.L = L = nouvelle(); }
    var ed = el('div', { class: 'cbl-ed' });
    main.appendChild(apercuBloc(L)); main.insertBefore(ed, main.firstChild);
    if (st.meta.repondreA) ed.appendChild(el('div', { class: 'cbl-warn' }, 'Vous modifiez la composition reçue de ' + (st.meta.repondreNom || 'un utilisateur') + '. Faites vos changements puis « Envoyer ma proposition » (dernière rubrique).'));
    if (!moi()) ed.appendChild(el('div', { class: 'cbl-warn' }, 'Sans compte, votre composition est gardée sur cet appareil. ', el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { var c = st.ctx.connect; if (c) { fermerForce(); c(); } } }, 'Se connecter'), ' pour l’enregistrer en ligne, l’envoyer et la publier.'));
    else if (D.sqlMissing) ed.appendChild(el('div', { class: 'cbl-warn' }, st.ctx.role === 'admin' ? 'Le partage en ligne n’est pas encore activé sur ce site (fichier supabase/lineups.sql à lancer une fois). En attendant, vos compositions restent sur cet appareil.' : 'Le partage en ligne arrive bientôt. En attendant, vos compositions restent sur cet appareil.'));
    ed.appendChild(secMatch(L));
    ed.appendChild(secJoueurs(L));
    ed.appendChild(secTactique(L));
    ed.appendChild(secStyle(L));
    ed.appendChild(secPartage(L));
  }
  function fermerForce() { if (st) { st.dirty = false; fermer(); } }
  function clubsDe() { return (st.ctx.clubs || []).filter(function (c) { return c && c.id && c.name; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'fr'); }); }
  function secMatch(L) {
    var clubs = clubsDe();
    var sportSel = inp(L, L, 'sport', 'Discipline', { options: Object.keys(SPORTS).map(function (k) { return [k, SPORTS[k].label]; }), after: function () { changerSport(L, L.sport); } });
    var clubSel = el('select', { class: 'cbl-in', 'aria-label': 'Club' }, el('option', { value: '' }, '— Autre club (saisie libre) —'), clubs.map(function (c) { return el('option', { value: c.id, selected: c.id === L.club ? true : null }, c.name + (c.sport ? ' · ' + c.sport : '')); }));
    var libre = el('input', { class: 'cbl-in', placeholder: 'Nom du club', value: L.club ? '' : L.clubNom, style: L.club ? 'display:none;margin-top:.3rem' : 'margin-top:.3rem', 'aria-label': 'Nom du club (saisie libre)' });
    clubSel.addEventListener('change', function () {
      var c = clubs.find(function (k) { return k.id === clubSel.value; }); L.club = c ? c.id : ''; L.clubNom = c ? c.name : libre.value; L.clubLogo = c && c.logo ? c.logo : (c ? '' : L.clubLogo);
      libre.style.display = c ? 'none' : ''; if (c && sportDe(c.sport) !== L.sport) changerSport(L, sportDe(c.sport)); else { touche(); draw(); }
    });
    libre.addEventListener('input', function () { L.clubNom = libre.value; touche(); });
    var dl = el('datalist', { id: 'cbl-clubs' }, clubs.map(function (c) { return el('option', { value: c.name }); }));
    var sugg = el('div', { class: 'cbl-row', style: 'margin-top:.4rem' });
    var ms = matchsDuClub(L);
    if (ms.length) { sugg.appendChild(el('span', { class: 'cbl-note', style: 'margin:0' }, 'Prochains matchs :')); ms.forEach(function (m) { sugg.appendChild(el('button', { type: 'button', class: 'cbl-chip', onclick: function () { remplirMatch(L, m); draw(); touche(); } }, (m.date ? jourFr(m.date) + ' · ' : '') + (m.adv || ''))); }); }
    return section('1 · Le match', true, [sportSel, el('label', { class: 'cbl-l' }, 'Club'), clubSel, libre, dl,
      inp(L, L, 'equipe', 'Équipe', { ph: 'Seniors A, U17, Équipe 2…', max: 60 }), sugg,
      el('div', { class: 'cbl-2' }, el('div', {}, inp(L, L, 'adversaire', 'Adversaire', { list: 'cbl-clubs', max: 80, after: function () { var c = clubs.find(function (k) { return nrm(k.name) === nrm(L.adversaire); }); if (c && c.logo && !L.advLogoPerso) { L.advLogo = c.logo; } } })),
        el('div', {}, inp(L, L, 'domicile', 'Lieu', { options: [['dom', 'À domicile'], ['ext', 'À l’extérieur'], ['neutre', 'Terrain neutre']] }))),
      inp(L, L, 'competition', 'Compétition', { ph: 'Régional 2 · Journée 8', max: 80 }),
      el('div', { class: 'cbl-2' }, el('div', {}, inp(L, L, 'date', 'Date', { type: 'date' })), el('div', {}, inp(L, L, 'heure', 'Heure', { type: 'time' }))),
      inp(L, L, 'lieu', 'Stade ou salle', { max: 80 })]);
  }
  function matchsDuClub(L) {
    var nom = nrm(L.clubNom); if (!nom) return [];
    var mots = nom.split(/\s+/).filter(function (w) { return w.length > 3; }); if (!mots.length) return [];
    var today = new Date().toISOString().slice(0, 10);
    return (st.ctx.matches || []).filter(function (m) { var h = nrm(m.home), a = nrm(m.away); return m.status !== 'done' && (!m.date || m.date >= today) && mots.some(function (w) { return h.indexOf(w) >= 0 || a.indexOf(w) >= 0; }); })
      .slice(0, 6).map(function (m) { var dom = mots.some(function (w) { return nrm(m.home).indexOf(w) >= 0; }); return { date: m.date, heure: m.time, adv: dom ? m.away : m.home, dom: dom, comp: m.comp, lieu: m.venue }; });
  }
  function remplirMatch(L, m) { L.adversaire = m.adv || ''; L.date = m.date || ''; L.heure = /^\d{1,2}[:h]\d{2}$/.test(m.heure || '') ? m.heure.replace('h', ':').padStart(5, '0') : ''; L.domicile = m.dom ? 'dom' : 'ext'; if (m.comp) L.competition = m.comp; if (m.lieu) L.lieu = m.lieu; }
  function changerSport(L, sport) {
    var S = SPORTS[sport] || SPORTS.football; L.sport = sport;
    var form = Object.keys(S.forms)[0], slots = slotsFor(sport, form), old = L.titulaires;
    L.formation = form;
    L.titulaires = slots.map(function (s, i) { var p = old[i] || {}; return { x: s.x, y: s.y, poste: s.poste, prenom: p.prenom || '', nom: p.nom || '', num: p.num || '', photo: p.photo || '', credit: p.credit || '', cap: !!p.cap }; });
    old.slice(slots.length).filter(hasPerson).forEach(function (p) { L.remplacants.push({ prenom: p.prenom, nom: p.nom, num: p.num, photo: p.photo, credit: p.credit, poste: p.poste }); });
    L.remplacants = L.remplacants.slice(0, S.subs); L.vedettes = null;
    touche(); draw();
  }
  function appliquerFormation(L, form) {
    var slots = slotsFor(L.sport, form); L.formation = form;
    L.titulaires.forEach(function (p, i) { if (slots[i]) { p.x = slots[i].x; p.y = slots[i].y; p.poste = slots[i].poste; } });
    touche(); draw();
  }
  function personne(p) { return { prenom: p.prenom, nom: p.nom, num: p.num, photo: p.photo, credit: p.credit, cap: p.cap }; }
  function echanger(a, b) { var pa = personne(a), pb = personne(b); Object.assign(a, pb); Object.assign(b, pa); }
  function photoBtn(p) {
    var f = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    var b = el('button', { type: 'button', class: 'cbl-ph', 'aria-label': p.photo ? 'Changer la photo' : 'Importer une photo', style: p.photo ? 'background-image:url("' + String(p.photo).replace(/"/g, '%22') + '")' : '' }, p.photo ? '' : 'Photo');
    b.addEventListener('click', function () { f.click(); });
    f.addEventListener('change', function () { var file = f.files && f.files[0]; f.value = ''; if (!file) return; b.textContent = '…'; lirePhoto(file).then(function (u) { p.photo = u; p.credit = ''; b.textContent = ''; b.style.backgroundImage = 'url("' + u + '")'; touche(); }, function (e) { b.textContent = 'Photo'; toast(msg(e)); }); });
    return [b, f];
  }
  function ligneJoueur(L, list, i, tit) {
    var p = list[i], S = SPORTS[L.sport];
    var row = el('div', { class: 'cbl-p' }, photoBtn(p), inp(L, p, 'num', null, { ph: 'N°', max: 3 }), inp(L, p, 'prenom', null, { ph: 'Prénom', max: 30 }), inp(L, p, 'nom', null, { ph: 'Nom', max: 30 }));
    row.querySelectorAll('input')[1].setAttribute('aria-label', (tit ? 'Titulaire ' : 'Remplaçant ') + (i + 1) + ' : numéro');
    var acts = el('div', { class: 'cbl-pa' });
    if (tit) {
      acts.appendChild(el('span', { title: POSTE_NOM[p.poste] || '' }, p.poste || ''));
      var cap = el('label', { style: 'display:inline-flex;gap:.25rem;align-items:center;cursor:pointer' }, el('input', { type: 'radio', name: 'cbl-cap', checked: p.cap ? true : null, onchange: function () { L.titulaires.forEach(function (q) { q.cap = false; }); p.cap = true; touche(); } }), 'Capitaine');
      acts.appendChild(cap);
    } else {
      acts.appendChild(inp(L, p, 'poste', null, { ph: 'Poste', max: 20 }));
      acts.lastChild.style.cssText = 'width:90px;min-height:28px;padding:.2rem .4rem';
    }
    if (i > 0) acts.appendChild(el('button', { type: 'button', class: 'cbl-btn sm', 'aria-label': 'Monter', onclick: function () { if (tit) echanger(list[i], list[i - 1]); else { var t = list[i]; list[i] = list[i - 1]; list[i - 1] = t; } touche(); draw(); } }, '↑'));
    if (i < list.length - 1) acts.appendChild(el('button', { type: 'button', class: 'cbl-btn sm', 'aria-label': 'Descendre', onclick: function () { if (tit) echanger(list[i], list[i + 1]); else { var t = list[i]; list[i] = list[i + 1]; list[i + 1] = t; } touche(); draw(); } }, '↓'));
    if (tit && L.remplacants.length) acts.appendChild(el('button', { type: 'button', class: 'cbl-btn sm', title: 'Échanger avec le premier remplaçant', onclick: function () { var r = L.remplacants[0], pr = personne(p); Object.assign(p, { prenom: r.prenom || '', nom: r.nom || '', num: r.num || '', photo: r.photo || '', credit: r.credit || '', cap: false }); L.remplacants[0] = { prenom: pr.prenom, nom: pr.nom, num: pr.num, photo: pr.photo, credit: pr.credit, poste: p.poste }; touche(); draw(); } }, '⇄ Remplaçant'));
    if (!tit) acts.appendChild(el('button', { type: 'button', class: 'cbl-btn sm', 'aria-label': 'Retirer ce remplaçant', onclick: function () { list.splice(i, 1); touche(); draw(); } }, 'Retirer'));
    if (p.photo) acts.appendChild(el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { p.photo = ''; p.credit = ''; touche(); draw(); } }, 'Sans photo'));
    if (p.credit) acts.appendChild(el('span', {}, 'Photo : ' + p.credit));
    return [row, acts];
  }
  function secJoueurs(L) {
    var S = SPORTS[L.sport], eff = (st.ctx.players || []).filter(function (p) { return p && p.name && ((L.club && p.club === L.club) || (!L.club && L.clubNom && nrm(p.clubLabel) === nrm(L.clubNom))); });
    var pick = null;
    if (eff.length) {
      pick = el('select', { class: 'cbl-in', 'aria-label': 'Ajouter un joueur de l’effectif' }, el('option', { value: '' }, '+ Ajouter un joueur de l’effectif (' + eff.length + ')'), eff.map(function (p, i) { return el('option', { value: String(i) }, (p.num ? p.num + ' · ' : '') + p.name + (p.role ? ' · ' + p.role : '')); }));
      pick.addEventListener('change', function () {
        var p = eff[Number(pick.value)]; pick.value = ''; if (!p) return;
        var parts = String(p.name).trim().split(/\s+/), prenom = parts.length > 1 ? parts.slice(0, -1).join(' ') : '', nom = parts[parts.length - 1];
        var o = { prenom: prenom, nom: nom, num: p.num || '', photo: p.img || '', credit: p.credit || '' };
        var slot = L.titulaires.find(function (q) { return !hasPerson(q); });
        if (slot) Object.assign(slot, o); else if (L.remplacants.length < S.subs) L.remplacants.push(Object.assign({ poste: p.role || '' }, o)); else { toast('Équipe complète'); return; }
        touche(); draw();
      });
    }
    var tit = [], i;
    for (i = 0; i < L.titulaires.length; i++) tit.push(ligneJoueur(L, L.titulaires, i, true));
    var subs = []; for (i = 0; i < L.remplacants.length; i++) subs.push(ligneJoueur(L, L.remplacants, i, false));
    var staffRows = function (list, roles, label) {
      return el('div', {}, el('label', { class: 'cbl-l' }, label), list.map(function (s, k) { return el('div', { class: 'cbl-row', style: 'margin:.2rem 0' }, el('div', { style: 'width:140px' }, inp(L, s, 'role', null, { options: roles.map(function (r) { return [r, r]; }).concat(roles.indexOf(s.role) < 0 && s.role ? [[s.role, s.role]] : []) })), el('div', { style: 'flex:1' }, inp(L, s, 'nom', null, { ph: 'Prénom Nom', max: 40 })), el('button', { type: 'button', class: 'cbl-btn sm', 'aria-label': 'Retirer', onclick: function () { list.splice(k, 1); touche(); draw(); } }, '×')); }),
        el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { list.push({ role: roles[0], nom: '' }); draw(); } }, '+ Ajouter'));
    };
    return section('2 · Les joueurs', true, [
      el('p', { class: 'cbl-note' }, 'Photo : touchez la case pour importer un portrait (le haut de l’image est gardé). Une photo détourée en PNG garde sa transparence. N’utilisez que des photos que vous avez le droit de publier.'),
      pick, el('label', { class: 'cbl-l' }, 'Titulaires (' + S.n + ')'), tit,
      el('label', { class: 'cbl-l' }, 'Remplaçants (' + L.remplacants.length + ' / ' + S.subs + ')'), subs,
      L.remplacants.length < S.subs ? el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { L.remplacants.push({ prenom: '', nom: '', num: '', photo: '', poste: '' }); draw(); } }, '+ Remplaçant') : null,
      staffRows(L.staff, ['Entraîneur', 'Entraîneur adjoint', 'Préparateur physique', 'Entraîneur des gardiens', 'Kiné', 'Dirigeant', 'Délégué'], 'Encadrement'),
      staffRows(L.arbitres, ['Arbitre central', 'Arbitre assistant', 'Arbitre', 'Délégué du match'], 'Arbitres (si connus)')]);
  }
  // ---------- tableau tactique (vue du dessus, joueurs déplaçables à la souris, au doigt ou au clavier) ----------
  function secTactique(L) {
    var S = SPORTS[L.sport], forms = Object.keys(S.forms);
    var chips = el('div', { class: 'cbl-row' }, forms.map(function (f) { return el('button', { type: 'button', class: 'cbl-chip', 'aria-pressed': L.formation === f ? 'true' : 'false', onclick: function () { appliquerFormation(L, f); } }, f); }),
      el('button', { type: 'button', class: 'cbl-chip', 'aria-pressed': forms.indexOf(L.formation) < 0 ? 'true' : 'false', title: 'Déplacez les joueurs librement sur le terrain' }, 'Personnalisée'));
    var box = el('div', { class: 'cbl-board' });
    var G = geom(S.field), VW = 100, VH = 100 * G.l / G.w, NS = 'http://www.w3.org/2000/svg';
    function svgEl(t, a) { var e = document.createElementNS(NS, t); Object.keys(a || {}).forEach(function (k) { e.setAttribute(k, a[k]); }); return e; }
    var svg = svgEl('svg', { viewBox: '-3 -3 ' + (VW + 6) + ' ' + (VH + 6), role: 'group', 'aria-label': 'Tableau tactique : déplacez les joueurs' });
    var P = projDessus({ x: 0, y: 0, w: VW, h: VH }, G), lines = svgEl('g', { fill: 'none', stroke: 'rgba(255,255,255,.6)', 'stroke-width': '.5' });
    G.prims.forEach(function (pr) { lines.appendChild(svgEl('path', { d: pr.p.map(function (q, k) { var s = P(q[0], q[1]); return (k ? 'L' : 'M') + s[0].toFixed(2) + ' ' + s[1].toFixed(2); }).join('') + (pr.close ? 'Z' : ''), 'stroke-dasharray': pr.dash ? '1.5 1.5' : 'none', 'stroke-width': pr.net ? '1.2' : '.5' })); });
    svg.appendChild(lines);
    var tg = svgEl('g'); svg.appendChild(tg); box.appendChild(svg);
    var live = el('div', { class: 'cbl-sr', 'aria-live': 'polite' }); box.appendChild(live);
    function pos(p) { return [p.x / 100 * VW, p.y / 100 * VH]; }
    function paint() {
      tg.innerHTML = '';
      L.titulaires.forEach(function (p, i) {
        var s = pos(p), g = svgEl('g', { class: 'cbl-tok', tabindex: '0', role: 'button', transform: 'translate(' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + ')', 'aria-label': (p.num ? 'Numéro ' + p.num + ' ' : '') + (nomComplet(p) || 'Joueur ' + (i + 1)) + ', ' + (POSTE_NOM[p.poste] || p.poste) + '. Flèches pour déplacer.' });
        g.appendChild(svgEl('circle', { r: '4.2', fill: L.style.c2 || SUN, stroke: '#fff', 'stroke-width': '.5' }));
        var t = svgEl('text', { y: '1.5', 'text-anchor': 'middle', 'font-size': '4', 'font-weight': '800', fill: onDark(L.style.c2) ? '#fff' : '#111', 'font-family': 'Barlow Condensed, sans-serif' }); t.textContent = p.num || p.poste; g.appendChild(t);
        var n = svgEl('text', { y: '8.6', 'text-anchor': 'middle', 'font-size': '3.3', 'font-weight': '700', fill: '#fff', 'font-family': 'Mulish, sans-serif' }); n.textContent = (nomCourt(p) || p.poste).slice(0, 14); g.appendChild(n);
        g.addEventListener('pointerdown', function (e) { drag(e, i, g); });
        g.addEventListener('keydown', function (e) { var d = e.shiftKey ? 5 : 1, k = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key]; if (!k) return; e.preventDefault(); p.x = clamp(p.x + k[0], 2, 98); p.y = clamp(p.y + k[1], 2, 98); L.formation = 'Personnalisée'; touche(); paint(); var ng = tg.childNodes[i]; if (ng) ng.focus(); live.textContent = 'Position ' + Math.round(p.x) + ', ' + Math.round(p.y); });
        tg.appendChild(g);
      });
    }
    function drag(e, i, g) {
      e.preventDefault(); var p = L.titulaires[i], orig = { x: p.x, y: p.y };
      try { g.setPointerCapture(e.pointerId); } catch (er) {}
      var r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      function mv(ev) { var x = (ev.clientX - r.left) / r.width * vb.width + vb.x, y = (ev.clientY - r.top) / r.height * vb.height + vb.y; p.x = clamp(x / VW * 100, 2, 98); p.y = clamp(y / VH * 100, 2, 98); g.setAttribute('transform', 'translate(' + (p.x / 100 * VW).toFixed(2) + ' ' + (p.y / 100 * VH).toFixed(2) + ')'); if (st.schedule) st.schedule(); }
      function up() {
        g.removeEventListener('pointermove', mv); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
        // lâché sur un autre joueur : les deux échangent leur place
        var j = L.titulaires.findIndex(function (q, k) { return k !== i && Math.hypot(q.x - p.x, (q.y - p.y) * G.l / G.w) < 5; });
        if (j >= 0) { p.x = orig.x; p.y = orig.y; echanger(p, L.titulaires[j]); toast('Joueurs échangés'); draw(); }
        else if (Math.abs(p.x - orig.x) + Math.abs(p.y - orig.y) > .5) { L.formation = 'Personnalisée'; st.dirty = true; paint(); }
        if (st.schedule) st.schedule();
      }
      g.addEventListener('pointermove', mv); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
    }
    paint(); st.board = paint;
    return section('3 · La tactique', false, [el('label', { class: 'cbl-l' }, 'Dispositif'), chips, box,
      el('p', { class: 'cbl-note' }, 'Glissez un joueur pour le placer, ou lâchez-le sur un coéquipier pour les échanger. Au clavier : Tab pour choisir un joueur, flèches pour le déplacer (Maj + flèche : plus vite).'),
      el('label', { class: 'cbl-l', style: 'display:flex;gap:.4rem;align-items:center;cursor:pointer' }, el('input', { type: 'checkbox', checked: L.style.gkHaut ? true : null, onchange: function (e) { L.style.gkHaut = e.target.checked; touche(); } }), 'Modèle C : gardien en haut du visuel (attaquants au premier plan)')]);
  }
  function secStyle(L) {
    var s = L.style;
    var pal = el('div', { class: 'cbl-row' }, PALETTES.map(function (p) { return el('button', { type: 'button', class: 'cbl-chip', title: p[0], onclick: function () { s.c1 = p[1]; s.c2 = p[2]; touche(); draw(); }, style: 'background:linear-gradient(135deg,' + p[1] + ' 55%,' + p[2] + ' 55%);width:34px;height:26px;padding:0', 'aria-label': 'Couleurs ' + p[0] }); }));
    var fondImg = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    fondImg.addEventListener('change', function () { var f = fondImg.files && fondImg.files[0]; fondImg.value = ''; if (!f) return; lirePhoto(f, 1080, 1350).then(function (u) { s.fondImg = u; s.fond = 'photo'; touche(); draw(); }, function (e) { toast(msg(e)); }); });
    var logoF = el('input', { type: 'file', accept: 'image/*', style: 'display:none' }), advF = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
    function lireLogo(input, cb) { input.addEventListener('change', function () { var f = input.files && input.files[0]; input.value = ''; if (!f) return; var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, 400 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); cb(c.toDataURL('image/png')); touche(); draw(); }; im.src = r.result; }; r.readAsDataURL(f); }); }
    lireLogo(logoF, function (u) { L.clubLogo = u; }); lireLogo(advF, function (u) { L.advLogo = u; L.advLogoPerso = true; });
    return section('4 · Le style', false, [
      el('label', { class: 'cbl-l' }, 'Modèle'), el('div', {}, Object.keys(MODELES).map(function (k) { return el('label', { style: 'display:flex;gap:.5rem;align-items:flex-start;margin:.3rem 0;cursor:pointer' }, el('input', { type: 'radio', name: 'cbl-mod', checked: s.modele === k ? true : null, onchange: function () { s.modele = k; touche(); if (st.chips) st.chips(); } }), el('span', {}, el('strong', {}, MODELES[k][0]), el('br'), el('span', { class: 'cbl-note' }, MODELES[k][1]))); })),
      inp(L, L, 'titre', 'Titre', { ph: titreDe(Object.assign({}, L, { titre: '' })), max: 40 }),
      el('label', { class: 'cbl-l' }, 'Couleurs'), pal,
      el('div', { class: 'cbl-2' }, el('div', {}, inp(L, s, 'c1', 'Principale', { type: 'color' })), el('div', {}, inp(L, s, 'c2', 'Secondaire', { type: 'color' }))),
      el('div', { class: 'cbl-2' }, el('div', {}, inp(L, s, 'fond', 'Arrière-plan', { options: Object.keys(FONDS).map(function (k) { return [k, FONDS[k]]; }), after: function (v) { if (v === 'photo' && !s.fondImg) fondImg.click(); } })),
        el('div', {}, inp(L, s, 'font', 'Typographie du titre', { options: Object.keys(FONTS).map(function (k) { return [k, FONTS[k][0]]; }) }))),
      el('div', { class: 'cbl-row', style: 'margin-top:.4rem' }, el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { fondImg.click(); } }, s.fondImg ? 'Changer ma photo de fond' : 'Importer une photo de fond'), fondImg, s.fondImg ? el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { s.fondImg = ''; if (s.fond === 'photo') s.fond = 'auto'; touche(); draw(); } }, 'Retirer') : null),
      el('div', { class: 'cbl-2' }, el('div', {}, inp(L, s, 'portrait', 'Forme des portraits', { options: [['rect', 'Rectangle'], ['arrondi', 'Coins arrondis'], ['rond', 'Rond']] })),
        el('div', {}, el('label', { class: 'cbl-l' }, 'Taille des noms'), inp(L, s, 'nom', null, { type: 'range' }))),
      el('label', { class: 'cbl-l' }, 'Logos'),
      el('div', { class: 'cbl-row' }, el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { logoF.click(); } }, 'Logo de mon équipe'), logoF, el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { advF.click(); } }, 'Logo adverse'), advF,
        el('label', { style: 'display:inline-flex;gap:.3rem;align-items:center;cursor:pointer' }, el('input', { type: 'checkbox', checked: s.logo !== false ? true : null, onchange: function (e) { s.logo = e.target.checked; touche(); } }), 'Afficher le logo')),
      el('label', { class: 'cbl-l' }, 'Identité Casa Besports'),
      el('label', { style: 'display:flex;gap:.4rem;align-items:center;cursor:pointer;margin:.2rem 0' }, el('input', { type: 'checkbox', checked: s.signature ? true : null, onchange: function (e) { s.signature = e.target.checked; touche(); } }), 'Signature BE+'),
      el('label', { style: 'display:flex;gap:.4rem;align-items:center;cursor:pointer;margin:.2rem 0' }, el('input', { type: 'checkbox', checked: s.casa ? true : null, onchange: function (e) { s.casa = e.target.checked; touche(); } }), 'Mention « Casa Besports »')
    ]);
  }
  // le curseur « taille des noms » : de 70 % à 140 %
  var _inp = inp; inp = function (L, obj, key, label, o) { var r = _inp(L, obj, key, label, o); if (o && o.type === 'range') { var e = Array.isArray(r) ? r[1] : r; e.min = '0.7'; e.max = '1.4'; e.step = '0.05'; e.value = obj[key] || 1; } return r; };

  // ---------- enregistrer, envoyer, publier, exporter, partager ----------
  function lien(id) { var base = (st.ctx.siteUrl || (location.origin + '/')).replace(/#.*$/, '').replace(/\?.*$/, ''); return base + (base.slice(-1) === '/' ? '' : '/') + '?compo=' + encodeURIComponent(id); }
  function enregistrer(L, nouvelleVariante) {
    var m = st.meta;
    var meta = { id: nouvelleVariante ? null : m.id, titre: m.titre, variante: L.variante || null, variante_de: nouvelleVariante ? (m.id && !/^loc-/.test(m.id) ? m.id : null) : (m.variante_de || null), visibilite: m.visibilite || 'prive', statut: m.statut || 'brouillon', publier_le: m.publier_le || null };
    if (nouvelleVariante) { meta.statut = 'brouillon'; meta.visibilite = m.visibilite === 'public' ? 'prive' : (m.visibilite || 'prive'); }
    return Store.enregistrer(L, meta).then(function (r) { st.meta = Object.assign({}, st.meta, { id: r.id, visibilite: r.visibilite, statut: r.statut, publier_le: r.publier_le, variante_de: meta.variante_de, local: !!r.local }); st.dirty = false; return r; });
  }
  function secPartage(L) {
    var m = st.meta, vis = el('select', { class: 'cbl-in', 'aria-label': 'Confidentialité' }, Object.keys(VIS).map(function (k) { return el('option', { value: k, selected: (m.visibilite || 'prive') === k ? true : null }, VIS[k][0] + ' : ' + VIS[k][1]); }));
    vis.addEventListener('change', function () { m.visibilite = vis.value; if (vis.value !== 'public' && m.statut === 'publie') m.statut = 'brouillon'; st.dirty = true; draw(); });
    var connecte = !!moi(), local = !enLigne();
    var save = el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { save.disabled = true; enregistrer(L).then(function (r) { toast(r.local ? 'Enregistrée sur cet appareil' : 'Composition enregistrée'); draw(); }, function (e) { save.disabled = false; toast(msg(e)); }); } }, m.id ? 'Enregistrer les changements' : 'Enregistrer');
    var variante = el('button', { type: 'button', class: 'cbl-btn', onclick: function () { if (!L.variante) L.variante = 'Variante ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); enregistrer(L, true).then(function () { toast('Nouvelle variante enregistrée'); draw(); }, function (e) { toast(msg(e)); }); } }, 'Enregistrer comme nouvelle variante');
    // publication
    var pubBox = null;
    if (!local && (m.visibilite || 'prive') === 'public') {
      var quand = el('input', { class: 'cbl-in', type: 'datetime-local', 'aria-label': 'Visible à partir de', value: m.publier_le ? new Date(new Date(m.publier_le).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '' });
      pubBox = el('div', { class: 'cbl-warn' }, m.statut === 'publie' ? 'Publiée' + (m.publier_le && new Date(m.publier_le) > new Date() ? ' : visible à partir du ' + new Date(m.publier_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : ' : visible par tous avec le lien.') : 'Brouillon : personne d’autre ne la voit tant qu’elle n’est pas publiée.',
        el('label', { class: 'cbl-l' }, 'Visible à partir de (vide = tout de suite)'), quand,
        el('div', { class: 'cbl-row', style: 'margin-top:.4rem' },
          el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { m.statut = 'publie'; m.publier_le = quand.value ? new Date(quand.value).toISOString() : null; enregistrer(L).then(function () { toast('Composition publiée'); draw(); }, function (e) { toast(msg(e)); }); } }, m.statut === 'publie' ? 'Mettre à jour la publication' : 'Publier'),
          m.statut === 'publie' ? el('button', { type: 'button', class: 'cbl-btn', onclick: function () { m.statut = 'brouillon'; enregistrer(L).then(function () { toast('Publication retirée'); draw(); }, function (e) { toast(msg(e)); }); } }, 'Retirer la publication') : null));
    }
    // envoi
    var envoiBox;
    if (local) envoiBox = el('p', { class: 'cbl-note' }, connecte ? 'L’envoi à un autre utilisateur sera possible dès l’activation du partage en ligne.' : 'Connectez-vous pour envoyer cette composition à un joueur, un club ou à la rédaction.');
    else {
      var type = el('select', { class: 'cbl-in', 'aria-label': 'Destinataire' }, el('option', { value: 'email' }, 'Un utilisateur (son adresse e-mail)'), el('option', { value: 'club' }, 'Un club (son staff)'), el('option', { value: 'redaction' }, 'La rédaction Casa Besports'));
      var mail = el('input', { class: 'cbl-in', type: 'email', placeholder: 'adresse@exemple.fr', 'aria-label': 'Adresse e-mail du destinataire', style: 'margin-top:.3rem' });
      var club = el('select', { class: 'cbl-in', 'aria-label': 'Club destinataire', style: 'display:none;margin-top:.3rem' }, clubsDe().map(function (c) { return el('option', { value: c.id, selected: c.id === L.club ? true : null }, c.name); }));
      type.addEventListener('change', function () { mail.style.display = type.value === 'email' ? '' : 'none'; club.style.display = type.value === 'club' ? '' : 'none'; });
      var com = el('textarea', { class: 'cbl-in', rows: 2, maxlength: 1000, placeholder: 'Un mot pour accompagner (facultatif)', 'aria-label': 'Commentaire', style: 'margin-top:.3rem' });
      var go = el('button', { type: 'button', class: 'cbl-btn pri', style: 'margin-top:.4rem', onclick: function () {
        var dest = type.value === 'email' ? { email: mail.value.trim() } : type.value === 'club' ? { club: club.value } : { redaction: true };
        if (type.value === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(dest.email)) { toast('Adresse e-mail incomplète'); return; }
        go.disabled = true;
        (st.dirty || !m.id ? enregistrer(L) : Promise.resolve()).then(function () { return Store.envoyer(st.meta.id, dest, com.value.trim()); }).then(function (r) {
          go.disabled = false; r = r || {};
          if (r.ok === false) { toast('Aucun compte Casa Besports avec cette adresse. Partagez plutôt le lien ou l’image.'); return; }
          if (r.id) Store.prevenir(r.id);
          toast('Composition envoyée'); com.value = ''; mail.value = '';
        }, function (e) { go.disabled = false; toast(msg(e)); });
      } }, 'Envoyer');
      envoiBox = el('div', {}, type, mail, club, com, go, el('p', { class: 'cbl-note' }, 'Le destinataire la retrouve dans « Reçues » (et reçoit une notification s’il les a activées). Il peut l’accepter, la refuser ou proposer une modification. Il la voit même si elle est privée.'));
    }
    var reponse = null;
    if (m.repondreA) reponse = el('div', { class: 'cbl-warn' }, 'Réponse à ' + (m.repondreNom || 'l’expéditeur'),
      el('textarea', { class: 'cbl-in', rows: 2, id: 'cbl-rep', maxlength: 1000, placeholder: 'Ce que vous avez changé (facultatif)', style: 'margin-top:.3rem' }),
      el('button', { type: 'button', class: 'cbl-btn pri', style: 'margin-top:.4rem', onclick: function (e) { var b = e.target; b.disabled = true; var txt = (document.getElementById('cbl-rep') || {}).value || '';
        enregistrer(L).then(function () { return Store.repondre(m.repondreA, 'modification', txt, st.meta.id); }).then(function () { Store.prevenir(m.repondreA); toast('Proposition envoyée'); m.repondreA = null; draw(); }, function (er) { b.disabled = false; toast(msg(er)); }); } }, 'Envoyer ma proposition'));
    return section('5 · Enregistrer, envoyer, exporter', !!m.repondreA, [reponse,
      inp(L, L, 'variante', 'Nom de cette version', { ph: 'Ex. Variante 4-4-2, Avec Lucas en 10…', max: 60 }),
      local ? null : [el('label', { class: 'cbl-l' }, 'Confidentialité'), vis, (m.visibilite === 'staff' || m.visibilite === 'club') && !L.club ? el('p', { class: 'cbl-note' }, 'Choisissez un club de la liste (rubrique 1) pour que son staff y ait accès.') : null],
      el('div', { class: 'cbl-row', style: 'margin-top:.5rem' }, save, variante), pubBox,
      el('label', { class: 'cbl-l' }, 'Envoyer à…'), envoiBox,
      el('label', { class: 'cbl-l' }, 'Exporter'), boutonsExport(L),
      el('label', { class: 'cbl-l' }, 'Partager'), boutonsPartage(L, function () { return st.meta.id && !st.meta.local ? st.meta.id : null; }),
      el('label', { class: 'cbl-l' }, 'Reprendre un fichier'), importJSON(L)]);
  }
  function qui() { var c = st.ctx; return { connecte: !!moi(), admin: c.role === 'admin', club: !!c.clubRole, pro: !!c.pro }; }
  function boutonsExport(L) {
    var D2 = window.CasaDroits, peut = function (f) { return !D2 || D2.peut(f, qui()); };
    var hd = el('input', { type: 'checkbox', id: 'cbl-hd', checked: st.hd ? true : null, disabled: peut('lineup.exporter_hd') ? null : true, onchange: function (e) { st.hd = e.target.checked; } });
    function b(label, fn) { var x = el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { x.disabled = true; var t = x.textContent; x.textContent = 'Préparation…'; fn().then(function () { x.disabled = false; x.textContent = t; }, function (e) { x.disabled = false; x.textContent = t; toast(msg(e)); }); } }, label); return x; }
    var vid = videoType();
    return el('div', {}, el('div', { class: 'cbl-row' },
      b('PNG', function () { return exporterImage(L, 'image/png', st.hd).then(function (bl) { telecharger(bl, nomFichier(L, 'png')); }); }),
      b('JPG', function () { return exporterImage(L, 'image/jpeg', st.hd).then(function (bl) { telecharger(bl, nomFichier(L, 'jpg')); }); }),
      b('PDF', function () { return exporterPDF(L, st.hd).then(function (bl) { telecharger(bl, nomFichier(L, 'pdf')); }); }),
      b('SVG (plan)', function () { return exporterSVG(L).then(function (bl) { telecharger(bl, nomFichier(L, 'svg')); }); }),
      b('Données (JSON)', function () { return exporterJSON(L).then(function (bl) { telecharger(bl, nomFichier(L, 'json')); }); }),
      vid && peut('lineup.video') ? b('Vidéo animée', function () { toast('Enregistrement de la vidéo (6 secondes)…'); return exporterVideo(L).then(function (r) { telecharger(r.blob, nomFichier(L, r.ext)); if (r.ext !== 'mp4') toast('Vidéo WebM : lisible partout sauf certains iPhone. Sur iPhone, l’export se fait en MP4.'); }); }) : null),
      el('label', { style: 'display:flex;gap:.4rem;align-items:center;cursor:pointer;margin-top:.35rem;font-size:13px' }, hd, 'Double définition (' + taille(L, true).join(' × ') + ' px)'),
      vid ? null : el('p', { class: 'cbl-note' }, 'Vidéo animée : ce navigateur ne sait pas l’enregistrer (essayez Chrome, Edge ou Safari récents).'),
      el('p', { class: 'cbl-note' }, 'SVG : le plan tactique en vectoriel, net à toutes les tailles (le terrain tactique s’exporte aussi en PNG, JPG ou PDF).'));
  }
  function boutonsPartage(L, idFn) {
    function lienOuAvis() { var id = idFn(); if (!id) { toast(moi() ? 'Enregistrez d’abord la composition en ligne' : 'Connectez-vous et enregistrez pour obtenir un lien'); return null; } return lien(id); }
    function partagerImage() {
      return exporterImage(L, 'image/png', false).then(function (bl) {
        var f = new File([bl], nomFichier(L, 'png'), { type: 'image/png' }), id = idFn(), data = { files: [f], title: titreDe(L), text: [titreDe(L), L.clubNom, matchLigne(L)].filter(Boolean).join(' · ') + (id ? '\n' + lien(id) : '') };
        if (navigator.canShare && navigator.canShare({ files: [f] })) return navigator.share(data).catch(function () {});
        telecharger(bl, f.name); toast('Image téléchargée : ajoutez-la à votre message.');
      });
    }
    var b = function (t, fn, title) { return el('button', { type: 'button', class: 'cbl-btn sm', title: title || null, onclick: fn }, t); };
    return el('div', {}, el('div', { class: 'cbl-row' },
      b('Partager…', function () { partagerImage().catch(function (e) { toast(msg(e)); }); }, 'Partage du téléphone (image + lien)'),
      b('Copier le lien', function () { var u = lienOuAvis(); if (!u) return; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('Lien copié'); }, function () { prompt('Lien de la composition :', u); }); }),
      b('WhatsApp', function () { var u = idFn() ? lien(idFn()) : ''; var t = [titreDe(L), L.clubNom, matchLigne(L)].filter(Boolean).join(' · ') + (u ? ' ' + u : ''); if (!u) toast('Sans lien en ligne : seul le texte part. Utilisez « Partager… » pour envoyer l’image.'); window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener'); }),
      b('E-mail', function () { var u = idFn() ? lien(idFn()) : ''; location.href = 'mailto:?subject=' + encodeURIComponent(titreDe(L) + (L.clubNom ? ' · ' + L.clubNom : '')) + '&body=' + encodeURIComponent((matchLigne(L) ? matchLigne(L) + '\n\n' : '') + (u ? 'Voir la composition : ' + u : 'La composition est en pièce jointe.') + '\n\nCasa Line Up · Casa Besports'); }),
      b('QR code', function () { var u = lienOuAvis(); if (u) qr(u); })),
      el('p', { class: 'cbl-note' }, 'Le lien n’ouvre la composition qu’aux personnes autorisées par sa confidentialité (ou à tous si elle est publiée).'));
  }
  function qr(u) {
    if (!window.qrcode) { toast('QR code indisponible'); return; }
    var q = window.qrcode(0, 'M'); q.addData(u); q.make(); var n = q.getModuleCount(), d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 ' + (n + 4) + ' ' + (n + 4) + '" shape-rendering="crispEdges"><rect x="-2" y="-2" width="' + (n + 4) + '" height="' + (n + 4) + '" fill="#fff"/><path d="' + d + '" fill="#10283a"/></svg>';
    var md = el('div', { class: 'cbl-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'QR code' }, el('div', {}, el('div', { html: svg }), el('p', { class: 'cbl-note' }, u),
      el('div', { class: 'cbl-row', style: 'justify-content:center' }, el('button', { type: 'button', class: 'cbl-btn', onclick: function () { telecharger(new Blob([svg], { type: 'image/svg+xml' }), 'qr-composition.svg'); } }, 'Télécharger'), el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { md.remove(); } }, 'Fermer'))));
    md.addEventListener('click', function (e) { if (e.target === md) md.remove(); }); md.addEventListener('keydown', function (e) { if (e.key === 'Escape') md.remove(); });
    st.root.appendChild(md); md.querySelector('.pri').focus();
  }
  function importJSON(L) {
    var f = el('input', { type: 'file', accept: 'application/json,.json', style: 'display:none' });
    f.addEventListener('change', function () { var file = f.files && f.files[0]; f.value = ''; if (!file) return; file.text().then(function (t) { var d = JSON.parse(t); if (!d || !Array.isArray(d.titulaires) || !d.style) throw new Error('Ce fichier n’est pas une composition Casa Line Up'); st.L = valider(d); st.meta = {}; st.dirty = true; draw(); toast('Composition importée'); }).catch(function (e) { toast(msg(e)); }); });
    return el('div', { class: 'cbl-row' }, el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { f.click(); } }, 'Ouvrir un fichier .json'), f,
      el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { if (st.dirty && !confirm('Commencer une nouvelle composition ? Les changements non enregistrés seront perdus.')) return; st.L = nouvelle({ sport: L.sport, club: L.club, clubNom: L.clubNom, clubLogo: L.clubLogo }); st.meta = {}; st.dirty = false; draw(); } }, 'Nouvelle composition'));
  }
  // une composition venue d'ailleurs (fichier, base) est complétée et nettoyée avant usage
  function valider(d) {
    var base = nouvelle({ sport: SPORTS[d.sport] ? d.sport : 'football' }), L = Object.assign(base, d);
    L.style = Object.assign(nouvelle().style, d.style || {}); if (!MODELES[L.style.modele]) L.style.modele = 'C'; if (!FORMATS[L.style.format]) L.style.format = '4:5';
    var S = SPORTS[L.sport];
    L.titulaires = (d.titulaires || []).slice(0, S.n).map(function (p) { return { x: clamp(Number(p.x) || 50, 0, 100), y: clamp(Number(p.y) || 50, 0, 100), poste: String(p.poste || ''), prenom: String(p.prenom || ''), nom: String(p.nom || ''), num: String(p.num || ''), photo: /^(data:image\/|https:\/\/|assets\/)/.test(p.photo || '') ? p.photo : '', credit: String(p.credit || ''), cap: !!p.cap }; });
    while (L.titulaires.length < S.n) { var s = slotsFor(L.sport, L.formation)[L.titulaires.length] || { x: 50, y: 50, poste: '' }; L.titulaires.push({ x: s.x, y: s.y, poste: s.poste, prenom: '', nom: '', num: '', photo: '', credit: '', cap: false }); }
    L.remplacants = (d.remplacants || []).slice(0, S.subs).map(function (p) { return { prenom: String(p.prenom || ''), nom: String(p.nom || ''), num: String(p.num || ''), poste: String(p.poste || ''), photo: /^(data:image\/|https:\/\/|assets\/)/.test(p.photo || '') ? p.photo : '', credit: String(p.credit || '') }; });
    L.staff = Array.isArray(d.staff) ? d.staff : []; L.arbitres = Array.isArray(d.arbitres) ? d.arbitres : [];
    ['clubLogo', 'advLogo'].forEach(function (k) { if (L[k] && !/^(data:image\/|https:\/\/|assets\/)/.test(L[k])) L[k] = ''; });
    if (L.style.fondImg && !/^(data:image\/|https:\/\/)/.test(L.style.fondImg)) L.style.fondImg = '';
    delete L.app; delete L.exporte_le;
    return L;
  }

  // ---------- mes compositions ----------
  function tagVis(r) { var v = VIS[r.visibilite] || VIS.prive; return el('span', { class: 'cbl-tag' + (r.statut === 'publie' ? ' ok' : '') }, r.local ? 'Sur cet appareil' : v[0] + (r.statut === 'publie' ? ' · publiée' : '')); }
  function mesCompos(main) {
    var list = el('div', { class: 'cbl-list' }, el('p', { class: 'cbl-empty' }, 'Chargement…')); main.appendChild(list);
    Store.liste().then(function (rows) {
      if (!st) return; list.innerHTML = '';
      if (!moi()) list.appendChild(el('div', { class: 'cbl-warn', style: 'grid-column:1/-1' }, 'Compositions gardées sur cet appareil. Connectez-vous pour les retrouver partout et les partager.'));
      if (!rows || !rows.length) { list.appendChild(el('p', { class: 'cbl-empty' }, 'Aucune composition enregistrée pour l’instant. ', el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { onglet('creer'); } }, 'Composer'))); return; }
      rows.forEach(function (r) {
        var hist = el('div', {});
        list.appendChild(el('article', { class: 'cbl-card' }, r.apercu ? el('img', { src: r.apercu, alt: '' }) : el('div', { style: 'aspect-ratio:4/5;background:#0b1b28' }),
          el('div', { class: 'cbl-cb' }, el('strong', {}, r.titre), r.variante ? el('span', { class: 'cbl-note', style: 'margin:0' }, r.variante) : null,
            el('div', {}, tagVis(r), r.equipe ? el('span', { class: 'cbl-tag' }, r.equipe) : null),
            el('span', { class: 'cbl-note', style: 'margin:0' }, 'Modifiée le ' + new Date(r.maj_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })),
            el('div', { class: 'cbl-row' },
              el('button', { type: 'button', class: 'cbl-btn sm pri', onclick: function () { ouvrirDansEditeur(r.id); } }, 'Ouvrir'),
              el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { Store.lire(r.id).then(function (x) { if (!x) return; st.L = valider(x.donnees); st.meta = { variante_de: r.local ? null : r.id }; st.L.variante = (x.variante || 'Version') + ' (copie)'; st.dirty = true; onglet('creer'); toast('Copie prête : modifiez puis enregistrez'); }); } }, 'Dupliquer'),
              r.local ? null : el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { hist.innerHTML = 'Chargement…'; Store.envois(r.id).then(function (es) { hist.innerHTML = ''; if (!es.length) hist.textContent = 'Jamais envoyée.'; es.forEach(function (e) { hist.appendChild(el('div', { style: 'border-top:1px solid rgba(233,239,238,.1);padding:.35rem 0;font-size:12.5px' }, el('div', {}, 'À ' + (e.dest_libelle || '?') + ' · ', el('span', { class: 'cbl-tag ' + (e.statut === 'accepte' ? 'ok' : e.statut === 'refuse' ? 'no' : 'wait') }, REP[e.statut] || e.statut)), e.reponse ? el('div', { class: 'cbl-note', style: 'margin:.1rem 0' }, '« ' + e.reponse + ' »' + (e.repondu_nom ? ' (' + e.repondu_nom + ')' : '')) : null, e.proposition ? el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { st.voirId = e.proposition; st.voirEnvoi = null; onglet('voir'); } }, 'Voir la proposition') : null)); }); }, function (er) { hist.textContent = msg(er); }); } }, 'Envois'),
              el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { if (!confirm('Supprimer définitivement « ' + r.titre + ' » ?')) return; Store.supprimer(r.id).then(function () { toast('Supprimée'); if (st.meta.id === r.id) st.meta = {}; draw(); }, function (e) { toast(msg(e)); }); } }, 'Supprimer')),
            hist)));
      });
    }, function (e) { list.innerHTML = ''; list.appendChild(el('p', { class: 'cbl-empty' }, msg(e))); });
  }
  function ouvrirDansEditeur(id) {
    Store.lire(id).then(function (r) { if (!r) { toast('Composition introuvable'); return; } st.L = valider(r.donnees); st.L.variante = r.variante || ''; st.meta = { id: r.id, titre: null, visibilite: r.visibilite, statut: r.statut, publier_le: r.publier_le, variante_de: r.variante_de, local: !!r.local }; st.dirty = false; onglet('creer'); }, function (e) { toast(msg(e)); });
  }
  // ---------- reçues ----------
  function recues(main) {
    var list = el('div', { class: 'cbl-list' }); main.appendChild(list);
    if (!moi()) { list.appendChild(el('div', { class: 'cbl-empty' }, 'Connectez-vous pour recevoir les compositions de votre club, de vos coéquipiers ou de la rédaction.', el('br'), el('br'), st.ctx.connect ? el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { var c = st.ctx.connect; fermerForce(); if (c) c(); } }, 'Se connecter') : null)); return; }
    list.appendChild(el('p', { class: 'cbl-empty' }, 'Chargement…'));
    Store.recues().then(function (rows) {
      if (!st) return; list.innerHTML = '';
      if (D.sqlMissing) { list.appendChild(el('p', { class: 'cbl-empty' }, 'Le partage en ligne n’est pas encore activé sur ce site.')); return; }
      if (!rows.length) { list.appendChild(el('p', { class: 'cbl-empty' }, 'Vous n’avez reçu aucune composition pour l’instant.')); return; }
      rows.forEach(function (r) {
        var rep = el('textarea', { class: 'cbl-in', rows: 2, maxlength: 1000, placeholder: 'Votre réponse (facultatif)', 'aria-label': 'Votre réponse' });
        function repondre(s) { Store.repondre(r.id, s, rep.value.trim()).then(function () { Store.prevenir(r.id); toast(s === 'accepte' ? 'Acceptée' : 'Refusée'); compterRecues(); draw(); }, function (e) { toast(msg(e)); }); }
        list.appendChild(el('article', { class: 'cbl-card' }, r.apercu ? el('img', { src: r.apercu, alt: '' }) : null,
          el('div', { class: 'cbl-cb' }, el('strong', {}, r.titre), r.variante ? el('span', { class: 'cbl-note', style: 'margin:0' }, r.variante) : null,
            el('span', { style: 'font-size:13px' }, 'De ' + (r.expediteur_nom || 'un utilisateur') + (r.dest_libelle && r.dest_libelle.indexOf('@') < 0 ? ' · pour ' + r.dest_libelle : '') + ' · ' + new Date(r.cree_le).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })),
            r.commentaire ? el('p', { class: 'cbl-note', style: 'margin:0;color:#e9efee' }, '« ' + r.commentaire + ' »') : null,
            el('div', {}, el('span', { class: 'cbl-tag ' + (r.statut === 'accepte' ? 'ok' : r.statut === 'refuse' ? 'no' : 'wait') }, REP[r.statut] || r.statut)),
            el('div', { class: 'cbl-row' }, el('button', { type: 'button', class: 'cbl-btn sm pri', onclick: function () { st.voirId = r.lineup_id; st.voirEnvoi = r; onglet('voir'); } }, 'Voir et exporter')),
            r.statut === 'envoye' ? [rep, el('div', { class: 'cbl-row' },
              el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { repondre('accepte'); } }, 'Accepter'),
              el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { repondre('refuse'); } }, 'Refuser'),
              el('button', { type: 'button', class: 'cbl-btn sm', onclick: function () { proposer(r); } }, 'Proposer une modification'))] : null)));
      });
    }, function (e) { list.innerHTML = ''; list.appendChild(el('p', { class: 'cbl-empty' }, msg(e))); });
  }
  function proposer(r) {
    Store.lire(r.lineup_id).then(function (x) {
      if (!x) { toast('Composition introuvable'); return; }
      st.L = valider(x.donnees); st.L.variante = 'Proposition de modification';
      st.meta = { variante_de: null, visibilite: 'prive', repondreA: r.id, repondreNom: r.expediteur_nom }; st.dirty = true; onglet('creer');
    }, function (e) { toast(msg(e)); });
  }
  // ---------- voir (lien partagé, composition reçue) ----------
  function voir(main) {
    var box = el('div', { class: 'cbl-list', style: 'display:block' }, el('p', { class: 'cbl-empty' }, 'Chargement…')); main.appendChild(box);
    Store.lire(st.voirId).then(function (r) {
      if (!st) return; box.remove();
      if (!r) {
        main.appendChild(el('div', { class: 'cbl-list', style: 'display:block' }, el('div', { class: 'cbl-empty' },
          el('p', {}, 'Cette composition n’est pas accessible : elle n’existe plus, elle n’est pas encore publiée, ou elle est réservée à certaines personnes.'),
          !moi() && st.ctx.connect ? el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { var c = st.ctx.connect; fermerForce(); if (c) c(); } }, 'Se connecter') : null)));
        return;
      }
      var L = valider(r.donnees), ed = el('div', { class: 'cbl-ed' });
      main.appendChild(ed); main.appendChild(apercuBloc(L, true));
      var mine = moi() && r.owner === moi().id;
      ed.appendChild(el('h2', { style: 'font:700 22px/1.2 "Barlow Condensed",sans-serif;margin:.4rem 0' }, r.titre));
      if (r.variante) ed.appendChild(el('p', { class: 'cbl-note' }, r.variante));
      if (matchLigne(L)) ed.appendChild(el('p', {}, matchLigne(L)));
      if (st.voirEnvoi && st.voirEnvoi.commentaire) ed.appendChild(el('div', { class: 'cbl-warn' }, (st.voirEnvoi.expediteur_nom || 'L’expéditeur') + ' : « ' + st.voirEnvoi.commentaire + ' »'));
      ed.appendChild(el('p', { class: 'cbl-note' }, 'Changez le format au-dessus de l’aperçu avant d’exporter : la composition d’origine n’est pas modifiée.'));
      ed.appendChild(el('label', { class: 'cbl-l' }, 'Exporter')); ed.appendChild(boutonsExport(L));
      ed.appendChild(el('label', { class: 'cbl-l' }, 'Partager')); ed.appendChild(boutonsPartage(L, function () { return r.id; }));
      ed.appendChild(el('div', { class: 'cbl-row', style: 'margin-top:.8rem' },
        mine ? el('button', { type: 'button', class: 'cbl-btn pri', onclick: function () { ouvrirDansEditeur(r.id); } }, 'Modifier') : null,
        el('button', { type: 'button', class: 'cbl-btn', onclick: function () { st.L = clone(L); st.L.variante = 'Copie de « ' + r.titre + ' »'; st.meta = {}; st.dirty = true; onglet('creer'); } }, 'Reprendre dans mes compositions')));
    }, function (e) { box.innerHTML = ''; box.appendChild(el('p', { class: 'cbl-empty' }, msg(e))); });
  }

  // ---------------------------------------------------------------- API publique
  window.CasaLineup = {
    open: open,
    // utilisés par les tests et par d'autres modules
    _render: render, _nouvelle: nouvelle, _valider: valider, _geom: geom, _SPORTS: SPORTS,
    _charger: function (d) { if (!st) return; st.L = valider(d); st.meta = {}; st.dirty = true; st.tab = 'creer'; draw(); },
    _etat: function () { return st ? st.L : null; },
    _image: function (d, hd) { var L = valider(d); return polices(L).then(function () { return imagesPretes(L); }).then(function () { return toCanvas(L, hd).toDataURL('image/png'); }); },
    exporterPDF: exporterPDF, exporterSVG: exporterSVG
  };
})();
