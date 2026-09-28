import { Component, ChangeDetectionStrategy, ElementRef, inject, viewChild } from '@angular/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatService } from '../../../../core/services/chat.service';
import { ChatTimestampPipe } from '../../../pipes/chat-timestamp.pipe';

@Component({
  selector: 'app-chat-message-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, TranslatePipe, ChatTimestampPipe],
  templateUrl: './chat-message-list.component.html',
})
export class ChatMessageListComponent {
  protected readonly chat = inject(ChatService);

  private readonly messagesScrollRef = viewChild<ElementRef<HTMLElement>>('messagesScroll');

  /** N-7: near-top scroll on the messages container triggers loading older history. */
  protected onMessagesScroll(): void {
    const el = this.messagesScrollRef()?.nativeElement;
    if (!el || el.scrollTop > 40) return;
    this.maybeLoadOlderMessages();
  }

  private maybeLoadOlderMessages(): void {
    const roomId = this.chat.activeRoomId();
    if (!roomId) return;
    if (this.chat.isLoadingOlder()[roomId]) return;
    if (this.chat.hasMoreOlder()[roomId] === false) return;

    const el = this.messagesScrollRef()?.nativeElement;
    if (!el) return;
    const prevScrollHeight = el.scrollHeight;
    const prevScrollTop = el.scrollTop;

    this.chat.loadOlderMessages(roomId).then(() => {
      requestAnimationFrame(() => {
        const container = this.messagesScrollRef()?.nativeElement;
        if (!container) return;
        // Preserve visual position — prepending older messages shifts scrollHeight.
        container.scrollTop = prevScrollTop + (container.scrollHeight - prevScrollHeight);
      });
    });
  }
}
