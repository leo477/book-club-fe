import { z } from 'zod';
import { afterMeetingVenue } from './event';

export const clubStatus = z.enum(['active', 'paused', 'cancelled']);
export type ClubStatus = z.infer<typeof clubStatus>;

export const banDuration = z.union([z.literal(1), z.literal(3), z.literal(5), z.literal('permanent')]);
export type BanDuration = z.infer<typeof banDuration>;

const banDurationWire = z.union([
  banDuration,
  z.enum(['1', '3', '5']).transform((v) => Number(v) as 1 | 3 | 5),
]);

export const championInfo = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullish(),
  wins: z.number(),
  eventTitle: z.string().nullish(),
});
export type ChampionInfo = z.infer<typeof championInfo>;

export const club = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  organizerId: z.string(),
  isPublic: z.boolean(),
  memberCount: z.number(),
  memberPreviews: z.array(z.string()).default([]),
  createdAt: z.string(),
  status: clubStatus.default('active'),
  city: z.string().nullish(),
  nextMeetingDate: z.string().nullish(),
  address: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  theme: z.string().nullish(),
  currentBook: z.string().nullish(),
  tags: z.array(z.string()).default([]),
  meetingDurationMinutes: z.number().nullish(),
  afterMeetingVenue: afterMeetingVenue.nullish(),
  cancelledAt: z.string().nullish(),
  currentChampion: championInfo.nullish(),
});
export type Club = z.infer<typeof club>;

export const memberStatRow = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  count: z.number(),
});
export type MemberStatRow = z.infer<typeof memberStatRow>;

const monthlyStatRow = z.object({ month: z.string(), count: z.number() });

export const clubStats = z.object({
  topActive: z.array(memberStatRow),
  topWinners: z.array(memberStatRow),
  recentAttendance: z.array(
    z.object({ eventId: z.string(), title: z.string(), date: z.string(), attendeeCount: z.number() }),
  ),
  totalMembers: z.number(),
  totalEvents: z.number(),
  totalMessages: z.number(),
  memberGrowth: z.array(monthlyStatRow),
  eventFrequency: z.array(monthlyStatRow),
  bannedUsersCount: z.number(),
  upcomingEventsCount: z.number(),
});
export type ClubStats = z.infer<typeof clubStats>;

export const memberRole = z.enum(['member', 'organizer']);
export type MemberRole = z.infer<typeof memberRole>;

export const clubMember = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  role: memberRole,
  socials: z.record(z.string(), z.string()).nullable(),
  socialsPublic: z.boolean(),
});
export type ClubMember = z.infer<typeof clubMember>;

export const banRecord = z.object({
  userId: z.string(),
  clubId: z.string(),
  bannedAt: z.string(),
  duration: banDurationWire,
  bannedBy: z.string(),
});
export type BanRecord = z.infer<typeof banRecord>;

export const joinRequest = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullish(),
  status: z.string(),
  source: z.string(),
  createdAt: z.string(),
});
export type JoinRequest = z.infer<typeof joinRequest>;

export const joinClubResponse = z.object({ status: z.enum(['pending', 'already_requested', 'member']) });
export type JoinClubResponse = z.infer<typeof joinClubResponse>;

export const myMembership = z.object({
  isMember: z.boolean(),
  role: z.string().nullish(),
  joinRequestStatus: z.enum(['none', 'pending', 'rejected']).default('none'),
});
export type MyMembership = z.infer<typeof myMembership>;

export const approveJoinRequestResponse = z.object({ memberCount: z.number() });

export const createClubRequest = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(2000).nullish(),
  isPublic: z.boolean().optional(),
  coverUrl: z.string().max(500).nullish(),
  city: z.string().max(100).nullish(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  meetingDurationMinutes: z.number().int().min(1).max(480).nullish(),
  afterMeetingVenue: afterMeetingVenue.nullish(),
});
export type CreateClubRequest = z.input<typeof createClubRequest>;

export const updateClubRequest = createClubRequest.partial();
export type UpdateClubRequest = z.input<typeof updateClubRequest>;
