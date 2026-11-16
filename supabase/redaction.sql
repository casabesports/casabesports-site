-- Casa Besports : articles de l'espace rédaction enregistrés en ligne, avec accès cloisonnés.
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- À lancer APRÈS supabase/administration.sql et supabase/abonnes.sql (déjà lancés).
-- Le script peut être relancé sans risque.
--
-- Qui voit quoi (vérifié par Supabase, pas seulement masqué à l'écran) :
--   • l'administrateur (vous) voit, modifie, publie et supprime TOUS les articles ;
--   • un membre de la rédaction (chef d'édition, rédacteur, correspondant de club) ne voit QUE ses propres articles ;
--     il peut écrire, enregistrer, envoyer en relecture et supprimer ses brouillons, mais jamais publier ;
--   • les visiteurs ne lisent que la version en ligne des articles publiés (rien des brouillons, notes ni historique).

-- ========== 1. Les articles de la rédaction ==========
create table if not exists public.redaction_articles (
  id text primary key check (length(id) between 1 and 80),
  auteur_id uuid default auth.uid() references auth.users (id) on delete set null,
  auteur_nom text,
  statut text not null default 'draft' check (statut in ('draft', 'review', 'corrections', 'scheduled', 'published', 'rejected')),
  contenu jsonb not null default '{}'::jsonb,
  en_ligne jsonb,
  publier_le timestamptz,
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);
alter table public.redaction_articles enable row level security;
create index if not exists redaction_articles_auteur on public.redaction_articles (auteur_id);

-- Membre de la rédaction (n'importe quelle étiquette), adresse confirmée
create or replace function public.est_redaction() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select public.mon_role() is not null;
$$;
revoke all on function public.est_redaction() from public;
grant execute on function public.est_redaction() to authenticated;

-- Garde-fous : l'auteur d'un article ne change jamais, et seul l'administrateur publie ou retire du site
create or replace function public.redaction_garde() returns trigger
language plpgsql security definer set search_path = public, auth as $$
begin
  if tg_op = 'INSERT' then
    new.auteur_id := auth.uid();
    new.cree_le := now();
  else
    new.auteur_id := old.auteur_id;
    new.cree_le := old.cree_le;
  end if;
  new.modifie_le := now();
  if not public.est_admin() then
    if new.statut not in ('draft', 'review', 'corrections') then
      raise exception 'Seul l''administrateur peut publier ou programmer un article';
    end if;
    if tg_op = 'INSERT' and (new.en_ligne is not null or new.publier_le is not null) then
      raise exception 'Seul l''administrateur peut mettre un article en ligne';
    end if;
    if tg_op = 'UPDATE' and (new.en_ligne is distinct from old.en_ligne or new.publier_le is distinct from old.publier_le) then
      raise exception 'Seul l''administrateur peut mettre un article en ligne ou le retirer';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists redaction_garde on public.redaction_articles;
create trigger redaction_garde before insert or update on public.redaction_articles
  for each row execute function public.redaction_garde();

-- Lire : ses propres articles, ou tous pour l'administrateur
drop policy if exists "redaction lit ses articles" on public.redaction_articles;
create policy "redaction lit ses articles" on public.redaction_articles for select to authenticated
  using (public.est_admin() or (auteur_id = auth.uid() and public.est_redaction()));

-- Créer : membre de la rédaction, pour soi-même
drop policy if exists "redaction cree un article" on public.redaction_articles;
create policy "redaction cree un article" on public.redaction_articles for insert to authenticated
  with check (public.est_admin() or (public.est_redaction() and auteur_id = auth.uid()));

-- Modifier : l'administrateur tout ; l'auteur seulement tant que l'article est chez lui (brouillon ou corrections)
drop policy if exists "redaction modifie un article" on public.redaction_articles;
create policy "redaction modifie un article" on public.redaction_articles for update to authenticated
  using (public.est_admin() or (public.est_redaction() and auteur_id = auth.uid() and statut in ('draft', 'corrections')))
  with check (public.est_admin() or (public.est_redaction() and auteur_id = auth.uid()));

-- Supprimer : l'administrateur tout ; l'auteur ses brouillons jamais mis en ligne
drop policy if exists "redaction supprime un brouillon" on public.redaction_articles;
create policy "redaction supprime un brouillon" on public.redaction_articles for delete to authenticated
  using (public.est_admin() or (public.est_redaction() and auteur_id = auth.uid() and statut in ('draft', 'corrections', 'rejected') and en_ligne is null));

-- ========== 2. Articles en ligne, pour tous les visiteurs ==========
-- Seulement la version publiée (titre, chapeau, texte, photo…), jamais les brouillons ni l'historique.
-- Un article programmé apparaît tout seul à son heure.
create or replace function public.articles_en_ligne()
returns table (id text, article jsonb, publie_le timestamptz)
language sql stable security definer set search_path = public as $$
  select a.id, a.en_ligne, coalesce(a.publier_le, a.modifie_le)
  from public.redaction_articles a
  where a.en_ligne is not null and (a.publier_le is null or a.publier_le <= now())
  order by coalesce(a.publier_le, a.modifie_le) desc
  limit 300;
$$;
revoke all on function public.articles_en_ligne() from public;
grant execute on function public.articles_en_ligne() to anon, authenticated;
