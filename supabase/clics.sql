-- ================================================================
-- CLICS VERS LES BOUTIQUES DES CLUBS (« Vos maillots de cœur »)
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller › Run.
-- Chaque clic sur « Voir la boutique » enregistre : le club, la date et la page.
-- Aucune donnée personnelle (ni nom, ni e-mail, ni adresse IP).
-- Seul l'administrateur peut lire les chiffres (Admin › onglet « Clics boutiques »).
-- Nécessite supabase/administration.sql (fonction est_admin), déjà lancé.
-- ================================================================
create table if not exists public.clics_boutiques (
  id bigint generated always as identity primary key,
  club text not null check (char_length(club) between 1 and 80),
  page text check (page is null or char_length(page) <= 40),
  cree_le timestamptz not null default now()
);
create index if not exists clics_boutiques_cree_le on public.clics_boutiques (cree_le desc);
alter table public.clics_boutiques enable row level security;

drop policy if exists "clics : tout visiteur peut enregistrer un clic" on public.clics_boutiques;
create policy "clics : tout visiteur peut enregistrer un clic" on public.clics_boutiques
  for insert to anon, authenticated with check (cree_le > now() - interval '5 minutes');

drop policy if exists "clics : lecture par l'administrateur" on public.clics_boutiques;
create policy "clics : lecture par l'administrateur" on public.clics_boutiques
  for select to authenticated using (public.est_admin());

grant insert on public.clics_boutiques to anon, authenticated;
grant select on public.clics_boutiques to authenticated;
