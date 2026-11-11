#!/bin/sh
# Lancé par Netlify à chaque mise en ligne (voir netlify.toml).
# Remplace __SITE_URL__ par l'adresse réelle du site (domaine personnalisé dès qu'il est branché),
# pour les aperçus de partage (Facebook, WhatsApp, X), le référencement et le plan du site.
SITE="${URL:-https://casabesports.fr}"
SITE="${SITE%/}"
for f in index.html robots.txt sitemap.xml; do
  [ -f "$f" ] && sed -i "s#__SITE_URL__#$SITE#g" "$f"
done
TODAY=$(date +%Y-%m-%d)
sed -i "s#<changefreq>#<lastmod>$TODAY</lastmod><changefreq>#" sitemap.xml
echo "Adresse du site : $SITE"
