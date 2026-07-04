import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';

// ── Mock only the Firestore-touching functions; keep the pure helpers real ──
const mockGetPreferenceConfig = jest.fn();
const mockUpdatePreferenceConfig = jest.fn().mockResolvedValue(undefined);

jest.mock('../lib/preferences', () => {
  const actual = jest.requireActual('../lib/preferences');
  return {
    ...actual,
    getPreferenceConfig: (...a: unknown[]) => mockGetPreferenceConfig(...a),
    updatePreferenceConfig: (...a: unknown[]) => mockUpdatePreferenceConfig(...a),
  };
});

import PreferencesConfigClient from '../app/admin/preferences/PreferencesConfigClient';
import { defaultSections, type PreferenceSection } from '../lib/preferences';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPreferenceConfig.mockResolvedValue({ sections: defaultSections(), updatedAt: null });
  mockUpdatePreferenceConfig.mockResolvedValue(undefined);
});

async function renderAndWait() {
  render(<PreferencesConfigClient />);
  await waitFor(() => expect(screen.getByText('Client Preferences')).toBeInTheDocument());
}

describe('PreferencesConfigClient — rendering', () => {
  test('renders all built-in sections', async () => {
    await renderAndWait();
    expect(screen.getByText('Crew Details')).toBeInTheDocument();
    expect(screen.getByText('Food Preferences')).toBeInTheDocument();
    expect(screen.getByText('Special Requests')).toBeInTheDocument();
  });

  test('shows a Built-in badge on built-in sections', async () => {
    await renderAndWait();
    expect(screen.getAllByText('Built-in').length).toBe(defaultSections().length);
  });

  test('has a Preview form link to the preview page', async () => {
    await renderAndWait();
    const link = screen.getByRole('link', { name: /preview form/i });
    expect(link).toHaveAttribute('href', '/admin/preferences/preview');
  });
});

describe('PreferencesConfigClient — section visibility', () => {
  test('toggling a section to hidden and saving persists visible: false', async () => {
    await renderAndWait();
    // The Crew section card contains a Visible toggle button
    const crewHeading = screen.getByText('Crew Details');
    const card = crewHeading.closest('div.rounded-2xl') as HTMLElement;
    const toggle = within(card).getByRole('button', { name: /visible/i });
    fireEvent.click(toggle);
    // Now labelled Hidden
    await waitFor(() => expect(within(card).getByRole('button', { name: /hidden/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));
    await waitFor(() => expect(mockUpdatePreferenceConfig).toHaveBeenCalled());
    const saved: PreferenceSection[] = mockUpdatePreferenceConfig.mock.calls[0][0];
    expect(saved.find(s => s.id === 'crew')?.visible).toBe(false);
  });
});

describe('PreferencesConfigClient — custom sections', () => {
  test('adding a section creates a new custom section with a starter field', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await waitFor(() => expect(screen.getByText('Custom')).toBeInTheDocument());
    expect(screen.getByPlaceholderText('Section title')).toBeInTheDocument();
  });

  test('save is blocked when a custom section has no title', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await waitFor(() => expect(screen.getByText('Custom')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));
    await waitFor(() => expect(screen.getByText(/needs a title/i)).toBeInTheDocument());
    expect(mockUpdatePreferenceConfig).not.toHaveBeenCalled();
  });

  test('a completed custom section with a field saves', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Section title')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('Section title'), { target: { value: 'Music' } });
    fireEvent.change(screen.getByPlaceholderText(/field label/i), { target: { value: 'Favourite genre' } });

    fireEvent.click(screen.getByRole('button', { name: /save configuration/i }));
    await waitFor(() => expect(mockUpdatePreferenceConfig).toHaveBeenCalled());
    const saved: PreferenceSection[] = mockUpdatePreferenceConfig.mock.calls[0][0];
    const music = saved.find(s => s.title === 'Music');
    expect(music).toBeDefined();
    expect(music?.builtIn).toBe(false);
    expect(music?.fields[0].label).toBe('Favourite genre');
  });

  test('adding a field to a custom section increases its field count', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /add section/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Section title')).toBeInTheDocument());
    // One starter field present
    expect(screen.getAllByPlaceholderText(/field label/i)).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: /add field/i }));
    await waitFor(() => expect(screen.getAllByPlaceholderText(/field label/i)).toHaveLength(2));
  });
});
