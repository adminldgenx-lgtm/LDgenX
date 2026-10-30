// Supabase Auth and the verified Edge API implement the portal contract.
import { PortalError, type PortalApi, type User } from './types';
import { portalSiteOrigin } from '../../../supabase/functions/_shared/site';

import {
  supabase,
  portalEndpoint as BASE,
  supabasePublishableKey,
} from '../../lib/supabase';

const listeners = new Set<() => void>();
let notificationTimer: ReturnType<typeof setTimeout> | undefined;
const notify = () => {
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(
    () => listeners.forEach((listener) => listener()),
    100,
  );
};
// Screen widgets share a small request budget instead of opening an Edge worker each at once.
let activeRequests = 0;
const waiting: (() => void)[] = [];
async function limitedFetch(url: string, init: RequestInit) {
  if (activeRequests < 4) activeRequests++;
  else await new Promise<void>((resolve) => waiting.push(resolve));
  try {
    return await fetch(url, init);
  } finally {
    const next = waiting.shift();
    if (next) next();
    else activeRequests--;
  }
}

function authError(error: { code?: string; status?: number } | null) {
  if (!error) return;
  const codes: Record<string, PortalError['code']> = {
    invalid_credentials: 'invalid_credentials',
    email_not_confirmed: 'email_not_confirmed',
    user_already_exists: 'email_taken',
    email_exists: 'email_taken',
    over_email_send_rate_limit: 'rate_limited',
    over_request_rate_limit: 'rate_limited',
    email_address_not_authorized: 'email_unavailable',
    email_address_invalid: 'invalid_input',
    weak_password: 'invalid_input',
    validation_failed: 'invalid_input',
  };
  throw new PortalError(
    codes[error.code ?? ''] ??
      (error.status === 429 ? 'rate_limited' : 'network'),
  );
}
const redirect = (path: string) =>
  `${portalSiteOrigin(window.location.origin)}${path}`;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  authError(error);
  const headers: Record<string, string> = { apikey: supabasePublishableKey };
  if (session) headers.Authorization = `Bearer ${session.access_token}`;
  if (!(body instanceof FormData) && body !== undefined)
    headers['Content-Type'] = 'application/json';
  let response: Response;
  try {
    response = await limitedFetch(BASE + path, {
      method,
      headers,
      signal: AbortSignal.timeout(60000),
      body:
        body instanceof FormData
          ? body
          : body === undefined
            ? undefined
            : JSON.stringify(body),
    });
  } catch {
    throw new PortalError('network');
  }
  if (response.status === 204) {
    if (method !== 'GET') notify();
    return undefined as T;
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new PortalError(
      payload.code ?? (response.status === 401 ? 'unauthenticated' : 'network'),
    );
  if (method !== 'GET') notify();
  return payload as T;
}
const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [
    string,
    string,
  ][];
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

export function createHttpApi(): PortalApi {
  return {
    mode: 'supabase',

    currentUser: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      authError(error);
      if (!session) return null;
      return request<User | null>('GET', '/session').catch(async (e) => {
        if (e.code === 'unauthenticated' || e.code === 'account_disabled') {
          await supabase.auth.signOut({ scope: 'local' });
          return null;
        }
        throw e;
      });
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      authError(error);
      try {
        return await request<User>('GET', '/session');
      } catch (e) {
        await supabase.auth.signOut({ scope: 'local' });
        throw e;
      }
    },
    signUp: async (input) => {
      const { email, password, ...profile } = input;
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: profile,
          emailRedirectTo: redirect('/espace/connexion'),
        },
      });
      authError(error);
      return data.session ? request<User>('GET', '/session') : null;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      authError(error);
      notify();
    },
    requestPasswordReset: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: redirect('/espace/nouveau-mot-de-passe') },
      );
      authError(error);
    },
    setPassword: async (next) => {
      if (next.length < 8) throw new PortalError('invalid_input');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new PortalError('unauthenticated');
      const { error } = await supabase.auth.updateUser({ password: next });
      authError(error);
    },
    updateProfile: (patch) => request('PATCH', '/me', patch),
    changePassword: async (current, next) => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      authError(error);
      if (!user?.email) throw new PortalError('unauthenticated');
      const verified = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current,
      });
      authError(verified.error);
      if (next.length < 8) throw new PortalError('invalid_input');
      const changed = await supabase.auth.updateUser({ password: next });
      authError(changed.error);
    },

    listTeam: () => request('GET', '/team'),
    listClients: () => request('GET', '/clients'),
    getUser: (id) => request('GET', `/users/${id}`),
    setAccountStatus: (id, status) =>
      request('PATCH', `/clients/${id}`, { status }),
    inviteClient: (input) => request('POST', '/clients/invitations', input),

    listThreads: () => request('GET', '/threads'),
    listMessages: (clientId) => request('GET', `/threads/${clientId}/messages`),
    sendMessage: (clientId, body, files = []) => {
      const form = new FormData();
      form.set('body', body);
      for (const file of files) form.append('files', file);
      return request('POST', `/threads/${clientId}/messages`, form);
    },
    markThreadRead: (clientId) => request('POST', `/threads/${clientId}/read`),

    listInquiries: () => request('GET', '/inquiries'),
    setInquiryStatus: (id, status) =>
      request('PATCH', `/inquiries/${id}`, { status }),
    submitInquiry: (input) => request('POST', '/inquiries', input),

    listFiles: (clientId) => request('GET', `/files${query({ clientId })}`),
    uploadFile: (clientId, file, note = '') => {
      const form = new FormData();
      form.set('file', file);
      form.set('note', note);
      return request('POST', `/clients/${clientId}/files`, form);
    },
    // The server answers with a short-lived signed address of the file.
    downloadFile: async (id) => {
      const { url } = await request<{ url: string }>(
        'POST',
        `/files/${id}/download`,
      );
      const response = await fetch(url);
      if (!response.ok) throw new PortalError('not_found');
      return response.blob();
    },
    deleteFile: (id) => request('DELETE', `/files/${id}`),
    keepFile: (id, kept) => request('PATCH', `/files/${id}`, { kept }),

    getRetention: () => request('GET', '/retention'),
    updateRetention: (patch) => request('PATCH', '/retention', patch),
    purgeNow: async () =>
      (await request<{ count: number }>('POST', '/retention/purge')).count,

    getBookingConfig: () => request('GET', '/booking/config'),
    updateBookingConfig: (patch) => request('PATCH', '/booking/config', patch),
    availableSlots: (typeId, from, to, hostId, ignore) =>
      request(
        'GET',
        `/booking/slots${query({ typeId, from, to, hostId, ignore })}`,
      ),
    listAppointments: (range) =>
      request(
        'GET',
        `/appointments${query({ from: range?.from, to: range?.to })}`,
      ),
    requestAppointment: (input) =>
      request('POST', '/appointments/requests', input),
    scheduleAppointment: (input) => request('POST', '/appointments', input),
    respondToRequest: (id, answer) =>
      request('POST', `/appointments/${id}/answer`, answer),
    requestChange: (id, start, hostId) =>
      request('POST', `/appointments/${id}/change`, { start, hostId }),
    respondToChange: (id, accept, reply) =>
      request('POST', `/appointments/${id}/change/answer`, { accept, reply }),
    moveAppointment: (id, start, hostId) =>
      request('POST', `/appointments/${id}/move`, { start, hostId }),
    cancelAppointment: (id, reason) =>
      request('POST', `/appointments/${id}/cancel`, { reason }),
    updateAppointment: (id, patch) =>
      request('PATCH', `/appointments/${id}`, patch),
    addBlock: (block) => request('POST', '/booking/blocks', block),
    updateBlock: (id, patch) =>
      request('PATCH', `/booking/blocks/${id}`, patch),
    removeBlock: (id) => request('DELETE', `/booking/blocks/${id}`),

    listActivity: (limit = 50) =>
      request('GET', `/activity${query({ limit: String(limit) })}`),
    markActivityRead: (filter) =>
      request('POST', '/activity/read', filter ?? {}),

    // RLS filters Postgres changes by the signed-in user's access. A slow polling fallback
    // also catches changes if a websocket is temporarily unavailable or the tab resumes.
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1) startUpdates();
      return () => {
        listeners.delete(listener);
        if (!listeners.size) stopUpdates();
      };
    },
  };
}
let stopUpdates = () => {};
function startUpdates() {
  const channel = supabase.channel('portal-updates');
  for (const table of [
    'portal_profiles',
    'portal_messages',
    'portal_files',
    'portal_appointments',
    'portal_activity',
    'portal_inquiries',
  ])
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      notify,
    );
  channel.subscribe();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(() => {
    queueMicrotask(notify);
  });
  const refresh = () => {
    if (document.visibilityState === 'visible') notify();
  };
  const timer = window.setInterval(refresh, 30000);
  document.addEventListener('visibilitychange', refresh);
  stopUpdates = () => {
    void supabase.removeChannel(channel);
    subscription.unsubscribe();
    clearInterval(timer);
    document.removeEventListener('visibilitychange', refresh);
  };
}
