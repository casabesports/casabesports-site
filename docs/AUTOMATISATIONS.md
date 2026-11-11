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
