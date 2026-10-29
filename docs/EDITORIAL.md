# LDgenX scientific publishing

The administrator edits content at **https://www.ldgenx.fr/admin/contenus**. The same account and role checks protect the existing client portal and the editorial interface. The media library is at `/admin/medias`.

## Daily use

1. Choose **Nouveau contenu** and select an article/guide, a case study or a scientific publication, in French or English. Existing material is already available as a working copy: 3 guides, 6 cases and 28 scientific summaries in each language (74 documents).
2. Write the title, introduction, category and authors. Use italics for scientific names, subscript/superscript for notation, headings, lists and tables. Titles support `*Latin names*`. Add a DOI, journal and publication year for scientific publication summaries.
3. Add a cover or figures through the media library. Fill alternative text, captions and rights-holder credits; add licence/source links where relevant. Reuse existing uploaded media instead of uploading duplicates. Validate that labels and scales in scientific figures remain legible after optimisation.
4. Add source references and explicitly distinguish methods, results, interpretation and limitations. Imported summaries retain the validated source wording, author lists, licences, DOI and original figure captions. Their working copies require a new review before publication. Imported case studies keep the previously validated interactive data/maps and detailed report figures as an identified evidence block.
5. **Enregistrer** saves the private draft. **Aperçu** displays the draft and its private media. Saving a published document does not change the public snapshot. Unsaved edits have a browser-local recovery copy and can be exported as JSON. Save before leaving or changing devices; the local copy is not a server backup.
6. Check the scientific review/rights statement, then **Publier**. The same action updates the actual HTML page, listing/search, footer directory, canonical/Open Graph metadata, language links and XML sitemaps. Allow roughly 30 seconds for caches to refresh. No developer rebuild is needed for editorial publication.
7. **Historique** restores a saved revision into the draft; it never publishes it automatically. Up to 10 revisions per document are retained, within a 20 MB aggregate history budget. Old history is trimmed before current drafts or public snapshots.
8. **Retirer du site** removes the article from listings/discovery and returns HTTP 410 at its address, while retaining its private working copy and history. Previously published media remain public until unused and deleted from the library. This is not a confidential-document revocation system. A draft that has never been published can be deleted permanently; its media remain available for reuse.

The URL is stable after publication and for imported pages. A new document initially derives its URL from its title; an explicit custom slug can be chosen before publication. The FR/EN version button opens or creates a linked translation. Scientific translations are written and reviewed independently; they are not generated automatically.

If another administrator saves the same document, the older editor receives a conflict instead of silently overwriting the newer work. Export the local text before reloading to compare.

## Images, video and free-plan budgets

The browser converts JPEG/PNG/WebP/AVIF sources to WebP before uploading. Sources are capped at 20 MB and 40 megapixels. No upscaling; the longest side is capped at 2400 pixels. Up to three responsive sizes (480, 960, largest, where useful) are stored. The API independently verifies WebP headers/dimensions, file sizes and allowed media types. Image variants total at most 4 MB, each at most 1.8 MB. Canvas conversion strips source metadata; no source originals are retained in Supabase. Compression is suitable for web display, not archival scientific originals.

Short uploaded videos are MP4/WebM, at most 20 MB; the interface checks a duration of at most 3 minutes. No automatic video transcoding is promised. For longer videos, use a public YouTube or Vimeo URL: the allowlisted external player is loaded only after the visitor clicks. Uploaded video uses native controls and `preload="none"`; there is no autoplay. Add captions/descriptions and a transcript where needed.

Draft media live in a private bucket with expiring admin preview links. Publishing copies the referenced immutable files into a separate public bucket. Both copies count against the **250 MB editorial budget**, with a **900 MB project-wide storage ceiling** that reserves headroom for the portal. The budget meter reports real storage usage. Files used by drafts, publications or retained history cannot be deleted. Interrupted imports older than an hour can be cleaned from the library without deleting ready media. Exact duplicate uploads are reused.

These application safeguards reduce storage and bandwidth; they do not make the provider quotas unlimited. Supabase's free plan and Cloudflare's free dynamic-request allowance still apply, especially to popular videos. The code does not enable paid image transformations, paid plans or paid services. Monitor the providers' usage dashboards as traffic grows.

## Architecture and maintenance

- Additive migration: `supabase/migrations/20261029120000_editorial.sql`. Tables: `cms_entries` (draft), `cms_publications` (public snapshot/withdrawal), `cms_media`, `cms_media_links`, `cms_revisions`. RLS prevents visitors/clients from reading drafts and prevents direct browser writes. No HTML or arbitrary iframe/script is accepted as article content.
- Separate `editorial` Supabase Edge Function verifies the Auth token and the active administrator profile on every protected operation. It shares the existing explicit origin allowlist. The legacy `portal` function, client files and messaging tables remain separate.
- `editorial-drafts` is private; `editorial-public` is public. Media IDs and paths are immutable. Only the verified backend mutates storage. Shared write locks enforce storage reservation and optimistic document versions.
- `scripts/prepare-editorial.mjs` generates an asset/route allowlist and a bilingual import from the checked catalogues. `scripts/setup-editorial.mjs` applies only this migration and inserts missing imports, without overwriting existing edits or changing Auth/email settings. It never publishes imported material.
- Cloudflare Pages builds a selective `_worker.js` renderer and `_routes.json`. Editorial paths, discovery files and a public read API use the worker; unrelated public pages, portal routes and static assets bypass it. Only public Supabase configuration is bundled. Drafts and signed preview links never enter the public HTML bootstrap. Public data is cached for 15 seconds per isolate. Backend failures return 503/noindex instead of a false missing-page result.
- The account menu's browser-only Auth import is excluded from the SSR worker. Each request gets its own editorial context; one visitor's document cannot become another visitor's draft.
- Existing static pages remain the public baseline until explicitly replaced or withdrawn. Existing chart/map values are not rewritten by the CMS migration. Resources and all other public pages remain in the directory.
- OVH email, DNS, SMTP, Cloudflare email protection, Google login and Calendar are outside this change.

Use Node 22 for production builds. Local setup/checks:

```sh
npm ci
npm run build
node scripts/prepare-editorial.mjs
npm run check:editorial
node scripts/setup-editorial.mjs
node scripts/deploy-editorial.mjs
node scripts/check-editorial-api.mjs
npx wrangler pages dev dist --port 4187 --ip 127.0.0.1 --compatibility-date 2026-10-23
node scripts/check-editorial-browser.mjs http://127.0.0.1:4174 http://127.0.0.1:4187
```

The browser journey uses a Vite production preview on 4174 for admin CORS and workerd on 4187 for public rendering. **Stop workerd before rebuilding `dist`** to avoid its watcher processing an incomplete output directory. Remote tests create isolated, confirmed QA accounts without sending emails, and remove only their own entries/media/accounts afterward. Credentials remain in ignored local configuration; no management/service key is included in public bundles.

The public rendering distinguishes a publication summary authored by LDgenX from the original paper's authors, journal, DOI and year. The website update date is explicitly the summary update date. Structured data links the summary to the underlying `ScholarlyArticle`; it does not re-date the paper. Merged scientific table cells retain their row/column spans. Figures open at their full stored resolution.

The editorial and portal functions use a separate short-lived database client per HTTP request. This prevents concurrent requests from being stranded when a serverless request ends. Live checks include six simultaneous editorial reads in addition to role, storage and publishing checks.
