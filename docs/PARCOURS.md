# Les Escales du Cotentin (Culture › Parcours sport & patrimoine)

Adresse : Culture, onglet « Parcours sport & patrimoine ». Les parcours se modifient dans `contenus/parcours.js`.

## Le principe

Chaque parcours relie des lieux d'histoire, les **escales**. On le fait en marchant, en courant, en trail, à vélo ou autrement.

| Pour tout le monde | Pour les abonnés BE+ (carnet de bord) |
|---|---|
| Carte (plan IGN), tracé, distance, dénivelé, temps estimé selon la pratique | Un **tampon** par escale atteinte |
| **Suivi en direct** avec le GPS du téléphone : prochaine escale, chrono, distance ; à chaque escale atteinte, son histoire s'affiche | Un **badge** par parcours bouclé (toutes les escales tamponnées) |
| **Télécharger le GPX** pour Strava, Garmin Connect, Komoot, Coros, Suunto | Les **kilomètres cumulés** des sorties |
| Après la sortie : télécharger **sa trace GPX**, l'enregistrer dans « Mon activité » | **Valider avec sa trace** : on dépose le GPX d'une sortie Strava ou Garmin, le site repère les escales traversées et les tamponne |

Le carnet est rangé avec les données personnelles de l'abonné (comme l'agenda et l'activité), sur son appareil.
La position GPS et les fichiers GPX sont lus sur l'appareil : rien n'est envoyé à un serveur.

## Le tracé et la distance

1. **Votre tracé vérifié** : enregistrez le parcours avec Strava ou une montre, exportez-le en GPX, déposez le fichier
   dans `assets/parcours/` et indiquez-le dans le parcours : `gpx: 'assets/parcours/hague.gpx'`. C'est la meilleure option.
2. Sinon, le tracé est **calculé par l'IGN** (service d'itinéraire de la Géoplateforme, gratuit, sans clé, profil piéton),
   avec l'altitude de l'IGN pour le dénivelé. Il peut passer par la route plutôt que par le sentier côtier : le site le dit.
3. Si le service de l'IGN ne répond pas, le site trace des lignes droites entre les escales et l'indique (« ≈ » devant la distance).

Le résultat est gardé dans le navigateur : le calcul n'est refait que si les escales changent.

## Ajouter un parcours

Copiez un bloc `{ … }` dans `contenus/parcours.js`. Pour chaque escale : nom, petite phrase, et la position (`lat`, `lon`).
Les positions actuelles viennent de Wikidata (identifiant Q… en commentaire). `lieu: 'rade'` relie l'escale à un lieu de
`contenus/lieux.js` pour afficher son « moment d'histoire ».

## Et Strava en connexion directe ?

Vérifié le 17 novembre 2026 ([Strava](https://developers.strava.com/docs/getting-started/), [limites](https://developers.strava.com/docs/rate-limits/)) :

- créer une application Strava demande désormais un **abonnement Strava payant** (depuis juin 2026) ;
- une nouvelle application ne relie qu'**1 compte**, puis 10 sans examen ; au-delà, examen par Strava, sans garantie ;
- les données d'un sportif ne peuvent être montrées **qu'à lui-même** (pas de classement public) et ne doivent pas servir à de l'IA ;
- les fils d'activité des clubs ne sont plus accessibles depuis le 1er septembre 2026.

D'où le choix des fichiers GPX : ils marchent avec toutes les applis, sans frais ni limite. Une connexion directe
(validation automatique des tampons à chaque sortie Strava) pourra être ajoutée plus tard si l'usage le justifie.
