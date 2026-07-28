import { CONTACT } from '../app/config/contact';
import { formatPhoneGeo } from './phoneGeo';

/** One labeled row in the confirmation email's request recap. */
export interface RecapField {
  label: string;
  value: string;
}

/** Fixed closing appended to every confirmation. */
export const SIGNATURE = `Warm regards,\nThe BlueOne Team\n${CONTACT.phone.formatted} · ${CONTACT.email}`;

/**
 * Contact rows shared by every confirmation. The phone row is enriched with the
 * country and time zone derived from the number's international dialing code
 * (see lib/phoneGeo.ts), e.g. "+33 6 … (France · Europe/Paris · UTC+2)".
 */
export function contactRecapFields(name: string, email: string, phone?: string): RecapField[] {
  const geo = phone ? formatPhoneGeo(phone) : null;
  return [
    { label: 'Name', value: name },
    { label: 'Email', value: email },
    { label: 'Phone', value: phone ? `${phone}${geo ? ` (${geo})` : ''}` : '' },
  ];
}

/**
 * Render the labeled rows as a plain-text recap block, dropping empty values.
 * Returns '' when there is nothing to show.
 */
export function buildDetailsRecap(fields: RecapField[]): string {
  const rows = fields.filter(f => f.value && f.value.trim());
  if (rows.length === 0) return '';
  return ['—— Your request ——', ...rows.map(f => `${f.label}: ${f.value}`)].join('\n');
}
