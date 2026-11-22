/* ================================================================
   CASA IA — ce que l'assistant sait en plus des contenus du site
   Modifiable ici (pas besoin de toucher au code de l'assistant).

   Casa IA répond déjà, sans rien ajouter ici, à partir de :
     - la page À propos (contenus/apropos.js) : « qui est Casa Besports », le fondateur, l'histoire ;
     - les clubs, joueurs, classements, calendriers et résultats (contenus/clubs.js, joueurs*.js,
       sport.js, sport-federations.js, onglet Résultats de l'admin) ;
     - les articles, vidéos, podcast, partenaires, parcours, offres.
   Pour tout le reste (sport national et international, règles, histoire d'un club, d'un athlète…),
   elle cherche dans Wikipédia en français et cite toujours sa source.

   Ce fichier contient :
     - accueil, suggestions : le premier message et les boutons de questions rapides ;
     - niveaux : la pyramide des compétitions de chaque discipline, du département à l'international.
       Les noms des divisions changent parfois : vérifiez-les en début de saison ;
     - faq : vos propres réponses. { mots: ['mot clé', …], reponse: 'texte', lien: 'page du site' (facultatif) }
       Casa IA donne la réponse dès que la question contient un des mots clés.
       Pages possibles pour « lien » : live (Le Terrain), news, videos, clubs, players, offers, partners,
       contact, about, shop, clubhouse, vestiaire, podcast, handisport, meteo.
   Pour une apostrophe dans le texte, utilisez ’ (apostrophe typographique).
   ================================================================ */
window.CASA_IA = {
  accueil: 'Bonjour, je suis Casa IA. Posez-moi vos questions de sport : clubs et championnats de la Manche et de Normandie, sport national et international, joueurs, règles, histoire… et tout ce qui concerne Casa Besports.',

  suggestions: [
    'Qui est Casa Besports ?',
    'Classement handball Manche',
    'Prochain match de Tourlaville',
    'Les niveaux du football',
    'Qui a gagné la Coupe du monde 2022 ?',
    'Météo à Cherbourg',
    'Histoire du phare de Gatteville'
  ],

  // Pyramide des compétitions seniors, du plus haut au plus bas niveau
  niveaux: {
    Football: {
      international: ['Coupe du monde (FIFA)', 'Euro (UEFA)', 'Ligue des champions, Ligue Europa et Ligue Conférence (UEFA)'],
      national: ['Ligue 1 et Ligue 2 (professionnels)', 'National', 'National 2', 'National 3 (Fédération française de football)'],
      regional: ['Régional 1', 'Régional 2', 'Régional 3 (Ligue de football de Normandie)'],
      departemental: ['Départemental 1, 2, 3… (District de la Manche)'],
      coupes: 'La Coupe de France est ouverte à tous les clubs, du district à la Ligue 1.',
      feminin: 'Les féminines ont leur propre pyramide : Première Ligue, Seconde Ligue, puis divisions nationales, régionales et départementales.'
    },
    Basketball: {
      international: ['Coupe du monde (FIBA)', 'EuroBasket', 'Jeux olympiques', 'EuroLigue et coupes d’Europe'],
      national: ['Betclic Élite', 'Élite 2', 'Nationale 1', 'Nationale 2', 'Nationale 3'],
      regional: ['Régionale 1, 2 et 3 (Ligue de Normandie de basket)'],
      departemental: ['Départementale 1, 2, 3… (Comité de la Manche)'],
      feminin: 'Chez les femmes : Ligue féminine (LFB), Ligue 2 (LF2), puis Nationale 1, 2 et 3, régionales et départementales.'
    },
    Handball: {
      international: ['Championnat du monde (IHF)', 'Euro (EHF)', 'Jeux olympiques', 'Ligue des champions EHF'],
      national: ['Liqui Moly StarLigue', 'ProLigue', 'Nationale 1', 'Nationale 2', 'Nationale 3'],
      regional: ['Pré-nationale puis divisions régionales (Ligue de Normandie de handball)'],
      departemental: ['Excellence, Honneur… (Comité de la Manche)'],
      feminin: 'Chez les femmes : Ligue Butagaz Énergie, D2 féminine, puis Nationale 1, 2 et 3, régionales et départementales.'
    },
    'Volley-ball': {
      international: ['Championnat du monde (FIVB)', 'Euro (CEV)', 'Jeux olympiques', 'Ligue des nations', 'Ligue des champions CEV'],
      national: ['Ligue A', 'Ligue B', 'Élite', 'Nationale 2', 'Nationale 3'],
      regional: ['Pré-nationale et régionales (Ligue de Normandie de volley-ball)'],
      departemental: ['Départementales (Comité de la Manche)']
    },
    Rugby: {
      international: ['Coupe du monde', 'Tournoi des Six Nations', 'Champions Cup et Challenge Cup'],
      national: ['Top 14', 'Pro D2', 'Nationale', 'Nationale 2', 'Fédérale 1', 'Fédérale 2', 'Fédérale 3'],
      regional: ['Régionale 1, 2 et 3 (Ligue de Normandie de rugby)'],
      departemental: []
    },
    'Water-polo': {
      international: ['Championnat du monde (World Aquatics)', 'Euro', 'Jeux olympiques', 'Ligue des champions'],
      national: ['Championnat Élite', 'Nationale 1', 'Nationale 2', 'Nationale 3'],
      regional: ['Championnats régionaux (Ligue de Normandie de natation)'],
      departemental: ['Coupes et tournois départementaux']
    }
  },

  // Vos réponses à vous (exemples à compléter)
  faq: [
    { mots: ['proposer un article', 'devenir correspondant', 'ecrire pour casa', 'rejoindre la redaction'], reponse: 'Vous voulez raconter le sport de votre club ? Écrivez-nous depuis la page Contact : la rédaction vous répond et peut vous ouvrir un accès correspondant.', lien: 'contact' },
    { mots: ['inscrire mon club', 'ajouter mon club', 'mon club n est pas'], reponse: 'Pour ajouter votre club sur BE+, envoyez son nom, sa discipline, sa ville et son logo depuis la page Contact. Il apparaîtra dans Clubs et disciplines.', lien: 'contact' }
  ]
};
