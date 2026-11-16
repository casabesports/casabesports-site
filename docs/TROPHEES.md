# Les Marées d’or : la soirée des trophées du sport local

Page du site et de l’appli : **Plus › Les Marées d’or** (adresse `/trophees` ou `#/trophees`).
Contenu : `contenus/trophees.js`, modifiable dans **Espace admin › Contenus du site › Les Marées d’or (trophées)**.

## Pourquoi « Les Marées d’or » et pas « Ballon d’or »

« Ballon d’Or » est une marque déposée (France Football). Pour un événement public avec partenaires et billetterie,
il vaut mieux un nom à soi. « Les Marées d’or » reprend la signature Marée de BE+. Le nom se change dans le champ `nom`.

## Le concept en bref

- **Une soirée de 1 h 30** (19 h 00 à 20 h 30, accueil compris) et **10 trophées** pour la 1re édition, toutes disciplines confondues :
  Révélation (La Bouée), Sportive et Sportif de l’année (Vagues d’or), Équipe (La Rade), Entraîneur(e) (La Boussole),
  Arbitre ou officiel (L’Amer), Bénévole ou dirigeant(e) (Le Phare), Sport adapté et handisport (Le Cap),
  Exploit de l’année choisi par le public (L’Écume), et **La Marée d’or** entre les 4 premiers lauréats.
- **5 minutes par trophée sur scène** : nommé(e)s et vidéo de 30 s, enveloppe, remise, discours d’une minute, photo.
- Les dessins du Galet, de la Digue et de l’Ancre restent dans `assets/trophees/` pour les éditions suivantes.
- **Votes** : un jury de 7 personnes (rôles proposés, noms à remplir), le public (un vote par prix et par compte Casa Besports),
  et pour les sportifs le vote des pairs (un bulletin par club, capitaine + entraîneur).
- **Barèmes** (note finale sur 100) :
  - Révélation, sportive, sportif : 50 % jury, 30 % public, 20 % pairs ;
  - Entraîneur, arbitre, bénévole ou dirigeant : 70 % jury, 30 % public ;
  - Équipe, handisport : 60 % jury, 40 % public ;
  - Exploit : 100 % public ;
  - Marée d’or : 60 % jury, 40 % public (vote en direct de 7 minutes à 20 h 08).
- **Trophées** : laiton doré + socle en granit de la Manche, un symbole du littoral par prix. Dessins dans `assets/trophees/*.svg`.
- **Qui remet quoi à qui** : un rôle proposé pour chaque prix, et une case « nom » laissée vide jusqu’à l’accord de la personne.
- **Lieu** : théâtre à l’italienne de Cherbourg (géré par le Trident, scène nationale) ; date, jauge et technique à confirmer.

## Les étapes (champ `phase`)

| Phase | Ce que voit le public |
|---|---|
| `preparation` | Le concept, les prix, les barèmes, les trophées |
| `propositions` | Idem + appel à proposer des noms (formulaire de contact) |
| `vote` | Boutons « Voter » sur chaque nommé(e) (sauf la Marée d’or) |
| `jury` | Vote fermé, délibération |
| `ceremonie` | Seul le vote de la Marée d’or est ouvert (QR code à l’écran vers `/trophees`) |
| `palmares` | Les lauréat(e)s s’affichent (champ `laureat` de chaque prix) |

## Une seule fois : brancher le vote

1. Ouvrir Supabase › **SQL Editor** › **New query**.
2. Coller tout le fichier `supabase/trophees.sql`, puis **Run**. « Success » doit s’afficher.

Personne ne voit les votes des autres. L’administrateur, connecté, voit en bas de la page un bloc **Coulisses** :
le nombre de votes, la part du public, les notes du jury et des pairs (à saisir dans l’admin, fiche de chaque nommé(e),
champs `jury` et `pairs` sur 100) et la note finale calculée avec le barème.

## Règles à respecter

- Publier un(e) nommé(e) seulement avec son accord (et celui des parents pour un(e) mineur(e)).
- Remplir `laureat` seulement le soir de la cérémonie, en passant la phase à `palmares`.
- Ne pas inscrire le nom d’un remettant avant son accord.
