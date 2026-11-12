// Casa Besports — ouverture d'une page de paiement sécurisée Stripe (abonnement, abonnement offert, commande boutique).
// Déploiement : voir docs/PAIEMENTS.md (Supabase › Edge Functions › nom « paiement »).
// Secrets à créer dans Supabase › Edge Functions › Secrets :
//   STRIPE_SECRET_KEY   clé secrète Stripe (dashboard.stripe.com › Développeurs › Clés API), sk_test_… pour les essais, sk_live_… en vrai
//   SITE_URL            (facultatif) adresse du site, par défaut https://casabesports.pages.dev
//
// Les prix ne sont JAMAIS pris dans le navigateur : la fonction relit les formules et les produits
// (version modifiée dans l'espace administrateur si elle existe, sinon les fichiers contenus/*.js du site).
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const SITE = (Deno.env.get('SITE_URL') || 'https://casabesports.pages.dev').replace(/\/$/, '');
const cents = (eur: number) => Math.round(Number(eur) * 100);
const validEmail = (e: unknown) => typeof e === 'string' && /^[^@\s,()"']+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(e.trim());
const txt = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

// Adresse de retour après paiement : uniquement le site lui-même
function retour(req: Request) {
  const o = (req.headers.get('Origin') || '').replace(/\/$/, '');
  const ok = o === SITE || /^https:\/\/([a-z0-9-]+\.)?casabesports\.pages\.dev$/.test(o) || /^https:\/\/(www\.)?casabesports\.fr$/.test(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o);
  return ok ? o : SITE;
}

// Lit une liste de contenus : version de l'espace administrateur (table site_contenu), sinon le fichier du site
async function contenu(sb: ReturnType<typeof createClient>, cle: string, fichier: string): Promise<any[]> {
  let base: any[] = [];
  try {
    const src = await (await fetch(SITE + '/contenus/' + fichier, { headers: { 'Cache-Control': 'no-cache' } })).text();
    const w: Record<string, unknown> = {};
    new Function('window', src)(w); // fichier du site lui-même (contenus/…)
    if (Array.isArray(w[cle])) base = w[cle] as any[];
  } catch (_) { /* fichier injoignable : on garde la version en ligne seule */ }
  const { data } = await sb.from('site_contenu').select('valeur').eq('cle', cle).maybeSingle();
  const v = data?.valeur as any;
  if (Array.isArray(v)) return v;
  if (v && Array.isArray(v.__liste)) {
    const vus = new Set(v.__liste.map((x: any) => x?.id));
    const anciens = new Set(v.__base || []);
    return base.filter((x) => x?.id && !anciens.has(x.id) && !vus.has(x.id)).concat(v.__liste);
  }
  return base;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) return json({ error: 'Le paiement en ligne n’est pas encore activé.', code: 'non_configure' }, 501);
  const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  // Personne connectée (facultatif) : relie le paiement à son compte
  let user: { id: string; email: string } | null = null;
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (jwt) {
    const { data } = await sb.auth.getUser(jwt);
    if (data?.user?.email && data.user.email_confirmed_at) user = { id: data.user.id, email: data.user.email.toLowerCase() };
  }

  const b = await req.json().catch(() => ({} as any));
  const site = retour(req);

  // Client Stripe déjà connu pour cette adresse (évite les doublons dans Stripe)
  async function clientConnu(email: string) {
    const { data } = await sb.from('abonnements').select('stripe_customer').or(`email.eq.${email}${user ? ',user_id.eq.' + user.id : ''}`).not('stripe_customer', 'is', null).eq('cadeau', false).order('id', { ascending: false }).limit(1);
    return data?.[0]?.stripe_customer as string | undefined;
  }

  try {
    // ---------- Abonnement (pour soi : prélèvement mensuel ou annuel ; offert : paiement unique) ----------
    if (b.type === 'abonnement') {
      const plans = await contenu(sb, 'CASA_ABONNEMENTS', 'abonnements.js');
      const plan = plans.find((p) => p && p.id === b.formule);
      const periode = b.periode === 'an' ? 'an' : 'mois';
      const prix = plan ? Number(plan[periode]) : 0;
      if (!plan || !(prix > 0)) return json({ error: 'Formule inconnue.' }, 400);
      const cadeau = !!b.cadeau;
      const email = cadeau ? txt(b.email, 200).toLowerCase() : (user?.email || txt(b.email, 200).toLowerCase());
      if (!validEmail(email)) return json({ error: 'Adresse e-mail invalide.' }, 400);
      if (plan.paper && !txt(b.adresse, 300)) return json({ error: 'Adresse postale requise pour le magazine papier.' }, 400);
      if (!cadeau) {
        const { data: deja } = await sb.from('abonnements').select('id').eq('formule', plan.id).in('statut', ['active', 'trialing', 'past_due']).or(`email.eq.${email}${user ? ',user_id.eq.' + user.id : ''}`).limit(1);
        if (deja?.length) return json({ error: 'Vous êtes déjà abonné à cette formule : retrouvez-la dans Mon espace.', code: 'deja_abonne' }, 409);
      }
      const md: Record<string, string> = {
        type: 'abonnement', formule: plan.id, periode, cadeau: cadeau ? '1' : '0', email, nom: txt(b.nom, 100),
        adresse: txt(b.adresse, 450), user_id: cadeau ? '' : (user?.id || ''), payeur_user_id: user?.id || '',
      };
      const nom = (cadeau ? 'Abonnement offert · ' : '') + txt(plan.name, 120) + (periode === 'an' ? (cadeau ? ' · 1 an' : ' · annuel') : (cadeau ? ' · 1 mois' : ' · mensuel'));
      const customer = cadeau ? undefined : await clientConnu(email);
      const session = await stripe.checkout.sessions.create({
        mode: cadeau ? 'payment' : 'subscription',
        locale: 'fr',
        line_items: [{
          quantity: 1,
          price_data: { currency: 'eur', unit_amount: cents(prix), product_data: { name: nom, ...(cadeau ? { description: 'Pour ' + email } : {}) }, ...(cadeau ? {} : { recurring: { interval: periode === 'an' ? 'year' : 'month' } }) },
        }],
        ...(customer ? { customer } : (cadeau ? (user ? { customer_email: user.email } : {}) : { customer_email: email })),
        ...(cadeau ? { customer_creation: 'always', payment_intent_data: { metadata: md } } : { subscription_data: { metadata: md } }),
        metadata: md,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        success_url: site + '/?paiement=reussi&type=abonnement&formule=' + encodeURIComponent(plan.id) + (cadeau ? '&cadeau=1' : '') + '#/account',
        cancel_url: site + '/?paiement=annule&type=abonnement#/offers',
      });
      return json({ url: session.url });
    }

    // ---------- Commande de la boutique ----------
    if (b.type === 'commande') {
      const produits = await contenu(sb, 'CASA_PRODUITS', 'boutique.js');
      const lignes = Array.isArray(b.lignes) ? b.lignes.slice(0, 30) : [];
      if (!lignes.length) return json({ error: 'Votre panier est vide.' }, 400);
      const email = user?.email || txt(b.email, 200).toLowerCase();
      if (!validEmail(email)) return json({ error: 'Adresse e-mail invalide.' }, 400);
      // Remise abonnés Casa B+ (−10 %) : vérifiée côté serveur
      let remise = false;
      if (user) {
        const { data: subs } = await sb.from('abonnements').select('formule, statut, fin, cadeau').or(`email.eq.${user.email},user_id.eq.${user.id}`);
        const plans = await contenu(sb, 'CASA_ABONNEMENTS', 'abonnements.js');
        remise = (subs || []).some((s: any) => plans.find((p) => p.id === s.formule)?.casab && (s.cadeau ? s.fin && new Date(s.fin) > new Date() : ['active', 'trialing', 'past_due'].includes(s.statut)));
      }
      const items: any[] = [];
      let net = 0;
      for (const l of lignes) {
        const p = produits.find((x) => x && x.id === l.id);
        if (!p) return json({ error: 'Un article du panier n’est plus disponible. Retirez-le puis réessayez.' }, 400);
        const qty = Math.max(1, Math.min(20, Math.floor(Number(l.qty) || 1)));
        const sizes = Array.isArray(p.sizes) ? p.sizes : null;
        if (sizes && l.size != null && !sizes.includes(l.size)) return json({ error: 'Taille indisponible pour ' + p.name + '.' }, 400);
        let unit = Array.isArray(p.priceBySize) && sizes ? Number(p.priceBySize[Math.max(0, sizes.indexOf(l.size))]) : Number(p.price);
        const perso = p.perso && txt(l.perso, 40) ? txt(l.perso, 40) : '';
        if (perso) unit += 8; // flocage personnalisé
        if (!(unit > 0)) return json({ error: 'Prix manquant pour ' + p.name + '.' }, 400);
        const u = remise ? Math.round(cents(unit) * 0.9) : cents(unit);
        net += u * qty;
        const variante = [txt(l.variant, 60) || null, perso ? 'Flocage ' + perso : null, remise ? 'remise abonné −10 %' : null].filter(Boolean).join(' · ');
        items.push({ quantity: qty, price_data: { currency: 'eur', unit_amount: u, product_data: { name: txt(p.name, 120), ...(variante ? { description: variante } : {}), metadata: { produit: String(p.id), taille: txt(l.size, 20) } } } });
      }
      if (b.emballage) items.push({ quantity: 1, price_data: { currency: 'eur', unit_amount: 300, product_data: { name: 'Emballage cadeau' } } });
      const livraison = ['home', 'cherwood', 'stade'].includes(b.livraison) ? b.livraison : 'home';
      const port = livraison === 'home' && net < 6000 ? 490 : 0;
      const nomLivraison = { home: 'Livraison à domicile', cherwood: 'Retrait boutique Cherwood, Cherbourg', stade: 'Retrait au stand Casa Besports (stade)' }[livraison as 'home'];
      const numero = 'CB-' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + crypto.randomUUID().slice(0, 4).toUpperCase();
      const md = { type: 'commande', numero, user_id: user?.id || '', livraison, emballage: b.emballage ? '1' : '0', nom: txt(b.nom, 100), remise: remise ? '1' : '0' };
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        locale: 'fr',
        line_items: items,
        customer_email: email,
        customer_creation: 'always',
        phone_number_collection: { enabled: true },
        ...(livraison === 'home' ? { shipping_address_collection: { allowed_countries: ['FR'] } } : {}),
        shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', display_name: nomLivraison, fixed_amount: { amount: port, currency: 'eur' }, ...(livraison === 'home' ? { delivery_estimate: { minimum: { unit: 'business_day', value: 2 }, maximum: { unit: 'business_day', value: 4 } } } : {}) } }],
        metadata: md,
        payment_intent_data: { metadata: md, description: 'Commande ' + numero },
        allow_promotion_codes: true,
        success_url: site + '/?paiement=reussi&type=commande&numero=' + encodeURIComponent(numero) + '#/order',
        cancel_url: site + '/?paiement=annule&type=commande#/shop',
      });
      return json({ url: session.url, numero });
    }

    return json({ error: 'Demande inconnue.' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: 'Stripe a refusé la demande : ' + String((e as Error).message || e).slice(0, 300) }, 502);
  }
});
