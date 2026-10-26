import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
if (!/^https:\/\//.test(supabaseUrl) || !key.startsWith('sb_publishable_')) {
  throw new Error(
    'Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before starting the portal.',
  );
}
// Only the publishable key belongs in the browser. Permissions are enforced by the Edge API
// and database policies; no management token, database password or service key is bundled.
export const supabase = createClient(supabaseUrl, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Auth-admin invitations/setup links return an implicit session; browser-initiated
    // signup and recovery use PKCE. The SDK validates and clears either callback.
    flowType: window.location.hash.includes('access_token=')
      ? 'implicit'
      : 'pkce',
  },
});
export const portalEndpoint = `${supabaseUrl}/functions/v1/portal`;
export const supabasePublishableKey = key;
