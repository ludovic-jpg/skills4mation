CREATE OR REPLACE FUNCTION public.dossiers_notify_statut()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_label text;
BEGIN
  IF NEW.statut_crm IS DISTINCT FROM OLD.statut_crm AND auth.uid() IS DISTINCT FROM NEW.formateur_id THEN
    v_label := CASE NEW.statut_crm
      WHEN 'demande_validation' THEN 'Demande de validation'
      WHEN 'dossier_valide' THEN 'Dossier validé'
      WHEN 'demande_financement' THEN 'Demande de financement'
      WHEN 'accord_financement' THEN 'Accord de financement'
      WHEN 'finalisation_administrative' THEN 'Finalisation administrative'
      WHEN 'formation_en_cours' THEN 'Formation en cours'
      WHEN 'formation_realisee' THEN 'Formation réalisée'
      WHEN 'demande_paiement' THEN 'Demande de paiement'
      WHEN 'paiement_organisme' THEN 'Paiement organisme'
      WHEN 'paiement_formateur' THEN 'Paiement formateur'
      WHEN 'refuse' THEN 'Dossier refusé / annulé'
      ELSE NEW.statut_crm::text
    END;

    INSERT INTO public.notifications (user_id, titre, message, lien)
    VALUES (
      NEW.formateur_id,
      'Dossier mis à jour : ' || v_label,
      COALESCE(NEW.dossier_nom, NEW.titre_formation, 'Votre dossier') || ' est désormais à l''étape « ' || v_label || ' ».',
      '/espace/dossiers/' || NEW.id::text
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dossiers_notify_statut_trg ON public.dossiers;
CREATE TRIGGER dossiers_notify_statut_trg
  AFTER UPDATE OF statut_crm ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.dossiers_notify_statut();

REVOKE EXECUTE ON FUNCTION public.dossiers_notify_statut() FROM anon, authenticated;