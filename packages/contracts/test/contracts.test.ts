import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ContractParseError,
  apiErrorBody,
  authResponse,
  banRecord,
  bookVoteRound,
  chatMessage,
  createSubmissionForm,
  displayNameForm,
  loginForm,
  registerForm,
  sessionResponse,
  chatWsServerMessage,
  club,
  clubEvent,
  clubOrStub,
  clubStub,
  clubMember,
  clubStats,
  geocodeSuggestion,
  isClubStub,
  mapsKeyConfig,
  parse,
  quiz,
  quizLeaderboard,
  quizQuestion,
  randomizerSession,
  registerRequest,
  safeParse,
  submission,
  unreadCount,
  userProfile,
} from '../src';

const user = {
  id: 'u1',
  email: 'a@b.c',
  displayName: 'Ann',
  role: 'user',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00+00:00',
  socialsPublic: false,
  socials: { telegram: null, instagram: 'ann', twitter: null, linkedin: null, github: null, goodreads: null },
};

const clubPayload = {
  id: 'c1',
  name: 'Readers',
  description: null,
  coverUrl: null,
  organizerId: 'u1',
  isPublic: true,
  memberCount: 3,
  createdAt: '2026-01-01T00:00:00+00:00',
  currentBook: 'Dune',
  currentChampion: { userId: 'u2', displayName: 'Bob', wins: 2 },
};

const eventPayload = {
  id: 'e1',
  clubId: 'c1',
  clubName: 'Readers',
  organizerId: 'u1',
  title: 'Meetup',
  description: null,
  date: '2026-10-01T18:00:00+00:00',
  city: 'Kyiv',
  address: null,
  lat: 50.4,
  lng: 30.5,
  status: 'scheduled',
  cancelledAt: null,
  theme: null,
  durationMinutes: null,
  afterMeetingVenue: { name: 'Cafe', address: 'Main st', lat: null },
  attendeeCount: 1,
  isAttending: false,
};

describe('contracts parse backend payloads', () => {
  it('user profile and auth response', () => {
    expect(parse(userProfile, user).socials.instagram).toBe('ann');
    expect(parse(authResponse, { user, accessToken: 'a', refreshToken: 'r' }).accessToken).toBe('a');
  });

  it('club applies list defaults and keeps the raw currentBook string', () => {
    const parsed = parse(club, clubPayload);
    expect(parsed.tags).toEqual([]);
    expect(parsed.memberPreviews).toEqual([]);
    expect(parsed.status).toBe('active');
    expect(parsed.currentBook).toBe('Dune');
    expect(parsed.currentChampion?.wins).toBe(2);
  });

  it('event applies defaults', () => {
    const parsed = parse(clubEvent, eventPayload);
    expect(parsed.tags).toEqual([]);
    expect(parsed.hasWinner).toBe(false);
  });

  it('club member allows hidden socials', () => {
    const member = { userId: 'u', displayName: 'A', avatarUrl: null, role: 'member', socials: null, socialsPublic: false };
    expect(parse(clubMember, member).socials).toBeNull();
  });

  it('ban duration accepts backend string form and normalises numbers', () => {
    const base = { userId: 'u', clubId: 'c', bannedAt: 'x', bannedBy: 'o' };
    expect(parse(banRecord, { ...base, duration: '3' }).duration).toBe(3);
    expect(parse(banRecord, { ...base, duration: 5 }).duration).toBe(5);
    expect(parse(banRecord, { ...base, duration: 'permanent' }).duration).toBe('permanent');
    expect(parse(banRecord, { ...base, duration: '7' }).duration).toBe('permanent');
    expect(parse(banRecord, { ...base, duration: 'forever' }).duration).toBe('permanent');
  });

  it('book vote round, quiz, randomizer, support, chat, geocode, config', () => {
    const round = {
      id: 'r',
      clubId: 'c',
      status: 'open',
      options: [{ id: 'o', title: 'T', author: '', votes: 1, hasVoted: true }],
      totalVotes: 1,
      winnerId: null,
    };
    expect(parse(bookVoteRound, round).options).toHaveLength(1);
    expect(parse(quizQuestion, { id: 'q', quizId: 'z', question: '?', options: ['a', 'b'] }).correctIndex).toBeUndefined();
    const entry = { rank: 1, userId: 'u', displayName: 'A', avatarUrl: null, score: 1, totalQuestions: 2, hasAttempted: true };
    expect(parse(quizLeaderboard, { entries: [entry] }).entries).toHaveLength(1);
    const session = {
      id: 'r',
      clubId: 'c',
      createdBy: 'u',
      purpose: 'p',
      candidates: [{ userId: 'u', displayName: 'A' }],
      result: null,
      createdAt: 'x',
    };
    expect(parse(randomizerSession, session).result).toBeNull();
    const sub = {
      id: 's',
      authorId: null,
      type: 'complaint',
      title: 't',
      body: 'b',
      status: 'open',
      createdAt: 'x',
      updatedAt: 'x',
      likeCount: 0,
      likedByMe: false,
    };
    expect(parse(submission, sub).type).toBe('complaint');
    expect(parse(chatMessage, { id: 'm', senderId: 'u', senderName: 'A', text: 't', timestamp: 'x' }).isSystem).toBe(false);
    expect(parse(unreadCount, { room_id: 'r', unread_count: 2 }).unread_count).toBe(2);
    expect(parse(geocodeSuggestion, { label: 'Kyiv', place_id: 'p' }).place_id).toBe('p');
    expect(parse(mapsKeyConfig, { mapsApiKey: 'k', mapsMapId: 'm' }).mapsMapId).toBe('m');
  });

  it('club stats and ws messages', () => {
    const stats = {
      topActive: [],
      topWinners: [],
      recentAttendance: [],
      totalMembers: 1,
      totalEvents: 1,
      totalMessages: 1,
      memberGrowth: [{ month: '2026-01', count: 1 }],
      eventFrequency: [],
      bannedUsersCount: 0,
      upcomingEventsCount: 0,
    };
    expect(parse(clubStats, stats).totalMembers).toBe(1);
    expect(parse(chatWsServerMessage, { type: 'presence', payload: { userId: 'u', status: 'online' } }).type).toBe('presence');
  });

  it('api error body covers string, object and validation-array details', () => {
    expect(parse(apiErrorBody, { detail: 'x' }).detail).toBe('x');
    expect(parse(apiErrorBody, { detail: { error: 'x', code: 'C' } }).detail).toEqual({ error: 'x', code: 'C' });
    expect(parse(apiErrorBody, { detail: [{ msg: 'bad', loc: ['body'] }] }).detail).toHaveLength(1);
  });
});

describe('contracts reject malformed payloads', () => {
  it('throws ContractParseError with a label', () => {
    expect(() => parse(userProfile, { id: 1 }, 'GET /users/me')).toThrow(ContractParseError);
    expect(() => parse(userProfile, { id: 1 }, 'GET /users/me')).toThrow(/GET \/users\/me/);
  });

  it('rejects unknown enum values and wrong types', () => {
    expect(safeParse(clubEvent, { ...eventPayload, status: 7 }).ok).toBe(false);
    expect(safeParse(club, { ...clubPayload, memberCount: '3' }).ok).toBe(false);
    expect(safeParse(userProfile, { ...user, role: undefined }).ok).toBe(false);
  });
});

describe('tolerant response enums', () => {
  it('an unknown club status does not break list parsing', () => {
    const list = parse(z.array(club), [{ ...clubPayload, status: 'archived' }, { ...clubPayload, id: 'd', status: 'paused' }]);
    expect(list.map((c) => c.status)).toEqual(['active', 'paused']);
  });

  it('falls back for quiz, event, role and vote round statuses', () => {
    expect(parse(quiz, { id: 'q', clubId: 'c', createdBy: 'u', title: 't', description: null, isActive: true, status: 'archived' }).status).toBe('draft');
    expect(parse(clubMember, { userId: 'u', displayName: 'A', avatarUrl: null, role: 'moderator', socials: null, socialsPublic: false }).role).toBe('member');
    expect(parse(bookVoteRound, { id: 'r', clubId: 'c', status: 'paused', options: [], totalVotes: 0, winnerId: null }).status).toBe('closed');
    expect(parse(userProfile, { id: 'u', email: 'e', displayName: 'A', role: 'superuser', createdAt: 'x', socialsPublic: false, socials: {} }).role).toBe('user');
    expect(parse(clubEvent, { ...eventPayload, status: 'postponed' }).status).toBe('scheduled');
  });

  it('keeps strict enums for requests', () => {
    expect(safeParse(registerRequest, { email: 'e', password: 'p', displayName: 'n', role: 'superuser' }).ok).toBe(false);
  });
});

describe('private club stub', () => {
  const stub = { id: 'c1', name: 'Secret', isPublic: false, memberCount: 4 };

  it('parses exactly the four stub keys and leaves the full schema strict about the rest', () => {
    expect(parse(clubStub, stub)).toEqual(stub);
    expect(safeParse(club, stub).ok).toBe(false);
  });

  it('tells a stub from a full club, including a full private club', () => {
    const parsedStub = parse(clubOrStub, stub);
    expect(isClubStub(parsedStub)).toBe(true);
    const full = parse(clubOrStub, { ...clubPayload, isPublic: false });
    expect(isClubStub(full)).toBe(false);
    expect(full).toMatchObject({ organizerId: clubPayload.organizerId, isPublic: false });
    expect(isClubStub(parse(clubOrStub, clubPayload))).toBe(false);
  });

  it('does not let a malformed full club through as a stub, nor a public stub', () => {
    const incomplete = { ...clubPayload, isPublic: false, description: undefined };
    expect(safeParse(clubOrStub, incomplete).ok).toBe(false);
    expect(safeParse(clubOrStub, { ...stub, isPublic: true }).ok).toBe(false);
    expect(safeParse(clubOrStub, { ...stub, memberCount: 'many' }).ok).toBe(false);
    expect(safeParse(clubOrStub, { ...stub, organizerId: null }).ok).toBe(false);
  });
});

describe('form schemas', () => {
  const first = (r: { success: boolean; error?: { issues: { message: string }[] } }) => r.error?.issues[0]?.message;

  it('displayNameForm reports the first failing rule', () => {
    expect(first(displayNameForm.safeParse({ displayName: '' }))).toBe('PROFILE.display_name_required');
    expect(first(displayNameForm.safeParse({ displayName: 'a' }))).toBe('PROFILE.display_name_min');
    expect(first(displayNameForm.safeParse({ displayName: 'a'.repeat(51) }))).toBe('SECURITY.invalid_display_name');
    expect(first(displayNameForm.safeParse({ displayName: '<script>' }))).toBe('SECURITY.invalid_display_name');
    expect(first(displayNameForm.safeParse({ displayName: 'a&b' }))).toBe('SECURITY.invalid_display_name');
  });

  it('displayNameForm trims, so whitespace-only fails like empty and padding is dropped', () => {
    expect(first(displayNameForm.safeParse({ displayName: '   ' }))).toBe('PROFILE.display_name_required');
    expect(displayNameForm.parse({ displayName: '  Ada  ' })).toEqual({ displayName: 'Ada' });
    expect(first(displayNameForm.safeParse({ displayName: ' a ' }))).toBe('PROFILE.display_name_min');
  });

  it('displayNameForm accepts latin, cyrillic, digits and . \' - _', () => {
    for (const displayName of ['Ada Lovelace', 'Олена Пчілка', "O'Brien-Smith_2.0", 'ab', 'a'.repeat(50)]) {
      expect(displayNameForm.safeParse({ displayName }).success).toBe(true);
    }
  });

  it('loginForm reports required, email and minlength keys', () => {
    expect(first(loginForm.safeParse({ email: '', password: 'longenough' }))).toBe('FORM_ERRORS.required');
    expect(first(loginForm.safeParse({ email: 'nope', password: 'longenough' }))).toBe('FORM_ERRORS.email');
    expect(first(loginForm.safeParse({ email: 'a@b.co', password: '' }))).toBe('FORM_ERRORS.required');
    expect(first(loginForm.safeParse({ email: 'a@b.co', password: 'short' }))).toBe('FORM_ERRORS.minlength');
    expect(loginForm.safeParse({ email: 'a@b.co', password: 'longenough' }).success).toBe(true);
  });

  it('registerForm keeps the Angular keys and flags a mismatch on confirmPassword', () => {
    const base = { displayName: 'Ada', email: 'a@b.co', password: 'longenough', confirmPassword: 'longenough', role: 'user' } as const;
    const issue = (patch: object) => registerForm.safeParse({ ...base, ...patch }).error?.issues[0];
    expect(registerForm.safeParse(base).success).toBe(true);
    expect(issue({ displayName: '' })?.message).toBe('FORM_ERRORS.required');
    expect(issue({ displayName: 'a' })?.message).toBe('FORM_ERRORS.minlength');
    expect(issue({ displayName: '<b>' })?.message).toBe('SECURITY.invalid_display_name');
    expect(issue({ displayName: 'a'.repeat(51) })?.message).toBe('SECURITY.invalid_display_name');
    expect(issue({ confirmPassword: '' })?.message).toBe('FORM_ERRORS.required');
    expect(issue({ confirmPassword: 'other-pass' })).toMatchObject({ path: ['confirmPassword'], message: 'AUTH.passwords_no_match' });
    expect(issue({ role: 'admin' })?.path).toEqual(['role']);
  });

  it('registerForm still reports the mismatch next to another field error', () => {
    const paths = registerForm.safeParse({ displayName: '', email: 'a@b.co', password: 'longenough', confirmPassword: 'x', role: 'user' }).error?.issues.map((i) => i.path[0]);
    expect(paths).toContain('displayName');
    expect(paths).toContain('confirmPassword');
  });

  it('sessionResponse keeps the user and drops token fields', () => {
    const { id } = user;
    expect(sessionResponse.parse({ accessToken: "a", refreshToken: "r", user })).toEqual({ user: expect.objectContaining({ id }) });
    expect(sessionResponse.parse({ user })).not.toHaveProperty('accessToken');
  });

  it('createSubmissionForm applies the form limits and maps them to SUPPORT keys', () => {
    const base = { type: 'comment', title: 'Hello', body: 'long enough body' } as const;
    expect(createSubmissionForm.safeParse(base).success).toBe(true);
    expect(first(createSubmissionForm.safeParse({ ...base, title: '' }))).toBe('SUPPORT.title_required');
    expect(first(createSubmissionForm.safeParse({ ...base, title: 'ab' }))).toBe('SUPPORT.title_min');
    expect(first(createSubmissionForm.safeParse({ ...base, title: 'a'.repeat(121) }))).toBe('SUPPORT.title_max');
    expect(first(createSubmissionForm.safeParse({ ...base, body: '' }))).toBe('SUPPORT.body_required');
    expect(first(createSubmissionForm.safeParse({ ...base, body: 'short' }))).toBe('SUPPORT.body_min');
    expect(first(createSubmissionForm.safeParse({ ...base, body: 'a'.repeat(2001) }))).toBe('SUPPORT.body_max');
    expect(createSubmissionForm.safeParse({ ...base, type: 'bug' }).success).toBe(false);
  });
});
