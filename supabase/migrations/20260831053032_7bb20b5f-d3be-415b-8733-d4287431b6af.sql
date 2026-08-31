-- Décision documentée : la colonne dossiers.statut n'est plus alimentée manuellement
-- (aucun usage applicatif en écriture hors création). Elle est conservée pour
-- compatibilité descendante et synchronisée automatiquement depuis statut_crm.
CREATE OR REPLACE FUNCTION public.dossiers_sync_statut()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.statut := CASE NEW.statut_crm
    WHEN 'brouillon' THEN 'brouillon'
    WHEN 'demande_validation' THEN 'documents_generes'
    WHEN 'dossier_valide' THEN 'documents_signes'
    WHEN 'demande_financement' THEN 'financement_depose'
    WHEN 'accord_financement' THEN 'financement_depose'
    WHEN 'finalisation_administrative' THEN 'financement_depose'
    WHEN 'formation_en_cours' THEN 'financement_depose'
    WHEN 'formation_realisee' THEN 'complet'
    WHEN 'demande_paiement' THEN 'complet'
    WHEN 'paiement' THEN 'complet'
    WHEN 'paiement_organisme' THEN 'complet'
    WHEN 'paiement_formateur' THEN 'complet'
    WHEN 'refuse' THEN 'archive'
    ELSE NEW.statut
  END::public.dossier_statut;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dossiers_sync_statut_trg ON public.dossiers;
CREATE TRIGGER dossiers_sync_statut_trg
  BEFORE INSERT OR UPDATE OF statut_crm ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.dossiers_sync_statut();

-- Reprise des dossiers déjà au statut "paiement" vers "paiement_organisme"
UPDATE public.dossiers SET statut_crm = 'paiement_organisme' WHERE statut_crm = 'paiement';