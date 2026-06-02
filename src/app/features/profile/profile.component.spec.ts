import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/auth/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

function makeAuthService(overrides: Partial<{ displayName: string; role: string; createdAt: string }> = {}) {
  const user = overrides.displayName !== undefined
    ? {
        id: 'user-1',
        displayName: overrides.displayName,
        role: overrides.role ?? 'user',
        createdAt: overrides.createdAt ?? '',
        socialsPublic: false,
        socials: {},
      }
    : null;

  return {
    currentUser: signal(user as ReturnType<typeof signal<typeof user>>['prototype'] | null),
    isAuthenticated: signal(user !== null),
    isOrganizer: signal(user?.role === 'organizer'),
    userStats: signal(null),
    updateRole: vi.fn().mockResolvedValue(undefined),
    updateDisplayName: vi.fn().mockResolvedValue(undefined),
    updateSocials: vi.fn().mockResolvedValue(undefined),
    setSocialsPublic: vi.fn().mockResolvedValue(undefined),
  };
}

function makeSeoService() {
  return {
    setPageI18n: vi.fn(),
  };
}

describe('ProfileComponent', () => {
  let authSvc: ReturnType<typeof makeAuthService>;

  async function setup(userOverrides: Parameters<typeof makeAuthService>[0] = {}) {
    authSvc = makeAuthService(userOverrides);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: SeoService, useValue: makeSeoService() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  it('should create', async () => {
    await setup();
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('userInitials computed — derives two-letter initials from displayName', async () => {
    await setup({ displayName: 'John Doe' });
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { userInitials: () => string };
    expect(comp.userInitials()).toBe('JD');
  });

  it('roleLabel computed — returns "Organizer" for organizer role', async () => {
    await setup({ displayName: 'Alice', role: 'organizer' });
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { roleLabel: () => string };
    expect(comp.roleLabel()).toBe('Organizer');
  });

  it('roleLabel computed — returns "Reader" for non-organizer role', async () => {
    await setup({ displayName: 'Bob', role: 'user' });
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as { roleLabel: () => string };
    expect(comp.roleLabel()).toBe('Reader');
  });

  it('saveName() does nothing when nameForm is invalid (empty displayName)', async () => {
    await setup({ displayName: 'Alice' });
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      nameForm: { controls: { displayName: { setValue(v: string): void } }; invalid: boolean };
      saveName(): Promise<void>;
    };

    comp.nameForm.controls.displayName.setValue('');
    expect(comp.nameForm.invalid).toBe(true);

    await comp.saveName();

    expect(authSvc.updateDisplayName).not.toHaveBeenCalled();
  });

  it('saveName() calls updateDisplayName and shows toast on success', async () => {
    await setup({ displayName: 'Alice' });
    vi.spyOn(toast, 'success');
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      nameForm: { controls: { displayName: { setValue(v: string): void } } };
      saveName(): Promise<void>;
    };

    comp.nameForm.controls.displayName.setValue('Alice Smith');
    await comp.saveName();

    expect(authSvc.updateDisplayName).toHaveBeenCalledWith('Alice Smith');
    expect(toast.success).toHaveBeenCalled();
  });

  it('constructor seeds nameForm.displayName from currentUser', async () => {
    await setup({ displayName: 'Pre-filled Name' });
    const fixture = TestBed.createComponent(ProfileComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance as unknown as {
      nameForm: { getRawValue(): { displayName: string } };
    };
    expect(comp.nameForm.getRawValue().displayName).toBe('Pre-filled Name');
  });
});
