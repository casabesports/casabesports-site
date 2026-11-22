-- ================================================================
-- CLUB HOUSE · DISCUSSIONS (le chat entre amis BE+)
-- Groupes ouverts (tout membre connecté peut les lire et les rejoindre),
-- groupes à huis clos (sur invitation : code ou lien, invisibles des autres)
-- et conversations privées à deux (avec un ami de groupe ou par son numéro de membre).
--
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller tout le fichier › Run.
-- Le script peut être relancé sans risque. Guide : docs/DISCUSSIONS.md
--
-- Règles :
--   • Réservé aux membres connectés de 15 ans ou plus, qui ont accepté la charte.
--   • Seul un pseudo et une « qualité » (supporter, joueur, coach…) sont visibles : jamais l'e-mail ni le téléphone.
--   • Huis clos et privé : le contenu n'est lisible que des membres du groupe. L'administrateur
--     ne lit un message privé QUE s'il a été signalé.
--   • Anti-abus : 15 messages par minute au plus, signalement, retrait par l'animateur du groupe.
-- ================================================================

-- ========== 1. Les tables ==========
create table if not exists public.discussions_profils (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  pseudo text not null check (char_length(trim(pseudo)) between 2 and 30),
  qualite text not null default 'supporter' check (qualite in ('supporter', 'joueur', 'coach', 'dirigeant', 'arbitre', 'benevole', 'parent', 'media')),
  sport text check (sport is null or char_length(sport) <= 40),
  plus_de_15_ans boolean not null check (plus_de_15_ans),
  charte_acceptee boolean not null check (charte_acceptee),
  cree_le timestamptz not null default now()
);

create table if not exists public.discussions_groupes (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(trim(nom)) between 2 and 60),
  description text check (description is null or char_length(description) <= 200),
  type text not null default 'ouvert' check (type in ('ouvert', 'huis_clos', 'prive')),
  sport text check (sport is null or char_length(sport) <= 40),
  code text unique,
  createur uuid default auth.uid() references auth.users (id) on delete set null,
  cree_le timestamptz not null default now(),
  dernier_message timestamptz not null default now(),
  dernier_texte text
);
create index if not exists discussions_groupes_type on public.discussions_groupes (type, dernier_message desc);

create table if not exists public.discussions_membres (
  groupe_id uuid not null references public.discussions_groupes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'membre' check (role in ('animateur', 'membre')),
  lu_le timestamptz not null default now(),
  cree_le timestamptz not null default now(),
  primary key (groupe_id, user_id)
);
create index if not exists discussions_membres_user on public.discussions_membres (user_id);

create table if not exists public.discussions_messages (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.discussions_groupes (id) on delete cascade,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  auteur text,
  qualite text,
  texte text not null check (char_length(trim(texte)) between 1 and 1000),
  cree_le timestamptz not null default now()
);
create index if not exists discussions_messages_groupe on public.discussions_messages (groupe_id, cree_le desc);

create table if not exists public.discussions_signalements (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.discussions_messages (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  motif text check (motif is null or char_length(motif) <= 200),
  traite boolean not null default false,
  cree_le timestamptz not null default now(),
  unique (message_id, user_id)
);

-- ========== 2. Les vérifications (security definer : pas de boucle entre les règles) ==========
create or replace function public.dc_est_admin() returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  if to_regprocedure('public.est_admin()') is null then return false; end if;
  return public.est_admin();
end $$;
create or replace function public.dc_profil_ok() returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.discussions_profils where user_id = auth.uid()); $$;
create or replace function public.dc_membre(g uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.discussions_membres where groupe_id = g and user_id = auth.uid()); $$;
create or replace function public.dc_animateur(g uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.discussions_membres where groupe_id = g and user_id = auth.uid() and role = 'animateur'); $$;
create or replace function public.dc_ouvert(g uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from public.discussions_groupes where id = g and type = 'ouvert'); $$;
-- Lire un groupe : ouvert (membre connecté avec profil), ou j'en suis membre
create or replace function public.dc_peut_lire(g uuid) returns boolean
language sql stable security definer set search_path = public as $$ select public.dc_membre(g) or (public.dc_ouvert(g) and public.dc_profil_ok()) or (public.dc_ouvert(g) and public.dc_est_admin()); $$;
-- Deux personnes partagent-elles déjà un groupe ?
create or replace function public.dc_voisin(u uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.discussions_membres a join public.discussions_membres b on a.groupe_id = b.groupe_id where a.user_id = auth.uid() and b.user_id = u);
$$;
create or replace function public.dc_nouveau_code() returns text
language plpgsql volatile set search_path = public as $$
declare c text; abc text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; i int;
begin
  loop
    c := '';
    for i in 1..8 loop c := c || substr(abc, 1 + floor(random() * length(abc))::int, 1); end loop;
    exit when not exists (select 1 from public.discussions_groupes where code = c);
  end loop;
  return c;
end $$;

-- ========== 3. Les règles d'accès (RLS) ==========
alter table public.discussions_profils enable row level security;
alter table public.discussions_groupes enable row level security;
alter table public.discussions_membres enable row level security;
alter table public.discussions_messages enable row level security;
alter table public.discussions_signalements enable row level security;

-- Profils : pseudo et qualité visibles des membres connectés ; chacun gère le sien
drop policy if exists "dc profils lus" on public.discussions_profils;
create policy "dc profils lus" on public.discussions_profils for select to authenticated using (true);
drop policy if exists "dc mon profil cree" on public.discussions_profils;
create policy "dc mon profil cree" on public.discussions_profils for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "dc mon profil modifie" on public.discussions_profils;
create policy "dc mon profil modifie" on public.discussions_profils for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "dc mon profil supprime" on public.discussions_profils;
create policy "dc mon profil supprime" on public.discussions_profils for delete to authenticated using (user_id = auth.uid());

-- Groupes : création et adhésion par les fonctions ci-dessous uniquement
drop policy if exists "dc groupes lus" on public.discussions_groupes;
create policy "dc groupes lus" on public.discussions_groupes for select to authenticated using (public.dc_peut_lire(id) or public.dc_est_admin());
drop policy if exists "dc groupes modifies" on public.discussions_groupes;
create policy "dc groupes modifies" on public.discussions_groupes for update to authenticated using (public.dc_animateur(id)) with check (public.dc_animateur(id));
drop policy if exists "dc groupes supprimes" on public.discussions_groupes;
create policy "dc groupes supprimes" on public.discussions_groupes for delete to authenticated using (public.dc_animateur(id) or (type = 'ouvert' and public.dc_est_admin()));
revoke update on public.discussions_groupes from authenticated;
grant update (nom, description, sport) on public.discussions_groupes to authenticated;

-- Membres : visibles de ceux qui peuvent lire le groupe ; chacun se retire, l'animateur retire
drop policy if exists "dc membres lus" on public.discussions_membres;
create policy "dc membres lus" on public.discussions_membres for select to authenticated using (public.dc_peut_lire(groupe_id));
drop policy if exists "dc membres retires" on public.discussions_membres;
create policy "dc membres retires" on public.discussions_membres for delete to authenticated using (user_id = auth.uid() or public.dc_animateur(groupe_id));
drop policy if exists "dc lu le" on public.discussions_membres;
create policy "dc lu le" on public.discussions_membres for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.discussions_membres from authenticated;
grant update (lu_le) on public.discussions_membres to authenticated;

-- Messages : écrits par les membres du groupe ; lus par qui peut lire le groupe ; l'admin lit ce qui est signalé
drop policy if exists "dc messages lus" on public.discussions_messages;
create policy "dc messages lus" on public.discussions_messages for select to authenticated using (
  public.dc_peut_lire(groupe_id) or (public.dc_est_admin() and exists (select 1 from public.discussions_signalements s where s.message_id = discussions_messages.id)));
drop policy if exists "dc messages ecrits" on public.discussions_messages;
create policy "dc messages ecrits" on public.discussions_messages for insert to authenticated with check (user_id = auth.uid() and public.dc_membre(groupe_id) and public.dc_profil_ok());
drop policy if exists "dc messages supprimes" on public.discussions_messages;
create policy "dc messages supprimes" on public.discussions_messages for delete to authenticated using (
  user_id = auth.uid() or public.dc_animateur(groupe_id) or (public.dc_est_admin() and (public.dc_ouvert(groupe_id) or exists (select 1 from public.discussions_signalements s where s.message_id = discussions_messages.id))));

-- Signalements : chacun signale ce qu'il peut lire ; l'administrateur les traite
drop policy if exists "dc signalement envoye" on public.discussions_signalements;
create policy "dc signalement envoye" on public.discussions_signalements for insert to authenticated with check (
  user_id = auth.uid() and exists (select 1 from public.discussions_messages m where m.id = message_id and public.dc_peut_lire(m.groupe_id)));
drop policy if exists "dc signalements lus" on public.discussions_signalements;
create policy "dc signalements lus" on public.discussions_signalements for select to authenticated using (public.dc_est_admin() or user_id = auth.uid());
drop policy if exists "dc signalements traites" on public.discussions_signalements;
create policy "dc signalements traites" on public.discussions_signalements for update to authenticated using (public.dc_est_admin()) with check (public.dc_est_admin());

-- ========== 4. Avant chaque message : auteur, horodatage, anti-abus ==========
create or replace function public.dc_message_avant() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select pseudo, qualite into new.auteur, new.qualite from public.discussions_profils where user_id = auth.uid();
  new.user_id := auth.uid();
  new.cree_le := now();
  new.texte := left(trim(new.texte), 1000);
  select count(*) into n from public.discussions_messages where user_id = auth.uid() and cree_le > now() - interval '1 minute';
  if n >= 15 then raise exception 'Doucement : trop de messages en une minute, patientez un instant'; end if;
  return new;
end $$;
drop trigger if exists dc_message_avant on public.discussions_messages;
create trigger dc_message_avant before insert on public.discussions_messages for each row execute function public.dc_message_avant();

create or replace function public.dc_message_apres() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.discussions_groupes set dernier_message = new.cree_le, dernier_texte = coalesce(new.auteur, 'Membre') || ' : ' || left(new.texte, 80) where id = new.groupe_id;
  update public.discussions_membres set lu_le = new.cree_le where groupe_id = new.groupe_id and user_id = auth.uid();
  return null;
end $$;
drop trigger if exists dc_message_apres on public.discussions_messages;
create trigger dc_message_apres after insert on public.discussions_messages for each row execute function public.dc_message_apres();

-- ========== 5. Les actions ==========
-- Créer un groupe (ouvert ou à huis clos) : la personne en devient l'animateur
create or replace function public.dc_creer_groupe(nom text, description text default null, type text default 'ouvert', sport text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare g uuid; t text := case when type = 'huis_clos' then 'huis_clos' else 'ouvert' end; n int;
begin
  if auth.uid() is null or not public.dc_profil_ok() then raise exception 'Créez d''abord votre profil de discussion'; end if;
  select count(*) into n from public.discussions_groupes where createur = auth.uid() and cree_le > now() - interval '1 day';
  if n >= 10 then raise exception 'Dix groupes créés aujourd''hui : réessayez demain'; end if;
  insert into public.discussions_groupes (nom, description, type, sport, code, createur)
    values (left(trim(nom), 60), nullif(left(trim(coalesce(description, '')), 200), ''), t, nullif(left(trim(coalesce(sport, '')), 40), ''), public.dc_nouveau_code(), auth.uid())
    returning id into g;
  insert into public.discussions_membres (groupe_id, user_id, role) values (g, auth.uid(), 'animateur');
  return g;
end $$;

-- Rejoindre un groupe ouvert
create or replace function public.dc_rejoindre(g uuid) returns uuid
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.dc_profil_ok() then raise exception 'Créez d''abord votre profil de discussion'; end if;
  if not public.dc_ouvert(g) then raise exception 'Ce groupe est à huis clos : il faut son code d''invitation'; end if;
  insert into public.discussions_membres (groupe_id, user_id) values (g, auth.uid()) on conflict do nothing;
  return g;
end $$;

-- Rejoindre avec un code d'invitation (groupe ouvert ou à huis clos)
create or replace function public.dc_rejoindre_code(c text) returns uuid
language plpgsql security definer set search_path = public as $$
declare g uuid;
begin
  if auth.uid() is null or not public.dc_profil_ok() then raise exception 'Créez d''abord votre profil de discussion'; end if;
  select id into g from public.discussions_groupes where code = upper(regexp_replace(coalesce(c, ''), '[^A-Za-z0-9]', '', 'g')) and type <> 'prive';
  if g is null then raise exception 'Code inconnu ou périmé'; end if;
  insert into public.discussions_membres (groupe_id, user_id) values (g, auth.uid()) on conflict do nothing;
  return g;
end $$;

-- Ouvrir (ou retrouver) une conversation privée à deux
create or replace function public.dc_prive_avec(autre uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare g uuid; p1 text; p2 text;
begin
  if auth.uid() is null or not public.dc_profil_ok() then raise exception 'Créez d''abord votre profil de discussion'; end if;
  if autre is null or autre = auth.uid() then raise exception 'Choisissez un ami'; end if;
  select pseudo into p2 from public.discussions_profils where user_id = autre;
  if p2 is null then raise exception 'Cette personne n''a pas encore ouvert ses discussions'; end if;
  select g0.id into g from public.discussions_groupes g0 where g0.type = 'prive'
    and exists (select 1 from public.discussions_membres m where m.groupe_id = g0.id and m.user_id = auth.uid())
    and exists (select 1 from public.discussions_membres m where m.groupe_id = g0.id and m.user_id = autre) limit 1;
  if g is not null then return g; end if;
  select pseudo into p1 from public.discussions_profils where user_id = auth.uid();
  insert into public.discussions_groupes (nom, type, createur) values (p1 || ' · ' || p2, 'prive', auth.uid()) returning id into g;
  insert into public.discussions_membres (groupe_id, user_id, role) values (g, auth.uid(), 'membre'), (g, autre, 'membre');
  return g;
end $$;

-- Écrire à un ami de groupe (il faut partager au moins un groupe : pas de messages d'inconnus)
create or replace function public.dc_ecrire_a(autre uuid) returns uuid
language plpgsql security definer set search_path = public as $$
begin
  if not public.dc_voisin(autre) then raise exception 'Vous devez avoir un groupe en commun, ou utiliser son numéro de membre'; end if;
  return public.dc_prive_avec(autre);
end $$;

-- Écrire à un ami avec son numéro de membre (celui de sa carte : CB-XXXX-XXXX-X)
create or replace function public.dc_ecrire_numero(num text) returns uuid
language plpgsql security definer set search_path = public as $$
declare u uuid;
begin
  if to_regclass('public.membres') is null then raise exception 'Numéros de membre indisponibles'; end if;
  execute 'select id from public.membres where upper(replace(numero, '' '', '''')) = upper(replace($1, '' '', '''')) limit 1' into u using trim(coalesce(num, ''));
  if u is null then raise exception 'Numéro de membre inconnu'; end if;
  return public.dc_prive_avec(u);
end $$;

-- L'animateur : nouveau code d'invitation (l'ancien ne marche plus)
create or replace function public.dc_changer_code(g uuid) returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not public.dc_animateur(g) then raise exception 'Réservé à l''animateur du groupe'; end if;
  c := public.dc_nouveau_code();
  update public.discussions_groupes set code = c where id = g;
  return c;
end $$;

-- L'animateur nomme un autre animateur (pour ne pas laisser un groupe sans animateur)
create or replace function public.dc_nommer_animateur(g uuid, u uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.dc_animateur(g) then raise exception 'Réservé à l''animateur du groupe'; end if;
  update public.discussions_membres set role = 'animateur' where groupe_id = g and user_id = u;
end $$;

-- Quitter : le dernier qui part supprime le groupe ; s'il n'y a plus d'animateur, le plus ancien le devient
create or replace function public.dc_quitter(g uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from public.discussions_membres where groupe_id = g and user_id = auth.uid();
  if not exists (select 1 from public.discussions_membres where groupe_id = g) then
    delete from public.discussions_groupes where id = g;
  elsif not exists (select 1 from public.discussions_membres where groupe_id = g and role = 'animateur') and not exists (select 1 from public.discussions_groupes where id = g and type = 'prive') then
    update public.discussions_membres set role = 'animateur' where (groupe_id, user_id) = (select groupe_id, user_id from public.discussions_membres where groupe_id = g order by cree_le limit 1);
  end if;
end $$;

-- Mes conversations, avec le nombre de messages non lus
create or replace function public.dc_mes_groupes()
returns table (id uuid, nom text, description text, type text, sport text, code text, role text, membres int, non_lus int, dernier_message timestamptz, dernier_texte text, autre_pseudo text, autre_qualite text)
language sql stable security definer set search_path = public as $$
  select g.id, g.nom, g.description, g.type, g.sport, case when m.role = 'animateur' or g.type = 'ouvert' or g.type = 'huis_clos' then g.code else null end, m.role,
    (select count(*)::int from public.discussions_membres x where x.groupe_id = g.id),
    (select count(*)::int from public.discussions_messages x where x.groupe_id = g.id and x.cree_le > m.lu_le and x.user_id is distinct from auth.uid()),
    g.dernier_message, g.dernier_texte,
    case when g.type = 'prive' then (select p.pseudo from public.discussions_membres x join public.discussions_profils p on p.user_id = x.user_id where x.groupe_id = g.id and x.user_id <> auth.uid() limit 1) end,
    case when g.type = 'prive' then (select p.qualite from public.discussions_membres x join public.discussions_profils p on p.user_id = x.user_id where x.groupe_id = g.id and x.user_id <> auth.uid() limit 1) end
  from public.discussions_membres m join public.discussions_groupes g on g.id = m.groupe_id
  where m.user_id = auth.uid()
  order by g.dernier_message desc;
$$;

-- Les groupes ouverts à découvrir (ceux dont je ne suis pas encore membre)
create or replace function public.dc_groupes_ouverts()
returns table (id uuid, nom text, description text, sport text, membres int, dernier_message timestamptz)
language sql stable security definer set search_path = public as $$
  select g.id, g.nom, g.description, g.sport, (select count(*)::int from public.discussions_membres x where x.groupe_id = g.id), g.dernier_message
  from public.discussions_groupes g
  where g.type = 'ouvert' and public.dc_profil_ok() and not public.dc_membre(g.id)
  order by g.dernier_message desc limit 60;
$$;

-- Les membres d'un groupe (pseudo et qualité seulement)
create or replace function public.dc_membres(g uuid)
returns table (user_id uuid, pseudo text, qualite text, role text, moi boolean)
language sql stable security definer set search_path = public as $$
  select m.user_id, p.pseudo, p.qualite, m.role, m.user_id = auth.uid()
  from public.discussions_membres m left join public.discussions_profils p on p.user_id = m.user_id
  where m.groupe_id = g and public.dc_peut_lire(g)
  order by m.role, p.pseudo;
$$;

-- Total des messages non lus (pastille du Club House)
create or replace function public.dc_non_lus() returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum((select count(*) from public.discussions_messages x where x.groupe_id = m.groupe_id and x.cree_le > m.lu_le and x.user_id is distinct from auth.uid())), 0)::int
  from public.discussions_membres m where m.user_id = auth.uid();
$$;

-- L'administrateur : les signalements à traiter
create or replace function public.dc_signalements()
returns table (signalement uuid, message_id uuid, groupe text, type text, auteur text, texte text, motif text, cree_le timestamptz, nb int)
language sql stable security definer set search_path = public as $$
  select min(s.id::text)::uuid, m.id, g.nom, g.type, m.auteur, m.texte, string_agg(distinct s.motif, ' · '), max(s.cree_le), count(*)::int
  from public.discussions_signalements s join public.discussions_messages m on m.id = s.message_id join public.discussions_groupes g on g.id = m.groupe_id
  where s.traite = false and public.dc_est_admin()
  group by m.id, g.nom, g.type, m.auteur, m.texte
  order by max(s.cree_le) desc;
$$;

-- ========== 6. Droits d'exécution ==========
do $$ declare f text; begin
  foreach f in array array['dc_est_admin()', 'dc_profil_ok()', 'dc_membre(uuid)', 'dc_animateur(uuid)', 'dc_ouvert(uuid)', 'dc_peut_lire(uuid)', 'dc_voisin(uuid)', 'dc_nouveau_code()',
    'dc_creer_groupe(text, text, text, text)', 'dc_rejoindre(uuid)', 'dc_rejoindre_code(text)', 'dc_prive_avec(uuid)', 'dc_ecrire_a(uuid)', 'dc_ecrire_numero(text)',
    'dc_changer_code(uuid)', 'dc_nommer_animateur(uuid, uuid)', 'dc_quitter(uuid)', 'dc_mes_groupes()', 'dc_groupes_ouverts()', 'dc_membres(uuid)', 'dc_non_lus()', 'dc_signalements()'] loop
    execute 'revoke all on function public.' || f || ' from public, anon';
    execute 'grant execute on function public.' || f || ' to authenticated';
  end loop;
end $$;
-- dc_prive_avec n'est appelée que par dc_ecrire_a et dc_ecrire_numero (pas d'écriture à un inconnu)
revoke execute on function public.dc_prive_avec(uuid) from authenticated;

-- Fin. Le Club House › Discussions s'active aussitôt, sans remise en ligne du site.
