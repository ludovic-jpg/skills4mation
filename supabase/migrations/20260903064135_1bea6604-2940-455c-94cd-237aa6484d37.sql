CREATE TYPE public.reclamation_type AS ENUM ('reclamation','difficulte','alea','appreciation');
CREATE TYPE public.reclamation_statut AS ENUM ('nouvelle','en_cours','traitee');

CREATE TABLE public.reclamations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  nom text NOT NULL,
  email text NOT NULL,
  formation_concernee text,
  type public.reclamation_type NOT NULL DEFAULT 'reclamation',
  message text NOT NULL,
  statut public.reclamation_statut NOT NULL DEFAULT 'nouvelle',
  reponse text,
  repondu_le timestamptz,
  repondu_par text
);

GRANT INSERT ON public.reclamations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reclamations TO authenticated;
GRANT ALL ON public.reclamations TO service_role;

ALTER TABLE public.reclamations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tout le monde peut deposer une reclamation"
  ON public.reclamations FOR INSERT TO anon, authenticated
  WITH CHECK (statut = 'nouvelle' AND reponse IS NULL AND repondu_le IS NULL AND repondu_par IS NULL);

CREATE POLICY "Les admins consultent les reclamations"
  ON public.reclamations FOR SELECT TO authenticated
  USING (private.is_conseillere_ou_plus(auth.uid()));

CREATE POLICY "Les admins traitent les reclamations"
  ON public.reclamations FOR UPDATE TO authenticated
  USING (private.is_conseillere_ou_plus(auth.uid()))
  WITH CHECK (private.is_conseillere_ou_plus(auth.uid()));