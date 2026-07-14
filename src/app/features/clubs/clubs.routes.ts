import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';
import { ClubsListComponent } from './clubs-list/clubs-list.component';
import { ClubDetailComponent } from './club-detail/club-detail.component';
import { CreateClubComponent } from './create-club/create-club.component';

export const CLUBS_ROUTES: Routes = [
  {
    path: '',
    component: ClubsListComponent,
  },
  {
    path: 'create',
    component: CreateClubComponent,
    canActivate: [authGuard, roleGuard('organizer')],
  },
  {
    // :id parent — children inherit the `id` param via paramsInheritanceStrategy:'always'
    path: ':id',
    children: [
      {
        path: '',
        component: ClubDetailComponent,
      },
      {
        path: 'randomizer',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('../randomizer/randomizer.component').then(
            m => m.RandomizerComponent,
          ),
      },
      {
        path: 'quizzes',
        loadChildren: () =>
          import('../quiz/quiz.routes').then(m => m.QUIZ_ROUTES),
      },
      {
        path: 'events/create',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('../events/create-event/create-event.component').then(
            m => m.CreateEventComponent,
          ),
      },
      {
        path: 'edit',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('./edit-club/edit-club.component').then(m => m.EditClubComponent),
      },
      {
        path: 'manage',
        canActivate: [authGuard, roleGuard('organizer')],
        loadComponent: () =>
          import('./club-manage/club-manage.component').then(m => m.ClubManageComponent),
      },
    ],
  },
];

