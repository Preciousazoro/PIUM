'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={15 * 60} // Refetch every 15 minutes instead of 5
      refetchOnWindowFocus={false} // Disable refetch on window focus
    >
      {children}
    </SessionProvider>
  );
}
