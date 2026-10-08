'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorPanel } from '@/components/error-panel';
import { LazyBoundary } from '@/components/lazy-boundary';
import { Pending } from '@/features/auth/require-auth';

/** Holds a route's form code (react-hook-form, zod schemas) out of the first-load bundle; the auth spinner stays up until it arrives. */
export function LazyPage({ children }: { children: ReactNode }) {
  return (
    <LazyBoundary fallback={<ErrorPanel onRetry={() => window.location.reload()} />}>
      <Suspense fallback={<Pending />}>{children}</Suspense>
    </LazyBoundary>
  );
}
