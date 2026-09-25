import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification,NotificationService } from './notification.service';


@Component({
  selector: 'app-notification-container',
  templateUrl: './notification-container.component.html',
  styleUrl: './notification-container.component.scss',
  standalone: false,
})
export class NotificationContainerComponent {
  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  close(id: number): void {
    this.notificationService.remove(id);
  }

  trackById(_: number, notification: Notification): number {
    return notification.id;
  }
}