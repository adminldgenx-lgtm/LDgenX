# Google identity and calendar

Google Cloud project: `ldgenx-platform`. Google basic sign-in is configured on the Supabase provider. The client secret is only in ignored server configuration and the Supabase Auth configuration; it is never a Vite variable or browser bundle value.

Google's authorized redirect URI is `https://rkkvvqwgxbtnvewyrylj.supabase.co/auth/v1/callback`. The owner confirmed adding it on 29 October 2026. Supabase then redirects to `/espace/connexion` with the selected language and a validated portal destination. The browser SDK uses PKCE and automatically exchanges the callback code. New accounts remain pending clients; Google metadata cannot assign an administrator role. Names come from Google's given/family-name fields when available. The existing administrator keeps the existing server profile and role when Supabase links the verified matching email.

Login and registration both offer Google in French and English. The identity flow requests email/profile/openid only. It does not request access to calendars, files, contacts or Gmail. The API configuration/redirect and real browser handoff/cancellation paths are tested; tests stop before real Google account consent. The owner must complete one real sign-in to confirm account linking and the project's audience/consent-screen status for the intended users. Public users require appropriate Google OAuth audience/publishing settings, not merely a correct client ID.

## Calendar decision

The owner selected the recommended approach: a dedicated LDgenX calendar receives portal appointments, and Google busy periods block bookings. The intended owner account is `admin.ldgenx@gmail.com`. Activation of the Calendar API alone does not grant that account's calendar access.

The remaining consent must allow the backend to operate while the owner is offline (refresh-token access). Calendar access must be a separate admin connection from ordinary Google sign-in. Map every calendar that should block bookings to the correct bookable staff member; a calendar not accessible to the connected account cannot be checked. Use a dedicated output calendar so private event titles/descriptions need not be imported.

The integration must recheck Google availability on the server immediately before any booking or move, retain atomic portal reservation checks, export updates/cancellations through a durable retry queue, and block new bookings when an enabled Google connection cannot be checked. Periodic syncing alone is insufficient to prevent overlaps. Independent manual edits made in Google at exactly the same time cannot be made atomic with the portal database, so no absolute cross-provider guarantee should be claimed.

Calendar synchronization is not yet enabled. No existing Google events have been created, read, moved or deleted by this change. OVH email and DNS remain unchanged.
