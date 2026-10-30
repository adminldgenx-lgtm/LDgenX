// One public address for metadata, Auth callbacks and links sent by the backend.
// Keep local/preview origins explicit; never accept an arbitrary redirect destination.
export const productionOrigin = "https://www.ldgenx.fr";
export const productionAliases = [
  "https://ldgenx.fr",
  "https://ldgenx.com",
  "https://www.ldgenx.com",
];
export const previewOrigin = "https://ldgenx-12k.pages.dev";
export const localOrigins = ["localhost", "127.0.0.1"].flatMap((host) =>
  [5173, 5174, 4173, 4174].map((port) => `http://${host}:${port}`),
);

export function portalSiteOrigin(origin = productionOrigin) {
  const normalized = origin.replace(/\/+$/, "");
  return [previewOrigin, ...localOrigins].includes(normalized)
    ? normalized
    : productionOrigin;
}
