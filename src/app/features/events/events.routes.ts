import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const EVENTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./events-feed/events-feed.component').then(m => m.EventsFeedComponent),
  },
  {
    path: ':id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./event-detail/event-detail.component').then(m => m.EventDetailComponent),
  },
];
