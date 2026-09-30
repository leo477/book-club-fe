'use client';
'use no memo';

import { useIsMutating, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Club, MyMembership } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { myClubsKey } from '@/features/clubs/use-clubs';
import { setActionError, useActionError } from './action-error';
import { describeError } from './describe-error';
import { membershipKey, useClubRole, useMyMembership, type ClubRef } from './use-club-detail';

const actionKey = (clubId: string) => ['club', clubId, 'membership-action'] as const;
const NOT_MEMBER: MyMembership = { isMember: false, role: null, joinRequestStatus: 'none' };

function useMembershipAction(clubId: string) {
  const busy = useIsMutating({ mutationKey: actionKey(clubId) }) > 0;
  const error = useActionError();
  return { busy, error };
}

export function LeaveButton({ club }: { club: ClubRef }) {
  const t = useTranslations('CLUB_DETAIL');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const role = useClubRole(club);
  const { busy } = useMembershipAction(club.id);

  const leave = useMutation({
    mutationKey: [...actionKey(club.id), 'leave'],
    mutationFn: () => api.clubs.leave(club.id),
    onMutate: () => setActionError(null),
    onSuccess: () => {
      queryClient.setQueryData<Club[]>(myClubsKey, (list) => list?.filter((c) => c.id !== club.id));
      queryClient.setQueryData<MyMembership>(membershipKey(club.id), NOT_MEMBER);
    },
    onError: (err) => setActionError(describeError(err, tErrors)),
  });

  if (!role.ready || !role.isAuthenticated || role.isOwner || !role.isMember) return null;
  return (
    <Button type="button" variant="outline" data-testid="leave-button" disabled={busy} aria-label={t('leave')} onClick={() => leave.mutate()}>
      {busy && <Spinner className="text-xs" />}
      {t('leave')}
    </Button>
  );
}

export function ActionError() {
  const tErrors = useTranslations('ERRORS');
  const error = useActionError();
  if (!error) return null;
  return (
    <div
      className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
      role="alert"
    >
      <span aria-hidden="true">⚠️</span>
      <span className="flex-1">{error}</span>
      <button
        type="button"
        className="ml-2 -mr-1 -my-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-red-700/70 hover:text-red-700 hover:bg-red-100 dark:text-red-400/70 dark:hover:text-red-400 dark:hover:bg-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label={tErrors('dismiss')}
        onClick={() => setActionError(null)}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}

const CTA = 'rounded-2xl border-2 border-dashed border-[var(--color-sepia)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-surface-raised)]';

/** Guest "log in" prompt, or the join prompt for a signed-in non-member. */
export function JoinCta({ club }: { club: ClubRef }) {
  const t = useTranslations('CLUB_DETAIL');
  const tClubs = useTranslations('CLUBS');
  const tChat = useTranslations('CHAT');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const role = useClubRole(club);
  const membership = useMyMembership(club.id, role.isAuthenticated);
  const { busy, error } = useMembershipAction(club.id);

  const join = useMutation({
    mutationKey: [...actionKey(club.id), 'join'],
    mutationFn: () => api.clubs.join(club.id),
    onMutate: () => setActionError(null),
    onSuccess: ({ status }) => {
      if (status === 'pending' || status === 'already_requested') {
        queryClient.setQueryData<MyMembership>(membershipKey(club.id), (prev) => ({ ...(prev ?? NOT_MEMBER), joinRequestStatus: 'pending' }));
        showToast('success', tClubs('join_request_sent'));
      } else {
        showToast('success', tChat('club_chat_ready_toast'));
        void queryClient.invalidateQueries({ queryKey: myClubsKey });
        void queryClient.invalidateQueries({ queryKey: membershipKey(club.id) });
      }
    },
    onError: (err) => setActionError(describeError(err, tErrors)),
  });

  if (!role.ready) return null;

  if (!role.isAuthenticated) {
    return (
      <div data-testid="guest-cta" className={CTA}>
        <div>
          <p className="font-semibold text-[var(--color-ink)]">{t('guest_cta_title')}</p>
          <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">{t('guest_cta_desc')}</p>
        </div>
        <Button asChild className="flex-shrink-0">
          <AppLink href="/login" data-testid="guest-cta-login">
            {t('guest_cta_login')}
          </AppLink>
        </Button>
      </div>
    );
  }

  if (role.isMember || role.isOwner) return null;
  return (
    <div className={CTA}>
      <div>
        <p className="font-semibold text-[var(--color-ink)]">{t('join_cta_title')}</p>
        <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">{t('join_cta_desc')}</p>
      </div>
      {membership.data?.joinRequestStatus === 'pending' ? (
        <Button type="button" data-testid="join-pending" disabled className="flex-shrink-0">
          {tClubs('join_pending')}
        </Button>
      ) : (
        <Button type="button" data-testid="join-button" disabled={busy || error !== null} onClick={() => join.mutate()} className="flex-shrink-0">
          {t('join')}
        </Button>
      )}
    </div>
  );
}

/** Organizer-only entry to the legacy manage screen. */
export function ManagePanel({ club }: { club: ClubRef }) {
  const t = useTranslations('CLUB_DETAIL');
  const tManage = useTranslations('CLUB_MANAGE');
  const role = useClubRole(club);
  if (!role.isOwner) return null;
  return (
    <div className="glass-card-subtle p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('manage_title')}</h2>
      <Button asChild className="w-full">
        <AppLink href={`/clubs/${club.id}/manage`}>⚙️ {tManage('manage_button')}</AppLink>
      </Button>
    </div>
  );
}

/** Members open the club chat; the chat widget is not ported yet, so this lands on the legacy chat page. */
export function ChatButton({ club }: { club: ClubRef }) {
  const t = useTranslations('CHAT');
  const role = useClubRole(club);
  if (!role.isMember) return null;
  return (
    <Button asChild variant="outline" className="self-start">
      <AppLink href="/chats">{t('open')}</AppLink>
    </Button>
  );
}
