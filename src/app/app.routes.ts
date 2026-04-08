import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/clubs', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'clubs',
    loadChildren: () => import('./features/clubs/clubs.routes').then(m => m.CLUBS_ROUTES),
  },
  { path: '**', redirectTo: '/clubs' },
];
