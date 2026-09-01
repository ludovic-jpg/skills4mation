-- 'admin' historique et 'super_admin' sont équivalents partout où has_role(..., 'admin') est testé.
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND (
        ur.role = _role
        OR (_role IN ('admin', 'super_admin') AND ur.role IN ('admin', 'super_admin'))
      )
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Conseillère OU super admin (réutilisable dans les policies et triggers).
CREATE OR REPLACE FUNCTION private.is_conseillere_ou_plus(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role IN ('conseillere', 'admin', 'super_admin')
  )
$$;

REVOKE ALL ON FUNCTION private.is_conseillere_ou_plus(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_conseillere_ou_plus(uuid) TO authenticated, service_role;

-- Verrou statut CRM : conseillère et super admin peuvent faire avancer un dossier, pas le formateur.
CREATE OR REPLACE FUNCTION public.dossiers_protect_statut_crm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_user <> 'service_role'
     AND auth.uid() IS NOT NULL
     AND NOT private.is_conseillere_ou_plus(auth.uid()) THEN
    NEW.statut_crm := OLD.statut_crm;
    NEW.commentaire_admin := OLD.commentaire_admin;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.dossiers_protect_statut_crm() FROM PUBLIC, anon, authenticated;

-- Gestion des rôles réservée aux super admins.
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

DROP POLICY IF EXISTS user_roles_insert_super_admin ON public.user_roles;
CREATE POLICY user_roles_insert_super_admin ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS user_roles_delete_super_admin ON public.user_roles;
CREATE POLICY user_roles_delete_super_admin ON public.user_roles
FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'super_admin') AND user_id <> auth.uid());