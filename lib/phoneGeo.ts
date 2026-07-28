/**
 * Best-effort geo lookup from a phone number's international dialing code.
 *
 * Used to enrich the request-confirmation email with the guest's likely country
 * and time zone (so the business, Bcc'd on every confirmation, knows roughly when
 * to call). It is intentionally dependency-free — a curated dialing-code table is
 * enough for this display purpose and keeps the client bundle light.
 *
 * Caveats:
 * - The guest must enter the number in international format (leading `+` or `00`).
 *   Local-format numbers cannot be resolved and return `null`.
 * - Shared dialing codes (e.g. +1 spans US/Canada, +7 spans Russia/Kazakhstan) and
 *   multi-time-zone countries (US, RU, AU, CA…) resolve to a single representative
 *   country / primary IANA zone. This is an approximation, not authoritative.
 */

interface DialEntry {
  /** ISO 3166-1 alpha-2 country code. */
  iso: string;
  /** Representative primary IANA time zone for the country. */
  timeZone: string;
}

/**
 * Dialing code → representative country + primary time zone.
 * Ordered loosely by market relevance; lookup is longest-prefix so the map order
 * does not matter for correctness.
 */
const DIAL_CODES: Record<string, DialEntry> = {
  // North America (shared +1 → representative US)
  '1': { iso: 'US', timeZone: 'America/New_York' },
  // Europe
  '30': { iso: 'GR', timeZone: 'Europe/Athens' },
  '31': { iso: 'NL', timeZone: 'Europe/Amsterdam' },
  '32': { iso: 'BE', timeZone: 'Europe/Brussels' },
  '33': { iso: 'FR', timeZone: 'Europe/Paris' },
  '34': { iso: 'ES', timeZone: 'Europe/Madrid' },
  '351': { iso: 'PT', timeZone: 'Europe/Lisbon' },
  '352': { iso: 'LU', timeZone: 'Europe/Luxembourg' },
  '353': { iso: 'IE', timeZone: 'Europe/Dublin' },
  '354': { iso: 'IS', timeZone: 'Atlantic/Reykjavik' },
  '356': { iso: 'MT', timeZone: 'Europe/Malta' },
  '357': { iso: 'CY', timeZone: 'Asia/Nicosia' },
  '358': { iso: 'FI', timeZone: 'Europe/Helsinki' },
  '359': { iso: 'BG', timeZone: 'Europe/Sofia' },
  '36': { iso: 'HU', timeZone: 'Europe/Budapest' },
  '370': { iso: 'LT', timeZone: 'Europe/Vilnius' },
  '371': { iso: 'LV', timeZone: 'Europe/Riga' },
  '372': { iso: 'EE', timeZone: 'Europe/Tallinn' },
  '373': { iso: 'MD', timeZone: 'Europe/Chisinau' },
  '374': { iso: 'AM', timeZone: 'Asia/Yerevan' },
  '375': { iso: 'BY', timeZone: 'Europe/Minsk' },
  '376': { iso: 'AD', timeZone: 'Europe/Andorra' },
  '377': { iso: 'MC', timeZone: 'Europe/Monaco' },
  '378': { iso: 'SM', timeZone: 'Europe/San_Marino' },
  '380': { iso: 'UA', timeZone: 'Europe/Kyiv' },
  '381': { iso: 'RS', timeZone: 'Europe/Belgrade' },
  '382': { iso: 'ME', timeZone: 'Europe/Podgorica' },
  '385': { iso: 'HR', timeZone: 'Europe/Zagreb' },
  '386': { iso: 'SI', timeZone: 'Europe/Ljubljana' },
  '387': { iso: 'BA', timeZone: 'Europe/Sarajevo' },
  '389': { iso: 'MK', timeZone: 'Europe/Skopje' },
  '39': { iso: 'IT', timeZone: 'Europe/Rome' },
  '40': { iso: 'RO', timeZone: 'Europe/Bucharest' },
  '41': { iso: 'CH', timeZone: 'Europe/Zurich' },
  '420': { iso: 'CZ', timeZone: 'Europe/Prague' },
  '421': { iso: 'SK', timeZone: 'Europe/Bratislava' },
  '423': { iso: 'LI', timeZone: 'Europe/Vaduz' },
  '43': { iso: 'AT', timeZone: 'Europe/Vienna' },
  '44': { iso: 'GB', timeZone: 'Europe/London' },
  '45': { iso: 'DK', timeZone: 'Europe/Copenhagen' },
  '46': { iso: 'SE', timeZone: 'Europe/Stockholm' },
  '47': { iso: 'NO', timeZone: 'Europe/Oslo' },
  '48': { iso: 'PL', timeZone: 'Europe/Warsaw' },
  '49': { iso: 'DE', timeZone: 'Europe/Berlin' },
  '7': { iso: 'RU', timeZone: 'Europe/Moscow' },
  // Middle East
  '90': { iso: 'TR', timeZone: 'Europe/Istanbul' },
  '971': { iso: 'AE', timeZone: 'Asia/Dubai' },
  '972': { iso: 'IL', timeZone: 'Asia/Jerusalem' },
  '966': { iso: 'SA', timeZone: 'Asia/Riyadh' },
  '974': { iso: 'QA', timeZone: 'Asia/Qatar' },
  '965': { iso: 'KW', timeZone: 'Asia/Kuwait' },
  '973': { iso: 'BH', timeZone: 'Asia/Bahrain' },
  '968': { iso: 'OM', timeZone: 'Asia/Muscat' },
  '961': { iso: 'LB', timeZone: 'Asia/Beirut' },
  '962': { iso: 'JO', timeZone: 'Asia/Amman' },
  '20': { iso: 'EG', timeZone: 'Africa/Cairo' },
  // Asia-Pacific
  '61': { iso: 'AU', timeZone: 'Australia/Sydney' },
  '64': { iso: 'NZ', timeZone: 'Pacific/Auckland' },
  '65': { iso: 'SG', timeZone: 'Asia/Singapore' },
  '852': { iso: 'HK', timeZone: 'Asia/Hong_Kong' },
  '81': { iso: 'JP', timeZone: 'Asia/Tokyo' },
  '82': { iso: 'KR', timeZone: 'Asia/Seoul' },
  '86': { iso: 'CN', timeZone: 'Asia/Shanghai' },
  '91': { iso: 'IN', timeZone: 'Asia/Kolkata' },
  '60': { iso: 'MY', timeZone: 'Asia/Kuala_Lumpur' },
  '62': { iso: 'ID', timeZone: 'Asia/Jakarta' },
  '63': { iso: 'PH', timeZone: 'Asia/Manila' },
  '66': { iso: 'TH', timeZone: 'Asia/Bangkok' },
  '84': { iso: 'VN', timeZone: 'Asia/Ho_Chi_Minh' },
  // Africa
  '27': { iso: 'ZA', timeZone: 'Africa/Johannesburg' },
  '212': { iso: 'MA', timeZone: 'Africa/Casablanca' },
  '234': { iso: 'NG', timeZone: 'Africa/Lagos' },
  '254': { iso: 'KE', timeZone: 'Africa/Nairobi' },
  // Americas
  '52': { iso: 'MX', timeZone: 'America/Mexico_City' },
  '54': { iso: 'AR', timeZone: 'America/Argentina/Buenos_Aires' },
  '55': { iso: 'BR', timeZone: 'America/Sao_Paulo' },
  '56': { iso: 'CL', timeZone: 'America/Santiago' },
  '57': { iso: 'CO', timeZone: 'America/Bogota' },
  '58': { iso: 'VE', timeZone: 'America/Caracas' },
  '51': { iso: 'PE', timeZone: 'America/Lima' },
};

/** Longest dialing-code prefix present in the table (3 digits). */
const MAX_CODE_LEN = 3;

export interface PhoneGeo {
  /** Human-readable country name, e.g. "France". */
  countryName: string;
  /** Representative IANA time zone, e.g. "Europe/Paris". */
  timeZone: string;
  /** Live short UTC offset for the zone, e.g. "UTC+2". */
  utcOffset?: string;
}

/**
 * Extract the digits of the international dialing portion, if the number is in
 * international format. Accepts a leading `+` or `00` prefix; returns the raw
 * digit string (without the prefix) or `null` when no international prefix is found.
 */
function toInternationalDigits(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) {
    return trimmed.slice(1).replace(/\D/g, '') || null;
  }
  // 00 is the common international access prefix.
  const digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('00')) {
    return digits.slice(2) || null;
  }
  return null;
}

/** Current short UTC offset (e.g. "UTC+2") for an IANA time zone. */
function currentUtcOffset(timeZone: string): string | undefined {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const name = parts.find(p => p.type === 'timeZoneName')?.value;
    if (!name) return undefined;
    // Intl returns e.g. "GMT+2"; normalise to "UTC+2" (and "GMT" → "UTC+0").
    return name.replace(/^GMT/, 'UTC').replace(/^UTC$/, 'UTC+0');
  } catch {
    return undefined;
  }
}

/**
 * Derive a best-effort country + time zone from a phone number's international
 * dialing code. Returns `null` when the number is not in international format or
 * the dialing code is not recognised.
 */
export function deriveGeoFromPhone(phone: string | undefined | null): PhoneGeo | null {
  if (!phone) return null;
  const digits = toInternationalDigits(phone);
  if (!digits) return null;

  // Longest-prefix match: try 3-digit codes before 2 before 1.
  for (let len = MAX_CODE_LEN; len >= 1; len--) {
    const code = digits.slice(0, len);
    const entry = DIAL_CODES[code];
    if (entry) {
      let countryName = entry.iso;
      try {
        const display = new Intl.DisplayNames(['en'], { type: 'region' }).of(entry.iso);
        if (display) countryName = display;
      } catch {
        // Fall back to the ISO code if Intl.DisplayNames is unavailable.
      }
      return {
        countryName,
        timeZone: entry.timeZone,
        utcOffset: currentUtcOffset(entry.timeZone),
      };
    }
  }
  return null;
}

/**
 * Compact one-line label for a phone number's derived geo, e.g.
 * "France · Europe/Paris · UTC+2". Returns `null` when geo can't be derived.
 */
export function formatPhoneGeo(phone: string | undefined | null): string | null {
  const geo = deriveGeoFromPhone(phone);
  if (!geo) return null;
  return [geo.countryName, geo.timeZone, geo.utcOffset].filter(Boolean).join(' · ');
}
