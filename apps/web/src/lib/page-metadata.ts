import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

const OG_LOCALE: Record<string, string> = { uk: 'uk_UA', en: 'en_US' };

interface Overrides {
  descriptionKey?: string;
  ogTitleKey?: string;
  /** ICU arguments for the title, og title and description keys */
  values?: Record<string, string>;
  /** literal description (og and twitter included), e.g. user-authored content */
  description?: string;
  /** absolute https image URL replacing the default og-image */
  image?: string;
  index?: boolean;
}

export async function pageMetadata(titleKey: string, path: string, overrides: Overrides = {}): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const title = t(titleKey, overrides.values);
  const ogTitle = overrides.ogTitleKey ? t(overrides.ogTitleKey, overrides.values) : title;
  const description = overrides.description ?? t(overrides.descriptionKey ?? 'META.description', overrides.values);
  // Canonical is intentionally pinned to SEO.site_url so preview deployments never self-canonicalize.
  const url = new URL(path, t('SEO.site_url')).href;
  const image = overrides.image ?? new URL('/og-image.png', url).href;
  const custom = overrides.descriptionKey !== undefined || overrides.description !== undefined;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: overrides.index ?? true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title: ogTitle,
      description: custom ? description : t('META.ogDescription'),
      locale: OG_LOCALE[locale] ?? locale,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: overrides.description ?? t('META.twitterDescription'), images: [image] },
  };
}
