import sys, json, base64, re, os, urllib.parse
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
    if 'THREE' in first: name = 'three.min.js'
    elif 'leaflet' in first: name = 'leaflet.js'
    elif 'CASA_NORMANDIE' in first: name = 'carte-normandie.js'
    elif 'topojson' in first: name = 'topojson.js'
    else:
        n_js += 1; name = f'app-{n_js}.js'
    open(f'{out}/js/{name}', 'w', encoding='utf-8').write(code)
    print('js', name, len(code), first[:80].replace('\n',' '))
    return f'<script src="js/{name}"></script>'
html = re.sub(r'<script>(.*?)</script>', repl, html, flags=re.S)
html = html.replace('window.CASA_ARTIFACT = true; window.CASA_TUILES = false;', 'window.CASA_ARTIFACT = false; window.CASA_WEATHER = true;')
html = html.replace('window.CASA_APP_URL = "https://claude.ai/artifact/3Z1QbNeNwNDmCizUsTPHJ6";', 'window.CASA_APP_URL = location.origin + "/?app=1";')
open(out + '/index.html', 'w', encoding='utf-8').write(html)
print('index.html', len(html))
