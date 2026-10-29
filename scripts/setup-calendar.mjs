// Additive Calendar setup only. No Auth, SMTP, DNS or mail settings are changed.
import { readFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import {
  credentials,
  saveCredentials,
  management,
  query,
  literal,
} from "./lib/supabase-management.mjs";
for (const name of ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"])
  if (!credentials[name])
    throw new Error(`${name} is missing from server credentials.`);
const generated = {};
if (!credentials.GOOGLE_CALENDAR_ENCRYPTION_KEY)
  generated.GOOGLE_CALENDAR_ENCRYPTION_KEY = randomBytes(32).toString("base64");
if (!credentials.GOOGLE_CALENDAR_JOB_SECRET)
  generated.GOOGLE_CALENDAR_JOB_SECRET = randomBytes(32).toString("hex");
if (Object.keys(generated).length) await saveCredentials(generated);
for (const [version, name] of [
  ["20261029140000", "google_calendar"],
  ["20261029210000", "google_calendar_blocks"],
]) {
  if (
    !(
      await query(
        `select version from supabase_migrations.schema_migrations where version=${literal(version)}`,
      )
    ).length
  ) {
    const migration = await readFile(
      `supabase/migrations/${version}_${name}.sql`,
      "utf8",
    );
    await query(
      `begin; ${migration}\n insert into supabase_migrations.schema_migrations(version,name,statements) values(${literal(version)},${literal(name)},array[${literal(migration)}]); commit;`,
    );
  }
}
await management(
  "/secrets",
  [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALENDAR_ENCRYPTION_KEY",
    "GOOGLE_CALENDAR_JOB_SECRET",
  ].map((name) => ({ name, value: credentials[name] })),
);
await query(
  `insert into private.portal_jobs(id,secret) values('google-calendar',${literal(credentials.GOOGLE_CALENDAR_JOB_SECRET)}) on conflict(id) do update set secret=excluded.secret`,
);
await query(`select cron.schedule('ldgenx-google-calendar','*/5 * * * *',$job$
 select net.http_post(
 url := 'https://rkkvvqwgxbtnvewyrylj.supabase.co/functions/v1/calendar/jobs',
 headers := jsonb_build_object('Content-Type','application/json','x-calendar-job-key',(select secret from private.portal_jobs where id='google-calendar')),
 body := '{}'::jsonb, timeout_milliseconds := 60000
 ) where exists(select 1 from private.google_calendar_connection where enabled);
$job$)`);
console.log(
  "Private Calendar tables, encrypted credential storage and conditional five-minute retries configured. Connection still requires owner consent.",
);
