# Content management and booking with LDgenX — 30 October 2026

Administrators can add or change a cover from the content list or the editor, see thumbnails, and move any content to a recoverable trash. New expertises and applications use the design of their section. The title, introduction, cover and extra blocks of 64 existing French and English pages can be edited; their original sections and animations stay in place. Each language is separate, and nothing goes online until it is explicitly published.

Visitors and clients book with LDgenX, without choosing a person. Team assignment, availability and Google calendars stay internal. The navigation reads Ressources in French and Resources in English.

The handover guide is [PRISE-EN-MAIN-LDGENX-2026-10-30.md](PRISE-EN-MAIN-LDGENX-2026-10-30.md). Technical notes are in [EDITORIAL.md](EDITORIAL.md).

## Deployment

Production commit `6f147e7`, built on `1d27576`, deployed through Cloudflare Pages deployment `bd50f88b-1f51-45ff-810f-3271fab096d4`. Each commit was first built and verified on a Cloudflare preview. The backend changes had already been applied: migrations `20261030110000` and `20261030113000`, and Edge Function `editorial` version 13, whose page registry matches the repository.

## Corrections made before release

The work received at handover passed its static checks but had not been tested in a published state. Testing that state found the following, all corrected:

- A published edit on a page in one language crashed every page of the other language in the browser, leaving them blank. The footer read a language catalogue that had not been loaded.
- The Cloudflare build imported TypeScript directly into Node, which fails below Node 22.18.
- All 64 editable pages were rendered on every request, including those nobody had edited. They now pass through to the CDN byte for byte; only a published edit or a section with new content is rendered.
- Reading the index added 0.6 to 0.9 seconds to the first byte of those pages. An edge copy now answers at once and refreshes in the background.
- Requests shared in-flight fetches, which could hang if the visitor who started one disconnected.
- Withdrawing a page edit removed that page from the sitemap images and `llms-full.txt`.
- A homepage cover hid the hero's readability shade, house pictures printed an "LDgenX" credit, long homepage titles broke badly, and new expertises previewed without the public stylesheet.

## Verification

Local, on the released code: production build on Node 22.23 and 22.16, ESLint, typecheck, typography, 151 HTML pages, 147 indexable pages with no SEO error, content, media and assay checks, 13 editorial tests, 28 calendar and portal tests, 64 page templates, 151 page loads and 97 redirects, FR/EN client acceptance.

Published state, without touching production: `npm run check:editorial-published` runs the built worker in the real Cloudflare runtime against a local stand-in for the public API, then a real browser on desktop and mobile. Its 11 checks cover untouched pages, edits, withdrawals, new sections, both languages, and a failing or hanging backend.

Production, on `https://www.ldgenx.fr`:

- 58 untouched pages match the release build, apart from Cloudflare's Email Address Obfuscation, a zone setting that rewrites the address on the real domain.
- `npm run check:production-domain`: 151 pages, 148 indexable, 5 sitemaps, 97 legacy redirects, no error.
- Pages through the worker now answer as fast as pages that bypass it: 0.40 s against 0.41 s on average from the same machine, where it was 0.88 s against 0.55 s.
- 64 concurrent requests all answered 200. A real browser found no crash, console error, CSP violation or horizontal overflow on desktop or mobile.
- The admin journey passed with disposable accounts (`docs/content-management-qa/live`): roles and client isolation, private page drafts, real image upload, thumbnail, referenced-media protection, trash with cancellation and restoration, mobile FR/EN, and previews in the real page model under the production CSP.
- The booking flow, walked against live availability and stopped before submission, offers merged slots with no person selector, no staff name and no host in its requests.

A comparison with a snapshot taken before this work shows production content unchanged: 75 entries, 1 publication, the owner's article, 0 media, 4 profiles. All disposable accounts, drafts and test images were removed.

## Not verified

**A real publication of an existing page, or of an image, has not been run on production.** The controlled test (`LDGENX_QA_PUBLISH=1 node scripts/check-content-management.mjs https://www.ldgenx.fr`) was declined at the permission step because it changes a public page, so it needs the owner's decision. It would add a cover to `/en/about-us/partners` for under a minute, then restore the page and remove the fixture.

What stands in for it: publishing was tested in the real Cloudflare runtime with a local API, the database constraints accept page kinds and nested or empty paths, and the same publish route already served the owner's article. Copying an uploaded image to the public bucket has never run on production, because no image had been published before. The first real publication with a cover should be checked by eye.

## Known limits

- The text inside the original sections of existing pages cannot be edited; only the title, introduction, cover and added blocks.
- New expertises and applications appear in their section page, the site map and the sitemaps, but not automatically in the header menus.
- The first visitor after a publication may get the previous HTML for a moment, which the browser then updates. The next request gets the new page.

Account configuration is unchanged. Custom SMTP, the Search Console verification for Google branding, and calendar sharing still need the account holder; see the handover guide. One disposable administrator from an earlier test run remains in Auth (`cms-browser-7c5fd774@example.invalid`), owning no content.
