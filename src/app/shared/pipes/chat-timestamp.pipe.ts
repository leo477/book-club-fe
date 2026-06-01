import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'chatTimestamp', standalone: true, pure: false })
export class ChatTimestampPipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(value: Date | string | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86_400_000);
    const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (msgDay.getTime() === today.getTime()) {
      return `${this.translate.instant('CHAT.today')} ${time}`;
    }
    if (msgDay.getTime() === yesterday.getTime()) {
      return `${this.translate.instant('CHAT.yesterday')} ${time}`;
    }

    const lang = this.translate.currentLang ?? this.translate.defaultLang ?? 'uk';
    const locale = lang === 'uk' ? 'uk-UA' : 'en-US';
    const shortDate = date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    return `${shortDate} ${time}`;
  }
}
