/*
 * Casa Besports — produits de la boutique.
 * La boutique (fiches produit, tailles, couleurs, panier, commande) est prête : ajoutez vos produits ici.
 * Modèle :
 * {
 *   id: 'hoodie-signature',             // unique, sans espace
 *   line: 'casa',                       // 'casa' (collection Casa) ou 'cherwood' (capsule Cherwood × Casa)
 *   name: 'Hoodie Signature',
 *   short: 'Molleton 350 g · broderie', // sous-titre
 *   price: 65,                          // prix en euros
 *   type: 'hoodie',                     // tee, hoodie, crew, pull, cap, bob, scarf, tote, mug, bottle, short, kit, jacket, jogger…
 *   img: 'assets/boutique/hoodie.jpg',  // photo principale
 *   gallery: ['assets/boutique/hoodie.jpg', 'assets/boutique/hoodie-dos.jpg'],
 *   colors: ['marine', 'ecru'],         // marine, sable, ecru, blanc, or (ou un autre nom)
 *   sizes: ['S', 'M', 'L', 'XL'],       // null pour un article sans taille
 *   flag: 'Nouveau', isNew: true,       // facultatif
 *   desc: 'Description complète.'
 * }
 */
window.CASA_PRODUITS = [
];

/* ---------- Présentation de la boutique (bandeau et affiches des collections) ----------
 * Modifiable ici ou dans l'espace administrateur (Boutique › Présentation).
 * Les images : déposez-les dans assets/boutique/ (ou envoyez-les depuis l'espace administrateur).
 * collections[].ligne : clé des produits de cette collection (champ « line » des produits).
 */
window.CASA_BOUTIQUE = {
  surtitre: 'Casa Besports · la boutique officielle',
  titre: 'Portez le sport du Cotentin',
  texte: 'Collection Casa Besports et capsule Cherwood × Casa Besports, dessinée, floquée et brodée à Cherbourg.',
  avantages: ['Livraison offerte dès 60 €', 'Retrait gratuit chez Cherwood, Cherbourg', 'Abonnés BE+ : −10 %'],
  note: 'Dessinés dans le Cotentin, floqués et brodés à Cherbourg par l’atelier Cherwood.',
  image: 'assets/ph_kit_runes.jpg',
  imageAlt: 'Maillot Casa Besports',
  collections: [
    { ligne: 'vikings', nom: 'Collection Vikings', accroche: 'Collection', titre: 'La Saga des Vikings', texte: 'Maillots floqués à votre nom', image: '' },
    { ligne: 'casa', nom: 'Casa Besports', accroche: 'Les essentiels', titre: 'La Légende Casa', texte: 'Hoodies, tee-shirts et vestes Casa Besports', image: '' },
    { ligne: 'cherwood', nom: 'Cherwood × Casa', accroche: 'Capsule Cherwood', titre: 'Fait à Cherbourg', texte: 'La capsule Cherwood × Casa', image: '' },
    { ligne: 'goodies', nom: 'Goodies', accroche: 'Pour le stade', titre: 'Le Butin des Supporters', texte: 'Écharpe, mug, gourde, affiche, stickers et carte cadeau', image: '' }
  ],
  /* ---------- Vos maillots de cœur : les boutiques officielles des clubs du Cotentin ----------
   * Chaque club : nom, club (identifiant de la section Clubs, facultatif), sport, city (ville), logo (image, facultatif :
   * sinon le logo de la section Clubs), boutiqueUrl (adresse de la boutique du club), plateforme, actif (true = affiché).
   * Le lien est marqué « vient de Casa Besports » (utm_source=casabesports) automatiquement.
   * Liens vérifiés les 14 et 15/11/2026 (champ « verification », non affiché). Les clubs en « actif: false » ont un lien à revérifier :
   * ouvrez-le, et s'il fonctionne, passez « actif » à true (ou cochez « Affiché sur le site » dans l'admin).
   * Commission : quand un club signe l'accord, cochez « partenaire » et indiquez son code (codePromo) et l'avantage acheteur (avantage).
   * La mention « liens partenaires » s'affiche alors automatiquement (obligation légale). Le taux de commission ne s'écrit PAS ici (fichier public).
   */
  maillotsTitre: 'Vos maillots de cœur',
  maillotsTexte: 'Les boutiques officielles des clubs du Cotentin',
  maillotsMention: 'Liens partenaires : pour les clubs signalés « Partenaire », Casa Besports perçoit une commission sur les achats faits depuis ce site, sans surcoût pour vous. Elle finance la couverture du sport local.',
  maillots: [
    { nom: 'AS Cherbourg Football', club: 'as-cherbourg', sport: 'Football', city: 'Cherbourg-en-Cotentin', logo: 'https://www.as-cherbourg.fr/wp-content/uploads/2023/11/Logo-ASCherbourg.png', boutiqueUrl: 'https://app.grinta.eu/as-cherbourg-football/adult/kits', plateforme: 'Grinta', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'JS Cherbourg Manche Handball', club: '', sport: 'Handball', city: 'Cherbourg-en-Cotentin', logo: '', boutiqueUrl: 'https://store.jscherbourg.fr/', plateforme: 'Store JS Cherbourg', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'Cherbourg Basketball', club: '', sport: 'Basketball', city: 'Cherbourg-en-Cotentin', logo: 'https://cherbourgbasketball.kalisport.com/public/8638/upload/images/clubs/logo-cherbourg-basketball.png', boutiqueUrl: 'https://cherbourgbasketball.kalisport.com/boutique', plateforme: 'Kalisport', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'UST Basket', club: 'ust-basket', sport: 'Basketball', city: 'Équeurdreville', logo: 'https://ust-basket.kalisport.com/public/3792/upload/images/clubs/logo-ust-basket.png', boutiqueUrl: 'https://ust-basket.kalisport.com/', plateforme: 'Kalisport', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'Basket Club de la Hague', club: 'bc-hague', sport: 'Basketball', city: 'La Hague', logo: 'https://basketclubhague.kalisport.com/public/3435/upload/images/clubs/logo-assun-basket-club-de-la-hague_1.png', boutiqueUrl: 'https://basketclubhague.kalisport.com/', plateforme: 'Kalisport', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'AS Tourlaville Football', club: 'as-tourlaville', sport: 'Football', city: 'Tourlaville', logo: '', boutiqueUrl: 'https://astourlavillefoot.kalisport.com/', plateforme: 'Kalisport', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'US Côte des Isles', club: 'us-cote-isles', sport: 'Football', city: 'Barneville-Carteret', logo: 'https://usci2000.fr/public/3018/upload/images/clubs/logo-u-s-cote-des-iles_2.png', boutiqueUrl: 'https://usci2000.fr/boutique', plateforme: 'Site du club', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'FC Équeurdreville-Hainneville', club: 'fceh', sport: 'Football', city: 'Équeurdreville', logo: 'https://fceh.kalisport.com/public/4384/upload/images/clubs/logo-football-club-equeurdreville-hainneville.png', boutiqueUrl: 'https://fceh.kalisport.com/boutique', plateforme: 'Kalisport', verification: 'Vérifié le 15/11/2026', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'PL Octeville', club: '', sport: 'Omnisport', city: 'Cherbourg-en-Cotentin', logo: 'https://pl-octeville.kalisport.com/public/5252/upload/images/clubs/logo-pl-octeville.png', boutiqueUrl: 'https://pl-octeville.kalisport.com/boutique', plateforme: 'Kalisport', verification: 'Vérifié le 15/11/2026 (les conditions de vente parlent de la section badminton)', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'PL Tourlaville Basket', club: 'pl-tourlaville', sport: 'Basketball', city: 'Tourlaville', logo: 'https://cdn.helloasso.com/img/logos/patronage%20laique%20tourlavillebasket%20p%20l%20t%20b-a6a10e710874496bb3345848d3130efe.jpg', boutiqueUrl: 'https://www.helloasso.com/associations/patronage-laique-tourlavillebasket-p-l-t-b', plateforme: 'HelloAsso', verification: 'Vérifié le 15/11/2026 : page du club, boutiques adulte et enfant en cours', partenaire: false, codePromo: '', avantage: '', actif: true },
    { nom: 'AS Cherbourg Natation · water-polo', club: '', sport: 'Water-polo', city: 'Cherbourg-en-Cotentin', logo: '', boutiqueUrl: 'https://www.helloasso.com/associations/as-cherbourg-natation/boutiques/boutique-water-polo', plateforme: 'HelloAsso', verification: 'À vérifier : page introuvable les 14 et 15/11/2026, la boutique est peut-être fermée', partenaire: false, codePromo: '', avantage: '', actif: false },
    { nom: 'FC Digosville', club: 'fc-digosville', sport: 'Football', city: 'Digosville', logo: '', boutiqueUrl: 'https://fcdigosville.footeo.com/page/boutique.html', plateforme: 'Footeo', verification: 'À vérifier : site injoignable les 14 et 15/11/2026', partenaire: false, codePromo: '', avantage: '', actif: false }
  ]
};
