import type { Expertise } from '../content/fr';

/** Sampling equipment is supporting information reached from eDNA, not an expertise. */
export const listedExpertises = (services: Expertise[]) =>
  services.filter((service) => service.listed !== false);
