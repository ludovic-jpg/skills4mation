-- Vague 4 (Conformité Qualiopi/BPF) : référent handicap nommé + registre des
-- aménagements (indicateur Qualiopi 26). L'application affirmait déjà l'existence
-- d'un « référent handicap de Skills4mation » dans ses documents sans qu'aucune
-- personne ne soit nommée ni qu'aucun registre ne trace les demandes reçues —
-- écart facile à relever en audit. Deux briques additives :
--   1. parametres_organisme : petite table clé/valeur pour nommer le référent
--      (et, plus tard, d'autres réglages organisme sans nouvelle migration).
--   2. demandes_amenagement_handicap : une ligne par demande d'aménagement
--      reçue via le recueil des besoins (F0A), avec statut de traitement —
--      la notification à l'équipe (déjà en place) ne suffit pas à prouver
--      qu'une demande a été suivie d'effet.

CREATE TABLE IF NOT EXISTS public.parametres_organisme (
  cle text PRIMARY KEY,
  valeur text,
  mis_a_jour_le timestamptz NOT NULL DEFAULT now(),
  mis_a_jour_par uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.parametres_organisme ENABLE ROW LEVEL SECURITY;

-- Lecture ouverte (le nom du référent handicap doit pouvoir être affiché aux
-- formateurs et, à terme, aux apprenants) ; écriture réservée à l'équipe.
CREATE POLICY parametres_organisme_lecture ON public.parametres_organisme
  FOR SELECT TO authenticated USING (true);

CREATE POLICY parametres_organisme_ecriture ON public.parametres_organisme
  FOR ALL TO authenticated
  USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

COMMENT ON TABLE public.parametres_organisme IS
  'Réglages organisme simples en clé/valeur (ex. référent handicap nommé) — évite une migration par nouveau réglage.';

CREATE TABLE IF NOT EXISTS public.demandes_amenagement_handicap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  envoi_id uuid REFERENCES public.document_envois(id) ON DELETE SET NULL,
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  apprenant_label text NOT NULL,
  demande_le timestamptz NOT NULL DEFAULT now(),
  statut text NOT NULL DEFAULT 'a_traiter' CHECK (statut IN ('a_traiter', 'traite')),
  traite_par uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  traite_le timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demandes_amenagement_handicap_dossier_idx
  ON public.demandes_amenagement_handicap (dossier_id);
CREATE INDEX IF NOT EXISTS demandes_amenagement_handicap_statut_idx
  ON public.demandes_amenagement_handicap (statut) WHERE statut = 'a_traiter';

ALTER TABLE public.demandes_amenagement_handicap ENABLE ROW LEVEL SECURITY;

-- Registre réservé à l'équipe conseiller formation (porte le rôle de référent
-- handicap) : c'est un registre de suivi interne, pas une donnée du formateur.
CREATE POLICY demandes_amenagement_handicap_conseiller ON public.demandes_amenagement_handicap
  FOR ALL TO authenticated
  USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

COMMENT ON TABLE public.demandes_amenagement_handicap IS
  'Registre des demandes d''aménagement handicap reçues via le recueil des besoins (F0A) — preuve de suivi pour l''indicateur Qualiopi 26.';
