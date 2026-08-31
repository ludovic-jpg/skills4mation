ALTER TABLE public.formations_catalogue
  ALTER COLUMN formateur_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'formateur',
  ADD COLUMN IF NOT EXISTS duree_texte text;

ALTER TABLE public.formations_catalogue
  ADD CONSTRAINT formations_catalogue_source_check CHECK (source IN ('formateur','skills4mation'));

ALTER TABLE public.formations_inscriptions ALTER COLUMN formateur_id DROP NOT NULL;

DROP POLICY IF EXISTS formations_public_read ON public.formations_catalogue;
CREATE POLICY formations_public_read ON public.formations_catalogue
  FOR SELECT TO anon, authenticated
  USING (publiee = true AND (source = 'skills4mation' OR private.is_validated_formateur(formateur_id)));

DROP POLICY IF EXISTS inscriptions_public_insert ON public.formations_inscriptions;
CREATE POLICY inscriptions_public_insert ON public.formations_inscriptions
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.formations_catalogue f
    WHERE f.id = formations_inscriptions.formation_id
      AND f.formateur_id IS NOT DISTINCT FROM formations_inscriptions.formateur_id
      AND f.publiee = true
      AND f.inscriptions_ouvertes = true
  ));

DROP POLICY IF EXISTS inscriptions_formateur_read ON public.formations_inscriptions;
CREATE POLICY inscriptions_formateur_read ON public.formations_inscriptions
  FOR SELECT TO authenticated
  USING (formateur_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.formations_catalogue TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formations_catalogue TO authenticated;
GRANT ALL ON public.formations_catalogue TO service_role;
GRANT INSERT ON public.formations_inscriptions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.formations_inscriptions TO authenticated;
GRANT ALL ON public.formations_inscriptions TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS formations_catalogue_slug_key ON public.formations_catalogue (slug);