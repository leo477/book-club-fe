'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { useEnabledRoutes } from '@/strangler/context';
import { matchRoute } from '@/strangler/routes';

type AppLinkProps = Omit<ComponentProps<'a'>, 'href'> & { href: string };

export function AppLink({ href, ...props }: AppLinkProps) {
  const enabled = useEnabledRoutes();
  const route = href.startsWith('/') && !href.startsWith('//') ? matchRoute(href.split(/[?#]/, 1)[0] ?? '') : null;
  if (route && enabled.includes(route.pattern)) return <Link href={href} {...(props as Omit<ComponentProps<typeof Link>, 'href'>)} />;
  return <a href={href} {...props} />;
}
