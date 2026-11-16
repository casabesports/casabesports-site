/*
 * Casa Besports — banque de questions du « Quiz foot » (rubrique Jeux, #/jeux).
 * Culture générale du football international, rangée par thème (pays, championnat ou compétition).
 * Le jeu tire les questions au hasard : un thème, plusieurs, ou tout mélangé.
 * Les questions restent dans l'appli : le quiz marche aussi sans réseau (dans le bus).
 *
 * Une ligne = [ thème, question, bonne réponse, mauvaise 1, mauvaise 2, mauvaise 3, explication ]
 * Thèmes : monde, euro, ldc, france, angleterre, espagne, italie, allemagne, sudam, afrique, europe, legendes
 * N'ajoutez que des faits vérifiés et qui ne bougent plus (palmarès passés, records établis).
 * Vos propres questions peuvent aussi s'ajouter dans Admin › Contenus › « Jeux : questions du quiz ».
 */
window.CASA_QUIZ_FOOT_THEMES = [
  { id: 'monde', label: 'Coupe du monde' },
  { id: 'euro', label: 'Euro' },
  { id: 'ldc', label: 'Ligue des champions' },
  { id: 'france', label: 'France · Ligue 1' },
  { id: 'angleterre', label: 'Angleterre · Premier League' },
  { id: 'espagne', label: 'Espagne · Liga' },
  { id: 'italie', label: 'Italie · Serie A' },
  { id: 'allemagne', label: 'Allemagne · Bundesliga' },
  { id: 'sudam', label: 'Amérique du Sud' },
  { id: 'afrique', label: 'Afrique' },
  { id: 'europe', label: 'Reste de l’Europe' },
  { id: 'legendes', label: 'Légendes et records' }
];
window.CASA_QUIZ_FOOT = [
  // ----- Coupe du monde -----
  ['monde', 'Quel pays a remporté la Coupe du monde 2018 ?', 'France', 'Croatie', 'Belgique', 'Brésil', 'La France bat la Croatie 4-2 en finale, à Moscou.'],
  ['monde', 'Quel pays a remporté la Coupe du monde 2022 au Qatar ?', 'Argentine', 'France', 'Croatie', 'Maroc', 'L’Argentine bat la France aux tirs au but après un 3-3 légendaire.'],
  ['monde', 'Qui a marqué un triplé en finale de la Coupe du monde 2022 ?', 'Kylian Mbappé', 'Lionel Messi', 'Ángel Di María', 'Olivier Giroud', 'Mbappé est le deuxième joueur de l’histoire à marquer un triplé en finale.'],
  ['monde', 'Combien de Coupes du monde le Brésil a-t-il gagnées ?', '5', '4', '3', '6', '1958, 1962, 1970, 1994 et 2002.'],
  ['monde', 'Quel pays a remporté la toute première Coupe du monde, en 1930 ?', 'Uruguay', 'Argentine', 'Brésil', 'Italie', 'L’Uruguay organise et gagne la première édition, contre l’Argentine.'],
  ['monde', 'Quel a été le score de la finale France-Brésil en 1998 ?', '3-0', '2-0', '1-0', '4-1', 'Doublé de Zidane de la tête, puis Petit dans les arrêts de jeu.'],
  ['monde', 'Qui est le meilleur buteur de l’histoire de la Coupe du monde ?', 'Miroslav Klose', 'Ronaldo', 'Gerd Müller', 'Just Fontaine', '16 buts en quatre Coupes du monde avec l’Allemagne.'],
  ['monde', 'Combien de buts Just Fontaine a-t-il marqués à la Coupe du monde 1958 ?', '13', '9', '11', '15', 'Un record sur une seule édition, jamais battu depuis.'],
  ['monde', 'Quel pays a gagné la Coupe du monde 2010 en Afrique du Sud ?', 'Espagne', 'Pays-Bas', 'Allemagne', 'Uruguay', 'But d’Iniesta en prolongation en finale contre les Pays-Bas.'],
  ['monde', 'Quel pays a gagné la Coupe du monde 2006 en Allemagne ?', 'Italie', 'France', 'Allemagne', 'Portugal', 'L’Italie bat la France aux tirs au but à Berlin.'],
  ['monde', 'Quel pays a gagné la Coupe du monde 2014 au Brésil ?', 'Allemagne', 'Argentine', 'Brésil', 'Pays-Bas', 'But de Mario Götze en prolongation contre l’Argentine.'],
  ['monde', 'Combien de pays organisent ensemble la Coupe du monde 2026 ?', '3', '2', '1', '4', 'Les États-Unis, le Canada et le Mexique.'],
  ['monde', 'Contre quel pays Maradona a-t-il marqué « la main de Dieu » en 1986 ?', 'Angleterre', 'Allemagne de l’Ouest', 'Belgique', 'Italie', 'En quart de finale, quelques minutes avant son but du siècle.'],
  ['monde', 'Combien de Coupes du monde Pelé a-t-il gagnées comme joueur ?', '3', '2', '1', '4', '1958, 1962 et 1970 : un record.'],
  ['monde', 'Lors de quelle Coupe du monde l’assistance vidéo (VAR) a-t-elle été utilisée pour la première fois ?', '2018', '2014', '2010', '2022', 'En Russie, en 2018.'],
  ['monde', 'Combien de Coupes du monde l’Italie a-t-elle gagnées ?', '4', '3', '2', '5', '1934, 1938, 1982 et 2006.'],
  ['monde', 'Quel score a fait date en demi-finale Brésil-Allemagne en 2014 ?', '1-7', '0-5', '1-5', '2-7', 'Le Brésil s’effondre à domicile, à Belo Horizonte.'],
  ['monde', 'Quel joueur turc a marqué le but le plus rapide de l’histoire de la Coupe du monde (11 secondes) ?', 'Hakan Şükür', 'Arda Turan', 'Hakan Çalhanoğlu', 'Nihat Kahveci', 'Contre la Corée du Sud, en 2002.'],

  // ----- Euro -----
  ['euro', 'Quel pays a gagné l’Euro 2016 en France ?', 'Portugal', 'France', 'Allemagne', 'Pays de Galles', 'Le Portugal bat la France 1-0 en prolongation au Stade de France.'],
  ['euro', 'Qui a marqué le but du titre en finale de l’Euro 2016 ?', 'Éder', 'Cristiano Ronaldo', 'Nani', 'Renato Sanches', 'Une frappe de loin en prolongation, Ronaldo blessé sur le banc.'],
  ['euro', 'Quel pays a gagné l’Euro 2020 (joué en 2021) ?', 'Italie', 'Angleterre', 'Espagne', 'Danemark', 'L’Italie bat l’Angleterre aux tirs au but à Wembley.'],
  ['euro', 'Quel pays a gagné l’Euro 2024 en Allemagne ?', 'Espagne', 'Angleterre', 'France', 'Pays-Bas', 'L’Espagne bat l’Angleterre 2-1 en finale à Berlin.'],
  ['euro', 'Combien de buts Michel Platini a-t-il marqués à l’Euro 1984 ?', '9', '5', '7', '11', 'En cinq matchs : un record, et le premier titre de la France.'],
  ['euro', 'Qui a marqué le but en or de la finale de l’Euro 2000 contre l’Italie ?', 'David Trezeguet', 'Sylvain Wiltord', 'Thierry Henry', 'Zinédine Zidane', 'Wiltord égalise à la dernière minute, Trezeguet délivre la France en prolongation.'],
  ['euro', 'Quel pays a créé la surprise en gagnant l’Euro 2004 ?', 'Grèce', 'Portugal', 'République tchèque', 'Pays-Bas', 'La Grèce bat le Portugal, pays organisateur, en finale.'],
  ['euro', 'Quel pays a gagné l’Euro 1992 alors qu’il n’était pas qualifié au départ ?', 'Danemark', 'Allemagne', 'Suède', 'Pays-Bas', 'Repêché à la place de la Yougoslavie, le Danemark bat l’Allemagne en finale.'],
  ['euro', 'Quel pays a gagné l’Euro 2008 et l’Euro 2012 ?', 'Espagne', 'Allemagne', 'Italie', 'Portugal', 'Avec la Coupe du monde 2010 entre les deux.'],
  ['euro', 'Combien d’Euros l’Espagne a-t-elle gagnés ?', '4', '3', '2', '5', '1964, 2008, 2012 et 2024 : un record.'],

  // ----- Ligue des champions -----
  ['ldc', 'Quel club a gagné le plus de Coupes d’Europe des clubs champions et Ligues des champions ?', 'Real Madrid', 'AC Milan', 'Bayern Munich', 'Liverpool', 'Le Real Madrid est de loin le recordman.'],
  ['ldc', 'Quel a été le premier club français vainqueur de la Ligue des champions ?', 'Olympique de Marseille', 'Paris Saint-Germain', 'AS Monaco', 'AS Saint-Étienne', 'En 1993, contre l’AC Milan à Munich.'],
  ['ldc', 'Qui a marqué le but de la victoire de l’OM en finale de la Ligue des champions 1993 ?', 'Basile Boli', 'Rudi Völler', 'Alen Bokšić', 'Didier Deschamps', 'D’une tête sur corner, juste avant la mi-temps.'],
  ['ldc', 'En 2005, quel club remonte un 0-3 contre l’AC Milan en finale à Istanbul ?', 'Liverpool', 'Chelsea', 'Manchester United', 'Arsenal', '3-3 puis victoire aux tirs au but.'],
  ['ldc', 'En 1999, quel club bat le Bayern avec deux buts dans les arrêts de jeu ?', 'Manchester United', 'Arsenal', 'Juventus', 'FC Barcelone', 'Sheringham puis Solskjær renversent le match à Barcelone.'],
  ['ldc', 'Quel entraîneur a gagné trois Ligues des champions d’affilée avec le Real Madrid (2016, 2017, 2018) ?', 'Zinédine Zidane', 'Carlo Ancelotti', 'José Mourinho', 'Vicente del Bosque', 'Une première dans l’ère Ligue des champions.'],
  ['ldc', 'Qui est le meilleur buteur de l’histoire de la Ligue des champions ?', 'Cristiano Ronaldo', 'Lionel Messi', 'Robert Lewandowski', 'Karim Benzema', 'Plus de 140 buts, avec Manchester United, le Real et la Juventus.'],
  ['ldc', 'Quel club français a joué la toute première finale de la Coupe des clubs champions, en 1956 ?', 'Stade de Reims', 'AS Saint-Étienne', 'Olympique de Marseille', 'OGC Nice', 'Reims perd 4-3 contre le Real Madrid, à Paris.'],
  ['ldc', 'Quel club français est associé aux « poteaux carrés » de la finale 1976 ?', 'AS Saint-Étienne', 'Stade de Reims', 'Olympique de Marseille', 'SC Bastia', 'Battus 1-0 par le Bayern à Glasgow, après deux tirs sur les poteaux.'],
  ['ldc', 'Contre quel club Monaco a-t-il perdu la finale de la Ligue des champions 2004 ?', 'FC Porto', 'Real Madrid', 'Chelsea', 'Valence', 'Le Porto de José Mourinho gagne 3-0.'],
  ['ldc', 'Avec quel club Didier Drogba a-t-il gagné la Ligue des champions en 2012 ?', 'Chelsea', 'Olympique de Marseille', 'Galatasaray', 'Arsenal', 'Égalisation de la tête puis tir au but décisif, contre le Bayern à Munich.'],

  // ----- France · Ligue 1 -----
  ['france', 'Quel club compte le plus de titres de champion de France ?', 'Paris Saint-Germain', 'AS Saint-Étienne', 'Olympique de Marseille', 'Olympique lyonnais', 'Le PSG a dépassé les 10 titres de Saint-Étienne.'],
  ['france', 'Quel club a été sept fois champion de France d’affilée, de 2002 à 2008 ?', 'Olympique lyonnais', 'Paris Saint-Germain', 'Girondins de Bordeaux', 'LOSC Lille', 'Une série unique dans l’histoire du championnat.'],
  ['france', 'Dans quelle ville se trouve le stade Vélodrome ?', 'Marseille', 'Bordeaux', 'Lyon', 'Lille', 'Le stade de l’OM.'],
  ['france', 'Quel club joue au stade Geoffroy-Guichard ?', 'AS Saint-Étienne', 'Olympique lyonnais', 'FC Nantes', 'Stade rennais', 'Le « Chaudron » des Verts.'],
  ['france', 'Quel club joue au stade Bollaert-Delelis ?', 'RC Lens', 'LOSC Lille', 'Valenciennes FC', 'Amiens SC', 'Un des stades les plus chauds de France.'],
  ['france', 'Quel club normand joue au stade Michel-d’Ornano ?', 'SM Caen', 'Le Havre AC', 'QRM', 'FC Rouen', 'Le stade de Caen.'],
  ['france', 'Quel club est considéré comme le doyen des clubs de football en France ?', 'Le Havre AC', 'Girondins de Bordeaux', 'Stade rennais', 'Olympique de Marseille', 'Fondé en 1872, en Normandie.'],
  ['france', 'Dans quel club Kylian Mbappé a-t-il débuté chez les professionnels ?', 'AS Monaco', 'Paris Saint-Germain', 'LOSC Lille', 'Stade rennais', 'Champion de France avec Monaco en 2017, avant de rejoindre Paris.'],
  ['france', 'En 2000, quel club amateur atteint la finale de la Coupe de France ?', 'Calais', 'Quevilly', 'Les Herbiers', 'Chambly', 'Calais perd 2-1 contre Nantes au Stade de France.'],
  ['france', 'Quel Français a gagné le Ballon d’Or 2022 ?', 'Karim Benzema', 'Kylian Mbappé', 'Antoine Griezmann', 'N’Golo Kanté', 'Après une saison folle avec le Real Madrid.'],
  ['france', 'Combien de Ballons d’Or Michel Platini a-t-il gagnés d’affilée ?', '3', '2', '4', '1', '1983, 1984 et 1985.'],
  ['france', 'Qui a été le premier Français à gagner le Ballon d’Or, en 1958 ?', 'Raymond Kopa', 'Just Fontaine', 'Michel Platini', 'Jean-Pierre Papin', 'Kopa jouait alors au Real Madrid.'],
  ['france', 'Quel est le surnom de l’équipe de France ?', 'Les Bleus', 'Les Coqs', 'Les Tricolores du Nord', 'La Seleção', 'Les Bleues pour l’équipe féminine.'],

  // ----- Angleterre · Premier League -----
  ['angleterre', 'Quel club a terminé la Premier League 2003-2004 sans aucune défaite ?', 'Arsenal', 'Chelsea', 'Manchester United', 'Liverpool', 'Les « Invincibles » d’Arsène Wenger.'],
  ['angleterre', 'Quel entraîneur a mené Leicester City au titre de champion d’Angleterre en 2016 ?', 'Claudio Ranieri', 'Brendan Rodgers', 'José Mourinho', 'Arsène Wenger', 'Un des plus grands exploits de l’histoire du football.'],
  ['angleterre', 'Combien d’années Arsène Wenger a-t-il entraîné Arsenal ?', '22', '15', '18', '25', 'De 1996 à 2018.'],
  ['angleterre', 'Qui est le meilleur buteur de l’histoire de la Premier League ?', 'Alan Shearer', 'Harry Kane', 'Wayne Rooney', 'Thierry Henry', '260 buts avec Blackburn et Newcastle.'],
  ['angleterre', 'Qui est le meilleur buteur de l’histoire d’Arsenal ?', 'Thierry Henry', 'Ian Wright', 'Robin van Persie', 'Dennis Bergkamp', 'Une statue l’attend devant l’Emirates Stadium.'],
  ['angleterre', 'Quel club joue à Old Trafford ?', 'Manchester United', 'Manchester City', 'Liverpool', 'Leeds United', 'Le « Théâtre des rêves ».'],
  ['angleterre', 'Quel club joue à Anfield ?', 'Liverpool', 'Everton', 'Manchester United', 'Newcastle', 'You’ll Never Walk Alone.'],
  ['angleterre', 'Quel club a gagné quatre Premier League d’affilée, de 2021 à 2024 ?', 'Manchester City', 'Manchester United', 'Liverpool', 'Chelsea', 'Une première dans l’histoire du championnat anglais.'],
  ['angleterre', 'Avec quel club Éric Cantona a-t-il été champion d’Angleterre en 1992, avant Manchester United ?', 'Leeds United', 'Arsenal', 'Liverpool', 'Newcastle', 'Il rejoint Manchester United quelques mois plus tard.'],
  ['angleterre', 'Quels clubs s’affrontent dans le derby de la Mersey ?', 'Liverpool et Everton', 'Manchester United et City', 'Arsenal et Tottenham', 'Chelsea et Fulham', 'Les deux clubs de Liverpool.'],
  ['angleterre', 'Dans quelle ville se trouve le stade de Wembley ?', 'Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Le stade de l’équipe d’Angleterre.'],

  // ----- Espagne · Liga -----
  ['espagne', 'Quels clubs s’affrontent dans « El Clásico » ?', 'Real Madrid et FC Barcelone', 'Real et Atlético Madrid', 'Barcelone et Espanyol', 'Séville et Betis', 'Le match le plus suivi d’Espagne.'],
  ['espagne', 'Quel club joue au stade Santiago-Bernabéu ?', 'Real Madrid', 'Atlético Madrid', 'FC Barcelone', 'Valence', 'Du nom d’un ancien président du club.'],
  ['espagne', 'Comment s’appelle le centre de formation du FC Barcelone ?', 'La Masia', 'La Fábrica', 'Lezama', 'La Cantera Blanca', 'Messi, Xavi, Iniesta et Busquets en sont sortis.'],
  ['espagne', 'Combien de Ballons d’Or Lionel Messi a-t-il gagnés ?', '8', '6', '7', '5', 'Le record absolu.'],
  ['espagne', 'Quel club basque ne fait jouer que des joueurs liés au Pays basque ?', 'Athletic Bilbao', 'Real Sociedad', 'Osasuna', 'Alavés', 'Une tradition gardée depuis plus d’un siècle.'],
  ['espagne', 'De quel club Zinédine Zidane arrive-t-il au Real Madrid en 2001 ?', 'Juventus', 'Girondins de Bordeaux', 'AS Cannes', 'AC Milan', 'Un transfert record à l’époque.'],
  ['espagne', 'Quel club joue au stade de Mestalla ?', 'Valence', 'Séville', 'Villarreal', 'Real Betis', 'Un des plus anciens stades d’Espagne.'],
  ['espagne', 'Qui est le meilleur buteur de l’histoire de la Liga ?', 'Lionel Messi', 'Cristiano Ronaldo', 'Telmo Zarra', 'Raúl', 'Plus de 470 buts avec le FC Barcelone.'],

  // ----- Italie · Serie A -----
  ['italie', 'Quel club a gagné le plus de championnats d’Italie ?', 'Juventus', 'AC Milan', 'Inter Milan', 'AS Roma', 'La « Vieille Dame » de Turin.'],
  ['italie', 'Quels clubs partagent le stade San Siro ?', 'AC Milan et Inter', 'Juventus et Torino', 'AS Roma et Lazio', 'Genoa et Sampdoria', 'Le stade s’appelle aussi Giuseppe-Meazza.'],
  ['italie', 'Quel club Diego Maradona a-t-il mené au titre de champion d’Italie en 1987 ?', 'Naples', 'Juventus', 'AS Roma', 'Inter Milan', 'Le stade de Naples porte aujourd’hui son nom.'],
  ['italie', 'Quel club a été relégué en Serie B en 2006 après le scandale du Calciopoli ?', 'Juventus', 'AC Milan', 'Lazio', 'Fiorentina', 'La Juve remonte dès la saison suivante.'],
  ['italie', 'Dans quel seul club Paolo Maldini a-t-il joué toute sa carrière ?', 'AC Milan', 'Inter Milan', 'Juventus', 'AS Roma', 'Plus de 900 matchs avec les Rossoneri.'],
  ['italie', 'Avec quel club Francesco Totti a-t-il fait toute sa carrière ?', 'AS Roma', 'Lazio', 'Naples', 'Fiorentina', 'Le capitaine de la Louve pendant près de 20 ans.'],
  ['italie', 'Comment appelle-t-on le derby entre l’AC Milan et l’Inter ?', 'Derby della Madonnina', 'Derby della Capitale', 'Derby d’Italia', 'Derby della Lanterna', 'Du nom de la statue au sommet de la cathédrale de Milan.'],

  // ----- Allemagne · Bundesliga -----
  ['allemagne', 'Quel club a été champion d’Allemagne 2024 sans perdre un seul match ?', 'Bayer Leverkusen', 'Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Le premier titre de l’histoire du club, avec Xabi Alonso.'],
  ['allemagne', 'Quel club est célèbre pour son « Mur jaune » ?', 'Borussia Dortmund', 'Bayern Munich', 'Schalke 04', 'Werder Brême', 'La tribune sud du stade de Dortmund.'],
  ['allemagne', 'Qui a battu en 2021 le record de buts sur une saison de Bundesliga, détenu par Gerd Müller ?', 'Robert Lewandowski', 'Erling Haaland', 'Harry Kane', 'Thomas Müller', '41 buts, un de plus que les 40 de Gerd Müller.'],
  ['allemagne', 'Combien de Coupes du monde l’Allemagne a-t-elle gagnées ?', '4', '3', '5', '2', '1954, 1974, 1990 et 2014.'],
  ['allemagne', 'Qui a gagné la Coupe du monde comme joueur (1974) puis comme sélectionneur (1990) ?', 'Franz Beckenbauer', 'Gerd Müller', 'Lothar Matthäus', 'Jürgen Klinsmann', '« Der Kaiser ».'],
  ['allemagne', 'Quel était le surnom de Gerd Müller ?', 'Der Bomber', 'Der Kaiser', 'Der Titan', 'Der Panzer', 'Un des plus grands buteurs de l’histoire.'],
  ['allemagne', 'Combien de titres d’affilée le Bayern a-t-il gagnés de 2013 à 2023 ?', '11', '8', '9', '10', 'Une série record, stoppée par Leverkusen en 2024.'],

  // ----- Amérique du Sud -----
  ['sudam', 'Dans quelle ville se trouve le stade Maracanã ?', 'Rio de Janeiro', 'São Paulo', 'Buenos Aires', 'Brasília', 'Il a accueilli les finales des Coupes du monde 1950 et 2014.'],
  ['sudam', 'Quel pays bat le Brésil au Maracanã en 1950 (le « Maracanazo ») ?', 'Uruguay', 'Argentine', 'Italie', 'Suède', 'Un traumatisme national au Brésil.'],
  ['sudam', 'Dans quel club brésilien Pelé a-t-il joué l’essentiel de sa carrière ?', 'Santos', 'Flamengo', 'Corinthians', 'São Paulo', 'Avant de finir aux États-Unis, au Cosmos de New York.'],
  ['sudam', 'Comment s’appelle la « Ligue des champions » d’Amérique du Sud ?', 'Copa Libertadores', 'Copa América', 'Copa Sudamericana', 'Recopa', 'La plus prestigieuse coupe des clubs du continent.'],
  ['sudam', 'Comment s’appelle le stade de Boca Juniors ?', 'La Bombonera', 'El Monumental', 'El Cilindro', 'El Centenario', 'À Buenos Aires, face à River Plate dans le « Superclásico ».'],
  ['sudam', 'Qui est le dernier Brésilien à avoir gagné le Ballon d’Or ?', 'Kaká', 'Ronaldinho', 'Neymar', 'Ronaldo', 'En 2007, avec l’AC Milan.'],
  ['sudam', 'Combien a coûté le transfert de Neymar au PSG en 2017 ?', '222 millions d’euros', '150 millions d’euros', '180 millions d’euros', '250 millions d’euros', 'Le transfert le plus cher de l’histoire.'],
  ['sudam', 'Combien de Coupes du monde l’Argentine a-t-elle gagnées ?', '3', '2', '4', '1', '1978, 1986 et 2022.'],

  // ----- Afrique -----
  ['afrique', 'Quel pays est devenu le premier pays africain demi-finaliste d’une Coupe du monde, en 2022 ?', 'Maroc', 'Sénégal', 'Cameroun', 'Ghana', 'Les Lions de l’Atlas éliminent l’Espagne puis le Portugal.'],
  ['afrique', 'Quel est le surnom de l’équipe du Cameroun ?', 'Les Lions indomptables', 'Les Éléphants', 'Les Super Eagles', 'Les Pharaons', 'Les Éléphants, c’est la Côte d’Ivoire.'],
  ['afrique', 'Quel pays a gagné le plus de Coupes d’Afrique des nations ?', 'Égypte', 'Cameroun', 'Ghana', 'Nigeria', 'Sept titres pour les Pharaons.'],
  ['afrique', 'Quel joueur est le seul Africain à avoir gagné le Ballon d’Or ?', 'George Weah', 'Didier Drogba', 'Samuel Eto’o', 'Mohamed Salah', 'En 1995 avec l’AC Milan ; il deviendra président du Liberia.'],
  ['afrique', 'Quel pays bat la France 1-0 en match d’ouverture de la Coupe du monde 2002 ?', 'Sénégal', 'Cameroun', 'Nigeria', 'Côte d’Ivoire', 'But de Papa Bouba Diop à Séoul.'],
  ['afrique', 'Quel pays a gagné la Coupe d’Afrique des nations 2019 en Égypte ?', 'Algérie', 'Sénégal', 'Nigeria', 'Tunisie', 'Victoire 1-0 contre le Sénégal en finale.'],
  ['afrique', 'Quel pays a gagné sa première Coupe d’Afrique des nations en 2022 ?', 'Sénégal', 'Égypte', 'Cameroun', 'Burkina Faso', 'Aux tirs au but contre l’Égypte, avec Sadio Mané.'],
  ['afrique', 'Quel est le surnom de l’équipe de Côte d’Ivoire ?', 'Les Éléphants', 'Les Lions de la Teranga', 'Les Fennecs', 'Les Aigles de Carthage', 'Les Fennecs, c’est l’Algérie.'],

  // ----- Reste de l'Europe -----
  ['europe', 'Dans quel club Cristiano Ronaldo a-t-il été formé ?', 'Sporting Portugal', 'Benfica', 'FC Porto', 'Nacional Madère', 'Avant de rejoindre Manchester United en 2003.'],
  ['europe', 'À quel club la légende portugaise Eusébio est-elle associée ?', 'Benfica', 'Sporting Portugal', 'FC Porto', 'Boavista', 'Ballon d’Or 1965.'],
  ['europe', 'Quel pays est associé au « football total » et à Johan Cruyff ?', 'Pays-Bas', 'Belgique', 'Allemagne', 'Hongrie', 'Avec l’Ajax Amsterdam des années 1970.'],
  ['europe', 'Combien de finales de Coupe du monde les Pays-Bas ont-ils perdues ?', '3', '2', '1', '4', '1974, 1978 et 2010.'],
  ['europe', 'Quel est le surnom de l’équipe de Belgique ?', 'Les Diables rouges', 'Les Lions', 'Les Oranje', 'Les Vikings', 'Troisièmes de la Coupe du monde 2018.'],
  ['europe', 'Quel Croate a gagné le Ballon d’Or 2018 ?', 'Luka Modrić', 'Ivan Rakitić', 'Mario Mandžukić', 'Ivan Perišić', 'Finaliste de la Coupe du monde la même année.'],
  ['europe', 'Quels clubs s’affrontent dans l’« Old Firm » à Glasgow ?', 'Celtic et Rangers', 'Hearts et Hibernian', 'Aberdeen et Dundee', 'Celtic et Aberdeen', 'Un des derbys les plus anciens du monde.'],
  ['europe', 'Comment s’appelle aujourd’hui le stade de l’Ajax Amsterdam ?', 'Johan Cruijff ArenA', 'Philips Stadion', 'De Kuip', 'Abe Lenstra Stadion', 'Rebaptisé en hommage à Cruyff.'],

  // ----- Légendes et records -----
  ['legendes', 'Quel magazine a créé le Ballon d’Or en 1956 ?', 'France Football', 'L’Équipe', 'Onze Mondial', 'So Foot', 'Le trophée individuel le plus célèbre du football.'],
  ['legendes', 'Combien de remplacements sont autorisés par équipe dans un match officiel depuis 2022 ?', '5', '3', '4', '6', 'Règle adoptée pendant la pandémie, puis gardée.'],
  ['legendes', 'Combien de joueurs compte une équipe sur le terrain au coup d’envoi ?', '11', '10', '12', '9', 'Gardien compris.'],
  ['legendes', 'Quel joueur a gagné le plus de Ballons d’Or ?', 'Lionel Messi', 'Cristiano Ronaldo', 'Michel Platini', 'Johan Cruyff', 'Huit trophées.'],
  ['legendes', 'Combien de Ballons d’Or Cristiano Ronaldo a-t-il gagnés ?', '5', '4', '6', '3', '2008, 2013, 2014, 2016 et 2017.'],
  ['legendes', 'Quel Français a gagné le Ballon d’Or 1998 ?', 'Zinédine Zidane', 'Thierry Henry', 'Didier Deschamps', 'Lilian Thuram', 'L’année du premier titre mondial des Bleus.'],
  ['legendes', 'À quel club Johan Cruyff est-il le plus associé, comme joueur et comme entraîneur ?', 'Ajax et FC Barcelone', 'Ajax et Feyenoord', 'PSV et Real Madrid', 'Barcelone et AC Milan', 'Il a façonné le jeu du Barça.'],
  ['legendes', 'Quel gardien soviétique est le seul gardien à avoir gagné le Ballon d’Or ?', 'Lev Yachine', 'Rinat Dassaev', 'Igor Akinfeev', 'Oleksandr Chovkovsky', 'En 1963. Le trophée du meilleur gardien porte son nom.']
];
