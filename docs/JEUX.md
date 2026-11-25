# Les jeux de l'application (rubrique « Jeux »)

Adresse : `#/jeux` (menu ☰ › Au quotidien › Jeux, et page L'application).

## 1. Le quiz du bus

Culture sport internationale, pensée pour les trajets en bus entre coéquipiers.

- **Les sports** : football, basket (NBA, France et Europe), handball, volley-ball, hockey sur glace. Un sport, ou « Tous les sports ». Pour le foot, des thèmes : Coupe du monde, Euro, Ligue des champions, France, Angleterre, Espagne, Italie, Allemagne, Amérique du Sud, Afrique, reste de l'Europe, légendes et records.
- **Deux façons de jouer** :
  - **Un téléphone** : on ajoute les prénoms (jusqu'à 10) et on se passe le téléphone, chacun son tour (« Au tour de Lucas »). 3, 5 ou 10 questions par joueur. **Marche sans réseau** une fois l'appli ouverte une première fois.
  - **Chacun son téléphone** : une personne crée la partie (5, 10 ou 15 questions) et obtient un **code à 4 lettres**. Les autres tapent ce code. Tout le monde voit la même question en même temps ; la réponse s'affiche quand tout le monde a répondu ou que le chrono est fini. L'organisateur passe à la question suivante. Il faut un peu de réseau.
- **Les points** : 10 par bonne réponse, plus un bonus de rapidité avec le chrono de 20 secondes (jusqu'à 10). Classement final avec podium, partage des scores.
- Les questions déjà vues sur le téléphone repassent en dernier, pour varier d'un trajet à l'autre.
- **La discipline de chaque question s'affiche en grand** au-dessus de la question (⚽ Football, 🏀 Basket, 🤾 Handball, 🏐 Volley-ball, 🏒 Hockey), avec sa couleur. Pour vos propres questions (admin), remplissez le champ « sport » ; vide = « Culture sport ».

### Le jeu « chacun son téléphone » : comment ça marche

Il passe par les canaux temps réel de Supabase (déjà branché pour les comptes). **Aucun réglage ni SQL n'est nécessaire**, et rien n'est enregistré en ligne : les messages passent d'un téléphone à l'autre, puis disparaissent. Si Supabase a un jour l'option « Realtime › autoriser seulement les canaux privés » activée, il faudra la désactiver pour ce jeu.

### Ajouter des questions

- Le plus simple : **Admin › Contenus du site › Jeux : questions du quiz** (une bonne réponse, trois mauvaises, une explication). Elles forment le thème « Questions de la rédaction ».
- La banque principale est dans `contenus/quiz-sports.js` (une ligne par question, le thème donne le sport). N'ajoutez que des faits vérifiés et qui ne bougent plus (palmarès passés, records établis), pas des effectifs ou des entraîneurs actuels.

## 2. Devine le joueur

Un joueur du site par jour, à retrouver en 6 essais ; un indice de plus à chaque erreur (discipline, poste, ville, numéro, club, initiales). 6 points au premier essai, 1 au sixième.

## 3. Mes cartes : les points des jeux débloquent les cartes joueurs

Les points gagnés aux jeux vont dans une cagnotte, onglet **Mes cartes** :

- Quiz du bus : les points de la partie (10 à 20 par bonne réponse). En solo et « chacun son téléphone », c'est automatique. Sur un téléphone qu'on se passe, la personne à qui appartient le téléphone touche **« C'est moi »** à côté de son prénom en fin de partie (une fois par partie).
- Devine le joueur : 20 points par point du jeu (120 au premier essai).
- **100 points = 1 carte**, au club de votre choix (les clubs suivis en premier). La carte d'un joueur pas encore collé est tirée au hasard et rejoint l'**album du club** (le même que la pochette du jour). L'album du club rappelle aussi qu'on peut gagner des cartes en jouant.
- Limite : 500 points par jour, et une partie ne rapporte qu'une fois.
- Les points et les cartes sont gardés sur le téléphone, pour le compte connecté (comme l'album). Aucun SQL.

Pour changer le prix d'une carte ou la limite du jour : `PRIX_CARTE`, `MAX_JOUR` et `POINTS_DEVINE` dans `js/jeux.js`.

## Où sont les fichiers

- `js/jeux.js` : les jeux.
- `contenus/quiz-sports.js` : la banque de questions, les sports et les thèmes.
- `contenus/quiz.js` : vos questions (aussi modifiables dans l'admin).

Pour tester le jeu à plusieurs sur un seul ordinateur, sans Supabase : ouvrir `…/?jeux=local#/jeux` dans plusieurs onglets.
