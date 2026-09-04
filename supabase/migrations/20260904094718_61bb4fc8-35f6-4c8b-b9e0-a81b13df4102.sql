ALTER TABLE public.formations_catalogue
  DROP CONSTRAINT IF EXISTS formations_catalogue_source_check;

ALTER TABLE public.formations_catalogue
  ADD CONSTRAINT formations_catalogue_source_check
  CHECK (source = ANY (ARRAY['formateur'::text, 'skills4mation'::text, 'historique'::text]));

DROP POLICY IF EXISTS formations_public_read ON public.formations_catalogue;

CREATE POLICY formations_public_read ON public.formations_catalogue
  FOR SELECT TO anon, authenticated
  USING (
    publiee = true
    AND (
      source = ANY (ARRAY['skills4mation'::text, 'historique'::text])
      OR private.is_validated_formateur(formateur_id)
    )
  );