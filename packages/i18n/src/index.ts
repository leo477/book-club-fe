import en from '../../../public/i18n/en.json';
import uk from '../../../public/i18n/uk.json';

export const locales = { en, uk } as const;
export type Locale = keyof typeof locales;
export const defaultLocale: Locale = 'uk';
export type Messages = typeof uk;
