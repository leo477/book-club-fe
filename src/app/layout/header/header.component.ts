import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private readonly auth = inject(AuthService);

  readonly isMenuOpen = signal(false);
  readonly isDropdownOpen = signal(false);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  readonly userInitials = computed(() => {
    const name = this.currentUser()?.displayName ?? '';
    return (
      name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('') || '?'
    );
  });

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
    if (this.isMenuOpen()) this.isDropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  async signOut(): Promise<void> {
    this.closeDropdown();
    this.isMenuOpen.set(false);
    await this.auth.signOut();
  }
}
