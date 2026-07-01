import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';
import { SupportBoardComponent } from './support-board/support-board.component';
import { CreateSubmissionComponent } from './create-submission/create-submission.component';

export const SUPPORT_ROUTES: Routes = [
  {
    path: '',
    component: SupportBoardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'new',
    component: CreateSubmissionComponent,
    canActivate: [authGuard],
  },
];
