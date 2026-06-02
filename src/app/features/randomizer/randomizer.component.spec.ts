import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RandomizerComponent } from './randomizer.component';
import { RandomizerService } from '../../core/services/randomizer.service';
import { AuthService } from '../../core/auth/auth.service';

function makeRandomizerService() {
  return {
    candidates: signal([]),
    selectedIds: signal(new Set<string>()),
    result: signal(null),
    isSpinning: signal(false),
    history: signal([]),
    purpose: signal('Хто представляє книгу?'),
    setPurpose: vi.fn(),
    loadClubMembers: vi.fn().mockResolvedValue(undefined),
    loadHistory: vi.fn().mockResolvedValue(undefined),
    spin: vi.fn().mockResolvedValue(undefined),
    saveSession: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn(),
    toggleMember: vi.fn(),
  };
}

function makeAuthService() {
  return {
    currentUser: signal(null),
    isAuthenticated: signal(false),
    isOrganizer: signal(false),
  };
}

interface CompProtected {
  spin(): void;
  reset(): void;
  errorMessage: { (): string; set(v: string): void };
}

describe('RandomizerComponent', () => {
  let randSvc: ReturnType<typeof makeRandomizerService>;
  let authSvc: ReturnType<typeof makeAuthService>;

  beforeEach(async () => {
    randSvc = makeRandomizerService();
    authSvc = makeAuthService();

    await TestBed.configureTestingModule({
      imports: [RandomizerComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: RandomizerService, useValue: randSvc },
        { provide: AuthService, useValue: authSvc },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { id: 'club-1' } } },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RandomizerComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reset() calls randomizerService.reset and clears errorMessage', () => {
    const fixture = TestBed.createComponent(RandomizerComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.errorMessage.set('some error');
    comp.reset();
    expect(randSvc.reset).toHaveBeenCalled();
    expect(comp.errorMessage()).toBe('');
  });

  it('spin() sets errorMessage when spin rejects', async () => {
    randSvc.spin.mockReturnValue(Promise.reject(new Error('spin failed')));
    const fixture = TestBed.createComponent(RandomizerComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.spin();
    await new Promise<void>(r => setTimeout(r));
    expect(comp.errorMessage()).toBe('spin failed');
  });
});
