# Notifications du site et de l'application

Les visiteurs touchent **« Activer les notifications »** (page **Application** `#/app`, ou **Mon espace**).
Vous leur envoyez ensuite une notification depuis **Admin › Notifications** : elle s'affiche sur leur téléphone
ou leur ordinateur, même site fermé, et un toucher ouvre la page choisie (un article, l'accueil…).

| Appareil | Où ça marche |
|---|---|
| Android (Chrome, Edge, Samsung, Firefox) | sur le site et dans l'application installée |
| Ordinateur (Chrome, Edge, Firefox, Safari) | sur le site et dans l'application installée |
| iPhone / iPad (iOS 16.4 ou plus récent) | **seulement dans l'application installée** (Safari › Partager › « Sur l'écran d'accueil ») |

Sur iPhone, dans Safari « normal », Apple ne permet pas les notifications : le site l'explique au visiteur et lui montre comment installer l'application.

Coût : gratuit (les services de Google, Apple, Mozilla et Microsoft ne font rien payer, et l'envoi passe par votre Supabase actuel).

---

## Mise en place (une seule fois, environ 5 minutes)

### Étape 1 : créer les tables

1. Ouvrez [Supabase › SQL Editor](https://supabase.com/dashboard/project/kexofvitykxrjknnlyvf/sql/new).
2. Sur GitHub, ouvrez le fichier [`supabase/notifications.sql`](https://github.com/casabesports/casabesports-site/blob/main/supabase/notifications.sql), cliquez sur l'icône **Copy raw file** (deux carrés, en haut à droite du fichier).
3. Revenez dans Supabase, collez dans la zone de texte vide, puis cliquez **Run**.
4. Le message **Success. No rows returned** s'affiche : c'est bon.

### Étape 2 : déployer la fonction d'envoi

1. Ouvrez [Supabase › Edge Functions](https://supabase.com/dashboard/project/kexofvitykxrjknnlyvf/functions).
2. **Deploy a new function** › **Via Editor**.
3. En haut, remplacez le nom proposé par : `notifications` (en minuscules, sans accent).
4. Effacez tout le code d'exemple. Sur GitHub, ouvrez [`supabase/functions/notifications/index.ts`](https://github.com/casabesports/casabesports-site/blob/main/supabase/functions/notifications/index.ts), **Copy raw file**, puis collez dans Supabase.
5. Cliquez **Deploy function** et attendez le message de réussite.
6. Ouvrez l'onglet **Details** (ou **Settings**) de la fonction `notifications`, **désactivez « Verify JWT »** (parfois appelé « Enforce JWT verification »), puis **Save**.
   C'est normal et sans risque : la fonction vérifie elle-même que seul l'administrateur peut envoyer.

Aucune clé à créer : au premier appel, la fonction fabrique toute seule ses clés de sécurité et les garde dans Supabase
(la partie secrète ne quitte jamais Supabase). Elle utilise votre adresse `EXPEDITEUR_EMAIL` (déjà créée pour les e-mails)
comme contact technique auprès de Google et Apple.

### Étape 3 : essayer

1. Sur votre téléphone, ouvrez le site (sur iPhone : **l'application installée**), page **Application**, touchez **Activer les notifications**, puis **Autoriser**.
2. Connectez-vous avec votre compte administrateur, **Admin › Notifications**.
3. Écrivez un titre, puis **M'envoyer un essai** : la notification arrive sur ce téléphone.
4. Si tout va bien : **Envoyer à tous**.

---

## Au quotidien

- **Partir d'un article** remplit le titre, la phrase et le lien de l'article en un clic.
- Le compteur indique combien d'appareils sont inscrits (Android, iPhone, ordinateur).
- **Derniers envois** garde l'historique : combien de notifications sont bien arrivées.
- Quand une personne désinstalle l'application ou coupe les notifications, son appareil est retiré tout seul au prochain envoi.
- Bon usage : deux ou trois notifications par semaine au maximum. Une notification envoyée ne peut pas être reprise.

## Si ça ne marche pas

| Message | Que faire |
|---|---|
| Admin › Notifications : « Deux étapes à faire une seule fois » | La fonction ou les tables manquent : refaites les étapes 1 et 2. |
| « Réservé à l'administrateur » | Vous n'êtes pas connecté avec le compte administrateur. |
| Erreur 401 « Invalid JWT » | « Verify JWT » est resté activé : étape 2, point 6. |
| Le visiteur voit « Notifications bloquées » | Il a refusé une fois : il doit les autoriser dans les réglages de son navigateur (icône à gauche de l'adresse) ou de son téléphone (Réglages › Notifications › Casa Besports). |
| iPhone : pas de bouton qui marche | Il faut iOS 16.4 ou plus récent, et ouvrir l'application installée sur l'écran d'accueil, pas Safari. |

## Le jour où le site passera sur casabesports.fr

Les inscriptions sont liées à l'adresse du site. Quand le domaine sera branché, les visiteurs devront réactiver les
notifications une fois sur la nouvelle adresse (comme pour réinstaller l'application). Les clés côté Supabase, elles, restent les mêmes.

## Fichiers

- `js/notifications.js` : bouton « Activer / Désactiver », inscription de l'appareil.
- `sw.js` : affiche la notification et ouvre la bonne page au toucher.
- `js/admin.js` : onglet Notifications de l'espace administrateur.
- `supabase/notifications.sql` : tables `push_abonnements`, `push_reglages`, `notifications_envoyees`.
- `supabase/functions/notifications/index.ts` : fonction serveur (clé publique, inscription, envoi chiffré).
