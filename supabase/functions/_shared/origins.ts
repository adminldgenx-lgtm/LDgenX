// Shared by remote setup and the Edge Function so local preview ports cannot drift apart.
export const portalOrigins = [
  'https://www.ldgenx.fr',
  'https://ldgenx.fr',
  'https://ldgenx-12k.pages.dev',
  ...['localhost', '127.0.0.1'].flatMap((host) =>
    [5173, 5174, 4173, 4174].map((port) => `http://${host}:${port}`),
  ),
];
export const portalAuthRedirects = portalOrigins.map((origin) => `${origin}/espace/**`);
