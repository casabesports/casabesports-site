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
  avantages: ['Livraison offerte dès 60 €', 'Retrait gratuit chez Cherwood, Cherbourg', 'Abonnés Casa B+ : −10 %'],
  note: 'Dessinés dans le Cotentin, floqués et brodés à Cherbourg par l’atelier Cherwood.',
  image: 'assets/ph_kit_runes.jpg',
  imageAlt: 'Maillot Casa Besports',
  collections: [
    { ligne: 'vikings', nom: 'Collection Vikings', accroche: 'Collection', titre: 'La Saga des Vikings', texte: 'Maillots floqués à votre nom', image: '' },
    { ligne: 'casa', nom: 'Casa Besports', accroche: 'Les essentiels', titre: 'La Légende Casa', texte: 'Hoodies, tee-shirts et vestes Casa Besports', image: '' },
    { ligne: 'cherwood', nom: 'Cherwood × Casa', accroche: 'Capsule Cherwood', titre: 'Fait à Cherbourg', texte: 'La capsule Cherwood × Casa', image: '' },
    { ligne: 'goodies', nom: 'Goodies', accroche: 'Pour le stade', titre: 'Le Butin des Supporters', texte: 'Écharpe, mug, gourde, affiche, stickers et carte cadeau', image: '' }
  ]
};
