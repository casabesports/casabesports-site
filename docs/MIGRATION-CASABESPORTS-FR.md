# Bascule vers casabesports.fr (à faire plus tard, avec l'informaticien)

**Rien n'a été basculé.** L'ancien site reste en ligne sur casabesports.fr tant que vous n'avez pas donné votre accord.
Ce guide prépare le changement pour qu'aucun lien Google, Facebook ou WhatsApp vers l'ancien site ne soit perdu.

## 1. Ce que contient l'ancien site (relevé du 13 novembre 2026, d'après son plan du site)

| Rubrique | Nombre d'adresses | Ce qui se passe après la bascule |
|---|---|---|
| Pages principales (`/actualites`, `/videos`, `/clubs`, `/joueurs`, `/disciplines`, `/partenaires`, `/contact`, `/a-propos`, `/mentions-legales`) | 9 | Même adresse sur le nouveau site |
| `/offres` | 1 | Redirigée vers `/abonnements` |
| `/cgu`, `/cgv`, `/confidentialite`, `/cookies` | 4 | Redirigées vers `/mentions-legales` (onglets dans la page) |
| `/recherche`, `/connexion`, `/compte` | 3 | Redirigées vers l'accueil ou « Mon espace » |
| Articles `/actualites/…` | 18 | **À reprendre d'abord** : ils n'existent pas encore sur le nouveau site |
| Vidéos `/videos/…` | 3 | **À reprendre d'abord** |
| Disciplines `/disciplines/Football`… | 19 | Même adresse |
| Clubs `/clubs/…` | 25 | 9 identiques, 16 redirigées automatiquement vers la fiche du nouveau site (par le nom du club) |
| Joueurs `/joueurs/…` | 62 | 20 redirigées automatiquement (ex. `/joueurs/bastien-rouleau` → `/joueurs/rouleau`), **42 profils absents** du nouveau site |

Une adresse qui n'existe plus affiche « Page introuvable » avec le code 404 (Google la retire alors de ses résultats).

## 2. Déjà en place dans le site (sans rien basculer)

- Fichier `_redirects` : redirections définitives (301) des anciennes pages fixes (`/offres`, `/cgu`…).
- `functions/[[path]].js` : redirection 301 des anciennes fiches clubs et joueurs vers les nouvelles,
  quand le nom correspond exactement (plus une correction pour l'ancienne adresse mal orthographiée `etoile-sportice-pointe-hague`).
- Adresse officielle (canonique) déjà réglée sur `https://casabesports.fr`.

## 3. Avant la bascule (à faire dans l'ordre)

1. **Garder une copie complète de l'ancien site** (textes, photos, vidéos) : à demander à l'informaticien.
2. **Reprendre les 18 articles et 3 vidéos** dans l'espace administrateur, en gardant **le même identifiant** que l'ancienne adresse
   (exemple : identifiant `beaumont-trois-jours-fete-football`). Ainsi l'ancienne adresse fonctionne sans redirection.
   Garder l'auteur, la date de publication d'origine et le crédit photo.
3. **Ajouter les 42 profils joueurs manquants** si vous voulez les garder (même identifiant que l'ancienne adresse).
4. Vérifier sur l'aperçu `casabesports.pages.dev` que tout s'affiche.

## 4. Le jour de la bascule (avec l'informaticien)

1. L'informaticien déplace le domaine casabesports.fr de son compte Cloudflare vers le vôtre
   (ou vous ajoute comme administrateur du domaine).
2. Dans Cloudflare › Workers & Pages › casabesports › **Custom domains** : ajouter `casabesports.fr`, puis `www.casabesports.fr`.
   Cloudflare crée lui-même les réglages DNS et le certificat https.
3. Dans les réglages des fonctions Supabase (Edge Functions › Secrets), mettre `SITE_URL` = `https://casabesports.fr`
   (sinon le retour après paiement Stripe renvoie vers casabesports.pages.dev).
4. Dans Supabase › Authentication › URL Configuration : Site URL `https://casabesports.fr`,
   et ajouter `https://casabesports.fr/**` dans les Redirect URLs (garder aussi celle de pages.dev).
5. Ouvrir `https://casabesports.fr/offres` et `https://casabesports.fr/joueurs/bastien-rouleau` : vous devez arriver sur la nouvelle page.

## 5. Après la bascule

1. Google Search Console : déclarer `https://casabesports.fr` et envoyer `https://casabesports.fr/sitemap.xml` (voir docs/REFERENCEMENT.md).
2. Surveiller pendant un mois l'onglet « Pages » de la Search Console : les adresses en erreur 404 indiquent un contenu oublié.
3. Dans Stripe, rien à changer : le webhook passe par Supabase, pas par l'adresse du site.

## Retour en arrière

Si quelque chose ne va pas, retirer `casabesports.fr` des Custom domains et remettre l'ancien réglage DNS de l'informaticien :
l'ancien site revient (d'où l'importance de ne rien supprimer chez lui avant quelques semaines).
