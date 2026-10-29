import {
  PortalError,
  type Activity,
  type ActivityKind,
  type Appointment,
  type BookingConfig,
  type FileItem,
  type Inquiry,
  type InquiryInput,
  type InviteInput,
  type Message,
  type ProfilePatch,
  type RequestInput,
  type RetentionSettings,
  type ScheduleInput,
  type TimeBlock,
  type User,
} from './types.ts';
import { computeSlots, heldSpans } from './availability.ts';
import { fileExpiry } from './retention.ts';
import { DAY, MINUTE } from './time.ts';
import { productionOrigin } from './site.ts';

export interface Records {
  profiles: User;
  messages: Message;
  files: FileItem;
  inquiries: Inquiry;
  appointments: Appointment;
  activity: Activity;
}
export interface Repository {
  get<K extends keyof Records>(kind: K, id: string): Promise<Records[K] | null>;
  list<K extends keyof Records>(
    kind: K,
    clientId?: string,
  ): Promise<Records[K][]>;
  put<K extends keyof Records>(kind: K, value: Records[K]): Promise<void>;
  remove(kind: keyof Records, id: string): Promise<void>;
  setting<T>(key: 'booking' | 'retention'): Promise<T>;
  setSetting(key: 'booking' | 'retention', value: unknown): Promise<void>;
  upload(file: File, path: string): Promise<void>;
  sign(path: string): Promise<string>;
  email(
    recipient: string,
    subject: string,
    body: string,
    sourceId?: string,
  ): Promise<void>;
  invite(input: InviteInput): Promise<User>;
}
const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const fullName = (u: User) => `${u.firstName} ${u.lastName}`.trim();
const expired = (f: FileItem) =>
  !!f.expiresAt && Date.parse(f.expiresAt) <= Date.now();
export function text(value: unknown, max = 10000, required = false): string {
  if (
    typeof value !== 'string' ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new PortalError('invalid_input');
  return value.trim();
}
export function date(value: unknown) {
  const v = text(value, 40, true);
  if (!Number.isFinite(Date.parse(v))) throw new PortalError('invalid_input');
  return new Date(v).toISOString();
}
export function email(value: unknown) {
  const v = text(value, 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    throw new PortalError('invalid_input');
  return v;
}
function url(value: unknown) {
  const v = text(value, 2000);
  if (v && !/^https:\/\//i.test(v)) throw new PortalError('invalid_input');
  try {
    if (v) new URL(v);
  } catch {
    throw new PortalError('invalid_input');
  }
  return v;
}
function guest(value: RequestInput['guest']) {
  if (!value) throw new PortalError('invalid_input');
  return {
    name: text(value.name, 200, true),
    email: email(value.email),
    organisation: text(value.organisation, 200),
    phone: text(value.phone, 50),
  };
}
function integer(v: unknown, min: number, max: number) {
  if (!Number.isInteger(v) || Number(v) < min || Number(v) > max)
    throw new PortalError('invalid_input');
}
function bilingual(v: unknown) {
  if (!v || typeof v !== 'object') throw new PortalError('invalid_input');
  const t = v as Record<string, unknown>;
  text(t.fr, 2000);
  text(t.en, 2000);
}
export function validateBooking(c: BookingConfig) {
  integer(c.bufferMinutes, 0, 120);
  integer(c.minNoticeHours, 0, 720);
  integer(c.horizonDays, 1, 365);
  integer(c.stepMinutes, 5, 120);
  if (
    !['manual', 'auto'].includes(c.approval) ||
    !Array.isArray(c.types) ||
    !Array.isArray(c.hosts) ||
    !Array.isArray(c.rules) ||
    !Array.isArray(c.blocks) ||
    !Array.isArray(c.closedDays)
  )
    throw new PortalError('invalid_input');
  if (
    c.types.length > 30 ||
    c.hosts.length > 30 ||
    c.rules.length > 500 ||
    c.blocks.length > 1000 ||
    c.closedDays.length > 1000
  )
    throw new PortalError('invalid_input');
  for (const items of [c.types, c.hosts, c.rules, c.blocks]) {
    if (new Set(items.map((x) => x.id)).size !== items.length)
      throw new PortalError('invalid_input');
    for (const x of items) text(x.id, 100, true);
  }
  for (const t of c.types) {
    bilingual(t.label);
    bilingual(t.description);
    integer(t.minutes, 5, 480);
    if (
      typeof t.active !== 'boolean' ||
      typeof t.public !== 'boolean' ||
      !['video', 'phone', 'lab'].includes(t.location) ||
      !/^#[\da-f]{6}$/i.test(t.colour)
    )
      throw new PortalError('invalid_input');
  }
  for (const h of c.hosts) {
    text(h.name, 200, true);
    bilingual(h.role);
    if (typeof h.bookable !== 'boolean' || !/^#[\da-f]{6}$/i.test(h.colour))
      throw new PortalError('invalid_input');
  }
  for (const r of c.rules) {
    integer(r.weekday, 0, 6);
    if (
      !c.hosts.some((h) => h.id === r.hostId) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(r.start) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(r.end) ||
      r.start >= r.end
    )
      throw new PortalError('invalid_input');
  }
  for (const b of c.blocks) validateBlock(b, c);
  for (const d of c.closedDays)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d)))
      throw new PortalError('invalid_input');
}
function validateBlock(b: Omit<TimeBlock, 'id'>, c: BookingConfig) {
  if (
    date(b.start) >= date(b.end) ||
    (b.hostId !== null && !c.hosts.some((h) => h.id === b.hostId))
  )
    throw new PortalError('invalid_input');
  text(b.reason, 500);
}

/** One service per verified HTTP request. The repository owns the database transaction. */
export class PortalService {
  constructor(
    private db: Repository,
    private user: User | null,
  ) {}
  private need(admin = false): User {
    if (!this.user) throw new PortalError('unauthenticated');
    if (this.user.status === 'disabled')
      throw new PortalError('account_disabled');
    if (admin && (this.user.role !== 'admin' || this.user.status !== 'active'))
      throw new PortalError('forbidden');
    return this.user;
  }
  private async client(id: string) {
    const u = this.need();
    if (u.role !== 'admin' && u.id !== id) throw new PortalError('forbidden');
    const client = await this.db.get('profiles', id);
    if (!client || client.role !== 'client') throw new PortalError('not_found');
    return client;
  }
  private async appointment(id: string) {
    const u = this.need();
    const a = await this.db.get('appointments', id);
    if (!a) throw new PortalError('not_found');
    if (u.role !== 'admin' && a.clientId !== u.id)
      throw new PortalError('forbidden');
    return a;
  }
  private async log(
    kind: ActivityKind,
    clientId: string | null,
    values: Activity['data'],
    audience?: Activity['audience'],
  ) {
    const u = this.user;
    const recipients = audience ?? {
      admins: u?.role !== 'admin',
      clientId: u?.role === 'admin' ? clientId : null,
    };
    const eventId = uuid();
    await this.db.put('activity', {
      id: eventId,
      kind,
      at: now(),
      actorId: u?.id ?? null,
      clientId,
      audience: recipients,
      data: values,
      readBy: u ? [u.id] : [],
    });
    const pref =
      kind === 'message'
        ? 'messages'
        : kind === 'file_uploaded'
          ? 'files'
          : kind === 'purge'
            ? 'weeklyPurge'
            : 'appointments';
    const people = recipients.admins
      ? (await this.db.list('profiles')).filter((p) => p.role === 'admin')
      : recipients.clientId
        ? [await this.db.get('profiles', recipients.clientId)]
        : [];
    for (const person of people)
      if (
        person &&
        person.id !== u?.id &&
        person.status !== 'disabled' &&
        person.notify[pref]
      ) {
        const fr = person.locale === 'fr';
        await this.db.email(
          person.email,
          fr
            ? 'LDgenX — Nouvelle activité dans votre espace'
            : 'LDgenX — New activity in your account',
          `${fr ? 'Une nouvelle activité vous attend dans votre espace LDgenX.' : 'There is new activity in your LDgenX account.'}\n${productionOrigin}/${person.role === 'admin' ? 'admin' : 'espace'}`,
          eventId,
        );
      }
    return eventId;
  }
  private async config() {
    return this.db.setting<BookingConfig>('booking');
  }
  private async freeSlot(
    typeId: string,
    start: string,
    hostId?: string,
    ignore?: string,
  ) {
    const config = await this.config();
    const at = Date.parse(date(start));
    const slot = computeSlots(
      config,
      await this.db.list('appointments'),
      typeId,
      at,
      at + DAY,
      Date.now(),
      hostId,
      ignore,
    ).find((s) => s.start === new Date(at).toISOString());
    if (!slot) throw new PortalError('slot_taken');
    return slot;
  }
  private async checkFree(
    hostId: string,
    start: string,
    end: string,
    ignore?: string,
  ) {
    const c = await this.config();
    if (
      !c.hosts.some((h) => h.id === hostId && h.bookable) ||
      date(start) >= date(end)
    )
      throw new PortalError('invalid_input');
    // Team scheduling may go outside opening hours, but it still respects held appointments.
    if (
      (await this.db.list('appointments')).some(
        (a) =>
          a.id !== ignore &&
          heldSpans(a).some(
            (h) =>
              h.hostId === hostId &&
              Date.parse(start) < h.span.end &&
              Date.parse(end) > h.span.start,
          ),
      )
    )
      throw new PortalError('slot_taken');
  }
  private async type(typeId: string) {
    const t = (await this.config()).types.find(
      (t) => t.id === typeId && t.active,
    );
    if (!t) throw new PortalError('invalid_input');
    return t;
  }
  private async saveAppointment(
    a: Appointment,
    kind?: ActivityKind,
    eventStart = a.start,
  ) {
    a.updatedAt = now();
    await this.db.put('appointments', a);
    if (kind) {
      const p = a.clientId ? await this.db.get('profiles', a.clientId) : null;
      const eventId = await this.log(kind, a.clientId, {
        name: p ? fullName(p) : (a.guest?.name ?? ''),
        type: a.typeId,
        start: eventStart,
      });
      if (a.guest)
        await this.db.email(
          a.guest.email,
          'LDgenX — Rendez-vous / Appointment',
          `${a.status}\n${a.start}\n${a.reply}\n${a.meetingUrl}\nContact : info@ldgenx.fr`,
          eventId,
        );
    }
    return a;
  }
  currentUser() {
    return this.user ? this.need() : null;
  }
  async updateProfile(patch: ProfilePatch) {
    const u = this.need();
    const next = { ...u };
    for (const key of [
      'firstName',
      'lastName',
      'organisation',
      'phone',
    ] as const)
      if (key in patch)
        next[key] = text(
          patch[key],
          key === 'phone' ? 50 : 200,
          key === 'firstName' || key === 'lastName',
        );
    if ('locale' in patch) {
      if (patch.locale !== 'fr' && patch.locale !== 'en')
        throw new PortalError('invalid_input');
      next.locale = patch.locale;
    }
    if ('notify' in patch) {
      if (
        !patch.notify ||
        Object.values(patch.notify).some((v) => typeof v !== 'boolean') ||
        Object.keys(patch.notify).sort().join() !==
          'appointments,files,messages,weeklyPurge'
      )
        throw new PortalError('invalid_input');
      next.notify = patch.notify;
    }
    await this.db.put('profiles', next);
    return next;
  }
  async listTeam() {
    this.need();
    return (await this.db.list('profiles'))
      .filter((p) => p.role === 'admin' && p.status === 'active')
      .map(({ id, firstName, lastName }) => ({ id, firstName, lastName }));
  }
  async listClients() {
    this.need(true);
    return (await this.db.list('profiles')).filter((p) => p.role === 'client');
  }
  async getUser(id: string) {
    const u = this.need();
    if (u.role !== 'admin' && u.id !== id) throw new PortalError('forbidden');
    const p = await this.db.get('profiles', id);
    if (!p) throw new PortalError('not_found');
    return p;
  }
  async setAccountStatus(id: string, status: User['status']) {
    this.need(true);
    if (!['pending', 'active', 'disabled'].includes(status))
      throw new PortalError('invalid_input');
    const p = await this.client(id);
    p.status = status;
    await this.db.put('profiles', p);
    return p;
  }
  async inviteClient(input: InviteInput) {
    this.need(true);
    return this.db.invite({
      email: email(input.email),
      firstName: text(input.firstName, 100, true),
      lastName: text(input.lastName, 100, true),
      organisation: text(input.organisation, 200),
      locale: input.locale === 'en' ? 'en' : 'fr',
    });
  }
  async listThreads() {
    const u = this.need();
    const people = u.role === 'admin' ? await this.db.list('profiles') : [u];
    const admins = new Set(
      (await this.db.list('profiles'))
        .filter((p) => p.role === 'admin')
        .map((p) => p.id),
    );
    const messages = await this.db.list(
      'messages',
      u.role === 'admin' ? undefined : u.id,
    );
    return people
      .filter((p) => p.role === 'client')
      .map((p) => {
        const list = messages
          .filter((m) => m.clientId === p.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        return {
          clientId: p.id,
          lastMessage: list.at(-1) ?? null,
          unread: list.filter((m) =>
            u.role === 'admin'
              ? m.authorId === p.id && !m.readBy.some((r) => admins.has(r))
              : m.authorId !== u.id && !m.readBy.includes(u.id),
          ).length,
        };
      })
      .sort((a, b) =>
        (b.lastMessage?.createdAt ?? '').localeCompare(
          a.lastMessage?.createdAt ?? '',
        ),
      );
  }
  async listMessages(clientId: string) {
    await this.client(clientId);
    return (await this.db.list('messages', clientId)).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }
  private async storeFile(clientId: string, file: File, note = '') {
    const u = this.need();
    if (!(file instanceof File) || file.size <= 0 || file.size > 10485760)
      throw new PortalError('invalid_input');
    const item: FileItem = {
      id: uuid(),
      clientId,
      uploadedBy: u.id,
      name: text(file.name, 255, true),
      size: file.size,
      type: text(file.type || 'application/octet-stream', 200),
      note: text(note, 2000),
      direction: u.role === 'admin' ? 'to_client' : 'from_client',
      createdAt: now(),
      kept: false,
      expiresAt: null,
      downloads: [],
    };
    item.expiresAt = fileExpiry(item, await this.db.setting('retention'));
    await this.db.upload(file, `${clientId}/${item.id}`);
    await this.db.put('files', item);
    await this.log('file_uploaded', clientId, { name: item.name });
    return item;
  }
  async sendMessage(clientId: string, body: string, files: File[] = []) {
    const u = this.need();
    await this.client(clientId);
    const clean = text(body);
    if (
      (!clean && !files.length) ||
      files.length > 6 ||
      files.reduce((n, f) => n + f.size, 0) > 20971520
    )
      throw new PortalError('invalid_input');
    const fileIds = [];
    for (const f of files) fileIds.push((await this.storeFile(clientId, f)).id);
    const m: Message = {
      id: uuid(),
      clientId,
      authorId: u.id,
      body: clean,
      fileIds,
      createdAt: now(),
      readBy: [u.id],
    };
    await this.db.put('messages', m);
    await this.log('message', clientId, { name: fullName(u) });
    return m;
  }
  async markThreadRead(clientId: string) {
    const u = this.need();
    await this.client(clientId);
    for (const m of await this.db.list('messages', clientId))
      if (!m.readBy.includes(u.id)) {
        m.readBy.push(u.id);
        await this.db.put('messages', m);
      }
    await this.markActivityRead({ kinds: ['message'], clientId });
  }
  async listInquiries() {
    this.need(true);
    return (await this.db.list('inquiries')).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
  async setInquiryStatus(id: string, status: Inquiry['status']) {
    this.need(true);
    if (!['new', 'read', 'done'].includes(status))
      throw new PortalError('invalid_input');
    const i = await this.db.get('inquiries', id);
    if (!i) throw new PortalError('not_found');
    i.status = status;
    await this.db.put('inquiries', i);
    return i;
  }
  async submitInquiry(input: InquiryInput) {
    const i: Inquiry = {
      id: uuid(),
      name: text(input.name, 200, true),
      email: email(input.email),
      organisation: text(input.organisation, 200),
      sector: text(input.sector, 200),
      material: text(input.material, 200),
      timeline: text(input.timeline, 200),
      message: text(input.message, 3500, true),
      locale: input.locale === 'en' ? 'en' : 'fr',
      createdAt: now(),
      status: 'new',
    };
    await this.db.put('inquiries', i);
    await this.log(
      'inquiry',
      null,
      { name: i.name },
      { admins: true, clientId: null },
    );
  }
  async listFiles(clientId?: string) {
    const u = this.need();
    if (clientId) await this.client(clientId);
    return (await this.db.list('files', u.role === 'admin' ? clientId : u.id))
      .filter((f) => !expired(f))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  async uploadFile(clientId: string, file: File, note = '') {
    await this.client(clientId);
    return this.storeFile(clientId, file, note);
  }
  private async file(id: string) {
    const f = await this.db.get('files', id);
    if (!f || expired(f)) throw new PortalError('not_found');
    await this.client(f.clientId);
    return f;
  }
  async downloadFile(id: string) {
    const u = this.need(),
      f = await this.file(id);
    const signed = await this.db.sign(`${f.clientId}/${f.id}`);
    f.downloads.push({ userId: u.id, at: now() });
    f.downloads = f.downloads.slice(-1000);
    await this.db.put('files', f);
    return { url: signed };
  }
  async deleteFile(id: string) {
    const u = this.need(),
      f = await this.file(id);
    if (u.role !== 'admin' && f.uploadedBy !== u.id)
      throw new PortalError('forbidden');
    await this.db.remove('files', id);
  }
  async keepFile(id: string, kept: boolean) {
    this.need(true);
    if (typeof kept !== 'boolean') throw new PortalError('invalid_input');
    const f = await this.file(id);
    f.kept = kept;
    f.expiresAt = fileExpiry(f, await this.db.setting('retention'));
    await this.db.put('files', f);
    return f;
  }
  async getRetention() {
    this.need();
    return this.db.setting<RetentionSettings>('retention');
  }
  async updateRetention(patch: Partial<RetentionSettings>) {
    this.need(true);
    const c = await this.db.setting<RetentionSettings>('retention');
    for (const k of [
      'enabled',
      'weekday',
      'hour',
      'minimumDays',
      'notice',
    ] as const)
      if (k in patch) Object.assign(c, { [k]: patch[k] });
    if (typeof c.enabled !== 'boolean') throw new PortalError('invalid_input');
    integer(c.weekday, 0, 6);
    integer(c.hour, 0, 23);
    integer(c.minimumDays, 1, 365);
    bilingual(c.notice);
    await this.db.setSetting('retention', c);
    for (const f of await this.db.list('files')) {
      f.expiresAt = fileExpiry(f, c);
      await this.db.put('files', f);
    }
    return c;
  }
  async purgeNow() {
    this.need(true);
    const files = (await this.db.list('files')).filter((f) => !f.kept);
    for (const f of files) await this.db.remove('files', f.id);
    const c = await this.db.setting<RetentionSettings>('retention');
    c.lastPurgeAt = now();
    await this.db.setSetting('retention', c);
    await this.log(
      'purge',
      null,
      { count: files.length },
      { admins: true, clientId: null },
    );
    return { count: files.length };
  }
  async getBookingConfig() {
    const c = await this.config();
    if (this.user?.role !== 'admin') {
      c.blocks = [];
      c.types = c.types.filter((t) => t.public || !!this.user);
    }
    return c;
  }
  async updateBookingConfig(patch: Partial<BookingConfig>) {
    this.need(true);
    const c = await this.config();
    for (const k of [
      'types',
      'hosts',
      'rules',
      'blocks',
      'bufferMinutes',
      'minNoticeHours',
      'horizonDays',
      'stepMinutes',
      'closedDays',
      'approval',
    ] as const)
      if (k in patch) Object.assign(c, { [k]: patch[k] });
    validateBooking(c);
    const live = (await this.db.list('appointments')).filter(
      (a) => a.status === 'requested' || a.status === 'confirmed',
    );
    if (
      live.some(
        (a) =>
          !c.types.some((t) => t.id === a.typeId) ||
          !c.hosts.some((h) => h.id === a.hostId) ||
          (a.change && !c.hosts.some((h) => h.id === a.change!.hostId)),
      )
    )
      throw new PortalError('invalid_input');
    await this.db.setSetting('booking', c);
    return c;
  }
  async availableSlots(
    typeId: string,
    from: string,
    to: string,
    hostId?: string,
    ignore?: string,
  ) {
    const c = await this.config(),
      t = c.types.find((t) => t.id === typeId);
    if (!t || (!t.public && !this.user)) return [];
    if (ignore) await this.appointment(ignore);
    const begin = Date.parse(date(from)),
      end = Date.parse(date(to));
    if (end <= begin || end - begin > 93 * DAY)
      throw new PortalError('invalid_input');
    return computeSlots(
      c,
      await this.db.list('appointments'),
      typeId,
      begin,
      end,
      Date.now(),
      hostId,
      ignore,
    );
  }
  async listAppointments(range?: { from: string; to: string }) {
    const u = this.need();
    if (range) {
      date(range.from);
      date(range.to);
    }
    return (
      await this.db.list('appointments', u.role === 'admin' ? undefined : u.id)
    )
      .filter((a) => !range || (a.end > range.from && a.start < range.to))
      .sort((a, b) => a.start.localeCompare(b.start));
  }
  async requestAppointment(input: RequestInput) {
    const u = this.user;
    if (u?.role === 'admin') throw new PortalError('forbidden');
    const t = await this.type(input.typeId);
    if (!u && !t.public) throw new PortalError('unauthenticated');
    const g = u ? null : guest(input.guest);
    const start = date(input.start);
    const slot = await this.freeSlot(t.id, start, input.hostId);
    const a: Appointment = {
      id: uuid(),
      typeId: t.id,
      hostId: input.hostId ?? slot.hostIds[0],
      start,
      end: new Date(Date.parse(start) + t.minutes * MINUTE).toISOString(),
      status:
        (await this.config()).approval === 'auto' ? 'confirmed' : 'requested',
      clientId: u?.id ?? null,
      guest: g,
      topic: text(input.topic, 3500),
      meetingUrl: '',
      change: null,
      reply: '',
      createdBy: u ? 'client' : 'guest',
      createdAt: now(),
      updatedAt: now(),
    };
    return this.saveAppointment(
      a,
      a.status === 'confirmed'
        ? 'appointment_confirmed'
        : 'appointment_requested',
    );
  }
  async scheduleAppointment(input: ScheduleInput) {
    this.need(true);
    if (input.clientId) await this.client(input.clientId);
    const g = input.clientId ? null : guest(input.guest ?? undefined);
    const t = await this.type(input.typeId),
      start = date(input.start),
      end = new Date(Date.parse(start) + t.minutes * MINUTE).toISOString();
    await this.checkFree(input.hostId, start, end);
    return this.saveAppointment(
      {
        id: uuid(),
        typeId: t.id,
        hostId: input.hostId,
        start,
        end,
        status: 'confirmed',
        clientId: input.clientId || null,
        guest: g,
        topic: text(input.topic, 3500),
        meetingUrl: url(input.meetingUrl),
        change: null,
        reply: '',
        createdBy: 'team',
        createdAt: now(),
        updatedAt: now(),
      },
      'appointment_confirmed',
    );
  }
  async respondToRequest(
    id: string,
    answer: {
      accept: boolean;
      reply?: string;
      start?: string;
      hostId?: string;
      meetingUrl?: string;
    },
  ) {
    this.need(true);
    const a = await this.appointment(id);
    if (a.status !== 'requested' || typeof answer.accept !== 'boolean')
      throw new PortalError('invalid_input');
    a.reply = text(answer.reply ?? '', 3500);
    if (!answer.accept) {
      a.status = 'declined';
      return this.saveAppointment(a, 'appointment_declined');
    }
    const start = date(answer.start ?? a.start),
      t = await this.type(a.typeId),
      end = new Date(Date.parse(start) + t.minutes * MINUTE).toISOString(),
      host = answer.hostId ?? a.hostId;
    await this.checkFree(host, start, end, a.id);
    Object.assign(a, { start, end, hostId: host, status: 'confirmed' });
    if (answer.meetingUrl !== undefined) a.meetingUrl = url(answer.meetingUrl);
    return this.saveAppointment(a, 'appointment_confirmed');
  }
  async requestChange(id: string, start: string, hostId?: string) {
    const u = this.need();
    if (u.role === 'admin') throw new PortalError('forbidden');
    const a = await this.appointment(id);
    if (!['requested', 'confirmed'].includes(a.status))
      throw new PortalError('invalid_input');
    start = date(start);
    const slot = await this.freeSlot(a.typeId, start, hostId, a.id),
      t = await this.type(a.typeId),
      end = new Date(Date.parse(start) + t.minutes * MINUTE).toISOString(),
      host =
        hostId ??
        (slot.hostIds.includes(a.hostId) ? a.hostId : slot.hostIds[0]);
    if (a.status === 'requested' || (await this.config()).approval === 'auto') {
      Object.assign(a, { start, end, hostId: host, change: null });
      return this.saveAppointment(
        a,
        a.status === 'requested'
          ? 'appointment_requested'
          : 'appointment_moved',
      );
    }
    a.change = { start, end, hostId: host, at: now() };
    return this.saveAppointment(a, 'change_requested', start);
  }
  async respondToChange(id: string, accept: boolean, reply = '') {
    this.need(true);
    const a = await this.appointment(id);
    if (!a.change || typeof accept !== 'boolean' || a.status !== 'confirmed')
      throw new PortalError('invalid_input');
    a.reply = text(reply, 3500);
    const asked = a.change.start;
    if (accept) {
      await this.checkFree(a.change.hostId, a.change.start, a.change.end, a.id);
      Object.assign(a, {
        start: a.change.start,
        end: a.change.end,
        hostId: a.change.hostId,
      });
    }
    a.change = null;
    return this.saveAppointment(
      a,
      accept ? 'appointment_moved' : 'change_declined',
      accept ? a.start : asked,
    );
  }
  async moveAppointment(id: string, start: string, hostId?: string) {
    this.need(true);
    const a = await this.appointment(id);
    if (a.status !== 'confirmed') throw new PortalError('invalid_input');
    start = date(start);
    const host = hostId ?? a.hostId,
      end = new Date(
        Date.parse(start) + Date.parse(a.end) - Date.parse(a.start),
      ).toISOString();
    await this.checkFree(host, start, end, a.id);
    Object.assign(a, { start, end, hostId: host, change: null });
    return this.saveAppointment(a, 'appointment_moved');
  }
  async cancelAppointment(id: string, reason = '') {
    const u = this.need(),
      a = await this.appointment(id);
    if (!['confirmed', 'requested'].includes(a.status))
      throw new PortalError('invalid_input');
    Object.assign(a, {
      status: 'cancelled',
      change: null,
      cancelledBy: u.id,
      cancelReason: text(reason, 3500),
    });
    return this.saveAppointment(a, 'appointment_cancelled');
  }
  async updateAppointment(
    id: string,
    patch: Partial<Pick<Appointment, 'meetingUrl' | 'hostId' | 'topic'>>,
  ) {
    this.need(true);
    const a = await this.appointment(id);
    if (patch.hostId !== undefined) {
      if (!['confirmed', 'requested'].includes(a.status))
        throw new PortalError('invalid_input');
      await this.checkFree(patch.hostId, a.start, a.end, a.id);
      a.hostId = patch.hostId;
    }
    if (patch.topic !== undefined) a.topic = text(patch.topic, 3500);
    if (patch.meetingUrl !== undefined) a.meetingUrl = url(patch.meetingUrl);
    return this.saveAppointment(a);
  }
  async addBlock(block: Omit<TimeBlock, 'id'>) {
    this.need(true);
    const c = await this.config();
    validateBlock(block, c);
    const b = {
      id: uuid(),
      hostId: block.hostId,
      start: date(block.start),
      end: date(block.end),
      reason: text(block.reason, 500),
    };
    c.blocks.push(b);
    await this.db.setSetting('booking', c);
    return b;
  }
  async removeBlock(id: string) {
    this.need(true);
    const c = await this.config();
    c.blocks = c.blocks.filter((b) => b.id !== id);
    await this.db.setSetting('booking', c);
  }
  async listActivity(limit = 50) {
    const u = this.need();
    integer(limit, 1, 200);
    return (
      await this.db.list('activity', u.role === 'admin' ? undefined : u.id)
    )
      .filter(
        (a) =>
          a.actorId !== u.id &&
          (u.role === 'admin'
            ? a.audience.admins
            : a.audience.clientId === u.id),
      )
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
  }
  async markActivityRead(filter?: {
    ids?: string[];
    kinds?: ActivityKind[];
    clientId?: string;
  }) {
    const u = this.need();
    for (const a of await this.db.list(
      'activity',
      u.role === 'admin' ? undefined : u.id,
    )) {
      if (
        !(u.role === 'admin'
          ? a.audience.admins
          : a.audience.clientId === u.id) ||
        (filter?.ids && !filter.ids.includes(a.id)) ||
        (filter?.kinds && !filter.kinds.includes(a.kind)) ||
        (filter?.clientId && a.clientId !== filter.clientId)
      )
        continue;
      if (!a.readBy.includes(u.id)) {
        a.readBy.push(u.id);
        await this.db.put('activity', a);
      }
    }
  }
}
