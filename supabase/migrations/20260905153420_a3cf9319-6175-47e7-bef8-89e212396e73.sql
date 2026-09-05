ALTER TABLE public.supports_pedagogiques ALTER COLUMN dossier_id DROP NOT NULL;

ALTER TABLE public.supports_pedagogiques
  ADD COLUMN IF NOT EXISTS formation_id uuid REFERENCES public.formations_catalogue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS supports_pedagogiques_formation_idx
  ON public.supports_pedagogiques(formation_id);
CREATE INDEX IF NOT EXISTS supports_pedagogiques_formateur_idx
  ON public.supports_pedagogiques(formateur_id);

CREATE TABLE public.supports_apprenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  support_id uuid NOT NULL REFERENCES public.supports_pedagogiques(id) ON DELETE CASCADE,
  apprenant_id uuid NOT NULL REFERENCES public.dossier_apprenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (support_id, apprenant_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supports_apprenants TO authenticated;
GRANT ALL ON public.supports_apprenants TO service_role;

ALTER TABLE public.supports_apprenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Formateur gere les partages de ses supports"
ON public.supports_apprenants FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.supports_pedagogiques s
    WHERE s.id = supports_apprenants.support_id AND s.formateur_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.supports_pedagogiques s
    WHERE s.id = supports_apprenants.support_id AND s.formateur_id = auth.uid()
  )
);

CREATE POLICY "Apprenant lit ses partages"
ON public.supports_apprenants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.dossier_apprenants a
    WHERE a.id = supports_apprenants.apprenant_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Equipe lit les partages"
ON public.supports_apprenants FOR SELECT TO authenticated
USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS "Apprenants lisent les supports visibles" ON public.supports_pedagogiques;

CREATE POLICY "Apprenants lisent les supports visibles"
ON public.supports_pedagogiques FOR SELECT TO authenticated
USING (
  visible_apprenants
  AND (
    (
      supports_pedagogiques.dossier_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.dossier_apprenants a
        WHERE a.dossier_id = supports_pedagogiques.dossier_id
          AND a.user_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.supports_apprenants sa
      JOIN public.dossier_apprenants a ON a.id = sa.apprenant_id
      WHERE sa.support_id = supports_pedagogiques.id
        AND a.user_id = auth.uid()
    )
    OR (
      supports_pedagogiques.formation_id IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.dossier_apprenants a
        JOIN public.dossiers d ON d.id = a.dossier_id
        JOIN public.formations_catalogue f ON f.id = supports_pedagogiques.formation_id
        WHERE a.user_id = auth.uid()
          AND d.titre_formation = f.titre
      )
    )
  )
);

CREATE POLICY "Equipe lit les supports"
ON public.supports_pedagogiques FOR SELECT TO authenticated
USING (private.is_conseillere_ou_plus(auth.uid()));