import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ClubService } from './club.service';
import { AuthService } from '../auth/auth.service';

describe('ClubService', () => {
  let service: ClubService;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    jasmine.clock().install();
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue({ id: 'user-1', displayName: 'Test User', role: 'organizer' })
    });
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ClubService,
        { provide: AuthService, useValue: authSpy },
      ]
    });
    service = TestBed.inject(ClubService);
    // Reset bans for each test to avoid cross-test pollution
    (service as any)._bans.set({});
  });

  afterEach(() => {
    jasmine.clock().uninstall();
    (service as any)._bans.set({});
  });

  it('getBans returns [] for club with no bans', () => {
    expect(service.getBans('club-1')).toEqual([]);
  });

  it('isBanned returns false for user not banned', () => {
    expect(service.isBanned('club-1', 'user-99')).toBeFalse();
  });

  it('banMember adds ban record', () => {
    service.banMember('club-1', 'user-2', 1);
    const bans = service.getBans('club-1');
    expect(bans.length).toBe(1);
    expect(bans[0].userId).toBe('user-2');
    expect(bans[0].clubId).toBe('club-1');
    expect(bans[0].duration).toBe(1);
    expect(bans[0].bannedBy).toBe('user-1');
  });

  it('banMember with permanent duration', () => {
    service.banMember('club-1', 'user-2', 'permanent');
    const bans = service.getBans('club-1');
    expect(bans[0].duration).toBe('permanent');
  });

  it('isBanned returns true after banning', () => {
    service.banMember('club-1', 'user-2', 1);
    expect(service.isBanned('club-1', 'user-2')).toBeTrue();
  });

  it('isBanned returns false for other user', () => {
    service.banMember('club-1', 'user-2', 1);
    expect(service.isBanned('club-1', 'user-99')).toBeFalse();
  });

  it('banMember does nothing if not authenticated', () => {
    authSpy.currentUser.and.returnValue(null);
    service.banMember('club-1', 'user-2', 1);
    expect(service.getBans('club-1')).toEqual([]);
  });

  it('joinClub throws if user is banned', async () => {
    service.banMember('club-1', 'user-1', 1);
    await expectAsync(service.joinClub('club-1')).toBeRejectedWithError('You are banned from this club');
  });

  it('createClub returns club with tags and duration', async () => {
    const club = await service.createClub({
      name: 'Test', description: 'Desc', isPublic: true, city: 'Kyiv', tags: ['tag1', 'tag2'], meetingDurationMinutes: 60, afterMeetingVenue: { name: 'Cafe', address: 'Main St', description: 'desc' } });
    expect(club.tags).toEqual(['tag1', 'tag2']);
    expect(club.meetingDurationMinutes).toBe(60);
    expect(club.afterMeetingVenue).toEqual(jasmine.objectContaining({ name: 'Cafe' }));
  });

  it('createClub throws if not authenticated', async () => {
    authSpy.currentUser.and.returnValue(null);
    await expectAsync(service.createClub({ name: 'Test', description: '', isPublic: true })).toBeRejectedWithError('Must be authenticated to create a club');
  });
});