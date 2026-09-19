import { Component, EventEmitter, HostBinding, Input, Output, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { BaseComponent } from '../../base/base.component';
import { ThemeService, ThemePreference } from '../../services/theme.service';
import { DashboardUiService } from '../../../features/dashboard/services/dashboard-ui.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  icon?: string;
  type?: 'info' | 'alert' | 'success';
  route?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  standalone: false
})
export class NavbarComponent extends BaseComponent {
  override hostClass = 'app-navbar-container';

  @HostBinding('class.mat-elevation-z4') hasElevation = true;

  @Input() isHandset = false;
  @Output() toggleMenu = new EventEmitter<void>();

  private themeService = inject(ThemeService);
  private dashboardUiService = inject(DashboardUiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Observable streams for template rendering
  isDarkMode$ = this.themeService.isDarkMode$;
  themePreference$ = this.themeService.preference$;
  currentUser$ = this.authService.currentUser$;

  isDashboardRoute$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map(event => event.urlAfterRedirects.startsWith('/dashboard')),
    startWith(this.router.url.startsWith('/dashboard'))
  );

  /** Selects explicit preference from a MatMenu ('system' | 'light' | 'dark') */
  onSetTheme(preference: ThemePreference): void {
    this.themeService.setPreference(preference);
  }

  /** Quick cycle: system -> dark -> light -> system */
  onCycleTheme(): void {
    this.themeService.cycleTheme();
  }

  onMenuClick(): void {
    this.toggleMenu.emit();
  }

  onToggleDashboardSidebar(): void {
    this.dashboardUiService.triggerToggleSidebar();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/home']);
      }
    });
  }

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([
  {
    id: '1',
    title: 'Pipeline Passed',
    message: 'CI workflow #418 completed successfully.',
    read: false,
    createdAt: new Date(),
    icon: 'check_circle',
    type: 'success'
  },
  {
    id: '2',
    title: 'Review Required',
    message: 'New branch submitted by Sarah.',
    read: false,
    createdAt: new Date(Date.now() - 3600000),
    icon: 'rule',
    type: 'alert'
  }
]);

notifications$ = this.notificationsSubject.asObservable();
unreadNotificationsCount$ = this.notifications$.pipe(
  map(list => list.filter(n => !n.read).length)
);

onMarkAllNotificationsRead(): void {
  const updated = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
  this.notificationsSubject.next(updated);
}

onSelectNotification(item: AppNotification): void {
  const updated = this.notificationsSubject.value.map(n => 
    n.id === item.id ? { ...n, read: true } : n
  );
  this.notificationsSubject.next(updated);

  if (item.route) {
    this.router.navigate([item.route]);
  }
}
}