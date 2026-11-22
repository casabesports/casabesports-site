/*
 * Casa Besports — offres payantes pour les professionnels (page Casa PRO).
 * id : ne pas changer (ar-pro, club-pro, club-pro-video) · mois / an : prix en euros TTC · perks : avantages affichés
 * Le prix est relu par la fonction de paiement (Supabase « paiement ») : le navigateur ne fixe jamais le prix.
 * arPro: true = débloque l'Analyse vidéo Pro (vidéo entière, rapport, captures, montage).
 * clubPro: true = débloque Club PRO pour les clubs dont l'abonné fait partie du staff (Vestiaire) :
 *   badge, vitrine des sponsors sur la fiche du club, message à tout le club, export des présences.
 * Modifiable depuis l’espace administrateur (Contenus du site › Offres pro). Grille du 2026-11-22 (docs/OFFRES.md).
 */
window.CASA_OFFRES_PRO = [
  {
    "id": "club-pro",
    "name": "Club PRO",
    "mois": 12.9,
    "an": 129,
    "clubPro": true,
    "perks": [
      "Badge Club PRO sur la fiche du club",
      "Vitrine de vos sponsors sur la fiche du club, avec leurs liens",
      "Message à tout le club en notification (licenciés, parents, staff)",
      "Export des présences de la saison en tableur",
      "Un article de présentation du club par saison",
      "Le Vestiaire, les causeries et Casa Line Up restent gratuits"
    ],
    "casab": false,
    "gazette": null,
    "paper": false
  },
  {
    "id": "club-pro-video",
    "name": "Club PRO + Analyse vidéo",
    "mois": 27.9,
    "an": 279,
    "clubPro": true,
    "arPro": true,
    "perks": [
      "Tout Club PRO",
      "L’Analyse vidéo Pro sans limite de durée",
      "Rapports, montages des temps forts, export tableur",
      "Moins cher que les deux séparés (32,80 € par mois)"
    ],
    "casab": false,
    "gazette": null,
    "paper": false
  },
  {
    "id": "ar-pro",
    "name": "Analyse vidéo Pro · Club",
    "mois": 19.9,
    "an": 199,
    "arPro": true,
    "perks": [
      "Analyse de vos vidéos de match et d’entraînement, sans limite de durée",
      "Ralenti, image par image, dessins tactiques sur l’image",
      "Actions marquées, rapport par période et export tableur",
      "Montage automatique des buts, occasions et pertes de balle",
      "Questions sur le match : bilan, temps forts, comparaisons",
      "Ma compo en réalité augmentée et simulation pour vos causeries",
      "La vidéo reste sur votre appareil : rien n’est envoyé"
    ],
    "casab": false,
    "gazette": null,
    "paper": false
  }
];
