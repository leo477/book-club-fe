import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { stranglerHandoffGuard } from './core/strangler/strangler-handoff.guard';
import { ShellComponent } from './layout/shell/shell.component';

export const routes: Routes = [
  // ── Public static pages (no auth, no shell) ────────────────────────────
  {
    path: 'privacy',
    canMatch: [stranglerHandoffGuard],
    title: 'TITLES.privacy',
    loadComponent: () =>
      import('./features/privacy/privacy.component').then(m => m.PrivacyComponent),
  },
  {
    path: 'terms',
    canMatch: [stranglerHandoffGuard],
    title: 'TITLES.terms',
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
    children: [
      // Public: club discovery (guest-accessible for SEO)
      {
        path: 'clubs',
        loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
      },
      {
        path: 'events',
        title: 'TITLES.events',
        canActivate: [authGuard],
        loadChildren: () => import('./features/events/events.routes').then(m => m.EVENTS_ROUTES),
      },
      {
        path: 'support',
        title: 'TITLES.support',
        canActivate: [authGuard],
        loadChildren: () => import('./features/support/support.routes').then(m => m.SUPPORT_ROUTES),
      },

      { path: '', redirectTo: 'events', pathMatch: 'full' },
      {
        path: 'profile',
        title: 'TITLES.profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'chats',
        title: 'TITLES.chats',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/chats/chats.component').then(m => m.ChatsComponent),
      },
      {
        path: '**',
        title: 'TITLES.not_found',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
      },
    ],
  },

  // ── Top-level 404 for unauthenticated unknown routes ───────────────────
  {
    path: '**',
    title: 'TITLES.not_found',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
