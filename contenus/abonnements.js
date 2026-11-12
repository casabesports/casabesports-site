/*
 * Casa Besports — les formules d’abonnement (page Abonnements).
 * id : ne pas changer (casab, gaz-num, gaz-pap, gaz-duo, pack) · mois / an : prix en euros · perks : avantages
 * Modifiable depuis l’espace administrateur (Contenus du site). Une version modifiée en ligne passe avant ce fichier.
 */
window.CASA_ABONNEMENTS = [
  {
    "id": "casab",
    "name": "Casa B+",
    "mois": 4.99,
    "an": 49,
    "perks": [
      "Tous les articles et vidéos Premium",
      "Lecture audio et résumé express",
      "Alertes de vos clubs",
      "−10 % sur la boutique"
    ],
    "casab": true,
    "gazette": null,
    "paper": false
  },
  {
    "id": "gaz-num",
    "name": "La Gazette · Numérique",
    "mois": 3.99,
    "an": 39,
    "perks": [
      "Chaque numéro en liseuse dès sa parution",
      "Archives complètes",
      "Sur mobile, tablette et ordinateur"
    ],
    "casab": false,
    "gazette": "num",
    "paper": false
  },
  {
    "id": "gaz-pap",
    "name": "La Gazette · Papier",
    "mois": 6.9,
    "an": 69,
    "perks": [
      "Le magazine dans votre boîte aux lettres",
      "Livraison incluse dans la Manche",
      "Posters et cahier pratique"
    ],
    "casab": false,
    "gazette": "pap",
    "paper": true
  },
  {
    "id": "gaz-duo",
    "name": "La Gazette · Papier + Numérique",
    "mois": 8.9,
    "an": 89,
    "perks": [
      "Le papier chez vous",
      "La liseuse numérique en avant-première",
      "Archives complètes"
    ],
    "casab": false,
    "gazette": "duo",
    "paper": true
  },
  {
    "id": "pack",
    "name": "Pack Supporter",
    "mois": 11.9,
    "an": 119,
    "perks": [
      "Casa B+ complet",
      "La Gazette papier + numérique",
      "−10 % sur la boutique",
      "Une écharpe offerte avec l’annuel"
    ],
    "casab": true,
    "gazette": "duo",
    "paper": true
  }
];
