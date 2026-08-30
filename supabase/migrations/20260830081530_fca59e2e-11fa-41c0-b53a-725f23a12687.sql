-- Données consolidées du dossier formation (variables des matrices)
ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS donnees jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Statut par pièce du dossier
DO $$ BEGIN
  CREATE TYPE public.piece_statut AS ENUM ('a_generer','en_attente_tally','rapport_a_classer','complete');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.dossier_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  statut public.piece_statut NOT NULL DEFAULT 'a_generer',
  remarque text,
  fichier_url text,
  generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dossier_id, code)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dossier_pieces TO authenticated;
GRANT ALL ON public.dossier_pieces TO service_role;

ALTER TABLE public.dossier_pieces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pieces_own ON public.dossier_pieces;
CREATE POLICY pieces_own ON public.dossier_pieces FOR ALL TO authenticated
  USING (formateur_id = auth.uid()) WITH CHECK (formateur_id = auth.uid());

DROP POLICY IF EXISTS pieces_admin_select ON public.dossier_pieces;
CREATE POLICY pieces_admin_select ON public.dossier_pieces FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS pieces_admin_update ON public.dossier_pieces;
CREATE POLICY pieces_admin_update ON public.dossier_pieces FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS dossier_pieces_updated_at ON public.dossier_pieces;
CREATE TRIGGER dossier_pieces_updated_at BEFORE UPDATE ON public.dossier_pieces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();