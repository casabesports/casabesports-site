/*
 * Casa Besports — les partenaires (page Partenaires).
 * site / app : liens vers le site et l’application du partenaire ; le site y ajoute automatiquement la marque
 *   « vient de Casa Besports » (utm_source=casabesports, utm_campaign=partenaire-<id>, ref=casabesports)
 * tier : Platinum, Or ou Club · color : couleur du logo (#xxxxxx) · mono : lettre du logo (si pas d’image) · logo : image du logo (assets/partenaires/…)
 * perk : avantage offert (vide = pas d’encadré) · real : true pour un vrai partenaire
 * adresse, telephone : infos pratiques · horaires : une ligne par jour (« Lundi : fermé »)
 * Modifiable depuis l’espace administrateur (Contenus du site). Une version modifiée en ligne passe avant ce fichier.
 */
window.CASA_PARTENAIRES = [
  {
    "id": "olisto",
    "name": "OlistO",
    "mono": "O",
    "sector": "Crédit immobilier · regroupement de crédits · assurance emprunteur",
    "city": "Réseau de courtage",
    "tier": "Platinum",
    "color": "#163a5f",
    "since": 2026,
    "perk": "Étude de votre projet offerte",
    "site": "https://olisto.fr/",
    "app": "",
    "desc": "Réseau de courtage en crédit immobilier, regroupement de crédits, assurance emprunteur, prêt professionnel et immobilier neuf. Partenaire Casa Besports.",
    "real": true
  },
  {
    "id": "le-narval",
    "name": "Le Narval",
    "mono": "N",
    "logo": "assets/partenaires/le-narval.png",
    "sector": "Bar · tabac",
    "city": "Cherbourg-en-Cotentin",
    "tier": "Club",
    "color": "#5b7190",
    "since": 2026,
    "perk": "",
    "adresse": "38 quai de Caligny, 50100 Cherbourg-en-Cotentin",
    "telephone": "02 33 43 97 71",
    "horaires": "Lundi : fermé\nMardi : 14h – 22h\nMercredi : 10h – 22h\nJeudi : 10h – minuit\nVendredi : 10h – 1h\nSamedi : 11h – 1h\nDimanche : fermé",
    "site": "https://www.facebook.com/103204388895005",
    "app": "",
    "desc": "Bar-tabac du quai de Caligny, à Cherbourg-en-Cotentin. Partenaire Casa Besports.",
    "real": true
  }
];
