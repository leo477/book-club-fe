import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';

export default function ClubNotFound() {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <section className="page-max-w px-6 py-8 text-center" role="alert">
      <p className="text-6xl mb-4" aria-hidden="true">😕</p>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{t('not_found')}</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{t('not_found_desc')}</p>
      <Button asChild>
        <AppLink href="/clubs">← {t('back')}</AppLink>
      </Button>
    </section>
  );
}
