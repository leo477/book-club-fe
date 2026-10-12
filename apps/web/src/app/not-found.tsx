import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AppLink } from '@/components/app-link';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t('TITLES.not_found'), robots: { index: false, follow: false } };
}

const SEPIA = 'var(--color-sepia, rgba(139,90,43,0.25))';
const MUTED = 'var(--color-ink-muted, #6b4c2a)';
const PAGE = 'var(--color-surface-raised, #f5eed8)';
const EDGE = 'var(--color-primary-600, #b5720a)';
const LINES = [
  ['18', '28', '42', '26'],
  ['18', '35', '42', '33'],
  ['18', '42', '38', '40'],
  ['78', '28', '54', '26'],
  ['78', '35', '54', '33'],
  ['78', '42', '58', '40'],
] as const;

export default async function NotFound() {
  const t = await getTranslations('NOT_FOUND');
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{
        background:
          'linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary-950, #3d1f00) 20%, transparent), var(--color-bg), color-mix(in srgb, var(--color-accent-950, #032b20) 10%, transparent))',
      }}
    >
      <div
        className="shelf-bg pointer-events-none select-none absolute inset-0 opacity-5"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(transparent 0px, transparent 48px, ${SEPIA} 48px, ${SEPIA} 50px), repeating-linear-gradient(90deg, transparent 0px, transparent 14px, ${SEPIA} 14px, ${SEPIA} 16px)`,
          backgroundSize: '16px 50px',
        }}
      />
      <div className="relative z-10 text-center max-w-lg">
        <div className="flex justify-center mb-6 opacity-70" aria-hidden="true">
          <svg width="96" height="72" viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12 C8 12 12 8 24 8 C36 8 44 12 48 16 L48 64 C44 60 36 56 24 56 C12 56 8 60 8 60 Z" fill={PAGE} stroke={EDGE} strokeWidth="1.5" />
            <path d="M88 12 C88 12 84 8 72 8 C60 8 52 12 48 16 L48 64 C52 60 60 56 72 56 C84 56 88 60 88 60 Z" fill={PAGE} stroke={EDGE} strokeWidth="1.5" />
            <line x1="48" y1="16" x2="48" y2="64" stroke="var(--color-primary-700, #92400e)" strokeWidth="2" />
            {LINES.map(([x1, y1, x2, y2]) => (
              <line key={`${x1}${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={MUTED} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
            ))}
          </svg>
        </div>
        <p
          className="float-404 inline-block font-fantasy leading-none drop-shadow-lg text-[var(--color-primary-600)]"
          style={{ fontSize: 'clamp(5rem, 20vw, 10rem)' }}
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="heading-display text-2xl font-semibold text-[var(--color-ink)] mb-3 mt-2">{t('title')}</h1>
        <p className="text-[var(--color-ink-muted)] mb-8">{t('message')}</p>
        <AppLink
          href="/events"
          className="inline-flex items-center justify-center gap-2 bg-gradient-fantasy text-white rounded-full px-6 py-3 font-medium shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2"
        >
          {t('backHome')}
        </AppLink>
      </div>
    </main>
  );
}
