CREATE TABLE public.supports_pedagogiques (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id),
  titre text NOT NULL,
  type text NOT NULL DEFAULT 'pdf' CHECK (type IN ('pdf','autre')),
  fichier_url text NOT NULL,
  visible_apprenants boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supports_pedagogiques TO authenticated;
GRANT ALL ON public.supports_pedagogiques TO service_role;

ALTER TABLE public.supports_pedagogiques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Formateur gere ses supports"
ON public.supports_pedagogiques FOR ALL TO authenticated
USING (formateur_id = auth.uid())
WITH CHECK (formateur_id = auth.uid());

CREATE POLICY "Apprenants lisent les supports visibles"
ON public.supports_pedagogiques FOR SELECT TO authenticated
USING (
  visible_apprenants
  AND EXISTS (
    SELECT 1 FROM public.dossier_apprenants a
    WHERE a.dossier_id = supports_pedagogiques.dossier_id
      AND a.user_id = auth.uid()
  )
);

CREATE INDEX supports_pedagogiques_dossier_idx ON public.supports_pedagogiques(dossier_id);