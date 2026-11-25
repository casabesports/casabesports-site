# Discussions : le chat entre amis BE+

Onglet **Discussions** du Club House (rubrique Clubs › Club House), aussi dans le menu **Plus**. Même écran sur le site et dans l'application.

## Pourquoi dans le Club House (et pas un nouvel espace)

- **Le fil du Club House** reste la tribune publique (publications, sondage).
- **Le Vestiaire** reste l'espace officiel d'un club (planning, présences, fil géré par le club, jeunes protégés).
- **La messagerie de l'admin** reste la boîte des demandes envoyées à Casa Besports.
- **Discussions** ajoute ce qui manquait : des conversations en direct entre membres, enregistrées en ligne et partagées entre appareils.

## Ce que l'on peut faire

| | Qui voit | Comment entrer |
|---|---|---|
| Groupe **ouvert** | tout membre connecté | bouton « Rejoindre » |
| Groupe **à huis clos** | ses membres seulement (invisible des autres) | code d'invitation ou lien `?groupe=CODE` |
| Conversation **privée** | les deux personnes | « Écrire en privé » depuis un groupe commun, ou numéro de membre (carte du Club House) |

- Le créateur d'un groupe en est l'**animateur** : il retire un membre, nomme un autre animateur, change le code d'invitation, supprime un message.
- Chacun peut **signaler** un message. L'administrateur voit les signalements dans l'onglet Discussions et peut supprimer le message ou classer le signalement. Il ne lit un message privé que s'il a été signalé.
- Les messages arrivent toutes les 5 secondes quand la conversation est ouverte. Le nombre de messages non lus s'affiche sur l'onglet.

## Règles de protection

- Réservé aux membres connectés de **15 ans ou plus** qui acceptent la charte (case à cocher à la première visite). Les plus jeunes restent dans le Vestiaire de leur club, avec leurs parents.
- Seuls le **pseudo** et la **qualité** (supporter, joueur, coach…) sont visibles. Jamais l'e-mail ni le téléphone.
- Anti-abus : 15 messages par minute au plus, 10 groupes créés par jour au plus. On ne peut pas écrire en privé à un inconnu (il faut un groupe en commun ou son numéro de membre).

## À faire une seule fois : lancer le fichier SQL

1. Ouvrir https://supabase.com, puis le projet Casa Besports.
2. Menu de gauche : **SQL Editor**, puis **New query**.
3. Ouvrir le fichier `supabase/discussions.sql` du dépôt GitHub, cliquer sur l'icône « Copier ».
4. Coller dans Supabase, puis cliquer sur **Run**. Le message « Success » doit s'afficher.

Aucune remise en ligne du site n'est nécessaire. Le fichier peut être relancé sans risque.

## Nouveautés : pièces jointes, infos des groupes, notifications, messagerie regroupée

### Ce qui change pour les membres

- **Pièces jointes** : dans chaque conversation (ouverte, huis clos, privée), le trombone 📎 à gauche de la zone de message ajoute jusqu'à 4 fichiers par message : photos, PDF, Word, Excel, PowerPoint, texte, 10 Mo chacun. Les photos s'affichent dans la conversation (toucher pour agrandir), les documents se téléchargent. Un message peut n'être qu'une photo.
  Les fichiers sont rangés dans un espace **privé** : seuls ceux qui peuvent lire la conversation les ouvrent (lien temporaire d'une heure). L'administrateur ne voit les fichiers d'une conversation privée ou à huis clos que si le message a été signalé.
- **Modifier les infos d'un groupe** : bouton **Modifier** en haut de la conversation, visible du **créateur du groupe** et de l'administrateur (si le créateur a quitté le groupe, ses animateurs prennent le relais). Nom, description, sport, et type ouvert / huis clos (le site prévient si le groupe devient visible de tous).
  L'administrateur retrouve **tous les groupes** (ouverts et à huis clos, jamais les conversations privées) en bas de la colonne de gauche, rubrique « Tous les groupes · administration », avec un bouton Modifier sur chacun. Il ne lit pas pour autant les messages des huis clos.
- **Notifications au choix de chacun** : bouton 🔔 en haut de chaque conversation. Trois choix : **Tous les messages**, **Seulement quand on me cite** (quelqu'un écrit `@MonPseudo`), **Aucune** (🔕).
  Par défaut : tous les messages pour les conversations privées et les huis clos, seulement les citations pour les groupes ouverts (pour ne pas être dérangé par les grands groupes). Si la conversation s'emballe, une seule notification toutes les 2 minutes au plus par conversation, sauf si on vous cite. Toucher la notification ouvre directement la conversation.
  Le panneau rappelle d'activer les notifications sur l'appareil si ce n'est pas fait (sur iPhone : dans l'application installée).

### Ce qui change pour l'administrateur

- **Formulaire de contact** (site et application) : nouveau bouton « Joindre un fichier », 5 fichiers de 10 Mo au plus. Les fichiers arrivent avec la demande dans **Admin › Messagerie** (vignette pour les photos, bouton pour ouvrir les documents).
- **Messagerie regroupée par personne** : les messages d'une même personne (même e-mail, sinon même téléphone ou même nom) et vos réponses forment un seul fil, du plus récent au plus ancien, avec le nombre de messages. Boutons « Répondre » et « Tout marquer traité » pour tout le fil. Le choix « Un par un » remet l'ancienne liste.
- **Joindre un fichier à vos e-mails** : bouton « 📎 Joindre un fichier » dans « Répondre » et « Nouveau message ».

### À faire une seule fois (10 minutes)

**1. Lancer le nouveau fichier SQL**

1. Ouvrir https://supabase.com, puis le projet Casa Besports.
2. Menu de gauche : **SQL Editor**, puis **New query**.
3. Sur GitHub, ouvrir le fichier `supabase/discussions-plus.sql`, cliquer sur l'icône « Copier » (Copy raw file).
4. Coller dans Supabase, puis cliquer sur **Run**. Le message « Success. No rows returned » doit s'afficher.

Les pièces jointes, la modification des groupes, le choix des notifications et la messagerie regroupée marchent aussitôt.

**2. Redéployer la fonction « notifications »** (pour que les notifications des discussions partent vraiment)

1. Supabase › **Edge Functions** › cliquer sur la fonction **notifications**.
2. Onglet **Code** : tout effacer, puis coller le contenu de `supabase/functions/notifications/index.ts` (sur GitHub : « Copy raw file »).
3. **Deploy**. Vérifier que « Verify JWT » reste **désactivé** (onglet Details).

**3. Redéployer la fonction « envoyer-email »** (pour joindre des fichiers à vos e-mails)

1. Supabase › **Edge Functions** › cliquer sur la fonction **envoyer-email**.
2. Onglet **Code** : tout effacer, puis coller le contenu de `supabase/functions/envoyer-email/index.ts`.
3. **Deploy**. Laisser « Verify JWT » **activé** pour cette fonction.

**Essai** : envoyez-vous un e-mail depuis Admin › Messagerie avec une photo jointe ; dans une conversation, envoyez une photo et réglez la cloche 🔔 sur « Tous les messages » depuis un deuxième compte.
