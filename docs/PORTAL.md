# Client portal and Supabase backend

The portal is a separate React application at `/espace` and `/admin`, built from `portal.html`. The public website stays prerendered. Both applications use the Supabase project `rkkvvqwgxbtnvewyrylj` in EU West (Ireland).

The previous browser-only implementation, fictitious accounts, sample messages, local file database, demo controls and reset buttons have been removed. Business data lives in Supabase; only the Auth session and the language preference are stored in the browser.

## Current status — rechecked 27 October 2026

Current launch verdict: [production readiness, 27 October](PRODUCTION-READINESS-2026-10-27.md). Email delivery/verification and the updated client CGV remain unfinished.

The later [client content/navigation changes](CLIENT-CHANGES-2026-10-27.md) are verified locally and await frontend publication. Their lighter navbar retains account access; client/admin routing and 138 responsive session states were checked against the live backend.

The [final review](FINAL-REVIEW-2026-10-27.md) supersedes that local navigation snapshot: direct overview links, a complete public footer directory and 150 navbar session/layout checks. The existing guest booking route is explicitly advertised without an account, carries `?lang=fr` or `?lang=en`, and has tested failure/retry behavior. Real contact submission, guest booking, client/admin journeys and 76 live API/security assertions passed; actual email delivery remains deferred.

- Database migrations applied to the live project; Row Level Security enabled on every portal table.
- `portal` Edge Function deployed and serving the real API.
- Private Storage bucket `portal-files`; 10 MB maximum per file. Message attachments: up to six, 20 MB combined.
- Authentication uses Supabase Auth with email/password. A read-only live recheck on 26 October found `mailer_autoconfirm: true` (addresses automatically confirmed), whereas the setup script specifies `false`. No live settings were changed during the content audit. Before full launch, configure email delivery, restore the intended verification setting and test the email-dependent journeys.
- Administrator: `admin.ldgenx@gmail.com`, active and assigned its role in the database. Password set at the owner’s explicit request and verified with real password authentication and the admin API on 26 October; no password is stored in project files. The superseded local setup-link artifact was removed.
- Production frontend and Auth Site URL: `https://www.ldgenx.fr`. The .fr/.com aliases redirect permanently to this origin, preserving paths and queries. Exact production Auth callback paths and explicit local/preview callbacks share the configuration in `supabase/functions/_shared/site.ts` and `origins.ts`. `PORTAL_SITE_URL` is aligned remotely and in the ignored administrative environment file.
- Automatic maintenance scheduled every 15 minutes, including expired file removal and notification processing.
- Public contact submissions reach the administration inbox; booking buttons point to `/espace/reserver`.
- Google authentication is intentionally deferred.
- **Email delivery is deferred at the owner's request.** Verification messages, invitations, password-reset emails and notification emails require a sender provider. They are not production-ready until it is configured. Pending notification records are retained in a private outbox; no email was sent during setup or tests.
- The Supabase backend and custom-domain frontend are live. Production-domain verification, including actual client/admin journeys and private-file/recovery/booking tests, is recorded in [PRODUCTION-DOMAIN-2026-10-29.md](PRODUCTION-DOMAIN-2026-10-29.md). OVH email settings, DNS mail records and Cloudflare email protection were left unchanged.

## Local use and administrator access

```sh
npm ci
npm run dev
```

Open `http://localhost:5173/espace` for clients and `/admin` for administration. Public booking is `/espace/reserver`.

The administrator password is already configured. For future recovery without email, this command generates the ignored file `admin-setup.local.html`. Its private, single-use link expires after one hour and returns to `PORTAL_SITE_URL`, which is the canonical production domain by default:

```sh
npm run supabase:admin-link
```

That command requires the administrative credentials in `.env.supabase.local`. It generates only a recovery link, without rerunning setup, altering Auth/email settings, sending an email or printing a token. After activation, sign in normally with the administrator email and the password you chose.

## Source map

| Component | Location |
| --- | --- |
| Portal routing and screens | `src/portal/PortalApp.tsx`, `pages/` |
| Auth, HTTP client and Realtime | `src/portal/api/http.ts`, `src/lib/supabase.ts` |
| Shared contract | `supabase/functions/_shared/types.ts` |
| Validated business operations | `supabase/functions/_shared/service.ts` |
| Shared availability, Paris time and retention calculations | `supabase/functions/_shared/{availability,time,retention}.ts` |
| Initial booking formats, team and retention settings | `supabase/functions/_shared/defaults.ts` |
| Verified HTTP router | `supabase/functions/portal/index.ts` |
| Transactional repository and private Storage access | `supabase/functions/portal/repository.ts` |
| Expiry, object cleanup, outbox delivery | `supabase/functions/portal/jobs.ts` |
| Database structure, permissions, lifecycle triggers, cron | `supabase/migrations/` |
| Administrative setup, deployment, activation and email setup | `scripts/*supabase*.mjs`, `scripts/admin-link.mjs` |

The frontend re-exports shared types and date calculations. The server recomputes availability when accepting a booking; a browser cannot bypass that check by modifying its request.

## Credentials and configuration

`.env.production` contains the project URL and **public publishable key**. These values are intentionally part of the browser application; they grant no administrative privileges. `.env.example` documents frontend configuration.

`.env.supabase.local` holds the management token, server key and maintenance key. It is ignored by Git and restricted to the file owner. The database password supplied during handoff was not stored or needed: migrations were applied through the authenticated Management API. No private value may be placed in a `VITE_` variable.

`.env.supabase.example` documents the private setup variables. `.env.local` can override frontend settings locally. The portal builds by default; `LDGENX_PORTAL=0` excludes its bundle and routes for a public-site-only build.

The Edge runtime uses its built-in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DB_URL`. The Edge database connection uses the project’s free Supavisor transaction pooler, with prepared statements disabled and at most one connection per worker. The browser limits concurrent API requests and coalesces Realtime invalidations. Custom secrets are `PORTAL_POOLER_HOST`, `PORTAL_POOLER_USER`, `PORTAL_JOB_SECRET`, `PORTAL_SITE_URL`, `PORTAL_ALLOWED_ORIGINS`, and later `RESEND_API_KEY` / `PORTAL_EMAIL_FROM`.

```sh
npm run supabase:setup  # apply unapplied migrations, seed missing settings, configure Auth/admin
npm run supabase:deploy # deploy the Edge Function through the Management API
```

Setup records migrations in `supabase_migrations.schema_migrations`. It preserves existing settings, accounts, administrator password and activation link. The first Auth configuration snapshot is kept locally in `supabase-auth-before.local`; it is never committed.

## Authentication and permissions

- Supabase Auth owns passwords, password hashing, refresh tokens, email verification and recovery links. There is no application password table.
- A database trigger creates a pending client profile after Auth signup. Role and status from user metadata are ignored. Only a trusted administrative operation can assign an administrator role.
- The Edge Function verifies bearer tokens with `auth.getUser`, then loads the current database role/status on every request. Disabling an account blocks API and Data API access even while its old token remains valid.
- Clients reach their own conversation, files, appointments and activity. Pending clients can write to the team while awaiting approval. Administrators manage clients, inquiries, schedules and settings.
- Profile updates allow only names, organisation, phone, language and notification preferences. Arbitrary role, email, ownership and status patches are ignored or rejected.
- Browser database roles have read grants and restrictive RLS policies; no direct write grants. Sensitive settings, reservations, limits, cron keys and email outbox have no browser read access.
- The Edge gateway's JWT check is disabled because public booking/contact and publishable keys must work. Authentication is explicitly enforced inside the function on each protected route. This is not an unauthenticated administration API.
- Browser access uses a strict CORS allowlist. Production CSP permits only the configured Supabase HTTPS and websocket origins in addition to the website itself.

The `/espace/nouveau-mot-de-passe` screen completes recovery and invitation links. Registration shows a confirmation notice when Auth requires email verification. Email-service errors are shown instead of a false success message. Login continuation paths are restricted to the user's own application area.

## Persistence and file lifecycle

Tables separate profiles, messages, files, inquiries, appointments, reservations, activity and settings. Each entity stores its typed API record in `data`, with indexed ownership columns and database consistency constraints. Profiles reference `auth.users` and client-owned records cascade with their profile.

All writes run in database transactions. Related scheduling changes share a transaction-level advisory lock. A GiST exclusion constraint on reservation ranges independently rejects overlapping appointments for the same host, including pending changes. Manual team scheduling can go outside opening hours; client and visitor requests must match a current free slot. Booking uses Europe/Paris, including daylight-saving transitions.

Files use random object names under `<client-id>/<file-id>`. Original filenames are metadata. The bucket has no browser upload/read policies. The API authorizes downloads before issuing a signed URL valid for 60 seconds and logging the download. Clients cannot delete team-uploaded files or change retention.

Unkept files expire at the first configured weekly deletion that satisfies their minimum age. Expired records disappear from lists and cannot receive new signed links immediately; the maintenance job removes their underlying objects within its 15-minute interval. Kept files have no expiry. A private cleanup queue retries failed object deletion. The administrator's explicit “purge now” removes all unkept files, as the UI confirmation states.

New objects are removed if an upload transaction fails. Deleting file metadata also queues Storage cleanup through a database trigger, including cascading account deletion. The current upload path is intended for documents and small analysis outputs; multi-gigabyte FASTQ/BAM delivery requires a separate large-file workflow.

## API

Base URL: `https://rkkvvqwgxbtnvewyrylj.supabase.co/functions/v1/portal`.

JSON requests use the public `apikey`; signed-in calls also carry `Authorization: Bearer <Auth access token>`. Public calls never carry a server key. Errors are JSON `{ "code": "..." }` and are translated by the interface.

| Routes | Scope |
| --- | --- |
| `GET /health` | service liveness |
| `GET /session`, `PATCH /me` | current profile |
| `GET /team`, `/clients`, `/users/:id`; `PATCH /clients/:id`; `POST /clients/invitations` | people, with role/ownership checks |
| `GET /threads`; `GET/POST /threads/:clientId/messages`; `POST /threads/:clientId/read` | conversation and multipart attachments |
| `GET/POST /inquiries`; `PATCH /inquiries/:id` | public submission, team inbox |
| `GET /files`; `POST /clients/:clientId/files`; `POST /files/:id/download`; `DELETE/PATCH /files/:id` | authorized private files |
| `GET/PATCH /retention`; `POST /retention/purge` | retention; team-only changes |
| `GET/PATCH /booking/config`; `GET /booking/slots`; `POST /booking/blocks`; `DELETE /booking/blocks/:id` | public sanitized configuration; team-only changes |
| `GET/POST /appointments`; `POST /appointments/requests` | owned/team listing and reservations |
| `POST /appointments/:id/{answer,change,change/answer,move,cancel}`; `PATCH /appointments/:id` | appointment lifecycle |
| `GET /activity`; `POST /activity/read` | audience-filtered activity |
| `POST /jobs` | scheduler-only, requires private job key |

Signup, signin, signout, password change and recovery use the Supabase Auth SDK, rather than custom session endpoints. Live updates use Supabase Postgres Changes filtered by RLS, with a 30-second visible-tab polling fallback. No SSE endpoint or cookie server is required.

Public mutation rate limits are persisted in Postgres: five contact submissions or eight booking mutations per hour per source address; authenticated mutations allow 120 per minute per account. Input validation limits field sizes, upload counts, query windows and scheduling settings. Logs contain error classifications, never request bodies, passwords, tokens or SQL text.

## Email, when enabled later

Supabase's default sender is restricted to project-team addresses and is not suitable for client delivery. See [Supabase SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp). The prepared integration supports [Resend's free plan](https://resend.com/pricing); no paid plan has been enabled.

1. Create a free Resend account and verify a sender domain through DNS.
2. Add the API key and a verified sender to `.env.supabase.local`:

   ```dotenv
   RESEND_API_KEY=re_replace-with-private-key
   PORTAL_EMAIL_FROM="LDgenX <notifications@ldgenx.fr>"
   ```

3. Run `npm run supabase:email`. This configures Auth SMTP and the Edge mail provider; it sends no test email.
4. Verify a real signup, invitation and password reset, then verify transactional delivery and provider logs.

The outbox retries transient delivery failures, uses an idempotency key, observes notification preferences, discards stale notification work after two days, and retains delivery metadata for at most 30 days. Auth emails go directly through configured SMTP. Existing notification preferences do not imply mail delivery is enabled.

## Validation

```sh
npm run typecheck
npm run check:backend
npm run test:portal
npm run lint
npm run build
npm run check:html
npm run check:seo
npm run check:typography
npm run preview
npm run check:http
npm run check:supabase
npm run check:portal-browser
```

The remote tests create confirmed test users through the admin API without sending email, verify authorization against the real Edge API, exercise RLS directly, check private Storage and cleanup, race concurrent reservations, and remove their test data. Browser tests use two isolated sessions and verify bidirectional Realtime, persistence, password recovery, public booking and the actual website form. Screenshots and browser results are in `docs/qa-2026-10-26/`.

## Cloudflare Pages

Use Node 22, build `npm run build`, output `dist`. Public Supabase configuration is already in `.env.production`; hosting variables can override it. `portal.html`, portal rewrites, noindex rules and Supabase-compatible CSP are generated automatically.

The production site serves `/espace` and `/admin` directly. Private rewrites target `/portal` without the `.html` extension, preventing Cloudflare's HTML normalization from redirecting away from the requested route. Production pages remain indexable; private routes and Pages previews are excluded. Run `npm run check:production-config` after building and `npm run check:production-domain` against the deployed site.

Email delivery and Google signup/signin remain deferred. Configure a sender and test email-dependent journeys before claiming delivery/verification is available; OVH mail is independent of the portal sender. Google sign-in and Calendar sync have not been enabled.

## Public navbar account button

The public header shows “Connexion” / “Sign in” without a session and “Mon compte” / “My account” with a checked user icon and green indicator when signed in. It listens to the same Supabase Auth session as the portal, including sign-in/sign-out in another tab. Auth is loaded in a browser effect so public prerendering remains safe. The `/espace` entry route resolves the current role on the server-backed portal session and sends the visitor to the appropriate client/admin area. The button carries the public page’s language into the login screen. Compact layouts keep the account control visible; the quote request stays available in the mobile menu and page content.

Run `npm run check:account-browser` against the local production preview to check real client/admin sessions, persistence, cross-tab login/logout, production CSP and responsive header bounds. This test uses temporary accounts and deletes them afterward.

## Origin configuration and the 26 October access fix

The failed browser used `http://127.0.0.1:5174`, while the original allowlist covered only 5173 and 4173. The current online frontend, `https://ldgenx-12k.pages.dev`, also needed an explicit entry. CORS and Auth callbacks now share `supabase/functions/_shared/origins.ts`: production domains, the current Pages address, and localhost/127.0.0.1 on ports 5173, 5174, 4173 and 4174. Unknown origins remain rejected; no wildcard CORS was introduced. `npm run check:portal-origins` checks live preflight/health responses, rejected origins, Auth callback coverage and the configured current site URL.

Administrator login is at `https://ldgenx-12k.pages.dev/admin/connexion`. In the Supabase dashboard, the administrator appears under Authentication → Users and in Table Editor → `public.portal_profiles`, with `role = admin` and `status = active`. Client and administrator identities share this profile table.

Set `PORTAL_SITE_URL` to the new allowed frontend origin before rerunning setup when switching the final domain. The setup script validates it and uses it for both Supabase Auth and the Edge runtime. The maintenance function uses the same configured URL for file-notification links.

## Workspace usability follow-up — 30 October 2026

Client administration displays actual all/pending/active/disabled counts, with filters that preserve the other query parameters. Name, organisation and email search accepts accents and full names. Disabling a client requires confirmation and preserves messages, files and appointments; the existing server and RLS checks still reject disabled sessions. This release adds no role or database permissions.

The client file screen separates received files from the client's own message attachments, with accent-insensitive filename/note search and newest-first ordering. It uses the same protected file listing and download API. Client and administrator file/appointment screens expose retry actions when reads fail. A missing retention configuration is reported as unavailable instead of being presented as retention disabled.

`node scripts/check-workspace-ux.mjs <origin>` checks real API and Data API isolation, fixture suspension/reactivation and a private scientific draft. File and unavailable-service views use synthetic browser fixtures. It sends no mail and creates no appointment or publication. The CLI-only JSON transport keeps credentials in pipes and does not blindly repeat writes. Disposable account creation can recover an ambiguous response by its unique fixture email.
