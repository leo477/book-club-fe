import { Component, NO_ERRORS_SCHEMA, Type, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../app/core/services/quiz.service';

@Component({ template: '', standalone: true })
export class StubComponent {}

export async function configureQuizTestBed(component: Type<unknown>, quizSvc: unknown): Promise<void> {
  await TestBed.configureTestingModule({
    imports: [component as Type<unknown>, TranslateModule.forRoot()],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([{ path: '**', component: StubComponent }]),
      { provide: QuizService, useValue: quizSvc },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();
}
