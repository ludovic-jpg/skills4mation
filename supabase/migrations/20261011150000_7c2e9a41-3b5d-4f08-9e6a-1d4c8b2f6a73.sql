-- Rattache aux formations les outils pédagogiques créés sur un « parcours miroir ».
-- parcours_formation.formation_catalogue_id relie chaque miroir à sa formation :
-- on reporte ce lien dans formation_id. Données uniquement, idempotent
-- (ne touche que les lignes encore sans formation_id) ; parcours_id est conservé.
UPDATE public.outils_positionnement o
SET formation_id = p.formation_catalogue_id
FROM public.parcours_formation p
WHERE o.parcours_id = p.id
  AND o.formation_id IS NULL
  AND p.formation_catalogue_id IS NOT NULL;

UPDATE public.outils_evaluation_acquis o
SET formation_id = p.formation_catalogue_id
FROM public.parcours_formation p
WHERE o.parcours_id = p.id
  AND o.formation_id IS NULL
  AND p.formation_catalogue_id IS NOT NULL;
