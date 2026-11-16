/*!
 * Casa Besports — Les Marées d'or : la soirée des trophées du sport local (page « Les trophées », adresse /trophees)
 * Contenu : contenus/trophees.js (modifiable dans l'espace administrateur › Les Marées d'or).
 * Votes du public : Supabase, fonctions voter_trophee / mes_votes_trophees / resultats_trophees (supabase/trophees.sql).
 * Un vote par prix et par compte ; l'administrateur voit les compteurs et la note finale calculée avec le barème.
 */
var CasaTrophees = (function () {
  'use strict';
  var slug = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); };
  var initiales = function (n) { return String(n || '').split(/[\s-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '?'; };
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var ORDRE = ['preparation', 'propositions', 'vote', 'jury', 'ceremonie', 'palmares'];
  var NOMS = { maree: 'La Marée d’or', vague: 'La Vague d’or', bouee: 'La Bouée', boussole: 'La Boussole', phare: 'Le Phare', digue: 'La Digue', amer: 'L’Amer', rade: 'La Rade', ecume: 'L’Écume', cap: 'Le Cap', galet: 'Le Galet', ancre: 'L’Ancre d’honneur' };

  // État partagé (votes chargés depuis Supabase)
  var mine = {}, mineEd = null, mineBusy = false, res = null, resBusy = false, resErr = '';
  var auth = function () { return window.CasaAuth || {}; };
  var refresh = function (app) { app.setState({ trTick: Date.now() }); };
  var edition = function (T) { return slug(T.cle || T.saison || T.edition || 'edition'); };

  function chargerMesVotes(app, T, uid) {
    var A = auth(), ed = edition(T) + '|' + uid;
    if (!A.on || !A.db || mineBusy || mineEd === ed) return;
    mineBusy = true;
    A.db(function (c) { return c.rpc('mes_votes_trophees', { ed: edition(T) }); }).then(function (rows) {
      mine = {}; (Array.isArray(rows) ? rows : []).forEach(function (r) { mine[r.prix] = r.nomme; });
      mineEd = ed; mineBusy = false; refresh(app);
    }, function () { mineEd = ed; mineBusy = false; });
  }

  function voter(app, T, p, n) {
    var A = auth(), s = app.state;
    if (!s.loggedIn) { app.setState({ loginOpen: true, linkSent: false }); app.say('Connectez-vous pour voter : un vote par prix et par compte, gratuit.'); return; }
    if (!A.on || !A.db) { app.say('Le vote n’est pas encore branché sur ce site.'); return; }
    var avant = mine[p.id]; mine[p.id] = n.id; refresh(app);
    A.db(function (c) { return c.rpc('voter_trophee', { ed: edition(T), p: p.id, n: n.id }); }).then(function () {
      app.say(avant && avant !== n.id ? 'Vote modifié : ' + n.nom : 'Vote enregistré : ' + n.nom);
    }, function (e) {
      if (avant) mine[p.id] = avant; else delete mine[p.id]; refresh(app);
      var m = (e && e.message) || '';
      app.say(/function|does not exist|schema cache/i.test(m) ? 'Le vote ouvrira bientôt (installation en cours).' : 'Vote non enregistré, réessayez dans un instant.');
    });
  }

  function chargerResultats(app, T) {
    var A = auth();
    if (!A.on || !A.db || resBusy) return;
    resBusy = true; resErr = ''; refresh(app);
    A.db(function (c) { return c.rpc('resultats_trophees', { ed: edition(T) }); }).then(function (rows) {
      res = {}; (Array.isArray(rows) ? rows : []).forEach(function (r) { (res[r.prix] = res[r.prix] || {})[r.nomme] = +r.votes || 0; });
      resBusy = false; refresh(app);
    }, function (e) {
      resBusy = false; var m = (e && e.message) || '';
      resErr = /function|does not exist|schema cache/i.test(m) ? 'Lancez d’abord le fichier supabase/trophees.sql dans Supabase (voir docs/TROPHEES.md).' : 'Résultats indisponibles : ' + m;
      refresh(app);
    });
  }

  function vals(app) {
    var s = app.state, T = window.CASA_TROPHEES || {};
    var phase = ORDRE.indexOf(T.phase) >= 0 ? T.phase : 'preparation', iPh = ORDRE.indexOf(phase);
    var BAR = {}; (T.baremes || []).forEach(function (b) { BAR[b.id] = b; });
    var isAdmin = s.role === 'admin';
    if (s.view === 'trophees' && s.loggedIn && auth().user) chargerMesVotes(app, T, auth().user.id || '');

    var ouvert = function (p) {
      var b = BAR[p.bareme] || {};
      if (p.bareme === 'maree') return phase === 'ceremonie';
      return phase === 'vote' && (+b.public || 0) > 0;
    };
    var partsTxt = function (b) {
      if (!b) return '';
      return [[b.jury, 'jury'], [b.public, 'public'], [b.pairs, 'pairs']].filter(function (x) { return +x[0] > 0; }).map(function (x) { return x[0] + ' % ' + x[1]; }).join(' · ');
    };
    var palmares = phase === 'palmares';

    var carte = function (p) {
      var b = BAR[p.bareme], open = ouvert(p);
      var nommes = (p.nommes || []).filter(function (n) { return n && n.nom; }).map(function (n) {
        var id = slug(n.nom), moi = mine[p.id] === id, gagne = palmares && p.laureat && slug(p.laureat) === id;
        var nn = { id: id, nom: n.nom };
        return { nom: n.nom, club: n.club || '', hasClub: !!n.club, pourquoi: n.pourquoi || '', hasPourquoi: !!n.pourquoi, photo: n.photo || '', hasPhoto: !!n.photo, noPhoto: !n.photo, ini: initiales(n.nom),
          cls: (moi ? 'is-mine ' : '') + (gagne ? 'is-win' : ''), canVote: open, voteLabel: moi ? 'Mon vote ✓' : 'Voter', pressed: moi ? 'true' : 'false',
          vote: function () { voter(app, T, p, nn); }, gagne: !!gagne };
      });
      return { id: p.id, titre: p.titre, discipline: p.discipline || '', img: 'assets/trophees/' + (p.trophee || 'vague') + '.svg', tropheeNom: NOMS[p.trophee] || '',
        parts: partsTxt(b), criteres: p.criteres || '', remisPar: p.remisPar || '', remettant: p.remettant || '', hasRemettant: !!p.remettant,
        nommes: nommes, hasNommes: nommes.length > 0, noNommes: !nommes.length, open: open && nommes.length > 0, voteNote: open ? (mine[p.id] ? 'Vous avez voté · vous pouvez changer d’avis' : 'Vote ouvert · un vote par compte') : '',
        hasLaureat: palmares && !!p.laureat, laureat: p.laureat || '' };
    };
    var prix = (T.prix || []).filter(function (p) { return p && p.titre; });
    var vagues = prix.filter(function (p) { return p.trophee === 'vague'; });
    var autres = prix.filter(function (p) { return p.trophee !== 'vague'; });
    // Vagues d'or rangées par discipline (sportive + sportif côte à côte)
    var discs = []; vagues.forEach(function (p) { var d = p.discipline || 'Autre', g = discs.find(function (x) { return x.nom === d; }); if (!g) discs.push(g = { nom: d, list: [] }); g.list.push(carte(p)); });
    var fil = s.trF || 'tout';
    var filtres = [['tout', 'Les 31 trophées'], ['vagues', 'Vagues d’or'], ['soiree', 'Prix de la soirée']].map(function (f) {
      return { label: f[1], cls: fil === f[0] ? 'is-on' : '', sel: fil === f[0] ? 'true' : 'false', pick: function () { app.setState({ trF: f[0] }); } };
    });

    var quand = T.dateTexte || 'Date à fixer';
    if (T.date && /^\d{4}-\d{2}-\d{2}$/.test(T.date)) { var d = new Date(T.date + 'T12:00:00'); quand = d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
    var trophees = (T.trophees || []).map(function (t) { return { nom: t.nom, pour: t.pour, forme: t.forme, socle: t.socle, hauteur: t.hauteur, nombre: String(t.nombre || 1), img: 'assets/trophees/' + t.id + '.svg', pluriel: (+t.nombre || 1) > 1 }; });
    var total = (T.trophees || []).reduce(function (a, t) { return a + (+t.nombre || 1); }, 0);

    // Coulisses (administrateur) : votes, notes du jury et des pairs, note finale
    var adm = { on: isAdmin, busy: resBusy, err: resErr, hasErr: !!resErr, loaded: !!res, charger: function () { chargerResultats(app, T); }, rows: [] };
    if (isAdmin && res) {
      adm.rows = prix.filter(function (p) { return (p.nommes || []).some(function (n) { return n && n.nom; }); }).map(function (p) {
        var b = BAR[p.bareme] || { jury: 100, public: 0, pairs: 0 }, R = res[p.id] || {};
        var ns = p.nommes.filter(function (n) { return n && n.nom; });
        var tot = ns.reduce(function (a, n) { return a + (R[slug(n.nom)] || 0); }, 0);
        var lignes = ns.map(function (n) {
          var v = R[slug(n.nom)] || 0, pub = tot ? v / tot * 100 : 0, j = parseFloat(n.jury), pr = parseFloat(n.pairs);
          var manque = ((+b.jury > 0 && isNaN(j)) || (+b.pairs > 0 && isNaN(pr)));
          var note = (isNaN(j) ? 0 : j) * (+b.jury || 0) / 100 + pub * (+b.public || 0) / 100 + (isNaN(pr) ? 0 : pr) * (+b.pairs || 0) / 100;
          return { nom: n.nom, votes: String(v), pub: Math.round(pub) + ' %', jury: isNaN(j) ? '—' : String(j), pairs: +b.pairs > 0 ? (isNaN(pr) ? '—' : String(pr)) : '', note: note.toFixed(1), n: note, manque: manque, cls: '' };
        }).sort(function (a, c) { return c.n - a.n; });
        if (lignes[0]) lignes[0].cls = 'is-top';
        return { titre: p.titre, parts: partsTxt(b), total: String(tot), lignes: lignes, incomplet: lignes.some(function (l) { return l.manque; }) };
      });
      adm.vide = !adm.rows.length;
    }

    return {
      nom: T.nom || 'Les Marées d’or', sousTitre: T.sousTitre || '', edition: T.edition || '', saison: T.saison || '', quand: quand, heure: T.heure || '', lieu: T.lieu || '', adresse: T.adresse || '', lieuNote: T.lieuNote || '', territoire: T.territoire || '',
      phaseLabel: ((T.phases || []).find(function (x) { return x.id === phase; }) || {}).titre || '',
      phases: (T.phases || []).map(function (x) { var i = ORDRE.indexOf(x.id); return { titre: x.titre, quand: x.quand, texte: x.texte, cls: i < iPh ? 'is-done' : i === iPh ? 'is-on' : '', etat: i < iPh ? 'Fait' : i === iPh ? 'En cours' : 'À venir' }; }),
      voteOuvert: prix.some(ouvert), showSoiree: true,
      discs: [], soiree: prix.map(carte), nbVagues: String(vagues.length), nbSoiree: String(autres.length), nbPrix: String(prix.length),
      baremes: (T.baremes || []).map(function (b) {
        var parts = [[b.jury, 'Jury', 'j'], [b.public, 'Public', 'p'], [b.pairs, 'Pairs', 'r']].filter(function (x) { return +x[0] > 0; }).map(function (x) { return { label: x[1], pct: x[0] + ' %', w: x[0] + '%', cls: 'mo-part-' + x[2] }; });
        var g = (b.grille || []).map(function (x) { return { critere: x.critere, points: String(x.points) }; });
        return { titre: b.titre, parts: parts, grille: g, hasGrille: g.length > 0, total: String(g.reduce(function (a, x) { return a + (+x.points || 0); }, 0)), note: b.note || '', hasNote: !!b.note };
      }),
      regles: (T.regles || []).map(function (t) { return { t: t }; }),
      jury: (T.jury || []).map(function (j) { return { role: j.role, nom: j.nom || 'À désigner', cls: j.nom ? '' : 'is-vide' }; }),
      trophees: trophees, totalTrophees: String(total), fabrication: T.fabrication || '',
      deroule: (T.deroule || []).map(function (x) { return { heure: x.heure, quoi: x.quoi }; }),
      remises: prix.map(function (p) { return { prix: p.titre, trophee: NOMS[p.trophee] || '', img: 'assets/trophees/' + (p.trophee || 'vague') + '.svg', remisPar: p.remisPar || '', remettant: p.remettant || 'Nom à confirmer', cls: p.remettant ? '' : 'is-vide', a: palmares && p.laureat ? p.laureat : 'Lauréat(e) annoncé(e) le soir' }; }),
      proposer: function () { app.go('contact'); },
      allerVote: function () { try { var el = document.getElementById('mo-prix'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} },
      adm: adm
    };
  }

  return { vals: vals, edition: edition };
})();
