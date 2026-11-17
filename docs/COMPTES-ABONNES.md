# Comptes abonnés : e-mail et téléphone mobile

Comment ça marche pour l'abonné :
1. **Créer un compte** (une seule fois) : il reçoit un **lien par e-mail** ou un **code par SMS**, il est connecté.
2. Le site lui demande aussitôt de **choisir un mot de passe** (8 caractères minimum). Il peut le faire plus tard depuis « Mon compte › Sécurité ».
3. Les fois suivantes : **Connexion › J'ai un compte** → e-mail (ou numéro de mobile) + mot de passe.
4. **Mot de passe oublié ?** → il reçoit un lien par e-mail pour en choisir un nouveau (compte créé par SMS : il se reconnecte par code SMS puis change son mot de passe dans « Mon compte »).

 Les comptes sont gérés par **Supabase** (gratuit jusqu'à 50 000 abonnés actifs par mois).
Tant que `js/config.js` est vide, la fenêtre de connexion reste en mode démonstration.

## 1. Créer le projet Supabase (5 min)

1. https://supabase.com/dashboard/sign-up → « Continue with GitHub ».
2. « New project » : nom `casabesports`, un mot de passe de base de données (notez-le), région **West EU (Paris)**, offre Free.
3. Attendez 1 à 2 minutes que le projet soit prêt.

## 2. Indiquer l'adresse du site

**Authentication › URL Configuration** :
- *Site URL* : l'adresse de votre site, par ex. `https://casabesports.pages.dev` (plus tard `https://casabesports.fr`). Voir aussi docs/CLOUDFLARE-PAGES.md.
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

## 6. Réglages conseillés pour les mots de passe

Supabase › **Authentication › Sign In / Providers › Email** : laissez « Enable Email provider » activé.
Supabase › **Authentication › Policies** (ou *Password security*) : longueur minimale **8**, et cochez « Prevent use of leaked passwords » si proposé.
Le lien « Mot de passe oublié » utilise le modèle d'e-mail **Reset Password** (Authentication › Emails), à traduire en français comme les autres.

## 7. Un seul compte par personne (doublons)

Supabase refuse déjà tout seul deux comptes avec **le même e-mail** ou **le même mobile**.
Le seul doublon possible : une personne s'inscrit une fois avec son e-mail, puis une autre fois avec son mobile.
Le site l'évite de trois façons :

- **À la création du mot de passe**, il affiche l'identifiant du compte, puis **se reconnecte aussitôt avec ce mot de passe**
  pour vérifier que la connexion marche et ouvre bien le même compte (« ✓ connexion vérifiée »).
- **Compte créé par SMS** : il demande l'e-mail en même temps que le mot de passe. Si cette adresse a déjà un compte,
  il propose de supprimer le compte qu'on vient de créer par erreur, puis de se connecter avec l'e-mail.
- **Même appareil** : si quelqu'un s'est déjà connecté sur ce téléphone ou cet ordinateur avec un autre identifiant,
  le site prévient avant d'envoyer un nouveau lien ou un nouveau code.

À faire une seule fois dans Supabase :

1. **SQL Editor › New query** : collez le contenu de `supabase/comptes.sql`, cliquez **Run** (message « Success »).
   Il ajoute la suppression du compte en double (seulement un compte de moins de 24 h, sans e-mail confirmé, sans abonnement).
2. **Authentication › Sign In / Providers › Email** : vérifiez que **« Secure email change »** est activé (c'est le réglage par défaut) :
   l'e-mail ajouté à un compte SMS n'est rattaché qu'après un clic dans l'e-mail reçu.
3. **Authentication › Emails › Templates › Change Email Address** : traduisez le message en français si ce n'est pas fait.

Doublons déjà présents : dans l'admin, onglet **Abonnés**, le filtre **« Doublons possibles »** montre les comptes au même nom.
Gardez celui qui a l'abonnement ou l'e-mail confirmé ; supprimez l'autre dans Supabase › **Authentication › Users**
(cochez la ligne › bouton **Delete user**). Sa carte membre part avec lui ; son historique d'articles et de paiements reste.

## Voir et gérer les abonnés

Supabase › **Authentication › Users** : liste des comptes, recherche, suppression, export.

## Ce qui reste local pour l'instant

Le compte (identité, e-mail, téléphone, nom) est en ligne. Les commandes, abonnements payants, listes et préférences restent enregistrés sur l'appareil de l'abonné.
L'accès rédaction (administrateur, rédacteurs) n'est plus proposé en démonstration une fois Supabase branché : il faudra lui attribuer de vrais rôles (prochaine étape).
