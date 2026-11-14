/* ================================================================
   FONDS DE NAVIGATION — l'image derrière chaque page du site
   ================================================================
   Pour changer le fond d'une page :
   1. déposez votre photo dans le dossier assets/fonds/ (format .jpg, 1600 px de large suffit)
   2. remplacez le chemin de la page ci-dessous, par exemple :
        accueil: ['assets/fonds/ma-photo.jpg', 'center 40%'],
      Le 2e réglage cadre la photo : 'center 20%' montre le haut, 'center 80%' le bas.
   Pour qu'une page n'ait pas de photo : mettez null, par exemple  boutique: null,

   modeParDefaut = ce que voit un nouveau visiteur :
     'aucun'  fond uni (blanc ou noir)
     'photo'  les photos ci-dessous
     'lieux'  les illustrations des lieux (contenus/lieux.js)
   Chaque visiteur peut ensuite choisir dans « Mon espace › Apparence ».

   COULEURS
     photosEnCouleur = false  photos de fond en noir et blanc (signature) ; true = en couleur
     teinte = ''              couleur de fond de tout le site, par exemple '#1d4e89' (vide = blanc ou noir)
     Une page peut avoir sa propre couleur en 3e réglage : accueil: ['assets/…jpg', 'center 35%', '#1d4e89'],
   ================================================================ */
window.CASA_FONDS = {
  modeParDefaut: 'aucun',
  photosEnCouleur: false,
  teinte: '',
  pages: {
    accueil:      ['assets/img_51314cdd.jpg', 'center 35%'],
    actualites:   ['assets/img_11c2b62b.jpg', 'center 40%'],
    direct:       ['assets/a_photographe.jpg', 'center 30%'],
    videos:       ['assets/img_fe51d409.jpg', 'center 40%'],
    disciplines:  ['assets/a_bluesquad.jpg', 'center 30%'],
    clubs:        ['assets/a_feminines.jpg', 'center 40%'],
    joueurs:      ['assets/a_fceh.jpg', 'center 45%'],
    boutique:     ['assets/v_digosville.jpg', 'center 35%'],
    abonnements:  ['assets/img_4994dc60.jpg', 'center 50%'],
    compte:       ['assets/img_4994dc60.jpg', 'center 50%'],
    quotidien:    ['assets/a_fceh.jpg', 'center 45%'],
    clubhouse:    ['assets/a_benevoles.jpg', 'center 40%'],
    culture:      ['assets/hero.jpg', 'center 30%'],
    meteo:        ['assets/img_51314cdd.jpg', 'center 35%'],
    partenaires:  ['assets/img_11c2b62b.jpg', 'center 40%'],
    apropos:      ['assets/img_11c2b62b.jpg', 'center 40%'],
    contact:      ['assets/a_photographe.jpg', 'center 30%'],
    mentions:     ['assets/img_4994dc60.jpg', 'center 50%'],
    application:  ['assets/img_fe51d409.jpg', 'center 40%'],
    redaction:    ['assets/a_photographe.jpg', 'center 30%']
  }
};
