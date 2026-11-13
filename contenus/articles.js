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
 *   body: 'Texte complet.\n\n## Intertitre\n\nParagraphe…\n\n> Citation',
 *   // Facultatif, version anglaise (bouton EN du site) :
 *   titleEn: 'Title', dekEn: 'Standfirst', bodyEn: 'Full text…', tagEn: 'Regional 2'
 * }
 */
window.CASA_ARTICLES = [
{
  "id": "la-rentree-est-bien-lancee-a-l-athletisme-261005-d0eccc2f",
  "sport": "Athlétisme",
  "tag": "Athlétisme",
  "date": "7 oct.",
  "publierLe": "2026-10-07",
  "creeLe": "2026-10-05",
  "read": "2 min",
  "premium": false,
  "img": "assets/articles/athle-rentree-une.jpg",
  "alt": "Opérations nationales de rentrée de la FFA, du 6 septembre au 5 octobre 2025 : Kinder Joy of Moving Athletics Day, Run2K Challenge, Journée nationale de la marche nordique",
  "credit": "",
  "title": "L'athlétisme a fait sa rentrée",
  "dek": "La rentrée de l'athlétisme dans le Cotentin.",
  "clubs": [],
  "points": [],
  "author": "La rédaction",
  "body": "La rentrée est bien lancée depuis un mois dans le monde de l'athlétisme. Pour accompagner l'engouement de la rentrée scolaire, la Fédération Française d'Athlétisme lance depuis plusieurs années 3 opérations principales entre septembre et octobre pour petits et grands ;\n\n- Le Kinder Joy of Moving Athlétics Day\n- La journée nationale de la marche nordique\n- Le Run2K Challenge\n\n## Le Kinder Joy of Moving Athletics Day\n\nCommençons par les plus petits. Grâce à cette journée du Kinder Joy instaurée par le groupe Ferrero, c'est plus de 3,5 millions d'enfants autour du monde qui découvrent le sport. Le but étant d'éveiller les plus jeunes à travers des événements sportifs pluridisciplinaires. Du saut à la course, en passant par le lancer, les enfants expérimentent les différentes disciplines tout en apprenant à se sociabiliser sous couvert des valeurs du sport. Chaque année, l'athlétisme est présenté de manière ludique et amusante pour rendre l'activité physique attractive dès le plus jeune âge.\n\n![Kinder Day au stade de Querqueville](assets/articles/athle-rentree-kinder.jpg)\n\n## La journée nationale de la marche nordique\n\nConsidérée comme une des disciplines les plus complètes en combinant l'endurance et le développement musculaire, la marche nordique consiste en une marche accélérée avec des bâtons. Initiée par la FFA en 2015, cette opération annuelle vise à promouvoir le sport en extérieur. Encadrée par des entraîneurs formés proposant plusieurs ateliers divers comme des sorties en plein air et ateliers collectifs, cette expérience permet aux futurs adeptes d'apprendre les bons gestes.\n\n![Journée nationale de la marche nordique](assets/articles/athle-rentree-marche-nordique.jpg)\n\n## Le Run2k Challenge\n\nUne course de 2km sur piste tant pour les sportifs amateurs que les compétiteurs, pour les grands comme les petits, une course rapide ou en footing, seul ou à plusieurs, pour chercher le meilleur chrono ou simplement pour s'amuser. Chaque club partenaire propose ce défi à relever.\n\n![Run2k Challenge au stade Postaire de Cherbourg](assets/articles/athle-rentree-run2k.jpg)\n\n## Objectifs de la FFA\n\nCes 3 rendez-vous annuels permettent la découverte des différentes disciplines de ce sport qu'est l'athlétisme. Ces opérations locales et gratuites ouvertes à tous visent à mettre en avant le bien-être favorisé par le sport. Aujourd'hui, c'est plus de 900 clubs partenaires en France qui accueillent chaque année des nouveaux participants et comptent de plus en plus d'adeptes.\n\n## Opérations de rentrée à Cherbourg-en-Cotentin\n\nParmi les clubs partenaires de ces opérations de rentrée, la FFA peut compter sur ceux du Cotentin pour animer la piste et donner le goût du sport à ceux qui souhaitent se lancer. Comptant ceux de Tourlaville, Cherbourg et Querqueville depuis plusieurs années, pourquoi ne pas vous y voir sur un stade à la prochaine rentrée ?"
}
];
