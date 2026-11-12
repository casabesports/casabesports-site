# Casa Besports — site web

Site statique : aucun serveur à maintenir, aucune base de données, hébergement gratuit.

## Ce que contient le dossier

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | La page : structure, textes des écrans, styles, thèmes (couleurs dans le premier bloc `<style>`) |
| `js/app.js` | La logique et **les contenus** : articles, scores, clubs, joueurs, vidéos, produits de la boutique |
| `js/reseau.js`, `js/profil.js`, `js/redaction.js`, `js/aide.js` | Modules : réseau local, profil membre, rédaction, aide |
| `js/three.min.js`, `js/leaflet.js`, `js/carte-normandie.js` | Bibliothèques (3D, cartes) : n'y touchez pas |
| `assets/` | Toutes les images (photos, produits, logo) |
| `js/config.js`, `js/comptes.js` | Comptes abonnés (e-mail, mobile, mot de passe) : voir `docs/COMPTES-ABONNES.md` |
| `contenus/` | **Vos contenus** : articles, résultats, boutique, vidéos, culture, lieux, fonds de page, équipe |
| `supabase/membres.sql` | Cartes membres et QR code : voir `docs/CARTE-MEMBRE.md` |
| `js/admin.js`, `supabase/administration.sql` | **Espace administrateur** (contenus, images, messagerie, accès rédaction) : voir `docs/ESPACE-ADMIN.md` |
| `manifest.webmanifest`, `icon.svg` | Installation sur téléphone (« Ajouter à l'écran d'accueil ») |

## Modifier le site

- **Le plus simple** : connectez-vous sur le site, bouton **Admin** › Contenus du site (voir `docs/ESPACE-ADMIN.md`).
- **Changer un texte ou un article** : ouvrez `js/app.js`, cherchez le texte actuel (Ctrl+F), remplacez-le.
- **Changer une photo** : déposez la nouvelle image dans `assets/` **sous le même nom** que l'ancienne (même format .jpg/.svg).
- **Ajouter une photo** : déposez-la dans `assets/`, puis utilisez `assets/nom-du-fichier.jpg` dans le contenu.
- **Couleurs** : variables `--bg`, `--ink`, `--acc`… dans le premier `<style>` de `index.html`.

Avec GitHub + Cloudflare Pages (voir ci-dessous), chaque modification enregistrée sur github.com est en ligne en ~1 minute.
Pour une modification plus large, demandez à Claude : il travaille directement sur le dépôt GitHub.

## Tester sur votre ordinateur

Double-cliquer sur `index.html` fonctionne en partie ; pour un test fidèle :
`sh outils/build.sh` puis `python3 -m http.server -d _site`, puis ouvrir http://localhost:8000

## Mise en ligne (une seule fois)

1. **GitHub** (gratuit) : créer un compte sur github.com, puis un dépôt `casabesports-site`. « Add file › Upload files » : glisser tout le contenu de ce dossier.
2. **Cloudflare Pages** (gratuit) : guide pas à pas dans `docs/CLOUDFLARE-PAGES.md` (build : `sh outils/build.sh`, dossier de sortie : `_site`). Le site est en ligne sur `casabesports.pages.dev`.
3. **Nom de domaine** : Cloudflare Pages › Custom domains › `casabesports.fr` (même guide, étape 4). Le HTTPS est activé automatiquement.

Le site fonctionnait avant sur Netlify (`netlify.toml` est gardé) : son offre gratuite à crédits a bloqué les mises en ligne le 12 novembre 2026.

## Limites actuelles (version statique)

Les comptes abonnés (e-mail et téléphone) fonctionnent en ligne dès que Supabase est branché (`docs/COMPTES-ABONNES.md`).
Le reste de ce qui demande un serveur fonctionne en mode « sur cet appareil » : CRM, boutique (commandes), espace rédaction, assistant IA (moteur intégré).
Les données saisies restent dans le navigateur de la personne. Étape suivante possible : brancher un service en ligne (ex. Supabase, Stripe pour la boutique) pour les comptes, les commandes et la publication d'articles depuis un téléphone.

La météo (Open-Meteo, en direct) et la carte (OpenStreetMap/IGN) fonctionnent sans configuration. Les scores et articles sont des contenus de départ, à mettre à jour dans `js/app.js`.

## Reprendre une nouvelle version de l'artifact claude.ai

Si vous modifiez l'application dans l'artifact sur claude.ai puis la téléchargez (fichier `.html`) :

- **Avec Claude** : envoyez le fichier dans le projet et demandez « mets à jour le site ».
- **Seul** (Python installé) : `python3 outils/extraire-artifact.py "chemin/vers/le-fichier.html" nouveau`, puis remplacez `index.html`, `js/` et `assets/` par ceux du dossier `nouveau` et envoyez-les sur GitHub (« Add file › Upload files »).
