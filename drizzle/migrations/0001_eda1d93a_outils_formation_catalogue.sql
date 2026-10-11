-- Rattache les outils pédagogiques (tests de positionnement, évaluations des acquis)
-- à une formation du catalogue du formateur, en plus des anciens parcours.
-- Migration additive : colonnes nullables, aucune donnée existante modifiée.
ALTER TABLE public.outils_positionnement
  ADD COLUMN IF NOT EXISTS formation_id uuid REFERENCES public.formations_catalogue(id) ON DELETE SET NULL;

ALTER TABLE public.outils_evaluation_acquis
  ADD COLUMN IF NOT EXISTS formation_id uuid REFERENCES public.formations_catalogue(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS outils_positionnement_formation_idx
  ON public.outils_positionnement (formation_id);
CREATE INDEX IF NOT EXISTS outils_evaluation_acquis_formation_idx
  ON public.outils_evaluation_acquis (formation_id);