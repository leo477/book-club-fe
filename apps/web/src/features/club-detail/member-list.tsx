'use client';
'use no memo';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BanDuration, ClubMember } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { initials } from '@/lib/format';
import { QrCode } from './qr-code';
import { membersKey, toastError, useClubMembers } from './use-club-detail';

const BAN_DURATIONS: readonly BanDuration[] = [1, 3, 5, 'permanent'];
const BAN_LABEL = { 1: 'ban_1', 3: 'ban_3', 5: 'ban_5', permanent: 'ban_permanent' } as const;

const SOCIAL_LINKS = [
  { key: 'telegram', base: 'https://t.me/', icon: '✈️', label: 'Telegram', color: 'text-blue-500 hover:text-blue-600', at: true },
  { key: 'instagram', base: 'https://instagram.com/', icon: '📸', label: 'Instagram', color: 'text-pink-500 hover:text-pink-600', at: true },
  { key: 'github', base: 'https://github.com/', icon: '🐙', label: 'GitHub', color: 'text-gray-700 dark:text-gray-300 hover:text-gray-900', at: false },
  { key: 'goodreads', base: 'https://goodreads.com/', icon: '📚', label: 'Goodreads', color: 'text-amber-600 hover:text-amber-700', at: false },
] as const;

export function qrValue(member: Pick<ClubMember, 'displayName' | 'socials'>): string {
  const s = member.socials;
  if (!s) return member.displayName;
  const lines = [`📚 ${member.displayName}`];
  if (s['telegram']) lines.push(`Telegram: t.me/${s['telegram']}`);
  if (s['instagram']) lines.push(`Instagram: instagram.com/${s['instagram']}`);
  if (s['twitter']) lines.push(`Twitter: x.com/${s['twitter']}`);
  if (s['linkedin']) lines.push(`LinkedIn: linkedin.com/in/${s['linkedin']}`);
  if (s['github']) lines.push(`GitHub: github.com/${s['github']}`);
  if (s['goodreads']) lines.push(`Goodreads: goodreads.com/${s['goodreads']}`);
  return lines.join('\n');
}

const Card = ({ children }: { children: React.ReactNode }) => <section className="glass-card px-6 py-6 flex flex-col gap-4">{children}</section>;

export function MemberList({ clubId, isOwner }: { clubId: string; isOwner: boolean }) {
  const t = useTranslations('MEMBERS');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const query = useClubMembers(clubId, true);
  const [qrFor, setQrFor] = useState<string | null>(null);
  const [banMenuFor, setBanMenuFor] = useState<string | null>(null);

  const popoverOpen = qrFor !== null || banMenuFor !== null;
  useEffect(() => {
    if (!popoverOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setQrFor(null);
      setBanMenuFor(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [popoverOpen]);

  const remove = useMutation({
    mutationFn: async ({ userId, duration }: { userId: string; duration?: BanDuration }): Promise<void> => {
      if (duration === undefined) await api.members.remove(clubId, userId);
      else await api.members.ban(clubId, userId, duration);
    },
    onMutate: async ({ userId }) => {
      await queryClient.cancelQueries({ queryKey: membersKey(clubId) });
      const previous = queryClient.getQueryData<ClubMember[]>(membersKey(clubId));
      queryClient.setQueryData<ClubMember[]>(membersKey(clubId), (list) => list?.filter((m) => m.userId !== userId));
      return { previous };
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(membersKey(clubId), context?.previous);
      toastError(err, tErrors);
    },
  });

  if (query.isPending) {
    return (
      <div className="parchment-card-sunken px-6 py-8 flex flex-col gap-3" aria-busy="true">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-3" />
      </div>
    );
  }

  const members = query.data ?? [];
  return (
    <Card>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
        {t('title')} ({members.length})
      </h2>
      {members.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
          {members.map((member) => {
            const canSeeSocials = member.socialsPublic || isOwner;
            const links = SOCIAL_LINKS.filter((l) => canSeeSocials && member.socials?.[l.key]);
            const name = member.displayName.includes('@') ? (member.displayName.split('@')[0] ?? member.displayName) : member.displayName;
            return (
              <li key={member.userId} className="flex items-center gap-4 py-3 relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0" aria-hidden="true">
                  {initials(member.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                  {member.role === 'organizer' ? (
                    <span className="inline-block text-xs font-medium text-accent-600 dark:text-accent-400">{t('organizer')}</span>
                  ) : (
                    <span className="inline-block text-xs text-gray-400 dark:text-gray-500">{t('member')}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  {canSeeSocials ? (
                    <>
                      {links.map((l) => (
                        <a
                          key={l.key}
                          href={`${l.base}${member.socials?.[l.key]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${l.color} text-lg`}
                          aria-label={l.at ? `${l.label}: @${member.socials?.[l.key]}` : `${l.label}: ${member.socials?.[l.key]}`}
                          title={l.label}
                        >
                          {l.icon}
                        </a>
                      ))}
                      {links.length > 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="ml-1 text-xs"
                          aria-expanded={qrFor === member.userId}
                          aria-label={`${t('show_qr')} ${name}`}
                          onClick={() => setQrFor(qrFor === member.userId ? null : member.userId)}
                        >
                          <span aria-hidden="true">⊡</span> {t('show_qr')}
                        </Button>
                      )}
                      {qrFor === member.userId && (
                        <div
                          role="dialog"
                          aria-modal="false"
                          aria-label={`${member.displayName} QR`}
                          className="absolute right-0 top-full mt-2 z-20 rounded-2xl glass-card-strong shadow-xl p-4 flex flex-col items-center gap-2"
                        >
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{member.displayName}</p>
                          <QrCode value={qrValue(member)} size={160} />
                          <CloseQr onClose={() => setQrFor(null)} />
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <span aria-hidden="true">🔒</span> {t('socials_hidden')}
                    </span>
                  )}

                  {isOwner && member.role !== 'organizer' && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0 relative">
                      <Button type="button" variant="destructive" size="xs" aria-label={`${t('kick')} ${name}`} onClick={() => remove.mutate({ userId: member.userId })}>
                        {t('kick')}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-orange-600 hover:text-orange-700"
                        aria-expanded={banMenuFor === member.userId}
                        aria-label={`${t('ban')} ${name}`}
                        onClick={() => setBanMenuFor(banMenuFor === member.userId ? null : member.userId)}
                      >
                        {t('ban')}
                      </Button>
                      {banMenuFor === member.userId && (
                        <menu
                          className="absolute right-0 bottom-full mb-1 z-30 rounded-xl glass-card-strong shadow-xl py-1 min-w-36"
                        >
                          {BAN_DURATIONS.map((duration) => (
                            <li key={duration}>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start px-4 text-sm"
                                onClick={() => {
                                  setBanMenuFor(null);
                                  remove.mutate({ userId: member.userId, duration });
                                }}
                              >
                                {t(BAN_LABEL[duration])}
                              </Button>
                            </li>
                          ))}
                        </menu>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function CloseQr({ onClose }: { onClose: () => void }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <Button type="button" variant="ghost" size="sm" className="mt-1 text-xs text-gray-400" onClick={onClose}>
      {t('close_qr')}
    </Button>
  );
}
