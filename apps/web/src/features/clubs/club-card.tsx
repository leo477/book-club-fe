'use client';

import type { Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

const initials = (name: string): string => {
  const [first, second] = name.trim().split(/\s+/);
  return first && second ? ((first[0] ?? '') + (second[0] ?? '')).toUpperCase() : name.slice(0, 2).toUpperCase();
};

interface ClubCardProps {
  club: Club;
  isMember: boolean;
  isOwned: boolean;
  isAuthenticated: boolean;
  sessionPending: boolean;
  /** first row: above the fold, so its cover is fetched eagerly */
  priority?: boolean;
  joining: boolean;
  onJoin: () => void;
}

export function ClubCard({ club, isMember, isOwned, isAuthenticated, sessionPending, priority = false, joining, onJoin }: ClubCardProps) {
  const t = useTranslations('CLUBS');
  const detailHref = `/clubs/${club.id}`;
  const view = (
    <AppLink href={detailHref} aria-label={`${t('view')} ${club.name}`}>
      {t('view')}
    </AppLink>
  );

  return (
    <div className="flex flex-col overflow-hidden h-full parchment-card hover:shadow-[var(--shadow-parchment-lg)] transition-shadow duration-200">
      <div className="relative overflow-hidden flex-shrink-0 h-40">
        {club.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts; no image optimizer is configured
          <img
            src={club.coverUrl}
            alt=""
            aria-hidden="true"
            width={640}
            height={160}
            referrerPolicy="no-referrer"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-600 via-accent-500 to-primary-700"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-3xl select-none drop-shadow">{club.name ? initials(club.name) : '?'}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-3 p-4">
        <div>
          <h2 className="font-display font-semibold text-[var(--color-ink)] leading-snug flex items-center gap-1.5 text-base line-clamp-1">
            {club.name}
            {isOwned && (
              <span
                className="text-xs font-bold text-[var(--color-primary-600)] dark:text-[#fbbf24] flex-shrink-0"
                title="Your club"
                aria-label="Your club"
              >
                ✦
              </span>
            )}
          </h2>
          {club.description && <p className="text-xs text-[var(--color-ink-muted)] mt-1.5 line-clamp-2">{club.description}</p>}
        </div>

        {club.memberPreviews.length > 0 && (
          <div className="flex items-center gap-1.5">
            {club.memberPreviews.slice(0, 4).map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative h-7 w-7 rounded-full avatar-gradient flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden"
                aria-hidden="true"
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are arbitrary hosts
                  <img src={url} alt="" width={28} height={28} referrerPolicy="no-referrer" loading="lazy" className="absolute inset-0 size-full object-cover" />
                ) : (
                  '?'
                )}
              </div>
            ))}
            {club.memberCount > 4 && <span className="text-xs text-[var(--color-ink-muted)] ml-1">+{club.memberCount - 4}</span>}
            <span className="text-xs text-[var(--color-ink-muted)] ml-auto">
              {club.memberCount} {t('members')}
            </span>
          </div>
        )}

        <Separator />

        {sessionPending ? (
          // never the guest CTA before the session resolves; the fixed height keeps the card from jumping
          <div className="mt-auto h-8 invisible" aria-hidden="true" data-testid="card-actions-pending" />
        ) : (
        <div className="flex items-center gap-2 mt-auto">
          {isAuthenticated && !isMember && (
            <>
              <Button
                type="button"
                size="sm"
                onClick={onJoin}
                disabled={joining}
                className="flex-1"
                aria-label={`${t('join')} ${club.name}`}
              >
                {joining ? <Spinner className="text-xs" /> : t('join')}
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                {view}
              </Button>
            </>
          )}
          {isAuthenticated && isMember && (
            <>
              <Button asChild size="sm" className="flex-1 text-center">
                {view}
              </Button>
              {isOwned ? (
                <span className="rounded-lg bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/30 border border-[var(--color-primary-300)] dark:border-[var(--color-primary-700)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-700)] dark:text-[var(--color-primary-300)]">
                  {t('organizer_badge')}
                </span>
              ) : (
                <span className="rounded-lg bg-[var(--color-accent-100)] dark:bg-[var(--color-accent-900)]/30 border border-[var(--color-accent-300)] dark:border-[var(--color-accent-700)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)]">
                  {t('member_badge')}
                </span>
              )}
            </>
          )}
          {!isAuthenticated && (
            <>
              <Button asChild size="sm" className="flex-1 text-center">
                <AppLink href="/login" data-testid="login-to-join" aria-label={`${t('login_to_join')} ${club.name}`}>
                  {t('login_to_join')}
                </AppLink>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-shrink-0">
                {view}
              </Button>
            </>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
