-- Retry outgoing work every minute; full Google reconciliation remains throttled to five minutes.
alter table private.google_calendar_connection add column last_reconcile_at timestamptz;
select cron.schedule('ldgenx-google-calendar','* * * * *',$job$
 select net.http_post(
   url := 'https://rkkvvqwgxbtnvewyrylj.supabase.co/functions/v1/calendar/jobs',
   headers := jsonb_build_object('Content-Type','application/json','x-calendar-job-key',(select secret from private.portal_jobs where id='google-calendar')),
   body := '{}'::jsonb,timeout_milliseconds := 60000
 ) where exists(select 1 from private.google_calendar_connection where enabled);
$job$);
