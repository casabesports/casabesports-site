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
