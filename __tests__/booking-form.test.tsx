import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import BookingPageContent from '../app/booking/page-content'
import { sendBookingEmails } from '../lib/emailjs'

// Mock the modules
jest.mock('next/navigation')
jest.mock('../lib/emailjs')

const mockPush = jest.fn()
const mockGet = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
  })
  ;(useSearchParams as jest.Mock).mockReturnValue({
    get: mockGet,
  })
})

describe('Booking Form Tests', () => {
  const mockBoatData = {
    boat: 'BlueOne',
    brand: 'Fountaine Pajot',
    length: '51 ft',
    description: 'A new-generation catamaran',
    image: '/images/boats/blueone.jpg'
  }

  beforeEach(() => {
    mockGet.mockImplementation((key: string) => mockBoatData[key as keyof typeof mockBoatData])
  })

  describe('Form Rendering', () => {
    test('renders booking form with all required fields', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        expect(screen.getByText('Book Your Charter')).toBeInTheDocument()
        expect(screen.getByLabelText('Full Name *')).toBeInTheDocument()
        expect(screen.getByLabelText('Email Address *')).toBeInTheDocument()
        expect(screen.getByLabelText('Phone Number *')).toBeInTheDocument()
        expect(screen.getByLabelText('Charter Date *')).toBeInTheDocument()
        expect(screen.getByLabelText('Number of Passengers *')).toBeInTheDocument()
        expect(screen.getByLabelText('Embarkation Point *')).toBeInTheDocument()
      })
    })

    test('displays boat information correctly', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        expect(screen.getByText('BlueOne')).toBeInTheDocument()
        expect(screen.getByText('Fountaine Pajot - 51 ft')).toBeInTheDocument()
        expect(screen.getByText('A new-generation catamaran')).toBeInTheDocument()
      })
    })

    test('shows embarkation point options', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const embarkationSelect = screen.getByLabelText('Embarkation Point *')
        expect(embarkationSelect).toBeInTheDocument()
        
        fireEvent.change(embarkationSelect, { target: { value: '' } })
        
        expect(screen.getByText('Select embarkation point')).toBeInTheDocument()
        expect(screen.getByText('Nea Peramos Marina - Athens Coast')).toBeInTheDocument()
        expect(screen.getByText('Piraeus Marina - Athens')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    test('validates required fields', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Send Information Request/i })
        expect(submitButton).toBeInTheDocument()
        
        // Try to submit without filling any fields
        fireEvent.click(submitButton)
        
        // Should show validation error
        expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument()
      })
    })

    test('validates email format', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('Full Name *')
        const emailInput = screen.getByLabelText('Email Address *')
        const phoneInput = screen.getByLabelText('Phone Number *')
        const dateInput = screen.getByLabelText('Charter Date *')
        const embarkationSelect = screen.getByLabelText('Embarkation Point *')
        const submitButton = screen.getByRole('button', { name: /Send Information Request/i })

        // Fill form with invalid email
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.change(phoneInput, { target: { value: '+30 210 123 4567' } })
        fireEvent.change(dateInput, { target: { value: '2024-06-15' } })
        fireEvent.change(embarkationSelect, { target: { value: 'nea-peramos' } })
        
        fireEvent.click(submitButton)
        
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    test('validates passenger capacity', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('Full Name *')
        const emailInput = screen.getByLabelText('Email Address *')
        const phoneInput = screen.getByLabelText('Phone Number *')
        const dateInput = screen.getByLabelText('Charter Date *')
        const embarkationSelect = screen.getByLabelText('Embarkation Point *')
        const passengerInput = screen.getByLabelText('Number of Passengers *')
        const submitButton = screen.getByRole('button', { name: /Send Information Request/i })

        // Fill form with too many passengers
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.change(phoneInput, { target: { value: '+30 210 123 4567' } })
        fireEvent.change(dateInput, { target: { value: '2024-06-15' } })
        fireEvent.change(embarkationSelect, { target: { value: 'nea-peramos' } })
        fireEvent.change(passengerInput, { target: { value: '20' } })
        
        fireEvent.click(submitButton)
        
        expect(screen.getByText(/Number of passengers must be between/)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    test('submits form successfully with valid data', async () => {
      const mockEmailResponse = {
        business: { status: 'success', message: 'Business email sent' },
        client: { status: 'success', message: 'Client email sent' }
      }
      ;(sendBookingEmails as jest.Mock).mockResolvedValue(mockEmailResponse)

      render(<BookingPageContent />)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('Full Name *')
        const emailInput = screen.getByLabelText('Email Address *')
        const phoneInput = screen.getByLabelText('Phone Number *')
        const dateInput = screen.getByLabelText('Charter Date *')
        const embarkationSelect = screen.getByLabelText('Embarkation Point *')
        const passengerInput = screen.getByLabelText('Number of Passengers *')
        const submitButton = screen.getByRole('button', { name: /Send Information Request/i })

        // Fill form with valid data
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.change(phoneInput, { target: { value: '+30 210 123 4567' } })
        fireEvent.change(dateInput, { target: { value: '2024-06-15' } })
        fireEvent.change(embarkationSelect, { target: { value: 'nea-peramos' } })
        fireEvent.change(passengerInput, { target: { value: '4' } })
        
        fireEvent.click(submitButton)
        
        // Check loading state
        expect(screen.getByText('Sending Request...')).toBeInTheDocument()
        
        // Wait for submission to complete
        waitFor(() => {
          expect(sendBookingEmails).toHaveBeenCalledWith({
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+30 210 123 4567',
            boat: 'BlueOne',
            date: '2024-06-15',
            passengers: 4,
            embarkationPoint: 'Nea Peramos Marina',
            timestamp: expect.any(String)
          })
          
          expect(window.location.href).toBe('/booking-confirmation')
        })
      })
    })

    test('handles email sending errors', async () => {
      const mockEmailResponse = {
        business: { status: 'error', message: 'Failed to send business email' },
        client: { status: 'success', message: 'Client email sent' }
      }
      ;(sendBookingEmails as jest.Mock).mockResolvedValue(mockEmailResponse)

      render(<BookingPageContent />)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('Full Name *')
        const emailInput = screen.getByLabelText('Email Address *')
        const phoneInput = screen.getByLabelText('Phone Number *')
        const dateInput = screen.getByLabelText('Charter Date *')
        const embarkationSelect = screen.getByLabelText('Embarkation Point *')
        const passengerInput = screen.getByLabelText('Number of Passengers *')
        const submitButton = screen.getByRole('button', { name: /Send Information Request/i })

        // Fill form with valid data
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.change(phoneInput, { target: { value: '+30 210 123 4567' } })
        fireEvent.change(dateInput, { target: { value: '2024-06-15' } })
        fireEvent.change(embarkationSelect, { target: { value: 'nea-peramos' } })
        fireEvent.change(passengerInput, { target: { value: '4' } })
        
        fireEvent.click(submitButton)
        
        waitFor(() => {
          expect(screen.getByText(/There was an error sending your request/)).toBeInTheDocument()
          expect(screen.getByText(/Business notification: Failed to send business email/)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Holiday Preferences', () => {
    test('allows optional holiday description', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const holidayTextarea = screen.getByLabelText('Describe Your Ideal Holiday')
        expect(holidayTextarea).toBeInTheDocument()
        
        fireEvent.change(holidayTextarea, { target: { value: 'I want a relaxing sailing trip' } })
        
        expect(holidayTextarea).toHaveValue('I want a relaxing sailing trip')
      })
    })

    test('allows optional theme selection', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const themeSelect = screen.getByLabelText('Preferred Adventure Theme')
        expect(themeSelect).toBeInTheDocument()
        
        fireEvent.change(themeSelect, { target: { value: '1' } })
        
        expect(screen.getByText('Select a theme (optional)')).toBeInTheDocument()
      })
    })
  })

  describe('Booking Summary', () => {
    test('updates booking summary in real-time', async () => {
      render(<BookingPageContent />)
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('Full Name *')
        const emailInput = screen.getByLabelText('Email Address *')
        
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('john@example.com')).toBeInTheDocument()
      })
    })
  })
})
