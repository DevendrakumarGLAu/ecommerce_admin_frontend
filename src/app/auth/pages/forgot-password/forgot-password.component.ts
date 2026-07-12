import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { mustMatchValidator } from '../../../shared/utils/validators.util';

type Step = 'email' | 'otp' | 'password' | 'done';

/**
 * Three-step OTP forgot-password flow, entirely on this one page — no email
 * link/query-param to follow, since the backend delivers a 6-digit code
 * (via Gmail SMTP) instead of a reset link.
 *
 *   1. Enter email          -> POST /auth/forgot-password  (emails a 6-digit OTP)
 *   2. Enter the OTP        -> POST /auth/verify-otp        (returns a reset_token)
 *   3. Enter a new password -> POST /auth/reset-password    (consumes the reset_token)
 */
@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FormErrorComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly step = signal<Step>('email');
  readonly submitting = signal(false);
  readonly hidePassword = signal(true);

  /** Only ever set when the backend's OTP_DEBUG_MODE is on — a dev/testing convenience. */
  readonly debugOtp = signal<string | null>(null);

  private email = '';
  private resetToken = '';

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  readonly otpForm = this.fb.nonNullable.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: mustMatchValidator('newPassword', 'confirmPassword') }
  );

  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.email = this.emailForm.getRawValue().email;
    this.submitting.set(true);
    this.authService.forgotPassword(this.email).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.debugOtp.set(result.otp);
        this.notifications.success(`A 6-digit code was sent to ${this.email}.`);
        this.step.set('otp');
      },
      error: () => this.submitting.set(false)
    });
  }

  submitOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService.verifyOtp(this.email, this.otpForm.getRawValue().otp).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.resetToken = result.reset_token;
        this.step.set('password');
      },
      error: () => this.submitting.set(false)
    });
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.authService.resetPasswordWithOtp(this.email, this.resetToken, this.passwordForm.getRawValue().newPassword).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set('done');
      },
      error: () => this.submitting.set(false)
    });
  }

  /** Lets the user request a fresh code without re-typing the email. */
  resendOtp(): void {
    this.otpForm.reset();
    this.submitEmail();
  }

  backToEmail(): void {
    this.step.set('email');
    this.otpForm.reset();
  }

  goToLogin(): void {
    void this.router.navigate(['/auth/login']);
  }
}
