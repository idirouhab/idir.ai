'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  );
}
