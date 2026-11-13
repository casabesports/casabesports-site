/*
 * Casa Besports — prépare les données lues par la fonction Cloudflare de référencement (functions/[[path]].js).
 * Lancé par outils/build.sh : lit contenus/*.js et écrit _site/contenus/seo.json
 * (articles, vidéos, clubs, joueurs, disciplines). Aucune donnée n'est inventée : seulement ce qui est dans les fichiers.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.join(__dirname, '..');
const out = process.argv[2] || path.join(root, '_site', 'contenus', 'seo.json');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['articles', 'videos', 'clubs', 'joueurs']) {
  const p = path.join(root, 'contenus', f + '.js');
  if (fs.existsSync(p)) {
    try { vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p, timeout: 2000 }); } catch (e) { console.warn('seo-donnees : ' + f + '.js illisible (' + e.message + ')'); }
  }
}
const W = ctx.window;
const arr = (x) => (Array.isArray(x) ? x : []);
const data = { genere: new Date().toISOString(), CASA_ARTICLES: arr(W.CASA_ARTICLES), CASA_VIDEOS: arr(W.CASA_VIDEOS), CASA_CLUBS: arr(W.CASA_CLUBS), CASA_JOUEURS: arr(W.CASA_JOUEURS) };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(data));
console.log('seo-donnees : ' + data.CASA_ARTICLES.length + ' articles, ' + data.CASA_VIDEOS.length + ' vidéos, ' + data.CASA_CLUBS.length + ' clubs, ' + data.CASA_JOUEURS.length + ' joueurs');
