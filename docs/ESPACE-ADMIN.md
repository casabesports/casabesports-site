# Espace administrateur

Un espace visible **uniquement par vous** (l'administrateur du site) pour :

- **Contenus du site** : modifier toutes les sections (articles, Gazette, lieux, boutique, vidéos, culture, fonds de page, À propos, pages légales) et leurs images, sans passer par GitHub ;
- **Images** : envoyer vos photos (elles sont réduites automatiquement) ;
- **Messagerie** : lire toutes les demandes reçues par le site, y répondre, et recevoir les e-mails des adresses que vous ajoutez ;
- **Abonnés** : voir toutes les personnes inscrites (nom, e-mail, téléphone, abonnement, carte membre) et leur donner une étiquette de la rédaction ;
- **Équipe et accès** : décider qui a accès à l'espace rédaction, accepter ou refuser les demandes des abonnés.

## 1. Installation (une seule fois, 2 minutes)

1. Ouvrez [supabase.com](https://supabase.com) › votre projet › **SQL Editor** › **New query**.
2. Si ce n'est pas déjà fait, collez le contenu de `supabase/messages.sql`, puis **Run**.
3. Nouvelle requête : collez **tout** le contenu de `supabase/administration.sql`, puis **Run**. Le message « Success » doit s'afficher.

C'est tout. Votre adresse `kader.allou.pro@outlook.fr` y est déclarée administrateur.

## 2. Ouvrir l'espace

Connectez-vous sur le site avec cette adresse. Le bouton noir **Admin** apparaît dans l'en-tête (et « Plus › Espace administrateur », et un bloc dans Mon espace). L'adresse directe est `…/#/admin`.

Sur téléphone, le bouton de l'en-tête est masqué : passez par l'onglet **Mon espace** (bloc noir « Ouvrir l'espace administrateur ») ou par **Plus › Espace administrateur**. Ces accès n'apparaissent **que si vous êtes connecté avec l'adresse administrateur**. Sous « Bonjour … », Mon espace affiche « Connecté avec : … » : si l'adresse n'est pas la bonne, déconnectez-vous et reconnectez-vous avec la bonne. Si vous ouvrez `…/#/admin` sans être connecté, le site ouvre la fenêtre de connexion, puis l'espace administrateur s'ouvre tout seul une fois connecté.

Personne d'autre ne voit ce bouton. Et même si quelqu'un trouvait l'adresse, Supabase refuse toute lecture ou modification qui ne vient pas de votre compte (adresse e-mail confirmée).

## 3. Modifier le site

**Contenus du site** › choisissez la section › **Modifier**.

- Chaque élément (un article, un lieu, un produit…) se déplie en cliquant sur son titre. Boutons ↑ ↓ pour l'ordre, **Dupliquer**, **Supprimer**, **+ Ajouter**.
- Les champs image ont **Envoyer une photo** (depuis votre ordinateur ou téléphone), **Rogner** et **Bibliothèque** (vos photos déjà envoyées).
- **Rognage** : choisissez un format (16:9 pour les articles, 4:3, 3:2, carré, 4:5, 3:4, 9:16 ou format d'origine), faites glisser la photo, zoomez, pivotez si besoin. La photo rognée est enregistrée comme une nouvelle image : l'originale n'est jamais abîmée. Le rognage est proposé à chaque envoi de photo, et dans l'onglet **Images** (bouton « Rogner » sous chaque photo).

### Écrire un article

**Contenus du site › Articles › Modifier › + Rédiger un article**, puis choisissez un format : Article, Brève, Compte rendu de match, Portrait, Interview, Tribune / édito, Annonce / agenda ou Page blanche. Chaque format pré-remplit un plan à compléter. Vous pouvez aussi **reprendre un article de l'espace Rédaction**.

- **Publication** : *Brouillon* (invisible), *En ligne* dès l'enregistrement, ou *Programmer* une date et une heure de mise en ligne.
- **Texte** : boutons Intertitre, Citation, Liste, Paragraphe, **Photo dans le texte** (envoyée et rognée). Sélectionnez des mots puis cliquez un bouton pour les transformer. Le collage depuis Word ou une page web garde intertitres, citations et listes. Le temps de lecture se calcule tout seul.
- **Assistant** : proposer un chapeau, des titres, les points clés depuis le texte, relire.
- **Aperçu** : l'article tel qu'il apparaîtra. Version anglaise facultative en bas.
- Rien n'est en ligne avant **Enregistrer et publier**.
- **Enregistrer et publier** : c'est en ligne immédiatement, pour tous les visiteurs.
- **Version d'origine** : efface vos changements de cette section et rétablit le fichier du dépôt (`contenus/…`).

Bon à savoir :

- Ce que vous modifiez ici passe **avant** les fichiers `contenus/` du dépôt. Pour une section modifiée ici, continuez de la modifier ici.
- Exception utile : les nouveaux articles écrits par la tâche « Rédaction quotidienne » s'affichent quand même, en plus des vôtres.
- **Clubs**, **Joueurs**, **Partenaires**, **Abonnements** (prix et avantages), **Club House** (message de bienvenue, sondage de la semaine), **Règlements des sports** et **Stades** (réalité augmentée) se gèrent aussi ici (fichiers `contenus/clubs.js`, `joueurs.js`, `partenaires.js`, `abonnements.js`, `clubhouse.js`, `reglements.js`, `stades.js`).
- Les classements et résultats se saisissent dans l'onglet **Résultats**.
- **Lieux** : le champ « Photo réelle » remplace l'illustration dessinée par votre vraie photo.
- **Boutique : présentation** : le bandeau et les affiches de chaque collection (images de présentation).
- **Gazette** : « le numéro » (couverture) et « les pages » (une page par élément, champ « Modèle de page » : article, portrait, number, choc, humeur).

## 4. Accès à l'espace rédaction

L'espace rédaction n'est visible que par vous et les personnes que vous habilitez.

- Un abonné connecté voit dans **Mon espace** le bloc « Écrire pour Casa Besports » : il se présente et clique **Demander l'accès**.
- Vous recevez la demande dans **Équipe et accès** (le nombre de demandes s'affiche sur l'onglet) : **Accepter** ou **Refuser**.
- Vous pouvez aussi habiliter quelqu'un directement par son e-mail, ou lui **retirer l'accès**.
- L'accès s'applique à la prochaine connexion de la personne (ou en rechargeant la page).

## 4 bis. Abonnés et étiquettes de la rédaction

L'onglet **Abonnés** liste toutes les personnes inscrites sur le site : nom, e-mail, téléphone, date d'inscription, dernière visite, carte membre et abonnement payé (formule, statut, date de fin). Recherche par nom, e-mail, téléphone ou numéro de carte ; filtres « Abonnés payants », « Rédaction », « Demandes en attente ».

Sur chaque fiche, une rangée d'étiquettes décide de l'accès à l'espace rédaction :

| Étiquette | Ce que la personne peut faire |
|---|---|
| Aucun accès | Abonné simple, pas d'espace rédaction. |
| Rédacteur | Rédige ses articles et les soumet ; ne publie jamais seul. |
| Chef d'édition | Rédige, soumet, gère la une et La Gazette. |
| Correspondant de club | Rattaché à **un seul club** (à choisir dans la liste) : modèles guidés et fiche de son club, envoyés à la rédaction. |

L'étiquette s'applique à la prochaine connexion de la personne (ou quand elle recharge la page). Une personne inscrite **uniquement par téléphone** doit d'abord se connecter une fois avec une adresse e-mail confirmée.

### Installation (une seule fois, 1 minute)

1. Ouvrez [supabase.com](https://supabase.com) › votre projet Casa Besports › **SQL Editor** (menu de gauche) › **New query**.
2. Sur GitHub, ouvrez le fichier `supabase/abonnes.sql` du dépôt, cliquez l'icône **Copier** (deux carrés, en haut à droite du fichier).
3. Collez dans Supabase, puis cliquez **Run** (en bas à droite). Le message « Success. No rows returned » doit s'afficher.
4. Sur le site : **Admin** › onglet **Abonnés** › **Actualiser**.

Ce fichier se lance **après** `supabase/administration.sql` (déjà fait le 2026-11-11). Il peut être relancé sans risque.

### Données personnelles (RGPD)

- La liste n'est lisible **que par l'administrateur** : Supabase vérifie votre rôle à chaque lecture (fonction `liste_abonnes`). Un visiteur ou un rédacteur reçoit « Réservé à l'administrateur ».
- Le compte administrateur ne peut pas être modifié depuis le site.
- Utilisez ces coordonnées uniquement pour Casa Besports ; ne les exportez pas et ne les transmettez à personne.

## 5. Messagerie

Dès l'installation, toutes les demandes du site arrivent ici : contact, OlistO, newsletter, commandes, demandes d'accès. Filtres : Reçus, Non lus, Demandes du site, E-mails, Envoyés, Traités.

**Répondre** : tant que l'envoi direct n'est pas activé, le site vous propose « ouvrir dans ma messagerie » (votre Outlook, avec le texte déjà rempli) et garde une trace de la réponse.

### Activer l'envoi direct depuis le site (gratuit, 15 minutes)

**A. Brevo (le service qui envoie les e-mails)**

1. Créez un compte gratuit sur [brevo.com](https://www.brevo.com) (300 e-mails par jour) et remplissez le profil demandé (nom de l'entreprise, adresse).
2. En haut à droite, votre nom › **Senders, Domains & Dedicated IPs** › onglet **Senders** › **Add sender**. Nom : `Casa Besports`, e-mail : `kader.allou.pro@outlook.fr`. Brevo envoie un code à 6 chiffres à cette adresse : recopiez-le.
   (Plus tard, quand le domaine sera à vous, on passera à `contact@casabesports.fr`, mieux reçu par les boîtes.)
3. Votre nom › **Security** › **Authorized IPs** : cliquez sur **Deactivate blocking**. Sinon Brevo refuse les envois venant de Supabase.
4. Votre nom › **SMTP & API** › onglet **API keys** › **Generate a new API key**, nom `site`. Copiez la clé (elle commence par `xkeysib-`). Ne l'envoyez à personne, ne la collez pas dans le site ni dans une conversation.

**B. Supabase (le serveur du site)**

5. [supabase.com/dashboard](https://supabase.com/dashboard/project/kexofvitykxrjknnlyvf/functions/secrets) › votre projet › **Edge Functions** › **Secrets**. Ajoutez :
   - `BREVO_API_KEY` = la clé copiée à l'étape 4
   - `EXPEDITEUR_EMAIL` = `kader.allou.pro@outlook.fr`
   - `EXPEDITEUR_NOM` = `Casa Besports`
   puis **Save**.
6. **Edge Functions** › **Deploy a new function** › **Via Editor**. Nom : `envoyer-email`. Effacez le code d'exemple, collez tout le contenu de [`supabase/functions/envoyer-email/index.ts`](https://github.com/casabesports/casabesports-site/blob/main/supabase/functions/envoyer-email/index.ts) (bouton « Copy raw file » sur GitHub), puis **Deploy**. Laissez « Verify JWT » activé.

**C. Essai**

7. Sur le site, Admin › Messagerie › Nouveau message, envoyez-vous un e-mail. « Message envoyé » = c'est bon.
   Si ça échoue, le site affiche maintenant la raison exacte (clé manquante, expéditeur non validé, adresse IP bloquée…).

Les mêmes secrets servent aussi aux e-mails de bienvenue des abonnés (Stripe, voir docs/PAIEMENTS.md).

### Recevoir les e-mails des adresses que vous ajoutez

Dans **Messagerie › Adresses suivies**, ajoutez les adresses (clubs, partenaires…) dont vous voulez recevoir les e-mails dans le site. Seuls leurs e-mails sont enregistrés ; les autres sont ignorés.

Cette réception a besoin d'une adresse e-mail du domaine `casabesports.fr` gérée par Brevo (par exemple `messages@reponses.casabesports.fr`), donc d'un réglage DNS chez Cloudflare, comme pour le branchement du domaine. Quand votre informaticien aura donné l'accès :

1. Enregistrements MX du sous-domaine `reponses.casabesports.fr` vers les serveurs de réception de Brevo (valeurs indiquées par Brevo, « Inbound parsing »).
2. Supabase › Secrets : `RECEPTION_CLE` = un long mot de passe inventé ; déployez la fonction `recevoir-email` (contenu de `supabase/functions/recevoir-email/index.ts`) en **désactivant « Verify JWT »**.
3. Brevo : webhook de réception vers `https://kexofvitykxrjknnlyvf.supabase.co/functions/v1/recevoir-email?cle=<RECEPTION_CLE>`.
4. Secret `REPONSE_EMAIL` = `messages@reponses.casabesports.fr` : les réponses à vos e-mails reviendront aussi dans la messagerie.

Claude peut faire ces étapes avec vous le moment venu.

## En cas de souci

- **« Une étape à faire une seule fois »** en haut de l'espace : le fichier `supabase/administration.sql` n'a pas été lancé.
- **« Votre compte n'est pas reconnu comme administrateur »** : votre adresse e-mail n'est pas confirmée, ou ce n'est pas celle déclarée dans `supabase/administration.sql`.
- Une modification ne s'affiche pas : rechargez la page (le site garde une copie pour s'afficher vite, puis se met à jour).

## Résultats et classements (onglet « Résultats »)

Les sites des fédérations (FFF, FFBB…) refusent la lecture automatique : la mise à jour automatique des scores ne peut donc presque rien récupérer. L'onglet **Résultats** de l'espace administrateur permet de tout saisir à la main :

1. **Compétitions** : choisissez la discipline, tapez le nom (ex. « Régional 2 · groupe B »), « Ajouter la compétition ».
2. **Classement** : une ligne par équipe (J, G, N, P, différence, points, forme sur 5 matchs : V, N, D). L'ordre se fait tout seul par points.
3. **Matchs** : date, heure, équipes, scores. Scores vides = match à venir ; remplis = résultat.
4. « Enregistrer et publier » : visible tout de suite dans « Le Terrain ».

Ce qui est publié ici remplace le fichier `contenus/sport.js` du dépôt (y compris ce que l'automatisation y écrit) tant que vous ne cliquez pas sur « Version d'origine ». Les équipes dont le nom correspond exactement à une fiche club sont reliées automatiquement à leur club.


## Vidéos en arrière-plan

Sur le site, bouton « ✎ Retoucher », cliquez sur une grande image (par exemple en haut de l’accueil ou de la page Culture), puis « Envoyer une vidéo ». La vidéo remplace l’image à cet endroit : sans le son, en boucle, lancée toute seule, aussi sur iPhone. L’image reste visible le temps du chargement et pour les visiteurs qui ont demandé moins d’animations.

Conseils : fichier .mp4, moins de 15 secondes, 1080p au plus, 50 Mo maximum (idéalement moins de 10 Mo pour un chargement rapide).

À faire une seule fois avant le premier envoi : Supabase › SQL Editor › New query, collez le contenu de `supabase/videos.sql`, puis « Run ». Sans cette étape, le stockage refuse les vidéos. Vous pouvez aussi coller l’adresse d’une vidéo .mp4 déjà en ligne.

## Accueil épuré et couleurs des fonds

- **Accueil** : 5 blocs essentiels s'affichent pour tout le monde (grand bandeau à la une, résultats du week-end, portes « passionné » / « pro », Casa × Cherwood, Gazette du mois). Les autres rubriques (actus, vidéos, météo, Club House, culture…) sont proposées aux abonnés connectés dans **Personnaliser mon accueil** : sports et clubs favoris (ils passent en tête du bandeau, des résultats et des actus), rubriques à afficher et leur ordre, disposition, arrière-plan. Ces choix sont gardés dans le compte de l'abonné (Supabase, aucune table à créer) et le suivent sur tous ses appareils.
- **Couleurs des fonds** (Contenus du site › Fonds de page) : photos de fond en noir et blanc ou en couleur, couleur de fond pour tout le site, et couleur propre à une page. Chaque abonné peut aussi choisir sa couleur dans Personnaliser mon accueil ou Mon espace › Apparence. Par défaut : noir et blanc, sans teinte.

## Déplacer un élément (Retoucher)

Bouton « ✎ Retoucher », cliquez sur un texte ou une image : le volet commence par **Déplacer**.
- Choisissez ce qui bouge : l'élément lui-même, le cadre autour, un bloc plus grand ou la section (encadré en pointillés bleus).
- « Glisser sur la page » : faites glisser n'importe où, l'élément suit ; « Terminer le déplacement » quand c'est bien. Ou utilisez les flèches (1, 10 ou 40 px).
- Le réglage vaut pour l'écran utilisé (ordinateur ou téléphone) : l'autre ne change pas. Faites le réglage téléphone depuis un téléphone.
- « Remettre à sa place » annule. Rien n'est visible des visiteurs avant « Publier ». Liste et suppression : Contenus du site › Retouches des pages › Éléments déplacés.

## Changer la police (Retoucher)

Sous « Déplacer », le bloc **Police d'écriture** : police (League Spartan, Cormorant Garamond, Mulish, Barlow Condensed, Archivo Black, Source Serif, Cinzel, Caveat), graisse, italique, capitales et taille (50 à 200 %). Il s'applique à l'élément choisi dans « Déplacer » ; pour un titre ou un paragraphe, gardez « Cet élément ». Même réglage sur ordinateur et téléphone. « Police d'origine » annule. Liste : Contenus du site › Retouches des pages › Polices changées.
