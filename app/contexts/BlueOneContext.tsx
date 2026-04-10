'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BlueOneContextType {
  isBlueOneMode: boolean;
  setIsBlueOneMode: (mode: boolean) => void;
  resetTheme: () => void;
}

const BlueOneContext = createContext<BlueOneContextType | undefined>(undefined);

export function BlueOneProvider({ children }: { children: ReactNode }) {
  const [isBlueOneMode, setIsBlueOneMode] = useState(false);

  useEffect(() => {
    // Check localStorage on mount to see if BlueOne mode was previously activated
    const storedMode = localStorage.getItem('blueOneMode');
    if (storedMode === 'true') {
      setIsBlueOneMode(true);
    }
  }, []);

  const setBlueOneModeWithPersistence = (mode: boolean) => {
    setIsBlueOneMode(mode);
    // Persist to localStorage
    localStorage.setItem('blueOneMode', mode.toString());
  };

  const resetTheme = () => {
    setIsBlueOneMode(false);
    localStorage.removeItem('blueOneMode');
  };

  return (
    <BlueOneContext.Provider value={{ 
      isBlueOneMode, 
      setIsBlueOneMode: setBlueOneModeWithPersistence,
      resetTheme 
    }}>
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
