import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
global.localStorage = localStorageMock

// Mock window.location
// jsdom v22+ doesn't allow Object.defineProperty on window.location; the
// delete + assign pattern triggers a harmless "Not implemented: navigation"
// console.error which we suppress here.
const originalConsoleError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) return
  originalConsoleError(...args)
}
delete window.location
window.location = { href: '' }
