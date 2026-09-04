DROP POLICY IF EXISTS dossiers_admin_select ON public.dossiers;
CREATE POLICY dossiers_admin_select ON public.dossiers
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS dossiers_admin_update ON public.dossiers;
CREATE POLICY dossiers_admin_update ON public.dossiers
  FOR UPDATE TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS pieces_admin_select ON public.dossier_pieces;
CREATE POLICY pieces_admin_select ON public.dossier_pieces
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS pieces_admin_update ON public.dossier_pieces;
CREATE POLICY pieces_admin_update ON public.dossier_pieces
  FOR UPDATE TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));

DROP POLICY IF EXISTS docs_admin_select ON public.documents_dossier;
CREATE POLICY docs_admin_select ON public.documents_dossier
  FOR SELECT TO authenticated USING (private.is_conseillere_ou_plus(auth.uid()));