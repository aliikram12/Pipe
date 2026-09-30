'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext } from 'react';
import { useOfflineSync } from '@/hooks/use-offline-sync';
import { useAuthStore } from '@/stores/auth-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppBootstrap>{children}</AppBootstrap>
    </QueryClientProvider>
  );
}

function AppBootstrap({ children }: { children: React.ReactNode }) {
  // Initialize offline sync at app level
  useOfflineSync();
  return <>{children}</>;
}
