import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubManageMembersComponent } from './club-manage-members.component';
import { BanRecord } from '../../../../core/models/club.model';

describe('ClubManageMembersComponent', () => {
  let component: ClubManageMembersComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubManageMembersComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClubManageMembersComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('members', [{ userId: 'u2', displayName: 'User u2' }]);
    fixture.componentRef.setInput('bans', []);
    fixture.componentRef.setInput('ownerId', 'u1');
    fixture.componentRef.setInput('currentUserId', 'u1');
    fixture.componentRef.setInput('processingMemberId', null);
  });

  describe('bannedDisplayName', () => {
    it('resolves the display name from members', () => {
      expect(component.bannedDisplayName({ userId: 'u2' } as BanRecord)).toBe('User u2');
    });

    it('falls back to the userId when the member is not found', () => {
      expect(component.bannedDisplayName({ userId: 'unknown' } as BanRecord)).toBe('unknown');
    });
  });
});
