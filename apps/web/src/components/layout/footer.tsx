import { getTranslations } from 'next-intl/server';
import { AppLink } from '@/components/app-link';

const LINK =
  'text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded';

export async function Footer() {
  const t = await getTranslations('FOOTER');
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          📚 BookClub &copy; {new Date().getFullYear()} — {t('rights')}
        </p>
        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-4">
            <li>
              <AppLink href="/privacy" className={LINK}>
                {t('privacy')}
              </AppLink>
            </li>
            <li>
              <AppLink href="/terms" className={LINK}>
                {t('terms')}
              </AppLink>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
