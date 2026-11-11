/*
 * Casa Besports — résultats, calendriers et classements réels.
 * Mis à jour par l'automatisation « Résultats et classements » (voir docs/AUTOMATISATIONS.md).
 * Tant qu'une compétition n'a pas de données ici, le site affiche « aucune donnée » au lieu d'inventer.
 *
 * comps   : { Discipline: [{ id, label }] }                       compétitions affichées dans « Le Terrain »
 * tables  : { idCompetition: [{ team, j, g, n, p, diff, pts, form }] }   classement (form : 'VND…', 5 derniers)
 * matches : [{ id, sport, comp, date: 'AAAA-MM-JJ', time: 'HH:MM', home, away, hs, as, status: 'done'|'up', venue, source }]
 * teamClub: { 'Nom d’équipe tel qu’affiché': 'idClub' }            relie une équipe à sa fiche club
 * clubs   : [{ id, name, sport, city }]                            clubs supplémentaires
 */
window.CASA_SPORT = {
  maj: null,
  sources: [],
  comps: {},
  tables: {},
  matches: [],
  teamClub: {},
  clubs: []
};
