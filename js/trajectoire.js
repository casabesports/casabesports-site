/*!
 * Casa Besports — « Ma trajectoire » : le suivi de l'athlète, dans le style BE+ Marée.
 *  - Statistiques de chaque match, propres à la discipline (football, basket, hand, volley, rugby, water-polo, hockey,
 *    tennis, tennis de table, badminton, judo), ou performances chronométrées / mesurées (natation, athlétisme, course et trail, cyclisme).
 *  - Tableau de bord : indice de forme, totaux, moyennes, ratios de la discipline, courbe de progression.
 *  - Le « futur » : projection de fin de saison pour chaque objectif, rythme à tenir, date estimée d'un record visé.
 *  - Forme et charge : bilan du jour (forme, sommeil, douleur) et charge d'entraînement (durée × intensité),
 *    rapport charge de la semaine / charge habituelle. Repères indicatifs, jamais un avis médical.
 * Rien n'est inventé : tout vient de ce que l'athlète saisit. Les calculs sont expliqués à l'écran.
 * Données : sur l'appareil (localStorage), et copiées dans le compte si l'athlète est connecté (supabase/trajectoire.sql,
 * visibles de lui seul). Rien n'est publié : l'athlète peut proposer ses chiffres pour sa fiche publique, l'admin les vérifie.
 * Chargé à la demande (app.openTrajectoire).
 */
var CasaTrajectoire = (function () {
  'use strict';

  // ---------------------------------------------------------------- disciplines
  // type : equipe (statistiques par match), duel (victoires, sets…), perf (chronos, distances)
  function C(k, l, o) { return Object.assign({ k: k, l: l }, o || {}); }
  var DISC = {
    football: { nom: 'Football', type: 'equipe', postes: ['Gardien', 'Défenseur', 'Milieu', 'Attaquant'], duree: 90,
      champs: [C('buts', 'Buts'), C('passes', 'Passes décisives'), C('tirs', 'Tirs'), C('cadres', 'Tirs cadrés'), C('duels', 'Duels gagnés'), C('recup', 'Ballons récupérés'), C('arrets', 'Arrêts', { g: 1 }), C('encaisses', 'Buts encaissés', { g: 1 }), C('jaunes', 'Cartons jaunes'), C('rouges', 'Cartons rouges')],
      principal: 'buts', ratios: function (t, n, m) { return [r('Buts + passes décisives', t.buts + t.passes), r('Buts par 90 min', per90(t.buts, m), 2), r('Tirs cadrés', pct(t.cadres, t.tirs)), r('Minutes par but', t.buts ? Math.round(m / t.buts) : null, 0, ' min'), r('Clean sheets', t._cs)]; } },
    basketball: { nom: 'Basketball', type: 'equipe', postes: ['Meneur', 'Arrière', 'Ailier', 'Ailier fort', 'Pivot'], duree: 40,
      champs: [C('pts', 'Points'), C('reb', 'Rebonds'), C('pd', 'Passes décisives'), C('int', 'Interceptions'), C('ctr', 'Contres'), C('bp', 'Balles perdues'), C('tr', 'Tirs réussis'), C('tt', 'Tirs tentés'), C('tpr', '3 pts réussis'), C('tpt', '3 pts tentés'), C('lfr', 'Lancers francs réussis'), C('lft', 'Lancers francs tentés'), C('fautes', 'Fautes')],
      principal: 'pts', ratios: function (t, n) { return [r('Points par match', n ? t.pts / n : null, 1), r('Évaluation par match', n ? (t.pts + t.reb + t.pd + t.int + t.ctr - (t.tt - t.tr) - (t.lft - t.lfr) - t.bp) / n : null, 1), r('Adresse aux tirs', pct(t.tr, t.tt)), r('Adresse à 3 pts', pct(t.tpr, t.tpt)), r('Lancers francs', pct(t.lfr, t.lft))]; } },
    handball: { nom: 'Handball', type: 'equipe', postes: ['Gardien', 'Ailier', 'Arrière', 'Demi-centre', 'Pivot'], duree: 60,
      champs: [C('buts', 'Buts'), C('tirs', 'Tirs'), C('pd', 'Passes décisives'), C('arrets', 'Arrêts', { g: 1 }), C('subis', 'Tirs subis', { g: 1 }), C('excl', 'Exclusions 2 min'), C('pb', 'Ballons perdus')],
      principal: 'buts', ratios: function (t, n) { return [r('Buts par match', n ? t.buts / n : null, 1), r('Réussite au tir', pct(t.buts, t.tirs)), r('Arrêts (gardien)', pct(t.arrets, t.subis)), r('Exclusions par match', n ? t.excl / n : null, 1)]; } },
    volley: { nom: 'Volley-ball', type: 'equipe', postes: ['Passeur', 'Pointu', 'Réceptionneur-attaquant', 'Central', 'Libéro'], duree: 0,
      champs: [C('att', 'Attaques gagnantes'), C('attT', 'Attaques tentées'), C('attF', 'Attaques fautées'), C('aces', 'Aces'), C('servF', 'Fautes de service'), C('contres', 'Contres gagnants'), C('recOk', 'Réceptions parfaites'), C('recT', 'Réceptions')],
      principal: 'att', ratios: function (t, n) { return [r('Points marqués', t.att + t.aces + t.contres), r('Efficacité en attaque', t.attT ? (t.att - t.attF) / t.attT * 100 : null, 0, ' %'), r('Réception parfaite', pct(t.recOk, t.recT)), r('Aces par match', n ? t.aces / n : null, 1)]; } },
    rugby: { nom: 'Rugby', type: 'equipe', postes: ['Pilier', 'Talonneur', '2e ligne', '3e ligne', 'Demi de mêlée', 'Demi d’ouverture', 'Centre', 'Ailier', 'Arrière'], duree: 80,
      champs: [C('essais', 'Essais'), C('pied', 'Points au pied'), C('plaq', 'Plaquages réussis'), C('plaqM', 'Plaquages manqués'), C('franch', 'Franchissements'), C('metres', 'Mètres gagnés'), C('grat', 'Ballons grattés'), C('jaunes', 'Cartons jaunes')],
      principal: 'essais', ratios: function (t, n) { return [r('Points marqués', t.essais * 5 + t.pied), r('Plaquages réussis', pct(t.plaq, t.plaq + t.plaqM)), r('Mètres par match', n ? t.metres / n : null, 0, ' m'), r('Plaquages par match', n ? t.plaq / n : null, 1)]; } },
    waterpolo: { nom: 'Water-polo', type: 'equipe', postes: ['Gardien', 'Pointe', 'Ailier', 'Arrière', 'Centre'], duree: 32,
      champs: [C('buts', 'Buts'), C('tirs', 'Tirs'), C('pd', 'Passes décisives'), C('arrets', 'Arrêts', { g: 1 }), C('excl', 'Exclusions'), C('provo', 'Exclusions provoquées')],
      principal: 'buts', ratios: function (t, n) { return [r('Buts par match', n ? t.buts / n : null, 1), r('Réussite au tir', pct(t.buts, t.tirs)), r('Exclusions provoquées', t.provo)]; } },
    hockey: { nom: 'Hockey', type: 'equipe', postes: ['Gardien', 'Défenseur', 'Ailier', 'Centre'], duree: 60,
      champs: [C('buts', 'Buts'), C('passes', 'Assistances'), C('tirs', 'Tirs'), C('pen', 'Minutes de pénalité'), C('arrets', 'Arrêts', { g: 1 })],
      principal: 'buts', ratios: function (t, n) { return [r('Points (buts + assistances)', t.buts + t.passes), r('Réussite au tir', pct(t.buts, t.tirs)), r('Points par match', n ? (t.buts + t.passes) / n : null, 2)]; } },
    tennis: { nom: 'Tennis', type: 'duel', postes: ['Simple', 'Double'],
      champs: [C('setsG', 'Sets gagnés'), C('setsP', 'Sets perdus'), C('jeuxG', 'Jeux gagnés'), C('jeuxP', 'Jeux perdus'), C('aces', 'Aces'), C('df', 'Doubles fautes')],
      principal: 'victoires', ratios: function (t, n) { return [r('Victoires', pct(t.victoires, n)), r('Sets gagnés', pct(t.setsG, t.setsG + t.setsP)), r('Jeux gagnés', pct(t.jeuxG, t.jeuxG + t.jeuxP)), r('Aces par match', n ? t.aces / n : null, 1)]; } },
    tennistable: { nom: 'Tennis de table', type: 'duel', postes: ['Simple', 'Double'],
      champs: [C('setsG', 'Manches gagnées'), C('setsP', 'Manches perdues'), C('ptsG', 'Points gagnés'), C('ptsP', 'Points perdus')],
      principal: 'victoires', ratios: function (t, n) { return [r('Victoires', pct(t.victoires, n)), r('Manches gagnées', pct(t.setsG, t.setsG + t.setsP)), r('Points gagnés', pct(t.ptsG, t.ptsG + t.ptsP))]; } },
    badminton: { nom: 'Badminton', type: 'duel', postes: ['Simple', 'Double', 'Mixte'],
      champs: [C('setsG', 'Sets gagnés'), C('setsP', 'Sets perdus'), C('ptsG', 'Points gagnés'), C('ptsP', 'Points perdus')],
      principal: 'victoires', ratios: function (t, n) { return [r('Victoires', pct(t.victoires, n)), r('Sets gagnés', pct(t.setsG, t.setsG + t.setsP)), r('Points gagnés', pct(t.ptsG, t.ptsG + t.ptsP))]; } },
    judo: { nom: 'Judo', type: 'duel', postes: ['-60 kg', '-66 kg', '-73 kg', '-81 kg', '-90 kg', '-100 kg', '+100 kg', '-48 kg', '-52 kg', '-57 kg', '-63 kg', '-70 kg', '-78 kg', '+78 kg'],
      champs: [C('ippon', 'Ippons marqués'), C('wazari', 'Waza-ari marqués'), C('shido', 'Shidos reçus'), C('golden', 'Combat en golden score')],
      principal: 'victoires', ratios: function (t, n) { return [r('Victoires', pct(t.victoires, n)), r('Victoires par ippon', pct(t.ippon, t.victoires)), r('Shidos par combat', n ? t.shido / n : null, 1)]; } },
    natation: { nom: 'Natation', type: 'perf', epreuves: ['50 m nage libre', '100 m nage libre', '200 m nage libre', '400 m nage libre', '50 m dos', '100 m dos', '50 m brasse', '100 m brasse', '50 m papillon', '100 m papillon', '200 m 4 nages'] },
    athletisme: { nom: 'Athlétisme', type: 'perf', epreuves: ['100 m', '200 m', '400 m', '800 m', '1 500 m', '5 000 m', '10 000 m', '110 m haies', '100 m haies', 'Longueur', 'Triple saut', 'Hauteur', 'Perche', 'Poids', 'Disque', 'Javelot'] },
    course: { nom: 'Course et trail', type: 'perf', epreuves: ['5 km', '10 km', 'Semi-marathon', 'Marathon', 'Trail court', 'Trail long'] },
    cyclisme: { nom: 'Cyclisme', type: 'perf', epreuves: ['Contre-la-montre 10 km', 'Contre-la-montre 20 km', 'Montée chronométrée', 'Course en ligne'] }
  };
  var ORDRE = ['football', 'basketball', 'handball', 'volley', 'rugby', 'waterpolo', 'hockey', 'tennis', 'tennistable', 'badminton', 'judo', 'natation', 'athletisme', 'course', 'cyclisme'];
  // Épreuves mesurées en distance ou hauteur : le plus grand est le meilleur
  var MESURE = /longueur|triple|hauteur|perche|poids|disque|javelot|marteau/i;
  function r(l, v, dec, unite) { return { l: l, v: v, dec: dec == null ? 0 : dec, u: unite || '' }; }
  function pct(a, b) { return b ? { pct: a / b * 100 } : null; }
  function per90(x, m) { return m ? x / m * 90 : null; }

  // ---------------------------------------------------------------- outils
  var st = null, KEY = 'cb-trajectoire:';
  function el(tag, attrs) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) { var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else if (k === 'style') e.style.cssText = v;
      else if (k === 'value') e.value = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v); else e.setAttribute(k, v === true ? '' : v); });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; } e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function A() { return window.CasaAuth && window.CasaAuth.on ? window.CasaAuth : null; }
  function moi() { var a = A(); return a && a.user ? a.user.id : null; }
  function say(t) { if (st && st.ctx.say) st.ctx.say(t); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function auj() { return iso(new Date()); }
  function jourDe(s) { var d = new Date(s + 'T12:00:00'); return isNaN(d) ? null : d; }
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  function dateCourte(s) { var d = jourDe(s); return d ? d.getDate() + ' ' + MOIS[d.getMonth()] : ''; }
  function dateLongue(d) { return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; }
  function fmt(v, dec) { if (v == null || !isFinite(v)) return '—'; return Number(v).toLocaleString('fr-FR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 }); }
  function nid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function ini(nom) { return String(nom || '').trim().split(/\s+/).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase() || 'BE'; }
  function finSaisonDefaut() { var d = new Date(); var y = d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear(); return y + '-06-30'; }
  function debutSaison(p) { var f = jourDe(p.finSaison || finSaisonDefaut()); return iso(new Date(f.getFullYear() - 1, 6, 1)); }
  // Chronos : « 1:02.35 », « 12.4 », « 1h05:30 » → secondes ; distances : « 6,42 » → mètres
  function lireValeur(s) {
    s = String(s || '').trim().replace(',', '.').replace(/\s/g, ''); if (!s) return null;
    var h = s.match(/^(\d+)h(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/i); if (h) return +h[1] * 3600 + +h[2] * 60 + (h[3] ? +h[3] : 0);
    var p = s.split(':'); if (p.length > 3 || p.some(function (x) { return x === '' || isNaN(+x); })) return null;
    return p.reduce(function (acc, x) { return acc * 60 + +x; }, 0);
  }
  function ecrireValeur(v, mesure) {
    if (v == null || !isFinite(v)) return '—';
    if (mesure) return fmt(v, 2) + ' m';
    var hh = Math.floor(v / 3600), mm = Math.floor((v % 3600) / 60), ss = v % 60;
    var sTxt = (ss < 10 && (hh || mm) ? '0' : '') + ss.toFixed(2).replace(/\.00$/, '').replace('.', ',');
    if (hh) return hh + ' h ' + pad(mm) + ' min ' + pad(Math.round(ss));
    return mm ? mm + ':' + sTxt : sTxt + ' s';
  }

  // ---------------------------------------------------------------- données
  function vide() { return { v: 1, profil: { nom: '', discipline: '', poste: '', club: '', finSaison: finSaisonDefaut(), matchsPrevus: '' }, matchs: [], perfs: [], bilans: [], seances: [], objectifs: [], maj: 0 }; }
  function lire(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function propre(d) { var o = vide(); d = d || {}; o.profil = Object.assign(o.profil, d.profil || {}); ['matchs', 'perfs', 'bilans', 'seances', 'objectifs'].forEach(function (k) { o[k] = Array.isArray(d[k]) ? d[k].slice(0, 400) : []; }); o.maj = d.maj || 0; return o; }
  function sauver() {
    st.d.maj = Date.now(); ecrire(st.key, st.d);
    if (!A() || !moi() || st.sqlMissing) return;
    clearTimeout(st.tSync); st.tSync = setTimeout(envoyerCompte, 1200);
  }
  function envoyerCompte() {
    if (!st || !A() || !moi()) return;
    A().db(function (c) { return c.from('athlete_trajectoire').upsert({ user_id: moi(), donnees: st.d, maj_le: new Date(st.d.maj).toISOString() }); })
      .then(function () { st.synchro = 'Copié dans votre compte'; badge(); }, function (e) { if (/does not exist|schema cache|PGRST20|42P01|Could not find/i.test(String(e && e.message || e))) st.sqlMissing = true; st.synchro = 'Gardé sur cet appareil'; badge(); });
  }
  function lireCompte() {
    if (!A() || !moi()) return Promise.resolve();
    return A().db(function (c) { return c.from('athlete_trajectoire').select('donnees, maj_le').eq('user_id', moi()).maybeSingle(); }).then(function (row) {
      if (row && row.donnees && (row.donnees.maj || 0) > (st.d.maj || 0)) { st.d = propre(row.donnees); ecrire(st.key, st.d); }
      else if (st.d.maj && (!row || (row.donnees.maj || 0) < st.d.maj)) envoyerCompte();
      st.synchro = 'Copié dans votre compte';
    }, function (e) { if (/does not exist|schema cache|PGRST20|42P01|Could not find/i.test(String(e && e.message || e))) st.sqlMissing = true; st.synchro = 'Gardé sur cet appareil'; });
  }
  function badge() { var b = st && st.root.querySelector('.tj-sync'); if (b) b.textContent = st.synchro || ''; }

  function D() { return DISC[st.d.profil.discipline] || null; }
  function saison(list) { var a = debutSaison(st.d.profil), b = st.d.profil.finSaison || finSaisonDefaut(); return list.filter(function (x) { return x.date >= a && x.date <= b; }); }
  function tri(list) { return list.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }); }

  // Totaux de la saison (sports d'équipe et duels)
  function totaux() {
    var d = D(), ms = tri(saison(st.d.matchs)), t = { victoires: 0, defaites: 0, nuls: 0, _cs: 0 }, minutes = 0;
    d.champs.forEach(function (c) { t[c.k] = 0; });
    ms.forEach(function (m) {
      d.champs.forEach(function (c) { t[c.k] += num(m.s && m.s[c.k]); });
      minutes += num(m.min);
      if (m.res === 'V') t.victoires++; else if (m.res === 'D') t.defaites++; else if (m.res === 'N') t.nuls++;
      if (st.d.profil.discipline === 'football' && /gardien/i.test(st.d.profil.poste) && m.s && String(m.s.encaisses) === '0' && num(m.min) >= 60) t._cs++;
    });
    t.matchs = ms.length; t.minutes = minutes; if (!/gardien/i.test(st.d.profil.poste)) t._cs = null;
    return { t: t, ms: ms, n: ms.length, minutes: minutes };
  }
  function valeurStat(m, k) { if (k === 'victoires') return m.res === 'V' ? 1 : 0; if (k === 'matchs') return 1; if (k === 'minutes') return num(m.min); return num(m.s && m.s[k]); }
  function libelleStat(k) { if (k === 'victoires') return 'Victoires'; if (k === 'matchs') return 'Matchs joués'; if (k === 'minutes') return 'Minutes jouées'; var c = (D().champs || []).find(function (x) { return x.k === k; }); return c ? c.l : k; }

  // Indice de forme (0–100) sur les 7 derniers jours : forme 40 %, sommeil 30 %, absence de douleur 30 %
  function indiceForme() {
    var lim = iso(new Date(Date.now() - 6 * 86400000)), b = st.d.bilans.filter(function (x) { return x.date >= lim; });
    if (!b.length) return null;
    var f = 0, s = 0, dl = 0;
    b.forEach(function (x) { f += num(x.forme); s += Math.max(0, Math.min(1, (num(x.sommeil) - 5) / 3)); dl += num(x.douleur); });
    f /= b.length; s /= b.length; dl /= b.length;
    return { v: Math.round(((f - 1) / 9) * 40 + s * 30 + (1 - dl / 10) * 30), n: b.length, forme: f, sommeil: b.reduce(function (a, x) { return a + num(x.sommeil); }, 0) / b.length, douleur: dl };
  }
  // Charge d'entraînement : durée (min) × intensité ressentie (1 à 10), méthode « RPE de séance »
  function charges() {
    var now = Date.now(), j7 = iso(new Date(now - 6 * 86400000)), j28 = iso(new Date(now - 27 * 86400000)), c7 = 0, c28 = 0, premier = null;
    st.d.seances.forEach(function (x) { var c = num(x.duree) * num(x.rpe); if (x.date >= j28) { c28 += c; if (!premier || x.date < premier) premier = x.date; } if (x.date >= j7) c7 += c; });
    var jours = premier ? Math.round((jourDe(auj()) - jourDe(premier)) / 86400000) + 1 : 0;
    var habituelle = c28 / 4;
    return { c7: c7, c28: c28, ratio: jours >= 21 && habituelle > 0 ? c7 / habituelle : null, jours: jours };
  }
  // Projection de fin de saison d'un objectif (sports d'équipe et duels)
  function projection(o, T) {
    var actuel = 0; T.ms.forEach(function (m) { actuel += valeurStat(m, o.stat); });
    var prevus = num(st.d.profil.matchsPrevus), restants = Math.max(0, prevus - T.n), cible = num(o.cible);
    var rythme = T.n ? actuel / T.n : 0, projete = prevus ? actuel + rythme * restants : null;
    var besoin = restants ? Math.max(0, (cible - actuel) / restants) : null;
    var etat = actuel >= cible ? 'atteint' : projete == null ? 'inconnu' : projete >= cible ? 'enavance' : projete >= cible * 0.85 ? 'juste' : 'retard';
    return { actuel: actuel, cible: cible, projete: projete, restants: restants, rythme: rythme, besoin: besoin, etat: etat };
  }
  // Records et tendance d'une épreuve (sports de performance) : régression linéaire sur les dates
  function epreuve(nom) {
    var mesure = MESURE.test(nom), ps = tri(st.d.perfs.filter(function (p) { return p.epreuve === nom && p.val != null; }));
    if (!ps.length) return null;
    var best = ps.reduce(function (b, p) { return b == null || (mesure ? p.val > b.val : p.val < b.val) ? p : b; }, null);
    var t0 = jourDe(ps[0].date).getTime(), pts = ps.map(function (p) { return [(jourDe(p.date).getTime() - t0) / 86400000, p.val]; }), pente = null, orig = null;
    if (pts.length >= 3 && pts[pts.length - 1][0] - pts[0][0] >= 14) {
      var n = pts.length, sx = 0, sy = 0, sxy = 0, sxx = 0; pts.forEach(function (q) { sx += q[0]; sy += q[1]; sxy += q[0] * q[1]; sxx += q[0] * q[0]; });
      var den = n * sxx - sx * sx; if (den) { pente = (n * sxy - sx * sy) / den; orig = (sy - pente * sx) / n; }
    }
    return { nom: nom, mesure: mesure, ps: ps, best: best, pente: pente, orig: orig, t0: t0 };
  }
  function dateVisee(E, cible) {
    if (!E || E.pente == null || !cible) return null;
    var progresse = E.mesure ? E.pente > 0 : E.pente < 0; if (!progresse) return { stagne: true };
    if (E.mesure ? E.best.val >= cible : E.best.val <= cible) return { atteint: true };
    var jours = (cible - E.orig) / E.pente, d = new Date(E.t0 + jours * 86400000);
    if (d < new Date()) d = new Date(Date.now() + 7 * 86400000);
    if (d - Date.now() > 3 * 365 * 86400000) return { loin: true };
    return { date: d };
  }

  // ---------------------------------------------------------------- dessins (SVG)
  function arc(cx, cy, rr, a0, a1) {
    var p = function (a) { var t = (a - 90) * Math.PI / 180; return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)]; };
    var s = p(a0), e = p(a1), large = a1 - a0 > 180 ? 1 : 0;
    return 'M' + s[0].toFixed(2) + ' ' + s[1].toFixed(2) + ' A' + rr + ' ' + rr + ' 0 ' + large + ' 1 ' + e[0].toFixed(2) + ' ' + e[1].toFixed(2);
  }
  // Le cadran : photo au centre, anneau extérieur = indice de forme, anneau intérieur = objectif principal, graduations
  function cadran(photo, nom, forme, obj) {
    var ticks = ''; for (var i = 0; i < 60; i++) { var a = i * 6, long = i % 5 === 0, t = (a - 90) * Math.PI / 180, r1 = 142, r2 = long ? 132 : 137;
      ticks += '<line x1="' + (160 + r1 * Math.cos(t)).toFixed(1) + '" y1="' + (160 + r1 * Math.sin(t)).toFixed(1) + '" x2="' + (160 + r2 * Math.cos(t)).toFixed(1) + '" y2="' + (160 + r2 * Math.sin(t)).toFixed(1) + '" class="tj-tick' + (long ? ' is-l' : '') + '"/>'; }
    var fv = forme ? Math.max(1, Math.min(100, forme.v)) : 0, ov = obj ? Math.max(1, Math.min(100, obj)) : 0;
    var centre = photo ? '<clipPath id="tj-clip"><circle cx="160" cy="160" r="94"/></clipPath><image href="' + esc(photo) + '" x="66" y="66" width="188" height="188" clip-path="url(#tj-clip)" preserveAspectRatio="xMidYMid slice"/>'
      : '<circle cx="160" cy="160" r="94" class="tj-ava"/><text x="160" y="160" class="tj-ini" text-anchor="middle" dominant-baseline="central">' + esc(ini(nom)) + '</text>';
    return '<svg viewBox="0 0 320 320" class="tj-cadran" role="img" aria-label="Indice de forme ' + (forme ? forme.v + ' sur 100' : 'non calculé') + (obj ? ', objectif principal à ' + Math.round(obj) + ' %' : '') + '">' +
      '<circle cx="160" cy="160" r="152" class="tj-halo"/>' + ticks +
      '<path d="' + arc(160, 160, 122, 0, 359.9) + '" class="tj-track" stroke-width="10"/>' + (fv ? '<path d="' + arc(160, 160, 122, 0, fv * 3.599) + '" class="tj-arc-sun" stroke-width="10"/>' : '') +
      '<path d="' + arc(160, 160, 106, 0, 359.9) + '" class="tj-track" stroke-width="5"/>' + (ov ? '<path d="' + arc(160, 160, 106, 0, ov * 3.599) + '" class="tj-arc-herbe" stroke-width="5"/>' : '') +
      centre + '<circle cx="160" cy="160" r="94" class="tj-ring-in"/></svg>';
  }
  function jauge(v, max, label, zones) {
    // demi-cadran (charge) : zones colorées et aiguille
    var a = function (x) { return -90 + Math.max(0, Math.min(1, x / max)) * 180; };
    var z = (zones || []).map(function (q) { return '<path d="' + arc(100, 100, 80, a(q[0]) + 90 - 90, a(q[1])) + '" class="' + q[2] + '" stroke-width="14"/>'; }).join('');
    var nd = v == null ? '' : (function () { var t = (a(v) - 90) * Math.PI / 180; return '<line x1="100" y1="100" x2="' + (100 + 66 * Math.cos(t)).toFixed(1) + '" y2="' + (100 + 66 * Math.sin(t)).toFixed(1) + '" class="tj-needle"/><circle cx="100" cy="100" r="6" class="tj-needle-c"/>'; })();
    return '<svg viewBox="0 0 200 112" class="tj-jauge" role="img" aria-label="' + esc(label) + '">' + z + nd + '</svg>';
  }
  function courbe(vals, labels, opts) {
    opts = opts || {}; var etroit = typeof window !== 'undefined' && window.innerWidth < 600, W = etroit ? 360 : 900, H = etroit ? 210 : 250, L = opts.fmtY ? (etroit ? 58 : 64) : 34, R = 12, T = 14, B = 30;
    if (!vals.length) return '';
    var tous = opts.cible != null ? vals.concat([opts.cible]) : vals, mn = opts.min != null ? opts.min : Math.min.apply(null, tous), mx = Math.max.apply(null, tous); if (mx === mn) { mx = mn + 1; if (opts.min == null) mn = Math.max(0, mn - 1); }
    var x = function (i) { return L + (vals.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (vals.length - 1)); }, y = function (v) { return T + (1 - (v - mn) / (mx - mn)) * (H - T - B); };
    var grid = ''; for (var g = 0; g <= 3; g++) { var gv = mn + (mx - mn) * g / 3, gy = y(gv); grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + gy.toFixed(1) + '" y2="' + gy.toFixed(1) + '" class="tj-grid"/><text x="' + (L - 6) + '" y="' + gy.toFixed(1) + '" class="tj-ax" text-anchor="end" dominant-baseline="central">' + esc(opts.fmtY ? opts.fmtY(gv) : fmt(gv, mx - mn < 4 ? 1 : 0)) + '</text>'; }
    var line = vals.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var area = line + ' L' + x(vals.length - 1).toFixed(1) + ' ' + (H - B) + ' L' + x(0).toFixed(1) + ' ' + (H - B) + ' Z';
    var moy = ''; if (opts.moyenne && vals.length >= 3) { moy = '<path d="' + vals.map(function (v, i) { var a = vals.slice(Math.max(0, i - 2), i + 1); var m = a.reduce(function (s, q) { return s + q; }, 0) / a.length; return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(m).toFixed(1); }).join(' ') + '" class="tj-moy"/>'; }
    var dots = vals.map(function (v, i) { return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(v).toFixed(1) + '" r="' + (i === vals.length - 1 ? 5.5 : 3.5) + '" class="tj-dot' + (i === vals.length - 1 ? ' is-last' : '') + '"><title>' + esc(labels[i] + ' : ' + (opts.fmtY ? opts.fmtY(v) : fmt(v, 1))) + '</title></circle>'; }).join('');
    var step = Math.max(1, Math.ceil(vals.length / 8)), lx = labels.map(function (l, i) { return i % step === 0 || i === vals.length - 1 ? '<text x="' + x(i).toFixed(1) + '" y="' + (H - 9) + '" class="tj-ax" text-anchor="' + (i === vals.length - 1 && vals.length > 1 ? 'end' : i === 0 && vals.length > 1 ? 'start' : 'middle') + '">' + esc(l) + '</text>' : ''; }).join('');
    var cible = opts.cible != null && opts.cible >= mn && opts.cible <= mx ? '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(opts.cible).toFixed(1) + '" y2="' + y(opts.cible).toFixed(1) + '" class="tj-cible"/><text x="' + (W - R) + '" y="' + (y(opts.cible) - 6).toFixed(1) + '" class="tj-ax tj-ax-c" text-anchor="end">Objectif</text>' : '';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="tj-courbe" role="img" aria-label="' + esc(opts.label || 'Courbe') + '">' + grid + '<path d="' + area + '" class="tj-area"/><path d="' + line + '" class="tj-line"/>' + moy + cible + dots + lx + '</svg>';
  }

  // ---------------------------------------------------------------- ouverture
  function open(ctx, opts) {
    opts = opts || {}; css(); if (st) fermer();
    var root = el('div', { id: 'tj', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Ma trajectoire, le suivi de l’athlète' });
    var key = KEY + (ctx.cle || 'compte');
    st = { root: root, ctx: ctx, key: key, d: propre(lire(key)), vue: 'bord', stat: null, ep: null, back: document.activeElement, ovf: document.body.style.overflow, synchro: moi() ? '' : 'Gardé sur cet appareil' };
    if (!st.d.profil.nom && ctx.nom) st.d.profil.nom = ctx.nom;
    if (!st.d.profil.discipline && ctx.discipline) { var dk = cleDisc(ctx.discipline); if (dk) st.d.profil.discipline = dk; }
    if (!st.d.profil.club && ctx.club) st.d.profil.club = ctx.club;
    if (opts.vue) st.vue = opts.vue;
    st.onKey = function (e) { if (e.key === 'Escape') { if (root.querySelector('.tj-modal')) fermerModal(); else fermer(); } };
    document.addEventListener('keydown', st.onKey); document.body.style.overflow = 'hidden';
    document.body.appendChild(root); draw();
    lireCompte().then(function () { if (st) draw(); });
  }
  function cleDisc(nom) { var n = String(nom || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); return ORDRE.find(function (k) { var dn = DISC[k].nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); return dn === n || n.indexOf(dn.split(' ')[0]) === 0; }) || (/water/.test(n) ? 'waterpolo' : /volley/.test(n) ? 'volley' : /trail|course/.test(n) ? 'course' : /velo|cycl/.test(n) ? 'cyclisme' : /ping|table/.test(n) ? 'tennistable' : null); }
  function fermer() {
    if (!st) return; clearTimeout(st.tSync); if (st.d.maj && A() && moi() && !st.sqlMissing) envoyerCompte();
    document.removeEventListener('keydown', st.onKey); document.body.style.overflow = st.ovf || ''; st.root.remove();
    var b = st.back; st = null; if (b && b.focus) try { b.focus(); } catch (e) {}
  }
  function aller(v) { st.vue = v; draw(); var m = st.root.querySelector('.tj-main'); if (m) m.scrollTop = 0; }

  function draw() {
    if (!st) return; var r = st.root, p = st.d.profil, d = D(); r.innerHTML = '';
    var onglets = !d ? [] : [['bord', 'Tableau de bord'], [d.type === 'perf' ? 'perfs' : 'matchs', d.type === 'perf' ? 'Mes performances' : 'Mes matchs'], ['forme', 'Forme et charge'], ['objectifs', 'Objectifs'], ['profil', 'Mon profil']];
    add(r, el('header', { class: 'tj-top' },
      el('div', { class: 'tj-brand' }, el('span', { class: 'tj-k' }, 'BE+ · Suivi de l’athlète'), el('b', null, 'Ma trajectoire')),
      el('span', { class: 'tj-sync', 'aria-live': 'polite' }, st.synchro || ''),
      el('button', { type: 'button', class: 'tj-x', onclick: fermer }, 'Fermer')));
    if (onglets.length) add(r, el('nav', { class: 'tj-tabs', 'aria-label': 'Rubriques' }, onglets.map(function (o) { return el('button', { type: 'button', class: 'tj-tab' + (st.vue === o[0] ? ' is-on' : ''), 'aria-current': st.vue === o[0] ? 'page' : null, onclick: function () { aller(o[0]); } }, o[1]); })));
    var main = el('main', { class: 'tj-main' }), wrap = el('div', { class: 'tj-wrap' }); add(main, wrap); add(r, main);
    if (!d || st.vue === 'profil') { add(wrap, vueProfil(!d)); return; }
    if (st.vue === 'matchs') add(wrap, vueMatchs());
    else if (st.vue === 'perfs') add(wrap, vuePerfs());
    else if (st.vue === 'forme') add(wrap, vueForme());
    else if (st.vue === 'objectifs') add(wrap, vueObjectifs());
    else add(wrap, d.type === 'perf' ? bordPerf() : bordMatchs());
  }

  // ---------------------------------------------------------------- tableau de bord (sports d'équipe, duels)
  function bordMatchs() {
    var d = D(), p = st.d.profil, T = totaux(), t = T.t, forme = indiceForme(), ch = charges(), duel = d.type === 'duel';
    var obj0 = st.d.objectifs.find(function (o) { return o.stat; }), P0 = obj0 ? projection(obj0, T) : null;
    var kpis = duel ? [['Matchs', T.n], ['Victoires', t.victoires], ['Défaites', t.defaites], [libelleStat(d.champs[0].k), t[d.champs[0].k]]]
      : [['Matchs', T.n], [libelleStat(d.principal), t[d.principal]], d.duree ? ['Minutes', T.minutes] : [libelleStat(d.champs[1].k), t[d.champs[1].k]], ['Note moyenne', moyNote(T.ms)]];
    var hero = el('section', { class: 'tj-hero' },
      el('div', { class: 'tj-hero-id' },
        el('span', { class: 'tj-k' }, [d.nom, p.poste].filter(Boolean).join(' · ')),
        el('h1', { class: 'tj-nom' }, p.nom || 'Mon profil d’athlète'),
        el('div', { class: 'tj-muted-i' }, [p.club, 'Saison ' + saisonTxt()].filter(Boolean).join(' · '))),
      el('div', { class: 'tj-hero-g' },
        el('div', { class: 'tj-orbits' }, kpis.slice(0, 2).map(orbite)),
        el('div', { class: 'tj-cad', html: cadran(st.ctx.photo, p.nom, forme, P0 ? P0.actuel / (P0.cible || 1) * 100 : 0) }),
        el('div', { class: 'tj-orbits' }, kpis.slice(2).map(orbite))),
      el('div', { class: 'tj-legende' },
        el('span', null, el('i', { class: 'tj-pt tj-pt-sun' }), 'Indice de forme : ', el('b', null, forme ? forme.v + '/100' : 'à remplir')),
        el('span', null, el('i', { class: 'tj-pt tj-pt-herbe' }), obj0 ? 'Objectif « ' + libelleStat(obj0.stat) + ' » : ' : 'Objectif principal : ', el('b', null, P0 ? fmt(P0.actuel) + ' / ' + fmt(P0.cible) : 'à fixer'))),
      el('div', { class: 'tj-hero-a' },
        el('button', { type: 'button', class: 'tj-btn', onclick: function () { formMatch(); } }, duel ? '+ Ajouter un match' : '+ Ajouter un match'),
        el('button', { type: 'button', class: 'tj-btn tj-ghost-w', onclick: function () { formBilan(); } }, 'Mon bilan du jour')));
    var out = [hero];
    if (!T.n) { out.push(info('Votre tableau de bord se remplit avec vos matchs. Ajoutez le premier : la date, l’adversaire, vos minutes et vos chiffres. Tout reste privé tant que vous ne demandez pas à les publier.')); }
    // le futur : projections
    out.push(blocFutur(T));
    // ratios de la discipline
    if (T.n) {
      var rs = d.ratios(t, T.n, T.minutes).filter(function (x) { return x && x.v != null && !(x.v.pct == null && typeof x.v === 'object'); });
      out.push(el('section', { class: 'tj-box' }, el('h2', { class: 'tj-h2' }, 'Mes indicateurs ', el('small', null, d.nom)),
        el('div', { class: 'tj-ratios' }, rs.map(function (x) { var isP = x.v && typeof x.v === 'object'; var v = isP ? x.v.pct : x.v;
          return el('div', { class: 'tj-ratio' }, isP ? el('div', { class: 'tj-ring-s', html: mini(v) }) : null, el('div', { class: 'tj-ratio-v' }, isP ? fmt(v) + ' %' : fmt(v, x.dec) + x.u), el('div', { class: 'tj-ratio-l' }, x.l)); }))));
      // courbe
      out.push(blocCourbe(T));
      // totaux détaillés
      out.push(el('section', { class: 'tj-box' }, el('h2', { class: 'tj-h2' }, 'Ma saison en chiffres'),
        el('div', { class: 'tj-barres' }, d.champs.filter(function (c) { return !c.g || /gardien/i.test(p.poste); }).map(function (c) { var v = t[c.k], mx = Math.max.apply(null, d.champs.map(function (q) { return t[q.k]; }).concat([1]));
          return el('div', { class: 'tj-barre' }, el('span', { class: 'tj-barre-l' }, c.l), el('span', { class: 'tj-barre-t' }, el('i', { style: 'width:' + Math.max(v ? 3 : 0, v / mx * 100).toFixed(1) + '%' })), el('b', { class: 'tj-barre-v' }, fmt(v)), el('span', { class: 'tj-barre-m' }, T.n ? fmt(v / T.n, 1) + ' / match' : '')); }))));
    }
    out.push(blocCharge(ch, forme));
    out.push(blocPartage(T));
    return out;
  }
  function orbite(k) { return el('div', { class: 'tj-orb' }, el('div', { class: 'tj-orb-v' }, typeof k[1] === 'number' ? fmt(k[1]) : (k[1] || '—')), el('div', { class: 'tj-orb-l' }, k[0])); }
  function moyNote(ms) { var n = ms.filter(function (m) { return num(m.note) > 0; }); return n.length ? fmt(n.reduce(function (a, m) { return a + num(m.note); }, 0) / n.length, 1) : '—'; }
  function mini(p) { var v = Math.max(0, Math.min(100, p)); return '<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" class="tj-track" stroke-width="5" fill="none"/>' + (v ? '<path d="' + arc(22, 22, 18, 0, Math.max(1, v * 3.599)) + '" class="tj-arc-sun" stroke-width="5"/>' : '') + '</svg>'; }
  function saisonTxt() { var f = jourDe(st.d.profil.finSaison || finSaisonDefaut()); return (f.getFullYear() - 1) + '–' + String(f.getFullYear()).slice(2); }
  function info(t, warn) { return el('p', { class: 'tj-info' + (warn ? ' is-warn' : '') }, t); }

  function blocFutur(T) {
    var box = el('section', { class: 'tj-box tj-futur' }, el('div', { class: 'tj-box-h' }, el('div', null, el('span', { class: 'tj-k tj-k-ink' }, 'Le futur'), el('h2', { class: 'tj-h2' }, 'Ma projection de fin de saison')),
      el('button', { type: 'button', class: 'tj-btn tj-btn-s tj-ghost', onclick: function () { aller('objectifs'); } }, 'Gérer mes objectifs')));
    var objs = st.d.objectifs.filter(function (o) { return o.stat; });
    if (!objs.length) { add(box, info('Fixez un objectif pour la saison (par exemple 15 buts, 60 % de victoires en nombre de matchs gagnés, 1 200 minutes) : Casa calcule où vous mène votre rythme actuel et ce qu’il faut faire par match pour l’atteindre.')); return box; }
    if (!num(st.d.profil.matchsPrevus)) add(box, info('Indiquez dans « Mon profil » le nombre de matchs prévus dans la saison : sans lui, la projection ne peut pas être calculée.', true));
    var ETAT = { atteint: ['Objectif atteint', 'is-ok'], enavance: ['En route', 'is-ok'], juste: ['Ça se joue', 'is-mid'], retard: ['À accélérer', 'is-low'], inconnu: ['Projection à venir', 'is-mid'] };
    add(box, el('div', { class: 'tj-projs' }, objs.map(function (o) {
      var P = projection(o, T), e = ETAT[P.etat], mx = Math.max(P.cible, P.projete || 0, P.actuel, 1);
      return el('div', { class: 'tj-proj' },
        el('div', { class: 'tj-proj-h' }, el('b', null, libelleStat(o.stat)), el('span', { class: 'tj-etat ' + e[1] }, e[0])),
        el('div', { class: 'tj-proj-bar' }, el('i', { class: 'tj-proj-a', style: 'width:' + (P.actuel / mx * 100).toFixed(1) + '%' }), P.projete != null ? el('i', { class: 'tj-proj-p', style: 'width:' + (Math.min(P.projete, mx) / mx * 100).toFixed(1) + '%' }) : null, el('i', { class: 'tj-proj-c', style: 'left:' + (P.cible / mx * 100).toFixed(1) + '%' })),
        el('div', { class: 'tj-proj-n' }, el('span', null, 'Aujourd’hui ', el('b', null, fmt(P.actuel))), el('span', null, 'Projeté ', el('b', null, P.projete != null ? fmt(P.projete) : '—')), el('span', null, 'Objectif ', el('b', null, fmt(P.cible)))),
        el('p', { class: 'tj-proj-t' }, P.etat === 'atteint' ? 'Bravo, c’est fait. Pensez à relever la barre.' : P.restants ? 'Rythme actuel : ' + fmt(P.rythme, 2) + ' par match. Pour y arriver : ' + fmt(P.besoin, 2) + ' par match sur les ' + P.restants + ' restants.' : (P.projete == null ? '' : 'Plus de match prévu cette saison d’après votre profil.')));
    })));
    add(box, el('p', { class: 'tj-note' }, 'Calcul : total actuel + (moyenne par match × matchs restants). C’est une tendance, pas une promesse : blessures, temps de jeu et adversaires la feront bouger.'));
    return box;
  }
  function blocCourbe(T) {
    var d = D(), choix = (d.type === 'duel' ? [{ k: 'setsG' }] : []).concat(d.champs.filter(function (c) { return !c.g || /gardien/i.test(st.d.profil.poste); })).map(function (c) { return c.k; });
    if (d.duree) choix.push('minutes');
    if (!st.stat || choix.indexOf(st.stat) < 0) st.stat = d.principal === 'victoires' ? choix[0] : d.principal;
    var ms = T.ms.slice(-15), vals = ms.map(function (m) { return valeurStat(m, st.stat); }), labs = ms.map(function (m) { return dateCourte(m.date); });
    return el('section', { class: 'tj-box' }, el('div', { class: 'tj-box-h' }, el('h2', { class: 'tj-h2' }, 'Ma courbe ', el('small', null, 'les 15 derniers matchs')),
      el('label', { class: 'tj-sel-l' }, 'Statistique ', el('select', { class: 'tj-in tj-in-s', onchange: function (e) { st.stat = e.target.value; draw(); } }, uniq(choix).map(function (k) { return el('option', { value: k, selected: k === st.stat ? 'selected' : null }, libelleStat(k)); })))),
      el('div', { html: courbe(vals, labs, { moyenne: true, min: 0, label: 'Évolution : ' + libelleStat(st.stat) }) }),
      el('p', { class: 'tj-note' }, el('i', { class: 'tj-pt tj-pt-sun' }), 'Par match  ', el('i', { class: 'tj-pt tj-pt-ligne' }), 'Moyenne sur 3 matchs'));
  }
  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }

  function blocCharge(ch, forme) {
    var zones = [[0, 0.8, 'tj-z-bas'], [0.8, 1.3, 'tj-z-ok'], [1.3, 1.5, 'tj-z-mid'], [1.5, 2, 'tj-z-haut']];
    var txt = ch.ratio == null ? (ch.jours ? 'Encore ' + Math.max(1, 21 - ch.jours) + ' jour' + (21 - ch.jours > 1 ? 's' : '') + ' de séances notées pour comparer votre semaine à vos habitudes.' : 'Notez vos séances (durée et intensité ressentie) pour suivre votre charge.')
      : ch.ratio < 0.8 ? 'Semaine plus légère que d’habitude.' : ch.ratio <= 1.3 ? 'Semaine dans vos habitudes : zone favorable.' : ch.ratio <= 1.5 ? 'Semaine plus chargée que d’habitude : restez attentif à la récupération.' : 'Hausse brutale de la charge : parlez-en à votre coach ou préparateur.';
    return el('section', { class: 'tj-box tj-duo' },
      el('div', null, el('span', { class: 'tj-k tj-k-ink' }, 'Forme'), el('h2', { class: 'tj-h2' }, 'Mes 7 derniers jours'),
        forme ? el('div', { class: 'tj-fsum' }, el('div', null, el('b', null, fmt(forme.forme, 1)), el('span', null, 'forme /10')), el('div', null, el('b', null, fmt(forme.sommeil, 1) + ' h'), el('span', null, 'de sommeil')), el('div', null, el('b', null, fmt(forme.douleur, 1)), el('span', null, 'douleur /10')))
          : info('Pas encore de bilan cette semaine. Trois curseurs, dix secondes : forme, sommeil, douleur.'),
        el('button', { type: 'button', class: 'tj-btn tj-btn-s', onclick: function () { formBilan(); } }, 'Mon bilan du jour')),
      el('div', null, el('span', { class: 'tj-k tj-k-ink' }, 'Charge'), el('h2', { class: 'tj-h2' }, 'Semaine / habitude'),
        el('div', { class: 'tj-jauge-w', html: jauge(ch.ratio, 2, 'Rapport de charge ' + (ch.ratio == null ? 'non calculé' : fmt(ch.ratio, 2)), zones) }),
        el('div', { class: 'tj-jauge-v' }, ch.ratio == null ? '—' : fmt(ch.ratio, 2)),
        el('p', { class: 'tj-proj-t' }, txt),
        el('button', { type: 'button', class: 'tj-btn tj-btn-s tj-ghost', onclick: function () { formSeance(); } }, '+ Noter une séance')));
  }
  function blocPartage(T) {
    return el('section', { class: 'tj-box tj-partage' }, el('div', null, el('span', { class: 'tj-k tj-k-ink' }, 'Ma fiche publique'), el('h2', { class: 'tj-h2' }, 'Mes chiffres sur Casa Besports'),
      el('p', { class: 'tj-proj-t' }, 'Vos données restent privées. Si vous avez (ou voulez) une fiche joueur sur le site, envoyez vos totaux de la saison : l’équipe les vérifie auprès de votre club avant de les afficher.')),
      el('div', { class: 'tj-row' }, el('button', { type: 'button', class: 'tj-btn', disabled: (T && !T.n && !st.d.perfs.length) ? 'disabled' : null, onclick: proposer }, 'Proposer mes chiffres'), el('button', { type: 'button', class: 'tj-btn tj-ghost', onclick: exporter }, 'Exporter (tableur)')));
  }

  // ---------------------------------------------------------------- tableau de bord (performances)
  function bordPerf() {
    var d = D(), p = st.d.profil, forme = indiceForme(), ch = charges();
    var noms = uniq(st.d.perfs.map(function (x) { return x.epreuve; })), Es = noms.map(epreuve).filter(Boolean);
    if (!st.ep || noms.indexOf(st.ep) < 0) st.ep = noms[0] || null;
    var E = st.ep ? epreuve(st.ep) : null, obj = st.ep ? st.d.objectifs.find(function (o) { return o.epreuve === st.ep; }) : null, cible = obj ? lireValeur(obj.cible) : null;
    var pctObj = E && cible ? Math.max(0, Math.min(100, E.mesure ? E.best.val / cible * 100 : cible / E.best.val * 100)) : 0;
    var saisonPs = saison(st.d.perfs);
    var hero = el('section', { class: 'tj-hero' },
      el('div', { class: 'tj-hero-id' }, el('span', { class: 'tj-k' }, [d.nom, p.poste].filter(Boolean).join(' · ')), el('h1', { class: 'tj-nom' }, p.nom || 'Mon profil d’athlète'), el('div', { class: 'tj-muted-i' }, [p.club, 'Saison ' + saisonTxt()].filter(Boolean).join(' · '))),
      el('div', { class: 'tj-hero-g' },
        el('div', { class: 'tj-orbits' }, [['Courses / concours', saisonPs.length], ['Épreuves', noms.length]].map(orbite)),
        el('div', { class: 'tj-cad', html: cadran(st.ctx.photo, p.nom, forme, pctObj) }),
        el('div', { class: 'tj-orbits' }, [['Record ' + (st.ep || ''), E ? ecrireValeur(E.best.val, E.mesure) : '—'], ['Records cette saison', Es.filter(function (x) { return saisonPs.indexOf(x.best) >= 0; }).length]].map(orbite))),
      el('div', { class: 'tj-legende' }, el('span', null, el('i', { class: 'tj-pt tj-pt-sun' }), 'Indice de forme : ', el('b', null, forme ? forme.v + '/100' : 'à remplir')), el('span', null, el('i', { class: 'tj-pt tj-pt-herbe' }), 'Objectif ' + (st.ep || '') + ' : ', el('b', null, cible ? ecrireValeur(cible, E && E.mesure) : 'à fixer'))),
      el('div', { class: 'tj-hero-a' }, el('button', { type: 'button', class: 'tj-btn', onclick: function () { formPerf(); } }, '+ Ajouter une performance'), el('button', { type: 'button', class: 'tj-btn tj-ghost-w', onclick: function () { formBilan(); } }, 'Mon bilan du jour')));
    var out = [hero];
    if (!E) { out.push(info('Ajoutez vos chronos ou vos mesures, épreuve par épreuve (date, épreuve, résultat, lieu). Casa trace votre progression, garde vos records et estime quand vous pourriez atteindre votre objectif.')); }
    else {
      var vise = dateVisee(E, cible);
      out.push(el('section', { class: 'tj-box tj-futur' }, el('div', { class: 'tj-box-h' }, el('div', null, el('span', { class: 'tj-k tj-k-ink' }, 'Le futur'), el('h2', { class: 'tj-h2' }, 'Ma progression')),
        noms.length > 1 ? el('label', { class: 'tj-sel-l' }, 'Épreuve ', el('select', { class: 'tj-in tj-in-s', onchange: function (e) { st.ep = e.target.value; draw(); } }, noms.map(function (n) { return el('option', { value: n, selected: n === st.ep ? 'selected' : null }, n); }))) : null),
        el('div', { html: courbe(E.ps.map(function (x) { return x.val; }), E.ps.map(function (x) { return dateCourte(x.date); }), { label: 'Progression ' + E.nom, cible: cible, fmtY: function (v) { return ecrireValeur(v, E.mesure); } }) }),
        el('div', { class: 'tj-fsum' }, el('div', null, el('b', null, ecrireValeur(E.best.val, E.mesure)), el('span', null, 'record, ' + dateCourte(E.best.date) + ' ' + jourDe(E.best.date).getFullYear())), el('div', null, el('b', null, ecrireValeur(E.ps[E.ps.length - 1].val, E.mesure)), el('span', null, 'dernière, ' + dateCourte(E.ps[E.ps.length - 1].date))), el('div', null, el('b', null, cible ? ecrireValeur(cible, E.mesure) : '—'), el('span', null, 'objectif'))),
        el('p', { class: 'tj-proj-t' }, !cible ? 'Fixez un objectif pour cette épreuve dans « Objectifs » : Casa estime la date où votre tendance l’atteint.' : !vise ? 'Il faut au moins 3 résultats sur 2 semaines ou plus pour estimer une tendance.' : vise.atteint ? 'Objectif déjà atteint : bravo. Fixez la marche suivante.' : vise.stagne ? 'Votre tendance ne progresse pas encore vers l’objectif : c’est le moment d’en parler avec votre entraîneur.' : vise.loin ? 'Au rythme actuel, l’objectif est à plus de trois ans : visez une étape intermédiaire.' : 'Au rythme actuel de progression, objectif atteint vers ' + MOIS[vise.date.getMonth()] + ' ' + vise.date.getFullYear() + '.'),
        el('p', { class: 'tj-note' }, 'Calcul : droite de tendance de vos résultats dans le temps. Une estimation, pas une promesse.')));
      out.push(el('section', { class: 'tj-box' }, el('h2', { class: 'tj-h2' }, 'Mes records'), el('div', { class: 'tj-ratios' }, Es.map(function (x) { return el('div', { class: 'tj-ratio' }, el('div', { class: 'tj-ratio-v' }, ecrireValeur(x.best.val, x.mesure)), el('div', { class: 'tj-ratio-l' }, x.nom + ' · ' + dateCourte(x.best.date) + ' ' + jourDe(x.best.date).getFullYear())); }))));
    }
    out.push(blocCharge(ch, forme));
    out.push(blocPartage(null));
    return out;
  }

  // ---------------------------------------------------------------- listes
  function vueMatchs() {
    var d = D(), ms = tri(st.d.matchs).reverse(), duel = d.type === 'duel';
    var box = el('section', { class: 'tj-box' }, el('div', { class: 'tj-box-h' }, el('h2', { class: 'tj-h2' }, 'Mes matchs ', el('small', null, ms.length + ' au total')), el('button', { type: 'button', class: 'tj-btn', onclick: function () { formMatch(); } }, '+ Ajouter un match')));
    if (!ms.length) { add(box, info('Aucun match noté pour l’instant.')); return box; }
    add(box, el('ul', { class: 'tj-list' }, ms.map(function (m) {
      var resume = d.champs.filter(function (c) { return num(m.s && m.s[c.k]); }).slice(0, 4).map(function (c) { return num(m.s[c.k]) + ' ' + c.l.toLowerCase(); }).join(' · ');
      return el('li', { class: 'tj-li' }, el('div', { class: 'tj-li-d' }, el('b', null, dateCourte(m.date)), el('span', null, jourDe(m.date).getFullYear())),
        el('div', { class: 'tj-li-m' }, el('b', null, (m.res ? { V: 'Victoire', D: 'Défaite', N: 'Nul' }[m.res] + ' · ' : '') + (m.adv || 'Adversaire non précisé') + (m.score ? ' (' + m.score + ')' : '')), el('span', null, [m.comp, !duel && m.min ? m.min + ' min' : '', resume, m.note ? 'note ' + m.note + '/10' : ''].filter(Boolean).join(' · '))),
        el('div', { class: 'tj-li-a' }, el('button', { type: 'button', class: 'tj-lnk', onclick: function () { formMatch(m); } }, 'Modifier')));
    })));
    return box;
  }
  function vuePerfs() {
    var ps = tri(st.d.perfs).reverse();
    var box = el('section', { class: 'tj-box' }, el('div', { class: 'tj-box-h' }, el('h2', { class: 'tj-h2' }, 'Mes performances ', el('small', null, ps.length + ' au total')), el('button', { type: 'button', class: 'tj-btn', onclick: function () { formPerf(); } }, '+ Ajouter une performance')));
    if (!ps.length) { add(box, info('Aucune performance notée pour l’instant.')); return box; }
    var records = {}; uniq(ps.map(function (x) { return x.epreuve; })).forEach(function (n) { var E = epreuve(n); if (E) records[E.best.id] = true; });
    add(box, el('ul', { class: 'tj-list' }, ps.map(function (x) {
      return el('li', { class: 'tj-li' }, el('div', { class: 'tj-li-d' }, el('b', null, dateCourte(x.date)), el('span', null, jourDe(x.date).getFullYear())),
        el('div', { class: 'tj-li-m' }, el('b', null, x.epreuve + ' · ' + ecrireValeur(x.val, MESURE.test(x.epreuve)) + (records[x.id] ? '  ★ record' : '')), el('span', null, [x.lieu, x.comp].filter(Boolean).join(' · '))),
        el('div', { class: 'tj-li-a' }, el('button', { type: 'button', class: 'tj-lnk', onclick: function () { formPerf(x); } }, 'Modifier')));
    })));
    return box;
  }
  function vueForme() {
    var forme = indiceForme(), ch = charges(), b = tri(st.d.bilans).slice(-28), s = tri(st.d.seances).reverse().slice(0, 30);
    var out = [blocCharge(ch, forme)];
    if (b.length >= 2) out.push(el('section', { class: 'tj-box' }, el('h2', { class: 'tj-h2' }, 'Ma forme ', el('small', null, '4 dernières semaines')), el('div', { html: courbe(b.map(function (x) { return num(x.forme); }), b.map(function (x) { return dateCourte(x.date); }), { min: 1, moyenne: true, label: 'Forme ressentie sur 10' }) })));
    out.push(el('section', { class: 'tj-box' }, el('div', { class: 'tj-box-h' }, el('h2', { class: 'tj-h2' }, 'Mes séances'), el('button', { type: 'button', class: 'tj-btn tj-btn-s', onclick: function () { formSeance(); } }, '+ Noter une séance')),
      s.length ? el('ul', { class: 'tj-list' }, s.map(function (x) { return el('li', { class: 'tj-li' }, el('div', { class: 'tj-li-d' }, el('b', null, dateCourte(x.date))), el('div', { class: 'tj-li-m' }, el('b', null, x.type || 'Séance'), el('span', null, x.duree + ' min · intensité ' + x.rpe + '/10 · charge ' + fmt(num(x.duree) * num(x.rpe)))), el('div', { class: 'tj-li-a' }, el('button', { type: 'button', class: 'tj-lnk', onclick: function () { formSeance(x); } }, 'Modifier'))); })) : info('Aucune séance notée.')));
    out.push(el('p', { class: 'tj-note' }, 'Indice de forme (sur 100) : moyenne des 7 derniers jours, forme ressentie pour 40 %, sommeil pour 30 % (8 h et plus = plein), absence de douleur pour 30 %. Charge d’une séance = durée en minutes × intensité ressentie de 1 à 10. Le rapport compare la semaine écoulée à la moyenne des 4 dernières semaines. Ces repères aident à dialoguer avec votre coach : ils ne remplacent pas l’avis d’un médecin. En cas de douleur qui dure, consultez.'));
    return out;
  }
  function vueObjectifs() {
    var d = D(), perf = d.type === 'perf';
    var box = el('section', { class: 'tj-box' }, el('div', { class: 'tj-box-h' }, el('div', null, el('span', { class: 'tj-k tj-k-ink' }, 'Le futur'), el('h2', { class: 'tj-h2' }, 'Mes objectifs de la saison')), el('button', { type: 'button', class: 'tj-btn', onclick: function () { formObjectif(); } }, '+ Ajouter un objectif')));
    var os = st.d.objectifs.filter(function (o) { return perf ? o.epreuve : o.stat; });
    if (!os.length) add(box, info(perf ? 'Choisissez une épreuve et le chrono (ou la mesure) visé : par exemple 100 m nage libre en 1:02,00.' : 'Choisissez une statistique et un chiffre pour la saison : par exemple 15 buts, 20 victoires ou 1 500 minutes.'));
    else add(box, el('ul', { class: 'tj-list' }, os.map(function (o) { return el('li', { class: 'tj-li' }, el('div', { class: 'tj-li-m' }, el('b', null, perf ? o.epreuve + ' : ' + ecrireValeur(lireValeur(o.cible), MESURE.test(o.epreuve)) : libelleStat(o.stat) + ' : ' + fmt(num(o.cible))), el('span', null, o.pourquoi || '')), el('div', { class: 'tj-li-a' }, el('button', { type: 'button', class: 'tj-lnk', onclick: function () { formObjectif(o); } }, 'Modifier'))); })));
    var out = [box];
    if (!perf) out.push(blocFutur(totaux()));
    return out;
  }
  function vueProfil(premier) {
    var p = st.d.profil, f = { nom: p.nom, discipline: p.discipline, poste: p.poste, club: p.club, finSaison: p.finSaison || finSaisonDefaut(), matchsPrevus: p.matchsPrevus };
    var inpNom = el('input', { class: 'tj-in', value: f.nom, maxlength: '80', placeholder: 'Prénom et nom', oninput: function (e) { f.nom = e.target.value; } });
    var selPoste = el('select', { class: 'tj-in' });
    function postes() { selPoste.innerHTML = ''; var d = DISC[f.discipline]; add(selPoste, el('option', { value: '' }, d && d.type === 'perf' ? 'Spécialité (facultatif)' : 'Poste ou catégorie')); var list = d ? (d.postes || d.epreuves || []) : []; list.forEach(function (x) { add(selPoste, el('option', { value: x, selected: x === f.poste ? 'selected' : null }, x)); }); if (f.poste && list.indexOf(f.poste) < 0) add(selPoste, el('option', { value: f.poste, selected: 'selected' }, f.poste)); }
    selPoste.addEventListener('change', function (e) { f.poste = e.target.value; });
    var grille = el('div', { class: 'tj-discs', role: 'radiogroup', 'aria-label': 'Discipline' }, ORDRE.map(function (k) { return el('button', { type: 'button', role: 'radio', 'aria-checked': f.discipline === k ? 'true' : 'false', class: 'tj-disc' + (f.discipline === k ? ' is-on' : ''), onclick: function (e) { f.discipline = k; f.poste = ''; Array.prototype.forEach.call(grille.children, function (b) { b.classList.remove('is-on'); b.setAttribute('aria-checked', 'false'); }); e.currentTarget.classList.add('is-on'); e.currentTarget.setAttribute('aria-checked', 'true'); postes(); } }, DISC[k].nom); }));
    postes();
    var change = p.discipline && (st.d.matchs.length || st.d.perfs.length);
    return el('section', { class: 'tj-box tj-profil' },
      premier ? el('div', { class: 'tj-intro' }, el('span', { class: 'tj-k tj-k-ink' }, 'Bienvenue'), el('h1', { class: 'tj-h1' }, 'Votre saison, vue d’en haut'), el('p', null, 'Notez vos matchs ou vos performances, votre forme et vos objectifs. Casa calcule vos indicateurs, trace votre progression et projette votre fin de saison. Tout reste privé, sur votre appareil et dans votre compte.')) : el('h2', { class: 'tj-h2' }, 'Mon profil d’athlète'),
      lab('Nom affiché', inpNom), el('div', { class: 'tj-lbl' }, 'Discipline'), grille,
      change ? el('p', { class: 'tj-note' }, 'Changer de discipline garde vos anciennes données, mais le tableau de bord n’affiche que la discipline choisie.') : null,
      el('div', { class: 'tj-cols' }, lab('Poste, catégorie ou spécialité', selPoste), lab('Club', el('input', { class: 'tj-in', value: f.club, maxlength: '80', placeholder: 'Nom du club', oninput: function (e) { f.club = e.target.value; } }))),
      el('div', { class: 'tj-cols' }, lab('Fin de la saison', el('input', { class: 'tj-in', type: 'date', value: f.finSaison, onchange: function (e) { f.finSaison = e.target.value; } })), lab('Matchs prévus dans la saison (championnat + coupes)', el('input', { class: 'tj-in', type: 'number', min: '0', max: '200', inputmode: 'numeric', value: f.matchsPrevus, placeholder: 'ex. 22', oninput: function (e) { f.matchsPrevus = e.target.value; } }))),
      el('div', { class: 'tj-row tj-foot' }, el('button', { type: 'button', class: 'tj-btn', onclick: function () {
        if (!f.discipline) { say('Choisissez votre discipline.'); return; }
        st.d.profil = Object.assign(st.d.profil, { nom: f.nom.trim().slice(0, 80), discipline: f.discipline, poste: f.poste, club: (f.club || '').trim().slice(0, 80), finSaison: f.finSaison || finSaisonDefaut(), matchsPrevus: String(Math.max(0, Math.min(200, Math.round(num(f.matchsPrevus)))) || '') });
        sauver(); say('Profil enregistré'); aller('bord'); } }, premier ? 'C’est parti' : 'Enregistrer'),
        !premier ? el('button', { type: 'button', class: 'tj-btn tj-danger', onclick: toutEffacer }, 'Tout effacer') : null),
      el('p', { class: 'tj-note' }, moi() ? 'Connecté : vos données sont copiées dans votre compte, visibles de vous seul.' : 'Non connecté : vos données restent sur cet appareil. Connectez-vous pour les retrouver sur votre téléphone et votre ordinateur.'));
  }
  function lab(t, inp) { return el('label', { class: 'tj-lab' }, el('span', { class: 'tj-lbl' }, t), inp); }

  // ---------------------------------------------------------------- formulaires (fenêtres)
  function modal(titre, corps, ok, supprimer) {
    fermerModal();
    var m = el('div', { class: 'tj-modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': titre },
      el('div', { class: 'tj-modal-in' }, el('div', { class: 'tj-box-h' }, el('h2', { class: 'tj-h2' }, titre), el('button', { type: 'button', class: 'tj-lnk', onclick: fermerModal }, 'Annuler')),
        corps, el('div', { class: 'tj-row tj-foot' }, el('button', { type: 'button', class: 'tj-btn', onclick: ok }, 'Enregistrer'), supprimer ? el('button', { type: 'button', class: 'tj-btn tj-danger', onclick: supprimer }, 'Supprimer') : null)));
    m.addEventListener('click', function (e) { if (e.target === m) fermerModal(); });
    st.root.appendChild(m); var f = m.querySelector('input, select, textarea'); if (f) f.focus();
  }
  function fermerModal() { var m = st && st.root.querySelector('.tj-modal'); if (m) m.remove(); }
  function champNum(o, k, l) { return lab(l, el('input', { class: 'tj-in', type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: o[k] == null ? '' : o[k], oninput: function (e) { o[k] = e.target.value; } })); }
  function retirer(list, x, quoi) { if (!window.confirm('Supprimer ' + quoi + ' ?')) return; var i = st.d[list].indexOf(x); if (i >= 0) st.d[list].splice(i, 1); sauver(); fermerModal(); draw(); }

  function formMatch(m) {
    var d = D(), duel = d.type === 'duel', o = m ? JSON.parse(JSON.stringify(m)) : { id: nid(), date: auj(), adv: '', comp: '', score: '', res: '', min: d.duree ? String(d.duree) : '', note: '', s: {} };
    o.s = o.s || {};
    var gardien = /gardien/i.test(st.d.profil.poste);
    var champs = d.champs.filter(function (c) { return !c.g || gardien; });
    var corps = el('div', null,
      el('div', { class: 'tj-cols' }, lab('Date', el('input', { class: 'tj-in', type: 'date', value: o.date, onchange: function (e) { o.date = e.target.value; } })), lab(duel ? 'Adversaire (et son classement)' : 'Adversaire', el('input', { class: 'tj-in', value: o.adv, maxlength: '80', oninput: function (e) { o.adv = e.target.value; } }))),
      el('div', { class: 'tj-cols' }, lab('Compétition', el('input', { class: 'tj-in', value: o.comp, maxlength: '80', placeholder: 'Championnat, coupe, amical…', oninput: function (e) { o.comp = e.target.value; } })), lab('Score', el('input', { class: 'tj-in', value: o.score, maxlength: '40', placeholder: duel ? '6-4 3-6 7-5' : '2-1', oninput: function (e) { o.score = e.target.value; } }))),
      el('div', { class: 'tj-lbl' }, 'Résultat'), el('div', { class: 'tj-seg' }, [['V', 'Victoire'], ['N', duel ? null : 'Nul'], ['D', 'Défaite']].filter(function (x) { return x[1]; }).map(function (x) { return el('button', { type: 'button', class: 'tj-segb' + (o.res === x[0] ? ' is-on' : ''), 'aria-pressed': o.res === x[0] ? 'true' : 'false', onclick: function (e) { o.res = o.res === x[0] ? '' : x[0]; Array.prototype.forEach.call(e.currentTarget.parentNode.children, function (b) { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); }); if (o.res) { e.currentTarget.classList.add('is-on'); e.currentTarget.setAttribute('aria-pressed', 'true'); } } }, x[1]); })),
      el('div', { class: 'tj-lbl' }, 'Mes chiffres'),
      el('div', { class: 'tj-grid3' }, (d.duree ? [champNum(o, 'min', 'Minutes jouées')] : []).concat(champs.map(function (c) { return champNum(o.s, c.k, c.l); }))),
      lab('Ma note du match (1 à 10, ressenti)', el('input', { class: 'tj-in', type: 'number', min: '1', max: '10', step: '0.5', value: o.note, oninput: function (e) { o.note = e.target.value; } })));
    modal(m ? 'Modifier le match' : 'Ajouter un match', corps, function () {
      if (!o.date) { say('Indiquez la date du match.'); return; }
      o.adv = String(o.adv || '').trim(); o.comp = String(o.comp || '').trim();
      if (o.note) o.note = String(Math.max(1, Math.min(10, num(o.note))));
      Object.keys(o.s).forEach(function (k) { if (o.s[k] === '' || o.s[k] == null) delete o.s[k]; else o.s[k] = String(Math.max(0, num(o.s[k]))); });
      if (m) st.d.matchs[st.d.matchs.indexOf(m)] = o; else st.d.matchs.push(o);
      sauver(); fermerModal(); say('Match enregistré'); draw();
    }, m ? function () { retirer('matchs', m, 'ce match'); } : null);
  }
  function formPerf(x) {
    var d = D(), o = x ? Object.assign({}, x) : { id: nid(), date: auj(), epreuve: st.ep || (d.epreuves || [])[0] || '', val: null, txt: '', lieu: '', comp: '' };
    o.txt = o.txt || (o.val != null ? ecrireValeur(o.val, MESURE.test(o.epreuve)).replace(/ s$| m$/, '') : '');
    var dl = el('datalist', { id: 'tj-eps' }, uniq((d.epreuves || []).concat(st.d.perfs.map(function (p) { return p.epreuve; }))).map(function (e) { return el('option', { value: e }); }));
    var aide = el('p', { class: 'tj-note' });
    function majAide() { aide.textContent = MESURE.test(o.epreuve) ? 'Mesure en mètres, par exemple 6,42.' : 'Chrono : 12,45 (secondes), 1:02,35 (minutes:secondes) ou 1h05:30.'; }
    majAide();
    var corps = el('div', null, dl,
      el('div', { class: 'tj-cols' }, lab('Date', el('input', { class: 'tj-in', type: 'date', value: o.date, onchange: function (e) { o.date = e.target.value; } })), lab('Épreuve', el('input', { class: 'tj-in', list: 'tj-eps', value: o.epreuve, maxlength: '60', oninput: function (e) { o.epreuve = e.target.value; majAide(); } }))),
      lab('Résultat', el('input', { class: 'tj-in', value: o.txt, maxlength: '20', inputmode: 'decimal', oninput: function (e) { o.txt = e.target.value; } })), aide,
      el('div', { class: 'tj-cols' }, lab('Lieu', el('input', { class: 'tj-in', value: o.lieu, maxlength: '80', oninput: function (e) { o.lieu = e.target.value; } })), lab('Compétition', el('input', { class: 'tj-in', value: o.comp, maxlength: '80', placeholder: 'Meeting, championnat, entraînement…', oninput: function (e) { o.comp = e.target.value; } }))));
    modal(x ? 'Modifier la performance' : 'Ajouter une performance', corps, function () {
      o.epreuve = String(o.epreuve || '').trim(); var v = lireValeur(o.txt);
      if (!o.date || !o.epreuve) { say('Indiquez la date et l’épreuve.'); return; }
      if (v == null || v <= 0) { say('Résultat illisible : écrivez par exemple 12,45 ou 1:02,35.'); return; }
      o.val = v; delete o.txt;
      if (x) st.d.perfs[st.d.perfs.indexOf(x)] = o; else st.d.perfs.push(o);
      st.ep = o.epreuve; sauver(); fermerModal(); say('Performance enregistrée'); draw();
    }, x ? function () { retirer('perfs', x, 'cette performance'); } : null);
  }
  function curseur(o, k, l, min, max, step, suffixe) {
    var out = el('b', { class: 'tj-cur-v' }, o[k] + suffixe);
    return el('label', { class: 'tj-lab tj-cur' }, el('span', { class: 'tj-lbl' }, l, ' ', out), el('input', { type: 'range', min: String(min), max: String(max), step: String(step), value: String(o[k]), oninput: function (e) { o[k] = e.target.value; out.textContent = e.target.value.replace('.', ',') + suffixe; } }));
  }
  function formBilan() {
    var x = st.d.bilans.find(function (b) { return b.date === auj(); }), o = x ? Object.assign({}, x) : { date: auj(), forme: '7', sommeil: '8', douleur: '0' };
    modal('Mon bilan du jour', el('div', null, el('p', { class: 'tj-proj-t' }, 'Comment vous sentez-vous aujourd’hui ? Un bilan par jour suffit.'),
      curseur(o, 'forme', 'Forme', 1, 10, 1, ' /10'), curseur(o, 'sommeil', 'Sommeil de la nuit', 3, 12, 0.5, ' h'), curseur(o, 'douleur', 'Douleur, gêne', 0, 10, 1, ' /10'),
      el('p', { class: 'tj-note' }, 'Une douleur forte ou qui dure : parlez-en à votre coach et consultez un professionnel de santé.')), function () {
      if (x) st.d.bilans[st.d.bilans.indexOf(x)] = o; else st.d.bilans.push(o);
      if (st.d.bilans.length > 400) st.d.bilans = tri(st.d.bilans).slice(-400);
      sauver(); fermerModal(); say('Bilan enregistré'); draw();
    });
  }
  function formSeance(x) {
    var o = x ? Object.assign({}, x) : { id: nid(), date: auj(), type: 'Entraînement', duree: '90', rpe: '6' };
    modal(x ? 'Modifier la séance' : 'Noter une séance', el('div', null,
      el('div', { class: 'tj-cols' }, lab('Date', el('input', { class: 'tj-in', type: 'date', value: o.date, onchange: function (e) { o.date = e.target.value; } })), lab('Type', el('select', { class: 'tj-in', onchange: function (e) { o.type = e.target.value; } }, ['Entraînement', 'Match', 'Musculation', 'Footing', 'Récupération', 'Autre'].map(function (t) { return el('option', { value: t, selected: t === o.type ? 'selected' : null }, t); })))),
      champNum(o, 'duree', 'Durée (minutes)'), curseur(o, 'rpe', 'Intensité ressentie (1 très facile, 10 maximale)', 1, 10, 1, ' /10')), function () {
      if (!o.date || !num(o.duree)) { say('Indiquez la date et la durée.'); return; }
      o.duree = String(Math.min(600, Math.round(num(o.duree))));
      if (x) st.d.seances[st.d.seances.indexOf(x)] = o; else st.d.seances.push(o);
      sauver(); fermerModal(); say('Séance enregistrée'); draw();
    }, x ? function () { retirer('seances', x, 'cette séance'); } : null);
  }
  function formObjectif(x) {
    var d = D(), perf = d.type === 'perf', o = x ? Object.assign({}, x) : { id: nid(), stat: perf ? '' : d.principal, epreuve: perf ? (st.ep || '') : '', cible: '', pourquoi: '' };
    var corps;
    if (perf) {
      var dl = el('datalist', { id: 'tj-eps2' }, uniq((d.epreuves || []).concat(st.d.perfs.map(function (p) { return p.epreuve; }))).map(function (e) { return el('option', { value: e }); }));
      corps = el('div', null, dl, lab('Épreuve', el('input', { class: 'tj-in', list: 'tj-eps2', value: o.epreuve, oninput: function (e) { o.epreuve = e.target.value; } })), lab('Chrono ou mesure visé', el('input', { class: 'tj-in', value: o.cible, placeholder: '1:02,00 ou 6,50', oninput: function (e) { o.cible = e.target.value; } })));
    } else {
      var stats = ['matchs', 'victoires'].concat(d.duree ? ['minutes'] : []).concat(d.champs.map(function (c) { return c.k; }));
      corps = el('div', null, lab('Statistique', el('select', { class: 'tj-in', onchange: function (e) { o.stat = e.target.value; } }, uniq(stats).map(function (k) { return el('option', { value: k, selected: k === o.stat ? 'selected' : null }, libelleStat(k)); }))), champNum(o, 'cible', 'Chiffre visé sur la saison'));
    }
    add(corps, lab('Pourquoi cet objectif ? (facultatif)', el('input', { class: 'tj-in', value: o.pourquoi, maxlength: '140', oninput: function (e) { o.pourquoi = e.target.value; } })));
    modal(x ? 'Modifier l’objectif' : 'Nouvel objectif', corps, function () {
      if (perf) { o.epreuve = String(o.epreuve || '').trim(); if (!o.epreuve || !lireValeur(o.cible)) { say('Indiquez l’épreuve et un chrono ou une mesure lisible.'); return; } st.d.objectifs = st.d.objectifs.filter(function (q) { return q === x || q.epreuve !== o.epreuve; }); }
      else if (!num(o.cible)) { say('Indiquez un chiffre visé.'); return; }
      o.pourquoi = String(o.pourquoi || '').trim();
      if (x && st.d.objectifs.indexOf(x) >= 0) st.d.objectifs[st.d.objectifs.indexOf(x)] = o; else st.d.objectifs.push(o);
      sauver(); fermerModal(); say('Objectif enregistré'); draw();
    }, x ? function () { retirer('objectifs', x, 'cet objectif'); } : null);
  }
  function toutEffacer() {
    if (!window.confirm('Effacer tout votre suivi (matchs, performances, forme, objectifs) sur cet appareil et dans votre compte ? C’est définitif.')) return;
    st.d = vide(); try { localStorage.removeItem(st.key); } catch (e) {}
    if (A() && moi() && !st.sqlMissing) A().db(function (c) { return c.from('athlete_trajectoire').delete().eq('user_id', moi()); }).catch(function () {});
    say('Suivi effacé'); st.vue = 'profil'; draw();
  }

  // ---------------------------------------------------------------- partage et export
  function resumeTexte() {
    var d = D(), p = st.d.profil, l = ['STATISTIQUES ATHLÈTE (saisies par l’athlète, à vérifier auprès du club avant publication)', 'Nom : ' + (p.nom || '—'), 'Discipline : ' + d.nom + (p.poste ? ' · ' + p.poste : ''), 'Club : ' + (p.club || '—'), 'Saison : ' + saisonTxt(), ''];
    if (d.type === 'perf') uniq(st.d.perfs.map(function (x) { return x.epreuve; })).forEach(function (n) { var E = epreuve(n); if (E) l.push(n + ' : record ' + ecrireValeur(E.best.val, E.mesure) + ' (' + dateLongue(jourDe(E.best.date)) + (E.best.lieu ? ', ' + E.best.lieu : '') + ')'); });
    else { var T = totaux(); l.push('Matchs : ' + T.n + (d.duree ? ' · Minutes : ' + T.minutes : '') + (d.type === 'duel' || T.t.victoires ? ' · Victoires : ' + T.t.victoires : '')); d.champs.forEach(function (c) { if (T.t[c.k]) l.push(c.l + ' : ' + fmt(T.t[c.k])); }); }
    l.push('', 'Pour l’afficher : Admin › Contenus › Joueurs › la fiche de l’athlète › « Statistiques de la saison », avec la source et la date.');
    return l.join('\n');
  }
  function proposer() {
    if (!st.ctx.envoyer) return;
    if (!window.confirm('Envoyer vos totaux de la saison à l’équipe Casa Besports pour votre fiche joueur ? Rien n’est publié sans vérification.')) return;
    st.ctx.envoyer(resumeTexte(), st.d.profil).then(function (ok) { say(ok ? 'Chiffres envoyés à l’équipe. Merci !' : 'Connectez-vous (ou indiquez votre e-mail dans Mon espace) pour envoyer vos chiffres.'); });
  }
  function exporter() {
    var d = D(), rows;
    if (d.type === 'perf') rows = [['Date', 'Épreuve', 'Résultat', 'Lieu', 'Compétition']].concat(tri(st.d.perfs).map(function (x) { return [x.date, x.epreuve, ecrireValeur(x.val, MESURE.test(x.epreuve)), x.lieu || '', x.comp || '']; }));
    else rows = [['Date', 'Adversaire', 'Compétition', 'Score', 'Résultat', 'Minutes'].concat(d.champs.map(function (c) { return c.l; })).concat(['Note'])].concat(tri(st.d.matchs).map(function (m) { return [m.date, m.adv || '', m.comp || '', m.score || '', m.res || '', m.min || ''].concat(d.champs.map(function (c) { return (m.s && m.s[c.k]) || ''; })).concat([m.note || '']); }));
    var csv = '﻿' + rows.map(function (r) { return r.map(function (v) { v = String(v); if (/^[=+\-@]/.test(v)) v = "'" + v; return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';'); }).join('\n');
    var a = document.createElement('a'), u = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.href = u; a.download = 'ma-trajectoire-' + auj() + '.csv'; document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 2000);
  }

  // ---------------------------------------------------------------- styles (thème Marée)
  function css() {
    if (document.getElementById('tj-css')) return;
    var s = document.createElement('style'); s.id = 'tj-css';
    s.textContent = [
      '#tj{--tj-rade:var(--rade,#10283a);--tj-sun:var(--sun,#f2b33d);--tj-herbe:var(--herbe,#2f6b4f);position:fixed;inset:0;z-index:9000;background:var(--bg,#e9efee);color:var(--text,#142b3b);display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif;font-size:15px;line-height:1.5}',
      '#tj *{box-sizing:border-box}',
      '.tj-top{display:flex;align-items:center;gap:.8rem;background:var(--tj-rade);color:#fff;padding:calc(.6rem + env(safe-area-inset-top,0px)) max(16px,env(safe-area-inset-right,0px)) .6rem max(16px,env(safe-area-inset-left,0px));border-bottom:3px solid var(--tj-sun)}',
      '.tj-brand{display:flex;flex-direction:column;flex:1;min-width:0}.tj-brand b{font:800 20px/1.1 "League Spartan",sans-serif;text-transform:uppercase}',
      '.tj-k{display:block;font:700 11.5px/1.2 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.12em;color:var(--tj-sun)}.tj-k-ink{color:var(--muted,#587080)}',
      '.tj-sync{font-size:12px;color:#c9d6dc;white-space:nowrap}@media(max-width:560px){.tj-sync{display:none}}',
      '.tj-x{min-height:40px;padding:.4rem .8rem;border:1.5px solid rgba(255,255,255,.6);background:transparent;color:#fff;font:800 12.5px/1 "League Spartan",sans-serif;text-transform:uppercase;cursor:pointer;border-radius:0}.tj-x:hover,.tj-x:focus-visible{background:#fff;color:var(--tj-rade)}',
      '.tj-tabs{display:flex;gap:0;overflow-x:auto;background:var(--surface,#fff);border-bottom:1px solid var(--line,#d3dedc);padding:0 max(8px,env(safe-area-inset-left,0px));scrollbar-width:none}.tj-tabs::-webkit-scrollbar{display:none}',
      '.tj-tab{flex:none;min-height:46px;padding:.6rem .9rem;border:0;border-bottom:3px solid transparent;background:none;color:var(--muted,#587080);font:800 13px/1 "League Spartan",sans-serif;text-transform:uppercase;letter-spacing:.03em;cursor:pointer}.tj-tab.is-on{color:var(--ink,#10283a);border-bottom-color:var(--tj-sun)}',
      '.tj-main{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}',
      '.tj-wrap{max-width:1120px;margin:0 auto;padding:1.1rem max(16px,env(safe-area-inset-right,0px)) calc(3rem + env(safe-area-inset-bottom,0px)) max(16px,env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:1.1rem}',
      // le cockpit : toujours sur fond bleu de rade (même en thème clair), accents soleil et herbe
      '.tj-hero{position:relative;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,#1d4561 0%,#10283a 55%,#0b1c29 100%);color:#fff;padding:1.3rem 1.1rem 1.2rem;border-bottom:3px solid var(--tj-sun)}',
      '.tj-hero:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 28px),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 28px);pointer-events:none}',
      '.tj-hero>*{position:relative}',
      '.tj-hero-id{text-align:center}.tj-nom{font:800 clamp(1.7rem,5vw,2.6rem)/1 "League Spartan",sans-serif;text-transform:uppercase;margin:.3rem 0 .2rem;text-wrap:balance}.tj-muted-i{color:#a9bcc6;font-size:13.5px}',
      '.tj-hero-g{display:grid;grid-template-columns:1fr minmax(220px,320px) 1fr;align-items:center;gap:.6rem;margin:.6rem auto 0;max-width:820px}',
      '@media(max-width:640px){#tj .tj-hero-g{grid-template-columns:repeat(4,minmax(0,1fr));gap:.4rem}#tj .tj-cad{grid-column:1/-1;grid-row:1;max-width:280px;margin:0 auto;width:100%}#tj .tj-orbits{display:contents}#tj .tj-orb{width:100%;height:auto;aspect-ratio:1;max-width:96px;justify-self:center;padding:.2rem}#tj .tj-orb-v{font-size:18px}#tj .tj-orb-l{font-size:9.5px}}',
      '.tj-orbits{display:flex;flex-direction:column;gap:.7rem;align-items:center}',
      '.tj-orb{width:108px;height:108px;border-radius:50%;border:1.5px solid rgba(242,179,61,.55);box-shadow:inset 0 0 0 6px rgba(255,255,255,.04),0 0 24px rgba(242,179,61,.12);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:.4rem;background:rgba(16,40,58,.55)}',
      
      '.tj-orb-v{font:800 clamp(20px,4.6vw,28px)/1 "League Spartan",sans-serif;color:#fff;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tj-orb-l{font:700 10.5px/1.15 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--tj-sun);margin-top:.25rem}',
      '.tj-cadran{width:100%;height:auto;display:block}.tj-halo{fill:rgba(242,179,61,.05);stroke:rgba(255,255,255,.1)}.tj-tick{stroke:rgba(255,255,255,.28);stroke-width:1}.tj-tick.is-l{stroke:rgba(242,179,61,.8);stroke-width:2}',
      '.tj-track{fill:none;stroke:rgba(255,255,255,.12)}.tj-arc-sun{fill:none;stroke:var(--tj-sun);stroke-linecap:round;filter:drop-shadow(0 0 6px rgba(242,179,61,.6))}.tj-arc-herbe{fill:none;stroke:#6fcf97;stroke-linecap:round}',
      '.tj-ava{fill:#183244}.tj-ini{fill:#fff;font:800 64px "League Spartan",sans-serif}.tj-ring-in{fill:none;stroke:rgba(255,255,255,.5);stroke-width:1.5}',
      '.tj-legende{display:flex;flex-wrap:wrap;justify-content:center;gap:.4rem 1.2rem;font-size:13px;color:#c9d6dc;margin-top:.4rem}.tj-legende b{color:#fff}',
      '.tj-pt{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:.4rem;vertical-align:-1px}.tj-pt-sun{background:var(--tj-sun)}.tj-pt-herbe{background:#6fcf97}.tj-pt-ligne{background:none;border-top:2px dashed var(--ink,#10283a);border-radius:0;height:0;width:16px;vertical-align:3px}',
      '.tj-hero-a{display:flex;flex-wrap:wrap;gap:.5rem;justify-content:center;margin-top:1rem}',
      '.tj-box{background:var(--surface,#fff);border:1px solid var(--line,#d3dedc);padding:1rem 1.1rem 1.1rem;min-width:0}',
      '.tj-box-h{display:flex;flex-wrap:wrap;gap:.6rem;align-items:flex-end;justify-content:space-between;margin:0 0 .8rem}',
      '.tj-h1{font:800 clamp(1.6rem,4vw,2.3rem)/1.05 "League Spartan",sans-serif;text-transform:uppercase;margin:.2rem 0 .5rem;color:var(--ink,#10283a);text-wrap:balance}',
      '.tj-h2{font:800 clamp(1.15rem,2.6vw,1.45rem)/1.1 "League Spartan",sans-serif;text-transform:uppercase;margin:.1rem 0 0;color:var(--ink,#10283a)}.tj-h2 small{font:600 12.5px Inter,sans-serif;text-transform:none;color:var(--muted,#587080)}',
      '.tj-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;min-height:44px;padding:.55rem 1rem .45rem;border:0;background:var(--tj-sun);color:#10283a;font:800 13px/1.1 "League Spartan",sans-serif;text-transform:uppercase;letter-spacing:.04em;cursor:pointer;border-radius:0;text-align:center}',
      '.tj-btn:hover,.tj-btn:focus-visible{background:var(--ink,#10283a);color:var(--bg,#fff)}.tj-btn[disabled]{opacity:.5;cursor:default}.tj-btn-s{min-height:38px;padding:.4rem .75rem}',
      '.tj-ghost{background:transparent;border:1.5px solid var(--ink,#10283a);color:var(--ink,#10283a)}.tj-ghost-w{background:transparent;border:1.5px solid rgba(255,255,255,.75);color:#fff}.tj-ghost-w:hover{background:#fff;color:#10283a}.tj-danger{background:#b3261e;color:#fff}',
      '.tj-lnk{background:none;border:0;padding:.2rem 0;min-height:36px;color:var(--ink,#10283a);font:700 13px/1.2 Inter,sans-serif;text-decoration:underline;text-underline-offset:3px;cursor:pointer}',
      '.tj-row{display:flex;flex-wrap:wrap;gap:.5rem .7rem;align-items:center}.tj-foot{margin-top:1rem}',
      '.tj-info{margin:0;padding:.75rem .9rem;background:var(--note-bg,#f1f5f4);border-left:3px solid var(--tj-herbe);font-size:14px;color:var(--note-fg,inherit)}.tj-info.is-warn{border-left-color:var(--tj-sun)}',
      '.tj-note{font-size:12.5px;color:var(--muted,#587080);margin:.7rem 0 0;line-height:1.5}',
      '.tj-proj-t{font-size:14px;margin:.5rem 0 0;color:var(--text-2,#3b5566)}',
      '.tj-ratios{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--line,#d3dedc);border:1px solid var(--line,#d3dedc)}',
      '.tj-ratio{background:var(--surface,#fff);padding:.9rem .8rem;display:flex;flex-direction:column;gap:.2rem;position:relative}.tj-ring-s{position:absolute;right:.6rem;top:.6rem;width:34px;height:34px}.tj-ring-s .tj-track{stroke:var(--line,#d3dedc)}',
      '.tj-ratio-v{font:800 26px/1 "League Spartan",sans-serif;color:var(--ink,#10283a)}.tj-ratio-l{font:700 12px/1.25 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.05em;color:var(--muted,#587080)}',
      '.tj-barres{display:flex;flex-direction:column;gap:.45rem}.tj-barre{display:grid;grid-template-columns:minmax(110px,190px) 1fr 3.2rem 5.6rem;gap:.6rem;align-items:center;font-size:13.5px}',
      '@media(max-width:560px){.tj-barre{grid-template-columns:1fr 3rem;}.tj-barre-t{grid-column:1/-1;grid-row:2}.tj-barre-m{display:none}}',
      '.tj-barre-t{height:10px;background:var(--surface-2,#f1f5f4);position:relative;overflow:hidden}.tj-barre-t i{position:absolute;inset:0 auto 0 0;background:linear-gradient(90deg,var(--tj-rade),#2c6a8f)}',
      '[data-cb-theme="dark"] .tj-barre-t i{background:linear-gradient(90deg,var(--tj-sun),#f7cf7d)}',
      '.tj-barre-v{text-align:right;font:800 16px "League Spartan",sans-serif;color:var(--ink,#10283a)}.tj-barre-m{color:var(--muted,#587080);font-size:12px}',
      '.tj-projs{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.8rem}',
      '.tj-proj{border:1px solid var(--line,#d3dedc);padding:.8rem .9rem;background:var(--surface-3,#f6f9f8)}.tj-proj-h{display:flex;justify-content:space-between;gap:.5rem;align-items:center;margin-bottom:.6rem}.tj-proj-h b{font:800 15px "League Spartan",sans-serif;text-transform:uppercase;color:var(--ink,#10283a)}',
      '.tj-etat{font:800 11px/1 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:.3rem .45rem}.tj-etat.is-ok{background:var(--tj-herbe);color:#fff}.tj-etat.is-mid{background:var(--tj-sun);color:#10283a}.tj-etat.is-low{background:#b3261e;color:#fff}',
      '.tj-proj-bar{position:relative;height:14px;background:var(--line,#d3dedc)}.tj-proj-bar i{position:absolute;top:0;bottom:0;left:0}.tj-proj-p{background:repeating-linear-gradient(135deg,rgba(242,179,61,.75) 0 6px,rgba(242,179,61,.35) 6px 12px)}.tj-proj-a{background:var(--tj-rade);z-index:1}',
      '[data-cb-theme="dark"] .tj-proj-a{background:#fff}.tj-proj-c{width:3px;background:#b3261e;z-index:2;left:auto}',
      '.tj-proj-n{display:flex;justify-content:space-between;gap:.4rem;font-size:12.5px;color:var(--muted,#587080);margin-top:.45rem}.tj-proj-n b{color:var(--ink,#10283a);font:800 15px "League Spartan",sans-serif}',
      '.tj-courbe{width:100%;height:auto;display:block}.tj-grid{stroke:var(--line,#d3dedc);stroke-width:1}.tj-ax{fill:var(--muted,#587080);font:600 11px Inter,sans-serif}.tj-ax-c{fill:#b3261e}',
      '.tj-area{fill:rgba(242,179,61,.16)}.tj-line{fill:none;stroke:var(--tj-sun);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.tj-moy{fill:none;stroke:var(--ink,#10283a);stroke-width:1.6;stroke-dasharray:5 4}',
      '.tj-dot{fill:var(--surface,#fff);stroke:var(--tj-sun);stroke-width:2.2}.tj-dot.is-last{fill:var(--tj-sun);stroke:var(--ink,#10283a)}.tj-cible{stroke:#b3261e;stroke-width:1.5;stroke-dasharray:6 4}',
      '.tj-duo{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem}@media(max-width:720px){.tj-duo{grid-template-columns:1fr}}.tj-duo>div{display:flex;flex-direction:column;gap:.6rem;align-items:flex-start}',
      '.tj-fsum{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--line,#d3dedc);border:1px solid var(--line,#d3dedc);width:100%;margin-top:.6rem}.tj-fsum>div{background:var(--surface,#fff);padding:.7rem .6rem;display:flex;flex-direction:column}',
      '.tj-fsum b{font:800 22px/1 "League Spartan",sans-serif;color:var(--ink,#10283a)}.tj-fsum span{font-size:12px;color:var(--muted,#587080);margin-top:.2rem}',
      '.tj-jauge-w{width:100%;max-width:260px}.tj-jauge{width:100%;height:auto;display:block}.tj-jauge path{fill:none}.tj-z-bas{stroke:#a9bcc6}.tj-z-ok{stroke:var(--tj-herbe)}.tj-z-mid{stroke:var(--tj-sun)}.tj-z-haut{stroke:#b3261e}',
      '.tj-needle{stroke:var(--ink,#10283a);stroke-width:3.5;stroke-linecap:round}.tj-needle-c{fill:var(--ink,#10283a)}.tj-jauge-v{font:800 30px/1 "League Spartan",sans-serif;color:var(--ink,#10283a);margin-top:-.3rem}',
      '.tj-partage{display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between;align-items:flex-end;border-top:3px solid var(--tj-sun)}.tj-partage>div:first-child{flex:1 1 360px}',
      '.tj-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line,#d3dedc)}.tj-li{display:flex;gap:.9rem;align-items:center;padding:.7rem 0;border-bottom:1px solid var(--line,#d3dedc)}',
      '.tj-li-d{flex:none;width:3.6rem;display:flex;flex-direction:column;align-items:center;background:var(--tj-rade);color:#fff;padding:.35rem .2rem}.tj-li-d b{font:800 14px/1.1 "League Spartan",sans-serif;text-transform:uppercase;text-align:center}.tj-li-d span{font-size:11px;color:var(--tj-sun)}',
      '.tj-li-m{flex:1;min-width:0;display:flex;flex-direction:column}.tj-li-m b{color:var(--ink,#10283a);font-size:14.5px}.tj-li-m span{font-size:13px;color:var(--muted,#587080)}.tj-li-a{flex:none}',
      '.tj-lab{display:flex;flex-direction:column;gap:.3rem;margin:.5rem 0;min-width:0}.tj-lbl{display:block;font:700 12.5px/1.2 "Barlow Condensed",sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#587080);margin-top:.6rem}.tj-lab .tj-lbl{margin-top:0}',
      '.tj-in{width:100%;min-height:44px;padding:.5rem .7rem;border:1.5px solid var(--line-2,#b4c6c4);background:var(--surface,#fff);color:var(--text,#142b3b);font:500 16px Inter,sans-serif;border-radius:0}.tj-in:focus{outline:2px solid var(--tj-sun);outline-offset:1px}.tj-in-s{width:auto;min-height:38px;font-size:14px}',
      '.tj-sel-l{font-size:13px;color:var(--muted,#587080);display:flex;align-items:center;gap:.4rem}',
      '.tj-cols{display:grid;grid-template-columns:1fr 1fr;gap:0 .8rem}@media(max-width:560px){.tj-cols{grid-template-columns:1fr}}',
      '.tj-grid3{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:0 .7rem}',
      '.tj-discs{display:flex;flex-wrap:wrap;gap:.4rem;margin:.3rem 0 .4rem}.tj-disc{min-height:40px;padding:.45rem .8rem;border:1.5px solid var(--line-2,#b4c6c4);background:var(--surface,#fff);color:var(--text,#142b3b);font:700 13px Inter,sans-serif;cursor:pointer;border-radius:0}.tj-disc.is-on{background:var(--tj-rade);border-color:var(--tj-rade);color:#fff}',
      '.tj-seg{display:flex;gap:0;border:1.5px solid var(--ink,#10283a);width:max-content;max-width:100%}.tj-segb{min-height:42px;padding:.4rem 1rem;border:0;background:var(--surface,#fff);color:var(--ink,#10283a);font:800 13px "League Spartan",sans-serif;text-transform:uppercase;cursor:pointer}.tj-segb+.tj-segb{border-left:1.5px solid var(--ink,#10283a)}.tj-segb.is-on{background:var(--tj-rade);color:#fff}',
      '[data-cb-theme="dark"] .tj-segb.is-on,[data-cb-theme="dark"] .tj-disc.is-on{background:var(--tj-sun);color:#10283a;border-color:var(--tj-sun)}',
      '.tj-cur input{width:100%;accent-color:var(--tj-sun);min-height:32px}.tj-cur-v{color:var(--ink,#10283a);font:800 15px "League Spartan",sans-serif;text-transform:none;letter-spacing:0}',
      '.tj-intro p{font-size:15px;color:var(--text-2,#3b5566);max-width:60ch}',
      '.tj-modal{position:fixed;inset:0;z-index:9100;background:var(--overlay,rgba(16,40,58,.5));display:flex;align-items:flex-end;justify-content:center;padding:0}',
      '@media(min-width:640px){.tj-modal{align-items:center;padding:1rem}}',
      '.tj-modal-in{background:var(--surface,#fff);width:100%;max-width:640px;max-height:92vh;overflow:auto;padding:1.1rem max(16px,env(safe-area-inset-right,0px)) calc(1.1rem + env(safe-area-inset-bottom,0px));border-top:4px solid var(--tj-sun)}'
    ].join('\n');
    document.head.appendChild(s);
  }

  return { open: open, fermer: fermer, DISC: DISC, _st: function () { return st; }, _lireValeur: lireValeur, _ecrireValeur: ecrireValeur };
})();
if (typeof window !== 'undefined') window.CasaTrajectoire = CasaTrajectoire;
