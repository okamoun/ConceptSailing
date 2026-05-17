'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getAllAdminUsers, ALL_ADMIN_PAGES, type AdminPage, type AdminUser } from '../../lib/adminUsers';

const STORAGE_KEY = 'admin_session';
const ENV_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin';
const ENV_USER   = process.env.NEXT_PUBLIC_ADMIN_USER   || 'admin';

interface AuthCtx {
  authed: boolean;
  currentUser: AdminUser | null;
  allowedPages: AdminPage[];
  isSuperAdmin: boolean;
  login: (username: string, pw: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AuthCtx>({
  authed: false,
  currentUser: null,
  allowedPages: [],
  isSuperAdmin: false,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const user: AdminUser = JSON.parse(stored);
      setCurrentUser(user);
      setAuthed(true);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  async function login(username: string, pw: string): Promise<boolean> {
    // 1. Try Firestore users first
    try {
      const users = await getAllAdminUsers();
      const match = users.find(u => u.username === username && u.password === pw);
      if (match) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
        setCurrentUser(match);
        setAuthed(true);
        return true;
      }
    } catch { /* Firestore unavailable — fall through to env fallback */ }

    // 2. Fallback to env vars (super admin)
    if (username === ENV_USER && pw === ENV_SECRET) {
      const superUser: AdminUser = {
        username,
        password: pw,
        pages: [...ALL_ADMIN_PAGES],
        isSuperAdmin: true,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(superUser));
      setCurrentUser(superUser);
      setAuthed(true);
      return true;
    }

    return false;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
    setAuthed(false);
  }

  const isSuperAdmin = currentUser?.isSuperAdmin ?? false;
  const allowedPages: AdminPage[] = isSuperAdmin
    ? [...ALL_ADMIN_PAGES]
    : (currentUser?.pages ?? []);

  return (
    <AdminAuthContext.Provider value={{ authed, currentUser, allowedPages, isSuperAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
