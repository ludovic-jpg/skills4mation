CREATE TABLE public.demandes_droits_formation (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  prenom text not null,
  nom text not null,
  email text not null,
  telephone text,
  statut_pro text,
  situation text,
  formation_visee text,
  objectif_professionnel text,
  disponibilites text,
  dispositifs text[],
  budget_estime text,
  message text,
  statut public.budget_statut not null default 'en_attente',
  assigne_a uuid references auth.users(id) on delete set null,
  assigne_nom text,
  note_admin text
);

GRANT INSERT ON public.demandes_droits_formation TO anon;
GRANT SELECT, INSERT, UPDATE ON public.demandes_droits_formation TO authenticated;
GRANT ALL ON public.demandes_droits_formation TO service_role;

ALTER TABLE public.demandes_droits_formation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "droits_insert_public" ON public.demandes_droits_formation
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "droits_admin_select" ON public.demandes_droits_formation
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "droits_admin_update" ON public.demandes_droits_formation
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

ALTER TABLE public.candidatures
  ADD COLUMN IF NOT EXISTS assigne_a uuid references auth.users(id) on delete set null,
  ADD COLUMN IF NOT EXISTS assigne_nom text;
ALTER TABLE public.demandes_budget
  ADD COLUMN IF NOT EXISTS assigne_a uuid references auth.users(id) on delete set null,
  ADD COLUMN IF NOT EXISTS assigne_nom text;
ALTER TABLE public.demandes_contact
  ADD COLUMN IF NOT EXISTS assigne_a uuid references auth.users(id) on delete set null,
  ADD COLUMN IF NOT EXISTS assigne_nom text,
  ADD COLUMN IF NOT EXISTS statut public.budget_statut not null default 'en_attente',
  ADD COLUMN IF NOT EXISTS note_admin text;

DROP POLICY IF EXISTS "contact_admin_update" ON public.demandes_contact;
CREATE POLICY "contact_admin_update" ON public.demandes_contact
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
GRANT UPDATE ON public.demandes_contact TO authenticated;