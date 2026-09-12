import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntil } from 'rxjs';
import { BaseComponent } from '../../../../../../core/base/base.component';
import { WindowsAgentStatus, WindowsBridgeService } from './services/windows-bridge.service';



@Component({
  selector: 'app-system-info',
  templateUrl: './system-info.component.html',
  styleUrl: './system-info.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemInfoComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-system-info-container';

  agentStatus!: WindowsAgentStatus;
  isExecuting = false;

  constructor(
    private bridgeService: WindowsBridgeService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.bridgeService.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.agentStatus = status;
        this.cdr.markForCheck();
      });

    // Start polling the local Windows application
    this.bridgeService.startHealthCheck(4000*10)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onManualCheck(): void {
    this.bridgeService.pingAgent().pipe(takeUntil(this.destroy$)).subscribe();
  }

  onRunScript(): void {
    if (!this.agentStatus.connected || !this.agentStatus.codeGraph.installed) return;

    this.isExecuting = true;
    this.cdr.markForCheck();

    this.bridgeService.executeCodeGraphCommand('codegraph --scan-ast', ['--strict', '--json'])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (output) => {
          console.log('Script execution output from local agent:', output);
          this.isExecuting = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Execution failed:', err);
          this.isExecuting = false;
          this.cdr.markForCheck();
        }
      });
  }
}