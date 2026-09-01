CREATE TABLE public.entreprises_clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom text NOT NULL,
  nom_commercial text,
  adresse text,
  siret text,
  prenom_contact text,
  nom_contact text,
  telephone text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX entreprises_clientes_siret_key ON public.entreprises_clientes (siret) WHERE siret IS NOT NULL AND siret <> '';
CREATE INDEX entreprises_clientes_nom_idx ON public.entreprises_clientes (lower(nom));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.entreprises_clientes TO authenticated;
GRANT ALL ON public.entreprises_clientes TO service_role;

ALTER TABLE public.entreprises_clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entreprises_clientes_select_authenticated"
  ON public.entreprises_clientes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "entreprises_clientes_insert_own"
  ON public.entreprises_clientes FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "entreprises_clientes_update_own_or_admin"
  ON public.entreprises_clientes FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR private.is_conseillere_ou_plus(auth.uid()))
  WITH CHECK (created_by = auth.uid() OR private.is_conseillere_ou_plus(auth.uid()));

CREATE POLICY "entreprises_clientes_delete_own_or_admin"
  ON public.entreprises_clientes FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR private.is_conseillere_ou_plus(auth.uid()));

CREATE TRIGGER entreprises_clientes_updated_at
  BEFORE UPDATE ON public.entreprises_clientes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();