ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS validation_due_at timestamptz;

-- Échéance de traitement à 24 h : posée dès l'entrée en demande_validation,
-- pour alimenter la file de validation des conseillères (/admin/validation).
CREATE OR REPLACE FUNCTION public.dossiers_set_validation_due()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.statut_crm = 'demande_validation'
     AND (TG_OP = 'INSERT' OR OLD.statut_crm IS DISTINCT FROM 'demande_validation') THEN
    NEW.validation_due_at := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dossiers_set_validation_due_trg ON public.dossiers;
CREATE TRIGGER dossiers_set_validation_due_trg
BEFORE INSERT OR UPDATE ON public.dossiers
FOR EACH ROW EXECUTE FUNCTION public.dossiers_set_validation_due();

UPDATE public.dossiers
   SET validation_due_at = created_at + interval '24 hours'
 WHERE statut_crm = 'demande_validation' AND validation_due_at IS NULL;