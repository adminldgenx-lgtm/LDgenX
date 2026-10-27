# LDgenX — production readiness, 27 October 2026

**Verdict: the current Pages deployment is working, but full customer-facing production launch is not approved yet.** Email-dependent account journeys and the client terms of sale still need completion. Passing the checks below does not establish that the project has zero defects.

Later on 27 October, the client's content/navigation changes were implemented and verified locally. That newer build has 151 public pages and 97 redirects; it is not yet published to Pages. Its scope and current evidence are in [the client-change review](CLIENT-CHANGES-2026-10-27.md). The deployment checks and counts below describe the earlier version assessed in this readiness review.

## Current deployment

Frontend: `https://ldgenx-12k.pages.dev`. Supabase project: `rkkvvqwgxbtnvewyrylj`. The administrator profile is active with the administrator role. Auth and server-generated account links use the current Pages address. Local ports 5173/5174 and 4173/4174, the Pages address and the future final domains are explicitly allowed; unknown origins remain rejected.

## Fresh checks

| Check | 27 October result |
| --- | --- |
| Build and TypeScript | Passed; 153 public pages, 95 redirects and 404 output |
| Backend typecheck | Passed |
| Backend domain/security tests | Eight passed |
| ESLint | Passed |
| HTML | Passed; unique metadata, headings, structured data, 13,081 internal links and 1,081 image references |
| SEO | 149 indexable pages; zero reported errors/warnings |
| Content | Bilingual structure/numeric parity, 28 cached publisher-verified publication records, case-study totals and figure licences passed |
| Typography, assay provenance and active media | Passed; 22 source/published assay targets |
| Live backend | Supabase ACTIVE_HEALTHY; portal ACTIVE; administrator profile active |
| Live origins and Auth callbacks | 32 requests passed; 11 approved origins and five rejected origins; current Auth URL matches Pages |
| Live public/admin/signup/terms documents | HTTP 200 over HTTPS; CSP, nosniff and DENY framing headers present |
| npm production dependencies | Zero known advisories reported by the registry audit |
| npm complete installed dependency tree | Zero known advisories reported by the registry audit |

The live administrator browser recheck covers actual password login, all admin sections and both message tabs with data loaded, and navbar routing. Its output is [admin-live-results.json](qa-2026-10-27/admin-live-results.json). This is a functional smoke test; it does not independently certify every possible user journey or device.

Evidence: [production dependency audit](qa-2026-10-27/npm-production-audit.json), [complete dependency audit](qa-2026-10-27/npm-full-audit.json), [live origin checks](qa-2026-10-26/portal-origins-results.json). The broader 76-assertion API/RLS/Storage/concurrency checks and desktop/mobile browser checks from 26 October remain documented in [backend QA](qa-2026-10-26/README.md); they were not all rerun today.

## Known work before full launch

1. **Email and identity verification.** The live project still has no custom SMTP provider or configured transactional sender. Signup email addresses are automatically confirmed (`mailer_autoconfirm: true`). Email was deferred by the owner; it is an intentional unfinished feature. Configure the selected provider, restore the intended verification requirement and verify actual receipt and valid links for signup verification, invitations, password recovery and notifications. Current in-portal records working does not establish email delivery.
2. **Client terms of sale (CGV).** The source still contains the previously documented spelling problems, outdated references and ambiguity in the liability wording. The supplied client contract remains reproduced rather than silently rewritten. The concrete corrections and proposed clause wording are in [CGV-REVIEW.md](preprod-2026-10-26/CGV-REVIEW.md). LDgenX needs to validate an updated contract before replacement.

The portrait/publication/UNIMA permissions and maximum three-year message-retention policy were already confirmed by the owner. They are not reopened as pending approvals. Google sign-in remains a later enhancement, as requested, and is not a requirement for the current email/password implementation.

## Final-domain switch

The owner plans to move to `www.ldgenx.fr` after setup is complete. Before switching, set the current `PORTAL_SITE_URL` to the final allowed origin and check the actual DNS/TLS, canonical/apex redirects, headers, old paths and Auth/account callbacks from that domain. The current working Pages deployment is the environment assessed here.

No email was sent, password changed, contract rewritten, domain switched or frontend deployment triggered during this review.
