/* ================================================================
   LA GAZETTE DU COTENTIN — le numéro en cours
   Modifiable ici ou dans l'espace administrateur (Gazette).
   - numero : la couverture et les vignettes de l'accueil
   - pages  : les pages du magazine, dans l'ordre (la couverture et le sommaire sont ajoutés automatiquement)
   Modèles de page (champ kind) :
     'article'  : rubric, title, script (sous-titre), kicker (chapeau), paras: [{ t: 'paragraphe' }], img, imgCap, quote, quoteBy
     'portrait' : comme article, pour présenter une personne
     'number'   : num: { big: '75', l: 'mètres' }, why: 'pourquoi ça compte', src: 'source'
     'choc'     : le détail choc (fait vérifié) : title, kicker, paras, src
     'humeur'   : la page qui ne sert à rien : title, paras
   sec : cahier du sommaire ('À la une', 'Le terrain', 'Les gens', 'Le territoire', 'La pause')
   ================================================================ */
window.CASA_GAZETTE_NUMERO = {
  numero: '1',
  date: '',
  mention: 'Matchs · histoires · gens d’ici',
  surtitre: 'Bientôt',
  titre: 'Le prochain numéro arrive',
  accroche: 'La rédaction prépare le premier numéro de La Gazette du Cotentin.',
  image: 'assets/gz_cover.jpg',
  legende: ''
};
window.CASA_GAZETTE = [
  // { id: 'edito', sec: 'À la une', kind: 'article', rubric: 'Édito', title: 'Titre', script: 'sous-titre', kicker: 'Chapeau', paras: [{ t: 'Premier paragraphe' }], img: 'assets/articles/photo.jpg' },
];
