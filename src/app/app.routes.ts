import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // ── Full-screen auth pages (no shell) ───────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },

  // ── App shell (header + footer) ─────────────────────────────────────────
  {
    path: '',
    component: ShellComponent,
    children: [
      // Protected: any authenticated user
      {
        path: 'clubs',
        canActivate: [authGuard],
        loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
      },

      // Protected: organizer-only placeholder (e.g. club management)
      {
        path: 'manage',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('./features/clubs/clubs-list/clubs-list.component').then(
            m => m.ClubsListComponent,
          ),
      },

      { path: '', redirectTo: 'clubs', pathMatch: 'full' },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      { path: '**', redirectTo: 'clubs' },
    ],
  },
];
