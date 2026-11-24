// Casa Besports — transmet à OlistO les demandes faites depuis la page OlistO du site (formulaire de contact).
// Le message arrive aussi dans la messagerie de l'espace administrateur (comme toute demande du site).
// Déploiement : Supabase › Edge Functions › nom « contact-olisto », option « Verify JWT » DÉSACTIVÉE
// (les visiteurs ne sont pas forcément connectés). Voir docs/PARTAGE-RESEAUX.md.
// Utilise les secrets déjà créés pour l'envoi d'e-mails : BREVO_API_KEY, EXPEDITEUR_EMAIL (EXPEDITEUR_NOM facultatif).
//
// Sécurité : le destinataire est FIXE (ci-dessous), la fonction ne peut écrire à personne d'autre.
const DESTINATAIRE = 'k.allou@olisto.fr';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const court = (v: unknown, n: number) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, n);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  const b = await req.json().catch(() => ({}));
  const nom = court(b.nom, 120), email = court(b.email, 200), tel = court(b.telephone, 40), sujet = court(b.sujet, 160), message = court(b.message, 5000);
  if (!nom || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 2) return json({ error: 'Nom, e-mail et message requis' }, 400);
  if (b.site_web) return json({ ok: true }); // champ piège anti-robots (jamais rempli par une personne)

  const key = Deno.env.get('BREVO_API_KEY'), from = Deno.env.get('EXPEDITEUR_EMAIL');
  if (!key || !from) return json({ error: 'Envoi non configuré (BREVO_API_KEY, EXPEDITEUR_EMAIL)' }, 501);

  const texte = 'Nouvelle demande reçue depuis la page OlistO du site Casa Besports.\n\n'
    + 'Nom : ' + nom + '\nE-mail : ' + email + '\nTéléphone : ' + (tel || 'non indiqué') + '\nSujet : ' + (sujet || 'Demande OlistO') + '\n\n'
    + message + '\n\n— Répondez directement à cet e-mail : la réponse part vers ' + email + '.';
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: from, name: Deno.env.get('EXPEDITEUR_NOM') || 'Casa Besports' },
      to: [{ email: DESTINATAIRE }],
      replyTo: { email, name: nom },
      subject: ('OlistO × Casa Besports : ' + (sujet || 'nouvelle demande')).slice(0, 200),
      textContent: texte,
    }),
  });
  if (!r.ok) return json({ error: 'Brevo a refusé l’envoi : ' + (await r.text()).slice(0, 300) }, 502);
  return json({ ok: true });
});
