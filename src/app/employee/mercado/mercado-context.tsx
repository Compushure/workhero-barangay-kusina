'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface MercadoContextType {
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
}

const MercadoContext = createContext<MercadoContextType | undefined>(undefined);

export function MercadoProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  return (
    <MercadoContext.Provider value={{ selectedMonth, setSelectedMonth }}>
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
