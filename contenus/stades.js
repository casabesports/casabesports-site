/*
 * Casa Besports — les lieux de la réalité augmentée (« Ma compo en AR »).
 *
 * Comment ça marche : pour chaque équipe, on part d'une commune (liste « lieux »). Le site cherche
 * alors sur OpenStreetMap le VRAI terrain de la discipline choisie le plus proche (stade de foot,
 * terrain de rugby, gymnase, piscine, court de tennis, piste d'athlétisme), l'oriente comme en vrai
 * et l'entoure des photos aériennes IGN et des bâtiments réels du quartier.
 *
 * Vous pouvez :
 *   - ajouter une commune dans « lieux » : { id: 'court-sans-espace', nom: 'Nom affiché', lat: 49.6, lon: -1.6 }
 *     (latitude / longitude : clic droit sur Google Maps ou geoportail.gouv.fr > « Coordonnées »)
 *   - choisir la commune de chaque équipe dans « equipes » (cherche : un mot du nom du stade, pour viser le bon)
 *   - fixer un stade précis dans « exacts » si la recherche automatique ne tombe pas juste :
 *     { nom: 'Stade …', sport: 'football', lat: 49.64, lon: -1.66, angle: 20, longueur: 105, largeur: 68 }
 *     sport : football, rugby, basket, hand, volley, waterpolo, tennis, roller, athle
 *     angle : orientation du grand côté du terrain, en degrés par rapport au nord (0 = nord-sud, 90 = est-ouest)
 */
window.CASA_STADES = {
  lieux: [
    { id: 'cherbourg', nom: 'Cherbourg-en-Cotentin', lat: 49.6386, lon: -1.6164 },
    { id: 'equeurdreville', nom: 'Équeurdreville-Hainneville', lat: 49.6475, lon: -1.6617 },
    { id: 'tourlaville', nom: 'Tourlaville', lat: 49.6386, lon: -1.5686 },
    { id: 'querqueville', nom: 'Querqueville', lat: 49.6650, lon: -1.6940 },
    { id: 'la-hague', nom: 'La Hague (Beaumont-Hague)', lat: 49.6633, lon: -1.8389, rayon: 9000 },
    { id: 'les-pieux', nom: 'Les Pieux', lat: 49.5128, lon: -1.8064 },
    { id: 'valognes', nom: 'Valognes', lat: 49.5089, lon: -1.4703 },
    { id: 'bricquebec', nom: 'Bricquebec-en-Cotentin', lat: 49.4703, lon: -1.6331 },
    { id: 'barneville', nom: 'Barneville-Carteret', lat: 49.3836, lon: -1.7514, rayon: 9000 },
    { id: 'carentan', nom: 'Carentan-les-Marais', lat: 49.3036, lon: -1.2481 },
    { id: 'saint-pierre-eglise', nom: 'Saint-Pierre-Église', lat: 49.6683, lon: -1.4031, rayon: 9000 },
    { id: 'saint-lo', nom: 'Saint-Lô', lat: 49.1158, lon: -1.0906 },
    { id: 'coutances', nom: 'Coutances', lat: 49.0481, lon: -1.4453 },
    { id: 'granville', nom: 'Granville', lat: 48.8375, lon: -1.5972 }
  ],
  equipes: {
    'ES Pointe-Hague': { lieu: 'la-hague' },
    'AS Cherbourg': { lieu: 'equeurdreville', cherche: 'Postaire' },
    'FCEH': { lieu: 'equeurdreville' },
    'AS Tourlaville': { lieu: 'tourlaville' },
    'CS Carentan': { lieu: 'carentan' },
    'US Côte des Isles': { lieu: 'barneville' },
    'Mon équipe': { lieu: 'cherbourg' }
  },
  exacts: []
};
