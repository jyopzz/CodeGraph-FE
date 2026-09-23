import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import {
  AgentConfiguration,
  AgentListService,
} from '../agent-list/service/agent-list.service';

import { BaseComponent } from '../../../../../../core/base/base.component';
import { takeUntil } from 'rxjs';

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

  @Output() createRequested = new EventEmitter<void>();

  readonly agentForm = new FormGroup({
    agentId: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^CG-[A-Za-z0-9]+$/),
      ],
    }),

    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    host: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    protocol: new FormControl('HTTPS', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    port: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1024),
      Validators.max(65535),
    ]),
  });

  isCreating = false;
  isSaving = false;
  saveError = false;

  constructor(
    private readonly agentListService: AgentListService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    super();
  }

  get hasAgent(): boolean {
    return !!this.agent;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['agent']) {
      return;
    }

    if (!this.agent && this.isCreating) {
      this.cdr.markForCheck();
      return;
    }

    this.isCreating = false;
    this.isSaving = false;
    this.saveError = false;

    this.agentForm.reset({
      agentId: this.agent?.agentId ?? '',
      name: this.agent?.name ?? '',
      host: this.agent?.host ?? '',
      protocol: this.agent?.protocol ?? 'HTTPS',
      port: this.agent?.port ?? null,
    });

    this.agentForm.markAsPristine();

    if (this.agent) {
      this.agentForm.get('agentId')?.disable();
    } else {
      this.agentForm.get('agentId')?.enable();
    }

    this.cdr.markForCheck();
  }

  startNewAgent(): void {
    this.isCreating = true;
    this.isSaving = false;
    this.saveError = false;

    this.agentForm.reset({
      agentId: 'CG-',
      name: '',
      host: '127.0.0.1',
      protocol: 'HTTPS',
      port: 1024,
    });

    this.agentForm.get('agentId')?.enable();

    this.agentForm.markAsPristine();
    this.createRequested.emit();
    this.cdr.markForCheck();
  }

  saveAgent(): void {
    if (this.agentForm.invalid || this.isSaving) {
      this.agentForm.markAllAsTouched();
      return;
    }

    const formValue = this.agentForm.getRawValue();

    const request: AgentConfiguration = {
      agentId: formValue.agentId,
      name: formValue.name,
      host: formValue.host,
      protocol: formValue.protocol,
      port: formValue.port ?? undefined,
    };

    this.isSaving = true;
    this.saveError = false;

    const request$ =
      this.isCreating || !this.agent?.agentId
        ? this.agentListService.createAgent(request)
        : this.agentListService.updateAgent(this.agent.agentId, request);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (!response.successful || !response.data) {
          this.isSaving = false;
          this.saveError = true;
          this.cdr.markForCheck();
          return;
        }

        this.isSaving = false;
        this.isCreating = false;

        this.agentForm.patchValue({
          agentId: response.data.agentId ?? '',
          name: response.data.name ?? '',
          host: response.data.host ?? '',
          protocol: response.data.protocol ?? 'HTTPS',
          port: response.data.port ?? null,
        });

        this.agentForm.get('agentId')?.disable();
        this.agentForm.markAsPristine();

        this.agent = response.data;

        this.agentSaved.emit(response.data);

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to save agent configuration:', error);

        this.isSaving = false;
        this.saveError = true;

        this.cdr.markForCheck();
      },
    });
  }
}
