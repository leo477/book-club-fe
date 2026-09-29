import { bookVoteRound, type AddBookOptionRequest } from '@book-club/contracts';
import type { ApiClient } from '../client';

const base = (clubId: string) => `/clubs/${clubId}/book-vote`;

export const bookVoteApi = (c: ApiClient) => ({
  currentRound: (clubId: string) => c.get(`${base(clubId)}/round`, bookVoteRound.nullable()),
  createRound: (clubId: string) => c.post(`${base(clubId)}/rounds`, bookVoteRound, {}),
  addOption: (clubId: string, roundId: string, body: AddBookOptionRequest) =>
    c.post(`${base(clubId)}/rounds/${roundId}/options`, bookVoteRound, body),
  removeOption: (clubId: string, optionId: string) =>
    c.delete(`${base(clubId)}/options/${optionId}`, bookVoteRound),
  vote: (clubId: string, optionId: string) => c.post(`${base(clubId)}/options/${optionId}/vote`, bookVoteRound, {}),
  unvote: (clubId: string, optionId: string) => c.delete(`${base(clubId)}/options/${optionId}/vote`, bookVoteRound),
  closeRound: (clubId: string, roundId: string) =>
    c.post(`${base(clubId)}/rounds/${roundId}/close`, bookVoteRound, {}),
});
