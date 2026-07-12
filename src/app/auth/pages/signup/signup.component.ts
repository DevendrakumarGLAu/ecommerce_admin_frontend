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

/**
 * Creates a new admin-role account via `POST /auth/register-admin` and logs
 * the caller in immediately. There is no invite/approval step — anyone who
 * can reach this screen can create an admin account.
 */
@Component({
  selector: 'app-signup',
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
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly hidePassword = signal(true);

  readonly form = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: mustMatchValidator('password', 'confirmPassword') }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, phone, password } = this.form.getRawValue();

    this.submitting.set(true);
    this.authService
      .registerAdmin({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        password
      })
      .subscribe({
        next: () => {
          this.authService.loadCurrentUser().subscribe({
            next: (user) => {
              this.submitting.set(false);
              this.notifications.success(`Welcome, ${user.first_name}! Your admin account is ready.`);
              void this.router.navigateByUrl('/dashboard');
            },
            error: () => this.submitting.set(false)
          });
        },
        error: () => this.submitting.set(false)
      });
  }
}
