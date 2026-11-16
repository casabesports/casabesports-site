/*
 * Casa Besports — offres payantes pour les professionnels (page Casa PRO).
 * id : ne pas changer (ar-pro) · mois / an : prix en euros (TTC) · perks : avantages affichés
 * Le prix est relu par la fonction de paiement (Supabase « paiement ») : le navigateur ne fixe jamais le prix.
 * arPro: true = l'abonnement débloque l'Analyse vidéo Pro (vidéo entière, rapport, captures, montage).
 */
window.CASA_OFFRES_PRO = [
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
