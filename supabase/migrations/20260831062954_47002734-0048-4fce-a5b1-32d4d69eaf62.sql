CREATE POLICY "formations_visuels_own" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'formations' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'formations' AND (storage.foldername(name))[1] = auth.uid()::text);