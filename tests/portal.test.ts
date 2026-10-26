import assert from 'node:assert/strict';
import test from 'node:test';
import { computeSlots } from '../supabase/functions/_shared/availability.ts';
import { fileExpiry } from '../supabase/functions/_shared/retention.ts';
import { atMinutes, DAY, HOUR } from '../supabase/functions/_shared/time.ts';
import {
  defaultBooking,
  defaultRetention,
} from '../supabase/functions/_shared/defaults.ts';
import {
  PortalService,
  validateBooking,
  type Repository,
} from '../supabase/functions/_shared/service.ts';
import type {
  Appointment,
  BookingConfig,
  User,
} from '../supabase/functions/_shared/types.ts';
const iso = (key: string, hour: number, minute = 0) =>
  atMinutes(key, hour * 60 + minute).toISOString();
function config() {
  return structuredClone(defaultBooking);
}
const user: User = {
  id: 'client-one',
  role: 'client',
  email: 'one@example.invalid',
  firstName: 'One',
  lastName: 'Client',
  organisation: 'Test',
  phone: '',
  locale: 'fr',
  status: 'pending',
  createdAt: new Date().toISOString(),
  notify: {
    messages: true,
    files: true,
    appointments: true,
    weeklyPurge: true,
  },
};
const appointment: Appointment = {
  id: 'a',
  clientId: 'another-client',
  hostId: 'maeva',
  typeId: 'decouverte',
  start: iso('2026-10-27', 10),
  end: iso('2026-10-27', 10, 15),
  status: 'confirmed',
  change: {
    hostId: 'emilie',
    start: iso('2026-10-28', 14),
    end: iso('2026-10-28', 14, 15),
    at: iso('2026-10-26', 12),
  },
  createdAt: iso('2026-10-26', 12),
  updatedAt: iso('2026-10-26', 12),
  guest: null,
  topic: '',
  reply: '',
  meetingUrl: '',
  createdBy: 'team',
};
test('Paris DST conversion keeps opening hours stable at both transitions', () => {
  assert.equal(iso('2026-03-27', 10), '2026-03-27T09:00:00.000Z');
  assert.equal(iso('2026-03-30', 10), '2026-03-30T08:00:00.000Z');
  assert.equal(iso('2026-10-23', 10), '2026-10-23T08:00:00.000Z');
  assert.equal(iso('2026-10-26', 10), '2026-10-26T09:00:00.000Z');
});
test('both an appointment and its pending change reserve the host, with the buffer', () => {
  const c = config();
  c.minNoticeHours = 0;
  const slots = computeSlots(
    c,
    [appointment],
    'decouverte',
    Date.parse(iso('2026-10-27', 9)),
    Date.parse(iso('2026-10-29', 18)),
    Date.parse(iso('2026-10-26', 9)),
  );
  assert(
    !slots
      .find((s) => s.start === iso('2026-10-27', 10))
      ?.hostIds.includes('maeva'),
  );
  assert(
    !slots
      .find((s) => s.start === iso('2026-10-27', 10, 15))
      ?.hostIds.includes('maeva'),
  );
  assert(
    !slots
      .find((s) => s.start === iso('2026-10-28', 14))
      ?.hostIds.includes('emilie'),
  );
  assert(
    slots
      .find((s) => s.start === iso('2026-10-27', 10))
      ?.hostIds.includes('emilie'),
  );
});
test('closures, blocked time, minimum notice and horizon constrain public slots', () => {
  const c = config();
  c.minNoticeHours = 24;
  c.horizonDays = 2;
  c.closedDays = ['2026-10-28'];
  c.blocks = [
    {
      id: 'blocked',
      hostId: null,
      start: iso('2026-10-27', 9),
      end: iso('2026-10-27', 18),
      reason: 'Closed',
    },
  ];
  const now = Date.parse(iso('2026-10-26', 10));
  assert.deepEqual(
    computeSlots(c, [], 'decouverte', now, now + 10 * DAY, now),
    [],
  );
});
test('weekly retention respects the minimum age across the DST weekend; kept files stay', () => {
  const settings = {
    ...defaultRetention,
    weekday: 6,
    hour: 23,
    minimumDays: 3,
  };
  const createdAt = iso('2026-10-23', 12);
  const expiry = fileExpiry({ createdAt, kept: false }, settings)!;
  assert.equal(expiry, iso('2026-11-01', 23));
  assert(Date.parse(expiry) - Date.parse(createdAt) >= 3 * DAY);
  assert.equal(fileExpiry({ createdAt, kept: true }, settings), null);
  assert.equal(
    fileExpiry({ createdAt, kept: false }, { ...settings, enabled: false }),
    null,
  );
});
test('malformed scheduling settings cannot cause unbounded slot generation', () => {
  assert.throws(() => validateBooking({ ...config(), stepMinutes: 0 }), {
    code: 'invalid_input',
  });
  assert.throws(() => validateBooking({ ...config(), horizonDays: 10000 }), {
    code: 'invalid_input',
  });
  assert.throws(
    () =>
      validateBooking({
        ...config(),
        rules: [
          {
            id: 'x',
            hostId: 'unknown',
            weekday: 1,
            start: '10:00',
            end: '11:00',
          },
        ],
      }),
    { code: 'invalid_input' },
  );
});
test('clients cannot promote themselves, read another conversation or change its appointment', async () => {
  let written: User | undefined;
  const repo = {
    put: async (_kind: string, value: User) => {
      written = value;
    },
    get: async () => structuredClone(appointment),
  } as unknown as Repository;
  const svc = new PortalService(repo, structuredClone(user));
  await svc.updateProfile({
    firstName: 'Updated',
    role: 'admin',
    status: 'active',
    email: 'evil@example.invalid',
  } as never);
  assert.equal(written?.role, 'client');
  assert.equal(written?.status, 'pending');
  assert.equal(written?.email, user.email);
  await assert.rejects(svc.listMessages('another-client'), {
    code: 'forbidden',
  });
  await assert.rejects(svc.cancelAppointment(appointment.id), {
    code: 'forbidden',
  });
  await assert.rejects(svc.listClients(), { code: 'forbidden' });
  await assert.rejects(
    new PortalService(repo, { ...user, status: 'disabled' }).listTeam(),
    { code: 'account_disabled' },
  );
});
test('public booking configuration withholds private formats and blocked-time reasons', async () => {
  const c: BookingConfig = config();
  c.blocks = [
    {
      id: 'private',
      hostId: null,
      start: iso('2026-10-27', 9),
      end: iso('2026-10-27', 12),
      reason: 'Private appointment',
    },
  ];
  const svc = new PortalService(
    { setting: async () => structuredClone(c) } as unknown as Repository,
    null,
  );
  const publicConfig = await svc.getBookingConfig();
  assert.equal(publicConfig.blocks.length, 0);
  assert(publicConfig.types.every((t) => t.public));
});
test('slot requests are bounded and require authorization to ignore held appointments', async () => {
  const svc = new PortalService(
    { setting: async () => config() } as unknown as Repository,
    null,
  );
  await assert.rejects(
    svc.availableSlots('decouverte', '2026-10-26', '2027-10-26'),
    { code: 'invalid_input' },
  );
  await assert.rejects(
    svc.availableSlots(
      'decouverte',
      '2026-10-26',
      '2026-10-28',
      undefined,
      'secret',
    ),
    { code: 'unauthenticated' },
  );
  assert.equal(HOUR, 3600000);
});
