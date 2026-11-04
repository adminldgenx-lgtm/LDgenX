// Connects the portal's notification emails to Resend, free of charge. Supabase Auth stays as it
// is: Resend's starter sender reaches only the account's owner, so password emails must not use
// it. The key is checked with one real email, then stored as a server secret.
//
//   node scripts/setup-portal-mail.mjs            asks for the key
//   RESEND_API_KEY=re_… node scripts/setup-portal-mail.mjs
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { management, query, literal } from './lib/supabase-management.mjs';
import { installQaJsonTransport } from './lib/qa-http.mjs';

installQaJsonTransport();

const to = process.env.PORTAL_ALERT_EMAIL ?? 'admin.ldgenx@gmail.com';
const from = process.env.PORTAL_EMAIL_FROM ?? 'LDgenX <onboarding@resend.dev>';
const setupStartedAt = new Date().toISOString();
let key = process.env.RESEND_API_KEY?.trim();
if (!key) {
  const hidden = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const prompt = createInterface({ input: stdin, output: hidden, terminal: !!stdin.isTTY });
  stdout.write('Resend API key (input hidden): ');
  try {
    key = (await prompt.question('')).trim();
  } finally {
    prompt.close();
    hidden.end();
    stdout.write('\n');
  }
}
if (!key.startsWith('re_')) throw new Error('A Resend key starts with re_.');
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from,
    to: [to],
    subject: 'LDgenX — Notifications activées',
    text: `Les notifications de l’administration LDgenX arrivent désormais à cette adresse : messages, demandes de rendez-vous, formulaire du site, fichiers et nouveaux comptes.\n\nChoisir vos notifications : https://www.ldgenx.fr/admin/compte`,
  }),
  signal: AbortSignal.timeout(20000),
});
if (!response.ok)
  throw new Error(
    `Resend refused the test email (HTTP ${response.status}). With the starter sender, the Resend account must be the one created with ${to}.`,
  );
// Suppress old mail before enabling the sender, so a concurrent job cannot send the backlog.
// Events arriving during setup remain eligible; their activity stays visible in the portal.
await query(
  `update private.portal_email_outbox set attempts=5,last_error='before_mail_setup' where sent_at is null and created_at<${literal(setupStartedAt)}::timestamptz`,
);
await management('/secrets', [
  { name: 'RESEND_API_KEY', value: key },
  { name: 'PORTAL_EMAIL_FROM', value: from },
]);
console.log(`Notifications are on. A test email went to ${to}.`);
