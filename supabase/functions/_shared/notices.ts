import type { Activity, ActivityKind, Appointment } from './types.ts';
import { productionOrigin } from './site.ts';

/** The sentence the team reads, in the words of the notification bell. */
const sentences: Record<ActivityKind, [fr: string, en: string]> = {
  account_created: [
    'Nouveau compte à valider : {name}',
    'New account to approve: {name}',
  ],
  message: ['Nouveau message de {name}', 'New message from {name}'],
  file_uploaded: ['Fichier reçu : {name}', 'File received: {name}'],
  inquiry: [
    'Nouveau message depuis le site : {name}',
    'New message from the website: {name}',
  ],
  purge: [
    'Suppression hebdomadaire : {count} fichier(s) supprimé(s)',
    'Weekly deletion: {count} file(s) deleted',
  ],
  appointment_requested: [
    'Demande de rendez-vous : {name}',
    'Appointment request: {name}',
  ],
  appointment_confirmed: [
    'Rendez-vous confirmé : {name}',
    'Appointment confirmed: {name}',
  ],
  appointment_declined: ['Demande refusée : {name}', 'Request declined: {name}'],
  appointment_cancelled: [
    'Rendez-vous annulé : {name}',
    'Appointment cancelled: {name}',
  ],
  appointment_moved: [
    'Rendez-vous déplacé : {name}',
    'Appointment moved: {name}',
  ],
  change_requested: [
    '{name} demande un autre horaire',
    '{name} asks for another time',
  ],
  change_declined: ['Changement refusé : {name}', 'Change declined: {name}'],
};
/** The screen that deals with each event, as the notification bell opens it. */
const screens: Partial<
  Record<ActivityKind, (clientId: string | null) => string>
> = {
  message: (id) => `/admin/messages?client=${id}`,
  file_uploaded: (id) => `/admin/clients/${id}?onglet=files`,
  account_created: (id) => `/admin/clients/${id}`,
  inquiry: () => '/admin/messages?vue=site',
  purge: () => '/admin/parametres?onglet=files',
  appointment_requested: () => '/admin/demandes',
  change_requested: () => '/admin/demandes',
};
const oneLine = (value: unknown) =>
  String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
function moment(value: unknown, fr: boolean) {
  const date = new Date(String(value ?? ''));
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat(fr ? 'fr-FR' : 'en-GB', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Europe/Paris',
      }).format(date);
}
/** What happened, when, and the link that opens it. Message contents stay in the portal. */
export function teamNotice(
  kind: ActivityKind,
  values: Activity['data'],
  clientId: string | null,
  locale: string,
) {
  const fr = locale !== 'en';
  const line = sentences[kind][fr ? 0 : 1].replace(/\{(\w+)\}/g, (_, key) =>
    oneLine(values[key]),
  );
  const when = moment(values.start, fr);
  const screen = (screens[kind] ?? (() => '/admin/agenda'))(clientId);
  return {
    subject: `LDgenX — ${line}`,
    body: [
      line,
      ...(when ? [when] : []),
      '',
      fr ? 'Ouvrir dans l’administration :' : 'Open in the administration:',
      productionOrigin + screen,
      '',
      fr
        ? `Notification automatique. Choisir vos notifications : ${productionOrigin}/admin/compte`
        : `Automatic notification. Choose your notifications: ${productionOrigin}/admin/compte`,
    ].join('\n'),
  };
}
const guestStatus: Record<Appointment['status'], [fr: string, en: string]> = {
  requested: [
    'Votre demande de rendez-vous avec LDgenX est bien reçue. L’équipe vous répond rapidement.',
    'Your appointment request has reached LDgenX. The team will answer shortly.',
  ],
  confirmed: [
    'Votre rendez-vous avec LDgenX est confirmé.',
    'Your appointment with LDgenX is confirmed.',
  ],
  declined: [
    'Votre demande de rendez-vous n’a pas pu être acceptée.',
    'Your appointment request could not be accepted.',
  ],
  cancelled: [
    'Votre rendez-vous avec LDgenX est annulé.',
    'Your appointment with LDgenX is cancelled.',
  ],
};
/** People who book without an account have no space to read: the email carries everything. */
export function guestNotice(
  appointment: Pick<Appointment, 'status' | 'start' | 'reply' | 'meetingUrl'>,
) {
  const part = (fr: boolean) =>
    [
      guestStatus[appointment.status][fr ? 0 : 1],
      moment(appointment.start, fr),
      appointment.reply,
      appointment.meetingUrl,
    ]
      .filter(Boolean)
      .join('\n');
  return `${part(true)}\nContact : info@ldgenx.fr\n\n${part(false)}\nContact: info@ldgenx.fr`;
}
