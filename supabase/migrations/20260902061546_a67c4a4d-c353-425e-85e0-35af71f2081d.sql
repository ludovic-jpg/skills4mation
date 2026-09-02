ALTER TABLE public.parcours_formation
  ADD COLUMN IF NOT EXISTS objectifs text,
  ADD COLUMN IF NOT EXISTS prerequis text,
  ADD COLUMN IF NOT EXISTS duree_heures integer,
  ADD COLUMN IF NOT EXISTS modules jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS document_source_url text,
  ADD COLUMN IF NOT EXISTS genere_par_ia boolean NOT NULL DEFAULT false;