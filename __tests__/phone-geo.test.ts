import { deriveGeoFromPhone, formatPhoneGeo } from '../lib/phoneGeo';

describe('deriveGeoFromPhone', () => {
  it('resolves a French number to France / Europe/Paris', () => {
    const geo = deriveGeoFromPhone('+33 6 00 11 22 33');
    expect(geo).not.toBeNull();
    expect(geo!.countryName).toBe('France');
    expect(geo!.timeZone).toBe('Europe/Paris');
    expect(geo!.utcOffset).toMatch(/^UTC[+-]\d/);
  });

  it('resolves a UK number to United Kingdom / Europe/London', () => {
    const geo = deriveGeoFromPhone('+44 20 7946 0958');
    expect(geo!.countryName).toBe('United Kingdom');
    expect(geo!.timeZone).toBe('Europe/London');
  });

  it('resolves a Greek number to Greece / Europe/Athens', () => {
    const geo = deriveGeoFromPhone('+30 210 000 0000');
    expect(geo!.countryName).toBe('Greece');
    expect(geo!.timeZone).toBe('Europe/Athens');
  });

  it('resolves a +1 number to the United States (representative)', () => {
    const geo = deriveGeoFromPhone('+1 212 555 0100');
    expect(geo!.countryName).toBe('United States');
    expect(geo!.timeZone).toBe('America/New_York');
  });

  it('prefers the longest matching dialing-code prefix', () => {
    // +351 (Portugal) must not be mis-read as +35 or +3.
    const geo = deriveGeoFromPhone('+351 21 000 0000');
    expect(geo!.countryName).toBe('Portugal');
    expect(geo!.timeZone).toBe('Europe/Lisbon');
  });

  it('accepts the 00 international access prefix', () => {
    const geo = deriveGeoFromPhone('0033 6 00 11 22 33');
    expect(geo!.countryName).toBe('France');
  });

  it('returns null for a number without an international dialing code', () => {
    expect(deriveGeoFromPhone('06 00 11 22 33')).toBeNull();
    expect(deriveGeoFromPhone('212-555-0100')).toBeNull();
  });

  it('returns null for an unrecognised dialing code', () => {
    expect(deriveGeoFromPhone('+999 000 000')).toBeNull();
  });

  it('returns null for empty / missing input', () => {
    expect(deriveGeoFromPhone('')).toBeNull();
    expect(deriveGeoFromPhone(undefined)).toBeNull();
    expect(deriveGeoFromPhone(null)).toBeNull();
  });
});

describe('formatPhoneGeo', () => {
  it('formats a compact one-line label', () => {
    const label = formatPhoneGeo('+33 6 00 11 22 33');
    expect(label).toMatch(/^France · Europe\/Paris · UTC[+-]\d/);
  });

  it('returns null when geo cannot be derived', () => {
    expect(formatPhoneGeo('06 00 11 22 33')).toBeNull();
  });
});
