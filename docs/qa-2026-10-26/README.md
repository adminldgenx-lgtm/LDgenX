# Supabase integration verification — 26 October 2026

- Production build: 153 prerendered public pages plus the separate client/admin application.
- Public-page checks: HTML, SEO, French typography, 153 HTTP page loads, 95 redirects and a true 404 passed.
- Backend: Deno typecheck and eight domain/security tests passed.
- Live integration: 76 assertions passed against the deployed Supabase API, RLS, private Storage, file expiry, disabled-account access, messages, notifications and simultaneous reservations.
- Browser: independent client/admin sessions, attachments, bidirectional Realtime, persisted messages/session, all portal routes, password recovery and actual password update, public booking, public contact submission, desktop and mobile passed. See `browser-results.json`.
- Credential scan: no management token, service-role key or maintenance key in source/configuration tracked by Git or in production JavaScript.
- Cron: enabled every 15 minutes; observed scheduled requests returned HTTP 200 without timeout.
- Remote test accounts, conversations, files, appointments, inquiries and notification work were removed. The real administrator account remains; no email was sent.

The browser check exposed and helped resolve direct database connection exhaustion, implicit invitation/recovery callbacks, and expected revocation of old sessions after a password change. The Edge API now uses the Supavisor transaction pooler; the browser limits concurrent API calls and coalesces invalidations.

Email-provider delivery and the public site's Cloudflare deployment are deferred. Google authentication was not added.

Content audit follow-up: [26 October pre-production report](../PRE-PROD-REVIEW-2026-10-26.md). A later read-only Auth check found automatic email confirmation enabled and no custom SMTP provider; email delivery/verification is not production-approved. This does not change the earlier API/Storage/browser test results.

## Navbar account access follow-up — 26 October 2026

- The existing administrator password was set to the owner’s requested value and verified using real password authentication and the administrator API. The password was not saved in project files, and the superseded private setup-link artifact was removed.
- Public navbar: French/English sign-in link, checked user icon and signed-in indicator, role-correct portal entry, language transfer to login, persisted session, and updates after sign-in/sign-out in another tab.
- `npm run check:account-browser`: real temporary client and administrator accounts; 126 header layout checks (21 widths × two languages × signed-out/client/admin states); no runtime or production-CSP errors. Temporary accounts were deleted successfully.
- Build/typecheck, lint, all-page HTML/SEO, quantitative content checks and French typography passed after the change. The existing 306-route/viewport browser sweep above predates this navbar addition; the new responsive/session results are in [account-navbar-results.json](account-navbar-results.json).
- Visual captures: [signed-in desktop](account-client-desktop.png), [signed-in mobile](account-admin-mobile.png). No website deployment was performed.
