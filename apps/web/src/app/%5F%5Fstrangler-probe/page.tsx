import type { Metadata } from 'next';

// Live in prod via Edge Config but unlinked and not in the sitemap: never index it.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function StranglerProbe() {
  return <main data-testid="strangler-probe">strangler-probe: served by next</main>;
}
