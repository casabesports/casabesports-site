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
  maj: '2026-11-22T18:10:00+01:00',
  sources: [
    'https://us-avranches.fr/calendrier-resultats-2026-2027/'
  ],
  comps: {
    Football: [{ id: 'cdf', label: 'Coupe de France' }, { id: 'r2', label: 'Régional 2' }, { id: 'r1', label: 'Régional 1' }, { id: 'national-1', label: 'National 1' }],
    Basketball: [{ id: 'tic', label: 'Tournoi international' }],
    'Water-polo': [{ id: 'cdm', label: 'Coupe de la Manche' }],
    Rugby: [{ id: 'gala', label: 'Matchs de gala' }]
  },
  tables: {},
  matches: [
    { id: 'national-1-2026-11-21-vendee-poire-football-us-avranches-msm', sport: 'Football', comp: 'national-1', date: '2026-11-21', time: '', home: 'Vendée Poiré Football', away: 'US Avranches MSM', hs: null, as: null, status: 'up', venue: 'Stade de l’Idonnière, Le Poiré-sur-Vie', source: 'https://us-avranches.fr/calendrier-resultats-2026-2027/' },
    { id: 'national-1-2026-12-05-us-avranches-msm-stade-briochin', sport: 'Football', comp: 'national-1', date: '2026-12-05', time: '', home: 'US Avranches MSM', away: 'Stade Briochin', hs: null, as: null, status: 'up', venue: 'Stade René Fenouillère, Avranches', source: 'https://us-avranches.fr/calendrier-resultats-2026-2027/' }
  ],
  teamClub: { 'US Avranches MSM': 'us-avranches' },
  clubs: []
};
