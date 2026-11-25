/*!
 * Casa Besports — « Partager sur mes réseaux » (rédacteurs, correspondants de club, administrateur).
 *
 * L'auteur d'un article choisit :
 *   • l'image d'aperçu (image de une, photo du texte, médiathèque ou sa propre photo), avec ou sans le bandeau BE+ ;
 *   • si la lecture est gratuite pour tous ou réservée aux abonnés BE+ ;
 *   • le texte de sa publication (proposé automatiquement, modifiable).
 * Le lien mène à l'article sur le site (/actualites/<article>). La fonction Cloudflare functions/[[path]].js écrit
 * dans la page le titre, le chapeau et l'image choisie : c'est cet aperçu que Facebook, LinkedIn, WhatsApp… affichent,
 * et un clic dessus ouvre l'article (gratuit, ou réservé aux abonnés selon le choix).
 *
 * Enregistrement : tant que l'article est en brouillon ou en corrections, avec l'article (supabase/redaction.sql) ;
 * après l'envoi en relecture ou la publication, par la fonction article_partage (supabase/partage.sql).
 */
var CasaPartage = (function () {
  'use strict';

  var CAMPAGNE = 'partage-redaction';
  var esc = function (s) { return String(s == null ? '' : s); };
  var clip = function (s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
  var origin = function () { try { return /^https?:/.test(location.protocol) ? location.origin : 'https://casabesports.pages.dev'; } catch (e) { return 'https://casabesports.pages.dev'; } };
  function urlOf(id, source, medium) {
    return origin() + '/actualites/' + encodeURIComponent(id) + (source ? '?utm_source=' + source + '&utm_medium=' + (medium || 'social') + '&utm_campaign=' + CAMPAGNE : '');
  }
  function enLigne(p) {
    if (!p) return false;
    if (p.status === 'published' || p.online) return true;
    return p.status === 'scheduled' && p.schedule && new Date(p.schedule).getTime() <= Date.now();
  }
  function hashtags(p) {
    var t = ['#CasaBesports', '#BEplus'];
    var sp = String(p.sport || '').replace(/[^A-Za-zÀ-ÿ0-9]/g, '');
    if (sp && sp !== 'Autre') t.push('#' + sp);
    t.push('#Cotentin');
    return t.join(' ');
  }
  function texteParDefaut(p) {
    var lignes = [esc(p.title).trim()];
    if (String(p.dek || '').trim()) lignes.push('', clip(p.dek, 260));
    lignes.push('', (p.premium ? '🔒 Réservé aux abonnés BE+ · ' : '') + '👉 À lire sur BE+ : ' + urlOf(p.id, 'reseaux'));
    lignes.push('', hashtags(p));
    return lignes.join('\n');
  }
  // Toutes les images utilisables : une, photos du texte (![légende](image)), médiathèque
  function images(p, lib) {
    var out = [], vu = {};
    var add = function (src, label, kind) { if (!src || vu[src]) return; vu[src] = 1; out.push({ src: src, label: label, kind: kind }); };
    add(p.img, 'Image de une', 'une');
    var re = /!\[([^\]]*)\]\(([^)\s]+)\)/g, m;
    while ((m = re.exec(String(p.body || '')))) add(m[2], m[1] || 'Photo du texte', 'corps');
    (lib || []).forEach(function (x) { add(x.src, x.label, 'lib'); });
    return out;
  }

  /* ---------- Visuel : photo + bandeau BE+ (titre, « à lire sur BE+ »), dessiné dans un canevas ---------- */
  var logoP = null;
  function logo() {
    if (logoP) return logoP;
    logoP = new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = 'assets/logo-be.svg'; });
    return logoP;
  }
  function charger(src) {
    return new Promise(function (ok, ko) {
      var i = new Image();
      if (/^https?:/.test(src) && src.indexOf(origin()) !== 0) i.crossOrigin = 'anonymous';
      i.onload = function () { ok(i); }; i.onerror = ko; i.src = src;
    });
  }
  function lignesTitre(g, t, max, n) {
    var mots = String(t || '').split(/\s+/), l = [], cur = '';
    mots.forEach(function (w) { var essai = cur ? cur + ' ' + w : w; if (g.measureText(essai).width > max && cur) { l.push(cur); cur = w; } else cur = essai; });
    if (cur) l.push(cur);
    if (l.length > n) { l = l.slice(0, n); l[n - 1] = l[n - 1].replace(/\s*\S*$/, '') + '…'; }
    return l;
  }
  // format : 'lien' 1200×630 (aperçu Facebook, LinkedIn…), 'post' 1080×1350 (Instagram), 'story' 1080×1920
  function composer(src, p, format, bandeau) {
    var dims = { lien: [1200, 630], post: [1080, 1350], story: [1080, 1920] }[format] || [1200, 630];
    var W = dims[0], H = dims[1];
    var polices = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('800 64px "League Spartan"'), document.fonts.load('600 24px "League Spartan"')]).catch(function () {}) : Promise.resolve();
    return Promise.all([charger(src), logo(), polices]).then(function (r) {
      var img = r[0], lg = r[1];
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var g = cv.getContext('2d');
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      var k = Math.max(W / img.naturalWidth, H / img.naturalHeight), iw = img.naturalWidth * k, ih = img.naturalHeight * k;
      g.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
      if (bandeau) {
        var gr = g.createLinearGradient(0, H * .35, 0, H);
        gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.55, 'rgba(0,0,0,.72)'); gr.addColorStop(1, 'rgba(0,0,0,.92)');
        g.fillStyle = gr; g.fillRect(0, 0, W, H);
        var m = Math.round(W * .055), fs = Math.round(W * (format === 'lien' ? .052 : .074));
        g.font = '800 ' + fs + 'px "League Spartan", "Arial Black", sans-serif'; g.textBaseline = 'alphabetic';
        var l = lignesTitre(g, p.title, W - 2 * m, format === 'lien' ? 2 : 4);
        var y = H - m - Math.round(fs * .2);
        // étiquette (comme .bn-etiq du site) : « À lire sur BE+ » ou « Réservé aux abonnés BE+ »
        var et = (p.premium ? 'Réservé aux abonnés BE+' : 'À lire sur BE+').toUpperCase(), efs = Math.round(fs * .42);
        var yTitre = y - (l.length - 1) * fs * 1.02;
        g.font = '700 ' + efs + 'px "League Spartan", "Arial Black", sans-serif';
        var ew = g.measureText(et).width + efs * 1.4, eh = efs * 2, ey = yTitre - fs * .95 - eh;
        g.fillStyle = '#fff'; g.fillRect(m, ey, ew, eh);
        g.fillStyle = '#000'; g.fillText(et, m + efs * .7, ey + eh * .68);
        g.font = '800 ' + fs + 'px "League Spartan", "Arial Black", sans-serif'; g.fillStyle = '#fff';
        l.forEach(function (t, i) { g.fillText(t, m, yTitre + i * fs * 1.02); });
        if (lg) { var lw = Math.round(W * (format === 'lien' ? .12 : .17)), lh = lw * 179 / 300; g.drawImage(lg, W - m - lw, m * .8, lw, lh); }
      }
      return cv.toDataURL('image/jpeg', .84);
    });
  }
  // Photo envoyée depuis l'appareil : JPEG de 1600 px au plus
  function lireFichier(file) {
    return new Promise(function (ok, ko) {
      var rd = new FileReader(); rd.onerror = ko;
      rd.onload = function () { charger(rd.result).then(function (img) { var k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight)); var cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * k); cv.height = Math.round(img.naturalHeight * k); var g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height); ok(cv.toDataURL('image/jpeg', .84)); }, ko); };
      rd.readAsDataURL(file);
    });
  }
  function dataVersFichier(data, nom) {
    var m = data.split(','), bin = atob(m[1]), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new File([u], nom, { type: 'image/jpeg' });
  }
  function telecharger(data, nom) { var a = document.createElement('a'); a.href = data; a.download = nom; document.body.appendChild(a); a.click(); a.remove(); }
  function copier(t) { try { return navigator.clipboard.writeText(t).then(function () { return true; }, function () { return false; }); } catch (e) { return Promise.resolve(false); } }
  var ouvrir = function (u) { try { window.open(u, '_blank', 'noopener'); } catch (e) { location.href = u; } };

  /* ---------- État de la fenêtre (app.state.shr) ---------- */
  function U(app) { return app.state.shr || {}; }
  function ui(app, patch) { app.setState({ shr: Object.assign({}, U(app), patch) }); }
  function postOf(app, id) { return (app.posts() || []).find(function (p) { return p.id === id; }) || null; }
  function open(app, id) {
    var p = postOf(app, id); if (!p) return;
    var cur = p.partage && p.partage.img;
    app.setState({ shr: { id: id, bandeau: !!(p.partage && p.partage.bandeau), sel: (p.partage && p.partage.src) || p.img || '', apercu: cur || p.img || '', texte: null, msg: '' } });
  }
  // Enregistre le choix dans l'article : directement en brouillon, par article_partage ensuite
  function enregistrer(app, p, patch, quoi) {
    var modifiable = ['draft', 'corrections'].indexOf(p.status) >= 0 && (app.state.role === 'admin' || app.rxMine(p));
    if (modifiable || !app.rxApi()) { app.setPost(p.id, patch, quoi); ui(app, { msg: 'Enregistré' }); return Promise.resolve(); }
    var A = app.rxApi();
    ui(app, { msg: 'Enregistrement…' });
    return A.db(function (c) { return c.rpc('article_partage', { p_id: p.id, p_img: patch.partage !== undefined ? (patch.partage && patch.partage.img) || '' : null, p_premium: patch.premium !== undefined ? !!patch.premium : null }); }).then(function () {
      // mise à jour locale, sans renvoyer l'article (Supabase refuserait : il n'est plus en brouillon)
      var posts = app.posts().map(function (x) { if (x.id !== p.id) return x; var n = Object.assign({}, x, patch); if (x.online) n.online = Object.assign({}, x.online, patch); return n; });
      app._rxApplying = true; app.setState({ posts: posts }); app._rxApplying = false;
      var n = posts.find(function (x) { return x.id === p.id; });
      if (app._rxSaved && n) app._rxSaved[p.id] = JSON.stringify(app.rxRow(n));
      ui(app, { msg: 'Enregistré' });
    }, function (e) {
      var sql = /article_partage|function|schema cache/i.test(e && e.message || '');
      ui(app, { msg: sql ? (app.state.role === 'admin' ? 'Article déjà envoyé : lancez d’abord supabase/partage.sql pour que ce choix soit enregistré.' : 'Ce choix ne peut pas encore être enregistré : réessayez plus tard.') : 'Non enregistré : ' + (e && e.message || 'erreur') });
    });
  }
  function refaire(app) {
    var u = U(app), p = postOf(app, u.id); if (!p || !u.sel) return;
    var fin = function (img) { ui(app, { apercu: img, busy: false }); enregistrer(app, p, { partage: { img: img, src: /^data:/.test(u.sel) ? '' : u.sel, bandeau: !!u.bandeau } }); };
    if (!u.bandeau) { fin(u.sel); return; }
    ui(app, { busy: true });
    composer(u.sel, p, 'lien', true).then(fin, function () { ui(app, { busy: false, bandeau: false }); app.say('Cette image ne peut pas recevoir le bandeau BE+ : elle est utilisée telle quelle'); fin(u.sel); });
  }

  /* ---------- Valeurs du gabarit ---------- */
  var RESEAUX = [
    { id: 'facebook', nom: 'Facebook', lien: true, note: 'Aperçu cliquable : image + titre ouvrent l’article' },
    { id: 'linkedin', nom: 'LinkedIn', lien: true, note: 'Aperçu cliquable : image + titre ouvrent l’article' },
    { id: 'x', nom: 'X', lien: true, note: 'Aperçu cliquable sous votre texte' },
    { id: 'whatsapp', nom: 'WhatsApp', lien: true, note: 'Lien cliquable avec aperçu' },
    { id: 'telegram', nom: 'Telegram', lien: true, note: 'Lien cliquable avec aperçu' },
    { id: 'instagram', nom: 'Instagram', lien: false, note: 'Lien non cliquable sous une publication : mettez-le dans la bio ou en story (sticker « Lien »)' },
    { id: 'tiktok', nom: 'TikTok', lien: false, note: 'Lien non cliquable sous une vidéo ou une photo : lien dans la bio, si votre compte y a droit' }
  ];
  function vals(app, ctx) {
    var u = U(app);
    if (!u.id) return { open: false };
    var p = postOf(app, u.id);
    if (!p) return { open: false };
    var on = enLigne(p), texte = u.texte == null ? texteParDefaut(p) : u.texte;
    var imgs = images(p, ctx && ctx.libImgs).map(function (x) {
      var sel = x.src === u.sel;
      return { src: x.src, label: x.label, sel: sel ? 'true' : 'false', kind: x.kind === 'une' ? 'Une' : x.kind === 'corps' ? 'Texte' : '', hasKind: x.kind !== 'lib', pick: function () { ui(app, { sel: x.src }); setTimeout(function () { refaire(app); }, 0); } };
    });
    if (u.perso && !imgs.some(function (x) { return x.src === u.perso; })) imgs.unshift({ src: u.perso, label: 'Ma photo', kind: 'Ma photo', hasKind: true, sel: u.sel === u.perso ? 'true' : 'false', pick: function () { ui(app, { sel: u.perso }); setTimeout(function () { refaire(app); }, 0); } });
    var partager = function (r) {
      return function () {
        if (!on) { app.say('Le lien fonctionnera dès que l’article sera publié'); return; }
        var url = urlOf(p.id, r.id), txt = texte;
        var sansLien = txt.replace(/\s*👉[^\n]*\n?/, '\n').trim();
        if (r.id === 'facebook') { copier(txt); ouvrir('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)); app.say('Texte copié : collez-le dans votre publication Facebook'); return; }
        if (r.id === 'linkedin') { copier(txt); ouvrir('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)); app.say('Texte copié : collez-le dans votre publication LinkedIn'); return; }
        if (r.id === 'x') { ouvrir('https://twitter.com/intent/tweet?text=' + encodeURIComponent(clip(sansLien, 220)) + '&url=' + encodeURIComponent(url)); return; }
        if (r.id === 'whatsapp') { ouvrir('https://wa.me/?text=' + encodeURIComponent(sansLien + '\n\n' + url)); return; }
        if (r.id === 'telegram') { ouvrir('https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(sansLien)); return; }
        // Instagram, TikTok : image + légende copiée, lien à placer dans la bio
        var legende = sansLien + '\n\nLien dans la bio 👆';
        copier(legende);
        ui(app, { busy: true });
        composer(u.sel || p.img, p, 'post', true).then(function (img) {
          ui(app, { busy: false });
          var f = dataVersFichier(img, 'be-plus-' + p.id + '.jpg');
          if (navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], text: legende }).catch(function () {}); app.say('Légende copiée : collez-la dans ' + r.nom); }
          else { telecharger(img, 'be-plus-' + p.id + '-publication.jpg'); app.say('Image téléchargée et légende copiée pour ' + r.nom); }
        }, function () { ui(app, { busy: false }); app.say('Image indisponible'); });
      };
    };
    var dl = function (format, nom) { return function () { ui(app, { busy: true }); composer(u.sel || p.img, p, format, true).then(function (img) { ui(app, { busy: false }); telecharger(img, 'be-plus-' + p.id + '-' + nom + '.jpg'); }, function () { ui(app, { busy: false }); app.say('Image indisponible'); }); }; };
    var apercu = u.apercu || u.sel || p.img || '';
    return {
      open: true, close: function () { app.setState({ shr: null }); },
      title: p.title || '(Sans titre)', dek: clip(p.dek, 160), host: origin().replace(/^https?:\/\//, ''),
      apercu: apercu, hasApercu: !!apercu, busy: !!u.busy, msg: u.msg || '', hasMsg: !!u.msg,
      enLigne: on, pasEnLigne: !on,
      etat: on ? 'Article en ligne : le lien est prêt.' : 'Pas encore publié : préparez votre visuel et votre texte, le lien s’ouvrira dès la publication par l’administrateur.',
      imgs: imgs,
      bandeau: !!u.bandeau, bandeauTxt: '· le titre, le logo et « ' + (p.premium ? 'Réservé aux abonnés BE+' : 'À lire sur BE+') + ' » posés sur la photo',
      toggleBandeau: function () { ui(app, { bandeau: !u.bandeau }); setTimeout(function () { refaire(app); }, 0); },
      onFile: function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; e.target.value = ''; ui(app, { busy: true }); lireFichier(f).then(function (d) { ui(app, { perso: d, sel: d, busy: false }); setTimeout(function () { refaire(app); }, 0); }, function () { ui(app, { busy: false }); app.say('Image illisible'); }); },
      gratuit: p.premium ? 'false' : 'true', abonnes: p.premium ? 'true' : 'false', premium: !!p.premium,
      setGratuit: function () { if (!p.premium) return; enregistrer(app, p, { premium: false }, 'Lecture gratuite pour tous.').then(function () { if (U(app).bandeau) setTimeout(function () { refaire(app); }, 0); }); },
      setAbonnes: function () { if (p.premium) return; enregistrer(app, p, { premium: true }, 'Lecture réservée aux abonnés BE+.').then(function () { if (U(app).bandeau) setTimeout(function () { refaire(app); }, 0); }); },
      accesTxt: p.premium ? 'Les lecteurs voient le début de l’article, puis l’offre BE+ pour lire la suite.' : 'Tout le monde peut lire l’article en entier, sans compte.',
      texte: texte, onTexte: function (e) { ui(app, { texte: e.target.value }); }, resetTexte: function () { ui(app, { texte: null }); },
      copierTexte: function () { copier(texte).then(function (ok) { app.say(ok ? 'Texte copié' : 'Copie impossible : sélectionnez le texte'); }); },
      lien: urlOf(p.id, 'reseaux'), lienBio: urlOf(p.id, 'instagram', 'bio'),
      copierLien: function () { copier(urlOf(p.id, 'reseaux')).then(function (ok) { app.say(ok ? 'Lien copié' : urlOf(p.id, 'reseaux')); }); },
      copierBio: function () { copier(urlOf(p.id, 'instagram', 'bio')).then(function (ok) { app.say(ok ? 'Lien pour la bio copié' : urlOf(p.id, 'instagram', 'bio')); }); },
      reseaux: RESEAUX.map(function (r) { return { nom: r.nom, note: r.note, cls: r.lien ? 'is-lien' : 'is-bio', badge: r.lien ? 'Lien cliquable' : 'Lien en bio', go: partager(r), off: on ? 'false' : 'true' }; }),
      dlPost: dl('post', 'publication'), dlStory: dl('story', 'story'), dlLien: dl('lien', 'apercu')
    };
  }

  return { open: open, vals: vals, urlOf: urlOf, enLigne: enLigne, composer: composer, texteParDefaut: texteParDefaut };
})();
