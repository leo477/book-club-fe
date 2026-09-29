'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ToasterHost } from '@/components/toaster-host';
import { StranglerProvider } from '@/strangler/context';

export function Providers({
  children,
  enabledRoutes,
  theme,
}: {
  children: ReactNode;
  enabledRoutes: readonly string[];
  theme: 'light' | 'dark' | 'system';
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false } } }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <StranglerProvider value={enabledRoutes}>{children}</StranglerProvider>
      <ToasterHost theme={theme} />
    </QueryClientProvider>
  );
}
