-- Vague 0 (Nettoyage) : index manquants sur les colonnes de clé étrangère les plus
-- fréquemment filtrées, notamment tout ce qui sert à retrouver "mes dossiers/pièces/
-- apprenants" pour le formateur ou le conseiller connecté. Les colonnes déjà couvertes
-- par une contrainte UNIQUE (ex. dossier_pieces(dossier_id, code)) ne sont pas dupliquées
-- ici : Postgres peut déjà utiliser l'index unique existant quand la colonne recherchée
-- est la première du couple.

CREATE INDEX IF NOT EXISTS dossiers_formateur_idx
  ON public.dossiers (formateur_id);

CREATE INDEX IF NOT EXISTS dossier_pieces_formateur_idx
  ON public.dossier_pieces (formateur_id);

CREATE INDEX IF NOT EXISTS dossier_apprenants_formateur_idx
  ON public.dossier_apprenants (formateur_id);

CREATE INDEX IF NOT EXISTS candidatures_profile_idx
  ON public.candidatures (profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS demandes_financement_dossier_idx
  ON public.demandes_financement (dossier_id);

CREATE INDEX IF NOT EXISTS notifications_user_idx
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS notifications_user_non_lues_idx
  ON public.notifications (user_id)
  WHERE lu = false;

CREATE INDEX IF NOT EXISTS outils_positionnement_parcours_idx
  ON public.outils_positionnement (parcours_id)
  WHERE parcours_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS outils_evaluation_acquis_parcours_idx
  ON public.outils_evaluation_acquis (parcours_id)
  WHERE parcours_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS supports_apprenants_apprenant_idx
  ON public.supports_apprenants (apprenant_id);
