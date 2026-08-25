ALTER TABLE public.candidatures
  ADD COLUMN IF NOT EXISTS parcours_formation_url text;

DROP POLICY IF EXISTS candidatures_public_upload ON storage.objects;
CREATE POLICY candidatures_public_upload ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'candidatures'
    AND (storage.foldername(name))[1] = 'public'
  );