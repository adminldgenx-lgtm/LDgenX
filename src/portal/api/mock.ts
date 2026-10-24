// The portal answered in the browser, for the demonstration: data in localStorage (shared by every
// window, so the team and a client open side by side see each other's changes at once), the
// sign-in in sessionStorage (one per window), file contents in IndexedDB. It applies the access
// rules the server must apply, so the screens behave as they will with the real backend.
import {
  PortalError,
  type Activity,
  type ActivityKind,
  type Appointment,
  type BookingConfig,
  type FileItem,
  type Message,
  type PortalApi,
  type Thread,
  type User,
} from './types';
import { buildSeed, DEMO_PASSWORD, type DemoStore } from './seed';
import { clearBlobs, deleteBlob, getBlob, putBlob } from './blobs';
import { fileExpiry } from '../lib/retention';
import { computeSlots, overlaps } from '../lib/availability';
import { DAY, MINUTE } from '../lib/time';

const KEY = 'ldgenx-portal-demo-v2';
const SESSION = 'ldgenx-portal-demo-session';
const LOCK = 'ldgenx-portal-demo';
/** Past its weekly deletion. */
const expired = (f: FileItem) => !!f.expiresAt && Date.parse(f.expiresAt) <= Date.now();

async function hash(text: string) {
  if (!crypto.subtle) return `plain:${text}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`ldgenx:${text}`));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const wait = () => new Promise((r) => setTimeout(r, 80 + Math.random() * 120));
const id = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const nowIso = () => new Date().toISOString();
function clone<T>(value: T): T {
  return structuredClone(value);
}

type StoredUser = DemoStore['users'][number];
const publicUser = (stored: StoredUser): User => {
  const user: Partial<StoredUser> = clone(stored);
  delete user.passwordHash;
  return user as User;
};
const fullName = (u: Pick<User, 'firstName' | 'lastName'>) => `${u.firstName} ${u.lastName}`;

// One sign-in per window: a client in one window, the team in another.
const session = {
  get(): string | null {
    try {
      return sessionStorage.getItem(SESSION);
    } catch {
      return null;
    }
  },
  set(userId: string | null) {
    try {
      if (userId) sessionStorage.setItem(SESSION, userId);
      else sessionStorage.removeItem(SESSION);
    } catch {
      // Storage blocked: the sign-in lasts as long as the page.
    }
  },
};

export function createMockApi(): PortalApi {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  let seeding: Promise<DemoStore> | null = null;

  async function seed() {
    const { store, blobs } = buildSeed(Date.now(), await hash(DEMO_PASSWORD));
    // Without file storage (some private windows) the demo still runs; only the sample files
    // cannot be downloaded.
    try {
      await clearBlobs();
      await Promise.all(blobs.map(([fileId, blob]) => putBlob(fileId, blob)));
    } catch {
      // File storage unavailable.
    }
    localStorage.setItem(KEY, JSON.stringify(store));
    return store;
  }

  /** The current data, read afresh each time: another window may have changed it. */
  async function read(): Promise<DemoStore> {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      try {
        const store = JSON.parse(saved) as DemoStore;
        if (store.version === 2) return store;
      } catch {
        // Unreadable: start again from the sample data.
      }
    }
    seeding ??= seed().finally(() => (seeding = null));
    return seeding;
  }

  const save = (store: DemoStore) => {
    localStorage.setItem(KEY, JSON.stringify(store));
    notify();
  };

  // Another window changed the data.
  window.addEventListener('storage', (event) => {
    if (event.key === KEY || event.key === null) notify();
  });

  /** The data, after the weekly deletion has removed what it should. */
  /** The data, as one call sees it (after the simulated network delay). */
  async function data() {
    await wait();
    const store = await read();
    if (store.files.some((f) => expired(f))) schedulePurge();
    return store;
  }

  // Every change runs alone, in the order it was asked for, across all the windows of the demo
  // (Web Locks): two changes saved at once would otherwise overwrite each other.
  let queue: Promise<unknown> = Promise.resolve();
  function locked<T>(task: () => Promise<T>): Promise<T> {
    // The lock resolves with the task's own result.
    if (navigator.locks) return navigator.locks.request(LOCK, task) as unknown as Promise<T>;
    const next = queue.then(task, task);
    queue = next.catch(() => {});
    return next;
  }

  // The weekly deletion: files past their date are removed by a task of their own; until it has
  // run, the screens no longer list them.
  let purgeQueued = false;
  function schedulePurge() {
    if (purgeQueued) return;
    purgeQueued = true;
    void locked(async () => {
      purgeQueued = false;
      const store = await read();
      const gone = store.files.filter((f) => expired(f));
      if (!gone.length) return;
      store.files = store.files.filter((f) => !gone.includes(f));
      await Promise.all(gone.map((f) => deleteBlob(f.id).catch(() => {})));
      store.retention.lastPurgeAt = nowIso();
      log(store, 'purge', null, { admins: true, clientId: null }, null, { count: gone.length });
      save(store);
    });
  }
  window.setInterval(() => {
    read()
      .then((store) => store.files.some((f) => expired(f)) && schedulePurge())
      .catch(() => {});
  }, 60_000);

  function me(store: DemoStore) {
    const user = store.users.find((u) => u.id === session.get());
    return user && user.status !== 'disabled' ? user : null;
  }
  function need(store: DemoStore, role?: 'admin') {
    const user = me(store);
    if (!user) throw new PortalError('unauthenticated');
    if (role && user.role !== role) throw new PortalError('forbidden');
    return user;
  }
  /** A client's space: the team reaches every client, a client only their own. */
  function clientFor(store: DemoStore, user: StoredUser, clientId: string) {
    const client = store.users.find((u) => u.id === clientId && u.role === 'client');
    if (!client) throw new PortalError('not_found');
    if (user.role !== 'admin' && user.id !== clientId) throw new PortalError('forbidden');
    return client;
  }
  function appointmentFor(store: DemoStore, user: StoredUser, appointmentId: string) {
    const appointment = store.appointments.find((a) => a.id === appointmentId);
    if (!appointment) throw new PortalError('not_found');
    if (user.role !== 'admin' && appointment.clientId !== user.id)
      throw new PortalError('forbidden');
    return appointment;
  }
  /** The person the appointment is with, for the sentences. */
  const who = (store: DemoStore, a: Appointment) => {
    const client = a.clientId && store.users.find((u) => u.id === a.clientId);
    return client ? fullName(client) : (a.guest?.name ?? '');
  };

  function log(
    store: DemoStore,
    kind: ActivityKind,
    actorId: string | null,
    audience: Activity['audience'],
    clientId: string | null,
    values: Activity['data'],
  ) {
    store.activity.unshift({
      id: id('act'),
      kind,
      at: nowIso(),
      actorId,
      audience,
      clientId,
      data: values,
      readBy: actorId ? [actorId] : [],
    });
    store.activity = store.activity.slice(0, 300);
  }
  /** An appointment event: the team always, the client when the team acted. */
  function logAppointment(
    store: DemoStore,
    kind: ActivityKind,
    user: StoredUser | null,
    a: Appointment,
    start = a.start,
  ) {
    const byTeam = user?.role === 'admin';
    log(
      store,
      kind,
      user?.id ?? null,
      { admins: true, clientId: byTeam ? a.clientId : null },
      a.clientId,
      { name: who(store, a), type: a.typeId, start },
    );
  }

  /** The free slot starting at `start`, or a refusal: it has just been taken. */
  function freeSlot(
    store: DemoStore,
    typeId: string,
    start: string,
    hostId?: string,
    ignore?: string,
  ) {
    const at = Date.parse(start);
    const slots = computeSlots(
      store.booking,
      store.appointments,
      typeId,
      at,
      at + DAY,
      Date.now(),
      hostId,
      ignore,
    );
    const slot = slots.find((s) => Date.parse(s.start) === at);
    if (!slot) throw new PortalError('slot_taken');
    return slot;
  }
  /** The team may set any time, but never two appointments at once for one person. */
  function checkFree(
    store: DemoStore,
    hostId: string,
    start: number,
    end: number,
    ignore?: string,
  ) {
    if (overlaps(store.appointments, hostId, start, end, ignore))
      throw new PortalError('slot_taken');
  }
  const lengthOf = (store: DemoStore, typeId: string) => {
    const type = store.booking.types.find((t) => t.id === typeId);
    if (!type) throw new PortalError('invalid_input');
    return type.minutes * MINUTE;
  };

  async function storeFile(
    store: DemoStore,
    user: StoredUser,
    clientId: string,
    file: File,
    note: string,
  ) {
    const createdAt = nowIso();
    const item: FileItem = {
      id: id('f'),
      clientId,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      direction: user.role === 'admin' ? 'to_client' : 'from_client',
      uploadedBy: user.id,
      note,
      createdAt,
      kept: false,
      expiresAt: fileExpiry({ createdAt, kept: false }, store.retention),
      downloads: [],
    };
    await putBlob(item.id, file);
    store.files.push(item);
    const byTeam = user.role === 'admin';
    log(
      store,
      'file_uploaded',
      user.id,
      { admins: !byTeam, clientId: byTeam ? clientId : null },
      clientId,
      { name: file.name, client: fullName(store.users.find((u) => u.id === clientId)!) },
    );
    return item;
  }

  const api: PortalApi = {
    mode: 'mock',

    async currentUser() {
      const store = await data();
      const user = me(store);
      return user ? publicUser(user) : null;
    },

    async signIn(email, password) {
      const store = await data();
      const user = store.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user || user.passwordHash !== (await hash(password)))
        throw new PortalError('invalid_credentials');
      if (user.status === 'disabled') throw new PortalError('account_disabled');
      user.lastSeenAt = nowIso();
      session.set(user.id);
      save(store);
      return publicUser(user);
    },

    async signUp(input) {
      const store = await data();
      const email = input.email.trim().toLowerCase();
      if (store.users.some((u) => u.email.toLowerCase() === email))
        throw new PortalError('email_taken');
      const user: StoredUser = {
        id: id('c'),
        role: 'client',
        email,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        organisation: input.organisation.trim(),
        phone: input.phone.trim(),
        status: 'pending',
        locale: input.locale,
        createdAt: nowIso(),
        lastSeenAt: nowIso(),
        notify: { messages: true, files: true, appointments: true, weeklyPurge: true },
        passwordHash: await hash(input.password),
      };
      store.users.push(user);
      if (input.message.trim())
        store.messages.push({
          id: id('msg'),
          clientId: user.id,
          authorId: user.id,
          body: input.message.trim(),
          fileIds: [],
          createdAt: nowIso(),
          readBy: [user.id],
        });
      log(store, 'account_created', user.id, { admins: true, clientId: null }, user.id, {
        name: fullName(user),
        organisation: user.organisation,
      });
      session.set(user.id);
      save(store);
      return publicUser(user);
    },

    async signOut() {
      session.set(null);
      notify();
    },

    async requestPasswordReset() {
      await wait();
    },

    async updateProfile(patch) {
      const store = await data();
      const user = need(store);
      Object.assign(user, clone(patch));
      save(store);
      return publicUser(user);
    },

    async changePassword(current, next) {
      const store = await data();
      const user = need(store);
      if (user.passwordHash !== (await hash(current))) throw new PortalError('invalid_credentials');
      user.passwordHash = await hash(next);
      save(store);
    },

    async listTeam() {
      const store = await data();
      need(store);
      return store.users
        .filter((u) => u.role === 'admin')
        .map(({ id: userId, firstName, lastName }) => ({ id: userId, firstName, lastName }));
    },

    async listClients() {
      const store = await data();
      need(store, 'admin');
      return store.users.filter((u) => u.role === 'client').map(publicUser);
    },

    async getUser(userId) {
      const store = await data();
      const user = need(store);
      const found = store.users.find((u) => u.id === userId);
      if (!found) throw new PortalError('not_found');
      if (user.role !== 'admin' && found.id !== user.id) throw new PortalError('forbidden');
      return publicUser(found);
    },

    async setAccountStatus(userId, status) {
      const store = await data();
      need(store, 'admin');
      const user = store.users.find((u) => u.id === userId && u.role === 'client');
      if (!user) throw new PortalError('not_found');
      user.status = status;
      save(store);
      return publicUser(user);
    },

    async inviteClient(input) {
      const store = await data();
      need(store, 'admin');
      const email = input.email.trim().toLowerCase();
      if (store.users.some((u) => u.email.toLowerCase() === email))
        throw new PortalError('email_taken');
      const user: StoredUser = {
        ...clone(input),
        email,
        id: id('c'),
        role: 'client',
        status: 'active',
        phone: '',
        createdAt: nowIso(),
        notify: { messages: true, files: true, appointments: true, weeklyPurge: true },
        // The invitation e-mail lets the client choose a password; the demo uses its own.
        passwordHash: await hash(DEMO_PASSWORD),
      };
      store.users.push(user);
      save(store);
      return publicUser(user);
    },

    async listThreads() {
      const store = await data();
      const user = need(store);
      const admins = new Set(store.users.filter((u) => u.role === 'admin').map((u) => u.id));
      const clients =
        user.role === 'admin' ? store.users.filter((u) => u.role === 'client') : [user];
      const threads: Thread[] = clients.map((client) => {
        const list = store.messages
          .filter((m) => m.clientId === client.id)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        // The team reads as one: a message a colleague has read is read.
        const unread = list.filter((m) =>
          user.role === 'admin'
            ? m.authorId === client.id && !m.readBy.some((r) => admins.has(r))
            : m.authorId !== user.id && !m.readBy.includes(user.id),
        ).length;
        return { clientId: client.id, lastMessage: clone(list.at(-1) ?? null), unread };
      });
      return threads.sort((a, b) =>
        (b.lastMessage?.createdAt ?? '').localeCompare(a.lastMessage?.createdAt ?? ''),
      );
    },

    async listMessages(clientId) {
      const store = await data();
      const user = need(store);
      clientFor(store, user, clientId);
      return store.messages
        .filter((m) => m.clientId === clientId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map(clone);
    },

    async sendMessage(clientId, body, files = []) {
      const store = await data();
      const user = need(store);
      const client = clientFor(store, user, clientId);
      const fileIds: string[] = [];
      for (const file of files) fileIds.push((await storeFile(store, user, clientId, file, '')).id);
      const message: Message = {
        id: id('msg'),
        clientId,
        authorId: user.id,
        body: body.trim(),
        fileIds,
        createdAt: nowIso(),
        readBy: [user.id],
      };
      store.messages.push(message);
      const byTeam = user.role === 'admin';
      log(
        store,
        'message',
        user.id,
        { admins: !byTeam, clientId: byTeam ? clientId : null },
        clientId,
        { name: fullName(user), client: fullName(client) },
      );
      save(store);
      return clone(message);
    },

    async markThreadRead(clientId) {
      const store = await data();
      const user = need(store);
      clientFor(store, user, clientId);
      let changed = false;
      for (const m of store.messages)
        if (m.clientId === clientId && !m.readBy.includes(user.id)) {
          m.readBy.push(user.id);
          changed = true;
        }
      for (const a of store.activity)
        if (a.kind === 'message' && a.clientId === clientId && !a.readBy.includes(user.id)) {
          a.readBy.push(user.id);
          changed = true;
        }
      if (changed) save(store);
    },

    async listInquiries() {
      const store = await data();
      need(store, 'admin');
      return clone(store.inquiries).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    async setInquiryStatus(inquiryId, status) {
      const store = await data();
      need(store, 'admin');
      const inquiry = store.inquiries.find((i) => i.id === inquiryId);
      if (!inquiry) throw new PortalError('not_found');
      inquiry.status = status;
      save(store);
      return clone(inquiry);
    },

    async submitInquiry(input) {
      const store = await data();
      store.inquiries.push({ ...clone(input), id: id('i'), createdAt: nowIso(), status: 'new' });
      log(store, 'inquiry', null, { admins: true, clientId: null }, null, { name: input.name });
      save(store);
    },

    async listFiles(clientId) {
      const store = await data();
      const user = need(store);
      if (clientId) clientFor(store, user, clientId);
      return store.files
        .filter((f) => !expired(f))
        .filter((f) => (user.role === 'admin' ? true : f.clientId === user.id))
        .filter((f) => !clientId || f.clientId === clientId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(clone);
    },

    async uploadFile(clientId, file, note = '') {
      const store = await data();
      const user = need(store);
      clientFor(store, user, clientId);
      const item = await storeFile(store, user, clientId, file, note);
      save(store);
      return clone(item);
    },

    async downloadFile(fileId) {
      const store = await data();
      const user = need(store);
      const file = store.files.find((f) => f.id === fileId);
      if (!file || expired(file)) throw new PortalError('not_found');
      clientFor(store, user, file.clientId);
      const blob = await getBlob(fileId);
      if (!blob) throw new PortalError('not_found');
      file.downloads.push({ userId: user.id, at: nowIso() });
      save(store);
      return blob;
    },

    async deleteFile(fileId) {
      const store = await data();
      const user = need(store);
      const file = store.files.find((f) => f.id === fileId);
      if (!file) throw new PortalError('not_found');
      clientFor(store, user, file.clientId);
      if (user.role !== 'admin' && file.uploadedBy !== user.id) throw new PortalError('forbidden');
      store.files = store.files.filter((f) => f.id !== fileId);
      await deleteBlob(fileId).catch(() => {});
      save(store);
    },

    async keepFile(fileId, kept) {
      const store = await data();
      need(store, 'admin');
      const file = store.files.find((f) => f.id === fileId);
      if (!file) throw new PortalError('not_found');
      file.kept = kept;
      file.expiresAt = fileExpiry(file, store.retention);
      save(store);
      return clone(file);
    },

    async getRetention() {
      const store = await data();
      return clone(store.retention);
    },

    async updateRetention(patch) {
      const store = await data();
      need(store, 'admin');
      Object.assign(store.retention, clone(patch));
      for (const f of store.files) f.expiresAt = fileExpiry(f, store.retention);
      save(store);
      return clone(store.retention);
    },

    async purgeNow() {
      const store = await data();
      const admin = need(store, 'admin');
      const removed = store.files.filter((f) => !f.kept);
      store.files = store.files.filter((f) => f.kept);
      await Promise.all(removed.map((f) => deleteBlob(f.id).catch(() => {})));
      store.retention.lastPurgeAt = nowIso();
      log(store, 'purge', admin.id, { admins: true, clientId: null }, null, {
        count: removed.length,
      });
      save(store);
      return removed.length;
    },

    async getBookingConfig() {
      const store = await data();
      const config = clone(store.booking);
      // Visitors and clients see the openings, not the team's blocked times.
      if (me(store)?.role !== 'admin') config.blocks = [];
      return config;
    },

    async updateBookingConfig(patch) {
      const store = await data();
      need(store, 'admin');
      store.booking = { ...store.booking, ...clone(patch) } as BookingConfig;
      save(store);
      return clone(store.booking);
    },

    async availableSlots(typeId, from, to, hostId, ignore) {
      const store = await data();
      const user = me(store);
      const type = store.booking.types.find((t) => t.id === typeId);
      if (!type || (!type.public && !user)) return [];
      if (ignore) appointmentFor(store, need(store), ignore);
      return computeSlots(
        store.booking,
        store.appointments,
        typeId,
        Date.parse(from),
        Date.parse(to),
        Date.now(),
        hostId,
        ignore,
      );
    },

    async listAppointments(range) {
      const store = await data();
      const user = need(store);
      return store.appointments
        .filter((a) => user.role === 'admin' || a.clientId === user.id)
        .filter((a) => !range || (a.end > range.from && a.start < range.to))
        .sort((a, b) => a.start.localeCompare(b.start))
        .map(clone);
    },

    async requestAppointment(input) {
      const store = await data();
      const user = me(store);
      const type = store.booking.types.find((t) => t.id === input.typeId && t.active);
      if (!type) throw new PortalError('invalid_input');
      if (user?.role === 'admin') throw new PortalError('forbidden');
      if (!user && (!type.public || !input.guest)) throw new PortalError('unauthenticated');
      const slot = freeSlot(store, type.id, input.start, input.hostId);
      const start = Date.parse(input.start);
      const auto = store.booking.approval === 'auto';
      const at = nowIso();
      const appointment: Appointment = {
        id: id('a'),
        typeId: type.id,
        hostId: input.hostId ?? slot.hostIds[0],
        start: new Date(start).toISOString(),
        end: new Date(start + type.minutes * MINUTE).toISOString(),
        status: auto ? 'confirmed' : 'requested',
        clientId: user ? user.id : null,
        guest: user ? null : clone(input.guest!),
        topic: input.topic.trim(),
        meetingUrl: '',
        change: null,
        reply: '',
        createdBy: user ? 'client' : 'guest',
        createdAt: at,
        updatedAt: at,
      };
      store.appointments.push(appointment);
      logAppointment(
        store,
        auto ? 'appointment_confirmed' : 'appointment_requested',
        user ?? null,
        appointment,
      );
      save(store);
      return clone(appointment);
    },

    async scheduleAppointment(input) {
      const store = await data();
      const admin = need(store, 'admin');
      if (input.clientId) clientFor(store, admin, input.clientId);
      if (!input.clientId && !input.guest?.name) throw new PortalError('invalid_input');
      const start = Date.parse(input.start);
      const end = start + lengthOf(store, input.typeId);
      checkFree(store, input.hostId, start, end);
      const at = nowIso();
      const appointment: Appointment = {
        id: id('a'),
        typeId: input.typeId,
        hostId: input.hostId,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        status: 'confirmed',
        clientId: input.clientId,
        guest: input.clientId ? null : clone(input.guest),
        topic: input.topic.trim(),
        meetingUrl: input.meetingUrl.trim(),
        change: null,
        reply: '',
        createdBy: 'team',
        createdAt: at,
        updatedAt: at,
      };
      store.appointments.push(appointment);
      logAppointment(store, 'appointment_confirmed', admin, appointment);
      save(store);
      return clone(appointment);
    },

    async respondToRequest(appointmentId, answer) {
      const store = await data();
      const admin = need(store, 'admin');
      const a = appointmentFor(store, admin, appointmentId);
      if (a.status !== 'requested') throw new PortalError('invalid_input');
      a.reply = answer.reply?.trim() ?? '';
      a.updatedAt = nowIso();
      if (!answer.accept) {
        a.status = 'declined';
        logAppointment(store, 'appointment_declined', admin, a);
      } else {
        const hostId = answer.hostId ?? a.hostId;
        const start = answer.start ? Date.parse(answer.start) : Date.parse(a.start);
        const end = start + lengthOf(store, a.typeId);
        checkFree(store, hostId, start, end, a.id);
        a.hostId = hostId;
        a.start = new Date(start).toISOString();
        a.end = new Date(end).toISOString();
        a.status = 'confirmed';
        if (answer.meetingUrl !== undefined) a.meetingUrl = answer.meetingUrl.trim();
        logAppointment(store, 'appointment_confirmed', admin, a);
      }
      save(store);
      return clone(a);
    },

    async requestChange(appointmentId, start, hostId) {
      const store = await data();
      const user = need(store);
      const a = appointmentFor(store, user, appointmentId);
      if (user.role === 'admin') throw new PortalError('forbidden');
      if (a.status !== 'confirmed' && a.status !== 'requested')
        throw new PortalError('invalid_input');
      const slot = freeSlot(store, a.typeId, start, hostId, a.id);
      const begin = Date.parse(start);
      const host = hostId ?? (slot.hostIds.includes(a.hostId) ? a.hostId : slot.hostIds[0]);
      const end = begin + lengthOf(store, a.typeId);
      a.updatedAt = nowIso();
      // A request still waiting simply changes; a confirmed appointment changes at once in
      // automatic mode, and waits for the team otherwise.
      if (a.status === 'requested' || store.booking.approval === 'auto') {
        a.start = new Date(begin).toISOString();
        a.end = new Date(end).toISOString();
        a.hostId = host;
        a.change = null;
        logAppointment(
          store,
          a.status === 'requested' ? 'appointment_requested' : 'appointment_moved',
          user,
          a,
        );
      } else {
        a.change = {
          start: new Date(begin).toISOString(),
          end: new Date(end).toISOString(),
          hostId: host,
          at: nowIso(),
        };
        logAppointment(store, 'change_requested', user, a, a.change.start);
      }
      save(store);
      return clone(a);
    },

    async respondToChange(appointmentId, accept, reply = '') {
      const store = await data();
      const admin = need(store, 'admin');
      const a = appointmentFor(store, admin, appointmentId);
      if (!a.change) throw new PortalError('invalid_input');
      a.reply = reply.trim();
      a.updatedAt = nowIso();
      if (accept) {
        checkFree(
          store,
          a.change.hostId,
          Date.parse(a.change.start),
          Date.parse(a.change.end),
          a.id,
        );
        a.start = a.change.start;
        a.end = a.change.end;
        a.hostId = a.change.hostId;
        a.change = null;
        logAppointment(store, 'appointment_moved', admin, a);
      } else {
        const asked = a.change.start;
        a.change = null;
        logAppointment(store, 'change_declined', admin, a, asked);
      }
      save(store);
      return clone(a);
    },

    async moveAppointment(appointmentId, start, hostId) {
      const store = await data();
      const admin = need(store, 'admin');
      const a = appointmentFor(store, admin, appointmentId);
      if (a.status !== 'confirmed') throw new PortalError('invalid_input');
      const host = hostId ?? a.hostId;
      const begin = Date.parse(start);
      const end = begin + (Date.parse(a.end) - Date.parse(a.start));
      checkFree(store, host, begin, end, a.id);
      a.start = new Date(begin).toISOString();
      a.end = new Date(end).toISOString();
      a.hostId = host;
      a.change = null;
      a.updatedAt = nowIso();
      logAppointment(store, 'appointment_moved', admin, a);
      save(store);
      return clone(a);
    },

    async cancelAppointment(appointmentId, reason = '') {
      const store = await data();
      const user = need(store);
      const a = appointmentFor(store, user, appointmentId);
      if (a.status !== 'confirmed' && a.status !== 'requested')
        throw new PortalError('invalid_input');
      a.status = 'cancelled';
      a.change = null;
      a.cancelledBy = user.id;
      a.cancelReason = reason.trim();
      a.updatedAt = nowIso();
      logAppointment(store, 'appointment_cancelled', user, a);
      save(store);
      return clone(a);
    },

    async updateAppointment(appointmentId, patch) {
      const store = await data();
      const admin = need(store, 'admin');
      const a = appointmentFor(store, admin, appointmentId);
      if (patch.hostId && patch.hostId !== a.hostId)
        checkFree(store, patch.hostId, Date.parse(a.start), Date.parse(a.end), a.id);
      Object.assign(a, clone(patch));
      a.updatedAt = nowIso();
      save(store);
      return clone(a);
    },

    async addBlock(block) {
      const store = await data();
      need(store, 'admin');
      const item = { ...clone(block), id: id('b') };
      store.booking.blocks.push(item);
      save(store);
      return item;
    },

    async removeBlock(blockId) {
      const store = await data();
      need(store, 'admin');
      store.booking.blocks = store.booking.blocks.filter((b) => b.id !== blockId);
      save(store);
    },

    async listActivity(limit = 50) {
      const store = await data();
      const user = need(store);
      return store.activity
        .filter((a) => a.actorId !== user.id)
        .filter((a) =>
          user.role === 'admin' ? a.audience.admins : a.audience.clientId === user.id,
        )
        .slice(0, limit)
        .map(clone);
    },

    async markActivityRead(filter) {
      const store = await data();
      const user = need(store);
      let changed = false;
      for (const a of store.activity) {
        if (filter?.ids && !filter.ids.includes(a.id)) continue;
        if (filter?.kinds && !filter.kinds.includes(a.kind)) continue;
        if (filter?.clientId && a.clientId !== filter.clientId) continue;
        if (!a.readBy.includes(user.id)) {
          a.readBy.push(user.id);
          changed = true;
        }
      }
      if (changed) save(store);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async resetDemo() {
      localStorage.removeItem(KEY);
      session.set(null);
      await read();
      notify();
    },
  };
  // The calls that change data take the lock.
  const changes: (keyof PortalApi)[] = [
    'signIn',
    'signUp',
    'updateProfile',
    'changePassword',
    'setAccountStatus',
    'inviteClient',
    'sendMessage',
    'markThreadRead',
    'setInquiryStatus',
    'submitInquiry',
    'uploadFile',
    'downloadFile',
    'deleteFile',
    'keepFile',
    'updateRetention',
    'purgeNow',
    'updateBookingConfig',
    'requestAppointment',
    'scheduleAppointment',
    'respondToRequest',
    'requestChange',
    'respondToChange',
    'moveAppointment',
    'cancelAppointment',
    'updateAppointment',
    'addBlock',
    'removeBlock',
    'markActivityRead',
    'resetDemo',
  ];
  const calls = api as unknown as Record<string, (...args: unknown[]) => Promise<unknown>>;
  for (const name of changes) {
    const call = calls[name];
    calls[name] = (...args) => locked(() => call(...args));
  }
  return api;
}
