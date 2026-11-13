/* ================================================================
   PAGE « À PROPOS » — l'histoire de Casa Besports
   Modifiable ici ou dans Espace admin › Contenus du site › À propos.
   Pour une apostrophe dans le texte, utilisez ’ (apostrophe typographique).
   - titre, soustitre, photo : l'ouverture de la page
   - manifeste : les premiers paragraphes, puis la grande citation et la phrase de fin
   - etapes : la chronologie (annee, titre, paragraphes, photo et sa description)
   - piliers : la raison d'être (trois blocs)
   - signature, appel : la conviction et l'invitation finale
   - version anglaise : mêmes champs suivis de En (titreEn, manifesteEn, etapes[].titreEn…)
   ================================================================ */
window.CASA_APROPOS = {
  surtitre: 'Casa Besports — notre histoire',
  titre: 'Le sport passe. Les histoires restent.',
  soustitre: 'Depuis 2024, CASA BESPORTS raconte celles et ceux qui font vivre le sport dans la Manche.',
  intro: 'Un média né dans le Cotentin. Une maison ouverte à tous ceux qui font vivre le sport.',
  photo: 'assets/a_fceh.jpg',
  photoAlt: 'Joueurs de football du Cotentin qui célèbrent un but sur la pelouse',

  manifeste: [
    'Il y a des victoires qui font la une. Et d’autres qui ne franchissent jamais les portes d’un vestiaire.',
    'Des exploits accomplis devant quelques dizaines de spectateurs. Des entraîneurs qui donnent leurs soirées. Des bénévoles qui arrivent avant tout le monde et repartent les derniers. Des sportifs qui poursuivent leurs rêves entre le travail, les études et la vie quotidienne.'
  ],
  citation: 'Ces histoires n’ont pas moins de valeur. Elles ont simplement besoin de quelqu’un pour les raconter.',
  manifesteFin: 'C’est de cette conviction qu’est né CASA BESPORTS.',

  etapes: [
    { annee: 'Avant 2024', titre: 'L’expérience du terrain', photo: 'assets/img_51314cdd.jpg', alt: 'Photo d’équipe d’un club de football du Cotentin',
      paragraphes: [
        'Avant d’être un média, CASA BESPORTS est un regard forgé par le sport. Son fondateur, Kader Allou, a connu les vestiaires de la réserve du Paris Saint-Germain, de l’AS Cherbourg en National 3, puis deux saisons en Géorgie.',
        'Des vestiaires, des voyages, des rencontres. Et une certitude : derrière chaque maillot se cache une histoire que le tableau d’affichage ne raconte pas.'
      ] },
    { annee: '2024', titre: 'La naissance de CASA BESPORTS', photo: 'assets/a_benevoles.jpg', alt: 'Les bénévoles d’un tournoi réunis dans un gymnase',
      paragraphes: [
        'En août 2024, Kader Allou fonde CASA BESPORTS à Cherbourg-en-Cotentin : un média sportif indépendant, avec une ambition simple, donner au sport local l’attention qu’il mérite.',
        'CASA signifie la maison. Un espace où clubs, sportifs, éducateurs, bénévoles et passionnés peuvent se reconnaître. Les premiers contenus prennent racine dans le football, au plus près des rencontres.'
      ] },
    { annee: '2025', titre: 'L’ouverture à de nouvelles histoires', photo: 'assets/a_bluesquad.jpg', alt: 'Un basketteur de Cherbourg lève les bras sur le parquet',
      paragraphes: [
        'Le regard s’élargit : basket, handball, water-polo, roller hockey, sports individuels… CASA BESPORTS fait une place aux disciplines, aux clubs, aux sportifs et aux acteurs qui font vivre le territoire.',
        'Interviews, images de matchs, portraits et récits de terrain : une identité éditoriale se dessine. Derrière une victoire, il y a parfois des années d’efforts invisibles.'
      ] },
    { annee: '2026', titre: 'Une nouvelle dimension éditoriale', photo: 'assets/img_4994dc60.jpg', alt: 'Une équipe réunie sur la pelouse avec ses trophées après un tournoi',
      paragraphes: [
        'En avril 2026, Kader Allou devient correspondant de La Manche Libre à Cherbourg. Une exigence nouvelle accompagne le projet : vérifier, écouter, écrire juste.',
        'Reportages, interviews, portraits et récits historiques prennent de l’ampleur. Des formats audiovisuels sont en préparation, comme Inside vestiaire, Banc tactique, CASAFLIX ou La petite histoire locale.'
      ] },
    { annee: 'Demain', titre: 'Une maison pour les voix du sport', photo: 'assets/img_fe51d409.jpg', alt: 'Une équipe féminine célèbre un trophée avec son public',
      paragraphes: [
        'CASA BESPORTS a le projet de créer à Cherbourg un studio audiovisuel dédié aux interviews, aux podcasts, aux émissions et aux masterclass : un lieu où les sportifs, les éducateurs et les clubs pourraient raconter leur histoire.',
        'L’ambition : faire rayonner ces récits dans toute la Manche, puis en Normandie, sans perdre ce qui a fait naître CASA BESPORTS, la proximité, l’authenticité et la passion du terrain.'
      ] }
  ],

  raisonSurtitre: 'Notre raison d’être',
  raisonTitre: 'Révéler. Raconter. Transmettre.',
  piliers: [
    { titre: 'Révéler les talents', texte: 'Donner de la visibilité aux sportifs, aux clubs et aux disciplines qui méritent d’être découverts.' },
    { titre: 'Raconter les émotions', texte: 'Aller au-delà des résultats pour comprendre les parcours, les ambitions, les réussites et les difficultés.' },
    { titre: 'Transmettre la mémoire', texte: 'Conserver les images, les témoignages et les histoires qui constituent le patrimoine sportif du territoire.' }
  ],

  signatureSurtitre: 'Notre conviction',
  signature: 'Le sport local ne manque pas d’histoires. Il manque parfois de lumière.',
  signatureSuite: 'CASA BESPORTS existe pour lui donner cette lumière.',

  appelTitre: 'Cette histoire est aussi la vôtre',
  appel: [
    'Un club qui construit son avenir. Une sportive qui réalise son rêve. Un bénévole qui transmet depuis trente ans. Une rivalité qui traverse les générations. Un événement qui rassemble une commune.',
    'Toutes ces histoires font partie de notre territoire. Et toutes méritent de trouver leur place.'
  ],
  appelFin: 'Bienvenue chez CASA BESPORTS. La maison de ceux qui font vivre le sport.',

  // ---------- version anglaise ----------
  surtitreEn: 'Casa Besports — our story',
  titreEn: 'Sport moves on. The stories remain.',
  soustitreEn: 'Since 2024, CASA BESPORTS has told the stories of the people who keep sport alive in La Manche.',
  introEn: 'A media born in the Cotentin. A home open to everyone who keeps sport alive.',
  photoAltEn: 'Cotentin footballers celebrating a goal on the pitch',
  manifesteEn: [
    'Some victories make the headlines. Others never get past the dressing-room door.',
    'Feats achieved in front of a few dozen spectators. Coaches who give up their evenings. Volunteers who arrive before everyone else and leave last. Athletes chasing their dreams between work, studies and everyday life.'
  ],
  citationEn: 'These stories are worth no less. They simply need someone to tell them.',
  manifesteFinEn: 'CASA BESPORTS was born from that conviction.',
  etapesEn: [
    { annee: 'Before 2024', titre: 'Experience from the field', alt: 'Team photo of a Cotentin football club',
      paragraphes: [
        'Before it was a media, CASA BESPORTS was a way of seeing shaped by sport. Its founder, Kader Allou, knew the dressing rooms of the Paris Saint-Germain reserves, AS Cherbourg in National 3, then two seasons in Georgia.',
        'Dressing rooms, journeys, encounters. And one certainty: behind every shirt lies a story the scoreboard does not tell.'
      ] },
    { annee: '2024', titre: 'The birth of CASA BESPORTS', alt: 'Tournament volunteers gathered in a sports hall',
      paragraphes: [
        'In August 2024, Kader Allou founds CASA BESPORTS in Cherbourg-en-Cotentin: an independent sports media with a simple ambition, to give local sport the attention it deserves.',
        'CASA means home. A space where clubs, athletes, coaches, volunteers and fans can see themselves. The first stories take root in football, close to the matches.'
      ] },
    { annee: '2025', titre: 'Opening up to new stories', alt: 'A Cherbourg basketball player raising his arms on the court',
      paragraphes: [
        'The outlook widens: basketball, handball, water polo, roller hockey, individual sports… CASA BESPORTS makes room for the disciplines, clubs, athletes and people who bring the area to life.',
        'Interviews, match footage, profiles and stories from the field: an editorial identity takes shape. Behind a victory, there are sometimes years of unseen effort.'
      ] },
    { annee: '2026', titre: 'A new editorial dimension', alt: 'A team gathered on the pitch with its trophies after a tournament',
      paragraphes: [
        'In April 2026, Kader Allou becomes a correspondent for La Manche Libre in Cherbourg. A new standard comes with the project: checking, listening, writing true.',
        'Reports, interviews, profiles and historical stories grow. Audiovisual formats are in preparation, such as Inside vestiaire, Banc tactique, CASAFLIX and La petite histoire locale.'
      ] },
    { annee: 'Tomorrow', titre: 'A home for the voices of sport', alt: 'A women’s team celebrating a trophy with their supporters',
      paragraphes: [
        'CASA BESPORTS plans to create an audiovisual studio in Cherbourg for interviews, podcasts, shows and masterclasses: a place where athletes, coaches and clubs could tell their story.',
        'The ambition: to carry these stories across La Manche, then Normandy, without losing what gave birth to CASA BESPORTS, closeness, authenticity and a passion for the field.'
      ] }
  ],
  raisonSurtitreEn: 'Why we exist',
  raisonTitreEn: 'Reveal. Tell. Pass on.',
  piliersEn: [
    { titre: 'Reveal talent', texte: 'Give visibility to the athletes, clubs and disciplines that deserve to be discovered.' },
    { titre: 'Tell the emotions', texte: 'Go beyond results to understand the journeys, ambitions, successes and struggles.' },
    { titre: 'Pass on the memory', texte: 'Preserve the images, testimonies and stories that make up the sporting heritage of the area.' }
  ],
  signatureSurtitreEn: 'Our conviction',
  signatureEn: 'Local sport has no shortage of stories. Sometimes it just lacks the spotlight.',
  signatureSuiteEn: 'CASA BESPORTS exists to give it that spotlight.',
  appelTitreEn: 'This story is yours too',
  appelEn: [
    'A club building its future. An athlete fulfilling her dream. A volunteer who has been passing it on for thirty years. A rivalry that spans generations. An event that brings a whole town together.',
    'All these stories are part of our area. And all of them deserve a place.'
  ],
  appelFinEn: 'Welcome to CASA BESPORTS. The home of those who keep sport alive.'
};
