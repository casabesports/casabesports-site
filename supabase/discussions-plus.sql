-- ================================================================
-- CLUB HOUSE · DISCUSSIONS ET MESSAGERIE : les nouveautés
--   1. Pièces jointes (photos, PDF, documents) dans chaque conversation,
--      dans le formulaire de contact et dans les e-mails de la messagerie admin
--   2. Modifier les infos d'un groupe (son créateur et l'administrateur)
--   3. Notifications des discussions, au choix de chacun (tout, seulement si on me cite, rien)
--
-- À lancer UNE fois, APRÈS supabase/discussions.sql et supabase/administration.sql :
-- Supabase › SQL Editor › New query › coller tout le fichier › Run.
-- Le script peut être relancé sans risque. Guide : docs/DISCUSSIONS.md (partie « Nouveautés »)
-- ================================================================

-- ========== 1. Pièces jointes ==========
-- Un seul espace de fichiers PRIVÉ « pieces-jointes », rangé en trois dossiers :
--   discussions/<id du groupe>/…  lisible des seuls membres qui peuvent lire la conversation
--   contact/…                     déposé par les visiteurs du formulaire de contact, lu par l'administrateur seul
--   admin/…                       joint par l'administrateur à ses e-mails, lu par l'administrateur seul
-- 10 Mo par fichier au plus. Photos, PDF, Word, Excel, PowerPoint, texte.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pieces-jointes', 'pieces-jointes', false, 10485760, array[
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.spreadsheet'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- Les messages portent la liste de leurs pièces jointes : [{ chemin, nom, type, taille }]
alter table public.discussions_messages add column if not exists pieces jsonb;
alter table public.discussions_messages add column if not exists notifie boolean not null default false;
alter table public.messages add column if not exists pieces jsonb;

-- Le groupe d'un fichier « discussions/<id>/… » (null si le chemin est mal formé)
create or replace function public.pj_groupe(chemin text) returns uuid
language plpgsql immutable as $$
begin
  if split_part(chemin, '/', 1) <> 'discussions' then return null; end if;
  return split_part(chemin, '/', 2)::uuid;
exception when others then
  return null;
end $$;

-- Lire un fichier de discussion : qui peut lire la conversation, ou l'administrateur si un message qui le contient a été signalé
create or replace function public.pj_lire_discussion(chemin text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.dc_peut_lire(public.pj_groupe(chemin))
    or (public.dc_est_admin() and exists (
      select 1 from public.discussions_messages m join public.discussions_signalements s on s.message_id = m.id
      where m.groupe_id = public.pj_groupe(chemin) and m.pieces @> jsonb_build_array(jsonb_build_object('chemin', chemin))));
$$;

drop policy if exists "pj discussions lecture" on storage.objects;
create policy "pj discussions lecture" on storage.objects for select to authenticated
  using (bucket_id = 'pieces-jointes' and split_part(name, '/', 1) = 'discussions' and public.pj_lire_discussion(name));
drop policy if exists "pj discussions depot" on storage.objects;
create policy "pj discussions depot" on storage.objects for insert to authenticated
  with check (bucket_id = 'pieces-jointes' and split_part(name, '/', 1) = 'discussions' and public.dc_membre(public.pj_groupe(name)) and public.dc_profil_ok());
drop policy if exists "pj contact depot" on storage.objects;
create policy "pj contact depot" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'pieces-jointes' and split_part(name, '/', 1) = 'contact' and char_length(name) < 300);
drop policy if exists "pj admin depot" on storage.objects;
create policy "pj admin depot" on storage.objects for insert to authenticated
  with check (bucket_id = 'pieces-jointes' and split_part(name, '/', 1) = 'admin' and public.dc_est_admin());
drop policy if exists "pj admin lecture" on storage.objects;
create policy "pj admin lecture" on storage.objects for select to authenticated
  using (bucket_id = 'pieces-jointes' and split_part(name, '/', 1) in ('contact', 'admin') and public.dc_est_admin());
drop policy if exists "pj retrait" on storage.objects;
create policy "pj retrait" on storage.objects for delete to authenticated
  using (bucket_id = 'pieces-jointes' and (owner_id = auth.uid()::text or public.dc_est_admin()));

-- Formulaire de contact : 5 pièces jointes au plus par demande
drop policy if exists "envoyer une demande" on public.messages;
create policy "envoyer une demande" on public.messages for insert to anon, authenticated
  with check (traite = false and length(coalesce(message, '')) < 20000 and (pieces is null or (jsonb_typeof(pieces) = 'array' and jsonb_array_length(pieces) <= 5)));

-- Un message de discussion peut n'être qu'une photo : le texte devient facultatif s'il y a une pièce jointe
alter table public.discussions_messages drop constraint if exists discussions_messages_texte_check;
alter table public.discussions_messages drop constraint if exists dc_texte_ou_piece;
alter table public.discussions_messages add constraint dc_texte_ou_piece check (
  char_length(texte) <= 1000 and (char_length(trim(texte)) > 0 or coalesce(jsonb_array_length(pieces), 0) > 0));

-- Avant chaque message : auteur, horodatage, anti-abus, pièces jointes vérifiées (4 au plus, rangées dans le dossier du groupe)
create or replace function public.dc_message_avant() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int; p jsonb; propres jsonb := '[]'::jsonb;
begin
  select pseudo, qualite into new.auteur, new.qualite from public.discussions_profils where user_id = auth.uid();
  new.user_id := auth.uid();
  new.cree_le := now();
  new.notifie := false;
  new.texte := left(trim(coalesce(new.texte, '')), 1000);
  if new.pieces is not null and jsonb_typeof(new.pieces) = 'array' then
    for p in select * from jsonb_array_elements(new.pieces) loop
      if jsonb_array_length(propres) >= 4 then exit; end if;
      if coalesce(p->>'chemin', '') like 'discussions/' || new.groupe_id::text || '/%' then
        propres := propres || jsonb_build_array(jsonb_build_object(
          'chemin', left(p->>'chemin', 300), 'nom', left(coalesce(p->>'nom', 'fichier'), 120),
          'type', left(coalesce(p->>'type', ''), 120), 'taille', coalesce((p->>'taille')::bigint, 0)));
      end if;
    end loop;
  end if;
  new.pieces := case when jsonb_array_length(propres) > 0 then propres else null end;
  select count(*) into n from public.discussions_messages where user_id = auth.uid() and cree_le > now() - interval '1 minute';
  if n >= 15 then raise exception 'Doucement : trop de messages en une minute, patientez un instant'; end if;
  return new;
end $$;

create or replace function public.dc_message_apres() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.discussions_groupes set dernier_message = new.cree_le,
    dernier_texte = coalesce(new.auteur, 'Membre') || ' : ' || case when new.texte <> '' then left(new.texte, 80) else '📎 ' || coalesce(new.pieces->0->>'nom', 'Pièce jointe') end
  where id = new.groupe_id;
  update public.discussions_membres set lu_le = new.cree_le where groupe_id = new.groupe_id and user_id = auth.uid();
  return null;
end $$;

-- ========== 2. Modifier les infos d'un groupe ==========
-- Le créateur du groupe et l'administrateur modifient le nom, la description, le sport et le type (ouvert ou huis clos).
-- Si le créateur a quitté le groupe, ses animateurs prennent le relais.
create or replace function public.dc_peut_modifier(g uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.discussions_groupes x where x.id = g and x.type <> 'prive' and (
    x.createur = auth.uid() or public.dc_est_admin()
    or (public.dc_animateur(g) and not exists (select 1 from public.discussions_membres m where m.groupe_id = g and m.user_id = x.createur))));
$$;

create or replace function public.dc_modifier_groupe(g uuid, p_nom text, p_description text default null, p_sport text default null, p_type text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.dc_peut_modifier(g) then raise exception 'Seuls le créateur du groupe et l''administrateur peuvent modifier ses infos'; end if;
  if char_length(trim(coalesce(p_nom, ''))) < 2 then raise exception 'Donnez un nom au groupe (2 lettres au moins)'; end if;
  update public.discussions_groupes x set
    nom = left(trim(p_nom), 60),
    description = nullif(left(trim(coalesce(p_description, '')), 200), ''),
    sport = nullif(left(trim(coalesce(p_sport, '')), 40), ''),
    type = case when p_type in ('ouvert', 'huis_clos') then p_type else x.type end
  where x.id = g;
end $$;

-- L'administrateur : tous les groupes (ouverts et à huis clos ; jamais les conversations privées), sans leurs messages
create or replace function public.dc_groupes_admin()
returns table (id uuid, nom text, description text, type text, sport text, membres int, createur_pseudo text, cree_le timestamptz, dernier_message timestamptz)
language sql stable security definer set search_path = public as $$
  select g.id, g.nom, g.description, g.type, g.sport, (select count(*)::int from public.discussions_membres x where x.groupe_id = g.id),
    (select p.pseudo from public.discussions_profils p where p.user_id = g.createur), g.cree_le, g.dernier_message
  from public.discussions_groupes g
  where g.type <> 'prive' and public.dc_est_admin()
  order by g.dernier_message desc limit 300;
$$;

-- ========== 3. Notifications des discussions, au choix de chacun ==========
-- notif : 'tout' (chaque message), 'mentions' (seulement quand on écrit @MonPseudo), 'rien'.
-- Vide = réglage par défaut : tout pour les conversations privées et les huis clos, mentions pour les groupes ouverts.
alter table public.discussions_membres add column if not exists notif text;
alter table public.discussions_membres add column if not exists notifie_le timestamptz;
alter table public.discussions_membres drop constraint if exists dc_notif_choix;
alter table public.discussions_membres add constraint dc_notif_choix check (notif is null or notif in ('tout', 'mentions', 'rien'));
revoke update on public.discussions_membres from authenticated;
grant update (lu_le, notif) on public.discussions_membres to authenticated;

-- Le créateur et l'admin modifient le groupe par dc_modifier_groupe seulement
drop policy if exists "dc groupes modifies" on public.discussions_groupes;
revoke update on public.discussions_groupes from authenticated;
revoke update (nom, description, sport) on public.discussions_groupes from authenticated;

-- Mes conversations : ajoute mon réglage de notification et si je peux modifier le groupe
drop function if exists public.dc_mes_groupes();
create or replace function public.dc_mes_groupes()
returns table (id uuid, nom text, description text, type text, sport text, code text, role text, membres int, non_lus int, dernier_message timestamptz, dernier_texte text, autre_pseudo text, autre_qualite text, notif text, modifiable boolean)
language sql stable security definer set search_path = public as $$
  select g.id, g.nom, g.description, g.type, g.sport, case when m.role = 'animateur' or g.type = 'ouvert' or g.type = 'huis_clos' then g.code else null end, m.role,
    (select count(*)::int from public.discussions_membres x where x.groupe_id = g.id),
    (select count(*)::int from public.discussions_messages x where x.groupe_id = g.id and x.cree_le > m.lu_le and x.user_id is distinct from auth.uid()),
    g.dernier_message, g.dernier_texte,
    case when g.type = 'prive' then (select p.pseudo from public.discussions_membres x join public.discussions_profils p on p.user_id = x.user_id where x.groupe_id = g.id and x.user_id <> auth.uid() limit 1) end,
    case when g.type = 'prive' then (select p.qualite from public.discussions_membres x join public.discussions_profils p on p.user_id = x.user_id where x.groupe_id = g.id and x.user_id <> auth.uid() limit 1) end,
    coalesce(m.notif, case when g.type = 'ouvert' then 'mentions' else 'tout' end),
    public.dc_peut_modifier(g.id)
  from public.discussions_membres m join public.discussions_groupes g on g.id = m.groupe_id
  where m.user_id = auth.uid()
  order by g.dernier_message desc;
$$;

-- Qui prévenir d'un nouveau message (utilisé seulement par la fonction « notifications », jamais par le site).
-- Une notification par message ; au plus une toutes les 2 minutes par conversation et par personne
-- (sauf si on la cite), pour ne pas faire vibrer le téléphone à chaque ligne.
create or replace function public.dc_destinataires(mid uuid) returns setof uuid
language plpgsql security definer set search_path = public as $$
declare x record;
begin
  select * into x from public.discussions_messages where id = mid and notifie = false and cree_le > now() - interval '10 minutes';
  if x.id is null then return; end if;
  update public.discussions_messages set notifie = true where id = mid;
  return query
  with c as (
    select m.user_id, coalesce(m.notif, case when g.type = 'ouvert' then 'mentions' else 'tout' end) as choix, m.notifie_le, m.lu_le,
      (p.pseudo is not null and position(lower('@' || p.pseudo) in lower(x.texte)) > 0) as cite
    from public.discussions_membres m join public.discussions_groupes g on g.id = m.groupe_id left join public.discussions_profils p on p.user_id = m.user_id
    where m.groupe_id = x.groupe_id and m.user_id is distinct from x.user_id
  ), cibles as (
    select c.user_id from c
    where c.choix <> 'rien' and (c.cite or (c.choix = 'tout' and (c.notifie_le is null or c.notifie_le < now() - interval '2 minutes' or c.lu_le >= c.notifie_le)))
  ), maj as (
    update public.discussions_membres d set notifie_le = now() from cibles where d.groupe_id = x.groupe_id and d.user_id = cibles.user_id returning d.user_id
  )
  select user_id from maj;
end $$;

-- ========== 4. Droits d'exécution ==========
revoke all on function public.pj_groupe(text) from public;
revoke all on function public.pj_lire_discussion(text) from public, anon;
revoke all on function public.dc_peut_modifier(uuid) from public, anon;
revoke all on function public.dc_modifier_groupe(uuid, text, text, text, text) from public, anon;
revoke all on function public.dc_groupes_admin() from public, anon;
revoke all on function public.dc_mes_groupes() from public, anon;
revoke all on function public.dc_destinataires(uuid) from public, anon, authenticated;
grant execute on function public.pj_groupe(text) to anon, authenticated;
grant execute on function public.pj_lire_discussion(text) to authenticated;
grant execute on function public.dc_peut_modifier(uuid) to authenticated;
grant execute on function public.dc_modifier_groupe(uuid, text, text, text, text) to authenticated;
grant execute on function public.dc_groupes_admin() to authenticated;
grant execute on function public.dc_mes_groupes() to authenticated;
grant execute on function public.dc_destinataires(uuid) to service_role;

-- Fin. Les pièces jointes, la modification des groupes et le choix des notifications s'activent aussitôt.
-- Pour que les notifications partent vraiment : redéployer la fonction « notifications » (voir le guide).
-- Pour joindre des fichiers aux e-mails de la messagerie : redéployer la fonction « envoyer-email ».
