import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const QUIZ_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-list/quiz-list.component').then(m => m.QuizListComponent),
  },
  {
    // Organizer-only: create must come before :quizId to avoid param collision
    path: 'create',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
  },
  {
    path: ':quizId/edit',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-edit/quiz-edit.component').then(m => m.QuizEditComponent),
  },
  {
    path: ':quizId/preview',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-preview/quiz-preview.component').then(m => m.QuizPreviewComponent),
  },
  {
    path: ':quizId/session',
    canActivate: [authGuard, roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-session/quiz-session.component').then(m => m.QuizSessionComponent),
  },
  {
    path: ':quizId/leaderboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-leaderboard/quiz-leaderboard.component').then(m => m.QuizLeaderboardComponent),
  },
  {
    path: ':quizId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
];
