-- Casa Besports : espace administrateur, équipe de rédaction, demandes d'accès,
-- messagerie, contenus modifiables en ligne et stockage des images.
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- Ce fichier suffit à lui seul (il crée aussi la table des messages).
-- Le script peut être relancé sans risque.

-- ========== 1. L'équipe : qui a accès à l'espace rédaction ==========
create table if not exists public.equipe (
  email text primary key check (email = lower(email)),
  nom text,
  role text not null default 'redacteur' check (role in ('admin', 'redacteur')),
  ajoute_le timestamptz not null default now()
);
alter table public.equipe enable row level security;

-- L'administrateur du site (modifiable uniquement ici, jamais depuis le site)
insert into public.equipe (email, nom, role) values ('kader.allou.pro@outlook.fr', 'Kader Allou', 'admin')
  on conflict (email) do update set role = 'admin';

-- Rôle de la personne connectée (adresse e-mail confirmée uniquement)
create or replace function public.mon_role() returns text
language sql stable security definer set search_path = public, auth as $$
  select e.role from public.equipe e
  join auth.users u on lower(u.email) = e.email
  where u.id = auth.uid() and u.email_confirmed_at is not null
  limit 1;
$$;
create or replace function public.est_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select coalesce(public.mon_role() = 'admin', false);
$$;
revoke all on function public.mon_role() from public;
revoke all on function public.est_admin() from public;
grant execute on function public.mon_role() to authenticated;
grant execute on function public.est_admin() to authenticated;

drop policy if exists "admin lit l'equipe" on public.equipe;
create policy "admin lit l'equipe" on public.equipe for select to authenticated using (public.est_admin());
-- L'administrateur ajoute ou retire des rédacteurs (jamais un autre administrateur)
drop policy if exists "admin ajoute un redacteur" on public.equipe;
create policy "admin ajoute un redacteur" on public.equipe for insert to authenticated with check (public.est_admin() and role = 'redacteur');
drop policy if exists "admin modifie un redacteur" on public.equipe;
create policy "admin modifie un redacteur" on public.equipe for update to authenticated using (public.est_admin() and role = 'redacteur') with check (role = 'redacteur');
drop policy if exists "admin retire un redacteur" on public.equipe;
create policy "admin retire un redacteur" on public.equipe for delete to authenticated using (public.est_admin() and role = 'redacteur');

-- ========== 2. Demandes d'accès à la rédaction (abonnés) ==========
create table if not exists public.demandes_acces (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  email text, nom text, motif text check (length(coalesce(motif, '')) < 4000),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'acceptee', 'refusee')),
  cree_le timestamptz not null default now(),
  traite_le timestamptz
);
alter table public.demandes_acces enable row level security;

drop policy if exists "abonne demande l'acces" on public.demandes_acces;
create policy "abonne demande l'acces" on public.demandes_acces for insert to authenticated
  with check (user_id = auth.uid() and statut = 'en_attente'
    and email = lower(auth.jwt() ->> 'email'));
drop policy if exists "abonne voit sa demande" on public.demandes_acces;
create policy "abonne voit sa demande" on public.demandes_acces for select to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "admin traite les demandes" on public.demandes_acces;
create policy "admin traite les demandes" on public.demandes_acces for update to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "admin supprime les demandes" on public.demandes_acces;
create policy "admin supprime les demandes" on public.demandes_acces for delete to authenticated using (public.est_admin());

-- Accepter ou refuser une demande en un clic depuis l'espace administrateur
create or replace function public.traiter_demande(demande bigint, accepter boolean) returns void
language plpgsql security definer set search_path = public, auth as $$
declare d public.demandes_acces;
begin
  if not public.est_admin() then raise exception 'Réservé à l''administrateur'; end if;
  select * into d from public.demandes_acces where id = demande;
  if not found then raise exception 'Demande introuvable'; end if;
  update public.demandes_acces set statut = case when accepter then 'acceptee' else 'refusee' end, traite_le = now() where id = demande;
  if accepter and d.email is not null then
    insert into public.equipe (email, nom, role) values (lower(d.email), d.nom, 'redacteur') on conflict (email) do nothing;
  end if;
end $$;
revoke all on function public.traiter_demande(bigint, boolean) from public;
grant execute on function public.traiter_demande(bigint, boolean) to authenticated;

-- ========== 3. Messagerie : demandes du site + e-mails des adresses suivies ==========
-- (crée la table des messages si supabase/messages.sql n'a pas été lancé)
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  recu_le timestamptz not null default now(),
  source text, nom text, email text, telephone text, ville text, profil text,
  sujet text, message text, consentement text, page text,
  traite boolean not null default false
);
alter table public.messages enable row level security;
alter table public.messages add column if not exists sens text not null default 'recu';
alter table public.messages add column if not exists lu boolean not null default false;
alter table public.messages add column if not exists destinataire text;
alter table public.messages add column if not exists reponse_a bigint;
do $$ begin
  alter table public.messages add constraint messages_sens check (sens in ('recu', 'envoye'));
exception when duplicate_object then null; end $$;

-- Les visiteurs ne peuvent envoyer qu'un message « reçu » non lu
drop policy if exists "envoyer une demande" on public.messages;
create policy "envoyer une demande" on public.messages for insert to anon, authenticated
  with check (traite = false and lu = false and sens = 'recu' and destinataire is null and reponse_a is null and length(coalesce(message, '')) < 20000);
drop policy if exists "admin lit les messages" on public.messages;
create policy "admin lit les messages" on public.messages for select to authenticated using (public.est_admin());
drop policy if exists "admin ecrit des messages" on public.messages;
create policy "admin ecrit des messages" on public.messages for insert to authenticated with check (public.est_admin());
drop policy if exists "admin classe les messages" on public.messages;
create policy "admin classe les messages" on public.messages for update to authenticated using (public.est_admin()) with check (public.est_admin());
drop policy if exists "admin supprime les messages" on public.messages;
create policy "admin supprime les messages" on public.messages for delete to authenticated using (public.est_admin());

-- Adresses e-mail dont les messages arrivent dans la messagerie
create table if not exists public.contacts_messagerie (
  email text primary key check (email = lower(email)),
  nom text,
  ajoute_le timestamptz not null default now()
);
alter table public.contacts_messagerie enable row level security;
drop policy if exists "admin gere les contacts" on public.contacts_messagerie;
create policy "admin gere les contacts" on public.contacts_messagerie for all to authenticated using (public.est_admin()) with check (public.est_admin());

-- ========== 4. Contenus du site modifiés depuis l'espace administrateur ==========
create table if not exists public.site_contenu (
  cle text primary key check (cle ~ '^CASA_[A-Z_]+$'),
  valeur jsonb,
  modifie_le timestamptz not null default now()
);
alter table public.site_contenu enable row level security;
drop policy if exists "tout le monde lit les contenus" on public.site_contenu;
create policy "tout le monde lit les contenus" on public.site_contenu for select to anon, authenticated using (true);
drop policy if exists "admin modifie les contenus" on public.site_contenu;
create policy "admin modifie les contenus" on public.site_contenu for all to authenticated using (public.est_admin()) with check (public.est_admin());

-- ========== 5. Images : dossier public « site » (seul l'administrateur y dépose) ==========
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site', 'site', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 52428800, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admin depose des images" on storage.objects;
create policy "admin depose des images" on storage.objects for insert to authenticated with check (bucket_id = 'site' and public.est_admin());
drop policy if exists "admin remplace des images" on storage.objects;
create policy "admin remplace des images" on storage.objects for update to authenticated using (bucket_id = 'site' and public.est_admin());
drop policy if exists "admin supprime des images" on storage.objects;
create policy "admin supprime des images" on storage.objects for delete to authenticated using (bucket_id = 'site' and public.est_admin());
drop policy if exists "admin liste les images" on storage.objects;
create policy "admin liste les images" on storage.objects for select to authenticated using (bucket_id = 'site' and public.est_admin());
