import React from 'react'
import { render, waitFor } from '@testing-library/react'

// ── Mock heavy / side-effecting dependencies so we can render BlueOneClient ──
jest.mock('../app/contexts/BlueOneContext', () => ({
  useBlueOneMode: () => ({ isBlueOneMode: true, setIsBlueOneMode: jest.fn(), resetTheme: jest.fn() }),
}))
jest.mock('../app/components/BlueOneGallerySlideshow', () => ({ __esModule: true, default: () => null }))
jest.mock('../app/components/MiniCalendar', () => ({ __esModule: true, default: () => null }))
jest.mock('../app/components/VideoEmbed', () => ({ __esModule: true, default: () => null }))
jest.mock('../lib/availability', () => ({ getAllCharters: jest.fn().mockResolvedValue([]) }))
jest.mock('../lib/photos', () => ({ getAllPhotoMeta: jest.fn() }))

import BlueOneClient from '../app/blueone/BlueOneClient'
import { getAllPhotoMeta } from '../lib/photos'

// Real manifest src used to prove photoshoot photos are gated by the Key flag.
const PHOTOSHOOT_EXTERIOR = '/images/boats/blueone/photos_shoot/DSC_0357.jpg'
// A representative pre-existing static gallery image (former fallback).
const STATIC_EXTERIOR_FALLBACK = '/images/boat/IMG_0025_NEW.JPG'

const KEY_EXTERIOR = '/test/key-exterior.jpg'
const NONKEY_EXTERIOR = '/test/nonkey-exterior.jpg'

function img(container: HTMLElement, src: string) {
  return container.querySelector(`img[src="${src}"]`)
}

beforeEach(() => jest.clearAllMocks())

describe('BlueOne yacht page — ONLY Key photos appear (strict gating)', () => {
  test('a Key photo renders; a non-Key photo in the same category does not', async () => {
    ;(getAllPhotoMeta as jest.Mock).mockResolvedValue([
      { id: 'e1', src: KEY_EXTERIOR, category: 'exterior', keyPhoto: true },
      { id: 'e2', src: NONKEY_EXTERIOR, category: 'exterior', keyPhoto: false },
    ])
    const { container } = render(<BlueOneClient />)
    await waitFor(() => expect(img(container, KEY_EXTERIOR)).toBeInTheDocument())
    expect(img(container, NONKEY_EXTERIOR)).not.toBeInTheDocument()
  })

  test('with NO Key photos, no gallery photos appear at all (fallbacks removed)', async () => {
    ;(getAllPhotoMeta as jest.Mock).mockResolvedValue([])
    const { container } = render(<BlueOneClient />)
    // let the async metadata load settle
    await waitFor(() => expect(getAllPhotoMeta as jest.Mock).toHaveBeenCalled())
    expect(img(container, STATIC_EXTERIOR_FALLBACK)).not.toBeInTheDocument()
    expect(img(container, PHOTOSHOOT_EXTERIOR)).not.toBeInTheDocument()
  })

  test('a photoshoot photo is absent from the showcase when NOT flagged Key', async () => {
    ;(getAllPhotoMeta as jest.Mock).mockResolvedValue([])
    const { container } = render(<BlueOneClient />)
    await waitFor(() => expect(getAllPhotoMeta as jest.Mock).toHaveBeenCalled())
    expect(img(container, PHOTOSHOOT_EXTERIOR)).not.toBeInTheDocument()
  })

  test('a photoshoot photo appears once flagged Key in admin', async () => {
    ;(getAllPhotoMeta as jest.Mock).mockResolvedValue([
      { id: 'ps1', src: PHOTOSHOOT_EXTERIOR, category: 'exterior', keyPhoto: true },
    ])
    const { container } = render(<BlueOneClient />)
    await waitFor(() => expect(img(container, PHOTOSHOOT_EXTERIOR)).toBeInTheDocument())
  })
})
