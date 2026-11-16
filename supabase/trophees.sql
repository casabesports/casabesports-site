-- ================================================================
-- Casa Besports — Les Marées d'or : votes du public (page « Les Marées d'or », adresse /trophees)
-- À lancer UNE fois dans Supabase › SQL Editor › New query › coller › Run.
-- Prérequis : supabase/administration.sql déjà lancé (fonction est_admin).
--
-- Règles :
--  - un vote par prix et par compte (on peut changer d'avis : le nouveau vote remplace l'ancien) ;
--  - personne ne lit les votes des autres : chacun ne voit que les siens ;
--  - seul l'administrateur voit les compteurs (fonction resultats_trophees).
-- ================================================================

create table if not exists public.trophees_votes (
  edition    text not null,
  prix       text not null,
  nomme      text not null,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (edition, prix, user_id)
);
alter table public.trophees_votes enable row level security;
-- Aucun accès direct à la table : tout passe par les fonctions ci-dessous.
revoke all on public.trophees_votes from anon, authenticated;

-- Voter (ou changer son vote) pour un prix
create or replace function public.voter_trophee(ed text, p text, n text) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if coalesce(length(ed), 0) not between 1 and 40 or coalesce(length(p), 0) not between 1 and 60 or coalesce(length(n), 0) not between 1 and 80 then
    raise exception 'Vote invalide';
  end if;
  insert into public.trophees_votes (edition, prix, nomme, user_id) values (ed, p, n, auth.uid())
  on conflict (edition, prix, user_id) do update set nomme = excluded.nomme, updated_at = now();
end $$;

-- Mes votes (pour afficher « Mon vote ✓ »)
create or replace function public.mes_votes_trophees(ed text) returns table (prix text, nomme text)
language sql stable security definer set search_path = public, auth as $$
  select v.prix, v.nomme from public.trophees_votes v where v.edition = ed and v.user_id = auth.uid();
$$;

-- Compteurs : réservé à l'administrateur
create or replace function public.resultats_trophees(ed text) returns table (prix text, nomme text, votes bigint)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.est_admin() then raise exception 'Réservé à l''administrateur'; end if;
  return query select v.prix, v.nomme, count(*)::bigint from public.trophees_votes v where v.edition = ed group by v.prix, v.nomme;
end $$;

revoke all on function public.voter_trophee(text, text, text) from public;
revoke all on function public.mes_votes_trophees(text) from public;
revoke all on function public.resultats_trophees(text) from public;
grant execute on function public.voter_trophee(text, text, text) to authenticated;
grant execute on function public.mes_votes_trophees(text) to authenticated;
grant execute on function public.resultats_trophees(text) to authenticated;
