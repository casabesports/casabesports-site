# Les causeries d'avant-match (dans le Vestiaire)

Le coach prépare sa causerie et la réserve à son équipe. Les joueurs la lisent dans le site ou l'appli, la veille ou le jour du match.

## Ce que le coach peut faire

Il y a trois façons, qu'on peut mélanger dans la même causerie :

- **Déposer son PDF.** Il s'affiche tout seul, page par page, sans rien télécharger.
- **Prendre ou envoyer une photo de son travail** (tableau blanc, feuille, carnet). La photo est recadrée automatiquement et rendue plus lisible. Le coach ajoute une légende et choisit la partie où elle va : Plan de jeu, Attaque, Défense, Coups de pied arrêtés ou Autre.
- **Remplir le modèle Casa en ligne**, avec :
  - le mot du coach, le dernier match, le plan de jeu et l'adversaire ;
  - **la compo** : le système (4-3-3, 4-4-2…), le **onze de départ** avec numéro et nom sur le terrain, les **remplaçants** (numéro et nom) et le **brassard de capitaine ©**. Il n'y a qu'un seul capitaine, et ce peut être un remplaçant ;
  - le **tableau tactique** : situations d'attaque, de défense et de transition, corners, coups francs, penalty, touche et combinaisons. On peut y mettre des flèches de course, de passe, de conduite, de tir et de pressing, des zones et du texte. Une situation peut avoir plusieurs étapes, animées pour les joueurs ;
  - les **tireurs et les marquages** : penalty, tirs au but, corners gauche et droit, coups francs, touches, et coups de pied arrêtés défensifs en zone, en mixte ou en individuel ;
  - les 3 clés, la phrase du jour, et des notes réservées au staff (jamais montrées aux joueurs).

Le terrain change selon le sport du club : football, handball, basket, volley, rugby, roller hockey et water-polo.

## Qui la voit ?

Supabase le vérifie lui-même, pas seulement le site.

- **Le staff** du club la voit toujours : le correspondant, les encadrants nommés dans le Vestiaire et l'administrateur.
- Le coach choisit les autres lecteurs :
  - **les convoqués du match** : les joueurs de l'équipe, sauf ceux qui ont répondu « Absent ». La liste suit la convocation toute seule ;
  - **toute l'équipe** ;
  - **ma liste** : seulement les personnes qu'il coche ou qu'il ajoute.
- Il choisit aussi l'**heure d'ouverture** et l'**heure de fermeture**. En dehors de ces heures, les joueurs ne la voient pas.
- Pour le public, les autres équipes et l'adversaire, la causerie n'existe pas. Les fichiers sont rangés dans un dossier privé.
- Les joueurs appuient sur « J'ai lu », et le coach voit « Lue par X sur Y ».
- **Export PDF** (format A4 ou téléphone). Le nom du lecteur est écrit en bas de chaque page. Le coach peut interdire le téléchargement aux joueurs : c'est le réglage par défaut.

## Mise en route (une seule fois, environ 3 minutes)

### Étape 1 : créer les tables
1. Ouvrez [Supabase › SQL Editor](https://supabase.com/dashboard/project/kexofvitykxrjknnlyvf/sql/new).
2. Cliquez sur **New query**.
3. Copiez **tout** le fichier `supabase/causeries.sql`, collez-le, puis cliquez sur **Run**.
4. Le message **Success. No rows returned** doit s'afficher.

Ce script crée aussi le dossier privé « causeries » pour les PDF et les photos. Vous pouvez le relancer sans risque.

### Étape 2 : mettre à jour la fonction « notifications »
Cette étape sert à prévenir les joueurs sur leur téléphone quand la causerie est publiée.
1. Allez dans Supabase › **Edge Functions** › `notifications` › **Code**.
2. Remplacez tout le code par le contenu de `supabase/functions/notifications/index.ts`.
3. Cliquez sur **Deploy**. Laissez « Verify JWT » **désactivé**, comme avant.

Sans cette étape, les causeries marchent quand même. Seule la notification ne part pas.

## Fichiers
- `js/causeries.js` : la liste, la création en 4 étapes, la lecture, l'export PDF et les photos.
- `js/causeries-tableau.js` : le tableau tactique de tous les sports, les systèmes et les fiches tireurs.
- `js/vendor/pdfjs-3.11.174/` : l'afficheur de PDF (pdf.js, licence Apache 2.0).
- `supabase/causeries.sql` : les tables, les droits et le dossier privé.
- Ces fichiers ne sont chargés qu'à l'ouverture des causeries, pour ne pas alourdir le site.
