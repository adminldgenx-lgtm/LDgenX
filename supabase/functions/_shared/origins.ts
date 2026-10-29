import {
  productionOrigin,
  productionAliases,
  previewOrigin,
  localOrigins,
} from "./site.ts";

// Shared by remote setup and the Edge Function so local preview ports cannot drift apart.
export const portalOrigins = [
  productionOrigin,
  ...productionAliases,
  previewOrigin,
  ...localOrigins,
];
export const portalAuthRedirects = [
  ...[productionOrigin, ...productionAliases, previewOrigin].flatMap((origin) =>
    ["/espace/connexion", "/espace/nouveau-mot-de-passe"].map(
      (path) => `${origin}${path}`,
    ),
  ),
  ...localOrigins.map((origin) => `${origin}/espace/**`),
];
