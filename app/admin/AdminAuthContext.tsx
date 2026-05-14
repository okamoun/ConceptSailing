'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'admin_session';
const SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin';

interface AuthCtx {
  authed: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AuthCtx>({
  authed: false,
  login: () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === SECRET;
  });

  function login(pw: string): boolean {
    if (pw !== SECRET) return false;
    localStorage.setItem(STORAGE_KEY, SECRET);
    setAuthed(true);
    return true;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
  }

  return (
    <AdminAuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
