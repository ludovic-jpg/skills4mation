ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS secteur_activite text,
  ADD COLUMN IF NOT EXISTS expertise text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS linkedin_connected_at timestamptz;