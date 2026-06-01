import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ThemesAdminClient from '../app/admin/themes/ThemesAdminClient'
import {
  getAllThemeMetadata,
  upsertThemeMetadata,
  initializeThemeDefaults,
} from '../lib/themes'

// ── Module mocks ─────────────────────────────────────────────────────────────

jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }))

jest.mock('../lib/themes', () => ({
  getAllThemeMetadata: jest.fn(),
  upsertThemeMetadata: jest.fn().mockResolvedValue(undefined),
  initializeThemeDefaults: jest.fn().mockResolvedValue(undefined),
  THEME_CATEGORIES: [
    'Active & Sports',
    'Wellness & Relaxation',
    'Culture & History',
    'Food',
    'Social & Family',
    'Celebrations & Milestones',
    'Nature & Sea',
    'Lifestyle & Connoisseur',
  ],
}))

// Use a small subset of adventures to keep tests fast
jest.mock('../app/adventures-data', () => {
  const adventures = [
    { id: '1', name: 'Wind Sports Adventure',    description: 'Active water sports', image: '/test.jpg', experience: 'Sports', itinerary: [], features: ['Windsurfing'] },
    { id: '2', name: 'Family Sailing School',     description: 'Learn to sail',       image: '/test.jpg', experience: 'Family', itinerary: [], features: [] },
    { id: '3', name: 'Yoga & Wellness Retreat',   description: 'Yoga at sea',         image: '/test.jpg', experience: 'Wellness', itinerary: [], features: ['Yoga'] },
  ]
  return { __esModule: true, default: adventures }
})

// ── Mock metadata fixtures ────────────────────────────────────────────────────

const MOCK_META = [
  { id: '1', category: 'Active & Sports',       order: 0, visible: true,  featured: false, updatedAt: null },
  { id: '2', category: 'Active & Sports',       order: 1, visible: false, featured: false, updatedAt: null },
  { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true,  featured: true,  updatedAt: null },
]

beforeEach(() => {
  jest.clearAllMocks()
  ;(getAllThemeMetadata as jest.Mock).mockResolvedValue(MOCK_META)
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('ThemesAdminClient — loading state', () => {
  test('shows "Loading themes…" while data is being fetched', () => {
    // Hold the promise open so loading state persists
    ;(getAllThemeMetadata as jest.Mock).mockReturnValue(new Promise(() => {}))
    render(<ThemesAdminClient />)
    expect(screen.getByText('Loading themes…')).toBeInTheDocument()
  })

  test('stops showing loading text after data arrives', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.queryByText('Loading themes…')).not.toBeInTheDocument())
  })
})

// ── Uninitialized state (empty Firestore) ─────────────────────────────────────

describe('ThemesAdminClient — uninitialized state', () => {
  beforeEach(() => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([])
  })

  test('shows "Initialize Defaults" button when no metadata exists', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Initialize Defaults/ })).toBeInTheDocument()
    )
  })

  test('calls initializeThemeDefaults when button is clicked', async () => {
    // Re-load after init returns populated data
    ;(getAllThemeMetadata as jest.Mock)
      .mockResolvedValueOnce([])             // initial load
      .mockResolvedValue(MOCK_META)          // after init

    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(<ThemesAdminClient />)
    const btn = await screen.findByRole('button', { name: /Initialize Defaults/ })
    fireEvent.click(btn)
    await waitFor(() => expect(initializeThemeDefaults).toHaveBeenCalledTimes(1))
  })

  test('does not call initializeThemeDefaults when confirm is cancelled', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([])
    jest.spyOn(window, 'confirm').mockReturnValue(false)

    render(<ThemesAdminClient />)
    const btn = await screen.findByRole('button', { name: /Initialize Defaults/ })
    fireEvent.click(btn)
    expect(initializeThemeDefaults).not.toHaveBeenCalled()
  })
})

// ── Initialized state (has Firestore data) ────────────────────────────────────

describe('ThemesAdminClient — initialized state', () => {
  test('renders the page heading', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Themes Manager' })).toBeInTheDocument()
    )
  })

  test('does not show "Initialize Defaults" button when metadata exists', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.queryByText('Loading themes…')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /Initialize Defaults/ })).not.toBeInTheDocument()
  })

  test('renders all loaded adventure names', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())
    expect(screen.getByText('Family Sailing School')).toBeInTheDocument()
    expect(screen.getByText('Yoga & Wellness Retreat')).toBeInTheDocument()
  })

  test('shows correct total count in stats bar', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => {
      const total = screen.getByText('total themes')
      expect(total.previousSibling?.textContent).toBe('3')
    })
  })

  test('shows correct visible count in stats bar', async () => {
    const { container } = render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.queryByText('Loading themes…')).not.toBeInTheDocument())
    const badge = container.querySelector('[class*="bg-green-500"]')
    expect(badge?.textContent?.replace(/\s+/g, ' ').trim()).toBe('2 visible')
  })

  test('shows correct hidden count in stats bar', async () => {
    const { container } = render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.queryByText('Loading themes…')).not.toBeInTheDocument())
    // Find the "hidden" badge by matching text content
    const allDivs = container.querySelectorAll('div')
    const hiddenBadge = Array.from(allDivs).find(el =>
      el.textContent?.replace(/\s+/g, ' ').trim() === '1 hidden'
    )
    expect(hiddenBadge).toBeTruthy()
  })

  test('shows correct featured count in stats bar', async () => {
    const { container } = render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.queryByText('Loading themes…')).not.toBeInTheDocument())
    const badge = container.querySelector('[class*="bg-yellow-500"]')
    expect(badge?.textContent?.replace(/\s+/g, ' ').trim()).toBe('1 featured')
  })
})

// ── Category filter tabs ──────────────────────────────────────────────────────

describe('ThemesAdminClient — category filter tabs', () => {
  test('renders an "All" tab', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByRole('button', { name: /All/ })).toBeInTheDocument())
  })

  test('renders a tab for each category in THEME_CATEGORIES', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Active & Sports/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Wellness & Relaxation/ })).toBeInTheDocument()
    })
  })

  test('clicking a category tab filters the visible rows', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Wellness & Relaxation/ }))

    expect(screen.getByText('Yoga & Wellness Retreat')).toBeInTheDocument()
    expect(screen.queryByText('Wind Sports Adventure')).not.toBeInTheDocument()
    expect(screen.queryByText('Family Sailing School')).not.toBeInTheDocument()
  })

  test('clicking All tab restores all rows', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Wellness & Relaxation/ }))
    fireEvent.click(screen.getByRole('button', { name: /^All/ }))

    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
    expect(screen.getByText('Yoga & Wellness Retreat')).toBeInTheDocument()
  })
})

// ── Visibility toggle ─────────────────────────────────────────────────────────

describe('ThemesAdminClient — visibility toggle', () => {
  test('calls upsertThemeMetadata with visible:false when hiding a visible theme', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())

    const hideButtons = screen.getAllByTitle('Hide from public page')
    fireEvent.click(hideButtons[0])

    await waitFor(() =>
      expect(upsertThemeMetadata).toHaveBeenCalledWith('1', { visible: false })
    )
  })

  test('calls upsertThemeMetadata with visible:true when showing a hidden theme', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Family Sailing School')).toBeInTheDocument())

    const showButtons = screen.getAllByTitle('Show on public page')
    fireEvent.click(showButtons[0])

    await waitFor(() =>
      expect(upsertThemeMetadata).toHaveBeenCalledWith('2', { visible: true })
    )
  })
})

// ── Featured toggle ───────────────────────────────────────────────────────────

describe('ThemesAdminClient — featured toggle', () => {
  test('calls upsertThemeMetadata with featured:true when marking as featured', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())

    // id '1' is not featured — click its star button
    const markFeaturedButtons = screen.getAllByTitle('Mark as featured')
    fireEvent.click(markFeaturedButtons[0])

    await waitFor(() =>
      expect(upsertThemeMetadata).toHaveBeenCalledWith('1', { featured: true })
    )
  })

  test('calls upsertThemeMetadata with featured:false when removing featured', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Yoga & Wellness Retreat')).toBeInTheDocument())

    // id '3' is currently featured — click its star button to remove
    const removeFeaturedButton = screen.getByTitle('Remove featured')
    fireEvent.click(removeFeaturedButton)

    await waitFor(() =>
      expect(upsertThemeMetadata).toHaveBeenCalledWith('3', { featured: false })
    )
  })
})

// ── Category change ───────────────────────────────────────────────────────────

describe('ThemesAdminClient — category selector', () => {
  test('renders a category selector for each adventure', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox')
      expect(selects.length).toBe(3)
    })
  })

  test('calls upsertThemeMetadata with new category when changed', async () => {
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBe(3))

    const [firstSelect] = screen.getAllByRole('combobox')
    fireEvent.change(firstSelect, { target: { value: 'Food' } })

    await waitFor(() =>
      expect(upsertThemeMetadata).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ category: 'Food' })
      )
    )
  })
})

// ── Error handling ────────────────────────────────────────────────────────────

describe('ThemesAdminClient — error handling', () => {
  test('shows error message when getAllThemeMetadata rejects', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockRejectedValue(new Error('Firestore down'))
    render(<ThemesAdminClient />)
    await waitFor(() =>
      expect(screen.getByText(/Failed to load theme metadata/)).toBeInTheDocument()
    )
  })

  test('shows a Retry button alongside the error message', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockRejectedValue(new Error('Firestore down'))
    render(<ThemesAdminClient />)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    )
  })

  test('Retry button clears error and re-fetches', async () => {
    ;(getAllThemeMetadata as jest.Mock)
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValue(MOCK_META)

    render(<ThemesAdminClient />)
    const retryBtn = await screen.findByRole('button', { name: 'Retry' })
    fireEvent.click(retryBtn)

    await waitFor(() => expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument())
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
  })

  test('handles Firestore docs with missing category field without throwing', async () => {
    ;(getAllThemeMetadata as jest.Mock).mockResolvedValue([
      { id: '1', category: undefined, order: 0, visible: true, featured: false, updatedAt: null },
      { id: '3', category: 'Wellness & Relaxation', order: 0, visible: true, featured: false, updatedAt: null },
    ])
    render(<ThemesAdminClient />)
    // Should NOT show error — null-safe sort handles missing category
    await waitFor(() => expect(screen.queryByText('Loading themes…')).not.toBeInTheDocument())
    expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument()
    expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument()
  })

  test('shows error message when upsertThemeMetadata rejects', async () => {
    ;(upsertThemeMetadata as jest.Mock).mockRejectedValueOnce(new Error('write failed'))
    render(<ThemesAdminClient />)
    await waitFor(() => expect(screen.getByText('Wind Sports Adventure')).toBeInTheDocument())

    const hideButtons = screen.getAllByTitle('Hide from public page')
    fireEvent.click(hideButtons[0])

    // Error is set before the re-load; component re-loads and recovers
    await waitFor(() =>
      expect(screen.getByText('Save failed. Please try again.')).toBeInTheDocument()
    )
  })
})
