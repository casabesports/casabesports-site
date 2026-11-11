-- Casa Besports : sauvegarde de toutes les demandes reçues par le site
-- (formulaire de contact, OlistO, newsletter, commandes boutique, abonnements)
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- Les demandes se lisent ensuite dans Supabase › Table Editor › messages.

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  recu_le timestamptz not null default now(),
  source text, nom text, email text, telephone text, ville text, profil text,
  sujet text, message text, consentement text, page text,
  traite boolean not null default false
);

alter table public.messages enable row level security;

-- Tout visiteur peut ENVOYER une demande, personne ne peut les LIRE depuis le site
-- (seuls vous et votre équipe les voyez dans Supabase).
drop policy if exists "envoyer une demande" on public.messages;
create policy "envoyer une demande" on public.messages for insert to anon, authenticated
  with check (traite = false and length(coalesce(message, '')) < 20000);
