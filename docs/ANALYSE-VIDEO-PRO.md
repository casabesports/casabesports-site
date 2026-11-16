# Analyse vidéo Pro (offre payante pour les clubs)

**Où ?** Page Casa PRO (`/pro`), bloc « Analyse vidéo Pro · Club », et dans les expériences immersives (bouton « Analyse vidéo »).

**Ce que fait l'outil** (fichier `js/analyse-video.js`) : on dépose une vidéo de match ou d'entraînement, puis
ralenti, image par image, dessins sur l'image (flèche, cercle, zone, trait libre), actions marquées (but, tir, perte de balle…),
rapport par période, montage des temps forts, export tableur, captures, et questions en français
(« combien de tirs pour nous ? », « quel a été notre temps fort ? »). Les réponses sont calculées à partir des actions marquées.
**La vidéo ne quitte jamais l'appareil.**

**Gratuit / payant** : sans abonnement, essai sur les 5 premières minutes de la vidéo (captures, montage et export verrouillés).
Avec l'abonnement « Analyse vidéo Pro · Club », tout est débloqué. L'administrateur a toujours l'accès complet.

## Changer le prix

Fichier `contenus/offres-pro.js` : `mois` et `an` (en euros). Le paiement relit ce fichier : le prix affiché est le prix payé.

## Après la fusion (une seule fois)

Les fonctions de paiement doivent connaître la nouvelle offre. Dans Supabase › Edge Functions, redéployer :
1. `paiement` (copier le contenu de `supabase/functions/paiement/index.ts`)
2. `stripe-webhook` (copier `supabase/functions/stripe-webhook/index.ts`)

Aucune nouvelle table, aucun nouveau secret. En mode test Stripe, payer avec la carte 4242 4242 4242 4242.

## Option future : analyse par intelligence artificielle (pas activée)

Une IA (par exemple Claude d'Anthropic) pourrait regarder la vidéo et répondre à des questions libres (placement, pressing…).
Il faut alors envoyer des images de la vidéo à un service payant. Ordre de grandeur (tarifs novembre 2026) :
un match de 90 minutes = environ 540 images (une toutes les 10 secondes), réduites en 640 × 360,
soit environ 170 000 « jetons » → **environ 0,02 € avec le modèle léger, 0,35 € avec le modèle intermédiaire** par analyse complète,
plus une clé API Anthropic et une fonction serveur. Le visionnage reste sur l'appareil tant que cette option n'est pas branchée.
