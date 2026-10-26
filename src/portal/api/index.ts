import { createHttpApi } from './http';
import type { PortalApi } from './types';

export const api: PortalApi = createHttpApi();
export * from './types';
