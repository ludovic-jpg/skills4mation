ALTER VIEW public.catalogue_public SET (security_invoker = on);

-- Anonymous visitors may only read the identity columns of validated formateurs
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT (id, prenom, nom, photo_url, statut_candidature) ON public.profiles TO anon;

DROP POLICY IF EXISTS profiles_public_validated ON public.profiles;
CREATE POLICY profiles_public_validated
  ON public.profiles FOR SELECT TO anon
  USING (statut_candidature = 'valide'::public.candidature_statut);