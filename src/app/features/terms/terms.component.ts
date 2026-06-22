import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div class="max-w-3xl mx-auto">
        <button
          type="button"
          (click)="goBack()"
          class="text-sm text-primary-700 dark:text-primary-300 hover:underline cursor-pointer"
        >← Назад</button>

        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Умови використання</h1>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-8">Останнє оновлення: травень 2026 р.</p>

        <div class="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Прийняття умов</h2>
            <p>Реєструючись або використовуючи платформу BookClub, ви погоджуєтеся з цими Умовами використання. Якщо ви не погоджуєтеся з будь-яким пунктом, будь ласка, не використовуйте сервіс.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Відповідальність користувача</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>Ви несете відповідальність за точність інформації у вашому профілі.</li>
              <li>Ви зобов'язуєтеся зберігати конфіденційність свого пароля.</li>
              <li>Ви несете відповідальність за весь контент, який публікуєте у клубах та чатах.</li>
              <li>Ви зобов'язуєтеся поважати інших учасників та дотримуватися норм спілкування.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Заборонені дії</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>Публікація незаконного, образливого або дискримінаційного контенту.</li>
              <li>Спам, флуд або навмисне перешкоджання роботі платформи.</li>
              <li>Спроби несанкціонованого доступу до акаунтів інших користувачів.</li>
              <li>Використання автоматизованих скриптів без письмового дозволу.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Зміни та припинення</h2>
            <p>Ми залишаємо за собою право змінювати ці Умови. Про суттєві зміни ми повідомимо електронною поштою. Ми можемо призупинити або видалити акаунт у разі порушення цих Умов.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Відмова від відповідальності</h2>
            <p>Платформа надається «як є». Ми не несемо відповідальності за збитки, що виникли внаслідок використання або неможливості використання сервісу, а також за дії інших користувачів.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Контакти</h2>
            <p>З питань щодо цих Умов звертайтеся: <a href="mailto:legal&#64;bookclub.ua" class="text-primary-700 dark:text-primary-300 underline">legal&#64;bookclub.ua</a></p>
          </section>

        </div>
      </div>
    </div>
  `,
})
export class TermsComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  goBack(): void {
    if (globalThis.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate([this.auth.isAuthenticated() ? '/events' : '/login']);
    }
  }
}
