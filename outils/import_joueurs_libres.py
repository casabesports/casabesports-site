#!/usr/bin/env python3
"""
Casa Besports : joueurs des clubs normands, lus dans des sources libres et gratuites.

Sources (toutes sous licence libre, consultation automatique autorisée) :
  1. Wikipédia en français : la section « Effectif » de la page de chaque club
     (liste tenue à jour par les contributeurs, texte sous licence CC BY-SA).
  2. Wikidata : on vérifie que chaque nom est bien une personne liée à ce club
     (propriété « membre de l'équipe de sport »), et on lit son poste et sa photo.
  3. Wikimedia Commons : la photo, seulement si sa licence permet la réutilisation
     (CC0, domaine public, CC BY, CC BY-SA). L'auteur et la licence sont affichés sur le site.

Ce qui n'est PAS utilisé, volontairement :
  - Transfermarkt, sites des clubs, réseaux sociaux : extraction interdite par leurs conditions
    et photos protégées (droit d'auteur, droit à l'image).
  - Joueurs amateurs, mineurs, dates de naissance, adresses : jamais collectés automatiquement (RGPD).
    Ils s'ajoutent à la main dans l'admin, avec l'accord du joueur (formulaire « Je suis joueur »).

Écrit : contenus/joueurs-libres.js (window.CASA_JOUEURS_LIBRES) et les photos dans assets/joueurs-libres/
Usage : python3 outils/import_joueurs_libres.py            (tous les clubs)
        python3 outils/import_joueurs_libres.py --telecharger (garde une copie locale des photos)
"""
import argparse
import datetime as dt
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

UA = 'CasaBesports-import/1.0 (https://casabesports.pages.dev; site d actualite sportive normand)'
PAUSE = 12.0  # secondes entre deux appels Wikipédia/Commons (l'API limite les robots)
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE_JS = os.path.join(RACINE, 'contenus', 'joueurs-libres.js')
DOSSIER_PHOTOS = os.path.join(RACINE, 'assets', 'joueurs-libres')
CACHE = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'casa-effectifs-cache.json')  # reprise si l'outil est relancé le même jour

# Clubs suivis : identifiant Wikidata -> (discipline, ville, département, id du club dans contenus/clubs.js ou '')
# Ajoutez une ligne pour suivre un nouveau club (il faut une page Wikipédia avec une section « Effectif »).
CLUBS = {
    # Football
    'Q193377': ('Football', 'Caen', 'Calvados', ''),            # Stade Malherbe Caen
    'Q328658': ('Football', 'Le Havre', 'Seine-Maritime', ''),  # Le Havre AC
    'Q90842662': ('Football', 'Le Havre', 'Seine-Maritime', ''),  # Le Havre AC (féminines)
    'Q867320': ('Football', 'Rouen', 'Seine-Maritime', ''),     # FC Rouen
    'Q5425130': ('Football', 'Rouen', 'Seine-Maritime', ''),    # FC Rouen (féminines)
    'Q1465560': ('Football', 'Rouen', 'Seine-Maritime', ''),    # US Quevilly-Rouen Métropole
    'Q3550489': ('Football', 'Avranches', 'Manche', 'us-avranches'),  # US Avranches Mont-Saint-Michel
    'Q298279': ('Football', 'Cherbourg', 'Manche', 'as-cherbourg'),   # AS Cherbourg Football
    'Q3550575': ('Football', 'Granville', 'Manche', ''),        # US Granville
    'Q3076534': ('Football', 'Saint-Lô', 'Manche', 'fc-saint-lo'),  # FC Saint-Lô Manche
    'Q3550522': ('Football', 'Alençon', 'Orne', ''),           # US Alençon
    'Q654486': ('Football', 'Pacy-sur-Eure', 'Eure', ''),      # Pacy Ménilles RC
    'Q2722551': ('Football', 'Dieppe', 'Seine-Maritime', ''),  # FC Dieppe
    'Q3592915': ('Football', 'Évreux', 'Eure', ''),            # Évreux FC 27
    'Q3550595': ('Football', 'Mondeville', 'Calvados', 'uson-mondeville'),  # USON Mondeville
    # Basket-ball
    'Q404421': ('Basketball', 'Le Havre', 'Seine-Maritime', ''),  # Saint Thomas Basket Le Havre
    'Q2819242': ('Basketball', 'Évreux', 'Eure', ''),          # ALM Évreux Basket
    'Q1630255': ('Basketball', 'Rouen', 'Seine-Maritime', ''),  # Rouen Métropole Basket
    'Q780847': ('Basketball', 'Mondeville', 'Calvados', ''),   # USO Mondeville (féminines)
    'Q2932817': ('Basketball', 'Caen', 'Calvados', ''),        # Caen Basket Calvados
    # Handball
    'Q2932821': ('Handball', 'Caen', 'Calvados', ''),          # Caen Handball
    'Q3178166': ('Handball', 'Cherbourg', 'Manche', ''),       # JS Cherbourg
    # Hockey sur glace
    'Q1170911': ('Hockey', 'Rouen', 'Seine-Maritime', ''),     # Dragons de Rouen
    'Q1541560': ('Hockey', 'Caen', 'Calvados', ''),            # Drakkars de Caen
    # Rugby
    'Q3496238': ('Rugby', 'Rouen', 'Seine-Maritime', ''),      # Rouen Normandie Rugby
    'Q2932822': ('Rugby', 'Caen', 'Calvados', ''),             # Caen Rugby Club
    # Volley-ball
    'Q3592913': ('Volley-ball', 'Évreux', 'Eure', ''),         # Évreux Volley-ball
    # Cyclisme
    'Q3564082': ('Cyclisme', 'Rouen', 'Seine-Maritime', ''),   # Véloce Club Rouen 76
}

LICENCES_OK = re.compile(r'^(CC0|Public domain|PD|CC BY(-SA)? [0-9.]+( [a-z]{2,})?|CC BY(-SA)?)$', re.I)
SECTION_EFFECTIF = re.compile(r'effectif|joueurs actuels|équipe actuelle|equipe actuelle|coureurs', re.I)
SECTION_EXCLUE = re.compile(r'historique|précédent|precedent|passé|anciens|célèbres|celebres|emblématiques|internationaux|prêt|pret|staff|encadrement|dirigeant|entraîneurs|records|saison \d{4}-\d{4} (?!.*actuel)', re.I)


def get(url, params=None, accept='application/json', binaire=False, essais=6, post=None):
    if params:
        url = url + ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    for i in range(essais):
        h = {'User-Agent': UA, 'Accept': accept}
        if post is not None:
            h['Content-Type'] = 'application/x-www-form-urlencoded'
        req = urllib.request.Request(url, headers=h, data=urllib.parse.urlencode(post).encode() if post is not None else None)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binaire else json.loads(data.decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and i < essais - 1:
                attente = min(int(e.headers.get('Retry-After') or 20), 300) + 2
                print('  … limite atteinte (%s), pause de %d s' % (urllib.parse.urlparse(url).netloc, attente), file=sys.stderr)
                time.sleep(attente)
                continue
            raise
        except (urllib.error.URLError, TimeoutError):
            if i < essais - 1:
                time.sleep(10)
                continue
            raise


def wiki(params):
    time.sleep(PAUSE)
    return get('https://fr.wikipedia.org/w/api.php', dict(params, format='json', formatversion='2'))


def commons(params):
    time.sleep(PAUSE)
    return get('https://commons.wikimedia.org/w/api.php', dict(params, format='json', formatversion='2'))


def sparql(q):
    d = get('https://query.wikidata.org/sparql', accept='application/sparql-results+json', post={'query': q, 'format': 'json'})
    return [{k: v['value'] for k, v in b.items()} for b in d['results']['bindings']]


def slug(t):
    t = unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def nettoie(t):
    t = re.sub(r'<[^>]+>', '', t or '')
    t = re.sub(r'\s+', ' ', t)
    return t.strip()


NOMS_COURTS = {}


def pages_des_clubs():
    vals = ' '.join('wd:' + q for q in CLUBS)
    rows = sparql('''SELECT ?team ?art ?nom ?label WHERE { VALUES ?team { %s }
      ?art schema:about ?team ; schema:isPartOf <https://fr.wikipedia.org/> ; schema:name ?nom .
      OPTIONAL { ?team rdfs:label ?label FILTER(LANG(?label) = "fr") } }''' % vals)
    out = {}
    for r in rows:
        q = r['team'].rsplit('/', 1)[1]
        out[q] = r['nom']
        NOMS_COURTS[q] = r.get('label') or ''
    return out


def saison_en_cours():
    """Année de début de la saison sportive (juillet à juin)."""
    d = dt.date.today()
    return d.year if d.month >= 7 else d.year - 1


def liens_effectif(titre):
    """Titres des pages liées dans la section « Effectif » actuelle de la page du club."""
    d = wiki({'action': 'parse', 'page': titre, 'prop': 'sections', 'redirects': 1})
    secs = d.get('parse', {}).get('sections', [])
    # première section « Effectif » qui n'est pas historique, sans ses sous-sections exclues (prêtés, staff…)
    choisies = []
    for s in secs:
        ligne = nettoie(s.get('line'))
        saisons = [int(x) for x in re.findall(r'(20\d\d)\s*[-–/]\s*20\d\d', ligne)]
        perime = saisons and max(saisons) < saison_en_cours()
        if SECTION_EFFECTIF.search(ligne) and not SECTION_EXCLUE.search(ligne) and not perime:
            choisies.append(s)
    if not choisies:
        return [], None
    s = choisies[0]
    # texte affiché (modèles d'effectif développés : chaque joueur y est un lien vers sa page)
    d = wiki({'action': 'parse', 'page': titre, 'prop': 'text', 'section': s['index'], 'redirects': 1, 'disablelimitreport': 1, 'disableeditsection': 1})
    texte = d.get('parse', {}).get('text', '')
    # coupe les sous-sections exclues (prêtés, staff…)
    morceaux = re.split(r'(<h[2-6][^>]*>.*?</h[2-6]>)', texte, flags=re.S)
    garde = [morceaux[0]]
    for i in range(1, len(morceaux) - 1, 2):
        if not SECTION_EXCLUE.search(nettoie(morceaux[i])):
            garde.append(morceaux[i + 1])
    texte = '\n'.join(garde)
    # retire les références et notes
    texte = re.sub(r'<sup[^>]*>.*?</sup>', '', texte, flags=re.S)
    liens = []
    for m in re.finditer(r'<a href="/wiki/([^"#?]+)"', texte):
        t = urllib.parse.unquote(m.group(1)).replace('_', ' ')
        if ':' in t or not t:
            continue
        if t not in liens:
            liens.append(t)
    return liens, nettoie(s.get('line'))


def qids_des_pages(titres):
    out = {}
    for i in range(0, len(titres), 50):
        d = wiki({'action': 'query', 'titles': '|'.join(titres[i:i + 50]), 'prop': 'pageprops', 'ppprop': 'wikibase_item', 'redirects': 1})
        q = d.get('query', {})
        renv = {r['from']: r['to'] for r in q.get('redirects', [])}
        norm = {r['from']: r['to'] for r in q.get('normalized', [])}
        par_titre = {p['title']: p.get('pageprops', {}).get('wikibase_item') for p in q.get('pages', [])}
        for t in titres[i:i + 50]:
            t2 = norm.get(t, t)
            t2 = renv.get(t2, t2)
            if par_titre.get(t2):
                out[t] = (par_titre[t2], t2)
    return out


ROLES = [
    (r'gardien', 'Gardien'), (r'défenseur|arrière latéral|libéro|stoppeur|latéral', 'Défenseur'),
    (r'milieu', 'Milieu'), (r'attaquant|avant-centre|ailier(?! \()|buteur', 'Attaquant'),
]


def role_de(sport, postes):
    p = ' '.join(postes).lower()
    if sport == 'Football':
        for motif, r in ROLES:
            if re.search(motif, p):
                return r
        return 'Joueur'
    if sport == 'Cyclisme':
        return 'Coureur cycliste'
    if postes:
        return postes[0][:1].upper() + postes[0][1:]
    return 'Joueur'


def infos_wikidata(paires):
    """paires : [(qid du joueur, qid du club)]. Une requête pour tous les clubs (le service limite le nombre d'appels)."""
    out = {}
    paires = sorted(set(paires))
    for i in range(0, len(paires), 120):
        vals = ' '.join('(wd:%s wd:%s)' % pq for pq in paires[i:i + 120])
        rows = sparql('''SELECT ?p ?team ?nom ?img ?posteLabel ?genre ?neNorm ?num ?lie ?ouvertIci ?sportif ?coach ?entraineur ?annee WHERE { VALUES (?p ?team) { %s }
          ?p wdt:P31 wd:Q5 .
          FILTER NOT EXISTS { ?p wdt:P570 ?deces }
          BIND(EXISTS { ?p wdt:P54 ?team } AS ?lie)
          OPTIONAL { ?p p:P54 ?s1 . ?s1 ps:P54 ?team . OPTIONAL { ?s1 pq:P582 ?e1 } BIND(!BOUND(?e1) AS ?ouvertIci) }
          BIND(EXISTS { ?p wdt:P54 ?autre } AS ?sportif)
          BIND(EXISTS { ?p wdt:P106 ?o . VALUES ?o { wd:Q628099 wd:Q41583 wd:Q3665646 } } AS ?coach)
          BIND(EXISTS { ?team wdt:P286 ?p } AS ?entraineur)
          OPTIONAL { ?p wdt:P569 ?naiss . BIND(YEAR(?naiss) AS ?annee) }
          OPTIONAL { ?p rdfs:label ?nom FILTER(LANG(?nom) = "fr") }
          OPTIONAL { ?p wdt:P18 ?img }
          OPTIONAL { ?p wdt:P413 ?poste }
          OPTIONAL { ?p wdt:P21 ?genre }
          OPTIONAL { ?p wdt:P19 ?ne . BIND(EXISTS { ?ne wdt:P131* wd:Q18677875 } AS ?neNorm) }
          OPTIONAL { ?p p:P54 ?st . ?st ps:P54 ?team ; pq:P1618 ?num . FILTER NOT EXISTS { ?st pq:P582 ?fin } }
          SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en". } }''' % vals)
        ouverts = {(r['p'], r['team']) for r in rows if r.get('ouvertIci') == 'true'}
        for r in rows:
            vrai = lambda c: r.get(c) == 'true'  # noqa: E731
            ouvert = (r['p'], r['team']) in ouverts
            # on garde : un sportif, pas l'entraîneur du club, né après 1980,
            # pas parti du club (lien avec date de fin), pas un entraîneur sans contrat de joueur ici
            if not vrai('sportif') or vrai('entraineur'):
                continue
            if r.get('annee') and int(float(r['annee'])) < 1980:
                continue
            if vrai('lie') and not ouvert:
                continue
            if vrai('coach') and not ouvert:
                continue
            k = (r['p'].rsplit('/', 1)[1], r['team'].rsplit('/', 1)[1])
            o = out.setdefault(k, {'nom': r.get('nom', ''), 'img': r.get('img', ''), 'postes': [], 'femme': False, 'normand': False, 'num': ''})
            if r.get('posteLabel') and r['posteLabel'] not in o['postes']:
                o['postes'].append(r['posteLabel'])
            if r.get('genre', '').endswith('/Q6581072'):
                o['femme'] = True
            if r.get('neNorm') == 'true':
                o['normand'] = True
            if r.get('num') and not o['num']:
                o['num'] = r['num']
            if r.get('img') and not o['img']:
                o['img'] = r['img']
    return out


def vignette(fichier, largeur):
    """Vignette de 500 px (taille standard de Wikimedia, les autres tailles sont refusées)."""
    import hashlib
    f = fichier.replace(' ', '_')
    h = hashlib.md5(f.encode('utf-8')).hexdigest()
    base = 'https://upload.wikimedia.org/wikipedia/commons/'
    if largeur and largeur <= 500:
        return base + '%s/%s/%s' % (h[0], h[:2], urllib.parse.quote(f))
    nom = urllib.parse.quote(f)
    if f.lower().endswith(('.tif', '.tiff')):
        return base + 'thumb/%s/%s/%s/lossy-page1-500px-%s.jpg' % (h[0], h[:2], nom, nom)
    return base + 'thumb/%s/%s/%s/500px-%s' % (h[0], h[:2], nom, nom)


def infos_photos(fichiers):
    """Licence, auteur et vignette de chaque fichier Commons."""
    out = {}
    fichiers = list(fichiers)
    for i in range(0, len(fichiers), 40):
        lot = ['File:' + f for f in fichiers[i:i + 40]]
        d = commons({'action': 'query', 'titles': '|'.join(lot), 'prop': 'imageinfo', 'iiprop': 'url|size|extmetadata', 'redirects': 1})
        q = d.get('query', {})
        norm = {r['to']: r['from'] for r in q.get('normalized', [])}
        for p in q.get('pages', []):
            ii = (p.get('imageinfo') or [{}])[0]
            md = ii.get('extmetadata') or {}
            lic = nettoie((md.get('LicenseShortName') or {}).get('value', ''))
            auteur = nettoie((md.get('Artist') or {}).get('value', '')) or nettoie((md.get('Credit') or {}).get('value', ''))
            titre = norm.get(p['title'], p['title'])[5:]
            out[titre] = {'licence': lic, 'auteur': auteur[:120], 'vignette': vignette(titre, ii.get('width') or 0), 'page': ii.get('descriptionurl', ''), 'url_licence': (md.get('LicenseUrl') or {}).get('value', '')}
    return out


def enregistre_photo(url, chemin):
    data = get(url, binaire=True, accept='image/*')
    try:
        from PIL import Image
        im = Image.open(io.BytesIO(data)).convert('RGB')
        w, h = im.size
        # cadrage 4:5 (format des fiches joueurs), centré horizontalement, en gardant le haut (visage)
        cible = 4 / 5
        if w / h > cible:
            nw = int(h * cible)
            x = (w - nw) // 2
            im = im.crop((x, 0, x + nw, h))
        else:
            nh = int(w / cible)
            im = im.crop((0, 0, w, min(h, nh)))
        im.thumbnail((400, 500))
        im.save(chemin, 'JPEG', quality=80, optimize=True, progressive=True)
    except ImportError:
        with open(chemin, 'wb') as f:
            f.write(data)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--telecharger', action='store_true', help='garde une copie locale des photos (sinon affichées depuis Wikimedia)')
    ap.add_argument('--clubs', default='', help='identifiants Wikidata séparés par des virgules (par défaut : tous)')
    a = ap.parse_args()
    clubs = [c for c in (a.clubs.split(',') if a.clubs else CLUBS) if c in CLUBS]
    titres = pages_des_clubs()
    os.makedirs(DOSSIER_PHOTOS, exist_ok=True)
    aujourdhui = dt.date.today().isoformat()
    joueurs, deja = [], set()
    bilan = []
    cache = {}
    if os.path.exists(CACHE):
        try:
            cache = json.load(open(CACHE, encoding='utf-8'))
        except ValueError:
            cache = {}
    effectifs = {}
    for q in clubs:
        titre = titres.get(q)
        if not titre:
            bilan.append((q, '?', 0, 'pas de page Wikipédia'))
            continue
        if q in cache and (dt.date.today() - dt.date.fromisoformat(cache[q].get('jour', '2000-01-01'))).days <= 2:
            effectifs[q] = cache[q]
            print('• %s (déjà lu le %s)' % (titre, cache[q]['jour']), file=sys.stderr)
            continue
        print('• %s' % titre, file=sys.stderr)
        try:
            liens, section = liens_effectif(titre)
            pages = qids_des_pages(liens) if liens else {}
        except Exception as e:  # noqa: BLE001
            bilan.append((q, titre, 0, 'erreur : %s' % e))
            continue
        effectifs[q] = cache[q] = {'jour': aujourdhui, 'titre': titre, 'section': section, 'pages': pages}
        with open(CACHE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False)
    infos = infos_wikidata([(v[0], q) for q, e in effectifs.items() for v in e['pages'].values()])
    for q, e in effectifs.items():
        sport, ville, dep, club_id = CLUBS[q]
        titre, section, pages = e['titre'], e['section'], e['pages']
        if not pages:
            bilan.append((q, titre, 0, 'pas de section Effectif' if not section else 'aucun lien'))
            continue
        nom_club = NOMS_COURTS.get(q) or re.sub(r'\s*\((football|basket-ball|handball|féminines|rugby[^)]*)\)$', '', titre)
        if '(féminines)' in titre and 'fémin' not in nom_club:
            nom_club += ' (féminines)'
        n = 0
        for lien, (qid, page) in pages.items():
            inf = infos.get((qid, q))
            if not inf or qid in deja:
                continue
            deja.add(qid)
            n += 1
            nom = inf['nom'] or re.sub(r'\s*\(.*\)$', '', page)
            role = role_de(sport, inf['postes'])
            if sport != 'Football' and inf['femme'] and role == 'Joueur':
                role = 'Joueuse'
            joueurs.append({
                'id': 'wd-' + qid.lower(), 'num': inf['num'], 'name': nom, 'role': role,
                'club': club_id, 'clubLabel': nom_club, 'sport': sport, 'ville': ville, 'departement': dep,
                'normand': inf['normand'], 'img': '', '_fichier': urllib.parse.unquote(inf['img'].rsplit('/', 1)[1]) if inf['img'] else '',
                'source': {'wikipedia': 'https://fr.wikipedia.org/wiki/' + urllib.parse.quote(titre.replace(' ', '_')) + '#' + urllib.parse.quote((section or '').replace(' ', '_')),
                           'wikidata': 'https://www.wikidata.org/wiki/' + qid, 'verifie': e.get('jour', aujourdhui)},
            })
        bilan.append((q, titre, n, section))
    # photos
    fichiers = {j['_fichier'] for j in joueurs if j['_fichier']}
    photos = infos_photos(fichiers) if fichiers else {}
    refusees = 0
    for j in joueurs:
        f = j.pop('_fichier')
        ph = photos.get(f)
        if not f or not ph or not ph['vignette']:
            continue
        if not LICENCES_OK.match(ph['licence'] or ''):
            refusees += 1
            continue
        chemin = os.path.join(DOSSIER_PHOTOS, j['id'] + '.jpg')
        # Par défaut, la photo est affichée depuis Wikimedia (vignette 500 px, réutilisation autorisée avec crédit).
        # --telecharger en garde une copie recadrée dans assets/joueurs-libres/ (plus rapide, mais Wikimedia limite les robots).
        j['img'] = ph['vignette']
        if os.path.exists(chemin):
            j['img'] = 'assets/joueurs-libres/' + j['id'] + '.jpg'
        elif a.telecharger:
            try:
                time.sleep(3)
                enregistre_photo(ph['vignette'], chemin)
                j['img'] = 'assets/joueurs-libres/' + j['id'] + '.jpg'
            except Exception as e:  # noqa: BLE001
                print('  photo gardée en lien (%s) : %s' % (j['name'], e), file=sys.stderr)
        j['credit'] = {'auteur': ph['auteur'] or 'auteur inconnu', 'licence': ph['licence'], 'lien': ph['page'], 'lienLicence': ph['url_licence']}
    joueurs.sort(key=lambda j: (j['departement'] != 'Manche', j['sport'], j['clubLabel'], j['name']))
    entete = ('/*\n * Casa Besports — joueurs des clubs normands lus dans des sources libres (généré, ne pas modifier à la main).\n'
              ' * Outil : outils/import_joueurs_libres.py · Sources : Wikipédia (effectifs), Wikidata, Wikimedia Commons (photos sous licence libre).\n'
              ' * Mis à jour le %s. Pour masquer un joueur : admin › Contenus › Joueurs, ajoutez-le avec le même identifiant et cochez « masquer ».\n */\n' % aujourdhui)
    with open(SORTIE_JS, 'w', encoding='utf-8') as f:
        f.write(entete + 'window.CASA_JOUEURS_LIBRES = ' + json.dumps(joueurs, ensure_ascii=False, indent=1) + ';\n')
    # supprime les photos de joueurs qui ne sont plus dans les effectifs
    gardees = {os.path.basename(j['img']) for j in joueurs if j['img'].startswith('assets/')}
    for nom in os.listdir(DOSSIER_PHOTOS):
        if nom.endswith('.jpg') and nom not in gardees:
            os.remove(os.path.join(DOSSIER_PHOTOS, nom))
    print('\nBilan :')
    for q, t, n, s in bilan:
        print('  %-10s %-48s %3d  %s' % (q, t[:48], n, s or ''))
    print('%d joueurs, %d avec photo libre, %d photos écartées (licence non libre).' % (len(joueurs), sum(1 for j in joueurs if j['img']), refusees))


if __name__ == '__main__':
    main()
