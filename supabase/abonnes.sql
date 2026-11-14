-- Casa Besports : liste des abonnés dans l'espace administrateur et étiquettes de la rédaction
-- (rédacteur, chef d'édition, correspondant de club).
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- À lancer APRÈS supabase/administration.sql (il utilise la table « equipe » et la fonction est_admin()).
-- Le script peut être relancé sans risque.
--
-- Données personnelles (RGPD) : la liste des abonnés n'est lisible QUE par l'administrateur,
-- via la fonction liste_abonnes() qui vérifie est_admin() côté serveur. Aucune nouvelle table publique.

-- ========== 1. Les étiquettes de la rédaction ==========
-- admin (vous seul), collaborateur (chef d'édition), redacteur, correspondant (correspondant de club, rattaché à un club)
alter table public.equipe add column if not exists club text;
alter table public.equipe drop constraint if exists equipe_role_check;
alter table public.equipe add constraint equipe_role_check check (role in ('admin', 'collaborateur', 'redacteur', 'correspondant'));
alter table public.equipe drop constraint if exists equipe_club_check;
alter table public.equipe add constraint equipe_club_check check (role <> 'correspondant' or coalesce(club, '') <> '');

-- L'administrateur gère toutes les étiquettes, sauf « admin » (modifiable uniquement ici)
drop policy if exists "admin ajoute un redacteur" on public.equipe;
create policy "admin ajoute un redacteur" on public.equipe for insert to authenticated with check (public.est_admin() and role <> 'admin');
drop policy if exists "admin modifie un redacteur" on public.equipe;
create policy "admin modifie un redacteur" on public.equipe for update to authenticated using (public.est_admin() and role <> 'admin') with check (role <> 'admin');
drop policy if exists "admin retire un redacteur" on public.equipe;
create policy "admin retire un redacteur" on public.equipe for delete to authenticated using (public.est_admin() and role <> 'admin');

-- Étiquette et club de la personne connectée (adresse e-mail confirmée uniquement)
create or replace function public.mon_acces() returns table (role text, club text)
language sql stable security definer set search_path = public, auth as $$
  select e.role, e.club from public.equipe e
  join auth.users u on lower(u.email) = e.email
  where u.id = auth.uid() and u.email_confirmed_at is not null
  limit 1;
$$;
revoke all on function public.mon_acces() from public;
grant execute on function public.mon_acces() to authenticated;

-- ========== 2. Liste des abonnés (administrateur uniquement) ==========
drop function if exists public.liste_abonnes();
create function public.liste_abonnes()
returns table (
  id uuid, email text, telephone text, nom text, email_confirme boolean,
  inscrit_le timestamptz, derniere_connexion timestamptz,
  numero_membre text, formule text, periode text, statut_abonnement text, fin_abonnement timestamptz,
  etiquette text, club text, demande text
)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.est_admin() then raise exception 'Réservé à l''administrateur'; end if;
  return query
  select u.id, lower(u.email)::text, u.phone::text,
         coalesce(e.nom, u.raw_user_meta_data ->> 'name', u.raw_user_meta_data ->> 'full_name')::text,
         (u.email_confirmed_at is not null),
         u.created_at, u.last_sign_in_at,
         public.cba_numero_membre(u.id),
         ab.formule, ab.periode, ab.statut, ab.fin,
         e.role, e.club,
         public.cba_demande(u.id)
  from auth.users u
  left join public.equipe e on e.email = lower(u.email)
  left join lateral public.cba_abonnement(u.id, lower(u.email)) ab on true
  where u.deleted_at is null
  order by u.created_at desc;
end $$;
revoke all on function public.liste_abonnes() from public;
grant execute on function public.liste_abonnes() to authenticated;

-- Petites aides internes (tolèrent l'absence des tables membres / abonnements / demandes)
create or replace function public.cba_numero_membre(u uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare r text;
begin
  if to_regclass('public.membres') is null then return null; end if;
  execute 'select numero from public.membres where id = $1' into r using u;
  return r;
end $$;
create or replace function public.cba_demande(u uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare r text;
begin
  if to_regclass('public.demandes_acces') is null then return null; end if;
  execute 'select statut from public.demandes_acces where user_id = $1 order by cree_le desc limit 1' into r using u;
  return r;
end $$;
create or replace function public.cba_abonnement(u uuid, mail text)
returns table (formule text, periode text, statut text, fin timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if to_regclass('public.abonnements') is null then return; end if;
  return query execute
    'select a.formule, a.periode, a.statut, a.fin from public.abonnements a
     where a.user_id = $1 or (a.email = $2 and $2 is not null)
     order by (a.statut in (''active'', ''trialing'')) desc, a.maj_le desc limit 1' using u, mail;
end $$;
revoke all on function public.cba_numero_membre(uuid) from public;
revoke all on function public.cba_demande(uuid) from public;
revoke all on function public.cba_abonnement(uuid, text) from public;

-- ========== 3. Donner, changer ou retirer une étiquette en un clic ==========
-- etiquette = null retire l'accès à la rédaction
create or replace function public.definir_etiquette(adresse text, etiquette text, club_id text default null, nom_affiche text default null)
returns void
language plpgsql security definer set search_path = public, auth as $$
declare m text := lower(trim(adresse));
begin
  if not public.est_admin() then raise exception 'Réservé à l''administrateur'; end if;
  if m is null or m !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Adresse e-mail invalide'; end if;
  if exists (select 1 from public.equipe where email = m and role = 'admin') then raise exception 'Le compte administrateur ne se modifie pas ici'; end if;
  if etiquette is null or etiquette = '' then
    delete from public.equipe where email = m and role <> 'admin';
    return;
  end if;
  if etiquette not in ('collaborateur', 'redacteur', 'correspondant') then raise exception 'Étiquette inconnue'; end if;
  if etiquette = 'correspondant' and coalesce(club_id, '') = '' then raise exception 'Choisissez le club du correspondant'; end if;
  insert into public.equipe (email, nom, role, club)
  values (m, nullif(trim(nom_affiche), ''), etiquette, case when etiquette = 'correspondant' then club_id end)
  on conflict (email) do update set role = excluded.role, club = excluded.club, nom = coalesce(excluded.nom, public.equipe.nom);
end $$;
revoke all on function public.definir_etiquette(text, text, text, text) from public;
grant execute on function public.definir_etiquette(text, text, text, text) to authenticated;
