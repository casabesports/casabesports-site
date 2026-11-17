# Casa Besports — audit, architecture et plan des phases 2 à 4

Rédigé le 17 novembre 2026, avec la phase 1 (Casa Lineup et Casa Studio, voir `docs/CASA-LINEUP-STUDIO.md`).
Chaque fonction est classée : **✅ réellement développée**, **🟡 simulée ou partielle**, **🔒 demande des ressources en plus**
(budget, données, matériel, accord d'un tiers).

---

## 1. Audit de l'existant (ce qui a été vérifié dans le code)

| Sujet | Constat | Conséquence |
|---|---|---|
| Hébergement | Site statique sur Cloudflare Pages, construit par `outils/build.sh`, déployé à chaque fusion sur `main`. | Pas de serveur à maintenir ; tout calcul lourd se fait sur l'appareil ou dans Supabase. |
| Taille | `index.html` ≈ 1 Mo (gabarit de toutes les pages), `js/app.js` ≈ 450 Ko. Les gros modules (3D, carte, AR, admin, rédaction) sont chargés à la demande. | Les nouveaux modules suivent la même règle : `js/lineup.js` et `js/studio.js` ne sont téléchargés qu'à l'ouverture. |
| Contenus | Fichiers `contenus/*.js` modifiés depuis l'admin. | Tout ce qui est dans ces fichiers est **public** (y compris un épisode programmé). Les données privées vont dans Supabase. |
| Comptes et droits | Supabase (UE) : comptes, rôles `admin` / `redacteur` / `correspondant` / `collaborateur` (table `equipe`), Vestiaire (staff et membres validés par club), règles RLS par table. | Casa Lineup s'appuie sur ces rôles, sans en créer de nouveaux. |
| Briques réutilisables | « Ma compo » en AR (`js/realite-augmentee.js`), Analyse vidéo Pro (`js/analyse-video.js`, vidéo traitée sur l'appareil), page podcast, notifications Web Push, Vestiaire, paiements Stripe (mode test). | Les phases 2 à 4 doivent les prolonger plutôt que les refaire. |
| Limites d'environnement | Supabase et les sites des fédérations FFF/FFBB ne sont pas joignables depuis l'environnement de développement de Claude. | Les tests « en ligne » (enregistrement réel, notification réelle) se font sur le vrai site après fusion. |

---

## 2. Architecture

```
Navigateur (site ou application installée)
 ├─ js/app.js ............ pages, navigation, comptes (CasaAuth), podcast
 ├─ js/lineup.js ......... Casa Lineup : éditeur, rendu Canvas commun aperçu/export, exports, partage
 ├─ js/studio.js ......... Casa Studio : lecteur plein écran, onde calculée en direct (Web Audio)
 ├─ contenus/droits.js ... niveau requis par fonction (préparé, rien de bloqué)
 └─ assets/studio/ ....... 4 ambiances dessinées par Casa Besports (portrait + paysage)
Supabase (UE)
 ├─ lineups / lineup_envois (supabase/lineups.sql) + règles RLS
 ├─ fonctions SQL : lineup_envoyer, lineup_repondre, lineup_recues, lineup_a_traiter, lineup_destinataires
 ├─ Storage « site » : fichiers podcast (audio, vidéo, 50 Mo max)
 └─ Edge Function « notifications » : action « lineup » (prévient destinataire / expéditeur, une seule fois par étape)
Cloudflare Pages : fichiers statiques, en-têtes de sécurité (_headers)
```

**Principes**
1. Un seul moteur de dessin (Canvas 2D) pour l'aperçu et l'export : ce qu'on voit est ce qu'on exporte.
2. La confidentialité est vérifiée **par la base** (RLS), jamais seulement par l'écran.
3. Les photos de joueurs restent dans la composition (pas de dossier public).
4. Sans compte ou sans connexion à la base, l'outil reste utilisable sur l'appareil.
5. Aucun chiffre inventé : une donnée absente s'affiche « Non disponible ».

---

## 3. Stockage des médias

| Média | Où aujourd'hui | Limite | Quand changer | Option suivante |
|---|---|---|---|---|
| Portraits d'une composition | Dans la composition (base Supabase) | 4 Mo par composition | Si les clubs importent des effectifs entiers avec photos | Dossier Storage **privé** `lineups/` avec liens signés |
| Exports (PNG, PDF, vidéo) | Sur l'appareil de la personne | — | — | Rien à stocker |
| Audio podcast | Storage Supabase « site » | 50 Mo par fichier ; offre gratuite Supabase : 1 Go de fichiers au total | Au-delà d'une quinzaine d'heures d'audio | Supabase Pro (≈ 25 $/mois, 100 Go) ou Cloudflare R2 (10 Go gratuits, puis ≈ 0,015 $/Go/mois, sortie gratuite) |
| Vidéo podcast | Storage Supabase « site » | 50 Mo (≈ 5 min en 720p) | Dès les émissions vidéo longues | Cloudflare Stream (≈ 5 $ / 1 000 min stockées + 1 $ / 1 000 min regardées, lecture adaptée au débit) |
| Vidéos de match (Analyse vidéo Pro, VAR) | Sur l'appareil uniquement | Mémoire de l'appareil | Si le club veut partager une analyse | Stockage privé par club, avec accord écrit (images de mineurs) |

Prix indicatifs relevés en novembre 2026 : **à revérifier au moment de souscrire.**
Cloudflare Pages refuse les fichiers de plus de 25 Mo dans le site lui-même : aucune vidéo ne doit être mise dans le dépôt.

---

## 4. Déploiement sur Cloudflare (rappel, voir aussi `docs/CLOUDFLARE-PAGES.md`)

1. La PR est relue **sur l'aperçu** que Cloudflare crée pour la branche (lien dans la PR sur GitHub).
2. Fusion de la PR = mise en ligne automatique sur https://casabesports.pages.dev (1 à 2 minutes).
3. Puis les étapes Supabase du guide (SQL, fonction). L'ordre n'est pas bloquant : le site sait fonctionner sans.
4. Retour en arrière : Cloudflare › Pages › Deployments › déploiement précédent › « Rollback ».

Rien n'est mis en production sans votre fusion.

---

## 5. Sécurité et performance (contrôles faits pour la phase 1)

- **Accès** : RLS sur `lineups` et `lineup_envois` ; le propriétaire est forcé côté base ; un envoi n'est lisible que par l'expéditeur, le destinataire et l'admin ; une réponse n'est acceptée que du destinataire ; 60 envois par heure maximum par personne ; la liste des comptes à prévenir n'est lisible que par la fonction serveur.
- **Publication** : une composition publique n'est visible qu'une fois publiée **et** l'heure passée.
- **Saisies** : textes et tailles bornés (base et écran) ; les fichiers importés sont relus et redessinés (une image piégée ne passe pas telle quelle).
- **Liens externes** : partenaire marqué « Contenu sponsorisé », liens ouverts avec `noopener`.
- **Poids** : modules chargés à la demande ; ambiances en JPEG 110 à 280 Ko ; onde calculée seulement pendant la lecture et quand le lecteur est visible.
- **Accessibilité** : utilisable au clavier (onglets, lecture, déplacement des joueurs), contrastes Marée, boutons de 40 px minimum sur téléphone.

---

## 6. Phases 2 à 4 — plan priorisé

### Phase 2 — CASA MANAGER (gestion d'équipe) · priorité haute
**But** : effectif, disponibilités, convocations, temps de jeu, reliés à Casa Lineup et au Vestiaire.
- ✅ possible tout de suite : effectif du club (fiches joueurs), convocation = composition envoyée au Vestiaire, présences (déjà dans le Vestiaire), temps de jeu saisi à la main après le match.
- 🟡 : suggestions de composition à partir des disponibilités (règles simples, pas d'« IA »).
- 🔒 : licences et feuilles de match officielles (pas d'accès automatique FFF : refus constaté depuis le cloud).
- **Dépend de** : phase 1 fusionnée, Vestiaire utilisé par au moins un club pilote.
- **Difficulté** : moyenne (2 à 3 PR). **Coût** : aucun en plus (Supabase gratuit suffit pour quelques clubs).
- **Validé quand** : un club pilote prépare un match complet (convocation → réponses → composition → publication) sans aide.

### Phase 3 — CASA ANALYTICS (statistiques) · priorité moyenne
**But** : tableaux et graphiques par joueur, équipe, saison.
- ✅ : statistiques **saisies** par le club (buts, passes, minutes, cartons) et tirées des actions marquées dans Analyse vidéo Pro ; classements déjà importés (handball FFHB).
- 🟡 : comparaisons et tendances calculées sur ces seules données.
- 🔒 : données automatiques (tracking, xG, distances parcourues) : fournisseur payant ou matériel (capteurs GPS) ; **jamais** remplacées par des chiffres inventés. Une case vide affiche « Non disponible ».
- **Dépend de** : phase 2 (effectif et feuilles de match), accord des joueurs (données personnelles ; mineurs : accord parental).
- **Difficulté** : moyenne. **Coût** : 0 € en saisie manuelle ; fournisseur de données : sur devis (plusieurs centaines d'euros par mois au minimum).
- **Validé quand** : chaque chiffre affiché peut être relié à sa source (saisie, vidéo, fédération).

### Phase 3 bis — CASA VIDEO REVIEW — Analyse assistée (« VAR ») · priorité moyenne
**Nom affiché** : « CASA VIDEO REVIEW — Analyse assistée ». Jamais « VAR officielle » : ce n'est pas un arbitrage.
- ✅ (repris d'Analyse vidéo Pro) : ralenti, image par image, dessin, lignes et zones tracées à la main, marquage des actions, captures.
- 🟡 : **ligne de hors-jeu tracée à la main** avec correction de perspective à partir de 4 points du terrain désignés par l'utilisateur. Le résultat est une **aide visuelle** avec une marge d'erreur affichée.
- 🔒 : hors-jeu automatique ou décision fiable : il faut plusieurs caméras synchronisées et calibrées (ou une caméra haute et fixe), un suivi des joueurs et du ballon, et une puissance de calcul serveur.
- **Limite technique précise** : avec **une seule caméra** de bord de terrain, on ne connaît pas la hauteur ni la position exacte des pieds dans la profondeur, l'image peut être floue au moment de la passe (25 à 30 images/s = 33 à 40 ms entre deux images, soit 30 à 40 cm de course d'un joueur) : un hors-jeu de quelques centimètres **ne peut pas** être tranché. L'outil le dira.
- **Dépend de** : Analyse vidéo Pro (déjà fusionnée). **Difficulté** : élevée pour la perspective. **Coût** : 0 € sur l'appareil ; option IA décrite dans `docs/ANALYSE-VIDEO-PRO.md`.
- **Validé quand** : sur une vidéo test avec mesures connues, l'erreur affichée correspond à l'erreur réelle.

### Phase 4 — 3D et réalité augmentée · priorité plus basse
- ✅ déjà en ligne : « Ma compo » en AR (caméra, terrain, commentaire, vidéo, angles TV).
- ✅ prochaine étape simple : ouvrir une composition Casa Lineup dans « Ma compo AR » (même format de joueurs et de positions).
- 🟡 : animation tactique 3D (déplacements dessinés à la main, rejoués en 3D).
- 🔒 : avatars ressemblants des joueurs (photogrammétrie, droit à l'image), stades en 3D réels (modèles payants ou à faire réaliser), AR partagée à plusieurs (serveur temps réel).
- **Dépend de** : phase 1 (format de composition). **Difficulté** : moyenne à élevée. **Coût** : 0 € pour l'animation ; modèles 3D sur devis.
- **Validé quand** : une composition faite dans Casa Lineup s'ouvre en AR sur iPhone et Android récents en moins de 5 secondes.

### Ordre conseillé
1. Fusion phase 1 + tests réels avec un club pilote.
2. Manager (phase 2).
3. Video Review (repose sur l'existant, forte valeur pour les clubs) puis Analytics.
4. Lien Lineup → AR, puis 3D.

---

## 7. Récapitulatif : réel, simulé, à financer (phase 1)

| | Réel ✅ | Simulé / partiel 🟡 | Ressources en plus 🔒 |
|---|---|---|---|
| Casa Lineup | Création, 3 modèles, 4 formats, tactique, variantes, exports PNG/JPG/PDF/SVG/JSON/vidéo, partage, envoi, réponses, confidentialité en base | Vidéo = animation simple (pas un montage), SVG = plan tactique seulement | Photos en dossier privé si plus de ~20 photos par composition |
| Casa Studio | Lecteur audio/vidéo, 4 ambiances maison, chapitres, transcription, sous-titres, extraits, liste, recommandations, programmation, partenaire signalé | Onde visible seulement quand le navigateur le permet (pas sur iPhone) ; « recommandations » = même émission / club / invité, pas d'algorithme | Hébergement vidéo longue durée (Cloudflare Stream ou Supabase Pro) ; transcription automatique (service payant) |
| Offre payante | Fichier des droits prêt | Rien de bloqué | Votre décision sur ce qui deviendrait payant |
