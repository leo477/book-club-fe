import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole, UserSocials } from '../../core/models/user.model';
import { SeoService } from '../../core/services/seo.service';
import { SocialLinkFieldComponent, SocialField } from '../../shared/components/social-link-field/social-link-field.component';
import { SocialBadgesComponent } from '../../shared/components/social-badges/social-badges.component';
import { ProfileStatsComponent } from './stats/profile-stats.component';
import { ProfileRoleSelectorComponent } from './role-selector/profile-role-selector.component';
import { HlmButton } from '../../shared/spartan/button/src';
import { HlmInput } from '../../shared/spartan/input/src';
import { displayNameValidator } from '../../shared/utils/display-name.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, SocialLinkFieldComponent, SocialBadgesComponent, ProfileStatsComponent, ProfileRoleSelectorComponent, HlmButton, HlmInput],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  protected readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);

  protected readonly socialFields = computed<SocialField[]>(() => {
    const atPlaceholder = this.translate.instant('PROFILE.social_placeholder_at');
    const urlPlaceholder = this.translate.instant('PROFILE.social_placeholder_url');
    return [
      {
        key: 'telegram',
        label: 'Telegram',
        labelClass: 'text-blue-600 dark:text-blue-400',
        placeholder: atPlaceholder,
        focusRingClass: 'focus:ring-blue-500',
      },
      {
        key: 'instagram',
        label: 'Instagram',
        labelClass: 'bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent',
        placeholder: atPlaceholder,
        focusRingClass: 'focus:ring-pink-500',
      },
      {
        key: 'twitter',
        label: 'Twitter / X',
        labelClass: 'text-gray-900 dark:text-gray-100',
        placeholder: atPlaceholder,
        focusRingClass: 'focus:ring-gray-800',
      },
      {
        key: 'linkedin',
        label: 'LinkedIn',
        labelClass: 'text-blue-700 dark:text-blue-400',
        placeholder: urlPlaceholder,
        focusRingClass: 'focus:ring-blue-600',
      },
      {
        key: 'github',
        label: 'GitHub',
        labelClass: 'text-gray-800 dark:text-gray-200',
        placeholder: 'username',
        focusRingClass: 'focus:ring-gray-700',
      },
      {
        key: 'goodreads',
        label: 'Goodreads',
        labelClass: 'text-amber-700 dark:text-amber-400',
        placeholder: urlPlaceholder,
        focusRingClass: 'focus:ring-amber-500',
      },
    ];
  });

  /** Typed reactive form for updating the display name. */
  protected readonly nameForm = new FormGroup({
    displayName: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        displayNameValidator,
      ],
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
    const locale = this.translate.currentLang === 'uk' ? 'uk-UA' : 'en-US';
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
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
      toast.success(this.translate.instant('PROFILE.role_changed'));
    } catch { /* error already handled by interceptor */ }
  }

  /** Persist the new display name and show a transient success toast. */
  protected async saveName(): Promise<void> {
    if (this.nameForm.invalid) return;
    this.isSavingName.set(true);
    const { displayName } = this.nameForm.getRawValue();
    try {
      await this.auth.updateDisplayName(displayName);
      toast.success(this.translate.instant('PROFILE.name_updated'));
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
      toast.success(this.translate.instant('PROFILE.socials_saved'));
    } catch { /* error already handled by interceptor */ }
  }

  /** Toggle socials visibility for all club members. */
  protected async onSocialsPublicChange(value: boolean): Promise<void> {
    try {
      await this.auth.setSocialsPublic(value);
    } catch { /* error already handled by interceptor */ }
  }
}
