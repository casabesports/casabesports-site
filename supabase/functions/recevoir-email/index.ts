// Casa Besports — réception des e-mails dans la messagerie de l'espace administrateur.
// Brevo (« Inbound parsing ») appelle cette fonction à chaque e-mail reçu sur l'adresse de réception
// (ex. messages@reponses.casabesports.fr). Seuls les e-mails envoyés par une « adresse suivie »
// (onglet Messagerie de l'espace administrateur) sont enregistrés ; les autres sont ignorés.
// Déploiement : voir docs/ESPACE-ADMIN.md (nom « recevoir-email », option « Verify JWT » DÉSACTIVÉE).
// Secret à créer : RECEPTION_CLE = un long mot de passe inventé, repris dans l'adresse du webhook Brevo :
//   https://<projet>.supabase.co/functions/v1/recevoir-email?cle=<RECEPTION_CLE>
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('ok');
  const cle = Deno.env.get('RECEPTION_CLE');
  if (!cle || new URL(req.url).searchParams.get('cle') !== cle) return new Response('interdit', { status: 403 });

  // Clé de service fournie automatiquement par Supabase aux fonctions (jamais visible du site)
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [body];
  let saved = 0;
  for (const it of items) {
    const from = String(it?.From?.Address ?? it?.from ?? '').trim().toLowerCase();
    if (!from) continue;
    const { data: suivi } = await sb.from('contacts_messagerie').select('email, nom').eq('email', from).maybeSingle();
    if (!suivi) continue;
    const texte = String(it?.ExtractedMarkdownMessage || it?.RawTextBody || it?.text || '').slice(0, 20000);
    await sb.from('messages').insert({
      source: 'E-mail', sens: 'recu', nom: it?.From?.Name || suivi.nom || null, email: from,
      sujet: String(it?.Subject ?? it?.subject ?? '').slice(0, 300) || null, message: texte,
    });
    saved++;
  }
  return new Response(JSON.stringify({ ok: true, saved }), { headers: { 'Content-Type': 'application/json' } });
});
