import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { AgentConfiguration } from '../agent-list/service/agent-list.service';
import { BaseComponent } from '../../../../../../core/base/base.component';

@Component({
  selector: 'app-agent-details',
  templateUrl: './agent-details.component.html',
  styleUrl: './agent-details.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentDetailsComponent extends BaseComponent implements OnChanges {
  override hostClass = 'app-agent-details-container';
  @Input() agent: AgentConfiguration | null = null;
  @Output() agentSaved = new EventEmitter<AgentConfiguration>();

  readonly agentForm = new FormGroup({
    agentId: new FormControl(''),
    name: new FormControl(''),
    host: new FormControl(''),
    protocol: new FormControl(''),
    port: new FormControl<number | null>(null),
  });

  isCreating = false;

  get hasAgent(): boolean {
    return !!this.agent;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agent']) {
      this.isCreating = false;
      this.agentForm.reset({
        agentId: this.agent?.agentId || '',
        name: this.agent?.name || '',
        host: this.agent?.host || '',
        protocol: this.agent?.protocol || '',
        port: this.agent?.port ?? null,
      });
    }
  }

  startNewAgent(): void {
    this.isCreating = true;
    this.agentForm.reset({
      agentId: '',
      name: '',
      host: '',
      protocol: '',
      port: null,
    });
  }

  saveAgent(): void {
    const formValue = this.agentForm.getRawValue();

    this.agentSaved.emit({
      agentId: formValue.agentId || undefined,
      name: formValue.name || undefined,
      host: formValue.host || undefined,
      protocol: formValue.protocol || undefined,
      port: formValue.port ?? undefined,
    });
  }
}