import {
  Component,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AgentAuthService } from '../../../../../../../core/services/agent-auth.service';


@Component({
  selector: 'app-agent-pairing-dialog',
  templateUrl: './agent-pairing-dialog.component.html',
  styleUrl: './agent-pairing-dialog.component.scss',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentPairingDialogComponent {

  private readonly dialogRef =
    inject(MatDialogRef<AgentPairingDialogComponent>);

  private readonly agentAuthService =
    inject(AgentAuthService);

  pairingCode = '';
  isPairing = false;
  errorMessage = '';

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.pairingCode = input.value
      .replace(/\D/g, '')
      .slice(0, 6);

    this.errorMessage = '';
  }

  async pair(): Promise<void> {
    if (this.pairingCode.length !== 6 || this.isPairing) {
      return;
    }

    this.isPairing = true;
    this.errorMessage = '';

    try {
      await this.agentAuthService.connect(this.pairingCode);

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Agent pairing failed:', error);

      this.errorMessage =
        error?.error?.error ||
        error?.error?.message ||
        'Pairing failed. Please verify the code and try again.';
    } finally {
      this.isPairing = false;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}