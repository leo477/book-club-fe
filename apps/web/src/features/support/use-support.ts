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

const LIKE_KEY = ['support', 'like'] as const;

/** Optimistic like toggle; after the last concurrent toggle settles the list is refetched, so a refusal (e.g. 409 already liked) ends in the server's state. */
export function useToggleLike() {
  const queryClient = useQueryClient();
  const patch = (id: string, likedByMe: boolean) => (list: Submission[] | undefined) =>
    list?.map((s) => (s.id === id ? { ...s, likedByMe, likeCount: s.likeCount + (likedByMe ? 1 : -1) } : s));
  return useMutation({
    mutationKey: LIKE_KEY,
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      if (liked) await api.support.unlike(id);
      else await api.support.like(id);
    },
    onMutate: async ({ id, liked }) => {
      await queryClient.cancelQueries({ queryKey: supportKey });
      queryClient.setQueryData<Submission[]>(supportKey, patch(id, !liked));
    },
    onError: (_err, { id, liked }) => queryClient.setQueryData<Submission[]>(supportKey, patch(id, liked)),
    // the settling mutation is still pending here: 1 means it is the last one, and an earlier refetch could undo another toggle
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: LIKE_KEY }) === 1) void queryClient.invalidateQueries({ queryKey: supportKey });
    },
  });
}
