import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import BookingPageContent from '../app/booking/page-content'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/booking'),
}))

jest.mock('../lib/emailjs', () => ({
  sendBookingEmail: jest.fn().mockResolvedValue({ status: 'success' }),
  sendBookingEmails: jest.fn().mockResolvedValue({
    business: { status: 'success' },
    client: { status: 'success' },
  }),
}))

jest.mock('../lib/availability', () => ({
  getAllCharters: jest.fn().mockResolvedValue([]),
  createCharter: jest.fn().mockResolvedValue({ id: 'mock-charter' }),
}))

// Firebase is pulled in transitively; stub out the SDK module
jest.mock('../lib/firebase', () => ({
  db: {},
  storage: {},
}))

const mockPush = jest.fn()
const mockGet = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
  ;(useSearchParams as jest.Mock).mockReturnValue({ get: mockGet })
})

describe('Booking Form — Page Content', () => {
  const boatParams: Record<string, string> = {
    boat: 'BlueOne',
    brand: 'Fountaine Pajot',
    length: '51 ft',
    description: 'A new-generation catamaran',
    image: '/images/boats/blueone.jpg',
  }

  beforeEach(() => {
    mockGet.mockImplementation((key: string) => boatParams[key] ?? null)
  })

  describe('Form Rendering', () => {
    test('renders the page main heading', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Contact us to prepare your next dream experience/ })
        ).toBeInTheDocument()
      })
    })

    test('renders Contact Information section heading', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { name: 'Contact Information' })
        expect(headings.length).toBeGreaterThan(0)
      })
    })

    test('renders Full Name label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Full Name *')).toBeInTheDocument()
      })
    })

    test('renders Email Address label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Email Address *')).toBeInTheDocument()
      })
    })

    test('renders Phone Number label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Phone Number *')).toBeInTheDocument()
      })
    })

    test('renders Charter Details section heading', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { name: 'Charter Details' })
        expect(headings.length).toBeGreaterThan(0)
      })
    })

    test('renders Charter Dates label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Charter Dates *')).toBeInTheDocument()
      })
    })

    test('renders Place of Delivery label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Place of Delivery *')).toBeInTheDocument()
      })
    })

    test('renders Holiday Preferences section', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Holiday Preferences')).toBeInTheDocument()
      })
    })

    test('renders Describe Your Ideal Holiday textarea label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Describe Your Ideal Holiday')).toBeInTheDocument()
      })
    })

    test('renders Preferred Adventure Theme label', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Preferred Adventure Theme')).toBeInTheDocument()
      })
    })

    test('renders Send Information Request submit button', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Send Information Request' })).toBeInTheDocument()
      })
    })

    test('renders boat name from URL params', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getAllByText('BlueOne').length).toBeGreaterThan(0)
      })
    })

    test('renders boat brand and length together', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Fountaine Pajot - 51 ft')).toBeInTheDocument()
      })
    })
  })

  describe('Information Request Summary', () => {
    test('renders summary section heading', async () => {
      render(<BookingPageContent />)
      await waitFor(() => {
        expect(screen.getByText('Information Request Summary')).toBeInTheDocument()
      })
    })
  })
})
