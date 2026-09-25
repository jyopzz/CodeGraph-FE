import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  QueryList,
  ViewChildren,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AgentAuthService } from '../../../../../../../core/services/agent-auth.service';
import { NotificationService } from '../../../../../../../core/services/notifications/notification.service';
import { AgentConfiguration } from '../../agent-list/service/agent-list.service';

export interface AgentPairingDialogData {
  agent: AgentConfiguration | null;
}

@Component({
  selector: 'app-agent-pairing-dialog',
  templateUrl: './agent-pairing-dialog.component.html',
  styleUrl: './agent-pairing-dialog.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentPairingDialogComponent {
  private readonly dialogRef = inject(
    MatDialogRef<AgentPairingDialogComponent>,
  );

  private readonly agentAuthService = inject(AgentAuthService);

  private readonly notificationService = inject(
    NotificationService,
  );

  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChildren('otpInput')
  private readonly otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  otpDigits: string[] = ['', '', '', '', '', ''];
  isPairing = false;
  errorMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: AgentPairingDialogData,
  ) {}

  get selectedAgent(): AgentConfiguration | null {
    return this.data?.agent ?? null;
  }

  get pairingCode(): string {
    return this.otpDigits.join('');
  }

  trackByIndex(index: number): number {
    return index;
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');

    if (!digitsOnly) {
      this.otpDigits[index] = '';
      input.value = '';
      return;
    }

    if (digitsOnly.length > 1) {
      this.fillFromIndex(digitsOnly, index);
      return;
    }

    this.otpDigits[index] = digitsOnly;
    input.value = digitsOnly;
    this.errorMessage = '';
    this.cdr.markForCheck();

    if (index < this.otpDigits.length - 1) {
      this.focusOtpInput(index + 1);
    } else if (this.pairingCode.length === 6) {
      this.pair();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      if (this.otpDigits[index] || input.value) {
        this.otpDigits[index] = '';
        input.value = '';
        this.cdr.markForCheck();
        return;
      }

      if (index > 0) {
        event.preventDefault();
        this.otpDigits[index - 1] = '';
        this.focusOtpInput(index - 1);
        this.cdr.markForCheck();
      }

      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusOtpInput(index - 1);
      return;
    }

    if (
      event.key === 'ArrowRight' &&
      index < this.otpDigits.length - 1
    ) {
      event.preventDefault();
      this.focusOtpInput(index + 1);
      return;
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '');

    if (!digits) {
      return;
    }

    this.fillFromIndex(digits, 0);
  }

  onOtpFocus(index: number): void {
    setTimeout(() => {
      this.otpInputs?.get(index)?.nativeElement.select();
    }, 0);
  }

  private fillFromIndex(
    digits: string,
    startIndex: number,
  ): void {
    const chars = digits.split('');
    let cur = startIndex;

    while (cur < 6 && chars.length > 0) {
      this.otpDigits[cur] = chars.shift()!;

      const el = this.otpInputs?.get(cur)?.nativeElement;

      if (el) {
        el.value = this.otpDigits[cur];
      }

      cur++;
    }

    this.errorMessage = '';
    this.cdr.markForCheck();

    const nextFocus = Math.min(cur, 5);
    this.focusOtpInput(nextFocus);

    if (this.pairingCode.length === 6) {
      this.pair();
    }
  }

  private focusOtpInput(index: number): void {
    requestAnimationFrame(() => {
      const target = this.otpInputs?.get(index)?.nativeElement;

      if (target) {
        target.focus();
        target.select();
      }
    });
  }

  async pair(): Promise<void> {
    if (
      this.pairingCode.length !== 6 ||
      this.isPairing
    ) {
      return;
    }

    this.isPairing = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      await this.agentAuthService.connect(this.pairingCode);

      this.notificationService.success(
        'Agent connected successfully.',
      );

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Agent pairing failed:', error);

      this.isPairing = false;

      const message =
        error?.error?.error ||
        error?.error?.message ||
        'Pairing failed. Please check the code and try again.';

      // Show global top-right notification
      this.notificationService.error(message);

      // Keep the inline dialog error as well
      this.errorMessage = message;

      // Reset digits so user can re-enter immediately
      this.otpDigits = ['', '', '', '', '', ''];

      this.cdr.detectChanges();
      this.focusOtpInput(0);
    } finally {
      this.isPairing = false;
      this.cdr.markForCheck();
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}