ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS demande_financement_deposee boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS demande_financement_mode text;