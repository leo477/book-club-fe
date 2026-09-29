'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { setErrorTranslator } from '@/lib/api';

/** Lets the module-level API client toast localized 5xx/timeout errors like the Angular interceptor. */
export function ErrorToasts() {
  const t = useTranslations();
  useEffect(() => setErrorTranslator(t), [t]);
  return null;
}
