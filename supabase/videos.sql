-- ================================================================
-- VIDÉOS EN ARRIÈRE-PLAN : autoriser les vidéos dans le dossier « site »
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller › Run.
-- Ajoute les vidéos (.mp4, .webm, .mov) et monte la taille maximale à 50 Mo
-- (le maximum du forfait gratuit de Supabase). Les images restent acceptées.
-- ================================================================
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'site';
