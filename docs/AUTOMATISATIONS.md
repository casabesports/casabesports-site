# Automatisations Casa Besports

Deux tâches planifiées font tourner Claude chaque jour sur ce dépôt. Elles se gèrent sur claude.ai,
rubrique **Code › Scheduled tasks** (ou « Tâches planifiées ») : vous pouvez les **mettre en pause, les relancer,
changer l'heure ou les lancer tout de suite** (« Run now »).

| Tâche | Quand | Ce qu'elle fait | Consignes (modifiables) |
|---|---|---|---|
| Rédaction quotidienne | chaque jour vers 6 h 45 | transforme vos photos + notes déposées dans `redaction/a-traiter/` en articles publiés ; le dimanche, compose « Le magazine de la semaine » | `automatisations/redaction-quotidienne.md` |
| Résultats et classements | chaque jour vers 7 h 15 et 22 h 15 | récupère classements, résultats et calendriers sur les sites officiels gratuits (FFF, FFBB, FFHB, FFR…) | `automatisations/resultats-classements.md` |

- Pour changer le comportement (ton, longueur, disciplines…), modifiez simplement le fichier de consignes sur GitHub.
- S'il n'y a rien à faire (aucun sujet déposé), la tâche s'arrête sans rien modifier.
- Chaque publication est un commit GitHub : un article raté se retire en supprimant son bloc dans `contenus/articles.js`.

## Déposer un sujet
Voir `redaction/a-traiter/LISEZMOI.md`.

## Ce qui se met à jour tout seul (vérifié le 2026-11-22)

| Contenu | Fréquence | Comment |
|---|---|---|
| Handball : classements, résultats, matchs à ±14 jours (Manche, Normandie, 4 autres comités, national) | 7 h 15 et 22 h 15 | tâche « Résultats et classements », `outils/import_handball.py` |
| Handball : calendrier complet de la saison (seniors) | chaque matin | même tâche, `--calendrier` → `contenus/calendriers/` |
| Volley : comités Manche et Calvados + Élite, N2, N3 (clubs normands), calendriers complets | 7 h 15 et 22 h 15 | `outils/import_volley.py` |
| Football N1 (US Avranches) | 7 h 15 et 22 h 15 | lu sur le site du club par la tâche |
| Effectifs des clubs pros normands (Wikipédia) | le lundi matin | `outils/import_joueurs_libres.py` |
| Météo du Terrain (4 villes) | toutes les 10 minutes | en direct dans le navigateur |
| Football, basket, rugby (départemental → national) | à la main | les fédérations bloquent les robots : Espace admin › Résultats › « Importer un calendrier » (copier-coller de la page officielle, .ics ou .csv) |

L'onglet Résultats de l'admin affiche la date de la dernière mise à jour de chaque source, en rouge au-delà de 2 jours.
