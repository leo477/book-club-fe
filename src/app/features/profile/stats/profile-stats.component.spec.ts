import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileStatsComponent } from './profile-stats.component';
import { UserStats } from '../../../core/models/user.model';

describe('ProfileStatsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStatsComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create with null stats (default)', () => {
    const fixture = TestBed.createComponent(ProfileStatsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.stats()).toBeNull();
  });

  it('should create with provided stats', () => {
    const stats: UserStats = {
      clubsJoined: 3,
      quizzesTaken: 10,
      quizWins: 2,
      likesReceived: 5,
      booksRead: 7,
    };
    const fixture = TestBed.createComponent(ProfileStatsComponent);
    fixture.componentRef.setInput('stats', stats);
    fixture.detectChanges();
    expect(fixture.componentInstance.stats()).toEqual(stats);
  });
});
