// Casa Besports — Stripe prévient le site à chaque paiement (abonnement, renouvellement, résiliation, commande).
// Déploiement : voir docs/PAIEMENTS.md (Supabase › Edge Functions › nom « stripe-webhook », « Verify JWT » DÉSACTIVÉ).
// Secrets à créer dans Supabase › Edge Functions › Secrets :
//   STRIPE_SECRET_KEY       clé secrète Stripe (la même que pour la fonction « paiement »)
//   STRIPE_WEBHOOK_SECRET   « secret de signature » du webhook (whsec_…), affiché par Stripe à la création du webhook
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
      const { error } = await sb.from('abonnements').upsert({ ...base, statut: 'active', fin: fin.toISOString() }, { onConflict: 'stripe_session' });
      if (error) throw error;
      await avis('Abonnement offert : ' + base.formule, `${email} offre « ${base.formule} » (${base.periode === 'an' ? '1 an' : '1 mois'}) à ${base.email}. Montant ${eur(s.amount_total)}.${base.adresse ? '\nAdresse : ' + base.adresse : ''}`, base.nom, email);
    } else {
      const sub = await stripe.subscriptions.retrieve(String(s.subscription));
      const { error } = await sb.from('abonnements').upsert({ ...base, statut: sub.status, resiliation_prevue: !!sub.cancel_at_period_end, fin: finDe(sub), stripe_subscription: sub.id }, { onConflict: 'stripe_subscription' });
      if (error) throw error;
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
