/*
 * Casa Besports — les lieux du territoire.
 * Utilisés pour l'arrière-plan « Lieux de légende », la vignette « Lieu » en bas à gauche et la Culture.
 * Gardez, modifiez, supprimez ou ajoutez des lieux : chaque lieu est un bloc { … }.
 *   id     : identifiant court unique (sans espace)       name / short : nom complet / court
 *   where  : commune                                         year : date clé affichée
 *   img    : illustration (dossier assets/)                  hook, desc, moment : textes
 *   photo  : VOTRE VRAIE PHOTO (ex. 'assets/lieux/rade.jpg') : remplace l'illustration dès qu'elle est renseignée
 *            (ou envoyez-la depuis l'espace administrateur › Lieux)
 */
window.CASA_LIEUX = [
      { id: 'rade', name: 'La rade de Cherbourg', short: 'Rade de Cherbourg', where: 'Cherbourg-en-Cotentin', year: '1786', img: 'assets/lieu_rade.svg',
        hook: 'La plus grande rade artificielle du monde, sous la Montagne du Roule.',
        desc: 'Protégée par de longues digues bâties de la fin du XVIIIe siècle au XIXe siècle, la rade de Cherbourg est présentée comme la plus grande rade artificielle du monde. Au-dessus de la ville, la Montagne du Roule et son fort dominent le port.',
        moment: 'En juin 1786, Louis XVI se rend à Cherbourg pour assister à l’immersion de l’un des immenses cônes de bois destinés à bâtir la digue. Plus tard, en juin 1944, la prise du fort du Roule précède la libération de la ville, le 26 juin ; le fort abrite aujourd’hui le musée de la Libération.',
        sport: 'Voile, aviron et nage en eau libre font de la rade un stade nautique à ciel ouvert.' },
      { id: 'gatteville', name: 'Le phare de Gatteville', short: 'Phare de Gatteville', where: 'Gatteville-le-Phare · pointe de Barfleur', year: '1120', img: 'assets/lieu_gatteville.svg',
        hook: '75 mètres de lumière, deuxième plus haut phare de France.',
        desc: 'Allumé en 1835 à la pointe de Barfleur, le phare de Gatteville culmine à 75 mètres : c’est le deuxième plus haut phare de France. Il veille sur l’un des passages les plus dangereux de la Manche.',
        moment: 'Le 25 novembre 1120, au large de Barfleur, la Blanche-Nef heurte un rocher et sombre. Guillaume Adelin, unique fils légitime du roi d’Angleterre Henri Ier, périt dans le naufrage, ouvrant une longue crise de succession.',
        sport: 'Les sentiers côtiers du Val de Saire sont un terrain de jeu prisé des traileurs.' },
      { id: 'jobourg', name: 'Le Nez de Jobourg', short: 'Nez de Jobourg', where: 'La Hague', year: '1977', img: 'assets/lieu_jobourg.svg',
        hook: 'Des falaises parmi les plus hautes d’Europe, face au raz Blanchard.',
        desc: 'À la pointe de la Hague, les falaises du Nez de Jobourg comptent parmi les plus hautes d’Europe. Le site abrite une réserve ornithologique et offre une vue sur le raz Blanchard, l’un des courants les plus puissants d’Europe.',
        moment: 'Le poète Jacques Prévert passe ses dernières années à Omonville-la-Petite, dans la Hague, où il s’éteint en 1977. Il repose dans le petit cimetière du village.',
        sport: 'Le GR223, sentier des douaniers, fait de la Hague une destination de trail et de randonnée.' },
      { id: 'sme', name: 'Sainte-Mère-Église', short: 'Sainte-Mère-Église', where: 'Centre Cotentin', year: '1944', img: 'assets/lieu_sme.svg',
        hook: 'L’une des premières communes libérées, le 6 juin 1944.',
        desc: 'Bourg du centre Cotentin, Sainte-Mère-Église est mondialement connue pour son rôle lors du Débarquement de Normandie. Son église et son musée Airborne attirent chaque année de nombreux visiteurs.',
        moment: 'Dans la nuit du 5 au 6 juin 1944, des parachutistes américains de la 82e division aéroportée sautent sur la commune, l’une des premières libérées en France. Le parachute du soldat John Steele s’accroche au clocher : un mannequin le rappelle aujourd’hui.',
        sport: 'Les commémorations accueillent chaque année des courses et marches du souvenir.' },
      { id: 'gare', name: 'La Gare maritime transatlantique', short: 'Gare maritime', where: 'Cherbourg-en-Cotentin', year: '1912', img: 'assets/lieu_gare.svg',
        hook: 'Chef-d’œuvre Art déco, aujourd’hui la Cité de la Mer.',
        desc: 'Inaugurée en 1933, la Gare maritime transatlantique de Cherbourg accueillait les passagers des grands paquebots vers l’Amérique. Ce joyau Art déco abrite aujourd’hui la Cité de la Mer.',
        moment: 'Le 10 avril 1912, le Titanic fait escale en rade de Cherbourg, sa dernière escale sur le continent. Les passagers rejoignent le paquebot à bord des transbordeurs Nomadic et Traffic.',
        sport: 'Le port de Cherbourg accueille régulièrement de grandes courses au large.' }
    ];
