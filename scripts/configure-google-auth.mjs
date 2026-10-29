import { credentials, management } from "./lib/supabase-management.mjs";
if (
  !credentials.GOOGLE_CLIENT_ID?.endsWith(".apps.googleusercontent.com") ||
  !credentials.GOOGLE_CLIENT_SECRET
)
  throw new Error("Google server credentials are missing.");
await management(
  "/config/auth",
  {
    external_google_enabled: true,
    external_google_client_id: credentials.GOOGLE_CLIENT_ID,
    external_google_secret: credentials.GOOGLE_CLIENT_SECRET,
  },
  "PATCH",
);
const config = await management("/config/auth");
if (
  config.external_google_enabled !== true ||
  config.external_google_client_id !== credentials.GOOGLE_CLIENT_ID
)
  throw new Error("Google provider verification failed");
console.log(
  "Supabase Google provider configured. No other Auth or email settings changed.",
);
