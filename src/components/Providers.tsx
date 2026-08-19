'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext } from 'react';
import type { Persona } from '@/lib/schemas';

const PersonaContext = createContext<{
  persona: Persona;
  setPersona: (persona: Persona) => void;
} | null>(null);

const LocaleContext = createContext<{
  locale: string;
  setLocale: (locale: string) => void;
} | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [persona, setPersona] = useState<Persona>('patient');
  const [locale, setLocale] = useState<string>('English');

  return (
    <QueryClientProvider client={queryClient}>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        <PersonaContext.Provider value={{ persona, setPersona }}>
          {children}
        </PersonaContext.Provider>
      </LocaleContext.Provider>
    </QueryClientProvider>
  );
}

export const usePersona = () => {
  const context = useContext(PersonaContext);
  if (!context) throw new Error('usePersona must be used within Providers');
  return context;
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within Providers');
  return context;
};
