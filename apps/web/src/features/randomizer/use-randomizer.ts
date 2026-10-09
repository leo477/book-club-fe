'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const historyKey = (clubId: string) => ['club', clubId, 'randomizer', 'history'] as const;

export const useRandomizerHistory = (clubId: string) =>
  useQuery({ queryKey: historyKey(clubId), queryFn: ({ signal }) => api.randomizer.history(clubId, {}, { signal }), retry: false, refetchOnWindowFocus: false });
