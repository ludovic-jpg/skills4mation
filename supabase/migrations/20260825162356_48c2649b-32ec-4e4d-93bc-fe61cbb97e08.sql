
ALTER TYPE public.candidature_statut ADD VALUE IF NOT EXISTS 'en_cours';

DO $$ BEGIN
  CREATE TYPE public.crm_statut AS ENUM (
    'brouillon','demande_validation','dossier_valide','demande_financement',
    'accord_financement','finalisation_administrative','paiement','paiement_formateur','refuse'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS adresse text,
  ADD COLUMN IF NOT EXISTS numero_nda text,
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS parcours_formation text,
  ADD COLUMN IF NOT EXISTS deroule_pedagogique_url text;

ALTER TABLE public.candidatures
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS date_naissance date,
  ADD COLUMN IF NOT EXISTS cv_url text,
  ADD COLUMN IF NOT EXISTS parcours_formation text,
  ADD COLUMN IF NOT EXISTS deroule_pedagogique_url text,
  ADD COLUMN IF NOT EXISTS siret text,
  ADD COLUMN IF NOT EXISTS adresse text,
  ADD COLUMN IF NOT EXISTS numero_nda text,
  ADD COLUMN IF NOT EXISTS commentaire_admin text,
  ADD COLUMN IF NOT EXISTS traitee_at timestamptz;

DROP POLICY IF EXISTS candidatures_own_select ON public.candidatures;
CREATE POLICY candidatures_own_select ON public.candidatures
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS statut_crm public.crm_statut NOT NULL DEFAULT 'brouillon',
  ADD COLUMN IF NOT EXISTS dossier_nom text,
  ADD COLUMN IF NOT EXISTS entreprise_siret text,
  ADD COLUMN IF NOT EXISTS titre_formation text,
  ADD COLUMN IF NOT EXISTS date_debut date,
  ADD COLUMN IF NOT EXISTS date_fin date,
  ADD COLUMN IF NOT EXISTS tally_submission_id text,
  ADD COLUMN IF NOT EXISTS commentaire_admin text;

CREATE TABLE IF NOT EXISTS public.dossier_historique (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  ancien_statut public.crm_statut,
  nouveau_statut public.crm_statut NOT NULL,
  auteur_id uuid,
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.dossier_historique TO authenticated;
GRANT ALL ON public.dossier_historique TO service_role;
ALTER TABLE public.dossier_historique ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hist_own_select ON public.dossier_historique;
CREATE POLICY hist_own_select ON public.dossier_historique
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.dossiers d WHERE d.id = dossier_id AND d.formateur_id = auth.uid())
  );

DROP POLICY IF EXISTS hist_admin_select ON public.dossier_historique;
CREATE POLICY hist_admin_select ON public.dossier_historique
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS hist_insert ON public.dossier_historique;
CREATE POLICY hist_insert ON public.dossier_historique
  FOR INSERT TO authenticated WITH CHECK (
    auteur_id = auth.uid() AND (
      private.has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.dossiers d WHERE d.id = dossier_id AND d.formateur_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS dossier_historique_dossier_idx ON public.dossier_historique(dossier_id);

DROP POLICY IF EXISTS candidatures_own_folder_all ON storage.objects;
CREATE POLICY candidatures_own_folder_all ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'candidatures' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'candidatures' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS candidatures_admin_read ON storage.objects;
CREATE POLICY candidatures_admin_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'candidatures' AND private.has_role(auth.uid(), 'admin'::app_role));
