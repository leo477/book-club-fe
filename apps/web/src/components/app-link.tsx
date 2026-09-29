'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useEnabledRoutes } from '@/strangler/context';
import { matchRoute } from '@/strangler/routes';

type AppLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string };

export function AppLink({ href, ...props }: AppLinkProps) {
  const enabled = useEnabledRoutes();
  const route = href.startsWith('/') && !href.startsWith('//') ? matchRoute(href.split(/[?#]/, 1)[0] ?? '') : null;
  // prefetch off: RSC prefetches are extra requests the legacy app never made, and targets may still be legacy-owned
  if (route && enabled.includes(route.pattern)) return <Link href={href} prefetch={false} {...(props as Omit<ComponentProps<typeof Link>, 'href'>)} />;
  return <a href={href} {...props} />;
}
