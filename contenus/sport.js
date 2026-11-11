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
  maj: '2026-11-11T22:55:00+01:00',
  sources: [
    'https://us-avranches.fr/calendrier-resultats-2026-2027/'
  ],
  comps: {
    Football: [{ id: 'national-1', label: 'National 1' }]
  },
  tables: {},
  matches: [
    { id: 'national-1-2026-11-21-vendee-poire-football-us-avranches-msm', sport: 'Football', comp: 'national-1', date: '2026-11-21', time: '', home: 'Vendée Poiré Football', away: 'US Avranches MSM', hs: null, as: null, status: 'up', venue: 'Stade de l’Idonnière, Le Poiré-sur-Vie', source: 'https://us-avranches.fr/calendrier-resultats-2026-2027/' }
  ],
  teamClub: { 'US Avranches MSM': 'us-avranches' },
  clubs: []
};
