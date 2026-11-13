#!/usr/bin/env python3
"""
Casa Besports : import automatique des championnats de handball (Normandie).

Source unique : les pages publiques de la Fédération française de handball
(https://www.ffhandball.fr/competitions/…), autorisées par son robots.txt.
Les données sont lues telles que la fédération les publie, sans rien estimer.

Ordre de priorité (rayon géographique) : Manche, puis Ligue de Normandie,
puis Calvados, Orne, Eure, Seine-Maritime, puis les championnats nationaux
où joue au moins un club normand.

Écrit : contenus/sport-federations.js (window.CASA_SPORT_AUTO.Handball)
Usage : python3 outils/import_handball.py [--zones manche,normandie,...] [--jours 14]
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
import urllib.error
import urllib.request

BASE = 'https://www.ffhandball.fr'
UA = 'CasaBesports-import/1.0 (+https://casabesports.fr)'
PAUSE = 0.35  # secondes entre deux pages, pour ne pas charger le site fédéral

# zone -> (type de compétition, segment d'URL de la structure, libellé affiché)
ZONES = [
    ('manche', 'departemental', 'o-comite-de-la-manche-80', 'Manche'),
    ('normandie', 'regional', 'o-ligue-de-normandie-18', 'Normandie'),
    ('calvados', 'departemental', 'o-comite-du-calvados-44', 'Calvados'),
    ('orne', 'departemental', 'o-comite-de-l-orne-91', 'Orne'),
    ('eure', 'departemental', 'o-comite-de-l-eure-55', 'Eure'),
    ('seine-maritime', 'departemental', 'o-comite-de-seine-maritime-106', 'Seine-Maritime'),
    ('national', 'national', '', 'National'),
]

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SORTIE = os.path.join(RACINE, 'contenus', 'sport-federations.js')


def lire(url, essais=3):
    for i in range(essais):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'fr-FR'})
            with urllib.request.urlopen(req, timeout=30) as r:
                time.sleep(PAUSE)
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if i == essais - 1:
                raise
        except Exception:
            if i == essais - 1:
                raise
        time.sleep(2 * (i + 1))
    return None


def composant(page, nom):
    """Données JSON d'un composant de page (attribut « attributes » des balises smartfire-component)."""
    if not page:
        return None
    for m in re.finditer(r"smartfire-component name=['\"]([^'\"]+)['\"] attributes=\"([^\"]*)\"", page):
        if m.group(1) == nom:
            try:
                return json.loads(html.unescape(m.group(2)))
            except ValueError:
                return None
    return None


def slug(t):
    t = unicodedata.normalize('NFKD', t or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')


def joli(t):
    """« +16 MASCULIN 1ERE DIVISION » -> « +16 Masculin 1ère division »."""
    t = re.sub(r'\s+', ' ', (t or '').strip())
    if not t:
        return t
    mots = []
    for i, w in enumerate(t.lower().split(' ')):
        if re.fullmatch(r'[+-]?\d+[a-z]?', w) or w in ('n1', 'n2', 'n3', 'n3f', 'u17', 'u18'):
            mots.append(w.upper())
        else:
            mots.append(w.capitalize() if i == 0 or w in ('manche', 'normandie', 'calvados', 'orne', 'eure') else w)
    t = ' '.join(mots)
    t = re.sub(r'\b1ere\b', '1re', t)
    t = re.sub(r'\b(\d+)eme\b', r'\1e', t)
    t = re.sub(r'\bfeminin(e?s?)\b', r'féminin\1', t, flags=re.I)
    return t[0].upper() + t[1:]


SIGLES = {'AS', 'ASAM', 'ASC', 'ASPTT', 'AAEP', 'AL', 'CL', 'CS', 'ES', 'HB', 'HBC', 'JS', 'PL', 'UC', 'US', 'SM', 'ENT', 'AHB',
          'CHB', '2CHB', 'ASL', 'ESM', 'CA', 'SC', 'FC', 'UST', 'USO', 'ALM', 'CMS', 'EHB', 'MHB', 'RHB', 'SPN', 'CSM', 'ASPTT'}
PETITS = {'de', 'du', 'des', 'la', 'le', 'les', 'sur', 'sous', 'et', 'en', 'l', 'd', 'aux', 'au'}


def nom_club(equipe):
    """Nom du club à partir du nom d'équipe (retire « 2 », « B », « <13F »…)."""
    n = re.sub(r'\s+', ' ', equipe or '').strip()
    n = re.sub(r'\s*[<>]\s*\d+\s*[MFX]?$', '', n)
    n = re.sub(r'\s+(\d|[A-H])$', '', n)
    return n


def nom_affiche(n):
    """« HBC DE L'ELLE » -> « HBC de l'Elle »."""
    out = []
    for i, w in enumerate(re.split(r'(\s+|-|\(|\)|\')', n)):
        if not w or not re.search(r'[A-Za-z]', w):
            out.append(w)
        elif w.upper() in SIGLES or (len(w) <= 3 and not re.search(r'[AEIOUY]', w.upper())):
            out.append(w.upper())
        elif i > 0 and w.lower() in PETITS:
            out.append(w.lower())
        else:
            out.append(w[:1].upper() + w[1:].lower())
    return ''.join(out)


def entier(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


class Import:
    def __init__(self, saison_url, jours):
        self.saison = saison_url
        self.jours = jours
        self.auj = dt.date.today()
        self.comps, self.tables, self.matches = [], {}, []
        self.clubs = {}       # ext_structureId -> {id, name, equipes:set}
        self.normands = set() # ext_structureId des clubs normands
        self.sources = set()
        self.erreurs = []
        self.slugs = None     # ext_competitionId -> slug d'URL (plan du site, chargé si besoin)

    def url_comp(self, typ, comp, plan=False):
        cid = comp['ext_competitionId']
        if plan:
            if self.slugs is None:  # chargé une seule fois, seulement si besoin
                print('  (lecture du plan du site fédéral)', flush=True)
                self.slugs = charger_slugs(self.saison)
            s = self.slugs.get(cid)
            if not s:
                return None
        else:
            s = slug(comp['libelle']) + '-' + cid
        return '%s/competitions/%s/%s/%s/' % (BASE, self.saison, typ, s)

    def zone(self, zid, typ, struct, label):
        menu = composant(lire('%s/competitions/%s/%s/%s' % (BASE, self.saison, typ, (struct + '/') if struct else '')), 'competitions---competition-main-menu')
        if not menu:
            self.erreurs.append('Zone %s illisible' % label)
            return
        for comp in menu.get('competitions') or []:
            try:
                self.competition(zid, typ, label, comp)
            except Exception as e:  # une compétition illisible ne bloque pas les autres
                self.erreurs.append('%s : %s' % (comp.get('libelle'), e))

    def competition(self, zid, typ, zlabel, comp):
        base = self.url_comp(typ, comp)
        page = lire(base)
        if page is None:  # adresse différente du nom : on la cherche dans le plan du site
            base = self.url_comp(typ, comp, plan=True)
            page = lire(base) if base else None
        print('  ', zlabel, '·', comp['libelle'], '' if page else '(introuvable)', flush=True)
        sel = composant(page, 'competitions---poule-selector')
        if not sel:
            return
        poules = sel.get('poules') or []
        phases = {p['id']: p for p in sel.get('phases') or []}
        for p in poules:
            # plateaux et tournois des plus jeunes : pas de classement de championnat, on ne les reprend pas
            if re.search(r'tournoi|plateau|brassage', p.get('libelle') or '', re.I) and re.match(r'^\s*(-|U\s?\d)', comp['libelle']):
                continue
            self.poule(zid, typ, zlabel, comp, base, p, len(poules), phases.get(p.get('phaseId')))

    def poule(self, zid, typ, zlabel, comp, base, p, nb, phase):
        pid = p['ext_pouleId']
        url = '%spoule-%s/' % (base, pid)
        cl = composant(lire(url + 'classements/'), 'competitions---classement')
        lignes = (cl or {}).get('classements') or []
        if typ == 'national':
            # au niveau national, on ne garde que les poules où joue un club normand
            if not any(r.get('ext_structureId') in self.normands for r in lignes):
                return
        cid = 'hb-' + pid
        label = joli(comp['libelle'])
        if nb > 1 and p.get('libelle') and slug(p['libelle']) != slug(comp['libelle']):
            label += ' · ' + joli(p['libelle'])
        niveau = 'Jeunes' if re.match(r'^\s*(-|U\s?\d|COUPE JEUNE|INTERCOMITE)', comp['libelle'], re.I) else 'Seniors'
        self.comps.append({'id': cid, 'label': label, 'zone': zlabel, 'niveau': niveau, 'source': url})
        self.sources.add(url)
        if lignes:
            tab = []
            for r in sorted(lignes, key=lambda r: int(r.get('place') or 99)):
                tab.append({'team': r['equipe_libelle'], 'j': entier(r['joue']) or 0, 'g': entier(r['gagne']) or 0, 'n': entier(r['nul']) or 0,
                            'p': entier(r['perdu']) or 0, 'diff': entier(r['diff']) or 0, 'pts': entier(r['point']) or 0})
                sid = r.get('ext_structureId')
                if sid:
                    if typ != 'national':
                        self.normands.add(sid)
                    if sid in self.normands:
                        c = self.clubs.setdefault(sid, {'id': 'hb-club-' + sid, 'name': nom_club(r['equipe_libelle']), 'zone': zlabel, 'equipes': set()})
                        c['equipes'].add(r['equipe_libelle'])
                        if len(nom_club(r['equipe_libelle'])) < len(c['name']):
                            c['name'] = nom_club(r['equipe_libelle'])
            self.tables[cid] = tab
        # journées proches : résultats des N derniers jours et matchs des N prochains jours
        try:
            journees = json.loads(p.get('journees') or '[]')
        except ValueError:
            journees = []
        a, b = self.auj - dt.timedelta(days=self.jours), self.auj + dt.timedelta(days=self.jours)
        for j in journees:
            try:
                d0 = dt.date.fromisoformat(j['date_debut'])
                d1 = dt.date.fromisoformat(j.get('date_fin') or j['date_debut'])
            except (KeyError, ValueError):
                continue
            if d1 < a or d0 > b:
                continue
            jl = composant(lire('%sjournee-%s/' % (url, j['journee_numero'])), 'competitions---rencontre-list')
            for r in (jl or {}).get('rencontres') or []:
                self.match(cid, url, r)

    def match(self, cid, url, r):
        if not r.get('date') or not r.get('equipe1Libelle') or not r.get('equipe2Libelle'):
            return
        quand = dt.datetime.fromisoformat(r['date'])
        jour = quand.date()
        if abs((jour - self.auj).days) > self.jours:
            return  # match reporté loin de la journée : ignoré
        s1, s2 = r.get('equipe1Score'), r.get('equipe2Score')
        joue = s1 not in (None, '') and s2 not in (None, '')
        if joue and (entier(s1) is None or entier(s2) is None):
            return  # forfait (« FO ») : pas de score à afficher
        mid = '%s-%s' % (cid, r.get('ext_rencontreId') or (jour.isoformat() + '-' + slug(r['equipe1Libelle']) + '-' + slug(r['equipe2Libelle'])))
        if any(m['id'] == mid for m in self.matches):
            return
        # sport, salle et source : déduits de la compétition (fichier plus léger)
        self.matches.append({'id': mid, 'comp': cid, 'date': jour.isoformat(), 'time': quand.strftime('%H:%M'),
                             'home': r['equipe1Libelle'], 'away': r['equipe2Libelle'],
                             'hs': entier(s1) if joue else None, 'as': entier(s2) if joue else None,
                             'status': 'done' if joue else 'up'})


def charger_slugs(saison):
    """Slugs exacts des compétitions, lus dans le plan du site de la fédération."""
    out = {}
    idx = lire(BASE + '/sitemap_index.xml') or ''
    cartes = re.findall(r'<loc>([^<]*competitions_poules-sitemap\d*\.xml)', idx)
    # les plans les plus récents sont à la fin
    for carte in reversed(cartes):
        txt = lire(carte) or ''
        trouve = re.findall(r'/competitions/' + re.escape(saison) + r'/[a-z-]+/([a-z0-9-]+-(\d+))/poule-', txt)
        for s, cid in trouve:
            out[cid] = s
        if not trouve and out:
            break
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--zones', default=','.join(z[0] for z in ZONES))
    ap.add_argument('--jours', type=int, default=14)
    ap.add_argument('--sortie', default=SORTIE)
    o = ap.parse_args()

    accueil = composant(lire(BASE + '/competitions/'), 'competitions---competition-main-menu') or {}
    sa = accueil.get('saison') or {}
    if not sa.get('libelle'):
        sys.exit('Saison en cours introuvable sur ffhandball.fr : rien n’est modifié.')
    saison = 'saison-%s-%s' % (sa['libelle'].replace(' ', ''), sa['ext_saisonId'])
    imp = Import(saison, o.jours)
    voulues = o.zones.split(',')
    for zid, typ, struct, label in ZONES:
        if zid in voulues:
            print('…', label, flush=True)
            imp.zone(zid, typ, struct, label)

    clubs = sorted(({'id': c['id'], 'name': nom_affiche(c['name']), 'sport': 'Handball', 'city': '', 'zone': c['zone'], 'source': 'https://www.ffhandball.fr'}
                    for c in imp.clubs.values()), key=lambda c: c['name'])
    team_club = {}
    for c in imp.clubs.values():
        for e in c['equipes']:
            team_club[e] = c['id']

    # on garde les autres disciplines déjà présentes dans le fichier
    data = {}
    if os.path.exists(o.sortie):
        m = re.search(r'window\.CASA_SPORT_AUTO\s*=\s*(\{.*\});?\s*$', open(o.sortie, encoding='utf-8').read(), re.S)
        if m:
            try:
                data = json.loads(m.group(1))
            except ValueError:
                data = {}
    if not imp.comps:
        sys.exit('Aucune compétition lue : le fichier n’est pas modifié.')
    data['Handball'] = {
        'maj': dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec='minutes'),
        'source': 'Fédération française de handball (ffhandball.fr)',
        'comps': imp.comps, 'tables': imp.tables, 'matches': sorted(imp.matches, key=lambda m: (m['date'], m['time'])),
        'clubs': clubs, 'teamClub': team_club,
    }
    entete = ('/*\n * Casa Besports : championnats lus automatiquement sur les sites officiels des fédérations.\n'
              ' * Fichier généré par outils/import_*.py : ne pas modifier à la main (les corrections se font dans\n'
              ' * Espace admin › Résultats, qui reste prioritaire).\n'
              ' * { Discipline: { maj, source, comps: [{ id, label, zone, niveau, source }], tables, matches, clubs, teamClub } }\n */\n')
    with open(o.sortie, 'w', encoding='utf-8') as f:
        f.write(entete + 'window.CASA_SPORT_AUTO = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('Handball : %d compétitions, %d classements, %d matchs, %d clubs.' % (len(imp.comps), len(imp.tables), len(imp.matches), len(clubs)))
    for e in imp.erreurs:
        print('  ! ' + e)


if __name__ == '__main__':
    main()
