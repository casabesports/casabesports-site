# Le Vestiaire : l'espace commun des clubs et des joueurs

Adresse : `#/vestiaire` (ou `#/vestiaire/<identifiant du club>`, par exemple `#/vestiaire/fceh`).
On y arrive aussi par le grand bloc « Le Vestiaire » de l'accueil, le menu du haut, le menu « Plus »
et le bouton « Le Vestiaire du club » sur chaque fiche club.

## Ce qu'on y trouve

| Partie | Qui la voit | Qui la remplit |
|---|---|---|
| **Le planning** (entraînements, matchs, rendez-vous) | Tout le monde | Le club |
| **Les présences** (Présent / Peut-être / Absent) | Le public ne voit que des chiffres. Les noms : le club ; en seniors, les autres seniors du club | Chaque joueur ; le parent pour un jeune |
| **Le fil du club** (Tout le club, Seniors, Jeunes) | Tout le monde | Le club partout ; les joueurs seniors dans le fil Seniors |
| **Les membres** (demandes à valider, encadrants) | Le club | Le club |

« Le club », c'est : le **correspondant** du club (étiquette donnée dans Admin › Abonnés, avec le club choisi),
un **encadrant** qu'il a nommé dans le Vestiaire, ou vous (administrateur, sur tous les clubs).

Le club peut répéter un entraînement chaque semaine (jusqu'à 16 fois d'un coup), l'annuler (il reste affiché, barré)
ou le supprimer, et ouvrir « Qui vient ? » pour voir les réponses et ceux qui n'ont pas répondu.

## Protection des jeunes (mineurs)

- Dans la section Jeunes, on n'enregistre que **le prénom et l'initiale du nom** (« Léo D. »).
- Moins de 15 ans : c'est **un parent** qui inscrit le jeune, avec son propre compte, et qui répond aux convocations.
- Les noms des jeunes et leurs présences ne sont visibles **que du club et du parent concerné** : ni des autres parents, ni du public.
- Seul le club écrit dans le fil Jeunes, avec un rappel : jamais de nom de famille, d'adresse, de téléphone ni de photo d'un jeune.
- Quitter le vestiaire efface l'inscription et toutes les réponses.

Ces règles sont vérifiées par Supabase lui-même (sécurité au niveau des lignes), pas seulement par le site.

## Mise en route (une seule fois, 2 minutes)

1. Ouvrez [supabase.com](https://supabase.com), connectez-vous et ouvrez le projet Casa Besports.
2. Dans le menu de gauche, cliquez sur **SQL Editor**, puis sur **New query**.
3. Sur GitHub, ouvrez le fichier `supabase/vestiaire.sql`, cliquez sur l'icône « Copier » (deux carrés) en haut à droite du fichier.
4. Revenez dans Supabase, collez dans la grande zone blanche, puis cliquez sur **Run** (en bas à droite).
5. Le message **Success. No rows returned** s'affiche : c'est terminé. Le Vestiaire fonctionne aussitôt, sans remise en ligne.

Le script peut être relancé sans risque. Il a besoin des scripts déjà lancés `administration.sql` et `abonnes.sql`.

## Donner la main à un club

1. Le responsable du club crée son compte sur le site (bouton de connexion).
2. Dans **Admin › Abonnés**, donnez-lui l'étiquette **Correspondant de club** et choisissez son club.
3. Il ouvre le Vestiaire de son club : il peut ajouter le planning, valider les joueurs, nommer des encadrants et publier dans le fil.

## Covoiturage et messages du déplacement

Sous chaque match, plateau ou entraînement, le bouton **Covoiturage** ouvre l'espace du déplacement :

- **Je propose ma voiture** : nombre de places, aller et/ou retour, point et heure de départ, précision
  (« siège rehausseur »), et le téléphone seulement si le conducteur le choisit.
- **Réserver une place** pour son enfant (ou pour soi), en un geste ; on ne peut pas réserver dans une voiture pleine.
- **Je cherche une place** : les familles voient combien de personnes cherchent ; le club voit qui.
- **Messages du déplacement** : un fil privé pour les familles et le club (« on part à 9 h 15 », « goûter offert »…).
- Sur l'accueil, chaque match montre « Covoiturage · 2 places libres · 1 cherche une place ».

C'est **privé** : seuls le club et les membres validés de la section concernée y ont accès. Les noms affichés
sont ceux des **adultes** (prénom + initiale du compte) ; le prénom d'un enfant n'est vu que par son parent,
le conducteur qui l'emmène et le club. Le club peut retirer une voiture ou un message.

Mise en route : lancer **une fois** `supabase/vestiaire-covoiturage.sql`, après `supabase/vestiaire.sql`,
de la même façon (SQL Editor › New query › coller › Run).

## Les causeries d'avant-match
Dans chaque vestiaire, le cadre « Les causeries » permet au coach de partager sa causerie (PDF, photo de son travail ou modèle Casa avec compo, remplaçants, capitaine et tableau tactique) uniquement avec les convoqués, le staff et les personnes qu'il choisit. Pour la mise en route et le détail, voir [CAUSERIES.md](CAUSERIES.md).
