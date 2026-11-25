/*
 * Casa Besports — les offres payantes côté site (grille du 2026-11-22, docs/OFFRES.md).
 *   • Club PRO : badge et vitrine des sponsors sur la fiche du club, panneau du staff dans le Vestiaire
 *     (activer Club PRO pour le club, message à tout le club, export des présences, sponsors).
 *   • BE+ Famille : l'abonné ajoute jusqu'à 3 proches (par leur adresse e-mail) dans Mon espace.
 * Tables et vérifications : supabase/offres.sql (à lancer une fois). Sans ce SQL, rien ne casse : les panneaux
 * affichent simplement « bientôt disponible ».
 */
window.CasaOffres = (function () {
  'use strict';
  var D = { pro: null, proBusy: false, fam: null, famBusy: false, famUser: null, sqlMissing: false };
  var FORMULES_PRO = ['club-pro', 'club-pro-video'];
  function A() { return window.CasaAuth && window.CasaAuth.on ? window.CasaAuth : null; }
  function uid() { var a = A(); return a && a.user ? a.user.id : null; }
  function tick(app) { app.setState({ ofTick: Date.now() }); }
  function missing(e) { return /does not exist|schema cache|PGRST20|42P01|42883|Could not find/i.test(String(e && e.message || e)); }
  function val(e) { var t = e && e.target; return t ? (t.type === 'checkbox' ? t.checked : t.value) : e; }
  function ini(n) { return String(n || '').split(/[\s’'-]+/).filter(Boolean).map(function (w) { return w.charAt(0); }).join('').slice(0, 2).toUpperCase() || '?'; }
  function lienSur(u) { u = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
  function imageSure(u) { u = String(u || '').trim(); return /^(https:\/\/[^\s"'<>]+|assets\/[\w\/.-]+)$/i.test(u) ? u : ''; }
  function ui(app) { return app.state.of || {}; }
  function set(app, patch) { app.setState({ of: Object.assign({}, ui(app), patch) }); }

  // ---------- Club PRO : la liste des clubs PRO actifs (lisible par tous) ----------
  function chargerPro(app, force) {
    if (!A() || D.proBusy || (D.pro && !force)) return;
    D.proBusy = true;
    A().db(function (c) { return c.rpc('clubs_pro_actifs'); })
      .then(function (rows) { D.pro = {}; (rows || []).forEach(function (r) { if (r && r.club) D.pro[r.club] = r; }); },
        function (e) { D.pro = {}; if (missing(e)) D.sqlMissing = true; })
      .then(function () { D.proBusy = false; tick(app); });
  }
  function estPro(club) { return !!(D.pro && D.pro[club]); }
  function sponsorsDe(club) { var p = D.pro && D.pro[club]; return p && Array.isArray(p.sponsors) ? p.sponsors : []; }

  // Fiche du club : badge et vitrine des sponsors
  function ficheClub(app, club) {
    chargerPro(app);
    var lien = typeof window.cbPartnerLink === 'function' ? window.cbPartnerLink : function (u) { return u; };
    var sp = sponsorsDe(club).map(function (s, i) {
      var href = lienSur(s.lien); var logo = imageSure(s.logo);
      return { nom: String(s.nom || ''), href: href ? lien(href, 'club-' + club + '-' + i, 'sponsor-club') : '', hasHref: !!href, noHref: !href,
        logo: logo, hasLogo: !!logo, noLogo: !logo, ini: ini(s.nom), aria: (s.nom || 'Sponsor') + ' (nouvel onglet)' };
    }).filter(function (s) { return s.nom; });
    return { pro: estPro(club), sponsors: sp, hasSponsors: sp.length > 0 };
  }

  // ---------- Vestiaire : panneau Club PRO du staff ----------
  function saison() { var d = new Date(); var y = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1; return new Date(y, 7, 1); }
  function csvCell(v) { v = v == null ? '' : String(v); return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function exporter(app, club, nomClub) {
    var debut = saison();
    set(app, { proExport: true });
    A().db(function (c) { return c.from('vestiaire_evenements').select('id, debut, type, section, equipe, titre, adversaire, annule').eq('club', club).gte('debut', debut.toISOString()).order('debut').limit(1000); })
      .then(function (evs) {
        evs = evs || []; if (!evs.length) return [evs, []];
        var ids = evs.map(function (e) { return e.id; }); var lots = [];
        for (var i = 0; i < ids.length; i += 150) lots.push(ids.slice(i, i + 150));
        return Promise.all(lots.map(function (l) { return A().db(function (c) { return c.from('vestiaire_presences').select('evenement_id, reponse, vestiaire_membres(nom, section)').in('evenement_id', l); }); }))
          .then(function (rs) { return [evs, [].concat.apply([], rs.map(function (r) { return r || []; }))]; });
      })
      .then(function (r) {
        var evs = r[0], pres = r[1]; var parEv = {}; evs.forEach(function (e) { parEv[e.id] = e; });
        var REP = { present: 'Présent', absent: 'Absent', incertain: 'Incertain' };
        var TYPE = { entrainement: 'Entraînement', match: 'Match', autre: 'Rendez-vous' };
        var lignes = [['Date', 'Heure', 'Type', 'Section', 'Équipe', 'Titre ou adversaire', 'Annulé', 'Nom', 'Réponse']];
        pres.forEach(function (p) {
          var e = parEv[p.evenement_id]; if (!e) return; var d = new Date(e.debut); var m = p.vestiaire_membres || {};
          lignes.push([d.toLocaleDateString('fr-FR'), d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), TYPE[e.type] || e.type, e.section, e.equipe || '', e.adversaire || e.titre || '', e.annule ? 'oui' : '', m.nom || '', REP[p.reponse] || p.reponse]);
        });
        // Bilan par personne, à la suite
        var bilan = {}; pres.forEach(function (p) { var m = p.vestiaire_membres || {}; var k = m.nom || '?'; bilan[k] = bilan[k] || { present: 0, absent: 0, incertain: 0 }; bilan[k][p.reponse] = (bilan[k][p.reponse] || 0) + 1; });
        lignes.push([]); lignes.push(['Bilan de la saison', '', '', '', '', '', '', 'Nom', 'Présent / Absent / Incertain']);
        Object.keys(bilan).sort().forEach(function (k) { var b = bilan[k]; lignes.push(['', '', '', '', '', '', '', k, b.present + ' / ' + b.absent + ' / ' + b.incertain]); });
        var csv = '﻿' + lignes.map(function (l) { return l.map(csvCell).join(';'); }).join('\r\n');
        var url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        var a = document.createElement('a'); a.href = url; a.download = 'presences-' + String(nomClub || club).toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-saison-' + debut.getFullYear() + '.csv';
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
        app.say(pres.length ? 'Tableau des présences téléchargé (' + evs.length + ' rendez-vous).' : 'Aucune présence enregistrée cette saison pour l’instant.');
      }, function (e) { app.say('Export impossible : ' + (e && e.message || e)); })
      .then(function () { set(app, { proExport: false }); });
  }
  function vestiaire(app, club, nomClub, staff) {
    var s = app.state, f = ui(app);
    chargerPro(app);
    var actif = estPro(club);
    var abonne = !!s.clubPro;
    var out = { show: !!staff && !!A(), actif: actif, inactif: !actif, sqlMissing: D.sqlMissing,
      abonne: abonne, peutActiver: !actif && abonne, doitSabonner: !actif && !abonne,
      offre: function () { app.go('work', { proTab: 'clubs' }); setTimeout(function () { try { var el = document.getElementById('pro-tarifs'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 120); },
      activerLabel: f.proBusy ? 'Activation…' : 'Activer Club PRO pour ' + (nomClub || 'ce club'),
      activer: function () {
        if (f.proBusy) return; set(app, { proBusy: true });
        A().db(function (c) { return c.rpc('club_pro_activer', { c: club }); })
          .then(function () { app.say('Club PRO est activé pour ' + (nomClub || 'le club') + '.'); chargerPro(app, true); },
            function (e) { app.say(missing(e) ? (app.state.role === 'admin' ? 'Club PRO sera disponible dès que la base est mise à jour (supabase/offres.sql).' : 'Club PRO sera disponible très bientôt.') : e.message); })
          .then(function () { set(app, { proBusy: false }); });
      }
    };
    if (!actif) return out;
    // Message à tout le club (notification)
    var m = f.proMsg || {};
    out.msg = { section: m.section || 'club', onSection: function (e) { set(app, { proMsg: Object.assign({}, m, { section: val(e) }) }); },
      secOpts: [{ v: 'club', l: 'Tout le club' }, { v: 'seniors', l: 'Section seniors' }, { v: 'jeunes', l: 'Section jeunes (parents et jeunes)' }],
      titre: m.titre || '', onTitre: function (e) { set(app, { proMsg: Object.assign({}, m, { titre: val(e) }) }); },
      texte: m.texte || '', onTexte: function (e) { set(app, { proMsg: Object.assign({}, m, { texte: val(e) }) }); },
      busy: !!m.busy, label: m.busy ? 'Envoi…' : 'Envoyer la notification',
      envoyer: function () {
        var t = String(m.titre || '').trim(); if (!t) { app.say('Écrivez un titre.'); return; }
        set(app, { proMsg: Object.assign({}, m, { busy: true }) });
        A().appel('notifications', { action: 'club', club: club, section: m.section || 'club', titre: t.slice(0, 80), texte: String(m.texte || '').trim().slice(0, 240) })
          .then(function (r) { set(app, { proMsg: { section: m.section } }); app.say(r && r.envoyees ? r.envoyees + ' appareil' + (r.envoyees > 1 ? 's' : '') + ' prévenu' + (r.envoyees > 1 ? 's' : '') + '.' : 'Message envoyé. Personne n’a encore activé les notifications dans cette section.'); },
            function (e) { set(app, { proMsg: Object.assign({}, m, { busy: false }) }); app.say(e && e.message || 'Envoi impossible.'); });
      } };
    out.exporter = function () { if (!f.proExport) exporter(app, club, nomClub); };
    out.exportLabel = f.proExport ? 'Préparation du tableau…' : 'Exporter les présences de la saison';
    // Vitrine des sponsors
    var brouillon = Array.isArray(f.proSp) && f.proSpClub === club ? f.proSp : sponsorsDe(club).map(function (x) { return { nom: x.nom || '', lien: x.lien || '', logo: x.logo || '' }; });
    var maj = function (liste) { set(app, { proSp: liste, proSpClub: club }); };
    out.sp = {
      open: !!f.proSpOpen, closed: !f.proSpOpen, toggle: function () { set(app, { proSpOpen: !f.proSpOpen }); },
      n: String(sponsorsDe(club).length),
      lignes: brouillon.map(function (x, i) {
        var champ = function (k) { return function (e) { var l = brouillon.slice(); l[i] = Object.assign({}, l[i]); l[i][k] = val(e); maj(l); }; };
        return { nom: x.nom, lien: x.lien, logo: x.logo, onNom: champ('nom'), onLien: champ('lien'), onLogo: champ('logo'), num: String(i + 1),
          retirer: function () { var l = brouillon.slice(); l.splice(i, 1); maj(l); } };
      }),
      peutAjouter: brouillon.length < 12, ajouter: function () { maj(brouillon.concat([{ nom: '', lien: '', logo: '' }])); },
      busy: !!f.proSpBusy, label: f.proSpBusy ? 'Enregistrement…' : 'Enregistrer la vitrine',
      enregistrer: function () {
        var liste = brouillon.map(function (x) { return { nom: String(x.nom || '').trim().slice(0, 60), lien: String(x.lien || '').trim().slice(0, 300), logo: String(x.logo || '').trim().slice(0, 300) }; }).filter(function (x) { return x.nom; });
        var bad = liste.find(function (x) { return (x.lien && !lienSur(x.lien)) || (x.logo && !imageSure(x.logo)); });
        if (bad) { app.say('« ' + bad.nom + ' » : le lien et le logo doivent commencer par https://'); return; }
        set(app, { proSpBusy: true });
        A().db(function (c) { return c.rpc('club_pro_sponsors', { c: club, s: liste }); })
          .then(function () { app.say('Vitrine des sponsors enregistrée.'); set(app, { proSp: null, proSpOpen: false }); chargerPro(app, true); }, function (e) { app.say(e.message); })
          .then(function () { set(app, { proSpBusy: false }); });
      }
    };
    return out;
  }

  // ---------- BE+ Famille : les proches de l'abonné ----------
  function chargerFamille(app) {
    if (!A() || D.famBusy) return;
    D.famBusy = true; D.famUser = uid();
    A().db(function (c) { return c.from('abonnements').select('id, formule, statut, cadeau, fin, user_id').eq('formule', 'famille').order('cree_le', { ascending: false }); })
      .then(function (abos) {
        var P = window.CasaPaiement; var a = (abos || []).filter(function (x) { return !P || P.estActif(x); })[0];
        if (!a) return { abo: null, membres: [] };
        return A().db(function (c) { return c.from('famille_membres').select('email, ajoute_le').eq('abonnement_id', a.id).order('ajoute_le'); })
          .then(function (m) { return { abo: a, membres: m || [] }; });
      })
      .then(function (r) { D.fam = r; }, function (e) { D.fam = { abo: null, membres: [] }; if (missing(e)) D.sqlMissing = true; })
      .then(function () { D.famBusy = false; tick(app); });
  }
  function famille(app) {
    var s = app.state, f = ui(app);
    if (!s.loggedIn || !A()) return { show: false };
    if (D.famUser !== uid()) D.fam = null;
    if (D.fam === null) { chargerFamille(app); return { show: false }; }
    if (!D.fam.abo) return { show: false };
    var max = 3;
    var membres = D.fam.membres;
    var retirer = function (email) { return function () {
      A().db(function (c) { return c.from('famille_membres').delete().eq('abonnement_id', D.fam.abo.id).eq('email', email); })
        .then(function () { app.say(email + ' n’a plus accès à BE+ Famille.'); D.fam = null; tick(app); }, function (e) { app.say(e.message); });
    }; };
    return { show: true, membres: membres.map(function (m) { return { email: m.email, retirer: retirer(m.email) }; }), hasMembres: membres.length > 0,
      places: String(max - membres.length), peutAjouter: membres.length < max,
      email: f.famEmail || '', onEmail: function (e) { set(app, { famEmail: val(e) }); }, busy: !!f.famBusy, label: f.famBusy ? 'Ajout…' : 'Ajouter',
      ajouter: function () {
        var e = String(f.famEmail || '').trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) { app.say('Adresse e-mail invalide.'); return; }
        set(app, { famBusy: true });
        A().db(function (c) { return c.from('famille_membres').insert({ abonnement_id: D.fam.abo.id, email: e }); })
          .then(function () { app.say(e + ' profite maintenant de BE+ : il lui suffit de se connecter avec cette adresse.'); set(app, { famEmail: '' }); D.fam = null; tick(app); },
            function (er) { app.say(/duplicate|unique/i.test(er.message) ? 'Cette adresse est déjà dans votre famille.' : er.message); })
          .then(function () { set(app, { famBusy: false }); });
      } };
  }
  function oublier() { D.fam = null; D.famUser = null; }

  return { chargerPro: chargerPro, estPro: estPro, ficheClub: ficheClub, vestiaire: vestiaire, famille: famille, oublier: oublier, FORMULES_PRO: FORMULES_PRO, _data: D };
})();
