CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.is_validated_formateur(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND statut_candidature = 'valide') $$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_validated_formateur(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_validated_formateur(uuid) TO anon, authenticated, service_role;

-- profiles
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS user_roles_select_admin ON public.user_roles;
CREATE POLICY user_roles_select_admin ON public.user_roles FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- parcours_formation
DROP POLICY IF EXISTS parcours_public_read ON public.parcours_formation;
CREATE POLICY parcours_public_read ON public.parcours_formation FOR SELECT TO anon USING (private.is_validated_formateur(formateur_id));
DROP POLICY IF EXISTS parcours_admin ON public.parcours_formation;
CREATE POLICY parcours_admin ON public.parcours_formation FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- dossiers
DROP POLICY IF EXISTS dossiers_admin_update ON public.dossiers;
CREATE POLICY dossiers_admin_update ON public.dossiers FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS dossiers_admin_select ON public.dossiers;
CREATE POLICY dossiers_admin_select ON public.dossiers FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS dossiers_own_insert ON public.dossiers;
CREATE POLICY dossiers_own_insert ON public.dossiers FOR INSERT TO authenticated WITH CHECK (formateur_id = auth.uid() AND private.is_validated_formateur(auth.uid()));

-- documents_dossier
DROP POLICY IF EXISTS docs_admin_select ON public.documents_dossier;
CREATE POLICY docs_admin_select ON public.documents_dossier FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- demandes_budget
DROP POLICY IF EXISTS budget_admin_update ON public.demandes_budget;
CREATE POLICY budget_admin_update ON public.demandes_budget FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS budget_admin_select ON public.demandes_budget;
CREATE POLICY budget_admin_select ON public.demandes_budget FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS budget_own_insert ON public.demandes_budget;
CREATE POLICY budget_own_insert ON public.demandes_budget FOR INSERT TO authenticated WITH CHECK (formateur_id = auth.uid() AND private.is_validated_formateur(auth.uid()));

-- candidatures
DROP POLICY IF EXISTS candidatures_admin_update ON public.candidatures;
CREATE POLICY candidatures_admin_update ON public.candidatures FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS candidatures_admin_select ON public.candidatures;
CREATE POLICY candidatures_admin_select ON public.candidatures FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- storage
DROP POLICY IF EXISTS admin_read_all_files ON storage.objects;
CREATE POLICY admin_read_all_files ON storage.objects FOR SELECT TO authenticated USING (bucket_id = ANY (ARRAY['avatars','documents']) AND private.has_role(auth.uid(), 'admin'));

-- update definer trigger fn to use private.has_role
CREATE OR REPLACE FUNCTION public.profiles_protect_statut()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT private.has_role(auth.uid(), 'admin') THEN
    NEW.statut_candidature := OLD.statut_candidature;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_validated_formateur(uuid);