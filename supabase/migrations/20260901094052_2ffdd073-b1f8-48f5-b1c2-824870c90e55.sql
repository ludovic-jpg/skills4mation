CREATE TABLE public.demandes_financement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text,
  montant numeric,
  cout_certification numeric,
  destinataire_email text,
  lien_moncompteformation text,
  statut text NOT NULL DEFAULT 'envoyee',
  message text,
  envoye_le timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX demandes_financement_dossier_mode_key
  ON public.demandes_financement (dossier_id, coalesce(mode, ''));
CREATE INDEX demandes_financement_formateur_idx
  ON public.demandes_financement (formateur_id, envoye_le DESC);

GRANT SELECT, INSERT, UPDATE ON public.demandes_financement TO authenticated;
GRANT ALL ON public.demandes_financement TO service_role;

ALTER TABLE public.demandes_financement ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demandes_financement_select_own"
  ON public.demandes_financement FOR SELECT TO authenticated
  USING (formateur_id = auth.uid() OR private.is_conseillere_ou_plus(auth.uid()));

CREATE POLICY "demandes_financement_insert_equipe"
  ON public.demandes_financement FOR INSERT TO authenticated
  WITH CHECK (private.is_conseillere_ou_plus(auth.uid()));

CREATE POLICY "demandes_financement_update_equipe"
  ON public.demandes_financement FOR UPDATE TO authenticated
  USING (private.is_conseillere_ou_plus(auth.uid()))
  WITH CHECK (private.is_conseillere_ou_plus(auth.uid()));

CREATE TRIGGER demandes_financement_updated_at
  BEFORE UPDATE ON public.demandes_financement
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();