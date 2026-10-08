'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateSubmissionRequest, Submission } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

export const supportKey = ['support'] as const;

/** The board always loads fresh on entry (Angular reloaded on every visit); a failed load reads as an empty board. */
export const useSubmissions = () =>
  useQuery({ queryKey: supportKey, queryFn: () => api.support.list(), staleTime: 0, refetchOnWindowFocus: false });

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const t = useTranslations('SUPPORT');
  return useMutation({
    mutationFn: (body: CreateSubmissionRequest) => api.support.create(body),
    onSuccess: (created) => {
      queryClient.setQueryData<Submission[]>(supportKey, (list) => (list ? [created, ...list] : list));
      showToast('success', t('submit_success'));
    },
  });
}

export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations('SUPPORT');
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'in_progress' | 'done' }) => api.support.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<Submission[]>(supportKey, (list) => list?.map((s) => (s.id === updated.id ? updated : s)));
      showToast('success', t('status_updated'));
    },
  });
}

/** Optimistic like toggle; a failed call restores the previous state (5xx and timeouts are toasted by the client). */
export function useToggleLike() {
  const queryClient = useQueryClient();
  const patch = (id: string, likedByMe: boolean) => (list: Submission[] | undefined) =>
    list?.map((s) => (s.id === id ? { ...s, likedByMe, likeCount: s.likeCount + (likedByMe ? 1 : -1) } : s));
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      if (liked) await api.support.unlike(id);
      else await api.support.like(id);
    },
    onMutate: ({ id, liked }) => queryClient.setQueryData<Submission[]>(supportKey, patch(id, !liked)),
    onError: (_err, { id, liked }) => queryClient.setQueryData<Submission[]>(supportKey, patch(id, liked)),
  });
}
