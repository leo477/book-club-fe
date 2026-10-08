'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserSocials, UserStats } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { sessionKey, useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

/** Stats are decoration: any failure reads as "no statistics yet" (5xx is already toasted by the client). */
export function useStats(): UserStats | null {
  const { user } = useSession();
  const query = useQuery({
    queryKey: ['profile', 'stats', user?.id],
    queryFn: () => api.users.stats().catch(() => null),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });
  return query.data ?? null;
}

/** Runs one profile PATCH; every outcome gets the same "saved" / "failed to save" toast and a success refreshes the session user. */
function useProfileMutation<V>(save: (value: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  const t = useTranslations('common');
  return useMutation({
    mutationFn: save,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionKey });
      showToast('success', t('saved'));
    },
    onError: () => showToast('error', t('saveError')),
  });
}

export const useUpdateDisplayName = () => useProfileMutation((displayName: string) => api.users.update({ displayName }));
export const useUpdateRole = () => useProfileMutation((role: 'user' | 'organizer') => api.users.updateRole({ role }));
export const useUpdateSocials = () => useProfileMutation((socials: UserSocials) => api.users.updateSocials(socials));
export const useUpdateSocialsVisibility = () => useProfileMutation((value: boolean) => api.users.updateSocialsVisibility(value));
