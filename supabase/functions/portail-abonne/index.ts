// Casa Besports — ouvre l'espace client Stripe de l'abonné connecté : carte bancaire, factures, changement ou résiliation.
// Déploiement : voir docs/PAIEMENTS.md (Supabase › Edge Functions › nom « portail-abonne »).
// Secret utilisé : STRIPE_SECRET_KEY (le même que pour « paiement »), et SITE_URL (facultatif).
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const SITE = (Deno.env.get('SITE_URL') || 'https://casabesports.pages.dev').replace(/\/$/, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  const key = Deno.env.get('STRIPE_SECRET_KEY');
  if (!key) return json({ error: 'Le paiement en ligne n’est pas encore activé.', code: 'non_configure' }, 501);
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: u } = await sb.auth.getUser(jwt);
  const user = u?.user;
  if (!user?.email || !user.email_confirmed_at) return json({ error: 'Connectez-vous pour gérer votre abonnement.' }, 401);
  const email = user.email.toLowerCase();
  const { data } = await sb.from('abonnements').select('stripe_customer').eq('cadeau', false).not('stripe_customer', 'is', null)
    .or(`user_id.eq.${user.id},email.eq.${email}`).order('id', { ascending: false }).limit(1);
  const customer = data?.[0]?.stripe_customer;
  if (!customer) return json({ error: 'Aucun abonnement payé en ligne n’est rattaché à ce compte.', code: 'aucun' }, 404);
  const o = (req.headers.get('Origin') || '').replace(/\/$/, '');
  const site = o === SITE || /^https:\/\/([a-z0-9-]+\.)?casabesports\.pages\.dev$/.test(o) || /^https:\/\/(www\.)?casabesports\.fr$/.test(o) ? o : SITE;
  try {
    const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
    const p = await stripe.billingPortal.sessions.create({ customer, locale: 'fr', return_url: site + '/#/account' });
    return json({ url: p.url });
  } catch (e) {
    return json({ error: 'Stripe : ' + String((e as Error).message || e).slice(0, 300) }, 502);
  }
});
