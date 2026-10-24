// The portal answered by the server. Each call is one endpoint of docs/PORTAL.md; the session is
// an HTTP-only cookie set by the server, so no token is ever kept in the browser. Not used until the
// backend is live (VITE_PORTAL_API=http).
import { PortalError, type PortalApi, type User } from './types';

const BASE = (import.meta.env.VITE_PORTAL_API_URL as string | undefined) ?? '/api';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers:
        body instanceof FormData || body === undefined
          ? undefined
          : { 'Content-Type': 'application/json' },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new PortalError('network');
  }
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new PortalError(
      payload.code ?? (response.status === 401 ? 'unauthenticated' : 'network'),
    );
  return payload as T;
}
const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][];
  return entries.length ? `?${new URLSearchParams(entries)}` : '';
};

export function createHttpApi(): PortalApi {
  return {
    mode: 'http',

    currentUser: () =>
      request<User | null>('GET', '/session').catch((e) =>
        e.code === 'unauthenticated' ? null : Promise.reject(e),
      ),
    signIn: (email, password) => request('POST', '/session', { email, password }),
    signUp: (input) => request('POST', '/accounts', input),
    signOut: () => request('DELETE', '/session'),
    requestPasswordReset: (email) => request('POST', '/password-resets', { email }),
    updateProfile: (patch) => request('PATCH', '/me', patch),
    changePassword: (current, next) => request('POST', '/me/password', { current, next }),

    listTeam: () => request('GET', '/team'),
    listClients: () => request('GET', '/clients'),
    getUser: (id) => request('GET', `/users/${id}`),
    setAccountStatus: (id, status) => request('PATCH', `/clients/${id}`, { status }),
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
    setInquiryStatus: (id, status) => request('PATCH', `/inquiries/${id}`, { status }),
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
      const { url } = await request<{ url: string }>('POST', `/files/${id}/download`);
      const response = await fetch(url);
      if (!response.ok) throw new PortalError('not_found');
      return response.blob();
    },
    deleteFile: (id) => request('DELETE', `/files/${id}`),
    keepFile: (id, kept) => request('PATCH', `/files/${id}`, { kept }),

    getRetention: () => request('GET', '/retention'),
    updateRetention: (patch) => request('PATCH', '/retention', patch),
    purgeNow: async () => (await request<{ count: number }>('POST', '/retention/purge')).count,

    getBookingConfig: () => request('GET', '/booking/config'),
    updateBookingConfig: (patch) => request('PATCH', '/booking/config', patch),
    availableSlots: (typeId, from, to, hostId, ignore) =>
      request('GET', `/booking/slots${query({ typeId, from, to, hostId, ignore })}`),
    listAppointments: (range) =>
      request('GET', `/appointments${query({ from: range?.from, to: range?.to })}`),
    requestAppointment: (input) => request('POST', '/appointments/requests', input),
    scheduleAppointment: (input) => request('POST', '/appointments', input),
    respondToRequest: (id, answer) => request('POST', `/appointments/${id}/answer`, answer),
    requestChange: (id, start, hostId) =>
      request('POST', `/appointments/${id}/change`, { start, hostId }),
    respondToChange: (id, accept, reply) =>
      request('POST', `/appointments/${id}/change/answer`, { accept, reply }),
    moveAppointment: (id, start, hostId) =>
      request('POST', `/appointments/${id}/move`, { start, hostId }),
    cancelAppointment: (id, reason) => request('POST', `/appointments/${id}/cancel`, { reason }),
    updateAppointment: (id, patch) => request('PATCH', `/appointments/${id}`, patch),
    addBlock: (block) => request('POST', '/booking/blocks', block),
    removeBlock: (id) => request('DELETE', `/booking/blocks/${id}`),

    listActivity: (limit = 50) => request('GET', `/activity${query({ limit: String(limit) })}`),
    markActivityRead: (filter) => request('POST', '/activity/read', filter ?? {}),

    // Server-sent events: the server announces any change concerning the user.
    subscribe(listener) {
      if (typeof EventSource === 'undefined') return () => {};
      const source = new EventSource(`${BASE}/events`, { withCredentials: true });
      source.onmessage = () => listener();
      return () => source.close();
    },
  };
}
