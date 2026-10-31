import { readFile, writeFile } from "node:fs/promises";
import { build, loadEnv } from "vite";

// Read as data: this runs during the Cloudflare build, whose Node may not import TypeScript.
const registry = await readFile(
  "supabase/functions/_shared/editorial-pages.ts",
  "utf8",
);
const editablePaths = JSON.parse(
  registry.slice(registry.indexOf("["), registry.lastIndexOf("]") + 1),
).map((p) => p.path);
const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const templates = JSON.parse(
  await readFile(".prerender/editorial-templates.json", "utf8"),
);
const dates = JSON.parse(await readFile("data/lastmod.json", "utf8"));
const headers = await readFile("dist/_headers", "utf8");
const security = {};
// The first block is terminated by the next unindented rule, not necessarily a blank line.
for (const line of headers.split("\n").slice(1)) {
  if (!line.startsWith("  ")) break;
  const colon = line.indexOf(":");
  security[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
}
const files = {};
for (const file of [
  "sitemap.xml",
  "sitemaps/pages.xml",
  "sitemaps/expertises.xml",
  "sitemaps/etudes.xml",
  "sitemaps/recherche.xml",
  "sitemaps/ressources.xml",
  "llms.txt",
  "llms-full.txt",
])
  files[file] = await readFile(`dist/${file}`, "utf8");
await build({
  configFile: false,
  // The worker is code only: public files are already in dist.
  publicDir: false,
  define: {
    "process.env.NODE_ENV": '"production"',
    __EDITORIAL_RUNTIME__: JSON.stringify({
      build: Date.now().toString(36),
      templates,
      dates,
      security,
      files,
    }),
    __EDITORIAL_SUPABASE__: JSON.stringify({
      url: env.VITE_SUPABASE_URL,
      key: env.VITE_SUPABASE_PUBLISHABLE_KEY,
    }),
  },
  ssr: {
    noExternal: true,
    target: "webworker",
    resolve: { conditions: ["workerd", "worker", "browser"] },
  },
  build: {
    ssr: "src/entry-editorial-worker.ts",
    outDir: "dist/_worker.js",
    emptyOutDir: true,
    target: "es2022",
    minify: true,
    rollupOptions: {
      output: { entryFileNames: "index.js", inlineDynamicImports: true },
    },
  },
});
await writeFile(
  "dist/_routes.json",
  JSON.stringify(
    {
      version: 1,
      include: [
        ...new Set([
          ...editablePaths,
          "/services*",
          "/applications*",
          "/en/services*",
          "/en/applications*",
          "/ressources*",
          "/etudes-de-cas*",
          "/recherche*",
          "/en/resources*",
          "/en/case-studies*",
          "/en/research*",
          "/plan-du-site",
          "/en/site-map",
          "/sitemap.xml",
          "/sitemaps/*",
          "/llms.txt",
          "/llms-full.txt",
          "/api/editorial/*",
          "/api/auth/google/callback",
          "/media/*",
        ]),
      ],
      exclude: [],
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "Editorial Pages renderer built; unrelated pages, portal and static assets bypass Functions.",
);
