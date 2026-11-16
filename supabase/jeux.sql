-- ================================================================
-- JEUX : le classement commun du « Prono du week-end » (rubrique Jeux, #/jeux)
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller › Run.
--
-- Chaque abonné connecté enregistre son pronostic (score domicile, score extérieur) pour un match.
-- Règles de sécurité :
--  - chacun ne crée, ne modifie ou n'efface QUE ses propres pronos, et seulement AVANT le coup d'envoi ;
--  - les pronos des autres ne sont lisibles qu'APRÈS le coup d'envoi (personne ne peut copier avant le match) ;
--  - seul un pseudo est visible (prénom + initiale du nom), jamais l'e-mail ni le téléphone.
-- Le compte supprimé emporte ses pronos (on delete cascade).
-- ================================================================
create table if not exists public.jeux_pronos (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  match_id text not null check (char_length(match_id) between 1 and 120),
  dom smallint not null check (dom between 0 and 300),
  ext smallint not null check (ext between 0 and 300),
  pseudo text check (pseudo is null or char_length(pseudo) <= 40),
  debut timestamptz not null,
  maj timestamptz not null default now(),
  primary key (user_id, match_id)
);
create index if not exists jeux_pronos_match on public.jeux_pronos (match_id);
alter table public.jeux_pronos enable row level security;

drop policy if exists "pronos : lire les siens, ceux des autres après le coup d'envoi" on public.jeux_pronos;
create policy "pronos : lire les siens, ceux des autres après le coup d'envoi" on public.jeux_pronos
  for select to authenticated using (user_id = auth.uid() or debut <= now());

drop policy if exists "pronos : ajouter le sien avant le match" on public.jeux_pronos;
create policy "pronos : ajouter le sien avant le match" on public.jeux_pronos
  for insert to authenticated with check (user_id = auth.uid() and debut > now());

drop policy if exists "pronos : modifier le sien avant le match" on public.jeux_pronos;
create policy "pronos : modifier le sien avant le match" on public.jeux_pronos
  for update to authenticated using (user_id = auth.uid() and debut > now()) with check (user_id = auth.uid() and debut > now());

drop policy if exists "pronos : retirer le sien avant le match" on public.jeux_pronos;
create policy "pronos : retirer le sien avant le match" on public.jeux_pronos
  for delete to authenticated using (user_id = auth.uid() and debut > now());

grant select, insert, update, delete on public.jeux_pronos to authenticated;
