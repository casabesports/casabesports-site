/*
 * Casa Besports — l'essentiel des règlements, affiché par le bouton « Règlement » de la réalité augmentée.
 * Résumés grand public des règles internationales. En compétition amateur, les règlements des ligues et
 * districts peuvent adapter certains points (durée, remplacements, catégories d'âge) : le lien en bas de chaque
 * fiche mène à la fédération française. Modifiez librement les textes ci-dessous.
 *   cles     : petites cases [titre, valeur]
 *   sections : { titre, points: [ … ] }
 */
window.CASA_REGLEMENTS = {
  football: {
    titre: 'Football', intro: 'Deux équipes de onze tentent de mettre le ballon dans le but adverse sans le toucher des mains ni des bras (sauf le gardien, dans sa surface).',
    cles: [['Joueurs', '11 par équipe, dont 1 gardien (7 au minimum)'], ['Durée', '2 × 45 min, pause de 15 min au plus'], ['Terrain', '90 à 120 m × 45 à 90 m'], ['But', '7,32 m × 2,44 m'], ['Ballon', 'Taille 5 : 68 à 70 cm de tour, 410 à 450 g']],
    sections: [
      { titre: 'Marquer et gagner', points: ['Un but est marqué quand le ballon franchit entièrement la ligne de but, entre les poteaux et sous la barre.', 'L’équipe qui marque le plus de buts gagne. En coupe, prolongation (2 × 15 min) puis tirs au but si nécessaire.'] },
      { titre: 'Hors-jeu', points: ['Un attaquant est hors-jeu s’il est plus près de la ligne de but adverse que le ballon et que l’avant-dernier défenseur au moment où un coéquipier lui passe le ballon, et qu’il participe à l’action.', 'Pas de hors-jeu sur une rentrée de touche, un coup de pied de but ou un corner, ni dans sa propre moitié de terrain.'] },
      { titre: 'Fautes et sanctions', points: ['Faute (bousculer, tacler dangereusement, tenir, toucher le ballon de la main) : coup franc direct, ou penalty à 11 m si elle a lieu dans la surface de réparation.', 'Carton jaune : avertissement. Deux jaunes ou un rouge direct : exclusion, sans remplacement possible.', 'Le gardien ne peut pas prendre à la main une passe volontaire du pied d’un coéquipier.'] },
      { titre: 'Reprises du jeu', points: ['Touche à deux mains, les deux pieds au sol. Corner quand un défenseur sort le ballon derrière sa ligne de but. Coup de pied de but quand c’est un attaquant.', 'Remplacements : leur nombre est fixé par le règlement de la compétition.'] }
    ],
    source: { texte: 'D’après les Lois du jeu de l’IFAB, appliquées par la FFF.', url: 'https://www.fff.fr', lien: 'Fédération française de football' }
  },
  rugby: {
    titre: 'Rugby à XV', intro: 'On avance en portant ou en tapant le ballon ovale, mais on ne peut le passer à la main que vers l’arrière.',
    cles: [['Joueurs', '15 par équipe : 8 avants, 7 arrières'], ['Durée', '2 × 40 min'], ['Terrain', 'jusqu’à 100 m entre les lignes d’essai × 70 m, plus les en-buts'], ['Poteaux', '5,60 m d’écart, barre à 3 m'], ['Ballon', 'Ovale taille 5, 410 à 460 g']],
    sections: [
      { titre: 'Les points', points: ['Essai : 5 points (ballon aplati dans l’en-but adverse).', 'Transformation après l’essai : 2 points.', 'Pénalité ou drop (coup de pied tombé en jeu) : 3 points.', 'Essai de pénalité : 7 points, accordé quand une faute adverse empêche un essai probable.'] },
      { titre: 'Les règles de base', points: ['Passe à la main uniquement vers l’arrière ou à plat. Un ballon lâché vers l’avant est un « en-avant ».', 'Plaquage sous la ligne des épaules seulement. Le joueur plaqué doit lâcher le ballon, le plaqueur doit le relâcher.', 'Hors-jeu : un joueur devant le porteur du ballon ne peut pas participer au jeu tant qu’il n’a pas été replacé.'] },
      { titre: 'Les phases arrêtées', points: ['Mêlée : 8 avants de chaque côté, après un en-avant ou une passe en avant.', 'Touche : le ballon sorti est relancé entre deux alignements de joueurs.', 'Carton jaune : 10 minutes hors du terrain. Carton rouge : exclusion.'] }
    ],
    source: { texte: 'D’après les règles du jeu de World Rugby, appliquées par la FFR.', url: 'https://www.ffr.fr', lien: 'Fédération française de rugby' }
  },
  basket: {
    titre: 'Basketball', intro: 'Deux équipes de cinq marquent en lançant le ballon dans le panier adverse, placé à 3,05 m du sol.',
    cles: [['Joueurs', '5 sur le terrain, jusqu’à 12 sur la feuille'], ['Durée', '4 × 10 min (temps arrêté)'], ['Terrain', '28 m × 15 m'], ['Panier', 'Anneau de 45 cm à 3,05 m'], ['Ballon', 'Taille 7 (hommes), taille 6 (femmes)']],
    sections: [
      { titre: 'Les points', points: ['Panier à 2 points, ou à 3 points s’il est tiré derrière la ligne à 6,75 m.', 'Lancer franc : 1 point, tiré depuis la ligne située à 4,60 m du panneau, après certaines fautes.', 'En cas d’égalité : prolongations de 5 minutes.'] },
      { titre: 'Les limites de temps', points: ['24 secondes pour tenter un tir.', '8 secondes pour passer la ligne médiane.', '3 secondes au plus dans la raquette adverse pour un attaquant.'] },
      { titre: 'Les violations et fautes', points: ['Marcher : faire plus de deux appuis en tenant le ballon. Reprise de dribble interdite.', 'Faute personnelle pour un contact illégal. À 5 fautes, le joueur sort définitivement.', 'Au-delà de 4 fautes d’équipe dans un quart-temps, chaque faute défensive donne des lancers francs.'] }
    ],
    source: { texte: 'D’après le règlement officiel de la FIBA, appliqué par la FFBB.', url: 'https://www.ffbb.com', lien: 'Fédération française de basketball' }
  },
  hand: {
    titre: 'Handball', intro: 'Sept contre sept, on se passe le ballon à la main pour tirer dans un but de 3 m sur 2 m, sans entrer dans la zone du gardien.',
    cles: [['Joueurs', '7 par équipe dont 1 gardien'], ['Durée', '2 × 30 min'], ['Terrain', '40 m × 20 m'], ['But', '3 m × 2 m'], ['Ballon', 'Taille 3 (hommes), taille 2 (femmes)']],
    sections: [
      { titre: 'Jouer le ballon', points: ['3 pas au plus avec le ballon en main, et 3 secondes au plus sans le jouer.', 'On peut dribbler, mais pas reprendre un dribble après avoir tenu le ballon.', 'Interdit de toucher le ballon avec la jambe sous le genou (sauf le gardien dans sa zone).'] },
      { titre: 'La zone de 6 m', points: ['Seul le gardien peut s’y trouver. Les tireurs peuvent sauter au-dessus, à condition d’avoir décollé avant la ligne.', 'Un défenseur qui entre dans sa zone pour défendre provoque un jet de 7 m.'] },
      { titre: 'Sanctions', points: ['Jet de 7 m quand une faute empêche une occasion nette de but.', 'Avertissement, puis exclusion temporaire de 2 minutes, puis disqualification (carton rouge).', 'Jeu passif : l’arbitre lève le bras quand une équipe ne cherche plus à attaquer.'] }
    ],
    source: { texte: 'D’après les règles de jeu de l’IHF, appliquées par la FFHandball.', url: 'https://www.ffhandball.fr', lien: 'Fédération française de handball' }
  },
  volley: {
    titre: 'Volley-ball', intro: 'Deux équipes de six, séparées par un filet, font tomber le ballon dans le camp adverse en trois touches au plus.',
    cles: [['Joueurs', '6 par équipe, dont 1 ou 2 libéros possibles'], ['Match', '3 sets gagnants'], ['Terrain', '18 m × 9 m'], ['Filet', '2,43 m (hommes), 2,24 m (femmes)'], ['Ballon', '65 à 67 cm de tour, 260 à 280 g']],
    sections: [
      { titre: 'Compter les points', points: ['Chaque échange donne un point. Un set se gagne à 25 points avec 2 points d’écart.', 'Le 5e set (décisif) se joue en 15 points, toujours avec 2 points d’écart.'] },
      { titre: 'Les touches', points: ['3 touches au plus par équipe avant de renvoyer (le contre ne compte pas).', 'Un même joueur ne peut pas toucher deux fois de suite le ballon (sauf après un contre).', 'Interdit de toucher le filet en jouant le ballon ou de passer sous le filet en gênant l’adversaire.'] },
      { titre: 'Rotation et libéro', points: ['À chaque reprise de service gagnée, l’équipe tourne d’une place dans le sens des aiguilles d’une montre.', 'Les joueurs arrière ne peuvent pas attaquer au-dessus du filet depuis la zone avant (3 m).', 'Le libéro, maillot différent, joue en défense : il ne peut ni contrer, ni attaquer un ballon au-dessus du filet.'] }
    ],
    source: { texte: 'D’après les règles officielles de la FIVB, appliquées par la FFVolley.', url: 'https://www.ffvolley.org', lien: 'Fédération française de volley' }
  },
  waterpolo: {
    titre: 'Water-polo', intro: 'Sept contre sept dans un bassin profond : on nage, on se passe le ballon d’une main et on tire dans un but flottant.',
    cles: [['Joueurs', '7 par équipe dont 1 gardien'], ['Durée', '4 × 8 min de temps effectif'], ['Bassin', 'jusqu’à 30 m × 20 m'], ['But', '3 m × 0,90 m au-dessus de l’eau'], ['Ballon', 'Taille 5 (hommes), taille 4 (femmes)']],
    sections: [
      { titre: 'Jouer le ballon', points: ['Le ballon se joue d’une seule main (le gardien peut utiliser les deux).', 'Interdit de toucher le fond, de noyer le ballon ou de couler un adversaire qui n’a pas le ballon.', 'La possession est limitée dans le temps : une trentaine de secondes pour tirer.'] },
      { titre: 'Fautes', points: ['Faute ordinaire : coup franc pour l’adversaire.', 'Faute grave : exclusion temporaire d’une vingtaine de secondes, l’équipe joue à six.', 'Faute empêchant un but probable dans la zone des 5 m : penalty tiré à 5 m.', 'Trois fautes graves : exclusion définitive du joueur.'] },
      { titre: 'Repères du bassin', points: ['Bouées rouges : ligne des 2 m, où un attaquant ne peut pas attendre sans le ballon.', 'Bouées jaunes : ligne des 5 m. Bouée blanche : milieu du bassin.'] }
    ],
    source: { texte: 'D’après les règles de World Aquatics, appliquées par la FFN.', url: 'https://www.ffnatation.fr', lien: 'Fédération française de natation' }
  },
  tennis: {
    titre: 'Tennis', intro: 'En simple ou en double, on renvoie la balle au-dessus du filet, après au plus un rebond, dans les limites du court adverse.',
    cles: [['Joueurs', '1 contre 1 (simple) ou 2 contre 2 (double)'], ['Court', '23,77 m × 8,23 m (simple), 10,97 m (double)'], ['Filet', '0,914 m au centre, 1,07 m aux poteaux'], ['Match', '2 ou 3 sets gagnants'], ['Balle', '6,54 à 6,86 cm, 56 à 59,4 g']],
    sections: [
      { titre: 'Compter les points', points: ['Dans un jeu : 15, 30, 40, jeu. À 40-40 (égalité), il faut deux points d’affilée : avantage, puis jeu.', 'Un set se gagne à 6 jeux avec 2 jeux d’écart. À 6-6, jeu décisif en 7 points avec 2 points d’écart.'] },
      { titre: 'Le service', points: ['On sert en diagonale, derrière la ligne de fond, dans le carré de service opposé. Deux essais : deux fautes, le point est perdu.', 'Let : la balle touche le filet et retombe dans le bon carré, le service est rejoué.', 'Le service change de joueur à chaque jeu ; on change de côté après les jeux impairs.'] },
      { titre: 'Bonne ou faute', points: ['Une balle qui touche la ligne est bonne.', 'Perdre le point : laisser rebondir deux fois, envoyer dehors ou dans le filet, toucher le filet pendant l’échange.', 'Sur terre battue, la trace de la balle sert à vérifier.'] }
    ],
    source: { texte: 'D’après les règles de l’ITF, appliquées par la FFT.', url: 'https://www.fft.fr', lien: 'Fédération française de tennis' }
  },
  roller: {
    titre: 'Roller hockey', intro: 'Le hockey sur roues alignées : quatre joueurs et un gardien, une crosse et un palet, sur une piste entourée de bandes.',
    cles: [['Joueurs', '4 joueurs + 1 gardien sur la piste'], ['Durée', '2 périodes, de 15 à 25 min selon le niveau (temps arrêté)'], ['Piste', 'de 40 × 20 m à 60 × 30 m, coins arrondis'], ['Cage', '1,83 m × 1,22 m'], ['Palet', 'En plastique, plus léger que sur glace']],
    sections: [
      { titre: 'Le jeu', points: ['Le palet se joue uniquement avec la crosse ; on peut l’arrêter avec le corps ou les patins.', 'Pas de hors-jeu : on peut attendre une passe partout sur la piste.', 'Les changements se font à la volée, sans arrêt du jeu.'] },
      { titre: 'Contacts et pénalités', points: ['Les mises en échec (charges) sont interdites ; le contact doit rester limité.', 'Accrocher, faire trébucher, cingler ou crosse haute : pénalité de 2 minutes, l’équipe joue en infériorité.', 'Faute grave : pénalité majeure de 5 minutes ou expulsion.'] },
      { titre: 'À ne pas confondre', points: ['Le rink hockey se joue en patins à quatre roues (quads) avec une balle : c’est une autre discipline, avec ses propres règles.'] }
    ],
    source: { texte: 'D’après les règles de World Skate pour le roller in line hockey, appliquées par la FFRS.', url: 'https://ffroller-skateboard.fr', lien: 'Fédération française de roller et skateboard' }
  },
  athle: {
    titre: 'Athlétisme', intro: 'Courir, sauter, lancer : l’athlétisme réunit les courses sur piste, les concours et les épreuves combinées.',
    cles: [['Piste', '400 m, 8 couloirs de 1,22 m'], ['Courses', '100 m à 10 000 m, haies, relais, steeple'], ['Sauts', 'Hauteur, perche, longueur, triple saut'], ['Lancers', 'Poids, disque, javelot, marteau'], ['Poids', '7,26 kg (hommes), 4 kg (femmes)']],
    sections: [
      { titre: 'Les courses', points: ['Départ : « À vos marques », « Prêts », puis le coup de pistolet. Un faux départ entraîne la disqualification.', 'Jusqu’au 400 m, chacun reste dans son couloir. Au 800 m, on rejoint la corde après le premier virage.', 'Le classement se fait quand le torse franchit la ligne d’arrivée.'] },
      { titre: 'Les relais', points: ['4 × 100 m et 4 × 400 m : le témoin se transmet dans une zone de transmission (30 m au 4 × 100 m, 20 m au 4 × 400 m).', 'Un témoin passé hors de la zone, ou tombé et non ramassé par le relayeur, disqualifie l’équipe.'] },
      { titre: 'Les concours', points: ['Lancer du poids : depuis un cercle de 2,135 m, sans en sortir avant que l’engin ne retombe, dans un secteur de 34,92°.', 'Saut en longueur : appel avant la ligne de la planche, mesure jusqu’à la trace la plus proche.', 'Record homologué au 100 m, au 200 m, en haies courtes, en longueur et au triple saut seulement si le vent arrière ne dépasse pas 2 m/s.'] }
    ],
    source: { texte: 'D’après les règles de World Athletics, appliquées par la FFA.', url: 'https://www.athle.fr', lien: 'Fédération française d’athlétisme' }
  }
};
