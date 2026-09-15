import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { takeUntil } from 'rxjs';

import { BaseComponent } from '../../../../../../core/base/base.component';
import {
  AgentService,
  AgentTelemetry,
} from '../../../../../../core/services/agent.service';
import { AgentAuthService } from '../../../../../../core/services/agent-auth.service';
import { AgentPairingDialogComponent } from './agent-pairing-dialog/agent-pairing-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

  isExecuting = false;
  isChecking = false;
  isUnpairing = false;

  constructor(
    private agentService: AgentService,
    private agentAuthService: AgentAuthService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    await this.agentAuthService.initialize();

    this.checkAgent();
  }

  /**
   * Check whether the Agent is reachable and authenticated.
   */
  checkAgent(): void {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;
    this.cdr.markForCheck();

    /*
     * Do not call telemetry until the secure Agent session exists.
     */
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
            'Script execution output from local Agent:',
            response.output,
          );

          this.isExecuting = false;
          this.cdr.markForCheck();
        },

        error: (error) => {
          console.error('CodeGraph Agent script execution failed:', error);

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

      console.log('CodeGraph Agent unpaired successfully');
    } catch (error) {
      console.error('CodeGraph Agent unpair failed:', error);
    } finally {
      this.isUnpairing = false;
      this.cdr.markForCheck();
    }
  }
}
