CREATE TABLE public.formations_catalogue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  titre text NOT NULL,
  categorie text,
  intro text,
  objectif text,
  objectifs text[] NOT NULL DEFAULT '{}',
  prerequis text,
  niveau text,
  public_cible text,
  duree_heures numeric,
  duree_jours numeric,
  format text NOT NULL DEFAULT 'presentiel',
  lieu_defaut text,
  lien_connexion text,
  modalites text[] NOT NULL DEFAULT '{}',
  moyens_pedagogiques text,
  modalites_evaluation text,
  accessibilite text,
  programme jsonb NOT NULL DEFAULT '[]'::jsonb,
  certification text,
  tarif_ht numeric,
  tarif_unite text NOT NULL DEFAULT 'par participant',
  tarif_details text,
  tva numeric NOT NULL DEFAULT 20,
  cout_horaire numeric,
  visuel_url text,
  photo_formateur_url text,
  formateur_nom text,
  formateur_bio text,
  publiee boolean NOT NULL DEFAULT false,
  inscriptions_ouvertes boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.formations_catalogue TO authenticated;
GRANT SELECT ON public.formations_catalogue TO anon;
GRANT ALL ON public.formations_catalogue TO service_role;

ALTER TABLE public.formations_catalogue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formations_own" ON public.formations_catalogue FOR ALL TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());

CREATE POLICY "formations_public_read" ON public.formations_catalogue FOR SELECT TO anon, authenticated
  USING (publiee = true AND private.is_validated_formateur(formateur_id));

CREATE POLICY "formations_admin_read" ON public.formations_catalogue FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER formations_catalogue_updated_at BEFORE UPDATE ON public.formations_catalogue
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX formations_catalogue_formateur_idx ON public.formations_catalogue (formateur_id);
CREATE INDEX formations_catalogue_publiee_idx ON public.formations_catalogue (publiee);

CREATE TABLE public.formations_inscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id uuid NOT NULL REFERENCES public.formations_catalogue(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL,
  telephone text,
  objectif text,
  disponibilites text,
  financement text,
  message text,
  statut budget_statut NOT NULL DEFAULT 'en_attente',
  note_admin text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.formations_inscriptions TO authenticated;
GRANT INSERT ON public.formations_inscriptions TO anon;
GRANT ALL ON public.formations_inscriptions TO service_role;

ALTER TABLE public.formations_inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inscriptions_public_insert" ON public.formations_inscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.formations_catalogue f
      WHERE f.id = formation_id
        AND f.formateur_id = formations_inscriptions.formateur_id
        AND f.publiee = true
        AND f.inscriptions_ouvertes = true
    )
  );

CREATE POLICY "inscriptions_formateur_read" ON public.formations_inscriptions FOR SELECT TO authenticated
  USING (formateur_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "inscriptions_formateur_update" ON public.formations_inscriptions FOR UPDATE TO authenticated
  USING (formateur_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (formateur_id = auth.uid() OR private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER formations_inscriptions_updated_at BEFORE UPDATE ON public.formations_inscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX formations_inscriptions_formation_idx ON public.formations_inscriptions (formation_id);