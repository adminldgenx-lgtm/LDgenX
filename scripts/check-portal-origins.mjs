// Read-only remote regression: exercise actual CORS responses and Auth callback configuration.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { portalOrigins, portalAuthRedirects } from '../supabase/functions/_shared/origins.ts';
import { management, ref, credentials } from './lib/supabase-management.mjs';

const base = `https://${ref}.supabase.co/functions/v1/portal`;
const rows = [];
const rejected = [
  'https://untrusted.example',
  'null',
  'https://www.ldgenx.fr.evil.example',
  'http://localhost.evil.example:5174',
  'http://127.0.0.1:51740',
];
for (const origin of [...portalOrigins, ...rejected]) {
  const allowed = portalOrigins.includes(origin);
  for (const method of ['OPTIONS', 'GET']) {
    const response = await fetch(base + '/health', {
      method,
      headers: {
        Origin: origin,
        ...(method === 'OPTIONS'
          ? {
              'Access-Control-Request-Method': 'GET',
              'Access-Control-Request-Headers': 'authorization,apikey',
            }
          : {}),
      },
      signal: AbortSignal.timeout(20000),
    });
    const allowOrigin = response.headers.get('access-control-allow-origin');
    rows.push({ origin, method, status: response.status, allowOrigin });
    assert.equal(
      response.status,
      allowed ? (method === 'OPTIONS' ? 204 : 200) : 403,
      `${origin} ${method}`,
    );
    assert.equal(allowOrigin, allowed ? origin : null, `${origin} CORS header`);
  }
}
const auth = await management('/config/auth');
if (credentials.PORTAL_SITE_URL)
  assert.equal(
    auth.site_url,
    credentials.PORTAL_SITE_URL,
    'Auth site URL must match the current frontend',
  );
const redirects = String(auth.uri_allow_list).split(',');
for (const url of portalAuthRedirects)
  assert(redirects.includes(url), `Missing Auth callback: ${url}`);
const output = process.env.LDGENX_QA_OUTPUT ?? 'docs/qa-2026-10-26';
await mkdir(output, { recursive: true });
await writeFile(
  `${output}/portal-origins-results.json`,
  JSON.stringify(
    {
      passed: true,
      siteUrl: auth.site_url,
      approvedOrigins: portalOrigins,
      rejectedOrigins: rejected,
      authCallbacksVerified: portalAuthRedirects,
      requests: rows,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Passed: ${rows.length} live requests; ${portalOrigins.length} approved origins, ${rejected.length} rejected origins; Auth callbacks present.`,
);
