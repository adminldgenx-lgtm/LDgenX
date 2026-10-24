# Client area and administration

The client area (`/espace`), the administration (`/admin`) and public booking (`/espace/reserver`) form one application, separate from the public site. This version covers four things:

- **Messages:** one conversation per client with the whole team, with attachments.
- **Files:** the team drops files for a client, who downloads them; a weekly deletion clears them.
- **Appointments:** requests from clients and visitors, the team's answers, changes, and the team's calendar.
- **Website messages:** what the public site's contact form sends, in the team's inbox.

Project tracking, quotes and internal notes (the "CRM" part) are planned for later and are not part of this version.

All the screens are built. Until the backend exists, they run in **demo mode**: the data lives in the visitor's browser. This document is the contract the backend must fulfil, and the steps to switch it on.

## Where it lives

| What                         | Where                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Entry page                   | `portal.html` (built as a second page, with its own bundle: the public site never loads the portal's code)                         |
| Code                         | `src/portal/`                                                                                                                      |
| Data model and API contract  | `src/portal/api/types.ts` (`PortalApi`)                                                                                            |
| Demo backend                 | `src/portal/api/mock.ts`, `seed.ts`, `blobs.ts`                                                                                    |
| Live backend client          | `src/portal/api/http.ts`                                                                                                           |
| Rules shared with the server | `src/portal/lib/availability.ts` (free times), `retention.ts` (weekly deletion), `time.ts` (Paris time), `ics.ts` (calendar files) |
| Interface text               | `src/portal/i18n/fr.ts`, `en.ts` (the compiler checks that both have the same keys)                                                |
| Styles                       | `src/portal/portal.css`                                                                                                            |

Every address under `/espace` and `/admin` is served `portal.html`:

- in development and preview, by the `ldgenx-portal` plugin in `vite.config.ts`;
- in production, by the rewrites the build writes into `dist/_redirects`.

The portal is only built when `LDGENX_PORTAL=1` is set. Without it (the default, and the setting for the first public release on Cloudflare Pages), the build has no `portal.html`, no portal rewrites or headers, and `robots.txt` has no `Disallow` lines. Set it once the backend is live.

The area is kept out of search engines three ways: a `noindex` meta tag, an `X-Robots-Tag` header (in `dist/_headers`) and `Disallow` lines in `robots.txt`.

## Demo mode and live mode

**Demo mode** is the default:

- **Data:** stored in `localStorage`. File contents go to IndexedDB, as bytes, because Safari refuses Blob objects in private windows.
- **Scope:** everything stays in one browser, and no e-mail is sent. A banner says so, with a reset link.
- **Demo accounts** (password `demo2026`), one-tap buttons on the sign-in page:
  - `camille.martin@bureau-exemple.demo` (client);
  - `maeva@ldgenx.demo` (team).
- **Two windows, live:** each window keeps its own sign-in. Open the client area in one window and the administration in another, in the same browser: a message, a file or an appointment appears on the other side at once, without reloading.
- **Sample data:** the clients and their messages are fictitious; the team and the appointment formats are LDgenX's own.
- **Access rules:** the demo applies the same access rules as the server below, so the screens behave as they will with real data. Writes from several windows go one at a time (Web Locks), as a database transaction would.

To try it: `npm run dev`, then open `/espace` and `/admin`. A built copy (`npm run build`, then `npm run preview`) behaves the same.

**Live mode:**

- Build with `VITE_PORTAL_API=http`. Add `VITE_PORTAL_API_URL` if the API is not at `/api` on the same domain.
- Keeping the API on the same domain is recommended: the session cookie stays first-party and no cross-origin (CORS) setup is needed.

## What the screens do

**Client area**

| Page           | Address               | What it does                                                                                                                                                                |
| -------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messages       | `/espace/messages`    | The conversation with the LDgenX team, with attachments. A notice warns when files will be deleted soon.                                                                    |
| Files          | `/espace/fichiers`    | The files the team dropped: note, size, date, the deletion date of each; download one or all.                                                                               |
| Appointments   | `/espace/rendez-vous` | Request an appointment; see upcoming and past ones with their status; ask for another time; cancel; join the video call; add to Google Calendar or any calendar (`.ics`).   |
| Account        | `/espace/compte`      | Profile, language (FR/EN), e-mail notifications, password.                                                                                                                  |
| Sign-up        | `/espace/inscription` | Creates an account, with an optional first message to the team. The account stays _pending_ until the team approves it; meanwhile the client can already write to the team. |
| Public booking | `/espace/reserver`    | A visitor without an account requests a discovery call (formats marked _open to visitors_).                                                                                 |

**Administration**

| Page     | Address             | What it does                                                                                                                                                                                                                                                                          |
| -------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Messages | `/admin/messages`   | Two tabs. _Clients:_ every conversation, unread first, searchable; reply with attachments. _Site form:_ the contact-form messages (new, read, handled), reply by e-mail, or invite the sender as a client.                                                                            |
| Requests | `/admin/demandes`   | Appointment requests waiting for an answer: confirm, confirm at another time or with another person, or decline with a message. Below, the clients' requests for another time: accept or decline.                                                                                     |
| Calendar | `/admin/agenda`     | Week, month and list views, for the whole team or one person. Each person's opening hours show in the week grid. Click a free time to create an appointment or block time; drag an appointment to move it. Each appointment opens a panel: contact, person, video link, move, cancel. |
| Clients  | `/admin/clients`    | Search, filter by status, invite. Each client's page has three tabs: messages, files (drop, keep, delete, see what was downloaded) and appointments. Approve or disable an account.                                                                                                   |
| Settings | `/admin/parametres` | _Availability:_ manual or automatic confirmation, each person's opening hours, the formats (name, length, open to visitors), booking rules, closed days. _Files:_ the weekly deletion. _Demo:_ reset the sample data (demo mode only).                                                |

Notifications (the bell, both sides) list what the other side did: a new message or file, a request, an answer, a change, a cancellation, a website message, a new account.

## Appointments

**Statuses:** `requested` (waiting for the team), `confirmed`, `declined` (by the team), `cancelled` (by either side).

**The flow:**

1. **A client or a visitor asks** for a free time. In manual mode the request waits for the team; in automatic mode (Settings) it is confirmed at once.
2. **The team answers:** confirm (possibly at another time, with another person, or with a video link), or decline with a message.
3. **The client may ask for another time.** The new time is stored in `change`, and the confirmed time stays held until the team answers. In automatic mode the change applies at once; a request still waiting simply changes.
4. **The team may also act directly:** create an appointment (confirmed at once), move one, cancel one, block time for one person or the whole team.

**Free times** (`computeSlots` in `lib/availability.ts`) start from each person's weekly openings, then remove:

- closed days and blocked times;
- the minimum notice and anything beyond the booking horizon;
- the times already held, with the gap between appointments: confirmed appointments, requests waiting for an answer, and changes waiting for an answer.

So two people can never request the same time.

**The team schedules freely.** It may set any time, outside opening hours included (the form warns), but never two appointments at once for one person. Requests from clients and visitors, on the other hand, must fall on a free time.

**Time zones:** opening hours, closed days and the calendar are in Europe/Paris. A visitor elsewhere also sees their own time.

## Endpoints

**Format:**

- JSON in and out, except uploads (multipart).
- Errors answer `{ "code": "<code>" }`, with one of these codes: `invalid_credentials`, `email_taken`, `not_found`, `forbidden`, `unauthenticated`, `slot_taken`, `account_disabled`, `invalid_input`. The screens translate them.
- Dates are ISO 8601 in UTC; days are `YYYY-MM-DD`.

| Method and path                                        | `PortalApi`                                                                                     | Who                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `GET /session`                                         | `currentUser` (401 when signed out)                                                             | anyone                                                   |
| `POST /session`                                        | `signIn`                                                                                        | anyone                                                   |
| `DELETE /session`                                      | `signOut`                                                                                       | signed in                                                |
| `POST /accounts`                                       | `signUp` (creates a _pending_ client, signs in; the optional `message` starts the conversation) | anyone                                                   |
| `POST /password-resets`                                | `requestPasswordReset` (always 204)                                                             | anyone                                                   |
| `PATCH /me`, `POST /me/password`                       | `updateProfile`, `changePassword`                                                               | signed in                                                |
| `GET /team`                                            | `listTeam` (names only)                                                                         | signed in                                                |
| `GET /clients`, `POST /clients/invitations`            | `listClients`, `inviteClient`                                                                   | team                                                     |
| `PATCH /clients/:id`                                   | `setAccountStatus` (`{ status }`)                                                               | team                                                     |
| `GET /users/:id`                                       | `getUser`                                                                                       | team; a client: themselves                               |
| `GET /threads`                                         | `listThreads` (a client gets their own only)                                                    | signed in                                                |
| `GET /threads/:clientId/messages`                      | `listMessages`                                                                                  | that client, team                                        |
| `POST /threads/:clientId/messages`                     | `sendMessage` (multipart: `body`, `files`)                                                      | that client, team                                        |
| `POST /threads/:clientId/read`                         | `markThreadRead`                                                                                | that client, team                                        |
| `GET /inquiries`, `PATCH /inquiries/:id`               | `listInquiries`, `setInquiryStatus` (`new`, `read`, `done`)                                     | team                                                     |
| `POST /inquiries`                                      | `submitInquiry`, and the public contact form (see _Going live_)                                 | anyone                                                   |
| `GET /files?clientId=`                                 | `listFiles` (files past their deletion are never listed)                                        | a client: own; team: all, or one client's                |
| `POST /clients/:clientId/files`                        | `uploadFile` (multipart: `file`, `note`)                                                        | team; a client in their own space                        |
| `POST /files/:id/download`                             | `downloadFile`: answers `{ url }`, a signed address valid a few minutes; logs the download      | that client, team                                        |
| `DELETE /files/:id`                                    | `deleteFile`                                                                                    | uploader, team                                           |
| `PATCH /files/:id`                                     | `keepFile` (`{ kept }`)                                                                         | team                                                     |
| `GET /retention`                                       | `getRetention`                                                                                  | signed in                                                |
| `PATCH /retention`, `POST /retention/purge`            | `updateRetention`, `purgeNow` (answers `{ count }`)                                             | team                                                     |
| `GET /booking/config`                                  | `getBookingConfig` (blocks only for the team)                                                   | anyone                                                   |
| `PATCH /booking/config`                                | `updateBookingConfig`                                                                           | team                                                     |
| `GET /booking/slots?typeId=&from=&to=&hostId=&ignore=` | `availableSlots` (`ignore`: the appointment being changed, whose own time counts as free)       | anyone for formats open to visitors; signed in otherwise |
| `GET /appointments?from=&to=`                          | `listAppointments`                                                                              | a client: own; team: all                                 |
| `POST /appointments/requests`                          | `requestAppointment` (`guest` required without a session)                                       | a client; anyone for formats open to visitors            |
| `POST /appointments`                                   | `scheduleAppointment` (confirmed at once)                                                       | team                                                     |
| `POST /appointments/:id/answer`                        | `respondToRequest` (`{ accept, reply?, start?, hostId?, meetingUrl? }`)                         | team                                                     |
| `POST /appointments/:id/change`                        | `requestChange` (`{ start, hostId? }`)                                                          | that client                                              |
| `POST /appointments/:id/change/answer`                 | `respondToChange` (`{ accept, reply? }`)                                                        | team                                                     |
| `POST /appointments/:id/move`                          | `moveAppointment` (`{ start, hostId? }`)                                                        | team                                                     |
| `POST /appointments/:id/cancel`                        | `cancelAppointment` (`{ reason? }`)                                                             | that client, team; visitors through a signed link        |
| `PATCH /appointments/:id`                              | `updateAppointment` (video link, person, subject)                                               | team                                                     |
| `POST /booking/blocks`, `DELETE /booking/blocks/:id`   | `addBlock`, `removeBlock`                                                                       | team                                                     |
| `GET /activity?limit=`, `POST /activity/read`          | `listActivity`, `markActivityRead` (`{ ids?, kinds?, clientId? }`)                              | signed in (filtered by audience)                         |
| `GET /events`                                          | `subscribe`: server-sent events, one message whenever data concerning the user changes          | signed in                                                |

**Live updates:** both sides stay up to date through `GET /events`. After each change, send an event to the client concerned and to every signed-in team member; the screens then reload what they show. The demo does the same between windows.

## Rules the server must enforce

The demo applies these in the browser, which protects nothing. The server must check every one of them on every request.

- **Ownership:**
  - a client reaches only their own conversation, files, appointments and notifications;
  - the team reaches everything;
  - team accounts are never created by sign-up;
  - a disabled account cannot sign in (`account_disabled`).
- **Never sent to a client:** calendar blocks and their reasons, the website messages, other clients' data. Free times are given without saying who holds the others.
- **Messages:** the team reads as one. A client's message counts as read by the team once any team member has opened it.
- **Files:**
  - a client deletes only the files they uploaded;
  - a file past its deletion time is never listed or downloaded, even before the job removes it.
- **Requests and changes from clients and visitors:**
  - recompute the free times with the rules of `lib/availability.ts`, inside the transaction that writes the request;
  - when two people ask for the same time, the second gets `slot_taken`, and the screen offers the remaining times.
- **No double booking per person:**
  - add a database constraint on held times. In PostgreSQL: a `holds` table (appointment, person, time range) with an exclusion constraint `EXCLUDE USING gist (host_id WITH =, span WITH &&)`;
  - each confirmed appointment, request waiting for an answer and change waiting for an answer has one row;
  - the gap between appointments is a booking rule for requests, not part of the constraint, because the team may set appointments back to back.
- **Who does what:**
  - only the client asks for a change;
  - only the team confirms, declines, moves, creates appointments and blocks time;
  - either side cancels.
- **Times:** stored in UTC. Opening hours, closed days and the weekly deletion are expressed in Europe/Paris.

## Weekly deletion of files

- **When a file goes:** its `expires_at` is computed on upload with `expiryFor` (`lib/retention.ts`): the first deletion that leaves the file online for at least `minimumDays`. Recompute it when the settings change, and when the team keeps or stops keeping a file.
- **The job:** a scheduled task, hourly or at the set hour:
  - deletes the files where `kept = false` and `expires_at <= now()`, from storage and from the database;
  - records a `purge` activity with the count.
- **The reminder e-mail**, 24 to 48 hours before each deletion, goes to every client with files leaving (if their `notify.weeklyPurge` is on). It lists the files and flags those not yet downloaded.
- **The notice** shown to clients comes from the settings; `{date}` is replaced by the next deletion.

## E-mails

All transactional, in the account's language. A French or EU provider fits the GDPR best, for example Brevo.

| E-mail                                                                                                        | To                | When                                                     |
| ------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------- |
| New account to approve                                                                                        | team              | sign-up                                                  |
| Account approved; invitation (choose a password)                                                              | client            | approval, invitation                                     |
| Password reset (single-use link, about 1 h)                                                                   | client            | request                                                  |
| New message                                                                                                   | the other side    | sending (if `notify.messages` allows)                    |
| New file                                                                                                      | client            | the team drops a file (if `notify.files` allows)         |
| New website message                                                                                           | team              | contact form                                             |
| New appointment request; change requested; cancelled by the client                                            | team              | the client's or visitor's action                         |
| Appointment confirmed (with `.ics` and video link), declined, moved or cancelled; change accepted or declined | client or visitor | the team's action (visitors get a signed link to cancel) |
| Appointment reminder                                                                                          | both sides        | 24 h before                                              |
| Files deleted soon                                                                                            | client            | before each weekly deletion                              |

## Files

- **Storage:** a private S3-compatible bucket hosted in the EU, for example Scaleway or OVHcloud. Downloads go through short-lived signed addresses only; the bucket is never public.
- **Large sequencing files:** FASTQ and BAM files can weigh tens of gigabytes. Use presigned multipart uploads straight to the bucket, with the API recording the file once the upload completes. The demo's single upload request is fine for documents, not for raw data.
- **Uploads:** scan for viruses (ClamAV) before a file is offered for download; check size and type; keep the original file name for display only.
- **Downloads:** log each one (`downloads`: who, when). The team uses this to see whether a client has fetched their results.

## Security

- **Passwords:** hashed with Argon2id, at least 8 characters. Rate-limit sign-in, sign-up, password resets, appointment requests from visitors and the contact form.
- **Session:** an HTTP-only, `Secure`, `SameSite=Lax` cookie, renewed at sign-in, ending after a period of inactivity. Check the `Origin` header on every non-GET request.
- **Team accounts:** two-factor authentication recommended.
- **Headers on `/espace` and `/admin`:** a Content Security Policy and `frame-ancestors 'none'`.
- **Audit:** the activity table keeps who did what and when.

## GDPR

- **Privacy policy:** update it to cover:
  - client accounts and their messages;
  - shared files and their weekly deletion;
  - appointment data, from clients and visitors;
  - the website messages;
  - how long each is kept;
  - the processors (hosting, storage, e-mail).
- **Consent:** record the consent checkbox with its date, at sign-up and for visitors' requests.
- **Retention:** set retention periods (for example, inactive accounts after three years, visitors' appointments and website messages after twelve months) and apply them with a scheduled task.
- **Requests:** answer export and deletion requests; the account page directs clients to info@ldgenx.fr.

## Suggested stack

Any stack that implements the contract works. A small one:

- **API:** Node.js (Fastify or Hono) with PostgreSQL;
- **Storage and e-mail:** an S3-compatible bucket and Brevo;
- **Hosting:** in France, for example Scaleway or Clever Cloud.

Supabase in its EU region is a quicker alternative: it provides authentication, database, storage and live updates, with row-level security policies written from the rules above.

## Going live, in order

1. **API:** build it to this contract and serve it at `/api` on the site's domain.
2. **Team accounts:** create one account per team member, with two-factor authentication. The first one uses the address Maeva Leitwein gave on 23 October 2026 for the administration (in her e-mail; kept out of this repository). In Settings, check each person's opening hours and which people take appointments.
3. **Build:** with `VITE_PORTAL_API=http`, then run through the demo's scenarios, with a client and a team member in two windows:
   - sign-up and approval;
   - messages both ways, with attachments;
   - a file dropped by the team, then downloaded;
   - a request, then confirmed; another declined; a change accepted; a move; a cancellation;
   - a visitor's request from `/espace/reserver`;
   - the weekly deletion, with the reminder.
4. **Public site:**
   - **Booking:** replace `appointment` in `src/content/site.ts` (today the cal.com link) by `/espace/reserver`. Every "Prendre rendez-vous" button then opens the new calendar. Do not switch before the backend is live: in demo mode a request stays in the visitor's browser and the team never sees it.
   - **Contact form:** set `VITE_CONTACT_ENDPOINT` to `https://<domain>/api/inquiries`. `POST /inquiries` must then also accept the form's multipart fields (`name`, `email`, `organization`, `sector`, `material`, `timeline`, `message`, `privacy`), answer 2xx in JSON, and store `organization` as `organisation`. The form has no language field: add a hidden `locale` input, or store `fr`. The messages then arrive in the team's inbox.
   - **Links:** add an "Espace client" link to the header and footer.
5. **Video links:** one per appointment (Google Meet through the Calendar API, Microsoft Teams, or a Jitsi or Whereby room), or one fixed room per person.
6. **The team's own calendars** (recommended): read their busy times (Google or Microsoft free/busy) and treat them as blocks; write confirmed appointments into them. Personal calendars then stay the reference.
7. **Privacy policy:** publish the update.
