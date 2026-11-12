# Recevoir toutes les demandes du site

Chaque demande envoyée depuis le site part automatiquement vers vous, par **deux chemins** :
formulaire de contact, demandes OlistO (« Être rappelé », simulateur), propositions de sujets, résultats de clubs, devis, newsletter, commandes boutique et abonnements.

> Depuis le passage sur Cloudflare Pages (docs/CLOUDFLARE-PAGES.md), seul le chemin 2 (Supabase, lisible dans Espace admin › Messagerie) fonctionne. Le chemin 1 ne sert que si le site tourne encore sur Netlify.

## 1. Par e-mail, via Netlify (5 min, une seule fois)

1. Netlify › votre projet › **Forms** › **Enable form detection** (si le bouton est proposé).
2. Dans Netlify › **Deploys**, cliquez **Trigger deploy › Deploy site** (Netlify repère alors le formulaire « demandes »).
3. **Forms › demandes › Form notifications › Add notification › Email notification** : indiquez l'adresse qui doit recevoir les demandes (ex. kader.allou.pro@outlook.fr), enregistrez.

Chaque demande arrive alors par e-mail et reste consultable dans **Netlify › Forms › demandes**.
L'offre gratuite de Netlify compte 100 demandes par mois : au-delà, le chemin 2 garde tout.

## 2. Sauvegarde illimitée dans Supabase (2 min, une seule fois)

1. Supabase › **SQL Editor** › **New query**.
2. Copiez le contenu du fichier `supabase/messages.sql`, collez, **Run**.
3. Les demandes se lisent dans Supabase › **Table Editor › messages** (cochez `traite` quand c'est fait).

Les visiteurs peuvent envoyer une demande mais ne peuvent pas lire celles des autres.
