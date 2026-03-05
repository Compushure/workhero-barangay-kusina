'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type MercadoInterval = 'weekly' | 'monthly' | 'yearly';

interface MercadoContextType {
  selectedInterval: MercadoInterval | null;
  setSelectedInterval: (interval: MercadoInterval | null) => void;
}

const MercadoContext = createContext<MercadoContextType | undefined>(undefined);

export function MercadoProvider({ children }: { children: ReactNode }) {
  const [selectedInterval, setSelectedInterval] = useState<MercadoInterval | null>(null);

  return (
    <MercadoContext.Provider value={{ selectedInterval, setSelectedInterval }}>
      {children}
    </MercadoContext.Provider>
  );
}

export function useMercadoContext() {
  const context = useContext(MercadoContext);
  if (!context) {
    throw new Error('useMercadoContext must be used within MercadoProvider');
  }
  return context;
}
