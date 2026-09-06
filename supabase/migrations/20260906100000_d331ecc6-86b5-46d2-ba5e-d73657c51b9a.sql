-- Vague 2 (Fiabiliser les données) : table du réalisé, priorité la plus urgente de
-- l'analyse du 6 septembre 2026. Jusqu'ici l'application n'enregistre que le PRÉVU
-- (heures totales, apprenants inscrits, montant théorique dans dossiers.donnees) et
-- jamais ce qui a été RÉALISÉ : heures effectivement dispensées, stagiaires réellement
-- présents, montant réellement encaissé, reversement au formateur. Sans cette table,
-- le Bilan Pédagogique et Financier (BPF, Cerfa annuel dû entre le 1er avril et le
-- 31 mai) ne peut pas être rempli sans reconstitution manuelle, et l'indicateur
-- Qualiopi 11 (atteinte des objectifs) n'est pas mesuré.
--
-- Une ligne par dossier, alimentée par un formulaire de clôture pédagogique rempli
-- par le formateur ou le conseiller à la fin de la formation.

CREATE TABLE IF NOT EXISTS public.dossier_financement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id uuid NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  formateur_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Les quatre champs du formulaire de clôture pédagogique (cœur du BPF).
  heures_realisees numeric,
  stagiaires_presents integer,
  objectif_bpf text,
  type_stagiaires text,

  -- Réalisé financier : ce qui a été réellement accordé, encaissé et reversé.
  montant_encaisse numeric,
  date_reversement_formateur date,
  montant_reversement_formateur numeric,

  cloture_le timestamptz,
  cloture_par uuid REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (dossier_id)
);

CREATE INDEX IF NOT EXISTS dossier_financement_formateur_idx
  ON public.dossier_financement (formateur_id);

ALTER TABLE public.dossier_financement ENABLE ROW LEVEL SECURITY;

-- Le formateur voit et complète le réalisé de ses propres dossiers.
CREATE POLICY dossier_financement_own ON public.dossier_financement
  FOR ALL TO authenticated
  USING (formateur_id = auth.uid())
  WITH CHECK (formateur_id = auth.uid());

-- Le conseiller (équipe Skills4mation) voit et corrige le réalisé de tous les dossiers.
CREATE POLICY dossier_financement_conseiller ON public.dossier_financement
  FOR ALL TO authenticated
  USING (private.is_conseiller_formation(auth.uid()))
  WITH CHECK (private.is_conseiller_formation(auth.uid()));

DROP TRIGGER IF EXISTS dossier_financement_updated_at ON public.dossier_financement;
CREATE TRIGGER dossier_financement_updated_at BEFORE UPDATE ON public.dossier_financement
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.dossier_financement IS
  'Réalisé pédagogique et financier par dossier (heures dispensées, présence, montants encaissés/reversés) — source du BPF et de l''indicateur Qualiopi 11, alimentée par le formulaire de clôture pédagogique.';
