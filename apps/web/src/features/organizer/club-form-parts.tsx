'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        ⚠️
      </span>
      <span>{children}</span>
    </div>
  );
}

interface VisibilityProps {
  legend: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** The public/private switch of the club forms. */
export function VisibilitySwitch({ legend, label, description, checked, onChange }: VisibilityProps) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{legend}</legend>
      <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
        <div>
          <p id="club-public-label" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby="club-public-label"
          onClick={() => onChange(!checked)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
            checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600',
          )}
        >
          <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-6' : 'translate-x-1')} />
        </button>
      </div>
    </fieldset>
  );
}

export function FormCard({ subtitle, title, children }: { subtitle: string; title: string; children: ReactNode }) {
  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <header className="text-center mb-8">
          <p className="font-display text-3xl font-bold text-gray-900 dark:text-white">📚 BookClub</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        </header>
        <article className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{title}</h1>
          {children}
        </article>
      </div>
    </section>
  );
}
