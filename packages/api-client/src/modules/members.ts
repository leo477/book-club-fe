import {
  approveJoinRequestResponse,
  banRecord,
  clubMember,
  joinRequest,
  type BanDuration,
  type MemberRole,
} from '@book-club/contracts';
import { z } from 'zod';
import type { ApiClient } from '../client';

export interface Page {
  skip?: number;
  limit?: number;
}

export const membersApi = (c: ApiClient) => ({
  list: (clubId: string, page: Page = {}, options?: { skipAuthRedirect?: boolean }) =>
    c.get(`/clubs/${clubId}/members`, z.array(clubMember), { ...options, query: { ...page } }),
  remove: (clubId: string, userId: string) => c.delete(`/clubs/${clubId}/members/${userId}`, z.void()),
  ban: (clubId: string, userId: string, duration: BanDuration) =>
    c.post(`/clubs/${clubId}/members/${userId}/ban`, banRecord, { duration }),
  unban: (clubId: string, userId: string) => c.delete(`/clubs/${clubId}/bans/${userId}`, z.void()),
  changeRole: (clubId: string, userId: string, role: MemberRole) =>
    c.patch(`/clubs/${clubId}/members/${userId}/role`, clubMember, { role }),
  bans: (clubId: string, page: Page = {}) =>
    c.get(`/clubs/${clubId}/bans`, z.array(banRecord), { query: { ...page } }),
  joinRequests: (clubId: string, page: Page = {}) =>
    c.get(`/clubs/${clubId}/join-requests`, z.array(joinRequest), { query: { ...page } }),
  approveJoinRequest: (clubId: string, userId: string) =>
    c.post(`/clubs/${clubId}/join-requests/${userId}/approve`, approveJoinRequestResponse, {}),
  rejectJoinRequest: (clubId: string, userId: string) =>
    c.post(`/clubs/${clubId}/join-requests/${userId}/reject`, z.void(), {}),
});
