import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ClubManageDashboardComponent } from './club-manage-dashboard.component';
import { ClubStats } from '../../../../core/models/club.model';

describe('ClubManageDashboardComponent', () => {
  let component: ClubManageDashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubManageDashboardComponent],
      providers: [provideTranslateService(), provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClubManageDashboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('stats', null);
  });

  describe('maxMemberGrowth / maxEventFrequency', () => {
    it('returns at least 1 even with empty data', () => {
      expect(component.maxMemberGrowth({ memberGrowth: [] } as unknown as ClubStats)).toBe(1);
      expect(component.maxEventFrequency({ eventFrequency: [] } as unknown as ClubStats)).toBe(1);
    });

    it('returns the max count', () => {
      const stats = { memberGrowth: [{ count: 3 }, { count: 7 }] } as unknown as ClubStats;
      expect(component.maxMemberGrowth(stats)).toBe(7);
    });
  });
});
