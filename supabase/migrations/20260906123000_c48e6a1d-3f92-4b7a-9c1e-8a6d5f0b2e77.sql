-- Vague 4 (Conformité Qualiopi/BPF) : registre de veille réglementaire, métier et
-- handicap. Le code déontologique affirme déjà cette veille (« Veille légale,
-- réglementaire, métier et handicap diffusée aux intervenants »), mais rien ne
-- l'enregistre ni ne prouve sa diffusion effective — écart facile à relever en
-- audit (indicateur Qualiopi 23), d'autant plus sensible avec le référentiel à
-- 33 indicateurs applicable au 1er novembre 2026.

CREATE TABLE IF NOT EXISTS public.veille_reglementaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_veille date NOT NULL DEFAULT current_date,
  theme text NOT NULL,
  source text,
  resume text NOT NULL,
  diffuse boolean NOT NULL DEFAULT false,
  diffuse_le timestamptz,
  cree_par uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS veille_reglementaire_date_idx
  ON public.veille_reglementaire (date_veille DESC);

ALTER TABLE public.veille_reglementaire ENABLE ROW LEVEL SECURITY;

-- Tout formateur voit les entrées diffusées (c'est la preuve de diffusion
-- effective aux intervenants) ; l'équipe conseiller formation gère tout,
-- brouillons non diffusés compris.
CREATE POLICY veille_reglementaire_lecture_diffusee ON public.veille_reglementaire
  FOR SELECT TO authenticated USING (diffuse = true);

CREATE POLICY veille_reglementaire_conseiller ON public.veille_reglementaire
  FOR ALL TO authenticated
  USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

COMMENT ON TABLE public.veille_reglementaire IS
  'Registre de veille légale/réglementaire/métier/handicap et preuve de sa diffusion aux formateurs — indicateur Qualiopi 23.';
