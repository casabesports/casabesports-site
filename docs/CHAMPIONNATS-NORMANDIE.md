# Championnats du Cotentin et de Normandie : d'où viennent les résultats

Objectif : la plateforme locale de référence, d'abord le Nord-Cotentin, puis la Manche, puis toute la Normandie,
sans oublier aucun club. Rien n'est inventé : chaque classement et chaque score vient d'une source officielle.

## Ce qui est automatique (gratuit)

| Discipline | Source officielle | Couverture | État |
|---|---|---|---|
| Handball | ffhandball.fr (pages publiques, autorisées par la fédération) | Manche, Ligue de Normandie, Calvados, Orne, Eure, Seine-Maritime, national (clubs normands) | **Branché** : `outils/import_handball.py` |
| Volley-ball | ffvbbeach.org (résultats FFVolley) | Comités de la Manche (PTLB50) et du Calvados (PTLB14) | **Branché** : `outils/import_volley.py`. Codes de la Ligue et des autres comités normands à trouver (à ajouter dans `COMITES`) |
| Rugby | competitions.ffr.fr / monclubhouse.ffr.fr | Normandie | Le site interdit la lecture automatique des pages clubs (robots.txt) : pages compétitions seulement, à étudier |
| Football | epreuves.fff.fr, District de la Manche | — | **Refus** des accès automatiques (erreur 403), robots.txt de la Ligue de Normandie interdit |
| Tennis de table | monclub.fftt.com (données via l'API de la FFTT) | — | L'API officielle « Smartping » est gratuite mais demande un identifiant à obtenir auprès de la FFTT (demande à faire par Casa Besports) |
| Badminton (interclubs) | icbad.ffbad.org | — | **Interdit** : le robots.txt bloque tous les robots sauf Google et Bing |
| Water-polo | ffn.extranat.fr | — | Page des résultats en travaux (vide) ; la Coupe de la Manche n'y figure pas : saisie dans l'admin |
| Basket | competitions.ffbb.com | — | **Refus** (pare-feu) |

Football : liguesdefoot.fr publie toutes les divisions de la Manche, mais son règlement demande une clé d'accès (gratuite pour un club qui publie ses propres résultats, payante pour un média). Football et basket : la saisie se fait dans Espace admin › Résultats. Pour un import automatique, il faut un accès
officiel : demander au District de la Manche de football et au Comité de la Manche de basket un export ou un flux
(beaucoup de comités le fournissent aux médias locaux).

## Comment ça marche

- La tâche planifiée « Résultats et classements » lance l'import handball, qui réécrit `contenus/sport-federations.js`.
- Le site lit ce fichier en plus de `contenus/sport.js`. Ce qui est saisi dans l'admin reste prioritaire.
- Le Terrain › Handball : filtres **Zone** (Manche d'abord) et **Niveau** (Seniors, Jeunes), puis la compétition.
- Les clubs trouvés dans les classements sont ajoutés à la page Clubs (onglet Handball), sans doublon.
- Les plateaux et tournois des moins de 11/13 ans (sans classement) ne sont pas repris.
- Les forfaits ne sont pas affichés comme des scores.

## Joueurs, staffs, dates de naissance

Les fédérations ne publient pas les dates de naissance, et ce sont des données personnelles (RGPD), encore plus
pour les mineurs. On ne les collecte pas automatiquement. Fiches joueurs et staffs : à remplir dans l'admin avec les
informations données par les clubs ou les joueurs eux-mêmes (accord écrit pour la date de naissance et la photo ;
accord des parents pour un mineur).
