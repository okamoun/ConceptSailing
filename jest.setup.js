import '@testing-library/jest-dom'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, cb) => { cb(null); return jest.fn(); }),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}))

// Mock AuthContext so tests don't need a real Firebase connection
jest.mock('./app/contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    userProfile: null,
    loading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    hasPermission: jest.fn(() => false),
  }),
}))

// Mock Firebase client SDK extras
jest.mock('./lib/userManagement', () => ({
  getUserProfile: jest.fn(() => Promise.resolve(null)),
  setUserProfile: jest.fn(() => Promise.resolve()),
  updateUserProfile: jest.fn(() => Promise.resolve()),
  deleteUserProfile: jest.fn(() => Promise.resolve()),
  getAllUserProfiles: jest.fn(() => Promise.resolve([])),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
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
try {
  Object.defineProperty(window, 'location', {
    value: { href: '' },
    writable: true,
    configurable: true,
  })
} catch {
  window.location.href = ''
}
