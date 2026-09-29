'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AppLink } from '@/components/app-link';
import { useSession } from '@/features/clubs/use-session';
import { cn } from '@/lib/utils';

/** Stand-in for the chat widget until it is ported: same fixed position and size as its floating button. */
export function ChatLink() {
  const t = useTranslations('CHAT');
  const { user } = useSession();
  const pathname = usePathname();
  if (!user) return null;
  return (
    <AppLink
      href="/chats"
      aria-label={t('open')}
      className={cn(
        'fixed z-50 w-14 h-14 rounded-full bg-accent-500 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center text-white right-6',
        pathname === '/clubs' ? 'bottom-24' : 'bottom-6',
      )}
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    </AppLink>
  );
}
