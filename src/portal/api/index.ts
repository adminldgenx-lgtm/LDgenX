// Which backend answers the portal: the in-browser demo until the server is live. Switching is
// one build variable, VITE_PORTAL_API=http (and VITE_PORTAL_API_URL if the API is elsewhere).
import { createHttpApi } from './http';
import { createMockApi } from './mock';
import type { PortalApi } from './types';

export const api: PortalApi =
  import.meta.env.VITE_PORTAL_API === 'http' ? createHttpApi() : createMockApi();
export * from './types';
