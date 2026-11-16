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
