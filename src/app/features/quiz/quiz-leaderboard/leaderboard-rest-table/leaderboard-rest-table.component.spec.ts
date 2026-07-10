import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LeaderboardRestTableComponent } from './leaderboard-rest-table.component';
import { QuizLeaderboardEntry } from '../../../../core/models/quiz.model';

const mockEntry: QuizLeaderboardEntry = {
  rank: 4,
  userId: 'u4',
  displayName: 'Dave Jones',
  avatarUrl: null,
  score: 3,
  totalQuestions: 5,
  hasAttempted: true,
};

describe('LeaderboardRestTableComponent', () => {
  async function setup(entries: QuizLeaderboardEntry[] = []) {
    await TestBed.configureTestingModule({
      imports: [LeaderboardRestTableComponent],
      providers: [provideZonelessChangeDetection()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(LeaderboardRestTableComponent);
    fixture.componentRef.setInput('entries', entries);
    return { fixture };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a row per entry', async () => {
    const { fixture } = await setup([mockEntry]);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(1);
  });

  it('renders empty tbody when no entries', async () => {
    const { fixture } = await setup([]);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(0);
  });
});
