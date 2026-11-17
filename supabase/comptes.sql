-- Casa Besports : un seul compte par personne (pas de doublon e-mail / mobile).
-- À coller une seule fois dans Supabase › SQL Editor › New query, puis « Run ». Le script peut être relancé sans risque.
--
-- Ce que Supabase garantit déjà tout seul :
--   - une même adresse e-mail ne peut appartenir qu'à UN compte ;
--   - un même numéro de mobile ne peut appartenir qu'à UN compte.
-- Le doublon possible : une personne crée son compte avec son e-mail, puis un jour avec son mobile (ou l'inverse).
-- Le site lui demande alors son e-mail au moment de créer le mot de passe ; si l'adresse a déjà un compte,
-- il lui propose de supprimer le compte qu'elle vient de créer par erreur. Cette suppression passe par la fonction ci-dessous.

create or replace function public.supprimer_compte_doublon()
returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  u auth.users%rowtype;
begin
  select * into u from auth.users where id = auth.uid();
  if not found then raise exception 'Non connecté'; end if;
  -- Garde-fous : seulement un compte tout neuf (moins de 24 h), sans e-mail confirmé,
  -- qui n'est ni dans l'équipe ni abonné payant. Un vrai compte ne peut donc pas être effacé par erreur.
  if u.created_at < now() - interval '24 hours' then raise exception 'Ce compte n''est pas récent : écrivez-nous pour le fusionner'; end if;
  if u.email_confirmed_at is not null then raise exception 'Ce compte a un e-mail confirmé : il ne peut pas être supprimé ici'; end if;
  if exists (select 1 from public.equipe e where e.email = lower(coalesce(u.email, ''))) then raise exception 'Compte de l''équipe : suppression impossible ici'; end if;
  if to_regclass('public.abonnements') is not null then
    if exists (select 1 from public.abonnements a where a.user_id = u.id and a.statut in ('active', 'trialing', 'past_due')) then
      raise exception 'Ce compte a un abonnement en cours : écrivez-nous pour le fusionner';
    end if;
  end if;
  delete from auth.users where id = u.id;
end $$;
revoke all on function public.supprimer_compte_doublon() from public;
grant execute on function public.supprimer_compte_doublon() to authenticated;
