/* ================================================================
   RETOUCHES — textes et images modifiés directement sur le site
   Le plus simple : connecté en administrateur, bouton « ✎ Retoucher » en bas à gauche,
   puis cliquez sur un texte ou une image de la page. Tout se gère aussi dans
   Espace admin › Contenus du site › Retouches des pages.
   - textes : avant (texte d'origine, exactement), apres (nouveau texte), apresEn (version anglaise, facultatif),
              page (identifiant de la page, ex. clubhouse ; vide = toutes les pages)
   - images : avant (adresse de l'image d'origine, ex. assets/hero.jpg), apres (nouvelle image), page
   ================================================================ */
window.CASA_RETOUCHES = {
  textes: [],
  images: []
};
