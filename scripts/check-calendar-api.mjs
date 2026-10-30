// Isolated accounts, no email and no real Google authorization or calendar event changes.
import assert from "node:assert/strict";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import {
  ref,
  serviceKey,
  query,
  literal,
  credentials,
} from "./lib/supabase-management.mjs";
const env = parseEnv(await readFile(".env.production", "utf8")),
  key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const project = `https://${ref}.supabase.co`,
  base = project + "/functions/v1/calendar";
const service = createClient(project, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const users = [],
  run = randomUUID().slice(0, 8),
  checks = [];
const ok = (value, label) => {
  assert(value, label);
  checks.push(label);
};
async function account(admin) {
  const email = `calendar-qa-${run}-${admin ? "admin" : "client"}@example.invalid`,
    password = randomBytes(24).toString("base64url");
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: "Calendar",
      lastName: "QA",
      organisation: "QA",
      locale: "fr",
    },
  });
  assert(!error);
  users.push(data.user.id);
  if (admin)
    await query(
      `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(data.user.id)}`,
    );
  const client = createClient(project, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signed = await client.auth.signInWithPassword({ email, password });
  assert(!signed.error);
  return { id: data.user.id, token: signed.data.session.access_token };
}
async function call(
  path,
  expected = 200,
  token,
  method = "GET",
  body,
  headers = {},
) {
  const response = await fetch(base + path, {
    method,
    headers: {
      apikey: key,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
    signal: AbortSignal.timeout(45000),
  });
  assert.equal(
    response.status,
    expected,
    `${method} ${path.split("?")[0]} ${response.status}`,
  );
  checks.push(`${method} ${path.split("?")[0]} ${expected}`);
  return response;
}
try {
  const connection = await query(
    "select enabled,credentials is not null as connected from private.google_calendar_connection where id=true",
  );
  assert(
    !connection[0].enabled && !connection[0].connected,
    "Owner already connected; use connected integration checks instead.",
  );
  await call("/status", 401);
  await call("/status", 401, "invalid-token");
  const client = await account(false),
    admin = await account(true);
  await call("/status", 403, client.token);
  await call("/connect", 403, client.token, "POST");
  const status = await (await call("/status", 200, admin.token)).json();
  ok(
    status.configured && !status.enabled && !status.connected,
    "Configured without claiming an ungranted connection",
  );
  ok(
    status.expectedOwner === "admin.ldgenx@gmail.com" &&
      status.hosts.length >= 2,
    "Correct owner and bookable team",
  );
  ok(
    !JSON.stringify(status).includes("credentials") &&
      !JSON.stringify(status).includes("refreshToken"),
    "No credentials in browser status",
  );
  const busy = await (
    await call(
      "/busy?from=2026-11-02T08:00:00Z&to=2026-11-02T18:00:00Z",
      200,
      admin.token,
    )
  ).json();
  ok(
    Array.isArray(busy) && busy.length === 0,
    "Disabled connection requires no Google authorization",
  );
  await call("/busy?from=bad&to=bad", 400, admin.token);
  await call("/status", 403, admin.token, "GET", undefined, {
    Origin: "https://untrusted.example",
  });
  const cors = await call("/status", 204, undefined, "OPTIONS", undefined, {
    Origin: "https://www.ldgenx.fr",
  });
  ok(
    cors.headers.get("access-control-allow-origin") === "https://www.ldgenx.fr",
    "Canonical origin CORS preflight",
  );
  const connect = await (
    await call("/connect", 200, admin.token, "POST")
  ).json();
  const google = new URL(connect.url),
    state = google.searchParams.get("state");
  ok(
    google.origin === "https://accounts.google.com" &&
      google.searchParams.get("client_id") === credentials.GOOGLE_CLIENT_ID,
    "Correct Google authorization client",
  );
  ok(
    google.searchParams.get("redirect_uri") ===
      "https://www.ldgenx.fr/api/auth/google/callback",
    "Canonical callback separate from basic sign-in",
  );
  const scopes = google.searchParams.get("scope").split(" ");
  ok(
    scopes.includes("https://www.googleapis.com/auth/calendar.app.created") &&
      scopes.includes(
        "https://www.googleapis.com/auth/calendar.events.freebusy",
      ) &&
      !scopes.some((s) => s.includes("gmail")),
    "Only required Calendar and identity scopes",
  );
  ok(
    google.searchParams.get("access_type") === "offline" &&
      google.searchParams.get("prompt") === "consent" &&
      state.length === 64,
    "Offline consent and strong state",
  );
  const hash = createHash("sha256").update(state).digest("hex");
  const tickets = await query(
    `select state_hash from private.google_calendar_oauth where state_hash=${literal(hash)} and actor_id=${literal(admin.id)}`,
  );
  ok(
    tickets.length === 1 && tickets[0].state_hash !== state,
    "Only state hash stored",
  );
  const cancelled = await call(
    `/callback?state=${state}&error=access_denied`,
    303,
  );
  ok(
    cancelled.headers.get("location").endsWith("calendar=consent_cancelled"),
    "Cancellation returns safely to admin settings",
  );
  ok(
    cancelled.headers.get("referrer-policy") === "no-referrer",
    "Callback prevents referrer exposure",
  );
  const replay = await call(
    `/callback?state=${state}&error=access_denied`,
    303,
  );
  ok(
    replay.headers.get("location").endsWith("calendar=invalid_oauth_state"),
    "Consumed OAuth state cannot replay",
  );
  await call("/jobs", 403, undefined, "POST");
  await call("/jobs", 403, undefined, "POST", undefined, {
    "x-calendar-job-key": "invalid",
  });
  const jobs = await (
    await call("/jobs", 200, undefined, "POST", undefined, {
      "x-calendar-job-key": credentials.GOOGLE_CALENDAR_JOB_SECRET,
    })
  ).json();
  ok(
    jobs.synced === 0,
    "Authenticated retry job leaves unconnected project inactive",
  );
  const privateRest = await fetch(
    project + "/rest/v1/google_calendar_connection?select=*",
    { headers: { apikey: key } },
  );
  ok(!privateRest.ok, "Private credentials absent from REST schema");
  const after = await (await call("/status", 200, admin.token)).json();
  ok(
    !after.enabled && !after.connected && !after.lastError,
    "Failed and replayed callbacks cannot alter connection health",
  );
  const cron = await query(
    "select active from cron.job where jobname='ldgenx-google-calendar'",
  );
  ok(
    cron.length === 1 && cron[0].active,
    "Conditional retry schedule installed",
  );
  console.log(
    `${checks.length} Calendar API checks passed. Owner consent has not been performed.`,
  );
  await mkdir("docs/calendar-qa", { recursive: true });
  await writeFile(
    "docs/calendar-qa/api.json",
    JSON.stringify(
      { date: new Date().toISOString(), checks, consentPerformed: false },
      null,
      2,
    ) + "\n",
  );
} finally {
  for (const id of users) await service.auth.admin.deleteUser(id);
}
