// src/app/features/dashboard/services/dashboard-ui.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardUiService {
  private toggleSidebarSource = new Subject<void>();
  readonly toggleSidebar$ = this.toggleSidebarSource.asObservable();

  triggerToggleSidebar(): void {
    this.toggleSidebarSource.next();
  }
}