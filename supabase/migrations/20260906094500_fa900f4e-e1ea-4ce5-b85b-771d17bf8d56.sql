-- Vague 1 (Fiabiliser les documents) : rendre visible le repli PDF dégradé.
-- Jusqu'ici, quand la conversion Google Drive échouait deux fois, le document de
-- secours (texte brut, sans mise en forme) était généré silencieusement — seule
-- trace : un console.error("[pdf] ALERTE ADMIN ...") côté serveur, invisible du
-- formateur comme de l'équipe. Ces deux colonnes portent le même indicateur (a-t-on
-- dû utiliser le repli natif ?) là où il compte le plus pour l'utilisateur final :
-- chaque pièce du socle générée automatiquement, et la convention signée par
-- l'organisme (le document le plus sensible juridiquement).

ALTER TABLE public.dossier_pieces
  ADD COLUMN IF NOT EXISTS rendu_degrade boolean NOT NULL DEFAULT false;

ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS signature_organisme_rendu_degrade boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.dossier_pieces.rendu_degrade IS
  'true si la pièce a été générée via le repli PDF natif (Google Drive indisponible) : mise en forme dégradée, à régénérer.';
COMMENT ON COLUMN public.dossiers.signature_organisme_rendu_degrade IS
  'true si la convention signée et/ou son certificat ont été générés via le repli PDF natif (Google Drive indisponible) au moment de la signature organisme.';
