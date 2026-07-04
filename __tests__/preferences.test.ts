import {
  getPreferenceConfig,
  updatePreferenceConfig,
  defaultSections,
  visibleSections,
  createSectionId,
  createFieldId,
  BUILT_IN_SECTIONS,
  type PreferenceSection,
} from '../lib/preferences';

// ── Firebase mocks ───────────────────────────────────────────────────────────

const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn().mockResolvedValue(undefined);
const mockDoc = jest.fn().mockReturnValue('mock-doc-ref');
const mockServerTimestamp = jest.fn().mockReturnValue('SERVER_TIMESTAMP');

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

jest.mock('../lib/firebase', () => ({ db: { _tag: 'mock-db' } }));

function snapshot(exists: boolean, data?: Record<string, unknown>) {
  return { exists: () => exists, data: () => data };
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ── defaultSections / helpers ────────────────────────────────────────────────

describe('defaultSections', () => {
  test('produces one section per built-in, all visible', () => {
    const s = defaultSections();
    expect(s).toHaveLength(BUILT_IN_SECTIONS.length);
    expect(s.every(x => x.visible)).toBe(true);
    expect(s.every(x => x.builtIn)).toBe(true);
  });

  test('assigns sequential order values from 0', () => {
    expect(defaultSections().map(s => s.order)).toEqual(
      BUILT_IN_SECTIONS.map((_, i) => i)
    );
  });
});

describe('visibleSections', () => {
  test('filters out hidden sections and sorts by order', () => {
    const sections: PreferenceSection[] = [
      { id: 'b', title: 'B', builtIn: false, visible: true, order: 2, fields: [] },
      { id: 'a', title: 'A', builtIn: false, visible: true, order: 0, fields: [] },
      { id: 'c', title: 'C', builtIn: false, visible: false, order: 1, fields: [] },
    ];
    expect(visibleSections(sections).map(s => s.id)).toEqual(['a', 'b']);
  });
});

describe('id generators', () => {
  test('createSectionId and createFieldId return unique-ish prefixed strings', () => {
    expect(createSectionId()).toMatch(/^custom-/);
    expect(createFieldId()).toMatch(/^field-/);
    expect(createSectionId()).not.toBe(createSectionId());
  });
});

// ── getPreferenceConfig ───────────────────────────────────────────────────────

describe('getPreferenceConfig', () => {
  test('seeds default sections when the config doc does not exist', async () => {
    mockGetDoc.mockResolvedValue(snapshot(false));
    const cfg = await getPreferenceConfig();
    expect(cfg.sections).toHaveLength(BUILT_IN_SECTIONS.length);
    expect(cfg.sections.every(s => s.visible)).toBe(true);
    // writes the seeded defaults back to Firestore
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
  });

  test('returns stored sections when the config doc exists', async () => {
    const stored: PreferenceSection[] = defaultSections().map((s, i) =>
      i === 0 ? { ...s, visible: false } : s
    );
    mockGetDoc.mockResolvedValue(snapshot(true, { sections: stored, updatedAt: null }));
    const cfg = await getPreferenceConfig();
    expect(cfg.sections.find(s => s.id === 'crew')?.visible).toBe(false);
    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  test('appends built-in sections added after the config was saved', async () => {
    // Stored config is missing the last built-in section
    const partial = defaultSections().slice(0, BUILT_IN_SECTIONS.length - 1);
    mockGetDoc.mockResolvedValue(snapshot(true, { sections: partial, updatedAt: null }));
    const cfg = await getPreferenceConfig();
    const lastId = BUILT_IN_SECTIONS[BUILT_IN_SECTIONS.length - 1].id;
    expect(cfg.sections.some(s => s.id === lastId)).toBe(true);
  });

  test('preserves a stored custom section', async () => {
    const stored: PreferenceSection[] = [
      ...defaultSections(),
      { id: 'custom-1', title: 'Music', builtIn: false, visible: true, order: 99, fields: [
        { id: 'field-1', label: 'Favourite genre', type: 'text', required: false },
      ] },
    ];
    mockGetDoc.mockResolvedValue(snapshot(true, { sections: stored, updatedAt: null }));
    const cfg = await getPreferenceConfig();
    const custom = cfg.sections.find(s => s.id === 'custom-1');
    expect(custom).toBeDefined();
    expect(custom?.fields[0].label).toBe('Favourite genre');
  });
});

// ── updatePreferenceConfig ─────────────────────────────────────────────────────

describe('updatePreferenceConfig', () => {
  test('writes the sections with a server timestamp', async () => {
    const sections = defaultSections();
    await updatePreferenceConfig(sections);
    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [, payload] = mockSetDoc.mock.calls[0];
    expect(payload).toMatchObject({ updatedAt: 'SERVER_TIMESTAMP' });
    expect(payload.sections).toHaveLength(sections.length);
  });

  test('re-numbers order to match array position', async () => {
    const sections = defaultSections().reverse();
    await updatePreferenceConfig(sections);
    const [, payload] = mockSetDoc.mock.calls[0];
    expect(payload.sections.map((s: PreferenceSection) => s.order)).toEqual(
      sections.map((_, i) => i)
    );
  });

  test('strips undefined values so Firestore accepts the payload', async () => {
    const sections: PreferenceSection[] = [
      { id: 'custom-1', title: 'X', builtIn: false, visible: true, order: 0, fields: [
        { id: 'f1', label: 'Q', type: 'text', required: false, placeholder: undefined },
      ] },
    ];
    await updatePreferenceConfig(sections);
    const [, payload] = mockSetDoc.mock.calls[0];
    expect(payload.sections[0].fields[0]).not.toHaveProperty('placeholder');
  });
});
