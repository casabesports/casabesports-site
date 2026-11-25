// Casa Besports — notifications du site et de l'application (Web Push).
// Déploiement : voir docs/NOTIFICATIONS.md (Supabase › Edge Functions › nom « notifications »,
// « Verify JWT » DÉSACTIVÉ : la fonction vérifie elle-même qui l'appelle).
// Tables : supabase/notifications.sql (à lancer avant).
// Secret facultatif : NOTIF_CONTACT = adresse e-mail transmise à Google / Apple / Mozilla en cas de problème
//                     (sinon EXPEDITEUR_EMAIL, déjà créé pour les e-mails).
//
// Actions (corps JSON { action: … }) :
//   cle       public  → { cle } : clé publique à donner au navigateur (créée au tout premier appel)
//   inscrire  public  → enregistre l'appareil qui vient d'accepter les notifications
//   retirer   public  → supprime un appareil (la personne a désactivé les notifications)
//   etat      admin   → nombre d'appareils inscrits + 20 derniers envois
//   envoyer   admin   → { titre, texte, lien, essai? } : envoie à tous les appareils (ou au seul appareil « essai »)
//   lineup    connecté → { envoi } : prévient les destinataires d'une composition envoyée (Casa Lineup),
//                       ou l'expéditeur quand on lui a répondu. Tables : supabase/lineups.sql
//   causerie  staff   → { causerie } : prévient les joueurs autorisés d'une causerie publiée (supabase/causeries.sql)
//   club      staff d'un club PRO → { club, section, titre, texte } : message à tout le club ou à une section
//                       (licenciés, parents, staff validés dans le Vestiaire). 5 messages par jour au plus. Tables : supabase/offres.sql
//   discussion connecté → { message } : prévient les membres d'une conversation du Club House selon le choix de chacun
//                       (tout, seulement si on le cite, rien). Tables : supabase/discussions-plus.sql
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as webpush from 'jsr:@negrel/webpush@0.5.0';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const URL_SB = Deno.env.get('SUPABASE_URL')!;
const service = createClient(URL_SB, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

// Seules les adresses des vrais services de notification sont acceptées (Google, Apple, Mozilla, Microsoft)
const SERVICES = /(^|\.)(googleapis\.com|push\.apple\.com|mozilla\.com|mozaws\.net|notify\.windows\.com)$/i;
function endpointValide(e: unknown): e is string {
  if (typeof e !== 'string' || e.length > 1000) return false;
  try { const u = new URL(e); return u.protocol === 'https:' && SERVICES.test(u.hostname); } catch { return false; }
}
const b64url = (s: unknown, max: number) => typeof s === 'string' && s.length > 0 && s.length <= max && /^[A-Za-z0-9_-]+=*$/.test(s);

// ---------- clés VAPID : créées une fois, gardées dans la table push_reglages ----------
let cache: { keys: CryptoKeyPair; publique: string } | null = null;
async function cles() {
  if (cache) return cache;
  const { data, error } = await service.from('push_reglages').select('cles, cle_publique').eq('id', 1).maybeSingle();
  if (error) throw new Error('Table push_reglages absente : lancez supabase/notifications.sql (' + error.message + ')');
  if (data) {
    cache = { keys: await webpush.importVapidKeys(data.cles as webpush.ExportedVapidKeys), publique: data.cle_publique };
    return cache;
  }
  const keys = await webpush.generateVapidKeys({ extractable: true });
  const exp = await webpush.exportVapidKeys(keys);
  const publique = await webpush.exportApplicationServerKey(keys);
  const ins = await service.from('push_reglages').insert({ id: 1, cles: exp, cle_publique: publique });
  if (ins.error) { // un autre appel les a créées au même instant : on relit
    cache = null;
    const again = await service.from('push_reglages').select('cles, cle_publique').eq('id', 1).single();
    if (again.error) throw new Error(again.error.message);
    cache = { keys: await webpush.importVapidKeys(again.data.cles as webpush.ExportedVapidKeys), publique: again.data.cle_publique };
    return cache;
  }
  cache = { keys, publique };
  return cache;
}

// Personne connectée sur le site (facultatif) et contrôle administrateur
function clientDe(req: Request) {
  return createClient(URL_SB, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }, auth: { persistSession: false } });
}
async function utilisateur(req: Request): Promise<string | null> {
  const t = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!t || !t.includes('.')) return null; // clé publique du site, pas un compte
  const { data } = await service.auth.getUser(t);
  return data?.user?.id ?? null;
}
async function estAdmin(req: Request) {
  const { data } = await clientDe(req).rpc('est_admin');
  return data === true;
}

// Envoie un message à une liste d'appareils, retire ceux qui n'existent plus
async function pousser(lignes: { endpoint: string; p256dh: string; auth: string }[], titre: string, texte: string, lien: string, tag?: string) {
  const contact = Deno.env.get('NOTIF_CONTACT') || Deno.env.get('EXPEDITEUR_EMAIL') || 'contact@casabesports.fr';
  const serveur = await webpush.ApplicationServer.new({ contactInformation: 'mailto:' + contact, vapidKeys: (await cles()).keys });
  const message = JSON.stringify({ title: titre, body: texte, url: lien, tag: tag || 'casa-' + Date.now().toString(36) });
  let envoyees = 0, echecs = 0; const perimes: string[] = []; const erreurs: string[] = [];
  for (let i = 0; i < lignes.length; i += 25) { // 25 appareils à la fois
    await Promise.all(lignes.slice(i, i + 25).map(async (s) => {
      try {
        await serveur.subscribe({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } })
          .pushTextMessage(message, { ttl: 86400, urgency: webpush.Urgency.High });
        envoyees++;
      } catch (e) {
        const st = (e as webpush.PushMessageError)?.response?.status;
        if (st === 404 || st === 410) perimes.push(s.endpoint); // appareil désinscrit : on le retire
        else { echecs++; if (erreurs.length < 3) erreurs.push(st ? 'code ' + st + ' ' + (await (e as webpush.PushMessageError).response.text().catch(() => '')).slice(0, 120) : String((e as Error)?.message || e)); }
      }
    }));
  }
  if (perimes.length) await service.from('push_abonnements').delete().in('endpoint', perimes);
  return { envoyees, echecs, perimes, erreurs };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  const body = await req.json().catch(() => ({}));
  const action = body?.action;

  try {
    if (action === 'cle') return json({ cle: (await cles()).publique });

    if (action === 'inscrire') {
      const a = body.abonnement || {};
      if (!endpointValide(a.endpoint) || !b64url(a.keys?.p256dh, 200) || !b64url(a.keys?.auth, 100)) return json({ error: 'Abonnement invalide' }, 400);
      const ligne: Record<string, unknown> = {
        endpoint: a.endpoint, p256dh: a.keys.p256dh, auth: a.keys.auth,
        langue: body.langue === 'en' ? 'en' : 'fr',
        appareil: typeof body.appareil === 'string' ? body.appareil.slice(0, 40) : null,
        user_id: await utilisateur(req), vu_le: new Date().toISOString(),
      };
      const { error } = await service.from('push_abonnements').upsert(ligne, { onConflict: 'endpoint' });
      if (error) return json({ error: 'Enregistrement impossible : ' + error.message }, 500);
      return json({ ok: true });
    }

    if (action === 'retirer') {
      if (!endpointValide(body.endpoint)) return json({ error: 'Adresse invalide' }, 400);
      await service.from('push_abonnements').delete().eq('endpoint', body.endpoint);
      return json({ ok: true });
    }

    // ----- Casa Lineup : une composition a été envoyée, ou on a répondu à un envoi -----
    if (action === 'lineup') {
      const moi = await utilisateur(req);
      if (!moi) return json({ error: 'Connexion requise' }, 401);
      const id = String(body.envoi ?? '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Envoi invalide' }, 400);
      const { data: e } = await service.from('lineup_envois').select('id, lineup_id, expediteur, expediteur_nom, dest_libelle, statut, repondu_par, repondu_nom, notifie').eq('id', id).maybeSingle();
      if (!e) return json({ ok: true, envoyees: 0 });
      let cibles: string[] = []; let titre = ''; let texte = '';
      if (e.statut === 'envoye' && e.expediteur === moi && e.notifie !== 'envoye') {
        const { data } = await service.rpc('lineup_destinataires', { e: id });
        cibles = ((data ?? []) as string[]).filter((u) => u && u !== moi);
        titre = 'Nouvelle composition reçue';
        texte = (e.expediteur_nom || 'Quelqu’un') + ' vous a envoyé une composition. Ouvrez-la pour l’accepter, la refuser ou proposer une modification.';
      } else if (e.statut !== 'envoye' && e.repondu_par === moi && e.notifie !== e.statut) {
        cibles = e.expediteur && e.expediteur !== moi ? [e.expediteur] : [];
        const mot = e.statut === 'accepte' ? 'a accepté' : e.statut === 'refuse' ? 'a refusé' : 'propose une modification de';
        titre = 'Réponse à votre composition';
        texte = (e.repondu_nom || e.dest_libelle || 'Le destinataire') + ' ' + mot + ' votre composition.';
      } else return json({ ok: true, envoyees: 0 });
      await service.from('lineup_envois').update({ notifie: e.statut }).eq('id', id); // une seule notification par étape
      if (!cibles.length) return json({ ok: true, envoyees: 0 });
      const { data: appareils } = await service.from('push_abonnements').select('endpoint, p256dh, auth').in('user_id', cibles.slice(0, 500)).limit(5000);
      const r = await pousser(appareils ?? [], titre, texte, '/?compo=' + e.lineup_id + '&envoi=' + e.id);
      return json({ ok: true, envoyees: r.envoyees });
    }

    // ----- Causeries du Vestiaire : le coach publie, les joueurs autorisés sont prévenus (une seule fois) -----
    if (action === 'causerie') {
      const moi = await utilisateur(req);
      if (!moi) return json({ error: 'Connexion requise' }, 401);
      const id = String(body.causerie ?? '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Causerie invalide' }, 400);
      const { data: z } = await service.from('causeries').select('id, club, titre, statut, notifier, notifie, ouvre_le, auteur_nom').eq('id', id).maybeSingle();
      if (!z || z.statut !== 'publie' || !z.notifier || z.notifie) return json({ ok: true, envoyees: 0 });
      const { data: staff } = await clientDe(req).rpc('vs_staff', { c: z.club });
      if (staff !== true) return json({ error: 'Réservé au staff du club' }, 403);
      await service.from('causeries').update({ notifie: true }).eq('id', id);
      const { data } = await service.rpc('cz_destinataires', { cid: id });
      const cibles = ((data ?? []) as string[]).filter((u) => u && u !== moi);
      if (!cibles.length) return json({ ok: true, envoyees: 0 });
      const ouvre = z.ouvre_le && new Date(z.ouvre_le).getTime() > Date.now()
        ? ' Lisible à partir du ' + new Date(z.ouvre_le).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) + '.' : '';
      const { data: appareils } = await service.from('push_abonnements').select('endpoint, p256dh, auth').in('user_id', cibles.slice(0, 500)).limit(5000);
      const r = await pousser(appareils ?? [], 'La causerie est arrivée', (z.auteur_nom ? 'Coach ' + z.auteur_nom + ' : ' : '') + String(z.titre).slice(0, 80) + '.' + ouvre, '/?causerie=' + z.id + '&club=' + encodeURIComponent(z.club));
      return json({ ok: true, envoyees: r.envoyees });
    }

    // ----- Discussions du Club House : un message vient d'être écrit, on prévient les membres qui l'ont choisi -----
    if (action === 'discussion') {
      const moi = await utilisateur(req);
      if (!moi) return json({ error: 'Connexion requise' }, 401);
      const id = String(body.message ?? '');
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Message invalide' }, 400);
      const { data: m } = await service.from('discussions_messages').select('id, groupe_id, user_id, auteur, texte, pieces, notifie').eq('id', id).maybeSingle();
      if (!m || m.user_id !== moi || m.notifie) return json({ ok: true, envoyees: 0 }); // seul l'auteur prévient, une seule fois
      const { data: g } = await service.from('discussions_groupes').select('id, nom, type').eq('id', m.groupe_id).maybeSingle();
      if (!g) return json({ ok: true, envoyees: 0 });
      const { data, error } = await service.rpc('dc_destinataires', { mid: id });
      if (error) return json({ error: 'Notifications des discussions pas encore installées (supabase/discussions-plus.sql).' }, 501);
      const cibles = ((data ?? []) as string[]).filter((u) => u && u !== moi);
      if (!cibles.length) return json({ ok: true, envoyees: 0 });
      const pieces = Array.isArray(m.pieces) ? m.pieces.length : 0;
      const contenu = String(m.texte || '').trim() || (pieces > 1 ? '📎 ' + pieces + ' pièces jointes' : '📎 Pièce jointe');
      const auteur = m.auteur || 'Un membre';
      const titre = g.type === 'prive' ? auteur + ' (message privé)' : String(g.nom).slice(0, 60);
      const texte = (g.type === 'prive' ? '' : auteur + ' : ') + contenu.slice(0, 140);
      const { data: appareils } = await service.from('push_abonnements').select('endpoint, p256dh, auth').in('user_id', cibles.slice(0, 1000)).limit(5000);
      const r = await pousser(appareils ?? [], titre, texte, '/?discussion=' + g.id, 'dc-' + g.id);
      return json({ ok: true, envoyees: r.envoyees });
    }

    // ----- Club PRO : le staff envoie un message à tout le club (ou à une section) -----
    if (action === 'club') {
      const moi = await utilisateur(req);
      if (!moi) return json({ error: 'Connexion requise' }, 401);
      const club = String(body.club ?? '').slice(0, 60);
      const section = ['club', 'seniors', 'jeunes'].includes(body.section) ? body.section : 'club';
      const titre = String(body.titre ?? '').trim().slice(0, 80);
      const texte = String(body.texte ?? '').trim().slice(0, 240);
      if (!club || !titre) return json({ error: 'Le titre est obligatoire' }, 400);
      const { data: staff } = await clientDe(req).rpc('vs_staff', { c: club });
      if (staff !== true) return json({ error: 'Réservé au staff du club' }, 403);
      const { data: pro, error: ePro } = await service.rpc('club_pro_actif', { c: club });
      if (ePro) return json({ error: 'Club PRO n’est pas encore installé (supabase/offres.sql).' }, 501);
      if (pro !== true) return json({ error: 'Le message à tout le club fait partie de Club PRO.' }, 403);
      const hier = new Date(Date.now() - 86400000).toISOString();
      const { count } = await service.from('notifications_envoyees').select('id', { count: 'exact', head: true }).eq('par', moi).gte('cree_le', hier);
      if ((count ?? 0) >= 5) return json({ error: 'Cinq messages envoyés ces dernières 24 heures : réessayez demain.' }, 429);
      const { data } = await service.rpc('club_destinataires', { c: club, sec: section });
      const cibles = ((data ?? []) as string[]).filter((u) => u && u !== moi);
      const lien = '/#/vestiaire/' + encodeURIComponent(club);
      let r = { envoyees: 0, echecs: 0, perimes: [] as unknown[] };
      if (cibles.length) {
        const { data: appareils } = await service.from('push_abonnements').select('endpoint, p256dh, auth').in('user_id', cibles.slice(0, 2000)).limit(10000);
        r = await pousser(appareils ?? [], titre, texte, lien);
      }
      await service.from('notifications_envoyees').insert({ titre: '[' + club + '] ' + titre, texte: texte || null, lien, essai: false, envoyees: r.envoyees, echecs: r.echecs, retirees: r.perimes.length, par: moi });
      return json({ ok: true, envoyees: r.envoyees });
    }

    // ----- réservé à l'administrateur -----
    if (!(await estAdmin(req))) return json({ error: 'Réservé à l’administrateur' }, 403);

    if (action === 'etat') {
      const { count } = await service.from('push_abonnements').select('endpoint', { count: 'exact', head: true });
      const { data: parAppareil } = await service.from('push_abonnements').select('appareil').limit(20000);
      const appareils: Record<string, number> = {};
      (parAppareil ?? []).forEach((r) => { const k = String(r.appareil || 'Autre').replace(/ \(appli\)$/, ''); appareils[k] = (appareils[k] || 0) + 1; });
      const { data: envois } = await service.from('notifications_envoyees').select('*').order('cree_le', { ascending: false }).limit(20);
      return json({ inscrits: count ?? 0, appareils, envois: envois ?? [] });
    }

    if (action === 'envoyer') {
      const titre = String(body.titre ?? '').trim().slice(0, 80);
      const texte = String(body.texte ?? '').trim().slice(0, 240);
      let lien = String(body.lien ?? '').trim().slice(0, 500) || '/';
      if (!titre) return json({ error: 'Le titre est obligatoire' }, 400);
      if (!/^(https:\/\/|\/)/.test(lien)) lien = '/' + lien.replace(/^\/+/, '');
      const essai = typeof body.essai === 'string' ? body.essai : null;
      if (essai !== null && !endpointValide(essai)) return json({ error: 'Cet appareil n’a pas activé les notifications' }, 400);

      let q = service.from('push_abonnements').select('endpoint, p256dh, auth, langue');
      if (essai) q = q.eq('endpoint', essai);
      const { data: liste, error } = await q.limit(50000);
      if (error) return json({ error: error.message }, 500);
      if (essai && !(liste ?? []).length) return json({ error: 'Cet appareil n’est pas inscrit : touchez d’abord « Activer les notifications » sur le site.' }, 400);

      const { envoyees, echecs, perimes, erreurs } = await pousser(liste ?? [], titre, texte, lien);
      await service.from('notifications_envoyees').insert({ titre, texte: texte || null, lien, essai: !!essai, envoyees, echecs, retirees: perimes.length, par: await utilisateur(req) });
      return json({ ok: true, envoyees, echecs, retirees: perimes.length, erreurs });
    }

    return json({ error: 'Action inconnue' }, 400);
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
