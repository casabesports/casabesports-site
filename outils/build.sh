#!/bin/sh
# Préparation du site avant mise en ligne (Cloudflare Pages, et aussi Netlify).
# Cloudflare Pages : commande de build « sh outils/build.sh », dossier de sortie « _site ».
#
# 1. Copie dans _site/ uniquement les fichiers publics du site (pas docs/, supabase/, automatisations/…).
# 2. Remplace __SITE_URL__ par l'adresse du site (balises de partage, plan du site).
#    Adresse utilisée : variable SITE_URL si elle existe, sinon https://casabesports.fr
# 3. Ajoute un numéro de version aux scripts : chaque mise en ligne force les navigateurs à recharger js/ et contenus/.
# 4. Prépare le référencement (contenus/seo.json et _routes.json, voir functions/[[path]].js).
set -e
cd "$(dirname "$0")/.."
OUT=_site
rm -rf "$OUT"
mkdir -p "$OUT"
for f in index.html icon.svg manifest.webmanifest sw.js hors-ligne.html robots.txt sitemap.xml _headers _redirects; do
  [ -e "$f" ] && cp "$f" "$OUT/"
done
for d in assets js contenus; do
  cp -R "$d" "$OUT/"
done
SITE="${SITE_URL:-${URL:-https://casabesports.fr}}"
SITE="${SITE%/}"
for f in index.html robots.txt sitemap.xml; do
  [ -f "$OUT/$f" ] && sed -i "s#__SITE_URL__#$SITE#g" "$OUT/$f"
done
REF="${CF_PAGES_COMMIT_SHA:-${COMMIT_REF:-$(date +%s)}}"
VER=$(printf '%s' "$REF" | cut -c1-8)
sed -i "s#__VERSION__#$VER#g" "$OUT/index.html" "$OUT/sw.js"
TODAY=$(date +%Y-%m-%d)
sed -i "s#<changefreq>#<lastmod>$TODAY</lastmod><changefreq>#" "$OUT/sitemap.xml"
# 4. Référencement : données lues par la fonction Cloudflare (functions/[[path]].js) et liste des adresses qu'elle traite
if command -v node >/dev/null 2>&1; then node outils/seo-donnees.js "$OUT/contenus/seo.json" || echo "seo-donnees : ignoré"; fi
SECTIONS="actualites videos clubs joueurs boutique disciplines a-propos contact partenaires abonnements le-terrain club-house culture territoire meteo mentions-legales pro"
{
  printf '{"version":1,"include":["/sitemap.xml"'
  for s in $SECTIONS; do printf ',"/%s","/%s/*"' "$s" "$s"; done
  printf '],"exclude":[]}\n'
} > "$OUT/_routes.json"
echo "Site prêt dans $OUT/ · adresse $SITE · version $VER"
