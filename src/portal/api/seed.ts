// Sample data for the demonstration, dated from today so it always looks current. The clients,
// visitors and their messages are fictitious (".demo" addresses); the team and the appointment
// offer are LDgenX's own. Nothing here is shown on the public site.
import type {
  Activity,
  Appointment,
  BookingConfig,
  FileItem,
  Inquiry,
  Message,
  RetentionSettings,
  User,
} from './types';
import { DAY, HOUR, addDays, atMinutes, teamDay, weekdayOf } from '../lib/time';
import { fileExpiry } from '../lib/retention';

export interface DemoStore {
  version: 2;
  users: (User & { passwordHash: string })[];
  messages: Message[];
  files: FileItem[];
  inquiries: Inquiry[];
  appointments: Appointment[];
  booking: BookingConfig;
  retention: RetentionSettings;
  activity: Activity[];
}

export const DEMO_PASSWORD = 'demo2026';
export const DEMO_ACCOUNTS = {
  client: 'camille.martin@bureau-exemple.demo',
  team: 'maeva@ldgenx.demo',
};

export const defaultRetention: RetentionSettings = {
  enabled: true,
  weekday: 6,
  hour: 23,
  minimumDays: 3,
  notice: {
    fr: 'Les fichiers de votre espace sont supprimés automatiquement chaque semaine. Prochaine suppression : {date}. Pensez à télécharger vos documents d’ici là.',
    en: 'Files in your space are deleted automatically every week. Next deletion: {date}. Remember to download your documents before then.',
  },
  lastPurgeAt: null,
};

export const defaultBooking: BookingConfig = {
  types: [
    {
      id: 'decouverte',
      label: { fr: 'Échange découverte', en: 'Discovery call' },
      description: {
        fr: '15 minutes pour présenter votre projet ou votre question, gratuitement et sans engagement.',
        en: '15 minutes to present your project or question, free and without commitment.',
      },
      minutes: 15,
      public: true,
      location: 'video',
      colour: '#73b50f',
      active: true,
    },
    {
      id: 'suivi',
      label: { fr: 'Point d’avancement', en: 'Progress meeting' },
      description: {
        fr: 'Faire le point avec l’équipe sur votre projet en cours.',
        en: 'Review your ongoing project with the team.',
      },
      minutes: 30,
      public: false,
      location: 'video',
      colour: '#2b7dc2',
      active: true,
    },
    {
      id: 'restitution',
      label: { fr: 'Restitution des résultats', en: 'Results presentation' },
      description: {
        fr: 'Présentation et discussion de vos résultats.',
        en: 'Presentation and discussion of your results.',
      },
      minutes: 60,
      public: false,
      location: 'video',
      colour: '#03254b',
      active: true,
    },
  ],
  hosts: [
    {
      id: 'maeva',
      name: 'Dr Maeva Leitwein',
      role: {
        fr: 'Cofondatrice · Génomique des populations',
        en: 'Co-founder · Population genomics',
      },
      colour: '#73b50f',
      bookable: true,
    },
    {
      id: 'emilie',
      name: 'Dr Emilie Delpuech',
      role: { fr: 'Cofondatrice · Bioinformatique', en: 'Co-founder · Bioinformatics' },
      colour: '#2b7dc2',
      bookable: true,
    },
    {
      id: 'damien',
      name: 'Dr Damien Crestel',
      role: { fr: 'Bioinformaticien', en: 'Bioinformatician' },
      colour: '#1c94a2',
      bookable: true,
    },
    {
      id: 'maxime',
      name: 'Maxime Lambert',
      role: { fr: 'Ingénieur laboratoire', en: 'Laboratory engineer' },
      colour: '#7a9e12',
      bookable: false,
    },
  ],
  rules: ['maeva', 'emilie', 'damien'].flatMap((hostId) =>
    [0, 1, 2, 3, 4].flatMap((weekday) => [
      { id: `${hostId}-${weekday}-am`, hostId, weekday, start: '09:30', end: '12:00' },
      { id: `${hostId}-${weekday}-pm`, hostId, weekday, start: '14:00', end: '17:30' },
    ]),
  ),
  blocks: [],
  bufferMinutes: 10,
  minNoticeHours: 24,
  horizonDays: 60,
  stepMinutes: 15,
  // French public holidays.
  closedDays: [
    '2026-11-11',
    '2026-12-25',
    '2027-01-01',
    '2027-03-29',
    '2027-05-01',
    '2027-05-06',
    '2027-05-08',
    '2027-05-17',
    '2027-07-14',
    '2027-08-15',
    '2027-11-01',
    '2027-11-11',
    '2027-12-25',
  ],
  approval: 'manual',
};

/** A small but valid PDF with a title and a few lines, for the sample files. */
export function samplePdf(title: string, lines: string[]) {
  const text = [title, '', ...lines]
    .map(
      (line, i) =>
        `BT /F1 ${i ? 11 : 16} Tf 56 ${780 - i * 20} Td (${line.replace(/[()\\]/g, '')}) Tj ET`,
    )
    .join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  // Latin-1 bytes, so accented letters print with the standard font.
  const bytes = Uint8Array.from(body, (c) => (c.charCodeAt(0) < 256 ? c.charCodeAt(0) : 63));
  return new Blob([bytes], { type: 'application/pdf' });
}

const csv = (rows: (string | number)[][]) =>
  new Blob([`﻿${rows.map((r) => r.join(';')).join('\n')}`], { type: 'text/csv' });

/** The sample data, and the contents of its files. */
export function buildSeed(now: number, passwordHash: string) {
  const iso = (t: number) => new Date(t).toISOString();
  const ago = (days: number, hours = 0) => iso(now - days * DAY - hours * HOUR);
  // The nth working day from today (n < 0: before), at a time in Paris.
  const workday = (n: number, hour: number, minute = 0) => {
    let key = teamDay(now);
    let left = Math.abs(n);
    const step = n < 0 ? -1 : 1;
    while (left > 0) {
      key = addDays(key, step);
      if (weekdayOf(key) < 5) left--;
    }
    return atMinutes(key, hour * 60 + minute).getTime();
  };
  const notify = { messages: true, files: true, appointments: true, weeklyPurge: true };
  const person = (
    id: string,
    role: User['role'],
    firstName: string,
    lastName: string,
    email: string,
    organisation: string,
    extra: Partial<User> = {},
  ): DemoStore['users'][number] => ({
    id,
    role,
    email,
    firstName,
    lastName,
    organisation,
    phone: '',
    status: 'active',
    locale: 'fr',
    createdAt: ago(200),
    notify,
    passwordHash,
    ...extra,
  });
  const users: DemoStore['users'] = [
    person('maeva', 'admin', 'Maeva', 'Leitwein', 'maeva@ldgenx.demo', 'LDgenX'),
    person('emilie', 'admin', 'Emilie', 'Delpuech', 'emilie@ldgenx.demo', 'LDgenX'),
    person('damien', 'admin', 'Damien', 'Crestel', 'damien@ldgenx.demo', 'LDgenX'),
    person('maxime', 'admin', 'Maxime', 'Lambert', 'maxime@ldgenx.demo', 'LDgenX'),
    person(
      'c-camille',
      'client',
      'Camille',
      'Martin',
      'camille.martin@bureau-exemple.demo',
      'Bureau d’études Exemple',
      { phone: '06 00 00 00 00', createdAt: ago(48), lastSeenAt: ago(1, 2) },
    ),
    person(
      'c-julien',
      'client',
      'Julien',
      'Moreau',
      'julien.moreau@syndicat-demo.demo',
      'Syndicat mixte de démonstration',
      { createdAt: ago(120), lastSeenAt: ago(0, 3) },
    ),
    person(
      'c-lucas',
      'client',
      'Lucas',
      'Girard',
      'lucas.girard@ferme-demo.demo',
      'Ferme aquacole de démonstration',
      { createdAt: ago(9) },
    ),
    person(
      'c-sarah',
      'client',
      'Sarah',
      'Benali',
      'sarah.benali@labo-demo.demo',
      'Laboratoire de démonstration',
      { status: 'pending', locale: 'en', createdAt: ago(0, 5), lastSeenAt: ago(0, 5) },
    ),
  ];

  const message = (
    id: string,
    clientId: string,
    authorId: string,
    createdAt: string,
    body: string,
    readBy: string[],
    fileIds: string[] = [],
  ): Message => ({ id, clientId, authorId, body, fileIds, createdAt, readBy });
  const team = ['maeva', 'emilie', 'damien', 'maxime'];
  const messages: Message[] = [
    message(
      'msg-1',
      'c-camille',
      'c-camille',
      ago(5, 3),
      'Bonjour, les kits de prélèvement sont bien arrivés. Pouvons-nous prévoir les prélèvements la semaine prochaine ?',
      ['c-camille', ...team],
    ),
    message(
      'msg-2',
      'c-camille',
      'maeva',
      ago(5, 1),
      'Bonjour Camille, oui. Le protocole d’échantillonnage est dans vos fichiers : filtrez l’eau le jour même et gardez les capsules au frais avant l’envoi.',
      ['c-camille', ...team],
      ['f-1'],
    ),
    message(
      'msg-3',
      'c-camille',
      'c-camille',
      ago(4),
      'Merci. Voici le plan des stations ; les capsules partent demain par transporteur.',
      ['c-camille', ...team],
      ['f-3'],
    ),
    message(
      'msg-4',
      'c-camille',
      'maeva',
      ago(1, 4),
      'Les premiers résultats sont disponibles : vous trouverez le détail par station dans vos fichiers.',
      team,
      ['f-2'],
    ),
    message(
      'msg-5',
      'c-julien',
      'c-julien',
      ago(8),
      'Bonjour, pouvez-vous nous envoyer le rapport final au format PDF ?',
      ['c-julien', ...team],
    ),
    message(
      'msg-6',
      'c-julien',
      'damien',
      ago(6),
      'Bonjour Julien, le rapport final est dans vos fichiers.',
      ['c-julien', ...team],
      ['f-4'],
    ),
    message(
      'msg-7',
      'c-julien',
      'c-julien',
      ago(0, 3),
      'Merci, nous aimerions en discuter avec l’équipe : je viens de demander un rendez-vous.',
      ['c-julien'],
    ),
    message(
      'msg-8',
      'c-sarah',
      'c-sarah',
      ago(0, 5),
      'Hello, we are planning to monitor the biodiversity of three lagoons and would like to know whether environmental DNA suits this project.',
      ['c-sarah'],
    ),
  ];

  const retention = defaultRetention;
  const file = (
    id: string,
    clientId: string,
    name: string,
    blob: Blob,
    direction: FileItem['direction'],
    uploadedBy: string,
    createdAt: string,
    extra: Partial<FileItem> = {},
  ): [FileItem, Blob] => {
    const kept = extra.kept ?? false;
    return [
      {
        id,
        clientId,
        name,
        size: blob.size,
        type: blob.type,
        direction,
        uploadedBy,
        note: '',
        createdAt,
        kept,
        expiresAt: fileExpiry({ createdAt, kept }, retention),
        downloads: [],
        ...extra,
      },
      blob,
    ];
  };
  const filePairs = [
    file(
      'f-1',
      'c-camille',
      'Protocole-echantillonnage-eau-douce.pdf',
      samplePdf('Protocole d’échantillonnage', [
        'Document de démonstration.',
        'Filtration le jour du prélèvement.',
        'Capsules conservées au frais jusqu’à l’envoi.',
      ]),
      'to_client',
      'maeva',
      ago(2, 2),
      { note: 'À lire avant la campagne.', downloads: [{ userId: 'c-camille', at: ago(2) }] },
    ),
    file(
      'f-2',
      'c-camille',
      'Resultats-preliminaires-stations-1-8.csv',
      csv([
        ['Station', 'Espèces détectées'],
        ['S1', 9],
        ['S2', 11],
        ['S3', 7],
        ['S4', 12],
        ['S5', 10],
        ['S6', 8],
        ['S7', 13],
        ['S8', 9],
      ]),
      'to_client',
      'maeva',
      ago(1, 4),
      { note: 'Données de démonstration.' },
    ),
    file(
      'f-3',
      'c-camille',
      'Plan-des-stations.csv',
      csv([
        ['Station', 'Latitude', 'Longitude'],
        ['S1', '43,5200', '3,9100'],
        ['S2', '43,5210', '3,9120'],
      ]),
      'from_client',
      'c-camille',
      ago(4),
    ),
    file(
      'f-4',
      'c-julien',
      'Rapport-final.pdf',
      samplePdf('Rapport final', ['Document de démonstration.']),
      'to_client',
      'damien',
      ago(6),
      { note: 'Version finale.', kept: true, downloads: [{ userId: 'c-julien', at: ago(5) }] },
    ),
  ];

  const inquiry = (
    id: string,
    createdAt: string,
    status: Inquiry['status'],
    fields: Omit<Inquiry, 'id' | 'createdAt' | 'status' | 'locale'>,
  ): Inquiry => ({ id, createdAt, status, locale: 'fr', ...fields });
  const inquiries: Inquiry[] = [
    inquiry('i-1', ago(0, 2), 'new', {
      name: 'Hugo Lefèvre',
      email: 'hugo.lefevre@exemple.demo',
      organisation: 'Parc naturel régional de démonstration',
      sector: 'Biodiversité & Conservation',
      material: 'Eau',
      timeline: 'Printemps 2027',
      message:
        'Nous souhaitons suivre la présence de la loutre sur nos cours d’eau. L’ADN environnemental est-il adapté, et quel serait le calendrier ?',
    }),
    inquiry('i-2', ago(1, 3), 'read', {
      name: 'Inès Garnier',
      email: 'ines.garnier@exemple.demo',
      organisation: 'Cabinet de conseil de démonstration',
      sector: 'Études environnementales',
      material: 'Sédiments',
      timeline: 'Avant la fin de l’année',
      message:
        'Nous préparons une étude d’impact portuaire et cherchons un partenaire pour les analyses de sédiments.',
    }),
    inquiry('i-3', ago(6), 'done', {
      name: 'Paul Mercier',
      email: 'paul.mercier@exemple.demo',
      organisation: 'Lycée agricole de démonstration',
      sector: 'Agriculture & Agroécologie',
      material: 'Sols',
      timeline: 'À définir',
      message:
        'Un projet pédagogique sur la biodiversité des sols : proposez-vous des interventions auprès d’élèves ?',
    }),
  ];

  const appointment = (
    id: string,
    typeId: string,
    hostId: string,
    start: number,
    minutes: number,
    patch: Partial<Appointment>,
  ): Appointment => ({
    id,
    typeId,
    hostId,
    start: iso(start),
    end: iso(start + minutes * 60_000),
    status: 'confirmed',
    clientId: null,
    guest: null,
    topic: '',
    meetingUrl: '',
    change: null,
    reply: '',
    createdBy: 'client',
    createdAt: ago(3),
    updatedAt: ago(3),
    ...patch,
  });
  const meet = 'https://meet.example.com/ldgenx-demo';
  const changeStart = workday(6, 9, 30);
  const appointments: Appointment[] = [
    appointment('a-1', 'suivi', 'maeva', workday(2, 10), 30, {
      clientId: 'c-camille',
      topic: 'Premiers résultats et suite de la campagne',
      meetingUrl: meet,
    }),
    appointment('a-2', 'decouverte', 'emilie', workday(3, 14, 30), 15, {
      status: 'requested',
      guest: {
        name: 'Thomas Durand',
        email: 'thomas.durand@exemple.demo',
        organisation: 'Écloserie de démonstration',
        phone: '',
      },
      topic: 'Traçabilité génétique de nos lots de naissains.',
      createdBy: 'guest',
      createdAt: ago(0, 7),
      updatedAt: ago(0, 7),
    }),
    appointment('a-3', 'suivi', 'damien', workday(4, 11), 30, {
      status: 'requested',
      clientId: 'c-julien',
      topic: 'Discuter du rapport final avec l’équipe.',
      createdAt: ago(0, 3),
      updatedAt: ago(0, 3),
    }),
    appointment('a-4', 'restitution', 'damien', workday(-4, 15), 60, {
      clientId: 'c-julien',
      topic: 'Restitution du rapport final',
      meetingUrl: meet,
      createdBy: 'team',
      createdAt: ago(14),
    }),
    appointment('a-5', 'decouverte', 'maeva', workday(-1, 11), 15, {
      guest: {
        name: 'Claire Roux',
        email: 'claire.roux@exemple.demo',
        organisation: 'Communauté de communes de démonstration',
        phone: '',
      },
      topic: 'Suivi des espèces invasives dans les étangs.',
      meetingUrl: meet,
      createdBy: 'guest',
      createdAt: ago(6),
    }),
    appointment('a-6', 'suivi', 'emilie', workday(5, 11), 30, {
      clientId: 'c-camille',
      topic: 'Organisation de la seconde campagne',
      meetingUrl: meet,
      createdBy: 'team',
      change: {
        start: iso(changeStart),
        end: iso(changeStart + 30 * 60_000),
        hostId: 'emilie',
        at: ago(0, 6),
      },
      updatedAt: ago(0, 6),
    }),
    appointment('a-7', 'decouverte', 'emilie', workday(1, 15), 15, {
      guest: {
        name: 'Léa Fontaine',
        email: 'lea.fontaine@exemple.demo',
        organisation: 'Association de démonstration',
        phone: '',
      },
      topic: 'Inventaire des amphibiens d’une mare.',
      meetingUrl: meet,
      createdBy: 'guest',
      createdAt: ago(2),
    }),
  ];

  const activity = (
    id: string,
    kind: Activity['kind'],
    at: string,
    actorId: string | null,
    audience: Activity['audience'],
    clientId: string | null,
    data: Activity['data'],
    readBy: string[] = [],
  ): Activity => ({ id, kind, at, actorId, audience, clientId, data, readBy });
  const admins = { admins: true, clientId: null };
  const activities: Activity[] = [
    activity('act-1', 'inquiry', ago(0, 2), null, admins, null, { name: 'Hugo Lefèvre' }),
    activity('act-2', 'message', ago(0, 3), 'c-julien', admins, 'c-julien', {
      name: 'Julien Moreau',
    }),
    activity('act-3', 'appointment_requested', ago(0, 3), 'c-julien', admins, 'c-julien', {
      name: 'Julien Moreau',
      type: 'suivi',
      start: appointments[2].start,
    }),
    activity('act-4', 'account_created', ago(0, 5), 'c-sarah', admins, 'c-sarah', {
      name: 'Sarah Benali',
      organisation: 'Laboratoire de démonstration',
    }),
    activity('act-5', 'change_requested', ago(0, 6), 'c-camille', admins, 'c-camille', {
      name: 'Camille Martin',
      type: 'suivi',
      start: iso(changeStart),
    }),
    activity('act-6', 'appointment_requested', ago(0, 7), null, admins, null, {
      name: 'Thomas Durand',
      type: 'decouverte',
      start: appointments[1].start,
    }),
    activity(
      'act-7',
      'message',
      ago(1, 4),
      'maeva',
      { admins: false, clientId: 'c-camille' },
      'c-camille',
      { name: 'Maeva Leitwein' },
    ),
    activity(
      'act-8',
      'file_uploaded',
      ago(1, 4),
      'maeva',
      { admins: false, clientId: 'c-camille' },
      'c-camille',
      { name: 'Resultats-preliminaires-stations-1-8.csv' },
    ),
    activity(
      'act-9',
      'appointment_confirmed',
      ago(3),
      'maeva',
      { admins: false, clientId: 'c-camille' },
      'c-camille',
      { type: 'suivi', start: appointments[0].start },
      ['c-camille'],
    ),
  ];

  const store: DemoStore = {
    version: 2,
    users,
    messages,
    files: filePairs.map(([f]) => f),
    inquiries,
    appointments,
    booking: defaultBooking,
    retention,
    activity: activities,
  };
  return { store, blobs: filePairs.map(([f, b]) => [f.id, b] as const) };
}
