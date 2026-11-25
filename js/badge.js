/*!
 * Casa Besports — Badge BE+ des correspondants et personnes agréées, et trombinoscope public.
 *  - « Mon badge BE+ » : le titulaire remplit son badge (photo, nom, fonction, club, discipline, ville, présentation, coloris),
 *    voit l'aperçu recto/verso en direct, l'enregistre en brouillon puis l'envoie à l'administrateur pour validation.
 *    Une fois validé : numéro BE-AAAA-XXXX, validité jusqu'au 31 août, QR code vers sa fiche du trombinoscope.
 *    Téléchargement en image (recto, verso) et impression au format carte (54 × 85,6 mm).
 *  - Recto : QR code vers la fiche du trombinoscope (vérification d'un coup d'œil : badge valide, expiré ou inconnu).
 *  - Verso : QR code vers l'application BE+ (espace correspondants).
 *  - Trombinoscope : badges validés et en cours de validité, sans e-mail ni téléphone. Adresse : /?trombinoscope ou /?badge=NUMÉRO.
 * Données : supabase/badges.sql (droits vérifiés par Supabase). Validation : Espace administrateur › Demandes à valider.
 */
var CasaBadge = (function () {
  'use strict';
  var A = function () { return window.CasaAuth || {}; };
  var RADE = '#10283A', BRUME = '#E9EFEE', SOLEIL = '#F2B33D', VERT = '#2F6B4F';
  var THEMES = {
    maree: { label: 'Marée', fond: BRUME, bande: RADE, texte: RADE, doux: '#4A5D6B', touche: SOLEIL, carte: '#FFFFFF' },
    soleil: { label: 'Soleil', fond: '#FBF3E1', bande: RADE, texte: RADE, doux: '#5D5340', touche: '#D9921C', carte: '#FFFFFF' },
    nuit: { label: 'Nuit', fond: '#0B1C29', bande: '#132F44', texte: '#F4F7F7', doux: '#A9B9C3', touche: SOLEIL, carte: '#17364D' }
  };
  var FONCTIONS = ['Correspondant de club', 'Correspondante de club', 'Rédacteur', 'Rédactrice', 'Chef d’édition', 'Photographe', 'Vidéaste', 'Commentateur', 'Bénévole agréé', 'Bénévole agréée', 'Partenaire agréé'];
  var STATUTS = { brouillon: ['Brouillon', 'Pas encore envoyé à l’administrateur.'], en_attente: ['En attente de validation', 'L’administrateur vérifie votre badge. Vous serez prévenu ici.'],
    valide: ['Badge validé', 'Votre badge est actif et visible dans le trombinoscope.'], correction: ['Correction demandée', ''], refuse: ['Badge refusé', ''], suspendu: ['Badge suspendu', ''] };
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var LOGO_B = 'M0 0H453Q566 0 662.5 31Q759 62 818.5 132.5Q878 203 878 323Q878 402 848.5 464Q819 526 770.5 565.5Q722 605 665 618Q715 624 762.5 646.5Q810 669 848.5 708.5Q887 748 909.5 806.5Q932 865 932 945Q932 1056 882.5 1140.5Q833 1225 738.5 1272.5Q644 1320 507 1320H0ZM299 1081H435Q499 1081 539.5 1061.5Q580 1042 599 1005.5Q618 969 618 918Q618 838 568.5 800.5Q519 763 430 763H299ZM299 529H420Q473 529 508.5 510Q544 491 562.5 456.5Q581 422 581 377Q581 296 535 267.5Q489 239 409 239H299Z M1034 0H1877V262H1332V531H1872V785H1332V1058H1877V1320H1034Z';
  var LOGO_P = 'M2585 779V1067H2338V779H2050V534H2338V246H2585V534H2871V779Z';
  var st = null;

  // ---------------------------------------------------------------- outils
  function el(tag, attrs) {
    var e = document.createElement(tag); attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k]; if (v == null || v === false) return;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v;
      else if (k === 'value') e.value = v; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2).toLowerCase(), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) add(e, arguments[i]);
    return e;
  }
  function add(e, c) { if (c == null || c === false) return; if (Array.isArray(c)) { c.forEach(function (x) { add(e, x); }); return; } e.appendChild(typeof c === 'object' ? c : document.createTextNode(String(c))); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtDate(iso) { if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return String(iso); return d.getDate() + (d.getDate() === 1 ? 'er' : '') + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  // Adresse imprimée dans les QR codes : celle où le site est réellement ouvert (casabesports.pages.dev aujourd'hui,
  // casabesports.fr une fois le domaine branché ; l'adresse pages.dev continue de marcher ensuite).
  function site() { try { if (/^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) return location.origin; var u = window.CASA_SITE_URL; return (u && /^https?:/.test(u) ? u : 'https://casabesports.pages.dev').replace(/\/+$/, ''); } catch (e) { return 'https://casabesports.pages.dev'; } }
  function lienFiche(num) { return site() + '/?badge=' + encodeURIComponent(num); }
  function lienTrombi() { return site() + '/?trombinoscope'; }
  function lienAppli() { return site() + '/#/studio'; }
  function court(u) { return String(u).replace(/^https?:\/\//, ''); }
  function say(t) { if (window.CasaSite && window.CasaSite.say) window.CasaSite.say(t); else if (st && st.toast) { st.toast.textContent = t; st.toast.className = 'cbb-toast on'; clearTimeout(st.toast._t); st.toast._t = setTimeout(function () { if (st && st.toast) st.toast.className = 'cbb-toast'; }, 3500); } }
  function db(fn) { var a = A(); return a.db ? a.db(fn) : Promise.reject(new Error('Comptes non configurés')); }
  function sqlManquant(e) { var m = String((e && (e.message || e.code)) || ''); return /badges_be|trombinoscope|does not exist|PGRST20[25]|42P01|42883|schema cache/i.test(m); }
  function saison(expire) { var y = expire ? new Date(expire).getFullYear() : (new Date().getMonth() >= 8 ? new Date().getFullYear() + 1 : new Date().getFullYear()); return (y - 1) + '-' + y; }

  // ---------------------------------------------------------------- QR code (modules noirs en chemin SVG)
  function qr(text) {
    if (!window.qrcode || !text) return null;
    try { var q = window.qrcode(0, 'M'); q.addData(text); q.make(); var n = q.getModuleCount(), d = '';
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
      return { n: n, d: d };
    } catch (e) { return null; }
  }
  function qrSvg(text, x, y, size, fg, bg) {
    var q = qr(text); if (!q) return '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="' + bg + '"/>';
    var m = size / (q.n + 4);
    return '<rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size + '" fill="' + bg + '"/><path transform="translate(' + (x + 2 * m) + ' ' + (y + 2 * m) + ') scale(' + m + ')" fill="' + fg + '" d="' + q.d + '"/>';
  }
  function logo(x, y, h, blanc) { var k = h / 1320; return '<g transform="translate(' + x + ' ' + y + ') scale(' + k + ')"><path fill="' + blanc + '" d="' + LOGO_B + '"/><path fill="' + SOLEIL + '" d="' + LOGO_P + '"/></g>'; }
  // coupe un texte en lignes (largeur approximative, en caractères)
  function lignes(t, max, n) { var mots = String(t || '').split(/\s+/).filter(Boolean), out = [], cur = ''; mots.forEach(function (m) { if ((cur + ' ' + m).trim().length > max && cur) { out.push(cur); cur = m; } else cur = (cur + ' ' + m).trim(); }); if (cur) out.push(cur); if (out.length > n) { out = out.slice(0, n); out[n - 1] = out[n - 1].replace(/.{0,2}$/, '…'); } return out; }

  // ---------------------------------------------------------------- dessin du badge (SVG 540 × 856, format carte CR80)
  var W = 540, H = 856;
  var FONTS = "font-family:'League Spartan','Arial Black',sans-serif";
  var COND = "font-family:'Barlow Condensed','Arial Narrow',sans-serif";
  var TXT = "font-family:'Mulish',Arial,sans-serif";
  function recto(b, opts) {
    opts = opts || {}; var T = THEMES[b.theme] || THEMES.maree;
    var ok = b.statut === 'valide' && b.numero;
    var fonction = (b.fonction || 'Correspondant').toUpperCase();
    var prenom = b.prenom || 'Prénom', nom = (b.nom || 'Nom').toUpperCase();
    var tailleNom = nom.length > 14 ? 38 : nom.length > 10 ? 46 : 54;
    var sous = [b.club, [b.discipline, b.ville].filter(Boolean).join(' · ')].filter(Boolean);
    var s = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + (opts.style || '') +
      '<defs><clipPath id="cbbph"><rect x="150" y="196" width="240" height="288"/></clipPath></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="' + T.fond + '"/>' +
      '<rect width="' + W + '" height="150" fill="' + T.bande + '"/>' +
      logo(38, 44, 62, '#FFFFFF') +
      '<text x="502" y="70" text-anchor="end" style="' + COND + ';font-weight:600;font-size:21px;letter-spacing:2.5px" fill="' + SOLEIL + '">' + esc(fonction) + '</text>' +
      '<text x="502" y="100" text-anchor="end" style="' + COND + ';font-weight:500;font-size:17px;letter-spacing:2px" fill="#C9D6DD">BADGE OFFICIEL · SAISON ' + esc(saison(b.expire_le)) + '</text>' +
      '<rect y="150" width="' + W + '" height="8" fill="' + T.touche + '"/>' +
      '<rect x="144" y="190" width="252" height="300" fill="' + T.carte + '"/>' +
      (b.photo ? '<image x="150" y="196" width="240" height="288" preserveAspectRatio="xMidYMid slice" clip-path="url(#cbbph)" href="' + esc(b.photo) + '" xlink:href="' + esc(b.photo) + '"/>'
        : '<rect x="150" y="196" width="240" height="288" fill="' + (b.theme === 'nuit' ? '#21445E' : '#D6E0E3') + '"/><circle cx="270" cy="300" r="52" fill="' + (b.theme === 'nuit' ? '#3A5F7A' : '#B7C6CC') + '"/><path d="M178 484q0-96 92-96t92 96z" fill="' + (b.theme === 'nuit' ? '#3A5F7A' : '#B7C6CC') + '"/>') +
      '<rect x="144" y="486" width="252" height="6" fill="' + T.touche + '"/>' +
      '<text x="270" y="540" text-anchor="middle" style="' + TXT + ';font-weight:600;font-size:28px" fill="' + T.texte + '">' + esc(prenom) + '</text>' +
      '<text x="270" y="' + (540 + tailleNom) + '" text-anchor="middle" style="' + FONTS + ';font-weight:800;font-size:' + tailleNom + 'px;letter-spacing:.5px" fill="' + T.texte + '">' + esc(nom) + '</text>';
    sous.forEach(function (t, i) { s += '<text x="270" y="' + (540 + tailleNom + 34 + i * 26) + '" text-anchor="middle" style="' + COND + ';font-weight:600;font-size:' + (i ? 20 : 23) + 'px;letter-spacing:1px" fill="' + (i ? T.doux : T.texte) + '">' + esc(t.toUpperCase()) + '</text>'; });
    // bas : QR code vers la fiche du trombinoscope
    var url = ok ? lienFiche(b.numero) : lienTrombi();
    s += '<rect y="700" width="' + W + '" height="156" fill="' + T.bande + '"/>' +
      qrSvg(url, 34, 716, 124, RADE, '#FFFFFF') +
      '<text x="180" y="748" style="' + COND + ';font-weight:600;font-size:17px;letter-spacing:2px" fill="#C9D6DD">N° DE BADGE</text>' +
      '<text x="180" y="782" style="' + FONTS + ';font-weight:800;font-size:30px;letter-spacing:1px" fill="#FFFFFF">' + esc(ok ? b.numero : 'EN ATTENTE') + '</text>' +
      '<text x="180" y="810" style="' + TXT + ';font-weight:600;font-size:16px" fill="#C9D6DD">' + esc(ok ? 'Valable jusqu’au ' + fmtDate(b.expire_le) : 'Numéro attribué à la validation') + '</text>' +
      '<text x="180" y="834" style="' + TXT + ';font-weight:600;font-size:15px" fill="' + SOLEIL + '">Scannez pour vérifier</text>';
    if (!ok) s += '<g transform="rotate(-28 270 420)"><rect x="-30" y="388" width="600" height="64" fill="' + SOLEIL + '" opacity=".93"/><text x="270" y="432" text-anchor="middle" style="' + FONTS + ';font-weight:800;font-size:30px;letter-spacing:3px" fill="' + RADE + '">' + (b.statut === 'suspendu' ? 'BADGE SUSPENDU' : 'SPÉCIMEN · NON VALIDÉ') + '</text></g>';
    return s + '</svg>';
  }
  function verso(b, opts) {
    opts = opts || {}; var ok = b.statut === 'valide' && b.numero;
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + (opts.style || '') +
      '<rect width="' + W + '" height="' + H + '" fill="' + RADE + '"/>' +
      '<rect y="0" width="' + W + '" height="8" fill="' + SOLEIL + '"/>' +
      logo(150, 70, 100, '#FFFFFF') +
      '<text x="270" y="232" text-anchor="middle" style="' + COND + ';font-weight:600;font-size:22px;letter-spacing:3px" fill="' + SOLEIL + '">ESPACE CORRESPONDANTS</text>' +
      qrSvg(lienAppli(), 150, 262, 240, RADE, '#FFFFFF') +
      '<text x="270" y="540" text-anchor="middle" style="' + FONTS + ';font-weight:800;font-size:27px" fill="#FFFFFF">L’APPLICATION BE+</text>' +
      '<text x="270" y="570" text-anchor="middle" style="' + TXT + ';font-weight:600;font-size:17px" fill="#C9D6DD">réservée aux correspondants et personnes agréées</text>' +
      '<text x="270" y="598" text-anchor="middle" style="' + TXT + ';font-weight:700;font-size:17px" fill="' + SOLEIL + '">' + esc(court(lienAppli())) + '</text>' +
      '<rect x="40" y="628" width="460" height="1.5" fill="#35546A"/>';
    var txt = ok ? 'Ce badge atteste que son titulaire est agréé par Casa Besports pour la saison ' + saison(b.expire_le) + '.'
      : 'Badge non encore validé par Casa Besports : il ne donne aucun accès tant que l’administrateur ne l’a pas validé.';
    lignes(txt, 52, 4).forEach(function (l, i) { s += '<text x="270" y="' + (664 + i * 24) + '" text-anchor="middle" style="' + TXT + ';font-weight:500;font-size:16.5px" fill="#DCE5EA">' + esc(l) + '</text>'; });
    s += '<text x="270" y="752" text-anchor="middle" style="' + TXT + ';font-weight:600;font-size:15px" fill="#C9D6DD">Vérification : scannez le QR code au recto</text>' +
      '<text x="270" y="822" text-anchor="middle" style="' + COND + ';font-weight:600;font-size:16px;letter-spacing:2px" fill="#8FA6B4">CASA BESPORTS · LE SPORT DANS LA MANCHE</text>';
    return s + '</svg>';
  }

  // ---------------------------------------------------------------- export (image PNG, impression)
  var fontCss = null;
  function polices() {
    if (fontCss) return fontCss;
    var f = [['League Spartan', 800, 'league-spartan-latin-800-normal'], ['Barlow Condensed', 600, 'barlow-condensed-latin-600-normal'], ['Barlow Condensed', 500, 'barlow-condensed-latin-500-normal'], ['Mulish', 500, 'mulish-latin-500-normal'], ['Mulish', 600, 'mulish-latin-600-normal'], ['Mulish', 700, 'mulish-latin-700-normal']];
    fontCss = Promise.all(f.map(function (x) {
      return fetch('assets/polices/' + x[2] + '.woff2').then(function (r) { return r.blob(); }).then(function (bl) { return new Promise(function (ok) { var rd = new FileReader(); rd.onload = function () { ok("@font-face{font-family:'" + x[0] + "';font-weight:" + x[1] + ";src:url(" + rd.result + ") format('woff2')}"); }; rd.onerror = function () { ok(''); }; rd.readAsDataURL(bl); }); }).catch(function () { return ''; });
    })).then(function (l) { return '<style>' + l.join('') + '</style>'; });
    return fontCss;
  }
  function versPng(svg, echelle) {
    return new Promise(function (ok, ko) {
      var img = new Image();
      img.onload = function () { var c = document.createElement('canvas'); c.width = W * echelle; c.height = H * echelle; var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height); c.toBlob(function (b) { if (b) ok(b); else ko(new Error('png')); }, 'image/png'); };
      img.onerror = function () { ko(new Error('Image impossible')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    });
  }
  function enregistrer(blob, nom) {
    var u = URL.createObjectURL(blob), a = el('a', { href: u, download: nom }); document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500);
  }
  function nomFichier(b, face) { return 'badge-be-' + (String((b.prenom || '') + '-' + (b.nom || '')).toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'correspondant') + '-' + face + '.png'; }
  function telecharger(b, face) {
    return polices().then(function (css) { var svg = (face === 'verso' ? verso : recto)(b, { style: css }); return versPng(svg, 2); })
      .then(function (blob) { enregistrer(blob, nomFichier(b, face)); say(face === 'verso' ? 'Verso du badge enregistré' : 'Recto du badge enregistré'); })
      .catch(function () { say('Téléchargement impossible sur cet appareil'); });
  }
  function imprimer(b) {
    polices().then(function (css) {
      var w = window.open('', '_blank'); if (!w) { say('Autorisez les fenêtres pour imprimer'); return; }
      w.document.write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Badge BE+ · ' + esc((b.prenom || '') + ' ' + (b.nom || '')) + '</title><style>@page{size:A4;margin:12mm}body{margin:0;font-family:Arial,sans-serif;color:#10283A}.f{display:flex;gap:8mm;justify-content:center;margin-top:10mm}.f svg{width:54mm;height:85.6mm;outline:.2mm dashed #9aa}p{text-align:center;font-size:10pt;color:#555}</style></head><body>' +
        '<div class="f">' + recto(b, { style: css }) + verso(b, { style: css }) + '</div><p>Découpez le long des pointillés (format carte 54 × 85,6 mm) et pliez ou plastifiez recto contre verso.</p><script>setTimeout(function(){window.print()},700)<\/script></body></html>');
      w.document.close();
    });
  }

  // ---------------------------------------------------------------- photo : recadrage portrait 5:6, JPEG
  function photoDepuis(file) {
    return new Promise(function (ok, ko) {
      if (!file || !/^image\//.test(file.type)) { ko(new Error('Choisissez une image (JPEG, PNG, WebP…)')); return; }
      var rd = new FileReader();
      rd.onload = function () {
        var img = new Image();
        img.onload = function () {
          var tw = 400, th = 480, r = Math.max(tw / img.naturalWidth, th / img.naturalHeight), sw = tw / r, sh = th / r;
          var sx = (img.naturalWidth - sw) / 2, sy = Math.max(0, (img.naturalHeight - sh) * 0.35);
          var c = document.createElement('canvas'); c.width = tw; c.height = th; var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, tw, th);
          x.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th); ok(c.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = function () { ko(new Error('Image illisible')); }; img.src = rd.result;
      };
      rd.readAsDataURL(file);
    });
  }

  // ---------------------------------------------------------------- styles
  var CSS = '.cbb{position:fixed;inset:0;z-index:9600;background:' + BRUME + ';color:' + RADE + ';overflow:auto;-webkit-overflow-scrolling:touch;font-family:Mulish,Arial,sans-serif}' +
    '.cbb *{box-sizing:border-box}.cbb-top{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:.8rem;padding:calc(.7rem + env(safe-area-inset-top)) 1rem .7rem;background:' + RADE + ';color:#fff}' +
    '.cbb-top svg{height:26px;width:auto;flex:none}.cbb-tt{font-family:"League Spartan",sans-serif;font-weight:800;font-size:18px;letter-spacing:.3px;flex:1;min-width:0}.cbb-tt small{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:12.5px;letter-spacing:2px;color:' + SOLEIL + '}' +
    '.cbb-x{background:transparent;border:1px solid #47657a;color:#fff;min-height:40px;padding:0 .9rem;font-weight:700;cursor:pointer;font-size:14px}' +
    '.cbb-wrap{max-width:1100px;margin:0 auto;padding:1.2rem 1rem 4rem}.cbb-grid{display:flex;flex-wrap:wrap;gap:1.4rem;align-items:flex-start}' +
    '.cbb-form{flex:1 1 340px;min-width:0;background:#fff;border:1px solid #cfdadd;padding:1.1rem}.cbb-prev{flex:1 1 420px;min-width:0;position:sticky;top:76px}' +
    '.cbb-h{font-family:"League Spartan",sans-serif;font-weight:800;font-size:24px;margin:.1rem 0 .3rem}.cbb-sub{color:#4a5d6b;font-size:14.5px;line-height:1.45;margin:0 0 1rem}' +
    '.cbb-l{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:600;font-size:13.5px;letter-spacing:1.4px;text-transform:uppercase;margin:.75rem 0 .25rem;color:#3c5263}' +
    '.cbb-in{width:100%;min-height:44px;border:1px solid #b9c8cd;background:#fff;color:' + RADE + ';padding:.55rem .7rem;font:inherit;font-size:16px;border-radius:0}.cbb-in:focus{outline:2px solid ' + SOLEIL + ';outline-offset:1px}textarea.cbb-in{min-height:76px;resize:vertical}' +
    '.cbb-two{display:flex;gap:.6rem;flex-wrap:wrap}.cbb-two>div{flex:1 1 140px;min-width:0}.cbb-n{font-size:12.5px;color:#6a7c88;margin-top:.2rem}' +
    '.cbb-ph{display:flex;align-items:center;gap:.8rem}.cbb-ph img,.cbb-ph span.v{width:64px;height:77px;object-fit:cover;background:#d6e0e3;flex:none;display:block}' +
    '.cbb-btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;min-height:44px;padding:0 1rem;border:1px solid ' + RADE + ';background:#fff;color:' + RADE + ';font:inherit;font-weight:800;font-size:14.5px;cursor:pointer;border-radius:0}' +
    '.cbb-btn.pri{background:' + RADE + ';color:#fff}.cbb-btn.or{background:' + SOLEIL + ';border-color:' + SOLEIL + ';color:' + RADE + '}.cbb-btn.dan{border-color:#9b1c2b;color:#9b1c2b}.cbb-btn[disabled]{opacity:.5;cursor:default}' +
    '.cbb-row{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}.cbb-chips{display:flex;gap:.4rem;flex-wrap:wrap}.cbb-chip{min-height:40px;padding:0 .8rem;border:1px solid #b9c8cd;background:#fff;color:' + RADE + ';font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:.45rem}.cbb-chip[aria-pressed=true]{border-color:' + RADE + ';box-shadow:inset 0 0 0 1px ' + RADE + '}.cbb-chip i{width:16px;height:16px;display:inline-block;border:1px solid #0002}' +
    '.cbb-st{display:flex;gap:.7rem;align-items:flex-start;padding:.8rem .9rem;margin-bottom:1rem;border-left:5px solid #8fa6b4;background:#f3f6f6}.cbb-st b{display:block;font-family:"League Spartan",sans-serif;font-size:16px}.cbb-st span{font-size:14px;color:#4a5d6b}' +
    '.cbb-st.valide{border-color:' + VERT + ';background:#e7f2ec}.cbb-st.en_attente{border-color:' + SOLEIL + ';background:#fdf4e2}.cbb-st.correction,.cbb-st.refuse,.cbb-st.suspendu{border-color:#9b1c2b;background:#fbe9ea}' +
    '.cbb-faces{display:flex;gap:.8rem;justify-content:center}.cbb-face{flex:1 1 0;max-width:300px;min-width:0}.cbb-face svg{width:100%;height:auto;display:block;box-shadow:0 10px 30px #10283a33}.cbb-face p{text-align:center;font-family:"Barlow Condensed",sans-serif;font-weight:600;letter-spacing:1.5px;font-size:13px;margin:.45rem 0 0;color:#4a5d6b}' +
    '.cbb-links{margin-top:1rem;background:#fff;border:1px solid #cfdadd;padding:.8rem .9rem;font-size:14px;line-height:1.5}.cbb-links a{color:' + RADE + ';font-weight:700;word-break:break-all}' +
    '.cbb-note{background:#fff7e6;border:1px solid #f0d49a;padding:.8rem .9rem;font-size:14.5px;line-height:1.45;margin-bottom:1rem}' +
    '.cbb-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%) translateY(20px);background:' + RADE + ';color:#fff;padding:.7rem 1rem;font-weight:700;opacity:0;transition:.2s;z-index:9700;max-width:90vw}.cbb-toast.on{opacity:1;transform:translateX(-50%)}' +
    /* trombinoscope */
    '.cbt-bar{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1rem}.cbt-bar .cbb-in{flex:1 1 220px;width:auto}.cbt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:.8rem}' +
    '.cbt-c{background:#fff;border:1px solid #cfdadd;cursor:pointer;text-align:left;padding:0;font:inherit;color:inherit;display:flex;flex-direction:column}.cbt-c:hover{border-color:' + RADE + '}.cbt-c img,.cbt-c .v{width:100%;aspect-ratio:5/6;object-fit:cover;background:#d6e0e3;display:block;border-bottom:4px solid ' + SOLEIL + '}' +
    '.cbt-c div{padding:.55rem .65rem .7rem}.cbt-c b{display:block;font-family:"League Spartan",sans-serif;font-size:16px;line-height:1.15}.cbt-c small{display:block;font-family:"Barlow Condensed",sans-serif;font-weight:600;letter-spacing:1px;text-transform:uppercase;font-size:13px;color:#4a5d6b;margin-top:.2rem}' +
    '.cbt-fiche{display:flex;flex-wrap:wrap;gap:1.4rem;align-items:flex-start;background:#fff;border:1px solid #cfdadd;padding:1.1rem;margin-bottom:1.4rem}.cbt-fiche .cbb-face{flex:0 1 260px}.cbt-info{flex:1 1 280px;min-width:0}' +
    '.cbt-ok{display:inline-flex;gap:.45rem;align-items:center;background:#e7f2ec;color:' + VERT + ';font-weight:800;padding:.4rem .7rem;margin-bottom:.6rem}.cbt-ko{background:#fbe9ea;color:#9b1c2b}' +
    '@media (max-width:640px){.cbb-prev{position:static}.cbb-faces{gap:.5rem}.cbb-tt{font-size:16px}}';

  function cadre(titre, sous) {
    fermer();
    if (!document.getElementById('cbb-css')) document.head.appendChild(el('style', { id: 'cbb-css', text: CSS }));
    st = { root: el('div', { class: 'cbb', role: 'dialog', 'aria-modal': 'true', 'aria-label': titre, translate: 'no' }), toast: el('div', { class: 'cbb-toast', role: 'status', 'aria-live': 'polite' }) };
    var logoSvg = '<svg viewBox="0 0 190 87" aria-hidden="true">' + logo(0, 0, 87, '#FFFFFF') + '</svg>';
    add(st.root, el('div', { class: 'cbb-top' }, el('span', { html: logoSvg, style: 'display:flex' }), el('div', { class: 'cbb-tt' }, el('small', { text: sous }), titre), el('button', { type: 'button', class: 'cbb-x', onclick: function () { fermer(); } }, 'Fermer ✕')));
    st.body = el('div', { class: 'cbb-wrap' }); add(st.root, st.body);
    document.body.appendChild(st.root); document.body.appendChild(st.toast);
    document.documentElement.style.overflow = 'hidden';
    st.key = function (e) { if (e.key === 'Escape') fermer(); }; window.addEventListener('keydown', st.key);
    return st;
  }
  function fermer() {
    if (!st) return; window.removeEventListener('keydown', st.key);
    if (st.root) st.root.remove(); if (st.toast) st.toast.remove(); st = null; document.documentElement.style.overflow = '';
  }

  // ================================================================ MON BADGE
  function vide() {
    var u = A().user || {}, me = (window.CasaSite && window.CasaSite.state) || {};
    var nm = String((u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name)) || me.name || '').trim().split(/\s+/);
    var acc = A().acces || {};
    var club = acc.club && window.CASA_CLUBS ? (window.CASA_CLUBS.find(function (c) { return c.id === acc.club; }) || {}) : {};
    return { prenom: nm[0] || '', nom: nm.slice(1).join(' '), fonction: acc.role === 'correspondant' ? 'Correspondant de club' : acc.role === 'collaborateur' ? 'Chef d’édition' : acc.role === 'redacteur' ? 'Rédacteur' : 'Correspondant de club',
      club: club.name || '', discipline: club.sport || '', ville: club.city || '', presentation: '', photo: '', theme: 'maree', statut: 'brouillon' };
  }
  function ouvrir() {
    var a = A();
    var S = cadre('Mon badge BE+', 'ESPACE CORRESPONDANTS');
    if (!a.on || !a.user) {
      add(S.body, el('div', { class: 'cbb-form', style: 'max-width:560px;margin:0 auto' }, el('h1', { class: 'cbb-h', text: 'Connectez-vous pour créer votre badge' }),
        el('p', { class: 'cbb-sub', text: 'Le badge BE+ est réservé aux correspondants et aux personnes agréées par Casa Besports. Connectez-vous avec votre compte, puis revenez ici.' }),
        el('div', { class: 'cbb-row' }, el('button', { type: 'button', class: 'cbb-btn pri', onclick: function () { fermer(); if (window.CasaSite) window.CasaSite.setState({ loginOpen: true }); } }, 'Se connecter'),
          el('button', { type: 'button', class: 'cbb-btn', onclick: function () { trombinoscope(); } }, 'Voir le trombinoscope'))));
      return;
    }
    S.mode = 'mon'; S.b = vide(); S.etat = 'chargement'; dessinerMon();
    if (a.myAccess && !a.acces) a.myAccess().then(function (r) { a.acces = r || {}; if (st === S && S.etat === 'nouveau') { S.b = Object.assign(vide(), { photo: S.b.photo }); dessinerMon(); } }, function () {});
    db(function (c) { return c.from('badges_be').select('*').eq('user_id', a.user.id).maybeSingle(); }).then(function (r) {
      if (st !== S) return; S.etat = r ? 'ok' : 'nouveau'; if (r) S.b = r; S.orig = JSON.stringify(champs(S.b)); dessinerMon();
    }, function (e) { if (st !== S) return; S.etat = sqlManquant(e) ? 'sql' : 'erreur'; S.err = e && e.message; dessinerMon(); });
  }
  function champs(b) { return { prenom: (b.prenom || '').trim(), nom: (b.nom || '').trim(), fonction: (b.fonction || '').trim(), club: (b.club || '').trim(), discipline: (b.discipline || '').trim(), ville: (b.ville || '').trim(), presentation: (b.presentation || '').trim(), photo: b.photo || '', theme: b.theme || 'maree' }; }
  function envoyer(S, statut) {
    var a = A(), b = champs(S.b);
    if (statut === 'en_attente') {
      var manque = [!b.photo && 'une photo', !b.prenom && 'le prénom', !b.nom && 'le nom', !b.fonction && 'la fonction'].filter(Boolean);
      if (manque.length) { say('Ajoutez ' + manque.join(', ')); return; }
    }
    S.busy = true; dessinerMon();
    var row = Object.assign({ user_id: a.user.id, email: a.user.email ? String(a.user.email).toLowerCase() : null, statut: statut }, b);
    db(function (c) { return c.from('badges_be').upsert(row, { onConflict: 'user_id' }).select().single(); }).then(function (r) {
      if (st !== S) return; S.busy = false; S.b = r; S.etat = 'ok'; S.orig = JSON.stringify(champs(r)); dessinerMon();
      say(statut === 'en_attente' ? 'Badge envoyé à l’administrateur pour validation' : 'Brouillon enregistré');
    }, function (e) { if (st !== S) return; S.busy = false; if (sqlManquant(e)) S.etat = 'sql'; dessinerMon(); say(e && e.message ? e.message : 'Envoi impossible'); });
  }
  function dessinerMon() {
    var S = st; if (!S || S.mode !== 'mon') return;
    var y = S.root.scrollTop, b = S.b, body = S.body; body.textContent = '';
    if (S.etat === 'sql') add(body, el('div', { class: 'cbb-note' }, el('strong', { text: 'Une étape à faire une seule fois (administrateur). ' }), 'La base des badges n’est pas encore installée : Supabase › SQL Editor › New query, collez le fichier supabase/badges.sql, puis « Run ». Guide : docs/BADGES-BE.md.'));
    if (S.etat === 'erreur') add(body, el('div', { class: 'cbb-note', text: 'Badge non chargé : ' + (S.err || 'connexion impossible') + '. Vérifiez votre connexion puis rouvrez cette page.' }));
    var stt = STATUTS[b.statut] || STATUTS.brouillon, change = S.orig !== JSON.stringify(champs(b));
    var set = function (k) { return function (e) { S.b = Object.assign({}, S.b, (function () { var o = {}; o[k] = e.target.value; return o; })()); majApercu(); }; };
    var champ = function (k, label, extra) { return el('div', {}, el('label', { class: 'cbb-l', for: 'cbb-' + k, text: label }), el('input', Object.assign({ id: 'cbb-' + k, class: 'cbb-in', value: b[k] || '', oninput: set(k) }, extra || {}))); };
    var clubs = (window.CASA_CLUBS || []).map(function (c) { return c.name; }).filter(Boolean);
    var bloque = b.statut === 'suspendu';
    var form = el('div', { class: 'cbb-form' },
      el('h1', { class: 'cbb-h', text: 'Mon badge BE+' }),
      el('p', { class: 'cbb-sub', text: 'Remplissez votre badge, vérifiez l’aperçu puis envoyez-le à l’administrateur. Une fois validé, il reçoit son numéro, apparaît dans le trombinoscope et son QR code permet à tout le monde de vérifier qu’il est authentique.' }),
      el('div', { class: 'cbb-st ' + (b.statut || 'brouillon') }, el('div', {}, el('b', { text: stt[0] + (b.numero && b.statut === 'valide' ? ' · ' + b.numero : '') }), el('span', { text: b.note && b.statut !== 'valide' ? 'Message de l’administrateur : ' + b.note : stt[1] + (b.statut === 'valide' && b.expire_le ? ' Valable jusqu’au ' + fmtDate(b.expire_le) + '.' : '') }))),
      el('label', { class: 'cbb-l', text: 'Photo (visage bien visible, de face)' }),
      el('div', { class: 'cbb-ph' }, b.photo ? el('img', { src: b.photo, alt: '' }) : el('span', { class: 'v' }),
        el('label', { class: 'cbb-btn' }, b.photo ? 'Changer la photo' : 'Ajouter une photo', el('input', { type: 'file', accept: 'image/*', style: 'display:none', onchange: function (e) { var f = e.target.files && e.target.files[0]; e.target.value = ''; photoDepuis(f).then(function (u) { S.b = Object.assign({}, S.b, { photo: u }); dessinerMon(); }, function (er) { say(er.message); }); } }))),
      el('div', { class: 'cbb-two' }, champ('prenom', 'Prénom', { maxlength: 60, autocomplete: 'given-name' }), champ('nom', 'Nom', { maxlength: 60, autocomplete: 'family-name' })),
      el('div', {}, el('label', { class: 'cbb-l', for: 'cbb-fonction', text: 'Fonction' }), el('input', { id: 'cbb-fonction', class: 'cbb-in', list: 'cbb-fl', maxlength: 60, value: b.fonction || '', oninput: set('fonction') }), el('datalist', { id: 'cbb-fl' }, FONCTIONS.map(function (f) { return el('option', { value: f }); }))),
      el('div', {}, el('label', { class: 'cbb-l', for: 'cbb-club', text: 'Club ou structure' }), el('input', { id: 'cbb-club', class: 'cbb-in', list: 'cbb-cl', maxlength: 100, value: b.club || '', oninput: set('club') }), el('datalist', { id: 'cbb-cl' }, clubs.map(function (f) { return el('option', { value: f }); }))),
      el('div', { class: 'cbb-two' }, champ('discipline', 'Discipline', { maxlength: 60 }), champ('ville', 'Ville', { maxlength: 80 })),
      el('div', {}, el('label', { class: 'cbb-l', for: 'cbb-presentation', text: 'Présentation (trombinoscope)' }), el('textarea', { id: 'cbb-presentation', class: 'cbb-in', maxlength: 240, oninput: set('presentation') }, b.presentation || ''), el('div', { class: 'cbb-n', text: 'Une phrase sur vous, 240 caractères au plus. Pas de téléphone ni d’e-mail : le trombinoscope est public.' })),
      el('label', { class: 'cbb-l', text: 'Coloris' }),
      el('div', { class: 'cbb-chips' }, Object.keys(THEMES).map(function (k) { return el('button', { type: 'button', class: 'cbb-chip', 'aria-pressed': String((b.theme || 'maree') === k), onclick: function () { S.b = Object.assign({}, S.b, { theme: k }); dessinerMon(); } }, el('i', { style: 'background:' + THEMES[k].fond + ';box-shadow:inset 0 -6px 0 ' + THEMES[k].touche }), THEMES[k].label); })),
      el('div', { class: 'cbb-row' },
        el('button', { type: 'button', class: 'cbb-btn pri', disabled: S.busy || bloque || S.etat === 'sql' || (b.statut === 'en_attente' && !change), onclick: function () { envoyer(S, 'en_attente'); } }, b.statut === 'valide' ? (change ? 'Envoyer les modifications' : 'Badge validé ✓') : b.statut === 'en_attente' ? (change ? 'Renvoyer avec mes modifications' : 'En attente de validation') : 'Envoyer pour validation'),
        b.statut === 'brouillon' || !b.statut ? el('button', { type: 'button', class: 'cbb-btn', disabled: S.busy || S.etat === 'sql', onclick: function () { envoyer(S, 'brouillon'); } }, 'Enregistrer le brouillon') : null),
      b.statut === 'valide' && change ? el('p', { class: 'cbb-n', text: 'Attention : envoyer des modifications renvoie le badge en vérification. Il disparaît du trombinoscope jusqu’à la nouvelle validation.' }) : null);
    var prev = el('div', { class: 'cbb-prev' },
      el('div', { class: 'cbb-faces' }, el('div', { class: 'cbb-face' }, el('div', { class: 'cbb-r', html: recto(b) }), el('p', { text: 'RECTO' })), el('div', { class: 'cbb-face' }, el('div', { class: 'cbb-v', html: verso(b) }), el('p', { text: 'VERSO' }))),
      el('div', { class: 'cbb-row', style: 'justify-content:center' },
        el('button', { type: 'button', class: 'cbb-btn or', onclick: function () { telecharger(S.b, 'recto'); } }, 'Télécharger le recto'),
        el('button', { type: 'button', class: 'cbb-btn', onclick: function () { telecharger(S.b, 'verso'); } }, 'Télécharger le verso'),
        el('button', { type: 'button', class: 'cbb-btn', onclick: function () { imprimer(S.b); } }, 'Imprimer')),
      el('div', { class: 'cbb-links' }, el('strong', { text: 'Liens de votre badge' }), el('br'),
        'Recto · ', b.statut === 'valide' && b.numero ? el('a', { href: lienFiche(b.numero), target: '_blank', rel: 'noopener', text: court(lienFiche(b.numero)) }) : el('span', { text: 'votre fiche du trombinoscope (après validation)' }), el('br'),
        'Verso · ', el('a', { href: lienAppli(), target: '_blank', rel: 'noopener', text: court(lienAppli()) }), ' (application BE+, espace correspondants)', el('br'),
        el('button', { type: 'button', class: 'cbb-btn', style: 'margin-top:.6rem', onclick: function () { trombinoscope(); } }, 'Ouvrir le trombinoscope')));
    add(body, el('div', { class: 'cbb-grid' }, form, prev));
    S.root.scrollTop = y;
  }
  function majApercu() { var S = st; if (!S || !S.root) return; var r = S.root.querySelector('.cbb-r'), v = S.root.querySelector('.cbb-v'); if (r) r.innerHTML = recto(S.b); if (v) v.innerHTML = verso(S.b); }

  // ================================================================ TROMBINOSCOPE (public)
  function trombinoscope(numero) {
    var S = cadre('Trombinoscope', 'CORRESPONDANTS ET PERSONNES AGRÉÉES BE+');
    S.mode = 'trombi'; S.q = ''; S.sel = numero ? String(numero).trim().toUpperCase() : ''; S.liste = null; dessinerTrombi();
    var a = A();
    if (!a.on || !a.db) { S.liste = []; S.horsLigne = true; dessinerTrombi(); return; }
    db(function (c) { return c.rpc('trombinoscope'); }).then(function (l) { if (st !== S) return; S.liste = l || []; dessinerTrombi(); },
      function (e) { if (st !== S) return; S.liste = []; S.sql = sqlManquant(e); S.horsLigne = !S.sql; dessinerTrombi(); });
  }
  function dessinerTrombi() {
    var S = st; if (!S || S.mode !== 'trombi') return;
    var body = S.body; body.textContent = '';
    if (S.liste === null) { add(body, el('p', { class: 'cbb-sub', text: 'Chargement du trombinoscope…' })); return; }
    if (S.sql) add(body, el('div', { class: 'cbb-note', text: 'Le trombinoscope sera visible dès que l’administrateur aura lancé supabase/badges.sql dans Supabase.' }));
    if (S.horsLigne) add(body, el('div', { class: 'cbb-note', text: 'Trombinoscope indisponible pour le moment : vérifiez votre connexion internet.' }));
    if (S.sel) {
      var p = S.liste.find(function (x) { return String(x.numero).toUpperCase() === S.sel; });
      if (p) {
        add(body, el('div', { class: 'cbt-fiche' },
          el('div', { class: 'cbb-face', html: recto(Object.assign({ statut: 'valide' }, p)) }),
          el('div', { class: 'cbt-info' },
            el('div', { class: 'cbt-ok' }, '✓ Badge authentique et valide'),
            el('h1', { class: 'cbb-h', text: (p.prenom + ' ' + p.nom).trim() }),
            el('p', { class: 'cbb-sub', style: 'margin:.1rem 0 .6rem', text: [p.fonction, p.club, p.discipline, p.ville].filter(Boolean).join(' · ') }),
            p.presentation ? el('p', { text: p.presentation, style: 'line-height:1.5;margin:0 0 .8rem' }) : null,
            el('p', { class: 'cbb-n', text: 'Badge n° ' + p.numero + ' · agréé par Casa Besports le ' + fmtDate(p.valide_le) + (p.expire_le ? ' · valable jusqu’au ' + fmtDate(p.expire_le) : '') }),
            el('div', { class: 'cbb-row' },
              el('button', { type: 'button', class: 'cbb-btn pri', onclick: function () { S.sel = ''; dessinerTrombi(); } }, 'Tout le trombinoscope'),
              el('a', { class: 'cbb-btn or', href: lienAppli(), style: 'text-decoration:none' }, 'Application BE+ des correspondants')))));
      } else if (!S.sql && !S.horsLigne) {
        add(body, el('div', { class: 'cbt-fiche' }, el('div', { class: 'cbt-info' }, el('div', { class: 'cbt-ok cbt-ko' }, '✕ Badge non reconnu'),
          el('h1', { class: 'cbb-h', text: 'Le badge n° ' + S.sel + ' n’est pas valide' }),
          el('p', { class: 'cbb-sub', text: 'Ce numéro n’existe pas, a expiré ou a été suspendu par Casa Besports. En cas de doute, écrivez à la rédaction depuis la page Contact.' }),
          el('div', { class: 'cbb-row' }, el('button', { type: 'button', class: 'cbb-btn pri', onclick: function () { S.sel = ''; dessinerTrombi(); } }, 'Voir le trombinoscope')))));
      }
    }
    add(body, el('h1', { class: 'cbb-h', text: 'Le trombinoscope BE+' }),
      el('p', { class: 'cbb-sub', text: 'Les correspondants et personnes agréées par Casa Besports pour la saison. Chaque badge porte un QR code qui renvoie ici : si la personne apparaît, son badge est authentique.' }));
    var q = S.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    var l = S.liste.filter(function (p) { return !q || [p.prenom, p.nom, p.fonction, p.club, p.discipline, p.ville, p.numero].join(' ').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').indexOf(q) >= 0; });
    var inp = el('input', { class: 'cbb-in', type: 'search', placeholder: 'Rechercher un nom, un club, une discipline, un numéro…', value: S.q, 'aria-label': 'Rechercher dans le trombinoscope', oninput: function (e) { S.q = e.target.value; dessinerTrombi(); var n = st && st.root.querySelector('.cbt-bar input'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } } });
    add(body, el('div', { class: 'cbt-bar' }, inp, A().user ? el('button', { type: 'button', class: 'cbb-btn', onclick: function () { ouvrir(); } }, 'Mon badge') : null));
    if (!l.length) add(body, el('p', { class: 'cbb-sub', text: S.liste.length ? 'Aucun résultat.' : 'Aucun badge validé pour le moment.' }));
    add(body, el('div', { class: 'cbt-grid' }, l.map(function (p) {
      return el('button', { type: 'button', class: 'cbt-c', onclick: function () { S.sel = String(p.numero).toUpperCase(); dessinerTrombi(); S.root.scrollTop = 0; } },
        p.photo ? el('img', { src: p.photo, alt: '', loading: 'lazy' }) : el('span', { class: 'v' }),
        el('div', {}, el('b', { text: (p.prenom + ' ' + p.nom).trim() }), el('small', { text: [p.fonction, p.club].filter(Boolean).join(' · ') })));
    })));
  }

  // ---------------------------------------------------------------- liens d'entrée : /?badge=NUMÉRO, /?trombinoscope
  function depuisAdresse() {
    try {
      var q = new URLSearchParams(location.search), n = q.get('badge');
      if (n && /^[A-Z0-9-]{4,20}$/i.test(n)) setTimeout(function () { trombinoscope(n); }, 900);
      else if (q.has('trombinoscope')) setTimeout(function () { trombinoscope(); }, 900);
    } catch (e) {}
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', depuisAdresse); else depuisAdresse(); }

  return { ouvrir: ouvrir, trombinoscope: trombinoscope, fermer: fermer, recto: recto, verso: verso, telecharger: telecharger, imprimer: imprimer, THEMES: THEMES, STATUTS: STATUTS, fmtDate: fmtDate };
})();
