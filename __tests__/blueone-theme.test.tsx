import React from 'react'
import { render } from '@testing-library/react'

// jest.mock is hoisted so we cannot reference a variable declared in module scope.
// Use a require inside the test to access the mocked function.
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/blueone/booking'),
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn().mockReturnValue({ get: jest.fn() }),
}))

import BlueOneBookingPage from '../app/blueone/booking/page'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('BlueOne Booking Page', () => {
  test('redirects to /booking with boat=BlueOne query param', () => {
    const { redirect } = require('next/navigation')
    try {
      render(<BlueOneBookingPage />)
    } catch {
      // Next.js redirect() throws a special error to halt rendering
    }
    expect(redirect).toHaveBeenCalledWith('/booking?boat=BlueOne')
  })

  test('redirect is called exactly once', () => {
    const { redirect } = require('next/navigation')
    try {
      render(<BlueOneBookingPage />)
    } catch {
      // swallow redirect error
    }
    expect(redirect).toHaveBeenCalledTimes(1)
  })
})
