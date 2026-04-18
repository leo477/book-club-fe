import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserSocials } from '../../core/models/user.model';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);

  /** Typed reactive form for updating the display name. */
  protected readonly nameForm = new FormGroup({
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  /** Typed reactive form for updating social media links. */
  protected readonly socialsForm = new FormGroup({
    telegram:  new FormControl('', { nonNullable: true }),
    instagram: new FormControl('', { nonNullable: true }),
    twitter:   new FormControl('', { nonNullable: true }),
    linkedin:  new FormControl('', { nonNullable: true }),
    github:    new FormControl('', { nonNullable: true }),
    goodreads: new FormControl('', { nonNullable: true }),
  });

  /** Controls whether socials are visible to all club members. */
  protected readonly socialsPublicControl = new FormControl<boolean>(false, { nonNullable: true });

  /** Tracks the in-flight save state (synchronous here, but keeps the pattern extensible). */
  protected readonly isSavingName = signal(false);
  /** Drives the "Saved!" success toast for the name form. */
  protected readonly nameSaved = signal(false);
  /** Drives the "Role updated!" success toast for the role switcher. */
  protected readonly roleChanged = signal(false);
  /** Drives the "Socials saved!" success toast for the socials form. */
  protected readonly socialsSaved = signal(false);

  /** Two-letter initials derived from the current user's display name. */
  protected readonly userInitials = computed<string>(() => {
    const name = this.auth.currentUser()?.displayName ?? '';
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  /** Human-readable role label shown in the hero badge. */
  protected readonly roleLabel = computed<string>(() =>
    this.auth.currentUser()?.role === 'organizer' ? 'Organizer' : 'Reader',
  );

  /** Formatted "joined" date. */
  protected readonly joinedDate = computed<string>(() => {
    const raw = this.auth.currentUser()?.createdAt;
    if (!raw) return '';
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(
      new Date(raw),
    );
  });

  /** Current user's social links (falls back to empty object). */
  protected readonly userSocials = computed<UserSocials>(
    () => this.auth.currentUser()?.socials ?? {},
  );

  constructor() {
    this.seo.setPageI18n('SEO.profile_title');
    // Seed the name form with the user's current display name.
    const user = this.auth.currentUser();
    if (user) {
      this.nameForm.patchValue({ displayName: user.displayName });

      // Seed the socials public toggle.
      this.socialsPublicControl.setValue(user.socialsPublic ?? false);

      // Seed the socials form with whatever is already saved.
      if (user.socials) {
        this.socialsForm.patchValue({
          telegram:  user.socials.telegram  ?? '',
          instagram: user.socials.instagram ?? '',
          twitter:   user.socials.twitter   ?? '',
          linkedin:  user.socials.linkedin  ?? '',
          github:    user.socials.github    ?? '',
          goodreads: user.socials.goodreads ?? '',
        });
      }
    }
  }

  /** Switch the user's role and show a transient success toast. */
  protected async changeRole(role: UserRole): Promise<void> {
    try {
      await this.auth.updateRole(role);
      this.roleChanged.set(true);
      setTimeout(() => this.roleChanged.set(false), 3000);
    } catch { /* error already handled by interceptor */ }
  }

  /** Persist the new display name and show a transient success toast. */
  protected async saveName(): Promise<void> {
    if (this.nameForm.invalid) return;
    this.isSavingName.set(true);
    const { displayName } = this.nameForm.getRawValue();
    try {
      await this.auth.updateDisplayName(displayName);
      this.nameSaved.set(true);
      setTimeout(() => this.nameSaved.set(false), 3000);
    } catch { /* error already handled by interceptor */ }
    finally {
      this.isSavingName.set(false);
    }
  }

  /** Persist the social media links and show a transient success toast. */
  protected async submitSocials(): Promise<void> {
    const raw = this.socialsForm.getRawValue();

    // Convert empty strings to undefined so the model stays clean.
    const socials: UserSocials = {
      ...(raw.telegram  ? { telegram:  raw.telegram  } : {}),
      ...(raw.instagram ? { instagram: raw.instagram } : {}),
      ...(raw.twitter   ? { twitter:   raw.twitter   } : {}),
      ...(raw.linkedin  ? { linkedin:  raw.linkedin  } : {}),
      ...(raw.github    ? { github:    raw.github    } : {}),
      ...(raw.goodreads ? { goodreads: raw.goodreads } : {}),
    };

    try {
      await this.auth.updateSocials(socials);
      this.socialsSaved.set(true);
      setTimeout(() => this.socialsSaved.set(false), 3000);
    } catch { /* error already handled by interceptor */ }
  }

  /** Toggle socials visibility for all club members. */
  protected async onSocialsPublicChange(value: boolean): Promise<void> {
    try {
      await this.auth.setSocialsPublic(value);
    } catch { /* error already handled by interceptor */ }
  }
}
