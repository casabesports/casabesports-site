-- ================================================================
-- LE VESTIAIRE : l'espace commun des clubs et de leurs joueurs
-- Planning des entraînements et des matchs, annonce de présence, fil du club (seniors / jeunes).
--
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller tout ce fichier › Run.
-- À lancer APRÈS supabase/administration.sql et supabase/abonnes.sql (déjà faits).
-- Le script peut être relancé sans risque.
--
-- Qui fait quoi (vérifié par Supabase, pas seulement par le site) :
--   • Tout le monde (même sans compte) voit le planning et le fil public de chaque club.
--   • Un abonné connecté demande à rejoindre le vestiaire de son club (section seniors ou jeunes).
--   • Le club valide les demandes : c'est le correspondant du club (étiquette donnée dans Admin › Abonnés),
--     un encadrant désigné par lui, ou vous (administrateur).
--   • Un membre validé annonce sa présence ; en seniors, il voit qui vient ; il peut écrire dans le fil seniors.
--   • Le club (correspondant, encadrants, administrateur) gère le planning, les membres et publie partout.
--
-- Protection des jeunes (mineurs) :
--   • Section jeunes : le compte est celui d'un parent (ou du jeune s'il a 15 ans ou plus), et seuls le prénom
--     et l'initiale du nom sont enregistrés.
--   • Les noms des jeunes et leurs présences ne sont visibles QUE par le club et par le parent concerné :
--     jamais par les autres parents, jamais par le public.
--   • Seul le club écrit dans le fil des jeunes.
-- ================================================================

-- ========== 1. Les tables ==========
create table if not exists public.vestiaire_membres (
  id uuid primary key default gen_random_uuid(),
  club text not null check (char_length(club) between 1 and 60),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nom text not null check (char_length(trim(nom)) between 2 and 40),
  section text not null check (section in ('seniors', 'jeunes')),
  equipe text check (equipe is null or char_length(equipe) <= 30),
  qualite text not null check (qualite in ('joueur', 'parent', 'encadrant')),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'valide', 'refuse')),
  staff boolean not null default false,
  cree_le timestamptz not null default now(),
  unique (club, user_id, nom)
);
create index if not exists vestiaire_membres_club on public.vestiaire_membres (club, statut);
create index if not exists vestiaire_membres_user on public.vestiaire_membres (user_id);

create table if not exists public.vestiaire_evenements (
  id uuid primary key default gen_random_uuid(),
  club text not null check (char_length(club) between 1 and 60),
  section text not null default 'club' check (section in ('club', 'seniors', 'jeunes')),
  equipe text check (equipe is null or char_length(equipe) <= 30),
  type text not null default 'entrainement' check (type in ('entrainement', 'match', 'autre')),
  titre text check (titre is null or char_length(titre) <= 80),
  debut timestamptz not null,
  fin timestamptz,
  lieu text check (lieu is null or char_length(lieu) <= 120),
  adversaire text check (adversaire is null or char_length(adversaire) <= 80),
  domicile boolean,
  note text check (note is null or char_length(note) <= 300),
  annule boolean not null default false,
  cree_par uuid default auth.uid(),
  cree_le timestamptz not null default now()
);
create index if not exists vestiaire_evenements_club on public.vestiaire_evenements (club, debut);
create index if not exists vestiaire_evenements_debut on public.vestiaire_evenements (debut);

create table if not exists public.vestiaire_presences (
  evenement_id uuid not null references public.vestiaire_evenements (id) on delete cascade,
  membre_id uuid not null references public.vestiaire_membres (id) on delete cascade,
  reponse text not null check (reponse in ('present', 'absent', 'incertain')),
  maj_le timestamptz not null default now(),
  primary key (evenement_id, membre_id)
);

create table if not exists public.vestiaire_fil (
  id uuid primary key default gen_random_uuid(),
  club text not null check (char_length(club) between 1 and 60),
  section text not null default 'club' check (section in ('club', 'seniors', 'jeunes')),
  texte text not null check (char_length(trim(texte)) between 1 and 1000),
  auteur_nom text,
  auteur_role text,
  user_id uuid default auth.uid(),
  epingle boolean not null default false,
  cree_le timestamptz not null default now()
);
create index if not exists vestiaire_fil_club on public.vestiaire_fil (club, cree_le desc);

-- ========== 2. Les vérifications (exécutées par Supabase) ==========
-- Le club : administrateur, correspondant du club (Admin › Abonnés) ou encadrant validé du vestiaire
create or replace function public.vs_staff(c text) returns boolean
language sql stable security definer set search_path = public, auth as $$
  select auth.uid() is not null and (
    coalesce(public.mon_role() = 'admin', false)
    or exists (select 1 from public.equipe e join auth.users u on lower(u.email) = e.email
               where u.id = auth.uid() and u.email_confirmed_at is not null and e.role = 'correspondant' and e.club = c)
    or exists (select 1 from public.vestiaire_membres m
               where m.user_id = auth.uid() and m.club = c and m.statut = 'valide' and m.staff)
  );
$$;
-- Membre validé du club (dans une section précise, ou n'importe laquelle si sec est vide)
create or replace function public.vs_membre(c text, sec text default null) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (select 1 from public.vestiaire_membres m
    where m.user_id = auth.uid() and m.club = c and m.statut = 'valide' and (sec is null or m.section = sec));
$$;
-- Qui peut voir un membre (et ses présences) : lui-même, le club, et en seniors les autres seniors validés.
-- Les jeunes ne sont visibles que du club et de leur parent.
create or replace function public.vs_voit_membre(mid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vestiaire_membres m where m.id = mid and (
    m.user_id = auth.uid() or public.vs_staff(m.club)
    or (m.section = 'seniors' and m.statut = 'valide' and public.vs_membre(m.club, 'seniors'))));
$$;
-- Qui peut répondre pour un membre à un événement : le membre validé lui-même (ou son parent), ou le club
create or replace function public.vs_peut_repondre(eid uuid, mid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vestiaire_membres m join public.vestiaire_evenements e on e.id = eid
    where m.id = mid and e.club = m.club and (e.section = 'club' or e.section = m.section)
      and ((m.user_id = auth.uid() and m.statut = 'valide') or public.vs_staff(m.club)));
$$;
-- Qui peut écrire dans le fil : le club partout ; les seniors validés (hors parents) dans le fil seniors
create or replace function public.vs_peut_publier(c text, sec text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.vs_staff(c) or (sec = 'seniors' and exists (select 1 from public.vestiaire_membres m
    where m.user_id = auth.uid() and m.club = c and m.statut = 'valide' and m.section = 'seniors' and m.qualite <> 'parent'));
$$;
-- Nombre de réponses par événement (des chiffres seulement, aucun nom) : visible de tous
create or replace function public.vs_comptes(ids uuid[]) returns table (evenement_id uuid, presents int, absents int, incertains int)
language sql stable security definer set search_path = public as $$
  select p.evenement_id,
         count(*) filter (where p.reponse = 'present')::int,
         count(*) filter (where p.reponse = 'absent')::int,
         count(*) filter (where p.reponse = 'incertain')::int
  from public.vestiaire_presences p where p.evenement_id = any (ids) group by p.evenement_id;
$$;
revoke all on function public.vs_staff(text) from public;
revoke all on function public.vs_membre(text, text) from public;
revoke all on function public.vs_voit_membre(uuid) from public;
revoke all on function public.vs_peut_repondre(uuid, uuid) from public;
revoke all on function public.vs_peut_publier(text, text) from public;
revoke all on function public.vs_comptes(uuid[]) from public;
grant execute on function public.vs_staff(text) to authenticated;
grant execute on function public.vs_membre(text, text) to authenticated;
grant execute on function public.vs_voit_membre(uuid) to authenticated;
grant execute on function public.vs_peut_repondre(uuid, uuid) to authenticated;
grant execute on function public.vs_peut_publier(text, text) to authenticated;
grant execute on function public.vs_comptes(uuid[]) to anon, authenticated;

-- Le nom affiché sous un message du fil est fixé par Supabase (personne ne peut écrire au nom d'un autre)
create or replace function public.vs_fil_auteur() returns trigger
language plpgsql security definer set search_path = public, auth as $$
declare n text; r text;
begin
  new.user_id := auth.uid();
  new.cree_le := now();
  if not public.vs_staff(new.club) then new.epingle := false; end if;
  select m.nom, case when m.staff then 'Encadrant' when m.qualite = 'encadrant' then 'Encadrant' else 'Joueur' end into n, r
    from public.vestiaire_membres m
    where m.user_id = auth.uid() and m.club = new.club and m.statut = 'valide' and m.qualite <> 'parent'
    order by m.staff desc, (m.section = new.section) desc limit 1;
  if n is null then
    if coalesce(public.mon_role() = 'admin', false) then n := 'Casa Besports'; r := 'Rédaction';
    else
      select coalesce(nullif(trim(e.nom), ''), 'Le club'), 'Correspondant du club' into n, r
        from public.equipe e join auth.users u on lower(u.email) = e.email where u.id = auth.uid() limit 1;
    end if;
  end if;
  new.auteur_nom := coalesce(n, 'Le club');
  new.auteur_role := coalesce(r, 'Le club');
  return new;
end $$;
drop trigger if exists vs_fil_auteur on public.vestiaire_fil;
create trigger vs_fil_auteur before insert on public.vestiaire_fil for each row execute function public.vs_fil_auteur();

-- Le club valide, refuse ou nomme encadrant : il ne peut pas changer la personne ni le club d'une inscription
create or replace function public.vs_membre_fige() returns trigger language plpgsql as $$
begin new.user_id := old.user_id; new.club := old.club; new.cree_le := old.cree_le; return new; end $$;
drop trigger if exists vs_membre_fige on public.vestiaire_membres;
create trigger vs_membre_fige before update on public.vestiaire_membres for each row execute function public.vs_membre_fige();

-- Une réponse de présence garde l'heure de sa dernière mise à jour
create or replace function public.vs_presence_maj() returns trigger language plpgsql as $$
begin new.maj_le := now(); return new; end $$;
drop trigger if exists vs_presence_maj on public.vestiaire_presences;
create trigger vs_presence_maj before insert or update on public.vestiaire_presences for each row execute function public.vs_presence_maj();

-- ========== 3. Les droits (sécurité au niveau des lignes) ==========
alter table public.vestiaire_membres enable row level security;
alter table public.vestiaire_evenements enable row level security;
alter table public.vestiaire_presences enable row level security;
alter table public.vestiaire_fil enable row level security;

-- Membres
drop policy if exists "vs membres lecture" on public.vestiaire_membres;
create policy "vs membres lecture" on public.vestiaire_membres for select to authenticated
  using (user_id = auth.uid() or public.vs_staff(club) or (section = 'seniors' and statut = 'valide' and public.vs_membre(club, 'seniors')));
drop policy if exists "vs membres demande" on public.vestiaire_membres;
create policy "vs membres demande" on public.vestiaire_membres for insert to authenticated
  with check (user_id = auth.uid() and statut = 'en_attente' and not staff);
drop policy if exists "vs membres club valide" on public.vestiaire_membres;
create policy "vs membres club valide" on public.vestiaire_membres for update to authenticated
  using (public.vs_staff(club)) with check (public.vs_staff(club));
drop policy if exists "vs membres retrait" on public.vestiaire_membres;
create policy "vs membres retrait" on public.vestiaire_membres for delete to authenticated
  using (user_id = auth.uid() or public.vs_staff(club));

-- Planning : public en lecture, géré par le club
drop policy if exists "vs planning lecture" on public.vestiaire_evenements;
create policy "vs planning lecture" on public.vestiaire_evenements for select to anon, authenticated using (true);
drop policy if exists "vs planning ajout" on public.vestiaire_evenements;
create policy "vs planning ajout" on public.vestiaire_evenements for insert to authenticated with check (public.vs_staff(club));
drop policy if exists "vs planning modif" on public.vestiaire_evenements;
create policy "vs planning modif" on public.vestiaire_evenements for update to authenticated using (public.vs_staff(club)) with check (public.vs_staff(club));
drop policy if exists "vs planning retrait" on public.vestiaire_evenements;
create policy "vs planning retrait" on public.vestiaire_evenements for delete to authenticated using (public.vs_staff(club));

-- Présences : jamais publiques (le public ne voit que des chiffres, via vs_comptes)
drop policy if exists "vs presences lecture" on public.vestiaire_presences;
create policy "vs presences lecture" on public.vestiaire_presences for select to authenticated using (public.vs_voit_membre(membre_id));
drop policy if exists "vs presences reponse" on public.vestiaire_presences;
create policy "vs presences reponse" on public.vestiaire_presences for insert to authenticated with check (public.vs_peut_repondre(evenement_id, membre_id));
drop policy if exists "vs presences change" on public.vestiaire_presences;
create policy "vs presences change" on public.vestiaire_presences for update to authenticated
  using (public.vs_peut_repondre(evenement_id, membre_id)) with check (public.vs_peut_repondre(evenement_id, membre_id));
drop policy if exists "vs presences retrait" on public.vestiaire_presences;
create policy "vs presences retrait" on public.vestiaire_presences for delete to authenticated using (public.vs_peut_repondre(evenement_id, membre_id));

-- Fil du club : public en lecture
drop policy if exists "vs fil lecture" on public.vestiaire_fil;
create policy "vs fil lecture" on public.vestiaire_fil for select to anon, authenticated using (true);
drop policy if exists "vs fil ecrire" on public.vestiaire_fil;
create policy "vs fil ecrire" on public.vestiaire_fil for insert to authenticated with check (public.vs_peut_publier(club, section));
drop policy if exists "vs fil epingler" on public.vestiaire_fil;
create policy "vs fil epingler" on public.vestiaire_fil for update to authenticated using (public.vs_staff(club)) with check (public.vs_staff(club));
drop policy if exists "vs fil retrait" on public.vestiaire_fil;
create policy "vs fil retrait" on public.vestiaire_fil for delete to authenticated using (user_id = auth.uid() or public.vs_staff(club));

grant select on public.vestiaire_evenements, public.vestiaire_fil to anon;
grant select, insert, update, delete on public.vestiaire_membres, public.vestiaire_evenements, public.vestiaire_presences, public.vestiaire_fil to authenticated;
