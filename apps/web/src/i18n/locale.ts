export const locales = ['uk', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'uk';
export const LOCALE_COOKIE = 'lang';
export const THEME_COOKIE = 'theme';

export const parseLocale = (value: string | undefined): Locale =>
  (locales as readonly string[]).includes(value ?? '') ? (value as Locale) : defaultLocale;

export type Theme = 'light' | 'dark' | 'system';
export const parseTheme = (value: string | undefined): Theme => (value === 'light' || value === 'dark' ? value : 'system');

type Tree = { [key: string]: string | Tree };

/** ICU build keys are flat and dotted (`CLUB.title`); next-intl namespaces are nested. */
export function nest(flat: Record<string, string>): Tree {
  const root: Tree = {};
  for (const [key, message] of Object.entries(flat)) {
    const parts = key.split('.');
    let node = root;
    for (const part of parts.slice(0, -1)) {
      const next = node[part];
      if (typeof next === 'string') {
        node = {};
        break;
      }
      node = node[part] = next ?? {};
    }
    const leaf = parts.at(-1)!;
    if (typeof node[leaf] !== 'object') node[leaf] = message;
  }
  return root;
}
