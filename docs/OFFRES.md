# Les offres de Casa Besports (grille du 22 novembre 2026)

Ce guide explique ce qui est vendu, à qui, à quel prix, et ce qu'il faut faire une fois la mise à jour en ligne.
Les prix se changent dans **Admin › Contenus du site**, sans toucher au code.

## 1. Où sont les prix

| Ce que vous vendez | Où le prix est écrit | Admin › Contenus du site |
|---|---|---|
| BE+, BE+ Famille, BE+ Jeunes, BE+ Papier, Gazette papier | `contenus/abonnements.js` | Abonnements |
| Club PRO, Club PRO + Analyse vidéo, Analyse vidéo Pro | `contenus/offres-pro.js` | Offres pro (payables en ligne) |
| Partenaires, à la carte, couverture des clubs, événements, Marées d'or, sportifs | `contenus/tarifs.js` | Tarifs pros (sur devis) |

Les deux premières lignes se paient en ligne (Stripe). La troisième se règle sur devis et facture : le bouton ouvre le formulaire de contact avec le sujet déjà rempli.

**Attention :** si vous aviez déjà enregistré la section « Abonnements » dans l'admin, c'est cette version en ligne qui s'affiche, avec les anciens prix. Ouvrez Admin › Contenus du site › Abonnements et vérifiez les prix (ou revenez à la version du fichier).

## 2. La grille

### Supporters et familles (TTC, sans engagement, l'annuel offre 2 mois)
| Formule | Mois | An | Pour qui |
|---|---|---|---|
| BE+ | 4,99 € | 49 € | Premium, Gazette en liseuse, alertes, −10 % boutique |
| BE+ Famille | 7,99 € | 79 € | 4 comptes : l'abonné ajoute 3 proches dans Mon espace |
| BE+ Jeunes | 2,49 € | 24 € | Moins de 26 ans, étudiants, apprentis (case à cocher) |
| BE+ Papier | 12,90 € | 129 € | BE+ et la Gazette livrée dans la Manche |
| La Gazette · Papier | 9,90 € | 99 € | Le magazine seul, pour qui ne lit pas sur écran |

La Gazette numérique seule et la formule Papier + Numérique ne sont plus vendues (`masque: true`). Leurs abonnés gardent leur accès.

### Clubs (TTC)
- Club Essentiel : gratuit. Fiche club, Vestiaire, causeries, Casa Line Up, résultats.
- **Club PRO : 12,90 € par mois ou 129 € par an.** Badge sur la fiche du club, vitrine des sponsors, message à tout le club en notification (5 par jour au plus), export des présences de la saison, un article de présentation par saison (à faire par la rédaction).
- **Club PRO + Analyse vidéo : 27,90 € par mois ou 279 € par an.**
- Analyse vidéo Pro seule : 19,90 € par mois ou 199 € par an (inchangé).
- Couverture : reportage 120 €, résumé vidéo 220 €, portrait vidéo 290 €, pack saison 690 €.

### Commerces et entreprises (HT, engagement d'un an)
- Partenaire Club 39 € par mois, Or 99 €, Platinum 249 €. Tarif fondateur : −30 % la première année pour les 10 premiers.
- À la carte : page Gazette 150 €, demi-page 90 €, « Présenté par » 120 € le mois, post Instagram 60 €, visuel 60 €, vidéo d'une minute 450 €.
- Les partenaires actuels (OlistO, Le Narval, Driver50) gardent les conditions convenues avec eux.

### Collectivités, Marées d'or, sportifs
- Événement : demi-journée 350 € HT, journée 650 € HT, convention de saison dès 2 400 € HT par an.
- Marées d'or : parrain d'un trophée 300 € HT, partenaire principal 1 500 € HT, entrée 8 € TTC (gratuite pour les abonnés BE+ à l'année).
- Sportifs : profil gratuit, CV certifié 19 €, vidéo de recrutement 79 €.

## 3. Pourquoi ces prix (temps de travail et matériel)

Repère du marché : un vidéaste indépendant facture en moyenne 160 € la journée (175 € confirmé, 259 € senior, Codeur.com, novembre 2026).

| Prestation | Temps estimé | Prix | Revenu horaire |
|---|---|---|---|
| Reportage d'un match | 2 h de match, 1 h de trajet, 2 h photos et article | 120 € | environ 24 € de l'heure |
| Résumé vidéo | 2 h de tournage, 1 h de trajet, 4 h de montage | 220 € | environ 31 € de l'heure |
| Portrait vidéo | 3 h de tournage, 5 h de montage | 290 € | environ 36 € de l'heure |
| Vidéo d'une minute pour un commerce | une demi-journée et 6 h de montage | 450 € HT | environ 45 € de l'heure |

Ces durées sont des estimations, à corriger avec vos vrais temps après les premières prestations.

**Matériel à prévoir** (estimation, à vérifier chez le vendeur) : un appareil hybride qui filme, un micro sans fil, un stabilisateur, un trépied, des cartes mémoire. Le logiciel de montage DaVinci Resolve existe en version gratuite. Ces achats sont compris dans les prix ci-dessus si l'on fait environ cinq vidéos par mois pendant deux ans.

**La Gazette papier** coûte cher à fabriquer et à envoyer : une Lettre verte de 20 g coûte 1,52 € en 2026 et 1,67 € en 2027, et un magazine de 31 pages pèse bien plus. L'impression à l'unité en couleur démarre autour de 8,50 $ par exemplaire chez Lulu. C'est pourquoi la Gazette papier passe de 6,90 € à 9,90 €. **Demandez un devis à un imprimeur local et à La Poste (tarif presse ou Destineo) avant le premier envoi** : si l'impression et l'envoi d'un numéro dépassent 7 €, il faut remonter le prix.

## 4. Ce qu'il faut faire après la mise en ligne

1. **Supabase › SQL Editor** : lancer `supabase/offres.sql` (une fois). Sans lui, BE+ Famille et Club PRO s'affichent mais l'ajout des proches et l'activation du club ne marchent pas.
2. **Supabase › Edge Functions** : redéployer `paiement` (BE+ Jeunes, formules retirées) et `notifications` (message à tout le club).
3. Vérifier les prix dans Admin › Contenus du site › Abonnements (voir l'attention plus haut).
4. Faire un essai en mode test Stripe : un BE+ Famille (ajouter un proche dans Mon espace), un Club PRO (l'activer dans le Vestiaire du club).

## 5. Comment ça marche

- **BE+ Famille** : après le paiement, l'abonné ouvre Mon espace › Ma famille BE+ et ajoute jusqu'à 3 adresses e-mail. Chaque proche profite de BE+ dès qu'il se connecte avec cette adresse. Il peut se retirer seul.
- **Club PRO** : le correspondant ou un encadrant du club s'abonne avec son compte, puis ouvre le Vestiaire du club et touche « Activer Club PRO ». Un abonnement vaut pour un club. Quand l'abonnement s'arrête, le badge et la vitrine disparaissent tout seuls.
- **BE+ Jeunes** : la personne coche une case qui certifie son âge ou son statut. Rien n'est vérifié automatiquement : vous pouvez demander un justificatif.

Fichiers : `js/offres.js` (Club PRO, Famille), `supabase/offres.sql`, `supabase/functions/notifications` (action `club`), `supabase/functions/paiement`.
