import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubMembersListComponent } from './club-members-list.component';
import { ClubMemberDetail, BanDuration } from '../../../../core/models/club.model';

const member = (overrides: Partial<ClubMemberDetail> = {}): ClubMemberDetail => ({
  userId: 'u1',
  displayName: 'Alice',
  avatarUrl: null,
  role: 'member',
  socialsPublic: false,
  socials: undefined,
  ...overrides,
});

describe('ClubMembersListComponent', () => {
  let component: ClubMembersListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubMembersListComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClubMembersListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('members', [member()]);
    fixture.componentRef.setInput('clubBans', []);
    fixture.componentRef.setInput('isOwner', false);
  });

  describe('canSeeSocials', () => {
    it('returns true when socialsPublic is true', () => {
      expect(component.canSeeSocials(member({ socialsPublic: true }))).toBe(true);
    });

    it('returns true when isOwner is true regardless of socialsPublic', async () => {
      await TestBed.compileComponents();
      const fixture = TestBed.createComponent(ClubMembersListComponent);
      fixture.componentRef.setInput('members', []);
      fixture.componentRef.setInput('clubBans', []);
      fixture.componentRef.setInput('isOwner', true);
      const c = fixture.componentInstance;
      expect(c.canSeeSocials(member({ socialsPublic: false }))).toBe(true);
    });

    it('returns false when socialsPublic is false and not owner', () => {
      expect(component.canSeeSocials(member({ socialsPublic: false }))).toBe(false);
    });
  });

  describe('toggleQr', () => {
    it('opens QR for a user', () => {
      component.toggleQr('u1');
      expect(component.showQrForUser()).toBe('u1');
    });

    it('closes QR when toggling the same user', () => {
      component.toggleQr('u1');
      component.toggleQr('u1');
      expect(component.showQrForUser()).toBeNull();
    });

    it('switches to different user', () => {
      component.toggleQr('u1');
      component.toggleQr('u2');
      expect(component.showQrForUser()).toBe('u2');
    });
  });

  describe('toggleBanMenu', () => {
    it('opens ban menu for a user', () => {
      component.toggleBanMenu('u1');
      expect(component.showBanMenu()).toBe('u1');
    });

    it('closes ban menu when toggling same user', () => {
      component.toggleBanMenu('u1');
      component.toggleBanMenu('u1');
      expect(component.showBanMenu()).toBeNull();
    });
  });

  describe('emitBan', () => {
    it('emits ban event and clears menu', () => {
      let emitted: { userId: string; duration: BanDuration } | undefined;
      component.ban.subscribe(v => (emitted = v));
      component.toggleBanMenu('u1');
      component.emitBan('u1', 'permanent');
      expect(emitted).toEqual({ userId: 'u1', duration: 'permanent' });
      expect(component.showBanMenu()).toBeNull();
    });
  });

  describe('buildQrValue', () => {
    it('returns displayName when no socials', () => {
      expect(component.buildQrValue(member())).toBe('Alice');
    });

    it('returns displayName when socials object is present but empty', () => {
      const m = member({ socials: {} });
      const result = component.buildQrValue(m);
      expect(result).toContain('Alice');
      expect(result).not.toContain('Telegram');
    });

    it('includes telegram when set', () => {
      const m = member({ socials: { telegram: 'myuser' } });
      expect(component.buildQrValue(m)).toContain('t.me/myuser');
    });

    it('includes instagram when set', () => {
      const m = member({ socials: { instagram: 'ig_user' } });
      expect(component.buildQrValue(m)).toContain('instagram.com/ig_user');
    });

    it('includes twitter when set', () => {
      const m = member({ socials: { twitter: 'tw_user' } });
      expect(component.buildQrValue(m)).toContain('x.com/tw_user');
    });

    it('includes linkedin when set', () => {
      const m = member({ socials: { linkedin: 'li_user' } });
      expect(component.buildQrValue(m)).toContain('linkedin.com/in/li_user');
    });

    it('includes github when set', () => {
      const m = member({ socials: { github: 'gh_user' } });
      expect(component.buildQrValue(m)).toContain('github.com/gh_user');
    });

    it('includes goodreads when set', () => {
      const m = member({ socials: { goodreads: 'gr_user' } });
      expect(component.buildQrValue(m)).toContain('goodreads.com/gr_user');
    });

    it('includes all social links', () => {
      const m = member({
        socials: {
          telegram: 'tg',
          instagram: 'ig',
          twitter: 'tw',
          linkedin: 'li',
          github: 'gh',
          goodreads: 'gr',
        },
      });
      const result = component.buildQrValue(m);
      expect(result).toContain('t.me/tg');
      expect(result).toContain('instagram.com/ig');
      expect(result).toContain('x.com/tw');
      expect(result).toContain('linkedin.com/in/li');
      expect(result).toContain('github.com/gh');
      expect(result).toContain('goodreads.com/gr');
    });
  });
});
