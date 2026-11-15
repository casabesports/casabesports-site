# Sortie de l'application Casa Besports

L'application Casa Besports est une **application web installable** (on dit aussi « PWA »).
Elle s'installe depuis le site, sans passer par l'App Store ni Google Play, et se met à jour toute seule à chaque mise en ligne.

## Ce qui est en place

| Élément | Fichier | Rôle |
|---|---|---|
| Fiche de l'application | `manifest.webmanifest` | Nom (Casa Besports, « BE+ » sous l'icône), couleurs noires, raccourcis Scores / Actus / Club House |
| Icônes BE+ | `assets/app/` | Icône Android (192 et 512), icône adaptative, icône iPhone (180), favicon |
| Service worker | `sw.js` | Rend l'appli installable, ouverture rapide, lecture hors ligne des pages déjà vues |
| Page « Pas de connexion » | `hors-ligne.html` | Affichée si on ouvre une page jamais vue sans réseau |
| Bouton « Installer l'application » | `js/pwa.js` + page L'application | Android / ordinateur : fenêtre d'installation. iPhone : affiche les étapes Safari |

Les connexions, paiements, messages et données en ligne (Supabase, Stripe, météo) ne sont **jamais** gardés en copie : ils passent toujours par internet.

Pour refaire les icônes à partir d'un autre logo : demander à Claude (script de rendu dans le fil « Préparer la sortie de l'application »).

## Comment les gens installent l'appli

- **Android (Chrome)** : ouvrir le site, toucher « Installer l'application » sur la page L'application (ou la bannière de Chrome).
- **iPhone (Safari)** : ouvrir le site, bouton Partager, puis « Sur l'écran d'accueil ».
- **Ordinateur (Chrome / Edge)** : icône d'installation dans la barre d'adresse.

Lien à partager : `https://casabesports.pages.dev/#/app` (puis `https://casabesports.fr/#/app` une fois le domaine branché).

## Checklist de sortie

### Bloquants avant d'annoncer l'appli au public

- [ ] **Paiements Stripe en réel** : aujourd'hui en mode TEST, aucun vrai paiement n'est encaissé. Il faut activer le compte Stripe (SIRET, adresse du siège, IBAN de la société, pièce d'identité) puis refaire la clé `sk_live_`, le webhook et le portail client. Voir `docs/PAIEMENTS.md`.
- [ ] **SIRET et adresse du siège** : la page Informations légales affiche encore `[SIRET]` et « Siège : hybride ». Obligatoire pour un site qui vend. À compléter dans `contenus/legal.js` (ou l'admin).
- [ ] **E-mails (Brevo)** : sans Brevo, les e-mails de connexion utilisent le service limité de Supabase (quelques envois par heure). Avec beaucoup de nouveaux inscrits le jour de la sortie, des gens ne recevront pas leur lien. Voir `docs/ESPACE-ADMIN.md`, partie Brevo.
- [ ] **Domaine casabesports.fr** : l'appli fonctionne sur casabesports.pages.dev, mais il vaut mieux l'annoncer avec la bonne adresse. Attention : une appli installée reste liée à l'adresse où elle a été installée. Ceux qui l'installent sur pages.dev devront la réinstaller après la bascule vers casabesports.fr. Voir `docs/MIGRATION-CASABESPORTS-FR.md`.

### Conseillé

- [ ] SMS (Twilio) si la connexion par code SMS est proposée.
- [ ] Tester l'installation sur un vrai iPhone et un vrai Android (installation, ouverture hors ligne, connexion, paiement test).
- [ ] Supabase : ajouter `https://casabesports.fr/**` dans les Redirect URLs le jour de la bascule du domaine.

## Et l'App Store / Google Play ?

Ce n'est pas obligatoire : l'appli web installable suffit pour démarrer. Les stores apportent surtout de la visibilité et de la confiance, mais avec des contraintes :

| | Google Play | App Store (Apple) |
|---|---|---|
| Coût | 25 $ une fois | 99 $ par an |
| Compte | Compte « organisation » conseillé (numéro D-U-N-S gratuit, quelques jours). Un compte personnel doit d'abord faire tester l'appli par 12 personnes pendant 14 jours | Compte « organisation » avec numéro D-U-N-S |
| Fabrication | Faisable à partir du site actuel (outil gratuit PWABuilder, format « TWA ») | Plus difficile : Apple refuse souvent les applis qui ne sont qu'un site emballé. Il faut des fonctions propres à l'appli (notifications, etc.) |
| Abonnements Casa B+ / Gazette | Google impose en principe son propre système de paiement pour les abonnements numériques vendus dans l'appli | Apple impose l'achat intégré (commission 15 à 30 %) pour les abonnements numériques. La boutique (vêtements) peut rester sur Stripe |
| Suppression de compte | Obligatoire depuis l'appli et sur une page web | Obligatoire depuis l'appli |

Ordre conseillé : 1) sortir l'appli web installable, 2) régler les bloquants ci-dessus, 3) Google Play, 4) App Store seulement si l'appli a des fonctions propres et qu'on a réglé la question des abonnements.
