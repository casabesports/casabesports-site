# Carte membre et QR code

Chaque abonné connecté a une **carte membre** (Club House › Ma carte membre) avec :
- un **numéro permanent** (ex. `CB-7K2M-9QXA-4`), calculé à partir de son compte : il ne change jamais et n'expire pas ;
- un **QR code** qui ouvre la page de vérification du site avec ce numéro.

Il n'y a aucune limite de nombre de membres ni de scans.

## Chez un partenaire (OlistO…)

Le partenaire scanne le QR code avec l'appareil photo de son téléphone : la page « Vérifier une carte membre » s'ouvre et affiche
**Membre valide**, le prénom et la date d'inscription. Il peut aussi saisir le numéro sur `votre-site/?membre=` ou via le pied de page › « Vérifier une carte membre ».

## À faire une seule fois (5 min) : activer le contrôle en ligne

Sans cette étape, la page confirme seulement que le numéro est authentique (lettre de contrôle), sans savoir s'il appartient à un compte.

1. Supabase › **SQL Editor** › **New query**.
2. Copiez tout le contenu du fichier `supabase/membres.sql` du dépôt, collez, cliquez **Run**.
3. C'est tout : chaque abonné est enregistré automatiquement à sa prochaine connexion.

## Suspendre une carte

Supabase › **Table Editor** › `membres` › ligne de l'abonné › colonne `statut` : remplacez `actif` par `suspendu`. La vérification affiche alors « Carte suspendue ».
