/*!
 * Casa Besports — « Les Escales du Cotentin » (Culture › Parcours sport & patrimoine)
 * Chargé à la demande avec Leaflet, à l'ouverture d'un parcours.
 * - Tracé : fichier GPX vérifié (contenus/parcours.js › gpx) sinon calcul par l'IGN (Géoplateforme, gratuit, sans clé),
 *   sinon lignes droites entre les escales (signalé comme tel). Dénivelé : service d'altitude de l'IGN.
 * - Carte : Plan IGN v2 (Licence Ouverte).
 * - Suivi en direct : GPS du téléphone (navigator.geolocation), uniquement quand la page est ouverte ; rien n'est envoyé.
 * - Strava, Garmin, Komoot… : échange par fichiers GPX (export du tracé, import de la trace d'une sortie).
 */
var CasaParcours = (function () {
  'use strict';

  var GEOPF = 'https://data.geopf.fr';
  var PLAN = GEOPF + '/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}';
  var CACHE = 'cb-parcours-trace-v1';
  var RAYON = 120; // mètres : distance à laquelle une escale est « atteinte »

  /* ---------- calculs ---------- */
  function dist(a, b) {
    var R = 6371000, r = Math.PI / 180;
    var dLat = (b[0] - a[0]) * r, dLon = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }
  function longueur(pts) { var m = 0; for (var i = 1; i < pts.length; i++) m += dist(pts[i - 1], pts[i]); return m; }
  function denivele(z) {
    // cumul des montées en ignorant les variations de moins de 3 m (bruit de mesure)
    var up = 0, down = 0, ref = null;
    (z || []).forEach(function (v) { if (typeof v !== 'number' || v < -100) return; if (ref == null) { ref = v; return; } var d = v - ref; if (d >= 3) { up += d; ref = v; } else if (d <= -3) { down -= d; ref = v; } });
    return { up: Math.round(up), down: Math.round(down) };
  }
  function echantillon(pts, n) {
    if (pts.length <= n) return pts.slice();
    var out = [], step = (pts.length - 1) / (n - 1);
    for (var i = 0; i < n; i++) out.push(pts[Math.round(i * step)]);
    return out;
  }
  function etapes(p) {
    var e = (p.escales || []).map(function (x) { return [x.lat, x.lon]; });
    return p.boucle && e.length > 1 ? e.concat([e[0]]) : e;
  }

  /* ---------- GPX ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function gpx(nom, pts, escales, avecTemps) {
    var t = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<gpx version="1.1" creator="Casa Besports" xmlns="http://www.topografix.com/GPX/1/1">',
      '<metadata><name>' + esc(nom) + '</name><link href="https://casabesports.fr"><text>Casa Besports · Les Escales du Cotentin</text></link></metadata>'];
    (escales || []).forEach(function (e, i) { t.push('<wpt lat="' + e.lat + '" lon="' + e.lon + '"><name>' + esc((i + 1) + '. ' + e.nom) + '</name><desc>' + esc(e.d || '') + '</desc></wpt>'); });
    t.push('<trk><name>' + esc(nom) + '</name><trkseg>');
    pts.forEach(function (p) {
      var s = '<trkpt lat="' + p[0].toFixed(6) + '" lon="' + p[1].toFixed(6) + '">';
      if (p[2] != null && typeof p[2] === 'number' && !avecTemps) s += '<ele>' + p[2].toFixed(1) + '</ele>';
      if (avecTemps && p[3]) s += '<time>' + new Date(p[3]).toISOString() + '</time>';
      t.push(s + '</trkpt>');
    });
    t.push('</trkseg></trk></gpx>');
    return t.join('\n');
  }
  function lireGpx(texte) {
    var doc = new DOMParser().parseFromString(String(texte || ''), 'application/xml');
    if (doc.getElementsByTagName('parsererror').length) throw new Error('Ce fichier n’est pas un GPX lisible.');
    var noms = ['trkpt', 'rtept'], pts = [];
    for (var k = 0; k < noms.length && !pts.length; k++) {
      var l = doc.getElementsByTagName(noms[k]);
      for (var i = 0; i < l.length; i++) {
        var la = parseFloat(l[i].getAttribute('lat')), lo = parseFloat(l[i].getAttribute('lon'));
        if (isNaN(la) || isNaN(lo)) continue;
        var ele = l[i].getElementsByTagName('ele')[0], tm = l[i].getElementsByTagName('time')[0];
        pts.push([la, lo, ele ? parseFloat(ele.textContent) : null, tm ? Date.parse(tm.textContent) || null : null]);
      }
    }
    if (!pts.length) throw new Error('Aucun point GPS dans ce fichier. Exportez la sortie au format GPX.');
    return pts;
  }
  function telecharger(nomFichier, texte) {
    var blob = new Blob([texte], { type: 'application/gpx+xml' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = nomFichier; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  // escales traversées par une trace (dans l'ordre ou non)
  function escalesAtteintes(pts, escales, rayon) {
    var r = rayon || RAYON * 1.25;
    return (escales || []).map(function (e, i) { return pts.some(function (p) { return dist(p, [e.lat, e.lon]) <= r; }) ? i : -1; }).filter(function (i) { return i >= 0; });
  }

  /* ---------- tracé : GPX vérifié › IGN › lignes droites ---------- */
  var memo = {};
  function cleDe(p) { return p.id + ':' + (p.gpx || '') + ':' + etapes(p).map(function (x) { return x[0].toFixed(5) + ',' + x[1].toFixed(5); }).join(';'); }
  function lireCache() { try { return JSON.parse(localStorage.getItem(CACHE) || '{}') || {}; } catch (e) { return {}; } }
  function ecrireCache(k, v) { try { var c = lireCache(); c[k] = v; localStorage.setItem(CACHE, JSON.stringify(c)); } catch (e) {} }
  function json(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }

  function itineraireIGN(p) {
    var e = etapes(p); if (e.length < 2) return Promise.reject(new Error('une seule escale'));
    var ll = function (x) { return x[1].toFixed(6) + ',' + x[0].toFixed(6); };
    var mil = e.slice(1, -1).map(ll).join('|');
    var essai = function (res) {
      var u = GEOPF + '/navigation/itineraire?resource=' + res + '&profile=pedestrian&optimization=shortest&start=' + ll(e[0]) + '&end=' + ll(e[e.length - 1]) +
        (mil ? '&intermediates=' + encodeURIComponent(mil) : '') + '&geometryFormat=geojson&getSteps=false&getBbox=false';
      return json(u).then(function (d) {
        var g = d && d.geometry; var c = g && (g.type === 'LineString' ? g.coordinates : g.type === 'MultiLineString' ? [].concat.apply([], g.coordinates) : null);
        if (!c || c.length < 2) throw new Error('itinéraire vide');
        return c.map(function (x) { return [x[1], x[0]]; });
      });
    };
    return essai('bdtopo-osrm').catch(function () { return essai('bdtopo-pgr'); }).catch(function () { return essai('bdtopo-valhalla'); });
  }
  function altitudesIGN(pts) {
    var s = echantillon(pts, 90);
    var u = GEOPF + '/altimetrie/1.0/calcul/alti/rest/elevationLine.json?resource=ign_rge_alti_wld&delimiter=' + encodeURIComponent('|') +
      '&lon=' + encodeURIComponent(s.map(function (x) { return x[1].toFixed(5); }).join('|')) + '&lat=' + encodeURIComponent(s.map(function (x) { return x[0].toFixed(5); }).join('|')) +
      '&indent=false&measures=false&zonly=false&profile_mode=simple&sampling=' + Math.min(200, s.length * 2);
    return json(u).then(function (d) {
      var z = (d && d.elevations || []).map(function (v) { return typeof v === 'number' ? v : v && v.z; });
      var dp = denivele(z);
      if (d && d.height_differences && typeof d.height_differences.positive === 'number') dp = { up: Math.round(d.height_differences.positive), down: Math.round(d.height_differences.negative || 0) };
      return dp;
    });
  }

  function trace(p) {
    var k = cleDe(p);
    if (memo[k]) return memo[k];
    var c = lireCache()[k];
    if (c && c.pts && c.pts.length > 1) { memo[k] = Promise.resolve(c); return memo[k]; }
    var droit = function () { var pts = etapes(p); return { pts: pts, m: Math.round(longueur(pts)), up: null, source: 'droit' }; };
    var base = p.gpx
      ? fetch(p.gpx).then(function (r) { if (!r.ok) throw new Error('GPX introuvable'); return r.text(); }).then(function (t) { return { pts: lireGpx(t).map(function (x) { return [x[0], x[1], x[2]]; }), source: 'gpx' }; })
      : itineraireIGN(p).then(function (pts) { return { pts: pts, source: 'ign' }; });
    memo[k] = base.then(function (r) {
      r.m = Math.round(longueur(r.pts));
      var zs = r.pts.map(function (x) { return x[2]; }).filter(function (v) { return typeof v === 'number' && !isNaN(v); });
      var fin = function () { r.pts = r.pts.map(function (x) { return [+x[0].toFixed(5), +x[1].toFixed(5)]; }); ecrireCache(k, r); return r; };
      if (zs.length > r.pts.length * 0.8) { r.up = denivele(zs).up; return fin(); }
      return altitudesIGN(r.pts).then(function (dp) { r.up = dp.up; return fin(); }).catch(function () { r.up = null; return fin(); });
    }).catch(function () { var r = droit(); delete memo[k]; return r; });
    return memo[k];
  }

  /* ---------- carte ---------- */
  var M = { map: null, el: null, id: '', ligne: null, pins: null, moi: null, sillage: null, fit: '' };
  function icone(n, fait, prochaine) {
    return window.L.divIcon({ className: 'pc-pin' + (fait ? ' pc-pin-ok' : '') + (prochaine ? ' pc-pin-next' : ''), html: '<span>' + (fait ? '✓' : n) + '</span>', iconSize: [30, 30], iconAnchor: [15, 15] });
  }
  function sync(slot, o) {
    var L = window.L; if (!L || !slot) return;
    if (!M.el) { M.el = document.createElement('div'); M.el.className = 'pc-carte'; M.el.setAttribute('role', 'region'); M.el.setAttribute('aria-label', 'Carte du parcours'); }
    if (M.el.parentNode !== slot) { slot.appendChild(M.el); if (M.map) setTimeout(function () { M.map.invalidateSize(); }, 0); }
    if (!M.map) {
      M.map = L.map(M.el, { zoomControl: true, attributionControl: true, minZoom: 8, maxZoom: 19, scrollWheelZoom: false, tap: true });
      L.tileLayer(PLAN, { maxZoom: 19, attribution: 'Plan IGN v2 © IGN – Géoplateforme' }).addTo(M.map);
      M.pins = L.layerGroup().addTo(M.map);
    }
    var p = o.parcours;
    if (M.id !== p.id) {
      M.id = p.id; M.fit = '';
      if (M.ligne) { M.ligne.remove(); M.ligne = null; }
      if (M.sillage) { M.sillage.remove(); M.sillage = null; }
    }
    // tracé
    var pts = o.pts || etapes(p);
    var sig = p.id + ':' + pts.length + ':' + (o.source || '');
    if (!M.ligne || M.ligne._sig !== sig) {
      if (M.ligne) M.ligne.remove();
      M.ligne = L.polyline(pts, { color: o.couleur || '#0d6e8a', weight: 5, opacity: 0.9, dashArray: o.source === 'droit' ? '8 8' : null }).addTo(M.map);
      M.ligne._sig = sig;
    }
    // escales
    M.pins.clearLayers();
    (p.escales || []).forEach(function (e, i) {
      var mk = L.marker([e.lat, e.lon], { icon: icone(i + 1, (o.faites || []).indexOf(i) >= 0, o.prochaine === i), keyboard: true, title: (i + 1) + '. ' + e.nom });
      mk.bindTooltip((i + 1) + '. ' + e.nom, { direction: 'top', offset: [0, -14] });
      if (o.surEscale) mk.on('click', function () { o.surEscale(i); });
      mk.addTo(M.pins);
    });
    // position et sillage en direct
    if (o.moi) {
      if (!M.moi) M.moi = L.circleMarker(o.moi, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#e2462f', fillOpacity: 1 }).addTo(M.map); else M.moi.setLatLng(o.moi);
      if (o.suivre) M.map.panTo(o.moi, { animate: true });
    } else if (M.moi) { M.moi.remove(); M.moi = null; }
    if (o.sillage && o.sillage.length > 1) {
      if (!M.sillage) M.sillage = L.polyline(o.sillage, { color: '#e2462f', weight: 4, opacity: 0.85 }).addTo(M.map); else M.sillage.setLatLngs(o.sillage);
    } else if (M.sillage) { M.sillage.remove(); M.sillage = null; }
    if (M.fit !== sig && !o.suivre) { M.fit = sig; M.map.fitBounds(L.latLngBounds(pts.concat((p.escales || []).map(function (e) { return [e.lat, e.lon]; }))), { padding: [28, 28] }); }
  }

  /* ---------- suivi en direct ---------- */
  var V = null;
  function demarrer(p, cb) {
    if (V) arreter();
    if (!navigator.geolocation) { cb.erreur && cb.erreur('Le GPS n’est pas disponible sur cet appareil.'); return false; }
    V = { p: p, pts: [], m: 0, t0: Date.now(), faites: [], cb: cb, lock: null };
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (l) { if (V) V.lock = l; }).catch(function () {}); } catch (e) {}
    V.watch = navigator.geolocation.watchPosition(function (pos) {
      if (!V) return;
      var c = pos.coords; if (c.accuracy > 60) { cb.maj && cb.maj(etat('Signal GPS faible (± ' + Math.round(c.accuracy) + ' m)…')); return; }
      var pt = [c.latitude, c.longitude, c.altitude, pos.timestamp || Date.now()];
      var last = V.pts[V.pts.length - 1];
      if (!last || dist(last, pt) >= 5) { if (last) V.m += dist(last, pt); V.pts.push(pt); }
      (p.escales || []).forEach(function (e, i) {
        if (V.faites.indexOf(i) < 0 && dist(pt, [e.lat, e.lon]) <= RAYON) { V.faites.push(i); cb.escale && cb.escale(i); }
      });
      cb.maj && cb.maj(etat(''));
    }, function (err) {
      var msg = err && err.code === 1 ? 'Autorisez la localisation pour suivre le parcours.' : 'Position introuvable pour le moment.';
      cb.erreur && cb.erreur(msg);
    }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 });
    return true;
  }
  function etat(note) {
    if (!V) return null;
    var last = V.pts[V.pts.length - 1] || null, p = V.p, next = -1, dn = null;
    (p.escales || []).some(function (e, i) { if (V.faites.indexOf(i) < 0) { next = i; return true; } return false; });
    if (last && next >= 0) dn = Math.round(dist(last, [p.escales[next].lat, p.escales[next].lon]));
    return { m: Math.round(V.m), s: Math.round((Date.now() - V.t0) / 1000), moi: last ? [last[0], last[1]] : null, sillage: V.pts.map(function (x) { return [x[0], x[1]]; }), faites: V.faites.slice(), prochaine: next, distProchaine: dn, note: note };
  }
  function arreter() {
    if (!V) return null;
    try { navigator.geolocation.clearWatch(V.watch); } catch (e) {}
    try { if (V.lock) V.lock.release(); } catch (e) {}
    var r = { pts: V.pts.slice(), m: Math.round(V.m), s: Math.round((Date.now() - V.t0) / 1000), faites: V.faites.slice(), debut: V.t0 };
    V = null;
    return r;
  }

  return { dist: dist, longueur: longueur, denivele: denivele, gpx: gpx, lireGpx: lireGpx, telecharger: telecharger, escalesAtteintes: escalesAtteintes,
    trace: trace, sync: sync, demarrer: demarrer, arreter: arreter, enDirect: function () { return !!V; }, etat: function () { return etat(''); }, RAYON: RAYON };
})();
if (typeof window !== 'undefined') window.CasaParcours = CasaParcours;
