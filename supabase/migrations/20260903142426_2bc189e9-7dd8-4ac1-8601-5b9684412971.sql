ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'refus_financement';

CREATE OR REPLACE FUNCTION public.dossiers_protect_statut_crm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_formateur_ok boolean;
BEGIN
  IF current_user <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT private.is_conseillere_ou_plus(auth.uid()) THEN

    v_formateur_ok := auth.uid() = OLD.formateur_id
      AND NEW.statut_crm::text IN (
        'brouillon',
        'demande_validation',
        'accord_financement',
        'formation_en_cours',
        'formation_realisee',
        'refuse'
      );

    IF NOT v_formateur_ok THEN
      NEW.statut_crm := OLD.statut_crm;
    END IF;

    NEW.commentaire_admin := OLD.commentaire_admin;
    NEW.signature_organisme_date := OLD.signature_organisme_date;
    NEW.signature_organisme_par := OLD.signature_organisme_par;
    NEW.signature_organisme_user_id := OLD.signature_organisme_user_id;
    NEW.signature_organisme_hash := OLD.signature_organisme_hash;
    NEW.signature_organisme_certificat_url := OLD.signature_organisme_certificat_url;
    NEW.signature_organisme_certificat_drive_url := OLD.signature_organisme_certificat_drive_url;
  END IF;
  RETURN NEW;
END;
$function$;