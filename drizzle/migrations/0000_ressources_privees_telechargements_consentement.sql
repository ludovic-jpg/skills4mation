CREATE TABLE public.ressource_telechargements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  ressource text NOT NULL,
  date timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ressource_telechargements TO authenticated;
GRANT ALL ON public.ressource_telechargements TO service_role;
ALTER TABLE public.ressource_telechargements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture de ses téléchargements" ON public.ressource_telechargements FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Enregistrement de ses téléchargements" ON public.ressource_telechargements FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()) AND ressource = 'portage-qualiopi-octobre-2026');
CREATE INDEX ressource_telechargements_user_date_idx ON public.ressource_telechargements(user_id, date DESC);

CREATE TABLE public.ressource_consentements (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_recorded_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ressource_consentements TO authenticated;
GRANT ALL ON public.ressource_consentements TO service_role;
ALTER TABLE public.ressource_consentements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture de son consentement" ON public.ressource_consentements FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Création de son consentement" ON public.ressource_consentements FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Modification de son consentement" ON public.ressource_consentements FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE FUNCTION public.ressource_consentement_horodater() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.consent_recorded_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER ressource_consentement_horodatage BEFORE INSERT OR UPDATE ON public.ressource_consentements FOR EACH ROW EXECUTE FUNCTION public.ressource_consentement_horodater();

CREATE POLICY "Guide privé accessible aux comptes connectés" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'ressources-privees' AND name = 'livre-blanc-portage-qualiopi-octobre-2026.pdf');