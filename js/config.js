/*
 * Casa Besports — réglages du site.
 *
 * COMPTES ABONNÉS (e-mail et téléphone mobile) : service Supabase (supabase.com, gratuit jusqu'à 50 000 membres).
 * Collez ici les 2 valeurs de votre projet Supabase : Project Settings › API (ou « Connect »)
 *   - url     : « Project URL », du type https://abcdefgh.supabase.co
 *   - anonKey : la clé « anon public » (ou « publishable »). Elle est faite pour être publique : aucun risque à la mettre ici.
 *   ⚠️ Ne collez JAMAIS la clé « service_role » / « secret ».
 * Tant que ces deux valeurs sont vides, la connexion reste en mode démonstration (rien n'est enregistré en ligne).
 */
window.CASA_SUPABASE = {
  url: 'https://kexofvitykxrjknnlyvf.supabase.co',
  anonKey: 'sb_publishable_RVo6Y6M7a0TfdYUwJuEpew_1a_N7oH4'
};

/*
 * CASA IA — MODE CONNECTÉ (facultatif, payant à l'usage).
 * Sans rien faire, Casa IA répond avec les contenus du site et Wikipédia (gratuit).
 * Le mode connecté ajoute un vrai modèle de langage (Claude) qui cherche sur le web les résultats et l'actualité
 * du sport du monde entier, en citant ses sources. Réservé aux membres connectés, pour maîtriser le coût.
 * Pour l'activer : suivez docs/CASA-IA.md (fonction serveur « casa-ia » + clé ANTHROPIC_API_KEY), puis mettez true.
 */
window.CASA_IA_CONNECTEE = false;
