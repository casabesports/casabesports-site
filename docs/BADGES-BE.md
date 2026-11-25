# Badges BE+, trombinoscope et certifications de CV

## Ce que ça fait
- **Mon badge BE+** (Espace rédaction › bouton « Mon badge BE+ », ou menu ☰ › Équipe) : le correspondant ou la personne agréée remplit son badge (photo, prénom, nom, fonction, club, discipline, ville, présentation, coloris Marée / Soleil / Nuit), voit le recto et le verso en direct, puis l'envoie pour validation.
- **Recto** : QR code vers sa fiche du trombinoscope. Si le badge est valide, la fiche affiche « Badge authentique et valide » ; sinon « Badge non reconnu ».
- **Verso** : QR code vers l'application BE+ (espace correspondants).
- Téléchargement en image (recto, verso) et impression au format carte bancaire (54 × 85,6 mm).
- **Trombinoscope** (menu ☰ › Trombinoscope, ou adresse `/?trombinoscope`) : uniquement les badges validés et en cours de validité, sans e-mail ni téléphone.
- **Espace administrateur › Demandes à valider** : badges à valider (Valider, Demander une correction, Refuser, Suspendre) et demandes de certification de CV (bouton « Ouvrir le CV et vérifier »).
- Un badge validé reçoit un numéro BE-AAAA-XXXX, valable jusqu'au 31 août (fin de saison).

## Pourquoi la demande de certification d'hier n'apparaissait pas
Avant cette mise à jour, une demande de certification de CV restait **enregistrée sur le téléphone ou l'ordinateur de la personne** (mode démonstration) : elle n'était jamais envoyée en ligne, donc l'administrateur ne pouvait pas la voir.
Désormais les demandes sont enregistrées dans Supabase. Une demande déjà faite avant la mise à jour part **toute seule** vers l'administrateur la prochaine fois que la personne ouvre le site connectée à son compte (sur le même appareil). Elle apparaît alors avec la mention « Demande faite avant la mise en ligne ».

## À faire une seule fois (après la fusion)
1. Ouvrir https://supabase.com, puis votre projet.
2. Menu de gauche : **SQL Editor** › **New query**.
3. Ouvrir le fichier `supabase/badges.sql` du dépôt sur GitHub, cliquer sur l'icône « Copier » (Copy raw file).
4. Coller dans Supabase, cliquer **Run**. Le message « Success. No rows returned » doit s'afficher.
5. Recharger le site, ouvrir Espace administrateur › Demandes à valider.

Le script peut être relancé sans risque.
