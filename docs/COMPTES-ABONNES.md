# Comptes abonnés : e-mail et téléphone mobile

Le site sait déjà inscrire et connecter les abonnés **sans mot de passe** :
- **par e-mail** : l'abonné reçoit un lien, il clique, il est connecté ;
- **par téléphone mobile** : l'abonné reçoit un code à 6 chiffres par SMS.

Le compte est créé automatiquement à la première connexion. Les comptes sont gérés par **Supabase** (gratuit jusqu'à 50 000 abonnés actifs par mois).
Tant que `js/config.js` est vide, la fenêtre de connexion reste en mode démonstration.

## 1. Créer le projet Supabase (5 min)

1. https://supabase.com/dashboard/sign-up → « Continue with GitHub ».
2. « New project » : nom `casabesports`, un mot de passe de base de données (notez-le), région **West EU (Paris)**, offre Free.
3. Attendez 1 à 2 minutes que le projet soit prêt.

## 2. Indiquer l'adresse du site

**Authentication › URL Configuration** :
- *Site URL* : l'adresse de votre site, par ex. `https://casabesports.netlify.app` (plus tard `https://casabesports.fr`).
- *Redirect URLs* : ajoutez la même adresse suivie de `/**`, et `https://*--casabesports.netlify.app/**` pour les aperçus Netlify.

## 3. Brancher le site

**Project Settings › API** (ou bouton « Connect ») : copiez
- *Project URL* (https://xxxx.supabase.co)
- la clé *anon public* (ou *publishable*). Elle est prévue pour être publique.

Puis sur GitHub : ouvrez `js/config.js` › crayon ✏️ › collez les deux valeurs entre les guillemets › « Commit changes ».
⚠️ Ne collez jamais la clé *service_role* / *secret*.

Dès que Netlify a republié (30 s), la connexion par e-mail fonctionne.

## 4. E-mails : à faire avant d'ouvrir au public

L'envoi d'e-mails intégré à Supabase est limité à quelques messages par heure : parfait pour tester, insuffisant pour des abonnés.
Branchez un service d'envoi (gratuit pour démarrer, par ex. **Brevo** : 300 e-mails/jour) :
**Authentication › Emails › SMTP Settings** › « Enable custom SMTP » et copiez les réglages SMTP donnés par Brevo
(expéditeur conseillé : `noreply@casabesports.fr`, à valider chez Brevo, ce qui demande d'ajouter des lignes DNS chez Cloudflare).

Personnalisez le message : **Authentication › Emails › Templates › Magic Link** (texte en français).

## 5. Téléphone mobile (SMS, payant)

L'envoi de SMS passe par un opérateur, environ 0,07 à 0,10 € par SMS vers la France.
1. Créez un compte **Twilio** (twilio.com), achetez un numéro ou un « Messaging Service », notez *Account SID*, *Auth Token* et *Message Service SID*.
2. Supabase › **Authentication › Sign In / Providers › Phone** : activez, choisissez Twilio, collez les 3 valeurs, enregistrez.

Sans cette étape, l'onglet « Téléphone mobile » affiche « La connexion par SMS n'est pas encore activée ».

## Voir et gérer les abonnés

Supabase › **Authentication › Users** : liste des comptes, recherche, suppression, export.

## Ce qui reste local pour l'instant

Le compte (identité, e-mail, téléphone, nom) est en ligne. Les commandes, abonnements payants, listes et préférences restent enregistrés sur l'appareil de l'abonné.
L'accès rédaction (administrateur, rédacteurs) n'est plus proposé en démonstration une fois Supabase branché : il faudra lui attribuer de vrais rôles (prochaine étape).
