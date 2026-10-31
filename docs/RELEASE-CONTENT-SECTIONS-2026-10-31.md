# Content sections, authentic logo and image conversion

## What changed

- **One page per section** in the administration: Expertises, Applications, Case studies, Publications, Resources, plus other pages and the trash.
- **Published content goes through the site's templates.** Before, publishing a built-in item swapped its designed page for a generic document, and new items appeared as separate generic cards. Published rows now apply to the catalogue itself (`src/editorial/overlay.ts`), so pages, lists, menus and structured data share one source.
- **Forms built from each template**, opening on the site's current text for built-in items. Expertises and applications are fully editable, which they were not before.
- **Authentic logo.** `logos/authentic/ldgenx-logo.svg` is traced from the client's `logos/correct logo/logo_ldgenx.png`: of its 49,415 coloured pixels, 95.8 % are identical and all but one of the rest lie within one source pixel. The AI-altered lockups, symbols and wordmarks are gone, and all social cards were rebuilt. `scripts/build-brand.mjs` derives the site's files. `logo_IA_LDgenX.png` was not used: it is cleaner but its wordmark and tagline proportions differ from the original.
- **Images.** WebP in four sizes plus a social JPEG, on every browser. Safari could not upload images at all before this release.
- **Favicon for Google**, **SEO wording**, and **IndexNow on publication**: see `docs/SEO-GEO.md`.

## Problems found and fixed

| Problem | Effect | Fix |
|---|---|---|
| Publishing a built-in item replaced its template | Design and animations lost | Catalogue overlay |
| Safari cannot encode WebP | Image upload failed on Mac and iPhone | WebAssembly encoder, admin only |
| Articles, studies and publications had no outage fallback | 503 on every one of them while Supabase was down | Edge copy, then CDN |
| Those pages were rendered on every request | CPU limit risk, slower pages | CDN until changed; renders kept at the edge |
| Fixed scenes assumed every built-in item exists | A blank page if an item was taken offline | Every lookup guarded; `check:editorial-templates` proves it for each item |
| The atlas paired places and sectors by position | Wrong labels after any change to the list | Paired by id |
| A second article with the same title | Refused with an error | The address is numbered |
| Image credit required by the form | Against the project's no-credit rule | Optional, and off the form |
| `/favicon.ico` 404, 32 px icon only | Google shows a generic icon | 48, 96 and 192 px icons |
| `.com/team` | 404 | Redirect |

## Verified

Run on 2026-10-31, on the built site:

- `check:html`: 151 pages. `check:seo`: 147 indexable pages, 0 errors. Lint, types and typography clean.
- `check:editorial`: 15 unit tests, backend types.
- `check:editorial-templates`: all 102 built-in items, published unchanged, give byte-identical page content; every new kind lands in its template and list; every item can be taken offline with the other pages intact.
- `check:editorial-published`: 13 checks in the real Cloudflare runtime and a real browser, with the backend failing and hanging.
- `check:admin-local`: 10 checks in Chrome and in Safari's engine, including WebP files produced there under the real security policy.
- `check:secrets --history`: no credentials in any of the 28 commits. Row-level security is on for all 13 public tables.

## Deployment order

1. `node scripts/setup-editorial.mjs` allows JPEG in the two editorial buckets.
2. `node scripts/deploy-editorial.mjs` deploys the API. Compatible with the live site.
3. Push to `main`.
4. `LDGENX_QA_PUBLISH=1 LDGENX_WEBKIT_MODULE=<playwright> node scripts/check-content-management.mjs https://www.ldgenx.fr`.
5. `node scripts/indexnow.mjs` announces the changed pages.

## For the account holder

- **Cloudflare, zone `ldgenx.com`:** set the redirect target to `concat("https://www.ldgenx.fr/en", http.request.uri.path)`, status 301, query string kept. Old English addresses currently land on French pages.
- **Search Console:** delete the `.com` sitemap, then use *Change of address* from `ldgenx.com` to `ldgenx.fr`.
