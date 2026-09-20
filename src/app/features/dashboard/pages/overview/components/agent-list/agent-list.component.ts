import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { takeUntil } from 'rxjs';

import { BaseComponent } from '../../../../../../core/base/base.component';
import {
  AgentConfiguration,
  AgentListService,
} from './service/agent-list.service';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrl: './agent-list.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentListComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-agent-list-container';

  agents: AgentConfiguration[] = [];
  isLoading = false;
  hasError = false;

  constructor(
    private readonly agentListService: AgentListService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.agentListService
      .getAgentConfigurations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.agents = response.data ?? [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error(
            'Failed to load agent configurations:',
            error,
          );

          this.agents = [];
          this.isLoading = false;
          this.hasError = true;
          this.cdr.markForCheck();
        },
      });
  }
}