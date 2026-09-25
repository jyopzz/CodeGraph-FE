import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'error' | 'success' | 'warning' | 'info';

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private notificationId = 0;

  error(message: string, duration = 5000): void {
    this.show('error', message, duration);
  }

  success(message: string, duration = 3000): void {
    this.show('success', message, duration);
  }

  warning(message: string, duration = 4000): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration = 4000): void {
    this.show('info', message, duration);
  }

  private show(
    type: NotificationType,
    message: string,
    duration: number,
  ): void {
    const notification: Notification = {
      id: ++this.notificationId,
      type,
      message,
      duration,
    };

    this.notificationsSubject.next([
      ...this.notificationsSubject.value,
      notification,
    ]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  remove(id: number): void {
    this.notificationsSubject.next(
      this.notificationsSubject.value.filter(
        notification => notification.id !== id,
      ),
    );
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}