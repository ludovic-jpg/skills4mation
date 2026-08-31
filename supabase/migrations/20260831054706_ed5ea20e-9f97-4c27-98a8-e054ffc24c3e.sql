-- 1. Rôle apprenant
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'apprenant';

-- 2. Dossier Drive
ALTER TABLE public.dossiers ADD COLUMN IF NOT EXISTS drive_folder_id text;

-- 3. Apprenants de dossier
CREATE TABLE IF NOT EXISTS public.dossier_apprenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  prenom text NOT NULL DEFAULT '',
  nom text NOT NULL DEFAULT '',
  email text NOT NULL,
  telephone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dossier_id, email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dossier_apprenants TO authenticated;
GRANT ALL ON public.dossier_apprenants TO service_role;
ALTER TABLE public.dossier_apprenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apprenants_formateur_all" ON public.dossier_apprenants
  FOR ALL TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());

CREATE POLICY "apprenants_admin_select" ON public.dossier_apprenants
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "apprenants_admin_update" ON public.dossier_apprenants
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "apprenants_own_select" ON public.dossier_apprenants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE TRIGGER dossier_apprenants_updated_at BEFORE UPDATE ON public.dossier_apprenants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Documents à signer / envois
CREATE TABLE IF NOT EXISTS public.document_envois (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  apprenant_id uuid REFERENCES public.dossier_apprenants(id) ON DELETE SET NULL,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  label text NOT NULL DEFAULT '',
  contenu_html text,
  statut text NOT NULL DEFAULT 'brouillon',
  fichier_url text,
  reponse_url text,
  reponse_nom text,
  drive_file_id text,
  drive_url text,
  nom_archive text,
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT document_envois_statut_check CHECK (statut IN ('brouillon','envoye','recu','archive'))
);

CREATE INDEX IF NOT EXISTS document_envois_dossier_idx ON public.document_envois(dossier_id);
CREATE INDEX IF NOT EXISTS document_envois_apprenant_idx ON public.document_envois(apprenant_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_envois TO authenticated;
GRANT ALL ON public.document_envois TO service_role;
ALTER TABLE public.document_envois ENABLE ROW LEVEL SECURITY;

CREATE POLICY "envois_formateur_all" ON public.document_envois
  FOR ALL TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());

CREATE POLICY "envois_admin_select" ON public.document_envois
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "envois_admin_update" ON public.document_envois
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "envois_apprenant_select" ON public.document_envois
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dossier_apprenants a
    WHERE a.id = document_envois.apprenant_id
      AND (a.user_id = auth.uid() OR lower(a.email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
  ));

CREATE POLICY "envois_apprenant_update" ON public.document_envois
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.dossier_apprenants a
    WHERE a.id = document_envois.apprenant_id
      AND (a.user_id = auth.uid() OR lower(a.email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.dossier_apprenants a
    WHERE a.id = document_envois.apprenant_id
      AND (a.user_id = auth.uid() OR lower(a.email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
  ));

CREATE TRIGGER document_envois_updated_at BEFORE UPDATE ON public.document_envois
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Dépôt des documents signés par les apprenants (bucket privé "documents")
CREATE POLICY "apprenant_upload_documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'apprenants' AND (storage.foldername(name))[2] = auth.uid()::text);

CREATE POLICY "apprenant_read_documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'apprenants' AND (storage.foldername(name))[2] = auth.uid()::text);