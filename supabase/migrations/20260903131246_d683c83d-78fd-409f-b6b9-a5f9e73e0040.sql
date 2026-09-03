ALTER TABLE public.formations_catalogue
  ADD COLUMN IF NOT EXISTS publication_statut text NOT NULL DEFAULT 'brouillon',
  ADD COLUMN IF NOT EXISTS publication_demandee_le timestamptz,
  ADD COLUMN IF NOT EXISTS publication_decidee_le timestamptz,
  ADD COLUMN IF NOT EXISTS publication_motif text;

ALTER TABLE public.formations_catalogue
  DROP CONSTRAINT IF EXISTS formations_catalogue_publication_statut_check;
ALTER TABLE public.formations_catalogue
  ADD CONSTRAINT formations_catalogue_publication_statut_check
  CHECK (publication_statut IN ('brouillon','en_attente','publiee','refusee'));

UPDATE public.formations_catalogue SET publication_statut = 'publiee' WHERE publiee IS TRUE;

CREATE OR REPLACE FUNCTION public.formations_publication_guard()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR private.is_conseillere_ou_plus(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.publiee := false;
    NEW.publication_statut := 'brouillon';
    RETURN NEW;
  END IF;

  IF NEW.publiee IS DISTINCT FROM OLD.publiee THEN
    NEW.publiee := OLD.publiee;
  END IF;

  IF NEW.publication_statut IS DISTINCT FROM OLD.publication_statut THEN
    IF NEW.publication_statut = 'en_attente'
       AND OLD.publication_statut IN ('brouillon','refusee') THEN
      NEW.publication_demandee_le := now();
      NEW.publication_motif := NULL;
    ELSIF NEW.publication_statut = 'brouillon'
       AND OLD.publication_statut = 'en_attente' THEN
      NEW.publication_demandee_le := NULL;
    ELSE
      NEW.publication_statut := OLD.publication_statut;
    END IF;
  END IF;

  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.formations_publication_guard() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS formations_catalogue_publication_guard ON public.formations_catalogue;
CREATE TRIGGER formations_catalogue_publication_guard
  BEFORE INSERT OR UPDATE ON public.formations_catalogue
  FOR EACH ROW EXECUTE FUNCTION public.formations_publication_guard();

DROP POLICY IF EXISTS formations_equipe_update ON public.formations_catalogue;
CREATE POLICY formations_equipe_update ON public.formations_catalogue
  FOR UPDATE TO authenticated
  USING (private.is_conseillere_ou_plus(auth.uid()))
  WITH CHECK (private.is_conseillere_ou_plus(auth.uid()));