import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubManageComponent } from './club-manage.component';
import { ClubService } from '../../../core/services/club.service';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, ClubStats } from '../../../core/models/club.model';

function makeClub(overrides: Partial<Club> = {}): Club {
  return {
    id: 'club-1', name: 'Test Club', description: null, coverUrl: null,
    organizerId: 'u1', isPublic: true, memberCount: 2, createdAt: '2024-01-01',
    city: 'Kyiv', nextMeetingDate: null, address: null, lat: null, lng: null,
    theme: null, currentBook: null, memberPreviews: [], status: 'active',
    tags: [], meetingDurationMinutes: null, afterMeetingVenue: null,
    currentChampion: null, ...overrides,
  } as Club;
}

function makeMember(userId: string, role: 'member' | 'organizer' = 'member'): ClubMemberDetail {
  return {
    userId, displayName: `User ${userId}`, avatarUrl: null, role,
    socials: {}, socialsPublic: false,
  } as ClubMemberDetail;
}

describe('ClubManageComponent', () => {
  let clubServiceSpy: {
    getClubById: ReturnType<typeof vi.fn>;
    getClubStats: ReturnType<typeof vi.fn>;
    getClubMembers: ReturnType<typeof vi.fn>;
    getBans: ReturnType<typeof vi.fn>;
    getJoinRequests: ReturnType<typeof vi.fn>;
    kickMember: ReturnType<typeof vi.fn>;
    banMember: ReturnType<typeof vi.fn>;
    unbanMember: ReturnType<typeof vi.fn>;
    updateMemberRole: ReturnType<typeof vi.fn>;
    approveJoinRequest: ReturnType<typeof vi.fn>;
    rejectJoinRequest: ReturnType<typeof vi.fn>;
    pauseClub: ReturnType<typeof vi.fn>;
    cancelClub: ReturnType<typeof vi.fn>;
    rescheduleMeeting: ReturnType<typeof vi.fn>;
    deleteClub: ReturnType<typeof vi.fn>;
  };
  let chatServiceSpy: { createRoom: ReturnType<typeof vi.fn>; openAndFocusRoom: ReturnType<typeof vi.fn> };
  let authSpy: { currentUser: ReturnType<typeof vi.fn> };
  let router: Router;
  let component: ClubManageComponent;

  async function setup(clubId = 'club-1') {
    await TestBed.configureTestingModule({
      imports: [ClubManageComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ClubService, useValue: clubServiceSpy },
        { provide: ChatService, useValue: chatServiceSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ClubManageComponent);
    fixture.componentRef.setInput('id', clubId);
    component = fixture.componentInstance;
    TestBed.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    return { fixture };
  }

  beforeEach(() => {
    clubServiceSpy = {
      getClubById: vi.fn().mockResolvedValue(makeClub()),
      getClubStats: vi.fn().mockResolvedValue({ memberGrowth: [], eventFrequency: [] } as unknown as ClubStats),
      getClubMembers: vi.fn().mockResolvedValue([makeMember('u1', 'organizer'), makeMember('u2')]),
      getBans: vi.fn().mockResolvedValue([]),
      getJoinRequests: vi.fn().mockResolvedValue([]),
      kickMember: vi.fn().mockResolvedValue(undefined),
      banMember: vi.fn().mockResolvedValue(undefined),
      unbanMember: vi.fn().mockResolvedValue(undefined),
      updateMemberRole: vi.fn().mockResolvedValue(undefined),
      approveJoinRequest: vi.fn().mockResolvedValue(undefined),
      rejectJoinRequest: vi.fn().mockResolvedValue(undefined),
      pauseClub: vi.fn().mockResolvedValue(undefined),
      cancelClub: vi.fn().mockResolvedValue(undefined),
      rescheduleMeeting: vi.fn().mockResolvedValue(undefined),
      deleteClub: vi.fn().mockResolvedValue(undefined),
    };
    chatServiceSpy = {
      createRoom: vi.fn().mockResolvedValue({ id: 'room-1', name: 'General', clubId: 'club-1' }),
      openAndFocusRoom: vi.fn(),
    };
    authSpy = { currentUser: vi.fn().mockReturnValue({ id: 'u1' }) };
  });

  it('loads club, stats, members, bans, and join requests on init', async () => {
    await setup();
    expect(component.club()?.id).toBe('club-1');
    expect(component.members().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('marks the club missing when getClubById resolves null', async () => {
    clubServiceSpy.getClubById.mockResolvedValue(null);
    await setup();
    expect(component.isClubMissing()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  describe('handleKick', () => {
    it('removes the member optimistically and calls kickMember', async () => {
      await setup();
      await component.handleKick('u2');
      expect(clubServiceSpy.kickMember).toHaveBeenCalledWith('club-1', 'u2');
      expect(component.members().some(m => m.userId === 'u2')).toBe(false);
    });

    it('rolls back on failure', async () => {
      await setup();
      clubServiceSpy.kickMember.mockRejectedValue(new Error('fail'));
      await component.handleKick('u2');
      expect(component.members().some(m => m.userId === 'u2')).toBe(true);
    });
  });

  describe('handleBan', () => {
    it('removes the member and refreshes bans', async () => {
      await setup();
      clubServiceSpy.getBans.mockResolvedValue([{ userId: 'u2' } as BanRecord]);
      await component.handleBan({ userId: 'u2', duration: '1d' as never });
      expect(clubServiceSpy.banMember).toHaveBeenCalledWith('club-1', 'u2', '1d');
      expect(component.members().some(m => m.userId === 'u2')).toBe(false);
      await Promise.resolve();
      expect(component.bans().length).toBe(1);
    });
  });

  describe('handlePromote / handleDemote', () => {
    it('promotes a member to organizer', async () => {
      await setup();
      await component.handlePromote('u2');
      expect(clubServiceSpy.updateMemberRole).toHaveBeenCalledWith('club-1', 'u2', 'organizer');
      expect(component.members().find(m => m.userId === 'u2')?.role).toBe('organizer');
    });

    it('demotes an organizer to member', async () => {
      await setup();
      await component.handleDemote('u1');
      expect(clubServiceSpy.updateMemberRole).toHaveBeenCalledWith('club-1', 'u1', 'member');
      expect(component.members().find(m => m.userId === 'u1')?.role).toBe('member');
    });
  });

  describe('handleUnban', () => {
    it('removes the ban optimistically', async () => {
      clubServiceSpy.getBans.mockResolvedValue([{ userId: 'u3' } as BanRecord]);
      await setup();
      await component.handleUnban('u3');
      expect(clubServiceSpy.unbanMember).toHaveBeenCalledWith('club-1', 'u3');
      expect(component.bans().length).toBe(0);
    });

    it('rolls back the ban list on failure', async () => {
      clubServiceSpy.getBans.mockResolvedValue([{ userId: 'u3' } as BanRecord]);
      await setup();
      clubServiceSpy.unbanMember.mockRejectedValue(new Error('fail'));
      await component.handleUnban('u3');
      expect(component.bans().length).toBe(1);
    });
  });

  describe('join requests', () => {
    it('approves a request and refreshes members', async () => {
      clubServiceSpy.getJoinRequests.mockResolvedValue([{ userId: 'u9' } as never]);
      await setup();
      await component.onApproveJoinRequest('u9');
      expect(clubServiceSpy.approveJoinRequest).toHaveBeenCalledWith('club-1', 'u9');
      expect(component.joinRequests().length).toBe(0);
    });

    it('rejects a request', async () => {
      clubServiceSpy.getJoinRequests.mockResolvedValue([{ userId: 'u9' } as never]);
      await setup();
      await component.onRejectJoinRequest('u9');
      expect(clubServiceSpy.rejectJoinRequest).toHaveBeenCalledWith('club-1', 'u9');
      expect(component.joinRequests().length).toBe(0);
    });
  });

  describe('createChatRoom', () => {
    it('does nothing when the name is blank', async () => {
      await setup();
      component.newRoomName.set('   ');
      await component.createChatRoom();
      expect(chatServiceSpy.createRoom).not.toHaveBeenCalled();
    });

    it('creates the room, clears the input, and opens it', async () => {
      await setup();
      component.newRoomName.set('General');
      await component.createChatRoom();
      expect(chatServiceSpy.createRoom).toHaveBeenCalledWith('club-1', 'General');
      expect(component.newRoomName()).toBe('');
      expect(chatServiceSpy.openAndFocusRoom).toHaveBeenCalledWith({ id: 'room-1', name: 'General', clubId: 'club-1' });
    });

    it('sets roomError on failure', async () => {
      await setup();
      chatServiceSpy.createRoom.mockRejectedValue(new Error('fail'));
      component.newRoomName.set('General');
      await component.createChatRoom();
      expect(component.roomError()).toBeTruthy();
    });
  });

  describe('club lifecycle actions', () => {
    it('onPause updates status to paused', async () => {
      await setup();
      await component.onPause();
      expect(clubServiceSpy.pauseClub).toHaveBeenCalledWith('club-1');
      expect(component.club()?.status).toBe('paused');
    });

    it('onCancel dismisses the confirm and updates status to cancelled', async () => {
      await setup();
      component.showCancelConfirm.set(true);
      await component.onCancel();
      expect(clubServiceSpy.cancelClub).toHaveBeenCalledWith('club-1');
      expect(component.showCancelConfirm()).toBe(false);
      expect(component.club()?.status).toBe('cancelled');
    });

    it('onReschedule does nothing when no date is set', async () => {
      await setup();
      await component.onReschedule();
      expect(clubServiceSpy.rescheduleMeeting).not.toHaveBeenCalled();
    });

    it('onReschedule updates the club and resets the form', async () => {
      await setup();
      component.rescheduleDate.set('2025-08-01T10:00');
      component.showRescheduleInput.set(true);
      await component.onReschedule();
      expect(clubServiceSpy.rescheduleMeeting).toHaveBeenCalled();
      expect(component.showRescheduleInput()).toBe(false);
      expect(component.rescheduleDate()).toBe('');
      expect(component.club()?.status).toBe('active');
    });

    it('onDelete deletes the club and navigates to /clubs', async () => {
      await setup();
      await component.onDelete();
      expect(clubServiceSpy.deleteClub).toHaveBeenCalledWith('club-1');
      expect(router.navigate).toHaveBeenCalledWith(['/clubs']);
    });

    it('onDelete resets isDeleting and shows a toast on failure', async () => {
      await setup();
      clubServiceSpy.deleteClub.mockRejectedValue(new Error('fail'));
      await component.onDelete();
      expect(component.isDeleting()).toBe(false);
      expect(router.navigate).not.toHaveBeenCalledWith(['/clubs']);
    });
  });

  describe('maxMemberGrowth / maxEventFrequency', () => {
    it('returns at least 1 even with empty data', async () => {
      await setup();
      expect(component.maxMemberGrowth({ memberGrowth: [] } as unknown as ClubStats)).toBe(1);
      expect(component.maxEventFrequency({ eventFrequency: [] } as unknown as ClubStats)).toBe(1);
    });

    it('returns the max count', async () => {
      await setup();
      const stats = { memberGrowth: [{ count: 3 }, { count: 7 }] } as unknown as ClubStats;
      expect(component.maxMemberGrowth(stats)).toBe(7);
    });
  });

  describe('bannedDisplayName', () => {
    it('resolves the display name from members', async () => {
      await setup();
      expect(component.bannedDisplayName({ userId: 'u2' } as BanRecord)).toBe('User u2');
    });

    it('falls back to the userId when the member is not found', async () => {
      await setup();
      expect(component.bannedDisplayName({ userId: 'unknown' } as BanRecord)).toBe('unknown');
    });
  });
});
