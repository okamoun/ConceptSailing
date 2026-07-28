import { buildDetailsRecap, contactRecapFields, SIGNATURE } from '../lib/confirmationRecap';
import { CONTACT } from '../app/config/contact';

describe('contactRecapFields', () => {
  it('enriches the phone row with derived country and time zone', () => {
    const fields = contactRecapFields('Marie Martin', 'marie@example.com', '+33 6 00 11 22 33');
    const phone = fields.find(f => f.label === 'Phone')!;
    expect(phone.value).toContain('+33 6 00 11 22 33');
    expect(phone.value).toMatch(/\(France · Europe\/Paris · UTC[+-]\d\)/);
  });

  it('leaves the phone number bare when geo cannot be derived', () => {
    const fields = contactRecapFields('Marie', 'm@example.com', '06 00 11 22 33');
    const phone = fields.find(f => f.label === 'Phone')!;
    expect(phone.value).toBe('06 00 11 22 33');
  });

  it('emits an empty phone value when no phone is provided', () => {
    const fields = contactRecapFields('Marie', 'm@example.com');
    expect(fields.find(f => f.label === 'Phone')!.value).toBe('');
  });
});

describe('buildDetailsRecap', () => {
  it('renders a labeled block and drops empty rows', () => {
    const recap = buildDetailsRecap([
      { label: 'Name', value: 'Marie Martin' },
      { label: 'Email', value: 'marie@example.com' },
      { label: 'Phone', value: '' },
      { label: 'Boat', value: 'BlueOne' },
    ]);
    expect(recap).toContain('—— Your request ——');
    expect(recap).toContain('Name: Marie Martin');
    expect(recap).toContain('Boat: BlueOne');
    expect(recap).not.toContain('Phone:');
  });

  it('returns an empty string when every row is blank', () => {
    expect(buildDetailsRecap([{ label: 'Notes', value: '   ' }])).toBe('');
    expect(buildDetailsRecap([])).toBe('');
  });
});

describe('SIGNATURE', () => {
  it('includes the BlueOne team name and central contact details', () => {
    expect(SIGNATURE).toContain('The BlueOne Team');
    expect(SIGNATURE).toContain(CONTACT.phone.formatted);
    expect(SIGNATURE).toContain(CONTACT.email);
  });
});
