-- ================================================================
-- CASA LINEUP : les compositions d'équipe, leur partage entre utilisateurs et leur confidentialité
--
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller tout ce fichier › Run.
-- À lancer APRÈS supabase/administration.sql, supabase/abonnes.sql, supabase/redaction.sql et supabase/vestiaire.sql
-- (tous déjà lancés). Le script peut être relancé sans risque.
--
-- Qui voit une composition (vérifié par Supabase, pas seulement par le site) :
--   • « Privée »            : son auteur seulement (et l'administrateur).
--   • « Staff du club »     : + le correspondant du club et les encadrants désignés dans le Vestiaire.
--   • « Tout le club »      : + les membres validés du Vestiaire de ce club.
--   • « Rédaction »         : + les membres de la rédaction Casa Besports.
--   • « Publique »          : tout le monde, MAIS seulement quand elle est publiée et que l'heure de publication
--                              est passée. Avant, elle reste invisible (embargo d'avant-match).
--   • Toute personne (ou tout club, ou la rédaction) à qui l'auteur l'a ENVOYÉE la voit aussi.
-- Seul l'auteur modifie, publie ou supprime sa composition.
-- Les portraits importés sont rangés DANS la composition (pas dans le stockage public) : ils suivent ces règles.
-- ================================================================

-- ========== 1. Les compositions ==========
create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titre text not null check (char_length(trim(titre)) between 1 and 120),
  variante text check (variante is null or char_length(variante) <= 60),
  variante_de uuid references public.lineups (id) on delete set null,
  sport text check (sport is null or char_length(sport) <= 30),
  club text check (club is null or char_length(club) <= 60),
  equipe text check (equipe is null or char_length(equipe) <= 60),
  donnees jsonb not null,
  apercu text check (apercu is null or char_length(apercu) <= 120000),     -- petite vignette (JPEG)
  visibilite text not null default 'prive' check (visibilite in ('prive', 'staff', 'club', 'redaction', 'public')),
  statut text not null default 'brouillon' check (statut in ('brouillon', 'publie')),
  publier_le timestamptz,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  check (octet_length(donnees::text) <= 4000000)                             -- 4 Mo maximum (une vingtaine de portraits)
);
create index if not exists lineups_owner on public.lineups (owner, maj_le desc);
create index if not exists lineups_club on public.lineups (club);
alter table public.lineups enable row level security;

-- ========== 2. Les envois (d'un utilisateur à un autre, à un club ou à la rédaction) ==========
create table if not exists public.lineup_envois (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups (id) on delete cascade,
  expediteur uuid not null default auth.uid() references auth.users (id) on delete cascade,
  expediteur_nom text,
  dest_user uuid references auth.users (id) on delete cascade,
  dest_club text check (dest_club is null or char_length(dest_club) <= 60),
  dest_redaction boolean not null default false,
  dest_libelle text,                      -- ce que l'expéditeur voit : l'adresse saisie, le nom du club ou « La rédaction »
  commentaire text check (commentaire is null or char_length(commentaire) <= 1000),
  statut text not null default 'envoye' check (statut in ('envoye', 'accepte', 'refuse', 'modification')),
  reponse text check (reponse is null or char_length(reponse) <= 1000),
  proposition uuid references public.lineups (id) on delete set null,       -- la version modifiée proposée en retour
  repondu_par uuid references auth.users (id) on delete set null,
  repondu_nom text,
  repondu_le timestamptz,
  notifie text,                           -- dernier état déjà notifié (évite d'envoyer deux fois la même notification)
  cree_le timestamptz not null default now(),
  check ((dest_user is not null)::int + (dest_club is not null)::int + dest_redaction::int = 1)
);
create index if not exists lineup_envois_lineup on public.lineup_envois (lineup_id);
create index if not exists lineup_envois_dest on public.lineup_envois (dest_user);
create index if not exists lineup_envois_club on public.lineup_envois (dest_club);
alter table public.lineup_envois enable row level security;

-- ========== 3. Les règles d'accès ==========
-- La personne connectée est-elle destinataire de cet envoi ? (elle-même, le staff du club visé, ou la rédaction)
create or replace function public.lineup_pour_moi(du uuid, dc text, dr boolean) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    du = auth.uid()
    or (dc is not null and public.vs_staff(dc))
    or (dr and public.est_redaction())
  );
$$;

-- La personne connectée peut-elle voir cette composition ?
create or replace function public.lineup_voit(lid uuid, own uuid, cl text, vis text, st text, pub timestamptz) returns boolean
language sql stable security definer set search_path = public as $$
  select
    (vis = 'public' and st = 'publie' and (pub is null or pub <= now()))
    or (auth.uid() is not null and (
      own = auth.uid()
      or public.est_admin()
      or (vis in ('staff', 'club') and cl is not null and public.vs_staff(cl))
      or (vis = 'club' and cl is not null and public.vs_membre(cl))
      or (vis = 'redaction' and public.est_redaction())
      or exists (select 1 from public.lineup_envois e where e.lineup_id = lid and public.lineup_pour_moi(e.dest_user, e.dest_club, e.dest_redaction))
      -- l'auteur d'un envoi voit la version modifiée qu'on lui propose en retour
      or exists (select 1 from public.lineup_envois e where e.proposition = lid and e.expediteur = auth.uid())
    ));
$$;
revoke all on function public.lineup_pour_moi(uuid, text, boolean) from public;
revoke all on function public.lineup_voit(uuid, uuid, text, text, text, timestamptz) from public;
grant execute on function public.lineup_pour_moi(uuid, text, boolean) to anon, authenticated;
grant execute on function public.lineup_voit(uuid, uuid, text, text, text, timestamptz) to anon, authenticated;

drop policy if exists "lineups lecture" on public.lineups;
create policy "lineups lecture" on public.lineups for select to anon, authenticated
  using (public.lineup_voit(id, owner, club, visibilite, statut, publier_le));
drop policy if exists "lineups creation" on public.lineups;
create policy "lineups creation" on public.lineups for insert to authenticated with check (owner = auth.uid());
drop policy if exists "lineups modification" on public.lineups;
create policy "lineups modification" on public.lineups for update to authenticated
  using (owner = auth.uid() or public.est_admin()) with check (owner = auth.uid() or public.est_admin());
drop policy if exists "lineups suppression" on public.lineups;
create policy "lineups suppression" on public.lineups for delete to authenticated using (owner = auth.uid() or public.est_admin());

-- L'auteur ne change jamais, la date de mise à jour est posée par le serveur
create or replace function public.lineups_avant() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then new.owner := coalesce(auth.uid(), new.owner); new.cree_le := now();
  else new.owner := old.owner; new.cree_le := old.cree_le; end if;
  new.maj_le := now();
  return new;
end $$;
drop trigger if exists lineups_avant on public.lineups;
create trigger lineups_avant before insert or update on public.lineups for each row execute function public.lineups_avant();

-- Envois : lus par l'expéditeur et les destinataires ; créés et modifiés uniquement par les fonctions ci-dessous
drop policy if exists "envois lecture" on public.lineup_envois;
create policy "envois lecture" on public.lineup_envois for select to authenticated
  using (expediteur = auth.uid() or public.est_admin() or public.lineup_pour_moi(dest_user, dest_club, dest_redaction));
drop policy if exists "envois suppression" on public.lineup_envois;
create policy "envois suppression" on public.lineup_envois for delete to authenticated using (expediteur = auth.uid() or public.est_admin());

-- Nom affiché de la personne connectée (nom de la rédaction, sinon nom du compte, sinon début de l'adresse)
create or replace function public.lineup_mon_nom() returns text
language sql stable security definer set search_path = public, auth as $$
  select coalesce(nullif(trim(e.nom), ''), nullif(trim(u.raw_user_meta_data ->> 'name'), ''), split_part(u.email, '@', 1), 'Un utilisateur')
  from auth.users u left join public.equipe e on e.email = lower(u.email) where u.id = auth.uid();
$$;
revoke all on function public.lineup_mon_nom() from public;

-- ========== 4. Envoyer une composition ==========
-- Un seul destinataire par envoi : une adresse e-mail (compte Casa Besports), un club (identifiant) ou la rédaction.
-- Réponse : { ok, id } ou { ok:false, raison:'inconnu' } si aucun compte n'utilise cette adresse.
create or replace function public.lineup_envoyer(l uuid, email text default null, club text default null, redaction boolean default false, commentaire text default null)
returns json language plpgsql security definer set search_path = public, auth as $$
declare dest uuid; lib text; nid uuid; n int;
begin
  if auth.uid() is null then raise exception 'Connectez-vous pour envoyer une composition'; end if;
  if not exists (select 1 from public.lineups x where x.id = l and (x.owner = auth.uid() or public.est_admin())) then
    raise exception 'Vous ne pouvez envoyer que vos propres compositions';
  end if;
  -- garde-fou contre les envois en masse : 60 envois par heure et par personne
  select count(*) into n from public.lineup_envois where expediteur = auth.uid() and cree_le > now() - interval '1 hour';
  if n >= 60 then raise exception 'Trop d''envois en une heure : réessayez plus tard'; end if;
  if coalesce(trim(lineup_envoyer.email), '') <> '' then
    select u.id into dest from auth.users u where lower(u.email) = lower(trim(lineup_envoyer.email)) and u.deleted_at is null limit 1;
    if dest is null then return json_build_object('ok', false, 'raison', 'inconnu'); end if;
    if dest = auth.uid() then raise exception 'C''est votre propre adresse'; end if;
    lib := lower(trim(lineup_envoyer.email));
  elsif coalesce(trim(lineup_envoyer.club), '') <> '' then
    lib := trim(lineup_envoyer.club);
  elsif lineup_envoyer.redaction then
    lib := 'La rédaction';
  else
    raise exception 'Choisissez un destinataire';
  end if;
  insert into public.lineup_envois (lineup_id, expediteur, expediteur_nom, dest_user, dest_club, dest_redaction, dest_libelle, commentaire)
  values (l, auth.uid(), public.lineup_mon_nom(), dest, case when dest is null and coalesce(trim(lineup_envoyer.club), '') <> '' then trim(lineup_envoyer.club) end,
          dest is null and coalesce(trim(lineup_envoyer.club), '') = '' and lineup_envoyer.redaction, lib, nullif(left(trim(coalesce(lineup_envoyer.commentaire, '')), 1000), ''))
  returning id into nid;
  return json_build_object('ok', true, 'id', nid);
end $$;
revoke all on function public.lineup_envoyer(uuid, text, text, boolean, text) from public;
grant execute on function public.lineup_envoyer(uuid, text, text, boolean, text) to authenticated;

-- ========== 5. Répondre : accepter, refuser ou proposer une modification ==========
create or replace function public.lineup_repondre(e uuid, statut text, reponse text default null, proposition uuid default null)
returns void language plpgsql security definer set search_path = public as $$
declare r public.lineup_envois;
begin
  select * into r from public.lineup_envois where id = e;
  if r.id is null or not public.lineup_pour_moi(r.dest_user, r.dest_club, r.dest_redaction) then
    raise exception 'Cette composition ne vous a pas été envoyée';
  end if;
  if statut not in ('accepte', 'refuse', 'modification') then raise exception 'Réponse inconnue'; end if;
  if statut = 'modification' and (proposition is null or not exists (select 1 from public.lineups x where x.id = proposition and x.owner = auth.uid())) then
    raise exception 'Enregistrez d''abord votre version modifiée';
  end if;
  update public.lineup_envois set statut = lineup_repondre.statut, reponse = nullif(left(trim(coalesce(lineup_repondre.reponse, '')), 1000), ''),
    proposition = case when lineup_repondre.statut = 'modification' then lineup_repondre.proposition else null end,
    repondu_par = auth.uid(), repondu_nom = public.lineup_mon_nom(), repondu_le = now()
  where id = e;
end $$;
revoke all on function public.lineup_repondre(uuid, text, text, uuid) from public;
grant execute on function public.lineup_repondre(uuid, text, text, uuid) to authenticated;

-- ========== 6. Ce que j'ai reçu (avec le titre et la vignette de la composition) ==========
create or replace function public.lineup_recues()
returns table (id uuid, lineup_id uuid, titre text, variante text, apercu text, club text, equipe text, expediteur_nom text,
               dest_libelle text, commentaire text, statut text, reponse text, proposition uuid, cree_le timestamptz, repondu_le timestamptz)
language sql stable security definer set search_path = public as $$
  select e.id, e.lineup_id, l.titre, l.variante, l.apercu, l.club, l.equipe, e.expediteur_nom, e.dest_libelle, e.commentaire,
         e.statut, e.reponse, e.proposition, e.cree_le, e.repondu_le
  from public.lineup_envois e join public.lineups l on l.id = e.lineup_id
  where public.lineup_pour_moi(e.dest_user, e.dest_club, e.dest_redaction) and e.expediteur <> auth.uid()
  order by e.cree_le desc limit 200;
$$;
revoke all on function public.lineup_recues() from public;
grant execute on function public.lineup_recues() to authenticated;

-- Nombre d'envois reçus qui attendent une réponse (pastille dans le site)
create or replace function public.lineup_a_traiter() returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.lineup_envois e
  where e.statut = 'envoye' and e.expediteur <> auth.uid() and public.lineup_pour_moi(e.dest_user, e.dest_club, e.dest_redaction);
$$;
revoke all on function public.lineup_a_traiter() from public;
grant execute on function public.lineup_a_traiter() to authenticated;

-- ========== 7. Pour les notifications (fonction serveur « notifications » uniquement) ==========
-- Comptes à prévenir pour un envoi : le destinataire, ou le staff du club, ou la rédaction
create or replace function public.lineup_destinataires(e uuid) returns setof uuid
language sql stable security definer set search_path = public, auth as $$
  with r as (select * from public.lineup_envois where id = e)
  select dest_user from r where dest_user is not null
  union
  select u.id from r join public.equipe q on q.role = 'correspondant' and q.club = r.dest_club
    join auth.users u on lower(u.email) = q.email and u.email_confirmed_at is not null
  union
  select m.user_id from r join public.vestiaire_membres m on m.club = r.dest_club and m.statut = 'valide' and m.staff
  union
  select u.id from r join public.equipe q on r.dest_redaction
    join auth.users u on lower(u.email) = q.email and u.email_confirmed_at is not null;
$$;
revoke all on function public.lineup_destinataires(uuid) from public, anon, authenticated;
grant execute on function public.lineup_destinataires(uuid) to service_role;
