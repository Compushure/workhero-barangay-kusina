'use client';

// Shared context for selected Mercado interval across layout and modal.

import { createContext, useContext, useState, ReactNode } from 'react';

export type MercadoInterval = 'weekly' | 'monthly' | 'yearly';

interface MercadoContextType {
  selectedInterval: MercadoInterval | null;
  setSelectedInterval: (interval: MercadoInterval | null) => void;
}

const MercadoContext = createContext<MercadoContextType | undefined>(undefined);

export function MercadoProvider({ children }: { children: ReactNode }) {
  // Stores which stall (weekly/monthly/yearly) the user selected.
  const [selectedInterval, setSelectedInterval] = useState<MercadoInterval | null>(null);

  return (
    <MercadoContext.Provider value={{ selectedInterval, setSelectedInterval }}>
      {children}
    </MercadoContext.Provider>
  );
}

export function useMercadoContext() {
  // Guard ensures context consumer is wrapped by provider.
  const context = useContext(MercadoContext);
  if (!context) {
    throw new Error('useMercadoContext must be used within MercadoProvider');
  }
  return context;
}
