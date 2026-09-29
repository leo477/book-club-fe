import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

const OG_LOCALE: Record<string, string> = { uk: 'uk_UA', en: 'en_US' };

interface Overrides {
  descriptionKey?: string;
  ogTitleKey?: string;
}

export async function pageMetadata(titleKey: string, path: string, overrides: Overrides = {}): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const title = t(titleKey);
  const ogTitle = overrides.ogTitleKey ? t(overrides.ogTitleKey) : title;
  const description = t(overrides.descriptionKey ?? 'META.description');
  // Canonical is intentionally pinned to SEO.site_url so preview deployments never self-canonicalize.
  const url = new URL(path, t('SEO.site_url')).href;
  const image = new URL('/og-image.png', url).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      title: ogTitle,
      description: overrides.descriptionKey ? description : t('META.ogDescription'),
      locale: OG_LOCALE[locale] ?? locale,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: ogTitle, description: t('META.twitterDescription'), images: [image] },
  };
}
