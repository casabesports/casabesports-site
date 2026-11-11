# Boîte de dépôt de la rédaction

Déposez ici ce que vous voulez transformer en article. Chaque matin, l'automatisation
« Rédaction quotidienne » écrit et publie un article complet par sujet déposé.

## Comment déposer un sujet (depuis github.com, même sur téléphone)

1. Ouvrez ce dossier `redaction/a-traiter` sur GitHub › **Add file › Upload files**.
2. Glissez **un dossier par sujet** (ex. `2026-11-15-fceh-agneaux`) contenant :
   - vos **photos** (.jpg, .png, .webp) : la première par ordre alphabétique sera l'image principale ;
   - un fichier **`notes.txt`** (ou notes.md) avec ce que vous savez : qui, quoi, où, quand, score,
     citations, contexte, angle souhaité, discipline, clubs concernés, « premium » si réservé aux abonnés.
   Pas de dossier ? Mettez simplement les fichiers avec le même début de nom (`fceh-1.jpg`, `fceh-2.jpg`, `fceh.txt`).
3. **Commit changes**. C'est tout.

## Ce qui se passe ensuite

- L'article est rédigé en français, dans le ton Casa Besports, uniquement à partir de vos notes
  (les faits manquants ne sont jamais inventés : ils sont signalés dans le compte rendu).
- Les photos sont redimensionnées, placées dans `assets/articles/` et intégrées dans l'article.
- L'article apparaît en tête du site (Actualités, page d'accueil et vue magazine).
- Le sujet traité est déplacé dans `redaction/traite/`.
- Le dimanche, l'automatisation compose aussi « Le magazine de la semaine » à partir des articles de la semaine.

Écrivez `brouillon` dans les notes pour que l'article soit préparé sans être publié (`redaction/brouillons/`).
