# Casa Lineup et Casa Studio — guide (phase 1)

Ce guide explique ce qui a été ajouté, comment l'activer et ce qui reste limité.
Le plan des phases suivantes (Manager, Analytics, VAR, 3D) est dans `docs/PLAN-CASA-PLATEFORME.md`.

---

## 1. Où trouver les nouveautés (aucune nouvelle entrée de menu)

| Fonction | Où | Fichier |
|---|---|---|
| Casa Lineup (compositions) | Page **Clubs** › bouton « Casa Lineup » ; fiche d'un club › « Composer l'équipe » ; **Le Terrain** › « Composer une équipe » ; espace **rédaction** › « Casa Lineup · compositions » | `js/lineup.js` (chargé seulement à l'ouverture) |
| Composition partagée | Lien `https://…/?compo=<identifiant>` | `js/lineup.js` |
| Casa Studio (lecteur) | Page **Le podcast** › « Ouvrir le lecteur » / « Lecteur » / « Regarder » ; lien `?ecoute=<id>&t=début-fin` | `js/studio.js` |
| Réglages des épisodes | Admin › Contenus › « Podcast · Casa Studio » | `js/admin.js` |
| Qui peut faire quoi (préparé, rien de bloqué) | | `contenus/droits.js` |

---

## 2. À faire une seule fois (étapes pas à pas)

### Étape 1 — Créer les tables des compositions (Supabase)
1. Ouvrez https://supabase.com/dashboard, puis votre projet Casa Besports.
2. Menu de gauche : **SQL Editor** › **New query**.
3. Ouvrez le fichier `supabase/lineups.sql` sur GitHub, cliquez sur l'icône « copier », collez dans Supabase.
4. Cliquez sur **Run**. Vous devez voir « Success. No rows returned ».

Ce fichier a besoin de `administration.sql`, `abonnes.sql`, `redaction.sql` et `vestiaire.sql`, déjà lancés.
Il peut être relancé sans risque (il ne supprime aucune composition).

**Sans cette étape**, Casa Lineup marche quand même : les compositions sont gardées sur l'appareil,
et l'éditeur affiche un message clair. L'enregistrement en ligne, l'envoi et la publication attendent la table.

### Étape 2 — Mettre à jour la fonction « notifications »
Pour que le destinataire d'une composition reçoive une notification sur son téléphone :
1. Supabase › **Edge Functions** › `notifications` › **Code**.
2. Remplacez tout le code par le contenu de `supabase/functions/notifications/index.ts`.
3. **Deploy**. Laissez « Verify JWT » **désactivé** (comme avant).

Sans cette étape, l'envoi marche quand même : la personne voit la composition dans l'onglet « Reçues »
(avec une pastille) et un message à sa connexion, mais pas de notification sur le téléphone.

### Étape 3 (déjà faite normalement) — vidéos du podcast
`supabase/podcast.sql` autorise déjà les vidéos (.mp4, .webm, .mov, 50 Mo). Si l'envoi d'une vidéo
d'épisode est refusé dans l'admin, relancez ce fichier comme à l'étape 1.

---

## 3. Casa Lineup — ce qui marche vraiment

- **Disciplines** : football à 11, foot à 8, futsal, handball, basket, volley, rugby à XV (nombre de titulaires et postes propres à chacune).
- **Formations** football : 4-3-3, 4-4-2, 3-5-2, 4-2-3-1, 5-3-2, 4-1-4-1, 3-4-3, 4-3-1-2, plus placement libre (glisser les joueurs).
- **Joueurs** : choix dans l'effectif du club (fiches joueurs du site), ou saisie libre ; numéro, prénom, nom, poste, capitaine, photo importée (recadrée en portrait 4:5), remplaçants, staff, arbitres.
- **Tactique** : plan où l'on glisse les joueurs (souris, doigt) ; échange de deux joueurs en les déposant l'un sur l'autre ; clavier : flèches pour déplacer le joueur sélectionné.
- **3 modèles** : A « Éditorial » (cartes portrait en escalier, grand titre), B « Composition officielle » (grille de portraits numérotés), C « Terrain tactique » (terrain en perspective, cartes joueurs). Inspirés de la mise en page des références, **sans** reprendre leurs marques, joueurs ou photos.
- **4 formats** : Story 9:16, Portrait 4:5, Carré 1:1, Paysage 16:9.
- **Style** : couleurs, fond (papier, clair, dégradé, uni, texture, Marée, pelouse, votre photo), logo, police, taille des noms, gardien en haut ou en bas, infos du match, signature BE+ affichable ou non.
- **Variantes** : « Enregistrer comme nouvelle variante » (ex. « Plan B, sans Hugo »).
- **Exports** : PNG, JPG (1080 px, ou 2160 px avec « HD »), PDF, SVG (plan tactique vectoriel), données (JSON, réimportables), vidéo animée de 6 s (MP4 sur Safari/iPhone, WebM ailleurs).
- **Partage** : partage du téléphone (avec l'image), lien à copier, WhatsApp, e-mail, QR code.
- **Envoi** à une personne (adresse e-mail de son compte), à un club (correspondants et encadrants du Vestiaire) ou à la rédaction, avec commentaire. Le destinataire **accepte**, **refuse** ou **propose une modification** (il enregistre sa version, que l'expéditeur peut ouvrir).
- **Confidentialité** (vérifiée par la base Supabase, pas seulement par l'écran) :
  - *Privée* : moi seul (et les personnes à qui je l'envoie) ;
  - *Staff du club* : correspondants et encadrants validés du club ;
  - *Club* : staff + membres validés du Vestiaire ;
  - *Rédaction* : l'équipe Casa Besports ;
  - *Publique* : visible par tous **seulement** quand elle est publiée **et** que l'heure de publication est passée. Avant, même avec le lien, elle reste invisible.

### Ce qui est simulé ou limité
- **Photos des joueurs** : rangées *dans* la composition (pas dans un dossier public), donc protégées par la confidentialité. Limite : 4 Mo par composition, soit une vingtaine de photos importées.
- **Pas de statistiques** : Casa Lineup n'affiche aucune note, aucun chiffre de joueur. Rien n'est inventé.
- **Vidéo** : animation simple (apparition des joueurs), pas un montage. Firefox exporte en WebM.
- **SVG** : seulement le plan tactique (les modèles A, B, C contiennent des effets que le SVG ne rend pas bien ; ils s'exportent en PNG, JPG ou PDF).
- **Sans compte** : tout fonctionne sur l'appareil (création, exports, partage de l'image), mais pas l'enregistrement en ligne, l'envoi ni le lien de partage.

---

## 4. Casa Studio — ce qui marche vraiment

- **4 ambiances** : Gold Edition, Classic Microphone, Studio Session, Warm Studio.
  Elles ont été **dessinées par nous** (fichier `outils/studio-fonds.html`, images dans `assets/studio/`) :
  Casa Besports en a tous les droits. Les photos de référence fournies n'ont **pas** été utilisées
  (on ne connaît pas leurs droits).
  Chaque épisode peut les remplacer par votre image ou une vidéo muette en boucle.
- **Lecteur** : lecture/pause, barre de progression, durée, -15 s / +30 s, volume, vitesse (0,75× à 2×),
  invité, émission, date, description, chapitres cliquables, transcription, sous-titres (vidéo),
  extraits courts partageables, « Ma liste » (épisodes enchaînés), « À écouter aussi », partage.
  Clavier : Espace (lecture), flèches (±5 s), Échap (fermer).
- **Forme d'onde** : calculée **en direct** à partir du son, seulement quand le navigateur le permet
  (fichier du site ou de Supabase). Sur iPhone, ou pour un fichier venant d'un autre site, elle est masquée :
  on n'affiche jamais une fausse onde.
- **Vidéo** : un épisode avec fichier vidéo se lit en vidéo (« Regarder »). Une image de micro n'est
  jamais présentée comme une vidéo.
- **Partenaire** : toujours affiché « Contenu sponsorisé ».
- **Publication programmée** : l'épisode n'apparaît qu'à la date choisie.
  ⚠️ Programmé veut dire *masqué de la page*, pas *secret* : la fiche est déjà dans le fichier du site.
  Ne programmez rien de confidentiel.

---

## 5. Droits et offre payante (préparation seulement)

`contenus/droits.js` liste chaque fonction et le niveau requis (`tous`, `compte`, `club`, `pro`, `admin`).
Aujourd'hui, tout ce qui était gratuit le reste. Pour réserver plus tard une fonction (ex. export HD aux
clubs PRO), il suffira de changer une ligne, **après votre décision**.

---

## 6. Vérifications faites

- SQL testé sur une base PostgreSQL 16 locale qui imite Supabase : chaque niveau de confidentialité
  (moi, autre compte, correspondant, membre du Vestiaire, rédaction, visiteur), envoi à un compte /
  un club / la rédaction, adresse inconnue, réponse d'une personne non destinataire (refusée),
  proposition de modification, relance du fichier.
- Navigateur (ordinateur et iPhone simulé) : lecture, saut +30 s, pause, onglets, fermeture ;
  exports PNG, JPG, PDF, SVG, JSON ; enregistrement sur l'appareil ; aucune erreur dans la console.
- Non testé ici (Supabase n'est pas joignable depuis l'environnement de développement) : enregistrement
  en ligne réel, envoi réel, notification push réelle. À tester après les étapes 1 et 2.
