import {
  mapUserProfile,
  mapUserStats,
  mapClub,
  mapClubMember,
  mapBanRecord,
  ApiUserProfile,
  ApiUserStats,
  ApiClub,
  ApiClubMember,
  ApiBanRecord,
} from './api-mappers';

const baseApiClub: ApiClub = {
  id: 'c1',
  name: 'Test Club',
  description: 'A club',
  cover_url: null,
  organizer_id: 'u1',
  is_public: true,
  member_count: 5,
  created_at: '2024-01-01',
  city: 'Kyiv',
  next_meeting_date: '2024-06-01',
  address: '123 Main St',
  lat: 50.4,
  lng: 30.5,
  theme: 'Fiction',
  current_book: null,
  member_previews: ['Alice', 'Bob'],
  status: 'active',
  tags: ['fiction'],
  meeting_duration_minutes: 90,
  after_meeting_venue: null,
};

describe('mapUserProfile', () => {
  const raw: ApiUserProfile = {
    id: 'u1',
    email: 'test@test.com',
    role: 'user',
    display_name: 'Test User',
    avatar_url: 'http://avatar.url',
    created_at: '2024-01-01',
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
      socials_public: true,
    });
    expect(result.socials?.telegram).toBe('myuser');
    expect(result.socials?.github).toBe('gh');
    expect(result.socialsPublic).toBeTrue();
  });

  it('sets socials to undefined when null', () => {
    const result = mapUserProfile({ ...raw, socials: null });
    expect(result.socials).toBeUndefined();
  });
});

describe('mapUserStats', () => {
  it('maps clubs_joined and quizzes_taken', () => {
    const raw: ApiUserStats = {
      clubs_joined: 3,
      clubs_organized: 1,
      meetings_attended: 10,
      quizzes_taken: 5,
    };
    const result = mapUserStats(raw);
    expect(result.clubsJoined).toBe(3);
    expect(result.quizzesTaken).toBe(5);
    expect(result.quizWins).toBe(0);
    expect(result.likesReceived).toBe(0);
    expect(result.booksRead).toBe(0);
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

  it('sets currentBook to null when current_book is null', () => {
    const result = mapClub(baseApiClub);
    expect(result.currentBook).toBeNull();
  });

  it('maps current_book when present', () => {
    const result = mapClub({ ...baseApiClub, current_book: 'Kobzar' });
    expect(result.currentBook).toEqual({ title: 'Kobzar', author: '', description: '' });
  });

  it('defaults city to empty string when null', () => {
    const result = mapClub({ ...baseApiClub, city: null });
    expect(result.city).toBe('');
  });

  it('maps cancelledAt from cancelled_at', () => {
    const result = mapClub({ ...baseApiClub, cancelled_at: '2024-05-01' });
    expect(result.cancelledAt).toBe('2024-05-01');
  });

  it('sets cancelledAt to undefined when cancelled_at is null', () => {
    const result = mapClub({ ...baseApiClub, cancelled_at: null });
    expect(result.cancelledAt).toBeUndefined();
  });
});

describe('mapClubMember', () => {
  const raw: ApiClubMember = {
    user_id: 'u2',
    display_name: 'Alice',
    avatar_url: 'http://img',
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
      socials_public: true,
    });
    expect(result.socials?.instagram).toBe('alice_ig');
    expect(result.socialsPublic).toBeTrue();
  });

  it('sets socials to undefined when null', () => {
    const result = mapClubMember({ ...raw, socials: null });
    expect(result.socials).toBeUndefined();
  });
});

describe('mapBanRecord', () => {
  it('maps all ban fields', () => {
    const raw: ApiBanRecord = {
      user_id: 'u3',
      club_id: 'c1',
      banned_at: '2024-03-01',
      duration: 'permanent',
      banned_by: 'u1',
    };
    const result = mapBanRecord(raw);
    expect(result.userId).toBe('u3');
    expect(result.clubId).toBe('c1');
    expect(result.bannedAt).toBe('2024-03-01');
    expect(result.duration).toBe('permanent');
    expect(result.bannedBy).toBe('u1');
  });
});
