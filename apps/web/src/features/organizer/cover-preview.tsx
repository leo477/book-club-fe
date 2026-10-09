'use client';

import { useState } from 'react';
import { safeImageUrl } from '@/lib/safe-image-url';

/** Preview of a typed cover URL; an unreachable image just hides, the field keeps what was typed. */
export function CoverPreview({ src: typed }: { src: string }) {
  const src = safeImageUrl(typed);
  const [broken, setBroken] = useState<string | null>(null);
  if (!src || src === broken) return null;
  return (
    <div className="relative mb-2 h-28 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
      {/* eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts; no image optimizer is configured */}
      <img src={src} alt="" referrerPolicy="no-referrer" className="size-full object-cover" onError={() => setBroken(src)} />
    </div>
  );
}
