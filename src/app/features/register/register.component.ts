import { Component, ElementRef, OnInit, QueryList, ViewChildren, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { BaseComponent } from '../../core/base/base.component';
import { AuthService } from '../auth/services/auth.service';


type RegisterStep = 'EMAIL' | 'OTP' | 'PASSWORD';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const reenterPassword = control.get('reenterPassword');

  if (!password || !reenterPassword) return null;

  if (reenterPassword.errors && !reenterPassword.errors['passwordMismatch']) {
    return null;
  }

  if (password.value !== reenterPassword.value) {
    reenterPassword.setErrors({ passwordMismatch: true });
  } else {
    reenterPassword.setErrors(null);
  }
  return null;
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  standalone: false
})
export class RegisterComponent extends BaseComponent implements OnInit {
  override hostClass = 'app-dashboard-container';

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  private fb = inject(NonNullableFormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  currentStep: RegisterStep = 'EMAIL';
  isLoading = false;
  isResending = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  hidePassword = true;
  hideReenterPassword = true;

  // Resend OTP Countdown
  resendCountdown = 60;
  canResend = false;
  private timerSub?: Subscription;

  // Unified Multi-Step Form
  form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      otpDigits: this.fb.array(
        Array.from({ length: 6 }, () =>
          new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)])
        )
      ),
      password: ['', [Validators.required, Validators.minLength(8)]],
      reenterPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator }
  );

  get otpDigitsArray(): FormArray<FormControl<string>> {
    return this.form.get('otpDigits') as FormArray<FormControl<string>>;
  }

  get email(): string {
    return this.form.get('email')?.value || '';
  }

  ngOnInit(): void {}

  // -------------------------------------------------------------------------
  // STEP 1: SEND OTP
  // -------------------------------------------------------------------------
  onSendOtp(): void {
    const emailControl = this.form.get('email');
    if (emailControl?.invalid) {
      emailControl.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService
      .sendOtp({ email: this.email.trim() })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.currentStep = 'OTP';
          this.startResendTimer();
          setTimeout(() => this.otpInputs.first?.nativeElement.focus(), 100);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to send OTP. Please try again.';
        }
      });
  }

  // -------------------------------------------------------------------------
  // STEP 2: VERIFY OTP
  // -------------------------------------------------------------------------
  onVerifyOtp(): void {
    if (this.otpDigitsArray.invalid) {
      this.otpDigitsArray.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const otp = this.otpDigitsArray.controls.map((c) => c.value).join('');

    this.authService
      .verifyOtp({ email: this.email.trim(), otp })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          // Token is now placed in registration_token HttpOnly cookie by backend
          this.timerSub?.unsubscribe();
          this.currentStep = 'PASSWORD';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Invalid or expired OTP. Please try again.';
        }
      });
  }

  // -------------------------------------------------------------------------
  // STEP 3: SET PASSWORD
  // -------------------------------------------------------------------------
  onSetPassword(): void {
    const passwordCtrl = this.form.get('password');
    const reenterCtrl = this.form.get('reenterPassword');

    if (passwordCtrl?.invalid || reenterCtrl?.invalid) {
      passwordCtrl?.markAsTouched();
      reenterCtrl?.markAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { password, reenterPassword } = this.form.getRawValue();

    this.authService
      .setPassword({ password, reenterPassword })
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Account created successfully! Logging you in...';
          localStorage.setItem('is_authenticated', 'true');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1200);
        },
        error: (err) => {
          this.errorMessage =
            err.error?.message || 'Failed to set password. Token might be expired, please restart.';
        }
      });
  }

  // -------------------------------------------------------------------------
  // OTP INPUT HELPERS
  // -------------------------------------------------------------------------
  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.value && index < 5) {
      this.otpInputs.toArray()[index + 1]?.nativeElement.focus();
    }
  }

  onDigitKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.otpInputs.toArray()[index - 1]?.nativeElement.focus();
    }
  }

  onDigitPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text').trim() || '';
    if (/^\d{6}$/.test(pasted)) {
      pasted.split('').forEach((char, idx) => {
        this.otpDigitsArray.at(idx).setValue(char);
      });
      this.otpInputs.last?.nativeElement.focus();
    }
  }

  startResendTimer(): void {
    this.canResend = false;
    this.resendCountdown = 60;
    this.timerSub?.unsubscribe();

    this.timerSub = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.resendCountdown > 1) {
          this.resendCountdown--;
        } else {
          this.canResend = true;
          this.timerSub?.unsubscribe();
        }
      });
  }

  onResendOtp(): void {
    if (!this.canResend || this.isResending) return;

    this.isResending = true;
    this.errorMessage = null;

    this.authService
      .sendOtp({ email: this.email.trim() })
      .pipe(
        finalize(() => {
          this.isResending = false;
        })
      )
      .subscribe({
        next: () => {
          this.successMessage = 'A fresh verification code was sent to your email.';
          this.startResendTimer();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to resend verification code.';
        }
      });
  }

  onBackToEmail(): void {
    this.currentStep = 'EMAIL';
    this.errorMessage = null;
    this.successMessage = null;
    this.otpDigitsArray.reset();
  }
}