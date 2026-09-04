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
      'Authorization', 'Bearer 9fcb1834b52892a625297378ac25f605cbf1f372a2c16d0e'
    ),
    body := '{}'::jsonb
  );
  $$
);