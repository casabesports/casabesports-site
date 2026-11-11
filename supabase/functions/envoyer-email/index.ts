// Casa Besports — envoi d'un e-mail depuis la messagerie de l'espace administrateur.
// Déploiement : voir docs/ESPACE-ADMIN.md (Supabase › Edge Functions › nom « envoyer-email »).
// Secrets à créer dans Supabase › Edge Functions › Secrets :
//   BREVO_API_KEY     clé API Brevo (brevo.com › SMTP & API › API keys)
//   EXPEDITEUR_EMAIL  adresse d'envoi validée chez Brevo (ex. contact@casabesports.fr)
//   EXPEDITEUR_NOM    (facultatif) nom affiché, par défaut « Casa Besports »
//   REPONSE_EMAIL     (facultatif) adresse où arrivent les réponses (adresse de réception, voir recevoir-email)
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  // La personne connectée (jeton du site) doit être l'administrateur
  const auth = req.headers.get('Authorization') ?? '';
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: admin } = await sb.rpc('est_admin');
  if (admin !== true) return json({ error: 'Réservé à l’administrateur' }, 403);

  const { to, subject, text, reponse_a } = await req.json().catch(() => ({}));
  if (typeof to !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to) || typeof text !== 'string' || !text.trim()) return json({ error: 'Destinataire ou message invalide' }, 400);
  const key = Deno.env.get('BREVO_API_KEY'), from = Deno.env.get('EXPEDITEUR_EMAIL');
  if (!key || !from) return json({ error: 'Envoi non configuré (BREVO_API_KEY, EXPEDITEUR_EMAIL)' }, 501);

  const replyTo = Deno.env.get('REPONSE_EMAIL');
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: from, name: Deno.env.get('EXPEDITEUR_NOM') || 'Casa Besports' },
      to: [{ email: to }],
      subject: String(subject || 'Casa Besports').slice(0, 200),
      textContent: text.slice(0, 50000),
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });
  if (!r.ok) return json({ error: 'Brevo a refusé l’envoi : ' + (await r.text()).slice(0, 300) }, 502);

  // Trace dans la messagerie (droits de l'administrateur)
  await sb.from('messages').insert({ source: 'E-mail', sens: 'envoye', destinataire: to, sujet: subject || null, message: text, reponse_a: reponse_a ?? null, lu: true, traite: true });
  return json({ ok: true });
});
