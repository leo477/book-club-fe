import type { QueryClient } from '@tanstack/react-query';

/** Browser-side cache only: the backend schedules the server revalidation, the secret route is never called from here. */
export const invalidateClub = (queryClient: QueryClient, clubId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['clubs'] }),
    queryClient.invalidateQueries({ queryKey: ['club', clubId] }),
  ]);
