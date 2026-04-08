import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { roleGuard } from '../../core/auth/role.guard';

export const QUIZ_ROUTES: Routes = [
  {
    path: '',
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
    path: ':quizId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
];
