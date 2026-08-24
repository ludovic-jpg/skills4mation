CREATE TABLE public.demandes_contact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  nom text NOT NULL,
  email text NOT NULL,
  telephone text,
  profil text,
  objectif text,
  disponibilites text,
  formation_souhaitee text,
  budget_estime text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.demandes_contact TO anon, authenticated;
GRANT SELECT ON public.demandes_contact TO authenticated;
GRANT ALL ON public.demandes_contact TO service_role;

ALTER TABLE public.demandes_contact ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact request"
ON public.demandes_contact FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read contact requests"
ON public.demandes_contact FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));