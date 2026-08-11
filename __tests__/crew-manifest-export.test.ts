// Mock firebase + availability so lib/clientSpace (imported transitively) loads
// without touching the real SDK.
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));
jest.mock('../lib/availability', () => ({ updateCharter: jest.fn() }));

jest.mock('../app/marinas-data', () => ({
  getMarinaById: (id: string) =>
    id === 'alimos'
      ? { id, name: 'Alimos Marina' }
      : id === 'mykonos'
        ? { id, name: 'Mykonos Marina' }
        : id
          ? { id, name: id }
          : undefined,
}));

import {
  buildManifestSheets,
  crewManifestFilename,
  MANIFEST_COLUMNS,
} from '../lib/crewManifestExport';
import { buildXlsx } from '../lib/xlsx';
import type { Charter } from '../lib/availability';
import type { ClientPreparation } from '../lib/clientSpace';

const charter = {
  id: 'charter-1',
  name: 'Smith Family',
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  boat: 'Fountaine Pajot Aura 51',
  deliveryPoint: 'alimos',
  redeliveryPoint: 'alimos',
  status: 'confirmed',
} as unknown as Charter;

const prep = {
  token: 'tok',
  crew: [
    {
      firstName: 'Alice',
      lastName: 'Smith',
      gender: 'Female',
      dateOfBirth: '1990-05-14',
      nationality: 'British',
      passportNumber: '007123',
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      gender: 'Male',
      dateOfBirth: '1988-11-02',
      nationality: 'British',
      passportNumber: 'P200',
    },
  ],
  travel: {},
} as unknown as ClientPreparation;

describe('buildManifestSheets', () => {
  it('produces three sheets: persons, charter details, instructions', () => {
    const sheets = buildManifestSheets(charter, prep);
    expect(sheets.map(s => s.name)).toEqual([
      'Persons On Board',
      'Charter Details',
      'Instructions',
    ]);
  });

  it('writes the draft column header row and one row per guest', () => {
    const [persons] = buildManifestSheets(charter, prep);
    expect(persons.headerRow).toBe(true);
    expect(persons.rows[0]).toEqual([...MANIFEST_COLUMNS]);
    expect(persons.rows).toHaveLength(1 + 2); // header + 2 guests
  });

  it('maps guest fields and formats dates as DD/MM/YYYY', () => {
    const [persons] = buildManifestSheets(charter, prep);
    const alice = persons.rows[1];
    expect(alice[0]).toBe(1); // No.
    expect(alice[1]).toBe('Smith'); // last name
    expect(alice[2]).toBe('Alice'); // first name
    expect(alice[3]).toBe('Female');
    expect(alice[4]).toBe('14/05/1990'); // DOB reformatted
    expect(alice[5]).toBe('British');
    expect(alice[6]).toBe('007123'); // passport kept verbatim (leading zeros)
    expect(alice[7]).toBe('Passenger');
    expect(alice[8]).toBe('Alimos Marina'); // embarkation falls back to delivery
    expect(alice[9]).toBe('01/07/2026'); // embarkation date = charter start
    expect(alice[11]).toBe('08/07/2026'); // disembarkation date = charter end
  });

  it('resolves per-group embarkation port and dates when a guest joins later', () => {
    const withGroups = {
      ...prep,
      travel: {
        groups: [
          {
            id: 'g1',
            memberIndices: [0],
            arrivalDate: '2026-07-01',
            departureDate: '2026-07-08',
            embarkationPoint: 'alimos',
          },
          {
            id: 'g2',
            memberIndices: [1],
            arrivalDate: '2026-07-04',
            departureDate: '2026-07-08',
            embarkationPoint: 'mykonos',
          },
        ],
      },
    } as unknown as ClientPreparation;

    const [persons] = buildManifestSheets(charter, withGroups);
    const bob = persons.rows[2];
    expect(bob[8]).toBe('Mykonos Marina'); // group embarkation port
    expect(bob[9]).toBe('04/07/2026'); // group arrival date
  });

  it('reports the total persons on the charter details sheet', () => {
    const details = buildManifestSheets(charter, prep)[1];
    const totalRow = details.rows.find(r => r[0] === 'Total Persons On Board');
    expect(totalRow?.[1]).toBe(2);
  });
});

describe('crewManifestFilename', () => {
  it('builds a safe, dated filename from the charter name', () => {
    expect(crewManifestFilename(charter)).toBe(
      'crew-manifest-smith-family-2026-07-01.xlsx',
    );
  });

  it('falls back to the charter id when unnamed', () => {
    const anon = { ...charter, name: undefined } as unknown as Charter;
    expect(crewManifestFilename(anon)).toBe(
      'crew-manifest-charter-1-2026-07-01.xlsx',
    );
  });
});

describe('buildXlsx', () => {
  it('emits a valid ZIP (xlsx) container starting with the PK signature', () => {
    const bytes = buildXlsx(buildManifestSheets(charter, prep));
    expect(bytes.length).toBeGreaterThan(0);
    // Local file header signature: 'P' 'K' 0x03 0x04
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(bytes[2]).toBe(0x03);
    expect(bytes[3]).toBe(0x04);
    // End-of-central-directory signature present near the tail: 'P' 'K' 0x05 0x06
    let foundEocd = false;
    for (let i = bytes.length - 22; i >= 0 && i > bytes.length - 200; i--) {
      if (
        bytes[i] === 0x50 &&
        bytes[i + 1] === 0x4b &&
        bytes[i + 2] === 0x05 &&
        bytes[i + 3] === 0x06
      ) {
        foundEocd = true;
        break;
      }
    }
    expect(foundEocd).toBe(true);
  });
});
