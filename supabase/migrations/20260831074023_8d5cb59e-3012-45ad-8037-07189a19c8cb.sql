CREATE TYPE public.filleul_type AS ENUM ('formateur','client');
CREATE TYPE public.parrainage_statut AS ENUM ('invite','inscrit','actif');

CREATE TABLE public.ambassadeurs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parrain_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filleul_email text NOT NULL,
  filleul_nom text,
  filleul_type public.filleul_type NOT NULL DEFAULT 'formateur',
  statut public.parrainage_statut NOT NULL DEFAULT 'invite',
  commentaire text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parrain_id, filleul_email)
);

GRANT SELECT, INSERT, UPDATE ON public.ambassadeurs TO authenticated;
GRANT ALL ON public.ambassadeurs TO service_role;

ALTER TABLE public.ambassadeurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ambassadeurs_select_own" ON public.ambassadeurs
  FOR SELECT TO authenticated USING (parrain_id = auth.uid());
CREATE POLICY "ambassadeurs_insert_own" ON public.ambassadeurs
  FOR INSERT TO authenticated WITH CHECK (parrain_id = auth.uid());
CREATE POLICY "ambassadeurs_update_own" ON public.ambassadeurs
  FOR UPDATE TO authenticated USING (parrain_id = auth.uid()) WITH CHECK (parrain_id = auth.uid());
CREATE POLICY "ambassadeurs_select_admin" ON public.ambassadeurs
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "ambassadeurs_update_admin" ON public.ambassadeurs
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER ambassadeurs_set_updated_at BEFORE UPDATE ON public.ambassadeurs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();