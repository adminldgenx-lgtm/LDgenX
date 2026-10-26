-- The key is provisioned by setup-supabase.mjs, outside migration history.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
select cron.schedule('ldgenx-portal-maintenance','*/15 * * * *',$job$
  select net.http_post(
    url := 'https://rkkvvqwgxbtnvewyrylj.supabase.co/functions/v1/portal/jobs',
    headers := jsonb_build_object('Content-Type','application/json','x-portal-job-key',(select secret from private.portal_jobs where id='cron')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$job$);
