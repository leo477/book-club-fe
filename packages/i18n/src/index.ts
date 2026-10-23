import en from '../locales/en.json';
import uk from '../locales/uk.json';

export const locales = { en, uk } as const;
export type Locale = keyof typeof locales;
export const defaultLocale: Locale = 'uk';
export type Messages = typeof uk;
