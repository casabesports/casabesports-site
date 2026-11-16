# Les jeux de l'application (rubrique « Jeux »)

Adresse : `#/jeux` (menu ☰ › Vos services › Jeux, page L'application, et bouton « Pronostiquer le score exact » dans Le Terrain › Pronos).

## Les trois jeux

| Jeu | Principe | Points |
|---|---|---|
| **Le Prono du week-end** | Le score exact des matchs des clubs du site et des clubs de la Manche, jusqu’au dimanche qui vient. Fermé au coup d'envoi (à midi si l'horaire n'est pas connu). | 3 pts score exact · 1 pt bon vainqueur ou bon nul |
| **Le Quiz de la Marée** | 5 questions par jour, les mêmes pour tout le monde, une partie par jour. | 1 pt par bonne réponse |
| **Devine le joueur** | Un joueur du site à retrouver ; un indice de plus à chaque erreur (discipline, poste, ville, numéro, club, initiales). | 6 pts au 1er essai … 1 pt au 6e |

Les points du Prono se calculent tout seuls quand le score du match est saisi (Admin › Résultats, ou automatisation « Résultats et classements »).

## D'où viennent les questions du quiz

- Toutes seules, des fiches du site : commune et discipline des clubs, année de fondation et stade (si remplis dans Admin › Clubs), club et poste des joueurs. Rien n'est inventé : une question n'existe que si la réponse est dans une fiche.
- De vos propres questions : **Admin › Contenus du site › Jeux : questions du quiz**. Une bonne réponse, trois mauvaises, une explication. Jusqu'à 2 de vos questions passent chaque jour.

## Le classement commun du Prono (une seule fois)

Sans ce réglage, chacun voit ses propres points (gardés sur son téléphone). Pour le classement entre abonnés :

1. Ouvrez Supabase › **SQL Editor** › **New query**.
2. Collez tout le fichier `supabase/jeux.sql`, puis **Run**. Le message attendu : « Success. No rows returned ».

Ensuite, les pronos des abonnés connectés sont enregistrés en ligne et le classement du mois apparaît dans le jeu.
Sécurité : on ne peut pronostiquer qu'avant le coup d'envoi, on ne voit les pronos des autres qu'après, et seul un pseudo (prénom + initiale) est affiché.

## Où sont les fichiers

- `js/jeux.js` : les trois jeux (règles, tirage du jour, points, classement).
- `contenus/quiz.js` : vos questions de quiz (aussi modifiables dans l'admin).
- `supabase/jeux.sql` : la table du classement.
