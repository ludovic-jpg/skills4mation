ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS entreprise text,
  ADD COLUMN IF NOT EXISTS entreprise_adresse text,
  ADD COLUMN IF NOT EXISTS nda_document_url text,
  ADD COLUMN IF NOT EXISTS nda_region text;

-- Stockage "profils" : cloisonnement par dossier utilisateur (<uid>/...)
DROP POLICY IF EXISTS "profils_own_select" ON storage.objects;
DROP POLICY IF EXISTS "profils_own_insert" ON storage.objects;
DROP POLICY IF EXISTS "profils_own_update" ON storage.objects;
DROP POLICY IF EXISTS "profils_own_delete" ON storage.objects;
DROP POLICY IF EXISTS "profils_admin_select" ON storage.objects;

CREATE POLICY "profils_own_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profils' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profils_own_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profils' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profils_own_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profils' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'profils' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profils_own_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profils' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "profils_admin_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profils' AND private.has_role(auth.uid(), 'admin'::public.app_role));