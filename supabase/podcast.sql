-- ================================================================
-- PODCAST : autoriser les fichiers audio dans le dossier « site »
-- À lancer UNE fois : Supabase › SQL Editor › New query › coller › Run.
-- Garde les images et les vidéos déjà autorisées, ajoute l'audio (.mp3, .m4a, .aac, .wav, .ogg).
-- Taille maximale : 50 Mo par fichier (le maximum du forfait gratuit de Supabase).
-- ================================================================
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime',
                               'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/ogg']
where id = 'site';
