/*
 * Casa Besports — les tarifs affichés pour les professionnels (pages Partenaires et Casa PRO).
 * Ces prestations se règlent sur devis et facture (pas de paiement en ligne) : le bouton ouvre le formulaire de contact,
 * sujet déjà rempli. Les abonnements payables en ligne sont dans abonnements.js et offres-pro.js.
 * prix : texte affiché tel quel (« 120 € ») · unite : « HT », « TTC » ou vide · d : précision sous le titre.
 * Grille du 2026-11-22, calculée sur le temps de travail et le matériel (docs/OFFRES.md).
 * Modifiable depuis l’espace administrateur (Contenus du site › Tarifs pros). Une version modifiée en ligne passe avant ce fichier.
 */
window.CASA_TARIFS = {
  "partenaires": {
    "titre": "Devenir partenaire",
    "intro": "Votre commerce au cœur du sport local : sur le site, dans l’application, dans La Gazette et sur nos réseaux. Engagement d’un an, paiement au mois ou à l’année (2 mois offerts).",
    "fondateur": "Tarif fondateur : −30 % la première année pour les 10 premiers partenaires.",
    "niveaux": [
      {
        "id": "Club",
        "nom": "Partenaire Club",
        "mois": "39 €",
        "an": "390 €",
        "unite": "HT",
        "perks": [
          "Fiche complète : adresse, horaires, téléphone, liens",
          "Votre logo sur la page Partenaires",
          "Liens suivis vers votre site et votre application",
          "Votre avantage affiché aux abonnés BE+",
          "Une mention par mois dans La Gazette"
        ]
      },
      {
        "id": "Or",
        "nom": "Partenaire Or",
        "mois": "99 €",
        "an": "990 €",
        "unite": "HT",
        "recommande": true,
        "perks": [
          "Tout le niveau Club",
          "« Présenté par » sur les résultats d’un sport",
          "Encart dans les articles de ce sport",
          "Une demi-page dans La Gazette chaque trimestre",
          "Une publication Instagram par mois"
        ]
      },
      {
        "id": "Platinum",
        "nom": "Partenaire Platinum",
        "mois": "249 €",
        "an": "2 490 €",
        "unite": "HT",
        "perks": [
          "Tout le niveau Or, sur tous les sports",
          "Seul partenaire de votre secteur",
          "Une page pleine dans La Gazette chaque mois",
          "Une vidéo de marque d’une minute par an",
          "Un trophée des Marées d’or à votre nom"
        ]
      }
    ],
    "carte": [
      { "t": "Page pleine dans La Gazette", "d": "Un numéro, 31 pages, liseuse et papier", "prix": "150 €", "unite": "HT" },
      { "t": "Demi-page dans La Gazette", "d": "", "prix": "90 €", "unite": "HT" },
      { "t": "« Présenté par » les résultats du week-end", "d": "Un sport, pendant un mois", "prix": "120 €", "unite": "HT" },
      { "t": "Publication Instagram sponsorisée", "d": "Post ou story dans la charte BE+", "prix": "60 €", "unite": "HT" },
      { "t": "Création de votre visuel publicitaire", "d": "Encart Gazette ou bannière du site", "prix": "60 €", "unite": "HT" },
      { "t": "Vidéo promotionnelle d’une minute", "d": "Une demi-journée de tournage et le montage", "prix": "450 €", "unite": "HT" }
    ]
  },
  "clubs": {
    "titre": "Couverture média du club",
    "intro": "Des contenus prêts à partager à vos licenciés et à vos sponsors.",
    "lignes": [
      { "t": "Reportage d’un match", "d": "Article et 15 photos, publiés sur le site et cédés au club", "prix": "120 €", "unite": "TTC" },
      { "t": "Résumé vidéo de 2 à 3 minutes", "d": "Tournage du match et montage", "prix": "220 €", "unite": "TTC" },
      { "t": "Portrait vidéo d’une minute trente", "d": "Club, joueur, bénévole : pour les réseaux et les sponsors", "prix": "290 €", "unite": "TTC" },
      { "t": "Pack saison", "d": "4 reportages, 1 résumé vidéo et 1 portrait (au lieu de 990 €)", "prix": "690 €", "unite": "TTC" }
    ],
    "astuce": "Un commerce partenaire peut offrir Club PRO ou le pack saison à « son » club : son logo apparaît alors dans la vitrine du club."
  },
  "collectivites": {
    "titre": "Couverture d’événements",
    "intro": "Communes, Agglo, offices des sports, comités, organisateurs de courses et de tournois.",
    "lignes": [
      { "t": "Demi-journée", "d": "Article, galerie photo, 20 photos HD cédées", "prix": "350 €", "unite": "HT" },
      { "t": "Journée", "d": "Tout la demi-journée, et un résumé vidéo de 2 minutes", "prix": "650 €", "unite": "HT" },
      { "t": "Convention de saison", "d": "Agenda, 6 reportages, une page Gazette par mois, résultats de la commune", "prix": "dès 2 400 €", "unite": "HT par an" }
    ]
  },
  "marees": {
    "titre": "Les Marées d’or",
    "intro": "La soirée des trophées du sport du Cotentin.",
    "lignes": [
      { "t": "Parrain d’un trophée", "d": "Le trophée porte votre nom, vous le remettez sur scène, 2 places", "prix": "300 €", "unite": "HT" },
      { "t": "Partenaire principal de la soirée", "d": "Votre nom sur l’affiche, la page des trophées et la vidéo, 10 places", "prix": "1 500 €", "unite": "HT" },
      { "t": "Entrée du public", "d": "Gratuite pour les abonnés BE+ à l’année, selon la place dans la salle", "prix": "8 €", "unite": "TTC" }
    ]
  },
  "sportifs": {
    "titre": "Pour les sportifs",
    "intro": "Votre parcours, mis en forme.",
    "lignes": [
      { "t": "Profil joueur", "d": "Fiche reliée à votre club, avec votre accord (et celui d’un parent pour les mineurs)", "prix": "Gratuit", "unite": "" },
      { "t": "CV Casa certifié", "d": "Votre CV dans la charte du média, relu et certifié par l’équipe", "prix": "19 €", "unite": "TTC" },
      { "t": "Vidéo de recrutement", "d": "2 minutes de vos meilleures actions, montées à partir de vos vidéos de match", "prix": "79 €", "unite": "TTC" }
    ]
  }
};
