# Editorial system and Google identity — 29 October 2026

Implemented a Supabase-backed scientific editor for articles/guides, case studies and publication summaries, with private drafts/previews, explicit review/publication, stable URLs, linked FR/EN versions, guarded media deletion, withdrawal and bounded revision history. The existing 74 bilingual documents are private working copies; their validated public baseline remains unchanged until explicitly published or withdrawn. Scientific charts, maps, original source text and figure credits are retained.

Images are converted/resized to responsive WebP before upload. Short MP4/WebM uploads and click-to-load YouTube/Vimeo are supported. Private/public copies count against a 250 MB editorial budget with a 900 MB whole-project ceiling. No paid services or image transformations were enabled.

A selective Cloudflare Pages renderer supplies real HTML, metadata, listings, search, footer directory, discovery files and sitemaps for new/edited content. Drafts and signed URLs are never included in public responses. Existing portal rewrites and canonical domain settings remain in place.

Google basic identity is configured using the supplied client. The owner confirmed adding Supabase's callback. Login and registration offer the button in both languages; scopes are limited to basic identity. New accounts remain pending clients and cannot self-assign roles. Account linking with a real Google administrator still requires the owner to complete Google login/consent. Google Calendar synchronization is a separate permission and is not claimed as active.

Verification:

- Production build/typecheck and ESLint pass. Node 22 is the deployment runtime.
- Eight shared-schema/media tests and bilingual scientific-rendering checks pass. Table spans, paper authors/DOI/year and summary dates are preserved distinctly.
- 44 live editorial API checks pass, including six simultaneous reads, RLS/draft privacy, optimistic conflicts, private/public media, immutable publication snapshots, restoration and withdrawal.
- Ten browser flows pass on desktop/mobile, including actual PNG → three WebP sizes (2400 px maximum), image aspect ratio and inline rendering, short MP4 upload/playback, external-player privacy, real workerd SSR/canonical, resource search/sitemap, private later edits and HTTP 410 withdrawal. No browser exceptions. Own fixtures removed.
- Existing portal: 76 live API/RLS/storage/booking assertions plus real client/admin browser authentication, persistent messages, private attachment, bidirectional Realtime, recovery, booking, contact form and responsive routes pass.
- Google browser handoff/cancellation checks pass in FR/EN; they stop before a real Google account grant.
- Public site: 151 rendered pages, 147 indexable pages, metadata/headings/JSON-LD, 22,719 local link occurrences, 1,057 image occurrences, 28 publisher-verified publications, case-study totals and source/licence checks pass. Existing client acceptance and four FR/EN mobile/desktop journeys pass.

Tests exposed and fixed duplicate login navigation, image fallback/layout issues, figure replacement when inserting another media block, and shared database connections stranding simultaneous serverless requests. Both Edge functions now isolate and close request connections; no booking/business rules were relaxed.

OVH mail, email DNS records, SMTP and Cloudflare email protection were not changed. Credentials remain in ignored server configuration; only public configuration and feature flags enter browser builds.
