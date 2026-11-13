# Paiements en ligne : abonnements et boutique (Stripe)

Le site encaisse avec **Stripe**, le prestataire de paiement utilisé par la plupart des sites français :
carte bancaire, Apple Pay, Google Pay. L'argent arrive sur le compte bancaire de la société, environ une fois par semaine.

Ce qui est prêt dans le site :

- **Abonnements** (Casa B+, La Gazette, Pack Supporter) : prélèvement automatique chaque mois ou chaque année.
- **Abonnement offert** : paiement unique d'un mois ou d'un an, activé sur l'adresse e-mail du proche.
- **Boutique** : paiement du panier, frais de livraison et remise abonnés −10 % recalculés par le serveur.
- **Mon espace** : l'abonné voit son abonnement et ses commandes ; le bouton « Gérer ou résilier » ouvre son espace client Stripe (carte, factures, résiliation).
- **Messagerie de l'espace administrateur** : un message « Paiement » arrive à chaque nouvel abonné, abonnement offert, commande payée et fin d'abonnement.

Tant que Stripe n'est pas branché, rien ne change pour les visiteurs : la demande d'abonnement ou la commande
part à l'équipe (comme avant), avec la mention « le paiement en ligne ouvre très bientôt ». Aucun abonnement n'est activé sans paiement.

> ⚠️ **Les clés secrètes (`sk_…`, `whsec_…`) ne se collent qu'à un seul endroit : Supabase › Edge Functions › Secrets.**
> Jamais dans le site, dans GitHub, dans un e-mail ou dans une conversation.

---

## Étape 1 · Créer le compte Stripe (10 minutes)

1. Allez sur **https://dashboard.stripe.com/register**, créez le compte avec l'adresse de la société.
2. Pays : **France**. Nom de l'entreprise : Casa Besports.
3. Le compte démarre en **mode test** (bandeau orange « Environnement de test ») : on peut tout essayer sans argent réel.
   L'activation des vrais paiements se fait à l'étape 7.

## Étape 2 · Préparer Supabase (2 minutes)

1. Supabase › **SQL Editor** › **New query**.
2. Collez tout le contenu de `supabase/paiements.sql`, puis **Run**. (Il crée les tables `abonnements` et `commandes`.)

## Étape 3 · Donner la clé Stripe à Supabase (2 minutes)

1. Stripe › **Développeurs** › **Clés API**. Copiez la **clé secrète** de test (elle commence par `sk_test_`).
2. Supabase › **Edge Functions** › **Secrets** › **Add new secret** :
   - Nom `STRIPE_SECRET_KEY`, valeur : la clé copiée.
   - Nom `SITE_URL`, valeur : `https://casabesports.pages.dev` (plus tard `https://casabesports.fr`).

## Étape 4 · Installer les 3 fonctions serveur (5 minutes)

Pour chacune : Supabase › **Edge Functions** › **Deploy a new function** › **Via Editor**, donnez le nom exact,
effacez l'exemple, collez le contenu du fichier, puis **Deploy**. Ensuite, dans les réglages (**Details**) de la fonction,
**désactivez « Verify JWT » (parfois appelé « Enforce JWT verification »)** (chaque fonction fait elle-même ses vérifications) et enregistrez.

| Nom de la fonction | Fichier à coller |
|---|---|
| `paiement` | `supabase/functions/paiement/index.ts` |
| `portail-abonne` | `supabase/functions/portail-abonne/index.ts` |
| `stripe-webhook` | `supabase/functions/stripe-webhook/index.ts` |

## Étape 5 · Dire à Stripe de prévenir le site (5 minutes)

C'est ce qui active l'abonnement après le paiement.

1. Stripe › **Développeurs** › **Webhooks** › **Ajouter une destination** (ou « Ajouter un endpoint »).
2. Événements à cocher :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Type : **Endpoint webhook**. URL : `https://kexofvitykxrjknnlyvf.supabase.co/functions/v1/stripe-webhook`
4. Créez, puis affichez le **secret de signature** (il commence par `whsec_`).
5. Supabase › Edge Functions › Secrets : nom `STRIPE_WEBHOOK_SECRET`, valeur : ce secret.

## Étape 6 · Ouvrir l'espace client des abonnés (2 minutes)

Stripe › **Paramètres** › **Facturation** › **Portail client** (Customer portal) :
activez « Annuler les abonnements », « Mettre à jour les moyens de paiement » et « Historique des factures », puis **Enregistrer**.

## Étape facultative · E-mail de bienvenue aux nouveaux abonnés

À chaque nouvel abonné (ou abonnement offert), la fonction `stripe-webhook` envoie un e-mail de bienvenue chaleureux
(prénom, formule, avantages, lien vers Mon espace), via **Brevo**. Une copie apparaît dans la messagerie (« Envoyés »).
Il suffit d'ajouter dans Supabase › Edge Functions › Secrets les mêmes secrets que pour la messagerie (`docs/ESPACE-ADMIN.md`) :
`BREVO_API_KEY`, `EXPEDITEUR_EMAIL`, et si vous voulez `EXPEDITEUR_NOM` et `REPONSE_EMAIL`.
Sans ces secrets, aucun e-mail ne part et tout le reste fonctionne normalement.

## Essai (mode test)

1. Sur le site, connectez-vous, ouvrez **Abonnements**, choisissez Casa B+, allez jusqu'à **Payer**.
2. Sur la page Stripe, carte **4242 4242 4242 4242**, une date future (ex. 12/34), n'importe quel code (ex. 123).
3. Retour sur le site : « Paiement reçu », puis l'abonnement apparaît **Actif** dans Mon espace, et un message « Paiement » arrive dans la messagerie de l'espace administrateur.
4. Dans Mon espace, « Gérer ou résilier » ouvre l'espace client Stripe.

Si l'abonnement ne s'active pas : Stripe › Développeurs › Webhooks › votre endpoint › onglet des événements (une erreur y est affichée),
ou Supabase › Edge Functions › `stripe-webhook` › **Logs**.

## Étape 7 · Passer aux vrais paiements

1. Stripe › **Activer votre compte** : il faut le **SIRET**, l'**adresse du siège**, un **IBAN au nom de la société** et une pièce d'identité du président.
2. Stripe › Paramètres › **Informations publiques** : nom affiché sur les relevés bancaires (ex. CASABESPORTS), e-mail et téléphone du service client.
   Paramètres › **E-mails clients** : activez l'envoi des reçus pour les paiements réussis.
3. Quittez le mode test (interrupteur « Environnement de test »), puis refaites en mode réel :
   - l'étape 3 avec la **clé secrète réelle** (`sk_live_…`) qui remplace `STRIPE_SECRET_KEY` ;
   - l'étape 5 (un nouveau webhook en mode réel, nouveau `whsec_…` qui remplace `STRIPE_WEBHOOK_SECRET`) ;
   - l'étape 6 (le portail client se règle aussi séparément en mode réel).
4. Faites un vrai petit paiement, puis remboursez-le depuis Stripe pour vérifier.

Les frais Stripe sont prélevés sur chaque paiement : voir **https://stripe.com/fr/pricing**.

---

## Au quotidien

- **Prix** : modifiez-les dans l'espace administrateur (Contenus du site › Abonnements, ou la boutique). La page de paiement reprend automatiquement les nouveaux prix ; les abonnés déjà en cours gardent leur prix.
- **Commandes** : chaque commande payée arrive dans la messagerie (articles, livraison, adresse, téléphone) et dans Stripe › Paiements. La liste complète est dans Supabase › Table Editor › `commandes` ; la colonne `statut` peut passer à `preparee`, `expediee` ou `retiree`, et le client voit ce statut dans Mon espace.
- **Remboursement** : Stripe › Paiements › le paiement › **Rembourser**.
- **Codes promo** : Stripe › Catalogue de produits › **Coupons** › créer un coupon puis un code promotionnel. Le champ « Ajouter un code promotionnel » apparaît sur la page de paiement.
- **Abonné qui ne paie plus** (carte expirée) : Stripe relance automatiquement ; s'il arrête, l'accès Premium s'arrête à la fin de la période.
- **Sur téléphone** : l'application « Stripe Dashboard » prévient à chaque paiement.

## Comment c'est construit (pour un informaticien)

- `js/paiement.js` : appelle la fonction `paiement`, redirige vers Stripe Checkout, lit le retour `?paiement=reussi|annule`, lit les tables `abonnements` / `commandes` (RLS : ses lignes, par compte ou par e-mail confirmé).
- `supabase/functions/paiement` : recalcule les prix (table `site_contenu`, sinon `contenus/*.js` du site), crée la session Checkout (`subscription` ou `payment`), remise Casa B+ vérifiée en base.
- `supabase/functions/stripe-webhook` : signature vérifiée, écrit les tables avec la clé service, ajoute un message dans `messages`.
- `supabase/functions/portail-abonne` : session Billing Portal pour le client Stripe de l'abonné connecté.
- Aucune écriture possible dans `abonnements` / `commandes` depuis le navigateur.
