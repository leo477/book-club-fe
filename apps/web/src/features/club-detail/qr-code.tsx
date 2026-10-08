'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

/** Renders `value` as a QR code; the generator is fetched only when a code is first shown. */
export function QrCode({ value, size = 200 }: { value: string; size?: number }) {
  const t = useTranslations('CLUB_DETAIL');
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    void import('qrcode').then(({ default: qr }) => {
      const el = canvas.current;
      if (cancelled || !el || !value) return;
      qr.toCanvas(el, value, { width: size, margin: 2 }).catch(() => undefined);
    });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div className="parchment-card flex items-center justify-center p-6 w-fit">
      <canvas ref={canvas} role="img" aria-label={t('qr_code_aria')} style={{ width: size, height: size }} className="rounded-lg" />
    </div>
  );
}
