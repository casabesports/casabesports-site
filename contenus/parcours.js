/*
 * Casa Besports — « Les Escales du Cotentin » (Culture › Parcours sport & patrimoine).
 * Chaque parcours relie des lieux d'histoire, les « escales ». Gardez, modifiez, supprimez ou ajoutez des parcours.
 *
 *   id      : identifiant court unique (sans espace)          name : nom affiché
 *   modes   : façons de le faire, parmi 'marche', 'course', 'trail', 'velo', 'autre'
 *   area    : secteur · city : commune pour la météo · level : Accessible, Modéré ou Exigeant
 *   boucle  : true si l'on revient au point de départ
 *   img     : photo de la carte (identifiant d'image du site ou chemin assets/…)
 *   desc    : présentation courte
 *   gpx     : (facultatif) VOTRE TRACÉ VÉRIFIÉ, par exemple 'assets/parcours/hague.gpx'.
 *             Enregistrez la sortie avec Strava, Garmin ou une autre appli, exportez-la en GPX et déposez le fichier
 *             dans assets/parcours/ : il remplace le tracé calculé automatiquement et donne la vraie distance.
 *   escales : les étapes, dans l'ordre. lat / lon = position du lieu (Wikidata, identifiant Q… en commentaire).
 *             lieu : (facultatif) identifiant d'un lieu de contenus/lieux.js, pour afficher son « moment d'histoire ».
 *
 * Sans fichier gpx, le tracé est calculé dans le navigateur par le service d'itinéraire de l'IGN (Géoplateforme,
 * gratuit, sans clé) sur les chemins de la BD TOPO, avec l'altitude de l'IGN pour le dénivelé.
 * Il peut passer par la route plutôt que par le sentier : suivez toujours le balisage sur place.
 */
window.CASA_PARCOURS = [
  { id: 'rade', name: 'La boucle de la rade', modes: ['course', 'marche'], area: 'Cherbourg-en-Cotentin', city: 'Cherbourg', level: 'Accessible', boucle: true,
    img: '37f0accd200070c08850e6289a7929b2',
    desc: 'Une boucle urbaine entre mer et colline : la gare maritime, les quais et la montée vers le fort du Roule.',
    escales: [
      { nom: 'Gare maritime', d: 'la Cité de la Mer, escale du Titanic en 1912', lat: 49.6468, lon: -1.6174, lieu: 'gare' }, // Q2974764
      { nom: 'Les quais', d: 'face à la plus grande rade artificielle du monde', lat: 49.64449, lon: -1.61087, lieu: 'rade' }, // Q3398472
      { nom: 'Montagne du Roule', d: 'le fort et le musée de la Libération', lat: 49.630736, lon: -1.616324 } // Q23718908
    ] },
  { id: 'hague', name: 'Sentier des douaniers', modes: ['trail', 'marche'], area: 'La Hague', city: 'Beaumont-Hague', level: 'Exigeant',
    img: '68220997b900b01cc4ef65a2529b0ff1',
    desc: 'Le littoral sauvage de la Hague par le sentier côtier (GR223), entre falaises, criques et villages de pêcheurs.',
    escales: [
      { nom: 'Nez de Jobourg', d: 'falaises parmi les plus hautes d’Europe', lat: 49.6719, lon: -1.94005, lieu: 'jobourg' }, // Q3339229
      { nom: 'Goury', d: 'le petit port d’Auderville, face au phare de la Hague', lat: 49.7157, lon: -1.94615 }, // Q110754972
      { nom: 'Port Racine', d: 'un minuscule port niché dans l’anse Saint-Martin', lat: 49.71212, lon: -1.89664 }, // Q49388527
      { nom: 'Omonville-la-Petite', d: 'le village où vécut Jacques Prévert', lat: 49.700277, lon: -1.882777 } // Q626836
    ] },
  { id: 'millet', name: 'Le chemin de Millet', modes: ['marche', 'course'], area: 'La Hague', city: 'Gréville-Hague', level: 'Accessible', boucle: true,
    img: '68220997b900b01cc4ef65a2529b0ff1',
    desc: 'Du bourg de Gréville au hameau de Gruchy, sur les pas du peintre de L’Angélus, né ici en 1814.',
    escales: [
      { nom: 'Gréville-Hague', d: 'le bourg et son église, que Millet a peinte', lat: 49.674722, lon: -1.800833 }, // Q767634
      { nom: 'Gruchy', d: 'la maison natale de Jean-François Millet', lat: 49.682222, lon: -1.791111 } // Q3280233
    ] },
  { id: 'saire', name: 'Du port au phare', modes: ['velo', 'marche', 'course'], area: 'Val de Saire', city: 'Barfleur', level: 'Accessible',
    img: 'f46b43bf0cb05c3fde4cba8ae7d9c8d5',
    desc: 'De Barfleur à la pointe de Gatteville, sur les traces du naufrage de la Blanche-Nef.',
    escales: [
      { nom: 'Port de Barfleur', d: 'au large duquel sombra la Blanche-Nef en 1120', lat: 49.670838, lon: -1.261078 }, // Q136656232
      { nom: 'Église Saint-Nicolas', d: 'l’église de Barfleur, au bord de la mer', lat: 49.672697, lon: -1.260037 }, // Q22963173
      { nom: 'Phare de Gatteville', d: '75 m, allumé en 1835', lat: 49.696422, lon: -1.265914, lieu: 'gatteville' } // Q964781
    ] },
  { id: 'juin', name: 'Mémoire du 6 juin', modes: ['velo', 'course'], area: 'Centre Cotentin', city: 'Carentan', level: 'Modéré',
    img: '66637b2212fc497ace187dc8cf592255',
    desc: 'Un itinéraire du souvenir entre le bourg des parachutistes et la plage du Débarquement.',
    escales: [
      { nom: 'Sainte-Mère-Église', d: 'le musée Airborne et les parachutistes de la 82e division aéroportée', lat: 49.408333, lon: -1.315, lieu: 'sme' }, // Q3329035
      { nom: 'Sainte-Marie-du-Mont', d: 'la commune sur laquelle se trouve Utah Beach', lat: 49.378333, lon: -1.226111 }, // Q658513
      { nom: 'Utah Beach', d: 'plage du Débarquement du 6 juin 1944 et son musée', lat: 49.415, lon: -1.17514 } // Q18380084
    ] }
];
