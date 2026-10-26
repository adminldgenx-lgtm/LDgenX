import type { BookingConfig, RetentionSettings } from './types.ts';

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
      role: {
        fr: 'Cofondatrice · Bioinformatique',
        en: 'Co-founder · Bioinformatics',
      },
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
      {
        id: `${hostId}-${weekday}-am`,
        hostId,
        weekday,
        start: '09:30',
        end: '12:00',
      },
      {
        id: `${hostId}-${weekday}-pm`,
        hostId,
        weekday,
        start: '14:00',
        end: '17:30',
      },
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
