import { Routes } from '@angular/router';
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
    canActivate: [roleGuard('organizer')],
    loadComponent: () =>
      import('./quiz-create/quiz-create.component').then(m => m.QuizCreateComponent),
  },
  {
    path: ':quizId',
    loadComponent: () =>
      import('./quiz-take/quiz-take.component').then(m => m.QuizTakeComponent),
  },
];
