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

// Mock Next.js Image component — strip Next.js-only props so React doesn't
// warn about unknown boolean attributes on the underlying <img> element.
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ src, alt, fill, priority, sizes, quality, placeholder, blurDataURL, loader, onLoadingComplete, objectFit, objectPosition, ...rest }: any) =>
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...rest} />,
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

// jsdom v22+ doesn't allow Object.defineProperty on window.location; suppress
// the "Not implemented: navigation" noise it emits.
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && args[0].includes('Not implemented: navigation')) return
  originalConsoleError(...args)
}
try {
  Object.defineProperty(window, 'location', {
    value: { href: '', origin: 'http://localhost' },
    writable: true,
    configurable: true,
  });
} catch {
  window.location.href = '';
}
