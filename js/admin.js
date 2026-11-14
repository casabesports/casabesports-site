/*!
 * Casa Besports — espace administrateur (réservé à l'administrateur du site).
 * Ouverture : menu « Plus › Espace administrateur », bouton « Admin » de l'en-tête, ou adresse #/admin.
 *  - Messagerie : demandes reçues par le site + e-mails des adresses suivies, réponses
 *  - Contenus : toutes les sections modifiables (articles, Gazette, lieux, boutique, vidéos, culture, fonds, À propos, pages légales)
 *  - Images : envoi de photos (redimensionnées automatiquement) dans le stockage du site
 *  - Abonnés : coordonnées des inscrits, étiquettes de la rédaction (supabase/abonnes.sql)
 *  - Équipe : demandes d'accès à la rédaction, rédacteurs habilités
 * Les droits sont vérifiés par Supabase (supabase/administration.sql) : ce fichier n'est que l'interface.
 */
(function () {
  'use strict';
  var A = window.CasaAuth || {};

  // ---------- sections modifiables ----------
  var SECTIONS = [
    { key: 'CASA_ARTICLES', label: 'Articles', desc: 'Les articles publiés (Actualités, accueil). Le plus récent en premier.', item: 'title' },
    { key: 'CASA_CLUBS', label: 'Clubs', desc: 'Les clubs suivis : nom, discipline, ville, niveau, année de création, stade, logo (dans le rond) et photo (pages Clubs, Disciplines, Territoire).', item: 'name' },
    { key: 'CASA_JOUEURS', label: 'Joueurs', desc: 'Joueurs, entraîneurs et arbitres : nom, numéro, poste, club, photo.', item: 'name' },
    { key: 'CASA_PARTENAIRES', label: 'Partenaires', desc: 'Les partenaires affichés sur la page Partenaires : nom, secteur, avantage offert.', item: 'name' },
    { key: 'CASA_ABONNEMENTS', label: 'Abonnements', desc: 'Les formules Casa B+ et La Gazette : nom, prix au mois et à l’année, avantages.', item: 'name' },
    { key: 'CASA_CLUBHOUSE', label: 'Club House', desc: 'Le message de bienvenue et le sondage de la semaine (question vide = pas de sondage).' },
    { key: 'CASA_REGLEMENTS', label: 'Règlements des sports', desc: 'Les règles expliquées de chaque discipline (réalité augmentée et pages sport).' },
    { key: 'CASA_STADES', label: 'Stades (réalité augmentée)', desc: 'Les communes et stades utilisés par « Ma compo en AR ».' },
    { key: 'CASA_GAZETTE_NUMERO', hide: true, label: 'La Gazette · page 1, la Une', desc: 'La première page de La Gazette : numéro, date, surtitre, grand titre, accroche, photo et légende. Le sommaire (page 2) se remplit tout seul.' },
    { key: 'CASA_GAZETTE', label: 'La Gazette du Cotentin', desc: 'Les 31 pages du numéro au même endroit : la Une, le sommaire automatique et les pages intérieures, avec les cartons, formats d’image et positions du texte.', item: 'title' },
    { key: 'CASA_LIEUX', label: 'Lieux', desc: 'Les lieux du territoire : textes et vraies photos (champ « Photo »).', item: 'name' },
    { key: 'CASA_BOUTIQUE', label: 'Boutique : présentation', desc: 'Bandeau de la boutique, affiches des collections et « Vos maillots de cœur » (les boutiques officielles des clubs du Cotentin : nom, club lié, logo, adresse de la boutique).' },
    { key: 'CASA_PRODUITS', label: 'Boutique : produits', desc: 'Fiches produits : nom, prix, photos, tailles, couleurs.', item: 'name' },
    { key: 'CASA_VIDEOS', label: 'Vidéos', desc: 'Vidéos et vignettes.', item: 'title' },
    { key: 'CASA_CULTURE', label: 'Culture', desc: 'Œuvres et photographies des salles Culture.', item: 'title' },
    { key: 'CASA_FONDS', label: 'Fonds de page', desc: 'L’image derrière chaque page du site.' },
    { key: 'CASA_APROPOS', label: 'À propos', desc: 'L’histoire de Casa Besports : ouverture, manifeste, étapes, piliers, conviction et appel final.' },
    { key: 'CASA_ENCARTS', label: 'Encarts sponsors', desc: 'Les publicités de vos sponsors, affichées nettes dans les marges des articles en décor « Gazette d’époque » (sur ordinateur). Nom, visuel, adresse du site et une phrase.', item: 'nom' },
    { key: 'CASA_RESEAUX', label: 'Réseaux sociaux', desc: 'Les liens Instagram, YouTube, TikTok, Facebook, X et LinkedIn en bas de chaque page. Collez l’adresse complète de votre page (https://…). Laissez vide pour masquer un réseau.' },
    { key: 'CASA_LEGAL', label: 'Pages légales', desc: 'Mentions légales, confidentialité, CGV, CGU.' },
    { key: 'CASA_RETOUCHES', label: 'Retouches des pages', desc: 'Textes et images changés directement sur le site (bouton « ✎ Retoucher » en bas à gauche du site). Ici : les revoir, les corriger ou les supprimer.' },
    { key: 'CASA_LEGAL_MAJ', hide: true, label: 'Pages légales · date de mise à jour', desc: 'Date de dernière mise à jour affichée.' }
  ];
  // Modèle d'un nouvel élément quand la liste est vide
  var TEMPLATES = {
    CASA_ARTICLES: { id: '', sport: 'Football', tag: '', date: '', read: '3 min', premium: false, img: '', alt: '', title: '', dek: '', clubs: [], points: ['', ''], author: 'La rédaction', credit: '', decor: '', body: '', titleEn: '', dekEn: '', bodyEn: '', tagEn: '' },
    CASA_GAZETTE: { id: '', sec: 'À la une', kind: 'article', rubric: '', title: '', script: '', kicker: '', img: '', imgCap: '', imgFormat: 'auto', mise: 'auto', paras: [{ t: '' }], colonnes: 'auto', quote: '', quoteBy: '' },
    CASA_LIEUX: { id: '', name: '', short: '', where: '', year: '', img: '', photo: '', hook: '', desc: '', moment: '', sport: '' },
    CASA_PRODUITS: { id: '', line: 'casa', name: '', short: '', price: 0, type: 'tee', img: '', gallery: [], colors: ['marine'], sizes: ['S', 'M', 'L', 'XL'], flag: '', isNew: false, desc: '' },
    CASA_VIDEOS: { id: '', tag: '', date: '', img: '', alt: '', title: '', dek: '', url: '', dur: '' },
    CASA_CLUBS: { id: '', name: '', sport: 'Football', city: '', niveau: '', fondation: '', stade: '', logo: '', img: '' },
    CASA_JOUEURS: { id: '', num: '', name: '', role: 'Attaquant', club: '', clubLabel: '', img: '' },
    CASA_ENCARTS: { id: '', nom: '', img: '', site: '', texte: '', actif: true },
    CASA_PARTENAIRES: { id: '', name: '', mono: '', sector: '', city: '', tier: 'Partenaire', color: '#163a5f', since: 2026, perk: '', desc: '', site: '', app: '', real: true },
    CASA_ABONNEMENTS: { id: '', name: '', mois: 0, an: 0, perks: [''], casab: false, gazette: '', paper: false },
    CASA_CULTURE: { salle: '3', title: '', author: '', year: '', technique: '', img: '', alt: '', text: '' }
  };
  // Modèle d'un élément ajouté dans une sous-liste vide
  var NESTED = { cols3: { h: '', t: '' }, stats: { k: '', l: '' }, enbref: { h: '', t: '' }, card: { k: '', v: '' }, qs: { n: '', q: '', a: '' }, pts: { t: '' }, entries: { w: '', s: '', d: '' }, baro: { dir: 'up', h: '', t: '' }, classement: { t: '' }, blocks: { img: '', sport: '', title: '', text: '' }, retenir: { n: '', h: '', t: '' }, textes: { avant: '', apres: '', apresEn: '', page: '' }, images: { avant: '', apres: '', page: '' }, dates: { annee: '', titre: '', texte: '', titreEn: '', texteEn: '' }, etapes: { annee: '', titre: '', photo: '', alt: '', paragraphes: [] }, etapesEn: { annee: '', titre: '', alt: '', paragraphes: [] }, piliers: { titre: '', texte: '' }, piliersEn: { titre: '', texte: '' }, paras: { t: '' }, sections: ['', ''], collections: { ligne: '', nom: '', accroche: '', titre: '', texte: '', image: '' }, maillots: { nom: '', club: '', sport: 'Football', city: '', logo: '', boutiqueUrl: '', plateforme: '', actif: true } };
  // ---------- La Gazette : 31 pages (la Une, le sommaire, puis 29 pages intérieures) et ses cartons ----------
  var GZ_PAGES = 31, GZ_INNER = 29;
  var GZ_MODELS = [
    ['article', 'Article', 'Titre, chapeau, photo et texte en colonnes. La mise en page la plus souple.', { sec: 'À la une', kind: 'article', rubric: '', title: '', script: '', kicker: '', img: '', imgCap: '', imgFormat: 'auto', mise: 'auto', paras: [{ t: '' }], colonnes: 'auto', quote: '', quoteBy: '' }],
    ['portrait', 'Le visage', 'Le portrait d’une personne : nom, discipline, texte, phrase forte, photo verticale.', { sec: 'Les gens', kind: 'portrait', rubric: 'Le visage du Cotentin', title: '', script: '', name: '', sport: '', text: '', tagline: '', img: '', imgFormat: 'portrait', mise: 'droite', cols3: [{ h: '', t: '' }] }],
    ['qa', 'L’entretien', 'Trois questions, une photo, une citation et une carte d’identité.', { sec: 'Les gens', kind: 'qa', rubric: 'Dans le vestiaire', title: '', script: '', img: '', imgCap: '', imgFormat: 'paysage', who: '', whoSub: '', quote: '', card: [{ k: '', v: '' }], qs: [{ n: '1', q: '', a: '' }] }],
    ['number', 'Le chiffre', 'Un grand chiffre, ce qu’il veut dire, une photo et trois repères.', { sec: 'Le terrain', kind: 'number', rubric: 'Le chiffre', title: '', script: '', big: '', label: '', lead: '', text: '', img: '', imgCap: '', imgFormat: 'classique', mise: 'gauche', cols3: [{ h: '', t: '' }] }],
    ['story', 'L’histoire', 'Une grande photo panoramique, un récit et un encadré « En bref ».', { sec: 'Le territoire', kind: 'story', rubric: 'L’histoire', title: '', script: '', img: '', imgCap: '', imgFormat: 'panoramique', lead: '', paras: [{ t: '' }], colonnes: 'auto', quote: '', enbref: [{ h: '', t: '' }] }],
    ['brief', 'Le week-end en 60 secondes', 'Plusieurs résultats courts avec vignette, et un encadré « À retenir ».', { sec: 'Le terrain', kind: 'brief', rubric: 'Le week-end en 60 secondes', title: '', script: '', blocks: [{ img: '', sport: '', title: '', text: '' }], retenir: [{ n: '1', h: '', t: '' }] }],
    ['choc', 'Le détail choc', 'La page noire : un fait vérifié et sourcé, des chiffres, un encadré.', { sec: 'À la une', kind: 'choc', rubric: 'Le détail choc', title: '', bigA: '', bigB: '', who: '', stats: [{ k: '', l: '' }], paras: [{ t: '' }], colonnes: 'auto', aside: { h: '', t: '' }, why: '', src: '' }],
    ['debat', 'La question qui divise', 'Pour ou contre, avec le vote des lecteurs.', { sec: 'La pause', kind: 'debat', rubric: 'La question qui divise', title: '', script: '', lead: '', pour: { h: '', pts: [{ t: '' }] }, contre: { h: '', pts: [{ t: '' }] }, note: '' }],
    ['lexique', 'Le lexique', 'Des mots du sport ou du Cotentin, expliqués.', { sec: 'La pause', kind: 'lexique', rubric: 'Le lexique', title: '', script: '', lead: '', entries: [{ w: '', s: '', d: '' }] }],
    ['humeur', 'L’humeur', 'Le baromètre (en hausse, stable, en baisse) et un classement pour sourire.', { sec: 'La pause', kind: 'humeur', rubric: 'L’humeur', title: '', script: '', baro: [{ dir: 'up', h: '', t: '' }], clT: '', clSub: '', classement: [{ t: '' }] }],
    ['ads', 'Les partenaires', 'Les avantages des partenaires (repris de la section Partenaires).', { sec: 'La pause', kind: 'ads', rubric: 'Partenaires', title: 'Ils soutiennent le sport d’ici', script: '', kicker: '' }],
    ['back', 'La dernière page', 'Grande photo, l’ours (qui fait la Gazette) et l’appel à s’abonner.', { sec: 'La pause', kind: 'back', rubric: 'Dernière page', title: 'Make it happen', script: 'ici, le sport a une histoire', img: '', imgFormat: 'paysage', solutions: '', ours: '' }]
  ];
  function gzModel(kind) { for (var i = 0; i < GZ_MODELS.length; i++) if (GZ_MODELS[i][0] === kind) return GZ_MODELS[i]; return GZ_MODELS[0]; }
  var SELECTS = {
    kind: GZ_MODELS.map(function (m) { return [m[0], m[1]]; }),
    imgFormat: [['auto', 'Format conseillé par le carton'], ['paysage', 'Paysage 16:9'], ['classique', 'Classique 4:3'], ['carre', 'Carré 1:1'], ['portrait', 'Portrait 3:4'], ['panoramique', 'Panoramique 21:9'], ['libre', 'Image entière, sans recadrage']],
    mise: [['auto', 'Automatique'], ['haut', 'Image en haut, texte dessous'], ['milieu', 'Chapeau, puis image, puis texte'], ['droite', 'Texte à gauche, image à droite'], ['gauche', 'Image à gauche, texte à droite'], ['bas', 'Texte d’abord, image en bas']],
    colonnes: [['auto', 'Automatique'], ['1', '1 colonne'], ['2', '2 colonnes'], ['3', '3 colonnes']],
    dir: [['up', '↑ En hausse'], ['flat', '→ Stable'], ['down', '↓ En baisse']],
    sec: [['À la une', 'À la une'], ['Le terrain', 'Le terrain'], ['Les gens', 'Les gens'], ['Le territoire', 'Le territoire'], ['La pause', 'La pause']]
  };
  var LABELS = {
    logo: 'Logo du club (affiché dans le rond, image carrée de préférence)', niveau: 'Niveau / championnat (ex. Régional 2, Nationale 3)', fondation: 'Année de création', stade: 'Stade ou salle',
    instagram: 'Instagram : adresse de la page (https://www.instagram.com/…)', youtube: 'YouTube : adresse de la chaîne (https://www.youtube.com/@…)', tiktok: 'TikTok : adresse du compte (https://www.tiktok.com/@…)', facebook: 'Facebook : adresse de la page (https://www.facebook.com/…)', x: 'X (Twitter) : adresse du compte (https://x.com/…)', linkedin: 'LinkedIn : adresse de la page (https://www.linkedin.com/company/…)',
    id: 'Identifiant (unique, sans espace ni accent)', title: 'Titre', titre: 'Titre', titleEn: 'Titre (anglais)', titreEn: 'Titre (anglais)', dek: 'Chapeau', dekEn: 'Chapeau (anglais)',
    body: 'Texte de l’article (## intertitre, > citation, ![légende](image))', bodyEn: 'Texte (anglais)', tag: 'Rubrique', tagEn: 'Rubrique (anglais)', sport: 'Discipline', date: 'Date affichée', read: 'Temps de lecture',
    premium: 'Réservé aux abonnés Casa B+', img: 'Image', image: 'Image', photo: 'Photo réelle (remplace l’illustration)', alt: 'Description de l’image', imageAlt: 'Description de l’image', clubs: 'Clubs liés (identifiants)', points: 'Points clés',
    author: 'Auteur', credit: 'Crédit photo', creeLe: 'Créé le (automatique)', modifieLe: 'Mis à jour le (automatique)', name: 'Nom', nom: 'Nom', short: 'Nom court / sous-titre', where: 'Lieu', year: 'Année', hook: 'Accroche', desc: 'Description', moment: 'Moment d’histoire', price: 'Prix (€)', type: 'Type',
    line: 'Collection (clé)', ligne: 'Collection (clé)', gallery: 'Galerie de photos', colors: 'Couleurs', sizes: 'Tailles', flag: 'Pastille', isNew: 'Nouveauté', url: 'Adresse de la vidéo', dur: 'Durée',
    salle: 'Salle (1 tableau, 2 lieux, 3 photo, 4 textile)', technique: 'Technique', text: 'Texte', texte: 'Texte', surtitre: 'Surtitre', accroche: 'Accroche', avantages: 'Avantages', note: 'Note', collections: 'Collections', maillots: 'Vos maillots de cœur : boutiques officielles des clubs', maillotsTitre: 'Vos maillots de cœur : titre', maillotsTexte: 'Vos maillots de cœur : phrase d’introduction', boutiqueUrl: 'Adresse de la boutique du club (https://…, marquée « vient de Casa Besports »)', plateforme: 'Plateforme de la boutique (HelloAsso, Kalisport…)',
    numero: 'Numéro', mention: 'Mention', legende: 'Légende', sec: 'Cahier', kind: 'Carton (modèle de page)', rubric: 'Rubrique', script: 'Sous-titre', kicker: 'Chapeau', paras: 'Paragraphes', t: 'Paragraphe',
    imgCap: 'Légende de l’image', quote: 'Citation', quoteBy: 'Auteur de la citation', modeParDefaut: 'Fond par défaut (aucun, photo, lieux)', pages: 'Pages', paragraphes: 'Paragraphes', paragraphesEn: 'Paragraphes (anglais)',
    city: 'Ville', num: 'Numéro de maillot', role: 'Poste ou fonction', club: 'Club (identifiant, voir la section Clubs)', clubLabel: 'Nom du club affiché (facultatif)', sector: 'Secteur d’activité', tier: 'Niveau de partenariat', site: 'Site internet du partenaire (lien, marqué « vient de Casa Besports »)', app: 'Application du partenaire (lien, facultatif)',
    color: 'Couleur du logo (#xxxxxx)', since: 'Partenaire depuis (année)', perk: 'Avantage offert', real: 'Vrai partenaire (affiché)', mois: 'Prix par mois (€)', an: 'Prix par an (€)', perks: 'Avantages', casab: 'Donne accès à Casa B+',
    gazette: 'Gazette incluse (num, pap, duo ou vide)', paper: 'Envoi papier', bienvenue: 'Message de bienvenue (épinglé)', sondage: 'Sondage de la semaine', question: 'Question (vide = pas de sondage)', options: 'Réponses possibles',
    actif: 'Affiché sur le site', intro: 'Introduction', cles: 'Chiffres clés', source: 'Source', lien: 'Texte du lien', lieux: 'Communes', equipes: 'Équipes', exacts: 'Stades précis', lat: 'Latitude', lon: 'Longitude', cherche: 'Mot du nom du stade',
    citation: 'Citation', citationEn: 'Citation (anglais)', dates: 'Frise des dates', imgFormat: 'Format de l’image', mise: 'Position de l’image et du texte', colonnes: 'Colonnes du texte', tagline: 'Phrase forte', lead: 'Chapeau', label: 'Ce que mesure le chiffre', cols3: 'Trois repères', h: 'Titre', bigA: 'Grand titre (début)', bigB: 'Grand titre (fin, sur bandeau)', who: 'Qui', whoSub: 'Sa fonction', stats: 'Chiffres', k: 'Chiffre ou clé', why: 'Pourquoi on vous le raconte', aside: 'Encadré', enbref: 'En bref', card: 'Carte d’identité', v: 'Valeur', qs: 'Questions', q: 'Question', a: 'Réponse', pour: 'Pour', contre: 'Contre', pts: 'Arguments', note: 'Note', entries: 'Mots', w: 'Mot', s: 'Prononciation ou catégorie', d: 'Définition', baro: 'Baromètre', dir: 'Tendance', clT: 'Titre du classement', clSub: 'Sous-titre du classement', classement: 'Classement', blocks: 'Résultats', retenir: 'À retenir', solutions: 'Solutions du quiz', ours: 'L’ours (qui fait la Gazette)', n: 'Numéro', textes: 'Textes retouchés', images: 'Images remplacées', avant: 'D’origine (texte ou image)', apres: 'Remplacé par', apresEn: 'Remplacé par (anglais)', page: 'Page (vide = toutes les pages)', annee: 'Année', etapes: 'Étapes de l’histoire', etapesEn: 'Étapes (anglais)', piliers: 'Piliers', piliersEn: 'Piliers (anglais)', manifeste: 'Manifeste (paragraphes)', manifesteEn: 'Manifeste (anglais)', manifesteFin: 'Phrase après la citation', soustitre: 'Sous-titre', intro: 'Phrase d’introduction', photoAlt: 'Description de la photo', alt: 'Description de la photo', raisonSurtitre: 'Surtitre des piliers', raisonTitre: 'Titre des piliers', signature: 'Phrase de conviction', signatureSurtitre: 'Surtitre de la conviction', signatureSuite: 'Suite de la conviction', appel: 'Appel final (paragraphes)', appelTitre: 'Titre de l’appel final', appelFin: 'Dernière phrase', sections: 'Sections', src: 'Source', why: 'Pourquoi ça compte', big: 'Chiffre', l: 'Unité'
  };
  var LONG = /^(body|bodyEn|desc|texte|text|dek|dekEn|hook|moment|t|kicker|accroche|motif|message|why|citation|citationEn|note|lead|a|d|ours|solutions)$/;

  // ---------- état ----------
  var S = { open: false, tab: 'msg', setup: null, msgs: [], mf: 'tous', q: '', sel: null, compose: null, contacts: [], team: [], reqs: [], subs: [], key: null, work: null, dirty: false, openCards: {}, images: [], busy: false, loaded: {} };
  var root, body, toastEl, pushed = false, timer = null;

  // ---------- outils ----------
  function E(tag, props) {
    var e = document.createElement(tag); props = props || {};
    Object.keys(props).forEach(function (k) {
      var v = props[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k === 'text') e.textContent = v;
      else if (k === 'value') e.value = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; } e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
  function clone(v) { return v === undefined ? null : JSON.parse(JSON.stringify(v)); }
  function fmtDate(iso) { if (!iso) return ''; var d = new Date(iso); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
  function toast(msg, bad) { if (!toastEl) return; toastEl.textContent = msg; toastEl.className = 'cba-toast on' + (bad ? ' bad' : ''); clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.className = 'cba-toast'; }, 3800); }
  function err(e) { toast((e && e.message) || 'Erreur', true); }
  function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image'; }
  function isImg(k, v) {
    if (/^(img|image|photo|poster|logo|cover)$/i.test(String(k)) || /Img$|Image$/.test(String(k))) return true;
    return typeof v === 'string' && /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(v) && !/\s/.test(v);
  }
  function blank(v) {
    if (Array.isArray(v)) return v.length && typeof v[0] !== 'object' ? [] : (v.length && Array.isArray(v[0]) ? [] : []);
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).forEach(function (k) { o[k] = blank(v[k]); }); return o; }
    if (typeof v === 'number') return 0; if (typeof v === 'boolean') return false; return '';
  }
  function db(fn) { return A.db ? A.db(fn) : Promise.reject(new Error('Comptes non configurés')); }

  // ---------- styles ----------
  var CSS = '' +
    '#cba{position:fixed;inset:0;z-index:2147483000;background:var(--bg,#fff);color:var(--text,#111);display:flex;flex-direction:column;font-family:var(--font-body,system-ui,sans-serif);font-size:15px}' +
    '#cba *{box-sizing:border-box}' +
    '.cba-top{display:flex;align-items:center;gap:.75rem;padding:.6rem 1rem;background:var(--inv-bg,#0b0b0b);color:var(--on-inv,#fff);flex-wrap:wrap}' +
    '.cba-brand{font-weight:900;letter-spacing:.02em;text-transform:uppercase;font-size:14px;margin-right:auto}' +
    '@media(max-width:600px){.cba-brand .long{display:none}}' +
    '.cba-tabs{display:flex;gap:.25rem;overflow-x:auto;width:100%;order:3;padding-bottom:.1rem}' +
    '@media(min-width:900px){.cba-tabs{width:auto;order:0}}' +
    '.cba-tab{border:1.5px solid transparent;background:transparent;color:inherit;font-weight:800;padding:.5rem .8rem;cursor:pointer;white-space:nowrap;font-size:14px;min-height:40px}' +
    '.cba-tab[aria-selected="true"]{background:var(--on-inv,#fff);color:var(--inv-bg,#000)}' +
    '.cba-badge{display:inline-block;min-width:20px;padding:0 5px;margin-left:.35rem;background:var(--danger,#c22);color:#fff;font-size:12px;line-height:20px;text-align:center}' +
    '.cba-x{border:1.5px solid currentColor;background:transparent;color:inherit;padding:.45rem .8rem;font-weight:800;cursor:pointer;min-height:40px}' +
    '.cba-body{flex:1;overflow:auto;padding:1.2rem 1rem 4rem}' +
    '.cba-wrap{max-width:1200px;margin:0 auto}' +
    '.cba-h{font-size:1.6rem;font-weight:900;margin:0 0 .3rem;text-transform:uppercase;letter-spacing:-.01em}' +
    '.cba-sub{color:var(--text-2,#555);margin:0 0 1rem}' +
    '.cba-btn{border:1.5px solid var(--ink,#111);background:var(--surface,#fff);color:var(--ink,#111);font-weight:800;padding:.5rem .9rem;cursor:pointer;min-height:40px;font-size:14px}' +
    '.cba-btn.pri{background:var(--ink,#111);color:var(--bg,#fff)}' +
    '.cba-btn.dan{border-color:var(--danger,#c22);color:var(--danger,#c22)}' +
    '.cba-btn.sm{min-height:32px;padding:.25rem .55rem;font-size:13px}' +
    '.cba-btn[disabled]{opacity:.5;cursor:default}' +
    '.cba-row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}' +
    '.cba-card{border:1.5px solid var(--line,#ddd);background:var(--surface,#fff);padding:1rem;margin-bottom:.8rem}' +
    '.cba-note{border-left:4px solid var(--gold-text,#b8860b);background:var(--surface-2,#f6f3ea);padding:.8rem 1rem;margin:0 0 1rem}' +
    '.cba-in{width:100%;border:1.5px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--text,#111);padding:.55rem .65rem;font:inherit;min-height:40px}' +
    'textarea.cba-in{min-height:90px;resize:vertical;line-height:1.45}' +
    '.cba-lbl{display:block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#666);margin:.7rem 0 .25rem}' +
    '.cba-split{display:grid;grid-template-columns:1fr;gap:1rem}' +
    '@media(min-width:900px){.cba-split{grid-template-columns:minmax(300px,380px) 1fr}}' +
    '.cba-list{display:flex;flex-direction:column;border:1.5px solid var(--line,#ddd);max-height:70vh;overflow:auto}' +
    '.cba-it{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line,#eee);background:var(--surface,#fff);color:inherit;padding:.7rem .8rem;cursor:pointer;font:inherit}' +
    '.cba-it.on{background:var(--surface-2,#f1f1f1);box-shadow:inset 4px 0 0 var(--ink,#111)}' +
    '.cba-it .t{font-weight:800;display:flex;gap:.4rem;align-items:center}' +
    '.cba-it .m{font-size:13px;color:var(--muted,#666);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.cba-dot{width:9px;height:9px;border-radius:50%;background:var(--danger,#c22);flex:none}' +
    '.cba-chip{border:1.5px solid var(--line,#ccc);background:transparent;color:inherit;padding:.3rem .65rem;font-weight:700;cursor:pointer;font-size:13px;min-height:34px}' +
    '.cba-chip[aria-pressed="true"]{background:var(--ink,#111);color:var(--bg,#fff);border-color:var(--ink,#111)}' +
    '.cba-msg{white-space:pre-wrap;line-height:1.55;margin:.8rem 0;padding:.9rem;background:var(--surface-2,#f6f6f6)}' +
    '.cba-kv{display:grid;grid-template-columns:110px 1fr;gap:.2rem .8rem;font-size:14px}.cba-kv dt{color:var(--muted,#666)}.cba-kv dd{margin:0;overflow-wrap:anywhere}' +
    '.cba-secs{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.8rem}' +
    '.cba-tag{display:inline-block;font-size:11px;font-weight:800;text-transform:uppercase;padding:.1rem .4rem;background:#8a5a00;color:#fff;margin-left:.3rem;vertical-align:middle}' +
    '.cba-ed details{border:1.5px solid var(--line,#ddd);margin:.5rem 0;background:var(--surface,#fff)}' +
    '.cba-ed summary{cursor:pointer;padding:.6rem .8rem;font-weight:800;display:flex;gap:.5rem;align-items:center;list-style:none}' +
    '.cba-ed summary::-webkit-details-marker{display:none}' +
    '.cba-ed .inner{padding:0 .8rem .8rem}' +
    '.cba-ed fieldset{border:1px dashed var(--line,#ccc);padding:.2rem .8rem .8rem;margin:.6rem 0}' +
    '.cba-ed legend{font-weight:800;font-size:13px;padding:0 .3rem}' +
    '.cba-tools{margin-left:auto;display:flex;gap:.25rem}' +
    '.cba-img{display:flex;gap:.6rem;align-items:flex-start;flex-wrap:wrap}' +
    '.cba-img img{width:96px;height:72px;object-fit:cover;background:var(--surface-2,#eee);border:1px solid var(--line,#ddd)}' +
    '.cba-img .grow{flex:1 1 220px;min-width:0}' +
    '.cba-fond-prev{flex:0 0 220px;max-width:100%;aspect-ratio:16/9;background:#222 center/cover no-repeat;filter:grayscale(.6);border:1px solid var(--line,#ddd)}' +
    '.cba-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.7rem}' +
    '.cba-grid figure{margin:0;border:1.5px solid var(--line,#ddd);background:var(--surface,#fff)}' +
    '.cba-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--surface-2,#eee)}' +
    '.cba-grid figcaption{padding:.4rem;font-size:12px;overflow-wrap:anywhere}' +
    '.cba-bar{position:sticky;top:-1.2rem;z-index:2;background:var(--bg,#fff);padding:.7rem 0;border-bottom:1.5px solid var(--line,#ddd);margin-bottom:1rem}' +
    '.cba-toast{position:fixed;left:50%;bottom:1.2rem;transform:translate(-50%,150%);visibility:hidden;font-family:var(--font-body,system-ui,sans-serif);background:var(--ink,#111);color:var(--bg,#fff);padding:.7rem 1rem;font-weight:700;transition:transform .25s;z-index:2147483001;max-width:92vw}' +
    '.cba-toast.on{transform:translate(-50%,0);visibility:visible}.cba-toast.bad{background:var(--danger,#c22);color:#fff}' +
    '.cba-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:1rem}' +
    '.cba-modal>div{background:var(--bg,#fff);max-width:900px;width:100%;max-height:85vh;overflow:auto;padding:1rem}' +
    '.cba-crop{max-width:820px!important}.cba-crop-stage{display:flex;justify-content:center;background:#111;padding:.5rem;margin-top:.4rem}.cba-crop-cv{touch-action:none;cursor:grab;max-width:100%;display:block}.cba-crop-cv:active{cursor:grabbing}' +
    '.cba-chip-sub{display:block;font-size:10px;font-weight:600;opacity:.75}' +
    '.cba-fmt{display:flex;flex-direction:column;gap:.3rem;text-align:left;cursor:pointer;margin:0;font:inherit;color:inherit}.cba-fmt span{font-size:13px;color:var(--text-2,#555)}.cba-fmt:hover{border-color:var(--ink,#111)}' +
    '.cba-radio{display:inline-flex;gap:.45rem;align-items:center;font-weight:700;min-height:36px;margin-right:.8rem}' +
    '.cba-count{float:right;font-weight:600;text-transform:none;letter-spacing:0}' +
    '.cba-grid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0 .8rem}' +
    '.cba-tbar{padding:.3rem 0}.cba-body-in{font-size:16px;line-height:1.6}' +
    '.cba-prev{max-width:720px;margin:0 auto;font-size:17px;line-height:1.65}.cba-prev h1{font-size:2rem;line-height:1.1;margin:.3rem 0 .6rem}.cba-prev .dek{font-size:1.15rem;font-weight:600}.cba-prev img{width:100%;height:auto;display:block;margin:1rem 0}.cba-prev h2{font-size:1.3rem;margin:1.4rem 0 .4rem}.cba-prev blockquote{border-left:4px solid var(--ink,#111);margin:1rem 0;padding:.2rem 1rem;font-style:italic;font-size:1.15rem}.cba-prev figure{margin:1rem 0}.cba-prev figcaption{font-size:13px;color:var(--muted,#666)}.cba-prev .pts{background:var(--surface-2,#f4f4f4);padding:.8rem 1rem .8rem 2rem}.cba-prev .by{color:var(--muted,#666);font-size:14px}' +
    '.cba-pvbar{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483002;display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;justify-content:center;background:#0b0b0b;color:#fff;padding:.6rem .8rem;border:2px solid #fff;box-shadow:0 18px 50px -12px rgba(0,0,0,.6);font-family:var(--font-body,system-ui,sans-serif);font-size:14px;width:max-content;max-width:calc(100vw - 24px)}' +
    '.cba-pvbar .cba-btn{border-color:#fff;background:transparent;color:#fff}.cba-pvbar .cba-btn.pri{background:#fff;color:#0b0b0b}' +
    '.cba-tag.dr{background:#2f5d8a}' +
    '.cba-gzplan{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:.4rem}.cba-gzt{display:flex;flex-direction:column;gap:.15rem;text-align:left;border:1.5px solid var(--line,#ccc);background:var(--surface,#fff);color:inherit;padding:.45rem .5rem;min-height:74px;cursor:pointer;font:inherit}.cba-gzt .n{font-weight:900;font-size:12px;color:var(--muted,#666)}.cba-gzt .t{font-weight:800;font-size:13px;line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}.cba-gzt .m{font-size:11.5px;color:var(--muted,#666)}.cba-gzt.on{border-color:var(--ink,#111);box-shadow:inset 0 0 0 2px var(--ink,#111)}.cba-gzt.free{border-style:dashed;opacity:.75}.cba-gzt.fix{background:var(--surface-2,#f3f3f3);cursor:default}button.cba-gzt.fix{cursor:pointer}.cba-gzt.warn{border-color:#b26a00}' +
    '.cba-tbl{width:100%;border-collapse:collapse;font-size:14px}.cba-tbl td,.cba-tbl th{border-bottom:1px solid var(--line,#ddd);padding:.5rem .4rem;text-align:left;vertical-align:top}';

  // ---------- ouverture ----------
  function isAdmin() { return !!(window.CasaSite && window.CasaSite.state && window.CasaSite.state.role === 'admin'); }
  function open() {
    if (!isAdmin()) { if (window.CasaSite) window.CasaSite.say('Espace réservé à l’administrateur du site.'); return; }
    if (S.open) return;
    S.open = true;
    if (!document.getElementById('cba-css')) document.head.appendChild(E('style', { id: 'cba-css', text: CSS }));
    root = E('div', { id: 'cba', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Espace administrateur', translate: 'no', class: 'notranslate' });
    toastEl = E('div', { class: 'cba-toast', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(root); document.body.appendChild(toastEl);
    document.documentElement.style.overflow = 'hidden';
    if (location.hash !== '#/admin') { try { history.pushState(null, '', '#/admin'); pushed = true; } catch (e) {} }
    try { document.title = 'Espace administrateur · Casa Besports'; } catch (e) {}
    if (A.myRole) A.myRole().then(function (r) { S.setup = r === 'admin' ? 'ok' : 'norole'; render(); }, function () { S.setup = 'sql'; render(); });
    loadTab(S.tab);
    timer = setInterval(function () { if (S.tab === 'msg' && !S.compose) loadMsgs(true); }, 60000);
  }
  function close(fromPop) {
    if (!S.open) return;
    if (PV) endPreview(false);
    if (S.dirty && !confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?')) { if (fromPop) { try { history.pushState(null, '', '#/admin'); } catch (e) {} } return; }
    S.open = false; S.dirty = false; clearInterval(timer);
    if (root) root.remove(); if (toastEl) toastEl.remove(); root = null;
    document.documentElement.style.overflow = '';
    if (!fromPop) { if (pushed) { pushed = false; try { history.back(); } catch (e) {} } else { try { history.replaceState(null, '', '#/'); } catch (e) {} } }
    pushed = false;
    if (window.CasaSite) { try { window.CasaSite.syncRoute(window.CasaSite.state, true); } catch (e) {} }
  }
  window.addEventListener('popstate', function () { if (PV) return; if (S.open && location.hash !== '#/admin') close(true); });
  window.addEventListener('keydown', function (e) { if (PV) { if (e.key === 'Escape') endPreview(false); return; } if (S.open && e.key === 'Escape' && !document.querySelector('.cba-modal')) close(); });
  window.addEventListener('beforeunload', function (e) { if (S.open && S.dirty) { e.preventDefault(); e.returnValue = ''; } });
  // Adresse directe #/admin (au chargement ou tapée ensuite) : ouverture dès que le rôle administrateur est confirmé.
  // Sans rôle admin après quelques secondes, le site explique quoi faire (se connecter, ou changer de compte),
  // puis l'espace s'ouvre tout seul dès que la connexion administrateur aboutit (pendant 10 minutes).
  var want = 0;
  function wantOpen() { want = Date.now() + 600000; }
  setInterval(function () { if (want && !S.open && isAdmin()) { want = 0; open(); } else if (want && Date.now() > want) want = 0; }, 500);
  function fromHash() {
    if (location.hash !== '#/admin' || S.open) return;
    (function wait(n) {
      if (S.open || location.hash !== '#/admin') return;
      if (isAdmin()) { open(); return; }
      if (n > 24) { if (window.CasaSite) window.CasaSite.go('admin'); return; }
      setTimeout(function () { wait(n + 1); }, 250);
    })(0);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  function loadTab(t) {
    if (t === 'msg') { loadMsgs(); loadContacts(); }
    else if (t === 'team') loadTeam();
    else if (t === 'subs') loadSubs();
    else if (t === 'img') loadImages();
    render();
  }
  function setTab(t) {
    if (S.dirty && (S.tab === 'content' || S.tab === 'sport') && t !== S.tab && !confirm('Des modifications ne sont pas enregistrées. Changer d’onglet quand même ?')) return;
    if (t !== 'content') { S.key = null; S.work = null; }
    if (t !== S.tab) S.dirty = false;
    if (t === 'sport') spLoad();
    S.tab = t; loadTab(t);
  }

  // ---------- rendu général ----------
  function unread() { return S.msgs.filter(function (m) { return m.sens !== 'envoye' && !m.lu; }).length; }
  function pendingReqs() { return S.reqs.filter(function (r) { return r.statut === 'en_attente'; }).length; }
  function render() {
    if (!root) return;
    var y = body ? body.scrollTop : 0;
    root.textContent = '';
    var tabs = [['msg', 'Messagerie', unread()], ['content', 'Contenus du site', 0], ['sport', 'Résultats', 0], ['img', 'Images', 0], ['subs', 'Abonnés', 0], ['team', 'Équipe et accès', pendingReqs()], ['help', 'Aide', 0]];
    add(root, E('div', { class: 'cba-top' },
      E('span', { class: 'cba-brand' }, E('span', { class: 'long' }, 'Casa Besports · '), 'Administration'),
      E('div', { class: 'cba-tabs', role: 'tablist' }, tabs.map(function (t) {
        return E('button', { type: 'button', class: 'cba-tab', role: 'tab', 'aria-selected': String(S.tab === t[0]), onclick: function () { setTab(t[0]); } }, t[1], t[2] ? E('span', { class: 'cba-badge' }, String(t[2])) : null);
      })),
      E('button', { type: 'button', class: 'cba-x', onclick: function () { close(); } }, 'Voir le site ✕')));
    body = E('div', { class: 'cba-body' });
    var w = E('div', { class: 'cba-wrap' });
    if (S.setup === 'sql') add(w, E('div', { class: 'cba-note' }, E('strong', {}, 'Une étape à faire une seule fois. '), 'La base de l’espace administrateur n’est pas encore installée : ouvrez Supabase › SQL Editor › New query, collez le contenu du fichier supabase/administration.sql du dépôt, puis cliquez « Run ». Rechargez ensuite cette page. (Guide : docs/ESPACE-ADMIN.md)'));
    else if (S.setup === 'norole') add(w, E('div', { class: 'cba-note' }, 'Votre compte n’est pas reconnu comme administrateur par Supabase : vérifiez que votre adresse e-mail est confirmée et qu’elle figure dans la table « equipe » avec le rôle admin.'));
    add(w, ({ msg: viewMsg, content: viewContent, sport: viewSport, img: viewImages, subs: viewSubs, team: viewTeam, help: viewHelp })[S.tab]());
    add(body, w); add(root, body);
    body.scrollTop = y;
  }

  // ================= MESSAGERIE =================
  function loadMsgs(quiet) {
    return db(function (c) { return c.from('messages').select('*').order('recu_le', { ascending: false }).limit(500); }).then(function (d) {
      var before = JSON.stringify(S.msgs); S.msgs = d || []; S.loaded.msg = true;
      if (!quiet || before !== JSON.stringify(S.msgs)) render();
    }, function (e) { S.loaded.msg = true; if (!quiet) { render(); if (S.setup === 'ok') err(e); } });
  }
  function loadContacts() {
    return db(function (c) { return c.from('contacts_messagerie').select('*').order('ajoute_le', { ascending: false }); }).then(function (d) { S.contacts = d || []; render(); }, function () {});
  }
  function isMail(m) { return m.source === 'E-mail'; }
  function msgFilter(m) {
    var f = S.mf;
    if (f === 'nonlus' && (m.sens === 'envoye' || m.lu)) return false;
    if (f === 'site' && (m.sens === 'envoye' || isMail(m))) return false;
    if (f === 'mail' && (m.sens === 'envoye' || !isMail(m))) return false;
    if (f === 'envoyes' && m.sens !== 'envoye') return false;
    if (f === 'traites' && !m.traite) return false;
    if (f === 'tous' && m.sens === 'envoye') return false;
    if (S.q) { var q = S.q.toLowerCase(); return [m.nom, m.email, m.sujet, m.message, m.source, m.destinataire].join(' ').toLowerCase().indexOf(q) >= 0; }
    return true;
  }
  function selectMsg(m) {
    S.sel = m.id; S.compose = null; render();
    if (m.sens !== 'envoye' && !m.lu) {
      m.lu = true; render();
      db(function (c) { return c.from('messages').update({ lu: true }).eq('id', m.id); }).catch(function () {});
    }
  }
  function viewMsg() {
    var list = S.msgs.filter(msgFilter);
    var sel = S.msgs.find(function (m) { return m.id === S.sel; });
    var chips = [['tous', 'Reçus'], ['nonlus', 'Non lus'], ['site', 'Demandes du site'], ['mail', 'E-mails'], ['envoyes', 'Envoyés'], ['traites', 'Traités']];
    var left = E('div', {},
      E('div', { class: 'cba-row', style: 'margin-bottom:.6rem' }, chips.map(function (c) { return E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String(S.mf === c[0]), onclick: function () { S.mf = c[0]; render(); } }, c[1]); })),
      E('input', { class: 'cba-in', type: 'search', placeholder: 'Rechercher un nom, un e-mail, un mot…', value: S.q, oninput: function (e) { S.q = e.target.value; var p = e.target.selectionStart; render(); var i = root.querySelector('input[type=search]'); if (i) { i.focus(); try { i.setSelectionRange(p, p); } catch (x) {} } }, style: 'margin-bottom:.6rem' }),
      E('div', { class: 'cba-list' },
        !S.loaded.msg ? E('div', { style: 'padding:1rem' }, 'Chargement…') :
        list.length ? list.map(function (m) {
          var who = m.sens === 'envoye' ? 'À : ' + (m.destinataire || '—') : (m.nom || m.email || m.telephone || 'Anonyme');
          return E('button', { type: 'button', class: 'cba-it' + (m.id === S.sel ? ' on' : ''), onclick: function () { selectMsg(m); } },
            E('span', { class: 't' }, m.sens !== 'envoye' && !m.lu ? E('span', { class: 'cba-dot', 'aria-label': 'non lu' }) : null, who, m.traite ? E('span', { class: 'cba-tag' }, 'traité') : null),
            E('span', { class: 'm', style: 'display:block' }, (m.source || '') + ' · ' + fmtDate(m.recu_le)),
            E('span', { class: 'm', style: 'display:block' }, m.sujet || m.message || ''));
        }) : E('div', { style: 'padding:1rem;color:var(--muted)' }, 'Aucun message ici.')),
      E('div', { class: 'cba-row', style: 'margin-top:.6rem' },
        E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { S.compose = { to: '', subject: '', text: '', replyTo: null }; S.sel = null; render(); } }, 'Écrire un message'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { loadMsgs(); toast('Messagerie actualisée'); } }, 'Actualiser')));
    var right = S.compose ? viewCompose() : sel ? viewOneMsg(sel) : E('div', { class: 'cba-card' }, E('p', { class: 'cba-sub', style: 'margin:0' }, 'Choisissez un message dans la liste. Les nouvelles demandes du site (contact, OlistO, newsletter, commandes, demandes d’accès) et les e-mails des adresses suivies arrivent ici.'));
    return [E('h1', { class: 'cba-h' }, 'Messagerie'), E('p', { class: 'cba-sub' }, 'Demandes reçues par le site et e-mails des adresses que vous suivez.'),
      E('div', { class: 'cba-split' }, left, E('div', {}, right, viewContacts()))];
  }
  function viewOneMsg(m) {
    var kv = [['Origine', m.source], ['Reçu le', fmtDate(m.recu_le)], ['Nom', m.nom], ['E-mail', m.email ? E('a', { href: 'mailto:' + m.email }, m.email) : null], ['Téléphone', m.telephone ? E('a', { href: 'tel:' + String(m.telephone).replace(/\s/g, '') }, m.telephone) : null], ['Ville', m.ville], ['Profil', m.profil], ['Sujet', m.sujet], ['Page', m.page], ['Destinataire', m.destinataire], ['Consentement', m.consentement]].filter(function (x) { return x[1]; });
    return E('div', { class: 'cba-card' },
      E('div', { class: 'cba-row', style: 'justify-content:space-between' }, E('strong', { style: 'font-size:1.15rem' }, m.sujet || (m.sens === 'envoye' ? 'Message envoyé' : 'Demande du site'))),
      E('dl', { class: 'cba-kv' }, kv.map(function (x) { return [E('dt', {}, x[0]), E('dd', {}, x[1])]; })),
      E('div', { class: 'cba-msg' }, m.message || '(message vide)'),
      E('div', { class: 'cba-row' },
        m.email && m.sens !== 'envoye' ? E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { S.compose = { to: m.email, subject: 'Re : ' + (m.sujet || 'votre message à Casa Besports'), text: '\n\n—\nKader Allou · Casa Besports', replyTo: m.id }; render(); } }, 'Répondre') : null,
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { var v = !m.traite; m.traite = v; render(); db(function (c) { return c.from('messages').update({ traite: v }).eq('id', m.id); }).catch(err); } }, m.traite ? 'Remettre à traiter' : 'Marquer comme traité'),
        m.sens !== 'envoye' ? E('button', { type: 'button', class: 'cba-btn', onclick: function () { m.lu = false; S.sel = null; render(); db(function (c) { return c.from('messages').update({ lu: false }).eq('id', m.id); }).catch(err); } }, 'Marquer non lu') : null,
        m.email && m.sens !== 'envoye' && !S.contacts.some(function (c) { return c.email === String(m.email).toLowerCase(); }) ? E('button', { type: 'button', class: 'cba-btn', onclick: function () { addContact(m.email, m.nom); } }, 'Suivre cette adresse') : null,
        E('button', { type: 'button', class: 'cba-btn dan', onclick: function () { if (!confirm('Supprimer définitivement ce message ?')) return; db(function (c) { return c.from('messages').delete().eq('id', m.id); }).then(function () { S.msgs = S.msgs.filter(function (x) { return x.id !== m.id; }); S.sel = null; render(); toast('Message supprimé'); }, err); } }, 'Supprimer')));
  }
  function viewCompose() {
    var C = S.compose;
    var send = function () {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(C.to.trim())) { toast('Adresse e-mail du destinataire invalide', true); return; }
      if (!C.text.trim()) { toast('Le message est vide', true); return; }
      S.busy = true; render();
      A.sendMail(C.to.trim(), C.subject.trim() || 'Casa Besports', C.text, C.replyTo).then(function () {
        S.busy = false; S.compose = null; toast('Message envoyé'); loadMsgs();
        if (C.replyTo) db(function (c) { return c.from('messages').update({ traite: true }).eq('id', C.replyTo); }).catch(function () {});
      }, function (e) {
        S.busy = false; C.fallback = true; C.raison = e && !e.pasActive ? e.message : ''; render();
      });
    };
    var mailto = 'mailto:' + encodeURIComponent(C.to.trim()) + '?subject=' + encodeURIComponent(C.subject) + '&body=' + encodeURIComponent(C.text);
    return E('div', { class: 'cba-card' },
      E('strong', { style: 'font-size:1.15rem' }, C.replyTo ? 'Répondre' : 'Nouveau message'),
      E('label', { class: 'cba-lbl' }, 'À'), E('input', { class: 'cba-in', type: 'email', value: C.to, oninput: function (e) { C.to = e.target.value; }, list: 'cba-contacts' }),
      E('datalist', { id: 'cba-contacts' }, S.contacts.map(function (c) { return E('option', { value: c.email }, c.nom || ''); })),
      E('label', { class: 'cba-lbl' }, 'Objet'), E('input', { class: 'cba-in', value: C.subject, oninput: function (e) { C.subject = e.target.value; } }),
      E('label', { class: 'cba-lbl' }, 'Message'), E('textarea', { class: 'cba-in', style: 'min-height:220px', value: C.text, oninput: function (e) { C.text = e.target.value; } }),
      C.fallback ? E('div', { class: 'cba-note', style: 'margin-top:.8rem' }, C.raison ? 'L’envoi direct a échoué : ' + C.raison + '. En attendant, envoyez-le depuis votre messagerie habituelle : ' : 'L’envoi direct depuis le site n’est pas encore activé (voir Aide). Envoyez-le depuis votre messagerie habituelle : ',
        E('a', { href: mailto, onclick: function () { db(function (c) { return c.from('messages').insert({ source: 'E-mail', sens: 'envoye', destinataire: C.to.trim(), sujet: C.subject, message: C.text, reponse_a: C.replyTo, lu: true, traite: true }); }).then(function () { loadMsgs(); }, function () {}); } }, 'ouvrir dans ma messagerie'), '.') : null,
      E('div', { class: 'cba-row', style: 'margin-top:.8rem' },
        E('button', { type: 'button', class: 'cba-btn pri', disabled: S.busy || null, onclick: send }, S.busy ? 'Envoi…' : 'Envoyer'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.compose = null; render(); } }, 'Annuler')));
  }
  function addContact(email, nom) {
    email = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('Adresse e-mail invalide', true); return; }
    db(function (c) { return c.from('contacts_messagerie').upsert({ email: email, nom: (nom || '').trim() || null }, { onConflict: 'email' }); }).then(function () { toast('Adresse ajoutée : ses e-mails arriveront dans la messagerie'); loadContacts(); }, err);
  }
  function viewContacts() {
    var em = '', nm = '';
    return E('div', { class: 'cba-card', style: 'margin-top:1rem' },
      E('strong', {}, 'Adresses suivies'),
      E('p', { class: 'cba-sub', style: 'font-size:14px;margin:.3rem 0 .6rem' }, 'Les e-mails envoyés par ces adresses à l’adresse de réception du site arrivent dans cette messagerie (activation : voir Aide).'),
      E('div', { class: 'cba-row' },
        E('input', { class: 'cba-in', type: 'email', placeholder: 'adresse@exemple.fr', style: 'flex:2 1 200px', oninput: function (e) { em = e.target.value; } }),
        E('input', { class: 'cba-in', placeholder: 'Nom (facultatif)', style: 'flex:1 1 140px', oninput: function (e) { nm = e.target.value; } }),
        E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { addContact(em, nm); } }, 'Ajouter')),
      S.contacts.length ? E('table', { class: 'cba-tbl', style: 'margin-top:.6rem' }, E('tbody', {}, S.contacts.map(function (c) {
        return E('tr', {}, E('td', {}, E('strong', {}, c.email), c.nom ? E('div', { style: 'color:var(--muted)' }, c.nom) : null),
          E('td', { style: 'text-align:right' }, E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { S.compose = { to: c.email, subject: '', text: '', replyTo: null }; S.sel = null; render(); } }, 'Écrire'), ' ',
            E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Ne plus suivre ' + c.email + ' ?')) return; db(function (x) { return x.from('contacts_messagerie').delete().eq('email', c.email); }).then(loadContacts, err); } }, 'Retirer')));
      }))) : null);
  }

  // ================= CONTENUS =================
  function viewContent() {
    if (S.key) return viewEditor();
    var edited = A.editedKeys ? A.editedKeys() : [];
    return [E('h1', { class: 'cba-h' }, 'Contenus du site'),
      E('p', { class: 'cba-sub' }, 'Choisissez une section et modifiez-la. « Aperçu sur le site » montre le résultat sans rien publier ; vos changements sont gardés en brouillon sur cet appareil jusqu’à « Enregistrer et publier ».'),
      E('div', { class: 'cba-secs' }, SECTIONS.filter(function (sec) { return !sec.hide; }).map(function (sec) {
        var v = window[sec.key]; var n = Array.isArray(v) ? v.length + ' élément' + (v.length > 1 ? 's' : '') : '';
        return E('div', { class: 'cba-card', style: 'margin:0;display:flex;flex-direction:column;gap:.4rem' },
          E('strong', { style: 'font-size:1.05rem' }, sec.label, edited.indexOf(sec.key) >= 0 ? E('span', { class: 'cba-tag' }, 'modifié en ligne') : null, draftGet(sec.key) ? E('span', { class: 'cba-tag dr' }, 'brouillon') : null),
          E('span', { style: 'color:var(--text-2);font-size:14px;flex:1' }, sec.desc), n ? E('span', { style: 'color:var(--muted);font-size:13px' }, n) : null,
          E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.key = sec.key; S.work = withFields(sec.key, clone(window[sec.key])); S.dirty = false; S.openCards = {}; S.art = null; S.gzSel = null; render(); body.scrollTop = 0; } }, 'Modifier'));
      }))];
  }
  // Affiche aussi les champs prévus par le modèle (ex. « Photo » des lieux) même s'ils sont encore vides
  function withFields(k, v) {
    var T = TEMPLATES[k]; if (!T || !Array.isArray(v)) return v;
    return v.map(function (x) { if (!x || typeof x !== 'object' || Array.isArray(x)) return x; var o = Object.assign({}, x), TT = k === 'CASA_GAZETTE' ? Object.assign({ id: '' }, gzModel(o.kind || 'article')[3]) : T; Object.keys(TT).forEach(function (f) { if (!(f in o)) o[f] = clone(TT[f]); }); return o; });
  }
  function secOf(k) { return SECTIONS.find(function (s) { return s.key === k; }) || { label: k }; }
  function mark() { draftLater(); if (!S.dirty) { S.dirty = true; var b = root && root.querySelector('.cba-save'); if (b) b.disabled = false; } }
  function save() {
    var k = S.key, v = S.work;
    if (Array.isArray(v)) {
      var ids = {}, dup = null, miss = false;
      v.forEach(function (x) { if (x && typeof x === 'object' && !Array.isArray(x) && 'id' in x) { if (!x.id) { var base = x.title || x.name || x.titre || ''; x.id = slug(base) + (k === 'CASA_ARTICLES' ? '-' + new Date().toISOString().slice(0, 10) : ''); if (!base) miss = true; } if (ids[x.id]) dup = x.id; ids[x.id] = 1; } });
      if (miss) { toast('Un élément n’a ni titre ni identifiant', true); render(); return; }
      if (dup) { toast('Identifiant en double : ' + dup, true); render(); return; }
    }
    // Articles : date de création et date de mise à jour (affichées sur la page de l'article et lues par Google)
    if (k === 'CASA_ARTICLES' && Array.isArray(v)) {
      var now = new Date().toISOString(), before = {};
      (Array.isArray(window[k]) ? window[k] : []).forEach(function (x) { if (x && x.id) before[x.id] = JSON.stringify(Object.assign({}, x, { modifieLe: '' })); });
      v.forEach(function (x) {
        if (!x || typeof x !== 'object') return;
        if (!x.creeLe) x.creeLe = now;
        if (before[x.id] && before[x.id] !== JSON.stringify(Object.assign({}, x, { modifieLe: '' })) && !x.brouillon) x.modifieLe = now;
      });
    }
    S.busy = true; render();
    A.saveContent(k, v).then(function () { draftDel(k); S.busy = false; S.dirty = false; S.work = withFields(k, clone(window[k])); render(); toast('Publié : visible par tous les visiteurs'); }, function (e) { S.busy = false; render(); err(e); });
  }
  // ---------- Éditeur de la Gazette : chemin de fer de 31 pages, cartons, page choisie ----------
  function viewGazette() {
    var arr = S.work, sel = S.gzSel != null && arr[S.gzSel] ? S.gzSel : null, full = arr.length >= GZ_INNER;
    var pick = function (i) { S.gzSel = i; render(); var b = root && root.querySelector('#cba-gzpage'); if (b) b.scrollIntoView({ block: 'start' }); };
    var addModel = function (m) {
      if (arr.length >= GZ_INNER && !confirm('La Gazette compte déjà ' + GZ_PAGES + ' pages. Ajouter quand même une page en plus ?')) return;
      arr.push(clone(Object.assign({ id: '' }, m[3]))); S.gzSel = arr.length - 1; mark(); render();
      var b = root && root.querySelector('#cba-gzpage'); if (b) b.scrollIntoView({ block: 'start' });
    };
    var filled = arr.filter(function (p) { return p && p.title; }).length;
    var tiles = [E('button', { type: 'button', class: 'cba-gzt fix', onclick: function () { editSection('CASA_GAZETTE_NUMERO', null); } }, E('span', { class: 'n' }, '1'), E('span', { class: 't' }, 'La Une'), E('span', { class: 'm' }, 'modifier')),
      E('div', { class: 'cba-gzt fix' }, E('span', { class: 'n' }, '2'), E('span', { class: 't' }, 'Sommaire'), E('span', { class: 'm' }, 'automatique'))];
    for (var i = 0; i < Math.max(GZ_INNER, arr.length); i++) (function (i) {
      var p = arr[i], over = i >= GZ_INNER;
      if (!p) { tiles.push(E('button', { type: 'button', class: 'cba-gzt free', onclick: function () { var c = root && root.querySelector('#cba-cartons'); if (c) c.scrollIntoView({ block: 'start' }); } }, E('span', { class: 'n' }, String(i + 3)), E('span', { class: 't' }, 'Page libre'), E('span', { class: 'm' }, '+ choisir un carton'))); return; }
      tiles.push(E('button', { type: 'button', class: 'cba-gzt' + (i === sel ? ' on' : '') + (!p.title || over ? ' warn' : ''), title: !p.title ? 'Sans titre : la page n’apparaît pas dans la Gazette' : over ? 'Au-delà des ' + GZ_PAGES + ' pages' : '', onclick: function () { pick(i); } },
        E('span', { class: 'n' }, String(i + 3)), E('span', { class: 't' }, p.title || '(sans titre)'), E('span', { class: 'm' }, gzModel(p.kind)[1])));
    })(i);
    var out = [E('div', { class: 'cba-card' },
      E('strong', {}, 'Chemin de fer · ' + GZ_PAGES + ' pages'),
      E('p', { class: 'cba-sub', style: 'margin:.3rem 0 .7rem;font-size:14px' }, 'La Gazette compte toujours ' + GZ_PAGES + ' pages : la Une, le sommaire, puis ' + GZ_INNER + ' pages intérieures. ' + filled + ' / ' + GZ_INNER + ' pages intérieures écrites' + (filled < GZ_INNER ? ' : il en manque ' + (GZ_INNER - filled) + ' pour un numéro complet.' : '.') + ' Cliquez sur une page pour la modifier.'),
      E('div', { class: 'cba-gzplan' }, tiles))];
    if (sel != null) {
      var p = arr[sel], path = 'CASA_GAZETTE[' + sel + ']';
      var mv = function (d) { var j = sel + d; if (j < 0 || j >= arr.length) return; var t = arr[sel]; arr[sel] = arr[j]; arr[j] = t; S.gzSel = j; mark(); render(); };
      out.push(E('div', { class: 'cba-card', id: 'cba-gzpage' },
        E('div', { class: 'cba-row', style: 'margin-bottom:.4rem' }, E('strong', { style: 'font-size:1.1rem;margin-right:auto' }, 'Page ' + (sel + 3) + ' · ' + (p.title || '(sans titre)')),
          E('button', { type: 'button', class: 'cba-btn sm', title: 'Page précédente', onclick: function () { mv(-1); } }, '← Déplacer avant'),
          E('button', { type: 'button', class: 'cba-btn sm', title: 'Page suivante', onclick: function () { mv(1); } }, 'Déplacer après →'),
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { startPreview('CASA_GAZETTE', S.work); } }, 'Aperçu de la page'),
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var c = clone(p); c.id = ''; c.title = (c.title || '') + ' (copie)'; arr.splice(sel + 1, 0, c); S.gzSel = sel + 1; mark(); render(); } }, 'Dupliquer'),
          E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Supprimer la page « ' + (p.title || 'sans titre') + ' » ?')) return; arr.splice(sel, 1); S.gzSel = null; mark(); render(); } }, 'Supprimer'),
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { S.gzSel = null; render(); } }, 'Fermer')),
        E('p', { class: 'cba-sub', style: 'font-size:14px;margin:.2rem 0 .4rem' }, gzModel(p.kind)[2] + ' Le « Titre » est obligatoire pour que la page apparaisse.'),
        field(arr, sel, '', path, true)));
    }
    out.push(E('div', { class: 'cba-card', id: 'cba-cartons' }, E('strong', {}, 'Les cartons'),
      E('p', { class: 'cba-sub', style: 'margin:.3rem 0 .7rem;font-size:14px' }, full ? 'Les ' + GZ_INNER + ' pages intérieures sont prises : pour changer de carton, ouvrez une page et changez son « Modèle de page ».' : 'Choisissez un modèle : la page est ajoutée à la suite (page ' + (arr.length + 3) + '), vous la remplissez puis la déplacez si besoin.'),
      E('div', { class: 'cba-secs' }, GZ_MODELS.map(function (m) {
        return E('div', { class: 'cba-card', style: 'margin:0;display:flex;flex-direction:column;gap:.35rem' }, E('strong', {}, m[1]), E('span', { style: 'font-size:13.5px;color:var(--text-2,#555);flex:1' }, m[2]),
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { addModel(m); } }, 'Ajouter cette page'));
      }))));
    return out;
  }

  // ---------- Brouillons (gardés sur cet appareil jusqu'à la publication) ----------
  var DKEY = 'cba-brouillon:', dTimer = null;
  function draftGet(k) { try { var d = JSON.parse(localStorage.getItem(DKEY + k) || 'null'); return d && d.v !== undefined ? d : null; } catch (e) { return null; } }
  function draftPut(k, v) { try { localStorage.setItem(DKEY + k, JSON.stringify({ at: new Date().toISOString(), v: v })); return true; } catch (e) { return false; } }
  function draftDel(k) { try { localStorage.removeItem(DKEY + k); } catch (e) {} }
  function draftLater() {
    clearTimeout(dTimer);
    dTimer = setTimeout(function () { if (!S.dirty) return; if (S.tab === 'sport' && S.sp) draftPut('CASA_SPORT', S.sp); else if (S.key && S.work != null) draftPut(S.key, S.work); }, 1000);
  }
  function draftNote(k, apply) {
    var d = draftGet(k);
    if (!d || S.dirty) return null;
    var cur = k === 'CASA_SPORT' ? S.sp : S.work;
    try { if (JSON.stringify(d.v) === JSON.stringify(cur)) return null; } catch (e) {}
    return E('div', { class: 'cba-note' }, E('strong', {}, 'Brouillon non publié'), ' du ' + fmtDate(d.at) + ' (gardé sur cet appareil). ',
      E('div', { class: 'cba-row', style: 'margin-top:.5rem' },
        E('button', { type: 'button', class: 'cba-btn sm pri', onclick: function () { apply(clone(d.v)); S.dirty = true; render(); toast('Brouillon repris : pensez à publier'); } }, 'Reprendre le brouillon'),
        E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { startPreview(k, d.v); } }, 'Aperçu du brouillon'),
        E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Supprimer ce brouillon ?')) return; draftDel(k); render(); } }, 'Supprimer le brouillon')));
  }
  // Les deux sections de la Gazette se répondent
  function gazetteLinks(k) {
    if (k === 'CASA_GAZETTE_NUMERO') return E('div', { class: 'cba-row', style: 'margin:-.4rem 0 1rem' },
      E('button', { type: 'button', class: 'cba-btn', onclick: function () { editSection('CASA_GAZETTE', null); } }, '← Les 31 pages de la Gazette'),
      E('span', { style: 'color:var(--muted,#666);font-size:14px' }, 'Vous modifiez la page 1. Pensez à « Enregistrer et publier » avant de revenir aux autres pages.'));
    if (k === 'CASA_LEGAL') return E('div', { class: 'cba-row', style: 'margin:-.4rem 0 1rem' },
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { editSection('CASA_LEGAL_MAJ', null); } }, 'Changer la date de mise à jour'));
    if (k === 'CASA_LEGAL_MAJ') return E('div', { class: 'cba-row', style: 'margin:-.4rem 0 1rem' },
      E('button', { type: 'button', class: 'cba-btn', onclick: function () { editSection('CASA_LEGAL', null); } }, '← Pages légales'));
    return null;
  }
  function editSection(k, idx) {
    if (S.dirty && S.key !== k && !confirm('Des modifications ne sont pas enregistrées (elles restent en brouillon). Changer de section ?')) return;
    if (S.tab !== 'content') { S.tab = 'content'; }
    S.key = k; S.work = withFields(k, clone(window[k])); S.dirty = false; S.openCards = {}; S.art = null;
    if (idx != null) S.openCards[k + '[' + idx + ']'] = true;
    S.gzSel = k === 'CASA_GAZETTE' ? idx : null;
    render(); var b = root && root.querySelector('.cba-body'); if (b) b.scrollTop = 0;
  }
  // Depuis la liseuse : page 1-2 → la Une, page 3+ → la page intérieure correspondante
  function editGazette(pageIdx) {
    var go = function () {
      if (pageIdx < 2) { editSection('CASA_GAZETTE_NUMERO', null); return; }
      var n = pageIdx - 2, arr = Array.isArray(window.CASA_GAZETTE) ? window.CASA_GAZETTE : [], seen = -1, raw = null;
      for (var i = 0; i < arr.length; i++) { if (arr[i] && arr[i].title) { seen++; if (seen === n) { raw = i; break; } } }
      editSection('CASA_GAZETTE', raw);
    };
    if (!S.open) { open(); setTimeout(go, 0); } else go();
  }

  // ---------- Aperçu sur le site, avant publication ----------
  var PV = null, pvBar = null;
  var VIEW_OF = { CASA_ARTICLES: 'news', CASA_CLUBS: 'clubs', CASA_JOUEURS: 'players', CASA_PARTENAIRES: 'partners', CASA_ABONNEMENTS: 'offers', CASA_CLUBHOUSE: 'clubhouse', CASA_REGLEMENTS: 'disciplines', CASA_STADES: 'app', CASA_GAZETTE_NUMERO: 'gazette', CASA_GAZETTE: 'gazette', CASA_LIEUX: 'home', CASA_BOUTIQUE: 'shop', CASA_PRODUITS: 'shop', CASA_VIDEOS: 'videos', CASA_CULTURE: 'culture', CASA_FONDS: 'home', CASA_APROPOS: 'about', CASA_LEGAL: 'legal', CASA_LEGAL_MAJ: 'legal', CASA_SPORT: 'live', CASA_RETOUCHES: 'home', CASA_RESEAUX: 'home', CASA_ENCARTS: 'news' };
  function openCardIdx(k) { if (k === 'CASA_GAZETTE' && S.gzSel != null) return S.gzSel; var m = null; Object.keys(S.openCards || {}).forEach(function (p) { var r = p.match(new RegExp('^' + k + '\\[(\\d+)\\]$')); if (r && S.openCards[p]) m = Number(r[1]); }); return m; }
  function startPreview(k, value) {
    var site = window.CasaSite; if (!site || PV) return;
    var v = clone(value), view = VIEW_OF[k] || 'home', extra = {};
    if (k === 'CASA_ARTICLES' && Array.isArray(v) && S.art != null && v[S.art]) { if (!v[S.art].id) v[S.art].id = 'apercu-article'; if (!v[S.art].title) v[S.art].title = 'Article sans titre'; view = 'article'; extra = { articleId: v[S.art].id }; }
    PV = { key: k, orig: window[k], val: clone(value) };
    window[k] = v; window.CASA_APERCU = true;
    try { site.refreshContent(); } catch (e) {}
    root.style.display = 'none'; document.documentElement.style.overflow = '';
    pvBar = E('div', { class: 'cba-pvbar', role: 'region', 'aria-label': 'Aperçu avant publication', translate: 'no' },
      E('span', {}, E('strong', {}, 'Aperçu'), ' · rien n’est encore publié'),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { endPreview(false); } }, '← Revenir à l’édition'),
      E('button', { type: 'button', class: 'cba-btn sm pri', onclick: function () { endPreview(true); } }, 'Publier'));
    document.body.appendChild(pvBar);
    try {
      if (view === 'gazette') {
        var page = 0;
        if (k === 'CASA_GAZETTE') { var i = openCardIdx(k), arr = Array.isArray(v) ? v : [], n = 0; if (i == null) i = 0; for (var j = 0; j < i && j < arr.length; j++) if (arr[j] && arr[j].title) n++; page = (arr[i] && arr[i].title) ? n + 2 : (arr.some(function (x) { return x && x.title; }) ? 2 : 1); }
        site.setState({ readerOpen: true, page: page });
      } else site.go(view, extra);
    } catch (e) {}
    try { window.scrollTo(0, 0); } catch (e) {}
  }
  function endPreview(publish) {
    if (!PV) return; var site = window.CasaSite, k = PV.key, val = PV.val;
    window[k] = PV.orig; window.CASA_APERCU = false;
    if (pvBar) pvBar.remove(); pvBar = null;
    PV = null;
    try { site.setState({ readerOpen: false }); site.refreshContent(); } catch (e) {}
    if (root) root.style.display = ''; document.documentElement.style.overflow = 'hidden';
    try { history.replaceState(null, '', '#/admin'); } catch (e) {}
    pushed = false; render();
    if (publish) { if (k === 'CASA_SPORT') { S.sp = val; spSave(); } else if (S.key === k) { S.work = val; S.dirty = true; save(); } }
  }

  function viewEditor() {
    var sec = secOf(S.key), edited = (A.editedKeys ? A.editedKeys() : []).indexOf(S.key) >= 0;
    var ed = E('div', { class: 'cba-ed' });
    var v = S.work;
    if (S.key === 'CASA_ARTICLES' && Array.isArray(v)) add(ed, S.art != null ? viewArticleEditor() : viewArticleList());
    else if (S.key === 'CASA_GAZETTE' && Array.isArray(v)) add(ed, viewGazette());
    else if (S.key === 'CASA_FONDS' && v && typeof v === 'object') add(ed, viewFonds());
    else if (S.key === 'CASA_RETOUCHES' && v && typeof v === 'object') add(ed, viewRetouches());
    else if (Array.isArray(v) || (v && typeof v === 'object')) add(ed, field({ v: v }, 'v', S.key, S.key, true));
    else add(ed, field(S, 'work', S.key, S.key, true));
    return [E('div', { class: 'cba-bar' },
      E('div', { class: 'cba-row' },
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { if (S.dirty && !confirm('Abandonner les modifications non enregistrées ?')) return; S.key = null; S.work = null; S.dirty = false; render(); } }, '← Sections'),
        E('strong', { style: 'font-size:1.2rem;margin-right:auto' }, sec.label),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { startPreview(S.key, S.work); } }, 'Aperçu sur le site'),
        E('button', { type: 'button', class: 'cba-btn', disabled: !S.dirty || null, onclick: function () { toast(draftPut(S.key, S.work) ? 'Brouillon enregistré sur cet appareil (non publié)' : 'Brouillon impossible : stockage du navigateur indisponible', !draftGet(S.key)); } }, 'Enregistrer le brouillon'),
        E('button', { type: 'button', class: 'cba-btn pri cba-save', disabled: (!S.dirty || S.busy) || null, onclick: save }, S.busy ? 'Publication…' : 'Enregistrer et publier'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { if ((S.dirty || draftGet(S.key)) && !confirm('Abandonner les modifications et supprimer le brouillon ?')) return; draftDel(S.key); S.work = withFields(S.key, clone(window[S.key])); S.dirty = false; render(); } }, 'Annuler les modifications'),
        edited ? E('button', { type: 'button', class: 'cba-btn dan', onclick: function () {
          if (!confirm('Revenir à la version du fichier (contenus/ du dépôt) pour « ' + sec.label + ' » ? Les modifications faites ici seront effacées.')) return;
          A.resetContent(S.key).then(function () { S.work = withFields(S.key, clone(window[S.key])); S.dirty = false; render(); toast('Version d’origine rétablie'); }, err);
        } }, 'Version d’origine') : null)),
      E('p', { class: 'cba-sub' }, sec.desc),
      draftNote(S.key, function (v) { S.work = withFields(S.key, v); }),
      gazetteLinks(S.key),
      ed];
  }
  // ---------- Retouches : liste lisible des textes et images changés sur le site ----------
  var PAGE_NOMS = { home: 'Accueil', news: 'Actualités', article: 'Article', live: 'Le Terrain', videos: 'Vidéos', clubs: 'Clubs', players: 'Joueurs', shop: 'Boutique', offers: 'Abonnements', clubhouse: 'Club House', culture: 'Culture', meteo: 'Météo', partners: 'Partenaires', about: 'À propos', contact: 'Contact', legal: 'Mentions légales', app: 'Application', disciplines: 'Disciplines', account: 'Mon espace' };
  function viewRetouches() {
    var v = S.work; v.textes = Array.isArray(v.textes) ? v.textes : []; v.images = Array.isArray(v.images) ? v.images : [];
    var where = function (r) { var pg = !r.page || r.page === '*' ? 'Tout le site' : (PAGE_NOMS[r.page] || r.page); return pg + (r.n != null && r.n !== '' ? ' · cet emplacement seulement' : ''); };
    var del = function (list, i) { if (!confirm('Supprimer cette retouche ? Le site reprendra le texte ou l’image d’origine.')) return; list.splice(i, 1); mark(); render(); };
    var texts = v.textes.map(function (r, i) {
      var ta = E('textarea', { class: 'cba-in', rows: '2', value: r.apres || '', oninput: function (e) { r.apres = e.target.value; mark(); } });
      return E('div', { class: 'cba-card', style: 'margin:.5rem 0' },
        E('div', { class: 'cba-row', style: 'justify-content:space-between' }, E('span', { class: 'cba-tag' }, where(r)), E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { del(v.textes, i); } }, 'Supprimer')),
        E('div', { class: 'cba-lbl' }, 'Texte d’origine'), E('p', { style: 'margin:.2rem 0 .4rem;color:var(--muted);text-decoration:line-through' }, r.avant || ''),
        E('div', { class: 'cba-lbl' }, 'Remplacé par'), ta,
        E('div', { class: 'cba-lbl' }, 'En anglais (facultatif)'), E('input', { class: 'cba-in', value: r.apresEn || '', oninput: function (e) { r.apresEn = e.target.value; mark(); } }));
    });
    var imgs = v.images.map(function (r, i) {
      var th = function (src, cap) { return E('figure', { style: 'margin:0;text-align:center' }, E('img', { src: src || null, alt: '', style: 'width:150px;height:100px;object-fit:cover;background:#ddd;display:block' }), E('figcaption', { style: 'font-size:12px;color:var(--muted)' }, cap)); };
      var taille = ({ plein: 'Pleine largeur', fond: 'Pleine largeur, image entière', entiere: 'Image entière' }[r.taille] || 'Taille prévue par la page') + (r.video ? ' · vidéo en arrière-plan' : '');
      return E('div', { class: 'cba-card', style: 'margin:.5rem 0' },
        E('div', { class: 'cba-row', style: 'justify-content:space-between' }, E('span', { class: 'cba-tag' }, where(r)), E('span', { class: 'cba-row' },
          r.source ? E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { r.apres = r.source; delete r.source; mark(); render(); } }, 'Revenir à la photo non rognée') : null,
          E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { del(v.images, i); } }, 'Supprimer'))),
        E('div', { class: 'cba-row', style: 'align-items:center;gap:1rem;margin-top:.5rem' }, th(r.avant, 'Origine'), E('span', { style: 'font-size:1.6rem' }, '→'), th(r.apres || r.avant, r.apres ? 'Nouvelle image' : 'Même image, recadrée'),
          E('span', { style: 'font-size:13px;color:var(--muted)' }, taille + (r.z && r.z !== 1 ? ' · zoom ' + r.z : ''))));
    });
    v.places = Array.isArray(v.places) ? v.places : [];
    var places = v.places.map(function (r, i) {
      return E('div', { class: 'cba-card', style: 'margin:.5rem 0' },
        E('div', { class: 'cba-row', style: 'justify-content:space-between' }, E('span', { class: 'cba-tag' }, where(r) + ' · ' + (r.ecran === 'mob' ? 'téléphone' : 'ordinateur')),
          E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Remettre cet élément à sa place d’origine ?')) return; v.places.splice(i, 1); mark(); render(); } }, 'Remettre à sa place')),
        E('p', { style: 'margin:.3rem 0 0;font-size:13px;color:var(--muted)' }, 'Décalé de ' + (r.dx || 0) + ' px horizontalement et ' + (r.dy || 0) + ' px verticalement' + (r.cls ? ' · ' + r.cls.split(' ')[0] : '')));
    });
    return E('div', {},
      E('h3', { style: 'margin:1rem 0 .3rem' }, 'Textes (' + texts.length + ')'), texts.length ? texts : E('p', { class: 'cba-sub' }, 'Aucun texte retouché.'),
      E('h3', { style: 'margin:1.2rem 0 .3rem' }, 'Images (' + imgs.length + ')'), imgs.length ? imgs : E('p', { class: 'cba-sub' }, 'Aucune image retouchée.'),
      E('h3', { style: 'margin:1.2rem 0 .3rem' }, 'Éléments déplacés (' + places.length + ')'), places.length ? places : E('p', { class: 'cba-sub' }, 'Aucun élément déplacé.'));
  }
  // ---------- Fonds de page : une image par page, avec son cadrage ----------
  var FOND_PAGES = [['accueil', 'Accueil'], ['actualites', 'Actualités et articles'], ['direct', 'Direct'], ['videos', 'Vidéos'], ['disciplines', 'Disciplines'], ['clubs', 'Clubs et carte'], ['joueurs', 'Joueurs'], ['boutique', 'Boutique'], ['abonnements', 'Abonnements'], ['compte', 'Mon espace'], ['quotidien', 'Le quotidien (abonnés)'], ['clubhouse', 'Club House'], ['culture', 'Culture'], ['meteo', 'Météo'], ['partenaires', 'Partenaires'], ['apropos', 'À propos'], ['contact', 'Contact'], ['mentions', 'Mentions légales'], ['application', 'Application'], ['redaction', 'Rédaction']];
  var FOND_POS = [['center 15%', 'Montrer le haut'], ['center 30%', 'Le tiers haut'], ['center 35%', 'Un peu au-dessus du centre'], ['center 40%', 'Juste au-dessus du centre'], ['center', 'Centre'], ['center 45%', 'Presque au centre'], ['center 65%', 'Un peu en dessous du centre'], ['center 85%', 'Montrer le bas']];
  function viewFonds() {
    var v = S.work; if (!v.pages || typeof v.pages !== 'object') v.pages = {};
    var orig = (A.originalContent && A.originalContent('CASA_FONDS')) || {}; var op = orig.pages || {};
    var mode = ['aucun', 'photo', 'lieux'].indexOf(v.modeParDefaut) >= 0 ? v.modeParDefaut : 'aucun';
    var modeSel = E('select', { class: 'cba-in', onchange: function (e) { v.modeParDefaut = e.target.value; mark(); render(); } },
      [['photo', 'Photos : les images choisies ci-dessous'], ['aucun', 'Fond uni (blanc ou noir), sans image'], ['lieux', 'Illustrations des lieux de légende']].map(function (o) { return E('option', { value: o[0], selected: o[0] === mode || null }, o[1]); }));
    // Couleur : photos en noir et blanc ou en couleur, et teinte de fond (tout le site, ou page par page)
    var hexOk = function (c) { return typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c); };
    var couleurSel = E('select', { class: 'cba-in', onchange: function (e) { v.photosEnCouleur = e.target.value === 'couleur'; mark(); } },
      [['nb', 'En noir et blanc (signature Casa Besports)'], ['couleur', 'En couleur']].map(function (o) { return E('option', { value: o[0], selected: (o[0] === 'couleur') === (v.photosEnCouleur === true) || null }, o[1]); }));
    function teinteField(get, set, labelNone) {
      var cur = get(); var on = hexOk(cur);
      var inp = E('input', { type: 'color', value: on ? cur : '#1d4e89', style: 'width:52px;height:38px;padding:2px;cursor:pointer' + (on ? '' : ';opacity:.45'), oninput: function (e) { set(e.target.value.toLowerCase()); inp.style.opacity = '1'; chk.checked = false; mark(); } });
      var chk = E('input', { type: 'checkbox', checked: !on || null, onchange: function (e) { if (e.target.checked) { set(''); inp.style.opacity = '.45'; } else { set(inp.value.toLowerCase()); inp.style.opacity = '1'; } mark(); } });
      return E('div', { class: 'cba-row', style: 'align-items:center;gap:.8rem' }, inp, E('label', { style: 'display:flex;gap:.4rem;align-items:center;font-size:14px' }, chk, labelNone));
    }
    var cards = FOND_PAGES.map(function (pg) {
      var id = pg[0], cur = v.pages[id];
      if (!Array.isArray(cur)) { cur = typeof cur === 'string' ? [cur, 'center'] : ['', 'center']; v.pages[id] = cur; }
      var def = Array.isArray(op[id]) ? op[id][0] : '';
      var pos = cur[1] || 'center'; var opts = FOND_POS.slice(); if (!opts.some(function (o) { return o[0] === pos; })) opts.unshift([pos, 'Réglage actuel (' + pos + ')']);
      var thumb = E('div', { class: 'cba-fond-prev', style: 'background-image:url("' + String(cur[0] || def || '').replace(/"/g, '') + '");background-position:' + pos });
      var sel = E('select', { class: 'cba-in', onchange: function (e) { cur[1] = e.target.value; thumb.style.backgroundPosition = e.target.value; mark(); } }, opts.map(function (o) { return E('option', { value: o[0], selected: o[0] === pos || null }, o[1]); }));
      var pTeinte = teinteField(function () { return cur[2]; }, function (c) { if (c) cur[2] = c; else cur.length = Math.min(cur.length, 2); }, 'Teinte du site');
      return E('div', { class: 'cba-card', style: 'margin:.6rem 0' },
        E('div', { class: 'cba-row', style: 'justify-content:space-between' }, E('strong', {}, pg[1]),
          cur[0] ? null : E('span', { style: 'font-size:13px;color:var(--muted)' }, def ? 'Image d’origine utilisée' : 'Pas d’image')),
        E('div', { class: 'cba-row', style: 'align-items:flex-start;gap:1rem;margin-top:.4rem' }, thumb,
          E('div', { style: 'flex:1 1 300px;min-width:0' }, imgField(cur, 0, 'orig', function (u) { thumb.style.backgroundImage = 'url("' + String(u || def || '').replace(/"/g, '') + '")'; }), E('label', { class: 'cba-lbl' }, 'Partie de la photo à montrer'), sel, E('label', { class: 'cba-lbl' }, 'Couleur de fond de cette page'), pTeinte)));
    });
    return E('div', {},
      E('div', { class: 'cba-card' }, E('label', { class: 'cba-lbl', style: 'margin-top:0' }, 'Ce que voit un nouveau visiteur'), modeSel,
        mode !== 'photo' ? E('p', { class: 'cba-sub', style: 'margin:.5rem 0 0' }, 'Pour que vos images de fond s’affichent pour tout le monde, choisissez « Photos ». Chaque visiteur peut ensuite changer dans Mon espace › Apparence.') : null,
        E('label', { class: 'cba-lbl' }, 'Photos de fond'), couleurSel,
        E('label', { class: 'cba-lbl' }, 'Couleur de fond de tout le site'), teinteField(function () { return v.teinte; }, function (c) { v.teinte = c; }, 'Aucune (blanc ou noir)'),
        E('p', { class: 'cba-sub', style: 'margin:.5rem 0 0' }, 'La couleur teinte le fond uni et les photos de fond. Une page peut avoir sa propre couleur (plus bas). Chaque abonné peut aussi choisir la sienne.')),
      E('p', { class: 'cba-sub' }, 'Une image par page. Envoyez une photo, prenez-la dans la bibliothèque, puis choisissez la partie à montrer. Une case vide reprend l’image d’origine.'),
      cards);
  }
  // Champ générique : parent[k]
  function field(parent, k, label, path, top) {
    var v = parent[k];
    if (Array.isArray(v)) return listField(parent, k, label, path, top);
    if (v && typeof v === 'object') {
      var keys = Object.keys(v).filter(function (x) { return x.slice(0, 2) !== '__'; });
      var inner = keys.map(function (x) { return field(v, x, LABELS[x] || x, path + '.' + x); });
      return top ? E('div', {}, inner) : E('fieldset', {}, E('legend', {}, label), inner);
    }
    return prim(parent, k, label);
  }
  function prim(parent, k, label) {
    var v = parent[k];
    var lab = E('label', { class: 'cba-lbl' }, label);
    if (typeof v === 'boolean') return E('label', { style: 'display:flex;gap:.5rem;align-items:center;margin:.7rem 0;font-weight:700' }, E('input', { type: 'checkbox', checked: v || null, onchange: function (e) { parent[k] = e.target.checked; mark(); } }), label);
    if (typeof v === 'number') return [lab, E('input', { class: 'cba-in', type: 'number', step: 'any', value: String(v), oninput: function (e) { parent[k] = e.target.value === '' ? 0 : Number(e.target.value); mark(); } })];
    var str = v == null ? '' : String(v);
    if (S.key === 'CASA_GAZETTE' && SELECTS[k]) {
      var opts = SELECTS[k].slice(); if (str && !opts.some(function (o) { return o[0] === str; })) opts.unshift([str, str]);
      var sel = E('select', { class: 'cba-in', onchange: function (e) {
        parent[k] = e.target.value; mark();
        if (k === 'kind') { var tpl = gzModel(e.target.value)[3]; Object.keys(tpl).forEach(function (f) { if (!(f in parent) || (f === 'rubric' && !parent[f])) parent[f] = clone(tpl[f]); }); render(); }
      } }, opts.map(function (o) { return E('option', { value: o[0], selected: o[0] === str || null }, o[1]); }));
      return [lab, sel];
    }
    if (isImg(k, str)) return [lab, imgField(parent, k)];
    var long = LONG.test(String(k)) || str.length > 70 || str.indexOf('\n') >= 0;
    var inp = long ? E('textarea', { class: 'cba-in', value: str, rows: String(Math.min(18, Math.max(3, Math.ceil(str.length / 90) + (str.match(/\n/g) || []).length))) }) : E('input', { class: 'cba-in', value: str });
    inp.addEventListener('input', function (e) { parent[k] = (v === null && e.target.value === '') ? null : e.target.value; mark(); });
    return [lab, inp];
  }
  // Photo d'origine d'une photo rognée : gardée à côté du champ (ou sur cet appareil pour les listes simples)
  function origMap() { try { return JSON.parse(localStorage.getItem('cba-orig-photos') || '{}') || {}; } catch (e) { return {}; } }
  function origGet(parent, k) { var o = !Array.isArray(parent) && parent['__orig_' + k]; return o || origMap()[parent[k]] || ''; }
  function origSet(parent, k, cropped, original) {
    if (!Array.isArray(parent)) { if (original) parent['__orig_' + k] = original; else delete parent['__orig_' + k]; }
    if (cropped && original) { try { var m = origMap(); m[cropped] = original; localStorage.setItem('cba-orig-photos', JSON.stringify(m)); } catch (e) {} }
  }
  function imgField(parent, k, ratio, onSet) {
    ratio = ratio || (S.key === 'CASA_ARTICLES' ? '16:9' : null);
    var prev = E('img', { alt: '', src: parent[k] || null });
    var inp = E('input', { class: 'cba-in', value: parent[k] || '', placeholder: 'assets/… ou adresse d’une image envoyée', oninput: function (e) { parent[k] = e.target.value; prev.src = e.target.value; cropBtn.style.display = e.target.value ? '' : 'none'; mark(); } });
    var set = function (url, orig) { parent[k] = url; inp.value = url; prev.src = url; cropBtn.style.display = url ? '' : 'none'; origSet(parent, k, url, orig || ''); backBtn.style.display = origGet(parent, k) ? '' : 'none'; mark(); if (onSet) onSet(url); };
    var busy = function (on, b, label) { b.disabled = on || null; b.textContent = on ? 'Envoi…' : label; };
    var send = function (f, b, label, orig) { busy(true, b, label); return uploadFile(f).then(function (u) { set(u, orig); busy(false, b, label); toast('Photo enregistrée : pensez à « Enregistrer et publier »'); }, function (er) { busy(false, b, label); err(er); }); };
    var file = E('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; cropImage(f, { file: f, ratio: ratio }).then(function (x) { if (x) send(x, upBtn, 'Envoyer une photo'); }); } });
    var upBtn = E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { file.click(); } }, 'Envoyer une photo');
    var cropBtn = E('button', { type: 'button', class: 'cba-btn sm', style: parent[k] ? '' : 'display:none', onclick: function () { var base = origGet(parent, k) || parent[k]; cropImage(base, { ratio: ratio }).then(function (x) { if (x) send(x, cropBtn, 'Rogner', base); }); } }, 'Rogner');
    var backBtn = E('button', { type: 'button', class: 'cba-btn sm', style: origGet(parent, k) ? '' : 'display:none', title: 'Remet la photo telle qu’elle était avant le rognage', onclick: function () { var o = origGet(parent, k); if (o) { set(o); toast('Photo d’origine remise : pensez à « Enregistrer et publier »'); } } }, 'Revenir à l’original');
    return E('div', { class: 'cba-img' }, prev, E('div', { class: 'grow' }, inp,
      E('div', { class: 'cba-row', style: 'margin-top:.35rem' }, upBtn, file, cropBtn, backBtn,
        E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { pickImage(set); } }, 'Bibliothèque'),
        parent[k] ? E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { set(''); } }, 'Retirer') : null)));
  }
  function itemTitle(x, i) {
    if (x == null) return 'Élément ' + (i + 1);
    if (typeof x !== 'object') return String(x).slice(0, 80) || '(vide)';
    if (Array.isArray(x)) return String(x[0] || '').slice(0, 80) || 'Élément ' + (i + 1);
    return String(x.title || x.titre || x.name || x.nom || x.annee || x.label || x.id || x.t || ('Élément ' + (i + 1))).slice(0, 80);
  }
  function listField(parent, k, label, path, top) {
    var arr = parent[k];
    var rerender = function () { mark(); render(); };
    var root0 = path === S.key;
    var prims = arr.length ? arr.every(function (x) { return x == null || typeof x !== 'object'; }) : (!root0 && /^(points|paragraphes|paragraphesEn|manifeste|manifesteEn|appel|appelEn|avantages|gallery|colors|sizes|clubs|perks|options)$/.test(String(k)));
    var tools = function (i) {
      var mv = function (d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; rerender(); };
      return E('span', { class: 'cba-tools' },
        E('button', { type: 'button', class: 'cba-btn sm', title: 'Monter', 'aria-label': 'Monter', onclick: function (e) { e.preventDefault(); mv(-1); } }, '↑'),
        E('button', { type: 'button', class: 'cba-btn sm', title: 'Descendre', 'aria-label': 'Descendre', onclick: function (e) { e.preventDefault(); mv(1); } }, '↓'),
        prims ? null : E('button', { type: 'button', class: 'cba-btn sm', title: 'Dupliquer', onclick: function (e) { e.preventDefault(); var c = clone(arr[i]); if (c && c.id) c.id = c.id + '-copie'; arr.splice(i + 1, 0, c); rerender(); } }, 'Dupliquer'),
        E('button', { type: 'button', class: 'cba-btn sm dan', title: 'Supprimer', onclick: function (e) { e.preventDefault(); if (!confirm('Supprimer « ' + itemTitle(arr[i], i) + ' » ?')) return; arr.splice(i, 1); rerender(); } }, 'Supprimer'));
    };
    var items = arr.map(function (x, i) {
      if (prims) return E('div', { class: 'cba-row', style: 'align-items:flex-start;margin:.35rem 0' }, E('div', { style: 'flex:1 1 240px;min-width:0' }, prim(arr, i, '')), tools(i));
      var p = path + '[' + i + ']';
      var d = E('details', { open: S.openCards[p] || null }, E('summary', {}, E('span', {}, (i + 1) + '. ' + itemTitle(x, i)), tools(i)), E('div', { class: 'inner' }, field(arr, i, '', p, true)));
      d.addEventListener('toggle', function () { S.openCards[p] = d.open; });
      return d;
    });
    var addNew = function (atTop) {
      var tpl = root0 && TEMPLATES[S.key] ? clone(TEMPLATES[S.key]) : arr.length ? blank(arr[0]) : NESTED[k] ? clone(NESTED[k]) : '';
      if (atTop) { arr.unshift(tpl); S.openCards[path + '[0]'] = true; } else { arr.push(tpl); S.openCards[path + '[' + (arr.length - 1) + ']'] = true; }
      rerender();
    };
    var canAdd = prims || arr.length || (root0 && TEMPLATES[S.key]) || NESTED[k];
    var head = top ? null : E('div', { class: 'cba-lbl' }, label + ' (' + arr.length + ')');
    return E('div', { style: top ? '' : 'margin:.4rem 0' }, head,
      root0 && canAdd && S.key === 'CASA_ARTICLES' ? E('button', { type: 'button', class: 'cba-btn pri', style: 'margin-bottom:.5rem', onclick: function () { addNew(true); } }, '+ Nouvel article (en tête)') : null,
      items,
      canAdd ? E('button', { type: 'button', class: 'cba-btn sm', style: 'margin-top:.3rem', onclick: function () { addNew(false); } }, '+ Ajouter') : E('p', { style: 'color:var(--muted);font-size:13px' }, 'Liste vide.'));
  }

  // ================= ROGNAGE =================
  // cropImage(source, { ratio, file }) → Promise<File|null> (null = annulé). source : adresse d'image ou File.
  // Avec opts.file, un bouton « Envoyer sans rogner » renvoie le fichier d'origine.
  var RATIOS = [['16:9', 16 / 9, 'Article, une'], ['4:3', 4 / 3, 'Photo classique'], ['3:2', 3 / 2, 'Reflex'], ['1:1', 1, 'Carré, réseaux'], ['4:5', 4 / 5, 'Portrait, Instagram'], ['3:4', 3 / 4, 'Portrait'], ['9:16', 9 / 16, 'Story'], ['orig', 0, 'Format d’origine']];
  var lastRatio = '16:9';
  function cropImage(source, opts) {
    opts = opts || {};
    return new Promise(function (resolve) {
      var url = typeof source === 'string' ? source : URL.createObjectURL(source);
      var name = (opts.file && opts.file.name) || (typeof source === 'string' ? decodeURIComponent(source.split('?')[0].split('/').pop() || 'image') : source.name || 'image');
      var im = new Image(); if (typeof source === 'string' && !/^(blob:|data:)/.test(url)) im.crossOrigin = 'anonymous';
      var st = { rk: opts.ratio || lastRatio, rot: 0, zoom: 1, ox: 0, oy: 0, W: 0, H: 0 };
      var done = false;
      var finish = function (v) { if (done) return; done = true; m.remove(); if (typeof source !== 'string') URL.revokeObjectURL(url); window.removeEventListener('resize', layout); resolve(v); };
      var cv = E('canvas', { class: 'cba-crop-cv', 'aria-label': 'Zone de rognage : faites glisser la photo pour la cadrer' });
      var stage = E('div', { class: 'cba-crop-stage' }, cv);
      var zoom = E('input', { type: 'range', min: '1', max: '4', step: '0.01', value: '1', 'aria-label': 'Zoom', style: 'flex:1 1 160px', oninput: function (e) { setZoom(Number(e.target.value)); } });
      var info = E('span', { style: 'font-size:13px;color:var(--muted,#666)' });
      var chips = E('div', { class: 'cba-row', style: 'margin:.5rem 0' });
      var okBtn = E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { exportCrop(); } }, opts.file ? 'Rogner et envoyer' : 'Enregistrer la photo rognée');
      var box = E('div', { class: 'cba-crop' },
        E('div', { class: 'cba-row', style: 'justify-content:space-between' }, E('strong', { style: 'font-size:1.1rem' }, 'Rogner la photo'), E('button', { type: 'button', class: 'cba-btn', onclick: function () { finish(null); } }, 'Annuler')),
        E('p', { class: 'cba-sub', style: 'margin:.3rem 0 0' }, 'Choisissez un format, puis faites glisser la photo et zoomez pour la cadrer.'),
        chips, stage,
        E('div', { class: 'cba-row', style: 'margin-top:.6rem' }, E('span', { style: 'font-weight:800' }, 'Zoom'), zoom,
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { st.rot = (st.rot + 90) % 360; reset(); } }, 'Pivoter ⟳'),
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { reset(); } }, 'Recentrer')),
        E('div', { class: 'cba-row', style: 'margin-top:.8rem' }, okBtn,
          opts.file ? E('button', { type: 'button', class: 'cba-btn', onclick: function () { finish(opts.file); } }, 'Envoyer sans rogner') : null, info));
      var m = E('div', { class: 'cba-modal', onclick: function (e) { if (e.target === m) finish(null); } }, box);
      (root || document.body).appendChild(m);
      function ratio() { var r = RATIOS.find(function (x) { return x[0] === st.rk; }); return r && r[1] ? r[1] : iw() / ih(); }
      function iw() { return st.rot % 180 ? im.naturalHeight : im.naturalWidth; }
      function ih() { return st.rot % 180 ? im.naturalWidth : im.naturalHeight; }
      function scale() { return Math.max(st.W / iw(), st.H / ih()) * st.zoom; }
      function clamp() { var s = scale(); st.ox = Math.min(0, Math.max(st.W - iw() * s, st.ox)); st.oy = Math.min(0, Math.max(st.H - ih() * s, st.oy)); }
      function drawTo(ctx, W, H, s, ox, oy) {
        ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);
        if (st.rot === 90) { ctx.translate(im.naturalHeight, 0); ctx.rotate(Math.PI / 2); }
        else if (st.rot === 180) { ctx.translate(im.naturalWidth, im.naturalHeight); ctx.rotate(Math.PI); }
        else if (st.rot === 270) { ctx.translate(0, im.naturalWidth); ctx.rotate(-Math.PI / 2); }
        ctx.drawImage(im, 0, 0); ctx.restore();
      }
      function draw() {
        var ctx = cv.getContext('2d'); ctx.clearRect(0, 0, cv.width, cv.height);
        drawTo(ctx, st.W, st.H, scale(), st.ox, st.oy);
        // repères des tiers
        ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath();
        [1, 2].forEach(function (i) { ctx.moveTo(st.W * i / 3, 0); ctx.lineTo(st.W * i / 3, st.H); ctx.moveTo(0, st.H * i / 3); ctx.lineTo(st.W, st.H * i / 3); }); ctx.stroke();
        var s = scale(), w = Math.round(Math.min(1600, st.W / s)), h = Math.round(w / ratio());
        info.textContent = 'Résultat : ' + w + ' × ' + h + ' px' + (w < 800 ? ' · photo un peu petite, elle peut paraître floue' : '');
      }
      function layout() {
        var maxW = Math.min(stage.clientWidth || 600, 760), maxH = Math.max(220, Math.min(window.innerHeight * 0.55, 520)), r = ratio();
        var W = maxW, H = W / r; if (H > maxH) { H = maxH; W = H * r; }
        var cx = st.W ? (st.W / 2 - st.ox) / (iw() * scale()) : 0.5, cy = st.H ? (st.H / 2 - st.oy) / (ih() * scale()) : 0.5;
        st.W = Math.round(W); st.H = Math.round(H); cv.width = st.W; cv.height = st.H; cv.style.width = st.W + 'px'; cv.style.height = st.H + 'px';
        var s = scale(); st.ox = st.W / 2 - cx * iw() * s; st.oy = st.H / 2 - cy * ih() * s; clamp(); draw();
      }
      function reset() { st.zoom = 1; zoom.value = '1'; st.W = 0; st.H = 0; layout(); }
      function setZoom(z) {
        var s0 = scale(), cx = (st.W / 2 - st.ox) / s0, cy = (st.H / 2 - st.oy) / s0;
        st.zoom = Math.max(1, Math.min(4, z)); var s = scale(); st.ox = st.W / 2 - cx * s; st.oy = st.H / 2 - cy * s; clamp(); draw();
      }
      function chipsRender() {
        chips.textContent = '';
        RATIOS.forEach(function (r) { add(chips, E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String(st.rk === r[0]), title: r[2], onclick: function () { st.rk = r[0]; lastRatio = r[0]; chipsRender(); reset(); } }, r[0] === 'orig' ? 'Original' : r[0], E('span', { class: 'cba-chip-sub' }, r[2]))); });
      }
      function exportCrop() {
        var s = scale(), sw = st.W / s, outW = Math.round(Math.min(1600, sw)), outH = Math.round(outW / ratio()), k = outW / st.W;
        var out = document.createElement('canvas'); out.width = outW; out.height = outH;
        var ctx = out.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, outW, outH);
        drawTo(ctx, outW, outH, s * k, st.ox * k, st.oy * k);
        okBtn.disabled = true; okBtn.textContent = 'Préparation…';
        try {
          out.toBlob(function (b) {
            if (!b) { okBtn.disabled = false; okBtn.textContent = 'Réessayer'; toast('Rognage impossible', true); return; }
            finish(new File([b], name.replace(/\.[^.]+$/, '') + '-rognee.jpg', { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.86);
        } catch (e) { finish(null); toast('Cette image vient d’un autre site et ne peut pas être rognée ici : enregistrez-la sur votre appareil, puis utilisez « Envoyer une photo ».', true); }
      }
      // glisser (souris, doigt) et molette
      var drag = null;
      cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, ox: st.ox, oy: st.oy }; try { cv.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
      cv.addEventListener('pointermove', function (e) { if (!drag) return; st.ox = drag.ox + e.clientX - drag.x; st.oy = drag.oy + e.clientY - drag.y; clamp(); draw(); });
      cv.addEventListener('pointerup', function () { drag = null; }); cv.addEventListener('pointercancel', function () { drag = null; });
      cv.addEventListener('wheel', function (e) { e.preventDefault(); var z = st.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08); zoom.value = String(Math.max(1, Math.min(4, z))); setZoom(z); }, { passive: false });
      im.onload = function () { chipsRender(); reset(); window.addEventListener('resize', layout); };
      im.onerror = function () { finish(null); toast('Impossible d’ouvrir cette image', true); };
      im.src = url;
    });
  }

  // ================= ARTICLES : rédaction =================
  var FORMATS = [
    ['article', 'Article', 'Le format classique : chapeau, intertitres, citation.', '3 min', 'L’essentiel en deux ou trois phrases : qui, quoi, où, quand.\n\n## Premier intertitre\n\nLe développement : les faits, le contexte, les chiffres.\n\n> « Une citation d’un acteur de l’événement », confie Prénom Nom.\n\n## Deuxième intertitre\n\nLa conclusion et la prochaine échéance.'],
    ['breve', 'Brève', 'Une info courte, sans intertitre.', '1 min', 'L’information en une ou deux phrases.\n\nUn détail utile : date, lieu, contact.'],
    ['compte-rendu', 'Compte rendu de match', 'Score, temps forts, réactions, la suite.', '3 min', 'Équipe A 2 – 1 Équipe B (mi-temps : 1 – 0). Le résumé du match en deux phrases.\n\n## Le film du match\n\n- 12e : premier but de …\n- 45e : …\n- 78e : …\n\n## Les réactions\n\n> « … », l’entraîneur de l’équipe A.\n\n## La suite\n\nProchain match : … contre …, le … à …'],
    ['portrait', 'Portrait', 'Une personne, son parcours, ce qui l’anime.', '4 min', 'Une scène ou un détail qui fait entrer dans l’histoire de la personne.\n\n## Son parcours\n\n…\n\n> « … »\n\n## Ce qui l’anime\n\n…\n\n## Et demain\n\n…'],
    ['interview', 'Interview', 'Questions en intertitres, réponses en paragraphes.', '4 min', 'Présentation de la personne interrogée en deux phrases.\n\n## Première question ?\n\nRéponse.\n\n## Deuxième question ?\n\nRéponse.\n\n## Troisième question ?\n\nRéponse.'],
    ['tribune', 'Tribune / édito', 'Un point de vue signé.', '3 min', 'Le constat de départ.\n\n## L’argument\n\n…\n\n## Ce que nous proposons\n\n…'],
    ['agenda', 'Annonce / agenda', 'Un événement à venir, les infos pratiques.', '1 min', 'Ce qui se prépare, en une phrase.\n\n- Quoi : …\n- Quand : …\n- Où : …\n- Tarif : …\n\nInscriptions et renseignements : …'],
    ['vierge', 'Page blanche', 'Aucun plan, vous écrivez librement.', '2 min', '']
  ];
  var SPORTS = ['Football', 'Basketball', 'Rugby', 'Handball', 'Volley-ball', 'Water-polo', 'Natation', 'Trail', 'Tennis', 'Judo', 'Boxe', 'Pétanque', 'Roller', 'Équitation', 'Ping-pong', 'Kitesurf', 'Karting', 'Golf', 'Hockey', 'Wing foil', 'Multisport', 'Autre'];
  function fmtOf(id) { return FORMATS.find(function (f) { return f[0] === id; }) || FORMATS[0]; }
  function dayLabel(d) { return (d || new Date()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  function plainText(b) { return String(b || '').replace(/^!\[[^\]]*\]\([^)]*\)\s*$/gm, '').replace(/^##\s+|^>\s*|^[-•]\s+/gm, '').replace(/\*\*/g, ''); }
  function readTime(b) { var w = plainText(b).split(/\s+/).filter(Boolean).length; return Math.max(1, Math.round(w / 220)) + ' min'; }
  function artStatus(a) {
    if (a.brouillon) return ['Brouillon', '#7a5208', 'non visible sur le site'];
    if (a.publierLe && new Date(a.publierLe) > new Date()) return ['Programmé', '#1d4ed8', 'en ligne le ' + fmtDate(a.publierLe)];
    return ['En ligne', '#11583f', ''];
  }
  function newArticle(fmt, from) {
    var f = fmtOf(fmt), a = clone(TEMPLATES.CASA_ARTICLES);
    a.format = f[0]; a.body = f[4]; a.read = f[3]; a.date = dayLabel(); a.brouillon = true; a.publierLe = '';
    a.author = (window.CasaSite && window.CasaSite.state && window.CasaSite.state.name) || 'La rédaction';
    if (f[0] === 'compte-rendu') a.tag = 'Résultat'; if (f[0] === 'agenda') a.tag = 'Agenda'; if (f[0] === 'tribune') a.tag = 'Tribune'; if (f[0] === 'interview') a.tag = 'Interview'; if (f[0] === 'portrait') a.tag = 'Portrait';
    if (from) Object.assign(a, from);
    return a;
  }
  function studioPosts() { try { return (window.CasaSite && window.CasaSite.posts ? window.CasaSite.posts() : []).filter(function (p) { return p && p.title && (p.body || p.dek); }); } catch (e) { return []; } }
  function pickFormat(done) {
    var m = E('div', { class: 'cba-modal', onclick: function (e) { if (e.target === m) m.remove(); } });
    var posts = studioPosts();
    var box = E('div', {},
      E('div', { class: 'cba-row', style: 'justify-content:space-between;margin-bottom:.4rem' }, E('strong', { style: 'font-size:1.1rem' }, 'Quel type d’article ?'), E('button', { type: 'button', class: 'cba-btn', onclick: function () { m.remove(); } }, 'Fermer')),
      E('p', { class: 'cba-sub' }, 'Chaque format propose un plan à compléter. Vous pourrez tout modifier ensuite.'),
      E('div', { class: 'cba-secs' }, FORMATS.map(function (f) {
        return E('button', { type: 'button', class: 'cba-card cba-fmt', onclick: function () { m.remove(); done(newArticle(f[0])); } }, E('strong', {}, f[1]), E('span', {}, f[2]));
      })),
      posts.length ? [E('h2', { style: 'margin:1.2rem 0 .3rem;font-size:1.05rem' }, 'Ou reprendre un article de l’espace Rédaction'),
        E('p', { class: 'cba-sub' }, 'Les articles écrits dans l’espace Rédaction de cet appareil. Une fois repris ici, ils peuvent être publiés pour tous les visiteurs.'),
        E('div', { class: 'cba-list', style: 'max-height:40vh' }, posts.slice(0, 60).map(function (p) {
          return E('button', { type: 'button', class: 'cba-it', onclick: function () {
            m.remove();
            var t = (window.CasaRedac && window.CasaRedac.TYPES || []).some(function (x) { return x[0] === p.type; }) ? p.type : 'article';
            done(newArticle(t === 'breve' || t === 'portrait' || t === 'tribune' || t === 'compte-rendu' ? t : 'article', { title: p.title || '', dek: p.dek || '', body: p.body || '', img: p.img && p.img !== 'assets/hero.jpg' ? p.img : '', alt: p.alt || '', sport: p.sport || 'Football', tag: p.tag || '', clubs: (p.clubs || []).slice(), premium: !!p.premium, author: p.author || 'La rédaction', read: readTime(p.body) }));
          } }, E('span', { class: 't' }, p.title), E('span', { class: 'm' }, [p.status === 'published' ? 'Publié' : p.status === 'review' ? 'En relecture' : 'Brouillon', p.author, p.updated].filter(Boolean).join(' · ')));
        }))] : null);
    add(m, box); root.appendChild(m);
  }
  function viewArticleList() {
    var arr = S.work;
    var start = function (a) { arr.unshift(a); S.art = 0; S.artMode = 'write'; mark(); render(); body.scrollTop = 0; };
    return E('div', {},
      E('div', { class: 'cba-row', style: 'margin-bottom:.8rem' },
        E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { pickFormat(start); } }, '+ Rédiger un article'),
        E('span', { style: 'color:var(--muted,#666);font-size:13px' }, arr.length + ' article' + (arr.length > 1 ? 's' : '') + ' ajouté' + (arr.length > 1 ? 's' : '') + ' · le plus récent en premier')),
      arr.length ? E('div', { class: 'cba-list', style: 'max-height:none' }, arr.map(function (a, i) {
        var st = artStatus(a || {});
        var mv = function (d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; mark(); render(); };
        return E('div', { class: 'cba-it', style: 'display:flex;gap:.7rem;align-items:center;cursor:default' },
          a.img ? E('img', { src: a.img, alt: '', style: 'width:72px;height:54px;object-fit:cover;flex:none;background:var(--surface-2,#eee)' }) : E('span', { style: 'width:72px;height:54px;flex:none;background:var(--surface-2,#eee)' }),
          E('span', { style: 'flex:1;min-width:0' }, E('span', { class: 't' }, a.title || '(sans titre)'),
            E('span', { class: 'm' }, E('b', { style: 'color:' + st[1] }, st[0]), ' · ', [fmtOf(a.format)[1], a.sport, a.date, st[2]].filter(Boolean).join(' · '))),
          E('span', { class: 'cba-tools' },
            E('button', { type: 'button', class: 'cba-btn sm pri', onclick: function () { S.art = i; S.artMode = 'write'; render(); body.scrollTop = 0; } }, 'Modifier'),
            E('button', { type: 'button', class: 'cba-btn sm', 'aria-label': 'Monter', onclick: function () { mv(-1); } }, '↑'),
            E('button', { type: 'button', class: 'cba-btn sm', 'aria-label': 'Descendre', onclick: function () { mv(1); } }, '↓'),
            E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var c = clone(a); c.id = ''; c.title = (c.title || '') + ' (copie)'; c.brouillon = true; arr.splice(i + 1, 0, c); mark(); render(); } }, 'Dupliquer'),
            E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Supprimer « ' + (a.title || 'cet article') + ' » ?')) return; arr.splice(i, 1); mark(); render(); } }, 'Supprimer')));
      })) : E('p', { style: 'color:var(--muted,#666)' }, 'Aucun article pour l’instant. Cliquez sur « Rédiger un article ».'));
  }
  function insertAt(ta, a, snip, sel) {
    var s0 = ta.selectionStart == null ? ta.value.length : ta.selectionStart, s1 = ta.selectionEnd == null ? s0 : ta.selectionEnd;
    var picked = ta.value.slice(s0, s1), text = typeof snip === 'function' ? snip(picked) : snip;
    ta.value = ta.value.slice(0, s0) + text + ta.value.slice(s1); a.body = ta.value; mark();
    var c = s0 + text.length; if (sel) { var k = text.indexOf(sel); if (k >= 0) { ta.setSelectionRange(s0 + k, s0 + k + sel.length); ta.focus(); return; } }
    ta.setSelectionRange(c, c); ta.focus();
  }
  function counter(el, v, max) { var n = String(v || '').length; el.textContent = n + (max ? ' / ' + max : '') + ' signes'; el.style.color = max && n > max ? 'var(--danger,#c22)' : ''; }
  function txt(a, k, label, opts) {
    opts = opts || {};
    var c = E('span', { class: 'cba-count' });
    var inp = opts.long ? E('textarea', { class: 'cba-in', rows: String(opts.rows || 3), value: a[k] || '', placeholder: opts.ph || null }) : E('input', { class: 'cba-in', value: a[k] || '', placeholder: opts.ph || null });
    inp.addEventListener('input', function () { a[k] = inp.value; mark(); if (opts.max) counter(c, inp.value, opts.max); if (opts.on) opts.on(); });
    if (opts.max) counter(c, a[k], opts.max);
    return [E('label', { class: 'cba-lbl' }, label, opts.max ? c : null), inp];
  }
  function preview(a) {
    var blocks = window.CasaSite && window.CasaSite.blocksOf ? window.CasaSite.blocksOf(a.body) : [];
    return E('article', { class: 'cba-prev' },
      E('div', { class: 'cba-lbl', style: 'margin-top:0' }, [a.sport, a.tag, a.date, a.read].filter(Boolean).join(' · ')),
      E('h1', {}, a.title || 'Titre de l’article'), a.dek ? E('p', { class: 'dek' }, a.dek) : null,
      a.img ? E('img', { src: a.img, alt: a.alt || '' }) : null,
      (a.points || []).filter(Boolean).length ? E('ul', { class: 'pts' }, a.points.filter(Boolean).map(function (p) { return E('li', {}, p); })) : null,
      blocks.map(function (b) { return b.isImg ? E('figure', {}, E('img', { src: b.src, alt: b.t }), b.t ? E('figcaption', {}, b.t) : null) : b.isH ? E('h2', {}, b.t) : b.isQ ? E('blockquote', {}, b.t) : b.isL ? E('p', { class: 'li' }, '• ' + b.t) : E('p', {}, b.t); }),
      E('p', { class: 'by' }, 'Par ' + (a.author || 'la rédaction')));
  }
  function viewArticleEditor() {
    var arr = S.work, a = arr[S.art];
    if (!a) { S.art = null; return viewArticleList(); }
    if (!Array.isArray(a.points)) a.points = []; if (!Array.isArray(a.clubs)) a.clubs = [];
    var st = artStatus(a);
    var back = E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.art = null; render(); body.scrollTop = 0; } }, '← Tous les articles');
    var modes = E('div', { class: 'cba-row' }, [['write', 'Écrire'], ['preview', 'Aperçu']].map(function (x) { return E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String((S.artMode || 'write') === x[0]), onclick: function () { S.artMode = x[0]; render(); } }, x[1]); }));
    var head = E('div', { class: 'cba-row', style: 'margin-bottom:.6rem' }, back, modes, E('span', { style: 'font-weight:800;color:' + st[1] }, st[0] + (st[2] ? ' · ' + st[2] : '')));
    if (S.artMode === 'preview') return E('div', {}, head, preview(a));

    // statut de publication
    var when = E('input', { class: 'cba-in', type: 'datetime-local', style: 'max-width:260px', value: a.publierLe ? new Date(new Date(a.publierLe).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '', onchange: function (e) { a.publierLe = e.target.value ? new Date(e.target.value).toISOString() : ''; a.brouillon = false; mark(); render(); } });
    var mode = a.brouillon ? 'draft' : a.publierLe ? 'later' : 'now';
    var radio = function (id, label, apply) { return E('label', { class: 'cba-radio' }, E('input', { type: 'radio', name: 'cba-pub', checked: mode === id || null, onchange: function () { apply(); mark(); render(); } }), label); };
    var pub = E('div', { class: 'cba-card' }, E('div', { class: 'cba-lbl', style: 'margin-top:0' }, 'Publication'),
      E('div', { class: 'cba-row' },
        radio('draft', 'Brouillon (invisible sur le site)', function () { a.brouillon = true; }),
        radio('now', 'En ligne dès l’enregistrement', function () { a.brouillon = false; a.publierLe = ''; }),
        radio('later', 'Programmer', function () { a.brouillon = false; if (!a.publierLe) { var d = new Date(Date.now() + 86400000); d.setHours(8, 0, 0, 0); a.publierLe = d.toISOString(); } })),
      mode === 'later' ? E('div', { class: 'cba-row', style: 'margin-top:.4rem' }, E('span', {}, 'Mise en ligne le'), when) : null,
      E('p', { style: 'margin:.5rem 0 0;font-size:13px;color:var(--muted,#666)' }, 'Rien n’est visible tant que vous n’avez pas cliqué « Enregistrer et publier » en haut.'));

    // texte + barre d'outils
    var ta = E('textarea', { class: 'cba-in cba-body-in', rows: '18', value: a.body || '' });
    var bodyInfo = E('span', { class: 'cba-count' });
    var upd = function () { a.read = readTime(a.body); var n = plainText(a.body).split(/\s+/).filter(Boolean).length; bodyInfo.textContent = n + ' mots · ' + a.read + ' de lecture'; };
    ta.addEventListener('input', function () { a.body = ta.value; mark(); upd(); });
    ta.addEventListener('paste', function (e) {
      var html = e.clipboardData && e.clipboardData.getData('text/html');
      if (!html || !window.CasaRedac || !window.CasaRedac.htmlToMarkup) return;
      var mk = window.CasaRedac.htmlToMarkup(html, 'article'); if (!mk) return;
      e.preventDefault(); insertAt(ta, a, mk); upd(); toast('Texte collé : intertitres, citations et listes conservés');
    });
    upd();
    var bodyImg = function () {
      var f = E('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: function (e) {
        var file = e.target.files && e.target.files[0]; if (!file) return;
        cropImage(file, { file: file, ratio: '16:9' }).then(function (x) { if (!x) return; toast('Envoi de la photo…'); return uploadFile(x).then(function (u) { var leg = prompt('Légende de la photo (facultatif) :', '') || ''; insertAt(ta, a, '\n\n![' + leg.replace(/[\[\]]/g, '') + '](' + u + ')\n\n'); upd(); toast('Photo insérée dans le texte'); }); }).catch(err);
      } });
      root.appendChild(f); f.click(); setTimeout(function () { f.remove(); }, 60000);
    };
    var tools = [
      ['Intertitre', function (s) { return '\n\n## ' + (s || 'Intertitre') + '\n\n'; }, 'Intertitre'],
      ['Citation', function (s) { return '\n\n> « ' + (s || 'Citation') + ' »\n\n'; }, 'Citation'],
      ['Liste', function (s) { return '\n' + (s ? s.split('\n').map(function (l) { return '- ' + l; }).join('\n') : '- Élément') + '\n'; }, 'Élément'],
      ['Paragraphe', '\n\nNouveau paragraphe.', 'Nouveau paragraphe.']
    ];
    var bar = E('div', { class: 'cba-row cba-tbar' }, tools.map(function (t) { return E('button', { type: 'button', class: 'cba-btn sm', onmousedown: function (e) { e.preventDefault(); }, onclick: function () { insertAt(ta, a, t[1], t[2]); upd(); } }, t[0]); }),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: bodyImg }, 'Photo dans le texte'),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var f = fmtOf(a.format); if (!f[4]) return; if (a.body && !confirm('Ajouter le plan « ' + f[1] + ' » à la fin du texte ?')) return; insertAt(ta, a, (a.body ? '\n\n' : '') + f[4]); upd(); } }, 'Insérer le plan du format'));

    // assistant intégré (sans IA en ligne : résumé à partir du texte)
    var R = window.CasaRedac;
    var assist = R && R.localAI ? E('div', { class: 'cba-row', style: 'margin-top:.4rem' },
      E('span', { style: 'font-size:13px;font-weight:800' }, 'Assistant :'),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var r = R.localAI('chapo', a)[0]; if (a.dek && !confirm('Remplacer le chapeau actuel par : « ' + r + ' » ?')) return; a.dek = r; mark(); render(); } }, 'Proposer un chapeau'),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var r = R.localAI('resume', a); if (!r.length) { toast('Écrivez d’abord le texte', true); return; } a.points = r; mark(); render(); } }, 'Points clés depuis le texte'),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var r = R.localAI('titres', a); var c = prompt('Titres proposés (tapez 1, 2 ou 3) :\n1. ' + r[0] + '\n2. ' + r[1] + '\n3. ' + r[2], '1'); var k = Number(c) - 1; if (r[k]) { a.title = r[k]; mark(); render(); } } }, 'Proposer des titres'),
      E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var r = R.localAI('relecture', a); alert('Relecture :\n\n' + (r.join ? r.join('\n') : r)); } }, 'Relire')) : null;

    // clubs liés
    var clubs = []; try { clubs = window.CasaSite.data().clubs || []; } catch (e) {}
    var clubBox = E('div', { class: 'cba-row' }, clubs.map(function (c) { var on = a.clubs.indexOf(c.id) >= 0; return E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String(on), onclick: function () { a.clubs = on ? a.clubs.filter(function (x) { return x !== c.id; }) : a.clubs.concat([c.id]); mark(); render(); } }, c.name); }));

    var sportSel = E('select', { class: 'cba-in', onchange: function (e) { a.sport = e.target.value; mark(); } }, SPORTS.concat(SPORTS.indexOf(a.sport) < 0 && a.sport ? [a.sport] : []).map(function (s) { return E('option', { value: s, selected: a.sport === s || null }, s); }));
    var fmtSel = E('select', { class: 'cba-in', onchange: function (e) { a.format = e.target.value; mark(); } }, FORMATS.map(function (f) { return E('option', { value: f[0], selected: (a.format || 'article') === f[0] || null }, f[1]); }));
    var DECORS = [['', 'Noir du site (par défaut)'], ['gazette', 'Gazette d’époque (papier jauni, typographie journal)'], ['papier', 'Papier clair']];
    var decorSel = E('select', { class: 'cba-in', onchange: function (e) { a.decor = e.target.value; mark(); } }, DECORS.map(function (d) { return E('option', { value: d[0], selected: (a.decor || '') === d[0] || null }, d[1]); }));
    var pts = E('div', {}, a.points.map(function (p, i) { return E('div', { class: 'cba-row', style: 'margin:.3rem 0' }, E('input', { class: 'cba-in', style: 'flex:1 1 240px', value: p || '', oninput: function (e) { a.points[i] = e.target.value; mark(); } }), E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { a.points.splice(i, 1); mark(); render(); } }, 'Retirer')); }),
      a.points.length < 4 ? E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { a.points.push(''); mark(); render(); } }, '+ Point clé') : null);

    return E('div', { class: 'cba-art' }, head, pub,
      E('div', { class: 'cba-card' },
        txt(a, 'title', 'Titre', { max: 80, ph: 'Un titre clair, 80 signes maximum' }),
        txt(a, 'dek', 'Chapeau', { long: true, rows: 2, max: 220, ph: 'Une ou deux phrases qui donnent envie de lire' }),
        E('div', { class: 'cba-grid2' },
          E('div', {}, E('label', { class: 'cba-lbl' }, 'Format'), fmtSel),
          E('div', {}, E('label', { class: 'cba-lbl' }, 'Discipline'), sportSel),
          E('div', {}, txt(a, 'tag', 'Rubrique / compétition', { ph: 'Régional 2, Coupe de France…' })),
          E('div', {}, txt(a, 'date', 'Date affichée', { ph: dayLabel() })),
          E('div', {}, txt(a, 'author', 'Auteur')),
          E('div', {}, E('label', { class: 'cba-lbl' }, 'Décor de lecture'), decorSel)),
        E('label', { class: 'cba-radio', style: 'margin-top:.7rem' }, E('input', { type: 'checkbox', checked: a.premium || null, onchange: function (e) { a.premium = e.target.checked; mark(); } }), 'Réservé aux abonnés Casa B+')),
      E('div', { class: 'cba-card' }, E('div', { class: 'cba-lbl', style: 'margin-top:0' }, 'Photo principale'), imgField(a, 'img', '16:9'), txt(a, 'alt', 'Description de la photo (pour les malvoyants et Google)'), txt(a, 'credit', 'Crédit photo', { ph: 'Nom du photographe ou Casa Besports' })),
      E('div', { class: 'cba-card' }, E('label', { class: 'cba-lbl', style: 'margin-top:0' }, 'Texte de l’article', bodyInfo), bar, ta, assist,
        E('p', { style: 'margin:.4rem 0 0;font-size:13px;color:var(--muted,#666)' }, 'Sélectionnez un mot puis cliquez « Intertitre » ou « Citation » pour le transformer. Vous pouvez coller un texte depuis Word ou une page web : la mise en forme est reprise.')),
      E('div', { class: 'cba-card' }, E('div', { class: 'cba-lbl', style: 'margin-top:0' }, 'Points clés (2 ou 3, affichés en encadré)'), pts),
      clubs.length ? E('div', { class: 'cba-card' }, E('div', { class: 'cba-lbl', style: 'margin-top:0' }, 'Clubs liés'), clubBox) : null,
      E('details', { class: 'cba-card' }, E('summary', { style: 'font-weight:800;cursor:pointer' }, 'Version anglaise (facultatif, bouton EN du site)'),
        txt(a, 'titleEn', 'Title'), txt(a, 'dekEn', 'Standfirst', { long: true, rows: 2 }), txt(a, 'tagEn', 'Section'), txt(a, 'bodyEn', 'Full text', { long: true, rows: 10 })),
      E('div', { class: 'cba-row' }, E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.art = null; render(); body.scrollTop = 0; } }, '← Tous les articles')));
  }

  // ================= IMAGES =================
  function resize(file) {
    return new Promise(function (res) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { res(file); return; }
      var url = URL.createObjectURL(file); var im = new Image();
      im.onload = function () {
        var max = 1600, w = im.naturalWidth, h = im.naturalHeight, r = Math.min(1, max / Math.max(w, h));
        if (r === 1 && file.size < 600000) { URL.revokeObjectURL(url); res(file); return; }
        var cv = document.createElement('canvas'); cv.width = Math.round(w * r); cv.height = Math.round(h * r);
        var keepPng = file.type === 'image/png' && file.size < 1500000;
        var ctx = cv.getContext('2d'); if (!keepPng) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height); }
        ctx.drawImage(im, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
        cv.toBlob(function (b) { res(b || file); }, keepPng ? 'image/png' : 'image/jpeg', 0.82);
      };
      im.onerror = function () { URL.revokeObjectURL(url); res(file); };
      im.src = url;
    });
  }
  function uploadFile(file) {
    if (!A.uploadImage) return Promise.reject(new Error('Stockage non configuré'));
    if (file.size > 25 * 1024 * 1024) return Promise.reject(new Error('Image trop lourde (25 Mo maximum)'));
    return resize(file).then(function (b) {
      var ext = b.type === 'image/png' ? 'png' : b.type === 'image/gif' ? 'gif' : b.type === 'image/webp' ? 'webp' : 'jpg';
      var d = new Date(), stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
      var path = 'images/' + stamp + '-' + slug(file.name.replace(/\.[^.]+$/, '')) + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;
      return A.uploadImage(b, path).then(function (u) { S.images = []; S.loaded.img = false; return u; });
    });
  }
  // Vidéos d'arrière-plan : envoyées telles quelles (pas de redimensionnement), dossier videos/
  function uploadVideo(file) {
    if (!A.uploadImage) return Promise.reject(new Error('Stockage non configuré'));
    if (!/^video\//.test(file.type || '') && !/\.(mp4|webm|mov)$/i.test(file.name || '')) return Promise.reject(new Error('Choisissez un fichier vidéo (.mp4)'));
    if (file.size > 50 * 1024 * 1024) return Promise.reject(new Error('Vidéo trop lourde (50 Mo maximum) : raccourcissez-la ou exportez-la en 1080p'));
    var ext = (/\.(mp4|webm|mov)$/i.exec(file.name || '') || [0, 'mp4'])[1].toLowerCase();
    var d = new Date(), stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    var path = 'videos/' + stamp + '-' + slug(file.name.replace(/\.[^.]+$/, '')) + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;
    var blob = file.type ? file : new Blob([file], { type: ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4' });
    return A.uploadImage(blob, path).catch(function (e) {
      var m = String((e && e.message) || e);
      if (/mime|type|size|large|exceed/i.test(m)) throw new Error('Le stockage refuse les vidéos : lancez une fois le fichier supabase/videos.sql dans Supabase (voir docs/ESPACE-ADMIN.md)');
      throw e;
    });
  }
  // Images encore utilisées dans un article ou une page : on ne supprime pas le fichier, on le retire seulement de la bibliothèque
  function hiddenImgs() { try { return JSON.parse(localStorage.getItem('cba-img-masquees') || '[]') || []; } catch (e) { return []; } }
  function usedIn(im) {
    var out = [];
    SECTIONS.forEach(function (sec) {
      var v = window[sec.key]; if (v == null) return;
      var check = function (x, label) { var j = JSON.stringify(x) || ''; if (j.indexOf(im.url) >= 0 || (im.path && j.indexOf(im.path) >= 0)) out.push(label); };
      if (Array.isArray(v)) v.forEach(function (x, i) { check(x, sec.label + ' › ' + (itemTitle(x, i) || '')); }); else check(v, sec.label);
    });
    return out;
  }
  function loadImages() {
    if (!A.listImages) return Promise.resolve();
    return A.listImages('images').then(function (d) { var h = hiddenImgs(); S.images = (d || []).filter(function (x) { return h.indexOf(x.path) < 0; }); S.loaded.img = true; render(); }, function (e) { S.loaded.img = true; render(); if (S.setup === 'ok') err(e); });
  }
  function copy(t) { try { navigator.clipboard.writeText(t).then(function () { toast('Adresse copiée'); }, function () { prompt('Adresse de l’image :', t); }); } catch (e) { prompt('Adresse de l’image :', t); } }
  function imageGrid(onPick) {
    if (!S.loaded.img) { loadImages(); return E('p', {}, 'Chargement…'); }
    if (!S.images.length) return E('p', { style: 'color:var(--muted)' }, 'Aucune image envoyée pour l’instant.');
    return E('div', { class: 'cba-grid' }, S.images.map(function (im) {
      return E('figure', {}, E('img', { src: im.url, alt: im.name, loading: 'lazy' }), E('figcaption', {}, im.name, E('div', { class: 'cba-row', style: 'margin-top:.35rem' },
        onPick ? E('button', { type: 'button', class: 'cba-btn sm pri', onclick: function () { onPick(im.url); } }, 'Choisir') :
          [E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { copy(im.url); } }, 'Copier l’adresse'),
           E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { cropImage(im.url).then(function (x) { if (!x) return; toast('Envoi de la copie rognée…'); uploadFile(x).then(function (u) { loadImages(); copy(u); toast('Copie rognée enregistrée (l’originale est conservée)'); }, err); }); } }, 'Rogner'),
           E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () {
             var used = usedIn(im);
             if (used.length) {
               if (!confirm('Cette image est utilisée dans : ' + used.slice(0, 5).join(' ; ') + (used.length > 5 ? '…' : '') + '.\n\nElle sera retirée de la bibliothèque mais restera affichée là où elle est utilisée. Pour l’enlever d’un article, retirez-la depuis l’article. Continuer ?')) return;
               try { var h = hiddenImgs(); h.push(im.path); localStorage.setItem('cba-img-masquees', JSON.stringify(h)); } catch (e) {}
               S.images = S.images.filter(function (x) { return x.path !== im.path; }); render(); toast('Retirée de la bibliothèque, conservée dans ' + (used.length > 1 ? 'les contenus qui l’utilisent' : used[0]));
               return;
             }
             if (!confirm('Supprimer définitivement cette image ? Elle n’est utilisée nulle part sur le site.')) return;
             A.removeImage(im.path).then(function () { S.images = S.images.filter(function (x) { return x.path !== im.path; }); render(); toast('Image supprimée'); }, err); } }, 'Supprimer')])));
    }));
  }
  function upZone() {
    var file = E('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none', onchange: function (e) { sendFiles(e.target.files); } });
    var z = E('div', { class: 'cba-card', style: 'border-style:dashed;text-align:center;padding:1.5rem' },
      E('p', { style: 'margin:0 0 .6rem' }, 'Glissez vos photos ici, ou'), E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { file.click(); } }, 'Choisir des photos'), file,
      E('label', { class: 'cba-radio', style: 'justify-content:center;margin-top:.6rem' }, E('input', { type: 'checkbox', checked: S.cropUp !== false || null, onchange: function (e) { S.cropUp = e.target.checked; } }), 'Rogner chaque photo avant l’envoi'),
      E('p', { style: 'margin:.4rem 0 0;font-size:13px;color:var(--muted)' }, 'Les photos sont réduites automatiquement (1600 px, JPEG) avant l’envoi.'));
    z.addEventListener('dragover', function (e) { e.preventDefault(); z.style.background = 'var(--surface-2)'; });
    z.addEventListener('dragleave', function () { z.style.background = ''; });
    z.addEventListener('drop', function (e) { e.preventDefault(); z.style.background = ''; sendFiles(e.dataTransfer.files); });
    return z;
  }
  function sendFiles(files) {
    var list = Array.prototype.slice.call(files || []).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) return;
    toast('Envoi de ' + list.length + ' photo' + (list.length > 1 ? 's' : '') + '…');
    var chain = Promise.resolve(), ok = 0;
    list.forEach(function (f) { chain = chain.then(function () { return (S.cropUp !== false ? cropImage(f, { file: f, ratio: 'orig' }) : Promise.resolve(f)).then(function (x) { if (!x) return; return uploadFile(x).then(function () { ok++; }, err); }); }); });
    chain.then(function () { if (ok) toast(ok + ' photo' + (ok > 1 ? 's envoyées' : ' envoyée')); loadImages(); });
  }
  function viewImages() {
    return [E('h1', { class: 'cba-h' }, 'Images'), E('p', { class: 'cba-sub' }, 'Vos photos en ligne. « Rogner » crée une copie recadrée (l’originale reste). Dans « Contenus du site », chaque champ image propose aussi « Envoyer une photo », « Rogner » et « Bibliothèque ».'), upZone(), imageGrid(null)];
  }
  function pickImage(cb) {
    var m = E('div', { class: 'cba-modal', onclick: function (e) { if (e.target === m) m.remove(); } });
    var box = E('div', {}, E('div', { class: 'cba-row', style: 'justify-content:space-between;margin-bottom:.8rem' }, E('strong', {}, 'Choisir une image'), E('button', { type: 'button', class: 'cba-btn', onclick: function () { m.remove(); } }, 'Fermer')));
    var grid = E('div', {}, imageGrid(function (u) { cb(u); m.remove(); }));
    add(box, grid); add(m, box); root.appendChild(m);
    if (!S.loaded.img) loadImages().then(function () { grid.textContent = ''; add(grid, imageGrid(function (u) { cb(u); m.remove(); })); });
  }

  // ================= ÉQUIPE ET ACCÈS =================
  function loadTeam() {
    db(function (c) { return c.from('demandes_acces').select('*').order('cree_le', { ascending: false }).limit(200); }).then(function (d) { S.reqs = d || []; render(); }, function () {});
    db(function (c) { return c.from('equipe').select('*').order('ajoute_le'); }).then(function (d) { S.team = d || []; S.loaded.team = true; render(); }, function () { S.loaded.team = true; render(); });
  }
  function treat(r, ok) {
    db(function (c) { return c.rpc('traiter_demande', { demande: r.id, accepter: ok }); }).then(function () {
      toast(ok ? r.email + ' a maintenant accès à l’espace rédaction' : 'Demande refusée'); loadTeam();
    }, err);
  }
  function viewTeam() {
    var em = '', nm = '';
    var pend = S.reqs.filter(function (r) { return r.statut === 'en_attente'; }), done = S.reqs.filter(function (r) { return r.statut !== 'en_attente'; });
    return [E('h1', { class: 'cba-h' }, 'Équipe et accès'),
      E('p', { class: 'cba-sub' }, 'Vous seul décidez qui accède à l’espace rédaction. Les abonnés font leur demande depuis « Mon espace » ; vous pouvez aussi habiliter quelqu’un directement par son e-mail. L’accès s’applique à sa prochaine connexion.'),
      E('h2', { style: 'margin:1.2rem 0 .5rem' }, 'Demandes d’accès en attente (' + pend.length + ')'),
      pend.length ? pend.map(function (r) {
        return E('div', { class: 'cba-card' }, E('strong', {}, r.nom || r.email), ' ', E('span', { style: 'color:var(--muted)' }, r.email + ' · ' + fmtDate(r.cree_le)),
          E('div', { class: 'cba-msg' }, r.motif || ''),
          E('div', { class: 'cba-row' }, E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { treat(r, true); } }, 'Accepter'), E('button', { type: 'button', class: 'cba-btn dan', onclick: function () { treat(r, false); } }, 'Refuser'),
            r.email ? E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.tab = 'msg'; S.compose = { to: r.email, subject: 'Votre demande d’accès à la rédaction Casa Besports', text: '', replyTo: null }; loadTab('msg'); } }, 'Lui écrire') : null));
      }) : E('p', { style: 'color:var(--muted)' }, 'Aucune demande en attente.'),
      E('h2', { style: 'margin:1.6rem 0 .5rem' }, 'Personnes habilitées'),
      E('div', { class: 'cba-card' },
        E('div', { class: 'cba-row' },
          E('input', { class: 'cba-in', type: 'email', placeholder: 'e-mail de la personne', style: 'flex:2 1 200px', oninput: function (e) { em = e.target.value; } }),
          E('input', { class: 'cba-in', placeholder: 'Nom', style: 'flex:1 1 140px', oninput: function (e) { nm = e.target.value; } }),
          E('button', { type: 'button', class: 'cba-btn pri', onclick: function () {
            var e2 = em.trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e2)) { toast('Adresse e-mail invalide', true); return; }
            db(function (c) { return c.from('equipe').insert({ email: e2, nom: nm.trim() || null, role: 'redacteur' }); }).then(function () { toast(e2 + ' peut maintenant accéder à l’espace rédaction'); loadTeam(); }, err);
          } }, 'Habiliter comme rédacteur')),
        !S.loaded.team ? E('p', {}, 'Chargement…') : E('table', { class: 'cba-tbl', style: 'margin-top:.8rem' }, E('tbody', {}, S.team.map(function (m) {
          return E('tr', {}, E('td', {}, E('strong', {}, m.nom || m.email), E('div', { style: 'color:var(--muted)' }, m.email)), E('td', {}, etiquetteLabel(m.role) + (m.club ? ' · ' + clubName(m.club) : '')),
            E('td', { style: 'text-align:right' }, m.role === 'admin' ? null : E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Retirer l’accès à la rédaction de ' + m.email + ' ?')) return; db(function (c) { return c.from('equipe').delete().eq('email', m.email); }).then(function () { toast('Accès retiré'); loadTeam(); }, err); } }, 'Retirer l’accès')));
        })))),
      done.length ? [E('h2', { style: 'margin:1.6rem 0 .5rem' }, 'Demandes traitées'), E('table', { class: 'cba-tbl' }, E('tbody', {}, done.slice(0, 50).map(function (r) {
        return E('tr', {}, E('td', {}, r.nom || r.email, E('div', { style: 'color:var(--muted)' }, r.email)), E('td', {}, r.statut === 'acceptee' ? 'Acceptée' : 'Refusée'), E('td', {}, fmtDate(r.traite_le || r.cree_le)));
      })))] : null];
  }

  // ================= ABONNÉS ET ÉTIQUETTES DE LA RÉDACTION =================
  // Liste lue par la fonction serveur liste_abonnes() (supabase/abonnes.sql) : réservée à l'administrateur.
  var ETIQUETTES = [['', 'Aucun accès'], ['redacteur', 'Rédacteur'], ['collaborateur', 'Chef d’édition'], ['correspondant', 'Correspondant de club']];
  function etiquetteLabel(r) { if (r === 'admin') return 'Administrateur'; var f = ETIQUETTES.filter(function (x) { return x[0] === r; })[0]; return f ? f[1] : (r || ''); }
  function clubsList() { return (Array.isArray(window.CASA_CLUBS) ? window.CASA_CLUBS : []).filter(function (c) { return c && c.id && c.name; }); }
  function clubName(id) { var c = clubsList().filter(function (k) { return k.id === id; })[0]; return c ? c.name : (id || ''); }
  function formuleLabel(id) { var f = (Array.isArray(window.CASA_ABONNEMENTS) ? window.CASA_ABONNEMENTS : []).filter(function (a) { return a && a.id === id; })[0]; return f ? f.name : id; }
  var STATUTS_ABO = { active: 'actif', trialing: 'essai', past_due: 'paiement en retard', unpaid: 'impayé', canceled: 'résilié', incomplete: 'paiement à finir', incomplete_expired: 'expiré' };
  function aboActif(u) { return u.formule && (u.statut_abonnement === 'active' || u.statut_abonnement === 'trialing'); }
  function loadSubs() {
    S.subsErr = null;
    return db(function (c) { return c.rpc('liste_abonnes'); }).then(function (d) { S.subs = d || []; S.loaded.subs = true; render(); }, function (e) {
      var m = (e && e.message) || ''; S.subsErr = /liste_abonnes|function|schema cache|PGRST202/i.test(m) && !/Réservé/.test(m) ? 'sql' : m || 'Erreur'; S.loaded.subs = true; render();
    });
  }
  function setEtiquette(u, role, club) {
    var txt = role ? (u.email + ' recevra l’étiquette « ' + etiquetteLabel(role) + (club ? ' · ' + clubName(club) : '') + ' ».') : 'Retirer l’accès à la rédaction de ' + u.email + ' ?';
    if (!confirm(txt)) return;
    db(function (c) { return c.rpc('definir_etiquette', { adresse: u.email, etiquette: role || null, club_id: club || null, nom_affiche: u.nom || null }); }).then(function () {
      if (S.subEdit) delete S.subEdit[u.id];
      toast(role ? 'Étiquette enregistrée : elle s’applique à sa prochaine connexion' : 'Accès à la rédaction retiré');
      loadSubs(); S.loaded.team = false;
    }, err);
  }
  function subMatches(u) {
    var f = S.subF || 'tous';
    if (f === 'payants' && !aboActif(u)) return false;
    if (f === 'redaction' && !u.etiquette) return false;
    if (f === 'demandes' && u.demande !== 'en_attente') return false;
    var q = (S.subQ || '').trim().toLowerCase(); if (!q) return true;
    return [u.nom, u.email, u.telephone, u.numero_membre].some(function (v) { return v && String(v).toLowerCase().indexOf(q) >= 0; });
  }
  function subCard(u) {
    var mailOk = u.email && u.email_confirme;
    var cur = (S.subEdit && S.subEdit[u.id]) || u.etiquette || '';
    var abo = u.formule ? formuleLabel(u.formule) + (u.periode ? ' · ' + (u.periode === 'an' ? 'à l’année' : 'au mois') : '') + ' · ' + (STATUTS_ABO[u.statut_abonnement] || u.statut_abonnement || '') + (u.fin_abonnement ? ' jusqu’au ' + new Date(u.fin_abonnement).toLocaleDateString('fr-FR') : '') : 'Compte gratuit';
    var kv = [['E-mail', u.email ? E('a', { href: 'mailto:' + u.email }, u.email) : '—', u.email && !u.email_confirme ? ' (non confirmée)' : ''],
      ['Téléphone', u.telephone ? E('a', { href: 'tel:+' + String(u.telephone).replace(/^\+/, '') }, '+' + String(u.telephone).replace(/^\+/, '')) : '—'],
      ['Abonnement', abo], ['Carte membre', u.numero_membre || '—'],
      ['Inscrit le', u.inscrit_le ? new Date(u.inscrit_le).toLocaleDateString('fr-FR') : '—'], ['Vu le', u.derniere_connexion ? fmtDate(u.derniere_connexion) : '—']];
    return E('div', { class: 'cba-card' },
      E('div', { class: 'cba-row', style: 'justify-content:space-between' },
        E('strong', { style: 'font-size:1.05rem' }, u.nom || u.email || (u.telephone ? '+' + String(u.telephone).replace(/^\+/, '') : 'Sans nom'),
          u.etiquette ? E('span', { class: 'cba-tag', style: 'background:#1d5e3a' }, etiquetteLabel(u.etiquette) + (u.club ? ' · ' + clubName(u.club) : '')) : null,
          aboActif(u) ? E('span', { class: 'cba-tag dr' }, 'abonné') : null,
          u.demande === 'en_attente' ? E('span', { class: 'cba-tag' }, 'demande en attente') : null),
        u.email ? E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { S.tab = 'msg'; S.compose = { to: u.email, subject: 'Casa Besports', text: '', replyTo: null }; loadTab('msg'); } }, 'Lui écrire') : null),
      E('dl', { class: 'cba-kv', style: 'margin:.6rem 0' }, kv.map(function (r) { return [E('dt', {}, r[0]), E('dd', {}, r[1], r[2] || null)]; })),
      u.etiquette === 'admin' ? E('p', { style: 'color:var(--muted);margin:0' }, 'Compte administrateur : il ne se modifie pas ici.')
      : !mailOk ? E('p', { style: 'color:var(--muted);margin:0' }, 'Accès à la rédaction impossible pour l’instant : il faut une adresse e-mail confirmée (la personne se connecte une fois avec son e-mail, depuis « Mon espace »).')
      : [E('div', { class: 'cba-lbl' }, 'Accès à la rédaction'),
        E('div', { class: 'cba-row' }, ETIQUETTES.map(function (t) {
          return E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String(cur === t[0]), onclick: function () { S.subEdit = S.subEdit || {}; delete S.subEdit[u.id]; if (t[0] === 'correspondant') { S.subEdit[u.id] = 'correspondant'; render(); return; } if (t[0] === (u.etiquette || '')) { render(); return; } setEtiquette(u, t[0]); } }, t[1]);
        })),
        cur === 'correspondant' ? E('div', { class: 'cba-row', style: 'margin-top:.5rem' },
          E('select', { class: 'cba-in', style: 'flex:1 1 220px;width:auto', 'aria-label': 'Club du correspondant', onchange: function (e) { if (e.target.value) setEtiquette(u, 'correspondant', e.target.value); } },
            E('option', { value: '' }, u.club ? 'Changer de club…' : 'Choisir son club…'),
            clubsList().map(function (c) { return E('option', { value: c.id, selected: c.id === u.club ? true : null }, c.name + (c.sport ? ' · ' + c.sport : '')); }))) : null]);
  }
  function subList() {
    var list = S.subs.filter(subMatches);
    return E('div', {}, E('p', { style: 'color:var(--muted);margin:.4rem 0 .8rem' }, list.length + ' compte' + (list.length > 1 ? 's' : '') + (list.length !== S.subs.length ? ' sur ' + S.subs.length : '')),
      list.length ? list.slice(0, 300).map(subCard) : E('p', {}, 'Aucun compte ne correspond.'),
      list.length > 300 ? E('p', { style: 'color:var(--muted)' }, 'Seuls les 300 premiers sont affichés : affinez la recherche.') : null);
  }
  function viewSubs() {
    var head = [E('h1', { class: 'cba-h' }, 'Abonnés'),
      E('p', { class: 'cba-sub' }, 'Toutes les personnes inscrites sur le site, avec leurs coordonnées et leur abonnement. Donnez ou retirez un accès à la rédaction avec les étiquettes : Rédacteur, Chef d’édition ou Correspondant de club (rattaché à un seul club). L’accès s’applique à leur prochaine connexion.'),
      E('div', { class: 'cba-note' }, E('strong', {}, 'Données personnelles. '), 'Cette liste n’est visible que par vous (vérifié par Supabase). Utilisez ces coordonnées uniquement pour Casa Besports (RGPD) : ne les copiez pas ailleurs et ne les transmettez à personne.')];
    if (!S.loaded.subs) return head.concat(E('p', {}, 'Chargement…'));
    if (S.subsErr === 'sql') return head.concat(E('div', { class: 'cba-note' }, E('strong', {}, 'Une étape à faire une seule fois. '), 'Ouvrez Supabase › SQL Editor › New query, collez le contenu du fichier supabase/abonnes.sql du dépôt, puis cliquez « Run ». Revenez ensuite ici et cliquez « Actualiser ». (Guide : docs/ESPACE-ADMIN.md, partie « Abonnés »)'), E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.loaded.subs = false; render(); loadSubs(); } }, 'Actualiser'));
    if (S.subsErr) return head.concat(E('div', { class: 'cba-note' }, 'La liste n’a pas pu être chargée : ' + S.subsErr), E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.loaded.subs = false; render(); loadSubs(); } }, 'Réessayer'));
    var n = function (f) { return S.subs.filter(f).length; };
    var chips = [['tous', 'Tous (' + S.subs.length + ')'], ['payants', 'Abonnés payants (' + n(aboActif) + ')'], ['redaction', 'Rédaction (' + n(function (u) { return u.etiquette; }) + ')'], ['demandes', 'Demandes en attente (' + n(function (u) { return u.demande === 'en_attente'; }) + ')']];
    var holder = E('div', {}, subList());
    return head.concat(
      E('div', { class: 'cba-row', style: 'margin-bottom:.6rem' }, chips.map(function (c) { return E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String((S.subF || 'tous') === c[0]), onclick: function () { S.subF = c[0]; render(); } }, c[1]); }),
        E('button', { type: 'button', class: 'cba-btn sm', style: 'margin-left:auto', onclick: function () { loadSubs(); } }, 'Actualiser')),
      E('input', { class: 'cba-in', type: 'search', placeholder: 'Rechercher un nom, un e-mail, un téléphone, une carte membre…', value: S.subQ || '', 'aria-label': 'Rechercher un abonné', oninput: function (e) { S.subQ = e.target.value; holder.textContent = ''; add(holder, subList()); } }),
      holder);
  }

  // ================= AIDE =================
  // ---------- Résultats et classements (saisie à la main) ----------
  var SP_SPORTS = ['Football', 'Basketball', 'Rugby', 'Water-polo', 'Natation', 'Judo', 'Tennis', 'Trail'];
  function spBlank() { return { maj: null, sources: [], comps: {}, tables: {}, matches: [], teamClub: {}, clubs: [] }; }
  function spLoad() {
    var v = clone(window.CASA_SPORT) || {}; var b = spBlank();
    Object.keys(b).forEach(function (k) { if (v[k] == null) v[k] = b[k]; });
    S.sp = v; S.dirty = false;
    if (!S.spComp || !spCompOf(S.spComp)) { var f = spAllComps()[0]; S.spComp = f ? f.id : null; }
  }
  function spAllComps() { var out = []; Object.keys(S.sp.comps || {}).forEach(function (sp) { (S.sp.comps[sp] || []).forEach(function (c) { out.push({ id: c.id, label: c.label, sport: sp }); }); }); return out; }
  function spCompOf(id) { return spAllComps().find(function (c) { return c.id === id; }) || null; }
  function spNum(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : n; }
  function spClubs() { try { return (window.CasaSite && window.CasaSite.data && window.CasaSite.data().clubs) || []; } catch (e) { return []; } }
  function spTeams(onlyUsed) {
    var t = {}; Object.keys(S.sp.tables || {}).forEach(function (k) { (S.sp.tables[k] || []).forEach(function (r) { if (r.team) t[r.team] = 1; }); });
    (S.sp.matches || []).forEach(function (m) { if (m.home) t[m.home] = 1; if (m.away) t[m.away] = 1; });
    if (!onlyUsed) spClubs().forEach(function (c) { t[c.name] = 1; });
    return Object.keys(t).sort(function (a, b) { return a.localeCompare(b, 'fr'); });
  }
  function spSave() {
    var v = S.sp, clubs = spClubs(), bad = null;
    (v.matches || []).forEach(function (m) {
      if (!m.date || !m.home || !m.away) bad = bad || 'Un match n’a pas de date ou d’équipe';
      var done = m.hs !== null && m.hs !== '' && m.hs != null && m.as !== null && m.as !== '' && m.as != null;
      m.hs = done ? spNum(m.hs) : null; m.as = done ? spNum(m.as) : null; m.status = done ? 'done' : 'up';
      m.id = slug(m.comp) + '-' + m.date + '-' + slug(m.home) + '-' + slug(m.away);
    });
    if (bad) { toast(bad, true); return; }
    var ids = {}, dup = null; v.matches.forEach(function (m) { if (ids[m.id]) dup = m.home + ' – ' + m.away + ' (' + m.date + ')'; ids[m.id] = 1; });
    if (dup) { toast('Match en double : ' + dup, true); return; }
    Object.keys(v.tables).forEach(function (k) {
      v.tables[k] = (v.tables[k] || []).filter(function (r) { return r.team && String(r.team).trim(); }).map(function (r) {
        return { team: String(r.team).trim(), j: spNum(r.j), g: spNum(r.g), n: spNum(r.n), p: spNum(r.p), diff: spNum(r.diff), pts: spNum(r.pts), form: String(r.form || '').toUpperCase().replace(/[^VNDP]/g, '').replace(/P/g, 'D').slice(-5) };
      }).sort(function (a, b) { return b.pts - a.pts || b.diff - a.diff; });
    });
    spTeams(true).forEach(function (t) { var c = clubs.find(function (x) { return x.name === t; }); if (c && !v.teamClub[t]) v.teamClub[t] = c.id; });
    if (v.sources.indexOf('Saisie de la rédaction (espace administrateur)') < 0) v.sources.push('Saisie de la rédaction (espace administrateur)');
    v.maj = new Date().toISOString();
    S.busy = true; render();
    A.saveContent('CASA_SPORT', v).then(function () { draftDel('CASA_SPORT'); S.busy = false; spLoad(); render(); toast('Publié : visible par tous les visiteurs'); }, function (e) { S.busy = false; render(); err(e); });
  }
  function spMark() { draftLater(); if (!S.dirty) { S.dirty = true; var b = root && root.querySelector('.cba-save'); if (b) b.disabled = false; } }
  function spIn(obj, k, opts) {
    opts = opts || {};
    return E('input', { class: 'cba-in', type: opts.type || 'text', value: obj[k] == null ? '' : String(obj[k]), placeholder: opts.ph || null, list: opts.list || null, style: opts.style || null,
      inputmode: opts.type === 'number' ? 'numeric' : null, 'aria-label': opts.label || k,
      oninput: function (e) { obj[k] = e.target.value; spMark(); } });
  }
  function viewSport() {
    if (!S.sp) spLoad();
    var v = S.sp, comps = spAllComps(), cur = spCompOf(S.spComp), edited = (A.editedKeys ? A.editedKeys() : []).indexOf('CASA_SPORT') >= 0;
    var nc = { sport: 'Football', label: '' };
    var out = [E('div', { class: 'cba-bar' }, E('div', { class: 'cba-row' },
        E('strong', { style: 'font-size:1.2rem;margin-right:auto' }, 'Résultats et classements'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { startPreview('CASA_SPORT', S.sp); } }, 'Aperçu sur le site'),
        E('button', { type: 'button', class: 'cba-btn', disabled: !S.dirty || null, onclick: function () { toast(draftPut('CASA_SPORT', S.sp) ? 'Brouillon enregistré sur cet appareil (non publié)' : 'Brouillon impossible : stockage du navigateur indisponible'); } }, 'Enregistrer le brouillon'),
        E('button', { type: 'button', class: 'cba-btn pri cba-save', disabled: (!S.dirty || S.busy) || null, onclick: spSave }, S.busy ? 'Publication…' : 'Enregistrer et publier'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { if ((S.dirty || draftGet('CASA_SPORT')) && !confirm('Abandonner les modifications et supprimer le brouillon ?')) return; draftDel('CASA_SPORT'); spLoad(); render(); } }, 'Annuler les modifications'),
        edited ? E('button', { type: 'button', class: 'cba-btn dan', onclick: function () { if (!confirm('Effacer tout ce qui a été saisi ici et revenir au fichier contenus/sport.js du dépôt ?')) return; S.busy = true; render(); A.resetContent('CASA_SPORT').then(function () { S.busy = false; spLoad(); render(); toast('Version d’origine rétablie'); }, function (e) { S.busy = false; render(); err(e); }); } }, 'Version d’origine') : null)),
      E('p', { class: 'cba-sub' }, 'Saisissez vous-même les classements, les scores et les prochains matchs. Ils s’affichent dans « Le Terrain » dès que vous publiez. Une case de score vide = match à venir.'),
      draftNote('CASA_SPORT', function (d) { S.sp = d; }),
      v.maj ? E('p', { class: 'cba-sub', style: 'margin-top:-.6rem' }, 'Dernière publication : ' + fmtDate(v.maj)) : null,
      E('datalist', { id: 'cba-teams' }, spTeams().map(function (t) { return E('option', { value: t }); }))];

    // compétitions
    out.push(E('div', { class: 'cba-card' }, E('strong', {}, '1. Compétitions'),
      comps.length ? E('div', { class: 'cba-row', style: 'margin:.6rem 0' }, comps.map(function (c) {
        return E('button', { type: 'button', class: 'cba-chip', 'aria-pressed': String(c.id === S.spComp), onclick: function () { S.spComp = c.id; render(); } }, c.label, E('span', { class: 'cba-chip-sub' }, c.sport));
      })) : E('p', { class: 'cba-sub', style: 'margin:.5rem 0' }, 'Aucune compétition pour l’instant : ajoutez la première ci-dessous (par exemple « Régional 2 · groupe B »).'),
      E('div', { class: 'cba-row', style: 'margin-top:.4rem' },
        E('select', { class: 'cba-in', style: 'flex:0 1 170px', 'aria-label': 'Discipline', onchange: function (e) { nc.sport = e.target.value; } }, SP_SPORTS.map(function (s) { return E('option', { value: s }, s); })),
        E('input', { class: 'cba-in', style: 'flex:1 1 220px', placeholder: 'Nom de la compétition', 'aria-label': 'Nom de la compétition', oninput: function (e) { nc.label = e.target.value; } }),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () {
          var label = nc.label.trim(); if (!label) { toast('Donnez un nom à la compétition', true); return; }
          var id = slug(label), i = 2; while (spCompOf(id)) id = slug(label) + '-' + (i++);
          (v.comps[nc.sport] = v.comps[nc.sport] || []).push({ id: id, label: label }); v.tables[id] = v.tables[id] || [];
          S.spComp = id; spMark(); render();
        } }, 'Ajouter la compétition'))));

    if (cur) {
      var rows = v.tables[cur.id] = v.tables[cur.id] || [];
      out.push(E('div', { class: 'cba-card' },
        E('div', { class: 'cba-row' }, E('strong', { style: 'margin-right:auto' }, cur.label + ' · ' + cur.sport),
          E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { var n = prompt('Nouveau nom de la compétition', cur.label); if (!n || !n.trim()) return; (v.comps[cur.sport] || []).forEach(function (c) { if (c.id === cur.id) c.label = n.trim(); }); spMark(); render(); } }, 'Renommer'),
          E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () {
            if (!confirm('Supprimer « ' + cur.label + ' », son classement et ses matchs ?')) return;
            v.comps[cur.sport] = (v.comps[cur.sport] || []).filter(function (c) { return c.id !== cur.id; }); if (!v.comps[cur.sport].length) delete v.comps[cur.sport];
            delete v.tables[cur.id]; v.matches = v.matches.filter(function (m) { return m.comp !== cur.id; }); S.spComp = null; spLoadKeep(); spMark(); render();
          } }, 'Supprimer la compétition'))));

      // classement
      var num = function (r, k, l) { return E('td', {}, spIn(r, k, { type: 'number', label: l, style: 'min-width:52px;padding:.4rem' })); };
      out.push(E('div', { class: 'cba-card' }, E('strong', {}, '2. Classement'),
        E('p', { class: 'cba-sub', style: 'margin:.3rem 0 .6rem;font-size:14px' }, 'Une ligne par équipe. L’ordre se fait tout seul par points à la publication. Forme : les 5 derniers matchs, V (victoire), N (nul), D (défaite), ex. VVNDV.'),
        E('div', { style: 'overflow-x:auto' }, E('table', { class: 'cba-tbl' },
          E('thead', {}, E('tr', {}, ['Équipe', 'J', 'G', 'N', 'P', 'Diff.', 'Pts', 'Forme', ''].map(function (h) { return E('th', {}, h); }))),
          E('tbody', {}, rows.map(function (r, i) {
            return E('tr', {}, E('td', {}, spIn(r, 'team', { list: 'cba-teams', label: 'Équipe', style: 'min-width:170px;padding:.4rem' })),
              num(r, 'j', 'Joués'), num(r, 'g', 'Gagnés'), num(r, 'n', 'Nuls'), num(r, 'p', 'Perdus'), num(r, 'diff', 'Différence'), num(r, 'pts', 'Points'),
              E('td', {}, spIn(r, 'form', { label: 'Forme', ph: 'VVNDV', style: 'min-width:80px;padding:.4rem' })),
              E('td', {}, E('button', { type: 'button', class: 'cba-btn sm dan', 'aria-label': 'Retirer cette équipe', onclick: function () { rows.splice(i, 1); spMark(); render(); } }, '✕')));
          })))),
        E('button', { type: 'button', class: 'cba-btn', style: 'margin-top:.6rem', onclick: function () { rows.push({ team: '', j: 0, g: 0, n: 0, p: 0, diff: 0, pts: 0, form: '' }); spMark(); render(); } }, '+ Ajouter une équipe')));

      // matchs
      var ms = v.matches.filter(function (m) { return m.comp === cur.id; }).sort(function (a, b) { return (b.date || '') > (a.date || '') ? 1 : -1; });
      out.push(E('div', { class: 'cba-card' }, E('strong', {}, '3. Matchs (résultats et à venir)'),
        E('p', { class: 'cba-sub', style: 'margin:.3rem 0 .6rem;font-size:14px' }, 'Laissez les scores vides pour un match à venir, remplissez-les quand le match est joué. Pensez à retirer les matchs reportés.'),
        ms.length ? ms.map(function (m) {
          return E('fieldset', { style: 'border:1px dashed var(--line,#ccc);padding:.4rem .8rem .8rem;margin:.6rem 0' },
            E('div', { class: 'cba-grid2' },
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Date'), spIn(m, 'date', { type: 'date', label: 'Date' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Heure'), spIn(m, 'time', { type: 'time', label: 'Heure' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Domicile'), spIn(m, 'home', { list: 'cba-teams', label: 'Équipe à domicile' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Extérieur'), spIn(m, 'away', { list: 'cba-teams', label: 'Équipe à l’extérieur' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Score domicile'), spIn(m, 'hs', { type: 'number', label: 'Score domicile', ph: 'à venir' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Score extérieur'), spIn(m, 'as', { type: 'number', label: 'Score extérieur', ph: 'à venir' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Lieu (facultatif)'), spIn(m, 'venue', { label: 'Lieu' })),
              E('div', {}, E('label', { class: 'cba-lbl' }, 'Source (facultatif)'), spIn(m, 'source', { label: 'Source', ph: 'adresse de la feuille de match' }))),
            E('button', { type: 'button', class: 'cba-btn sm dan', style: 'margin-top:.6rem', onclick: function () { v.matches = v.matches.filter(function (x) { return x !== m; }); spMark(); render(); } }, 'Retirer ce match'));
        }) : E('p', { class: 'cba-sub', style: 'font-size:14px' }, 'Aucun match pour cette compétition.'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { v.matches.push({ id: '', sport: cur.sport, comp: cur.id, date: new Date().toISOString().slice(0, 10), time: '15:00', home: '', away: '', hs: null, as: null, status: 'up', venue: '', source: '' }); spMark(); render(); } }, '+ Ajouter un match')));
    }
    return out;
  }
  function spLoadKeep() { var f = spAllComps()[0]; S.spComp = f ? f.id : null; }

  function viewHelp() {
    var P = function (t) { return E('p', { style: 'line-height:1.6' }, t); };
    return [E('h1', { class: 'cba-h' }, 'Aide'),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Modifier le site'),
        P('Avant de publier, « Aperçu sur le site » montre la page telle que les visiteurs la verront, sans rien publier : « Revenir à l’édition » pour continuer, « Publier » pour mettre en ligne. Vos changements sont aussi gardés automatiquement en brouillon sur cet appareil : en revenant sur la section, « Reprendre le brouillon ». Dans la Gazette, le bouton « Modifier cette page » ouvre directement la bonne page ici.'),
        P('Contenus du site › choisissez la section › modifiez › « Enregistrer et publier ». La modification est en ligne tout de suite, pour tous les visiteurs. « Version d’origine » efface vos changements et rétablit le fichier du dépôt GitHub.'),
        P('Les articles déposés par la Rédaction quotidienne continuent d’apparaître en plus de ceux que vous modifiez ici.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Retoucher n’importe quel texte ou image'),
        P('Sur le site (espace admin fermé), bouton « ✎ Retoucher » en bas à gauche : cliquez sur un titre, un paragraphe, un bouton ou une image, modifiez, « Appliquer » pour voir le résultat, puis « Publier » dans la barre noire. « Naviguer » permet de changer de page sans perdre vos retouches. Tout se retrouve dans Contenus du site › Retouches des pages.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Résultats et classements'),
        P('Onglet Résultats : ajoutez une compétition, remplissez son classement et ses matchs, puis « Enregistrer et publier ». Ce que vous publiez ici remplace le fichier contenus/sport.js tant que vous ne cliquez pas sur « Version d’origine ».')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Images'),
        P('Envoyez une photo depuis n’importe quel champ image, ou depuis l’onglet Images. Elle est réduite automatiquement puis stockée en ligne ; son adresse est remplie à votre place.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Messagerie'),
        P('Toutes les demandes du site arrivent ici. Pour répondre directement depuis le site et recevoir les e-mails des adresses suivies, deux réglages sont à faire une fois (Brevo et l’adresse de réception) : suivez docs/ESPACE-ADMIN.md. En attendant, « Répondre » ouvre votre messagerie habituelle.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Accès à la rédaction'),
        P('Seules les personnes listées dans Équipe et accès voient l’espace rédaction. Un abonné peut vous envoyer une demande depuis Mon espace ; vous l’acceptez ou la refusez en un clic.'))];
  }

  window.CasaAdmin = { open: open, close: close, uploadFile: uploadFile, uploadVideo: uploadVideo, ensureCss: function () { if (!document.getElementById('cba-css')) document.head.appendChild(E('style', { id: 'cba-css', text: CSS })); }, editGazette: editGazette, editSection: function (k, i) { if (!S.open) open(); editSection(k, i == null ? null : i); }, wantOpen: wantOpen, cropImage: cropImage, isOpen: function () { return S.open; } };
})();
