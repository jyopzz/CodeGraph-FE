import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../../core/base/base.component';
import { AgentConfiguration } from './components/agent-list/service/agent-list.service';
import { AgentListComponent } from './components/agent-list/agent-list.component';



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





}
