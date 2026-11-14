
/*!
 * Casa Besports — logique de l’application (état, données, navigation, boutique,
 * Terrain, Gazette, espace rédaction, assistant Casa IA).
 * La classe Component est montée par js/dc-runtime.js ; renderVals() fournit les valeurs du gabarit.
 */
const BLOB_FILES = {"0855c8136dcdda770cb476333ba7ad46": "hero.jpg", "5cd343902a0b6d6a654108dee90d6fc3": "img_51314cdd.jpg", "66c390103494d9a28a5f34e10524881c": "img_fe51d409.jpg", "2b8b1c873d91f86dbbe51fe32be05f69": "img_2fb41bb1.jpg", "d75f806f46d28a0e206a30c27b8e58ad": "img_4994dc60.jpg", "904540d957c239c0ab657cce252abfb1": "img_11c2b62b.jpg", "38c25d93ed37833c9d08d0a1d75de3f1": "img_d9e43f35.jpg", "8d45daef1b083349dec7666774fc55ff": "img_b0f4c33c.jpg", "c6e9c6ecc949a47ccf67d70d758f0fe5": "img_4606c0a1.jpg", "2010d82cc508d4cb5ef99cb551c26649": "img_a1612881.jpg", "e6132a6993a0d040085ac66b6f46cf6e": "a_photographe.jpg", "183faa9bf4b22beda6d2cb41e6b91225": "a_benevoles.jpg", "33cc6fbd406b8554971d61a0887d4a76": "a_buteurs.jpg", "824fb1ca8687d16522c2ba8f05d66086": "a_fceh.jpg", "4f81a4491eb301c8894c5d5d2ab04ff6": "a_bluesquad.jpg", "f2d41cc7df08eba8f5272bd4fddfac50": "a_feminines.jpg", "020b8966d676cf17abcd5d5bc3a0367d": "v_digosville.jpg", "5841e4625d308992d931ba37f1195ce3": "v_arbitre.jpg", "c83c4c88d71f1d3daf3a3aab27ebcfcf": "p_rouleau.jpg", "100430acc5d688e72f589b6ca475b01d": "p_letan.jpg", "eea5f2cb98593d0a8baa19b10e57a843": "p_piedagnel.jpg", "fe4b5960100016bbbb4080d69cfbb67d": "p_mariette.jpg", "b94216cd40407eb3e572ce66447bac81": "p_cgosselin.jpg", "a2337077993c11e33ea45478e8c0355d": "p_edubois.jpg", "47cc1f566d64d7869adcd6c21cdf47bf": "lieu_gare.svg", "f46b43bf0cb05c3fde4cba8ae7d9c8d5": "lieu_gatteville.svg", "68220997b900b01cc4ef65a2529b0ff1": "lieu_jobourg.svg", "56c5699f8f042372def6ef4a6c5ca373": "lieu_mont.svg", "37f0accd200070c08850e6289a7929b2": "lieu_rade.svg", "66637b2212fc497ace187dc8cf592255": "lieu_sme.svg", "0de7edf37ab180831b6bc0716d103174": "vt_bob.svg", "fd1211c3ff3542889b121013ad1870ef": "vt_casquette.svg", "f42d1f454d139e25a1ac0ee024729688": "vt_crew_vestiaire.svg", "d9a1db651fe41d5fd589c366bef1324f": "vt_hoodie_csc.svg", "deb3fbf78d39b9e4c4113f074d7c9aca": "vt_hoodie_signature.svg", "5b6c3a1ff464e0f2d225ba053daaad40": "vt_jogger.svg", "9b36fe1ef00b3ec975a9172298a6454c": "vt_maillot_retro.svg", "c9a63220440c307d4cb0d4ede91458db": "vt_pull_marin.svg", "5b1edd96ba3ffdebc3e7aa064e7b33aa": "vt_short_isles.svg", "97e778b2f0df4c4eb062d01e0da991b4": "vt_tee_identitaire.svg", "32a264a8dac6d54d7c4f1f0be13729ef": "vt_tee_phare.svg", "826b023bd7ad50930b096cfa62539fbe": "vt_tee_rade.svg", "e4e307f2a97987e98f438ae8fb818be7": "vt_tote.svg", "e2b6c5370ceaeee61a7cce40f0298965": "vt_track_jacket.svg", "abec48f4e69f287e10674c11a8468bec": "livre_impact.svg", "91855c40cd47f028874202e72a33d389": "gz_cover.jpg", "bae1d2ac6cb6529aa1e99e023df405ff": "gz_scarf.jpg", "25fc361529644e7b5978722ef83683b6": "gz_benevole.jpg", "981e82bbbb0f7a9367c97e4c848c2fc6": "ph_hoodie_roule.jpg", "b248d9f3a2edcd1758c3805be91a57a2": "ph_crew_presquile.jpg", "3da9816218acfc421e4732cb9d2f5b52": "ph_hoodie_signature.jpg", "c00d8ac59262a5549ee606cc8fb2de8c": "ph_crew_vestiaire.jpg", "b75f47de93c1cb54bec627f5067d8110": "ph_hoodie_csc.jpg", "2c48f7132b968b70be1c7d701dc4a9d6": "ph_tee_identitaire.jpg", "7ee74118a425ec7af743cd47cb36fdc4": "ph_pull_marin.jpg", "a81051d440f01667a54fa15c341bc54f": "ph_tote.jpg", "f06f2d89c41fd9b8126e1c5385bb9dcc": "ph_tee_phare.jpg", "ca6ba71144c430d01edfdbf1e2a9af0c": "ph_tee_rade.jpg", "a48eb676f77a86afa6b51ee515273bef": "ph_maillot_retro.jpg", "131e295ddb6c101579cef305062b367b": "ph_track_jacket.jpg", "16e026e698fae2bef37b1f79d0419272": "ph_jogger.jpg", "5cf5a581ded4f4eb23159f4cd0e9c5c6": "ph_short_isles.jpg", "ca573d60402844d34a66033b90eefbf5": "ph_bob.jpg", "92b8ad3992858d32669bcfea753c86ca": "ph_casquette.jpg", "c28fddabc16efa8e58e4c93afee5990d": "dt_hoodie_roule.jpg", "1a81347b7337a4d848621af0fb067688": "dt_crew_presquile.jpg", "a7f3ab74b38b934ee0063eba2975cdd6": "dt_hoodie_signature.jpg", "c385b1324c6ffa4e23d8af37ea839381": "gz_foule.jpg", "56cc472c6c2fbb4d9666f881a2e56edf": "gz_duel.jpg", "9807b5c5369f06c7aaf95b75312f046d": "ph_kit_runes.jpg", "0db18dd911c14da925f4e895f71e4e1c": "ph_kit_runes_dos.jpg", "e615fde32424915e839a12659097f676": "dt_kit_runes.jpg", "f1953e481ef07e95680164a46c2d9f41": "ph_kit_runes_ml.jpg", "7622c7f11f14ef0c49d572d2decbbae5": "ph_short_runes.jpg", "4406cb951b6112ead68dac1d86a30e53": "ph_kit_ancre.jpg", "65c33e4e715ef5dd1201de7343556d4b": "ph_short_ancre.jpg", "89cc02d697fec04f522599802bf187d8": "ph_kit_ciel.jpg", "b04e3dcc6da7234630c60ea939f854eb": "ph_kit_nuit.jpg", "aea7ea50082d523bc83f3f6017ba816f": "ph_kit_diagonale.jpg", "6f95460a58f5dc0c53a254df010b7963": "ph_tee_viking.jpg", "aa0d7bea1efc166a337ab714b04b33e1": "ph_cap_viking.jpg", "c4379d1401d63672573652d5be3b7e4e": "ph_patch_cb.jpg", "a1ac42a493284740e4e43b170065bafb": "ia_viking.jpg", "3ffb17091f7c840777e15fe18bb3fbac": "ia_logo.jpg", "1dd9d448ba429149f6f1cde6ac32d694": "logo-casabesports.svg"};

// ---------- numéro de membre : permanent, unique, avec lettre de contrôle ----------
const CB_B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function cbMemberNo(uid) {
  const hex = String(uid || '').replace(/[^0-9a-f]/gi, '').slice(0, 10).padEnd(10, '0');
  let n = parseInt(hex, 16), body = '';
  for (let i = 0; i < 8; i++) { body = CB_B32[n % 32] + body; n = Math.floor(n / 32); }
  let sum = 0; for (let i = 0; i < 8; i++) sum += (i + 1) * CB_B32.indexOf(body[i]);
  return 'CB-' + body.slice(0, 4) + '-' + body.slice(4) + '-' + CB_B32[sum % 32];
}
function cbMemberCheck(raw) {
  const m = String(raw || '').toUpperCase().replace(/[\s.]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1').match(/^CB-?([0-9A-Z]{4})-?([0-9A-Z]{4})-?([0-9A-Z])$/);
  if (!m) return '';
  const body = m[1] + m[2]; let sum = 0;
  for (let i = 0; i < 8; i++) { const v = CB_B32.indexOf(body[i]); if (v < 0) return ''; sum += (i + 1) * v; }
  return CB_B32[sum % 32] === m[3] ? 'CB-' + m[1] + '-' + m[2] + '-' + m[3] : '';
}
function cbQr(text) {
  if (!window.qrcode || !text) return null;
  try {
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    return { d, vb: '-2 -2 ' + (n + 4) + ' ' + (n + 4) };
  } catch (e) { return null; }
}
function cbSiteUrl() { return String(window.CASA_SITE_URL || (/^https?:/.test(location.protocol) ? location.origin + location.pathname : 'https://casabesports.fr/')).replace(/index\.html$/, ''); }

// ---------- adresses partageables : #/page ou #/page/identifiant ----------
const CB_ROUTE_ID = { article: 'articleId', video: 'videoId', discipline: 'discId', club: 'clubId', player: 'playerId', product: 'productId' };
// Nom d'équipe lisible : « AS ISIGNY LE BUAT 1 » → « AS Isigny le Buat 1 » (sigles gardés en capitales)
const CB_SIGLES = /^(AS|US|CS|JS|FC|SC|HB|HBC|BC|RC|CL|AL|ES|SM|ASPTT|ENT|USM|AJ|AC|OC|UL|ASC|CA|SU|AAJ|CHB|UST|VB|EC|SA|OM|PL|AG|ASL|USO|ESM|UC|SCO)$/;
function cbNomEquipe(n) {
  const s = String(n || '').trim();
  if (!s || s !== s.toUpperCase()) return s;
  let debut = true; // début de nom (après un sigle, « La Haye » garde sa majuscule)
  return s.toLowerCase().replace(/[a-zà-ÿ0-9]+/g, (w) => {
    const up = w.toUpperCase(), d = debut; debut = false;
    if (up === 'ENT') return 'Ent.';
    if (/\d/.test(w) || CB_SIGLES.test(up)) { debut = true; return up; }
    if (!d && /^(le|la|les|de|du|des|en|et|sur|sous|aux|au)$/.test(w)) return w;
    if (w.length === 1) return up;
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
}
const CB_TITLES = { home: '', news: 'Actualités', live: 'Le Terrain', videos: 'Vidéos', disciplines: 'Disciplines', clubs: 'Clubs', players: 'Joueurs', map: 'Territoire', offers: 'Abonnements', shop: 'Boutique', culture: 'Culture', clubhouse: 'Club House', meteo: 'Météo', partners: 'Partenaires', olisto: 'OlistO', about: 'À propos', work: 'Travailler avec Casa Besports', contact: 'Contact', legal: 'Informations légales', account: 'Mon espace', private: 'Mon quotidien', verifier: 'Vérification', app: 'Application', cv: 'Mon CV' };
// Logos des boutiques de clubs (images hébergées chez les clubs) : si l'un ne charge pas, l'initiale du club reste affichée
if (typeof document !== 'undefined') document.addEventListener('error', (e) => { const t = e.target; if (t && t.classList && t.classList.contains('mc-img')) t.classList.add('mc-off'); }, true);
// Lien vers le site d'un partenaire, marqué « vient de Casa Besports » (paramètres utm_ lus par Google Analytics, Matomo, HubSpot…)
function cbPartnerLink(url, id, kind) {
  const u0 = String(url || '').trim(); if (!u0) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(u0) ? u0 : 'https://' + u0);
    u.searchParams.set('utm_source', 'casabesports'); u.searchParams.set('utm_medium', 'partenariat');
    u.searchParams.set('utm_campaign', 'partenaire-' + (id || 'casa')); if (kind) u.searchParams.set('utm_content', kind);
    u.searchParams.set('ref', 'casabesports');
    return u.toString();
  } catch (e) { return ''; }
}
function cbRouteOf(st) { const k = CB_ROUTE_ID[st.view]; return '#/' + st.view + (k && st[k] != null ? '/' + encodeURIComponent(st[k]) : ''); }
// Adresses lisibles (pour Google et le partage) : /actualites/mon-article, /clubs/fceh, /a-propos…
// Le site reste piloté par les adresses « #/… » ; ces adresses-là ouvrent simplement la bonne page.
const CB_PATHS = { news: 'actualites', article: 'actualites', videos: 'videos', video: 'videos', clubs: 'clubs', club: 'clubs', players: 'joueurs', player: 'joueurs', shop: 'boutique', product: 'boutique',
  disciplines: 'disciplines', discipline: 'disciplines', about: 'a-propos', contact: 'contact', partners: 'partenaires', offers: 'abonnements', live: 'le-terrain', clubhouse: 'club-house', culture: 'culture',
  map: 'territoire', meteo: 'meteo', legal: 'mentions-legales', work: 'pro' };
const CB_PATH_DETAIL = { actualites: 'article', videos: 'video', clubs: 'club', joueurs: 'player', boutique: 'product', disciplines: 'discipline' };
// Résumé express : les « points clés » saisis dans l'admin, sinon des phrases reprises telles quelles du texte
// (chapô, puis la première phrase de chaque partie). Rien n'est inventé.
function cbTexte(md) {
  return String(md || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`#>]/g, '').replace(/^\s*-\s+/gm, '').replace(/[ \t]+/g, ' ').trim();
}
function cbPhrase(t) { t = cbTexte(t); const ph = t.match(/[^.!?…]+[.!?…]+(?=\s|$)/g) || [t]; return (ph.find((x) => x.trim().length >= 45) || ph[0] || t).trim(); }
function cbResume(a) {
  const pts = (a.points || []).map((x) => String(x || '').trim()).filter(Boolean);
  if (pts.length) return pts;
  const out = [];
  if (a.dek) out.push(cbTexte(a.dek));
  const parts = String(a.body || '').split(/\n(?=##\s)/);
  parts.forEach((p) => {
    const paras = p.replace(/^##[^\n]*\n?/, '').split(/\n\s*\n/).map((x) => x.trim()).filter((x) => x && !/^!\[/.test(x) && !/^\s*-\s/.test(x));
    if (paras[0]) { const f = cbPhrase(paras[0]); if (f && out.indexOf(f) < 0) out.push(f); }
  });
  return out.slice(0, 5);
}
function cbPathOf(st) {
  const base = CB_PATHS[st.view]; if (!base) return '/';
  const k = CB_ROUTE_ID[st.view]; return '/' + base + (k && st[k] != null ? '/' + encodeURIComponent(st[k]) : '');
}
function cbSite() { try { const u = window.CASA_SITE_URL; return u && /^https?:/.test(u) ? u.replace(/\/$/, '') : location.origin; } catch (e) { return ''; } }
function cbUrlOf(st) { return cbSite() + cbPathOf(st); }
function cbParsePath(p) {
  const m = String(p || '').replace(/\/+$/, '').match(/^\/([a-z-]+)(?:\/([^/]+))?$/); if (!m) return null;
  if (m[2]) { const v = CB_PATH_DETAIL[m[1]]; if (!v) return null; return { view: v, [CB_ROUTE_ID[v]]: decodeURIComponent(m[2]) }; }
  const v = Object.keys(CB_PATHS).find((x) => CB_PATHS[x] === m[1] && !CB_ROUTE_ID[x]); return v ? { view: v } : null;
}
function cbParseRoute(h) {
  if (!h || h === '#' || h === '#/') { try { if (location.pathname && location.pathname !== '/' && location.pathname !== '/index.html') return cbParsePath(location.pathname); } catch (e) {} }
  const m = String(h || '').match(/^#\/([a-z]+)(?:\/(.+))?$/); if (!m) return null;
  const r = { view: m[1] }; const k = CB_ROUTE_ID[m[1]]; if (k && m[2]) r[k] = decodeURIComponent(m[2]);
  return r;
}

class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      view: 'home', hist: [], articleId: null, videoId: null, discId: null, clubId: null, playerId: null, productId: null,
      q: '', cat: 'Tous', premiumOnly: false, savedOnly: false, clubSport: 'Tous', plRole: 'Tous', clubTab: 'articles',
      city: 'Cherbourg', menuOpen: false, moreOpen: false, searchOpen: false, sq: '', pwShow: false, loginOpen: false, linkSent: false, loginMode: 'password', pw: '', pw2: '', loginId: '', pwOpen: false, pwDone: false, resetSent: false, hasPassword: false, phone: '', smsCode: '', codeSent: false, authBusy: false,
      loggedIn: false, subs: { casab: false, gazette: null }, name: '', email: '', address: '', subject: '', profile: '', message: '', contactSent: false,
      formError: '', step: 1, period: 'mois', subPlan: 'casab', isGift: false, saved: [], follows: [], followPlayers: [], remind: false,
      summary: false, listening: false, fontStep: 1, reaction: null, playing: false, goal: 'Visibilité',
      alerts: { matchs: true, articles: true, videos: false }, toast: '',
      dSport: 'Football', dComp: 'r2', dTab: 'live', calMonth: 9, calDay: 10, matchId: null, pronos: {}, reminders: [],
      shopLine: 'Tout', proTab: 'clubs', shopSort: 'pop', color: 0, size: null, qty: 1, persoName: '', persoNum: '', prodError: '', sizeGuide: false,
      cart: [], cartOpen: false, ship: 'home', giftWrap: false, orderDone: false, orderNo: '', orders: [], payBusy: false, subPending: false, paidSubs: false, orderPaid: false,
      offerTab: 'Tout', readerOpen: false, page: 0, nlEmail: '', nlDone: false, tick: 0,
      hdrY: '0', scrolled: false, placeOverride: null, placeOpen: false, placeIdx: 0, partnerId: null, claimed: [],
      aiOpen: false, aiInput: '', aiTyping: false, aiMsgs: [{ role: 'bot', text: 'Bonjour, je suis Casa IA. Posez-moi une question sur les scores, la boutique, la Gazette, les clubs ou l’histoire du Cotentin.', actions: [] }],
      readerFont: 1, quizAns: {}, gzVote: this.readLS('cb-gz-vote', null), theme: this.loadTheme(), homeLayout: this.readLS('cb-home-layout', 'dashboard'), mods: this.readLS('cb-accueil-v2', null), favSports: this.readLS('cb-fav-sports', []), favClubs: this.readLS('cb-fav-clubs', []), cfQ: '', bgCouleur: this.readLS('cb-bg-couleur', null), bgTeinte: this.readLS('cb-bg-teinte', null), customizeOpen: false, wxExtra: this.readLS('cb-wx-extra', []), wxCity: this.readLS('cb-wx-city', 'Cherbourg'), wxLive: {}, wxLoading: false, priv: null, privFor: null, pvTab: 'jour', pvList: 'courses', pf: {}, pvMember: 'all', chTab: 'fil', bgMode: this.readLS('cb-bg-mode', null), crmTab: 'home', crmSel: null, crmType: 'Tous', crmOwner: 'Tous', crmRev: 0, prodImg: 0, cardColor: this.readLS('cb-card-color', 'noir'), chRoom: 'Tous', chAdCat: 'Tout', chOpen: {}, chf: {}, chRev: 0, cuTab: 'expo', cuKind: 'Tous', workIdx: null, votes: this.readLS('cb-votes', {}), cuf: {}, cuSent: false, tmWork: 40, tmRest: 20, tmRounds: 8, tmRunning: false, tmPhase: 'ready', tmLeft: 40, tmRound: 1, sysDark: this.sysDark(), themeMenuOpen: false, themeAnim: false, legalDoc: 'mentions', role: null, accReq: null, accMotif: '', accBusy: false, studioTab: 'dash', posts: null, editId: 'p1', edMode: 'write', reviewNote: '', commentDraft: '', aiOutKind: null, stQ: '', stFilter: 'all', inviteEmail: '',
      rx: null, rxu: {}, rxServer: null, staffRole: 'redacteur',
      rsu: {}, cvu: {}, clubRoleId: 'esph', clubEditId: null, verifId: '',
      creaN: 0, creaOpen: false, creaMsg: '', creaTeam: null, creaSure: ''
    };
  }
  componentDidMount() {
    try { window.CasaSite = this; } catch (e) {} // accès console / tests : CasaSite.go('shop')
    try { this._onPwa = () => this.setState({ pwaTick: Date.now() }); window.addEventListener('casa-pwa', this._onPwa); } catch (e) {} // application installable (js/pwa.js)
    // Comptes abonnés (js/comptes.js) : la session Supabase pilote l'état connecté
    if (window.CasaAuth && window.CasaAuth.on) {
      window.CasaAuth.onChange((u) => {
        if (u) {
          const wasIn = this.state.loggedIn;
          const staff = ((window.CASA_EQUIPE) || []).find((m) => m.email && u.email && m.email.trim().toLowerCase() === u.email.trim().toLowerCase());
          this.setState({ loggedIn: true, loginOpen: false, linkSent: false, codeSent: false, smsCode: '', email: u.email || this.state.email, phone: u.phone || this.state.phone, name: u.name || (staff && staff.name) || this.state.name, role: staff ? (staff.role === 'admin' ? 'admin' : 'writer') : null });
          const firstFor = this._authFor !== u.id; this._authFor = u.id;
          if (firstFor && window.CasaAuth.myRole) (window.CasaAuth.myAccess ? window.CasaAuth.myAccess() : window.CasaAuth.myRole().then((x) => (x ? { role: x, club: null } : x))).then((a) => { const r = a ? a.role : a; this.setState({ srvRole: r || null }); if (r === undefined || !this.state.loggedIn) return; const fileRole = staff ? (staff.role === 'admin' ? 'admin' : 'writer') : null;
            // Étiquettes données dans l'admin (onglet Abonnés) : chef d'édition, rédacteur, correspondant de club
            const role = r === 'admin' ? 'admin' : (r === 'redacteur' || r === 'collaborateur') ? 'writer' : (r === 'correspondant' && a.club) ? 'club' : (fileRole === 'admin' ? 'admin' : null);
            const extra = role === 'writer' ? { staffRole: r } : role === 'club' ? { clubRoleId: a.club } : {};
            if (role !== this.state.role || Object.keys(extra).length) this.setState(Object.assign({ role }, extra)); }, () => this.setState({ srvRole: 'erreur' }));
          if (firstFor) this.loadPaid(this._waitPaid ? 5 : 0);
          if (firstFor) { if (u.prefs) this.applyPrefs(u.prefs); else if (this.state.mods || (this.state.favSports || []).length || (this.state.favClubs || []).length) this.syncPrefs(); }
          if (firstFor && window.CasaAuth.myAccessRequest) window.CasaAuth.myAccessRequest().then((d) => this.setState({ accReq: d || null }), () => {});
          if (!u.name && this.state.name.trim()) window.CasaAuth.updateName(this.state.name.trim()).catch(() => {});
          if (firstFor && window.CasaAuth.registerMember) window.CasaAuth.registerMember(cbMemberNo(u.id), String(u.name || this.state.name || '').trim().split(/\s+/)[0] || null).catch(() => {});
          this.applyProfileTheme((u.email || u.phone || u.id).toLowerCase());
          const needPw = !u.hasPassword || window.CasaAuth.recovery;
          this.setState({ hasPassword: !!u.hasPassword, pwOpen: needPw && !this.readLS('cb-pw-later-' + u.id, false) || window.CasaAuth.recovery, pw: '', pw2: '', pwDone: false });
          if (!wasIn) this.say('Connecté. Bienvenue !');
        } else if (this.state.loggedIn) { this._authFor = null; this.setState({ loggedIn: false, role: null, accReq: null, subs: { casab: false, gazette: null }, paidSubs: false, orders: this.state.orders.filter((o) => !o.srv) }); if (this.state.view === 'studio') this.go('home'); }
      });
    }
    this._crmIv = setInterval(() => { if (this.state.role === 'admin') { const A = this.crmData().agents; ['qualif', 'hygiene', 'relance', 'fidel', 'rapport'].forEach((k) => { if (A[k] && A[k].on) this.runAgent(k); }); } }, 20000);
    this._iv = setInterval(() => this.setState({ tick: this.state.tick + 1 }), 15000);
    try { const rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; if (window.CASA_APP && !rm && !window.sessionStorage.getItem('cb-intro')) { window.sessionStorage.setItem('cb-intro', '1'); this.setState({ introOn: true }); this._introT = setTimeout(() => this.setState({ introOn: false }), 3500); } } catch (e) {}
    this._lastY = 0;
    this._onScroll = () => {
      const y = window.scrollY || 0; const dy = y - this._lastY; this._lastY = y;
      if (y > 140 && dy > 6 && this.state.hdrY !== '-120%' && !this.state.menuOpen && !this.state.moreOpen) this.setState({ hdrY: '-120%' });
      else if ((dy < -6 || y < 140) && this.state.hdrY !== '0') this.setState({ hdrY: '0' });
      const sc = y > 700; if (sc !== this.state.scrolled) this.setState({ scrolled: sc });
    };
    try { window.addEventListener('scroll', this._onScroll, { passive: true }); } catch (e) {}
    this._onGzKey = (e) => {
      if (!this.state.readerOpen) return;
      const t = e.target; if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); this.gzGo(this.state.page + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.gzGo(this.state.page - 1); }
      else if (e.key === 'Escape') this.setState({ readerOpen: false });
    };
    try { window.addEventListener('keydown', this._onGzKey); } catch (e) {}
    try { this._mq = window.matchMedia('(prefers-color-scheme: dark)'); this._onMq = (e) => this.setState({ sysDark: e.matches }); if (this._mq.addEventListener) this._mq.addEventListener('change', this._onMq); else this._mq.addListener(this._onMq); } catch (e) {}
    try { document.documentElement.setAttribute('data-cb-theme', this.state.theme); } catch (e) {}
    try {
      const r0 = cbParseRoute(location.hash); if (r0 && r0.view !== 'home' && r0.view !== 'admin' && r0.view !== 'studio') setTimeout(() => this.go(r0.view, r0), 0);
      this._onPop = () => { const r = cbParseRoute(location.hash) || { view: 'home' }; if (r.view === 'admin') return; if (r.view === 'studio' && !this.state.role) r.view = 'home'; this.setState(Object.assign({ menuOpen: false, moreOpen: false, searchOpen: false }, r)); this.setTitle(Object.assign({}, this.state, r)); try { window.scrollTo(0, 0); } catch (e) {} };
      window.addEventListener('popstate', this._onPop);
    } catch (e) {}
    this.stripeReturn();
    try { const mq = new URLSearchParams(location.search).get('membre'); if (mq) setTimeout(() => { this.go('verifier', { mbQ: mq.slice(0, 20) }); this.checkMember(mq); }, 0); } catch (e) {}
    try { const vq = new URLSearchParams(location.search).get('verifier'); if (vq) setTimeout(() => this.go('verifier', { verifId: vq.slice(0, 20) }), 0); } catch (e) {}
    this.creaInit();
    this.fetchWeather(this.state.wxCity); this._wxIv = setInterval(() => { const c = this.state.wxCity; const w = (this.state.wxLive || {})[c]; if (w) { this.setState({ wxLive: Object.assign({}, this.state.wxLive, { [c]: Object.assign({}, w, { at: 0 }) }) }); } this.fetchWeather(c); }, 10 * 60 * 1000);
  }
  componentWillUnmount() { try { window.removeEventListener('casa-pwa', this._onPwa); } catch (e) {} clearInterval(this._crmIv); clearInterval(this._iv); clearInterval(this._wxIv); clearInterval(this._tmI); clearTimeout(this._t); clearTimeout(this._ai); try { window.removeEventListener('scroll', this._onScroll); } catch (e) {} try { if (this._mq) (this._mq.removeEventListener ? this._mq.removeEventListener('change', this._onMq) : this._mq.removeListener(this._onMq)); } catch (e) {} clearTimeout(this._th); }

  data() {
    if (this._d) return this._d;
    const A = (id, sport, tag, date, read, premium, img, alt, title, dek, clubs, points) => ({ id, sport, tag, date, read, premium, img, alt, title, dek, clubs, points });
    const articles = [];
    // Vidéos : contenus/videos.js
    const videos = ((typeof window !== 'undefined' && window.CASA_VIDEOS) || []).slice();
    const C = (id, name, sport, city, img) => ({ id, name, sport, city, img: img || null });
    // Clubs : contenus/clubs.js (modifiable dans l'espace administrateur)
    const clubs = ((typeof window !== 'undefined' && Array.isArray(window.CASA_CLUBS)) ? window.CASA_CLUBS : []).filter((c) => c && c.id && c.name).map((c) => Object.assign(C(c.id, c.name, c.sport || 'Football', c.city || '', c.img || null), { logo: c.logo || '', niveau: c.niveau || '', fondation: c.fondation || '', stade: c.stade || '' }));
    const P = (id, num, name, role, club, clubLabel, img) => ({ id, num, name, role, club, clubLabel, img: img || null });
    // Joueurs : contenus/joueurs.js (modifiable dans l'espace administrateur)
    const players = ((typeof window !== 'undefined' && Array.isArray(window.CASA_JOUEURS)) ? window.CASA_JOUEURS : []).filter((p) => p && p.id && p.name).map((p) => P(p.id, String(p.num == null ? '' : p.num), p.name, p.role || '', p.club || null, p.clubLabel || ((clubs.find((c) => c.id === p.club) || {}).name) || '', p.img || null));
    const cities = { 'Cherbourg': [49.639, -1.616], 'Tourlaville': [49.638, -1.565], 'Équeurdreville': [49.655, -1.68], 'Beaumont-Hague': [49.664, -1.84], 'Urville-Nacqueville': [49.674, -1.74], 'Gréville-Hague': [49.677, -1.80], 'Digosville': [49.632, -1.525], 'Tollevast': [49.575, -1.628], 'Bricquebec': [49.47, -1.633], 'Valognes': [49.509, -1.47], 'Barfleur': [49.671, -1.264], 'Barneville-Carteret': [49.383, -1.75], 'Carentan': [49.303, -1.248], 'Saint-Lô': [49.116, -1.09], 'Avranches': [48.684, -1.357], 'Bayeux': [49.276, -0.703], 'Flers': [48.75, -0.57], 'Mondeville': [49.175, -0.32] };
    const sports = ['Football', 'Basketball', 'Handball', 'Rugby', 'Water-polo', 'Trail', 'Natation', 'Pétanque', 'Roller', 'Équitation', 'Ping-pong', 'Kitesurf', 'Karting', 'Judo', 'Volley-ball', 'Tennis', 'Golf', 'Wing foil', 'Hockey', 'Boxe'];
    // Articles ajoutés par la rédaction ou l'automatisation : contenus/articles.js (les plus récents en premier)
    const extra = (typeof window !== 'undefined' && Array.isArray(window.CASA_ARTICLES) ? window.CASA_ARTICLES : [])
      // brouillon : jamais affiché ; publierLe (date ISO) : affiché à partir de cette date
      .filter((a) => a && a.id && a.title && (window.CASA_APERCU || (!a.brouillon && !(a.publierLe && new Date(a.publierLe) > new Date()))) && !articles.some((b) => b.id === a.id))
      .map((a) => Object.assign({ sport: 'Multisport', tag: '', date: '', read: '2 min', premium: false, img: 'assets/hero.jpg', alt: a.title, dek: '', clubs: [], points: [], author: 'la rédaction' }, a,
        // version anglaise de l'article si elle existe (titleEn, dekEn, bodyEn, tagEn)
        (window.CasaLang && window.CasaLang.lang === 'en') ? Object.assign({}, a.titleEn ? { title: a.titleEn } : {}, a.dekEn ? { dek: a.dekEn } : {}, a.bodyEn ? { body: a.bodyEn } : {}, a.tagEn ? { tag: a.tagEn } : {}) : {}));
    const allArts = extra.concat(articles);
    // Clubs supplémentaires : contenus/sport.js
    const SP = (typeof window !== 'undefined' && window.CASA_SPORT) || {};
    (SP.clubs || []).forEach((c) => { if (c && c.id && !clubs.some((x) => x.id === c.id)) clubs.push(C(c.id, c.name, c.sport || 'Football', c.city || '', c.img || null)); });
    // Clubs lus sur les sites des fédérations : contenus/sport-federations.js (ajoutés s'ils ne sont pas déjà dans la liste)
    const AUTO = (typeof window !== 'undefined' && window.CASA_SPORT_AUTO) || {};
    const normN = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    Object.keys(AUTO).forEach((sp) => ((AUTO[sp] || {}).clubs || []).forEach((c) => {
      if (!c || !c.id || clubs.some((x) => x.id === c.id || (x.sport === (c.sport || sp) && normN(x.name) === normN(c.name)))) return;
      clubs.push(Object.assign(C(c.id, c.name, c.sport || sp, c.city || '', c.img || null), { logo: c.logo || '', niveau: c.niveau || '', fondation: c.fondation || '', stade: c.stade || '', zone: c.zone || '' }));
    }));
    this._d = { articles: allArts, videos, clubs, players, cities, sports };
    return this._d;
  }


  more() {
    if (this._m) return this._m;
    const P = (o) => Object.assign({ colors: [{ name: 'Marine', hex: '#0f2236' }], sizes: null, perso: null, flag: '', mark: 'CASA', pop: 50, isNew: false, img: null }, o);
    const navy = { name: 'Marine', hex: '#0f2236' }, sand = { name: 'Sable', hex: '#d8c8a0' }, ecru = { name: 'Écru', hex: '#f2ece0' }, white = { name: 'Blanc', hex: '#fbfaf7' }, gold = { name: 'Or', hex: '#e8a830' }, pine = { name: 'Vert sapin', hex: '#1f3b33' }, natural = { name: 'Naturel', hex: '#e9dfc8' };
    const S = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const B = (id) => (window.ASSET_DATA[BLOB_FILES[id]] || ('assets/' + (BLOB_FILES[id] || id)));
    const KS = ['6 ans', '8 ans', '10 ans', '12 ans', 'S', 'M', 'L', 'XL', 'XXL'];
    // Produits de la boutique : contenus/boutique.js (la structure, les tailles et les couleurs restent ici)
    const colorOf = (c) => (typeof c === 'string' ? ({ marine: navy, sable: sand, ecru, 'écru': ecru, blanc: white, or: gold }[c.toLowerCase()] || { name: c, hex: '#0f2236' }) : c);
    const products = ((typeof window !== 'undefined' && window.CASA_PRODUITS) || []).filter((o) => o && o.id && o.name).map((o) => P(Object.assign({ sizes: S, price: 0, type: 'tee', short: '', desc: '' }, o, { colors: (o.colors && o.colors.length ? o.colors : ['marine']).map(colorOf) })));
    const paths = {
      tee: 'M38 22 L52 16 Q60 24 68 16 L82 22 L98 38 L86 50 L80 45 L80 104 L40 104 L40 45 L34 50 L22 38 Z',
      hoodie: 'M40 24 Q60 4 80 24 L98 40 L90 60 L82 54 L82 106 L38 106 L38 54 L30 60 L22 40 Z',
      pull: 'M40 22 L52 16 Q60 24 68 16 L80 22 L100 72 L90 76 L80 50 L80 106 L40 106 L40 50 L30 76 L20 72 Z',
      cap: 'M24 74 Q24 38 60 36 Q96 38 96 74 Z M60 76 L108 76 Q108 86 92 86 L60 86 Z',
      bob: 'M30 66 Q32 36 60 36 Q88 36 90 66 Z M16 68 L104 68 Q104 82 60 82 Q16 82 16 68 Z',
      scarf: 'M14 50 L106 50 L106 70 L14 70 Z M24 70 L34 70 L34 98 L24 98 Z M86 70 L96 70 L96 98 L86 98 Z',
      tote: 'M30 46 L90 46 L96 108 L24 108 Z M44 46 Q44 18 60 18 Q76 18 76 46 L70 46 Q70 25 60 25 Q50 25 50 46 Z',
      mug: 'M28 32 L80 32 L80 100 Q80 106 74 106 L34 106 Q28 106 28 100 Z M80 46 Q102 46 102 64 Q102 82 80 82 L80 74 Q94 74 94 64 Q94 54 80 54 Z',
      bottle: 'M50 12 L70 12 L70 24 Q84 32 84 48 L84 104 Q84 110 78 110 L42 110 Q36 110 36 104 L36 48 Q36 32 50 24 Z',
      stickers: 'M20 26 L70 26 L70 76 L20 76 Z M46 46 L100 46 L100 100 L62 100 L46 84 Z',
      keys: 'M44 18 A24 24 0 1 1 43.9 18 Z M44 30 A12 12 0 1 0 44.1 30 Z M38 64 L50 64 L50 110 L38 110 Z',
      gift: 'M20 46 L100 46 L100 64 L20 64 Z M26 64 L94 64 L94 106 L26 106 Z M54 46 L66 46 L66 106 L54 106 Z',
      poster: '',
      crew: 'M40 24 Q60 4 80 24 L98 40 L90 60 L82 54 L82 106 L38 106 L38 54 L30 60 L22 40 Z',
      jogger: 'M40 14 L80 14 L84 106 L64 106 L60 50 L56 106 L36 106 Z',
      short: 'M36 34 L84 34 L90 86 L66 88 L60 60 L54 88 L30 86 Z'
    };
    const markPos = { tee: [62, 9], hoodie: [70, 9], pull: [70, 8], cap: [60, 9], bob: [56, 8], scarf: [64, 8], tote: [84, 9], mug: [72, 10], bottle: [74, 9], stickers: [56, 9], keys: [0, 1], gift: [0, 1], poster: [0, 1] };

    // Matchs
    const M = (id, sport, comp, date, time, home, away, hs, as, status, o) => Object.assign({ id, sport, comp, date, time, home, away, hs, as, status, verified: false, venue: '', minute: 0, article: null }, o || {});
    // Matchs et résultats : contenus/sport.js (onglet Résultats de l'espace administrateur)
    const matches = [];
    // Compétitions affichées dans Le Terrain : toutes dans contenus/sport.js (modifiables ou supprimables dans Espace admin › Résultats)
    const comps = {};
    const T = (team, j, g, n, p, diff, pts, form) => ({ team, j, g, n, p, diff, pts, form });
    // Classements et calendriers à jour : contenus/sport.js (mis à jour automatiquement)
    const SP = (typeof window !== 'undefined' && window.CASA_SPORT) || {};
    const tables = {};
    Object.keys(SP.tables || {}).forEach((k) => { tables[k] = (SP.tables[k] || []).map((r) => T(r.team, r.j || 0, r.g || 0, r.n || 0, r.p || 0, r.diff == null ? '' : String(r.diff), r.pts || 0, r.form || '')); });
    (SP.matches || []).forEach((m) => { if (m && m.id && !matches.some((x) => x.id === m.id)) matches.push(M(m.id, m.sport, m.comp, m.date || null, m.time || '', m.home, m.away, m.hs == null ? null : m.hs, m.as == null ? null : m.as, m.status || (m.hs == null ? 'up' : 'done'), { verified: true, venue: m.venue || '', source: m.source || '' })); });
    Object.keys(SP.comps || {}).forEach((sp) => { comps[sp] = (comps[sp] || []).filter((c) => !(SP.comps[sp] || []).some((n) => n.id === c.id)).concat(SP.comps[sp] || []); });
    // Championnats lus automatiquement sur les sites des fédérations (contenus/sport-federations.js) :
    // ce qui est saisi dans Espace admin › Résultats reste prioritaire (même id de compétition ou de match).
    const AUTO = (typeof window !== 'undefined' && window.CASA_SPORT_AUTO) || {};
    const autoTeamClub = {};
    Object.keys(AUTO).forEach((sp) => {
      const A = AUTO[sp] || {};
      const known = comps[sp] || [];
      comps[sp] = known.concat((A.comps || []).filter((c) => c && c.id && !known.some((k) => k.id === c.id)));
      Object.keys(A.tables || {}).forEach((k) => { if (!tables[k]) tables[k] = (A.tables[k] || []).map((r) => T(r.team, r.j || 0, r.g || 0, r.n || 0, r.p || 0, r.diff == null ? '' : String(r.diff), r.pts || 0, r.form || '')); });
      const srcOf = {}; (A.comps || []).forEach((c) => { if (c && c.id) srcOf[c.id] = c.source || ''; });
      const seen = {}; matches.forEach((x) => { seen[x.id] = 1; });
      (A.matches || []).forEach((m) => { if (m && m.id && !seen[m.id]) { seen[m.id] = 1; matches.push(M(m.id, m.sport || sp, m.comp, m.date || null, m.time || '', m.home, m.away, m.hs == null ? null : m.hs, m.as == null ? null : m.as, m.status || (m.hs == null ? 'up' : 'done'), { verified: true, venue: m.venue || '', source: m.source || srcOf[m.comp] || '' })); } });
      Object.assign(autoTeamClub, A.teamClub || {});
    });
    const teamClubBase = { 'FCEH': 'fceh', 'AS Tourlaville Football': 'as-tourlaville', 'CS Carentan Football': 'cs-carentan', 'US Côte des Isles': 'us-cote-isles', 'SC Douve Divette': 'sc-douve', 'UC Briquebec': 'uc-briquebec', 'ES Pointe Hague': 'esph', 'US Avranches MSM': 'us-avranches', 'USON Mondeville FC': 'uson-mondeville', 'AS Cherbourg Football': 'as-cherbourg', 'Les Marais Cherbourg Basketball': 'marais-basket', 'UST Basket': 'ust-basket', 'PL Tourlaville Basket': 'pl-tourlaville', 'La Valognaise Basket': 'valognaise', 'Basket Club de la Hague': 'bc-hague', 'Les Redoutables': 'redoutables' };
    const clubNames = {}; this.data().clubs.forEach((c) => { clubNames[c.name] = c.id; });
    // une équipe lue chez la fédération dont le club existait déjà sur le site pointe vers la fiche existante
    const dClubs = this.data().clubs, nrm = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    Object.keys(autoTeamClub).forEach((t) => { if (!dClubs.some((c) => c.id === autoTeamClub[t])) { const base = nrm(t).replace(/ (\d|[a-h])$/, ''); const hit = dClubs.find((c) => nrm(c.name) === base); if (hit) autoTeamClub[t] = hit.id; else delete autoTeamClub[t]; } });
    const teamClub = Object.assign({}, teamClubBase, autoTeamClub, clubNames, SP.teamClub || {});
    // Formules d'abonnement : contenus/abonnements.js (modifiable dans l'espace administrateur)
    const subPlans = {};
    ((typeof window !== 'undefined' && window.CASA_ABONNEMENTS) || []).forEach((f) => { if (f && f.id) subPlans[f.id] = Object.assign({ name: f.id, mois: 0, an: 0, perks: [], casab: false, gazette: null, paper: false }, f, { gazette: f.gazette || null, perks: (f.perks || []).filter(Boolean) }); });
    // Lieux (arrière-plans « Lieux de légende », lieu du jour) : contenus/lieux.js
    const places = (typeof window !== 'undefined' && Array.isArray(window.CASA_LIEUX) && window.CASA_LIEUX.length) ? window.CASA_LIEUX.filter((p) => p && p.id).map((p) => Object.assign({}, p, { img: p.photo || p.img, isPhoto: !!p.photo })) : [{ id: 'rade', name: 'Casa Besports', short: 'Casa Besports', where: 'Cotentin', year: '', img: 'assets/hero.jpg', hook: '', desc: '', moment: '' }];
    // Partenaires : contenus/partenaires.js (modifiable dans l'espace administrateur)
    const partners = ((typeof window !== 'undefined' && window.CASA_PARTENAIRES) || []).filter((p) => p && p.id && p.name).map((p) => Object.assign({ sector: '', city: '', tier: '', since: new Date().getFullYear(), perk: '', desc: '', real: true }, p, { mono: p.mono || (p.name || '?')[0].toUpperCase(), color: p.color || '#163a5f' }));
    const team = ((typeof window !== 'undefined' && window.CASA_EQUIPE) || []).map((m, i) => ({ id: i === 0 ? 'admin' : 'm' + i, name: m.name, mail: m.email, role: m.role === 'admin' ? 'admin' : 'writer' }));
    const seedPosts = [];
    const seedAt = {};
    const seedType = { p2: 'tribune', p5: 'portrait' };
    seedPosts.forEach((p) => {
      p.type = seedType[p.id] || 'article'; p.updatedAt = seedAt[p.id]; p.log.forEach((l) => { l.at = p.updatedAt; });
      if (typeof CasaRedac !== 'undefined') p.versions = [{ n: 1, at: p.updatedAt, who: p.author, label: p.log[p.log.length - 1].what.replace(/\.$/, ''), snap: CasaRedac.snapOf(p) }];
    });
    if (typeof CasaRedac !== 'undefined' && seedPosts[2]) {
      const p3 = seedPosts[2];
      const v1 = Object.assign({}, p3, { dek: 'Bien reprendre.', body: 'La reprise est un moment clé de la saison.\n\n- Progressivité\n- Échauffement\n- Sommeil' });
      p3.versions = [{ n: 1, at: '2026-10-10T16:00:00.000Z', who: 'Inès Garnier', label: 'Premier jet', snap: CasaRedac.snapOf(v1) }, { n: 2, at: '2026-10-11T09:20:00.000Z', who: 'Inès Garnier', label: 'Article soumis à la relecture', snap: CasaRedac.snapOf(p3) }];
    }
    this._m = { products, paths, markPos, matches, comps, tables, teamClub, subPlans, places, partners, team, seedPosts };
    return this._m;
  }

  gazette() {
    if (this._g) return this._g;
    const B = (id) => (window.ASSET_DATA[BLOB_FILES[id]] || ('assets/' + (BLOB_FILES[id] || id)));
    const T = (arr) => (arr || []).map((t) => ({ t }));
    // sec : cahier du sommaire · band : début du titre posé sur le bandeau noir · choc : encadré « Le détail choc 🔥 » (fait vérifié, avec sa source)
    const P = (o) => Object.assign({ id: '', sec: '', band: '', kind: 'article', img: null, imgCap: '', script: '', kicker: '', paras: [], quote: '', quoteBy: '', aside: null, score: null, scores: [], rows: null, head: null, cols3: [], drop: true, tilt: false, choc: null, glyph: '' }, o);
    const demoPages = [
      P({ id: 'cover', kind: 'cover', rubric: 'Couverture', title: 'La Gazette du Cotentin' }),
      P({ id: 'toc', kind: 'toc', rubric: 'Sommaire', title: 'Dans ce numéro', script: 'cinq cahiers, trente pages' }),
      // ---------- À la une ----------
      P({ id: 'edito', sec: 'À la une', rubric: 'Édito', title: 'Le sport a une histoire', script: 'et elle s’écrit ici', img: B('bae1d2ac6cb6529aa1e99e023df405ff'), imgCap: 'Photo-illustration',
        kicker: 'Le sport local ne manque pas d’histoires. Il manque parfois de lumière.',
        paras: T(['Chaque week-end, du nord de la Hague aux plages de la côte des Isles, des milliers de licenciés, d’éducateurs et de bénévoles font vivre le sport dans le Cotentin. Leurs victoires ne font pas toujours la une. Leurs efforts, eux, sont permanents.',
          'La Gazette du Cotentin est née de cette conviction : le sport de proximité mérite d’être raconté avec la même exigence que le sport professionnel. Des récits, des portraits, des coulisses, des chiffres utiles et des pages pour se cultiver sur le territoire que l’on défend balle au pied, ballon en main ou baskets aux pieds.',
          'Nouveauté de ce numéro : « Le détail choc », un fait vérifié qui change le regard sur une histoire. Vous le retrouverez en page 6 et dans les encadrés marqués d’une flamme.',
          'Ce numéro d’essai est un avant-goût. Dites-nous ce que vous aimez, ce qui manque, ce que vous voulez lire. La Gazette sera ce que vous en ferez.']),
        quote: 'Rendez-vous au bord des terrains.', quoteBy: 'La rédaction' }),
      P({ id: 'weekend', sec: 'À la une', kind: 'brief', thumb: B('824fb1ca8687d16522c2ba8f05d66086'), rubric: 'Le week-end en 60 secondes', title: 'Le week-end en 60 secondes', script: 'les résultats, les faits, l’essentiel',
        blocks: [
          { sport: 'Football', title: 'Le FCEH valide son maintien', text: 'Large vainqueur d’Agneaux FC au stade Jean-Jaurès, le FCEH s’assure de rester en Régional 2.', home: 'FCEH', away: 'Agneaux FC', hs: '5', as: '1', hasScore: true, img: B('824fb1ca8687d16522c2ba8f05d66086') },
          { sport: 'Football', title: 'Démonstration cherbourgeoise', text: 'L’AS Cherbourg s’impose 8-0 face à l’ASTDV B, une copie collective saluée par le photographe Thibault Mariette.', home: 'AS Cherbourg', away: 'ASTDV B', hs: '8', as: '0', hasScore: true, img: B('e6132a6993a0d040085ac66b6f46cf6e') },
          { sport: 'Basket', title: 'La Blue Squad cède en demie', text: 'Battue par la Sélection de la Manche au Tournoi international de Cherbourg, elle a joué la 3e place face à Essonne 91.', hasScore: false, img: B('4f81a4491eb301c8894c5d5d2ab04ff6') },
          { sport: 'Water-polo', title: 'Les Redoutables en piste', text: 'Troisième participation à la Coupe de la Manche, face à Granville, Querqueville et Carentan.', hasScore: false, img: B('38c25d93ed37833c9d08d0a1d75de3f1') },
          { sport: 'Rugby', title: '400 ans de Marine', text: 'Pour les 400 ans de la Marine nationale, un match de gala a opposé la Marine à la police britannique. Les capitaines du RCMN se confient en vidéo.', hasScore: false, img: B('d75f806f46d28a0e206a30c27b8e58ad') }
        ],
        retenir: [{ n: '1', h: 'Pointe-Hague toujours en vie', t: 'Qualifiés aux tirs au but à Mondeville, les Haguais reçoivent l’US Avranches au 4e tour.' }, { n: '2', h: 'Le maintien pour le FCEH', t: 'Une victoire nette qui sécurise la saison en Régional 2.' }, { n: '3', h: 'Des bénévoles en or', t: 'Les « maillots oranges » ont fait vivre le Tournoi international de basket.' }] }),
      P({ id: 'dossier', sec: 'À la une', rubric: 'Le dossier', title: 'Pointe-Hague face à Goliath', script: 'une histoire de coupe', img: B('5cd343902a0b6d6a654108dee90d6fc3'), imgCap: 'L’ES Pointe-Hague', tilt: true,
        kicker: 'L’année de ses trente ans, l’ES Pointe-Hague reçoit l’US Avranches au quatrième tour de la Coupe de France.',
        paras: T(['Le parcours a déjà le goût de l’exploit. Au tour précédent, à Mondeville, les Haguais ont dû aller jusqu’à la séance de tirs au but pour composter leur billet. Une qualification arrachée au mental, qui a soudé un groupe et un village.',
          'Le tirage leur offre désormais l’US Avranches, adversaire invaincu en championnat au moment du tirage. Sur le papier, l’écart est immense. Mais la Coupe de France s’est construite sur ces affiches où le petit refuse de se contenter du rôle de figurant.',
          'Pour un club qui fête ses trente ans, recevoir un tel adversaire est déjà une récompense. Pour les joueurs, c’est l’occasion de vivre un match qui comptera dans une carrière amateur. Et pour toute la Hague, la promesse d’une tribune pleine.']),
        quote: 'La Coupe dans ce qu’elle a de plus beau.',
        cols3: [{ h: 'Le contexte', t: 'Trente ans d’histoire pour l’ES Pointe-Hague.' }, { h: 'Le défi', t: 'Une équipe invaincue en championnat en face.' }, { h: 'Le rendez-vous', t: 'Date et heure à confirmer par le district.' }],
        choc: { t: 'En 2012, l’US Quevilly, club normand de troisième division, a joué la finale de la Coupe de France au Stade de France.', go: 'choc', src: 'Source : finale de la Coupe de France 2012 (Wikipédia)' } }),
      P({ id: 'choc', sec: 'À la une', kind: 'choc', rubric: 'Le détail choc 🔥', title: 'Le détail choc', script: 'ce qu’on n’oublie plus après l’avoir lu', glyph: '🔥',
        bigA: 'En 2012, un club normand de troisième division a joué', bigB: 'la finale de la Coupe de France.',
        who: 'L’US Quevilly · National · saison 2011-2012',
        stats: [{ k: '3e', l: 'division française : le National' }, { k: '2', l: 'clubs de Ligue 1 éliminés : Marseille, puis Rennes' }, { k: '76 229', l: 'spectateurs au Stade de France' }, { k: '1927', l: 'l’année de sa première finale' }],
        paras: T(['Saison 2011-2012. L’US Quevilly, club de l’agglomération rouennaise, évolue en National, le troisième échelon du football français. En quart de finale de la Coupe de France, il sort l’Olympique de Marseille. En demi-finale, le Stade rennais.',
          'Le 28 avril 2012, au Stade de France, devant 76 229 spectateurs, les Normands ne cèdent qu’une fois face à l’Olympique lyonnais : 1-0, sur un but de Lisandro López en première mi-temps.',
          'Le plus fou ? Ce n’était pas une première. En 1927 déjà, Quevilly avait atteint la finale, perdue 3-0 contre Marseille, au stade de Colombes.']),
        aside: { h: 'Avant eux : Calais', t: 'En 2000, Calais, club amateur de CFA, avait lui aussi rejoint la finale. Battu 2-1 par Nantes au Stade de France, devant 78 717 spectateurs.' },
        why: 'L’ES Pointe-Hague reçoit l’US Avranches au 4e tour. En Coupe de France, les petits ont déjà écrit l’histoire.',
        src: 'Vérifié par la rédaction · Sources : finales de la Coupe de France 1927, 2000 et 2012 (Wikipédia).' }),
      P({ id: 'vestiaire', sec: 'À la une', kind: 'qa', img: B('c385b1324c6ffa4e23d8af37ea839381'), imgCap: 'Photo-illustration', rubric: 'Dans le vestiaire', title: 'Dans le vestiaire', band: 'Dans le vestiaire', script: '3 questions, pas de langue de bois', who: 'La Coupe de France', whoSub: 'expliquée par la rédaction',
        qs: [{ n: '1', q: 'Qui peut jouer la Coupe de France ?', a: 'Tous les clubs affiliés à la Fédération française de football. Les premiers tours sont organisés par les ligues régionales, à proximité, entre clubs amateurs de niveaux très différents.' },
          { n: '2', q: 'Quand arrivent les professionnels ?', a: 'Les clubs de Ligue 2 entrent au septième tour, ceux de Ligue 1 en trente-deuxièmes de finale. Chaque match est à élimination directe, sans match retour.' },
          { n: '3', q: 'Pourquoi fait-elle rêver ?', a: 'Un seul match, un seul soir, et tout devient possible. Pour un club comme l’ES Pointe-Hague, chaque tour franchi est une page d’histoire locale.' }],
        quote: 'Un seul match, un seul soir.', card: [{ k: 'Format', v: 'Élimination directe' }, { k: 'Entrée Ligue 2', v: '7e tour' }, { k: 'Entrée Ligue 1', v: '32es de finale' }, { k: 'En cas d’égalité', v: 'Règlement de chaque tour' }] }),
      P({ id: 'chiffre', sec: 'À la une', kind: 'number', rubric: 'Le chiffre', title: 'Le chiffre', script: 'un nombre, une histoire', big: '30', label: 'ans d’histoire pour l’ES Pointe-Hague', img: B('91855c40cd47f028874202e72a33d389'), imgCap: 'Photo-illustration',
        lead: 'L’ES Pointe-Hague fête ses trente ans avec un cadeau inattendu : un quatrième tour de Coupe de France à domicile face à l’US Avranches.',
        text: 'Trois décennies de licenciés, de bénévoles et de week-ends passés au bord du terrain. Un anniversaire qui rappelle ce que représente un club de village : un lieu où l’on grandit, où l’on se retrouve et où l’on transmet.',
        cols3: [{ h: 'Pourquoi ça compte', t: 'Un club qui dure trente ans, c’est une communauté qui se renouvelle génération après génération.' }, { h: 'Ce que ça dit', t: 'Le football amateur de la Hague garde la capacité de rêver grand.' }, { h: 'La suite', t: 'La réception de l’US Avranches, et la Gazette en tribune.' }] }),
      // ---------- Le terrain ----------
      P({ id: 'duel', sec: 'Le terrain', rubric: 'Football · Régional 2', title: 'Le duel des buteurs', script: 'Cuquemelle contre Perrey', img: B('33cc6fbd406b8554971d61a0887d4a76'), imgCap: 'Adrien Cuquemelle et Enzo Perrey',
        kicker: 'La course au titre de meilleur buteur de R2 raconte bien plus qu’un classement.',
        paras: T(['D’un côté, Adrien Cuquemelle, finisseur du CS Carentan. De l’autre, Enzo Perrey, joueur décisif revenu à l’AS Tourlaville. Deux profils, deux clubs, une même obsession : faire trembler les filets.',
          'Leur duel à distance a animé la saison de Régional 2 et rappelé une évidence : le football du Cotentin regorge de talents capables de faire la différence semaine après semaine.',
          'Au-delà des statistiques, cette rivalité donne aux plus jeunes des modèles proches, visibles, accessibles. Et elle offre aux supporters un fil rouge pour suivre tout un championnat.']) }),
      P({ id: 'fceh', sec: 'Le terrain', rubric: 'Football · Régional 2', title: 'Le FCEH reste en R2', script: 'la saison sauvée', img: B('824fb1ca8687d16522c2ba8f05d66086'), imgCap: 'La joie des joueurs du FCEH',
        kicker: 'Une victoire large face à Agneaux FC au stade Jean-Jaurès.', score: { home: 'FCEH', away: 'Agneaux FC', hs: '5', as: '1', cap: 'Stade Jean-Jaurès · Régional 2' },
        paras: T(['Il fallait un grand match pour sécuriser la saison. Le FCEH l’a livré : large vainqueur d’Agneaux FC, le club d’Équeurdreville-Hainneville a signé une victoire majeure qui valide son maintien en Régional 2.',
          'Au-delà du score, la manière a marqué les esprits. Une équipe concernée, solidaire, qui a su faire basculer la rencontre et la contrôler jusqu’au bout. Le maintien acquis, le club peut préparer l’avenir avec sérénité, sous la conduite de son entraîneur Florian Billard.']) }),
      P({ id: 'feminines', sec: 'Le terrain', rubric: 'Football féminin', title: 'Elles écrivent leur histoire', script: 'à Postaire, devant leur public', img: B('f2d41cc7df08eba8f5272bd4fddfac50'), imgCap: 'Les féminines de l’AS Cherbourg',
        kicker: 'Un match difficile, mais une étape importante pour le projet féminin de l’AS Cherbourg.',
        paras: T(['Devant leur public, les féminines de l’AS Cherbourg ont vécu une rencontre exigeante. Le résultat n’a pas souri, mais l’essentiel était ailleurs : la visibilité d’un projet qui grandit.',
          'Le football féminin progresse partout en France, et le Cotentin n’échappe pas à la tendance. Chaque match joué devant des tribunes garnies est un message envoyé aux jeunes filles qui hésitent encore à prendre une licence.',
          'La Gazette suivra cette équipe tout au long de la saison. Parce que l’histoire se construit aussi dans les matchs difficiles.']) }),
      P({ id: 'regard', sec: 'Le terrain', rubric: 'Regard terrain', title: 'Derrière l’objectif', script: 'le match vu par le photographe', img: B('e6132a6993a0d040085ac66b6f46cf6e'), imgCap: 'AS Cherbourg – ASTDV B', score: { home: 'AS Cherbourg', away: 'ASTDV B', hs: '8', as: '0', cap: 'Régional 1' },
        kicker: 'Le photographe Thibault Mariette raconte la victoire 8-0 de l’AS Cherbourg face à l’ASTDV B.',
        paras: T(['Derrière l’objectif, on voit le match autrement. Thibault Mariette a couvert la rencontre AS Cherbourg – ASTDV B et en retient d’abord la circulation du ballon.',
          'Le format « Regard terrain » donne la parole à ceux qui observent les matchs depuis la ligne de touche : photographes, vidéastes, arbitres, bénévoles. Une autre façon de raconter le football. Retrouvez l’intégralité de son regard sur casabesports.fr.']),
        quote: '« J’ai été surpris par la qualité collective de Cherbourg. »', quoteBy: 'Thibault Mariette, photographe' }),
      P({ id: 'waterpolo', sec: 'Le terrain', rubric: 'Water-polo', title: 'Les Redoutables', script: 'cap sur la Coupe de la Manche', img: B('38c25d93ed37833c9d08d0a1d75de3f1'), imgCap: 'Les Redoutables de Cherbourg', tilt: true,
        kicker: 'Troisième participation à la Coupe de la Manche pour l’équipe de Cherbourg.',
        paras: T(['Pour leur troisième participation à la Coupe de la Manche, Les Redoutables de Cherbourg veulent confirmer leur progression. Au programme : Granville, Querqueville et Carentan.',
          'Le water-polo reste une discipline confidentielle dans le département, mais il attire des profils complets : endurance, puissance, lecture du jeu. Un sport collectif exigeant, souvent découvert par hasard et adopté pour longtemps.']),
        cols3: [{ h: 'Granville', t: 'Premier adversaire.' }, { h: 'Querqueville', t: 'Le voisin.' }, { h: 'Carentan', t: 'Pour finir.' }] }),
      P({ id: 'arbitrage', sec: 'Le terrain', rubric: 'Arbitrage', title: 'Ceux qui tiennent le sifflet', script: 'sans eux, pas de match', img: B('5841e4625d308992d931ba37f1195ce3'), imgCap: 'Bryan Piedagnel',
        kicker: 'Rencontre avec une fonction trop souvent oubliée.',
        paras: T(['Bryan Piedagnel, arbitre, est au cœur d’un reportage vidéo de Casa Besports consacré aux coulisses d’une vie d’arbitre, entre passion et exigence.',
          'Cloé Mariette, arbitre et vice-présidente du District de football de la Manche, incarne elle aussi cet engagement, sur le terrain comme dans les instances.',
          'Chaque saison, les districts recherchent de nouveaux arbitres, dès l’adolescence. Une formation est proposée, et la fonction est rémunérée selon le niveau.']),
        aside: { h: 'Devenir arbitre', t: 'Le District de football de la Manche organise des formations initiales. Renseignez-vous auprès de votre club.' } }),
      P({ id: 'tableau', sec: 'Le terrain', kind: 'chalk', img: B('56cc472c6c2fbb4d9666f881a2e56edf'), imgCap: 'Photo-illustration', rubric: 'Le tableau noir', title: 'Le tableau noir', script: 'comprendre le jeu', head2: 'Trois idées pour presser haut',
        lead: 'Sans prétendre décrire une équipe en particulier, voici trois principes de jeu que l’on retrouve sur bien des terrains amateurs.',
        steps: [{ n: '01', h: 'Sortie de balle', sub: 'Des solutions courtes et sûres', t: 'Le gardien attire le premier rideau adverse pour libérer les défenseurs centraux. Les milieux se placent entre les lignes et offrent des solutions simples.', hand: 'Créer une supériorité à la relance.' },
          { n: '02', h: 'Zone de pressing', sub: 'Récupérer haut', t: 'Le pressing se déclenche sur une passe vers le côté. Les attaquants ferment les lignes de passe, les milieux coupent l’intérieur.', hand: 'Orienter, fermer, récupérer.' },
          { n: '03', h: 'Dernier geste', sub: 'Être juste dans la zone clé', t: 'Une fois le ballon récupéré, l’équipe se projette vite. Les appels dans le demi-espace libèrent centre, passe en profondeur ou frappe.', hand: 'De la vitesse et des choix simples.' }] }),
      // ---------- Les gens ----------
      P({ id: 'debat', sec: 'Les gens', kind: 'debat', rubric: 'La question qui divise', title: 'Le dimanche 15 h, intouchable ?', band: 'Le dimanche 15 h', script: 'tradition sacrée ou horaire d’un autre temps', glyph: '?',
        lead: 'Le coup d’envoi du dimanche après-midi rythme la vie des clubs depuis des générations. Mais les joueurs, les familles et les bénévoles n’ont plus tous le même agenda. Deux camps, deux lignes d’arguments : à vous de trancher.',
        pour: { h: 'on n’y touche pas', pts: T(['C’est le rendez-vous du village : on vient voir le match après le repas de famille, on y croise tout le monde.', 'La buvette et la tribune vivent de ce créneau, et leurs recettes font tourner le club toute la saison.', 'Les arbitres, les bénévoles et les transports des jeunes sont organisés autour de lui depuis toujours.']) },
        contre: { h: 'il est temps de bouger', pts: T(['Un match le samedi soir attire un autre public, plus jeune, et rend le dimanche aux familles.', 'Beaucoup de joueurs travaillent le week-end, les plus jeunes ont d’autres activités : un peu de souplesse retient des licenciés.', 'Les terrains éclairés permettent désormais des horaires plus variés, l’hiver comme l’été.']) },
        note: 'Votre club a changé d’horaire ? Racontez-nous comment ça s’est passé : les meilleurs témoignages seront publiés dans le prochain numéro.' }),
      P({ id: 'histoire', sec: 'Les gens', kind: 'story', rubric: 'L’histoire', title: 'L’histoire', script: 'ceux qui font vivre le sport d’ici', img: B('25fc361529644e7b5978722ef83683b6'), imgCap: 'Photo-illustration',
        lead: 'Ils accueillent, tiennent la buvette, tracent les lignes, gèrent la table de marque. Dans le Cotentin, le sport local vit grâce à des femmes et des hommes de l’ombre.',
        paras: T(['Au Tournoi international de basket de Cherbourg, ils portaient des maillots oranges. Tout le week-end, les bénévoles ont accueilli les équipes, tenu les buvettes, les tables de marque et les vestiaires. Sans eux, pas de tournoi.',
          'Partout dans la Manche, la même scène se répète chaque samedi : quelqu’un ouvre le stade, quelqu’un lave les maillots, quelqu’un conduit les plus jeunes au match. Ces gestes ne font jamais la une, ils font pourtant tenir les clubs.',
          'Le bénévolat sportif s’essouffle dans de nombreux clubs : manque de temps, charge administrative, sentiment de ne pas être reconnu. La Gazette ouvre une rubrique pour leur rendre hommage. Proposez-nous les bénévoles de votre club.']),
        quote: 'Un club, c’est d’abord des gens qui donnent leur temps.',
        enbref: [{ h: 'Des maillots oranges', t: 'Les bénévoles du Tournoi international de Cherbourg.' }, { h: 'Toutes les générations', t: 'Du parent au retraité, chacun trouve sa place.' }, { h: 'Votre club', t: 'Écrivez-nous pour mettre vos bénévoles à l’honneur.' }] }),
      P({ id: 'visage', sec: 'Les gens', kind: 'portrait', rubric: 'Le visage du Cotentin', title: 'Le visage du Cotentin', script: 'portrait d’une passion', name: 'Alexan Morin', sport: 'Trail', img: B('2b8b1c873d91f86dbbe51fe32be05f69'),
        text: 'Figure montante du trail dans le Nord-Cotentin, Alexan Morin avance avec talent, ambition et une volonté forte : devenir un modèle pour son frère. Sentiers côtiers, dénivelés courts mais cassants, vent et embruns : le territoire forge le caractère.',
        tagline: 'Courir pour montrer la voie.',
        cols3: [{ h: 'Son sport', t: 'Le trail, sur les sentiers du Nord-Cotentin.' }, { h: 'Sa force', t: 'Le talent et l’ambition.' }, { h: 'Son moteur', t: 'Devenir un modèle pour son frère.' }] }),
      // ---------- Le territoire ----------
      P({ id: 'retro', sec: 'Le territoire', kind: 'retro', rubric: 'Rétro', title: 'Il y a dix ans, le Tour dans la Manche', band: 'Il y a dix ans', script: 'juillet 2016 : trois jours, deux maillots jaunes', thumb: B('56c5699f8f042372def6ef4a6c5ca373'),
        lead: 'Début juillet 2016, la Grande Boucle s’élance de la Manche. Trois étapes, du Mont-Saint-Michel à Granville, et une arrivée en montée au-dessus de Cherbourg qui fait passer le maillot jaune d’épaules en épaules.',
        timeline: [
          { d: 'Samedi 2 juillet', h: 'Mont-Saint-Michel → Utah Beach', km: '188 km', t: 'Grand départ au pied du Mont. Mark Cavendish gagne au sprint à Sainte-Marie-du-Mont et endosse le premier maillot jaune de sa carrière.' },
          { d: 'Dimanche 3 juillet', h: 'Saint-Lô → Cherbourg-en-Cotentin', km: '183 km', t: 'Arrivée en côte après la Glacerie. Peter Sagan, champion du monde en titre, s’impose devant Julian Alaphilippe et Alejandro Valverde, et prend le maillot jaune.' },
          { d: 'Lundi 4 juillet', h: 'Granville → Angers', km: '', t: 'Le peloton quitte la Manche par Granville. Nouveau sprint, nouvelle victoire de Mark Cavendish.' }],
        num: { big: '1,9 km', l: 'à 6,5 % de moyenne : la côte de la Glacerie, classée en 3e catégorie, juste avant l’arrivée à Cherbourg-en-Cotentin.' },
        paras: T(['Pour le Cotentin, c’était un rendez-vous rare : une arrivée d’étape du Tour de France, et un vainqueur en maillot arc-en-ciel de champion du monde.',
          'Dix ans plus tard, la côte de la Glacerie est toujours là. Et elle pique toujours autant les jambes de ceux qui la montent le dimanche matin.']),
        choc: { t: 'Il a suffi de cette petite côte de 1,9 km pour que le maillot jaune passe des épaules de Mark Cavendish à celles de Peter Sagan.', src: 'Source : Tour de France 2016, étapes 1 et 2 (Wikipédia)' } }),
      P({ id: 'rade', sec: 'Le territoire', rubric: 'Lieux de légende', title: 'La rade de Cherbourg', script: 'la plus grande rade artificielle du monde', img: B('37f0accd200070c08850e6289a7929b2'), imgCap: 'Illustration Casa Besports',
        paras: T(['Protégée par de longues digues bâties entre la fin du XVIIIe siècle et le XIXe siècle, la rade de Cherbourg est présentée comme la plus grande rade artificielle du monde.',
          'En 1786, Louis XVI se rend à Cherbourg pour assister à l’immersion de l’un des immenses cônes de bois destinés à construire la digue centrale.',
          'Au-dessus de la ville, le fort du Roule abrite aujourd’hui le musée de la Libération : en juin 1944, la prise du fort précède de peu la libération de Cherbourg, le 26 juin.']),
        aside: { h: 'Et le sport ?', t: 'Voile, aviron et nage en eau libre font de la rade un stade nautique à ciel ouvert.' },
        choc: { t: 'Le 10 avril 1912, le Titanic fait escale à Cherbourg moins de deux heures, en début de soirée. Les transbordeurs Nomadic et Traffic lui amènent plus de 270 passagers.', src: 'Source : escale du Titanic à Cherbourg (IrishCentral)' } }),
      P({ id: 'gatteville', sec: 'Le territoire', rubric: 'Lieux de légende', title: 'Gatteville et la Blanche-Nef', script: '75 mètres de lumière', img: B('f46b43bf0cb05c3fde4cba8ae7d9c8d5'), imgCap: 'Illustration Casa Besports',
        paras: T(['Allumé en 1835 à la pointe de Barfleur, le phare de Gatteville culmine à 75 mètres : c’est le deuxième plus haut phare de France.',
          'Au large, le 25 novembre 1120, la Blanche-Nef heurte un rocher et sombre. À bord se trouvait Guillaume Adelin, unique fils légitime du roi d’Angleterre Henri Ier. Sa mort ouvrira une longue crise de succession.',
          'Aujourd’hui, le site attire randonneurs et traileurs, qui longent le littoral du Val de Saire.']),
        choc: { t: '365 marches, une par jour de l’année, et 52 fenêtres : le phare de Gatteville a été construit comme un calendrier.', src: 'Source : Figaro Nautisme, « Phare de Gatteville, là-haut en Cotentin »' } }),
      P({ id: 'mont', sec: 'Le territoire', rubric: 'Lieux de légende', title: 'Le Mont-Saint-Michel', script: 'l’imprenable', img: B('56c5699f8f042372def6ef4a6c5ca373'), imgCap: 'Illustration Casa Besports',
        paras: T(['Selon la tradition, c’est Aubert, évêque d’Avranches, qui fonde en 708 un sanctuaire sur le mont, après des apparitions de l’archange saint Michel.',
          'Pendant la guerre de Cent Ans, la place forte résiste aux assauts anglais et ne sera jamais prise : le Mont devient un symbole de résistance.',
          'Le site est inscrit au patrimoine mondial de l’Unesco depuis 1979. Et pour les supporters de l’US Avranches, il reste la plus belle des toiles de fond.']),
        choc: { t: 'La baie connaît les plus grandes marées d’Europe continentale : jusqu’à 15 mètres d’écart entre la basse et la pleine mer.', src: 'Source : France.fr, « 6 mystères qui entourent le Mont-Saint-Michel »' } }),
      // ---------- La pause ----------
      P({ id: 'forme', sec: 'La pause', rubric: 'En forme', title: 'Reprise et assiette', script: 'les bons réflexes', drop: false, img: B('66c390103494d9a28a5f34e10524881c'), imgCap: 'Les joueuses du RCMN',
        kicker: 'Repères simples pour les sportifs amateurs. Ces conseils généraux ne remplacent pas l’avis d’un professionnel de santé.',
        paras: T(['Progressivité : augmentez le volume d’entraînement par paliers plutôt que de reprendre au rythme de la fin de saison.',
          'Échauffement : dix à quinze minutes d’activation, de mobilité articulaire et d’accélérations progressives avant chaque séance.',
          'Sommeil et hydratation : les deux piliers de la récupération, souvent négligés.',
          'Avant le match : un repas riche en glucides complexes, environ trois heures avant le coup d’envoi. Après : glucides et protéines dans l’heure qui suit.',
          'Écoute du corps : une douleur qui persiste au-delà de quelques jours mérite l’avis d’un professionnel.']),
        cols3: [{ h: 'Avant', t: 'Glucides complexes, 3 h avant.' }, { h: 'Pendant', t: 'De petites gorgées, régulièrement.' }, { h: 'Après', t: 'Glucides et protéines, puis un vrai repas.' }] }),
      P({ id: 'lexique', sec: 'La pause', kind: 'lexique', rubric: 'Le lexique', title: 'Le lexique du bord de terrain', script: 'pour briller à la buvette', glyph: 'Aa',
        lead: 'Dix mots entendus le week-end, de la main courante à la tribune. Une définition chacun, et plus d’excuse pour hocher la tête sans comprendre.',
        entries: [
          { w: 'Caviar', s: 'Football', d: 'Une passe parfaite, servie sur un plateau : il ne reste qu’à marquer.' },
          { w: 'Lucarne', s: 'Football', d: 'L’angle entre la barre et le poteau. Le but qu’on refait dix fois en rentrant.' },
          { w: 'Panenka', s: 'Football', d: 'Un penalty tiré en cloche, plein centre, pendant que le gardien plonge. Du nom d’Antonín Panenka, qui l’a tenté en finale de l’Euro 1976.' },
          { w: 'Petit pont', s: 'Football', d: 'Le ballon passe entre les jambes de l’adversaire. Effet garanti, amitié parfois en danger.' },
          { w: 'Chistera', s: 'Rugby', d: 'Une passe acrobatique en arc de cercle, d’un revers de main, comme le gant d’osier de la pelote basque qui lui donne son nom.' },
          { w: 'Cadrage-débordement', s: 'Rugby', d: 'Fixer son vis-à-vis vers l’intérieur, puis le déborder par l’extérieur. Un classique des trois-quarts.' },
          { w: 'Alley-oop', s: 'Basket', d: 'Une passe lobée près du cercle, un coéquipier qui saute, attrape et marque dans la foulée.' },
          { w: 'Buzzer-beater', s: 'Basket', d: 'Le panier marqué sur la sirène. Le chrono affiche zéro, la salle explose.' },
          { w: 'Bonnet rouge', s: 'Water-polo', d: 'Celui du gardien de but : en water-polo, c’est la couleur qui le distingue de ses partenaires.' },
          { w: 'Troisième mi-temps', s: 'Tous sports', d: 'Après le match, autour d’un verre ou d’un repas : le moment où l’on refait la rencontre. Le rugby en a fait une institution.' }] }),
      P({ id: 'agenda', sec: 'La pause', kind: 'agenda', thumb: B('5cd343902a0b6d6a654108dee90d6fc3'), rubric: 'Avant le coup d’envoi', title: 'Avant le coup d’envoi', script: 'les rendez-vous à ne pas manquer', sub: 'Le prochain week-end sportif dans le Cotentin',
        top: { sport: 'Football · Coupe de France', home: 'ES Pointe-Hague', away: 'US Avranches', when: '[DATE ET HEURE]', where: 'Beaumont-Hague', note: 'Un 4e tour de Coupe de France pour les 30 ans du club.' },
        rows: [{ img: B('33cc6fbd406b8554971d61a0887d4a76'), sport: 'Football', match: 'AS Tourlaville – FCEH', when: 'Dim. 15 h', where: 'Tourlaville', note: 'Régional 2 (démo)' }, { img: B('824fb1ca8687d16522c2ba8f05d66086'), sport: 'Football', match: 'SC Douve Divette – UC Briquebec', when: 'Dim. 15 h', where: 'Tollevast', note: 'Régional 2 (démo)' },
          { img: B('183faa9bf4b22beda6d2cb41e6b91225'), sport: 'Basket', match: 'UST Basket – La Valognaise', when: 'Sam. 20 h 30', where: 'Équeurdreville', note: 'Championnat (démo)' }, { img: B('38c25d93ed37833c9d08d0a1d75de3f1'), sport: 'Water-polo', match: 'Carentan – Les Redoutables', when: 'Sam. 19 h', where: 'Carentan', note: 'Coupe de la Manche (démo)' }],
        table: [['1', 'FCEH', '9'], ['2', 'AS Tourlaville', '7'], ['3', 'CS Carentan', '5'], ['4', 'Agneaux FC', '4'], ['5', 'US Côte des Isles', '3']].map(([r, t, p]) => ({ r, t, p })),
        note: 'Un week-end 100 % Cotentin, sur tous les terrains !' }),
      P({ id: 'boutique', sec: 'La pause', rubric: 'La boutique', title: 'Cherwood × Casa', script: 'l’atelier qui habille le Cotentin', img: B('981e82bbbb0f7a9367c97e4c848c2fc6'), imgCap: 'Hoodie « Le Roule »', tilt: true, strip: [{ src: B('b248d9f3a2edcd1758c3805be91a57a2'), cap: 'Sweat « La Presqu’île »' }, { src: B('2c48f7132b968b70be1c7d701dc4a9d6'), cap: 'T-shirt « … du ballon »' }, { src: B('b75f47de93c1cb54bec627f5067d8110'), cap: 'Hoodie « Cotentin Sport Club »' }],
        kicker: 'Une marque cherbourgeoise née en 2017, partenaire de la boutique Casa Besports.',
        paras: T(['Fondée en 2017, Cherwood propose des collections inspirées de la Normandie, avec une démarche écologique et éthique. Ses t-shirts identitaires affichent le nom des habitants : Cherbourgeois, Saint-Lois, Caennais…',
          'Les vêtements sont dessinés dans le centre-ville de Cherbourg, où un atelier réalise le flocage et la broderie. Ses motifs racontent le territoire, de la statue de Napoléon à la Montagne du Roule. Avec Casa Besports, la capsule revisite ces codes pour les sportifs : hoodie « Le Roule », sweat « La Presqu’île », t-shirt « … du ballon » personnalisable et hoodie Cotentin Sport Club.']),
        cols3: [{ h: 'Fabriqué', t: 'Dessiné et brodé à Cherbourg.' }, { h: 'Personnalisé', t: 'Votre ville, votre club, votre numéro.' }, { h: 'Retrait', t: 'Gratuit en boutique Cherwood.' }] }),
      P({ id: 'humeur', sec: 'La pause', kind: 'humeur', rubric: 'L’humeur', title: 'La page qui ne sert à rien', script: 'mais qu’on lit en premier', glyph: '↑↓',
        baro: [{ dir: 'up', h: 'La Hague', t: 'Un 4e tour de Coupe de France à domicile pour les 30 ans du club. Tribune pleine attendue.' },
          { dir: 'up', h: 'Les maillots oranges', t: 'Les bénévoles du Tournoi international de basket, impeccables tout le week-end.' },
          { dir: 'flat', h: 'Le vent', t: 'Présent à tous les matchs, sur tous les terrains. Jamais suspendu.' },
          { dir: 'down', h: 'Les vestiaires en novembre', t: 'L’eau chaude, cette légende que l’on se transmet de saison en saison.' }],
        clT: 'Le classement qui ne sert à rien', clSub: 'Les cinq bruits du dimanche au bord du terrain',
        classement: T(['Les crampons qui claquent sur le béton du couloir.', '« On se parle ! », crié par quelqu’un qui ne parle à personne.', 'La sono de la buvette qui grésille pendant l’annonce des équipes.', 'Le ballon qui finit dans le jardin du voisin. Encore.', 'Le vent. Toujours le vent.']) }),
      P({ id: 'quiz', sec: 'La pause', kind: 'quiz', thumb: B('f46b43bf0cb05c3fde4cba8ae7d9c8d5'), rubric: 'Jeux', title: 'Le quiz du Cotentin', script: 'dix questions, zéro triche', kicker: 'Testez votre culture sportive et locale, détails chocs compris. Solutions en dernière page.' }),
      P({ id: 'partenaires', sec: 'La pause', kind: 'ads', thumb: B('0855c8136dcdda770cb476333ba7ad46'), rubric: 'Partenaires', title: 'Ils soutiennent le sport d’ici', script: 'avantages lecteurs', kicker: 'Avantages réservés aux abonnés Casa B+ et aux lecteurs de la Gazette. OlistO est un partenaire réel ; les autres annonceurs sont fictifs.' }),
      P({ id: 'back', sec: 'La pause', kind: 'back', rubric: 'Dernière page', title: 'Make it happen', script: 'ici, le sport a une histoire', img: B('bae1d2ac6cb6529aa1e99e023df405ff'),
        solutions: 'Solutions du quiz : 1. 75 mètres · 2. 1120 · 3. Le Titanic · 4. 708 · 5. 8-0 · 6. 30 ans · 7. 2017 · 8. Jacques Prévert · 9. 2012 · 10. Peter Sagan.',
        ours: 'La Gazette du Cotentin est éditée par Casa Besports, média indépendant du sport local fondé en 2024. Numéro d’essai : contenus de démonstration, annonceurs fictifs, photo-illustrations signalées comme telles. Les détails chocs sont vérifiés et sourcés.' })
    ];
    // Le numéro en cours : couverture + sommaire + pages de contenus/gazette.js (ou de l'espace administrateur)
    const custom = (Array.isArray(window.CASA_GAZETTE) ? window.CASA_GAZETTE : []).filter((p) => p && p.title).map((p, i) => P(Object.assign({ id: 'p' + (i + 1), kind: 'article', sec: 'À la une' }, p, { paras: (p.paras || []).map((x) => (typeof x === 'string' ? { t: x } : x)) })));
    const pages = [demoPages[0], Object.assign({}, demoPages[1], { script: custom.length ? custom.length + (custom.length > 1 ? ' pages' : ' page') + ' à lire' : 'les pages arrivent bientôt' })].concat(custom);
    // Typographie française : espace insécable avant ? ! : ; » et après « (pas de ponctuation orpheline en début de ligne)
    const fr = (v) => typeof v === 'string' ? (/^(assets\/|data:|\/_blob\/)/.test(v) ? v : v.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0').replace(/(\d) (\d{3})(?!\d)/g, '$1\u00a0$2')) : Array.isArray(v) ? v.map(fr) : v && typeof v === 'object' ? Object.keys(v).reduce((o, k) => { o[k] = fr(v[k]); return o; }, {}) : v;
    pages.forEach((p, i) => { Object.keys(p).forEach((k) => { p[k] = fr(p[k]); }); p.n = String(i + 1).padStart(2, '0'); p.i = i; });
    const idx = (id) => Math.max(0, pages.findIndex((p) => p.id === id));
    const quizImgs = ['f46b43bf0cb05c3fde4cba8ae7d9c8d5', 'f46b43bf0cb05c3fde4cba8ae7d9c8d5', '47cc1f566d64d7869adcd6c21cdf47bf', '56c5699f8f042372def6ef4a6c5ca373', 'e6132a6993a0d040085ac66b6f46cf6e', '5cd343902a0b6d6a654108dee90d6fc3', '2c48f7132b968b70be1c7d701dc4a9d6', '68220997b900b01cc4ef65a2529b0ff1', 'c385b1324c6ffa4e23d8af37ea839381', '37f0accd200070c08850e6289a7929b2'].map(B);
    const quiz = [
      ['Quelle est la hauteur du phare de Gatteville ?', ['52 m', '75 m', '96 m'], 1],
      ['En quelle année la Blanche-Nef sombre-t-elle au large de Barfleur ?', ['1066', '1120', '1204'], 1],
      ['Quel paquebot fait escale à Cherbourg le 10 avril 1912 ?', ['Le Normandie', 'Le Titanic', 'Le France'], 1],
      ['Selon la tradition, en quelle année le sanctuaire du Mont-Saint-Michel est-il fondé ?', ['708', '966', '1023'], 0],
      ['Score de AS Cherbourg – ASTDV B ?', ['3-1', '5-1', '8-0'], 2],
      ['Quel anniversaire fête l’ES Pointe-Hague ?', ['20 ans', '30 ans', '50 ans'], 1],
      ['En quelle année Cherwood a-t-elle été fondée ?', ['2012', '2017', '2021'], 1],
      ['Quel poète a vécu ses dernières années à Omonville-la-Petite ?', ['Jacques Prévert', 'Victor Hugo', 'Paul Éluard'], 0],
      ['En quelle année l’US Quevilly, club de National, a-t-il joué la finale de la Coupe de France ?', ['2002', '2012', '2022'], 1],
      ['Qui a pris le maillot jaune à Cherbourg-en-Cotentin en 2016 ?', ['Mark Cavendish', 'Peter Sagan', 'Julian Alaphilippe'], 1]
    ];
    quiz.forEach((q) => { q[0] = fr(q[0]); q[1] = fr(q[1]); });
    const strip = pages.slice(2, 8).map((p) => p.i);
    const secs = ['À la une', 'Le terrain', 'Les gens', 'Le territoire', 'La pause'];
    this._g = { pages, quiz, strip, quizImgs, secs, idx };
    return this._g;
  }



  // Liseuse : aller à une page (bornée) et remonter en haut de la page
  gzGo(i) {
    const n = this.gazette().pages.length; const p = Math.max(0, Math.min(n - 1, i | 0));
    this.setState({ page: p, readerOpen: true });
    const top = () => { try { const sc = document.getElementById('gz-scroll'); if (sc) sc.scrollTop = 0; } catch (e) { /* liseuse fermée */ } };
    top(); try { (window.requestAnimationFrame || setTimeout)(top); } catch (e) { /* facultatif */ }
  }

  // ---------- rédaction : utilitaires ----------
  posts() { return this.state.posts || (window.CB_SERVER ? [] : this.more().seedPosts); }
  setPost(id, patch, logLine) {
    const who = this.me().name; const at = new Date().toISOString();
    const R = typeof CasaRedac !== 'undefined' ? CasaRedac : null;
    const posts = this.posts().map((p) => {
      if (p.id !== id) return p;
      const n = Object.assign({}, p, patch, { updated: 'à l’instant', updatedAt: at, log: logLine ? (p.log || []).concat([{ who, when: 'à l’instant', at, what: logLine }]) : p.log });
      if (R && logLine) n.versions = R.addVersion(n, who, logLine.replace(/\.$/, ''));
      if (R && patch.status === 'published') n.online = Object.assign(R.snapOf(n), { at });
      return n;
    });
    this.setState({ posts });
  }
  rxGuard(action, p, proceed) {
    if (typeof CasaRedac === 'undefined') { proceed(''); return; }
    const isAdmin = this.state.role === 'admin';
    const ctx = { isAdmin, staffRole: isAdmin ? 'admin' : (this.state.staffRole || 'redacteur'), checksOf: (x) => this.checksOf(x) };
    CasaRedac.guard(this, ctx, CasaRedac.data(this), action, p, proceed);
  }
  me() {
    const r = this.state.role;
    if (r === 'admin') { const n = this.state.name.trim() || 'Administrateur principal'; return { name: n, first: n.split(' ')[0], role: 'admin', roleLabel: 'Administrateur principal · validation et publication' }; }
    if (r === 'writer') { const n = this.state.name.trim() || 'Rédaction'; return { name: n, first: n.split(' ')[0], role: 'writer', roleLabel: 'Rédaction · écriture et soumission' }; }
    if (r === 'club') { const cl = this.data().clubs.find((c) => c.id === this.state.clubRoleId) || this.data().clubs[0] || { name: 'club' }; return { name: 'Correspondant ' + cl.name, first: 'Correspondant', role: 'club', roleLabel: 'Correspondant de club · ' + cl.name }; }
    return { name: 'Visiteur', first: 'Visiteur', role: null, roleLabel: '' };
  }
  blocksOf(body) {
    const out = [];
    (body || '').split(/\n\s*\n/).forEach((chunk) => {
      const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
      lines.forEach((l, i) => {
        const clean = (t) => t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
        const im = l.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        if (im) out.push({ t: clean(im[1]), src: im[2], isImg: true, isH: false, isP: false, isQ: false, isL: false });
        else if (/^##\s+/.test(l)) out.push({ t: clean(l.replace(/^##\s+/, '')), isH: true, isP: false, isQ: false, isL: false });
        else if (/^>\s*/.test(l)) out.push({ t: clean(l.replace(/^>\s*/, '')), isQ: true, isP: false, isH: false, isL: false });
        else if (/^[-•]\s+/.test(l)) out.push({ t: clean(l.replace(/^[-•]\s+/, '')), isL: true, isP: false, isH: false, isQ: false });
        else {
          const last = out[out.length - 1];
          if (i > 0 && last && last.isP) last.t += ' ' + clean(l); else out.push({ t: clean(l), isP: true, isH: false, isQ: false, isL: false });
        }
      });
    });
    out.forEach((b) => { b.cls = ''; }); const p1 = out.find((b) => b.isP); if (p1) p1.cls = 'art-p1';
    return out;
  }
  textOf(body) { return (body || '').replace(/^!\[[^\]]*\]\([^)]*\)\s*$/gm, '').replace(/^##\s+|^>\s*|^[-•]\s+/gm, '').replace(/\*\*/g, ''); }
  sentences(t) { return (t || '').replace(/\n+/g, ' ').split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter((x) => x.length > 1); }
  checksOf(p) {
    const words = this.textOf(p.body).split(/\s+/).filter(Boolean).length;
    const longS = this.sentences(this.textOf(p.body)).filter((x) => x.split(/\s+/).length > 35);
    const c = [
      [p.title.length >= 20 && p.title.length <= 80, 'Titre entre 20 et 80 caractères'],
      [p.dek.length >= 60, 'Chapeau d’au moins 60 caractères'],
      [words >= 150, 'Au moins 150 mots (' + words + ')'],
      [!!p.img && p.alt.trim().length >= 10, 'Image de une avec texte alternatif'],
      [/^##\s+/m.test(p.body), 'Au moins un intertitre'],
      [longS.length === 0, longS.length ? longS.length + ' phrase(s) de plus de 35 mots' : 'Pas de phrase trop longue'],
      [!!p.sport && !!p.tag.trim(), 'Discipline et rubrique renseignées'],
      [p.clubs.length > 0, 'Au moins un club lié']
    ];
    const ok = c.filter((x) => x[0]).length;
    return { words, list: c.map(([v, label]) => ({ label, icon: v ? '✓' : '!', color: v ? '#18705f' : '#b0202e' })), score: Math.round(ok / c.length * 100) };
  }

  // ---------- Casa IA : moteur intégré ----------
  aiPush(msg) { this.setState({ aiMsgs: this.state.aiMsgs.concat([msg]) }); }
  aiAsk(text) {
    const t = (text || '').trim();
    if (!t) return;
    this.setState({ aiMsgs: this.state.aiMsgs.concat([{ role: 'user', text: t, actions: [] }]), aiInput: '', aiTyping: true });
    const local = () => { const r = this.aiRespond(t); this.setState({ aiTyping: false }); this.aiPush({ role: 'bot', text: r.text, actions: r.actions || [] }); };
    if (typeof window !== 'undefined' && window.CASA_API && typeof fetch === 'function') {
      const history = this.state.aiMsgs.slice(-8).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })).concat([{ role: 'user', content: t }]);
      fetch(window.CASA_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history, view: this.state.view }) })
        .then((r) => r.ok ? r.json() : Promise.reject(r.status))
        .then((d) => {
          const acts = [];
          if (d.action && d.action.view) acts.push({ label: d.action.label || 'Ouvrir', run: () => this.go(d.action.view, d.action.params || {}) });
          this.setState({ aiTyping: false });
          this.aiPush({ role: 'bot', text: d.reply || '…', actions: acts });
        })
        .catch(local);
    } else {
      clearTimeout(this._ai);
      this._ai = setTimeout(local, 450);
    }
  }
  aiRespond(raw) {
    const D = this.data(), X = this.more();
    const n = (x) => (x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const q = n(raw);
    const has = (re) => re.test(q);
    const act = (label, run) => ({ label, run });
    const eur = (v) => (v % 1 === 0 ? String(v) : v.toFixed(2).replace('.', ',')) + ' €';
    const sportOf = () => has(/basket/) ? 'Basketball' : has(/water|polo|redoutable/) ? 'Water-polo' : has(/rugby/) ? 'Rugby' : 'Football';
    const compName = (m) => ((X.comps[m.sport] || []).find((c) => c.id === m.comp) || { label: m.comp }).label;
    const score = (m) => (m.hs !== null && m.hs !== undefined) ? m.hs + '-' + m.as : (m.status === 'up' ? 'à venir' : 'score non communiqué');
    const name = this.state.name ? ' ' + this.state.name.split(' ')[0] : '';

    if (has(/^(bonjour|salut|hello|coucou|bonsoir|hey)\b/)) return { text: 'Bonjour' + name + ' ! Je suis Casa IA. Je peux vous donner les scores, conseiller une tenue, ouvrir la Gazette, raconter l’histoire des lieux du Cotentin ou vous guider dans le site.', actions: [act('Scores en direct', () => this.go('live', { dTab: 'live' })), act('Conseil boutique', () => this.aiAsk('Une tenue chill à moins de 60 €'))] };
    if (has(/\baide\b|que (peux|sais)|tu fais quoi|comment ca marche/)) return { text: 'Voici ce que je sais faire :\n• Scores, résultats, agenda et classements par discipline\n• Conseils boutique et ajout au panier (« ajoute le hoodie signature en M »)\n• Abonnements Casa B+ et La Gazette, ouverture d’une page précise\n• Histoire des lieux du Cotentin\n• Infos clubs, joueurs et partenaires\n• Navigation : « emmène-moi à la boutique »', actions: [] };

    if (has(/realite augmentee|\bar\b|compo|line ?up|composition|3d|selfie|photo supporter|application|appli/)) {
      if (has(/application|appli/) && !has(/compo|realite|3d/)) return { text: 'L’application Casa Besports réunit scores, Club House, Mon quotidien, la Gazette et les expériences en réalité augmentée. Elle s’installe sur l’écran d’accueil depuis le navigateur.', actions: [act('Découvrir l’application', () => this.go('app'))] };
      return { text: 'Proposez votre compo en réalité augmentée : système de jeu, noms des joueurs, capitaine, terrain posé sur votre table, puis publication au Club House.', actions: [act('Ma compo en AR', () => this.openAR('lineup')), act('Toutes les expériences', () => this.openAR('hub'))] };
    }
    // partenaire OlistO
    if (has(/olisto|credit|pret immo|emprunt|regroup|rachat de|assurance emprunteur|projet immobilier|immobilier|courtier|mensualite/)) return { text: 'Notre partenaire OlistO, réseau de courtage, accompagne les projets immobiliers, le regroupement de crédits et l’assurance emprunteur. Vous pouvez simuler une mensualité et votre taux d’endettement, puis demander à être rappelé.\nUn crédit vous engage et doit être remboursé. Vérifiez vos capacités de remboursement avant de vous engager.', actions: [act('Simuler avec OlistO', () => this.go('olisto'))] };
    // club house
    if (has(/club ?house|clubhouse|communaute|forum|annonce|benevol.*cherche|sondage|carte membre|mes points|fidelite|classement des membres|evenement|covoit/)) {
      if (has(/covoit/)) return { text: 'Le covoiturage pour les matchs se trouve au Club House, rubrique Annonces & entraide.', actions: [act('Voir les trajets', () => this.go('clubhouse', { chTab: 'annonces', chAdCat: 'Covoiturage' }))] };
      if (has(/annonce|benevol/)) return { text: 'Petites annonces du Club House : matériel, bénévolat, joueurs, stages et covoiturage.', actions: [act('Voir les annonces', () => this.go('clubhouse', { chTab: 'annonces' }))] };
      if (has(/evenement/)) { const ev = this.chData().events; return { text: 'Prochains rendez-vous du Club House :\n' + ev.map((e) => '• ' + e.title + ' — ' + e.date.split('-').reverse().slice(0, 2).join('/') + ' à ' + e.time).join('\n'), actions: [act('Voir les événements', () => this.go('clubhouse', { chTab: 'events' }))] }; }
      if (has(/point|carte|fidelite|classement/)) return { text: 'Vos points se gagnent en pronostiquant, en votant, en participant aux événements et en publiant. Ils déterminent votre niveau : Supporter, Fidèle, Ultra, Légende.', actions: [act('Ma carte membre', () => this.go('clubhouse', { chTab: 'carte' })), act('Classement', () => this.go('clubhouse', { chTab: 'ligue' }))] };
      return { text: 'Le Club House réunit le fil de la communauté, les annonces et l’entraide, les événements, le classement des membres et votre carte de membre.', actions: [act('Entrer au Club House', () => this.go('clubhouse'))] };
    }
    // culture
    if (has(/culture|musee|exposition|\bexpo\b|oeuvre|match du port|\bart\b|parcours|balade|visite|millet|theatre|trident|concours photo/)) {
      const CU = this.culture();
      if (has(/parcours|balade|courir|velo|randonn/)) return { text: 'Parcours sport & patrimoine :\n' + CU.routes.map((r) => '• ' + r.name + ' (' + r.sport + ', ' + r.area + ')').join('\n'), actions: [act('Voir les parcours', () => this.go('culture', { cuTab: 'parcours' }))] };
      if (has(/concours|photo|vote/)) return { text: 'Le concours « Regards sur le sport local » est ouvert : votez pour vos images préférées ou proposez la vôtre.', actions: [act('Aller au concours', () => this.go('culture', { cuTab: 'concours' }))] };
      if (has(/musee|visite|theatre|trident|millet|lieu/)) return { text: 'Lieux de culture de la Manche :\n' + CU.venues.slice(0, 6).map((v) => '• ' + v.name + ' — ' + v.city).join('\n'), actions: [act('Voir les lieux', () => this.go('culture', { cuTab: 'lieux' }))] };
      return { text: 'L’exposition Casa Besports compte quatre salles : le tableau « Le match du port », les Lieux de légende, la photographie du terrain et le design textile.', actions: [act('Visiter l’exposition', () => this.go('culture', { cuTab: 'expo' })), act('Œuvre du jour', () => this.setState({ workIdx: new Date().getDate() % CU.flat.length, aiOpen: false }))] };
    }
    // météo
    if (has(/meteo|quel temps|pluie|pleuvoir|vent|temperature|soleil|averse/)) {
      const cities = ['Cherbourg', 'Beaumont-Hague', 'Valognes', 'Barfleur', 'Barneville-Carteret', 'Carentan', 'Saint-Lo', 'Avranches'];
      const ci = cities.find((c) => q.includes(n(c).replace(/-/g, ' ').split(' ')[0]));
      const city = ci ? (ci === 'Saint-Lo' ? 'Saint-Lô' : ci) : this.state.wxCity || 'Cherbourg';
      const Wc = (this.state.wxLive || {})[city] || this.wxDemo(city);
      if (!Wc.live) { this.fetchWeather(city); return { text: 'Les prévisions pour ' + city + ' ne sont pas encore chargées. Réessayez dans un instant.', actions: [act('Ouvrir la météo', () => this.go('meteo'))] }; }
      const [lab] = this.wxIcon(Wc.cur.code); const d1 = Wc.days[1]; const [lab1] = this.wxIcon(d1.code);
      return { text: 'Météo à ' + city + (Wc.live ? '' : ' (estimation)') + ' : ' + lab.toLowerCase() + ', ' + Wc.cur.t + '°, vent ' + Wc.cur.wind + ' km/h.\nDemain : ' + lab1.toLowerCase() + ', ' + d1.min + '° à ' + d1.max + '°, pluie ' + d1.pp + ' %.', actions: [act('Prévisions détaillées', () => { this.setState({ wxCity: city }); this.go('meteo'); })] };
    }
    // espace privé
    const lm = q.match(/ajoute(?:r)?\s+(.+?)\s+(?:a|dans)\s+(?:ma|la|mes)\s+(?:liste\s+de\s+)?(courses|sac|taches|liste)/);
    if (lm) {
      if (!this.state.loggedIn) return { text: 'Connectez-vous pour utiliser vos listes personnelles.', actions: [act('Se connecter', () => this.setState({ loginOpen: true }))] };
      const lk = lm[2] === 'sac' ? 'sac' : lm[2] === 'taches' ? 'todo' : 'courses';
      const label = raw.trim().split(/\s+/).slice(1).join(' ').replace(/\s+(à|a|dans)\s+(ma|la|mes)\s+.*$/i, '');
      const P0 = this.priv();
      this.setPriv({ lists: Object.assign({}, P0.lists, { [lk]: P0.lists[lk].concat([{ id: Math.random().toString(36).slice(2, 9), text: label.charAt(0).toUpperCase() + label.slice(1), done: false }]) }) });
      return { text: '« ' + label + ' » ajouté à votre liste ' + (lk === 'sac' ? 'Sac de sport' : lk === 'todo' ? 'À faire' : 'Courses') + '.', actions: [act('Voir la liste', () => { this.setState({ pvTab: 'listes', pvList: lk }); this.go('private'); })] };
    }
    if (has(/quotidien|mon agenda|mes notes|ma liste|budget|covoiturage|covoit|certificat|mes documents|activite/)) return { text: 'Votre espace privé « Mon quotidien » regroupe agenda, listes, notes, covoiturage, budget sport, documents et suivi d’activité.', actions: [act('Ouvrir Mon quotidien', () => this.go('private'))] };
    // ajout au panier
    const prodMatch = () => {
      const keys = [['hoodie signature', 'hoodie-signature'], ['signature', 'hoodie-signature'], ['cotentin sport', 'hoodie-csc'], ['csc', 'hoodie-csc'], ['vestiaire', 'crew-vestiaire'], ['sweat', 'crew-vestiaire'], ['phare', 'tee-phare'], ['rade', 'tee-rade'], ['maillot', 'maillot-retro'], ['veste', 'veste-tribune'], ['survet', 'veste-tribune'], ['jogger', 'jogger'], ['jogging', 'jogger'], ['short', 'short-isles'], ['bob', 'bob'], ['casquette', 'casquette'], ['du ballon', 'tee-identitaire'], ['identitaire', 'tee-identitaire'], ['marin', 'pull-marin'], ['tote', 'tote'], ['sac', 'tote'], ['echarpe', 'echarpe'], ['mug', 'mug'], ['gourde', 'gourde'], ['affiche', 'affiche'], ['poster', 'affiche'], ['sticker', 'stickers'], ['porte-cle', 'porte-cles'], ['carte cadeau', 'carte-cadeau'], ['hoodie', 'hoodie-signature'], ['t-shirt', 'tee-phare'], ['tee', 'tee-phare']];
      const f = keys.find(([k]) => q.includes(k));
      return f ? X.products.find((p) => p.id === f[1]) : null;
    };
    if (has(/\b(ajoute|ajouter|mets|achete|commande|prends)\b/)) {
      const p = prodMatch();
      if (p) {
        const sm = q.match(/\b(xxl|xl|xs|s|m|l|a3|a2)\b(?!\w)/);
        const size = p.sizes ? (sm ? p.sizes.find((z) => n(z) === sm[1]) : null) : null;
        if (p.sizes && !size) return { text: 'Quelle taille pour « ' + p.name + ' » (' + eur(p.price) + ') ?', actions: p.sizes.map((z) => act(z, () => { this.addLine(p, 0, z, 1, ''); this.aiPush({ role: 'bot', text: '« ' + p.name + ' » en ' + z + ' est dans votre panier.', actions: [act('Voir le panier', () => this.setState({ cartOpen: true }))] }); })) };
        this.addLine(p, 0, size, 1, '');
        return { text: 'C’est fait : « ' + p.name + ' »' + (size ? ' en ' + size : '') + ' a été ajouté au panier.', actions: [act('Voir le panier', () => this.setState({ cartOpen: true })), act('Continuer mes achats', () => this.go('shop'))] };
      }
    }
    // navigation
    const pagesMap = [['boutique|shop|magasin', 'shop', 'Boutique'], ['tableau de bord|dashboard', 'home', 'l’accueil'], ['terrain', 'live', 'Le Terrain'], ['actu|article|news', 'news', 'Actualités'], ['video', 'videos', 'Vidéos'], ['club', 'clubs', 'Clubs'], ['joueur', 'players', 'Joueurs'], ['discipline|sport', 'disciplines', 'Disciplines'], ['carte|territoire', 'map', 'Territoire'], ['abonnement|offre', 'offers', 'Abonnements'], ['partenaire|sponsor', 'partners', 'Partenaires'], ['contact|ecrire', 'contact', 'Contact'], ['propos|histoire de casa', 'about', 'À propos'], ['panier', 'cart', 'Panier'], ['espace|compte', 'account', 'Mon espace'], ['redaction|studio|relecture', 'studio', 'Espace rédaction'], ['club ?house|communaute', 'clubhouse', 'le Club House'], ['culture|musee|exposition', 'culture', 'Culture'], ['meteo|temps', 'meteo', 'Météo'], ['quotidien|agenda|liste', 'private', 'Mon quotidien'], ['curriculum|mon cv|\\bcv\\b', 'cv', 'votre CV'], ['certificat|verifier', 'verifier', 'la vérification des certificats'], ['accueil|home', 'home', 'Accueil']];
    if (has(/\b(ouvre|ouvrir|va |aller|emmene|montre|affiche|direction|navigue)/)) {
      if (has(/gazette|mag/)) { const pm = q.match(/page\s*(\d+)/); const pg = pm ? Math.min(this.gazette().pages.length, Math.max(1, +pm[1])) - 1 : 0; this.setState({ aiOpen: false }); this.gzGo(pg); return { text: 'J’ouvre La Gazette du Cotentin' + (pm ? ' à la page ' + (pg + 1) : '') + '.', actions: [] }; }
      const m = pagesMap.find(([re]) => new RegExp(re).test(q));
      if (m) {
        if (m[1] === 'cart') { this.setState({ cartOpen: true }); return { text: 'Voici votre panier.', actions: [] }; }
        if (m[1] === 'studio' && !this.state.role) return { text: 'L’espace rédaction est réservé à l’équipe. Connectez-vous en tant qu’administrateur ou rédacteur.', actions: [act('Se connecter', () => this.setState({ loginOpen: true }))] };
        this.go(m[1]); return { text: 'Direction ' + m[2] + '.', actions: [] };
      }
    }
    // Gazette
    if (has(/detail choc/)) { const ci = this.gazette().idx('choc'); this.setState({ aiOpen: false }); this.gzGo(ci); return { text: 'Voici le détail choc du numéro, page ' + (ci + 1) + ' : en 2012, un club normand de troisième division a joué la finale de la Coupe de France.', actions: [] }; }
    if (has(/gazette|magazine|\bmag\b/)) {
      const pm = q.match(/page\s*(\d+)/);
      if (pm) { const pg = Math.min(this.gazette().pages.length, Math.max(1, +pm[1])) - 1; this.gzGo(pg); return { text: 'Page ' + (pg + 1) + ' : « ' + this.gazette().pages[pg].title + ' ».', actions: [] }; }
      return { text: 'La Gazette du Cotentin existe en 3 formules :\n• Numérique : 3,99 € / mois\n• Papier : 6,90 € / mois\n• Papier + numérique : 8,90 € / mois\nUn numéro d’essai complet de ' + this.gazette().pages.length + ' pages est lisible gratuitement, avec son « détail choc ».', actions: [act('Lire le numéro d’essai', () => this.setState({ readerOpen: true, page: 0 })), act('S’abonner', () => this.go('offers', { offerTab: 'La Gazette' }))] };
    }
    // scores en direct
    if (has(/direct|live|en cours|score/) && !has(/classement/)) {
      const live = X.matches.filter((m) => m.status === 'live');
      if (live.length) return { text: 'En direct :\n' + live.map((m) => '• ' + m.home + ' ' + score(m) + ' ' + m.away + ' — ' + compName(m)).join('\n'), actions: [act('Ouvrir le Terrain', () => this.go('live', { dTab: 'live' }))] };
      return { text: 'Aucun match en direct pour le moment.', actions: [act('Voir l’agenda', () => this.go('live', { dTab: 'agenda' }))] };
    }
    // classement
    if (has(/classement|leader|premier|en tete|tete du/)) {
      const sp = sportOf(); const comp = sp === 'Basketball' ? 'pnm' : sp === 'Water-polo' ? 'cdm' : 'r2';
      const tb = X.tables[comp];
      if (!tb) return { text: 'Pas de classement disponible pour ' + sp + '.', actions: [] };
      return { text: 'Classement ' + compName({ sport: sp, comp }) + ' :\n' + tb.slice(0, 3).map((r, i) => (i + 1) + '. ' + r.team + ' — ' + r.pts + ' pts').join('\n'), actions: [act('Classement complet', () => this.go('live', { dSport: sp, dComp: comp, dTab: 'table' }))] };
    }
    if (has(/resultat|dernier match|score final|gagne|perdu/)) {
      const sp = sportOf();
      const done = X.matches.filter((m) => m.sport === sp && m.status === 'done').sort((a, b) => (a.verified === b.verified ? (a.date > b.date ? -1 : 1) : a.verified ? -1 : 1)).slice(0, 4);
      return { text: 'Derniers résultats ' + sp + ' :\n' + done.map((m) => '• ' + m.home + ' ' + score(m) + ' ' + m.away + '').join('\n'), actions: [act('Tous les résultats', () => this.go('live', { dSport: sp, dComp: (X.comps[sp] || [{}])[0].id, dTab: 'results' }))] };
    }
    if (has(/prochain|agenda|quand|calendrier|programme|ce week/)) {
      if (has(/pointe|hague|avranches|coupe/)) return { text: 'ES Pointe-Hague – US Avranches, 4e tour de la Coupe de France, à Beaumont-Hague. La date et l’heure restent à confirmer.', actions: [act('Activer un rappel', () => { this.toggleIn('reminders', 'm-cfa-avranches', 'Rappel activé', 'Rappel retiré'); }), act('Pronostiquer', () => this.setState({ matchId: 'm-cfa-avranches', aiOpen: false }))] };
      const sp = sportOf();
      const up = X.matches.filter((m) => m.sport === sp && m.status === 'up' && m.date).sort((a, b) => a.date < b.date ? -1 : 1).slice(0, 4);
      return { text: 'Prochains matchs ' + sp + ' :\n' + up.map((m) => '• ' + m.date.split('-').reverse().slice(0, 2).join('/') + ' à ' + m.time + ' : ' + m.home + ' – ' + m.away).join('\n'), actions: [act('Ouvrir l’agenda', () => this.go('live', { dSport: sp, dComp: (X.comps[sp] || [{}])[0].id, dTab: 'agenda' }))] };
    }
    const pl = D.players.find((p) => { const parts = n(p.name).split(' '); return parts.some((w) => w.length >= 5 && new RegExp('\\b' + w + '\\b').test(q)); });
    if (pl) return { text: pl.name + ' — n° ' + pl.num + ', ' + pl.role + ' · ' + pl.clubLabel + '.', actions: [act('Voir le profil', () => this.go('player', { playerId: pl.id }))] };
    // lieux et histoire
    const placeKeys = [['\\brade\\b|\\broule\\b|louis xvi|digue|liberation de cherbourg', 'rade'], ['gatteville|phare|blanche|barfleur|1120', 'gatteville'], ['jobourg|hague|prevert|falaise', 'jobourg'], ['sainte|mere|1944|parachut|steele|debarquement', 'sme'], ['titanic|gare maritime|cite de la mer|paquebot', 'gare']];
    const pk = placeKeys.find(([re]) => new RegExp(re).test(q));
    if (pk && !has(/club|joueur/)) {
      const p = X.places.find((x) => x.id === pk[1]);
      return { text: p.name + ' — ' + p.desc + '\n\nMoment d’histoire (' + p.year + ') : ' + p.moment, actions: [act('Voir la fiche du lieu', () => this.setState({ placeOpen: true, placeIdx: X.places.indexOf(p), aiOpen: false })), act('En fond d’écran', () => this.setState({ placeOverride: p.id }))] };
    }
    if (has(/histoire|lieu|patrimoine|visiter|tourisme/)) return { text: 'Six lieux de légende accompagnent le site : la rade de Cherbourg, le phare de Gatteville, le Mont-Saint-Michel, le Nez de Jobourg, Sainte-Mère-Église et la Gare maritime. Lequel vous intéresse ?', actions: X.places.map((p) => act(p.short, () => this.aiAsk(p.short))) };
    // boutique : conseil
    if (has(/hoodie|sweat|tee|t-shirt|tshirt|maillot|casquette|bob|short|jogger|jogging|veste|pull|tote|boutique|cadeau|offrir|tenue|chill|style|vetement|habit|look|porter/)) {
      const bm = q.match(/(\d+)\s*(€|e\b|euro)/); const budget = bm ? +bm[1] : null;
      let pool = X.products.slice();
      if (has(/chill|cosy|confort|canape|detente/)) pool = pool.filter((p) => ['hoodie-signature', 'crew-vestiaire', 'jogger', 'tee-rade', 'bob', 'hoodie-csc'].indexOf(p.id) >= 0);
      else if (has(/sport|running|footing|entrainement|match/)) pool = pool.filter((p) => ['maillot-retro', 'veste-tribune', 'short-isles', 'jogger', 'gourde'].indexOf(p.id) >= 0);
      else if (has(/cadeau|offrir|noel|anniversaire/)) pool = pool.filter((p) => ['carte-cadeau', 'tee-identitaire', 'affiche', 'mug', 'echarpe', 'hoodie-signature'].indexOf(p.id) >= 0);
      else if (has(/cherwood|local|cherbourg/)) pool = pool.filter((p) => p.line === 'cherwood');
      else { const pm = prodMatch(); if (pm) pool = [pm].concat(pool.filter((p) => p.type === pm.type && p.id !== pm.id)); }
      if (budget) pool = pool.filter((p) => p.price <= budget);
      pool = pool.sort((a, b) => a.pop - b.pop).slice(0, 3);
      if (!pool.length) return { text: 'Rien ne correspond à ce budget. Les goodies commencent à 6 € et la carte cadeau à 20 €.', actions: [act('Voir les goodies', () => this.go('shop', { shopLine: 'Goodies' }))] };
      return { text: 'Ma sélection' + (budget ? ' à moins de ' + budget + ' €' : '') + ' :\n' + pool.map((p) => '• ' + p.name + ' — ' + eur(p.price)).join('\n') + (this.state.subs.casab ? '\nRemise abonné −10 % appliquée au panier.' : ''), actions: pool.map((p) => act('Voir ' + p.name.split(' «')[0], () => this.go('product', { productId: p.id, color: 0, size: null, qty: 1, persoName: '', persoNum: '' }))) };
    }
    if (has(/abonn|casa b|premium|tarif|prix|pack/)) return { text: 'Les formules :\n• Casa B+ : 4,99 € / mois (articles Premium, alertes, −10 % boutique)\n• La Gazette : dès 3,99 € / mois\n• Pack Supporter : 11,90 € / mois (tout compris)\nEn annuel, deux mois sont offerts.', actions: [act('Comparer les offres', () => this.go('offers'))] };
    if (has(/partenaire|sponsor|avantage/)) return { text: 'Nos partenaires :\n' + X.partners.map((p) => '• ' + p.name + ' — ' + p.perk).join('\n'), actions: [act('Voir les partenaires', () => this.go('partners'))] };
    if (has(/redaction|relecture|relire|valider|publier|admin|brouillon/)) {
      if (!this.state.role) return { text: 'L’espace rédaction est réservé à l’équipe.', actions: [act('Se connecter', () => this.setState({ loginOpen: true }))] };
      const pend = this.posts().filter((p) => p.status === 'review');
      return { text: pend.length + ' article(s) en attente de relecture' + (pend.length ? ' :\n' + pend.map((p) => '• ' + p.title + ' (' + p.author + ')').join('\n') : '.'), actions: [act('Ouvrir la relecture', () => this.go('studio', { studioTab: 'queue' }))] };
    }
    // clubs
    const club = D.clubs.find((c) => { const k = n(c.name).replace(/^(as|es|fc|cs|us|uc|sc|pl|uson|ust)\s/, ''); return k.length > 3 && (q.includes(k) || k.split(' ').some((w) => w.length >= 6 && q.includes(w))); });
    if (club) {
      const mm = X.matches.filter((m) => X.teamClub[m.home] === club.id || X.teamClub[m.away] === club.id);
      return { text: club.name + ' — ' + club.sport + ', ' + club.city + '.' + (mm.length ? '\n' + mm.length + ' match(s) référencé(s) dans le Terrain.' : ''), actions: [act('Fiche du club', () => this.go('club', { clubId: club.id, clubTab: 'articles' })), act('Suivre', () => this.toggleIn('follows', club.id, 'Vous suivez ' + club.name, 'Vous ne suivez plus ' + club.name))] };
    }
    // articles
    const words = q.split(/[^a-z0-9]+/).filter((w) => w.length >= 5);
    let best = null, bestScore = 0;
    this.allArticles().forEach((a) => { const hay = n(a.title + ' ' + a.dek + ' ' + a.tag); const sc = words.filter((w) => hay.includes(w)).length; if (sc > bestScore) { best = a; bestScore = sc; } });
    if (best && bestScore > 0) return { text: '« ' + best.title + ' »\n' + (best.points || []).map((x) => '• ' + x).join('\n'), actions: [act('Lire l’article', () => this.go('article', { articleId: best.id }))] };
    return { text: 'Je n’ai pas trouvé de réponse précise. Essayez par exemple : « classement basket », « un cadeau à moins de 30 € », « histoire du phare de Gatteville » ou « ouvre la Gazette page 12 ».', actions: [act('Scores en direct', () => this.go('live', { dTab: 'live' })), act('Boutique', () => this.go('shop'))] };
  }
  allArticles() {
    const D = this.data();
    const pub = this.posts().filter((p) => p.status === 'published' || p.online).map((p) => this.postToArticle(p.status === 'published' || !p.online ? p : Object.assign({}, p, p.online, { id: p.id })));
    return pub.concat(D.articles);
  }
  postToArticle(p) {
    const words = this.textOf(p.body).split(/\s+/).filter(Boolean).length;
    return { id: p.id, sport: p.sport, tag: p.tag, date: '6 oct.', read: Math.max(1, Math.round(words / 200)) + ' min', premium: p.premium, img: p.img, alt: p.alt || p.title, title: p.title, dek: p.dek, clubs: p.clubs, points: this.sentences(this.textOf(p.body)).slice(0, 3), body: p.body, author: p.author, fromStudio: true, video: p.video && p.video.url ? p.video : null, related: p.related || [], date: p.online && p.online.at ? (typeof CasaRedac !== 'undefined' ? CasaRedac.fmtDate(p.online.at).replace(/ \d{4}$/, '') : '6 oct.') : '6 oct.' };
  }

  loadTheme() { try { const t = window.localStorage.getItem('cb-theme'); return ['auto', 'light', 'dark', 'noir', 'paper'].indexOf(t) >= 0 ? t : 'dark'; } catch (e) { return 'dark'; } }
  sysDark() { try { return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); } catch (e) { return false; } }
  profileKey() { const s = this.state; return s.role ? 'role-' + s.role : (s.email.trim().toLowerCase() || 'compte'); }
  setTheme(id, opts) {
    const o = opts || {};
    try { window.localStorage.setItem('cb-theme', id); } catch (e) {}
    try { document.documentElement.setAttribute('data-cb-theme', id); } catch (e) {}
    const saveProfile = this.state.loggedIn && !o.fromProfile;
    if (saveProfile) { try { window.localStorage.setItem('cb-profile-theme:' + this.profileKey(), id); } catch (e) {} }
    this.setState({ theme: id, themeAnim: true, themeMenuOpen: o.keepMenu ? this.state.themeMenuOpen : false });
    clearTimeout(this._th); this._th = setTimeout(() => this.setState({ themeAnim: false }), 450);
    if (!o.silent) {
      const names = { auto: 'Automatique', light: 'Clair', dark: 'Sombre', noir: 'Noir et or', paper: 'Papier journal' };
      this.say('Thème ' + names[id] + (saveProfile ? ' · enregistré dans votre profil' : ' · enregistré sur cet appareil'));
    }
  }
  applyProfileTheme(k) {
    const key = k || this.profileKey();
    let t = null; try { t = window.localStorage.getItem('cb-profile-theme:' + key); } catch (e) {}
    if (t && t !== this.state.theme) this.setTheme(t, { fromProfile: true, silent: true });
    else if (!t) { try { window.localStorage.setItem('cb-profile-theme:' + key, this.state.theme); } catch (e) {} }
  }
  // ---------- utilitaires de date ----------
  today0() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  isoOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  addDays(n) { const d = this.today0(); d.setDate(d.getDate() + n); return this.isoOf(d); }
  addMyMr(m) { if (typeof CasaCV === 'undefined') return; const P = CasaCV.prof(this); CasaCV.setProf(this, { mr: [m].concat((P.mr || []).filter((x) => x.ref !== m.ref)).slice(0, 30) }, true); }
  readLS(k, fallback) { try { const v = window.localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  writeLS(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------- accueil modulable ----------
  // Accueil épuré : 5 blocs essentiels affichés d'office, les autres rubriques sont proposées
  // dans « Personnaliser mon accueil » (abonnés connectés). [id, libellé, largeur, affiché par défaut]
  modDefs() {
    return [['une', 'Le grand bandeau : l’actu du moment', 'full', true], ['resultats', 'Résultats du week-end', 'full', true], ['portes', 'Passionné ou pro : vos accès', 'full', true], ['cherwood', 'Boutique Casa × Cherwood', 'full', true], ['gazette', 'La Gazette du mois', 'full', true],
      ['actus', 'Dernières actus', 's2', false], ['videos', 'Vidéos', 's2', false], ['rdv', 'Le prochain rendez-vous', '', false], ['table', 'Classement Régional 2', '', false], ['meteo', 'Météo', '', false], ['private', 'Mon quotidien', '', false],
      ['clubhouse', 'Club House', '', false], ['culture', 'Culture & sorties', '', false], ['oeuvre', 'Œuvre du jour', '', false], ['lieu', 'Lieu du jour', '', false], ['shop', 'Boutique : la collection', 's2', false], ['rubriques', 'Toutes les rubriques du site', 'full', false]];
  }
  defaultMods() { return this.modDefs().map((d) => ({ id: d[0], on: d[3] !== false })); }
  setMods(mods) { this.setState({ mods }); this.writeLS('cb-accueil-v2', mods); this.syncPrefs(); }
  setLayout(l) { this.setState({ homeLayout: l }); this.writeLS('cb-home-layout', l); this.syncPrefs(); }
  setFav(kind, list) { const sp = kind === 'sports'; this.setState(sp ? { favSports: list } : { favClubs: list }); this.writeLS(sp ? 'cb-fav-sports' : 'cb-fav-clubs', list); this.syncPrefs(); }
  // Couleur des arrière-plans : bgCouleur = 'nb' | 'couleur' | null (réglage du site), bgTeinte = '#rrggbb' | 'aucune' | null (réglage du site)
  setBg(patch) {
    this.setState(patch);
    if ('bgMode' in patch) this.writeLS('cb-bg-mode', patch.bgMode);
    if ('bgCouleur' in patch) this.writeLS('cb-bg-couleur', patch.bgCouleur);
    if ('bgTeinte' in patch) this.writeLS('cb-bg-teinte', patch.bgTeinte);
    this.syncPrefs();
  }
  // Préférences d'accueil gardées sur le compte de l'abonné (Supabase, données du profil) : retrouvées sur tous ses appareils
  prefsOf() { const s = this.state; return { v: 2, mods: s.mods || null, layout: s.homeLayout, sports: s.favSports || [], clubs: s.favClubs || [], bgMode: s.bgMode || null, bgCouleur: s.bgCouleur || null, bgTeinte: s.bgTeinte || null }; }
  syncPrefs() {
    if (!this.state.loggedIn || !window.CasaAuth || !window.CasaAuth.savePrefs) return;
    clearTimeout(this._prefT); this._prefT = setTimeout(() => { window.CasaAuth.savePrefs(this.prefsOf()).catch(() => {}); }, 1200);
  }
  applyPrefs(p) {
    if (!p || typeof p !== 'object') return;
    const st = {}; const put = (k, ls, v) => { st[k] = v; this.writeLS(ls, v); };
    if (Array.isArray(p.mods)) put('mods', 'cb-accueil-v2', p.mods);
    if (p.layout === 'dashboard' || p.layout === 'magazine') put('homeLayout', 'cb-home-layout', p.layout);
    if (Array.isArray(p.sports)) put('favSports', 'cb-fav-sports', p.sports.filter((x) => typeof x === 'string'));
    if (Array.isArray(p.clubs)) put('favClubs', 'cb-fav-clubs', p.clubs.filter((x) => typeof x === 'string'));
    if (['photo', 'lieux', 'aucun'].indexOf(p.bgMode) >= 0) put('bgMode', 'cb-bg-mode', p.bgMode);
    if ('bgCouleur' in p) put('bgCouleur', 'cb-bg-couleur', p.bgCouleur === 'couleur' || p.bgCouleur === 'nb' ? p.bgCouleur : null);
    if ('bgTeinte' in p) put('bgTeinte', 'cb-bg-teinte', typeof p.bgTeinte === 'string' && (p.bgTeinte === 'aucune' || /^#[0-9a-f]{6}$/i.test(p.bgTeinte)) ? p.bgTeinte : null);
    this.setState(st);
  }

  // ---------- météo ----------
  wxIcon(code) {
    const C = 'M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z';
    const C2 = 'M7 15h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 15z';
    if (code === 0) return ['Ensoleillé', 'M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0 M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4'];
    if (code <= 2) return ['Éclaircies', 'M7 19h9a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 7 19z M13 6.5a3.5 3.5 0 0 1 5.5 3.5 M16 3v1.2 M20.6 5.2l-.9.9 M22 10h-1.2'];
    if (code === 3) return ['Couvert', C];
    if (code === 45 || code === 48) return ['Brouillard', 'M4 8h16 M6 12h12 M4 16h16 M7 20h10'];
    if (code >= 95) return ['Orage', C2 + ' M13 16l-2 3h3l-2 3'];
    if (code >= 71 && code <= 77) return ['Neige', C2 + ' M9 19h.01 M13 20h.01 M17 19h.01'];
    if (code >= 80) return ['Averses', C2 + ' M9 18l-1 2 M13 18l-1 2 M17 18l-1 2'];
    if (code >= 61) return ['Pluie', C2 + ' M9 18l-1 3 M13 18l-1 3 M17 18l-1 3'];
    if (code >= 51) return ['Bruine', C2 + ' M10 19h.01 M14 19h.01'];
    return ['Variable', C];
  }
  wxDemo(city) {
    const seed = [...city].reduce((a, c) => a + c.charCodeAt(0), 0);
    const codes = [2, 80, 3, 61, 1, 63, 2];
    const days = [];
    for (let d = 0; d < 7; d++) {
      const max = 12 + ((seed + d * 3) % 5); const min = max - 3 - ((seed + d * 2) % 4);
      days.push({ date: this.addDays(d), code: codes[(seed + d) % 7], max, min, pp: [20, 70, 40, 80, 10, 90, 30][(seed + d) % 7], wind: 15 + ((seed * 3 + d * 11) % 26) });
    }
    const h0 = new Date().getHours();
    const hours = [];
    for (let i = 0; i < 12; i++) {
      const h = (h0 + i) % 24; const k = Math.sin(((h - 6) / 24) * Math.PI * 2);
      hours.push({ h, t: Math.round((days[0].min + days[0].max) / 2 + k * (days[0].max - days[0].min) / 2), code: i % 5 === 3 ? 80 : days[0].code, pp: Math.min(100, Math.max(5, days[0].pp - 10 + (i * 7) % 30)), wind: days[0].wind + (i % 4) * 2 });
    }
    const cur = { t: hours[0].t, feels: hours[0].t - Math.round(days[0].wind / 12), code: hours[0].code, wind: days[0].wind, gust: days[0].wind + 18, hum: 72 + (seed % 15), rain: days[0].pp > 60 ? 0.6 : 0, dir: 'O' };
    return { live: false, cur, hours, days, sunrise: '08:03', sunset: '19:24', waves: (0.8 + (seed % 9) / 10).toFixed(1).replace('.', ',') + ' m' };
  }
  // Recherche d'une ville dans le monde (Open-Meteo Geocoding, gratuit)
  wxSearch(q) {
    q = String(q || '').trim();
    if (q.length < 2) { this.setState({ wxRes: [], wxSearching: false }); return; }
    this.setState({ wxSearching: true });
    fetch('https://geocoding-api.open-meteo.com/v1/search?count=8&language=fr&format=json&name=' + encodeURIComponent(q)).then((r) => r.json()).then((d) => {
      const res = (d.results || []).map((r) => ({ name: r.name, region: [r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude }));
      this.setState({ wxRes: res, wxSearching: false, wxNone: res.length === 0 });
    }).catch(() => this.setState({ wxRes: [], wxSearching: false, wxNone: true }));
  }
  wxAdd(r) {
    const name = r.name;
    const list = (this.state.wxExtra || []).filter((x) => x.name !== name).concat([{ name, region: r.region, lat: r.lat, lon: r.lon }]).slice(-12);
    this.writeLS('cb-wx-extra', list); this.writeLS('cb-wx-city', name);
    this.setState({ wxExtra: list, wxCity: name, wxQ: '', wxRes: [], wxNone: false }); this.fetchWeather(name, [r.lat, r.lon]);
  }
  wxRemove(name) {
    const list = (this.state.wxExtra || []).filter((x) => x.name !== name);
    this.writeLS('cb-wx-extra', list);
    this.setState({ wxExtra: list, wxCity: this.state.wxCity === name ? 'Cherbourg' : this.state.wxCity });
  }
  fetchWeather(city, cc) {
    if (typeof window === 'undefined' || !window.CASA_WEATHER || typeof fetch !== 'function') return;
    const D = this.data(); const ex = (this.state.wxExtra || []).find((x) => x.name === city); const c = cc || (ex ? [ex.lat, ex.lon] : D.cities[city]); if (!c) return;
    const [lat, lon] = c;
    const cached = (this.state.wxLive || {})[city];
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) return;
    this.setState({ wxLoading: true });
    const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m' +
      '&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset' +
      '&timezone=auto&forecast_days=7';
    const um = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + lat + '&longitude=' + lon + '&current=wave_height';
    Promise.all([fetch(u).then((r) => r.json()), fetch(um).then((r) => r.ok ? r.json() : null).catch(() => null)]).then(([w, m]) => {
      const nowIdx = Math.max(0, w.hourly.time.findIndex((t) => new Date(t) >= new Date(Date.now() - 3600000)));
      const hours = w.hourly.time.slice(nowIdx, nowIdx + 12).map((t, i) => ({ h: new Date(t).getHours(), t: Math.round(w.hourly.temperature_2m[nowIdx + i]), code: w.hourly.weather_code[nowIdx + i], pp: w.hourly.precipitation_probability[nowIdx + i] || 0, wind: Math.round(w.hourly.wind_speed_10m[nowIdx + i]) }));
      const days = w.daily.time.map((t, i) => ({ date: t, code: w.daily.weather_code[i], max: Math.round(w.daily.temperature_2m_max[i]), min: Math.round(w.daily.temperature_2m_min[i]), pp: w.daily.precipitation_probability_max[i] || 0, wind: Math.round(w.daily.wind_speed_10m_max[i]) }));
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
      const cc = w.current;
      const data = { live: true, at: Date.now(), cur: { t: Math.round(cc.temperature_2m), feels: Math.round(cc.apparent_temperature), code: cc.weather_code, wind: Math.round(cc.wind_speed_10m), gust: Math.round(cc.wind_gusts_10m), hum: Math.round(cc.relative_humidity_2m), rain: cc.precipitation, dir: dirs[Math.round(cc.wind_direction_10m / 45) % 8] },
        hours, days, sunrise: (w.daily.sunrise[0] || '').slice(11, 16), sunset: (w.daily.sunset[0] || '').slice(11, 16),
        waves: m && m.current && m.current.wave_height != null ? String(m.current.wave_height).replace('.', ',') + ' m' : '—' };
      this.setState({ wxLive: Object.assign({}, this.state.wxLive, { [city]: data }), wxLoading: false });
    }).catch(() => this.setState({ wxLoading: false }));
  }

  // ---------- espace privé ----------
  privKey() { return 'cb-private:' + this.profileKey(); }
  privSeed() {
    // Espace privé « Mon quotidien » : vide au départ, chacun le remplit
    return {
      events: [], lists: { courses: [], sac: [], todo: [] },
      notes: [{ id: 'n1', title: 'Mes notes', text: '' }],
      rides: [], budget: [], docs: [], sessions: [], contacts: [],
      goal: 150, noteId: 'n1', meals: {}, habits: [], recurs: [],
      members: [{ id: 'me', name: 'Moi', role: '', color: '#0f2236' }]
    };
  }
  priv() {
    if (this.state.priv && this.state.privFor === this.privKey()) return this.state.priv;
    const k = this.privKey();
    if (!this._pc || this._pc.k !== k) {
      const stored = this.readLS(k, null); const seed = this.privSeed();
      const v = stored ? Object.assign({}, stored) : seed;
      ['meals', 'habits', 'recurs', 'members'].forEach((f) => { if (!(f in v)) v[f] = seed[f]; });
      this._pc = { k, v };
    }
    return this._pc.v;
  }
  setPriv(patch) {
    const v = Object.assign({}, this.priv(), patch);
    this._pc = { k: this.privKey(), v };
    this.setState({ priv: v, privFor: this.privKey() });
    this.writeLS(this.privKey(), v);
  }

  // ---------- culture : données ----------
  culture() {
    if (this._cu) return this._cu;
    const B = (id) => (window.ASSET_DATA[BLOB_FILES[id]] || ('assets/' + (BLOB_FILES[id] || id)));
    const X = this.more();
    const placeW = X.places.map((p) => ({ title: p.name, author: 'Casa Besports', year: '2026', technique: 'Illustration vectorielle · série « Lieux de légende »', img: p.img, alt: 'Illustration : ' + p.name, ratio: '16 / 9', fit: 'cover', bg: '#f3ead6', scope: '',
      text: p.hook + ' ' + p.moment, kind: 'place', placeId: p.id }));
    const rooms = [
      { n: '1', title: 'Le tableau', intro: 'L’œuvre qui a donné son visage à Casa Besports.', min: '320px', works: [
        { title: 'Le match du port', author: 'Virtuoza · Collection Casa Besports', year: 'Œuvre créée avec l’IA', technique: 'Création numérique avec l’IA · format portrait', img: B('0855c8136dcdda770cb476333ba7ad46'), alt: 'Partie de football sur les quais, devant des paquebots', ratio: '2 / 3', fit: 'cover', bg: '#1a1a1a', scope: '',
          text: 'Une partie de football improvisée sur les pavés d’un quai, entre grues, caisses et cheminées de paquebots. La scène condense ce que Casa Besports raconte chaque semaine : le jeu au cœur de la vie populaire et portuaire du Cotentin. Elle est disponible en affiche d’art à la boutique.', kind: 'poster' }] },
      { n: '2', title: 'Lieux de légende', intro: 'Les paysages du territoire, chacun lié à un moment d’histoire.', min: '300px', works: [] },
      { n: '3', title: 'Photographie du terrain', intro: 'Le sport amateur saisi au plus près, par la photothèque de la rédaction.', min: '280px', works: [] },
      { n: '4', title: 'Design textile', intro: 'Quand l’identité visuelle devient vêtement.', min: '240px', works: [] }
    ];
    // Œuvres ajoutées : contenus/culture.js ({ salle: '2', title, author, year, technique, img, alt, text })
    ((typeof window !== 'undefined' && window.CASA_CULTURE) || []).forEach((w) => { const r = rooms.find((x) => x.n === String(w.salle || '2')); if (r && w.img) r.works.push(Object.assign({ author: 'Casa Besports', year: '', technique: '', alt: w.title || '', ratio: '4 / 3', fit: 'cover', bg: '#111', text: '' }, w)); });
    const flat = [];
    rooms.forEach((r) => r.works.forEach((w, i) => flat.push(Object.assign({}, w, { room: r.n, pos: String(i + 1) }))));
    const routes = [
      { id: 'rade', name: 'La boucle de la rade', sport: 'Course à pied', area: 'Cherbourg-en-Cotentin', level: 'Accessible', city: 'Cherbourg', img: B('37f0accd200070c08850e6289a7929b2'),
        desc: 'Une boucle urbaine entre mer et colline : la gare maritime, les quais et la montée vers le fort du Roule.', steps: [['Gare maritime', 'la Cité de la Mer, escale du Titanic en 1912'], ['Les quais', 'face à la plus grande rade artificielle du monde'], ['Montagne du Roule', 'montée vers le musée de la Libération']] },
      { id: 'hague', name: 'Sentier des douaniers', sport: 'Trail', area: 'La Hague', level: 'Exigeant', city: 'Beaumont-Hague', img: B('68220997b900b01cc4ef65a2529b0ff1'),
        desc: 'Le littoral sauvage de la Hague par le sentier côtier (GR223), entre falaises, criques et villages de pêcheurs.', steps: [['Nez de Jobourg', 'falaises parmi les plus hautes d’Europe'], ['Sentier du littoral (GR223)', 'l’ancien chemin des douaniers'], ['Omonville-la-Petite', 'le village où vécut Jacques Prévert']] },
      { id: 'saire', name: 'Du port au phare', sport: 'Vélo · marche', area: 'Val de Saire', level: 'Accessible', city: 'Barfleur', img: B('f46b43bf0cb05c3fde4cba8ae7d9c8d5'),
        desc: 'De Barfleur à la pointe de Gatteville, sur les traces du naufrage de la Blanche-Nef.', steps: [['Barfleur', 'port normand au large duquel sombra la Blanche-Nef en 1120'], ['Pointe de Barfleur', 'le littoral et ses récifs'], ['Phare de Gatteville', '75 m, allumé en 1835']] },
      { id: 'juin', name: 'Mémoire du 6 juin', sport: 'Vélo', area: 'Centre Cotentin', level: 'Modéré', city: 'Carentan', img: B('66637b2212fc497ace187dc8cf592255'),
        desc: 'Un itinéraire du souvenir entre le bourg des parachutistes et la plage du Débarquement.', steps: [['Sainte-Mère-Église', 'les parachutistes de la 82e division aéroportée'], ['Les marais du Cotentin', 'routes de campagne et chemins'], ['Utah Beach', 'plage du Débarquement du 6 juin 1944']] }
    ];
    const venues = [
      ['Cité de la Mer', 'Musée', 'Cherbourg-en-Cotentin', 'Installée dans l’ancienne gare maritime transatlantique, elle est consacrée à l’exploration des océans ; on y visite notamment le sous-marin Le Redoutable.', 'gare'],
      ['Musée de la Libération', 'Musée', 'Cherbourg-en-Cotentin', 'Au sommet de la Montagne du Roule, dans le fort, il retrace la libération de Cherbourg et de la Normandie en 1944.', 'rade'],
      ['Musée Thomas-Henry', 'Musée', 'Cherbourg-en-Cotentin', 'Le musée des beaux-arts de Cherbourg conserve notamment un ensemble d’œuvres de Jean-François Millet, enfant de la Hague.', null],
      ['Le Trident', 'Spectacle', 'Cherbourg-en-Cotentin', 'Scène nationale de Cherbourg-en-Cotentin : théâtre, danse, musique et cirque tout au long de la saison.', null],
      ['Maison natale de Jean-François Millet', 'Patrimoine', 'Gréville-Hague', 'Au hameau de Gruchy, la maison où naquit en 1814 le peintre de L’Angélus et des Glaneuses.', 'jobourg'],
      ['Airborne Museum', 'Musée', 'Sainte-Mère-Église', 'Consacré aux parachutistes américains largués sur le Cotentin dans la nuit du 5 au 6 juin 1944.', 'sme'],
      ['Phare de Gatteville', 'Patrimoine', 'Gatteville-le-Phare', 'Le deuxième plus haut phare de France, 75 mètres face au raz de Barfleur.', 'gatteville'],
      ['Abbaye du Mont-Saint-Michel', 'Patrimoine', 'Le Mont-Saint-Michel', 'Chef-d’œuvre de l’architecture médiévale, inscrit au patrimoine mondial de l’Unesco depuis 1979.', null],
      ['Scriptorial d’Avranches', 'Musée', 'Avranches', 'Il présente les manuscrits médiévaux de l’abbaye du Mont-Saint-Michel.', null]
    ].map(([name, kind, city, desc, placeId]) => ({ name, kind, city, desc, placeId }));
    const entries = [
    ].map(([title, id, author, base], i) => ({ id: 'e' + i, title, img: B(id), author, base }));
    this._cu = { rooms, flat, routes, venues, entries };
    return this._cu;
  }
  nextSaturday() { const d = this.today0(); const add = (6 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add); return this.isoOf(d); }
  planEvent(title, date, time, cat, place) {
    if (!this.state.loggedIn) { this.setState({ loginOpen: true, linkSent: false }); this.say('Connectez-vous pour utiliser votre agenda'); return; }
    const P0 = this.priv();
    this.setPriv({ events: P0.events.concat([{ id: Math.random().toString(36).slice(2, 9), title, date, time, cat, place: place || '', who: 'me' }]) });
    this.say('Ajouté à Mon quotidien · ' + date.split('-').reverse().join('/'));
  }

  // ---------- minuteur de fractionné ----------
  tmStart() {
    clearInterval(this._tmI);
    const s = this.state;
    if (s.tmPhase === 'ready' || s.tmPhase === 'done') this.setState({ tmPhase: 'work', tmLeft: s.tmWork, tmRound: 1 });
    this.setState({ tmRunning: true });
    this._tmI = setInterval(() => this.tmTick(), 1000);
  }
  tmPause() { clearInterval(this._tmI); this.setState({ tmRunning: false }); }
  tmReset() { clearInterval(this._tmI); this.setState({ tmRunning: false, tmPhase: 'ready', tmLeft: this.state.tmWork, tmRound: 1 }); }
  tmTick() {
    const s = this.state;
    if (s.tmLeft > 1) { this.setState({ tmLeft: s.tmLeft - 1 }); return; }
    if (s.tmPhase === 'work' && s.tmRest > 0 && s.tmRound < s.tmRounds) { this.setState({ tmPhase: 'rest', tmLeft: s.tmRest }); return; }
    if (s.tmRound < s.tmRounds) { this.setState({ tmPhase: 'work', tmLeft: s.tmWork, tmRound: s.tmRound + 1 }); return; }
    clearInterval(this._tmI);
    this.setState({ tmRunning: false, tmPhase: 'done', tmLeft: 0 });
    const mins = Math.max(1, Math.round((s.tmWork * s.tmRounds + s.tmRest * (s.tmRounds - 1)) / 60));
    if (this.state.loggedIn) { const P0 = this.priv(); this.setPriv({ sessions: P0.sessions.concat([{ id: Math.random().toString(36).slice(2, 9), date: this.addDays(0), sport: 'Fractionné', min: mins, feel: 'Difficile' }]) }); }
    this.say('Séance terminée · ' + mins + ' min ajoutées à votre activité');
  }
  recurNext(r, fromIso) {
    const d = new Date(fromIso + 'T00:00:00');
    for (let i = 0; i < 62; i++) {
      const ok = r.freq === 'day' || (r.freq === 'week' && d.getDay() === +r.dow) || (r.freq === 'month' && d.getDate() === +r.dom);
      if (ok) return this.isoOf(d);
      d.setDate(d.getDate() + 1);
    }
    return fromIso;
  }

  // ---------- Club House : données (démo, enregistrées sur l’appareil) ----------
  chData() {
    if (this._ch) return this._ch;
    const stored = this.readLS('cb-clubhouse-v3', null);
    if (stored && stored.posts) { this._ch = stored; return stored; }
    const d = (n) => this.addDays(n);
    this._ch = {
      posts: [
        { id: 's1', author: 'La rédaction', staff: true, room: 'Général', time: 'épinglé', text: ((window.CASA_CLUBHOUSE || {}).bienvenue) || 'Bienvenue au Club House !', likes: 0, liked: false, comments: [] },
      ],
      ads: [],
      events: [],
      rsvp: {},
      poll: { q: '', opts: [] },
      pollVote: null
    };
    return this._ch;
  }

  // ---------- CRM : données et agents autonomes ----------
  crmData() {
    if (this._crm) return this._crm;
    const st = this.readLS('cb-crm-v2', null);
    if (st && st.contacts) { this._crm = st; return st; }
    const d = (n) => this.addDays(n);
    const C = (id, name, org, type, source, city, email, phone, consent, score, last, tags) => ({ id, name, org, type, source, city, email, phone, consent, score, last, tags: tags || [], notes: [], status: score == null ? 'nouveau' : 'qualifié' });
    this._crm = {
      contacts: [
        C('c1', 'Équipe OlistO', 'OlistO', 'Partenaire', 'Partenariat', 'Réseau national', '[contact@olisto]', '[téléphone]', 'oui', 90, d(-2), ['Platinum', 'Immobilier']),
        C('c2', 'Atelier Cherwood', 'Cherwood', 'Partenaire', 'Partenariat', 'Cherbourg-en-Cotentin', '[contact@cherwood]', '[téléphone]', 'oui', 85, d(-5), ['Boutique', 'Capsule'])
      ],
      deals: [
        { id: 'd1', title: 'Partenariat Platinum', org: 'OlistO', contactId: 'c1', amount: 0, stage: 'Gagné', last: d(-2), next: 'Mettre en ligne la page partenaire' },
        { id: 'd2', title: 'Capsule Cherwood × Casa', org: 'Cherwood', contactId: 'c2', amount: 0, stage: 'Gagné', last: d(-5), next: 'Photos officielles des produits' }
      ],
      tasks: [
        { id: 't2', title: 'Mettre en ligne les photos Cherwood', due: d(-1), rel: 'Cherwood', owner: 'humain', done: false },
        { id: 't3', title: 'Compléter le numéro ORIAS d’OlistO', due: d(2), rel: 'OlistO', owner: 'humain', done: false }
      ],
      agents: {
        qualif: { on: true, mode: 'auto', runs: 0, actions: 0, last: null },
        relance: { on: true, mode: 'suggest', runs: 0, actions: 0, last: null },
        fidel: { on: true, mode: 'suggest', runs: 0, actions: 0, last: null },
        hygiene: { on: true, mode: 'auto', runs: 0, actions: 0, last: null },
        rapport: { on: true, mode: 'auto', runs: 0, actions: 0, last: null }
      },
      approvals: [], log: [], report: null
    };
    return this._crm;
  }
  saveCrm(v) { this._crm = v; this.writeLS('cb-crm-v2', v); this.setState({ crmRev: (this.state.crmRev || 0) + 1 }); }
  crmNow() { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0'); }
  // Un événement du site (formulaire, commande, newsletter, OlistO…) crée ou met à jour un contact
  // Envoi de chaque demande (contact, newsletter, commande, abonnement) à l'équipe :
  // 1) table Supabase « messages » (Espace admin › Messagerie) ; 2) Netlify Forms, seulement si le site tourne sur Netlify
  sendLead(ev) {
    const d = { source: ev.source || 'Site', nom: ev.name || '', email: ev.email || '', telephone: ev.phone || '', ville: ev.city || '', profil: ev.profile || ev.type || '', sujet: ev.subject || '', message: ev.message || ev.note || '', consentement: ev.consent || '', page: location.href };
    try {
      // Netlify Forms n'existe que sur les adresses Netlify (sur Cloudflare, la sauvegarde Supabase ci-dessous suffit)
      if (/^https?:/.test(location.protocol) && /netlify\.app$/.test(location.hostname)) {
        const body = new URLSearchParams(Object.assign({ 'form-name': 'demandes' }, d)).toString();
        fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body }).catch(() => {});
      }
    } catch (e) {}
    try { if (window.CasaAuth && window.CasaAuth.saveLead) window.CasaAuth.saveLead(d).catch(() => {}); } catch (e) {}
  }
  crmCapture(ev) {
    this.sendLead(ev);
    const C = Object.assign({}, this.crmData());
    const email = (ev.email || '').trim().toLowerCase();
    let c = email ? C.contacts.find((x) => (x.email || '').trim().toLowerCase() === email) : null;
    const note = { when: this.addDays(0) + ' ' + this.crmNow().slice(0, 5), by: 'Site', text: ev.note };
    if (c) C.contacts = C.contacts.map((x) => x === c ? Object.assign({}, x, { last: this.addDays(0), notes: x.notes.concat([note]) }) : x);
    else C.contacts = [{ id: 'c' + Date.now(), name: ev.name || email || 'Visiteur', org: ev.org || '', type: ev.type || 'Supporter', source: ev.source, city: ev.city || '', email: ev.email || '', phone: '', consent: ev.consent || '?', score: null, last: this.addDays(0), tags: ev.tags || [], notes: [note], status: 'nouveau' }].concat(C.contacts);
    this.saveCrm(C);
    if ((C.agents.qualif || {}).on) setTimeout(() => this.runAgent('qualif'), 600);
  }
  runAgent(id) {
    const C = JSON.parse(JSON.stringify(this.crmData()));
    const A = C.agents[id]; if (!A || !A.on) return;
    const t = this.crmNow(); const today = this.addDays(0);
    const log = (text, dot) => C.log.unshift({ agent: id, text, when: t, dot: dot || '#2e9e6b' });
    const days = (iso) => Math.round((this.today0() - new Date(iso + 'T00:00:00')) / 86400000);
    let n = 0;
    if (id === 'qualif') {
      C.contacts.forEach((c) => {
        if (c.status !== 'nouveau') return;
        let sc = { 'Formulaire OlistO': 70, 'Formulaire contact': 60, 'Boutique': 50, 'Abonnement': 55, 'Club House': 30, 'Newsletter': 20 }[c.source] || 35;
        if (c.org) sc += 10; if (/cotentin|cherbourg|valognes|hague|carentan|tourlaville|équeurdreville|barfleur/i.test(c.city + ' ' + c.note)) sc += 10;
        if (c.consent === 'oui') sc += 5;
        c.score = Math.min(100, sc); c.status = 'qualifié';
        if (c.source === 'Formulaire OlistO') { c.type = 'Prospect'; c.tags = (c.tags || []).concat(['OlistO']); }
        if (sc >= 60) { C.tasks.unshift({ id: 't' + Date.now() + n, title: 'Rappeler ' + c.name + ' sous 24 h', due: this.addDays(1), rel: c.org || c.source, owner: 'Agent Qualification', done: false }); }
        log('a qualifié ' + c.name + ' (score ' + c.score + ')' + (sc >= 60 ? ' et créé une tâche de rappel' : ''), '#2e9e6b'); n++;
      });
    }
    if (id === 'relance') {
      C.deals.forEach((dl) => {
        if (['Proposition', 'Négociation', 'Qualifié'].indexOf(dl.stage) < 0 || days(dl.last) < 7) return;
        if (C.approvals.some((a) => a.dealId === dl.id) || C.tasks.some((k) => k.dealId === dl.id && !k.done)) return;
        const ct = C.contacts.find((c) => c.id === dl.contactId) || { name: dl.org, email: '' };
        const mail = 'Objet : ' + dl.title + ' — on avance ensemble ?\n\nBonjour ' + ct.name.replace(/ \(démo\)$/, '') + ',\n\nJe reviens vers vous au sujet de « ' + dl.title + ' ». Avez-vous pu en discuter avec votre équipe ? Je reste disponible pour ajuster la proposition à vos besoins.\n\nSportivement,\nL’équipe Casa Besports';
        if (A.mode === 'auto') { dl.last = today; C.tasks.unshift({ id: 't' + Date.now() + n, dealId: dl.id, title: 'Vérifier la réponse de ' + dl.org, due: this.addDays(3), rel: dl.title, owner: 'Agent Relances', done: false }); log('a envoyé une relance à ' + dl.org + ' (' + dl.title + ')', '#e8a830'); }
        else { C.approvals.unshift({ id: 'ap' + Date.now() + n, agent: 'Agent Relances', dealId: dl.id, title: 'Relancer ' + dl.org, text: mail, when: t, kind: 'relance' }); log('propose une relance pour ' + dl.org + ' (en attente de validation)', '#e8a830'); }
        n++;
      });
    }
    if (id === 'fidel') {
      C.contacts.forEach((c) => {
        if (c.type !== 'Abonné' || days(c.last) < 2 || (c.tags || []).indexOf('Offre annuelle proposée') >= 0) return;
        const text = 'Objet : Passez à l’annuel, 2 mois offerts\n\nBonjour ' + c.name.replace(/ \(démo\)$/, '') + ',\n\nMerci de suivre le sport du Cotentin avec Casa B+. En passant à la formule annuelle, deux mois vous sont offerts. Votre avantage partenaire reste actif toute l’année.\n\nÀ très vite au bord des terrains !';
        if (A.mode === 'auto') { c.tags = (c.tags || []).concat(['Offre annuelle proposée']); log('a proposé l’offre annuelle à ' + c.name, '#6aa6c8'); }
        else if (!C.approvals.some((a) => a.contactId === c.id)) { C.approvals.unshift({ id: 'ap' + Date.now() + n, agent: 'Agent Fidélisation', contactId: c.id, title: 'Offre annuelle pour ' + c.name, text, when: t, kind: 'fidel' }); log('prépare une offre de fidélisation pour ' + c.name, '#6aa6c8'); }
        n++;
      });
    }
    if (id === 'hygiene') {
      const seen = {};
      const keep = [];
      C.contacts.forEach((c) => {
        const em = (c.email || '').trim().toLowerCase();
        if (em && !em.startsWith('[') && seen[em]) { const m = seen[em]; m.notes = m.notes.concat(c.notes); m.tags = Array.from(new Set(m.tags.concat(c.tags))); log('a fusionné un doublon : ' + c.name + ' (' + em + ')', '#8e7cc3'); n++; return; }
        if (c.email && c.email !== c.email.trim().toLowerCase() && !c.email.startsWith('[')) { c.email = c.email.trim().toLowerCase(); log('a normalisé l’e-mail de ' + c.name, '#8e7cc3'); n++; }
        if (c.consent !== 'oui' && c.consent !== 'non' && (c.tags || []).indexOf('Consentement à vérifier') < 0) { c.tags = (c.tags || []).concat(['Consentement à vérifier']); log('a signalé un consentement à vérifier pour ' + c.name, '#8e7cc3'); n++; }
        if (em) seen[em] = c; keep.push(c);
      });
      C.contacts = keep;
    }
    if (id === 'rapport') {
      const open = C.deals.filter((d) => ['Gagné', 'Perdu'].indexOf(d.stage) < 0);
      const won = C.deals.filter((d) => d.stage === 'Gagné').length, lost = C.deals.filter((d) => d.stage === 'Perdu').length;
      const late = C.tasks.filter((k) => !k.done && k.due < today).length;
      C.report = 'Pipeline ouvert : ' + open.reduce((a, d) => a + d.amount, 0).toLocaleString('fr-FR') + ' € sur ' + open.length + ' affaire(s) · taux de réussite ' + (won + lost ? Math.round(won / (won + lost) * 100) : 0) + ' % · ' + late + ' tâche(s) en retard.';
      log('a mis à jour le rapport : ' + C.report, '#3a4a78'); n++;
    }
    A.runs += 1; A.actions += n; A.last = t;
    C.log = C.log.slice(0, 60);
    this.saveCrm(C);
  }

  // Carte de Normandie : téléchargée seulement à l'ouverture de la page Territoire
  chargeCarte() {
    if (typeof window === 'undefined' || window.CasaCarte || this._carteLoad || !window.CasaCharge) return;
    this._carteLoad = true;
    window.CasaCharge(window.CASA_LIBS.carte).then(() => this.setState({ tick: (this.state.tick || 0) + 1 })).catch(() => { this._carteLoad = false; this.say('La carte n’a pas pu se charger. Vérifiez votre connexion.'); });
  }
  openAR(mode) {
    const s = this.state;
    // 3D et réalité augmentée : téléchargées seulement quand on les ouvre
    if (typeof window !== 'undefined' && !window.CasaAR && window.CasaCharge && !this._arLoad) {
      this._arLoad = true; this.say('Chargement de la 3D…');
      window.CasaCharge(window.CASA_LIBS.ar).then(() => { this._arLoad = false; this.openAR(mode); }).catch(() => { this._arLoad = false; this.say('La 3D n’a pas pu se charger. Vérifiez votre connexion.'); });
      return;
    }
    if (this._arLoad) return;
    if (typeof window !== 'undefined' && window.CasaAR && window.CasaAR.open) {
      const all = this.more().matches || [];
      const live = all.find((m) => m.status === 'live') || all.find((m) => m.status === 'done' && m.hs != null);
      window.CasaAR.open(mode, { sport: (s.view === 'discipline' && s.discId) || s.dSport || 'Football', score: live ? { home: live.home, away: live.away, hs: String(live.hs != null ? live.hs : 0), as: String(live.as != null ? live.as : 0), minute: live.status === 'live' ? 'En direct' : 'Terminé', label: 'Le direct' } : null });
      return;
    }
    this.go('app'); this.say('Expérience disponible dans l’application Casa Besports');
  }
  // Vérification d'une carte membre (partenaires) : format + contrôle en ligne si la table « membres » existe
  checkMember(raw) {
    const num = cbMemberCheck(raw);
    if (!num) { this.setState({ mbRes: 'bad', mbInfo: null }); return; }
    const A = window.CasaAuth;
    if (!A || !A.memberLive || !A.verifyMember) { this.setState({ mbRes: 'format', mbInfo: null, mbQ: num }); return; }
    this.setState({ mbRes: 'busy', mbQ: num });
    A.verifyMember(num).then((r) => this.setState({ mbRes: r ? (r.statut === 'suspendu' ? 'off' : 'ok') : 'none', mbInfo: r }), () => this.setState({ mbRes: 'format', mbInfo: null }));
  }

  // Lecture audio d'un article avec la voix de synthèse du téléphone ou de l'ordinateur (gratuit, sans serveur)
  ecouter(a, locked) {
    const S = window.speechSynthesis;
    if (!S || typeof window.SpeechSynthesisUtterance !== 'function') { this.say('La lecture audio n’est pas disponible sur ce navigateur.'); return; }
    if (this.state.listening) { this.stopVoix(); return; }
    const corps = locked ? cbPhrase(a.body) : String(a.body || '').split(/\n\s*\n/).map((x) => cbTexte(x)).filter(Boolean).join('\n');
    const texte = [cbTexte(a.title), cbTexte(a.dek), corps].filter(Boolean).map((x) => /[.!?…]$/.test(x) ? x : x + '.').join('\n');
    // découpé en morceaux : certains navigateurs coupent les textes longs
    const morceaux = texte.match(/[^.!?…\n]+[.!?…]*\s*/g) || [texte];
    const total = texte.length || 1; let lu = 0;
    const voix = (S.getVoices() || []).filter((v) => /^fr/i.test(v.lang));
    const v = voix.find((x) => /fr-FR/i.test(x.lang) && /google|natural|premium|enhanced|amelie|thomas|audrey/i.test(x.name)) || voix.find((x) => /fr-FR/i.test(x.lang)) || voix[0];
    S.cancel();
    this._voix = (this._voix || 0) + 1; const tour = this._voix;
    morceaux.forEach((m, i) => {
      const u = new SpeechSynthesisUtterance(m); u.lang = 'fr-FR'; if (v) u.voice = v; u.rate = 1;
      u.onstart = () => { if (tour === this._voix) this.setState({ voixPct: Math.round(lu / total * 100) + '%' }); };
      u.onend = () => { lu += m.length; if (tour !== this._voix) return; if (i === morceaux.length - 1) this.setState({ listening: false, voixPct: '0%' }); else this.setState({ voixPct: Math.round(lu / total * 100) + '%' }); };
      u.onerror = () => { if (tour === this._voix && i === morceaux.length - 1) this.setState({ listening: false }); };
      S.speak(u);
    });
    this.setState({ listening: true, voixPct: '0%' });
  }
  stopVoix() {
    this._voix = (this._voix || 0) + 1;
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    if (this.state.listening) this.setState({ listening: false, voixPct: '0%' });
  }
  go(view, extra) {
    if (this.state.listening) this.stopVoix();
    if (view === 'admin') {
      if (this.state.role === 'admin' && window.CasaAdmin) { window.CasaAdmin.open(); return; }
      if (window.CasaAdmin && window.CasaAdmin.wantOpen) window.CasaAdmin.wantOpen();
      if (!this.state.loggedIn) { this.setState({ loginOpen: true, linkSent: false }); this.say('Connectez-vous avec l’adresse e-mail de l’administrateur : l’espace administrateur s’ouvrira ensuite.'); return; }
      this.say('Vous êtes connecté avec ' + (this.state.email || 'un autre compte') + ', qui n’est pas le compte administrateur. Déconnectez-vous (Mon espace, en bas) puis reconnectez-vous avec l’adresse de l’administrateur.');
      return;
    }
    if (view === 'studio' && !this.state.role) { if (this.state.loggedIn) { this.say('L’espace rédaction est réservé aux personnes habilitées. Demandez l’accès depuis Mon espace.'); view = 'account'; extra = {}; } else { this.setState({ loginOpen: true, linkSent: false }); return; } }
    try { const r = document.documentElement; r.classList.remove('cb-nav'); void r.offsetWidth; r.classList.add('cb-nav'); } catch (e) {}
    const s = this.state;
    const cur = { view: s.view, articleId: s.articleId, videoId: s.videoId, discId: s.discId, clubId: s.clubId, playerId: s.playerId, productId: s.productId };
    this.setState(Object.assign({ view, hist: s.hist.concat([cur]).slice(-40), menuOpen: false, moreOpen: false, searchOpen: false, cartOpen: false, matchId: null, readerOpen: false, placeOpen: false, themeMenuOpen: false, customizeOpen: false, workIdx: null, partnerId: null, hdrY: '0', sq: '', summary: false, listening: false, playing: false, reaction: null, formError: '', prodError: '' }, extra || {}));
    try { window.scrollTo(0, 0); } catch (e) {}
    this.syncRoute(Object.assign({}, s, { view }, extra || {}), false);
  }
  // ---------- Paiements en ligne (js/paiement.js, docs/PAIEMENTS.md) ----------
  // Abonnements et commandes payés : relus chez Supabase à la connexion (et après un retour de Stripe)
  loadPaid(again) {
    const P = window.CasaPaiement; if (!P || !this.state.loggedIn) return;
    Promise.all([P.mesAbonnements(), P.mesCommandes()]).then(([abos, cmds]) => {
      if (!this.state.loggedIn) return;
      const plans = this.more().subPlans; const eur = (n) => (Math.round(Number(n || 0) * 100) / 100).toFixed(2).replace('.', ',') + ' €';
      const date = (d) => { try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };
      const actifs = abos.filter((a) => P.estActif(a) && plans[a.formule]);
      let casab = false, num = false, pap = false;
      actifs.forEach((a) => { const p = plans[a.formule]; if (p.casab) casab = true; if (p.gazette === 'num' || p.gazette === 'duo') num = true; if (p.gazette === 'pap' || p.gazette === 'duo') pap = true; });
      const srv = abos.filter((a) => plans[a.formule]).map((a) => ({ srv: true, label: plans[a.formule].name + (a.cadeau ? ' (offert)' : ''), detail: eur(a.montant) + (a.cadeau ? '' : a.periode === 'an' ? ' / an' : ' / mois') + (a.fin ? (P.estActif(a) ? (a.resiliation_prevue || a.cadeau ? ' · jusqu’au ' : ' · renouvelé le ') : ' · terminé le ') + date(a.fin) : ''), status: P.estActif(a) ? (a.resiliation_prevue ? 'Résilié' : 'Actif') : 'Terminé' }))
        .concat(cmds.map((c) => ({ srv: true, label: 'Commande ' + c.numero, detail: (c.lignes || []).reduce((n, l) => n + (l.quantite || 0), 0) + ' article(s) · ' + eur(c.montant) + ' · ' + date(c.cree_le), status: { payee: 'Payée', preparee: 'En préparation', expediee: 'Expédiée', retiree: 'Retirée', remboursee: 'Remboursée', annulee: 'Annulée' }[c.statut] || c.statut })));
      const st = { orders: srv.concat(this.state.orders.filter((o) => !o.srv)), paidSubs: actifs.length > 0 };
      if (abos.length) st.subs = { casab, gazette: num && pap ? 'duo' : pap ? 'pap' : num ? 'num' : null };
      this.setState(st);
      // Retour de Stripe : l'avis de paiement peut arriver quelques secondes après la personne
      if (again > 0 && this._waitPaid && !actifs.some((a) => a.formule === this._waitPaid)) setTimeout(() => this.loadPaid(again - 1), 3000);
      else if (this._waitPaid && actifs.some((a) => a.formule === this._waitPaid)) { this._waitPaid = null; this.say('Votre abonnement est actif. Merci !'); }
    });
  }
  stripeReturn() {
    const P = window.CasaPaiement; const r = P && P.retour; if (!r) return;
    P.retour = null;
    setTimeout(() => {
      if (r.etat === 'annule') {
        const cart = r.type === 'commande' ? P.reprendrePanier() : [];
        if (cart.length) this.setState({ cart });
        this.say('Paiement annulé : rien n’a été débité.' + (cart.length ? ' Votre panier est toujours là.' : ''));
        return;
      }
      if (r.type === 'commande') { P.oublierPanier(); this.setState({ view: 'order', orderDone: true, orderNo: r.numero, orderPaid: true, cart: [] }); this.say('Paiement reçu. Merci !'); setTimeout(() => this.loadPaid(), 4000); return; }
      if (r.cadeau) { this.say('Paiement reçu : l’abonnement offert est activé pour votre proche. Il lui suffit de créer son compte avec son adresse e-mail.'); return; }
      this._waitPaid = r.formule; this.say('Paiement reçu. Activation de votre abonnement…');
      this.loadPaid(5);
    }, 60);
  }
  // Passage chez Stripe ; si le paiement en ligne n'est pas encore activé, la demande part à l'équipe comme avant
  payOnline(body, fallback) {
    const P = window.CasaPaiement;
    if (!P) { fallback(); return; }
    this.setState({ payBusy: true, formError: '' });
    if (body.type === 'commande') P.garderPanier(this.state.cart);
    P.payer(body).catch((e) => {
      this.setState({ payBusy: false });
      if (e && e.code === 'non_configure') { P.oublierPanier(); fallback(); return; }
      if (e && e.code === 'deja_abonne') { this.say(e.message); this.go('account'); return; }
      this.setState({ formError: (e && e.message) || 'Paiement indisponible pour le moment.' });
    });
  }
  // Demande d'accès à l'espace rédaction (abonné connecté) : table demandes_acces, sinon simple message
  requestAccess() {
    const s = this.state; const A = window.CasaAuth; const motif = s.accMotif.trim();
    if (!s.loggedIn) { this.setState({ loginOpen: true }); return; }
    if (motif.length < 10) { this.say('Présentez-vous en quelques mots (au moins 10 caractères).'); return; }
    this.setState({ accBusy: true });
    const done = (d) => { this.setState({ accBusy: false, accMotif: '', accReq: d || { statut: 'en_attente', cree_le: new Date().toISOString() } }); this.say('Demande envoyée à l’administrateur'); };
    const viaLead = () => this.sendLead({ source: 'Demande d’accès rédaction', name: s.name, email: s.email, phone: s.phone, subject: 'Accès à l’espace rédaction', message: motif });
    if (A && A.requestAccess) A.requestAccess(s.name, motif).then(done, () => { viaLead(); done(null); });
    else { viaLead(); done(null); }
  }
  // Rechargement après une modification faite dans l'espace administrateur
  refreshContent() { this._d = null; this._m = null; this._g = null; this._cu = null; this.setState({ tick: (this.state.tick || 0) + 1 }); }
  syncRoute(st, replace) {
    try {
      const h = st.view === 'home' ? '#/' : cbRouteOf(st);
      // Arrivée par une adresse lisible (/actualites/…) : on la garde telle quelle dans la barre d'adresse
      if (!location.hash && location.pathname !== '/' && location.pathname.replace(/\/+$/, '') === cbPathOf(st)) return;
      if (location.hash !== h && !(h === '#/' && !location.hash)) history[replace ? 'replaceState' : 'pushState'](null, '', (location.pathname !== '/' ? '/' : '') + h);
    } catch (e) {}
    this.setTitle(st);
  }
  // Titre de l'onglet du navigateur selon la page affichée
  setTitle(st) {
    try {
      let t = CB_TITLES[st.view];
      try {
        const D = this.data();
        if (st.view === 'club') t = ((D.clubs || []).find((c) => c.id === st.clubId) || {}).name;
        else if (st.view === 'player') t = ((D.players || []).find((c) => c.id === st.playerId) || {}).name;
        else if (st.view === 'article') t = ((this.allArticles() || []).find((a) => a.id === st.articleId) || {}).title;
        else if (st.view === 'discipline') t = st.discId;
      } catch (e) {}
      const LG = window.CasaLang; const en = LG && LG.lang === 'en';
      document.title = (t ? (LG ? LG.t(t) : t) + ' · ' : '') + (en ? 'Casa Besports — sports media of the Cotentin' : 'Casa Besports — le média sport du Cotentin');
      const md = document.querySelector('meta[name="description"]');
      if (md) {
        if (!this._metaDesc) this._metaDesc = md.getAttribute('content');
        const A = window.CASA_APROPOS || {};
        md.setAttribute('content', st.view === 'about' ? ((en ? 'Our story: ' : 'Notre histoire : ') + ((en && A.soustitreEn) || A.soustitre || '')) : this._metaDesc);
      }
      // Adresse officielle et aperçu de partage de la page affichée
      const a0 = st.view === 'article' ? (this.allArticles() || []).find((a) => a.id === st.articleId) : null;
      if (a0 && a0.dek && md) md.setAttribute('content', a0.dek);
      const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el && val) { if (!el.dataset.orig) el.dataset.orig = el.getAttribute(attr) || ''; el.setAttribute(attr, val); } else if (el && el.dataset.orig != null) el.setAttribute(attr, el.dataset.orig); };
      const can = st.view === 'home' ? '' : cbUrlOf(st);
      setMeta('link[rel="canonical"]', 'href', can);
      setMeta('meta[property="og:url"]', 'content', can);
      setMeta('meta[property="og:title"]', 'content', st.view === 'home' ? '' : document.title);
      setMeta('meta[property="og:image"]', 'content', a0 && a0.img ? new URL(a0.img, cbSite() + '/').href : '');
    } catch (e) {}
  }
  back() {
    const h = this.state.hist.slice();
    const prev = h.pop() || { view: 'home' };
    if (this.state.listening) this.stopVoix();
    this.setState(Object.assign({ hist: h, summary: false, listening: false, playing: false, formError: '' }, prev));
    try { window.scrollTo(0, 0); } catch (e) {}
    this.syncRoute(Object.assign({}, this.state, prev), true);
  }
  say(msg) {
    this.setState({ toast: msg });
    clearTimeout(this._t);
    this._t = setTimeout(() => this.setState({ toast: '' }), 2400);
  }
  toggleIn(key, id, on, off) {
    const list = this.state[key];
    const has = list.indexOf(id) >= 0;
    this.setState({ [key]: has ? list.filter((x) => x !== id) : list.concat([id]) });
    if (has ? off : on) this.say(has ? off : on);
  }

  renderVals() {
    const s = this.state;
    const D = this.data();
    const libImgs = [['5cd343902a0b6d6a654108dee90d6fc3', 'ES Pointe-Hague'], ['38c25d93ed37833c9d08d0a1d75de3f1', 'Les Redoutables'], ['183faa9bf4b22beda6d2cb41e6b91225', 'Bénévoles TIC'], ['824fb1ca8687d16522c2ba8f05d66086', 'FCEH'], ['f2d41cc7df08eba8f5272bd4fddfac50', 'Féminines ASC'], ['4f81a4491eb301c8894c5d5d2ab04ff6', 'Blue Squad'], ['33cc6fbd406b8554971d61a0887d4a76', 'Duel des buteurs'], ['e6132a6993a0d040085ac66b6f46cf6e', 'AS Cherbourg'], ['2b8b1c873d91f86dbbe51fe32be05f69', 'Trail'], ['d75f806f46d28a0e206a30c27b8e58ad', 'Marine nationale'], ['0855c8136dcdda770cb476333ba7ad46', 'Le match du port'], ['66c390103494d9a28a5f34e10524881c', 'RCMN']].map(([id, label]) => ({ id, src: (window.ASSET_DATA[BLOB_FILES[id]] || ('assets/' + (BLOB_FILES[id] || id))), label }));
    const RXD = typeof CasaRedac !== 'undefined' ? CasaRedac.data(this, { libImgs, videos: D.videos }) : null;
    const X = this.more();
    const ARTS = this.allArticles();
    // Valeurs de secours quand une rubrique est encore vide (aucune page de détail n'est alors accessible)
    const EMPTY_ART = { id: '', sport: '', tag: 'Bientôt', date: '', read: '', premium: false, img: 'assets/hero.jpg', alt: 'Casa Besports', title: 'Les premiers articles arrivent', dek: 'La rédaction Casa Besports prépare ses premiers récits du sport dans le Cotentin.', clubs: [], points: [], body: '' };
    const EMPTY_VID = { id: '', tag: '', date: '', img: 'assets/hero.jpg', alt: '', title: '', dek: '', url: '' };
    const EMPTY_PROD = { id: '', line: 'casa', name: '', short: '', price: 0, type: 'tee', img: 'assets/hero.jpg', gallery: [], colors: [{ name: 'Marine', hex: '#0f2236' }], sizes: null, perso: null, flag: '', mark: 'CASA', pop: 0, isNew: false, desc: '' };
    const showPlaces = this.props.showPlaces ?? true;
    const accent = 'var(--acc)'; // couleur d’action du thème : noir sur fond clair, blanc sur fond sombre (theme.css)
    const showBg = this.props.showBg ?? true;
    const k = (this.props.bgIntensity ?? 40) / 100;
    const eur = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
    const eur0 = (n) => (n % 1 === 0 ? String(n) : n.toFixed(2).replace('.', ',')) + ' €';
    const norm = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const clubById = (id) => D.clubs.find((c) => c.id === id);
    const monoColors = ['#0f2236', '#20405e', '#9a6410', '#18705f', '#7a2a33', '#3a4a78'];
    const initials = (n) => n.replace(/^(AS|ES|FC|CS|US|UC|SC|PL|USON|UST)\s/, '').split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    const pill = (on) => ({ bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pressed: on ? 'true' : 'false' });
    const subscribed = !!s.subs.casab;
    const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const MONTHS_L = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const DOW = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
    const pd = (iso) => { if (!iso) return null; const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
    const dateLabel = (iso) => { const d = pd(iso); return d ? DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : 'Date à confirmer'; };

    // ---------- articles / clubs / joueurs ----------
    const fmtLong = (iso) => { try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } };
    const art = (a) => {
      const saved = s.saved.indexOf(a.id) >= 0;
      const pubIso = (a.publierLe && new Date(a.publierLe) <= new Date() ? a.publierLe : '') || a.creeLe || '';
      const modIso = a.modifieLe && (!pubIso || String(a.modifieLe).slice(0, 10) > String(pubIso).slice(0, 10)) ? a.modifieLe : '';
      return Object.assign({}, a, {
        open: () => this.go('article', { articleId: a.id }),
        toggleSave: () => this.toggleIn('saved', a.id, 'Ajouté à vos favoris', 'Retiré de vos favoris'),
        saveFill: saved ? 'currentColor' : 'none', saveColor: saved ? 'var(--gold-text)' : 'var(--text)', saveLabel: saved ? 'Retirer des favoris' : 'Ajouter aux favoris',
        hasBody: !!a.body, noBody: !a.body, blocks: a.body ? this.blocksOf(a.body) : [], author: a.author || 'la rédaction',
        pubLabel: pubIso ? fmtLong(pubIso) : (a.date || ''), hasPub: !!(pubIso || a.date), pubIso: pubIso || '',
        modLabel: modIso ? fmtLong(modIso) : '', hasMod: !!modIso, credit: a.credit || '', hasCredit: !!a.credit, hasCaption: !!(a.credit || a.alt),
        teaser: (String(a.body || '').split(/\n\s*\n/).map((x) => x.trim()).find((x) => x && !/^(#|>|!\[|-)/.test(x)) || a.dek || '').slice(0, 320)
      });
    };
    const clubV = (c, i) => {
      const f = s.follows.indexOf(c.id) >= 0;
      return Object.assign({}, c, {
        initials: initials(c.name), mono: monoColors[(i ?? D.clubs.indexOf(c)) % monoColors.length],
        // Logo dans le rond (sinon les initiales) et infos clés de la carte : niveau, création, stade
        hasLogo: !!c.logo, noLogo: !c.logo, logo: c.logo || '',
        niveau: c.niveau || '', hasNiveau: !!c.niveau, fondation: c.fondation ? 'Fondé en ' + c.fondation : '', hasFondation: !!c.fondation, stade: c.stade || '', hasStade: !!c.stade,
        lieu: [c.sport, c.city].filter(Boolean).join(' · '),
        open: () => this.go('club', { clubId: c.id, clubTab: 'articles' }),
        toggleFollow: () => this.toggleIn('follows', c.id, 'Vous suivez ' + c.name, 'Vous ne suivez plus ' + c.name),
        fLabel: f ? 'Suivi ✓' : 'Suivre', fBg: f ? 'var(--inv-bg)' : 'var(--surface)', fFg: f ? 'var(--on-inv)' : 'var(--ink)'
      });
    };
    const playerV = (p) => Object.assign({}, p, { club: p.clubLabel, hasImg: !!p.img, noImg: !p.img, open: () => this.go('player', { playerId: p.id }) });
    const vidV = (v) => { const dm = RXD && RXD.media.find((m) => m.id === 'video:' + v.id); const duree = (dm && dm.duree) || v.duree || ''; return Object.assign({}, v, { open: () => this.go('video', { videoId: v.id }), duree, hasDuree: !!duree }); };

    // ---------- matchs ----------
    const compLabel = (sp, id) => ((X.comps[sp] || []).find((c) => c.id === id) || { label: id }).label;
    const openClubByTeam = (t) => () => { const id = X.teamClub[t]; if (id) this.go('club', { clubId: id, clubTab: 'matchs' }); else this.say('Club non référencé pour l’instant'); };
    const pronoOpts = (m) => {
      const mine = s.pronos[m.id];
      return [['1', m.home.split(' ').slice(-1)[0] + ' gagne'], ['N', 'Match nul'], ['2', m.away.split(' ').slice(-1)[0] + ' gagne']].map(([v, label]) => Object.assign(pill(mine === v), { label,
        pick: () => { this.setState({ pronos: Object.assign({}, s.pronos, { [m.id]: v }) }); this.say('Prono enregistré'); } }));
    };
    const matchV = (m) => {
      const live = m.status === 'live';
      const done = m.status === 'done';
      const minute = live ? (m.sport === 'Basketball' ? Math.min(40, m.minute + s.tick) : Math.min(90, m.minute + s.tick)) : 0;
      const hasScore = m.hs !== null && m.hs !== undefined;
      const rem = s.reminders.indexOf(m.id) >= 0;
      const statusLabel = live ? 'En direct · ' + minute + (m.sport === 'Basketball' ? '′ de jeu' : '′') : done ? (m.note || 'Terminé') : 'À venir';
      return Object.assign({}, m, {
        compId: m.comp, compLabel: compLabel(m.sport, m.comp), comp: compLabel(m.sport, m.comp), dateLabel: dateLabel(m.date),
        hs: hasScore ? String(m.hs) : '–', as: hasScore ? String(m.as) : '–',
        scoreMid: hasScore ? m.hs + ' – ' + m.as : (done ? '·' : 'vs'),
        statusLabel, stColor: live ? 'var(--danger)' : done ? 'var(--muted)' : 'var(--gold-text)', pulse: live ? 'pulse' : '',
        progress: live ? Math.round(minute / (m.sport === 'Basketball' ? 40 : 90) * 100) + '%' : done ? '100%' : '0%',
        vLabel: m.verified ? 'Vérifié' : 'À confirmer', vColor: m.verified ? 'var(--success)' : 'var(--gold-text)',
        homeW: hasScore && m.hs > m.as ? '800' : '600', awayW: hasScore && m.as > m.hs ? '800' : '600',
        homeN: cbNomEquipe(m.home), awayN: cbNomEquipe(m.away), homeWin: hasScore && +m.hs > +m.as ? 'is-win' : '', awayWin: hasScore && +m.as > +m.hs ? 'is-win' : '',
        open: () => this.setState({ matchId: m.id }),
        upcoming: m.status === 'up', opts: pronoOpts(m),
        rLabel: rem ? 'Rappel activé ✓' : 'Me le rappeler', rBg: rem ? 'var(--inv-bg)' : 'var(--surface)', rFg: rem ? 'var(--on-inv)' : 'var(--ink)',
        toggleRemind: () => this.toggleIn('reminders', m.id, 'Rappel activé', 'Rappel retiré'),
        hasArticle: !!m.article, openArticle: () => this.go('article', { articleId: m.article }),
        openHome: openClubByTeam(m.home), openAway: openClubByTeam(m.away)
      });
    };
    const allM = X.matches.map(matchV);
    // Le rendez-vous de l'accueil : le prochain match à venir (contenus/sport.js), sinon le bloc est masqué
    const todayIso = new Date().toISOString().slice(0, 10);
    const rdvM = allM.filter((m) => m.status === 'up' && (!m.date || m.date >= todayIso)).sort((a, b) => ((a.date || '') + (a.time || '') > (b.date || '') + (b.time || '') ? 1 : -1))[0];
    const rdv = rdvM ? { has: true, home: rdvM.home, away: rdvM.away, comp: rdvM.compLabel || '', when: [rdvM.dateLabel, rdvM.time, rdvM.venue].filter(Boolean).join(' · '),
      open: () => this.setState({ matchId: rdvM.id }) } : { has: false, home: '', away: '', comp: '', when: '', open: () => {} };
    const byDate = (a, b) => (a.date || '9999') < (b.date || '9999') ? -1 : 1;

    // ---------- navigation ----------
    const navDefs = [['Le Terrain', 'live'], ['Actualités', 'news'], ['Club House', 'clubhouse'], ['Culture', 'culture'], ['Clubs', 'clubs'], ['Boutique', 'shop']];
    const sectionOf = { article: 'news', video: 'videos', discipline: 'disciplines', club: 'clubs', player: 'players', checkout: 'offers', product: 'shop', order: 'shop', cv: 'account' };
    const activeSec = sectionOf[s.view] || s.view;
    const nav = navDefs.map(([label, v]) => ({ label, color: activeSec === v ? 'var(--ink)' : 'var(--muted)', line: activeSec === v ? accent : 'transparent', go: () => this.go(v) }));
    // Menu « Plus » regroupé en trois familles (les mêmes rubriques alimentent l'accès direct de l'accueil)
    const goV = (v, extra) => () => this.go(v, extra || {});
    const menuGroups = [
      { titre: 'Le sport', items: [['Vidéos', 'videos', 'Highlights et interviews'], ['Joueurs', 'players', 'Les profils du Cotentin'], ['Disciplines', 'disciplines', 'Tous les sports suivis'], ['Territoire', 'map', 'La carte des clubs'], ['Météo', 'meteo', 'Prévisions et conditions de jeu']] },
      { titre: 'Vos services', items: [['Abonnements', 'offers', 'Casa B+ et La Gazette'], ['L’application', 'app', 'Scores, Club House et réalité augmentée'], ['Mon quotidien', 'private', 'Agenda, listes, budget, documents']] },
      { titre: 'La maison', items: [['Casa PRO', 'work', 'Clubs, marques, collectivités, sportifs, médias'], ['Partenaires', 'partners', 'Offres entreprises, OlistO et projet immobilier'], ['À propos', 'about', 'Notre histoire'], ['Contact', 'contact', 'Écrire à la rédaction']] }
    ];
    if (s.role) menuGroups.unshift({ titre: 'Équipe', items: (s.role === 'admin' ? [['Espace administrateur', 'admin', 'Contenus, messagerie, équipe']] : []).concat([['Espace rédaction', 'studio', s.role === 'admin' ? 'Relecture et publication' : 'Rédiger et soumettre']]) });
    menuGroups.forEach((g) => { g.items = g.items.map(([label, v, sub]) => ({ label, sub, go: goV(v, v === 'studio' ? { studioTab: s.role === 'admin' ? 'queue' : s.role === 'club' ? 'club' : 'dash' } : null) })); });
    const moreNav = [].concat(...menuGroups.map((g) => g.items));
    // Accueil : toutes les rubriques du site, en accès direct
    const rubriques = [{ titre: 'L’essentiel', items: [['Le Terrain', 'live', 'Scores, agenda et classements'], ['Actualités', 'news', 'Récits et résultats'], ['Club House', 'clubhouse', 'La communauté des sportifs'], ['Culture', 'culture', 'Œuvres et patrimoine'], ['Clubs', 'clubs', 'Tous les clubs du Cotentin'], ['Boutique', 'shop', 'Maillots et collections']].map(([label, v, sub]) => ({ label, sub, go: goV(v) })) }].concat(menuGroups.filter((g) => g.titre !== 'Équipe'));

    // ---------- accueil ----------
    const liveCount = allM.filter((m) => m.status === 'live').length;
    const gateways = [
      { eb: liveCount + ' match(s) en direct', title: 'Le Terrain', sub: 'Résultats, agenda et classements de chaque discipline.', cta: 'Voir les scores', go: () => this.go('live'), deep: 'cb-deep', bg: 'var(--inv-bg)', fg: 'var(--on-inv)', subColor: 'var(--on-inv-2)', ebColor: 'var(--gold-on-inv)', ctaColor: accent, dot: '#e03040', pulseClass: 'pulse' },
      { eb: 'Récits du terrain', title: 'Actualités', sub: 'Reportages, portraits et coulisses du sport local.', cta: 'Lire l’actu', deep: '', go: () => this.go('news'), bg: 'var(--surface-2)', fg: 'var(--ink)', subColor: 'var(--text-2)', ebColor: 'var(--gold-text)', ctaColor: 'var(--ink)', dot: 'var(--ink)', pulseClass: '' },
      { eb: 'Avec Cherwood', title: 'Boutique', sub: 'Vêtements, maillots floqués et goodies.', cta: 'Faire un tour', deep: '', go: () => this.go('shop'), bg: 'var(--acc)', fg: 'var(--on-acc)', subColor: 'var(--on-acc)', ebColor: 'var(--on-acc)', ctaColor: 'var(--on-acc)', dot: 'var(--on-acc)', pulseClass: '' },
      { eb: 'Le mag', title: 'La Gazette', sub: 'Numérique, papier ou les deux.', cta: 'S’abonner', deep: '', go: () => this.go('offers', { offerTab: 'La Gazette' }), bg: 'var(--sand)', fg: 'var(--ink)', subColor: 'var(--text-2)', ebColor: 'var(--gold-text)', ctaColor: 'var(--ink)', dot: 'var(--ink)', pulseClass: '' }
    ];

    // ---------- actualités ----------
    const allA = ARTS.map(art);
    const cats = ['Tous', 'Football', 'Basketball', 'Rugby', 'Water-polo', 'Trail'];
    const q = norm(s.q.trim());
    const newsArticles = allA.filter((a) => (s.cat === 'Tous' || a.sport === s.cat) && (!s.premiumOnly || a.premium) && (!s.savedOnly || s.saved.indexOf(a.id) >= 0) &&
      (!q || norm(a.title + ' ' + a.dek + ' ' + a.tag + ' ' + a.sport + ' ' + a.clubs.map((c) => (clubById(c) || {}).name).join(' ')).includes(q)));
    const chips = cats.map((c) => Object.assign(pill(c === s.cat), { label: c, pick: () => this.setState({ cat: c }) }));
    const feed = allA.filter((a) => a.clubs.some((c) => s.follows.indexOf(c) >= 0)).slice(0, 3);

    // ---------- article ----------
    const curA = ARTS.find((a) => a.id === s.articleId) || ARTS[0] || EMPTY_ART;
    const artObj = art(curA);
    artObj.openSport = () => this.go('discipline', { discId: curA.sport });
    // Décor de lecture choisi dans l'admin (gazette d'époque, papier clair) : appliqué à toute la page
    const decor = s.view === 'article' && /^(gazette|papier)$/.test(curA.decor || '') ? curA.decor : '';
    try { if ((document.documentElement.getAttribute('data-decor') || '') !== decor) { if (decor) document.documentElement.setAttribute('data-decor', decor); else document.documentElement.removeAttribute('data-decor'); } } catch (e) {}
    // Gazette : sur grand écran, d'autres articles du site apparaissent floutés dans les marges, comme sur une page de journal
    const gzAutres = decor === 'gazette' ? ARTS.filter((a) => a.id !== curA.id && !a.brouillon).slice(0, 6).map((a) => ({
      isArt: true, isPub: false, tag: a.tag || a.sport || '', title: a.title, img: a.img || '', hasImg: !!a.img,
      txt: cbTexte(a.dek ? a.dek + ' ' + (a.body || '') : a.body).slice(0, 420) + '…',
      open: () => this.go('article', { articleId: a.id }) })) : [];
    // Encarts sponsors (contenus/encarts.js, section « Encarts sponsors » de l'admin), affichés nets ; sans sponsor : un emplacement à vendre
    const pubs = (window.CASA_ENCARTS || []).filter((e) => e && e.actif !== false && e.nom).map((e) => ({ isPub: true, isArt: false, kicker: 'Partenaire', nom: e.nom, texte: e.texte || '', img: e.img || '', hasImg: !!e.img, lien: e.site || e.lien || '#', target: (e.site || e.lien) ? '_blank' : '_self' }));
    if (!pubs.length) pubs.push({ isPub: true, isArt: false, kicker: 'Espace partenaire', nom: 'Votre marque ici', texte: 'Associez votre entreprise aux histoires du sport local.', img: '', hasImg: false, lien: '/pro', target: '_self' });
    const gzG = gzAutres.filter((x, i) => i % 2 === 0), gzD = gzAutres.filter((x, i) => i % 2 === 1);
    if (gzAutres.length) { gzG.splice(1, 0, pubs[0]); if (pubs[1] || gzD.length) gzD.splice(1, 0, pubs[1] || pubs[0]); }
    const gzSide = { on: gzAutres.length > 0, gauche: gzG, droite: gzD };
    artObj.points = cbResume(curA).map((t) => ({ t }));
    artObj.hasPoints = artObj.points.length > 0;
    artObj.clubs = curA.clubs.map((id) => clubById(id)).filter(Boolean).map((c) => clubV(c));
    artObj.hasClubs = artObj.clubs.length > 0;
    artObj.hasVideo = !!(curA.video && curA.video.url); artObj.videoUrl = curA.video ? curA.video.url : ''; artObj.videoDur = curA.video ? curA.video.duree || '' : ''; artObj.hasVideoDur = !!artObj.videoDur;
    const linkedA = (curA.related || []).map((id) => allA.find((a) => a.id === id)).filter(Boolean);
    const related = linkedA.concat(allA.filter((a) => a.id !== curA.id && linkedA.indexOf(a) < 0 && (a.sport === curA.sport || a.clubs.some((c) => curA.clubs.indexOf(c) >= 0)))).slice(0, 3);
    const locked = curA.premium && !subscribed;
    const fontSizes = ['16px', '18px', '20px', '23px'];
    const reactions = ['Bravo', 'Quelle ambiance', 'Fierté locale'].map((r) => Object.assign(pill(s.reaction === r), { label: r, pick: () => { this.setState({ reaction: s.reaction === r ? null : r }); if (s.reaction !== r) this.say('Merci pour votre réaction'); } }));

    // ---------- vidéos ----------
    const videos = D.videos.map(vidV);
    const curV = D.videos.find((v) => v.id === s.videoId) || D.videos[0] || EMPTY_VID;

    // ---------- disciplines ----------
    const disciplines = D.sports.map((sp) => {
      const na = ARTS.filter((a) => a.sport === sp).length;
      const nv = D.videos.filter((v) => v.sport === sp).length;
      const nc = D.clubs.filter((c) => c.sport === sp).length;
      const any = na + nv + nc > 0;
      return { name: sp, stats: na + ' article' + (na > 1 ? 's' : '') + ' · ' + nv + ' vidéo' + (nv > 1 ? 's' : '') + ' · ' + nc + ' club' + (nc > 1 ? 's' : ''),
        badge: any ? 'Explorer →' : 'Bientôt', badgeColor: any ? 'var(--gold-text)' : 'var(--muted)', bg: any ? 'var(--surface)' : 'var(--surface-3)', open: () => this.go('discipline', { discId: sp }) };
    });
    const dName = s.discId || 'Football';
    const dArts = allA.filter((a) => a.sport === dName);
    const dClubs = D.clubs.filter((c) => c.sport === dName).map((c) => clubV(c));
    const firstComp = (sp) => ((X.comps[sp] || [])[0] || { id: null }).id;
    const disc = { name: dName, stats: (disciplines.find((d) => d.name === dName) || {}).stats, articles: dArts, clubs: dClubs,
      hasArticles: dArts.length > 0, hasClubs: dClubs.length > 0, empty: dArts.length + dClubs.length === 0,
      openBoard: () => this.go('live', { dSport: dName, dComp: firstComp(dName), dTab: 'results' }), openShop: () => this.go('shop') };

    // ---------- clubs ----------
    const clubSports = ['Tous', 'Football', 'Basketball', 'Handball', 'Volley-ball', 'Rugby', 'Water-polo', 'Multisport'].filter((sp) => ['Tous', 'Football', 'Basketball', 'Water-polo', 'Multisport'].indexOf(sp) >= 0 || D.clubs.some((c) => c.sport === sp));
    const clubChips = clubSports.map((c) => Object.assign(pill(c === s.clubSport), { label: c, pick: () => this.setState({ clubSport: c }) }));
    const clubList = D.clubs.filter((c) => s.clubSport === 'Tous' || c.sport === s.clubSport).map((c) => clubV(c));
    const curC = clubById(s.clubId) || D.clubs[0] || { id: '', name: 'Aucun club', sport: '', city: '', img: null };
    const club = clubV(curC);
    club.hasImg = !!curC.img;
    club.openSport = () => this.go('discipline', { discId: curC.sport });
    club.openCity = () => this.go('map', { city: curC.city });
    club.articles = allA.filter((a) => a.clubs.indexOf(curC.id) >= 0);
    club.noArticles = club.articles.length === 0;
    club.players = D.players.filter((p) => p.club === curC.id).map(playerV);
    club.noPlayers = club.players.length === 0;
    club.matches = allM.filter((m) => X.teamClub[m.home] === curC.id || X.teamClub[m.away] === curC.id).sort(byDate);
    club.noMatches = club.matches.length === 0;
    const tabs = [['articles', 'Articles'], ['matchs', 'Matchs'], ['players', 'Effectif'], ['infos', 'Infos club']];
    const clubTabs = tabs.map(([id, label]) => ({ label, sel: s.clubTab === id ? 'true' : 'false', color: s.clubTab === id ? 'var(--ink)' : 'var(--muted)', line: s.clubTab === id ? accent : 'transparent', pick: () => this.setState({ clubTab: id }) }));

    // ---------- joueurs ----------
    const roles = ['Tous', 'Attaquant', 'Milieu', 'Défenseur', 'Staff & arbitres'];
    const roleChips = roles.map((r) => Object.assign(pill(r === s.plRole), { label: r, pick: () => this.setState({ plRole: r }) }));
    const isStaff = (p) => /Arbitre|Entraîneur|VP/.test(p.role);
    const playerList = D.players.filter((p) => s.plRole === 'Tous' || (s.plRole === 'Staff & arbitres' ? isStaff(p) : p.role === s.plRole)).map(playerV);
    const curP = D.players.find((p) => p.id === s.playerId) || D.players[0] || { id: '', num: '', name: 'Aucun joueur', role: '', club: null, clubLabel: '', img: null };
    const pf = s.followPlayers.indexOf(curP.id) >= 0;
    const pl = Object.assign(playerV(curP), {
      hasClub: !!curP.club, noClub: !curP.club, openClub: () => this.go('club', { clubId: curP.club, clubTab: 'players' }),
      toggleFollow: () => this.toggleIn('followPlayers', curP.id, 'Vous suivez ' + curP.name, 'Vous ne suivez plus ' + curP.name),
      fLabel: pf ? 'Suivi ✓' : 'Suivre ce joueur', fBg: pf ? 'var(--inv-bg)' : 'var(--surface)', fFg: pf ? 'var(--on-inv)' : 'var(--ink)'
    });

    // ---------- carte ----------
    const lat0 = 49.78, lat1 = 48.6, lon0 = -1.98, lon1 = -0.2;
    const cityNames = Object.keys(D.cities).filter((c) => D.clubs.some((cl) => cl.city === c));
    const cityDots = cityNames.map((name) => {
      const [la, lo] = D.cities[name];
      const n = D.clubs.filter((c) => c.city === name).length;
      const sel = s.city === name;
      return { x: (6 + (lo - lon0) / (lon1 - lon0) * 88).toFixed(1) + '%', y: (6 + (lat0 - la) / (lat0 - lat1) * 88).toFixed(1) + '%',
        size: (14 + n * 5) + 'px', sizeL: (30 + n * 6) + 'px', count: String(n), bg: sel ? 'var(--inv-bg)' : accent, fg: sel ? 'var(--on-inv)' : 'var(--on-acc)',
        aria: name + ', ' + n + ' club' + (n > 1 ? 's' : ''), pick: () => this.setState({ city: name }) };
    });
    const cityClubs = D.clubs.filter((c) => c.city === s.city).map((c) => clubV(c));

    // ---------- TERRAIN ----------
    const boardSports = ['Football', 'Basketball', 'Handball', 'Water-polo', 'Rugby', 'Volley-ball', 'Trail', 'Natation', 'Judo', 'Tennis'].filter((sp, i, a) => a.indexOf(sp) === i && (['Football', 'Basketball', 'Water-polo', 'Rugby', 'Trail', 'Natation', 'Judo', 'Tennis'].indexOf(sp) >= 0 || (X.comps[sp] || []).length));
    const dSports = boardSports.map((sp) => Object.assign(pill(sp === s.dSport), { label: sp, hasLive: allM.some((m) => m.sport === sp && m.status === 'live'),
      pick: () => this.setState({ dSport: sp, dComp: firstComp(sp), dZone: '', dNiv: '', matchId: null }) }));
    // championnats des fédérations : filtres par zone (Manche d'abord, puis le reste de la Normandie) et par niveau
    const compsAll = X.comps[s.dSport] || [];
    const spAuto = ((typeof window !== 'undefined' && window.CASA_SPORT_AUTO) || {})[s.dSport] || {};
    const spMaj = spAuto.maj || (window.CASA_SPORT || {}).maj;
    const zonesHere = compsAll.map((c) => c.zone).filter((z, i, a) => z && a.indexOf(z) === i);
    const dZoneId = zonesHere.indexOf(s.dZone) >= 0 ? s.dZone : (zonesHere[0] || '');
    const inZone = compsAll.filter((c) => !zonesHere.length || (c.zone || '') === dZoneId);
    const nivsHere = inZone.map((c) => c.niveau).filter((z, i, a) => z && a.indexOf(z) === i);
    const dNivId = nivsHere.indexOf(s.dNiv) >= 0 ? s.dNiv : (nivsHere.indexOf('Seniors') >= 0 ? 'Seniors' : (nivsHere[0] || ''));
    const compsHere = inZone.filter((c) => nivsHere.length < 2 || (c.niveau || '') === dNivId);
    const dZones = zonesHere.length > 1 ? zonesHere.map((z) => Object.assign(pill(z === dZoneId), { label: z, pick: () => this.setState({ dZone: z, dNiv: '', dComp: null }) })) : [];
    const dNivs = nivsHere.length > 1 ? nivsHere.map((z) => Object.assign(pill(z === dNivId), { label: z, pick: () => this.setState({ dNiv: z, dComp: null }) })) : [];
    const dCompId = compsHere.some((c) => c.id === s.dComp) ? s.dComp : (compsHere[0] || {}).id;
    const dComps = compsHere.map((c) => Object.assign(pill(c.id === dCompId), { label: (String(c.label || '').charAt(0).toUpperCase() + String(c.label || '').slice(1)), cur: c.id === dCompId ? 'is-on' : '', pick: () => this.setState({ dComp: c.id }) }));
    const inComp = allM.filter((m) => m.sport === s.dSport && m.compId === dCompId);
    const sportHasData = inComp.length > 0;
    const tabDefs = [['live', 'Direct'], ['results', 'Résultats'], ['agenda', 'Agenda'], ['cal', 'Calendrier'], ['table', 'Classement'], ['pronos', 'Pronos']];
    const dTabs = tabDefs.map(([id, label]) => ({ label, sel: s.dTab === id ? 'true' : 'false', color: s.dTab === id ? 'var(--ink)' : 'var(--muted)', line: s.dTab === id ? accent : 'transparent', pick: () => this.setState({ dTab: id }) }));
    const liveM = inComp.filter((m) => m.status === 'live');
    const upM = inComp.filter((m) => m.status === 'up').sort(byDate);
    const liveCards = liveM.length ? liveM : upM.slice(0, 3);
    const resultRows = inComp.filter((m) => m.status === 'done').sort((a, b) => (a.date > b.date ? -1 : 1));
    const agendaRows = upM.map((m) => { const d = pd(m.date); return Object.assign({}, m, { dow: d ? DOW[d.getDay()] : '—', day: d ? String(d.getDate()) : '?', mon: d ? MONTHS[d.getMonth()] : 'à conf.' }); });
    const tbl = X.tables[dCompId];
    const tableRows = (tbl || []).map((r, i) => {
      const cid = X.teamClub[r.team];
      const followed = cid && s.follows.indexOf(cid) >= 0;
      return Object.assign({}, r, { rank: String(i + 1), j: String(r.j), g: String(r.g), n: String(r.n), p: String(r.p), pts: String(r.pts), followed: !!followed,
        bg: followed ? 'var(--note-bg)' : 'var(--surface)', rankBg: i === 0 ? accent : i === tbl.length - 1 ? 'var(--danger-bg)' : 'var(--surface-2)', rankFg: i === 0 ? 'var(--on-acc)' : 'var(--ink)',
        form: String(r.form || '').split('').map((l) => ({ l, bg: l === 'V' ? '#18705f' : l === 'N' ? '#8f9aa8' : 'var(--danger)' })), hasForm: !!r.form, teamN: cbNomEquipe(r.team), diffS: (Number(r.diff) > 0 ? '+' : '') + r.diff, podium: i < 3 ? 'is-top' : '', last: i === tbl.length - 1 && tbl.length > 3 ? 'is-last' : '', open: openClubByTeam(r.team) });
    });
    // calendrier
    const year = 2026, month = s.calMonth;
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const nDays = new Date(year, month + 1, 0).getDate();
    const sportM = allM.filter((m) => m.sport === s.dSport && m.date);
    const calCells = [];
    for (let i = 0; i < offset; i++) calCells.push({ n: '', disabled: true, aria: 'vide', border: 'transparent', bg: 'transparent', fg: 'var(--text)', dot: 'transparent', op: 1, pick: () => {} });
    for (let d = 1; d <= nDays; d++) {
      const iso = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      const has = sportM.filter((m) => m.date === iso);
      const sel = s.calDay === d;
      const today = month === 9 && d === 6;
      calCells.push({ n: String(d), disabled: false, aria: d + ' ' + MONTHS_L[month] + (has.length ? ', ' + has.length + ' match(s)' : ''), border: today ? accent : sel ? 'var(--ink)' : 'var(--line)',
        bg: sel ? 'var(--inv-bg)' : 'var(--surface)', fg: sel ? 'var(--on-inv)' : 'var(--text)', dot: has.length ? (has.some((m) => m.status === 'live') ? '#e03040' : sel ? 'var(--on-inv)' : 'var(--ink)') : 'transparent', op: 1, pick: () => this.setState({ calDay: d }) });
    }
    const selIso = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(s.calDay).padStart(2, '0');
    const calDayMatches = sportM.filter((m) => m.date === selIso);
    // pronos
    const pronoRows = allM.filter((m) => m.status === 'up' && m.sport === s.dSport);
    const pronoCount = String(Object.keys(s.pronos).length);
    // fiche match
    const mxRaw = allM.find((m) => m.id === s.matchId);
    const mx = mxRaw || allM[0];

    // ---------- BOUTIQUE ----------
    const lineName = { casa: 'Casa Besports', cherwood: 'Cherwood × Casa', goodies: 'Goodies', vikings: 'Collection Vikings', atelier: 'Créations Casa' };
    ((window.CASA_BOUTIQUE || {}).collections || []).forEach((c) => { if (c && c.ligne) lineName[c.ligne] = c.nom; });
    const tints = { casa: '#f4f1ea', cherwood: '#eef1ec', goodies: '#f7f0e2', vikings: '#efeeea', atelier: '#efeeea' };
    const prodV = (p) => {
      const c = p.colors[0];
      const mp = X.markPos[p.type] || [60, 9];
      const dark = ['#0f2236', '#1f3b33'].indexOf(c.hex) >= 0;
      return Object.assign({}, p, {
        tint: tints[p.line], color: c.hex, path: X.paths[p.type], isPoster: p.type === 'poster', notPoster: p.type !== 'poster', hasImg: !!p.img, isIcon: !p.img && p.type !== 'poster',
        mark: mp[0] ? p.mark : '', markY: String(mp[0]), markSize: String(p.mark.length > 9 ? 6 : mp[1]), markColor: dark ? '#ffffff' : '#0f2236',
        line: lineName[p.line], badgeBg: p.line === 'cherwood' ? '#1f3b33' : p.line === 'goodies' ? '#8a5a0e' : p.line === 'vikings' || p.line === 'atelier' ? '#14171c' : '#080f1a', badgeFg: '#ffffff',
        priceLabel: (p.priceBySize ? 'dès ' : '') + eur0(p.price), hasFlag: !!p.flag,
        open: () => this.go('product', { productId: p.id, color: 0, size: null, qty: 1, persoName: '', persoNum: '', sizeGuide: false, prodImg: 0 }),
        quickLabel: p.sizes ? 'Choisir' : 'Ajouter au panier',
        quickAdd: () => { if (p.sizes) { this.go('product', { productId: p.id, color: 0, size: null, qty: 1, persoName: '', persoNum: '' }); return; } this.addLine(p, 0, null, 1, ''); }
      });
    };
    const creaProducts = X.products.filter((p) => p.line === 'atelier'); const hasCrea = creaProducts.length > 0; const shopLineEff = s.shopLine === 'Créations Casa' && !hasCrea ? 'Tout' : s.shopLine;
    const shopLinesDefs = ['Tout', 'Collection Vikings', 'Casa Besports', 'Cherwood × Casa', 'Goodies'].concat(hasCrea ? ['Créations Casa'] : []);
    const shopLines = shopLinesDefs.map((l) => Object.assign(pill(l === shopLineEff), { label: l, pick: () => this.setState({ shopLine: l }) }));
    const lineKey = { 'Collection Vikings': 'vikings', 'Casa Besports': 'casa', 'Cherwood × Casa': 'cherwood', 'Goodies': 'goodies', 'Créations Casa': 'atelier' };
    let shopProducts = X.products.filter((p) => shopLineEff === 'Tout' || p.line === lineKey[shopLineEff]);
    shopProducts = shopProducts.slice().sort((a, b) => s.shopSort === 'asc' ? a.price - b.price : s.shopSort === 'desc' ? b.price - a.price : s.shopSort === 'new' ? (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) : a.pop - b.pop).map(prodV);
    const homeProducts = (['kit-runes', 'tee-viking', 'hoodie-roule', 'kit-nuit'].map((id) => X.products.find((p) => p.id === id)).filter(Boolean).concat(X.products)).filter((p, i, a) => a.indexOf(p) === i).slice(0, 4).map(prodV);
    // L’affiche du Cotentin : chaque collection a son affiche de voyage
    const AS = (id) => (typeof BLOB_FILES !== 'undefined' ? (window.ASSET_DATA[BLOB_FILES[id]] || ('assets/' + (BLOB_FILES[id] || id))) : '/_blob/' + id);
    const imgOf = (id) => (X.products.find((p) => p.id === id) || {}).img;
    const lineStat = (k) => { const ps = X.products.filter((p) => p.line === k); return ps.length ? ps.length + ' pièces · dès ' + eur0(Math.min.apply(null, ps.map((p) => p.price))) : 'Bientôt disponible'; };
    const BQ = window.CASA_BOUTIQUE || {};
    const shopPres = { surtitre: BQ.surtitre || '', titre: BQ.titre || '', texte: BQ.texte || '', avantages: (BQ.avantages || []).map((t) => ({ t: String(t).replace(/Casa B\+/g, 'BE+') })), note: BQ.note || '', image: BQ.image || 'assets/ph_kit_runes.jpg', imageAlt: BQ.imageAlt || '' };
    const shopPosters = [
      ...(BQ.collections || []).map((c) => ({ line: c.nom, kick: c.accroche || '', title: c.titre || c.nom, tag: c.texte || '', img: c.image || (X.products.find((p) => p.line === c.ligne) || {}).img || 'assets/hero.jpg', credits: lineStat(c.ligne) }))
    ].map((d) => Object.assign({ pressed: s.shopLine === d.line ? 'true' : 'false', aria: d.title + ' : afficher la collection ' + d.line, cta: s.shopLine === d.line ? 'Collection affichée' : 'Voir la collection', pick: () => this.setState({ shopLine: s.shopLine === d.line ? 'Tout' : d.line }) }, d));
    // Vos maillots de cœur : les boutiques officielles des clubs du Cotentin (liens marqués « vient de Casa Besports »)
    const clubLogo = (id) => { const c = (window.CASA_CLUBS || []).find((x) => x && x.id === id); return c ? (c.logo || '') : ''; };
    const mcItems = (BQ.maillots || []).filter((m) => m && m.nom && m.boutiqueUrl && m.actif !== false).map((m, i) => {
      const logo = m.logo || clubLogo(m.club);
      return { nom: m.nom, meta: [m.sport, m.city].filter(Boolean).join(' · '), plateforme: m.plateforme || '', hasPlat: !!m.plateforme, logo, hasLogo: !!logo, noLogo: !logo,
        mono: String(m.nom).replace(/^(AS|US|FC|CS|SC|PL|ES|JS|UC|RC)\s+/i, '').charAt(0).toUpperCase() || '?',
        href: cbPartnerLink(m.boutiqueUrl, 'maillots-' + (m.club || i), 'boutique-club'), aria: 'Boutique officielle de ' + m.nom + ' (nouvel onglet)' };
    }).filter((m) => m.href);
    const maillots = { show: mcItems.length > 0, titre: BQ.maillotsTitre || 'Vos maillots de cœur', texte: BQ.maillotsTexte || '', items: mcItems,
      voir: () => { try { const el = document.getElementById('maillots-de-coeur'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} } };
    const nuitP = X.products.find((p) => p.id === 'kit-nuit');
    const trailer = nuitP ? { name: nuitP.name, title: 'Nuit', sub: 'Le maillot third des Vikings du Cotentin : noir profond à fines rayures, médaillon et écusson pentagone dorés.', img: nuitP.img, price: eur0(nuitP.price), open: () => this.go('product', { productId: 'kit-nuit', color: 0, size: null, qty: 1, persoName: '', persoNum: '', sizeGuide: false, prodImg: 0 }) } : {};
    const showTrailer = !!nuitP && (s.shopLine === 'Tout' || s.shopLine === 'Collection Vikings');
    // Créations Casa : le bandeau de la collection et la gestion des articles venus de l’Atelier
    const openPr = (id) => this.go('product', { productId: id, color: 0, size: null, qty: 1, persoName: '', persoNum: '', sizeGuide: false, prodImg: 0 });
    const creaSorted = creaProducts.slice().reverse();
    const creaBanner = { show: hasCrea && (shopLineEff === 'Tout' || shopLineEff === 'Créations Casa'), sub: (() => { const ps = creaProducts.map((p) => p.price); const lo = Math.min.apply(null, ps.concat([1e9])), hi = Math.max.apply(null, ps.concat([0])); return creaProducts.length + (creaProducts.length > 1 ? ' pièces dessinées' : ' pièce dessinée') + ' dans l’Atelier Casa Besports, ' + (lo === hi ? 'à ' + eur0(lo) : 'de ' + eur0(lo) + ' à ' + eur0(hi)) + '.'; })(),
      cta: shopLineEff === 'Créations Casa' ? 'Voir toute la boutique' : 'Voir les créations', go: () => this.setState({ shopLine: shopLineEff === 'Créations Casa' ? 'Tout' : 'Créations Casa' }),
      items: creaSorted.slice(0, 3).map((p) => ({ img: p.img, price: eur0(p.price), aria: p.name + ', ' + eur0(p.price), open: () => openPr(p.id) })) };
    const creaSrv = !!(window.CB_SERVER && window.CB); const creaTeamOn = creaSrv && !!window.CB.siteRole && ['admin', 'writer'].indexOf(window.CB.siteRole) >= 0; const creaChief = creaSrv && !!window.CB.user && ['admin', 'collaborateur'].indexOf(window.CB.user.role) >= 0;
    const creaList = creaSrv ? (s.creaTeam || []) : (this._crea || []);
    const creaItems = creaList.map((p) => { const st = p.status || 'publie'; const can = !creaSrv || creaChief; return { img: p.img, name: p.name, meta: (p.supportName ? p.supportName + ' · ' : '') + eur0(p.price) + (p.technique ? ' · ' + p.technique : ''), statusLabel: st === 'publie' ? 'En boutique' : st === 'retire' ? 'Retiré' : 'Brouillon',
      open: () => { if (X.products.some((x) => x.id === p.id)) openPr(p.id); else this.say('Article pas encore en boutique'); }, canToggle: can, toggleLabel: st === 'publie' ? 'Retirer' : creaSrv ? 'Publier' : 'Remettre en boutique', toggle: () => this.creaSet(p.id, st === 'publie' ? 'retire' : 'publie'),
      canDel: can || (creaSrv && st !== 'publie' && window.CB.user && p.byId === window.CB.user.id), delLabel: s.creaSure === p.id ? 'Confirmer la suppression' : 'Supprimer', del: () => this.creaDel(p.id) }; });
    const crea = { show: creaSrv ? creaTeamOn : true, open: !!s.creaOpen, openAria: s.creaOpen ? 'true' : 'false', toggleLabel: s.creaOpen ? 'Masquer la liste' : 'Gérer les articles' + (creaList.length ? ' (' + creaList.length + ')' : ''),
      toggle: () => { const o = !s.creaOpen; this.setState({ creaOpen: o }); if (o) this.creaTeamLoad(); }, onFile: (e) => { const f = e.target.files && e.target.files[0]; try { e.target.value = ''; } catch (er) {} this.creaImport(f); },
      msg: s.creaMsg || '', items: creaItems, empty: !creaItems.length, emptyText: creaSrv ? 'Aucun article de l’Atelier pour l’instant : créez-en un dans l’Atelier › Studio Boutique.' : 'Aucun article importé sur cet appareil pour l’instant.',
      lead: creaSrv ? 'Articles créés dans le Studio Boutique de l’Atelier' : 'Ajoutez les articles créés dans le Studio Boutique de l’Atelier',
      help: creaSrv ? (creaChief ? 'Les articles envoyés depuis l’Atelier arrivent ici. Publiez-les pour les afficher dans la collection « Créations Casa » du site et de l’application.' : 'Les articles envoyés depuis l’Atelier arrivent en brouillon ; un chef d’édition ou l’administrateur les publie.') : 'Dans l’Atelier, Studio Boutique › Ajouter à la boutique (ou Exporter › Pack boutique) crée un fichier .casa-boutique.json : importez-le ici. Les articles importés restent sur cet appareil.' };
    // fiche produit
    const curPr = X.products.find((p) => p.id === s.productId) || X.products[0] || EMPTY_PROD;
    const ci = Math.min(s.color, curPr.colors.length - 1);
    const unit = curPr.priceBySize ? curPr.priceBySize[Math.max(0, curPr.sizes.indexOf(s.size))] : curPr.price;
    const persoFee = curPr.perso && s.persoName.trim() ? 8 : 0;
    const prod = Object.assign(prodV(curPr), {
      color: curPr.colors[ci].hex, colorName: curPr.colors[ci].name, lineLong: curPr.line === 'cherwood' ? 'Cherwood × Casa Besports · fait à Cherbourg' : curPr.line === 'atelier' ? 'Créations Casa · dessinées dans l’Atelier Casa Besports' : lineName[curPr.line],
      persoTitle: curPr.line === 'atelier' ? 'Personnalisation' : 'Personnalisation · atelier Cherwood',
      markColor: ['#0f2236', '#1f3b33'].indexOf(curPr.colors[ci].hex) >= 0 ? '#ffffff' : '#0f2236',
      hasColors: curPr.colors.length > 1, colors: curPr.colors.map((c, i) => ({ name: c.name, hex: c.hex, pressed: i === ci ? 'true' : 'false', ring: i === ci ? 'var(--ink)' : 'var(--line-2)', pick: () => this.setState({ color: i }) })),
      hasSizes: !!curPr.sizes, sizes: (curPr.sizes || []).map((z) => Object.assign(pill(z === s.size), { l: z, pick: () => this.setState({ size: z, prodError: '' }) })),
      persoable: !!curPr.perso, persoNum: curPr.perso === 'num', persoLabel: curPr.perso === 'num' ? 'Nom au dos' : 'Votre mention (ville, club, prénom)', persoPh: curPr.perso === 'num' ? 'MARTIN' : 'HAGUAIS',
      persoText: curPr.perso ? (s.persoName.toUpperCase() + (s.persoNum ? ' ' + s.persoNum : '')) : '', persoY: '92',
      priceLabel: eur0(unit)
    });
    if (curPr.perso === 'text' && s.persoName.trim()) { prod.mark = s.persoName.toUpperCase().slice(0, 14); prod.persoText = ''; }
    const gal = (curPr.imgsByColor && curPr.imgsByColor[ci] && curPr.imgsByColor[ci].length ? curPr.imgsByColor[ci] : curPr.gallery) || [];
    const gIdx = Math.min(s.prodImg || 0, Math.max(0, gal.length - 1));
    if (gal.length) prod.img = gal[gIdx];
    prod.hasGallery = gal.length > 1;
    prod.gallery = gal.map((src, i) => ({ src, aria: (curPr.views && curPr.views[i]) || (i === 0 ? 'Vue d’ensemble' : 'Vue de détail'), pressed: i === gIdx ? 'true' : 'false', ring: i === gIdx ? 'var(--acc)' : '#ffffff', pick: () => this.setState({ prodImg: i }) }));
    prod.hasOverlay = curPr.perso === 'text' && gIdx === 0; prod.ovTop = '47%'; prod.overlayText = (s.persoName.trim() || 'CHERBOURGEOIS').toUpperCase().slice(0, 14);
    if (curPr.perso === 'text') { prod.mark = ''; }
    prod.hasBackPreview = curPr.perso === 'num' && !!s.persoName.trim(); prod.backText = s.persoName.toUpperCase().slice(0, 14) + (s.persoNum ? ' · ' + s.persoNum : '');
    // Casa Cinéma : le générique de la pièce (uniquement des informations publiées par la boutique)
    const textile = ['tee', 'hoodie', 'crew', 'short', 'jogger', 'pull', 'cap', 'bob', 'patch', 'tote', 'scarf'].indexOf(curPr.type) >= 0;
    prod.credits = [{ role: curPr.line === 'atelier' ? 'Une pièce des' : 'Une pièce de la', name: curPr.line === 'cherwood' ? 'Capsule Cherwood × Casa' : lineName[curPr.line] }];
    if (curPr.line === 'atelier') { prod.credits.push({ role: 'Dessinée dans', name: 'l’Atelier Casa Besports' }); if (curPr.technique) prod.credits.push({ role: 'Marquage', name: curPr.technique }); if (curPr.supportName) prod.credits.push({ role: 'Support', name: curPr.supportName }); }
    if (curPr.line !== 'goodies' && curPr.line !== 'atelier') prod.credits.push({ role: 'Dessinée dans le', name: 'Cotentin' });
    if (textile && curPr.line !== 'goodies' && curPr.line !== 'atelier') prod.credits.push({ role: 'Floquée et brodée à', name: 'Cherbourg' });
    if (curPr.perso && curPr.line !== 'atelier') prod.credits.push({ role: 'Personnalisation', name: 'Atelier Cherwood' });
    if (curPr.line === 'cherwood') prod.credits.push({ role: 'Avec', name: 'Cherwood, née à Cherbourg en 2017' });
    prod.star = curPr.line === 'atelier' ? (curPr.perso === 'num' ? 'Et votre nom au dos, au numéro de votre choix.' : '') : curPr.perso === 'num' ? 'Et votre nom au dos, floqué à Cherbourg.' : curPr.perso ? 'Et votre mention personnalisée, réalisée à Cherbourg.' : '';
    prod.hasStar = !!prod.star;
    const crossSell = X.products.filter((p) => p.id !== curPr.id && (p.line !== curPr.line || p.type !== curPr.type)).sort((a, b) => a.pop - b.pop).slice(0, 4).map(prodV);
    // panier
    const cartLines = s.cart.map((l, idx) => {
      const p = X.products.find((x) => x.id === l.id); if (!p) return null;
      return { hasImg: !!p.img, img: p.img, isIcon: !p.img, name: p.name, variant: [p.colors[l.color].name, l.size, l.perso].filter(Boolean).join(' · '), qty: String(l.qty), total: eur(l.unit * l.qty), tint: tints[p.line], color: p.colors[l.color].hex, path: X.paths[p.type] || X.paths.gift,
        open: () => this.go('product', { productId: p.id, color: l.color, size: l.size, qty: 1 }),
        inc: () => this.setState({ cart: s.cart.map((x, i) => i === idx ? Object.assign({}, x, { qty: x.qty + 1 }) : x) }),
        dec: () => this.setState({ cart: s.cart.map((x, i) => i === idx ? Object.assign({}, x, { qty: x.qty - 1 }) : x).filter((x) => x.qty > 0) }),
        remove: () => { this.setState({ cart: s.cart.filter((x, i) => i !== idx) }); this.say('Article retiré'); } };
    }).filter(Boolean);
    const cartCount = s.cart.reduce((n, l) => n + l.qty, 0);
    const sub = s.cart.reduce((n, l) => n + l.unit * l.qty, 0);
    const disc10 = subscribed ? Math.round(sub * 10) / 100 : 0;
    const net = sub - disc10;
    const FREE = 60;
    const shipPrice = { home: net >= FREE ? 0 : 4.9, cherwood: 0, stade: 0 }[s.ship];
    const total = net + shipPrice + (s.giftWrap ? 3 : 0);
    const shipOpts = [['home', 'Livraison à domicile', '2 à 4 jours ouvrés', net >= FREE ? 'Offerte' : eur(4.9)], ['cherwood', 'Retrait boutique Cherwood', 'Centre-ville de Cherbourg · prêt sous 24 h', 'Gratuit'], ['stade', 'Retrait au stade', 'Au stand Casa Besports les jours de grands matchs', 'Gratuit']]
      .map(([id, label, sub2, price]) => ({ label, sub: sub2, price, pressed: s.ship === id ? 'true' : 'false', border: s.ship === id ? 'var(--ink)' : 'var(--line)', pick: () => this.setState({ ship: id }) }));

    // ---------- ABONNEMENTS ----------
    const period = s.period;
    const priceOf = (id) => X.subPlans[id][period === 'an' ? 'an' : 'mois'];
    const perLabel = period === 'an' ? '/ an' : '/ mois';
    const periods = [['mois', 'Mensuel'], ['an', 'Annuel · 2 mois offerts']].map(([id, label]) => Object.assign(pill(s.period === id), { label, pick: () => this.setState({ period: id }) }));
    const offerTabsDefs = ['Tout', 'Casa B+', 'La Gazette', 'Packs'];
    const offerTabs = offerTabsDefs.map((t) => ({ label: t, sel: s.offerTab === t ? 'true' : 'false', color: s.offerTab === t ? 'var(--ink)' : 'var(--muted)', line: s.offerTab === t ? accent : 'transparent', pick: () => this.setState({ offerTab: t }) }));
    const tabPlans = { 'Tout': ['casab', 'gaz-duo', 'pack'], 'Casa B+': ['casab', 'pack'], 'La Gazette': ['gaz-num', 'gaz-pap', 'gaz-duo'], 'Packs': ['pack', 'gaz-duo'] }[s.offerTab];
    const owned = (id) => { const p = X.subPlans[id]; return (p.casab ? s.subs.casab : true) && (p.gazette ? s.subs.gazette === p.gazette || (s.subs.gazette === 'duo' && p.gazette !== 'duo') : true) && (p.casab || p.gazette); };
    const offerCards = tabPlans.map((id) => {
      const p = X.subPlans[id];
      const hero = id === 'pack' || (s.offerTab === 'La Gazette' && id === 'gaz-duo');
      const has = owned(id);
      return { name: p.name, price: eur(priceOf(id)), per: perLabel, note: period === 'an' ? 'soit ' + eur(priceOf(id) / 12) + ' / mois' : 'Sans engagement',
        perks: p.perks.map((t) => ({ t })), badge: id === 'pack' ? 'Le plus complet' : id === 'gaz-duo' ? 'Recommandé' : id === 'casab' ? 'Le digital' : id === 'gaz-pap' ? 'Le papier' : 'Le numérique',
        deep: hero ? 'cb-deep' : '', bg: hero ? 'var(--inv-bg)' : 'var(--surface)', fg: hero ? 'var(--on-inv-2)' : 'var(--text)', border: hero ? 'var(--inv-bg)' : 'var(--line)', titleColor: hero ? 'var(--on-inv)' : 'var(--ink)',
        badgeBg: hero ? accent : 'var(--surface-2)', badgeFg: hero ? 'var(--on-acc)' : 'var(--gold-text)', ctaBg: hero ? accent : 'var(--inv-bg)', ctaFg: hero ? 'var(--on-acc)' : 'var(--on-inv)',
        cta: has ? 'Déjà abonné ✓' : 'Choisir', go: () => (has ? this.go('account') : this.go('checkout', { subPlan: id, step: 1, isGift: false })) };
    });
    const sp = X.subPlans[s.subPlan];
    const steps = ['Formule', 'Coordonnées', 'Paiement'].map((label, i) => ({ label, bar: s.step > i ? accent : 'var(--line)', color: s.step > i ? 'var(--ink)' : 'var(--muted-2)' }));
    const validEmail = /.+@.+\..+/.test(s.email);
    const authLive = !!(window.CasaAuth && window.CasaAuth.on);
    const subNeedsAddress = sp.paper;

    // ---------- Gazette liseuse ----------
    // ---------- lieux ----------
    const placeByView = { home: 'rade', news: 'gatteville', article: 'gatteville', live: 'gare', videos: 'gare', video: 'gare', disciplines: 'sme', discipline: 'sme', clubs: 'jobourg', club: 'jobourg', map: 'jobourg', players: 'sme', player: 'sme', shop: 'rade', product: 'rade', order: 'rade', offers: 'gatteville', checkout: 'gatteville', partners: 'gare', about: 'rade', contact: 'jobourg', account: 'jobourg', studio: 'rade', legal: 'jobourg', meteo: 'gatteville', private: 'rade', culture: 'gare', clubhouse: 'jobourg', olisto: 'rade', app: 'gatteville' };
    const placeId = s.placeOverride || placeByView[s.view] || 'rade';
    const placeRaw = X.places.find((p) => p.id === placeId) || X.places[0];
    const place = placeRaw;
    const places = X.places.map((p, i) => Object.assign({}, p, { open: () => this.setState({ placeOpen: true, placeIdx: i }) }));
    const ppRaw = X.places[s.placeIdx] || placeRaw;
    const pi = X.places.indexOf(ppRaw);
    const pinned = s.placeOverride === ppRaw.id;
    const pp = Object.assign({}, ppRaw, {
      prev: () => this.setState({ placeIdx: (pi + X.places.length - 1) % X.places.length }), next: () => this.setState({ placeIdx: (pi + 1) % X.places.length }),
      pinLabel: pinned ? 'Revenir au fond automatique' : 'Garder ce lieu en fond', pin: () => { this.setState({ placeOverride: pinned ? null : ppRaw.id }); this.say(pinned ? 'Fond automatique selon la page' : ppRaw.short + ' en arrière-plan'); }
    });
    // ---------- fond photo : vraies images du sport du Cotentin ----------
    // fonds photo : réglés dans contenus/fonds.js (une image par page)
    const FD = window.CASA_FONDS || {}; const FP = FD.pages || {};
    const pageOfView = { home: 'accueil', news: 'actualites', article: 'actualites', live: 'direct', videos: 'videos', video: 'videos', disciplines: 'disciplines', discipline: 'disciplines', clubs: 'clubs', club: 'clubs', map: 'clubs', players: 'joueurs', player: 'joueurs',
      shop: 'boutique', product: 'boutique', order: 'boutique', checkout: 'boutique', offers: 'abonnements', account: 'compte', cv: 'compte', private: 'quotidien', clubhouse: 'clubhouse', culture: 'culture', meteo: 'meteo', partners: 'partenaires', olisto: 'partenaires',
      about: 'apropos', contact: 'contact', legal: 'mentions', app: 'application', studio: 'redaction' };
    const fondOrig = (window.CasaAuth && CasaAuth.originalContent && (CasaAuth.originalContent('CASA_FONDS') || {}).pages) || {};
    let phEntry = FP[pageOfView[s.view]];
    const pageTeinte = Array.isArray(phEntry) ? phEntry[2] : null;
    if (Array.isArray(phEntry) && !phEntry[0]) phEntry = fondOrig[pageOfView[s.view]] ? [fondOrig[pageOfView[s.view]][0], phEntry[1] || 'center'] : null;
    if (phEntry === '') phEntry = fondOrig[pageOfView[s.view]] || null;
    const PH = { cur: Array.isArray(phEntry) ? phEntry : (typeof phEntry === 'string' ? [phEntry, 'center'] : null) };
    const bgMode = ['photo', 'lieux', 'aucun'].indexOf(s.bgMode) >= 0 ? s.bgMode : (['photo', 'lieux'].indexOf(FD.modeParDefaut) >= 0 ? FD.modeParDefaut : 'aucun');
    const phKey = PH.cur ? 'cur' : null;
    const usePhoto = bgMode === 'photo' && !s.placeOverride && !!phKey && showPlaces;
    // Couleur : photos en noir et blanc (signature) ou en couleur, et teinte de fond facultative (réglage du site, d'une page, ou du visiteur)
    const hexOk = (c) => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
    const bgCouleur = s.bgCouleur === 'couleur' ? true : s.bgCouleur === 'nb' ? false : FD.photosEnCouleur === true;
    const teinte = s.bgTeinte === 'aucune' ? '' : hexOk(s.bgTeinte) ? s.bgTeinte : hexOk(pageTeinte) ? pageTeinte : hexOk(FD.teinte) ? FD.teinte : '';
    const bg = { isPhoto: usePhoto, isIllu: !usePhoto && bgMode !== 'aucun', img: usePhoto ? PH[phKey][0] : '', pos: usePhoto ? PH[phKey][1] : 'center', op: s.view === 'studio' ? '.35' : '1',
      colorCls: bgCouleur ? 'is-couleur' : '', illuFilter: bgCouleur ? 'saturate(1.05)' : 'var(--place-filter)',
      hasTeinte: !!teinte, teinte: teinte || 'transparent', teinteBlend: usePhoto ? (bgCouleur ? 'soft-light' : 'color') : 'normal', teinteOp: usePhoto ? (bgCouleur ? '.45' : '.6') : (s.view === 'studio' ? '.06' : '.2') };
    const bgModes = [['aucun', 'Fond uni', 'Blanc ou noir, ou la teinte choisie ci-dessous'], ['photo', 'Photos du terrain', 'Vraies images des clubs'], ['lieux', 'Lieux de légende', 'Illustrations du patrimoine']].map(([id, label, sub]) => ({ label, sub, checked: id === bgMode ? 'true' : 'false', border: id === bgMode ? 'var(--acc)' : 'var(--line)', pick: () => { this.setBg({ bgMode: id }); this.setState({ placeOverride: null }); } }));
    const bgColorOpts = [['nb', 'Noir et blanc', 'La signature Casa Besports'], ['couleur', 'En couleur', 'Les photos telles qu’elles ont été prises']].map(([id, label, sub]) => { const on = (id === 'couleur') === bgCouleur; return { label, sub, checked: on ? 'true' : 'false', border: on ? 'var(--acc)' : 'var(--line)', pick: () => this.setBg({ bgCouleur: id }) }; });
    const teintes = [['aucune', 'Aucune'], ['#1d4e89', 'Bleu Manche'], ['#0f8b8d', 'Vert d’eau'], ['#2e7d4f', 'Vert bocage'], ['#e8a830', 'Or'], ['#c2410c', 'Orange'], ['#b3261e', 'Rouge'], ['#6b3fa0', 'Violet']].map(([id, label]) => {
      const on = id === 'aucune' ? !teinte : teinte.toLowerCase() === id;
      return { label, isNone: id === 'aucune', sw: id === 'aucune' ? 'transparent' : id, checked: on ? 'true' : 'false', ring: on ? 'var(--ink)' : 'var(--line-2)', pick: () => this.setBg({ bgTeinte: id }) };
    });
    const teinteLibre = { value: teinte || '#1d4e89', onInput: (e) => { if (hexOk(e.target.value)) this.setBg({ bgTeinte: e.target.value.toLowerCase() }); }, reset: () => this.setBg({ bgCouleur: null, bgTeinte: null }), isPerso: s.bgCouleur != null || s.bgTeinte != null };
    const placeOpacity = showPlaces && bgMode !== 'aucun' ? (s.view === 'studio' ? 0.06 : Math.min(0.5, k * 0.55)) : 0;

    // ---------- partenaires ----------
    const partners = X.partners.map((p) => Object.assign({}, p, { open: () => this.setState({ partnerId: p.id }) }));
    const tiersDef = [['Platinum', 'Partenaire Platinum', '#e8a830', '360px', '130px'], ['Or', 'Partenaires Or', '#9a6410', '300px', '110px'], ['Club', 'Partenaires Club', '#8f9aa8', '260px', '100px']];
    const partnerTiers = tiersDef.map(([id, label, line, min, h]) => ({ label, line, min, h, items: partners.filter((p) => p.tier === id) }));
    const ptRaw = X.partners.find((p) => p.id === s.partnerId);
    const claimed = ptRaw && s.claimed.indexOf(ptRaw.id) >= 0;
    const ptBase = ptRaw || X.partners[0] || {};
    const pt = Object.assign({}, ptBase, {
      siteHref: cbPartnerLink(ptBase.site, ptBase.id, 'site'), appHref: cbPartnerLink(ptBase.app, ptBase.id, 'application'),
      hasSite: !!cbPartnerLink(ptBase.site, ptBase.id, 'site'), hasApp: !!cbPartnerLink(ptBase.app, ptBase.id, 'application'),
      note: ptRaw && ptRaw.real ? 'Partenaire Casa Besports.' : 'Partenaire Casa Besports.',
      claimLabel: ptRaw && ptRaw.real ? 'Découvrir l’offre OlistO' : claimed ? 'Avantage enregistré ✓' : (subscribed ? 'Profiter de l’avantage' : 'Réservé aux abonnés Casa B+'),
      claim: () => { if (ptRaw && ptRaw.real) { this.go('olisto'); return; } if (!subscribed) { this.go('offers', { offerTab: 'Casa B+' }); return; } if (!claimed) { this.setState({ claimed: s.claimed.concat([ptRaw.id]) }); this.say('Avantage ajouté à Mon espace'); } }
    });

    // ---------- Gazette (liseuse, édition « Le bandeau ») ----------
    const G = this.gazette();
    const NP = G.pages.length;
    const pIdx = Math.max(0, Math.min(NP - 1, s.page || 0));
    const pgRaw = G.pages[pIdx];
    const gzGo = (i) => this.gzGo(i);
    const initials2 = (t) => t.replace(/^(AS|ES|FC|CS|US|UC|SC)\s/, '').split(/[\s-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    // Titre : le début posé sur le bandeau noir, comme le logo ; la suite en noir sur le papier
    const splitT = (t, band) => {
      t = String(t || '');
      if (band && t.indexOf(band) === 0) return { a: band, b: t.slice(band.length) };
      const w = t.split(' ');
      if (w.length <= 2) return { a: t, b: '' };
      const k = w[0].length <= 3 ? 2 : 1;
      return { a: w.slice(0, k).join(' '), b: ' ' + w.slice(k).join(' ') };
    };
    const tt = splitT(pgRaw.title, pgRaw.band);
    const chocI = G.idx('choc'), chocP = G.pages[chocI];
    const gzCh = pgRaw.kind !== 'choc' ? pgRaw.choc : null;
    const K = pgRaw.kind;
    const pg = Object.assign({}, pgRaw, {
      isCover: K === 'cover', isToc: K === 'toc', isArticle: K === 'article', isBrief: K === 'brief', isQa: K === 'qa', isNumber: K === 'number', isStory: K === 'story', isPortrait: K === 'portrait', isChalk: K === 'chalk', isAgenda: K === 'agenda', isQuiz: K === 'quiz', isAds: K === 'ads', isBack: K === 'back',
      isChoc: K === 'choc', isDebat: K === 'debat', isRetro: K === 'retro', isLexique: K === 'lexique', isHumeur: K === 'humeur',
      pageCls: K === 'choc' ? 'is-noir' : K === 'cover' ? 'is-une' : '',
      hasRunning: ['cover', 'back'].indexOf(K) < 0, showH: K !== 'choc', tA: tt.a, tB: tt.b, hasTB: !!tt.b, hasScript: !!pgRaw.script,
      // article : chapô court (ou absent) et pas de score → photo en pleine largeur sous le chapô ; sinon chapô et photo côte à côte
      artCls: (() => {
        const M = pgRaw.mise || 'auto';
        if (K !== 'article') return '';
        if (M === 'haut') return 'is-wide gz-imgfirst';
        if (M === 'milieu' || M === 'bas') return 'is-wide';
        if (M === 'gauche') return 'gz-imgfirst';
        if (M === 'droite') return '';
        return !pgRaw.score && String(pgRaw.kicker || '').length < 160 ? 'is-wide' : '';
      })(),
      // format de l'image choisi dans l'espace admin (sinon celui du modèle de page)
      imgRatio: ({ paysage: '16 / 9', classique: '4 / 3', carre: '1 / 1', portrait: '3 / 4', panoramique: '21 / 9', libre: 'auto' })[pgRaw.imgFormat] || ({ qa: '16 / 9', story: '21 / 9', portrait: '3 / 4', back: '16 / 9', number: '4 / 3' })[K] || (K === 'article' && ((pgRaw.mise === 'haut' || pgRaw.mise === 'milieu' || pgRaw.mise === 'bas') || (!pgRaw.mise || pgRaw.mise === 'auto') && !pgRaw.score && String(pgRaw.kicker || '').length < 160) ? '16 / 9' : '4 / 3'),
      revCls: K === 'portrait' && pgRaw.mise === 'gauche' ? 'gz-imgfirst' : K === 'number' && pgRaw.mise === 'droite' ? 'gz-imglast' : '',
      colCls: ({ '1': 'gz-c1', '2': 'gz-c2', '3': 'gz-c3' })[String(pgRaw.colonnes || '')] || '',
      hasImgGrid: !!pgRaw.img && !(K === 'article' && pgRaw.mise === 'bas'), hasImgBas: !!pgRaw.img && K === 'article' && pgRaw.mise === 'bas',
      hasKicker: !!pgRaw.kicker, hasImg: !!pgRaw.img, hasQuote: !!pgRaw.quote, hasQuoteBy: !!pgRaw.quoteBy, hasAside: !!pgRaw.aside, hasCols3: (pgRaw.cols3 || []).length > 0, hasScore: !!pgRaw.score, hasParas: (pgRaw.paras || []).length > 0,
      score: pgRaw.score ? Object.assign({}, pgRaw.score, { hi: initials2(pgRaw.score.home), ai: initials2(pgRaw.score.away) }) : { home: '', away: '', hs: '', as: '', cap: '', hi: '', ai: '' },
      aside: pgRaw.aside || { h: '', t: '' }, figClass: pgRaw.tilt ? 'gz-cadre' : '', dropClass: pgRaw.drop ? 'gz-drop' : '', imgFit: pgRaw.imgLight || pgRaw.imgFormat === 'libre' ? 'contain' : 'cover', hasStrip: !!(pgRaw.strip || []).length, strip: pgRaw.strip || [],
      hasChoc: !!gzCh, choc: gzCh ? { t: gzCh.t, src: gzCh.src || '', hasSrc: !!gzCh.src, hasGo: !!gzCh.go, goLabel: 'Lire le détail choc · p. ' + (chocP ? chocP.n : '') } : { t: '', src: '', hasSrc: false, hasGo: false, goLabel: '' },
      // nouvelles rubriques
      stats: pgRaw.stats || [], why: pgRaw.why || '', src: pgRaw.src || '', bigA: pgRaw.bigA || '', bigB: pgRaw.bigB || '', who: pgRaw.who || '',
      pourH: (pgRaw.pour || {}).h || '', pourPts: (pgRaw.pour || {}).pts || [], contreH: (pgRaw.contre || {}).h || '', contrePts: (pgRaw.contre || {}).pts || [], note: pgRaw.note || '',
      timeline: (pgRaw.timeline || []).map((x, i) => Object.assign({ n: String(i + 1), hasKm: !!x.km }, x)), num: pgRaw.num || { big: '', l: '' },
      entries: pgRaw.entries || [],
      baro: (pgRaw.baro || []).map((b) => ({ h: b.h, t: b.t, cls: 'is-' + b.dir, sym: { up: '↑', down: '↓', flat: '→' }[b.dir] || '→', aria: { up: 'En hausse', down: 'En baisse', flat: 'Stable' }[b.dir] || '' })),
      classement: (pgRaw.classement || []).map((x, i) => ({ n: String(i + 1), t: x.t })), clT: pgRaw.clT || '', clSub: pgRaw.clSub || ''
    });
    const tocItem = (p) => ({ p: p.n, rubric: p.rubric, title: p.title, thumb: p.img || p.thumb || '', hasThumb: !!(p.img || p.thumb), noThumb: !(p.img || p.thumb), glyph: p.glyph || '·', cls: p.id === 'choc' ? 'is-choc' : '', go: () => gzGo(p.i) });
    const tocSecs = G.secs.map((label) => ({ label, items: G.pages.filter((p) => p.sec === label).map(tocItem) })).filter((x) => x.items.length);
    const gzStrip = G.strip.map((i) => { const p = G.pages[i]; return { h: p.rubric, t: p.title, p: 'P. ' + p.n, cls: p.id === 'choc' ? 'is-choc' : '', go: () => gzGo(i) }; });
    const thumbs = G.pages.map((p, i) => ({ n: p.id === 'choc' ? '🔥' : p.n, cur: i === pIdx ? 'page' : 'false', cls: p.id === 'choc' ? 'is-choc' : '', label: 'Page ' + p.n + ' : ' + p.title, go: () => gzGo(i) }));
    const quiz = G.quiz.map(([qq, opts, good], qi) => ({ n: String(qi + 1), q: qq, img: G.quizImgs[qi], opts: opts.map((t, oi) => {
      const pick = s.quizAns[qi];
      const answered = pick !== undefined;
      const right = oi === good, chosen = pick === oi;
      return { t: answered && right ? '✓ ' + t : answered && chosen ? '✕ ' + t : t, cls: answered ? (right ? 'is-ok' : chosen ? 'is-ko' : 'is-dim') : '', pressed: chosen ? 'true' : 'false',
        pick: () => { if (!answered) this.setState({ quizAns: Object.assign({}, s.quizAns, { [qi]: oi }) }); } };
    }) }));
    const quizScore = String(G.quiz.filter(([, , good], qi) => s.quizAns[qi] === good).length);
    // La question qui divise : l’avis reste sur l’appareil ; pour qu’il compte, le lecteur l’envoie à la rédaction (formulaire de contact → CRM)
    const voteTxt = { pour: 'je garde le dimanche 15 h', contre: 'il est temps de changer d’horaire' };
    const gzVote = { done: !!voteTxt[s.gzVote], msg: voteTxt[s.gzVote] ? 'Votre avis : ' + voteTxt[s.gzVote] + '. Envoyez-le à la rédaction pour qu’il compte dans le prochain numéro.' : '',
      opts: [['pour', 'Je garde le dimanche 15 h'], ['contre', 'Je change d’horaire']].map(([id, label]) => ({ label, pressed: s.gzVote === id ? 'true' : 'false', pick: () => { this.setState({ gzVote: id }); this.writeLS('cb-gz-vote', id); } })),
      send: () => this.go('contact', { subject: 'Gazette · La question qui divise', message: 'Mon avis : ' + (voteTxt[s.gzVote] || '') + '.\n\n', contactSent: false, formError: '' }) };
    const readerSizes = ['15px', '17px', '19px'];

    // ---------- Espace rédaction ----------
    const me = this.me();
    const isAdmin = me.role === 'admin';
    const posts = this.posts();
    const ST = { draft: ['Brouillon', '#ebe6db', '#3f4f61'], review: ['En relecture', '#fff1d6', '#7a5208'], corrections: ['Corrections demandées', '#fde2e4', '#9b1c2b'], scheduled: ['Programmé', '#dfe8f5', '#20406e'], published: ['Publié', '#d8efe6', '#11583f'], rejected: ['Refusé', '#e6e6e6', '#555'] };
    const stV = (p) => ({ sLabel: ST[p.status][0], sBg: ST[p.status][1], sFg: ST[p.status][2] });
    const pending = posts.filter((p) => p.status === 'review');
    const openEdit = (p, mode) => this.go('studio', { studioTab: 'edit', editId: p.id, edMode: mode || 'write', reviewNote: '', aiOutKind: null, formError: '' });
    const isClubRole = s.role === 'club';
    const canReseau = isAdmin || (s.role === 'writer' && (s.staffRole || 'redacteur') === 'collaborateur');
    const studioTabs = isClubRole ? [['club', 'Mon club'], ['clist', 'Mes contenus'], ['fiche', 'Fiche du club'], ['charte', 'Bonnes pratiques']]
      : [['dash', 'Tableau de bord'], ['list', 'Articles'], ['queue', 'Relecture'], ['une', 'La une'], ['prod', 'Éditions · Gazette'], ['media', 'Médiathèque'], ['fil', 'Le Fil'], ['ia', 'IA'], ['team', 'Équipe et règles']].concat(canReseau ? [['reseau', 'Réseau']] : []).concat(me.role === 'admin' ? [['exports', 'Exports'], ['crm', 'CRM & agents']] : []);
    const curTab = s.studioTab;
    const studioNav0 = studioTabs.map(([id, label]) => ({ label, bg: curTab === id || (curTab === 'edit' && id === 'list') ? 'var(--inv-bg)' : 'transparent', fg: curTab === id || (curTab === 'edit' && id === 'list') ? 'var(--on-inv)' : 'var(--text)', hasBadge: id === 'queue' && pending.length > 0, badge: String(pending.length), go: () => this.setState({ studioTab: id }), cur: curTab === id || (curTab === 'edit' && id === 'list') || (curTab === 'cedit' && id === 'clist') ? 'page' : 'false' }));
    const roleSwitch = [['admin', 'Admin', ''], ['writer', 'Chef d’édition', 'collaborateur'], ['writer', 'Rédactrice', 'redacteur'], ['club', 'Correspondant club', '']].map(([id, label, sr]) => { const on = s.role === id && (id === 'admin' || id === 'club' || (s.staffRole || 'redacteur') === sr); return { label, bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pick: () => this.setState(Object.assign({ role: id, studioTab: id === 'club' ? 'club' : ['club', 'clist', 'fiche', 'charte', 'cedit'].indexOf(s.studioTab) >= 0 ? 'dash' : s.studioTab }, sr ? { staffRole: sr } : {})) }; });
    const kpis = [['review', 'À relire', 'var(--gold-text)'], ['corrections', 'Corrections', 'var(--danger)'], ['draft', 'Brouillons', 'var(--text-2)'], ['scheduled', 'Programmés', 'var(--text)']].map(([st, l, color]) => ({ v: String(posts.filter((p) => p.status === st).length), l, color, go: () => this.setState({ studioTab: 'list', stFilter: st }) }))
      .concat([{ v: String(D.articles.length + posts.filter((p) => p.status === 'published').length), l: 'Publiés', color: 'var(--success)', go: () => this.setState({ studioTab: 'list', stFilter: 'published' }) }]);
    const mine = posts.filter((p) => p.author === me.name);
    const dashSrc = isAdmin ? pending : mine.filter((p) => p.status !== 'published');
    const dashList = dashSrc.map((p) => Object.assign({ title: p.title, author: p.author, updated: p.updated, open: () => openEdit(p, isAdmin && p.status === 'review' ? 'preview' : 'write') }, stV(p)));
    const activity = posts.reduce((acc, p) => acc.concat(p.log.map((l) => ({ who: l.who, what: l.what + ' — « ' + p.title + ' »', when: l.when, dot: /Approuv|publi/i.test(l.what) ? '#18705f' : /Correction|Refus/i.test(l.what) ? 'var(--danger)' : '#e8a830' }))), []).reverse().slice(0, 7);
    const stFiltersDef = [['all', 'Tous'], ['review', 'En relecture'], ['corrections', 'Corrections'], ['draft', 'Brouillons'], ['scheduled', 'Programmés'], ['published', 'Publiés']];
    const stFilters = stFiltersDef.map(([id, label]) => Object.assign(pill(s.stFilter === id), { label, n: String(id === 'all' ? posts.length : posts.filter((p) => p.status === id).length), pick: () => this.setState({ stFilter: id }) }));
    const stq = norm(s.stQ);
    const stRows0 = posts.filter((p) => (s.stFilter === 'all' || p.status === s.stFilter) && (!stq || norm(p.title + ' ' + p.author).includes(stq)))
      .map((p) => Object.assign({ title: p.title, author: p.author, sport: p.sport, updated: p.updated, canReview: isAdmin && p.status === 'review', edit: () => openEdit(p, 'write'), review: () => openEdit(p, 'preview') }, stV(p)));
    const queue = pending.map((p) => ({ title: p.title, author: p.author, updated: p.updated, words: String(this.checksOf(p).words), score: String(this.checksOf(p).score), review: () => openEdit(p, 'preview'), isClub: p.source === 'club', club: p.clubName || ((clubById(p.clubId) || {}).name || '') }));
    const edRaw = posts.find((p) => p.id === s.editId) || posts[0] || { id: '', author: '', status: 'draft', updated: '', sport: 'Football', tag: '', clubs: [], img: 'assets/hero.jpg', alt: '', premium: false, schedule: '', title: 'Aucun article', dek: '', body: '', log: [] };
    const chk = this.checksOf(edRaw);
    const edLocked = !isAdmin && (edRaw.author !== me.name || ['review', 'scheduled', 'published', 'rejected'].indexOf(edRaw.status) >= 0);
    const ed = Object.assign({}, edRaw, stV(edRaw), {
      titleLen: String(edRaw.title.length), titleColor: edRaw.title.length > 80 ? 'var(--danger)' : 'var(--muted)',
      words: String(chk.words), read: Math.max(1, Math.round(chk.words / 200)) + ' min de lecture', blocks: this.blocksOf(edRaw.body),
      score: String(chk.score), scoreW: chk.score + '%', scoreColor: chk.score >= 75 ? 'var(--success)' : chk.score >= 50 ? 'var(--gold-text)' : 'var(--danger)', checks: chk.list,
      correction: edRaw.status === 'corrections', lastNote: edRaw.note || '', log: edRaw.log.slice().reverse()
    });
    const upd = (patch) => this.setPost(edRaw.id, patch);
    const sportOpts = ['Football', 'Basketball', 'Rugby', 'Water-polo', 'Trail', 'Handball', 'Natation', 'Tennis', 'Judo', 'Autre'].map((v) => ({ v }));
    const edClubs = D.clubs.slice(0, 14).map((c) => { const on = edRaw.clubs.indexOf(c.id) >= 0; return { label: c.name.replace(/ Football$/, ''), bg: on ? 'var(--inv-bg)' : 'var(--surface)', fg: on ? 'var(--on-inv)' : 'var(--text)', border: on ? 'var(--ink)' : 'var(--line-2)', pick: () => upd({ clubs: on ? edRaw.clubs.filter((x) => x !== c.id) : edRaw.clubs.concat([c.id]) }) }; });
    const edImgs = libImgs.map((m) => ({ src: m.src, ring: edRaw.img === m.src ? accent : 'transparent', pick: () => upd({ img: m.src }) }));
    const toolbar = [['Intertitre', '\n\n## Intertitre', 'Insérer un intertitre'], ['Citation', '\n\n> Citation', 'Insérer une citation'], ['Liste', '\n- Élément', 'Insérer une liste'], ['Paragraphe', '\n\nNouveau paragraphe.', 'Insérer un paragraphe'], ['Gras', ' **texte important**', 'Insérer du texte en gras']].map(([label, snip, aria]) => ({ label, aria, run: () => upd({ body: edRaw.body + snip }) }));
    const edModes = [['write', 'Rédaction'], ['preview', 'Aperçu']].map(([id, label]) => ({ label, bg: s.edMode === id ? 'var(--inv-bg)' : 'var(--surface)', fg: s.edMode === id ? 'var(--on-inv)' : 'var(--ink)', pick: () => this.setState({ edMode: id }) }));
    // assistant de rédaction
    const STOP = new Set('les des une pour dans avec sur par aux que qui est son ses leur leurs plus mais nous vous elle elles ils cette ces entre comme tout tous sans sont ont fait faire avant apres depuis encore deja aussi bien tres'.split(' '));
    const kw = (() => { const f = {}; norm(this.textOf(edRaw.title + ' ' + edRaw.dek + ' ' + edRaw.body)).split(/[^a-z0-9]+/).filter((w) => w.length > 4 && !STOP.has(w)).forEach((w) => { f[w] = (f[w] || 0) + 1; }); return Object.keys(f).sort((a, b) => f[b] - f[a]).slice(0, 6); })();
    const cap = (w) => w ? w[0].toUpperCase() + w.slice(1) : w;
    const sents = this.sentences(this.textOf(edRaw.body.split('\n').filter((l) => !/^##\s/.test(l.trim())).join('\n')));
    let aiOut = [], aiOutTitle = '';
    if (s.aiOutKind === 'titles') {
      aiOutTitle = 'Propositions de titres';
      const core = edRaw.title.split(/[:—–-]/)[0].trim() || cap(kw[0] || 'Le sport local');
      const opts = [core + ' : ' + (edRaw.tag ? edRaw.tag.toLowerCase() : 'le récit'), cap(kw[0] || 'Cotentin') + ', ' + (kw[1] || 'la saison') + ' et ' + (kw[2] || 'les ambitions'), edRaw.sport + ' · ' + core];
      aiOut = opts.map((t) => ({ t, canApply: !edLocked, apply: () => upd({ title: t.slice(0, 80) }) }));
    } else if (s.aiOutKind === 'dek') {
      aiOutTitle = 'Proposition de chapeau';
      const d = sents.slice(0, 2).join(' ').slice(0, 220);
      aiOut = [{ t: d || 'Ajoutez du texte pour générer un chapeau.', canApply: !!d && !edLocked, apply: () => upd({ dek: d }) }];
    } else if (s.aiOutKind === 'proof') {
      aiOutTitle = 'Relecture automatique';
      const issues = [];
      sents.filter((x) => x.split(/\s+/).length > 35).forEach((x) => issues.push('Phrase longue : « ' + x.slice(0, 60) + '… »'));
      const dbl = this.textOf(edRaw.body).match(/\b(\w+)\s+\1\b/i); if (dbl) issues.push('Mot répété : « ' + dbl[0] + ' »');
      if (/  /.test(edRaw.body)) issues.push('Double espace détecté');
      if ((edRaw.body.match(/!/g) || []).length > 2) issues.push('Beaucoup de points d’exclamation');
      if (!edRaw.alt.trim()) issues.push('Image sans texte alternatif');
      aiOut = (issues.length ? issues : ['Aucun problème détecté.']).map((t) => ({ t, canApply: false, apply: () => {} }));
    } else if (s.aiOutKind === 'seo') {
      aiOutTitle = 'Référencement';
      const slug = norm(edRaw.title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);
      aiOut = [{ t: 'URL : /actualites/' + slug, canApply: false, apply: () => {} }, { t: 'Meta : ' + (edRaw.dek || sents[0] || '').slice(0, 155), canApply: false, apply: () => {} }, { t: 'Mots-clés : ' + kw.join(', '), canApply: false, apply: () => {} }];
    }
    const aiTools = [['titles', 'Titres'], ['dek', 'Chapeau'], ['proof', 'Relecture'], ['seo', 'Référencement']].map(([id, label]) => ({ label, run: () => this.setState({ aiOutKind: id }) }));
    const staffRole = isAdmin ? 'admin' : (s.staffRole || 'redacteur');
    const W0 = (s.wxLive || {})[s.wxCity || 'Cherbourg'] || this.wxDemo(s.wxCity || 'Cherbourg');
    const wxText = !W0.live ? '' : (W0.days || []).slice(1, 4).map((d) => new Date(d.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long' }) + ' ' + d.max + '° / ' + d.min + '°, pluie ' + d.pp + ' %').join(' · ') + ' (' + (s.wxCity || 'Cherbourg') + ')';
    const RXV = typeof CasaRedac !== 'undefined' ? CasaRedac.vals(this, { isAdmin, staffRole, clubRole: s.role === 'club', posts, ARTS, G: this.gazette(), libImgs, videos: D.videos, edRaw, upd, edLocked, checksOf: (p) => this.checksOf(p), blocksOf: (b) => this.blocksOf(b), clubById,
      openEditById: (id) => { const p = this.posts().find((x) => x.id === id); if (p) openEdit(p, 'write'); }, go: (v, x) => this.go(v, x), table: X.tables.r2, matches: allM, wxText }) : { ed: {}, list: { rows: [] }, badges: {}, aide: {}, dlg: {}, wf: {} };
    RXV.crumb = (studioTabs.find((t) => t[0] === s.studioTab) || ['', s.studioTab === 'edit' || s.studioTab === 'cedit' ? 'Éditeur' : 'Tableau de bord'])[1];
    const studioNav = studioNav0.map((n, i) => { const id = studioTabs[i][0]; const b = id === 'fil' ? RXV.badges.fil : id === 'prod' ? RXV.badges.prod : 0; return b ? Object.assign({}, n, { hasBadge: true, badge: String(b) }) : n; });
    const team = X.team.map((m) => ({ name: m.id === 'admin' ? (s.role === 'admin' && s.name.trim() ? s.name : m.name) : m.name, mail: m.mail, role: m.role === 'admin' ? 'Administrateur principal' : 'Rédacteur', c1: '✓', c2: '✓', c3: m.role === 'admin' ? '✓' : '—', c4: m.role === 'admin' ? '✓' : '—' }));

    const goals = ['Visibilité', 'Sponsoring maillot', 'Contenus de marque', 'Événement'].map((g) => Object.assign(pill(s.goal === g), { label: g, pick: () => this.setState({ goal: g }) }));

    // ---------- compte ----------
    const followList = s.follows.map((id) => clubById(id)).filter(Boolean).map((c) => ({ name: c.name, open: () => this.go('club', { clubId: c.id }), remove: () => this.toggleIn('follows', c.id, '', 'Vous ne suivez plus ' + c.name) }))
      .concat(s.followPlayers.map((id) => D.players.find((p) => p.id === id)).filter(Boolean).map((p) => ({ name: p.name, open: () => this.go('player', { playerId: p.id }), remove: () => this.toggleIn('followPlayers', p.id, '', 'Vous ne suivez plus ' + p.name) })));
    const alerts = [['matchs', 'Scores en direct de mes clubs'], ['articles', 'Nouveaux articles'], ['videos', 'Nouvelles vidéos']].map(([id, label]) => ({ label, on: !!s.alerts[id], toggle: () => this.setState({ alerts: Object.assign({}, s.alerts, { [id]: !s.alerts[id] }) }) }));
    const savedArticles = allA.filter((a) => s.saved.indexOf(a.id) >= 0);
    const gazLabel = { num: 'Gazette numérique', pap: 'Gazette papier', duo: 'Gazette papier + numérique' }[s.subs.gazette];
    const subStatus = [s.subs.casab ? 'Casa B+' : null, gazLabel || null].filter(Boolean).join(' · ') || 'Compte gratuit';

    // ---------- recherche ----------
    const sq = norm(s.sq.trim());
    let sResults = [];
    if (sq) {
      const m = (t) => norm(t).includes(sq);
      sResults = []
        .concat(ARTS.filter((a) => m(a.title + ' ' + a.dek + ' ' + a.tag)).map((a) => ({ label: a.title, sub: a.tag + ' · ' + a.date, kind: 'Article', go: () => this.go('article', { articleId: a.id }) })))
        .concat(X.products.filter((p) => m(p.name + ' ' + p.short + ' ' + lineName[p.line])).map((p) => ({ label: p.name, sub: lineName[p.line] + ' · ' + eur0(p.price), kind: 'Boutique', go: () => this.go('product', { productId: p.id, color: 0, size: null, qty: 1 }) })))
        .concat(allM.filter((x) => m(x.home + ' ' + x.away)).map((x) => ({ label: x.home + ' – ' + x.away, sub: x.compLabel + ' · ' + x.dateLabel + ' · ' + x.scoreMid, kind: 'Match', go: () => this.go('live', { dSport: x.sport, dComp: x.compId, dTab: x.status === 'up' ? 'agenda' : 'results', matchId: x.id }) })))
        .concat(D.videos.filter((v) => m(v.title + ' ' + v.dek)).map((v) => ({ label: v.title, sub: v.date, kind: 'Vidéo', go: () => this.go('video', { videoId: v.id }) })))
        .concat(D.clubs.filter((c) => m(c.name + ' ' + c.city + ' ' + c.sport)).map((c) => ({ label: c.name, sub: c.sport + ' · ' + c.city, kind: 'Club', go: () => this.go('club', { clubId: c.id, clubTab: 'articles' }) })))
        .concat(D.players.filter((p) => m(p.name + ' ' + p.role + ' ' + p.clubLabel)).map((p) => ({ label: p.name, sub: p.role + ' · ' + p.clubLabel, kind: 'Joueur', go: () => this.go('player', { playerId: p.id }) })))
        .concat(D.sports.filter((x) => m(x)).map((x) => ({ label: x, sub: 'Discipline', kind: 'Discipline', go: () => this.go('discipline', { discId: x }) })))
        .concat(m('gazette') ? [{ label: 'La Gazette du Cotentin', sub: 'Abonnement numérique, papier ou les deux', kind: 'Mag', go: () => this.go('offers', { offerTab: 'La Gazette' }) }] : [])
        .concat(X.places.filter((p) => m(p.name + ' ' + p.desc + ' ' + p.moment)).map((p) => ({ label: p.name, sub: 'Lieu de légende · ' + p.year, kind: 'Histoire', go: () => this.setState({ searchOpen: false, placeOpen: true, placeIdx: X.places.indexOf(p) }) })))
        .concat(X.partners.filter((p) => m(p.name + ' ' + p.sector + ' ' + p.city)).map((p) => ({ label: p.name, sub: p.sector + ' · partenaire fictif', kind: 'Partenaire', go: () => this.setState({ searchOpen: false, partnerId: p.id }) })))
        .concat(this.culture().flat.filter((w) => m(w.title + ' ' + w.author + ' ' + w.technique)).map((w, i) => ({ label: w.title, sub: 'Exposition · salle ' + w.room, kind: 'Œuvre', go: () => this.setState({ searchOpen: false, workIdx: this.culture().flat.indexOf(w) }) })))
        .concat(this.culture().venues.filter((v) => m(v.name + ' ' + v.city + ' ' + v.desc)).map((v) => ({ label: v.name, sub: v.kind + ' · ' + v.city, kind: 'Culture', go: () => this.go('culture', { cuTab: 'lieux' }) })))
        .concat(this.culture().routes.filter((r) => m(r.name + ' ' + r.area + ' ' + r.sport)).map((r) => ({ label: r.name, sub: r.sport + ' · ' + r.area, kind: 'Parcours', go: () => this.go('culture', { cuTab: 'parcours' }) })))
        .concat(this.chData().posts.filter((p) => m(p.text + ' ' + p.author)).map((p) => ({ label: p.text.slice(0, 60), sub: 'Club House · ' + p.author, kind: 'Club House', go: () => this.go('clubhouse', { chTab: 'fil' }) })))
        .concat(this.chData().ads.filter((a) => m(a.title + ' ' + a.text + ' ' + a.where)).map((a) => ({ label: a.title, sub: 'Annonce · ' + a.where, kind: 'Annonce', go: () => this.go('clubhouse', { chTab: 'annonces' }) })))
        .concat(this.chData().events.filter((e) => m(e.title + ' ' + e.place)).map((e) => ({ label: e.title, sub: 'Événement · ' + e.place, kind: 'Événement', go: () => this.go('clubhouse', { chTab: 'events' }) })))
        .slice(0, 22);
    }
    const quick = [['Scores en direct', 'Le Terrain', () => this.go('live', { dTab: 'live' })], ['Classement Régional 2', 'Le Terrain', () => this.go('live', { dSport: 'Football', dComp: 'r2', dTab: 'table' })], ['Maillot personnalisé', 'Boutique', () => this.go('product', { productId: 'maillot-retro', color: 0, size: null, qty: 1 })], ['La Gazette du Cotentin', 'Abonnement', () => this.go('offers', { offerTab: 'La Gazette' })], ['Pointe-Hague défie Goliath', 'Article', () => this.go('article', { articleId: 'pointe-hague' })], ['Carte des clubs', 'Territoire', () => this.go('map')]].map(([label, kind, go]) => ({ label, kind, go }));

    // ---------- fil d'Ariane ----------
    const labelOf = { news: 'Actualités', videos: 'Vidéos', disciplines: 'Disciplines', clubs: 'Clubs', players: 'Joueurs', map: 'Territoire', offers: 'Abonnements', partners: 'Partenaires', about: 'À propos', work: 'Casa PRO', contact: 'Contact', account: 'Mon espace', live: 'Le Terrain', shop: 'Boutique', studio: 'Espace rédaction', legal: 'Informations juridiques', meteo: 'Météo', private: 'Mon quotidien', culture: 'Culture', clubhouse: 'Club House', olisto: 'Partenaires', app: 'L’application', verifier: 'Vérification' };
    const crumbsRaw = [['Accueil', () => this.go('home')]];
    if (labelOf[activeSec] && activeSec !== 'home') crumbsRaw.push([labelOf[activeSec], () => this.go(activeSec)]);
    const leaf = { article: curA.tag, video: curV.title, discipline: dName, club: curC.name, player: curP.name, checkout: sp.name, product: curPr.name, order: 'Commande', live: s.dSport, cv: 'Mon CV' }[s.view];
    if (leaf) crumbsRaw.push([leaf, null]);
    const crumbs = crumbsRaw.map(([label, go], i) => ({ label, go: go || (() => {}), sep: i < crumbsRaw.length - 1 ? '›' : '' }));

    // ---------- Travailler avec Casa Besports : un seul formulaire (Contact), pré-rempli selon le bouton choisi ----------
    const toContact = (subject, profile) => () => this.go('contact', { contactSent: false, subject, profile, formError: '' });
    // ---------- Casa PRO (accès dédié : clubs, marques, collectivités, sportifs, médias) ----------
    // Les chiffres sont calculés en direct à partir des données publiées sur le site : rien n'est estimé.
    const nf = (n) => Number(n || 0).toLocaleString('fr-FR');
    const proComps = Object.keys(X.comps).reduce((t, k) => t + (X.comps[k] || []).length, 0);
    const proSports = Object.keys(X.comps).filter((k) => (X.comps[k] || []).length).length;
    const proStats = [
      { n: nf(D.clubs.length), l: 'clubs référencés' },
      { n: nf(proComps), l: 'compétitions suivies' },
      { n: nf(X.matches.length), l: 'matchs (14 jours avant et après)' },
      { n: nf(proSports), l: 'disciplines avec résultats' }
    ].filter((x) => x.n !== '0');
    const proOffre = (id, num, titre, promesse, items, cta, sujet, profil) => ({ id, num, titre, promesse, items: items.map((t) => ({ t })), cta, go: toContact(sujet, profil), sel: s.proTab === id, pick: () => this.setState({ proTab: id }) });
    const proOffres = [
      proOffre('clubs', '01', 'Clubs', 'Votre club, visible partout où le Cotentin suit son sport.', ['Fiche club avec logo, niveau, année de création, stade', 'Résultats et classements mis à jour automatiquement (handball, volley)', 'Reportages, interviews, résumés de rencontres', 'Vidéos de présentation et couverture de vos événements'], 'Référencer mon club', 'Casa PRO · club', 'Club'),
      proOffre('marques', '02', 'Marques & entreprises', 'Associez votre marque aux histoires que les gens d’ici lisent jusqu’au bout.', ['Encarts sponsors nets au cœur des articles (décor gazette)', 'Page partenaire et liens suivis vers votre site', 'Vidéos promotionnelles et contenus de marque', 'Collections et collaborations, comme Cherwood × Casa'], 'Devenir partenaire', 'Casa PRO · partenariat', 'Entreprise'),
      proOffre('collectivites', '03', 'Collectivités & organisateurs', 'Votre événement raconté avant, pendant et après.', ['Couverture d’événements et captation vidéo', 'Agenda et résultats sur Le Terrain', 'Interviews et contenus pour vos propres canaux', 'Mise en avant du territoire (carte, lieux, culture)'], 'Couvrir mon événement', 'Casa PRO · événement', 'Autre'),
      proOffre('sportifs', '04', 'Sportifs & éducateurs', 'Votre parcours, mis en forme et certifiable.', ['CV Casa dans la charte du média, certifiable par l’équipe', 'Portrait, interview, présentation de parcours', 'Profil joueur relié à votre club', 'Mise en lumière de vos projets'], 'Proposer mon histoire', 'Casa PRO · sportif', 'Joueur'),
      proOffre('medias', '05', 'Médias & fédérations', 'Des données locales propres, sourcées, à jour.', ['Classements et résultats repris des sources officielles, avec la source citée', 'Couverture Manche d’abord, puis toute la Normandie', 'Échange de contenus et partenariats éditoriaux', 'Contact direct avec la rédaction'], 'Parler à la rédaction', 'Casa PRO · média', 'Média')
    ];
    const proCur = proOffres.find((o) => o.sel) || proOffres[0];
    proOffres.forEach((o) => { o.on = o === proCur; o.cls = o === proCur ? 'pro-tab on' : 'pro-tab'; });
    const cherwood = {
      img: 'assets/casa-x-cherwood-napoleon.png',
      alt: 'Illustration Casa × Cherwood : la statue équestre de Napoléon face à la mer, à Cherbourg, près de la Plage Verte',
      go: () => this.go('shop', { shopLine: 'Cherwood × Casa' })
    };
    const workVals = {
      cols: [
        { titre: 'Pour les clubs', items: ['Reportages', 'Vidéos de présentation', 'Interviews', 'Résumés de rencontres', 'Formules de couverture médiatique', 'Prestations audiovisuelles'], cta: 'Demander un devis', go: toContact('Demande de devis · club', 'Club') },
        { titre: 'Pour les entreprises', items: ['Sponsoring', 'Publicité', 'Partenariats', 'Vidéos promotionnelles', 'Communication audiovisuelle', 'Visibilité auprès des communautés sportives locales'], cta: 'Devenir partenaire', go: toContact('Devenir partenaire', 'Entreprise') },
        { titre: 'Pour les organisateurs', items: ['Couverture d’événements', 'Interviews', 'Captation vidéo', 'Production de contenus'], cta: 'Demander un devis', go: toContact('Demande de devis · événement', 'Autre') },
        { titre: 'Pour les sportifs', items: ['Portraits', 'Présentations de parcours', 'Interviews', 'Mise en lumière des projets'], cta: 'Proposer une histoire', go: toContact('Proposer une histoire', 'Joueur') }
      ].map((c) => Object.assign(c, { items: c.items.map((t) => ({ t })) })),
      devis: toContact('Demande de devis', ''), partenaire: toContact('Devenir partenaire', 'Entreprise'), histoire: toContact('Proposer une histoire', ''), redaction: toContact('Message à la rédaction', ''),
      stats: proStats, hasStats: proStats.length > 0, offres: proOffres, cur: proCur, rdv: toContact('Casa PRO · rendez-vous', ''),
      voir: () => { try { const el = document.getElementById('pro-offres'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} },
      public: () => this.go('home')
    };
    // Réseaux sociaux du pied de page (contenus/reseaux.js, modifiables dans l'admin) : un réseau sans adresse est masqué
    const RSX = window.CASA_RESEAUX || {};
    const reseaux = [['instagram', 'Instagram'], ['youtube', 'YouTube'], ['tiktok', 'TikTok'], ['facebook', 'Facebook'], ['x', 'X'], ['linkedin', 'LinkedIn']]
      .filter(([k]) => /^https:\/\/\S+$/.test(String(RSX[k] || '').trim())).map(([k, label]) => ({ label, href: String(RSX[k]).trim() }));
    // Pied de page : seulement les liens qu'on ne retrouve pas dans « Toutes les rubriques »
    const footLinks = [['Casa PRO', 'work'], ['Contact', 'contact'], ['Vérifier une carte membre', 'verifier']].map(([label, v]) => ({ label, go: () => this.go(v) }));

    const progress = { home: 8, news: 20, article: 45, video: 45, videos: 20, disciplines: 20, discipline: 40, clubs: 20, club: 45, players: 20, player: 60, map: 30, offers: 30, checkout: 30 + s.step * 17, partners: 40, about: 40, contact: 50, account: 50, live: 35, shop: 25, product: 55, order: 85, studio: 50, legal: 40, meteo: 30, private: 45, culture: 35, clubhouse: 40, olisto: 45, app: 30, cv: 60, verifier: 40 }[s.view] || 10;

    // ---------- thèmes ----------
    const THEME_DEFS = [
      ['auto', 'Automatique', 'Auto', 'Suit votre appareil', 'Blanc le jour, noir le soir, selon les réglages de votre appareil.', { bg: '#ffffff', bar: '#000000', card: '#ffffff', line: '#e0e0e0', text: '#000000', acc: '#000000', split: '50%' }],
      ['light', 'Clair', 'Clair', 'Noir sur blanc', 'Fond blanc, titres noirs et bandeau noir : le logo Casa Besports + sur papier.', { bg: '#ffffff', bar: '#000000', card: '#ffffff', line: '#e0e0e0', text: '#000000', acc: '#000000', split: '0%' }],
      ['dark', 'Sombre', 'Sombre', 'Blanc sur noir', 'Fond noir et lettres blanches, comme le logo : pour lire le soir sans éblouissement.', { bg: '#0b0b0b', bar: '#000000', card: '#141414', line: '#272727', text: '#ffffff', acc: '#ffffff', split: '0%' }],
      ['noir', 'Noir absolu', 'Noir', 'Contraste maximal', 'Noir pur et blanc pur : le contraste le plus fort, idéal sur écran OLED.', { bg: '#000000', bar: '#000000', card: '#0a0a0a', line: '#333333', text: '#ffffff', acc: '#ffffff', split: '0%' }],
      ['paper', 'Papier journal', 'Papier', 'Encre et papier', 'Papier grisé, encre noire et texte à empattements, comme un quotidien imprimé.', { bg: '#f1eee7', bar: '#111111', card: '#f8f6f1', line: '#bdb6a7', text: '#111111', acc: '#111111', split: '0%' }]
    ];
    const curTheme = THEME_DEFS.find((t) => t[0] === s.theme) ? s.theme : 'dark';
    const themes = THEME_DEFS.map(([id, name, short, desc, long, sw]) => {
      const on = id === curTheme;
      return Object.assign({}, sw, { id, name, short, desc, long, checked: on ? 'true' : 'false', isOn: on,
        rowBg: on ? 'var(--surface-2)' : 'transparent', ring: on ? 'var(--acc)' : 'var(--line-2)', dotBg: on ? 'var(--acc)' : 'transparent',
        chipBg: on ? 'var(--inv-bg)' : 'var(--surface)', chipFg: on ? 'var(--on-inv)' : 'var(--text)', chipBorder: on ? 'var(--inv-bg)' : 'var(--line-2)',
        pick: () => this.setTheme(id) });
    });
    const themeName = THEME_DEFS.find((t) => t[0] === curTheme)[1];
    const effectiveDark = curTheme === 'dark' || curTheme === 'noir' || (curTheme === 'auto' && s.sysDark);
    // Textes juridiques : contenus/legal.js
    const LEGAL = window.CASA_LEGAL || { mentions: { title: 'Mentions légales', sections: [] } };
    const legalDoc = LEGAL[s.legalDoc] ? s.legalDoc : 'mentions';
    const legal = { title: LEGAL[legalDoc].title, sections: LEGAL[legalDoc].sections.map(([hh, p]) => ({ h: hh, p })) };
    const legalOrder = [['mentions', 'Mentions légales'], ['confidentialite', 'Confidentialité'], ['cgv', 'CGV'], ['cgu', 'CGU']];
    const legalTabs = legalOrder.map(([id, label]) => Object.assign(pill(id === legalDoc), { label, sel: id === legalDoc ? 'true' : 'false', pick: () => this.setState({ legalDoc: id }) }));
    const legalLinks = legalOrder.map(([id, label]) => ({ label, go: () => this.go('legal', { legalDoc: id }) }));
    // ---------- date du jour ----------
    const now0 = new Date();
    const DOWL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const todayLabel = DOWL[now0.getDay()] + ' ' + now0.getDate() + ' ' + MONTHS_L[now0.getMonth()].toLowerCase();
    const hr = now0.getHours();
    const firstName = (s.name || '').trim().split(' ')[0];
    const greeting = (hr < 5 ? 'Bonne nuit' : hr < 18 ? 'Bonjour' : 'Bonsoir') + (firstName ? ', ' + firstName : '');
    const fmtDay = (iso) => { const d = pd(iso); return d ? DOW[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()] : ''; };
    const eur2 = (n) => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';

    // ---------- météo ----------
    const wxBase = ['Cherbourg', 'Beaumont-Hague', 'Valognes', 'Barfleur', 'Barneville-Carteret', 'Carentan', 'Saint-Lô', 'Avranches'];
    const wxExtra = s.wxExtra || [];
    const wxCityNames = wxBase.concat(wxExtra.map((x) => x.name).filter((n) => wxBase.indexOf(n) < 0));
    const wxCity = wxCityNames.indexOf(s.wxCity) >= 0 ? s.wxCity : 'Cherbourg';
    const W = (s.wxLive || {})[wxCity] || this.wxDemo(wxCity);
    const [nowLabel, nowIco] = this.wxIcon(W.cur.code);
    const dayV = (d, i) => { const [label, ico] = this.wxIcon(d.code); const dd = pd(d.date); return { dow: i === 0 ? 'Aujourd’hui' : i === 1 ? 'Demain' : (dd ? DOW[dd.getDay()] + ' ' + dd.getDate() : ''), label, ico, max: d.max + '°', min: d.min + '°', p: d.pp + ' %', w: d.wind + ' km/h', rawMax: d.max, rawMin: d.min }; };
    const days = W.days.map(dayV);
    const tMin = Math.min.apply(null, W.days.map((d) => d.min)), tMax = Math.max.apply(null, W.days.map((d) => d.max));
    days.forEach((d) => { d.barL = Math.round((d.rawMin - tMin) / Math.max(1, tMax - tMin) * 100) + '%'; d.barW = Math.max(6, Math.round((d.rawMax - d.rawMin) / Math.max(1, tMax - tMin) * 100)) + '%'; });
    const d0 = W.days[0];
    const cG = '#2e9e6b', cO = '#e8a830', cR = '#d0473e';
    const play = [
      { sport: 'Football / rugby', color: d0.pp > 75 || W.cur.wind > 50 ? cO : cG, verdict: d0.pp > 75 ? 'Terrain lourd possible' : W.cur.wind > 50 ? 'Vent fort' : 'Bonnes conditions' },
      { sport: 'Course / trail', color: W.cur.wind > 40 ? cO : cG, verdict: W.cur.wind > 40 ? 'Vent fort sur le littoral' : 'Idéal' },
      { sport: 'Vélo', color: d0.pp > 60 ? cO : cG, verdict: d0.pp > 60 ? 'Chaussée glissante' : 'Bonnes conditions' },
      { sport: 'Voile / sports nautiques', color: W.cur.gust > 55 ? cR : W.cur.wind > 30 ? cO : cG, verdict: W.cur.gust > 55 ? 'Rafales dangereuses' : W.cur.wind > 30 ? 'Mer agitée, prudence' : 'Conditions favorables' }
    ];
    const adviceShort = W.cur.wind > 30 ? 'prévoir un coupe-vent' : d0.pp > 60 ? 'parapluie conseillé' : 'idéal pour sortir';
    const wx = { city: wxCity, nowTemp: W.cur.t + '°', nowFeels: W.cur.feels + '°', nowLabel, nowIco, nowWind: W.cur.wind + ' km/h ' + W.cur.dir, nowGust: W.cur.gust + ' km/h', nowHum: W.cur.hum + ' %', nowRain: (W.cur.rain || 0).toString().replace('.', ',') + ' mm',
      hours: W.hours.map((h) => { const [, ico] = this.wxIcon(h.code); return { h: String(h.h).padStart(2, '0') + ' h', t: h.t + '°', ico, p: h.pp + ' %' }; }),
      days, next3: days.slice(1, 4), play, adviceShort, sunrise: W.sunrise, sunset: W.sunset, waves: W.waves, loading: !!s.wxLoading,
      source: W.live ? 'Prévisions Open-Meteo · en direct' : 'Connexion au service météo…', srcColor: W.live ? 'var(--success)' : 'var(--gold-text)',
      updated: W.live ? 'Mis à jour à ' + new Date(W.at).toTimeString().slice(0, 5) + ' · actualisé toutes les 10 min' : 'Estimation en attendant les données en direct',
      credit: W.live ? 'Données météo : Open-Meteo.com (CC BY 4.0). Vigilance et marées : à relier aux flux officiels Météo-France et SHOM.' : 'Prévisions en cours de chargement depuis Open-Meteo. Si elles n’apparaissent pas, vérifiez votre connexion puis rechargez la page.' };
    wx.cityTemp = wxCity + (W.live ? ' ' + W.cur.t + '°' : '');
    // Pas de données en direct : on n'affiche aucun chiffre inventé, seulement des tirets
    if (!W.live) {
      const NA = '—';
      Object.assign(wx, { nowTemp: NA, nowFeels: NA, nowLabel: 'Météo indisponible', nowWind: NA, nowGust: NA, nowHum: NA, nowRain: NA, sunrise: NA, sunset: NA, waves: NA, adviceShort: 'prévisions en cours de chargement',
        hours: wx.hours.map((h) => Object.assign({}, h, { t: NA, p: NA })), play: play.map((pc) => Object.assign({}, pc, { color: 'var(--muted)', verdict: 'En attente des prévisions' })) });
      wx.days = days.map((d) => Object.assign({}, d, { max: NA, min: NA, p: NA, w: NA, barL: '0%', barW: '0%' })); wx.next3 = wx.days.slice(1, 4);
    }
    const wxCities = wxBase.map((c) => Object.assign(pill(c === wxCity), { label: c, pick: () => { this.setState({ wxCity: c }); this.writeLS('cb-wx-city', c); this.fetchWeather(c); } }));
    const wxMine = wxExtra.map((x) => Object.assign(pill(x.name === wxCity), { label: x.name, region: x.region, pick: () => { this.setState({ wxCity: x.name }); this.writeLS('cb-wx-city', x.name); this.fetchWeather(x.name); }, remove: () => this.wxRemove(x.name) }));
    const wxFind = { q: s.wxQ || '', onQ: (e) => { const v = e.target.value; this.setState({ wxQ: v, wxNone: false }); clearTimeout(this._wxT); this._wxT = setTimeout(() => this.wxSearch(v), 350); },
      go: () => this.wxSearch(s.wxQ), busy: !!s.wxSearching, none: !!s.wxNone && !!(s.wxQ || '').trim(), hasRes: (s.wxRes || []).length > 0,
      res: (s.wxRes || []).map((r) => ({ name: r.name, region: r.region, add: () => this.wxAdd(r) })), hasMine: wxMine.length > 0, mine: wxMine };
    const weather = wxCityNames.slice(0, 4).map((c) => { const Wc = (s.wxLive || {})[c] || this.wxDemo(c); const [label, ico] = this.wxIcon(Wc.cur.code); return { city: c, label: Wc.live ? label : 'Indisponible', ico, temp: Wc.live ? Wc.cur.t + '°' : '—', wind: Wc.live ? Wc.cur.wind + ' km/h' : '—', sun: Wc.cur.code <= 2, cloud: Wc.cur.code === 3 || Wc.cur.code === 45, rain: Wc.cur.code > 45 }; });

    // ---------- accueil épuré et personnalisable ----------
    const MD = this.modDefs();
    const modsState = (s.mods && s.mods.length) ? s.mods.filter((m) => m && MD.some((x) => x[0] === m.id)).concat(MD.filter((x) => !s.mods.some((m) => m && m.id === x[0])).map((d) => ({ id: d[0], on: d[3] !== false }))) : this.defaultMods();
    const homeMods = modsState.filter((m) => m.on).map((m) => { const def = MD.find((x) => x[0] === m.id); return { id: m.id, cls: def[2], isUne: m.id === 'une', isResultats: m.id === 'resultats', isPortes: m.id === 'portes', isCherwood: m.id === 'cherwood', isRubriques: m.id === 'rubriques', isMeteo: m.id === 'meteo', isPrivate: m.id === 'private', isRdv: m.id === 'rdv' && rdv.has, isActus: m.id === 'actus', isShop: m.id === 'shop', isTable: m.id === 'table', isGazette: m.id === 'gazette', isLieu: m.id === 'lieu', isVideos: m.id === 'videos', isOeuvre: m.id === 'oeuvre', isCultureMod: m.id === 'culture', isClubMod: m.id === 'clubhouse' }; });
    const move = (i, dlt) => { const a = modsState.slice(); const j = i + dlt; if (j < 0 || j >= a.length) return; const t = a[i]; a[i] = a[j]; a[j] = t; this.setMods(a); };
    const modRows = modsState.map((m, i) => ({ label: MD.find((x) => x[0] === m.id)[1], on: m.on, essentiel: MD.find((x) => x[0] === m.id)[3] !== false, toggle: () => this.setMods(modsState.map((x, k) => k === i ? { id: x.id, on: !x.on } : x)), up: () => move(i, -1), down: () => move(i, 1) }));
    const layouts = [['dashboard', 'Tableau de bord', 'Blocs personnalisables'], ['magazine', 'Magazine', 'Grand visuel et récits']].map(([id, label, desc]) => ({ label, desc, checked: s.homeLayout === id ? 'true' : 'false', border: s.homeLayout === id ? 'var(--acc)' : 'var(--line)', pick: () => this.setLayout(id) }));
    // Sports et clubs favoris de l'abonné : ils passent en tête du bandeau, des résultats et des actus
    const nrm = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const favS = Array.isArray(s.favSports) ? s.favSports : [];
    const favC = Array.isArray(s.favClubs) ? s.favClubs : [];
    const favClubObjs = D.clubs.filter((c) => favC.indexOf(c.id) >= 0);
    const hasFav = favS.length > 0 || favClubObjs.length > 0;
    const teamFav = (team, sport) => { const tn = nrm(team); return favClubObjs.some((c) => c.sport === sport && ((nrm(c.name) && tn.indexOf(nrm(c.name).split(' ').slice(0, 2).join(' ')) === 0) || (c.city && tn.indexOf(nrm(c.city)) >= 0))); };
    const favMatch = (m) => favS.indexOf(m.sport) >= 0 || teamFav(m.home, m.sport) || teamFav(m.away, m.sport);
    const favArt = (a) => favS.indexOf(a.sport) >= 0 || (Array.isArray(a.clubs) && a.clubs.some((id) => favC.indexOf(id) >= 0));
    const uneIds = RXD ? RXD.une.map((x) => x.id) : [];
    const uneArts = uneIds.map((id) => allA.find((a) => a.id === id)).filter(Boolean);
    const baseOrder = uneArts.concat(allA.filter((a) => uneArts.indexOf(a) < 0));
    const homeOrder = hasFav ? baseOrder.filter(favArt).concat(baseOrder.filter((a) => !favArt(a))) : baseOrder;
    const uneA = homeOrder[0];
    const une = Object.assign({}, uneA || EMPTY_ART);
    // Priorité géographique : Cotentin et Manche d'abord, puis la Normandie, puis le national
    const ZONE_RANG = { Manche: 0, '': 0, National: 1, Normandie: 2, Calvados: 3, Orne: 4, Eure: 5, 'Seine-Maritime': 6 };
    const zoneRang = (m) => { const c = (X.comps[m.sport] || []).find((x) => x.id === m.compId); const z = (c && c.zone) || ''; return ZONE_RANG[z] != null ? ZONE_RANG[z] : 7; };
    const recent = (m) => { const d = pd(m.date); return !d || (Date.now() - d.getTime()) < 8 * 864e5; };
    const allScores = allM.filter((m) => m.status === 'live').concat(allM.filter((m) => m.status === 'done' && m.hs !== '–' && recent(m)).sort((a, b) => (zoneRang(a) - zoneRang(b)) || (a.date > b.date ? -1 : 1)));
    const favScores = hasFav ? allScores.filter(favMatch) : [];
    const dashScores = (favScores.length ? favScores : allScores).slice(0, 8);
    // Résultats regroupés par compétition (titre une seule fois), 4 matchs sur téléphone
    const resMax = (typeof window !== 'undefined' && window.innerWidth < 640) ? 4 : 8;
    const resGroups = [];
    const capFirst = (x) => { const v = String(x || '').split(' · ')[0].trim(); return v ? v.charAt(0).toUpperCase() + v.slice(1) : ''; };
    dashScores.slice(0, resMax).forEach((m) => { let g = resGroups.find((x) => x.sport === m.sport); if (!g) { g = { sport: m.sport, matches: [] }; resGroups.push(g); } const comp = m.compLabel && m.compLabel !== m.sport ? capFirst(m.compLabel) : ''; g.matches.push(Object.assign({}, m, { comp, hasComp: !!comp, isLiveM: m.status === 'live' })); });
    const resNote = !hasFav ? 'Cotentin et Manche d’abord' : favScores.length ? 'Vos sports et vos clubs' : 'Rien pour vos favoris cette semaine : toute la Manche';
    const dashNews = homeOrder.slice(0, 4);
    const dashProducts = homeProducts.slice(0, 3);
    const dashTable = (X.tables.r2 || []).slice(0, 4).map((r, i) => ({ rank: String(i + 1), team: r.team, pts: String(r.pts) }));
    const dashVideos = videos.slice(0, 2);
    // Un bloc d'accueil facultatif sans contenu réel ne s'affiche pas : il réapparaît dès qu'il y a des articles, des produits, un classement ou des vidéos
    const emptyMod = { actus: !dashNews.length, shop: !dashProducts.length, table: !dashTable.length, videos: !dashVideos.length };
    const homeModsShown = homeMods.filter((m) => !emptyMod[m.id] && (m.id !== 'rdv' || m.isRdv));
    // Les deux portes d'entrée : passionné (abonnement) et pro (Casa PRO)
    const portes = s.loggedIn
      ? { passionTxt: 'Choisissez vos sports, vos clubs et vos rubriques : votre accueil se compose à votre goût.', passionCta: 'Personnaliser mon accueil', passionGo: () => this.setState({ customizeOpen: true }) }
      : { passionTxt: 'Scores, récits, Gazette et Club House. Abonnez-vous et composez votre propre accueil.', passionCta: 'Je m’abonne', passionGo: () => this.go('offers') };
    // Choix des favoris (fenêtre « Personnaliser mon accueil »)
    const sportList = D.sports.concat(D.clubs.map((c) => c.sport)).filter((x, i, a) => x && a.indexOf(x) === i && x !== 'Multisport');
    const sportChips = sportList.map((sp) => { const on = favS.indexOf(sp) >= 0; return { label: sp, pressed: on ? 'true' : 'false', bg: on ? 'var(--ink)' : 'var(--surface)', fg: on ? 'var(--bg)' : 'var(--text)', toggle: () => this.setFav('sports', on ? favS.filter((x) => x !== sp) : favS.concat([sp])) }; });
    const cfq = nrm(s.cfQ);
    const clubPool = D.clubs.filter((c) => favC.indexOf(c.id) < 0 && (!favS.length || favS.indexOf(c.sport) >= 0) && (!cfq || nrm(c.name + " " + c.city).indexOf(cfq) >= 0))
      .sort((a, b) => ((ZONE_RANG[a.zone || ''] != null ? ZONE_RANG[a.zone || ''] : 7) - (ZONE_RANG[b.zone || ''] != null ? ZONE_RANG[b.zone || ''] : 7)) || (a.name > b.name ? 1 : -1));
    const favClubChip = (c, on) => ({ label: c.name, sub: [c.sport, c.city].filter(Boolean).join(' · '), pressed: on ? 'true' : 'false', bg: on ? 'var(--ink)' : 'var(--surface)', fg: on ? 'var(--bg)' : 'var(--text)', toggle: () => this.setFav('clubs', on ? favC.filter((x) => x !== c.id) : favC.concat([c.id])) });
    const favClubChips = favClubObjs.map((c) => favClubChip(c, true)).concat(clubPool.slice(0, 24).map((c) => favClubChip(c, false)));
    const homePerso = { locked: !s.loggedIn, open: !!s.loggedIn, sportChips, clubChips: favClubChips, clubMore: clubPool.length > 24, cfQ: s.cfQ || '', onCfQ: (e) => this.setState({ cfQ: e.target.value }), hasFav, favLabel: favS.concat(favClubObjs.map((c) => c.name)).join(' · '),
      clearFav: () => { this.setFav('sports', []); this.setFav('clubs', []); }, login: () => this.setState({ customizeOpen: false, loginOpen: true, linkSent: false }), offers: () => this.go('offers') };
    const ldj = X.places[now0.getDate() % X.places.length];
    const lieuDuJour = Object.assign({}, ldj, { open: () => this.setState({ placeOpen: true, placeIdx: X.places.indexOf(ldj) }) });
    const quickChips = [['Scores en direct', () => this.go('live', { dTab: 'live' }), '#e03040'], ['Météo', () => this.go('meteo'), '#6aa6c8'], ['Mon quotidien', () => this.go('private'), accent], ['Compo en AR', () => this.openAR('lineup'), '#e03040'], ['Club House', () => this.go('clubhouse'), '#2e9e6b'], ['Culture', () => this.go('culture'), '#b07acc'], ['La Gazette', () => this.setState({ readerOpen: true, page: 0 }), '#9a6410'], ['Boutique', () => this.go('shop'), '#1f3b33']].map(([label, go, dot]) => ({ label, go, dot }));

    // ---------- espace privé ----------
    const P0 = this.priv();
    const pfm = Object.assign({ quick: '', evTitle: '', evDate: this.addDays(0), evTime: '18:00', evPlace: '', evCat: 'Sport', item: '', rideMatch: 'd6', rideFrom: '', rideSeats: '3', bLabel: '', bAmount: '', bCat: 'Équipement', dName: '', dWho: 'Moi', dDate: this.addDays(30), sSport: 'Football', sMin: '45', sFeel: 'Moyen', cName: '', cRole: '', cTel: '' }, s.pf || {});
    pfm.goal = String(P0.goal || 150);
    const setPf = (k) => (e) => this.setState({ pf: Object.assign({}, pfm, { [k]: e.target.value }) });
    ['quick', 'evTitle', 'evDate', 'evTime', 'evPlace', 'item', 'rideMatch', 'rideFrom', 'rideSeats', 'bLabel', 'bAmount', 'bCat', 'dName', 'dWho', 'dDate', 'sSport', 'sMin', 'sFeel', 'cName', 'cRole', 'cTel'].forEach((k) => { pfm['on' + k[0].toUpperCase() + k.slice(1)] = setPf(k); });
    pfm.onGoal = (e) => this.setPriv({ goal: Math.max(30, +e.target.value || 150) });
    const nid = () => Math.random().toString(36).slice(2, 9);
    const CATS = { Sport: '#2e9e6b', Club: '#e8a830', Santé: '#d0473e', Famille: '#6aa6c8', Culture: '#b07acc', Travail: '#8e7cc3', Match: '#e03040' };
    const tIso = this.addDays(0);
    const reminderEvents = s.reminders.map((id) => allM.find((m) => m.id === id)).filter((m) => m && m.date).map((m) => ({ id: 'r-' + m.id, title: m.home + ' – ' + m.away, date: m.date, time: m.time, cat: 'Match', place: '', reminder: true }));
    const allEvents = P0.events.concat(reminderEvents).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
    const evV = (e) => ({ title: e.title, time: e.time || '', cat: e.cat, place: e.place ? ' · ' + e.place : '', color: CATS[e.cat] || '#8f9aa8', canDelete: !e.reminder, remove: () => { this.setPriv({ events: P0.events.filter((x) => x.id !== e.id) }); this.say('Événement supprimé'); } });
    const upcoming = allEvents.filter((e) => e.date >= tIso);
    const byDay = {}; upcoming.forEach((e) => { (byDay[e.date] = byDay[e.date] || []).push(e); });
    const agendaDays = Object.keys(byDay).sort().slice(0, 14).map((d) => ({ label: d === tIso ? 'Aujourd’hui · ' + fmtDay(d) : d === this.addDays(1) ? 'Demain · ' + fmtDay(d) : fmtDay(d), items: byDay[d].map(evV) }));
    const todayEv = allEvents.filter((e) => e.date === tIso);
    const listKey = ['courses', 'sac', 'todo'].indexOf(s.pvList) >= 0 ? s.pvList : 'courses';
    const LISTN = { courses: 'Courses', sac: 'Sac de sport', todo: 'À faire' };
    const itemV = (lk) => (it) => ({ text: it.text, done: it.done, deco: it.done ? 'line-through' : 'none', color: it.done ? 'var(--muted)' : 'var(--text)',
      toggle: () => this.setPriv({ lists: Object.assign({}, P0.lists, { [lk]: P0.lists[lk].map((x) => x.id === it.id ? Object.assign({}, x, { done: !x.done }) : x) }) }),
      remove: () => this.setPriv({ lists: Object.assign({}, P0.lists, { [lk]: P0.lists[lk].filter((x) => x.id !== it.id) }) }) });
    const note = P0.notes.find((n) => n.id === P0.noteId) || P0.notes[0];
    const docV = (d) => { const days = Math.round((pd(d.date) - this.today0()) / 86400000); const st = days < 0 ? ['Expiré', 'var(--danger)', 'var(--danger-bg)'] : days <= 30 ? ['Expire dans ' + days + ' j', 'var(--note-fg)', 'var(--note-bg)'] : ['Valide', 'var(--success)', 'var(--surface-2)'];
      return { name: d.name, who: d.who, dateLabel: fmtDay(d.date), status: st[0], color: st[1], bg: st[2], days, remove: () => this.setPriv({ docs: P0.docs.filter((x) => x.id !== d.id) }) }; };
    const docs = P0.docs.map(docV).sort((a, b) => a.days - b.days);
    const alertDoc = docs.find((d) => d.days <= 30);
    const weekBars = []; let weekMin = 0;
    for (let i = 6; i >= 0; i--) { const iso = this.addDays(-i); const v = P0.sessions.filter((x) => x.date === iso).reduce((a, x) => a + (+x.min || 0), 0); weekMin += v; const dd = pd(iso); weekBars.push({ d: DOW[dd.getDay()].slice(0, 3), v: v ? String(v) : '', raw: v }); }
    const maxBar = Math.max(60, ...weekBars.map((b) => b.raw));
    weekBars.forEach((b) => { b.h = Math.round(b.raw / maxBar * 110) + 'px'; b.color = b.raw ? 'var(--acc)' : 'var(--line)'; });
    const monthPrefix = tIso.slice(0, 7), yearPrefix = tIso.slice(0, 4);
    const monthTotal = P0.budget.filter((b) => b.date.slice(0, 7) === monthPrefix).reduce((a, b) => a + b.amount, 0);
    const yearTotal = P0.budget.filter((b) => b.date.slice(0, 4) === yearPrefix).reduce((a, b) => a + b.amount, 0);
    const bcats = ['Licences', 'Équipement', 'Déplacements', 'Abonnements', 'Autre'].map((c) => { const t = P0.budget.filter((b) => b.cat === c && b.date.slice(0, 4) === yearPrefix).reduce((a, b) => a + b.amount, 0); return { label: c, total: eur2(t), pct: (yearTotal ? Math.round(t / yearTotal * 100) : 0) + '%', raw: t }; }).filter((c) => c.raw > 0);
    const upMatches = allM.filter((m) => m.status === 'up' && m.date).sort(byDate);
    const pvTabsDef = [['jour', 'Ma journée'], ['agenda', 'Agenda'], ['listes', 'Listes'], ['notes', 'Notes'], ['covoit', 'Covoiturage'], ['budget', 'Budget sport'], ['docs', 'Documents'], ['activite', 'Activité'], ['contacts', 'Contacts']];
    const pvTab = pvTabsDef.some((t) => t[0] === s.pvTab) ? s.pvTab : 'jour';
    const todoLeft = P0.lists.todo.filter((x) => !x.done).length;
    const pv = {
      tJour: pvTab === 'jour', tAgenda: pvTab === 'agenda', tListes: pvTab === 'listes', tNotes: pvTab === 'notes', tCovoit: pvTab === 'covoit', tBudget: pvTab === 'budget', tDocs: pvTab === 'docs', tActivite: pvTab === 'activite', tContacts: pvTab === 'contacts',
      goAgenda: () => this.setState({ pvTab: 'agenda' }), goListes: () => this.setState({ pvTab: 'listes', pvList: 'todo' }), goDocs: () => this.setState({ pvTab: 'docs' }), goActivite: () => this.setState({ pvTab: 'activite' }), goBudget: () => this.setState({ pvTab: 'budget' }),
      today: todayEv.map(evV), noToday: todayEv.length === 0, todayCount: String(todayEv.length), nextEvent: (upcoming[0] ? (upcoming[0].date === tIso ? '' : fmtDay(upcoming[0].date) + ' · ') + upcoming[0].time + ' ' + upcoming[0].title : 'Aucun événement'),
      todoLeft: String(todoLeft), todoTop: P0.lists.todo.slice(0, 4).map(itemV('todo')), hasAlertDoc: !!alertDoc, alertDoc: alertDoc ? alertDoc.name + ' (' + alertDoc.who + ') : ' + alertDoc.status.toLowerCase() : '',
      addQuick: () => { if (!pfm.quick.trim()) return; this.setPriv({ lists: Object.assign({}, P0.lists, { todo: P0.lists.todo.concat([{ id: nid(), text: pfm.quick.trim(), done: false }]) }) }); this.setState({ pf: Object.assign({}, pfm, { quick: '' }) }); },
      docsTop: docs.slice(0, 3), weekMin: String(weekMin), goal: String(P0.goal || 150), goalPct: Math.min(100, Math.round(weekMin / (P0.goal || 150) * 100)) + '%', monthLabel: MONTHS_L[now0.getMonth()].toLowerCase(), monthTotal: eur2(monthTotal),
      agendaDays, agendaEmpty: agendaDays.length === 0,
      cats: Object.keys(CATS).filter((c) => c !== 'Match').map((c) => ({ label: c, color: CATS[c], bg: pfm.evCat === c ? CATS[c] : 'var(--surface)', fg: pfm.evCat === c ? '#ffffff' : 'var(--text)', pick: () => this.setState({ pf: Object.assign({}, pfm, { evCat: c }) }) })),
      addEvent: () => { if (!pfm.evTitle.trim() || !pfm.evDate) { this.say('Indiquez un titre et une date'); return; } this.setPriv({ events: P0.events.concat([{ id: nid(), title: pfm.evTitle.trim(), date: pfm.evDate, time: pfm.evTime, cat: pfm.evCat, place: pfm.evPlace.trim() }]) }); this.setState({ pf: Object.assign({}, pfm, { evTitle: '', evPlace: '' }) }); this.say('Ajouté à votre agenda'); },
      listTabs: ['courses', 'sac', 'todo'].map((k) => Object.assign(pill(k === listKey), { label: LISTN[k], left: String(P0.lists[k].filter((x) => !x.done).length), pick: () => this.setState({ pvList: k }) })),
      items: P0.lists[listKey].map(itemV(listKey)), itemsEmpty: P0.lists[listKey].length === 0, itemsLeft: String(P0.lists[listKey].filter((x) => !x.done).length),
      itemPh: listKey === 'courses' ? 'Ajouter un article…' : listKey === 'sac' ? 'Ajouter au sac…' : 'Ajouter une tâche…',
      addItem: () => { if (!pfm.item.trim()) return; this.setPriv({ lists: Object.assign({}, P0.lists, { [listKey]: P0.lists[listKey].concat([{ id: nid(), text: pfm.item.trim(), done: false }]) }) }); this.setState({ pf: Object.assign({}, pfm, { item: '' }) }); },
      clearDone: () => this.setPriv({ lists: Object.assign({}, P0.lists, { [listKey]: P0.lists[listKey].filter((x) => !x.done) }) }),
      notes: P0.notes.map((n) => ({ title: n.title || 'Sans titre', preview: (n.text || '').replace(/\n/g, ' ').slice(0, 50), bg: note && n.id === note.id ? 'var(--surface-2)' : 'var(--surface)', border: note && n.id === note.id ? 'var(--acc)' : 'var(--line)', pick: () => this.setPriv({ noteId: n.id }) })),
      hasNote: !!note, noNote: !note, note: note || { title: '', text: '' },
      newNote: () => { const n = { id: nid(), title: 'Nouvelle note', text: '' }; this.setPriv({ notes: [n].concat(P0.notes), noteId: n.id }); },
      onNoteTitle: (e) => this.setPriv({ notes: P0.notes.map((n) => n.id === note.id ? Object.assign({}, n, { title: e.target.value }) : n) }),
      onNoteText: (e) => this.setPriv({ notes: P0.notes.map((n) => n.id === note.id ? Object.assign({}, n, { text: e.target.value }) : n) }),
      deleteNote: () => { const rest = P0.notes.filter((n) => n.id !== note.id); this.setPriv({ notes: rest, noteId: rest[0] ? rest[0].id : null }); this.say('Note supprimée'); },
      rides: P0.rides.map((r) => { const m = allM.find((x) => x.id === r.matchId); return { match: m ? m.home + ' – ' + m.away : 'Match', when: m ? fmtDay(m.date) + ' · ' + m.time : '', from: r.from, driver: r.mine ? 'vous conduisez' : r.driver, seats: String(r.seats),
        btnLabel: r.mine ? 'Retirer' : r.joined ? 'Inscrit ✓' : 'Réserver une place', btnBg: r.joined ? 'var(--inv-bg)' : 'var(--surface)', btnFg: r.joined ? 'var(--on-inv)' : 'var(--ink)',
        act: () => { if (r.mine) { this.setPriv({ rides: P0.rides.filter((x) => x.id !== r.id) }); return; } if (!r.joined && r.seats < 1) { this.say('Plus de place disponible'); return; } this.setPriv({ rides: P0.rides.map((x) => x.id === r.id ? Object.assign({}, x, { joined: !x.joined, seats: x.seats + (x.joined ? 1 : -1) }) : x) }); this.say(r.joined ? 'Réservation annulée' : 'Place réservée'); } }; }),
      matchOpts: upMatches.map((m) => ({ v: m.id, l: fmtDay(m.date) + ' · ' + m.home + ' – ' + m.away })),
      addRide: () => { if (!pfm.rideFrom.trim()) { this.say('Indiquez un lieu de départ'); return; } this.setPriv({ rides: [{ id: nid(), matchId: pfm.rideMatch, from: pfm.rideFrom.trim(), driver: 'vous', seats: Math.max(1, +pfm.rideSeats || 1), mine: true, joined: false }].concat(P0.rides) }); this.setState({ pf: Object.assign({}, pfm, { rideFrom: '' }) }); this.say('Trajet publié'); },
      budget: P0.budget.slice().sort((a, b) => (a.date > b.date ? -1 : 1)).map((b) => ({ label: b.label, cat: b.cat, amount: eur2(b.amount), date: fmtDay(b.date).replace(/^\S+ /, ''), remove: () => this.setPriv({ budget: P0.budget.filter((x) => x.id !== b.id) }) })),
      budgetCats: bcats, yearTotal: eur2(yearTotal), yearLabel: yearPrefix,
      addBudget: () => { const a = parseFloat(String(pfm.bAmount).replace(',', '.')); if (!pfm.bLabel.trim() || !(a > 0)) { this.say('Libellé et montant requis'); return; } this.setPriv({ budget: P0.budget.concat([{ id: nid(), label: pfm.bLabel.trim(), amount: a, cat: pfm.bCat, date: tIso }]) }); this.setState({ pf: Object.assign({}, pfm, { bLabel: '', bAmount: '' }) }); this.say('Dépense ajoutée'); },
      docs, addDoc: () => { if (!pfm.dName.trim() || !pfm.dDate) { this.say('Nom et échéance requis'); return; } this.setPriv({ docs: P0.docs.concat([{ id: nid(), name: pfm.dName.trim(), who: pfm.dWho.trim() || 'Moi', date: pfm.dDate }]) }); this.setState({ pf: Object.assign({}, pfm, { dName: '' }) }); this.say('Document suivi'); },
      weekBars, sessions: P0.sessions.slice().sort((a, b) => (a.date > b.date ? -1 : 1)).slice(0, 8).map((x) => ({ date: fmtDay(x.date).replace(/^\S+ /, ''), sport: x.sport, min: String(x.min), feel: x.feel })),
      addSession: () => { const mn = +pfm.sMin; if (!(mn > 0)) { this.say('Durée invalide'); return; } this.setPriv({ sessions: P0.sessions.concat([{ id: nid(), date: tIso, sport: pfm.sSport, min: mn, feel: pfm.sFeel }]) }); this.say('Séance enregistrée'); },
      contacts: P0.contacts.map((c) => ({ name: c.name, role: c.role, tel: 'tel:' + (c.tel || '').replace(/\s/g, ''), remove: () => this.setPriv({ contacts: P0.contacts.filter((x) => x.id !== c.id) }) })),
      addContact: () => { if (!pfm.cName.trim()) { this.say('Nom requis'); return; } this.setPriv({ contacts: P0.contacts.concat([{ id: nid(), name: pfm.cName.trim(), role: pfm.cRole.trim(), tel: pfm.cTel.trim() }]) }); this.setState({ pf: Object.assign({}, pfm, { cName: '', cRole: '', cTel: '' }) }); this.say('Contact ajouté'); },
      exportData: () => { try { navigator.clipboard.writeText(JSON.stringify(P0, null, 2)); this.say('Données copiées dans le presse-papiers'); } catch (e) { this.say('Copie impossible sur cet appareil'); } },
      resetData: () => { const empty = { events: [], lists: { courses: [], sac: [], todo: [] }, notes: [], rides: [], budget: [], docs: [], sessions: [], contacts: [], goal: 150, noteId: null }; this.setPriv(empty); this.say('Espace privé vidé'); }
    };
    const pvTabs = pvTabsDef.map(([id, label]) => ({ label, sel: id === pvTab ? 'true' : 'false', bg: id === pvTab ? 'var(--inv-bg)' : 'var(--surface)', fg: id === pvTab ? 'var(--on-inv)' : 'var(--text)', border: id === pvTab ? 'var(--inv-bg)' : 'var(--line-2)',
      hasBadge: (id === 'docs' && docs.filter((d) => d.days <= 30).length > 0) || (id === 'listes' && todoLeft > 0), badge: id === 'docs' ? String(docs.filter((d) => d.days <= 30).length) : String(todoLeft), pick: () => this.setState({ pvTab: id }) }));

    // ---------- culture ----------
    const CU = this.culture();
    const cuTabsDef = [['expo', 'Exposition'], ['parcours', 'Parcours sport & patrimoine'], ['lieux', 'Lieux de culture'], ['concours', 'Concours photo']];
    const cuTab = cuTabsDef.some((t) => t[0] === s.cuTab) ? s.cuTab : 'expo';
    const cuTabs = cuTabsDef.map(([id, label]) => Object.assign(pill(id === cuTab), { label, sel: id === cuTab ? 'true' : 'false', pick: () => this.setState({ cuTab: id }) }));
    let flatIdx = 0;
    const rooms = CU.rooms.map((r) => Object.assign({}, r, { works: r.works.map((w) => { const idx = flatIdx++; return Object.assign({}, w, { open: () => this.setState({ workIdx: idx }) }); }) }));
    const kinds = ['Tous', 'Musée', 'Patrimoine', 'Spectacle'];
    const cuKind = kinds.indexOf(s.cuKind) >= 0 ? s.cuKind : 'Tous';
    const votes = s.votes || {};
    const entries = CU.entries.map((e) => { const mine = !!votes[e.id]; return Object.assign({}, e, { n: e.base + (mine ? 1 : 0) }); });
    const topN = Math.max.apply(null, entries.map((e) => e.n));
    const cuf = Object.assign({ title: '', author: '', rights: false }, s.cuf || {});
    const cu = {
      tExpo: cuTab === 'expo', tParcours: cuTab === 'parcours', tLieux: cuTab === 'lieux', tConcours: cuTab === 'concours', rooms,
      routes: CU.routes.map((r) => Object.assign({}, r, { dist: 'distance à mesurer', steps: r.steps.map(([t, d], i) => ({ n: String(i + 1), t, d })),
        plan: () => this.planEvent(r.name + ' · ' + r.sport, this.nextSaturday(), '09:30', 'Sport', r.area),
        log: () => { if (!s.loggedIn) { this.setState({ loginOpen: true }); return; } const P0 = this.priv(); this.setPriv({ sessions: P0.sessions.concat([{ id: Math.random().toString(36).slice(2, 9), date: this.addDays(0), sport: r.sport.split(' ')[0] === 'Course' ? 'Course à pied' : r.sport.split(' ')[0], min: 60, feel: 'Moyen' }]) }); this.say('Sortie enregistrée dans votre activité (60 min, modifiable)'); },
        meteo: () => { this.setState({ wxCity: r.city }); this.go('meteo'); } })),
      kinds: kinds.map((k) => Object.assign(pill(k === cuKind), { label: k, pick: () => this.setState({ cuKind: k }) })),
      venues: CU.venues.filter((v) => cuKind === 'Tous' || v.kind === cuKind).map((v) => Object.assign({}, v, { hasLink: !!v.placeId, storyLabel: 'Le moment d’histoire',
        story: () => this.setState({ placeOpen: true, placeIdx: X.places.findIndex((p) => p.id === v.placeId) }),
        map: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.name + ' ' + v.city),
        plan: () => this.planEvent('Visite : ' + v.name, this.nextSaturday(), '14:30', 'Culture', v.city) })),
      entries: entries.map((e) => { const mine = !!votes[e.id]; return { title: e.title, img: e.img, author: e.author, votes: String(e.n), isTop: e.n === topN, pressed: mine ? 'true' : 'false', aria: (mine ? 'Retirer mon vote pour ' : 'Voter pour ') + e.title,
        bg: mine ? 'var(--acc)' : 'var(--surface)', fg: mine ? 'var(--on-acc)' : 'var(--text)', border: mine ? 'var(--acc)' : 'var(--line-2)', fill: mine ? 'currentColor' : 'none',
        vote: () => { const nv = Object.assign({}, votes, { [e.id]: !mine }); this.setState({ votes: nv }); this.writeLS('cb-votes', nv); if (!mine) this.say('Merci pour votre vote'); } }; }),
      notSent: !s.cuSent, sent: !!s.cuSent,
      submit: () => { if (!cuf.title.trim() || !cuf.author.trim() || !cuf.rights) { this.say('Titre, nom et attestation requis'); return; } this.setState({ cuSent: true }); }
    };
    cuf.onTitle = (e) => this.setState({ cuf: Object.assign({}, cuf, { title: e.target.value }) });
    cuf.onAuthor = (e) => this.setState({ cuf: Object.assign({}, cuf, { author: e.target.value }) });
    cuf.onRights = () => this.setState({ cuf: Object.assign({}, cuf, { rights: !cuf.rights }) });
    const woRaw = s.workIdx != null ? CU.flat[s.workIdx] : null;
    const woN = CU.flat.length;
    const wo = Object.assign({}, woRaw || CU.flat[0], {
      prev: () => this.setState({ workIdx: (s.workIdx + woN - 1) % woN }), next: () => this.setState({ workIdx: (s.workIdx + 1) % woN }),
      hasAction: !!woRaw && ['poster', 'place', 'article', 'product'].indexOf(woRaw.kind) >= 0,
      actionLabel: woRaw ? ({ poster: 'Acheter l’affiche d’art', place: 'Garder ce lieu en fond d’écran', article: 'Lire l’article', product: 'Voir en boutique' })[woRaw.kind] || '' : '',
      action: () => { if (!woRaw) return; this.setState({ workIdx: null });
        if (woRaw.kind === 'poster') this.go('product', { productId: 'affiche', color: 0, size: null, qty: 1 });
        else if (woRaw.kind === 'place') { this.setState({ placeOverride: woRaw.placeId }); this.say(woRaw.title + ' en arrière-plan'); }
        else if (woRaw.kind === 'article') this.go('article', { articleId: woRaw.articleId });
        else if (woRaw.kind === 'product') this.go('product', { productId: woRaw.productId, color: 0, size: null, qty: 1 }); }
    });
    const oeuvre = Object.assign({}, CU.flat[now0.getDate() % woN], { open: () => this.setState({ workIdx: now0.getDate() % woN }) });
    const routeDuJour = CU.routes[now0.getDay() % CU.routes.length];
    const cultureHome = { route: routeDuJour.name, routeSport: routeDuJour.sport, venue: CU.venues[now0.getDate() % CU.venues.length].name, open: () => this.go('culture', { cuTab: 'parcours' }), openVenues: () => this.go('culture', { cuTab: 'lieux' }) };

    // ---------- Mon quotidien : extensions ----------
    const P1 = this.priv();
    const members = P1.members || [];
    const memberById = (id) => members.find((m) => m.id === id) || members[0] || { name: 'Moi', color: '#0f2236' };
    const mFilter = s.pvMember || 'all';
    pv.agendaDays = pv.agendaDays.map((d) => Object.assign({}, d)); // copie
    const evWho = (e) => e.who || 'me';
    const upcoming2 = P1.events.concat(s.reminders.map((id) => allM.find((m) => m.id === id)).filter((m) => m && m.date).map((m) => ({ id: 'r-' + m.id, title: m.home + ' – ' + m.away, date: m.date, time: m.time, cat: 'Match', reminder: true, who: 'me' })))
      .filter((e) => e.date >= tIso && (mFilter === 'all' || evWho(e) === mFilter)).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
    const byDay2 = {}; upcoming2.forEach((e) => { (byDay2[e.date] = byDay2[e.date] || []).push(e); });
    pv.agendaDays = Object.keys(byDay2).sort().slice(0, 14).map((d) => ({ label: d === tIso ? 'Aujourd’hui · ' + fmtDay(d) : d === this.addDays(1) ? 'Demain · ' + fmtDay(d) : fmtDay(d),
      items: byDay2[d].map((e) => Object.assign(evV(e), { who: members.length > 1 ? ' · ' + memberById(evWho(e)).name : '', color: memberById(evWho(e)).color })) }));
    pv.agendaEmpty = pv.agendaDays.length === 0;
    pv.memberFilter = [{ id: 'all', name: 'Tout le monde', color: 'var(--acc)' }].concat(members).map((m) => Object.assign(pill(m.id === mFilter), { label: m.name, dot: m.color, pick: () => this.setState({ pvMember: m.id }) }));
    pv.memberOpts = members.map((m) => ({ v: m.id, l: m.name }));
    pfm.evWho = (s.pf && s.pf.evWho) || 'me';
    pfm.onEvWho = (e) => this.setState({ pf: Object.assign({}, pfm, { evWho: e.target.value }) });
    pv.addEvent = () => { if (!pfm.evTitle.trim() || !pfm.evDate) { this.say('Indiquez un titre et une date'); return; } this.setPriv({ events: P1.events.concat([{ id: nid(), title: pfm.evTitle.trim(), date: pfm.evDate, time: pfm.evTime, cat: pfm.evCat, place: pfm.evPlace.trim(), who: pfm.evWho }]) }); this.setState({ pf: Object.assign({}, pfm, { evTitle: '', evPlace: '' }) }); this.say('Ajouté à votre agenda'); };
    pv.members = members.map((m) => { const nx = P1.events.filter((e) => evWho(e) === m.id && e.date >= tIso).sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1))[0];
      return { name: m.name, role: m.role, color: m.color, initial: m.name.trim()[0].toUpperCase(), next: nx ? 'Prochain : ' + fmtDay(nx.date) + ' · ' + nx.time + ' · ' + nx.title : 'Aucun événement à venir', canRemove: m.id !== 'me',
        agenda: () => this.setState({ pvTab: 'agenda', pvMember: m.id }), remove: () => this.setPriv({ members: members.filter((x) => x.id !== m.id) }) }; });
    const PAL = ['#2e9e6b', '#6aa6c8', '#b07acc', '#d0473e', '#e8a830', '#3a4a78'];
    pfm.mName = (s.pf && s.pf.mName) || ''; pfm.mRole = (s.pf && s.pf.mRole) || '';
    pfm.onMName = setPf('mName'); pfm.onMRole = setPf('mRole');
    pv.addMember = () => { if (!pfm.mName.trim()) { this.say('Prénom requis'); return; } this.setPriv({ members: members.concat([{ id: nid(), name: pfm.mName.trim(), role: pfm.mRole.trim(), color: PAL[members.length % PAL.length] }]) }); this.setState({ pf: Object.assign({}, pfm, { mName: '', mRole: '' }) }); this.say('Membre ajouté'); };
    // repas
    const meals = P1.meals || {};
    const sportDays = new Set(P1.events.filter((e) => e.cat === 'Sport' || e.cat === 'Match').map((e) => e.date).concat(s.reminders.map((id) => (allM.find((m) => m.id === id) || {}).date)));
    const setMeal = (iso, k, v) => this.setPriv({ meals: Object.assign({}, meals, { [iso]: Object.assign({}, meals[iso] || {}, { [k]: v }) }) });
    pv.meals = [0, 1, 2, 3, 4, 5, 6].map((i) => { const iso = this.addDays(i); const m = meals[iso] || {}; return { day: i === 0 ? 'Aujourd’hui' : fmtDay(iso), lunch: m.lunch || '', dinner: m.dinner || '', color: i === 0 ? 'var(--gold-text)' : 'var(--text)', hasTag: sportDays.has(iso), tag: 'Jour de sport',
      onLunch: (e) => setMeal(iso, 'lunch', e.target.value), onDinner: (e) => setMeal(iso, 'dinner', e.target.value) }; });
    pv.todayLunch = (meals[tIso] || {}).lunch || 'Rien de prévu'; pv.todayDinner = (meals[tIso] || {}).dinner || 'Rien de prévu';
    pv.mealIdeas = ['Pâtes complètes au poulet', 'Riz, saumon et légumes', 'Omelette et patates douces', 'Soupe de légumes et pain complet', 'Quinoa, pois chiches et feta', 'Bowl de riz, œufs et avocat'].map((label) => ({ label,
      pick: () => { const free = [0, 1, 2, 3, 4, 5, 6].map((i) => this.addDays(i)).find((iso) => !(meals[iso] || {}).dinner); if (!free) { this.say('Tous les soirs sont déjà prévus'); return; } setMeal(free, 'dinner', label); this.say('Placé ' + (free === tIso ? 'ce soir' : 'le ' + fmtDay(free))); } }));
    const ING = [['pâte', 'Pâtes'], ['poulet', 'Poulet'], ['riz', 'Riz'], ['saumon', 'Saumon'], ['légume', 'Légumes de saison'], ['omelette', 'Œufs'], ['œuf', 'Œufs'], ['patate', 'Patates douces'], ['soupe', 'Légumes pour la soupe'], ['pain', 'Pain complet'], ['quinoa', 'Quinoa'], ['pois chiche', 'Pois chiches'], ['feta', 'Feta'], ['avocat', 'Avocats'], ['salade', 'Salade'], ['poisson', 'Poisson'], ['fromage', 'Fromage'], ['yaourt', 'Yaourts'], ['fruit', 'Fruits']];
    pv.mealsToList = () => { const txt = Object.keys(meals).filter((d) => d >= tIso && d <= this.addDays(6)).map((d) => ((meals[d].lunch || '') + ' ' + (meals[d].dinner || '')).toLowerCase()).join(' ');
      const need = []; ING.forEach(([k, v]) => { if (txt.includes(k) && need.indexOf(v) < 0) need.push(v); });
      const have = new Set(P1.lists.courses.map((x) => x.text.toLowerCase()));
      const add = need.filter((v) => !have.has(v.toLowerCase()));
      if (!add.length) { this.say(need.length ? 'Tout est déjà sur votre liste' : 'Aucun ingrédient reconnu'); return; }
      this.setPriv({ lists: Object.assign({}, P1.lists, { courses: P1.lists.courses.concat(add.map((t) => ({ id: nid(), text: t, done: false }))) }) }); this.say(add.length + ' ingrédient(s) ajouté(s) aux courses'); };
    // habitudes
    const habits = P1.habits || [];
    const last7 = [6, 5, 4, 3, 2, 1, 0].map((i) => this.addDays(-i));
    pv.habitDays = last7.map((iso) => { const dd = pd(iso); return { l: DOW[dd.getDay()].slice(0, 2) + ' ' + dd.getDate(), color: iso === tIso ? 'var(--gold-text)' : 'var(--muted)' }; });
    const toggleHabit = (h, iso) => this.setPriv({ habits: habits.map((x) => x.id === h.id ? Object.assign({}, x, { log: Object.assign({}, x.log, { [iso]: !(x.log || {})[iso] }) }) : x) });
    const streakOf = (h) => { let n = 0; let i = (h.log || {})[tIso] ? 0 : 1; while ((h.log || {})[this.addDays(-i)]) { n++; i++; } return n; };
    pv.habits = habits.map((h) => ({ name: h.name, streak: String(streakOf(h)), remove: () => this.setPriv({ habits: habits.filter((x) => x.id !== h.id) }),
      cells: last7.map((iso) => { const on = !!(h.log || {})[iso]; return { mark: on ? '✓' : '', pressed: on ? 'true' : 'false', aria: h.name + ' le ' + fmtDay(iso), bg: on ? 'var(--acc)' : 'var(--surface)', border: on ? 'var(--acc)' : 'var(--line-2)', toggle: () => toggleHabit(h, iso) }; }) }));
    pv.habitsToday = habits.slice(0, 4).map((h) => { const on = !!(h.log || {})[tIso]; return { name: h.name, mark: on ? '✓' : '', bg: on ? 'var(--acc)' : 'transparent', border: on ? 'var(--acc)' : 'var(--line-2)', toggle: () => toggleHabit(h, tIso) }; });
    pfm.habit = (s.pf && s.pf.habit) || ''; pfm.onHabit = setPf('habit');
    pv.addHabit = () => { if (!pfm.habit.trim()) return; this.setPriv({ habits: habits.concat([{ id: nid(), name: pfm.habit.trim(), log: {} }]) }); this.setState({ pf: Object.assign({}, pfm, { habit: '' }) }); };
    // rappels récurrents
    const recurs = P1.recurs || [];
    const DOWN = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const recV = (r) => { const occ = this.recurNext(r, tIso); const done = !!(r.done || {})[occ]; const nextShown = done ? this.recurNext(r, this.isoOf(new Date(new Date(occ + 'T00:00:00').getTime() + 86400000))) : occ;
      return { title: r.title, freq: r.freq === 'day' ? 'Chaque jour' : r.freq === 'week' ? 'Chaque ' + DOWN[+r.dow] : 'Le ' + r.dom + ' de chaque mois', next: nextShown === tIso ? 'aujourd’hui' : fmtDay(nextShown), isToday: occ === tIso && !done,
        mark: done ? '✓' : '', pressed: done ? 'true' : 'false', aria: (done ? 'Annuler : ' : 'Marquer comme fait : ') + r.title, bg: done ? 'var(--acc)' : 'transparent', border: done ? 'var(--acc)' : 'var(--line-2)', deco: done ? 'line-through' : 'none', op: done ? '.65' : '1', occ,
        toggle: () => this.setPriv({ recurs: recurs.map((x) => x.id === r.id ? Object.assign({}, x, { done: Object.assign({}, x.done, { [occ]: !done }) }) : x) }), remove: () => this.setPriv({ recurs: recurs.filter((x) => x.id !== r.id) }) }; };
    pv.recurs = recurs.map(recV).sort((a, b) => (a.occ < b.occ ? -1 : 1));
    pv.recursToday = pv.recurs.filter((r) => r.occ === tIso);
    pv.noRecursToday = pv.recursToday.length === 0;
    ['rTitle', 'rFreq', 'rDow', 'rDom'].forEach((k) => { pfm[k] = (s.pf && s.pf[k]) || ({ rTitle: '', rFreq: 'week', rDow: '1', rDom: '5' })[k]; pfm['on' + k[0].toUpperCase() + k.slice(1)] = setPf(k); });
    pv.rIsWeek = pfm.rFreq === 'week'; pv.rIsMonth = pfm.rFreq === 'month';
    pv.addRecur = () => { if (!pfm.rTitle.trim()) { this.say('Indiquez le rappel'); return; } this.setPriv({ recurs: recurs.concat([{ id: nid(), title: pfm.rTitle.trim(), freq: pfm.rFreq, dow: +pfm.rDow, dom: Math.min(28, Math.max(1, +pfm.rDom || 1)), done: {} }]) }); this.setState({ pf: Object.assign({}, pfm, { rTitle: '' }) }); this.say('Rappel ajouté'); };
    pv.goRappels = () => this.setState({ pvTab: 'rappels' }); pv.goRepas = () => this.setState({ pvTab: 'repas' }); pv.goHabitudes = () => this.setState({ pvTab: 'habitudes' });
    // minuteur
    const fmtS = (n) => Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    const phaseInfo = { ready: ['Prêt', 'var(--gold-on-inv)'], work: ['Effort', '#4fd1a6'], rest: ['Récupération', '#6aa6c8'], done: ['Terminé', 'var(--gold-on-inv)'] }[s.tmPhase] || ['Prêt', 'var(--gold-on-inv)'];
    const phaseLen = s.tmPhase === 'rest' ? s.tmRest : s.tmWork;
    const setTm = (k, min) => (e) => { const v = Math.max(min, parseInt(e.target.value, 10) || min); const patch = { [k]: v }; if (!s.tmRunning && s.tmPhase === 'ready' && k === 'tmWork') patch.tmLeft = v; this.setState(patch); };
    const tm = { phase: phaseInfo[0], phaseColor: phaseInfo[1], display: fmtS(s.tmPhase === 'ready' ? s.tmWork : s.tmLeft), round: String(s.tmRound), rounds: String(s.tmRounds), work: String(s.tmWork), rest: String(s.tmRest),
      pct: s.tmPhase === 'ready' ? '0%' : s.tmPhase === 'done' ? '100%' : Math.round((1 - s.tmLeft / Math.max(1, phaseLen)) * 100) + '%',
      toggleLabel: s.tmRunning ? 'Pause' : s.tmPhase === 'ready' || s.tmPhase === 'done' ? 'Démarrer' : 'Reprendre', toggle: () => (s.tmRunning ? this.tmPause() : this.tmStart()), reset: () => this.tmReset(),
      total: fmtS(s.tmWork * s.tmRounds + s.tmRest * Math.max(0, s.tmRounds - 1)),
      onWork: setTm('tmWork', 5), onRest: setTm('tmRest', 0), onRounds: setTm('tmRounds', 1),
      presets: [['30/30 × 10', 30, 30, 10], ['Tabata 20/10 × 8', 20, 10, 8], ['Côtes 60/90 × 6', 60, 90, 6]].map(([label, w, r, n]) => ({ label, pick: () => { clearInterval(this._tmI); this.setState({ tmWork: w, tmRest: r, tmRounds: n, tmRunning: false, tmPhase: 'ready', tmLeft: w, tmRound: 1 }); } })) };
    // navigation groupée
    const PVI = { jour: 'M12 3v2M12 19v2M5 12H3M21 12h-2M7 7l-1.4-1.4M17 7l1.4-1.4M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0', agenda: 'M4 5h16v15H4z M4 9h16 M8 3v4 M16 3v4', rappels: 'M12 8v5l3 2 M5 3L2 6 M19 3l3 3 M12 21a8 8 0 1 0 0-16a8 8 0 0 0 0 16z', famille: 'M9 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M17 11a2.5 2.5 0 1 0 0-5 M3 20c.8-3.5 3.2-5 6-5s5.2 1.5 6 5 M16 15c2.6 0 4.4 1.4 5 4',
      listes: 'M9 6h11 M9 12h11 M9 18h11 M4 6h.01 M4 12h.01 M4 18h.01', repas: 'M7 3v8 M5 3v4a2 2 0 0 0 4 0V3 M7 11v10 M17 3c-2 2-2 6 0 8v10', notes: 'M5 4h14v16H5z M8 9h8 M8 13h8 M8 17h5', budget: 'M3 7h18v12H3z M3 11h18 M7 15h3', docs: 'M6 3h8l4 4v14H6z M14 3v4h4',
      activite: 'M3 12h4l3-8 4 16 3-8h4', minuteur: 'M10 2h4 M12 14l3-3 M12 22a8 8 0 1 0 0-16a8 8 0 0 0 0 16z', habitudes: 'M4 12l5 5L20 6', covoit: 'M5 16l1.5-5h11L19 16 M4 16h16v3H4z M7 19v2 M17 19v2 M7.5 13.5h.01 M16.5 13.5h.01', contacts: 'M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z M12 11a2.5 2.5 0 1 0 0-5 M8.5 15c.6-1.8 2-2.6 3.5-2.6s2.9.8 3.5 2.6' };
    const PVL = { jour: 'Ma journée', agenda: 'Agenda', rappels: 'Rappels', famille: 'Famille', listes: 'Listes', repas: 'Repas', notes: 'Notes', budget: 'Budget sport', docs: 'Documents', activite: 'Activité', minuteur: 'Minuteur', habitudes: 'Habitudes', contacts: 'Contacts' };
    const pvTab2 = PVL[s.pvTab] ? s.pvTab : 'jour';
    ['tRepas', 'tHabitudes', 'tRappels', 'tMinuteur', 'tFamille'].forEach((k) => { pv[k] = false; });
    Object.keys(PVL).forEach((k) => { pv['t' + k[0].toUpperCase() + k.slice(1)] = pvTab2 === k; });
    const badges = { docs: docs.filter((d) => d.days <= 30).length, listes: todoLeft, rappels: pv.recursToday.filter((r) => r.mark === '').length };
    const pvGroups = [['Organiser', ['jour', 'agenda', 'rappels', 'famille']], ['Maison', ['listes', 'repas', 'notes', 'budget', 'docs']], ['Sport & bien-être', ['activite', 'minuteur', 'habitudes']], ['Carnet', ['contacts']]]
      .map(([label, ids]) => ({ label, tabs: ids.map((id) => ({ label: PVL[id], ico: PVI[id], cur: id === pvTab2 ? 'page' : 'false', bg: id === pvTab2 ? 'var(--inv-bg)' : 'transparent', fg: id === pvTab2 ? 'var(--on-inv)' : 'var(--text)', hasBadge: !!badges[id], badge: String(badges[id] || 0), pick: () => this.setState({ pvTab: id }) })) }));
    const pvTitle = PVL[pvTab2];
    // ---------- Club House ----------
    const CHD = this.chData();
    const chState = CHD;
    const saveCh = (patch) => { const v = Object.assign({}, this.chData(), patch); this._ch = v; this.writeLS('cb-clubhouse-v3', v); this.setState({ chRev: (s.chRev || 0) + 1 }); };
    const needLogin = () => { if (!s.loggedIn) { this.setState({ loginOpen: true, linkSent: false }); this.say('Connectez-vous pour participer au Club House'); return true; } return false; };
    const meName = s.role === 'admin' ? (s.name.trim() || 'Administrateur principal') : s.role === 'writer' ? (s.name.trim() || 'Rédaction') : (s.name.trim() || (s.email ? s.email.split('@')[0] : 'Vous'));
    const myPosts = chState.posts.filter((p) => p.mine).length;
    const myComments = chState.posts.reduce((a, p) => a + p.comments.filter((c) => c.mine).length, 0);
    const myAds = chState.ads.filter((a) => a.mine).length;
    const myRsvp = Object.keys(chState.rsvp || {}).filter((k) => chState.rsvp[k]).length;
    const myCulture = Object.keys(s.votes || {}).filter((k) => s.votes[k]).length;
    const myPronos = Object.keys(s.pronos || {}).length;
    const P2 = this.priv();
    const myRides = s.loggedIn ? P2.rides.filter((r) => r.mine || r.joined).length : 0;
    const pts = s.loggedIn ? myPronos * 10 + (chState.pollVote != null ? 5 : 0) + myCulture * 2 + s.orders.length * 50 + myPosts * 5 + myComments * 2 + myRsvp * 10 + myAds * 5 + myRides * 5 + (s.subs.casab ? 100 : 0) : 0;
    const LV = [['Supporter', 0, '#9aa6b4'], ['Fidèle', 100, '#6aa6c8'], ['Ultra', 250, '#e8a830'], ['Légende', 500, '#d0473e']];
    const lvIdx = LV.reduce((a, l, i) => (pts >= l[1] ? i : a), 0);
    const nextLv = LV[lvIdx + 1];
    const hash = [...this.profileKey()].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    const qr = [];
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) { const finder = (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5); const on = finder ? !(x % 6 === 1 && y % 6 === 1) : ((hash >> ((x * 9 + y) % 29)) & 1) === 1; qr.push({ c: on ? (s.cardColor === 'noir' ? '#0b0b0b' : '#141a21') : 'transparent' }); }
    const BADGES = [['Premier prono', 'Pronostiquer un match du Terrain', myPronos > 0], ['Plume', 'Publier au Club House', myPosts > 0], ['Tribune', 'Participer à un événement', myRsvp > 0], ['Œil de lynx', 'Voter au concours photo', myCulture > 0], ['Entraide', 'Annonce ou covoiturage', myAds + myRides > 0], ['Abonné', 'Être abonné Casa B+', !!s.subs.casab]];
    const authU = window.CasaAuth && window.CasaAuth.user;
    const memberNo = s.loggedIn ? cbMemberNo(authU ? authU.id : hash.toString(16).padStart(10, '0')) : '';
    const memberQr = memberNo ? cbQr(cbSiteUrl() + '?membre=' + memberNo) : null;
    const chMe = { name: s.loggedIn ? meName : 'Visiteur', points: String(pts), level: LV[lvIdx][0], number: memberNo || 'Connectez-vous',
      hasQr: !!memberQr, noQr: !memberQr, qrD: memberQr ? memberQr.d : '', qrVb: memberQr ? memberQr.vb : '0 0 1 1',
      qrBig: !!s.qrBig && !!memberQr, openQr: () => this.setState({ qrBig: true }), closeQr: () => this.setState({ qrBig: false }),
      pct: nextLv ? Math.round((pts - LV[lvIdx][1]) / (nextLv[1] - LV[lvIdx][1]) * 100) + '%' : '100%',
      toNext: !s.loggedIn ? 'Connectez-vous pour cumuler des points' : nextLv ? 'Encore ' + (nextLv[1] - pts) + ' pts pour le niveau ' + nextLv[0] : 'Niveau maximal atteint', qr,
      badges: BADGES.map(([name, how, ok]) => ({ name, how, status: ok ? 'Obtenu' : 'À débloquer', stColor: ok ? 'var(--success)' : 'var(--muted)', border: ok ? 'var(--acc)' : 'var(--line)', op: ok ? '1' : '.7' })),
      perks: X.partners.map((p) => { const claimed = s.claimed.indexOf(p.id) >= 0; return { name: p.name, mono: p.mono, color: p.color, perk: p.perk, status: claimed ? 'Activé' : s.subs.casab ? 'Disponible' : 'Avec Casa B+', stColor: claimed ? 'var(--success)' : 'var(--gold-text)', open: () => this.setState({ partnerId: p.id }) }; }) };
    const chTabsDef = [['fil', 'Le fil'], ['annonces', 'Annonces & entraide'], ['events', 'Événements'], ['ligue', 'Classement'], ['carte', 'Ma carte membre']];
    const chTab = chTabsDef.some((t) => t[0] === s.chTab) ? s.chTab : 'fil';
    const chTabs = chTabsDef.map(([id, label]) => Object.assign(pill(id === chTab), { label, sel: id === chTab ? 'true' : 'false', pick: () => this.setState({ chTab: id }) }));
    const ROOMS = ['Général', 'Football', 'Basket', 'Water-polo', 'Trail & course'];
    const room = ['Tous'].concat(ROOMS).indexOf(s.chRoom) >= 0 ? s.chRoom : 'Tous';
    const PCOL = ['#2e9e6b', '#6aa6c8', '#b07acc', '#d0473e', '#e8a830', '#3a4a78', '#8a4b2a'];
    const chf = Object.assign({ text: '', room: 'Général', comment: '', adType: 'Propose', adCat: 'Matériel', adTitle: '', adText: '', adWhere: '' }, s.chf || {});
    ['text', 'room', 'comment', 'adType', 'adCat', 'adTitle', 'adText', 'adWhere'].forEach((k) => { chf['on' + k[0].toUpperCase() + k.slice(1)] = (e) => this.setState({ chf: Object.assign({}, chf, { [k]: e.target.value }) }); });
    chf.left = String(500 - chf.text.length);
    const arts = this.allArticles();
    const updPost = (id, fn) => saveCh({ posts: chState.posts.map((p) => (p.id === id ? fn(p) : p)) });
    const chPosts = chState.posts.filter((p) => room === 'Tous' || p.room === room).map((p, i) => { const a = p.articleId ? arts.find((x) => x.id === p.articleId) : null; const open = !!(s.chOpen || {})[p.id];
      return { author: p.author, initial: p.author.trim()[0].toUpperCase(), color: p.staff ? '#0f2236' : PCOL[[...p.author].reduce((x, c) => x + c.charCodeAt(0), 0) % PCOL.length], isStaff: !!p.staff, room: p.room, time: p.time, text: p.text, mine: !!p.mine,
        hasLink: !!a, linkImg: a ? a.img : '', linkTag: a ? a.tag : '', linkTitle: a ? a.title : '', openLink: () => a && this.go('article', { articleId: a.id }),
        likes: String(p.likes + (p.liked ? 1 : 0)), likePressed: p.liked ? 'true' : 'false', likeBg: p.liked ? 'var(--acc)' : 'var(--surface)', likeFg: p.liked ? 'var(--on-acc)' : 'var(--text)', likeBorder: p.liked ? 'var(--acc)' : 'var(--line-2)', likeFill: p.liked ? 'currentColor' : 'none',
        like: () => { if (needLogin()) return; updPost(p.id, (q) => Object.assign({}, q, { liked: !q.liked })); },
        commentsLabel: p.comments.length ? p.comments.length + ' commentaire' + (p.comments.length > 1 ? 's' : '') : 'Commenter', open, comments: p.comments,
        toggleComments: () => this.setState({ chOpen: Object.assign({}, s.chOpen, { [p.id]: !open }) }),
        comment: () => { if (needLogin() || !chf.comment.trim()) return; updPost(p.id, (q) => Object.assign({}, q, { comments: q.comments.concat([{ author: meName, text: chf.comment.trim(), mine: true }]) })); this.setState({ chf: Object.assign({}, chf, { comment: '' }) }); this.say('Commentaire publié · +2 pts'); },
        remove: () => saveCh({ posts: chState.posts.filter((q) => q.id !== p.id) }) }; });
    // Sondage : contenus/clubhouse.js (modifiable dans l'espace administrateur) ; le vote est mémorisé par question
    const SD = (window.CASA_CLUBHOUSE || {}).sondage || {};
    const poll = { q: SD.question || '', opts: (SD.options || []).filter(Boolean).map((t) => ({ t: String(t), v: 0 })) };
    if (chState.pollQ !== poll.q && chState.pollVote != null) chState.pollVote = null;
    const pollTotal = poll.opts.reduce((a, o, i) => a + o.v + (chState.pollVote === i ? 1 : 0), 0);
    const pollV = { has: !!(poll.q && poll.opts.length), q: poll.q, total: String(pollTotal), opts: poll.opts.map((o, i) => { const v = o.v + (chState.pollVote === i ? 1 : 0); const pc = pollTotal ? Math.round(v / pollTotal * 100) : 0; const mine = chState.pollVote === i;
      return { t: o.t, pct: pc + ' %', w: pc + '%', bar: mine ? 'var(--acc)' : 'var(--line-2)', border: mine ? 'var(--acc)' : 'var(--line)', pressed: mine ? 'true' : 'false',
        vote: () => { if (needLogin()) return; saveCh({ pollVote: mine ? null : i, pollQ: poll.q }); if (!mine) this.say('Vote enregistré · +5 pts'); } }; }) };
    const evDate = (iso) => { const d = pd(iso); return { dow: DOW[d.getDay()], day: String(d.getDate()), mon: MONTHS[d.getMonth()] }; };
    const chEvents = chState.events.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).map((e) => { const going = !!(chState.rsvp || {})[e.id];
      return Object.assign({}, e, evDate(e.date), { going: String(e.going + (going ? 1 : 0)), btnLabel: going ? 'J’y vais ✓' : 'J’y vais', btnBg: going ? 'var(--inv-bg)' : 'var(--surface)', btnFg: going ? 'var(--on-inv)' : 'var(--ink)',
        rsvp: () => { if (needLogin()) return; saveCh({ rsvp: Object.assign({}, chState.rsvp, { [e.id]: !going }) });
          if (!going) { const PP = this.priv(); this.setPriv({ events: PP.events.concat([{ id: 'ch-' + e.id, title: e.title, date: e.date, time: e.time, cat: 'Club', place: e.place, who: 'me' }]) }); this.say('Inscrit · ajouté à votre agenda · +10 pts'); }
          else { const PP = this.priv(); this.setPriv({ events: PP.events.filter((x) => x.id !== 'ch-' + e.id) }); } } }); });
    const nextEv = chEvents[0] || { title: '—', date: tIso, time: '', place: '' };
    const AD_CATS = ['Tout', 'Matériel', 'Bénévolat', 'Joueurs', 'Stages', 'Covoiturage'];
    const adCat = AD_CATS.indexOf(s.chAdCat) >= 0 ? s.chAdCat : 'Tout';
    const TYPE_C = { Propose: ['var(--surface-2)', 'var(--success)'], Recherche: ['var(--note-bg)', 'var(--note-fg)'], Donne: ['var(--danger-bg)', 'var(--danger)'] };
    const chAds = chState.ads.filter((a) => adCat === 'Tout' || a.cat === adCat).map((a) => ({ type: a.type, cat: a.cat, title: a.title, text: a.text, author: a.author, where: a.where, time: a.time, mine: !!a.mine, typeBg: TYPE_C[a.type][0], typeFg: TYPE_C[a.type][1],
      contactLabel: a.mine ? 'Mon annonce' : 'Contacter', contact: () => { if (a.mine || needLogin()) return; this.say('Message envoyé à ' + a.author); }, remove: () => saveCh({ ads: chState.ads.filter((x) => x.id !== a.id) }) }));
    const board = [];
    if (s.loggedIn) board.push({ name: meName + ' (vous)', p: pts, me: true });
    const boardV = board.sort((a, b) => b.p - a.p).map((b, i) => { const li = LV.reduce((a, l, k) => (b.p >= l[1] ? k : a), 0); return { rank: String(i + 1), name: b.name, points: b.p + ' pts', level: LV[li][0], weight: b.me ? '900' : '700', bg: b.me ? 'var(--surface-2)' : 'var(--surface)', rankBg: i < 3 ? 'var(--acc)' : 'var(--surface-2)', rankFg: i < 3 ? '#080f1a' : 'var(--ink)' }; });
    const ch = { tFil: chTab === 'fil', tAnnonces: chTab === 'annonces', tEvents: chTab === 'events', tLigue: chTab === 'ligue', tCarte: chTab === 'carte',
      posts: chPosts, rooms: ['Tous'].concat(ROOMS).map((r) => Object.assign(pill(r === room), { label: r, pick: () => this.setState({ chRoom: r }) })), roomOpts: ROOMS.map((v) => ({ v })),
      publish: () => { if (needLogin()) return; if (chf.text.trim().length < 3) { this.say('Écrivez quelques mots'); return; } saveCh({ posts: [{ id: 'm' + Date.now(), author: meName, room: chf.room, time: 'à l’instant', text: chf.text.trim().slice(0, 500), likes: 0, liked: false, comments: [], mine: true, staff: !!s.role }].concat(chState.posts) }); this.setState({ chf: Object.assign({}, chf, { text: '' }), chRoom: 'Tous' }); this.say('Publié au Club House · +5 pts'); },
      poll: pollV, nextEvent: chEvents[0] ? { title: nextEv.title, when: fmtDay(nextEv.date) + ' · ' + nextEv.time, place: nextEv.place } : { title: 'Aucun rendez-vous pour l’instant', when: 'Proposez le vôtre', place: 'onglet Événements' }, goEvents: () => this.setState({ chTab: 'events' }), goCard: () => this.setState({ chTab: 'carte' }), goPronos: () => this.go('live', { dTab: 'pronos' }),
      adCats: AD_CATS.map((c) => Object.assign(pill(c === adCat), { label: c, pick: () => this.setState({ chAdCat: c }) })), showAds: adCat !== 'Covoiturage', showRides: adCat === 'Covoiturage', ads: chAds,
      publishAd: () => { if (needLogin()) return; if (!chf.adTitle.trim()) { this.say('Titre requis'); return; } saveCh({ ads: [{ id: 'a' + Date.now(), type: chf.adType, cat: chf.adCat, title: chf.adTitle.trim(), text: chf.adText.trim(), author: meName, where: chf.adWhere.trim() || 'Cotentin', time: 'à l’instant', mine: true }].concat(chState.ads) }); this.setState({ chf: Object.assign({}, chf, { adTitle: '', adText: '', adWhere: '' }) }); this.say('Annonce publiée · +5 pts'); },
      addRide: () => { if (needLogin()) return; pv.addRide(); },
      events: chEvents, board: boardV,
      scale: [['Un pronostic', '+10'], ['Un événement « J’y vais »', '+10'], ['Une publication', '+5'], ['Une annonce ou un covoiturage', '+5'], ['Le sondage de la semaine', '+5'], ['Un commentaire', '+2'], ['Un vote au concours photo', '+2'], ['Une commande boutique', '+50'], ['Abonnement Casa B+', '+100']].map(([what, p]) => ({ what, pts: p })) };
    const CARDS0 = { gold: { line: '#3a2706', land: 'rgba(58,39,6,.10)' }, argent: { line: '#1d2a38', land: 'rgba(29,42,56,.08)' }, noir: { line: '#e8b64c', land: 'rgba(232,182,76,.07)' } };
    const CARDS = { gold: { name: 'Gold', bg: 'linear-gradient(135deg, #7a561a 0%, #c8973a 22%, #f3dc9a 46%, #e2b65a 60%, #9a6c22 100%)', fg: '#23180a', sub: '#4d3712', acc: '#3a2706', qrBg: '#fff7e0', shine: '.35', logoOp: '.28', blend: 'multiply', sw: 'linear-gradient(135deg,#9a6c22,#f3dc9a,#c8973a)' },
      argent: { name: 'Argent', bg: 'linear-gradient(135deg, #6d747c 0%, #aeb6be 24%, #f2f4f6 48%, #c4cbd2 64%, #7d858e 100%)', fg: '#141a21', sub: '#3c454f', acc: '#1d2a38', qrBg: '#ffffff', shine: '.45', logoOp: '.22', blend: 'multiply', sw: 'linear-gradient(135deg,#7d858e,#f2f4f6,#aeb6be)' },
      noir: { name: 'Noire', bg: 'linear-gradient(135deg, #050505 0%, #171717 50%, #0c0c0c 100%)', fg: '#f6edd6', sub: '#b9ad94', acc: '#e8b64c', qrBg: '#f6edd6', shine: '.08', logoOp: '.3', blend: 'normal', sw: 'linear-gradient(135deg,#050505,#2a2a2a)' } };
    const cardKey = CARDS[s.cardColor] ? s.cardColor : 'noir';
    const card = Object.assign({}, CARDS[cardKey], CARDS0[cardKey]);
    const cardColors = [['gold', 'Gold'], ['argent', 'Argent'], ['noir', 'Noire']].map(([id, label]) => ({ label, sw: CARDS[id].sw, checked: id === cardKey ? 'true' : 'false', ring: id === cardKey ? 'var(--acc)' : 'var(--line-2)', pick: () => { this.setState({ cardColor: id }); this.writeLS('cb-card-color', id); this.say('Carte ' + CARDS[id].name.toLowerCase() + ' sélectionnée'); } }));
    const chHome = { post: chState.posts[0] ? chState.posts[0].author + ' : ' + chState.posts[0].text.slice(0, 90) + (chState.posts[0].text.length > 90 ? '…' : '') : '', event: nextEv.title + ' · ' + fmtDay(nextEv.date), points: String(pts), level: LV[lvIdx][0], go: () => this.go('clubhouse') };
    // ---------- OlistO ----------
    const num = (v, d) => { const x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : d; };
    const oM = num(s.olM, 180000), oD = Math.max(1, Math.min(30, num(s.olD, 20))), oT = Math.max(0, num(s.olT, 3.5)), oA = Math.max(0, num(s.olA, 0.25)), oR = Math.max(0, num(s.olR, 3600)), oC = Math.max(0, num(s.olC, 150));
    const nM = oD * 12, rM = oT / 100 / 12;
    const base = rM > 0 ? oM * rM / (1 - Math.pow(1 + rM, -nM)) : oM / nM;
    const insM = oM * oA / 100 / 12;
    const monthly = base + insM;
    const debtPct = oR > 0 ? (monthly + oC) / oR * 100 : 0;
    const e0 = (n) => Math.round(n).toLocaleString('fr-FR') + ' €';
    const setOl = (k) => (e) => this.setState({ [k]: e.target.value });
    const olP = (X.partners || []).find((p) => p.id === 'olisto') || {};
    const olSite = cbPartnerLink(olP.site, 'olisto', 'site'), olApp = cbPartnerLink(olP.app, 'olisto', 'application');
    const ol = { siteHref: olSite, appHref: olApp, hasSite: !!olSite, hasApp: !!olApp, m: String(s.olM ?? 180000), d: String(s.olD ?? 20), t: String(s.olT ?? 3.5), a: String(s.olA ?? 0.25), r: String(s.olR ?? 3600), c: String(s.olC ?? 150),
      onM: setOl('olM'), onD: setOl('olD'), onT: setOl('olT'), onA: setOl('olA'), onR: setOl('olR'), onC: setOl('olC'),
      monthly: e0(monthly), ins: e0(insM), interest: e0(base * nM - oM), debt: (Math.round(debtPct * 10) / 10).toString().replace('.', ',') + ' %',
      debtW: Math.min(100, debtPct / 50 * 100) + '%', debtColor: debtPct <= 33 ? 'var(--success)' : debtPct <= 35 ? 'var(--gold-text)' : 'var(--danger)',
      callback: () => this.go('contact', { subject: 'Projet avec OlistO — être rappelé', profile: 'Autre', contactSent: false }),
      services: [
        ['Projet immobilier', 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z', 'Achat de résidence principale ou secondaire, investissement locatif, immobilier neuf : le courtier met les banques en concurrence et monte votre dossier.', ['Étude de votre capacité d’emprunt', 'Négociation du taux et des garanties', 'Suivi jusqu’à la signature'], 'Parler de mon projet'],
        ['Regroupement de crédits', 'M4 7h16M4 12h10M4 17h6 M17 14l3 3-3 3', 'Rassembler plusieurs crédits en un seul pour alléger la mensualité et simplifier son budget.', ['Analyse de vos crédits en cours', 'Une seule mensualité', 'Attention : la durée et le coût total peuvent augmenter'], 'Étudier un regroupement'],
        ['Assurance emprunteur', 'M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z M9 12l2 2 4-4', 'Comparer les contrats pour protéger votre prêt au juste prix, à la souscription ou en cours de prêt.', ['Comparaison de contrats', 'Changement possible à tout moment (loi Lemoine)', 'Garanties équivalentes exigées par la banque'], 'Comparer mon assurance']
      ].map(([title, ico, text, pts, cta]) => ({ title, ico, text, points: pts.map((t) => ({ t })), cta, go: () => this.go('contact', { subject: 'OlistO — ' + title, profile: 'Autre', contactSent: false }) })),
      faq: [['Pourquoi passer par un courtier ?', 'Le courtier compare les offres de plusieurs banques et assureurs, négocie pour vous et vous accompagne dans le montage du dossier. Il doit être immatriculé à l’ORIAS.'],
        ['Peut-on changer d’assurance emprunteur ?', 'Oui. Depuis la loi Lemoine de 2022, l’assurance d’un prêt immobilier peut être résiliée à tout moment, à condition de présenter des garanties équivalentes.'],
        ['Le regroupement de crédits est-il toujours intéressant ?', 'Il réduit généralement la mensualité, mais allonge souvent la durée et peut augmenter le coût total. Une étude personnalisée est indispensable.']].map(([q, a]) => ({ q, a }))
    };
    // ---------- CRM ----------
    const CR = this.crmData();
    const crmTabsDef = [['home', 'Vue d’ensemble'], ['contacts', 'Contacts'], ['pipe', 'Pipeline'], ['tasks', 'Tâches'], ['agents', 'Agents autonomes']];
    const crmTab = crmTabsDef.some((x) => x[0] === s.crmTab) ? s.crmTab : 'home';
    const AGD = { qualif: ['Agent Qualification', 'Analyse chaque nouveau contact venu du site (formulaires, boutique, newsletter, OlistO, Club House), calcule un score, le classe et crée une tâche de rappel pour les plus chauds.'],
      relance: ['Agent Relances', 'Surveille les affaires sans activité depuis 7 jours, rédige l’e-mail de relance et planifie la vérification de la réponse.'],
      fidel: ['Agent Fidélisation', 'Repère les abonnés à fidéliser et prépare une offre personnalisée (formule annuelle, avantage partenaire).'],
      hygiene: ['Agent Qualité des données', 'Fusionne les doublons, normalise les e-mails et signale les consentements RGPD à vérifier.'],
      rapport: ['Agent Rapport', 'Calcule la valeur du pipeline, le taux de réussite et les tâches en retard pour le tableau de bord.'] };
    const STAGES = ['Nouveau', 'Qualifié', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
    const STC = { Nouveau: '#9aa6b4', Qualifié: '#6aa6c8', Proposition: '#e8a830', Négociation: '#c8881a', Gagné: '#2e9e6b', Perdu: '#d0473e' };
    const openDeals = CR.deals.filter((d) => ['Gagné', 'Perdu'].indexOf(d.stage) < 0);
    const lateTasks = CR.tasks.filter((k) => !k.done && k.due < tIso);
    const eurK = (n) => Math.round(n).toLocaleString('fr-FR') + ' €';
    const updC = (patch) => this.saveCrm(Object.assign({}, this.crmData(), patch));
    const ago = (iso) => { const n = Math.round((this.today0() - new Date(iso + 'T00:00:00')) / 86400000); return n <= 0 ? 'aujourd’hui' : n === 1 ? 'hier' : 'il y a ' + n + ' j'; };
    const cq = (s.crmQ || '').toLowerCase();
    const cType = s.crmType || 'Tous';
    const selC = CR.contacts.find((c) => c.id === s.crmSel);
    const ownerF = s.crmOwner || 'Tous';
    const tasksF = CR.tasks.filter((k) => ownerF === 'Tous' || (ownerF === 'Agents' ? k.owner !== 'humain' : k.owner === 'humain'));
    const tkV = (k) => ({ title: k.title, rel: k.rel || '—', due: fmtDay(k.due), done: k.done, deco: k.done ? 'line-through' : 'none', op: k.done ? '.6' : '1', owner: k.owner === 'humain' ? 'Vous' : k.owner,
      ownerBg: k.owner === 'humain' ? 'var(--surface-2)' : 'var(--inv-bg)', ownerFg: k.owner === 'humain' ? 'var(--text)' : 'var(--gold-on-inv)',
      toggle: () => updC({ tasks: this.crmData().tasks.map((x) => x.id === k.id ? Object.assign({}, x, { done: !x.done }) : x) }) });
    const agentsOn = Object.keys(CR.agents).filter((k) => CR.agents[k].on).length;
    const crm = {
      title: ({ home: 'Vue d’ensemble', contacts: 'Contacts', pipe: 'Pipeline commercial', tasks: 'Tâches', agents: 'Agents autonomes' })[crmTab],
      tabs: crmTabsDef.map(([id, label]) => ({ label, sel: id === crmTab ? 'true' : 'false', color: id === crmTab ? 'var(--ink)' : 'var(--muted)', line: id === crmTab ? 'var(--acc)' : 'transparent',
        hasBadge: (id === 'home' && CR.approvals.length > 0) || (id === 'tasks' && lateTasks.length > 0), badge: String(id === 'home' ? CR.approvals.length : lateTasks.length), pick: () => this.setState({ crmTab: id }) })),
      tHome: crmTab === 'home', tContacts: crmTab === 'contacts', tPipe: crmTab === 'pipe', tTasks: crmTab === 'tasks', tAgents: crmTab === 'agents',
      agentsStatus: agentsOn + ' agent(s) actif(s)' + (s.view === 'studio' && s.studioTab === 'crm' ? ' · en surveillance' : ''), agentsColor: agentsOn ? 'var(--success)' : 'var(--muted)', pulse: agentsOn ? 'pulse' : '',
      runAll: () => { Object.keys(this.crmData().agents).forEach((k) => this.runAgent(k)); this.say('Agents lancés'); },
      kpis: [[String(CR.contacts.length), 'Contacts', 'var(--ink)', 'contacts'], [String(CR.contacts.filter((c) => c.status === 'nouveau').length), 'Nouveaux à qualifier', 'var(--gold-text)', 'contacts'],
        [eurK(openDeals.reduce((a, d) => a + d.amount, 0)), 'Pipeline ouvert', 'var(--ink)', 'pipe'], [String(CR.deals.filter((d) => d.stage === 'Gagné').length), 'Affaires gagnées', 'var(--success)', 'pipe'],
        [String(lateTasks.length), 'Tâches en retard', lateTasks.length ? 'var(--danger)' : 'var(--ink)', 'tasks']].map(([v, l, color, tab]) => ({ v, l, color, go: () => this.setState({ crmTab: tab }) })),
      stageBars: STAGES.map((st) => { const ds = CR.deals.filter((d) => d.stage === st); const tot = ds.reduce((a, d) => a + d.amount, 0); const mx = Math.max(1, ...STAGES.map((x) => CR.deals.filter((d) => d.stage === x).reduce((a, d) => a + d.amount, 0))); return { label: st + ' (' + ds.length + ')', value: eurK(tot), w: Math.round(tot / mx * 100) + '%', color: STC[st] }; }),
      reportLine: CR.report || 'Le rapport sera calculé au prochain passage de l’Agent Rapport.',
      approvalCount: String(CR.approvals.length), noApprovals: CR.approvals.length === 0, goAgents: () => this.setState({ crmTab: 'agents' }),
      approvals: CR.approvals.slice(0, 4).map((a) => ({ agent: a.agent, when: a.when, title: a.title, text: a.text,
        ok: () => { const C2 = JSON.parse(JSON.stringify(this.crmData())); C2.approvals = C2.approvals.filter((x) => x.id !== a.id);
          if (a.kind === 'relance') { C2.deals = C2.deals.map((d) => d.id === a.dealId ? Object.assign({}, d, { last: tIso }) : d); C2.tasks.unshift({ id: 't' + Date.now(), dealId: a.dealId, title: 'Vérifier la réponse · ' + a.title.replace('Relancer ', ''), due: this.addDays(3), rel: 'Relance validée', owner: 'Agent Relances', done: false }); }
          if (a.kind === 'fidel') C2.contacts = C2.contacts.map((c) => c.id === a.contactId ? Object.assign({}, c, { tags: c.tags.concat(['Offre annuelle proposée']) }) : c);
          C2.log.unshift({ agent: 'vous', text: 'avez approuvé : ' + a.title + ' (envoi simulé)', when: this.crmNow(), dot: '#2e9e6b' }); this.saveCrm(C2); this.say('Action approuvée'); },
        no: () => { const C2 = JSON.parse(JSON.stringify(this.crmData())); C2.approvals = C2.approvals.filter((x) => x.id !== a.id); C2.log.unshift({ agent: 'vous', text: 'avez refusé : ' + a.title, when: this.crmNow(), dot: '#d0473e' }); if (a.dealId) C2.deals = C2.deals.map((d) => d.id === a.dealId ? Object.assign({}, d, { last: tIso }) : d); this.saveCrm(C2); } })),
      feed: (CR.log.length ? CR.log : [{ agent: 'système', text: 'Les agents démarrent. Lancez-les ou attendez le prochain passage.', when: '', dot: '#9aa6b4' }]).slice(0, 12).map((l) => ({ agent: (AGD[l.agent] || [l.agent === 'vous' ? 'Vous' : 'Système'])[0], text: l.text, when: l.when, dot: l.dot })),
      q: s.crmQ || '', onQ: (e) => this.setState({ crmQ: e.target.value }),
      typeChips: ['Tous', 'Partenaire', 'Club', 'Annonceur', 'Abonné', 'Supporter', 'Prospect'].map((x) => Object.assign(pill(x === cType), { label: x, pick: () => this.setState({ crmType: x }) })),
      contacts: CR.contacts.filter((c) => (cType === 'Tous' || c.type === cType) && (!cq || (c.name + ' ' + c.org + ' ' + c.city + ' ' + c.email).toLowerCase().includes(cq))).map((c) => ({ name: c.name, org: c.org || '—', city: c.city || '—', type: c.type, source: c.source,
        score: c.score == null ? 'nouveau' : String(c.score), scoreBg: c.score == null ? 'var(--note-bg)' : c.score >= 60 ? 'var(--success)' : 'var(--surface-2)', scoreFg: c.score == null ? 'var(--note-fg)' : c.score >= 60 ? '#fff' : 'var(--text)',
        last: ago(c.last), bg: s.crmSel === c.id ? 'var(--surface-2)' : 'transparent', open: () => this.setState({ crmSel: c.id }) })),
      hasSel: !!selC, noSel: !selC,
      sel: selC ? { name: selC.name, org: selC.org || '—', city: selC.city || '—', type: selC.type, source: selC.source, email: selC.email || '—', phone: selC.phone || '—', consent: selC.consent === 'oui' ? 'oui' : selC.consent === 'non' ? 'non' : 'à vérifier', tags: (selC.tags || []).map((t) => ({ t })), notes: (selC.notes.length ? selC.notes : [{ when: '', by: '', text: 'Aucune note.' }]).slice(-5).reverse() } : { name: '', org: '', city: '', type: '', source: '', email: '', phone: '', consent: '', tags: [], notes: [] },
      noteDraft: s.crmNote || '', onNote: (e) => this.setState({ crmNote: e.target.value }),
      addNote: () => { if (!selC || !(s.crmNote || '').trim()) return; updC({ contacts: this.crmData().contacts.map((c) => c.id === selC.id ? Object.assign({}, c, { last: tIso, notes: c.notes.concat([{ when: tIso, by: 'Vous', text: s.crmNote.trim() }]) }) : c) }); this.setState({ crmNote: '' }); },
      selTask: () => { if (!selC) return; updC({ tasks: [{ id: 't' + Date.now(), title: 'Contacter ' + selC.name, due: this.addDays(2), rel: selC.org || selC.source, owner: 'humain', done: false }].concat(this.crmData().tasks) }); this.say('Tâche créée'); },
      selDeal: () => { if (!selC) return; updC({ deals: this.crmData().deals.concat([{ id: 'd' + Date.now(), title: 'Nouvelle opportunité', org: selC.org || selC.name, contactId: selC.id, amount: 0, stage: 'Nouveau', last: tIso, next: 'Qualifier le besoin' }]) }); this.setState({ crmTab: 'pipe' }); },
      selErase: () => { if (!selC) return; const C2 = this.crmData(); updC({ contacts: C2.contacts.filter((c) => c.id !== selC.id), deals: C2.deals.filter((d) => d.contactId !== selC.id) }); this.setState({ crmSel: null }); this.say('Contact et données associées supprimés'); },
      columns: STAGES.map((st, si) => { const ds = CR.deals.filter((d) => d.stage === st); return { label: st, count: String(ds.length), total: eurK(ds.reduce((a, d) => a + d.amount, 0)),
        deals: ds.map((d) => ({ title: d.title, org: d.org, amount: d.amount ? eurK(d.amount) : 'à chiffrer', next: d.next, color: STC[st], age: ago(d.last),
          back: () => si > 0 && updC({ deals: this.crmData().deals.map((x) => x.id === d.id ? Object.assign({}, x, { stage: STAGES[si - 1], last: tIso }) : x) }),
          fwd: () => si < STAGES.length - 1 && updC({ deals: this.crmData().deals.map((x) => x.id === d.id ? Object.assign({}, x, { stage: STAGES[si + 1], last: tIso }) : x) }) })) }; }),
      dTitle: s.crmDTitle || '', dOrg: s.crmDOrg || '', dAmount: s.crmDAmount || '',
      onDTitle: (e) => this.setState({ crmDTitle: e.target.value }), onDOrg: (e) => this.setState({ crmDOrg: e.target.value }), onDAmount: (e) => this.setState({ crmDAmount: e.target.value }),
      addDeal: () => { if (!(s.crmDTitle || '').trim()) { this.say('Titre requis'); return; } updC({ deals: this.crmData().deals.concat([{ id: 'd' + Date.now(), title: s.crmDTitle.trim(), org: (s.crmDOrg || '').trim() || '—', contactId: null, amount: Math.max(0, +s.crmDAmount || 0), stage: 'Nouveau', last: tIso, next: 'Qualifier le besoin' }]) }); this.setState({ crmDTitle: '', crmDOrg: '', crmDAmount: '' }); },
      ownerChips: ['Tous', 'Vous', 'Agents'].map((x) => Object.assign(pill(x === ownerF), { label: x, pick: () => this.setState({ crmOwner: x }) })),
      taskGroups: [['En retard', 'var(--danger)', (k) => !k.done && k.due < tIso], ['À faire', 'var(--ink)', (k) => !k.done && k.due >= tIso], ['Terminées', 'var(--muted)', (k) => k.done]]
        .map(([label, color, f]) => { const it = tasksF.filter(f).sort((a, b) => (a.due < b.due ? -1 : 1)); return { label, color, count: String(it.length), items: it.slice(0, 12).map(tkV) }; }),
      tTitle: s.crmTTitle || '', tDue: s.crmTDue || this.addDays(1), onTTitle: (e) => this.setState({ crmTTitle: e.target.value }), onTDue: (e) => this.setState({ crmTDue: e.target.value }),
      addTask: () => { if (!(s.crmTTitle || '').trim()) return; updC({ tasks: [{ id: 't' + Date.now(), title: s.crmTTitle.trim(), due: s.crmTDue || this.addDays(1), rel: '—', owner: 'humain', done: false }].concat(this.crmData().tasks) }); this.setState({ crmTTitle: '' }); },
      agents: Object.keys(AGD).map((id) => { const A = CR.agents[id]; return { name: AGD[id][0], desc: AGD[id][1], on: A.on, status: A.on ? (A.mode === 'auto' ? 'Actif · autonome' : 'Actif · avec validation') : 'En pause', stColor: A.on ? 'var(--success)' : 'var(--muted)', filter: A.on ? 'none' : 'grayscale(1) opacity(.6)',
        runs: String(A.runs), actions: String(A.actions), last: A.last ? A.last.slice(0, 5) : '—',
        toggle: () => { const C2 = JSON.parse(JSON.stringify(this.crmData())); C2.agents[id].on = !A.on; this.saveCrm(C2); },
        modes: [['suggest', 'Validation'], ['auto', 'Autonome']].map(([m, label]) => ({ label, pressed: A.mode === m ? 'true' : 'false', bg: A.mode === m ? 'var(--inv-bg)' : 'var(--surface)', fg: A.mode === m ? 'var(--on-inv)' : 'var(--text)', border: A.mode === m ? 'var(--inv-bg)' : 'var(--line-2)', pick: () => { const C2 = JSON.parse(JSON.stringify(this.crmData())); C2.agents[id].mode = m; this.saveCrm(C2); } })),
        run: () => { this.runAgent(id); this.say(AGD[id][0] + ' lancé'); } }; })
    };
    // ---------- application & immersion ----------
    const appUrl = (typeof window !== 'undefined' && window.CASA_APP_URL) || 'https://claude.ai/artifact/3Z1QbNeNwNDmCizUsTPHJ6';
    const inApp = typeof window !== 'undefined' && !!window.CASA_APP;
    const arModes = [['lineup', 'Réalité augmentée', 'Ma compo en AR', 'Neuf disciplines, votre équipe sur le vrai terrain, à son vrai emplacement (photos aériennes, bâtiments, soleil réel), avec le ballon et le règlement. Posez-le sur votre table et proposez la compo au Club House.']].map(([id, tag, title, text]) => ({ tag, title, text, open: () => this.openAR(id) }));
    const PWA = typeof window !== 'undefined' && window.CasaPWA;
    const pwaIn = !!(PWA && PWA.installee());
    const installLabel = pwaIn ? 'Application installée' : 'Installer l’application';
    const installApp = () => {
      if (!PWA) { this.say('Ouvrez le site dans Chrome (Android) ou Safari (iPhone) pour installer l’application.'); return; }
      PWA.install().then((r) => {
        if (r === 'deja') this.say('Vous êtes dans l’application.');
        else if (r === 'ok') this.say('Application installée sur votre écran d’accueil');
        else if (r === 'ios') this.say('Sur iPhone : touchez le bouton Partager de Safari, puis « Sur l’écran d’accueil ».');
        else if (r === 'manuel') this.say('Menu du navigateur → « Installer l’application » ou « Ajouter à l’écran d’accueil ».');
      });
    };
    const installSteps = [['Sur Android', 'Ouvrez l’application dans Chrome, puis touchez « Installer l’application » (ou menu ⋮ → « Ajouter à l’écran d’accueil »).'],
      ['Sur iPhone', 'Ouvrez l’application dans Safari, touchez le bouton Partager puis « Sur l’écran d’accueil ».'],
      ['Sur ordinateur', 'Dans Chrome ou Edge, cliquez sur l’icône d’installation dans la barre d’adresse.']].map(([title, text]) => ({ title, text }));
    // ---------- barre d'onglets mobile ----------
    const TAB_ICONS = { clubhouse: 'M3 21V10l9-6 9 6v11 M9 21v-6h6v6 M7 11h.01 M17 11h.01', home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z', live: 'M4 20V10M10 20V4M16 20v-7M22 20H2', news: 'M5 4h12v16H5z M17 8h2v10a2 2 0 0 1-2 2 M8 8h6 M8 12h6 M8 16h4', meteo: 'M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z', private: 'M4 5h16v15H4z M4 9h16 M8 3v4 M16 3v4 M8 13h3 M8 16h6' };
    const tabBar = [['home', 'Accueil'], ['live', 'Terrain'], ['news', 'Actus'], ['clubhouse', 'Club'], ['private', 'Quotidien']].map(([id, label]) => { const on = activeSec === id || (id === 'home' && s.view === 'home'); return { label, ico: TAB_ICONS[id], sym: id === 'home', pic: id !== 'home', color: on ? 'var(--ink)' : 'var(--muted)', bar: on ? 'var(--acc)' : 'transparent', cur: on ? 'page' : 'false', go: () => this.go(id) }; });
    const V = s.view;
    const n = newsArticles.length;
    // ---------- réseau local (carte, commerces, espace club, administration) et profil membre (photo, CV, certification) ----------
    const rsCtx = { D, V, me, isAdmin, staffRole: s.role ? staffRole : '', role: s.role, posts, clubRoleId: s.role === 'club' ? s.clubRoleId : '', canReseau, clubId: s.clubId,
      setPost: (id, patch, line) => this.setPost(id, patch, line), blocksOf: (b) => this.blocksOf(b), go: (v, x) => this.go(v, x) };
    const CVV = typeof CasaCV !== 'undefined' ? CasaCV.vals(this, rsCtx) : { prof: {}, cv: {}, verif: {}, adm: {}, avatar: '' };
    rsCtx.cvPending = typeof CasaCV !== 'undefined' && canReseau && s.studioTab === 'reseau' ? CasaCV.pending(this) : 0;
    if (s.view === 'map') this.chargeCarte();
    const RS = typeof CasaReseau !== 'undefined' ? CasaReseau.vals(this, rsCtx) : { carte: {}, com: {}, club: {}, adm: {}, fiche: { has: false, lignes: [] } };
    return {
      mb: { q: s.mbQ || '', onQ: (e) => this.setState({ mbQ: e.target.value, mbRes: null }), check: () => this.checkMember(s.mbQ), busy: s.mbRes === 'busy',
        ok: s.mbRes === 'ok', off: s.mbRes === 'off', none: s.mbRes === 'none', bad: s.mbRes === 'bad', format: s.mbRes === 'format',
        prenom: (s.mbInfo && s.mbInfo.prenom) || 'Membre', depuis: s.mbInfo && s.mbInfo.depuis ? 'Membre depuis ' + new Date(s.mbInfo.depuis).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '' },
      rs: RS, cvv: CVV, isCv: V === 'cv', isVerifier: V === 'verifier', goCv: () => this.go('cv'), goVerifier: () => this.go('verifier', { verifId: '' }),
      hasAvatar: !!CVV.avatar, avatar: CVV.avatar, showInitial: s.loggedIn && !CVV.avatar,
      isClubRole, notClubRole: !isClubRole, canReseau, stReseau: s.studioTab === 'reseau' && canReseau, stClubAny: isClubRole && ['club', 'clist', 'fiche', 'charte', 'cedit'].indexOf(s.studioTab) >= 0,
      newPostLabel: isClubRole ? 'Nouveau contenu' : 'Nouvel article',
      accent, heroOpacity: showBg ? Math.min(1, k * 2.2) : 0, sectionOpacity: showBg ? k * 0.45 : 0, progressW: progress + '%',
      nav, moreNav, menuGroups, rubriques, menuOpen: s.menuOpen, toggleMenu: () => this.setState({ menuOpen: !s.menuOpen }),
      moreOpen: s.moreOpen, moreExp: s.moreOpen ? 'true' : 'false', toggleMore: () => this.setState({ moreOpen: !s.moreOpen }),
      gateways,
      isHome: V === 'home', isNews: V === 'news', isArticle: V === 'article', isVideos: V === 'videos', isVideo: V === 'video',
      isDisciplines: V === 'disciplines', isDiscipline: V === 'discipline', isClubs: V === 'clubs', isClub: V === 'club',
      isPlayers: V === 'players', isPlayer: V === 'player', isMap: V === 'map', isOffers: V === 'offers', isCheckout: V === 'checkout',
      isPartners: V === 'partners', isAbout: V === 'about', isWork: V === 'work', work: workVals, cherwood, isContact: V === 'contact', isAccount: V === 'account',
      isLive: V === 'live', isShop: V === 'shop', isProduct: V === 'product', isOrder: V === 'order',
      showCrumbs: V !== 'home', crumbs, back: () => this.back(),
      goHome: () => this.go('home'), goNews: () => this.go('news'), goVideos: () => this.go('videos'), goClubs: () => this.go('clubs'),
      goPlayers: () => this.go('players'), goMap: () => this.go('map'), goOffers: () => this.go('offers'), goPartners: () => this.go('partners'),
      goLive: () => this.go('live'), goShop: () => this.go('shop'), goGazette: () => this.go('offers', { offerTab: 'La Gazette' }),
      goContact: () => this.go('contact', { contactSent: false }), goWork: () => this.go('work'), goAccount: () => (s.loggedIn ? this.go('account') : this.setState({ loginOpen: true, linkSent: false })),
      goCheckout: () => this.go('checkout', { subPlan: 'casab', step: 1 }),
      openFeatured: () => this.go('article', { articleId: 'pointe-hague' }),
      openESPH: () => this.go('club', { clubId: 'esph', clubTab: 'matchs' }), openAvranches: () => this.go('club', { clubId: 'us-avranches', clubTab: 'matchs' }),
      rdv, openCupMatch: () => rdv.open(),
      toggleRemind: () => { this.toggleIn('reminders', 'm-cfa-avranches', 'Rappel activé : on vous prévient avant le coup d’envoi', 'Rappel retiré'); },
      remindLabel: s.reminders.indexOf('m-cfa-avranches') >= 0 ? 'Rappel activé ✓' : 'Me le rappeler', remindBg: s.reminders.indexOf('m-cfa-avranches') >= 0 ? 'var(--inv-bg)' : 'var(--surface)', remindFg: s.reminders.indexOf('m-cfa-avranches') >= 0 ? 'var(--on-inv)' : 'var(--ink)',
      hasFeed: feed.length > 0, feed,
      homeArticles: homeOrder.slice(0, 3), homeProducts, videos, cityDots,
      q: s.q, onQ: (e) => this.setState({ q: e.target.value }), chips, newsArticles, newsEmpty: n === 0, countLabel: n + (n > 1 ? ' articles' : ' article'),
      resetNews: () => this.setState({ q: '', cat: 'Tous', premiumOnly: false, savedOnly: false }),
      togglePremiumOnly: () => this.setState({ premiumOnly: !s.premiumOnly }), premiumPressed: s.premiumOnly ? 'true' : 'false', premBg: s.premiumOnly ? 'var(--inv-bg)' : 'var(--surface)', premFg: s.premiumOnly ? 'var(--on-inv)' : 'var(--ink)',
      toggleSavedOnly: () => this.setState({ savedOnly: !s.savedOnly }), savedPressed: s.savedOnly ? 'true' : 'false', savBg: s.savedOnly ? 'var(--inv-bg)' : 'var(--surface)', savFg: s.savedOnly ? 'var(--on-inv)' : 'var(--ink)', savedCount: String(s.saved.length),
      proposeTopic: () => this.go('contact', { subject: 'Proposition de sujet', profile: 'Autre', contactSent: false }),
      proposePlayer: () => this.go('contact', { subject: 'Faire briller un talent', profile: 'Joueur', contactSent: false }),
      submitResult: () => this.go('contact', { subject: 'Transmettre un résultat — ' + s.dSport, profile: 'Club', contactSent: false }),
      orderRecap: () => this.go('contact', { subject: 'Devis résumé de match (290 €)' + (s.view === 'club' ? ' — ' + curC.name : ''), profile: 'Club', contactSent: false }),
      art: artObj, gzSide, related, locked, unlocked: !locked, fontSize: fontSizes[s.fontStep],
      fontUp: () => this.setState({ fontStep: Math.min(3, s.fontStep + 1) }), fontDown: () => this.setState({ fontStep: Math.max(0, s.fontStep - 1) }),
      toggleSummary: () => this.setState({ summary: !s.summary }), summaryOpen: s.summary, summaryPressed: s.summary ? 'true' : 'false', sumBg: s.summary ? 'var(--inv-bg)' : 'var(--surface)', sumFg: s.summary ? 'var(--on-inv)' : 'var(--ink)',
      toggleListen: () => this.ecouter(curA, locked), listening: s.listening, voixPct: s.voixPct || '0%', listenPressed: s.listening ? 'true' : 'false', lisBg: s.listening ? 'var(--inv-bg)' : 'var(--surface)', lisFg: s.listening ? 'var(--on-inv)' : 'var(--ink)', listenLabel: s.listening ? 'En écoute' : 'Écouter',
      reactions,
      share: () => {
        // Partage de la page affichée, avec son adresse lisible (/actualites/…)
        const url = cbUrlOf(s); const title = document.title;
        if (navigator.share) { navigator.share({ title, url }).catch(() => {}); return; }
        try { navigator.clipboard.writeText(url).then(() => this.say('Lien copié'), () => this.say(url)); } catch (e) { this.say(url); }
      },
      vid: curV, otherVideos: videos.filter((v) => v.id !== curV.id), playing: s.playing, notPlaying: !s.playing, togglePlay: () => this.setState({ playing: !s.playing }),
      playLabel: s.playing ? 'Pause' : 'Lire la vidéo', playState: s.playing ? 'Lecture en cours' : 'Prêt à lire', vidDim: s.playing ? 0.9 : 0.75,
      disciplines, disc, clubChips, clubList, club, clubTabs, tabArticles: s.clubTab === 'articles', tabPlayers: s.clubTab === 'players', tabInfos: s.clubTab === 'infos', tabMatches: s.clubTab === 'matchs',
      roleChips, playerList, pl, cityName: s.city, cityClubs,
      // terrain
      dSports, dComps, hasComps: dComps.length > 0, dZones, hasZones: dZones.length > 0, dNivs, hasNivs: dNivs.length > 0, dSportName: s.dSport, dTabs, sportEmpty: !sportHasData, sportHasData,
      isDemo: sportHasData, srcLabel: (spMaj ? 'Données officielles' + (spAuto.source ? ' (' + spAuto.source.replace(/\s*\(.*\)$/, '') + ')' : '') + ' · mise à jour ' + new Date(spMaj).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : 'Résultats vérifiés par la rédaction'), srcColor: 'var(--gold-text)', updatedAgo: spMaj ? new Date(spMaj).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
      ptsRule: ({ Handball: 'Victoire 3 pts · nul 2 pts · défaite 1 pt (barème de la FFHandball, pénalités déduites).', Basketball: 'Victoire 2 pts · défaite 1 pt.', Rugby: 'Victoire 4 pts · nul 2 pts · défaite 0 pt, plus les points de bonus.', 'Volley-ball': 'Points selon le score en sets (barème FFVolley).' })[s.dSport] || 'Victoire 3 pts · nul 1 pt · défaite 0 pt.',
      tabLive: s.dTab === 'live', tabResults: s.dTab === 'results', tabAgenda: s.dTab === 'agenda', tabCal: s.dTab === 'cal', tabTable: s.dTab === 'table', tabPronos: s.dTab === 'pronos',
      liveCards, noLive: liveM.length === 0, resultRows, noResults: resultRows.length === 0, agendaRows, noAgenda: agendaRows.length === 0,
      hasTable: !!tbl, noTable: !tbl, tableRows,
      calHead: ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((l) => ({ l })), calCells, calTitle: MONTHS_L[month] + ' ' + year,
      calPrev: () => this.setState({ calMonth: Math.max(8, month - 1), calDay: 1 }), calNext: () => this.setState({ calMonth: Math.min(11, month + 1), calDay: 1 }),
      calDayLabel: s.calDay + ' ' + MONTHS_L[month].toLowerCase(), calDayMatches, calDayEmpty: calDayMatches.length === 0,
      pronoRows, pronoCount,
      matchOpen: !!mxRaw, mx, closeMatch: () => this.setState({ matchId: null }),
      // boutique
      shopPosters, shopPres, showTrailer, trailer, crea, creaBanner, maillots,
      introOn: !!s.introOn, skipIntro: () => { clearTimeout(this._introT); this.setState({ introOn: false }); },
      goShopVikings: () => this.go('shop', { shopLine: 'Collection Vikings' }),
      freeShip: FREE + ' €', shopLines, shopSort: s.shopSort, onShopSort: (e) => this.setState({ shopSort: e.target.value }), showCherwoodBanner: s.shopLine === 'Cherwood × Casa' || s.shopLine === 'Tout',
      shopProducts, prod, crossSell, sizeGuide: s.sizeGuide, toggleSizeGuide: () => this.setState({ sizeGuide: !s.sizeGuide }),
      persoName: s.persoName, persoNum: s.persoNum, onPersoName: (e) => this.setState({ persoName: e.target.value }), onPersoNum: (e) => this.setState({ persoNum: e.target.value.replace(/\D/g, '').slice(0, 2) }), persoPrice: '8 €',
      qty: String(s.qty), qtyUp: () => this.setState({ qty: s.qty + 1 }), qtyDown: () => this.setState({ qty: Math.max(1, s.qty - 1) }),
      lineTotal: eur((unit + persoFee) * s.qty), prodError: s.prodError,
      addToCart: () => {
        if (curPr.sizes && !s.size) { this.setState({ prodError: 'Choisissez une ' + (curPr.priceBySize ? 'valeur' : 'taille') + '.' }); return; }
        const perso = curPr.perso && s.persoName.trim() ? (s.persoName.toUpperCase() + (s.persoNum ? ' ' + s.persoNum : '')) : '';
        this.addLine(curPr, ci, s.size, s.qty, perso, unit + persoFee);
      },
      cartOpen: s.cartOpen, openCart: () => this.setState({ cartOpen: true, menuOpen: false }), closeCart: () => this.setState({ cartOpen: false }),
      cartLines, cartCount: String(cartCount), hasCart: cartCount > 0, cartEmpty: cartCount === 0, cartAria: 'Panier, ' + cartCount + ' article(s)',
      cartSub: eur(sub), hasDiscount: disc10 > 0, discount: eur(disc10), cartNet: eur(net),
      shipMsg: net >= FREE ? 'Livraison offerte ✓' : 'Plus que ' + eur(FREE - net) + ' pour la livraison offerte', shipPct: Math.min(100, Math.round(net / FREE * 100)) + '%',
      goOrder: () => this.go('order', { orderDone: false }), shipOpts, shipCost: shipPrice ? eur(shipPrice) : 'Offerte', needAddress: s.ship === 'home',
      giftWrap: s.giftWrap, toggleGift: () => this.setState({ giftWrap: !s.giftWrap }), orderTotal: eur(total), orderOpen: !s.orderDone, orderDone: s.orderDone, orderNo: s.orderNo,
      payBusy: !!s.payBusy, payLabel: s.payBusy ? 'Ouverture du paiement sécurisé…' : 'Payer ' + eur(total),
      orderNote: !s.orderPaid ? 'Le paiement en ligne ouvre très bientôt : l’équipe Casa Besports vous recontacte par e-mail pour régler votre commande.' : s.ship === 'cherwood' ? 'Votre commande vous attend chez Cherwood, à Cherbourg, sous 24 h.' : s.ship === 'stade' ? 'Retrait au stand Casa Besports lors du prochain grand match.' : 'Livraison prévue sous 2 à 4 jours ouvrés.',
      placeOrder: () => {
        if (!s.name.trim() || !validEmail || (s.ship === 'home' && !s.address.trim())) { this.setState({ formError: 'Nom, e-mail valide' + (s.ship === 'home' ? ' et adresse' : '') + ' requis.' }); return; }
        if (!s.cart.length) { this.setState({ formError: 'Votre panier est vide.' }); return; }
        if (s.payBusy) return;
        // Paiement en ligne (Stripe) : les prix sont recalculés côté serveur. Sinon (pas encore activé), la commande part à l'équipe.
        const lignes = s.cart.map((l) => { const p = X.products.find((x) => x.id === l.id); return { id: l.id, size: l.size, qty: l.qty, perso: l.perso || '', variant: p && p.colors[l.color] ? p.colors[l.color].name : '' }; });
        this.payOnline({ type: 'commande', lignes, livraison: s.ship, emballage: !!s.giftWrap, email: s.email.trim(), nom: s.name.trim() }, () => {
        const no = 'CB-' + String(Date.now()).slice(-6);
        this.crmCapture({ name: s.name.trim(), email: s.email, city: s.city || '', source: 'Boutique', type: 'Supporter', consent: '?', note: 'Commande ' + no + ' · ' + eur(total) });
        this.setState({ orderDone: true, orderNo: no, orderPaid: false, cart: [], formError: '', orders: s.orders.concat([{ label: 'Commande ' + no, detail: cartCount + ' article(s) · ' + eur(total), status: 'À régler' }]) });
        try { window.scrollTo(0, 0); } catch (e) {}
        });
      },
      // abonnements
      offerTabs, periods, offerCards, offerTabGazette: s.offerTab === 'La Gazette' || s.offerTab === 'Tout',
      subName: sp.name, subPrice: eur(priceOf(s.subPlan)) + ' ' + perLabel, subNote: period === 'an' ? '2 mois offerts · paiement annuel' : 'Sans engagement · résiliable à tout moment',
      subNeedsAddress, isGift: s.isGift, toggleIsGift: () => this.setState({ isGift: !s.isGift }),
      nameLabel: s.isGift ? 'Prénom du bénéficiaire' : 'Prénom', emailLabel: s.isGift ? 'E-mail du bénéficiaire' : 'E-mail',
      steps, step1: s.step === 1, step2: s.step === 2, step3: s.step === 3, step4: s.step === 4,
      nextStep: () => { if (s.subPending) this.setState({ subPending: false }); if (s.step === 2 && (!s.name.trim() || !validEmail || (sp.paper && !s.address.trim()))) { this.setState({ formError: 'Prénom, e-mail valide' + (sp.paper ? ' et adresse postale' : '') + ' requis.' }); return; } this.setState({ step: s.step + 1, formError: '' }); },
      prevStep: () => this.setState({ step: Math.max(1, s.step - 1), formError: '' }),
      confirmSub: () => {
        if (s.payBusy) return;
        this.payOnline({ type: 'abonnement', formule: s.subPlan, periode: period === 'an' ? 'an' : 'mois', cadeau: !!s.isGift, email: s.email.trim(), nom: s.name.trim(), adresse: sp.paper ? s.address.trim() : '' }, () => {
        // Paiement en ligne pas encore activé : la demande part à l'équipe, sans activer l'abonnement
        this.crmCapture({ name: s.name.trim(), email: s.email, source: 'Abonnement', type: s.isGift ? 'Supporter' : 'Abonné', consent: '?', note: sp.name + (s.isGift ? ' (cadeau)' : '') + ' · paiement à régler' });
        this.setState({ step: 4, subPending: true, orders: s.orders.concat([{ label: sp.name + (s.isGift ? ' (cadeau)' : ''), detail: eur(priceOf(s.subPlan)) + ' ' + perLabel, status: 'À régler' }]) });
        this.say('Demande d’abonnement envoyée');
        });
      },
      doneTitle: s.subPending ? 'Demande envoyée, merci ' + (s.name || '') : s.isGift ? 'Cadeau envoyé à ' + (s.name || 'votre proche') : 'Bienvenue, ' + (s.name || 'supporter'),
      doneText: s.subPending ? 'Le paiement en ligne ouvre très bientôt. L’équipe Casa Besports vous écrit à ' + (s.email || 'votre adresse') + ' pour régler ' + sp.name + ' ; l’abonnement sera activé dès le paiement reçu.' : s.isGift ? 'Un e-mail avec la carte cadeau vient de partir.' : sp.gazette ? (sp.paper ? 'Votre premier numéro papier part au prochain bouclage. La liseuse est déjà ouverte.' : 'Le dernier numéro est disponible dans la liseuse.') : 'Tous les contenus Premium sont débloqués.',
      doneCta: () => (s.subPending ? this.go('offers') : sp.gazette && !s.isGift ? this.setState({ readerOpen: true, page: 0 }) : this.go('article', { articleId: 'pointe-hague' })), doneCtaLabel: s.subPending ? 'Revenir aux abonnements' : sp.gazette && !s.isGift ? 'Ouvrir la Gazette' : 'Lire un article Premium',
      subPayLabel: s.payBusy ? 'Ouverture du paiement sécurisé…' : 'Payer ' + eur(priceOf(s.subPlan)) + ' ' + perLabel, payError: s.step === 3 ? s.formError : '',
      cancelLabel: s.paidSubs ? 'Gérer ou résilier' : 'Résilier',
      // Abonnement payé en ligne : espace client Stripe (carte, factures, résiliation)
      cancelSub: () => {
        if (s.paidSubs && window.CasaPaiement) { window.CasaPaiement.portail().catch((e) => this.say(e.message)); return; }
        this.setState({ subs: { casab: false, gazette: null } }); this.say('Abonnements résiliés');
      },
      // liseuse
      readerOpen: s.readerOpen, openReader: () => this.setState({ readerOpen: true, page: 0, menuOpen: false }), closeReader: () => this.setState({ readerOpen: false }),
      pageNo: String(pIdx + 1), pageTotal: String(NP), pg, tocSecs, gzStrip, thumbs, quiz, gzOlisto: () => this.go('olisto'), adPartners: partners.filter((p) => !p.real), quizScore, quizTotal: String(G.quiz.length),
      pagePrev: () => this.gzGo(pIdx - 1), pageNext: () => this.gzGo(pIdx + 1), noPrev: pIdx === 0, noNext: pIdx >= NP - 1,
      prevLabel: pIdx > 0 ? 'Page précédente : ' + G.pages[pIdx - 1].title : 'Première page', nextLabel: pIdx < NP - 1 ? 'Page suivante : ' + G.pages[pIdx + 1].title : 'Dernière page',
      gotoToc: () => this.gzGo(G.idx('toc')), gotoChoc: () => this.gzGo(chocI), chocPage: chocP ? chocP.n : 0, hasChoc: G.pages.some((p) => p.kind === 'choc'),
      gzCover: (() => { const N = window.CASA_GAZETTE_NUMERO || {}; return { numero: 'N°' + (N.numero || '1'), date: N.date || '', mention: N.mention || '', surtitre: N.surtitre || '', titre: N.titre || 'La Gazette du Cotentin', accroche: N.accroche || '', image: N.image || 'assets/gz_cover.jpg', legende: N.legende || '', hasLegende: !!N.legende, numDate: 'N°' + (N.numero || '1') + (N.date ? ' · ' + N.date : '') }; })(), gzProg: Math.round((pIdx + 1) / NP * 100) + '%', gzCanEdit: s.role === 'admin' && !window.CASA_APERCU, gzEdit: () => { this.setState({ readerOpen: false }); if (window.CasaAdmin && window.CasaAdmin.editGazette) window.CasaAdmin.editGazette(pIdx); }, gzVote, gzCount: String(NP),
      readerSize: readerSizes[s.readerFont], readerFontLabel: ['A', 'A+', 'A++'][s.readerFont], readerFont: () => this.setState({ readerFont: (s.readerFont + 1) % 3 }),
      goGazetteFromReader: () => this.go('offers', { offerTab: 'La Gazette' }),
      // formulaires
      name: s.name, email: s.email, address: s.address, subject: s.subject, profile: s.profile, message: s.message, formError: s.formError,
      onName: (e) => this.setState({ name: e.target.value }), onEmail: (e) => this.setState({ email: e.target.value }), onAddress: (e) => this.setState({ address: e.target.value }), onSubject: (e) => this.setState({ subject: e.target.value }),
      onProfile: (e) => this.setState({ profile: e.target.value }), onMessage: (e) => this.setState({ message: e.target.value }),
      contactOpen: !s.contactSent, contactSent: s.contactSent,
      sendContact: () => { if (!s.name.trim() || !validEmail || !s.message.trim()) { this.setState({ formError: 'Nom, e-mail valide et message sont requis.' }); return; } this.setState({ contactSent: true, formError: '' }); this.crmCapture({ name: s.name.trim(), email: s.email, source: /olisto/i.test(s.subject || '') ? 'Formulaire OlistO' : 'Formulaire contact', type: ({ Club: 'Club', Annonceur: 'Annonceur', Partenaire: 'Partenaire' })[s.profile] || 'Supporter', consent: '?', subject: s.subject, profile: s.profile, message: s.message.trim(), note: (s.subject ? s.subject + ' — ' : '') + s.message.trim().slice(0, 200) }); },
      newMessage: () => this.setState({ contactSent: false, message: '', subject: '' }),
      goals, partnerContact: () => this.go('contact', { subject: 'Partenariat — ' + s.goal, profile: 'Entreprise', contactSent: false }),
      nlOpen: !s.nlDone, nlDone: s.nlDone, nlEmail: s.nlEmail, onNl: (e) => this.setState({ nlEmail: e.target.value }),
      subscribeNl: () => { if (/.+@.+\..+/.test(s.nlEmail)) { this.setState({ nlDone: true }); this.crmCapture({ email: s.nlEmail, name: s.nlEmail.split('@')[0], source: 'Newsletter', consent: 'oui', note: 'Inscription au récap du lundi' }); } else this.say('Saisissez un e-mail valide'); },
      // compte
      loggedIn: s.loggedIn, loggedOut: !s.loggedIn, initial: (s.name || s.email || 'C')[0].toUpperCase(),
      accountLabel: s.loggedIn ? 'Mon espace' : 'Connexion', accountBg: s.loggedIn ? 'var(--inv-bg)' : 'var(--surface)', accountFg: s.loggedIn ? 'var(--on-inv)' : 'var(--text)',
      accountClick: () => (s.loggedIn ? this.go('account') : this.setState({ loginOpen: true, linkSent: false, formError: '' })),
      subscribed, notSubscribed: !subscribed, subStatus,
      displayName: s.name || s.email.split('@')[0] || 'supporter',
      alerts, followList, noFollows: followList.length === 0, savedArticles, noSaved: savedArticles.length === 0,
      orders: s.orders, noOrders: s.orders.length === 0,
      logout: () => { if (window.CasaAuth && window.CasaAuth.on) window.CasaAuth.signOut().catch(() => {}); this.setState({ loggedIn: false, role: null, subs: { casab: false, gazette: null } }); this.go('home'); this.say('Vous êtes déconnecté'); },
      loginOpen: s.loginOpen, openLogin: () => this.setState({ loginOpen: true, linkSent: false, formError: '', loginMode: 'password', resetSent: false }), closeLogin: () => this.setState({ loginOpen: false }),
      linkSent: s.linkSent, linkNotSent: !s.linkSent,
      sendLink: () => {
        if (!validEmail) { this.setState({ formError: 'Saisissez un e-mail valide.' }); return; }
        if (!authLive) { this.setState({ linkSent: true, formError: '' }); return; }
        this.setState({ authBusy: true, formError: '' });
        window.CasaAuth.sendEmail(s.email.trim().toLowerCase(), s.name.trim()).then(() => this.setState({ authBusy: false, linkSent: true }), (e) => this.setState({ authBusy: false, formError: e.message }));
      },
      authLive, authDemo: !authLive, authBusy: s.authBusy,
      loginByEmail: s.loginMode === 'email', loginByPhone: s.loginMode === 'phone',
      loginByEmailAria: s.loginMode === 'email' ? 'true' : 'false', loginByPhoneAria: s.loginMode === 'phone' ? 'true' : 'false',
      loginEmailCls: s.loginMode === 'email' ? 'btn btn-dark' : 'btn btn-ghost', loginPhoneCls: s.loginMode === 'phone' ? 'btn btn-dark' : 'btn btn-ghost',
      setLoginEmail: () => this.setState({ loginMode: 'email', formError: '' }), setLoginPhone: () => this.setState({ loginMode: 'phone', formError: '' }),
      // ----- mot de passe -----
      loginByPw: s.loginMode === 'password', loginBySignup: s.loginMode === 'email' || s.loginMode === 'phone', loginByReset: s.loginMode === 'reset',
      loginNotReset: s.loginMode !== 'reset',
      loginPwCls: s.loginMode === 'password' || s.loginMode === 'reset' ? 'btn btn-dark' : 'btn btn-ghost', loginNewCls: s.loginMode === 'email' || s.loginMode === 'phone' ? 'btn btn-dark' : 'btn btn-ghost',
      loginPwAria: s.loginMode === 'password' ? 'true' : 'false', loginNewAria: s.loginMode === 'email' || s.loginMode === 'phone' ? 'true' : 'false',
      setLoginPw: () => this.setState({ loginMode: 'password', formError: '', resetSent: false }), setLoginNew: () => this.setState({ loginMode: 'email', formError: '' }),
      setLoginReset: () => this.setState({ loginMode: 'reset', formError: '', resetSent: false, email: s.email || (/@/.test(s.loginId) ? s.loginId : '') }),
      loginId: s.loginId, onLoginId: (e) => this.setState({ loginId: e.target.value }), pw: s.pw, onPw: (e) => this.setState({ pw: e.target.value }), pwType: s.pwShow ? 'text' : 'password', pwEye: s.pwShow ? 'Masquer' : 'Voir', pwEyeAria: s.pwShow ? 'Masquer le mot de passe' : 'Afficher le mot de passe', pwShown: s.pwShow ? 'true' : 'false', togglePwShow: (e) => { if (e && e.preventDefault) e.preventDefault(); this.setState({ pwShow: !s.pwShow }); }, pw2: s.pw2, onPw2: (e) => this.setState({ pw2: e.target.value }),
      pwLoginLabel: s.authBusy ? 'Connexion…' : 'Se connecter',
      pwLogin: () => {
        if (!s.loginId.trim() || !s.pw) { this.setState({ formError: 'Saisissez votre identifiant et votre mot de passe.' }); return; }
        if (!authLive) { this.setState({ loggedIn: true, loginOpen: false }); return; }
        this.setState({ authBusy: true, formError: '' });
        window.CasaAuth.signInPassword(s.loginId, s.pw).then(() => this.setState({ authBusy: false, pw: '' }), (e) => this.setState({ authBusy: false, formError: e.message }));
      },
      resetSent: s.resetSent, resetNotSent: !s.resetSent, resetLabel: s.authBusy ? 'Envoi…' : 'Recevoir le lien de réinitialisation',
      sendReset: () => {
        if (!validEmail) { this.setState({ formError: 'Saisissez l’e-mail de votre compte.' }); return; }
        if (!authLive) { this.setState({ resetSent: true }); return; }
        this.setState({ authBusy: true, formError: '' });
        window.CasaAuth.resetPassword(s.email).then(() => this.setState({ authBusy: false, resetSent: true }), (e) => this.setState({ authBusy: false, formError: e.message }));
      },
      pwOpen: s.pwOpen && s.loggedIn, hasPassword: s.hasPassword, pwTitle: s.hasPassword && !(window.CasaAuth && window.CasaAuth.recovery) ? 'Changer mon mot de passe' : 'Choisissez votre mot de passe',
      pwBtnLabel: s.hasPassword ? 'Changer mon mot de passe' : 'Créer mon mot de passe', pwDone: s.pwDone, pwNotDone: !s.pwDone, pwSaveLabel: s.authBusy ? 'Enregistrement…' : 'Enregistrer le mot de passe',
      openPw: () => this.setState({ pwOpen: true, pw: '', pw2: '', pwDone: false, formError: '' }),
      closePw: () => { const u = window.CasaAuth && window.CasaAuth.user; if (u && !s.hasPassword) this.writeLS('cb-pw-later-' + u.id, true); if (window.CasaAuth) window.CasaAuth.recovery = false; this.setState({ pwOpen: false, formError: '' }); },
      savePw: () => {
        if (String(s.pw).length < 8) { this.setState({ formError: 'Le mot de passe doit contenir au moins 8 caractères.' }); return; }
        if (s.pw !== s.pw2) { this.setState({ formError: 'Les deux mots de passe ne sont pas identiques.' }); return; }
        if (!authLive) { this.setState({ pwDone: true, hasPassword: true }); return; }
        this.setState({ authBusy: true, formError: '' });
        window.CasaAuth.setPassword(s.pw).then(() => { window.CasaAuth.recovery = false; this.setState({ authBusy: false, pwDone: true, hasPassword: true, pw: '', pw2: '' }); }, (e) => this.setState({ authBusy: false, formError: e.message }));
      },
      phone: s.phone, onPhone: (e) => this.setState({ phone: e.target.value }), smsCode: s.smsCode, onSmsCode: (e) => this.setState({ smsCode: e.target.value }),
      codeSent: s.codeSent, codeNotSent: !s.codeSent,
      sendLinkLabel: s.authBusy ? 'Envoi…' : 'Recevoir mon lien', sendSmsLabel: s.authBusy ? 'Envoi…' : 'Recevoir un code par SMS', verifyLabel: s.authBusy ? 'Vérification…' : 'Valider le code',
      sendSms: () => {
        const ph = window.CasaAuth ? window.CasaAuth.phone(s.phone) : '';
        if (!ph) { this.setState({ formError: 'Saisissez un numéro de mobile valide (ex. 06 12 34 56 78).' }); return; }
        if (!authLive) { this.setState({ phone: ph, codeSent: true, formError: '' }); return; }
        this.setState({ authBusy: true, formError: '', phone: ph });
        window.CasaAuth.sendSms(ph, s.name.trim()).then(() => this.setState({ authBusy: false, codeSent: true }), (e) => this.setState({ authBusy: false, formError: e.message }));
      },
      verifySms: () => {
        const code = String(s.smsCode || '').replace(/\s/g, '');
        if (!/^\d{6,8}$/.test(code)) { this.setState({ formError: 'Saisissez le code reçu par SMS.' }); return; }
        if (!authLive) { this.setState({ loggedIn: true, loginOpen: false, codeSent: false, smsCode: '' }); this.applyProfileTheme(s.phone); this.say('Connecté. Bienvenue !'); return; }
        this.setState({ authBusy: true, formError: '' });
        window.CasaAuth.verifySms(s.phone, code).then(() => this.setState({ authBusy: false }), (e) => this.setState({ authBusy: false, formError: e.message }));
      },
      resetSms: () => this.setState({ codeSent: false, smsCode: '', formError: '' }),
      doLogin: () => { this.setState({ loggedIn: true, loginOpen: false }); this.applyProfileTheme(s.email.trim().toLowerCase() || 'compte'); this.say('Connecté. Bienvenue !'); },
      searchOpen: s.searchOpen, openSearch: () => this.setState({ searchOpen: true, sq: '', menuOpen: false, moreOpen: false }), closeSearch: () => this.setState({ searchOpen: false }),
      sq: s.sq, onSq: (e) => this.setState({ sq: e.target.value }), noSq: !sq, sResults, sEmpty: !!sq && sResults.length === 0, quick,
      footLinks, reseaux, hasToast: !!s.toast, toast: s.toast,
      themeAttr: curTheme, themingClass: s.themeAnim ? 'cb-theming' : '', themes, themeName, themeMenuOpen: s.themeMenuOpen, themeMenuExp: s.themeMenuOpen ? 'true' : 'false',
      toggleThemeMenu: () => this.setState({ themeMenuOpen: !s.themeMenuOpen, moreOpen: false }),
      openThemeFromFooter: () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} this.setState({ themeMenuOpen: true, hdrY: '0' }); },
      themeStatus: curTheme === 'auto' ? 'Automatique (actuellement ' + (s.sysDark ? 'sombre' : 'clair') + ')' : themeName,
      themeIconSun: curTheme === 'light', themeIconMoon: curTheme === 'dark' || curTheme === 'noir', themeIconPaper: curTheme === 'paper', themeIconAuto: curTheme === 'auto',
      themeSavedNote: s.loggedIn ? 'Enregistré sur cet appareil et dans votre profil.' : 'Enregistré sur cet appareil. Connectez-vous pour le retrouver partout.',
      weather, showWeather: s.dSport === 'Football' || s.dSport === 'Rugby' || s.dSport === 'Trail',
      about: (() => {
        let A = window.CASA_APROPOS || {}; const en = window.CasaLang && window.CasaLang.lang === 'en';
        // Une ancienne version enregistrée en ligne (sans chronologie « etapes ») ne doit pas masquer l'histoire du fichier
        if (!(A.etapes && A.etapes.length) && window.CasaAuth && CasaAuth.originalContent) { const O = CasaAuth.originalContent('CASA_APROPOS'); if (O && O.etapes && O.etapes.length) A = O; }
        const has = (v) => Array.isArray(v) ? v.length > 0 : !!v;
        const pick = (k) => (en && has(A[k + 'En'])) ? A[k + 'En'] : A[k];
        const arr = (k) => (pick(k) || []).filter(Boolean).map((t) => ({ t }));
        // Chronologie : nouvelle forme (etapes) ou ancienne forme (dates) si une version en ligne l'utilise encore
        const etEn = en ? (A.etapesEn || []) : [];
        let etapes = (A.etapes || []).filter((e) => e && (e.annee || e.titre)).map((e, i) => {
          const x = etEn[i] || {};
          const ps = (x.paragraphes && x.paragraphes.length ? x.paragraphes : (e.paragraphes || (e.texte ? [e.texte] : []))).filter(Boolean);
          return { annee: x.annee || e.annee || '', titre: x.titre || e.titre || '', photo: e.photo || '', hasPhoto: !!e.photo, alt: x.alt || e.alt || '', paras: ps.map((t) => ({ t })), side: i % 2 ? 'ab-step ab-rev' : 'ab-step', num: String(i + 1).padStart(2, '0') };
        });
        if (!etapes.length) etapes = (A.dates || []).filter((d) => d && d.annee).map((d, i) => ({ annee: d.annee, titre: (en && d.titreEn) || d.titre || '', photo: '', hasPhoto: false, alt: '', paras: [{ t: (en && d.texteEn) || d.texte || '' }], side: i % 2 ? 'ab-step ab-rev' : 'ab-step', num: String(i + 1).padStart(2, '0') }));
        let manifeste = arr('manifeste'); if (!manifeste.length) manifeste = arr('paragraphes');
        const piliers = (pick('piliers') || []).filter((p) => p && p.titre).map((p, i) => ({ titre: p.titre, texte: p.texte || '', num: String(i + 1).padStart(2, '0') }));
        const appel = arr('appel');
        return {
          surtitre: pick('surtitre') || 'Notre histoire', titre: pick('titre') || 'Casa Besports', soustitre: pick('soustitre') || '', intro: pick('intro') || '', hasIntro: !!pick('intro'),
          photo: A.photo || 'assets/hero.jpg', photoAlt: pick('photoAlt') || '',
          manifeste, hasManifeste: manifeste.length > 0, citation: pick('citation') || '', hasQuote: !!pick('citation'), manifesteFin: pick('manifesteFin') || '', hasManifesteFin: !!pick('manifesteFin'),
          etapes, hasEtapes: etapes.length > 0, frise: en ? 'Our story, step by step' : 'Notre histoire, étape par étape',
          raisonSurtitre: pick('raisonSurtitre') || 'Notre raison d’être', raisonTitre: pick('raisonTitre') || '', piliers, hasPiliers: piliers.length > 0,
          signatureSurtitre: pick('signatureSurtitre') || '', signature: pick('signature') || '', signatureSuite: pick('signatureSuite') || '', hasSignature: !!pick('signature'),
          appelTitre: pick('appelTitre') || '', appel, appelFin: pick('appelFin') || '', hasAppel: !!pick('appelTitre') || appel.length > 0,
          decouvrir: () => { try { const el = document.getElementById('ab-histoire'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }
        };
      })(),
      langLabel: window.CasaLang && window.CasaLang.lang === 'en' ? 'FR' : 'EN', langAria: window.CasaLang && window.CasaLang.lang === 'en' ? 'Passer le site en français' : 'Switch the site to English', toggleLang: () => { if (window.CasaLang) window.CasaLang.toggle(); },
      isLegal: V === 'legal', legal, legalTabs, legalLinks, legalMaj: 'Dernière mise à jour : ' + ((window.CASA_LEGAL_MAJ) || '—') + ' · Les passages entre [crochets] sont à compléter.',
      weather, wx, wxCities, wxFind, isMeteo: V === 'meteo', goMeteo: () => this.go('meteo'), goPrivate: () => this.go('private'), goTable: () => this.go('live', { dSport: 'Football', dComp: 'r2', dTab: 'table' }),
      isHomeDash: V === 'home' && s.homeLayout !== 'magazine', isHomeMag: V === 'home' && s.homeLayout === 'magazine', toMagazine: () => this.setLayout('magazine'), toDashboard: () => this.setLayout('dashboard'),
      homeMods: homeModsShown, noModules: homeModsShown.length === 0, modRows, layouts, customizeOpen: s.customizeOpen, openCustomize: () => this.setState({ customizeOpen: true }), closeCustomize: () => this.setState({ customizeOpen: false }), resetModules: () => this.setMods(this.defaultMods()),
      une, dashScores, resGroups, hasScores: dashScores.length > 0, noScores: dashScores.length === 0, resNote, portes, hp: homePerso, dashNews, dashProducts, dashTable, dashVideos, lieuDuJour, quickChips, todayLabel, greeting,
      isPrivate: V === 'private', pv, pf: pfm, pvTabs, tabBar,
      isApp: V === 'app', appUrl, arModes, installSteps, installApp, installLabel, openArHub: () => this.openAR('hub'), openLineupAR: () => this.openAR('lineup'), goApp: () => this.go('app'), appHint: pwaIn ? 'Vous êtes dans l’application.' : 'Gratuite, sans passer par un store. Fonctionne sur téléphone, tablette et ordinateur.',
      isOlisto: V === 'olisto', ol, goOlisto: () => this.go('olisto'),
      isClubhouse: V === 'clubhouse', card, cardColors, chTabs, ch, chf, chMe, chLevelColor: LV[lvIdx][2], chHome, goClubhouse: () => this.go('clubhouse'),
      pvGroups, pvTitle, tm, isCulture: V === 'culture', cuTabs, cu, cuf, workOpen: !!woRaw, wo, closeWork: () => this.setState({ workIdx: null }), oeuvre, cultureHome, goCulture: () => this.go('culture'),
      hdrY: s.hdrY, showToTop: s.scrolled, toTop: () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} },
      bg, bgModes, bgColorOpts, teintes, teinteLibre, place, places, placeOpacity, placeOpen: s.placeOpen, pp, togglePlace: () => this.setState({ placeOpen: !s.placeOpen, placeIdx: X.places.indexOf(placeRaw) }), closePlace: () => this.setState({ placeOpen: false }),
      partners, partnerTiers, partnerOpen: !!ptRaw, pt, closePartner: () => this.setState({ partnerId: null }),
      aiOpen: s.aiOpen, aiClosed: !s.aiOpen, aiAria: s.aiOpen ? 'Fermer Casa IA' : 'Ouvrir Casa IA, l’assistant', toggleAi: () => this.setState({ aiOpen: !s.aiOpen }),
      aiMode: (typeof window !== 'undefined' && window.CASA_API) ? 'Connecté au modèle de langage · actions sur le site' : 'Moteur intégré · répond et agit sur le site',
      aiMsgs: s.aiMsgs.map((m) => ({ isBot: m.role !== 'user', text: m.text, actions: m.actions || [], align: m.role === 'user' ? 'flex-end' : 'flex-start', bg: m.role === 'user' ? 'var(--inv-bg)' : 'var(--surface)', fg: m.role === 'user' ? 'var(--on-inv)' : 'var(--text)', border: m.role === 'user' ? 'var(--ink)' : 'var(--line)' })),
      aiTyping: s.aiTyping, aiInput: s.aiInput, onAiInput: (e) => this.setState({ aiInput: e.target.value }), aiSend: () => this.aiAsk(s.aiInput),
      aiReset: () => this.setState({ aiMsgs: [{ role: 'bot', text: 'Nouvelle conversation. Que puis-je faire pour vous ?', actions: [] }] }),
      aiSuggest: ['Météo à Cherbourg', 'Ajoute du pain à ma liste de courses', 'Scores en direct', 'Classement R2', 'Tenue chill à moins de 60 €', 'Histoire du phare de Gatteville', 'Ouvre la Gazette page 5', 'Prochain match de Pointe-Hague'].map((l) => ({ label: l, run: () => this.aiAsk(l) })),
      openAdmin: () => this.go('admin'),
      acctId: s.email || s.phone || '—', acctRole: s.role === 'admin' ? 'administrateur' : s.role === 'writer' ? (s.staffRole === 'collaborateur' ? 'rédaction · chef d’édition' : 'rédaction · rédacteur') : s.role === 'club' ? 'correspondant de club' : 'abonné' + (s.srvRole === 'erreur' ? ' (rôle non vérifié par le serveur)' : ''),
      accShow: s.loggedIn && !s.role, accNone: !s.accReq || s.accReq.statut === 'refusee', accPending: !!s.accReq && s.accReq.statut === 'en_attente', accRefused: !!s.accReq && s.accReq.statut === 'refusee',
      accMotif: s.accMotif, onAccMotif: (e) => this.setState({ accMotif: e.target.value }), accSend: () => this.requestAccess(), accBtn: s.accBusy ? 'Envoi…' : 'Demander l’accès',
      accDate: s.accReq && s.accReq.cree_le ? new Date(s.accReq.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '',
      isStaff: !!s.role, isAdmin, notAdmin: !isAdmin, hasPending: pending.length > 0, pendingCount: String(pending.length),
      goStudio: () => (s.role ? this.go('studio', { studioTab: s.role === 'club' ? 'club' : isAdmin && pending.length ? 'queue' : 'dash' }) : this.setState({ loginOpen: true, linkSent: false })),
      isStudio: V === 'studio' && !!s.role, me, studioNav, roleSwitch, showRoleSwitch: false, kpis, dashList, dashListEmpty: dashList.length === 0, dashListTitle: isAdmin ? 'À relire en priorité' : 'Mes articles en cours', activity, notClubTabs: !isClubRole,
      stCrm: s.studioTab === 'crm' && s.role === 'admin', crm,
      stDash: s.studioTab === 'dash' && !isClubRole, stList: s.studioTab === 'list' && !isClubRole, stQueue: s.studioTab === 'queue' && !isClubRole, stEdit: s.studioTab === 'edit' && !isClubRole, stMedia: s.studioTab === 'media' && !isClubRole, stTeam: s.studioTab === 'team' && !isClubRole,
      rx: RXV, stRowsEmpty: (RXV.list && RXV.list.rows || []).length === 0,
      stRows: (RXV.list && RXV.list.rows ? RXV.list.rows : []).map((r) => { const p = posts.find((x) => x.id === r.id); return Object.assign({}, r, stV(p), { canReview: isAdmin && p.status === 'review', edit: () => openEdit(p, 'write'), review: () => openEdit(p, 'preview') }); }),
      stFilters, stQ: s.stQ, onStQ: (e) => this.setState({ stQ: e.target.value }), goStudioList: () => this.setState({ studioTab: 'list' }),
      queue, queueEmpty: queue.length === 0, queueHint: isAdmin ? 'En tant qu’administrateur principal, vous seul pouvez approuver et publier.' : 'Vos articles soumis attendent la validation de l’administrateur principal.',
      newPost: () => { if (isClubRole) { this.setState({ studioTab: 'club' }); return; } const id = 'n' + Date.now(); const at = new Date().toISOString(); const p = { id, author: me.name, status: 'draft', updated: 'à l’instant', updatedAt: at, type: 'article', sport: 'Football', tag: '', clubs: [], img: 'assets/hero.jpg', alt: '', premium: false, schedule: '', title: 'Nouvel article', dek: '', body: '', log: [{ who: me.name, when: 'à l’instant', at, what: 'Brouillon créé.' }] }; if (typeof CasaRedac !== 'undefined') p.versions = CasaRedac.addVersion(p, me.name, 'Brouillon créé'); this.setState({ posts: [p].concat(posts), studioTab: 'edit', editId: id, edMode: 'write', aiOutKind: null }); },
      ed, edLocked, edLockMsg: edRaw.status === 'review' ? 'En attente de validation par l’administrateur principal.' : edRaw.status === 'published' ? 'Article publié.' : edRaw.status === 'scheduled' ? 'Publication programmée.' : 'Lecture seule : article d’un autre membre.',
      edWrite: s.edMode === 'write', edPreview: s.edMode === 'preview', edModes, sportOpts, edClubs, edImgs, toolbar,
      edTitle: (e) => upd({ title: e.target.value }), edDek: (e) => upd({ dek: e.target.value }), edSport: (e) => upd({ sport: e.target.value }), edTag: (e) => upd({ tag: e.target.value }),
      edSchedule: (e) => upd({ schedule: e.target.value }), edAlt: (e) => upd({ alt: e.target.value }), edBody: (e) => upd({ body: e.target.value }), edPremium: () => upd({ premium: !edRaw.premium }),
      edCanSave: !edLocked, edCanSubmit: !isAdmin && !edLocked && ['draft', 'corrections'].indexOf(edRaw.status) >= 0, edCanPublishDirect: isAdmin && edRaw.author === me.name && ['draft', 'corrections'].indexOf(edRaw.status) >= 0,
      edSave: () => { this.setPost(edRaw.id, {}, 'Brouillon enregistré.'); this.say('Brouillon enregistré'); },
      edSubmit: () => this.rxGuard('soumettre', edRaw, (lev) => { this.setPost(edRaw.id, { status: 'review' }, 'Article soumis à la relecture.' + (lev ? ' Contraintes levées : ' + lev + '.' : '')); this.say('Soumis à l’administrateur principal'); }),
      edPublish: () => this.rxGuard('publier', edRaw, () => { this.setPost(edRaw.id, { status: 'published' }, 'Publié par l’administrateur principal.'); this.say('Article publié dans Actualités'); }),
      showDecision: isAdmin && edRaw.status === 'review', reviewNote: s.reviewNote, onReviewNote: (e) => this.setState({ reviewNote: e.target.value }),
      approvePublish: () => this.rxGuard('publier', edRaw, () => { this.setPost(edRaw.id, { status: 'published' }, 'Approuvé et publié.' + (s.reviewNote.trim() ? ' Note : ' + s.reviewNote.trim() : '')); this.setState({ reviewNote: '', formError: '' }); this.say('Publié : visible dans Actualités'); }),
      approveSchedule: () => this.rxGuard('publier', edRaw, () => { const when = edRaw.schedule || '2026-10-09T18:00'; this.setPost(edRaw.id, { status: 'scheduled', schedule: when }, 'Approuvé, publication programmée le ' + when.replace('T', ' à ') + '.'); this.setState({ reviewNote: '' }); this.say('Publication programmée'); }),
      requestChanges: () => { if (!s.reviewNote.trim()) { this.setState({ formError: 'Ajoutez une note pour expliquer les corrections attendues.' }); return; } this.setPost(edRaw.id, { status: 'corrections', note: s.reviewNote.trim() }, 'Corrections demandées : ' + s.reviewNote.trim()); this.setState({ reviewNote: '', formError: '' }); this.say('Corrections demandées au rédacteur'); },
      rejectPost: () => { this.setPost(edRaw.id, { status: 'rejected' }, 'Article refusé.' + (s.reviewNote.trim() ? ' Motif : ' + s.reviewNote.trim() : '')); this.setState({ reviewNote: '' }); this.say('Article refusé'); },
      commentDraft: s.commentDraft, onCommentDraft: (e) => this.setState({ commentDraft: e.target.value }),
      addComment: () => { if (!s.commentDraft.trim()) return; this.setPost(edRaw.id, {}, 'Commentaire : ' + s.commentDraft.trim()); this.setState({ commentDraft: '' }); },
      aiTools, aiOut, aiOutTitle, hasAiOut: aiOut.length > 0, mediaLib: libImgs, team,
      inviteEmail: s.inviteEmail, onInvite: (e) => this.setState({ inviteEmail: e.target.value }), sendInvite: () => { if (!/.+@.+\..+/.test(s.inviteEmail)) { this.say('E-mail invalide'); return; } this.setState({ inviteEmail: '' }); this.say('Invitation envoyée'); }
    };
  }

  // ---------- Créations de l’Atelier (Studio Boutique) : la collection « Créations Casa » ----------
  // Sur la plateforme, le serveur fournit les articles publiés (cb-bridge.js) ; ailleurs (aperçu, application seule),
  // les packs exportés par l’Atelier s’importent ici et restent sur l’appareil.
  creaDb() {
    if (this._creaP) return this._creaP;
    this._creaP = new Promise((res) => { try { const r = window.indexedDB.open('casa-boutique-atelier', 1); r.onupgradeneeded = () => r.result.createObjectStore('produits'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } });
    return this._creaP;
  }
  creaDo(mode, fn) { return this.creaDb().then((db) => new Promise((res) => { if (!db) return res(null); try { const rq = fn(db.transaction('produits', mode).objectStore('produits')); rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); } catch (e) { res(null); } })); }
  creaInit() { if (window.CB_SERVER) return; this.creaDo('readonly', (st) => st.getAll()).then((list) => { if (list && list.length) this.setCreated(list); }); }
  creaNorm(p) {
    const s = (v, n) => String(v == null ? '' : v).slice(0, n); const ok = (u) => (typeof u === 'string' && /^(data:image\/(jpeg|png|webp);base64,|\/media\/boutique\/|https:\/\/)/.test(u) ? u : '');
    const rows = (Array.isArray(p.imgsByColor) && p.imgsByColor.length ? p.imgsByColor : [Array.isArray(p.gallery) && p.gallery.length ? p.gallery : [p.img]]).map((r) => (Array.isArray(r) ? r : [r]).map(ok).filter(Boolean)).filter((r) => r.length);
    const colors = (Array.isArray(p.colors) ? p.colors : []).map((c) => ({ name: s(c && c.name, 40) || 'Coloris', hex: /^#[0-9a-fA-F]{6}$/.test(String(c && c.hex)) ? c.hex : '#ffffff' })); while (colors.length < rows.length) colors.push({ name: 'Coloris', hex: '#ffffff' });
    return { id: s(p.id, 80), line: 'atelier', name: s(p.name, 80) || 'Création Casa', short: s(p.short, 80), desc: s(p.desc, 700), price: Math.max(1, Math.round((+p.price || 0) * 100) / 100), type: s(p.type, 12) || 'tee', supportName: s(p.supportName, 40), technique: s(p.technique, 120),
      colors: colors.length ? colors.slice(0, Math.max(1, rows.length)) : [{ name: 'Unique', hex: '#ffffff' }], sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes.map((z) => s(z, 12)) : null, perso: p.perso === 'num' || p.perso === 'text' ? p.perso : null,
      flag: s(p.flag, 30), mark: '', pop: 40, isNew: !!p.isNew, img: rows.length ? rows[0][0] : null, gallery: rows.length ? rows[0] : [], imgsByColor: rows, views: Array.isArray(p.views) ? p.views.map((v) => s(v, 30)) : [], status: p.status || 'publie' };
  }
  // les créations publiées rejoignent le catalogue ; un panier ne garde que des articles encore en vente
  setCreated(list) {
    const X = this.more(); const all = (list || []).map((p) => this.creaNorm(p)).filter((p) => p.id && p.img);
    this._crea = all; X.products = X.products.filter((p) => p.line !== 'atelier').concat(all.filter((p) => p.status === 'publie'));
    this.setState({ creaN: (this.state.creaN || 0) + 1, cart: this.state.cart.filter((l) => X.products.some((p) => p.id === l.id)) });
  }
  creaSrv() { return !!(window.CB_SERVER && window.CB && window.CB.boutique); }
  creaTeamLoad() { if (!this.creaSrv()) return; window.CB.boutique.team().then((r) => this.setState({ creaTeam: r.produits || [] })).catch((e) => this.setState({ creaMsg: e.message })); }
  creaImport(file) {
    if (!file) return; if (file.size > 90e6) { this.setState({ creaMsg: 'Fichier trop lourd.' }); return; }
    const fr = new FileReader();
    fr.onload = () => {
      let j = null; try { j = JSON.parse(fr.result); } catch (e) { j = null; }
      const arts = j && j.format === 'casa-boutique' && Array.isArray(j.articles) ? j.articles.slice(0, 60) : null;
      if (!arts || !arts.length) { this.setState({ creaMsg: 'Ce fichier n’est pas un pack de l’Atelier (.casa-boutique.json).' }); return; }
      if (this.creaSrv()) {
        const CB = window.CB; const chief = CB.user && ['admin', 'collaborateur'].indexOf(CB.user.role) >= 0; let n = 0; const errs = [];
        const next = (i) => { if (i >= arts.length) { this.setState({ creaMsg: n + ' article(s) ajouté(s)' + (chief ? ', publié(s)' : ' en brouillon') + (errs.length ? ' · ' + errs.join(' ; ') : '') + '.' }); this.creaTeamLoad(); CB.boutique.reload(); return; }
          const a = arts[i]; CB.boutique.put(a.id, { product: a, status: chief ? 'publie' : 'brouillon' }).then(() => { n++; next(i + 1); }).catch((e) => { errs.push((a.name || a.id) + ' : ' + e.message); next(i + 1); }); };
        this.setState({ creaMsg: 'Envoi de ' + arts.length + ' article(s)…' }); next(0); return;
      }
      const now = new Date().toISOString();
      Promise.all(arts.map((a) => { const p = Object.assign({}, a); delete p.design; delete p.cost; delete p.costNote; p.status = 'publie'; p.importedAt = now; return this.creaDo('readwrite', (st) => st.put(p, String(p.id || ('art-' + Date.now())).slice(0, 80))); }))
        .then(() => this.creaDo('readonly', (st) => st.getAll())).then((list) => { this.setCreated(list || []); this.setState({ creaMsg: arts.length + ' article(s) ajouté(s) à la collection Créations Casa.', creaOpen: true, shopLine: 'Créations Casa' }); });
    };
    fr.onerror = () => this.setState({ creaMsg: 'Lecture du fichier impossible.' }); fr.readAsText(file);
  }
  creaSet(id, status) {
    if (this.creaSrv()) { window.CB.boutique.statut(id, status).then(() => { this.creaTeamLoad(); window.CB.boutique.reload(); this.say(status === 'publie' ? 'Article publié dans la boutique' : 'Article retiré de la boutique'); }).catch((e) => this.say(e.message)); return; }
    this.creaDo('readonly', (st) => st.get(id)).then((p) => (p ? this.creaDo('readwrite', (st) => st.put(Object.assign(p, { status }), id)) : null)).then(() => this.creaDo('readonly', (st) => st.getAll())).then((list) => { this.setCreated(list || []); this.say(status === 'publie' ? 'Article remis en boutique' : 'Article retiré de la boutique'); });
  }
  creaDel(id) {
    if (this.state.creaSure !== id) { this.setState({ creaSure: id }); clearTimeout(this._creaT); this._creaT = setTimeout(() => this.setState({ creaSure: '' }), 4000); return; }
    this.setState({ creaSure: '' });
    if (this.creaSrv()) { window.CB.boutique.del(id).then(() => { this.creaTeamLoad(); window.CB.boutique.reload(); this.say('Article supprimé'); }).catch((e) => this.say(e.message)); return; }
    this.creaDo('readwrite', (st) => st.delete(id)).then(() => this.creaDo('readonly', (st) => st.getAll())).then((list) => { this.setCreated(list || []); this.say('Article supprimé de cet appareil'); });
  }
  addLine(p, color, size, qty, perso, unit) {
    const u = unit ?? (p.priceBySize ? p.priceBySize[Math.max(0, p.sizes.indexOf(size))] : p.price);
    const cart = this.state.cart.slice();
    const i = cart.findIndex((l) => l.id === p.id && l.color === color && l.size === size && l.perso === perso);
    if (i >= 0) cart[i] = Object.assign({}, cart[i], { qty: cart[i].qty + qty });
    else cart.push({ id: p.id, color, size, qty, perso, unit: u });
    this.setState({ cart, prodError: '' });
    this.say(p.name + ' ajouté au panier');
  }
}
window.Component = Component;

