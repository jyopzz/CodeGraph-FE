import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../core/base/base.component';
import { AgentConfiguration } from './components/agent-list/service/agent-list.service';
import { AgentListComponent } from './components/agent-list/agent-list.component';

export interface FavoriteItem {
  id: string;
  name: string;
  route: string;
  icon: string;
  type: 'cluster' | 'graph' | 'settings' | 'report';
}

export interface KpiMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export interface NodeClusterHealth {
  cluster: string;
  nodesCount: number;
  status: 'Healthy' | 'Degraded' | 'Syncing';
  latency: string;
}

export interface SystemEvent {
  timestamp: string;
  action: string;
  target: string;
  severity: 'info' | 'warn' | 'success';
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
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
  standalone: false,
})
export class OverviewComponent extends BaseComponent {
  override hostClass = 'app-overview-container';

  @ViewChild(AgentListComponent)
  private agentList?: AgentListComponent;

  constructor(private router: Router) {
    super();
  }

  selectedAgent: AgentConfiguration | null = null;

  onAgentSelected(agent: AgentConfiguration | null): void {
    this.selectedAgent = agent;
  }

  onCreateAgentRequested(): void {
    this.selectedAgent = null;
    this.agentList?.clearSelection();
  }

  onAgentSaved(agent: AgentConfiguration): void {
    this.selectedAgent = agent;
    this.agentList?.loadAgents();
  }

  // Pinned Favorites State
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

  clusters: NodeClusterHealth[] = [
    {
      cluster: 'us-east-core-ast',
      nodesCount: 1840,
      status: 'Healthy',
      latency: '24ms',
    },
    {
      cluster: 'eu-west-dependency-tree',
      nodesCount: 1420,
      status: 'Healthy',
      latency: '38ms',
    },
    {
      cluster: 'ap-south-parser-cache',
      nodesCount: 932,
      status: 'Syncing',
      latency: '72ms',
    },
    {
      cluster: 'edge-runtime-indexer',
      nodesCount: 700,
      status: 'Degraded',
      latency: '140ms',
    },
  ];

  recentEvents: SystemEvent[] = [
    {
      timestamp: '2 mins ago',
      action: 'AST Cache Purge',
      target: 'core/auth-service',
      severity: 'info',
    },
    {
      timestamp: '14 mins ago',
      action: 'Circular Ref Resolved',
      target: 'features/dashboard -> core/base',
      severity: 'success',
    },
    {
      timestamp: '42 mins ago',
      action: 'Memory Limit Throttle',
      target: 'indexer-worker-03',
      severity: 'warn',
    },
    {
      timestamp: '1 hour ago',
      action: 'Batch Ingestion Complete',
      target: '64 new module manifests',
      severity: 'success',
    },
  ];

  // Favorite Handlers
  onNavigateFavorite(fav: FavoriteItem): void {
    this.router.navigateByUrl(fav.route);
  }

  onToggleFavorite(event: MouseEvent, favoriteId: string): void {
    event.stopPropagation(); // Prevents card navigation trigger
    this.favorites = this.favorites.filter((item) => item.id !== favoriteId);
  }

  onManageFavorites(): void {
    console.log('Open Manage Favorites dialog/drawer');
  }

  onQuickAction(actionId: string): void {
    switch (actionId) {
      case 'create_project':
        console.log('Open Create Project Dialog/Modal');
        break;
      case 'ingest_repo':
        console.log('Open Repo Ingestion Drawer');
        break;
      case 'trigger_scan':
        console.log('Initiating AST dependency scan...');
        break;
      case 'purge_cache':
        console.log('Invalidating AST memory cache...');
        break;
    }
  }
}
