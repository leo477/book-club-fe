import { AppLink } from '@/components/app-link';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('TITLES.terms', '/terms');

export default function TermsPage() {
  return (
    <main lang="uk" className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <AppLink href="/events" className="text-sm text-primary-700 dark:text-primary-300 hover:underline cursor-pointer">
          ← Назад
        </AppLink>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-2">Умови використання</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">Останнє оновлення: травень 2026 р.</p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Прийняття умов</h2>
            <p>
              Реєструючись або використовуючи платформу BookClub, ви погоджуєтеся з цими Умовами використання. Якщо ви не
              погоджуєтеся з будь-яким пунктом, будь ласка, не використовуйте сервіс.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Відповідальність користувача</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ви несете відповідальність за точність інформації у вашому профілі.</li>
              <li>Ви зобов&apos;язуєтеся зберігати конфіденційність свого пароля.</li>
              <li>Ви несете відповідальність за весь контент, який публікуєте у клубах та чатах.</li>
              <li>Ви зобов&apos;язуєтеся поважати інших учасників та дотримуватися норм спілкування.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. Заборонені дії</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Публікація незаконного, образливого або дискримінаційного контенту.</li>
              <li>Спам, флуд або навмисне перешкоджання роботі платформи.</li>
              <li>Спроби несанкціонованого доступу до акаунтів інших користувачів.</li>
              <li>Використання автоматизованих скриптів без письмового дозволу.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Зміни та припинення</h2>
            <p>
              Ми залишаємо за собою право змінювати ці Умови. Про суттєві зміни ми повідомимо електронною поштою. Ми можемо
              призупинити або видалити акаунт у разі порушення цих Умов.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. Відмова від відповідальності</h2>
            <p>
              Платформа надається «як є». Ми не несемо відповідальності за збитки, що виникли внаслідок використання або
              неможливості використання сервісу, а також за дії інших користувачів.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Контакти</h2>
            <p>
              З питань щодо цих Умов звертайтеся:{' '}
              <a href="mailto:legal@bookclub.ua" className="text-primary-700 dark:text-primary-300 underline">
                legal@bookclub.ua
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
