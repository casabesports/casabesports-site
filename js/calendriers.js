/*
 * Casa Besports : calendriers complets de la saison, chargés à la demande.
 * Les fichiers contenus/calendriers/<id>.json sont écrits par les imports automatiques (outils/import_*.py,
 * tâche planifiée « Résultats et classements »). index.json liste les compétitions qui en ont un.
 * Le site ne télécharge le calendrier d'une compétition que lorsqu'un visiteur l'ouvre dans « Le Terrain ».
 * Les matchs chargés sont rangés dans window.CASA_CALENDRIERS = { id: { sport, source, matches } }.
 */
(function () {
  var src = (document.currentScript && document.currentScript.src) || '';
  var ver = (src.split('?v=')[1] || '').split('&')[0];
  var q = ver && ver !== '__VERSION__' ? '?v=' + encodeURIComponent(ver) : '';
  var index = null, attente = null, enCours = {};
  window.CASA_CALENDRIERS = window.CASA_CALENDRIERS || {};

  function lireIndex() {
    if (index) return Promise.resolve(index);
    if (attente) return attente;
    attente = fetch('contenus/calendriers/index.json' + q).then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; }).then(function (i) { index = i || {}; return index; });
    return attente;
  }

  window.CasaCalendrier = {
    // charge le calendrier complet d'une compétition (une seule fois), puis appelle fini()
    charger: function (id, fini) {
      if (!id || window.CASA_CALENDRIERS[id] || enCours[id]) return;
      enCours[id] = true;
      lireIndex().then(function (i) {
        if (!i[id]) return null;
        return fetch('contenus/calendriers/' + encodeURIComponent(id) + '.json' + q).then(function (r) { return r.ok ? r.json() : null; });
      }).then(function (d) {
        if (!d || !d.matches) return;
        window.CASA_CALENDRIERS[id] = d;
        if (fini) fini();
      }).catch(function () {});
    },
    // nombre de matchs du calendrier complet (null si la compétition n'en a pas, ou index pas encore lu)
    taille: function (id) { return index ? (index[id] || 0) : null; }
  };
})();
