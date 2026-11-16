# Les jeux de l'application (rubrique « Jeux »)

Adresse : `#/jeux` (menu ☰ › Vos services › Jeux, et page L'application).

## 1. Le quiz du bus (Quiz foot)

Culture générale du football international, pensée pour les trajets en bus entre coéquipiers.

- **Les joueurs** : on ajoute les prénoms (jusqu'à 10). Sans prénom, on joue en solo.
- **Les thèmes** : Coupe du monde, Euro, Ligue des champions, France, Angleterre, Espagne, Italie, Allemagne, Amérique du Sud, Afrique, reste de l'Europe, légendes et records. Un, plusieurs, ou « Tout mélanger ».
- **La partie** : 3, 5 ou 10 questions par joueur. On se passe le téléphone : « Au tour de Lucas ». Chrono de 20 secondes (désactivable).
- **Les points** : 10 par bonne réponse, plus un bonus de rapidité avec le chrono (jusqu'à 10). Classement final avec podium, partage des scores.
- Les questions déjà vues sur le téléphone repassent en dernier, pour varier d'un trajet à l'autre.
- Tout est dans l'appli : **ça marche sans réseau** une fois l'appli ouverte une première fois.

### Ajouter des questions

- Le plus simple : **Admin › Contenus du site › Jeux : questions du quiz** (une bonne réponse, trois mauvaises, une explication). Elles forment le thème « Questions de la rédaction ».
- La banque principale est dans `contenus/quiz-foot.js` (une ligne par question). N'ajoutez que des faits vérifiés et qui ne bougent plus (palmarès passés, records établis), pas des effectifs ou des entraîneurs actuels.

## 2. Devine le joueur

Un joueur du site par jour, à retrouver en 6 essais ; un indice de plus à chaque erreur (discipline, poste, ville, numéro, club, initiales). 6 points au premier essai, 1 au sixième.

## Où sont les fichiers

- `js/jeux.js` : les jeux.
- `contenus/quiz-foot.js` : la banque de questions et les thèmes.
- `contenus/quiz.js` : vos questions (aussi modifiables dans l'admin).

Aucun réglage Supabase n'est nécessaire : réglages, prénoms et parties restent sur le téléphone.
