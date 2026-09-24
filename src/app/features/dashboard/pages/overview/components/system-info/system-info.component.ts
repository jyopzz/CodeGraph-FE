import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs';

import { BaseComponent } from '../../../../../../core/base/base.component';
import {
  AgentService,
  AgentTelemetry,
} from '../../../../../../core/services/agent.service';
import { AgentAuthService } from '../../../../../../core/services/agent-auth.service';

import { AgentPairingDialogComponent } from './agent-pairing-dialog/agent-pairing-dialog.component';
import {
  AgentConfiguration,
  AgentListService,
} from '../agent-list/service/agent-list.service';

@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrl: './system-info.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemInfoComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-system-info-container';

  agentStatus: AgentTelemetry | null = null;

  agents: AgentConfiguration[] = [];
  selectedAgentId: string | null = null;

  isExecuting = false;
  isChecking = false;
  isUnpairing = false;

  constructor(
    private agentService: AgentService,
    private agentAuthService: AgentAuthService,
    private agentListService: AgentListService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    await this.agentAuthService.initialize();

    this.loadAgents();
    this.checkAgent();
  }

  private loadAgents(): void {
    this.agentListService
      .getAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (agents) => {
          this.agents = agents;

          const selectedAgentExists = this.agents.some(
            (agent) => agent.agentId === this.selectedAgentId,
          );

          if (!selectedAgentExists) {
            this.selectedAgentId = this.agents[0]?.agentId ?? null;
          }

          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load Agents:', error);

          this.agents = [];
          this.selectedAgentId = null;

          this.cdr.markForCheck();
        },
      });
  }

  onAgentChange(agentId: string): void {
    this.selectedAgentId = agentId;
  }

  checkAgent(): void {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;
    this.cdr.markForCheck();

    if (!this.agentAuthService.isAuthenticated()) {
      this.agentStatus = null;
      this.isChecking = false;
      this.cdr.markForCheck();
      return;
    }

    this.agentService
      .getTelemetry()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (status) => {
          this.agentStatus = status;
          this.isChecking = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('CodeGraph Agent health check failed:', error);

          this.agentStatus = null;
          this.isChecking = false;
          this.cdr.markForCheck();
        },
      });
  }

  onManualCheck(): void {
    this.checkAgent();
  }

  onRunScript(): void {
    if (
      !this.selectedAgentId ||
      !this.agentStatus?.codeGraph.installed ||
      this.isExecuting ||
      !this.agentAuthService.isAuthenticated()
    ) {
      return;
    }

    this.isExecuting = true;
    this.cdr.markForCheck();

    this.agentService
      .runScript('codegraph', ['--scan-ast', '--strict', '--json'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log(
            'ATS scan output from local Agent:',
            response.output,
          );

          this.isExecuting = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error(
            'CodeGraph Agent ATS scan failed:',
            error,
          );

          this.isExecuting = false;
          this.cdr.markForCheck();
        },
      });
  }

  openPairingDialog(): void {
    const dialogRef = this.dialog.open(AgentPairingDialogComponent, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((paired) => {
        if (paired) {
          this.loadAgents();
          this.checkAgent();
        }
      });
  }

  async onUnpair(): Promise<void> {
    if (this.isUnpairing) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to unpair the CodeGraph Agent?',
    );

    if (!confirmed) {
      return;
    }

    this.isUnpairing = true;
    this.cdr.markForCheck();

    try {
      await this.agentAuthService.unpair();

      this.agentStatus = null;
      this.selectedAgentId = null;

      this.loadAgents();

      console.log('CodeGraph Agent unpaired successfully');
    } catch (error) {
      console.error('CodeGraph Agent unpair failed:', error);
    } finally {
      this.isUnpairing = false;
      this.cdr.markForCheck();
    }
  }
}