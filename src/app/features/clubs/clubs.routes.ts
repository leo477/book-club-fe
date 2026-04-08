import { Routes } from '@angular/router';

export const CLUBS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./clubs-list/clubs-list.component').then(m => m.ClubsListComponent),
  },
];
