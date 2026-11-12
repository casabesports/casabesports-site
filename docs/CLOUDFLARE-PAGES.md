# Héberger le site sur Cloudflare Pages (gratuit)

Pourquoi : l'offre gratuite de Netlify fonctionne avec des crédits. Le 12 novembre 2026, ils étaient épuisés
et Netlify a cessé de publier les mises à jour. Cloudflare Pages publie chaque modification de GitHub
gratuitement (jusqu'à 500 mises en ligne par mois).

Rien ne change dans votre façon de travailler : tout ce qui est enregistré sur la branche `main` de GitHub
est en ligne environ une minute plus tard.

## Étape 1 · Le compte Cloudflare (5 min)

Le domaine casabesports.fr est déjà géré chez Cloudflare, dans le compte de votre informaticien.
Pour pouvoir brancher le domaine plus tard, créez le site **dans ce même compte** :

- **Le plus simple :** demandez à votre informaticien de vous inviter. Dans Cloudflare, il ouvre
  **Manage Account › Members › Invite**, met votre e-mail et le rôle **Administrator**.
  Vous recevez un e-mail : acceptez, créez votre mot de passe.
- **En attendant sa réponse**, vous pouvez créer votre propre compte gratuit sur
  https://dash.cloudflare.com/sign-up : le site marchera tout de suite sur une adresse en `pages.dev`.
  Pour le domaine, l'informaticien devra alors déplacer casabesports.fr vers votre compte.

## Étape 2 · Brancher GitHub (5 min)

1. Dans Cloudflare, menu de gauche : **Compute (Workers & Pages)** (ou **Workers & Pages**) › **Create**.
2. Onglet **Pages** › **Import an existing Git repository** (ou **Connect to Git**).
3. **Connect GitHub** › autorisez Cloudflare › choisissez **casabesports/casabesports-site** › **Begin setup**.
4. Réglages :
   - Project name : `casabesports` (l'adresse sera https://casabesports.pages.dev)
   - Production branch : `main`
   - Framework preset : **None**
   - Build command : `sh outils/build.sh`
   - Build output directory : `_site`
5. **Save and Deploy**. Après une minute environ, le site est en ligne sur https://casabesports.pages.dev.

## Étape 3 · Les comptes abonnés (2 min)

Pour que la connexion par e-mail ramène les abonnés sur la bonne adresse :
Supabase › **Authentication › URL Configuration** :
- *Site URL* : `https://casabesports.pages.dev` (plus tard `https://casabesports.fr`)
- *Redirect URLs* › **Add URL** : `https://casabesports.pages.dev/**` et `https://*.casabesports.pages.dev/**`

## Étape 4 · Le domaine casabesports.fr (quand vous êtes prêt)

1. Testez d'abord : Cloudflare › votre projet Pages › **Custom domains › Set up a custom domain** ›
   `app.casabesports.fr`. L'ancien site reste en ligne sur casabesports.fr pendant ce temps.
2. Quand tout vous convient, faites une copie de l'ancien site (votre informaticien sait où il est hébergé).
3. Même menu : ajoutez `casabesports.fr` puis `www.casabesports.fr`. Cloudflare remplace lui-même les
   réglages du domaine : quelques minutes après, casabesports.fr affiche le nouveau site.
4. Mettez `https://casabesports.fr` dans Supabase (étape 3) à la place de l'adresse pages.dev.

## Et Netlify ?

Vous pouvez le laisser tel quel (il ne coûte rien) ou supprimer le projet une fois Cloudflare en place.
Les demandes envoyées par les visiteurs arrivent toujours dans **Espace admin › Messagerie**
(table Supabase « messages ») : elles ne passaient par Netlify que pour un e-mail de notification.
