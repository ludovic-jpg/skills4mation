-- 1. Client companies: restrict reads to creator or team
DROP POLICY IF EXISTS entreprises_clientes_select_authenticated ON public.entreprises_clientes;
CREATE POLICY entreprises_clientes_select_own_or_admin
  ON public.entreprises_clientes FOR SELECT TO authenticated
  USING ((created_by = auth.uid()) OR private.is_conseillere_ou_plus(auth.uid()));

-- 2. Profiles: remove full-row anonymous exposure, keep the public catalogue view working
ALTER VIEW public.catalogue_public SET (security_invoker = off);
GRANT SELECT ON public.catalogue_public TO anon, authenticated;

DROP POLICY IF EXISTS profiles_public_validated ON public.profiles;
REVOKE ALL ON public.profiles FROM anon;