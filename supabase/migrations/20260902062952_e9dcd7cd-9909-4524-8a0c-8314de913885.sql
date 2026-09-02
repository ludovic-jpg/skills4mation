CREATE SEQUENCE IF NOT EXISTS public.adf_numero_seq AS bigint START WITH 1 INCREMENT BY 1;

GRANT USAGE, SELECT ON SEQUENCE public.adf_numero_seq TO authenticated;
GRANT ALL ON SEQUENCE public.adf_numero_seq TO service_role;

ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS certification_statut text;

ALTER TABLE public.dossiers
  ADD CONSTRAINT dossiers_certification_statut_check
  CHECK (certification_statut IS NULL OR certification_statut IN ('en_cours','obtenue','non_obtenue'));