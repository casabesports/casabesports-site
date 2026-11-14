# La rubrique Joueurs : d'où viennent les profils

La rubrique Joueurs mélange deux sortes de profils.

## 1. Les joueurs des clubs pros et nationaux de Normandie (automatique)

Ils viennent uniquement de sources **libres et gratuites** :

| Source | Ce qu'on y prend |
| --- | --- |
| Wikipédia (fr) | la liste de l'effectif actuel, dans la section « Effectif » de la page du club |
| Wikidata | la vérification que la personne est bien liée à ce club, le poste, le numéro, et si elle est née en Normandie |
| Wikimedia Commons | la photo, **seulement** si sa licence permet la réutilisation (CC0, domaine public, CC BY, CC BY-SA) |

Sur chaque fiche, le site affiche l'auteur et la licence de la photo (c'est une obligation de ces licences) et un lien vers les sources, avec la date de vérification.

Mise à jour : `python3 outils/import_joueurs_libres.py` (de 20 minutes à plus d'une heure : l'outil fait des pauses pour respecter les limites de Wikipédia). Il réécrit `contenus/joueurs-libres.js`. Les photos sont affichées directement depuis Wikimedia (vignette de 500 px, ce que Wikimedia autorise avec le crédit). Avec `--telecharger`, l'outil en garde aussi une copie recadrée dans `assets/joueurs-libres/`.

Filtres appliqués pour ne rien inventer : seules les personnes citées dans l'effectif actuel de Wikipédia **et** connues de Wikidata comme sportifs sont gardées ; sont écartés l'entraîneur du club, les personnes nées avant 1980, celles dont le passage au club est noté terminé, les entraîneurs qui n'y ont pas de contrat de joueur, et les sections d'effectif d'une saison passée. Wikidata n'étant pas toujours à jour, certains joueurs actuels manquent : ils s'ajoutent à la main dans l'admin.

Il est conseillé de relancer l'outil au début de chaque mercato (juillet et janvier).

Les clubs suivis sont listés en haut de l'outil (`CLUBS`). Pour en ajouter un, il faut son identifiant Wikidata (Q…) et une page Wikipédia avec une section « Effectif ».

Masquer un joueur (erreur, départ, demande de l'intéressé) : **Admin › Contenus › Joueurs**, ajoutez un joueur avec le **même identifiant** (par exemple `wd-q12345`, visible dans l'adresse de sa fiche) et cochez « Masquer ce joueur sur le site ». Pour corriger sa fiche, même principe sans cocher la case : la version de l'admin remplace celle de l'outil.

## 2. Les joueurs amateurs, les entraîneurs et les arbitres (avec accord)

Ils ne sont **jamais** collectés automatiquement :

- les sites des fédérations (FFF, FFBB) refusent l'accès automatique, et leurs données ne sont pas libres ;
- Transfermarkt et les sites des clubs interdisent l'extraction dans leurs conditions d'utilisation ;
- les photos trouvées sur internet appartiennent à leurs auteurs (droit d'auteur) et aux personnes photographiées (droit à l'image) ;
- beaucoup de joueurs amateurs sont mineurs, et le RGPD impose leur accord (ou celui des parents avant 15 ans) pour publier leur nom et leur photo.

À la place, le bouton **« Je suis joueur : ma fiche »** (page Joueurs) ouvre un formulaire : nom, discipline, club, poste, photo, et des cases d'accord (âge ou accord parental, publication, droits sur la photo). La demande arrive dans **Admin › Messagerie** avec le texte « FICHE JOUEUR ». Vous l'ajoutez ensuite vous-même dans **Admin › Contenus › Joueurs**. Un club peut aussi envoyer son effectif complet par ce biais, avec l'accord de ses joueurs.

Gardez les messages d'accord : ils prouvent le consentement si on vous le demande. Si un joueur demande à être retiré, supprimez sa fiche dans l'admin.
