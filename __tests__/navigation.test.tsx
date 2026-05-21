import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Navigation from '../app/components/Navigation'

const mockLogin = jest.fn()
const mockLogout = jest.fn()

jest.mock('../app/admin/AdminAuthContext', () => ({
  useAdminAuth: jest.fn(),
}))

function setupUnauthenticated() {
  const { useAdminAuth } = require('../app/admin/AdminAuthContext')
  ;(useAdminAuth as jest.Mock).mockReturnValue({
    authed: false,
    allowedPages: [],
    isSuperAdmin: false,
    currentUser: null,
    login: mockLogin,
    logout: mockLogout,
  })
}

function setupAuthenticated(username = 'admin', isSuperAdmin = false, pages = ['/admin']) {
  const { useAdminAuth } = require('../app/admin/AdminAuthContext')
  ;(useAdminAuth as jest.Mock).mockReturnValue({
    authed: true,
    allowedPages: pages,
    isSuperAdmin,
    currentUser: { username },
    login: mockLogin,
    logout: mockLogout,
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  setupUnauthenticated()
})

describe('Navigation — Branding', () => {
  test('renders BlueOne logo image with correct alt text', () => {
    render(<Navigation />)
    expect(screen.getByAltText('BlueOne Logo')).toBeInTheDocument()
  })

  test('renders BlueOne Luxury Yacht tagline', () => {
    render(<Navigation />)
    expect(screen.getByText('BlueOne Luxury Yacht')).toBeInTheDocument()
  })

  test('logo is wrapped in a link to the home page', () => {
    render(<Navigation />)
    const homeLinks = screen.getAllByRole('link').filter(l => l.getAttribute('href') === '/')
    expect(homeLinks.length).toBeGreaterThan(0)
  })
})

describe('Navigation — Nav Links spelling and hrefs', () => {
  const expectedLinks = [
    { label: 'Experiences', href: '/experiences' },
    { label: 'The Yacht', href: '/blueone' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'About', href: '/about' },
    { label: 'Availability', href: '/availability' },
    { label: 'Reviews', href: '/reviews' },
    { label: 'Contact', href: '/contact' },
  ]

  expectedLinks.forEach(({ label, href }) => {
    test(`"${label}" link renders with href="${href}"`, () => {
      render(<Navigation />)
      // Links appear in both desktop and mobile markup
      const links = screen.getAllByRole('link', { name: label })
      expect(links.length).toBeGreaterThan(0)
      links.forEach(link => expect(link).toHaveAttribute('href', href))
    })
  })
})

describe('Navigation — Admin Login (unauthenticated)', () => {
  test('shows a Login button when not authenticated', () => {
    render(<Navigation />)
    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  test('clicking Login reveals "Admin Login" label', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
  })

  test('login form has Username placeholder', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getAllByPlaceholderText('Username').length).toBeGreaterThan(0)
  })

  test('login form has Password placeholder', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getAllByPlaceholderText('Password').length).toBeGreaterThan(0)
  })

  test('login form shows Sign In button', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0)
  })

  test('shows error message "Incorrect username or password." on failed login', async () => {
    mockLogin.mockResolvedValue(null)
    render(<Navigation />)
    fireEvent.click(screen.getByText('Login'))

    fireEvent.change(screen.getAllByPlaceholderText('Username')[0], {
      target: { value: 'wrong' },
    })
    fireEvent.change(screen.getAllByPlaceholderText('Password')[0], {
      target: { value: 'wrong' },
    })
    fireEvent.submit(screen.getAllByRole('button', { name: /Sign In/ })[0].closest('form')!)

    await screen.findAllByText('Incorrect username or password.')
    expect(screen.getAllByText('Incorrect username or password.').length).toBeGreaterThan(0)
  })
})

describe('Navigation — Authenticated Admin', () => {
  test('shows username instead of Login button when authenticated', () => {
    setupAuthenticated('captain')
    render(<Navigation />)
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.getByText('captain')).toBeInTheDocument()
  })

  test('shows "Dashboard" link for /admin page when admin dropdown is open', () => {
    setupAuthenticated('captain', false, ['/admin'])
    render(<Navigation />)
    // Open admin dropdown (click the username button)
    fireEvent.click(screen.getByText('captain'))
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
  })

  test('shows "Admin" label in dropdown for regular admin', () => {
    setupAuthenticated('captain', false, ['/admin'])
    render(<Navigation />)
    fireEvent.click(screen.getByText('captain'))
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  test('shows "Super Admin" label in dropdown for super admin', () => {
    setupAuthenticated('superuser', true, ['/admin'])
    render(<Navigation />)
    fireEvent.click(screen.getByText('superuser'))
    expect(screen.getByText('Super Admin')).toBeInTheDocument()
  })

  test('shows Sign Out button in dropdown', () => {
    setupAuthenticated('captain')
    render(<Navigation />)
    fireEvent.click(screen.getByText('captain'))
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument()
  })

  test('calls logout when Sign Out is clicked', () => {
    setupAuthenticated('captain')
    render(<Navigation />)
    fireEvent.click(screen.getByText('captain'))
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})

describe('Navigation — Mobile Menu', () => {
  test('initially renders Open menu toggle button', () => {
    render(<Navigation />)
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  test('toggles to Close menu after click', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
  })

  test('mobile menu shows Admin Login section when not authenticated', () => {
    render(<Navigation />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getAllByText('Admin Login').length).toBeGreaterThan(0)
  })
})
