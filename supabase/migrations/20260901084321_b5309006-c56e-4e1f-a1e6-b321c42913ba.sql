ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS signature_organisme_date timestamptz,
  ADD COLUMN IF NOT EXISTS signature_organisme_par text,
  ADD COLUMN IF NOT EXISTS signature_organisme_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS signature_organisme_hash text,
  ADD COLUMN IF NOT EXISTS signature_organisme_certificat_url text,
  ADD COLUMN IF NOT EXISTS signature_organisme_certificat_drive_url text;

-- Le verrou existant empêche déjà les formateurs de modifier statut_crm / commentaire_admin.
-- On l'étend aux colonnes de signature d'organisme : seule l'équipe (conseillère,
-- super admin) ou le service_role peut apposer / modifier la preuve de signature.
CREATE OR REPLACE FUNCTION public.dossiers_protect_statut_crm()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT private.is_conseillere_ou_plus(auth.uid()) THEN
    NEW.statut_crm := OLD.statut_crm;
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