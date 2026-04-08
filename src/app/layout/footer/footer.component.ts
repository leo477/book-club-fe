import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer
      class="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6"
      role="contentinfo"
    >
      <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <!-- Brand -->
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">
          📚 BookClub &copy; {{ year }}
        </p>

        <!-- Links -->
        <nav aria-label="Footer navigation" class="flex items-center gap-4">
          <a
            routerLink="/privacy"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                   focus:ring-offset-2 rounded"
          >
            Privacy
          </a>
          <a
            routerLink="/terms"
            class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
                   focus:ring-offset-2 rounded"
          >
            Terms
          </a>
        </nav>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
