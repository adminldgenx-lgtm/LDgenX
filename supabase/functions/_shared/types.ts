// Shared portal contract, used by the React application and the Supabase Edge API.

export type Role = 'admin' | 'client';
export type AccountStatus = 'pending' | 'active' | 'disabled';
export type Locale = 'fr' | 'en';
export type Text = Record<Locale, string>;

export interface User {
  id: string;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
  organisation: string;
  phone: string;
  status: AccountStatus;
  locale: Locale;
  createdAt: string;
  lastSeenAt?: string;
  /** E-mail notifications. */
  notify: {
    messages: boolean;
    files: boolean;
    appointments: boolean;
    weeklyPurge: boolean;
  };
}

/** Each client has one conversation with the whole team. */
export interface Message {
  id: string;
  clientId: string;
  authorId: string;
  body: string;
  fileIds: string[];
  createdAt: string;
  readBy: string[];
}

/** A client's conversation, as listed in the team's inbox. */
export interface Thread {
  clientId: string;
  lastMessage: Message | null;
  unread: number;
}

export interface FileItem {
  id: string;
  clientId: string;
  name: string;
  size: number;
  type: string;
  /** Dropped by the team for the client, or sent by the client with a message. */
  direction: 'to_client' | 'from_client';
  uploadedBy: string;
  note: string;
  createdAt: string;
  /** When the weekly deletion removes it; null when kept. */
  expiresAt: string | null;
  /** Kept by the team: the weekly deletion leaves it. */
  kept: boolean;
  downloads: { userId: string; at: string }[];
}

/** A message sent through the contact form of the public site. */
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  organisation: string;
  sector: string;
  material: string;
  timeline: string;
  message: string;
  locale: Locale;
  createdAt: string;
  status: 'new' | 'read' | 'done';
}
export type InquiryInput = Pick<
  Inquiry,
  | 'name'
  | 'email'
  | 'organisation'
  | 'sector'
  | 'material'
  | 'timeline'
  | 'message'
  | 'locale'
>;

export interface RetentionSettings {
  enabled: boolean;
  /** 0 = Monday … 6 = Sunday, in Europe/Paris. */
  weekday: number;
  /** Hour of the deletion, 0–23, in Europe/Paris. */
  hour: number;
  /** A file is always online at least this many days before it is deleted. */
  minimumDays: number;
  /** Shown to clients above their files; {date} is replaced by the next deletion. */
  notice: Text;
  lastPurgeAt: string | null;
}

export interface AppointmentType {
  id: string;
  label: Text;
  description: Text;
  minutes: number;
  /** Open to visitors of the site (no account), or to clients only. */
  public: boolean;
  location: 'video' | 'phone' | 'lab';
  colour: string;
  active: boolean;
}

export interface Host {
  id: string;
  name: string;
  role: Text;
  colour: string;
  /** Takes appointments. */
  bookable: boolean;
}

export interface WeeklyRule {
  id: string;
  hostId: string;
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
  start: string; // 'HH:MM', team zone
  end: string;
}

export interface TimeBlock {
  id: string;
  /** null: the whole team. */
  hostId: string | null;
  start: string;
  end: string;
  reason: string;
}

export interface BookingConfig {
  types: AppointmentType[];
  hosts: Host[];
  rules: WeeklyRule[];
  blocks: TimeBlock[];
  /** Kept free between two appointments. */
  bufferMinutes: number;
  /** No request closer than this to now. */
  minNoticeHours: number;
  /** No request further than this ahead. */
  horizonDays: number;
  /** Start times fall on multiples of this, from the start of each opening. */
  stepMinutes: number;
  /** Public holidays and closures, 'YYYY-MM-DD'. */
  closedDays: string[];
  /** Requests from clients and visitors: confirmed by the team, or confirmed at once. */
  approval: 'manual' | 'auto';
}

export interface Guest {
  name: string;
  email: string;
  organisation: string;
  phone: string;
}

/** requested: waiting for the team; declined: refused by the team; cancelled: by either side. */
export type AppointmentStatus =
  'requested' | 'confirmed' | 'declined' | 'cancelled';

export interface Appointment {
  id: string;
  typeId: string;
  hostId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  clientId: string | null;
  /** A visitor of the site, without an account. */
  guest: Guest | null;
  /** What the client or visitor wrote with the request, or the team's subject. */
  topic: string;
  meetingUrl: string;
  /** A new time asked by the client for a confirmed appointment, waiting for the team. */
  change: { start: string; end: string; hostId: string; at: string } | null;
  /** The team's message with its answer (a refusal, a new time…). */
  reply: string;
  createdBy: 'client' | 'guest' | 'team';
  createdAt: string;
  updatedAt: string;
  cancelledBy?: string;
  cancelReason?: string;
}

export interface Slot {
  start: string;
  end: string;
  hostIds: string[];
}

/** A request from a client (signed in) or a visitor (with `guest`). */
export interface RequestInput {
  typeId: string;
  start: string;
  /** A given person, or anyone free when omitted. */
  hostId?: string;
  topic: string;
  guest?: Guest;
}

/** An appointment set by the team, confirmed at once, at any time. */
export interface ScheduleInput {
  typeId: string;
  start: string;
  hostId: string;
  clientId: string | null;
  guest: Guest | null;
  topic: string;
  meetingUrl: string;
}

export type ActivityKind =
  | 'account_created'
  | 'message'
  | 'file_uploaded'
  | 'inquiry'
  | 'purge'
  | 'appointment_requested'
  | 'appointment_confirmed'
  | 'appointment_declined'
  | 'appointment_cancelled'
  | 'appointment_moved'
  | 'change_requested'
  | 'change_declined';

export interface Activity {
  id: string;
  kind: ActivityKind;
  at: string;
  actorId: string | null;
  /** Who sees it: the team, and/or one client. */
  audience: { admins: boolean; clientId: string | null };
  /** The client concerned, for links. */
  clientId: string | null;
  /** Values for the sentence (names, dates, counts). */
  data: Record<string, string | number>;
  readBy: string[];
}

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organisation: string;
  phone: string;
  locale: Locale;
  /** A first message to the team, optional. */
  message: string;
}

export interface InviteInput {
  email: string;
  firstName: string;
  lastName: string;
  organisation: string;
  locale: Locale;
}

export type ProfilePatch = Partial<
  Pick<
    User,
    'firstName' | 'lastName' | 'organisation' | 'phone' | 'locale' | 'notify'
  >
>;

/** Thrown by every implementation with a code the screens translate. */
export class PortalError extends Error {
  constructor(
    public code:
      | 'invalid_credentials'
      | 'email_taken'
      | 'not_found'
      | 'forbidden'
      | 'unauthenticated'
      | 'slot_taken'
      | 'account_disabled'
      | 'invalid_input'
      | 'network'
      | 'calendar_unavailable'
      | 'email_unavailable'
      | 'email_not_confirmed'
      | 'rate_limited',
    message = code,
  ) {
    super(message);
  }
}

export interface PortalApi {
  /** The live Supabase implementation. */
  readonly mode: 'supabase';

  // Session
  currentUser(): Promise<User | null>;
  signIn(email: string, password: string): Promise<User>;
  signUp(input: SignUpInput): Promise<User | null>;
  setPassword(next: string): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updateProfile(patch: ProfilePatch): Promise<User>;
  changePassword(current: string, next: string): Promise<void>;

  // People
  /** Names of the team, for every signed-in user. */
  listTeam(): Promise<Pick<User, 'id' | 'firstName' | 'lastName'>[]>;
  /** Team only. */
  listClients(): Promise<User[]>;
  /** Team: anyone; a client: themselves. */
  getUser(id: string): Promise<User>;
  /** Team only. */
  setAccountStatus(id: string, status: AccountStatus): Promise<User>;
  /** Team only: the client receives an e-mail to choose a password. */
  inviteClient(input: InviteInput): Promise<User>;

  // Messages (a client reaches their own conversation only)
  listThreads(): Promise<Thread[]>;
  listMessages(clientId: string): Promise<Message[]>;
  sendMessage(clientId: string, body: string, files?: File[]): Promise<Message>;
  markThreadRead(clientId: string): Promise<void>;

  // Messages from the site's contact form (team only, except `submitInquiry`)
  listInquiries(): Promise<Inquiry[]>;
  setInquiryStatus(id: string, status: Inquiry['status']): Promise<Inquiry>;
  submitInquiry(input: InquiryInput): Promise<void>;

  // Files
  listFiles(clientId?: string): Promise<FileItem[]>;
  uploadFile(clientId: string, file: File, note?: string): Promise<FileItem>;
  /** The file's content (the server answers with a short-lived signed address). */
  downloadFile(id: string): Promise<Blob>;
  deleteFile(id: string): Promise<void>;
  /** Team only: kept files escape the weekly deletion. */
  keepFile(id: string, kept: boolean): Promise<FileItem>;

  // Weekly deletion
  getRetention(): Promise<RetentionSettings>;
  /** Team only. */
  updateRetention(
    patch: Partial<RetentionSettings>,
  ): Promise<RetentionSettings>;
  /** Team only: what the server's weekly job does, run now. */
  purgeNow(): Promise<number>;

  // Appointments
  getBookingConfig(): Promise<BookingConfig>;
  /** Team only. */
  updateBookingConfig(patch: Partial<BookingConfig>): Promise<BookingConfig>;
  /** `ignore`: an appointment being moved, whose own time counts as free. */
  availableSlots(
    typeId: string,
    from: string,
    to: string,
    hostId?: string,
    ignore?: string,
  ): Promise<Slot[]>;
  listAppointments(range?: {
    from: string;
    to: string;
  }): Promise<Appointment[]>;
  /** A client or a visitor asks for a free slot (confirmed at once in automatic mode). */
  requestAppointment(input: RequestInput): Promise<Appointment>;
  /** Team only. */
  scheduleAppointment(input: ScheduleInput): Promise<Appointment>;
  /** Team only: confirm (possibly at another time or with another person) or decline. */
  respondToRequest(
    id: string,
    answer: {
      accept: boolean;
      reply?: string;
      start?: string;
      hostId?: string;
      meetingUrl?: string;
    },
  ): Promise<Appointment>;
  /** A client asks for another time (applied at once in automatic mode). */
  requestChange(
    id: string,
    start: string,
    hostId?: string,
  ): Promise<Appointment>;
  /** Team only. */
  respondToChange(
    id: string,
    accept: boolean,
    reply?: string,
  ): Promise<Appointment>;
  /** Team only: moved at once, the client is told. */
  moveAppointment(
    id: string,
    start: string,
    hostId?: string,
  ): Promise<Appointment>;
  cancelAppointment(id: string, reason?: string): Promise<Appointment>;
  /** Team only. */
  updateAppointment(
    id: string,
    patch: Partial<Pick<Appointment, 'meetingUrl' | 'hostId' | 'topic'>>,
  ): Promise<Appointment>;
  /** Team only. */
  addBlock(block: Omit<TimeBlock, 'id'>): Promise<TimeBlock>;
  /** Team only. */
  removeBlock(id: string): Promise<void>;

  // Notifications
  /** What others did that concerns the user, latest first. */
  listActivity(limit?: number): Promise<Activity[]>;
  /** All, or those matching the filter. */
  markActivityRead(filter?: {
    ids?: string[];
    kinds?: ActivityKind[];
    clientId?: string;
  }): Promise<void>;

  /** Called on authenticated Realtime changes and local mutations. */
  subscribe(listener: () => void): () => void;
}
