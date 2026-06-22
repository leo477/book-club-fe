import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-privacy',
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

        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Політика конфіденційності</h1>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-8">Останнє оновлення: травень 2026 р.</p>

        <div class="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Які дані ми збираємо</h2>
            <p>Під час реєстрації ми збираємо ваше ім'я користувача та адресу електронної пошти. При використанні сервісу ми можемо зберігати інформацію про вашу участь у книжкових клубах, результати квізів та налаштування профілю (соціальні мережі, роль).</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Як ми використовуємо ваші дані</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li>Надання та підтримка функцій платформи (клуби, події, квізи).</li>
              <li>Персоналізація вашого досвіду: відображення ваших клубів та статистики.</li>
              <li>Зв'язок з вами у разі важливих змін у сервісі.</li>
            </ul>
            <p class="mt-3">Ми не продаємо та не передаємо ваші персональні дані третім сторонам у комерційних цілях.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Зберігання даних</h2>
            <p>Дані зберігаються на захищених серверах. Ваш пароль зберігається у хешованому вигляді — ми не маємо доступу до вашого пароля у відкритому вигляді. Токени доступу зберігаються лише в пам'яті браузера і не записуються до локального сховища.</p>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Ваші права (GDPR)</h2>
            <ul class="list-disc pl-5 space-y-1">
              <li><strong>Доступ:</strong> ви можете запросити копію своїх даних.</li>
              <li><strong>Виправлення:</strong> ви можете оновити ім'я та соціальні мережі в налаштуваннях профілю.</li>
              <li><strong>Видалення:</strong> ви можете надіслати запит на видалення акаунту та всіх пов'язаних даних.</li>
              <li><strong>Заперечення:</strong> ви маєте право заперечувати проти певних видів обробки даних.</li>
            </ul>
          </section>

          <section>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Контакти</h2>
            <p>З питань конфіденційності звертайтеся: <a href="mailto:privacy&#64;bookclub.ua" class="text-primary-700 dark:text-primary-300 underline">privacy&#64;bookclub.ua</a></p>
          </section>

        </div>
      </div>
    </div>
  `,
})
export class PrivacyComponent {
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
