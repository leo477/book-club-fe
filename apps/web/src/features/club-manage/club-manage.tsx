'use client';
'use no memo';

import type { Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MemberList } from '@/features/club-detail/member-list';
import { useSession } from '@/features/clubs/use-session';
import { EditClub } from '@/features/organizer/edit-club';
import { AppLink } from '@/components/app-link';
import { Bans } from './bans';
import { Dashboard } from './dashboard';
import { OrganizerOfClub } from './organizer-gate';
import { Requests } from './requests';
import { Tools } from './tools';
import { useJoinRequests } from './use-club-manage';

const TABS = ['dashboard', 'members', 'requests', 'settings', 'tools'] as const;
type Tab = (typeof TABS)[number];

const STATUS_BADGE = {
  active: ['CLUB_MANAGE.status_active', 'bg-green-100 text-green-700'],
  paused: ['CLUBS.paused', 'bg-amber-100 text-amber-700'],
  cancelled: ['CLUBS.cancelled', 'bg-red-100 text-red-700'],
} as const;

export function ClubManage({ id }: { id: string }) {
  return <OrganizerOfClub clubId={id}>{(club) => <ClubManageView club={club} />}</OrganizerOfClub>;
}

function ClubManageView({ club }: { club: Club }) {
  const t = useTranslations('CLUB_MANAGE');
  const tAll = useTranslations();
  const requests = useJoinRequests(club.id);
  const { user } = useSession();
  const [tab, setTab] = useState<Tab>('dashboard');

  const [badgeKey, badgeTone] = STATUS_BADGE[club.status];
  const pending = requests.data?.length ?? 0;
  return (
    <div className="page-container page-max-w py-8 space-y-6">
      <header>
        <AppLink href={`/clubs/${club.id}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors mb-1">
          ← {t('back_to_club')}
        </AppLink>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-fantasy text-3xl font-bold tracking-wide text-[var(--color-ink)]">{club.name}</h1>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeTone}`}>{tAll(badgeKey)}</span>
        </div>
        <p className="text-sm text-[var(--color-ink-muted)] mt-1">{t('subtitle')}</p>
      </header>

      <Tabs value={tab} onValueChange={(next) => setTab(next as Tab)}>
        <TabsList className="mb-6 flex-wrap h-auto">
          {TABS.map((key) => (
            <TabsTrigger key={key} value={key}>
              {t(`tab_${key}`)}
              {key === 'requests' && pending > 0 ? <span className="ml-1.5 rounded-full bg-primary-600 text-white text-[10px] px-1.5 py-0.5">{pending}</span> : null}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="dashboard">
          <Dashboard clubId={club.id} />
        </TabsContent>
        <TabsContent value="members">
          <div className="space-y-6">
            {/* the gate above admits only an organizer of this club; the backend enforces it */}
            <MemberList clubId={club.id} isOwner roleControls={{ ownerId: club.organizerId, currentUserId: user?.id ?? null }} />
            <Bans clubId={club.id} />
          </div>
        </TabsContent>
        <TabsContent value="requests">
          <Requests clubId={club.id} />
        </TabsContent>
        <TabsContent value="settings">
          <EditClub id={club.id} embedded />
        </TabsContent>
        <TabsContent value="tools">
          <Tools clubId={club.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
