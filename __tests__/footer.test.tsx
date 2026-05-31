import React from 'react'
import { render, screen } from '@testing-library/react'
import Footer from '../app/components/Footer'

describe('Footer — Branding', () => {
  test('renders BlueOne logo with correct alt text', () => {
    render(<Footer />)
    expect(screen.getByAltText('BlueOne Logo')).toBeInTheDocument()
  })

  test('renders "BlueOne" brand name', () => {
    render(<Footer />)
    expect(screen.getByRole('heading', { name: 'BlueOne' })).toBeInTheDocument()
  })

  test('renders "Luxury Yacht Charters" subtitle', () => {
    render(<Footer />)
    expect(screen.getByText('Luxury Yacht Charters')).toBeInTheDocument()
  })

  test('renders brand description about Greek sailing adventure', () => {
    render(<Footer />)
    expect(
      screen.getByText(/Experience the ultimate Greek sailing adventure/)
    ).toBeInTheDocument()
  })

  test('brand description mentions premium catamaran', () => {
    render(<Footer />)
    expect(screen.getByText(/premium catamaran/)).toBeInTheDocument()
  })
})

describe('Footer — Quick Links section', () => {
  test('renders Quick Links section heading', () => {
    render(<Footer />)
    expect(screen.getByRole('heading', { name: 'Quick Links' })).toBeInTheDocument()
  })

  const quickLinks = [
    { label: 'Experiences', href: '/experiences' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'The Yacht', href: '/blueone' },
    { label: 'Get a Quote', href: '/booking' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]

  quickLinks.forEach(({ label, href }) => {
    test(`renders "${label}" link with href="${href}"`, () => {
      render(<Footer />)
      const link = screen.getByRole('link', { name: label })
      expect(link).toHaveAttribute('href', href)
    })
  })
})

describe('Footer — Contact section', () => {
  test('renders "Get in Touch" section heading', () => {
    render(<Footer />)
    expect(screen.getByRole('heading', { name: 'Get in Touch' })).toBeInTheDocument()
  })

  test('renders WhatsApp contact link', () => {
    render(<Footer />)
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
  })

  test('WhatsApp link has correct href', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /WhatsApp/ })
    expect(link).toHaveAttribute('href', 'https://wa.me/message/FFC4UTH5AZZEC1')
  })

  test('renders Facebook contact link', () => {
    render(<Footer />)
    expect(screen.getByText('Facebook')).toBeInTheDocument()
  })

  test('renders Athens, Greece location', () => {
    render(<Footer />)
    expect(screen.getByText('Athens, Greece')).toBeInTheDocument()
  })

  test('renders Central Agent attribution with correct spelling', () => {
    render(<Footer />)
    expect(screen.getByRole('link', { name: 'Athenian Yachts' })).toHaveAttribute(
      'href',
      'https://athenian-yachts.gr/'
    )
  })
})

describe('Footer — Legal section', () => {
  test('renders copyright notice', () => {
    render(<Footer />)
    expect(
      screen.getByText('© 2026 BlueOne Luxury Yacht. All rights reserved.')
    ).toBeInTheDocument()
  })

  test('renders Privacy Policy link', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Privacy Policy' })
    expect(link).toHaveAttribute('href', '/privacy')
  })

  test('renders Terms of Service link', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'Terms of Service' })
    expect(link).toHaveAttribute('href', '/terms')
  })
})
