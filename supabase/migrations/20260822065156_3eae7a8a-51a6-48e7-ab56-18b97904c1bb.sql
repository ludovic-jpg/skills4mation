ALTER VIEW public.catalogue_public SET (security_invoker = on);

-- anon may read only public-safe profile columns of validated formateurs
GRANT SELECT (id, prenom, nom, photo_url, statut_candidature) ON public.profiles TO anon;
CREATE POLICY "profiles_public_validated" ON public.profiles FOR SELECT TO anon
  USING (statut_candidature = 'valide');

GRANT SELECT ON public.parcours_formation TO anon;
CREATE POLICY "parcours_public_read" ON public.parcours_formation FOR SELECT TO anon
  USING (public.is_validated_formateur(formateur_id));

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.profiles_protect_statut() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_validated_formateur(uuid) FROM public;