import {
  mapUserProfile,
  mapUserStats,
  mapClub,
  mapClubMember,
  mapBanRecord,
  mapEvent,
  ApiUserProfile,
  ApiUserStats,
  ApiClub,
  ApiClubMember,
  ApiBanRecord,
  ApiEvent,
} from './api-mappers';

const baseApiClub: ApiClub = {
  id: 'c1',
  name: 'Test Club',
  description: 'A club',
  coverUrl: null,
  organizerId: 'u1',
  isPublic: true,
  memberCount: 5,
  createdAt: '2024-01-01',
  city: 'Kyiv',
  nextMeetingDate: '2024-06-01',
  address: '123 Main St',
  lat: 50.4,
  lng: 30.5,
  theme: 'Fiction',
  currentBook: null,
  memberPreviews: ['Alice', 'Bob'],
  status: 'active',
  tags: ['fiction'],
  meetingDurationMinutes: 90,
  afterMeetingVenue: null,
};

describe('mapUserProfile', () => {
  const raw: ApiUserProfile = {
    id: 'u1',
    email: 'test@test.com',
    role: 'user',
    displayName: 'Test User',
    avatarUrl: 'http://avatar.url',
    createdAt: '2024-01-01',
  };

  it('maps basic fields', () => {
    const result = mapUserProfile(raw);
    expect(result.id).toBe('u1');
    expect(result.displayName).toBe('Test User');
    expect(result.role).toBe('user');
    expect(result.avatarUrl).toBe('http://avatar.url');
    expect(result.createdAt).toBe('2024-01-01');
  });

  it('sets socialsPublic to false when absent', () => {
    const result = mapUserProfile(raw);
    expect(result.socialsPublic).toBeFalse();
  });

  it('maps socials when present', () => {
    const result = mapUserProfile({
      ...raw,
      socials: { telegram: 'myuser', github: 'gh' },
      socialsPublic: true,
    });
    expect(result.socials?.telegram).toBe('myuser');
    expect(result.socials?.github).toBe('gh');
    expect(result.socialsPublic).toBeTrue();
  });

  it('maps all socials fields when all are provided', () => {
    const result = mapUserProfile({
      ...raw,
      socials: {
        telegram: 'tguser',
        instagram: 'iguser',
        twitter: 'twuser',
        linkedin: 'liuser',
        github: 'ghuser',
        goodreads: 'gruser',
      },
    });
    expect(result.socials?.telegram).toBe('tguser');
    expect(result.socials?.instagram).toBe('iguser');
    expect(result.socials?.twitter).toBe('twuser');
    expect(result.socials?.linkedin).toBe('liuser');
    expect(result.socials?.github).toBe('ghuser');
    expect(result.socials?.goodreads).toBe('gruser');
  });

  it('sets socials to undefined when null', () => {
    const result = mapUserProfile({ ...raw, socials: null });
    expect(result.socials).toBeUndefined();
  });
});

describe('mapUserStats', () => {
  it('maps all stats fields', () => {
    const raw: ApiUserStats = {
      clubsJoined: 3,
      quizzesTaken: 5,
      quizWins: 2,
      likesReceived: 10,
      booksRead: 7,
    };
    const result = mapUserStats(raw);
    expect(result.clubsJoined).toBe(3);
    expect(result.quizzesTaken).toBe(5);
    expect(result.quizWins).toBe(2);
    expect(result.likesReceived).toBe(10);
    expect(result.booksRead).toBe(7);
  });
});

describe('mapClub', () => {
  it('maps basic club fields', () => {
    const result = mapClub(baseApiClub);
    expect(result.id).toBe('c1');
    expect(result.name).toBe('Test Club');
    expect(result.isPublic).toBeTrue();
    expect(result.memberCount).toBe(5);
    expect(result.city).toBe('Kyiv');
    expect(result.tags).toEqual(['fiction']);
    expect(result.meetingDurationMinutes).toBe(90);
  });

  it('sets currentBook to null when currentBook is null', () => {
    const result = mapClub(baseApiClub);
    expect(result.currentBook).toBeNull();
  });

  it('maps currentBook when present', () => {
    const result = mapClub({ ...baseApiClub, currentBook: 'Kobzar' });
    expect(result.currentBook).toEqual({ title: 'Kobzar', author: '', description: '' });
  });

  it('defaults city to empty string when null', () => {
    const result = mapClub({ ...baseApiClub, city: null });
    expect(result.city).toBe('');
  });

  it('maps cancelledAt from cancelledAt', () => {
    const result = mapClub({ ...baseApiClub, cancelledAt: '2024-05-01' });
    expect(result.cancelledAt).toBe('2024-05-01');
  });

  it('sets cancelledAt to undefined when cancelledAt is null', () => {
    const result = mapClub({ ...baseApiClub, cancelledAt: null });
    expect(result.cancelledAt).toBeUndefined();
  });

  it('defaults memberPreviews to [] when null', () => {
    const result = mapClub({ ...baseApiClub, memberPreviews: null as unknown as string[] });
    expect(result.memberPreviews).toEqual([]);
  });

  it('defaults tags to [] when null', () => {
    const result = mapClub({ ...baseApiClub, tags: null as unknown as string[] });
    expect(result.tags).toEqual([]);
  });
});

describe('mapClubMember', () => {
  const raw: ApiClubMember = {
    userId: 'u2',
    displayName: 'Alice',
    avatarUrl: 'http://img',
    role: 'member',
  };

  it('maps basic member fields', () => {
    const result = mapClubMember(raw);
    expect(result.userId).toBe('u2');
    expect(result.displayName).toBe('Alice');
    expect(result.avatarUrl).toBe('http://img');
    expect(result.role).toBe('member');
    expect(result.socialsPublic).toBeFalse();
  });

  it('maps socials when present', () => {
    const result = mapClubMember({
      ...raw,
      socials: { instagram: 'alice_ig' },
      socialsPublic: true,
    });
    expect(result.socials?.instagram).toBe('alice_ig');
    expect(result.socialsPublic).toBeTrue();
  });

  it('sets socials to undefined when null', () => {
    const result = mapClubMember({ ...raw, socials: null });
    expect(result.socials).toBeUndefined();
  });

  it('maps all socials fields when all are provided', () => {
    const result = mapClubMember({
      ...raw,
      socials: {
        telegram: 'tg',
        instagram: 'ig',
        twitter: 'tw',
        linkedin: 'li',
        github: 'gh',
        goodreads: 'gr',
      },
    });
    expect(result.socials?.telegram).toBe('tg');
    expect(result.socials?.instagram).toBe('ig');
    expect(result.socials?.twitter).toBe('tw');
    expect(result.socials?.linkedin).toBe('li');
    expect(result.socials?.github).toBe('gh');
    expect(result.socials?.goodreads).toBe('gr');
  });
});

describe('mapBanRecord', () => {
  it('maps all ban fields', () => {
    const raw: ApiBanRecord = {
      userId: 'u3',
      clubId: 'c1',
      bannedAt: '2024-03-01',
      duration: 'permanent',
      bannedBy: 'u1',
    };
    const result = mapBanRecord(raw);
    expect(result.userId).toBe('u3');
    expect(result.clubId).toBe('c1');
    expect(result.bannedAt).toBe('2024-03-01');
    expect(result.duration).toBe('permanent');
    expect(result.bannedBy).toBe('u1');
  });
});

describe('mapEvent', () => {
  const baseApiEvent: ApiEvent = {
    id: 'e1',
    clubId: 'c1',
    clubName: 'Test Club',
    organizerId: 'u1',
    title: 'Test Event',
    description: 'A description',
    date: '2025-06-01T10:00:00',
    city: 'Kyiv',
    address: '123 Main St',
    lat: 50.4,
    lng: 30.5,
    status: 'scheduled',
    cancelledAt: null,
    theme: 'Fiction',
    tags: ['tag1', 'tag2'],
    durationMinutes: 90,
    afterMeetingVenue: null,
    attendeeCount: 5,
    isAttending: false,
  };

  it('maps all fields from a full ApiEvent object', () => {
    const result = mapEvent(baseApiEvent);
    expect(result.id).toBe('e1');
    expect(result.clubId).toBe('c1');
    expect(result.clubName).toBe('Test Club');
    expect(result.organizerId).toBe('u1');
    expect(result.title).toBe('Test Event');
    expect(result.description).toBe('A description');
    expect(result.date).toBe('2025-06-01T10:00:00');
    expect(result.city).toBe('Kyiv');
    expect(result.address).toBe('123 Main St');
    expect(result.lat).toBe(50.4);
    expect(result.lng).toBe(30.5);
    expect(result.status).toBe('scheduled');
    expect(result.theme).toBe('Fiction');
    expect(result.tags).toEqual(['tag1', 'tag2']);
    expect(result.durationMinutes).toBe(90);
    expect(result.afterMeetingVenue).toBeNull();
    expect(result.attendeeCount).toBe(5);
    expect(result.isAttending).toBeFalse();
  });

  it('sets cancelledAt to undefined when the raw value is null', () => {
    const result = mapEvent({ ...baseApiEvent, cancelledAt: null });
    expect(result.cancelledAt).toBeUndefined();
  });

  it('preserves cancelledAt string value when set', () => {
    const result = mapEvent({ ...baseApiEvent, cancelledAt: '2025-07-01T00:00:00' });
    expect(result.cancelledAt).toBe('2025-07-01T00:00:00');
  });

  it('defaults tags to [] when null', () => {
    const result = mapEvent({ ...baseApiEvent, tags: null as unknown as string[] });
    expect(result.tags).toEqual([]);
  });

  it('maps coverUrl when present', () => {
    const result = mapEvent({ ...baseApiEvent, coverUrl: 'https://cover.jpg' });
    expect(result.coverUrl).toBe('https://cover.jpg');
  });

  it('defaults coverUrl to null when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.coverUrl).toBeNull();
  });

  it('maps bookTitle when present', () => {
    const result = mapEvent({ ...baseApiEvent, bookTitle: 'Kobzar' });
    expect(result.bookTitle).toBe('Kobzar');
  });

  it('defaults bookTitle to null when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.bookTitle).toBeNull();
  });

  it('maps quizId when present', () => {
    const result = mapEvent({ ...baseApiEvent, quizId: 'q1' });
    expect(result.quizId).toBe('q1');
  });

  it('defaults quizId to null when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.quizId).toBeNull();
  });

  it('maps googleBookId when present', () => {
    const result = mapEvent({ ...baseApiEvent, googleBookId: 'goog123' });
    expect(result.googleBookId).toBe('goog123');
  });

  it('defaults googleBookId to null when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.googleBookId).toBeNull();
  });

  it('maps hasWinner to true when set', () => {
    const result = mapEvent({ ...baseApiEvent, hasWinner: true });
    expect(result.hasWinner).toBeTrue();
  });

  it('defaults hasWinner to false when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.hasWinner).toBeFalse();
  });

  it('maps winnerId when present', () => {
    const result = mapEvent({ ...baseApiEvent, winnerId: 'u5' });
    expect(result.winnerId).toBe('u5');
  });

  it('defaults winnerId to null when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.winnerId).toBeNull();
  });

  it('maps winnerName when present', () => {
    const result = mapEvent({ ...baseApiEvent, winnerName: 'Alice' });
    expect(result.winnerName).toBe('Alice');
  });

  it('defaults winnerName to null when absent', () => {
    const result = mapEvent({ ...baseApiEvent });
    expect(result.winnerName).toBeNull();
  });
});

describe('mapClub — currentChampion branch', () => {
  const baseApiClub: ApiClub = {
    id: 'c1',
    name: 'Test Club',
    description: null,
    coverUrl: null,
    organizerId: 'u1',
    isPublic: true,
    memberCount: 3,
    createdAt: '2024-01-01',
    city: 'Kyiv',
    nextMeetingDate: null,
    address: null,
    lat: null,
    lng: null,
    theme: null,
    currentBook: null,
    memberPreviews: [],
    status: 'active',
    tags: [],
    meetingDurationMinutes: null,
    afterMeetingVenue: null,
  };

  it('sets currentChampion to null when absent', () => {
    const result = mapClub({ ...baseApiClub, current_champion: null });
    expect(result.currentChampion).toBeNull();
  });

  it('maps currentChampion when present', () => {
    const result = mapClub({
      ...baseApiClub,
      current_champion: {
        user_id: 'u2',
        display_name: 'Bob',
        event_title: 'Summer Quiz',
        event_date: '2025-07-01',
      },
    });
    expect(result.currentChampion).toEqual({
      userId: 'u2',
      displayName: 'Bob',
      eventTitle: 'Summer Quiz',
      eventDate: '2025-07-01',
    });
  });
});
