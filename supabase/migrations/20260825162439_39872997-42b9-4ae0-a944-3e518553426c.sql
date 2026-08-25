
DROP POLICY IF EXISTS candidatures_own_email_select ON public.candidatures;
CREATE POLICY candidatures_own_email_select ON public.candidatures
  FOR SELECT TO authenticated USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
