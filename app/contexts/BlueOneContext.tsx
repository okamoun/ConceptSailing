'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface BlueOneContextType {
  isBlueOneMode: boolean;
  setIsBlueOneMode: (mode: boolean) => void;
  resetTheme: () => void;
}

const BlueOneContext = createContext<BlueOneContextType | undefined>(undefined);

export function BlueOneProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBlueOneMode = pathname?.startsWith('/blueone') ?? false;

  // No-ops kept for API compatibility with pages that call these
  const setIsBlueOneMode = (_mode: boolean) => {};
  const resetTheme = () => {};

  return (
    <BlueOneContext.Provider value={{ isBlueOneMode, setIsBlueOneMode, resetTheme }}>
      {children}
    </BlueOneContext.Provider>
  );
}

export function useBlueOneMode() {
  const context = useContext(BlueOneContext);
  if (context === undefined) {
    throw new Error('useBlueOneMode must be used within a BlueOneProvider');
  }
  return context;
}
