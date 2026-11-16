/*
 * Casa Besports — banque de questions du « Quiz du bus » (rubrique Jeux, #/jeux).
 * Culture générale du sport international : football, basket, handball, volley et hockey sur glace,
 * rangée par sport puis par thème (pays, championnat ou compétition).
 * Le jeu tire les questions au hasard : un sport, un ou plusieurs thèmes, ou tout mélangé.
 * Les questions restent dans l'appli : le quiz marche aussi sans réseau (dans le bus).
 *
 * Une ligne = [ thème, question, bonne réponse, mauvaise 1, mauvaise 2, mauvaise 3, explication ]
 * Thèmes : voir CASA_QUIZ_FOOT_THEMES ci-dessous (chaque thème appartient à un sport)
 * N'ajoutez que des faits vérifiés et qui ne bougent plus (palmarès passés, records établis).
 * Vos propres questions peuvent aussi s'ajouter dans Admin › Contenus › « Jeux : questions du quiz ».
 */
window.CASA_QUIZ_FOOT_THEMES = [
  { id: 'monde', sport: 'Football', label: 'Coupe du monde' },
  { id: 'euro', sport: 'Football', label: 'Euro' },
  { id: 'ldc', sport: 'Football', label: 'Ligue des champions' },
  { id: 'france', sport: 'Football', label: 'France · Ligue 1' },
  { id: 'angleterre', sport: 'Football', label: 'Angleterre · Premier League' },
  { id: 'espagne', sport: 'Football', label: 'Espagne · Liga' },
  { id: 'italie', sport: 'Football', label: 'Italie · Serie A' },
  { id: 'allemagne', sport: 'Football', label: 'Allemagne · Bundesliga' },
  { id: 'sudam', sport: 'Football', label: 'Amérique du Sud' },
  { id: 'afrique', sport: 'Football', label: 'Afrique' },
  { id: 'europe', sport: 'Football', label: 'Reste de l’Europe' },
  { id: 'legendes', sport: 'Football', label: 'Légendes et records' },
  { id: 'nba', sport: 'Basket', label: 'NBA' },
  { id: 'basket', sport: 'Basket', label: 'Basket : France, Europe et règles' },
  { id: 'hand', sport: 'Handball', label: 'Handball' },
  { id: 'volley', sport: 'Volley-ball', label: 'Volley-ball' },
  { id: 'hockey', sport: 'Hockey', label: 'Hockey sur glace' }
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
  ['legendes', 'Quel gardien soviétique est le seul gardien à avoir gagné le Ballon d’Or ?', 'Lev Yachine', 'Rinat Dassaev', 'Igor Akinfeev', 'Oleksandr Chovkovsky', 'En 1963. Le trophée du meilleur gardien porte son nom.'],

  // ----- Basket · NBA -----
  ['nba', 'Combien de titres NBA Michael Jordan a-t-il gagnés ?', '6', '5', '4', '7', 'Trois de suite en 1991-1993, puis en 1996-1998.'],
  ['nba', 'Avec quelle franchise Michael Jordan a-t-il gagné ses titres NBA ?', 'Chicago Bulls', 'Los Angeles Lakers', 'Boston Celtics', 'Detroit Pistons', 'Six titres avec les Bulls, entraînés par Phil Jackson.'],
  ['nba', 'Qui a marqué 100 points dans un seul match NBA, en 1962 ?', 'Wilt Chamberlain', 'Kobe Bryant', 'Michael Jordan', 'Bill Russell', 'Un record jamais approché depuis.'],
  ['nba', 'Combien de points Kobe Bryant a-t-il marqués contre Toronto en 2006 ?', '81', '71', '64', '92', 'Le deuxième plus gros total de l’histoire, derrière les 100 de Chamberlain.'],
  ['nba', 'Qui est le meilleur marqueur de l’histoire de la NBA ?', 'LeBron James', 'Kareem Abdul-Jabbar', 'Karl Malone', 'Kobe Bryant', 'Il a dépassé Kareem Abdul-Jabbar en 2023.'],
  ['nba', 'Quelle franchise compte le plus de titres NBA ?', 'Boston Celtics', 'Los Angeles Lakers', 'Chicago Bulls', 'Golden State Warriors', 'Les Celtics devancent de peu les Lakers.'],
  ['nba', 'Combien de titres NBA Bill Russell a-t-il gagnés avec Boston ?', '11', '8', '9', '13', 'Le record absolu pour un joueur ; le trophée de MVP des Finales porte son nom.'],
  ['nba', 'Avec quelle franchise Tony Parker a-t-il gagné ses quatre titres NBA ?', 'San Antonio Spurs', 'Charlotte Hornets', 'Dallas Mavericks', 'Miami Heat', '2003, 2005, 2007 et 2014.'],
  ['nba', 'Quel Français a été élu meilleur joueur (MVP) des Finales NBA en 2007 ?', 'Tony Parker', 'Boris Diaw', 'Joakim Noah', 'Nicolas Batum', 'Le premier Européen à recevoir ce titre.'],
  ['nba', 'Quelle franchise a choisi Victor Wembanyama en premier choix de la draft 2023 ?', 'San Antonio Spurs', 'Charlotte Hornets', 'Houston Rockets', 'Detroit Pistons', 'Il est élu meilleur débutant (rookie) de la saison 2023-2024.'],
  ['nba', 'Combien de fois Rudy Gobert a-t-il été élu meilleur défenseur de la NBA ?', '4', '2', '3', '5', '2018, 2019, 2021 et 2024.'],
  ['nba', 'Qui détient le record de paniers à 3 points en carrière NBA ?', 'Stephen Curry', 'Ray Allen', 'James Harden', 'Klay Thompson', 'Le meneur des Golden State Warriors.'],
  ['nba', 'Combien de temps dure un quart-temps en NBA ?', '12 minutes', '10 minutes', '15 minutes', '8 minutes', 'En compétition FIBA (Europe, JO), c’est 10 minutes.'],
  ['nba', 'Combien de secondes une équipe a-t-elle pour tirer en NBA ?', '24', '30', '20', '35', 'La règle des 24 secondes, adoptée en 1954.'],
  ['nba', 'Avec quelle franchise Nikola Jokić a-t-il été champion NBA en 2023 ?', 'Denver Nuggets', 'Phoenix Suns', 'Miami Heat', 'Boston Celtics', 'Le premier titre de l’histoire de Denver.'],
  ['nba', 'Avec quelle franchise Dirk Nowitzki a-t-il fait toute sa carrière ?', 'Dallas Mavericks', 'Houston Rockets', 'San Antonio Spurs', 'Milwaukee Bucks', 'Champion en 2011, 21 saisons au même club.'],
  ['nba', 'Avec quelle franchise Larry Bird a-t-il fait toute sa carrière ?', 'Boston Celtics', 'Indiana Pacers', 'Los Angeles Lakers', 'New York Knicks', 'Trois titres dans les années 1980, face aux Lakers de Magic Johnson.'],
  ['nba', 'Comment appelait-on l’équipe des États-Unis aux JO de Barcelone 1992 ?', 'La Dream Team', 'La Golden Team', 'La Redeem Team', 'Le Showtime', 'Jordan, Magic, Bird… la première équipe olympique avec des joueurs NBA.'],

  // ----- Basket : France, Europe et règles -----
  ['basket', 'Qui a inventé le basket, en 1891 ?', 'James Naismith', 'William Morgan', 'Walter Camp', 'Pierre de Coubertin', 'Un professeur d’éducation physique, aux États-Unis.'],
  ['basket', 'À quelle hauteur se trouve le panier ?', '3,05 m', '2,90 m', '3,20 m', '3,50 m', 'Dix pieds, la même hauteur depuis l’invention du jeu.'],
  ['basket', 'Combien de joueurs par équipe sont sur le terrain ?', '5', '6', '7', '4', 'Et 3 contre 3 dans la version olympique « 3x3 ».'],
  ['basket', 'Contre quelle équipe la France a-t-elle perdu la finale olympique de basket en 2024 ?', 'États-Unis', 'Serbie', 'Allemagne', 'Canada', 'À Paris, à Bercy, après une deuxième médaille d’argent de suite.'],
  ['basket', 'En quelle année l’équipe de France masculine a-t-elle été championne d’Europe pour la première fois ?', '2013', '2011', '2015', '2005', 'En Slovénie, avec Tony Parker.'],
  ['basket', 'Quel a été le premier club français vainqueur de la Coupe d’Europe des clubs champions de basket, en 1993 ?', 'Limoges CSP', 'ASVEL', 'Pau-Orthez', 'Nanterre', 'Une victoire contre Trévise en finale, à Athènes.'],
  ['basket', 'Quel club compte le plus de titres de champion de France de basket ?', 'ASVEL', 'Limoges CSP', 'Pau-Orthez', 'AS Monaco', 'Le club de Lyon-Villeurbanne.'],
  ['basket', 'Quel club a gagné le plus d’Euroligues ?', 'Real Madrid', 'CSKA Moscou', 'Panathinaïkos', 'Maccabi Tel-Aviv', 'La section basket du Real est aussi la plus titrée d’Europe.'],
  ['basket', 'Combien vaut un panier marqué derrière la ligne à 3 points ?', '3 points', '2 points', '4 points', '1 point', 'Un lancer franc vaut 1 point.'],

  // ----- Handball -----
  ['hand', 'Combien de joueurs par équipe sur le terrain au handball ?', '7', '6', '5', '8', 'Six joueurs de champ et un gardien.'],
  ['hand', 'Combien de temps dure un match de handball ?', '2 x 30 minutes', '2 x 25 minutes', '2 x 35 minutes', '4 x 15 minutes', 'Une heure de jeu effectif.'],
  ['hand', 'À combien de mètres du but se tire un jet de 7 mètres ?', '7 m', '6 m', '9 m', '5 m', 'Le penalty du handball.'],
  ['hand', 'Comment s’appelle la ligne qui entoure la zone du gardien ?', 'La ligne des 6 mètres', 'La ligne des 9 mètres', 'La ligne médiane', 'La ligne de fond', 'Seul le gardien peut s’y tenir. Les 9 m, en pointillés, servent aux jets francs.'],
  ['hand', 'Combien de pas un joueur peut-il faire ballon en main ?', '3', '2', '4', '5', 'Et il ne peut garder le ballon que 3 secondes sans jouer.'],
  ['hand', 'Combien de temps dure une exclusion temporaire ?', '2 minutes', '1 minute', '5 minutes', '10 minutes', 'L’équipe joue alors en infériorité numérique.'],
  ['hand', 'Comment surnommait-on l’équipe de France championne du monde en 1995 ?', 'Les Barjots', 'Les Experts', 'Les Costauds', 'Les Bronzés', 'Les Bronzés : médaillés de bronze en 1992. Les Costauds : champions du monde 2001. Les Experts : depuis 2009.'],
  ['hand', 'Combien de titres olympiques l’équipe de France masculine de handball a-t-elle gagnés ?', '3', '2', '4', '1', 'Pékin 2008, Londres 2012 et Tokyo 2021.'],
  ['hand', 'Quel Français a été élu trois fois meilleur handballeur du monde ?', 'Nikola Karabatić', 'Thierry Omeyer', 'Daniel Narcisse', 'Jackson Richardson', 'En 2007, 2014 et 2016.'],
  ['hand', 'Quel Français a été le premier élu meilleur handballeur du monde, en 1995 ?', 'Jackson Richardson', 'Nikola Karabatić', 'Jérôme Fernandez', 'Thierry Omeyer', 'Le meneur réunionnais des Barjots.'],
  ['hand', 'À quel poste jouait Thierry Omeyer ?', 'Gardien', 'Pivot', 'Ailier', 'Demi-centre', 'Un des meilleurs gardiens de l’histoire.'],
  ['hand', 'Lors de quels Jeux olympiques les handballeuses françaises ont-elles gagné l’or pour la première fois ?', 'Tokyo 2021', 'Rio 2016', 'Londres 2012', 'Paris 2024', 'À Paris en 2024, elles ont pris l’argent.'],
  ['hand', 'Quel club français a gagné la Ligue des champions de handball en 2003 et en 2018 ?', 'Montpellier', 'Paris Saint-Germain', 'Chambéry', 'Nantes', 'En 2018, Montpellier bat Nantes en finale.'],
  ['hand', 'Quel pays a été champion du monde masculin en 2019, 2021 et 2023 ?', 'Danemark', 'France', 'Suède', 'Espagne', 'Une série menée par Mikkel Hansen puis Mathias Gidsel.'],
  ['hand', 'Dans quel pays joue le célèbre club du THW Kiel ?', 'Allemagne', 'Danemark', 'Suède', 'Norvège', 'Le club le plus titré de la Bundesliga de handball.'],
  ['hand', 'Quel pays a organisé et gagné le championnat du monde masculin 2017 ?', 'France', 'Allemagne', 'Danemark', 'Croatie', 'Finale gagnée contre la Norvège à Paris.'],
  ['hand', 'Que mettent les handballeurs sur leurs mains pour mieux tenir le ballon ?', 'De la résine', 'Du talc', 'De la cire', 'De l’huile', 'On l’appelle aussi « colle ».'],

  // ----- Volley-ball -----
  ['volley', 'Combien de joueurs par équipe sur le terrain au volley-ball ?', '6', '5', '7', '4', 'Ils tournent d’une position à chaque récupération du service.'],
  ['volley', 'En combien de points se gagne un set (hors 5e set) ?', '25', '21', '15', '30', 'Avec deux points d’écart ; le 5e set se joue en 15.'],
  ['volley', 'Combien de touches de balle une équipe a-t-elle au maximum avant de renvoyer ?', '3', '2', '4', '5', 'Le contre ne compte pas comme une touche.'],
  ['volley', 'Quel joueur porte un maillot d’une couleur différente ?', 'Le libéro', 'Le passeur', 'Le pointu', 'Le central', 'Spécialiste de la défense, il ne peut ni attaquer au-dessus du filet ni servir en compétition internationale.'],
  ['volley', 'À quelle hauteur est le filet en volley masculin ?', '2,43 m', '2,24 m', '2,55 m', '2,35 m', '2,24 m chez les femmes.'],
  ['volley', 'Combien de titres olympiques l’équipe de France masculine de volley a-t-elle gagnés ?', '2', '1', '3', '0', 'Tokyo 2021 et Paris 2024.'],
  ['volley', 'Quel Français a été élu meilleur joueur du tournoi olympique de Tokyo 2021 ?', 'Earvin Ngapeth', 'Jenia Grebennikov', 'Benjamin Toniutti', 'Trévor Clevenot', 'Fils d’Éric Ngapeth, ancien international.'],
  ['volley', 'À quel poste joue Jenia Grebennikov en équipe de France ?', 'Libéro', 'Passeur', 'Central', 'Pointu', 'Considéré comme l’un des meilleurs libéros du monde.'],
  ['volley', 'Combien de joueurs par équipe au beach-volley ?', '2', '3', '4', '6', 'Sur un terrain de sable plus petit.'],
  ['volley', 'Quelles sont les dimensions d’un terrain de volley ?', '18 m x 9 m', '20 m x 10 m', '16 m x 8 m', '24 m x 12 m', 'Deux carrés de 9 m de côté.'],
  ['volley', 'Quel pays a été champion du monde masculin en 2014 et en 2018 ?', 'Pologne', 'Brésil', 'Italie', 'Russie', 'L’Italie succède à la Pologne en 2022.'],
  ['volley', 'Dans quel pays le volley-ball a-t-il été inventé, en 1895 ?', 'États-Unis', 'Brésil', 'Japon', 'France', 'Par William G. Morgan, dans le Massachusetts.'],
  ['volley', 'Quel joueur fait la deuxième touche pour préparer l’attaque ?', 'Le passeur', 'Le libéro', 'Le réceptionneur', 'Le central', 'Le « meneur de jeu » du volley.'],

  // ----- Hockey sur glace -----
  ['hockey', 'Combien de joueurs par équipe sur la glace au hockey ?', '6', '5', '7', '11', 'Cinq joueurs et un gardien.'],
  ['hockey', 'Combien de périodes compte un match de hockey sur glace ?', '3', '2', '4', '5', 'Trois périodes de 20 minutes.'],
  ['hockey', 'Comment s’appelle l’objet que les joueurs se disputent ?', 'Le palet', 'La balle', 'La rondelle de bois', 'Le volant', 'En caoutchouc ; les Québécois disent « la rondelle ».'],
  ['hockey', 'Combien de temps dure une pénalité mineure ?', '2 minutes', '1 minute', '5 minutes', '10 minutes', 'Le joueur va au banc des pénalités, son équipe joue en infériorité.'],
  ['hockey', 'Quel trophée récompense le champion de la NHL ?', 'La Coupe Stanley', 'Le Trophée Hart', 'La Coupe Spengler', 'La Coupe Magnus', 'Le plus vieux trophée du sport professionnel nord-américain.'],
  ['hockey', 'Quelle équipe a gagné le plus de Coupes Stanley ?', 'Canadiens de Montréal', 'Maple Leafs de Toronto', 'Red Wings de Détroit', 'Bruins de Boston', 'Plus de vingt titres pour le « Tricolore ».'],
  ['hockey', 'Quel joueur canadien était surnommé « The Great One » ?', 'Wayne Gretzky', 'Mario Lemieux', 'Sidney Crosby', 'Gordie Howe', 'Il détient encore de nombreux records de la NHL.'],
  ['hockey', 'Quel est le surnom de l’équipe de hockey de Rouen ?', 'Les Dragons', 'Les Brûleurs de loups', 'Les Gothiques', 'Les Ducs', 'Les Brûleurs de loups, c’est Grenoble ; les Gothiques, Amiens ; les Ducs, Angers.'],
  ['hockey', 'Quel est le surnom de l’équipe de hockey de Caen ?', 'Les Drakkars', 'Les Dragons', 'Les Rapaces', 'Les Pingouins', 'Un club normand, comme les Dragons de Rouen.'],
  ['hockey', 'Comment s’appelle le championnat de France élite de hockey sur glace ?', 'La Ligue Magnus', 'La Pro A', 'La Starligue', 'Le Top 14', 'La Starligue, c’est le handball ; le Top 14, le rugby.'],
  ['hockey', 'Quel pays a gagné le plus de titres olympiques en hockey masculin ?', 'Canada', 'Suède', 'États-Unis', 'Finlande', 'Neuf médailles d’or.'],
  ['hockey', 'En 1980, quel pays bat l’URSS lors du « Miracle sur glace » ?', 'États-Unis', 'Canada', 'Suède', 'Tchécoslovaquie', 'Aux JO de Lake Placid, une équipe d’étudiants bat les Soviétiques.'],
  ['hockey', 'Quel gardien français a été le premier à gagner la Coupe Stanley, en 2010 ?', 'Cristobal Huet', 'Florian Hardy', 'Fabrice Lhenry', 'Henri-Corentin Buysse', 'Avec les Blackhawks de Chicago.'],
  ['hockey', 'Comment s’appelle la remise en jeu entre deux joueurs face à face ?', 'La mise au jeu', 'L’entre-deux', 'La touche', 'Le bully', 'L’arbitre lâche le palet entre les deux crosses.']
];
