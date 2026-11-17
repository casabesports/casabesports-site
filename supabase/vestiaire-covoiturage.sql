-- ================================================================
-- LE VESTIAIRE · COVOITURAGE ET MESSAGES DU DÉPLACEMENT
-- Pour chaque match, plateau ou entraînement : les parents (et les joueurs) proposent une voiture,
-- réservent une place, signalent qu'ils cherchent une place, et s'écrivent dans un fil privé.
--
-- À lancer UNE fois, APRÈS supabase/vestiaire.sql : Supabase › SQL Editor › New query › coller › Run.
-- Le script peut être relancé sans risque.
--
-- Tout est PRIVÉ : seuls le club et les membres validés de la section concernée voient le covoiturage.
-- Protection des jeunes :
--   • Les noms affichés sont ceux des ADULTES (prénom + initiale du compte), jamais ceux des enfants.
--   • Le prénom d'un enfant passager n'est visible que du conducteur, de son parent et du club.
--   • Le téléphone du conducteur n'apparaît que s'il l'a choisi, et seulement aux familles du déplacement.
-- ================================================================

-- ========== 1. Les tables ==========
create table if not exists public.vestiaire_trajets (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references public.vestiaire_evenements (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  conducteur text,
  sens text not null default 'aller_retour' check (sens in ('aller', 'retour', 'aller_retour')),
  places int not null check (places between 1 and 8),
  rdv_lieu text check (rdv_lieu is null or char_length(rdv_lieu) <= 120),
  rdv_heure text check (rdv_heure is null or rdv_heure ~ '^[0-2][0-9]:[0-5][0-9]$'),
  telephone text check (telephone is null or telephone ~ '^\+?[0-9 .]{8,20}$'),
  note text check (note is null or char_length(note) <= 200),
  cree_le timestamptz not null default now()
);
create index if not exists vestiaire_trajets_evt on public.vestiaire_trajets (evenement_id);

create table if not exists public.vestiaire_passagers (
  trajet_id uuid not null references public.vestiaire_trajets (id) on delete cascade,
  membre_id uuid not null references public.vestiaire_membres (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  nom text,
  cree_le timestamptz not null default now(),
  primary key (trajet_id, membre_id)
);
-- Nom du passager (prénom + initiale), recopié pour que le conducteur sache qui il emmène
alter table public.vestiaire_passagers add column if not exists nom text;

create table if not exists public.vestiaire_besoins (
  evenement_id uuid not null references public.vestiaire_evenements (id) on delete cascade,
  membre_id uuid not null references public.vestiaire_membres (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  sens text not null default 'aller_retour' check (sens in ('aller', 'retour', 'aller_retour')),
  cree_le timestamptz not null default now(),
  primary key (evenement_id, membre_id)
);

create table if not exists public.vestiaire_messages (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references public.vestiaire_evenements (id) on delete cascade,
  user_id uuid default auth.uid(),
  auteur text,
  texte text not null check (char_length(trim(texte)) between 1 and 500),
  cree_le timestamptz not null default now()
);
create index if not exists vestiaire_messages_evt on public.vestiaire_messages (evenement_id, cree_le);

-- ========== 2. Les vérifications ==========
-- Accès au déplacement : le club, ou un membre validé de la section de l'événement
create or replace function public.vs_acces_evt(eid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vestiaire_evenements e where e.id = eid and (
    public.vs_staff(e.club) or exists (select 1 from public.vestiaire_membres m
      where m.user_id = auth.uid() and m.club = e.club and m.statut = 'valide' and (e.section = 'club' or m.section = e.section))));
$$;
-- Le membre (enfant ou joueur) est bien à moi et concerné par l'événement (ou je suis le club)
create or replace function public.vs_mon_membre_evt(mid uuid, eid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.vestiaire_membres m join public.vestiaire_evenements e on e.id = eid
    where m.id = mid and m.club = e.club and m.statut = 'valide' and (e.section = 'club' or m.section = e.section)
      and (m.user_id = auth.uid() or public.vs_staff(e.club)));
$$;
create or replace function public.vs_trajet_evt(tid uuid) returns uuid
language sql stable security definer set search_path = public as $$ select evenement_id from public.vestiaire_trajets where id = tid; $$;
create or replace function public.vs_conducteur(tid uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.vestiaire_trajets where id = tid and user_id = auth.uid()); $$;
create or replace function public.vs_staff_evt(eid uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.vestiaire_evenements e where e.id = eid and public.vs_staff(e.club)); $$;

-- Nom affiché d'un ADULTE : prénom + initiale de son compte, puis son rôle (jamais le nom d'un enfant)
create or replace function public.vs_nom_adulte(eid uuid) returns text
language plpgsql stable security definer set search_path = public, auth as $$
declare n text; r text; c text;
begin
  select club into c from public.vestiaire_evenements where id = eid;
  select coalesce(nullif(trim(u.raw_user_meta_data ->> 'name'), ''), nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)) into n
    from auth.users u where u.id = auth.uid();
  n := split_part(trim(coalesce(n, 'Membre')), ' ', 1) ||
       case when position(' ' in trim(coalesce(n, ''))) > 0 then ' ' || upper(left(split_part(trim(n), ' ', 2), 1)) || '.' else '' end;
  n := initcap(left(n, 30));
  if public.vs_staff(c) then r := 'club';
  elsif exists (select 1 from public.vestiaire_membres m where m.user_id = auth.uid() and m.club = c and m.statut = 'valide' and m.qualite = 'parent') then r := 'parent';
  else r := 'joueur'; end if;
  return n || ' · ' || r;
end $$;

-- Places : on ne réserve pas dans une voiture pleine
create or replace function public.vs_passager_avant() returns trigger
language plpgsql security definer set search_path = public as $$
declare cap int; pris int;
begin
  -- la réservation appartient à la famille de l'enfant (même si c'est le club qui l'inscrit)
  select m.user_id, m.nom into new.user_id, new.nom from public.vestiaire_membres m where m.id = new.membre_id;
  new.cree_le := now();
  select places into cap from public.vestiaire_trajets where id = new.trajet_id for update;
  select count(*) into pris from public.vestiaire_passagers where trajet_id = new.trajet_id;
  if pris >= cap then raise exception 'Cette voiture est complète'; end if;
  -- la personne n'a plus besoin de chercher une place
  delete from public.vestiaire_besoins b where b.membre_id = new.membre_id and b.evenement_id = (select evenement_id from public.vestiaire_trajets where id = new.trajet_id);
  return new;
end $$;
drop trigger if exists vs_passager_avant on public.vestiaire_passagers;
create trigger vs_passager_avant before insert on public.vestiaire_passagers for each row execute function public.vs_passager_avant();

create or replace function public.vs_trajet_avant() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then new.user_id := auth.uid(); new.cree_le := now(); new.conducteur := public.vs_nom_adulte(new.evenement_id);
  else new.user_id := old.user_id; new.evenement_id := old.evenement_id; new.conducteur := old.conducteur; new.cree_le := old.cree_le;
    if new.places < (select count(*) from public.vestiaire_passagers where trajet_id = old.id) then raise exception 'Des passagers sont déjà inscrits : retirez-en avant de réduire les places'; end if;
  end if;
  return new;
end $$;
drop trigger if exists vs_trajet_avant on public.vestiaire_trajets;
create trigger vs_trajet_avant before insert or update on public.vestiaire_trajets for each row execute function public.vs_trajet_avant();

create or replace function public.vs_message_avant() returns trigger
language plpgsql security definer set search_path = public as $$
begin new.user_id := auth.uid(); new.cree_le := now(); new.auteur := public.vs_nom_adulte(new.evenement_id); return new; end $$;
drop trigger if exists vs_message_avant on public.vestiaire_messages;
create trigger vs_message_avant before insert on public.vestiaire_messages for each row execute function public.vs_message_avant();

create or replace function public.vs_besoin_avant() returns trigger
language plpgsql security definer set search_path = public as $$
begin new.user_id := (select user_id from public.vestiaire_membres where id = new.membre_id); new.cree_le := now(); return new; end $$;
drop trigger if exists vs_besoin_avant on public.vestiaire_besoins;
create trigger vs_besoin_avant before insert on public.vestiaire_besoins for each row execute function public.vs_besoin_avant();

-- Résumé par événement (des chiffres, pour les personnes qui ont accès au déplacement)
create or replace function public.vs_covoit_resume(ids uuid[])
returns table (evenement_id uuid, voitures int, places int, prises int, besoins int, messages int)
language sql stable security definer set search_path = public as $$
  select e.id,
    (select count(*) from public.vestiaire_trajets t where t.evenement_id = e.id)::int,
    (select coalesce(sum(t.places), 0) from public.vestiaire_trajets t where t.evenement_id = e.id)::int,
    (select count(*) from public.vestiaire_passagers p join public.vestiaire_trajets t on t.id = p.trajet_id where t.evenement_id = e.id)::int,
    (select count(*) from public.vestiaire_besoins b where b.evenement_id = e.id)::int,
    (select count(*) from public.vestiaire_messages x where x.evenement_id = e.id)::int
  from public.vestiaire_evenements e where e.id = any (ids) and public.vs_acces_evt(e.id);
$$;
-- Places prises par voiture (des chiffres seulement) et « est-ce mon enfant ? » pour chaque famille
create or replace function public.vs_places_prises(eid uuid) returns table (trajet_id uuid, prises int)
language sql stable security definer set search_path = public as $$
  select t.id, (select count(*) from public.vestiaire_passagers p where p.trajet_id = t.id)::int
  from public.vestiaire_trajets t where t.evenement_id = eid and public.vs_acces_evt(eid);
$$;

do $$ declare f text; begin
  foreach f in array array['vs_acces_evt(uuid)', 'vs_mon_membre_evt(uuid, uuid)', 'vs_trajet_evt(uuid)', 'vs_conducteur(uuid)', 'vs_staff_evt(uuid)', 'vs_nom_adulte(uuid)', 'vs_covoit_resume(uuid[])', 'vs_places_prises(uuid)'] loop
    execute 'revoke all on function public.' || f || ' from public';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end $$;

-- ========== 3. Les droits ==========
alter table public.vestiaire_trajets enable row level security;
alter table public.vestiaire_passagers enable row level security;
alter table public.vestiaire_besoins enable row level security;
alter table public.vestiaire_messages enable row level security;

-- Voitures : vues par les familles du déplacement ; proposées par elles ; modifiées ou retirées par le conducteur ou le club
drop policy if exists "vs trajets lecture" on public.vestiaire_trajets;
create policy "vs trajets lecture" on public.vestiaire_trajets for select to authenticated using (public.vs_acces_evt(evenement_id));
drop policy if exists "vs trajets ajout" on public.vestiaire_trajets;
create policy "vs trajets ajout" on public.vestiaire_trajets for insert to authenticated with check (public.vs_acces_evt(evenement_id));
drop policy if exists "vs trajets modif" on public.vestiaire_trajets;
create policy "vs trajets modif" on public.vestiaire_trajets for update to authenticated
  using (user_id = auth.uid() or public.vs_staff_evt(evenement_id)) with check (public.vs_acces_evt(evenement_id));
drop policy if exists "vs trajets retrait" on public.vestiaire_trajets;
create policy "vs trajets retrait" on public.vestiaire_trajets for delete to authenticated using (user_id = auth.uid() or public.vs_staff_evt(evenement_id));

-- Passagers : le nom de l'enfant n'est vu que par son parent, le conducteur et le club
drop policy if exists "vs passagers lecture" on public.vestiaire_passagers;
create policy "vs passagers lecture" on public.vestiaire_passagers for select to authenticated
  using (user_id = auth.uid() or public.vs_conducteur(trajet_id) or public.vs_staff_evt(public.vs_trajet_evt(trajet_id)));
drop policy if exists "vs passagers reserve" on public.vestiaire_passagers;
create policy "vs passagers reserve" on public.vestiaire_passagers for insert to authenticated
  with check (public.vs_mon_membre_evt(membre_id, public.vs_trajet_evt(trajet_id)));
drop policy if exists "vs passagers retrait" on public.vestiaire_passagers;
create policy "vs passagers retrait" on public.vestiaire_passagers for delete to authenticated
  using (user_id = auth.uid() or public.vs_conducteur(trajet_id) or public.vs_staff_evt(public.vs_trajet_evt(trajet_id)));

-- « Je cherche une place » : le nom n'est vu que par sa famille et le club (les autres voient un nombre)
drop policy if exists "vs besoins lecture" on public.vestiaire_besoins;
create policy "vs besoins lecture" on public.vestiaire_besoins for select to authenticated using (user_id = auth.uid() or public.vs_staff_evt(evenement_id));
drop policy if exists "vs besoins ajout" on public.vestiaire_besoins;
create policy "vs besoins ajout" on public.vestiaire_besoins for insert to authenticated with check (public.vs_mon_membre_evt(membre_id, evenement_id));
drop policy if exists "vs besoins retrait" on public.vestiaire_besoins;
create policy "vs besoins retrait" on public.vestiaire_besoins for delete to authenticated using (user_id = auth.uid() or public.vs_staff_evt(evenement_id));

-- Messages du déplacement : privés, entre les familles concernées et le club
drop policy if exists "vs messages lecture" on public.vestiaire_messages;
create policy "vs messages lecture" on public.vestiaire_messages for select to authenticated using (public.vs_acces_evt(evenement_id));
drop policy if exists "vs messages ecrire" on public.vestiaire_messages;
create policy "vs messages ecrire" on public.vestiaire_messages for insert to authenticated with check (public.vs_acces_evt(evenement_id));
drop policy if exists "vs messages retrait" on public.vestiaire_messages;
create policy "vs messages retrait" on public.vestiaire_messages for delete to authenticated using (user_id = auth.uid() or public.vs_staff_evt(evenement_id));

revoke all on public.vestiaire_trajets, public.vestiaire_passagers, public.vestiaire_besoins, public.vestiaire_messages from anon;
grant select, insert, update, delete on public.vestiaire_trajets, public.vestiaire_passagers, public.vestiaire_besoins, public.vestiaire_messages to authenticated;
