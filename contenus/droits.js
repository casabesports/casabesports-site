/*
 * Casa Besports — qui peut utiliser quoi (préparation d'une éventuelle offre payante, RIEN n'est bloqué aujourd'hui).
 * Niveaux, du plus ouvert au plus restreint :
 *   'tous'   : tout le monde, même sans compte
 *   'compte' : personne connectée (compte gratuit)
 *   'club'   : correspondant de club ou encadrant validé dans le Vestiaire
 *   'pro'    : abonné à une offre Casa PRO
 *   'admin'  : administrateur du site
 * Pour réserver plus tard une fonction (par exemple l'export vidéo aux clubs PRO), il suffira de changer son niveau ici,
 * APRÈS validation : une fonction aujourd'hui gratuite ne doit pas devenir payante sans décision de votre part.
 * Les droits sur les DONNÉES (qui voit une composition, qui répond à un envoi) sont vérifiés par Supabase, pas ici.
 */
window.CASA_DROITS = {
  // Casa Lineup (compositions)
  'lineup.creer': 'tous',              // composer, personnaliser, aperçu
  'lineup.exporter': 'tous',           // PNG, JPG, PDF, SVG, données
  'lineup.exporter_hd': 'tous',        // export en double définition (2160 px)
  'lineup.video': 'tous',              // vidéo animée
  'lineup.enregistrer_en_ligne': 'compte',
  'lineup.envoyer': 'compte',          // envoi à un utilisateur, un club ou la rédaction
  'lineup.publier': 'compte',
  // Casa Studio (podcast et vidéos)
  'studio.ecouter': 'tous',
  'studio.publier': 'admin'            // publication depuis l'espace administrateur
};
window.CasaDroits = (function () {
  var ORDRE = ['tous', 'compte', 'club', 'pro', 'admin'];
  // qui : { connecte: bool, club: bool, pro: bool, admin: bool }
  function niveauDe(qui) { qui = qui || {}; return qui.admin ? 4 : qui.pro ? 3 : qui.club ? 2 : qui.connecte ? 1 : 0; }
  return {
    niveau: function (f) { return (window.CASA_DROITS || {})[f] || 'tous'; },
    peut: function (f, qui) { var n = ORDRE.indexOf(this.niveau(f)); return niveauDe(qui) >= (n < 0 ? 0 : n); }
  };
})();
