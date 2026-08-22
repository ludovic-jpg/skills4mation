CREATE POLICY "own_folder_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars','documents') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own_folder_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars','documents') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own_folder_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('avatars','documents') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "own_folder_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('avatars','documents') AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "admin_read_all_files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('avatars','documents') AND public.has_role(auth.uid(), 'admin'));