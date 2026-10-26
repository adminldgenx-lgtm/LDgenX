// Run only after choosing the email provider and verifying its sender domain.
// It configures delivery; it does not send a test message or enable a paid plan.
import { credentials, management } from './lib/supabase-management.mjs';
const apiKey = credentials.RESEND_API_KEY;
const from = credentials.PORTAL_EMAIL_FROM;
if (!apiKey?.startsWith('re_') || !from)
  throw new Error(
    'Set RESEND_API_KEY and PORTAL_EMAIL_FROM in .env.supabase.local after verifying the sender in Resend.',
  );
const address = from.match(/<([^>]+)>/)?.[1] ?? from;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address))
  throw new Error('Invalid PORTAL_EMAIL_FROM address.');
await management(
  '/config/auth',
  {
    smtp_host: 'smtp.resend.com',
    smtp_port: 465,
    smtp_user: 'resend',
    smtp_pass: apiKey,
    smtp_admin_email: address,
    smtp_sender_name: 'LDgenX',
    mailer_autoconfirm: false,
  },
  'PATCH',
);
await management('/secrets', [
  { name: 'RESEND_API_KEY', value: apiKey },
  { name: 'PORTAL_EMAIL_FROM', value: from },
]);
console.log(
  'Supabase Auth SMTP and portal transactional email are configured. No message was sent.',
);
