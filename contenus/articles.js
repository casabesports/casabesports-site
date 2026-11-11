/*
 * Casa Besports — articles publiés en plus de ceux d'origine.
 * Le plus récent en premier. Ce fichier est mis à jour par l'automatisation « Rédaction quotidienne »
 * (voir docs/AUTOMATISATIONS.md) et peut aussi être modifié à la main.
 *
 * Modèle d'un article :
 * {
 *   id: 'mon-article-2026-11-12',          // unique, sans espaces ni accents
 *   sport: 'Football',                      // discipline
 *   tag: 'Régional 2',                      // rubrique / compétition
 *   date: '12 nov.',                        // date affichée
 *   read: '3 min',                          // temps de lecture
 *   premium: false,                         // true = réservé aux abonnés Casa B+
 *   img: 'assets/articles/mon-image.jpg',   // image principale
 *   alt: 'Description de l’image',
 *   title: 'Titre',
 *   dek: 'Chapeau (1 à 2 phrases)',
 *   clubs: ['fceh'],                        // identifiants de clubs liés (voir js/app.js, liste des clubs)
 *   points: ['À retenir 1', 'À retenir 2'], // 2 à 3 points clés
 *   author: 'Kader Allou',
 *   body: 'Texte complet.\n\n## Intertitre\n\nParagraphe…\n\n> Citation'
 * }
 */
window.CASA_ARTICLES = [
];
