import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { Observable } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../../core/base/base.component';
import { DashboardUiService } from './services/dashboard-ui.service';

export interface DashboardNavItem {
  label: string;
  icon: string;
  route?: string;
  exact?: boolean;
  children?: { label: string; icon: string; route: string; exact?: boolean }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  standalone: false,
})
export class DashboardComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-dashboard-container';

  @ViewChild('dashboardSidenav') sidenav!: MatSidenav;

  private breakpointObserver = inject(BreakpointObserver);
  private dashboardUiService = inject(DashboardUiService);

  readonly isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset])
    .pipe(
      map((result) => result.matches),
      shareReplay(1),
    );

  navItems: DashboardNavItem[] = [
    { label: 'Overview', icon: 'grid_view', route: '/dashboard', exact: true },

    // Dropdown for User / Team Management
    {
      label: 'User',
      icon: 'group',
      children: [
        { label: 'Profile', icon: 'person', route: '/dashboard/user/profile' },
      ],
    },

    // Standard items
    { label: 'System Settings', icon: 'tune', route: '/dashboard/settings' },
  ];

  ngOnInit(): void {
    this.dashboardUiService.toggleSidebar$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.sidenav) {
          this.sidenav.toggle();
        }
      });
  }

  onLinkClick(isHandset: boolean): void {
    if (isHandset && this.sidenav) {
      this.sidenav.close();
    }
  }

  // ngOnDestroy is handled automatically by BaseComponent.
  // If you ever need child-specific cleanup here, remember to call super.ngOnDestroy():
  // override ngOnDestroy(): void {
  //   super.ngOnDestroy();
  // }
}
