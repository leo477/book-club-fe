import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/clubs', pathMatch: 'full' },

  // Public auth routes
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

  { path: '**', redirectTo: '/clubs' },
];
