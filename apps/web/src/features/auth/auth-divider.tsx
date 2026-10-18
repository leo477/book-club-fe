import { useTranslations } from 'next-intl';

export function AuthDivider() {
  const t = useTranslations('AUTH');
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="h-px flex-1 bg-gray-200 dark:bg-white/15" />
      <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('or_divider')}</span>
      <span className="h-px flex-1 bg-gray-200 dark:bg-white/15" />
    </div>
  );
}
