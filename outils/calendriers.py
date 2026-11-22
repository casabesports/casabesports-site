"""
Casa Besports : calendriers complets de la saison, un petit fichier par compétition.

Le fichier principal contenus/sport-federations.js reste léger (résultats et matchs à ±14 jours, chargé sur
toutes les pages). Le calendrier complet d'une compétition (toutes les journées de la saison) est rangé dans
contenus/calendriers/<id>.json et le site ne le charge que lorsqu'un visiteur ouvre cette compétition dans
« Le Terrain ». contenus/calendriers/index.json liste les compétitions qui ont un calendrier complet.

Format d'un fichier : { comp, sport, label, maj, source, journees: {numéro: date de lecture}, matches: [...] }
(les matchs ont le même format que dans sport-federations.js).
"""
import datetime as dt
import json
import os

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.path.join(RACINE, 'contenus', 'calendriers')


def chemin(cid):
    return os.path.join(DOSSIER, cid + '.json')


def lire(cid):
    """Calendrier déjà enregistré (ou None)."""
    try:
        with open(chemin(cid), encoding='utf-8') as f:
            return json.load(f)
    except (OSError, ValueError):
        return None


def ecrire(cid, sport, label, source, matches, journees=None):
    """Écrit le calendrier d'une compétition. Ne réécrit pas le fichier si les matchs n'ont pas changé
    (évite des commits inutiles)."""
    os.makedirs(DOSSIER, exist_ok=True)
    vus, propres = set(), []
    for m in sorted(matches, key=lambda x: (x.get('date') or '', x.get('time') or '', x.get('id'))):
        if m['id'] in vus:
            continue
        vus.add(m['id'])
        propres.append(m)
    ancien = lire(cid)
    if ancien and ancien.get('matches') == propres and ancien.get('label') == label and (journees is None or ancien.get('journees') == journees):
        return False
    data = {'comp': cid, 'sport': sport, 'label': label,
            'maj': dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec='minutes'),
            'source': source, 'matches': propres}
    if journees is not None:
        data['journees'] = journees
    with open(chemin(cid), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write('\n')
    return True


def indexer():
    """Réécrit contenus/calendriers/index.json : { id: nombre de matchs } pour toutes les compétitions présentes."""
    if not os.path.isdir(DOSSIER):
        return {}
    idx = {}
    for nom in sorted(os.listdir(DOSSIER)):
        if not nom.endswith('.json') or nom == 'index.json':
            continue
        d = lire(nom[:-5])
        if d and d.get('matches'):
            idx[nom[:-5]] = len(d['matches'])
    with open(os.path.join(DOSSIER, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump(idx, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
        f.write('\n')
    return idx
