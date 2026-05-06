import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LeaderboardPodiumComponent } from './leaderboard-podium.component';

describe('LeaderboardPodiumComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [LeaderboardPodiumComponent],
      providers: [provideZonelessChangeDetection()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(LeaderboardPodiumComponent);
    return { fixture, comp: fixture.componentInstance };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

});
