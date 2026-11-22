-- ================================================================
-- Casa Besports : les nouvelles offres (grille du 2026-11-22, docs/OFFRES.md)
--   1. BE+ Famille : l'abonné ajoute jusqu'à 3 proches (par adresse e-mail), qui profitent de BE+.
--   2. Club PRO   : un abonné Club PRO, membre du staff d'un club, active Club PRO pour ce club
--                   (badge et vitrine des sponsors sur la fiche du club, message à tout le club).
-- À lancer UNE fois dans Supabase › SQL Editor, APRÈS supabase/paiements.sql et supabase/vestiaire.sql.
-- Se relance sans risque (create … if not exists, create or replace).
-- ================================================================

-- ========== 1. BE+ Famille ==========
create table if not exists public.famille_membres (
  abonnement_id bigint not null references public.abonnements (id) on delete cascade,
  email text not null check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' and char_length(email) <= 200),
  ajoute_le timestamptz not null default now(),
  primary key (abonnement_id, email)
);
alter table public.famille_membres enable row level security;
create index if not exists famille_membres_email on public.famille_membres (email);

-- L'abonnement « famille » appartient-il à la personne connectée ?
create or replace function public.fam_titulaire(a bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (select 1 from public.abonnements b
    where b.id = a and b.formule = 'famille' and (b.user_id = auth.uid() or b.email = public.mon_email_confirme()));
$$;
-- Nombre de proches déjà ajoutés (3 au plus : 4 comptes en tout avec l'abonné)
create or replace function public.fam_nombre(a bigint) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.famille_membres where abonnement_id = a;
$$;

drop policy if exists "famille lecture" on public.famille_membres;
create policy "famille lecture" on public.famille_membres for select to authenticated
  using (public.fam_titulaire(abonnement_id) or email = public.mon_email_confirme());
drop policy if exists "famille ajout" on public.famille_membres;
create policy "famille ajout" on public.famille_membres for insert to authenticated
  with check (public.fam_titulaire(abonnement_id) and public.fam_nombre(abonnement_id) < 3 and email <> coalesce(public.mon_email_confirme(), ''));
drop policy if exists "famille retrait" on public.famille_membres;
create policy "famille retrait" on public.famille_membres for delete to authenticated
  using (public.fam_titulaire(abonnement_id) or email = public.mon_email_confirme());

-- Les abonnements « famille » auxquels la personne connectée a été ajoutée
create or replace function public.mes_abonnements_famille()
returns table (formule text, periode text, cadeau boolean, statut text, resiliation_prevue boolean, fin timestamptz, montant numeric, cree_le timestamptz, titulaire text)
language sql stable security definer set search_path = public as $$
  select b.formule, b.periode, b.cadeau, b.statut, b.resiliation_prevue, b.fin, 0::numeric, b.cree_le,
         coalesce(nullif(split_part(trim(b.nom), ' ', 1), ''), 'un proche')
  from public.famille_membres m join public.abonnements b on b.id = m.abonnement_id
  where m.email = public.mon_email_confirme() and b.formule = 'famille';
$$;
revoke all on function public.mes_abonnements_famille() from public, anon;
grant execute on function public.mes_abonnements_famille() to authenticated;

-- ========== 2. Club PRO ==========
create table if not exists public.clubs_pro (
  club text primary key check (char_length(club) between 1 and 60),
  titulaire uuid not null unique references auth.users (id) on delete cascade,  -- un abonnement = un club
  sponsors jsonb not null default '[]'::jsonb,
  active_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);
alter table public.clubs_pro enable row level security;  -- aucune lecture directe : tout passe par les fonctions ci-dessous

-- La personne u a-t-elle un abonnement Club PRO actif ?
create or replace function public.cp_abonne(u uuid) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (select 1 from public.abonnements b join auth.users x on x.id = u
    where (b.user_id = u or b.email = lower(x.email)) and b.formule in ('club-pro', 'club-pro-video')
      and not b.cadeau and b.statut in ('active', 'trialing', 'past_due'));
$$;
revoke all on function public.cp_abonne(uuid) from public, anon, authenticated;

-- Le club c a-t-il Club PRO en ce moment ?
create or replace function public.club_pro_actif(c text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.clubs_pro p where p.club = c and public.cp_abonne(p.titulaire));
$$;

-- Les clubs PRO actifs et leurs sponsors (fiches des clubs : lisible par tous)
create or replace function public.clubs_pro_actifs() returns table (club text, sponsors jsonb)
language sql stable security definer set search_path = public as $$
  select p.club, p.sponsors from public.clubs_pro p where public.cp_abonne(p.titulaire);
$$;
grant execute on function public.clubs_pro_actifs() to anon, authenticated;

-- L'abonné Club PRO, membre du staff du club, active Club PRO pour ce club
create or replace function public.club_pro_activer(c text) returns text
language plpgsql security definer set search_path = public, auth as $$
declare autre text;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if not public.vs_staff(c) then raise exception 'Réservé au staff du club (correspondant ou encadrant).'; end if;
  if not public.cp_abonne(auth.uid()) then raise exception 'Aucun abonnement Club PRO actif sur ce compte.'; end if;
  if exists (select 1 from public.clubs_pro p where p.club = c and p.titulaire <> auth.uid() and public.cp_abonne(p.titulaire)) then
    raise exception 'Ce club a déjà Club PRO.'; end if;
  select p.club into autre from public.clubs_pro p where p.titulaire = auth.uid() and p.club <> c;
  if autre is not null then raise exception 'Votre abonnement Club PRO est déjà utilisé pour un autre club (%). Un abonnement = un club.', autre; end if;
  delete from public.clubs_pro where club = c and titulaire <> auth.uid();  -- ancien titulaire dont l'abonnement est fini
  insert into public.clubs_pro (club, titulaire) values (c, auth.uid())
    on conflict (club) do update set active_le = now();
  return 'ok';
end $$;
revoke all on function public.club_pro_activer(text) from public, anon;
grant execute on function public.club_pro_activer(text) to authenticated;

-- Le staff d'un club PRO met à jour la vitrine des sponsors (12 au plus : nom, lien https, logo)
create or replace function public.club_pro_sponsors(c text, s jsonb) returns text
language plpgsql security definer set search_path = public as $$
declare x jsonb; propre jsonb := '[]'::jsonb; nom text; lien text; logo text;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  if not public.vs_staff(c) then raise exception 'Réservé au staff du club.'; end if;
  if not public.club_pro_actif(c) then raise exception 'Club PRO n’est pas actif pour ce club.'; end if;
  if jsonb_typeof(s) <> 'array' or jsonb_array_length(s) > 12 then raise exception '12 sponsors au plus.'; end if;
  for x in select * from jsonb_array_elements(s) loop
    nom := left(trim(coalesce(x->>'nom', '')), 60);
    lien := left(trim(coalesce(x->>'lien', '')), 300);
    logo := left(trim(coalesce(x->>'logo', '')), 300);
    if nom = '' then continue; end if;
    if lien <> '' and lien !~ '^https://[^[:space:]"''<>]+$' then raise exception 'Lien invalide pour %', nom; end if;
    if logo <> '' and logo !~ '^(https://[^[:space:]"''<>]+|assets/[A-Za-z0-9_./-]+)$' then raise exception 'Logo invalide pour %', nom; end if;
    propre := propre || jsonb_build_array(jsonb_build_object('nom', nom, 'lien', lien, 'logo', logo));
  end loop;
  update public.clubs_pro set sponsors = propre, maj_le = now() where club = c;
  return 'ok';
end $$;
revoke all on function public.club_pro_sponsors(text, jsonb) from public, anon;
grant execute on function public.club_pro_sponsors(text, jsonb) to authenticated;

-- Destinataires d'un message à tout le club (utilisé par la fonction « notifications », jamais par le navigateur)
create or replace function public.club_destinataires(c text, sec text) returns setof uuid
language sql stable security definer set search_path = public as $$
  select distinct m.user_id from public.vestiaire_membres m
  where m.club = c and m.statut = 'valide' and (sec is null or sec = 'club' or m.section = sec or m.staff);
$$;
revoke all on function public.club_destinataires(text, text) from public, anon, authenticated;
revoke all on function public.club_pro_actif(text) from public, anon, authenticated;
grant execute on function public.club_pro_actif(text) to service_role;
grant execute on function public.club_destinataires(text, text) to service_role;
grant execute on function public.cp_abonne(uuid) to service_role;
