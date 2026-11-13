/*
 * Casa Besports — référencement (fonction Cloudflare Pages).
 *
 * Rôle : quand Google, Facebook, WhatsApp… (ou un visiteur) ouvre une adresse lisible comme
 *   /actualites/mon-article, /clubs/fceh, /a-propos ou /sitemap.xml,
 * cette fonction renvoie la page du site avec, déjà écrits dans le HTML :
 *   - le titre, la description et l'adresse officielle (canonique) de la page ;
 *   - l'aperçu de partage (Open Graph / Twitter : titre, texte, photo) ;
 *   - pour un article : les données structurées NewsArticle et le texte de l'article (lisible sans JavaScript).
 * Le site lui-même (index.html) s'affiche ensuite normalement.
 *
 * Seules les adresses listées dans _routes.json passent par ici (les images, scripts… sont servis directement).
 * Données : _site/contenus/seo.json (fichiers contenus/*.js, préparé par outils/seo-donnees.js)
 *           + version en ligne de l'espace administrateur (table Supabase site_contenu, lecture publique).
 */

const SUPABASE_URL = 'https://kexofvitykxrjknnlyvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RVo6Y6M7a0TfdYUwJuEpew_1a_N7oH4'; // clé publique (la même que js/config.js)
const SITE_NAME = 'Casa Besports';
const SUFFIX = 'Casa Besports — le média sport du Cotentin';

// Pages principales : adresse lisible → titre et description (textes du site, rien d'inventé)
const SECTIONS = {
  'actualites': { t: 'Actualités', d: 'L’actualité du sport dans le Cotentin et la Manche : récits, résultats, portraits et reportages de Casa Besports.' },
  'videos': { t: 'Vidéos', d: 'Les vidéos de Casa Besports : résumés, interviews et reportages sur le sport du Cotentin.' },
  'clubs': { t: 'Clubs', d: 'Les clubs suivis par Casa Besports dans le Cotentin et la Manche.' },
  'joueurs': { t: 'Joueurs', d: 'Les sportifs qui font vibrer la Manche : profils des joueurs, entraîneurs et arbitres suivis par Casa Besports.' },
  'boutique': { t: 'Boutique', d: 'La boutique Casa Besports : collections dessinées dans le Cotentin, floquées et brodées à Cherbourg.' },
  'disciplines': { t: 'Disciplines', d: 'Football, basket, handball, water-polo, rugby… toutes les disciplines suivies par Casa Besports.' },
  'a-propos': { t: 'À propos', d: 'Casa Besports, média sportif indépendant fondé en 2024 à Cherbourg-en-Cotentin : révéler, raconter et transmettre les histoires du sport local.' },
  'contact': { t: 'Contact', d: 'Écrire à la rédaction de Casa Besports : une question, une histoire à proposer, un projet de partenariat.' },
  'partenaires': { t: 'Partenaires', d: 'Les partenaires de Casa Besports et les offres réservées aux abonnés.' },
  'abonnements': { t: 'Abonnements', d: 'Suivre Casa Besports : abonnement Casa B+ et La Gazette du Cotentin.' },
  'le-terrain': { t: 'Le Terrain', d: 'Scores, agenda et classements du sport dans la Manche.' },
  'club-house': { t: 'Club House', d: 'La tribune des supporters du Cotentin : discussions, sondages et rendez-vous.' },
  'culture': { t: 'Culture', d: 'Le sport, l’art et la mémoire du Cotentin.' },
  'territoire': { t: 'Territoire', d: 'La carte des clubs et des communes de Normandie.' },
  'meteo': { t: 'Météo', d: 'Prévisions météo et conditions de jeu dans le Cotentin.' },
  'mentions-legales': { t: 'Informations légales', d: 'Mentions légales, confidentialité, conditions générales de vente et d’utilisation de Casa Besports.' },
  'travailler-avec-nous': { t: 'Travailler avec Casa Besports', d: 'Clubs, entreprises, organisateurs, sportifs : reportages, vidéos, interviews, partenariats et visibilité avec Casa Besports.' }
};
const DETAIL = { actualites: 'article', videos: 'video', clubs: 'club', joueurs: 'player', disciplines: 'discipline' };

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const abs = (base, u) => { try { return u ? new URL(u, base + '/').href : ''; } catch (e) { return ''; } };

// Même règle que js/comptes.js : une liste modifiée en ligne garde les nouveautés ajoutées aux fichiers
function merge(file, online) {
  if (online == null) return Array.isArray(file) ? file : [];
  if (Array.isArray(online)) return online;
  if (online && Array.isArray(online.__liste)) {
    const base = online.__base || []; const have = {};
    online.__liste.forEach((x) => { if (x && x.id) have[x.id] = 1; });
    const nouveaux = (Array.isArray(file) ? file : []).filter((x) => x && x.id && base.indexOf(x.id) < 0 && !have[x.id]);
    return nouveaux.concat(online.__liste);
  }
  return Array.isArray(file) ? file : [];
}

async function loadData(ctx, origin) {
  let file = {};
  try { const r = await ctx.env.ASSETS.fetch(new URL('/contenus/seo.json', origin)); if (r.ok) file = await r.json(); } catch (e) {}
  let online = {};
  try {
    const keys = 'CASA_ARTICLES,CASA_VIDEOS,CASA_CLUBS,CASA_JOUEURS';
    const r = await fetch(SUPABASE_URL + '/rest/v1/site_contenu?select=cle,valeur&cle=in.(' + keys + ')', {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
      cf: { cacheTtl: 120, cacheEverything: true }
    });
    if (r.ok) (await r.json()).forEach((row) => { online[row.cle] = row.valeur; });
  } catch (e) {}
  const now = Date.now();
  const visible = (a) => a && a.id && !a.brouillon && !(a.publierLe && new Date(a.publierLe).getTime() > now);
  return {
    articles: merge(file.CASA_ARTICLES, online.CASA_ARTICLES).filter(visible),
    videos: merge(file.CASA_VIDEOS, online.CASA_VIDEOS).filter((v) => v && v.id),
    clubs: merge(file.CASA_CLUBS, online.CASA_CLUBS).filter((c) => c && c.id),
    joueurs: merge(file.CASA_JOUEURS, online.CASA_JOUEURS).filter((p) => p && p.id)
  };
}

// Texte de l'article (format du site : ## intertitre, > citation, ![légende](image), - liste) → HTML simple
function bodyHtml(body) {
  return String(body || '').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((b) => {
    if (/^##\s+/.test(b)) return '<h2>' + esc(b.replace(/^##\s+/, '')) + '</h2>';
    if (/^>\s?/.test(b)) return '<blockquote>' + esc(b.replace(/^>\s?/gm, '')) + '</blockquote>';
    const img = b.match(/^!\[([^\]]*)\]\(([^)]+)\)$/); if (img) return '<figure><img src="' + esc(img[2]) + '" alt="' + esc(img[1]) + '" loading="lazy"><figcaption>' + esc(img[1]) + '</figcaption></figure>';
    if (/^- /.test(b)) return '<ul>' + b.split('\n').map((l) => '<li>' + esc(l.replace(/^-\s*/, '')) + '</li>').join('') + '</ul>';
    return '<p>' + esc(b) + '</p>';
  }).join('');
}

function render(html, meta) {
  const set = (re, val) => { html = html.replace(re, val); };
  const t = esc(meta.title);
  const d = esc(meta.desc);
  set(/<title>[^<]*<\/title>/, '<title>' + t + '</title>');
  set(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + d + '">');
  set(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + t + '">');
  set(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + d + '">');
  set(/<meta property="og:url" content="[^"]*">/, '<meta property="og:url" content="' + esc(meta.url) + '">');
  set(/<meta property="og:type" content="[^"]*">/, '<meta property="og:type" content="' + (meta.type || 'website') + '">');
  set(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="' + esc(meta.url) + '">');
  set(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + t + '">');
  if (meta.image) {
    set(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="' + esc(meta.image) + '">');
    set(/<meta name="twitter:image" content="[^"]*">/, '<meta name="twitter:image" content="' + esc(meta.image) + '">');
  }
  // Les adresses hreflang pointent vers la page elle-même
  set(/<link rel="alternate" hreflang="fr" href="[^"]*">/, '<link rel="alternate" hreflang="fr" href="' + esc(meta.url) + '">');
  set(/<link rel="alternate" hreflang="en" href="[^"]*">/, '<link rel="alternate" hreflang="en" href="' + esc(meta.url) + '?lang=en">');
  let head = '';
  if (meta.ld) meta.ld.forEach((o) => { head += '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>'; });
  if (meta.article) head += '<meta property="article:published_time" content="' + esc(meta.article.published || '') + '">' + (meta.article.modified ? '<meta property="article:modified_time" content="' + esc(meta.article.modified) + '">' : '');
  html = html.replace('</head>', head + '</head>');
  // Contenu lisible sans JavaScript (moteurs de recherche, lecteurs simples) ; le site normal s'affiche par-dessus
  if (meta.noscript) html = html.replace(/<body([^>]*)>/, '<body$1><noscript><div style="max-width:760px;margin:0 auto;padding:24px;font-family:sans-serif;color:#fff;background:#000">' + meta.noscript + '</div></noscript>');
  return html;
}

async function sitemap(ctx, origin) {
  const D = await loadData(ctx, origin);
  const urls = [{ loc: origin + '/', freq: 'daily', pri: '1.0' }];
  Object.keys(SECTIONS).forEach((k) => urls.push({ loc: origin + '/' + k, freq: k === 'actualites' ? 'daily' : 'weekly', pri: k === 'actualites' ? '0.9' : '0.6' }));
  D.articles.forEach((a) => urls.push({ loc: origin + '/actualites/' + encodeURIComponent(a.id), mod: a.modifieLe || a.publierLe || a.creeLe, freq: 'monthly', pri: '0.8' }));
  D.videos.forEach((v) => urls.push({ loc: origin + '/videos/' + encodeURIComponent(v.id), freq: 'monthly', pri: '0.6' }));
  D.clubs.forEach((c) => urls.push({ loc: origin + '/clubs/' + encodeURIComponent(c.id), freq: 'weekly', pri: '0.6' }));
  D.joueurs.forEach((p) => urls.push({ loc: origin + '/joueurs/' + encodeURIComponent(p.id), freq: 'monthly', pri: '0.5' }));
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => '  <url><loc>' + esc(u.loc) + '</loc>' + (u.mod ? '<lastmod>' + esc(String(u.mod).slice(0, 10)) + '</lastmod>' : '') + '<changefreq>' + u.freq + '</changefreq><priority>' + u.pri + '</priority></url>').join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  // Adresse officielle (canonique, plan du site, partage) : la même règle que outils/build.sh,
  // variable SITE_URL des réglages Cloudflare si elle existe, sinon https://casabesports.fr (adresse visitée en test local)
  const local = /^(localhost|127\.0\.0\.1)$/.test(url.hostname);
  const origin = String((ctx.env && ctx.env.SITE_URL) || (local ? url.origin : 'https://casabesports.fr')).replace(/\/$/, '');
  const path = url.pathname.replace(/\/+$/, '');
  if (path === '/sitemap.xml') return sitemap(ctx, origin);

  const m = path.match(/^\/([a-z-]+)(?:\/([^/]+))?$/);
  const sec = m && SECTIONS[m[1]];
  if (!sec) return ctx.next();

  const page = await ctx.env.ASSETS.fetch(new URL('/', url));
  let html = await page.text();
  const pageUrl = origin + path;
  const crumbs = (name) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: origin + '/' },
    { '@type': 'ListItem', position: 2, name: sec.t, item: origin + '/' + m[1] }
  ].concat(name ? [{ '@type': 'ListItem', position: 3, name, item: pageUrl }] : []) });

  if (!m[2]) {
    html = render(html, { title: sec.t + ' · ' + SUFFIX, desc: sec.d, url: pageUrl, ld: [crumbs()] });
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
  }

  const kind = DETAIL[m[1]];
  const id = decodeURIComponent(m[2]);
  const D = kind ? await loadData(ctx, origin) : null;
  let meta = null;
  if (kind === 'article') {
    const a = D.articles.find((x) => x.id === id);
    if (a) {
      const img = abs(url.origin, a.img);
      const published = a.publierLe || a.creeLe || '';
      meta = {
        title: a.title + ' · ' + SUFFIX, desc: clip(a.dek || a.body, 200), url: pageUrl, image: img, type: 'article',
        article: { published, modified: a.modifieLe || '' },
        ld: [crumbs(a.title), Object.assign({
          '@context': 'https://schema.org', '@type': 'NewsArticle', headline: clip(a.title, 110), description: clip(a.dek, 300),
          image: img ? [img] : undefined, author: [{ '@type': 'Person', name: a.author || 'La rédaction Casa Besports' }],
          publisher: { '@type': 'NewsMediaOrganization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: url.origin + '/icon.svg' } },
          mainEntityOfPage: pageUrl, articleSection: a.tag || a.sport || undefined, inLanguage: 'fr-FR',
          isAccessibleForFree: !a.premium
        }, published ? { datePublished: published } : {}, a.modifieLe ? { dateModified: a.modifieLe } : {})],
        noscript: '<p><a href="/actualites">' + esc(sec.t) + '</a></p><h1>' + esc(a.title) + '</h1>' + (a.dek ? '<p><strong>' + esc(a.dek) + '</strong></p>' : '') +
          '<p>Par ' + esc(a.author || 'la rédaction') + (published ? ' · ' + esc(String(published).slice(0, 10)) : '') + '</p>' +
          (img ? '<figure><img src="' + esc(img) + '" alt="' + esc(a.alt || '') + '">' + (a.credit ? '<figcaption>Photo : ' + esc(a.credit) + '</figcaption>' : '') + '</figure>' : '') +
          (a.premium ? '<p>' + esc(clip(a.body, 320)) + '</p><p>La suite est réservée aux abonnés Casa B+.</p>' : bodyHtml(a.body))
      };
    }
  } else if (kind === 'club') {
    const c = D.clubs.find((x) => x.id === id);
    if (c) {
      const arts = D.articles.filter((a) => Array.isArray(a.clubs) && a.clubs.indexOf(c.id) >= 0).slice(0, 20);
      meta = { title: c.name + ' · ' + SUFFIX, desc: clip((c.sport ? c.sport + ' · ' : '') + (c.city || '') + ' : ' + c.name + ', suivi par Casa Besports.', 200), url: pageUrl, image: abs(url.origin, c.img),
        ld: [crumbs(c.name), { '@context': 'https://schema.org', '@type': 'SportsTeam', name: c.name, sport: c.sport || undefined, location: c.city ? { '@type': 'Place', name: c.city } : undefined, url: pageUrl }],
        noscript: '<h1>' + esc(c.name) + '</h1><p>' + esc([c.sport, c.city].filter(Boolean).join(' · ')) + '</p>' + (arts.length ? '<ul>' + arts.map((a) => '<li><a href="/actualites/' + encodeURIComponent(a.id) + '">' + esc(a.title) + '</a></li>').join('') + '</ul>' : '') };
    }
  } else if (kind === 'player') {
    const p = D.joueurs.find((x) => x.id === id);
    if (p) meta = { title: p.name + ' · ' + SUFFIX, desc: clip([p.role, p.clubLabel].filter(Boolean).join(' · ') + ' — profil Casa Besports.', 200), url: pageUrl, image: abs(url.origin, p.img),
      ld: [crumbs(p.name), { '@context': 'https://schema.org', '@type': 'Person', name: p.name, jobTitle: p.role || undefined, affiliation: p.clubLabel ? { '@type': 'SportsTeam', name: p.clubLabel } : undefined }],
      noscript: '<h1>' + esc(p.name) + '</h1><p>' + esc([p.role, p.clubLabel].filter(Boolean).join(' · ')) + '</p>' };
  } else if (kind === 'video') {
    const v = D.videos.find((x) => x.id === id);
    if (v) meta = { title: (v.title || 'Vidéo') + ' · ' + SUFFIX, desc: clip(v.dek || v.desc || v.title, 200), url: pageUrl, image: abs(url.origin, v.img || v.thumb), ld: [crumbs(v.title)],
      noscript: '<h1>' + esc(v.title || '') + '</h1>' + (v.url ? '<p><a href="' + esc(v.url) + '">Voir la vidéo</a></p>' : '') };
  } else if (kind === 'discipline') {
    meta = { title: id + ' · ' + SUFFIX, desc: clip(id + ' dans le Cotentin et la Manche : actualités, clubs et résultats suivis par Casa Besports.', 200), url: pageUrl, ld: [crumbs(id)] };
  }

  if (!meta) {
    // Page introuvable (article supprimé ou adresse erronée) : code 404 pour que Google ne l'indexe pas
    html = render(html, { title: 'Page introuvable · ' + SUFFIX, desc: 'Cette page n’existe pas ou plus sur Casa Besports.', url: origin + '/' + m[1] });
    html = html.replace('</head>', '<meta name="robots" content="noindex"></head>');
    return new Response(html, { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
  html = render(html, meta);
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=120' } });
}
