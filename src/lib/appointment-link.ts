import { company, portalEnabled } from '../content/site';
import type { Locale } from './routes';

/** The public discovery booking flow, carrying the website language into the separate portal. */
export function appointmentLink(locale: Locale) {
  return portalEnabled ? `/espace/reserver?lang=${locale}` : company.appointment;
}
