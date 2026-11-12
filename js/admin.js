/*!
 * Casa Besports — espace administrateur (réservé à l'administrateur du site).
 * Ouverture : menu « Plus › Espace administrateur », bouton « Admin » de l'en-tête, ou adresse #/admin.
 *  - Messagerie : demandes reçues par le site + e-mails des adresses suivies, réponses
 *  - Contenus : toutes les sections modifiables (articles, Gazette, lieux, boutique, vidéos, culture, fonds, À propos, pages légales)
 *  - Images : envoi de photos (redimensionnées automatiquement) dans le stockage du site
 *  - Équipe : demandes d'accès à la rédaction, rédacteurs habilités
 * Les droits sont vérifiés par Supabase (supabase/administration.sql) : ce fichier n'est que l'interface.
 */
(function () {
  'use strict';
  var A = window.CasaAuth || {};

  // ---------- sections modifiables ----------
  var SECTIONS = [
    { key: 'CASA_ARTICLES', label: 'Articles', desc: 'Les articles publiés (Actualités, accueil). Le plus récent en premier.', item: 'title' },
    { key: 'CASA_GAZETTE_NUMERO', label: 'Gazette : le numéro', desc: 'Couverture, numéro, date, accroche et image de La Gazette du Cotentin.' },
    { key: 'CASA_GAZETTE', label: 'Gazette : les pages', desc: 'Les pages du magazine, dans l’ordre (modèles : article, portrait, number, choc, humeur).', item: 'title' },
    { key: 'CASA_LIEUX', label: 'Lieux', desc: 'Les lieux du territoire : textes et vraies photos (champ « Photo »).', item: 'name' },
    { key: 'CASA_BOUTIQUE', label: 'Boutique : présentation', desc: 'Bandeau de la boutique et affiches des collections (images de présentation).' },
    { key: 'CASA_PRODUITS', label: 'Boutique : produits', desc: 'Fiches produits : nom, prix, photos, tailles, couleurs.', item: 'name' },
    { key: 'CASA_VIDEOS', label: 'Vidéos', desc: 'Vidéos et vignettes.', item: 'title' },
    { key: 'CASA_CULTURE', label: 'Culture', desc: 'Œuvres et photographies des salles Culture.', item: 'title' },
    { key: 'CASA_FONDS', label: 'Fonds de page', desc: 'L’image derrière chaque page du site.' },
    { key: 'CASA_APROPOS', label: 'À propos', desc: 'L’histoire de Casa Besports et la frise des dates.' },
    { key: 'CASA_LEGAL', label: 'Pages légales', desc: 'Mentions légales, confidentialité, CGV, CGU.' },
    { key: 'CASA_LEGAL_MAJ', label: 'Pages légales : date', desc: 'Date de dernière mise à jour affichée.' }
  ];
  // Modèle d'un nouvel élément quand la liste est vide
  var TEMPLATES = {
    CASA_ARTICLES: { id: '', sport: 'Football', tag: '', date: '', read: '3 min', premium: false, img: '', alt: '', title: '', dek: '', clubs: [], points: ['', ''], author: 'La rédaction', body: '', titleEn: '', dekEn: '', bodyEn: '', tagEn: '' },
    CASA_GAZETTE: { id: '', sec: 'À la une', kind: 'article', rubric: '', title: '', script: '', kicker: '', paras: [{ t: '' }], img: '', imgCap: '', quote: '', quoteBy: '' },
    CASA_LIEUX: { id: '', name: '', short: '', where: '', year: '', img: '', photo: '', hook: '', desc: '', moment: '', sport: '' },
    CASA_PRODUITS: { id: '', line: 'casa', name: '', short: '', price: 0, type: 'tee', img: '', gallery: [], colors: ['marine'], sizes: ['S', 'M', 'L', 'XL'], flag: '', isNew: false, desc: '' },
    CASA_VIDEOS: { id: '', tag: '', date: '', img: '', alt: '', title: '', dek: '', url: '', dur: '' },
    CASA_CULTURE: { salle: '3', title: '', author: '', year: '', technique: '', img: '', alt: '', text: '' }
  };
  // Modèle d'un élément ajouté dans une sous-liste vide
  var NESTED = { dates: { annee: '', titre: '', texte: '', titreEn: '', texteEn: '' }, paras: { t: '' }, sections: ['', ''], collections: { ligne: '', nom: '', accroche: '', titre: '', texte: '', image: '' } };
  var LABELS = {
    id: 'Identifiant (unique, sans espace ni accent)', title: 'Titre', titre: 'Titre', titleEn: 'Titre (anglais)', titreEn: 'Titre (anglais)', dek: 'Chapeau', dekEn: 'Chapeau (anglais)',
    body: 'Texte de l’article (## intertitre, > citation, ![légende](image))', bodyEn: 'Texte (anglais)', tag: 'Rubrique', tagEn: 'Rubrique (anglais)', sport: 'Discipline', date: 'Date affichée', read: 'Temps de lecture',
    premium: 'Réservé aux abonnés Casa B+', img: 'Image', image: 'Image', photo: 'Photo réelle (remplace l’illustration)', alt: 'Description de l’image', imageAlt: 'Description de l’image', clubs: 'Clubs liés (identifiants)', points: 'Points clés',
    author: 'Auteur', name: 'Nom', nom: 'Nom', short: 'Nom court / sous-titre', where: 'Lieu', year: 'Année', hook: 'Accroche', desc: 'Description', moment: 'Moment d’histoire', price: 'Prix (€)', type: 'Type',
    line: 'Collection (clé)', ligne: 'Collection (clé)', gallery: 'Galerie de photos', colors: 'Couleurs', sizes: 'Tailles', flag: 'Pastille', isNew: 'Nouveauté', url: 'Adresse de la vidéo', dur: 'Durée',
    salle: 'Salle (1 tableau, 2 lieux, 3 photo, 4 textile)', technique: 'Technique', text: 'Texte', texte: 'Texte', surtitre: 'Surtitre', accroche: 'Accroche', avantages: 'Avantages', note: 'Note', collections: 'Collections',
    numero: 'Numéro', mention: 'Mention', legende: 'Légende', sec: 'Cahier', kind: 'Modèle de page', rubric: 'Rubrique', script: 'Sous-titre', kicker: 'Chapeau', paras: 'Paragraphes', t: 'Paragraphe',
    imgCap: 'Légende de l’image', quote: 'Citation', quoteBy: 'Auteur de la citation', modeParDefaut: 'Fond par défaut (aucun, photo, lieux)', pages: 'Pages', paragraphes: 'Paragraphes', paragraphesEn: 'Paragraphes (anglais)',
    citation: 'Citation', citationEn: 'Citation (anglais)', dates: 'Frise des dates', annee: 'Année', sections: 'Sections', src: 'Source', why: 'Pourquoi ça compte', big: 'Chiffre', l: 'Unité'
  };
  var LONG = /^(body|bodyEn|desc|texte|text|dek|dekEn|hook|moment|t|kicker|accroche|motif|message|why|citation|citationEn|note)$/;

  // ---------- état ----------
  var S = { open: false, tab: 'msg', setup: null, msgs: [], mf: 'tous', q: '', sel: null, compose: null, contacts: [], team: [], reqs: [], key: null, work: null, dirty: false, openCards: {}, images: [], busy: false, loaded: {} };
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
    '.cba-tag{display:inline-block;font-size:11px;font-weight:800;text-transform:uppercase;padding:.1rem .4rem;background:var(--gold-text,#b8860b);color:#fff;margin-left:.3rem}' +
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
    '.cba-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:.7rem}' +
    '.cba-grid figure{margin:0;border:1.5px solid var(--line,#ddd);background:var(--surface,#fff)}' +
    '.cba-grid img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--surface-2,#eee)}' +
    '.cba-grid figcaption{padding:.4rem;font-size:12px;overflow-wrap:anywhere}' +
    '.cba-bar{position:sticky;top:-1.2rem;z-index:2;background:var(--bg,#fff);padding:.7rem 0;border-bottom:1.5px solid var(--line,#ddd);margin-bottom:1rem}' +
    '.cba-toast{position:fixed;left:50%;bottom:1.2rem;transform:translate(-50%,150%);visibility:hidden;font-family:var(--font-body,system-ui,sans-serif);background:var(--ink,#111);color:var(--bg,#fff);padding:.7rem 1rem;font-weight:700;transition:transform .25s;z-index:2147483001;max-width:92vw}' +
    '.cba-toast.on{transform:translate(-50%,0);visibility:visible}.cba-toast.bad{background:var(--danger,#c22);color:#fff}' +
    '.cba-modal{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:1rem}' +
    '.cba-modal>div{background:var(--bg,#fff);max-width:900px;width:100%;max-height:85vh;overflow:auto;padding:1rem}' +
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
    if (S.dirty && !confirm('Des modifications ne sont pas enregistrées. Quitter quand même ?')) { if (fromPop) { try { history.pushState(null, '', '#/admin'); } catch (e) {} } return; }
    S.open = false; S.dirty = false; clearInterval(timer);
    if (root) root.remove(); if (toastEl) toastEl.remove(); root = null;
    document.documentElement.style.overflow = '';
    if (!fromPop) { if (pushed) { pushed = false; try { history.back(); } catch (e) {} } else { try { history.replaceState(null, '', '#/'); } catch (e) {} } }
    pushed = false;
    if (window.CasaSite) { try { window.CasaSite.syncRoute(window.CasaSite.state, true); } catch (e) {} }
  }
  window.addEventListener('popstate', function () { if (S.open && location.hash !== '#/admin') close(true); });
  window.addEventListener('keydown', function (e) { if (S.open && e.key === 'Escape' && !document.querySelector('.cba-modal')) close(); });
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
    else if (t === 'img') loadImages();
    render();
  }
  function setTab(t) {
    if (S.dirty && S.tab === 'content' && t !== 'content' && !confirm('Des modifications ne sont pas enregistrées. Changer d’onglet quand même ?')) return;
    if (t !== 'content') { S.dirty = false; S.key = null; S.work = null; }
    S.tab = t; loadTab(t);
  }

  // ---------- rendu général ----------
  function unread() { return S.msgs.filter(function (m) { return m.sens !== 'envoye' && !m.lu; }).length; }
  function pendingReqs() { return S.reqs.filter(function (r) { return r.statut === 'en_attente'; }).length; }
  function render() {
    if (!root) return;
    var y = body ? body.scrollTop : 0;
    root.textContent = '';
    var tabs = [['msg', 'Messagerie', unread()], ['content', 'Contenus du site', 0], ['img', 'Images', 0], ['team', 'Équipe et accès', pendingReqs()], ['help', 'Aide', 0]];
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
    add(w, ({ msg: viewMsg, content: viewContent, img: viewImages, team: viewTeam, help: viewHelp })[S.tab]());
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
      }, function () {
        S.busy = false; C.fallback = true; render();
      });
    };
    var mailto = 'mailto:' + encodeURIComponent(C.to.trim()) + '?subject=' + encodeURIComponent(C.subject) + '&body=' + encodeURIComponent(C.text);
    return E('div', { class: 'cba-card' },
      E('strong', { style: 'font-size:1.15rem' }, C.replyTo ? 'Répondre' : 'Nouveau message'),
      E('label', { class: 'cba-lbl' }, 'À'), E('input', { class: 'cba-in', type: 'email', value: C.to, oninput: function (e) { C.to = e.target.value; }, list: 'cba-contacts' }),
      E('datalist', { id: 'cba-contacts' }, S.contacts.map(function (c) { return E('option', { value: c.email }, c.nom || ''); })),
      E('label', { class: 'cba-lbl' }, 'Objet'), E('input', { class: 'cba-in', value: C.subject, oninput: function (e) { C.subject = e.target.value; } }),
      E('label', { class: 'cba-lbl' }, 'Message'), E('textarea', { class: 'cba-in', style: 'min-height:220px', value: C.text, oninput: function (e) { C.text = e.target.value; } }),
      C.fallback ? E('div', { class: 'cba-note', style: 'margin-top:.8rem' }, 'L’envoi direct depuis le site n’est pas encore activé (voir Aide). Envoyez-le depuis votre messagerie habituelle : ',
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
      E('p', { class: 'cba-sub' }, 'Choisissez une section, modifiez-la puis « Enregistrer et publier » : la modification est visible immédiatement par tous les visiteurs.'),
      E('div', { class: 'cba-secs' }, SECTIONS.map(function (sec) {
        var v = window[sec.key]; var n = Array.isArray(v) ? v.length + ' élément' + (v.length > 1 ? 's' : '') : '';
        return E('div', { class: 'cba-card', style: 'margin:0;display:flex;flex-direction:column;gap:.4rem' },
          E('strong', { style: 'font-size:1.05rem' }, sec.label, edited.indexOf(sec.key) >= 0 ? E('span', { class: 'cba-tag' }, 'modifié en ligne') : null),
          E('span', { style: 'color:var(--text-2);font-size:14px;flex:1' }, sec.desc), n ? E('span', { style: 'color:var(--muted);font-size:13px' }, n) : null,
          E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.key = sec.key; S.work = withFields(sec.key, clone(window[sec.key])); S.dirty = false; S.openCards = {}; render(); body.scrollTop = 0; } }, 'Modifier'));
      }))];
  }
  // Affiche aussi les champs prévus par le modèle (ex. « Photo » des lieux) même s'ils sont encore vides
  function withFields(k, v) {
    var T = TEMPLATES[k]; if (!T || !Array.isArray(v)) return v;
    return v.map(function (x) { if (!x || typeof x !== 'object' || Array.isArray(x)) return x; var o = Object.assign({}, x); Object.keys(T).forEach(function (f) { if (!(f in o)) o[f] = clone(T[f]); }); return o; });
  }
  function secOf(k) { return SECTIONS.find(function (s) { return s.key === k; }) || { label: k }; }
  function mark() { if (!S.dirty) { S.dirty = true; var b = root && root.querySelector('.cba-save'); if (b) b.disabled = false; } }
  function save() {
    var k = S.key, v = S.work;
    if (Array.isArray(v)) {
      var ids = {}, dup = null, miss = false;
      v.forEach(function (x) { if (x && typeof x === 'object' && !Array.isArray(x) && 'id' in x) { if (!x.id) { var base = x.title || x.name || x.titre || ''; x.id = slug(base) + (k === 'CASA_ARTICLES' ? '-' + new Date().toISOString().slice(0, 10) : ''); if (!base) miss = true; } if (ids[x.id]) dup = x.id; ids[x.id] = 1; } });
      if (miss) { toast('Un élément n’a ni titre ni identifiant', true); render(); return; }
      if (dup) { toast('Identifiant en double : ' + dup, true); render(); return; }
    }
    S.busy = true; render();
    A.saveContent(k, v).then(function () { S.busy = false; S.dirty = false; S.work = withFields(k, clone(window[k])); render(); toast('Publié : visible par tous les visiteurs'); }, function (e) { S.busy = false; render(); err(e); });
  }
  function viewEditor() {
    var sec = secOf(S.key), edited = (A.editedKeys ? A.editedKeys() : []).indexOf(S.key) >= 0;
    var ed = E('div', { class: 'cba-ed' });
    var v = S.work;
    if (Array.isArray(v) || (v && typeof v === 'object')) add(ed, field({ v: v }, 'v', S.key, S.key, true));
    else add(ed, field(S, 'work', S.key, S.key, true));
    return [E('div', { class: 'cba-bar' },
      E('div', { class: 'cba-row' },
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { if (S.dirty && !confirm('Abandonner les modifications non enregistrées ?')) return; S.key = null; S.work = null; S.dirty = false; render(); } }, '← Sections'),
        E('strong', { style: 'font-size:1.2rem;margin-right:auto' }, sec.label),
        E('button', { type: 'button', class: 'cba-btn pri cba-save', disabled: (!S.dirty || S.busy) || null, onclick: save }, S.busy ? 'Publication…' : 'Enregistrer et publier'),
        E('button', { type: 'button', class: 'cba-btn', onclick: function () { S.work = withFields(S.key, clone(window[S.key])); S.dirty = false; render(); } }, 'Annuler les modifications'),
        edited ? E('button', { type: 'button', class: 'cba-btn dan', onclick: function () {
          if (!confirm('Revenir à la version du fichier (contenus/ du dépôt) pour « ' + sec.label + ' » ? Les modifications faites ici seront effacées.')) return;
          A.resetContent(S.key).then(function () { S.work = withFields(S.key, clone(window[S.key])); S.dirty = false; render(); toast('Version d’origine rétablie'); }, err);
        } }, 'Version d’origine') : null)),
      E('p', { class: 'cba-sub' }, sec.desc),
      ed];
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
    if (isImg(k, str)) return [lab, imgField(parent, k)];
    var long = LONG.test(String(k)) || str.length > 70 || str.indexOf('\n') >= 0;
    var inp = long ? E('textarea', { class: 'cba-in', value: str, rows: String(Math.min(18, Math.max(3, Math.ceil(str.length / 90) + (str.match(/\n/g) || []).length))) }) : E('input', { class: 'cba-in', value: str });
    inp.addEventListener('input', function (e) { parent[k] = (v === null && e.target.value === '') ? null : e.target.value; mark(); });
    return [lab, inp];
  }
  function imgField(parent, k) {
    var prev = E('img', { alt: '', src: parent[k] || null });
    var inp = E('input', { class: 'cba-in', value: parent[k] || '', placeholder: 'assets/… ou adresse d’une image envoyée', oninput: function (e) { parent[k] = e.target.value; prev.src = e.target.value; mark(); } });
    var set = function (url) { parent[k] = url; inp.value = url; prev.src = url; mark(); };
    var file = E('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; upBtn.disabled = true; upBtn.textContent = 'Envoi…'; uploadFile(f).then(function (u) { set(u); upBtn.disabled = false; upBtn.textContent = 'Envoyer une photo'; toast('Photo envoyée : pensez à « Enregistrer et publier »'); }, function (er) { upBtn.disabled = false; upBtn.textContent = 'Envoyer une photo'; err(er); }); } });
    var upBtn = E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { file.click(); } }, 'Envoyer une photo');
    return E('div', { class: 'cba-img' }, prev, E('div', { class: 'grow' }, inp,
      E('div', { class: 'cba-row', style: 'margin-top:.35rem' }, upBtn, file,
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
    var prims = arr.length ? arr.every(function (x) { return x == null || typeof x !== 'object'; }) : (!root0 && /^(points|paragraphes|paragraphesEn|avantages|gallery|colors|sizes|clubs)$/.test(String(k)));
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
  function loadImages() {
    if (!A.listImages) return Promise.resolve();
    return A.listImages('images').then(function (d) { S.images = d; S.loaded.img = true; render(); }, function (e) { S.loaded.img = true; render(); if (S.setup === 'ok') err(e); });
  }
  function copy(t) { try { navigator.clipboard.writeText(t).then(function () { toast('Adresse copiée'); }, function () { prompt('Adresse de l’image :', t); }); } catch (e) { prompt('Adresse de l’image :', t); } }
  function imageGrid(onPick) {
    if (!S.loaded.img) { loadImages(); return E('p', {}, 'Chargement…'); }
    if (!S.images.length) return E('p', { style: 'color:var(--muted)' }, 'Aucune image envoyée pour l’instant.');
    return E('div', { class: 'cba-grid' }, S.images.map(function (im) {
      return E('figure', {}, E('img', { src: im.url, alt: im.name, loading: 'lazy' }), E('figcaption', {}, im.name, E('div', { class: 'cba-row', style: 'margin-top:.35rem' },
        onPick ? E('button', { type: 'button', class: 'cba-btn sm pri', onclick: function () { onPick(im.url); } }, 'Choisir') :
          [E('button', { type: 'button', class: 'cba-btn sm', onclick: function () { copy(im.url); } }, 'Copier l’adresse'),
           E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Supprimer cette image ? Si elle est utilisée sur le site, elle n’y apparaîtra plus.')) return; A.removeImage(im.path).then(function () { S.images = S.images.filter(function (x) { return x.path !== im.path; }); render(); toast('Image supprimée'); }, err); } }, 'Supprimer')])));
    }));
  }
  function upZone() {
    var file = E('input', { type: 'file', accept: 'image/*', multiple: true, style: 'display:none', onchange: function (e) { sendFiles(e.target.files); } });
    var z = E('div', { class: 'cba-card', style: 'border-style:dashed;text-align:center;padding:1.5rem' },
      E('p', { style: 'margin:0 0 .6rem' }, 'Glissez vos photos ici, ou'), E('button', { type: 'button', class: 'cba-btn pri', onclick: function () { file.click(); } }, 'Choisir des photos'), file,
      E('p', { style: 'margin:.6rem 0 0;font-size:13px;color:var(--muted)' }, 'Les photos sont réduites automatiquement (1600 px, JPEG) avant l’envoi.'));
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
    list.forEach(function (f) { chain = chain.then(function () { return uploadFile(f).then(function () { ok++; }, err); }); });
    chain.then(function () { if (ok) toast(ok + ' photo' + (ok > 1 ? 's envoyées' : ' envoyée')); loadImages(); });
  }
  function viewImages() {
    return [E('h1', { class: 'cba-h' }, 'Images'), E('p', { class: 'cba-sub' }, 'Vos photos en ligne. Dans « Contenus du site », chaque champ image propose aussi « Envoyer une photo » et « Bibliothèque ».'), upZone(), imageGrid(null)];
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
          return E('tr', {}, E('td', {}, E('strong', {}, m.nom || m.email), E('div', { style: 'color:var(--muted)' }, m.email)), E('td', {}, m.role === 'admin' ? 'Administrateur' : 'Rédacteur'),
            E('td', { style: 'text-align:right' }, m.role === 'admin' ? null : E('button', { type: 'button', class: 'cba-btn sm dan', onclick: function () { if (!confirm('Retirer l’accès à la rédaction de ' + m.email + ' ?')) return; db(function (c) { return c.from('equipe').delete().eq('email', m.email); }).then(function () { toast('Accès retiré'); loadTeam(); }, err); } }, 'Retirer l’accès')));
        })))),
      done.length ? [E('h2', { style: 'margin:1.6rem 0 .5rem' }, 'Demandes traitées'), E('table', { class: 'cba-tbl' }, E('tbody', {}, done.slice(0, 50).map(function (r) {
        return E('tr', {}, E('td', {}, r.nom || r.email, E('div', { style: 'color:var(--muted)' }, r.email)), E('td', {}, r.statut === 'acceptee' ? 'Acceptée' : 'Refusée'), E('td', {}, fmtDate(r.traite_le || r.cree_le)));
      })))] : null];
  }

  // ================= AIDE =================
  function viewHelp() {
    var P = function (t) { return E('p', { style: 'line-height:1.6' }, t); };
    return [E('h1', { class: 'cba-h' }, 'Aide'),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Modifier le site'),
        P('Contenus du site › choisissez la section › modifiez › « Enregistrer et publier ». La modification est en ligne tout de suite, pour tous les visiteurs. « Version d’origine » efface vos changements et rétablit le fichier du dépôt GitHub.'),
        P('Les articles déposés par la Rédaction quotidienne continuent d’apparaître en plus de ceux que vous modifiez ici.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Images'),
        P('Envoyez une photo depuis n’importe quel champ image, ou depuis l’onglet Images. Elle est réduite automatiquement puis stockée en ligne ; son adresse est remplie à votre place.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Messagerie'),
        P('Toutes les demandes du site arrivent ici. Pour répondre directement depuis le site et recevoir les e-mails des adresses suivies, deux réglages sont à faire une fois (Brevo et l’adresse de réception) : suivez docs/ESPACE-ADMIN.md. En attendant, « Répondre » ouvre votre messagerie habituelle.')),
      E('div', { class: 'cba-card' }, E('strong', {}, 'Accès à la rédaction'),
        P('Seules les personnes listées dans Équipe et accès voient l’espace rédaction. Un abonné peut vous envoyer une demande depuis Mon espace ; vous l’acceptez ou la refusez en un clic.'))];
  }

  window.CasaAdmin = { open: open, close: close, wantOpen: wantOpen, isOpen: function () { return S.open; } };
})();
