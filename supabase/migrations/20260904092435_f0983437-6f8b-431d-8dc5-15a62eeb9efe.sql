ALTER TABLE public.profiles DROP COLUMN IF EXISTS lien_tally_f5;
ALTER TABLE public.document_envois DROP COLUMN IF EXISTS tally_submission_id;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('skills4mation-taches-quotidiennes')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'skills4mation-taches-quotidiennes');

SELECT cron.schedule(
  'skills4mation-taches-quotidiennes',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--d8ba8821-9093-4866-919b-ab800e336108.lovable.app/api/public/cron/taches-quotidiennes',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret', true)
    ),
    body := '{}'::jsonb
  );
  $$
);