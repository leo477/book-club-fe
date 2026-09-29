'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';
import { onFirstToast } from '@/lib/toast';

const ToasterImpl = dynamic(() => import('./toaster-impl'), { ssr: false });

export function ToasterHost({ theme }: { theme: 'light' | 'dark' | 'system' }) {
  const [active, setActive] = useState(false);
  useEffect(() => onFirstToast(() => setActive(true)), []);
  return active ? (
    <LazyBoundary fallback={null}>
      <ToasterImpl theme={theme} />
    </LazyBoundary>
  ) : null;
}
