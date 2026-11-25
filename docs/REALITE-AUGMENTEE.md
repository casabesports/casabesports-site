# Réalité augmentée : « Ma compo en AR »

## Ce que voit le visiteur

- **Neuf disciplines** : football, rugby à XV, basket, handball, volley-ball, water-polo, tennis, roller hockey, athlétisme.
- **Le vrai lieu** : le site cherche sur OpenStreetMap le vrai terrain de la discipline le plus proche de la commune de l'équipe (stade, gymnase, piscine, court, piste), l'oriente comme en vrai et l'entoure :
  - des **photos aériennes IGN** (ou du plan IGN, ou du plan OpenStreetMap), comme la carte « Territoire » ;
  - des **bâtiments réels** du quartier, en 3D à leur hauteur ;
  - du **soleil à sa vraie position** selon l'heure (ombres réelles ; la nuit, les projecteurs s'allument).
- **Un stade réaliste** : tribune couverte avec sièges et public, main courante, bancs de touche, pylônes d'éclairage, buts avec filets. Pour le basket, le hand, le volley et le roller : un gymnase vu en coupe, avec gradins. Pour le water-polo : une piscine avec bassin, bouées et buts flottants. Option « Grand stade 4 tribunes ».
- **Le ballon ou la balle** de chaque sport (palet pour le roller hockey, poids pour l'athlétisme), déplaçable au doigt.
- **Le règlement** de chaque discipline (bouton « Règlement », et carte « Règlements » du menu).
- **Sur téléphone** : bouton « Caméra » ou « Placer sur une surface (AR) » : la carte disparaît, et le terrain, les joueurs et le ballon se posent directement sur ce que filme la caméra (votre table, le sol), avec leur ombre.

## Ce que vous pouvez modifier

| Fichier | Contenu |
|---|---|
| `contenus/stades.js` | Communes proposées, commune de chaque équipe, stades fixés à la main si la recherche automatique ne tombe pas juste |
| `contenus/reglements.js` | Textes des règlements |
| `js/realite-augmentee.js` | Le moteur 3D (à ne modifier qu'avec Claude) |

Exemple pour fixer un stade précis dans `contenus/stades.js` :

```js
exacts: [
  { nom: 'Stade de mon club', sport: 'football', lat: 49.64, lon: -1.66, angle: 20, longueur: 105, largeur: 68 } // exemple : remplacez par les vraies valeurs
]
```

`angle` = orientation du grand côté du terrain par rapport au nord, en degrés. Les coordonnées se lisent sur geoportail.gouv.fr (clic droit > « Adresse / coordonnées du lieu »).

## Sources et mentions

- Photos aériennes et plan : IGN, Géoplateforme (libre, sans clé). Si une photo IGN ne se charge pas, l'imagerie Esri prend le relais.
- Terrains et bâtiments : © contributeurs OpenStreetMap (serveurs publics Overpass). Résultats gardés 30 jours sur l'appareil du visiteur.
- Les mentions s'affichent en bas à droite de la vue 3D.

## Piloter avec la main (sans toucher l'écran)

Bouton **« ✋ Main »** dans Ma compo AR. La caméra s'allume (caméra arrière par défaut) et le téléphone suit la main posée devant l'objectif.

| Geste | Effet |
|---|---|
| Montrer la main | Le joueur visé par le bout de l'index grossit légèrement |
| Pincer (pouce + index) sur un joueur ou le ballon | Il est saisi et soulevé ; il suit la main |
| Ouvrir les doigts | Le joueur est posé (petit rebond) et sa position est enregistrée |
| Pincer dans le vide puis glisser | Le terrain tourne |
| Pincer dans le vide puis avancer / reculer la main | Zoom / dézoom |
| Deux mains qui pincent (téléphone posé) | Écarter = zoomer, rapprocher = dézoomer, tourner = faire pivoter |

- **« 🔄 Caméra »** passe à la caméra avant : téléphone posé contre un objet ou ordinateur portable, pour jouer avec les deux mains.
- **Réalisme** : la vraie main filmée passe *devant* les joueurs (elle les cache comme dans la réalité), et en mode caméra les joueurs prennent la couleur et la luminosité de la pièce.
- **Le doigt marche toujours** : le pilotage à la main s'ajoute au tactile, il ne le remplace pas.
- **Vie privée** : le suivi de la main (MediaPipe de Google, licence Apache 2.0) tourne entièrement sur l'appareil. Aucune image n'est envoyée. Fichiers dans `js/vendor/mediapipe-0.10.21/` (environ 17 Mo, téléchargés une seule fois, seulement quand on touche « ✋ Main »).
- **Appareils** : iPhone avec iOS 16.4 ou plus récent (Safari ou appli installée), Android récent (Chrome), ordinateur avec webcam (Chrome, Edge, Safari). Sur les téléphones anciens le suivi est plus lent (moins d'images par seconde) mais reste utilisable.
- **Limites** : bonne lumière nécessaire ; main à 30-60 cm de la caméra ; avec le téléphone tenu d'une main, on ne pilote qu'avec l'autre main (le zoom se fait alors en avançant la main). Ce n'est pas de la « vraie » AR ancrée dans la pièce sur iPhone : Safari ne donne pas accès à ARKit depuis un site web.
- Code : `js/ar-main.js` (suivi de la main, dessin de la main devant la 3D) et la partie « Pilotage à la main » de `js/realite-augmentee.js` (gestes).
