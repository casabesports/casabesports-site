# Référencement (Google, partage sur les réseaux)

## Ce qui est en place

- **Adresses lisibles** : chaque article, club, joueur et rubrique a une adresse propre que Google peut indexer et que l'on peut partager :
  `/actualites/identifiant-de-l-article`, `/clubs/fceh`, `/joueurs/rouleau`, `/a-propos`, `/contact`, `/boutique`…
  Les anciennes adresses en `#/…` continuent de fonctionner.
- **Page préparée côté serveur** (`functions/[[path]].js`, fonction Cloudflare Pages) : pour ces adresses, le HTML envoyé contient déjà
  le titre, la description, l'image de partage (Facebook, WhatsApp, LinkedIn, X), l'adresse officielle (canonique),
  les données structurées `NewsArticle` d'un article et son texte lisible sans JavaScript.
- **Plan du site automatique** : `/sitemap.xml` liste l'accueil, les rubriques, les articles publiés, les vidéos, les clubs et les joueurs.
  Il est à jour dès qu'un article est publié depuis l'espace administrateur (pas besoin de remettre le site en ligne).
- **Bouton Partager** d'un article : partage l'adresse lisible de l'article.
- **Page d'article** : auteur, date de publication, date de mise à jour (automatique), photo avec description et crédit photo.

## Ce que vous avez à faire

1. Dans l'espace administrateur, pour chaque article : remplir **Description de la photo** et **Crédit photo**.
2. Quand le domaine casabesports.fr sera branché : déclarer le site dans la [Google Search Console](https://search.google.com/search-console)
   et y envoyer l'adresse `https://casabesports.fr/sitemap.xml`.

## Réglages techniques

- L'adresse officielle utilisée (canonique, plan du site) est `https://casabesports.fr`.
  Pour en utiliser une autre, ajouter dans Cloudflare Pages › Settings › Variables la variable `SITE_URL` (même valeur pour la construction du site et pour les fonctions).
- Les adresses traitées par la fonction sont listées dans `_site/_routes.json`, fabriqué par `outils/build.sh`
  (les images et scripts ne passent pas par la fonction : aucune lenteur ajoutée).
- Données lues par la fonction : `contenus/seo.json` (préparé à la construction par `outils/seo-donnees.js` à partir de `contenus/*.js`)
  et la version en ligne des contenus (table Supabase `site_contenu`, lecture publique).
- Le site se teste désormais avec un petit serveur (`python3 -m http.server -d _site`) : ouvrir `index.html` en double-cliquant ne suffit plus.
