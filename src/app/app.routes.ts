import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // ── Public static pages (no auth, no shell) ────────────────────────────
  {
    path: 'privacy',
    title: 'Конфіденційність | Book Club',
    loadComponent: () =>
      import('./features/privacy/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: 'terms',
    title: 'Умови використання | Book Club',
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
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/oauth-callback/oauth-callback.component').then(
        m => m.OAuthCallbackComponent,
      ),
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
        title: 'Події | Book Club',
        canActivate: [authGuard],
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
      },
      {
        path: 'support',
        title: 'Підтримка | Book Club',
        canActivate: [authGuard],
        loadChildren: () => import('./features/support/support.routes').then(m => m.SUPPORT_ROUTES),
      },

      // Protected: organizer dashboard
      {
        path: 'manage',
        title: 'Керування | Book Club',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('./features/organizer-dashboard/organizer-dashboard.component').then(
            m => m.OrganizerDashboardComponent,
          ),
      },

      { path: '', redirectTo: 'events', pathMatch: 'full' },
      {
        path: 'profile',
        title: 'Профіль | Book Club',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'chats',
        title: 'Чати | Book Club',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/chats/chats.component').then(m => m.ChatsComponent),
      },
      {
        path: '**',
        title: 'Сторінку не знайдено | Book Club',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },

  // ── Top-level 404 for unauthenticated unknown routes ───────────────────
  {
    path: '**',
    title: 'Сторінку не знайдено | Book Club',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
