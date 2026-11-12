/*
 * Casa Besports — paiements en ligne (Stripe), côté navigateur.
 * Le navigateur ne voit jamais de clé secrète ni de prix « de confiance » : il demande à la fonction serveur
 * Supabase « paiement » d'ouvrir une page de paiement Stripe, puis Stripe renvoie la personne sur le site.
 * L'abonnement est activé par la fonction « stripe-webhook » une fois le paiement confirmé par Stripe.
 * Mise en place pas à pas : docs/PAIEMENTS.md
 */
(function () {
  var A = window.CasaAuth;

  // Retour de Stripe : ?paiement=reussi|annule&type=…  (lu une fois, puis retiré de l'adresse)
  var retour = null;
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('paiement')) {
      retour = { etat: q.get('paiement'), type: q.get('type') || '', formule: q.get('formule') || '', numero: q.get('numero') || '', cadeau: q.get('cadeau') === '1' };
      history.replaceState(null, '', location.pathname + location.hash);
    }
  } catch (e) {}

  function erreur(msg, code) { var e = new Error(msg); e.code = code || ''; return e; }

  // Appel d'une fonction serveur, avec le message d'erreur lisible qu'elle renvoie
  function appel(nom, body) {
    if (!A || !A.on || !A.client) return Promise.reject(erreur('Le paiement en ligne n’est pas encore activé.', 'non_configure'));
    return A.client().then(function (c) {
      return c.functions.invoke(nom, { body: body || {} }).then(function (r) {
        if (!r.error) return r.data || {};
        var ctx = r.error.context;
        if (ctx && typeof ctx.json === 'function') {
          return ctx.json().then(function (d) { throw erreur((d && d.error) || 'Paiement indisponible pour le moment.', (d && d.code) || (ctx.status === 404 ? 'non_configure' : '')); },
            function () { throw erreur(ctx.status === 404 ? 'Le paiement en ligne n’est pas encore activé.' : 'Paiement indisponible pour le moment.', ctx.status === 404 ? 'non_configure' : ''); });
        }
        // Fonction absente ou injoignable
        throw erreur('Le paiement en ligne n’est pas encore activé.', 'non_configure');
      });
    });
  }

  var PANIER = 'cb-panier-en-paiement';
  var P = window.CasaPaiement = {
    retour: retour,
    // Ouvre la page de paiement Stripe (redirection). body : { type: 'abonnement' | 'commande', … }
    payer: function (body) {
      return appel('paiement', body).then(function (d) {
        if (!d.url) throw erreur('Paiement indisponible pour le moment.');
        location.assign(d.url);
        return d;
      });
    },
    // Espace client Stripe : carte, factures, résiliation
    portail: function () {
      return appel('portail-abonne', {}).then(function (d) { if (!d.url) throw erreur('Espace client indisponible.'); location.assign(d.url); return d; });
    },
    // Abonnements et commandes de la personne connectée (table abonnements / commandes, voir supabase/paiements.sql)
    mesAbonnements: function () {
      if (!A || !A.on) return Promise.resolve([]);
      return A.db(function (c) { return c.from('abonnements').select('formule, periode, cadeau, statut, resiliation_prevue, fin, montant, cree_le').order('cree_le', { ascending: false }); }).then(function (r) { return r || []; }, function () { return []; });
    },
    mesCommandes: function () {
      if (!A || !A.on) return Promise.resolve([]);
      return A.db(function (c) { return c.from('commandes').select('numero, lignes, montant, statut, livraison, cree_le').order('cree_le', { ascending: false }).limit(50); }).then(function (r) { return r || []; }, function () { return []; });
    },
    // Un abonnement donne accès tant qu'il est actif (ou, pour un cadeau, jusqu'à sa date de fin)
    estActif: function (a) {
      if (!a) return false;
      if (a.cadeau) return !!a.fin && new Date(a.fin) > new Date();
      return ['active', 'trialing', 'past_due'].indexOf(a.statut) >= 0;
    },
    // Le panier est gardé pendant le passage chez Stripe (rendu si la personne annule)
    garderPanier: function (cart) { try { sessionStorage.setItem(PANIER, JSON.stringify(cart || [])); } catch (e) {} },
    reprendrePanier: function () { try { var v = JSON.parse(sessionStorage.getItem(PANIER) || '[]'); sessionStorage.removeItem(PANIER); return Array.isArray(v) ? v : []; } catch (e) { return []; } },
    oublierPanier: function () { try { sessionStorage.removeItem(PANIER); } catch (e) {} }
  };
  return P;
})();
