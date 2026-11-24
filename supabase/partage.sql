-- Casa Besports : « Partager sur mes réseaux » pour les rédacteurs et correspondants de club.
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ».
-- À lancer APRÈS supabase/redaction.sql (déjà lancé). Le script peut être relancé sans risque.
--
-- Ce que ça permet : l'auteur d'un article (et l'administrateur) peut, même APRÈS la publication,
--   • choisir l'image d'aperçu affichée sur Facebook, LinkedIn, WhatsApp… (champ « partage ») ;
--   • choisir si la lecture est gratuite ou réservée aux abonnés BE+ (champ « premium »).
-- Rien d'autre ne change : le texte, le titre et la mise en ligne restent sous le contrôle de l'administrateur.
-- Sans ce script, ces deux choix restent possibles tant que l'article est en brouillon ou en corrections.

-- 1. Le garde-fou de la rédaction laisse passer ce seul changement, quand il vient de la fonction ci-dessous
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
  -- Changement fait par public.article_partage (image de partage, gratuit / abonnés) : déjà vérifié là-bas
  if tg_op = 'UPDATE' and coalesce(current_setting('casa.partage', true), '') = '1' then
    return new;
  end if;
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

-- 2. Choix de l'auteur : image de partage et lecture gratuite ou réservée aux abonnés
create or replace function public.article_partage(p_id text, p_img text default null, p_premium boolean default null)
returns jsonb
language plpgsql security definer set search_path = public, auth as $$
declare
  a public.redaction_articles;
  maj jsonb := '{}'::jsonb;
begin
  select * into a from public.redaction_articles where id = p_id for update;
  if not found then raise exception 'Article introuvable'; end if;
  if not (public.est_admin() or (a.auteur_id = auth.uid() and public.est_redaction())) then
    raise exception 'Seul l''auteur de l''article (ou l''administrateur) peut choisir son partage';
  end if;
  if p_img is not null then
    if length(p_img) > 900000 then raise exception 'Image trop lourde (900 Ko au maximum)'; end if;
    if p_img <> '' and p_img !~ '^(https://|/?assets/|data:image/(jpeg|png|webp);base64,)' then raise exception 'Image non acceptée'; end if;
    maj := maj || jsonb_build_object('partage', case when p_img = '' then null else jsonb_build_object('img', p_img, 'le', now()) end);
  end if;
  if p_premium is not null then maj := maj || jsonb_build_object('premium', p_premium); end if;
  if maj = '{}'::jsonb then return '{}'::jsonb; end if;
  perform set_config('casa.partage', '1', true);
  update public.redaction_articles
     set contenu = coalesce(contenu, '{}'::jsonb) || maj,
         en_ligne = case when en_ligne is null then null else en_ligne || maj end
   where id = p_id;
  perform set_config('casa.partage', '', true);
  return maj;
end $$;
revoke all on function public.article_partage(text, text, boolean) from public;
grant execute on function public.article_partage(text, text, boolean) to authenticated;
