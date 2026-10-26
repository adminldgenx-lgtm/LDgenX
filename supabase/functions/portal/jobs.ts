import type { Sql } from 'npm:postgres@3.4.7';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';
import type { RetentionSettings } from '../_shared/types.ts';

/** Runs every 15 minutes via pg_cron. The job key is never exposed to the browser. */
export async function runJobs(sql: Sql, admin: SupabaseClient) {
  return sql.begin(async (tx) => {
    const lock =
      await tx`select pg_try_advisory_xact_lock(hashtextextended('portal-jobs',0)) as acquired`;
    if (!lock[0].acquired) return { busy: true };
    const stamp = new Date().toISOString();
    const filesUrl = `${(Deno.env.get('PORTAL_SITE_URL') ?? 'https://www.ldgenx.fr').replace(/\/+$/, '')}/espace/fichiers`;
    const due =
      await tx`select id,object_path from public.portal_files where data->>'expiresAt' is not null and data->>'expiresAt' <= ${stamp} and not (data->>'kept')::boolean for update`;
    for (const f of due) {
      await tx`insert into private.portal_storage_cleanup(path) values(${f.object_path}) on conflict do nothing`;
      await tx`delete from public.portal_files where id=${f.id}`;
    }
    if (due.length) {
      const rows =
        await tx`select data from public.portal_settings where id='retention' for update`;
      const retention = rows[0].data as RetentionSettings;
      retention.lastPurgeAt = stamp;
      await tx`update public.portal_settings set data=${tx.json(retention as never)} where id='retention'`;
    }
    const notices =
      await tx`select distinct p.id,p.data->>'email' as email,p.data->>'locale' as locale,f.data->>'expiresAt' as expiry from public.portal_files f join public.portal_profiles p on f.client_id=p.id where p.status<>'disabled' and (p.data->'notify'->>'weeklyPurge')::boolean and f.data->>'expiresAt' > ${stamp} and f.data->>'expiresAt' < ${new Date(Date.now() + 86400000).toISOString()}`;
    for (const n of notices)
      await tx`insert into private.portal_email_outbox(recipient,subject,body,dedupe_key) values(${n.email},'LDgenX — Fichiers / Files',${n.locale === 'en' ? `Download your files before their deletion: ${n.expiry}\n${filesUrl}` : `Téléchargez vos fichiers avant leur suppression : ${n.expiry}\n${filesUrl}`},${`purge:${n.id}:${n.expiry}`}) on conflict(dedupe_key) do nothing`;
    const cleanup =
      await tx`select path from private.portal_storage_cleanup limit 100`;
    let deleted = 0;
    for (const row of cleanup) {
      const { error } = await admin.storage
        .from('portal-files')
        .remove([row.path]);
      if (!error) {
        await tx`delete from private.portal_storage_cleanup where path=${row.path}`;
        deleted++;
      }
    }
    const apiKey = Deno.env.get('RESEND_API_KEY'),
      from = Deno.env.get('PORTAL_EMAIL_FROM');
    let sent = 0;
    // SMTP for Supabase Auth and this transactional mail provider are configured together.
    // Without credentials, retain the outbox and report mailReady=false; never claim delivery.
    if (apiKey && from) {
      const mail =
        await tx`select * from private.portal_email_outbox where sent_at is null and attempts<5 and created_at>now()-interval '2 days' order by created_at limit 30 for update skip locked`;
      for (const item of mail) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'Idempotency-Key': `portal-email/${item.id}`,
            },
            body: JSON.stringify({
              from,
              to: [item.recipient],
              subject: item.subject,
              text: item.body,
            }),
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok) throw new Error(`provider_http_${response.status}`);
          await tx`update private.portal_email_outbox set sent_at=now(),attempts=attempts+1,last_error=null where id=${item.id}`;
          sent++;
        } catch (e) {
          await tx`update private.portal_email_outbox set attempts=attempts+1,last_error=${e instanceof Error ? e.message.slice(0, 100) : 'provider_error'} where id=${item.id}`;
        }
      }
    }
    await tx`delete from private.portal_rate_limits where window_at<now()-interval '2 days'`;
    await tx`delete from private.portal_email_outbox where created_at<now()-interval '30 days'`;
    return {
      expired: due.length,
      deleted,
      sent,
      mailReady: !!(apiKey && from),
    };
  });
}
