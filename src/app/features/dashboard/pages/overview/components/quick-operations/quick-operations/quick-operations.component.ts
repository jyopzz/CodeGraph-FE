import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../../../../core/base/base.component';

export interface FavoriteItem {
  id: string;
  name: string;
  route: string;
  icon: string;
  type: 'cluster' | 'graph' | 'settings' | 'report';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  variant: 'flat' | 'stroked' | 'icon';
  tooltip?: string;
}

@Component({
  selector: 'app-quick-operations',
  templateUrl: './quick-operations.component.html',
  styleUrl: './quick-operations.component.scss',
  standalone: false,
})
export class QuickOperationsComponent extends BaseComponent {
  override hostClass = 'app-quick-operations-container';

  constructor(private router: Router) {
    super();
  }

  quickActions: QuickAction[] = [
    {
      id: 'create_project',
      label: 'Create Project',
      icon: 'add',
      color: 'primary',
      variant: 'flat',
    },
    {
      id: 'ingest_repo',
      label: 'Ingest Repository',
      icon: 'source',
      color: 'accent',
      variant: 'stroked',
    },
    {
      id: 'trigger_scan',
      label: 'Scan Graph',
      icon: 'radar',
      variant: 'icon',
      tooltip: 'Trigger Graph Scan',
    },
    {
      id: 'purge_cache',
      label: 'Purge Cache',
      icon: 'cached',
      variant: 'icon',
      tooltip: 'Invalidate Cache',
    },
  ];

  favorites: FavoriteItem[] = [
    {
      id: 'fav_1',
      name: 'AST Core Partition',
      route: '/dashboard/clusters/us-east-core-ast',
      icon: 'hub',
      type: 'cluster',
    },
    {
      id: 'fav_2',
      name: 'Interactive Dependency Graph',
      route: '/dashboard/graph',
      icon: 'schema',
      type: 'graph',
    },
    {
      id: 'fav_3',
      name: 'Compiler Flag Rules',
      route: '/dashboard/settings',
      icon: 'tune',
      type: 'settings',
    },
    {
      id: 'fav_4',
      name: 'Latency SLA Report',
      route: '/dashboard/reports/sla',
      icon: 'analytics',
      type: 'report',
    },
  ];

  onNavigateFavorite(favorite: FavoriteItem): void {
    this.router.navigateByUrl(favorite.route);
  }

  onToggleFavorite(
    event: MouseEvent,
    favoriteId: string,
  ): void {
    event.stopPropagation();

    this.favorites = this.favorites.filter(
      (favorite) => favorite.id !== favoriteId,
    );
  }

  onManageFavorites(): void {
    console.log('Open Manage Favorites dialog/drawer');
  }

  onQuickAction(actionId: string): void {
    switch (actionId) {
      case 'create_project':
        console.log('Create Project');
        break;

      case 'ingest_repo':
        console.log('Ingest Repository');
        break;

      case 'trigger_scan':
        console.log('Trigger Graph Scan');
        break;

      case 'purge_cache':
        console.log('Purge Cache');
        break;
    }
  }
}