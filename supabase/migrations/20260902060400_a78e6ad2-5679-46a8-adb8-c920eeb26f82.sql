CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marque text NOT NULL CHECK (marque IN ('ICDL','Lilliate')),
  thematique text NOT NULL,
  code_rs text,
  prix_formateur_ttc numeric NOT NULL DEFAULT 150,
  eligible_cpf boolean NOT NULL DEFAULT false,
  actif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certifications_cpf_requires_rs CHECK (NOT eligible_cpf OR code_rs IS NOT NULL)
);

CREATE UNIQUE INDEX certifications_code_rs_key ON public.certifications (code_rs) WHERE code_rs IS NOT NULL;
CREATE UNIQUE INDEX certifications_marque_thematique_key ON public.certifications (marque, thematique);

GRANT SELECT ON public.certifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;

ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "certifications_select_public" ON public.certifications
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "certifications_admin_insert" ON public.certifications
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "certifications_admin_update" ON public.certifications
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "certifications_admin_delete" ON public.certifications
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

INSERT INTO public.certifications (marque, thematique, code_rs, prix_formateur_ttc, eligible_cpf) VALUES
  ('Lilliate','Anglais','RS7314',150,true),
  ('Lilliate','Espagnol','RS7316',150,true),
  ('Lilliate','Italien','RS7315',150,true),
  ('Lilliate','Allemand','RS7236',150,true),
  ('Lilliate','Japonais','RS7320',150,true),
  ('Lilliate','Français FLE','RS6916',150,true),
  ('Lilliate','Chinois','RS7318',150,true),
  ('Lilliate','Portugais','RS7317',150,true),
  ('Lilliate','LSF','RS6796',150,true),
  ('ICDL','Traitement de texte',NULL,150,false),
  ('ICDL','Tableur',NULL,150,false),
  ('ICDL','Présentation (PRÉAO)',NULL,150,false),
  ('ICDL','Outils collaboratifs',NULL,150,false),
  ('ICDL','Édition d''image',NULL,150,false),
  ('ICDL','Édition de site web',NULL,150,false),
  ('ICDL','PAO',NULL,150,false),
  ('ICDL','CAO',NULL,150,false);