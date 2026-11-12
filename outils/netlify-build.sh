#!/bin/sh
# Ancienne commande Netlify (voir netlify.toml) : utilise maintenant outils/build.sh, qui prépare le site dans _site/.
exec sh "$(dirname "$0")/build.sh"
