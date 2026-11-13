#!/usr/bin/env python3
"""
Casa Besports : import automatique des championnats de volley-ball (Normandie).

Source : le site de résultats officiel de la FFVolley (https://www.ffvbbeach.org/ffvbapp/resu/),
pages publiques. Les données sont lues telles qu'elles sont publiées, sans rien estimer.

Ordre : Comité de la Manche, puis Comité du Calvados (les autres comités normands et la Ligue
seront ajoutés dès que leurs codes seront connus : il suffit de compléter COMITES).

Écrit : contenus/sport-federations.js (window.CASA_SPORT_AUTO['Volley-ball']), sans toucher aux autres disciplines.
Usage : python3 outils/import_volley.py [--jours 14]
"""
import argparse
import datetime as dt
import html
import json
import os
import re
import sys
import time
import unicodedata
import urllib.request

BASE = 'https://www.ffvbbeach.org/ffvbapp/resu/'
UA = 'CasaBesports-import/1.0 (+https://casabesports.fr)'
PAUSE = 0.5
COMITES = [('PTLB50', 'Manche'), ('PTLB14', 'Calvados')]
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'contenus', 'sport-federations.js')


def lire(url):
    for i in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'fr-FR'})
            with urllib.request.urlopen(req, timeout=30) as r:
                time.sleep(PAUSE)
                return r.read().decode('latin-1')
        except Exception:
            if i == 2:
                raise
            time.sleep(2 * (i + 1))


def texte(c):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', c))).strip()


def slug(t):
    t = unicodedata.normalize('NFKD', t or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def entier(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def joli(t):
    t = (t or '').strip().lower()
    t = t.replace('feminine', 'féminine').replace('departemental', 'départemental').replace('compet lib', 'compet’lib').replace('calvados', 'Calvados')
    return t[:1].upper() + t[1:]


def nom_affiche(n):
    petits = {'de', 'du', 'des', 'la', 'le', 'les', 'sur', 'et', 'l', 'd'}
    out = []
    for i, w in enumerate(re.split(r'(\s+|-|\')', n or '')):
        if not re.search(r'[A-Za-z]', w or ''):
            out.append(w)
        elif len(w) <= 3 and not re.search(r'[AEIOUY]', w.upper()):
            out.append(w.upper())
        elif i > 0 and w.lower() in petits:
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:].lower())
    return ''.join(out)


def lignes(page):
    b = page[page.lower().find('<body'):]
    b = re.sub(r'<script.*?</script>', '', b, flags=re.S | re.I)
    for tr in re.findall(r'<tr.*?</tr>', b, flags=re.S | re.I):
        yield [texte(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, flags=re.S | re.I)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--jours', type=int, default=14)
    ap.add_argument('--sortie', default=SORTIE)
    o = ap.parse_args()
    auj = dt.date.today()
    an = auj.year if auj.month >= 7 else auj.year - 1
    saison = '%d/%d' % (an, an + 1)
    comps, tables, matches, clubs, team_club, erreurs = [], {}, [], {}, {}, []
    for codent, zone in COMITES:
        try:
            accueil = lire(BASE + 'vbspo_home.php?codent=' + codent)
        except Exception as e:
            erreurs.append('%s illisible : %s' % (zone, e))
            continue
        poules = []
        for m in re.finditer(r'poule=([A-Z0-9]+)[^>]*>(.*?)</a>', accueil, re.S):
            code, lib = m.group(1), texte(m.group(2))
            lib = re.sub(r'^' + code + r'\s+', '', lib)
            if code not in [p[0] for p in poules]:
                poules.append((code, lib))
        for code, lib in poules:
            url = '%svbspo_calendrier.php?saison=%s&codent=%s&poule=%s' % (BASE, saison, codent, code)
            try:
                page = lire(url)
            except Exception as e:
                erreurs.append('%s %s : %s' % (zone, lib, e))
                continue
            cid = 'vb-%s-%s' % (codent.lower(), code.lower())
            tab, entete = [], False
            for c in lignes(page):
                if len(c) > 6 and c[2:4] == ['Points', 'Jou.']:
                    entete = True
                    continue
                if entete and len(c) > 15 and re.fullmatch(r'\d+\.', c[0] or ''):
                    equipe = c[1]
                    sp, sc = entier(c[13]) or 0, entier(c[14]) or 0
                    tab.append({'team': equipe, 'j': entier(c[3]) or 0, 'g': entier(c[4]) or 0, 'n': 0,
                                'p': entier(c[5]) or 0, 'diff': sp - sc, 'pts': entier(c[2]) or 0})
                    continue
                if entete and len(c) <= 15:
                    entete = False
                # match : code, date JJ/MM/AA, heure, domicile, '', extérieur, ...
                if len(c) >= 8 and re.fullmatch(r'\d\d/\d\d/\d\d', c[1] or ''):
                    dom, ext = c[3], c[5]
                    if not dom or not ext or 'xxxxx' in (dom + ext).lower():
                        continue  # équipe exempte
                    j, m_, a = c[1].split('/')
                    jour = dt.date(2000 + int(a), int(m_), int(j))
                    if abs((jour - auj).days) > o.jours:
                        continue
                    s1, s2 = entier(c[6]), entier(c[7])
                    joue = s1 is not None and s2 is not None
                    if not joue and (c[6] or (c[7] and c[7].isdigit())):
                        continue  # score incomplet ou forfait : rien d'affiché
                    matches.append({'id': '%s-%s' % (cid, slug(c[0])), 'comp': cid, 'date': jour.isoformat(), 'time': c[2] or '',
                                    'home': dom, 'away': ext, 'hs': s1 if joue else None, 'as': s2 if joue else None,
                                    'status': 'done' if joue else 'up', 'venue': '' if joue else nom_affiche(c[7])})
            if not tab and not any(m['comp'] == cid for m in matches):
                continue
            comps.append({'id': cid, 'label': joli(lib), 'zone': zone, 'niveau': 'Seniors', 'source': url})
            tables[cid] = tab
            for r in tab:
                n = nom_affiche(re.sub(r'\s*\d+$', '', r['team']).strip() or r['team'])
                cl = clubs.setdefault(slug(n), {'id': 'vb-club-' + slug(n), 'name': n, 'sport': 'Volley-ball', 'city': '', 'zone': zone})
                team_club[r['team']] = cl['id']
    if not comps:
        sys.exit('Aucune compétition de volley lue : le fichier n’est pas modifié.')
    data = {}
    if os.path.exists(o.sortie):
        m = re.search(r'window\.CASA_SPORT_AUTO\s*=\s*(\{.*\});?\s*$', open(o.sortie, encoding='utf-8').read(), re.S)
        if m:
            data = json.loads(m.group(1))
    data['Volley-ball'] = {'maj': dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec='minutes'),
                           'source': 'Fédération française de volley (ffvbbeach.org)', 'comps': comps, 'tables': tables,
                           'matches': sorted(matches, key=lambda x: (x['date'], x['time'])),
                           'clubs': sorted(clubs.values(), key=lambda c: c['name']), 'teamClub': team_club}
    txt = open(o.sortie, encoding='utf-8').read() if os.path.exists(o.sortie) else ''
    entete = txt[:txt.index('window.CASA_SPORT_AUTO')] if 'window.CASA_SPORT_AUTO' in txt else '/* Casa Besports : championnats lus sur les sites officiels des fédérations (outils/import_*.py). */\n'
    with open(o.sortie, 'w', encoding='utf-8') as f:
        f.write(entete + 'window.CASA_SPORT_AUTO = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('Volley-ball : %d compétitions, %d matchs, %d clubs.' % (len(comps), len(matches), len(clubs)))
    for e in erreurs:
        print('  ! ' + e)


if __name__ == '__main__':
    main()
