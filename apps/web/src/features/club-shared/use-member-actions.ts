'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import type { BanDuration, ClubMember, MemberRole } from '@book-club/contracts';
import { membersKey } from '@/features/club-detail/use-club-detail';
import { invalidateClub } from '@/features/club-shared/invalidate-club';
import { api } from '@/lib/api';
import { useGuardedRunner } from './guarded-runner';

/** Kick, ban and role changes: the list updates at once, and only the member this call touched is put back when it fails. */
export function useMemberActions(clubId: string) {
  const queryClient = useQueryClient();
  const { run, busy } = useGuardedRunner();

  const apply = (userId: string, call: () => Promise<unknown>, next: (member: ClubMember) => ClubMember | null) =>
    run(userId, async () => {
      await queryClient.cancelQueries({ queryKey: membersKey(clubId) });
      const before = queryClient.getQueryData<ClubMember[]>(membersKey(clubId));
      const index = before?.findIndex((m) => m.userId === userId) ?? -1;
      const original = before?.[index];
      queryClient.setQueryData<ClubMember[]>(membersKey(clubId), (list) =>
        list?.flatMap((m) => {
          if (m.userId !== userId) return [m];
          const updated = next(m);
          return updated ? [updated] : [];
        }),
      );
      try {
        await call();
      } catch (err) {
        if (original) {
          queryClient.setQueryData<ClubMember[]>(membersKey(clubId), (list) => {
            if (!list) return list;
            if (list.some((m) => m.userId === userId)) return list.map((m) => (m.userId === userId ? original : m));
            const restored = [...list];
            restored.splice(Math.min(index, restored.length), 0, original);
            return restored;
          });
        }
        throw err;
      } finally {
        void invalidateClub(queryClient, clubId);
      }
    });

  return {
    busy,
    kick: (userId: string) => apply(userId, () => api.members.remove(clubId, userId), () => null),
    ban: (userId: string, duration: BanDuration) => apply(userId, () => api.members.ban(clubId, userId, duration), () => null),
    changeRole: (userId: string, role: MemberRole) => apply(userId, () => api.members.changeRole(clubId, userId, role), (m) => ({ ...m, role })),
  };
}
