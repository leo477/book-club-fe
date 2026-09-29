'use client';

import { MenuIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';
import type { MobileNavProps } from './mobile-nav-sheet';

const loadSheet = () => import('./mobile-nav-sheet');
const MobileNavSheet = dynamic(loadSheet, { ssr: false });

/** The sheet (Radix Dialog) is not in the first-load bundle: it is fetched on idle, pointer-enter or focus of the trigger. */
export function MobileNav(props: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => void loadSheet(), 3000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="md:hidden p-2 rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
        aria-label="Toggle navigation menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onPointerEnter={() => void loadSheet()}
        onFocus={() => void loadSheet()}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
      >
        <MenuIcon className="h-5 w-5" aria-hidden="true" />
      </button>
      {mounted && (
        <LazyBoundary fallback={null}>
          <MobileNavSheet {...props} open={open} onOpenChange={setOpen} trigger={trigger} />
        </LazyBoundary>
      )}
    </>
  );
}
