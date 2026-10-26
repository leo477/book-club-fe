import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, parseLocale } from './locale';

const loaders = {
  uk: () => import('@book-club/i18n/uk.icu.json'),
  en: () => import('@book-club/i18n/en.icu.json'),
};

export default getRequestConfig(async () => {
  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return { locale, messages: (await loaders[locale]()).default };
});
