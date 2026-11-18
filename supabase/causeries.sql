-- ================================================================
-- LES CAUSERIES D'AVANT-MATCH (dans le Vestiaire)
-- Le coach prépare sa causerie : un PDF déposé, des photos de son travail, et/ou le modèle Casa en ligne
-- (mot du coach, compo, schémas tactiques, coups de pied arrêtés, tireurs, 3 clés, phrase du jour).
--
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller tout ce fichier › Run.
-- À lancer APRÈS supabase/vestiaire.sql (déjà fait). Le script peut être relancé sans risque.
--
-- Qui voit quoi (vérifié par Supabase, pas seulement par le site) :
--   • Le club (correspondant, encadrants nommés dans le Vestiaire, administrateur) crée, modifie et voit tout.
--   • Un joueur (ou le parent d'un jeune) ne voit une causerie que si :
--       - elle est publiée, entre l'heure d'ouverture et l'heure de fermeture choisies par le coach ;
--       - ET le coach lui a donné l'accès : « les convoqués du match » (membres de l'équipe qui n'ont pas répondu Absent),
--         « toute l'équipe », ou la liste de personnes qu'il a cochées / ajoutées.
--   • Pour tous les autres (public, autres équipes, adversaires), la causerie n'existe pas.
--   • Les fichiers (PDF, photos) sont dans un dossier PRIVÉ « causeries » : mêmes règles.
--   • Les notes réservées au staff (gardien, adversaire) sont dans une table à part, lisible du club seulement.
-- ================================================================

-- ========== 1. Les tables ==========
create table if not exists public.causeries (
  id uuid primary key default gen_random_uuid(),
  club text not null check (char_length(club) between 1 and 60),
  evenement_id uuid references public.vestiaire_evenements (id) on delete set null,
  section text not null default 'seniors' check (section in ('club', 'seniors', 'jeunes')),
  equipe text check (equipe is null or char_length(equipe) <= 30),
  sport text not null default 'football' check (char_length(sport) <= 20),
  titre text not null check (char_length(trim(titre)) between 1 and 120),
  genre text not null default 'modele' check (genre in ('pdf', 'modele', 'photo')),
  contenu jsonb not null default '{}'::jsonb check (pg_column_size(contenu) < 600000),
  fichier text check (fichier is null or char_length(fichier) <= 200),
  fichier_nom text check (fichier_nom is null or char_length(fichier_nom) <= 160),
  acces text not null default 'convoques' check (acces in ('convoques', 'equipe', 'liste')),
  ouvre_le timestamptz,
  ferme_le timestamptz,
  telechargement boolean not null default false,
  notifier boolean not null default true,
  notifie boolean not null default false,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'publie')),
  auteur_nom text,
  cree_par uuid default auth.uid(),
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now()
);
create index if not exists causeries_club on public.causeries (club, cree_le desc);

-- Accès au cas par cas : autorise = true (personne ajoutée ou cochée), false (personne décochée)
create table if not exists public.causerie_acces (
  causerie_id uuid not null references public.causeries (id) on delete cascade,
  membre_id uuid not null references public.vestiaire_membres (id) on delete cascade,
  autorise boolean not null default true,
  primary key (causerie_id, membre_id)
);

-- « J'ai lu »
create table if not exists public.causerie_lectures (
  causerie_id uuid not null references public.causeries (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nom text,
  lu_le timestamptz not null default now(),
  primary key (causerie_id, user_id)
);

-- Notes réservées au staff (jamais visibles des joueurs)
create table if not exists public.causerie_notes (
  causerie_id uuid primary key references public.causeries (id) on delete cascade,
  texte text not null default '' check (char_length(texte) <= 4000),
  maj_le timestamptz not null default now()
);

-- ========== 2. Les vérifications (exécutées par Supabase) ==========
-- Le club de la causerie
create or replace function public.cz_staff(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.causeries z where z.id = cid and public.vs_staff(z.club));
$$;

-- Le coach a-t-il donné l'accès à ce membre du vestiaire ?
create or replace function public.cz_membre_autorise(cid uuid, mid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.causeries z join public.vestiaire_membres m on m.id = mid and m.club = z.club and m.statut = 'valide'
    where z.id = cid and (
      exists (select 1 from public.causerie_acces a where a.causerie_id = z.id and a.membre_id = m.id and a.autorise)
      or (
        not exists (select 1 from public.causerie_acces a where a.causerie_id = z.id and a.membre_id = m.id and not a.autorise)
        and z.acces in ('convoques', 'equipe')
        and (z.section = 'club' or m.section = z.section)
        and (z.equipe is null or m.equipe is null or lower(m.equipe) = lower(z.equipe))
        and (z.acces = 'equipe' or z.evenement_id is null or not exists (
              select 1 from public.vestiaire_presences p where p.evenement_id = z.evenement_id and p.membre_id = m.id and p.reponse = 'absent'))
      )
    )
  );
$$;

-- La personne connectée peut-elle ouvrir la causerie ?
create or replace function public.cz_peut_voir(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists (
    select 1 from public.causeries z where z.id = cid and (
      public.vs_staff(z.club)
      or (z.statut = 'publie'
          and (z.ouvre_le is null or now() >= z.ouvre_le)
          and (z.ferme_le is null or now() < z.ferme_le)
          and exists (select 1 from public.vestiaire_membres m
                      where m.user_id = auth.uid() and m.club = z.club and m.statut = 'valide'
                        and public.cz_membre_autorise(z.id, m.id)))
    )
  );
$$;

-- Dossier de fichiers : « <id de la causerie>/<fichier> »
create or replace function public.cz_id_de(chemin text) returns uuid
language plpgsql immutable as $$
begin
  return split_part(chemin, '/', 1)::uuid;
exception when others then
  return null;
end;
$$;

-- Lectures : chiffres pour le club (lus / personnes ayant l'accès)
create or replace function public.cz_lectures(ids uuid[]) returns table (causerie_id uuid, lus int, total int)
language sql stable security definer set search_path = public as $$
  select z.id,
    (select count(*)::int from public.causerie_lectures l where l.causerie_id = z.id),
    (select count(distinct m.user_id)::int from public.vestiaire_membres m
       where m.club = z.club and m.statut = 'valide' and public.cz_membre_autorise(z.id, m.id))
  from public.causeries z where z.id = any (ids) and public.vs_staff(z.club);
$$;

-- Comptes à prévenir (utilisé seulement par la fonction « notifications », jamais par le site)
create or replace function public.cz_destinataires(cid uuid) returns setof uuid
language sql stable security definer set search_path = public as $$
  select distinct m.user_id from public.vestiaire_membres m join public.causeries z on z.id = cid and z.club = m.club
  where m.statut = 'valide' and public.cz_membre_autorise(z.id, m.id);
$$;

revoke all on function public.cz_staff(uuid) from public;
revoke all on function public.cz_membre_autorise(uuid, uuid) from public;
revoke all on function public.cz_peut_voir(uuid) from public;
revoke all on function public.cz_lectures(uuid[]) from public;
revoke all on function public.cz_destinataires(uuid) from public, anon, authenticated;
grant execute on function public.cz_staff(uuid) to authenticated;
grant execute on function public.cz_membre_autorise(uuid, uuid) to authenticated;
grant execute on function public.cz_peut_voir(uuid) to authenticated;
grant execute on function public.cz_lectures(uuid[]) to authenticated;
grant execute on function public.cz_id_de(text) to authenticated;
grant execute on function public.cz_destinataires(uuid) to service_role;

-- Nom de l'auteur et date de mise à jour, remplis par Supabase
create or replace function public.cz_avant_ecriture() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.maj_le := now();
  if tg_op = 'INSERT' then
    new.cree_par := auth.uid();
    new.notifie := false;
    select coalesce((select m.nom from public.vestiaire_membres m where m.user_id = auth.uid() and m.club = new.club and m.statut = 'valide' order by m.staff desc limit 1), 'Le coach')
      into new.auteur_nom;
  else
    new.club := old.club; new.cree_par := old.cree_par; new.cree_le := old.cree_le; new.auteur_nom := old.auteur_nom;
    if coalesce(auth.role(), '') <> 'service_role' then new.notifie := old.notifie; end if;
  end if;
  return new;
end;
$$;
drop trigger if exists cz_avant_ecriture on public.causeries;
create trigger cz_avant_ecriture before insert or update on public.causeries for each row execute function public.cz_avant_ecriture();

create or replace function public.cz_lecture_nom() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid(); new.lu_le := now();
  select coalesce((select m.nom from public.vestiaire_membres m join public.causeries z on z.id = new.causerie_id and z.club = m.club
                   where m.user_id = auth.uid() and m.statut = 'valide' order by m.cree_le limit 1), 'Membre') into new.nom;
  return new;
end;
$$;
drop trigger if exists cz_lecture_nom on public.causerie_lectures;
create trigger cz_lecture_nom before insert on public.causerie_lectures for each row execute function public.cz_lecture_nom();

-- ========== 3. Les droits (sécurité au niveau des lignes) ==========
alter table public.causeries enable row level security;
alter table public.causerie_acces enable row level security;
alter table public.causerie_lectures enable row level security;
alter table public.causerie_notes enable row level security;

drop policy if exists "cz lecture" on public.causeries;
-- vs_staff(club) d'abord : la ligne qu'on vient de créer est relue tout de suite (insert … returning)
create policy "cz lecture" on public.causeries for select to authenticated using (public.vs_staff(club) or public.cz_peut_voir(id));
drop policy if exists "cz ajout" on public.causeries;
create policy "cz ajout" on public.causeries for insert to authenticated with check (public.vs_staff(club));
drop policy if exists "cz modif" on public.causeries;
create policy "cz modif" on public.causeries for update to authenticated using (public.vs_staff(club)) with check (public.vs_staff(club));
drop policy if exists "cz retrait" on public.causeries;
create policy "cz retrait" on public.causeries for delete to authenticated using (public.vs_staff(club));

drop policy if exists "cz acces club" on public.causerie_acces;
create policy "cz acces club" on public.causerie_acces for all to authenticated using (public.cz_staff(causerie_id)) with check (public.cz_staff(causerie_id));

drop policy if exists "cz lu lecture" on public.causerie_lectures;
create policy "cz lu lecture" on public.causerie_lectures for select to authenticated using (user_id = auth.uid() or public.cz_staff(causerie_id));
drop policy if exists "cz lu ajout" on public.causerie_lectures;
create policy "cz lu ajout" on public.causerie_lectures for insert to authenticated with check (public.cz_peut_voir(causerie_id));
drop policy if exists "cz lu retrait" on public.causerie_lectures;
create policy "cz lu retrait" on public.causerie_lectures for delete to authenticated using (user_id = auth.uid());

drop policy if exists "cz notes club" on public.causerie_notes;
create policy "cz notes club" on public.causerie_notes for all to authenticated using (public.cz_staff(causerie_id)) with check (public.cz_staff(causerie_id));

grant select, insert, update, delete on public.causeries, public.causerie_acces, public.causerie_lectures, public.causerie_notes to authenticated;

-- ========== 4. Les fichiers : dossier PRIVÉ « causeries » (PDF et photos, 15 Mo maximum) ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('causeries', 'causeries', false, 15728640, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 15728640, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cz fichiers lecture" on storage.objects;
create policy "cz fichiers lecture" on storage.objects for select to authenticated
  using (bucket_id = 'causeries' and public.cz_peut_voir(public.cz_id_de(name)));
drop policy if exists "cz fichiers depot" on storage.objects;
create policy "cz fichiers depot" on storage.objects for insert to authenticated
  with check (bucket_id = 'causeries' and public.cz_staff(public.cz_id_de(name)));
drop policy if exists "cz fichiers remplacement" on storage.objects;
create policy "cz fichiers remplacement" on storage.objects for update to authenticated
  using (bucket_id = 'causeries' and public.cz_staff(public.cz_id_de(name)));
drop policy if exists "cz fichiers retrait" on storage.objects;
create policy "cz fichiers retrait" on storage.objects for delete to authenticated
  using (bucket_id = 'causeries' and public.cz_staff(public.cz_id_de(name)));
