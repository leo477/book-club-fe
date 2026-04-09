import { Injectable, signal, computed } from '@angular/core';
import { ChatMessage, ChatRoom } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly _rooms = signal<ChatRoom[]>([
    { id: 'room-1', name: 'Клуб "Майстер і Маргарита"' },
    { id: 'room-2', name: 'Sci-Fi Lovers' },
    { id: 'room-3', name: 'Детективний клуб' },
  ]);

  private readonly _messages = signal<Record<string, ChatMessage[]>>({
    'room-1': [
      {
        id: 'msg-1-1',
        senderId: 'user-1',
        senderName: 'Alice',
        text: 'Яка чудова книга! Булгаков — геній.',
        timestamp: new Date(Date.now() - 3600000),
        isOwn: false,
      },
      {
        id: 'msg-1-2',
        senderId: 'user-2',
        senderName: 'Bob',
        text: 'Згоден, образ Воланда просто неперевершений.',
        timestamp: new Date(Date.now() - 1800000),
        isOwn: true,
      },
      {
        id: 'msg-1-3',
        senderId: 'user-1',
        senderName: 'Alice',
        text: 'Хто буде вести наступне обговорення?',
        timestamp: new Date(Date.now() - 600000),
        isOwn: false,
      },
    ],
    'room-2': [
      {
        id: 'msg-2-1',
        senderId: 'user-3',
        senderName: 'Carol',
        text: 'Дюна — must read для кожного фанату sci-fi!',
        timestamp: new Date(Date.now() - 7200000),
        isOwn: false,
      },
      {
        id: 'msg-2-2',
        senderId: 'user-2',
        senderName: 'Bob',
        text: 'Читаю вже вдруге, і все одно захоплює.',
        timestamp: new Date(Date.now() - 3000000),
        isOwn: true,
      },
    ],
    'room-3': [
      {
        id: 'msg-3-1',
        senderId: 'user-4',
        senderName: 'Dave',
        text: 'Аґата Крісті залишається поза конкуренцією.',
        timestamp: new Date(Date.now() - 5400000),
        isOwn: false,
      },
      {
        id: 'msg-3-2',
        senderId: 'user-2',
        senderName: 'Bob',
        text: 'А мені подобається Стіґ Ларссон.',
        timestamp: new Date(Date.now() - 2700000),
        isOwn: true,
      },
      {
        id: 'msg-3-3',
        senderId: 'user-4',
        senderName: 'Dave',
        text: 'Теж хороший вибір! Може наступного разу прочитаємо?',
        timestamp: new Date(Date.now() - 900000),
        isOwn: false,
      },
    ],
  });

  private readonly _activeRoomId = signal<string | null>('room-1');
  private readonly _unreadCount = signal<number>(2);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _hasNewMessage = signal<boolean>(false);

  readonly rooms = this._rooms.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly activeRoomId = this._activeRoomId.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasNewMessage = this._hasNewMessage.asReadonly();

  readonly activeRoom = computed(() =>
    this._rooms().find(r => r.id === this._activeRoomId()) ?? null,
  );

  readonly activeMessages = computed(
    () => this._messages()[this._activeRoomId() ?? ''] ?? [],
  );

  constructor() {
    this.simulateIncomingMessage();
  }

  toggleOpen(): void {
    this._isOpen.update(v => !v);
    if (this._isOpen()) {
      this.markAsRead();
    }
  }

  openRoom(roomId: string): void {
    this._activeRoomId.set(roomId);
    this.markAsRead();
  }

  markAsRead(): void {
    this._unreadCount.set(0);
    this._hasNewMessage.set(false);
  }

  sendMessage(text: string, currentUser: { id: string; displayName: string }): void {
    const roomId = this._activeRoomId();
    if (!roomId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      text,
      timestamp: new Date(),
      isOwn: true,
    };

    this._messages.update(msgs => ({
      ...msgs,
      [roomId]: [...(msgs[roomId] ?? []), newMessage],
    }));
  }

  private simulateIncomingMessage(): void {
    setTimeout(() => {
      const firstRoomId = this._rooms()[0]?.id;
      if (!firstRoomId) return;

      const incoming: ChatMessage = {
        id: `msg-sim-${Date.now()}`,
        senderId: 'user-1',
        senderName: 'Alice',
        text: 'Привіт усім! Хто готовий до обговорення? 📚',
        timestamp: new Date(),
        isOwn: false,
      };

      this._messages.update(msgs => ({
        ...msgs,
        [firstRoomId]: [...(msgs[firstRoomId] ?? []), incoming],
      }));

      this._unreadCount.update(n => n + 1);
      this._hasNewMessage.set(true);
    }, 4000);
  }
}
