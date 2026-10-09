import type { ReactNode } from 'react';

/** Full-screen auth backdrop with the brand heading; the shell (header, footer) is not part of these pages. */
export function AuthFrame({ subtitle, children }: { subtitle: string; children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,var(--color-primary-900)_0%,#1a0a2e_40%,var(--color-accent-900)_100%)]">
      <main className="relative flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-white drop-shadow-sm">📚 Book Club</h1>
            <p className="text-white/70 mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
