ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS recueil_besoins_questions_perso jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS lien_tally_f5 text;

CREATE TABLE public.outils_positionnement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parcours_id uuid REFERENCES public.parcours_formation(id) ON DELETE SET NULL,
  titre text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outils_positionnement TO authenticated;
GRANT ALL ON public.outils_positionnement TO service_role;
ALTER TABLE public.outils_positionnement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outils_positionnement_own" ON public.outils_positionnement
  FOR ALL TO authenticated USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());
CREATE POLICY "outils_positionnement_admin" ON public.outils_positionnement
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

CREATE TABLE public.outils_evaluation_acquis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parcours_id uuid REFERENCES public.parcours_formation(id) ON DELETE SET NULL,
  titre text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outils_evaluation_acquis TO authenticated;
GRANT ALL ON public.outils_evaluation_acquis TO service_role;
ALTER TABLE public.outils_evaluation_acquis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outils_acquis_own" ON public.outils_evaluation_acquis
  FOR ALL TO authenticated USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());
CREATE POLICY "outils_acquis_admin" ON public.outils_evaluation_acquis
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

CREATE TABLE public.formation_avis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL REFERENCES public.formations_catalogue(id) ON DELETE CASCADE,
  apprenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note integer NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire text,
  statut text NOT NULL DEFAULT 'publie' CHECK (statut IN ('publie', 'masque')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (formation_id, apprenant_id)
);
GRANT SELECT ON public.formation_avis TO anon;
GRANT SELECT, INSERT, UPDATE ON public.formation_avis TO authenticated;
GRANT ALL ON public.formation_avis TO service_role;
ALTER TABLE public.formation_avis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "formation_avis_public" ON public.formation_avis
  FOR SELECT TO anon, authenticated USING (statut = 'publie');
CREATE POLICY "formation_avis_own_select" ON public.formation_avis
  FOR SELECT TO authenticated USING (apprenant_id = auth.uid());
CREATE POLICY "formation_avis_own_insert" ON public.formation_avis
  FOR INSERT TO authenticated WITH CHECK (apprenant_id = auth.uid());
CREATE POLICY "formation_avis_own_update" ON public.formation_avis
  FOR UPDATE TO authenticated USING (apprenant_id = auth.uid()) WITH CHECK (apprenant_id = auth.uid());
CREATE POLICY "formation_avis_formateur_select" ON public.formation_avis
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.formations_catalogue f WHERE f.id = formation_id AND f.formateur_id = auth.uid())
  );
CREATE POLICY "formation_avis_formateur_moderation" ON public.formation_avis
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.formations_catalogue f WHERE f.id = formation_id AND f.formateur_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.formations_catalogue f WHERE f.id = formation_id AND f.formateur_id = auth.uid())
  );