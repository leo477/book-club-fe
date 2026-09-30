import type { ClubStub } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { ActionError, JoinCta } from './membership';
import { Hero, PrivateBadge } from './sections';

/** What everyone sees of a private club they cannot view: its name, member count and the way in. */
export function PrivateStub({ stub }: { stub: ClubStub }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <section className="min-h-screen">
      <Hero club={{ name: stub.name, coverUrl: null }} />
      <div className="page-max-w px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <PrivateBadge club={stub} />
          </div>
          <ActionError />
          <div data-testid="private-stub" className="parchment-card-sunken flex flex-col gap-6 px-6 py-6 text-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('private_stub_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">{t('private_stub_desc')}</p>
            <p className="text-[var(--color-ink-muted)]">{t('private_stub_members', { count: stub.memberCount })}</p>
          </div>
          <JoinCta club={stub} />
        </div>
      </div>
    </section>
  );
}
