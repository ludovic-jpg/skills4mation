ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

ALTER TABLE public.candidatures REPLICA IDENTITY FULL;
ALTER TABLE public.demandes_budget REPLICA IDENTITY FULL;
ALTER TABLE public.demandes_contact REPLICA IDENTITY FULL;
ALTER TABLE public.demandes_droits_formation REPLICA IDENTITY FULL;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['candidatures','demandes_budget','demandes_contact','demandes_droits_formation'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;