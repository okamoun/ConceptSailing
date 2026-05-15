import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Lazily-evaluated so the Admin SDK is only initialised on first request,
// not at module-evaluation time (which would fail in build without env vars).
let _adminAuth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

// Keep a backward-compatible named export by proxying through a Proxy so
// callers that do `adminAuth.verifyIdToken(...)` still work at runtime.
export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_target, prop) {
    return getAdminAuth()[prop as keyof Auth];
  },
});
