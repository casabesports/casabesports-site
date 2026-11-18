/*!
 * Casa Besports — Causeries : le tableau tactique (toutes les disciplines du Vestiaire).
 *  - Terrains dessinés à l'échelle (en mètres) : football, handball, basket, volley, rugby, roller hockey, water-polo
 *  - Outils : nos joueurs, adversaires, ballon, plots, course, passe, conduite, tir, pressing, zone, texte, gomme, annuler
 *  - Plusieurs étapes par schéma, animées (les joueurs glissent d'une étape à l'autre)
 *  - Fiches « tireurs et marquages » propres à chaque discipline
 * Utilisé par js/causeries.js (chargé à la demande). Aucune bibliothèque externe.
 */
var CasaTableau = (function () {
  'use strict';
  var K = 10; // 1 mètre = 10 unités SVG
  var NAVY = '#10283a', SUN = '#f2b33d', ADV = '#c0281e', PRESS = '#ff8a7a';

  // ---------------------------------------------------------------- terrains
  function L(x1, y1, x2, y2, o) { return '<line x1="' + x1 * K + '" y1="' + y1 * K + '" x2="' + x2 * K + '" y2="' + y2 * K + '"' + st(o) + '/>'; }
  function Rc(x, y, w, h, o) { return '<rect x="' + x * K + '" y="' + y * K + '" width="' + w * K + '" height="' + h * K + '"' + st(o) + '/>'; }
  function Ci(x, y, r, o) { return '<circle cx="' + x * K + '" cy="' + y * K + '" r="' + r * K + '"' + st(o) + '/>'; }
  function Pa(d, o) { return '<path d="' + d + '"' + st(o) + '/>'; }
  function st(o) { o = o || {}; return ' fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || '#fff') + '" stroke-width="' + (o.w || 1.6) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + (o.op ? ' opacity="' + o.op + '"' : ''); }
  function arc(cx, cy, r, a1, a2) { // angles en degrés, sens horaire
    var p1 = [cx + r * Math.cos(a1 * Math.PI / 180), cy + r * Math.sin(a1 * Math.PI / 180)], p2 = [cx + r * Math.cos(a2 * Math.PI / 180), cy + r * Math.sin(a2 * Math.PI / 180)];
    var large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return 'M' + p1[0] * K + ' ' + p1[1] * K + ' A' + r * K + ' ' + r * K + ' 0 ' + large + ' 1 ' + p2[0] * K + ' ' + p2[1] * K;
  }
  function bandes(x0, y0, w, h, n, c1, c2) { var s = ''; for (var i = 0; i < n; i++) s += Rc(x0 + i * w / n, y0, w / n, h, { fill: i % 2 ? c2 : c1, stroke: 'none', w: 0 }); return s; }

  var SPORTS = {
    football: { nom: 'Football', L: 105, W: 68, m: 3, R: 1.55, fond: '#2a6247',
      vues: { entier: ['Terrain entier', 0, 0, 105, 68], demi: ['Demi-terrain', 52.5, 0, 52.5, 68], surface: ['Surface', 80, 8, 25, 52] },
      dessin: function () {
        var s = bandes(0, 0, 105, 68, 14, '#2f6b4f', '#2a6247'), w = { w: 2 };
        s += Rc(0, 0, 105, 68, w) + L(52.5, 0, 52.5, 68, w) + Ci(52.5, 34, 9.15, w) + Ci(52.5, 34, .3, { fill: '#fff', w: 0 });
        [0, 1].forEach(function (c) { var x = c ? 105 : 0, d = c ? -1 : 1;
          s += Rc(c ? 105 - 16.5 : 0, 13.84, 16.5, 40.32, w) + Rc(c ? 105 - 5.5 : 0, 24.84, 5.5, 18.32, w) + Ci(x + d * 11, 34, .3, { fill: '#fff', w: 0 });
          var a = Math.acos(5.5 / 9.15) * 180 / Math.PI; s += Pa(c ? arc(94, 34, 9.15, 180 - a, 180 + a) : arc(11, 34, 9.15, -a, a), w);
          s += Rc(c ? 105 : -2, 30.34, 2, 7.32, { w: 2 });
          s += Pa(c ? arc(105, 0, 1, 90, 180) : arc(0, 0, 1, 0, 90), w) + Pa(c ? arc(105, 68, 1, 180, 270) : arc(0, 68, 1, 270, 360), w); });
        return s; },
      situations: ['Compo', 'Attaque placée', 'Contre-attaque', 'Défense', 'Pressing', 'Transition', 'Corner offensif', 'Corner défensif', 'Coup franc offensif', 'Coup franc défensif', 'Penalty', 'Touche', 'Combinaison'],
      cpa: ['Corner offensif', 'Corner défensif', 'Coup franc offensif', 'Coup franc défensif', 'Penalty', 'Touche'],
      systemes: { '4-3-3': [[5, 34, 'G'], [20, 10], [17, 26], [17, 42], [20, 58], [35, 34], [42, 20], [42, 48], [62, 12], [68, 34], [62, 56]],
        '4-4-2': [[5, 34, 'G'], [20, 10], [17, 26], [17, 42], [20, 58], [40, 12], [37, 28], [37, 40], [40, 56], [62, 27], [62, 41]],
        '4-2-3-1': [[5, 34, 'G'], [20, 10], [17, 26], [17, 42], [20, 58], [33, 27], [33, 41], [50, 34], [52, 13], [52, 55], [66, 34]],
        '3-5-2': [[5, 34, 'G'], [18, 20], [16, 34], [18, 48], [38, 7], [34, 26], [32, 34], [34, 42], [38, 61], [62, 27], [62, 41]] } },
    handball: { nom: 'Handball', L: 40, W: 20, m: 1.5, R: .7, fond: '#1f5f8b',
      vues: { entier: ['Terrain entier', 0, 0, 40, 20], demi: ['Demi-terrain', 20, 0, 20, 20] },
      dessin: function () {
        var s = Rc(0, 0, 40, 20, { fill: '#2b77a8', w: 2 }) + L(20, 0, 20, 20, { w: 2 });
        [0, 1].forEach(function (c) { var x = c ? 40 : 0, d = c ? -1 : 1, a = c ? 180 : 0;
          var zone = 'M' + x * K + ' ' + 2.5 * K + ' ' + arc(x, 8.5, 6, a + (c ? 90 : -90), a).replace(/^M[^A]+/, '') + ' L' + (x + d * 6) * K + ' ' + 11.5 * K + ' ' + arc(x, 11.5, 6, a, a + (c ? -90 : 90)).replace(/^M[^A]+/, '');
          s += Pa(zone + ' Z', { fill: '#e6b85c', op: '.9', w: 2 });
          s += Pa(arc(x, 8.5, 9, c ? 180 + 50 : -50, a) + ' L' + (x + d * 9) * K + ' ' + 11.5 * K + ' ' + arc(x, 11.5, 9, a, c ? 180 - 50 : 50).replace(/^M[^A]+/, ''), { w: 2, dash: '6 6' });
          s += L(x + d * 7, 9.5, x + d * 7, 10.5, { w: 2 }) + L(x + d * 4, 9.85, x + d * 4, 10.15, { w: 2 }) + Rc(c ? 40 : -1, 8.5, 1, 3, { w: 2 }); });
        return s.replace(/fill="#e6b85c" stroke="#fff" stroke-width="2" opacity=".9"/g, 'fill="#e6b85c" fill-opacity=".55" stroke="#fff" stroke-width="2"'); },
      situations: ['Compo', 'Attaque placée', 'Montée de balle', 'Engagement rapide', 'Défense', 'Jet franc à 9 m', 'Jet de 7 m', 'Supériorité numérique', 'Infériorité numérique', 'Combinaison'],
      cpa: ['Jet franc à 9 m', 'Jet de 7 m', 'Engagement rapide'],
      systemes: { '3-3 (attaque)': [[1, 10, 'G'], [26, 2.5], [27, 10], [26, 17.5], [33, 4], [32, 10], [33, 16]],
        '6-0 (défense)': [[39, 10, 'G'], [33.7, 2.5], [33.2, 6], [33, 10], [33.2, 14], [33.7, 17.5], [34.5, 10]] } },
    basket: { nom: 'Basket', L: 28, W: 15, m: 1.5, R: .55, fond: '#b8814a',
      vues: { entier: ['Terrain entier', 0, 0, 28, 15], demi: ['Demi-terrain', 14, 0, 14, 15] },
      dessin: function () {
        var s = Rc(0, 0, 28, 15, { fill: '#c99358', w: 2 }) + L(14, 0, 14, 15, { w: 2 }) + Ci(14, 7.5, 1.8, { w: 2 });
        [0, 1].forEach(function (c) { var x = c ? 28 : 0, d = c ? -1 : 1, hx = x + d * 1.575;
          s += Rc(c ? 28 - 5.8 : 0, 5.05, 5.8, 4.9, { fill: 'rgba(16,40,58,.3)', w: 2 }) + Ci(x + d * 5.8, 7.5, 1.8, { w: 2 });
          var t = Math.asin(6.6 / 6.75) * 180 / Math.PI, xe = hx + d * 6.75 * Math.cos(t * Math.PI / 180);
          s += L(x, .9, xe, .9, { w: 2 }) + L(x, 14.1, xe, 14.1, { w: 2 }) + Pa(c ? arc(hx, 7.5, 6.75, 180 + t, 180 - t + 360).replace(/0 1 1/, '0 0 0') : arc(hx, 7.5, 6.75, -t, t), { w: 2 });
          s += L(x + d * 1.2, 6.6, x + d * 1.2, 8.4, { w: 3 }) + Ci(hx, 7.5, .23, { stroke: SUN, w: 2.5 }); });
        return s; },
      situations: ['Compo', 'Système d’attaque', 'Pick and roll', 'Remise en jeu côté', 'Remise en jeu fond', 'Défense homme à homme', 'Défense de zone', 'Press', 'Contre-attaque', 'Dernière possession'],
      cpa: ['Remise en jeu côté', 'Remise en jeu fond', 'Dernière possession'],
      systemes: { '1-2-2': [[19, 7.5, 'M'], [22, 2.5], [22, 12.5], [26, 1.5], [26, 13.5]], '1-4 haut': [[18.5, 7.5, 'M'], [22.2, 3], [22.2, 12], [22, 5.6], [22, 9.4]] } },
    volley: { nom: 'Volley', L: 18, W: 9, m: 2.5, R: .5, fond: '#3e7c5b',
      vues: { entier: ['Terrain entier', 0, 0, 18, 9], demi: ['Notre côté', 9, -1, 9, 11] },
      dessin: function () { return Rc(0, 0, 18, 9, { fill: '#e08a3c', w: 2 }) + L(6, 0, 6, 9, { w: 2 }) + L(12, 0, 12, 9, { w: 2 }) + L(9, -.6, 9, 9.6, { w: 5 }); },
      situations: ['Compo', 'Rotation', 'Réception', 'Service', 'Combinaison d’attaque', 'Bloc', 'Défense', 'Transition'],
      cpa: ['Service', 'Réception'],
      systemes: { 'Rotation 1': [[16.5, 7.5, '1'], [10.5, 7.5, '2'], [10.5, 4.5, '3'], [10.5, 1.5, '4'], [16.5, 1.5, '5'], [16.5, 4.5, '6']] } },
    rugby: { nom: 'Rugby', L: 120, W: 70, m: 3, R: 1.6, fond: '#2a6247',
      vues: { entier: ['Terrain entier', 0, 0, 120, 70], demi: ['Demi-terrain', 60, 0, 60, 70], v22: ['Les 22 m', 78, 0, 42, 70] },
      dessin: function () {
        var s = bandes(0, 0, 120, 70, 12, '#2f6b4f', '#2a6247'), w = { w: 2 }, d = { w: 2, dash: '8 7' };
        s += Rc(0, 0, 120, 70, w) + L(10, 0, 10, 70, w) + L(110, 0, 110, 70, w) + L(32, 0, 32, 70, w) + L(88, 0, 88, 70, w) + L(60, 0, 60, 70, w) + L(50, 0, 50, 70, d) + L(70, 0, 70, 70, d) + L(15, 0, 15, 70, d) + L(105, 0, 105, 70, d);
        [5, 15, 55, 65].forEach(function (y) { s += L(10, y, 110, y, { w: 1.6, dash: '3 40' }); });
        [10, 110].forEach(function (x) { s += L(x, 32.2, x, 37.8, { stroke: SUN, w: 5 }) + Ci(x, 32.2, .5, { fill: SUN, stroke: 'none', w: 0 }) + Ci(x, 37.8, .5, { fill: SUN, stroke: 'none', w: 0 }); });
        return s; },
      situations: ['Compo', 'Touche', 'Mêlée', 'Lancement de jeu', 'Attaque', 'Défense', 'Renvoi', 'Jeu au pied', 'Pénalité'],
      cpa: ['Touche', 'Mêlée', 'Renvoi', 'Pénalité'],
      systemes: { 'XV': [[62, 31, '1'], [62, 35, '2'], [62, 39, '3'], [60, 33, '4'], [60, 37, '5'], [60, 30, '6'], [60, 40, '7'], [58, 35, '8'], [55, 38, '9'], [50, 43, '10'], [45, 66, '11'], [45, 48, '12'], [41, 54, '13'], [44, 9, '14'], [30, 35, '15']] } },
    roller: { nom: 'Roller hockey', L: 40, W: 20, m: 1.5, R: .7, fond: '#5d6d7a',
      vues: { entier: ['Piste entière', 0, 0, 40, 20], demi: ['Demi-piste', 20, 0, 20, 20] },
      dessin: function () {
        var s = '<rect x="0" y="0" width="' + 40 * K + '" height="' + 20 * K + '" rx="' + 4 * K + '" fill="#8fb3c9" stroke="#fff" stroke-width="2"/>';
        s += L(20, 0, 20, 20, { stroke: ADV, w: 3 }) + Ci(20, 10, 3, { w: 2 }) + L(3.5, .6, 3.5, 19.4, { stroke: ADV, w: 2 }) + L(36.5, .6, 36.5, 19.4, { stroke: ADV, w: 2 });
        s += Pa(arc(3.5, 10, 1.8, -90, 90) + ' Z', { fill: 'rgba(61,124,201,.55)', w: 2 }) + Pa(arc(36.5, 10, 1.8, 90, 270) + ' Z', { fill: 'rgba(61,124,201,.55)', w: 2 });
        [[10, 5], [10, 15], [30, 5], [30, 15]].forEach(function (p) { s += Ci(p[0], p[1], .3, { fill: ADV, stroke: 'none', w: 0 }); });
        return s + Rc(2.6, 9.1, .9, 1.8, { w: 2 }) + Rc(36.5, 9.1, .9, 1.8, { w: 2 }); },
      situations: ['Compo', 'Attaque placée', 'Power play', 'Penalty kill', 'Mise au jeu', 'Repli défensif', 'Contre-attaque', 'Penalty'],
      cpa: ['Power play', 'Penalty kill', 'Mise au jeu', 'Penalty'],
      systemes: { 'Carré': [[4.5, 10, 'G'], [14, 6], [14, 14], [26, 6], [26, 14]], 'Losange': [[4.5, 10, 'G'], [12, 10], [20, 5], [20, 15], [28, 10]] } },
    waterpolo: { nom: 'Water-polo', L: 30, W: 20, m: 1.5, R: .7, fond: '#0f5f86',
      vues: { entier: ['Bassin entier', 0, 0, 30, 20], demi: ['Demi-bassin', 15, 0, 15, 20] },
      dessin: function () {
        var s = Rc(0, 0, 30, 20, { fill: '#1d86b8', w: 2 });
        s += L(2, 0, 2, 20, { stroke: ADV, w: 3 }) + L(28, 0, 28, 20, { stroke: ADV, w: 3 }) + L(5, 0, 5, 20, { stroke: SUN, w: 3 }) + L(25, 0, 25, 20, { stroke: SUN, w: 3 }) + L(15, 0, 15, 20, { w: 2 });
        return s + Rc(-.8, 8.5, .8, 3, { fill: '#fff', w: 1 }) + Rc(30, 8.5, .8, 3, { fill: '#fff', w: 1 }); },
      situations: ['Compo', 'Attaque placée', 'Attaque à 6 contre 5', 'Défense en zone', 'Pressing', 'Sprint d’engagement', 'Contre-attaque', 'Penalty à 5 m'],
      cpa: ['Attaque à 6 contre 5', 'Sprint d’engagement', 'Penalty à 5 m'],
      systemes: { '3-3': [[1, 10, 'G'], [22, 3], [21, 10], [22, 17], [26, 4], [27, 10], [26, 16]], '4-2': [[1, 10, 'G'], [26, 3], [26, 8], [26, 12], [26, 17], [21, 7], [21, 13]] } }
  };
  function sportDe(s) {
    s = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/hand/.test(s)) return 'handball'; if (/basket/.test(s)) return 'basket'; if (/volley/.test(s)) return 'volley';
    if (/rugby/.test(s)) return 'rugby'; if (/roller|rink|hockey/.test(s)) return 'roller'; if (/water|polo/.test(s)) return 'waterpolo';
    if (/foot|soccer|futsal/.test(s) || !s) return 'football';
    return null; // discipline individuelle : pas de tableau
  }

  // ---------------------------------------------------------------- tireurs et marquages, par discipline
  function rangs(p, n, lab) { var r = []; for (var i = 1; i <= n; i++) r.push([p + i, (lab || '') + i + (i === 1 ? 'er' : 'e')]); return r; }
  var TIREURS = {
    football: [
      { k: 'pen', camp: 'off', titre: 'Penalty', aide: 'Ordre des tireurs pendant le match', lignes: rangs('p', 3, 'Tireur ').map(function (r) { return [r[0], r[1].replace('Tireur ', '') + ' tireur']; }) },
      { k: 'tab', camp: 'off', titre: 'Séance de tirs au but', aide: '5 tireurs + 3 réservistes', lignes: rangs('t', 5).map(function (r) { return [r[0], r[1] + ' tireur']; }).concat([['r1', 'Réserviste 1'], ['r2', 'Réserviste 2'], ['r3', 'Réserviste 3']]) },
      { k: 'corners', camp: 'off', titre: 'Corners', aide: 'Un tireur par côté, une combinaison par signe', lignes: [['g', 'Côté gauche'], ['d', 'Côté droit'], ['s1', 'Signe 1'], ['s2', 'Signe 2'], ['der', 'Restent derrière']] },
      { k: 'cf', camp: 'off', titre: 'Coups francs et touches', aide: 'Selon la position du ballon', lignes: [['dir', 'Direct, axe'], ['dir2', '2e tireur'], ['ind', 'Indirect'], ['cote', 'Côté'], ['touche', 'Touche longue']] },
      { k: 'cornersd', camp: 'def', titre: 'Corners contre nous', aide: 'Qui marque qui', choix: ['Zone', 'Mixte', 'Individuelle'], lignes: [['m1', 'Marquage 1'], ['m2', 'Marquage 2'], ['m3', 'Marquage 3'], ['p1', '1er poteau'], ['six', 'Zone des 6 m'], ['ca', 'En pointe (contre-attaque)']] },
      { k: 'cfd', camp: 'def', titre: 'Coups francs contre nous', aide: 'Le mur et le reste', lignes: [['mur', 'Le mur'], ['couche', 'Couché derrière le mur'], ['ligne', 'La ligne']] },
      { k: 'pend', camp: 'def', titre: 'Penalty contre nous', aide: 'Suivi du rebond', lignes: [['reb', 'Suivi du rebond']] }],
    handball: [
      { k: 'sept', camp: 'off', titre: 'Jets de 7 m', aide: 'Ordre des tireurs', lignes: rangs('p', 3).map(function (r) { return [r[0], r[1] + ' tireur']; }) },
      { k: 'jf', camp: 'off', titre: 'Jets francs à 9 m', aide: 'Combinaisons annoncées', lignes: [['s1', 'Annonce 1'], ['s2', 'Annonce 2'], ['tir', 'Tireur']] },
      { k: 'eng', camp: 'off', titre: 'Engagement rapide', aide: 'Après un but encaissé', lignes: [['lanceur', 'Engage'], ['relais', 'Relais']] },
      { k: 'def', camp: 'def', titre: 'Défense', aide: 'Système et postes clés', choix: ['6-0', '5-1', '3-2-1', '4-2'], lignes: [['avance', 'Avancé'], ['base', 'Base centrale'], ['rep', 'Repli rapide']] },
      { k: 'inf', camp: 'def', titre: 'Infériorité numérique', aide: 'À 5 contre 6', lignes: [['sys', 'Organisation'], ['sort', 'Qui sort']] }],
    basket: [
      { k: 'lf', camp: 'off', titre: 'Lancers francs', aide: 'Fin de match : qui doit recevoir la balle', lignes: rangs('p', 3).map(function (r) { return [r[0], r[1] + ' tireur']; }) },
      { k: 'remc', camp: 'off', titre: 'Remise en jeu côté', aide: 'Passeur et système', lignes: [['pass', 'Passeur'], ['sys', 'Système']] },
      { k: 'remf', camp: 'off', titre: 'Remise en jeu fond', aide: 'Passeur et système', lignes: [['pass', 'Passeur'], ['sys', 'Système']] },
      { k: 'der', camp: 'off', titre: 'Dernière possession', aide: 'Le tir de la fin', lignes: [['tir', 'Tireur'], ['opt', 'Option 2']] },
      { k: 'def', camp: 'def', titre: 'Défense', aide: 'Système et duels', choix: ['Homme à homme', 'Zone 2-3', 'Zone 3-2', 'Press'], lignes: [['m1', 'Sur leur meneur'], ['m2', 'Sur leur meilleur tireur'], ['m3', 'Sur leur pivot']] }],
    volley: [
      { k: 'serv', camp: 'off', titre: 'Ordre des serveurs', aide: 'Et type de service', lignes: rangs('s', 6).map(function (r) { return [r[0], r[1] + ' serveur']; }) },
      { k: 'rec', camp: 'def', titre: 'Réception', aide: 'Nombre de réceptionneurs', choix: ['2 réceptionneurs', '3 réceptionneurs', '4 réceptionneurs'], lignes: [['r1', 'Réceptionneur 1'], ['r2', 'Réceptionneur 2'], ['r3', 'Réceptionneur 3'], ['lib', 'Libéro']] },
      { k: 'att', camp: 'off', titre: 'Combinaisons d’attaque', aide: 'Annonces du passeur', lignes: [['pass', 'Passeur'], ['c1', 'Combinaison 1'], ['c2', 'Combinaison 2'], ['c3', 'Combinaison 3']] },
      { k: 'bloc', camp: 'def', titre: 'Bloc', aide: 'Sur leurs attaquants', lignes: [['b1', 'Sur leur attaquant n° 1'], ['b2', 'Sur leur central']] }],
    rugby: [
      { k: 'but', camp: 'off', titre: 'Buteurs', aide: 'Pénalités et transformations', lignes: [['b1', 'Buteur'], ['b2', 'Buteur remplaçant']] },
      { k: 'touche', camp: 'off', titre: 'Touche', aide: 'Lanceur et annonces', lignes: [['lanceur', 'Lanceur'], ['a1', 'Annonce 1'], ['a2', 'Annonce 2'], ['a3', 'Annonce 3']] },
      { k: 'melee', camp: 'off', titre: 'Mêlée', aide: 'Sortie et options', lignes: [['opt1', 'Option 1'], ['opt2', 'Option 2']] },
      { k: 'renvoi', camp: 'off', titre: 'Renvois et jeu au pied', aide: 'Qui tape, où', lignes: [['botteur', 'Botteur'], ['cible', 'Zone visée']] },
      { k: 'def', camp: 'def', titre: 'Défense', aide: 'Système', choix: ['Rideau', 'Montée inversée', 'Blitz'], lignes: [['lead', 'Leader de la ligne'], ['arr', 'Arrière, couverture']] }],
    roller: [
      { k: 'pen', camp: 'off', titre: 'Penalty', aide: 'Ordre des tireurs', lignes: rangs('p', 3).map(function (r) { return [r[0], r[1] + ' tireur']; }) },
      { k: 'tab', camp: 'off', titre: 'Tirs au but', aide: '5 tireurs', lignes: rangs('t', 5).map(function (r) { return [r[0], r[1] + ' tireur']; }) },
      { k: 'pp', camp: 'off', titre: 'Power play', aide: 'L’unité en supériorité', lignes: [['u1', 'Joueur 1'], ['u2', 'Joueur 2'], ['u3', 'Joueur 3'], ['u4', 'Joueur 4']] },
      { k: 'pk', camp: 'def', titre: 'Penalty kill', aide: 'L’unité en infériorité', lignes: [['u1', 'Joueur 1'], ['u2', 'Joueur 2'], ['u3', 'Joueur 3']] },
      { k: 'faceoff', camp: 'off', titre: 'Mises au jeu', aide: 'Qui prend la mise au jeu', lignes: [['att', 'Zone offensive'], ['def', 'Zone défensive']] }],
    waterpolo: [
      { k: 'pen', camp: 'off', titre: 'Penalty à 5 m', aide: 'Ordre des tireurs', lignes: rangs('p', 3).map(function (r) { return [r[0], r[1] + ' tireur']; }) },
      { k: 'six', camp: 'off', titre: 'Attaque à 6 contre 5', aide: 'Les postes', lignes: [['p1', 'Poste 1'], ['p2', 'Poste 2'], ['p3', 'Poste 3'], ['p4', 'Poste 4'], ['p5', 'Poste 5'], ['p6', 'Poste 6']] },
      { k: 'sprint', camp: 'off', titre: 'Sprint d’engagement', aide: 'Qui part au sprint', lignes: [['sp', 'Sprinteur']] },
      { k: 'def', camp: 'def', titre: 'Défense', aide: 'Système', choix: ['Zone', 'Pressing'], lignes: [['pivot', 'Sur leur pivot'], ['ca', 'Contre-attaque']] }]
  };

  // ---------------------------------------------------------------- objets
  function uid() { return Math.random().toString(36).slice(2, 9); }
  function nouveau(sport, situation) {
    var S = SPORTS[sport] || SPORTS.football;
    return { id: uid(), sport: sport, situation: situation || S.situations[1], titre: '', consigne: '', vue: Object.keys(S.vues)[situation && S.cpa.indexOf(situation) >= 0 && S.vues.demi ? 1 : 0], etapes: [{ objets: [] }] };
  }
  function avecSysteme(schema, nom) {
    var S = SPORTS[schema.sport]; var pos = S.systemes[nom]; if (!pos) return schema;
    var et = schema.etapes[0]; var anciens = et.objets.filter(function (o) { return o.t === 'j' && o.camp === 'nous'; });
    et.objets = et.objets.filter(function (o) { return !(o.t === 'j' && o.camp === 'nous'); });
    pos.forEach(function (p, i) { var a = anciens[i] || {}; et.objets.push({ id: a.id || uid(), t: 'j', camp: 'nous', x: p[0], y: p[1], n: a.n || (p[2] && p[2] !== 'G' && p[2] !== 'M' ? p[2] : String(i + 1)), g: p[2] === 'G', nom: a.nom || '', cap: !!a.cap }); });
    schema.systeme = nom; return schema;
  }

  // ---------------------------------------------------------------- rendu SVG
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function cadre(schema) { var S = SPORTS[schema.sport] || SPORTS.football, v = S.vues[schema.vue] || S.vues.entier; return [v[1] - S.m, v[2] - S.m, v[3] + 2 * S.m, v[4] + 2 * S.m]; }
  function fleche(o, R, sel) {
    var p = o.p, x1 = p[0][0] * K, y1 = p[0][1] * K, x2 = p[1][0] * K, y2 = p[1][1] * K, d;
    var w = R * K * ({ tir: .5, pressing: .3 }[o.kind] || .2), col = { passe: SUN, tir: SUN, pressing: PRESS }[o.kind] || '#fff', mk = { passe: 'y', tir: 'y', pressing: 'r' }[o.kind] || 'w';
    if (o.kind === 'conduite') {
      var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len, ny = dx / len, n = Math.max(4, Math.round(len / (R * K * 1.1))), amp = R * K * .35; d = 'M' + x1 + ' ' + y1;
      for (var i = 1; i <= n; i++) { var t = i / n, a = i < n ? (i % 2 ? amp : -amp) : 0; d += ' L' + (x1 + dx * t + nx * a).toFixed(1) + ' ' + (y1 + dy * t + ny * a).toFixed(1); }
    } else d = 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2;
    return '<g data-id="' + o.id + '"><path d="' + d + '" fill="none" stroke="transparent" stroke-width="' + Math.max(w * 4, 14) + '"/><path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"' + (o.kind === 'passe' ? ' stroke-dasharray="' + w * 3 + ' ' + w * 2.4 + '"' : '') + ' marker-end="url(#cz-m' + mk + ')"/>' + (sel ? '<circle cx="' + x1 + '" cy="' + y1 + '" r="' + R * K * .45 + '" fill="' + SUN + '" data-bout="0"/><circle cx="' + x2 + '" cy="' + y2 + '" r="' + R * K * .45 + '" fill="' + SUN + '" data-bout="1"/>' : '') + '</g>';
  }
  function objet(o, R, sel) {
    var r = R * K, x = o.x * K, y = o.y * K, ring = sel ? ' stroke="' + SUN + '" stroke-width="' + r * .32 + '"' : '';
    if (o.t === 'j') {
      var fill = o.camp === 'adv' ? ADV : (o.g ? SUN : '#fff'), tc = o.camp === 'adv' ? '#fff' : NAVY;
      return '<g data-id="' + o.id + '" transform="translate(' + x + ' ' + y + ')"><circle r="' + r + '" fill="' + fill + '" stroke="' + (o.camp === 'adv' ? '#fff' : NAVY) + '" stroke-width="' + r * .16 + '"/>' + (sel ? '<circle r="' + r * 1.35 + '" fill="none"' + ring + '/>' : '') +
        (o.n ? '<text y="' + r * .36 + '" text-anchor="middle" font-family="League Spartan, Arial, sans-serif" font-weight="800" font-size="' + r * (String(o.n).length > 2 ? .75 : 1) + '" fill="' + tc + '">' + esc(o.n) + '</text>' : '') +
        (o.cap && o.camp === 'nous' ? '<g transform="translate(' + r * .78 + ' ' + -r * .78 + ')"><circle r="' + r * .52 + '" fill="' + SUN + '" stroke="' + NAVY + '" stroke-width="' + r * .1 + '"/><text y="' + r * .2 + '" text-anchor="middle" font-family="League Spartan, Arial, sans-serif" font-weight="900" font-size="' + r * .6 + '" fill="' + NAVY + '">C</text></g>' : '') +
        (o.nom ? '<text y="' + r * 2.25 + '" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="' + r * .82 + '" fill="#fff" paint-order="stroke" stroke="' + NAVY + '" stroke-width="' + r * .28 + '">' + esc(o.nom) + '</text>' : '') + '</g>';
    }
    if (o.t === 'b') return '<g data-id="' + o.id + '" transform="translate(' + x + ' ' + y + ')"><circle r="' + r * .5 + '" fill="#fff" stroke="#111" stroke-width="' + r * .12 + '"/>' + (sel ? '<circle r="' + r * .9 + '" fill="none"' + ring + '/>' : '') + '</g>';
    if (o.t === 'c') return '<g data-id="' + o.id + '" transform="translate(' + x + ' ' + y + ')"><path d="M0 ' + -r * .7 + ' L' + r * .6 + ' ' + r * .5 + ' L' + -r * .6 + ' ' + r * .5 + 'Z" fill="#ff8c1a" stroke="#fff" stroke-width="' + r * .1 + '"' + '/>' + (sel ? '<circle r="' + r + '" fill="none"' + ring + '/>' : '') + '</g>';
    if (o.t === 'z') return '<g data-id="' + o.id + '"><rect x="' + Math.min(x, x + o.w * K) + '" y="' + Math.min(y, y + o.h * K) + '" width="' + Math.abs(o.w * K) + '" height="' + Math.abs(o.h * K) + '" fill="' + SUN + '" fill-opacity=".22" stroke="' + SUN + '" stroke-width="' + r * .18 + '" stroke-dasharray="' + r * .6 + ' ' + r * .4 + '"/>' + (sel ? '<rect x="' + Math.min(x, x + o.w * K) + '" y="' + Math.min(y, y + o.h * K) + '" width="' + Math.abs(o.w * K) + '" height="' + Math.abs(o.h * K) + '" fill="none" stroke="#fff" stroke-width="' + r * .1 + '"/>' : '') + '</g>';
    if (o.t === 'tx') return '<g data-id="' + o.id + '" transform="translate(' + x + ' ' + y + ')"><text text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="' + r * 1.15 + '" fill="#fff" paint-order="stroke" stroke="' + NAVY + '" stroke-width="' + r * .35 + '"' + (sel ? ' text-decoration="underline"' : '') + '>' + esc(o.s || 'Texte') + '</text></g>';
    if (o.t === 'f') return fleche(o, R, sel);
    return '';
  }
  // Renvoie le code SVG complet d'une étape du schéma
  function svg(schema, idx, o) {
    o = o || {}; var S = SPORTS[schema.sport] || SPORTS.football, c = cadre(schema), R = S.R;
    var et = schema.etapes[Math.min(idx || 0, schema.etapes.length - 1)] || { objets: [] };
    var mk = function (id, col) { return '<marker id="cz-m' + id + '" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto"><path d="M0 0L10 5L0 10z" fill="' + col + '"/></marker>'; };
    var objs = et.objets.slice().sort(function (a, b) { var r = { z: 0, f: 1, c: 2, tx: 4, j: 3, b: 5 }; return r[a.t] - r[b.t]; });
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + c.map(function (v) { return v * K; }).join(' ') + '" class="cz-svg"' + (o.label ? ' role="img" aria-label="' + esc(o.label) + '"' : '') + '>' +
      '<defs>' + mk('w', '#fff') + mk('y', SUN) + mk('r', PRESS) + '</defs><rect x="' + c[0] * K + '" y="' + c[1] * K + '" width="' + c[2] * K + '" height="' + c[3] * K + '" fill="' + S.fond + '"/>' +
      S.dessin() + '<g class="cz-objs">' + objs.map(function (x) { return objet(x, R, o.sel === x.id); }).join('') + '</g>' + (o.temp || '') + '</svg>';
  }

  // Animation d'un schéma à plusieurs étapes dans un conteneur (renvoie une fonction d'arrêt)
  function animer(host, schema, onEtape) {
    var n = schema.etapes.length; if (n < 2) return function () {};
    var stop = false, t0 = null, DUR = 1300, PAUSE = 700;
    var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function frame(ts) {
      if (stop) return; if (t0 == null) t0 = ts;
      var cyc = (DUR + PAUSE), tot = cyc * (n - 1) + PAUSE * 2, t = (ts - t0) % tot, i = Math.min(n - 2, Math.floor(t / cyc)), k = Math.min(1, (t - i * cyc) / DUR);
      if (t > cyc * (n - 1)) { i = n - 2; k = 1; }
      if (reduit) k = k < 1 ? 0 : 1;
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      var a = schema.etapes[i], b = schema.etapes[i + 1], mix = { objets: [] };
      b.objets.forEach(function (ob) { var oa = a.objets.find(function (x) { return x.id === ob.id && x.t === ob.t; });
        if (ob.t === 'f') { if (k >= .999) mix.objets.push(ob); return; }
        if (!oa || ob.x == null) { mix.objets.push(ob); return; }
        mix.objets.push(Object.assign({}, ob, { x: oa.x + (ob.x - oa.x) * e, y: oa.y + (ob.y - oa.y) * e })); });
      if (k < .999) a.objets.forEach(function (oa) { if (oa.t === 'f') mix.objets.push(oa); });
      var tmp = Object.assign({}, schema, { etapes: [mix] });
      host.innerHTML = svg(tmp, 0, { label: schema.titre || schema.situation });
      if (onEtape) onEtape(k >= .999 ? i + 1 : i);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return function () { stop = true; };
  }

  // ---------------------------------------------------------------- éditeur
  var OUTILS = [
    ['main', 'Déplacer', 'M5 3l14 8-6 2-2 6z'], ['nous', 'Nous', 'C'], ['adv', 'Adverse', 'CX'], ['b', 'Ballon', 'M12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12z M12 6v3 M9 14l3-2 3 2'], ['c', 'Plot', 'M7 19h10L12 5z'],
    ['course', 'Course', 'M4 18L18 6 M18 6h-6 M18 6v6'], ['passe', 'Passe', 'M4 18l3-2.5 M10 13l3-2.5 M16 8l2-2 M18 6h-5 M18 6v5'], ['conduite', 'Conduite', 'M3 15l3-4 3 4 3-4 3 4 3-4 M18 7h3v3'],
    ['tir', 'Tir', 'M3 20L20 4 M20 4h-6 M20 4v6'], ['pressing', 'Pressing', 'M4 12h13 M13 7l5 5-5 5'], ['z', 'Zone', 'M4 5h16v14H4z'], ['tx', 'Texte', 'M5 6h14 M12 6v13'], ['gomme', 'Gomme', 'M4 16l8-8 6 6-5 5H8z']];
  function ico(d) {
    if (d === 'C') return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="currentColor"/></svg>';
    if (d === 'CX') return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="' + ADV + '" stroke="currentColor" stroke-width="2"/></svg>';
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function el(tag, attrs) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else if (k === 'value') e.value = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v); else e.setAttribute(k, v === true ? '' : v); });
    for (var i = 2; i < arguments.length; i++) (function ad(c) { if (c == null || c === false) return; if (Array.isArray(c)) c.forEach(ad); else e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); })(arguments[i]);
    return e;
  }

  // Ouvre l'éditeur d'un schéma dans « host ». ctx : { noms: [...], change: fn(schema) }
  function editeur(host, schema, ctx) {
    ctx = ctx || {}; var S = SPORTS[schema.sport] || SPORTS.football;
    var e = { outil: 'main', sel: null, etape: 0, hist: [], drag: null, stopAnim: null };
    var stage = el('div', { class: 'cz-stage' });
    var panneau = el('div', { class: 'cz-selp' });
    function et() { return schema.etapes[e.etape]; }
    function snap() { e.hist.push(JSON.stringify(schema)); if (e.hist.length > 60) e.hist.shift(); }
    function change() { if (ctx.change) ctx.change(schema); }
    function nextNum(camp) { var nums = et().objets.filter(function (o) { return o.t === 'j' && o.camp === camp; }).map(function (o) { return parseInt(o.n, 10) || 0; }); var n = 1; while (nums.indexOf(n) >= 0) n++; return String(n); }
    function pt(ev) {
      var s = stage.querySelector('svg'); if (!s) return [0, 0];
      var p = s.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; var m = s.getScreenCTM(); if (!m) return [0, 0];
      var q = p.matrixTransform(m.inverse()); return [Math.round(q.x / K * 10) / 10, Math.round(q.y / K * 10) / 10];
    }
    function find(id) { return et().objets.find(function (o) { return o.id === id; }); }
    function draw(temp) {
      if (e.stopAnim) return;
      stage.innerHTML = svg(schema, e.etape, { sel: e.sel, temp: temp, label: 'Tableau tactique : ' + (schema.titre || schema.situation) });
      var s = stage.querySelector('svg'); s.style.cursor = e.outil === 'main' ? 'grab' : e.outil === 'gomme' ? 'not-allowed' : 'crosshair'; s.style.touchAction = 'none';
      panel();
    }
    function panel() {
      panneau.innerHTML = '';
      var o = e.sel && find(e.sel); if (!o) { panneau.appendChild(el('p', { class: 'cz-aide' }, e.outil === 'main' ? 'Touchez un joueur, un ballon ou une flèche pour le déplacer ou le modifier.' : 'Touchez le terrain pour placer l’élément. Pour une flèche ou une zone : appuyez, glissez, relâchez.')); return; }
      var row = el('div', { class: 'cz-selrow' });
      if (o.t === 'j') {
        var num = el('input', { class: 'cz-in cz-in-s', value: o.n || '', maxlength: '3', 'aria-label': 'Numéro' });
        num.addEventListener('input', function () { o.n = num.value.trim(); change(); draw(); keepFocus(num); });
        var nom = el('input', { class: 'cz-in', value: o.nom || '', maxlength: '24', list: ctx.listId || null, placeholder: 'Nom (facultatif)', 'aria-label': 'Nom du joueur' });
        nom.addEventListener('input', function () { o.nom = nom.value; change(); draw(); keepFocus(nom); });
        row.appendChild(el('label', { class: 'cz-l' }, 'N°', num)); row.appendChild(el('label', { class: 'cz-l cz-grow' }, 'Joueur', nom));
        if (o.camp === 'nous') row.appendChild(el('button', { type: 'button', class: 'cz-btn cz-ghost', 'aria-pressed': o.g ? 'true' : 'false', onclick: function () { snap(); o.g = !o.g; change(); draw(); } }, 'Gardien'));
        if (o.camp === 'nous') row.appendChild(el('button', { type: 'button', class: 'cz-btn cz-ghost', 'aria-pressed': o.cap ? 'true' : 'false', title: 'Un seul capitaine par équipe', onclick: function () { snap(); var v = !o.cap; schema.etapes.forEach(function (x) { x.objets.forEach(function (j) { if (j.t === 'j' && j.camp === 'nous') j.cap = v && j.id === o.id; }); }); o.cap = v; change(); draw(); } }, 'Capitaine ©'));
      }
      if (o.t === 'tx') { var tx = el('input', { class: 'cz-in', value: o.s || '', maxlength: '40', 'aria-label': 'Texte' }); tx.addEventListener('input', function () { o.s = tx.value; change(); draw(); keepFocus(tx); }); row.appendChild(el('label', { class: 'cz-l cz-grow' }, 'Texte', tx)); }
      if (o.t === 'f') { var sk = el('select', { class: 'cz-in', 'aria-label': 'Type de flèche' }); [['course', 'Course'], ['passe', 'Passe'], ['conduite', 'Conduite'], ['tir', 'Tir'], ['pressing', 'Pressing']].forEach(function (k) { sk.appendChild(el('option', { value: k[0], selected: o.kind === k[0] ? true : null }, k[1])); }); sk.addEventListener('change', function () { snap(); o.kind = sk.value; change(); draw(); }); row.appendChild(el('label', { class: 'cz-l' }, 'Flèche', sk)); }
      row.appendChild(el('button', { type: 'button', class: 'cz-btn cz-danger', onclick: function () { snap(); et().objets = et().objets.filter(function (x) { return x.id !== o.id; }); e.sel = null; change(); draw(); } }, 'Retirer'));
      panneau.appendChild(row);
    }
    function keepFocus(inp) { var p = inp.selectionStart; setTimeout(function () { var again = panneau.querySelector('input[aria-label="' + inp.getAttribute('aria-label') + '"]'); if (again && document.activeElement !== again) { again.focus(); try { again.setSelectionRange(p, p); } catch (x) {} } }, 0); }
    function hit(ev) { var g = ev.target && ev.target.closest ? ev.target.closest('[data-id]') : null; return g ? g.getAttribute('data-id') : null; }
    stage.addEventListener('pointerdown', function (ev) {
      if (e.stopAnim) return; var p = pt(ev), id = hit(ev), bout = ev.target.getAttribute && ev.target.getAttribute('data-bout');
      if (e.outil === 'gomme') { if (id) { snap(); et().objets = et().objets.filter(function (x) { return x.id !== id; }); if (e.sel === id) e.sel = null; change(); draw(); } return; }
      if (e.outil === 'main') {
        if (!id) { e.sel = null; draw(); return; }
        var o = find(id); e.sel = id; snap();
        e.drag = { o: o, p0: p, bout: bout != null ? +bout : null, orig: JSON.parse(JSON.stringify(o)) };
        try { stage.setPointerCapture(ev.pointerId); } catch (x) {}
        draw(); return;
      }
      if (['nous', 'adv', 'b', 'c', 'tx'].indexOf(e.outil) >= 0) {
        snap(); var n = { id: uid(), t: e.outil === 'nous' || e.outil === 'adv' ? 'j' : e.outil, x: p[0], y: p[1] };
        if (n.t === 'j') { n.camp = e.outil; n.n = nextNum(e.outil); }
        if (n.t === 'tx') n.s = 'Texte';
        et().objets.push(n); e.sel = n.id; change(); draw();
        if (n.t === 'tx') { var ti = panneau.querySelector('input'); if (ti) { ti.focus(); ti.select(); } }
        return;
      }
      // flèche ou zone : on dessine en glissant
      e.drag = { neuf: e.outil, p0: p, p1: p }; try { stage.setPointerCapture(ev.pointerId); } catch (x) {}
    });
    stage.addEventListener('pointermove', function (ev) {
      var d = e.drag; if (!d) return; var p = pt(ev);
      if (d.o) {
        var dx = p[0] - d.p0[0], dy = p[1] - d.p0[1], o = d.o, g = d.orig;
        if (o.t === 'f') { if (d.bout != null) o.p[d.bout] = p.slice(); else o.p = g.p.map(function (q) { return [q[0] + dx, q[1] + dy]; }); }
        else { o.x = Math.round((g.x + dx) * 10) / 10; o.y = Math.round((g.y + dy) * 10) / 10; }
        draw(); return;
      }
      d.p1 = p;
      var tmp = d.neuf === 'z' ? { id: '_t', t: 'z', x: d.p0[0], y: d.p0[1], w: p[0] - d.p0[0], h: p[1] - d.p0[1] } : { id: '_t', t: 'f', kind: d.neuf, p: [d.p0, p] };
      draw(objet(tmp, S.R, false));
    });
    function fin() {
      var d = e.drag; e.drag = null; if (!d) return;
      if (d.o) { change(); draw(); return; }
      var dx = d.p1[0] - d.p0[0], dy = d.p1[1] - d.p0[1];
      if (Math.sqrt(dx * dx + dy * dy) < S.R * 1.2) { draw(); return; }
      snap(); var n = d.neuf === 'z' ? { id: uid(), t: 'z', x: d.p0[0], y: d.p0[1], w: dx, h: dy } : { id: uid(), t: 'f', kind: d.neuf, p: [d.p0, d.p1] };
      et().objets.push(n); e.sel = n.id; change(); draw();
    }
    stage.addEventListener('pointerup', fin); stage.addEventListener('pointercancel', fin);

    // barre d'outils
    var outils = el('div', { class: 'cz-tools', role: 'toolbar', 'aria-label': 'Outils du tableau' });
    function drawTools() {
      outils.innerHTML = '';
      OUTILS.forEach(function (t) { outils.appendChild(el('button', { type: 'button', class: 'cz-tool', 'aria-pressed': e.outil === t[0] ? 'true' : 'false', title: t[1], onclick: function () { e.outil = t[0]; if (t[0] !== 'main') e.sel = null; drawTools(); draw(); } }, el('span', { html: ico(t[2]) }), el('span', {}, t[1]))); });
      outils.appendChild(el('button', { type: 'button', class: 'cz-tool', title: 'Annuler', disabled: e.hist.length ? null : true, onclick: function () { var h = e.hist.pop(); if (!h) return; var back = JSON.parse(h); Object.keys(back).forEach(function (k) { schema[k] = back[k]; }); e.etape = Math.min(e.etape, schema.etapes.length - 1); e.sel = null; change(); drawAll(); } }, el('span', { html: ico('M9 7L4 12l5 5 M4 12h11a5 5 0 0 1 0 10') }), el('span', {}, 'Annuler')));
    }
    // en-tête : situation, vue, système, étapes
    var haut = el('div', { class: 'cz-bhead' });
    function drawHead() {
      haut.innerHTML = '';
      var sit = el('select', { class: 'cz-in', 'aria-label': 'Situation' }); S.situations.forEach(function (x) { sit.appendChild(el('option', { value: x, selected: schema.situation === x ? true : null }, x)); });
      sit.addEventListener('change', function () { schema.situation = sit.value; change(); });
      var titre = el('input', { class: 'cz-in', value: schema.titre || '', maxlength: '60', placeholder: 'Nom du schéma (ex. « Le bloc au 1er poteau »)', 'aria-label': 'Nom du schéma' });
      titre.addEventListener('input', function () { schema.titre = titre.value; change(); });
      var vues = el('div', { class: 'cz-seg', role: 'group', 'aria-label': 'Terrain' }); Object.keys(S.vues).forEach(function (k) { vues.appendChild(el('button', { type: 'button', 'aria-pressed': schema.vue === k ? 'true' : 'false', onclick: function () { schema.vue = k; change(); drawHead(); draw(); } }, S.vues[k][0])); });
      var sys = el('select', { class: 'cz-in', 'aria-label': 'Placer un système' }); sys.appendChild(el('option', { value: '' }, 'Placer un système…')); Object.keys(S.systemes).forEach(function (k) { sys.appendChild(el('option', { value: k }, k)); });
      sys.addEventListener('change', function () { if (!sys.value) return; snap(); e.etape = 0; avecSysteme(schema, sys.value); change(); drawAll(); });
      var ets = el('div', { class: 'cz-seg', role: 'group', 'aria-label': 'Étapes' });
      schema.etapes.forEach(function (x, i) { ets.appendChild(el('button', { type: 'button', 'aria-pressed': e.etape === i ? 'true' : 'false', onclick: function () { arret(); e.etape = i; e.sel = null; drawHead(); draw(); } }, 'Étape ' + (i + 1))); });
      ets.appendChild(el('button', { type: 'button', title: 'Ajouter une étape (les joueurs sont repris, à vous de les déplacer)', onclick: function () { arret(); snap(); var cop = et().objets.filter(function (o) { return o.t !== 'f'; }).map(function (o) { return JSON.parse(JSON.stringify(o)); }); schema.etapes.splice(e.etape + 1, 0, { objets: cop }); e.etape++; e.sel = null; change(); drawHead(); draw(); } }, '+ Étape'));
      if (schema.etapes.length > 1) ets.appendChild(el('button', { type: 'button', title: 'Supprimer cette étape', onclick: function () { arret(); snap(); schema.etapes.splice(e.etape, 1); e.etape = Math.max(0, e.etape - 1); e.sel = null; change(); drawHead(); draw(); } }, '− Étape'));
      var anim = el('button', { type: 'button', class: 'cz-btn cz-dark', disabled: schema.etapes.length > 1 ? null : true, onclick: function () { if (e.stopAnim) { arret(); return; } e.sel = null; e.stopAnim = animer(stage, schema, function (i) { /* étape affichée */ }); anim.textContent = '■ Arrêter'; } }, e.stopAnim ? '■ Arrêter' : '▶ Animer');
      haut.appendChild(el('div', { class: 'cz-brow' }, el('label', { class: 'cz-l' }, 'Situation', sit), el('label', { class: 'cz-l cz-grow' }, 'Nom du schéma', titre)));
      haut.appendChild(el('div', { class: 'cz-brow' }, vues, sys));
      haut.appendChild(el('div', { class: 'cz-brow' }, ets, anim));
    }
    function arret() { if (e.stopAnim) { e.stopAnim(); e.stopAnim = null; drawHead(); draw(); } }
    var consigne = el('textarea', { class: 'cz-in', rows: '3', maxlength: '600', placeholder: 'Consigne : qui fait quoi, à quel moment…', 'aria-label': 'Consigne' });
    consigne.value = schema.consigne || ''; consigne.addEventListener('input', function () { schema.consigne = consigne.value; change(); });
    var leg = el('div', { class: 'cz-leg', html: '<span><i class="cz-lg-c"></i>Course</span><span><i class="cz-lg-p"></i>Passe</span><span>〰 Conduite</span><span><i class="cz-lg-t"></i>Tir</span><span><i class="cz-lg-r"></i>Pressing</span><span><b class="cz-dot"></b>Nous <b class="cz-dot cz-dot-a"></b>Adversaire</span>' });
    function drawAll() { drawTools(); drawHead(); draw(); consigne.value = schema.consigne || ''; }
    host.innerHTML = '';
    host.appendChild(el('div', { class: 'cz-board' }, outils, el('div', { class: 'cz-bmain' }, haut, stage, leg, panneau, el('label', { class: 'cz-l' }, 'Consigne', consigne))));
    drawAll();
    return { redraw: drawAll, arret: arret };
  }

  // Les titulaires de la compo (étape 1, notre équipe), triés gardien d'abord puis par numéro
  function titulaires(schema) {
    if (!schema || !schema.etapes || !schema.etapes[0]) return [];
    return schema.etapes[0].objets.filter(function (o) { return o.t === 'j' && o.camp === 'nous'; }).map(function (o) { return { n: o.n || '', nom: o.nom || '', cap: !!o.cap, g: !!o.g }; })
      .sort(function (a, b) { return (b.g - a.g) || ((parseInt(a.n, 10) || 999) - (parseInt(b.n, 10) || 999)); });
  }
  return { titulaires: titulaires, SPORTS: SPORTS, TIREURS: TIREURS, sportDe: sportDe, nouveau: nouveau, avecSysteme: avecSysteme, svg: svg, animer: animer, editeur: editeur, cadre: cadre, K: K };
})();
