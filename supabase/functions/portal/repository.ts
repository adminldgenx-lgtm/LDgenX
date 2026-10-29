import type { Sql } from 'npm:postgres@3.4.7';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.118.0';
import type { Records, Repository } from '../_shared/service.ts';
import {
  PortalError,
  type Appointment,
  type InviteInput,
  type User,
} from '../_shared/types.ts';
import { heldSpans } from '../_shared/availability.ts';
import { portalSiteOrigin } from '../_shared/site.ts';
import {
  enqueueCalendarAppointment,
  enqueueCalendarBlocks,
  externalCalendarBusy,
} from '../_shared/google-calendar.ts';

export function repository(
  sql: Sql,
  storage: SupabaseClient,
  uploaded: string[],
): Repository {
  return {
    async externalBusy(from, to) {
      try {
        return await externalCalendarBusy(sql, from, to);
      } catch {
        throw new PortalError('calendar_unavailable');
      }
    },
    async get(kind, id) {
      // IDs are validated before use so malformed client input never becomes a SQL cast error.
      if (
        !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(id)
      )
        throw new PortalError('invalid_input');
      const rows =
        await sql`select data from ${sql(`public.portal_${kind}`)} where id = ${id}`;
      return rows[0]?.data ?? null;
    },
    async list(kind, clientId) {
      const table = sql(`public.portal_${kind}`);
      const rows =
        clientId && kind !== 'profiles' && kind !== 'inquiries'
          ? await sql`select data from ${table} where client_id = ${clientId} order by id`
          : await sql`select data from ${table} order by id`;
      return rows.map((r) => r.data);
    },
    async put<K extends keyof Records>(kind: K, value: Records[K]) {
      const v = value as unknown as Record<string, unknown>;
      const row: Record<string, unknown> = {
        id: v.id,
        data: sql.json(v as never),
      };
      if (['messages', 'files', 'appointments', 'activity'].includes(kind))
        row.client_id = v.clientId;
      if (kind === 'messages') row.author_id = v.authorId;
      if (kind === 'files') {
        row.uploaded_by = v.uploadedBy;
        row.object_path = `${v.clientId}/${v.id}`;
      }
      await sql`insert into ${sql(`public.portal_${kind}`)} ${sql(row as never)} on conflict (id) do update set data=excluded.data`;
      if (kind === 'appointments') {
        const a = value as Appointment;
        await sql`delete from public.portal_reservations where appointment_id=${a.id}`;
        // client_id can change only through trusted server code, never an arbitrary browser patch.
        await sql`update public.portal_appointments set client_id=${a.clientId} where id=${a.id}`;
        for (const h of heldSpans(a))
          await sql`insert into public.portal_reservations(appointment_id,host_id,slot) values (${a.id},${h.hostId},tstzrange(${new Date(h.span.start).toISOString()}::timestamptz,${new Date(h.span.end).toISOString()}::timestamptz,'[)'))`;
        await enqueueCalendarAppointment(sql, a.id);
      }
    },
    async remove(kind, id) {
      if (kind === 'files')
        await sql`insert into private.portal_storage_cleanup(path) select object_path from public.portal_files where id=${id} on conflict do nothing`;
      await sql`delete from ${sql(`public.portal_${kind}`)} where id=${id}`;
    },
    async setting<T>(key: string): Promise<T> {
      const rows =
        await sql`select data from public.portal_settings where id=${key}`;
      if (!rows[0]) throw new Error('Missing portal settings');
      return rows[0].data;
    },
    async setSetting(key, value) {
      const previous =
        key === 'booking'
          ? (
              await sql`select data from public.portal_settings where id='booking'`
            )[0]?.data
          : undefined;
      await sql`insert into public.portal_settings(id,data) values (${key},${sql.json(value as never)}) on conflict(id) do update set data=excluded.data`;
      if (key === 'booking')
        await enqueueCalendarBlocks(
          sql,
          value as import('../_shared/types.ts').BookingConfig,
          previous,
        );
    },
    async upload(file, path) {
      const { error } = await storage.storage
        .from('portal-files')
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });
      if (error) throw new PortalError('network');
      uploaded.push(path);
    },
    async sign(path) {
      const { data, error } = await storage.storage
        .from('portal-files')
        .createSignedUrl(path, 60, { download: true });
      if (error || !data) throw new PortalError('not_found');
      return data.signedUrl;
    },
    async email(recipient, subject, body, sourceId) {
      await sql`insert into private.portal_email_outbox(recipient,subject,body,source_id) values(${recipient},${subject},${body},${sourceId ?? null})`;
    },
    async invite(input: InviteInput): Promise<User> {
      const { data, error } = await storage.auth.admin.inviteUserByEmail(
        input.email,
        {
          data: { ...input, phone: '' },
          redirectTo: `${portalSiteOrigin(Deno.env.get('PORTAL_SITE_URL'))}/espace/nouveau-mot-de-passe`,
        },
      );
      if (error || !data.user)
        throw new PortalError(
          error?.message.includes('already')
            ? 'email_taken'
            : 'email_unavailable',
        );
      const rows =
        await sql`select data from public.portal_profiles where id=${data.user.id}`;
      const p = rows[0].data as User;
      p.status = 'active';
      await sql`update public.portal_profiles set data=${sql.json(p as never)} where id=${p.id}`;
      return p;
    },
  };
}
