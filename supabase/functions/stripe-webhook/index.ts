// Casa Besports — Stripe prévient le site à chaque paiement (abonnement, renouvellement, résiliation, commande).
// Déploiement : voir docs/PAIEMENTS.md (Supabase › Edge Functions › nom « stripe-webhook », « Verify JWT » DÉSACTIVÉ).
// Secrets à créer dans Supabase › Edge Functions › Secrets :
//   STRIPE_SECRET_KEY       clé secrète Stripe (la même que pour la fonction « paiement »)
//   STRIPE_WEBHOOK_SECRET   « secret de signature » du webhook (whsec_…), affiché par Stripe à la création du webhook
// E-mail de bienvenue aux nouveaux abonnés (facultatif, mêmes secrets que la messagerie) :
//   BREVO_API_KEY, EXPEDITEUR_EMAIL, EXPEDITEUR_NOM (facultatif), REPONSE_EMAIL (facultatif), SITE_URL
// Événements à cocher chez Stripe : checkout.session.completed, checkout.session.async_payment_succeeded,
//   customer.subscription.updated, customer.subscription.deleted
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { httpClient: Stripe.createFetchHttpClient() });
const crypto = Stripe.createSubtleCryptoProvider();
const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
const eur = (c: number | null | undefined) => (Number(c || 0) / 100).toFixed(2).replace('.', ',') + ' €';
const ts = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

// Fin de la période payée (selon la version de l'API Stripe, la date est sur l'abonnement ou sur sa ligne)
const finDe = (sub: any) => ts(sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end);

// Avis dans la messagerie de l'espace administrateur
async function avis(sujet: string, message: string, nom?: string | null, email?: string | null) {
  await sb.from('messages').insert({ source: 'Paiement', sujet, message, nom: nom || null, email: email || null });
}

// ---------- E-mail de bienvenue (Brevo) ----------
const SITE = (Deno.env.get('SITE_URL') || 'https://casabesports.pages.dev').replace(/\/$/, '');
const esc = (t: string) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const prenomDe = (n?: string | null) => String(n || '').trim().split(/\s+/)[0] || '';

// Formule telle qu'affichée sur le site (espace administrateur, sinon contenus/abonnements.js)
async function formule(id: string): Promise<any> {
  let liste: any[] = [];
  const { data } = await sb.from('site_contenu').select('valeur').eq('cle', 'CASA_ABONNEMENTS').maybeSingle();
  const v = data?.valeur as any;
  liste = Array.isArray(v) ? v : Array.isArray(v?.__liste) ? v.__liste : [];
  if (!liste.some((p) => p?.id === id)) {
    try {
      const w: Record<string, unknown> = {};
      new Function('window', await (await fetch(SITE + '/contenus/abonnements.js')).text())(w);
      if (Array.isArray(w.CASA_ABONNEMENTS)) liste = liste.concat(w.CASA_ABONNEMENTS as any[]);
    } catch (_) { /* site injoignable */ }
  }
  return liste.find((p) => p?.id === id) || { id, name: id, perks: [] };
}

async function bienvenue(o: { email: string; prenom: string; formule: string; periode: string; cadeau: boolean; offertPar?: string }) {
  const key = Deno.env.get('BREVO_API_KEY'), from = Deno.env.get('EXPEDITEUR_EMAIL');
  if (!key || !from) return; // Brevo pas encore branché : pas d'e-mail, le reste fonctionne
  const p = await formule(o.formule);
  const nom = String(p.name || o.formule);
  const perks: string[] = (p.perks || []).filter(Boolean);
  const salut = o.prenom ? 'Bonjour ' + o.prenom + ',' : 'Bonjour,';
  const intro = o.cadeau
    ? `${o.offertPar ? o.offertPar + ' vous offre' : 'On vous offre'} ${o.periode === 'an' ? 'un an' : 'un mois'} de ${nom}. Bienvenue ! Votre abonnement est actif dès aujourd'hui.`
    : `Merci, et bienvenue ! Votre abonnement ${nom} est actif depuis aujourd'hui.`;
  const coeur = "Grâce à vous, le sport du Cotentin a un peu plus de place pour raconter ses histoires : les matchs du week-end, les clubs, les bénévoles et toutes celles et ceux qui font vivre nos terrains.";
  const papier = p.paper ? 'Votre premier numéro papier de La Gazette partira au prochain bouclage, à l’adresse indiquée.' : '';
  const acces = o.cadeau
    ? `Pour en profiter, créez votre compte (ou connectez-vous) sur ${SITE.replace(/^https?:\/\//, '')} avec cette adresse e-mail : ${o.email}.`
    : `Connectez-vous sur ${SITE.replace(/^https?:\/\//, '')} avec cette adresse e-mail pour en profiter. Votre abonnement, vos factures et la résiliation sont à tout moment dans Mon espace.`;
  const fin = 'Une question, une idée de sujet, un club à mettre en avant ? Répondez simplement à ce message : on lit tout.';
  const sujet = (o.cadeau ? 'Un cadeau pour vous : ' + nom : 'Bienvenue dans la famille ' + nom) + (o.prenom ? ', ' + o.prenom : '') + ' !';
  const text = [salut, '', intro, '', coeur, '', perks.length ? 'Ce que votre abonnement vous ouvre dès maintenant :\n' + perks.map((x) => '• ' + x).join('\n') : '', papier, '', acces, '', fin, '', 'À très vite au bord du terrain,', 'L’équipe Casa Besports', 'Le sport passe. Les histoires restent.', SITE].filter((l, i, a) => !(l === '' && a[i - 1] === '')).join('\n');
  const P = (t: string) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#1a1a1a">${t}</p>`;
  const html = `<div style="background:#f4f4f2;padding:24px 12px;font-family:Helvetica,Arial,sans-serif"><div style="max-width:560px;margin:0 auto;background:#ffffff">
<div style="background:#0b0b0b;color:#ffffff;padding:18px 24px;font-weight:800;letter-spacing:.04em;font-size:15px">CASA BESPORTS+</div>
<div style="padding:26px 24px 8px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.2;color:#0b0b0b">${esc(sujet)}</h1>
${P(esc(salut))}${P(esc(intro).replace(esc(nom), '<strong>' + esc(nom) + '</strong>'))}${P(esc(coeur))}
${perks.length ? `<p style="margin:0 0 6px;font-size:14px;color:#1a1a1a">Ce que votre abonnement vous ouvre dès maintenant :</p><ul style="margin:0 0 14px;padding-left:18px;font-size:14px;line-height:1.6;color:#1a1a1a">${perks.map((x) => '<li>' + esc(x) + '</li>').join('')}</ul>` : ''}
${papier ? P(esc(papier)) : ''}${P(esc(acces).replace('Mon espace', '<strong>Mon espace</strong>'))}
<p style="margin:6px 0 22px"><a href="${SITE}/#/account" style="display:inline-block;background:#0b0b0b;color:#ffffff;text-decoration:none;padding:12px 20px;font-weight:700;font-size:13px;letter-spacing:.04em">${o.cadeau ? 'CRÉER MON COMPTE' : 'OUVRIR MON ESPACE'}</a></p>
${P(esc(fin))}${P('À très vite au bord du terrain,<br><strong>L’équipe Casa Besports</strong><br><em style="color:#666">Le sport passe. Les histoires restent.</em>')}
</div></div></div>`;
  const reply = Deno.env.get('REPONSE_EMAIL');
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { email: from, name: Deno.env.get('EXPEDITEUR_NOM') || 'Casa Besports' }, to: [{ email: o.email }], subject: sujet, textContent: text, htmlContent: html, ...(reply ? { replyTo: { email: reply } } : {}) }),
  });
  if (!r.ok) console.error('Brevo : ' + (await r.text()).slice(0, 300)); // l'abonnement reste enregistré
  else await sb.from('messages').insert({ source: 'Paiement', sens: 'envoye', destinataire: o.email, sujet, message: text, lu: true, traite: true });
}

async function sessionPayee(s: any) {
  if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') return; // virement en attente : on attend async_payment_succeeded
  const md = s.metadata || {};
  const email = (s.customer_details?.email || md.email || '').toLowerCase();

  if (md.type === 'abonnement') {
    const cadeau = md.cadeau === '1';
    const base = {
      user_id: md.user_id || null, email: (md.email || email).toLowerCase(), payeur_email: email || null, nom: md.nom || s.customer_details?.name || null,
      formule: md.formule, periode: md.periode === 'an' ? 'an' : 'mois', cadeau, montant: (s.amount_total || 0) / 100,
      adresse: md.adresse || null, stripe_customer: typeof s.customer === 'string' ? s.customer : s.customer?.id || null, stripe_session: s.id, maj_le: new Date().toISOString(),
    };
    if (cadeau) {
      const fin = new Date(); if (base.periode === 'an') fin.setFullYear(fin.getFullYear() + 1); else fin.setMonth(fin.getMonth() + 1);
      const { data: deja } = await sb.from('abonnements').select('id').eq('stripe_session', s.id).limit(1);
      const { error } = await sb.from('abonnements').upsert({ ...base, statut: 'active', fin: fin.toISOString() }, { onConflict: 'stripe_session' });
      if (error) throw error;
      if (!deja?.length) await bienvenue({ email: base.email, prenom: prenomDe(md.nom), formule: base.formule, periode: base.periode, cadeau: true, offertPar: prenomDe(s.customer_details?.name) }).catch((e) => console.error(e));
      await avis('Abonnement offert : ' + base.formule, `${email} offre « ${base.formule} » (${base.periode === 'an' ? '1 an' : '1 mois'}) à ${base.email}. Montant ${eur(s.amount_total)}.${base.adresse ? '\nAdresse : ' + base.adresse : ''}`, base.nom, email);
    } else {
      const sub = await stripe.subscriptions.retrieve(String(s.subscription));
      const { data: deja } = await sb.from('abonnements').select('id').eq('stripe_subscription', sub.id).limit(1);
      const { error } = await sb.from('abonnements').upsert({ ...base, statut: sub.status, resiliation_prevue: !!sub.cancel_at_period_end, fin: finDe(sub), stripe_subscription: sub.id }, { onConflict: 'stripe_subscription' });
      if (error) throw error;
      if (!deja?.length) await bienvenue({ email: base.email, prenom: prenomDe(md.nom || s.customer_details?.name), formule: base.formule, periode: base.periode, cadeau: false }).catch((e) => console.error(e));
      await avis('Nouvel abonné : ' + base.formule, `${base.email} s'abonne à « ${base.formule} » (${base.periode === 'an' ? 'annuel' : 'mensuel'}), ${eur(s.amount_total)}.${base.adresse ? '\nAdresse (Gazette papier) : ' + base.adresse : ''}`, base.nom, base.email);
    }
    return;
  }

  if (md.type === 'commande') {
    const li = await stripe.checkout.sessions.listLineItems(s.id, { limit: 100, expand: ['data.price.product'] });
    const lignes = li.data.map((l: any) => ({ nom: l.description, variante: l.price?.product?.description || null, quantite: l.quantity, total: (l.amount_total || 0) / 100, produit: l.price?.product?.metadata?.produit || null, taille: l.price?.product?.metadata?.taille || null }));
    const liv = s.collected_information?.shipping_details || s.shipping_details || null;
    const adresse = liv ? { nom: liv.name, ...liv.address } : null;
    const { error } = await sb.from('commandes').upsert({
      numero: md.numero, user_id: md.user_id || null, email, nom: s.customer_details?.name || md.nom || null, telephone: s.customer_details?.phone || null,
      lignes, livraison: md.livraison, adresse, emballage_cadeau: md.emballage === '1', montant: (s.amount_total || 0) / 100,
      stripe_session: s.id, stripe_paiement: typeof s.payment_intent === 'string' ? s.payment_intent : s.payment_intent?.id || null,
    }, { onConflict: 'stripe_session' });
    if (error) throw error;
    const ou = { home: 'Livraison à domicile', cherwood: 'Retrait chez Cherwood', stade: 'Retrait au stade' }[md.livraison as 'home'] || md.livraison;
    const adr = adresse ? `\nAdresse : ${[adresse.nom, adresse.line1, adresse.line2, (adresse.postal_code || '') + ' ' + (adresse.city || '')].filter((x) => x && String(x).trim()).join(', ')}` : '';
    await avis('Commande payée ' + md.numero, `${lignes.map((l) => `${l.quantite} × ${l.nom}${l.variante ? ' (' + l.variante + ')' : ''}`).join('\n')}${md.emballage === '1' ? '\n+ emballage cadeau' : ''}\nTotal payé : ${eur(s.amount_total)}\n${ou}${adr}${s.customer_details?.phone ? '\nTéléphone : ' + s.customer_details.phone : ''}`, s.customer_details?.name, email);
  }
}

async function abonnementModifie(sub: any) {
  const { error } = await sb.from('abonnements').update({ statut: sub.status, resiliation_prevue: !!sub.cancel_at_period_end, fin: finDe(sub), maj_le: new Date().toISOString() }).eq('stripe_subscription', sub.id);
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Méthode non autorisée', { status: 405 });
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!secret || !Deno.env.get('STRIPE_SECRET_KEY')) return new Response('Webhook non configuré', { status: 501 });
  const body = await req.text();
  let event: any;
  try {
    event = await stripe.webhooks.constructEventAsync(body, req.headers.get('Stripe-Signature') || '', secret, undefined, crypto);
  } catch (_) {
    return new Response('Signature invalide', { status: 400 }); // message qui ne vient pas de Stripe
  }
  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await sessionPayee(event.data.object); break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await abonnementModifie(event.data.object);
        if (event.type === 'customer.subscription.deleted') { const m = event.data.object.metadata || {}; await avis('Fin d’abonnement : ' + (m.formule || ''), `L'abonnement « ${m.formule || '?'} » de ${m.email || '?'} est terminé.`, m.nom, m.email); }
        break;
    }
  } catch (e) {
    console.error(e);
    return new Response('Erreur : ' + String((e as Error).message || e).slice(0, 200), { status: 500 }); // Stripe réessaiera plus tard
  }
  return new Response(JSON.stringify({ recu: true }), { headers: { 'Content-Type': 'application/json' } });
});
