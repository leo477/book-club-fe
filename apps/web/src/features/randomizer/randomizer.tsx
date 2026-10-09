'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import type { ClubMember, RandomizerSession } from '@book-club/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useClubMembers } from '@/features/club-detail/use-club-detail';
import { useGuardedRunner, useMounted } from '@/features/club-manage/use-club-manage';
import { api } from '@/lib/api';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';
import { pickIndex } from './pick';
import { historyKey, useRandomizerHistory } from './use-randomizer';

const SPIN_MS = 2000;
const MIN_PARTICIPANTS = 2;
const HISTORY_SHOWN = 5;
const LOCALES: Record<string, string> = { uk: 'uk-UA', en: 'en-US' };
const TIME_ZONE = 'Europe/Kyiv';

const stamp = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(LOCALES[locale] ?? 'en-US', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIME_ZONE });
};

export function Randomizer({ clubId }: { clubId: string }) {
  const t = useTranslations('RANDOMIZER');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const membersQuery = useClubMembers(clubId, true);
  const history = useRandomizerHistory(clubId).data ?? [];
  const { run, busy } = useGuardedRunner();
  const isMounted = useMounted();

  const [purpose, setPurpose] = useState(() => t('default_purpose'));
  const [excluded, setExcluded] = useState<ReadonlySet<string>>(() => new Set());
  const [result, setResult] = useState<ClubMember | null>(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const spinGuard = useRef(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const candidates = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const selected = useMemo(() => candidates.filter((m) => !excluded.has(m.userId)), [candidates, excluded]);
  const canSpin = selected.length >= MIN_PARTICIPANTS;

  const toggle = (userId: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (!next.delete(userId)) next.add(userId);
      return next;
    });

  const reset = () => {
    setExcluded(new Set());
    setResult(null);
  };

  const spin = () => {
    if (spinGuard.current || !canSpin) return;
    spinGuard.current = true;
    setSpinning(true);
    setResult(null);
    const pool = selected;
    timer.current = setTimeout(() => {
      spinGuard.current = false;
      if (!isMounted()) return;
      setResult(pool[pickIndex(pool.length)] ?? null);
      setSpinning(false);
    }, SPIN_MS);
  };

  const save = () =>
    run('save', async () => {
      if (!result) return;
      const session = await api.randomizer.createSession(clubId, {
        purpose,
        candidates: selected.map((m) => ({ userId: m.userId, displayName: m.displayName, avatarUrl: m.avatarUrl })),
        result: { userId: result.userId, displayName: result.displayName, avatarUrl: result.avatarUrl },
      });
      queryClient.setQueryData<RandomizerSession[]>(historyKey(clubId), (list) => [session, ...(list ?? [])]);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">
              <span aria-hidden="true">🎲 </span>
              {t('title')}
            </h1>
            <p className="text-primary-300 mt-1">{t('subtitle')}</p>
          </div>
          <nav aria-label="Breadcrumb">
            <AppLink href={`/clubs/${clubId}`} className="text-primary-300 hover:text-white transition-colors text-sm">
              {t('back_to_club')}
            </AppLink>
          </nav>
        </header>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
          <label htmlFor="purpose" className="block text-white font-medium text-sm mb-2">
            {t('purpose_label')}
          </label>
          <Input id="purpose" type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder={t('purpose_placeholder')} className="w-full rounded-xl bg-white/10 border-white/20 text-white placeholder-white/40 px-4" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <section aria-labelledby="members-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="members-heading" className="text-white font-semibold text-lg">
                <span aria-hidden="true">👥 </span>
                {t('members_title')}
                <span className="text-primary-300 text-sm font-normal ml-2">
                  {selected.length} / {candidates.length} {t('selected')}
                </span>
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={reset} className="text-xs text-primary-300 hover:text-white">
                {t('select_all')}
              </Button>
            </div>

            {membersQuery.isPending ? (
              <div className="flex justify-center py-8" aria-busy="true">
                <Spinner />
              </div>
            ) : candidates.length === 0 ? (
              <div className="bg-white/10 rounded-2xl p-8 text-center text-white/60">
                <p className="text-3xl mb-2">👤</p>
                <p>{t('no_members')}</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {candidates.map((member) => {
                  const on = !excluded.has(member.userId);
                  return (
                    <li key={member.userId}>
                      <button
                        type="button"
                        onClick={() => toggle(member.userId)}
                        aria-pressed={on}
                        className={cn('w-full flex items-center gap-3 rounded-xl p-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400', on ? 'bg-white/20 border border-white/30' : 'bg-white/5 border border-white/10 opacity-50')}
                      >
                        <span className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold shrink-0" aria-hidden="true">
                          {initials(member.displayName)}
                        </span>
                        <span className="text-white font-medium text-sm flex-1 text-left">{member.displayName}</span>
                        {on ? (
                          <span className="text-green-400 text-lg" aria-hidden="true">
                            ✓
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="spin-heading" className="space-y-6">
            <h2 id="spin-heading" className="sr-only">
              {t('title')}
            </h2>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/10 text-center min-h-[200px] flex flex-col items-center justify-center" aria-live="polite">
              {spinning ? (
                <div className="space-y-4">
                  <div className="text-5xl animate-bounce" aria-hidden="true">
                    🎲
                  </div>
                  <p className="text-white/70 text-sm animate-pulse">{t('spinning')}</p>
                </div>
              ) : result ? (
                <div className="space-y-3" data-testid="randomizer-result">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-accent-400 to-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white/30" aria-hidden="true">
                    {initials(result.displayName)}
                  </div>
                  <div>
                    <p className="text-white/60 text-xs uppercase tracking-wide mb-1">{purpose}</p>
                    <p className="text-white text-2xl font-bold">{result.displayName}</p>
                  </div>
                  <span className="text-3xl" aria-hidden="true">
                    🏆
                  </span>
                </div>
              ) : (
                <div className="text-white/40 space-y-2">
                  <div className="text-4xl" aria-hidden="true">
                    🎯
                  </div>
                  <p className="text-sm">{t('spin_hint')}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button type="button" data-testid="spin-button" onClick={spin} disabled={spinning || !canSpin} className="w-full rounded-2xl bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-400 hover:to-primary-400 text-white font-bold py-4 text-lg shadow-lg h-auto">
                {spinning ? t('spinning_btn') : t('spin')}
              </Button>

              {!canSpin && !spinning ? <p className="text-center text-white/50 text-xs">{t('error_min')}</p> : null}

              {result && !spinning ? (
                <Button type="button" variant="outline" onClick={() => void save()} disabled={busy.has('save')} className="w-full rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium py-3 h-auto">
                  {busy.has('save') ? t('saving') : t('save')}
                </Button>
              ) : null}
            </div>

            {history.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-white/70 text-sm font-medium uppercase tracking-wide">{t('history_title')}</h3>
                <ul className="space-y-2">
                  {history.slice(0, HISTORY_SHOWN).map((session) => (
                    <li key={session.id} className="bg-white/5 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-white/60 text-xs truncate">{session.purpose}</p>
                        {session.result ? (
                          <p className="text-white text-sm font-medium">
                            <span aria-hidden="true">🏆 </span>
                            {session.result.displayName}
                          </p>
                        ) : null}
                      </div>
                      <span className="text-white/40 text-xs shrink-0">{stamp(session.createdAt, locale)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
