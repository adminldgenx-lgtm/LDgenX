# Calendar blocked-time follow-up — 29 October 2026

The owner’s “test syncro du site vers google” item was a portal blocked time. The initial integration exported appointments only, so no export was queued for that item. Blocked times now have a durable private queue: personal blocks export to that bookable person’s dedicated calendar, and whole-team blocks export to all bookable calendars. Current blocks are backfilled; deletion removes managed Google copies. Reasons remain private and Google receives a generic unavailability label. Matching managed copies are not imported as duplicate busy blocks.

Real Google testing also exposed PostgreSQL driver rounding of timestamptz parameters: successful exports could remain queued. Revisions are now selected and compared as text, preserving all microseconds. Queue failures retain their retry state. Administrator scheduling now respects portal blocked times too.

Simultaneous Google busy cards now occupy separate lanes instead of hiding one another. The current owner-primary-calendar default applies its busy periods to every bookable person. The connection panel and privacy descriptions now include blocked times.

Verification: 22 Calendar/portal unit and network-mock tests, nine real connected-Google round-trip assertions, nine browser flows with real initial connection status and synthetic connected-interface fixtures, production build/typecheck/lint, 151 static HTML pages and 147 indexable pages. Real QA events/accounts are cleaned up; user-created blocks and events are preserved. The previous pre-connection 76-assertion live suite is not rerun after connection because its fixture deletion was not designed to clean up Google exports.
