# Consignes : Résultats et classements (pour Claude)

Mets à jour `contenus/sport.js` (objet `window.CASA_SPORT`, format décrit en tête du fichier) avec les **vraies** données
des équipes du Cotentin et de la Manche, à partir de sources publiques et gratuites. Dépôt : casabesports/casabesports-site.

## Sources (gratuites, publiques)
- Football : https://epreuves.fff.fr (Ligue de Football de Normandie : Régional 1, 2, 3 ; District de la Manche : D1, D2) et les pages clubs de fff.fr.
- Basketball : https://competitions.ffbb.com (Comité de la Manche, Ligue de Normandie : PNM, PNF, PRM).
- Handball : https://www.ffhandball.fr (compétitions Normandie / Manche).
- Rugby : https://competitions.ffr.fr (Ligue de Normandie).
- Volley-ball : https://www.ffvbbeach.org/ffvbapp/resu/ ; Water-polo / natation : https://ffn.extranat.fr.
- En secours : sites officiels des clubs. Pas de sites de paris, pas de données payantes, pas de contournement de connexion.

## Handball : import automatique (à lancer en premier)
- Lance `python3 outils/import_handball.py` (10 à 20 minutes, sources : pages publiques de ffhandball.fr).
  Il lit, dans cet ordre, la Manche, la Ligue de Normandie, le Calvados, l'Orne, l'Eure, la Seine-Maritime,
  puis les championnats nationaux où joue un club normand, et réécrit `contenus/sport-federations.js`
  (`window.CASA_SPORT_AUTO.Handball` : compétitions, classements complets, résultats et matchs à ±14 jours, clubs).
- Ne modifie pas ce fichier à la main et ne recopie pas le handball dans `contenus/sport.js`.
- S'il s'arrête avec un message d'erreur, le fichier n'est pas modifié : signale-le dans le compte rendu.
- `node --check contenus/sport-federations.js` doit passer avant le commit.

## Ce qu'il faut couvrir
- Toutes les compétitions où joue au moins une équipe première (seniors) d'un club listé dans `js/app.js` (`clubs`) ou dans `CASA_SPORT.clubs`.
- Pour chacune : classement complet (`tables[idComp]`), derniers résultats (14 jours) et prochains matchs (14 jours) dans `matches`.
- Ajoute la compétition dans `comps[Discipline]` avec un id court stable (ex. `r2-normandie-b`, `d1-manche`, `pnm-manche`) et un libellé lisible.
- Relie les équipes à leur fiche club via `teamClub` (nom affiché → id club). Nouveau club du Cotentin trouvé → ajoute-le dans `clubs`.
- Ids de match stables : `<idComp>-<AAAA-MM-JJ>-<dom>-<ext>` en minuscules sans accents.
- Renseigne `source` (URL de la page lue) sur chaque match, `sources` (liste des URL utilisées) et `maj` (date ISO actuelle).

## Règles
- **Aucune donnée inventée ni estimée.** Une source inaccessible → garde les données existantes de cette compétition telles quelles.
- Retire les matchs « up » passés depuis plus de 2 jours sans score connu.
- `node --check contenus/sport.js` doit passer.
- Rien de changé → pas de commit. Sinon commit sur `main` « Résultats et classements : <date> » puis `git push origin main`.
- Compte rendu final court en français : compétitions mises à jour, sources inaccessibles.
