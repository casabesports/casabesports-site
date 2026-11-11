/*
 * Casa Besports — l'équipe du site.
 * Les personnes listées ici obtiennent leur rôle automatiquement en se connectant
 * (lien reçu par e-mail) avec l'adresse indiquée.
 *   role: 'admin'      → administrateur : publie, valide, gère l'équipe, le CRM, la Gazette
 *   role: 'redacteur'  → rédacteur : écrit et soumet des articles
 * Les rédacteurs se gèrent désormais dans l'espace administrateur (Admin › Équipe et accès) :
 * c'est la table « equipe » de Supabase qui fait foi (voir docs/ESPACE-ADMIN.md).
 * Ce fichier sert de secours tant que supabase/administration.sql n'est pas lancé.
 */
window.CASA_EQUIPE = [
  { name: 'Kader Allou', email: 'kader.allou.pro@outlook.fr', role: 'admin' }
];
