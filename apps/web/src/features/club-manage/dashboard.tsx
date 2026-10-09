'use client';
'use no memo';

import type { ClubStats } from '@book-club/contracts';
import { useFormatter, useTranslations } from 'next-intl';
import { ErrorPanel } from '@/components/error-panel';
import { Spinner } from '@/components/ui/spinner';
import { useClubStats } from './use-club-manage';

const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;

export const heightOf = (count: number, max: number) => {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  return `${Math.min(100, (safeCount / safeMax) * 100)}%`;
};

function Bars({ label, icon, rows, tone }: { label: string; icon?: string; rows: readonly { key: string; title: string; count: number }[]; tone: string }) {
  const t = useTranslations('CLUB_MANAGE');
  const format = useFormatter();
  const max = Math.max(...rows.map((r) => r.count).filter(Number.isFinite), 1);
  const titleOf = (title: string) => {
    const m = MONTH_KEY.exec(title);
    return m ? format.dateTime(new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)), { month: 'long', year: 'numeric', timeZone: 'UTC' }) : title;
  };
  const items = rows.map((r) => t('chart_summary_item', { title: titleOf(r.title), count: format.number(r.count) }));
  const summary = t('chart_summary', { label, items: format.list(items) });
  return (
    <div className="parchment-card p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-3">
        {icon && <span aria-hidden="true">{icon} </span>}
        {label}
      </p>
      <div role="img" aria-label={summary} className="flex items-end gap-1 h-24">
        {rows.map((row, i) => (
          <div key={row.key} className={`flex-1 ${tone} rounded-t opacity-70 hover:opacity-100 transition-opacity min-h-[2px]`} style={{ height: heightOf(row.count, max) }} title={items[i]} />
        ))}
      </div>
    </div>
  );
}

function Leaders({ label, rows }: { label: string; rows: ClubStats['topActive'] }) {
  return (
    <div className="parchment-card p-4">
      <p className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mb-2">{label}</p>
      {rows.map((m, i) => (
        <div key={m.userId} className="flex items-center gap-2 text-sm py-1">
          <span className="text-[var(--color-primary-500)] font-bold w-5">{i + 1}.</span>
          <span className="text-[var(--color-ink)]">{m.displayName}</span>
          <span className="ml-auto text-[var(--color-ink-muted)]">{m.count}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_MANAGE');
  const tOrg = useTranslations('ORGANIZER');
  const query = useClubStats(clubId);

  if (query.isPending) {
    return (
      <div className="flex justify-center py-10" aria-busy="true">
        <Spinner />
      </div>
    );
  }
  if (query.isError) return <ErrorPanel compact onRetry={() => void query.refetch()} />;
  const s = query.data;
  if (!s) return <p className="text-sm text-[var(--color-ink-muted)] text-center py-10">{t('no_stats')}</p>;

  const cards = [
    [s.totalMembers, 'stat_members'],
    [s.totalEvents, 'stat_events'],
    [s.totalMessages, 'stat_messages'],
    [s.upcomingEventsCount, 'stat_upcoming'],
  ] as const;
  const attendance = s.recentAttendance.slice(0, 12).reverse();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(([value, key]) => (
          <div key={key} className="parchment-card-raised p-4 text-center">
            <p className="text-3xl font-bold text-[var(--color-primary-500)]">{value}</p>
            <p className="text-xs text-[var(--color-ink-muted)] mt-1">{t(key)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {s.memberGrowth.length > 0 && <Bars icon="👥" label={t('member_growth')} rows={s.memberGrowth.map((m) => ({ key: m.month, title: m.month, count: m.count }))} tone="bg-[var(--color-primary-400)]" />}
        {s.eventFrequency.length > 0 && <Bars icon="📅" label={t('event_frequency')} rows={s.eventFrequency.map((m) => ({ key: m.month, title: m.month, count: m.count }))} tone="bg-[var(--color-primary-400)]" />}
      </div>

      {attendance.length > 0 && <Bars label={tOrg('attendance')} rows={attendance.map((ev) => ({ key: ev.eventId, title: ev.title, count: ev.attendeeCount }))} tone="bg-[var(--color-accent-500)]" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {s.topActive.length > 0 && <Leaders label={`🏃 ${tOrg('top_active')}`} rows={s.topActive} />}
        {s.topWinners.length > 0 && <Leaders label={`🏆 ${tOrg('top_winners')}`} rows={s.topWinners} />}
      </div>

      {s.bannedUsersCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-ink-muted)]">🚫 {t('banned_users')}</span>
          <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">{s.bannedUsersCount}</span>
        </div>
      )}
    </div>
  );
}
