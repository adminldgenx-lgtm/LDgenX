# Authentication interface — 30 October 2026

Login and registration now use a compact LDgenX card with fewer explanations, a clear Google action, short labels and consistent French/English navigation. Login reads “Accédez à votre compte LDgenX.” Registration asks for first name, last name, organisation, email and password; phone and project description can be completed later. Privacy consent and administrator approval remain in place.

Password visibility controls preserve the entered value and expose their state to assistive technology. Google and password submission lock each other while a request is pending, and returning through browser history restores the Google button. Recovery and invitation screens share the same compact presentation. Existing authentication, role checks and Calendar scopes are unchanged.

The resumed local production check passes all 12 authentication UX checks in French and English, including widths of 320, 390, 768 and 1440 pixels, validation errors, password reveal, sign-in failure, submission locking and registration confirmation. Auth writes are intercepted: these checks create no accounts, emails, sessions or appointments. Google handoff/cancellation checks separately passed in both languages, requesting identity permissions only. Build/typecheck and lint passed in the preceding session with these source files.

Google Cloud was inspected directly in the connected LDgenX project: OAuth Audience is **En production**. The app display name has been changed from `ldgenx-platform` to `LDgenX` and saved. Branding verification has been started. Google controls the text on its own consent screen; saving the name alone does not guarantee that it replaces the Supabase redirect domain before brand verification is approved. Official reference: [Manage OAuth App Branding](https://support.google.com/cloud/answer/15549049?hl=en).

Local QA evidence is in `docs/auth-qa/local`. Deployment and live verification will be recorded below after completion.
