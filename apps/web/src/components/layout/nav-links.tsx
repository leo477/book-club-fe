'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/app-link';
import { cn } from '@/lib/utils';

const BASE =
  'px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2';
const ACTIVE = 'text-[var(--color-primary-600)] dark:text-[#fbbf24] bg-[var(--color-primary-100)]/80 dark:bg-[var(--color-primary-900)]/30 font-semibold';

export function NavLinks({ isAuthenticated }: { isAuthenticated: boolean }) {
  const t = useTranslations('NAV');
  const pathname = usePathname();
  const items = [
    { href: '/events', testId: 'nav-events', label: t('events'), exact: true },
    { href: '/clubs', testId: 'nav-clubs', label: t('clubs'), exact: true },
    ...(isAuthenticated ? [{ href: '/support', testId: 'nav-support', label: t('support'), exact: false }] : []),
  ];
  return (
    <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
      {items.map(({ href, testId, label, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <AppLink key={href} href={href} data-testid={testId} aria-current={active ? 'page' : undefined} className={cn(BASE, active && ACTIVE)}>
            {label}
          </AppLink>
        );
      })}
    </nav>
  );
}
