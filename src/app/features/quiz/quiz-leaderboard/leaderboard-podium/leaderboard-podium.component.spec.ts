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

  describe('initials', () => {
    it('returns ? for null/empty', async () => {
      const { comp } = await setup();
      const initials = (comp as unknown as { initials(n: string | null | undefined): string }).initials;
      expect(initials.call(comp, null)).toBe('?');
      expect(initials.call(comp, undefined)).toBe('?');
      expect(initials.call(comp, '')).toBe('?');
    });

    it('returns two initials for full name', async () => {
      const { comp } = await setup();
      const initials = (comp as unknown as { initials(n: string): string }).initials;
      expect(initials.call(comp, 'John Doe')).toBe('JD');
    });

    it('returns first two chars for single word', async () => {
      const { comp } = await setup();
      const initials = (comp as unknown as { initials(n: string): string }).initials;
      expect(initials.call(comp, 'Alice')).toBe('AL');
    });
  });
});
