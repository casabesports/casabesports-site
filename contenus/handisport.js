/*
 * Casa Besports — la rubrique « Handisport et sport adapté » (page /handisport, dans Clubs).
 * Une seule rubrique pour tout le Cotentin, rangée par discipline : on cherche d'abord un sport, puis le club qui le propose.
 *
 * Comment un club apparaît ici : dans l'admin › Clubs, remplissez « Handisport : pratiques proposées » sur la fiche du club
 * (une pratique par ligne, avec le nom de la discipline, ex. « Basket fauteuil »). Le club est alors rangé sous la bonne
 * discipline, reçoit le badge Handisport sur sa carte et un encadré sur sa fiche. N'ajoutez une section qu'après l'accord du club.
 *
 * famille : « Handisport » (handicap moteur ou sensoriel) ou « Sport adapté » (handicap mental ou psychique)
 * sport : la discipline du site liée (bouton « Voir les clubs de … »), vide si aucune
 * mots : les mots qui rangent un club sous cette discipline (sans tenir compte des majuscules ni des accents)
 * Modifiable depuis l’espace administrateur (Contenus du site › Handisport). Une version modifiée en ligne passe avant ce fichier.
 */
window.CASA_HANDISPORT = {
  "titre": "Le sport, pour tout le monde",
  "intro": "Basket fauteuil, cécifoot, volley assis, football adapté… Toutes les pratiques handisport et sport adapté réunies au même endroit, discipline par discipline, avec les clubs du Cotentin et de la Manche qui les proposent.",
  "appel": "Votre club a une section handisport ou sport adapté ? Dites-le à la rédaction : elle apparaîtra ici, sous sa discipline, et sur la fiche du club.",
  "disciplines": [
    {
      "id": "basket-fauteuil",
      "nom": "Basket fauteuil",
      "famille": "Handisport",
      "sport": "Basketball",
      "mots": ["basket fauteuil", "basket-fauteuil", "basket en fauteuil"],
      "texte": "Le basket en fauteuil roulant, sur le même terrain et au même panier que le basket debout. Pour les personnes avec un handicap moteur ; de nombreux clubs accueillent aussi des joueurs valides en loisir."
    },
    {
      "id": "handfauteuil",
      "nom": "Hand’Fauteuil",
      "famille": "Handisport",
      "sport": "Handball",
      "mots": ["hand fauteuil", "handfauteuil", "hand'fauteuil", "hand’fauteuil", "handball fauteuil"],
      "texte": "Le handball en fauteuil roulant, porté par la Fédération française de handball. Il se joue en équipes mixtes : personnes en situation de handicap et personnes valides sur le même terrain."
    },
    {
      "id": "cecifoot",
      "nom": "Cécifoot",
      "famille": "Handisport",
      "sport": "Football",
      "mots": ["cécifoot", "cecifoot", "foot non-voyant", "football déficient visuel"],
      "texte": "Le football des personnes aveugles et malvoyantes : un ballon sonore, des joueurs aux yeux bandés et un gardien voyant qui guide sa défense."
    },
    {
      "id": "foot-fauteuil",
      "nom": "Foot fauteuil électrique",
      "famille": "Handisport",
      "sport": "Football",
      "mots": ["foot fauteuil", "football fauteuil", "fauteuil électrique"],
      "texte": "Pour les personnes qui se déplacent en fauteuil électrique : un grand ballon poussé avec un pare-chocs fixé au fauteuil, en équipes de quatre."
    },
    {
      "id": "foot-adapte",
      "nom": "Football adapté",
      "famille": "Sport adapté",
      "sport": "Football",
      "mots": ["football adapté", "foot adapté", "foot sport adapté"],
      "texte": "Le football ouvert aux personnes avec un handicap mental ou psychique, en loisir ou en compétition, avec la Fédération française du sport adapté."
    },
    {
      "id": "volley-assis",
      "nom": "Volley assis",
      "famille": "Handisport",
      "sport": "Volley-ball",
      "mots": ["volley assis", "para volley", "para-volley"],
      "texte": "Le volley joué assis au sol, avec un filet plus bas et un terrain réduit. Accessible aux personnes avec un handicap des jambes, et souvent pratiqué avec des valides."
    },
    {
      "id": "rugby-fauteuil",
      "nom": "Rugby fauteuil",
      "famille": "Handisport",
      "sport": "Rugby",
      "mots": ["rugby fauteuil", "rugby en fauteuil", "rugby à xiii fauteuil"],
      "texte": "Un sport de contact en fauteuil renforcé, à quatre contre quatre, pour les personnes avec un handicap qui touche à la fois les bras et les jambes."
    },
    {
      "id": "para-natation",
      "nom": "Para-natation",
      "famille": "Handisport",
      "sport": "Natation",
      "mots": ["para-natation", "paranatation", "natation handisport", "natation adaptée", "natation handi"],
      "texte": "La natation pour les handicaps moteurs, visuels ou mentaux, avec des classes qui permettent de nager à niveau égal. Une porte d’entrée fréquente vers le sport."
    },
    {
      "id": "joelette",
      "nom": "Randonnée et trail en joëlette",
      "famille": "Handisport",
      "sport": "Trail",
      "mots": ["joëlette", "joelette", "randonnée adaptée", "trail adapté"],
      "texte": "La joëlette est un fauteuil tout-terrain à une roue, guidé par des accompagnateurs. Elle permet de partager sentiers, falaises et chemins côtiers avec une personne qui ne peut pas marcher."
    },
    {
      "id": "para-athletisme",
      "nom": "Para-athlétisme",
      "famille": "Handisport",
      "sport": "",
      "mots": ["para-athlétisme", "para athlétisme", "athlétisme handisport", "course en fauteuil"],
      "texte": "Courses, sauts et lancers, debout ou en fauteuil, avec des catégories selon le handicap. Les athlètes malvoyants courent avec un guide."
    },
    {
      "id": "tennis-fauteuil",
      "nom": "Tennis fauteuil",
      "famille": "Handisport",
      "sport": "Tennis",
      "mots": ["tennis fauteuil", "tennis en fauteuil", "para tennis"],
      "texte": "Le tennis en fauteuil roulant, avec une seule différence de règle : la balle peut rebondir deux fois. Il se joue souvent dans les clubs de tennis classiques."
    },
    {
      "id": "para-tennis-de-table",
      "nom": "Para tennis de table",
      "famille": "Handisport",
      "sport": "Ping-pong",
      "mots": ["para tennis de table", "ping fauteuil", "tennis de table handisport", "ping-pong handi"],
      "texte": "Le tennis de table assis ou debout, ouvert à de nombreux handicaps. Une discipline où personnes valides et handicapées s’entraînent volontiers à la même table."
    },
    {
      "id": "para-judo",
      "nom": "Para-judo",
      "famille": "Handisport",
      "sport": "Judo",
      "mots": ["para-judo", "parajudo", "judo déficient visuel", "judo adapté", "judo handi"],
      "texte": "Le judo des personnes déficientes visuelles : le combat commence kimono déjà saisi. Le judo adapté accueille aussi les personnes avec un handicap mental."
    },
    {
      "id": "boccia",
      "nom": "Boccia",
      "famille": "Handisport",
      "sport": "",
      "mots": ["boccia"],
      "texte": "Un jeu de précision proche de la pétanque, avec des balles en cuir, pour les personnes avec un handicap moteur important. Discipline paralympique."
    },
    {
      "id": "voile-adaptee",
      "nom": "Voile adaptée",
      "famille": "Handisport",
      "sport": "",
      "mots": ["voile adaptée", "handivoile", "voile handisport", "char à voile adapté"],
      "texte": "Des bateaux adaptés et des clubs nautiques équipés pour naviguer avec un handicap moteur, visuel ou mental. Sur nos côtes, une façon simple de découvrir la mer autrement."
    },
    {
      "id": "sport-adapte",
      "nom": "Sport adapté multisport",
      "famille": "Sport adapté",
      "sport": "",
      "mots": ["sport adapté", "multisport adapté"],
      "texte": "Pour les personnes avec un handicap mental ou psychique : jeux collectifs, athlétisme, natation, sports de raquette… à leur rythme, en loisir ou en compétition."
    }
  ],
  "liens": [
    { "nom": "Handiguide des sports", "texte": "L’annuaire du ministère des Sports pour trouver un club ou une structure qui accueille, près de chez soi.", "url": "https://handiguide.sports.gouv.fr/" },
    { "nom": "Fédération française handisport", "texte": "Handicap moteur, visuel ou auditif : disciplines, compétitions et clubs affiliés.", "url": "https://www.handisport.org/" },
    { "nom": "Fédération française du sport adapté", "texte": "Handicap mental ou psychique : disciplines, compétitions et clubs affiliés.", "url": "https://www.ffsa.asso.fr/" }
  ]
};
