# Ma trajectoire : le suivi de l'athlète

**Où ?** Mon espace › bloc « Ma trajectoire », et sur chaque fiche joueur qui n'a pas encore de statistiques (bouton « Ma trajectoire »).
Fichier : `js/trajectoire.js` (chargé seulement quand on l'ouvre).

## Ce que fait l'athlète

- **Mon profil** : nom, discipline (15 au choix : football, basket, hand, volley, rugby, water-polo, hockey, tennis, tennis de table, badminton, judo, natation, athlétisme, course et trail, cyclisme), poste, club, fin de saison, nombre de matchs prévus.
- **Mes matchs** (sports d'équipe et duels) : date, adversaire, score, résultat, minutes et les chiffres propres à sa discipline (buts, rebonds, plaquages, aces…).
- **Mes performances** (natation, athlétisme, course, cyclisme) : chronos ou mesures par épreuve. Les records sont repérés tout seuls.
- **Forme et charge** : bilan du jour (forme, sommeil, douleur) et séances (durée × intensité ressentie).
- **Objectifs** : un chiffre pour la saison, ou un chrono visé.

## Ce que Casa calcule (expliqué à l'écran)

- Indicateurs de la discipline (buts par 90 min, évaluation au basket, % de réussite, % d'arrêts…).
- **Le futur** : projection de fin de saison = total actuel + moyenne par match × matchs restants, et ce qu'il faut faire par match pour atteindre l'objectif. En natation et athlétisme : tendance des chronos et date estimée de l'objectif.
- Indice de forme sur 100 (7 derniers jours) et rapport de charge semaine / habitude. Repères indicatifs, jamais un avis médical.

**Rien n'est inventé** : tout vient de ce que l'athlète saisit.

## Où sont les données

Sur l'appareil, et copiées dans le compte de l'athlète s'il est connecté (visibles de lui seul).
Pour la copie dans le compte, lancer **une fois** `supabase/trajectoire.sql` (Supabase › SQL Editor › New query › coller › Run).
Sans ce script, tout marche quand même, mais les données restent sur l'appareil.

## Afficher des statistiques sur une fiche joueur publique

1. L'athlète appuie sur « Proposer mes chiffres » : un message « STATISTIQUES ATHLÈTE » arrive dans Admin › Messagerie.
2. Vous vérifiez auprès du club (feuilles de match).
3. Admin › Contenus › Joueurs › la fiche › « Statistiques de la saison » (une ligne par chiffre, ex. Buts : 12), la saison, la source et la date.

Sans statistiques vérifiées, la fiche affiche « Pas encore de statistiques vérifiées » (les faux « [—] » ont été retirés).
