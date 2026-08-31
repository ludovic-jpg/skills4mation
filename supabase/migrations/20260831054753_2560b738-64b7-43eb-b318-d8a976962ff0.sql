CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_statut public.candidature_statut := 'en_attente';
  v_is_admin boolean := lower(NEW.email) LIKE '%@skills4mation.com';
  v_is_apprenant boolean := EXISTS (
    SELECT 1 FROM public.dossier_apprenants a WHERE lower(a.email) = lower(NEW.email)
  );
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
  VALUES (NEW.id, CASE
    WHEN v_is_admin THEN 'admin'::public.app_role
    WHEN v_is_apprenant THEN 'apprenant'::public.app_role
    ELSE 'formateur'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF v_is_apprenant THEN
    UPDATE public.dossier_apprenants
       SET user_id = NEW.id
     WHERE lower(email) = lower(NEW.email) AND user_id IS NULL;
  END IF;

  RETURN NEW;
END;
$function$;