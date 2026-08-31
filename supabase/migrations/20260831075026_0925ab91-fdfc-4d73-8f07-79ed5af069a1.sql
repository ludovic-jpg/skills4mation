ALTER TABLE public.document_envois
  ADD COLUMN IF NOT EXISTS signature_consentement boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signature_date timestamptz,
  ADD COLUMN IF NOT EXISTS signature_hash text,
  ADD COLUMN IF NOT EXISTS signature_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS certificat_url text,
  ADD COLUMN IF NOT EXISTS certificat_drive_url text;