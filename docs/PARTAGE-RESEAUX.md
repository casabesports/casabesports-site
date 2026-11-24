# Partager un article sur les réseaux sociaux

Les rédacteurs, chefs d'édition, correspondants de club (et l'administrateur) ont un bouton
**« Partager sur mes réseaux »** dans l'éditeur de leurs articles (et « Partager » dans la liste des articles en ligne).

## Ce que l'auteur choisit

1. **L'image d'aperçu** : image de une, photo du texte, médiathèque ou sa propre photo, avec ou sans le **bandeau BE+**
   (titre, logo et « À lire sur BE+ » ou « Réservé aux abonnés BE+ » posés sur la photo).
2. **La lecture** : gratuite pour tous, ou réservée aux abonnés BE+ (le lecteur voit le début, puis l'offre BE+).
3. **Le texte** de la publication (proposé automatiquement, modifiable, avec le lien et des hashtags).

Le lien mène à `/actualites/<article>`. La fonction Cloudflare `functions/[[path]].js` écrit dans la page le titre,
le chapeau et l'image choisie : c'est l'aperçu que montrent Facebook, LinkedIn, X, WhatsApp et Telegram.
Un clic sur cet aperçu ouvre l'article.

## Quels réseaux acceptent un lien cliquable ?

| Réseau | Lien cliquable |
| --- | --- |
| Facebook, LinkedIn, X, WhatsApp, Telegram | Oui : l'aperçu (image + titre) et le lien ouvrent l'article |
| Instagram | Pas dans la légende d'une publication. Oui dans la **bio** et dans une **story** (sticker « Lien ») |
| TikTok | Pas sous une vidéo ou une photo. Lien dans la bio, si le compte y a droit |

Pour Instagram et TikTok, le bouton prépare l'image (format 4:5) et copie la légende ; sur téléphone, il ouvre directement
le menu de partage. Le « lien pour la bio » est à coller dans le profil.

## À faire une fois, après la fusion

1. **Supabase › SQL Editor** : coller `supabase/partage.sql`, puis « Run ».
   Sans ce script, l'image et le choix gratuit/abonnés ne peuvent être changés que tant que l'article est en brouillon
   ou en corrections ; avec lui, l'auteur peut les changer même après la publication (rien d'autre : le texte reste
   sous le contrôle de l'administrateur).
2. **Supabase › Edge Functions** : créer la fonction `contact-olisto` avec le contenu de
   `supabase/functions/contact-olisto/index.ts`, et **désactiver « Verify JWT »**. Elle utilise les secrets Brevo déjà
   en place. Elle envoie à k.allou@olisto.fr les demandes faites depuis la page OlistO (destinataire fixe).
   Tant qu'elle n'est pas déployée, la personne voit après l'envoi les boutons « Écrire » et « Appeler » OlistO.

## Statistiques

Chaque lien porte `utm_source` (facebook, linkedin, instagram…) et `utm_campaign=partage-redaction` : les visites venues
des réseaux sont reconnaissables dans les statistiques du site.
