-- Casa Besports : paiements en ligne (Stripe) — abonnements et commandes de la boutique.
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- À lancer APRÈS supabase/administration.sql (il utilise la fonction est_admin()).
-- Le script peut être relancé sans risque.
--
-- Seule la fonction serveur « stripe-webhook » (clé service, côté Supabase) écrit dans ces tables,
-- après confirmation du paiement par Stripe : personne ne peut s'offrir un abonnement depuis le navigateur.

-- ========== 1. Abonnements payés ==========
create table if not exists public.abonnements (
  id bigint generated always as identity primary key,
  cree_le timestamptz not null default now(),
  maj_le timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,  -- compte de l'abonné (si connecté au moment du paiement)
  email text not null check (email = lower(email)),            -- adresse de l'abonné (ou du bénéficiaire d'un cadeau)
  payeur_email text,                                           -- qui a payé (différent pour un cadeau)
  nom text,
  formule text not null,       -- casab, gaz-num, gaz-pap, gaz-duo, pack (contenus/abonnements.js)
  periode text not null check (periode in ('mois', 'an')),
  cadeau boolean not null default false,
  statut text not null default 'active',  -- active, trialing, past_due, canceled, unpaid… (statuts Stripe)
  resiliation_prevue boolean not null default false,  -- résilié, actif jusqu'à la date de fin
  fin timestamptz,             -- fin de la période payée
  montant numeric(10, 2),
  adresse text,                -- adresse postale (Gazette papier)
  stripe_customer text,
  stripe_subscription text unique,
  stripe_session text unique
);
alter table public.abonnements enable row level security;
create index if not exists abonnements_email on public.abonnements (email);
create index if not exists abonnements_user on public.abonnements (user_id);

-- ========== 2. Commandes de la boutique payées ==========
create table if not exists public.commandes (
  id bigint generated always as identity primary key,
  cree_le timestamptz not null default now(),
  numero text not null,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  nom text,
  telephone text,
  lignes jsonb not null default '[]'::jsonb,   -- articles : nom, variante, quantité, prix
  livraison text,                               -- home, cherwood, stade
  adresse jsonb,                                -- adresse de livraison saisie chez Stripe
  emballage_cadeau boolean not null default false,
  montant numeric(10, 2),
  statut text not null default 'payee' check (statut in ('payee', 'preparee', 'expediee', 'retiree', 'remboursee', 'annulee')),
  stripe_session text unique,
  stripe_paiement text
);
alter table public.commandes enable row level security;

-- ========== 3. Qui voit quoi ==========
-- Adresse e-mail confirmée de la personne connectée
create or replace function public.mon_email_confirme() returns text
language sql stable security definer set search_path = public, auth as $$
  select lower(u.email) from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null;
$$;

-- L'abonné voit ses abonnements (payés avec son compte, ou à son adresse e-mail, ex. un cadeau reçu)
drop policy if exists "abonne voit ses abonnements" on public.abonnements;
create policy "abonne voit ses abonnements" on public.abonnements for select to authenticated
  using (user_id = auth.uid() or email = public.mon_email_confirme() or public.est_admin());
drop policy if exists "client voit ses commandes" on public.commandes;
create policy "client voit ses commandes" on public.commandes for select to authenticated
  using (user_id = auth.uid() or lower(email) = public.mon_email_confirme() or public.est_admin());
-- L'administrateur fait avancer une commande (préparée, expédiée…)
drop policy if exists "admin suit les commandes" on public.commandes;
create policy "admin suit les commandes" on public.commandes for update to authenticated
  using (public.est_admin()) with check (public.est_admin());
-- Aucune politique d'ajout : seuls Stripe (via la fonction stripe-webhook) et l'administrateur dans Supabase écrivent.
