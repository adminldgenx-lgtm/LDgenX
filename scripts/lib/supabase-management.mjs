import { readFile, writeFile, chmod } from 'node:fs/promises';
import { parseEnv } from 'node:util';
export const credentialFile = '.env.supabase.local';
export const credentials = {
  ...parseEnv(await readFile(credentialFile, 'utf8').catch(() => '')),
  ...process.env,
};
export const ref = credentials.SUPABASE_PROJECT_REF;
if (!ref || !credentials.SUPABASE_ACCESS_TOKEN)
  throw new Error(
    'Set SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN in .env.supabase.local (never VITE_ variables).',
  );
export async function management(
  path,
  body,
  method = body === undefined ? 'GET' : 'POST',
) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${ref}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${credentials.SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
  const value = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      `Supabase Management ${method} ${path}: HTTP ${response.status}; ${String(value?.message ?? 'request failed').slice(0, 250)}`,
    );
  return value;
}
export const query = (sql) => management('/database/query', { query: sql });
export const literal = (value) => `'${String(value).replaceAll("'", "''")}'`;
export async function saveCredentials(values) {
  const current = parseEnv(
    await readFile(credentialFile, 'utf8').catch(() => ''),
  );
  Object.assign(current, values);
  Object.assign(credentials, values);
  await writeFile(
    credentialFile,
    Object.entries(current)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n',
    { mode: 0o600 },
  );
  await chmod(credentialFile, 0o600);
}
export async function serviceKey() {
  if (credentials.SUPABASE_SERVICE_ROLE_KEY)
    return credentials.SUPABASE_SERVICE_ROLE_KEY;
  const keys = await management('/api-keys');
  const key = keys.find((k) => k.name === 'service_role')?.api_key;
  if (!key) throw new Error('Project service key unavailable');
  await saveCredentials({ SUPABASE_SERVICE_ROLE_KEY: key });
  return key;
}
