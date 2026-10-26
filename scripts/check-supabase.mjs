// Runs against the linked project. Creates isolated, confirmed test users without sending email,
// exercises the actual API and RLS, then removes every test account, row and uploaded object.
import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { parseEnv } from 'node:util';
import { readFile } from 'node:fs/promises';
import {
  query,
  literal,
  ref,
  serviceKey,
  credentials,
} from './lib/supabase-management.mjs';
const publicEnv = parseEnv(await readFile('.env.production', 'utf8'));
const project = `https://${ref}.supabase.co`,
  base = `${project}/functions/v1/portal`,
  key = publicEnv.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = createClient(project, await serviceKey(), {
  auth: { persistSession: false, autoRefreshToken: false },
});
const run = randomUUID().slice(0, 8),
  users = [],
  objects = [];
let checks = 0;
function ok(condition, label) {
  assert(condition, label);
  checks++;
}
async function call(
  path,
  { token, method = 'GET', body, expected = 200, origin } = {},
) {
  const headers = { apikey: key };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (origin) headers.Origin = origin;
  if (body !== undefined && !(body instanceof FormData))
    headers['Content-Type'] = 'application/json';
  const response = await fetch(base + path, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });
  const value = response.status === 204 ? undefined : await response.json();
  assert.equal(
    response.status,
    expected,
    `${method} ${path}: ${response.status} ${value?.code ?? ''}`,
  );
  checks++;
  return value;
}
async function account(name, admin = false) {
  const email = `portal-test-${run}-${name}@example.invalid`,
    password = randomBytes(24).toString('base64url');
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      firstName: 'Test',
      lastName: name,
      organisation: `QA ${run}`,
      phone: '',
      locale: 'fr',
      role: 'admin',
      status: 'active',
    },
  });
  assert(!error, `Create test account: ${error?.code}`);
  const id = data.user.id;
  users.push(id);
  if (admin)
    await query(
      `update public.portal_profiles set data=data||'{"role":"admin","status":"active"}'::jsonb where id=${literal(id)}::uuid`,
    );
  const client = createClient(project, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signed = await client.auth.signInWithPassword({ email, password });
  assert(!signed.error, `Test sign-in: ${signed.error?.code}`);
  return {
    id,
    email,
    password,
    token: signed.data.session.access_token,
    client,
  };
}
try {
  await call('/health');
  await call('/clients', { expected: 401 });
  await call('/inquiries', { expected: 401 });
  await call('/retention', { expected: 401 });
  await call('/booking/config', {
    origin: 'https://untrusted.example',
    expected: 403,
  });
  await call('/jobs', { method: 'POST', body: {}, expected: 403 });
  const admin = await account('admin', true),
    one = await account('one'),
    two = await account('two');
  const session = await call('/session', { token: one.token });
  ok(
    session.role === 'client' && session.status === 'pending',
    'Auth metadata cannot set admin role or bypass approval',
  );
  await call('/clients', { token: one.token, expected: 403 });
  const patch = await call('/me', {
    token: one.token,
    method: 'PATCH',
    body: {
      firstName: 'Updated',
      role: 'admin',
      status: 'active',
      email: 'evil@example.invalid',
    },
  });
  ok(
    patch.role === 'client' &&
      patch.status === 'pending' &&
      patch.email === one.email,
    'Profile patches cannot escalate privileges',
  );
  const own = await one.client.from('portal_profiles').select('id');
  ok(
    !own.error && own.data.length === 1 && own.data[0].id === one.id,
    'RLS isolates profiles',
  );
  const forbidden = await one.client
    .from('portal_profiles')
    .update({ data: { role: 'admin' } })
    .eq('id', one.id);
  ok(forbidden.error?.code === '42501', 'Data API cannot write profiles');
  await call(`/threads/${two.id}/messages`, {
    token: one.token,
    expected: 403,
  });
  const form = new FormData();
  form.set('body', `Persistent message ${run}`);
  form.append(
    'files',
    new File(['private test bytes'], 'test.txt', { type: 'text/plain' }),
  );
  const message = await call(`/threads/${one.id}/messages`, {
    token: one.token,
    method: 'POST',
    body: form,
  });
  ok(message.fileIds.length === 1, 'Message attachment persisted');
  const file = (await call('/files', { token: one.token })).find(
    (f) => f.id === message.fileIds[0],
  );
  objects.push(`${one.id}/${file.id}`);
  const fileRls = await two.client
    .from('portal_files')
    .select('id')
    .eq('id', file.id);
  ok(!fileRls.error && fileRls.data.length === 0, 'RLS isolates files');
  const thread = (await call('/threads', { token: admin.token })).find(
    (t) => t.clientId === one.id,
  );
  ok(thread.unread === 1, 'Team sees unread client message');
  await call(`/threads/${one.id}/read`, {
    token: admin.token,
    method: 'POST',
    body: {},
    expected: 204,
  });
  ok(
    (await call('/threads', { token: admin.token })).find(
      (t) => t.clientId === one.id,
    ).unread === 0,
    'Read state persisted',
  );
  const second = new FormData();
  second.set('body', 'Team reply');
  await call(`/threads/${one.id}/messages`, {
    token: admin.token,
    method: 'POST',
    body: second,
  });
  ok(
    (await call(`/threads/${one.id}/messages`, { token: one.token })).length ===
      2,
    'Team and client share persistent conversation',
  );
  await call(`/files/${file.id}/download`, {
    token: two.token,
    method: 'POST',
    body: {},
    expected: 403,
  });
  const signed = await call(`/files/${file.id}/download`, {
    token: one.token,
    method: 'POST',
    body: {},
  });
  const bytes = await fetch(signed.url);
  ok(
    bytes.ok && (await bytes.text()) === 'private test bytes',
    'Authorized download has correct content',
  );
  const direct = await fetch(
    `${project}/storage/v1/object/portal-files/${one.id}/${file.id}`,
    { headers: { apikey: key } },
  );
  ok(!direct.ok, 'Private bucket blocks public downloads');
  await call(`/files/${file.id}`, {
    token: one.token,
    method: 'PATCH',
    body: { kept: true },
    expected: 403,
  });
  ok(
    (
      await call(`/files/${file.id}`, {
        token: admin.token,
        method: 'PATCH',
        body: { kept: true },
      })
    ).expiresAt === null,
    'Kept files have no expiry',
  );
  await call(`/files/${file.id}`, {
    token: admin.token,
    method: 'PATCH',
    body: { kept: false },
  });
  // Real expiry must hide the file immediately and remove its object through the scheduled job.
  await query(
    `update public.portal_files set data=jsonb_set(data,'{expiresAt}',to_jsonb('2020-01-01T00:00:00.000Z'::text)) where id=${literal(file.id)}::uuid`,
  );
  ok(
    !(await call('/files', { token: one.token })).some((f) => f.id === file.id),
    'Expired files disappear from API',
  );
  await call(`/files/${file.id}/download`, {
    token: one.token,
    method: 'POST',
    body: {},
    expected: 404,
  });
  const job = await fetch(base + '/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-portal-job-key': credentials.PORTAL_JOB_SECRET,
    },
    body: '{}',
  });
  const jobResult = await job.json();
  ok(
    job.ok &&
      jobResult.expired >= 1 &&
      jobResult.deleted >= 1 &&
      !jobResult.mailReady,
    'Maintenance removes expired bytes without sending unconfigured email',
  );
  const blob = await service.storage
    .from('portal-files')
    .download(`${one.id}/${file.id}`);
  ok(!!blob.error, 'Expired bytes removed from Storage');
  const payload = {
    name: `QA ${run}`,
    email: one.email,
    organisation: 'QA',
    sector: 'Test',
    material: 'Water',
    timeline: 'Test',
    message: `Inquiry test ${run}`,
    locale: 'en',
  };
  await call('/inquiries', { method: 'POST', body: payload, expected: 204 });
  const inquiry = (await call('/inquiries', { token: admin.token })).find(
    (i) => i.email === one.email,
  );
  ok(!!inquiry, 'Public contact reaches admin inbox');
  await call(`/inquiries/${inquiry.id}`, {
    token: admin.token,
    method: 'PATCH',
    body: { status: 'done' },
  });
  await call(`/inquiries/${inquiry.id}`, {
    token: one.token,
    method: 'PATCH',
    body: { status: 'read' },
    expected: 403,
  });
  const publicConfig = await call('/booking/config');
  ok(
    publicConfig.blocks.length === 0 &&
      publicConfig.types.every((t) => t.public),
    'Public booking hides private data',
  );
  const from = new Date(Date.now() + 86400000).toISOString(),
    to = new Date(Date.now() + 8 * 86400000).toISOString();
  const slots = await call(
    `/booking/slots?${new URLSearchParams({ typeId: 'decouverte', from, to })}`,
  );
  ok(slots.length > 3, 'Public booking returns free times');
  const slot = slots[0],
    host = slot.hostIds[0],
    input = {
      typeId: 'decouverte',
      start: slot.start,
      hostId: host,
      topic: `QA ${run}`,
    };
  // Competing real HTTP calls: exactly one reservation may succeed.
  const results = await Promise.all(
    [one, two].map(async (u) => {
      const r = await fetch(base + '/appointments/requests', {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${u.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });
      return { status: r.status, data: await r.json(), user: u };
    }),
  );
  ok(
    results.filter((r) => r.status === 200).length === 1 &&
      results.filter((r) => r.status === 409 && r.data.code === 'slot_taken')
        .length === 1,
    'Concurrent slot requests produce one winner and one conflict',
  );
  const won = results.find((r) => r.status === 200),
    other = won.user.id === one.id ? two : one,
    a = won.data;
  await call(`/appointments/${a.id}/cancel`, {
    token: other.token,
    method: 'POST',
    body: {},
    expected: 403,
  });
  const confirmed = await call(`/appointments/${a.id}/answer`, {
    token: admin.token,
    method: 'POST',
    body: { accept: true, meetingUrl: 'https://meet.example.invalid/test' },
  });
  ok(confirmed.status === 'confirmed', 'Team confirms request');
  const next = slots.find(
    (s) => Date.parse(s.start) > Date.parse(a.end) + 3600000,
  );
  const change = await call(`/appointments/${a.id}/change`, {
    token: won.user.token,
    method: 'POST',
    body: { start: next.start, hostId: next.hostIds[0] },
  });
  ok(
    !!change.change && change.start === a.start,
    'Change request retains confirmed time',
  );
  const moved = await call(`/appointments/${a.id}/change/answer`, {
    token: admin.token,
    method: 'POST',
    body: { accept: true },
  });
  ok(
    !moved.change && moved.start === next.start,
    'Team accepts pending change',
  );
  const bad = await call('/booking/config', {
    token: admin.token,
    method: 'PATCH',
    body: { stepMinutes: 0 },
    expected: 400,
  });
  ok(bad.code === 'invalid_input', 'Malformed settings rejected');
  const canceled = await call(`/appointments/${a.id}/cancel`, {
    token: won.user.token,
    method: 'POST',
    body: { reason: 'QA complete' },
  });
  ok(
    canceled.status === 'cancelled',
    'Client can cancel their own appointment',
  );
  const cfg = await call('/booking/config', { token: admin.token });
  const block = await call('/booking/blocks', {
    token: admin.token,
    method: 'POST',
    body: {
      hostId: host,
      start: slot.start,
      end: slot.end,
      reason: `QA ${run}`,
    },
  });
  ok(
    !(
      await call(
        `/booking/slots?${new URLSearchParams({ typeId: 'decouverte', from, to, hostId: host })}`,
      )
    ).some((s) => s.start === slot.start),
    'Blocked time is excluded',
  );
  await call(`/booking/blocks/${block.id}`, {
    token: admin.token,
    method: 'DELETE',
    expected: 204,
  });
  ok(
    (await call('/booking/config', { token: admin.token })).blocks.length ===
      cfg.blocks.length,
    'Blocked time removed',
  );
  const activity = await call('/activity', { token: won.user.token });
  ok(
    activity.some((a) => a.kind === 'appointment_confirmed'),
    'Client receives team activity',
  );
  await call('/activity/read', {
    token: won.user.token,
    method: 'POST',
    body: {},
    expected: 204,
  });
  ok(
    (await call('/activity', { token: won.user.token })).every((a) =>
      a.readBy.includes(won.user.id),
    ),
    'Activity read state persisted',
  );
  await call(`/clients/${one.id}`, {
    token: admin.token,
    method: 'PATCH',
    body: { status: 'disabled' },
  });
  await call('/session', { token: one.token, expected: 403 });
  const disabled = await one.client.from('portal_messages').select('id');
  ok(
    !disabled.error && disabled.data.length === 0,
    'Disabling an account revokes Data API reads with an existing token',
  );
  await call(`/clients/${one.id}`, {
    token: admin.token,
    method: 'PATCH',
    body: { status: 'active' },
  });
  console.log(
    `Passed ${checks} live API, RLS, private Storage, retention, messaging, notification and booking assertions.`,
  );
} finally {
  // Client rows are removed first, so their conversations/files/appointments cascade safely.
  for (const id of [...users].reverse()) {
    const { error } = await service.auth.admin.deleteUser(id);
    if (error)
      console.error('Test account cleanup failed', error.code ?? error.status);
  }
  if (objects.length)
    await service.storage.from('portal-files').remove(objects);
  await query(
    `delete from public.portal_inquiries where data->>'name'=${literal(`QA ${run}`)};delete from public.portal_activity where data->>'kind'='inquiry' and data->'data'->>'name'=${literal(`QA ${run}`)}; delete from private.portal_email_outbox where recipient like ${literal(`portal-test-${run}-%`)}; delete from private.portal_storage_cleanup where path in (${objects.length ? objects.map(literal).join(',') : "''"});`,
  );
}
