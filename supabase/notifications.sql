-- Casa Besports — notifications du site et de l'application (notifications « push »).
-- À lancer UNE SEULE FOIS : Supabase › SQL Editor › New query › coller tout ce fichier › Run.
-- À lancer APRÈS supabase/administration.sql (il utilise la fonction est_admin()).
-- Guide pas à pas : docs/NOTIFICATIONS.md
--
-- Aucune de ces tables n'est lisible depuis le site : seule la fonction serveur « notifications »
-- (clé service, côté Supabase) y écrit et y lit. L'administrateur voit l'historique des envois.

-- 1. Les appareils qui ont accepté les notifications (une ligne par téléphone / navigateur)
create table if not exists public.push_abonnements (
  endpoint  text primary key,                 -- adresse technique fournie par Google, Apple, Mozilla ou Microsoft
  p256dh    text not null,                    -- clés de chiffrement de l'appareil (le message est chiffré pour lui seul)
  auth      text not null,
  user_id   uuid references auth.users(id) on delete set null,  -- compte abonné, si la personne est connectée
  langue    text default 'fr',
  appareil  text,                             -- « Android », « iPhone (appli) », « Ordinateur »…
  cree_le   timestamptz not null default now(),
  vu_le     timestamptz not null default now()
);
alter table public.push_abonnements enable row level security;
-- (aucune règle d'accès : personne ne peut lire cette table depuis le site)

-- 2. Les clés du serveur de notifications (créées automatiquement au premier appel de la fonction)
create table if not exists public.push_reglages (
  id           int primary key default 1 check (id = 1),
  cles         jsonb not null,                -- clé privée : ne quitte jamais Supabase
  cle_publique text not null,
  cree_le      timestamptz not null default now()
);
alter table public.push_reglages enable row level security;

-- 3. L'historique des notifications envoyées (visible par l'administrateur dans Admin › Notifications)
create table if not exists public.notifications_envoyees (
  id        bigint generated always as identity primary key,
  titre     text not null,
  texte     text,
  lien      text,
  essai     boolean not null default false,   -- envoi d'essai à un seul appareil
  envoyees  int not null default 0,
  echecs    int not null default 0,
  retirees  int not null default 0,           -- appareils désinscrits ou périmés, supprimés à l'occasion
  par       uuid references auth.users(id) on delete set null,
  cree_le   timestamptz not null default now()
);
alter table public.notifications_envoyees enable row level security;
drop policy if exists "admin lit les notifications" on public.notifications_envoyees;
create policy "admin lit les notifications" on public.notifications_envoyees for select to authenticated using (public.est_admin());
