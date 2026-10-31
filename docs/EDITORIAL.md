# LDgenX scientific publishing

The administrator edits content at **https://www.ldgenx.fr/admin/contenus**. The same account and role checks protect the existing client portal and the editorial interface. The media library is at `/admin/medias`.

## Daily use

`/admin/contenus` lists the sections of the site, each with its own page (`/admin/contenus/rubrique/<section>`): Expertises, Applications, Case studies, Publications and Resources. `/admin/contenus/pages` holds the other pages and `/admin/contenus/corbeille` the trash. The client guide is `docs/PRISE-EN-MAIN-LDGENX-2026-10-30.md`.

**The rule of this system: a published item goes through the site's own templates.** Its fields are named like the catalogue's (`templateFields` in `supabase/functions/_shared/editorial.ts`), and `src/editorial/overlay.ts` applies published rows to the catalogue itself. Every template, list, menu and structured-data block therefore reads one source, so an edit cannot change a page's design, and a new item lands in the same cards. Never add a separate layout for published content.

- A built-in item has no database row of its own until it is first opened. Until it has saved fields, the editor fills the form from the catalogue (`src/editorial/legacy.ts`), so it always opens on what the site shows.
- The working copies imported on 29 October remain in the database and are treated the same way. They are unused until edited.
- `/public/index` carries only the fields other pages show (`cardFields`). The rest travels with the document of that page.
- New items have the id `cms:<slug>`, which `routesFor` turns back into an address.
- A new item needs its picture: every template but publications shows one, and its cards need it.

The URL is stable after publication and for built-in pages. A new document derives its URL from its title, numbered if that address is taken or was used before; an explicit slug can be chosen before publication. The FR/EN button opens the other language's working copy.

If another administrator saves the same document, the older editor receives a conflict instead of silently overwriting the newer work. Export the local text before reloading to compare.

## Images, video and free-plan budgets

The browser converts JPEG/PNG/WebP/AVIF sources before uploading; originals never leave the computer, and their location and camera data are dropped. Sources are capped at 20 MB and 40 megapixels, with no upscaling and a longest side of 2400 pixels. Each image yields WebP at 480, 960 and 1600 px and its full size, plus a 1200 × 630 JPEG for social networks (`optimizeImage` in `src/portal/editorial/media.ts`). Quality starts at 0.82 for photographs and 0.92 for PNG figures, and steps down to fit about 420 bytes per pixel of width.

Safari cannot write WebP from a canvas (tested in its engine on 2026-10-31: it returns PNG), so it uses the `@jsquash/webp` WebAssembly encoder, loaded only there. That is why `/admin/*` alone allows `wasm-unsafe-eval` in its security policy.

Published pictures are served from `https://www.ldgenx.fr/media/<id>/<file>`: the worker fetches them once from the public bucket and keeps them at the edge for a year. File names are never reused, so this is safe.

Short uploaded videos are MP4/WebM, at most 20 MB; the interface checks a duration of at most 3 minutes. No automatic video transcoding is promised. For longer videos, use a public YouTube or Vimeo URL: the allowlisted external player is loaded only after the visitor clicks. Uploaded video uses native controls and `preload="none"`; there is no autoplay. Add captions/descriptions and a transcript where needed.

Draft media live in a private bucket with expiring admin preview links. Publishing copies the referenced immutable files into a separate public bucket. Both copies count against the **250 MB editorial budget**, with a **900 MB project-wide storage ceiling** that reserves headroom for the portal. The budget meter reports real storage usage. Files used by drafts, publications or retained history cannot be deleted. Interrupted imports older than an hour can be cleaned from the library without deleting ready media. Exact duplicate uploads are reused.

These application safeguards reduce storage and bandwidth; they do not make the provider quotas unlimited. Supabase's free plan and Cloudflare's free dynamic-request allowance still apply, especially to popular videos. The code does not enable paid image transformations, paid plans or paid services. Monitor the providers' usage dashboards as traffic grows.

## Architecture and maintenance

- Additive migration: `supabase/migrations/20261029120000_editorial.sql`. Tables: `cms_entries` (draft), `cms_publications` (public snapshot/withdrawal), `cms_media`, `cms_media_links`, `cms_revisions`. RLS prevents visitors/clients from reading drafts and prevents direct browser writes. No HTML or arbitrary iframe/script is accepted as article content.
- Separate `editorial` Supabase Edge Function verifies the Auth token and the active administrator profile on every protected operation. It shares the existing explicit origin allowlist. The legacy `portal` function, client files and messaging tables remain separate.
- `editorial-drafts` is private; `editorial-public` is public. Media IDs and paths are immutable. Only the verified backend mutates storage. Shared write locks enforce storage reservation and optimistic document versions.
- `scripts/prepare-editorial.mjs` generates the asset and route allowlists and the editable page registry. `scripts/setup-editorial.mjs` applies the editorial migrations.
- Cloudflare Pages builds a selective `_worker.js` renderer and `_routes.json`. Editorial paths, discovery files and a public read API use the worker; unrelated public pages, portal routes and static assets bypass it. Only public Supabase configuration is bundled. Drafts and signed preview links never enter the public HTML bootstrap. Public data is cached for 15 seconds per isolate. Backend failures return 503/noindex instead of a false missing-page result.
- The account menu's browser-only Auth import is excluded from the SSR worker. Each request gets its own editorial context; one visitor's document cannot become another visitor's draft.
- A page stays on the CDN, byte for byte, until a publication changes it or its section listing. The worker reads an edge copy of the public index and refreshes it in the background, so no visitor waits for Supabase. A rendered page is kept at the edge until the published content or the build changes.
- With the backend down, everything that exists on the CDN keeps answering, and published edits keep their last copy.
- A publication, withdrawal or deletion notifies IndexNow (Bing, and the engines it feeds) with the page and its section. Disposable test accounts are skipped. Google has no equivalent: it reads the sitemap, whose `lastmod` is the real date of the change.
- OVH email, DNS, SMTP, Cloudflare email protection, Google login and Calendar are outside this change.

Use Node 22 for production builds. Local setup/checks:

```sh
npm ci
npm run build
node scripts/prepare-editorial.mjs
npm run check:editorial              # unit tests and backend types
npm run check:editorial-templates    # every built-in item publishes to the identical page
npm run check:editorial-published    # the built worker in the real Cloudflare runtime
npm run check:admin-local            # the whole administration, nothing leaves the machine
npm run check:secrets -- --history   # before pushing: the repository is public
```

`check:admin-local` runs on Node 22.18 or later. `LDGENX_WEBKIT_MODULE=<a Playwright package with WebKit>` adds an upload in Safari's engine.

Deployment: `node scripts/setup-editorial.mjs`, `node scripts/deploy-editorial.mjs`, then the push. The API goes first: the admin needs it, and the live site is unaffected by the change.

`node scripts/check-content-management.mjs <origin>` runs the admin journey on the real backend with disposable accounts. `LDGENX_QA_PUBLISH=1` adds a real publication of a disposable article and of a page image, checked as visitors and search engines see them, then removed.
