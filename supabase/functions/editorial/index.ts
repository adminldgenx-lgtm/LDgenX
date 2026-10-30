import { createClient } from "npm:@supabase/supabase-js@2.118.0";
import postgres, { type Sql } from "npm:postgres@3.4.7";
import { portalOrigins } from "../_shared/origins.ts";
import {
  EditorialError,
  EDITORIAL_LIMITS as LIMITS,
  contentPath,
  contentSlug,
  contentKinds,
  documentMedia,
  emptyDocument,
  publicationIssues,
  summarize,
  validId,
  validateDocument,
  type ContentKind,
  type ContentLocale,
  type EditorialDocument,
  type EditorialEntry,
  type EditorialMedia,
  type EditorialSummary,
  type MediaVariant,
} from "../_shared/editorial.ts";
import { webpSize, videoMime } from "../_shared/editorial-media.ts";
import { editorialPageTemplates } from "../_shared/editorial-pages.ts";
import {
  editorialStaticImages,
  editorialStaticPaths,
} from "../_shared/editorial-static.ts";

const project = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(
  project,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const connection = new URL(Deno.env.get("SUPABASE_DB_URL")!);
if (Deno.env.get("PORTAL_POOLER_HOST")) {
  connection.hostname = Deno.env.get("PORTAL_POOLER_HOST")!;
  connection.port = "6543";
  connection.username = Deno.env.get("PORTAL_POOLER_USER")!;
}
function requestContext() {
  const sql = postgres(connection.toString(), {
    prepare: false,
    max: 1,
    idle_timeout: 5,
    connect_timeout: 15,
    ssl: Deno.env.get("PORTAL_POOLER_HOST") ? "require" : undefined,
    connection: { application_name: "ldgenx-editorial" },
  });
  const PRIVATE = "editorial-drafts",
    PUBLIC = "editorial-public";
  type Row = Record<string, unknown>;
  const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v));
  const values = (v: unknown) => v as MediaVariant[];
  const txRun = async <T>(run: (tx: Sql) => Promise<T>) =>
    (await sql.begin((tx) => run(tx as unknown as Sql))) as unknown as T;
  const lock = async (tx: Sql) => {
    await tx`select pg_advisory_xact_lock(hashtextextended('editorial-writes',0))`;
  };
  function publication(row: Row): EditorialSummary {
    const base = {
      id: String(row.entry_id),
      kind: row.kind as ContentKind,
      locale: row.locale as ContentLocale,
      slug: String(row.slug),
      path: String(row.path),
      groupId: String(row.group_id),
      legacyId: row.legacy_id ? String(row.legacy_id) : null,
      status: row.status as "published" | "withdrawn",
      publishedAt: iso(row.published_at),
      updatedAt: iso(row.updated_at),
    };
    return summarize(
      base,
      row.snapshot ? (row.snapshot as EditorialDocument) : emptyDocument(),
    );
  }
  function entry(row: Row, pub?: Row): EditorialEntry {
    return {
      id: String(row.id),
      kind: row.kind as ContentKind,
      locale: row.locale as ContentLocale,
      slug: String(row.slug),
      groupId: String(row.group_id),
      legacyId: row.legacy_id ? String(row.legacy_id) : null,
      version: Number(row.version),
      publishedVersion: row.published_version
        ? Number(row.published_version)
        : null,
      document: row.draft as EditorialDocument,
      publication: pub ? publication(pub) : null,
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
      authorName: String(row.author_name ?? "LDgenX"),
      deletedAt: row.deleted_at ? iso(row.deleted_at) : null,
    };
  }
  async function media(
    row: Row,
    privateUrls = false,
    signedUrls?: Map<string, string>,
  ): Promise<EditorialMedia> {
    const variants = values(row.variants),
      urls: Record<string, string> = {};
    if (privateUrls && !row.is_public && signedUrls) {
      for (const variant of variants) {
        const url = signedUrls.get(variant.path);
        if (!url) throw new EditorialError("media_unavailable", 503);
        urls[String(variant.width)] = url;
      }
    } else if (privateUrls && !row.is_public) {
      const signed = await admin.storage.from(PRIVATE).createSignedUrls(
        variants.map((v) => v.path),
        3600,
      );
      if (signed.error) throw new EditorialError("media_unavailable", 503);
      signed.data?.forEach((v, i) => {
        if (v.signedUrl) urls[String(variants[i].width)] = v.signedUrl;
      });
    } else
      for (const v of variants)
        urls[String(v.width)] =
          `${project}/storage/v1/object/public/${PUBLIC}/${v.path}`;
    return {
      id: String(row.id),
      name: String(row.name),
      kind: row.kind as "image" | "video",
      bytes: Number(row.bytes),
      variants,
      isPublic: !!row.is_public,
      createdAt: iso(row.created_at),
      uses: Number(row.uses ?? 0),
      urls,
    };
  }
  async function mediaRows(ids: string[], db = sql) {
    return ids.length
      ? await db`select * from public.cms_media where id in ${db(ids)} and state='ready'`
      : [];
  }
  async function signedMedia(rows: Row[]) {
    const paths = rows
      .filter((r) => !r.is_public)
      .flatMap((r) => values(r.variants).map((v) => v.path));
    const signed = new Map<string, string>();
    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);
      const result = await admin.storage
        .from(PRIVATE)
        .createSignedUrls(batch, 3600);
      if (result.error) throw new EditorialError("media_unavailable", 503);
      result.data?.forEach((item, index) => {
        if (item.signedUrl) signed.set(batch[index], item.signedUrl);
      });
    }
    return Promise.all(rows.map((r) => media(r, true, signed)));
  }
  async function syncLinks(
    tx: Sql,
    id: string,
    doc: EditorialDocument,
    stage: string,
  ) {
    const ids = documentMedia(doc);
    const rows = await mediaRows(ids, tx);
    if (rows.length !== ids.length)
      throw new EditorialError("media_missing", 400);
    const byId = new Map(rows.map((r) => [String(r.id), r.kind]));
    const [owner] =
      await tx`select kind,legacy_id from public.cms_entries where id=${id}`;
    if (doc.cover?.mediaId && byId.get(doc.cover.mediaId) !== "image")
      throw new EditorialError("image_format");
    function check(n: import("../_shared/editorial.ts").ContentNode) {
      if (
        n.type === "studyEvidence" &&
        (owner?.kind !== "study" || owner?.legacy_id !== n.attrs?.id)
      )
        throw new EditorialError("invalid_evidence");
      if (
        n.attrs?.staticSrc &&
        !editorialStaticImages.includes(String(n.attrs.staticSrc))
      )
        throw new EditorialError("image_missing");
      if (
        n.type === "figure" &&
        n.attrs?.mediaId &&
        byId.get(String(n.attrs.mediaId)) !== "image"
      )
        throw new EditorialError("image_format");
      if (
        n.type === "video" &&
        n.attrs?.mediaId &&
        byId.get(String(n.attrs.mediaId)) !== "video"
      )
        throw new EditorialError("video_format");
      if (n.attrs?.posterId && byId.get(String(n.attrs.posterId)) !== "image")
        throw new EditorialError("image_format");
      n.content?.forEach(check);
    }
    if (
      doc.cover?.staticSrc &&
      !editorialStaticImages.includes(doc.cover.staticSrc)
    )
      throw new EditorialError("image_missing");
    check(doc.body);
    await tx`delete from public.cms_media_links where entry_id=${id} and stage=${stage}`;
    for (const mid of ids)
      await tx`insert into public.cms_media_links(entry_id,media_id,stage) values(${id},${mid},${stage})`;
    return rows;
  }
  async function revision(tx: Sql, row: Row, author: string, reason: string) {
    const doc = row.draft as EditorialDocument;
    await tx`insert into public.cms_revisions(entry_id,version,document,media_ids,reason,author) values(${String(row.id)},${Number(row.version)},${tx.json(doc as never)},${tx.array(documentMedia(doc))}::uuid[],${reason},${author})`;
    await tx`delete from public.cms_revisions where entry_id=${String(row.id)} and id not in (select id from public.cms_revisions where entry_id=${String(row.id)} order by id desc limit ${LIMITS.revisionsPerEntry})`;
    // History is useful but bounded on the free database. Current drafts/publications are never trimmed.
    await tx`delete from public.cms_revisions where id in (select id from (select id,sum(pg_column_size(document)) over(order by id desc) as bytes from public.cms_revisions) r where bytes>${LIMITS.revisionBudgetBytes})`;
  }
  async function quota(tx = sql, extra = 0, enforce = true) {
    const [usage] =
      await tx`select coalesce((select sum(bytes*case when is_public then 2 else 1 end) from public.cms_media),0)::bigint as cms,coalesce((select sum((metadata->>'size')::bigint) from storage.objects),0)::bigint+coalesce((select sum(bytes) from public.cms_media where state='uploading'),0)::bigint as project`;
    if (
      enforce &&
      (Number(usage.cms) + extra > LIMITS.mediaBudgetBytes ||
        Number(usage.project) + extra > LIMITS.projectStorageCeiling)
    )
      throw new EditorialError("storage_limit", 409);
    return {
      mediaBytes: Number(usage.cms),
      mediaLimit: LIMITS.mediaBudgetBytes,
      projectBytes: Number(usage.project),
      projectLimit: LIMITS.projectStorageCeiling,
      imageLimit: LIMITS.imageUploadBytes,
      videoLimit: LIMITS.videoBytes,
    };
  }
  async function readBody(req: Request, limit: number) {
    if (Number(req.headers.get("content-length") ?? 0) > limit)
      throw new EditorialError("file_too_large", 413);
    const reader = req.body?.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    if (reader)
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.byteLength;
        if (length > limit) {
          await reader.cancel();
          throw new EditorialError("file_too_large", 413);
        }
        chunks.push(value);
      }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
  }
  async function upload(req: Request, user: string) {
    const bytes = await readBody(req, LIMITS.videoBytes + 100_000);
    const form = await new Response(bytes, {
      headers: { "Content-Type": req.headers.get("content-type") ?? "" },
    }).formData();
    const kind = form.get("kind");
    if (kind !== "image" && kind !== "video")
      throw new EditorialError("invalid_input");
    const files = form.getAll("files");
    if (
      !files.length ||
      files.length > 3 ||
      files.some((f) => !(f instanceof File))
    )
      throw new EditorialError("invalid_input");
    const total = files.reduce((n, f) => n + (f as File).size, 0);
    if (
      total > (kind === "image" ? LIMITS.imageUploadBytes : LIMITS.videoBytes)
    )
      throw new EditorialError("file_too_large", 413);
    const id = crypto.randomUUID(),
      parts: { file: File; bytes: Uint8Array; variant: MediaVariant }[] = [];
    const seen = new Set<number>();
    let digest = "";
    for (const raw of files) {
      const file = raw as File,
        data = new Uint8Array(await file.arrayBuffer());
      let width = 0,
        height = 0,
        mime: string;
      if (kind === "image") {
        if (file.size > LIMITS.imageVariantBytes)
          throw new EditorialError("file_too_large", 413);
        ({ width, height } = webpSize(data));
        mime = "image/webp";
        if (seen.has(width)) throw new EditorialError("invalid_input");
        seen.add(width);
      } else {
        if (files.length !== 1) throw new EditorialError("invalid_input");
        mime = videoMime(data);
      }
      const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", data));
      digest += [...hash].map((x) => x.toString(16).padStart(2, "0")).join("");
      const extension =
        mime === "image/webp" ? "webp" : mime === "video/mp4" ? "mp4" : "webm";
      parts.push({
        file,
        bytes: data,
        variant: {
          path: `${id}/${width}.${extension}`,
          width,
          height,
          bytes: file.size,
          mime,
        },
      });
    }
    const hash = [
      ...new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(kind + digest),
        ),
      ),
    ]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
    const existing =
      await sql`select * from public.cms_media where sha256=${hash} and state='ready'`;
    if (existing[0]) return media(existing[0], true);
    const name = String(form.get("name") ?? (files[0] as File).name)
      // eslint-disable-next-line no-control-regex -- Remove control characters from display names.
      .replace(/[\u0000-\u001f]/g, "")
      .slice(0, 200);
    await txRun(async (tx) => {
      await lock(tx);
      await quota(tx, total);
      await tx`insert into public.cms_media(id,name,kind,bytes,sha256,variants,state,created_by) values(${id},${name},${kind},${total},${hash},${tx.json(parts.map((p) => p.variant) as never)},'uploading',${user})`;
    });
    try {
      for (const part of parts) {
        const { error } = await admin.storage
          .from(PRIVATE)
          .upload(part.variant.path, part.bytes, {
            contentType: part.variant.mime,
            cacheControl: "31536000",
          });
        if (error) throw new EditorialError("upload_failed", 503);
      }
      const [row] =
        await sql`update public.cms_media set state='ready' where id=${id} returning *`;
      return media(row, true);
    } catch (error) {
      const removed = await admin.storage
        .from(PRIVATE)
        .remove(parts.map((p) => p.variant.path));
      if (!removed.error)
        await sql`delete from public.cms_media where id=${id}`;
      else await sql`update public.cms_media set state='failed' where id=${id}`;
      throw error;
    }
  }
  async function getEntry(id: string) {
    const [row] =
      await sql`select e.*,coalesce(p.data->>'firstName','')||' '||coalesce(p.data->>'lastName','') as author_name from public.cms_entries e left join public.portal_profiles p on p.id=e.updated_by where e.id=${id}`;
    if (!row) throw new EditorialError("not_found", 404);
    const [pub] =
      await sql`select * from public.cms_publications where entry_id=${id}`;
    return entry(row, pub);
  }
  async function current(
    tx: Sql,
    id: string,
    version: unknown,
    allowDeleted = false,
  ) {
    const [row] =
      await tx`select * from public.cms_entries where id=${id} for update`;
    if (!row) throw new EditorialError("not_found", 404);
    if (!Number.isSafeInteger(version) || Number(row.version) !== version)
      throw new EditorialError("conflict", 409);
    if (row.deleted_at && !allowDeleted)
      throw new EditorialError("trashed", 409);
    return row;
  }
  async function unused(tx: Sql, id: string) {
    const [row] =
      await tx`select exists(select 1 from public.cms_media_links where media_id=${id}) or exists(select 1 from public.cms_revisions where ${id}::uuid=any(media_ids)) as used`;
    return !row.used;
  }

  async function handle(req: Request) {
    const origin = req.headers.get("origin");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Vary: "Origin",
      "Access-Control-Allow-Headers":
        "authorization,apikey,content-type,x-client-info",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    };
    if (origin && portalOrigins.includes(origin))
      headers["Access-Control-Allow-Origin"] = origin;
    const respond = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers });
    if (origin && !portalOrigins.includes(origin))
      return respond({ code: "forbidden" }, 403);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    const url = new URL(req.url),
      path = url.pathname.replace(/^\/editorial(?=\/|$)/, "") || "/";
    try {
      if (req.method === "GET" && path === "/public/index") {
        const rows =
          await sql`select p.*,m.id as cover_media_id from public.cms_publications p left join public.cms_media m on m.id::text=p.snapshot->'cover'->>'mediaId' order by p.published_at desc`;
        const covers = await mediaRows(
          rows.map((r) => String(r.cover_media_id ?? "")).filter(Boolean),
        );
        const publicCovers = new Map(
          await Promise.all(
            covers
              .filter((r) => r.is_public)
              .map(async (r) => [String(r.id), await media(r)] as const),
          ),
        );
        return respond(
          rows.map((r) => ({
            ...publication(r),
            coverMedia: publicCovers.get(String(r.cover_media_id)) ?? null,
          })),
        );
      }
      if (req.method === "GET" && path === "/public/document") {
        const route = url.searchParams.get("path");
        if (!route || route.length > 300)
          throw new EditorialError("invalid_input");
        const [row] =
          await sql`select * from public.cms_publications where path=${route}`;
        if (!row) throw new EditorialError("not_found", 404);
        if (row.status === "withdrawn")
          return respond({ code: "withdrawn" }, 410);
        const doc = row.snapshot as EditorialDocument;
        const mediaList = await mediaRows(documentMedia(doc));
        if (mediaList.some((m) => !m.is_public))
          throw new EditorialError("media_unavailable", 503);
        const resolvedMedia = await Promise.all(mediaList.map((r) => media(r)));
        return respond({
          ...publication(row),
          document: doc,
          media: resolvedMedia,
          coverMedia:
            resolvedMedia.find((m) => m.id === doc.cover?.mediaId) ?? null,
        });
      }
      const token = req.headers
        .get("authorization")
        ?.replace(/^Bearer\s+/i, "");
      if (!token) throw new EditorialError("unauthenticated", 401);
      const { data, error } = await admin.auth.getUser(token);
      if (error || !data.user) throw new EditorialError("unauthenticated", 401);
      const [profile] =
        await sql`select data from public.portal_profiles where id=${data.user.id} and role='admin' and status='active'`;
      if (!profile) throw new EditorialError("forbidden", 403);
      const user = data.user.id,
        name =
          `${profile.data.firstName} ${profile.data.lastName}`.trim() ||
          "LDgenX";
      if (req.method !== "GET") {
        const [rate] =
          await sql`insert into private.portal_rate_limits(key,hits,window_at) values(${`cms:${user}`},1,now()) on conflict(key) do update set hits=case when portal_rate_limits.window_at<now()-interval '1 minute' then 1 else portal_rate_limits.hits+1 end,window_at=case when portal_rate_limits.window_at<now()-interval '1 minute' then now() else portal_rate_limits.window_at end returning hits`;
        if (Number(rate.hits) > 120)
          throw new EditorialError("rate_limited", 429);
      }
      if (path === "/media" && req.method === "POST")
        return respond(await upload(req, user));
      const body = ["POST", "PATCH"].includes(req.method)
        ? JSON.parse(
            new TextDecoder().decode(
              await readBody(req, LIMITS.documentBytes + 100_000),
            ),
          )
        : {};
      if (path === "/stats" && req.method === "GET")
        return respond(await quota(sql, 0, false));
      if (path === "/media/cleanup" && req.method === "POST") {
        const removed = await txRun(async (tx) => {
          await lock(tx);
          const stale =
            await tx`select * from public.cms_media where state in ('failed','uploading') and created_at < now()-interval '1 hour' limit 30`;
          let count = 0;
          for (const row of stale) {
            if (!(await unused(tx, String(row.id)))) continue;
            const cleanup = await admin.storage
              .from(PRIVATE)
              .remove(values(row.variants).map((v) => v.path));
            if (cleanup.error)
              throw new EditorialError("media_unavailable", 503);
            await tx`delete from public.cms_media where id=${String(row.id)}`;
            count++;
          }
          return count;
        });
        return respond({ removed });
      }
      if (path === "/page-templates" && req.method === "GET")
        return respond(editorialPageTemplates);
      if (path === "/entries" && req.method === "GET") {
        const rows =
          await sql`select e.id,e.kind,e.locale,e.slug,e.group_id,e.legacy_id,e.version,e.published_version,e.created_at,e.updated_at,e.deleted_at,e.draft-'body'-'references' as draft,case when p.entry_id is null then null else to_jsonb(p)||jsonb_build_object('snapshot',p.snapshot-'body'-'references') end as publication from public.cms_entries e left join public.cms_publications p on p.entry_id=e.id order by e.updated_at desc limit 500`;
        const coverIds = [
          ...new Set(
            rows
              .map((r) => (r.draft as EditorialDocument).cover?.mediaId)
              .filter(Boolean),
          ),
        ] as string[];
        let covers: EditorialMedia[] = [];
        try {
          covers = await signedMedia(await mediaRows(coverIds));
        } catch {
          /* A thumbnail failure must not hide the content list. */
        }
        return respond(
          rows.map((r) => {
            const result = entry(r, r.publication as Row | undefined);
            result.document = {
              ...result.document,
              body: { type: "doc", content: [] },
              references: [],
            };
            result.coverMedia =
              covers.find((m) => m.id === result.document.cover?.mediaId) ??
              null;
            return result;
          }),
        );
      }
      if (path === "/entries" && req.method === "POST") {
        const kind = body.kind as ContentKind,
          locale = body.locale as ContentLocale;
        if (!contentKinds.includes(kind) || !["fr", "en"].includes(locale))
          throw new EditorialError("invalid_input");
        const id = crypto.randomUUID();
        let group: string = crypto.randomUUID(),
          document = emptyDocument(),
          targetPath = String(body.pagePath ?? "");
        if (body.translationOf) {
          const original = await getEntry(validId(body.translationOf));
          if (
            original.deletedAt ||
            original.locale === locale ||
            original.kind !== kind
          )
            throw new EditorialError("invalid_input");
          group = original.groupId;
          if (kind === "page")
            targetPath =
              editorialPageTemplates.find(
                (p) =>
                  p.path ===
                  contentPath(original.kind, original.locale, original.slug),
              )?.alternates[locale] ?? "";
          // Do not auto-translate scientific content. The author writes/reviews each language.
          document = {
            ...document,
            doi: original.document.doi,
            journal: original.document.journal,
            year: original.document.year,
            references: original.document.references,
          };
        }
        let slug = `document-${id.slice(0, 8)}`,
          legacyId: string | null = null;
        if (kind === "page") {
          const template = editorialPageTemplates.find(
            (p) => p.path === targetPath && p.locale === locale,
          );
          if (!template) throw new EditorialError("invalid_input");
          slug = template.path.replace(
            locale === "en" ? /^\/en(?:\/|$)/ : /^\//,
            "",
          );
          legacyId = `page:${template.path}`;
          document = {
            ...document,
            title: template.title,
            summary: template.summary,
          };
        }
        let createdId: string = id;
        await txRun(async (tx) => {
          await lock(tx);
          if (kind === "page") {
            const [existing] =
              await tx`select id from public.cms_entries where kind='page' and locale=${locale} and slug=${slug}`;
            if (existing) {
              createdId = String(existing.id);
              return;
            }
          }
          const [count] =
            await tx`select count(*)::int as count from public.cms_entries`;
          if (count.count >= 500) throw new EditorialError("entry_limit", 409);
          await tx`insert into public.cms_entries(id,kind,locale,slug,group_id,legacy_id,draft,created_by,updated_by) values(${id},${kind},${locale},${slug},${group},${legacyId},${tx.json(document as never)},${user},${user})`;
        });
        return respond(await getEntry(createdId), createdId === id ? 201 : 200);
      }
      if (path === "/media" && req.method === "GET") {
        const rows =
          await sql`select m.*,(select count(distinct entry_id) from (select entry_id from public.cms_media_links where media_id=m.id union select entry_id from public.cms_revisions where m.id=any(media_ids)) uses)::int as uses from public.cms_media m where state='ready' order by created_at desc`;
        return respond(await signedMedia(rows));
      }
      let match = path.match(/^\/media\/([^/]+)$/);
      if (match && req.method === "DELETE") {
        const id = validId(match[1]);
        await txRun(async (tx) => {
          await lock(tx);
          if (!(await unused(tx, id)))
            throw new EditorialError("media_in_use", 409);
          const [row] = await tx`select * from public.cms_media where id=${id}`;
          if (!row) throw new EditorialError("not_found", 404);
          for (const bucket of [PRIVATE, PUBLIC]) {
            const r = await admin.storage
              .from(bucket)
              .remove(values(row.variants).map((v) => v.path));
            if (r.error) throw new EditorialError("media_unavailable", 503);
          }
          await tx`delete from public.cms_media where id=${id}`;
        });
        return respond({ ok: true });
      }
      match = path.match(
        /^\/entries\/([^/]+)(?:\/(publish|withdraw|revisions|restore|trash|untrash))?$/,
      );
      if (!match) throw new EditorialError("not_found", 404);
      const id = validId(match[1]),
        action = match[2];
      if (
        (action === "trash" || action === "untrash") &&
        req.method === "POST"
      ) {
        await txRun(async (tx) => {
          await lock(tx);
          const row = await current(tx, id, body.version, action === "untrash");
          if (action === "untrash") {
            if (!row.deleted_at) throw new EditorialError("conflict", 409);
            await revision(tx, row, name, "untrash");
            await tx`update public.cms_entries set deleted_at=null,deleted_by=null,draft=jsonb_set(draft,'{reviewed}','false'::jsonb),version=version+1,updated_at=now(),updated_by=${user} where id=${id}`;
          } else {
            await revision(tx, row, name, "trash");
            if (row.legacy_id || row.published_version) {
              const route = contentPath(
                row.kind as ContentKind,
                row.locale as ContentLocale,
                String(row.slug),
              );
              await tx`insert into public.cms_publications(entry_id,kind,locale,slug,path,group_id,legacy_id,status,snapshot) values(${id},${String(row.kind)},${String(row.locale)},${String(row.slug)},${route},${String(row.group_id)},${row.legacy_id as string | null},'withdrawn',null) on conflict(entry_id) do update set status='withdrawn',snapshot=null,updated_at=now()`;
              await tx`delete from public.cms_media_links where entry_id=${id} and stage='published'`;
            }
            await tx`update public.cms_entries set deleted_at=now(),deleted_by=${user},version=version+1,updated_at=now(),updated_by=${user} where id=${id}`;
          }
        });
        return respond(await getEntry(id));
      }
      if (!action && req.method === "DELETE") {
        await txRun(async (tx) => {
          await lock(tx);
          const [row] =
            await tx`select * from public.cms_entries where id=${id} for update`;
          if (!row) throw new EditorialError("not_found", 404);
          if (row.legacy_id || row.published_version)
            throw new EditorialError("withdraw_required", 409);
          await tx`delete from public.cms_publications where entry_id=${id}`;
          await tx`delete from public.cms_entries where id=${id}`;
        });
        return respond({ ok: true });
      }
      if (!action && req.method === "GET") return respond(await getEntry(id));
      if (!action && req.method === "PATCH") {
        const doc = validateDocument(body.document);
        await txRun(async (tx) => {
          await lock(tx);
          const row = await current(tx, id, body.version);
          let slug = String(row.slug);
          if (!row.legacy_id && !row.published_version) {
            const next = contentSlug(
              String(
                body.slug ?? (slug.startsWith("document-") ? doc.title : slug),
              ),
            );
            if (next) slug = next;
            if (
              editorialStaticPaths.includes(
                contentPath(
                  row.kind as ContentKind,
                  row.locale as ContentLocale,
                  slug,
                ),
              )
            )
              throw new EditorialError("slug_taken", 409);
          }
          await syncLinks(tx, id, doc, "draft");
          if (body.checkpoint) await revision(tx, row, name, "save");
          await tx`update public.cms_entries set draft=${tx.json(doc as never)},slug=${slug},version=version+1,updated_at=now(),updated_by=${user} where id=${id}`;
        });
        return respond(await getEntry(id));
      }
      if (action === "revisions" && req.method === "GET") {
        const rows =
          await sql`select * from public.cms_revisions where entry_id=${id} order by id desc limit ${LIMITS.revisionsPerEntry}`;
        return respond(
          rows.map((r) => ({
            id: String(r.id),
            version: r.version,
            reason: r.reason,
            author: r.author,
            createdAt: iso(r.created_at),
            document: r.document,
          })),
        );
      }
      if (action === "restore" && req.method === "POST") {
        if (!/^\d+$/.test(String(body.revision)))
          throw new EditorialError("invalid_input");
        await txRun(async (tx) => {
          await lock(tx);
          const row = await current(tx, id, body.version);
          const [old] =
            await tx`select * from public.cms_revisions where id=${String(body.revision)}::bigint and entry_id=${id}`;
          if (!old) throw new EditorialError("not_found", 404);
          const doc = validateDocument(old.document);
          doc.reviewed = false;
          await syncLinks(tx, id, doc, "draft");
          await revision(tx, row, name, "restore");
          await tx`update public.cms_entries set draft=${tx.json(doc as never)},version=version+1,updated_at=now(),updated_by=${user} where id=${id}`;
        });
        return respond(await getEntry(id));
      }
      if (action === "publish" && req.method === "POST") {
        await txRun(async (tx) => {
          await lock(tx);
          const row = await current(tx, id, body.version),
            doc = validateDocument(row.draft);
          const issues = publicationIssues(doc, row.kind as ContentKind);
          if (issues.length)
            throw new EditorialError("publication_incomplete", 400, issues);
          const assets = await syncLinks(tx, id, doc, "published");
          await quota(
            tx,
            assets
              .filter((m) => !m.is_public)
              .reduce((n, m) => n + Number(m.bytes), 0),
          );
          const copied: string[] = [];
          try {
            for (const asset of assets)
              if (!asset.is_public) {
                for (const variant of values(asset.variants)) {
                  const copy = await admin.storage
                    .from(PRIVATE)
                    .copy(variant.path, variant.path, {
                      destinationBucket: PUBLIC,
                    });
                  if (copy.error)
                    throw new EditorialError("publish_failed", 503);
                  copied.push(variant.path);
                }
                await tx`update public.cms_media set is_public=true where id=${String(asset.id)}`;
              }
            const route = contentPath(
              row.kind as ContentKind,
              row.locale as ContentLocale,
              String(row.slug),
            );
            await revision(tx, row, name, "publish");
            await tx`insert into public.cms_publications(entry_id,kind,locale,slug,path,group_id,legacy_id,status,snapshot) values(${id},${String(row.kind)},${String(row.locale)},${String(row.slug)},${route},${String(row.group_id)},${row.legacy_id as string | null},'published',${tx.json(doc as never)}) on conflict(entry_id) do update set snapshot=excluded.snapshot,status='published',updated_at=now()`;
            await tx`update public.cms_entries set published_version=version+1,version=version+1,updated_at=now(),updated_by=${user} where id=${id}`;
          } catch (e) {
            if (copied.length) await admin.storage.from(PUBLIC).remove(copied);
            throw e;
          }
        });
        return respond(await getEntry(id));
      }
      if (action === "withdraw" && req.method === "POST") {
        await txRun(async (tx) => {
          await lock(tx);
          const row = await current(tx, id, body.version);
          if (!row.legacy_id && !row.published_version)
            throw new EditorialError("not_published", 409);
          await revision(tx, row, name, "withdraw");
          const route = contentPath(
            row.kind as ContentKind,
            row.locale as ContentLocale,
            String(row.slug),
          );
          await tx`insert into public.cms_publications(entry_id,kind,locale,slug,path,group_id,legacy_id,status,snapshot) values(${id},${String(row.kind)},${String(row.locale)},${String(row.slug)},${route},${String(row.group_id)},${row.legacy_id as string | null},'withdrawn',null) on conflict(entry_id) do update set status='withdrawn',snapshot=null,updated_at=now()`;
          await tx`delete from public.cms_media_links where entry_id=${id} and stage='published'`;
          await tx`update public.cms_entries set version=version+1,updated_at=now(),updated_by=${user} where id=${id}`;
        });
        return respond(await getEntry(id));
      }
      throw new EditorialError("not_found", 404);
    } catch (error) {
      if (error instanceof SyntaxError)
        return respond({ code: "invalid_input" }, 400);
      if (error instanceof EditorialError)
        return respond(
          { code: error.code, details: error.details },
          error.status,
        );
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      )
        return respond({ code: "slug_taken" }, 409);
      console.error(
        "Editorial operation failed",
        error instanceof Error ? error.name : "unknown",
      );
      return respond({ code: "unavailable" }, 503);
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
