CREATE TABLE public.tarifs_cpf (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie text NOT NULL DEFAULT 'Bureautique',
  intitule text NOT NULL,
  duree_heures integer NOT NULL,
  prix_euros numeric NOT NULL,
  url_moncompteformation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (intitule, duree_heures)
);

GRANT SELECT ON public.tarifs_cpf TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarifs_cpf TO authenticated;
GRANT ALL ON public.tarifs_cpf TO service_role;

ALTER TABLE public.tarifs_cpf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarifs_cpf_read_all" ON public.tarifs_cpf FOR SELECT USING (true);
CREATE POLICY "tarifs_cpf_admin_insert" ON public.tarifs_cpf FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "tarifs_cpf_admin_update" ON public.tarifs_cpf FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "tarifs_cpf_admin_delete" ON public.tarifs_cpf FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin') OR private.has_role(auth.uid(), 'admin'));

CREATE TRIGGER tarifs_cpf_updated_at BEFORE UPDATE ON public.tarifs_cpf
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();