/*
 * Casa Besports : lecture d'un calendrier collé ou importé dans Espace admin › Résultats.
 * Accepte :
 *  - le texte copié d'une page de calendrier (fff.fr, ffbb, ffr, site de club…) : Ctrl+A, Ctrl+C, puis coller ;
 *  - un fichier agenda .ics (export « Ajouter à mon agenda ») ;
 *  - un tableau .csv / copié d'un tableur (colonnes date, heure, domicile, extérieur, score…).
 * Rien n'est inventé : une ligne sans date ou sans deux équipes est ignorée et signalée.
 * CasaImportCal.lire(texte) → { matches: [{ date, time, home, away, hs, as, venue }], ignorees: n, format }
 */
(function (root) {
  var MOIS = { janvier: 1, janv: 1, jan: 1, fevrier: 2, fevr: 2, fev: 2, mars: 3, mar: 3, avril: 4, avr: 4, mai: 5, juin: 6, juillet: 7, juil: 7,
    aout: 8, septembre: 9, sept: 9, sep: 9, octobre: 10, oct: 10, novembre: 11, nov: 11, decembre: 12, dec: 12 };
  var JOURS = /^(lun|mar|mer|jeu|ven|sam|dim)[a-z]*\.?$/;
  // en-têtes et mots de navigation : une ligne qui commence par l'un d'eux n'est pas un nom d'équipe…
  var BRUIT = /^(journ[ée]e|j\.?\s?\d+|poule|groupe|phase|championnat|coupe de|division|r[ée]sultats|calendrier|classement)\b/i;
  // … et une ligne qui n'est faite que de l'un de ceux-ci non plus (« Stade Briochin » reste une équipe)
  var SEUL = /^(voir( le match| plus)?|d[ée]tails?|feuille de match|r[ée]sum[ée]|match|matchs|score|vs|contre|domicile|ext[ée]rieur|aller|retour|forfait|report[ée]|annul[ée]|en direct|termin[ée]|[àa] venir|lieu|stade|salle|gymnase|heure|date|tous les matchs|filtrer|rechercher|menu|accueil|partager|imprimer|coupe)$/i;

  function sansAccent(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function deux(n) { n = String(n); return n.length < 2 ? '0' + n : n; }
  function saisonDebut(auj) { auj = auj || new Date(); return auj.getMonth() >= 6 ? auj.getFullYear() : auj.getFullYear() - 1; }
  function annee(mois, an, debut) {
    if (an) { an = parseInt(an, 10); return an < 100 ? 2000 + an : an; }
    return mois >= 7 ? debut : debut + 1; // saison sportive : d'août à juillet
  }
  function iso(j, m, a) {
    j = parseInt(j, 10); m = parseInt(m, 10);
    if (!(j >= 1 && j <= 31 && m >= 1 && m <= 12)) return null;
    var d = new Date(a, m - 1, j);
    if (d.getMonth() !== m - 1) return null;
    return a + '-' + deux(m) + '-' + deux(j);
  }

  // Date dans une ligne : 22/11/2026, 22-11-26, 22.11, « samedi 22 novembre 2026 », « sam. 22 nov. »
  function trouverDate(l, debut) {
    var m = l.match(/(^|[^\d])(\d{1,2})[\/.](\d{1,2})(?:[\/.](\d{2,4}))?(?![\d\/.])/) || l.match(/(^|[^\d:h])(\d{1,2})-(\d{1,2})-(\d{2,4})(?!\d)/);
    if (m) { var a = annee(parseInt(m[3], 10), m[4], debut), d = iso(m[2], m[3], a); if (d) return { date: d, reste: l.replace(m[0], m[1] + ' ') }; }
    m = l.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) { var d2 = iso(m[3], m[2], parseInt(m[1], 10)); if (d2) return { date: d2, reste: l.replace(m[0], ' ') }; }
    var s = sansAccent(l).toLowerCase();
    m = s.match(/(?:^|[^a-z0-9])(\d{1,2})(?:er)?\s+(janvier|janv|jan|fevrier|fevr|fev|mars|mar|avril|avr|mai|juin|juillet|juil|aout|septembre|sept|sep|octobre|oct|novembre|nov|decembre|dec)\.?(?:\s+(\d{4}))?(?![a-z])/);
    if (m) {
      var mo = MOIS[m[2]], d3 = iso(m[1], mo, annee(mo, m[3], debut));
      if (d3) {
        // on retire la date (et le jour de la semaine) du texte original, même longueur qu'en minuscules sans accents
        var i = s.indexOf(m[0]), reste = l.slice(0, i) + ' ' + l.slice(i + m[0].length);
        reste = reste.replace(/(^|\s)(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun|mar|mer|jeu|ven|sam|dim)\.?(?=\s|$)/i, ' ');
        return { date: d3, reste: reste };
      }
    }
    return null;
  }
  function trouverHeure(l) {
    var m = l.match(/(^|[^\d])([01]?\d|2[0-3])\s?[:hH]\s?([0-5]\d)?(?![\d])/);
    if (!m) return null;
    return { time: deux(m[2]) + ':' + (m[3] || '00'), reste: l.replace(m[0], m[1] + ' ') };
  }
  function propre(t) {
    return String(t || '').replace(/\s+/g, ' ').replace(/^[\s\-–—|·:,;]+|[\s\-–—|·:,;]+$/g, '').trim();
  }
  function estEquipe(t) {
    t = propre(t);
    if (t.length < 2 || t.length > 70 || !/[A-Za-zÀ-ÿ]/.test(t)) return false;
    if (BRUIT.test(t) || SEUL.test(t) || JOURS.test(sansAccent(t).toLowerCase())) return false;
    return true;
  }
  // « A 2 - 1 B », « A - B », « A vs B », « A / B »
  function coupler(t) {
    t = propre(t);
    var m = t.match(/^(.*?[A-Za-zÀ-ÿ.)].*?)\s+(\d{1,3})\s*[-–—:]\s*(\d{1,3})\s+(.*[A-Za-zÀ-ÿ].*)$/);
    if (m && estEquipe(m[1]) && estEquipe(m[4])) return { home: propre(m[1]), away: propre(m[4]), hs: +m[2], as: +m[3] };
    // « A - B 3-0 » : score à la fin
    var fin = t.match(/^(.*\S)\s+(\d{1,3})\s*[-–—:]\s*(\d{1,3})$/);
    if (fin) { var c2 = coupler(fin[1]); if (c2 && c2.hs == null) return { home: c2.home, away: c2.away, hs: +fin[2], as: +fin[3] }; }
    m = t.split(/\s+(?:[-–—]|vs\.?|contre|\/)\s+/i);
    if (m.length === 2 && estEquipe(m[0]) && estEquipe(m[1])) return { home: propre(m[0]), away: propre(m[1]), hs: null, as: null };
    return null;
  }

  function lireIcs(txt, debut) {
    var out = [], ign = 0;
    txt = txt.replace(/\r?\n[ \t]/g, ''); // lignes repliées
    (txt.split(/BEGIN:VEVENT/).slice(1)).forEach(function (ev) {
      var champ = function (n) { var m = ev.match(new RegExp('^' + n + '(?:;[^:\\n]*)?:(.*)$', 'mi')); return m ? m[1].replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/gi, ' ').trim() : ''; };
      var dt = champ('DTSTART'), m = dt.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(?:\d{2})?)?(Z)?/);
      var c = coupler(champ('SUMMARY'));
      if (!m || !c) { ign++; return; }
      var date = m[1] + '-' + m[2] + '-' + m[3], time = m[4] ? m[4] + ':' + m[5] : '';
      if (m[6] && m[4]) { // heure universelle → heure de Paris
        var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
        var p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d);
        var g = function (t) { return (p.find(function (x) { return x.type === t; }) || {}).value; };
        date = g('year') + '-' + g('month') + '-' + g('day'); time = g('hour') + ':' + g('minute');
      }
      out.push({ date: date, time: time, home: c.home, away: c.away, hs: c.hs, as: c.as, venue: champ('LOCATION') });
    });
    return { matches: out, ignorees: ign, format: 'Agenda .ics' };
  }

  function lireTableau(lignes, sep, debut) {
    var tete = lignes[0].split(sep).map(function (h) { return sansAccent(h).toLowerCase().trim(); });
    var col = function (re) { for (var i = 0; i < tete.length; i++) if (re.test(tete[i])) return i; return -1; };
    var cD = col(/date|jour/), cH = col(/heure|horaire/), cA = col(/domicile|recevant|locaux|equipe ?1|home/), cB = col(/exterieur|visiteur|equipe ?2|away/);
    var cS = col(/^score$|resultat/), cSA = col(/score.*(dom|1)|buts? ?(dom|1)/), cSB = col(/score.*(ext|2)|buts? ?(ext|2)/), cL = col(/lieu|stade|salle|terrain|gymnase/);
    if (cD < 0 || cA < 0 || cB < 0) return null;
    var out = [], ign = 0;
    lignes.slice(1).forEach(function (l) {
      var c = l.split(sep).map(function (x) { return x.replace(/^"|"$/g, '').trim(); });
      var d = trouverDate(c[cD] || '', debut), h = cH >= 0 ? trouverHeure(c[cH] || '') : trouverHeure(c[cD] || '');
      if (!d || !estEquipe(c[cA]) || !estEquipe(c[cB])) { if (l.trim()) ign++; return; }
      var hs = null, as = null;
      if (cSA >= 0 && cSB >= 0 && /^\d+$/.test(c[cSA]) && /^\d+$/.test(c[cSB])) { hs = +c[cSA]; as = +c[cSB]; }
      else if (cS >= 0) { var s = (c[cS] || '').match(/^(\d{1,3})\s*[-–:]\s*(\d{1,3})$/); if (s) { hs = +s[1]; as = +s[2]; } }
      out.push({ date: d.date, time: h ? h.time : '', home: propre(c[cA]), away: propre(c[cB]), hs: hs, as: as, venue: cL >= 0 ? (c[cL] || '') : '' });
    });
    return { matches: out, ignorees: ign, format: 'Tableau' };
  }

  // Texte copié d'une page : une date ouvre un bloc, puis on cherche domicile, (score), extérieur dans les lignes suivantes
  function lireTexte(lignes, debut) {
    var out = [], ign = 0, date = null, time = '', bloc = [];
    function vider() {
      if (!date || !bloc.length) { bloc = []; return; }
      var equipes = [], scores = [], i;
      for (i = 0; i < bloc.length; i++) {
        var t = propre(bloc[i]); if (!t) continue;
        var c = coupler(t);
        if (c) { out.push({ date: date, time: time, home: c.home, away: c.away, hs: c.hs, as: c.as, venue: '' }); equipes = []; scores = []; continue; }
        var s = t.match(/^(\d{1,3})\s*[-–—:]\s*(\d{1,3})$/);
        if (s) { scores.push(+s[1], +s[2]); continue; }
        if (/^\d{1,3}$/.test(t)) { scores.push(+t); continue; }
        var h = trouverHeure(t); if (h && !propre(h.reste)) { time = h.time; continue; }
        if (estEquipe(t)) equipes.push(t);
        if (equipes.length === 2) {
          var ok = scores.length === 2;
          out.push({ date: date, time: time, home: propre(equipes[0]), away: propre(equipes[1]), hs: ok ? scores[0] : null, as: ok ? scores[1] : null, venue: '' });
          equipes = []; scores = [];
        }
      }
      if (equipes.length === 1) ign++;
      bloc = [];
    }
    lignes.forEach(function (l) {
      var d = trouverDate(l, debut);
      if (d) {
        vider(); date = d.date; time = '';
        var h = trouverHeure(d.reste), reste = h ? h.reste : d.reste; if (h) time = h.time;
        reste = reste.replace(/\bj(?:ourn[ée]e)?\.?\s?\d+\b/i, ' ');
        if (propre(reste)) bloc.push(reste);
        return;
      }
      bloc.push(l);
    });
    vider();
    return { matches: out, ignorees: ign, format: 'Texte copié' };
  }

  function lire(txt, opts) {
    opts = opts || {};
    var debut = opts.saison || saisonDebut(opts.aujourdhui);
    txt = String(txt || '').replace(/ /g, ' ');
    var r;
    if (/BEGIN:VEVENT/.test(txt)) r = lireIcs(txt, debut);
    else {
      var lignes = txt.split(/\r?\n/).map(function (l) { return l.replace(/\s+$/, ''); }).filter(function (l) { return l.trim(); });
      if (!lignes.length) return { matches: [], ignorees: 0, format: '' };
      var sep = lignes[0].indexOf('\t') >= 0 ? '\t' : (lignes[0].split(';').length > 2 ? ';' : (lignes[0].split(',').length > 2 ? ',' : null));
      r = (sep && lireTableau(lignes, sep, debut)) || lireTexte(lignes, debut);
    }
    // doublons à l'intérieur du texte collé (même date, mêmes équipes)
    var vus = {}, uniques = [];
    r.matches.forEach(function (m) { var k = m.date + '|' + cle(m.home) + '|' + cle(m.away); if (vus[k]) return; vus[k] = 1; uniques.push(m); });
    r.doublonsTexte = r.matches.length - uniques.length;
    r.matches = uniques;
    return r;
  }
  function cle(t) { return sansAccent(t).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }

  var api = { lire: lire, cle: cle };
  root.CasaImportCal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
