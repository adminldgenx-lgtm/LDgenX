import { unlink } from 'node:fs/promises';
// Only replaces the private, expiring setup artifact. No email is sent.
await unlink('admin-setup.local.html').catch((e) => {
  if (e.code !== 'ENOENT') throw e;
});
await import('./setup-supabase.mjs');
