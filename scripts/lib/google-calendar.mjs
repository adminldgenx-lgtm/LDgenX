import { spawn } from "node:child_process";
// Server-side QA/maintenance only. Never import this into the web application.
import { createDecipheriv, createCipheriv, randomBytes } from "node:crypto";
import { credentials, query, literal } from "./supabase-management.mjs";
// curl uses IPv4 here because this Mac intermittently times out on Google's IPv6 endpoints.
// Authorization headers and request bodies are passed through stdin, never process arguments.
async function googleHTTP(url, method = "GET", headers = {}, body) {
  const config = [
    `url = ${JSON.stringify(url)}`,
    `request = ${JSON.stringify(method)}`,
    ...Object.entries(headers).map(
      ([k, v]) => `header = ${JSON.stringify(k + ": " + v)}`,
    ),
    ...(body ? [`data = ${JSON.stringify(body)}`] : []),
  ].join("\n");
  return new Promise((resolve, reject) => {
    const child = spawn(
      "curl",
      [
        "-4",
        "--silent",
        "--show-error",
        "--connect-timeout",
        "8",
        "--max-time",
        "25",
        "--retry",
        "2",
        "--retry-delay",
        "1",
        "--write-out",
        "\n%{http_code}",
        "--config",
        "-",
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
      if (output.length > 2000000) child.kill();
    });
    child.stderr.resume();
    child.on("error", () =>
      reject(new Error("Google verification connection failed.")),
    );
    child.on("close", (code) => {
      if (code !== 0)
        return reject(new Error("Google verification connection failed."));
      const split = output.lastIndexOf("\n");
      let value = null;
      try {
        value = JSON.parse(output.slice(0, split));
      } catch {
        /* A 204 response has no JSON. */
      }
      resolve({ status: Number(output.slice(split + 1)), value });
    });
    child.stdin.end(config + "\n");
  });
}
export async function calendarGoogle() {
  const [connection] = await query(
    "select credentials,managed,busy,enabled from private.google_calendar_connection where id=true",
  );
  if (!connection?.enabled || !connection.credentials)
    throw new Error("Calendar is not connected.");
  const key = Buffer.from(credentials.GOOGLE_CALENDAR_ENCRYPTION_KEY, "base64");
  const [iv, raw] = connection.credentials
    .split(".")
    .map((s) => Buffer.from(s, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAAD(Buffer.from("LDgenX Calendar v1"));
  decipher.setAuthTag(raw.subarray(-16));
  let tokens = JSON.parse(
    Buffer.concat([
      decipher.update(raw.subarray(0, -16)),
      decipher.final(),
    ]).toString(),
  );
  if (tokens.expiresAt < Date.now() + 60000) {
    const response = await googleHTTP(
      "https://oauth2.googleapis.com/token",
      "POST",
      { "Content-Type": "application/x-www-form-urlencoded" },
      new URLSearchParams({
        client_id: credentials.GOOGLE_CLIENT_ID,
        client_secret: credentials.GOOGLE_CLIENT_SECRET,
        refresh_token: tokens.refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    );
    const value = response.value;
    if (response.status !== 200 || !value?.access_token)
      throw new Error(`Google refresh HTTP ${response.status}`);
    tokens = {
      accessToken: value.access_token,
      refreshToken: value.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + Number(value.expires_in || 3600) * 1000,
    };
    const nextIV = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", key, nextIV);
    cipher.setAAD(Buffer.from("LDgenX Calendar v1"));
    const encoded =
      nextIV.toString("base64") +
      "." +
      Buffer.concat([
        cipher.update(JSON.stringify(tokens)),
        cipher.final(),
        cipher.getAuthTag(),
      ]).toString("base64");
    await query(
      `update private.google_calendar_connection set credentials=${literal(encoded)},updated_at=now() where id=true and credentials=${literal(connection.credentials)}`,
    );
  }
  return {
    connection,
    async request(path, method = "GET", body) {
      if (!path.startsWith("/") || path.startsWith("//"))
        throw new Error("Invalid Google API path");
      return googleHTTP(
        "https://www.googleapis.com/calendar/v3" + path,
        method,
        {
          Authorization: `Bearer ${tokens.accessToken}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body ? JSON.stringify(body) : undefined,
      );
    },
  };
}
