
/*!
 * Casa Besports — le réseau local
 * - Territoire : valeurs de l’onglet carte (fonds, couches, recherche, packs hors connexion, aperçu SVG sans Leaflet)
 * - Commerces de Cherbourg-en-Cotentin : annuaire (SIRENE + OpenStreetMap, importé par le serveur), catégories,
 *   mises en relation « via Casa Besports » validées par un humain et tracées jusqu’au partenariat rémunéré
 * - Espace correspondant de club (dans l’espace rédaction) : modèles guidés, fiche du club soumise à validation
 * - Onglet « Réseau » de l’administration : mises en relation, annuaire, fiches clubs (les certifications de CV sont dans js/cv.js)
 * La première partie (fonctions pures) est partagée avec le serveur (server/reseau.js).
 */
var CasaReseau = (function () {
  'use strict';
  var norm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim(); };
  var nid = function (p) { return (p || 'x') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var fmtDate = function (iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); };
  var fmtDT = function (iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.getDate() + ' ' + MOIS[d.getMonth()] + ' · ' + pad(d.getHours()) + ' h ' + pad(d.getMinutes()); };
  var eur = function (n) { n = +n || 0; return n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'; };
  var CHERBOURG = '50129';

  /* ================= catégories de commerces (NAF rév. 2 de l’établissement, ou étiquettes OpenStreetMap) ================= */
  var CATS = [
    { id: 'alim', label: 'Alimentation', ico: 'AL', naf: ['10.13B', '10.71B', '10.71C', '10.71D', '47.11', '47.19', '47.21', '47.22', '47.23', '47.24', '47.25', '47.29', '47.81'],
      osm: { shop: 'supermarket convenience bakery butcher seafood greengrocer deli cheese wine alcohol beverages confectionery pastry chocolate coffee tea farm organic frozen_food health_food general department_store', amenity: 'marketplace' } },
    { id: 'resto', label: 'Restaurants et bars', ico: 'RE', naf: ['56.10', '56.21', '56.29B', '56.30'], osm: { amenity: 'restaurant cafe bar pub fast_food ice_cream biergarten food_court' } },
    { id: 'hotel', label: 'Hébergement', ico: 'HÉ', naf: ['55.10', '55.20', '55.30', '55.90'], osm: { tourism: 'hotel guest_house hostel motel camp_site apartment chalet' } },
    { id: 'sport', label: 'Sport et loisirs', ico: 'SP', naf: ['47.64', '77.21', '93.11', '93.13', '93.19', '93.21', '93.29'], osm: { shop: 'sports outdoor bicycle fishing scuba_diving golf ski surf', leisure: 'fitness_centre sports_centre bowling_alley escape_game trampoline_park', amenity: 'bicycle_rental' } },
    { id: 'mode', label: 'Mode et accessoires', ico: 'MO', naf: ['47.51', '47.71', '47.72', '47.77', '47.82'], osm: { shop: 'clothes shoes jewelry boutique fashion_accessories bag watches fabric' } },
    { id: 'beaute', label: 'Beauté et santé', ico: 'BS', naf: ['47.73', '47.74', '47.75', '47.78A', '96.02', '96.04'], osm: { shop: 'hairdresser beauty cosmetics perfumery optician chemist medical_supply massage hearing_aids', amenity: 'pharmacy' } },
    { id: 'maison', label: 'Maison et jardin', ico: 'MA', naf: ['47.52', '47.53', '47.54', '47.59', '47.76'], osm: { shop: 'doityourself hardware furniture florist garden_centre houseware interior_decoration kitchen bed carpet curtain paint lighting pet appliance' } },
    { id: 'culture', label: 'High-tech et culture', ico: 'HC', naf: ['47.41', '47.42', '47.43', '47.61', '47.62', '47.63', '47.65'], osm: { shop: 'computer mobile_phone electronics books newsagent stationery music video_games toys games photo art musical_instrument hifi', amenity: 'cinema' } },
    { id: 'auto', label: 'Auto, moto, carburant', ico: 'AU', naf: ['45.11', '45.19', '45.20', '45.32', '45.40', '47.30'], osm: { shop: 'car car_repair car_parts motorcycle tyres fuel', amenity: 'car_rental fuel car_wash' } },
    { id: 'services', label: 'Services de proximité', ico: 'SE', naf: ['47.26', '47.78C', '47.79', '47.89', '68.31', '74.20', '79.11', '95.1', '95.2', '96.01B', '96.09'], osm: { shop: 'dry_cleaning laundry tailor copyshop travel_agency estate_agent tobacco variety_store second_hand gift frame e-cigarette locksmith funeral_directors', craft: '*', office: 'estate_agent travel_agent' } }
  ];
  var CAT = {}; CATS.forEach(function (c) { CAT[c.id] = c; });
  /* libellés officiels (NAF rév. 2) des activités retenues */
  var NAF = { '10.13B': 'Charcuterie', '10.71B': 'Cuisson de produits de boulangerie', '10.71C': 'Boulangerie et boulangerie-pâtisserie', '10.71D': 'Pâtisserie',
    '45.11Z': 'Commerce de voitures et de véhicules automobiles légers', '45.19Z': 'Commerce d’autres véhicules automobiles', '45.20A': 'Entretien et réparation de véhicules automobiles légers', '45.20B': 'Entretien et réparation d’autres véhicules automobiles', '45.32Z': 'Commerce de détail d’équipements automobiles', '45.40Z': 'Commerce et réparation de motocycles',
    '47.11A': 'Commerce de détail de produits surgelés', '47.11B': 'Commerce d’alimentation générale', '47.11C': 'Supérettes', '47.11D': 'Supermarchés', '47.11E': 'Magasins multi-commerces', '47.11F': 'Hypermarchés', '47.19A': 'Grands magasins', '47.19B': 'Autres commerces de détail en magasin non spécialisé',
    '47.21Z': 'Fruits et légumes', '47.22Z': 'Boucherie, viandes et produits à base de viande', '47.23Z': 'Poissons, crustacés et mollusques', '47.24Z': 'Pain, pâtisserie et confiserie', '47.25Z': 'Boissons', '47.26Z': 'Tabac', '47.29Z': 'Autres commerces de détail alimentaires', '47.30Z': 'Carburants',
    '47.41Z': 'Ordinateurs, périphériques et logiciels', '47.42Z': 'Matériels de télécommunication', '47.43Z': 'Matériels audio et vidéo', '47.51Z': 'Textiles', '47.52A': 'Quincaillerie, peintures et verres (petites surfaces)', '47.52B': 'Quincaillerie, peintures et verres (grandes surfaces)', '47.53Z': 'Tapis, moquettes, revêtements de murs et de sols', '47.54Z': 'Appareils électroménagers', '47.59A': 'Meubles', '47.59B': 'Autres équipements du foyer',
    '47.61Z': 'Livres', '47.62Z': 'Journaux et papeterie', '47.63Z': 'Enregistrements musicaux et vidéo', '47.64Z': 'Articles de sport', '47.65Z': 'Jeux et jouets', '47.71Z': 'Habillement', '47.72A': 'Chaussure', '47.72B': 'Maroquinerie et articles de voyage', '47.73Z': 'Pharmacie', '47.74Z': 'Articles médicaux et orthopédiques', '47.75Z': 'Parfumerie et produits de beauté', '47.76Z': 'Fleurs, plantes, graines, animaux de compagnie', '47.77Z': 'Horlogerie et bijouterie', '47.78A': 'Optique', '47.78C': 'Autres commerces de détail spécialisés divers', '47.79Z': 'Biens d’occasion', '47.81Z': 'Alimentaire sur éventaires et marchés', '47.82Z': 'Textiles, habillement et chaussures sur marchés', '47.89Z': 'Autres commerces de détail sur marchés',
    '55.10Z': 'Hôtels et hébergement similaire', '55.20Z': 'Hébergement touristique et de courte durée', '55.30Z': 'Terrains de camping et parcs pour caravanes', '55.90Z': 'Autres hébergements', '56.10A': 'Restauration traditionnelle', '56.10B': 'Cafétérias et autres libres-services', '56.10C': 'Restauration de type rapide', '56.21Z': 'Services des traiteurs', '56.29B': 'Autres services de restauration', '56.30Z': 'Débits de boissons',
    '68.31Z': 'Agences immobilières', '74.20Z': 'Activités photographiques', '77.21Z': 'Location d’articles de loisirs et de sport', '79.11Z': 'Agences de voyage', '93.11Z': 'Gestion d’installations sportives', '93.13Z': 'Centres de culture physique', '93.19Z': 'Autres activités liées au sport', '93.21Z': 'Parcs d’attractions et parcs à thèmes', '93.29Z': 'Autres activités récréatives et de loisirs',
    '95.11Z': 'Réparation d’ordinateurs', '95.12Z': 'Réparation d’équipements de communication', '95.21Z': 'Réparation d’électronique grand public', '95.22Z': 'Réparation d’électroménager et d’équipements maison et jardin', '95.23Z': 'Cordonnerie, réparation d’articles en cuir', '95.24Z': 'Réparation de meubles', '95.25Z': 'Réparation d’horlogerie et de bijouterie', '95.29Z': 'Réparation d’autres biens personnels', '96.01B': 'Blanchisserie-teinturerie de détail', '96.02A': 'Coiffure', '96.02B': 'Soins de beauté', '96.04Z': 'Entretien corporel', '96.09Z': 'Autres services personnels' };
  function catOfNaf(code) {
    code = String(code || '').toUpperCase(); if (!code) return null;
    for (var i = 0; i < CATS.length; i++) for (var j = 0; j < CATS[i].naf.length; j++) if (code.indexOf(CATS[i].naf[j]) === 0) return CATS[i].id;
    return null;
  }
  function catOfOsm(tags) {
    tags = tags || {}; if (tags.shop === 'vacant' || tags['disused:shop']) return null;
    for (var i = 0; i < CATS.length; i++) { var o = CATS[i].osm; for (var k in o) { if (!tags[k]) continue; if (o[k] === '*' || (' ' + o[k] + ' ').indexOf(' ' + tags[k] + ' ') >= 0) return CATS[i].id; } }
    if (tags.shop) return 'services';
    return null;
  }

  /* ================= mises en relation ================= */
  var MR_STATUTS = [['demande', 'À valider par Casa'], ['transmise', 'Transmise au commerce'], ['discussion', 'En discussion'], ['conclu', 'Partenariat conclu'], ['sans-suite', 'Sans suite'], ['refusee', 'Non transmise']];
  var MR_LABEL = {}; MR_STATUTS.forEach(function (s) { MR_LABEL[s[0]] = s[1]; });
  var MR_SUITE = { demande: ['transmise', 'refusee'], transmise: ['discussion', 'conclu', 'sans-suite'], discussion: ['conclu', 'sans-suite'], conclu: [], 'sans-suite': ['discussion'], refusee: [] };
  var MR_OBJETS = ['Sponsoring maillot ou équipement', 'Partenariat d’un événement', 'Dotation ou lots', 'Annonce dans la Gazette ou sur le site', 'Achat groupé pour le club', 'Autre demande'];
  var CANAUX_MR = [['email', 'Par e-mail (envoyé par Casa)'], ['telephone', 'Par téléphone'], ['visite', 'En boutique'], ['courrier', 'Par courrier']];
  var commission = function (montant, taux) { return Math.round((+montant || 0) * (+taux || 0)) / 100; };
  function mrMessage(mr, com, signature) {
    return 'Bonjour,\n\n' + (mr.club ? 'Le club ' + mr.club : (mr.nom || 'Un membre de Casa Besports')) + ' souhaite entrer en contact avec ' + (com ? com.nom : 'votre commerce') + ' au sujet de : ' + String(mr.objet || '').toLowerCase() + '.\n\n' +
      (mr.message ? '« ' + mr.message + ' »\n\n' : '') +
      'Casa Besports, le média du sport dans la Manche, assure la mise en relation. Si la démarche vous intéresse, répondez simplement à cet e-mail en conservant la référence ' + mr.ref + ' : nous vous présenterons.\n\n' +
      'Vous ne souhaitez plus recevoir de sollicitations de clubs via Casa Besports ? Répondez « STOP » : votre commerce sera retiré des mises en relation.\n\n' + (signature || 'L’équipe Casa Besports');
  }

  /* ================= espace correspondant de club : modèles guidés ================= */
  var F = function (k, label, type, ph, extra) { return Object.assign({ k: k, label: label, type: type || 'text', ph: ph || '' }, extra || {}); };
  var lines = function (t) { return String(t || '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean); };
  var MOISL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var dfr = function (d) { if (!d) return ''; var x = new Date(d + 'T12:00:00'); return isNaN(x) ? d : (x.getDate() === 1 ? '1er' : x.getDate()) + ' ' + MOISL[x.getMonth()] + ' ' + x.getFullYear(); };
  var MODELES = [
    { id: 'cr', label: 'Compte rendu de match', sub: 'Score, buteurs, temps forts, réaction', type: 'compte-rendu', tag: 'Compte rendu',
      champs: [F('equipe', 'Équipe', 'text', 'Seniors A, U15…'), F('competition', 'Compétition', 'text', 'Championnat, coupe…'), F('journee', 'Journée ou tour', 'text', '5e journée'), F('date', 'Date du match', 'date'),
        F('lieu', 'Lieu', 'select', '', { opts: [['dom', 'À domicile'], ['ext', 'À l’extérieur']] }), F('adversaire', 'Adversaire', 'text', 'Nom du club adverse'), F('scoreNous', 'Notre score', 'number', '0'), F('scoreEux', 'Score adverse', 'number', '0'),
        F('buteurs', 'Buteurs ou marqueurs', 'textarea', 'Un nom par ligne, avec la minute si vous l’avez'), F('resume', 'Les temps forts', 'textarea', 'Le déroulé du match en quelques phrases', { wide: true }),
        F('citation', 'Réaction (citation)', 'textarea', 'Ce qu’a dit le coach, le capitaine…'), F('citationAuteur', 'Auteur de la citation', 'text', 'Prénom Nom, fonction'), F('prochain', 'Prochain rendez-vous', 'text', 'Date, adversaire, lieu')],
      compose: function (v, club) {
        var dom = v.lieu !== 'ext', sn = v.scoreNous === '' || v.scoreNous == null ? '?' : v.scoreNous, se = v.scoreEux === '' || v.scoreEux == null ? '?' : v.scoreEux, adv = v.adversaire || '[Adversaire]';
        var title = dom ? club + ' ' + sn + '-' + se + ' ' + adv : adv + ' ' + se + '-' + sn + ' ' + club;
        var dek = [v.competition, v.journee, dfr(v.date), v.equipe].filter(Boolean).join(' · ');
        var b = []; if (v.resume) b.push('## Le match\n\n' + v.resume.trim());
        if (lines(v.buteurs).length) b.push('## ' + (dom ? 'Les buteurs' : 'Buteurs et marqueurs') + '\n\n' + lines(v.buteurs).map(function (l) { return '- ' + l; }).join('\n'));
        if (v.citation) b.push('> ' + v.citation.trim().replace(/\n+/g, ' ') + (v.citationAuteur ? ' — ' + v.citationAuteur : ''));
        if (v.prochain) b.push('## Prochain rendez-vous\n\n' + v.prochain);
        return { title: title, dek: dek, body: b.join('\n\n') };
      } },
    { id: 'annonce', label: 'Annonce ou événement', sub: 'Tournoi, loto, stage, assemblée…', type: 'breve', tag: 'Annonce',
      champs: [F('titre', 'Titre de l’annonce', 'text', 'Tournoi de Noël des U11'), F('date', 'Date', 'date'), F('heure', 'Heure', 'time'), F('lieu', 'Lieu', 'text', 'Stade, salle, adresse'), F('description', 'Description', 'textarea', 'Programme, déroulé, ce qu’il faut savoir', { wide: true }), F('public', 'Public concerné', 'text', 'Ouvert à tous, licenciés, U9 à U13…'), F('tarif', 'Tarif', 'text', 'Gratuit, 5 €…'), F('inscription', 'Inscription ou contact', 'text', 'Lien, e-mail ou téléphone')],
      compose: function (v) {
        var dek = [dfr(v.date), v.heure ? v.heure.replace(':', ' h ') : '', v.lieu].filter(Boolean).join(' · ');
        var b = []; if (v.description) b.push(v.description.trim());
        var info = [v.public ? 'Public : ' + v.public : '', v.tarif ? 'Tarif : ' + v.tarif : '', v.inscription ? 'Inscription : ' + v.inscription : ''].filter(Boolean);
        if (info.length) b.push('## Infos pratiques\n\n' + info.map(function (l) { return '- ' + l; }).join('\n'));
        return { title: v.titre || '[Titre de l’annonce]', dek: dek, body: b.join('\n\n') };
      } },
    { id: 'benevoles', label: 'Recherche de bénévoles', sub: 'Missions, dates, profil, contact', type: 'breve', tag: 'Bénévolat',
      champs: [F('missions', 'Missions proposées', 'textarea', 'Buvette, accueil, arbitrage, transport… (une par ligne)'), F('quand', 'Quand ?', 'text', 'Les samedis de novembre, le tournoi du 12…'), F('profil', 'Profil recherché', 'text', 'Tout le monde est bienvenu, majeur…'), F('contact', 'Contact', 'text', 'Prénom, e-mail ou téléphone du club')],
      compose: function (v, club) {
        var b = []; if (lines(v.missions).length) b.push('## Les missions\n\n' + lines(v.missions).map(function (l) { return '- ' + l; }).join('\n'));
        if (v.profil) b.push('## Pour qui ?\n\n' + v.profil); if (v.contact) b.push('## Se proposer\n\n' + v.contact);
        return { title: club + ' cherche des bénévoles', dek: v.quand ? 'Rendez-vous : ' + v.quand : 'Le club a besoin de bras.', body: b.join('\n\n') };
      } },
    { id: 'resultats', label: 'Résultats du week-end', sub: 'Toutes vos équipes en une fois', type: 'breve', tag: 'Résultats',
      champs: [F('weekend', 'Week-end du', 'date'), F('lignes', 'Résultats', 'textarea', 'Une ligne par match : Seniors A – US Exemple : 2-1', { wide: true }), F('mot', 'Le mot du club', 'textarea', 'Facultatif')],
      compose: function (v, club) {
        var b = []; if (lines(v.lignes).length) b.push('## Les résultats\n\n' + lines(v.lignes).map(function (l) { return '- ' + l; }).join('\n')); if (v.mot) b.push(v.mot.trim());
        return { title: 'Les résultats de ' + club, dek: v.weekend ? 'Week-end du ' + dfr(v.weekend) : 'Le week-end de nos équipes', body: b.join('\n\n') };
      } },
    { id: 'portrait', label: 'Portrait', sub: 'Un joueur, un bénévole, un éducateur', type: 'portrait', tag: 'Portrait',
      champs: [F('personne', 'Prénom et nom', 'text', 'La personne présentée'), F('role', 'Son rôle au club', 'text', 'Capitaine, trésorière, éducateur U9…'), F('depuis', 'Au club depuis', 'text', '2012'),
        F('q1', 'Question 1', 'text', 'Comment es-tu arrivé au club ?'), F('r1', 'Réponse 1', 'textarea'), F('q2', 'Question 2', 'text', 'Ton meilleur souvenir ?'), F('r2', 'Réponse 2', 'textarea'), F('q3', 'Question 3', 'text', 'Un message pour les supporters ?'), F('r3', 'Réponse 3', 'textarea'),
        F('accord', 'La personne a donné son accord pour ce portrait (et ses parents si elle est mineure)', 'check')],
      compose: function (v, club) {
        var b = []; [1, 2, 3].forEach(function (i) { if (v['q' + i] && v['r' + i]) b.push('## ' + v['q' + i] + '\n\n' + v['r' + i].trim()); });
        return { title: (v.personne || '[Prénom Nom]') + (v.role ? ', ' + v.role.toLowerCase() : ''), dek: [club, v.depuis ? 'au club depuis ' + v.depuis : ''].filter(Boolean).join(', '), body: b.join('\n\n') };
      } },
    { id: 'agenda', label: 'Agenda des matchs', sub: 'Les prochaines rencontres', type: 'breve', tag: 'Agenda',
      champs: [F('periode', 'Période', 'text', 'Ce week-end, novembre…'), F('lignes', 'Rencontres', 'textarea', 'Une ligne par match : sam. 14 h – U15 – contre FC Exemple – stade municipal', { wide: true })],
      compose: function (v, club) {
        var b = lines(v.lignes).length ? '## Les rencontres\n\n' + lines(v.lignes).map(function (l) { return '- ' + l; }).join('\n') : '';
        return { title: 'L’agenda de ' + club + (v.periode ? ' · ' + v.periode : ''), dek: 'Venez encourager nos équipes.', body: b };
      } }
  ];
  var modele = function (id) { return MODELES.find(function (m) { return m.id === id; }) || MODELES[0]; };
  var FICHE = [F('presentation', 'Présentation du club', 'textarea', 'Histoire, valeurs, ce qui vous rend fiers', { wide: true }), F('lieu', 'Stade, salle ou base', 'text', 'Nom de l’équipement'), F('adresse', 'Adresse', 'text', 'Rue, code postal, commune'),
    F('horaires', 'Entraînements', 'textarea', 'Catégorie : jours et horaires'), F('equipes', 'Équipes et catégories', 'text', 'Seniors A et B, U7 à U17, féminines…'), F('tarifs', 'Licence et tarifs', 'text', 'À partir de … €'),
    F('email', 'E-mail public du club', 'email', 'contact@club.fr'), F('tel', 'Téléphone public', 'tel', '02 33 …'), F('web', 'Site web', 'url', 'https://'), F('reseaux', 'Réseaux sociaux', 'text', 'Instagram, Facebook…'), F('recrute', 'Le club recherche', 'text', 'Joueurs, bénévoles, encadrants, arbitres…')];
  var FICHE_KEYS = FICHE.map(function (f) { return f.k; });
  function cleanFiche(o) { var r = {}; FICHE_KEYS.forEach(function (k) { var v = o && o[k] != null ? String(o[k]).trim() : ''; r[k] = v.slice(0, k === 'presentation' || k === 'horaires' ? 2000 : 300); }); return r; }

  return { norm: norm, nid: nid, fmtDate: fmtDate, fmtDT: fmtDT, eur: eur, CHERBOURG: CHERBOURG, CATS: CATS, CAT: CAT, NAF: NAF, catOfNaf: catOfNaf, catOfOsm: catOfOsm,
    MR_STATUTS: MR_STATUTS, MR_LABEL: MR_LABEL, MR_SUITE: MR_SUITE, MR_OBJETS: MR_OBJETS, CANAUX_MR: CANAUX_MR, commission: commission, mrMessage: mrMessage,
    MODELES: MODELES, modele: modele, FICHE: FICHE, FICHE_KEYS: FICHE_KEYS, cleanFiche: cleanFiche, lines: lines };
})();

/* ================= interface : valeurs du gabarit (navigateur seulement) ================= */
(function (R) {
  'use strict';
  if (typeof window === 'undefined') return;
  var norm = R.norm;
  var pill = function (on) { return { bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pressed: on ? 'true' : 'false', checked: on ? 'true' : 'false' }; };
  var srvPublic = function () { return !!(window.CB && window.CB.call && window.CB_SERVER); };
  var srvStaff = function () { return !!(window.CB && window.CB.user && window.CB.call); };
  var call = function (m, p, b) { return window.CB.call(m, p, b); };
  var LS = { com: 'cb-commerces-v1', mr: 'cb-mr-v1', fiches: 'cb-fiches-v1', fond: 'cb-carte-fond' };
  var readLS = function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  var writeLS = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } };
  var ev = function (e) { return e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e; };
  R.readLS = readLS; R.writeLS = writeLS;

  /* ---------- état d’interface du réseau (un seul objet dans l’état du composant) ---------- */
  var U = function (self) { return self.state.rsu || {}; };
  var ui = function (self, patch) { self.setState({ rsu: Object.assign({}, self.state.rsu || {}, patch) }); };
  R.ui = ui;

  /* ================= données : commerces, mises en relation, fiches (démo locale ou serveur) ================= */
  function comData(self) {
    var s = self.state;
    if (s.rsCom) return s.rsCom;
    if (srvPublic()) {
      if (!self._rsComLoading) {
        self._rsComLoading = true;
        call('GET', '/commerces').then(function (r) { self.setState({ rsCom: { list: r.commerces || [], maj: r.maj || '', sources: r.sources || {}, srv: true, cfg: r.config || {} } }); })
          .catch(function () { self.setState({ rsCom: { list: [], maj: '', sources: {}, srv: true, err: true } }); });
      }
      return { list: [], maj: '', sources: {}, srv: true, loading: true };
    }
    return { list: readLS(LS.com, []), maj: '', sources: {}, srv: false };
  }
  R.reloadCom = function (self) { self._rsComLoading = false; self.setState({ rsCom: null }); };
  function mrData(self) {
    var s = self.state;
    if (s.rsMr) return s.rsMr;
    if (srvStaff() && ['admin', 'collaborateur'].indexOf(window.CB.user.role) >= 0) {
      if (!self._rsMrLoading) { self._rsMrLoading = true; call('GET', '/mises-en-relation').then(function (r) { self.setState({ rsMr: { list: r.list || [], cfg: r.config || { taux: 10 }, srv: true } }); }).catch(function () { self.setState({ rsMr: { list: [], cfg: { taux: 10 }, srv: true, err: true } }); }); }
      return { list: [], cfg: { taux: 10 }, srv: true, loading: true };
    }
    return { list: readLS(LS.mr, []), cfg: { taux: 10 }, srv: false };
  }
  R.reloadMr = function (self) { self._rsMrLoading = false; self.setState({ rsMr: null }); };
  function saveMrLocal(self, list) { writeLS(LS.mr, list); self.setState({ rsMr: { list: list, cfg: { taux: 10 }, srv: false } }); }
  function fichesData(self) {
    var s = self.state;
    if (s.rsFiches) return s.rsFiches;
    if (srvPublic()) {
      if (!self._rsFiLoading) { self._rsFiLoading = true; call('GET', '/clubs/fiches').then(function (r) { self.setState({ rsFiches: { valid: r.fiches || {}, dem: r.demandes || {}, srv: true } }); }).catch(function () { self.setState({ rsFiches: { valid: {}, dem: {}, srv: true } }); }); }
      return { valid: {}, dem: {}, srv: true, loading: true };
    }
    var d = readLS(LS.fiches, { valid: {}, dem: {} });
    return { valid: d.valid || {}, dem: d.dem || {}, srv: false };
  }
  R.fiches = fichesData;
  R.reloadFiches = function (self) { self._rsFiLoading = false; self.setState({ rsFiches: null }); };

  /* ================= TERRITOIRE ================= */
  var ZONES = [
    { id: 'cherbourg', label: 'Cherbourg-en-Cotentin', commune: '50129', zmin: 8, zooms: [15, 16, 17], def: 16 },
    { id: 'hague', label: 'La Hague', commune: '50041', zmin: 8, zooms: [14, 15, 16], def: 15 },
    { id: 'nord', label: 'Nord-Cotentin', bbox: [-1.96, 49.42, -1.22, 49.73], zmin: 7, zooms: [12, 13, 14], def: 13 },
    { id: 'vue', label: 'La vue actuelle', vue: true, zmin: 8, zooms: [14, 15, 16, 17], def: 15 },
    { id: 'normandie', label: 'Toute la Normandie', bbox: [-1.98, 48.15, 1.85, 50.1], zmin: 6, zooms: [9, 10, 11], def: 10 }
  ];
  var PRECISION = { 9: 'Région', 10: 'Cantons', 11: 'Communes', 12: 'Bourgs', 13: 'Villages', 14: 'Quartiers', 15: 'Rues principales', 16: 'Toutes les rues', 17: 'Bâtiments', 18: 'Maximum' };
  function zoneBbox(z) {
    if (z.bbox) return z.bbox;
    if (z.commune && window.CasaCarte && window.CasaCarte.ready()) { var c = window.CasaCarte.commune(z.commune); if (c) return c.bbox; }
    if (z.vue && window.CasaCarte && window.CasaCarte._state.map) { var b = window.CasaCarte._state.map.getBounds(); return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]; }
    return null;
  }

  function carteVals(self, c) {
    var s = self.state, u = U(self), D = c.D;
    var leaflet = !!(window.L && window.CasaCarte);
    var tuiles = leaflet && window.CasaCarte.tuilesOk();
    var online = u.online != null ? u.online : (typeof navigator === 'undefined' || navigator.onLine !== false);
    var fond = u.fond || readLS(LS.fond, null) || (tuiles ? 'plan' : 'casa');
    if (!tuiles) fond = 'casa';
    var couches = Object.assign({ clubs: true, commerces: true, limites: false }, u.couches || {});
    var panel = u.panel || 'clubs';
    var set = function (p) { ui(self, p); };
    var cd = comData(self);
    var cats = u.comCat || 'tout';
    var cq = norm(u.comQ || '');
    var allCom = (cd.list || []).filter(function (x) { return !x.masque; });
    var comF = allCom.filter(function (x) { return (cats === 'tout' || x.cat === cats || (cats === 'partenaires' && x.partenaire)) && (!cq || norm(x.nom + ' ' + (x.act || '') + ' ' + (x.adr || '')).indexOf(cq) >= 0); });

    /* --- fonds --- */
    var FONDS = window.CasaCarte ? window.CasaCarte.FONDS : { casa: { label: 'Carte embarquée' } };
    var fonds = (tuiles ? ['plan', 'photo', 'osm', 'casa'] : ['casa']).map(function (id) { var on = fond === id; return { id: id, label: FONDS[id].label, checked: on ? 'true' : 'false', cls: on ? 'is-on' : '', pick: function () { writeLS(LS.fond, id); set({ fond: id }); } }; });
    var cou = [['clubs', 'Clubs'], ['commerces', 'Commerces'], ['limites', 'Limites des communes']].map(function (x) { var on = !!couches[x[0]]; return { id: x[0], label: x[1], on: on, pressed: on ? 'true' : 'false', cls: on ? 'is-on' : '', toggle: function () { var n = Object.assign({}, couches); n[x[0]] = !on; set({ couches: n }); } }; });

    /* --- clubs par ville --- */
    var cityNames = Object.keys(D.cities).filter(function (n) { return D.clubs.some(function (cl) { return cl.city === n; }); });
    var clubsPins = cityNames.map(function (n) { var ll = D.cities[n]; var k = D.clubs.filter(function (cl) { return cl.city === n; }).length; return { name: n, lat: ll[0], lon: ll[1], count: String(k), aria: n + ', ' + k + ' club' + (k > 1 ? 's' : ''), sel: s.city === n }; });
    var cityChips = cityNames.map(function (n) { var k = D.clubs.filter(function (cl) { return cl.city === n; }).length; return Object.assign(pill(s.city === n), { label: n, n: String(k), pick: function () { self.setState({ city: n }); var ll = D.cities[n]; set({ focus: { k: 'c' + n + Date.now(), lat: ll[0], lon: ll[1], zoom: 13 }, panel: 'clubs' }); } }); });

    /* --- recherche --- */
    var q = u.q || '', qn = norm(q), results = [];
    if (qn.length >= 2) {
      if (leaflet && window.CasaCarte.ready()) window.CasaCarte.searchCommunes(q, 6).forEach(function (r) { results.push({ kind: 'Commune', label: r.nom, sub: (r.cp ? r.cp.split(' ')[0] + ' · ' : '') + ({ 14: 'Calvados', 27: 'Eure', 50: 'Manche', 61: 'Orne', 76: 'Seine-Maritime' }[r.dep] || r.dep) + (r.pop ? ' · ' + r.pop.toLocaleString('fr-FR') + ' hab.' : ''),
        pick: function () { set({ q: '', communeSel: r.code, focus: { k: 'm' + r.code + Date.now(), commune: r.code }, panel: panel === 'hors' ? 'clubs' : panel }); } }); });
      D.clubs.filter(function (cl) { return norm(cl.name + ' ' + cl.city + ' ' + cl.sport).indexOf(qn) >= 0; }).slice(0, 5).forEach(function (cl) { results.push({ kind: 'Club', label: cl.name, sub: cl.sport + ' · ' + cl.city, pick: function () { self.setState({ city: cl.city }); var ll = D.cities[cl.city]; set({ q: '', panel: 'clubs', focus: ll ? { k: 'k' + cl.id + Date.now(), lat: ll[0], lon: ll[1], zoom: 14 } : null }); } }); });
      allCom.filter(function (x) { return norm(x.nom + ' ' + (x.act || '')).indexOf(qn) >= 0; }).slice(0, 6).forEach(function (x) { results.push({ kind: 'Commerce', label: x.nom, sub: (x.act || R.CAT[x.cat].label) + (x.adr ? ' · ' + x.adr : ''), pick: function () { set({ q: '', panel: 'commerces', comSel: x.id, focus: x.lat != null ? { k: 'x' + x.id + Date.now(), lat: x.lat, lon: x.lon, zoom: 17 } : null }); } }); });
    }

    /* --- commune sélectionnée --- */
    var cs = u.communeSel && leaflet && window.CasaCarte.ready() ? window.CasaCarte.commune(u.communeSel) : null;
    var DEP = { 14: 'Calvados', 27: 'Eure', 50: 'Manche', 61: 'Orne', 76: 'Seine-Maritime' };
    var commune = cs ? { nom: cs.nom, dep: DEP[cs.dep] || cs.dep, pop: cs.pop ? cs.pop.toLocaleString('fr-FR') + ' habitants (INSEE)' : '', cp: cs.cp ? 'Code' + (cs.cp.indexOf(' ') > 0 ? 's' : '') + ' postal' + (cs.cp.indexOf(' ') > 0 ? 'aux' : '') + ' : ' + cs.cp.split(' ').join(', ') : '',
      clubs: (function () { var n = D.clubs.filter(function (cl) { var ll = D.cities[cl.city]; return ll && window.CasaCarte.communeOfPoint(ll[0], ll[1]) === cs.code; }).length; return n ? n + ' club' + (n > 1 ? 's' : '') + ' suivi' + (n > 1 ? 's' : '') + ' par Casa' : ''; })(),
      isCherbourg: cs.code === R.CHERBOURG, zoom: function () { set({ focus: { k: 'z' + cs.code + Date.now(), commune: cs.code } }); }, close: function () { set({ communeSel: '' }); },
      voirCommerces: function () { set({ panel: 'commerces' }); } } : null;

    /* --- état de la connexion --- */
    var etat = !online ? 'Hors connexion · carte embarquée' + (window.CasaCarte && window.CasaCarte.packs().length ? ' et packs enregistrés' : '') : fond === 'casa' ? 'Carte embarquée · fonctionne sans réseau' : 'En ligne · ' + FONDS[fond].label + (u.trouble === fond ? ' (tuiles indisponibles : carte embarquée affichée)' : '');

    /* --- packs hors connexion --- */
    var zoneId = u.zone || 'cherbourg', Z = ZONES.find(function (z) { return z.id === zoneId; }) || ZONES[0];
    var zmax = u.zmax && Z.zooms.indexOf(u.zmax) >= 0 ? u.zmax : Z.def;
    var pfond = u.pfond === 'photo' ? 'photo' : 'plan';
    var bbox = leaflet ? zoneBbox(Z) : null;
    var est = bbox ? window.CasaCarte.estimate(bbox, Z.zmin, zmax, pfond) : null;
    var job = u.job || null;
    var packs = leaflet ? window.CasaCarte.packs() : [];
    var packsOk = leaflet && window.CasaCarte.packsAvailable();
    var hors = {
      ok: packsOk, unavailable: leaflet && !packsOk, noLeaflet: !leaflet,
      why: !tuiles ? 'Les fonds en ligne ne sont pas accessibles depuis cette version : la carte embarquée de la Normandie fonctionne déjà sans réseau.' : 'Le téléchargement des packs demande le site ou l’application installée (connexion sécurisée).',
      zones: ZONES.map(function (z) { return Object.assign(pill(z.id === zoneId), { label: z.label, pick: function () { set({ zone: z.id, zmax: null }); } }); }),
      zooms: Z.zooms.map(function (z) { return Object.assign(pill(z === zmax), { label: PRECISION[z] || ('Zoom ' + z), sub: 'zoom ' + z, pick: function () { set({ zmax: z }); } }); }),
      pfonds: [['plan', 'Plan IGN'], ['photo', 'Photos aériennes']].map(function (x) { return Object.assign(pill(x[0] === pfond), { label: x[1], pick: function () { set({ pfond: x[0] }); } }); }),
      est: est ? '≈ ' + est.tuiles.toLocaleString('fr-FR') + ' tuiles · ≈ ' + String(est.mo).replace('.', ',') + ' Mo' : 'Ouvrez la carte pour estimer la taille.',
      trop: !!(est && est.tuiles > 12000), canGo: !!(est && est.tuiles <= 12000 && !job && online),
      offlineNote: !online ? 'Reconnectez-vous pour télécharger un nouveau pack.' : '',
      job: !!job, jobPct: job ? Math.round(job.done / Math.max(1, job.total) * 100) + '%' : '0%', jobTxt: job ? job.done.toLocaleString('fr-FR') + ' / ' + job.total.toLocaleString('fr-FR') + ' tuiles' + (job.fail ? ' · ' + job.fail + ' échec(s)' : '') : '',
      go: function () {
        if (!bbox || !est) return;
        var def = { label: Z.label + ' · ' + (pfond === 'photo' ? 'photos' : 'plan') + ' · ' + (PRECISION[zmax] || 'zoom ' + zmax).toLowerCase(), fond: pfond, bbox: bbox, zmin: Z.zmin, zmax: zmax };
        set({ job: { done: 0, total: est.tuiles, fail: 0 } });
        window.CasaCarte.download(def, function (j) { ui(self, { job: { done: j.done, total: j.total, fail: j.fail } }); })
          .then(function (p) { ui(self, { job: null, packsV: Date.now() }); self.say(p && p.annule ? 'Téléchargement annulé' : 'Pack enregistré : la zone reste consultable hors connexion'); refreshStorage(self); })
          .catch(function (e) { ui(self, { job: null }); self.say(e.message || 'Téléchargement impossible'); });
      },
      cancel: function () { window.CasaCarte.cancel(); },
      packs: packs.map(function (p) { return { label: p.label, sub: p.tuiles.toLocaleString('fr-FR') + ' tuiles · ' + (p.octets ? (p.octets / 1048576).toFixed(1).replace('.', ',') + ' Mo · ' : '') + 'enregistré le ' + R.fmtDate(p.at) + (p.echecs ? ' · ' + p.echecs + ' tuile(s) manquante(s)' : ''),
        voir: function () { set({ focus: { k: 'p' + p.id + Date.now(), bounds: [[p.bbox[1], p.bbox[0]], [p.bbox[3], p.bbox[2]]] }, fond: p.fond }); },
        remove: function () { window.CasaCarte.removePack(p.id).then(function () { ui(self, { packsV: Date.now() }); self.say('Pack supprimé'); refreshStorage(self); }); } }; }),
      hasPacks: packs.length > 0, noPacks: packs.length === 0,
      storage: u.storage || ''
    };
    if (leaflet && u.storage == null && !self._rsStorage) { self._rsStorage = true; refreshStorage(self); }

    /* --- aperçu SVG (canevas, sans Leaflet) --- */
    var svg = null;
    var APERCU = (typeof CASA_NORMANDIE_APERCU !== 'undefined' && CASA_NORMANDIE_APERCU) || window.CASA_NORMANDIE_APERCU;
    if (!leaflet && APERCU) {
      var A = APERCU, z = u.svgZoom || 1, cx = u.svgCx != null ? u.svgCx : A.w / 2, cy = u.svgCy != null ? u.svgCy : A.h / 2;
      var w = A.w / z, h = A.h / z;
      var proj = function (lat, lon) { var my = function (l) { return Math.log(Math.tan(Math.PI / 4 + l * Math.PI / 360)); }; var x = (lon - A.lon[0]) * A.w / (A.lon[1] - A.lon[0]); var y = (my(A.lat[0]) - my(lat)) * A.h / (my(A.lat[0]) - my(A.lat[1])); return [x, y]; };
      var r = 11 / Math.pow(z, 0.8), vx0 = cx - w / 2, vy0 = cy - h / 2, fsz = 13 / Math.pow(z, 0.85);
      /* pastilles des clubs : deux groupes qui se touchent fusionnent, jusqu’à ce qu’aucun ne se chevauche
         (la ville sélectionnée reste seule et se dessine en dernier, au-dessus) */
      var grp = clubsPins.map(function (pn) { var q2 = proj(pn.lat, pn.lon); return { m: [pn], x: q2[0], y: q2[1], xs: [q2[0]], ys: [q2[1]], sel: !!pn.sel }; });
      var lim = r * 2.5, fus = true, moy = function (l) { return l.reduce(function (t, q) { return t + q; }, 0) / l.length; };
      while (fus) {
        fus = false;
        for (var gi = 0; gi < grp.length && !fus; gi++) for (var gj = gi + 1; gj < grp.length && !fus; gj++) {
          var g1 = grp[gi], g2 = grp[gj];
          if (g1.sel || g2.sel || Math.abs(g1.x - g2.x) >= lim || Math.abs(g1.y - g2.y) >= lim) continue;
          g1.m = g1.m.concat(g2.m); g1.xs = g1.xs.concat(g2.xs); g1.ys = g1.ys.concat(g2.ys); g1.x = moy(g1.xs); g1.y = moy(g1.ys);
          grp.splice(gj, 1); fus = true;
        }
      }
      grp.sort(function (a, b) { return (a.sel ? 1 : 0) - (b.sel ? 1 : 0); });
      var pad = 2 / z, obst = grp.map(function (g) { return [g.x - r - pad, g.y - r - pad, g.x + r + pad, g.y + r + pad]; });
      /* étiquettes des villes, les plus peuplées d’abord : chacune se place au-dessus, en dessous, à droite ou à gauche
         de son point (ou de la pastille posée dessus), sans toucher une pastille, une autre étiquette ni le bord ;
         sinon elle attend un zoom plus fort */
      var over = function (b, q) { return b[0] < q[2] && q[0] < b[2] && b[1] < q[3] && q[1] < b[3]; };
      var keptV = [], pr = 2.6 / Math.pow(z, 0.85), gap = 4 / Math.pow(z, 0.85), bord = 3 / z;
      A.villes.forEach(function (v) {
        if (v.x < vx0 || v.x > vx0 + w || v.y < vy0 || v.y > vy0 + h) return;
        // une commune de banlieue attend que le zoom l’écarte de la grande ville déjà nommée
        if (keptV.some(function (k) { return Math.abs(k.vx - v.x) < 40 / z && Math.abs(k.vy - v.y) < 40 / z; })) return;
        var tw = v.n.length * fsz * 0.66, th = fsz * 0.74; // capitales grasses : ≈ 0,66 em de large, 0,74 em de haut
        var dv = [v.x - pr, v.y - pr, v.x + pr, v.y + pr], e = r * 0.6;
        // une pastille posée sur la ville (ou tout près) lui sert de repère : le point n’est pas dessiné et l’étiquette la contourne
        var pin = obst.filter(function (q) { return v.x >= q[0] - e && v.x <= q[2] + e && v.y >= q[1] - e && v.y <= q[3] + e; })[0];
        var o = pin ? [Math.min(pin[0], dv[0]), Math.min(pin[1], dv[1]), Math.max(pin[2], dv[2]), Math.max(pin[3], dv[3])] : dv;
        var my = (o[1] + o[3]) / 2;
        if (keptV.some(function (k) { return over(dv, k.b); })) return;
        var cs = [
          { a: 'middle', x: v.x, y: o[1] - gap, b: [v.x - tw / 2, o[1] - gap - th, v.x + tw / 2, o[1] - gap] },
          { a: 'middle', x: v.x, y: o[3] + gap + th, b: [v.x - tw / 2, o[3] + gap, v.x + tw / 2, o[3] + gap + th] },
          { a: 'start', x: o[2] + gap, y: my + th / 2, b: [o[2] + gap, my - th / 2, o[2] + gap + tw, my + th / 2] },
          { a: 'end', x: o[0] - gap, y: my + th / 2, b: [o[0] - gap - tw, my - th / 2, o[0] - gap, my + th / 2] }
        ];
        for (var ci = 0; ci < cs.length; ci++) {
          var cd = cs[ci], b = cd.b;
          if (b[0] < vx0 + bord || b[2] > vx0 + w - bord || b[1] < vy0 + bord || b[3] > vy0 + h - bord) continue;
          if (obst.some(function (q) { return over(b, q); }) || keptV.some(function (k) { return over(b, k.b) || over(b, k.d); })) continue;
          keptV.push({ n: v.n.toUpperCase(), x: cd.x.toFixed(1), y: cd.y.toFixed(1), a: cd.a, px: v.x.toFixed(1), py: v.y.toFixed(1), pt: !pin, vx: v.x, vy: v.y, b: b, d: dv });
          break;
        }
      });
      svg = { vb: vx0.toFixed(1) + ' ' + vy0.toFixed(1) + ' ' + w.toFixed(1) + ' ' + h.toFixed(1), ctx: A.ctx, deps: A.deps, sw: (1.4 / z).toFixed(2), fs: fsz.toFixed(1), halo: (3.2 / Math.pow(z, 0.85)).toFixed(2), pr: pr.toFixed(2),
        villes: keptV,
        clubs: grp.map(function (g) {
          var a = g.m[0], n = g.m.reduce(function (t, x) { return t + (+x.count || 0); }, 0), sel = g.m.length === 1 && g.sel, gx = g.x, gy = g.y;
          return { x: (gx - r).toFixed(1), y: (gy - r).toFixed(1), s: (r * 2).toFixed(1), tx: gx.toFixed(1), ty: (gy + r * 0.36).toFixed(1), n: String(n), fs: (r * 1.05).toFixed(1), fill: sel ? 'var(--surface)' : 'var(--ink)', txt: sel ? 'var(--ink)' : 'var(--bg)',
            label: g.m.length > 1 ? n + ' clubs autour de ' + g.m.map(function (x) { return x.name; }).slice(0, 3).join(', ') + (g.m.length > 3 ? '…' : '') + ' : zoomer' : a.name + ' : ' + n + (n > 1 ? ' clubs' : ' club'),
            pick: function () { if (g.m.length > 1) { set({ svgCx: gx, svgCy: gy, svgZoom: Math.min(8, z * 2.2) }); return; } self.setState({ city: a.name }); set({ panel: 'clubs', svgCx: gx, svgCy: gy, svgZoom: Math.max(z, 4) }); } };
        }).map(function (it) { it.key = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); it.pick(); } }; return it;
        }),
        zin: function () { set({ svgZoom: Math.min(8, z * 1.6) }); }, zout: function () { set({ svgZoom: Math.max(1, z / 1.6) }); }, reset: function () { set({ svgZoom: 1, svgCx: null, svgCy: null }); },
        canIn: z < 8, canOut: z > 1, noIn: z >= 8, noOut: z <= 1 };
    }

    /* --- synchronisation de Leaflet après le rendu --- */
    var comPins = couches.commerces ? comF.filter(function (x) { return x.lat != null; }).map(function (x) { return { id: x.id, nom: x.nom, lat: x.lat, lon: x.lon, cat: x.cat, ico: (R.CAT[x.cat] || {}).ico, partenaire: !!x.partenaire }; }) : [];
    if (leaflet && c.V === 'map') {
      var opts = { fond: fond, nb: !!u.nb, couches: couches, clubs: clubsPins, commerces: comPins, comSel: u.comSel || '', communeSel: u.communeSel || '', focus: u.focus || null,
        api: { pickCity: function (n) { self.setState({ city: n }); ui(self, { panel: 'clubs' }); }, pickCommerce: function (id) { ui(self, { panel: 'commerces', comSel: id, mrOpen: false }); },
          pickCommune: function (code) { ui(self, { communeSel: code }); }, say: function (m) { self.say(m); }, online: function (on) { ui(self, { online: on }); },
          tileTrouble: function (id) { ui(self, { trouble: id }); }, ready: function () { ui(self, { mapReady: true }); }, located: function (code) { ui(self, { communeSel: code }); } } };
      var run = function () { var slot = document.getElementById('cb-carte-slot'); if (slot) window.CasaCarte.sync(slot, opts); };
      (window.queueMicrotask || setTimeout)(run);
    }

    return {
      useLeaflet: leaflet, useSvg: !!svg, svg: svg || {}, noMap: !leaflet && !svg,
      dek: 'Les clubs suivis par Casa, les commerces de Cherbourg-en-Cotentin et chacune des 2 644 communes de la région. En ligne, le plan IGN zoome jusqu’à la rue ; sans réseau, la carte embarquée et vos zones enregistrées prennent le relais.',
      fonds: fonds, nb: !!u.nb, toggleNb: function () { set({ nb: !u.nb }); }, couches: cou,
      etat: etat, etatCls: online ? (fond === 'casa' ? 'is-vect' : 'is-on') : 'is-off',
      q: q, onQ: function (e) { set({ q: ev(e) }); }, hasQ: !!q, clearQ: function () { set({ q: '' }); }, results: results, hasResults: results.length > 0, noResults: qn.length >= 2 && results.length === 0,
      locate: function () { if (window.CasaCarte && leaflet) window.CasaCarte.locate(); else self.say('La géolocalisation demande la carte interactive'); },
      recentrer: function () { if (leaflet) set({ focus: { k: 'n' + Date.now(), normandie: true } }); else set({ svgZoom: 1, svgCx: null, svgCy: null }); },
      tabs: [['clubs', 'Clubs'], ['commerces', 'Commerces'], ['hors', 'Hors connexion']].map(function (t) { var on = panel === t[0]; return { id: t[0], label: t[1], selected: on ? 'true' : 'false', cls: on ? 'is-on' : '', pick: function () { set({ panel: t[0] }); } }; }),
      tabClubs: panel === 'clubs', tabCom: panel === 'commerces', tabHors: panel === 'hors',
      hasCommune: !!commune, commune: commune || {}, cityChips: cityChips,
      sources: leaflet ? 'Fonds : Plan IGN v2 et photographies aériennes © IGN (Géoplateforme, Licence Ouverte) · © contributeurs OpenStreetMap (ODbL) · carte embarquée : IGN Admin Express, INSEE COG 2026, Natural Earth. Positions des clubs indicatives (centre de la ville).' : 'Aperçu vectoriel : IGN Admin Express (Licence Ouverte), Natural Earth. Positions des clubs indicatives.',
      hors: hors, comPinsN: comPins.length
    };
  }
  function refreshStorage(self) {
    if (!window.CasaCarte) return;
    window.CasaCarte.storage().then(function (st) { ui(self, { storage: st && st.usage != null ? 'Espace utilisé par le site sur cet appareil : ' + (st.usage / 1048576).toFixed(1).replace('.', ',') + ' Mo' + (st.quota ? ' sur ' + Math.round(st.quota / 1048576).toLocaleString('fr-FR') + ' Mo disponibles' : '') : '' }); }).catch(function () {});
  }

  /* ================= COMMERCES (panneau, fiche, demande de mise en relation) ================= */
  function comVals(self, c, carte) {
    var u = U(self), cd = comData(self), set = function (p) { ui(self, p); };
    var list = (cd.list || []).filter(function (x) { return !x.masque; });
    var cat = u.comCat || 'tout', cq = norm(u.comQ || '');
    var match = function (x) { return (cat === 'tout' || x.cat === cat || (cat === 'partenaires' && x.partenaire)) && (!cq || norm(x.nom + ' ' + (x.act || '') + ' ' + (x.adr || '')).indexOf(cq) >= 0); };
    var f = list.filter(match).sort(function (a, b) { return (b.partenaire ? 1 : 0) - (a.partenaire ? 1 : 0) || String(a.nom).localeCompare(String(b.nom), 'fr'); });
    var lim = u.comLim || 40;
    var counts = {}; list.forEach(function (x) { counts[x.cat] = (counts[x.cat] || 0) + 1; });
    var nPart = list.filter(function (x) { return x.partenaire; }).length;
    var cats = [{ id: 'tout', label: 'Tout', n: list.length }].concat(nPart ? [{ id: 'partenaires', label: 'Partenaires Casa', n: nPart }] : []).concat(R.CATS.filter(function (k) { return counts[k.id]; }).map(function (k) { return { id: k.id, label: k.label, n: counts[k.id] }; }))
      .map(function (k) { return Object.assign(pill(k.id === cat), { label: k.label, n: String(k.n), pick: function () { set({ comCat: k.id, comLim: 40 }); } }); });
    var selRaw = list.find(function (x) { return x.id === u.comSel; }) || null;
    var srcLabel = function (x) { var o = []; (x.src || []).forEach(function (sx) { o.push(sx === 'sirene' ? 'INSEE SIRENE' : sx === 'osm' ? 'OpenStreetMap' : 'Ajout Casa'); }); return o.join(' + '); };
    var sel = selRaw ? {
      nom: selRaw.nom, act: selRaw.act || (R.CAT[selRaw.cat] || {}).label || '', cat: (R.CAT[selRaw.cat] || {}).label || '', adr: [selRaw.adr, [selRaw.cp, selRaw.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '),
      tel: selRaw.tel || '', hasTel: !!selRaw.tel, telHref: 'tel:' + String(selRaw.tel || '').replace(/[^+0-9]/g, ''), web: selRaw.web || '', hasWeb: !!selRaw.web, webLabel: String(selRaw.web || '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
      horaires: selRaw.horaires || '', hasHoraires: !!selRaw.horaires, siret: selRaw.siret ? 'SIRET ' + selRaw.siret.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4') : '', hasSiret: !!selRaw.siret,
      src: 'Source : ' + srcLabel(selRaw) + (selRaw.maj ? ' · données du ' + R.fmtDate(selRaw.maj) : ''), partenaire: !!selRaw.partenaire, optout: !!selRaw.optout,
      canContact: !selRaw.optout, contact: function () { set({ mrOpen: true, mrSent: null, mrErr: '' }); },
      voir: function () { if (selRaw.lat != null) set({ focus: { k: 'v' + selRaw.id + Date.now(), lat: selRaw.lat, lon: selRaw.lon, zoom: 18 } }); },
      close: function () { set({ comSel: '' }); },
      signaler: function () { set({ sigOpen: true, sigSent: false, mrOpen: false }); }
    } : null;
    var empty = !cd.loading && list.length === 0;
    var isStaff = !!c.staffRole && (c.isAdmin || c.staffRole === 'collaborateur');
    return {
      count: list.length.toLocaleString('fr-FR'), maj: cd.maj ? 'Annuaire mis à jour le ' + R.fmtDate(cd.maj) : '', hasMaj: !!cd.maj, loading: !!cd.loading,
      q: u.comQ || '', onQ: function (e) { set({ comQ: ev(e), comLim: 40 }); }, cats: cats,
      items: f.slice(0, lim).map(function (x) { var on = x.id === u.comSel; return { nom: x.nom, act: x.act || (R.CAT[x.cat] || {}).label, adr: x.adr || '', ico: (R.CAT[x.cat] || {}).ico || '', part: !!x.partenaire, cls: on ? 'is-on' : '', cur: on ? 'true' : 'false',
        pick: function () { set({ comSel: x.id, mrOpen: false, focus: x.lat != null ? { k: 's' + x.id + Date.now(), lat: x.lat, lon: x.lon, zoom: 17 } : null }); } }; }),
      nResults: f.length.toLocaleString('fr-FR') + ' résultat' + (f.length > 1 ? 's' : ''), more: f.length > lim, moreN: String(f.length - lim), showMore: function () { set({ comLim: lim + 60 }); },
      hasSel: !!sel, sel: sel || {}, empty: empty, notEmpty: !empty && !cd.loading,
      emptyTitle: cd.srv ? 'L’annuaire n’a pas encore été importé' : 'Annuaire de démonstration vide',
      emptyText: cd.srv ? 'Il se remplit avec les données publiques de l’INSEE (SIRENE : établissements actifs et diffusibles de Cherbourg-en-Cotentin) et d’OpenStreetMap, à l’importation lancée par l’administration (onglet Réseau de l’espace rédaction, ou « npm run commerces »). Aucun commerce n’est inventé.'
        : 'Sur la plateforme, l’annuaire est importé des données publiques (INSEE SIRENE, OpenStreetMap). Ici, aucun commerce n’est inventé : ajoutez-en un pour essayer la mise en relation.',
      canAdd: !cd.srv || isStaff, addOpen: !!u.comAdd, openAdd: function () { set({ comAdd: true, comForm: { nom: '', cat: 'alim', adr: '', tel: '', email: '', web: '' } }); }, closeAdd: function () { set({ comAdd: false }); },
      form: comFormVals(self, cd, isStaff),
      sources: 'Sources : INSEE, base SIRENE des établissements (Licence Ouverte) · © contributeurs OpenStreetMap (ODbL). Un commerce peut demander à ne plus être sollicité ou à corriger sa fiche.',
      mr: mrFormVals(self, c, selRaw), sig: sigVals(self, selRaw)
    };
  }
  function comFormVals(self, cd, isStaff) {
    var u = U(self), fm = u.comForm || {};
    var on = function (k) { return function (e) { ui(self, { comForm: Object.assign({}, U(self).comForm || {}, (function () { var o = {}; o[k] = ev(e); return o; })()) }); }; };
    return {
      nom: fm.nom || '', adr: fm.adr || '', tel: fm.tel || '', email: fm.email || '', web: fm.web || '', cat: fm.cat || 'alim',
      onNom: on('nom'), onAdr: on('adr'), onTel: on('tel'), onEmail: on('email'), onWeb: on('web'), onCat: on('cat'),
      catOpts: R.CATS.map(function (k) { return { v: k.id, l: k.label }; }),
      err: u.comFormErr || '', hasErr: !!u.comFormErr,
      note: cd.srv ? 'Le commerce est placé au centre de Cherbourg-en-Cotentin ; ajustez sa position depuis l’onglet Réseau.' : 'Démonstration : le commerce est enregistré sur cet appareil seulement.',
      save: function () {
        var x = U(self).comForm || {};
        if (!String(x.nom || '').trim()) { ui(self, { comFormErr: 'Le nom est requis.' }); return; }
        var base = window.CasaCarte && window.CasaCarte.ready() ? window.CasaCarte.commune(R.CHERBOURG) : null;
        var item = { id: R.nid('m'), nom: String(x.nom).trim().slice(0, 120), cat: x.cat || 'services', act: R.CAT[x.cat || 'services'].label, adr: String(x.adr || '').trim().slice(0, 200), cp: '', ville: 'Cherbourg-en-Cotentin',
          tel: String(x.tel || '').trim().slice(0, 30), email: String(x.email || '').trim().slice(0, 160), web: String(x.web || '').trim().slice(0, 200), lat: base ? base.lat + (Math.random() - 0.5) * 0.01 : 49.633, lon: base ? base.lon + (Math.random() - 0.5) * 0.016 : -1.62, src: ['manuel'], maj: new Date().toISOString() };
        if (cd.srv) {
          call('PUT', '/commerces/' + encodeURIComponent(item.id), item).then(function () { ui(self, { comAdd: false, comFormErr: '', comSel: item.id }); R.reloadCom(self); self.say('Commerce ajouté à l’annuaire'); }).catch(function (e) { ui(self, { comFormErr: e.message }); });
        } else {
          var l = readLS(LS.com, []); l.push(item); writeLS(LS.com, l);
          self.setState({ rsCom: null }); ui(self, { comAdd: false, comFormErr: '', comSel: item.id }); self.say('Commerce ajouté (démonstration, sur cet appareil)');
        }
      }
    };
  }
  /* demande de mise en relation « via Casa Besports » */
  function mrFormVals(self, c, com) {
    var u = U(self), s = self.state, fm = u.mrForm || {};
    var on = function (k) { return function (e) { var o = {}; o[k] = ev(e); ui(self, { mrForm: Object.assign({}, U(self).mrForm || {}, o), mrErr: '' }); }; };
    var clubOpts = [{ v: '', l: 'À titre personnel' }].concat(c.D.clubs.map(function (cl) { return { v: cl.id, l: cl.name }; })).concat([{ v: 'autre', l: 'Une autre association' }]);
    var defName = fm.nom != null ? fm.nom : (s.name || ''), defMail = fm.email != null ? fm.email : (s.email || '');
    return {
      open: !!u.mrOpen && !!com, close: function () { ui(self, { mrOpen: false }); }, com: com ? com.nom : '',
      nom: defName, email: defMail, tel: fm.tel || '', club: fm.club != null ? fm.club : (c.clubRoleId || ''), autre: fm.autre || '', objet: fm.objet || R.MR_OBJETS[0], message: fm.message || '', consent: !!fm.consent, hp: fm.hp || '',
      onNom: on('nom'), onEmail: on('email'), onTel: on('tel'), onClub: on('club'), onAutre: on('autre'), onObjet: on('objet'), onMessage: on('message'), onConsent: on('consent'), onHp: on('hp'),
      isAutre: fm.club === 'autre', clubOpts: clubOpts, objetOpts: R.MR_OBJETS.map(function (o) { return { v: o, l: o }; }),
      err: u.mrErr || '', hasErr: !!u.mrErr, sent: u.mrSent || null, isSent: !!u.mrSent, notSent: !u.mrSent,
      sending: !!u.mrSending,
      send: function () {
        var x = Object.assign({ nom: defName, email: defMail, club: c.clubRoleId || '', objet: R.MR_OBJETS[0] }, U(self).mrForm || {});
        if (!String(x.nom || '').trim() || !/.+@.+\..+/.test(x.email || '')) { ui(self, { mrErr: 'Votre nom et un e-mail valide sont requis.' }); return; }
        if (String(x.message || '').trim().length < 20) { ui(self, { mrErr: 'Présentez votre demande en quelques phrases (20 caractères au moins).' }); return; }
        if (!x.consent) { ui(self, { mrErr: 'Cochez la case pour autoriser Casa Besports à transmettre votre demande.' }); return; }
        var clubName = x.club === 'autre' ? String(x.autre || '').trim() : x.club ? (c.D.clubs.find(function (k) { return k.id === x.club; }) || {}).name || '' : '';
        var payload = { commerceId: com.id, nom: String(x.nom).trim(), email: String(x.email).trim(), tel: String(x.tel || '').trim(), clubId: x.club && x.club !== 'autre' ? x.club : '', club: clubName, objet: x.objet, message: String(x.message).trim(), consent: true, website: x.hp || '' };
        var done = function (ref, key) {
          if (self.addMyMr) self.addMyMr({ ref: ref, key: key || '', commerce: com.nom, objet: payload.objet, at: new Date().toISOString() });
          ui(self, { mrSent: { ref: ref }, mrSending: false, mrForm: Object.assign({}, U(self).mrForm || {}, { message: '' }) });
        };
        if (srvPublic()) {
          ui(self, { mrSending: true });
          call('POST', '/mises-en-relation', payload).then(function (r) { done(r.ref, r.key); }).catch(function (e) { ui(self, { mrErr: e.message || 'Envoi impossible', mrSending: false }); });
        } else {
          var l = readLS(LS.mr, []); var ref = 'MR-' + new Date().getFullYear() + '-' + String(l.length + 1).padStart(4, '0');
          var at = new Date().toISOString();
          l.unshift(Object.assign({ ref: ref, statut: 'demande', at: at, commerce: com.nom, commerceEmail: com.email || '', commerceTel: com.tel || '', demo: true, journal: [{ at: at, qui: payload.nom, quoi: 'Demande envoyée depuis la carte (démonstration)' }] }, payload));
          saveMrLocal(self, l); done(ref, 'demo');
        }
      }
    };
  }
  /* « Signaler une erreur » / « Je suis ce commerce » */
  function sigVals(self, com) {
    var u = U(self), fm = u.sigForm || {};
    var on = function (k) { return function (e) { var o = {}; o[k] = ev(e); ui(self, { sigForm: Object.assign({}, U(self).sigForm || {}, o) }); }; };
    return {
      open: !!u.sigOpen && !!com, close: function () { ui(self, { sigOpen: false }); }, com: com ? com.nom : '',
      types: [['erreur', 'Une information est fausse'], ['ferme', 'Ce commerce a fermé'], ['optout', 'Je suis ce commerce et ne souhaite plus être sollicité'], ['revendiquer', 'Je suis ce commerce et je veux compléter ma fiche']].map(function (t) { return Object.assign(pill((fm.type || 'erreur') === t[0]), { label: t[1], pick: function () { ui(self, { sigForm: Object.assign({}, U(self).sigForm || {}, { type: t[0] }) }); } }); }),
      texte: fm.texte || '', onTexte: on('texte'), email: fm.email || '', onEmail: on('email'), sent: !!u.sigSent, notSent: !u.sigSent,
      send: function () {
        var x = Object.assign({ type: 'erreur' }, U(self).sigForm || {});
        if (!/.+@.+\..+/.test(x.email || '')) { self.say('Indiquez un e-mail pour qu’on puisse vous répondre'); return; }
        var p = { type: x.type, texte: String(x.texte || '').slice(0, 1000), email: x.email };
        var fin = function () { ui(self, { sigSent: true, sigForm: {} }); };
        if (srvPublic()) call('POST', '/commerces/' + encodeURIComponent(com.id) + '/signalement', p).then(fin).catch(function (e) { self.say(e.message); });
        else { fin(); self.say('Démonstration : le signalement serait transmis à l’équipe'); }
      }
    };
  }

  /* ================= ESPACE CORRESPONDANT DE CLUB ================= */
  function clubVals(self, c) {
    var s = self.state, u = U(self), D = c.D;
    var clubId = c.clubRoleId; var club = D.clubs.find(function (k) { return k.id === clubId; }) || D.clubs[0];
    var posts = (c.posts || []).filter(function (p) { return p.source === 'club' && (p.clubId === club.id || (p.clubs || [])[0] === club.id) && (p.mine || p.author === c.me.name || !srvStaff()); });
    var ST = { draft: 'Brouillon', review: 'Envoyé à la rédaction', corrections: 'Corrections demandées', scheduled: 'Programmé', published: 'Publié', rejected: 'Non retenu' };
    var STC = { draft: 'st-draft', review: 'st-review', corrections: 'st-corr', scheduled: 'st-sched', published: 'st-pub', rejected: 'st-rej' };
    var create = function (mid) {
      var m = R.modele(mid), id = 'c' + Date.now(), at = new Date().toISOString();
      var comp = m.compose({}, club.name);
      var p = { id: id, author: c.me.name, status: 'draft', updated: 'à l’instant', updatedAt: at, type: m.type, sport: club.sport === 'Multisport' ? 'Autre' : club.sport, tag: m.tag, clubs: [club.id], img: '', alt: '', credit: '', premium: false, schedule: '',
        title: comp.title, dek: comp.dek, body: comp.body, log: [{ who: c.me.name, when: 'à l’instant', at: at, what: 'Contenu créé depuis l’espace club (' + m.label.toLowerCase() + ').' }], source: 'club', clubId: club.id, clubName: club.name, clubForm: { modele: m.id, champs: {}, photoOk: false } };
      self.setState({ posts: [p].concat(c.posts || []), studioTab: 'cedit', clubEditId: id });
    };
    var cur = posts.find(function (p) { return p.id === s.clubEditId; }) || null;
    var editable = cur && ['draft', 'corrections'].indexOf(cur.status) >= 0;
    var ed = null;
    if (cur) {
      var m = R.modele(cur.clubForm && cur.clubForm.modele), v = (cur.clubForm && cur.clubForm.champs) || {};
      var recompose = function (champs, extra) {
        var comp = m.compose(champs, club.name), cf = Object.assign({}, cur.clubForm, { champs: champs }, extra || {});
        var patch = { clubForm: cf, dek: comp.dek, body: comp.body + (cf.libre ? '\n\n' + cf.libre : '') };
        if (!cf.titreLibre) patch.title = comp.title.slice(0, 80);
        c.setPost(cur.id, patch);
      };
      var setChamp = function (k, val) { var ch = Object.assign({}, v); ch[k] = val; recompose(ch); };
      ed = {
        modele: m.label, title: cur.title, onTitle: function (e) { c.setPost(cur.id, { title: String(ev(e)).slice(0, 80), clubForm: Object.assign({}, cur.clubForm, { titreLibre: true }) }); },
        titreAuto: function () { var comp = m.compose(v, club.name); c.setPost(cur.id, { title: comp.title.slice(0, 80), clubForm: Object.assign({}, cur.clubForm, { titreLibre: false }) }); }, titreLibre: !!(cur.clubForm && cur.clubForm.titreLibre),
        champs: m.champs.map(function (f) { var val = v[f.k] == null || (f.type === 'select' && v[f.k] === '') ? (f.type === 'select' ? f.opts[0][0] : '') : v[f.k]; return { k: f.k, label: f.label, ph: f.ph, val: val, checked: !!val, wide: f.wide || f.type === 'textarea' ? 'is-wide' : '',
          isText: ['text', 'number', 'date', 'time', 'email', 'tel', 'url'].indexOf(f.type) >= 0, isArea: f.type === 'textarea', isSelect: f.type === 'select', isCheck: f.type === 'check', type: f.type, opts: (f.opts || []).map(function (o) { return { v: o[0], l: o[1] }; }),
          on: function (e) { setChamp(f.k, ev(e)); } }; }),
        libre: (cur.clubForm && cur.clubForm.libre) || '', onLibre: function (e) { recompose(v, { libre: ev(e) }); },
        dek: cur.dek, blocks: (c.blocksOf ? c.blocksOf(cur.body) : []),
        img: cur.img || '', hasImg: !!cur.img, alt: cur.alt || '', credit: cur.credit || '', photoOk: !!(cur.clubForm && cur.clubForm.photoOk),
        onAlt: function (e) { c.setPost(cur.id, { alt: ev(e) }); }, onCredit: function (e) { c.setPost(cur.id, { credit: ev(e) }); },
        onPhotoOk: function (e) { c.setPost(cur.id, { clubForm: Object.assign({}, cur.clubForm, { photoOk: !!ev(e) }) }); },
        onFile: function (e) { var fl = e.target.files && e.target.files[0]; if (!fl) return; resizeImage(fl, 1600, 0.84).then(function (url) { c.setPost(cur.id, { img: url }); }).catch(function () { self.say('Image illisible'); }); e.target.value = ''; },
        removeImg: function () { c.setPost(cur.id, { img: '', alt: '', credit: '' }); },
        status: ST[cur.status] || cur.status, stCls: STC[cur.status] || '', note: cur.note || '', hasNote: cur.status === 'corrections' && !!cur.note,
        editable: editable, locked: !editable, lockMsg: cur.status === 'review' ? 'Envoyé : la rédaction relit votre contenu. Vous serez prévenu ici.' : cur.status === 'published' ? 'Publié sur Casa Besports. Merci !' : cur.status === 'rejected' ? 'Ce contenu n’a pas été retenu.' + (cur.note ? ' Motif : ' + cur.note : '') : '',
        save: function () { c.setPost(cur.id, {}, 'Brouillon enregistré.'); self.say('Brouillon enregistré'); },
        send: function () {
          var miss = [];
          if (!String(cur.title || '').trim() || /\[/.test(cur.title)) miss.push('un titre complet');
          if (String(cur.body || '').replace(/\s+/g, ' ').trim().length < 60) miss.push('quelques phrases de plus');
          if (cur.img && !String(cur.alt || '').trim()) miss.push('la description de la photo');
          if (cur.img && !String(cur.credit || '').trim()) miss.push('le crédit de la photo');
          if (cur.img && !(cur.clubForm && cur.clubForm.photoOk)) miss.push('l’attestation d’autorisation pour la photo');
          if (m.id === 'portrait' && !v.accord) miss.push('l’accord de la personne présentée');
          if (miss.length) { self.say('Il manque : ' + miss.join(', ')); return; }
          c.setPost(cur.id, { status: 'review' }, 'Envoyé à la rédaction par le correspondant de ' + club.name + '.'); self.say('Envoyé à la rédaction : vous serez prévenu ici');
        },
        remove: function () { if (cur.status !== 'draft') return; self.setState({ posts: (c.posts || []).filter(function (p) { return p.id !== cur.id; }), studioTab: 'club', clubEditId: null }); if (srvStaff()) call('DELETE', '/studio/posts/' + encodeURIComponent(cur.id)).catch(function () {}); self.say('Brouillon supprimé'); },
        canRemove: cur.status === 'draft', back: function () { self.setState({ studioTab: 'clist' }); }
      };
    }
    /* fiche du club */
    var fd = fichesData(self), valid = fd.valid[club.id] || {}, dem = fd.dem[club.id] || null;
    var ff = u.ficheForm && u.ficheForm.club === club.id ? u.ficheForm.data : Object.assign({}, valid, dem && dem.statut === 'en attente' ? dem.data : {});
    var onF = function (k) { return function (e) { var d = Object.assign({}, ff); d[k] = ev(e); ui(self, { ficheForm: { club: club.id, data: d } }); }; };
    var fiche = {
      champs: R.FICHE.map(function (f) { return { k: f.k, label: f.label, ph: f.ph, val: ff[f.k] || '', type: f.type === 'textarea' ? 'text' : f.type, isArea: f.type === 'textarea', isText: f.type !== 'textarea', wide: f.wide || f.type === 'textarea' ? 'is-wide' : '', on: onF(f.k) }; }),
      statut: dem ? (dem.statut === 'en attente' ? 'Modifications envoyées le ' + R.fmtDate(dem.at) + ' : en attente de validation' : dem.statut === 'refusee' ? 'Dernière demande non validée' + (dem.note ? ' : ' + dem.note : '') : 'Fiche validée le ' + R.fmtDate(dem.decideLe || dem.at)) : (Object.keys(valid).length ? 'Fiche en ligne' : 'Aucune fiche publiée pour l’instant'),
      stCls: dem && dem.statut === 'en attente' ? 'st-review' : dem && dem.statut === 'refusee' ? 'st-corr' : 'st-pub',
      send: function () {
        var data = R.cleanFiche(ff);
        if (!data.presentation && !data.horaires && !data.lieu) { self.say('Renseignez au moins la présentation, le lieu ou les entraînements'); return; }
        var at = new Date().toISOString();
        if (fd.srv) call('PUT', '/club/fiche', { data: data }).then(function () { R.reloadFiches(self); ui(self, { ficheForm: null }); self.say('Fiche envoyée à la rédaction pour validation'); }).catch(function (e) { self.say(e.message); });
        else { var all = readLS(LS.fiches, { valid: {}, dem: {} }); all.dem = all.dem || {}; all.dem[club.id] = { statut: 'en attente', at: at, data: data, par: c.me.name }; writeLS(LS.fiches, all); self.setState({ rsFiches: null }); ui(self, { ficheForm: null }); self.say('Fiche envoyée à la rédaction pour validation (démonstration)'); }
      }
    };
    var counts = { draft: 0, review: 0, corrections: 0, published: 0 }; posts.forEach(function (p) { if (counts[p.status] != null) counts[p.status]++; });
    return {
      club: club.name, sport: club.sport, city: club.city, id: club.id, init: club.name.replace(/^(AS|ES|FC|CS|US|UC|SC|PL)\s/, '').split(/[\s-]+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(),
      kpis: [['draft', 'Brouillons'], ['corrections', 'À corriger'], ['review', 'En relecture'], ['published', 'Publiés']].map(function (k) { return { v: String(counts[k[0]]), l: k[1], go: function () { self.setState({ studioTab: 'clist' }); } }; }),
      modeles: R.MODELES.map(function (m) { return { label: m.label, sub: m.sub, go: function () { create(m.id); } }; }),
      items: posts.slice().sort(function (a, b) { return String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')); }).map(function (p) { return { title: p.title, tag: p.tag || '', status: ST[p.status] || p.status, stCls: STC[p.status] || '', when: p.updated || R.fmtDate(p.updatedAt), note: p.status === 'corrections' ? p.note || '' : '', hasNote: p.status === 'corrections' && !!p.note,
        open: function () { self.setState({ studioTab: 'cedit', clubEditId: p.id }); } }; }),
      noItems: posts.length === 0, ed: ed || {}, hasEd: !!ed, fiche: fiche,
      tabFiche: self.state.studioTab === 'fiche', tabCharte: self.state.studioTab === 'charte', tabHome: self.state.studioTab === 'club', tabList: self.state.studioTab === 'clist', tabEdit: self.state.studioTab === 'cedit' && !!ed
    };
  }
  /* image choisie par l’utilisateur → JPEG redimensionné (data URL) */
  function resizeImage(file, max, q) {
    return new Promise(function (ok, ko) {
      var rd = new FileReader();
      rd.onerror = ko;
      rd.onload = function () {
        var img = new Image();
        img.onerror = ko;
        img.onload = function () { var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)); var cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k); var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height); ok(cv.toDataURL('image/jpeg', q || 0.85)); };
        img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }
  R.resizeImage = resizeImage;

  /* ================= ADMINISTRATION : onglet « Réseau » ================= */
  function admVals(self, c) {
    var u = U(self), sub = u.adm || 'mr', set = function (p) { ui(self, p); };
    var md = mrData(self), list = md.list || [], cfg = md.cfg || { taux: 10 };
    var filt = u.mrFiltre || 'actives';
    var actives = function (m) { return ['demande', 'transmise', 'discussion'].indexOf(m.statut) >= 0; };
    var fl = list.filter(function (m) { return filt === 'tout' || (filt === 'actives' ? actives(m) : m.statut === filt); });
    var sel = list.find(function (m) { return m.ref === u.mrSel; }) || null;
    var persistMr = function (ref, patch, quoi, done) {
      if (md.srv) {
        call('PATCH', '/mises-en-relation/' + encodeURIComponent(ref), Object.assign({}, patch, { journal: quoi })).then(function (r) { R.reloadMr(self); self.say(r.message || 'Mise en relation mise à jour'); if (done) done(r); }).catch(function (e) { self.say(e.message); });
      } else {
        var at = new Date().toISOString();
        var l = list.map(function (m) { if (m.ref !== ref) return m; var n = Object.assign({}, m, patch); n.journal = (m.journal || []).concat([{ at: at, qui: c.me.name, quoi: quoi }]); return n; });
        saveMrLocal(self, l); self.say('Mise en relation mise à jour (démonstration)'); if (done) done({});
      }
    };
    var mf = u.mrEdit && sel && u.mrEdit.ref === sel.ref ? u.mrEdit : null;
    var onM = function (k) { return function (e) { var o = Object.assign({}, mf || { ref: sel.ref }); o[k] = ev(e); ui(self, { mrEdit: o }); }; };
    var detail = null;
    if (sel) {
      var msg = mf && mf.texte != null ? mf.texte : (sel.texte || R.mrMessage(sel, { nom: sel.commerce }));
      var canal = (mf && mf.canal) || sel.canal || (sel.commerceEmail ? 'email' : 'telephone');
      var p = Object.assign({ remunere: true, montant: '', taux: cfg.taux, factureA: 'club', debut: new Date().toISOString().slice(0, 10), duree: '1 saison' }, sel.partenariat || {}, (mf && mf.part) || {});
      var onP = function (k) { return function (e) { var o = Object.assign({}, mf || { ref: sel.ref }); o.part = Object.assign({}, p); o.part[k] = ev(e); ui(self, { mrEdit: o }); }; };
      var com = R.commission(p.montant, p.taux);
      detail = {
        ref: sel.ref, statut: R.MR_LABEL[sel.statut] || sel.statut, stCls: 'mr-' + sel.statut, commerce: sel.commerce, commerceContact: [sel.commerceEmail, sel.commerceTel].filter(Boolean).join(' · ') || 'Aucun contact connu : passez en boutique ou par téléphone',
        demandeur: sel.nom + (sel.club ? ' · ' + sel.club : ' · à titre personnel'), demandeurContact: [sel.email, sel.tel].filter(Boolean).join(' · '), objet: sel.objet, message: sel.message, at: R.fmtDT(sel.at),
        texte: msg, onTexte: onM('texte'), canalOpts: R.CANAUX_MR.map(function (x) { return { v: x[0], l: x[1] }; }), canal: canal, onCanal: onM('canal'),
        isDemande: sel.statut === 'demande', isOuverte: ['transmise', 'discussion'].indexOf(sel.statut) >= 0, isConclu: sel.statut === 'conclu', isClose: ['sans-suite', 'refusee'].indexOf(sel.statut) >= 0,
        note: (mf && mf.note) || '', onNote: onM('note'),
        transmettre: function () {
          if (canal === 'email' && !sel.commerceEmail) { self.say('Pas d’e-mail connu pour ce commerce : choisissez téléphone, visite ou courrier'); return; }
          persistMr(sel.ref, { statut: 'transmise', canal: canal, texte: msg }, 'Validée et transmise au commerce (' + (R.CANAUX_MR.find(function (x) { return x[0] === canal; }) || [canal, canal])[1].toLowerCase() + ')', function () { ui(self, { mrEdit: null }); });
        },
        refuser: function () { var n = (mf && mf.note) || ''; if (!n.trim()) { self.say('Indiquez le motif (il sera communiqué au demandeur)'); return; } persistMr(sel.ref, { statut: 'refusee', motif: n }, 'Non transmise : ' + n); },
        discussion: function () { persistMr(sel.ref, { statut: 'discussion' }, 'Le commerce a répondu : en discussion'); },
        sansSuite: function () { persistMr(sel.ref, { statut: 'sans-suite' }, 'Sans suite' + ((mf && mf.note) ? ' : ' + mf.note : '')); },
        rouvrir: function () { persistMr(sel.ref, { statut: 'discussion' }, 'Relancée : de nouveau en discussion'); },
        part: { remunere: !!p.remunere, montant: p.montant, taux: p.taux, factureA: p.factureA, debut: p.debut, duree: p.duree,
          onRemunere: onP('remunere'), onMontant: onP('montant'), onTaux: onP('taux'), onFactureA: onP('factureA'), onDebut: onP('debut'), onDuree: onP('duree'),
          factureOpts: [{ v: 'club', l: 'Au club ou au demandeur' }, { v: 'commerce', l: 'Au commerce' }], commission: R.eur(com), montantTxt: R.eur(p.montant) },
        conclure: function () {
          if (p.remunere && !(+p.montant > 0)) { self.say('Indiquez le montant du partenariat (HT)'); return; }
          persistMr(sel.ref, { statut: 'conclu', partenariat: { remunere: !!p.remunere, montant: +p.montant || 0, taux: +p.taux || 0, commission: p.remunere ? com : 0, factureA: p.factureA, debut: p.debut, duree: p.duree, payee: false } },
            p.remunere ? 'Partenariat rémunéré conclu : ' + R.eur(p.montant) + ' HT, commission Casa ' + p.taux + ' % = ' + R.eur(com) : 'Partenariat conclu (non rémunéré)', function () { ui(self, { mrEdit: null, mrFiltre: 'conclu' }); });
        },
        conclu: sel.partenariat ? { txt: sel.partenariat.remunere ? R.eur(sel.partenariat.montant) + ' HT · ' + (sel.partenariat.duree || '') + ' · commission ' + sel.partenariat.taux + ' % = ' + R.eur(sel.partenariat.commission) : 'Partenariat non rémunéré (dotation, échange…)', payee: !!sel.partenariat.payee, facture: sel.partenariat.facture || '', hasFacture: !!sel.partenariat.facture,
          togglePayee: function () { persistMr(sel.ref, { partenariat: Object.assign({}, sel.partenariat, { payee: !sel.partenariat.payee, payeeLe: !sel.partenariat.payee ? new Date().toISOString().slice(0, 10) : '' }) }, !sel.partenariat.payee ? 'Commission encaissée' : 'Commission marquée non encaissée'); } } : {},
        journal: (sel.journal || []).slice().reverse().map(function (j) { return { at: R.fmtDT(j.at), qui: j.qui || '', quoi: j.quoi }; }),
        close: function () { set({ mrSel: '', mrEdit: null }); }, demo: !!sel.demo
      };
    }
    var tot = list.filter(function (m) { return m.statut === 'conclu' && m.partenariat && m.partenariat.remunere; });
    var sum = function (f) { return tot.reduce(function (a, m) { return a + (+f(m) || 0); }, 0); };
    var kpis = [['À valider', list.filter(function (m) { return m.statut === 'demande'; }).length], ['En cours', list.filter(function (m) { return ['transmise', 'discussion'].indexOf(m.statut) >= 0; }).length], ['Conclues', list.filter(function (m) { return m.statut === 'conclu'; }).length],
      ['Montant des partenariats', R.eur(sum(function (m) { return m.partenariat.montant; }))], ['Commissions', R.eur(sum(function (m) { return m.partenariat.commission; }))], ['À encaisser', R.eur(sum(function (m) { return m.partenariat.payee ? 0 : m.partenariat.commission; }))]].map(function (k) { return { l: k[0], v: String(k[1]) }; });
    var csv = function () {
      var cols = ['ref', 'at', 'statut', 'commerce', 'nom', 'email', 'club', 'objet', 'canal', 'montant_ht', 'taux', 'commission', 'payee'];
      var rows = list.map(function (m) { var pp = m.partenariat || {}; return [m.ref, m.at, R.MR_LABEL[m.statut] || m.statut, m.commerce, m.nom, m.email, m.club || '', m.objet, m.canal || '', pp.montant || '', pp.taux || '', pp.commission || '', pp.payee ? 'oui' : '']; });
      var esc2 = function (v) { v = String(v == null ? '' : v); return /[";\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      var txt = '﻿' + [cols].concat(rows).map(function (r) { return r.map(esc2).join(';'); }).join('\n');
      // sans téléchargement possible (aperçu du canevas), le tableau part dans le presse-papiers, colonnes séparées par des tabulations
      var copier = function () {
        var tsv = [cols].concat(rows).map(function (r) { return r.map(function (v) { return String(v == null ? '' : v).replace(/[\t\r\n]+/g, ' '); }).join('\t'); }).join('\n');
        var ko = function () { self.say('Copie impossible ici : exportez depuis le site'); };
        try { navigator.clipboard.writeText(tsv).then(function () { self.say('Tableau copié : collez-le dans un tableur'); }, ko); } catch (e) { ko(); }
      };
      var CV = window.CasaCV;
      if (CV && CV.saveBlob) CV.saveBlob(self, new Blob([txt], { type: 'text/csv;charset=utf-8' }), 'mises-en-relation-casa-besports.csv', 'Export enregistré', copier);
      else copier();
    };
    /* annuaire (import, état) */
    var cd = comData(self);
    var imp = u.imp || null;
    var annuaire = {
      srv: !!cd.srv, count: (cd.list || []).length.toLocaleString('fr-FR'), maj: cd.maj ? R.fmtDT(cd.maj) : 'jamais', sources: cd.sources || {},
      srcTxt: cd.sources && (cd.sources.sirene || cd.sources.osm) ? (cd.sources.sirene || 0).toLocaleString('fr-FR') + ' établissements SIRENE · ' + (cd.sources.osm || 0).toLocaleString('fr-FR') + ' points OpenStreetMap · ' + (cd.sources.fusion || 0).toLocaleString('fr-FR') + ' rapprochés · ' + (cd.sources.manuel || 0) + ' ajout(s) manuel(s)' : '',
      importing: !!(imp && imp.running), impTxt: imp ? imp.texte || '' : '', canImport: !!cd.srv && c.isAdmin,
      lancer: function () { set({ imp: { running: true, texte: 'Importation lancée…' } }); call('POST', '/commerces/import', {}).then(function () { pollImport(self); }).catch(function (e) { set({ imp: { running: false, texte: e.message } }); }); },
      demoNote: !cd.srv ? 'Démonstration : l’importation SIRENE + OpenStreetMap se lance sur la plateforme (serveur connecté à Internet).' : ''
    };
    /* fiches clubs en attente */
    var fd = fichesData(self), D = c.D;
    var fichesDem = Object.keys(fd.dem || {}).filter(function (k) { return fd.dem[k].statut === 'en attente'; }).map(function (k) {
      var d = fd.dem[k], cl = D.clubs.find(function (x) { return x.id === k; }) || { name: k }, old = fd.valid[k] || {};
      return { club: cl.name, at: R.fmtDT(d.at), par: d.par || '',
        lignes: R.FICHE.filter(function (f) { return (d.data[f.k] || '') !== (old[f.k] || ''); }).map(function (f) { return { label: f.label, avant: old[f.k] || '—', apres: d.data[f.k] || '—' }; }),
        valider: function () { decideFiche(self, fd, k, true, ''); }, refuser: function () { var n = (U(self).ficheNote || {})[k] || ''; if (!n.trim()) { self.say('Indiquez le motif du refus'); return; } decideFiche(self, fd, k, false, n); },
        note: (u.ficheNote || {})[k] || '', onNote: function (e) { var o = Object.assign({}, U(self).ficheNote || {}); o[k] = ev(e); ui(self, { ficheNote: o }); } };
    });
    return {
      subs: [['mr', 'Mises en relation'], ['annuaire', 'Annuaire des commerces'], ['cv', 'Certifications'], ['fiches', 'Fiches clubs']].map(function (x) { var on = sub === x[0]; var n = x[0] === 'mr' ? list.filter(function (m) { return m.statut === 'demande'; }).length : x[0] === 'fiches' ? fichesDem.length : x[0] === 'cv' ? (c.cvPending || 0) : 0; return Object.assign(pill(on), { label: x[1], n: n ? String(n) : '', hasN: n > 0, pick: function () { set({ adm: x[0] }); } }); }),
      isMr: sub === 'mr', isAnnuaire: sub === 'annuaire', isCv: sub === 'cv', isFiches: sub === 'fiches',
      kpis: kpis, filtres: [['actives', 'En cours'], ['demande', 'À valider'], ['conclu', 'Conclues'], ['tout', 'Toutes']].map(function (x) { return Object.assign(pill(filt === x[0]), { label: x[1], pick: function () { set({ mrFiltre: x[0] }); } }); }),
      rows: fl.map(function (m) { return { ref: m.ref, commerce: m.commerce, qui: m.nom + (m.club ? ' · ' + m.club : ''), objet: m.objet, statut: R.MR_LABEL[m.statut] || m.statut, stCls: 'mr-' + m.statut, at: R.fmtDate(m.at), cur: m.ref === u.mrSel ? 'true' : 'false', pick: function () { set({ mrSel: m.ref, mrEdit: null }); } }; }),
      noRows: fl.length === 0, loading: !!md.loading, hasDetail: !!detail, detail: detail || {}, csv: csv, csvLabel: !window.CASA_ARTIFACT || (window.CasaCV && window.CasaCV.dlProbe(self) === true) ? 'Exporter (CSV)' : 'Copier le tableau', taux: String(cfg.taux || 10),
      annuaire: annuaire, fiches: fichesDem, noFiches: fichesDem.length === 0
    };
  }
  function decideFiche(self, fd, clubId, ok, note) {
    if (fd.srv) { call('POST', '/club/demandes/' + encodeURIComponent(clubId) + '/decision', { decision: ok ? 'valider' : 'refuser', note: note }).then(function () { R.reloadFiches(self); self.say(ok ? 'Fiche validée : elle est en ligne' : 'Demande refusée'); }).catch(function (e) { self.say(e.message); }); return; }
    var all = readLS(LS.fiches, { valid: {}, dem: {} }); var d = all.dem[clubId]; if (!d) return;
    if (ok) { all.valid = all.valid || {}; all.valid[clubId] = d.data; }
    all.dem[clubId] = Object.assign({}, d, { statut: ok ? 'validee' : 'refusee', note: note, decideLe: new Date().toISOString() });
    writeLS(LS.fiches, all); self.setState({ rsFiches: null }); self.say(ok ? 'Fiche validée (démonstration)' : 'Demande refusée (démonstration)');
  }
  function pollImport(self) {
    call('GET', '/commerces/import').then(function (r) {
      ui(self, { imp: { running: !!r.running, texte: r.texte || '' } });
      if (r.running) setTimeout(function () { pollImport(self); }, 2500); else R.reloadCom(self);
    }).catch(function () { ui(self, { imp: { running: false, texte: 'Suivi de l’importation indisponible' } }); });
  }

  /* ================= fiche publique d’un club (page club) ================= */
  function ficheClub(self, clubId) {
    var fd = fichesData(self), v = fd.valid[clubId];
    if (!v) return { has: false, none: true, lignes: [] };
    var L = R.FICHE.filter(function (f) { return v[f.k] && f.k !== 'presentation'; }).map(function (f) { var val = v[f.k], lk = f.k === 'web' && /^https?:\/\//.test(val); return { label: f.label.replace(' public du club', '').replace(' public', ''), val: val, isLink: lk, notLink: !lk, href: val }; });
    return { has: true, none: false, presentation: v.presentation || '', hasPres: !!v.presentation, lignes: L };
  }

  /* ================= point d’entrée ================= */
  R.vals = function (self, c) {
    var out = { carte: {}, com: {}, club: {}, adm: {}, fiche: { has: false, none: true, lignes: [] } };
    try {
      if (c.V === 'map') { out.carte = carteVals(self, c); out.com = comVals(self, c, out.carte); }
      if (c.V === 'studio' && c.role === 'club') out.club = clubVals(self, c);
      if (c.V === 'studio' && c.canReseau && self.state.studioTab === 'reseau') { out.adm = admVals(self, c); out.com = out.com.mr ? out.com : { form: {} }; }
      if (c.V === 'club' && c.clubId) out.fiche = ficheClub(self, c.clubId);
    } catch (e) { if (typeof console !== 'undefined') console.error('[réseau]', e); }
    return out;
  };
  R.mrDataOf = mrData;
})(CasaReseau);
if (typeof module !== 'undefined' && module.exports) module.exports = CasaReseau;

