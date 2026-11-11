import sys, json, base64, re, os, urllib.parse
# Usage : python3 outils/extraire-artifact.py artifact.html dossier-de-sortie
# Transforme le fichier HTML téléchargé depuis claude.ai en site : index.html + js/ + assets/
src, out = sys.argv[1], sys.argv[2]
lines = open(src, encoding='utf-8').read().split('\n')
# strip artifact wrapper: line 1 is wrapper head; inner doc starts at line 2
assert lines[0].startswith('<!doctype html><html><head><meta charset=utf8>')
lines = lines[1:]
# drop trailing wrapper close
while lines and lines[-1].strip() == '': lines.pop()
assert lines[-1].strip() == '</body></html>', lines[-1]
lines.pop()
os.makedirs(out + '/assets', exist_ok=True); os.makedirs(out + '/js', exist_ok=True)
res = []; i = 0; n_js = 0
names = {}
while i < len(lines):
    l = lines[i]
    if l.startswith('<script>window.ASSET_DATA = '):
        body = l[len('<script>window.ASSET_DATA = '):]
        body = body[:body.rindex('}')+1]
        data = json.loads(body)
        for k, v in data.items():
            head, b = v.split(',', 1)
            raw = base64.b64decode(b) if ';base64' in head else urllib.parse.unquote(b).encode()
            open(f'{out}/assets/{k}', 'wb').write(raw)
        print('assets', len(data))
        res.append('<script>window.ASSET_DATA = {}; /* les images sont dans le dossier assets/ */' + l[l.rindex('}')+1:])
        i += 1; continue
    res.append(l); i += 1
html = '\n'.join(res) + '\n'
# externalize big inline scripts
def repl(m):
    global n_js
    code = m.group(1)
    if len(code) < 40000: return m.group(0)
    first = code.strip()[:200]
    known = [('Casa Besports — aide en ligne', 'aide.js'), ('Casa Besports — rédaction avancée', 'redaction.js'),
             ('carte de Normandie embarquée', 'carte-normandie.js'), ('Casa Besports — le réseau local', 'reseau.js'),
             ('Casa Besports — profil membre', 'profil.js'), ('Casa Besports — logique de l’application', 'app.js'),
             ('Three.js Authors', 'three.min.js'), ('Leaflet 1.', 'leaflet.js')]
    name = next((f for k, f in known if k in first), None)
    if not name:
        n_js += 1; name = f'module-{n_js}.js'
    open(f'{out}/js/{name}', 'w', encoding='utf-8').write(code)
    print('js', name, len(code), first[:80].replace('\n',' '))
    return f'<script src="js/{name}"></script>'
html = re.sub(r'<script>(.*?)</script>', repl, html, flags=re.S)
html = html.replace('window.CASA_ARTIFACT = true; window.CASA_TUILES = false;', 'window.CASA_ARTIFACT = false; window.CASA_WEATHER = true;')
html = html.replace('window.CASA_APP_URL = "https://claude.ai/artifact/3Z1QbNeNwNDmCizUsTPHJ6";', 'window.CASA_APP_URL = location.origin + "/?app=1";')
if 'manifest.webmanifest' not in html:
    html = html.replace('<meta name="apple-mobile-web-app-capable" content="yes">', '<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon.svg">\n<meta name="apple-mobile-web-app-capable" content="yes">', 1)
open(out + '/index.html', 'w', encoding='utf-8').write(html)
print('index.html', len(html))
