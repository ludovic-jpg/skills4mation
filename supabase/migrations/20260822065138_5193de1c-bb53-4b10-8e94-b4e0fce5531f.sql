-- ROLES
CREATE TYPE public.app_role AS ENUM ('formateur', 'admin');
CREATE TYPE public.candidature_statut AS ENUM ('en_attente', 'valide', 'refuse');
CREATE TYPE public.dossier_statut AS ENUM ('brouillon', 'en_cours_generation', 'documents_generes', 'documents_signes', 'financement_depose', 'complet', 'archive');
CREATE TYPE public.budget_statut AS ENUM ('en_attente', 'en_cours_etude', 'validee', 'refusee');
CREATE TYPE public.document_type AS ENUM ('signe', 'accord_financement', 'qualiopi_final');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom text NOT NULL DEFAULT '',
  nom text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  photo_url text,
  date_naissance date,
  siret text,
  telephone text,
  statut_candidature public.candidature_statut NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_validated_formateur(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND statut_candidature = 'valide')
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.profiles_protect_statut()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.statut_candidature := OLD.statut_candidature;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER profiles_protect_statut_trg BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_protect_statut();

CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_roles_select_admin" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- new user -> profile + role formateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_statut public.candidature_statut := 'en_attente';
BEGIN
  IF EXISTS (SELECT 1 FROM public.candidatures c WHERE lower(c.email) = lower(NEW.email) AND c.statut = 'valide') THEN
    v_statut := 'valide';
  END IF;
  INSERT INTO public.profiles (id, email, prenom, nom, statut_candidature)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''), v_statut)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'formateur')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PARCOURS
CREATE TABLE public.parcours_formation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  ordre integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parcours_formation TO authenticated;
GRANT ALL ON public.parcours_formation TO service_role;
ALTER TABLE public.parcours_formation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parcours_own" ON public.parcours_formation FOR ALL TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());
CREATE POLICY "parcours_admin" ON public.parcours_formation FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- public catalogue view (security definer view, anon readable)
CREATE VIEW public.catalogue_public AS
  SELECT pf.id, pf.titre, pf.description, pf.ordre, p.prenom, p.nom, p.photo_url
  FROM public.parcours_formation pf
  JOIN public.profiles p ON p.id = pf.formateur_id
  WHERE p.statut_candidature = 'valide';
GRANT SELECT ON public.catalogue_public TO anon, authenticated;

-- DOSSIERS
CREATE TABLE public.dossiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entreprise_nom text,
  statut public.dossier_statut NOT NULL DEFAULT 'brouillon',
  drive_folder_url text,
  documents_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.dossiers TO authenticated;
GRANT ALL ON public.dossiers TO service_role;
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dossiers_own_select" ON public.dossiers FOR SELECT TO authenticated USING (formateur_id = auth.uid());
CREATE POLICY "dossiers_own_insert" ON public.dossiers FOR INSERT TO authenticated
  WITH CHECK (formateur_id = auth.uid() AND public.is_validated_formateur(auth.uid()));
CREATE POLICY "dossiers_own_update" ON public.dossiers FOR UPDATE TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());
CREATE POLICY "dossiers_admin_select" ON public.dossiers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "dossiers_admin_update" ON public.dossiers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
CREATE TRIGGER dossiers_updated_at BEFORE UPDATE ON public.dossiers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DOCUMENTS
CREATE TABLE public.documents_dossier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.document_type NOT NULL,
  fichier_url text NOT NULL,
  nom_fichier text,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.documents_dossier TO authenticated;
GRANT ALL ON public.documents_dossier TO service_role;
ALTER TABLE public.documents_dossier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docs_own" ON public.documents_dossier FOR ALL TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());
CREATE POLICY "docs_admin_select" ON public.documents_dossier FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- DEMANDES BUDGET
CREATE TABLE public.demandes_budget (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entreprise_prospect text NOT NULL,
  contact text,
  besoin text,
  nb_participants integer,
  budget_estime text,
  commentaire text,
  statut public.budget_statut NOT NULL DEFAULT 'en_attente',
  commentaire_admin text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.demandes_budget TO authenticated;
GRANT UPDATE ON public.demandes_budget TO authenticated;
GRANT ALL ON public.demandes_budget TO service_role;
ALTER TABLE public.demandes_budget ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budget_own_select" ON public.demandes_budget FOR SELECT TO authenticated USING (formateur_id = auth.uid());
CREATE POLICY "budget_own_insert" ON public.demandes_budget FOR INSERT TO authenticated
  WITH CHECK (formateur_id = auth.uid() AND public.is_validated_formateur(auth.uid()));
CREATE POLICY "budget_admin_select" ON public.demandes_budget FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "budget_admin_update" ON public.demandes_budget FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- CANDIDATURES
CREATE TABLE public.candidatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL,
  telephone text,
  expertise text,
  message text,
  statut public.candidature_statut NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.candidatures TO anon, authenticated;
GRANT SELECT, UPDATE ON public.candidatures TO authenticated;
GRANT ALL ON public.candidatures TO service_role;
ALTER TABLE public.candidatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candidatures_insert_public" ON public.candidatures FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "candidatures_admin_select" ON public.candidatures FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "candidatures_admin_update" ON public.candidatures FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre text NOT NULL,
  message text,
  lien text,
  lu boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifs_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifs_own_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());