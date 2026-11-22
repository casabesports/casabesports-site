/*
 * Casa Besports — les formules d’abonnement (page Abonnements).
 * id : ne pas changer (casab, jeunes, famille, gaz-pap, pack, gaz-num, gaz-duo) · mois / an : prix en euros TTC · perks : avantages
 * casab : donne BE+ · gazette : 'num' (liseuse), 'pap' (papier) ou 'duo' (les deux) · paper : demande une adresse postale
 * jeunes : true = la personne certifie avoir moins de 26 ans (ou être étudiante, apprentie) au moment de payer
 * famille : nombre de comptes en tout (l’abonné + ses proches, ajoutés dans Mon espace) · masque : true = n’est plus proposé
 *   (les anciens abonnés à une formule masquée gardent leur accès)
 * Grille du 2026-11-22 (docs/OFFRES.md). Modifiable depuis l’espace administrateur (Contenus du site).
 * Une version modifiée en ligne passe avant ce fichier.
 */
window.CASA_ABONNEMENTS = [
  {
    "id": "casab",
    "name": "BE+",
    "mois": 4.99,
    "an": 49,
    "perks": [
      "Tous les articles et vidéos Premium",
      "La Gazette du Cotentin en liseuse, chaque mois",
      "Lecture audio et résumé express",
      "Alertes de vos clubs",
      "−10 % sur la boutique"
    ],
    "casab": true,
    "gazette": "num",
    "paper": false
  },
  {
    "id": "famille",
    "name": "BE+ Famille",
    "mois": 7.99,
    "an": 79,
    "famille": 4,
    "perks": [
      "BE+ complet pour 4 comptes",
      "Parents et enfants licenciés, chacun avec son compte",
      "La Gazette en liseuse pour toute la famille",
      "Vous ajoutez vos proches dans Mon espace"
    ],
    "casab": true,
    "gazette": "num",
    "paper": false
  },
  {
    "id": "jeunes",
    "name": "BE+ Jeunes",
    "mois": 2.49,
    "an": 24,
    "jeunes": true,
    "perks": [
      "BE+ complet à moitié prix",
      "Moins de 26 ans, étudiants et apprentis",
      "La Gazette en liseuse",
      "−10 % sur la boutique"
    ],
    "casab": true,
    "gazette": "num",
    "paper": false
  },
  {
    "id": "pack",
    "name": "BE+ Papier",
    "mois": 12.9,
    "an": 129,
    "perks": [
      "BE+ complet",
      "La Gazette livrée chez vous dans la Manche",
      "La liseuse numérique en avant-première",
      "−10 % sur la boutique",
      "Une écharpe offerte avec l’annuel"
    ],
    "casab": true,
    "gazette": "duo",
    "paper": true
  },
  {
    "id": "gaz-pap",
    "name": "La Gazette · Papier",
    "mois": 9.9,
    "an": 99,
    "perks": [
      "Le magazine de 31 pages dans votre boîte aux lettres",
      "Livraison incluse dans la Manche",
      "Posters et cahier pratique"
    ],
    "casab": false,
    "gazette": "pap",
    "paper": true
  },
  {
    "id": "gaz-num",
    "name": "La Gazette · Numérique",
    "mois": 3.99,
    "an": 39,
    "masque": true,
    "perks": [
      "Chaque numéro en liseuse dès sa parution",
      "Archives complètes"
    ],
    "casab": false,
    "gazette": "num",
    "paper": false
  },
  {
    "id": "gaz-duo",
    "name": "La Gazette · Papier + Numérique",
    "mois": 8.9,
    "an": 89,
    "masque": true,
    "perks": [
      "Le papier chez vous",
      "La liseuse numérique en avant-première"
    ],
    "casab": false,
    "gazette": "duo",
    "paper": true
  }
];
