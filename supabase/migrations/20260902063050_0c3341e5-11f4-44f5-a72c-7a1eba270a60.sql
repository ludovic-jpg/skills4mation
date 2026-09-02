CREATE OR REPLACE FUNCTION public.next_adf_numero()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'ADF-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.adf_numero_seq')::text, 4, '0');
$$;

REVOKE ALL ON FUNCTION public.next_adf_numero() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.next_adf_numero() FROM anon;
REVOKE ALL ON FUNCTION public.next_adf_numero() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.next_adf_numero() TO service_role;