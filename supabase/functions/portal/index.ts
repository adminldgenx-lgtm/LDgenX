import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import postgres from "npm:postgres@3.4.7";
import { PortalService, email, text } from "../_shared/service.ts";
import { PortalError, type User } from "../_shared/types.ts";
import { repository } from "./repository.ts";
import { runJobs } from "./jobs.ts";
import { portalOrigins } from "../_shared/origins.ts";
import { runCalendarSync } from "../_shared/google-calendar.ts";

const projectUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(projectUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const connection = new URL(Deno.env.get("SUPABASE_DB_URL")!);
const poolerHost = Deno.env.get("PORTAL_POOLER_HOST");
if (poolerHost) {
  connection.hostname = poolerHost;
  connection.port = "6543";
  connection.username = Deno.env.get("PORTAL_POOLER_USER")!;
}
function requestContext() {
  const sql = postgres(connection.toString(), {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    ssl: poolerHost ? "require" : undefined,
    connection: { application_name: "ldgenx-portal" },
  });
  const origins = new Set(
    (Deno.env.get("PORTAL_ALLOWED_ORIGINS") ?? portalOrigins.join(","))
      .split(",")
      .map((x) => x.trim()),
  );
  const status: Record<string, number> = {
    unauthenticated: 401,
    invalid_credentials: 401,
    forbidden: 403,
    account_disabled: 403,
    not_found: 404,
    slot_taken: 409,
    email_taken: 409,
    invalid_input: 400,
    rate_limited: 429,
    email_unavailable: 503,
    network: 503,
    calendar_unavailable: 503,
  };

  async function handle(req: Request) {
    const origin = req.headers.get("origin");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
      "Access-Control-Allow-Headers":
        "authorization, apikey, content-type, x-client-info",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    };
    if (origin && origins.has(origin))
      headers["Access-Control-Allow-Origin"] = origin;
    const respond = (body: unknown, code = 200) =>
      new Response(body === undefined ? null : JSON.stringify(body), {
        status: body === undefined && code === 200 ? 204 : code,
        headers,
      });
    if (origin && !origins.has(origin))
      return respond({ code: "forbidden" }, 403);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    const path =
      new URL(req.url).pathname.replace(/^\/portal(?=\/|$)/, "") || "/";
    const params = new URL(req.url).searchParams;
    if (path === "/health" && req.method === "GET")
      return respond({ ok: true, service: "ldgenx-portal" });
    try {
      if (path === "/jobs" && req.method === "POST") {
        const provided = req.headers.get("x-portal-job-key") ?? "";
        const expected = Deno.env.get("PORTAL_JOB_SECRET") ?? "";
        if (!expected || provided !== expected)
          throw new PortalError("forbidden");
        return respond(await runJobs(sql, admin));
      }
      const token = req.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");
      let authId: string | null = null;
      if (token) {
        const { data, error } = await admin.auth.getUser(token);
        if (error)
          throw new PortalError(
            error.status && error.status < 500 ? "unauthenticated" : "network",
          );
        if (!data.user) throw new PortalError("unauthenticated");
        authId = data.user.id;
      }
      const isRead = req.method === "GET";
      if (!isRead) {
        const length = Number(req.headers.get("content-length") ?? 0);
        if (length > 23068672) throw new PortalError("invalid_input");
        // Rate limits live in Postgres, so they survive cold starts and multiple Edge workers.
        const ip =
          req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
          "unknown";
        const key = `${authId ?? ip}:${authId ? "signed" : path}`;
        const max = authId ? 120 : path === "/inquiries" ? 5 : 8;
        const window = authId ? 60 : 3600;
        const rows =
          await sql`insert into private.portal_rate_limits(key,hits,window_at) values(${key},1,now()) on conflict(key) do update set hits=case when portal_rate_limits.window_at < now()-make_interval(secs=>${window}) then 1 else portal_rate_limits.hits+1 end, window_at=case when portal_rate_limits.window_at < now()-make_interval(secs=>${window}) then now() else portal_rate_limits.window_at end returning hits`;
        if (rows[0].hits > max) throw new PortalError("rate_limited");
      }
      const contentType = req.headers.get("content-type") ?? "";
      let body: Record<string, unknown> = {};
      let form: FormData | undefined;
      if (!["GET", "DELETE"].includes(req.method)) {
        if (contentType.includes("multipart/form-data"))
          form = await req.formData();
        else if (contentType.includes("application/json")) {
          const raw = await req.text();
          if (raw.length > 262144) throw new PortalError("invalid_input");
          try {
            body = JSON.parse(raw);
          } catch {
            throw new PortalError("invalid_input");
          }
          if (!body || typeof body !== "object" || Array.isArray(body))
            throw new PortalError("invalid_input");
        }
      }
      const uploaded: string[] = [];
      const lock = /appointments|booking/.test(path)
        ? "booking"
        : /files|retention|messages|threads/.test(path)
          ? "files-and-messages"
          : (authId ?? "public");
      let result: unknown;
      try {
        result = await sql.begin(async (tx) => {
          // Serializes related writes, including checking and reserving a free slot in one transaction.
          if (!isRead)
            await tx`select pg_advisory_xact_lock(hashtextextended(${lock},0))`;
          const db = repository(tx as unknown as typeof sql, admin, uploaded);
          const user = authId ? await db.get("profiles", authId) : null;
          if (authId && !user) throw new PortalError("unauthenticated");
          if (user?.status === "disabled")
            throw new PortalError("account_disabled");
          const svc = new PortalService(db, user as User | null);
          const verb = req.method;
          if (path === "/session" && verb === "GET") return svc.currentUser();
          if (path === "/me" && verb === "PATCH")
            return svc.updateProfile(body);
          if (path === "/team" && verb === "GET") return svc.listTeam();
          if (path === "/clients" && verb === "GET") return svc.listClients();
          if (path === "/clients/invitations" && verb === "POST")
            return svc.inviteClient(body as never);
          let match = path.match(/^\/users\/([^/]+)$/);
          if (match && verb === "GET") return svc.getUser(match[1]);
          match = path.match(/^\/clients\/([^/]+)$/);
          if (match && verb === "PATCH")
            return svc.setAccountStatus(match[1], body.status as never);
          if (path === "/threads" && verb === "GET") return svc.listThreads();
          match = path.match(/^\/threads\/([^/]+)\/(messages|read)$/);
          if (match) {
            if (match[2] === "messages" && verb === "GET")
              return svc.listMessages(match[1]);
            if (match[2] === "messages" && verb === "POST") {
              if (!form) throw new PortalError("invalid_input");
              const files = form.getAll("files");
              if (files.some((f) => !(f instanceof File)))
                throw new PortalError("invalid_input");
              return svc.sendMessage(
                match[1],
                String(form.get("body") ?? ""),
                files as File[],
              );
            }
            if (match[2] === "read" && verb === "POST")
              return svc.markThreadRead(match[1]);
          }
          if (path === "/inquiries") {
            if (verb === "GET") return svc.listInquiries();
            if (verb === "POST") {
              if (form) {
                // Public website form, including consent and a hidden spam trap.
                if (form.get("website")) return;
                if (form.get("privacy") !== "on")
                  throw new PortalError("invalid_input");
                body = Object.fromEntries(form.entries());
                body.organisation = String(form.get("organization") ?? "");
              }
              return svc.submitInquiry(body as never);
            }
          }
          match = path.match(/^\/inquiries\/([^/]+)$/);
          if (match && verb === "PATCH")
            return svc.setInquiryStatus(match[1], body.status as never);
          if (path === "/files" && verb === "GET")
            return svc.listFiles(params.get("clientId") ?? undefined);
          match = path.match(/^\/clients\/([^/]+)\/files$/);
          if (match && verb === "POST") {
            if (!form || !(form.get("file") instanceof File))
              throw new PortalError("invalid_input");
            return svc.uploadFile(
              match[1],
              form.get("file") as File,
              String(form.get("note") ?? ""),
            );
          }
          match = path.match(/^\/files\/([^/]+)(\/download)?$/);
          if (match) {
            if (match[2] && verb === "POST") return svc.downloadFile(match[1]);
            if (!match[2] && verb === "DELETE") return svc.deleteFile(match[1]);
            if (!match[2] && verb === "PATCH")
              return svc.keepFile(match[1], body.kept as boolean);
          }
          if (path === "/retention" && verb === "GET")
            return svc.getRetention();
          if (path === "/retention" && verb === "PATCH")
            return svc.updateRetention(body);
          if (path === "/retention/purge" && verb === "POST")
            return svc.purgeNow();
          if (path === "/booking/config" && verb === "GET")
            return svc.getBookingConfig();
          if (path === "/booking/config" && verb === "PATCH")
            return svc.updateBookingConfig(body);
          if (path === "/booking/slots" && verb === "GET")
            return svc.availableSlots(
              params.get("typeId") ?? "",
              params.get("from") ?? "",
              params.get("to") ?? "",
              params.get("hostId") ?? undefined,
              params.get("ignore") ?? undefined,
            );
          if (path === "/appointments" && verb === "GET")
            return svc.listAppointments(
              params.has("from") && params.has("to")
                ? { from: params.get("from")!, to: params.get("to")! }
                : undefined,
            );
          if (path === "/appointments" && verb === "POST")
            return svc.scheduleAppointment(body as never);
          if (path === "/appointments/requests" && verb === "POST") {
            if (!authId) {
              const g = body.guest as Record<string, unknown> | undefined;
              email(g?.email);
              text(g?.name, 200, true);
            }
            return svc.requestAppointment(body as never);
          }
          match = path.match(
            /^\/appointments\/([^/]+)(?:\/(answer|change|change\/answer|move|cancel))?$/,
          );
          if (match) {
            const id = match[1],
              action = match[2];
            if (!action && verb === "PATCH")
              return svc.updateAppointment(id, body);
            if (verb === "POST") {
              if (action === "answer")
                return svc.respondToRequest(id, body as never);
              if (action === "change")
                return svc.requestChange(
                  id,
                  body.start as string,
                  body.hostId as string | undefined,
                );
              if (action === "change/answer")
                return svc.respondToChange(
                  id,
                  body.accept as boolean,
                  body.reply as string | undefined,
                );
              if (action === "move")
                return svc.moveAppointment(
                  id,
                  body.start as string,
                  body.hostId as string | undefined,
                );
              if (action === "cancel")
                return svc.cancelAppointment(
                  id,
                  body.reason as string | undefined,
                );
            }
          }
          if (path === "/booking/blocks" && verb === "POST")
            return svc.addBlock(body as never);
          match = path.match(/^\/booking\/blocks\/([^/]+)$/);
          if (match && verb === "DELETE") return svc.removeBlock(match[1]);
          if (path === "/activity" && verb === "GET")
            return svc.listActivity(Number(params.get("limit") ?? 50));
          if (path === "/activity/read" && verb === "POST")
            return svc.markActivityRead(body);
          throw new PortalError("not_found");
        });
      } catch (e) {
        if (uploaded.length)
          await admin.storage.from("portal-files").remove(uploaded);
        throw e;
      }
      if (
        !isRead &&
        path.startsWith("/appointments") &&
        result &&
        typeof result === "object" &&
        "id" in result
      ) {
        // The reservation is already committed. Export failures stay queued and must not
        // turn a successful booking into an apparent failure that a client retries.
        try {
          await runCalendarSync(sql, String(result.id));
        } catch {
          console.error("calendar_export_queued");
        }
      }
      return respond(result);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      const code =
        e instanceof PortalError
          ? e.code
          : err.code === "23P01"
            ? "slot_taken"
            : "network";
      // Log a classification only: request bodies, tokens, personal data and SQL stay out of logs.
      if (!(e instanceof PortalError))
        console.error("portal_request_failed", {
          code: err.code ?? "unexpected",
        });
      return respond({ code }, status[code] ?? 500);
    }
  }
  return { handle, close: () => sql.end({ timeout: 1 }) };
}
Deno.serve(async (request) => {
  const context = requestContext();
  try {
    return await context.handle(request);
  } finally {
    await context.close().catch(() => {});
  }
});
