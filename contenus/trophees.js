/* ================================================================
   LES MARÉES D’OR — la soirée des trophées du sport local (page « Les trophées », adresse /trophees)
   Modifiable ici ou dans Espace admin › Contenus du site › Les Marées d’or.
   Pour une apostrophe dans le texte, utilisez ’ (apostrophe typographique).

   - phase : l’étape en cours, affichée en haut de la page et qui ouvre ou ferme le vote
       preparation · propositions · vote · jury · ceremonie · palmares
   - prix : les 10 trophées de la 1re édition (soirée de 1 h 30). Pour chacun :
       nommes : les nommé(e)s (3 par prix conseillé) → { nom, club, photo, pourquoi, jury, pairs }
         jury  = note du jury sur 100 (grille du barème), pairs = note des pairs sur 100 (prix « sportif »)
         Ne publiez un(e) nommé(e) qu’avec son accord (et celui des parents pour un(e) mineur(e)).
       remettant : le nom de la personne qui remet le trophée (laissé vide tant qu’elle n’a pas accepté)
       laureat : à remplir seulement le soir de la cérémonie (phase « palmares »)
   - baremes, trophees, deroule, jury : le règlement, les trophées et le déroulé de la soirée
   Les votes du public sont gardés par Supabase (supabase/trophees.sql) : un vote par prix et par compte.
   ================================================================ */
window.CASA_TROPHEES = {
  nom: 'Les Marées d’or',
  sousTitre: 'La soirée des trophées du sport local',
  edition: '1re édition',
  saison: 'Saison 2026-2027',
  date: '',
  dateTexte: 'Fin juin 2027, après les derniers matchs de la saison (date à fixer avec le théâtre)',
  heure: '19 h 00 à 20 h 30 (1 h 30)',
  lieu: 'Théâtre à l’italienne de Cherbourg',
  adresse: 'Place du Général-de-Gaulle, Cherbourg-en-Cotentin',
  lieuNote: 'Le théâtre est géré par le Trident, scène nationale : la salle se réserve auprès d’eux. Jauge, technique (son, lumière, écran) et accessibilité à confirmer lors de la visite.',
  territoire: 'du Cotentin',
  phase: 'preparation',
  phases: [
    { id: 'preparation', titre: 'Préparation', quand: 'Hiver', texte: 'Réservation du théâtre, composition du jury, choix des remettants, commande des trophées.' },
    { id: 'propositions', titre: 'Propositions', quand: 'Avril', texte: 'Les clubs, les comités et le public proposent des noms pour chaque prix (formulaire de contact).' },
    { id: 'vote', titre: 'Vote du public', quand: 'Mai à mi-juin', texte: 'Trois nommé(e)s par prix. Les abonnés votent en ligne : un vote par prix et par compte.' },
    { id: 'jury', titre: 'Délibération', quand: 'Mi-juin', texte: 'Le jury note chaque nommé(e) avec la grille du barème. Les résultats restent sous enveloppe.' },
    { id: 'ceremonie', titre: 'La soirée', quand: 'Fin juin', texte: '1 h 30 au théâtre à l’italienne : 10 trophées, vote en direct pour la Marée d’or.' },
    { id: 'palmares', titre: 'Palmarès', quand: 'Le lendemain', texte: 'Le palmarès complet, les photos et les discours publiés sur le site et dans La Gazette.' }
  ],
  baremes: [
    { id: 'sportif', titre: 'Révélation, sportive et sportif de l’année', jury: 50, public: 30, pairs: 20,
      grille: [{ critere: 'Performances et résultats de la saison', points: 40 }, { critere: 'Progression et régularité', points: 20 }, { critere: 'Rôle dans le club et pour le territoire', points: 20 }, { critere: 'Fair-play et exemplarité', points: 20 }],
      note: 'Les pairs : chaque club du territoire remet un bulletin signé par son capitaine et son entraîneur (un seul par club, jamais pour son propre club).' },
    { id: 'engagement', titre: 'Entraîneur(e), arbitre, bénévole ou dirigeant(e)', jury: 70, public: 30, pairs: 0,
      grille: [{ critere: 'Actions menées pendant la saison', points: 35 }, { critere: 'Constance et ancienneté de l’engagement', points: 25 }, { critere: 'Impact humain (jeunes, club, quartier)', points: 25 }, { critere: 'Témoignages du club et des licenciés', points: 15 }],
      note: 'Un dossier court par candidat(e) : une page de présentation et deux témoignages.' },
    { id: 'collectif', titre: 'Équipe de l’année, sport adapté et handisport', jury: 60, public: 40, pairs: 0,
      grille: [{ critere: 'Résultats et parcours de la saison', points: 40 }, { critere: 'Formation, accueil et ouverture', points: 25 }, { critere: 'Esprit d’équipe et vie du club', points: 20 }, { critere: 'Rayonnement pour le territoire', points: 15 }],
      note: '' },
    { id: 'public', titre: 'Exploit de l’année (prix du public)', jury: 0, public: 100, pairs: 0, grille: [], note: 'Trois exploits de la saison retenus par le jury ; le public choisit seul en ligne.' },
    { id: 'maree', titre: 'La Marée d’or', jury: 60, public: 40, pairs: 0,
      grille: [{ critere: 'Saison exceptionnelle', points: 50 }, { critere: 'Ce que cette personne ou cette équipe représente pour le sport local', points: 30 }, { critere: 'Exemplarité', points: 20 }],
      note: 'Les 4 finalistes sont les lauréat(e)s de la soirée en Révélation, Sportive, Sportif et Équipe. Le jury note avant la soirée ; le public vote en direct 7 minutes (QR code à l’écran et sur le site).' }
  ],
  regles: [
    'Note finale sur 100 = part du jury + part du public + part des pairs, selon le barème du prix.',
    'Part du public : la part des votes obtenus parmi les nommé(e)s du prix (exemple : 50 % des votes → 50 points sur 100, puis multipliés par le poids du public).',
    'Trois nommé(e)s par prix, toutes disciplines confondues : le jury choisit parmi les propositions des clubs, des comités et du public.',
    'Un juré ne note pas un(e) nommé(e) de son propre club : sa note est remplacée par la moyenne des autres jurés.',
    'Égalité : le meilleur score du jury l’emporte, puis la voix du président ou de la présidente du jury.',
    'Vote du public : un vote par prix et par compte Casa Besports (gratuit), vote modifiable tant que le vote est ouvert.',
    'Résultats gardés sous enveloppe scellée par deux membres du jury jusqu’à la soirée.',
    'Sur scène : 5 minutes par trophée (nommé(e)s et vidéo de 30 secondes, ouverture de l’enveloppe, remise, discours d’une minute, photo).'
  ],
  jury: [
    { role: 'Président(e) du jury : la rédaction Casa Besports', nom: '' },
    { role: 'Un(e) journaliste sportif(ve) de la presse locale', nom: '' },
    { role: 'Une ancienne sportive de haut niveau du Cotentin', nom: '' },
    { role: 'Un ancien sportif de haut niveau du Cotentin', nom: '' },
    { role: 'Un(e) représentant(e) du service des sports de la ville', nom: '' },
    { role: 'Un(e) représentant(e) des comités départementaux', nom: '' },
    { role: 'Un(e) partenaire de Casa Besports', nom: '' }
  ],
  trophees: [
    { id: 'maree', nom: 'La Marée d’or', pour: 'Le trophée suprême, choisi parmi les 4 premiers lauréats', forme: 'Une vague qui déferle, coulée en laiton poli doré', socle: 'Granit gris de la Manche, plaque gravée', hauteur: '34 cm', nombre: 1 },
    { id: 'vague', nom: 'La Vague d’or', pour: 'Sportive et sportif de l’année, toutes disciplines', forme: 'La même vague, en laiton brossé', socle: 'Granit, plaque gravée', hauteur: '24 cm', nombre: 2 },
    { id: 'bouee', nom: 'La Bouée', pour: 'Révélation de l’année', forme: 'Une bouée de sauvetage en laiton, émaillée jaune soleil', socle: 'Granit, plaque gravée', hauteur: '20 cm', nombre: 1 },
    { id: 'rade', nom: 'La Rade', pour: 'Équipe de l’année : le port qui rassemble tout le monde', forme: 'Les bras de la rade qui entourent une voile', socle: 'Granit', hauteur: '20 cm', nombre: 1 },
    { id: 'boussole', nom: 'La Boussole', pour: 'Entraîneur(e) de l’année : celle ou celui qui donne le cap', forme: 'Rose des vents découpée dans le laiton', socle: 'Granit', hauteur: '22 cm', nombre: 1 },
    { id: 'amer', nom: 'L’Amer', pour: 'Arbitre ou officiel : le repère fixe que suivent les marins', forme: 'Balise triangulaire sur un mât', socle: 'Granit', hauteur: '24 cm', nombre: 1 },
    { id: 'phare', nom: 'Le Phare', pour: 'Bénévole ou dirigeant(e) : la lumière toujours allumée', forme: 'Silhouette de phare du Cotentin, lanterne en verre dépoli', socle: 'Granit', hauteur: '26 cm', nombre: 1 },
    { id: 'cap', nom: 'Le Cap', pour: 'Sport adapté et handisport : franchir le cap', forme: 'Pointe de falaise et flèche tournée vers le large', socle: 'Granit', hauteur: '22 cm', nombre: 1 },
    { id: 'ecume', nom: 'L’Écume', pour: 'Exploit de l’année, choisi par le public : le moment qui a tout éclaboussé', forme: 'Gerbe d’écume en laiton et gouttes en verre', socle: 'Granit', hauteur: '22 cm', nombre: 1 }
  ],
  fabrication: 'Fabrication conseillée chez un artisan de la région (fonderie d’art ou atelier de découpe laiton) ; devis à demander. Version économique : impression 3D finition laiton sur socle en granit. Gravure de chaque plaque : nom du prix, nom du ou de la lauréat(e), « Les Marées d’or · 2027 ».',
  deroule: [
    { heure: '19 h 00', quoi: 'Accueil, photocall bleu marée, installation en salle (15 min)' },
    { heure: '19 h 15', quoi: 'Ouverture : le mot de Casa Besports et le film de la saison (8 min)' },
    { heure: '19 h 23', quoi: 'Acte 1 · Les sportifs : Révélation, Sportive, Sportif de l’année (15 min)' },
    { heure: '19 h 38', quoi: 'Acte 2 · Le terrain : Équipe, Entraîneur(e), Arbitre ou officiel (15 min)' },
    { heure: '19 h 53', quoi: 'Acte 3 · Ceux qui font vivre le sport : Bénévole ou dirigeant(e), Sport adapté et handisport (10 min)' },
    { heure: '20 h 03', quoi: 'L’Exploit de l’année, prix du public (5 min)' },
    { heure: '20 h 08', quoi: 'Vote en direct pour la Marée d’or entre les 4 finalistes : QR code à l’écran, pendant le film des coulisses (7 min)' },
    { heure: '20 h 15', quoi: 'La Marée d’or (8 min)' },
    { heure: '20 h 23', quoi: 'Photo de famille sur scène et mot de fin (7 min)' },
    { heure: '20 h 30', quoi: 'Fin de la soirée' }
  ],
  prix: [
    { id: 'revelation', titre: 'Révélation de l’année', discipline: 'Toutes disciplines', trophee: 'bouee', bareme: 'sportif',
      criteres: 'Moins de 21 ans au 1er janvier de la saison, licencié(e) dans un club du territoire, toutes disciplines.',
      remisPar: 'Un(e) sportif(ve) de haut niveau formé(e) dans le Cotentin (les années suivantes : le ou la lauréat(e) de l’an passé)', remettant: '', nommes: [], laureat: '' },
    { id: 'sportive', titre: 'Sportive de l’année', discipline: 'Toutes disciplines', trophee: 'vague', bareme: 'sportif',
      criteres: 'Licenciée dans un club du territoire cette saison, toutes disciplines, 16 ans et plus.',
      remisPar: 'Représentant(e) du Département de la Manche', remettant: '', nommes: [], laureat: '' },
    { id: 'sportif', titre: 'Sportif de l’année', discipline: 'Toutes disciplines', trophee: 'vague', bareme: 'sportif',
      criteres: 'Licencié dans un club du territoire cette saison, toutes disciplines, 16 ans et plus.',
      remisPar: 'Représentant(e) du Département de la Manche', remettant: '', nommes: [], laureat: '' },
    { id: 'equipe', titre: 'Équipe de l’année', discipline: 'Toutes disciplines', trophee: 'rade', bareme: 'collectif',
      criteres: 'Une équipe d’un club du territoire, jeunes ou seniors, toutes disciplines.',
      remisPar: 'Partenaire principal de la soirée', remettant: '', nommes: [], laureat: '' },
    { id: 'entraineur', titre: 'Entraîneur(e) de l’année', discipline: 'Toutes disciplines', trophee: 'boussole', bareme: 'engagement',
      criteres: 'Entraîneur(e) ou éducateur(trice), bénévole ou salarié(e), d’un club du territoire.',
      remisPar: 'Un(e) ancien(ne) joueur(se) formé(e) par un(e) des nommé(e)s', remettant: '', nommes: [], laureat: '' },
    { id: 'arbitre', titre: 'Arbitre ou officiel de l’année', discipline: 'Toutes disciplines', trophee: 'amer', bareme: 'engagement',
      criteres: 'Arbitre, juge ou officiel de table licencié(e) sur le territoire.',
      remisPar: 'Responsable départemental(e) de l’arbitrage d’une des disciplines', remettant: '', nommes: [], laureat: '' },
    { id: 'benevole', titre: 'Bénévole ou dirigeant(e) de l’année', discipline: 'Toutes disciplines', trophee: 'phare', bareme: 'engagement',
      criteres: 'Bénévole ou membre du bureau d’un club du territoire, proposé(e) par son club avec un court dossier.',
      remisPar: 'Élu(e) chargé(e) des sports de Cherbourg-en-Cotentin', remettant: '', nommes: [], laureat: '' },
    { id: 'adapte', titre: 'Sport adapté et handisport', discipline: 'Toutes disciplines', trophee: 'cap', bareme: 'collectif',
      criteres: 'Sportif(ve), équipe ou initiative du sport adapté ou du handisport sur le territoire.',
      remisPar: 'Représentant(e) du comité handisport ou sport adapté de la Manche', remettant: '', nommes: [], laureat: '' },
    { id: 'exploit', titre: 'Exploit de l’année (prix du public)', discipline: 'Toutes disciplines', trophee: 'ecume', bareme: 'public',
      criteres: 'Un match, une course, une remontée, une qualification : trois moments de la saison retenus par le jury.',
      remisPar: 'Un(e) abonné(e) BE+ tiré(e) au sort parmi les votants', remettant: '', nommes: [], laureat: '' },
    { id: 'maree-or', titre: 'La Marée d’or', discipline: 'Toutes disciplines', trophee: 'maree', bareme: 'maree',
      criteres: 'Les lauréat(e)s de la soirée en Révélation, Sportive, Sportif et Équipe. Le public vote en direct pendant la soirée.',
      remisPar: 'Le fondateur de Casa Besports', remettant: '', nommes: [], laureat: '' }
  ]
};
