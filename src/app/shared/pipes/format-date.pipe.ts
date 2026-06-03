import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'formatDate', standalone: true, pure: false })
export class FormatDatePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    const lang = this.translate.currentLang ?? this.translate.defaultLang ?? 'uk';
    const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
