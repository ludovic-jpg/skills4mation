-- Empêche un formateur de faire avancer lui-même son dossier via un appel direct
-- au client Supabase : la politique dossiers_own_update autorise l'UPDATE de toutes
-- les colonnes de son propre dossier, y compris statut_crm et commentaire_admin.
-- Ce trigger restaure ces deux colonnes sauf pour l'équipe (rôle admin) ou le
-- service_role (serveur). Même principe que public.profiles_protect_statut.
-- Évolution des rôles à venir : élargir la condition ci-dessous (conseillere / super_admin).
CREATE OR REPLACE FUNCTION public.dossiers_protect_statut_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT private.has_role(auth.uid(), 'admin') THEN
    NEW.statut_crm := OLD.statut_crm;
    NEW.commentaire_admin := OLD.commentaire_admin;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS dossiers_protect_statut_crm_trg ON public.dossiers;

CREATE TRIGGER dossiers_protect_statut_crm_trg
BEFORE UPDATE ON public.dossiers
FOR EACH ROW EXECUTE FUNCTION public.dossiers_protect_statut_crm();