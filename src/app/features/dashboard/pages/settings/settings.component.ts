import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '../../../../core/base/base.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  standalone: false
})
export class SettingsComponent extends BaseComponent {
  override hostClass = 'app-settings-container';

  private fb = inject(FormBuilder);

  settingsForm: FormGroup = this.fb.group({
    // AST & Graph Ingestion Controls
    enableLiveIndexing: [true],
    strictCircularDetection: [true],
    parseTestFiles: [false],
    maxNodeDepth: [6],

    // Performance & Execution Budgets
    workerPoolSize: [4],
    memoryLimitMb: [2048],
    telemetryRefreshSec: [10],

    // Security & Export Guardrails
    enablePublicSharing: [false],
    exportMasking: [true]
  });

  onSave(): void {
    if (this.settingsForm.valid) {
      console.log('Saved system settings configuration:', this.settingsForm.value);
    }
  }

  onResetDefaults(): void {
    this.settingsForm.reset({
      enableLiveIndexing: true,
      strictCircularDetection: true,
      parseTestFiles: false,
      maxNodeDepth: 6,
      workerPoolSize: 4,
      memoryLimitMb: 2048,
      telemetryRefreshSec: 10,
      enablePublicSharing: false,
      exportMasking: true
    });
  }
}