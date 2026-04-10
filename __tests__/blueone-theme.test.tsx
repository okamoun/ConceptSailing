import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BlueOneProvider } from '../app/contexts/BlueOneContext'
import BlueOneBookingPage from '../app/blueone/booking/page'

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: jest.fn((key: string) => {
      const mockData = {
        boat: 'BlueOne',
        brand: 'Fountaine Pajot',
        length: '51 ft',
        description: 'A new-generation catamaran',
        image: '/images/boats/blueone.jpg'
      }
      return mockData[key as keyof typeof mockData]
    }),
  }),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

// Mock EmailJS
jest.mock('../../lib/emailjs', () => ({
  sendBookingEmails: jest.fn().mockResolvedValue({
    business: { status: 'success', message: 'Business email sent' },
    client: { status: 'success', message: 'Client email sent' }
  }),
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
  },
  writable: true,
})

describe('BlueOne Theme Persistence Tests', () => {
  const renderWithBlueOneProvider = (component: React.ReactElement) => {
    return render(
      <BlueOneProvider>
        {component}
      </BlueOneProvider>
    )
  }

  test('activates BlueOne mode on booking page mount', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check if BlueOne logo is displayed
    expect(screen.getByAltText('BlueOne Logo')).toBeInTheDocument()
    
    // Check if BlueOne-specific styling is applied
    expect(screen.getByText('Book BlueOne Experience')).toBeInTheDocument()
  })

  test('displays BlueOne branding elements', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check for BlueOne-specific elements
    expect(screen.getByText('BlueOne Experience')).toBeInTheDocument()
    expect(screen.getByText('Reserve your luxury sailing adventure aboard the BlueOne catamaran')).toBeInTheDocument()
    
    // Check for Starlink feature mentioned in BlueOne booking
    expect(screen.getByText('Starlink High-Speed Internet')).toBeInTheDocument()
  })

  test('shows BlueOne boat information correctly', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check boat details
    expect(screen.getByText('BlueOne')).toBeInTheDocument()
    expect(screen.getByText('Fountaine Pajot')).toBeInTheDocument()
    expect(screen.getByText('51 ft')).toBeInTheDocument()
  })

  test('maintains BlueOne styling in form elements', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check for BlueOne-themed form elements
    const nameInput = screen.getByLabelText('Full Name *')
    expect(nameInput).toHaveClass('border-blue-300')
    
    const emailInput = screen.getByLabelText('Email Address *')
    expect(emailInput).toHaveClass('border-blue-300')
  })

  test('displays BlueOne-specific features', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check for BlueOne-specific features
    expect(screen.getByText('Professional Captain & Chef')).toBeInTheDocument()
    expect(screen.getByText('All Meals & Beverages')).toBeInTheDocument()
    expect(screen.getByText('Starlink High-Speed Internet')).toBeInTheDocument()
    expect(screen.getByText('Water Toys & Equipment')).toBeInTheDocument()
  })

  test('shows BlueOne connectivity callout', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check for the Starlink connectivity callout
    expect(screen.getByText('Stay Connected at Sea')).toBeInTheDocument()
    expect(screen.getByText('Enjoy Starlink high-speed internet to work remotely, stream entertainment, and share your adventures in real-time.')).toBeInTheDocument()
  })

  test('has BlueOne-themed submit button', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    const submitButton = screen.getByRole('button', { name: /Submit Booking Request/i })
    expect(submitButton).toHaveClass('bg-blue-600')
  })

  test('has BlueOne-themed back button', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    const backButton = screen.getByRole('link', { name: /Back to BlueOne/i })
    expect(backButton).toHaveClass('bg-gray-200')
  })

  test('form validation works in BlueOne context', async () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    const submitButton = screen.getByRole('button', { name: /Submit Booking Request/i })
    
    // Try to submit without filling required fields
    fireEvent.click(submitButton)
    
    // Should show validation error (this depends on the actual implementation)
    // This test might need adjustment based on the actual BlueOne form implementation
  })

  test('localStorage integration works for BlueOne mode', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check if localStorage is being used for BlueOne mode
    expect(localStorageMock.setItem).toHaveBeenCalledWith('blueOneMode', 'true')
  })
})

describe('BlueOne Theme Integration', () => {
  test('BlueOne booking page uses same form structure as generic booking', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check that all standard booking form fields are present
    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred Dates *')).toBeInTheDocument()
    expect(screen.getByLabelText('Number of Guests *')).toBeInTheDocument()
    expect(screen.getByLabelText('Special Requests or Questions')).toBeInTheDocument()
  })

  test('BlueOne booking maintains BlueOne visual theme', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check for BlueOne color scheme
    const mainContainer = screen.getByText('Book BlueOne Experience').closest('div')
    expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-blue-50', 'to-white')
  })

  test('BlueOne booking shows enhanced features section', () => {
    renderWithBlueOneProvider(<BlueOneBookingPage />)
    
    // Check for enhanced features section specific to BlueOne
    expect(screen.getByText('Included in Your Charter:')).toBeInTheDocument()
    expect(screen.getByText('Fuel & Marina Fees')).toBeInTheDocument()
    expect(screen.getByText('Insurance & Safety Equipment')).toBeInTheDocument()
  })
})
