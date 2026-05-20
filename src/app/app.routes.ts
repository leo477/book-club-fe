import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // ── Public static pages (no auth, no shell) ────────────────────────────
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/privacy/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/terms/terms.component').then(m => m.TermsComponent),
  },

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
    canActivate: [authGuard],
    children: [
      // Protected: any authenticated user
      {
        path: 'clubs',
        canActivate: [authGuard],
        loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
      },
      {
        path: 'events',
        canActivate: [authGuard],
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
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

      { path: '', redirectTo: 'events', pathMatch: 'full' },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },
];
