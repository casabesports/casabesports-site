-- Casa Besports : cartes membres
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».

create table if not exists public.membres (
  id uuid primary key references auth.users(id) on delete cascade,
  numero text unique not null,
  prenom text,
  statut text not null default 'actif',   -- 'actif' ou 'suspendu'
  cree_le timestamptz not null default now()
);

-- Le numéro est calculé à partir de l'identifiant du compte (même calcul que le site) : impossible à choisir soi-même
create or replace function public.cb_numero(u uuid) returns text
language plpgsql immutable as $$
declare
  alpha text := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  n bigint := ('x' || lpad(substr(replace(u::text, '-', ''), 1, 10), 16, '0'))::bit(64)::bigint;
  body text := '';
  s int := 0;
  i int;
begin
  for i in 1..8 loop body := substr(alpha, (n % 32)::int + 1, 1) || body; n := n / 32; end loop;
  for i in 1..8 loop s := s + i * (position(substr(body, i, 1) in alpha) - 1); end loop;
  return 'CB-' || substr(body, 1, 4) || '-' || substr(body, 5, 4) || '-' || substr(alpha, s % 32 + 1, 1);
end $$;

create or replace function public.membres_avant() returns trigger
language plpgsql as $$
begin
  new.numero := public.cb_numero(new.id);
  if tg_op = 'INSERT' then new.statut := 'actif'; new.cree_le := now();
  elsif auth.uid() is not null then new.statut := old.statut; new.cree_le := old.cree_le; -- un abonné ne peut changer que son prénom
  end if;
  return new;
end $$;
drop trigger if exists membres_avant on public.membres;
create trigger membres_avant before insert or update on public.membres for each row execute function public.membres_avant();

alter table public.membres enable row level security;

-- Chaque abonné peut créer et lire sa propre ligne (rien d'autre)
drop policy if exists "membre lit sa ligne" on public.membres;
create policy "membre lit sa ligne" on public.membres for select using (auth.uid() = id);
drop policy if exists "membre cree sa ligne" on public.membres;
create policy "membre cree sa ligne" on public.membres for insert with check (auth.uid() = id);
drop policy if exists "membre met a jour sa ligne" on public.membres;
create policy "membre met a jour sa ligne" on public.membres for update using (auth.uid() = id) with check (auth.uid() = id);

-- Vérification par un partenaire : renvoie seulement le prénom, la date d'inscription et le statut
create or replace function public.verifier_membre(num text)
returns table (prenom text, depuis timestamptz, statut text)
language sql security definer set search_path = public as $$
  select m.prenom, m.cree_le, m.statut from public.membres m where m.numero = upper(num) limit 1;
$$;
grant execute on function public.verifier_membre(text) to anon, authenticated;
