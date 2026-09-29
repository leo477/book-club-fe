import type { z } from 'zod';
import { describe, expect, it } from 'vitest';
import {
  approveJoinRequestResponse,
  attendEventResponse,
  authResponse,
  authTokens,
  banRecord,
  bookSuggestion,
  bookVoteRound,
  chatMessage,
  chatRoom,
  club,
  clubEvent,
  clubMember,
  clubStats,
  geocodeSuggestion,
  joinClubResponse,
  joinRequest,
  mapsKeyConfig,
  myMembership,
  parse,
  quiz,
  quizAttempt,
  quizLeaderboard,
  quizQuestion,
  quizSession,
  randomizerSession,
  safeParse,
  sessionStatus,
  storeResult,
  submission,
  unreadCount,
  uploadResult,
  userProfile,
  userStats,
  walkingRoute,
  wsTicket,
} from '../src';
import clubs from './fixtures/clubs.json';
import events from './fixtures/events.json';
import votes from './fixtures/book-vote.json';
import misc from './fixtures/misc.json';
import quizzes from './fixtures/quiz.json';
import users from './fixtures/users.json';


interface Case {
  name: string;
  schema: z.ZodType;
  data: Record<string, unknown>;
  /** Scalar/array/enum fields whose removal or corruption must be rejected. */
  required: string[];
}

const cases: Case[] = [
  { name: 'userProfile', schema: userProfile, data: users.userProfile, required: ['id', 'email', 'displayName', 'role', 'createdAt', 'socialsPublic', 'socials'] },
  { name: 'authResponse', schema: authResponse, data: users.authResponse, required: ['user', 'accessToken', 'refreshToken'] },
  { name: 'authTokens', schema: authTokens, data: users.authTokens, required: ['accessToken', 'refreshToken'] },
  { name: 'userStats', schema: userStats, data: users.userStats, required: ['clubsJoined', 'quizzesTaken', 'quizWins', 'likesReceived', 'booksRead'] },
  { name: 'sessionStatus', schema: sessionStatus, data: users.sessionStatus, required: ['hasSession'] },
  { name: 'wsTicket', schema: wsTicket, data: users.wsTicket, required: ['ticket'] },
  { name: 'club', schema: club, data: clubs.club, required: ['id', 'name', 'description', 'coverUrl', 'organizerId', 'isPublic', 'memberCount', 'createdAt'] },
  { name: 'clubStats', schema: clubStats, data: clubs.clubStats, required: ['topActive', 'topWinners', 'recentAttendance', 'totalMembers', 'totalEvents', 'totalMessages', 'memberGrowth', 'eventFrequency', 'bannedUsersCount', 'upcomingEventsCount'] },
  { name: 'clubMember', schema: clubMember, data: clubs.clubMember, required: ['userId', 'displayName', 'avatarUrl', 'role', 'socialsPublic'] },
  { name: 'banRecord', schema: banRecord, data: clubs.banRecord, required: ['userId', 'clubId', 'bannedAt', 'duration', 'bannedBy'] },
  { name: 'joinRequest', schema: joinRequest, data: clubs.joinRequest, required: ['userId', 'displayName', 'status', 'source', 'createdAt'] },
  { name: 'myMembership', schema: myMembership, data: clubs.myMembership, required: ['isMember'] },
  { name: 'joinClubResponse', schema: joinClubResponse, data: clubs.joinClubResponse, required: ['status'] },
  { name: 'approveJoinRequestResponse', schema: approveJoinRequestResponse, data: clubs.approveJoinRequestResponse, required: ['memberCount'] },
  { name: 'clubEvent', schema: clubEvent, data: events.clubEvent, required: ['id', 'clubId', 'clubName', 'organizerId', 'title', 'date', 'city', 'status', 'attendeeCount', 'isAttending', 'address', 'lat', 'lng', 'durationMinutes'] },
  { name: 'attendEventResponse', schema: attendEventResponse, data: events.attendEventResponse, required: ['attendeeCount'] },
  { name: 'bookVoteRound', schema: bookVoteRound, data: votes.bookVoteRound, required: ['id', 'clubId', 'status', 'options', 'totalVotes', 'winnerId'] },
  { name: 'quiz', schema: quiz, data: quizzes.quiz, required: ['id', 'clubId', 'createdBy', 'title', 'description', 'isActive'] },
  { name: 'quizQuestion (organizer)', schema: quizQuestion, data: quizzes.questionOrganizer, required: ['id', 'quizId', 'question', 'options'] },
  { name: 'quizAttempt', schema: quizAttempt, data: quizzes.quizAttempt, required: ['id', 'quizId', 'userId', 'score', 'total', 'answers'] },
  { name: 'quizSession', schema: quizSession, data: quizzes.quizSession, required: ['id', 'quizId', 'eventId', 'startedBy', 'startedAt', 'closedAt', 'participantCount'] },
  { name: 'quizLeaderboard', schema: quizLeaderboard, data: quizzes.quizLeaderboard, required: ['entries'] },
  { name: 'randomizerSession', schema: randomizerSession, data: misc.randomizerSession, required: ['id', 'clubId', 'createdBy', 'purpose', 'candidates', 'result', 'createdAt'] },
  { name: 'submission', schema: submission, data: misc.submission, required: ['id', 'type', 'title', 'body', 'status', 'createdAt', 'updatedAt', 'likeCount', 'likedByMe'] },
  { name: 'chatRoom', schema: chatRoom, data: misc.chatRoom, required: ['id', 'name'] },
  { name: 'chatMessage', schema: chatMessage, data: misc.chatMessage, required: ['id', 'senderId', 'senderName', 'text', 'timestamp'] },
  { name: 'unreadCount', schema: unreadCount, data: misc.unreadCount, required: ['room_id', 'unread_count'] },
  { name: 'geocodeSuggestion', schema: geocodeSuggestion, data: misc.geocodeSuggestion, required: ['label'] },
  { name: 'walkingRoute', schema: walkingRoute, data: misc.walkingRoute, required: ['path'] },
  { name: 'mapsKeyConfig', schema: mapsKeyConfig, data: misc.mapsKeyConfig, required: ['mapsApiKey', 'mapsMapId'] },
  { name: 'uploadResult', schema: uploadResult, data: misc.uploadResult, required: ['url'] },
  { name: 'bookSuggestion', schema: bookSuggestion, data: misc.bookSuggestion, required: ['id', 'title', 'authors'] },
  { name: 'storeResult', schema: storeResult, data: misc.storeResult, required: ['name', 'url', 'found'] },
];

const without = (data: Record<string, unknown>, key: string) => Object.fromEntries(Object.entries(data).filter(([k]) => k !== key));

describe.each(cases)('fixture $name', ({ schema, data, required }) => {
  it('parses the backend-shaped payload', () => {
    expect(safeParse(schema, data).ok).toBe(true);
  });

  it.each(required)('rejects a payload missing %s', (key) => {
    expect(safeParse(schema, without(data, key)).ok).toBe(false);
  });

  it.each(required)('rejects a payload where %s has the wrong type', (key) => {
    const current = data[key];
    const wrong = typeof current === 'object' && current !== null && !Array.isArray(current) ? 'bogus' : { bogus: true };
    expect(safeParse(schema, { ...data, [key]: wrong }).ok).toBe(false);
  });

  it('rejects non-object payloads', () => {
    for (const bad of [null, undefined, 'x', 42, []]) expect(safeParse(schema, bad).ok).toBe(false);
  });
});

describe('unknown enum values', () => {
  it.each([
    ['joinClubResponse.status', joinClubResponse, clubs.joinClubResponse, { status: 'approved' }],
    ['myMembership.joinRequestStatus', myMembership, clubs.myMembership, { joinRequestStatus: 'approved' }],
    ['attendEventResponse.joinRequestStatus', attendEventResponse, events.attendEventResponse, { joinRequestStatus: 'rejected' }],
    ['submission.type', submission, misc.submission, { type: 'praise' }],
    ['submission.status', submission, misc.submission, { status: 'wontfix' }],
  ] as const)('%s', (_name, schema, data, patch) => {
    expect(safeParse(schema as z.ZodType, { ...data, ...patch }).ok).toBe(false);
  });
});

describe('tolerant response enums', () => {
  it.each([
    ['userProfile.role', userProfile, users.userProfile, { role: 'superuser' }, 'role', 'user'],
    ['club.status', club, clubs.club, { status: 'archived' }, 'status', 'active'],
    ['clubEvent.status', clubEvent, events.clubEvent, { status: 'postponed' }, 'status', 'scheduled'],
    ['clubMember.role', clubMember, clubs.clubMember, { role: 'owner' }, 'role', 'member'],
    ['bookVoteRound.status', bookVoteRound, votes.bookVoteRound, { status: 'pending' }, 'status', 'closed'],
    ['quiz.status', quiz, quizzes.quiz, { status: 'archived' }, 'status', 'draft'],
    ['banRecord.duration', banRecord, clubs.banRecord, { duration: '7' }, 'duration', 'permanent'],
  ] as const)('%s falls back instead of failing', (_name, schema, data, patch, field, expected) => {
    const result = safeParse(schema as z.ZodType, { ...data, ...patch });
    expect(result.ok).toBe(true);
    expect((result as { data: Record<string, unknown> }).data[field]).toBe(expected);
  });
});

describe('backend verification findings', () => {
  it('currentChampion is camelCase, matching ChampionInfo in app/schemas/clubs.py', () => {
    const parsed = parse(club, clubs.club);
    expect(parsed.currentChampion).toEqual({
      userId: '8b1f2c3e-6a41-4d55-9a2e-1c7d0f5b9e02',
      displayName: 'Taras',
      avatarUrl: null,
      wins: 1,
      eventTitle: 'Dune night',
    });
  });

  it('ignores the snake_case current_champion the Angular mapper reads (backend never sends it)', () => {
    const parsed = parse(club, { ...without(clubs.club, 'currentChampion'), current_champion: { user_id: 'x', display_name: 'y' } });
    expect(parsed.currentChampion).toBeUndefined();
    expect(parsed).not.toHaveProperty('current_champion');
  });

  it('accepts a champion of null and a minimal club with backend defaults', () => {
    expect(parse(club, { ...clubs.club, currentChampion: null }).currentChampion).toBeNull();
    const minimal = parse(club, clubs.clubMinimal);
    expect(minimal).toMatchObject({ status: 'active', tags: [], memberPreviews: [] });
  });

  it('join request uses createdAt; requestedAt is not accepted as a substitute', () => {
    expect(parse(joinRequest, clubs.joinRequest).createdAt).toBe('2026-09-11T08:15:00+00:00');
    const { createdAt } = clubs.joinRequest;
    expect(safeParse(joinRequest, { ...without(clubs.joinRequest, 'createdAt'), requestedAt: createdAt }).ok).toBe(false);
  });

  it('ban duration arrives as a string from the backend and becomes a number (or permanent)', () => {
    for (const [wire, expected] of [['1', 1], ['3', 3], ['5', 5], ['permanent', 'permanent']] as const) {
      expect(parse(banRecord, { ...clubs.banRecord, duration: wire }).duration).toBe(expected);
    }
    expect(parse(banRecord, clubs.banRecord).duration).toBe(3);
    expect(safeParse(banRecord, { ...clubs.banRecord, duration: 7 }).ok).toBe(false);
    expect(parse(banRecord, { ...clubs.banRecord, duration: '' }).duration).toBe('permanent');
  });

  it('chat unread count is snake_case, camelCase is rejected', () => {
    expect(parse(unreadCount, misc.unreadCount)).toEqual(misc.unreadCount);
    expect(safeParse(unreadCount, { roomId: 'r', unreadCount: 1 }).ok).toBe(false);
  });

  it('quiz correctIndex is nullish: hidden for participants, present for organizers', () => {
    expect(parse(quizQuestion, quizzes.questionOrganizer).correctIndex).toBe(0);
    expect(parse(quizQuestion, quizzes.questionParticipant).correctIndex).toBeNull();
    expect(parse(quizQuestion, without(quizzes.questionParticipant, 'correctIndex')).correctIndex).toBeUndefined();
    expect(safeParse(quizQuestion, { ...quizzes.questionParticipant, correctIndex: '1' }).ok).toBe(false);
  });

  it('store results keep the backend snake_case product_url', () => {
    expect(parse(storeResult, { ...misc.storeResult, found: true, product_url: 'https://x' }).product_url).toBe('https://x');
  });
});
