'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getUserProfile, type UserProfile, type AdminPermission } from '@/lib/userManagement';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  hasPermission: (permission: AdminPermission) => boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => null,
  signOut: async () => {},
  hasPermission: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string): Promise<UserProfile | null> {
    const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    const profile = await getUserProfile(cred.user.uid);
    setUserProfile(profile);
    return profile;
  }

  async function signOut() {
    await firebaseSignOut(getFirebaseAuth());
    setUser(null);
    setUserProfile(null);
  }

  function hasPermission(permission: AdminPermission): boolean {
    if (!userProfile || userProfile.role !== 'admin') return false;
    return userProfile.permissions.includes(permission);
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
