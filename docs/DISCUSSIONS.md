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
