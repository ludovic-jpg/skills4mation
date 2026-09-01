GRANT DELETE ON public.dossiers TO authenticated;

CREATE POLICY "dossiers_delete_brouillon"
ON public.dossiers
FOR DELETE
TO authenticated
USING (
  statut_crm = 'brouillon'
  AND (
    formateur_id = auth.uid()
    OR private.is_conseillere_ou_plus(auth.uid())
  )
);