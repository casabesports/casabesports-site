-- Casa Besports : badges BE+ des correspondants et personnes agréées, trombinoscope,
-- et demandes de certification des CV (enfin enregistrées en ligne, visibles par l'administrateur).
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- À lancer APRÈS supabase/administration.sql (il utilise la fonction est_admin()). Le script peut être relancé sans risque.
--
-- Ce que ça permet :
--   • chaque correspondant ou personne agréée remplit SON badge (photo, nom, fonction, club…) et l'envoie à l'administrateur ;
--   • l'administrateur le valide (numéro BE-AAAA-XXXX attribué), demande une correction ou le refuse, et peut le suspendre ;
--   • les badges validés apparaissent dans le trombinoscope public du site (sans e-mail ni téléphone) ;
--   • les demandes de certification des CV arrivent dans l'espace administrateur, sur tous les appareils.
-- Données personnelles (RGPD) : un membre ne voit que SES demandes ; l'administrateur voit tout ;
-- le public ne voit que les badges validés (fonction trombinoscope()) et l'état d'un certificat (fonction cv_verifier()).

-- ========== 1. Badges BE+ ==========
create table if not exists public.badges_be (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  email text,
  prenom text not null default '' check (char_length(prenom) <= 60),
  nom text not null default '' check (char_length(nom) <= 60),
  fonction text not null default 'Correspondant' check (char_length(fonction) <= 60),
  club text check (char_length(club) <= 100),
  discipline text check (char_length(discipline) <= 60),
  ville text check (char_length(ville) <= 80),
  presentation text check (char_length(presentation) <= 240),
  photo text check (char_length(photo) <= 400000),
  theme text not null default 'maree' check (theme in ('maree', 'soleil', 'nuit')),
  statut text not null default 'brouillon' check (statut in ('brouillon', 'en_attente', 'valide', 'correction', 'refuse', 'suspendu')),
  note text,
  numero text unique,
  demande_le timestamptz,
  valide_le timestamptz,
  valide_par text,
  expire_le date,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);
alter table public.badges_be enable row level security;

-- Garde-fou : un membre ne peut ni se valider lui-même, ni changer son numéro.
-- Toute modification d'un badge validé par son titulaire le renvoie en vérification.
create or replace function public.badge_garde() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  new.modifie_le := now();
  if tg_op = 'INSERT' then new.cree_le := now(); end if;
  if public.est_admin() and coalesce(current_setting('casa.badge', true), '') = '1' then return new; end if;
  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
    new.numero := null; new.valide_le := null; new.valide_par := null; new.expire_le := null; new.note := null;
    if new.statut not in ('brouillon', 'en_attente') then new.statut := 'brouillon'; end if;
  else
    new.user_id := old.user_id; new.numero := old.numero; new.valide_le := old.valide_le; new.valide_par := old.valide_par; new.expire_le := old.expire_le;
    if old.statut = 'suspendu' then raise exception 'Badge suspendu : contactez l''administrateur'; end if;
    if new.statut not in ('brouillon', 'en_attente') then new.statut := 'en_attente'; end if;
    new.note := old.note;
  end if;
  if new.statut = 'en_attente' and (tg_op = 'INSERT' or old.statut <> 'en_attente') then new.demande_le := now(); end if;
  return new;
end $$;
drop trigger if exists badge_garde on public.badges_be;
create trigger badge_garde before insert or update on public.badges_be for each row execute function public.badge_garde();

drop policy if exists "badge : je lis le mien" on public.badges_be;
create policy "badge : je lis le mien" on public.badges_be for select to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "badge : je cree le mien" on public.badges_be;
create policy "badge : je cree le mien" on public.badges_be for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "badge : je modifie le mien" on public.badges_be;
create policy "badge : je modifie le mien" on public.badges_be for update to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "badge : suppression" on public.badges_be;
create policy "badge : suppression" on public.badges_be for delete to authenticated using (user_id = auth.uid() or public.est_admin());

-- Décision de l'administrateur : valider, demander une correction, refuser, suspendre, réactiver
create or replace function public.badge_decider(badge uuid, decision text, motif text default null) returns public.badges_be
language plpgsql security definer set search_path = public, auth as $$
declare b public.badges_be; num text; lettres text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; i int; fin date;
begin
  if not public.est_admin() then raise exception 'Réservé à l''administrateur'; end if;
  select * into b from public.badges_be where id = badge;
  if not found then raise exception 'Badge introuvable'; end if;
  if decision not in ('valider', 'correction', 'refuser', 'suspendre', 'reactiver') then raise exception 'Décision inconnue'; end if;
  if decision in ('correction', 'refuser', 'suspendre') and coalesce(trim(motif), '') = '' then raise exception 'Indiquez le motif (le titulaire le verra)'; end if;
  perform set_config('casa.badge', '1', true);
  if decision in ('valider', 'reactiver') then
    num := b.numero;
    while num is null loop
      num := 'BE-' || to_char(now(), 'YYYY') || '-';
      for i in 1..4 loop num := num || substr(lettres, 1 + floor(random() * 32)::int, 1); end loop;
      if exists (select 1 from public.badges_be where numero = num) then num := null; end if;
    end loop;
    -- valable jusqu'à la fin de la saison sportive (31 août)
    fin := make_date(extract(year from now())::int + case when extract(month from now()) >= 9 then 1 else 0 end, 8, 31);
    update public.badges_be set statut = 'valide', numero = num, note = nullif(trim(coalesce(motif, '')), ''), valide_le = now(),
      valide_par = coalesce((select e.nom from public.equipe e join auth.users u on lower(u.email) = e.email where u.id = auth.uid() limit 1), 'Casa Besports'),
      expire_le = fin where id = badge returning * into b;
  else
    update public.badges_be set statut = case decision when 'correction' then 'correction' when 'refuser' then 'refuse' else 'suspendu' end, note = trim(motif)
      where id = badge returning * into b;
  end if;
  return b;
end $$;
revoke all on function public.badge_decider(uuid, text, text) from public;
grant execute on function public.badge_decider(uuid, text, text) to authenticated;

-- Trombinoscope public : badges validés et en cours de validité, sans coordonnées
drop function if exists public.trombinoscope();
create function public.trombinoscope()
returns table (numero text, prenom text, nom text, fonction text, club text, discipline text, ville text, presentation text, photo text, theme text, valide_le timestamptz, expire_le date)
language sql stable security definer set search_path = public as $$
  select b.numero, b.prenom, b.nom, b.fonction, b.club, b.discipline, b.ville, b.presentation, b.photo, b.theme, b.valide_le, b.expire_le
  from public.badges_be b
  where b.statut = 'valide' and b.numero is not null and (b.expire_le is null or b.expire_le >= current_date)
  order by b.nom, b.prenom;
$$;
revoke all on function public.trombinoscope() from public;
grant execute on function public.trombinoscope() to anon, authenticated;

-- ========== 2. Certification des CV ==========
create table if not exists public.cv_demandes (
  ref text primary key default ('CV-' || upper(to_hex((extract(epoch from clock_timestamp()) * 1000)::bigint))),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  email text,
  nom text,
  cv jsonb not null default '{}'::jsonb,
  photo text check (char_length(photo) <= 1200000),
  statut text not null default 'en attente' check (statut in ('en attente', 'certifie', 'complement', 'refusee', 'retiree')),
  note text,
  certificat_id text,
  origine text,
  cree_le timestamptz not null default now(),
  decide_le timestamptz
);
alter table public.cv_demandes enable row level security;

create table if not exists public.cv_certificats (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  demande text references public.cv_demandes (ref) on delete set null,
  h text not null,
  ph text,
  nom text,
  titre text,
  emis_le timestamptz not null default now(),
  par text,
  revoque boolean not null default false
);
alter table public.cv_certificats enable row level security;

-- Le membre ne crée que des demandes « en attente » à son nom ; seul l'administrateur décide.
create or replace function public.cv_garde() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  if coalesce(current_setting('casa.cv', true), '') = '1' and public.est_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.user_id := auth.uid(); new.statut := 'en attente'; new.note := null; new.certificat_id := null; new.decide_le := null; new.cree_le := now();
  else
    if public.est_admin() then return new; end if;
    -- le membre peut seulement retirer sa demande
    if new.statut <> 'retiree' then raise exception 'Seul l''administrateur traite une demande'; end if;
    new.cv := old.cv; new.photo := old.photo; new.note := old.note; new.certificat_id := old.certificat_id; new.user_id := old.user_id;
  end if;
  return new;
end $$;
drop trigger if exists cv_garde on public.cv_demandes;
create trigger cv_garde before insert or update on public.cv_demandes for each row execute function public.cv_garde();

drop policy if exists "cv : je lis mes demandes" on public.cv_demandes;
create policy "cv : je lis mes demandes" on public.cv_demandes for select to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "cv : je demande" on public.cv_demandes;
create policy "cv : je demande" on public.cv_demandes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "cv : je retire ou l'admin traite" on public.cv_demandes;
create policy "cv : je retire ou l'admin traite" on public.cv_demandes for update to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "cv : l'admin supprime" on public.cv_demandes;
create policy "cv : l'admin supprime" on public.cv_demandes for delete to authenticated using (public.est_admin());

drop policy if exists "certificat : je lis le mien" on public.cv_certificats;
create policy "certificat : je lis le mien" on public.cv_certificats for select to authenticated using (user_id = auth.uid() or public.est_admin());
drop policy if exists "certificat : l'admin modifie" on public.cv_certificats;
create policy "certificat : l'admin modifie" on public.cv_certificats for update to authenticated using (public.est_admin());
drop policy if exists "certificat : l'admin supprime" on public.cv_certificats;
create policy "certificat : l'admin supprime" on public.cv_certificats for delete to authenticated using (public.est_admin());

-- Décision sur une demande. L'empreinte (h, ph) est calculée dans le navigateur de l'administrateur
-- à partir du CV qu'il vient de vérifier (même calcul que sur la page du membre).
create or replace function public.cv_decider(demande text, decision text, motif text default null, cert_id text default null, h text default null, ph text default null)
returns public.cv_demandes
language plpgsql security definer set search_path = public, auth as $$
declare d public.cv_demandes; qui text;
begin
  if not public.est_admin() then raise exception 'Réservé à l''administrateur'; end if;
  select * into d from public.cv_demandes where ref = demande;
  if not found then raise exception 'Demande introuvable'; end if;
  if decision not in ('certifier', 'complement', 'refuser') then raise exception 'Décision inconnue'; end if;
  perform set_config('casa.cv', '1', true);
  qui := coalesce((select e.nom from public.equipe e join auth.users u on lower(u.email) = e.email where u.id = auth.uid() limit 1), 'l''équipe Casa Besports');
  if decision = 'certifier' then
    if coalesce(cert_id, '') = '' or coalesce(h, '') = '' then raise exception 'Empreinte du CV manquante'; end if;
    insert into public.cv_certificats (id, user_id, demande, h, ph, nom, titre, par)
      values (cert_id, d.user_id, d.ref, h, nullif(ph, ''), d.nom, d.cv ->> 'titre', qui);
    update public.cv_demandes set statut = 'certifie', note = nullif(trim(coalesce(motif, '')), ''), certificat_id = cert_id, decide_le = now() where ref = demande returning * into d;
  else
    if coalesce(trim(motif), '') = '' then raise exception 'Expliquez ce qui manque ou le motif'; end if;
    update public.cv_demandes set statut = case decision when 'complement' then 'complement' else 'refusee' end, note = trim(motif), decide_le = now() where ref = demande returning * into d;
  end if;
  return d;
end $$;
revoke all on function public.cv_decider(text, text, text, text, text, text) from public;
grant execute on function public.cv_decider(text, text, text, text, text, text) to authenticated;

-- Vérification publique d'un certificat (lien ou QR code du CV)
drop function if exists public.cv_verifier(text);
create function public.cv_verifier(cert text)
returns table (id text, nom text, titre text, emis_le timestamptz, par text, revoque boolean, h text)
language sql stable security definer set search_path = public as $$
  select c.id, c.nom, c.titre, c.emis_le, c.par, c.revoque, c.h from public.cv_certificats c where c.id = upper(trim(cert));
$$;
revoke all on function public.cv_verifier(text) from public;
grant execute on function public.cv_verifier(text) to anon, authenticated;
