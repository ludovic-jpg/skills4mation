-- Questionnaire de candidature formateur (/candidature) : réponses structurées
-- (domaines, spécialité, expérience, publics, modalités, zone, structure, version).
-- Migration additive : aucune policy ni trigger modifié.
ALTER TABLE public.candidatures ADD COLUMN IF NOT EXISTS questionnaire jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS questionnaire jsonb;

COMMENT ON COLUMN public.candidatures.questionnaire IS
  'Réponses structurées du questionnaire de candidature (voir src/lib/candidature-questionnaire.ts).';
COMMENT ON COLUMN public.profiles.questionnaire IS
  'Profil formateur issu du questionnaire de candidature, modifiable par le formateur.';
