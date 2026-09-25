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
import { ConfirmDialogComponent } from '../../../../../../core/components/confirm-dialog/confirm-dialog.component';

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
  private readonly selectedAgentStorageKey = 'codgraph.selectedAgentId';

  agentStatus: AgentTelemetry | null = null;

  agents: AgentConfiguration[] = [];
  selectedAgentId: string | null = null;

  isExecuting = false;
  isChecking = false;
  isUnpairing = false;

  get isAgentPaired(): boolean {
    return this.agentAuthService.isAuthenticated();
  }

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
    this.selectedAgentId = localStorage.getItem(this.selectedAgentStorageKey);
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

          this.persistSelectedAgent();

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
    this.persistSelectedAgent();
  }

  private persistSelectedAgent(): void {
    if (this.selectedAgentId) {
      localStorage.setItem(this.selectedAgentStorageKey, this.selectedAgentId);
    } else {
      localStorage.removeItem(this.selectedAgentStorageKey);
    }
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
          console.log('ATS scan output from local Agent:', response.output);

          this.isExecuting = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('CodeGraph Agent ATS scan failed:', error);

          this.isExecuting = false;
          this.cdr.markForCheck();
        },
      });
  }

  openPairingDialog(): void {
    const selectedAgent =
      this.agents.find((agent) => agent.agentId === this.selectedAgentId) ??
      null;

    const dialogRef = this.dialog.open(AgentPairingDialogComponent, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      disableClose: true,
      data: {
        agent: selectedAgent,
      },
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

  onUnpair(): void {
    if (this.isUnpairing) {
      return;
    }

    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        panelClass: 'confirm-dialog-panel',
        data: {
          title: 'Unpair CodeGraph Agent?',
          message: 'Are you sure you want to unpair the CodeGraph Agent? You can pair it again later.',
          confirmText: 'Unpair',
          confirmColor: 'warn',
        },
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          void this.unpairAgent();
        }
      });
  }

  private async unpairAgent(): Promise<void> {
    if (this.isUnpairing) {
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
