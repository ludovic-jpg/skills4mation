-- Vague 4 (Conformité Qualiopi/BPF) : accusé de lecture des exigences qualité,
-- volet manquant du dossier de qualification du formateur (indicateur Qualiopi
-- 27, dont le décret du 1er novembre 2026 élargit la portée aux dispositifs de
-- portage — c'est précisément le cœur du modèle Skills4mation). Le CV, le
-- parcours de formation et le déroulé pédagogique sont déjà collectés ; il
-- manquait la preuve datée que le formateur a lu et accepté le code
-- déontologique / les exigences qualité avant de porter sa première formation.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exigences_qualite_lu_le timestamptz;

COMMENT ON COLUMN public.profiles.exigences_qualite_lu_le IS
  'Date d''acquittement du code déontologique / des exigences qualité par le formateur — bloque la soumission de candidature tant qu''absent (indicateur Qualiopi 27).';
