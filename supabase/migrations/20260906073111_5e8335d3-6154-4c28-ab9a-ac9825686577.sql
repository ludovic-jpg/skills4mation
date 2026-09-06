-- 1. Dédoublonnage : un compte pouvant cumuler admin/super_admin/conseillere
DELETE FROM public.user_roles a
USING public.user_roles b
WHERE a.user_id = b.user_id
  AND a.role::text IN ('admin','super_admin','conseillere')
  AND b.role::text IN ('admin','super_admin','conseillere')
  AND a.id > b.id;

-- 2. Suppression des policies qui référencent private.has_role
DROP POLICY IF EXISTS ambassadeurs_select_admin ON public.ambassadeurs;
DROP POLICY IF EXISTS ambassadeurs_update_admin ON public.ambassadeurs;
DROP POLICY IF EXISTS candidatures_admin_select ON public.candidatures;
DROP POLICY IF EXISTS candidatures_admin_update ON public.candidatures;
DROP POLICY IF EXISTS certifications_admin_delete ON public.certifications;
DROP POLICY IF EXISTS certifications_admin_insert ON public.certifications;
DROP POLICY IF EXISTS certifications_admin_update ON public.certifications;
DROP POLICY IF EXISTS budget_admin_select ON public.demandes_budget;
DROP POLICY IF EXISTS budget_admin_update ON public.demandes_budget;
DROP POLICY IF EXISTS "Admins can read contact requests" ON public.demandes_contact;
DROP POLICY IF EXISTS contact_admin_update ON public.demandes_contact;
DROP POLICY IF EXISTS droits_admin_select ON public.demandes_droits_formation;
DROP POLICY IF EXISTS droits_admin_update ON public.demandes_droits_formation;
DROP POLICY IF EXISTS envois_admin_select ON public.document_envois;
DROP POLICY IF EXISTS envois_admin_update ON public.document_envois;
DROP POLICY IF EXISTS apprenants_admin_select ON public.dossier_apprenants;
DROP POLICY IF EXISTS apprenants_admin_update ON public.dossier_apprenants;
DROP POLICY IF EXISTS hist_admin_select ON public.dossier_historique;
DROP POLICY IF EXISTS hist_insert ON public.dossier_historique;
DROP POLICY IF EXISTS formations_admin_read ON public.formations_catalogue;
DROP POLICY IF EXISTS inscriptions_formateur_read ON public.formations_inscriptions;
DROP POLICY IF EXISTS inscriptions_formateur_update ON public.formations_inscriptions;
DROP POLICY IF EXISTS parcours_admin ON public.parcours_formation;
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
DROP POLICY IF EXISTS tarifs_cpf_admin_delete ON public.tarifs_cpf;
DROP POLICY IF EXISTS tarifs_cpf_admin_insert ON public.tarifs_cpf;
DROP POLICY IF EXISTS tarifs_cpf_admin_update ON public.tarifs_cpf;
DROP POLICY IF EXISTS user_roles_select_admin ON public.user_roles;
DROP POLICY IF EXISTS user_roles_insert_super_admin ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete_super_admin ON public.user_roles;
DROP POLICY IF EXISTS admin_read_all_files ON storage.objects;
DROP POLICY IF EXISTS candidatures_admin_read ON storage.objects;
DROP POLICY IF EXISTS profils_admin_select ON storage.objects;

-- 3. Triggers/fonctions plpgsql qui écrivaient les anciens rôles
CREATE OR REPLACE FUNCTION public.grant_admin_for_team_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
begin
  if new.email_confirmed_at is not null
     and lower(new.email) in ('ludovic@formatrix.fr','contact@skills4mation.com') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'conseiller_formation')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_statut public.candidature_statut := 'en_attente';
  v_is_equipe boolean := lower(NEW.email) LIKE '%@skills4mation.com';
  v_is_apprenant boolean := EXISTS (
    SELECT 1 FROM public.dossier_apprenants a WHERE lower(a.email) = lower(NEW.email)
  );
BEGIN
  IF v_is_equipe OR EXISTS (
    SELECT 1 FROM public.candidatures c
    WHERE lower(c.email) = lower(NEW.email) AND c.statut = 'valide'
  ) THEN
    v_statut := 'valide';
  END IF;

  INSERT INTO public.profiles (id, email, prenom, nom, statut_candidature)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''), v_statut)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE
    WHEN v_is_equipe THEN 'conseiller_formation'::public.app_role
    WHEN v_is_apprenant THEN 'apprenant'::public.app_role
    ELSE 'formateur'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF v_is_apprenant THEN
    UPDATE public.dossier_apprenants
       SET user_id = NEW.id
     WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profiles_protect_statut()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT private.is_conseiller_formation(auth.uid()) THEN
    NEW.statut_candidature := OLD.statut_candidature;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- 4. private.has_role dépend du type app_role : suppression avant recréation du type
DROP FUNCTION IF EXISTS private.has_role(uuid, public.app_role);

-- 5. Le type app_role ne contient plus que les 3 rôles cibles
ALTER TYPE public.app_role RENAME TO app_role_ancien;
CREATE TYPE public.app_role AS ENUM ('conseiller_formation', 'formateur', 'apprenant');

ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role
  USING (
    CASE
      WHEN role::text IN ('admin', 'super_admin', 'conseillere') THEN 'conseiller_formation'
      ELSE role::text
    END
  )::public.app_role;

DROP TYPE public.app_role_ancien;

-- 6. Helpers de rôle (security definer, non exposés aux clients)
CREATE OR REPLACE FUNCTION private.is_conseiller_formation(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = 'conseiller_formation'
  )
$function$;

-- Conservée pour les policies existantes qui l'utilisent déjà.
CREATE OR REPLACE FUNCTION private.is_conseillere_ou_plus(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT private.is_conseiller_formation(_user_id)
$function$;

REVOKE ALL ON FUNCTION private.is_conseiller_formation(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.is_conseillere_ou_plus(uuid) FROM PUBLIC, anon, authenticated;

-- 7. Policies réécrites à l'identique, pour le seul rôle conseiller_formation
CREATE POLICY ambassadeurs_select_conseiller ON public.ambassadeurs
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY ambassadeurs_update_conseiller ON public.ambassadeurs
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

CREATE POLICY candidatures_conseiller_select ON public.candidatures
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY candidatures_conseiller_update ON public.candidatures
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()));

CREATE POLICY certifications_conseiller_delete ON public.certifications
  FOR DELETE TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY certifications_conseiller_insert ON public.certifications
  FOR INSERT TO authenticated WITH CHECK (private.is_conseiller_formation(auth.uid()));
CREATE POLICY certifications_conseiller_update ON public.certifications
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

CREATE POLICY budget_conseiller_select ON public.demandes_budget
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY budget_conseiller_update ON public.demandes_budget
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()));

CREATE POLICY contact_conseiller_select ON public.demandes_contact
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY contact_conseiller_update ON public.demandes_contact
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

CREATE POLICY droits_conseiller_select ON public.demandes_droits_formation
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY droits_conseiller_update ON public.demandes_droits_formation
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

CREATE POLICY envois_conseiller_select ON public.document_envois
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY envois_conseiller_update ON public.document_envois
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

CREATE POLICY apprenants_conseiller_select ON public.dossier_apprenants
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY apprenants_conseiller_update ON public.dossier_apprenants
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

CREATE POLICY hist_conseiller_select ON public.dossier_historique
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY hist_insert ON public.dossier_historique
  FOR INSERT TO authenticated WITH CHECK (
    auteur_id = auth.uid()
    AND (
      private.is_conseiller_formation(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.dossiers d
        WHERE d.id = dossier_historique.dossier_id AND d.formateur_id = auth.uid()
      )
    )
  );

CREATE POLICY formations_conseiller_read ON public.formations_catalogue
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));

CREATE POLICY inscriptions_formateur_read ON public.formations_inscriptions
  FOR SELECT TO authenticated
  USING (formateur_id = auth.uid() OR private.is_conseiller_formation(auth.uid()));
CREATE POLICY inscriptions_formateur_update ON public.formations_inscriptions
  FOR UPDATE TO authenticated
  USING (formateur_id = auth.uid() OR private.is_conseiller_formation(auth.uid()))
  WITH CHECK (formateur_id = auth.uid() OR private.is_conseiller_formation(auth.uid()));

CREATE POLICY parcours_conseiller ON public.parcours_formation
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));

CREATE POLICY profiles_select_conseiller ON public.profiles
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY profiles_update_conseiller ON public.profiles
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()));

CREATE POLICY tarifs_cpf_conseiller_delete ON public.tarifs_cpf
  FOR DELETE TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY tarifs_cpf_conseiller_insert ON public.tarifs_cpf
  FOR INSERT TO authenticated WITH CHECK (private.is_conseiller_formation(auth.uid()));
CREATE POLICY tarifs_cpf_conseiller_update ON public.tarifs_cpf
  FOR UPDATE TO authenticated USING (private.is_conseiller_formation(auth.uid()));

CREATE POLICY user_roles_select_conseiller ON public.user_roles
  FOR SELECT TO authenticated USING (private.is_conseiller_formation(auth.uid()));
CREATE POLICY user_roles_insert_conseiller ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (private.is_conseiller_formation(auth.uid()));
CREATE POLICY user_roles_delete_conseiller ON public.user_roles
  FOR DELETE TO authenticated
  USING (private.is_conseiller_formation(auth.uid()) AND user_id <> auth.uid());

CREATE POLICY conseiller_read_all_files ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = ANY (ARRAY['avatars','documents']) AND private.is_conseiller_formation(auth.uid()));
CREATE POLICY candidatures_conseiller_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'candidatures' AND private.is_conseiller_formation(auth.uid()));
CREATE POLICY profils_conseiller_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'profils' AND private.is_conseiller_formation(auth.uid()));