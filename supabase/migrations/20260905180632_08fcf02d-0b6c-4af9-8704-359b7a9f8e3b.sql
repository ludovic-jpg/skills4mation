ALTER TABLE public.parcours_formation
  ADD COLUMN IF NOT EXISTS formation_catalogue_id uuid REFERENCES public.formations_catalogue(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS parcours_formation_formation_catalogue_id_key
  ON public.parcours_formation (formation_catalogue_id)
  WHERE formation_catalogue_id IS NOT NULL;

INSERT INTO public.parcours_formation (
  formateur_id, formation_catalogue_id, titre, objectifs, prerequis, duree_heures, modules, ordre
)
SELECT
  f.formateur_id,
  f.id,
  f.titre,
  COALESCE(NULLIF(array_to_string(f.objectifs, E'\n'), ''), f.objectif),
  f.prerequis,
  CASE WHEN f.duree_heures IS NULL THEN NULL ELSE round(f.duree_heures)::int END,
  COALESCE(f.programme, '[]'::jsonb),
  0
FROM public.formations_catalogue f
WHERE f.formateur_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.parcours_formation p WHERE p.formation_catalogue_id = f.id
  );