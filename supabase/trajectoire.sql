-- ================================================================
-- MA TRAJECTOIRE : le suivi personnel de l'athlète (matchs, performances, forme, objectifs)
--
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller tout ce fichier › Run.
-- Le script peut être relancé sans risque. Il n'a besoin d'aucun autre script.
--
-- Une ligne par compte. Chacun ne voit, n'écrit et n'efface QUE son propre suivi
-- (vérifié par Supabase, pas seulement par le site). Rien n'est public.
-- Sans ce script, Ma trajectoire marche quand même : les données restent sur l'appareil.
-- ================================================================

create table if not exists public.athlete_trajectoire (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  donnees jsonb not null default '{}'::jsonb,
  maj_le timestamptz not null default now(),
  check (octet_length(donnees::text) <= 1000000)   -- 1 Mo maximum (plusieurs saisons)
);

alter table public.athlete_trajectoire enable row level security;

drop policy if exists "trajectoire lecture" on public.athlete_trajectoire;
drop policy if exists "trajectoire ajout" on public.athlete_trajectoire;
drop policy if exists "trajectoire modif" on public.athlete_trajectoire;
drop policy if exists "trajectoire suppression" on public.athlete_trajectoire;
create policy "trajectoire lecture" on public.athlete_trajectoire for select to authenticated using (user_id = auth.uid());
create policy "trajectoire ajout" on public.athlete_trajectoire for insert to authenticated with check (user_id = auth.uid());
create policy "trajectoire modif" on public.athlete_trajectoire for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "trajectoire suppression" on public.athlete_trajectoire for delete to authenticated using (user_id = auth.uid());

grant select, insert, update, delete on public.athlete_trajectoire to authenticated;
revoke all on public.athlete_trajectoire from anon;
