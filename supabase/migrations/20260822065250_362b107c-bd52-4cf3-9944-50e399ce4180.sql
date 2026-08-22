CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_statut public.candidature_statut := 'en_attente';
  v_is_admin boolean := lower(NEW.email) LIKE '%@skills4mation.com';
BEGIN
  IF v_is_admin OR EXISTS (
    SELECT 1 FROM public.candidatures c
    WHERE lower(c.email) = lower(NEW.email) AND c.statut = 'valide'
  ) THEN
    v_statut := 'valide';
  END IF;

  INSERT INTO public.profiles (id, email, prenom, nom, statut_candidature)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''), v_statut)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN v_is_admin THEN 'admin'::public.app_role ELSE 'formateur'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;