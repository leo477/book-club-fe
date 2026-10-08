import type { UserSocials } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SOCIAL_ICON_PATHS } from './social-icon-paths';

type Key = keyof typeof SOCIAL_ICON_PATHS;

interface Network {
  key: Key;
  name: string;
  base: string;
  /** the value may be a full URL instead of a handle */
  acceptsUrl?: boolean;
  /** shown as @handle; otherwise `text` or the raw value */
  at?: boolean;
  text?: string;
  link: string;
  iconClass?: string;
}

const FOCUS = 'transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const NETWORKS: readonly Network[] = [
  { key: 'telegram', name: 'Telegram', base: 'https://t.me/', at: true, link: `border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 focus-visible:ring-blue-500 ${FOCUS}` },
  { key: 'instagram', name: 'Instagram', base: 'https://instagram.com/', at: true, iconClass: 'text-pink-600', link: 'border-pink-200 dark:border-pink-800 bg-pink-50 dark:bg-pink-900/30 bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 text-transparent hover:opacity-80 transition-opacity duration-150 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-pink-500' },
  { key: 'twitter', name: 'Twitter / X', base: 'https://x.com/', at: true, link: `border-gray-300 dark:border-gray-600 bg-gray-900 dark:bg-gray-950 text-white hover:bg-gray-700 dark:hover:bg-gray-800 focus-visible:ring-gray-500 ${FOCUS}` },
  { key: 'linkedin', name: 'LinkedIn', base: 'https://linkedin.com/in/', acceptsUrl: true, text: 'LinkedIn', link: `border-blue-300 dark:border-blue-700 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus-visible:ring-blue-500 ${FOCUS}` },
  { key: 'github', name: 'GitHub', base: 'https://github.com/', link: `border-gray-300 dark:border-gray-600 bg-gray-800 dark:bg-gray-900 text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-800 focus-visible:ring-gray-500 ${FOCUS}` },
  { key: 'goodreads', name: 'Goodreads', base: 'https://goodreads.com/', acceptsUrl: true, text: 'Goodreads', link: `border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 focus-visible:ring-amber-500 ${FOCUS}` },
];

const ABSOLUTE = /^https?:\/\//i;

export function SocialBadges({ socials }: { socials: UserSocials }) {
  const t = useTranslations('PROFILE');
  return (
    <ul className="flex flex-wrap gap-2 list-none p-0 m-0" aria-label={t('socials_title')}>
      {NETWORKS.map((n) => {
        const value = socials[n.key];
        if (!value) return null;
        const href = n.acceptsUrl && ABSOLUTE.test(value) ? value : `${n.base}${value}`;
        const handle = n.at ? `@${value}` : value;
        return (
          <li key={n.key}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${n.name}: ${n.at ? handle : value}`}
              className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium', n.link)}
            >
              <svg className={cn('h-3.5 w-3.5 shrink-0', n.iconClass)} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d={SOCIAL_ICON_PATHS[n.key]} />
              </svg>
              {n.text ?? handle}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
