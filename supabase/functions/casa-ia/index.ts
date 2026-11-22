// Casa Besports — Casa IA, mode connecté (facultatif, payant à l'usage).
// Répond aux questions que le moteur intégré du site ne sait pas traiter : résultats et actualité du sport
// du monde entier, du département à l'international, avec une recherche web et des sources citées.
//
// Déploiement : voir docs/CASA-IA.md (Supabase › Edge Functions › nom « casa-ia », « Verify JWT » ACTIVÉ).
// Secret à créer dans Supabase › Edge Functions › Secrets :
//   ANTHROPIC_API_KEY   clé API Claude (console.anthropic.com › API keys)
// Secrets facultatifs :
//   CASA_IA_MAX_HEURE   nombre de questions par membre et par heure (20 par défaut), pour maîtriser le coût
//
// Réservé aux membres connectés. Appelée par js/casa-ia.js quand window.CASA_IA_CONNECTEE = true (js/config.js).
import Anthropic from 'npm:@anthropic-ai/sdk@1.12.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

// Consignes de l'assistant (fixes : elles restent en cache d'une question à l'autre)
const CONSIGNES = `Tu es Casa IA, l'assistant de Casa Besports (BE+), média sportif indépendant né à Cherbourg-en-Cotentin, dans la Manche.
Tu réponds en français simple, en quelques phrases courtes, comme un journaliste sportif bien informé et chaleureux.

Ce que tu couvres : tout le sport, à tous les niveaux. Départemental (Manche, Cotentin), régional (Normandie), national (France) et international.
Résultats, classements, calendriers, palmarès, règles, histoire des clubs et des compétitions, parcours des athlètes.
Pour une question hors sport, réponds brièvement puis propose de revenir au sport.

Règles :
- N'invente jamais un score, une date, un classement ou un nom. Pour tout ce qui est récent ou chiffré, cherche sur le web.
- Pour le sport amateur de la Manche et de Normandie, privilégie les sources officielles : sites des fédérations (fff.fr, ffbb.com, ffhandball.fr, ffvb.org, ffr.fr…), des ligues et districts, des clubs, et la presse locale (La Manche Libre, Ouest-France, La Presse de la Manche).
- Si tu ne trouves pas d'information fiable, dis-le simplement et indique où la trouver.
- Donne la date des informations quand elle compte (« au 22 novembre 2026 »).
- Pas de données personnelles sur des joueurs amateurs ou des mineurs au-delà de ce que publient leur club ou leur fédération.
- Les informations sur Casa Besports viennent uniquement du bloc « Casa Besports » ci-dessous : ne lui prête rien d'autre.
- Pas de mise en forme Markdown (pas de titres, d'astérisques ni de tableaux) : des phrases, et des tirets simples pour une liste.`;

const client = new Anthropic(); // lit ANTHROPIC_API_KEY
const compteur = new Map<string, number[]>(); // limite simple par membre (remise à zéro au redémarrage de la fonction)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405);
  if (!Deno.env.get('ANTHROPIC_API_KEY')) return json({ error: 'Mode connecté non configuré (ANTHROPIC_API_KEY)' }, 501);

  // Membre connecté uniquement
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return json({ error: 'Réservé aux membres connectés' }, 401);

  const max = Number(Deno.env.get('CASA_IA_MAX_HEURE') || 20);
  const now = Date.now(), recents = (compteur.get(u.user.id) || []).filter((t) => now - t < 3600_000);
  if (recents.length >= max) return json({ error: 'Limite de questions atteinte pour cette heure' }, 429);
  compteur.set(u.user.id, recents.concat(now));

  const body = await req.json().catch(() => ({}));
  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m: { role?: string; content?: unknown }) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-8)
    .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ error: 'Question manquante' }, 400);
  const contexte = typeof body.contexte === 'string' ? body.contexte.slice(0, 6000) : '';

  try {
    const params = {
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default' as const,
      output_config: { effort: 'low' as const },
      system: [
        { type: 'text' as const, text: CONSIGNES, cache_control: { type: 'ephemeral' as const } },
        { type: 'text' as const, text: 'Casa Besports (données du site, à titre d’information) :\n' + contexte },
      ],
      tools: [{ type: 'web_search_20260209' as const, name: 'web_search' as const, max_uses: 3, user_location: { type: 'approximate' as const, city: 'Cherbourg-en-Cotentin', region: 'Normandie', country: 'FR', timezone: 'Europe/Paris' } }],
    };
    let convo = messages as Anthropic.Beta.Messages.BetaMessageParam[];
    let rep = await client.beta.messages.create({ ...params, messages: convo });
    // La recherche web peut demander plusieurs tours : on reprend là où le serveur s'est arrêté
    for (let i = 0; i < 2 && rep.stop_reason === 'pause_turn'; i++) {
      convo = [...convo, { role: 'assistant', content: rep.content }];
      rep = await client.beta.messages.create({ ...params, messages: convo });
    }
    if (rep.stop_reason === 'refusal') return json({ reply: 'Je préfère ne pas répondre à cette question. Posez-moi plutôt une question de sport !', sources: [] });

    let texte = '';
    const sources: { url: string; titre: string }[] = [];
    for (const b of rep.content) {
      if (b.type !== 'text') continue;
      texte += b.text;
      for (const c of b.citations || []) {
        if (c.type === 'web_search_result_location' && c.url && !sources.some((s) => s.url === c.url)) sources.push({ url: c.url, titre: c.title || new URL(c.url).hostname });
      }
    }
    texte = texte.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').trim();
    if (!texte) return json({ error: 'Réponse vide' }, 502);
    return json({ reply: texte, sources: sources.slice(0, 4) });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'Service occupé, réessayez dans un instant' }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'Clé ANTHROPIC_API_KEY refusée' }, 501);
    if (e instanceof Anthropic.APIError) return json({ error: 'Erreur du service : ' + e.message.slice(0, 200) }, 502);
    return json({ error: 'Erreur : ' + String(e).slice(0, 200) }, 500);
  }
});
